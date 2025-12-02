"""Interface base para serviços de matching com IA"""

from abc import ABC, abstractmethod
from typing import List, Dict, Any


class BaseMatchingService(ABC):
    """Interface base para serviços de matching com IA"""

    @abstractmethod
    def generate_embedding(self, text: str) -> List[float]:
        """Gera embedding vetorial para um texto"""
        pass

    @abstractmethod
    def calculate_similarity(self, embedding1: List[float], embedding2: List[float]) -> float:
        """Calcula similaridade entre dois embeddings (0-1)"""
        pass

    @abstractmethod
    def analyze_relevance(
        self, 
        buyer_profile: Dict[str, Any], 
        quotation_data: Dict[str, Any],
        user_interactions: List[Dict[str, Any]]
    ) -> float:
        """
        Analisa relevância de uma cotação para um comprador
        
        Args:
            buyer_profile: Dados do perfil do comprador
            quotation_data: Dados da cotação
            user_interactions: Histórico de interações do usuário
            
        Returns:
            Score de relevância (0-100)
        """
        pass

