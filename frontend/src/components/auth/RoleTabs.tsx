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
    icon: <ShieldCheck className="w-3.5 h-3.5 stroke-[1.75]" />,
  },
  {
    id: 'mobile-admin',
    label: 'Mobile Admin',
    email: 'admin@loanflow.demo',
    isMobile: true,
    description: 'Mobile cockpit for on-the-go supervisor review & approvals',
    icon: <Smartphone className="w-3.5 h-3.5 stroke-[1.75]" />,
  },
  {
    id: 'agent',
    label: 'Agent',
    email: 'staff1@loanflow.demo',
    description: '100 calls/day tele-calling desk, customer outreach & loan schemes',
    icon: <PhoneCall className="w-3.5 h-3.5 stroke-[1.75]" />,
  },
  {
    id: 'kyc-agent',
    label: 'KYC Agent',
    email: 'staff2@loanflow.demo',
    description: 'Document verification, KYC collection & loan file underwriting',
    icon: <TrendingUp className="w-3.5 h-3.5 stroke-[1.75]" />,
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
      {/* Segmented Control Track */}
      <div
        role="tablist"
        aria-label="Select Demo Role"
        className="p-1 rounded-2xl bg-[#E2E8F0]/60 border border-slate-300/60 grid grid-cols-2 sm:grid-cols-4 gap-1 select-none backdrop-blur-xs"
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
              className={`relative flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                isSelected
                  ? 'bg-[#0F172A] text-white shadow-xs'
                  : 'text-[#64748B] hover:text-[#0F172A] hover:bg-white/60'
              }`}
            >
              <span className={isSelected ? 'text-white' : 'text-[#64748B]'}>
                {role.icon}
              </span>
              <span className="whitespace-nowrap tracking-tight">{role.label}</span>
            </button>
          )
        })}
      </div>

      {/* Role Description - Exactly One Line, Clean Sans-Serif */}
      <div
        id={`panel-${activeRole.id}`}
        role="tabpanel"
        aria-labelledby={`tab-${activeRole.id}`}
        className="text-[12px] text-[#64748B] text-center font-normal px-2 truncate transition-all duration-200"
      >
        {activeRole.description}
      </div>
    </div>
  )
}

export default RoleTabs
