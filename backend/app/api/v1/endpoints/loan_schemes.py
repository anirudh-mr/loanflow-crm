"""Loan scheme management endpoints."""

import uuid
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_admin_user, get_current_active_user, get_db
from app.models.user import User
from app.schemas.common import PaginatedResponse
from app.schemas.loan_scheme import (
    LoanSchemeCreate,
    LoanSchemeResponse,
    LoanSchemeUpdate,
)
from app.services import loan_scheme_service

router = APIRouter()


@router.get("", response_model=PaginatedResponse[LoanSchemeResponse])
async def list_loan_schemes(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    bank_id: Optional[uuid.UUID] = None,
    category: Optional[str] = None,
    is_active: Optional[bool] = None,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """List loan schemes with filters."""
    skip = (page - 1) * page_size
    items, total = await loan_scheme_service.get_schemes(
        db, skip=skip, limit=page_size, bank_id=bank_id, category=category, is_active=is_active
    )
    pages = (total + page_size - 1) // page_size if total > 0 else 1
    return PaginatedResponse(items=items, total=total, page=page, page_size=page_size, pages=pages)


@router.post("", response_model=LoanSchemeResponse, status_code=status.HTTP_201_CREATED)
async def create_loan_scheme(
    data: LoanSchemeCreate,
    admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    """Create loan scheme (Admin only)."""
    try:
        return await loan_scheme_service.create_scheme(db, data)
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))


@router.put("/{id}", response_model=LoanSchemeResponse)
async def update_loan_scheme(
    id: uuid.UUID,
    data: LoanSchemeUpdate,
    admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    """Update loan scheme (Admin only)."""
    res = await loan_scheme_service.update_scheme(db, id, data)
    if not res:
        raise HTTPException(status_code=404, detail="Loan scheme not found")
    return res


@router.patch("/{id}/toggle-status", response_model=LoanSchemeResponse)
async def toggle_scheme_status(
    id: uuid.UUID,
    admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    """Toggle scheme active status (Admin only)."""
    res = await loan_scheme_service.toggle_scheme_status(db, id)
    if not res:
        raise HTTPException(status_code=404, detail="Loan scheme not found")
    return res
