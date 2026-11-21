import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { PhoneCall, Search, Filter, Calendar, Clock, User, UserCheck } from 'lucide-react'
import { apiClient } from '@/services/api'
import { CallLog, PaginatedResponse, Employee } from '@/types'
import { StatusBadge } from '@/components/common/Badge'
import { Pagination } from '@/components/common/Pagination'
import { SkeletonTable } from '@/components/common/LoadingSkeleton'
import { EmptyState } from '@/components/common/EmptyState'
import { CALL_OUTCOME_OPTIONS } from '@/utils/constants'

export const CallManagement: React.FC = () => {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [outcomeFilter, setOutcomeFilter] = useState('')
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('')

  // 1. Fetch Employees for filter dropdown
  const { data: employeesData } = useQuery<PaginatedResponse<Employee>>({
    queryKey: ['adminEmployeesForCallFilter'],
    queryFn: () => apiClient.get<PaginatedResponse<Employee>>('/employees?page=1&page_size=50'),
  })

  // 2. Fetch Call Logs
  const { data: callsData, isLoading } = useQuery<PaginatedResponse<CallLog>>({
    queryKey: ['adminCallLogs', page, pageSize, outcomeFilter, selectedEmployeeId],
    queryFn: () => {
      const params: Record<string, any> = { page, page_size: pageSize }
      if (outcomeFilter) params.outcome = outcomeFilter
      if (selectedEmployeeId) params.employee_id = selectedEmployeeId
      return apiClient.get<PaginatedResponse<CallLog>>('/calls', params)
    },
  })

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}m ${secs}s`
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <PhoneCall className="h-6 w-6 text-emerald-600" />
            Call Activity Records
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit logs of all outbound customer phone interactions, durations, outcomes, and agent remarks.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">Outcome:</span>
          <select
            value={outcomeFilter}
            onChange={(e) => {
              setOutcomeFilter(e.target.value)
              setPage(1)
            }}
            className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-white text-slate-700 focus:ring-1 focus:ring-blue-600"
          >
            <option value="">All Call Outcomes</option>
            {CALL_OUTCOME_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">Sales Agent:</span>
          <select
            value={selectedEmployeeId}
            onChange={(e) => {
              setSelectedEmployeeId(e.target.value)
              setPage(1)
            }}
            className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-white text-slate-700 focus:ring-1 focus:ring-blue-600"
          >
            <option value="">All Employees</option>
            {employeesData?.items.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.user.full_name} ({emp.employee_id})
              </option>
            ))}
          </select>
        </div>

        {(outcomeFilter || selectedEmployeeId) && (
          <button
            onClick={() => {
              setOutcomeFilter('')
              setSelectedEmployeeId('')
              setPage(1)
            }}
            className="text-xs text-rose-600 font-medium hover:text-rose-700 ml-auto"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Call Records Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <SkeletonTable rows={8} cols={6} />
        ) : callsData && callsData.items.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase border-b border-slate-200 font-semibold">
                <tr>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Sales Agent</th>
                  <th className="py-3 px-4">Outcome</th>
                  <th className="py-3 px-4">Duration</th>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Remarks</th>
                  <th className="py-3 px-4">Next Follow-up</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {callsData.items.map((call) => (
                  <tr key={call.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      {call.customer_name || 'Customer'}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 font-medium text-slate-700">
                        <UserCheck className="h-3.5 w-3.5 text-blue-600" />
                        {call.employee_name}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={call.outcome} />
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-600">
                      {formatDuration(call.duration_seconds)}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                      {new Date(call.call_datetime).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate" title={call.remarks || ''}>
                      {call.remarks || '—'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {call.next_follow_up_date ? (
                        <span className="text-amber-700 font-medium">
                          {new Date(call.next_follow_up_date).toLocaleDateString()}
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            title="No call records found"
            description="Call interactions recorded by staff members will appear here in real-time."
          />
        )}

        <Pagination
          currentPage={page}
          totalPages={callsData?.pages || 1}
          totalItems={callsData?.total || 0}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={(newSize) => {
            setPageSize(newSize)
            setPage(1)
          }}
        />
      </div>
    </div>
  )
}
