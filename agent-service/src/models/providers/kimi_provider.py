"""
Kimi Provider - Implementação para Moonshot AI API
"""
import os
import time
from typing import Optional

from agno.models.openai import OpenAIChat

from .base_provider import BaseProvider


class KimiProvider(BaseProvider):
    """Provider para Moonshot AI (Kimi) API - Terciary provider"""
    
    def __init__(self):
        super().__init__(name="kimi", priority=3)  # Terciary provider
        self._model: Optional[OpenAIChat] = None
        self._api_key = os.getenv("KIMI_API_KEY")
        self._model_id = os.getenv("KIMI_MODEL", "moonshot-v1-8k")
        self._temperature = float(os.getenv("AGENT_TEMPERATURE", "0.7"))
        self._base_url = "https://api.moonshot.cn/v1"
    
    def _get_model(self) -> OpenAIChat:
        """Lazy loading do modelo"""
        if self._model is None:
            if not self._api_key:
                raise ValueError("KIMI_API_KEY não configurada")
            
            self._model = OpenAIChat(
                id=self._model_id,
                api_key=self._api_key,
                base_url=self._base_url,
                temperature=self._temperature,
            )
        return self._model
    
    async def generate(self, prompt: str, **kwargs) -> str:
        """Gera resposta usando Kimi (Moonshot AI)"""
        from agno.agent import Agent
        
        start_time = time.time()
        
        try:
            agent = Agent(
                model=self._get_model(),
                description=kwargs.get("description", "Kimi Agent"),
                instructions=kwargs.get("instructions", []),
                markdown=kwargs.get("markdown", True),
            )
            
            response = await agent.arun(prompt)
            content = response.content
            
            # Verifica se a resposta contém erro
            if self._is_error_response(content):
                error_msg = f"Kimi API Error: {content[:500]}"
                error = Exception(error_msg)
                self.mark_failure(error)
                raise error
            
            latency = time.time() - start_time
            self.mark_success(latency)
            
            return content
            
        except Exception as e:
            self.mark_failure(e)
            raise
    
    def _is_error_response(self, content: str) -> bool:
        """Verifica se o content é uma resposta de erro"""
        if not isinstance(content, str):
            return False
        
        error_indicators = [
            '"error":',
            'rate limit',
            'quota exceeded',
            'insufficient_quota',
            'invalid_api_key',
            'authentication_error',
        ]
        
        return any(indicator in content.lower() for indicator in error_indicators)
    
    def is_available(self) -> bool:
        """Verifica se Kimi está disponível"""
        if self.is_circuit_open():
            return False
        
        if not self._api_key:
            return False
        
        return True
    
    def is_quota_exceeded(self, error: Exception) -> bool:
        """Detecta se o erro é de quota excedida"""
        error_str = str(error).lower()
        
        # Kimi/Moonshot errors
        quota_indicators = [
            "quota",
            "rate limit",
            "too many requests",
            "429",
            "insufficient_quota",
            "limit exceeded",
        ]
        
        return any(indicator in error_str for indicator in quota_indicators)
    
    def __str__(self) -> str:
        return f"KimiProvider(model={self._model_id}, available={self.is_available()})"
