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
  Sparkles,
  Zap,
  Shield,
  Layers,
} from 'lucide-react'
import { apiClient } from '@/services/api'
import { StaffDashboardStats, CallProgress, Lead, PaginatedResponse } from '@/types'
import { Modal } from '@/components/common/Modal'
import { Card3D } from '@/components/common/Card3D'
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
    <div className="space-y-6 text-slate-100">
      {/* ------------------------------------------------------------- */}
      {/* 100-Call Daily Target Shift Command Console */}
      {/* ------------------------------------------------------------- */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-950/80 via-slate-900/80 to-slate-900/90 backdrop-blur-2xl border border-emerald-500/30 p-6 sm:p-8 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        {/* Subtle decorative glow */}
        <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-radial from-emerald-500/15 via-teal-500/5 to-transparent pointer-events-none" />
        <div className="absolute -top-10 left-10 w-48 h-48 rounded-full bg-cyan-500/10 blur-[80px] pointer-events-none" />

        <div className="space-y-3 z-10 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-mono font-semibold shadow-sm">
            <Flame className="h-3.5 w-3.5 text-emerald-400 animate-pulse" />
            <span>DAILY 100-CALL SHIFT BENCHMARK</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-emerald-200 bg-clip-text text-transparent">
            Agent Outreach Cockpit
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Every call introduces loan schemes, gathers documents, and accelerates bank underwriting. Maintain your daily target of 100 calls.
          </p>

          <div className="pt-2">
            <button
              onClick={() => {
                if (myLeads?.items?.[0]) setSelectedLeadId(myLeads.items[0].id)
                setIsLogCallOpen(true)
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-slate-950 bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 hover:from-emerald-300 hover:to-cyan-300 shadow-lg shadow-emerald-500/25 transition-all hover:scale-[1.02]"
            >
              <PhoneCall className="h-4 w-4" />
              <span>Record Customer Call</span>
            </button>
          </div>
        </div>

        {/* Circular Progress & Numerical Shift Telemetry */}
        <div className="z-10 flex items-center gap-6 bg-slate-900/80 backdrop-blur-xl p-5 rounded-2xl border border-slate-700/80 shadow-xl">
          {/* Glowing Radial Progress Ring */}
          <div className="relative h-28 w-28 flex items-center justify-center shrink-0">
            <svg className="w-full h-full transform -rotate-90 filter drop-shadow-[0_0_10px_rgba(16,185,129,0.3)]" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="40"
                className="stroke-slate-800"
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
              <span className="text-2xl font-black text-white font-mono">{pct}%</span>
              <span className="text-[9px] uppercase tracking-wider text-emerald-400 font-bold">Quota</span>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            <div>
              <span className="text-slate-400 block text-[11px] font-mono">Calls Completed</span>
              <strong className="text-2xl font-extrabold text-white font-mono">
                {completed}{' '}
                <span className="text-xs font-normal text-slate-400">/ {target}</span>
              </strong>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px] font-mono">Remaining Calls</span>
              <strong className="text-base font-bold text-amber-400 font-mono">{remaining} to go</strong>
            </div>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 3D KPI Tilt Cards Grid */}
      {/* ------------------------------------------------------------- */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* Assigned Leads */}
        <Card3D glowColor="blue" className="p-4">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">My Portfolio</span>
            <div className="h-7 w-7 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-white via-blue-100 to-blue-400 bg-clip-text text-transparent">
            {stats?.assigned_leads || 0}
          </p>
          <span className="text-[10px] text-blue-400 font-mono block mt-2">Active leads</span>
        </Card3D>

        {/* Interested */}
        <Card3D glowColor="purple" className="p-4">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Interested</span>
            <div className="h-7 w-7 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-white via-purple-100 to-purple-400 bg-clip-text text-transparent">
            {stats?.interested_customers || 0}
          </p>
          <span className="text-[10px] text-purple-400 font-mono block mt-2">Warm prospects</span>
        </Card3D>

        {/* Follow-ups Today */}
        <Card3D glowColor="amber" className="p-4">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Follow-ups</span>
            <div className="h-7 w-7 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-white via-amber-100 to-amber-400 bg-clip-text text-transparent">
            {stats?.followups_due_today || 0}
          </p>
          <span className="text-[10px] text-amber-400 font-mono block mt-2">Scheduled today</span>
        </Card3D>

        {/* Overdue */}
        <Card3D glowColor="purple" className="p-4">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Overdue</span>
            <div className="h-7 w-7 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <AlertCircle className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-white via-rose-100 to-rose-400 bg-clip-text text-transparent">
            {stats?.overdue_followups || 0}
          </p>
          <span className="text-[10px] text-rose-400 font-mono block mt-2">Immediate action</span>
        </Card3D>

        {/* Pending Docs */}
        <Card3D glowColor="cyan" className="p-4">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Pending Docs</span>
            <div className="h-7 w-7 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <FileCheck2 className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-white via-cyan-100 to-cyan-400 bg-clip-text text-transparent">
            {stats?.pending_documents || 0}
          </p>
          <span className="text-[10px] text-cyan-400 font-mono block mt-2">KYC collection</span>
        </Card3D>

        {/* Active Applications */}
        <Card3D glowColor="emerald" className="p-4">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Active Loans</span>
            <div className="h-7 w-7 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <FileSpreadsheet className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-white via-emerald-100 to-emerald-400 bg-clip-text text-transparent">
            {stats?.active_applications || 0}
          </p>
          <span className="text-[10px] text-emerald-400 font-mono block mt-2">Under bank review</span>
        </Card3D>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 3D Glass Interactive Navigation Cards */}
      {/* ------------------------------------------------------------- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link to="/staff/leads" className="block group">
          <Card3D glowColor="cyan" className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="h-10 w-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center group-hover:scale-110 transition-transform shadow-md">
                <Users className="h-5 w-5" />
              </div>
              <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-cyan-400 transition-colors" />
            </div>
            <h3 className="font-bold text-white text-sm">Assigned Lead Worklist</h3>
            <p className="text-xs text-slate-400 mt-1">
              Call customers, discuss bank loan schemes, and advance qualified profiles through the pipeline.
            </p>
          </Card3D>
        </Link>

        <Link to="/staff/followups" className="block group">
          <Card3D glowColor="amber" className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="h-10 w-10 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform shadow-md">
                <Clock className="h-5 w-5" />
              </div>
              <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-amber-400 transition-colors" />
            </div>
            <h3 className="font-bold text-white text-sm">Scheduled Callbacks</h3>
            <p className="text-xs text-slate-400 mt-1">
              View upcoming callback calendars, clear overdue reminders, and record customer notes.
            </p>
          </Card3D>
        </Link>

        <Link to="/staff/loans" className="block group">
          <Card3D glowColor="emerald" className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform shadow-md">
                <FileSpreadsheet className="h-5 w-5" />
              </div>
              <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-emerald-400 transition-colors" />
            </div>
            <h3 className="font-bold text-white text-sm">Loan Application Tracking</h3>
            <p className="text-xs text-slate-400 mt-1">
              Route sanctioned loan files to partner banks, monitor underwriting, and track customer disbursals.
            </p>
          </Card3D>
        </Link>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* Quick Call Log Modal (Dark Cyber Glass) */}
      {/* ------------------------------------------------------------- */}
      <Modal
        isOpen={isLogCallOpen}
        onClose={() => setIsLogCallOpen(false)}
        title="Record Customer Interaction"
        subtitle="Saves call log to PostgreSQL, updates lead status, and increments daily 100-call quota"
        maxWidth="md"
      >
        <form onSubmit={handleLogCallSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-300 mb-1">Customer Lead *</label>
            <select
              required
              value={selectedLeadId}
              onChange={(e) => setSelectedLeadId(e.target.value)}
              className="w-full px-3 py-2 border border-slate-700 rounded-xl text-slate-100 bg-slate-900/90 focus:border-cyan-500 focus:outline-none"
            >
              <option value="">Select customer lead to call</option>
              {myLeads?.items?.map((lead) => (
                <option key={lead.id} value={lead.id} className="bg-slate-900 text-slate-100">
                  {lead.customer_name} ({lead.phone}) – {lead.loan_type}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Call Outcome *</label>
              <select
                value={outcome}
                onChange={(e) => setOutcome(e.target.value)}
                className="w-full px-3 py-2 border border-slate-700 rounded-xl text-slate-100 bg-slate-900/90 focus:border-cyan-500 focus:outline-none"
              >
                {CALL_OUTCOME_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value} className="bg-slate-900 text-slate-100">
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Duration (Seconds) *</label>
              <input
                type="number"
                required
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full px-3 py-2 border border-slate-700 rounded-xl text-slate-100 bg-slate-900/90 font-mono focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1">Next Follow-up Date (Optional)</label>
            <input
              type="datetime-local"
              value={followUpDate}
              onChange={(e) => setFollowUpDate(e.target.value)}
              className="w-full px-3 py-2 border border-slate-700 rounded-xl text-slate-100 bg-slate-900/90 focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1">Call Notes / Customer Remarks</label>
            <textarea
              rows={3}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="e.g. Customer interested in 10.5% personal loan, salary slips requested via WhatsApp."
              className="w-full px-3 py-2 border border-slate-700 rounded-xl text-slate-100 bg-slate-900/90 placeholder:text-slate-500 focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsLogCallOpen(false)}
              className="px-3 py-1.5 border border-slate-700 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={logCallMutation.isPending || !selectedLeadId}
              className="px-5 py-2 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-bold rounded-xl shadow-lg shadow-emerald-500/25 transition-all"
            >
              {logCallMutation.isPending ? 'Committing...' : 'Commit Call Log'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default StaffDashboard
