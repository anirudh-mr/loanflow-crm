"""LoanFlow CRM – Pydantic v2 schemas package.

All schemas are re-exported here for convenient imports:
    from app.schemas import LoginRequest, LeadCreate, ...
"""

# Common / shared
from .common import MessageResponse, PaginatedResponse

# User
from .user import PasswordReset, UserBase, UserCreate, UserResponse, UserUpdate

# Auth
from .auth import LoginRequest, TokenData, TokenResponse

# Employee
from .employee import (
    EmployeeBase,
    EmployeeCreate,
    EmployeePerformance,
    EmployeeResponse,
    EmployeeUpdate,
)

# Lead
from .lead import (
    LeadAssignmentResponse,
    LeadAssignRequest,
    LeadBase,
    LeadBulkAssignRequest,
    LeadBulkUploadResponse,
    LeadCreate,
    LeadResponse,
    LeadUpdate,
)

# Call log
from .call_log import CallLogCreate, CallLogResponse

# Follow-up
from .follow_up import FollowUpCreate, FollowUpResponse, FollowUpUpdate

# Document
from .document import DocumentResponse, DocumentVerifyRequest

# Bank
from .bank import BankBase, BankCreate, BankResponse, BankUpdate

# Loan scheme
from .loan_scheme import (
    LoanSchemeBase,
    LoanSchemeCreate,
    LoanSchemeResponse,
    LoanSchemeUpdate,
)

# Loan application
from .loan_application import (
    LoanApplicationCreate,
    LoanApplicationResponse,
    LoanApplicationUpdate,
    StatusHistoryResponse,
)

# Analytics
from .analytics import (
    DailyCallActivity,
    DashboardStats,
    EmployeeLeaderboard,
    LeadStatusDistribution,
    LoanPipeline,
    WeeklyLeadGeneration,
)

__all__ = [
    # Common
    "PaginatedResponse",
    "MessageResponse",
    # User
    "UserBase",
    "UserCreate",
    "UserUpdate",
    "UserResponse",
    "PasswordReset",
    # Auth
    "LoginRequest",
    "TokenResponse",
    "TokenData",
    # Employee
    "EmployeeBase",
    "EmployeeCreate",
    "EmployeeUpdate",
    "EmployeeResponse",
    "EmployeePerformance",
    # Lead
    "LeadBase",
    "LeadCreate",
    "LeadUpdate",
    "LeadResponse",
    "LeadBulkUploadResponse",
    "LeadAssignRequest",
    "LeadBulkAssignRequest",
    "LeadAssignmentResponse",
    # Call log
    "CallLogCreate",
    "CallLogResponse",
    # Follow-up
    "FollowUpCreate",
    "FollowUpUpdate",
    "FollowUpResponse",
    # Document
    "DocumentResponse",
    "DocumentVerifyRequest",
    # Bank
    "BankBase",
    "BankCreate",
    "BankUpdate",
    "BankResponse",
    # Loan scheme
    "LoanSchemeBase",
    "LoanSchemeCreate",
    "LoanSchemeUpdate",
    "LoanSchemeResponse",
    # Loan application
    "LoanApplicationCreate",
    "LoanApplicationUpdate",
    "LoanApplicationResponse",
    "StatusHistoryResponse",
    # Analytics
    "DashboardStats",
    "DailyCallActivity",
    "WeeklyLeadGeneration",
    "EmployeeLeaderboard",
    "LeadStatusDistribution",
    "LoanPipeline",
]
