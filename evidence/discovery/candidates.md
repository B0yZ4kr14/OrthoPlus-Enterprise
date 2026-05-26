# Capability Candidates — Signal Merge (S5)

Generated from cross-reference of S1 (package structure), S2 (DB schema), S3 (backend entry points), S4 (frontend routes).
Total candidates: 25.

---

### C-01: Patient Management (Pacientes)                           confidence: HIGH

Sources:
  - S1: S1-be-pacientes — backend/src/modules/pacientes (29 files, ~2320 LOC)
  - S1: S1-fe-pacientes — apps/web/src/modules/pacientes (94 files, ~5640 LOC)
  - S2: S2-clinical — patients, patient_accounts, patient_sessions, patient_messages
  - S3: S3-pacientes — 4 HTTP entry points (GET/POST/PATCH/DELETE)
  - S4: S4-pacientes — /pacientes, /pacientes/novo, /pacientes/:id, /pacientes/busca

Ambiguity flags:
  - [ ] overlaps with C-04 (PEP) on patient data — may share schema cluster

Notes: Core domain capability. Largest frontend module by LOC.

---

### C-02: Appointment Scheduling (Agenda)                           confidence: HIGH

Sources:
  - S1: S1-be-agenda — backend/src/modules/agenda (11 files, ~880 LOC)
  - S1: S1-fe-agenda — apps/web/src/modules/agenda (58 files, ~3480 LOC)
  - S2: S2-clinical — appointments, blocked_times, dentist_schedules
  - S3: S3-agenda — 10 HTTP entry points + cron job (schedule-appointments)
  - S4: S4-agenda — /agenda

Ambiguity flags:
  - [ ] none

Notes: High-frequency user journey. Cron job for automated scheduling.

---

### C-03: Financial Management (Financeiro/Faturamento)             confidence: HIGH

Sources:
  - S1: S1-be-faturamento — backend/src/modules/faturamento (21 files, ~1680 LOC)
  - S1: S1-be-financeiro — backend/src/modules/financeiro (18 files, ~1440 LOC)
  - S1: S1-fe-financeiro — apps/web/src/modules/financeiro (111 files, ~6660 LOC)
  - S2: S2-financial — contas_pagar, contas_receber, financial_transactions, payment_methods
  - S3: S3-faturamento — 10 HTTP entry points + financeiro cron job
  - S3: S3-financeiro — 10 HTTP entry points
  - S4: S4-financeiro — /financeiro, /financeiro/receber, /financeiro/fiscal/notas, /financeiro/conciliacao

Ambiguity flags:
  - [ ] overlaps with C-14 (Collections) on contas_receber
  - [ ] faturamento vs financeiro backend modules may need MERGE in /discover

Notes: Largest business domain by combined LOC. Multiple sub-routes.

---

### C-04: Electronic Health Record (PEP/Prontuario)                 confidence: HIGH

Sources:
  - S1: S1-be-pep — backend/src/modules/pep (4 files, ~320 LOC)
  - S1: S1-fe-pep — apps/web/src/modules/pep (76 files, ~4560 LOC)
  - S2: S2-clinical — pep_anexos, pep_assinaturas, pep_evolucoes, pep_tratamentos, prontuarios
  - S3: S3-pep — 3 HTTP entry points (GET/POST/PATCH)
  - S4: S4-pep — /pep, /pep/:patientId, /assinatura-icp, /fluxo-digital

Ambiguity flags:
  - [ ] overlaps with C-01 (Patients) on patient_id foreign keys
  - [ ] overlaps with C-06 (Odontograma) on dental records

Notes: Frontend-heavy capability. Digital signature workflow (ICP).

---

### C-05: Odontogram (Odontograma)                                  confidence: MEDIUM

Sources:
  - S1: S1-fe-odontograma — apps/web/src/modules/odontograma (2 files, ~120 LOC)
  - S2: S2-clinical — odontogramas, pep_odontograma, pep_odontograma_data, pep_tooth_surfaces
  - S4: S4-odontograma — /odontograma

Ambiguity flags:
  - [ ] overlaps with C-04 (PEP) — may be a sub-capability

