import { ContextBriefService } from "../../../src/modules/memory_hub/domain/services/ContextBriefService";
import { SearchService } from "../../../src/modules/memory_hub/domain/services/SearchService";
import { DocumentRepository } from "../../../src/modules/memory_hub/infrastructure/DocumentRepository";

jest.mock("../../../src/modules/memory_hub/domain/services/SearchService");
jest.mock("../../../src/modules/memory_hub/infrastructure/DocumentRepository");

describe("ContextBriefService", () => {
  let service: ContextBriefService;
  let mockSearchService: jest.Mocked<SearchService>;
  let mockDocuments: jest.Mocked<DocumentRepository>;

  beforeEach(() => {
    mockSearchService = new SearchService(
      {} as any,
      {} as any,
      {} as any,
    ) as jest.Mocked<SearchService>;
    mockDocuments = new DocumentRepository(
      {} as any,
    ) as jest.Mocked<DocumentRepository>;
    service = new ContextBriefService(mockSearchService, mockDocuments);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("T030: context brief includes top-N relevant documents", () => {
    it("includes documents from search results", async () => {
      mockSearchService.search = jest.fn().mockResolvedValue({
        results: [
          {
            id: "chunk-1",
            sourcePath: "specs/001-pacientes/spec.md",
            docType: "spec",
            title: "Patient Spec",
            excerpt: "Patient management specification",
            relevanceScore: 0.95,
            headingPath: [],
          },
        ],
        total: 1,
      });
      mockDocuments.findByPath = jest
        .fn()
        .mockReturnValue({ id: "doc-1", frontmatter: "{}" });
      mockDocuments.isConfidential = jest.fn().mockReturnValue(false);

      const brief = await service.generateBrief("patient management");

      expect(brief.documents.length).toBe(1);
      expect(brief.documents[0].sourcePath).toBe("specs/001-pacientes/spec.md");
      expect(brief.topic).toBe("patient management");
    });

    it("prioritizes spec over plan over architecture", async () => {
      mockSearchService.search = jest.fn().mockResolvedValue({
        results: [
          {
            id: "chunk-1",
            sourcePath: "docs/README.md",
            docType: "doc",
            title: "Readme",
            excerpt: "General documentation",
            relevanceScore: 0.99,
            headingPath: [],
          },
          {
            id: "chunk-2",
            sourcePath: "specs/001-pacientes/spec.md",
            docType: "spec",
            title: "Patient Spec",
            excerpt: "Patient management",
            relevanceScore: 0.8,
            headingPath: [],
          },
          {
            id: "chunk-3",
            sourcePath: "plans/architecture.md",
            docType: "architecture",
            title: "Architecture",
            excerpt: "System architecture",
            relevanceScore: 0.85,
            headingPath: [],
          },
        ],
        total: 3,
      });
      mockDocuments.findByPath = jest
        .fn()
        .mockReturnValue({ id: "doc-1", frontmatter: "{}" });
      mockDocuments.isConfidential = jest.fn().mockReturnValue(false);

      const brief = await service.generateBrief("patient");

      expect(brief.documents[0].docType).toBe("spec");
      expect(brief.documents[1].docType).toBe("architecture");
      expect(brief.documents[2].docType).toBe("doc");
    });

    it("excludes confidential docs", async () => {
      mockSearchService.search = jest.fn().mockResolvedValue({
        results: [
          {
            id: "chunk-1",
            sourcePath: "specs/open.md",
            docType: "spec",
            title: "Open",
            excerpt: "Open content",
            relevanceScore: 0.9,
            headingPath: [],
          },
          {
            id: "chunk-2",
            sourcePath: "specs/restricted.md",
            docType: "spec",
            title: "Restricted",
            excerpt: "Restricted content",
            relevanceScore: 0.85,
            headingPath: [],
          },
        ],
        total: 2,
      });

      mockDocuments.findByPath = jest.fn().mockImplementation((p: string) => {
        if (p.includes("restricted")) {
          return { frontmatter: JSON.stringify({ confidential: true }) };
        }
        return { frontmatter: JSON.stringify({}) };
      });
      mockDocuments.isConfidential = jest
        .fn()
        .mockImplementation((doc: any) => {
          try {
            const fm = JSON.parse(doc.frontmatter);
            return fm.confidential === true;
          } catch {
            return false;
          }
        });

      const brief = await service.generateBrief("test");

      expect(brief.documents.length).toBe(1);
      expect(brief.documents[0].sourcePath).toBe("specs/open.md");
      expect(brief.confidentialExcluded).toBe(1);
    });
  });

  describe("T031: context brief respects token budget", () => {
    it("limits documents when token budget exceeded", async () => {
      // Each excerpt is ~500 words = ~700 tokens + header overhead
      const excerpt = "word ".repeat(500);
      const results = Array.from({ length: 10 }, (_, i) => ({
        id: `chunk-${i}`,
        sourcePath: `specs/doc${i}.md`,
        docType: "spec",
        title: `Doc ${i}`,
        excerpt: excerpt,
        relevanceScore: 0.9 - i * 0.01,
        headingPath: [],
      }));

      mockSearchService.search = jest
        .fn()
        .mockResolvedValue({ results, total: 10 });
      mockDocuments.findByPath = jest
        .fn()
        .mockReturnValue({ id: "doc-1", frontmatter: "{}" });
      mockDocuments.isConfidential = jest.fn().mockReturnValue(false);

      const brief = await service.generateBrief("test", 2000);

      // Should include some but not all documents due to hard token budget cap
      expect(brief.documents.length).toBeLessThan(10);
      expect(brief.documents.length).toBeGreaterThanOrEqual(1);
      expect(brief.tokenCount).toBeLessThanOrEqual(2000);
    });

    it("respects hard token budget and excludes documents that would exceed", async () => {
      const results = Array.from({ length: 5 }, (_, i) => ({
        id: `chunk-${i}`,
        sourcePath: `specs/doc${i}.md`,
        docType: "spec",
        title: `Doc ${i}`,
        excerpt: "content that uses many tokens to exceed the budget ".repeat(
          20,
        ),
        relevanceScore: 0.9 - i * 0.01,
        headingPath: [],
      }));

      mockSearchService.search = jest
        .fn()
        .mockResolvedValue({ results, total: 5 });
      mockDocuments.findByPath = jest
        .fn()
        .mockReturnValue({ id: "doc-1", frontmatter: "{}" });
      mockDocuments.isConfidential = jest.fn().mockReturnValue(false);

      const brief = await service.generateBrief("test", 50);

      // With a 50-token budget, no documents should be included
      expect(brief.documents.length).toBe(0);
      expect(brief.tokenCount).toBeLessThanOrEqual(50);
    });
  });
});
