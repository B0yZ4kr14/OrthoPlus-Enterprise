export interface ApiResponse<T> {
    data: T;
    meta?: ResponseMeta;
}
export interface ResponseMeta {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
}
export interface ProblemDetail {
    type: string;
    title: string;
    status: number;
    detail?: string;
    instance?: string;
    code: ErrorCode;
    errors?: ValidationError[];
    timestamp?: string;
    requestId?: string;
}
export interface ValidationError {
    field: string;
    message: string;
    code: string;
    value?: unknown;
}
export type ErrorCode = "GENERIC_INTERNAL_ERROR" | "GENERIC_NOT_FOUND" | "GENERIC_VALIDATION_ERROR" | "GENERIC_RATE_LIMITED" | "AUTH_UNAUTHORIZED" | "AUTH_FORBIDDEN" | "AUTH_INVALID_CREDENTIALS" | "AUTH_TOKEN_EXPIRED" | "AUTH_TOKEN_INVALID" | "AUTH_NO_CLINIC_ASSIGNED" | "AUTH_SESSION_EXPIRED" | "VALIDATION_REQUIRED_FIELD" | "VALIDATION_INVALID_FORMAT" | "VALIDATION_INVALID_EMAIL" | "VALIDATION_INVALID_CPF" | "VALIDATION_INVALID_CNPJ" | "VALIDATION_MIN_LENGTH" | "VALIDATION_MAX_LENGTH" | "VALIDATION_UNIQUE_VIOLATION" | "BUSINESS_RESOURCE_NOT_FOUND" | "BUSINESS_RESOURCE_CONFLICT" | "BUSINESS_OPERATION_NOT_ALLOWED" | "BUSINESS_INSUFFICIENT_PERMISSIONS";
export interface PaginationParams {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
}
export interface PaginatedResponse<T> {
    data: T[];
    meta: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
    };
}
//# sourceMappingURL=api.d.ts.map