import Database from "better-sqlite3";
import { CostTrackingService } from "../../../src/modules/memory_hub/domain/services/CostTrackingService";

describe("CostTrackingService", () => {
  let db: Database.Database;
  let service: CostTrackingService;

  beforeEach(() => {
    db = new Database(":memory:");
    service = new CostTrackingService(db);
  });

  afterEach(() => {
    db.close();
  });

  it("estimates tokens from text length", () => {
    expect(service.estimateTokens("hello world")).toBe(3);
    expect(service.estimateTokens("a".repeat(400))).toBe(100);
  });

  it("estimates cost for openai small", () => {
    const estimate = service.estimateCost(
      1_000_000,
      "openai",
      "text-embedding-3-small",
    );
    expect(estimate.costUsd).toBe(0.02);
    expect(estimate.tokens).toBe(1_000_000);
  });

  it("estimates zero cost for ollama", () => {
    const estimate = service.estimateCost(
      1_000_000,
      "ollama",
      "nomic-embed-text",
    );
    expect(estimate.costUsd).toBe(0);
  });

  it("logs cost and returns estimate", () => {
    const result = service.logCost(
      "clinic-1",
      "test query",
      "openai",
      "text-embedding-3-small",
    );
    expect(result.tokens).toBeGreaterThan(0);
    expect(result.costUsd).toBeGreaterThan(0);
    expect(result.provider).toBe("openai");
  });

  it("returns monthly summary with zero costs when empty", () => {
    const summary = service.getMonthlySummary("clinic-1");
    expect(summary.totalCostUsd).toBe(0);
    expect(summary.totalTokens).toBe(0);
    expect(summary.queryCount).toBe(0);
    expect(summary.alertTriggered).toBe(false);
  });

  it("triggers alert when budget is exceeded", () => {
    process.env.MEMORY_HUB_DEFAULT_BUDGET_USD = "0.000001";
    // Log a query that costs more than the tiny budget
    service.logCost(
      "clinic-2",
      "a".repeat(4000),
      "openai",
      "text-embedding-3-small",
    );
    const summary = service.getMonthlySummary("clinic-2");
    expect(summary.alertTriggered).toBe(true);
    delete process.env.MEMORY_HUB_DEFAULT_BUDGET_USD;
  });

  it("aggregates costs per month correctly", () => {
    service.logCost(
      "clinic-3",
      "query one",
      "openai",
      "text-embedding-3-small",
    );
    service.logCost(
      "clinic-3",
      "query two",
      "openai",
      "text-embedding-3-small",
    );
    const summary = service.getMonthlySummary("clinic-3");
    expect(summary.queryCount).toBe(2);
    expect(summary.totalCostUsd).toBeGreaterThan(0);
  });
});
