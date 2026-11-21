import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  UserCheck,
  UserX,
  Plus,
  Search,
  KeyRound,
  Edit2,
  TrendingUp,
  X,
  Target,
  PhoneCall,
  CheckCircle2,
  Award,
} from 'lucide-react'
import { apiClient } from '@/services/api'
import { Employee, EmployeePerformance, PaginatedResponse } from '@/types'
import { Pagination } from '@/components/common/Pagination'
import { Modal } from '@/components/common/Modal'
import { SkeletonTable } from '@/components/common/LoadingSkeleton'
import { EmptyState } from '@/components/common/EmptyState'

export const EmployeeManagement: React.FC = () => {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null)
  const [resetPasswordEmp, setResetPasswordEmp] = useState<Employee | null>(null)
  const [selectedPerformanceEmpId, setSelectedPerformanceEmpId] = useState<string | null>(null)
  const [newPassword, setNewPassword] = useState('')

  // Create Employee Form
  const [createForm, setCreateForm] = useState({
    employee_id: '',
    department: 'Retail Loans',
    joining_date: new Date().toISOString().split('T')[0],
    daily_call_target: 100,
    user: {
      email: '',
      full_name: '',
      phone: '',
      password: 'Password123!',
      role: 'staff',
    },
  })

  // Edit Employee Form
  const [editForm, setEditForm] = useState({
    employee_id: '',
    department: '',
    daily_call_target: 100,
  })

  // 1. Fetch Employees
  const { data: employeesData, isLoading } = useQuery<PaginatedResponse<Employee>>({
    queryKey: ['adminEmployees', page, pageSize, search, statusFilter],
    queryFn: () => {
      const params: Record<string, any> = { page, page_size: pageSize }
      if (search) params.search = search
      if (statusFilter !== '') params.is_active = statusFilter === 'active'
      return apiClient.get<PaginatedResponse<Employee>>('/employees', params)
    },
  })

  // 2. Fetch Individual Performance
  const { data: performanceData, isLoading: perfLoading } = useQuery<EmployeePerformance>({
    queryKey: ['empPerformance', selectedPerformanceEmpId],
    queryFn: () => apiClient.get<EmployeePerformance>(`/employees/${selectedPerformanceEmpId}/performance`),
    enabled: !!selectedPerformanceEmpId,
  })

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: any) => apiClient.post('/employees', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminEmployees'] })
      setIsCreateOpen(false)
      setCreateForm({
        employee_id: '',
        department: 'Retail Loans',
        joining_date: new Date().toISOString().split('T')[0],
        daily_call_target: 100,
        user: { email: '', full_name: '', phone: '', password: 'Password123!', role: 'staff' },
      })
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => apiClient.put(`/employees/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminEmployees'] })
      setEditingEmployee(null)
    },
  })

  const toggleStatusMutation = useMutation({
    mutationFn: (id: string) => apiClient.patch(`/employees/${id}/toggle-status`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminEmployees'] })
    },
  })

  const resetPasswordMutation = useMutation({
    mutationFn: ({ id, password }: { id: string; password: string }) =>
      apiClient.post(`/employees/${id}/reset-password`, { new_password: password }),
    onSuccess: () => {
      setResetPasswordEmp(null)
      setNewPassword('')
      alert('Password has been successfully updated.')
    },
  })

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createMutation.mutate({
      ...createForm,
      daily_call_target: Number(createForm.daily_call_target),
    })
  }

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingEmployee) return
    updateMutation.mutate({
      id: editingEmployee.id,
      data: {
        ...editForm,
        daily_call_target: Number(editForm.daily_call_target),
      },
    })
  }

  const handleOpenEdit = (emp: Employee) => {
    setEditingEmployee(emp)
    setEditForm({
      employee_id: emp.employee_id,
      department: emp.department || '',
      daily_call_target: emp.daily_call_target || 100,
    })
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Employee Management</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage sales executives, daily call targets (100 calls/day standard), and monitor KPI metrics.
          </p>
        </div>
        <button
          onClick={() => setIsCreateOpen(true)}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm shadow-blue-500/20 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Add Employee</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by employee code, staff name, email, or department..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            className="w-full pl-10 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-900"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value)
            setPage(1)
          }}
          className="px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white text-slate-700 focus:ring-1 focus:ring-blue-600 w-full md:w-auto"
        >
          <option value="">All Statuses</option>
          <option value="active">Active Only</option>
          <option value="inactive">Inactive Only</option>
        </select>
      </div>

      {/* Employees Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <SkeletonTable rows={8} cols={6} />
        ) : employeesData && employeesData.items.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase border-b border-slate-200 font-semibold">
                <tr>
                  <th className="py-3 px-4">Staff Member</th>
                  <th className="py-3 px-4">Employee ID</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Daily Target</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {employeesData.items.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <div>
                        <span className="font-semibold text-slate-900 block text-sm">
                          {emp.user.full_name}
                        </span>
                        <span className="text-slate-500 text-[11px] block">{emp.user.email}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-medium text-slate-700">
                      {emp.employee_id}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">{emp.department || 'Retail Loans'}</td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 font-semibold text-slate-800">
                        <Target className="h-3.5 w-3.5 text-blue-600" />
                        {emp.daily_call_target || 100} calls/day
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      {emp.is_active ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200">
                          <span className="h-1.5 w-1.5 rounded-full bg-rose-600" />
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedPerformanceEmpId(emp.id)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          title="View Performance KPIs"
                        >
                          <TrendingUp className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(emp)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                          title="Edit Employee"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setResetPasswordEmp(emp)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                          title="Reset Password"
                        >
                          <KeyRound className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => toggleStatusMutation.mutate(emp.id)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            emp.is_active
                              ? 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                              : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'
                          }`}
                          title={emp.is_active ? 'Deactivate' : 'Activate'}
                        >
                          {emp.is_active ? (
                            <UserX className="h-4 w-4" />
                          ) : (
                            <UserCheck className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            title="No employees found"
            description="Add your first sales executive to start distributing leads."
            action={{ label: 'Add Employee', onClick: () => setIsCreateOpen(true) }}
          />
        )}

        <Pagination
          currentPage={page}
          totalPages={employeesData?.pages || 1}
          totalItems={employeesData?.total || 0}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={(newSize) => {
            setPageSize(newSize)
            setPage(1)
          }}
        />
      </div>

      {/* Individual Employee Performance Drawer */}
      {selectedPerformanceEmpId && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col overflow-hidden animate-slide-in">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="text-base font-bold text-slate-900">Performance Telemetry</h3>
                <p className="text-xs text-slate-500">Live KPI metrics from actual database activity</p>
              </div>
              <button
                onClick={() => setSelectedPerformanceEmpId(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {perfLoading ? (
                <div className="py-12 text-center text-slate-400">Loading performance data...</div>
              ) : performanceData ? (
                <>
                  <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-slate-900 text-base">{performanceData.full_name}</h4>
                      <span className="text-xs text-blue-700 font-mono">{performanceData.employee_id}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-slate-500 block">Daily Goal</span>
                      <strong className="text-blue-900 text-sm">100 Calls</strong>
                    </div>
                  </div>

                  {/* 100-Call Daily Target Progress Card */}
                  <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-800 flex items-center gap-1.5">
                        <Target className="h-4 w-4 text-blue-600" />
                        Daily Target Progress
                      </span>
                      <span className="font-bold text-blue-600">{performanceData.target_pct}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                      <div
                        className="bg-blue-600 h-full rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(performanceData.target_pct, 100)}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[11px] text-slate-500 pt-1">
                      <span>Completed: <strong>{performanceData.calls_today}</strong></span>
                      <span>Remaining: <strong>{performanceData.remaining_calls}</strong></span>
                    </div>
                  </div>

                  {/* KPI Metrics Grid */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                      <span className="text-xs text-slate-500 block">Assigned Leads</span>
                      <strong className="text-xl text-slate-900 block mt-1">
                        {performanceData.assigned_leads}
                      </strong>
                    </div>
                    <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                      <span className="text-xs text-slate-500 block">Interested Leads</span>
                      <strong className="text-xl text-purple-700 block mt-1">
                        {performanceData.interested_leads}
                      </strong>
                    </div>
                    <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                      <span className="text-xs text-slate-500 block">Follow-ups Done</span>
                      <strong className="text-xl text-emerald-700 block mt-1">
                        {performanceData.followups_completed}
                      </strong>
                    </div>
                    <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                      <span className="text-xs text-slate-500 block">Loan Conversions</span>
                      <strong className="text-xl text-emerald-700 block mt-1">
                        {performanceData.conversions}
                      </strong>
                    </div>
                  </div>
                </>
              ) : null}
            </div>
          </div>
        </div>
      )}

      {/* Create Employee Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Add Sales Executive"
        subtitle="Create user login and employee profile"
        maxWidth="lg"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Full Name *</label>
            <input
              type="text"
              required
              value={createForm.user.full_name}
              onChange={(e) =>
                setCreateForm({
                  ...createForm,
                  user: { ...createForm.user, full_name: e.target.value },
                })
              }
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900"
              placeholder="e.g. Ananya Deshmukh"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Work Email *</label>
              <input
                type="email"
                required
                value={createForm.user.email}
                onChange={(e) =>
                  setCreateForm({
                    ...createForm,
                    user: { ...createForm.user, email: e.target.value },
                  })
                }
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900"
                placeholder="staff@loanflow.demo"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Phone Number</label>
              <input
                type="text"
                value={createForm.user.phone}
                onChange={(e) =>
                  setCreateForm({
                    ...createForm,
                    user: { ...createForm.user, phone: e.target.value },
                  })
                }
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900"
                placeholder="+91 98000 00000"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Employee ID Code *</label>
              <input
                type="text"
                required
                value={createForm.employee_id}
                onChange={(e) => setCreateForm({ ...createForm, employee_id: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900"
                placeholder="e.g. EMP-006"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Department</label>
              <input
                type="text"
                value={createForm.department}
                onChange={(e) => setCreateForm({ ...createForm, department: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900"
                placeholder="Retail Loans"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Initial Password *</label>
              <input
                type="password"
                required
                value={createForm.user.password}
                onChange={(e) =>
                  setCreateForm({
                    ...createForm,
                    user: { ...createForm.user, password: e.target.value },
                  })
                }
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Daily Call Target</label>
              <input
                type="number"
                value={createForm.daily_call_target}
                onChange={(e) =>
                  setCreateForm({ ...createForm, daily_call_target: Number(e.target.value) })
                }
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsCreateOpen(false)}
              className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm"
            >
              {createMutation.isPending ? 'Creating...' : 'Create Employee'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Employee Modal */}
      <Modal
        isOpen={!!editingEmployee}
        onClose={() => setEditingEmployee(null)}
        title="Edit Employee Information"
        subtitle={`Updating settings for ${editingEmployee?.user.full_name}`}
        maxWidth="md"
      >
        <form onSubmit={handleEditSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Employee Code</label>
            <input
              type="text"
              value={editForm.employee_id}
              onChange={(e) => setEditForm({ ...editForm, employee_id: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Department</label>
            <input
              type="text"
              value={editForm.department}
              onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Daily Call Target</label>
            <input
              type="number"
              value={editForm.daily_call_target}
              onChange={(e) =>
                setEditForm({ ...editForm, daily_call_target: Number(e.target.value) })
              }
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setEditingEmployee(null)}
              className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updateMutation.isPending}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg"
            >
              Save Changes
            </button>
          </div>
        </form>
      </Modal>

      {/* Reset Password Modal */}
      <Modal
        isOpen={!!resetPasswordEmp}
        onClose={() => {
          setResetPasswordEmp(null)
          setNewPassword('')
        }}
        title="Reset Password"
        subtitle={`Set new password for ${resetPasswordEmp?.user.full_name}`}
        maxWidth="sm"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault()
            if (!resetPasswordEmp || !newPassword) return
            resetPasswordMutation.mutate({ id: resetPasswordEmp.id, password: newPassword })
          }}
          className="space-y-4 text-xs"
        >
          <div>
            <label className="block font-semibold text-slate-700 mb-1">New Password *</label>
            <input
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Minimum 8 characters"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => {
                setResetPasswordEmp(null)
                setNewPassword('')
              }}
              className="px-3 py-1.5 border border-slate-200 rounded-lg text-slate-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={resetPasswordMutation.isPending || !newPassword}
              className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-lg"
            >
              {resetPasswordMutation.isPending ? 'Updating...' : 'Set Password'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
