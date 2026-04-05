/**
 * OrthoPlus Theme Provider
 * Fonte única de verdade para o tema da aplicação
 */

import { createContext, useContext, ReactNode } from 'react';
import { theme } from '@/theme/tokens';

// Tipo do tema
export type Theme = typeof theme;

// Contexto do tema
const ThemeContext = createContext<Theme>(theme);

// Hook para usar o tema
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme deve ser usado dentro de um ThemeProvider');
  }
  return context;
};

// Provider do tema
interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
}

export default ThemeProvider;
