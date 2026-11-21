import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Building2, Plus, Edit2, CheckCircle, XCircle, Phone, Mail } from 'lucide-react'
import { apiClient } from '@/services/api'
import { Bank, PaginatedResponse } from '@/types'
import { Pagination } from '@/components/common/Pagination'
import { Modal } from '@/components/common/Modal'
import { SkeletonTable } from '@/components/common/LoadingSkeleton'
import { EmptyState } from '@/components/common/EmptyState'

export const BankManagement: React.FC = () => {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)

  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [editingBank, setEditingBank] = useState<Bank | null>(null)

  // Form
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    contact_person: '',
    contact_email: '',
    contact_phone: '',
  })

  // 1. Fetch Banks
  const { data: banksData, isLoading } = useQuery<PaginatedResponse<Bank>>({
    queryKey: ['adminBanks', page, pageSize],
    queryFn: () => apiClient.get<PaginatedResponse<Bank>>('/banks', { page, page_size: pageSize }),
  })

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: any) => apiClient.post('/banks', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminBanks'] })
      setIsAddOpen(false)
      resetForm()
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => apiClient.put(`/banks/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminBanks'] })
      setEditingBank(null)
      resetForm()
    },
  })

  const toggleStatusMutation = useMutation({
    mutationFn: (id: string) => apiClient.patch(`/banks/${id}/toggle-status`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminBanks'] })
    },
  })

  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      contact_person: '',
      contact_email: '',
      contact_phone: '',
    })
  }

  const handleOpenEdit = (bank: Bank) => {
    setEditingBank(bank)
    setFormData({
      name: bank.name,
      code: bank.code,
      contact_person: bank.contact_person || '',
      contact_email: bank.contact_email || '',
      contact_phone: bank.contact_phone || '',
    })
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Building2 className="h-6 w-6 text-blue-600" />
            Partner Banks
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Lending financial institutions and institutional credit partners.
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
          <span>Add Bank</span>
        </button>
      </div>

      {/* Banks Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <SkeletonTable rows={5} cols={5} />
        ) : banksData && banksData.items.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase border-b border-slate-200 font-semibold">
                <tr>
                  <th className="py-3 px-4">Bank Name</th>
                  <th className="py-3 px-4">IFSC / Code</th>
                  <th className="py-3 px-4">Contact Person</th>
                  <th className="py-3 px-4">Contact Info</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {banksData.items.map((bank) => (
                  <tr key={bank.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900 text-sm">{bank.name}</td>
                    <td className="py-3.5 px-4 font-mono font-medium text-blue-700">{bank.code}</td>
                    <td className="py-3.5 px-4 text-slate-700">{bank.contact_person || '—'}</td>
                    <td className="py-3.5 px-4 text-slate-600">
                      <div className="space-y-0.5">
                        {bank.contact_email && (
                          <span className="flex items-center gap-1">
                            <Mail className="h-3 w-3 text-slate-400" />
                            {bank.contact_email}
                          </span>
                        )}
                        {bank.contact_phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3 text-slate-400" />
                            {bank.contact_phone}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      {bank.is_active ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(bank)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                          title="Edit Bank"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => toggleStatusMutation.mutate(bank.id)}
                          className="px-2 py-1 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-md"
                        >
                          {bank.is_active ? 'Deactivate' : 'Activate'}
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
            title="No banks registered"
            description="Add your first lending institution partner."
            action={{ label: 'Add Bank', onClick: () => setIsAddOpen(true) }}
          />
        )}

        <Pagination
          currentPage={page}
          totalPages={banksData?.pages || 1}
          totalItems={banksData?.total || 0}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={(newSize) => {
            setPageSize(newSize)
            setPage(1)
          }}
        />
      </div>

      {/* Add / Edit Bank Modal */}
      <Modal
        isOpen={isAddOpen || !!editingBank}
        onClose={() => {
          setIsAddOpen(false)
          setEditingBank(null)
        }}
        title={editingBank ? 'Edit Partner Bank' : 'Register Partner Bank'}
        subtitle="Manage bank identity and institutional contact points"
        maxWidth="md"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault()
            if (editingBank) {
              updateMutation.mutate({ id: editingBank.id, data: formData })
            } else {
              createMutation.mutate(formData)
            }
          }}
          className="space-y-4 text-xs"
        >
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Bank Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. HDFC Bank"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Bank Code / IFSC Prefix *</label>
            <input
              type="text"
              required
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              placeholder="e.g. HDFC001"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 uppercase font-mono"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Key Contact Person</label>
            <input
              type="text"
              value={formData.contact_person}
              onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
              placeholder="Relationship Manager Name"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Contact Email</label>
              <input
                type="email"
                value={formData.contact_email}
                onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                placeholder="loans@bank.com"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Contact Phone</label>
              <input
                type="text"
                value={formData.contact_phone}
                onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                placeholder="+91 22 0000 0000"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => {
                setIsAddOpen(false)
                setEditingBank(null)
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
              {editingBank ? 'Save Changes' : 'Register Bank'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
