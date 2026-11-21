import React from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Award,
  Target,
  PhoneCall,
  TrendingUp,
  Flame,
  CheckCircle2,
  Calendar,
  Users,
  Trophy,
  ArrowUpRight,
  Clock,
  Sparkles,
  Shield,
  Landmark,
} from 'lucide-react'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from 'recharts'
import { apiClient } from '@/services/api'
import { StaffDashboardStats, CallProgress } from '@/types'
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton'
import { useAuth } from '@/context/AuthContext'
import { Card3D } from '@/components/common/Card3D'

interface LeaderboardItem {
  employee_id: string
  employee_name: string
  department?: string
  calls: number
  target: number
  completion_pct: number
  interested: number
  conversions: number
}

interface DailyCallPoint {
  date: string
  formatted_date?: string
  count?: number
  calls?: number
}

export const StaffPerformance: React.FC = () => {
  const { user } = useAuth()

  // 1. Staff Telemetry
  const { data: stats, isLoading: loadingStats } = useQuery<StaffDashboardStats>({
    queryKey: ['staffDashboardStats'],
    queryFn: () => apiClient.get<StaffDashboardStats>('/analytics/staff-dashboard'),
  })

  // 2. Real-time Target
  const { data: progress } = useQuery<CallProgress>({
    queryKey: ['staffCallProgress'],
    queryFn: () => apiClient.get<CallProgress>('/calls/progress'),
  })

  // 3. Daily Call Chart Data (14 Days)
  const { data: rawChartData, isLoading: loadingChart } = useQuery<DailyCallPoint[]>({
    queryKey: ['staffDailyCallsTrend'],
    queryFn: () => apiClient.get<DailyCallPoint[]>('/analytics/daily-calls?days=14'),
  })

  // 4. Team Leaderboard
  const { data: leaderboard, isLoading: loadingLeaderboard } = useQuery<LeaderboardItem[]>({
    queryKey: ['teamLeaderboard'],
    queryFn: () => apiClient.get<LeaderboardItem[]>('/analytics/leaderboard'),
  })

  const completed = progress?.completed ?? stats?.calls_completed ?? 0
  const target = progress?.target ?? stats?.daily_call_target ?? 100
  const remaining = Math.max(0, target - completed)
  const pct = Math.min(Math.round((completed / target) * 100), 100)

  // Safely find user's rank without throwing
  const userFullName = (user?.full_name || '').toLowerCase().trim()
  const myRank =
    leaderboard && Array.isArray(leaderboard) && userFullName
      ? leaderboard.findIndex((item) => {
          const empName = (item?.employee_name || '').toLowerCase().trim()
          return empName.includes(userFullName) || userFullName.includes(empName)
        }) + 1
      : 0

  // Format chart data cleanly mapping both count and calls
  const chartData = (rawChartData || []).map((pt) => ({
    date: pt.formatted_date || pt.date,
    calls: pt.calls ?? pt.count ?? 0,
  }))

  return (
    <div className="space-y-6 text-slate-800">
      {/* Hero Performance Header (Clean Light Theme) */}
      <div className="bg-white/95 backdrop-blur-xl rounded-2xl p-6 border border-slate-200/90 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-mono font-semibold">
              <Landmark className="h-3.5 w-3.5 text-slate-700" />
              <span>OFFICIAL CALL CENTRE PERFORMANCE METRICS</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              Performance & Shift Analytics
            </h1>
            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
              Track your daily 100-call quota pacing, verified KYC submissions, and rank on the active call centre leaderboard.
            </p>
          </div>

          {/* Quick Stat Badge */}
          <div className="flex items-center gap-4 bg-slate-50 px-6 py-4 rounded-xl border border-slate-200/90 shadow-2xs">
            <div className="h-12 w-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-200/60">
              <Trophy className="h-6 w-6" />
            </div>
            <div>
              <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold font-mono">Team Standing</div>
              <div className="text-2xl font-extrabold text-slate-900 font-mono">
                {myRank > 0 ? `#${myRank} of ${leaderboard?.length || 20}` : 'Top Tier Agent'}
              </div>
              <div className="text-[11px] text-emerald-700 font-medium font-mono">Active Outbound Shift</div>
            </div>
          </div>
        </div>
      </div>

      {/* Primary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Calls Today */}
        <Card3D className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Calls Today</span>
            <div className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-100">
              <PhoneCall className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 font-mono">{completed}</span>
            <span className="text-xs font-medium text-slate-500 font-mono">/ {target} goal</span>
          </div>
          <div className="mt-3 w-full bg-slate-200 h-2 rounded-full overflow-hidden">
            <div
              className="bg-emerald-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex justify-between font-mono">
            <span>{pct}% achieved</span>
            <span className="font-semibold text-slate-700">{remaining} to go</span>
          </div>
        </Card3D>

        {/* Interested Leads */}
        <Card3D className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Interested Leads</span>
            <div className="h-8 w-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center border border-blue-100">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 font-mono">
              {stats?.interested_customers || 0}
            </span>
            <span className="text-xs font-medium text-slate-500">prospects</span>
          </div>
          <p className="mt-3 text-[11px] text-slate-500">
            High-intent borrowers ready for loan scheme recommendation
          </p>
        </Card3D>

        {/* Active Applications */}
        <Card3D className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Bank Submissions</span>
            <div className="h-8 w-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center border border-slate-200">
              <Award className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 font-mono">
              {stats?.active_applications || 0}
            </span>
            <span className="text-xs font-medium text-slate-500">in underwriting</span>
          </div>
          <p className="mt-3 text-[11px] text-slate-500">
            Customer files submitted to institutional banking partners
          </p>
        </Card3D>

        {/* Pending Follow-ups */}
        <Card3D className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Follow-ups Today</span>
            <div className="h-8 w-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-100">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 font-mono">
              {stats?.followups_due_today || 0}
            </span>
            <span className="text-xs font-medium text-slate-500">scheduled</span>
          </div>
          <div className="mt-3 flex items-center gap-1 text-[11px]">
            {stats?.overdue_followups && stats.overdue_followups > 0 ? (
              <span className="text-rose-700 font-semibold font-mono">
                {stats.overdue_followups} overdue callbacks
              </span>
            ) : (
              <span className="text-emerald-700 font-semibold font-mono">All callbacks up to date</span>
            )}
          </div>
        </Card3D>
      </div>

      {/* Calling Trends Area Chart */}
      <div className="bg-white/95 backdrop-blur-xl p-6 rounded-2xl border border-slate-200/90 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div>
            <h3 className="text-base font-bold text-slate-900">14-Day Call Volume Trend</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Daily customer calls logged against the company standard 100-call benchmark.
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="h-3 w-3 rounded-full bg-slate-900" />
              <span className="text-slate-600 font-medium">Daily Calls</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-0.5 w-4 bg-emerald-600 border-dashed" />
              <span className="text-slate-600 font-medium">100-Call Target</span>
            </div>
          </div>
        </div>

        {loadingChart ? (
          <LoadingSkeleton count={4} />
        ) : (
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="callsMistGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  tickLine={false}
                  axisLine={{ stroke: '#e2e8f0' }}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  tickLine={false}
                  axisLine={false}
                  domain={[0, 120]}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '10px',
                    color: '#0f172a',
                    fontSize: '12px',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
                  }}
                  formatter={(value: any) => [`${value} calls`, 'Volume']}
                />
                <ReferenceLine
                  y={100}
                  stroke="#10b981"
                  strokeDasharray="3 3"
                  label={{
                    value: '100 Target',
                    fill: '#10b981',
                    fontSize: 10,
                    position: 'insideTopRight',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="calls"
                  stroke="#2563eb"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#callsMistGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Team Leaderboard Preview */}
      <div className="bg-white/95 backdrop-blur-xl rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-200/90 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Shift Calling Leaderboard</h3>
            <p className="text-xs text-slate-500 mt-0.5">Live rankings of call centre agents based on calls logged today.</p>
          </div>
          <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
            Target: 100 Calls / Agent
          </span>
        </div>

        {loadingLeaderboard ? (
          <div className="p-6">
            <LoadingSkeleton count={5} />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Rank</th>
                  <th className="py-3 px-4">Agent Name</th>
                  <th className="py-3 px-4">Calls Today</th>
                  <th className="py-3 px-4">Target Progress</th>
                  <th className="py-3 px-4">Loan Conversions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {leaderboard && leaderboard.length > 0 ? (
                  leaderboard.slice(0, 10).map((agent, index) => {
                    const agentName = agent?.employee_name || agent?.employee_id || ''
                    const isCurrent =
                      userFullName &&
                      (agentName.toLowerCase().includes(userFullName) ||
                        userFullName.includes(agentName.toLowerCase()))

                    return (
                      <tr
                        key={agent.employee_id || index}
                        className={`hover:bg-slate-50/60 transition ${
                          isCurrent ? 'bg-emerald-50/60 font-semibold' : ''
                        }`}
                      >
                        <td className="py-3.5 px-4 font-mono">
                          {index === 0 ? (
                            <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-amber-100 text-amber-800 font-bold text-xs shadow-2xs">
                              1
                            </span>
                          ) : index === 1 ? (
                            <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-slate-200 text-slate-800 font-bold text-xs">
                              2
                            </span>
                          ) : index === 2 ? (
                            <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-stone-200 text-stone-800 font-bold text-xs">
                              3
                            </span>
                          ) : (
                            <span className="text-slate-500 pl-2">#{index + 1}</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="text-slate-900 font-medium flex items-center gap-1.5">
                            {agent.employee_name || agent.employee_id}
                            {isCurrent && (
                              <span className="text-[10px] text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded font-bold">
                                YOU
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            {agent.employee_id} • {agent.department || 'Sales'}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-bold text-slate-900 font-mono">
                          {agent.calls ?? 0}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-28 bg-slate-200 h-2 rounded-full overflow-hidden">
                              <div
                                className="bg-slate-900 h-full rounded-full"
                                style={{ width: `${Math.min(agent.completion_pct || 0, 100)}%` }}
                              />
                            </div>
                            <span className="font-mono text-slate-600 text-[11px]">
                              {agent.completion_pct ?? 0}%
                            </span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-mono font-medium text-slate-800">
                          <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold">
                            {agent.conversions ?? 0}
                          </span>
                        </td>
                      </tr>
                    )
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-500">
                      No active leaderboard data yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default StaffPerformance
