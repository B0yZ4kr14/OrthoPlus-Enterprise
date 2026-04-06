/**
 * OrthoPlus Shared Types
 * 
 * This package contains types shared between backend and frontend
 * to ensure type-safe API communication.
 */

// API Types
export * from "./api";

// Auth Types
export * from "./auth";

// Module Types
export * from "./pacientes";
export * from "./agenda";
export * from "./procedimentos";
export * from "./crypto";

// Version
export const SHARED_TYPES_VERSION = "1.0.0";
