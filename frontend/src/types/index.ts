/**
 * LoanFlow CRM - Comprehensive TypeScript Definitions
 */

export type UserRole = 'admin' | 'staff';

export interface User {
  id: string;
  email: string;
  full_name: string;
  phone?: string | null;
  role: UserRole;
  is_active: boolean;
  created_at: string;
}

export interface Employee {
  id: string;
  employee_id: string;
  department?: string | null;
  joining_date?: string | null;
  daily_call_target: number;
  is_active: boolean;
  created_at: string;
  user: User;
}

export interface EmployeePerformance {
  employee_id: string;
  full_name: string;
  assigned_leads: number;
  calls_today: number;
  remaining_calls: number;
  target_pct: number;
  interested_leads: number;
  followups_completed: number;
  conversions: number;
}

export type LeadStatus =
  | 'new'
  | 'assigned'
  | 'contacted'
  | 'interested'
  | 'not_interested'
  | 'follow_up_required'
  | 'documents_pending'
  | 'application_submitted'
  | 'converted'
  | 'closed';

export type LeadPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Lead {
  id: string;
  customer_name: string;
  phone: string;
  email?: string | null;
  city: string;
  state: string;
  employment_type: string;
  monthly_income: number;
  loan_type: string;
  requested_amount: number;
  preferred_bank?: string | null;
  lead_source: string;
  priority: LeadPriority;
  status: LeadStatus;
  assigned_employee_id?: string | null;
  assigned_employee_name?: string | null;
  last_contact_date?: string | null;
  created_at: string;
  updated_at?: string | null;
}

export type CallOutcome =
  | 'interested'
  | 'not_interested'
  | 'no_answer'
  | 'busy'
  | 'call_back_later'
  | 'wrong_number'
  | 'follow_up_required';

export interface CallLog {
  id: string;
  lead_id: string;
  customer_name?: string;
  employee_id: string;
  employee_name?: string;
  call_datetime: string;
  duration_seconds: number;
  outcome: CallOutcome;
  remarks?: string | null;
  next_follow_up_date?: string | null;
}

export type FollowUpStatus = 'pending' | 'completed' | 'overdue' | 'rescheduled';

export interface FollowUp {
  id: string;
  lead_id: string;
  customer_name?: string;
  employee_id: string;
  employee_name?: string;
  scheduled_date: string;
  completed_date?: string | null;
  status: FollowUpStatus;
  remarks?: string | null;
  created_at: string;
}

export type DocumentCategory =
  | 'aadhaar'
  | 'pan'
  | 'salary_slip'
  | 'bank_statement'
  | 'address_proof'
  | 'employment_proof'
  | 'other';

export type VerificationStatus = 'pending' | 'verified' | 'rejected';

export interface Document {
  id: string;
  lead_id: string;
  customer_name?: string;
  uploaded_by_name?: string;
  category: DocumentCategory;
  file_name: string;
  file_size: number;
  mime_type: string;
  verification_status: VerificationStatus;
  verified_by_name?: string | null;
  verified_at?: string | null;
  rejection_remarks?: string | null;
  created_at: string;
}

export interface Bank {
  id: string;
  name: string;
  code: string;
  contact_person?: string | null;
  contact_email?: string | null;
  contact_phone?: string | null;
  is_active: boolean;
  created_at: string;
}

export interface LoanScheme {
  id: string;
  bank_id: string;
  bank_name?: string;
  scheme_name: string;
  loan_category: string;
  min_amount: number;
  max_amount: number;
  interest_rate: number;
  min_tenure_months: number;
  max_tenure_months: number;
  eligibility_info?: string | null;
  is_active: boolean;
  created_at: string;
}

export type ApplicationStatus =
  | 'draft'
  | 'documents_pending'
  | 'ready_for_submission'
  | 'submitted_to_bank'
  | 'under_bank_review'
  | 'additional_info_required'
  | 'approved'
  | 'rejected'
  | 'disbursed'
  | 'closed';

export interface LoanApplication {
  id: string;
  lead_id: string;
  customer_name?: string;
  employee_id: string;
  employee_name?: string;
  bank_id: string;
  bank_name?: string;
  loan_scheme_id?: string | null;
  scheme_name?: string | null;
  requested_amount: number;
  approved_amount?: number | null;
  application_date: string;
  status: ApplicationStatus;
  remarks?: string | null;
  created_at: string;
  updated_at?: string | null;
}

export interface StatusHistory {
  id: string;
  old_status?: string | null;
  new_status: string;
  changed_by_name?: string;
  remarks?: string | null;
  changed_at: string;
}

export interface DashboardStats {
  total_leads: number;
  leads_today: number;
  unassigned_leads: number;
  total_employees: number;
  calls_today: number;
  daily_target: number;
  interested_customers: number;
  followups_due_today: number;
  overdue_followups: number;
  pending_documents: number;
  applications_under_review: number;
  approved_loans: number;
  disbursed_loans: number;
  rejected_applications: number;
}

export interface StaffDashboardStats {
  daily_call_target: number;
  calls_completed: number;
  remaining_calls: number;
  target_completion_pct: number;
  actual_target_pct: number;
  assigned_leads: number;
  interested_customers: number;
  followups_due_today: number;
  overdue_followups: number;
  pending_documents: number;
  active_applications: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  pages: number;
}

export interface CallProgress {
  target: number;
  completed: number;
  remaining: number;
  percentage: number;
  actual_percentage: number;
  date: string;
}
