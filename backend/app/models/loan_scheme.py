"""Loan scheme model."""

import uuid
from datetime import datetime
from typing import TYPE_CHECKING, List, Optional

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, Numeric, String, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base_class import Base

if TYPE_CHECKING:
    from app.models.bank import Bank
    from app.models.loan_application import LoanApplication


class LoanScheme(Base):
    """Loan product / scheme offered by a bank."""

    __tablename__ = "loan_schemes"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True
    )
    bank_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("banks.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    scheme_name: Mapped[str] = mapped_column(String(255), nullable=False)
    loan_category: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    min_amount: Mapped[Optional[float]] = mapped_column(Numeric(15, 2), nullable=True)
    max_amount: Mapped[Optional[float]] = mapped_column(Numeric(15, 2), nullable=True)
    interest_rate: Mapped[Optional[float]] = mapped_column(
        Numeric(5, 2), nullable=True
    )
    min_tenure_months: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    max_tenure_months: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    eligibility_info: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    # Relationships
    bank: Mapped["Bank"] = relationship("Bank", back_populates="loan_schemes")
    loan_applications: Mapped[List["LoanApplication"]] = relationship(
        "LoanApplication", back_populates="loan_scheme"
    )
