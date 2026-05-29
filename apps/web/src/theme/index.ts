/**
 * OrthoPlus Theme - Exportacoes
 * Fonte unica de verdade para design tokens
 */

// v3 Premium Tokens
export { tokensV3 } from "./tokens-v3";

// CSS Variables Generator
export {
  generateAllCssVars,
  generateVarsObject,
  cssVarNames,
} from "./generate-css-vars";

// Semantic Color Utilities
export {
  getSemanticColorClass,
  semanticColorMap,
  mapLegacyColors,
  semanticStatusColors,
} from "./semantic-colors";
export type { SemanticColorType, SemanticVariant } from "./semantic-colors";
