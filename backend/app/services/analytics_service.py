"""Analytics and metrics aggregation service."""

import uuid
from datetime import date, datetime, timedelta, timezone
from typing import Any, Dict, List, Optional
from sqlalchemy import desc, func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.call_log import CallLog
from app.models.daily_target import DailyTarget
from app.models.document import Document, VerificationStatus
from app.models.employee import Employee
from app.models.follow_up import FollowUp, FollowUpStatus
from app.models.lead import Lead, LeadStatus
from app.models.loan_application import ApplicationStatus, LoanApplication
from app.models.user import User


async def get_admin_dashboard_stats(db: AsyncSession) -> Dict[str, Any]:
    """Calculate all admin dashboard metrics using actual DB records."""
    today = date.today()
    start_of_day = datetime(today.year, today.month, today.day, 0, 0, 0, tzinfo=timezone.utc)
    end_of_day = datetime(today.year, today.month, today.day, 23, 59, 59, tzinfo=timezone.utc)

    # Total leads
    total_leads_res = await db.execute(select(func.count(Lead.id)))
    total_leads = total_leads_res.scalar() or 0

    # Leads created today
    leads_today_res = await db.execute(
        select(func.count(Lead.id)).where(Lead.created_at >= start_of_day)
    )
    leads_today = leads_today_res.scalar() or 0

    # Unassigned leads
    unassigned_res = await db.execute(
        select(func.count(Lead.id)).where(Lead.assigned_employee_id.is_(None))
    )
    unassigned_leads = unassigned_res.scalar() or 0

    # Total active employees
    emp_res = await db.execute(select(func.count(Employee.id)).where(Employee.is_active == True))
    total_employees = emp_res.scalar() or 0

    # Total calls today
    calls_today_res = await db.execute(
        select(func.count(CallLog.id)).where(
            CallLog.call_datetime >= start_of_day,
            CallLog.call_datetime <= end_of_day,
        )
    )
    calls_today = calls_today_res.scalar() or 0

    # Daily call target total
    targets_res = await db.execute(
        select(func.sum(Employee.daily_call_target)).where(Employee.is_active == True)
    )
    daily_target = targets_res.scalar() or (total_employees * 100)

    # Interested customers
    interested_res = await db.execute(
        select(func.count(Lead.id)).where(Lead.status == LeadStatus.INTERESTED)
    )
    interested_customers = interested_res.scalar() or 0

    # Follow-ups due today
    followups_today_res = await db.execute(
        select(func.count(FollowUp.id)).where(
            FollowUp.scheduled_date == today,
            FollowUp.status == FollowUpStatus.PENDING,
        )
    )
    followups_due_today = followups_today_res.scalar() or 0

    # Overdue follow-ups
    overdue_res = await db.execute(
        select(func.count(FollowUp.id)).where(
            FollowUp.scheduled_date < today,
            FollowUp.status == FollowUpStatus.PENDING,
        )
    )
    overdue_followups = overdue_res.scalar() or 0

    # Pending documents
    pending_docs_res = await db.execute(
        select(func.count(Document.id)).where(Document.verification_status == VerificationStatus.PENDING)
    )
    pending_documents = pending_docs_res.scalar() or 0

    # Applications under review
    review_statuses = [
        ApplicationStatus.SUBMITTED_TO_BANK,
        ApplicationStatus.UNDER_BANK_REVIEW,
        ApplicationStatus.ADDITIONAL_INFO_REQUIRED,
    ]
    review_res = await db.execute(
        select(func.count(LoanApplication.id)).where(LoanApplication.status.in_(review_statuses))
    )
    applications_under_review = review_res.scalar() or 0

    # Approved loans
    approved_res = await db.execute(
        select(func.count(LoanApplication.id)).where(LoanApplication.status == ApplicationStatus.APPROVED)
    )
    approved_loans = approved_res.scalar() or 0

    # Disbursed loans
    disbursed_res = await db.execute(
        select(func.count(LoanApplication.id)).where(LoanApplication.status == ApplicationStatus.DISBURSED)
    )
    disbursed_loans = disbursed_res.scalar() or 0

    # Rejected applications
    rejected_res = await db.execute(
        select(func.count(LoanApplication.id)).where(LoanApplication.status == ApplicationStatus.REJECTED)
    )
    rejected_applications = rejected_res.scalar() or 0

    return {
        "total_leads": total_leads,
        "leads_today": leads_today,
        "unassigned_leads": unassigned_leads,
        "total_employees": total_employees,
        "calls_today": calls_today,
        "daily_target": daily_target,
        "interested_customers": interested_customers,
        "followups_due_today": followups_due_today,
        "overdue_followups": overdue_followups,
        "pending_documents": pending_documents,
        "applications_under_review": applications_under_review,
        "approved_loans": approved_loans,
        "disbursed_loans": disbursed_loans,
        "rejected_applications": rejected_applications,
    }


