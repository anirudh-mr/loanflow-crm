"""Employee schemas for CRUD, creation with user, and performance metrics."""

from datetime import date, datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict

from .user import UserCreate, UserResponse


class EmployeeBase(BaseModel):
    """Base employee fields."""

    employee_id: str
    department: Optional[str] = None
    joining_date: date
    daily_call_target: int = 100


class EmployeeCreate(EmployeeBase):
    """Schema for creating an employee along with their user account."""

    user: UserCreate


class EmployeeUpdate(BaseModel):
    """Schema for updating employee fields (all optional)."""

    employee_id: Optional[str] = None
    department: Optional[str] = None
    joining_date: Optional[date] = None
    daily_call_target: Optional[int] = None


class EmployeeResponse(EmployeeBase):
    """Schema for employee responses returned from the API."""

    model_config = ConfigDict(from_attributes=True)

    id: UUID
    user: UserResponse
    is_active: bool
    created_at: datetime


class EmployeePerformance(BaseModel):
    """Employee performance / KPI summary."""

    employee_id: str
    full_name: str
    assigned_leads: int = 0
    calls_today: int = 0
    remaining_calls: int = 0
    target_pct: float = 0.0
    interested_leads: int = 0
    followups_completed: int = 0
    conversions: int = 0
