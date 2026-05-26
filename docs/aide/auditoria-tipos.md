# Auditoria de Tipos Duplicados

> Gerado automaticamente em: 26/05/2026, 04:39:40

## Resumo
- Total de tipos no frontend: 2281
- Total de tipos no backend: 530
- Duplicatas encontradas: 65

## Duplicatas Candidatas a Migracao

### AIModelConfig
- **Frontend:** `apps/web/src/components/settings/AIModelConfig.tsx` (linha 25)
- **Backend:** `backend/src/modules/ia_radiografia/domain/services/LocalAIService.ts` (linha 28)
- **Kind:** interface / interface
- **Severidade:** BAIXA
- **Sobreposicao:** 0% (0 de 9 campos comuns)
- **Sugestao:** Manter versao do frontend — mais completa (9 vs 3 campos)
- **Diff:** campos apenas no frontend: `anthropic_api_key, default_model, default_provider, google_api_key, huggingface_api_key, max_tokens, openai_api_key, openrouter_api_key, temperature`; campos apenas no backend: `endpoint, model, version`

### ApiError
- **Frontend:** `apps/web/src/contexts/AuthContext.tsx` (linha 18)
- **Backend:** `backend/src/middleware/errorHandler.ts` (linha 78)
- **Kind:** interface / class
- **Severidade:** MEDIA
- **Sobreposicao:** 50% (1 de 40 campos comuns)
- **Sugestao:** Manter versao do backend — mais completa (2 vs 40 campos)
- **Diff:** campos apenas no frontend: `response`; campos apenas no backend: `_next, body, code, conflict, constructor, database, detail, err, error, errors, externalService, fn, forbidden, generateRequestId, instance, internal, invalidCredentials, ip, method, noClinicAssigned, notFound, path, query, rateLimited, req, requestId, requiredFields, res, stack, status, timestamp, title, toKebabCase, toProblemDetail, tokenExpired, type, unauthorized, userAgent, validation`

### Appointment
- **Frontend:** `apps/web/src/modules/agenda/domain/entities/Appointment.ts` (linha 34)
- **Backend:** `backend/src/modules/agenda/domain/entities/Appointment.ts` (linha 1)
- **Kind:** class / class
- **Severidade:** MEDIA
- **Sobreposicao:** 50% (3 de 31 campos comuns)
- **Sugestao:** Manter versao do frontend — mais completa (31 vs 6 campos)
- **Diff:** campos apenas no frontend: `appointmentType, canBeCancelled, canBeConfirmed, canBeRescheduled, cancellationReason, cancelledAt, clinicId, completedAt, confirmedAt, constructor, createdAt, createdBy, dentistId, durationMinutes, endDatetime, id, markAsCompleted, markAsNoShow, noShow, overlaps, patientId, reschedule, scheduledDatetime, status, toJSON, updateNotes, updatedAt, validate`; campos apenas no backend: `complete, markNoShow, start`

### BackupExecutionResult
- **Frontend:** `apps/web/src/modules/settings/hooks/useBackupStatus.ts` (linha 14)
- **Backend:** `backend/src/modules/database_admin/infrastructure/BackupSchedulerService.ts` (linha 14)
- **Kind:** interface / interface
- **Severidade:** ALTA
- **Sobreposicao:** 100% (8 de 8 campos comuns)
- **Sugestao:** Manter versao do frontend — mais completa (8 vs 8 campos)
- **Diff:** estruturas identicas

### CashFlowResult
- **Frontend:** `apps/web/src/modules/financeiro/application/queries/GetCashFlowQuery.ts` (linha 7)
- **Backend:** `backend/src/modules/financeiro/application/GetCashFlowUseCase.ts` (linha 4)
- **Kind:** interface / interface
- **Severidade:** ALTA
- **Sobreposicao:** 100% (3 de 4 campos comuns)
- **Sugestao:** Manter versao do frontend — mais completa (4 vs 3 campos)
- **Diff:** campos apenas no frontend: `period`

### CashRegisterFilters
- **Frontend:** `apps/web/src/modules/financeiro/domain/repositories/ICashRegisterRepository.ts` (linha 3)
- **Backend:** `backend/src/modules/financeiro/domain/repositories/IFinanceiroRepository.ts` (linha 34)
- **Kind:** interface / interface
- **Severidade:** MEDIA
- **Sobreposicao:** 67% (2 de 5 campos comuns)
- **Sugestao:** Manter versao do backend — mais completa (3 vs 5 campos)
- **Diff:** campos apenas no frontend: `period`; campos apenas no backend: `clinicId, endDate, startDate`

### CategoryBackupStatus
- **Frontend:** `apps/web/src/modules/settings/hooks/useBackupStatus.ts` (linha 5)
- **Backend:** `backend/src/modules/database_admin/infrastructure/BackupSchedulerService.ts` (linha 5)
- **Kind:** interface / interface
- **Severidade:** ALTA
- **Sobreposicao:** 100% (6 de 6 campos comuns)
- **Sugestao:** Manter versao do frontend — mais completa (6 vs 6 campos)
- **Diff:** estruturas identicas

### CategoryConfig
- **Frontend:** `apps/web/src/modules/settings/hooks/useDatabaseCategories.ts` (linha 4)
- **Backend:** `backend/src/modules/database_admin/infrastructure/MasterDatabaseManager.ts` (linha 9)
- **Kind:** interface / interface
- **Severidade:** ALTA
- **Sobreposicao:** 100% (4 de 4 campos comuns)
- **Sugestao:** Manter versao do frontend — mais completa (4 vs 4 campos)
- **Diff:** estruturas identicas

