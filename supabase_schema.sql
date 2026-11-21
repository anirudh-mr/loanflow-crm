-- ==============================================================================
-- LoanFlow CRM - 100% Exact Supabase PostgreSQL DDL
-- Generated directly from SQLAlchemy ORM metadata
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Reset Schema cleanly
DROP SCHEMA IF EXISTS public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;
GRANT ALL ON SCHEMA public TO anon;
GRANT ALL ON SCHEMA public TO authenticated;
GRANT ALL ON SCHEMA public TO service_role;

-- 2. Create Enums with Exact SQLAlchemy Uppercase Values
CREATE TYPE user_role AS ENUM ('ADMIN', 'STAFF');
CREATE TYPE employment_type AS ENUM ('SALARIED', 'SELF_EMPLOYED', 'BUSINESS', 'FREELANCER', 'RETIRED', 'OTHER');
CREATE TYPE lead_status AS ENUM ('NEW', 'ASSIGNED', 'CONTACTED', 'INTERESTED', 'NOT_INTERESTED', 'FOLLOW_UP_REQUIRED', 'DOCUMENTS_PENDING', 'APPLICATION_SUBMITTED', 'CONVERTED', 'CLOSED');
CREATE TYPE lead_priority AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');
CREATE TYPE call_outcome AS ENUM ('INTERESTED', 'NOT_INTERESTED', 'NO_ANSWER', 'BUSY', 'CALL_BACK_LATER', 'WRONG_NUMBER', 'FOLLOW_UP_REQUIRED');
CREATE TYPE document_category AS ENUM ('AADHAAR', 'PAN', 'SALARY_SLIP', 'BANK_STATEMENT', 'ADDRESS_PROOF', 'EMPLOYMENT_PROOF', 'OTHER');
CREATE TYPE verification_status AS ENUM ('PENDING', 'VERIFIED', 'REJECTED');
CREATE TYPE follow_up_status AS ENUM ('PENDING', 'COMPLETED', 'OVERDUE', 'RESCHEDULED');
CREATE TYPE application_status AS ENUM ('DRAFT', 'DOCUMENTS_PENDING', 'READY_FOR_SUBMISSION', 'SUBMITTED_TO_BANK', 'UNDER_BANK_REVIEW', 'ADDITIONAL_INFO_REQUIRED', 'APPROVED', 'REJECTED', 'DISBURSED', 'CLOSED');

-- 3. Create Tables
-- Table: banks
CREATE TABLE banks (
	id UUID NOT NULL, 
	name VARCHAR(255) NOT NULL, 
	code VARCHAR(50) NOT NULL, 
	contact_person VARCHAR(255), 
	contact_email VARCHAR(255), 
	contact_phone VARCHAR(20), 
	is_active BOOLEAN NOT NULL, 
	created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	PRIMARY KEY (id)
);

-- Table: users
CREATE TABLE users (
	id UUID NOT NULL, 
	email VARCHAR(255) NOT NULL, 
	password_hash VARCHAR(255) NOT NULL, 
	full_name VARCHAR(255) NOT NULL, 
	phone VARCHAR(20), 
	role user_role NOT NULL, 
	is_active BOOLEAN NOT NULL, 
	created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	PRIMARY KEY (id)
);

-- Table: activity_logs
CREATE TABLE activity_logs (
	id UUID NOT NULL, 
	user_id UUID NOT NULL, 
	action VARCHAR(255) NOT NULL, 
	entity_type VARCHAR(100) NOT NULL, 
	entity_id INTEGER, 
	details JSON, 
	created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	PRIMARY KEY (id), 
	FOREIGN KEY(user_id) REFERENCES users (id) ON DELETE CASCADE
);

-- Table: employees
CREATE TABLE employees (
	id UUID NOT NULL, 
	user_id UUID NOT NULL, 
	employee_id VARCHAR(50) NOT NULL, 
	department VARCHAR(100), 
	joining_date DATE, 
	daily_call_target INTEGER NOT NULL, 
	is_active BOOLEAN NOT NULL, 
	PRIMARY KEY (id), 
	UNIQUE (user_id), 
	FOREIGN KEY(user_id) REFERENCES users (id) ON DELETE CASCADE
);

-- Table: loan_schemes
CREATE TABLE loan_schemes (
	id UUID NOT NULL, 
	bank_id UUID NOT NULL, 
	scheme_name VARCHAR(255) NOT NULL, 
	loan_category VARCHAR(100), 
	min_amount NUMERIC(15, 2), 
	max_amount NUMERIC(15, 2), 
	interest_rate NUMERIC(5, 2), 
	min_tenure_months INTEGER, 
	max_tenure_months INTEGER, 
	eligibility_info TEXT, 
	is_active BOOLEAN NOT NULL, 
	created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	PRIMARY KEY (id), 
	FOREIGN KEY(bank_id) REFERENCES banks (id) ON DELETE CASCADE
);

-- Table: daily_targets
CREATE TABLE daily_targets (
	id UUID NOT NULL, 
	employee_id UUID NOT NULL, 
	date DATE NOT NULL, 
	target_calls INTEGER NOT NULL, 
	calls_completed INTEGER NOT NULL, 
	created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	PRIMARY KEY (id), 
	CONSTRAINT uq_daily_target_employee_date UNIQUE (employee_id, date), 
	FOREIGN KEY(employee_id) REFERENCES employees (id) ON DELETE CASCADE
);

