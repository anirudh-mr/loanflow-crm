"""Call management service."""

import uuid
from datetime import date, datetime, timezone
from typing import Any, Dict, List, Optional, Tuple
from sqlalchemy import desc, func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.call_log import CallLog, CallOutcome
from app.models.daily_target import DailyTarget
from app.models.employee import Employee
from app.models.follow_up import FollowUp, FollowUpStatus
from app.models.lead import Lead, LeadStatus
from app.schemas.call_log import CallLogCreate


async def create_call_log(
    db: AsyncSession, data: CallLogCreate, employee: Employee
) -> Dict[str, Any]:
    """Record customer call, update lead status, target progress, and create follow-up if needed."""
    # Validate lead and assignment
    lead_res = await db.execute(select(Lead).where(Lead.id == data.lead_id))
    lead = lead_res.scalars().first()
    if not lead:
        raise ValueError("Lead not found")

    if lead.assigned_employee_id != employee.id:
        raise PermissionError("You can only log calls for leads assigned to you")

    now = datetime.now(timezone.utc)
    outcome_str = data.outcome.lower().replace(" ", "_")

    # Create call log
    call_log = CallLog(
        lead_id=data.lead_id,
        employee_id=employee.id,
        call_datetime=now,
        duration_seconds=data.duration_seconds,
        outcome=outcome_str,
        remarks=data.remarks,
        next_follow_up_date=data.next_follow_up_date,
    )
    db.add(call_log)

    # Update lead's last_contact_date
    lead.last_contact_date = now

    # Map call outcome to lead status
    if outcome_str == "interested":
        lead.status = LeadStatus.INTERESTED
    elif outcome_str == "not_interested":
        lead.status = LeadStatus.NOT_INTERESTED
    elif outcome_str in ("follow_up_required", "call_back_later"):
        lead.status = LeadStatus.FOLLOW_UP_REQUIRED
    elif lead.status in (LeadStatus.NEW, LeadStatus.ASSIGNED):
        lead.status = LeadStatus.CONTACTED

    # Create follow up if date provided or outcome requires it
    if data.next_follow_up_date:
        follow_up = FollowUp(
            lead_id=lead.id,
            employee_id=employee.id,
            scheduled_date=data.next_follow_up_date.date() if isinstance(data.next_follow_up_date, datetime) else data.next_follow_up_date,
            status=FollowUpStatus.PENDING,
            remarks=f"Scheduled during call: {data.remarks or outcome_str}",
        )
        db.add(follow_up)

    # Update or insert daily target
    today = date.today()
    dt_res = await db.execute(
        select(DailyTarget).where(DailyTarget.employee_id == employee.id, DailyTarget.date == today)
    )
    daily_target = dt_res.scalars().first()
    if not daily_target:
        daily_target = DailyTarget(
            employee_id=employee.id,
            date=today,
            target_calls=employee.daily_call_target or 100,
            calls_completed=1,
        )
        db.add(daily_target)
    else:
        daily_target.calls_completed += 1

    await db.commit()
    await db.refresh(call_log)

    return {
        "id": call_log.id,
        "lead_id": call_log.lead_id,
        "customer_name": lead.customer_name,
        "employee_id": call_log.employee_id,
        "employee_name": employee.user.full_name if employee.user else employee.employee_id,
        "call_datetime": call_log.call_datetime,
        "duration_seconds": call_log.duration_seconds,
        "outcome": outcome_str,
        "remarks": call_log.remarks,
        "next_follow_up_date": call_log.next_follow_up_date,
    }


async def get_call_logs(
    db: AsyncSession,
    skip: int = 0,
    limit: int = 50,
    employee_id: Optional[uuid.UUID] = None,
    lead_id: Optional[uuid.UUID] = None,
    outcome: Optional[str] = None,
    date_from: Optional[datetime] = None,
    date_to: Optional[datetime] = None,
) -> Tuple[List[Dict[str, Any]], int]:
    """Retrieve call logs with filtering and pagination."""
    query = select(CallLog).options(
        selectinload(CallLog.lead),
        selectinload(CallLog.employee).selectinload(Employee.user),
    )

    if employee_id is not None:
        query = query.where(CallLog.employee_id == employee_id)
    if lead_id is not None:
        query = query.where(CallLog.lead_id == lead_id)
    if outcome is not None:
        query = query.where(CallLog.outcome == outcome.lower().replace(" ", "_"))
    if date_from is not None:
        query = query.where(CallLog.call_datetime >= date_from)
    if date_to is not None:
        query = query.where(CallLog.call_datetime <= date_to)

    count_query = select(func.count(CallLog.id))
    if employee_id is not None:
        count_query = count_query.where(CallLog.employee_id == employee_id)
    if lead_id is not None:
        count_query = count_query.where(CallLog.lead_id == lead_id)
    if outcome is not None:
        count_query = count_query.where(CallLog.outcome == outcome.lower().replace(" ", "_"))
    if date_from is not None:
        count_query = count_query.where(CallLog.call_datetime >= date_from)
    if date_to is not None:
        count_query = count_query.where(CallLog.call_datetime <= date_to)

    total_res = await db.execute(count_query)
    total = total_res.scalar() or 0

    query = query.order_by(desc(CallLog.call_datetime)).offset(skip).limit(limit)
    res = await db.execute(query)
    logs = res.scalars().all()

    items = []
    for c in logs:
        emp_name = c.employee.user.full_name if c.employee and c.employee.user else "Unknown"
        cust_name = c.lead.customer_name if c.lead else "Unknown"
        out_val = c.outcome.value if hasattr(c.outcome, "value") else str(c.outcome)
        items.append({
            "id": c.id,
            "lead_id": c.lead_id,
            "customer_name": cust_name,
            "employee_id": c.employee_id,
            "employee_name": emp_name,
            "call_datetime": c.call_datetime,
            "duration_seconds": c.duration_seconds,
            "outcome": out_val,
            "remarks": c.remarks,
            "next_follow_up_date": c.next_follow_up_date,
        })

    return items, total


async def get_daily_call_progress(
    db: AsyncSession, employee_id: uuid.UUID
) -> Dict[str, Any]:
    """Calculate daily call target completion metrics for 100-call goal."""
    emp_res = await db.execute(select(Employee).where(Employee.id == employee_id))
    emp = emp_res.scalars().first()
    if not emp:
        raise ValueError("Employee not found")

    today = date.today()
    start_of_day = datetime(today.year, today.month, today.day, 0, 0, 0, tzinfo=timezone.utc)
    end_of_day = datetime(today.year, today.month, today.day, 23, 59, 59, tzinfo=timezone.utc)

    calls_res = await db.execute(
        select(func.count(CallLog.id)).where(
            CallLog.employee_id == employee_id,
            CallLog.call_datetime >= start_of_day,
            CallLog.call_datetime <= end_of_day,
        )
    )
    calls_completed = calls_res.scalar() or 0
    target = emp.daily_call_target or 100
    remaining = max(0, target - calls_completed)
    pct = round((calls_completed / target) * 100, 1) if target > 0 else 0.0

    return {
        "target": target,
        "completed": calls_completed,
        "remaining": remaining,
        "percentage": min(pct, 100.0),
        "actual_percentage": pct,
        "date": today.isoformat(),
    }
