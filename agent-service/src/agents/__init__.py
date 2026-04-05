"""
Agents module - Especialistas em diferentes áreas
"""
from .base_agent import BaseAgent, AgentResponse
from .database_agent import database_agent
from .backend_agent import backend_agent
from .frontend_agent import frontend_agent

__all__ = [
    "BaseAgent",
    "AgentResponse",
    "database_agent",
    "backend_agent",
    "frontend_agent",
]
