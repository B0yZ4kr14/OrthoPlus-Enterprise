import { prisma } from "@/infrastructure/database/prismaClient";
import { logger } from "@/infrastructure/logger";
import axios from "axios";
import { Request, Response } from "express";
import { createADRSchema, createWikiPageSchema, updateWikiPageSchema } from "./schemas";

export class AdminToolsController {
  // --- ADRs ---
  async listADRs(req: Request, res: Response) {
    try {
      const clinicId = req.user?.clinicId;
      if (!clinicId) {
        res.status(401).json({ error: "Missing clinic context" });
        return;
      }
      const data = await (prisma as any).architecture_decision_records.findMany({ // eslint-disable-line @typescript-eslint/no-explicit-any
        where: { clinic_id: clinicId },
        orderBy: { created_at: "desc" },
      });
      res.json(data);
    } catch (error) {
      logger.error("Error listing ADRs", { error });
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async createADR(req: Request, res: Response) {
    try {
      const clinicId = req.user?.clinicId;
      if (!clinicId) {
        res.status(401).json({ error: "Missing clinic context" });
        return;
      }
      const parsed = createADRSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: "Invalid input", details: parsed.error.flatten() });
        return;
      }
      const createdBy = req.user?.id ?? "";
      const data = await (prisma as any).architecture_decision_records.create({ // eslint-disable-line @typescript-eslint/no-explicit-any
        data: { ...parsed.data, clinic_id: clinicId, created_by: createdBy },
      });
      res.status(201).json(data);
    } catch (error) {
      logger.error("Error creating ADR", { error });
      res.status(500).json({ error: "Internal server error" });
    }
  }

  // --- Wiki ---
  async listWiki(req: Request, res: Response) {
    try {
      const clinicId = req.user?.clinicId;
      if (!clinicId) {
        res.status(401).json({ error: "Missing clinic context" });
        return;
      }
      const data = await (prisma as any).wiki_pages.findMany({ // eslint-disable-line @typescript-eslint/no-explicit-any
        where: { clinic_id: clinicId },
        orderBy: { updated_at: "desc" },
      });
      res.json(data);
    } catch (error) {
      logger.error("Error listing wiki pages", { error });
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async createWikiEntry(req: Request, res: Response) {
    try {
      const clinicId = req.user?.clinicId;
      if (!clinicId) {
        res.status(401).json({ error: "Missing clinic context" });
        return;
      }
      const parsed = createWikiPageSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: "Invalid input", details: parsed.error.flatten() });
        return;
      }
      const createdBy = req.user?.id ?? "";
      const data = await (prisma as any).wiki_pages.create({ // eslint-disable-line @typescript-eslint/no-explicit-any
        data: { ...parsed.data, clinic_id: clinicId, created_by: createdBy },
      });
      res.status(201).json(data);
    } catch (error) {
      logger.error("Error creating wiki page", { error });
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async updateWikiEntry(req: Request, res: Response) {
    try {
      const clinicId = req.user?.clinicId;
      if (!clinicId) {
        res.status(401).json({ error: "Missing clinic context" });
        return;
      }
      const { id } = req.params;
      const existing = await (prisma as any).wiki_pages.findFirst({ // eslint-disable-line @typescript-eslint/no-explicit-any
        where: { id, clinic_id: clinicId },
      });
      if (!existing) {
        res.status(404).json({ error: "Wiki page not found" });
        return;
      }
      const parsed = updateWikiPageSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: "Invalid input", details: parsed.error.flatten() });
        return;
      }
      const data = await (prisma as any).wiki_pages.update({ // eslint-disable-line @typescript-eslint/no-explicit-any
        where: { id },
        data: parsed.data,
      });
      res.json(data);
    } catch (error) {
      logger.error("Error updating wiki page", { error });
      res.status(500).json({ error: "Internal server error" });
    }
  }

  // --- Legacy Admin Tools ---
  public createRootUser = async (req: Request, res: Response) => {
    // Gate behind environment variable to prevent accidental exposure
    if (process.env.ENABLE_DANGEROUS_ADMIN_ENDPOINTS !== "true") {
      return res.status(404).json({ error: "Not found" });
    }
    // Require super_admin authorization
    const requestingUser = req.user;
    if (!requestingUser?.role || requestingUser.role !== "super_admin") {
      return res.status(403).json({ error: "Forbidden: requires super_admin role" });
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

      return res
        .status(200)
        .json({ message: "Root user created successfully", user });
    } catch (error) {
      logger.error("Error creating root user", { error });
      return res.status(500).json({ error: "Internal server error" });
    }
  };

  public analyzeDatabaseHealth = async (_req: Request, res: Response) => {
    try {
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

      return res.status(200).json({
        status: "healthy",
        activeConnections: activeConnections[0]?.count || 0,
        tableSizes,
      });
    } catch (error) {
      logger.error("Error analyzing database health", { error });
      return res.status(500).json({ error: "Internal server error" });
    }
  };

  public githubProxy = async (req: Request, res: Response) => {
    try {
      const { url, method = "GET", data } = req.body;

      if (!url || !url.startsWith("https://api.github.com/")) {
        return res.status(400).json({ error: "Invalid GitHub URL" });
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

      return res.status(200).json(response.data);
    } catch (error: unknown) {
      logger.error("GitHub Proxy Error", { error });
      const status = (error as { response?: { status?: number } })?.response?.status ?? 500;
      return res.status(status).json({
        error: "GitHub Request Failed",
      });
    }
  };

  public globalSearch = async (req: Request, res: Response) => {
    try {
      const { query, entityType } = req.query;
      if (!query) {
        return res.status(400).json({ error: "Query is required" });
      }

      const clinicId = req.user?.clinicId;
      if (!clinicId) {
        return res.status(401).json({ error: "Missing clinic context" });
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

      return res.status(200).json({ results });
    } catch (error) {
      logger.error("Global Search Error", { error });
      return res.status(500).json({ error: "Internal server error" });
    }
  };
}
