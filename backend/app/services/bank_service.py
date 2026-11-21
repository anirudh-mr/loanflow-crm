"""Bank management service."""

import uuid
from typing import Any, Dict, List, Optional, Tuple
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.bank import Bank
from app.schemas.bank import BankCreate, BankUpdate


def _bank_to_dict(b: Bank) -> Dict[str, Any]:
    return {
        "id": b.id,
        "name": b.name,
        "code": b.code,
        "contact_person": b.contact_person,
        "contact_email": b.contact_email,
        "contact_phone": b.contact_phone,
        "is_active": b.is_active,
        "created_at": b.created_at,
    }


async def get_banks(
    db: AsyncSession,
    skip: int = 0,
    limit: int = 50,
    is_active: Optional[bool] = None,
) -> Tuple[List[Dict[str, Any]], int]:
    """List banks."""
    query = select(Bank)
    if is_active is not None:
        query = query.where(Bank.is_active == is_active)

    count_query = select(func.count(Bank.id))
    if is_active is not None:
        count_query = count_query.where(Bank.is_active == is_active)

    total_res = await db.execute(count_query)
    total = total_res.scalar() or 0

    query = query.order_by(Bank.name).offset(skip).limit(limit)
    res = await db.execute(query)
    banks = res.scalars().all()
    return [_bank_to_dict(b) for b in banks], total


async def get_bank(db: AsyncSession, bank_id: uuid.UUID) -> Optional[Bank]:
    """Get bank by ID."""
    res = await db.execute(select(Bank).where(Bank.id == bank_id))
    return res.scalars().first()


async def create_bank(db: AsyncSession, data: BankCreate) -> Dict[str, Any]:
    """Create a new bank."""
    bank = Bank(
        name=data.name,
        code=data.code.upper(),
        contact_person=data.contact_person,
        contact_email=data.contact_email,
        contact_phone=data.contact_phone,
        is_active=True,
    )
    db.add(bank)
    await db.commit()
    await db.refresh(bank)
    return _bank_to_dict(bank)


async def update_bank(
    db: AsyncSession, bank_id: uuid.UUID, data: BankUpdate
) -> Optional[Dict[str, Any]]:
    """Update bank details."""
    bank = await get_bank(db, bank_id)
    if not bank:
        return None

    update_dict = data.model_dump(exclude_unset=True)
    for k, v in update_dict.items():
        if v is not None:
            if k == "code":
                v = v.upper()
            setattr(bank, k, v)

    await db.commit()
    await db.refresh(bank)
    return _bank_to_dict(bank)


async def toggle_bank_status(db: AsyncSession, bank_id: uuid.UUID) -> Optional[Dict[str, Any]]:
    """Toggle bank active status."""
    bank = await get_bank(db, bank_id)
    if not bank:
        return None
    bank.is_active = not bank.is_active
    await db.commit()
    await db.refresh(bank)
    return _bank_to_dict(bank)
