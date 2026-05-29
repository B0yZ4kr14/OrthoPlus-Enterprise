/**
 * Semantic Color Utilities
 * Mapeia cores semânticas (warning, info, accent, etc.) para classes Tailwind
 * Compatível com CSS variables do ThemeContext v3
 */

export type SemanticColorType =
  | "warning"
  | "info"
  | "accent"
  | "destructive"
  | "success";
export type SemanticVariant = "bg" | "text" | "border";

/**
 * Retorna classe Tailwind para uma cor semântica com opacidade opcional
 * @example getSemanticColorClass("warning", "bg", 10) // "bg-warning/10"
 * @example getSemanticColorClass("info", "text") // "text-info"
 */
export function getSemanticColorClass(
  type: SemanticColorType,
  variant: SemanticVariant,
  opacity?: number,
): string {
  const base = `${variant}-${type}`;
  return opacity !== undefined ? `${base}/${opacity}` : base;
}

/**
 * Mapa de cores semânticas para uso em objetos/constants
 * Substitui cores hardcoded (amber-500, cyan-500) por classes semânticas
 */
export const semanticColorMap: Record<string, string> = {
  // Warning (substitui amber)
  "text-amber-500": "text-warning",
  "text-amber-600": "text-warning",
  "text-amber-700": "text-warning",
  "text-amber-800": "text-warning",
  "text-amber-900": "text-warning",
  "bg-amber-500": "bg-warning",
  "bg-amber-100": "bg-warning/10",
  "bg-amber-50": "bg-warning/5",
  "border-amber-500": "border-warning",
  "border-amber-200": "border-warning/20",

  // Info (substitui cyan)
  "text-cyan-500": "text-info",
  "text-cyan-600": "text-info",
  "text-cyan-800": "text-info",
  "bg-cyan-500": "bg-info",
  "bg-cyan-100": "bg-info/10",
  "border-cyan-500": "border-info",

  // Dark mode warning
  "dark:text-amber-200": "dark:text-warning",
  "dark:text-amber-300": "dark:text-warning",
  "dark:text-amber-400": "dark:text-warning",
  "dark:text-amber-100": "dark:text-warning",
  "dark:bg-amber-900": "dark:bg-warning/20",
  "dark:bg-amber-900/30": "dark:bg-warning/30",

  // Dark mode info
  "dark:text-cyan-200": "dark:text-info",
  "dark:bg-cyan-900": "dark:bg-info/20",
};

/**
 * Substitui cores hardcoded em uma string de classes Tailwind
 * @example mapLegacyColors("bg-amber-100 text-amber-800") // "bg-warning/10 text-warning"
 */
export function mapLegacyColors(classString: string): string {
  let result = classString;
  for (const [legacy, semantic] of Object.entries(semanticColorMap)) {
    result = result.replace(new RegExp(`\\b${legacy}\\b`, "g"), semantic);
  }
  return result;
}

/**
 * Cores semânticas com suporte a dark mode para badges/status
 * @example semanticStatusColors("warning") // "bg-warning/10 text-warning dark:bg-warning/20 dark:text-warning"
 */
export function semanticStatusColors(
  type: SemanticColorType,
  options: {
    bgOpacity?: number;
    darkBgOpacity?: number;
    textOpacity?: number;
    darkTextOpacity?: number;
  } = {},
): string {
  const { bgOpacity = 10, darkBgOpacity = 20 } = options;

  return `bg-${type}/${bgOpacity} text-${type} dark:bg-${type}/${darkBgOpacity} dark:text-${type}`;
}