Notes: No dedicated backend module; reuses pep/pacientes data. Frontend-only candidate.

---

### C-06: Inventory & Stock (Estoque/Inventario)                    confidence: HIGH

Sources:
  - S1: S1-be-inventario — backend/src/modules/inventario (22 files, ~1760 LOC)
  - S1: S1-fe-estoque — apps/web/src/modules/estoque (120 files, ~7200 LOC)
  - S1: S1-fe-inventario — apps/web/src/modules/inventario (4 files, ~240 LOC)
  - S2: S2-inventory — produtos, movimentacoes_estoque, inventarios, inventario_itens
  - S3: S3-inventario — 3 HTTP entry points + 3 cron jobs (reconciliation, alerts, reports)
  - S4: S4-estoque — /estoque, /estoque/inventario-historico, /estoque/scanner
  - S4: S4-inventario — /inventario/dashboard

Ambiguity flags:
  - [ ] estoque vs inventario frontend modules — possible MERGE candidate

Notes: Largest frontend module by file count. Hardware scanner integration.

---

### C-07: Point of Sale (PDV)                                       confidence: HIGH

Sources:
  - S1: S1-be-pdv — backend/src/modules/pdv (17 files, ~1360 LOC)
  - S1: S1-fe-pdv — apps/web/src/modules/pdv (13 files, ~780 LOC)
  - S2: S2-inventory — pdv_produtos, pdv_vendas, caixa_movimentos
  - S3: S3-pdv — 3 HTTP entry points (GET/POST/PATCH)
  - S4: S4-pdv — /pdv, /pdv/dashboard, /pdv/metas

Ambiguity flags:
  - [ ] overlaps with C-06 (Inventory) on pdv_produtos table

Notes: Gamification features (metas/ranking) present.

---

### C-08: CRM & Marketing (CRM/Marketing/Fidelidade)                confidence: HIGH

Sources:
  - S1: S1-be-crm — backend/src/modules/crm (6 files, ~480 LOC)
  - S1: S1-be-marketing — backend/src/modules/marketing (5 files, ~400 LOC)
  - S1: S1-be-fidelidade — backend/src/modules/fidelidade (4 files, ~320 LOC)
  - S1: S1-fe-crm — apps/web/src/modules/crm (32 files, ~1920 LOC)
  - S1: S1-fe-marketing-auto — apps/web/src/modules/marketing-auto (41 files, ~2460 LOC)
  - S1: S1-fe-fidelidade — apps/web/src/modules/fidelidade (3 files, ~180 LOC)
  - S2: S2-marketing — crm_leads, crm_stages, campanhas_marketing, fidelidade_pontos
  - S3: S3-crm — 6 HTTP entry points
  - S3: S3-marketing — 2 HTTP entry points + 2 cron jobs
  - S3: S3-fidelidade — 9 HTTP entry points + gamification cron
  - S4: S4-crm — /crm
  - S4: S4-marketing-auto — /marketing-auto, /fidelidade, /recall

Ambiguity flags:
  - [ ] crm + marketing + fidelidade may be one capability or three — /discover to decide

Notes: Loyalty program (fidelidade) and automated campaigns (marketing-auto) closely coupled.

---

### C-09: Contracts (Contratos)                                     confidence: HIGH

Sources:
  - S1: S1-be-contratos — backend/src/modules/contratos (12 files, ~960 LOC)
  - S1: S1-fe-contratos — apps/web/src/modules/contratos (9 files, ~540 LOC)
  - S2: S2-financial — contratos, contrato_templates, contrato_anexos
  - S3: S3-contratos — 7 HTTP entry points (GET/POST/PATCH/PUT/DELETE)
  - S4: S4-contratos — /contratos

Ambiguity flags:
  - [ ] overlaps with C-04 (PEP) on digital signature flow

Notes: Contract templates with HTML content. Separate from general finance.

---

### C-10: Budgets & Estimates (Orcamentos)                          confidence: HIGH

