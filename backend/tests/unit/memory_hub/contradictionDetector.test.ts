import { ContradictionDetector } from "../../../src/modules/memory_hub/domain/services/ContradictionDetector"
import { IDocumentRepository } from "../../../src/modules/memory_hub/domain/ports/IDocumentRepository"

// Mock document repository
function createMockRepo(docs: Array<{
  sourcePath: string
  title?: string
  isArchived: boolean
  lastIndexed: number
  frontmatter?: string
}>): IDocumentRepository {
  return {
    listAll: () => docs,
    count: () => docs.length,
    findByPath: () => undefined,
    search: () => [],
    getById: () => undefined,
  } as unknown as IDocumentRepository
}

describe("ContradictionDetector", () => {
  it("should detect no contradictions when specs have no overlapping requirements", () => {
    const repo = createMockRepo([
      {
        sourcePath: "specs/001-feature/spec.md",
        isArchived: false,
        lastIndexed: Date.now(),
        frontmatter: JSON.stringify({
          rawContent: "- **MEM-FR-001**: The system MUST index all documents.\n- **MEM-FR-002**: The system MUST provide search.",
        }),
      },
      {
        sourcePath: "specs/002-other/spec.md",
        isArchived: false,
        lastIndexed: Date.now(),
        frontmatter: JSON.stringify({
          rawContent: "- **OTH-FR-001**: The system MUST send emails.\n- **OTH-FR-002**: The system MUST log events.",
        }),
      },
    ])

    const detector = new ContradictionDetector(repo)
    const result = detector.detect()

    expect(result).toEqual([])
  })

  it("should detect ID conflict when same requirement ID has different text", () => {
    const repo = createMockRepo([
      {
        sourcePath: "specs/001-feature/spec.md",
        isArchived: false,
        lastIndexed: Date.now(),
        frontmatter: JSON.stringify({
          rawContent: "- **MEM-FR-001**: The system MUST use PostgreSQL.",
        }),
      },
      {
        sourcePath: "specs/002-conflict/spec.md",
        isArchived: false,
        lastIndexed: Date.now(),
        frontmatter: JSON.stringify({
          rawContent: "- **MEM-FR-001**: The system MUST use SQLite.",
        }),
      },
    ])

    const detector = new ContradictionDetector(repo)
    const result = detector.detect()

    expect(result).toHaveLength(1)
    expect(result[0].type).toBe("contradictory_requirement")
    expect(result[0].severity).toBe("critical")
    expect(result[0].requirementId).toBe("MEM-FR-001")
    expect(result[0].description).toContain("MEM-FR-001")
  })

  it("should detect semantic contradiction on same topic with opposite modality", () => {
    const repo = createMockRepo([
      {
        sourcePath: "specs/001-feature/spec.md",
        isArchived: false,
        lastIndexed: Date.now(),
        frontmatter: JSON.stringify({
          rawContent: "- **MEM-FR-010**: The system MUST expose a CLI interface.",
        }),
      },
      {
        sourcePath: "specs/002-conflict/spec.md",
        isArchived: false,
        lastIndexed: Date.now(),
        frontmatter: JSON.stringify({
          rawContent: "- **MEM-FR-020**: The system MUST NOT expose a CLI interface.",
        }),
      },
    ])

    const detector = new ContradictionDetector(repo)
    const result = detector.detect()

    const contradiction = result.find((r) => r.type === "contradictory_requirement" && r.severity === "high")
    expect(contradiction).toBeDefined()
    expect(contradiction!.description).toContain("expose a cli interface")
  })

  it("should detect overlapping scope when two specs MUST the same topic", () => {
    const repo = createMockRepo([
      {
        sourcePath: "specs/001-auth/spec.md",
        isArchived: false,
        lastIndexed: Date.now(),
        frontmatter: JSON.stringify({
          rawContent: "- **AUTH-FR-001**: The system MUST validate API keys on startup.",
        }),
      },
      {
        sourcePath: "specs/002-security/spec.md",
        isArchived: false,
        lastIndexed: Date.now(),
        frontmatter: JSON.stringify({
          rawContent: "- **SEC-FR-001**: The system MUST validate API keys on every request.",
        }),
      },
    ])

    const detector = new ContradictionDetector(repo)
    const result = detector.detect()

    const overlap = result.find((r) => r.type === "overlapping_scope")
    expect(overlap).toBeDefined()
    expect(overlap!.severity).toBe("medium")
    expect(overlap!.description).toContain("validate api keys")
  })

  it("should skip archived documents", () => {
    const repo = createMockRepo([
      {
        sourcePath: "specs/001-feature/spec.md",
        isArchived: false,
        lastIndexed: Date.now(),
        frontmatter: JSON.stringify({
          rawContent: "- **MEM-FR-001**: The system MUST use PostgreSQL.",
        }),
      },
      {
        sourcePath: "specs/002-archived/spec.md",
        isArchived: true,
        lastIndexed: Date.now(),
        frontmatter: JSON.stringify({
          rawContent: "- **MEM-FR-001**: The system MUST use SQLite.",
        }),
      },
    ])

    const detector = new ContradictionDetector(repo)
    const result = detector.detect()

    expect(result).toEqual([])
  })

  it("should skip non-spec documents", () => {
    const repo = createMockRepo([
      {
        sourcePath: "docs/architecture.md",
        isArchived: false,
        lastIndexed: Date.now(),
        frontmatter: JSON.stringify({
          rawContent: "- **MEM-FR-001**: The system MUST use PostgreSQL.",
        }),
      },
    ])

    const detector = new ContradictionDetector(repo)
    const result = detector.detect()

    expect(result).toEqual([])
  })

  it("should deduplicate repeated contradictions", () => {
    const repo = createMockRepo([
      {
        sourcePath: "specs/001-a/spec.md",
        isArchived: false,
        lastIndexed: Date.now(),
        frontmatter: JSON.stringify({
          rawContent: "- **MEM-FR-001**: The system MUST use X.",
        }),
      },
      {
        sourcePath: "specs/002-b/spec.md",
        isArchived: false,
        lastIndexed: Date.now(),
        frontmatter: JSON.stringify({
          rawContent: "- **MEM-FR-001**: The system MUST use Y.",
        }),
      },
      {
        sourcePath: "specs/003-c/spec.md",
        isArchived: false,
        lastIndexed: Date.now(),
        frontmatter: JSON.stringify({
          rawContent: "- **MEM-FR-001**: The system MUST use Z.",
        }),
      },
    ])

    const detector = new ContradictionDetector(repo)
    const result = detector.detect()

    // Should find 3 unique pairs, but deduplication ensures no exact duplicates
    expect(result.length).toBeGreaterThanOrEqual(2)
    expect(result.length).toBeLessThanOrEqual(3)
  })
})
