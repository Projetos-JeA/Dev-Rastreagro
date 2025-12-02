"""Serviços de IA para matching"""

from app.services.ai.base_matching_service import BaseMatchingService
from app.services.ai.ollama_matching_service import OllamaMatchingService
from app.services.ai.matching_service import MatchingService

__all__ = [
    "BaseMatchingService",
    "OllamaMatchingService",
    "MatchingService",
]

