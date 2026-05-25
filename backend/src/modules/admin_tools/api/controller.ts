import { prisma } from "@/infrastructure/database/prismaClient";
import { logger } from "@/infrastructure/logger";
import axios from "axios";
import { Request, Response } from "express";
import { asyncHandler, Errors } from "@/middleware/errorHandler";
import { createADRSchema, createWikiPageSchema, updateWikiPageSchema } from "./schemas";
import { ListAdrsUseCase } from "../application/ListAdrsUseCase";
import { CreateAdrUseCase } from "../application/CreateAdrUseCase";
import { ListWikiEntriesUseCase } from "../application/ListWikiEntriesUseCase";
import { CreateWikiEntryUseCase } from "../application/CreateWikiEntryUseCase";
import { UpdateWikiEntryUseCase } from "../application/UpdateWikiEntryUseCase";
import { DeleteWikiEntryUseCase } from "../application/DeleteWikiEntryUseCase";

export class AdminToolsController {
  private listAdrsUC = new ListAdrsUseCase();
  private createAdrUC = new CreateAdrUseCase();
  private listWikiUC = new ListWikiEntriesUseCase();
  private createWikiUC = new CreateWikiEntryUseCase();
  private updateWikiUC = new UpdateWikiEntryUseCase();
  private deleteWikiUC = new DeleteWikiEntryUseCase();

  listADRs = asyncHandler(async (req: Request, res: Response) => {
    const clinicId = req.user?.clinicId;
    if (!clinicId) {
      throw Errors.unauthorized("Missing clinic context");
    }
    const data = await this.listAdrsUC.execute(clinicId);
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
      throw Errors.validation("Invalid input", parsed.error.errors as any);
    }
    const createdBy = req.user?.id ?? "";
    const data = await this.createAdrUC.execute(clinicId, createdBy, parsed.data);
    res.status(201).json(data);
    return;
  });

  listWiki = asyncHandler(async (req: Request, res: Response) => {
    const clinicId = req.user?.clinicId;
    if (!clinicId) {
      throw Errors.unauthorized("Missing clinic context");
    }
    const data = await this.listWikiUC.execute(clinicId);
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
      throw Errors.validation("Invalid input", parsed.error.errors as any);
    }
    const createdBy = req.user?.id ?? "";
    const data = await this.createWikiUC.execute(clinicId, createdBy, parsed.data);
    res.status(201).json(data);
    return;
  });

  updateWikiEntry = asyncHandler(async (req: Request, res: Response) => {
    const clinicId = req.user?.clinicId;
    if (!clinicId) {
      throw Errors.unauthorized("Missing clinic context");
    }
    const { id } = req.params;
    const parsed = updateWikiPageSchema.safeParse(req.body);
    if (!parsed.success) {
      throw Errors.validation("Invalid input", parsed.error.errors as any);
    }
    const data = await this.updateWikiUC.execute(id, clinicId, parsed.data);
    res.json(data);
    return;
  });

  deleteWikiEntry = asyncHandler(async (req: Request, res: Response) => {
    const clinicId = req.user?.clinicId;
    if (!clinicId) {
      throw Errors.unauthorized("Missing clinic context");
    }
    const { id } = req.params;
    await this.deleteWikiUC.execute(id, clinicId);
    res.status(204).send();
  });

  createRootUser = asyncHandler(async (req: Request, res: Response) => {
    if (process.env.ENABLE_DANGEROUS_ADMIN_ENDPOINTS !== "true") {
      throw Errors.notFound("Endpoint");
    }
    const requestingUser = req.user;
    if (!requestingUser?.role || requestingUser.role !== "super_admin") {
      throw Errors.forbidden("Requires super_admin role");
    }
    try {
      const { email, name } = req.body;
      const user = await (prisma as any).users.create({
        data: {
          email,
          name,
          tenantId: "00000000-0000-0000-0000-000000000000",
        } as any,
      });

      await prisma.users.update({
        where: { email },
        data: { role: "ROOT" },
      }).catch(() => {});

      res.status(200).json({ message: "Root user created successfully", user });
      return;
    } catch (error: unknown) {
      logger.error("Error creating root user", { error });
      throw Errors.database("Failed to create root user");
    }
  });

  analyzeDatabaseHealth = asyncHandler(async (_req: Request, res: Response) => {
    const activeConnections = await prisma
      .$queryRaw`SELECT count(*) FROM pg_stat_activity`
      .catch(() => [{ count: 0 }]);

    const tableSizes = await prisma
      .$queryRaw`
        SELECT relname as "table",
               pg_size_pretty(pg_total_relation_size(relid)) As "size"
        FROM pg_catalog.pg_statio_user_tables
        ORDER BY pg_total_relation_size(relid) DESC`
      .catch(() => []);

    res.status(200).json({
      status: "healthy",
      activeConnections: (activeConnections as any)[0]?.count || 0,
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
      const status = (error as any).response?.status ?? 500;
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
      results.patients = await (prisma as any).patients
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
      results.dentists = await (prisma as any).profiles
        .findMany({
          where: {
            clinic_id: clinicId,
            app_role: { contains: "DENTIST", mode: "insensitive" },
            OR: [
              { full_name: { contains: String(query), mode: "insensitive" } },
            ],
          },
          take: 10,
        })
        .catch(() => []);
    }

    res.status(200).json({ results });
    return;
  });
}
