-- ==============================================================================
-- LoanFlow CRM - 100% Exact Supabase PostgreSQL Schema
-- Perfectly matched to SQLAlchemy 2.0 ORM Models
-- ==============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Drop existing tables if re-initializing
DROP TABLE IF EXISTS application_status_history CASCADE;
DROP TABLE IF EXISTS loan_applications CASCADE;
DROP TABLE IF EXISTS lead_assignments CASCADE;
DROP TABLE IF EXISTS follow_ups CASCADE;
DROP TABLE IF EXISTS documents CASCADE;
DROP TABLE IF EXISTS call_logs CASCADE;
DROP TABLE IF EXISTS leads CASCADE;
DROP TABLE IF EXISTS daily_targets CASCADE;
DROP TABLE IF EXISTS loan_schemes CASCADE;
DROP TABLE IF EXISTS employees CASCADE;
DROP TABLE IF EXISTS activity_logs CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS banks CASCADE;

-- 3. Create Custom Enum Types
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('admin', 'staff');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE employment_type AS ENUM ('salaried', 'self_employed', 'business', 'freelancer', 'retired', 'other');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE lead_status AS ENUM ('new', 'assigned', 'contacted', 'interested', 'not_interested', 'follow_up_required', 'documents_pending', 'application_submitted', 'converted', 'closed');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE lead_priority AS ENUM ('low', 'medium', 'high', 'urgent');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE call_outcome AS ENUM ('interested', 'not_interested', 'no_answer', 'busy', 'call_back_later', 'wrong_number', 'follow_up_required');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE document_category AS ENUM ('aadhaar', 'pan', 'salary_slip', 'bank_statement', 'address_proof', 'employment_proof', 'other');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE verification_status AS ENUM ('pending', 'verified', 'rejected');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE follow_up_status AS ENUM ('pending', 'completed', 'overdue', 'rescheduled');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE application_status AS ENUM ('draft', 'documents_pending', 'ready_for_submission', 'submitted_to_bank', 'under_bank_review', 'additional_info_required', 'approved', 'rejected', 'disbursed', 'closed');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 4. Banks Table
CREATE TABLE banks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    contact_person VARCHAR(255),
    contact_email VARCHAR(255),
    contact_phone VARCHAR(20),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Users Table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    role user_role NOT NULL DEFAULT 'staff',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_users_email ON users(email);

-- 6. Activity Logs Table
CREATE TABLE activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    action VARCHAR(255) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id INTEGER,
    details JSON,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. Employees Table
CREATE TABLE employees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    employee_id VARCHAR(50) UNIQUE NOT NULL,
    department VARCHAR(100) DEFAULT 'Sales & Calling',
    joining_date DATE DEFAULT CURRENT_DATE,
    daily_call_target INTEGER NOT NULL DEFAULT 100,
    is_active BOOLEAN NOT NULL DEFAULT true
);

CREATE INDEX idx_employees_emp_id ON employees(employee_id);

-- 8. Loan Schemes Catalog
CREATE TABLE loan_schemes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bank_id UUID NOT NULL REFERENCES banks(id) ON DELETE CASCADE,
    scheme_name VARCHAR(255) NOT NULL,
    loan_category VARCHAR(100),
    min_amount NUMERIC(15, 2) DEFAULT 10000.00,
    max_amount NUMERIC(15, 2) DEFAULT 10000000.00,
    interest_rate NUMERIC(5, 2) NOT NULL,
    min_tenure_months INTEGER DEFAULT 6,
    max_tenure_months INTEGER DEFAULT 360,
    eligibility_info TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 9. Daily Targets Table
CREATE TABLE daily_targets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    target_calls INTEGER NOT NULL DEFAULT 100,
    calls_completed INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_daily_target_employee_date UNIQUE (employee_id, date)
);

-- 10. Customer Leads Table
CREATE TABLE leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(100),
    employment_type employment_type,
    monthly_income NUMERIC(15, 2),
    loan_type VARCHAR(100),
    requested_amount NUMERIC(15, 2),
    preferred_bank VARCHAR(255),
    lead_source VARCHAR(100),
    assigned_employee_id UUID REFERENCES employees(id) ON DELETE SET NULL,
    status lead_status NOT NULL DEFAULT 'new',
    priority lead_priority NOT NULL DEFAULT 'medium',
    last_contact_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_leads_phone ON leads(phone);
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_assigned ON leads(assigned_employee_id);

-- 11. Call Logs Table
CREATE TABLE call_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    call_datetime TIMESTAMPTZ NOT NULL DEFAULT now(),
    duration_seconds INTEGER DEFAULT 0,
    outcome call_outcome NOT NULL,
    remarks TEXT,
    next_follow_up_date TIMESTAMPTZ
);

CREATE INDEX idx_calls_lead ON call_logs(lead_id);
CREATE INDEX idx_calls_emp ON call_logs(employee_id);

-- 12. KYC Documents Table
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    uploaded_by UUID NOT NULL REFERENCES employees(id) ON DELETE SET NULL,
    category document_category NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size INTEGER,
    mime_type VARCHAR(100),
    verification_status verification_status NOT NULL DEFAULT 'pending',
    verified_by UUID REFERENCES users(id) ON DELETE SET NULL,
    verified_at TIMESTAMPTZ,
    rejection_remarks TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_documents_lead ON documents(lead_id);

-- 13. Follow-Ups Table
CREATE TABLE follow_ups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    scheduled_date TIMESTAMPTZ NOT NULL,
    completed_date TIMESTAMPTZ,
    status follow_up_status NOT NULL DEFAULT 'pending',
    remarks TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_followups_emp ON follow_ups(employee_id);

-- 14. Lead Assignments Audit Table
CREATE TABLE lead_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    assigned_by UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    unassigned_at TIMESTAMPTZ,
    is_active BOOLEAN NOT NULL DEFAULT true
);

-- 15. Loan Applications Table
CREATE TABLE loan_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    bank_id UUID NOT NULL REFERENCES banks(id) ON DELETE CASCADE,
    loan_scheme_id UUID REFERENCES loan_schemes(id) ON DELETE SET NULL,
    requested_amount NUMERIC(15, 2) NOT NULL,
    approved_amount NUMERIC(15, 2),
    application_date TIMESTAMPTZ NOT NULL DEFAULT now(),
    status application_status NOT NULL DEFAULT 'draft',
    remarks TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_applications_lead ON loan_applications(lead_id);
CREATE INDEX idx_applications_emp ON loan_applications(employee_id);
CREATE INDEX idx_applications_status ON loan_applications(status);

-- 16. Application Status History Table
CREATE TABLE application_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID NOT NULL REFERENCES loan_applications(id) ON DELETE CASCADE,
    old_status VARCHAR(50),
    new_status VARCHAR(50) NOT NULL,
    changed_by UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
    remarks TEXT,
    changed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 17. Enable Supabase Realtime
DO $$ BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE leads;
    ALTER PUBLICATION supabase_realtime ADD TABLE call_logs;
    ALTER PUBLICATION supabase_realtime ADD TABLE follow_ups;
    ALTER PUBLICATION supabase_realtime ADD TABLE loan_applications;
EXCEPTION WHEN OTHERS THEN NULL; END $$;
