"""Employee management endpoints."""

import uuid
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_admin_user, get_current_active_user, get_db
from app.models.user import User
from app.schemas.common import MessageResponse, PaginatedResponse
from app.schemas.employee import (
    EmployeeCreate,
    EmployeePerformance,
    EmployeeResponse,
    EmployeeUpdate,
)
from app.schemas.user import PasswordReset, UserResponse
from app.services import employee_service

router = APIRouter()


def _format_employee_res(emp) -> EmployeeResponse:
    u = emp.user
    role_val = u.role.value if hasattr(u.role, "value") else str(u.role)
    user_res = UserResponse(
        id=u.id,
        email=u.email,
        full_name=u.full_name,
        phone=u.phone,
        role=role_val,
        is_active=u.is_active,
        created_at=u.created_at,
    )
    return EmployeeResponse(
        id=emp.id,
        employee_id=emp.employee_id,
        department=emp.department,
        joining_date=emp.joining_date,
        daily_call_target=emp.daily_call_target or 100,
        is_active=emp.is_active,
        created_at=getattr(emp, "created_at", None) or u.created_at,
        user=user_res,
    )


@router.get("", response_model=PaginatedResponse[EmployeeResponse])
async def list_employees(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: Optional[str] = None,
    is_active: Optional[bool] = None,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """List employees."""
    skip = (page - 1) * page_size
    employees, total = await employee_service.get_employees(
        db, skip=skip, limit=page_size, search=search, is_active=is_active
    )
    items = [_format_employee_res(e) for e in employees]
    pages = (total + page_size - 1) // page_size if total > 0 else 1
    return PaginatedResponse(items=items, total=total, page=page, page_size=page_size, pages=pages)


@router.get("/me/performance", response_model=EmployeePerformance)
async def get_my_performance(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Get authenticated staff's own KPI performance."""
    employee = await employee_service.get_employee_by_user_id(db, current_user.id)
    if not employee:
        raise HTTPException(status_code=404, detail="Employee profile not found")
    return await employee_service.get_employee_performance(db, employee.id)


@router.get("/{id}", response_model=EmployeeResponse)
async def get_employee(
    id: uuid.UUID,
    admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    """Get single employee by ID (Admin only)."""
    employee = await employee_service.get_employee(db, id)
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    return _format_employee_res(employee)


@router.post("", response_model=EmployeeResponse, status_code=status.HTTP_201_CREATED)
async def create_employee(
    data: EmployeeCreate,
    admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a new employee profile and user account (Admin only)."""
    try:
        employee = await employee_service.create_employee(db, data)
        return _format_employee_res(employee)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.put("/{id}", response_model=EmployeeResponse)
async def update_employee(
    id: uuid.UUID,
    data: EmployeeUpdate,
    admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    """Update employee details (Admin only)."""
    emp = await employee_service.update_employee(db, id, data)
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")
    return _format_employee_res(emp)


@router.patch("/{id}/toggle-status", response_model=EmployeeResponse)
async def toggle_employee_status(
    id: uuid.UUID,
    admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    """Activate / deactivate employee account (Admin only)."""
    emp = await employee_service.toggle_employee_status(db, id)
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")
    return _format_employee_res(emp)


@router.post("/{id}/reset-password", response_model=MessageResponse)
async def reset_employee_password(
    id: uuid.UUID,
    data: PasswordReset,
    admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    """Reset employee's password (Admin only)."""
    success = await employee_service.reset_employee_password(db, id, data.new_password)
    if not success:
        raise HTTPException(status_code=404, detail="Employee not found")
    return MessageResponse(message="Password reset successfully")


@router.get("/{id}/performance", response_model=EmployeePerformance)
async def get_employee_performance(
    id: uuid.UUID,
    admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    """Get employee performance KPI summary (Admin only)."""
    try:
        return await employee_service.get_employee_performance(db, id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
