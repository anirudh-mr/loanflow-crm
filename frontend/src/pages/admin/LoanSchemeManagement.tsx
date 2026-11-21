import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { BadgePercent, Plus, Edit2, Building2 } from 'lucide-react'
import { apiClient } from '@/services/api'
import { LoanScheme, Bank, PaginatedResponse } from '@/types'
import { Pagination } from '@/components/common/Pagination'
import { Modal } from '@/components/common/Modal'
import { SkeletonTable } from '@/components/common/LoadingSkeleton'
import { EmptyState } from '@/components/common/EmptyState'
import { LOAN_TYPE_OPTIONS } from '@/utils/constants'

export const LoanSchemeManagement: React.FC = () => {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [selectedBankId, setSelectedBankId] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')

  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [editingScheme, setEditingScheme] = useState<LoanScheme | null>(null)

  // Form
  const [formData, setFormData] = useState({
    bank_id: '',
    scheme_name: '',
    loan_category: 'Personal Loan',
    min_amount: '',
    max_amount: '',
    interest_rate: '',
    min_tenure_months: '12',
    max_tenure_months: '60',
    eligibility_info: '',
  })

  // 1. Fetch Banks for selection
  const { data: banksData } = useQuery<PaginatedResponse<Bank>>({
    queryKey: ['adminBanksForSchemes'],
    queryFn: () => apiClient.get<PaginatedResponse<Bank>>('/banks?is_active=true&page=1&page_size=50'),
  })

  // 2. Fetch Schemes
  const { data: schemesData, isLoading } = useQuery<PaginatedResponse<LoanScheme>>({
    queryKey: ['adminSchemes', page, pageSize, selectedBankId, categoryFilter],
    queryFn: () => {
      const params: Record<string, any> = { page, page_size: pageSize }
      if (selectedBankId) params.bank_id = selectedBankId
      if (categoryFilter) params.category = categoryFilter
      return apiClient.get<PaginatedResponse<LoanScheme>>('/loan-schemes', params)
    },
  })

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: any) => apiClient.post('/loan-schemes', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminSchemes'] })
      setIsAddOpen(false)
      resetForm()
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => apiClient.put(`/loan-schemes/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminSchemes'] })
      setEditingScheme(null)
      resetForm()
    },
  })

  const toggleStatusMutation = useMutation({
    mutationFn: (id: string) => apiClient.patch(`/loan-schemes/${id}/toggle-status`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminSchemes'] })
    },
  })

  const resetForm = () => {
    setFormData({
      bank_id: banksData?.items?.[0]?.id || '',
      scheme_name: '',
      loan_category: 'Personal Loan',
      min_amount: '50000',
      max_amount: '2000000',
      interest_rate: '10.5',
      min_tenure_months: '12',
      max_tenure_months: '60',
      eligibility_info: '',
    })
  }

  const handleOpenEdit = (scheme: LoanScheme) => {
    setEditingScheme(scheme)
    setFormData({
      bank_id: scheme.bank_id,
      scheme_name: scheme.scheme_name,
      loan_category: scheme.loan_category,
      min_amount: String(scheme.min_amount),
      max_amount: String(scheme.max_amount),
      interest_rate: String(scheme.interest_rate),
      min_tenure_months: String(scheme.min_tenure_months),
      max_tenure_months: String(scheme.max_tenure_months),
      eligibility_info: scheme.eligibility_info || '',
    })
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <BadgePercent className="h-6 w-6 text-blue-600" />
            Loan Schemes & Interest Rates
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure bank products, interest slabs, loan ranges, and tenure underwriting rules.
          </p>
        </div>
        <button
          onClick={() => {
            resetForm()
            setIsAddOpen(true)
          }}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm shadow-blue-500/20 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>New Scheme</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">Bank:</span>
          <select
            value={selectedBankId}
            onChange={(e) => {
              setSelectedBankId(e.target.value)
              setPage(1)
            }}
            className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-white text-slate-700"
          >
            <option value="">All Partner Banks</option>
            {banksData?.items.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">Category:</span>
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value)
              setPage(1)
            }}
            className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-white text-slate-700"
          >
            <option value="">All Loan Types</option>
            {LOAN_TYPE_OPTIONS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Schemes Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <SkeletonTable rows={6} cols={6} />
        ) : schemesData && schemesData.items.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase border-b border-slate-200 font-semibold">
                <tr>
                  <th className="py-3 px-4">Scheme Name</th>
                  <th className="py-3 px-4">Bank</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Interest Rate</th>
                  <th className="py-3 px-4">Amount Range</th>
                  <th className="py-3 px-4">Tenure</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {schemesData.items.map((scheme) => (
                  <tr key={scheme.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <div>
                        <span className="font-bold text-slate-900 block text-sm">
                          {scheme.scheme_name}
                        </span>
                        {scheme.eligibility_info && (
                          <span className="text-[10px] text-slate-400 block max-w-xs truncate">
                            {scheme.eligibility_info}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-700">
                      {scheme.bank_name || 'Bank'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">{scheme.loan_category}</td>
                    <td className="py-3.5 px-4">
                      <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                        {scheme.interest_rate}% p.a.
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 font-medium">
                      ₹{scheme.min_amount.toLocaleString('en-IN')} – ₹{scheme.max_amount.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-mono">
                      {scheme.min_tenure_months} – {scheme.max_tenure_months} mo
                    </td>
                    <td className="py-3.5 px-4">
                      {scheme.is_active ? (
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Active
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(scheme)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => toggleStatusMutation.mutate(scheme.id)}
                          className="px-2 py-1 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-md"
                        >
                          {scheme.is_active ? 'Deactivate' : 'Activate'}
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
            title="No loan schemes registered"
            description="Create your first bank loan scheme configuration."
            action={{ label: 'New Scheme', onClick: () => setIsAddOpen(true) }}
          />
        )}

        <Pagination
          currentPage={page}
          totalPages={schemesData?.pages || 1}
          totalItems={schemesData?.total || 0}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={(newSize) => {
            setPageSize(newSize)
            setPage(1)
          }}
        />
      </div>

      {/* Add / Edit Scheme Modal */}
      <Modal
        isOpen={isAddOpen || !!editingScheme}
        onClose={() => {
          setIsAddOpen(false)
          setEditingScheme(null)
        }}
        title={editingScheme ? 'Edit Loan Scheme' : 'Create Loan Scheme'}
        subtitle="Specify underwriting eligibility and interest rates"
        maxWidth="lg"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault()
            const payload = {
              ...formData,
              min_amount: Number(formData.min_amount),
              max_amount: Number(formData.max_amount),
              interest_rate: Number(formData.interest_rate),
              min_tenure_months: Number(formData.min_tenure_months),
              max_tenure_months: Number(formData.max_tenure_months),
            }
            if (editingScheme) {
              updateMutation.mutate({ id: editingScheme.id, data: payload })
            } else {
              createMutation.mutate(payload)
            }
          }}
          className="space-y-4 text-xs"
        >
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Partner Bank *</label>
              <select
                required
                value={formData.bank_id}
                onChange={(e) => setFormData({ ...formData, bank_id: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 bg-white"
              >
                <option value="">Select Bank</option>
                {banksData?.items.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Loan Category *</label>
              <select
                value={formData.loan_category}
                onChange={(e) => setFormData({ ...formData, loan_category: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 bg-white"
              >
                {LOAN_TYPE_OPTIONS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Scheme Name *</label>
            <input
              type="text"
              required
              value={formData.scheme_name}
              onChange={(e) => setFormData({ ...formData, scheme_name: e.target.value })}
              placeholder="e.g. Express Personal Sanction"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Min Amount (₹) *</label>
              <input
                type="number"
                required
                value={formData.min_amount}
                onChange={(e) => setFormData({ ...formData, min_amount: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Max Amount (₹) *</label>
              <input
                type="number"
                required
                value={formData.max_amount}
                onChange={(e) => setFormData({ ...formData, max_amount: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Interest Rate (%) *</label>
              <input
                type="number"
                step="0.01"
                required
                value={formData.interest_rate}
                onChange={(e) => setFormData({ ...formData, interest_rate: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Min Tenure (Months)</label>
              <input
                type="number"
                value={formData.min_tenure_months}
                onChange={(e) => setFormData({ ...formData, min_tenure_months: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Max Tenure (Months)</label>
              <input
                type="number"
                value={formData.max_tenure_months}
                onChange={(e) => setFormData({ ...formData, max_tenure_months: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Eligibility Criteria</label>
            <textarea
              rows={2}
              value={formData.eligibility_info}
              onChange={(e) => setFormData({ ...formData, eligibility_info: e.target.value })}
              placeholder="e.g. Min monthly salary ₹25,000; CIBIL score 700+"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => {
                setIsAddOpen(false)
                setEditingScheme(null)
              }}
              className="px-3 py-1.5 border border-slate-200 rounded-lg text-slate-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg"
            >
              {editingScheme ? 'Save Changes' : 'Create Scheme'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
