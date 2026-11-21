"""Document model."""

import enum
import uuid
from datetime import datetime
from typing import TYPE_CHECKING, Optional

from sqlalchemy import DateTime, Enum, ForeignKey, Index, Integer, String, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base_class import Base

if TYPE_CHECKING:
    from app.models.employee import Employee
    from app.models.lead import Lead
    from app.models.user import User


class DocumentCategory(str, enum.Enum):
    """Document category enumeration."""

    AADHAAR = "aadhaar"
    PAN = "pan"
    SALARY_SLIP = "salary_slip"
    BANK_STATEMENT = "bank_statement"
    ADDRESS_PROOF = "address_proof"
    EMPLOYMENT_PROOF = "employment_proof"
    OTHER = "other"


class VerificationStatus(str, enum.Enum):
    """Document verification status enumeration."""

    PENDING = "pending"
    VERIFIED = "verified"
    REJECTED = "rejected"


class Document(Base):
    """Uploaded document linked to a lead."""

    __tablename__ = "documents"
    __table_args__ = (
        Index("ix_documents_lead_id", "lead_id"),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True
    )
    lead_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("leads.id", ondelete="CASCADE"),
        nullable=False,
    )
    uploaded_by: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("employees.id", ondelete="SET NULL"),
        nullable=False,
    )
    category: Mapped[DocumentCategory] = mapped_column(
        Enum(DocumentCategory, name="document_category", native_enum=True),
        nullable=False,
    )
    file_name: Mapped[str] = mapped_column(String(255), nullable=False)
    file_path: Mapped[str] = mapped_column(String(500), nullable=False)
    file_size: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    mime_type: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    verification_status: Mapped[VerificationStatus] = mapped_column(
        Enum(VerificationStatus, name="verification_status", native_enum=True),
        nullable=False,
        default=VerificationStatus.PENDING,
    )
    verified_by: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
    )
    verified_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    rejection_remarks: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    # Relationships
    lead: Mapped["Lead"] = relationship("Lead", back_populates="documents")
    uploaded_by_employee: Mapped["Employee"] = relationship(
        "Employee", back_populates="uploaded_documents", foreign_keys=[uploaded_by]
    )
    verified_by_user: Mapped[Optional["User"]] = relationship(
        "User", back_populates="verified_documents", foreign_keys=[verified_by]
    )
