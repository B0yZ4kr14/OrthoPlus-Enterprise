import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";


// Modules API Routers
import { createAuthRouter } from "./modules/auth/api/router";
import agendaRouter from "./modules/agenda/api/router";
import analyticsRouter from "./modules/analytics/api/router";
import backupsRouter from "./modules/backups/api/router";
import { commRouter } from "./modules/comm/api/router";
import { createConfiguracoesRouter } from "./modules/configuracoes/api/router";
import { createCryptoConfigRouter, createCryptoRouter } from "./modules/crypto_config/api/router";
import databaseRouter from "./modules/database_admin/api/router";
import { createFaturamentoRouter } from "./modules/faturamento/api/router";
import filesRouter from "./modules/files/api/router";
import { createFinanceiroRouter } from "./modules/financeiro/api/router";
import { createGitHubToolsRouter } from "./modules/github_tools/api/router";
import { createInventarioRouter } from "./modules/inventario/api/router";
import notificationRouter from "./modules/notifications/api/router";
import { pacientesRouter } from "./modules/pacientes/api/router";
import { createTerminalRouter } from "./modules/terminal/api/router";
import usuariosRouter from "./modules/usuarios/api/router";
import { startAllWorkers } from "./workers/index";
import { authMiddleware, tenantGuard } from "./middleware/authMiddleware";

// Batch 8 Module Routers
import adminToolsRouter from "./modules/admin_tools/api/router";
import contratosRouter from "./modules/contratos/api/router";
import crmRouter from "./modules/crm/api/router";
import funcionariosRouter from "./modules/funcionarios/api/router";
import lgpdRouter from "./modules/lgpd/api/router";
import orcamentosRouter from "./modules/orcamentos/api/router";
import procedimentosRouter from "./modules/procedimentos/api/router";
import teleodontoRouter from "./modules/teleodonto/api/router";

// Batch 9 Module Routers
import biRouter from "./modules/bi/api/router";
import fidelidadeRouter from "./modules/fidelidade/api/router";
import marketingRouter from "./modules/marketing/api/router";
import tissRouter from "./modules/tiss/api/router";

// Batch 10 Module Routers
import inadimplenciaRouter from "./modules/inadimplencia/api/router";
import splitPagamentoRouter from "./modules/split_pagamento/api/router";

// Patch — previously unregistered modules
import { createPepRouter } from "./modules/pep/api/router";
import { createPdvRouter } from "./modules/pdv/api/router";
import { createDashboardRouter } from "./modules/dashboard/api/router";
import { createNfeRouter } from "./modules/nfe/api/router";

// Domain event handlers
import { registerEventHandlers } from "./shared/events/EventRegistry";

import { errorHandler } from "./middleware/errorHandler";
import { prisma } from "./infrastructure/database/prismaClient";
import { redisInstance, redisPublisher, redisSubscriber } from "./infrastructure/redis/redisClient";
import { logger } from "./infrastructure/logger";

dotenv.config();


/**
 * SECURITY: Validate required environment variables on startup
 * Prevents runtime failures and security issues from missing configs
 */
function validateEnvironment() {
  const required = ['JWT_SECRET', 'DB_HOST', 'DB_NAME', 'DB_USER', 'DB_PASSWORD'];
  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    console.error(`❌ FATAL: Missing required environment variables: ${missing.join(', ')}`);
    console.error('Please set these variables in your .env file or environment');
    process.exit(1);
  }

  // Security check: Prevent using default/mock JWT secret
  if (process.env.JWT_SECRET === 'supersecretmockjwt') {
    console.error('❌ FATAL: Using default JWT_SECRET "supersecretmockjwt" is not allowed');
    console.error('Please set a secure JWT_SECRET (256-bit random string recommended)');
    process.exit(1);
  }

  // In production: block dangerous settings that are only safe in dev/test
  if (process.env.NODE_ENV === 'production') {
    if (process.env.AUTH_ALLOW_MOCK === 'true') {
      console.error('❌ FATAL: AUTH_ALLOW_MOCK=true is not allowed in production');
      console.error('Remove AUTH_ALLOW_MOCK or set it to false before deploying');
      process.exit(1);
    }
    if (process.env.ENABLE_DANGEROUS_ADMIN_ENDPOINTS === 'true') {
      console.error('❌ FATAL: ENABLE_DANGEROUS_ADMIN_ENDPOINTS=true is not allowed in production');
      console.error('Remove ENABLE_DANGEROUS_ADMIN_ENDPOINTS or set it to false before deploying');
      process.exit(1);
    }
    // REDIS_URL is required in production; in development it falls back to localhost
    if (!process.env.REDIS_URL) {
      console.error('❌ FATAL: REDIS_URL environment variable is not set in production');
      console.error('Please set REDIS_URL in your environment before deploying');
      process.exit(1);
    }
  }

  // Warn if dangerous endpoints are enabled (non-production)
  if (process.env.ENABLE_DANGEROUS_ADMIN_ENDPOINTS === 'true') {
    console.warn('⚠️  WARNING: ENABLE_DANGEROUS_ADMIN_ENDPOINTS=true');
    console.warn('   This enables OS command execution endpoints - NOT recommended for production!');
  }

  // Warn if mock auth is enabled (non-production)
  if (process.env.AUTH_ALLOW_MOCK === 'true') {
    console.warn('⚠️  WARNING: AUTH_ALLOW_MOCK=true');
    console.warn('   This allows authentication bypass - ONLY for development/testing!');
  }

  // Validate optional but important variables
  const optional = ['DB_PORT'];
  optional.forEach(key => {
    if (!process.env[key]) {
      console.warn(`⚠️  WARNING: Optional environment variable ${key} is not set, using default`);
    }
  });

  console.log('✅ Environment validation passed');
}

