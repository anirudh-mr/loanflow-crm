"""Employee management service."""

import uuid
from datetime import date, datetime, timezone
from typing import List, Optional, Tuple
from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.security import get_password_hash
from app.models.call_log import CallLog, CallOutcome
from app.models.employee import Employee
from app.models.follow_up import FollowUp, FollowUpStatus
from app.models.lead import Lead, LeadStatus
from app.models.loan_application import ApplicationStatus, LoanApplication
from app.models.user import User, UserRole
from app.schemas.employee import EmployeeCreate, EmployeePerformance, EmployeeUpdate


async def get_employees(
    db: AsyncSession,
    skip: int = 0,
    limit: int = 50,
    search: Optional[str] = None,
    is_active: Optional[bool] = None,
) -> Tuple[List[Employee], int]:
    """List employees with pagination and filters."""
    query = select(Employee).join(Employee.user).options(selectinload(Employee.user))

    if is_active is not None:
        query = query.where(Employee.is_active == is_active)

    if search:
        pattern = f"%{search}%"
        query = query.where(
            or_(
                Employee.employee_id.ilike(pattern),
                User.full_name.ilike(pattern),
                User.email.ilike(pattern),
                Employee.department.ilike(pattern),
            )
        )

    # Count total
    count_query = select(func.count(Employee.id)).join(Employee.user)
    if is_active is not None:
        count_query = count_query.where(Employee.is_active == is_active)
    if search:
        pattern = f"%{search}%"
        count_query = count_query.where(
            or_(
                Employee.employee_id.ilike(pattern),
                User.full_name.ilike(pattern),
                User.email.ilike(pattern),
                Employee.department.ilike(pattern),
            )
        )

    total_res = await db.execute(count_query)
    total = total_res.scalar() or 0

    query = query.order_by(Employee.employee_id).offset(skip).limit(limit)
    res = await db.execute(query)
    employees = list(res.scalars().all())
    return employees, total


async def get_employee(db: AsyncSession, employee_id: uuid.UUID) -> Optional[Employee]:
    """Get employee by primary key UUID."""
    res = await db.execute(
        select(Employee).options(selectinload(Employee.user)).where(Employee.id == employee_id)
    )
    return res.scalars().first()


async def get_employee_by_user_id(db: AsyncSession, user_id: uuid.UUID) -> Optional[Employee]:
    """Get employee by user UUID."""
    res = await db.execute(
        select(Employee).options(selectinload(Employee.user)).where(Employee.user_id == user_id)
    )
    return res.scalars().first()


async def create_employee(db: AsyncSession, data: EmployeeCreate) -> Employee:
    """Create an employee and their corresponding user."""
    user = User(
        email=data.user.email.lower(),
        password_hash=get_password_hash(data.user.password),
        full_name=data.user.full_name,
        phone=data.user.phone,
        role=UserRole.STAFF,
        is_active=True,
    )
    db.add(user)
    await db.flush()

    employee = Employee(
        user_id=user.id,
        employee_id=data.employee_id,
        department=data.department,
        joining_date=data.joining_date,
        daily_call_target=data.daily_call_target,
        is_active=True,
    )
    db.add(employee)
    await db.commit()
    await db.refresh(employee)
    return employee


async def update_employee(
    db: AsyncSession, employee_id: uuid.UUID, data: EmployeeUpdate
) -> Optional[Employee]:
    """Update employee details."""
    employee = await get_employee(db, employee_id)
    if not employee:
        return None

    if data.employee_id is not None:
        employee.employee_id = data.employee_id
    if data.department is not None:
        employee.department = data.department
    if data.joining_date is not None:
        employee.joining_date = data.joining_date
    if data.daily_call_target is not None:
        employee.daily_call_target = data.daily_call_target

    await db.commit()
    await db.refresh(employee)
    return employee


async def toggle_employee_status(db: AsyncSession, employee_id: uuid.UUID) -> Optional[Employee]:
    """Activate or deactivate employee."""
    employee = await get_employee(db, employee_id)
    if not employee:
        return None
    employee.is_active = not employee.is_active
    if employee.user:
        employee.user.is_active = employee.is_active
    await db.commit()
    await db.refresh(employee)
    return employee


async def reset_employee_password(
    db: AsyncSession, employee_id: uuid.UUID, new_password: str
) -> bool:
    """Reset an employee's password."""
    employee = await get_employee(db, employee_id)
    if not employee or not employee.user:
        return False
    employee.user.password_hash = get_password_hash(new_password)
    await db.commit()
    return True


async def get_employee_performance(
    db: AsyncSession, employee_id: uuid.UUID, target_date: Optional[date] = None
) -> EmployeePerformance:
    """Calculate actual KPI metrics from real DB activity."""
    employee = await get_employee(db, employee_id)
    if not employee:
        raise ValueError("Employee not found")

    today = target_date or date.today()
    start_of_day = datetime(today.year, today.month, today.day, 0, 0, 0, tzinfo=timezone.utc)
    end_of_day = datetime(today.year, today.month, today.day, 23, 59, 59, tzinfo=timezone.utc)

    # Assigned leads count
    assigned_leads_res = await db.execute(
        select(func.count(Lead.id)).where(Lead.assigned_employee_id == employee.id)
    )
    assigned_leads = assigned_leads_res.scalar() or 0

    # Calls today count
    calls_res = await db.execute(
        select(func.count(CallLog.id)).where(
            CallLog.employee_id == employee.id,
            CallLog.call_datetime >= start_of_day,
            CallLog.call_datetime <= end_of_day,
        )
    )
    calls_today = calls_res.scalar() or 0

    target = employee.daily_call_target or 100
    remaining_calls = max(0, target - calls_today)
    target_pct = round((calls_today / target) * 100, 1) if target > 0 else 0.0

    # Interested leads
    interested_res = await db.execute(
        select(func.count(Lead.id)).where(
            Lead.assigned_employee_id == employee.id,
            Lead.status == LeadStatus.INTERESTED,
        )
    )
    interested_leads = interested_res.scalar() or 0

    # Follow-ups completed
    followups_res = await db.execute(
        select(func.count(FollowUp.id)).where(
            FollowUp.employee_id == employee.id,
            FollowUp.status == FollowUpStatus.COMPLETED,
        )
    )
    followups_completed = followups_res.scalar() or 0

    # Conversions
    conversions_res = await db.execute(
        select(func.count(LoanApplication.id)).where(
            LoanApplication.employee_id == employee.id,
            LoanApplication.status.in_([ApplicationStatus.APPROVED, ApplicationStatus.DISBURSED]),
        )
    )
    conversions = conversions_res.scalar() or 0

    return EmployeePerformance(
        employee_id=employee.employee_id,
        full_name=employee.user.full_name if employee.user else employee.employee_id,
        assigned_leads=assigned_leads,
        calls_today=calls_today,
        remaining_calls=remaining_calls,
        target_pct=target_pct,
        interested_leads=interested_leads,
        followups_completed=followups_completed,
        conversions=conversions,
    )
