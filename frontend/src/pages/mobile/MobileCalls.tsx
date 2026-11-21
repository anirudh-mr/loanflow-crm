import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  PhoneCall,
  Search,
  Filter,
  Calendar,
  Clock,
  User,
  Phone,
  CalendarClock,
  Sparkles,
} from 'lucide-react'
import { apiClient } from '@/services/api'
import { CallLog, PaginatedResponse, Employee } from '@/types'
import { Badge } from '@/components/common/Badge'
import { Pagination } from '@/components/common/Pagination'
import { EmptyState } from '@/components/common/EmptyState'
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton'
import { CALL_OUTCOME_OPTIONS } from '@/utils/constants'

export const MobileCalls: React.FC = () => {
  const [page, setPage] = useState(1)
  const [outcomeFilter, setOutcomeFilter] = useState('')
  const [empFilter, setEmpFilter] = useState('')

  // Fetch Call Logs (Admin view: can see all)
  const { data: callsData, isLoading } = useQuery<PaginatedResponse<CallLog>>({
    queryKey: ['mobileAdminCalls', page, outcomeFilter, empFilter],
    queryFn: () =>
      apiClient.get<PaginatedResponse<CallLog>>('/calls', {
        page,
        page_size: 15,
        ...(outcomeFilter ? { outcome: outcomeFilter } : {}),
        ...(empFilter ? { employee_id: empFilter } : {}),
      }),
  })

  // Fetch Employees for Filter
  const { data: employeesData } = useQuery<PaginatedResponse<Employee>>({
    queryKey: ['activeEmployeesForMobileCallsFilter'],
    queryFn: () => apiClient.get<PaginatedResponse<Employee>>('/employees?page_size=50'),
  })

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    if (mins === 0) return `${secs}s`
    return `${mins}m ${secs}s`
  }

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900">Call Audit Stream</h1>
        <p className="text-xs text-slate-500">
          Supervise agent-customer phone logs and daily outreach in real-time.
        </p>
      </div>

      {/* Filter Toolbar */}
      <div className="space-y-2 bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex gap-2">
          <select
            value={outcomeFilter}
            onChange={(e) => {
              setOutcomeFilter(e.target.value)
              setPage(1)
            }}
            className="w-1/2 text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 bg-slate-50 text-slate-800"
          >
            <option value="">All Outcomes</option>
            {CALL_OUTCOME_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>

          <select
            value={empFilter}
            onChange={(e) => {
              setEmpFilter(e.target.value)
              setPage(1)
            }}
            className="w-1/2 text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 bg-slate-50 text-slate-800"
          >
            <option value="">All Agents</option>
            {employeesData?.items.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.user.full_name}
              </option>
            ))}
          </select>
        </div>

        <div className="text-[11px] text-slate-500 flex justify-between pt-1">
          <span>{callsData?.total || 0} calls recorded</span>
          <span>Target: 100 calls/agent</span>
        </div>
      </div>

      {/* Call Cards List */}
      {isLoading ? (
        <LoadingSkeleton count={5} />
      ) : !callsData || callsData.items.length === 0 ? (
        <EmptyState
          title="No calls found"
          description="No call logs match the selected filter parameters."
        />
      ) : (
        <div className="space-y-3">
          {callsData.items.map((call) => (
            <div
              key={call.id}
              className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-2"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    {call.customer_name || 'Customer Lead'}
                  </h3>
                  <div className="text-xs text-slate-500 font-medium">
                    Agent: <strong className="text-slate-800">{call.employee_name || 'Agent'}</strong>
                  </div>
                </div>
                <Badge status={call.outcome} />
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100 font-mono">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3 text-slate-400" />
                  {new Date(call.call_datetime).toLocaleDateString()} at{' '}
                  {new Date(call.call_datetime).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
                <span className="flex items-center gap-1 font-semibold text-slate-700">
                  <Clock className="h-3 w-3 text-slate-400" />
                  {formatDuration(call.duration_seconds)}
                </span>
              </div>

              {call.remarks && (
                <p className="text-xs text-slate-700 bg-slate-50 p-2 rounded-lg border border-slate-100">
                  {call.remarks}
                </p>
              )}

              {call.next_follow_up_date && (
                <div className="inline-flex items-center gap-1.5 text-[11px] text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                  <CalendarClock className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                  <span>
                    Callback scheduled:{' '}
                    <strong>{new Date(call.next_follow_up_date).toLocaleDateString()}</strong>
                  </span>
                </div>
              )}
            </div>
          ))}

          {callsData.pages > 1 && (
            <div className="pt-2">
              <Pagination
                currentPage={page}
                totalPages={callsData.pages}
                onPageChange={setPage}
              />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
