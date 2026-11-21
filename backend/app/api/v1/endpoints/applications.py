"""Loan application endpoints."""

import uuid
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_admin_user, get_current_active_user, get_db
from app.models.employee import Employee
from app.models.user import User
from app.schemas.common import PaginatedResponse
from app.schemas.loan_application import (
    LoanApplicationCreate,
    LoanApplicationResponse,
    LoanApplicationUpdate,
)
from app.services import employee_service, lead_service, loan_application_service

router = APIRouter()


class StatusUpdateRequest(BaseModel):
    status: str
    remarks: Optional[str] = None
    approved_amount: Optional[float] = None


@router.get("", response_model=PaginatedResponse[LoanApplicationResponse])
async def list_applications(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    status: Optional[str] = None,
    bank_id: Optional[uuid.UUID] = None,
    lead_id: Optional[uuid.UUID] = None,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """List loan applications."""
    role_val = current_user.role.value if hasattr(current_user.role, "value") else str(current_user.role)
    target_emp_id = None
    if role_val != "admin":
        emp = await employee_service.get_employee_by_user_id(db, current_user.id)
        if emp:
            target_emp_id = emp.id

    skip = (page - 1) * page_size
    items, total = await loan_application_service.get_applications(
        db,
        skip=skip,
        limit=page_size,
        status=status,
        bank_id=bank_id,
        employee_id=target_emp_id,
        lead_id=lead_id,
    )
    pages = (total + page_size - 1) // page_size if total > 0 else 1
    return PaginatedResponse(items=items, total=total, page=page, page_size=page_size, pages=pages)


@router.post("", response_model=LoanApplicationResponse, status_code=status.HTTP_201_CREATED)
async def create_application(
    data: LoanApplicationCreate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Create loan application (Staff/Admin)."""
    emp = await employee_service.get_employee_by_user_id(db, current_user.id)
    target_emp_id = emp.id if emp else None

    if not target_emp_id:
        lead = await lead_service.get_lead(db, data.lead_id)
        if lead and lead.assigned_employee_id:
            target_emp_id = lead.assigned_employee_id
        else:
            first_emp = await db.execute(select(Employee).where(Employee.is_active == True))
            emp_rec = first_emp.scalars().first()
            if emp_rec:
                target_emp_id = emp_rec.id

    if not target_emp_id:
        raise HTTPException(status_code=400, detail="No active employee profile available for assignment")

    try:
        return await loan_application_service.create_application(db, data, target_emp_id)
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))


@router.get("/{id}")
async def get_application_details(
    id: uuid.UUID,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Get complete application detail with documents and status timeline."""
    details = await loan_application_service.get_application_details(db, id)
    if not details:
        raise HTTPException(status_code=404, detail="Application not found")

    role_val = current_user.role.value if hasattr(current_user.role, "value") else str(current_user.role)
    if role_val != "admin":
        emp = await employee_service.get_employee_by_user_id(db, current_user.id)
        if not emp or details["application"]["employee_id"] != emp.id:
            raise HTTPException(status_code=403, detail="Access denied")

    return details


@router.patch("/{id}/status", response_model=LoanApplicationResponse)
async def update_application_status(
    id: uuid.UUID,
    data: StatusUpdateRequest,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Transition application status and record in status history."""
    role_val = current_user.role.value if hasattr(current_user.role, "value") else str(current_user.role)
    # Admin can change any status; Staff can change draft -> ready_for_submission / documents_pending
    if role_val != "admin":
        if data.status.lower() in ("approved", "disbursed", "rejected"):
            raise HTTPException(status_code=403, detail="Only admins can approve/disburse/reject applications")

    res = await loan_application_service.update_application_status(
        db,
        app_id=id,
        new_status=data.status,
        remarks=data.remarks,
        user=current_user,
        approved_amount=data.approved_amount,
    )
    if not res:
        raise HTTPException(status_code=404, detail="Application not found")
    return res
