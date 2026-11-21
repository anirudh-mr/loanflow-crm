"""Bank partner schemas for CRUD operations."""

from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, EmailStr, field_validator


class BankBase(BaseModel):
    """Base bank fields shared across schemas."""

    name: str
    code: str
    contact_person: Optional[str] = None
    contact_email: Optional[EmailStr] = None
    contact_phone: Optional[str] = None

    @field_validator("contact_email", mode="before")
    @classmethod
    def empty_contact_email_to_none(cls, v):
        if not v or (isinstance(v, str) and not v.strip()):
            return None
        return v


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

    @field_validator("contact_email", mode="before")
    @classmethod
    def empty_contact_email_to_none(cls, v):
        if not v or (isinstance(v, str) and not v.strip()):
            return None
        return v


class BankResponse(BankBase):
    """Schema for bank responses returned from the API."""

    model_config = ConfigDict(from_attributes=True)

    id: UUID
    is_active: bool
    created_at: datetime
