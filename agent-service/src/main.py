"""
Agno Agent Service - API FastAPI para OrthoPlus Enterprise
"""
import asyncio
import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any

from src.workflows.crud_workflow import generate_crud
from src.workflows.bugfix_workflow import fix_bug
from src.workflows.refactor_workflow import refactor_code, code_review

# Criar aplicação FastAPI
app = FastAPI(
    title="OrthoPlus Agent Service",
    description="Serviço de agents para desenvolvimento automatizado do OrthoPlus Enterprise",
    version="0.2.0",
)

# CORS — restrict in production; never allow wildcard in prod
_env_origins = os.getenv("CORS_ALLOWED_ORIGINS", "")
if _env_origins:
    _cors_origins = [o.strip() for o in _env_origins.split(",") if o.strip()]
elif os.getenv("ENVIRONMENT") == "production":
    _cors_origins = []
else:
    _cors_origins = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:8080",
    ]

app.add_middleware(
    CORSMiddleware,
    allow_origins=_cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================================
# MODELS
# ============================================================

class FieldDefinition(BaseModel):
    name: str
    type: str
    required: bool = True
    description: Optional[str] = None

class CRUDRequest(BaseModel):
    entity_name: str
    fields: List[FieldDefinition]
    clinica_relationship: bool = True

class BugfixRequest(BaseModel):
    bug_report: str
    file_path: Optional[str] = None
    error_message: Optional[str] = None

class RefactorRequest(BaseModel):
    target: str
    from_pattern: str
    to_pattern: str
    scope: str = "module"

class CodeReviewRequest(BaseModel):
    file_path: str
    code: Optional[str] = None

class HealthResponse(BaseModel):
    status: str
    version: str
    services: Dict[str, Any]

# ============================================================
# ENDPOINTS
# ============================================================

@app.get("/", tags=["Root"])
async def root():
    """Informações básicas da API"""
    return {
        "name": "OrthoPlus Agent Service",
        "version": "0.2.0",
        "docs": "/docs",
        "endpoints": {
            "health": "/health",
            "crud": "/api/agents/crud",
            "bugfix": "/api/agents/bugfix",
            "refactor": "/api/agents/refactor",
            "review": "/api/agents/review",
        }
    }

@app.get("/health", response_model=HealthResponse, tags=["Health"])
async def health_check():
    """Health check da API com status dos providers"""
    from src.models.model_router import get_model_router
    
    router = get_model_router()
    router_status = router.get_status()
    
    return HealthResponse(
        status="healthy",
        version="0.2.0",
        services={
            "api": "ok",
            "crud_workflow": "available",
            "bugfix_workflow": "available",
            "refactor_workflow": "available",
            "model_router": {
                "status": "ok" if router_status["available_providers"] > 0 else "degraded",
                "providers": router_status["providers"],
            }
        }
    )

# ============================================================
# CRUD WORKFLOW
# ============================================================

@app.post("/api/agents/crud", tags=["CRUD"])
async def create_crud(request: CRUDRequest):
    """
    Gera um CRUD completo (Database + Backend + Frontend)
    
    Orquestra os agents especializados para criar:
    - Schema Prisma
    - Backend Node.js/Express
    - Frontend React
    """
    try:
        fields = [
            {"name": f.name, "type": f.type, "required": f.required}
            for f in request.fields
        ]
        
        result = await generate_crud(
            entity_name=request.entity_name,
            fields=fields,
            clinica_relationship=request.clinica_relationship
        )
        
        return result
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Erro ao gerar CRUD: {str(e)}"
        )

@app.post("/api/agents/crud/simple", tags=["CRUD"])
async def create_crud_simple(
    entity_name: str,
    fields: str
):
    """
    Versão simplificada para testes rápidos
    
    Exemplo:
    ```
    entity_name=Teste
    fields=nome:String,descricao:String?,ativo:Boolean
    ```
    """
    try:
        parsed_fields = []
        for field_str in fields.split(","):
            parts = field_str.split(":")
            if len(parts) == 2:
                name, type_info = parts
                required = "?" not in type_info
                field_type = type_info.replace("?", "")
                parsed_fields.append({
                    "name": name,
                    "type": field_type,
                    "required": required
                })
        
        result = await generate_crud(
            entity_name=entity_name,
            fields=parsed_fields
        )
        
        return result
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Erro: {str(e)}"
        )

# ============================================================
# BUGFIX WORKFLOW
# ============================================================

@app.post("/api/agents/bugfix", tags=["Bugfix"])
async def create_bugfix(request: BugfixRequest):
    """
    Corrige bugs automaticamente
    
    Analisa o bug, cria teste de reprodução, 
    implementa fix e verifica solução.
    """
    try:
        result = await fix_bug(
            bug_report=request.bug_report,
            file_path=request.file_path,
            error_message=request.error_message
        )
        
        return result
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Erro ao corrigir bug: {str(e)}"
        )

# ============================================================
# REFACTOR WORKFLOW
# ============================================================

@app.post("/api/agents/refactor", tags=["Refactor"])
async def create_refactor(request: RefactorRequest):
    """
    Planeja refatoração de código
    
    Analisa impacto, cria plano detalhado,
    fornece exemplo e checklist.
    """
    try:
        result = await refactor_code(
            target=request.target,
            from_pattern=request.from_pattern,
            to_pattern=request.to_pattern,
            scope=request.scope
        )
        
        return result
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Erro ao planejar refatoração: {str(e)}"
        )

# ============================================================
# CODE REVIEW WORKFLOW
# ============================================================

@app.post("/api/agents/review", tags=["Review"])
async def create_review(request: CodeReviewRequest):
    """
    Realiza code review automático
    
    Analisa qualidade, segurança, performance
    e sugere melhorias.
    """
    try:
        result = await code_review(
            file_path=request.file_path,
            code=request.code
        )
        
        return result
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Erro no code review: {str(e)}"
        )

# ============================================================
# MAIN
# ============================================================

if __name__ == "__main__":
    import uvicorn
    
    print("🚀 Starting OrthoPlus Agent Service v0.2.0")
    print("📚 Documentation: http://localhost:8000/docs")
    
    uvicorn.run(app, host="0.0.0.0", port=8000)
