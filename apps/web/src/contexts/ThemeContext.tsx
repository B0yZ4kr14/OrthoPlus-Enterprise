import React, { createContext, useContext, useEffect, useState } from "react";
import { useLocalStorage } from "@/lib/hooks/useLocalStorage";

// ─── Temas suportados (Spec 016 — TC-3) ───────────────────────────────────
// premium-light, premium-dental-dark e system (auto-detect) são temas oficiais.
type Theme = "premium-light" | "premium-dental-dark" | "system";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: "premium-light" | "premium-dental-dark";
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const CSS_CLASS_THEMES: Theme[] = [
  "premium-light",
  "premium-dental-dark",
  "system",
];

// Mapa: tema → classe CSS aplicada em <html>
const THEME_CLASS_MAP: Record<Exclude<Theme, "system">, string> = {
  "premium-light": "premium-light",
  "premium-dental-dark": "premium-dental-dark",
};

// Temas legados removidos — mapear para o padrão mais próximo
const LEGACY_THEME_MAP: Record<string, Exclude<Theme, "system">> = {
  light: "premium-light",
  dark: "premium-dental-dark",
  "professional-dark": "premium-dental-dark",
  "high-contrast": "premium-light",
  "high-contrast-dark": "premium-dental-dark",
};

function getSystemTheme(): "premium-light" | "premium-dental-dark" {
  if (typeof window === "undefined") return "premium-light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "premium-dental-dark"
    : "premium-light";
}

function migrateLegacyTheme(): Theme | null {
  try {
    const stored = window.localStorage.getItem("ortho-theme");
    if (stored && stored in LEGACY_THEME_MAP) {
      const migrated = LEGACY_THEME_MAP[stored];
      window.localStorage.setItem("ortho-theme", migrated);
      return migrated;
    }
    if (stored && CSS_CLASS_THEMES.includes(stored as Theme)) {
      return stored as Theme;
    }
  } catch {
    // ignore storage errors
  }
  return null;
}

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [theme, setTheme] = useLocalStorage<Theme>("ortho-theme", "premium-light");
  const [migrated, setMigrated] = useState(false);

  // Migração de tema legado (executa uma única vez)
  useEffect(() => {
    if (migrated) return;
    const legacy = migrateLegacyTheme();
    if (legacy && legacy !== theme) {
      setTheme(legacy);
    }
    setMigrated(true);
  }, [migrated, theme, setTheme]);

  const resolvedTheme: "premium-light" | "premium-dental-dark" =
    theme === "system" ? getSystemTheme() : theme;

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

    // 2. Aplica classe do tema resolvido
    const cssClass = THEME_CLASS_MAP[resolvedTheme];
    if (cssClass) {
      root.classList.add(cssClass);
    }

    // 3. Sincroniza classe 'dark' para Tailwind dark: variants funcionarem
    if (resolvedTheme === "premium-dental-dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [theme, resolvedTheme]);

  // Listener para mudança de prefers-color-scheme quando em modo system
  useEffect(() => {
    if (theme !== "system") return;
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      setTheme("system"); // Força re-render para aplicar novo resolvedTheme
    };
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme, setTheme]);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        resolvedTheme,
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
