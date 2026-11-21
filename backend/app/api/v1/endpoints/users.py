"""User administration endpoints."""

import uuid
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_admin_user, get_db
from app.models.user import User
from app.schemas.common import MessageResponse, PaginatedResponse
from app.schemas.user import UserCreate, UserResponse, UserUpdate
from app.services import auth_service

router = APIRouter()


@router.get("", response_model=PaginatedResponse[UserResponse])
async def list_users(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: Optional[str] = None,
    admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    """List users (Admin only)."""
    skip = (page - 1) * page_size
    query = select(User)
    if search:
        query = query.where(User.full_name.ilike(f"%{search}%") | User.email.ilike(f"%{search}%"))

    count_q = select(func.count(User.id))
    if search:
        count_q = count_q.where(User.full_name.ilike(f"%{search}%") | User.email.ilike(f"%{search}%"))

    total = (await db.execute(count_q)).scalar() or 0
    res = await db.execute(query.order_by(User.full_name).offset(skip).limit(page_size))
    users = res.scalars().all()

    items = [
        UserResponse(
            id=u.id,
            email=u.email,
            full_name=u.full_name,
            phone=u.phone,
            role=u.role.value if hasattr(u.role, "value") else str(u.role),
            is_active=u.is_active,
            created_at=u.created_at,
        )
        for u in users
    ]

    pages = (total + page_size - 1) // page_size if total > 0 else 1
    return PaginatedResponse(items=items, total=total, page=page, page_size=page_size, pages=pages)


@router.post("", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def create_user(
    data: UserCreate,
    admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a new user (Admin only)."""
    existing = await db.execute(select(User).where(User.email == data.email.lower()))
    if existing.scalars().first():
        raise HTTPException(status_code=400, detail="Email is already registered")

    user = await auth_service.create_user(db, data)
    role_val = user.role.value if hasattr(user.role, "value") else str(user.role)
    return UserResponse(
        id=user.id,
        email=user.email,
        full_name=user.full_name,
        phone=user.phone,
        role=role_val,
        is_active=user.is_active,
        created_at=user.created_at,
    )
