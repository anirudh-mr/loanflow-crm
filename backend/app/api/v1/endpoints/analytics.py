"""Analytics and dashboard visualization endpoints."""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_admin_user, get_current_active_user, get_db
from app.models.user import User
from app.schemas.analytics import DashboardStats
from app.services import analytics_service, employee_service

router = APIRouter()


@router.get("/dashboard", response_model=DashboardStats)
async def get_admin_dashboard(
    admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    """Get database-driven statistics for the Admin Dashboard."""
    return await analytics_service.get_admin_dashboard_stats(db)


@router.get("/staff-dashboard")
async def get_staff_dashboard(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Get database-driven statistics for the Staff Dashboard."""
    emp = await employee_service.get_employee_by_user_id(db, current_user.id)
    if not emp:
        raise HTTPException(status_code=404, detail="Employee profile not found")
    return await analytics_service.get_staff_dashboard_stats(db, emp.id)


@router.get("/daily-calls")
async def get_daily_calls(
    days: int = Query(14, ge=7, le=90),
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Daily call count chart data."""
    return await analytics_service.get_daily_call_activity_chart(db, days=days)


@router.get("/weekly-leads")
async def get_weekly_leads(
    weeks: int = Query(8, ge=4, le=52),
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Weekly lead generation chart data."""
    return await analytics_service.get_weekly_lead_chart(db, weeks=weeks)


@router.get("/leaderboard")
async def get_leaderboard(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Employee call & conversion leaderboard."""
    return await analytics_service.get_leaderboard(db)


@router.get("/lead-distribution")
async def get_lead_distribution(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Distribution of leads by current status."""
    return await analytics_service.get_lead_status_distribution(db)


@router.get("/loan-pipeline")
async def get_loan_pipeline(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Distribution of loan applications across stages."""
    return await analytics_service.get_loan_pipeline(db)


@router.get("/conversion-funnel")
async def get_conversion_funnel(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Full-funnel conversion rate drop-off metrics."""
    return await analytics_service.get_conversion_funnel(db)
