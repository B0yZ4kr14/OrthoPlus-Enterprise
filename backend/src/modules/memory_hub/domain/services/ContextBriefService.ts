import { SearchService } from "./SearchService"
import { DocumentRepository } from "../../infrastructure/DocumentRepository"

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
}

export class ContextBriefService {
  private searchService: SearchService

  constructor(searchService: SearchService, _documents: DocumentRepository) {
    this.searchService = searchService
  }

  async generateBrief(
    topic: string,
    maxTokens = 80000,
    _includeRelated = true,
  ): Promise<ContextBrief> {
    const { results } = await this.searchService.search(topic, {}, 20, 0)

    // Priority ranking: spec > plan > architecture > contract > memory > doc
    const priorityOrder = ["spec", "plan", "architecture", "contract", "memory", "doc"]
    const ranked = results.sort((a, b) => {
      const pa = priorityOrder.indexOf(a.docType)
      const pb = priorityOrder.indexOf(b.docType)
      if (pa !== pb) return pa - pb
      return b.relevanceScore - a.relevanceScore
    })

    // Select documents within token budget
    const selected: ContextBrief["documents"] = []
    let tokenCount = 0
    const tokensPerChar = 0.25

    for (const r of ranked) {
      const docTokens = Math.ceil(r.excerpt.length / tokensPerChar) + 500 // overhead for metadata
      if (tokenCount + docTokens > maxTokens && selected.length >= 3) {
        break
      }
      selected.push({
        sourcePath: r.sourcePath,
        docType: r.docType,
        relevance: r.relevanceScore,
        summary: r.excerpt.slice(0, 500),
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
    }
  }

  private renderMarkdown(
    topic: string,
    documents: ContextBrief["documents"],
  ): string {
    const lines: string[] = [
      "---",
      `topic: ${topic}`,
      `document_count: ${documents.length}`,
      `generated_at: ${new Date().toISOString()}`,
      "---",
      "",
      `# Context Brief: ${topic}`,
      "",
      "## Relevant Documents",
      "",
    ]

    for (const doc of documents) {
      lines.push(`### ${doc.sourcePath.split("/").pop()} (${doc.docType})`)
      lines.push(``)
      lines.push(`- **Relevance**: ${doc.relevance}`)
      lines.push(`- **Path**: ${doc.sourcePath}`)
      lines.push(``)
      lines.push(doc.summary)
      lines.push(``)
    }

    return lines.join("\n")
  }
}
