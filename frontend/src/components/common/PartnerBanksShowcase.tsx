import React, { useState } from 'react'
import { Landmark, ArrowUpRight, ShieldCheck, CheckCircle2, Zap } from 'lucide-react'
import { BankLogo, BankIdentifier } from './BankLogo'

export interface InstitutionalBank {
  id: BankIdentifier
  name: string
  code: string
  category: string
  roi: string
  sla: string
  maxTenure: string
  features: string[]
}

export const INSTITUTIONAL_BANKS: InstitutionalBank[] = [
  {
    id: 'hdfc',
    name: 'HDFC Bank',
    code: 'HDFC001',
    category: 'Private Tier-1',
    roi: '10.5% p.a.',
    sla: '30 mins',
    maxTenure: '60 months',
    features: ['Quick Personal Loan', 'Reach Home Loan', 'Instant Pre-Approval'],
  },
  {
    id: 'sbi',
    name: 'State Bank of India',
    code: 'SBIN001',
    category: 'Govt. Apex Tier-1',
    roi: '8.4% p.a.',
    sla: '2 hours',
    maxTenure: '360 months',
    features: ['Regular Home Loan', 'SME Smart Score', 'Zero Women Surcharge'],
  },
  {
    id: 'icici',
    name: 'ICICI Bank',
    code: 'ICIC001',
    category: 'Private Tier-1',
    roi: '8.75% p.a.',
    sla: '15 mins',
    maxTenure: '84 months',
    features: ['Express Car Loan', 'Instant Business Installment', '100% On-Road'],
  },
  {
    id: 'axis',
    name: 'Axis Bank',
    code: 'UTIB001',
    category: 'Private Tier-1',
    roi: '10.75% p.a.',
    sla: '45 mins',
    maxTenure: '60 months',
    features: ['24x7 Digital Personal Loan', 'Burgundy Wealth Credit', 'Instant Disbursal'],
  },
  {
    id: 'kotak',
    name: 'Kotak Mahindra Bank',
    code: 'KKBK001',
    category: 'Private Commercial',
    roi: '11.5% p.a.',
    sla: '60 mins',
    maxTenure: '48 months',
    features: ['Smart Business Loan', 'Collateral-free to ₹50L', 'Fast-Track Underwriting'],
  },
  {
    id: 'baroda',
    name: 'Bank of Baroda',
    code: 'BARB001',
    category: 'Public Sector Apex',
    roi: '8.6% p.a.',
    sla: '3 hours',
    maxTenure: '240 months',
    features: ['Baroda Advantage Home', 'MSME Pragati Scheme', 'Govt Subsidies'],
  },
  {
    id: 'pnb',
    name: 'Punjab National Bank',
    code: 'PUNB001',
    category: 'Public Sector Apex',
    roi: '8.8% p.a.',
    sla: '4 hours',
    maxTenure: '180 months',
    features: ['PNB Max Home', 'Agriculture & Rural Credit', 'Direct API Sanction'],
  },
  {
    id: 'idfc',
    name: 'IDFC FIRST Bank',
    code: 'IDFB001',
    category: 'Digital Commercial',
    roi: '10.99% p.a.',
    sla: '10 mins',
    maxTenure: '60 months',
    features: ['Paperless Digital Loans', 'Monthly Rest Interest', 'Zero Foreclosure Fee'],
  },
]

interface PartnerBanksShowcaseProps {
  variant?: 'grid' | 'ticker' | 'compact-dock'
  className?: string
  onSelectBank?: (bank: InstitutionalBank) => void
}

