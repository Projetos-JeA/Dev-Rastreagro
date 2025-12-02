"""Implementação de matching usando Ollama (gratuito, local)"""

import json
import math
from typing import List, Dict, Any, Optional

try:
    import ollama
    OLLAMA_AVAILABLE = True
except ImportError:
    OLLAMA_AVAILABLE = False
    ollama = None

from app.services.ai.base_matching_service import BaseMatchingService


class OllamaMatchingService(BaseMatchingService):
    """Serviço de matching usando Ollama para embeddings e análise"""

    def __init__(self, model: str = "llama3.2"):
        """
        Inicializa o serviço Ollama
        
        Args:
            model: Nome do modelo Ollama a usar (padrão: llama3.2)
        """
        self.model = model
        self.embedding_model = "nomic-embed-text"  # Modelo específico para embeddings
        self.ollama_available = OLLAMA_AVAILABLE
        
        if not OLLAMA_AVAILABLE:
            print("⚠️  Ollama não está instalado. Usando fallback simples.")
            print("   Para usar IA completa, execute: pip install ollama")
        
    def _check_ollama_connection(self) -> bool:
        """Verifica se Ollama está rodando"""
        if not self.ollama_available:
            return False
        try:
            ollama.list()
            return True
        except Exception:
            return False

    def generate_embedding(self, text: str) -> List[float]:
        """
        Gera embedding vetorial para um texto usando Ollama
        
        Args:
            text: Texto para gerar embedding
            
        Returns:
            Lista de floats representando o embedding
        """
        if not self._check_ollama_connection():
            # Fallback: retorna embedding vazio se Ollama não estiver rodando
            return [0.0] * 768
        
        try:
            # Usa modelo de embedding do Ollama
            response = ollama.embeddings(model=self.embedding_model, prompt=text)
            if response and "embedding" in response:
                return response["embedding"]
            else:
                # Fallback: embedding simples baseado em hash
                return self._simple_embedding(text)
        except Exception as e:
            # Em caso de erro, usa embedding simples
            print(f"Erro ao gerar embedding com Ollama: {e}")
            return self._simple_embedding(text)

    def _simple_embedding(self, text: str) -> List[float]:
        """Gera embedding simples baseado em características do texto (fallback)"""
        # Embedding simples baseado em palavras-chave e características
        text_lower = text.lower()
        embedding = [0.0] * 768
        
        # Palavras-chave comuns no agro
        keywords = {
            "boi": 0.1, "gado": 0.1, "pecuária": 0.15, "pecuaria": 0.15,
            "ração": 0.1, "sal": 0.08, "mineral": 0.08,
            "sementes": 0.1, "pastagem": 0.1,
            "defensivo": 0.1, "agrotóxico": 0.1, "pulverização": 0.1,
            "agricultura": 0.15, "soja": 0.1, "milho": 0.1,
            "serviço": 0.1, "servico": 0.1,
        }
        
        for keyword, weight in keywords.items():
            if keyword in text_lower:
                idx = hash(keyword) % 768
                embedding[idx] = weight
        
        # Normaliza o embedding
        norm = math.sqrt(sum(x * x for x in embedding))
        if norm > 0:
            embedding = [x / norm for x in embedding]
        
        return embedding

    def calculate_similarity(self, embedding1: List[float], embedding2: List[float]) -> float:
        """
        Calcula similaridade cosseno entre dois embeddings
        
        Args:
            embedding1: Primeiro embedding
            embedding2: Segundo embedding
            
        Returns:
            Similaridade (0-1)
        """
        if len(embedding1) != len(embedding2):
            return 0.0
        
        # Produto escalar
        dot_product = sum(a * b for a, b in zip(embedding1, embedding2))
        
        # Normas
        norm1 = math.sqrt(sum(a * a for a in embedding1))
        norm2 = math.sqrt(sum(b * b for b in embedding2))
        
        if norm1 == 0 or norm2 == 0:
            return 0.0
        
        # Similaridade cosseno
        similarity = dot_product / (norm1 * norm2)
        
        # Garante que está entre 0 e 1
        return max(0.0, min(1.0, similarity))

    def analyze_relevance(
        self,
        buyer_profile: Dict[str, Any],
        quotation_data: Dict[str, Any],
        user_interactions: List[Dict[str, Any]]
    ) -> float:
        """
        Analisa relevância de uma cotação para um comprador
        
        Lógica:
        - 70% baseado em comportamento (interações)
        - 30% baseado em perfil (atividades, localização)
        
        Args:
            buyer_profile: Dados do perfil do comprador
            quotation_data: Dados da cotação
            user_interactions: Histórico de interações
            
        Returns:
            Score de relevância (0-100)
        """
        # 1. Calcula score baseado em comportamento (70% do peso)
        behavior_score = self._calculate_behavior_score(quotation_data, user_interactions)
        
        # 2. Calcula score baseado em perfil (30% do peso)
        profile_score = self._calculate_profile_score(buyer_profile, quotation_data)
        
        # 3. Combina os scores
        final_score = (behavior_score * 0.7) + (profile_score * 0.3)
        
        return round(final_score, 2)

    def _calculate_behavior_score(
        self, 
        quotation_data: Dict[str, Any], 
        user_interactions: List[Dict[str, Any]]
    ) -> float:
        """
        Calcula score baseado em comportamento do usuário
        
        Se o usuário interagiu com cotações similares → score alto (90-100)
        Se não tem histórico → score baixo (0-30)
        """
        if not user_interactions:
            return 0.0  # Sem histórico = score baixo
        
        # Gera embedding da cotação atual
        quotation_text = self._build_quotation_text(quotation_data)
        quotation_embedding = self.generate_embedding(quotation_text)
        
        # Analisa interações positivas (favoritos, aceitos, compras)
        positive_interactions = [
            i for i in user_interactions 
            if i.get("interaction_type") in ["favorite", "accepted", "purchased", "view"]
        ]
        
        if not positive_interactions:
            return 0.0
        
        # Calcula similaridade com cotações que o usuário interagiu
        max_similarity = 0.0
        
        for interaction in positive_interactions:
            interacted_quotation = interaction.get("quotation_data", {})
            interacted_text = self._build_quotation_text(interacted_quotation)
            interacted_embedding = self.generate_embedding(interacted_text)
            
            similarity = self.calculate_similarity(quotation_embedding, interacted_embedding)
            max_similarity = max(max_similarity, similarity)
            
            # Peso maior para compras e matches aceitos
            if interaction.get("interaction_type") in ["purchased", "accepted"]:
                similarity *= 1.2  # Bônus de 20%
                max_similarity = max(max_similarity, min(1.0, similarity))
        
        # Converte similaridade (0-1) para score (0-100)
        # Similaridade alta (>0.8) → Score 90-100
        # Similaridade média (0.5-0.8) → Score 70-89
        # Similaridade baixa (<0.5) → Score 0-69
        
        if max_similarity >= 0.8:
            return 90.0 + (max_similarity - 0.8) * 50  # 90-100
        elif max_similarity >= 0.5:
            return 70.0 + (max_similarity - 0.5) * 66.67  # 70-89
        else:
            return max_similarity * 140  # 0-70

    def _calculate_profile_score(
        self,
        buyer_profile: Dict[str, Any],
        quotation_data: Dict[str, Any]
    ) -> float:
        """
        Calcula score baseado no perfil cadastrado
        
        Considera:
        - Atividades do perfil
        - Localização
        - Categoria
        """
        score = 0.0
        max_score = 100.0
        
        # 1. Match de categoria (40 pontos)
        profile_categories = buyer_profile.get("categories", [])
        quotation_category = quotation_data.get("category", "").lower()
        
        if quotation_category in profile_categories:
            score += 40.0
        elif "both" in profile_categories and quotation_category in ["agriculture", "livestock"]:
            score += 30.0
        
        # 2. Match de localização (30 pontos)
        profile_state = buyer_profile.get("state", "").lower()
        profile_city = buyer_profile.get("city", "").lower()
        quotation_state = quotation_data.get("location_state", "").lower()
        quotation_city = quotation_data.get("location_city", "").lower()
        
        if profile_state and quotation_state:
            if profile_state == quotation_state:
                score += 20.0
                if profile_city and quotation_city and profile_city == quotation_city:
                    score += 10.0  # Bônus para mesma cidade
        
        # 3. Match de tipo de produto (30 pontos)
        # Usa embedding para similaridade semântica
        profile_text = self._build_profile_text(buyer_profile)
        quotation_text = self._build_quotation_text(quotation_data)
        
        profile_embedding = self.generate_embedding(profile_text)
        quotation_embedding = self.generate_embedding(quotation_text)
        
        similarity = self.calculate_similarity(profile_embedding, quotation_embedding)
        score += similarity * 30.0
        
        return min(score, max_score)

    def _build_quotation_text(self, quotation_data: Dict[str, Any]) -> str:
        """Constrói texto descritivo da cotação para embedding"""
        parts = []
        
        if quotation_data.get("title"):
            parts.append(quotation_data["title"])
        
        if quotation_data.get("description"):
            parts.append(quotation_data["description"])
        
        if quotation_data.get("product_type"):
            parts.append(quotation_data["product_type"])
        
        if quotation_data.get("category"):
            parts.append(quotation_data["category"])
        
        return " ".join(parts)

    def _build_profile_text(self, buyer_profile: Dict[str, Any]) -> str:
        """Constrói texto descritivo do perfil para embedding"""
        parts = []
        
        # Atividades
        activities = buyer_profile.get("activities", [])
        for activity in activities:
            if isinstance(activity, dict):
                parts.append(activity.get("category_name", ""))
                parts.append(activity.get("group_name", ""))
                parts.append(activity.get("item_name", ""))
            else:
                parts.append(str(activity))
        
        # Localização
        if buyer_profile.get("state"):
            parts.append(buyer_profile["state"])
        if buyer_profile.get("city"):
            parts.append(buyer_profile["city"])
        
        return " ".join(filter(None, parts))

