"""Analytics and dashboard schemas for reporting and visualizations."""

from datetime import date

from pydantic import BaseModel


class DashboardStats(BaseModel):
    """Aggregate dashboard statistics."""

    total_leads: int = 0
    leads_today: int = 0
    unassigned_leads: int = 0
    total_employees: int = 0
    calls_today: int = 0
    daily_target: int = 0
    interested_customers: int = 0
    followups_due_today: int = 0
    overdue_followups: int = 0
    pending_documents: int = 0
    applications_under_review: int = 0
    approved_loans: int = 0
    disbursed_loans: int = 0
    rejected_applications: int = 0


class DailyCallActivity(BaseModel):
    """Daily call count for activity charts."""

    date: date
    count: int = 0


class WeeklyLeadGeneration(BaseModel):
    """Weekly lead generation count."""

    week: str
    count: int = 0


class EmployeeLeaderboard(BaseModel):
    """Employee ranking entry for the leaderboard."""

    employee_name: str
    calls: int = 0
    interested: int = 0
    conversions: int = 0


class LeadStatusDistribution(BaseModel):
    """Lead count per status for pie/bar charts."""

    status: str
    count: int = 0


class LoanPipeline(BaseModel):
    """Loan application count per status for the pipeline view."""

    status: str
    count: int = 0
