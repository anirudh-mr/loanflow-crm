import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  FileSpreadsheet,
  Plus,
  Search,
  Filter,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  Eye,
  History,
  DollarSign,
  ArrowRight,
  TrendingUp,
} from 'lucide-react'
import { apiClient } from '@/services/api'
import {
  LoanApplication,
  PaginatedResponse,
  Lead,
  Bank,
  LoanScheme,
  StatusHistory,
} from '@/types'
import { Badge } from '@/components/common/Badge'
import { Modal } from '@/components/common/Modal'
import { Pagination } from '@/components/common/Pagination'
import { EmptyState } from '@/components/common/EmptyState'
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton'
import { APPLICATION_STATUS_OPTIONS } from '@/utils/constants'

export const StaffLoanTracking: React.FC = () => {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState('')

  // Submit Application Modal
  const [isSubmitOpen, setIsSubmitOpen] = useState(false)
  const [selectedLeadId, setSelectedLeadId] = useState('')
  const [selectedBankId, setSelectedBankId] = useState('')
  const [selectedSchemeId, setSelectedSchemeId] = useState('')
  const [requestedAmount, setRequestedAmount] = useState('')
  const [remarks, setRemarks] = useState('')
  const [submitError, setSubmitError] = useState('')

  // Status History Drawer
  const [selectedApp, setSelectedApp] = useState<LoanApplication | null>(null)
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)

  // 1. Fetch Staff's Customer Loan Applications
  const { data: appsData, isLoading } = useQuery<PaginatedResponse<LoanApplication>>({
    queryKey: ['staffApplications', page, statusFilter],
    queryFn: () =>
      apiClient.get<PaginatedResponse<LoanApplication>>('/applications', {
        page,
        page_size: 15,
        ...(statusFilter ? { status: statusFilter } : {}),
      }),
  })

  // 2. Fetch Assigned Leads for Dropdown
  const { data: leadsData } = useQuery<PaginatedResponse<Lead>>({
    queryKey: ['staffAssignedLeadsForApp'],
    queryFn: () => apiClient.get<PaginatedResponse<Lead>>('/leads?page=1&page_size=100'),
    enabled: isSubmitOpen,
  })

  // 3. Fetch Partner Banks
  const { data: banksData } = useQuery<PaginatedResponse<Bank>>({
    queryKey: ['activeBanksForApp'],
    queryFn: () => apiClient.get<PaginatedResponse<Bank>>('/banks?page=1&page_size=100'),
    enabled: isSubmitOpen,
  })

  // 4. Fetch Schemes for selected bank
  const { data: schemesData } = useQuery<PaginatedResponse<LoanScheme>>({
    queryKey: ['schemesForBank', selectedBankId],
    queryFn: () =>
      apiClient.get<PaginatedResponse<LoanScheme>>('/loan-schemes', {
        page: 1,
        page_size: 100,
        bank_id: selectedBankId,
      }),
    enabled: !!selectedBankId && isSubmitOpen,
  })

  // 5. Fetch Status History for selected application
  const { data: statusHistory, isLoading: isLoadingHistory } = useQuery<StatusHistory[]>({
    queryKey: ['appStatusHistory', selectedApp?.id],
    queryFn: () => apiClient.get<StatusHistory[]>(`/applications/${selectedApp?.id}/history`),
    enabled: !!selectedApp && isHistoryOpen,
  })

  // Submit Application Mutation
  const submitAppMutation = useMutation({
    mutationFn: (data: any) => apiClient.post('/applications', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staffApplications'] })
      queryClient.invalidateQueries({ queryKey: ['staffDashboardStats'] })
      setIsSubmitOpen(false)
      setSelectedLeadId('')
      setSelectedBankId('')
      setSelectedSchemeId('')
      setRequestedAmount('')
      setRemarks('')
      setSubmitError('')
    },
    onError: (err: any) => {
      setSubmitError(err.response?.data?.detail || 'Failed to submit loan application.')
    },
  })

  const handleSubmitApplication = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError('')
    if (!selectedLeadId || !selectedBankId || !requestedAmount) {
      setSubmitError('Please complete all required fields.')
      return
    }

    submitAppMutation.mutate({
      lead_id: selectedLeadId,
      bank_id: selectedBankId,
      loan_scheme_id: selectedSchemeId || undefined,
      requested_amount: Number(requestedAmount),
      remarks: remarks.trim() || undefined,
    })
  }

  // Pre-fill amount when lead is selected
  const handleLeadSelect = (leadId: string) => {
    setSelectedLeadId(leadId)
    const lead = leadsData?.items.find((l) => l.id === leadId)
    if (lead) {
      setRequestedAmount(String(lead.requested_amount))
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Loan Application Pipeline</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Submit interested customer applications to lending partners and track underwriting stages to disbursement.
          </p>
        </div>

        <button
          onClick={() => setIsSubmitOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-medium text-xs rounded-xl transition shadow-sm"
        >
          <Plus className="h-4 w-4" />
          Submit Loan Application
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-slate-400" />
            <span className="text-xs font-semibold text-slate-500 uppercase">Stage:</span>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value)
              setPage(1)
            }}
            className="text-xs border border-slate-300 rounded-lg px-3 py-1.5 bg-slate-50 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">All Pipeline Stages</option>
            {APPLICATION_STATUS_OPTIONS.map((st) => (
              <option key={st.value} value={st.value}>
                {st.label}
              </option>
            ))}
          </select>
        </div>

        <div className="text-xs text-slate-500">
          Tracking <span className="font-semibold text-slate-800">{appsData?.total || 0}</span> loan files
        </div>
      </div>

      {/* Applications Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-6">
            <LoadingSkeleton count={6} />
          </div>
        ) : !appsData || appsData.items.length === 0 ? (
          <EmptyState
            title="No loan applications found"
            description="You haven't submitted any customer loan files yet. Once a customer expresses interest and shares documents, initiate an application."
            action={{
              label: 'Submit First Application',
              onClick: () => setIsSubmitOpen(true),
            }}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Application ID</th>
                  <th className="py-3 px-4">Customer Lead</th>
                  <th className="py-3 px-4">Lending Bank & Scheme</th>
                  <th className="py-3 px-4">Requested Amt</th>
                  <th className="py-3 px-4">Approved Amt</th>
                  <th className="py-3 px-4">Current Stage</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-right">Audit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {appsData.items.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3.5 px-4 font-mono font-semibold text-slate-900">
                      APP-{app.id.slice(0, 8).toUpperCase()}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900">{app.customer_name || 'Customer'}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800">{app.bank_name || 'Bank Partner'}</div>
                      <div className="text-[11px] text-slate-500">{app.scheme_name || 'Standard Loan'}</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-medium text-slate-900">
                      ₹{app.requested_amount.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 font-mono">
                      {app.approved_amount ? (
                        <span className="font-bold text-emerald-600">
                          ₹{app.approved_amount.toLocaleString()}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">In Underwriting</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge status={app.status} />
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                      {new Date(app.application_date).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => {
                          setSelectedApp(app)
                          setIsHistoryOpen(true)
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-medium transition"
                        title="View Status History"
                      >
                        <History className="h-3.5 w-3.5" />
                        Audit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {appsData && appsData.pages > 1 && (
          <div className="p-4 border-t border-slate-200">
            <Pagination
              currentPage={page}
              totalPages={appsData.pages}
              onPageChange={setPage}
            />
          </div>
        )}
      </div>

      {/* Submit Application Modal */}
      <Modal
        isOpen={isSubmitOpen}
        onClose={() => setIsSubmitOpen(false)}
        title="Submit New Customer Loan Application"
        size="md"
      >
        <form onSubmit={handleSubmitApplication} className="space-y-4">
          {submitError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{submitError}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Select Customer Lead <span className="text-rose-500">*</span>
            </label>
            <select
              value={selectedLeadId}
              onChange={(e) => handleLeadSelect(e.target.value)}
              className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 bg-slate-50 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
            >
              <option value="">-- Choose from your assigned leads --</option>
              {leadsData?.items.map((lead) => (
                <option key={lead.id} value={lead.id}>
                  {lead.customer_name} ({lead.phone}) - {lead.loan_type} [Income: ₹{lead.monthly_income.toLocaleString()}/mo]
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Lending Bank <span className="text-rose-500">*</span>
              </label>
              <select
                value={selectedBankId}
                onChange={(e) => {
                  setSelectedBankId(e.target.value)
                  setSelectedSchemeId('')
                }}
                className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 bg-slate-50 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              >
                <option value="">-- Select Bank --</option>
                {banksData?.items.map((bank) => (
                  <option key={bank.id} value={bank.id}>
                    {bank.name} ({bank.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Loan Scheme (Optional)
              </label>
              <select
                value={selectedSchemeId}
                onChange={(e) => setSelectedSchemeId(e.target.value)}
                disabled={!selectedBankId}
                className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 bg-slate-50 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50"
              >
                <option value="">-- Standard Rate --</option>
                {schemesData?.items.map((scheme) => (
                  <option key={scheme.id} value={scheme.id}>
                    {scheme.scheme_name} ({scheme.interest_rate}%)
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Requested Loan Amount (₹) <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              min="10000"
              step="5000"
              value={requestedAmount}
              onChange={(e) => setRequestedAmount(e.target.value)}
              className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 bg-slate-50 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="500000"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Application Notes & Underwriting Remarks
            </label>
            <textarea
              rows={3}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Applicant has stable IT employment with 3 years ITR and 780 CIBIL score..."
              className="w-full text-xs border border-slate-300 rounded-lg p-2.5 bg-slate-50 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsSubmitOpen(false)}
              className="px-4 py-2 border border-slate-300 text-slate-700 text-xs font-medium rounded-lg hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitAppMutation.isPending}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium rounded-lg disabled:opacity-50"
            >
              {submitAppMutation.isPending ? 'Submitting...' : 'Submit to Bank'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Status History Modal */}
      <Modal
        isOpen={isHistoryOpen}
        onClose={() => {
          setIsHistoryOpen(false)
          setSelectedApp(null)
        }}
        title={`Status History: APP-${selectedApp?.id.slice(0, 8).toUpperCase()}`}
        size="md"
      >
        <div className="space-y-4">
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs flex justify-between items-center">
            <div>
              <span className="text-slate-500">Applicant: </span>
              <strong className="text-slate-900">{selectedApp?.customer_name}</strong>
            </div>
            <div>
              <span className="text-slate-500">Bank: </span>
              <strong className="text-slate-900">{selectedApp?.bank_name}</strong>
            </div>
          </div>

          {isLoadingHistory ? (
            <LoadingSkeleton count={4} />
          ) : !statusHistory || statusHistory.length === 0 ? (
            <p className="text-xs text-slate-500 italic py-4 text-center">
              No historical status changes recorded.
            </p>
          ) : (
            <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              {statusHistory.map((h) => (
                <div key={h.id} className="relative">
                  <div className="absolute -left-6 top-1 h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-500 shadow-sm" />
                  <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-xs space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-900 capitalize">
                        {h.new_status.replace(/_/g, ' ')}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(h.changed_at).toLocaleString()}
                      </span>
                    </div>
                    {h.remarks && (
                      <p className="text-xs text-slate-600 bg-slate-50 p-2 rounded">
                        {h.remarks}
                      </p>
                    )}
                    <div className="text-[10px] text-slate-400">
                      Updated by: {h.changed_by_name || 'System Admin'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-end pt-2 border-t border-slate-100">
            <button
              onClick={() => {
                setIsHistoryOpen(false)
                setSelectedApp(null)
              }}
              className="px-4 py-2 bg-slate-900 text-white text-xs font-medium rounded-lg"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
