"""User model."""

import enum
import uuid
from datetime import datetime
from typing import TYPE_CHECKING, List, Optional

from sqlalchemy import Boolean, DateTime, Enum, String, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base_class import Base

if TYPE_CHECKING:
    from app.models.activity_log import ActivityLog
    from app.models.application_status_history import ApplicationStatusHistory
    from app.models.document import Document
    from app.models.employee import Employee
    from app.models.lead_assignment import LeadAssignment


class UserRole(str, enum.Enum):
    """User role enumeration."""

    ADMIN = "admin"
    STAFF = "staff"


class User(Base):
    """User account model."""

    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True
    )
    email: Mapped[str] = mapped_column(
        String(255), unique=True, nullable=False, index=True
    )
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    phone: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    role: Mapped[UserRole] = mapped_column(
        Enum(UserRole, name="user_role", native_enum=True),
        nullable=False,
        default=UserRole.STAFF,
    )
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
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
    employee: Mapped[Optional["Employee"]] = relationship(
        "Employee", back_populates="user", uselist=False
    )
    lead_assignments: Mapped[List["LeadAssignment"]] = relationship(
        "LeadAssignment",
        back_populates="assigned_by_user",
        foreign_keys="LeadAssignment.assigned_by",
    )
    status_changes: Mapped[List["ApplicationStatusHistory"]] = relationship(
        "ApplicationStatusHistory", back_populates="changed_by_user"
    )
    verified_documents: Mapped[List["Document"]] = relationship(
        "Document",
        back_populates="verified_by_user",
        foreign_keys="Document.verified_by",
    )
    activity_logs: Mapped[List["ActivityLog"]] = relationship(
        "ActivityLog", back_populates="user"
    )
