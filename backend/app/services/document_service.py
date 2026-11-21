"""Document management and verification service."""

import os
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple
from fastapi import UploadFile
from sqlalchemy import desc, func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.config import settings
from app.models.document import Document, DocumentCategory, VerificationStatus
from app.models.employee import Employee
from app.models.lead import Lead, LeadStatus
from app.models.user import User


ALLOWED_EXTENSIONS = {".pdf", ".jpg", ".jpeg", ".png"}
ALLOWED_MIME_TYPES = {
    "application/pdf",
    "image/jpeg",
    "image/jpg",
    "image/png",
}


def _doc_to_dict(d: Document) -> Dict[str, Any]:
    cat_val = d.category.value if hasattr(d.category, "value") else str(d.category)
    stat_val = (
        d.verification_status.value
        if hasattr(d.verification_status, "value")
        else str(d.verification_status)
    )
    cust_name = d.lead.customer_name if d.lead else "Unknown"
    uploader_name = (
        d.uploaded_by_employee.user.full_name
        if d.uploaded_by_employee and d.uploaded_by_employee.user
        else "Staff"
    )
    verifier_name = d.verified_by_user.full_name if d.verified_by_user else None

    return {
        "id": d.id,
        "lead_id": d.lead_id,
        "customer_name": cust_name,
        "uploaded_by_name": uploader_name,
        "category": cat_val,
        "file_name": d.file_name,
        "file_size": d.file_size,
        "mime_type": d.mime_type,
        "verification_status": stat_val,
        "verified_by_name": verifier_name,
        "verified_at": d.verified_at,
        "rejection_remarks": d.rejection_remarks,
        "created_at": d.created_at,
    }


async def upload_document(
    db: AsyncSession,
    lead_id: uuid.UUID,
    category: str,
    file: UploadFile,
    employee_id: uuid.UUID,
) -> Dict[str, Any]:
    """Validate and upload customer document."""
    # Validate lead
    lead_res = await db.execute(select(Lead).where(Lead.id == lead_id))
    lead = lead_res.scalars().first()
    if not lead:
        raise ValueError("Lead not found")

    # Validate file extension
    ext = Path(file.filename or "").suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise ValueError(f"File type '{ext}' is not allowed. Supported formats: PDF, JPG, JPEG, PNG.")

    # Read and validate file size
    content = await file.read()
    file_size = len(content)
    if file_size > settings.MAX_UPLOAD_SIZE:
        raise ValueError(f"File size exceeds maximum limit of {settings.MAX_UPLOAD_SIZE // (1024*1024)}MB.")

    # Save to disk
    lead_dir = Path(settings.UPLOAD_DIR) / str(lead_id)
    lead_dir.mkdir(parents=True, exist_ok=True)

    safe_filename = f"{uuid.uuid4().hex}_{Path(file.filename or 'file').name}"
    file_path = lead_dir / safe_filename

    with open(file_path, "wb") as f:
        f.write(content)

    # Normalize category
    cat_enum = category.lower().replace(" ", "_")

    doc = Document(
        lead_id=lead_id,
        uploaded_by=employee_id,
        category=cat_enum,
        file_name=file.filename or "uploaded_file",
        file_path=str(file_path),
        file_size=file_size,
        mime_type=file.content_type or "application/octet-stream",
        verification_status=VerificationStatus.PENDING,
    )
    db.add(doc)

    # Update lead status to documents_pending if new
    if lead.status in (LeadStatus.INTERESTED, LeadStatus.CONTACTED):
        lead.status = LeadStatus.DOCUMENTS_PENDING

    await db.commit()
    await db.refresh(doc)

    res = await db.execute(
        select(Document)
        .options(
            selectinload(Document.lead),
            selectinload(Document.uploaded_by_employee).selectinload(Employee.user),
            selectinload(Document.verified_by_user),
        )
        .where(Document.id == doc.id)
    )
    loaded = res.scalars().first()
    return _doc_to_dict(loaded or doc)


async def get_documents(
    db: AsyncSession,
    skip: int = 0,
    limit: int = 50,
    lead_id: Optional[uuid.UUID] = None,
    category: Optional[str] = None,
    status: Optional[str] = None,
    employee_id: Optional[uuid.UUID] = None,
) -> Tuple[List[Dict[str, Any]], int]:
    """List documents with filters."""
    query = select(Document).options(
        selectinload(Document.lead),
        selectinload(Document.uploaded_by_employee).selectinload(Employee.user),
        selectinload(Document.verified_by_user),
    )

    if lead_id is not None:
        query = query.where(Document.lead_id == lead_id)
    if employee_id is not None:
        query = query.join(Document.lead).where(Lead.assigned_employee_id == employee_id)
    if category is not None:
        query = query.where(Document.category == category.lower().replace(" ", "_"))
    if status is not None:
        query = query.where(Document.verification_status == status.lower())

    count_query = select(func.count(Document.id))
    if lead_id is not None:
        count_query = count_query.where(Document.lead_id == lead_id)
    if employee_id is not None:
        count_query = count_query.join(Document.lead).where(Lead.assigned_employee_id == employee_id)
    if category is not None:
        count_query = count_query.where(Document.category == category.lower().replace(" ", "_"))
    if status is not None:
        count_query = count_query.where(Document.verification_status == status.lower())

    total_res = await db.execute(count_query)
    total = total_res.scalar() or 0

    query = query.order_by(desc(Document.created_at)).offset(skip).limit(limit)
    res = await db.execute(query)
    docs = res.scalars().all()

    return [_doc_to_dict(d) for d in docs], total


async def verify_document(
    db: AsyncSession,
    doc_id: uuid.UUID,
    status: str,
    remarks: Optional[str],
    admin: User,
) -> Optional[Dict[str, Any]]:
    """Admin verifies or rejects customer document."""
    res = await db.execute(
        select(Document)
        .options(
            selectinload(Document.lead),
            selectinload(Document.uploaded_by_employee).selectinload(Employee.user),
            selectinload(Document.verified_by_user),
        )
        .where(Document.id == doc_id)
    )
    doc = res.scalars().first()
    if not doc:
        return None

    status_lower = status.lower()
    doc.verification_status = (
        VerificationStatus.VERIFIED if status_lower == "verified" else VerificationStatus.REJECTED
    )
    doc.verified_by = admin.id
    doc.verified_at = datetime.now(timezone.utc)
    doc.rejection_remarks = remarks if status_lower == "rejected" else None

    await db.commit()
    await db.refresh(doc)
    return _doc_to_dict(doc)


async def get_document_file_path(
    db: AsyncSession, doc_id: uuid.UUID
) -> Tuple[Optional[str], Optional[str], Optional[str]]:
    """Retrieve document file path, file name, and MIME type."""
    res = await db.execute(select(Document).where(Document.id == doc_id))
    doc = res.scalars().first()
    if not doc or not os.path.exists(doc.file_path):
        return None, None, None
    return doc.file_path, doc.file_name, doc.mime_type
