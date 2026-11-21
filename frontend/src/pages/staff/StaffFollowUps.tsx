import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  CalendarClock,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  RotateCw,
  Phone,
  User,
  Plus,
  AlertCircle,
  Check,
  ChevronRight,
  Filter,
} from 'lucide-react'
import { apiClient } from '@/services/api'
import { FollowUp, PaginatedResponse, Lead } from '@/types'
import { Badge } from '@/components/common/Badge'
import { Modal } from '@/components/common/Modal'
import { Pagination } from '@/components/common/Pagination'
import { EmptyState } from '@/components/common/EmptyState'
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton'

type TabType = 'all' | 'today' | 'overdue' | 'upcoming' | 'completed'

export const StaffFollowUps: React.FC = () => {
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState<TabType>('today')
  const [page, setPage] = useState(1)

  // Reschedule Modal State
  const [rescheduleItem, setRescheduleItem] = useState<FollowUp | null>(null)
  const [newDate, setNewDate] = useState('')
  const [rescheduleRemarks, setRescheduleRemarks] = useState('')

  // Complete Modal State
  const [completeItem, setCompleteItem] = useState<FollowUp | null>(null)
  const [completeRemarks, setCompleteRemarks] = useState('')

  // Create Follow-up Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [selectedLeadId, setSelectedLeadId] = useState('')
  const [createDate, setCreateDate] = useState('')
  const [createRemarks, setCreateRemarks] = useState('')

  // Fetch Follow-ups based on tab
  const { data: followUpsData, isLoading } = useQuery<PaginatedResponse<FollowUp>>({
    queryKey: ['staffFollowUps', activeTab, page],
    queryFn: () =>
      apiClient.get<PaginatedResponse<FollowUp>>('/followups', {
        page,
        page_size: 15,
        filter_type: activeTab === 'all' ? undefined : activeTab,
      }),
  })

  // Fetch Assigned Leads for Creating a Follow-up
  const { data: leadsData } = useQuery<PaginatedResponse<Lead>>({
    queryKey: ['staffAssignedLeadsForFollowup'],
    queryFn: () => apiClient.get<PaginatedResponse<Lead>>('/leads?page=1&page_size=100'),
    enabled: isCreateOpen,
  })

  // Complete Mutation
  const completeMutation = useMutation({
    mutationFn: ({ id, remarks }: { id: string; remarks?: string }) =>
      apiClient.patch(`/followups/${id}/complete`, { remarks }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staffFollowUps'] })
      queryClient.invalidateQueries({ queryKey: ['staffDashboardStats'] })
      setCompleteItem(null)
      setCompleteRemarks('')
    },
  })

  // Reschedule Mutation
  const rescheduleMutation = useMutation({
    mutationFn: ({ id, new_date, remarks }: { id: string; new_date: string; remarks?: string }) =>
      apiClient.patch(`/followups/${id}/reschedule`, { new_date, remarks }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staffFollowUps'] })
      queryClient.invalidateQueries({ queryKey: ['staffDashboardStats'] })
      setRescheduleItem(null)
      setNewDate('')
      setRescheduleRemarks('')
    },
  })

  // Create Mutation
  const createMutation = useMutation({
    mutationFn: (data: any) => apiClient.post('/followups', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staffFollowUps'] })
      queryClient.invalidateQueries({ queryKey: ['staffDashboardStats'] })
      setIsCreateOpen(false)
      setSelectedLeadId('')
      setCreateDate('')
      setCreateRemarks('')
    },
  })

  const tabs: { key: TabType; label: string; icon: React.ReactNode }[] = [
    { key: 'today', label: 'Due Today', icon: <Clock className="h-4 w-4" /> },
    { key: 'overdue', label: 'Overdue', icon: <AlertTriangle className="h-4 w-4 text-rose-500" /> },
    { key: 'upcoming', label: 'Upcoming', icon: <Calendar className="h-4 w-4" /> },
    { key: 'completed', label: 'Completed', icon: <CheckCircle2 className="h-4 w-4 text-emerald-500" /> },
    { key: 'all', label: 'All Records', icon: <CalendarClock className="h-4 w-4" /> },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Follow-up Management</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Never drop a warm lead. Manage your scheduled customer callbacks and follow-up commitments.
          </p>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-medium text-xs rounded-xl transition shadow-sm"
        >
          <Plus className="h-4 w-4" />
          Schedule Follow-up
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 gap-1 bg-white p-1 rounded-xl border shadow-sm overflow-x-auto">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key
          return (
            <button
              key={tab.key}
              onClick={() => {
                setActiveTab(tab.key)
                setPage(1)
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                isActive
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Follow-ups List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-6">
            <LoadingSkeleton count={6} />
          </div>
        ) : !followUpsData || followUpsData.items.length === 0 ? (
          <EmptyState
            title={`No ${activeTab} follow-ups`}
            description={
              activeTab === 'today'
                ? 'Great job! You have no pending follow-ups due today.'
                : activeTab === 'overdue'
                ? 'Zero overdue follow-ups. Your pipeline is up to date!'
                : 'No follow-up reminders found in this category.'
            }
          />
        ) : (
          <div className="divide-y divide-slate-100">
            {followUpsData.items.map((item) => {
              const isOverdue =
                item.status === 'overdue' ||
                (item.status === 'pending' &&
                  new Date(item.scheduled_date) < new Date(new Date().setHours(0, 0, 0, 0)))

              return (
                <div
                  key={item.id}
                  className={`p-4 sm:p-5 hover:bg-slate-50/70 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    isOverdue && item.status !== 'completed' ? 'bg-rose-50/30' : ''
                  }`}
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="font-bold text-slate-900 text-sm">
                        {item.customer_name || 'Customer Lead'}
                      </span>
                      <Badge status={item.status} />
                      {isOverdue && item.status !== 'completed' && (
                        <span className="text-[10px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          Overdue Action Required
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                      <div className="flex items-center gap-1.5 font-medium text-slate-700">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                        Scheduled: {new Date(item.scheduled_date).toLocaleDateString(undefined, {
                          weekday: 'short',
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </div>

                      {item.completed_date && (
                        <div className="flex items-center gap-1 text-emerald-600 font-medium">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Done on {new Date(item.completed_date).toLocaleDateString()}
                        </div>
                      )}
                    </div>

                    {item.remarks && (
                      <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200/80 inline-block max-w-2xl">
                        <span className="font-semibold text-slate-700">Notes:</span> {item.remarks}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  {item.status !== 'completed' && (
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => {
                          setRescheduleItem(item)
                          setNewDate(item.scheduled_date.slice(0, 10))
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-medium rounded-lg transition"
                      >
                        <RotateCw className="h-3.5 w-3.5 text-slate-500" />
                        Reschedule
                      </button>

                      <button
                        onClick={() => setCompleteItem(item)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg shadow-sm transition"
                      >
                        <Check className="h-3.5 w-3.5" />
                        Complete
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {followUpsData && followUpsData.pages > 1 && (
          <div className="p-4 border-t border-slate-200">
            <Pagination
              currentPage={page}
              totalPages={followUpsData.pages}
              onPageChange={setPage}
            />
          </div>
        )}
      </div>

      {/* Complete Follow-up Modal */}
      <Modal
        isOpen={!!completeItem}
        onClose={() => setCompleteItem(null)}
        title="Complete Follow-up"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600">
            Confirm completion of follow-up with{' '}
            <strong className="text-slate-900">{completeItem?.customer_name}</strong>.
          </p>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Closing Remarks / Outcome Notes
            </label>
            <textarea
              rows={3}
              value={completeRemarks}
              onChange={(e) => setCompleteRemarks(e.target.value)}
              placeholder="Spoke with customer, agreed to share salary slips over WhatsApp/portal..."
              className="w-full text-xs border border-slate-300 rounded-lg p-2.5 bg-slate-50 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              onClick={() => setCompleteItem(null)}
              className="px-3.5 py-2 border border-slate-300 text-slate-700 text-xs font-medium rounded-lg hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                if (completeItem) {
                  completeMutation.mutate({
                    id: completeItem.id,
                    remarks: completeRemarks.trim() || undefined,
                  })
                }
              }}
              disabled={completeMutation.isPending}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium rounded-lg disabled:opacity-50"
            >
              {completeMutation.isPending ? 'Marking...' : 'Confirm Completed'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Reschedule Modal */}
      <Modal
        isOpen={!!rescheduleItem}
        onClose={() => setRescheduleItem(null)}
        title="Reschedule Follow-up"
        size="sm"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              New Date <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 bg-slate-50 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Reason for Rescheduling
            </label>
            <textarea
              rows={3}
              value={rescheduleRemarks}
              onChange={(e) => setRescheduleRemarks(e.target.value)}
              placeholder="Customer requested to call back next Monday after salary credit..."
              className="w-full text-xs border border-slate-300 rounded-lg p-2.5 bg-slate-50 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              onClick={() => setRescheduleItem(null)}
              className="px-3.5 py-2 border border-slate-300 text-slate-700 text-xs font-medium rounded-lg hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                if (rescheduleItem && newDate) {
                  rescheduleMutation.mutate({
                    id: rescheduleItem.id,
                    new_date: newDate,
                    remarks: rescheduleRemarks.trim() || undefined,
                  })
                }
              }}
              disabled={rescheduleMutation.isPending || !newDate}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium rounded-lg disabled:opacity-50"
            >
              {rescheduleMutation.isPending ? 'Rescheduling...' : 'Update Date'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Create New Follow-up Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Schedule Follow-up"
        size="md"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault()
            if (!selectedLeadId || !createDate) return
            createMutation.mutate({
              lead_id: selectedLeadId,
              scheduled_date: createDate,
              remarks: createRemarks.trim() || undefined,
            })
          }}
          className="space-y-4"
        >
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Customer Lead <span className="text-rose-500">*</span>
            </label>
            <select
              value={selectedLeadId}
              onChange={(e) => setSelectedLeadId(e.target.value)}
              className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 bg-slate-50 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
            >
              <option value="">-- Choose from your leads --</option>
              {leadsData?.items.map((lead) => (
                <option key={lead.id} value={lead.id}>
                  {lead.customer_name} ({lead.phone}) - {lead.loan_type}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Follow-up Date <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              value={createDate}
              onChange={(e) => setCreateDate(e.target.value)}
              className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 bg-slate-50 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Agenda & Notes
            </label>
            <textarea
              rows={3}
              value={createRemarks}
              onChange={(e) => setCreateRemarks(e.target.value)}
              placeholder="Collect 3 months bank statement and discuss ROI concessions..."
              className="w-full text-xs border border-slate-300 rounded-lg p-2.5 bg-slate-50 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsCreateOpen(false)}
              className="px-4 py-2 border border-slate-300 text-slate-700 text-xs font-medium rounded-lg hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending || !selectedLeadId || !createDate}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium rounded-lg disabled:opacity-50"
            >
              {createMutation.isPending ? 'Scheduling...' : 'Save Follow-up'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
