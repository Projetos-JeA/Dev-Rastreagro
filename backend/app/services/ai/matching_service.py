"""Serviço principal de matching que combina IA com regras"""

from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session

from app.models.quotation import Quotation
from app.models.user import User
from app.models.user_interaction import InteractionType
from app.repositories.user_interaction_repository import UserInteractionRepository
from app.repositories.company_repository import CompanyRepository
from app.repositories.buyer_profile_repository import BuyerProfileRepository
from app.services.ai.ollama_matching_service import OllamaMatchingService


class MatchingService:
    """Serviço que calcula relevância de cotações usando IA"""

    def __init__(self, db: Session):
        self.db = db
        self.ai_service = OllamaMatchingService()
        self.interaction_repo = UserInteractionRepository(db)
        self.company_repo = CompanyRepository(db)
        self.buyer_profile_repo = BuyerProfileRepository(db)

    def calculate_relevance_score(
        self, 
        buyer_id: int, 
        quotation: Quotation
    ) -> float:
        """
        Calcula score de relevância de uma cotação para um comprador
        
        Args:
            buyer_id: ID do comprador
            quotation: Cotação a avaliar
            
        Returns:
            Score de 0-100
        """
        # 1. Busca perfil do comprador
        buyer_profile = self._build_buyer_profile(buyer_id)
        
        # 2. Busca histórico de interações
        user_interactions = self._get_user_interactions(buyer_id)
        
        # 3. Prepara dados da cotação
        quotation_data = self._build_quotation_data(quotation)
        
        # 4. Calcula score usando IA
        try:
            score = self.ai_service.analyze_relevance(
                buyer_profile=buyer_profile,
                quotation_data=quotation_data,
                user_interactions=user_interactions
            )
        except Exception as e:
            # Em caso de erro, usa score baseado em perfil apenas
            print(f"Erro ao calcular score com IA: {e}")
            score = self._calculate_fallback_score(buyer_profile, quotation_data)
        
        return score

    def _build_buyer_profile(self, buyer_id: int) -> Dict[str, Any]:
        """Constrói perfil do comprador para análise"""
        user = self.db.query(User).filter(User.id == buyer_id).first()
        if not user:
            return {}
        
        profile = {
            "user_id": buyer_id,
            "categories": [],
            "activities": [],
            "state": None,
            "city": None,
        }
        
        # Busca atividades da empresa (se for produtor)
        company = self.company_repo.get_by_user_id(buyer_id)
        if company and company.activities:
            for activity in company.activities:
                activity_data = {}
                if activity.category:
                    activity_data["category_name"] = activity.category.name
                    # Mapeia para categorias de cotações
                    category_lower = activity.category.name.lower()
                    if "pecuária" in category_lower or "pecuaria" in category_lower:
                        profile["categories"].append("livestock")
                        profile["categories"].append("both")
                    elif "agricultura" in category_lower:
                        profile["categories"].append("agriculture")
                        profile["categories"].append("both")
                    elif "integração" in category_lower or "integracao" in category_lower:
                        profile["categories"].extend(["agriculture", "livestock", "both", "service"])
                    elif "serviço" in category_lower or "servico" in category_lower:
                        profile["categories"].extend(["service", "both"])
                
                if activity.group:
                    activity_data["group_name"] = activity.group.name
                if activity.item:
                    activity_data["item_name"] = activity.item.name
                
                profile["activities"].append(activity_data)
            
            # Localização da empresa
            profile["state"] = company.estado
            profile["city"] = company.cidade
        
        # Busca perfil de comprador
        buyer_profile = self.buyer_profile_repo.get_by_user_id(buyer_id)
        if buyer_profile:
            if not profile["state"]:
                profile["state"] = buyer_profile.estado
            if not profile["city"]:
                profile["city"] = buyer_profile.cidade
            
            # Se não tem company mas tem buyer_profile, assume categorias genéricas
            # (produtor geralmente trabalha com agricultura e pecuária)
            if not profile["categories"]:
                # Produtor puro: assume interesse em agricultura e pecuária
                profile["categories"] = ["agriculture", "livestock", "both"]
        
        # Remove duplicatas
        profile["categories"] = list(set(profile["categories"]))
        
        return profile

    def _get_user_interactions(self, buyer_id: int) -> List[Dict[str, Any]]:
        """Busca histórico de interações do usuário"""
        interactions = self.interaction_repo.get_positive_interactions(buyer_id)
        
        result = []
        for interaction in interactions:
            # Busca dados da cotação interagida
            quotation = self.db.query(Quotation).filter(
                Quotation.id == interaction.quotation_id
            ).first()
            
            if quotation:
                result.append({
                    "interaction_type": interaction.interaction_type.value,
                    "quotation_id": interaction.quotation_id,
                    "quotation_data": self._build_quotation_data(quotation),
                    "created_at": interaction.created_at.isoformat(),
                })
        
        return result

    def _build_quotation_data(self, quotation: Quotation) -> Dict[str, Any]:
        """Constrói dados da cotação para análise"""
        return {
            "id": quotation.id,
            "title": quotation.title or "",
            "description": quotation.description or "",
            "category": quotation.category.value if quotation.category else "",
            "product_type": quotation.product_type or "",
            "location_state": quotation.location_state or "",
            "location_city": quotation.location_city or "",
            "price": quotation.price,
        }

    def _calculate_fallback_score(
        self,
        buyer_profile: Dict[str, Any],
        quotation_data: Dict[str, Any]
    ) -> float:
        """Calcula score simples sem IA (fallback)"""
        score = 0.0
        
        # Match de categoria
        profile_categories = buyer_profile.get("categories", [])
        quotation_category = quotation_data.get("category", "").lower()
        
        if quotation_category in profile_categories:
            score += 50.0
        
        # Match de localização
        profile_state = buyer_profile.get("state", "").lower()
        quotation_state = quotation_data.get("location_state", "").lower()
        
        if profile_state and quotation_state and profile_state == quotation_state:
            score += 30.0
        
        # Base score
        if score == 0.0:
            score = 20.0  # Score mínimo
        
        return min(score, 100.0)

