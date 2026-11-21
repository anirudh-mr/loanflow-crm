import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Users,
  Search,
  Filter,
  Plus,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Building,
  User,
  ChevronRight,
  AlertCircle,
  FileSpreadsheet,
  Check,
} from 'lucide-react'
import { apiClient } from '@/services/api'
import { Lead, PaginatedResponse, Employee } from '@/types'
import { Badge } from '@/components/common/Badge'
import { Modal } from '@/components/common/Modal'
import { Pagination } from '@/components/common/Pagination'
import { EmptyState } from '@/components/common/EmptyState'
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton'
import { LEAD_STATUS_OPTIONS, LEAD_PRIORITY_OPTIONS } from '@/utils/constants'

export const MobileLeads: React.FC = () => {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('')

  // Selected Lead for Detail Modal
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [reassignEmployeeId, setReassignEmployeeId] = useState('')

  // Create Lead Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [formData, setFormData] = useState({
    customer_name: '',
    phone: '',
    email: '',
    city: '',
    state: '',
    employment_type: 'Salaried',
    monthly_income: '50000',
    loan_type: 'Personal Loan',
    requested_amount: '300000',
    preferred_bank: '',
    lead_source: 'Online Ads',
    priority: 'medium',
    assigned_employee_id: '',
  })
  const [createError, setCreateError] = useState('')

  // Fetch Leads
  const { data: leadsData, isLoading } = useQuery<PaginatedResponse<Lead>>({
    queryKey: ['mobileLeads', page, search, statusFilter, priorityFilter],
    queryFn: () =>
      apiClient.get<PaginatedResponse<Lead>>('/leads', {
        page,
        page_size: 15,
        search: search.trim() || undefined,
        status: statusFilter || undefined,
        priority: priorityFilter || undefined,
      }),
  })

  // Fetch Active Employees for Reassignment & Assignment
  const { data: employeesData } = useQuery<PaginatedResponse<Employee>>({
    queryKey: ['activeEmployeesForMobileLeads'],
    queryFn: () => apiClient.get<PaginatedResponse<Employee>>('/employees?is_active=true&page_size=50'),
  })

  // Create Lead Mutation
  const createLeadMutation = useMutation({
    mutationFn: (data: any) => apiClient.post('/leads', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mobileLeads'] })
      queryClient.invalidateQueries({ queryKey: ['adminDashboardStats'] })
      setIsCreateOpen(false)
      setFormData({
        customer_name: '',
        phone: '',
        email: '',
        city: '',
        state: '',
        employment_type: 'Salaried',
        monthly_income: '50000',
        loan_type: 'Personal Loan',
        requested_amount: '300000',
        preferred_bank: '',
        lead_source: 'Online Ads',
        priority: 'medium',
        assigned_employee_id: '',
      })
      setCreateError('')
    },
    onError: (err: any) => {
      setCreateError(err.response?.data?.detail || 'Failed to create lead.')
    },
  })

  // Reassign Lead Mutation
  const reassignMutation = useMutation({
    mutationFn: ({ leadId, employeeId }: { leadId: string; employeeId: string }) =>
      apiClient.put<Lead>(`/leads/${leadId}`, { assigned_employee_id: employeeId }),
    onSuccess: (updatedLead: Lead) => {
      queryClient.invalidateQueries({ queryKey: ['mobileLeads'] })
      queryClient.invalidateQueries({ queryKey: ['adminDashboardStats'] })
      setSelectedLead(updatedLead)
    },
  })

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setCreateError('')
    if (!formData.customer_name || !formData.phone || !formData.city || !formData.state) {
      setCreateError('Please fill in all required customer fields.')
      return
    }

    createLeadMutation.mutate({
      ...formData,
      monthly_income: Number(formData.monthly_income),
      requested_amount: Number(formData.requested_amount),
      assigned_employee_id: formData.assigned_employee_id || undefined,
    })
  }

  return (
    <div className="p-4 space-y-4">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Leads CRM</h1>
          <p className="text-xs text-slate-500">{leadsData?.total || 0} customer leads</p>
        </div>
        <button
          onClick={() => setIsCreateOpen(true)}
          className="inline-flex items-center gap-1.5 px-3 py-2 bg-blue-600 active:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-xs"
        >
          <Plus className="h-4 w-4" />
          New Lead
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="space-y-2">
        <div className="relative">
          <Search className="h-4 w-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search customer, phone, city..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value)
              setPage(1)
            }}
            className="w-1/2 text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Statuses</option>
            {LEAD_STATUS_OPTIONS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => {
              setPriorityFilter(e.target.value)
              setPage(1)
            }}
            className="w-1/2 text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Priorities</option>
            {LEAD_PRIORITY_OPTIONS.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Leads List */}
      {isLoading ? (
        <LoadingSkeleton count={5} />
      ) : !leadsData || leadsData.items.length === 0 ? (
        <EmptyState
          title="No leads found"
          description="No leads match your search criteria. Create a new lead or clear the filters."
        />
      ) : (
        <div className="space-y-3">
          {leadsData.items.map((lead) => (
            <div
              key={lead.id}
              onClick={() => {
                setSelectedLead(lead)
                setReassignEmployeeId(lead.assigned_employee_id || '')
              }}
              className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs active:bg-slate-50 transition cursor-pointer space-y-2"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">{lead.customer_name}</h3>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                    <Phone className="h-3 w-3 text-slate-400" />
                    <span>{lead.phone}</span>
                    <span className="text-slate-300">•</span>
                    <span>{lead.city}</span>
                  </div>
                </div>
                <Badge status={lead.status} />
              </div>

              <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
                <span className="text-slate-600 font-medium">{lead.loan_type}</span>
                <span className="font-bold text-slate-900 font-mono">
                  ₹{lead.requested_amount.toLocaleString()}
                </span>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5">
                <span className="truncate max-w-[180px]">
                  Agent: <strong className="text-slate-700">{lead.assigned_employee_name || 'Unassigned'}</strong>
                </span>
                <span className="text-blue-600 font-semibold flex items-center">
                  Details <ChevronRight className="h-3 w-3" />
                </span>
              </div>
            </div>
          ))}

          {leadsData.pages > 1 && (
            <div className="pt-2">
              <Pagination
                currentPage={page}
                totalPages={leadsData.pages}
                onPageChange={setPage}
              />
            </div>
          )}
        </div>
      )}

      {/* Lead Detail & Reassignment Modal */}
      <Modal
        isOpen={!!selectedLead}
        onClose={() => setSelectedLead(null)}
        title={selectedLead?.customer_name || 'Lead Profile'}
        size="md"
      >
        {selectedLead && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Badge status={selectedLead.status} />
              <Badge status={selectedLead.priority} />
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Phone:</span>
                <a href={`tel:${selectedLead.phone}`} className="font-bold text-blue-600">
                  {selectedLead.phone}
                </a>
              </div>
              {selectedLead.email && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Email:</span>
                  <span className="text-slate-800">{selectedLead.email}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-slate-500">Location:</span>
                <span className="text-slate-800">{selectedLead.city}, {selectedLead.state}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Loan Product:</span>
                <span className="font-semibold text-slate-800">{selectedLead.loan_type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Requested Amount:</span>
                <span className="font-bold text-slate-900 font-mono">
                  ₹{selectedLead.requested_amount.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Monthly Income:</span>
                <span className="text-slate-800 font-mono">
                  ₹{selectedLead.monthly_income.toLocaleString()} ({selectedLead.employment_type})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Lead Source:</span>
                <span className="text-slate-800">{selectedLead.lead_source}</span>
              </div>
            </div>

            {/* Quick Reassign */}
            <div className="border-t border-slate-200 pt-3">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Assign / Reassign Call Centre Agent
              </label>
              <div className="flex gap-2">
                <select
                  value={reassignEmployeeId}
                  onChange={(e) => setReassignEmployeeId(e.target.value)}
                  className="flex-1 text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 bg-slate-50 text-slate-900"
                >
                  <option value="">-- Unassigned --</option>
                  {employeesData?.items.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.user.full_name} ({emp.employee_id})
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  disabled={reassignMutation.isPending || reassignEmployeeId === selectedLead.assigned_employee_id}
                  onClick={() => {
                    reassignMutation.mutate({
                      leadId: selectedLead.id,
                      employeeId: reassignEmployeeId,
                    })
                  }}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg disabled:opacity-40"
                >
                  Save
                </button>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedLead(null)}
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Create Lead Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Add New Customer Lead"
        size="md"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-3">
          {createError && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{createError}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Customer Full Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.customer_name}
              onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
              className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 bg-slate-50 text-slate-900"
              placeholder="e.g. Ramesh Verma"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Phone <span className="text-rose-500">*</span>
              </label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 bg-slate-50 text-slate-900"
                placeholder="9876543210"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 bg-slate-50 text-slate-900"
                placeholder="ramesh@gmail.com"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                City <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 bg-slate-50 text-slate-900"
                placeholder="Mumbai"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                State <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 bg-slate-50 text-slate-900"
                placeholder="Maharashtra"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Loan Product</label>
              <select
                value={formData.loan_type}
                onChange={(e) => setFormData({ ...formData, loan_type: e.target.value })}
                className="w-full text-xs border border-slate-300 rounded-lg px-2.5 py-2 bg-slate-50 text-slate-900"
              >
                <option value="Personal Loan">Personal Loan</option>
                <option value="Home Loan">Home Loan</option>
                <option value="Business Loan">Business Loan</option>
                <option value="Car Loan">Car Loan</option>
                <option value="Education Loan">Education Loan</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Loan Amount (₹)</label>
              <input
                type="number"
                value={formData.requested_amount}
                onChange={(e) => setFormData({ ...formData, requested_amount: e.target.value })}
                className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 bg-slate-50 text-slate-900"
                placeholder="500000"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Assign Agent</label>
            <select
              value={formData.assigned_employee_id}
              onChange={(e) => setFormData({ ...formData, assigned_employee_id: e.target.value })}
              className="w-full text-xs border border-slate-300 rounded-lg px-2.5 py-2 bg-slate-50 text-slate-900"
            >
              <option value="">-- Leave Unassigned --</option>
              {employeesData?.items.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.user.full_name} ({emp.employee_id})
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsCreateOpen(false)}
              className="px-3 py-2 border border-slate-300 text-slate-700 text-xs font-medium rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createLeadMutation.isPending}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg disabled:opacity-50"
            >
              {createLeadMutation.isPending ? 'Saving...' : 'Create Lead'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
