"""Lead schemas for CRUD, bulk upload, and assignment operations."""

from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, EmailStr, field_validator


class LeadBase(BaseModel):
    """Base lead fields shared across schemas."""

    customer_name: str
    phone: str
    email: Optional[EmailStr] = None
    city: str
    state: str
    employment_type: str
    monthly_income: float
    loan_type: str
    requested_amount: float
    preferred_bank: Optional[str] = None
    lead_source: str
    priority: str = "medium"

    @field_validator("email", mode="before")
    @classmethod
    def empty_email_to_none(cls, v):
        if not v or (isinstance(v, str) and not v.strip()):
            return None
        return v


class LeadCreate(LeadBase):
    """Schema for creating a new lead."""

    pass


class LeadUpdate(BaseModel):
    """Schema for updating lead fields (all optional)."""

    customer_name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    city: Optional[str] = None
    state: Optional[str] = None
    employment_type: Optional[str] = None
    monthly_income: Optional[float] = None
    loan_type: Optional[str] = None
    requested_amount: Optional[float] = None
    preferred_bank: Optional[str] = None
    lead_source: Optional[str] = None
    priority: Optional[str] = None
    status: Optional[str] = None

    @field_validator("email", mode="before")
    @classmethod
    def empty_email_to_none(cls, v):
        if not v or (isinstance(v, str) and not v.strip()):
            return None
        return v


class LeadResponse(LeadBase):
    """Schema for lead responses returned from the API."""

    model_config = ConfigDict(from_attributes=True)

    id: UUID
    assigned_employee_id: Optional[UUID] = None
    assigned_employee_name: Optional[str] = None
    status: str
    last_contact_date: Optional[datetime] = None
    created_at: datetime
    updated_at: Optional[datetime] = None


class LeadBulkUploadResponse(BaseModel):
    """Response after a bulk lead upload operation."""

    total: int
    created: int
    duplicates: int
    errors: list[str] = []


class LeadAssignRequest(BaseModel):
    """Request to assign leads to a single employee."""

    lead_ids: list[UUID]
    employee_id: UUID


class LeadBulkAssignRequest(BaseModel):
    """Request to assign leads across multiple employees."""

    lead_ids: list[UUID]
    employee_ids: list[UUID]
    method: str = "equal"


class LeadAssignmentResponse(BaseModel):
    """Response for a single lead assignment record."""

    model_config = ConfigDict(from_attributes=True)

    id: UUID
    lead_id: UUID
    employee_id: UUID
    assigned_by: UUID
    assigned_at: datetime
