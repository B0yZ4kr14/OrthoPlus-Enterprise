/**
 * CategoryCircuitBreaker — Circuit Breaker por Categoria de Banco de Dados
 *
 * Arquitetura DevSecOps:
 * - Estado distribuído (memory-local, escala horizontal via Redis futuramente)
 * - 3 estados: CLOSED → OPEN → HALF_OPEN → CLOSED
 * - Thresholds configuráveis por categoria
 * - Fallback automático: health degradado quando circuito aberto
 * - Métricas exportáveis (Prometheus-ready)
 *
 * Padrão: Circuit Breaker (Release It! — Michael Nygard)
 */

export type CircuitState = "CLOSED" | "OPEN" | "HALF_OPEN";

export interface CircuitBreakerConfig {
  failureThreshold: number; // Falhas consecutivas para abrir
  successThreshold: number; // Sucessos em HALF_OPEN para fechar
  timeoutMs: number; // Tempo máximo de execução antes de contar como falha
  recoveryTimeoutMs: number; // Tempo em OPEN antes de tentar HALF_OPEN
  halfOpenMaxCalls: number; // Máximo de chamadas em HALF_OPEN
}

export interface CircuitBreakerMetrics {
  category: string;
  state: CircuitState;
  failures: number;
  successes: number;
  lastFailureAt: string | null;
  lastSuccessAt: string | null;
  openedAt: string | null;
  consecutiveSuccesses: number;
  consecutiveFailures: number;
  totalCalls: number;
  rejectedCalls: number;
}

const DEFAULT_CONFIG: CircuitBreakerConfig = {
  failureThreshold: 5,
  successThreshold: 3,
  timeoutMs: 5000,
  recoveryTimeoutMs: 30000,
  halfOpenMaxCalls: 5,
};

class CategoryCircuitBreakerInstance {
  private state: CircuitState = "CLOSED";
  private failures = 0;
  private successes = 0;
  private lastFailureAt: Date | null = null;
  private lastSuccessAt: Date | null = null;
  private openedAt: Date | null = null;
  private consecutiveSuccesses = 0;
  private consecutiveFailures = 0;
  private totalCalls = 0;
  private rejectedCalls = 0;
  private halfOpenCalls = 0;

  constructor(
    private category: string,
    private config: CircuitBreakerConfig = DEFAULT_CONFIG,
  ) {}

  getState(): CircuitState {
    if (this.state === "OPEN") {
      const now = Date.now();
      const opened = this.openedAt?.getTime() ?? 0;
      if (now - opened >= this.config.recoveryTimeoutMs) {
        this.state = "HALF_OPEN";
        this.halfOpenCalls = 0;
        this.consecutiveSuccesses = 0;
      }
    }
    return this.state;
  }

  async execute<T>(fn: () => Promise<T>, fallback?: () => T): Promise<T> {
    const currentState = this.getState();
    this.totalCalls++;

    if (currentState === "OPEN") {
      this.rejectedCalls++;
      if (fallback) {
        return fallback();
      }
      throw new Error(
        `Circuit breaker OPEN for category "${this.category}" — service temporarily unavailable`,
      );
    }

    if (
      currentState === "HALF_OPEN" &&
      this.halfOpenCalls >= this.config.halfOpenMaxCalls
    ) {
      this.rejectedCalls++;
      if (fallback) {
        return fallback();
      }
      throw new Error(
        `Circuit breaker HALF_OPEN limit reached for category "${this.category}"`,
      );
    }

    if (currentState === "HALF_OPEN") {
      this.halfOpenCalls++;
    }

    try {
      const result = await this.runWithTimeout(fn, this.config.timeoutMs);
      this.recordSuccess();
      return result;
    } catch (error) {
      this.recordFailure();
      if (fallback) {
        return fallback();
      }
      throw error;
    }
  }

  private async runWithTimeout<T>(
    fn: () => Promise<T>,
    timeoutMs: number,
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(`Timeout after ${timeoutMs}ms`));
      }, timeoutMs);

      fn()
        .then((result) => {
          clearTimeout(timer);
          resolve(result);
        })
        .catch((error) => {
          clearTimeout(timer);
          reject(error);
        });
    });
  }

  private recordSuccess(): void {
    this.successes++;
    this.lastSuccessAt = new Date();
    this.consecutiveSuccesses++;
    this.consecutiveFailures = 0;

    if (
      this.state === "HALF_OPEN" &&
      this.consecutiveSuccesses >= this.config.successThreshold
    ) {
      this.state = "CLOSED";
      this.failures = 0;
      this.consecutiveFailures = 0;
    }
  }

  private recordFailure(): void {
    this.failures++;
    this.lastFailureAt = new Date();
    this.consecutiveFailures++;
    this.consecutiveSuccesses = 0;

    if (this.state === "HALF_OPEN") {
      this.state = "OPEN";
      this.openedAt = new Date();
      return;
    }

    if (this.consecutiveFailures >= this.config.failureThreshold) {
      this.state = "OPEN";
      this.openedAt = new Date();
    }
  }

  getMetrics(): CircuitBreakerMetrics {
    return {
      category: this.category,
      state: this.getState(),
      failures: this.failures,
      successes: this.successes,
      lastFailureAt: this.lastFailureAt?.toISOString() ?? null,
      lastSuccessAt: this.lastSuccessAt?.toISOString() ?? null,
      openedAt: this.openedAt?.toISOString() ?? null,
      consecutiveSuccesses: this.consecutiveSuccesses,
      consecutiveFailures: this.consecutiveFailures,
      totalCalls: this.totalCalls,
      rejectedCalls: this.rejectedCalls,
    };
  }

  reset(): void {
    this.state = "CLOSED";
    this.failures = 0;
    this.successes = 0;
    this.lastFailureAt = null;
    this.lastSuccessAt = null;
    this.openedAt = null;
    this.consecutiveSuccesses = 0;
    this.consecutiveFailures = 0;
    this.totalCalls = 0;
    this.rejectedCalls = 0;
    this.halfOpenCalls = 0;
  }
}

/** Registry singleton de circuit breakers por categoria */
export class CategoryCircuitBreakerRegistry {
  private static instance: CategoryCircuitBreakerRegistry;
  private breakers = new Map<string, CategoryCircuitBreakerInstance>();

  static getInstance(): CategoryCircuitBreakerRegistry {
    if (!CategoryCircuitBreakerRegistry.instance) {
      CategoryCircuitBreakerRegistry.instance =
        new CategoryCircuitBreakerRegistry();
    }
    return CategoryCircuitBreakerRegistry.instance;
  }

  getBreaker(
    category: string,
    config?: CircuitBreakerConfig,
  ): CategoryCircuitBreakerInstance {
    if (!this.breakers.has(category)) {
      this.breakers.set(
        category,
        new CategoryCircuitBreakerInstance(category, config),
      );
    }
    return this.breakers.get(category)!;
  }

  getAllMetrics(): CircuitBreakerMetrics[] {
    return Array.from(this.breakers.values()).map((b) => b.getMetrics());
  }

  resetAll(): void {
    for (const breaker of this.breakers.values()) {
      breaker.reset();
    }
  }

  resetCategory(category: string): void {
    const breaker = this.breakers.get(category);
    if (breaker) breaker.reset();
  }
}

export const circuitBreakerRegistry =
  CategoryCircuitBreakerRegistry.getInstance();
