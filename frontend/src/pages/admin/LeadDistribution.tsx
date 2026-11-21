import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Share2,
  Users,
  UserCheck,
  CheckCircle2,
  AlertCircle,
  RotateCw,
  Sliders,
  Sparkles,
} from 'lucide-react'
import { apiClient } from '@/services/api'
import { Lead, Employee, PaginatedResponse } from '@/types'
import { StatusBadge, PriorityBadge } from '@/components/common/Badge'
import { EmptyState } from '@/components/common/EmptyState'

export const LeadDistribution: React.FC = () => {
  const queryClient = useQueryClient()
  const [method, setMethod] = useState<'equal' | 'round_robin'>('equal')
  const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>([])
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<string[]>([])
  const [distributionResult, setDistributionResult] = useState<any | null>(null)

  // 1. Fetch Unassigned Leads
  const { data: unassignedLeads, isLoading: leadsLoading } = useQuery<PaginatedResponse<Lead>>({
    queryKey: ['unassignedLeads'],
    queryFn: () => apiClient.get<PaginatedResponse<Lead>>('/leads/unassigned?page=1&page_size=100'),
  })

  // 2. Fetch Active Employees
  const { data: activeEmployees, isLoading: empsLoading } = useQuery<PaginatedResponse<Employee>>({
    queryKey: ['activeEmployeesForDistribution'],
    queryFn: () => apiClient.get<PaginatedResponse<Employee>>('/employees?is_active=true&page=1&page_size=50'),
  })

  // Mutation for Distribution
  const distributeMutation = useMutation({
    mutationFn: (payload: { lead_ids: string[]; employee_ids: string[]; method: string }) =>
      apiClient.post('/assignments/bulk-assign', payload),
    onSuccess: (res: any) => {
      setDistributionResult(res)
      setSelectedLeadIds([])
      queryClient.invalidateQueries({ queryKey: ['unassignedLeads'] })
      queryClient.invalidateQueries({ queryKey: ['adminLeads'] })
      queryClient.invalidateQueries({ queryKey: ['adminDashboardStats'] })
    },
  })

  const leads = unassignedLeads?.items || []
  const employees = activeEmployees?.items || []

  // Select all leads toggle
  const toggleSelectAllLeads = () => {
    if (selectedLeadIds.length === leads.length) {
      setSelectedLeadIds([])
    } else {
      setSelectedLeadIds(leads.map((l) => l.id))
    }
  }

  // Select all employees toggle
  const toggleSelectAllEmployees = () => {
    if (selectedEmployeeIds.length === employees.length) {
      setSelectedEmployeeIds([])
    } else {
      setSelectedEmployeeIds(employees.map((e) => e.id))
    }
  }

  const toggleLead = (id: string) => {
    setSelectedLeadIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  const toggleEmployee = (id: string) => {
    setSelectedEmployeeIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  const handleExecuteDistribution = () => {
    if (selectedLeadIds.length === 0 || selectedEmployeeIds.length === 0) return
    distributeMutation.mutate({
      lead_ids: selectedLeadIds,
      employee_ids: selectedEmployeeIds,
      method,
    })
  }

  const perEmployeeCount =
    selectedEmployeeIds.length > 0
      ? Math.floor(selectedLeadIds.length / selectedEmployeeIds.length)
      : 0
  const remainder =
    selectedEmployeeIds.length > 0
      ? selectedLeadIds.length % selectedEmployeeIds.length
      : 0

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Share2 className="h-6 w-6 text-blue-600" />
            Lead Distribution Engine
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Evenly or round-robin assign unassigned leads among active sales agents for daily 100-call targets.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setSelectedLeadIds(leads.map((l) => l.id))
              setSelectedEmployeeIds(employees.map((e) => e.id))
            }}
            className="px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 hover:bg-blue-100 rounded-lg transition-colors"
          >
            Select All Available
          </button>
        </div>
      </div>

      {/* Distribution Summary & Engine Controls */}
      <div className="bg-gradient-to-r from-blue-900 to-slate-900 text-white p-5 rounded-2xl shadow-lg border border-slate-800 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] text-blue-300 font-bold uppercase tracking-wider block">
              Assignment Configuration
            </span>
            <h3 className="text-lg font-bold">Smart Allocation Engine</h3>
          </div>

          {/* Method selector */}
          <div className="flex items-center gap-3 bg-slate-800/80 p-1.5 rounded-xl border border-slate-700">
            <button
              onClick={() => setMethod('equal')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                method === 'equal' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-300 hover:text-white'
              }`}
            >
              Equal Distribution
            </button>
            <button
              onClick={() => setMethod('round_robin')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                method === 'round_robin' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-300 hover:text-white'
              }`}
            >
              Round-Robin Rotation
            </button>
          </div>
        </div>

        {/* Live Calculation Preview */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-800 text-xs">
          <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700">
            <span className="text-slate-400 block">Selected Leads</span>
            <strong className="text-xl text-white block mt-0.5">{selectedLeadIds.length}</strong>
          </div>
          <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700">
            <span className="text-slate-400 block">Active Agents</span>
            <strong className="text-xl text-white block mt-0.5">{selectedEmployeeIds.length}</strong>
          </div>
          <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700">
            <span className="text-slate-400 block">Leads Per Agent</span>
            <strong className="text-xl text-blue-400 block mt-0.5">
              ~{perEmployeeCount} {remainder > 0 && <span className="text-xs text-slate-400">(+{remainder} extra)</span>}
            </strong>
          </div>
          <div className="flex items-center justify-center">
            <button
              onClick={handleExecuteDistribution}
              disabled={
                distributeMutation.isPending ||
                selectedLeadIds.length === 0 ||
                selectedEmployeeIds.length === 0
              }
              className="w-full py-3 px-4 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed shadow-md transition-all flex items-center justify-center gap-2"
            >
              {distributeMutation.isPending ? (
                <span>Distributing...</span>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>Execute Allocation</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Result banner if executed */}
        {distributionResult && (
          <div className="p-3 bg-emerald-950/80 border border-emerald-700/80 rounded-xl text-xs text-emerald-200 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>
              Successfully distributed <strong>{distributionResult.assigned_count}</strong> leads across{' '}
              {Object.keys(distributionResult.distribution || {}).length} employees!
            </span>
          </div>
        )}
      </div>

      {/* 2-Column Split: Leads to assign vs Employees to receive */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Unassigned Leads List */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-600" />
                Unassigned Leads ({leads.length})
              </h4>
              <span className="text-[11px] text-slate-500">
                {selectedLeadIds.length} of {leads.length} selected
              </span>
            </div>
            <button
              onClick={toggleSelectAllLeads}
              className="text-xs font-medium text-blue-600 hover:text-blue-700"
            >
              {selectedLeadIds.length === leads.length ? 'Deselect All' : 'Select All'}
            </button>
          </div>

          {leadsLoading ? (
            <div className="py-8 text-center text-xs text-slate-400">Loading leads...</div>
          ) : leads.length > 0 ? (
            <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
              {leads.map((lead) => {
                const isSelected = selectedLeadIds.includes(lead.id)
                return (
                  <div
                    key={lead.id}
                    onClick={() => toggleLead(lead.id)}
                    className={`p-3 rounded-xl border text-xs cursor-pointer transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-blue-50/70 border-blue-300 shadow-xs'
                        : 'bg-white border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}} // handled by parent div
                        className="h-4 w-4 text-blue-600 rounded border-slate-300 pointer-events-none"
                      />
                      <div>
                        <span className="font-semibold text-slate-900 block">{lead.customer_name}</span>
                        <span className="text-[11px] text-slate-500">
                          {lead.city} • ₹{lead.requested_amount.toLocaleString('en-IN')} ({lead.loan_type})
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <PriorityBadge priority={lead.priority} />
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <EmptyState
              title="No unassigned leads"
              description="All leads are currently allocated to staff members."
            />
          )}
        </div>

        {/* Target Active Employees List */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <UserCheck className="h-4 w-4 text-emerald-600" />
                Active Sales Agents ({employees.length})
              </h4>
              <span className="text-[11px] text-slate-500">
                {selectedEmployeeIds.length} of {employees.length} selected
              </span>
            </div>
            <button
              onClick={toggleSelectAllEmployees}
              className="text-xs font-medium text-blue-600 hover:text-blue-700"
            >
              {selectedEmployeeIds.length === employees.length ? 'Deselect All' : 'Select All'}
            </button>
          </div>

          {empsLoading ? (
            <div className="py-8 text-center text-xs text-slate-400">Loading employees...</div>
          ) : employees.length > 0 ? (
            <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
              {employees.map((emp) => {
                const isSelected = selectedEmployeeIds.includes(emp.id)
                return (
                  <div
                    key={emp.id}
                    onClick={() => toggleEmployee(emp.id)}
                    className={`p-3 rounded-xl border text-xs cursor-pointer transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-emerald-50/70 border-emerald-300 shadow-xs'
                        : 'bg-white border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}}
                        className="h-4 w-4 text-emerald-600 rounded border-slate-300 pointer-events-none"
                      />
                      <div>
                        <span className="font-semibold text-slate-900 block">{emp.user.full_name}</span>
                        <span className="text-[11px] text-slate-500 font-mono">
                          {emp.employee_id} • {emp.department}
                        </span>
                      </div>
                    </div>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      100 Calls/Day Target
                    </span>
                  </div>
                )
              })}
            </div>
          ) : (
            <EmptyState
              title="No active staff members"
              description="Activate or add employees in Employee Management."
            />
          )}
        </div>
      </div>
    </div>
  )
}
