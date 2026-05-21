export interface DocumentChunk {
  content: string
  headingPath: string[]
  startLine: number
  endLine: number
  tokenCount: number
}

export class DocumentChunker {
  private readonly maxTokens: number
  private readonly overlapTokens: number

  constructor(maxTokens = 512, overlapTokens = 64) {
    this.maxTokens = maxTokens
    this.overlapTokens = overlapTokens
  }

  chunk(
    sections: Array<{
      heading: string
      level: number
      content: string
      startLine: number
      endLine: number
    }>,
  ): DocumentChunk[] {
    const chunks: DocumentChunk[] = []

    for (const section of sections) {
      const headingPath = this.buildHeadingPath(section.heading, sections)
      const sectionChunks = this.chunkText(
        section.content,
        headingPath,
        section.startLine,
      )
      chunks.push(...sectionChunks)
    }

    return chunks
  }

  private buildHeadingPath(
    currentHeading: string,
    sections: Array<{ heading: string; level: number }>,
  ): string[] {
    const path: string[] = []
    const current = sections.find((s) => s.heading === currentHeading)
    if (!current) return [currentHeading]

    for (const s of sections) {
      if (s.level < current.level) {
        path.push(s.heading)
      }
    }
    path.push(currentHeading)
    return path
  }

  private chunkText(
    text: string,
    headingPath: string[],
    startLineOffset: number,
  ): DocumentChunk[] {
    const words = text.split(/\s+/)
    const maxWords = Math.floor(this.maxTokens / 1.3)
    const overlapWords = Math.floor(this.overlapTokens / 1.3)

    if (words.length <= maxWords) {
      return [{
        content: text,
        headingPath,
        startLine: startLineOffset,
        endLine: startLineOffset + text.split("\n").length,
        tokenCount: Math.ceil(words.length * 1.3),
      }]
    }

    const chunks: DocumentChunk[] = []
    let i = 0
    let lineCounter = startLineOffset

    while (i < words.length) {
      const end = Math.min(i + maxWords, words.length)
      const chunkWords = words.slice(i, end)
      const chunkText = chunkWords.join(" ")
      const linesInChunk = chunkText.split("\n").length

      chunks.push({
        content: chunkText,
        headingPath,
        startLine: lineCounter,
        endLine: lineCounter + linesInChunk,
        tokenCount: Math.ceil(chunkWords.length * 1.3),
      })

      lineCounter += linesInChunk
      i += maxWords - overlapWords
    }

    return chunks
  }
}