### CategoryFilters
- **Frontend:** `apps/web/src/modules/financeiro/domain/repositories/ICategoryRepository.ts` (linha 2)
- **Backend:** `backend/src/modules/financeiro/domain/repositories/IFinanceiroRepository.ts` (linha 27)
- **Kind:** interface / interface
- **Severidade:** ALTA
- **Sobreposicao:** 100% (2 de 4 campos comuns)
- **Sugestao:** Manter versao do backend — mais completa (2 vs 4 campos)
- **Diff:** campos apenas no backend: `clinicId, name`

### CategoryHealth
- **Frontend:** `apps/web/src/modules/settings/hooks/useDatabaseCategories.ts` (linha 11)
- **Backend:** `backend/src/modules/database_admin/infrastructure/MasterDatabaseManager.ts` (linha 16)
- **Kind:** interface / interface
- **Severidade:** ALTA
- **Sobreposicao:** 100% (5 de 6 campos comuns)
- **Sugestao:** Manter versao do backend — mais completa (5 vs 6 campos)
- **Diff:** campos apenas no backend: `circuitState`

### CategoryStats
- **Frontend:** `apps/web/src/modules/settings/hooks/useDatabaseCategories.ts` (linha 26)
- **Backend:** `backend/src/modules/database_admin/infrastructure/MasterDatabaseManager.ts` (linha 25)
- **Kind:** interface / interface
- **Severidade:** ALTA
- **Sobreposicao:** 100% (6 de 6 campos comuns)
- **Sugestao:** Manter versao do frontend — mais completa (6 vs 6 campos)
- **Diff:** estruturas identicas

### ContextBrief
- **Frontend:** `apps/web/src/modules/memory-hub/types/index.ts` (linha 24)
- **Backend:** `backend/src/modules/memory_hub/domain/services/ContextBriefService.ts` (linha 60)
- **Kind:** interface / interface
- **Severidade:** ALTA
- **Sobreposicao:** 100% (9 de 9 campos comuns)
- **Sugestao:** Manter versao do frontend — mais completa (9 vs 9 campos)
- **Diff:** estruturas identicas

### Contrato
- **Frontend:** `apps/web/src/components/contratos/ContratoForm.tsx` (linha 17)
- **Backend:** `backend/src/modules/contratos/domain/entities/Contrato.ts` (linha 9)
- **Kind:** type / class
- **Severidade:** BAIXA
- **Sobreposicao:** 0% (0 de 19 campos comuns)
- **Sugestao:** Manter versao do backend — mais completa (3 vs 19 campos)
- **Diff:** campos apenas no frontend: `initialData, onCancel, onSubmit`; campos apenas no backend: `assinar, assinaturaDigital, cancelar, constructor, dataAssinatura, dataFimPrevista, dataInicio, formaPagamento, items, numero, numeroParcelas, observacoes, pacienteId, pacienteNome, status, updatedAt, valorDesconto, valorFinal, valorTotal`

### CreateOrcamentoInput
- **Frontend:** `apps/web/src/modules/orcamentos/application/use-cases/CreateOrcamentoUseCase.ts` (linha 3)
- **Backend:** `backend/src/modules/orcamentos/application/services/OrcamentoService.ts` (linha 4)
- **Kind:** interface / interface
- **Severidade:** BAIXA
- **Sobreposicao:** 27% (3 de 14 campos comuns)
- **Sugestao:** Manter versao do backend — mais completa (11 vs 14 campos)
- **Diff:** campos apenas no frontend: `clinicId, createdBy, descontoPercentual, descontoValor, patientId, tipoPlano, validadeDias, valorSubtotal`; campos apenas no backend: `created_by, data_validade, desconto_percentual, desconto_valor, numero_orcamento, patient_id, status, tipo_plano, validade_dias, valor_final, valor_total`

### CreatePatientDTO
- **Frontend:** `apps/web/src/application/use-cases/patient/CreatePatientUseCase.ts` (linha 7)
- **Backend:** `backend/src/modules/pacientes/application/commands/CreatePatientCommand.ts` (linha 5)
- **Kind:** interface / interface
- **Severidade:** ALTA
- **Sobreposicao:** 100% (6 de 19 campos comuns)
- **Sugestao:** Manter versao do backend — mais completa (6 vs 19 campos)
- **Diff:** campos apenas no backend: `addressCity, addressComplement, addressNeighborhood, addressNumber, addressState, addressStreet, addressZipcode, createdBy, gender, mobile, notes, rg, statusCode`

### CreateTransactionCommand
- **Frontend:** `apps/web/src/modules/financeiro/application/commands/CreateTransactionCommand.ts` (linha 7)
- **Backend:** `backend/src/modules/financeiro/application/commands/CreateTransactionCommand.ts` (linha 7)
- **Kind:** class / interface
- **Severidade:** BAIXA
- **Sobreposicao:** 0% (0 de 10 campos comuns)
- **Sugestao:** Manter versao do backend — mais completa (1 vs 10 campos)
- **Diff:** campos apenas no frontend: `constructor`; campos apenas no backend: `amount, appointmentId, category, clinicId, createdBy, description, dueDate, patientId, paymentMethod, type`

### CreateTransactionCommandHandler
- **Frontend:** `apps/web/src/modules/financeiro/application/commands/CreateTransactionCommand.ts` (linha 23)
- **Backend:** `backend/src/modules/financeiro/application/commands/CreateTransactionCommand.ts` (linha 20)
- **Kind:** class / class
- **Severidade:** MEDIA
- **Sobreposicao:** 69% (11 de 16 campos comuns)
- **Sugestao:** Manter versao do frontend — mais completa (16 vs 16 campos)
- **Diff:** campos apenas no frontend: `categoryId, createdBy, description, dueDate, notes`; campos apenas no backend: `appointmentId, eventBus, paidAt, patientId, transactionRepository`

