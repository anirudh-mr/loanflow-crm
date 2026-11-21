"""Loan scheme schemas for bank product offerings."""

from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class LoanSchemeBase(BaseModel):
    """Base loan scheme fields."""

    bank_id: UUID
    scheme_name: str
    loan_category: str
    min_amount: float
    max_amount: float
    interest_rate: float
    min_tenure_months: int
    max_tenure_months: int
    eligibility_info: Optional[str] = None


class LoanSchemeCreate(LoanSchemeBase):
    """Schema for creating a new loan scheme."""

    pass


class LoanSchemeUpdate(BaseModel):
    """Schema for updating loan scheme fields (all optional)."""

    scheme_name: Optional[str] = None
    loan_category: Optional[str] = None
    min_amount: Optional[float] = None
    max_amount: Optional[float] = None
    interest_rate: Optional[float] = None
    min_tenure_months: Optional[int] = None
    max_tenure_months: Optional[int] = None
    eligibility_info: Optional[str] = None


class LoanSchemeResponse(LoanSchemeBase):
    """Schema for loan scheme responses returned from the API."""

    model_config = ConfigDict(from_attributes=True)

    id: UUID
    bank_name: Optional[str] = None
    is_active: bool
    created_at: datetime
