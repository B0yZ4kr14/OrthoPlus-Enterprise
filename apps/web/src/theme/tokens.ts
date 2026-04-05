/**
 * OrthoPlus Design Tokens - Fonte de Verdade
 * Baseado na análise do LandPages/OrthoPlus Enterprise-v00
 * Data: 2026-04-05
 */

// ============================================
// PALETA DE CORES
// ============================================
export const colors = {
  // Cores Base (Dark Theme Default)
  background: {
    DEFAULT: '#0B1120',
    card: '#0F172A',
    popover: '#0F172A',
    sidebar: '#0B1120',
  },
  
  foreground: {
    DEFAULT: '#F8FAFC',
    card: '#F8FAFC',
    popover: '#F8FAFC',
    muted: '#94A3B8',
    sidebar: '#F8FAFC',
  },
  
  // Cores Primárias (Cyan)
  primary: {
    DEFAULT: '#06B6D4',
    foreground: '#0B1120',
    50: '#ECFEFF',
    100: '#CFFAFE',
    200: '#A5F3FC',
    300: '#67E8F9',
    400: '#22D3EE',
    500: '#06B6D4',
    600: '#0891B2',
    700: '#0E7490',
    800: '#155E75',
    900: '#164E63',
  },
  
  // Cores Secundárias
  secondary: {
    DEFAULT: '#1E293B',
    foreground: '#F8FAFC',
  },
  
  // Cores de Destaque (Âmbar/Dourado)
  accent: {
    DEFAULT: '#F59E0B',
    foreground: '#0B1120',
    amber: '#F59E0B',
    cyan: '#06B6D4',
    emerald: '#10B981',
    violet: '#8B5CF6',
    rose: '#F43F5E',
  },
  
  // Estados
  destructive: {
    DEFAULT: '#EF4444',
    foreground: '#F8FAFC',
  },
  
  success: {
    DEFAULT: '#10B981',
    foreground: '#0B1120',
  },
  
  warning: {
    DEFAULT: '#F59E0B',
    foreground: '#0B1120',
  },
  
  info: {
    DEFAULT: '#3B82F6',
    foreground: '#F8FAFC',
  },
  
  // Bordas e Inputs
  border: {
    DEFAULT: '#334155',
    subtle: 'rgba(51, 65, 85, 0.2)',
    medium: 'rgba(51, 65, 85, 0.3)',
    hover: 'rgba(51, 65, 85, 0.4)',
    selected: 'rgba(245, 158, 11, 0.5)',
    divider: 'rgba(255, 255, 255, 0.05)',
  },
  
  input: {
    DEFAULT: '#334155',
    background: 'rgba(255, 255, 255, 0.05)',
  },
  
  ring: {
    DEFAULT: '#06B6D4',
    offset: '#0B1120',
  },
  
  // Cores de Categorias (Gradients)
  category: {
    dashboard: { from: '#22D3EE', to: '#3B82F6' },      // Cyan → Blue
    atendimento: { from: '#34D399', to: '#14B8A6' },    // Emerald → Teal
    financeiro: { from: '#FBBF24', to: '#F97316' },     // Amber → Orange
    operacoes: { from: '#A78BFA', to: '#A855F7' },      // Violet → Purple
    marketing: { from: '#F472B6', to: '#F43F5E' },      // Pink → Rose
    bi: { from: '#818CF8', to: '#3B82F6' },             // Indigo → Blue
    compliance: { from: '#F87171', to: '#F43F5E' },     // Red → Rose
    inovacao: { from: '#2DD4BF', to: '#10B981' },       // Teal → Emerald
    admin: { from: '#94A3B8', to: '#6B7280' },          // Slate → Gray
  },
} as const;

// ============================================
// BORDAS E ESPAÇAMENTOS
// ============================================
export const borders = {
  width: {
    DEFAULT: '1px',
    thick: '2px',
    thin: '0.5px',
  },
  
  opacity: {
    subtle: 0.2,      // 20% - Bordas padrão
    medium: 0.3,      // 30% - Badges, alertas
    hover: 0.4,       // 40% - Hover states
    selected: 0.5,    // 50% - Itens selecionados
    divider: 0.05,    // 5% - Divisores
  },
  
  radius: {
    none: '0',
    xs: '0.25rem',    // 4px
    sm: '0.375rem',   // 6px
    md: '0.5rem',     // 8px
    lg: '0.625rem',   // 10px
    xl: '0.75rem',    // 12px - Cards
    '2xl': '1rem',    // 16px
    '3xl': '1.5rem',  // 24px
    full: '9999px',
  },
} as const;

