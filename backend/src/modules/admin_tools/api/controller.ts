import { prisma } from "@/infrastructure/database/prismaClient";
import { logger } from "@/infrastructure/logger";
import axios from "axios";
import { Request, Response } from "express";
import { asyncHandler, Errors } from "@/middleware/errorHandler";
import { createADRSchema, createWikiPageSchema, updateWikiPageSchema } from "./schemas";

export class AdminToolsController {
  // --- ADRs ---
  listADRs = asyncHandler(async (req: Request, res: Response) => {
    const clinicId = req.user?.clinicId;
    if (!clinicId) {
      throw Errors.unauthorized("Missing clinic context");
    }
    const data = await (prisma as any).architecture_decision_records.findMany({ // eslint-disable-line @typescript-eslint/no-explicit-any
      where: { clinic_id: clinicId },
      orderBy: { created_at: "desc" },
    });
    res.json(data);
    return;
  });

  createADR = asyncHandler(async (req: Request, res: Response) => {
    const clinicId = req.user?.clinicId;
    if (!clinicId) {
      throw Errors.unauthorized("Missing clinic context");
    }
    const parsed = createADRSchema.safeParse(req.body);
    if (!parsed.success) {
      throw Errors.validation("Invalid input", parsed.error.errors as any); // eslint-disable-line @typescript-eslint/no-explicit-any
    }
    const createdBy = req.user?.id ?? "";
    const data = await (prisma as any).architecture_decision_records.create({ // eslint-disable-line @typescript-eslint/no-explicit-any
      data: { ...parsed.data, clinic_id: clinicId, created_by: createdBy },
    });
    res.status(201).json(data);
    return;
  });

  // --- Wiki ---
  listWiki = asyncHandler(async (req: Request, res: Response) => {
    const clinicId = req.user?.clinicId;
    if (!clinicId) {
      throw Errors.unauthorized("Missing clinic context");
    }
    const data = await (prisma as any).wiki_pages.findMany({ // eslint-disable-line @typescript-eslint/no-explicit-any
      where: { clinic_id: clinicId },
      orderBy: { updated_at: "desc" },
    });
    res.json(data);
    return;
  });

  createWikiEntry = asyncHandler(async (req: Request, res: Response) => {
    const clinicId = req.user?.clinicId;
    if (!clinicId) {
      throw Errors.unauthorized("Missing clinic context");
    }
    const parsed = createWikiPageSchema.safeParse(req.body);
    if (!parsed.success) {
      throw Errors.validation("Invalid input", parsed.error.errors as any); // eslint-disable-line @typescript-eslint/no-explicit-any
    }
    const createdBy = req.user?.id ?? "";
    const data = await (prisma as any).wiki_pages.create({ // eslint-disable-line @typescript-eslint/no-explicit-any
      data: { ...parsed.data, clinic_id: clinicId, created_by: createdBy },
    });
    res.status(201).json(data);
    return;
  });

  updateWikiEntry = asyncHandler(async (req: Request, res: Response) => {
    const clinicId = req.user?.clinicId;
    if (!clinicId) {
      throw Errors.unauthorized("Missing clinic context");
    }
    const { id } = req.params;
    const existing = await (prisma as any).wiki_pages.findFirst({ // eslint-disable-line @typescript-eslint/no-explicit-any
      where: { id, clinic_id: clinicId },
    });
    if (!existing) {
      throw Errors.notFound("Wiki page", id);
    }
    const parsed = updateWikiPageSchema.safeParse(req.body);
    if (!parsed.success) {
      throw Errors.validation("Invalid input", parsed.error.errors as any); // eslint-disable-line @typescript-eslint/no-explicit-any
    }
    const data = await (prisma as any).wiki_pages.update({ // eslint-disable-line @typescript-eslint/no-explicit-any
      where: { id },
      data: parsed.data,
    });
    res.json(data);
    return;
  });