-- Table: leads
CREATE TABLE leads (
	id UUID NOT NULL, 
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
	assigned_employee_id UUID, 
	status lead_status NOT NULL, 
	priority lead_priority NOT NULL, 
	last_contact_date TIMESTAMP WITH TIME ZONE, 
	created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	PRIMARY KEY (id), 
	FOREIGN KEY(assigned_employee_id) REFERENCES employees (id) ON DELETE SET NULL
);

-- Table: call_logs
CREATE TABLE call_logs (
	id UUID NOT NULL, 
	lead_id UUID NOT NULL, 
	employee_id UUID NOT NULL, 
	call_datetime TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	duration_seconds INTEGER, 
	outcome call_outcome NOT NULL, 
	remarks TEXT, 
	next_follow_up_date TIMESTAMP WITH TIME ZONE, 
	PRIMARY KEY (id), 
	FOREIGN KEY(lead_id) REFERENCES leads (id) ON DELETE CASCADE, 
	FOREIGN KEY(employee_id) REFERENCES employees (id) ON DELETE CASCADE
);

-- Table: documents
CREATE TABLE documents (
	id UUID NOT NULL, 
	lead_id UUID NOT NULL, 
	uploaded_by UUID NOT NULL, 
	category document_category NOT NULL, 
	file_name VARCHAR(255) NOT NULL, 
	file_path VARCHAR(500) NOT NULL, 
	file_size INTEGER, 
	mime_type VARCHAR(100), 
	verification_status verification_status NOT NULL, 
	verified_by UUID, 
	verified_at TIMESTAMP WITH TIME ZONE, 
	rejection_remarks TEXT, 
	created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	PRIMARY KEY (id), 
	FOREIGN KEY(lead_id) REFERENCES leads (id) ON DELETE CASCADE, 
	FOREIGN KEY(uploaded_by) REFERENCES employees (id) ON DELETE SET NULL, 
	FOREIGN KEY(verified_by) REFERENCES users (id) ON DELETE SET NULL
);

-- Table: follow_ups
CREATE TABLE follow_ups (
	id UUID NOT NULL, 
	lead_id UUID NOT NULL, 
	employee_id UUID NOT NULL, 
	scheduled_date TIMESTAMP WITH TIME ZONE NOT NULL, 
	completed_date TIMESTAMP WITH TIME ZONE, 
	status follow_up_status NOT NULL, 
	remarks TEXT, 
	created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	PRIMARY KEY (id), 
	FOREIGN KEY(lead_id) REFERENCES leads (id) ON DELETE CASCADE, 
	FOREIGN KEY(employee_id) REFERENCES employees (id) ON DELETE CASCADE
);

-- Table: lead_assignments
CREATE TABLE lead_assignments (
	id UUID NOT NULL, 
	lead_id UUID NOT NULL, 
	employee_id UUID NOT NULL, 
	assigned_by UUID NOT NULL, 
	assigned_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	unassigned_at TIMESTAMP WITH TIME ZONE, 
	is_active BOOLEAN NOT NULL, 
	PRIMARY KEY (id), 
	FOREIGN KEY(lead_id) REFERENCES leads (id) ON DELETE CASCADE, 
	FOREIGN KEY(employee_id) REFERENCES employees (id) ON DELETE CASCADE, 
	FOREIGN KEY(assigned_by) REFERENCES users (id) ON DELETE SET NULL
);

-- Table: loan_applications
CREATE TABLE loan_applications (
	id UUID NOT NULL, 
	lead_id UUID NOT NULL, 
	employee_id UUID NOT NULL, 
	bank_id UUID NOT NULL, 
	loan_scheme_id UUID, 
	requested_amount NUMERIC(15, 2) NOT NULL, 
	approved_amount NUMERIC(15, 2), 
	application_date TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	status application_status NOT NULL, 
	remarks TEXT, 
	created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	PRIMARY KEY (id), 
	FOREIGN KEY(lead_id) REFERENCES leads (id) ON DELETE CASCADE, 
	FOREIGN KEY(employee_id) REFERENCES employees (id) ON DELETE CASCADE, 
	FOREIGN KEY(bank_id) REFERENCES banks (id) ON DELETE CASCADE, 
	FOREIGN KEY(loan_scheme_id) REFERENCES loan_schemes (id) ON DELETE SET NULL
);

-- Table: application_status_history
CREATE TABLE application_status_history (
	id UUID NOT NULL, 
	application_id UUID NOT NULL, 
	old_status VARCHAR(50), 
	new_status VARCHAR(50) NOT NULL, 
	changed_by UUID NOT NULL, 
	remarks TEXT, 
	changed_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	PRIMARY KEY (id), 
	FOREIGN KEY(application_id) REFERENCES loan_applications (id) ON DELETE CASCADE, 
	FOREIGN KEY(changed_by) REFERENCES users (id) ON DELETE SET NULL
);

-- 4. Enable Supabase Realtime
DO $$ BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE leads;
    ALTER PUBLICATION supabase_realtime ADD TABLE call_logs;
    ALTER PUBLICATION supabase_realtime ADD TABLE follow_ups;
    ALTER PUBLICATION supabase_realtime ADD TABLE loan_applications;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- 5. Insert Default Administrator (Password: Password123!)
INSERT INTO users (id, email, password_hash, full_name, role, is_active)
VALUES (
    'a0000000-0000-0000-0000-000000000001',
    'admin@loanflow.demo',
    '$2b$12$YqU8YF9ZqX9U9fE2F/Zqee3Z4HnBqQe5j6G4b7N6P3Q5T8v9M0W.2',
    'Vikramaditya Singhania',
    'ADMIN',
    true
) ON CONFLICT (email) DO NOTHING;
