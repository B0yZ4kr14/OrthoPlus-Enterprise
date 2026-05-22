import { SearchService } from "./SearchService"
import { DocumentRepository } from "../../infrastructure/DocumentRepository"
import { logger } from "@/infrastructure/logger"

/**
 * Sanitize document excerpts to prevent prompt injection attacks.
 * Removes known instruction-override patterns and markdown boundary breakers.
 */
function sanitizeExcerpt(text: string): string {
  if (!text) return ""

  // Known prompt-injection patterns
  const injectionPatterns = [
    /ignore all previous instructions/gi,
    /ignore previous instructions/gi,
    /forget all prior instructions/gi,
    /disregard (all |previous )?instructions/gi,
    /you are now /gi,
    /your new role is /gi,
    /system:\s*override/gi,
    /override (previous|all) (instructions|prompts)/gi,
    /new instructions?:/gi,
    /\[SYSTEM\]/gi,
    /\[INST\]/gi,
    /\[\/INST\]/gi,
    /<system>/gi,
    /<\/system>/gi,
    /<instruction>/gi,
    /<\/instruction>/gi,
    /---\s*\n\s*system/gi,
  ]

  let sanitized = text
  for (const pattern of injectionPatterns) {
    sanitized = sanitized.replace(pattern, "[REDACTED]")
  }

  // Escape markdown metacharacters that could break brief structure
  // But preserve basic formatting for readability
  sanitized = sanitized
    .replace(/\n---\s*\n/g, "\n---\n") // Normalize horizontal rules
    .replace(/\n# /g, "\n\\# ") // Escape headings that could break structure
    .replace(/\n## /g, "\n\\## ")
    .replace(/\n### /g, "\n\\### ")

  return sanitized
}

/**
 * Validate and sanitize a topic string for safe interpolation into YAML frontmatter.
 */
function sanitizeTopic(topic: string): string {
  // Allow only alphanumeric, hyphens, underscores, dots, and slashes (feature IDs)
  // Reject control characters, newlines, and YAML metacharacters
  const safe = topic.replace(/[^\w\-\.\/\s]/g, "")
  if (safe !== topic) {
    logger.warn("[ContextBriefService] Topic contained unsafe characters, sanitized", {
      original: topic.slice(0, 100),
      sanitized: safe.slice(0, 100),
    })
  }
  return safe.trim()
}

export interface ContextBrief {
  topic: string
  tokenCount: number
  documents: Array<{
    sourcePath: string
    docType: string
    relevance: number
    summary: string
  }>
  markdown: string
  confidentialExcluded: number
}

export class ContextBriefService {
  private searchService: SearchService
  private documents: DocumentRepository

  constructor(searchService: SearchService, documents: DocumentRepository) {
    this.searchService = searchService
    this.documents = documents
  }

  async generateBrief(
    topic: string,
    maxTokens = 80000,
    _includeRelated = true,
    clinicId = "default",
  ): Promise<ContextBrief> {
    const { results } = await this.searchService.search(topic, {}, 20, 0, clinicId)

    // Priority ranking: spec > plan > architecture > contract > memory > doc
    const priorityOrder = ["spec", "plan", "architecture", "contract", "memory", "doc"]
    const ranked = results.sort((a, b) => {
      const pa = priorityOrder.indexOf(a.docType)
      const pb = priorityOrder.indexOf(b.docType)
      if (pa !== pb) return pa - pb
      return b.relevanceScore - a.relevanceScore
    })

    // Filter out confidential documents (Constitution GP-3 / FR-008)
    // Default-deny: if doc record is missing, exclude (F-RT-020-002)
    let confidentialExcluded = 0
    const accessible: typeof ranked = []
    for (const r of ranked) {
      const doc = this.documents.findByPath(r.sourcePath)
      if (!doc) {
        logger.warn("[ContextBriefService] Document record missing for search result, excluding", {
          sourcePath: r.sourcePath,
        })
        confidentialExcluded++
        continue
      }
      if (this.documents.isConfidential(doc)) {
        confidentialExcluded++
        continue
      }
      accessible.push(r)
    }

    // Select documents within token budget
    const selected: ContextBrief["documents"] = []
    let tokenCount = 0
    const tokensPerChar = 0.25

    for (const r of accessible) {
      const sanitizedExcerpt = sanitizeExcerpt(r.excerpt)
      const docTokens = Math.ceil(sanitizedExcerpt.length / tokensPerChar) + 500 // overhead for metadata
      // Hard token budget cap — never exceed regardless of document count (F-RT-020-003)
      if (tokenCount + docTokens > maxTokens) {
        break
      }
      selected.push({
        sourcePath: r.sourcePath,
        docType: r.docType,
        relevance: r.relevanceScore,
        summary: sanitizedExcerpt.slice(0, 500),
      })
      tokenCount += docTokens
    }

    // Generate Markdown brief
    const markdown = this.renderMarkdown(topic, selected)

    return {
      topic,
      tokenCount,
      documents: selected,
      markdown,
      confidentialExcluded,
    }
  }

  private renderMarkdown(
    topic: string,
    documents: ContextBrief["documents"],
  ): string {
    const safeTopic = sanitizeTopic(topic)
    const lines: string[] = [
      "---",
      `topic: ${safeTopic}`,
      `document_count: ${documents.length}`,
      `generated_at: ${new Date().toISOString()}`,
      "---",
      "",
      `# Context Brief: ${safeTopic}`,
      "",
      "## Relevant Documents",
      "",
    ]

    for (const doc of documents) {
      const safeSummary = sanitizeExcerpt(doc.summary)
      lines.push(`### ${doc.sourcePath.split("/").pop()} (${doc.docType})`)
      lines.push(``)
      lines.push(`- **Relevance**: ${doc.relevance}`)
      lines.push(`- **Path**: ${doc.sourcePath}`)
      lines.push(``)
      lines.push(safeSummary)
      lines.push(``)
    }

    return lines.join("\n")
  }
}
