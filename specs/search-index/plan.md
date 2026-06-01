# Plan: Índice de Busca (Full-Text Search)

## Overview
Sistema de busca full-text para pacientes, agenda, PEP e outros módulos usando PostgreSQL tsvector ou Elasticsearch.

## Architecture
- Frontend: SearchBar component, SearchResults page
- Backend: SearchController, Indexer services
- Database: search_documents table, tsvector indexes

## Phases
### Phase 1: Foundation
- [ ] Create search_documents table with tsvector columns
- [ ] Set up PostgreSQL text search configuration (portuguese)
- [ ] Create SearchController with /api/search endpoint

### Phase 2: Implementation
- [ ] Implement PacienteIndexer (index patient data)
- [ ] Implement AgendaIndexer (index appointments)
- [ ] Implement PepIndexer (index medical records)
- [ ] Create SearchBar UI component

### Phase 3: Polish
- [ ] Add search highlighting (snippets)
- [ ] Add search filters (by module, date range)
- [ ] Add search analytics (most searched terms)
- [ ] Optimize index refresh strategy

## Risks
- Large table sizes may affect index performance
- Need to balance index freshness vs. performance
