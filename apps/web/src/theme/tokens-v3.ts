/**
 * OrthoPlus Design Tokens v3 — Premium Redesign
 * Light-first, Sage Green CTAs, Plus Jakarta Sans
 * Aprovado pelo cliente: 2026-04-25
 *
 * Uso:
 *   import { tokensV3 } from '@/theme/tokens-v3'
 *   import { THEMES } from '@/theme/tokens-v3'   ← CSS vars para ThemeContext
 *
 * Tailwind consome via CSS vars em tailwind.config.ts (hsl(var(--token))).
 */

// ============================================
// PALETA PRIMITIVA
// Nomes semânticos → sem referência a "cyan" ou "amber"
// ============================================

export const palette = {
  // Slate (base neutra para todo o UI)
  slate: {
    50:  '#F8FAFC',
    100: '#F1F5F9',
    200: '#E2E8F0',
    300: '#CBD5E1',
    400: '#94A3B8',
    500: '#64748B',
    600: '#475569',
    700: '#334155',
    800: '#1E293B',
    900: '#0F172A',
    950: '#020617',
  },

  // Sage / Emerald (cor interativa primária — CTAs, links, foco)
  sage: {
    50:  '#ECFDF5',
    100: '#D1FAE5',
    200: '#A7F3D0',
    300: '#6EE7B7',
    400: '#34D399',
    500: '#10B981',
    600: '#059669',  // ← DEFAULT interativo
    700: '#047857',
    800: '#065F46',
    900: '#064E3B',
  },

  // Red (destructive)
  red: {
    50:  '#FEF2F2',
    500: '#EF4444',
    600: '#DC2626',
    700: '#B91C1C',
  },

  // Yellow (warning)
  yellow: {
    50:  '#FEFCE8',
    400: '#FACC15',
    500: '#EAB308',
    600: '#CA8A04',
  },

  // Green (success — diferente do sage)
  green: {
    50:  '#F0FDF4',
    500: '#22C55E',
    600: '#16A34A',
  },

  // Sky (info)
  sky: {
    50:  '#F0F9FF',
    500: '#0EA5E9',
    600: '#0284C7',
  },

  // White / Black
  white: '#FFFFFF',
  black: '#000000',
} as const;

// ============================================
// SEMANTIC TOKENS (por intenção, não por cor)
// ============================================

/** Tema claro — padrão clínico (light mode) */
export const lightTheme = {
  // Superfícies
  background:          '210 40% 98%',   // slate-50  → #F8FAFC
  card:                '0 0% 100%',     // white     → #FFFFFF
  cardForeground:      '222 47% 6%',    // slate-900 → #0F172A
  popover:             '0 0% 100%',
  popoverForeground:   '222 47% 6%',

  // Cor primária de superfície (navy)
  primary:             '222 47% 11%',   // slate-900 → #0F172A
  primaryForeground:   '0 0% 100%',

  // Cor interativa (sage green)
  interactive:         '160 84% 30%',   // sage-600  → #059669
  interactiveForeground: '0 0% 100%',
  interactiveHover:    '160 84% 25%',   // sage-700  → #047857

  // Secundário / muted
  secondary:           '210 40% 96%',   // slate-100 → #F1F5F9
  secondaryForeground: '222 47% 11%',
  muted:               '210 40% 96%',   // slate-100
  mutedForeground:     '215 16% 47%',   // slate-500 → #64748B

  // Accent (sage suave para backgrounds de destaque)
  accent:              '151 55% 95%',   // sage-50 → #ECFDF5
  accentForeground:    '160 84% 25%',   // sage-700

  // Estado destructive
  destructive:         '0 84% 60%',     // red-500  → #EF4444
  destructiveForeground: '0 0% 100%',

  // Success
  success:             '142 76% 36%',   // green-600 → #16A34A
  successForeground:   '0 0% 100%',

  // Warning
  warning:             '32 95% 44%',    // yellow-600 → #CA8A04
  warningForeground:   '0 0% 100%',

  // Info
  info:                '199 89% 48%',   // sky-500 → #0EA5E9
  infoForeground:      '0 0% 100%',

  // Bordas e inputs
  border:              '214 32% 91%',   // slate-200 → #E2E8F0
  input:               '214 32% 91%',
  ring:                '160 84% 30%',   // sage-600 (foco)

  // Radius padrão
  radius:              '0.5rem',        // 8px — flat & clean

  // Sidebar
  sidebarBackground:   '0 0% 100%',     // white sidebar
  sidebarForeground:   '222 47% 11%',
  sidebarPrimary:      '160 84% 30%',
  sidebarPrimaryForeground: '0 0% 100%',
  sidebarAccent:       '210 40% 96%',   // slate-100
  sidebarAccentForeground: '222 47% 11%',
  sidebarBorder:       '214 32% 91%',
  sidebarRing:         '160 84% 30%',

  // Módulos (cores de categoria — mantidas para sidebar icons)
  moduleBlue:    '217 91% 60%',
  modulePurple:  '270 60% 65%',
  moduleYellow:  '45 93% 47%',
  moduleOrange:  '25 95% 53%',
  moduleCyan:    '160 84% 30%',   // sage no light
  modulePink:    '330 70% 60%',
  moduleGreen:   '142 76% 36%',
  moduleRed:     '0 84% 60%',

  // Stat colors
  statBlueBg:   '217 91% 60%',
  statPurpleBg: '270 60% 65%',
  statGreenBg:  '142 76% 36%',
  statOrangeBg: '25 95% 53%',
} as const;

