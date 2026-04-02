import { Request, Response, NextFunction } from 'express';
import { Registry, Counter, Histogram, Gauge, collectDefaultMetrics } from 'prom-client';
import { logger } from '@/infrastructure/logger';

export class PrometheusMetrics {
  private registry: Registry;
  private httpRequestDuration: Histogram;
  private httpRequestsTotal: Counter;
  private httpRequestErrors: Counter;
  private activeConnections: Gauge;
  private databaseConnectionPool: Gauge;

  constructor() {
    this.registry = new Registry();

    // Collect default metrics (CPU, memory, event loop, etc)
    collectDefaultMetrics({ register: this.registry });

    // HTTP request duration histogram
    this.httpRequestDuration = new Histogram({
      name: 'http_request_duration_seconds',
      help: 'Duration of HTTP requests in seconds',
      labelNames: ['method', 'route', 'status'],
      buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5],
      registers: [this.registry],
    });

    // HTTP requests total counter
    this.httpRequestsTotal = new Counter({
      name: 'http_requests_total',
      help: 'Total number of HTTP requests',
      labelNames: ['method', 'route', 'status'],
      registers: [this.registry],
    });

    // HTTP request errors counter
    this.httpRequestErrors = new Counter({
      name: 'http_request_errors_total',
      help: 'Total number of HTTP request errors',
      labelNames: ['method', 'route', 'error_type'],
      registers: [this.registry],
    });

    // Active connections gauge
    this.activeConnections = new Gauge({
      name: 'active_connections',
      help: 'Number of active connections',
      registers: [this.registry],
    });

    // Database connection pool gauge
    this.databaseConnectionPool = new Gauge({
      name: 'database_connection_pool_size',
      help: 'Size of database connection pool',
      labelNames: ['schema'],
      registers: [this.registry],
    });

    logger.info('Prometheus metrics initialized');
  }

  // Express middleware to track HTTP requests
  middleware() {
    return (req: Request, res: Response, next: NextFunction) => {
      const start = Date.now();

      this.activeConnections.inc();

      res.on('finish', () => {
        const duration = (Date.now() - start) / 1000;
        const route = req.route?.path || req.path;

        this.httpRequestDuration.observe(
          { method: req.method, route, status: res.statusCode.toString() },
          duration
        );

        this.httpRequestsTotal.inc({
          method: req.method,
          route,
          status: res.statusCode.toString(),
        });

        this.activeConnections.dec();

        if (res.statusCode >= 400) {
          this.httpRequestErrors.inc({
            method: req.method,
            route,
            error_type: res.statusCode >= 500 ? 'server_error' : 'client_error',
          });
        }
      });

      next();
    };
  }

  // Expose metrics endpoint
  async getMetrics(): Promise<string> {
    return this.registry.metrics();
  }

  // Update database pool metrics (called from DatabaseConnection)
  updateDatabasePoolMetrics(schema: string, poolSize: number): void {
    this.databaseConnectionPool.set({ schema }, poolSize);
  }

  getRegistry(): Registry {
    return this.registry;
  }
}

export const prometheusMetrics = new PrometheusMetrics();
