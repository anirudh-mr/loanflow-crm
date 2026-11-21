import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Search,
  Plus,
  Upload,
  Download,
  Filter,
  Eye,
  Edit2,
  Trash2,
  Phone,
  Mail,
  Building,
  UserCheck,
  FileText,
  Calendar,
  X,
  AlertCircle,
  CheckCircle,
} from 'lucide-react'
import { apiClient } from '@/services/api'
import { Lead, PaginatedResponse, LeadStatus, LeadPriority } from '@/types'
import { StatusBadge, PriorityBadge } from '@/components/common/Badge'
import { Pagination } from '@/components/common/Pagination'
import { Modal } from '@/components/common/Modal'
import { EmptyState } from '@/components/common/EmptyState'
import { SkeletonTable } from '@/components/common/LoadingSkeleton'
import {
  LEAD_STATUS_OPTIONS,
  LOAN_TYPE_OPTIONS,
  EMPLOYMENT_TYPE_OPTIONS,
} from '@/utils/constants'

export const LeadManagement: React.FC = () => {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [priorityFilter, setPriorityFilter] = useState<string>('')

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isUploadOpen, setIsUploadOpen] = useState(false)
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null)
  const [editingLead, setEditingLead] = useState<Lead | null>(null)

  // Upload feedback state
  const [uploadResult, setUploadResult] = useState<any | null>(null)
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)

  // Form states for Create/Edit
  const [formData, setFormData] = useState({
    customer_name: '',
    phone: '',
    email: '',
    city: '',
    state: '',
    employment_type: 'salaried',
    monthly_income: '',
    loan_type: 'Personal Loan',
    requested_amount: '',
    preferred_bank: '',
    lead_source: 'Website',
    priority: 'medium',
    status: 'new',
  })

  // 1. Fetch Leads
  const { data: leadsData, isLoading } = useQuery<PaginatedResponse<Lead>>({
    queryKey: ['adminLeads', page, pageSize, search, statusFilter, priorityFilter],
    queryFn: () => {
      const params: Record<string, any> = { page, page_size: pageSize }
      if (search) params.search = search
      if (statusFilter) params.status = statusFilter
      if (priorityFilter) params.priority = priorityFilter
      return apiClient.get<PaginatedResponse<Lead>>('/leads', params)
    },
  })

  // 2. Fetch Lead Details Drawer
  const { data: leadDetails, isLoading: detailsLoading } = useQuery<any>({
    queryKey: ['leadDetails', selectedLeadId],
    queryFn: () => apiClient.get<any>(`/leads/${selectedLeadId}/details`),
    enabled: !!selectedLeadId,
  })

  // Create Lead Mutation
  const createMutation = useMutation({
    mutationFn: (data: any) => apiClient.post('/leads', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminLeads'] })
      setIsCreateOpen(false)
      resetForm()
    },
  })

  // Update Lead Mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => apiClient.put(`/leads/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminLeads'] })
      setEditingLead(null)
      resetForm()
    },
  })

  // Delete Lead Mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/leads/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminLeads'] })
    },
  })

  const resetForm = () => {
    setFormData({
      customer_name: '',
      phone: '',
      email: '',
      city: '',
      state: '',
      employment_type: 'salaried',
      monthly_income: '',
      loan_type: 'Personal Loan',
      requested_amount: '',
      preferred_bank: '',
      lead_source: 'Website',
      priority: 'medium',
      status: 'new',
    })
  }

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createMutation.mutate({
      ...formData,
      monthly_income: Number(formData.monthly_income),
      requested_amount: Number(formData.requested_amount),
    })
  }

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingLead) return
    updateMutation.mutate({
      id: editingLead.id,
      data: {
        ...formData,
        monthly_income: Number(formData.monthly_income),
        requested_amount: Number(formData.requested_amount),
      },
    })
  }

  const handleOpenEdit = (lead: Lead) => {
    setEditingLead(lead)
    setFormData({
      customer_name: lead.customer_name,
      phone: lead.phone,
      email: lead.email || '',
      city: lead.city,
      state: lead.state,
      employment_type: lead.employment_type,
      monthly_income: String(lead.monthly_income),
      loan_type: lead.loan_type,
      requested_amount: String(lead.requested_amount),
      preferred_bank: lead.preferred_bank || '',
      lead_source: lead.lead_source,
      priority: lead.priority,
      status: lead.status,
    })
  }

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!uploadFile) return

    const data = new FormData()
    data.append('file', uploadFile)

    try {
      setUploading(true)
      const res = await apiClient.upload<any>('/leads/import', data)
      setUploadResult(res)
      queryClient.invalidateQueries({ queryKey: ['adminLeads'] })
    } catch (err: any) {
      setUploadResult({ errors: [err.response?.data?.detail || 'Upload failed'] })
    } finally {
      setUploading(false)
    }
  }

  const handleExportCSV = async () => {
    window.open('/api/v1/leads/export', '_blank')
  }

  const handleDownloadTemplate = () => {
    window.open('/api/v1/leads/csv-template', '_blank')
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Lead Management</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Create, filter, update, and manage customer loan leads across departments.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleDownloadTemplate}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <Download className="h-4 w-4" />
            <span>CSV Template</span>
          </button>
          <button
            onClick={() => {
              setUploadResult(null)
              setUploadFile(null)
              setIsUploadOpen(true)
            }}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <Upload className="h-4 w-4" />
            <span>Bulk CSV Import</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <Download className="h-4 w-4" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => {
              resetForm()
              setIsCreateOpen(true)
            }}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm shadow-blue-500/20 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>New Lead</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search leads by name, phone, email, or city..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            className="w-full pl-10 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-900"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value)
              setPage(1)
            }}
            className="px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white text-slate-700 focus:ring-1 focus:ring-blue-600"
          >
            <option value="">All Statuses</option>
            {LEAD_STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => {
              setPriorityFilter(e.target.value)
              setPage(1)
            }}
            className="px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white text-slate-700 focus:ring-1 focus:ring-blue-600"
          >
            <option value="">All Priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>

          {(search || statusFilter || priorityFilter) && (
            <button
              onClick={() => {
                setSearch('')
                setStatusFilter('')
                setPriorityFilter('')
                setPage(1)
              }}
              className="text-xs text-rose-600 hover:text-rose-700 font-medium px-2 py-1"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Leads Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <SkeletonTable rows={10} cols={7} />
        ) : leadsData && leadsData.items.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase border-b border-slate-200 font-semibold">
                <tr>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Loan Details</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Assigned To</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {leadsData.items.map((lead) => (
                  <tr key={lead.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <div>
                        <span className="font-semibold text-slate-900 block text-sm">
                          {lead.customer_name}
                        </span>
                        <div className="flex items-center gap-2 text-slate-500 mt-0.5">
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {lead.phone}
                          </span>
                          {lead.email && <span>• {lead.email}</span>}
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div>
                        <span className="font-medium text-slate-800 block">
                          ₹{lead.requested_amount.toLocaleString('en-IN')}
                        </span>
                        <span className="text-slate-500 text-[11px]">{lead.loan_type}</span>
                        {lead.preferred_bank && (
                          <span className="text-[10px] text-blue-600 block">
                            Bank: {lead.preferred_bank}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      <span>
                        {lead.city}, {lead.state}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      {lead.assigned_employee_name ? (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-100 text-slate-800 text-[11px] font-medium">
                          <UserCheck className="h-3 w-3 text-blue-600" />
                          {lead.assigned_employee_name}
                        </span>
                      ) : (
                        <span className="text-amber-600 text-[11px] font-semibold bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                          Unassigned
                        </span>
                      )}
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
                          onClick={() => setSelectedLeadId(lead.id)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          title="View Full Profile"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(lead)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                          title="Edit Lead"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Archive lead "${lead.customer_name}"?`)) {
                              deleteMutation.mutate(lead.id)
                            }
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Archive Lead"
                        >
                          <Trash2 className="h-4 w-4" />
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
            title="No leads found"
            description="No customer leads match the selected search and filter criteria."
            action={{
              label: 'Create Lead',
              onClick: () => {
                resetForm()
                setIsCreateOpen(true)
              },
            }}
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

      {/* Lead Detail Profile Drawer */}
      {selectedLeadId && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col overflow-hidden animate-slide-in">
            {/* Drawer Header */}
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="text-base font-bold text-slate-900">Customer Lead Profile</h3>
                <p className="text-xs text-slate-500">Full 360-degree customer interaction history</p>
              </div>
              <button
                onClick={() => setSelectedLeadId(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Drawer Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {detailsLoading ? (
                <div className="py-12 text-center text-slate-400">Loading lead details...</div>
              ) : leadDetails ? (
                <>
                  {/* Lead Information Card */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-lg font-bold text-slate-900">
                          {leadDetails.lead.customer_name}
                        </h4>
                        <div className="flex items-center gap-3 text-xs text-slate-600 mt-1">
                          <span className="flex items-center gap-1">
                            <Phone className="h-3.5 w-3.5 text-slate-400" />
                            {leadDetails.lead.phone}
                          </span>
                          {leadDetails.lead.email && (
                            <span className="flex items-center gap-1">
                              <Mail className="h-3.5 w-3.5 text-slate-400" />
                              {leadDetails.lead.email}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <StatusBadge status={leadDetails.lead.status} />
                        <PriorityBadge priority={leadDetails.lead.priority} />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-3 border-t border-slate-200 text-xs">
                      <div>
                        <span className="text-slate-400 block">Requested Amount</span>
                        <strong className="text-slate-900">
                          ₹{leadDetails.lead.requested_amount.toLocaleString('en-IN')}
                        </strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Loan Scheme Type</span>
                        <strong className="text-slate-900">{leadDetails.lead.loan_type}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Monthly Income</span>
                        <strong className="text-slate-900">
                          ₹{leadDetails.lead.monthly_income.toLocaleString('en-IN')}
                        </strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Location</span>
                        <strong className="text-slate-900">
                          {leadDetails.lead.city}, {leadDetails.lead.state}
                        </strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Preferred Bank</span>
                        <strong className="text-slate-900">
                          {leadDetails.lead.preferred_bank || 'Any'}
                        </strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Assigned Staff</span>
                        <strong className="text-slate-900">
                          {leadDetails.lead.assigned_employee_name || 'Unassigned'}
                        </strong>
                      </div>
                    </div>
                  </div>

                  {/* Call History */}
                  <div>
                    <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2.5">
                      Call Records ({leadDetails.calls?.length || 0})
                    </h5>
                    {leadDetails.calls && leadDetails.calls.length > 0 ? (
                      <div className="space-y-2">
                        {leadDetails.calls.map((call: any) => (
                          <div
                            key={call.id}
                            className="p-3 bg-white border border-slate-200 rounded-lg text-xs space-y-1"
                          >
                            <div className="flex justify-between items-center">
                              <span className="font-semibold text-slate-800">
                                {call.employee_name}
                              </span>
                              <StatusBadge status={call.outcome} />
                            </div>
                            <p className="text-slate-600">{call.remarks || 'No remarks provided'}</p>
                            <span className="text-[10px] text-slate-400 block">
                              Duration: {call.duration_seconds}s •{' '}
                              {new Date(call.call_datetime).toLocaleString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 italic">No calls logged yet.</p>
                    )}
                  </div>

                  {/* Follow-ups */}
                  <div>
                    <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2.5">
                      Follow-ups ({leadDetails.follow_ups?.length || 0})
                    </h5>
                    {leadDetails.follow_ups && leadDetails.follow_ups.length > 0 ? (
                      <div className="space-y-2">
                        {leadDetails.follow_ups.map((fu: any) => (
                          <div
                            key={fu.id}
                            className="p-3 bg-white border border-slate-200 rounded-lg text-xs space-y-1"
                          >
                            <div className="flex justify-between items-center">
                              <span className="font-semibold text-slate-800">
                                Scheduled: {fu.scheduled_date}
                              </span>
                              <StatusBadge status={fu.status} />
                            </div>
                            <p className="text-slate-600">{fu.remarks || 'No remarks'}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 italic">No scheduled follow-ups.</p>
                    )}
                  </div>

                  {/* Documents */}
                  <div>
                    <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2.5">
                      Uploaded Documents ({leadDetails.documents?.length || 0})
                    </h5>
                    {leadDetails.documents && leadDetails.documents.length > 0 ? (
                      <div className="space-y-2">
                        {leadDetails.documents.map((doc: any) => (
                          <div
                            key={doc.id}
                            className="p-3 bg-white border border-slate-200 rounded-lg text-xs flex justify-between items-center"
                          >
                            <div>
                              <span className="font-semibold text-slate-900 block">
                                {doc.category.toUpperCase()} - {doc.file_name}
                              </span>
                              <span className="text-[10px] text-slate-400">
                                {Math.round(doc.file_size / 1024)} KB
                              </span>
                            </div>
                            <StatusBadge status={doc.verification_status} />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 italic">No documents uploaded.</p>
                    )}
                  </div>

                  {/* Applications */}
                  <div>
                    <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2.5">
                      Loan Applications ({leadDetails.applications?.length || 0})
                    </h5>
                    {leadDetails.applications && leadDetails.applications.length > 0 ? (
                      <div className="space-y-2">
                        {leadDetails.applications.map((app: any) => (
                          <div
                            key={app.id}
                            className="p-3 bg-white border border-slate-200 rounded-lg text-xs space-y-1"
                          >
                            <div className="flex justify-between items-center">
                              <span className="font-bold text-slate-900">{app.bank_name}</span>
                              <StatusBadge status={app.status} />
                            </div>
                            <div className="flex justify-between text-slate-600">
                              <span>Scheme: {app.scheme_name}</span>
                              <span>Req: ₹{app.requested_amount.toLocaleString('en-IN')}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 italic">No loan applications yet.</p>
                    )}
                  </div>
                </>
              ) : null}
            </div>
          </div>
        </div>
      )}

      {/* Create Lead Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Create Customer Lead"
        subtitle="Add a new lead manually into the CRM database"
        maxWidth="2xl"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Customer Full Name *</label>
              <input
                type="text"
                required
                value={formData.customer_name}
                onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900"
                placeholder="e.g. Ramesh Chandra"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Phone Number *</label>
              <input
                type="text"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900"
                placeholder="10 digit mobile"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900"
                placeholder="customer@example.com"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">City *</label>
              <input
                type="text"
                required
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900"
                placeholder="e.g. Mumbai"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">State *</label>
              <input
                type="text"
                required
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900"
                placeholder="e.g. Maharashtra"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Employment Type *</label>
              <select
                value={formData.employment_type}
                onChange={(e) => setFormData({ ...formData, employment_type: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 bg-white"
              >
                {EMPLOYMENT_TYPE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Monthly Income (₹) *</label>
              <input
                type="number"
                required
                value={formData.monthly_income}
                onChange={(e) => setFormData({ ...formData, monthly_income: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900"
                placeholder="e.g. 75000"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Requested Loan Amount (₹) *</label>
              <input
                type="number"
                required
                value={formData.requested_amount}
                onChange={(e) => setFormData({ ...formData, requested_amount: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900"
                placeholder="e.g. 500000"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Loan Category *</label>
              <select
                value={formData.loan_type}
                onChange={(e) => setFormData({ ...formData, loan_type: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 bg-white"
              >
                {LOAN_TYPE_OPTIONS.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Preferred Bank</label>
              <input
                type="text"
                value={formData.preferred_bank}
                onChange={(e) => setFormData({ ...formData, preferred_bank: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900"
                placeholder="e.g. HDFC Bank"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Lead Source</label>
              <input
                type="text"
                value={formData.lead_source}
                onChange={(e) => setFormData({ ...formData, lead_source: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900"
                placeholder="e.g. Google Ads"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 bg-white"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsCreateOpen(false)}
              className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm"
            >
              {createMutation.isPending ? 'Saving...' : 'Save Lead'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Lead Modal */}
      <Modal
        isOpen={!!editingLead}
        onClose={() => setEditingLead(null)}
        title="Edit Customer Lead"
        subtitle={`Editing record for ${editingLead?.customer_name}`}
        maxWidth="2xl"
      >
        <form onSubmit={handleEditSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Customer Full Name</label>
              <input
                type="text"
                value={formData.customer_name}
                onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Phone Number</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 bg-white"
              >
                {LEAD_STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 bg-white"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Requested Amount (₹)</label>
              <input
                type="number"
                value={formData.requested_amount}
                onChange={(e) => setFormData({ ...formData, requested_amount: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Preferred Bank</label>
              <input
                type="text"
                value={formData.preferred_bank}
                onChange={(e) => setFormData({ ...formData, preferred_bank: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setEditingLead(null)}
              className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updateMutation.isPending}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm"
            >
              {updateMutation.isPending ? 'Updating...' : 'Update Lead'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Bulk CSV Upload Modal */}
      <Modal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        title="Bulk Lead Import via CSV"
        subtitle="Upload customer leads spreadsheet with duplicate detection"
        maxWidth="lg"
      >
        <form onSubmit={handleUploadSubmit} className="space-y-4 text-xs">
          <div className="p-4 border-2 border-dashed border-slate-200 rounded-xl text-center bg-slate-50/50 hover:bg-slate-50 transition-colors">
            <Upload className="h-8 w-8 text-blue-500 mx-auto mb-2" />
            <p className="font-semibold text-slate-800">Select CSV Spreadsheet</p>
            <p className="text-slate-500 text-[11px] mt-0.5">
              Requires columns: customer_name, phone, city, state, monthly_income, loan_type, requested_amount
            </p>
            <input
              type="file"
              accept=".csv"
              onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
              className="mt-3 block w-full text-xs text-slate-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              required
            />
          </div>

          {/* Upload Results & Duplicate Telemetry */}
          {uploadResult && (
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
              <div className="flex items-center gap-2 font-bold text-slate-900 text-xs">
                {uploadResult.created > 0 ? (
                  <CheckCircle className="h-4 w-4 text-emerald-600" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-amber-500" />
                )}
                <span>Import Summary</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
                <div className="bg-white p-2 rounded border border-slate-200">
                  <span className="text-slate-400 block">Total Processed</span>
                  <strong className="text-slate-800">{uploadResult.total}</strong>
                </div>
                <div className="bg-white p-2 rounded border border-slate-200">
                  <span className="text-emerald-600 block">Created</span>
                  <strong className="text-emerald-700">{uploadResult.created}</strong>
                </div>
                <div className="bg-white p-2 rounded border border-slate-200">
                  <span className="text-amber-600 block">Duplicates</span>
                  <strong className="text-amber-700">{uploadResult.duplicates}</strong>
                </div>
              </div>
              {uploadResult.errors && uploadResult.errors.length > 0 && (
                <div className="mt-2 text-[10px] text-rose-600 space-y-0.5">
                  <p className="font-semibold">Errors encountered:</p>
                  {uploadResult.errors.map((err: string, i: number) => (
                    <p key={i}>• {err}</p>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="flex justify-between items-center pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={handleDownloadTemplate}
              className="text-xs text-blue-600 hover:text-blue-800 font-medium"
            >
              Download Sample CSV
            </button>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setIsUploadOpen(false)}
                className="px-3 py-1.5 border border-slate-200 rounded-lg text-slate-600"
              >
                Close
              </button>
              <button
                type="submit"
                disabled={uploading || !uploadFile}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg disabled:opacity-50"
              >
                {uploading ? 'Processing CSV...' : 'Upload & Process'}
              </button>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  )
}