Sources:
  - S1: S1-be-orcamentos — backend/src/modules/orcamentos (6 files, ~480 LOC)
  - S1: S1-fe-orcamentos — apps/web/src/modules/orcamentos (25 files, ~1500 LOC)
  - S2: S2-financial — orcamentos, orcamento_itens, orcamento_pagamento, orcamento_visualizacoes
  - S3: S3-orcamentos — 3 HTTP entry points
  - S4: S4-orcamentos — /orcamentos, /orcamentos/novo, /orcamentos/editar/:id

Ambiguity flags:
  - [ ] overlaps with C-03 (Financial) on payment flows

Notes: Full CRUD with wizard-style creation flow.

---

### C-11: Dental Procedures (Procedimentos)                         confidence: MEDIUM

Sources:
  - S1: S1-be-procedimentos — backend/src/modules/procedimentos (2 files, ~160 LOC)
  - S1: S1-fe-procedimentos — apps/web/src/modules/procedimentos (11 files, ~660 LOC)
  - S2: S2-clinical — procedimento_templates
  - S3: S3-procedimentos — 2 HTTP entry points
  - S4: S4-procedimentos — /procedimentos

Ambiguity flags:
  - [ ] overlaps with C-04 (PEP) on treatment plans

Notes: Small backend module; frontend richer. Procedure templates reusable across PEP.

---

### C-12: Dentist Management (Dentistas)                            confidence: MEDIUM

Sources:
  - S1: S1-fe-dentistas — apps/web/src/modules/dentistas (15 files, ~900 LOC)
  - S2: S2-clinical — dentist_schedules
  - S4: S4-dentistas — /dentistas

Ambiguity flags:
  - [ ] no dedicated backend module detected — data served via pacientes/agenda

Notes: Frontend-only candidate. May be sub-capability of C-01 or C-02.

---

### C-13: Staff Management (Funcionarios)                           confidence: HIGH

Sources:
  - S1: S1-be-funcionarios — backend/src/modules/funcionarios (3 files, ~240 LOC)
  - S1: S1-fe-funcionarios — apps/web/src/modules/funcionarios (16 files, ~960 LOC)
  - S2: S2-administrative — funcionarios
  - S3: S3-funcionarios — 5 HTTP entry points (GET/POST/PATCH/DELETE)
  - S4: S4-funcionarios — /funcionarios

Ambiguity flags:
  - [ ] overlaps with C-24 (Auth) on user_id linkage

Notes: Employee records with work schedules and permissions.

---

### C-14: Collections & Delinquency (Inadimplencia)                 confidence: HIGH

Sources:
  - S1: S1-be-inadimplencia — backend/src/modules/inadimplencia (2 files, ~160 LOC)
  - S1: S1-fe-inadimplencia — apps/web/src/modules/inadimplencia (8 files, ~480 LOC)
  - S1: S1-fe-cobranca — apps/web/src/modules/cobranca (7 files, ~420 LOC)
  - S2: S2-financial — inadimplentes, collection_actions, collection_automation_config
  - S3: S3-inadimplencia — 2 HTTP entry points
  - S4: S4-cobranca — /inadimplencia

Ambiguity flags:
  - [ ] cobranca vs inadimplencia frontend modules — possible MERGE

Notes: Automated collection actions. Closely tied to C-03 (Financial).

---

### C-15: Crypto Payments (Crypto)                                  confidence: HIGH

Sources:
  - S1: S1-be-crypto — backend/src/modules/crypto (1 file, ~80 LOC)
  - S1: S1-be-crypto_config — backend/src/modules/crypto_config (9 files, ~720 LOC)
  - S1: S1-fe-crypto — apps/web/src/modules/crypto (34 files, ~2040 LOC)
  - S2: S2-cryptopayments — crypto_wallets, crypto_exchange_rates, crypto_price_alerts, crypto_offline_wallets
  - S3: S3-crypto_config — 10 HTTP entry points + 3 crypto cron jobs
  - S4: S4-crypto — /crypto-payment

Ambiguity flags:
  - [ ] crypto vs crypto_config backend modules — /discover to decide MERGE/SPLIT

Notes: Distinct domain with real-time price sync, candlestick data, volatility alerts.

---

### C-16: Split Payments (Split Pagamento)                          confidence: HIGH

