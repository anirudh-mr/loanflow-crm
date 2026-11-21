"""Report endpoints and CSV data exports."""

import uuid
from datetime import date
from typing import Optional
from fastapi import APIRouter, Depends, Query, Response
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_admin_user, get_db
from app.models.user import User
from app.services import report_service

router = APIRouter()


@router.get("/call-performance")
async def call_performance_report(
    period: str = Query("daily", pattern="^(daily|weekly|monthly)$"),
    employee_id: Optional[uuid.UUID] = None,
    date_from: Optional[date] = None,
    date_to: Optional[date] = None,
    admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    """Aggregate call activity report."""
    return await report_service.get_call_performance_report(
        db, period=period, employee_id=employee_id, date_from=date_from, date_to=date_to
    )


@router.get("/employee-performance")
async def employee_performance_report(
    date_from: Optional[date] = None,
    date_to: Optional[date] = None,
    admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    """Employee KPI conversion and call metrics report."""
    return await report_service.get_employee_performance_report(
        db, date_from=date_from, date_to=date_to
    )


@router.get("/bank-wise")
async def bank_wise_report(
    date_from: Optional[date] = None,
    date_to: Optional[date] = None,
    admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    """Lending bank performance and approval statistics."""
    return await report_service.get_bank_wise_report(
        db, date_from=date_from, date_to=date_to
    )


@router.get("/lead-source")
async def lead_source_report(
    date_from: Optional[date] = None,
    date_to: Optional[date] = None,
    admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    """Lead source conversion efficiency report."""
    return await report_service.get_lead_source_report(
        db, date_from=date_from, date_to=date_to
    )


@router.get("/export")
async def export_report_csv(
    report_type: str = Query(..., pattern="^(call_performance|employee_performance|bank_wise|lead_source)$"),
    date_from: Optional[date] = None,
    date_to: Optional[date] = None,
    admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    """Export any report to CSV format."""
    csv_str = await report_service.export_report_to_csv(
        db, report_type=report_type, date_from=date_from, date_to=date_to
    )
    return Response(
        content=csv_str,
        media_type="text/csv",
        headers={"Content-Disposition": f'attachment; filename="{report_type}_report.csv"'},
    )
