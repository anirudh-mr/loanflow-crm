"""Loan scheme management service."""

import uuid
from typing import Any, Dict, List, Optional, Tuple
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.bank import Bank
from app.models.loan_scheme import LoanScheme
from app.schemas.loan_scheme import LoanSchemeCreate, LoanSchemeUpdate


def _scheme_to_dict(s: LoanScheme) -> Dict[str, Any]:
    bank_name = s.bank.name if s.bank else "Unknown Bank"
    return {
        "id": s.id,
        "bank_id": s.bank_id,
        "bank_name": bank_name,
        "scheme_name": s.scheme_name,
        "loan_category": s.loan_category,
        "min_amount": float(s.min_amount),
        "max_amount": float(s.max_amount),
        "interest_rate": float(s.interest_rate),
        "min_tenure_months": s.min_tenure_months,
        "max_tenure_months": s.max_tenure_months,
        "eligibility_info": s.eligibility_info,
        "is_active": s.is_active,
        "created_at": s.created_at,
    }


async def get_schemes(
    db: AsyncSession,
    skip: int = 0,
    limit: int = 50,
    bank_id: Optional[uuid.UUID] = None,
    category: Optional[str] = None,
    is_active: Optional[bool] = None,
) -> Tuple[List[Dict[str, Any]], int]:
    """List loan schemes with filtering."""
    query = select(LoanScheme).options(selectinload(LoanScheme.bank))

    if bank_id is not None:
        query = query.where(LoanScheme.bank_id == bank_id)
    if category is not None:
        query = query.where(LoanScheme.loan_category.ilike(f"%{category}%"))
    if is_active is not None:
        query = query.where(LoanScheme.is_active == is_active)

    count_query = select(func.count(LoanScheme.id))
    if bank_id is not None:
        count_query = count_query.where(LoanScheme.bank_id == bank_id)
    if category is not None:
        count_query = count_query.where(LoanScheme.loan_category.ilike(f"%{category}%"))
    if is_active is not None:
        count_query = count_query.where(LoanScheme.is_active == is_active)

    total_res = await db.execute(count_query)
    total = total_res.scalar() or 0

    query = query.order_by(LoanScheme.scheme_name).offset(skip).limit(limit)
    res = await db.execute(query)
    schemes = res.scalars().all()
    return [_scheme_to_dict(s) for s in schemes], total


async def get_scheme(db: AsyncSession, scheme_id: uuid.UUID) -> Optional[LoanScheme]:
    """Get scheme by ID."""
    res = await db.execute(
        select(LoanScheme).options(selectinload(LoanScheme.bank)).where(LoanScheme.id == scheme_id)
    )
    return res.scalars().first()


async def create_scheme(db: AsyncSession, data: LoanSchemeCreate) -> Dict[str, Any]:
    """Create loan scheme."""
    bank_res = await db.execute(select(Bank).where(Bank.id == data.bank_id))
    bank = bank_res.scalars().first()
    if not bank:
        raise ValueError("Bank not found")

    scheme = LoanScheme(
        bank_id=data.bank_id,
        scheme_name=data.scheme_name,
        loan_category=data.loan_category,
        min_amount=data.min_amount,
        max_amount=data.max_amount,
        interest_rate=data.interest_rate,
        min_tenure_months=data.min_tenure_months,
        max_tenure_months=data.max_tenure_months,
        eligibility_info=data.eligibility_info,
        is_active=True,
    )
    db.add(scheme)
    await db.commit()
    await db.refresh(scheme)

    res = await db.execute(
        select(LoanScheme).options(selectinload(LoanScheme.bank)).where(LoanScheme.id == scheme.id)
    )
    loaded = res.scalars().first()
    return _scheme_to_dict(loaded or scheme)


async def update_scheme(
    db: AsyncSession, scheme_id: uuid.UUID, data: LoanSchemeUpdate
) -> Optional[Dict[str, Any]]:
    """Update loan scheme."""
    scheme = await get_scheme(db, scheme_id)
    if not scheme:
        return None

    update_dict = data.model_dump(exclude_unset=True)
    for k, v in update_dict.items():
        if v is not None:
            setattr(scheme, k, v)

    await db.commit()
    await db.refresh(scheme)
    return _scheme_to_dict(scheme)


async def toggle_scheme_status(
    db: AsyncSession, scheme_id: uuid.UUID
) -> Optional[Dict[str, Any]]:
    """Toggle scheme active status."""
    scheme = await get_scheme(db, scheme_id)
    if not scheme:
        return None
    scheme.is_active = not scheme.is_active
    await db.commit()
    await db.refresh(scheme)
    return _scheme_to_dict(scheme)
