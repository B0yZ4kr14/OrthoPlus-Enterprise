"""
OpenRouter Provider - Implementação para OpenRouter API
"""
import os
import time
from typing import Optional

from agno.models.openai import OpenAIChat

from .base_provider import BaseProvider


class OpenRouterProvider(BaseProvider):
    """Provider para OpenRouter API (fallback)"""
    
    def __init__(self):
        super().__init__(name="openrouter", priority=2)  # Prioridade menor (fallback)
        self._model: Optional[OpenAIChat] = None
        self._api_key = os.getenv("OPENROUTER_API_KEY")
        self._model_id = os.getenv("OPENROUTER_MODEL", "google/gemini-2.0-flash-exp:free")
        self._temperature = float(os.getenv("AGENT_TEMPERATURE", "0.7"))
        self._base_url = "https://openrouter.ai/api/v1"
    
    def _get_model(self) -> OpenAIChat:
        """Lazy loading do modelo"""
        if self._model is None:
            if not self._api_key:
                raise ValueError("OPENROUTER_API_KEY não configurada")
            
            self._model = OpenAIChat(
                id=self._model_id,
                api_key=self._api_key,
                base_url=self._base_url,
                temperature=self._temperature,
                extra_headers={
                    "HTTP-Referer": "https://orthoplus.local",
                    "X-Title": "OrthoPlus Agent Service"
                }
            )
        return self._model
    
    async def generate(self, prompt: str, **kwargs) -> str:
        """Gera resposta usando OpenRouter"""
        from agno.agent import Agent
        
        start_time = time.time()
        
        try:
            agent = Agent(
                model=self._get_model(),
                description=kwargs.get("description", "OpenRouter Agent"),
                instructions=kwargs.get("instructions", []),
                markdown=kwargs.get("markdown", True),
            )
            
            response = await agent.arun(prompt)
            
            latency = time.time() - start_time
            self.mark_success(latency)
            
            return response.content
            
        except Exception as e:
            self.mark_failure(e)
            raise
    
    def is_available(self) -> bool:
        """Verifica se OpenRouter está disponível"""
        if self.is_circuit_open():
            return False
        
        if not self._api_key:
            return False
        
        return True
    
    def is_quota_exceeded(self, error: Exception) -> bool:
        """Detecta se o erro é de quota excedida"""
        error_str = str(error).lower()
        
        # OpenRouter pode retornar diferentes formatos
        quota_indicators = [
            "quota",
            "rate limit",
            "too many requests",
            "429",
            "insufficient credits",
            "limit exceeded",
        ]
        
        return any(indicator in error_str for indicator in quota_indicators)
    
    def __str__(self) -> str:
        return f"OpenRouterProvider(model={self._model_id}, available={self.is_available()})"
