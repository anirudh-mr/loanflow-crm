"""Loan application management service."""

import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional, Tuple
from sqlalchemy import desc, func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.application_status_history import ApplicationStatusHistory
from app.models.bank import Bank
from app.models.document import Document
from app.models.employee import Employee
from app.models.lead import Lead, LeadStatus
from app.models.loan_application import ApplicationStatus, LoanApplication
from app.models.loan_scheme import LoanScheme
from app.models.user import User
from app.schemas.loan_application import (
    LoanApplicationCreate,
    LoanApplicationUpdate,
)


def _app_to_dict(a: LoanApplication) -> Dict[str, Any]:
    cust_name = a.lead.customer_name if a.lead else "Unknown"
    emp_name = (
        a.employee.user.full_name
        if a.employee and a.employee.user
        else (a.employee.employee_id if a.employee else "Unknown")
    )
    b_name = a.bank.name if a.bank else "Unknown Bank"
    s_name = a.loan_scheme.scheme_name if a.loan_scheme else None
    stat_val = a.status.value if hasattr(a.status, "value") else str(a.status)

    return {
        "id": a.id,
        "lead_id": a.lead_id,
        "customer_name": cust_name,
        "employee_id": a.employee_id,
        "employee_name": emp_name,
        "bank_id": a.bank_id,
        "bank_name": b_name,
        "loan_scheme_id": a.loan_scheme_id,
        "scheme_name": s_name,
        "requested_amount": float(a.requested_amount),
        "approved_amount": float(a.approved_amount) if a.approved_amount is not None else None,
        "application_date": a.application_date,
        "status": stat_val,
        "remarks": a.remarks,
        "created_at": a.created_at,
        "updated_at": a.updated_at,
    }


async def get_applications(
    db: AsyncSession,
    skip: int = 0,
    limit: int = 50,
    status: Optional[str] = None,
    bank_id: Optional[uuid.UUID] = None,
    employee_id: Optional[uuid.UUID] = None,
    lead_id: Optional[uuid.UUID] = None,
) -> Tuple[List[Dict[str, Any]], int]:
    """List loan applications with filters."""
    query = select(LoanApplication).options(
        selectinload(LoanApplication.lead),
        selectinload(LoanApplication.employee).selectinload(Employee.user),
        selectinload(LoanApplication.bank),
        selectinload(LoanApplication.loan_scheme),
    )

    if status:
        query = query.where(LoanApplication.status == status.lower().replace(" ", "_"))
    if bank_id is not None:
        query = query.where(LoanApplication.bank_id == bank_id)
    if employee_id is not None:
        query = query.where(LoanApplication.employee_id == employee_id)
    if lead_id is not None:
        query = query.where(LoanApplication.lead_id == lead_id)

    count_query = select(func.count(LoanApplication.id))
    if status:
        count_query = count_query.where(LoanApplication.status == status.lower().replace(" ", "_"))
    if bank_id is not None:
        count_query = count_query.where(LoanApplication.bank_id == bank_id)
    if employee_id is not None:
        count_query = count_query.where(LoanApplication.employee_id == employee_id)
    if lead_id is not None:
        count_query = count_query.where(LoanApplication.lead_id == lead_id)

    total_res = await db.execute(count_query)
    total = total_res.scalar() or 0

    query = query.order_by(desc(LoanApplication.created_at)).offset(skip).limit(limit)
    res = await db.execute(query)
    apps = res.scalars().all()
    return [_app_to_dict(a) for a in apps], total


async def get_application(
    db: AsyncSession, app_id: uuid.UUID
) -> Optional[LoanApplication]:
    """Get single application."""
    res = await db.execute(
        select(LoanApplication)
        .options(
            selectinload(LoanApplication.lead),
            selectinload(LoanApplication.employee).selectinload(Employee.user),
            selectinload(LoanApplication.bank),
            selectinload(LoanApplication.loan_scheme),
            selectinload(LoanApplication.status_history).selectinload(ApplicationStatusHistory.changed_by_user),
        )
        .where(LoanApplication.id == app_id)
    )
    return res.scalars().first()


