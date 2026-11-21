import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { BarChart3, Download, Calendar, Filter } from 'lucide-react'
import { apiClient } from '@/services/api'
import { SkeletonTable } from '@/components/common/LoadingSkeleton'

export const ReportsPage: React.FC = () => {
  const [reportType, setReportType] = useState<
    'call_performance' | 'employee_performance' | 'bank_wise' | 'lead_source'
  >('call_performance')
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  // 1. Fetch Selected Report
  const { data: reportData, isLoading } = useQuery<any[]>({
    queryKey: ['adminReport', reportType, period, dateFrom, dateTo],
    queryFn: () => {
      let endpoint = `/reports/${reportType.replace('_', '-')}`
      const params: Record<string, any> = {}
      if (reportType === 'call_performance') params.period = period
      if (dateFrom) params.date_from = dateFrom
      if (dateTo) params.date_to = dateTo
      return apiClient.get<any[]>(endpoint, params)
    },
  })

  const handleExportCSV = () => {
    let url = `/api/v1/reports/export?report_type=${reportType}`
    if (dateFrom) url += `&date_from=${dateFrom}`
    if (dateTo) url += `&date_to=${dateTo}`
    window.open(url, '_blank')
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-blue-600" />
            Executive Reports & Telemetry
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit-grade performance reporting with period aggregation and direct CSV data exports.
          </p>
        </div>
        <button
          onClick={handleExportCSV}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm shadow-blue-500/20 transition-colors"
        >
          <Download className="h-4 w-4" />
          <span>Export Current Report to CSV</span>
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center gap-1.5 text-xs font-semibold">
        {[
          { id: 'call_performance', label: 'Call Performance' },
          { id: 'employee_performance', label: 'Employee Performance' },
          { id: 'bank_wise', label: 'Bank-wise Applications' },
          { id: 'lead_source', label: 'Lead Source Conversion' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setReportType(tab.id as any)}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              reportType === tab.id
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Date & Period Controls */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center gap-4 text-xs">
        {reportType === 'call_performance' && (
          <div className="flex items-center gap-2">
            <span className="font-medium text-slate-500">Group By:</span>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value as any)}
              className="px-3 py-1.5 border border-slate-200 rounded-lg bg-white text-slate-700"
            >
              <option value="daily">Daily Aggregation</option>
              <option value="weekly">Weekly Aggregation</option>
              <option value="monthly">Monthly Aggregation</option>
            </select>
          </div>
        )}

        <div className="flex items-center gap-2">
          <span className="font-medium text-slate-500">From:</span>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="px-2.5 py-1.5 border border-slate-200 rounded-lg text-slate-700"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="font-medium text-slate-500">To:</span>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="px-2.5 py-1.5 border border-slate-200 rounded-lg text-slate-700"
          />
        </div>

        {(dateFrom || dateTo) && (
          <button
            onClick={() => {
              setDateFrom('')
              setDateTo('')
            }}
            className="text-xs text-rose-600 font-medium hover:text-rose-700"
          >
            Reset Dates
          </button>
        )}
      </div>

      {/* Reports Table Render */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <SkeletonTable rows={8} cols={6} />
        ) : reportData && reportData.length > 0 ? (
          <div className="overflow-x-auto">
            {reportType === 'call_performance' && (
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 uppercase border-b border-slate-200 font-semibold">
                  <tr>
                    <th className="py-3 px-4">Period</th>
                    <th className="py-3 px-4">Total Calls</th>
                    <th className="py-3 px-4">Interested</th>
                    <th className="py-3 px-4">Follow-up Req.</th>
                    <th className="py-3 px-4">Busy / No Answer</th>
                    <th className="py-3 px-4">Avg Duration</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {reportData.map((row: any, i: number) => (
                    <tr key={i} className="hover:bg-slate-50/70">
                      <td className="py-3.5 px-4 font-bold text-slate-900">{row.period}</td>
                      <td className="py-3.5 px-4 font-semibold text-slate-800">{row.total_calls}</td>
                      <td className="py-3.5 px-4 text-emerald-700 font-medium">{row.interested}</td>
                      <td className="py-3.5 px-4 text-amber-700">{row.follow_up_required}</td>
                      <td className="py-3.5 px-4 text-slate-500">{row.busy + row.no_answer}</td>
                      <td className="py-3.5 px-4 font-mono text-slate-600">{row.avg_duration_sec}s</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {reportType === 'employee_performance' && (
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 uppercase border-b border-slate-200 font-semibold">
                  <tr>
                    <th className="py-3 px-4">Employee</th>
                    <th className="py-3 px-4">Department</th>
                    <th className="py-3 px-4">Assigned Leads</th>
                    <th className="py-3 px-4">Calls Logged</th>
                    <th className="py-3 px-4">Interested</th>
                    <th className="py-3 px-4">Approved Loans</th>
                    <th className="py-3 px-4">Disbursed</th>
                    <th className="py-3 px-4 text-right">Conversion Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {reportData.map((row: any, i: number) => (
                    <tr key={i} className="hover:bg-slate-50/70">
                      <td className="py-3.5 px-4 font-bold text-slate-900">{row.employee_name}</td>
                      <td className="py-3.5 px-4 text-slate-600">{row.department}</td>
                      <td className="py-3.5 px-4 text-slate-700 font-medium">{row.assigned_leads}</td>
                      <td className="py-3.5 px-4 font-semibold text-slate-900">{row.total_calls}</td>
                      <td className="py-3.5 px-4 text-purple-700 font-medium">{row.interested_leads}</td>
                      <td className="py-3.5 px-4 text-emerald-700 font-medium">{row.loans_approved}</td>
                      <td className="py-3.5 px-4 text-emerald-800 font-bold">{row.loans_disbursed}</td>
                      <td className="py-3.5 px-4 text-right">
                        <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                          {row.conversion_rate_pct}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {reportType === 'bank_wise' && (
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 uppercase border-b border-slate-200 font-semibold">
                  <tr>
                    <th className="py-3 px-4">Bank Name</th>
                    <th className="py-3 px-4">Applications</th>
                    <th className="py-3 px-4">Under Review</th>
                    <th className="py-3 px-4">Approved</th>
                    <th className="py-3 px-4">Disbursed</th>
                    <th className="py-3 px-4">Rejected</th>
                    <th className="py-3 px-4">Sanctioned Amount</th>
                    <th className="py-3 px-4 text-right">Approval Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {reportData.map((row: any, i: number) => (
                    <tr key={i} className="hover:bg-slate-50/70">
                      <td className="py-3.5 px-4 font-bold text-slate-900">{row.bank_name}</td>
                      <td className="py-3.5 px-4 font-semibold text-slate-800">{row.total_applications}</td>
                      <td className="py-3.5 px-4 text-amber-700">{row.under_review}</td>
                      <td className="py-3.5 px-4 text-emerald-700">{row.approved}</td>
                      <td className="py-3.5 px-4 text-green-800 font-bold">{row.disbursed}</td>
                      <td className="py-3.5 px-4 text-rose-700">{row.rejected}</td>
                      <td className="py-3.5 px-4 font-semibold text-slate-900">
                        ₹{row.total_approved_amount.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                          {row.approval_rate_pct}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {reportType === 'lead_source' && (
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 uppercase border-b border-slate-200 font-semibold">
                  <tr>
                    <th className="py-3 px-4">Lead Acquisition Channel</th>
                    <th className="py-3 px-4">Total Leads</th>
                    <th className="py-3 px-4">Contacted</th>
                    <th className="py-3 px-4">Interested Prospects</th>
                    <th className="py-3 px-4">Converted</th>
                    <th className="py-3 px-4 text-right">Channel Conversion Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {reportData.map((row: any, i: number) => (
                    <tr key={i} className="hover:bg-slate-50/70">
                      <td className="py-3.5 px-4 font-bold text-slate-900">{row.source}</td>
                      <td className="py-3.5 px-4 font-semibold text-slate-800">{row.total_leads}</td>
                      <td className="py-3.5 px-4 text-blue-700">{row.contacted}</td>
                      <td className="py-3.5 px-4 text-purple-700 font-medium">{row.interested}</td>
                      <td className="py-3.5 px-4 text-emerald-700 font-bold">{row.converted}</td>
                      <td className="py-3.5 px-4 text-right">
                        <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                          {row.conversion_rate_pct}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        ) : (
          <div className="py-12 text-center text-slate-400 text-xs">No records for selected period</div>
        )}
      </div>
    </div>
  )
}
