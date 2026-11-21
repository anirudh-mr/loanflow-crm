"""Loan application model."""

import enum
import uuid
from datetime import datetime
from typing import TYPE_CHECKING, List, Optional

from sqlalchemy import DateTime, Enum, ForeignKey, Index, Numeric, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base_class import Base

if TYPE_CHECKING:
    from app.models.application_status_history import ApplicationStatusHistory
    from app.models.bank import Bank
    from app.models.employee import Employee
    from app.models.lead import Lead
    from app.models.loan_scheme import LoanScheme


class ApplicationStatus(str, enum.Enum):
    """Loan application status enumeration."""

    DRAFT = "draft"
    DOCUMENTS_PENDING = "documents_pending"
    READY_FOR_SUBMISSION = "ready_for_submission"
    SUBMITTED_TO_BANK = "submitted_to_bank"
    UNDER_BANK_REVIEW = "under_bank_review"
    ADDITIONAL_INFO_REQUIRED = "additional_info_required"
    APPROVED = "approved"
    REJECTED = "rejected"
    DISBURSED = "disbursed"
    CLOSED = "closed"


class LoanApplication(Base):
    """Loan application submitted to a bank."""

    __tablename__ = "loan_applications"
    __table_args__ = (
        Index("ix_loan_applications_status", "status"),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True
    )
    lead_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("leads.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    employee_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("employees.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    bank_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("banks.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    loan_scheme_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("loan_schemes.id", ondelete="SET NULL"),
        nullable=True,
    )
    requested_amount: Mapped[float] = mapped_column(Numeric(15, 2), nullable=False)
    approved_amount: Mapped[Optional[float]] = mapped_column(
        Numeric(15, 2), nullable=True
    )
    application_date: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    status: Mapped[ApplicationStatus] = mapped_column(
        Enum(ApplicationStatus, name="application_status", native_enum=True),
        nullable=False,
        default=ApplicationStatus.DRAFT,
    )
    remarks: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    # Relationships
    lead: Mapped["Lead"] = relationship("Lead", back_populates="loan_applications")
    employee: Mapped["Employee"] = relationship(
        "Employee", back_populates="loan_applications"
    )
    bank: Mapped["Bank"] = relationship("Bank", back_populates="loan_applications")
    loan_scheme: Mapped[Optional["LoanScheme"]] = relationship(
        "LoanScheme", back_populates="loan_applications"
    )
    status_history: Mapped[List["ApplicationStatusHistory"]] = relationship(
        "ApplicationStatusHistory", back_populates="application"
    )
