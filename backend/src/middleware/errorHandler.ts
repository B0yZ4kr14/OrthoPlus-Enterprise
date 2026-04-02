import { Request, Response, NextFunction } from "express";
import { logger } from "@/infrastructure/logger";

/**
 * RFC 7807 Problem Details for HTTP APIs
 * https://tools.ietf.org/html/rfc7807
 *
 * Standardized error response format for consistent frontend handling:
 * {
 *   "type": "https://api.orthoplus.com.br/errors/validation-failed",
 *   "title": "Validation Failed",
 *   "status": 400,
 *   "detail": "The request body contains invalid data",
 *   "instance": "/api/pacientes/123",
 *   "code": "VALIDATION_ERROR",
 *   "errors": [
 *     { "field": "email", "message": "Invalid email format", "code": "INVALID_EMAIL" }
 *   ]
 * }
 */

export interface ProblemDetail {
  /** A URI reference that identifies the problem type */
  type: string;
  /** A short, human-readable summary of the problem type */
  title: string;
  /** The HTTP status code */
  status: number;
  /** A human-readable explanation specific to this occurrence */
  detail?: string;
  /** A URI reference that identifies the specific occurrence */
  instance?: string;
  /** Application-specific error code for i18n */
  code: string;
  /** Additional application-specific details */
  errors?: ValidationError[];
  /** Timestamp of the error */
  timestamp?: string;
  /** Request ID for tracing */
  requestId?: string;
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
  value?: unknown;
}

/**
 * Error codes for frontend i18n translation
 * Format: DOMAIN_ERROR_SUBTYPE
 */
export const ErrorCodes = {
  // Generic errors
  INTERNAL_ERROR: "GENERIC_INTERNAL_ERROR",
  NOT_FOUND: "GENERIC_NOT_FOUND",
  VALIDATION_ERROR: "GENERIC_VALIDATION_ERROR",
  UNAUTHORIZED: "AUTH_UNAUTHORIZED",
  FORBIDDEN: "AUTH_FORBIDDEN",
  RATE_LIMITED: "GENERIC_RATE_LIMITED",
  
  // Auth errors
  AUTH_INVALID_CREDENTIALS: "AUTH_INVALID_CREDENTIALS",
  AUTH_TOKEN_EXPIRED: "AUTH_TOKEN_EXPIRED",
  AUTH_TOKEN_INVALID: "AUTH_TOKEN_INVALID",
  AUTH_NO_CLINIC: "AUTH_NO_CLINIC_ASSIGNED",
  AUTH_SESSION_EXPIRED: "AUTH_SESSION_EXPIRED",
  
  // Validation errors
  VALIDATION_REQUIRED_FIELD: "VALIDATION_REQUIRED_FIELD",
  VALIDATION_INVALID_FORMAT: "VALIDATION_INVALID_FORMAT",
  VALIDATION_INVALID_EMAIL: "VALIDATION_INVALID_EMAIL",
  VALIDATION_INVALID_CPF: "VALIDATION_INVALID_CPF",
  VALIDATION_INVALID_CNPJ: "VALIDATION_INVALID_CNPJ",
  VALIDATION_MIN_LENGTH: "VALIDATION_MIN_LENGTH",
  VALIDATION_MAX_LENGTH: "VALIDATION_MAX_LENGTH",
  VALIDATION_UNIQUE_VIOLATION: "VALIDATION_UNIQUE_VIOLATION",
  
  // Business logic errors
  BUSINESS_RESOURCE_NOT_FOUND: "BUSINESS_RESOURCE_NOT_FOUND",
  BUSINESS_RESOURCE_CONFLICT: "BUSINESS_RESOURCE_CONFLICT",
  BUSINESS_OPERATION_NOT_ALLOWED: "BUSINESS_OPERATION_NOT_ALLOWED",
  BUSINESS_INSUFFICIENT_PERMISSIONS: "BUSINESS_INSUFFICIENT_PERMISSIONS",
  
  // Database errors
  DB_CONNECTION_ERROR: "DB_CONNECTION_ERROR",
  DB_QUERY_ERROR: "DB_QUERY_ERROR",
  DB_CONSTRAINT_VIOLATION: "DB_CONSTRAINT_VIOLATION",
  
  // External service errors
  EXTERNAL_SERVICE_ERROR: "EXTERNAL_SERVICE_ERROR",
  EXTERNAL_TIMEOUT: "EXTERNAL_TIMEOUT",
} as const;

export type ErrorCode = typeof ErrorCodes[keyof typeof ErrorCodes];

/**
 * Custom API Error class with Problem Details support
 */
export class ApiError extends Error {
  public readonly status: number;
  public readonly code: ErrorCode;
  public readonly type: string;
  public readonly errors?: ValidationError[];
  public readonly timestamp: string;
  public readonly requestId: string;

  constructor(
    status: number,
    code: ErrorCode,
    title: string,
    detail?: string,
    errors?: ValidationError[],
    type?: string
  ) {
    super(detail || title);
    this.status = status;
    this.code = code;
    this.title = title;
    this.errors = errors;
    this.type = type || `https://orthoplus.i9corp.com.br/errors/${this.toKebabCase(code)}`;
    this.timestamp = new Date().toISOString();
    this.requestId = this.generateRequestId();
    
    // Maintain proper stack trace
    Error.captureStackTrace(this, this.constructor);
  }

