"""Database seeding script for demonstration and evaluation."""

import asyncio
import os
import uuid
from datetime import date, datetime, timedelta, timezone
from pathlib import Path
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.security import get_password_hash
from app.db.base_class import Base
from app.db.session import async_session_factory, engine
from app.models.activity_log import ActivityLog
from app.models.application_status_history import ApplicationStatusHistory
from app.models.bank import Bank
from app.models.call_log import CallLog, CallOutcome
from app.models.daily_target import DailyTarget
from app.models.document import Document, DocumentCategory, VerificationStatus
from app.models.employee import Employee
from app.models.follow_up import FollowUp, FollowUpStatus
from app.models.lead import EmploymentType, Lead, LeadPriority, LeadStatus
from app.models.lead_assignment import LeadAssignment
from app.models.loan_application import ApplicationStatus, LoanApplication
from app.models.loan_scheme import LoanScheme
from app.models.user import User, UserRole

DEMO_PASSWORD = "Password123!"


async def seed_data():
    """Seed synthetic data for assessment and testing."""
    print("Initializing database tables...")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("Tables verified/created.")

    async with async_session_factory() as db:
        # Check if already seeded
        res = await db.execute(select(User).where(User.email == "admin@loanflow.demo"))
        if res.scalars().first():
            print("Database already contains demo seed data. Skipping re-seed.")
            return

        print("Seeding Users and Employees...")
        now = datetime.now(timezone.utc)
        today = date.today()

        # 1. Admin Account
        admin_user = User(
            email="admin@loanflow.demo",
            password_hash=get_password_hash(DEMO_PASSWORD),
            full_name="Vikramaditya Singhania",
            phone="+91 98201 11223",
            role=UserRole.ADMIN,
            is_active=True,
            created_at=now - timedelta(days=60),
        )
        db.add(admin_user)
        await db.flush()

        # 2. Staff Accounts
        staff_data = [
            ("staff1@loanflow.demo", "Priya Sharma", "+91 98111 22334", "EMP-001", "Retail Loans", 100),
            ("staff2@loanflow.demo", "Rahul Verma", "+91 98222 33445", "EMP-002", "SME & Business", 100),
            ("staff3@loanflow.demo", "Ananya Deshmukh", "+91 98333 44556", "EMP-003", "Home Loans", 100),
            ("staff4@loanflow.demo", "Karthik Nair", "+91 98444 55667", "EMP-004", "Auto Loans", 100),
            ("staff5@loanflow.demo", "Sneha Patel", "+91 98555 66778", "EMP-005", "Personal Loans", 100),
        ]

        staff_employees = []
        for email, name, phone, emp_code, dept, target in staff_data:
            user = User(
                email=email,
                password_hash=get_password_hash(DEMO_PASSWORD),
                full_name=name,
                phone=phone,
                role=UserRole.STAFF,
                is_active=True,
                created_at=now - timedelta(days=45),
            )
            db.add(user)
            await db.flush()

            emp = Employee(
                user_id=user.id,
                employee_id=emp_code,
                department=dept,
                joining_date=today - timedelta(days=90),
                daily_call_target=target,
                is_active=True,
            )
            db.add(emp)
            await db.flush()
            staff_employees.append(emp)

        # 3. Partner Banks
        print("Seeding Partner Banks...")
        banks_info = [
            ("HDFC Bank", "HDFC001", "Ramesh Kulkarni", "ramesh.k@hdfcbank.demo", "+91 22 6655 4400"),
            ("State Bank of India", "SBIN001", "Meenakshi Sundaram", "meenakshi@sbi.demo", "+91 22 2288 3300"),
            ("ICICI Bank", "ICIC001", "Amitabh Joshi", "amitabh.j@icicibank.demo", "+91 22 4008 8000"),
            ("Axis Bank", "UTIB001", "Deepika Rao", "deepika.r@axisbank.demo", "+91 22 2425 2525"),
            ("Kotak Mahindra Bank", "KKBK001", "Sanjay Kapoor", "sanjay.k@kotak.demo", "+91 22 6166 0001"),
        ]

        bank_entities = []
        for name, code, contact, c_email, c_phone in banks_info:
            bank = Bank(
                name=name,
                code=code,
                contact_person=contact,
                contact_email=c_email,
                contact_phone=c_phone,
                is_active=True,
            )
            db.add(bank)
            await db.flush()
            bank_entities.append(bank)

        # 4. Loan Schemes
        print("Seeding Loan Schemes...")
        schemes_data = [
            (bank_entities[0], "HDFC Quick Personal Loan", "Personal Loan", 50000, 4000000, 10.5, 12, 60, "Min income 25k/mo, CIBIL > 720"),
            (bank_entities[0], "HDFC Reach Home Loan", "Home Loan", 500000, 100000000, 8.4, 60, 360, "Salaried / Self-employed with ITR"),
            (bank_entities[1], "SBI Regular Home Loan", "Home Loan", 300000, 50000000, 8.5, 60, 360, "Zero processing fee for women"),
            (bank_entities[1], "SBI SME Smart Score", "Business Loan", 1000000, 20000000, 11.2, 12, 84, "GST return history min 2 years"),
            (bank_entities[2], "ICICI Express Car Loan", "Auto Loan", 100000, 5000000, 8.75, 12, 84, "Up to 100% on-road financing"),
            (bank_entities[2], "ICICI Instant Business Installment", "Business Loan", 500000, 15000000, 12.0, 12, 48, "Min turnover 30 Lakhs"),
            (bank_entities[3], "Axis 24x7 Personal Loan", "Personal Loan", 50000, 2500000, 10.75, 12, 60, "Instant disbursal for pre-approved"),
            (bank_entities[4], "Kotak Smart Business Loan", "Business Loan", 300000, 7500000, 11.5, 12, 48, "Collateral-free up to 50 Lakhs"),
        ]

        scheme_entities = []
        for b, sname, cat, min_a, max_a, roi, min_t, max_t, elig in schemes_data:
            sch = LoanScheme(
                bank_id=b.id,
                scheme_name=sname,
                loan_category=cat,
                min_amount=min_a,
                max_amount=max_a,
                interest_rate=roi,
                min_tenure_months=min_t,
                max_tenure_months=max_t,
                eligibility_info=elig,
                is_active=True,
            )
            db.add(sch)
            await db.flush()
            scheme_entities.append(sch)

        # 5. Customer Leads (25 leads)
        print("Seeding Customer Leads...")
        lead_records = [
            ("Aditya Roy", "9820011223", "aditya.roy@example.com", "Mumbai", "Maharashtra", "salaried", 95000, "Personal Loan", 800000, "HDFC Bank", "Google Ads", "high", LeadStatus.INTERESTED, staff_employees[0]),
            ("Pooja Hegde", "9820022334", "pooja.h@example.com", "Bengaluru", "Karnataka", "salaried", 120000, "Home Loan", 6500000, "State Bank of India", "Facebook Ads", "urgent", LeadStatus.APPLICATION_SUBMITTED, staff_employees[2]),
            ("Manish Malhotra", "9820033445", "manish.m@example.com", "New Delhi", "Delhi", "self_employed", 250000, "Business Loan", 4500000, "Kotak Mahindra Bank", "Referral", "high", LeadStatus.DOCUMENTS_PENDING, staff_employees[1]),
            ("Rohan Gupta", "9820044556", "rohan.g@example.com", "Pune", "Maharashtra", "salaried", 60000, "Auto Loan", 900000, "ICICI Bank", "Direct Web", "medium", LeadStatus.CONTACTED, staff_employees[3]),
            ("Kavita Nair", "9820055667", "kavita.n@example.com", "Kochi", "Kerala", "salaried", 85000, "Personal Loan", 500000, "Axis Bank", "Google Ads", "medium", LeadStatus.FOLLOW_UP_REQUIRED, staff_employees[4]),
            ("Suresh Chandra", "9820066778", "suresh.c@example.com", "Chennai", "Tamil Nadu", "business", 180000, "Business Loan", 3000000, "State Bank of India", "Branch Inbound", "urgent", LeadStatus.CONVERTED, staff_employees[1]),
            ("Divya Bharti", "9820077889", "divya.b@example.com", "Hyderabad", "Telangana", "salaried", 110000, "Home Loan", 5200000, "HDFC Bank", "Housing.com", "high", LeadStatus.APPLICATION_SUBMITTED, staff_employees[2]),
            ("Gaurav Taneja", "9820088990", "gaurav.t@example.com", "Gurugram", "Haryana", "salaried", 140000, "Auto Loan", 1800000, "ICICI Bank", "Cardekho", "medium", LeadStatus.INTERESTED, staff_employees[3]),
            ("Sunita Agarwal", "9820099001", "sunita.a@example.com", "Jaipur", "Rajasthan", "self_employed", 90000, "Personal Loan", 400000, "Axis Bank", "Cold Calling", "low", LeadStatus.NOT_INTERESTED, staff_employees[0]),
            ("Nikhil Kamath", "9820100112", "nikhil.k@example.com", "Bengaluru", "Karnataka", "business", 450000, "Business Loan", 10000000, "Kotak Mahindra Bank", "Referral", "urgent", LeadStatus.CONVERTED, staff_employees[1]),
            ("Archana Puran", "9820111223", "archana.p@example.com", "Mumbai", "Maharashtra", "salaried", 75000, "Personal Loan", 350000, "HDFC Bank", "Google Ads", "medium", LeadStatus.CONTACTED, staff_employees[4]),
            ("Varun Dhawan", "9820122334", "varun.d@example.com", "Mumbai", "Maharashtra", "salaried", 150000, "Home Loan", 8500000, "State Bank of India", "Magicbricks", "high", LeadStatus.DOCUMENTS_PENDING, staff_employees[2]),
            ("Shweta Tiwari", "9820133445", "shweta.t@example.com", "Lucknow", "Uttar Pradesh", "salaried", 55000, "Auto Loan", 650000, "ICICI Bank", "Direct Web", "low", LeadStatus.ASSIGNED, staff_employees[3]),
            ("Tarun Mansukhani", "9820144556", "tarun.m@example.com", "Kolkata", "West Bengal", "business", 210000, "Business Loan", 3500000, "Axis Bank", "Referral", "high", LeadStatus.INTERESTED, staff_employees[1]),
            ("Bhavna Pandey", "9820155667", "bhavna.p@example.com", "Ahmedabad", "Gujarat", "salaried", 80000, "Personal Loan", 600000, "HDFC Bank", "Facebook Ads", "medium", LeadStatus.FOLLOW_UP_REQUIRED, staff_employees[0]),
            ("Deepak Chahar", "9820166778", "deepak.c@example.com", "Agra", "Uttar Pradesh", "salaried", 70000, "Auto Loan", 800000, "ICICI Bank", "Google Ads", "medium", LeadStatus.ASSIGNED, staff_employees[4]),
            ("Renu Bala", "9820177889", "renu.b@example.com", "Chandigarh", "Punjab", "salaried", 95000, "Home Loan", 4500000, "State Bank of India", "Direct Web", "high", LeadStatus.DOCUMENTS_PENDING, staff_employees[2]),
            ("Siddharth Nigam", "9820188990", "siddharth.n@example.com", "Noida", "Uttar Pradesh", "self_employed", 85000, "Personal Loan", 450000, "Kotak Mahindra Bank", "Google Ads", "medium", LeadStatus.CONTACTED, staff_employees[0]),
            # Unassigned leads
            ("Farhan Akhtar", "9820199001", "farhan.a@example.com", "Mumbai", "Maharashtra", "business", 350000, "Business Loan", 6000000, "HDFC Bank", "Website Lead Form", "urgent", LeadStatus.NEW, None),
            ("Zoya Morani", "9820200112", "zoya.m@example.com", "Bhopal", "Madhya Pradesh", "salaried", 65000, "Personal Loan", 300000, "Axis Bank", "Organic Search", "medium", LeadStatus.NEW, None),
            ("Abhishek Banerjee", "9820211223", "abhishek.b@example.com", "Kolkata", "West Bengal", "salaried", 90000, "Auto Loan", 750000, "ICICI Bank", "Direct Web", "medium", LeadStatus.NEW, None),
            ("Isha Koppikar", "9820222334", "isha.k@example.com", "Nagpur", "Maharashtra", "self_employed", 110000, "Home Loan", 3800000, "State Bank of India", "Google Ads", "high", LeadStatus.NEW, None),
            ("Chirag Paswan", "9820233445", "chirag.p@example.com", "Patna", "Bihar", "business", 200000, "Business Loan", 2500000, "Kotak Mahindra Bank", "Referral", "high", LeadStatus.NEW, None),
            ("Mrunal Thakur", "9820244556", "mrunal.t@example.com", "Thane", "Maharashtra", "salaried", 130000, "Personal Loan", 700000, "HDFC Bank", "Facebook Ads", "medium", LeadStatus.NEW, None),
            ("Kartik Aaryan", "9820255667", "kartik.a@example.com", "Gwalior", "Madhya Pradesh", "salaried", 85000, "Home Loan", 4200000, "State Bank of India", "Direct Web", "high", LeadStatus.NEW, None),
        ]

        lead_entities = []
        for name, ph, em, city, st, emp_type, inc, ltype, req_amt, pref_b, src, prio, stat, assigned_emp in lead_records:
            lead = Lead(
                customer_name=name,
                phone=ph,
                email=em,
                city=city,
                state=st,
                employment_type=emp_type,
                monthly_income=inc,
                loan_type=ltype,
                requested_amount=req_amt,
                preferred_bank=pref_b,
                lead_source=src,
                priority=prio,
                status=stat,
                assigned_employee_id=assigned_emp.id if assigned_emp else None,
                last_contact_date=now - timedelta(days=2) if assigned_emp else None,
                created_at=now - timedelta(days=10),
            )
            db.add(lead)
            await db.flush()
            lead_entities.append(lead)

            if assigned_emp:
                assign = LeadAssignment(
                    lead_id=lead.id,
                    employee_id=assigned_emp.id,
                    assigned_by=admin_user.id,
                    assigned_at=now - timedelta(days=9),
                    is_active=True,
                )
                db.add(assign)

        # 6. Call Logs
        print("Seeding Call Logs...")
        call_scenarios = [
            (lead_entities[0], staff_employees[0], 180, CallOutcome.INTERESTED, "Customer wants 8 Lakhs personal loan for home renovation. Documents requested."),
            (lead_entities[1], staff_employees[2], 320, CallOutcome.INTERESTED, "Customer ready with 20% down payment for 65L apartment in Whitefield."),
            (lead_entities[2], staff_employees[1], 240, CallOutcome.FOLLOW_UP_REQUIRED, "Discussed working capital scheme. Needs to consult with CA regarding balance sheet."),
            (lead_entities[3], staff_employees[3], 120, CallOutcome.CALL_BACK_LATER, "In a meeting, asked to call tomorrow post 3 PM."),
            (lead_entities[4], staff_employees[4], 95, CallOutcome.FOLLOW_UP_REQUIRED, "Interest rate of 10.75% accepted. Needs salary slip verification."),
            (lead_entities[5], staff_employees[1], 290, CallOutcome.INTERESTED, "Expanding factory footprint, looking for fast 30L disbursement."),
            (lead_entities[6], staff_employees[2], 210, CallOutcome.INTERESTED, "Application submitted for Gachibowli property. Bank verification initiated."),
            (lead_entities[7], staff_employees[3], 150, CallOutcome.INTERESTED, "Booking Hyundai Creta next week, wants pre-approved letter."),
            (lead_entities[8], staff_employees[0], 45, CallOutcome.NOT_INTERESTED, "Already opted for loan from another bank."),
            (lead_entities[9], staff_employees[1], 400, CallOutcome.INTERESTED, "Substantial corporate turnover. Loan sanctioned and disbursed."),
            (lead_entities[10], staff_employees[4], 60, CallOutcome.BUSY, "Customer did not pick up. Sent follow-up WhatsApp message."),
            (lead_entities[11], staff_employees[2], 185, CallOutcome.FOLLOW_UP_REQUIRED, "Awaiting co-applicant PAN card and form 16."),
        ]

        # Also add calls for today to populate the 100-call progress tracker
        for i in range(15):
            call_today = CallLog(
                lead_id=lead_entities[i % len(lead_entities)].id,
                employee_id=staff_employees[0].id,
                call_datetime=now - timedelta(hours=i % 6, minutes=i * 4),
                duration_seconds=90 + (i * 15),
                outcome=CallOutcome.INTERESTED if i % 3 == 0 else (CallOutcome.BUSY if i % 4 == 0 else CallOutcome.NO_ANSWER),
                remarks=f"Daily outbound outreach batch #{i+1}",
                next_follow_up_date=now + timedelta(days=2) if i % 3 == 0 else None,
            )
            db.add(call_today)

        for l, emp, dur, outc, rem in call_scenarios:
            c = CallLog(
                lead_id=l.id,
                employee_id=emp.id,
                call_datetime=now - timedelta(days=1, hours=dur % 8),
                duration_seconds=dur,
                outcome=outc,
                remarks=rem,
                next_follow_up_date=now + timedelta(days=2) if outc == CallOutcome.FOLLOW_UP_REQUIRED else None,
            )
            db.add(c)

        # 7. Follow Ups (upcoming, overdue, completed)
        print("Seeding Follow-ups...")
        followup_samples = [
            (lead_entities[0], staff_employees[0], today + timedelta(days=1), FollowUpStatus.PENDING, "Collect latest 3 months bank statement and Form 16."),
            (lead_entities[1], staff_employees[2], today, FollowUpStatus.PENDING, "Follow up on SBI Home Loan login sanction letter."),
            (lead_entities[2], staff_employees[1], today - timedelta(days=2), FollowUpStatus.PENDING, "Overdue: Collect CA audited report for FY24."),
            (lead_entities[3], staff_employees[3], today + timedelta(days=2), FollowUpStatus.PENDING, "Call back regarding vehicle quotation."),
            (lead_entities[4], staff_employees[4], today - timedelta(days=1), FollowUpStatus.PENDING, "Overdue: Confirm company email verification status."),
            (lead_entities[5], staff_employees[1], today - timedelta(days=4), FollowUpStatus.COMPLETED, "Completed: Received signed agreement."),
            (lead_entities[11], staff_employees[2], today, FollowUpStatus.PENDING, "Confirm property valuation schedule with bank officer."),
        ]

        for l, emp, s_date, stat, rem in followup_samples:
            fu = FollowUp(
                lead_id=l.id,
                employee_id=emp.id,
                scheduled_date=s_date,
                status=stat,
                remarks=rem,
                completed_date=now - timedelta(days=3) if stat == FollowUpStatus.COMPLETED else None,
            )
            db.add(fu)

        # 8. Synthetic Documents on disk and in DB
        print("Seeding Documents...")
        upload_root = Path(settings.UPLOAD_DIR)
        upload_root.mkdir(parents=True, exist_ok=True)

        sample_docs = [
            (lead_entities[0], staff_employees[0], DocumentCategory.AADHAAR, "aadhaar_card.pdf", "application/pdf", VerificationStatus.VERIFIED, admin_user.id, None),
            (lead_entities[0], staff_employees[0], DocumentCategory.PAN, "pan_card.jpg", "image/jpeg", VerificationStatus.VERIFIED, admin_user.id, None),
            (lead_entities[0], staff_employees[0], DocumentCategory.SALARY_SLIP, "salary_slips_q3.pdf", "application/pdf", VerificationStatus.PENDING, None, None),
            (lead_entities[1], staff_employees[2], DocumentCategory.BANK_STATEMENT, "bank_statement_6m.pdf", "application/pdf", VerificationStatus.VERIFIED, admin_user.id, None),
            (lead_entities[2], staff_employees[1], DocumentCategory.EMPLOYMENT_PROOF, "business_gst_cert.pdf", "application/pdf", VerificationStatus.REJECTED, admin_user.id, "GST certificate image is blurry, please re-upload clear scan."),
            (lead_entities[6], staff_employees[2], DocumentCategory.ADDRESS_PROOF, "electricity_bill.pdf", "application/pdf", VerificationStatus.PENDING, None, None),
        ]

        for l, emp, cat, fname, mime, v_stat, v_by, rej_rem in sample_docs:
            lead_dir = upload_root / str(l.id)
            lead_dir.mkdir(parents=True, exist_ok=True)
            dummy_file_path = lead_dir / f"demo_{fname}"
            if not dummy_file_path.exists():
                with open(dummy_file_path, "wb") as f:
                    f.write(b"%PDF-1.4 Demonstration synthetic document for LoanFlow CRM\n" * 50)

            doc = Document(
                lead_id=l.id,
                uploaded_by=emp.id,
                category=cat,
                file_name=fname,
                file_path=str(dummy_file_path),
                file_size=len(b"%PDF-1.4 Demonstration synthetic document for LoanFlow CRM\n" * 50),
                mime_type=mime,
                verification_status=v_stat,
                verified_by=v_by,
                verified_at=now - timedelta(days=1) if v_stat != VerificationStatus.PENDING else None,
                rejection_remarks=rej_rem,
            )
            db.add(doc)

        # 9. Loan Applications in various stages
        print("Seeding Loan Applications and Timeline History...")
        app_scenarios = [
            (lead_entities[1], staff_employees[2], bank_entities[1], scheme_entities[2], 6500000, 6200000, ApplicationStatus.UNDER_BANK_REVIEW, "Field inspection completed successfully"),
            (lead_entities[5], staff_employees[1], bank_entities[0], scheme_entities[0], 3000000, 3000000, ApplicationStatus.DISBURSED, "Funds transferred via NEFT to customer account"),
            (lead_entities[6], staff_employees[2], bank_entities[0], scheme_entities[1], 5200000, 5000000, ApplicationStatus.SUBMITTED_TO_BANK, "Docket handed over to credit manager"),
            (lead_entities[7], staff_employees[3], bank_entities[2], scheme_entities[4], 1800000, 1800000, ApplicationStatus.APPROVED, "Sanction letter generated and sent to car dealership"),
            (lead_entities[9], staff_employees[1], bank_entities[4], scheme_entities[7], 10000000, 10000000, ApplicationStatus.DISBURSED, "Commercial disbursement completed"),
            (lead_entities[8], staff_employees[0], bank_entities[3], scheme_entities[6], 400000, None, ApplicationStatus.REJECTED, "CIBIL score below bank underwriting threshold (610)"),
        ]

        for l, emp, b, sch, req_a, app_a, stat, rem in app_scenarios:
            application = LoanApplication(
                lead_id=l.id,
                employee_id=emp.id,
                bank_id=b.id,
                loan_scheme_id=sch.id if sch else None,
                requested_amount=req_a,
                approved_amount=app_a,
                application_date=now - timedelta(days=7),
                status=stat,
                remarks=rem,
            )
            db.add(application)
            await db.flush()

            # Status History timeline
            hist1 = ApplicationStatusHistory(
                application_id=application.id,
                old_status=None,
                new_status="draft",
                changed_by=emp.user_id,
                remarks="Initial draft created by sales executive",
                changed_at=now - timedelta(days=7),
            )
            db.add(hist1)

            hist2 = ApplicationStatusHistory(
                application_id=application.id,
                old_status="draft",
                new_status="submitted_to_bank",
                changed_by=emp.user_id,
                remarks="KYC documents verified and file lodged with bank",
                changed_at=now - timedelta(days=5),
            )
            db.add(hist2)

            if stat in (ApplicationStatus.APPROVED, ApplicationStatus.DISBURSED, ApplicationStatus.REJECTED):
                hist3 = ApplicationStatusHistory(
                    application_id=application.id,
                    old_status="submitted_to_bank",
                    new_status=stat.value if hasattr(stat, "value") else str(stat),
                    changed_by=admin_user.id,
                    remarks=rem,
                    changed_at=now - timedelta(days=1),
                )
                db.add(hist3)

        # 10. Daily Targets
        print("Seeding Daily Targets...")
        for emp in staff_employees:
            dt = DailyTarget(
                employee_id=emp.id,
                date=today,
                target_calls=emp.daily_call_target or 100,
                calls_completed=15 if emp == staff_employees[0] else 24,
            )
            db.add(dt)

        await db.commit()
        print("\nSUCCESS: LoanFlow CRM database seeded successfully!")
        print("--------------------------------------------------")
        print(f"Admin Account: admin@loanflow.demo / {DEMO_PASSWORD}")
        print(f"Staff Account: staff1@loanflow.demo / {DEMO_PASSWORD}")
        print("--------------------------------------------------")


if __name__ == "__main__":
    asyncio.run(seed_data())
