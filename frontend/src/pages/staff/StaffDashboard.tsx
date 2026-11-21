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
  Landmark,
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
    <div className="space-y-6 text-slate-800">
      {/* ------------------------------------------------------------- */}
      {/* 100-Call Daily Target Shift Command Console */}
      {/* ------------------------------------------------------------- */}
      <div className="relative overflow-hidden rounded-3xl bg-white/95 backdrop-blur-xl border border-slate-200/90 p-6 sm:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-3 z-10 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-mono font-semibold">
            <Target className="h-3.5 w-3.5 text-emerald-700" />
            <span>DAILY 100-CALL SHIFT BENCHMARK</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Outreach Representative Cockpit
          </h2>

          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Every call introduces loan schemes, gathers documents, and accelerates bank underwriting. Maintain your daily target of 100 customer calls.
          </p>

          <div className="pt-2">
            <button
              onClick={() => {
                if (myLeads?.items?.[0]) setSelectedLeadId(myLeads.items[0].id)
                setIsLogCallOpen(true)
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 shadow-xs transition-all hover:scale-[1.01]"
            >
              <PhoneCall className="h-4 w-4" />
              <span>Record Customer Call</span>
            </button>
          </div>
        </div>

        {/* Circular Progress & Numerical Shift Telemetry */}
        <div className="z-10 flex items-center gap-6 bg-slate-50/90 p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
          {/* Radial Progress Ring */}
          <div className="relative h-28 w-28 flex items-center justify-center shrink-0">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="40"
                className="stroke-slate-200"
                strokeWidth="10"
                fill="transparent"
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                className="stroke-emerald-600 transition-all duration-1000 ease-out"
                strokeWidth="10"
                strokeDasharray="251.2"
                strokeDashoffset={251.2 - (251.2 * pct) / 100}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-2xl font-black text-slate-900 font-mono">{pct}%</span>
              <span className="text-[9px] uppercase tracking-wider text-slate-500 font-bold">Quota</span>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            <div>
              <span className="text-slate-500 block text-[11px] font-mono">Calls Completed</span>
              <strong className="text-2xl font-extrabold text-slate-900 font-mono">
                {completed}{' '}
                <span className="text-xs font-normal text-slate-500">/ {target}</span>
              </strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px] font-mono">Remaining Calls</span>
              <strong className="text-base font-bold text-amber-700 font-mono">{remaining} to go</strong>
            </div>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 3D KPI Tilt Cards Grid */}
      {/* ------------------------------------------------------------- */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* Assigned Leads */}
        <Card3D className="p-4">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">My Portfolio</span>
            <div className="h-7 w-7 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-700">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {stats?.assigned_leads || 0}
          </p>
          <span className="text-[10px] text-slate-600 font-mono block mt-2">Active leads</span>
        </Card3D>

        {/* Interested */}
        <Card3D className="p-4">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Interested</span>
            <div className="h-7 w-7 rounded-lg bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-700">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {stats?.interested_customers || 0}
          </p>
          <span className="text-[10px] text-purple-700 font-mono block mt-2 font-semibold">Warm prospects</span>
        </Card3D>

        {/* Follow-ups Today */}
        <Card3D className="p-4">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Follow-ups</span>
            <div className="h-7 w-7 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-700">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {stats?.followups_due_today || 0}
          </p>
          <span className="text-[10px] text-amber-700 font-mono block mt-2 font-semibold">Scheduled today</span>
        </Card3D>

        {/* Overdue */}
        <Card3D className="p-4">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Overdue</span>
            <div className="h-7 w-7 rounded-lg bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-700">
              <AlertCircle className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {stats?.overdue_followups || 0}
          </p>
          <span className="text-[10px] text-rose-700 font-mono block mt-2 font-semibold">Immediate action</span>
        </Card3D>

        {/* Pending Docs */}
        <Card3D className="p-4">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Pending Docs</span>
            <div className="h-7 w-7 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700">
              <FileCheck2 className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {stats?.pending_documents || 0}
          </p>
          <span className="text-[10px] text-slate-600 font-mono block mt-2">KYC collection</span>
        </Card3D>

        {/* Active Applications */}
        <Card3D className="p-4">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Active Loans</span>
            <div className="h-7 w-7 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700">
              <FileSpreadsheet className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {stats?.active_applications || 0}
          </p>
          <span className="text-[10px] text-emerald-700 font-mono block mt-2 font-semibold">Under bank review</span>
        </Card3D>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 3D Glass Interactive Navigation Cards */}
      {/* ------------------------------------------------------------- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link to="/staff/leads" className="block group">
          <Card3D className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="h-10 w-10 rounded-xl bg-blue-50 border border-blue-100 text-blue-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Users className="h-5 w-5" />
              </div>
              <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-slate-900 transition-colors" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Assigned Lead Worklist</h3>
            <p className="text-xs text-slate-500 mt-1">
              Call customers, discuss bank loan schemes, and advance qualified profiles through the pipeline.
            </p>
          </Card3D>
        </Link>

        <Link to="/staff/followups" className="block group">
          <Card3D className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="h-10 w-10 rounded-xl bg-amber-50 border border-amber-100 text-amber-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Clock className="h-5 w-5" />
              </div>
              <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-slate-900 transition-colors" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Scheduled Callbacks</h3>
            <p className="text-xs text-slate-500 mt-1">
              View upcoming callback calendars, clear overdue reminders, and record customer notes.
            </p>
          </Card3D>
        </Link>

        <Link to="/staff/loans" className="block group">
          <Card3D className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="h-10 w-10 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                <FileSpreadsheet className="h-5 w-5" />
              </div>
              <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-slate-900 transition-colors" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Loan Application Tracking</h3>
            <p className="text-xs text-slate-500 mt-1">
              Route sanctioned loan files to partner banks, monitor underwriting, and track customer disbursals.
            </p>
          </Card3D>
        </Link>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* Quick Call Log Modal */}
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
            <label className="block font-semibold text-slate-700 mb-1">Customer Lead *</label>
            <select
              required
              value={selectedLeadId}
              onChange={(e) => setSelectedLeadId(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-900 bg-white focus:border-slate-400 focus:outline-none"
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
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-900 bg-white focus:border-slate-400 focus:outline-none"
              >
                {CALL_OUTCOME_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Duration (Seconds) *</label>
              <input
                type="number"
                required
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-900 bg-white font-mono focus:border-slate-400 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Next Follow-up Date (Optional)</label>
            <input
              type="datetime-local"
              value={followUpDate}
              onChange={(e) => setFollowUpDate(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-900 bg-white focus:border-slate-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Call Notes / Customer Remarks</label>
            <textarea
              rows={3}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="e.g. Customer interested in 10.5% personal loan, salary slips requested via WhatsApp."
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-900 bg-white placeholder:text-slate-400 focus:border-slate-400 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsLogCallOpen(false)}
              className="px-3 py-1.5 border border-slate-200 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={logCallMutation.isPending || !selectedLeadId}
              className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-xs transition-all"
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
