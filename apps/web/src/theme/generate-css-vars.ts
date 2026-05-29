/**
 * OrthoPlus Theme — CSS Variables Generator
 * Gera variáveis CSS a partir dos tokens v3 para uso em ThemeContext
 */

import { lightTheme, darkTheme } from "./tokens-v3";

/** Converte camelCase para kebab-case */
function toKebab(str: string): string {
  return str.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
}

/** Gera o bloco de variáveis CSS para um tema */
function generateThemeVars(
  theme: Record<string, string>,
  selector: string,
): string {
  const lines = Object.entries(theme).map(([key, value]) => {
    const varName = toKebab(key);
    return `    --${varName}: ${value};`;
  });

  return `${selector} {\n${lines.join("\n")}\n  }`;
}

/** Gera o CSS completo com todos os temas */
export function generateAllCssVars(): string {
  const lightVars = generateThemeVars(lightTheme, "  :root");
  const darkVars = generateThemeVars(darkTheme, "  .premium-dental-dark");

  return `@layer base {\n${lightVars}\n\n${darkVars}\n}`;
}

/** Gera apenas as variáveis como objeto (para ThemeContext) */
export function generateVarsObject(): Record<string, string> {
  const result: Record<string, string> = {};
  Object.entries(lightTheme).forEach(([key, value]) => {
    result[`--${toKebab(key)}`] = value;
  });
  return result;
}

/** Lista de nomes de variáveis CSS para validação */
export const cssVarNames = Object.keys(lightTheme).map((key) => toKebab(key));
