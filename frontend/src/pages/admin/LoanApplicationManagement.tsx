import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  FileSpreadsheet,
  Building2,
  UserCheck,
  Clock,
  Eye,
  Edit2,
  X,
  FileCheck2,
  ArrowRight,
} from 'lucide-react'
import { apiClient } from '@/services/api'
import { LoanApplication, Bank, PaginatedResponse } from '@/types'
import { StatusBadge } from '@/components/common/Badge'
import { Pagination } from '@/components/common/Pagination'
import { Modal } from '@/components/common/Modal'
import { SkeletonTable } from '@/components/common/LoadingSkeleton'
import { EmptyState } from '@/components/common/EmptyState'
import { APPLICATION_STATUS_OPTIONS } from '@/utils/constants'

export const LoanApplicationManagement: React.FC = () => {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [statusFilter, setStatusFilter] = useState('')
  const [bankFilter, setBankFilter] = useState('')

  // Modals & Drawers
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null)
  const [statusModalApp, setStatusModalApp] = useState<LoanApplication | null>(null)
  const [targetStatus, setTargetStatus] = useState('approved')
  const [approvedAmount, setApprovedAmount] = useState('')
  const [statusRemarks, setStatusRemarks] = useState('')

  // 1. Fetch Banks for filter
  const { data: banksData } = useQuery<PaginatedResponse<Bank>>({
    queryKey: ['adminBanksForAppFilter'],
    queryFn: () => apiClient.get<PaginatedResponse<Bank>>('/banks?page=1&page_size=50'),
  })

  // 2. Fetch Applications
  const { data: applicationsData, isLoading } = useQuery<PaginatedResponse<LoanApplication>>({
    queryKey: ['adminApplications', page, pageSize, statusFilter, bankFilter],
    queryFn: () => {
      const params: Record<string, any> = { page, page_size: pageSize }
      if (statusFilter) params.status = statusFilter
      if (bankFilter) params.bank_id = bankFilter
      return apiClient.get<PaginatedResponse<LoanApplication>>('/applications', params)
    },
  })

  // 3. Fetch Application Detail (with documents & timeline history)
  const { data: appDetails, isLoading: detailsLoading } = useQuery<any>({
    queryKey: ['applicationDetails', selectedAppId],
    queryFn: () => apiClient.get<any>(`/applications/${selectedAppId}`),
    enabled: !!selectedAppId,
  })

  // Update Status Mutation
  const statusMutation = useMutation({
    mutationFn: ({
      id,
      status,
      remarks,
      amount,
    }: {
      id: string
      status: string
      remarks: string
      amount?: number
    }) =>
      apiClient.patch(`/applications/${id}/status`, {
        status,
        remarks,
        approved_amount: amount,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminApplications'] })
      queryClient.invalidateQueries({ queryKey: ['applicationDetails', selectedAppId] })
      queryClient.invalidateQueries({ queryKey: ['adminDashboardStats'] })
      setStatusModalApp(null)
      setStatusRemarks('')
      setApprovedAmount('')
    },
  })

  const handleOpenStatusModal = (app: LoanApplication) => {
    setStatusModalApp(app)
    setTargetStatus(app.status)
    setApprovedAmount(app.approved_amount ? String(app.approved_amount) : String(app.requested_amount))
    setStatusRemarks('')
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <FileSpreadsheet className="h-6 w-6 text-blue-600" />
            Loan Application Pipeline
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            End-to-end loan application lifecycle tracking, bank review status, and disbursement audit history.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value)
              setPage(1)
            }}
            className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-white text-slate-700"
          >
            <option value="">All Application Stages</option>
            {APPLICATION_STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">Lending Bank:</span>
          <select
            value={bankFilter}
            onChange={(e) => {
              setBankFilter(e.target.value)
              setPage(1)
            }}
            className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-white text-slate-700"
          >
            <option value="">All Banks</option>
            {banksData?.items.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>

        {(statusFilter || bankFilter) && (
          <button
            onClick={() => {
              setStatusFilter('')
              setBankFilter('')
              setPage(1)
            }}
            className="text-xs text-rose-600 font-medium hover:text-rose-700 ml-auto"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Applications Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <SkeletonTable rows={8} cols={7} />
        ) : applicationsData && applicationsData.items.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase border-b border-slate-200 font-semibold">
                <tr>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Lending Bank</th>
                  <th className="py-3 px-4">Scheme</th>
                  <th className="py-3 px-4">Requested (₹)</th>
                  <th className="py-3 px-4">Approved (₹)</th>
                  <th className="py-3 px-4">Agent</th>
                  <th className="py-3 px-4">Stage</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {applicationsData.items.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900 text-sm">
                      {app.customer_name || 'Customer'}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800">
                      {app.bank_name || 'Bank'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {app.scheme_name || 'Standard'}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-900">
                      ₹{app.requested_amount.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-emerald-700">
                      {app.approved_amount
                        ? `₹${app.approved_amount.toLocaleString('en-IN')}`
                        : '—'}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 text-slate-700 font-medium">
                        <UserCheck className="h-3.5 w-3.5 text-blue-600" />
                        {app.employee_name}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={app.status} />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedAppId(app.id)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          title="View Full Application Timeline"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleOpenStatusModal(app)}
                          className="px-2.5 py-1 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
                        >
                          Update Stage
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            title="No applications found"
            description="Applications lodged with lending institutions will appear here."
          />
        )}

        <Pagination
          currentPage={page}
          totalPages={applicationsData?.pages || 1}
          totalItems={applicationsData?.total || 0}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={(newSize) => {
            setPageSize(newSize)
            setPage(1)
          }}
        />
      </div>

      {/* Application Detail & Timeline Drawer */}
      {selectedAppId && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col overflow-hidden animate-slide-in">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="text-base font-bold text-slate-900">Application File & Audit Timeline</h3>
                <p className="text-xs text-slate-500">Recorded history of all status transitions</p>
              </div>
              <button
                onClick={() => setSelectedAppId(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {detailsLoading ? (
                <div className="py-12 text-center text-slate-400">Loading application detail...</div>
              ) : appDetails ? (
                <>
                  {/* Summary Card */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-lg font-bold text-slate-900">
                          {appDetails.application.customer_name}
                        </h4>
                        <span className="text-xs text-slate-600 block mt-0.5">
                          Bank: <strong>{appDetails.application.bank_name}</strong> • Scheme:{' '}
                          {appDetails.application.scheme_name || 'Standard'}
                        </span>
                      </div>
                      <StatusBadge status={appDetails.application.status} />
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-3 border-t border-slate-200 text-xs">
                      <div>
                        <span className="text-slate-400 block">Requested Amount</span>
                        <strong className="text-slate-900">
                          ₹{appDetails.application.requested_amount.toLocaleString('en-IN')}
                        </strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Approved Amount</span>
                        <strong className="text-emerald-700">
                          {appDetails.application.approved_amount
                            ? `₹${appDetails.application.approved_amount.toLocaleString('en-IN')}`
                            : 'Pending'}
                        </strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Filing Date</span>
                        <strong className="text-slate-900">
                          {new Date(appDetails.application.application_date).toLocaleDateString()}
                        </strong>
                      </div>
                    </div>
                  </div>

                  {/* Status History Timeline */}
                  <div>
                    <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
                      Application Status History (application_status_history)
                    </h5>
                    <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                      {appDetails.timeline && appDetails.timeline.length > 0 ? (
                        appDetails.timeline.map((item: any) => (
                          <div key={item.id} className="relative text-xs">
                            <div className="absolute -left-6 top-1 h-2.5 w-2.5 rounded-full bg-blue-600 ring-4 ring-white" />
                            <div className="p-3 bg-white border border-slate-200 rounded-lg space-y-1 shadow-xs">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-slate-900 capitalize">
                                  {item.new_status.replace(/_/g, ' ')}
                                </span>
                                <span className="text-[10px] text-slate-400">
                                  {new Date(item.changed_at).toLocaleString()}
                                </span>
                              </div>
                              {item.old_status && (
                                <span className="text-[11px] text-slate-500 block">
                                  Transitioned from: <span className="capitalize">{item.old_status.replace(/_/g, ' ')}</span>
                                </span>
                              )}
                              <p className="text-slate-600 mt-1">{item.remarks || 'No remarks recorded'}</p>
                              <span className="text-[10px] text-blue-600 block">
                                Updated by: {item.changed_by_name}
                              </span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-slate-400 italic">No history records.</p>
                      )}
                    </div>
                  </div>

                  {/* Uploaded Documents in Docket */}
                  <div>
                    <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
                      Attached KYC Documents
                    </h5>
                    <div className="space-y-2">
                      {appDetails.documents?.map((doc: any) => (
                        <div
                          key={doc.id}
                          className="p-3 bg-white border border-slate-200 rounded-lg text-xs flex justify-between items-center"
                        >
                          <div>
                            <span className="font-bold text-slate-900 block">
                              {doc.category.toUpperCase()} - {doc.file_name}
                            </span>
                            {doc.rejection_remarks && (
                              <span className="text-[11px] text-rose-600 block">
                                Rejection: {doc.rejection_remarks}
                              </span>
                            )}
                          </div>
                          <StatusBadge status={doc.verification_status} />
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : null}
            </div>
          </div>
        </div>
      )}

      {/* Update Status Modal */}
      <Modal
        isOpen={!!statusModalApp}
        onClose={() => setStatusModalApp(null)}
        title="Update Application Stage"
        subtitle={`Updating loan file for ${statusModalApp?.customer_name}`}
        maxWidth="md"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault()
            if (!statusModalApp) return
            statusMutation.mutate({
              id: statusModalApp.id,
              status: targetStatus,
              remarks: statusRemarks,
              amount: approvedAmount ? Number(approvedAmount) : undefined,
            })
          }}
          className="space-y-4 text-xs"
        >
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Target Application Stage *</label>
            <select
              value={targetStatus}
              onChange={(e) => setTargetStatus(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 bg-white capitalize"
            >
              {APPLICATION_STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {(targetStatus === 'approved' || targetStatus === 'disbursed') && (
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Approved Loan Amount (₹) *</label>
              <input
                type="number"
                required
                value={approvedAmount}
                onChange={(e) => setApprovedAmount(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 font-bold"
              />
            </div>
          )}

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Audit Notes & Underwriting Remarks *
            </label>
            <textarea
              rows={3}
              required
              value={statusRemarks}
              onChange={(e) => setStatusRemarks(e.target.value)}
              placeholder="e.g. Sanction letter issued by regional credit committee."
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setStatusModalApp(null)}
              className="px-3 py-1.5 border border-slate-200 rounded-lg text-slate-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={statusMutation.isPending}
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg"
            >
              {statusMutation.isPending ? 'Updating...' : 'Commit Status Change'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
