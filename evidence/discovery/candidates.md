# Capability Candidates

### C-01: Clinical                           confidence: HIGH

Sources:
  - S2: S2-clinical — 23 tables
  - S1: pacientes, pep, agenda, procedimentos, teleodonto (backend)
  - S1: pacientes, pep, agenda, procedimentos, teleodonto (frontend)
  - S3: pacientes, pep, agenda, procedimentos, teleodonto — 46 entry points

Modules: pacientes, pep, agenda, procedimentos, teleodonto
Ambiguity flags: none

### C-02: Financial                           confidence: HIGH

Sources:
  - S2: S2-financial — 23 tables
  - S1: financeiro, pdv, orcamentos, contratos, split_pagamento, inadimplencia, faturamento (backend)
  - S1: financeiro, pdv, orcamentos, contratos, inadimplencia (frontend)
  - S3: financeiro, pdv, orcamentos, contratos, split_pagamento, inadimplencia, faturamento — 58 entry points

Modules: financeiro, pdv, orcamentos, contratos, split_pagamento, inadimplencia, faturamento
Ambiguity flags: none

### C-03: Inventory                           confidence: HIGH

Sources:
  - S2: S2-inventory — 9 tables
  - S1: inventario (backend)
  - S1: inventario, estoque (frontend)
  - S3: inventario — 10 entry points

Modules: inventario, estoque
Ambiguity flags: none

### C-04: Administrative                           confidence: HIGH

Sources:
  - S2: S2-administrative — 10 tables
  - S1: auth, funcionarios, configuracoes, admin_tools, database_admin (backend)
  - S1: auth, funcionarios (frontend)
  - S3: auth, funcionarios, configuracoes, admin_tools, database_admin — 43 entry points

Modules: auth, funcionarios, configuracoes, admin_tools, database_admin
Ambiguity flags: none

### C-05: Marketing                           confidence: HIGH

Sources:
  - S2: S2-marketing — 18 tables
  - S1: marketing, crm, fidelidade (backend)
  - S1: crm, fidelidade (frontend)
  - S3: marketing, crm, fidelidade — 25 entry points

Modules: marketing, crm, fidelidade
Ambiguity flags: none

### C-06: CryptoPayments                           confidence: HIGH

Sources:
  - S2: S2-cryptopayments — 5 tables
  - S1: crypto, crypto_config (backend)
  - S1: crypto (frontend)
  - S3: crypto_config — 10 entry points

Modules: crypto, crypto_config
Ambiguity flags: none

### C-07: Fiscal                           confidence: HIGH

Sources:
  - S2: S2-fiscal — 5 tables
  - S1: nfe, tiss (backend)
  - S1: tiss (frontend)
  - S3: nfe, tiss — 16 entry points

Modules: nfe, tiss
Ambiguity flags: none

### C-08: Files                           confidence: HIGH

Sources:
  - S2: S2-files — 2 tables
  - S1: files (backend)
  - S1: files (frontend)
  - S3: files — 10 entry points

Modules: files
Ambiguity flags: none

### C-09: Telemedicine                           confidence: HIGH

Sources:
  - S2: S2-telemedicine — 2 tables
  - S1: teleodonto (backend)
  - S1: teleodonto (frontend)
  - S3: teleodonto — 10 entry points

Modules: teleodonto
Ambiguity flags: none

### C-10: Other                           confidence: HIGH

Sources:
  - S2: S2-other — 91 tables
  - S1: analytics, bi, dashboard, relatorios, notifications, comm, backups, terminal, github_tools, memory_hub, agents, ai, lgpd, ia_radiografia (backend)
  - S1: bi, dashboard, lgpd (frontend)
  - S3: analytics, bi, dashboard, notifications, comm, backups, terminal, github_tools, memory_hub, agents, ai, lgpd, ia_radiografia — 70 entry points

Modules: analytics, bi, dashboard, relatorios, notifications, comm, backups, terminal, github_tools, memory_hub, agents, ai, lgpd, ia_radiografia
Ambiguity flags: none
