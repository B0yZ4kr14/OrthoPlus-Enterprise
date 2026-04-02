/**
 * Authentication Types
 * Shared between backend and frontend
 */

// ============================================================================
// User & Authentication
// ============================================================================

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  clinicId: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export type UserRole = 
  | "admin" 
  | "dentist" 
  | "receptionist" 
  | "assistant"
  | "financial";

export interface Clinic {
  id: string;
  name: string;
  cnpj?: string;
  address?: Address;
  phone?: string;
  email?: string;
  logoUrl?: string;
  settings: ClinicSettings;
  activeModules: string[];
}

export interface Address {
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface ClinicSettings {
  timezone: string;
  currency: string;
  language: string;
  dateFormat: string;
  timeFormat: "12h" | "24h";
}

// ============================================================================
// Auth Requests & Responses
// ============================================================================

export interface LoginRequest {
  email: string;
  password: string;
  remember?: boolean;
}

export interface LoginResponse {
  user: User;
  clinic: Clinic;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface RequestPasswordResetRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

// ============================================================================
// JWT Payload
// ============================================================================

export interface JWTPayload {
  sub: string;        // user id
  email: string;
  role: UserRole;
  clinicId: string;
  iat: number;
  exp: number;
}

// ============================================================================
// Session
// ============================================================================

export interface Session {
  id: string;
  userId: string;
  clinicId: string;
  createdAt: string;
  expiresAt: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface SessionInfo {
  current: Session;
  others: Session[];
}
