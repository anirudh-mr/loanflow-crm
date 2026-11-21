"""Authentication schemas for login, tokens, and token data."""

from typing import Optional
from uuid import UUID

from pydantic import BaseModel, EmailStr

from .user import UserResponse


class LoginRequest(BaseModel):
    """Login request with email and password."""

    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    """Token response returned after successful authentication."""

    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class TokenData(BaseModel):
    """Data encoded within a JWT token."""

    user_id: Optional[UUID] = None
    role: Optional[str] = None
