import yaml from "js-yaml"

export interface ParsedDocument {
  sourcePath: string
  frontmatter: Record<string, unknown>
  title: string
  headings: Array<{ level: number; text: string; line: number }>
  sections: Array<{
    heading: string
    level: number
    content: string
    startLine: number
    endLine: number
  }>
  rawContent: string
}

export class MarkdownParser {
  parse(sourcePath: string, rawContent: string): ParsedDocument {
    const lines = rawContent.split("\n")
    let frontmatter: Record<string, unknown> = {}
    let contentStart = 0

    // Extract YAML frontmatter
    if (lines[0]?.trim() === "---") {
      const endIdx = lines.slice(1).findIndex((l) => l.trim() === "---")
      if (endIdx !== -1) {
        const yamlBlock = lines.slice(1, endIdx + 1).join("\n")
        try {
          frontmatter = yaml.load(yamlBlock) as Record<string, unknown> || {}
        } catch {
          frontmatter = {}
        }
        contentStart = endIdx + 2
      }
    }

    // Extract headings
    const headings: ParsedDocument["headings"] = []
    for (let i = contentStart; i < lines.length; i++) {
      const match = lines[i].match(/^(#{1,6})\s+(.+)$/)
      if (match) {
        headings.push({
          level: match[1].length,
          text: match[2].trim(),
          line: i,
        })
      }
    }

    // Build sections from headings
    const sections: ParsedDocument["sections"] = []
    for (let i = 0; i < headings.length; i++) {
      const h = headings[i]
      const nextH = headings[i + 1]
      const endLine = nextH ? nextH.line - 1 : lines.length - 1
      const content = lines.slice(h.line + 1, endLine + 1).join("\n").trim()
      sections.push({
        heading: h.text,
        level: h.level,
        content,
        startLine: h.line,
        endLine,
      })
    }

    // Fallback: if no headings, entire doc is one section
    if (sections.length === 0) {
      sections.push({
        heading: frontmatter["title"] as string || "Document",
        level: 1,
        content: lines.slice(contentStart).join("\n").trim(),
        startLine: contentStart,
        endLine: lines.length - 1,
      })
    }

    const title = (frontmatter["title"] as string)
      || headings[0]?.text
      || sourcePath.split("/").pop()
      || "Untitled"

    return {
      sourcePath,
      frontmatter,
      title,
      headings,
      sections,
      rawContent,
    }
  }
}
