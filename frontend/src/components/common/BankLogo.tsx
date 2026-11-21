import React from 'react'

export type BankIdentifier =
  | 'hdfc'
  | 'sbi'
  | 'icici'
  | 'axis'
  | 'kotak'
  | 'bob'
  | 'pnb'
  | 'idfc'
  | string

interface BankLogoProps {
  bank: BankIdentifier
  variant?: 'full' | 'icon' | 'badge'
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  showStatus?: boolean
}

export const BankLogo: React.FC<BankLogoProps> = ({
  bank,
  variant = 'full',
  size = 'md',
  className = '',
  showStatus = false,
}) => {
  const norm = (bank || '').toLowerCase().trim()

  const sizeClasses = {
    xs: { icon: 'w-4 h-4', box: 'h-6', text: 'text-[10px]', sub: 'text-[8px]' },
    sm: { icon: 'w-5 h-5', box: 'h-7', text: 'text-xs', sub: 'text-[9px]' },
    md: { icon: 'w-6 h-6', box: 'h-9', text: 'text-xs font-semibold', sub: 'text-[10px]' },
    lg: { icon: 'w-8 h-8', box: 'h-11', text: 'text-sm font-bold', sub: 'text-[11px]' },
    xl: { icon: 'w-10 h-10', box: 'h-14', text: 'text-base font-bold', sub: 'text-xs' },
  }[size]

  // Render authentic vector emblem for each bank
  const renderEmblem = () => {
    if (norm.includes('hdfc')) {
      return (
        <div className={`relative shrink-0 flex items-center justify-center rounded-lg bg-[#004c8f] p-1 shadow-xs text-white ${sizeClasses.icon}`}>
          <svg viewBox="0 0 40 40" className="w-full h-full" fill="none">
            {/* HDFC Iconic Blue Block with White Inner Border & Red Core */}
            <rect width="40" height="40" rx="6" fill="#004c8f" />
            <rect x="6" y="6" width="28" height="28" rx="2" fill="#ffffff" />
            <rect x="14" y="6" width="12" height="28" fill="#004c8f" />
            <rect x="6" y="14" width="28" height="12" fill="#004c8f" />
            <rect x="14" y="14" width="12" height="12" fill="#ed1c24" />
          </svg>
        </div>
      )
    }

    if (norm.includes('sbi') || norm.includes('state bank')) {
      return (
        <div className={`relative shrink-0 flex items-center justify-center rounded-lg bg-[#1a5ba8] p-1 shadow-xs text-white ${sizeClasses.icon}`}>
          <svg viewBox="0 0 40 40" className="w-full h-full" fill="none">
            {/* SBI Iconic Royal Blue Circle with Keyhole Notch */}
            <circle cx="20" cy="20" r="18" fill="#1a5ba8" />
            <circle cx="20" cy="20" r="14" fill="#2882d8" />
            <circle cx="20" cy="18" r="5" fill="#ffffff" />
            <rect x="18.5" y="18" width="3" height="15" fill="#ffffff" />
          </svg>
        </div>
      )
    }

    if (norm.includes('icici')) {
      return (
        <div className={`relative shrink-0 flex items-center justify-center rounded-lg bg-[#8b151b] p-1 shadow-xs text-white ${sizeClasses.icon}`}>
          <svg viewBox="0 0 40 40" className="w-full h-full" fill="none">
            {/* ICICI Rich Maroon / Orange Flame 'i' */}
            <rect width="40" height="40" rx="8" fill="#8b151b" />
            <circle cx="20" cy="12" r="3.5" fill="#f58220" />
            <path
              d="M17 19H23V31H17V19Z"
              fill="#ffffff"
            />
            <path
              d="M11 25C11 19 15 15 21 15C26 15 29 18 29 22C29 28 23 32 17 32"
              stroke="#f58220"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </svg>
        </div>
      )
    }

    if (norm.includes('axis')) {
      return (
        <div className={`relative shrink-0 flex items-center justify-center rounded-lg bg-[#97144d] p-1 shadow-xs text-white ${sizeClasses.icon}`}>
          <svg viewBox="0 0 40 40" className="w-full h-full" fill="none">
            {/* Axis Bank Distinctive Maroon Triangle Chevron */}
            <rect width="40" height="40" rx="8" fill="#97144d" />
            <path
              d="M20 7L31 29H24.5L20 18.5L15.5 29H9L20 7Z"
              fill="#ffffff"
            />
            <path
              d="M20 22L23.5 29H16.5L20 22Z"
              fill="#d63384"
            />
          </svg>
        </div>
      )
    }

    if (norm.includes('kotak')) {
      return (
        <div className={`relative shrink-0 flex items-center justify-center rounded-lg bg-[#da251d] p-1 shadow-xs text-white ${sizeClasses.icon}`}>
          <svg viewBox="0 0 40 40" className="w-full h-full" fill="none">
            {/* Kotak Red Infinity Ribbon Crest */}
            <rect width="40" height="40" rx="8" fill="#da251d" />
            <path
              d="M14 15C11.8 15 10 17 10 20C10 23 11.8 25 14 25C16.8 25 18.5 22.5 20 20C21.5 17.5 23.2 15 26 15C28.2 15 30 17 30 20C30 23 28.2 25 26 25C23.2 25 21.5 22.5 20 20C18.5 17.5 16.8 15 14 15Z"
              stroke="#ffffff"
              strokeWidth="3.2"
              strokeLinecap="round"
            />
            <circle cx="20" cy="20" r="2" fill="#ffffff" />
          </svg>
        </div>
      )
    }

    if (norm.includes('baroda') || norm.includes('bob')) {
      return (
        <div className={`relative shrink-0 flex items-center justify-center rounded-lg bg-[#f26522] p-1 shadow-xs text-white ${sizeClasses.icon}`}>
          <svg viewBox="0 0 40 40" className="w-full h-full" fill="none">
            {/* Bank of Baroda Vermilion Rising Sun Rays */}
            <rect width="40" height="40" rx="8" fill="#f26522" />
            <circle cx="20" cy="20" r="8" fill="#ffffff" />
            <circle cx="20" cy="20" r="5" fill="#f26522" />
            <path d="M20 6V10M20 30V34M6 20H10M30 20H34M10 10L13 13M27 27L30 30M10 30L13 27M27 13L30 10" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        </div>
      )
    }

    if (norm.includes('pnb') || norm.includes('punjab')) {
      return (
        <div className={`relative shrink-0 flex items-center justify-center rounded-lg bg-[#991b1b] p-1 shadow-xs text-white ${sizeClasses.icon}`}>
          <svg viewBox="0 0 40 40" className="w-full h-full" fill="none">
            {/* PNB Classic Medallion */}
            <rect width="40" height="40" rx="8" fill="#991b1b" />
            <circle cx="20" cy="20" r="14" stroke="#fbbf24" strokeWidth="2" />
            <circle cx="20" cy="20" r="10" fill="#fbbf24" />
            <text x="20" y="24" fontSize="10" fontWeight="900" fill="#991b1b" textAnchor="middle" fontFamily="sans-serif">PNB</text>
          </svg>
        </div>
      )
    }

    if (norm.includes('idfc')) {
      return (
        <div className={`relative shrink-0 flex items-center justify-center rounded-lg bg-[#9c182f] p-1 shadow-xs text-white ${sizeClasses.icon}`}>
          <svg viewBox="0 0 40 40" className="w-full h-full" fill="none">
            {/* IDFC FIRST Geometric Blocks */}
            <rect width="40" height="40" rx="8" fill="#9c182f" />
            <rect x="9" y="10" width="10" height="9" rx="1.5" fill="#ffffff" />
            <rect x="21" y="10" width="10" height="9" rx="1.5" fill="#d97706" />
            <rect x="9" y="21" width="10" height="9" rx="1.5" fill="#d97706" />
            <rect x="21" y="21" width="10" height="9" rx="1.5" fill="#ffffff" />
          </svg>
        </div>
      )
    }

    // Generic Institutional Bank Crest
    return (
      <div className={`relative shrink-0 flex items-center justify-center rounded-lg bg-slate-900 p-1 shadow-xs text-white ${sizeClasses.icon}`}>
        <svg viewBox="0 0 40 40" className="w-full h-full" fill="none">
          <rect width="40" height="40" rx="8" fill="#0f172a" />
          <path d="M7 15L20 8L33 15V18H7V15Z" fill="#ffffff" />
          <rect x="10" y="20" width="4" height="10" fill="#94a3b8" />
          <rect x="18" y="20" width="4" height="10" fill="#94a3b8" />
          <rect x="26" y="20" width="4" height="10" fill="#94a3b8" />
          <rect x="7" y="31" width="26" height="3" fill="#ffffff" />
        </svg>
      </div>
    )
  }

  // Get formal display titles
  const getBankDetails = () => {
    if (norm.includes('hdfc')) return { name: 'HDFC Bank', code: 'HDFC001', tag: 'Core Intermediary' }
    if (norm.includes('sbi') || norm.includes('state bank')) return { name: 'State Bank of India', code: 'SBIN001', tag: 'Govt. Tier-1' }
    if (norm.includes('icici')) return { name: 'ICICI Bank', code: 'ICIC001', tag: 'Instant Sanction' }
    if (norm.includes('axis')) return { name: 'Axis Bank', code: 'UTIB001', tag: 'Pre-Approved API' }
    if (norm.includes('kotak')) return { name: 'Kotak Mahindra', code: 'KKBK001', tag: 'Commercial Fast-Track' }
    if (norm.includes('baroda') || norm.includes('bob')) return { name: 'Bank of Baroda', code: 'BARB001', tag: 'National Retail' }
    if (norm.includes('pnb')) return { name: 'Punjab National Bank', code: 'PUNB001', tag: 'Public Sector' }
    if (norm.includes('idfc')) return { name: 'IDFC FIRST Bank', code: 'IDFB001', tag: 'Digital Disbursal' }
    return { name: bank || 'Partner Bank', code: 'BANK001', tag: 'Verified Direct' }
  }

  const details = getBankDetails()

  if (variant === 'icon') {
    return renderEmblem()
  }

  if (variant === 'badge') {
    return (
      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200/90 text-slate-800 ${className}`}>
        {renderEmblem()}
        <span className="font-semibold text-xs tracking-tight">{details.name}</span>
        {showStatus && <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />}
      </div>
    )
  }

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {renderEmblem()}
      <div className="leading-tight truncate">
        <div className={`text-slate-900 tracking-tight flex items-center gap-1.5 ${sizeClasses.text}`}>
          <span className="truncate">{details.name}</span>
          {showStatus && (
            <span className="inline-flex items-center gap-1 text-[9px] font-mono text-emerald-700 bg-emerald-50 px-1 py-0.5 rounded border border-emerald-200">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              API Active
            </span>
          )}
        </div>
        <div className={`text-slate-500 font-mono tracking-wider flex items-center gap-1.5 ${sizeClasses.sub}`}>
          <span>{details.code}</span>
          <span>•</span>
          <span className="text-slate-600 font-sans">{details.tag}</span>
        </div>
      </div>
    </div>
  )
}

export default BankLogo
