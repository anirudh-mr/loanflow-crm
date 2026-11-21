"""Call log schemas for recording and retrieving call interactions."""

from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class CallLogCreate(BaseModel):
    """Schema for creating a call log entry."""

    lead_id: UUID
    outcome: str
    duration_seconds: int
    remarks: Optional[str] = None
    next_follow_up_date: Optional[datetime] = None


class CallLogResponse(BaseModel):
    """Schema for call log responses returned from the API."""

    model_config = ConfigDict(from_attributes=True)

    id: UUID
    lead_id: UUID
    customer_name: Optional[str] = None
    employee_id: UUID
    employee_name: Optional[str] = None
    call_datetime: datetime
    duration_seconds: int
    outcome: str
    remarks: Optional[str] = None
    next_follow_up_date: Optional[datetime] = None
