import { Request, Response, NextFunction } from "express";
import { Errors } from "@/middleware/errorHandler";

/**
 * clinicGuard — Validates that the authenticated user has a clinic context.
 *
 * Must be applied **after** authMiddleware (which populates req.user).
 * Populates req.clinicId so controllers can destructure it directly.
 *
 * Usage:
 *   router.use(clinicGuard);
 *   router.get("/", controller.list);
 */
export function clinicGuard(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  const clinicId = req.user?.clinicId;
  if (!clinicId) {
    throw Errors.unauthorized("Missing clinic context");
  }
  req.clinicId = clinicId;
  next();
}
