"""Follow-up management service."""

import uuid
from datetime import date, datetime, timezone
from typing import Any, Dict, List, Optional, Tuple
from sqlalchemy import desc, func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.employee import Employee
from app.models.follow_up import FollowUp, FollowUpStatus
from app.models.lead import Lead
from app.schemas.follow_up import FollowUpCreate, FollowUpUpdate


def _follow_up_to_dict(f: FollowUp) -> Dict[str, Any]:
    emp_name = f.employee.user.full_name if f.employee and f.employee.user else "Unknown"
    cust_name = f.lead.customer_name if f.lead else "Unknown"
    stat_val = f.status.value if hasattr(f.status, "value") else str(f.status)

    return {
        "id": f.id,
        "lead_id": f.lead_id,
        "customer_name": cust_name,
        "employee_id": f.employee_id,
        "employee_name": emp_name,
        "scheduled_date": f.scheduled_date,
        "completed_date": f.completed_date,
        "status": stat_val,
        "remarks": f.remarks,
        "created_at": f.created_at,
    }


async def get_follow_ups(
    db: AsyncSession,
    skip: int = 0,
    limit: int = 50,
    employee_id: Optional[uuid.UUID] = None,
    status: Optional[str] = None,
    filter_type: Optional[str] = None,  # "upcoming", "overdue", "today", "completed"
    date_from: Optional[date] = None,
    date_to: Optional[date] = None,
) -> Tuple[List[Dict[str, Any]], int]:
    """Retrieve follow-ups with filtering."""
    query = select(FollowUp).options(
        selectinload(FollowUp.lead),
        selectinload(FollowUp.employee).selectinload(Employee.user),
    )

    today = date.today()

    if employee_id is not None:
        query = query.where(FollowUp.employee_id == employee_id)

    if status:
        query = query.where(FollowUp.status == status)

    if filter_type == "overdue":
        query = query.where(
            FollowUp.scheduled_date < today,
            FollowUp.status == FollowUpStatus.PENDING,
        )
    elif filter_type == "today":
        query = query.where(FollowUp.scheduled_date == today)
    elif filter_type == "upcoming":
        query = query.where(
            FollowUp.scheduled_date >= today,
            FollowUp.status == FollowUpStatus.PENDING,
        )
    elif filter_type == "completed":
        query = query.where(FollowUp.status == FollowUpStatus.COMPLETED)

    if date_from:
        query = query.where(FollowUp.scheduled_date >= date_from)
    if date_to:
        query = query.where(FollowUp.scheduled_date <= date_to)

    count_query = select(func.count(FollowUp.id))
    if employee_id is not None:
        count_query = count_query.where(FollowUp.employee_id == employee_id)
    if status:
        count_query = count_query.where(FollowUp.status == status)
    if filter_type == "overdue":
        count_query = count_query.where(
            FollowUp.scheduled_date < today,
            FollowUp.status == FollowUpStatus.PENDING,
        )
    elif filter_type == "today":
        count_query = count_query.where(FollowUp.scheduled_date == today)
    elif filter_type == "upcoming":
        count_query = count_query.where(
            FollowUp.scheduled_date >= today,
            FollowUp.status == FollowUpStatus.PENDING,
        )
    elif filter_type == "completed":
        count_query = count_query.where(FollowUp.status == FollowUpStatus.COMPLETED)

    if date_from:
        count_query = count_query.where(FollowUp.scheduled_date >= date_from)
    if date_to:
        count_query = count_query.where(FollowUp.scheduled_date <= date_to)

    total_res = await db.execute(count_query)
    total = total_res.scalar() or 0

    query = query.order_by(FollowUp.scheduled_date.asc()).offset(skip).limit(limit)
    res = await db.execute(query)
    records = res.scalars().all()

    return [_follow_up_to_dict(f) for f in records], total


async def create_follow_up(
    db: AsyncSession, data: FollowUpCreate, employee_id: uuid.UUID
) -> Dict[str, Any]:
    """Create a new scheduled follow-up."""
    lead_res = await db.execute(select(Lead).where(Lead.id == data.lead_id))
    lead = lead_res.scalars().first()
    if not lead:
        raise ValueError("Lead not found")

    follow_up = FollowUp(
        lead_id=data.lead_id,
        employee_id=employee_id,
        scheduled_date=data.scheduled_date,
        status=FollowUpStatus.PENDING,
        remarks=data.remarks,
    )
    db.add(follow_up)
    await db.commit()
    await db.refresh(follow_up)

    # Reload with relations
    res = await db.execute(
        select(FollowUp)
        .options(
            selectinload(FollowUp.lead),
            selectinload(FollowUp.employee).selectinload(Employee.user),
        )
        .where(FollowUp.id == follow_up.id)
    )
    loaded = res.scalars().first()
    return _follow_up_to_dict(loaded or follow_up)


async def complete_follow_up(
    db: AsyncSession, follow_up_id: uuid.UUID, remarks: Optional[str] = None
) -> Optional[Dict[str, Any]]:
    """Mark a follow-up as completed."""
    res = await db.execute(
        select(FollowUp)
        .options(
            selectinload(FollowUp.lead),
            selectinload(FollowUp.employee).selectinload(Employee.user),
        )
        .where(FollowUp.id == follow_up_id)
    )
    f = res.scalars().first()
    if not f:
        return None

    f.status = FollowUpStatus.COMPLETED
    f.completed_date = datetime.now(timezone.utc)
    if remarks:
        f.remarks = f"{f.remarks or ''} | Completion note: {remarks}".strip(" |")

    await db.commit()
    await db.refresh(f)
    return _follow_up_to_dict(f)


async def reschedule_follow_up(
    db: AsyncSession,
    follow_up_id: uuid.UUID,
    new_date: date,
    remarks: Optional[str] = None,
) -> Optional[Dict[str, Any]]:
    """Reschedule a follow-up to a new date."""
    res = await db.execute(
        select(FollowUp)
        .options(
            selectinload(FollowUp.lead),
            selectinload(FollowUp.employee).selectinload(Employee.user),
        )
        .where(FollowUp.id == follow_up_id)
    )
    f = res.scalars().first()
    if not f:
        return None

    old_date = f.scheduled_date
    f.scheduled_date = new_date
    f.status = FollowUpStatus.PENDING
    reschedule_note = f"Rescheduled from {old_date} to {new_date}. {remarks or ''}".strip()
    f.remarks = f"{f.remarks or ''} | {reschedule_note}".strip(" |")

    await db.commit()
    await db.refresh(f)
    return _follow_up_to_dict(f)
