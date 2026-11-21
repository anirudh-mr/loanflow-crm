"""Bank partner schemas for CRUD operations."""

from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, EmailStr


class BankBase(BaseModel):
    """Base bank fields shared across schemas."""

    name: str
    code: str
    contact_person: Optional[str] = None
    contact_email: Optional[EmailStr] = None
    contact_phone: Optional[str] = None


class BankCreate(BankBase):
    """Schema for creating a new bank."""

    pass


class BankUpdate(BaseModel):
    """Schema for updating bank fields (all optional)."""

    name: Optional[str] = None
    code: Optional[str] = None
    contact_person: Optional[str] = None
    contact_email: Optional[EmailStr] = None
    contact_phone: Optional[str] = None


class BankResponse(BankBase):
    """Schema for bank responses returned from the API."""

    model_config = ConfigDict(from_attributes=True)

    id: UUID
    is_active: bool
    created_at: datetime