### CreateTransactionUseCase
- **Frontend:** `apps/web/src/modules/financeiro/application/use-cases/CreateTransactionUseCase.ts` (linha 21)
- **Backend:** `backend/src/modules/financeiro/application/CreateTransactionUseCase.ts` (linha 7)
- **Kind:** class / class
- **Severidade:** BAIXA
- **Sobreposicao:** 18% (2 de 17 campos comuns)
- **Sugestao:** Manter versao do frontend — mais completa (17 vs 11 campos)
- **Diff:** campos apenas no frontend: `amount, categoryId, clinicId, createdAt, createdBy, description, dueDate, id, notes, paymentMethod, relatedEntityId, relatedEntityType, status, type, updatedAt`; campos apenas no backend: `action, clinic_id, created_at, new_data, old_data, record_id, repo, table_name, user_id`

### DashboardStats
- **Frontend:** `apps/web/src/hooks/useDashboard.ts` (linha 6)
- **Backend:** `backend/src/modules/analytics/application/GetDashboardOverviewUseCase.ts` (linha 3)
- **Kind:** interface / interface
- **Severidade:** ALTA
- **Sobreposicao:** 100% (6 de 6 campos comuns)
- **Sugestao:** Manter versao do frontend — mais completa (6 vs 6 campos)
- **Diff:** estruturas identicas

### DatabaseHealth
- **Frontend:** `apps/web/src/hooks/api/useDatabaseAdmin.ts` (linha 6)
- **Backend:** `backend/src/modules/database_admin/domain/entities/DatabaseHealth.ts` (linha 16)
- **Kind:** interface / class
- **Severidade:** MEDIA
- **Sobreposicao:** 44% (4 de 10 campos comuns)
- **Sugestao:** Manter versao do backend — mais completa (9 vs 10 campos)
- **Diff:** campos apenas no frontend: `averageQueryTime, idleConnections, lastAnalyze, lastVacuum, timestamp`; campos apenas no backend: `clinicId, constructor, id, isHealthy, needsMaintenance, toJSON`

### DomainEvent
- **Frontend:** `apps/web/src/core/domain/events/DomainEvent.ts` (linha 1)
- **Backend:** `backend/src/shared/events/DomainEvent.ts` (linha 1)
- **Kind:** class / class
- **Severidade:** ALTA
- **Sobreposicao:** 100% (1 de 9 campos comuns)
- **Sugestao:** Manter versao do backend — mais completa (1 vs 9 campos)
- **Diff:** campos apenas no backend: `aggregateId, aggregateType, eventId, eventType, metadata, occurredOn, payload, version`

### EventBus
- **Frontend:** `apps/web/src/core/domain/events/EventBus.ts` (linha 7)
- **Backend:** `backend/src/shared/events/EventBus.ts` (linha 4)
- **Kind:** class / class
- **Severidade:** MEDIA
- **Sobreposicao:** 50% (2 de 12 campos comuns)
- **Sugestao:** Manter versao do frontend — mais completa (12 vs 4 campos)
- **Diff:** campos apenas no frontend: `clearEventLog, constructor, eventLog, eventName, getEventLog, handler, logEvent, publishAll, subscribe, unsubscribe`; campos apenas no backend: `clearHandlers, register`

### EventHandler
- **Frontend:** `apps/web/src/infrastructure/events/EventBus.ts` (linha 4)
- **Backend:** `backend/src/shared/events/EventHandler.ts` (linha 2)
- **Kind:** type / interface
- **Severidade:** BAIXA
- **Sobreposicao:** 0% (0 de 13 campos comuns)
- **Sugestao:** Manter versao do frontend — mais completa (13 vs 1 campos)
- **Diff:** campos apenas no frontend: `addToHistory, clear, clearHistory, constructor, eventHistory, eventType, getHistory, handler, handlers, publish, publishMultiple, subscribe, unsubscribe`; campos apenas no backend: `handle`

### ExchangeConfig
- **Frontend:** `apps/web/src/hooks/api/useCryptoConfig.ts` (linha 4)
- **Backend:** `backend/src/modules/crypto_config/domain/entities/ExchangeConfig.ts` (linha 16)
- **Kind:** interface / class
- **Severidade:** BAIXA
- **Sobreposicao:** 17% (1 de 10 campos comuns)
- **Sugestao:** Manter versao do backend — mais completa (6 vs 10 campos)
- **Diff:** campos apenas no frontend: `api_key_encrypted, clinic_id, created_at, exchange_name, is_active`; campos apenas no backend: `activate, clinicId, constructor, deactivate, exchangeType, isActive, needsSync, toJSON, updateSync`

### ExportOptions
- **Frontend:** `apps/web/src/components/settings/data-migration/types.ts` (linha 1)
- **Backend:** `backend/src/modules/relatorios/application/ReportControllerService.ts` (linha 5)
- **Kind:** interface / interface
- **Severidade:** ALTA
- **Sobreposicao:** 100% (7 de 12 campos comuns)
- **Sugestao:** Manter versao do frontend — mais completa (12 vs 7 campos)
- **Diff:** campos apenas no frontend: `enableCompression, enableEncryption, encryptionPassword, isIncremental, lastBackupDate`

