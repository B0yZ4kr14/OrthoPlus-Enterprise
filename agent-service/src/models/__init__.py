"""
Models module - Router e providers para LLMs
"""
import os
from dotenv import load_dotenv

# Carregar variáveis de ambiente antes de importar providers
load_dotenv()

from .model_router import ModelRouter, get_model_router
from .providers.gemini_provider import GeminiProvider
from .providers.openrouter_provider import OpenRouterProvider

__all__ = [
    "ModelRouter",
    "get_model_router",
    "GeminiProvider",
    "OpenRouterProvider",
]
