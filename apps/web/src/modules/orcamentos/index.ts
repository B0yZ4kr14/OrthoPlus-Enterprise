/**
 * Módulo ORCAMENTOS
 *
 * Segue o padrão DDD (Domain-Driven Design) com arquitetura em camadas:
 * - Domain: Entidades, Value Objects, Repository Interfaces
 * - Application: Use Cases, Commands, Queries, DTOs
 * - Infrastructure: Repositórios concretos, Persistência
 * - UI: Components, Pages, Hooks
 */

// Domain exports
// @ts-expect-error — TS2306
export * from "./domain";

// Application exports
// @ts-expect-error — TS2306
export * from "./application";

// Infrastructure exports
// @ts-expect-error — TS2306
export * from "./infrastructure";

// UI exports
export * from "./ui";
