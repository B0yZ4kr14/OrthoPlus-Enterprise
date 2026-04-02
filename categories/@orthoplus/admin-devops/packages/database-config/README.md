# @orthoplus/admin-devops-database-config

Módulo de configuração de banco de dados para OrthoPlus.

## Descrição

Este pacote fornece uma interface completa para configuração, gerenciamento e manutenção de bancos de dados no sistema OrthoPlus. Suporta múltiplos motores de banco de dados e oferece ferramentas avançadas de administração.

## Funcionalidades

O módulo é organizado em **6 abas** principais:

### 1. Motor
- Seleção do engine de banco de dados
- Comparação de características entre engines
- Recomendações baseadas no cenário de uso
- Informações detalhadas de cada motor

### 2. Configuração
- Configuração de conexão (host, porta, credenciais)
- Teste de conexão em tempo real
- Configurações específicas por engine (SSL, charset, etc.)
- Validação de parâmetros

### 3. Reparo
- Ferramentas de manutenção do banco
- Histórico de operações de manutenção
- Execução de comandos SQL de manutenção
- Verificação de integridade

### 4. Migração
- Migração de dados entre engines diferentes
- Exportação/Importação de configurações
- Assistente de migração guiado
- Validação de compatibilidade

### 5. Templates
- Templates pré-configurados por engine
- Aplicação rápida de configurações
- Templates para ambientes (dev, staging, production)

### 6. Documentação
- Links para documentação oficial de cada engine
- Comandos de instalação por sistema operacional
- Guias de configuração específicos

## Engines Suportados

| Engine | Versão | Porta Padrão | Melhor Para |
|--------|--------|--------------|-------------|
| **SQLite** | 3.x | - (arquivo) | Single-node, desenvolvimento, backups simples |
| **PostgreSQL** | 14+ | 5432 | Multi-terminal, alta disponibilidade, JSON nativo |
| **MariaDB** | 10.6+ | 3306 | Compatibilidade MySQL, performance otimizada |
| **Firebird** | 3.0+ | 3050 | Sistemas legados, migração de dados |

### Comparação Rápida

| Feature | SQLite | PostgreSQL | MariaDB | Firebird |
|---------|--------|------------|---------|----------|
| Zero config | ✅ | ❌ | ❌ | ❌ |
| Replicação | ❌ | ✅ | ✅ | ❌ |
| JSON nativo | ❌ | ✅ | ⚠️ | ❌ |
| Multi-usuário | ⚠️ | ✅ | ✅ | ✅ |
| Backup simples | ✅ | ❌ | ❌ | ❌ |

## Instalação

```bash
npm install @orthoplus/admin-devops-database-config
```

## Exemplo de Uso

### Componente de Página

```tsx
import { DatabaseConfigPage } from "@orthoplus/admin-devops-database-config";

function AdminDatabasePage() {
  return <DatabaseConfigPage />;
}
```

### Hook useDatabaseConfig

```tsx
import { useDatabaseConfig } from "@orthoplus/admin-devops-database-config";

function CustomDatabaseForm() {
  const {
    activeTab,
    setActiveTab,
    selectedEngine,
    setSelectedEngine,
    engines,
    config,
    setConfig,
    isLoading,
    testResult,
    history,
    testConnection,
    saveConfig,
    TABS,
  } = useDatabaseConfig();

  return (
    <div>
      <select 
        value={selectedEngine} 
        onChange={(e) => setSelectedEngine(e.target.value)}
      >
        {engines.map(engine => (
          <option key={engine.id} value={engine.id}>
            {engine.name}
          </option>
        ))}
      </select>
      
      <button onClick={testConnection} disabled={isLoading}>
        Testar Conexão
      </button>
      
      <button onClick={saveConfig}>
        Salvar Configuração
      </button>
    </div>
  );
}
```

### Uso dos Types

```tsx
import type { 
  EngineType, 
  DatabaseConfig, 
  ConnectionTestResult 
} from "@orthoplus/admin-devops-database-config";

const config: DatabaseConfig = {
  engine: "postgresql",
  host: "localhost",
  port: 5432,
  database: "orthoplus",
  username: "admin",
  password: "secret",
  ssl_mode: "require",
};
```

### Constantes

```tsx
import { 
  API_URL, 
  TABS, 
  DEFAULT_CONFIGS,
  DEFAULT_PORTS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES 
} from "@orthoplus/admin-devops-database-config";

console.log(TABS);
// [
//   { id: "motor", label: "Motor", icon: Database },
//   { id: "config", label: "Configuração", icon: Settings },
//   ...
// ]
```

## Estrutura de Exports

```
@orthoplus/admin-devops-database-config          → Tudo
@orthoplus/admin-devops-database-config/pages    → DatabaseConfigPage
@orthoplus/admin-devops-database-config/hooks    → useDatabaseConfig
@orthoplus/admin-devops-database-config/types    → Todos os types
@orthoplus/admin-devops-database-config/constants → Constantes
```

## Dependências

```json
{
  "@orthoplus/core-ui": "workspace:*",
  "@orthoplus/core-hooks": "workspace:*",
  "lucide-react": "^0.462.0",
  "react": "^18.3.1"
}
```

## Scripts

- `npm run lint` - Executa ESLint
- `npm run type-check` - Verifica tipos com TypeScript

## Requisitos

- React >= 18.0.0
- Pacotes `@orthoplus/core-ui` e `@orthoplus/core-hooks` instalados

## Instalação de Engines (Ubuntu/Debian)

```bash
# SQLite
sudo apt install sqlite3

# PostgreSQL
sudo apt install postgresql

# MariaDB
sudo apt install mariadb-server

# Firebird
sudo apt install firebird3.0-server
```

## Manutenção por Engine

### SQLite
- `VACUUM` - Compacta e recupera espaço
- `PRAGMA integrity_check` - Verifica integridade
- `REINDEX` - Reconstrói índices
- `ANALYZE` - Atualiza estatísticas

### PostgreSQL
- `VACUUM FULL` - Compacta e recupera espaço
- `ANALYZE` - Atualiza estatísticas
- `REINDEX DATABASE` - Reconstrói índices
- `pg_checksums --check` - Verifica checksums

### MariaDB
- `OPTIMIZE TABLE` - Otimiza tabelas
- `ANALYZE TABLE` - Atualiza estatísticas
- `CHECK TABLE` - Verifica integridade

### Firebird
- `gfix -v -full` - Reparo e manutenção
- `gbak -b` - Backup
- `gbak -c` - Restore
