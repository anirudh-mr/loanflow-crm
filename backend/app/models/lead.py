"""Lead model."""

import enum
import uuid
from datetime import datetime
from typing import TYPE_CHECKING, List, Optional

from sqlalchemy import DateTime, Enum, ForeignKey, Index, Numeric, String, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base_class import Base

if TYPE_CHECKING:
    from app.models.call_log import CallLog
    from app.models.document import Document
    from app.models.employee import Employee
    from app.models.follow_up import FollowUp
    from app.models.lead_assignment import LeadAssignment
    from app.models.loan_application import LoanApplication


class EmploymentType(str, enum.Enum):
    """Employment type enumeration."""

    SALARIED = "salaried"
    SELF_EMPLOYED = "self_employed"
    BUSINESS = "business"
    FREELANCER = "freelancer"
    RETIRED = "retired"
    OTHER = "other"


class LeadStatus(str, enum.Enum):
    """Lead status enumeration."""

    NEW = "new"
    ASSIGNED = "assigned"
    CONTACTED = "contacted"
    INTERESTED = "interested"
    NOT_INTERESTED = "not_interested"
    FOLLOW_UP_REQUIRED = "follow_up_required"
    DOCUMENTS_PENDING = "documents_pending"
    APPLICATION_SUBMITTED = "application_submitted"
    CONVERTED = "converted"
    CLOSED = "closed"


class LeadPriority(str, enum.Enum):
    """Lead priority enumeration."""

    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"


class Lead(Base):
    """Lead / prospective customer model."""

    __tablename__ = "leads"
    __table_args__ = (
        Index("ix_leads_status", "status"),
        Index("ix_leads_assigned_employee_id", "assigned_employee_id"),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True
    )
    customer_name: Mapped[str] = mapped_column(String(255), nullable=False)
    phone: Mapped[str] = mapped_column(String(20), nullable=False, index=True)
    email: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    city: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    state: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    employment_type: Mapped[Optional[EmploymentType]] = mapped_column(
        Enum(EmploymentType, name="employment_type", native_enum=True), nullable=True
    )
    monthly_income: Mapped[Optional[float]] = mapped_column(
        Numeric(15, 2), nullable=True
    )
    loan_type: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    requested_amount: Mapped[Optional[float]] = mapped_column(
        Numeric(15, 2), nullable=True
    )
    preferred_bank: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    lead_source: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    assigned_employee_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("employees.id", ondelete="SET NULL"),
        nullable=True,
    )
    status: Mapped[LeadStatus] = mapped_column(
        Enum(LeadStatus, name="lead_status", native_enum=True),
        nullable=False,
        default=LeadStatus.NEW,
    )
    priority: Mapped[LeadPriority] = mapped_column(
        Enum(LeadPriority, name="lead_priority", native_enum=True),
        nullable=False,
        default=LeadPriority.MEDIUM,
    )
    last_contact_date: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
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
    assigned_employee: Mapped[Optional["Employee"]] = relationship(
        "Employee", back_populates="assigned_leads"
    )
    lead_assignments: Mapped[List["LeadAssignment"]] = relationship(
        "LeadAssignment", back_populates="lead"
    )
    call_logs: Mapped[List["CallLog"]] = relationship(
        "CallLog", back_populates="lead"
    )
    follow_ups: Mapped[List["FollowUp"]] = relationship(
        "FollowUp", back_populates="lead"
    )
    documents: Mapped[List["Document"]] = relationship(
        "Document", back_populates="lead"
    )
    loan_applications: Mapped[List["LoanApplication"]] = relationship(
        "LoanApplication", back_populates="lead"
    )