### GetCashFlowUseCase
- **Frontend:** `apps/web/src/modules/financeiro/application/use-cases/GetCashFlowUseCase.ts` (linha 17)
- **Backend:** `backend/src/modules/financeiro/application/GetCashFlowUseCase.ts` (linha 10)
- **Kind:** class / class
- **Severidade:** ALTA
- **Sobreposicao:** 75% (3 de 9 campos comuns)
- **Sugestao:** Manter versao do backend — mais completa (4 vs 9 campos)
- **Diff:** campos apenas no frontend: `period`; campos apenas no backend: `clinicId, endDate, repo, startDate, totalDespesas, totalReceitas`

### GraphData
- **Frontend:** `apps/web/src/modules/memory-hub/hooks/useMemoryHubGraph.ts` (linha 16)
- **Backend:** `backend/src/modules/memory_hub/domain/services/GraphService.ts` (linha 16)
- **Kind:** interface / interface
- **Severidade:** ALTA
- **Sobreposicao:** 100% (2 de 2 campos comuns)
- **Sugestao:** Manter versao do frontend — mais completa (2 vs 2 campos)
- **Diff:** estruturas identicas

### GraphEdge
- **Frontend:** `apps/web/src/modules/memory-hub/hooks/useMemoryHubGraph.ts` (linha 10)
- **Backend:** `backend/src/modules/memory_hub/domain/services/GraphService.ts` (linha 10)
- **Kind:** interface / interface
- **Severidade:** ALTA
- **Sobreposicao:** 100% (3 de 3 campos comuns)
- **Sugestao:** Manter versao do frontend — mais completa (3 vs 3 campos)
- **Diff:** estruturas identicas

### GraphNode
- **Frontend:** `apps/web/src/modules/memory-hub/hooks/useMemoryHubGraph.ts` (linha 3)
- **Backend:** `backend/src/modules/memory_hub/domain/services/GraphService.ts` (linha 3)
- **Kind:** interface / interface
- **Severidade:** ALTA
- **Sobreposicao:** 100% (4 de 4 campos comuns)
- **Sugestao:** Manter versao do frontend — mais completa (4 vs 4 campos)
- **Diff:** estruturas identicas

### HealthMetrics
- **Frontend:** `apps/web/src/modules/memory-hub/types/index.ts` (linha 17)
- **Backend:** `backend/src/modules/memory_hub/domain/services/HealthService.ts` (linha 4)
- **Kind:** interface / interface
- **Severidade:** ALTA
- **Sobreposicao:** 100% (4 de 8 campos comuns)
- **Sugestao:** Manter versao do backend — mais completa (4 vs 8 campos)
- **Diff:** campos apenas no backend: `compressedEmbeddings, compressionRatio, indexStatus, spaceSavedBytes`

### HealthResponse
- **Frontend:** `apps/web/src/modules/memory-hub/hooks/useMemoryHubHealth.ts` (linha 4)
- **Backend:** `backend/src/modules/agents/services/AgentProxyService.ts` (linha 79)
- **Kind:** interface / interface
- **Severidade:** BAIXA
- **Sobreposicao:** 0% (0 de 4 campos comuns)
- **Sugestao:** Manter versao do frontend — mais completa (4 vs 3 campos)
- **Diff:** campos apenas no frontend: `coveragePercent, driftCount, lastScan, totalDocuments`; campos apenas no backend: `services, status, version`

### IAppointmentRepository
- **Frontend:** `apps/web/src/modules/agenda/domain/repositories/IAppointmentRepository.ts` (linha 2)
- **Backend:** `backend/src/modules/agenda/domain/repositories/IAppointmentRepository.ts` (linha 2)
- **Kind:** interface / interface
- **Severidade:** MEDIA
- **Sobreposicao:** 60% (3 de 16 campos comuns)
- **Sugestao:** Manter versao do frontend — mais completa (16 vs 5 campos)
- **Diff:** campos apenas no frontend: `clinicId, dentistId, endDate, endDatetime, excludeId, findByClinicId, findByDateRange, findByDentist, findByDentistAndDateRange, findByPatient, findConflicts, startDate, startDatetime`; campos apenas no backend: `findAll, hasTimeConflict`

### ICommand
- **Frontend:** `apps/web/src/core/cqrs/Command.ts` (linha 1)
- **Backend:** `backend/src/shared/cqrs/CommandBus.ts` (linha 1)
- **Kind:** interface / interface
- **Severidade:** BAIXA
- **Sobreposicao:** 0% (0 de 2 campos comuns)
- **Sugestao:** Manter versao do frontend — mais completa (2 vs 0 campos)
- **Diff:** campos apenas no frontend: `commandId, timestamp`

### ICommandHandler
- **Frontend:** `apps/web/src/core/cqrs/Command.ts` (linha 6)
- **Backend:** `backend/src/shared/cqrs/CommandBus.ts` (linha 2)
- **Kind:** interface / interface
- **Severidade:** ALTA
- **Sobreposicao:** 100% (1 de 1 campos comuns)
- **Sugestao:** Manter versao do frontend — mais completa (1 vs 1 campos)
- **Diff:** estruturas identicas

### IOrcamentoRepository
- **Frontend:** `apps/web/src/domain/repositories/IOrcamentoRepository.ts` (linha 2)
- **Backend:** `backend/src/modules/orcamentos/domain/repositories/IOrcamentoRepository.ts` (linha 3)
- **Kind:** interface / interface
- **Severidade:** BAIXA
- **Sobreposicao:** 0% (0 de 12 campos comuns)
- **Sugestao:** Manter versao do frontend — mais completa (12 vs 7 campos)
- **Diff:** campos apenas no frontend: `clinicId, findByClinicId, findById, findByNumero, findByPatientId, findByStatus, findExpirados, findPendentes, numeroOrcamento, save, status, update`; campos apenas no backend: `addItem, createOrcamento, deleteOrcamento, getOrcamentoById, listItems, listOrcamentos, updateOrcamento`

