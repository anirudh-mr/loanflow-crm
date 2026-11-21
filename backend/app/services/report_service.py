"""Report generation and CSV export service."""

import io
import uuid
from datetime import date, datetime, timezone
from typing import Any, Dict, List, Optional
import pandas as pd
from sqlalchemy import desc, func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.bank import Bank
from app.models.call_log import CallLog
from app.models.employee import Employee
from app.models.lead import Lead, LeadStatus
from app.models.loan_application import ApplicationStatus, LoanApplication


async def get_call_performance_report(
    db: AsyncSession,
    period: str = "daily",  # daily, weekly, monthly
    employee_id: Optional[uuid.UUID] = None,
    date_from: Optional[date] = None,
    date_to: Optional[date] = None,
) -> List[Dict[str, Any]]:
    """Aggregate call activity by period."""
    query = select(CallLog).options(
        selectinload(CallLog.employee).selectinload(Employee.user),
        selectinload(CallLog.lead),
    )

    if employee_id:
        query = query.where(CallLog.employee_id == employee_id)
    if date_from:
        start = datetime(date_from.year, date_from.month, date_from.day, 0, 0, 0, tzinfo=timezone.utc)
        query = query.where(CallLog.call_datetime >= start)
    if date_to:
        end = datetime(date_to.year, date_to.month, date_to.day, 23, 59, 59, tzinfo=timezone.utc)
        query = query.where(CallLog.call_datetime <= end)

    res = await db.execute(query)
    calls = res.scalars().all()

    # Group in python
    grouped: Dict[str, Dict[str, Any]] = {}
    for c in calls:
        if period == "monthly":
            key = c.call_datetime.strftime("%Y-%m")
        elif period == "weekly":
            key = f"{c.call_datetime.isocalendar()[0]}-W{c.call_datetime.isocalendar()[1]:02d}"
        else:
            key = c.call_datetime.strftime("%Y-%m-%d")

        if key not in grouped:
            grouped[key] = {
                "period": key,
                "total_calls": 0,
                "interested": 0,
                "not_interested": 0,
                "no_answer": 0,
                "busy": 0,
                "follow_up_required": 0,
                "total_duration_sec": 0,
            }

        grouped[key]["total_calls"] += 1
        grouped[key]["total_duration_sec"] += c.duration_seconds
        outcome = c.outcome.value if hasattr(c.outcome, "value") else str(c.outcome)
        outcome_key = outcome.lower().replace(" ", "_")
        if outcome_key in grouped[key]:
            grouped[key][outcome_key] += 1

    report = sorted(grouped.values(), key=lambda x: x["period"], reverse=True)
    for r in report:
        avg_dur = round(r["total_duration_sec"] / r["total_calls"], 1) if r["total_calls"] else 0
        r["avg_duration_sec"] = avg_dur
    return report


async def get_employee_performance_report(
    db: AsyncSession,
    date_from: Optional[date] = None,
    date_to: Optional[date] = None,
) -> List[Dict[str, Any]]:
    """Performance breakdown for each employee."""
    emp_res = await db.execute(
        select(Employee).options(selectinload(Employee.user)).where(Employee.is_active == True)
    )
    employees = emp_res.scalars().all()

    report = []
    for emp in employees:
        # Calls
        cq = select(func.count(CallLog.id)).where(CallLog.employee_id == emp.id)
        if date_from:
            start = datetime(date_from.year, date_from.month, date_from.day, 0, 0, 0, tzinfo=timezone.utc)
            cq = cq.where(CallLog.call_datetime >= start)
        if date_to:
            end = datetime(date_to.year, date_to.month, date_to.day, 23, 59, 59, tzinfo=timezone.utc)
            cq = cq.where(CallLog.call_datetime <= end)
        calls_count = (await db.execute(cq)).scalar() or 0

        # Assigned leads
        lq = select(func.count(Lead.id)).where(Lead.assigned_employee_id == emp.id)
        leads_count = (await db.execute(lq)).scalar() or 0

        # Interested
        iq = select(func.count(Lead.id)).where(
            Lead.assigned_employee_id == emp.id,
            Lead.status == LeadStatus.INTERESTED,
        )
        interested_count = (await db.execute(iq)).scalar() or 0

        # Applications
        aq = select(func.count(LoanApplication.id)).where(LoanApplication.employee_id == emp.id)
        apps_count = (await db.execute(aq)).scalar() or 0

        # Approved / Disbursed
        approved_q = select(func.count(LoanApplication.id)).where(
            LoanApplication.employee_id == emp.id,
            LoanApplication.status == ApplicationStatus.APPROVED,
        )
        approved_count = (await db.execute(approved_q)).scalar() or 0

        disbursed_q = select(func.count(LoanApplication.id)).where(
            LoanApplication.employee_id == emp.id,
            LoanApplication.status == ApplicationStatus.DISBURSED,
        )
        disbursed_count = (await db.execute(disbursed_q)).scalar() or 0

        conv_rate = round((disbursed_count / leads_count) * 100, 1) if leads_count else 0.0

        report.append({
            "employee_id": emp.employee_id,
            "employee_name": emp.user.full_name if emp.user else emp.employee_id,
            "department": emp.department or "Sales",
            "daily_target": emp.daily_call_target or 100,
            "assigned_leads": leads_count,
            "total_calls": calls_count,
            "interested_leads": interested_count,
            "applications_submitted": apps_count,
            "loans_approved": approved_count,
            "loans_disbursed": disbursed_count,
            "conversion_rate_pct": conv_rate,
        })

    return sorted(report, key=lambda x: x["loans_disbursed"], reverse=True)