validateEnvironment();

const app = express();

// Rate limiting — per-context limits instead of a single global limit
// Auth endpoints: strict limit to prevent brute-force attacks
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: 'Too many authentication attempts, please try again later.',
});

// File upload endpoints: moderate limit
const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 50,
  message: 'Too many upload requests, please try again later.',
});

// General API rate limiter: reasonable for clinical multi-user environments
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500,
  message: 'Too many requests from this IP, please try again later.',
});

app.use("/api/auth", authLimiter);
app.use("/auth/v1", authLimiter);
app.use("/api/files", uploadLimiter);
app.use("/api", apiLimiter);

const PORT = process.env.PORT || 3005;


// CORS configuration with whitelist
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS?.split(",") || ["http://localhost:5173", "http://localhost:3000"],
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
};
app.use(cors(corsOptions));

app.use(cookieParser());

// CSRF protection: for state-changing requests (POST/PUT/PATCH/DELETE), verify
// that the Origin header matches an allowed origin. This, combined with
// sameSite: "strict" on the auth cookie, prevents cross-site request forgery.
app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
  const safeMethods = ["GET", "HEAD", "OPTIONS"];
  if (safeMethods.includes(req.method)) return next();
  // Skip CSRF check for requests that don't carry a cookie-based session
  const hasCookieToken = !!(req as express.Request & { cookies?: Record<string, string> }).cookies?.access_token;
  if (!hasCookieToken) return next();
  const origin = req.headers.origin || req.headers.referer;
  const allowedOrigins: string[] = (process.env.ALLOWED_ORIGINS?.split(",") ?? [])
    .concat(["http://localhost:5173", "http://localhost:3000"]);
  if (!origin || !allowedOrigins.some((o) => origin.startsWith(o))) {
    res.status(403).json({ error: "CSRF check failed: invalid origin" });
    return;
  }
  return next();
});

app.use(helmet());
app.use(express.json({ limit: '10mb' }));

// Auth middleware — populates req.clinicId from JWT for all routes
app.use(authMiddleware);

// Auth implementation route
const authRouter = createAuthRouter();
app.use("/auth/v1", authRouter);
app.use("/api/auth", authRouter);

// Health check
app.get("/health", (_req, res) => {
  res.json({ status: "ok", time: new Date(), uptime: process.uptime() });
});

// Admin / System API routes (migrated from Edge Functions)
app.use("/api/db", databaseRouter);
app.use("/api/backups", backupsRouter);
app.use("/api/analytics", analyticsRouter);
app.use("/api/notifications", notificationRouter);
app.use("/api/files", filesRouter);
app.use("/api/crypto_config", createCryptoConfigRouter());
const faturamentoRouter = createFaturamentoRouter();
app.use("/api/faturamento", faturamentoRouter);
app.use("/api/fiscal", faturamentoRouter); // alias: /fiscal → /faturamento
app.use("/api/pacientes", pacientesRouter);
app.use("/api/comm", commRouter);
app.use("/api/agenda", agendaRouter);
app.use("/api/usuarios", usuariosRouter);
app.use("/api/terminal", createTerminalRouter());
app.use("/api/github", createGitHubToolsRouter());
app.use("/api/crypto", createCryptoRouter());
const financeiroRouter = createFinanceiroRouter();
app.use("/api/financeiro", financeiroRouter);
app.use("/api/payments", financeiroRouter); // alias: /payments → /financeiro
app.use("/api/estoque", createInventarioRouter());
app.use("/api/configuracoes", createConfiguracoesRouter());

// Batch 8 — CRUD Modules
app.use("/api/admin", adminToolsRouter);
app.use("/api/contratos", contratosRouter);
app.use("/api/contrato-templates", contratosRouter); // alias for /contratos/templates
app.use("/api/crm", crmRouter);
app.use("/api/funcionarios", funcionariosRouter);
app.use("/api/lgpd", lgpdRouter);
app.use("/api/orcamentos", orcamentosRouter);
app.use("/api/procedimentos", procedimentosRouter);
app.use("/api/teleodonto", teleodontoRouter);

