import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Search,
  Phone,
  Mail,
  PhoneCall,
  Eye,
  FileCheck2,
  Calendar,
  X,
  Upload,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react'
import { apiClient } from '@/services/api'
import { Lead, PaginatedResponse } from '@/types'
import { StatusBadge, PriorityBadge } from '@/components/common/Badge'
import { Pagination } from '@/components/common/Pagination'
import { Modal } from '@/components/common/Modal'
import { SkeletonTable } from '@/components/common/LoadingSkeleton'
import { EmptyState } from '@/components/common/EmptyState'
import {
  LEAD_STATUS_OPTIONS,
  CALL_OUTCOME_OPTIONS,
  DOCUMENT_CATEGORY_OPTIONS,
} from '@/utils/constants'

export const StaffMyLeads: React.FC = () => {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  // Modals & Drawers
  const [activeCallLead, setActiveCallLead] = useState<Lead | null>(null)
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null)
  const [uploadDocLead, setUploadDocLead] = useState<Lead | null>(null)

  // Call form state
  const [outcome, setOutcome] = useState('interested')
  const [duration, setDuration] = useState('120')
  const [remarks, setRemarks] = useState('')
  const [followUpDate, setFollowUpDate] = useState('')

  // Document upload state
  const [docCategory, setDocCategory] = useState('salary_slip')
  const [docFile, setDocFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)

  // 1. Fetch My Assigned Leads
  const { data: leadsData, isLoading } = useQuery<PaginatedResponse<Lead>>({
    queryKey: ['myStaffLeads', page, pageSize, search, statusFilter],
    queryFn: () => {
      const params: Record<string, any> = { page, page_size: pageSize }
      if (search) params.search = search
      if (statusFilter) params.status = statusFilter
      return apiClient.get<PaginatedResponse<Lead>>('/leads', params)
    },
  })

  // 2. Fetch Lead Details Drawer
  const { data: leadDetails, isLoading: detailsLoading } = useQuery<any>({
    queryKey: ['staffLeadDetails', selectedLeadId],
    queryFn: () => apiClient.get<any>(`/leads/${selectedLeadId}/details`),
    enabled: !!selectedLeadId,
  })

  // Log Call Mutation
  const callMutation = useMutation({
    mutationFn: (data: any) => apiClient.post('/calls', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myStaffLeads'] })
      queryClient.invalidateQueries({ queryKey: ['staffCallProgress'] })
      queryClient.invalidateQueries({ queryKey: ['staffDashboardStats'] })
      if (selectedLeadId) {
        queryClient.invalidateQueries({ queryKey: ['staffLeadDetails', selectedLeadId] })
      }
      setActiveCallLead(null)
      setRemarks('')
      setFollowUpDate('')
    },
  })

  // Document Upload Mutation
  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!uploadDocLead || !docFile) return

    const formData = new FormData()
    formData.append('lead_id', uploadDocLead.id)
    formData.append('category', docCategory)
    formData.append('file', docFile)

    try {
      setUploading(true)
      await apiClient.upload('/documents/upload', formData)
      queryClient.invalidateQueries({ queryKey: ['myStaffLeads'] })
      if (selectedLeadId) {
        queryClient.invalidateQueries({ queryKey: ['staffLeadDetails', selectedLeadId] })
      }
      setUploadDocLead(null)
      setDocFile(null)
      alert('Document uploaded successfully for review.')
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Upload failed.')
    } finally {
      setUploading(false)
    }
  }

  const handleOpenCallModal = (lead: Lead) => {
    setActiveCallLead(lead)
    setOutcome('interested')
    setDuration('120')
    setRemarks('')
    setFollowUpDate('')
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Phone className="h-6 w-6 text-emerald-600" />
            My Customer Portfolio
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Your assigned customer prospects for loan consulting, document collection, and outbound calls.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search my leads by customer name, phone, city, or loan type..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            className="w-full pl-10 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 text-slate-900"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value)
            setPage(1)
          }}
          className="px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white text-slate-700"
        >
          <option value="">All Statuses</option>
          {LEAD_STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Leads Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <SkeletonTable rows={8} cols={6} />
        ) : leadsData && leadsData.items.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase border-b border-slate-200 font-semibold">
                <tr>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Loan Requirement</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4 text-right">Outreach Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {leadsData.items.map((lead) => (
                  <tr key={lead.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <div>
                        <span className="font-bold text-slate-900 text-sm block">
                          {lead.customer_name}
                        </span>
                        <div className="flex items-center gap-2 text-slate-500 mt-0.5">
                          <span className="flex items-center gap-1 font-mono font-medium text-blue-700">
                            <Phone className="h-3 w-3" />
                            {lead.phone}
                          </span>
                          {lead.email && <span>• {lead.email}</span>}
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div>
                        <span className="font-bold text-slate-900 block">
                          ₹{lead.requested_amount.toLocaleString('en-IN')}
                        </span>
                        <span className="text-slate-500 text-[11px] block">{lead.loan_type}</span>
                        {lead.preferred_bank && (
                          <span className="text-[10px] text-blue-600 block">
                            Pref: {lead.preferred_bank}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {lead.city}, {lead.state}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={lead.status} />
                    </td>
                    <td className="py-3.5 px-4">
                      <PriorityBadge priority={lead.priority} />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenCallModal(lead)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm shadow-emerald-600/20 transition-colors"
                        >
                          <PhoneCall className="h-3.5 w-3.5" />
                          <span>Call / Log</span>
                        </button>

                        <button
                          onClick={() => setUploadDocLead(lead)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-purple-600 hover:bg-purple-50 transition-colors"
                          title="Upload Customer Document"
                        >
                          <Upload className="h-4 w-4" />
                        </button>

                        <button
                          onClick={() => setSelectedLeadId(lead.id)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          title="View Full Profile"
                        >
                          <Eye className="h-4 w-4" />
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
            title="No leads assigned to you"
            description="When leads are allocated by administrators, they will appear here for customer calling."
          />
        )}

        <Pagination
          currentPage={page}
          totalPages={leadsData?.pages || 1}
          totalItems={leadsData?.total || 0}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={(newSize) => {
            setPageSize(newSize)
            setPage(1)
          }}
        />
      </div>

      {/* Record Call Modal */}
      <Modal
        isOpen={!!activeCallLead}
        onClose={() => setActiveCallLead(null)}
        title="Record Customer Interaction"
        subtitle={`Logging call with ${activeCallLead?.customer_name} (${activeCallLead?.phone})`}
        maxWidth="md"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault()
            if (!activeCallLead) return
            callMutation.mutate({
              lead_id: activeCallLead.id,
              outcome,
              duration_seconds: Number(duration),
              remarks,
              next_follow_up_date: followUpDate ? new Date(followUpDate).toISOString() : null,
            })
          }}
          className="space-y-4 text-xs"
        >
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Call Outcome *</label>
              <select
                value={outcome}
                onChange={(e) => setOutcome(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 bg-white"
              >
                {CALL_OUTCOME_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Duration (Seconds) *</label>
              <input
                type="number"
                required
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Next Follow-up Date (Optional)</label>
            <input
              type="datetime-local"
              value={followUpDate}
              onChange={(e) => setFollowUpDate(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Customer Remarks / Call Notes</label>
            <textarea
              rows={3}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="e.g. Customer introduced to HDFC Reach scheme, wants 10L, salary slips requested."
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setActiveCallLead(null)}
              className="px-3 py-1.5 border border-slate-200 rounded-lg text-slate-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={callMutation.isPending}
              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg"
            >
              {callMutation.isPending ? 'Logging Call...' : 'Save & Count Call'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Upload Document Modal */}
      <Modal
        isOpen={!!uploadDocLead}
        onClose={() => setUploadDocLead(null)}
        title="Upload Customer Document"
        subtitle={`Attach KYC or financial docket for ${uploadDocLead?.customer_name}`}
        maxWidth="md"
      >
        <form onSubmit={handleUploadSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Document Category *</label>
            <select
              value={docCategory}
              onChange={(e) => setDocCategory(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 bg-white"
            >
              {DOCUMENT_CATEGORY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">File (PDF, JPG, PNG - Max 10MB) *</label>
            <input
              type="file"
              required
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => setDocFile(e.target.files?.[0] || null)}
              className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setUploadDocLead(null)}
              className="px-3 py-1.5 border border-slate-200 rounded-lg text-slate-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploading || !docFile}
              className="px-4 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg"
            >
              {uploading ? 'Uploading...' : 'Submit to Admin Queue'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Customer Full Profile Drawer */}
      {selectedLeadId && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col overflow-hidden animate-slide-in">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="text-base font-bold text-slate-900">Customer Details</h3>
                <p className="text-xs text-slate-500">Interaction timeline, docs, and application status</p>
              </div>
              <button
                onClick={() => setSelectedLeadId(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {detailsLoading ? (
                <div className="py-12 text-center text-slate-400">Loading details...</div>
              ) : leadDetails ? (
                <>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-lg font-bold text-slate-900">
                          {leadDetails.lead.customer_name}
                        </h4>
                        <div className="flex items-center gap-3 text-xs text-slate-600 mt-1">
                          <span className="flex items-center gap-1 font-mono text-blue-700">
                            <Phone className="h-3.5 w-3.5" />
                            {leadDetails.lead.phone}
                          </span>
                          {leadDetails.lead.email && <span>• {leadDetails.lead.email}</span>}
                        </div>
                      </div>
                      <StatusBadge status={leadDetails.lead.status} />
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-3 border-t border-slate-200 text-xs">
                      <div>
                        <span className="text-slate-400 block">Requested Amount</span>
                        <strong className="text-slate-900">
                          ₹{leadDetails.lead.requested_amount.toLocaleString('en-IN')}
                        </strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Loan Scheme</span>
                        <strong className="text-slate-900">{leadDetails.lead.loan_type}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block">City</span>
                        <strong className="text-slate-900">{leadDetails.lead.city}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Call History */}
                  <div>
                    <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                      Past Calls ({leadDetails.calls?.length || 0})
                    </h5>
                    <div className="space-y-2">
                      {leadDetails.calls?.map((c: any) => (
                        <div key={c.id} className="p-3 bg-white border border-slate-200 rounded-lg text-xs space-y-1">
                          <div className="flex justify-between">
                            <span className="font-semibold text-slate-900">{new Date(c.call_datetime).toLocaleString()}</span>
                            <StatusBadge status={c.outcome} />
                          </div>
                          <p className="text-slate-600">{c.remarks || 'No notes'}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Documents with verification status */}
                  <div>
                    <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                      Documents & KYC Status
                    </h5>
                    <div className="space-y-2">
                      {leadDetails.documents?.map((d: any) => (
                        <div key={d.id} className="p-3 bg-white border border-slate-200 rounded-lg text-xs flex justify-between items-center">
                          <div>
                            <span className="font-bold text-slate-900 block">{d.category.toUpperCase()} - {d.file_name}</span>
                            {d.rejection_remarks && (
                              <span className="text-[10px] text-rose-600 block">Note: {d.rejection_remarks}</span>
                            )}
                          </div>
                          <StatusBadge status={d.verification_status} />
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
    </div>
  )
}
