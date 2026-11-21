import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  CalendarClock,
  Clock,
  AlertCircle,
  CheckCircle2,
  Calendar,
  UserCheck,
  Check,
  RotateCcw,
} from 'lucide-react'
import { apiClient } from '@/services/api'
import { FollowUp, PaginatedResponse, Employee } from '@/types'
import { StatusBadge } from '@/components/common/Badge'
import { Pagination } from '@/components/common/Pagination'
import { Modal } from '@/components/common/Modal'
import { SkeletonTable } from '@/components/common/LoadingSkeleton'
import { EmptyState } from '@/components/common/EmptyState'

export const FollowUpManagement: React.FC = () => {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [activeTab, setActiveTab] = useState<'all' | 'today' | 'overdue' | 'upcoming' | 'completed'>('all')
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('')

  // Modals
  const [rescheduleItem, setRescheduleItem] = useState<FollowUp | null>(null)
  const [completeItem, setCompleteItem] = useState<FollowUp | null>(null)
  const [newDate, setNewDate] = useState('')
  const [actionRemarks, setActionRemarks] = useState('')

  // 1. Fetch Employees
  const { data: employeesData } = useQuery<PaginatedResponse<Employee>>({
    queryKey: ['adminEmployeesForFollowUpFilter'],
    queryFn: () => apiClient.get<PaginatedResponse<Employee>>('/employees?page=1&page_size=50'),
  })

  // 2. Fetch Follow-ups
  const { data: followUpsData, isLoading } = useQuery<PaginatedResponse<FollowUp>>({
    queryKey: ['adminFollowUps', page, pageSize, activeTab, selectedEmployeeId],
    queryFn: () => {
      const params: Record<string, any> = { page, page_size: pageSize }
      if (activeTab !== 'all') params.filter_type = activeTab
      if (selectedEmployeeId) params.employee_id = selectedEmployeeId
      return apiClient.get<PaginatedResponse<FollowUp>>('/followups', params)
    },
  })

  // Complete Mutation
  const completeMutation = useMutation({
    mutationFn: ({ id, remarks }: { id: string; remarks: string }) =>
      apiClient.patch(`/followups/${id}/complete`, { remarks }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminFollowUps'] })
      queryClient.invalidateQueries({ queryKey: ['adminDashboardStats'] })
      setCompleteItem(null)
      setActionRemarks('')
    },
  })

  // Reschedule Mutation
  const rescheduleMutation = useMutation({
    mutationFn: ({ id, date, remarks }: { id: string; date: string; remarks: string }) =>
      apiClient.patch(`/followups/${id}/reschedule`, { new_date: date, remarks }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminFollowUps'] })
      setRescheduleItem(null)
      setNewDate('')
      setActionRemarks('')
    },
  })

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <CalendarClock className="h-6 w-6 text-amber-500" />
            Follow-up Management
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor client callback commitments, overdue escalations, and schedule milestones.
          </p>
        </div>
      </div>

      {/* Tabs and Filters */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs font-semibold">
          {[
            { id: 'all', label: 'All Follow-ups' },
            { id: 'today', label: 'Due Today' },
            { id: 'overdue', label: 'Overdue Escalations' },
            { id: 'upcoming', label: 'Upcoming' },
            { id: 'completed', label: 'Completed' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any)
                setPage(1)
              }}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Staff Filter Dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">Filter Agent:</span>
          <select
            value={selectedEmployeeId}
            onChange={(e) => {
              setSelectedEmployeeId(e.target.value)
              setPage(1)
            }}
            className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-white text-slate-700"
          >
            <option value="">All Staff</option>
            {employeesData?.items.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.user.full_name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Follow-ups Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <SkeletonTable rows={8} cols={6} />
        ) : followUpsData && followUpsData.items.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase border-b border-slate-200 font-semibold">
                <tr>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Sales Agent</th>
                  <th className="py-3 px-4">Scheduled Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Notes / History</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {followUpsData.items.map((fu) => {
                  const todayStr = new Date().toISOString().split('T')[0]
                  const isOverdue = fu.scheduled_date < todayStr && fu.status === 'pending'
                  const isToday = fu.scheduled_date === todayStr && fu.status === 'pending'

                  return (
                    <tr key={fu.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-slate-900">
                        {fu.customer_name || 'Customer'}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 text-slate-700 font-medium">
                          <UserCheck className="h-3.5 w-3.5 text-blue-600" />
                          {fu.employee_name}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 font-medium">
                          {isOverdue && <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />}
                          {isToday && <Clock className="h-4 w-4 text-amber-500 shrink-0" />}
                          <span
                            className={
                              isOverdue
                                ? 'text-rose-600 font-bold'
                                : isToday
                                ? 'text-amber-600 font-bold'
                                : 'text-slate-800'
                            }
                          >
                            {fu.scheduled_date}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <StatusBadge status={isOverdue ? 'overdue' : fu.status} />
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate" title={fu.remarks || ''}>
                        {fu.remarks || '—'}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {fu.status !== 'completed' ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => {
                                setCompleteItem(fu)
                                setActionRemarks('')
                              }}
                              className="px-2.5 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-md transition-colors"
                            >
                              Complete
                            </button>
                            <button
                              onClick={() => {
                                setRescheduleItem(fu)
                                setNewDate(fu.scheduled_date)
                                setActionRemarks('')
                              }}
                              className="px-2.5 py-1 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
                            >
                              Reschedule
                            </button>
                          </div>
                        ) : (
                          <span className="text-emerald-600 text-xs font-medium flex items-center justify-end gap-1">
                            <Check className="h-3.5 w-3.5" />
                            Completed
                          </span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            title="No follow-ups in this view"
            description="All scheduled customer callback commitments will appear here."
          />
        )}

        <Pagination
          currentPage={page}
          totalPages={followUpsData?.pages || 1}
          totalItems={followUpsData?.total || 0}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={(newSize) => {
            setPageSize(newSize)
            setPage(1)
          }}
        />
      </div>

      {/* Reschedule Modal */}
      <Modal
        isOpen={!!rescheduleItem}
        onClose={() => setRescheduleItem(null)}
        title="Reschedule Follow-up"
        subtitle={`Rescheduling customer callback for ${rescheduleItem?.customer_name}`}
        maxWidth="sm"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault()
            if (!rescheduleItem || !newDate) return
            rescheduleMutation.mutate({
              id: rescheduleItem.id,
              date: newDate,
              remarks: actionRemarks,
            })
          }}
          className="space-y-4 text-xs"
        >
          <div>
            <label className="block font-semibold text-slate-700 mb-1">New Target Date *</label>
            <input
              type="date"
              required
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Reason / Notes</label>
            <textarea
              rows={2}
              value={actionRemarks}
              onChange={(e) => setActionRemarks(e.target.value)}
              placeholder="e.g. Customer out of town, requested call next Monday"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setRescheduleItem(null)}
              className="px-3 py-1.5 border border-slate-200 rounded-lg text-slate-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={rescheduleMutation.isPending}
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg"
            >
              Confirm Reschedule
            </button>
          </div>
        </form>
      </Modal>

      {/* Complete Follow-up Modal */}
      <Modal
        isOpen={!!completeItem}
        onClose={() => setCompleteItem(null)}
        title="Complete Follow-up"
        subtitle={`Mark follow-up for ${completeItem?.customer_name} as done`}
        maxWidth="sm"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault()
            if (!completeItem) return
            completeMutation.mutate({
              id: completeItem.id,
              remarks: actionRemarks,
            })
          }}
          className="space-y-4 text-xs"
        >
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Completion Summary</label>
            <textarea
              rows={3}
              value={actionRemarks}
              onChange={(e) => setActionRemarks(e.target.value)}
              placeholder="e.g. Customer provided requested documents, ready for loan filing."
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setCompleteItem(null)}
              className="px-3 py-1.5 border border-slate-200 rounded-lg text-slate-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={completeMutation.isPending}
              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg"
            >
              Mark Completed
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
