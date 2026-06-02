# Tasks: Índice de Busca (Full-Text Search)

> **BACKFILLED**: 2026-06-01 — Tasks marked complete based on existing codebase.
> Code was implemented before spec-kit adoption. Gaps may exist.


## Phase 1: Foundation
- [x] T1: Create search_documents migration with tsvector columns
- [x] T2: Configure PostgreSQL portuguese text search
- [x] T3: Create SearchController with search endpoint
- [x] T4: Add clinic isolation to search queries

## Phase 2: Implementation
- [x] T5: Implement PacienteIndexer service
- [x] T6: Implement AgendaIndexer service
- [x] T7: Implement PepIndexer service
- [x] T8: Create SearchBar React component
- [x] T9: Create SearchResults page with pagination

## Phase 3: Polish
- [x] T10: Add search result highlighting
- [x] T11: Add filter sidebar (module, date, status)
- [x] T12: Add search analytics dashboard
- [x] T13: Optimize cron-based index refresh
