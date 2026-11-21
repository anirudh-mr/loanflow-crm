"""Call log endpoints."""

import uuid
from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_current_active_user, get_db
from app.models.user import User
from app.schemas.call_log import CallLogCreate, CallLogResponse
from app.schemas.common import PaginatedResponse
from app.services import call_service, employee_service

router = APIRouter()


@router.get("", response_model=PaginatedResponse[CallLogResponse])
async def list_calls(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    employee_id: Optional[uuid.UUID] = None,
    lead_id: Optional[uuid.UUID] = None,
    outcome: Optional[str] = None,
    date_from: Optional[datetime] = None,
    date_to: Optional[datetime] = None,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """List call logs. Staff only see their own calls; Admin can filter all calls."""
    role_val = current_user.role.value if hasattr(current_user.role, "value") else str(current_user.role)
    target_emp_id = employee_id

    if role_val != "admin":
        emp = await employee_service.get_employee_by_user_id(db, current_user.id)
        if not emp:
            raise HTTPException(status_code=403, detail="Employee record not found")
        target_emp_id = emp.id

    skip = (page - 1) * page_size
    items, total = await call_service.get_call_logs(
        db,
        skip=skip,
        limit=page_size,
        employee_id=target_emp_id,
        lead_id=lead_id,
        outcome=outcome,
        date_from=date_from,
        date_to=date_to,
    )
    pages = (total + page_size - 1) // page_size if total > 0 else 1
    return PaginatedResponse(items=items, total=total, page=page, page_size=page_size, pages=pages)


@router.post("", response_model=CallLogResponse, status_code=status.HTTP_201_CREATED)
async def create_call(
    data: CallLogCreate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Record customer call and update lead & daily progress (Staff)."""
    emp = await employee_service.get_employee_by_user_id(db, current_user.id)
    if not emp:
        raise HTTPException(
            status_code=403, detail="Only staff members with an employee profile can log calls"
        )

    try:
        call = await call_service.create_call_log(db, data, emp)
        return call
    except PermissionError as pe:
        raise HTTPException(status_code=403, detail=str(pe))
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))


@router.get("/progress")
async def get_my_call_progress(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Get today's 100-call progress for the authenticated employee."""
    emp = await employee_service.get_employee_by_user_id(db, current_user.id)
    if not emp:
        raise HTTPException(status_code=404, detail="Employee profile not found")

    return await call_service.get_daily_call_progress(db, emp.id)
