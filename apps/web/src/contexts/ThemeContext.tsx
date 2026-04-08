import React, { createContext, useContext, useEffect, useState } from "react";
import { theme as orthoTheme } from "@/theme/tokens";
import { enhancedTheme } from "@/theme/stitch-enhanced";

// Temas disponíveis (orthoplus-v2 é o novo tema aprimorado)
type Theme =
  | "orthoplus-v2"      // Novo tema aprimorado (padrão)
  | "light"
  | "dark"
  | "professional-dark"
  | "dark-gold"
  | "high-contrast"
  | "high-contrast-dark";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  tokens: typeof orthoTheme;
  enhanced: typeof enhancedTheme;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    const stored = localStorage.getItem("ortho-theme");
    // Usar orthoplus-v2 como padrão se não houver tema salvo
    return (stored as Theme) || "orthoplus-v2";
  });

  useEffect(() => {
    const root = document.documentElement;

    // Remove all theme classes
    root.classList.remove(
      "light",
      "dark",
      "professional-dark",
      "dark-gold",
      "high-contrast",
      "high-contrast-dark",
      "orthoplus-v2"
    );

    // Add current theme class
    root.classList.add(theme);

    // Aplicar variáveis CSS do tema orthoplus-v2
    if (theme === "orthoplus-v2") {
      root.style.setProperty("--background", "222 47% 6%");
      root.style.setProperty("--foreground", "210 40% 98%");
      root.style.setProperty("--card", "222 47% 8%");
      root.style.setProperty("--card-foreground", "210 40% 98%");
      root.style.setProperty("--primary", "186 100% 42%");
      root.style.setProperty("--primary-foreground", "222 47% 6%");
      root.style.setProperty("--secondary", "217 33% 17%");
      root.style.setProperty("--secondary-foreground", "210 40% 98%");
      root.style.setProperty("--muted", "217 33% 17%");
      root.style.setProperty("--muted-foreground", "215 20% 65%");
      root.style.setProperty("--accent", "38 92% 50%");
      root.style.setProperty("--accent-foreground", "222 47% 6%");
      root.style.setProperty("--destructive", "0 84% 60%");
      root.style.setProperty("--destructive-foreground", "210 40% 98%");
      root.style.setProperty("--border", "217 33% 20%");
      root.style.setProperty("--input", "217 33% 20%");
      root.style.setProperty("--ring", "186 100% 42%");
    }

    // Store in localStorage
    localStorage.setItem("ortho-theme", theme);
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ 
      theme, 
      setTheme, 
      tokens: orthoTheme,
      enhanced: enhancedTheme
    }}>
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
