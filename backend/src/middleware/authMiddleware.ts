import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

/**
 * Auth middleware that extracts JWT from Authorization header or HttpOnly cookie
 * and populates req.clinicId and req.user for downstream controllers.
 *
 * SECURITY:
 * - For /api/* routes (except /api/auth and /health), authentication is REQUIRED unless AUTH_ALLOW_MOCK=true
 * - JWT must contain clinicId claim for multi-tenant isolation
 * - JWT_SECRET must be set (no fallback to prevent security issues)
 * - Reads token from HttpOnly cookie first, then Authorization header
 */
export function authMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  const cookieToken = (req as Request & { cookies?: Record<string, string> }).cookies?.access_token;
  const authHeader = req.headers.authorization;
  const token = cookieToken || (authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : undefined);

  const isApiRoute = req.path.startsWith("/api") || req.path.startsWith("/functions/v1");
  const isPublicApi = req.path.startsWith("/api/auth") || req.path === "/health";
  const allowMock = process.env.AUTH_ALLOW_MOCK === "true";

  // If no token on protected API routes, block unless mock mode is enabled
  if (!token) {
    if (isApiRoute && !isPublicApi && !allowMock) {
      return _res.status(401).json({ error: "Unauthorized - JWT token required" });
    }
    return next();
  }

  try {
    // SECURITY: JWT_SECRET must be set — no fallback allowed
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret && !allowMock) {
      throw new Error("JWT_SECRET is required in production");
    }

    if (!jwtSecret) {
      throw new Error("JWT_SECRET is not configured");
    }

    const decoded: any = jwt.verify( // eslint-disable-line @typescript-eslint/no-explicit-any
      token,
      jwtSecret,
    );

    // SECURITY: clinicId MUST exist in token (except in explicit mock mode)
    if (!decoded.clinicId && !allowMock) {
      throw new Error("Missing clinicId in token - multi-tenant isolation required");
    }

    // Set clinicId from token — explicit conditional to avoid accidental fallback
    if (decoded.clinicId) {
      req.clinicId = decoded.clinicId;
    } else if (allowMock) {
      // decoded.clinicId is missing but mock mode is enabled — use the mock clinic ID.
      // The check at line 52 already threw for non-mock mode, so this branch is
      // only reachable when allowMock=true.
      req.clinicId = "mock-clinic-id";
    } else {
      // Defensive guard: should not be reachable since line 52 throws first,
      // but ensures we never silently set an undefined clinicId.
      return _res.status(403).json({ error: "Token missing clinic context" });
    }

    // Also set user object for RBAC
    req.user = {
      id: decoded.sub,
      clinicId: req.clinicId!,
      role: decoded.role || "MEMBER",
    };
  } catch (error) {
    // Invalid token — block API access unless mock mode is enabled
    if (isApiRoute && !isPublicApi && !allowMock) {
      return _res.status(401).json({ error: "Invalid or expired token" });
    }
    // Clear user data on public routes when token is invalid
    // to prevent downstream handlers from using stale/invalid data
    req.user = undefined;
    req.clinicId = undefined;
  }

  return next();
}

/**
 * Tenant guard middleware: ensures the authenticated user's clinicId matches
 * any :clinicId / :clinic_id / :id route parameter (cross-tenant access denied).
 * ROOT role bypasses this check.
 */
export function tenantGuard(req: Request, res: Response, next: NextFunction) {
  const user = req.user;
  if (!user?.clinicId) {
    return res.status(403).json({ error: "Clinic context required" });
  }
  const routeClinicId =
    req.params.clinicId || req.params.clinic_id || req.params.id;
  if (routeClinicId && routeClinicId !== user.clinicId && user.role !== "ROOT") {
    return res.status(403).json({ error: "Cross-tenant access denied" });
  }
  return next();
}
