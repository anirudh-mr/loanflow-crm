"""Model package — import all models for convenient access."""

from app.models.user import User, UserRole  # noqa: F401
from app.models.employee import Employee  # noqa: F401
from app.models.lead import Lead, EmploymentType, LeadStatus, LeadPriority  # noqa: F401
from app.models.lead_assignment import LeadAssignment  # noqa: F401
from app.models.call_log import CallLog, CallOutcome  # noqa: F401
from app.models.follow_up import FollowUp, FollowUpStatus  # noqa: F401
from app.models.document import Document, DocumentCategory, VerificationStatus  # noqa: F401
from app.models.bank import Bank  # noqa: F401
from app.models.loan_scheme import LoanScheme  # noqa: F401
from app.models.loan_application import LoanApplication, ApplicationStatus  # noqa: F401
from app.models.application_status_history import ApplicationStatusHistory  # noqa: F401
from app.models.daily_target import DailyTarget  # noqa: F401
from app.models.activity_log import ActivityLog  # noqa: F401

__all__ = [
    "User",
    "UserRole",
    "Employee",
    "Lead",
    "EmploymentType",
    "LeadStatus",
    "LeadPriority",
    "LeadAssignment",
    "CallLog",
    "CallOutcome",
    "FollowUp",
    "FollowUpStatus",
    "Document",
    "DocumentCategory",
    "VerificationStatus",
    "Bank",
    "LoanScheme",
    "LoanApplication",
    "ApplicationStatus",
    "ApplicationStatusHistory",
    "DailyTarget",
    "ActivityLog",
]
