# AGENTS.md — agent-service/

> Contexto específico do serviço Python/FastAPI/Agno. Não repete o root AGENTS.md.
> **Atualizado:** 2026-05-24

---

## Stack

- Python 3.14 + FastAPI + Agno 2.5
- Porta: 8000
- Entrada: `src/main.py`
- Configuração: `src/config.py` (lê env vars e API keys)

---

## Estrutura

```
src/
├── main.py          # FastAPI app, rotas HTTP
├── config.py        # Settings (env vars, model configs)
├── agents/
│   ├── base_agent.py       # classe base
│   ├── backend_agent.py    # tarefas backend/Express
│   ├── frontend_agent.py   # tarefas frontend/React
│   └── database_agent.py   # tarefas Prisma/DB
├── models/          # Pydantic models (request/response)
├── tools/
│   ├── codebase_tools.py   # interações com codebase
│   └── prisma_tools.py     # schema/migration helpers
└── workflows/
    ├── crud_workflow.py
    ├── bugfix_workflow.py
    └── refactor_workflow.py
```

---

## Workflows

| Workflow | Propósito |
|----------|-----------|
| `crud_workflow` | Gera/edita módulos CRUD no backend |
| `bugfix_workflow` | Diagnóstica e propõe fix para bugs |
| `refactor_workflow` | Refatora código seguindo convenções do projeto |

Ao adicionar workflow: registrar em `main.py`, criar arquivo em `workflows/`, usar Agno `Workflow` como base.

---

## Comunicação com Backend

- HTTP para `http://localhost:3005/api`
- Autenticação: JWT (service token configurado em `config.py`)
- Nunca acessar banco diretamente — sempre via API REST do backend

---

## Convenções Python

- Type hints obrigatórios em todas as funções
- Pydantic para validação de entrada/saída de rotas FastAPI
- `async def` para handlers de rota e chamadas I/O
- Variáveis de ambiente via `config.py`, nunca `os.environ` direto nos módulos

---

## Executar

```bash
cd agent-service
python src/main.py          # Desenvolvimento
uvicorn src.main:app --reload --port 8000  # Alternativa com reload
```

---

## Variáveis de Ambiente Requeridas

Ver `agent-service/.env.example`. Críticas:
- `OPENAI_API_KEY` ou equivalente (modelo LLM)
- `BACKEND_URL` — URL do backend (`http://localhost:3005`)
- `SERVICE_JWT_TOKEN` — token para autenticar chamadas ao backend
