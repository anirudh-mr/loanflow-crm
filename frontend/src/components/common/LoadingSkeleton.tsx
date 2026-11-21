import React from 'react'

export const SkeletonTable: React.FC<{ rows?: number; cols?: number }> = ({
  rows = 5,
  cols = 5,
}) => {
  return (
    <div className="w-full animate-pulse">
      <div className="h-10 bg-slate-100 rounded-t-lg mb-2" />
      {Array.from({ length: rows }).map((_, rIdx) => (
        <div key={rIdx} className="flex gap-4 py-3 border-b border-slate-100 px-4">
          {Array.from({ length: cols }).map((_, cIdx) => (
            <div
              key={cIdx}
              className="h-4 bg-slate-200/70 rounded flex-1"
              style={{ maxWidth: cIdx === 0 ? '180px' : undefined }}
            />
          ))}
        </div>
      ))}
    </div>
  )
}

export const SkeletonCard: React.FC = () => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm animate-pulse space-y-3">
      <div className="h-4 bg-slate-200 rounded w-1/3" />
      <div className="h-8 bg-slate-300 rounded w-1/2" />
      <div className="h-3 bg-slate-100 rounded w-2/3" />
    </div>
  )
}

export const LoadingSkeleton: React.FC<{ count?: number; className?: string }> = ({
  count = 3,
  className = '',
}) => {
  return (
    <div className={`space-y-3 animate-pulse ${className}`}>
      {Array.from({ length: count }).map((_, idx) => (
        <div key={idx} className="bg-slate-100/80 rounded-xl p-4 border border-slate-200/60 space-y-2">
          <div className="h-4 bg-slate-200 rounded w-1/4" />
          <div className="h-3 bg-slate-200/70 rounded w-3/4" />
        </div>
      ))}
    </div>
  )
}

export default LoadingSkeleton
