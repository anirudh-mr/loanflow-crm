"""Document management endpoints."""

import uuid
from typing import Optional
from fastapi import APIRouter, Depends, File, Form, HTTPException, Query, UploadFile, status
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_admin_user, get_current_active_user, get_db
from app.models.user import User
from app.schemas.common import PaginatedResponse
from app.schemas.document import DocumentResponse, DocumentVerifyRequest
from app.services import document_service, employee_service

router = APIRouter()


@router.get("", response_model=PaginatedResponse[DocumentResponse])
async def list_documents(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    lead_id: Optional[uuid.UUID] = None,
    category: Optional[str] = None,
    status: Optional[str] = None,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """List documents with verification filters."""
    role_val = current_user.role.value if hasattr(current_user.role, "value") else str(current_user.role)
    target_emp_id = None
    if role_val != "admin":
        emp = await employee_service.get_employee_by_user_id(db, current_user.id)
        if emp:
            target_emp_id = emp.id

    skip = (page - 1) * page_size
    items, total = await document_service.get_documents(
        db,
        skip=skip,
        limit=page_size,
        lead_id=lead_id,
        category=category,
        status=status,
        employee_id=target_emp_id,
    )
    pages = (total + page_size - 1) // page_size if total > 0 else 1
    return PaginatedResponse(items=items, total=total, page=page, page_size=page_size, pages=pages)


@router.post("/upload", response_model=DocumentResponse, status_code=status.HTTP_201_CREATED)
async def upload_document(
    lead_id: uuid.UUID = Form(...),
    category: str = Form(...),
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Upload customer document."""
    emp = await employee_service.get_employee_by_user_id(db, current_user.id)
    emp_id = emp.id if emp else current_user.id

    try:
        return await document_service.upload_document(
            db, lead_id=lead_id, category=category, file=file, employee_id=emp_id
        )
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))


@router.patch("/{id}/verify", response_model=DocumentResponse)
async def verify_document(
    id: uuid.UUID,
    data: DocumentVerifyRequest,
    admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    """Verify or reject document with audit notes (Admin only)."""
    res = await document_service.verify_document(
        db, doc_id=id, status=data.status, remarks=data.rejection_remarks, admin=admin
    )
    if not res:
        raise HTTPException(status_code=404, detail="Document not found")
    return res


@router.get("/{id}/download")
async def download_document(
    id: uuid.UUID,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Download document file securely."""
    file_path, file_name, mime_type = await document_service.get_document_file_path(db, id)
    if not file_path:
        raise HTTPException(status_code=404, detail="File not found or missing from disk")

    return FileResponse(
        path=file_path,
        filename=file_name,
        media_type=mime_type or "application/octet-stream",
    )
