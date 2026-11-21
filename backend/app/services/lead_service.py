"""Lead management and distribution service."""

import io
import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional, Tuple
import pandas as pd
from sqlalchemy import desc, func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.activity_log import ActivityLog
from app.models.call_log import CallLog
from app.models.document import Document
from app.models.employee import Employee
from app.models.follow_up import FollowUp
from app.models.lead import EmploymentType, Lead, LeadPriority, LeadStatus
from app.models.lead_assignment import LeadAssignment
from app.models.loan_application import LoanApplication
from app.schemas.lead import (
    LeadBulkUploadResponse,
    LeadCreate,
    LeadResponse,
    LeadUpdate,
)


def _lead_to_dict(lead: Lead) -> Dict[str, Any]:
    emp_name = None
    if lead.assigned_employee and lead.assigned_employee.user:
        emp_name = lead.assigned_employee.user.full_name
    elif lead.assigned_employee:
        emp_name = lead.assigned_employee.employee_id

    status_val = lead.status.value if hasattr(lead.status, "value") else str(lead.status)
    priority_val = lead.priority.value if hasattr(lead.priority, "value") else str(lead.priority)
    emp_type_val = (
        lead.employment_type.value
        if hasattr(lead.employment_type, "value")
        else str(lead.employment_type)
    )

    return {
        "id": lead.id,
        "customer_name": lead.customer_name,
        "phone": lead.phone,
        "email": lead.email,
        "city": lead.city,
        "state": lead.state,
        "employment_type": emp_type_val,
        "monthly_income": float(lead.monthly_income),
        "loan_type": lead.loan_type,
        "requested_amount": float(lead.requested_amount),
        "preferred_bank": lead.preferred_bank,
        "lead_source": lead.lead_source,
        "priority": priority_val,
        "status": status_val,
        "assigned_employee_id": lead.assigned_employee_id,
        "assigned_employee_name": emp_name,
        "last_contact_date": lead.last_contact_date,
        "created_at": lead.created_at,
        "updated_at": lead.updated_at,
    }


async def get_leads(
    db: AsyncSession,
    skip: int = 0,
    limit: int = 50,
    search: Optional[str] = None,
    status: Optional[str] = None,
    employee_id: Optional[uuid.UUID] = None,
    priority: Optional[str] = None,
    loan_type: Optional[str] = None,
    is_unassigned: Optional[bool] = None,
    sort_by: str = "created_at",
    sort_order: str = "desc",
) -> Tuple[List[Dict[str, Any]], int]:
    """Retrieve leads with search, filtering, and pagination."""
    query = select(Lead).options(
        selectinload(Lead.assigned_employee).selectinload(Employee.user)
    )

    if is_unassigned:
        query = query.where(Lead.assigned_employee_id.is_(None))
    elif employee_id is not None:
        query = query.where(Lead.assigned_employee_id == employee_id)

    if status:
        query = query.where(Lead.status == status)

    if priority:
        query = query.where(Lead.priority == priority)

    if loan_type:
        query = query.where(Lead.loan_type.ilike(f"%{loan_type}%"))

    if search:
        pat = f"%{search}%"
        query = query.where(
            or_(
                Lead.customer_name.ilike(pat),
                Lead.phone.ilike(pat),
                Lead.email.ilike(pat),
                Lead.city.ilike(pat),
            )
        )

    # Count total
    count_query = select(func.count(Lead.id))
    if is_unassigned:
        count_query = count_query.where(Lead.assigned_employee_id.is_(None))
    elif employee_id is not None:
        count_query = count_query.where(Lead.assigned_employee_id == employee_id)
    if status:
        count_query = count_query.where(Lead.status == status)
    if priority:
        count_query = count_query.where(Lead.priority == priority)
    if loan_type:
        count_query = count_query.where(Lead.loan_type.ilike(f"%{loan_type}%"))
    if search:
        pat = f"%{search}%"
        count_query = count_query.where(
            or_(
                Lead.customer_name.ilike(pat),
                Lead.phone.ilike(pat),
                Lead.email.ilike(pat),
                Lead.city.ilike(pat),
            )
        )

    total_res = await db.execute(count_query)
    total = total_res.scalar() or 0

    # Sorting
    sort_column = getattr(Lead, sort_by, Lead.created_at)
    if sort_order.lower() == "desc":
        query = query.order_by(desc(sort_column))
    else:
        query = query.order_by(sort_column)

    query = query.offset(skip).limit(limit)
    res = await db.execute(query)
    leads = res.scalars().all()

    return [_lead_to_dict(l) for l in leads], total


