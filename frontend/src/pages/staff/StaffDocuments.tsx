import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  FileCheck2,
  UploadCloud,
  FileText,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  Download,
  AlertCircle,
  File,
  User,
} from 'lucide-react'
import { apiClient } from '@/services/api'
import { Document, PaginatedResponse, Lead } from '@/types'
import { Badge } from '@/components/common/Badge'
import { Modal } from '@/components/common/Modal'
import { Pagination } from '@/components/common/Pagination'
import { EmptyState } from '@/components/common/EmptyState'
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton'
import { DOCUMENT_CATEGORY_OPTIONS } from '@/utils/constants'

export const StaffDocuments: React.FC = () => {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [categoryFilter, setCategoryFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  // Upload Modal State
  const [isUploadOpen, setIsUploadOpen] = useState(false)
  const [selectedLeadId, setSelectedLeadId] = useState('')
  const [category, setCategory] = useState('aadhaar')
  const [file, setFile] = useState<File | null>(null)
  const [uploadError, setUploadError] = useState('')

  // Fetch Documents
  const { data: documentsData, isLoading } = useQuery<PaginatedResponse<Document>>({
    queryKey: ['staffDocuments', page, categoryFilter, statusFilter],
    queryFn: () =>
      apiClient.get<PaginatedResponse<Document>>('/documents', {
        page,
        page_size: 15,
        ...(categoryFilter ? { category: categoryFilter } : {}),
        ...(statusFilter ? { status: statusFilter } : {}),
      }),
  })

  // Fetch Assigned Leads for Dropdown
  const { data: leadsData } = useQuery<PaginatedResponse<Lead>>({
    queryKey: ['staffAssignedLeadsForDocs'],
    queryFn: () => apiClient.get<PaginatedResponse<Lead>>('/leads?page=1&page_size=100'),
    enabled: isUploadOpen,
  })

  // Upload Mutation
  const uploadMutation = useMutation({
    mutationFn: (formData: FormData) => apiClient.upload('/documents/upload', formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staffDocuments'] })
      queryClient.invalidateQueries({ queryKey: ['staffDashboardStats'] })
      setIsUploadOpen(false)
      setSelectedLeadId('')
      setCategory('aadhaar')
      setFile(null)
      setUploadError('')
    },
    onError: (err: any) => {
      setUploadError(err.response?.data?.detail || 'Failed to upload document.')
    },
  })

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setUploadError('')
    if (!selectedLeadId) {
      setUploadError('Please select a customer lead.')
      return
    }
    if (!file) {
      setUploadError('Please select a file to upload.')
      return
    }

    const formData = new FormData()
    formData.append('lead_id', selectedLeadId)
    formData.append('category', category)
    formData.append('file', file)

    uploadMutation.mutate(formData)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const handleDownload = (docId: string, filename: string) => {
    const token = localStorage.getItem('access_token')
    const url = `/api/v1/documents/${docId}/download`
    fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error('Download failed')
        return res.blob()
      })
      .then((blob) => {
        const link = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = link
        a.download = filename
        document.body.appendChild(a)
        a.click()
        a.remove()
      })
      .catch((err) => {
        console.error('Download error:', err)
      })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Customer KYC & Documents</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Collect, verify, and submit loan-related borrower documents directly to the admin underwriting team.
          </p>
        </div>

        <button
          onClick={() => setIsUploadOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-medium text-xs rounded-xl transition shadow-sm"
        >
          <UploadCloud className="h-4 w-4" />
          Upload Customer Document
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-slate-400" />
            <span className="text-xs font-semibold text-slate-500 uppercase">Category:</span>
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value)
              setPage(1)
            }}
            className="text-xs border border-slate-300 rounded-lg px-3 py-1.5 bg-slate-50 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">All Categories</option>
            {DOCUMENT_CATEGORY_OPTIONS.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>

          <span className="text-xs font-semibold text-slate-500 uppercase ml-2">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value)
              setPage(1)
            }}
            className="text-xs border border-slate-300 rounded-lg px-3 py-1.5 bg-slate-50 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending Verification</option>
            <option value="verified">Verified</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        <div className="text-xs text-slate-500">
          Showing <span className="font-semibold text-slate-800">{documentsData?.total || 0}</span> files
        </div>
      </div>

      {/* Documents Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-6">
            <LoadingSkeleton count={6} />
          </div>
        ) : !documentsData || documentsData.items.length === 0 ? (
          <EmptyState
            title="No documents uploaded"
            description="You have not uploaded any customer KYC documents yet. Once customers share their proofs, upload them here."
            action={{
              label: 'Upload First Document',
              onClick: () => setIsUploadOpen(true),
            }}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Document / File</th>
                  <th className="py-3 px-4">Customer Lead</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Size</th>
                  <th className="py-3 px-4">Verification Status</th>
                  <th className="py-3 px-4">Uploaded At</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {documentsData.items.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 shrink-0">
                          <FileText className="h-4 w-4" />
                        </div>
                        <div className="truncate max-w-[200px]">
                          <div className="font-semibold text-slate-900 truncate" title={doc.file_name}>
                            {doc.file_name}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono uppercase">
                            {doc.mime_type.split('/')[1] || 'FILE'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900">{doc.customer_name || 'Customer'}</div>
                    </td>
                    <td className="py-3.5 px-4 capitalize font-medium text-slate-800">
                      {doc.category.replace('_', ' ')}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-500">
                      {formatFileSize(doc.file_size)}
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge status={doc.verification_status} />
                      {doc.rejection_remarks && (
                        <div className="text-[11px] text-rose-600 mt-1 max-w-xs bg-rose-50 p-1.5 rounded border border-rose-200">
                          <strong className="font-semibold">Rejection Note:</strong> {doc.rejection_remarks}
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                      {new Date(doc.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleDownload(doc.id, doc.file_name)}
                        className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition inline-flex items-center gap-1 text-xs"
                        title="Download / View"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {documentsData && documentsData.pages > 1 && (
          <div className="p-4 border-t border-slate-200">
            <Pagination
              currentPage={page}
              totalPages={documentsData.pages}
              onPageChange={setPage}
            />
          </div>
        )}
      </div>

      {/* Upload Document Modal */}
      <Modal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        title="Upload Customer KYC Document"
        size="md"
      >
        <form onSubmit={handleUploadSubmit} className="space-y-4">
          {uploadError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{uploadError}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Select Customer Lead <span className="text-rose-500">*</span>
            </label>
            <select
              value={selectedLeadId}
              onChange={(e) => setSelectedLeadId(e.target.value)}
              className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 bg-slate-50 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
            >
              <option value="">-- Choose from your assigned leads --</option>
              {leadsData?.items.map((lead) => (
                <option key={lead.id} value={lead.id}>
                  {lead.customer_name} ({lead.phone}) - {lead.loan_type}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Document Category <span className="text-rose-500">*</span>
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 bg-slate-50 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
            >
              {DOCUMENT_CATEGORY_OPTIONS.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Attach File <span className="text-rose-500">*</span>
            </label>
            <div className="border-2 border-dashed border-slate-300 rounded-xl p-5 text-center hover:border-emerald-500 transition bg-slate-50/50">
              <input
                type="file"
                id="doc-file-input"
                className="hidden"
                accept=".pdf,.png,.jpg,.jpeg"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setFile(e.target.files[0])
                  }
                }}
              />
              <label htmlFor="doc-file-input" className="cursor-pointer block">
                <UploadCloud className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                {file ? (
                  <div>
                    <div className="font-semibold text-xs text-slate-800">{file.name}</div>
                    <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                      {formatFileSize(file.size)}
                    </div>
                  </div>
                ) : (
                  <div>
                    <span className="text-xs font-medium text-emerald-600 hover:text-emerald-700">
                      Click to browse file
                    </span>
                    <p className="text-[11px] text-slate-400 mt-1">PDF, JPG, PNG up to 10MB</p>
                  </div>
                )}
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsUploadOpen(false)}
              className="px-4 py-2 border border-slate-300 text-slate-700 text-xs font-medium rounded-lg hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploadMutation.isPending || !selectedLeadId || !file}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium rounded-lg disabled:opacity-50"
            >
              {uploadMutation.isPending ? 'Uploading...' : 'Upload Document'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
