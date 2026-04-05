"""
Workflow para refatoração de código
"""
import asyncio
from typing import Dict, Any, List
from src.agents import backend_agent, frontend_agent
from src.tools import ReadFileTool, SearchCodeTool


async def refactor_code(
    target: str,
    from_pattern: str,
    to_pattern: str,
    scope: str = "module"
) -> Dict[str, Any]:
    """
    Workflow para refatoração
    
    Args:
        target: O que refatorar (ex: "callbacks", "nomenclatura")
        from_pattern: Padrão atual (ex: "callbacks")
        to_pattern: Padrão desejado (ex: "async/await")
        scope: Escopo (file, module, project)
    
    Returns:
        Dict com plano e código refatorado
    """
    
    print(f"♻️  Iniciando refatoração: {target}")
    
    # ============================================================
    # PASSO 1: ANÁLISE DE IMPACTO
    # ============================================================
    print("🔍 Step 1/4: Analisando impacto...")
    
    # Buscar ocorrências do padrão
    search_results = SearchCodeTool.run(from_pattern, max_results=20)
    
    analysis_prompt = f"""
Analise a refatoração necessária:

ALVO: {target}
DE: {from_pattern}
PARA: {to_pattern}
ESCOPO: {scope}

OCORRÊNCIAS ENCONTRADAS:
{search_results}

Identifique:
1. Todos os arquivos afetados
2. Dependências entre arquivos
3. Ordem de refatoração
4. Testes que precisam ser atualizados
5. Riscos potenciais

Retorne um plano detalhado.
"""
    
    analysis_response = await asyncio.to_thread(
        backend_agent.run,
        analysis_prompt
    )
    analysis = analysis_response.content
    print(f"   ✅ Análise completa ({len(analysis)} chars)")
    
    # ============================================================
    # PASSO 2: PLANO DE REFATORAÇÃO
    # ============================================================
    print("📋 Step 2/4: Criando plano...")
    
    plan_prompt = f"""
Crie um plano de refatoração:

ANÁLISE:
{analysis}

Crie:
1. Lista ordenada de arquivos a modificar
2. Mudanças necessárias em cada arquivo
3. Testes a serem atualizados
4. Checkpoints de validação

Retorne um plano estruturado.
"""
    
    plan_response = await asyncio.to_thread(
        backend_agent.run,
        plan_prompt
    )
    plan = plan_response.content
    print(f"   ✅ Plano criado ({len(plan)} chars)")
    
    # ============================================================
    # PASSO 3: EXECUÇÃO (primeiro arquivo como exemplo)
    # ============================================================
    print("🔧 Step 3/4: Refatorando (exemplo)...")
    
    # Pegar primeiro arquivo do plano e refatorar
    refactor_prompt = f"""
Refatore um arquivo exemplo:

PADRÃO: {from_pattern} → {to_pattern}

PLANO:
{plan}

Crie:
1. Código refatorado
2. Explicação das mudanças
3. Testes atualizados

Retorne o código completo.
"""
    
    refactor_response = await asyncio.to_thread(
        backend_agent.run,
        refactor_prompt
    )
    refactored_code = refactor_response.content
    print(f"   ✅ Refatoração exemplo ({len(refactored_code)} chars)")
    
    # ============================================================
    # PASSO 4: CHECKLIST E RECOMENDAÇÕES
    # ============================================================
    print("✅ Step 4/4: Criando checklist...")
    
    checklist_prompt = f"""
Crie checklist para a refatoração:

ALVO: {target}
PLANO:
{plan}

Crie:
1. Checklist de arquivos
2. Passos de teste
3. Rollback plan
4. Critérios de sucesso
"""
    
    checklist_response = await asyncio.to_thread(
        backend_agent.run,
        checklist_prompt
    )
    checklist = checklist_response.content
    print(f"   ✅ Checklist criado")
    
    # ============================================================
    # RESULTADO
    # ============================================================
    print("✨ Refatoração planejada!")
    
    return {
        "target": target,
        "from_pattern": from_pattern,
        "to_pattern": to_pattern,
        "scope": scope,
        "analysis": analysis,
        "plan": plan,
        "example": refactored_code,
        "checklist": checklist,
        "status": "planned",
        "metrics": {
            "analysis_length": len(analysis),
            "plan_length": len(plan),
            "example_length": len(refactored_code),
        }
    }


async def code_review(
    file_path: str,
    code: str = None
) -> Dict[str, Any]:
    """
    Workflow para code review
    
    Args:
        file_path: Arquivo a revisar
        code: Código (se não fornecido, lê do arquivo)
    
    Returns:
        Dict com review e sugestões
    """
    
    print(f"👁️  Iniciando code review: {file_path}")
    
    # Ler código se não fornecido
    if not code:
        code = ReadFileTool.run(file_path)
    
    # ============================================================
    # REVIEW
    # ============================================================
    print("🔍 Analisando código...")
    
    review_prompt = f"""
Realize code review do seguinte código:

ARQUIVO: {file_path}

CÓDIGO:
```typescript
{code}
```

Avalie:
1. Qualidade do código
2. Segurança
3. Performance
4. Manutenibilidade
5. Testes

Use formato:
- ✅ Pontos positivos
- ⚠️ Pontos de atenção
- ❌ Problemas críticos
- 💡 Sugestões de melhoria
"""
    
    review_response = await asyncio.to_thread(
        backend_agent.run,
        review_prompt
    )
    review = review_response.content
    
    # Score
    score_prompt = f"""
Dê uma nota de 0-10 para o código:

REVIEW:
{review}

Retorne apenas o número (0-10).
"""
    
    score_response = await asyncio.to_thread(
        backend_agent.run,
        score_prompt
    )
    
    try:
        score = int(score_response.content.strip())
    except:
        score = 5
    
    print(f"   ✅ Review completo - Score: {score}/10")
    
    return {
        "file": file_path,
        "review": review,
        "score": score,
        "status": "approved" if score >= 7 else "needs_changes",
        "metrics": {
            "review_length": len(review),
            "score": score,
        }
    }
