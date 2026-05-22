import React, { createContext, useContext, useEffect, useState } from "react";

// ─── Temas suportados (Spec 016 — TC-3) ───────────────────────────────────
// Apenas premium-light e premium-dental-dark são temas oficiais.
type Theme = "premium-light" | "premium-dental-dark";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const CSS_CLASS_THEMES: Theme[] = ["premium-light", "premium-dental-dark"];

// Mapa: tema → classe CSS aplicada em <html>
const THEME_CLASS_MAP: Record<Theme, string> = {
  "premium-light":       "premium-light",
  "premium-dental-dark": "premium-dental-dark",
};

// Temas legados removidos — mapear para o padrão mais próximo
const LEGACY_THEME_MAP: Record<string, Theme> = {
  "light":              "premium-light",
  "dark":               "premium-dental-dark",
  "professional-dark":  "premium-dental-dark",
  "high-contrast":      "premium-light",
  "high-contrast-dark": "premium-dental-dark",
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    const stored = localStorage.getItem("ortho-theme");

    // Migração: se tema legado estiver no localStorage, converte para o premium equivalente
    if (stored && stored in LEGACY_THEME_MAP) {
      const migrated = LEGACY_THEME_MAP[stored];
      localStorage.setItem("ortho-theme", migrated);
      return migrated;
    }

    if (!stored || !CSS_CLASS_THEMES.includes(stored as Theme)) {
      return "premium-light";
    }
    return stored as Theme;
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

    // 2. Aplica classe do tema atual
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
