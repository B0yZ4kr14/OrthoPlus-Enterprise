import React, { createContext, useContext, useEffect, useState } from "react";
import { theme as orthoTheme } from "@/theme/tokens";
import { enhancedTheme } from "@/theme/stitch-enhanced";
import { tokensV3 } from "@/theme/tokens-v3";

// ─── Temas disponíveis (v3 premium only) ───────────────────────────────────
type Theme =
  | "premium-light"       // Premium — padrão
  | "premium-dental-dark"; // Premium — dark

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  tokens: typeof orthoTheme;
  enhanced: typeof enhancedTheme;
  tokensV3: typeof tokensV3;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Temas que são controlados puramente por classe CSS (index.css @layer base)
const CSS_CLASS_THEMES: Theme[] = [
  "premium-light",
  "premium-dental-dark",
];

// Mapa: tema → classe CSS aplicada em <html>
const THEME_CLASS_MAP: Record<Theme, string> = {
  "premium-light":     "premium-light",
  "premium-dental-dark": "premium-dental-dark",
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    const stored = localStorage.getItem("ortho-theme") as Theme | null;
    // Apenas temas premium são suportados
    if (!stored || (stored !== "premium-light" && stored !== "premium-dental-dark")) {
      return "premium-light";
    }
    return stored;
  });

  useEffect(() => {
    const root = document.documentElement;

    // 1. Remove todas as classes de tema anteriores
    root.classList.remove(
      "premium-light",
      "premium-dental-dark",
    );

    // 2. Aplica classe do tema atual
    const cssClass = THEME_CLASS_MAP[theme];
    root.classList.add(cssClass);

    // 3. Persiste
    localStorage.setItem("ortho-theme", theme);
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        tokens: orthoTheme,
        enhanced: enhancedTheme,
        tokensV3,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

// Hook para acessar tokens de forma mais conveniente
// eslint-disable-next-line react-refresh/only-export-components
export const useThemeTokens = () => {
  const { tokens, enhanced } = useTheme();
  return { tokens, enhanced };
};