async def get_lead(db: AsyncSession, lead_id: uuid.UUID) -> Optional[Lead]:
    """Get single lead model."""
    res = await db.execute(
        select(Lead)
        .options(selectinload(Lead.assigned_employee).selectinload(Employee.user))
        .where(Lead.id == lead_id)
    )
    return res.scalars().first()


async def create_lead(db: AsyncSession, data: LeadCreate) -> Dict[str, Any]:
    """Create a new lead."""
    emp_type = (
        data.employment_type.lower()
        if isinstance(data.employment_type, str)
        else data.employment_type
    )
    priority = (
        data.priority.lower() if isinstance(data.priority, str) else data.priority
    )
    email = data.email if data.email and str(data.email).strip() else None
    pref_bank = (
        data.preferred_bank
        if data.preferred_bank and str(data.preferred_bank).strip()
        else None
    )

    lead = Lead(
        customer_name=data.customer_name,
        phone=data.phone,
        email=email,
        city=data.city,
        state=data.state,
        employment_type=emp_type,
        monthly_income=data.monthly_income,
        loan_type=data.loan_type,
        requested_amount=data.requested_amount,
        preferred_bank=pref_bank,
        lead_source=data.lead_source,
        priority=priority,
        status=LeadStatus.NEW,
    )
    db.add(lead)
    await db.commit()
    await db.refresh(lead)
    return _lead_to_dict(lead)


async def update_lead(
    db: AsyncSession, lead_id: uuid.UUID, data: LeadUpdate
) -> Optional[Dict[str, Any]]:
    """Update lead details."""
    lead = await get_lead(db, lead_id)
    if not lead:
        return None

    update_dict = data.model_dump(exclude_unset=True)
    for key, val in update_dict.items():
        if val is not None:
            if isinstance(val, str) and not val.strip() and key in ("email", "preferred_bank"):
                val = None
            elif key in ("status", "priority", "employment_type") and isinstance(val, str):
                val = val.lower()
            setattr(lead, key, val)

    lead.updated_at = datetime.now(timezone.utc)
    await db.commit()
    await db.refresh(lead)
    return _lead_to_dict(lead)


async def delete_lead(db: AsyncSession, lead_id: uuid.UUID) -> bool:
    """Soft-delete lead by marking status as CLOSED."""
    lead = await get_lead(db, lead_id)
    if not lead:
        return False
    lead.status = LeadStatus.CLOSED
    await db.commit()
    return True


async def get_lead_details(db: AsyncSession, lead_id: uuid.UUID) -> Optional[Dict[str, Any]]:
    """Get lead profile with complete call logs, follow-ups, documents, and loan apps."""
    lead = await get_lead(db, lead_id)
    if not lead:
        return None

    # Call logs
    calls_res = await db.execute(
        select(CallLog)
        .options(selectinload(CallLog.employee).selectinload(Employee.user))
        .where(CallLog.lead_id == lead_id)
        .order_by(desc(CallLog.call_datetime))
    )
    calls = calls_res.scalars().all()

    # Follow ups
    followups_res = await db.execute(
        select(FollowUp)
        .options(selectinload(FollowUp.employee).selectinload(Employee.user))
        .where(FollowUp.lead_id == lead_id)
        .order_by(desc(FollowUp.scheduled_date))
    )
    followups = followups_res.scalars().all()

    # Documents
    docs_res = await db.execute(
        select(Document)
        .options(
            selectinload(Document.uploaded_by_employee).selectinload(Employee.user),
            selectinload(Document.verified_by_user),
        )
        .where(Document.lead_id == lead_id)
        .order_by(desc(Document.created_at))
    )
    docs = docs_res.scalars().all()

    # Applications
    apps_res = await db.execute(
        select(LoanApplication)
        .options(
            selectinload(LoanApplication.bank),
            selectinload(LoanApplication.loan_scheme),
            selectinload(LoanApplication.employee).selectinload(Employee.user),
        )
        .where(LoanApplication.lead_id == lead_id)
        .order_by(desc(LoanApplication.created_at))
    )
    apps = apps_res.scalars().all()

    return {
        "lead": _lead_to_dict(lead),
        "calls": [
            {
                "id": c.id,
                "call_datetime": c.call_datetime,
                "duration_seconds": c.duration_seconds,
                "outcome": c.outcome.value if hasattr(c.outcome, "value") else str(c.outcome),
                "remarks": c.remarks,
                "next_follow_up_date": c.next_follow_up_date,
                "employee_name": c.employee.user.full_name if c.employee and c.employee.user else "Unknown",
            }
            for c in calls
        ],
        "follow_ups": [
            {
                "id": f.id,
                "scheduled_date": f.scheduled_date,
                "completed_date": f.completed_date,
                "status": f.status.value if hasattr(f.status, "value") else str(f.status),
                "remarks": f.remarks,
                "employee_name": f.employee.user.full_name if f.employee and f.employee.user else "Unknown",
                "created_at": f.created_at,
            }
            for f in followups
        ],
        "documents": [
            {
                "id": d.id,
                "category": d.category.value if hasattr(d.category, "value") else str(d.category),
                "file_name": d.file_name,
                "file_size": d.file_size,
                "mime_type": d.mime_type,
                "verification_status": d.verification_status.value if hasattr(d.verification_status, "value") else str(d.verification_status),
                "verified_by_name": d.verified_by_user.full_name if d.verified_by_user else None,
                "verified_at": d.verified_at,
                "rejection_remarks": d.rejection_remarks,
                "created_at": d.created_at,
            }
            for d in docs
        ],
        "applications": [
            {
                "id": a.id,
                "bank_name": a.bank.name if a.bank else "Unknown",
                "scheme_name": a.loan_scheme.scheme_name if a.loan_scheme else "N/A",
                "requested_amount": float(a.requested_amount),
                "approved_amount": float(a.approved_amount) if a.approved_amount else None,
                "status": a.status.value if hasattr(a.status, "value") else str(a.status),
                "application_date": a.application_date,
                "remarks": a.remarks,
            }
            for a in apps
        ],
    }


