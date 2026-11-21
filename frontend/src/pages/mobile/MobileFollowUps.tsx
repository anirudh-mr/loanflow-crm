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
  Filter,
  Check,
} from 'lucide-react'
import { apiClient } from '@/services/api'
import { FollowUp, PaginatedResponse, Employee } from '@/types'
import { Badge } from '@/components/common/Badge'
import { Modal } from '@/components/common/Modal'
import { Pagination } from '@/components/common/Pagination'
import { EmptyState } from '@/components/common/EmptyState'
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton'

type TabType = 'today' | 'overdue' | 'upcoming' | 'completed' | 'all'

export const MobileFollowUps: React.FC = () => {
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState<TabType>('today')
  const [page, setPage] = useState(1)
  const [empFilter, setEmpFilter] = useState('')

  // Reschedule Modal
  const [rescheduleItem, setRescheduleItem] = useState<FollowUp | null>(null)
  const [newDate, setNewDate] = useState('')
  const [rescheduleRemarks, setRescheduleRemarks] = useState('')

  // Complete Modal
  const [completeItem, setCompleteItem] = useState<FollowUp | null>(null)
  const [completeRemarks, setCompleteRemarks] = useState('')

  // Fetch Follow-ups
  const { data: followUpsData, isLoading } = useQuery<PaginatedResponse<FollowUp>>({
    queryKey: ['mobileAdminFollowUps', activeTab, page, empFilter],
    queryFn: () =>
      apiClient.get<PaginatedResponse<FollowUp>>('/followups', {
        page,
        page_size: 15,
        filter_type: activeTab === 'all' ? undefined : activeTab,
        ...(empFilter ? { employee_id: empFilter } : {}),
      }),
  })

  // Fetch Employees for Filter
  const { data: employeesData } = useQuery<PaginatedResponse<Employee>>({
    queryKey: ['activeEmployeesForMobileFollowUpsFilter'],
    queryFn: () => apiClient.get<PaginatedResponse<Employee>>('/employees?page_size=50'),
  })

  // Complete Mutation
  const completeMutation = useMutation({
    mutationFn: ({ id, remarks }: { id: string; remarks?: string }) =>
      apiClient.patch(`/followups/${id}/complete`, { remarks }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mobileAdminFollowUps'] })
      queryClient.invalidateQueries({ queryKey: ['adminDashboardStats'] })
      setCompleteItem(null)
      setCompleteRemarks('')
    },
  })

  // Reschedule Mutation
  const rescheduleMutation = useMutation({
    mutationFn: ({ id, new_date, remarks }: { id: string; new_date: string; remarks?: string }) =>
      apiClient.patch(`/followups/${id}/reschedule`, { new_date, remarks }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mobileAdminFollowUps'] })
      queryClient.invalidateQueries({ queryKey: ['adminDashboardStats'] })
      setRescheduleItem(null)
      setNewDate('')
      setRescheduleRemarks('')
    },
  })

  const tabs: { key: TabType; label: string }[] = [
    { key: 'today', label: 'Due Today' },
    { key: 'overdue', label: 'Overdue' },
    { key: 'upcoming', label: 'Upcoming' },
    { key: 'completed', label: 'Done' },
    { key: 'all', label: 'All' },
  ]

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900">Follow-up Queue</h1>
        <p className="text-xs text-slate-500">Track and reschedule customer callback commitments.</p>
      </div>

      {/* Filter and Tabs */}
      <div className="space-y-2">
        <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-none">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key
            return (
              <button
                key={tab.key}
                onClick={() => {
                  setActiveTab(tab.key)
                  setPage(1)
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200'
                }`}
              >
                {tab.label}
              </button>
            )
          })}
        </div>

        <div>
          <select
            value={empFilter}
            onChange={(e) => {
              setEmpFilter(e.target.value)
              setPage(1)
            }}
            className="w-full text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white text-slate-800"
          >
            <option value="">All Call Centre Agents</option>
            {employeesData?.items.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.user.full_name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Follow-up Cards */}
      {isLoading ? (
        <LoadingSkeleton count={5} />
      ) : !followUpsData || followUpsData.items.length === 0 ? (
        <EmptyState
          title={`No ${activeTab} follow-ups`}
          description="Zero callback records in this view."
        />
      ) : (
        <div className="space-y-3">
          {followUpsData.items.map((item) => {
            const isOverdue =
              item.status === 'overdue' ||
              (item.status === 'pending' &&
                new Date(item.scheduled_date) < new Date(new Date().setHours(0, 0, 0, 0)))

            return (
              <div
                key={item.id}
                className={`p-4 rounded-xl border shadow-xs space-y-2.5 bg-white ${
                  isOverdue && item.status !== 'completed'
                    ? 'border-rose-300 bg-rose-50/20'
                    : 'border-slate-200'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">
                      {item.customer_name || 'Customer Lead'}
                    </h3>
                    <div className="text-xs text-slate-500 font-medium mt-0.5">
                      Assigned Agent: <strong className="text-slate-800">{item.employee_name || 'Agent'}</strong>
                    </div>
                  </div>
                  <Badge status={item.status} />
                </div>

                <div className="flex items-center justify-between text-xs text-slate-600 font-mono">
                  <span className="flex items-center gap-1 font-semibold text-slate-800">
                    <Calendar className="h-3 w-3 text-slate-400" />
                    Due: {new Date(item.scheduled_date).toLocaleDateString()}
                  </span>
                  {isOverdue && item.status !== 'completed' && (
                    <span className="text-[10px] text-rose-600 font-bold uppercase tracking-wider">
                      Overdue
                    </span>
                  )}
                </div>

                {item.remarks && (
                  <p className="text-xs text-slate-700 bg-slate-50 p-2 rounded-lg border border-slate-100">
                    {item.remarks}
                  </p>
                )}

                {item.status !== 'completed' && (
                  <div className="flex gap-2 pt-1 border-t border-slate-100">
                    <button
                      onClick={() => {
                        setRescheduleItem(item)
                        setNewDate(item.scheduled_date.slice(0, 10))
                      }}
                      className="flex-1 py-1.5 bg-slate-100 active:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg flex items-center justify-center gap-1"
                    >
                      <RotateCw className="h-3 w-3" />
                      Reschedule
                    </button>
                    <button
                      onClick={() => setCompleteItem(item)}
                      className="flex-1 py-1.5 bg-emerald-600 active:bg-emerald-700 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1"
                    >
                      <Check className="h-3.5 w-3.5" />
                      Done
                    </button>
                  </div>
                )}
              </div>
            )
          })}

          {followUpsData.pages > 1 && (
            <div className="pt-2">
              <Pagination
                currentPage={page}
                totalPages={followUpsData.pages}
                onPageChange={setPage}
              />
            </div>
          )}
        </div>
      )}

      {/* Complete Modal */}
      <Modal
        isOpen={!!completeItem}
        onClose={() => setCompleteItem(null)}
        title="Complete Follow-up"
        size="sm"
      >
        <div className="space-y-3">
          <p className="text-xs text-slate-600">
            Confirm completion for <strong>{completeItem?.customer_name}</strong>.
          </p>
          <textarea
            rows={2}
            value={completeRemarks}
            onChange={(e) => setCompleteRemarks(e.target.value)}
            placeholder="Closing remarks / notes..."
            className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-slate-50"
          />
          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => setCompleteItem(null)}
              className="px-3 py-1.5 border text-xs rounded-lg"
            >
              Cancel
            </button>
            <button
              disabled={completeMutation.isPending}
              onClick={() => {
                if (completeItem) {
                  completeMutation.mutate({
                    id: completeItem.id,
                    remarks: completeRemarks.trim() || undefined,
                  })
                }
              }}
              className="px-4 py-1.5 bg-emerald-600 text-white text-xs font-semibold rounded-lg"
            >
              Confirm
            </button>
          </div>
        </div>
      </Modal>

      {/* Reschedule Modal */}
      <Modal
        isOpen={!!rescheduleItem}
        onClose={() => setRescheduleItem(null)}
        title="Reschedule Callback"
        size="sm"
      >
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">New Date</label>
            <input
              type="date"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-slate-50"
            />
          </div>
          <textarea
            rows={2}
            value={rescheduleRemarks}
            onChange={(e) => setRescheduleRemarks(e.target.value)}
            placeholder="Reason for reschedule..."
            className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-slate-50"
          />
          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => setRescheduleItem(null)}
              className="px-3 py-1.5 border text-xs rounded-lg"
            >
              Cancel
            </button>
            <button
              disabled={rescheduleMutation.isPending || !newDate}
              onClick={() => {
                if (rescheduleItem && newDate) {
                  rescheduleMutation.mutate({
                    id: rescheduleItem.id,
                    new_date: newDate,
                    remarks: rescheduleRemarks.trim() || undefined,
                  })
                }
              }}
              className="px-4 py-1.5 bg-slate-900 text-white text-xs font-semibold rounded-lg"
            >
              Save Date
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
