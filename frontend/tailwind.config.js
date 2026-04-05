/** @type {import('tailwindcss').Config} */
import { theme as orthoTheme } from './src/theme/tokens';

module.exports = {
  darkMode: ["class"],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      // ============================================
      // CORES - Fonte de verdade: tokens.ts
      // ============================================
      colors: {
        border: {
          DEFAULT: "hsl(217 33% 20%)",
          subtle: "rgba(51, 65, 85, 0.2)",
          medium: "rgba(51, 65, 85, 0.3)",
          hover: "rgba(51, 65, 85, 0.4)",
          selected: "rgba(245, 158, 11, 0.5)",
          divider: "rgba(255, 255, 255, 0.05)",
        },
        input: "hsl(217 33% 20%)",
        ring: "hsl(186 100% 42%)",
        background: "hsl(222 47% 6%)",
        foreground: "hsl(210 40% 98%)",
        
        // Cores Primárias (Cyan)
        primary: {
          DEFAULT: "hsl(186 100% 42%)",
          foreground: "hsl(222 47% 6%)",
          50: "#ECFEFF",
          100: "#CFFAFE",
          200: "#A5F3FC",
          300: "#67E8F9",
          400: "#22D3EE",
          500: "#06B6D4",
          600: "#0891B2",
          700: "#0E7490",
          800: "#155E75",
          900: "#164E63",
        },
        
        // Cores Secundárias
        secondary: {
          DEFAULT: "hsl(217 33% 17%)",
          foreground: "hsl(210 40% 98%)",
        },
        
        // Cores Neutras
        muted: {
          DEFAULT: "hsl(217 33% 17%)",
          foreground: "hsl(215 20% 65%)",
        },
        
        // Cores de Destaque (Âmbar)
        accent: {
          DEFAULT: "hsl(38 92% 50%)",
          foreground: "hsl(222 47% 6%)",
          amber: "#F59E0B",
          cyan: "#06B6D4",
          emerald: "#10B981",
          violet: "#8B5CF6",
          rose: "#F43F5E",
        },
        
        // Estados
        destructive: {
          DEFAULT: "hsl(0 84% 60%)",
          foreground: "hsl(210 40% 98%)",
        },
        success: {
          DEFAULT: "hsl(160 84% 39%)",
          foreground: "hsl(210 40% 98%)",
        },
        warning: {
          DEFAULT: "hsl(38 92% 50%)",
          foreground: "hsl(222 47% 6%)",
        },
        info: {
          DEFAULT: "hsl(217 91% 60%)",
          foreground: "hsl(210 40% 98%)",
        },
        
        // Cards
        card: {
          DEFAULT: "hsl(222 47% 8%)",
          foreground: "hsl(210 40% 98%)",
        },
        popover: {
          DEFAULT: "hsl(222 47% 8%)",
          foreground: "hsl(210 40% 98%)",
        },
        
        // Sidebar
        sidebar: {
          DEFAULT: "hsl(222 47% 6%)",
          foreground: "hsl(210 40% 98%)",
          primary: "hsl(186 100% 42%)",
          "primary-foreground": "hsl(222 47% 6%)",
          accent: "hsl(217 33% 17%)",
          "accent-foreground": "hsl(210 40% 98%)",
          border: "hsl(217 33% 20%)",
          ring: "hsl(186 100% 42%)",
        },
      },
      
      // ============================================
      // BORDAS ARREDONDADAS
      // ============================================
      borderRadius: {
        none: "0",
        xs: "0.25rem",      // 4px
        sm: "0.375rem",     // 6px
        md: "0.5rem",       // 8px
        lg: "0.625rem",     // 10px - Botões/Inputs
        xl: "0.75rem",      // 12px - Cards
        "2xl": "1rem",      // 16px
        "3xl": "1.5rem",    // 24px
        full: "9999px",
      },
      
      // ============================================
      // SOMBRAS
      // ============================================
      boxShadow: {
        // Glow effects
        "glow-cyan": "0 0 20px rgba(6, 182, 212, 0.3)",
        "glow-purple": "0 0 20px rgba(139, 92, 246, 0.3)",
        "glow-amber": "0 0 20px rgba(245, 158, 11, 0.3)",
        "glow-primary": "0 0 20px rgba(6, 182, 212, 0.3)",
        
        // Cards
        "card": "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
        "card-hover": "0 12px 40px rgba(6, 182, 212, 0.15)",
        "card-elevated": "0 20px 60px rgba(0, 0, 0, 0.3)",
        
        // Inputs
        "input-focus": "0 0 0 2px rgba(6, 182, 212, 0.3)",
        
        // Dropdown/Popover
        "dropdown": "0 10px 38px -10px rgba(0, 0, 0, 0.5)",
        
        // XS
        xs: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
      },
      
      // ============================================
      // TIPOGRAFIA
      // ============================================
      fontFamily: {
        sans: ["'Inter'", "system-ui", "-apple-system", "BlinkMacSystemFont", "'Segoe UI'", "Roboto", "sans-serif"],
        mono: ["'JetBrains Mono'", "'Fira Code'", "monospace"],
      },
      
      fontSize: {
        xs: "0.625rem",     // 10px - Badges
        sm: "0.75rem",      // 12px - Descrições
        base: "0.875rem",   // 14px - Texto padrão
        lg: "1rem",         // 16px
        xl: "1.125rem",     // 18px - Títulos
        "2xl": "1.25rem",   // 20px
        "3xl": "1.5rem",    // 24px
        "4xl": "1.875rem",  // 30px
      },
      
      // ============================================
      // ANIMAÇÕES
      // ============================================
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "caret-blink": {
          "0%,70%,100%": { opacity: "1" },
          "20%,50%": { opacity: "0" },
        },
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 20px rgba(6, 182, 212, 0.3)" },
          "50%": { boxShadow: "0 0 40px rgba(6, 182, 212, 0.5)" },
        },
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in-left": {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(0)" },
        },
      },
      
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "caret-blink": "caret-blink 1.25s ease-out infinite",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        "fade-in-up": "fade-in-up 0.3s ease-out forwards",
        "slide-in-left": "slide-in-left 0.3s ease-out forwards",
      },
      
      // ============================================
      // ESPAÇAMENTOS
      // ============================================
      spacing: {
        xs: "0.25rem",    // 4px
        sm: "0.5rem",     // 8px
        md: "0.75rem",    // 12px
        lg: "1rem",       // 16px
        xl: "1.25rem",    // 20px
        "2xl": "1.5rem",  // 24px
        "3xl": "2rem",    // 32px
        "4xl": "2.5rem",  // 40px
      },
      
      // ============================================
      // Z-INDEX
      // ============================================
      zIndex: {
        base: "0",
        dropdown: "100",
        sticky: "200",
        modal: "300",
        popover: "400",
        tooltip: "500",
        toast: "600",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
