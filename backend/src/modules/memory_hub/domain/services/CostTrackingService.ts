import Database from "better-sqlite3";
import { logger } from "@/infrastructure/logger";

export interface CostEstimate {
  tokens: number;
  costUsd: number;
  provider: string;
  model: string;
}

export interface MonthlyBudget {
  clinicId: string;
  month: string;
  totalCostUsd: number;
  totalTokens: number;
  queryCount: number;
  budgetLimitUsd: number;
  alertTriggered: boolean;
}

export class CostTrackingService {
  private db: Database.Database;
  private readonly charsPerToken = 4;

  constructor(db: Database.Database) {
    this.db = db;
    this.ensureTable();
  }

  private ensureTable(): void {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS embedding_costs (
        id TEXT PRIMARY KEY,
        clinic_id TEXT NOT NULL,
        query_text TEXT,
        tokens INTEGER NOT NULL,
        cost_usd REAL NOT NULL,
        provider TEXT NOT NULL,
        model TEXT NOT NULL,
        timestamp INTEGER NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_costs_clinic_month ON embedding_costs(clinic_id, timestamp);
    `);
  }

  estimateTokens(text: string): number {
    return Math.ceil(text.length / this.charsPerToken);
  }

  estimateCost(tokens: number, provider: string, model: string): CostEstimate {
    const perMillion = this.getPricePerMillion(provider, model);
    const costUsd = (tokens / 1_000_000) * perMillion;
    return { tokens, costUsd, provider, model };
  }

  private getPricePerMillion(provider: string, model: string): number {
    const key = (provider + "/" + model).toLowerCase();
    if (key.includes("text-embedding-3-large")) return 0.13;
    if (key.includes("text-embedding-3-small")) return 0.02;
    if (key.includes("text-embedding-004")) return 0.0;
    if (provider === "ollama") return 0.0;
    return 0.02;
  }

  logCost(
    clinicId: string,
    queryText: string,
    provider: string,
    model: string,
  ): CostEstimate {
    const tokens = this.estimateTokens(queryText);
    const estimate = this.estimateCost(tokens, provider, model);

    const stmt = this.db.prepare(
      `INSERT INTO embedding_costs (id, clinic_id, query_text, tokens, cost_usd, provider, model, timestamp)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    );
    stmt.run(
      crypto.randomUUID(),
      clinicId,
      queryText,
      estimate.tokens,
      estimate.costUsd,
      estimate.provider,
      estimate.model,
      Date.now(),
    );

    return estimate;
  }

  getMonthlySummary(clinicId: string, yearMonth?: string): MonthlyBudget {
    const targetMonth = yearMonth || this.getCurrentYearMonth();
    const parts = targetMonth.split("-");
    const year = Number(parts[0]);
    const month = Number(parts[1]);
    const startMs = new Date(year, month - 1, 1).getTime();
    const endMs = new Date(year, month, 1).getTime();

    const row = this.db
      .prepare(
        `SELECT
          COALESCE(SUM(tokens), 0) as total_tokens,
          COALESCE(SUM(cost_usd), 0) as total_cost,
          COUNT(*) as query_count
         FROM embedding_costs
         WHERE clinic_id = ? AND timestamp >= ? AND timestamp < ?`,
      )
      .get(clinicId, startMs, endMs) as {
      total_tokens: number;
      total_cost: number;
      query_count: number;
    };

    const budgetLimitUsd = this.getBudgetLimit(clinicId);
    const alertTriggered = row.total_cost > budgetLimitUsd;

    if (alertTriggered) {
      logger.warn("[CostTrackingService] Monthly budget exceeded", {
        clinicId,
        month: targetMonth,
        totalCost: row.total_cost,
        budgetLimit: budgetLimitUsd,
      });
    }

    return {
      clinicId,
      month: targetMonth,
      totalCostUsd: row.total_cost,
      totalTokens: row.total_tokens,
      queryCount: row.query_count,
      budgetLimitUsd,
      alertTriggered,
    };
  }

  private getCurrentYearMonth(): string {
    const d = new Date();
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0");
  }

  private getBudgetLimit(_clinicId: string): number {
    const envVal = process.env.MEMORY_HUB_DEFAULT_BUDGET_USD;
    return envVal ? parseFloat(envVal) : 50;
  }
}
