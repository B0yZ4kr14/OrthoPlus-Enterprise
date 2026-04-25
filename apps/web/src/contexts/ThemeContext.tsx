import React, { createContext, useContext, useEffect, useState } from "react";
import { theme as orthoTheme } from "@/theme/tokens";
import { enhancedTheme } from "@/theme/stitch-enhanced";

// ─── Temas disponíveis (v3 — light-first, sage green CTAs) ─────────────────
type Theme =
  | "light"               // Padrão v3 (light, sage green)
  | "dark"                // Dark v3
  | "professional-dark"   // Professional dark
  | "high-contrast"       // Acessibilidade — fundo branco
  | "high-contrast-dark"  // Acessibilidade — fundo preto
  // Legacy — mantido para não quebrar localStorage de usuários existentes
  | "orthoplus-v2"
  | "dark-gold";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  tokens: typeof orthoTheme;
  enhanced: typeof enhancedTheme;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Variáveis que os temas v3 controlam via CSS class em :root
// (definidas no index.css via @layer base).
// O ThemeContext só precisa injetar vars inline para temas legados
// que não têm classe CSS equivalente.

const LEGACY_ORTHOPLUS_V2_VARS: Record<string, string> = {
  "--background":            "222 47% 6%",
  "--foreground":            "210 40% 98%",
  "--card":                  "222 47% 8%",
  "--card-foreground":       "210 40% 98%",
  "--popover":               "222 47% 8%",
  "--popover-foreground":    "210 40% 98%",
  "--primary":               "186 100% 42%",
  "--primary-foreground":    "222 47% 6%",
  "--interactive":           "186 100% 42%",
  "--interactive-foreground":"222 47% 6%",
  "--interactive-hover":     "186 100% 36%",
  "--secondary":             "217 33% 17%",
  "--secondary-foreground":  "210 40% 98%",
  "--muted":                 "217 33% 17%",
  "--muted-foreground":      "215 20% 65%",
  "--accent":                "38 92% 50%",
  "--accent-foreground":     "222 47% 6%",
  "--destructive":           "0 84% 60%",
  "--destructive-foreground":"210 40% 98%",
  "--success":               "142 65% 42%",
  "--success-foreground":    "222 47% 6%",
  "--warning":               "38 92% 50%",
  "--warning-foreground":    "222 47% 6%",
  "--info":                  "199 89% 55%",
  "--info-foreground":       "222 47% 6%",
  "--border":                "217 33% 20%",
  "--input":                 "217 33% 20%",
  "--ring":                  "186 100% 42%",
  "--sidebar-background":          "222 47% 6%",
  "--sidebar-foreground":          "210 40% 98%",
  "--sidebar-primary":             "186 100% 42%",
  "--sidebar-primary-foreground":  "222 47% 6%",
  "--sidebar-accent":              "217 33% 17%",
  "--sidebar-accent-foreground":   "210 40% 98%",
  "--sidebar-border":              "217 33% 20%",
  "--sidebar-ring":                "186 100% 42%",
};

// Temas que são controlados puramente por classe CSS (index.css @layer base)
const CSS_CLASS_THEMES: Theme[] = [
  "light",
  "dark",
  "professional-dark",
  "high-contrast",
  "high-contrast-dark",
];

// Mapa: tema → classe CSS aplicada em <html>
const THEME_CLASS_MAP: Record<Theme, string> = {
  light:               "light",
  dark:                "dark",
  "professional-dark": "professional-dark",
  "high-contrast":     "high-contrast",
  "high-contrast-dark":"high-contrast-dark",
  // Legacy
  "orthoplus-v2":      "orthoplus-v2",
  "dark-gold":         "dark",          // fallback para dark
};

// Var names to clear when switching away from legacy inline vars
const ALL_INLINE_VAR_KEYS = Object.keys(LEGACY_ORTHOPLUS_V2_VARS);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    const stored = localStorage.getItem("ortho-theme") as Theme | null;
    // Migrar legacy "orthoplus-v2" → "light" automaticamente
    if (!stored || stored === "orthoplus-v2" || stored === "dark-gold") {
      return "light";
    }
    return stored;
  });

  useEffect(() => {
    const root = document.documentElement;

    // 1. Remove todas as classes de tema anteriores
    root.classList.remove(
      "light",
      "dark",
      "professional-dark",
      "dark-gold",
      "high-contrast",
      "high-contrast-dark",
      "orthoplus-v2",
    );

    // 2. Limpa vars inline (usadas por temas legados)
    ALL_INLINE_VAR_KEYS.forEach((key) => root.style.removeProperty(key));

    // 3. Aplica classe do tema atual
    const cssClass = THEME_CLASS_MAP[theme];
    root.classList.add(cssClass);

    // 4. Para temas legados: injeta vars inline (sobrescreve :root)
    if (!CSS_CLASS_THEMES.includes(theme)) {
      const vars =
        theme === "orthoplus-v2" ? LEGACY_ORTHOPLUS_V2_VARS : LEGACY_ORTHOPLUS_V2_VARS;
      Object.entries(vars).forEach(([key, value]) => {
        root.style.setProperty(key, value);
      });
    }

    // 5. Persiste
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
