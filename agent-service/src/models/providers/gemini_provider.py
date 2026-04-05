"""
Gemini Provider - Implementação para Google Gemini API
"""
import os
import time
from typing import Optional

from agno.models.google import Gemini
from google.api_core.exceptions import ResourceExhausted, InvalidArgument

from .base_provider import BaseProvider


class GeminiProvider(BaseProvider):
    """Provider para Google Gemini API"""
    
    def __init__(self):
        super().__init__(name="gemini", priority=1)  # Prioridade alta
        self._model: Optional[Gemini] = None
        self._api_key = os.getenv("GOOGLE_API_KEY") or os.getenv("GEMINI_API_KEY")
        self._model_id = os.getenv("AGENT_MODEL", "gemini-2.0-flash")
        self._temperature = float(os.getenv("AGENT_TEMPERATURE", "0.7"))
    
    def _get_model(self) -> Gemini:
        """Lazy loading do modelo"""
        if self._model is None:
            if not self._api_key:
                raise ValueError("GOOGLE_API_KEY ou GEMINI_API_KEY não configurada")
            
            self._model = Gemini(
                id=self._model_id,
                api_key=self._api_key,
                temperature=self._temperature,
            )
        return self._model
    
    async def generate(self, prompt: str, **kwargs) -> str:
        """Gera resposta usando Gemini"""
        from agno.agent import Agent
        
        start_time = time.time()
        
        try:
            agent = Agent(
                model=self._get_model(),
                description=kwargs.get("description", "Gemini Agent"),
                instructions=kwargs.get("instructions", []),
                markdown=kwargs.get("markdown", True),
            )
            
            response = await agent.arun(prompt)
            content = response.content
            
            # Verifica se a resposta contém erro (Agno às vezes retorna erro no content)
            if self._is_error_response(content):
                error_msg = f"Gemini API Error: {content[:500]}"
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
            'RESOURCE_EXHAUSTED',
            'quota exceeded',
            'rate limit',
            'API_KEY_INVALID',
            'NOT_FOUND',
        ]
        
        return any(indicator in content for indicator in error_indicators)
    
    def is_available(self) -> bool:
        """Verifica se Gemini está disponível"""
        if self.is_circuit_open():
            return False
        
        if not self._api_key:
            return False
        
        return True
    
    def is_quota_exceeded(self, error: Exception) -> bool:
        """Detecta se o erro é de quota excedida"""
        error_str = str(error)
        error_str_lower = error_str.lower()
        
        # Verifica mensagens específicas do Gemini
        quota_indicators = [
            "RESOURCE_EXHAUSTED",
            "resource_exhausted",
            "quota exceeded",
            "rate limit",
            "429",
        ]
        
        return any(indicator in error_str or indicator in error_str_lower for indicator in quota_indicators)
    
    def __str__(self) -> str:
        return f"GeminiProvider(model={self._model_id}, available={self.is_available()})"