/** Tema escuro — uso opcional em salas escuras */
export const darkTheme = {
  background:          '222 47% 6%',    // #0B1120
  card:                '222 47% 8%',    // #0F172A
  cardForeground:      '210 40% 98%',
  popover:             '222 47% 8%',
  popoverForeground:   '210 40% 98%',

  primary:             '210 40% 98%',   // foreground branco no dark
  primaryForeground:   '222 47% 6%',

  interactive:         '160 60% 45%',   // sage mais claro no dark
  interactiveForeground: '222 47% 6%',
  interactiveHover:    '160 60% 50%',

  secondary:           '217 33% 17%',
  secondaryForeground: '210 40% 98%',
  muted:               '217 33% 17%',
  mutedForeground:     '215 20% 65%',

  accent:              '160 30% 15%',   // sage escuro suave
  accentForeground:    '160 60% 50%',

  destructive:         '0 84% 60%',
  destructiveForeground: '210 40% 98%',

  success:             '142 65% 42%',
  successForeground:   '222 47% 6%',

  warning:             '38 92% 50%',
  warningForeground:   '222 47% 6%',

  info:                '199 89% 55%',
  infoForeground:      '222 47% 6%',

  border:              '217 33% 20%',
  input:               '217 33% 20%',
  ring:                '160 60% 45%',

  radius:              '0.5rem',

  sidebarBackground:   '222 47% 6%',
  sidebarForeground:   '210 40% 98%',
  sidebarPrimary:      '160 60% 45%',
  sidebarPrimaryForeground: '222 47% 6%',
  sidebarAccent:       '217 33% 17%',
  sidebarAccentForeground: '210 40% 98%',
  sidebarBorder:       '217 33% 20%',
  sidebarRing:         '160 60% 45%',

  moduleBlue:    '217 91% 60%',
  modulePurple:  '270 60% 65%',
  moduleYellow:  '45 93% 47%',
  moduleOrange:  '25 95% 53%',
  moduleCyan:    '160 60% 45%',
  modulePink:    '330 70% 60%',
  moduleGreen:   '142 65% 42%',
  moduleRed:     '0 84% 60%',

  statBlueBg:   '217 91% 60%',
  statPurpleBg: '270 60% 65%',
  statGreenBg:  '142 65% 42%',
  statOrangeBg: '25 95% 53%',
} as const;

