"""Bank management endpoints."""

import uuid
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_admin_user, get_current_active_user, get_db
from app.models.user import User
from app.schemas.bank import BankCreate, BankResponse, BankUpdate
from app.schemas.common import PaginatedResponse
from app.services import bank_service

router = APIRouter()


@router.get("", response_model=PaginatedResponse[BankResponse])
async def list_banks(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    is_active: Optional[bool] = None,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """List partner banks."""
    skip = (page - 1) * page_size
    items, total = await bank_service.get_banks(db, skip=skip, limit=page_size, is_active=is_active)
    pages = (total + page_size - 1) // page_size if total > 0 else 1
    return PaginatedResponse(items=items, total=total, page=page, page_size=page_size, pages=pages)


@router.post("", response_model=BankResponse, status_code=status.HTTP_201_CREATED)
async def create_bank(
    data: BankCreate,
    admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    """Register partner bank (Admin only)."""
    try:
        return await bank_service.create_bank(db, data)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.put("/{id}", response_model=BankResponse)
async def update_bank(
    id: uuid.UUID,
    data: BankUpdate,
    admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    """Update bank details (Admin only)."""
    res = await bank_service.update_bank(db, id, data)
    if not res:
        raise HTTPException(status_code=404, detail="Bank not found")
    return res


@router.patch("/{id}/toggle-status", response_model=BankResponse)
async def toggle_bank_status(
    id: uuid.UUID,
    admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    """Toggle bank active status (Admin only)."""
    res = await bank_service.toggle_bank_status(db, id)
    if not res:
        raise HTTPException(status_code=404, detail="Bank not found")
    return res
