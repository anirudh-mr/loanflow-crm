"""Follow-up model."""

import enum
import uuid
from datetime import datetime
from typing import TYPE_CHECKING, Optional

from sqlalchemy import DateTime, Enum, ForeignKey, Index, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base_class import Base

if TYPE_CHECKING:
    from app.models.employee import Employee
    from app.models.lead import Lead


class FollowUpStatus(str, enum.Enum):
    """Follow-up status enumeration."""

    PENDING = "pending"
    COMPLETED = "completed"
    OVERDUE = "overdue"
    RESCHEDULED = "rescheduled"


class FollowUp(Base):
    """Scheduled follow-up for a lead."""

    __tablename__ = "follow_ups"
    __table_args__ = (
        Index("ix_follow_ups_scheduled_status", "scheduled_date", "status"),
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
    scheduled_date: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False
    )
    completed_date: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    status: Mapped[FollowUpStatus] = mapped_column(
        Enum(FollowUpStatus, name="follow_up_status", native_enum=True),
        nullable=False,
        default=FollowUpStatus.PENDING,
    )
    remarks: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    # Relationships
    lead: Mapped["Lead"] = relationship("Lead", back_populates="follow_ups")
    employee: Mapped["Employee"] = relationship(
        "Employee", back_populates="follow_ups"
    )