  // --- Legacy Admin Endpoints ---
  createRootUser = asyncHandler(async (req: Request, res: Response) => {
    // Gate behind environment variable to prevent accidental exposure
    if (process.env.ENABLE_DANGEROUS_ADMIN_ENDPOINTS !== "true") {
      throw Errors.notFound("Endpoint");
    }
    // Require super_admin authorization
    const requestingUser = req.user;
    if (!requestingUser?.role || requestingUser.role !== "super_admin") {
      throw Errors.forbidden("Requires super_admin role");
    }
    try {
      const { email, name } = req.body;
      const user = await (prisma as any).users.create({ // eslint-disable-line @typescript-eslint/no-explicit-any
        data: {
          email,
          name,
          tenantId: "00000000-0000-0000-0000-000000000000",
        } as any, // eslint-disable-line @typescript-eslint/no-explicit-any
      });

      await prisma
        .$executeRaw`UPDATE auth.users SET raw_user_meta_data = raw_user_meta_data || '{"is_super_admin": true}'::jsonb WHERE email = ${email}`
        .catch(() => {});

      res
        .status(200)
        .json({ message: "Root user created successfully", user });
      return;
    } catch (error: unknown) {
      logger.error("Error creating root user", { error });
      throw Errors.database("Failed to create root user");
    }
  });

  analyzeDatabaseHealth = asyncHandler(async (_req: Request, res: Response) => {
    const activeConnections = await prisma
      .$queryRaw<{ count: number }[]>`SELECT count(*) FROM pg_stat_activity`
      .catch(() => [{ count: 0 }]);

    const tableSizes = await prisma
      .$queryRaw<{ table: string; size: string }[]>`
        SELECT relname as "table",
               pg_size_pretty(pg_total_relation_size(relid)) As "size"
        FROM pg_catalog.pg_statio_user_tables
        ORDER BY pg_total_relation_size(relid) DESC`
      .catch(() => []);

    res.status(200).json({
      status: "healthy",
      activeConnections: activeConnections[0]?.count || 0,
      tableSizes,
    });
    return;
  });

  githubProxy = asyncHandler(async (req: Request, res: Response) => {
    try {
      const { url, method = "GET", data } = req.body;

      if (!url || !url.startsWith("https://api.github.com/")) {
        throw Errors.validation("Invalid GitHub URL");
      }

      const githubToken = process.env.GITHUB_TOKEN;
      const headers = githubToken
        ? { Authorization: `Bearer ${githubToken}` }
        : {};

      const response = await axios({
        url,
        method,
        data,
        headers: {
          ...headers,
          Accept: "application/vnd.github.v3+json",
          "User-Agent": "OrthoPlus-Backend",
        },
      });

      res.status(200).json(response.data);
      return;
    } catch (error: unknown) {
      logger.error("GitHub Proxy Error", { error });
      const status = (error as { response?: { status?: number } })?.response?.status ?? 500;
      if (status === 404) {
        throw Errors.notFound("GitHub resource");
      }
      if (status === 401 || status === 403) {
        throw Errors.forbidden("GitHub request denied");
      }
      throw Errors.externalService("GitHub");
    }
  });

  globalSearch = asyncHandler(async (req: Request, res: Response) => {
    const { query, entityType } = req.query;
    if (!query) {
      throw Errors.validation("Query is required");
    }

    const clinicId = req.user?.clinicId;
    if (!clinicId) {
      throw Errors.unauthorized("Missing clinic context");
    }

    const results: Record<string, unknown> = {};

    if (!entityType || entityType === "patients") {
      results.patients = await (prisma as any).patients // eslint-disable-line @typescript-eslint/no-explicit-any
        .findMany({
          where: {
            clinic_id: clinicId,
            OR: [
              { name: { contains: String(query), mode: "insensitive" } },
              { cpf: { contains: String(query) } },
            ],
          },
          take: 10,
        })
        .catch(() => []);
    }

    if (!entityType || entityType === "dentists") {
      results.dentists = await (prisma as any).dentists // eslint-disable-line @typescript-eslint/no-explicit-any
        .findMany({
          where: {
            clinic_id: clinicId,
            OR: [
              { name: { contains: String(query), mode: "insensitive" } },
              { cro: { contains: String(query) } },
            ],
          },
          take: 10,
        })
        .catch(() => []);
    }

    res.status(200).json({ results });
    return;
  });

  deleteWikiEntry = asyncHandler(async (req: Request, res: Response) => {
    const clinicId = req.user?.clinicId;
    if (!clinicId) {
      throw Errors.unauthorized("Missing clinic context");
    }
    const { id } = req.params;
    await (prisma as any).wiki_pages.deleteMany({ where: { id, clinic_id: clinicId } }); // eslint-disable-line @typescript-eslint/no-explicit-any
    res.status(204).send();
  });
}
