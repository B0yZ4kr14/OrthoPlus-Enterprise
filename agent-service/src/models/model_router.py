"""
Model Router - Roteamento inteligente entre providers de LLM

Implementa fallback automático entre Gemini e OpenRouter,
com retry logic e circuit breaker.
"""
import asyncio
import logging
from typing import List, Optional, Dict, Any, Type
from dataclasses import dataclass

from .providers.base_provider import BaseProvider
from .providers.gemini_provider import GeminiProvider
from .providers.openrouter_provider import OpenRouterProvider
from .providers.kimi_provider import KimiProvider

logger = logging.getLogger(__name__)


@dataclass
class RoutingResult:
    """Resultado de uma chamada de roteamento"""
    content: str
    provider_used: str
    latency_ms: float
    attempts: int
    fallback_used: bool


class ModelRouter:
    """
    Router inteligente para providers de LLM.
    
    Features:
    - Fallback automático entre providers
    - Retry com exponential backoff
    - Circuit breaker para providers instáveis
    - Métricas de uso
    """
    
    def __init__(self):
        self.providers: List[BaseProvider] = []
        self._init_providers()
    
    def _init_providers(self):
        """Inicializa providers disponíveis"""
        # Gemini (prioridade 1)
        gemini = GeminiProvider()
        if gemini.is_available():
            self.providers.append(gemini)
            logger.info(f"✅ Gemini provider disponível")
        else:
            logger.warning(f"⚠️  Gemini provider indisponível (API key não configurada)")
        
        # OpenRouter (prioridade 2 - fallback)
        openrouter = OpenRouterProvider()
        if openrouter.is_available():
            self.providers.append(openrouter)
            logger.info(f"✅ OpenRouter provider disponível")
        else:
            logger.warning(f"⚠️  OpenRouter provider indisponível (API key não configurada)")
        
        # Kimi/Moonshot (prioridade 3 - terciary fallback)
        kimi = KimiProvider()
        if kimi.is_available():
            self.providers.append(kimi)
            logger.info(f"✅ Kimi provider disponível")
        else:
            logger.warning(f"⚠️  Kimi provider indisponível (API key não configurada)")
        
        # Ordena por prioridade
        self.providers.sort(key=lambda p: p.priority)
        
        if not self.providers:
            logger.error("❌ Nenhum provider disponível! Configure GOOGLE_API_KEY ou OPENROUTER_API_KEY")
    
    async def generate(
        self,
        prompt: str,
        description: str = "Agent",
        instructions: Optional[List[str]] = None,
        markdown: bool = True,
        max_retries: int = 2,
    ) -> RoutingResult:
        """
        Gera resposta usando o melhor provider disponível.
        
        Args:
            prompt: Prompt para o LLM
            description: Descrição do agent
            instructions: Instruções do sistema
            markdown: Se deve retornar markdown
            max_retries: Número máximo de retries por provider
        
        Returns:
            RoutingResult com content e metadados
        """
        import time
        
        start_time = time.time()
        total_attempts = 0
        last_error = None
        
        for provider in self.providers:
            if not provider.is_available():
                logger.debug(f"Provider {provider.name} indisponível, pulando...")
                continue
            
            for attempt in range(max_retries + 1):
                total_attempts += 1
                
                try:
                    logger.debug(
                        f"🔄 Tentando {provider.name} (attempt {attempt + 1}/{max_retries + 1})"
                    )
                    
                    content = await provider.generate(
                        prompt,
                        description=description,
                        instructions=instructions or [],
                        markdown=markdown,
                    )
                    
                    latency_ms = (time.time() - start_time) * 1000
                    fallback_used = provider != self.providers[0]
                    
                    if fallback_used:
                        logger.info(
                            f"✅ Fallback usado: {self.providers[0].name} → {provider.name} "
                            f"({latency_ms:.0f}ms)"
                        )
                    else:
                        logger.debug(f"✅ {provider.name} respondeu em {latency_ms:.0f}ms")
                    
                    return RoutingResult(
                        content=content,
                        provider_used=provider.name,
                        latency_ms=latency_ms,
                        attempts=total_attempts,
                        fallback_used=fallback_used,
                    )
                    
                except Exception as e:
                    last_error = e
                    
                    if provider.is_quota_exceeded(e):
                        logger.warning(
                            f"⚠️  {provider.name} quota exceeded, tentando próximo provider..."
                        )
                        break  # Sai do retry loop, vai para próximo provider
                    
                    logger.warning(
                        f"⚠️  {provider.name} falhou (attempt {attempt + 1}): {str(e)[:100]}"
                    )
                    
                    if attempt < max_retries:
                        # Exponential backoff
                        wait_time = 2 ** attempt
                        logger.debug(f"⏳ Aguardando {wait_time}s antes de retry...")
                        await asyncio.sleep(wait_time)
        
        # Todos os providers falharam
        latency_ms = (time.time() - start_time) * 1000
        logger.error(f"❌ Todos os providers falharam após {total_attempts} tentativas")
        
        raise RuntimeError(
            f"Todos os providers falharam. Último erro: {last_error}"
        )
    
    def get_metrics(self) -> List[Dict[str, Any]]:
        """Retorna métricas de todos os providers"""
        return [provider.get_metrics() for provider in self.providers]
    
    def get_status(self) -> Dict[str, Any]:
        """Retorna status do router"""
        return {
            "total_providers": len(self.providers),
            "available_providers": sum(1 for p in self.providers if p.is_available()),
            "providers": [
                {
                    "name": p.name,
                    "available": p.is_available(),
                    "priority": p.priority,
                }
                for p in self.providers
            ],
        }


# Singleton instance
_router: Optional[ModelRouter] = None


def get_model_router() -> ModelRouter:
    """Retorna instância singleton do ModelRouter"""
    global _router
    if _router is None:
        _router = ModelRouter()
    return _router


# Facade para uso simples
async def generate_with_fallback(
    prompt: str,
    description: str = "Agent",
    instructions: Optional[List[str]] = None,
    markdown: bool = True,
) -> str:
    """
    Gera texto usando o melhor provider disponível.
    
    Args:
        prompt: Prompt para o LLM
        description: Descrição do agent
        instructions: Instruções do sistema
        markdown: Se deve retornar markdown
    
    Returns:
        Texto gerado
    
    Raises:
        RuntimeError: Se todos os providers falharem
    """
    router = get_model_router()
    result = await router.generate(
        prompt=prompt,
        description=description,
        instructions=instructions,
        markdown=markdown,
    )
    return result.content
