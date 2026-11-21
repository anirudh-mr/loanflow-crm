import React from 'react'
import { STATUS_COLORS, PRIORITY_COLORS } from '@/utils/constants'

interface StatusBadgeProps {
  status: string
  className?: string
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  const normStatus = (status || '').toLowerCase().replace(/ /g, '_')
  const style = STATUS_COLORS[normStatus] || {
    bg: 'bg-slate-100',
    text: 'text-slate-700',
    border: 'border-slate-200',
  }

  const formattedLabel = normStatus
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${style.bg} ${style.text} ${style.border} ${className}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${style.text.replace('text-', 'bg-')}`} />
      {formattedLabel}
    </span>
  )
}

interface PriorityBadgeProps {
  priority: string
  className?: string
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority, className = '' }) => {
  const normPrio = (priority || '').toLowerCase()
  const style = PRIORITY_COLORS[normPrio] || {
    bg: 'bg-slate-100',
    text: 'text-slate-700',
  }

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold capitalize ${style.bg} ${style.text} ${className}`}
    >
      {priority}
    </span>
  )
}

export const Badge = StatusBadge
export default StatusBadge
