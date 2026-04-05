"""
Base Agent - Wrapper com fallback automático entre providers
"""
import logging
from typing import List, Optional, Dict, Any

from src.models.model_router import get_model_router, RoutingResult

logger = logging.getLogger(__name__)


class BaseAgent:
    """
    Agente base com suporte a fallback entre providers.
    
    Features:
    - Roteamento automático entre Gemini e OpenRouter
    - Retry com exponential backoff
    - Métricas de uso
    """
    
    def __init__(
        self,
        name: str,
        description: str,
        instructions: List[str],
        markdown: bool = True,
    ):
        self.name = name
        self.description = description
        self.instructions = instructions
        self.markdown = markdown
        self.router = get_model_router()
    
    def run(self, prompt: str) -> "AgentResponse":
        """
        Executa o agente de forma síncrona com fallback automático.
        
        Args:
            prompt: Prompt para o agente
        
        Returns:
            AgentResponse com content e metadados
        """
        import asyncio
        return asyncio.run(self.arun(prompt))
    
    async def arun(self, prompt: str) -> "AgentResponse":
        """
        Executa o agente de forma assíncrona com fallback automático.
        
        Args:
            prompt: Prompt para o agente
        
        Returns:
            AgentResponse com content e metadados
        """
        full_prompt = self._build_prompt(prompt)
        
        try:
            result = await self.router.generate(
                prompt=full_prompt,
                description=self.description,
                instructions=self.instructions,
                markdown=self.markdown,
            )
            
            return AgentResponse(
                content=result.content,
                provider_used=result.provider_used,
                latency_ms=result.latency_ms,
                attempts=result.attempts,
                fallback_used=result.fallback_used,
            )
            
        except Exception as e:
            logger.error(f"❌ {self.name} falhou: {e}")
            raise
    
    def _build_prompt(self, user_prompt: str) -> str:
        """Constrói o prompt completo com instruções"""
        if self.instructions:
            instructions_text = "\n".join(f"- {inst}" for inst in self.instructions)
            return f"""{instructions_text}

---

Tarefa: {user_prompt}
"""
        return user_prompt
    
    def get_metrics(self) -> List[Dict[str, Any]]:
        """Retorna métricas dos providers"""
        return self.router.get_metrics()


class AgentResponse:
    """Resposta do agente com metadados"""
    
    def __init__(
        self,
        content: str,
        provider_used: str,
        latency_ms: float,
        attempts: int,
        fallback_used: bool,
    ):
        self.content = content
        self.provider_used = provider_used
        self.latency_ms = latency_ms
        self.attempts = attempts
        self.fallback_used = fallback_used
    
    def __str__(self) -> str:
        fallback_indicator = " [FALLBACK]" if self.fallback_used else ""
        return (
            f"AgentResponse(provider={self.provider_used}{fallback_indicator}, "
            f"latency={self.latency_ms:.0f}ms, attempts={self.attempts})"
        )
