"""Document schemas for file metadata and verification workflows."""

from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class DocumentResponse(BaseModel):
    """Schema for document responses returned from the API."""

    model_config = ConfigDict(from_attributes=True)

    id: UUID
    lead_id: UUID
    customer_name: Optional[str] = None
    uploaded_by_name: Optional[str] = None
    category: str
    file_name: str
    file_size: int
    mime_type: str
    verification_status: str = "pending"
    verified_by_name: Optional[str] = None
    verified_at: Optional[datetime] = None
    rejection_remarks: Optional[str] = None
    created_at: datetime


class DocumentVerifyRequest(BaseModel):
    """Schema for verifying or rejecting a document."""

    status: str  # "verified" or "rejected"
    rejection_remarks: Optional[str] = None