async def get_staff_dashboard_stats(
    db: AsyncSession, employee_id: uuid.UUID
) -> Dict[str, Any]:
    """Calculate staff personal dashboard metrics."""
    emp_res = await db.execute(select(Employee).where(Employee.id == employee_id))
    emp = emp_res.scalars().first()
    if not emp:
        raise ValueError("Employee not found")

    today = date.today()
    start_of_day = datetime(today.year, today.month, today.day, 0, 0, 0, tzinfo=timezone.utc)
    end_of_day = datetime(today.year, today.month, today.day, 23, 59, 59, tzinfo=timezone.utc)

    # Calls today
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

    # Assigned leads
    leads_res = await db.execute(
        select(func.count(Lead.id)).where(Lead.assigned_employee_id == employee_id)
    )
    assigned_leads = leads_res.scalar() or 0

    # Interested customers
    interested_res = await db.execute(
        select(func.count(Lead.id)).where(
            Lead.assigned_employee_id == employee_id,
            Lead.status == LeadStatus.INTERESTED,
        )
    )
    interested_customers = interested_res.scalar() or 0

    # Follow-ups due today
    today_followups_res = await db.execute(
        select(func.count(FollowUp.id)).where(
            FollowUp.employee_id == employee_id,
            FollowUp.scheduled_date == today,
            FollowUp.status == FollowUpStatus.PENDING,
        )
    )
    followups_due_today = today_followups_res.scalar() or 0

    # Overdue follow-ups
    overdue_res = await db.execute(
        select(func.count(FollowUp.id)).where(
            FollowUp.employee_id == employee_id,
            FollowUp.scheduled_date < today,
            FollowUp.status == FollowUpStatus.PENDING,
        )
    )
    overdue_followups = overdue_res.scalar() or 0

    # Pending documents on assigned leads
    pending_docs_res = await db.execute(
        select(func.count(Document.id))
        .join(Document.lead)
        .where(
            Lead.assigned_employee_id == employee_id,
            Document.verification_status == VerificationStatus.PENDING,
        )
    )
    pending_documents = pending_docs_res.scalar() or 0

    # Active loan applications
    active_statuses = [
        ApplicationStatus.DRAFT,
        ApplicationStatus.DOCUMENTS_PENDING,
        ApplicationStatus.READY_FOR_SUBMISSION,
        ApplicationStatus.SUBMITTED_TO_BANK,
        ApplicationStatus.UNDER_BANK_REVIEW,
        ApplicationStatus.ADDITIONAL_INFO_REQUIRED,
    ]
    apps_res = await db.execute(
        select(func.count(LoanApplication.id)).where(
            LoanApplication.employee_id == employee_id,
            LoanApplication.status.in_(active_statuses),
        )
    )
    active_applications = apps_res.scalar() or 0

    return {
        "daily_call_target": target,
        "calls_completed": calls_completed,
        "remaining_calls": remaining,
        "target_completion_pct": min(pct, 100.0),
        "actual_target_pct": pct,
        "assigned_leads": assigned_leads,
        "interested_customers": interested_customers,
        "followups_due_today": followups_due_today,
        "overdue_followups": overdue_followups,
        "pending_documents": pending_documents,
        "active_applications": active_applications,
    }


async def get_daily_call_activity_chart(db: AsyncSession, days: int = 14) -> List[Dict[str, Any]]:
    """Get calls per day for the last N days."""
    today = date.today()
    results = []

    for i in range(days - 1, -1, -1):
        target_d = today - timedelta(days=i)
        start = datetime(target_d.year, target_d.month, target_d.day, 0, 0, 0, tzinfo=timezone.utc)
        end = datetime(target_d.year, target_d.month, target_d.day, 23, 59, 59, tzinfo=timezone.utc)

        count_res = await db.execute(
            select(func.count(CallLog.id)).where(
                CallLog.call_datetime >= start,
                CallLog.call_datetime <= end,
            )
        )
        count = count_res.scalar() or 0
        results.append({
            "date": target_d.isoformat(),
            "formatted_date": target_d.strftime("%b %d"),
            "count": count,
        })

    return results


async def get_weekly_lead_chart(db: AsyncSession, weeks: int = 8) -> List[Dict[str, Any]]:
    """Get leads generated per week for the last N weeks."""
    today = date.today()
    results = []

    for i in range(weeks - 1, -1, -1):
        week_end = today - timedelta(days=i * 7)
        week_start = week_end - timedelta(days=6)
        start = datetime(week_start.year, week_start.month, week_start.day, 0, 0, 0, tzinfo=timezone.utc)
        end = datetime(week_end.year, week_end.month, week_end.day, 23, 59, 59, tzinfo=timezone.utc)

        count_res = await db.execute(
            select(func.count(Lead.id)).where(
                Lead.created_at >= start,
                Lead.created_at <= end,
            )
        )
        count = count_res.scalar() or 0
        results.append({
            "week": f"{week_start.strftime('%b %d')} - {week_end.strftime('%b %d')}",
            "count": count,
        })

    return results


