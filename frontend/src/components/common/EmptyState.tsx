import React from 'react'
import { FolderOpen } from 'lucide-react'

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-4">
        {icon || <FolderOpen className="h-6 w-6" />}
      </div>
      <h3 className="text-base font-semibold text-slate-900">{title}</h3>
      {description && <p className="text-sm text-slate-500 max-w-sm mt-1 mb-5">{description}</p>}
      {action && (
        <button
          onClick={action.onClick}
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-blue-700 rounded-lg shadow-sm transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  )
}
