"""Call log model."""

import enum
import uuid
from datetime import datetime
from typing import TYPE_CHECKING, Optional

from sqlalchemy import DateTime, Enum, ForeignKey, Index, Integer, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base_class import Base

if TYPE_CHECKING:
    from app.models.employee import Employee
    from app.models.lead import Lead


class CallOutcome(str, enum.Enum):
    """Call outcome enumeration."""

    INTERESTED = "interested"
    NOT_INTERESTED = "not_interested"
    NO_ANSWER = "no_answer"
    BUSY = "busy"
    CALL_BACK_LATER = "call_back_later"
    WRONG_NUMBER = "wrong_number"
    FOLLOW_UP_REQUIRED = "follow_up_required"


class CallLog(Base):
    """Record of a call made to a lead."""

    __tablename__ = "call_logs"
    __table_args__ = (
        Index("ix_call_logs_employee_date", "employee_id", "call_datetime"),
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
    )
    call_datetime: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    duration_seconds: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    outcome: Mapped[CallOutcome] = mapped_column(
        Enum(CallOutcome, name="call_outcome", native_enum=True), nullable=False
    )
    remarks: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    next_follow_up_date: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    # Relationships
    lead: Mapped["Lead"] = relationship("Lead", back_populates="call_logs")
    employee: Mapped["Employee"] = relationship("Employee", back_populates="call_logs")
