import type { Response } from "express";
import type { ProblemDetail, ResponseMeta } from "@orthoplus/shared-types";

/**
 * Standardized API Response Envelope
 * Architecture Refactor T5.5
 *
 * Provides a consistent response shape across all endpoints:
 * {
 *   success: boolean,
 *   data: T | null,
 *   error: ProblemDetail | null,
 *   meta?: ResponseMeta
 * }
 *
 * Usage:
 *   ApiResponse.success(res, data)
 *   ApiResponse.success(res, data, 201)
 *   ApiResponse.success(res, data, 200, { page: 1, total: 100 })
 *   ApiResponse.error(res, problemDetail)
 */

export interface StandardApiResponse<T> {
  success: boolean;
  data: T | null;
  error: ProblemDetail | null;
  meta?: ResponseMeta;
}

export class ApiResponse {
  static success<T>(
    res: Response,
    data: T,
    statusCode = 200,
    meta?: ResponseMeta,
  ): Response {
    const payload: StandardApiResponse<T> = {
      success: true,
      data,
      error: null,
    };
    if (meta) {
      payload.meta = meta;
    }
    return res.status(statusCode).json(payload);
  }

  static error(
    res: Response,
    problem: ProblemDetail,
    statusCode?: number,
  ): Response {
    const payload: StandardApiResponse<never> = {
      success: false,
      data: null,
      error: problem,
    };
    return res.status(statusCode ?? problem.status).json(payload);
  }

  static created<T>(res: Response, data: T): Response {
    return this.success(res, data, 201);
  }

  static noContent(res: Response): Response {
    return res.status(204).send();
  }
}