async def assign_single_lead(
    db: AsyncSession, lead_id: uuid.UUID, employee_id: uuid.UUID, admin_id: uuid.UUID
) -> bool:
    """Assign a single lead to an employee."""
    lead = await get_lead(db, lead_id)
    if not lead:
        return False

    emp_res = await db.execute(select(Employee).where(Employee.id == employee_id, Employee.is_active == True))
    employee = emp_res.scalars().first()
    if not employee:
        raise ValueError("Target employee is inactive or does not exist")

    # Deactivate previous active assignment
    old_assign_res = await db.execute(
        select(LeadAssignment).where(LeadAssignment.lead_id == lead_id, LeadAssignment.is_active == True)
    )
    for old_assign in old_assign_res.scalars().all():
        old_assign.is_active = False
        old_assign.unassigned_at = datetime.now(timezone.utc)

    assignment = LeadAssignment(
        lead_id=lead_id,
        employee_id=employee_id,
        assigned_by=admin_id,
        is_active=True,
    )
    db.add(assignment)

    lead.assigned_employee_id = employee_id
    if lead.status == LeadStatus.NEW:
        lead.status = LeadStatus.ASSIGNED

    await db.commit()
    return True


async def bulk_assign_leads(
    db: AsyncSession,
    lead_ids: List[uuid.UUID],
    employee_ids: List[uuid.UUID],
    method: str,
    admin_id: uuid.UUID,
) -> Dict[str, Any]:
    """Bulk distribute leads using equal or round-robin strategy."""
    if not lead_ids or not employee_ids:
        return {"assigned_count": 0, "distribution": {}}

    # Fetch active employees
    emp_res = await db.execute(
        select(Employee).options(selectinload(Employee.user)).where(Employee.id.in_(employee_ids), Employee.is_active == True)
    )
    active_employees = emp_res.scalars().all()
    if not active_employees:
        raise ValueError("No active employees selected")

    distribution: Dict[str, int] = {str(e.id): 0 for e in active_employees}
    assigned_count = 0
    now = datetime.now(timezone.utc)

    num_emps = len(active_employees)

    for i, lead_id in enumerate(lead_ids):
        # Determine target employee
        if method == "round_robin" or method == "equal":
            target_emp = active_employees[i % num_emps]
        else:
            target_emp = active_employees[0]

        lead = await get_lead(db, lead_id)
        if not lead:
            continue

        # Deactivate previous assignments
        prev_assign_res = await db.execute(
            select(LeadAssignment).where(LeadAssignment.lead_id == lead_id, LeadAssignment.is_active == True)
        )
        for prev in prev_assign_res.scalars().all():
            prev.is_active = False
            prev.unassigned_at = now

        assignment = LeadAssignment(
            lead_id=lead_id,
            employee_id=target_emp.id,
            assigned_by=admin_id,
            is_active=True,
        )
        db.add(assignment)

        lead.assigned_employee_id = target_emp.id
        if lead.status == LeadStatus.NEW:
            lead.status = LeadStatus.ASSIGNED

        distribution[str(target_emp.id)] += 1
        assigned_count += 1

    await db.commit()
    return {"assigned_count": assigned_count, "distribution": distribution}


