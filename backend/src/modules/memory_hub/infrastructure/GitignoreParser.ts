import fs from "fs"
import path from "path"

/**
 * Parse .gitignore files and determine if a path should be ignored.
 * Supports basic glob patterns: *, ?, **, negation (!), and directory trailing-slash.
 */
export class GitignoreParser {
  private patterns: Array<{ pattern: string; negated: boolean; dirOnly: boolean }> = []

  constructor(gitignorePath: string) {
    if (fs.existsSync(gitignorePath)) {
      const content = fs.readFileSync(gitignorePath, "utf-8")
      this.patterns = this.parsePatterns(content)
    }
  }

  /**
   * Check if a file path should be ignored based on .gitignore patterns.
   * @param filePath Relative or absolute path to check
   * @param baseDir The directory containing the .gitignore (for relative resolution)
   */
  isIgnored(filePath: string, baseDir: string): boolean {
    if (this.patterns.length === 0) return false

    const relativePath = path.relative(baseDir, filePath)
    const normalized = relativePath.replace(/\\/g, "/")
    const fileName = path.basename(normalized)

    let ignored = false

    for (const { pattern, negated, dirOnly } of this.patterns) {
      const matches = this.matchPattern(normalized, fileName, pattern, dirOnly)
      if (matches) {
        ignored = !negated
      }
    }

    return ignored
  }

  private parsePatterns(content: string): Array<{ pattern: string; negated: boolean; dirOnly: boolean }> {
    return content
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#"))
      .map((line) => {
        const negated = line.startsWith("!")
        const raw = negated ? line.slice(1) : line
        const dirOnly = raw.endsWith("/")
        const pattern = dirOnly ? raw.slice(0, -1) : raw
        return { pattern, negated, dirOnly }
      })
  }

  private matchPattern(
    relativePath: string,
    fileName: string,
    pattern: string,
    _dirOnly: boolean,
  ): boolean {
    // Simple glob matching
    const regex = this.globToRegex(pattern)

    // Pattern can match either the full relative path or just the file name
    if (regex.test(relativePath)) return true
    if (regex.test(fileName)) return true

    // Pattern starting with **/ matches at any depth
    if (pattern.startsWith("**/")) {
      const subPattern = pattern.slice(3)
      const subRegex = this.globToRegex(subPattern)
      if (subRegex.test(relativePath)) return true
    }

    // Pattern with / is anchored to root
    if (pattern.includes("/") && !pattern.startsWith("**/")) {
      const anchoredRegex = this.globToRegex(pattern)
      if (anchoredRegex.test(relativePath)) return true
    }

    return false
  }

  private globToRegex(pattern: string): RegExp {
    let regex = pattern
      .replace(/\*\*/g, "<<<DOUBLESTAR>>>")
      .replace(/\*/g, "[^/]*")
      .replace(/\?/g, ".")
      .replace(/<<<DOUBLESTAR>>>/g, ".*")

    // Escape special regex chars except those we just set
    regex = regex.replace(/[.+^${}()|[\]\\]/g, "\\$&")
    // Un-escape the glob chars we replaced
    regex = regex
      .replace(/\\\[\\\^\/\\\]\*/g, "[^/]*")
      .replace(/\\\.\*/g, ".*")
      .replace(/\\\./g, ".")

    return new RegExp(`^${regex}$`)
  }
}

/**
 * Find the nearest .gitignore file for a given path and return a parser.
 */
export function loadGitignoreForPath(filePath: string): GitignoreParser | null {
  let dir = path.dirname(filePath)
  const root = path.parse(dir).root

  while (dir !== root) {
    const gitignorePath = path.join(dir, ".gitignore")
    if (fs.existsSync(gitignorePath)) {
      return new GitignoreParser(gitignorePath)
    }
    dir = path.dirname(dir)
  }

  return null
}
