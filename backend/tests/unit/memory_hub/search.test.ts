import { SearchService } from "../../../src/modules/memory_hub/domain/services/SearchService";
import { OllamaEmbeddingClient } from "../../../src/modules/memory_hub/infrastructure/OllamaEmbeddingClient";
import { EmbeddingRepository } from "../../../src/modules/memory_hub/infrastructure/EmbeddingRepository";
import { DocumentRepository } from "../../../src/modules/memory_hub/infrastructure/DocumentRepository";

// Mocks
jest.mock(
  "../../../src/modules/memory_hub/infrastructure/OllamaEmbeddingClient",
);
jest.mock("../../../src/modules/memory_hub/infrastructure/EmbeddingRepository");

describe("SearchService", () => {
  let searchService: SearchService;
  let mockEmbedder: jest.Mocked<OllamaEmbeddingClient>;
  let mockEmbeddings: jest.Mocked<EmbeddingRepository>;
  let mockDocuments: jest.Mocked<DocumentRepository>;

  beforeEach(() => {
    mockEmbedder =
      new OllamaEmbeddingClient() as jest.Mocked<OllamaEmbeddingClient>;
    mockEmbeddings = new EmbeddingRepository(
      {} as any,
    ) as jest.Mocked<EmbeddingRepository>;
    mockDocuments = new DocumentRepository(
      {} as any,
    ) as jest.Mocked<DocumentRepository>;
    searchService = new SearchService(
      mockEmbedder,
      mockEmbeddings,
      mockDocuments,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("T014: semantic search returns results ordered by relevance", () => {
    it("returns empty results when no embeddings match", async () => {
      mockEmbedder.embedSingle = jest.fn().mockResolvedValue({
        embedding: [1, 0, 0],
        model: "nomic-embed-text",
      });
      mockEmbeddings.searchSimilar = jest.fn().mockReturnValue([]);

      const result = await searchService.search("rate limiting");

      expect(result.results).toEqual([]);
      expect(result.total).toBe(0);
    });

    it("returns results ordered by descending relevance score", async () => {
      mockEmbedder.embedSingle = jest.fn().mockResolvedValue({
        embedding: [1, 0, 0],
        model: "nomic-embed-text",
      });

      const mockRawResults = [
        {
          chunkId: "chunk-1",
          documentId: "doc-1",
          sourcePath: "specs/001-pacientes/spec.md",
          content: "Patient management spec",
          headingPath: "[]",
          relevanceScore: 0.95,
        },
        {
          chunkId: "chunk-2",
          documentId: "doc-2",
          sourcePath: "specs/002-agenda/spec.md",
          content: "Appointment scheduling spec",
          headingPath: "[]",
          relevanceScore: 0.72,
        },
        {
          chunkId: "chunk-3",
          documentId: "doc-3",
          sourcePath: "specs/003-pep/spec.md",
          content: "PEP medical record spec",
          headingPath: "[]",
          relevanceScore: 0.88,
        },
      ];

      mockEmbeddings.searchSimilar = jest.fn().mockReturnValue(mockRawResults);

      const result = await searchService.search("patient");

      expect(result.results.length).toBe(3);
      expect(result.results[0].relevanceScore).toBe(0.95);
      expect(result.results[1].relevanceScore).toBe(0.88);
      expect(result.results[2].relevanceScore).toBe(0.72);
      expect(result.total).toBe(3);
    });

    it("deduplicates by document keeping highest scoring chunk", async () => {
      mockEmbedder.embedSingle = jest.fn().mockResolvedValue({
        embedding: [1, 0, 0],
        model: "nomic-embed-text",
      });

      const mockRawResults = [
        {
          chunkId: "chunk-1",
          documentId: "doc-1",
          sourcePath: "specs/001-pacientes/spec.md",
          content: "High scoring chunk",
          headingPath: "[]",
          relevanceScore: 0.95,
        },
        {
          chunkId: "chunk-2",
          documentId: "doc-1",
          sourcePath: "specs/001-pacientes/spec.md",
          content: "Lower scoring chunk from same doc",
          headingPath: "[]",
          relevanceScore: 0.65,
        },
        {
          chunkId: "chunk-3",
          documentId: "doc-2",
          sourcePath: "specs/002-agenda/spec.md",
          content: "Another doc chunk",
          headingPath: "[]",
          relevanceScore: 0.8,
        },
      ];

      mockEmbeddings.searchSimilar = jest.fn().mockReturnValue(mockRawResults);

      const result = await searchService.search("test");

      expect(result.results.length).toBe(2);
      expect(result.total).toBe(2);
      // doc-1 should appear with the highest score (0.95)
      const doc1Result = result.results.find((r) =>
        r.sourcePath.includes("001-pacientes"),
      );
      expect(doc1Result?.relevanceScore).toBe(0.95);
    });

    it("infers docType from sourcePath", async () => {
      mockEmbedder.embedSingle = jest.fn().mockResolvedValue({
        embedding: [1, 0, 0],
        model: "nomic-embed-text",
      });

      const mockRawResults = [
        {
          chunkId: "chunk-1",
          documentId: "doc-1",
          sourcePath: "specs/001-pacientes/spec.md",
          content: "Spec content",
          headingPath: "[]",
          relevanceScore: 0.9,
        },
        {
          chunkId: "chunk-2",
          documentId: "doc-2",
          sourcePath: "plans/architecture.md",
          content: "Plan content",
          headingPath: "[]",
          relevanceScore: 0.8,
        },
        {
          chunkId: "chunk-3",
          documentId: "doc-3",
          sourcePath: ".specify/memory/constitution.md",
          content: "Memory content",
          headingPath: "[]",
          relevanceScore: 0.7,
        },
        {
          chunkId: "chunk-4",
          documentId: "doc-4",
          sourcePath: "docs/README.md",
          content: "Doc content",
          headingPath: "[]",
          relevanceScore: 0.6,
        },
      ];

      mockEmbeddings.searchSimilar = jest.fn().mockReturnValue(mockRawResults);

      const result = await searchService.search("test");

      expect(
        result.results.find((r) => r.sourcePath.includes("specs/"))?.docType,
      ).toBe("spec");
      expect(
        result.results.find((r) => r.sourcePath.includes("plans/"))?.docType,
      ).toBe("plan");
      expect(
        result.results.find((r) => r.sourcePath.includes(".specify/memory/"))
          ?.docType,
      ).toBe("memory");
      expect(
        result.results.find((r) => r.sourcePath.includes("docs/"))?.docType,
      ).toBe("doc");
    });

    it("truncates excerpts longer than 300 chars", async () => {
      mockEmbedder.embedSingle = jest.fn().mockResolvedValue({
        embedding: [1, 0, 0],
        model: "nomic-embed-text",
      });

      const longContent = "a".repeat(500);
      const mockRawResults = [
        {
          chunkId: "chunk-1",
          documentId: "doc-1",
          sourcePath: "docs/README.md",
          content: longContent,
          headingPath: "[]",
          relevanceScore: 0.9,
        },
      ];

      mockEmbeddings.searchSimilar = jest.fn().mockReturnValue(mockRawResults);

      const result = await searchService.search("test");

      expect(result.results[0].excerpt).toBe("a".repeat(300) + "...");
      expect(result.results[0].excerpt.length).toBe(303);
    });

    it("respects pagination (limit and offset)", async () => {
      mockEmbedder.embedSingle = jest.fn().mockResolvedValue({
        embedding: [1, 0, 0],
        model: "nomic-embed-text",
      });

      const mockRawResults = Array.from({ length: 10 }, (_, i) => ({
        chunkId: `chunk-${i}`,
        documentId: `doc-${i}`,
        sourcePath: `docs/doc-${i}.md`,
        content: `Content ${i}`,
        headingPath: "[]",
        relevanceScore: 0.9 - i * 0.05,
      }));

      mockEmbeddings.searchSimilar = jest.fn().mockReturnValue(mockRawResults);

      const result = await searchService.search("test", {}, 3, 2);

      expect(result.results.length).toBe(3);
      expect(result.total).toBe(10);
      expect(result.results[0].relevanceScore).toBeCloseTo(0.8, 1);
    });
  });

  describe("T015: search filters by doc_type and archived status", () => {
    it("passes docTypes filter to EmbeddingRepository", async () => {
      mockEmbedder.embedSingle = jest.fn().mockResolvedValue({
        embedding: [1, 0, 0],
        model: "nomic-embed-text",
      });
      mockEmbeddings.searchSimilar = jest.fn().mockReturnValue([]);

      await searchService.search("rate limiting", {
        docTypes: ["spec", "plan"],
      });

      expect(mockEmbeddings.searchSimilar).toHaveBeenCalledWith(
        [1, 0, 0],
        "nomic-embed-text",
        10,
        ["spec", "plan"],
        "default",
        undefined,
        undefined,
        undefined,
        undefined,
      );
    });

    it("passes undefined docTypes when no filter provided", async () => {
      mockEmbedder.embedSingle = jest.fn().mockResolvedValue({
        embedding: [1, 0, 0],
        model: "nomic-embed-text",
      });
      mockEmbeddings.searchSimilar = jest.fn().mockReturnValue([]);

      await searchService.search("rate limiting");

      expect(mockEmbeddings.searchSimilar).toHaveBeenCalledWith(
        [1, 0, 0],
        "nomic-embed-text",
        10,
        undefined,
        "default",
        undefined,
        undefined,
        undefined,
        undefined,
      );
    });

    it("filters by single docType", async () => {
      mockEmbedder.embedSingle = jest.fn().mockResolvedValue({
        embedding: [1, 0, 0],
        model: "nomic-embed-text",
      });

      const mockRawResults = [
        {
          chunkId: "chunk-1",
          documentId: "doc-1",
          sourcePath: "specs/001-pacientes/spec.md",
          content: "Spec content",
          headingPath: "[]",
          relevanceScore: 0.9,
        },
      ];

      mockEmbeddings.searchSimilar = jest.fn().mockReturnValue(mockRawResults);

      const result = await searchService.search("patient", {
        docTypes: ["spec"],
      });

      expect(result.results.length).toBe(1);
      expect(result.results[0].docType).toBe("spec");
      expect(mockEmbeddings.searchSimilar).toHaveBeenCalledWith(
        expect.any(Array),
        expect.any(String),
        expect.any(Number),
        ["spec"],
        "default",
        undefined,
        undefined,
        undefined,
        undefined,
      );
    });

    it("passes empty docTypes array correctly", async () => {
      mockEmbedder.embedSingle = jest.fn().mockResolvedValue({
        embedding: [1, 0, 0],
        model: "nomic-embed-text",
      });
      mockEmbeddings.searchSimilar = jest.fn().mockReturnValue([]);

      await searchService.search("test", { docTypes: [] });

      expect(mockEmbeddings.searchSimilar).toHaveBeenCalledWith(
        expect.any(Array),
        expect.any(String),
        expect.any(Number),
        [],
        "default",
        undefined,
        undefined,
        undefined,
        undefined,
      );
    });
  });

  describe("T053: advanced filtering by author, feature number, and date range", () => {
    it("passes author filter to EmbeddingRepository", async () => {
      mockEmbedder.embedSingle = jest.fn().mockResolvedValue({
        embedding: [1, 0, 0],
        model: "nomic-embed-text",
      });
      mockEmbeddings.searchSimilar = jest.fn().mockReturnValue([]);

      await searchService.search("rate limiting", { author: "alice" });

      expect(mockEmbeddings.searchSimilar).toHaveBeenCalledWith(
        [1, 0, 0],
        "nomic-embed-text",
        10,
        undefined,
        "default",
        "alice",
        undefined,
        undefined,
        undefined,
      );
    });

    it("passes featureNumber filter to EmbeddingRepository", async () => {
      mockEmbedder.embedSingle = jest.fn().mockResolvedValue({
        embedding: [1, 0, 0],
        model: "nomic-embed-text",
      });
      mockEmbeddings.searchSimilar = jest.fn().mockReturnValue([]);

      await searchService.search("patient", { featureNumber: "001-pacientes" });

      expect(mockEmbeddings.searchSimilar).toHaveBeenCalledWith(
        [1, 0, 0],
        "nomic-embed-text",
        10,
        undefined,
        "default",
        undefined,
        "001-pacientes",
        undefined,
        undefined,
      );
    });

    it("passes date range filters to EmbeddingRepository", async () => {
      mockEmbedder.embedSingle = jest.fn().mockResolvedValue({
        embedding: [1, 0, 0],
        model: "nomic-embed-text",
      });
      mockEmbeddings.searchSimilar = jest.fn().mockReturnValue([]);

      const dateFrom = new Date("2026-01-01").getTime();
      const dateTo = new Date("2026-12-31").getTime();

      await searchService.search("schedule", { dateFrom, dateTo });

      expect(mockEmbeddings.searchSimilar).toHaveBeenCalledWith(
        [1, 0, 0],
        "nomic-embed-text",
        10,
        undefined,
        "default",
        undefined,
        undefined,
        dateFrom,
        dateTo,
      );
    });

    it("passes combined filters to EmbeddingRepository", async () => {
      mockEmbedder.embedSingle = jest.fn().mockResolvedValue({
        embedding: [1, 0, 0],
        model: "nomic-embed-text",
      });
      mockEmbeddings.searchSimilar = jest.fn().mockReturnValue([]);

      await searchService.search("test", {
        docTypes: ["spec"],
        author: "bob",
        featureNumber: "020-spec-memory-hub",
      });

      expect(mockEmbeddings.searchSimilar).toHaveBeenCalledWith(
        [1, 0, 0],
        "nomic-embed-text",
        10,
        ["spec"],
        "default",
        "bob",
        "020-spec-memory-hub",
        undefined,
        undefined,
      );
    });
  });
});
