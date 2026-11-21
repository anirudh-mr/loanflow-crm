import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  BarChart3,
  Download,
  Calendar,
  Building2,
  Users,
  PhoneCall,
  Sparkles,
  TrendingUp,
  FileSpreadsheet,
} from 'lucide-react'
import { apiClient } from '@/services/api'
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton'

type ReportType = 'call_performance' | 'employee_performance' | 'bank_wise' | 'lead_source'

export const MobileReports: React.FC = () => {
  const [reportType, setReportType] = useState<ReportType>('employee_performance')
  const [isExporting, setIsExporting] = useState(false)

  // Fetch Current Report Data
  const { data: reportData, isLoading } = useQuery<any[]>({
    queryKey: ['mobileReportData', reportType],
    queryFn: () => {
      const endpoint =
        reportType === 'call_performance'
          ? '/reports/call-performance'
          : reportType === 'employee_performance'
          ? '/reports/employee-performance'
          : reportType === 'bank_wise'
          ? '/reports/bank-wise'
          : '/reports/lead-source'
      return apiClient.get<any[]>(endpoint)
    },
  })

  const handleExportCSV = async () => {
    setIsExporting(true)
    try {
      const token = localStorage.getItem('access_token')
      const url = `/api/v1/reports/export?report_type=${reportType}`
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error('Export failed')
      const blob = await res.blob()
      const link = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = link
      a.download = `${reportType}_report.csv`
      document.body.appendChild(a)
      a.click()
      a.remove()
    } catch (err) {
      console.error('Export error:', err)
    } finally {
      setIsExporting(false)
    }
  }

  const reportButtons: { type: ReportType; label: string; icon: React.ReactNode }[] = [
    { type: 'employee_performance', label: 'Agents', icon: <Users className="h-4 w-4" /> },
    { type: 'call_performance', label: 'Calls', icon: <PhoneCall className="h-4 w-4" /> },
    { type: 'bank_wise', label: 'Banks', icon: <Building2 className="h-4 w-4" /> },
    { type: 'lead_source', label: 'Sources', icon: <TrendingUp className="h-4 w-4" /> },
  ]

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Executive Reports</h1>
          <p className="text-xs text-slate-500">Business intelligence and operational exports.</p>
        </div>
        <button
          onClick={handleExportCSV}
          disabled={isExporting}
          className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-900 active:bg-slate-800 text-white text-xs font-semibold rounded-xl shadow-xs disabled:opacity-50"
        >
          <Download className="h-3.5 w-3.5" />
          {isExporting ? 'Exporting...' : 'Export CSV'}
        </button>
      </div>

      {/* Report Switcher Tabs */}
      <div className="grid grid-cols-4 gap-1.5 bg-slate-100 p-1.5 rounded-xl">
        {reportButtons.map((btn) => {
          const isActive = reportType === btn.type
          return (
            <button
              key={btn.type}
              onClick={() => setReportType(btn.type)}
              className={`flex flex-col items-center gap-1 py-2 px-1 rounded-lg text-[11px] font-semibold transition ${
                isActive
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {btn.icon}
              <span>{btn.label}</span>
            </button>
          )
        })}
      </div>

      {/* Report Content */}
      <div className="space-y-3">
        {isLoading ? (
          <LoadingSkeleton count={4} />
        ) : !reportData || reportData.length === 0 ? (
          <div className="bg-white p-6 rounded-xl border border-slate-200 text-center text-xs text-slate-500">
            No telemetry records found for this report period.
          </div>
        ) : reportType === 'employee_performance' ? (
          reportData.map((item, idx) => (
            <div
              key={idx}
              className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-2"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">{item.name}</h3>
                  <div className="text-[11px] text-slate-500 font-mono">
                    ID: {item.employee_id} • {item.department || 'Sales'}
                  </div>
                </div>
                <span className="text-xs font-bold text-emerald-600 font-mono bg-emerald-50 px-2 py-0.5 rounded">
                  {item.target_pct || 0}% target
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-xs bg-slate-50 p-2 rounded-lg text-center">
                <div>
                  <span className="text-slate-400 text-[10px] uppercase block">Calls Today</span>
                  <span className="font-bold text-slate-900 font-mono">{item.calls_today || 0}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase block">Assigned</span>
                  <span className="font-bold text-slate-700 font-mono">{item.assigned_leads || 0}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase block">Conversions</span>
                  <span className="font-bold text-blue-600 font-mono">{item.conversions || 0}</span>
                </div>
              </div>
            </div>
          ))
        ) : reportType === 'bank_wise' ? (
          reportData.map((item, idx) => (
            <div
              key={idx}
              className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-2"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 text-sm">{item.bank_name}</h3>
                <span className="text-xs font-mono font-bold text-slate-500">{item.bank_code}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs bg-slate-50 p-2 rounded-lg text-center">
                <div>
                  <span className="text-slate-400 text-[10px] uppercase block">Applications</span>
                  <span className="font-bold text-slate-900 font-mono">{item.total_applications || 0}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase block">Approved</span>
                  <span className="font-bold text-emerald-600 font-mono">{item.approved_count || 0}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase block">Disbursed</span>
                  <span className="font-bold text-indigo-600 font-mono">{item.disbursed_count || 0}</span>
                </div>
              </div>
              <div className="text-xs text-slate-600 flex justify-between pt-1">
                <span>Sanctioned Volume:</span>
                <span className="font-bold text-slate-900 font-mono">
                  ₹{(item.total_disbursed_amount || 0).toLocaleString()}
                </span>
              </div>
            </div>
          ))
        ) : reportType === 'lead_source' ? (
          reportData.map((item, idx) => (
            <div
              key={idx}
              className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-2"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 text-sm">{item.lead_source}</h3>
                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded font-mono">
                  {item.conversion_rate || 0}% CVR
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-2 rounded-lg text-center">
                <div>
                  <span className="text-slate-400 text-[10px] uppercase block">Total Leads</span>
                  <span className="font-bold text-slate-900 font-mono">{item.total_leads || 0}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase block">Conversions</span>
                  <span className="font-bold text-emerald-600 font-mono">{item.converted_leads || 0}</span>
                </div>
              </div>
            </div>
          ))
        ) : (
          reportData.map((item, idx) => (
            <div
              key={idx}
              className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1.5 text-xs"
            >
              <div className="flex justify-between font-bold text-slate-900">
                <span>{item.date || item.employee_name || 'Activity'}</span>
                <span className="font-mono text-blue-600">{item.total_calls || 0} calls</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Interested Leads:</span>
                <span className="font-semibold text-emerald-600">{item.interested_count || 0}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Avg Duration:</span>
                <span className="font-mono">{item.avg_duration_seconds ? `${Math.round(item.avg_duration_seconds)}s` : '—'}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
