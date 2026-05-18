/**
 * OrthoPlus Theme - Exportacoes
 * Fonte unica de verdade para design tokens
 */

export { theme, default } from './tokens'
export { colors } from './tokens'
export { borders } from './tokens'
export { typography } from './tokens'
export { shadows } from './tokens'
export { gradients } from './tokens'
export { animations } from './tokens'
export { spacing } from './tokens'
export { zIndex } from './tokens'
export { breakpoints } from './tokens'

// v3 Premium Tokens
export { tokensV3 } from './tokens-v3'

// Semantic Color Utilities
export {
  getSemanticColorClass,
  semanticColorMap,
  mapLegacyColors,
  semanticStatusColors,
} from './semantic-colors'
export type { SemanticColorType, SemanticVariant } from './semantic-colors'
