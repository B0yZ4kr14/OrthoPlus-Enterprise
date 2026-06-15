"""
Configurações do Agno Agent Service para OrthoPlus Enterprise
"""
import os
from pathlib import Path
from dotenv import load_dotenv

# Carregar variáveis de ambiente
load_dotenv()

# Paths do projeto
ORTHoplus_ROOT = Path(os.getenv("ORTHoplus_ROOT", "/Projects/OrthoPlus-Enterprise"))
BACKEND_PATH = Path(os.getenv("ORTHoplus_BACKEND_PATH", ORTHoplus_ROOT / "backend"))
FRONTEND_PATH = Path(os.getenv("ORTHoplus_FRONTEND_PATH", ORTHoplus_ROOT / "apps" / "web"))

# Configurações do modelo - Gemini (Primary)
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY", "") or GEMINI_API_KEY  # Compatibilidade Agno v2.5+
AGENT_MODEL = os.getenv("AGENT_MODEL", "gemini-2.0-flash")
AGENT_TEMPERATURE = float(os.getenv("AGENT_TEMPERATURE", "0.7"))

# Configurações do modelo - OpenRouter (Fallback)
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY", "")
OPENROUTER_MODEL = os.getenv("OPENROUTER_MODEL", "google/gemini-2.0-flash-exp:free")

# Configurações do modelo - Kimi/Moonshot (Terciary Fallback)
KIMI_API_KEY = os.getenv("KIMI_API_KEY", "")
KIMI_MODEL = os.getenv("KIMI_MODEL", "moonshot-v1-8k")

# Configurações de roteamento
ENABLE_MODEL_ROUTING = os.getenv("ENABLE_MODEL_ROUTING", "true").lower() == "true"
ROUTING_STRATEGY = os.getenv("ROUTING_STRATEGY", "fallback")  # fallback | round-robin | priority

# API
API_PORT = int(os.getenv("API_PORT", "8000"))
API_HOST = os.getenv("API_HOST", "0.0.0.0")

# Validar configurações
def validate_config():
    """Valida se as configurações estão corretas"""
    errors = []
    
    if not GEMINI_API_KEY or GEMINI_API_KEY == "sua_chave_aqui":
        errors.append("GEMINI_API_KEY não configurada")
    
    if not BACKEND_PATH.exists():
        errors.append(f"BACKEND_PATH não encontrado: {BACKEND_PATH}")
    
    if errors:
        raise ValueError("Configurações inválidas:\n" + "\n".join(errors))
    
    return True

# Contexto base do OrthoPlus para os agents
ORTHoplus_CONTEXT = """
Você está trabalhando no OrthoPlus Enterprise, um SaaS odontológico.

STACK TÉCNICO:
- Backend: Node.js 20 + Express 4 + TypeScript 5
- Frontend: React 19 + Vite 6 + TypeScript 5 + Tailwind CSS 4
- UI Components: shadcn/ui + Radix UI
- Database: PostgreSQL 16 + Prisma ORM 6
- State: Zustand + React Query (TanStack Query)
- Forms: React Hook Form + Zod
- Auth: JWT

ESTRUTURA DO BACKEND:
backend/src/
├── modules/                    # Módulos do sistema
│   └── {nome}/
│       ├── {nome}.controller.ts    # Rotas HTTP
│       ├── {nome}.service.ts       # Lógica de negócio
│       ├── {nome}.repository.ts    # Acesso a dados
│       ├── {nome}.types.ts         # Types e DTOs
│       └── {nome}.routes.ts        # Definição de rotas
├── shared/                     # Código compartilhado
│   ├── types/
│   ├── utils/
│   └── middleware/
└── app.ts                      # App Express

ESTRUTURA DO FRONTEND:
apps/web/src/
├── components/                 # Componentes React
│   └── {Nome}/
│       ├── index.tsx
│       ├── {Nome}.tsx
│       ├── {Nome}.hooks.ts
│       └── {Nome}.types.ts
├── pages/                      # Páginas
├── hooks/                      # Hooks globais
├── services/                   # API clients
└── store/                      # Zustand stores

PADRÕES OBRIGATÓRIOS:
1. TypeScript strict mode - tipos em tudo
2. Async/await - nunca callbacks
3. Validação com Zod para todos inputs
4. Tratamento de erros try-catch
5. Nomenclatura: camelCase (variáveis), PascalCase (types/classes)
6. Soft delete quando aplicável (deletedAt)
7. Auditoria: createdAt, updatedAt, createdBy, updatedBy
"""
