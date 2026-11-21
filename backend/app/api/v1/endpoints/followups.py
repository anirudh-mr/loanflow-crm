"""Follow-up management endpoints."""

import uuid
from datetime import date
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_current_active_user, get_db
from app.models.user import User
from app.schemas.common import MessageResponse, PaginatedResponse
from app.schemas.follow_up import FollowUpCreate, FollowUpResponse
from app.services import employee_service, follow_up_service

router = APIRouter()


class CompleteFollowUpRequest(BaseModel):
    remarks: Optional[str] = None


class RescheduleFollowUpRequest(BaseModel):
    new_date: date
    remarks: Optional[str] = None


@router.get("", response_model=PaginatedResponse[FollowUpResponse])
async def list_follow_ups(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    status: Optional[str] = None,
    filter_type: Optional[str] = None,  # upcoming, overdue, today, completed
    employee_id: Optional[uuid.UUID] = None,
    date_from: Optional[date] = None,
    date_to: Optional[date] = None,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """List follow-ups."""
    role_val = current_user.role.value if hasattr(current_user.role, "value") else str(current_user.role)
    target_emp_id = employee_id

    if role_val != "admin":
        emp = await employee_service.get_employee_by_user_id(db, current_user.id)
        if not emp:
            raise HTTPException(status_code=403, detail="Employee record not found")
        target_emp_id = emp.id

    skip = (page - 1) * page_size
    items, total = await follow_up_service.get_follow_ups(
        db,
        skip=skip,
        limit=page_size,
        employee_id=target_emp_id,
        status=status,
        filter_type=filter_type,
        date_from=date_from,
        date_to=date_to,
    )
    pages = (total + page_size - 1) // page_size if total > 0 else 1
    return PaginatedResponse(items=items, total=total, page=page, page_size=page_size, pages=pages)


@router.post("", response_model=FollowUpResponse, status_code=status.HTTP_201_CREATED)
async def create_follow_up(
    data: FollowUpCreate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Schedule a new follow-up."""
    emp = await employee_service.get_employee_by_user_id(db, current_user.id)
    if not emp:
        raise HTTPException(status_code=403, detail="Employee record not found")

    try:
        return await follow_up_service.create_follow_up(db, data, emp.id)
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))


@router.patch("/{id}/complete", response_model=FollowUpResponse)
async def complete_follow_up(
    id: uuid.UUID,
    data: CompleteFollowUpRequest,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Mark follow-up as completed."""
    res = await follow_up_service.complete_follow_up(db, id, remarks=data.remarks)
    if not res:
        raise HTTPException(status_code=404, detail="Follow-up not found")
    return res


@router.patch("/{id}/reschedule", response_model=FollowUpResponse)
async def reschedule_follow_up(
    id: uuid.UUID,
    data: RescheduleFollowUpRequest,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Reschedule follow-up to a new date."""
    res = await follow_up_service.reschedule_follow_up(
        db, id, new_date=data.new_date, remarks=data.remarks
    )
    if not res:
        raise HTTPException(status_code=404, detail="Follow-up not found")
    return res