export const PartnerBanksShowcase: React.FC<PartnerBanksShowcaseProps> = ({
  variant = 'compact-dock',
  className = '',
  onSelectBank,
}) => {
  const [activeBank, setActiveBank] = useState<InstitutionalBank>(INSTITUTIONAL_BANKS[0])

  if (variant === 'ticker') {
    return (
      <div className={`w-full overflow-hidden py-3 border-y border-slate-200/80 bg-white/70 backdrop-blur-md ${className}`}>
        <div className="flex items-center gap-8 animate-marquee whitespace-nowrap">
          {INSTITUTIONAL_BANKS.concat(INSTITUTIONAL_BANKS).map((bank, idx) => (
            <div
              key={`${bank.id}-${idx}`}
              className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-50/90 border border-slate-200/70 hover:border-slate-300 transition-colors shadow-2xs"
            >
              <BankLogo bank={bank.id} variant="icon" size="sm" />
              <div className="text-left">
                <span className="text-xs font-bold text-slate-800">{bank.name}</span>
                <span className="block text-[9px] font-mono text-emerald-700">ROI {bank.roi} • {bank.sla}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (variant === 'grid') {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Landmark className="h-4 w-4 text-slate-700" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 font-mono">
              Institutional Underwriting Partners (8 Banks)
            </h3>
          </div>
          <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Direct ISO-20022 Core Integration
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {INSTITUTIONAL_BANKS.map((b) => (
            <div
              key={b.id}
              onClick={() => {
                setActiveBank(b)
                onSelectBank?.(b)
              }}
              className="group cursor-pointer p-3 rounded-xl bg-white border border-slate-200/90 hover:border-slate-400 hover:shadow-xs transition-all duration-200 text-left"
            >
              <div className="flex items-center justify-between mb-2">
                <BankLogo bank={b.id} variant="icon" size="md" />
                <span className="text-[9px] font-mono font-semibold text-slate-400 group-hover:text-slate-700 transition-colors">
                  {b.code}
                </span>
              </div>
              <div className="font-bold text-xs text-slate-900 group-hover:text-slate-800 transition-colors truncate">
                {b.name}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5 truncate">
                Starting {b.roi}
              </div>
              <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[9px] font-mono text-slate-400">
                <span>SLA: {b.sla}</span>
                <span className="text-emerald-700 font-medium">Active</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Compact Dock (optimized for Left Column hero of Login page)
  return (
    <div className={`space-y-3.5 bg-white/90 backdrop-blur-xl rounded-2xl border border-slate-200/90 p-4 shadow-xs ${className}`}>
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-slate-900 text-white">
            <Landmark className="h-3.5 w-3.5" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900 tracking-tight">Institutional Bank Partners</div>
            <div className="text-[10px] text-slate-500 font-mono">Direct Loan Routing & Credit Underwriting</div>
          </div>
        </div>
        <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-[10px] font-mono text-emerald-800">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>8 Core APIs</span>
        </div>
      </div>

      {/* Quick Select Bank Logo Grid */}
      <div className="grid grid-cols-4 gap-2">
        {INSTITUTIONAL_BANKS.map((b) => {
          const isSelected = activeBank.id === b.id
          return (
            <button
              key={b.id}
              type="button"
              onClick={() => {
                setActiveBank(b)
                onSelectBank?.(b)
              }}
              className={`p-2 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all text-center group ${
                isSelected
                  ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                  : 'bg-slate-50/80 hover:bg-slate-100/90 border-slate-200 text-slate-700'
              }`}
            >
              <BankLogo bank={b.id} variant="icon" size="sm" />
              <span className={`text-[10px] font-bold tracking-tight truncate w-full ${isSelected ? 'text-white' : 'text-slate-800'}`}>
                {b.name.replace(' Bank', '')}
              </span>
              <span className={`text-[8px] font-mono ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                {b.roi.split(' ')[0]}
              </span>
            </button>
          )
        })}
      </div>

      {/* Selected Bank Live Telemetry Snippet */}
      <div className="rounded-xl bg-slate-50 border border-slate-200/80 p-2.5 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <BankLogo bank={activeBank.id} variant="icon" size="sm" />
          <div>
            <div className="font-bold text-slate-900 text-[11px] leading-tight">
              {activeBank.name} Schemes
            </div>
            <div className="text-[10px] text-slate-500 font-mono">
              {activeBank.features[0]} • Up to {activeBank.maxTenure}
            </div>
          </div>
        </div>
        <div className="text-right font-mono">
          <div className="text-[11px] font-bold text-emerald-700">{activeBank.sla} SLA</div>
          <div className="text-[9px] text-slate-400">Direct Sanction</div>
        </div>
      </div>
    </div>
  )
}

export default PartnerBanksShowcase
