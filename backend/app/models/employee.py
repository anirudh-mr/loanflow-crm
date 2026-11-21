"""Employee model."""

import uuid
from datetime import date, datetime
from typing import TYPE_CHECKING, List, Optional

from sqlalchemy import Boolean, Date, DateTime, ForeignKey, Integer, String, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base_class import Base

if TYPE_CHECKING:
    from app.models.call_log import CallLog
    from app.models.daily_target import DailyTarget
    from app.models.document import Document
    from app.models.follow_up import FollowUp
    from app.models.lead import Lead
    from app.models.lead_assignment import LeadAssignment
    from app.models.loan_application import LoanApplication
    from app.models.user import User


class Employee(Base):
    """Employee profile linked to a user account."""

    __tablename__ = "employees"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
    )
    employee_id: Mapped[str] = mapped_column(
        String(50), unique=True, nullable=False, index=True
    )
    department: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    joining_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    daily_call_target: Mapped[int] = mapped_column(
        Integer, default=100, nullable=False
    )
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="employee")
    assigned_leads: Mapped[List["Lead"]] = relationship(
        "Lead", back_populates="assigned_employee"
    )
    lead_assignments: Mapped[List["LeadAssignment"]] = relationship(
        "LeadAssignment", back_populates="employee"
    )
    call_logs: Mapped[List["CallLog"]] = relationship(
        "CallLog", back_populates="employee"
    )
    follow_ups: Mapped[List["FollowUp"]] = relationship(
        "FollowUp", back_populates="employee"
    )
    uploaded_documents: Mapped[List["Document"]] = relationship(
        "Document", back_populates="uploaded_by_employee"
    )
    loan_applications: Mapped[List["LoanApplication"]] = relationship(
        "LoanApplication", back_populates="employee"
    )
    daily_targets: Mapped[List["DailyTarget"]] = relationship(
        "DailyTarget", back_populates="employee"
    )
