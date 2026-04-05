/**
 * OrthoPlus Theme - Enhanced Version
 * Aprimoramentos baseados na análise das imagens de referência
 * Data: 2026-04-05
 * 
 * Este arquivo contém melhorias visuais refinadas baseadas no
 * design system do LandPages/OrthoPlus Enterprise-v00
 */

import { theme as baseTheme } from './tokens';

// ============================================
// APRIMORAMENTOS DO TEMA
// ============================================

export const enhancedTheme = {
  ...baseTheme,
  
  // Cores refinadas com base nas imagens
  colors: {
    ...baseTheme.colors,
    
    // Backgrounds otimizados
    background: {
      ...baseTheme.colors.background,
      // Tom mais profundo para melhor contraste
      deep: '#080C14',
      // Surface para cards elevados
      surface: '#111827',
      // Hover states
      hover: 'rgba(255, 255, 255, 0.03)',
    },
    
    // Cores de categoria com gradientes precisos
    category: {
      dashboard: { 
        from: '#22D3EE', 
        to: '#3B82F6',
        gradient: 'linear-gradient(135deg, #22D3EE 0%, #3B82F6 100%)'
      },
      atendimento: { 
        from: '#34D399', 
        to: '#14B8A6',
        gradient: 'linear-gradient(135deg, #34D399 0%, #14B8A6 100%)'
      },
      financeiro: { 
        from: '#FBBF24', 
        to: '#F97316',
        gradient: 'linear-gradient(135deg, #FBBF24 0%, #F97316 100%)'
      },
      operacoes: { 
        from: '#A78BFA', 
        to: '#A855F7',
        gradient: 'linear-gradient(135deg, #A78BFA 0%, #A855F7 100%)'
      },
      marketing: { 
        from: '#F472B6', 
        to: '#F43F5E',
        gradient: 'linear-gradient(135deg, #F472B6 0%, #F43F5E 100%)'
      },
      bi: { 
        from: '#818CF8', 
        to: '#3B82F6',
        gradient: 'linear-gradient(135deg, #818CF8 0%, #3B82F6 100%)'
      },
      compliance: { 
        from: '#F87171', 
        to: '#F43F5E',
        gradient: 'linear-gradient(135deg, #F87171 0%, #F43F5E 100%)'
      },
      inovacao: { 
        from: '#2DD4BF', 
        to: '#10B981',
        gradient: 'linear-gradient(135deg, #2DD4BF 0%, #10B981 100%)'
      },
      admin: { 
        from: '#94A3B8', 
        to: '#6B7280',
        gradient: 'linear-gradient(135deg, #94A3B8 0%, #6B7280 100%)'
      },
    },
    
    // Estados de seleção
    selection: {
      amber: {
        bg: 'rgba(245, 158, 11, 0.1)',
        border: 'rgba(245, 158, 11, 0.5)',
        text: '#F59E0B',
      },
      cyan: {
        bg: 'rgba(6, 182, 212, 0.1)',
        border: 'rgba(6, 182, 212, 0.5)',
        text: '#06B6D4',
      },
    },
  },
  
  // Sombras aprimoradas
  shadows: {
    ...baseTheme.shadows,
    
    // Sombras de cards com glow sutil
    card: {
      DEFAULT: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      hover: '0 12px 40px rgba(6, 182, 212, 0.12), 0 4px 12px rgba(0, 0, 0, 0.15)',
      elevated: '0 20px 60px rgba(0, 0, 0, 0.3), 0 8px 24px rgba(6, 182, 212, 0.08)',
      selected: '0 0 0 1px rgba(245, 158, 11, 0.5), 0 4px 12px rgba(245, 158, 11, 0.15)',
    },
    
    // Glow effects refinados
    glow: {
      cyan: {
        sm: '0 0 10px rgba(6, 182, 212, 0.2)',
        DEFAULT: '0 0 20px rgba(6, 182, 212, 0.3)',
        lg: '0 0 40px rgba(6, 182, 212, 0.4)',
      },
      amber: {
        sm: '0 0 10px rgba(245, 158, 11, 0.2)',
        DEFAULT: '0 0 20px rgba(245, 158, 11, 0.3)',
        lg: '0 0 40px rgba(245, 158, 11, 0.4)',
      },
    },
  },
  
  // Transições refinadas
  transitions: {
    ...baseTheme.animations,
    
    // Timing functions suaves
    timing: {
      default: 'cubic-bezier(0.4, 0, 0.2, 1)',
      smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
      bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      snap: 'cubic-bezier(0.16, 1, 0.3, 1)',
    },
    
    // Durações padronizadas
    duration: {
      instant: '100ms',
      fast: '150ms',
      normal: '200ms',
      slow: '300ms',
      slower: '500ms',
    },
  },
  
  // Componentes específicos
  components: {
    // Cards de database engine
    dbEngineCard: {
      base: {
        background: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid rgba(6, 182, 212, 0.2)',
        borderRadius: '0.75rem',
        padding: '0.75rem',
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
      },
      hover: {
        border: '1px solid rgba(6, 182, 212, 0.4)',
        background: 'rgba(6, 182, 212, 0.05)',
        transform: 'translateY(-2px)',
      },
      selected: {
        border: '1px solid rgba(245, 158, 11, 0.5)',
        background: 'rgba(245, 158, 11, 0.05)',
        boxShadow: '0 0 0 1px rgba(245, 158, 11, 0.2)',
      },
    },
    
    // Tabs
    tab: {
      base: {
        padding: '0.375rem 0.75rem',
        borderRadius: '0.5rem',
        fontSize: '0.75rem',
        transition: 'all 0.2s ease',
        border: '1px solid transparent',
      },
      active: {
        background: 'rgba(244, 63, 94, 0.2)',
        border: '1px solid rgba(244, 63, 94, 0.5)',
        color: '#FB7185',
      },
      inactive: {
        color: 'rgba(255, 255, 255, 0.6)',
        hover: {
          background: 'rgba(255, 255, 255, 0.05)',
          color: 'rgba(255, 255, 255, 0.9)',
        },
      },
    },
    
    // Inputs
    input: {
      base: {
        background: 'rgba(255, 255, 255, 0.05)',
        border: '1px solid rgba(6, 182, 212, 0.2)',
        borderRadius: '0.5rem',
        padding: '0.5rem 0.75rem',
        color: '#F8FAFC',
        fontSize: '0.875rem',
        transition: 'all 0.2s ease',
      },
      focus: {
        border: '1px solid rgba(6, 182, 212, 0.5)',
        boxShadow: '0 0 0 2px rgba(6, 182, 212, 0.2)',
        outline: 'none',
      },
      placeholder: {
        color: 'rgba(148, 163, 184, 0.6)',
      },
    },
    
    // Botões
    button: {
      primary: {
        background: 'linear-gradient(135deg, #0891B2 0%, #06B6D4 100%)',
        color: '#FFFFFF',
        borderRadius: '0.5rem',
        padding: '0.5rem 1rem',
        fontWeight: 500,
        transition: 'all 0.2s ease',
        hover: {
          background: 'linear-gradient(135deg, #06B6D4 0%, #22D3EE 100%)',
          boxShadow: '0 4px 12px rgba(6, 182, 212, 0.3)',
          transform: 'translateY(-1px)',
        },
      },
      secondary: {
        background: 'rgba(255, 255, 255, 0.05)',
        border: '1px solid rgba(6, 182, 212, 0.3)',
        color: '#F8FAFC',
        hover: {
          background: 'rgba(255, 255, 255, 0.1)',
          border: '1px solid rgba(6, 182, 212, 0.5)',
        },
      },
    },
    
    // Badges
    badge: {
      cyan: {
        background: 'rgba(6, 182, 212, 0.1)',
        color: '#22D3EE',
        border: '1px solid rgba(6, 182, 212, 0.3)',
        borderRadius: '0.375rem',
        padding: '0.125rem 0.5rem',
        fontSize: '0.625rem',
      },
      amber: {
        background: 'rgba(245, 158, 11, 0.1)',
        color: '#FBBF24',
        border: '1px solid rgba(245, 158, 11, 0.3)',
      },
    },
  },
} as const;

