"""Main API v1 router — aggregates all domain endpoints."""

from fastapi import APIRouter

from app.api.v1.endpoints import (
    analytics,
    applications,
    auth,
    banks,
    calls,
    documents,
    employees,
    followups,
    leads,
    loan_schemes,
    reports,
    users,
)

router = APIRouter()

router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
router.include_router(users.router, prefix="/users", tags=["Users"])
router.include_router(employees.router, prefix="/employees", tags=["Employees"])
router.include_router(leads.router, prefix="/leads", tags=["Leads"])
router.include_router(leads.assignment_router, prefix="/assignments", tags=["Lead Assignments"])
router.include_router(calls.router, prefix="/calls", tags=["Calls"])
router.include_router(followups.router, prefix="/followups", tags=["Follow-ups"])
router.include_router(documents.router, prefix="/documents", tags=["Documents"])
router.include_router(banks.router, prefix="/banks", tags=["Banks"])
router.include_router(loan_schemes.router, prefix="/loan-schemes", tags=["Loan Schemes"])
router.include_router(applications.router, prefix="/applications", tags=["Loan Applications"])
router.include_router(analytics.router, prefix="/analytics", tags=["Analytics"])
router.include_router(reports.router, prefix="/reports", tags=["Reports"])
