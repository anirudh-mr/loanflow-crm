"""Loan application schemas for submissions, updates, and status tracking."""

from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class LoanApplicationCreate(BaseModel):
    """Schema for creating a loan application."""

    lead_id: UUID
    bank_id: UUID
    loan_scheme_id: Optional[UUID] = None
    requested_amount: float
    remarks: Optional[str] = None


class LoanApplicationUpdate(BaseModel):
    """Schema for updating a loan application (all optional)."""

    status: Optional[str] = None
    approved_amount: Optional[float] = None
    remarks: Optional[str] = None


class LoanApplicationResponse(BaseModel):
    """Schema for loan application responses returned from the API."""

    model_config = ConfigDict(from_attributes=True)

    id: UUID
    lead_id: UUID
    customer_name: Optional[str] = None
    employee_id: UUID
    employee_name: Optional[str] = None
    bank_id: UUID
    bank_name: Optional[str] = None
    loan_scheme_id: Optional[UUID] = None
    scheme_name: Optional[str] = None
    requested_amount: float
    approved_amount: Optional[float] = None
    application_date: datetime
    status: str
    remarks: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None


class StatusHistoryResponse(BaseModel):
    """Schema for loan application status change history."""

    model_config = ConfigDict(from_attributes=True)

    id: UUID
    old_status: Optional[str] = None
    new_status: str
    changed_by_name: Optional[str] = None
    remarks: Optional[str] = None
    changed_at: datetime
