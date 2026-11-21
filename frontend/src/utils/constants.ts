/**
 * LoanFlow CRM - Application Constants & Styling Maps
 */

export const DAILY_CALL_TARGET = 100;

export const STATUS_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  new: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  assigned: { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' },
  contacted: { bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-200' },
  interested: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  not_interested: { bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-300' },
  follow_up_required: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  documents_pending: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  application_submitted: { bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-200' },
  ready_for_submission: { bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200' },
  under_bank_review: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  additional_info_required: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
  approved: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  disbursed: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-300' },
  rejected: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },
  converted: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
  closed: { bg: 'bg-slate-100', text: 'text-slate-500', border: 'border-slate-200' },
  draft: { bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-200' },
  pending: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  verified: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  overdue: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },
  completed: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
};

export const PRIORITY_COLORS: Record<string, { bg: string; text: string }> = {
  low: { bg: 'bg-slate-100', text: 'text-slate-700' },
  medium: { bg: 'bg-blue-100', text: 'text-blue-700' },
  high: { bg: 'bg-amber-100', text: 'text-amber-800' },
  urgent: { bg: 'bg-rose-100', text: 'text-rose-800' },
};

export const LEAD_STATUS_OPTIONS = [
  { value: 'new', label: 'New' },
  { value: 'assigned', label: 'Assigned' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'interested', label: 'Interested' },
  { value: 'not_interested', label: 'Not Interested' },
  { value: 'follow_up_required', label: 'Follow-up Required' },
  { value: 'documents_pending', label: 'Documents Pending' },
  { value: 'application_submitted', label: 'Application Submitted' },
  { value: 'converted', label: 'Converted' },
  { value: 'closed', label: 'Closed' },
];

export const LEAD_PRIORITY_OPTIONS = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
];

export const CALL_OUTCOME_OPTIONS = [
  { value: 'interested', label: 'Interested' },
  { value: 'follow_up_required', label: 'Follow-up Required' },
  { value: 'call_back_later', label: 'Call Back Later' },
  { value: 'busy', label: 'Busy' },
  { value: 'no_answer', label: 'No Answer' },
  { value: 'wrong_number', label: 'Wrong Number' },
  { value: 'not_interested', label: 'Not Interested' },
];

export const DOCUMENT_CATEGORY_OPTIONS = [
  { value: 'aadhaar', label: 'Aadhaar / Identity Proof' },
  { value: 'pan', label: 'PAN Card' },
  { value: 'salary_slip', label: 'Salary Slip (Last 3 Months)' },
  { value: 'bank_statement', label: 'Bank Statement (Last 6 Months)' },
  { value: 'address_proof', label: 'Address Proof' },
  { value: 'employment_proof', label: 'Employment Proof / Form 16 / GST' },
  { value: 'other', label: 'Other Document' },
];

export const APPLICATION_STATUS_OPTIONS = [
  { value: 'draft', label: 'Draft' },
  { value: 'documents_pending', label: 'Documents Pending' },
  { value: 'ready_for_submission', label: 'Ready for Submission' },
  { value: 'submitted_to_bank', label: 'Submitted to Bank' },
  { value: 'under_bank_review', label: 'Under Bank Review' },
  { value: 'additional_info_required', label: 'Additional Info Required' },
  { value: 'approved', label: 'Approved' },
  { value: 'disbursed', label: 'Disbursed' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'closed', label: 'Closed' },
];

export const LOAN_TYPE_OPTIONS = [
  'Personal Loan',
  'Home Loan',
  'Business Loan',
  'Auto Loan',
  'Education Loan',
  'Loan Against Property',
];

export const EMPLOYMENT_TYPE_OPTIONS = [
  { value: 'salaried', label: 'Salaried' },
  { value: 'self_employed', label: 'Self-Employed Professional' },
  { value: 'business', label: 'Business Owner' },
  { value: 'retired', label: 'Retired' },
];
