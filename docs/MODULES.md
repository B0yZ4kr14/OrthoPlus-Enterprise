# Modulos OrthoPlus Enterprise

> Atualizado: 2026-06-02

## Mapa Frontend ↔ Backend

```
Frontend          →  Backend              →  API Route
─────────────────────────────────────────────────────────
admin             →  admin_tools          →  /api/admin
agenda            →  agenda               →  /api/agenda
auth              →  auth                 →  /api/auth
bi                →  bi                   →  /api/bi
cobranca          →  inadimplencia        →  /api/inadimplencia
contratos         →  contratos            →  /api/contratos
crm               →  crm                  →  /api/crm
crypto            →  crypto_config        →  /api/crypto
dashboard         →  dashboard            →  /api/dashboard
estoque           →  inventario           →  /api/estoque
fidelidade        →  fidelidade           →  /api/fidelidade
files             →  files                →  /api/files
financeiro        →  faturamento          →  /api/faturamento
funcionarios      →  funcionarios         →  /api/funcionarios
ia-radiografia    →  ai                   →  /api/ai
inadimplencia     →  inadimplencia        →  /api/inadimplencia
inventario        →  inventario           →  /api/inventario
lgpd              →  lgpd                 →  /api/lgpd
marketing-auto    →  marketing            →  /api/marketing
orcamentos        →  orcamentos           →  /api/orcamentos
pacientes         →  pacientes            →  /api/pacientes
pdv               →  pdv                  →  /api/pdv
pep               →  pep                  →  /api/pep
settings          →  configuracoes        →  /api/configuracoes
split-pagamento   →  split_pagamento      →  /api/split-pagamento
teleodonto        →  teleodonto           →  /api/teleodonto
tiss              →  tiss                 →  /api/tiss

Backend-only:
  analytics       →  /api/analytics
  agents          →  /api/agents
  backups         →  /api/backups
  comm            →  /api/comm
  database_admin  →  /api/db
  github_tools    →  /api/github
  nfe             →  /api/nfe
  notifications   →  /api/notifications
  terminal        →  /api/terminal
  usuarios        →  /api/usuarios

Frontend-only (sem backend dedicado):
  landpage, portal-paciente, odontograma, dashboards

Infraestrutura (nao-roteados):
  application, core, domain, ui
```

## Convencoes

1. Frontend: kebab-case (split-pagamento, ia-radiografia)
2. Backend: snake_case (split_pagamento, crypto_config)
3. Nomes em portugues (exceto siglas: ai, bi, crm, lgpd, pep, pdv, tiss)