Sources:
  - S1: S1-be-split_pagamento — backend/src/modules/split_pagamento (3 files, ~240 LOC)
  - S1: S1-fe-split-pagamento — apps/web/src/modules/split-pagamento (11 files, ~660 LOC)
  - S2: S2-financial — split_payment_config, split_payment_details, split_payment_recipients, split_payment_rules, split_payment_transactions
  - S3: S3-split_pagamento — 3 HTTP entry points (/api/split-pagamento, /api/split)
  - S4: S4-split-pagamento — /split-pagamento

Ambiguity flags:
  - [ ] overlaps with C-03 (Financial) on transaction flows

Notes: Commission calculation and multi-recipient payouts.

---

### C-17: Fiscal & TISS (TISS/NFe)                                  confidence: HIGH

Sources:
  - S1: S1-be-nfe — backend/src/modules/nfe (6 files, ~480 LOC)
  - S1: S1-fe-tiss — apps/web/src/modules/tiss (12 files, ~720 LOC)
  - S2: S2-fiscal — fiscal_config, notas_fiscais, tiss_batches, tiss_guides, nfe_records
  - S3: S3-nfe — 2 HTTP entry points
  - S3: S3-tiss — 2 HTTP entry points
  - S4: S4-tiss — /faturamento-tiss

Ambiguity flags:
  - [ ] nfe + tiss may be separate capabilities — Brazilian fiscal complexity

Notes: Regulatory-heavy. Digital certificate handling (senha_certificado in schema).

---

### C-18: Telemedicine (Teleodonto)                                 confidence: HIGH

Sources:
  - S1: S1-be-teleodonto — backend/src/modules/teleodonto (9 files, ~720 LOC)
  - S1: S1-fe-teleodonto — apps/web/src/modules/teleodonto (15 files, ~900 LOC)
  - S2: S2-telemedicine — teleodonto_sessions, teleodonto_chat, teleconsultas, triagem_teleconsulta
  - S3: S3-teleodonto — 3 HTTP entry points
  - S4: S4-teleodonto — /teleodonto

Ambiguity flags:
  - [ ] overlaps with C-04 (PEP) on prescriptions (prescricoes_remotas)

Notes: Real-time chat and video sessions. Scheduling integration.

---

### C-19: Business Intelligence (BI/Analytics)                      confidence: HIGH

Sources:
  - S1: S1-be-analytics — backend/src/modules/analytics (6 files, ~480 LOC)
  - S1: S1-be-bi — backend/src/modules/bi (3 files, ~240 LOC)
  - S1: S1-fe-bi — apps/web/src/modules/bi (26 files, ~1560 LOC)
  - S1: S1-fe-dashboards — apps/web/src/modules/dashboards (2 files, ~120 LOC)
  - S2: S2-other — bi_dashboards, bi_metrics, bi_reports, bi_widgets
  - S3: S3-analytics — 5 HTTP entry points
  - S3: S3-bi — 10 HTTP entry points + bi-export cron
  - S4: S4-bi — /bi, /dashboards/comercial
  - S4: S4-dashboard — /dashboard

Ambiguity flags:
  - [ ] bi + analytics + dashboard may overlap — /discover to decide scope

Notes: Custom dashboards, widgets, scheduled exports. Prometheus metrics integration.

---

### C-20: LGPD & Compliance (LGPD)                                  confidence: HIGH

Sources:
  - S1: S1-be-lgpd — backend/src/modules/lgpd (3 files, ~240 LOC)
  - S1: S1-fe-lgpd — apps/web/src/modules/lgpd (11 files, ~660 LOC)
  - S2: S2-other — lgpd_consents, lgpd_data_consents, lgpd_data_exports, lgpd_data_requests
  - S3: S3-lgpd — 2 HTTP entry points
  - S4: S4-lgpd — /lgpd

Ambiguity flags:
  - [ ] overlaps with C-01 (Patients) on consent fields in patients table

Notes: Dedicated compliance module. Data export and consent tracking.

---

### C-21: File Management (Files)                                   confidence: HIGH

