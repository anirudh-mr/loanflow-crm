import React from 'react'
import { ShieldCheck, Smartphone, PhoneCall, TrendingUp } from 'lucide-react'

export interface RoleConfig {
  id: string
  label: string
  email: string
  description: string
  isMobile?: boolean
  icon: React.ReactNode
}

export const ROLES: RoleConfig[] = [
  {
    id: 'admin',
    label: 'Admin',
    email: 'admin@loanflow.demo',
    description: 'Executive oversight, lending targets & bank partner routing',
    icon: <ShieldCheck className="w-3.5 h-3.5" />,
  },
  {
    id: 'mobile-admin',
    label: 'Mobile Admin',
    email: 'admin@loanflow.demo',
    isMobile: true,
    description: 'Mobile cockpit for on-the-go supervisor review & approvals',
    icon: <Smartphone className="w-3.5 h-3.5" />,
  },
  {
    id: 'agent',
    label: 'Agent',
    email: 'staff1@loanflow.demo',
    description: '100 calls/day tele-calling desk, lead updates & follow-ups',
    icon: <PhoneCall className="w-3.5 h-3.5" />,
  },
  {
    id: 'kyc-agent',
    label: 'KYC Agent',
    email: 'staff2@loanflow.demo',
    description: 'Document verification, KYC checks & loan application underwriting',
    icon: <TrendingUp className="w-3.5 h-3.5" />,
  },
]

interface RoleTabsProps {
  selectedRole: string
  onSelectRole: (role: RoleConfig) => void
  className?: string
}

export const RoleTabs: React.FC<RoleTabsProps> = ({
  selectedRole,
  onSelectRole,
  className = '',
}) => {
  const activeRole = ROLES.find((r) => r.id === selectedRole) || ROLES[0]

  return (
    <div className={`space-y-2.5 ${className}`}>
      {/* Segmented Control / Pill Tabs */}
      <div
        role="tablist"
        aria-label="Select Demo Role"
        className="p-1 rounded-2xl bg-white/[0.03] border border-white/[0.08] grid grid-cols-2 sm:grid-cols-4 gap-1 backdrop-blur-md"
      >
        {ROLES.map((role) => {
          const isSelected = selectedRole === role.id
          return (
            <button
              key={role.id}
              role="tab"
              type="button"
              id={`tab-${role.id}`}
              aria-selected={isSelected}
              aria-controls={`panel-${role.id}`}
              onClick={() => onSelectRole(role)}
              className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl text-xs font-medium transition-all duration-200 select-none ${
                isSelected
                  ? 'bg-indigo-600/30 text-white border border-indigo-500/40 shadow-[0_0_12px_rgba(99,102,241,0.25)]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04] border border-transparent'
              }`}
            >
              <span className={isSelected ? 'text-cyan-400' : 'text-slate-500'}>
                {role.icon}
              </span>
              <span className="whitespace-nowrap">{role.label}</span>
            </button>
          )
        })}
      </div>

      {/* Role Description - Exactly One Line, Clean Sans-Serif */}
      <div
        id={`panel-${activeRole.id}`}
        role="tabpanel"
        aria-labelledby={`tab-${activeRole.id}`}
        className="text-[12px] text-slate-400 text-center font-normal px-2 truncate transition-opacity duration-200"
      >
        {activeRole.description}
      </div>
    </div>
  )
}

export default RoleTabs
