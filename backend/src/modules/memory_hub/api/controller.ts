import { Request, Response } from "express";
import { asyncHandler, Errors, ApiError } from "@/middleware/errorHandler";
import { ErrorCodes } from "@/middleware/errorHandler";
import { logger } from "@/infrastructure/logger";

import { getMetricsCollector } from "@/infrastructure/metrics/MetricsCollector";
type MetricsCollector = ReturnType<typeof getMetricsCollector>;
import { SearchService } from "../domain/services/SearchService";
import { ContextBriefService } from "../domain/services/ContextBriefService";
import { IndexingService } from "../domain/services/IndexingService";
import { GraphService } from "../domain/services/GraphService";
import { HealthService } from "../domain/services/HealthService";
import { ISearchAuditRepository } from "../domain/ports/ISearchAuditRepository";
import { IDriftRepository } from "../domain/ports/IDriftRepository";
import { CostTrackingService } from "../domain/services/CostTrackingService";
import {
  searchSchema,
  contextBriefSchema,
  graphSchema,
  rotateKeySchema,
  costsSchema,
  driftSchema,
} from "./schemas";

export interface MemoryHubControllerDeps {
  searchService: SearchService;
  contextBriefService: ContextBriefService;
  indexingService: IndexingService;
  graphService: GraphService;
  auditRepository: ISearchAuditRepository;
  driftRepository: IDriftRepository;
  healthService: HealthService;
  costTrackingService?: CostTrackingService;
  metrics: MetricsCollector;
}

export class MemoryHubController {
  private searchService: SearchService;
  private contextBriefService: ContextBriefService;
  private indexingService: IndexingService;
  private graphService: GraphService;
  private auditRepository: ISearchAuditRepository;
  private driftRepository: IDriftRepository;
  private healthService: HealthService;
  private costTrackingService?: CostTrackingService;
  private metrics: MetricsCollector;

  constructor(deps: MemoryHubControllerDeps) {
    this.searchService = deps.searchService;
    this.contextBriefService = deps.contextBriefService;
    this.indexingService = deps.indexingService;
    this.graphService = deps.graphService;
    this.auditRepository = deps.auditRepository;
    this.driftRepository = deps.driftRepository;
    this.healthService = deps.healthService;
    this.costTrackingService = deps.costTrackingService;
    this.metrics = deps.metrics;
  }

  search = asyncHandler(async (req: Request, res: Response) => {
    const startTime = Date.now();
    const clinicId = req.user?.clinicId;
    if (!clinicId) {
      throw Errors.unauthorized("Missing clinic context");
    }

    const parsed = searchSchema.safeParse(req.body);
    if (!parsed.success) {
      throw Errors.validation(
        "Invalid input",
        parsed.error.errors.map((e) => ({
          field: e.path.join("."),
          message: e.message,
          code: e.code,
        })),
      );
    }

    const { query, filters, limit, offset } = parsed.data;

    const searchFilters: Record<string, string | string[]> = {};
    if (filters?.author) {
      searchFilters.author = filters.author;
    }
    if (filters?.featureNumber) {
      searchFilters.featureNumber = filters.featureNumber;
    }
    if (filters?.docTypes) {
      searchFilters.docTypes = filters.docTypes;
    }

    const results = await this.searchService.search(
      query,
      searchFilters,
      limit,
      offset,
      clinicId,
    );

    const { results: items, total } = results;

    // Filter out confidential docs if user is not admin
    const isAdmin = req.user?.role === "ADMIN" || req.user?.role === "ROOT";
    const filteredResults = isAdmin
      ? items
      : items.filter((doc: { confidential?: boolean }) => !doc.confidential);
    const confidentialExcluded = items.length - filteredResults.length;

    // Audit log
    try {
      this.auditRepository.logQuery(
        clinicId,
        req.user?.id || null,
        query,
        filteredResults.length,
        Date.now() - startTime,
      );
    } catch (err) {
      logger.error("Search audit log failed", { error: err });
    }

    this.metrics.memoryHub.searchDuration.observe(
      { category: "memory_hub" },
      (Date.now() - startTime) / 1000,
    );

    res.json({
      results: filteredResults,
      total,
      confidential_excluded: confidentialExcluded,
      query_time_ms: Date.now() - startTime,
    });
  });

  reindex = asyncHandler(async (req: Request, res: Response) => {
    const clinicId = req.user?.clinicId;
    if (!clinicId) {
      throw Errors.unauthorized("Missing clinic context");
    }

    // Admin-only: reindex affects global memory hub state
    const isAdmin = req.user?.role === "ADMIN" || req.user?.role === "ROOT";
    if (!isAdmin) {
      throw Errors.forbidden("Admin access required");
    }

    const startTime = Date.now();
    const watchDirs = (
      process.env.MEMORY_HUB_WATCH_DIRS || "specs/,docs/,categories/"
    )
      .split(",")
      .map((d) => d.trim());

    await this.indexingService.reindexAll(watchDirs);

    const duration = (Date.now() - startTime) / 1000;
    this.metrics.memoryHub.indexDuration.observe(
      { category: "memory_hub" },
      duration,
    );
    this.metrics.memoryHub.documentsIndexed.inc({ category: "memory_hub" });

    res.json({ message: "Reindex complete", clinicId });
  });

