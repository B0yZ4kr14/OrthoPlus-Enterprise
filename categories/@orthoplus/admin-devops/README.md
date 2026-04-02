# @orthoplus/admin-devops

Categoria de Administração & DevOps do OrthoPlus Enterprise.

## Módulos

### Database Config ✅

Configuração avançada de banco de dados com suporte a 4 engines.

**Funcionalidades:**
- Seleção de motor (SQLite, PostgreSQL, MariaDB, Firebird)
- Configuração de conexão com validação
- Teste de conexão (modo demo)
- Ferramentas de manutenção (VACUUM, ANALYZE, REINDEX)
- Migração entre engines
- Templates de configuração
- Documentação integrada

**Instalação:**
```bash
pnpm add @orthoplus/admin-devops-database-config
```

**Uso:**
```tsx
import { DatabaseConfigPage } from '@orthoplus/admin-devops-database-config';

function App() {
  return <DatabaseConfigPage />;
}
```

**Acesso:** `/admin/database-config`

[Ver documentação detalhada](./packages/database-config/README.md)

---

### Outros Módulos (Planejados)

| Módulo | Descrição | Status |
|--------|-----------|--------|
| Database Maintenance | Manutenção de banco de dados | 🔄 Planejado |
| Backups | Backup e restore | 🔄 Planejado |
| Crypto Config | Configuração de criptomoedas | 🔄 Planejado |
| GitHub Tools | Integração com GitHub | 🔄 Planejado |
| Terminal | Terminal web seguro | 🔄 Planejado |

---

## Instalação

```bash
pnpm install
```

---

## Desenvolvimento

```bash
# Type-check
pnpm run type-check

# Build
pnpm run build
```

---

## Licença

Copyright © 2025 TSI Telecom. Todos os direitos reservados.
