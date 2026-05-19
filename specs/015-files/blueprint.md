# Blueprint — Feature 015: Gestão de Arquivos e Documentos

## Overview
Armazenamento de arquivos com metadados, preview e download, controle de acesso por arquivo, OCR e indexação de conteúdo, e versionamento de documentos.

## Frontend Scaffold

### Components
- [ ] `apps/web/src/modules/files/presentation/components/FileUpload.tsx` — Componente de upload com drag-and-drop
- [ ] `apps/web/src/modules/files/presentation/components/FilePreview.tsx` — Preview inline (PDF, imagens)
- [ ] `apps/web/src/modules/files/presentation/components/FileList.tsx` — Listagem de arquivos com filtros
- [ ] `apps/web/src/modules/files/presentation/components/FileCard.tsx` — Card de arquivo
- [ ] `apps/web/src/modules/files/presentation/components/FilePermissions.tsx` — Controle de permissões
- [ ] `apps/web/src/modules/files/presentation/components/FileVersionHistory.tsx` — Histórico de versões
- [ ] `apps/web/src/modules/files/presentation/components/OCRSearch.tsx` — Busca por conteúdo OCR
- [ ] `apps/web/src/modules/files/presentation/components/BatchDownload.tsx` — Download em lote (ZIP)

### Hooks
- [X] `apps/web/src/hooks/api/useFiles.ts` — Hook global de arquivos (CRUD básico)
- [ ] `apps/web/src/modules/files/presentation/hooks/useFileUpload.ts` — Upload com progresso
- [ ] `apps/web/src/modules/files/presentation/hooks/useFilePreview.ts` — Preview de arquivos
- [ ] `apps/web/src/modules/files/presentation/hooks/useFilePermissions.ts` — Permissões
- [ ] `apps/web/src/modules/files/presentation/hooks/useFileVersions.ts` — Versionamento
- [ ] `apps/web/src/modules/files/presentation/hooks/useOCRSearch.ts` — Busca OCR

### Pages
- [X] `apps/web/src/modules/files/ui/pages/FileListPage.tsx` — Página de listagem
- [X] `apps/web/src/modules/files/ui/pages/FileUploadPage.tsx` — Página de upload
- [ ] `apps/web/src/modules/files/ui/pages/FilePreviewPage.tsx` — Página de preview dedicada
- [ ] `apps/web/src/modules/files/ui/pages/FilePermissionsPage.tsx` — Página de permissões
- [ ] `apps/web/src/modules/files/ui/pages/FileVersionsPage.tsx` — Página de versionamento

### Services (Frontend API)
- [ ] `apps/web/src/modules/files/services/fileApi.ts` — Camada de API dedicada

## Backend Scaffold

### Controllers/Routes
- [X] `backend/src/modules/files/api/filesController.ts` — Controller principal (428 linhas)
- [X] `backend/src/modules/files/api/reportController.ts` — Controller de relatórios (320 linhas)
- [X] `backend/src/modules/files/api/router.ts` — Rotas Express
- [ ] `backend/src/modules/files/api/schemas.ts` — Schemas Zod (não existe)
- [ ] `backend/src/modules/files/api/types/` — DTOs e tipos

### Services
- [X] `backend/src/modules/files/application/services/FilesService.ts` — Serviço principal (185 linhas)
- [ ] `backend/src/modules/files/application/services/StorageService.ts` — Abstração de storage (MinIO/S3)
- [ ] `backend/src/modules/files/application/services/OCRService.ts` — Serviço de OCR
- [ ] `backend/src/modules/files/application/services/PermissionService.ts` — Permissões de arquivo
- [ ] `backend/src/modules/files/application/services/VersionService.ts` — Versionamento

### Infrastructure
- [ ] `backend/src/modules/files/infrastructure/minioClient.ts` — Client MinIO
- [ ] `backend/src/modules/files/infrastructure/s3Client.ts` — Client AWS S3

## Database (Prisma)
- [X] `backend/prisma/schema.prisma` — Model `arquivo`
- [ ] `backend/prisma/schema.prisma` — Model `Categoria` (não existe)
- [ ] `backend/prisma/schema.prisma` — Model `PermissaoArquivo` (não existe)
- [ ] `backend/prisma/schema.prisma` — Model `Versao` (não existe)

## Shared Types
- [X] `apps/web/src/types/database.ts` — Tipos gerados pelo Prisma
- [ ] `shared-types/src/files.ts` — Tipos compartilhados (não existe)

## Tests
- [X] `backend/tests/unit/files/FilesService.test.ts` — Testes do FilesService
- [ ] `backend/tests/unit/files/reportController.test.ts` — Testes do controller de relatórios
- [ ] `apps/web/src/modules/files/presentation/hooks/__tests__/useFileUpload.test.tsx` — Testes de upload
- [ ] `apps/web/src/modules/files/presentation/components/__tests__/FileList.test.tsx` — Testes de listagem
- [ ] `tests/e2e/files.spec.ts` — Testes E2E

## Summary
- Pre-completed: 6 files
- Pending: 25 files
- Total: 31 files
