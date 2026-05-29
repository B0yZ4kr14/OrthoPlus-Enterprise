import { TokenCounter } from "./TokenCounter";

export interface DocumentChunk {
  content: string;
  headingPath: string[];
  startLine: number;
  endLine: number;
  tokenCount: number;
}

export class DocumentChunker {
  private readonly maxTokens: number;
  private readonly overlapTokens: number;

  constructor(maxTokens = 512, overlapTokens = 64) {
    this.maxTokens = maxTokens;
    this.overlapTokens = overlapTokens;
  }

  chunk(
    sections: Array<{
      heading: string;
      level: number;
      content: string;
      startLine: number;
      endLine: number;
    }>,
  ): DocumentChunk[] {
    const chunks: DocumentChunk[] = [];

    for (const section of sections) {
      const headingPath = this.buildHeadingPath(section.heading, sections);
      const sectionChunks = this.chunkText(
        section.content,
        headingPath,
        section.startLine,
      );
      chunks.push(...sectionChunks);
    }

    return chunks;
  }

  private buildHeadingPath(
    currentHeading: string,
    sections: Array<{ heading: string; level: number }>,
  ): string[] {
    const path: string[] = [];
    const current = sections.find((s) => s.heading === currentHeading);
    if (!current) return [currentHeading];

    for (const s of sections) {
      if (s.level < current.level) {
        path.push(s.heading);
      }
    }
    path.push(currentHeading);
    return path;
  }

  private chunkText(
    text: string,
    headingPath: string[],
    startLineOffset: number,
  ): DocumentChunk[] {
    // Use accurate token counting (P3)
    const totalTokens = TokenCounter.count(text);

    if (totalTokens <= this.maxTokens) {
      return [
        {
          content: text,
          headingPath,
          startLine: startLineOffset,
          endLine: startLineOffset + text.split("\n").length,
          tokenCount: totalTokens,
        },
      ];
    }

    // Fallback: character-based chunking for large texts
    const charsPerToken = 4;
    const maxChars = this.maxTokens * charsPerToken;
    const overlapChars = this.overlapTokens * charsPerToken;

    const chunks: DocumentChunk[] = [];
    let pos = 0;
    let lineCounter = startLineOffset;

    while (pos < text.length) {
      const end = Math.min(pos + maxChars, text.length);
      // Try to break at paragraph boundary
      let breakPoint = end;
      const paragraphBreak = text.lastIndexOf("\n\n", end);
      if (paragraphBreak > pos + maxChars * 0.5) {
        breakPoint = paragraphBreak;
      } else {
        const sentenceBreak = text.lastIndexOf(". ", end);
        if (sentenceBreak > pos + maxChars * 0.5) {
          breakPoint = sentenceBreak + 2;
        }
      }

      const chunkText = text.slice(pos, breakPoint);
      const linesInChunk = chunkText.split("\n").length;
      const chunkTokens = TokenCounter.count(chunkText);

      chunks.push({
        content: chunkText,
        headingPath,
        startLine: lineCounter,
        endLine: lineCounter + linesInChunk,
        tokenCount: chunkTokens,
      });

      lineCounter += linesInChunk;
      pos = breakPoint - overlapChars;
      if (pos <= 0 || pos >= text.length - overlapChars) pos = breakPoint;
    }

    return chunks;
  }
}
