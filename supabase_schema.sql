-- ==============================================================================
-- LoanFlow CRM - Production Supabase PostgreSQL Schema & Realtime Setup
-- ==============================================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Clean Existing Tables (Optional - run only on fresh setup)
-- DROP TABLE IF EXISTS activity_logs CASCADE;
-- DROP TABLE IF EXISTS application_status_histories CASCADE;
-- DROP TABLE IF EXISTS loan_applications CASCADE;
-- DROP TABLE IF EXISTS loan_schemes CASCADE;
-- DROP TABLE IF EXISTS banks CASCADE;
-- DROP TABLE IF EXISTS documents CASCADE;
-- DROP TABLE IF EXISTS follow_ups CASCADE;
-- DROP TABLE IF EXISTS call_logs CASCADE;
-- DROP TABLE IF EXISTS daily_targets CASCADE;
-- DROP TABLE IF EXISTS lead_assignments CASCADE;
-- DROP TABLE IF EXISTS leads CASCADE;
-- DROP TABLE IF EXISTS employees CASCADE;
-- DROP TABLE IF EXISTS users CASCADE;

-- 3. Users Table (Admin & Staff)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    phone VARCHAR(30),
    role VARCHAR(20) NOT NULL DEFAULT 'staff' CHECK (role IN ('admin', 'staff')),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- 4. Employees Table (Call Centre Agents)
CREATE TABLE IF NOT EXISTS employees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    employee_id VARCHAR(50) UNIQUE NOT NULL,
    department VARCHAR(100) DEFAULT 'Sales & Calling',
    joining_date DATE DEFAULT CURRENT_DATE,
    daily_call_target INTEGER NOT NULL DEFAULT 100,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_employees_user_id ON employees(user_id);
CREATE INDEX IF NOT EXISTS idx_employees_employee_id ON employees(employee_id);

-- 5. Customer Leads Table
CREATE TABLE IF NOT EXISTS leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_name VARCHAR(150) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    employment_type VARCHAR(50) NOT NULL DEFAULT 'Salaried',
    monthly_income NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    loan_type VARCHAR(50) NOT NULL DEFAULT 'Personal Loan',
    requested_amount NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
    preferred_bank VARCHAR(100),
    lead_source VARCHAR(100) NOT NULL DEFAULT 'Online Ad',
    priority VARCHAR(20) NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    status VARCHAR(50) NOT NULL DEFAULT 'new',
    assigned_employee_id UUID REFERENCES employees(id) ON DELETE SET NULL,
    last_contact_date TIMESTAMPTZ,
    is_archived BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_leads_phone ON leads(phone);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_assigned_employee ON leads(assigned_employee_id);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at);

-- 6. Lead Assignment Audit Log
CREATE TABLE IF NOT EXISTS lead_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    assigned_by_id UUID REFERENCES users(id) ON DELETE SET NULL,
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    unassigned_at TIMESTAMPTZ,
    remarks VARCHAR(255)
);

CREATE INDEX IF NOT EXISTS idx_lead_assignments_lead ON lead_assignments(lead_id);
CREATE INDEX IF NOT EXISTS idx_lead_assignments_emp ON lead_assignments(employee_id);

-- 7. Call Activity Logs Table
CREATE TABLE IF NOT EXISTS call_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    call_datetime TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    duration_seconds INTEGER NOT NULL DEFAULT 0,
    outcome VARCHAR(50) NOT NULL CHECK (outcome IN ('interested', 'not_interested', 'no_answer', 'busy', 'call_back_later', 'wrong_number', 'follow_up_required')),
    remarks TEXT,
    next_follow_up_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_calls_lead ON call_logs(lead_id);
CREATE INDEX IF NOT EXISTS idx_calls_emp ON call_logs(employee_id);
CREATE INDEX IF NOT EXISTS idx_calls_datetime ON call_logs(call_datetime);
CREATE INDEX IF NOT EXISTS idx_calls_outcome ON call_logs(outcome);

-- 8. Customer Follow-up Commitments Table
CREATE TABLE IF NOT EXISTS follow_ups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    scheduled_date DATE NOT NULL,
    completed_date TIMESTAMPTZ,
    status VARCHAR(30) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'overdue', 'rescheduled')),
    remarks TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_followups_emp ON follow_ups(employee_id);
