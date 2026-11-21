import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  PhoneCall,
  Search,
  Filter,
  Plus,
  Calendar,
  Clock,
  Target,
  User,
  Phone,
  FileText,
  AlertCircle,
  CalendarClock,
  CheckCircle2,
} from 'lucide-react'
import { apiClient } from '@/services/api'
import { CallLog, CallProgress, Lead, PaginatedResponse } from '@/types'
import { Badge } from '@/components/common/Badge'
import { Modal } from '@/components/common/Modal'
import { Pagination } from '@/components/common/Pagination'
import { EmptyState } from '@/components/common/EmptyState'
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton'
import { CALL_OUTCOME_OPTIONS } from '@/utils/constants'

export const StaffCalls: React.FC = () => {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [outcomeFilter, setOutcomeFilter] = useState('')
  const [isLogCallOpen, setIsLogCallOpen] = useState(false)

  // Form State for Logging Call
  const [selectedLeadId, setSelectedLeadId] = useState('')
  const [outcome, setOutcome] = useState('interested')
  const [duration, setDuration] = useState('120')
  const [remarks, setRemarks] = useState('')
  const [followUpDate, setFollowUpDate] = useState('')
  const [formError, setFormError] = useState('')

  // 1. Fetch Today's 100-Call Target Progress
  const { data: progress } = useQuery<CallProgress>({
    queryKey: ['staffCallProgress'],
    queryFn: () => apiClient.get<CallProgress>('/calls/progress'),
  })

  // 2. Fetch Call History
  const { data: callsData, isLoading } = useQuery<PaginatedResponse<CallLog>>({
    queryKey: ['staffCalls', page, outcomeFilter],
    queryFn: () =>
      apiClient.get<PaginatedResponse<CallLog>>('/calls', {
        page,
        page_size: 15,
        ...(outcomeFilter ? { outcome: outcomeFilter } : {}),
      }),
  })

  // 3. Fetch Assigned Leads for Dropdown
  const { data: leadsData } = useQuery<PaginatedResponse<Lead>>({
    queryKey: ['staffAssignedLeadsForCalls'],
    queryFn: () => apiClient.get<PaginatedResponse<Lead>>('/leads?page=1&page_size=100'),
    enabled: isLogCallOpen,
  })

  // Log Call Mutation
  const logCallMutation = useMutation({
    mutationFn: (payload: any) => apiClient.post('/calls', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staffCalls'] })
      queryClient.invalidateQueries({ queryKey: ['staffCallProgress'] })
      queryClient.invalidateQueries({ queryKey: ['staffDashboardStats'] })
      queryClient.invalidateQueries({ queryKey: ['myLeads'] })
      setIsLogCallOpen(false)
      setSelectedLeadId('')
      setOutcome('interested')
      setDuration('120')
      setRemarks('')
      setFollowUpDate('')
      setFormError('')
    },
    onError: (err: any) => {
      setFormError(err.response?.data?.detail || 'Failed to record call.')
    },
  })

  const handleLogCallSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')
    if (!selectedLeadId) {
      setFormError('Please select a customer lead.')
      return
    }
    logCallMutation.mutate({
      lead_id: selectedLeadId,
      outcome,
      duration_seconds: Number(duration) || 60,
      remarks: remarks.trim() || undefined,
      next_follow_up_date: followUpDate ? new Date(followUpDate).toISOString() : null,
    })
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    if (mins === 0) return `${secs}s`
    return `${mins}m ${secs}s`
  }

  const completed = progress?.completed || 0
  const target = progress?.target || 100
  const remaining = Math.max(0, target - completed)
  const pct = Math.min(Math.round((completed / target) * 100), 100)

  return (
    <div className="space-y-6">
      {/* 100-Call Daily Target Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 rounded-2xl p-6 text-white border border-slate-700 shadow-sm relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs tracking-wider uppercase">
              <Target className="h-4 w-4" />
              Daily Calling Milestone
            </div>
            <h2 className="text-2xl font-bold mt-1 text-white">Call Centre Shift Activity</h2>
            <p className="text-slate-300 text-sm mt-1 max-w-xl">
              Every employee has a daily goal of 100 customer interactions. Accurate call logging keeps
              lead statuses updated and schedules follow-up callbacks automatically.
            </p>
          </div>

          <div className="flex items-center gap-6 bg-slate-900/80 backdrop-blur-md px-6 py-4 rounded-xl border border-slate-700/80">
            <div>
              <div className="text-xs text-slate-400 uppercase tracking-wider font-medium">Logged Today</div>
              <div className="text-3xl font-extrabold text-emerald-400">{completed}</div>
              <div className="text-[11px] text-slate-400">Target: {target}</div>
            </div>
            <div className="h-10 w-px bg-slate-700" />
            <div>
              <div className="text-xs text-slate-400 uppercase tracking-wider font-medium">Remaining</div>
              <div className="text-3xl font-extrabold text-amber-400">{remaining}</div>
              <div className="text-[11px] text-slate-400">{pct}% achieved</div>
            </div>
            <button
              onClick={() => setIsLogCallOpen(true)}
              className="ml-2 inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-medium text-sm rounded-xl transition shadow-lg shadow-emerald-900/30"
            >
              <Plus className="h-4 w-4" />
              Log Call
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-slate-400" />
            <span className="text-xs font-semibold text-slate-500 uppercase">Outcome:</span>
          </div>
          <select
            value={outcomeFilter}
            onChange={(e) => {
              setOutcomeFilter(e.target.value)
              setPage(1)
            }}
            className="text-xs border border-slate-300 rounded-lg px-3 py-2 bg-slate-50 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">All Outcomes</option>
            {CALL_OUTCOME_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="text-xs text-slate-500">
          Showing <span className="font-semibold text-slate-800">{callsData?.total || 0}</span> calls recorded
        </div>
      </div>

      {/* Call History Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-6">
            <LoadingSkeleton count={6} />
          </div>
        ) : !callsData || callsData.items.length === 0 ? (
          <EmptyState
            title="No call records found"
            description="You haven't logged any calls matching this filter yet. Begin by contacting your assigned leads."
            action={{
              label: 'Log Your First Call',
              onClick: () => setIsLogCallOpen(true),
            }}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">Customer Lead</th>
                  <th className="py-3 px-4">Outcome</th>
                  <th className="py-3 px-4">Duration</th>
                  <th className="py-3 px-4">Remarks & Follow-up</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {callsData.items.map((call) => (
                  <tr key={call.id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3.5 px-4 font-mono text-slate-600 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                        {new Date(call.call_datetime).toLocaleDateString()}
                      </div>
                      <div className="text-[10px] text-slate-400 pl-5">
                        {new Date(call.call_datetime).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900">
                        {call.customer_name || 'Customer Lead'}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        ID: {call.lead_id.slice(0, 8)}...
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge status={call.outcome} />
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-600">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5 text-slate-400" />
                        {formatDuration(call.duration_seconds)}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="text-slate-800 line-clamp-1">
                        {call.remarks || <span className="text-slate-400 italic">No remarks</span>}
                      </div>
                      {call.next_follow_up_date && (
                        <div className="inline-flex items-center gap-1 text-[11px] text-amber-700 font-medium mt-0.5 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          <CalendarClock className="h-3 w-3" />
                          Callback: {new Date(call.next_follow_up_date).toLocaleString([], {
                            dateStyle: 'medium',
                            timeStyle: 'short',
                          })}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {callsData && callsData.pages > 1 && (
          <div className="p-4 border-t border-slate-200">
            <Pagination
              currentPage={page}
              totalPages={callsData.pages}
              onPageChange={setPage}
            />
          </div>
        )}
      </div>

      {/* Log Call Modal */}
      <Modal
        isOpen={isLogCallOpen}
        onClose={() => setIsLogCallOpen(false)}
        title="Log Customer Call"
        size="md"
      >
        <form onSubmit={handleLogCallSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Select Customer Lead <span className="text-rose-500">*</span>
            </label>
            <select
              value={selectedLeadId}
              onChange={(e) => setSelectedLeadId(e.target.value)}
              className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 bg-slate-50 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
            >
              <option value="">-- Select from your assigned leads --</option>
              {leadsData?.items.map((lead) => (
                <option key={lead.id} value={lead.id}>
                  {lead.customer_name} ({lead.phone}) - {lead.loan_type} [₹{lead.requested_amount.toLocaleString()}]
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Call Outcome <span className="text-rose-500">*</span>
              </label>
              <select
                value={outcome}
                onChange={(e) => setOutcome(e.target.value)}
                className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 bg-slate-50 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              >
                {CALL_OUTCOME_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Duration (seconds)
              </label>
              <input
                type="number"
                min="5"
                max="7200"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 bg-slate-50 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="120"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Remarks & Interaction Notes
            </label>
            <textarea
              rows={3}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Customer interested in HDFC Home Loan, requested scheme brochure and interest breakdown..."
              className="w-full text-xs border border-slate-300 rounded-lg p-2.5 bg-slate-50 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Schedule Callback / Follow-up (Optional)
            </label>
            <input
              type="datetime-local"
              value={followUpDate}
              onChange={(e) => setFollowUpDate(e.target.value)}
              className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 bg-slate-50 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Automatically schedules a follow-up reminder in your queue.
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsLogCallOpen(false)}
              className="px-4 py-2 border border-slate-300 text-slate-700 text-xs font-medium rounded-lg hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={logCallMutation.isPending}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-xs font-medium rounded-lg disabled:opacity-50 transition"
            >
              {logCallMutation.isPending ? 'Logging Call...' : 'Save Call Record'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
