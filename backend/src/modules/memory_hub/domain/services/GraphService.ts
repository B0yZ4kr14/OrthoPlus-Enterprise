import { logger } from "@/infrastructure/logger"
import { IDocumentRepository } from "../ports/IDocumentRepository"

export interface GraphNode {
  id: string
  label: string
  docType: string
  sourcePath: string
}

export interface GraphEdge {
  source: string
  target: string
  type: "links-to" | "referenced-by"
}

export interface GraphData {
  nodes: GraphNode[]
  edges: GraphEdge[]
}

/**
 * Build a cross-reference graph from document links and references.
 * Extracts markdown links [text](path) and wiki-style links [[doc-name]].
 */
export class GraphService {
  private documents: IDocumentRepository

  constructor(documents: IDocumentRepository) {
    this.documents = documents
  }

  buildGraph(clinicId = "default"): GraphData {
    const docs = this.documents.listAll(clinicId)
    const nodes: GraphNode[] = docs.map((d) => ({
      id: d.id,
      label: d.title || d.sourcePath.split("/").pop() || d.id,
      docType: d.docType,
      sourcePath: d.sourcePath,
    }))

    const edges: GraphEdge[] = []

    for (const doc of docs) {
      try {
        const frontmatter = doc.frontmatter ? JSON.parse(doc.frontmatter) : {}
        const content = frontmatter.rawContent || ""

        // Extract markdown links: [text](path)
        const mdLinkRegex = /\[([^\]]+)\]\(([^)]+)\)/g
        let match: RegExpExecArray | null
        while ((match = mdLinkRegex.exec(content)) !== null) {
          const targetPath = match[2]
          const targetDoc = docs.find((d) =>
            d.sourcePath.endsWith(targetPath) || d.sourcePath.includes(targetPath),
          )
          if (targetDoc && targetDoc.id !== doc.id) {
            edges.push({
              source: doc.id,
              target: targetDoc.id,
              type: "links-to",
            })
          }
        }

        // Extract wiki-style links: [[doc-name]]
        const wikiLinkRegex = /\[\[([^\]]+)\]\]/g
        while ((match = wikiLinkRegex.exec(content)) !== null) {
          const wikiName = match[1].toLowerCase().replace(/\s+/g, "-")
          const targetDoc = docs.find((d) => {
            const fileName = d.sourcePath.split("/").pop()?.toLowerCase().replace(/\.md$/, "") || ""
            return fileName.includes(wikiName) || wikiName.includes(fileName)
          })
          if (targetDoc && targetDoc.id !== doc.id) {
            edges.push({
              source: doc.id,
              target: targetDoc.id,
              type: "links-to",
            })
          }
        }

        // Extract related specs from frontmatter
        const related = frontmatter.related
        if (Array.isArray(related)) {
          for (const rel of related) {
            const relPath = typeof rel === "string" ? rel : null
            if (relPath) {
              const targetDoc = docs.find((d) =>
                d.sourcePath.endsWith(relPath) || d.sourcePath.includes(relPath),
              )
              if (targetDoc && targetDoc.id !== doc.id) {
                edges.push({
                  source: doc.id,
                  target: targetDoc.id,
                  type: "links-to",
                })
              }
            }
          }
        }
      } catch (err) {
        logger.warn(`[GraphService] Failed to parse links for ${doc.sourcePath}`, { error: err })
      }
    }

    // Deduplicate edges
    const edgeKey = (e: GraphEdge) => `${e.source}->${e.target}`
    const seen = new Set<string>()
    const uniqueEdges = edges.filter((e) => {
      const key = edgeKey(e)
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })

    logger.info(`[GraphService] Built graph`, {
      nodeCount: nodes.length,
      edgeCount: uniqueEdges.length,
    })

    return { nodes, edges: uniqueEdges }
  }
}