CREATE INDEX IF NOT EXISTS idx_followups_scheduled_date ON follow_ups(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_followups_status ON follow_ups(status);

-- 9. KYC Documents Table
CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    uploaded_by_id UUID REFERENCES users(id) ON DELETE SET NULL,
    category VARCHAR(50) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size INTEGER NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    verification_status VARCHAR(30) NOT NULL DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
    verified_by_id UUID REFERENCES users(id) ON DELETE SET NULL,
    verified_at TIMESTAMPTZ,
    rejection_remarks TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_documents_lead ON documents(lead_id);
CREATE INDEX IF NOT EXISTS idx_documents_status ON documents(verification_status);

-- 10. Partner Banks Table
CREATE TABLE IF NOT EXISTS banks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(150) NOT NULL,
    code VARCHAR(30) UNIQUE NOT NULL,
    contact_person VARCHAR(100),
    contact_email VARCHAR(255),
    contact_phone VARCHAR(50),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. Loan Schemes Catalog Table
CREATE TABLE IF NOT EXISTS loan_schemes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bank_id UUID NOT NULL REFERENCES banks(id) ON DELETE CASCADE,
    scheme_name VARCHAR(150) NOT NULL,
    loan_category VARCHAR(100) NOT NULL,
    min_amount NUMERIC(14, 2) NOT NULL DEFAULT 10000.00,
    max_amount NUMERIC(14, 2) NOT NULL DEFAULT 10000000.00,
    interest_rate NUMERIC(5, 2) NOT NULL,
    min_tenure_months INTEGER NOT NULL DEFAULT 6,
    max_tenure_months INTEGER NOT NULL DEFAULT 360,
    eligibility_info TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_schemes_bank ON loan_schemes(bank_id);

-- 12. Loan Applications Table
CREATE TABLE IF NOT EXISTS loan_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    bank_id UUID NOT NULL REFERENCES banks(id) ON DELETE CASCADE,
    loan_scheme_id UUID REFERENCES loan_schemes(id) ON DELETE SET NULL,
    requested_amount NUMERIC(14, 2) NOT NULL,
    approved_amount NUMERIC(14, 2),
    application_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    status VARCHAR(50) NOT NULL DEFAULT 'draft',
    remarks TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_applications_lead ON loan_applications(lead_id);
CREATE INDEX IF NOT EXISTS idx_applications_emp ON loan_applications(employee_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON loan_applications(status);

-- 13. Application Status History (Underwriting Audit Trail)
CREATE TABLE IF NOT EXISTS application_status_histories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID NOT NULL REFERENCES loan_applications(id) ON DELETE CASCADE,
    old_status VARCHAR(50),
    new_status VARCHAR(50) NOT NULL,
    changed_by_id UUID REFERENCES users(id) ON DELETE SET NULL,
    remarks TEXT,
    changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_history_app ON application_status_histories(application_id);

-- 14. 100-Call Daily Target Archive Table
CREATE TABLE IF NOT EXISTS daily_targets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    target_date DATE NOT NULL DEFAULT CURRENT_DATE,
    target_calls INTEGER NOT NULL DEFAULT 100,
    calls_completed INTEGER NOT NULL DEFAULT 0,
    remaining_calls INTEGER NOT NULL DEFAULT 100,
    target_completion_pct NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    is_achieved BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_emp_date UNIQUE(employee_id, target_date)
);

-- 15. Activity & Audit Logs Table
CREATE TABLE IF NOT EXISTS activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id VARCHAR(100),
    details JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- 16. Enable Supabase Realtime for Core Tables
-- ==============================================================================
-- Allows frontend or connected WebSocket clients to subscribe to instant row updates:
DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE leads;
    ALTER PUBLICATION supabase_realtime ADD TABLE call_logs;
    ALTER PUBLICATION supabase_realtime ADD TABLE follow_ups;
    ALTER PUBLICATION supabase_realtime ADD TABLE loan_applications;
EXCEPTION WHEN OTHERS THEN
    -- Table already added or publication created
    NULL;
END $$;

-- ==============================================================================
-- 17. Seed Initial Administrator Account (Password: Password123!)
-- Bcrypt hash generated with standard 12 salt rounds
-- ==============================================================================
INSERT INTO users (id, email, hashed_password, full_name, role, is_active)
VALUES (
    'a0000000-0000-0000-0000-000000000001',
    'admin@loanflow.demo',
    '$2b$12$YqU8YF9ZqX9U9fE2F/Zqee3Z4HnBqQe5j6G4b7N6P3Q5T8v9M0W.2',
    'System Administrator',
    'admin',
    true
)
ON CONFLICT (email) DO NOTHING;
