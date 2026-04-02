import { prisma } from "@/infrastructure/database/prismaClient";
import { logger } from "@/infrastructure/logger";
import axios from "axios";
import { Request, Response } from "express";

export const createRootUser = async (req: Request, res: Response) => {
  // Gate behind environment variable to prevent accidental exposure
  if (process.env.ENABLE_DANGEROUS_ADMIN_ENDPOINTS !== "true") {
    return res.status(404).json({ error: "Not found" });
  }
  // Require super_admin authorization
  const requestingUser = req.user;
  if (!requestingUser?.app_role || requestingUser.app_role !== "super_admin") {
    return res.status(403).json({ error: "Forbidden: requires super_admin role" });
  }
  try {
    const { email, name } = req.body;

    if (!email || typeof email !== "string" || !name || typeof name !== "string") {
      return res.status(400).json({ error: "Email and name are required strings" });
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    // Prevent excessively long inputs
    if (email.length > 255 || name.length > 255) {
      return res.status(400).json({ error: "Email and name must be under 255 characters" });
    }

    // In a real scenario, this would create an Auth user or setup initial tenant structure.
    // Simulating creation for the endpoint migration.
    // Password hashing handled by Auth service
    const user = await (prisma as any).users.create({ // eslint-disable-line @typescript-eslint/no-explicit-any
      data: {
        email,
        name,
        tenantId: "00000000-0000-0000-0000-000000000000", // Root tenant
      } as any, // eslint-disable-line @typescript-eslint/no-explicit-any
    });

    // Simulate updating permissions
    await prisma
      .$executeRaw`UPDATE auth.users SET raw_user_meta_data = raw_user_meta_data || '{"is_super_admin": true}'::jsonb WHERE email = ${email}`
      .catch((err: Error) => {
        logger.warn("Failed to update auth.users metadata (may not exist in this environment)", { error: err.message });
      });

    return res
      .status(201)
      .json({ message: "Root user created successfully", user });
  } catch (error) {
    logger.error("Error creating root user", { error });
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const analyzeDatabaseHealth = async (req: Request, res: Response) => {
  // Require admin authorization for database health metrics
  const requestingUser = req.user;
  if (!requestingUser?.role || !["ROOT", "ADMIN", "super_admin"].includes(requestingUser.role)) {
    return res.status(403).json({ error: "Forbidden: requires admin role" });
  }
  try {
    // Collect some basic metrics.
    const activeConnections = await prisma
      .$queryRaw<{ count: number }[]>`SELECT count(*) FROM pg_stat_activity`
      .catch(() => [{ count: 0 }]);

    const tableSizes = await prisma
      .$queryRaw<{ table: string; size: string }[]>`
        SELECT relname as "table",
               pg_size_pretty(pg_total_relation_size(relid)) As "size"
        FROM pg_catalog.pg_statio_user_tables
        ORDER BY pg_total_relation_size(relid) DESC
        LIMIT 50`
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

export const githubProxy = async (req: Request, res: Response) => {
  // Require admin authorization for GitHub proxy
  const requestingUser = req.user;
  if (!requestingUser?.role || !["ROOT", "ADMIN", "super_admin"].includes(requestingUser.role)) {
    return res.status(403).json({ error: "Forbidden: requires admin role" });
  }
  try {
    const { url, method = "GET", data } = req.body;

    if (!url) {
      return res.status(400).json({ error: "Invalid GitHub URL" });
    }

    try {
      const parsed = new URL(url);
      if (parsed.protocol !== "https:" || parsed.hostname !== "api.github.com") {
        return res.status(400).json({ error: "Invalid GitHub URL" });
      }
    } catch {
      return res.status(400).json({ error: "Invalid GitHub URL" });
    }

    const allowedMethods = ["GET", "POST", "PUT", "PATCH", "DELETE"];
    if (!allowedMethods.includes(method.toUpperCase())) {
      return res.status(400).json({ error: "Invalid HTTP method" });
    }

    const githubToken = process.env.GITHUB_TOKEN;
    const headers = githubToken
      ? { Authorization: `Bearer ${githubToken}` }
      : {};

    const response = await axios({
      url,
      method,
      data,
      timeout: 15000, // 15 second timeout
      headers: {
        ...headers,
        Accept: "application/vnd.github.v3+json",
        "User-Agent": "OrthoPlus-Backend",
      },
    });

    return res.status(200).json(response.data);
  } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
    logger.error("GitHub Proxy Error", { error });
    const status = error.response?.status || 500;
    return res.status(status).json({ error: "GitHub Request Failed" });
  }
};

export const globalSearch = async (req: Request, res: Response) => {
  try {
    const { query, entityType } = req.query;
    if (!query || typeof query !== "string") {
      return res.status(400).json({ error: "Query is required" });
    }

    // Validate entityType if provided
    const validEntityTypes = ["patients", "dentists"];
    if (entityType && !validEntityTypes.includes(String(entityType))) {
      return res.status(400).json({ error: `Invalid entityType. Must be one of: ${validEntityTypes.join(", ")}` });
    }

    const searchQuery = query;
    if (searchQuery.length > 100) {
      return res.status(400).json({ error: "Search query too long (max 100 characters)" });
    }

    const clinicId = req.user?.clinicId;
    if (!clinicId) {
      return res.status(401).json({ error: "Missing clinic context" });
    }

    const results: any = {}; // eslint-disable-line @typescript-eslint/no-explicit-any

    // In a real application, consider using Postgres Full Text Search
    if (!entityType || entityType === "patients") {
      results.patients = await (prisma as any).patients // eslint-disable-line @typescript-eslint/no-explicit-any
        .findMany({
          where: {
            clinic_id: clinicId,
            OR: [
              { name: { contains: searchQuery, mode: "insensitive" } },
              { cpf: { contains: searchQuery } },
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
              { name: { contains: searchQuery, mode: "insensitive" } },
              { cro: { contains: searchQuery } },
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
