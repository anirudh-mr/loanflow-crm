import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  PhoneCall,
  Target,
  Users,
  TrendingUp,
  Clock,
  AlertCircle,
  FileCheck2,
  FileSpreadsheet,
  Plus,
  ArrowRight,
  Flame,
  CheckCircle2,
} from 'lucide-react'
import { apiClient } from '@/services/api'
import { StaffDashboardStats, CallProgress, Lead, PaginatedResponse } from '@/types'
import { Modal } from '@/components/common/Modal'
import { CALL_OUTCOME_OPTIONS } from '@/utils/constants'

export const StaffDashboard: React.FC = () => {
  const queryClient = useQueryClient()
  const [isLogCallOpen, setIsLogCallOpen] = useState(false)
  const [selectedLeadId, setSelectedLeadId] = useState('')
  const [outcome, setOutcome] = useState('interested')
  const [duration, setDuration] = useState('120')
  const [remarks, setRemarks] = useState('')
  const [followUpDate, setFollowUpDate] = useState('')

  // 1. Fetch Staff Telemetry
  const { data: stats, isLoading } = useQuery<StaffDashboardStats>({
    queryKey: ['staffDashboardStats'],
    queryFn: () => apiClient.get<StaffDashboardStats>('/analytics/staff-dashboard'),
  })

  // 2. Fetch Real-time Progress (100 Calls Target)
  const { data: progress } = useQuery<CallProgress>({
    queryKey: ['staffCallProgress'],
    queryFn: () => apiClient.get<CallProgress>('/calls/progress'),
  })

  // 3. Fetch My Assigned Leads for Quick Call Logger
  const { data: myLeads } = useQuery<PaginatedResponse<Lead>>({
    queryKey: ['myLeadsDropdown'],
    queryFn: () => apiClient.get<PaginatedResponse<Lead>>('/leads?page=1&page_size=100'),
  })

  // Quick Call Logging Mutation
  const logCallMutation = useMutation({
    mutationFn: (data: any) => apiClient.post('/calls', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staffCallProgress'] })
      queryClient.invalidateQueries({ queryKey: ['staffDashboardStats'] })
      queryClient.invalidateQueries({ queryKey: ['myLeads'] })
      setIsLogCallOpen(false)
      setSelectedLeadId('')
      setRemarks('')
      setFollowUpDate('')
    },
  })

  const handleLogCallSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedLeadId) return
    logCallMutation.mutate({
      lead_id: selectedLeadId,
      outcome,
      duration_seconds: Number(duration),
      remarks,
      next_follow_up_date: followUpDate ? new Date(followUpDate).toISOString() : null,
    })
  }

  const completed = progress?.completed || stats?.calls_completed || 0
  const target = progress?.target || stats?.daily_call_target || 100
  const remaining = Math.max(0, target - completed)
  const pct = Math.min(Math.round((completed / target) * 100), 100)

  return (
    <div className="space-y-6 animate-fade-in">
      {/* 100-Call Daily Target Hero Card */}
      <div className="bg-gradient-to-r from-emerald-900 via-slate-900 to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl border border-emerald-950 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-emerald-500/10 to-transparent pointer-events-none" />

        <div className="space-y-3 z-10 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-500/30">
            <Flame className="h-3.5 w-3.5 text-emerald-400" />
            <span>Daily 100-Call Goal Milestone</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Today's Outreach Pace
          </h2>

          <p className="text-sm text-slate-300">
            Every call brings a customer closer to their loan sanction. Keep momentum to meet the company standard of 100 customer calls.
          </p>

          <div className="pt-2">
            <button
              onClick={() => {
                if (myLeads?.items?.[0]) setSelectedLeadId(myLeads.items[0].id)
                setIsLogCallOpen(true)
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/25 transition-all"
            >
              <PhoneCall className="h-4 w-4" />
              <span>Log Completed Call</span>
            </button>
          </div>
        </div>

        {/* Circular Progress & Numerical Stats */}
        <div className="z-10 flex items-center gap-6 bg-slate-800/80 p-5 rounded-2xl border border-slate-700/80">
          {/* Progress Ring */}
          <div className="relative h-28 w-28 flex items-center justify-center shrink-0">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="40"
                className="stroke-slate-700"
                strokeWidth="10"
                fill="transparent"
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                className="stroke-emerald-400 transition-all duration-1000 ease-out"
                strokeWidth="10"
                strokeDasharray="251.2"
                strokeDashoffset={251.2 - (251.2 * pct) / 100}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-2xl font-black text-white">{pct}%</span>
              <span className="text-[9px] uppercase tracking-wider text-slate-400">Target</span>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            <div>
              <span className="text-slate-400 block text-[11px]">Calls Completed</span>
              <strong className="text-2xl font-extrabold text-white">
                {completed}{' '}
                <span className="text-xs font-normal text-slate-400">/ {target}</span>
              </strong>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Remaining Calls</span>
              <strong className="text-base font-bold text-amber-400">{remaining} to go</strong>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">Assigned Leads</span>
            <Users className="h-4 w-4 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{stats?.assigned_leads || 0}</p>
          <span className="text-[10px] text-blue-600 font-medium">My active portfolio</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">Interested</span>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{stats?.interested_customers || 0}</p>
          <span className="text-[10px] text-purple-600 font-medium">Warm prospects</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">Follow-ups Today</span>
            <Clock className="h-4 w-4 text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{stats?.followups_due_today || 0}</p>
          <span className="text-[10px] text-amber-600 font-medium">Callback schedule</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">Overdue</span>
            <AlertCircle className="h-4 w-4 text-rose-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{stats?.overdue_followups || 0}</p>
          <span className="text-[10px] text-rose-600 font-medium">Needs immediate action</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">Pending Docs</span>
            <FileCheck2 className="h-4 w-4 text-orange-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{stats?.pending_documents || 0}</p>
          <span className="text-[10px] text-orange-600 font-medium">Collect from client</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">Active Loans</span>
            <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{stats?.active_applications || 0}</p>
          <span className="text-[10px] text-emerald-600 font-medium">Under bank review</span>
        </div>
      </div>

      {/* Quick Access Modules Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          to="/staff/leads"
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-blue-300 hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Users className="h-5 w-5" />
            </div>
            <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
          </div>
          <h3 className="font-bold text-slate-900 text-sm">My Assigned Leads</h3>
          <p className="text-xs text-slate-500 mt-1">
            Call customers, update loan schemes, and advance leads through the conversion funnel.
          </p>
        </Link>

        <Link
          to="/staff/followups"
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-amber-300 hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="h-10 w-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Clock className="h-5 w-5" />
            </div>
            <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-amber-600 transition-colors" />
          </div>
          <h3 className="font-bold text-slate-900 text-sm">Scheduled Follow-ups</h3>
          <p className="text-xs text-slate-500 mt-1">
            View upcoming callback dates, complete overdue reminders, and record client remarks.
          </p>
        </Link>

        <Link
          to="/staff/loans"
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-emerald-300 hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <FileSpreadsheet className="h-5 w-5" />
            </div>
            <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-emerald-600 transition-colors" />
          </div>
          <h3 className="font-bold text-slate-900 text-sm">Loan Tracking & Submissions</h3>
          <p className="text-xs text-slate-500 mt-1">
            Submit new loan files to partner banks, monitor underwriting progress, and track disbursals.
          </p>
        </Link>
      </div>

      {/* Quick Call Log Modal */}
      <Modal
        isOpen={isLogCallOpen}
        onClose={() => setIsLogCallOpen(false)}
        title="Record Customer Interaction"
        subtitle="Saves call log to PostgreSQL, updates lead status, and increments daily target"
        maxWidth="md"
      >
        <form onSubmit={handleLogCallSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Customer Lead *</label>
            <select
              required
              value={selectedLeadId}
              onChange={(e) => setSelectedLeadId(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 bg-white"
            >
              <option value="">Select customer lead to call</option>
              {myLeads?.items?.map((lead) => (
                <option key={lead.id} value={lead.id}>
                  {lead.customer_name} ({lead.phone}) – {lead.loan_type}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Call Outcome *</label>
              <select
                value={outcome}
                onChange={(e) => setOutcome(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 bg-white"
              >
                {CALL_OUTCOME_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Call Duration (Sec) *</label>
              <input
                type="number"
                required
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Next Follow-up Date (Optional)</label>
            <input
              type="datetime-local"
              value={followUpDate}
              onChange={(e) => setFollowUpDate(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Call Notes / Customer Remarks</label>
            <textarea
              rows={3}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="e.g. Customer interested in 10.5% personal loan, salary slips requested via WhatsApp."
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsLogCallOpen(false)}
              className="px-3 py-1.5 border border-slate-200 rounded-lg text-slate-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={logCallMutation.isPending || !selectedLeadId}
              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg"
            >
              {logCallMutation.isPending ? 'Saving...' : 'Commit Call Log'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