  contextBrief = asyncHandler(async (req: Request, res: Response) => {
    const startTime = Date.now();
    const clinicId = req.user?.clinicId;
    if (!clinicId) {
      throw Errors.unauthorized("Missing clinic context");
    }

    const parsed = contextBriefSchema.safeParse(req.body);
    if (!parsed.success) {
      throw Errors.validation(
        "Invalid input",
        parsed.error.errors.map((e) => ({
          field: e.path.join("."),
          message: e.message,
          code: e.code,
        })),
      );
    }

    const { topic, max_tokens, include_related } = parsed.data;

    const brief = await this.contextBriefService.generateBrief({
      topic,
      maxTokens: max_tokens,
      includeRelated: include_related,
      clinicId,
    });

    this.metrics.memoryHub.briefGenerationDuration.observe(
      { category: "memory_hub" },
      (Date.now() - startTime) / 1000,
    );

    // 413 Payload Too Large when no documents fit within budget
    if (brief.documents.length === 0) {
      throw new ApiError(
        413,
        ErrorCodes.VALIDATION_ERROR,
        "Payload Too Large",
        `Context brief for topic "${topic}" exceeds token budget (${max_tokens}). Try increasing max_tokens or narrowing the topic.`,
      );
    }

    res.json(brief);
  });

  graph = asyncHandler(async (req: Request, res: Response) => {
    const clinicId = req.user?.clinicId;
    if (!clinicId) {
      throw Errors.unauthorized("Missing clinic context");
    }

    const parsed = graphSchema.safeParse(req.query);
    if (!parsed.success) {
      throw Errors.validation(
        "Invalid input",
        parsed.error.errors.map((e) => ({
          field: e.path.join("."),
          message: e.message,
          code: e.code,
        })),
      );
    }

    const { sourcePath } = parsed.data;

    const graphData = await this.graphService.buildGraph(sourcePath);
    res.json(graphData);
  });

  health = asyncHandler(async (req: Request, res: Response) => {
    const clinicId = req.user?.clinicId;
    if (!clinicId) {
      throw Errors.unauthorized("Missing clinic context");
    }
    const report = this.healthService.getMetrics(clinicId);
    res.json(report);
  });

  versions = asyncHandler(async (_req: Request, res: Response) => {
    res.json({
      memory_hub: "1.0.0",
      api: "v1",
      embedding_providers: ["ollama", "openai"],
    });
  });

  rotateKey = asyncHandler(async (req: Request, res: Response) => {
    const clinicId = req.user?.clinicId;
    if (!clinicId) {
      throw Errors.unauthorized("Missing clinic context");
    }

    // Admin-only endpoint
    const isAdmin = req.user?.role === "ADMIN" || req.user?.role === "ROOT";
    if (!isAdmin) {
      throw Errors.forbidden("Admin access required");
    }

    const parsed = rotateKeySchema.safeParse(req.body);
    if (!parsed.success) {
      throw Errors.validation(
        "Invalid input",
        parsed.error.errors.map((e) => ({
          field: e.path.join("."),
          message: e.message,
          code: e.code,
        })),
      );
    }

    const { provider, apiKey, model, baseUrl } = parsed.data;
    const updates: Record<string, string> = {};
    if (provider !== undefined) updates.provider = provider;
    if (apiKey !== undefined) updates.apiKey = apiKey;
    if (model !== undefined) updates.model = model;
    if (baseUrl !== undefined) updates.baseUrl = baseUrl;

    const { EmbeddingClientFactory } =
      await import("../infrastructure/EmbeddingClientFactory");
    const config = EmbeddingClientFactory.updateConfig(updates);

    res.json({
      message: "Embedding configuration updated",
      provider: config.provider,
      model: config.model || "default",
    });
  });

  costs = asyncHandler(async (req: Request, res: Response) => {
    const clinicId = req.user?.clinicId;
    if (!clinicId) {
      throw Errors.unauthorized("Missing clinic context");
    }

    if (!this.costTrackingService) {
      throw new ApiError(
        503,
        ErrorCodes.EXTERNAL_SERVICE_ERROR,
        "Service Unavailable",
        "Cost tracking not enabled",
      );
    }

    const parsed = costsSchema.safeParse(req.query);
    if (!parsed.success) {
      throw Errors.validation(
        "Invalid input",
        parsed.error.errors.map((e) => ({
          field: e.path.join("."),
          message: e.message,
          code: e.code,
        })),
      );
    }

    const { month } = parsed.data;
    const summary = this.costTrackingService.getMonthlySummary(clinicId, month);

    res.json(summary);
  });

  drift = asyncHandler(async (req: Request, res: Response) => {
    const clinicId = req.user?.clinicId;
    if (!clinicId) {
      throw Errors.unauthorized("Missing clinic context");
    }

    const parsed = driftSchema.safeParse(req.query);
    if (!parsed.success) {
      throw Errors.validation(
        "Invalid input",
        parsed.error.errors.map((e) => ({
          field: e.path.join("."),
          message: e.message,
          code: e.code,
        })),
      );
    }

    const { severity, limit, offset } = parsed.data;

    const rows = this.driftRepository.findUnresolved({
      severity,
      limit,
      offset,
    });
    const total = this.driftRepository.countUnresolved(severity);

    res.json({
      issues: rows,
      total,
      limit,
      offset,
    });
  });
}
