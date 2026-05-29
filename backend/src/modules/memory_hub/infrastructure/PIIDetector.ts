/**
 * PII/PHI Detector for memory hub indexing
 * Prevents accidental indexing of documents containing sensitive data
 *
 * F-RT-020-007 remediation: Automated sensitive-data scanning
 */

export interface PIIDetectionResult {
  hasPII: boolean;
  detectedTypes: string[];
  matchCount: number;
  confidence: "low" | "medium" | "high";
}

interface PIIPattern {
  name: string;
  regex: RegExp;
  weight: number; // how many "points" this match contributes
}

// Brazilian PII patterns for dental SaaS context
const PII_PATTERNS: PIIPattern[] = [
  {
    name: "CPF",
    regex: /\b\d{3}[.\s]?\d{3}[.\s]?\d{3}[-\s]?\d{2}\b/g,
    weight: 3,
  },
  {
    name: "CNPJ",
    regex: /\b\d{2}[.\s]?\d{3}[.\s]?\d{3}\/\d{4}[-\s]?\d{2}\b/g,
    weight: 3,
  },
  {
    name: "EMAIL",
    regex: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
    weight: 2,
  },
  {
    name: "PHONE_BR",
    regex: /(?:\+55\s?)?\(?\d{2}\)?[\s.-]?\d{4,5}[\s.-]?\d{4}/g,
    weight: 2,
  },
  {
    name: "RG",
    regex: /\b\d{1,2}[.\s]?\d{3}[.\s]?\d{3}[-\s]?[\dXx]\b/g,
    weight: 2,
  },
  {
    name: "CREDIT_CARD",
    regex: /\b(?:\d{4}[\s-]?){3}\d{4}\b/g,
    weight: 5,
  },
  {
    name: "HEALTH_INSURANCE",
    regex:
      /\b(?:cart[ãa]o\s+)?(?:plano\s+de\s+sa[úu]de|convenio|conv[êe]nio)\s*:?\s*\d{6,20}\b/gi,
    weight: 2,
  },
  {
    name: "PATIENT_RECORD",
    regex: /\b(?:prontu[áa]rio|ficha|registro)\s*:?\s*#?\s*\d{4,10}\b/gi,
    weight: 1,
  },
];

// Thresholds for confidence levels
const THRESHOLDS = {
  low: 1, // 1 point = low confidence
  medium: 3, // 2-3 points = medium confidence
  high: 5, // 5+ points = high confidence
};

// Frontmatter flag that allows explicit override
const LAWFUL_BASIS_KEYS = [
  "lawful_basis",
  "lawfulBasis",
  "legal_basis",
  "legalBasis",
];

export class PIIDetector {
  private patterns: PIIPattern[];
  private blockThreshold: number;

  constructor(options?: { patterns?: PIIPattern[]; blockThreshold?: number }) {
    this.patterns = options?.patterns ?? PII_PATTERNS;
    this.blockThreshold = options?.blockThreshold ?? 2;
  }

  /**
   * Scan text content for PII/PHI
   */
  scan(content: string): PIIDetectionResult {
    let totalWeight = 0;
    const detectedTypes: string[] = [];

    for (const pattern of this.patterns) {
      const matches = content.match(pattern.regex);
      if (matches && matches.length > 0) {
        totalWeight += pattern.weight * matches.length;
        detectedTypes.push(`${pattern.name}(${matches.length})`);
      }
    }

    const confidence = this.calculateConfidence(totalWeight);
    const hasPII = totalWeight >= this.blockThreshold;

    return {
      hasPII,
      detectedTypes,
      matchCount: detectedTypes.length,
      confidence,
    };
  }

  /**
   * Check if frontmatter contains a lawful basis declaration
   * that explicitly permits indexing of sensitive content
   */
  hasLawfulBasis(frontmatter: Record<string, unknown>): boolean {
    for (const key of LAWFUL_BASIS_KEYS) {
      const value = frontmatter[key];
      if (value !== undefined && value !== null && value !== "") {
        return true;
      }
    }
    return false;
  }

  /**
   * Combined check: scan content AND verify no lawful basis override
   */
  shouldBlockIndexing(
    content: string,
    frontmatter: Record<string, unknown> = {},
  ): { blocked: boolean; reason: string | null } {
    // If lawful basis is declared, allow indexing despite PII
    if (this.hasLawfulBasis(frontmatter)) {
      return { blocked: false, reason: null };
    }

    const result = this.scan(content);
    if (result.hasPII) {
      return {
        blocked: true,
        reason: `PII detected: ${result.detectedTypes.join(", ")} (confidence: ${result.confidence})`,
      };
    }

    return { blocked: false, reason: null };
  }

  private calculateConfidence(totalWeight: number): "low" | "medium" | "high" {
    if (totalWeight >= THRESHOLDS.high) return "high";
    if (totalWeight >= THRESHOLDS.medium) return "medium";
    return "low";
  }
}

// Singleton instance for default usage
export const piiDetector = new PIIDetector();