### IPatientRepository
- **Frontend:** `apps/web/src/modules/pacientes/domain/repositories/IPatientRepository.ts` (linha 2)
- **Backend:** `backend/src/modules/pacientes/domain/repositories/IPatientRepository.ts` (linha 29)
- **Kind:** interface / interface
- **Severidade:** ALTA
- **Sobreposicao:** 100% (4 de 31 campos comuns)
- **Sugestao:** Manter versao do backend — mais completa (4 vs 31 campos)
- **Diff:** campos apenas no backend: `changedBy, countByStatus, createPatientSession, deletePatientHard, deletePatientSessionsByPatient, deletePatientSessionsBySessionId, exists, filters, findAppointmentsByPatient, findBudgetsByPatient, findByCPF, findByEmail, findMany, findPatientAccount, findPatientAccountByEmail, findPatientById, findStatusHistoryByPatient, findTratamentosByPatient, fromStatus, getStats, getStatusHistory, metadata, pagination, patientId, reason, saveStatusHistory, toStatus`

### IProdutoRepository
- **Frontend:** `apps/web/src/domain/repositories/IProdutoRepository.ts` (linha 2)
- **Backend:** `backend/src/modules/inventario/domain/repositories/IProdutoRepository.ts` (linha 11)
- **Kind:** interface / interface
- **Severidade:** MEDIA
- **Sobreposicao:** 33% (4 de 21 campos comuns)
- **Sugestao:** Manter versao do backend — mais completa (12 vs 21 campos)
- **Diff:** campos apenas no frontend: `categoria, clinicId, codigoBarras, findActiveByClinicId, findByCategoria, findByClinicId, findByCodigoBarras, findEstoqueZerado`; campos apenas no backend: `count, dias_entrega_estimados, findAll, findByClinic, findByCodigo, findProductsForAlerts, findProductsForAutoOrders, fornecedor_id, id, nome, ponto_pedido, produto_id, produto_nome, quantidade_atual, quantidade_minima, quantidade_reposicao, valor_unitario`

### IQuery
- **Frontend:** `apps/web/src/core/cqrs/Query.ts` (linha 1)
- **Backend:** `backend/src/shared/cqrs/QueryBus.ts` (linha 1)
- **Kind:** interface / interface
- **Severidade:** BAIXA
- **Sobreposicao:** 0% (0 de 2 campos comuns)
- **Sugestao:** Manter versao do frontend — mais completa (2 vs 0 campos)
- **Diff:** campos apenas no frontend: `queryId, timestamp`

### IQueryHandler
- **Frontend:** `apps/web/src/core/cqrs/Query.ts` (linha 6)
- **Backend:** `backend/src/shared/cqrs/QueryBus.ts` (linha 2)
- **Kind:** interface / interface
- **Severidade:** ALTA
- **Sobreposicao:** 100% (1 de 1 campos comuns)
- **Sugestao:** Manter versao do frontend — mais completa (1 vs 1 campos)
- **Diff:** estruturas identicas

### ITransactionRepository
- **Frontend:** `apps/web/src/modules/financeiro/domain/repositories/ITransactionRepository.ts` (linha 12)
- **Backend:** `backend/src/modules/financeiro/domain/repositories/ITransactionRepository.ts` (linha 2)
- **Kind:** interface / interface
- **Severidade:** ALTA
- **Sobreposicao:** 100% (4 de 11 campos comuns)
- **Sugestao:** Manter versao do frontend — mais completa (11 vs 4 campos)
- **Diff:** campos apenas no frontend: `clinicId, filters, getOverdueTransactions, getPendingTransactions, getTotalByPeriod, period, type`

### IUserRepository
- **Frontend:** `apps/web/src/domain/repositories/IUserRepository.ts` (linha 2)
- **Backend:** `backend/src/modules/auth/domain/repositories/IUserRepository.ts` (linha 3)
- **Kind:** interface / interface
- **Severidade:** BAIXA
- **Sobreposicao:** 0% (0 de 8 campos comuns)
- **Sugestao:** Manter versao do backend — mais completa (7 vs 8 campos)
- **Diff:** campos apenas no frontend: `findActiveByClinicId, findAdminsByClinicId, findByClinicId, findByEmail, findById, save, update`; campos apenas no backend: `createUser, findClinicById, findModulesByIds, findPatientByCpf, findProfileByUserId, findUserByEmail, findUserById, findUserPermissions`

### MarketingMetrics
- **Frontend:** `apps/web/src/hooks/useMarketingROI.ts` (linha 19)
- **Backend:** `backend/src/infrastructure/metrics/MarketingMetrics.ts` (linha 3)
- **Kind:** interface / class
- **Severidade:** BAIXA
- **Sobreposicao:** 0% (0 de 14 campos comuns)
- **Sugestao:** Manter versao do backend — mais completa (8 vs 14 campos)
- **Diff:** campos apenas no frontend: `cac, campaignROI, conversionRate, convertedPatients, roi, sourcePerformance, totalBudget, totalPatients`; campos apenas no backend: `campaignsCreatedTotal, constructor, enviosCreatedTotal, help, incCampaignsCreated, incEnviosCreated, incRecallsProcessed, incTriggersFired, labelNames, name, recallsProcessedTotal, registers, registry, triggersFiredTotal`

### MasterHealthResult
- **Frontend:** `apps/web/src/modules/settings/hooks/useDatabaseCategories.ts` (linha 19)
- **Backend:** `backend/src/modules/database_admin/infrastructure/MasterDatabaseManager.ts` (linha 34)
- **Kind:** interface / interface
- **Severidade:** ALTA
- **Sobreposicao:** 100% (4 de 4 campos comuns)
- **Sugestao:** Manter versao do frontend — mais completa (4 vs 4 campos)
- **Diff:** estruturas identicas

