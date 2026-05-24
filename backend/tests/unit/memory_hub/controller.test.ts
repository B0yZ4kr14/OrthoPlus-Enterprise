import { Request, Response, NextFunction } from "express"
import { MemoryHubController } from "../../../src/modules/memory_hub/api/controller"
import { SearchService } from "../../../src/modules/memory_hub/domain/services/SearchService"
import { ContextBriefService } from "../../../src/modules/memory_hub/domain/services/ContextBriefService"
import { IndexingService } from "../../../src/modules/memory_hub/domain/services/IndexingService"
import { GraphService } from "../../../src/modules/memory_hub/domain/services/GraphService"
import { HealthService } from "../../../src/modules/memory_hub/domain/services/HealthService"
import { DocumentRepository } from "../../../src/modules/memory_hub/infrastructure/DocumentRepository"
import { SearchAuditRepository } from "../../../src/modules/memory_hub/infrastructure/SearchAuditRepository"

const createMockMetrics = () => ({
  memoryHub: {
    searchDuration: { observe: jest.fn() },
    indexDuration: { observe: jest.fn() },
    documentsIndexed: { inc: jest.fn() },
    briefGenerationDuration: { observe: jest.fn() },
    coveragePercent: { set: jest.fn() },
  },
})

const createMockResponse = (): Partial<Response> & { json: jest.Mock; status: jest.Mock } => {
  const res: any = {}
  res.status = jest.fn().mockReturnValue(res)
  res.json = jest.fn().mockReturnValue(res)
  return res
}

const createMockNext = (): NextFunction => jest.fn() as unknown as NextFunction