// ============================================
// TIPOGRAFIA
// ============================================
export const typography = {
  fontFamily: {
    sans: "'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    mono: "'JetBrains Mono', 'Fira Code', monospace",
  },
  
  fontSize: {
    xs: '0.625rem',     // 10px - Badges
    sm: '0.75rem',      // 12px - Descrições secundárias
    base: '0.875rem',   // 14px - Texto padrão
    lg: '1rem',         // 16px - Títulos menores
    xl: '1.125rem',     // 18px - Títulos
    '2xl': '1.25rem',   // 20px - Headers
    '3xl': '1.5rem',    // 24px - Títulos grandes
    '4xl': '1.875rem',  // 30px - Display
  },
  
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  
  lineHeight: {
    tight: '1.25',
    normal: '1.5',
    relaxed: '1.75',
  },
} as const;

// ============================================
// SOMBRAS E EFEITOS
// ============================================
export const shadows = {
  // Glow effects
  glow: {
    cyan: '0 0 20px rgba(6, 182, 212, 0.3)',
    purple: '0 0 20px rgba(139, 92, 246, 0.3)',
    amber: '0 0 20px rgba(245, 158, 11, 0.3)',
    primary: '0 0 20px rgba(6, 182, 212, 0.3)',
  },
  
  // Card shadows
  card: {
    DEFAULT: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    hover: '0 12px 40px rgba(6, 182, 212, 0.15)',
    elevated: '0 20px 60px rgba(0, 0, 0, 0.3)',
  },
  
  // Input shadows
  input: {
    focus: '0 0 0 2px rgba(6, 182, 212, 0.3)',
  },
  
  // Dropdown/Popover
  dropdown: '0 10px 38px -10px rgba(0, 0, 0, 0.5)',
} as const;

// ============================================
// GRADIENTES
// ============================================
export const gradients = {
  // Texto gradiente
  text: {
    primary: 'linear-gradient(135deg, #06B6D4 0%, #3B82F6 50%, #8B5CF6 100%)',
    amber: 'linear-gradient(135deg, #FBBF24 0%, #F59E0B 100%)',
  },
  
  // Backgrounds
  background: {
    card: 'linear-gradient(180deg, rgba(15, 23, 42, 0.95) 0%, rgba(10, 15, 30, 0.98) 100%)',
    sidebar: 'linear-gradient(180deg, #0B1120 0%, #0F172A 100%)',
    header: 'linear-gradient(to bottom, rgba(11, 17, 32, 0.95), transparent)',
  },
  
  // Botões
  button: {
    primary: 'linear-gradient(135deg, #0891B2 0%, #06B6D4 100%)',
    hover: 'linear-gradient(135deg, #06B6D4 0%, #22D3EE 100%)',
  },
  
  // Cards selecionados
  selected: {
    amber: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(245, 158, 11, 0.05) 100%)',
    cyan: 'linear-gradient(135deg, rgba(6, 182, 212, 0.2) 0%, rgba(59, 130, 246, 0.2) 100%)',
  },
} as const;

// ============================================
// ANIMAÇÕES
// ============================================
export const animations = {
  duration: {
    fast: '150ms',
    normal: '200ms',
    slow: '300ms',
    slower: '500ms',
  },
  
  easing: {
    default: 'ease-out',
    smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },
  
  keyframes: {
    'pulse-glow': {
      '0%, 100%': { boxShadow: '0 0 20px rgba(6, 182, 212, 0.3)' },
      '50%': { boxShadow: '0 0 40px rgba(6, 182, 212, 0.5)' },
    },
    'fade-in': {
      '0%': { opacity: '0', transform: 'translateY(10px)' },
      '100%': { opacity: '1', transform: 'translateY(0)' },
    },
    'slide-in': {
      '0%': { transform: 'translateX(-100%)' },
      '100%': { transform: 'translateX(0)' },
    },
  },
} as const;

// ============================================
// ESPAÇAMENTOS
// ============================================
export const spacing = {
  xs: '0.25rem',    // 4px
  sm: '0.5rem',     // 8px
  md: '0.75rem',    // 12px
  lg: '1rem',       // 16px
  xl: '1.25rem',    // 20px
  '2xl': '1.5rem',  // 24px
  '3xl': '2rem',    // 32px
  '4xl': '2.5rem',  // 40px
} as const;

// ============================================
// Z-INDEX
// ============================================
export const zIndex = {
  base: '0',
  dropdown: '100',
  sticky: '200',
  modal: '300',
  popover: '400',
  tooltip: '500',
  toast: '600',
} as const;

// ============================================
// BREAKPOINTS
// ============================================
export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

// Exportação default
export const theme = {
  colors,
  borders,
  typography,
  shadows,
  gradients,
  animations,
  spacing,
  zIndex,
  breakpoints,
} as const;

export default theme;
