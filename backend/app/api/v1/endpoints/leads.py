"""Lead management and distribution endpoints."""

import uuid
from typing import Optional
from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile, status
from fastapi.responses import PlainTextResponse, Response
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_admin_user, get_current_active_user, get_db
from app.models.user import User
from app.schemas.common import MessageResponse, PaginatedResponse
from app.schemas.lead import (
    LeadAssignRequest,
    LeadBulkAssignRequest,
    LeadBulkUploadResponse,
    LeadCreate,
    LeadResponse,
    LeadUpdate,
)
from app.services import employee_service, lead_service

router = APIRouter()
assignment_router = APIRouter()


@router.get("", response_model=PaginatedResponse[LeadResponse])
async def list_leads(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: Optional[str] = None,
    status: Optional[str] = None,
    priority: Optional[str] = None,
    loan_type: Optional[str] = None,
    employee_id: Optional[uuid.UUID] = None,
    is_unassigned: Optional[bool] = None,
    sort_by: str = Query("created_at"),
    sort_order: str = Query("desc"),
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """List leads. Staff only see leads assigned to them; Admin sees all."""
    role_val = current_user.role.value if hasattr(current_user.role, "value") else str(current_user.role)
    target_emp_id = employee_id

    if role_val != "admin":
        # Staff is strictly restricted to their assigned leads
        emp = await employee_service.get_employee_by_user_id(db, current_user.id)
        if not emp:
            raise HTTPException(status_code=403, detail="Employee record not found")
        target_emp_id = emp.id
        is_unassigned = False

    skip = (page - 1) * page_size
    leads, total = await lead_service.get_leads(
        db,
        skip=skip,
        limit=page_size,
        search=search,
        status=status,
        employee_id=target_emp_id,
        priority=priority,
        loan_type=loan_type,
        is_unassigned=is_unassigned,
        sort_by=sort_by,
        sort_order=sort_order,
    )
    pages = (total + page_size - 1) // page_size if total > 0 else 1
    return PaginatedResponse(items=leads, total=total, page=page, page_size=page_size, pages=pages)


@router.post("", response_model=LeadResponse, status_code=status.HTTP_201_CREATED)
async def create_lead(
    data: LeadCreate,
    admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a new customer lead (Admin only)."""
    lead = await lead_service.create_lead(db, data)
    return lead


@router.get("/unassigned", response_model=PaginatedResponse[LeadResponse])
async def list_unassigned_leads(
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=500),
    admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    """List unassigned leads (Admin only)."""
    skip = (page - 1) * page_size
    leads, total = await lead_service.get_leads(db, skip=skip, limit=page_size, is_unassigned=True)
    pages = (total + page_size - 1) // page_size if total > 0 else 1
    return PaginatedResponse(items=leads, total=total, page=page, page_size=page_size, pages=pages)


@router.get("/csv-template")
async def download_csv_template():
    """Download standardized CSV template for bulk lead imports."""
    content = lead_service.generate_csv_template()
    return Response(
        content=content,
        media_type="text/csv",
        headers={"Content-Disposition": 'attachment; filename="loanflow_leads_template.csv"'},
    )


@router.post("/import", response_model=LeadBulkUploadResponse)
async def import_leads_csv(
    file: UploadFile = File(...),
    admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    """Bulk import leads from CSV with phone duplicate detection (Admin only)."""
    content = await file.read()
    return await lead_service.bulk_import_csv(db, content, admin.id)


@router.get("/export")
async def export_leads(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Export leads to CSV."""
    role_val = current_user.role.value if hasattr(current_user.role, "value") else str(current_user.role)
    target_emp_id = None
    if role_val != "admin":
        emp = await employee_service.get_employee_by_user_id(db, current_user.id)
        if emp:
            target_emp_id = emp.id

    csv_data = await lead_service.export_leads_csv(db, employee_id=target_emp_id)
    return Response(
        content=csv_data,
        media_type="text/csv",
        headers={"Content-Disposition": 'attachment; filename="leads_export.csv"'},
    )


@router.get("/{id}", response_model=LeadResponse)
async def get_lead(
    id: uuid.UUID,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Get lead details."""
    lead = await lead_service.get_lead(db, id)
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")

    role_val = current_user.role.value if hasattr(current_user.role, "value") else str(current_user.role)
    if role_val != "admin":
        emp = await employee_service.get_employee_by_user_id(db, current_user.id)
        if not emp or lead.assigned_employee_id != emp.id:
            raise HTTPException(status_code=403, detail="Access denied to this lead")

    return lead_service._lead_to_dict(lead)


@router.get("/{id}/details")
async def get_lead_full_details(
    id: uuid.UUID,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Get complete lead profile with call logs, follow-ups, documents, and applications."""
    lead = await lead_service.get_lead(db, id)
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")

    role_val = current_user.role.value if hasattr(current_user.role, "value") else str(current_user.role)
    if role_val != "admin":
        emp = await employee_service.get_employee_by_user_id(db, current_user.id)
        if not emp or lead.assigned_employee_id != emp.id:
            raise HTTPException(status_code=403, detail="Access denied to this lead")

    return await lead_service.get_lead_details(db, id)


@router.put("/{id}", response_model=LeadResponse)
async def update_lead(
    id: uuid.UUID,
    data: LeadUpdate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Update lead details."""
    lead = await lead_service.get_lead(db, id)
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")

    role_val = current_user.role.value if hasattr(current_user.role, "value") else str(current_user.role)
    if role_val != "admin":
        emp = await employee_service.get_employee_by_user_id(db, current_user.id)
        if not emp or lead.assigned_employee_id != emp.id:
            raise HTTPException(status_code=403, detail="Access denied to this lead")

    updated = await lead_service.update_lead(db, id, data)
    return updated


@router.delete("/{id}", response_model=MessageResponse)
async def delete_lead(
    id: uuid.UUID,
    admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    """Archive / soft-delete lead (Admin only)."""
    success = await lead_service.delete_lead(db, id)
    if not success:
        raise HTTPException(status_code=404, detail="Lead not found")
    return MessageResponse(message="Lead archived successfully")


# ---------------------------------------------------------------------------
# Assignment endpoints under /assignments or /leads/assign
# ---------------------------------------------------------------------------

@router.post("/assign", response_model=MessageResponse)
async def assign_single_lead_endpoint(
    req: LeadAssignRequest,
    admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    """Assign a single lead to an employee (Admin only)."""
    for lid in req.lead_ids:
        try:
            await lead_service.assign_single_lead(db, lid, req.employee_id, admin.id)
        except ValueError as e:
            raise HTTPException(status_code=400, detail=str(e))
    return MessageResponse(message=f"Successfully assigned {len(req.lead_ids)} lead(s)")


@router.post("/bulk-assign")
async def bulk_assign_endpoint(
    req: LeadBulkAssignRequest,
    admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    """Bulk distribute leads across employees using equal or round-robin algorithm (Admin only)."""
    try:
        res = await lead_service.bulk_assign_leads(
            db,
            lead_ids=req.lead_ids,
            employee_ids=req.employee_ids,
            method=req.method,
            admin_id=admin.id,
        )
        return res
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@assignment_router.post("/assign", response_model=MessageResponse)
async def assign_alias(
    req: LeadAssignRequest,
    admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    """Alias for /assignments/assign."""
    for lid in req.lead_ids:
        try:
            await lead_service.assign_single_lead(db, lid, req.employee_id, admin.id)
        except ValueError as e:
            raise HTTPException(status_code=400, detail=str(e))
    return MessageResponse(message=f"Successfully assigned {len(req.lead_ids)} lead(s)")


@assignment_router.post("/bulk-assign")
async def bulk_assign_alias(
    req: LeadBulkAssignRequest,
    admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    """Alias for /assignments/bulk-assign."""
    try:
        return await lead_service.bulk_assign_leads(
            db,
            lead_ids=req.lead_ids,
            employee_ids=req.employee_ids,
            method=req.method,
            admin_id=admin.id,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