async def bulk_import_csv(
    db: AsyncSession, file_bytes: bytes, admin_id: uuid.UUID
) -> LeadBulkUploadResponse:
    """Parse CSV, detect duplicates by phone, validate, and bulk insert."""
    try:
        df = pd.read_csv(io.BytesIO(file_bytes))
    except Exception as e:
        return LeadBulkUploadResponse(total=0, created=0, duplicates=0, errors=[f"Invalid CSV file: {str(e)}"])

    # Standardize column headers
    df.columns = [str(c).strip().lower().replace(" ", "_") for c in df.columns]

    required_cols = ["customer_name", "phone", "city", "state", "monthly_income", "loan_type", "requested_amount"]
    missing = [col for col in required_cols if col not in df.columns]
    if missing:
        return LeadBulkUploadResponse(
            total=len(df),
            created=0,
            duplicates=0,
            errors=[f"Missing required columns in CSV: {', '.join(missing)}"],
        )

    # Fetch all existing phone numbers in DB
    phones_res = await db.execute(select(Lead.phone))
    existing_phones = set(p.strip() for (p,) in phones_res.all() if p)

    created = 0
    duplicates = 0
    errors = []

    for idx, row in df.iterrows():
        try:
            phone_str = str(row["phone"]).strip().split(".")[0]  # remove trailing .0 if float
            if not phone_str or phone_str == "nan":
                errors.append(f"Row {idx + 2}: Phone number is required")
                continue

            if phone_str in existing_phones:
                duplicates += 1
                continue

            existing_phones.add(phone_str)

            lead = Lead(
                customer_name=str(row["customer_name"]).strip(),
                phone=phone_str,
                email=str(row.get("email")).strip() if pd.notna(row.get("email")) else None,
                city=str(row.get("city", "Unknown")).strip(),
                state=str(row.get("state", "Unknown")).strip(),
                employment_type=str(row.get("employment_type", "salaried")).strip().lower(),
                monthly_income=float(row.get("monthly_income", 0)),
                loan_type=str(row.get("loan_type", "Personal Loan")).strip(),
                requested_amount=float(row.get("requested_amount", 100000)),
                preferred_bank=str(row.get("preferred_bank")).strip() if pd.notna(row.get("preferred_bank")) else None,
                lead_source=str(row.get("lead_source", "Web")).strip(),
                priority=str(row.get("priority", "medium")).strip().lower(),
                status=LeadStatus.NEW,
            )
            db.add(lead)
            created += 1
        except Exception as ex:
            errors.append(f"Row {idx + 2}: {str(ex)}")

    await db.commit()
    return LeadBulkUploadResponse(
        total=len(df),
        created=created,
        duplicates=duplicates,
        errors=errors[:20],
    )


def generate_csv_template() -> str:
    """Return CSV template content for lead imports."""
    headers = [
        "customer_name",
        "phone",
        "email",
        "city",
        "state",
        "employment_type",
        "monthly_income",
        "loan_type",
        "requested_amount",
        "preferred_bank",
        "lead_source",
        "priority",
    ]
    sample = [
        "Aarav Sharma",
        "9876543210",
        "aarav.sharma@example.com",
        "Mumbai",
        "Maharashtra",
        "salaried",
        "75000",
        "Personal Loan",
        "500000",
        "HDFC Bank",
        "Google Ads",
        "high",
    ]
    return ",".join(headers) + "\n" + ",".join(sample) + "\n"


async def export_leads_csv(db: AsyncSession, employee_id: Optional[uuid.UUID] = None) -> str:
    """Export all or assigned leads to CSV format."""
    query = select(Lead).options(selectinload(Lead.assigned_employee).selectinload(Employee.user))
    if employee_id:
        query = query.where(Lead.assigned_employee_id == employee_id)
    query = query.order_by(desc(Lead.created_at))

    res = await db.execute(query)
    leads = res.scalars().all()

    rows = []
    for l in leads:
        emp = l.assigned_employee.user.full_name if l.assigned_employee and l.assigned_employee.user else "Unassigned"
        rows.append({
            "Lead ID": str(l.id),
            "Customer Name": l.customer_name,
            "Phone": l.phone,
            "Email": l.email or "",
            "City": l.city,
            "State": l.state,
            "Employment Type": l.employment_type.value if hasattr(l.employment_type, "value") else str(l.employment_type),
            "Monthly Income": float(l.monthly_income),
            "Loan Type": l.loan_type,
            "Requested Amount": float(l.requested_amount),
            "Preferred Bank": l.preferred_bank or "",
            "Lead Source": l.lead_source,
            "Priority": l.priority.value if hasattr(l.priority, "value") else str(l.priority),
            "Status": l.status.value if hasattr(l.status, "value") else str(l.status),
            "Assigned Employee": emp,
            "Created Date": l.created_at.isoformat() if l.created_at else "",
        })

    df = pd.DataFrame(rows)
    return df.to_csv(index=False)
