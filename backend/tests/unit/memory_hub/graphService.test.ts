import Database from "better-sqlite3";
import fs from "fs";
import path from "path";
import os from "os";
import { DocumentRepository } from "../../../src/modules/memory_hub/infrastructure/DocumentRepository";
import { GraphService } from "../../../src/modules/memory_hub/domain/services/GraphService";

describe("T055: GraphService", () => {
  let db: Database.Database;
  let repo: DocumentRepository;
  let graphService: GraphService;
  let tempDir: string;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "memory-hub-graph-test-"));
    const dbPath = path.join(tempDir, "test.db");
    db = new Database(dbPath);

    db.exec(`
      CREATE TABLE documents (
        id TEXT PRIMARY KEY,
        clinic_id TEXT NOT NULL DEFAULT 'default',
        source_path TEXT NOT NULL,
        doc_type TEXT NOT NULL,
        title TEXT,
        content_hash TEXT NOT NULL,
        last_indexed INTEGER,
        last_modified INTEGER,
        author TEXT,
        feature_number TEXT,
        version INTEGER DEFAULT 1,
        word_count INTEGER,
        is_archived INTEGER DEFAULT 0,
        frontmatter TEXT,
        UNIQUE(clinic_id, source_path)
      );
    `);

    repo = new DocumentRepository(db);
    graphService = new GraphService(repo);
  });

  afterEach(() => {
    db.close();
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  it("builds empty graph when no documents", () => {
    const graph = graphService.buildGraph();
    expect(graph.nodes).toEqual([]);
    expect(graph.edges).toEqual([]);
  });

  it("creates nodes for all documents", () => {
    repo.upsert({
      clinicId: "default",
      sourcePath: "specs/001-pacientes/spec.md",
      docType: "spec",
      title: "Pacientes",
      contentHash: "abc",
      lastModified: Date.now(),
      wordCount: 100,
      isArchived: false,
      frontmatter: JSON.stringify({}),
    });
    repo.upsert({
      clinicId: "default",
      sourcePath: "specs/002-agenda/spec.md",
      docType: "spec",
      title: "Agenda",
      contentHash: "def",
      lastModified: Date.now(),
      wordCount: 100,
      isArchived: false,
      frontmatter: JSON.stringify({}),
    });

    const graph = graphService.buildGraph();
    expect(graph.nodes).toHaveLength(2);
    const labels = graph.nodes.map((n) => n.label).sort();
    expect(labels).toEqual(["Agenda", "Pacientes"]);
  });

  it("creates edges from markdown links in frontmatter", () => {
    repo.upsert({
      clinicId: "default",
      sourcePath: "specs/001-pacientes/spec.md",
      docType: "spec",
      title: "Pacientes",
      contentHash: "abc",
      lastModified: Date.now(),
      wordCount: 100,
      isArchived: false,
      frontmatter: JSON.stringify({
        rawContent: "See also [Agenda](specs/002-agenda/spec.md)",
      }),
    });
    repo.upsert({
      clinicId: "default",
      sourcePath: "specs/002-agenda/spec.md",
      docType: "spec",
      title: "Agenda",
      contentHash: "def",
      lastModified: Date.now(),
      wordCount: 100,
      isArchived: false,
      frontmatter: JSON.stringify({}),
    });

    const graph = graphService.buildGraph();
    expect(graph.edges).toHaveLength(1);
    expect(graph.edges[0].type).toBe("links-to");
  });

  it("creates edges from wiki-style links", () => {
    repo.upsert({
      clinicId: "default",
      sourcePath: "docs/architecture.md",
      docType: "architecture",
      title: "Architecture",
      contentHash: "abc",
      lastModified: Date.now(),
      wordCount: 100,
      isArchived: false,
      frontmatter: JSON.stringify({
        rawContent: "See [[pacientes-spec]] for details",
      }),
    });
    repo.upsert({
      clinicId: "default",
      sourcePath: "specs/001-pacientes/spec.md",
      docType: "spec",
      title: "Pacientes Spec",
      contentHash: "def",
      lastModified: Date.now(),
      wordCount: 100,
      isArchived: false,
      frontmatter: JSON.stringify({}),
    });

    const graph = graphService.buildGraph();
    expect(graph.edges).toHaveLength(1);
  });

  it("deduplicates edges", () => {
    repo.upsert({
      clinicId: "default",
      sourcePath: "specs/001-pacientes/spec.md",
      docType: "spec",
      title: "Pacientes",
      contentHash: "abc",
      lastModified: Date.now(),
      wordCount: 100,
      isArchived: false,
      frontmatter: JSON.stringify({
        rawContent:
          "[Link1](specs/002-agenda/spec.md) [Link2](specs/002-agenda/spec.md)",
      }),
    });
    repo.upsert({
      clinicId: "default",
      sourcePath: "specs/002-agenda/spec.md",
      docType: "spec",
      title: "Agenda",
      contentHash: "def",
      lastModified: Date.now(),
      wordCount: 100,
      isArchived: false,
      frontmatter: JSON.stringify({}),
    });

    const graph = graphService.buildGraph();
    expect(graph.edges).toHaveLength(1);
  });
});