// ============================================
// UTILITÁRIOS DE ESTILO
// ============================================

/**
 * Gera classe CSS para gradiente de categoria
 */
export const getCategoryGradient = (categoryId: string): string => {
  const gradients: Record<string, string> = {
    'cat-dashboard': enhancedTheme.colors.category.dashboard.gradient,
    'cat-atendimento': enhancedTheme.colors.category.atendimento.gradient,
    'cat-financeiro': enhancedTheme.colors.category.financeiro.gradient,
    'cat-operacoes': enhancedTheme.colors.category.operacoes.gradient,
    'cat-marketing': enhancedTheme.colors.category.marketing.gradient,
    'cat-bi': enhancedTheme.colors.category.bi.gradient,
    'cat-compliance': enhancedTheme.colors.category.compliance.gradient,
    'cat-inovacao': enhancedTheme.colors.category.inovacao.gradient,
    'cat-admin': enhancedTheme.colors.category.admin.gradient,
  };
  return gradients[categoryId] || gradients['cat-dashboard'];
};

/**
 * Gera estilos para card de database engine
 */
export const getDbEngineCardStyles = (isSelected: boolean, isHovered: boolean) => {
  const base = enhancedTheme.components.dbEngineCard.base;
  
  if (isSelected) {
    return {
      ...base,
      ...enhancedTheme.components.dbEngineCard.selected,
    };
  }
  
  if (isHovered) {
    return {
      ...base,
      ...enhancedTheme.components.dbEngineCard.hover,
    };
  }
  
  return base;
};

export default enhancedTheme;