### MasterStatsResult
- **Frontend:** `apps/web/src/modules/settings/hooks/useDatabaseCategories.ts` (linha 35)
- **Backend:** `backend/src/modules/database_admin/infrastructure/MasterDatabaseManager.ts` (linha 41)
- **Kind:** interface / interface
- **Severidade:** ALTA
- **Sobreposicao:** 100% (7 de 7 campos comuns)
- **Sugestao:** Manter versao do frontend — mais completa (7 vs 7 campos)
- **Diff:** estruturas identicas

### NFe
- **Frontend:** `apps/web/src/hooks/api/useFaturamento.ts` (linha 4)
- **Backend:** `backend/src/modules/faturamento/domain/entities/NFe.ts` (linha 11)
- **Kind:** interface / class
- **Severidade:** MEDIA
- **Sobreposicao:** 33% (3 de 19 campos comuns)
- **Sugestao:** Manter versao do backend — mais completa (9 vs 19 campos)
- **Diff:** campos apenas no frontend: `chave_acesso, clinic_id, created_at, id, valor_total, xml_path`; campos apenas no backend: `autorizar, cancelar, chaveAcesso, clienteCpfCnpj, clienteId, clienteNome, constructor, dataAutorizacao, dataEmissao, items, observacoes, protocoloAutorizacao, updatedAt, valorIcms, valorIpi, valorTotal`

### Patient
- **Frontend:** `apps/web/src/components/global-search/types.ts` (linha 5)
- **Backend:** `backend/src/modules/pacientes/domain/entities/Patient.ts` (linha 53)
- **Kind:** interface / class
- **Severidade:** ALTA
- **Sobreposicao:** 100% (1 de 86 campos comuns)
- **Sugestao:** Manter versao do backend — mais completa (1 vs 86 campos)
- **Diff:** campos apenas no backend: `addDomainEvent, addressCity, addressComplement, addressNeighborhood, addressNumber, addressState, addressStreet, addressZipcode, address_city, address_complement, address_neighborhood, address_number, address_state, address_street, address_zipcode, aggregateId, aggregateType, alterarStatus, atualizarDadosComerciais, atualizarDadosPessoais, atualizarFoto, birthDate, birth_date, campanhaId, changeStatus, changedBy, clearDomainEvents, clinicId, clinic_id, constructor, cpf, createdAt, createdBy, created_at, created_by, dados, dadosComerciais, domainEvents, email, eventId, eventType, fromStatus, fullName, full_name, gender, getDomainEvents, inativar, isActive, isValidCPF, isValidEmail, isValidStatusTransition, is_active, metadata, mobile, notes, novoStatus, occurredOn, origemId, parseInt, patientId, patientName, payload, phone, phone_primary, phone_secondary, photoUrl, photo_url, promotorId, props, reason, rg, status, statusCode, timestamp, to, toObject, toPersistence, toStatus, updatedAt, updatedBy, updated_at, updated_by, userId, validate, version`

### PatientProps
- **Frontend:** `apps/web/src/domain/entities/Patient.ts` (linha 6)
- **Backend:** `backend/src/modules/pacientes/domain/entities/Patient.ts` (linha 7)
- **Kind:** interface / interface
- **Severidade:** MEDIA
- **Sobreposicao:** 67% (10 de 29 campos comuns)
- **Sugestao:** Manter versao do backend — mais completa (15 vs 29 campos)
- **Diff:** campos apenas no frontend: `riskLevel, riskScoreAnesthetic, riskScoreMedical, riskScoreOverall, riskScoreSurgical`; campos apenas no backend: `addressCity, addressComplement, addressNeighborhood, addressNumber, addressState, addressStreet, addressZipcode, createdBy, dadosComerciais, gender, mobile, notes, paymentStatus, photoUrl, rg, status, totalDebt, totalPaid, updatedBy`

### PatientStatus
- **Frontend:** `apps/web/src/types/common.ts` (linha 175)
- **Backend:** `backend/src/modules/pacientes/domain/value-objects/PatientStatus.ts` (linha 21)
- **Kind:** type / class
- **Severidade:** BAIXA
- **Sobreposicao:** 0% (0 de 25 campos comuns)
- **Sugestao:** Manter versao do backend — mais completa (9 vs 25 campos)
- **Diff:** campos apenas no frontend: `address, allergies, birth_date, cpf, email, full_name, medical_history, phone, status`; campos apenas no backend: `ABANDONO, AFASTAMENTO_TEMPORARIO, A_PROTESTAR, CANCELADO, CONCLUIDO, CONTENCAO, ERUPCAO, INATIVO, MIGRADO, PROSPECT, PROTESTO, RESPONSAVEL, TRANSFERENCIA, TRATAMENTO, code, color, constructor, description, equals, isConcluido, isEmTratamento, isInativo, isProspect, name, validate`

### ProblemaDetectado
- **Frontend:** `apps/web/src/domain/entities/RadiografiAnalise.ts` (linha 19)
- **Backend:** `backend/src/modules/ia_radiografia/domain/entities/analise.ts` (linha 20)
- **Kind:** interface / interface
- **Severidade:** MEDIA
- **Sobreposicao:** 60% (3 de 8 campos comuns)
- **Sugestao:** Manter versao do backend — mais completa (5 vs 8 campos)
- **Diff:** campos apenas no frontend: `confidence, tipo`; campos apenas no backend: `confianca, dente_codigo, sugestao_tratamento, tipo_problema, urgente`

