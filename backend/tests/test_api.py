"""Automated tests for LoanFlow CRM backend API."""

import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient

from app.main import app

BASE_URL = "http://testserver"


@pytest_asyncio.fixture
async def client():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url=BASE_URL) as ac:
        yield ac


@pytest_asyncio.fixture
async def admin_token(client: AsyncClient):
    """Obtain JWT token for admin."""
    res = await client.post(
        "/api/v1/auth/login",
        json={"email": "admin@loanflow.demo", "password": "Password123!"},
    )
    assert res.status_code == 200, res.text
    return res.json()["access_token"]


@pytest_asyncio.fixture
async def staff_token(client: AsyncClient):
    """Obtain JWT token for staff."""
    res = await client.post(
        "/api/v1/auth/login",
        json={"email": "staff1@loanflow.demo", "password": "Password123!"},
    )
    assert res.status_code == 200, res.text
    return res.json()["access_token"]


@pytest.mark.asyncio
async def test_health_check(client: AsyncClient):
    res = await client.get("/health")
    assert res.status_code == 200
    assert res.json()["status"] == "healthy"


@pytest.mark.asyncio
async def test_admin_login_success(client: AsyncClient):
    res = await client.post(
        "/api/v1/auth/login",
        json={"email": "admin@loanflow.demo", "password": "Password123!"},
    )
    assert res.status_code == 200
    data = res.json()
    assert "access_token" in data
    assert data["user"]["role"] == "admin"
    assert data["user"]["email"] == "admin@loanflow.demo"


@pytest.mark.asyncio
async def test_staff_login_success(client: AsyncClient):
    res = await client.post(
        "/api/v1/auth/login",
        json={"email": "staff1@loanflow.demo", "password": "Password123!"},
    )
    assert res.status_code == 200
    data = res.json()
    assert "access_token" in data
    assert data["user"]["role"] == "staff"


@pytest.mark.asyncio
async def test_invalid_login_rejected(client: AsyncClient):
    res = await client.post(
        "/api/v1/auth/login",
        json={"email": "admin@loanflow.demo", "password": "WrongPassword!"},
    )
    assert res.status_code == 401


@pytest.mark.asyncio
async def test_staff_cannot_access_admin_routes(client: AsyncClient, staff_token: str):
    """RBAC check: staff must be rejected with 403 on admin-only endpoints."""
    headers = {"Authorization": f"Bearer {staff_token}"}

    # Attempt to access admin dashboard stats
    res = await client.get("/api/v1/analytics/dashboard", headers=headers)
    assert res.status_code == 403

    # Attempt to create an employee
    res2 = await client.post(
        "/api/v1/employees",
        headers=headers,
        json={
            "employee_id": "EMP-999",
            "department": "Unauthorized",
            "joining_date": "2026-01-01",
            "daily_call_target": 100,
            "user": {
                "email": "hacker@loanflow.demo",
                "full_name": "Intruder",
                "password": "Password123!",
                "role": "staff",
            },
        },
    )
    assert res2.status_code == 403


