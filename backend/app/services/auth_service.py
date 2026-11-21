"""Authentication service."""

from typing import Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.security import get_password_hash, verify_password
from app.models.user import User, UserRole
from app.schemas.user import UserCreate


async def authenticate_user(
    db: AsyncSession, email: str, password: str
) -> Optional[User]:
    """Authenticate a user by email and password."""
    result = await db.execute(
        select(User).options(selectinload(User.employee)).where(User.email == email.lower())
    )
    user = result.scalars().first()
    if not user or not user.is_active:
        return None
    if not verify_password(password, user.password_hash):
        return None
    return user


async def create_user(db: AsyncSession, user_data: UserCreate) -> User:
    """Create a new user."""
    role = UserRole.ADMIN if user_data.role.lower() == "admin" else UserRole.STAFF
    user = User(
        email=user_data.email.lower(),
        password_hash=get_password_hash(user_data.password),
        full_name=user_data.full_name,
        phone=user_data.phone,
        role=role,
        is_active=True,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user
