/**
 * LoanFlow Design Tokens - Aligned with the Institutional Admin Workspace
 * Theme: Soft Cool Mist / Light Alabaster with Slate Navy & Royal Blue Accents
 */
export const themeTokens = {
  colors: {
    // Canvas & Surfaces
    pageBackground: '#F1F3F7',
    pageGradientEnd: '#E8ECF4',
    cardSurface: 'rgba(255, 255, 255, 0.85)',
    cardBorder: 'rgba(15, 23, 42, 0.08)',
    cardShadow: '0 24px 60px -20px rgba(15, 23, 42, 0.25)',

    // Ink / Primary Dark
    primaryDark: '#0F172A', // Navy (Sidebar active state & Distribute Leads button)
    primaryAccent: '#2563EB', // Blue (Chart lines & interactive highlights)

    // Text System
    textPrimary: '#0F172A',
    textSecondary: '#64748B',
    textMuted: '#94A3B8',

    // Form Controls
    inputBg: '#F8FAFC',
    inputBorder: '#E2E8F0',
    inputFocusRing: 'rgba(37, 99, 235, 0.30)',
    inputFocusBorder: '#2563EB',

    // Tiny Status Accents
    status: {
      green: '#059669',
      amber: '#D97706',
      purple: '#7C3AED',
      error: '#DC2626',
    },

    // Demo Mode Chip
    demoChip: {
      bg: '#EFF6FF',
      text: '#1D4ED8',
      border: '#BFDBFE',
    },

    // 3D Sculpture Palette
    sculpture: {
      coreMist: '#F1F5F9',
      coreDark: '#334155',
      navyRing: '#0F172A',
      goldRing: '#B8860B',
      satelliteGreen: '#059669',
      satelliteSlate: '#475569',
    },
  },

  radii: {
    inputs: '12px',
    buttons: '12px',
    card: '24px',
    pills: '9999px',
  },

  shadows: {
    card: '0 24px 60px -20px rgba(15, 23, 42, 0.25)',
    buttonHover: '0 4px 20px rgba(37, 99, 235, 0.35)',
    glowRing: '0 0 60px rgba(37, 99, 235, 0.12)',
  },

  typography: {
    fontSans: 'Inter, system-ui, -apple-system, sans-serif',
    fontMono: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
  },
} as const

export default themeTokens