### Produto
- **Frontend:** `apps/web/src/domain/entities/Produto.ts` (linha 33)
- **Backend:** `backend/src/modules/inventario/domain/entities/Produto.ts` (linha 1)
- **Kind:** class / class
- **Severidade:** ALTA
- **Sobreposicao:** 71% (15 de 27 campos comuns)
- **Sugestao:** Manter versao do frontend — mais completa (27 vs 21 campos)
- **Diff:** campos apenas no frontend: `ativo, atualizar, calcularValorTotal, codigoBarras, fornecedor, inativar, isEstoqueBaixo, isEstoqueZerado, localizacao, observacoes, reativar, valorUnitario`; campos apenas no backend: `atualizarPrecos, codigo, estaEmEstoqueBaixo, precoCusto, precoVenda, status`

### Prontuario
- **Frontend:** `apps/web/src/domain/entities/Prontuario.ts` (linha 12)
- **Backend:** `backend/src/modules/pep/domain/entities/Prontuario.ts` (linha 22)
- **Kind:** class / class
- **Severidade:** MEDIA
- **Sobreposicao:** 62% (8 de 15 campos comuns)
- **Sugestao:** Manter versao do frontend — mais completa (15 vs 13 campos)
- **Diff:** campos apenas no frontend: `arquivar, dataAbertura, inativar, isAtivo, numero, reativar, status`; campos apenas no backend: `adicionarAnexo, assinadoDigitalmente, assinarDigitalmente, atualizarDiagnostico, atualizarPlanoDeTratamento`

### ProntuarioProps
- **Frontend:** `apps/web/src/domain/entities/Prontuario.ts` (linha 1)
- **Backend:** `backend/src/modules/pep/domain/entities/Prontuario.ts` (linha 1)
- **Kind:** interface / interface
- **Severidade:** MEDIA
- **Sobreposicao:** 63% (5 de 17 campos comuns)
- **Sugestao:** Manter versao do backend — mais completa (8 vs 17 campos)
- **Diff:** campos apenas no frontend: `dataAbertura, numero, status`; campos apenas no backend: `anamnese, anexos, assinadoDigitalmente, assinadoEm, assinaturaHash, dataConsulta, dentistaId, diagnostico, exameFisico, motivoConsulta, observacoes, planoDeTratamento`

### SearchFilters
- **Frontend:** `apps/web/src/modules/memory-hub/types/index.ts` (linha 10)
- **Backend:** `backend/src/modules/memory_hub/domain/services/SearchService.ts` (linha 15)
- **Kind:** interface / interface
- **Severidade:** ALTA
- **Sobreposicao:** 75% (3 de 6 campos comuns)
- **Sugestao:** Manter versao do backend — mais completa (4 vs 6 campos)
- **Diff:** campos apenas no frontend: `dateRange`; campos apenas no backend: `dateFrom, dateTo, excludeArchived`

### SearchResult
- **Frontend:** `apps/web/src/modules/memory-hub/types/index.ts` (linha 1)
- **Backend:** `backend/src/modules/memory_hub/domain/services/SearchService.ts` (linha 5)
- **Kind:** interface / interface
- **Severidade:** ALTA
- **Sobreposicao:** 100% (7 de 7 campos comuns)
- **Sugestao:** Manter versao do frontend — mais completa (7 vs 7 campos)
- **Diff:** estruturas identicas

### SessionStatus
- **Frontend:** `apps/web/src/domain/entities/TeleOdontoSession.ts` (linha 1)
- **Backend:** `backend/src/modules/terminal/domain/entities/TerminalSession.ts` (linha 1)
- **Kind:** type / type
- **Severidade:** MEDIA
- **Sobreposicao:** 40% (4 de 32 campos comuns)
- **Sugestao:** Manter versao do frontend — mais completa (32 vs 10 campos)
- **Diff:** campos apenas no frontend: `appointmentId, consentimentoAssinadoEm, consentimentoGravacao, createdAt, createdBy, dentistId, dentistJoinedAt, diagnosticoPrelimininar, dosagem, duracao, duracaoMinutos, endedAt, medicamento, notasPosConsulta, notasPreConsulta, patientId, patientJoinedAt, platform, prescricoes, problemasTecnicos, qualidadeAudio, qualidadeVideo, recordingUrl, roomId, roomUrl, scheduledEnd, scheduledStart, updatedAt`; campos apenas no backend: `commandsExecuted, ipAddress, lastActivityAt, terminatedAt, userAgent, userId`

### SlowQuery
- **Frontend:** `apps/web/src/hooks/api/useDatabaseAdmin.ts` (linha 18)
- **Backend:** `backend/src/modules/database_admin/application/DatabaseAdminControllerService.ts` (linha 13)
- **Kind:** interface / interface
- **Severidade:** ALTA
- **Sobreposicao:** 100% (5 de 5 campos comuns)
- **Sugestao:** Manter versao do frontend — mais completa (5 vs 5 campos)
- **Diff:** estruturas identicas

### TerminalSession
- **Frontend:** `apps/web/src/hooks/api/useTerminal.ts` (linha 4)
- **Backend:** `backend/src/modules/terminal/domain/entities/TerminalSession.ts` (linha 17)
- **Kind:** interface / class
- **Severidade:** MEDIA
- **Sobreposicao:** 33% (2 de 12 campos comuns)
- **Sugestao:** Manter versao do backend — mais completa (6 vs 12 campos)
- **Diff:** campos apenas no frontend: `clinic_id, created_at, last_activity_at, user_id`; campos apenas no backend: `checkAndUpdateIdleStatus, commandsExecuted, constructor, getDurationMs, incrementCommandCount, isIdle, terminate, toJSON, updateActivity, userId`

