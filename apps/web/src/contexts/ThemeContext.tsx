import React, { createContext, useContext, useEffect, useState } from "react";
import { theme as orthoTheme } from "@/theme/tokens";
import { enhancedTheme } from "@/theme/stitch-enhanced";
import { tokensV3 } from "@/theme/tokens-v3";

// ─── Temas disponíveis (todos os temas CSS definidos em index.css) ─────────
type Theme =
  | "light"                 // Light — padrão (sage green)
  | "dark"                  // Dark
  | "professional-dark"     // Professional dark
  | "high-contrast"         // Alto contraste claro
  | "high-contrast-dark"    // Alto contraste escuro
  | "premium-light"         // Premium — Clínica Cristal
  | "premium-dental-dark";  // Premium — Noite Clínica

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
  "light",
  "dark",
  "professional-dark",
  "high-contrast",
  "high-contrast-dark",
  "premium-light",
  "premium-dental-dark",
];

// Mapa: tema → classe CSS aplicada em <html>
// "light" usa :root (sem classe adicional)
const THEME_CLASS_MAP: Record<Theme, string> = {
  "light":               "",
  "dark":                "dark",
  "professional-dark":   "professional-dark",
  "high-contrast":       "high-contrast",
  "high-contrast-dark":  "high-contrast-dark",
  "premium-light":       "premium-light",
  "premium-dental-dark": "premium-dental-dark",
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    const stored = localStorage.getItem("ortho-theme") as Theme | null;
    const validThemes: Theme[] = [
      "light",
      "dark",
      "professional-dark",
      "high-contrast",
      "high-contrast-dark",
      "premium-light",
      "premium-dental-dark",
    ];
    if (!stored || !validThemes.includes(stored)) {
      return "premium-light";
    }
    return stored;
  });

  useEffect(() => {
    const root = document.documentElement;

    // 1. Remove todas as classes de tema anteriores
    root.classList.remove(
      "dark",
      "professional-dark",
      "high-contrast",
      "high-contrast-dark",
      "premium-light",
      "premium-dental-dark",
    );

    // 2. Aplica classe do tema atual (light usa :root, sem classe)
    const cssClass = THEME_CLASS_MAP[theme];
    if (cssClass) {
      root.classList.add(cssClass);
    }

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