async def get_leaderboard(db: AsyncSession) -> List[Dict[str, Any]]:
    """Get employee performance leaderboard sorted by calls & conversions."""
    emp_res = await db.execute(
        select(Employee).options(selectinload(Employee.user)).where(Employee.is_active == True)
    )
    employees = emp_res.scalars().all()

    today = date.today()
    start_of_day = datetime(today.year, today.month, today.day, 0, 0, 0, tzinfo=timezone.utc)

    leaderboard = []
    for emp in employees:
        calls_res = await db.execute(
            select(func.count(CallLog.id)).where(
                CallLog.employee_id == emp.id,
                CallLog.call_datetime >= start_of_day,
            )
        )
        calls = calls_res.scalar() or 0

        interested_res = await db.execute(
            select(func.count(Lead.id)).where(
                Lead.assigned_employee_id == emp.id,
                Lead.status == LeadStatus.INTERESTED,
            )
        )
        interested = interested_res.scalar() or 0

        conversions_res = await db.execute(
            select(func.count(LoanApplication.id)).where(
                LoanApplication.employee_id == emp.id,
                LoanApplication.status.in_([ApplicationStatus.APPROVED, ApplicationStatus.DISBURSED]),
            )
        )
        conversions = conversions_res.scalar() or 0

        leaderboard.append({
            "employee_id": emp.employee_id,
            "employee_name": emp.user.full_name if emp.user else emp.employee_id,
            "department": emp.department or "Sales",
            "calls": calls,
            "interested": interested,
            "conversions": conversions,
            "target": emp.daily_call_target or 100,
            "completion_pct": round((calls / (emp.daily_call_target or 100)) * 100, 1),
        })

    leaderboard.sort(key=lambda x: (x["conversions"], x["calls"]), reverse=True)
    return leaderboard


async def get_lead_status_distribution(db: AsyncSession) -> List[Dict[str, Any]]:
    """Get count of leads per status."""
    res = await db.execute(
        select(Lead.status, func.count(Lead.id)).group_by(Lead.status)
    )
    rows = res.all()
    results = []
    for status, count in rows:
        val = status.value if hasattr(status, "value") else str(status)
        results.append({
            "status": val.replace("_", " ").title(),
            "raw_status": val,
            "count": count,
        })
    return results


async def get_loan_pipeline(db: AsyncSession) -> List[Dict[str, Any]]:
    """Get loan application count per pipeline stage."""
    res = await db.execute(
        select(LoanApplication.status, func.count(LoanApplication.id)).group_by(LoanApplication.status)
    )
    rows = res.all()
    results = []
    for status, count in rows:
        val = status.value if hasattr(status, "value") else str(status)
        results.append({
            "status": val.replace("_", " ").title(),
            "raw_status": val,
            "count": count,
        })
    return results


async def get_conversion_funnel(db: AsyncSession) -> List[Dict[str, Any]]:
    """Calculate funnel drop-off metrics from database."""
    total_leads_res = await db.execute(select(func.count(Lead.id)))
    total_leads = total_leads_res.scalar() or 0

    contacted_res = await db.execute(
        select(func.count(Lead.id)).where(
            Lead.status.in_([
                LeadStatus.CONTACTED,
                LeadStatus.INTERESTED,
                LeadStatus.DOCUMENTS_PENDING,
                LeadStatus.APPLICATION_SUBMITTED,
                LeadStatus.CONVERTED,
            ])
        )
    )
    contacted = contacted_res.scalar() or 0

    interested_res = await db.execute(
        select(func.count(Lead.id)).where(
            Lead.status.in_([
                LeadStatus.INTERESTED,
                LeadStatus.DOCUMENTS_PENDING,
                LeadStatus.APPLICATION_SUBMITTED,
                LeadStatus.CONVERTED,
            ])
        )
    )
    interested = interested_res.scalar() or 0

    apps_res = await db.execute(select(func.count(LoanApplication.id)))
    apps = apps_res.scalar() or 0

    approved_res = await db.execute(
        select(func.count(LoanApplication.id)).where(
            LoanApplication.status.in_([ApplicationStatus.APPROVED, ApplicationStatus.DISBURSED])
        )
    )
    approved = approved_res.scalar() or 0

    disbursed_res = await db.execute(
        select(func.count(LoanApplication.id)).where(
            LoanApplication.status == ApplicationStatus.DISBURSED
        )
    )
    disbursed = disbursed_res.scalar() or 0

    return [
        {"stage": "Total Leads", "count": total_leads, "pct": 100.0},
        {"stage": "Contacted", "count": contacted, "pct": round((contacted / total_leads * 100), 1) if total_leads else 0},
        {"stage": "Interested", "count": interested, "pct": round((interested / total_leads * 100), 1) if total_leads else 0},
        {"stage": "Applications", "count": apps, "pct": round((apps / total_leads * 100), 1) if total_leads else 0},
        {"stage": "Approved", "count": approved, "pct": round((approved / total_leads * 100), 1) if total_leads else 0},
        {"stage": "Disbursed", "count": disbursed, "pct": round((disbursed / total_leads * 100), 1) if total_leads else 0},
    ]
