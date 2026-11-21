import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  FileSpreadsheet,
  Search,
  Filter,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  History,
  Edit2,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react'
import { apiClient } from '@/services/api'
import {
  LoanApplication,
  PaginatedResponse,
  Bank,
  StatusHistory,
} from '@/types'
import { Badge } from '@/components/common/Badge'
import { Modal } from '@/components/common/Modal'
import { Pagination } from '@/components/common/Pagination'
import { EmptyState } from '@/components/common/EmptyState'
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton'
import { APPLICATION_STATUS_OPTIONS } from '@/utils/constants'

export const MobileApplications: React.FC = () => {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState('')
  const [bankFilter, setBankFilter] = useState('')

  // Status Update Modal
  const [selectedApp, setSelectedApp] = useState<LoanApplication | null>(null)
  const [newStatus, setNewStatus] = useState('approved')
  const [approvedAmount, setApprovedAmount] = useState('')
  const [updateRemarks, setUpdateRemarks] = useState('')

  // Audit History Modal
  const [auditApp, setAuditApp] = useState<LoanApplication | null>(null)

  // Fetch Applications
  const { data: appsData, isLoading } = useQuery<PaginatedResponse<LoanApplication>>({
    queryKey: ['mobileAdminApplications', page, statusFilter, bankFilter],
    queryFn: () =>
      apiClient.get<PaginatedResponse<LoanApplication>>('/applications', {
        page,
        page_size: 15,
        ...(statusFilter ? { status: statusFilter } : {}),
        ...(bankFilter ? { bank_id: bankFilter } : {}),
      }),
  })

  // Fetch Banks
  const { data: banksData } = useQuery<PaginatedResponse<Bank>>({
    queryKey: ['banksForMobileAppsFilter'],
    queryFn: () => apiClient.get<PaginatedResponse<Bank>>('/banks?page_size=50'),
  })

  // Fetch History
  const { data: statusHistory, isLoading: loadingHistory } = useQuery<StatusHistory[]>({
    queryKey: ['mobileAppHistory', auditApp?.id],
    queryFn: () => apiClient.get<StatusHistory[]>(`/applications/${auditApp?.id}/history`),
    enabled: !!auditApp,
  })

  // Update Status Mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({
      id,
      status,
      approved_amount,
      remarks,
    }: {
      id: string
      status: string
      approved_amount?: number
      remarks?: string
    }) =>
      apiClient.patch(`/applications/${id}/status`, {
        status,
        approved_amount: approved_amount || undefined,
        remarks: remarks || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mobileAdminApplications'] })
      queryClient.invalidateQueries({ queryKey: ['adminDashboardStats'] })
      setSelectedApp(null)
      setUpdateRemarks('')
      setApprovedAmount('')
    },
  })

  const handleOpenStatusModal = (app: LoanApplication) => {
    setSelectedApp(app)
    setNewStatus(app.status)
    setApprovedAmount(app.approved_amount ? String(app.approved_amount) : String(app.requested_amount))
    setUpdateRemarks('')
  }

  const handleStatusSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedApp) return

    updateStatusMutation.mutate({
      id: selectedApp.id,
      status: newStatus,
      approved_amount: approvedAmount ? Number(approvedAmount) : undefined,
      remarks: updateRemarks.trim() || undefined,
    })
  }

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900">Loan Applications</h1>
        <p className="text-xs text-slate-500">
          Supervise borrower pipelines across bank underwriting stages.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="flex gap-2">
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value)
            setPage(1)
          }}
          className="w-1/2 text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white text-slate-800"
        >
          <option value="">All Stages</option>
          {APPLICATION_STATUS_OPTIONS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>

        <select
          value={bankFilter}
          onChange={(e) => {
            setBankFilter(e.target.value)
            setPage(1)
          }}
          className="w-1/2 text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white text-slate-800"
        >
          <option value="">All Banks</option>
          {banksData?.items.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>
      </div>

      {/* Applications Cards */}
      {isLoading ? (
        <LoadingSkeleton count={5} />
      ) : !appsData || appsData.items.length === 0 ? (
        <EmptyState
          title="No applications found"
          description="Zero loan applications match your filter."
        />
      ) : (
        <div className="space-y-3">
          {appsData.items.map((app) => (
            <div
              key={app.id}
              className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-2.5"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    {app.customer_name || 'Customer'}
                  </h3>
                  <div className="text-[11px] text-slate-500 font-mono">
                    APP-{app.id.slice(0, 8).toUpperCase()}
                  </div>
                </div>
                <Badge status={app.status} />
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                <div>
                  <span className="text-slate-400 text-[10px] block uppercase">Bank Partner</span>
                  <span className="font-semibold text-slate-800 truncate block">
                    {app.bank_name || 'Bank'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block uppercase">Scheme</span>
                  <span className="text-slate-700 truncate block">
                    {app.scheme_name || 'Standard Scheme'}
                  </span>
                </div>
                <div className="pt-1 border-t border-slate-200/60">
                  <span className="text-slate-400 text-[10px] block uppercase">Requested</span>
                  <span className="font-bold text-slate-900 font-mono">
                    ₹{app.requested_amount.toLocaleString()}
                  </span>
                </div>
                <div className="pt-1 border-t border-slate-200/60">
                  <span className="text-slate-400 text-[10px] block uppercase">Approved</span>
                  <span className="font-bold text-emerald-600 font-mono">
                    {app.approved_amount ? `₹${app.approved_amount.toLocaleString()}` : '—'}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
                <span>
                  Agent: <strong className="text-slate-700">{app.employee_name || 'Agent'}</strong>
                </span>
                <span className="font-mono">{new Date(app.application_date).toLocaleDateString()}</span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
                <button
                  onClick={() => setAuditApp(app)}
                  className="flex-1 py-1.5 bg-slate-100 active:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg flex items-center justify-center gap-1"
                >
                  <History className="h-3.5 w-3.5" />
                  Audit Trail
                </button>
                <button
                  onClick={() => handleOpenStatusModal(app)}
                  className="flex-1 py-1.5 bg-blue-600 active:bg-blue-700 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1 shadow-xs"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                  Update Stage
                </button>
              </div>
            </div>
          ))}

          {appsData.pages > 1 && (
            <div className="pt-2">
              <Pagination
                currentPage={page}
                totalPages={appsData.pages}
                onPageChange={setPage}
              />
            </div>
          )}
        </div>
      )}

      {/* Update Stage Modal */}
      <Modal
        isOpen={!!selectedApp}
        onClose={() => setSelectedApp(null)}
        title={`Update Stage: APP-${selectedApp?.id.slice(0, 8).toUpperCase()}`}
        size="md"
      >
        <form onSubmit={handleStatusSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Pipeline Stage <span className="text-rose-500">*</span>
            </label>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="w-full text-xs border border-slate-300 rounded-lg px-2.5 py-2 bg-slate-50 text-slate-900"
              required
            >
              {APPLICATION_STATUS_OPTIONS.map((st) => (
                <option key={st.value} value={st.value}>
                  {st.label}
                </option>
              ))}
            </select>
          </div>

          {(newStatus === 'approved' || newStatus === 'disbursed') && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Approved Loan Amount (₹) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                value={approvedAmount}
                onChange={(e) => setApprovedAmount(e.target.value)}
                className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 bg-slate-50 text-slate-900 font-mono"
                required
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Underwriting Remarks / Notes
            </label>
            <textarea
              rows={3}
              value={updateRemarks}
              onChange={(e) => setUpdateRemarks(e.target.value)}
              placeholder="Bank sanction letter received, sanctioned at 10.25% ROI..."
              className="w-full text-xs border border-slate-300 rounded-lg p-2.5 bg-slate-50 text-slate-900"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setSelectedApp(null)}
              className="px-3 py-1.5 border border-slate-300 text-slate-700 text-xs font-medium rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updateStatusMutation.isPending}
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg disabled:opacity-50"
            >
              {updateStatusMutation.isPending ? 'Updating...' : 'Save Stage'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Audit History Modal */}
      <Modal
        isOpen={!!auditApp}
        onClose={() => setAuditApp(null)}
        title={`Audit Trail: APP-${auditApp?.id.slice(0, 8).toUpperCase()}`}
        size="md"
      >
        <div className="space-y-3">
          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-xs flex justify-between">
            <span>Customer: <strong>{auditApp?.customer_name}</strong></span>
            <span>Bank: <strong>{auditApp?.bank_name}</strong></span>
          </div>

          {loadingHistory ? (
            <LoadingSkeleton count={3} />
          ) : !statusHistory || statusHistory.length === 0 ? (
            <p className="text-xs text-slate-500 italic py-3 text-center">
              No status changes recorded yet.
            </p>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {statusHistory.map((h) => (
                <div key={h.id} className="p-2.5 bg-white rounded-lg border border-slate-200 text-xs space-y-1">
                  <div className="flex justify-between font-semibold capitalize text-slate-900">
                    <span>{h.new_status.replace(/_/g, ' ')}</span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(h.changed_at).toLocaleDateString()}
                    </span>
                  </div>
                  {h.remarks && <p className="text-slate-600 text-[11px] bg-slate-50 p-1.5 rounded">{h.remarks}</p>}
                  <div className="text-[10px] text-slate-400">Changed by: {h.changed_by_name || 'Admin'}</div>
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-end pt-2">
            <button
              onClick={() => setAuditApp(null)}
              className="w-full py-2 bg-slate-100 text-slate-800 text-xs font-semibold rounded-lg"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
