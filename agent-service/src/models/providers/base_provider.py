"""
Base Provider - Interface comum para todos os providers de LLM
"""
from abc import ABC, abstractmethod
from typing import Optional, Dict, Any
from dataclasses import dataclass
from enum import Enum
import time


class ProviderStatus(Enum):
    HEALTHY = "healthy"
    DEGRADED = "degraded"
    UNHEALTHY = "unhealthy"


@dataclass
class ProviderMetrics:
    """Métricas de uso do provider"""
    total_requests: int = 0
    successful_requests: int = 0
    failed_requests: int = 0
    quota_exceeded_count: int = 0
    last_error: Optional[str] = None
    last_used: Optional[float] = None
    average_latency: float = 0.0


class BaseProvider(ABC):
    """Interface base para providers de LLM"""
    
    def __init__(self, name: str, priority: int = 0):
        self.name = name
        self.priority = priority  # Menor = maior prioridade
        self.status = ProviderStatus.HEALTHY
        self.metrics = ProviderMetrics()
        self._consecutive_failures = 0
        self._circuit_breaker_threshold = 5
        self._circuit_breaker_timeout = 300  # 5 minutos
        self._circuit_breaker_until = 0
    
    @abstractmethod
    async def generate(self, prompt: str, **kwargs) -> str:
        """Gera resposta do LLM"""
        pass
    
    @abstractmethod
    def is_available(self) -> bool:
        """Verifica se o provider está disponível"""
        pass
    
    @abstractmethod
    def is_quota_exceeded(self, error: Exception) -> bool:
        """Verifica se o erro é de quota excedida"""
        pass
    
    def mark_success(self, latency: float):
        """Marca uma requisição bem-sucedida"""
        self.metrics.total_requests += 1
        self.metrics.successful_requests += 1
        self.metrics.last_used = time.time()
        self._consecutive_failures = 0
        
        # Atualiza latência média
        if self.metrics.average_latency == 0:
            self.metrics.average_latency = latency
        else:
            self.metrics.average_latency = (
                self.metrics.average_latency * 0.9 + latency * 0.1
            )
        
        self.status = ProviderStatus.HEALTHY
    
    def mark_failure(self, error: Exception):
        """Marca uma requisição falha"""
        self.metrics.total_requests += 1
        self.metrics.failed_requests += 1
        self.metrics.last_error = str(error)
        self._consecutive_failures += 1
        
        # Verifica quota exceeded
        if self.is_quota_exceeded(error):
            self.metrics.quota_exceeded_count += 1
        
        # Circuit breaker
        if self._consecutive_failures >= self._circuit_breaker_threshold:
            self.status = ProviderStatus.UNHEALTHY
            self._circuit_breaker_until = time.time() + self._circuit_breaker_timeout
    
    def is_circuit_open(self) -> bool:
        """Verifica se o circuit breaker está aberto"""
        if self.status != ProviderStatus.UNHEALTHY:
            return False
        
        # Verifica se já pode tentar novamente
        if time.time() > self._circuit_breaker_until:
            self.status = ProviderStatus.HEALTHY
            self._consecutive_failures = 0
            return False
        
        return True
    
    def get_metrics(self) -> Dict[str, Any]:
        """Retorna métricas do provider"""
        success_rate = 0
        if self.metrics.total_requests > 0:
            success_rate = (
                self.metrics.successful_requests / self.metrics.total_requests
            ) * 100
        
        return {
            "name": self.name,
            "status": self.status.value,
            "priority": self.priority,
            "total_requests": self.metrics.total_requests,
            "success_rate": f"{success_rate:.1f}%",
            "quota_exceeded_count": self.metrics.quota_exceeded_count,
            "average_latency_ms": f"{self.metrics.average_latency * 1000:.0f}",
            "consecutive_failures": self._consecutive_failures,
            "circuit_open": self.is_circuit_open(),
        }
