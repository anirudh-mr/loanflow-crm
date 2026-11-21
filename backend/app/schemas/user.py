"""User schemas for CRUD operations and responses."""

from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, EmailStr


class UserBase(BaseModel):
    """Base user fields shared across schemas."""

    email: EmailStr
    full_name: str
    phone: Optional[str] = None


class UserCreate(UserBase):
    """Schema for creating a new user."""

    password: str
    role: str


class UserUpdate(BaseModel):
    """Schema for updating user fields (all optional)."""

    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    phone: Optional[str] = None
    role: Optional[str] = None
    is_active: Optional[bool] = None


class UserResponse(UserBase):
    """Schema for user responses returned from the API."""

    model_config = ConfigDict(from_attributes=True)

    id: UUID
    role: str
    is_active: bool
    created_at: datetime


class PasswordReset(BaseModel):
    """Schema for resetting a user's password."""

    new_password: str