async def get_application_details(
    db: AsyncSession, app_id: uuid.UUID
) -> Optional[Dict[str, Any]]:
    """Get comprehensive application detail view."""
    app = await get_application(db, app_id)
    if not app:
        return None

    # Load lead documents
    docs_res = await db.execute(
        select(Document)
        .options(selectinload(Document.verified_by_user))
        .where(Document.lead_id == app.lead_id)
        .order_by(desc(Document.created_at))
    )
    docs = docs_res.scalars().all()

    timeline = []
    for h in sorted(app.status_history, key=lambda x: x.changed_at or datetime.min, reverse=True):
        timeline.append({
            "id": h.id,
            "old_status": h.old_status,
            "new_status": h.new_status,
            "changed_by_name": h.changed_by_user.full_name if h.changed_by_user else "System",
            "remarks": h.remarks,
            "changed_at": h.changed_at,
        })

    return {
        "application": _app_to_dict(app),
        "documents": [
            {
                "id": d.id,
                "category": d.category.value if hasattr(d.category, "value") else str(d.category),
                "file_name": d.file_name,
                "verification_status": d.verification_status.value if hasattr(d.verification_status, "value") else str(d.verification_status),
                "rejection_remarks": d.rejection_remarks,
                "created_at": d.created_at,
            }
            for d in docs
        ],
        "timeline": timeline,
    }


async def create_application(
    db: AsyncSession, data: LoanApplicationCreate, employee_id: uuid.UUID
) -> Dict[str, Any]:
    """Create loan application and initialize status history."""
    lead_res = await db.execute(select(Lead).where(Lead.id == data.lead_id))
    lead = lead_res.scalars().first()
    if not lead:
        raise ValueError("Lead not found")

    bank_res = await db.execute(select(Bank).where(Bank.id == data.bank_id))
    bank = bank_res.scalars().first()
    if not bank:
        raise ValueError("Bank not found")

    now = datetime.now(timezone.utc)
    app = LoanApplication(
        lead_id=data.lead_id,
        employee_id=employee_id,
        bank_id=data.bank_id,
        loan_scheme_id=data.loan_scheme_id,
        requested_amount=data.requested_amount,
        application_date=now,
        status=ApplicationStatus.DRAFT,
        remarks=data.remarks,
    )
    db.add(app)
    await db.flush()

    # Create initial status history
    history = ApplicationStatusHistory(
        application_id=app.id,
        old_status=None,
        new_status="draft",
        changed_by=employee_id,
        remarks="Application created in draft state",
        changed_at=now,
    )
    db.add(history)

    lead.status = LeadStatus.APPLICATION_SUBMITTED
    await db.commit()
    await db.refresh(app)

    loaded = await get_application(db, app.id)
    return _app_to_dict(loaded or app)


async def update_application_status(
    db: AsyncSession,
    app_id: uuid.UUID,
    new_status: str,
    remarks: Optional[str],
    user: User,
    approved_amount: Optional[float] = None,
) -> Optional[Dict[str, Any]]:
    """Transition application status and record in audit history."""
    app = await get_application(db, app_id)
    if not app:
        return None

    old_status_val = app.status.value if hasattr(app.status, "value") else str(app.status)
    norm_new_status = new_status.lower().replace(" ", "_")

    now = datetime.now(timezone.utc)
    app.status = norm_new_status
    app.updated_at = now
    if approved_amount is not None:
        app.approved_amount = approved_amount
    if remarks:
        app.remarks = f"{app.remarks or ''} | {remarks}".strip(" |")

    # Record history
    history = ApplicationStatusHistory(
        application_id=app.id,
        old_status=old_status_val,
        new_status=norm_new_status,
        changed_by=user.id,
        remarks=remarks or f"Status updated to {new_status}",
        changed_at=now,
    )
    db.add(history)

    # Lead status sync
    if app.lead:
        if norm_new_status in ("approved", "disbursed"):
            app.lead.status = LeadStatus.CONVERTED
        elif norm_new_status == "rejected":
            app.lead.status = LeadStatus.CLOSED

    await db.commit()
    await db.refresh(app)
    return _app_to_dict(app)