// Batch 9 — Medium Complexity Modules
app.use("/api/bi", biRouter);
app.use("/api/fidelidade", fidelidadeRouter);
app.use("/api/marketing", marketingRouter);
app.use("/api/tiss", tissRouter);

// Batch 10 — Financial Modules
app.use("/api/inadimplencia", inadimplenciaRouter);
app.use("/api/campanhas-inadimplencia", inadimplenciaRouter); // alias: frontend uses this path
app.use("/api/split-pagamento", splitPagamentoRouter);
app.use("/api/split", splitPagamentoRouter); // alias: frontend uses /split/*

// PEP, PDV, Dashboard & NF-e — modules with existing controllers
app.use("/api/pep", createPepRouter());
app.use("/api/pdv", createPdvRouter());
app.use("/api/inventario", createInventarioRouter());
app.use("/api/dashboard", createDashboardRouter());
app.use("/api/nfe", createNfeRouter());

// Legacy Edge Function redirect: /functions/v1/<fn> → /api/<fn>
// Rewrites the URL and re-dispatches through the Express router stack.
// Auth middleware already covers /functions/v1 paths (see authMiddleware isApiRoute check).
app.use("/functions/v1", (req, res, next) => {
  req.url = `/api${req.url}`;
  // Re-dispatch through Express router stack to handle legacy Edge Function paths.
  // app.handle() is the internal Express dispatch method (not exposed in TS types).
  (app as any).handle(req, res, next); // eslint-disable-line @typescript-eslint/no-explicit-any
});

// Active modules endpoint: returns module keys for a clinic from the database.
// Falls back to returning all modules when AUTH_ALLOW_MOCK=true to unblock frontend in dev/test.
app.get("/api/clinics/:id/active-modules", tenantGuard, async (req, res) => {
  if (process.env.AUTH_ALLOW_MOCK === "true") {
    res.json([
      "DASHBOARD",
      "AGENDA",
      "PACIENTES",
      "PEP",
      "FINANCEIRO",
      "INADIMPLENCIA",
      "CRYPTO_PAYMENTS",
      "PDV",
      "FISCAL",
      "ESTOQUE",
      "INVENTARIO",
      "CRM",
      "FIDELIDADE",
      "MARKETING_AUTO",
      "PORTAL_PACIENTE",
      "BI",
      "LGPD",
      "ASSINATURA_ICP",
      "TISS",
      "TELEODONTO",
      "IA",
      "FLUXO_DIGITAL",
      "DATABASE_ADMIN",
      "BACKUPS",
      "CRYPTO_CONFIG",
      "GITHUB_TOOLS",
      "TERMINAL",
      "NFE",
      "CONTRATOS",
      "ORCAMENTOS",
      "PROCEDIMENTOS",
      "DENTISTAS",
      "FUNCIONARIOS",
      "SPLIT_PAGAMENTO",
      "ODONTOGRAMA",
      "ADMIN_ONLY",
    ]);
    return;
  }

  try {
    const rows = await prisma.$queryRaw<Array<{ module_key: string }>>`
      SELECT mc.module_key
      FROM clinic_modules cm
      JOIN module_catalog mc ON mc.id = cm.module_catalog_id
      WHERE cm.clinic_id = ${req.params.id}
        AND cm.is_active = true
    `;
    res.json(rows.map((r) => r.module_key));
  } catch (error) {
    console.error("Error fetching active modules", error);
    res.status(500).json({ error: "Erro ao carregar módulos ativos" });
  }
});

// Register domain event handlers before starting workers
registerEventHandlers();

// Start background workers
startAllWorkers();

// Global error handler — must be registered after all routes
app.use(errorHandler);

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// ---------------------------------------------------------------------------
// Graceful shutdown — handles SIGTERM (Docker/K8s) and SIGINT (Ctrl+C)
// ---------------------------------------------------------------------------
async function gracefulShutdown(signal: string) {
  logger.info(`Received ${signal}. Starting graceful shutdown...`);

  // Force-exit if graceful shutdown takes too long
  const forceTimeout = setTimeout(() => {
    logger.error('Graceful shutdown timed out. Forcing exit.');
    process.exit(1);
  }, 10000);
  forceTimeout.unref();

  try {
    await new Promise<void>((resolve) => {
      server.close(() => {
        logger.info('HTTP server closed.');
        resolve();
      });
    });

    await prisma.$disconnect();
    logger.info('Database disconnected.');

    await Promise.allSettled([
      redisInstance.quit(),
      redisPublisher.quit(),
      redisSubscriber.quit(),
    ]);
    logger.info('Redis connections closed.');

    clearTimeout(forceTimeout);
    logger.info('Graceful shutdown complete.');
    process.exit(0);
  } catch (error) {
    logger.error('Error during graceful shutdown:', error);
    clearTimeout(forceTimeout);
    process.exit(1);
  }
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
