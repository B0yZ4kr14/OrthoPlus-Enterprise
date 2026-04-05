"""
Workflow para correção de bugs
"""
import asyncio
from typing import Dict, Any
from src.agents import backend_agent, frontend_agent
from src.tools import ReadFileTool, SearchCodeTool


async def fix_bug(
    bug_report: str,
    file_path: str = None,
    error_message: str = None
) -> Dict[str, Any]:
    """
    Workflow para corrigir bugs
    
    Args:
        bug_report: Descrição do bug
        file_path: Arquivo afetado (opcional)
        error_message: Mensagem de erro (opcional)
    
    Returns:
        Dict com análise, fix e testes
    """
    
    print(f"🐛 Iniciando correção de bug: {bug_report[:50]}...")
    
    # ============================================================
    # PASSO 1: ANÁLISE
    # ============================================================
    print("🔍 Step 1/4: Analisando código...")
    
    context = ""
    if file_path:
        context = ReadFileTool.run(file_path, max_lines=50)
    
    analysis_prompt = f"""
Analise o seguinte bug:

BUG: {bug_report}

ERRO: {error_message or "N/A"}

CÓDIGO:
{context}

Identifique:
1. Causa raiz do problema
2. Arquivos que precisam ser modificados
3. Tipo de fix necessário
4. Potenciais side effects

Retorne uma análise estruturada.
"""
    
    analysis_response = await asyncio.to_thread(
        backend_agent.run,
        analysis_prompt
    )
    analysis = analysis_response.content
    print(f"   ✅ Análise completa ({len(analysis)} chars)")
    
    # ============================================================
    # PASSO 2: REPRODUÇÃO (Teste que falha)
    # ============================================================
    print("🧪 Step 2/4: Criando teste de reprodução...")
    
    test_prompt = f"""
Baseado na análise:
{analysis}

Crie um teste que REPRODUZA o bug (deve falhar com o código atual).

Requisitos:
- Use Jest + TypeScript
- Teste deve ser específico para o bug
- Inclua cenários edge case

Retorne APENAS o código do teste.
"""
    
    test_response = await asyncio.to_thread(
        backend_agent.run,
        test_prompt
    )
    test_code = test_response.content
    print(f"   ✅ Teste criado ({len(test_code)} chars)")
    
    # ============================================================
    # PASSO 3: FIX
    # ============================================================
    print("🔧 Step 3/4: Implementando correção...")
    
    fix_prompt = f"""
Implemente o FIX para o bug:

BUG: {bug_report}
ANÁLISE:
{analysis}

REGRAS:
- Corrija a causa raiz, não apenas o sintoma
- Mantenha compatibilidade com código existente
- Adicione tratamento de erros adequado
- Siga padrões do projeto

Retorne:
1. Código corrigido
2. Explicação da mudança
"""
    
    fix_response = await asyncio.to_thread(
        backend_agent.run,
        fix_prompt
    )
    fix_code = fix_response.content
    print(f"   ✅ Fix implementado ({len(fix_code)} chars)")
    
    # ============================================================
    # PASSO 4: VERIFICAÇÃO
    # ============================================================
    print("✅ Step 4/4: Verificando solução...")
    
    verify_prompt = f"""
Verifique se o fix resolve o problema:

BUG ORIGINAL: {bug_report}

FIX IMPLEMENTADO:
{fix_code}

TESTE:
{test_code}

Verifique:
1. O fix resolve o bug?
2. O teste passaria com o fix?
3. Há algum side effect?
4. O código segue padrões?

Retorne OK se aprovado, ou liste problemas.
"""
    
    verify_response = await asyncio.to_thread(
        backend_agent.run,
        verify_prompt
    )
    verification = verify_response.content
    print(f"   ✅ Verificação completa")
    
    # ============================================================
    # RESULTADO
    # ============================================================
    print("✨ Bugfix completo!")
    
    return {
        "bug": bug_report,
        "analysis": analysis,
        "test": test_code,
        "fix": fix_code,
        "verification": verification,
        "status": "completed" if "OK" in verification else "needs_review",
        "metrics": {
            "analysis_length": len(analysis),
            "test_length": len(test_code),
            "fix_length": len(fix_code),
        }
    }