// ============================================
// TIPOGRAFIA
// ============================================
export const typographyV3 = {
  fontFamily: {
    display: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
    sans:    "'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    mono:    "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
  },

  fontSize: {
    xs:   '0.75rem',    // 12px — caption, labels
    sm:   '0.875rem',   // 14px — body small
    base: '1rem',       // 16px — body padrão
    lg:   '1.125rem',   // 18px — body large / card titles
    xl:   '1.25rem',    // 20px — H4
    '2xl':'1.5rem',     // 24px — H3
    '3xl':'1.875rem',   // 30px — H2
    '4xl':'2.25rem',    // 36px — H1
    '5xl':'3rem',       // 48px — Display
  },

  fontWeight: {
    normal:   '400',
    medium:   '500',
    semibold: '600',
    bold:     '700',
  },

  lineHeight: {
    tight:   '1.25',
    snug:    '1.375',
    normal:  '1.5',
    relaxed: '1.625',
    loose:   '2',
  },

  letterSpacing: {
    tight:   '-0.025em',
    normal:  '0',
    wide:    '0.025em',
    wider:   '0.05em',
    widest:  '0.1em',
  },
} as const;

// ============================================
// SOMBRAS (flat-first — sutis e clean)
// ============================================
export const shadowsV3 = {
  none:  'none',
  xs:    '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  sm:    '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  md:    '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg:    '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl:    '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
  // Sombras coloridas para elementos interativos (sage)
  interactive: '0 0 0 3px hsl(160 84% 30% / 0.15)',
  // Sombra para cards no light mode
  card:        '0 1px 3px 0 rgb(0 0 0 / 0.08), 0 1px 2px -1px rgb(0 0 0 / 0.06)',
  cardHover:   '0 4px 12px 0 rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.08)',
} as const;

// ============================================
// ESPAÇAMENTO (8px grid)
// ============================================
export const spacingV3 = {
  0:    '0',
  px:   '1px',
  0.5:  '0.125rem',  // 2px
  1:    '0.25rem',   // 4px
  1.5:  '0.375rem',  // 6px
  2:    '0.5rem',    // 8px    ← base unit
  2.5:  '0.625rem',  // 10px
  3:    '0.75rem',   // 12px
  4:    '1rem',      // 16px   ← md
  5:    '1.25rem',   // 20px
  6:    '1.5rem',    // 24px   ← lg
  8:    '2rem',      // 32px   ← xl
  10:   '2.5rem',    // 40px
  12:   '3rem',      // 48px   ← 2xl
  16:   '4rem',      // 64px   ← 3xl
  20:   '5rem',      // 80px
  24:   '6rem',      // 96px
} as const;

// ============================================
// BORDER RADIUS
// ============================================
export const radiusV3 = {
  none: '0',
  sm:   '0.25rem',   // 4px — tags, code
  DEFAULT: '0.5rem', // 8px — padrão
  md:   '0.375rem',  // 6px — buttons pequenos
  lg:   '0.5rem',    // 8px — cards, inputs
  xl:   '0.75rem',   // 12px — modals, sheets
  '2xl':'1rem',      // 16px — grandes
  full: '9999px',    // círculos, pills
} as const;

// ============================================
// CATEGORIAS (cores para sidebar/módulos)
// Mantidas por compatibilidade com código existente
// ============================================
export const categoryColors = {
  dashboard:   { from: '#0EA5E9', to: '#6366F1' },  // sky → indigo
  atendimento: { from: '#059669', to: '#0D9488' },  // sage → teal
  financeiro:  { from: '#D97706', to: '#EA580C' },  // amber → orange
  operacoes:   { from: '#7C3AED', to: '#9333EA' },  // violet → purple
  marketing:   { from: '#DB2777', to: '#E11D48' },  // pink → rose
  bi:          { from: '#4F46E5', to: '#2563EB' },  // indigo → blue
  compliance:  { from: '#DC2626', to: '#E11D48' },  // red → rose
  inovacao:    { from: '#0D9488', to: '#059669' },  // teal → sage
  admin:       { from: '#64748B', to: '#475569' },  // slate
} as const;

// ============================================
// EXPORT PRINCIPAL
// ============================================
export const tokensV3 = {
  palette,
  light: lightTheme,
  dark:  darkTheme,
  typography: typographyV3,
  shadows: shadowsV3,
  spacing: spacingV3,
  radius: radiusV3,
  categoryColors,
} as const;

export default tokensV3;