describe("MemoryHubController", () => {
  let controller: MemoryHubController
  let mockSearchService: jest.Mocked<SearchService>
  let mockContextBriefService: jest.Mocked<ContextBriefService>
  let mockIndexingService: jest.Mocked<IndexingService>
  let mockGraphService: jest.Mocked<GraphService>
  let mockDocuments: jest.Mocked<DocumentRepository>
  let mockAuditRepository: jest.Mocked<SearchAuditRepository>
  let mockHealthService: jest.Mocked<HealthService>
  let mockMetrics: ReturnType<typeof createMockMetrics>

  beforeEach(() => {
    mockSearchService = {
      searchWithConfidentialityFilter: jest.fn(),
      search: jest.fn(),
    } as any

    mockContextBriefService = {
      generateBrief: jest.fn(),
    } as any

    mockIndexingService = {
      reindexAll: jest.fn(),
    } as any

    mockGraphService = {
      buildGraph: jest.fn(),
    } as any

    mockDocuments = {
      findByPath: jest.fn(),
      isConfidential: jest.fn(),
      findVersions: jest.fn(),
      count: jest.fn(),
      listAll: jest.fn(),
    } as any

    mockAuditRepository = {
      logQuery: jest.fn(),
      getRecentQueries: jest.fn(),
    } as any

    mockHealthService = {
      getMetrics: jest.fn(),
    } as any

    mockMetrics = createMockMetrics()

    controller = new MemoryHubController({
      searchService: mockSearchService,
      contextBriefService: mockContextBriefService,
      indexingService: mockIndexingService,
      graphService: mockGraphService,
      documents: mockDocuments,
      auditRepository: mockAuditRepository,
      healthService: mockHealthService,
      metrics: mockMetrics as any,
      db: {} as any,
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe("search", () => {
    it("should return search results with confidentiality filter", async () => {
      const req = {
        body: { query: "test query", limit: 10, offset: 0 },
        user: { clinicId: "clinic-1", id: "user-1" },
      } as unknown as Request
      const res = createMockResponse()
      const next = createMockNext()

      mockSearchService.searchWithConfidentialityFilter.mockResolvedValue({
        results: [{ id: "1", sourcePath: "specs/test.md", docType: "spec", title: "Test", excerpt: "...", relevanceScore: 0.9, headingPath: [] }],
        total: 1,
        confidentialExcluded: 0,
      })

      await controller.search(req, res as unknown as Response, next)

      expect(mockSearchService.searchWithConfidentialityFilter).toHaveBeenCalledWith(
        "test query",
        {},
        10,
        0,
        "clinic-1",
      )
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        results: expect.any(Array),
        total: 1,
        confidential_excluded: 0,
      }))
      expect(next).not.toHaveBeenCalled()
    })

    it("should call next with error when query is missing", async () => {
      const req = { body: { limit: 10 }, user: { clinicId: "clinic-1" } } as unknown as Request
      const res = createMockResponse()
      const next = createMockNext()

      await controller.search(req, res as unknown as Response, next)

      expect(next).toHaveBeenCalledWith(expect.objectContaining({ status: 400 }))
      expect(res.json).not.toHaveBeenCalled()
    })

    it("should clamp limit to max 100", async () => {
      const req = {
        body: { query: "test", limit: 200 },
        user: { clinicId: "clinic-1", id: "user-1" },
      } as unknown as Request
      const res = createMockResponse()
      const next = createMockNext()

      mockSearchService.searchWithConfidentialityFilter.mockResolvedValue({
        results: [],
        total: 0,
        confidentialExcluded: 0,
      })

      await controller.search(req, res as unknown as Response, next)

      expect(mockSearchService.searchWithConfidentialityFilter).toHaveBeenCalledWith(
        "test",
        expect.any(Object),
        100,
        0,
        "clinic-1",
      )
    })

    it("should log audit query after search", async () => {
      const req = {
        body: { query: "audit test" },
        user: { clinicId: "clinic-1", id: "user-1" },
      } as unknown as Request
      const res = createMockResponse()
      const next = createMockNext()

      mockSearchService.searchWithConfidentialityFilter.mockResolvedValue({
        results: [{ id: "1", sourcePath: "specs/test.md", docType: "spec", title: "Test", excerpt: "...", relevanceScore: 0.9, headingPath: [] }],
        total: 1,
        confidentialExcluded: 0,
      })

      await controller.search(req, res as unknown as Response, next)

      expect(mockAuditRepository.logQuery).toHaveBeenCalledWith(
        "clinic-1",
        "user-1",
        "audit test",
        1,
        expect.any(Number),
      )
    })
  })

  describe("health", () => {
    it("should return health metrics from HealthService", async () => {
      const req = { user: { clinicId: "clinic-1" } } as unknown as Request
      const res = createMockResponse()
      const next = createMockNext()

      mockHealthService.getMetrics.mockReturnValue({
        indexStatus: "healthy",
        totalDocuments: 42,
        compressionRatio: 4.0,
        compressedEmbeddings: 100,
        spaceSavedBytes: 50000,
        lastScan: "2026-05-23T00:00:00.000Z",
        driftCount: 0,
        coveragePercent: 95,
      })

      await controller.health(req, res as unknown as Response, next)

      expect(mockHealthService.getMetrics).toHaveBeenCalledWith("clinic-1")
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        indexStatus: "healthy",
        totalDocuments: 42,
        coveragePercent: 95,
      }))
    })
  })

  describe("reindex", () => {
    it("should trigger reindex and return success", async () => {
      const req = { user: { clinicId: "clinic-1" } } as unknown as Request
      const res = createMockResponse()
      const next = createMockNext()

      mockIndexingService.reindexAll.mockResolvedValue(undefined)

      await controller.reindex(req, res as unknown as Response, next)

      expect(mockIndexingService.reindexAll).toHaveBeenCalled()
      expect(res.json).toHaveBeenCalledWith({ message: "Reindex complete" })
    })
  })

  describe("graph", () => {
    it("should return graph data from GraphService", async () => {
      const req = { user: { clinicId: "clinic-1" } } as unknown as Request
      const res = createMockResponse()
      const next = createMockNext()

      mockGraphService.buildGraph.mockReturnValue({ nodes: [], edges: [] })

      await controller.graph(req, res as unknown as Response, next)

      expect(mockGraphService.buildGraph).toHaveBeenCalledWith("clinic-1")
      expect(res.json).toHaveBeenCalledWith({ nodes: [], edges: [] })
    })
  })

  describe("versions", () => {
    it("should return versions for a valid sourcePath", async () => {
      const req = { query: { sourcePath: "specs/test.md" }, user: { clinicId: "clinic-1" } } as unknown as Request
      const res = createMockResponse()
      const next = createMockNext()

      mockDocuments.findVersions.mockReturnValue([{ version: 1, contentHash: "abc", title: "Test", wordCount: 100, createdAt: Date.now() }])

      await controller.versions(req, res as unknown as Response, next)

      expect(mockDocuments.findVersions).toHaveBeenCalledWith("specs/test.md", "clinic-1")
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        sourcePath: "specs/test.md",
        versions: expect.any(Array),
        count: 1,
      }))
    })

    it("should call next with error for invalid sourcePath", async () => {
      const req = { query: { sourcePath: "/etc/passwd" }, user: { clinicId: "clinic-1" } } as unknown as Request
      const res = createMockResponse()
      const next = createMockNext()

      await controller.versions(req, res as unknown as Response, next)

      expect(next).toHaveBeenCalledWith(expect.objectContaining({ status: 400 }))
      expect(res.json).not.toHaveBeenCalled()
    })
  })

  describe("contextBrief", () => {
    it("should generate brief with clamped max_tokens", async () => {
      const req = {
        body: { topic: "auth flow", max_tokens: 200000, include_related: true },
        user: { clinicId: "clinic-1" },
      } as unknown as Request
      const res = createMockResponse()
      const next = createMockNext()

      mockContextBriefService.generateBrief.mockResolvedValue({
        markdown: "# Auth Flow\n...",
        documents: [],
        tokenCount: 500,
        topic: "auth flow",
        confidentialExcluded: 0,
      })

      await controller.contextBrief(req, res as unknown as Response, next)

      expect(mockContextBriefService.generateBrief).toHaveBeenCalledWith(
        "auth flow",
        128000,
        true,
        "clinic-1",
      )
    })
  })
})
