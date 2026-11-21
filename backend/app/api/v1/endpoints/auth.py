"""Authentication endpoints."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_current_active_user, get_db
from app.core.security import create_access_token
from app.models.user import User
from app.schemas.auth import LoginRequest, TokenResponse
from app.schemas.common import MessageResponse
from app.schemas.user import UserResponse
from app.services import auth_service

router = APIRouter()


@router.post("/login", response_model=TokenResponse)
async def login(
    credentials: LoginRequest,
    db: AsyncSession = Depends(get_db),
):
    """Authenticate user with email and password, returning JWT access token."""
    user = await auth_service.authenticate_user(
        db, email=credentials.email, password=credentials.password
    )
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    role_val = user.role.value if hasattr(user.role, "value") else str(user.role)
    access_token = create_access_token(
        data={"sub": str(user.id), "role": role_val, "email": user.email}
    )

    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse(
            id=user.id,
            email=user.email,
            full_name=user.full_name,
            phone=user.phone,
            role=role_val,
            is_active=user.is_active,
            created_at=user.created_at,
        ),
    )


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_active_user)):
    """Get profile of current logged-in user."""
    role_val = current_user.role.value if hasattr(current_user.role, "value") else str(current_user.role)
    return UserResponse(
        id=current_user.id,
        email=current_user.email,
        full_name=current_user.full_name,
        phone=current_user.phone,
        role=role_val,
        is_active=current_user.is_active,
        created_at=current_user.created_at,
    )


@router.post("/logout", response_model=MessageResponse)
async def logout(current_user: User = Depends(get_current_active_user)):
    """User logout."""
    return MessageResponse(message="Successfully logged out")
