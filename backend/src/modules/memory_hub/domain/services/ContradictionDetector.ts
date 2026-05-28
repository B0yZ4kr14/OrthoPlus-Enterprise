import fs from "fs"
import { logger } from "@/infrastructure/logger"
import { IDocumentRepository } from "../ports/IDocumentRepository"

export interface Contradiction {
  type: "contradictory_requirement" | "overlapping_scope" | "conflicting_decision"
  severity: "low" | "medium" | "high" | "critical"
  sourceDocument: string
  targetDocument: string
  description: string
  requirementId?: string
}

interface ParsedRequirement {
  id: string
  text: string
  modality: "must" | "should" | "must_not" | "may"
  topic: string
}

interface SpecDocument {
  sourcePath: string
  title?: string
  requirements: ParsedRequirement[]
  lastIndexed: number
}

/**
 * Detects contradictions between indexed specification documents (T055).
 * Compares requirements across specs to find overlapping or conflicting mandates.
 */
export class ContradictionDetector {
  private documents: IDocumentRepository

  constructor(documents: IDocumentRepository) {
    this.documents = documents
  }

  /**
   * Scan all indexed specs and detect contradictions.
   * Returns list of contradictions sorted by severity.
   */
  detect(): Contradiction[] {
    const specs = this.extractSpecs()
    const contradictions: Contradiction[] = []

    // Compare each pair of specs
    for (let i = 0; i < specs.length; i++) {
      for (let j = i + 1; j < specs.length; j++) {
        const a = specs[i]
        const b = specs[j]

        // Check for direct requirement ID conflicts (same ID, different text)
        contradictions.push(...this.detectIdConflicts(a, b))

        // Check for semantic contradictions (same topic, opposite modality)
        contradictions.push(...this.detectSemanticContradictions(a, b))

        // Check for overlapping scope (same topic, both MUST)
        contradictions.push(...this.detectOverlappingScope(a, b))
      }
    }

    // Deduplicate by description
    const seen = new Set<string>()
    const unique = contradictions.filter((c) => {
      const key = `${c.sourceDocument}|${c.targetDocument}|${c.description}`
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })

    // Sort by severity
    const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 }
    unique.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity])

    logger.info("[ContradictionDetector] Scan complete", {
      specsAnalyzed: specs.length,
      contradictionsFound: unique.length,
    })

    return unique
  }

  private extractSpecs(): SpecDocument[] {
    const allDocs = this.documents.listAll()
    const specs: SpecDocument[] = []

    for (const doc of allDocs) {
      if (!doc.sourcePath.includes("specs/")) continue
      if (doc.isArchived) continue

      try {
        const requirements = this.parseRequirements(doc.sourcePath, doc.frontmatter)
        if (requirements.length > 0) {
          specs.push({
            sourcePath: doc.sourcePath,
            title: doc.title || undefined,
            requirements,
            lastIndexed: doc.lastIndexed,
          })
        }
      } catch (error) {
        logger.warn("[ContradictionDetector] Failed to parse spec", {
          path: doc.sourcePath,
          error: error instanceof Error ? error.message : String(error),
        })
      }
    }

    return specs
  }

  private parseRequirements(sourcePath: string, frontmatter?: string): ParsedRequirement[] {
    // Try to extract raw content from frontmatter JSON
    let content = ""
    if (frontmatter) {
      try {
        const fm = JSON.parse(frontmatter) as Record<string, unknown>
        if (typeof fm.rawContent === "string") {
          content = fm.rawContent
        }
      } catch {
        // Not JSON frontmatter
      }
    }

    // If no content from frontmatter, read file directly
    if (!content) {
      if (fs.existsSync(sourcePath)) {
        content = fs.readFileSync(sourcePath, "utf-8")
      }
    }

    const requirements: ParsedRequirement[] = []
    const reqRegex = /^- \*\*([A-Z]+-FR-\d+)\*\*:\s*(.+)$/gm

    let match: RegExpExecArray | null
    while ((match = reqRegex.exec(content)) !== null) {
      const id = match[1]
      const text = match[2].trim()
      const lower = text.toLowerCase()

      let modality: ParsedRequirement["modality"] = "may"
      if (lower.includes("must not")) {
        modality = "must_not"
      } else if (lower.includes("must")) {
        modality = "must"
      } else if (lower.includes("should")) {
        modality = "should"
      }

      // Extract topic: first noun phrase after modality
      const topic = this.extractTopic(text)

      requirements.push({ id, text, modality, topic })
    }

    return requirements
  }

  private extractTopic(text: string): string {
    // Remove modality prefix
    const cleaned = text
      .replace(/^\s*(MUST NOT|MUST|SHOULD|MAY)\s+/i, "")
      .replace(/the system\s+/i, "")
      .trim()

    // Take first 3-5 words as topic signature
    const words = cleaned.split(/\s+/).slice(0, 5)
    return words.join(" ").toLowerCase().replace(/[^a-z0-9\s]/g, "")
  }

  private extractKeywords(text: string): Set<string> {
    const stopWords = new Set([
      "the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for",
      "of", "with", "by", "from", "as", "is", "was", "are", "be", "been",
      "system", "must", "should", "may", "not", "all", "any", "both", "each",
      "more", "most", "other", "some", "such", "no", "nor", "only", "own",
      "same", "so", "than", "too", "very", "can", "will", "just", "don",
      "should", "now", "use", "using", "via", "into", "over", "also",
    ])

    const cleaned = text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")
      .split(/\s+/)
      .filter((w) => w.length > 2 && !stopWords.has(w))

    return new Set(cleaned)
  }

  private hasKeywordOverlap(textA: string, textB: string, minOverlap: number = 2): boolean {
    const keywordsA = this.extractKeywords(textA)
    const keywordsB = this.extractKeywords(textB)

    let overlap = 0
    for (const kw of keywordsA) {
      if (keywordsB.has(kw)) overlap++
    }

    return overlap >= minOverlap
  }

  private detectIdConflicts(a: SpecDocument, b: SpecDocument): Contradiction[] {
    const conflicts: Contradiction[] = []
    const reqMapA = new Map(a.requirements.map((r) => [r.id, r]))

    for (const reqB of b.requirements) {
      const reqA = reqMapA.get(reqB.id)
      if (!reqA) continue

      // Same ID but different text = conflict
      if (reqA.text !== reqB.text) {
        conflicts.push({
          type: "contradictory_requirement",
          severity: "critical",
          sourceDocument: a.sourcePath,
          targetDocument: b.sourcePath,
          requirementId: reqB.id,
          description: `Requirement ${reqB.id} has different text in ${a.sourcePath} and ${b.sourcePath}`,
        })
      }
    }

    return conflicts
  }

  private detectSemanticContradictions(a: SpecDocument, b: SpecDocument): Contradiction[] {
    const conflicts: Contradiction[] = []

    for (const reqA of a.requirements) {
      for (const reqB of b.requirements) {
        // Skip if same ID (handled by detectIdConflicts)
        if (reqA.id === reqB.id) continue

        // Same topic but opposite modality
        if (
          this.hasKeywordOverlap(reqA.text, reqB.text, 2) &&
          ((reqA.modality === "must" && reqB.modality === "must_not") ||
            (reqA.modality === "must_not" && reqB.modality === "must"))
        ) {
          conflicts.push({
            type: "contradictory_requirement",
            severity: "high",
            sourceDocument: a.sourcePath,
            targetDocument: b.sourcePath,
            description: `Contradictory mandates on "${reqA.topic}": ${a.sourcePath} says "${reqA.modality}" while ${b.sourcePath} says "${reqB.modality}"`,
          })
        }
      }
    }

    return conflicts
  }

  private detectOverlappingScope(a: SpecDocument, b: SpecDocument): Contradiction[] {
    const overlaps: Contradiction[] = []

    for (const reqA of a.requirements) {
      for (const reqB of b.requirements) {
        if (reqA.id === reqB.id) continue

        // Both MUST on same topic but different specs
        if (
          this.hasKeywordOverlap(reqA.text, reqB.text, 2) &&
          reqA.modality === "must" &&
          reqB.modality === "must"
        ) {
          overlaps.push({
            type: "overlapping_scope",
            severity: "medium",
            sourceDocument: a.sourcePath,
            targetDocument: b.sourcePath,
            description: `Overlapping MUST requirements on "${reqA.topic}" in both ${a.sourcePath} and ${b.sourcePath}`,
          })
        }
      }
    }

    return overlaps
  }
}