  toProblemDetail(instance?: string): ProblemDetail {
    return {
      type: this.type,
      title: this.title,
      status: this.status,
      detail: this.message,
      instance,
      code: this.code,
      errors: this.errors,
      timestamp: this.timestamp,
      requestId: this.requestId,
    };
  }

  private toKebabCase(str: string): string {
    return str.toLowerCase().replace(/_/g, "-");
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

/**
 * Predefined error factories for common scenarios
 */
export const Errors = {
  // 400 Bad Request
  validation: (detail: string, errors?: ValidationError[]) =>
    new ApiError(400, ErrorCodes.VALIDATION_ERROR, "Validation Failed", detail, errors),
  
  // 401 Unauthorized
  unauthorized: (detail = "Authentication required") =>
    new ApiError(401, ErrorCodes.UNAUTHORIZED, "Unauthorized", detail),
  
  invalidCredentials: () =>
    new ApiError(401, ErrorCodes.AUTH_INVALID_CREDENTIALS, "Invalid Credentials", "Email or password is incorrect"),
  
  tokenExpired: () =>
    new ApiError(401, ErrorCodes.AUTH_TOKEN_EXPIRED, "Token Expired", "Your session has expired. Please log in again."),
  
  // 403 Forbidden
  forbidden: (detail = "You don't have permission to perform this action") =>
    new ApiError(403, ErrorCodes.FORBIDDEN, "Forbidden", detail),
  
  noClinicAssigned: () =>
    new ApiError(403, ErrorCodes.AUTH_NO_CLINIC, "No Clinic Assigned", "User has no clinic associated. Contact administrator."),
  
  // 404 Not Found
  notFound: (resource: string, id?: string) =>
    new ApiError(404, ErrorCodes.NOT_FOUND, "Not Found", `${resource}${id ? ` with id '${id}'` : ""} not found`),
  
  // 409 Conflict
  conflict: (detail: string) =>
    new ApiError(409, ErrorCodes.BUSINESS_RESOURCE_CONFLICT, "Conflict", detail),
  
  // 429 Too Many Requests
  rateLimited: (detail = "Too many requests. Please try again later.") =>
    new ApiError(429, ErrorCodes.RATE_LIMITED, "Rate Limited", detail),
  
  // 500 Internal Server Error
  internal: (detail = "An unexpected error occurred") =>
    new ApiError(500, ErrorCodes.INTERNAL_ERROR, "Internal Server Error", detail),
  
  database: (detail = "Database operation failed") =>
    new ApiError(500, ErrorCodes.DB_QUERY_ERROR, "Database Error", detail),
  
  externalService: (service: string) =>
    new ApiError(502, ErrorCodes.EXTERNAL_SERVICE_ERROR, "External Service Error", `${service} service is unavailable`),
};

/**
 * Express error handling middleware
 * Converts all errors to RFC 7807 Problem Details format
 */
export function errorHandler(
  err: Error | ApiError,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Generate request ID for tracking
  const requestId = (err as ApiError).requestId || `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  // Determine if it's an operational error we expect
  const isOperationalError = err instanceof ApiError;
  
  // Default error values
  let status = 500;
  let problemDetail: ProblemDetail;
  
  if (err instanceof ApiError) {
    // Known operational error
    status = err.status;
    problemDetail = err.toProblemDetail(req.originalUrl);
    
    // Log operational errors with context
    logger.warn({
      requestId,
      code: err.code,
      status: err.status,
      path: req.originalUrl,
      method: req.method,
      userAgent: req.headers["user-agent"],
      ip: req.ip,
      errors: err.errors,
    }, `Operational error: ${err.code}`);
    
  } else {
    // Unexpected error - don't leak details to client
    const isDev = process.env.NODE_ENV === "development";
    
    problemDetail = {
      type: "https://orthoplus.i9corp.com.br/errors/internal-error",
      title: "Internal Server Error",
      status: 500,
      detail: isDev ? err.message : "An unexpected error occurred. Please try again later.",
      instance: req.originalUrl,
      code: ErrorCodes.INTERNAL_ERROR,
      timestamp: new Date().toISOString(),
      requestId,
    };
    
    // Log full error details for debugging
    logger.error({
      requestId,
      error: err.message,
      stack: err.stack,
      path: req.originalUrl,
      method: req.method,
      body: req.body,
      query: req.query,
      userAgent: req.headers["user-agent"],
      ip: req.ip,
    }, "Unexpected error occurred");
  }
  
  // Send response with proper content type
  res.status(status)
    .setHeader("Content-Type", "application/problem+json")
    .json(problemDetail);
}

/**
 * Async handler wrapper to catch errors in async route handlers
 * Usage: router.get('/path', asyncHandler(async (req, res) => { ... }))
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * Validation helper for Express routes
 */
export function validateRequest(
  req: Request,
  requiredFields: string[]
): void {
  const missing: ValidationError[] = [];
  
  for (const field of requiredFields) {
    if (req.body[field] === undefined || req.body[field] === null || req.body[field] === "") {
      missing.push({
        field,
        message: `Field '${field}' is required`,
        code: ErrorCodes.VALIDATION_REQUIRED_FIELD,
      });
    }
  }
  
  if (missing.length > 0) {
    throw Errors.validation("Required fields are missing", missing);
  }
}
