import React from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  Users,
  PhoneCall,
  UserCheck,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileCheck2,
  BadgeDollarSign,
  TrendingUp,
  ArrowUpRight,
  Share2,
  Plus,
  UploadCloud,
  FileSpreadsheet,
} from 'lucide-react'
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { apiClient } from '@/services/api'
import { DashboardStats } from '@/types'
import { SkeletonCard } from '@/components/common/LoadingSkeleton'

const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#64748b', '#06b6d4']

export const AdminDashboard: React.FC = () => {
  // 1. Dashboard summary metrics
  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ['adminDashboardStats'],
    queryFn: () => apiClient.get<DashboardStats>('/analytics/dashboard'),
  })

  // 2. Daily call activity chart data
  const { data: dailyCalls } = useQuery<any[]>({
    queryKey: ['adminDailyCalls'],
    queryFn: () => apiClient.get<any[]>('/analytics/daily-calls?days=14'),
  })

  // 3. Weekly leads chart data
  const { data: weeklyLeads } = useQuery<any[]>({
    queryKey: ['adminWeeklyLeads'],
    queryFn: () => apiClient.get<any[]>('/analytics/weekly-leads?weeks=8'),
  })

  // 4. Employee leaderboard
  const { data: leaderboard } = useQuery<any[]>({
    queryKey: ['adminLeaderboard'],
    queryFn: () => apiClient.get<any[]>('/analytics/leaderboard'),
  })

  // 5. Lead status distribution
  const { data: leadDistribution } = useQuery<any[]>({
    queryKey: ['adminLeadDistribution'],
    queryFn: () => apiClient.get<any[]>('/analytics/lead-distribution'),
  })

  // 6. Loan pipeline stages
  const { data: loanPipeline } = useQuery<any[]>({
    queryKey: ['adminLoanPipeline'],
    queryFn: () => apiClient.get<any[]>('/analytics/loan-pipeline'),
  })

  // 7. Conversion Funnel
  const { data: funnel } = useQuery<any[]>({
    queryKey: ['adminConversionFunnel'],
    queryFn: () => apiClient.get<any[]>('/analytics/conversion-funnel'),
  })

  const targetPercentage =
    stats && stats.daily_target > 0
      ? Math.min(Math.round((stats.calls_today / stats.daily_target) * 100), 100)
      : 0

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Banner & Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Executive Dashboard</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time telemetry across leads, employee calls, document verification, and bank loan approvals.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            to="/admin/leads"
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <UploadCloud className="h-4 w-4" />
            <span>Upload CSV</span>
          </Link>
          <Link
            to="/admin/distribution"
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm shadow-blue-500/20 transition-colors"
          >
            <Share2 className="h-4 w-4" />
            <span>Distribute Leads</span>
          </Link>
          <Link
            to="/admin/reports"
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <FileSpreadsheet className="h-4 w-4" />
            <span>Export Reports</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
        {statsLoading ? (
          Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
        ) : (
          <>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span className="text-xs font-medium">Total Leads</span>
                <Users className="h-4 w-4 text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-slate-900">{stats?.total_leads || 0}</p>
              <span className="text-[10px] text-blue-600 font-medium">
                {stats?.unassigned_leads || 0} unassigned
              </span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span className="text-xs font-medium">Calls Today</span>
                <PhoneCall className="h-4 w-4 text-emerald-600" />
              </div>
              <p className="text-2xl font-bold text-slate-900">{stats?.calls_today || 0}</p>
              <span className="text-[10px] text-emerald-600 font-medium">
                Target: {stats?.daily_target || 0} ({targetPercentage}%)
              </span>
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
              <span className="text-[10px] text-rose-500 font-medium">
                {stats?.overdue_followups || 0} overdue
              </span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span className="text-xs font-medium">Pending Docs</span>
                <FileCheck2 className="h-4 w-4 text-orange-500" />
              </div>
              <p className="text-2xl font-bold text-slate-900">{stats?.pending_documents || 0}</p>
              <span className="text-[10px] text-orange-600 font-medium">Verification queue</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span className="text-xs font-medium">Disbursed Loans</span>
                <BadgeDollarSign className="h-4 w-4 text-emerald-600" />
              </div>
              <p className="text-2xl font-bold text-slate-900">{stats?.disbursed_loans || 0}</p>
              <span className="text-[10px] text-emerald-600 font-medium">
                {stats?.approved_loans || 0} approved
              </span>
            </div>
          </>
        )}
      </div>

      {/* Charts Row 1: Daily Calls & Weekly Leads */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Call Activity */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Daily Call Activity</h3>
              <p className="text-xs text-slate-500">Call interaction volume across all employees</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-blue-50 text-blue-700">
              Last 14 Days
            </span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyCalls || []}>
                <defs>
                  <linearGradient id="colorCalls" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="formatted_date" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="#2563eb"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorCalls)"
                  name="Calls"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Weekly Lead Generation */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Weekly Lead Ingestion</h3>
              <p className="text-xs text-slate-500">Inbound & uploaded customer acquisitions</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700">
              Last 8 Weeks
            </span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyLeads || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="week" tick={{ fontSize: 10, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} name="Leads" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 2: Leaderboard & Lead Status Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Employee Performance Leaderboard */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Employee Performance Leaderboard</h3>
              <p className="text-xs text-slate-500">Target completion and conversion ranking</p>
            </div>
            <Link
              to="/admin/employees"
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <span>Manage Team</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase border-b border-slate-100">
                <tr>
                  <th className="py-2.5 px-3 font-semibold">Employee</th>
                  <th className="py-2.5 px-3 font-semibold">Department</th>
                  <th className="py-2.5 px-3 font-semibold">Calls Today</th>
                  <th className="py-2.5 px-3 font-semibold">Target (100)</th>
                  <th className="py-2.5 px-3 font-semibold">Interested</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Conversions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {leaderboard && leaderboard.length > 0 ? (
                  leaderboard.slice(0, 5).map((emp: any, idx: number) => (
                    <tr key={emp.employee_id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <span
                            className={`h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                              idx === 0
                                ? 'bg-amber-100 text-amber-800'
                                : idx === 1
                                ? 'bg-slate-200 text-slate-800'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {idx + 1}
                          </span>
                          <div>
                            <span className="font-semibold text-slate-900 block">
                              {emp.employee_name}
                            </span>
                            <span className="text-[10px] text-slate-400">{emp.employee_id}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-slate-600">{emp.department}</td>
                      <td className="py-3 px-3 font-medium text-slate-900">{emp.calls}</td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2 w-28">
                          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                            <div
                              className="bg-blue-600 h-full rounded-full"
                              style={{ width: `${Math.min(emp.completion_pct, 100)}%` }}
                            />
                          </div>
                          <span className="text-[10px] text-slate-500 font-medium">
                            {emp.completion_pct}%
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-slate-700 font-medium">{emp.interested}</td>
                      <td className="py-3 px-3 text-right">
                        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {emp.conversions}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      No active employee data yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Lead Status Distribution Donut Chart */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Lead Status Distribution</h3>
            <p className="text-xs text-slate-500 mb-3">Portfolio breakdown by status</p>
          </div>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={leadDistribution || []}
                  dataKey="count"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={3}
                >
                  {(leadDistribution || []).map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '11px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-1.5 pt-2 border-t border-slate-100 text-[11px]">
            {(leadDistribution || []).slice(0, 4).map((item, idx) => (
              <div key={item.status} className="flex items-center gap-1.5 text-slate-600">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                />
                <span className="truncate">{item.status}:</span>
                <strong className="text-slate-900 ml-auto">{item.count}</strong>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 3: Pipeline & Funnel Conversion Visualization */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Loan Application Pipeline */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Loan Application Pipeline</h3>
              <p className="text-xs text-slate-500">Live applications under banking progression</p>
            </div>
            <Link
              to="/admin/applications"
              className="text-xs font-semibold text-blue-600 hover:text-blue-700"
            >
              View Pipeline
            </Link>
          </div>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={loanPipeline || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis
                  dataKey="status"
                  type="category"
                  tick={{ fontSize: 10, fill: '#475569' }}
                  width={110}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '11px',
                  }}
                />
                <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} name="Applications" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Conversion Rate Funnel */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Sales Conversion Funnel</h3>
              <p className="text-xs text-slate-500">End-to-end customer journey from Lead to Disbursal</p>
            </div>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
              Actual Database Records
            </span>
          </div>

          <div className="space-y-3 pt-1">
            {(funnel || []).map((stage: any, idx: number) => {
              const bgTints = [
                'bg-blue-600',
                'bg-blue-500',
                'bg-indigo-500',
                'bg-purple-500',
                'bg-emerald-500',
                'bg-green-600',
              ]
              return (
                <div key={stage.stage} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-slate-700">{stage.stage}</span>
                    <span className="text-slate-500">
                      <strong>{stage.count}</strong> ({stage.pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                    <div
                      className={`${bgTints[idx % bgTints.length]} h-full rounded-full transition-all duration-500`}
                      style={{ width: `${Math.max(stage.pct, 3)}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