### Transaction
- **Frontend:** `apps/web/src/modules/financeiro/hooks/useTransactionsAPI.ts` (linha 8)
- **Backend:** `backend/src/modules/financeiro/domain/entities/Transaction.ts` (linha 1)
- **Kind:** interface / class
- **Severidade:** ALTA
- **Sobreposicao:** 73% (8 de 14 campos comuns)
- **Sugestao:** Manter versao do backend — mais completa (11 vs 14 campos)
- **Diff:** campos apenas no frontend: `createdAt, id, paymentDate`; campos apenas no backend: `appointmentId, cancel, constructor, markAsPaid, paidAt, patientId`

### TransactionCreatedEvent
- **Frontend:** `apps/web/src/modules/financeiro/domain/events/TransactionCreatedEvent.ts` (linha 11)
- **Backend:** `backend/src/modules/financeiro/domain/events/TransactionCreatedEvent.ts` (linha 3)
- **Kind:** class / class
- **Severidade:** ALTA
- **Sobreposicao:** 100% (1 de 3 campos comuns)
- **Sugestao:** Manter versao do frontend — mais completa (3 vs 1 campos)
- **Diff:** campos apenas no frontend: `aggregateId, eventName`

### TransactionFilters
- **Frontend:** `apps/web/src/modules/financeiro/domain/repositories/ITransactionRepository.ts` (linha 3)
- **Backend:** `backend/src/modules/financeiro/domain/repositories/IFinanceiroRepository.ts` (linha 17)
- **Kind:** interface / interface
- **Severidade:** MEDIA
- **Sobreposicao:** 33% (2 de 7 campos comuns)
- **Sugestao:** Manter versao do backend — mais completa (6 vs 7 campos)
- **Diff:** campos apenas no frontend: `categoryId, period, relatedEntityId, relatedEntityType`; campos apenas no backend: `category, clinicId, endDate, paymentMethod, startDate`

### UpdateOrcamentoInput
- **Frontend:** `apps/web/src/application/use-cases/orcamentos/UpdateOrcamentoUseCase.ts` (linha 3)
- **Backend:** `backend/src/modules/orcamentos/application/services/OrcamentoService.ts` (linha 21)
- **Kind:** interface / interface
- **Severidade:** BAIXA
- **Sobreposicao:** 0% (0 de 13 campos comuns)
- **Sugestao:** Manter versao do backend — mais completa (5 vs 13 campos)
- **Diff:** campos apenas no frontend: `descontoPercentual, descontoValor, orcamentoId, tipoPagamento, valorSubtotal`; campos apenas no backend: `data_validade, desconto_percentual, desconto_valor, descricao, numero_orcamento, observacoes, patient_id, status, tipo_plano, titulo, validade_dias, valor_final, valor_total`

### UpdatePatientDTO
- **Frontend:** `apps/web/src/application/use-cases/patient/UpdatePatientUseCase.ts` (linha 6)
- **Backend:** `backend/src/modules/pacientes/application/commands/UpdatePatientCommand.ts` (linha 4)
- **Kind:** interface / interface
- **Severidade:** MEDIA
- **Sobreposicao:** 33% (3 de 20 campos comuns)
- **Sugestao:** Manter versao do backend — mais completa (9 vs 20 campos)
- **Diff:** campos apenas no frontend: `patientId, requestingUserClinicId, riskScoreAnesthetic, riskScoreMedical, riskScoreOverall, riskScoreSurgical`; campos apenas no backend: `addressCity, addressComplement, addressNeighborhood, addressNumber, addressState, addressStreet, addressZipcode, birthDate, clinicId, cpf, gender, id, mobile, notes, photoUrl, rg, updatedBy`

### User
- **Frontend:** `apps/web/src/components/settings/ModulePermissionsManager.tsx` (linha 11)
- **Backend:** `backend/src/infrastructure/auth/IAuthService.ts` (linha 1)
- **Kind:** interface / interface
- **Severidade:** ALTA
- **Sobreposicao:** 75% (3 de 5 campos comuns)
- **Sugestao:** Manter versao do backend — mais completa (4 vs 5 campos)
- **Diff:** campos apenas no frontend: `full_name`; campos apenas no backend: `clinicId, metadata`

### ValidationError
- **Frontend:** `apps/web/src/domain/errors/index.ts` (linha 9)
- **Backend:** `backend/src/middleware/errorHandler.ts` (linha 26)
- **Kind:** class / interface
- **Severidade:** BAIXA
- **Sobreposicao:** 0% (0 de 4 campos comuns)
- **Sugestao:** Manter versao do backend — mais completa (1 vs 4 campos)
- **Diff:** campos apenas no frontend: `constructor`; campos apenas no backend: `code, field, message, value`

### Venda
- **Frontend:** `apps/web/src/hooks/api/usePDV.ts` (linha 4)
- **Backend:** `backend/src/modules/pdv/domain/entities/Venda.ts` (linha 8)
- **Kind:** interface / class
- **Severidade:** BAIXA
- **Sobreposicao:** 14% (1 de 16 campos comuns)
- **Sugestao:** Manter versao do backend — mais completa (7 vs 16 campos)
- **Diff:** campos apenas no frontend: `clinic_id, created_at, created_by, id, metodo_pagamento, valor_total`; campos apenas no backend: `adicionarItem, aplicarDesconto, cancelar, clienteId, concluir, constructor, desconto, formaPagamento, items, observacoes, recalcularTotal, removerItem, total, totalFinal, updatedAt`

