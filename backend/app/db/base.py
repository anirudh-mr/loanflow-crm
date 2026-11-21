"""Declarative base and model imports for Alembic autogenerate.

Import this module in migrations/env.py so that all models are registered
with Base.metadata before autogenerate inspects it.
"""

from app.db.base_class import Base  # noqa: F401

# Import every model module so their tables appear in Base.metadata.
from app.models.user import User  # noqa: F401
from app.models.employee import Employee  # noqa: F401
from app.models.lead import Lead  # noqa: F401
from app.models.lead_assignment import LeadAssignment  # noqa: F401
from app.models.call_log import CallLog  # noqa: F401
from app.models.follow_up import FollowUp  # noqa: F401
from app.models.document import Document  # noqa: F401
from app.models.bank import Bank  # noqa: F401
from app.models.loan_scheme import LoanScheme  # noqa: F401
from app.models.loan_application import LoanApplication  # noqa: F401
from app.models.application_status_history import ApplicationStatusHistory  # noqa: F401
from app.models.daily_target import DailyTarget  # noqa: F401
from app.models.activity_log import ActivityLog  # noqa: F401
