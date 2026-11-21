"""Follow-up schemas for scheduling and tracking lead follow-ups."""

from datetime import date, datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class FollowUpCreate(BaseModel):
    """Schema for creating a follow-up."""

    lead_id: UUID
    scheduled_date: date
    remarks: Optional[str] = None


class FollowUpUpdate(BaseModel):
    """Schema for updating a follow-up (all optional)."""

    scheduled_date: Optional[date] = None
    status: Optional[str] = None
    remarks: Optional[str] = None


class FollowUpResponse(BaseModel):
    """Schema for follow-up responses returned from the API."""

    model_config = ConfigDict(from_attributes=True)

    id: UUID
    lead_id: UUID
    customer_name: Optional[str] = None
    employee_id: UUID
    employee_name: Optional[str] = None
    scheduled_date: date
    completed_date: Optional[datetime] = None
    status: str
    remarks: Optional[str] = None
    created_at: datetime
