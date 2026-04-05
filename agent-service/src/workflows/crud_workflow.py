"""
Workflow para geração de CRUD completo
Orquestra Database → Backend → Frontend agents
"""
import asyncio
from typing import Dict, Any
from src.agents import database_agent, backend_agent, frontend_agent

async def generate_crud(
    entity_name: str,
    fields: list,
    relationships: list = None,
    clinica_relationship: bool = True
) -> Dict[str, Any]:
    """
    Gera um CRUD completo orquestrando os agents especializados.
    
    Args:
        entity_name: Nome da entidade (ex: "Procedimento")
        fields: Lista de campos [{"name": "nome", "type": "String", "required": true}]
        relationships: Lista de relacionamentos
        clinica_relationship: Se deve adicionar relacionamento com Clinica
    
    Returns:
        Dict com schema, backend e frontend gerados
    """
    
    print(f"🚀 Iniciando geração de CRUD para: {entity_name}")
    
    # Preparar descrição dos campos
    fields_desc = "\n".join([
        f"- {f['name']}: {f['type']}" + (" (obrigatório)" if f.get('required') else " (opcional)")
        for f in fields
    ])
    
    relationships_desc = ""
    if clinica_relationship:
        relationships_desc += "- Pertence a uma Clinica (clinicaId)"
    if relationships:
        for rel in relationships:
            relationships_desc += f"\n- {rel}"
    
    # ============================================================
    # PASSO 1: DATABASE AGENT
    # ============================================================
    print("📊 Step 1/3: Gerando schema do banco de dados...")
    
    schema_prompt = f"""
Crie o schema Prisma completo para a entidade "{entity_name}".

CAMPOS:
{fields_desc}

RELACIONAMENTOS:
{relationships_desc}

REQUISITOS:
- Use UUID para ID
- Adicione timestamps (createdAt, updatedAt)
- Adicione soft delete (deletedAt)
- Adicione auditoria (createdBy, updatedBy)
- Crie índices apropriados
- Use @@map e @@schema("public")

Retorne APENAS o código Prisma, sem explicações.
"""
    
    schema_response = await asyncio.to_thread(
        database_agent.run,
        schema_prompt
    )
    schema_code = schema_response.content
    print(f"   ✅ Schema gerado ({len(schema_code)} chars)")
    
    # ============================================================
    # PASSO 2: BACKEND AGENT
    # ============================================================
    print("⚙️  Step 2/3: Gerando backend...")
    
    backend_prompt = f"""
Crie o backend completo (Node.js/Express/TypeScript) para a entidade "{entity_name}".

SCHEMA PRISMA (referência):
```prisma
{schema_code}
```

CRIE:
1. Types com Zod (CreateDTO, UpdateDTO, Entity type)
2. Repository (acesso a dados)
3. Service (lógica de negócio)
4. Controller (HTTP handlers)
5. Routes (definição de rotas)

Requisitos:
- Validação completa com Zod
- Tratamento de erros adequado
- Tipos TypeScript em tudo
- Injeção de dependências
- CRUD completo (create, list, getById, update, delete)

Retorne APENAS o código, organizado por arquivo.
"""
    
    backend_response = await asyncio.to_thread(
        backend_agent.run,
        backend_prompt
    )
    backend_code = backend_response.content
    print(f"   ✅ Backend gerado ({len(backend_code)} chars)")
    
    # ============================================================
    # PASSO 3: FRONTEND AGENT
    # ============================================================
    print("🎨 Step 3/3: Gerando frontend...")
    
    frontend_prompt = f"""
Crie o frontend completo (React/TypeScript) para a entidade "{entity_name}".

BACKEND (referência):
```typescript
{backend_code[:2000]}...
```

CRIE:
1. Types TypeScript
2. Service/API client (React Query)
3. Componente de Listagem (com DataTable)
4. Componente de Formulário (com RHF + Zod)
5. Hook custom use{entity_name}s

Requisitos:
- Use shadcn/ui components
- Loading e error states
- Validação com Zod
- TypeScript strict
- Integração com backend

Retorne APENAS o código, organizado por arquivo.
"""
    
    frontend_response = await asyncio.to_thread(
        frontend_agent.run,
        frontend_prompt
    )
    frontend_code = frontend_response.content
    print(f"   ✅ Frontend gerado ({len(frontend_code)} chars)")
    
    # ============================================================
    # RESULTADO
    # ============================================================
    print("✨ CRUD gerado com sucesso!")
    
    return {
        "entity": entity_name,
        "schema": schema_code,
        "backend": backend_code,
        "frontend": frontend_code,
        "metrics": {
            "schema_length": len(schema_code),
            "backend_length": len(backend_code),
            "frontend_length": len(frontend_code),
            "total_length": len(schema_code) + len(backend_code) + len(frontend_code),
        }
    }