async def get_bank_wise_report(
    db: AsyncSession,
    date_from: Optional[date] = None,
    date_to: Optional[date] = None,
) -> List[Dict[str, Any]]:
    """Performance and approval metrics grouped by lending bank."""
    banks_res = await db.execute(select(Bank).where(Bank.is_active == True))
    banks = banks_res.scalars().all()

    report = []
    for b in banks:
        q = select(LoanApplication).where(LoanApplication.bank_id == b.id)
        if date_from:
            start = datetime(date_from.year, date_from.month, date_from.day, 0, 0, 0, tzinfo=timezone.utc)
            q = q.where(LoanApplication.created_at >= start)
        if date_to:
            end = datetime(date_to.year, date_to.month, date_to.day, 23, 59, 59, tzinfo=timezone.utc)
            q = q.where(LoanApplication.created_at <= end)

        res = await db.execute(q)
        apps = res.scalars().all()

        total_apps = len(apps)
        approved = sum(1 for a in apps if a.status == ApplicationStatus.APPROVED)
        disbursed = sum(1 for a in apps if a.status == ApplicationStatus.DISBURSED)
        rejected = sum(1 for a in apps if a.status == ApplicationStatus.REJECTED)
        under_review = sum(1 for a in apps if a.status in (
            ApplicationStatus.SUBMITTED_TO_BANK,
            ApplicationStatus.UNDER_BANK_REVIEW,
            ApplicationStatus.ADDITIONAL_INFO_REQUIRED,
        ))

        total_requested = sum(float(a.requested_amount) for a in apps)
        total_approved = sum(float(a.approved_amount or 0) for a in apps if a.approved_amount)

        approval_rate = round((approved + disbursed) / total_apps * 100, 1) if total_apps else 0.0

        report.append({
            "bank_id": str(b.id),
            "bank_name": b.name,
            "bank_code": b.code,
            "total_applications": total_apps,
            "under_review": under_review,
            "approved": approved,
            "disbursed": disbursed,
            "rejected": rejected,
            "approval_rate_pct": approval_rate,
            "total_requested_amount": total_requested,
            "total_approved_amount": total_approved,
        })

    return sorted(report, key=lambda x: x["total_applications"], reverse=True)


async def get_lead_source_report(
    db: AsyncSession,
    date_from: Optional[date] = None,
    date_to: Optional[date] = None,
) -> List[Dict[str, Any]]:
    """Performance breakdown by lead source."""
    query = select(Lead)
    if date_from:
        start = datetime(date_from.year, date_from.month, date_from.day, 0, 0, 0, tzinfo=timezone.utc)
        query = query.where(Lead.created_at >= start)
    if date_to:
        end = datetime(date_to.year, date_to.month, date_to.day, 23, 59, 59, tzinfo=timezone.utc)
        query = query.where(Lead.created_at <= end)

    res = await db.execute(query)
    leads = res.scalars().all()

    grouped: Dict[str, Dict[str, Any]] = {}
    for l in leads:
        src = l.lead_source or "Direct"
        if src not in grouped:
            grouped[src] = {
                "source": src,
                "total_leads": 0,
                "contacted": 0,
                "interested": 0,
                "converted": 0,
            }
        grouped[src]["total_leads"] += 1
        stat = l.status.value if hasattr(l.status, "value") else str(l.status)
        if stat in ("contacted", "interested", "documents_pending", "application_submitted", "converted"):
            grouped[src]["contacted"] += 1
        if stat in ("interested", "documents_pending", "application_submitted", "converted"):
            grouped[src]["interested"] += 1
        if stat == "converted":
            grouped[src]["converted"] += 1

    report = list(grouped.values())
    for r in report:
        r["conversion_rate_pct"] = round((r["converted"] / r["total_leads"]) * 100, 1) if r["total_leads"] else 0.0
    return sorted(report, key=lambda x: x["total_leads"], reverse=True)


async def export_report_to_csv(
    db: AsyncSession, report_type: str, date_from: Optional[date] = None, date_to: Optional[date] = None
) -> str:
    """Generate CSV string for any report type."""
    if report_type == "call_performance":
        data = await get_call_performance_report(db, "daily", date_from=date_from, date_to=date_to)
    elif report_type == "employee_performance":
        data = await get_employee_performance_report(db, date_from=date_from, date_to=date_to)
    elif report_type == "bank_wise":
        data = await get_bank_wise_report(db, date_from=date_from, date_to=date_to)
    elif report_type == "lead_source":
        data = await get_lead_source_report(db, date_from=date_from, date_to=date_to)
    else:
        data = []

    if not data:
        return "No data available\n"

    df = pd.DataFrame(data)
    return df.to_csv(index=False)