Sources:
  - S1: S1-be-files — backend/src/modules/files (7 files, ~560 LOC)
  - S1: S1-fe-files — apps/web/src/modules/files (5 files, ~300 LOC)
  - S2: S2-files — profiles, teleodonto_files; also arquivo, arquivo_ocr, arquivo_versao
  - S3: S3-files — 10 HTTP entry points (GET/POST/DELETE with upload/download)
  - S4: S4-files — /files, /files/upload

Ambiguity flags:
  - [ ] none

Notes: File upload with OCR support. Versioning tracked in schema.

---

### C-22: Administration & System (Admin/Database/Backup)           confidence: HIGH

Sources:
  - S1: S1-be-admin_tools — backend/src/modules/admin_tools (12 files, ~960 LOC)
  - S1: S1-be-database_admin — backend/src/modules/database_admin (9 files, ~720 LOC)
  - S1: S1-fe-admin — apps/web/src/modules/admin (16 files, ~960 LOC)
  - S2: S2-other — backup_history, scheduled_backups, system_health_metrics, audit_logs
  - S3: S3-admin_tools — 9 HTTP entry points
  - S3: S3-database_admin — 10 HTTP entry points + 3 cron jobs (maintenance, cleanup, backup scheduler)
  - S4: S4-admin — /admin/database, /admin/backups, /admin/crypto-config, /admin/github, /admin/terminal, /admin/wiki, /admin/adrs, /admin/monitoring, /admin/logs, /admin/api-docs, /admin/audit, /admin/audit-trail

Ambiguity flags:
  - [ ] admin_tools vs database_admin may be one capability

Notes: System administration with terminal access, ADR viewer, monitoring.

---

### C-23: AI Radiology (IA Radiografia)                             confidence: HIGH

Sources:
  - S1: S1-be-ia_radiografia — backend/src/modules/ia_radiografia (14 files, ~1120 LOC)
  - S1: S1-fe-ia-radiografia — apps/web/src/modules/ia-radiografia (40 files, ~2400 LOC)
  - S2: S2-other — analises_radiograficas, problemas_radiograficos, radiografia_ai_feedback, ia_modelo_config
  - S3: S3-ia_radiografia — 2 HTTP entry points + ia-radiografia-worker cron
  - S4: S4-ia-radiografia — /ia-radiografia

Ambiguity flags:
  - [ ] none

Notes: AI-assisted diagnosis from X-rays. Feedback loop for model improvement.

---

### C-24: Authentication & Access Control (Auth/Usuarios)           confidence: HIGH

Sources:
  - S1: S1-be-auth — backend/src/modules/auth (8 files, ~640 LOC)
  - S1: S1-be-usuarios — backend/src/modules/usuarios (4 files, ~320 LOC)
  - S1: S1-fe-auth — apps/web/src/modules/auth (2 files, ~120 LOC)
  - S2: S2-administrative — users, user_roles, user_clinic_access, permission_templates, permission_audit_logs
  - S3: S3-auth — 9 HTTP entry points (login/logout/refresh/verify)
  - S3: S3-usuarios — 3 HTTP entry points
  - S4: S4-auth — /auth
  - S4: S4-settings — /usuarios

Ambiguity flags:
  - [ ] auth + usuarios may be one capability

Notes: JWT-based auth with clinicGuard multi-tenancy. Role/permission system.

---

### C-25: Configuration & Settings (Configuracoes/Settings)         confidence: HIGH

Sources:
  - S1: S1-be-configuracoes — backend/src/modules/configuracoes (16 files, ~1280 LOC)
  - S1: S1-fe-settings — apps/web/src/modules/settings (37 files, ~2220 LOC)
  - S2: S2-other — module_catalog, module_configuration_templates, clinic_modules
  - S3: S3-configuracoes — 10 HTTP entry points
  - S4: S4-settings — /configuracoes, /configuracoes/modulos, /configuracoes/database, /usuarios

Ambiguity flags:
  - [ ] overlaps with C-22 (Admin) on database configuration

Notes: Module activation system, clinic-specific settings, user management UI.

---

## Summary

| Confidence | Count |
|------------|-------|
| HIGH       | 23    |
| MEDIUM     | 2     |
| LOW        | 0     |

- All 25 candidates have >=3 source references (S1-S4).
- 8 ambiguity flags raised for /discover resolution.
- No candidates with <2 sources retained.