@pytest.mark.asyncio
async def test_admin_dashboard_metrics(client: AsyncClient, admin_token: str):
    headers = {"Authorization": f"Bearer {admin_token}"}
    res = await client.get("/api/v1/analytics/dashboard", headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert data["total_leads"] > 0
    assert data["total_employees"] >= 5
    assert "calls_today" in data
    assert "daily_target" in data


@pytest.mark.asyncio
async def test_admin_lead_creation_and_assignment(
    client: AsyncClient, admin_token: str
):
    headers = {"Authorization": f"Bearer {admin_token}"}

    # 1. Create lead
    new_lead_payload = {
        "customer_name": "Test Customer",
        "phone": "9998887776",
        "email": "test.customer@example.com",
        "city": "Mumbai",
        "state": "Maharashtra",
        "employment_type": "salaried",
        "monthly_income": 85000,
        "loan_type": "Personal Loan",
        "requested_amount": 500000,
        "preferred_bank": "HDFC Bank",
        "lead_source": "Automated Test",
        "priority": "high",
    }
    create_res = await client.post("/api/v1/leads", headers=headers, json=new_lead_payload)
    assert create_res.status_code == 201, create_res.text
    lead = create_res.json()
    lead_id = lead["id"]
    assert lead["customer_name"] == "Test Customer"
    assert lead["status"] == "new"

    # 2. Get active employees to assign to
    emp_res = await client.get("/api/v1/employees?page=1&page_size=5", headers=headers)
    assert emp_res.status_code == 200
    employees = emp_res.json()["items"]
    assert len(employees) > 0
    emp_id = employees[0]["id"]

    # 3. Assign lead
    assign_res = await client.post(
        "/api/v1/leads/assign",
        headers=headers,
        json={"lead_ids": [lead_id], "employee_id": emp_id},
    )
    assert assign_res.status_code == 200

    # 4. Verify lead is now assigned
    verify_res = await client.get(f"/api/v1/leads/{lead_id}", headers=headers)
    assert verify_res.status_code == 200
    updated_lead = verify_res.json()
    assert updated_lead["assigned_employee_id"] == emp_id
    assert updated_lead["status"] == "assigned"


@pytest.mark.asyncio
async def test_staff_leads_and_call_logging(client: AsyncClient, staff_token: str):
    headers = {"Authorization": f"Bearer {staff_token}"}

    # 1. List assigned leads
    leads_res = await client.get("/api/v1/leads", headers=headers)
    assert leads_res.status_code == 200
    leads = leads_res.json()["items"]
    assert len(leads) > 0
    target_lead = leads[0]
    lead_id = target_lead["id"]

    # 2. Check call progress before call
    prog_before = await client.get("/api/v1/calls/progress", headers=headers)
    assert prog_before.status_code == 200
    completed_before = prog_before.json()["completed"]

    # 3. Log a call
    call_payload = {
        "lead_id": lead_id,
        "outcome": "interested",
        "duration_seconds": 180,
        "remarks": "Customer is very interested, wants 5 Lakhs.",
        "next_follow_up_date": "2026-11-25T10:00:00Z",
    }
    call_res = await client.post("/api/v1/calls", headers=headers, json=call_payload)
    assert call_res.status_code == 201, call_res.text
    call_data = call_res.json()
    assert call_data["outcome"] == "interested"

    # 4. Check call progress incremented
    prog_after = await client.get("/api/v1/calls/progress", headers=headers)
    assert prog_after.status_code == 200
    assert prog_after.json()["completed"] == completed_before + 1

    # 5. Check lead status updated to interested
    lead_check = await client.get(f"/api/v1/leads/{lead_id}", headers=headers)
    assert lead_check.status_code == 200
    assert lead_check.json()["status"] == "interested"


@pytest.mark.asyncio
async def test_followup_lifecycle(client: AsyncClient, staff_token: str):
    headers = {"Authorization": f"Bearer {staff_token}"}

    # 1. Get a lead
    leads_res = await client.get("/api/v1/leads", headers=headers)
    lead_id = leads_res.json()["items"][0]["id"]

    # 2. Schedule follow up
    fu_res = await client.post(
        "/api/v1/followups",
        headers=headers,
        json={
            "lead_id": lead_id,
            "scheduled_date": "2026-11-28",
            "remarks": "Verification check call",
        },
    )
    assert fu_res.status_code == 201
    fu = fu_res.json()
    fu_id = fu["id"]
    assert fu["status"] == "pending"

    # 3. Complete follow up
    complete_res = await client.patch(
        f"/api/v1/followups/{fu_id}/complete",
        headers=headers,
        json={"remarks": "Customer completed KYC"},
    )
    assert complete_res.status_code == 200
    assert complete_res.json()["status"] == "completed"


@pytest.mark.asyncio
async def test_document_verification_workflow(
    client: AsyncClient, staff_token: str, admin_token: str
):
    staff_headers = {"Authorization": f"Bearer {staff_token}"}
    admin_headers = {"Authorization": f"Bearer {admin_token}"}

    # 1. Get lead
    leads = (await client.get("/api/v1/leads", headers=staff_headers)).json()["items"]
    lead_id = leads[0]["id"]

    # 2. Upload document as staff
    upload_res = await client.post(
        "/api/v1/documents/upload",
        headers=staff_headers,
        data={"lead_id": lead_id, "category": "salary_slip"},
        files={"file": ("payslip_oct.pdf", b"%PDF-1.4 sample content", "application/pdf")},
    )
    assert upload_res.status_code == 201, upload_res.text
    doc_id = upload_res.json()["id"]
    assert upload_res.json()["verification_status"] == "pending"

    # 3. Admin verifies document
    verify_res = await client.patch(
        f"/api/v1/documents/{doc_id}/verify",
        headers=admin_headers,
        json={"status": "verified"},
    )
    assert verify_res.status_code == 200
    assert verify_res.json()["verification_status"] == "verified"
    assert verify_res.json()["verified_by_name"] is not None


@pytest.mark.asyncio
async def test_reports_and_export(client: AsyncClient, admin_token: str):
    headers = {"Authorization": f"Bearer {admin_token}"}

    res = await client.get("/api/v1/reports/call-performance?period=daily", headers=headers)
    assert res.status_code == 200
    assert isinstance(res.json(), list)

    res2 = await client.get("/api/v1/reports/bank-wise", headers=headers)
    assert res2.status_code == 200
    assert isinstance(res2.json(), list)

    csv_res = await client.get("/api/v1/reports/export?report_type=bank_wise", headers=headers)
    assert csv_res.status_code == 200
    assert "text/csv" in csv_res.headers.get("content-type", "")
