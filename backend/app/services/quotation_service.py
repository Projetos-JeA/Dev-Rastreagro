"""Service para gerenciar cotações"""

from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import and_
from fastapi import HTTPException, status

from app.models.quotation import Quotation, QuotationStatus, QuotationCategory
from app.models.user import User, UserRole
from app.repositories.quotation_repository import QuotationRepository
from app.repositories.user_repository import UserRepository
from app.repositories.company_repository import CompanyRepository
from app.schemas.quotation import QuotationCreate, QuotationUpdate, QuotationResponse
from app.services.ai.matching_service import MatchingService
import json


class QuotationService:
    def __init__(self, db: Session):
        self.db = db
        self.quotation_repo = QuotationRepository(db)
        self.user_repo = UserRepository(db)
        self.company_repo = CompanyRepository(db)
        self.matching_service = MatchingService(db)

    def create_quotation(self, seller_id: int, payload: QuotationCreate) -> Quotation:
        """Cria uma nova cotação"""
        seller = self.user_repo.get_by_id(seller_id)
        if not seller:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vendedor não encontrado")

        # Determina seller_type baseado no role
        if seller.role == UserRole.SELLER:
            seller_type = "company" if seller.company else "unknown"
        elif seller.role == UserRole.SERVICE_PROVIDER:
            seller_type = "service_provider"
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Apenas vendedores e prestadores podem criar cotações",
            )

        # Converte images para JSON string
        images_json = None
        if payload.images:
            images_json = json.dumps(payload.images)

        quotation = Quotation(
            seller_id=seller_id,
            seller_type=seller_type,
            title=payload.title,
            description=payload.description,
            category=payload.category,
            product_type=payload.product_type,
            location_city=payload.location_city,
            location_state=payload.location_state,
            price=payload.price,
            quantity=payload.quantity,
            unit=payload.unit,
            expires_at=payload.expires_at,
            image_url=payload.image_url,
            images=images_json,
            free_shipping=payload.free_shipping,
            discount_percentage=payload.discount_percentage,
            installments=payload.installments,
            stock=payload.stock,
            status=QuotationStatus.ACTIVE,
        )

        return self.quotation_repo.create(quotation)

    def get_quotation(self, quotation_id: int) -> Optional[Quotation]:
        """Busca uma cotação por ID"""
        return self.quotation_repo.get_by_id(quotation_id)

    def list_quotations(
        self, category: Optional[str] = None, limit: int = 100, offset: int = 0
    ) -> List[Quotation]:
        """Lista cotações ativas"""
        if category:
            return self.quotation_repo.list_by_category(category, limit, offset)
        return self.quotation_repo.list_active(limit, offset)

    def list_my_quotations(self, seller_id: int) -> List[Quotation]:
        """Lista cotações de um vendedor"""
        return self.quotation_repo.get_by_seller_id(seller_id)

    def update_quotation(
        self, quotation_id: int, seller_id: int, payload: QuotationUpdate
    ) -> Quotation:
        """Atualiza uma cotação"""
        quotation = self.quotation_repo.get_by_id(quotation_id)
        if not quotation:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cotação não encontrada")

        if quotation.seller_id != seller_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, detail="Você não tem permissão para editar esta cotação"
            )

        # Atualiza campos
        update_data = payload.dict(exclude_unset=True)
        if "images" in update_data and update_data["images"]:
            update_data["images"] = json.dumps(update_data["images"])

        for field, value in update_data.items():
            setattr(quotation, field, value)

        return self.quotation_repo.update(quotation)

    def delete_quotation(self, quotation_id: int, seller_id: int) -> None:
        """Deleta uma cotação"""
        quotation = self.quotation_repo.get_by_id(quotation_id)
        if not quotation:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cotação não encontrada")

        if quotation.seller_id != seller_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, detail="Você não tem permissão para deletar esta cotação"
            )

        self.quotation_repo.delete(quotation)

    def get_relevant_quotations(self, buyer_id: int, limit: int = 100, offset: int = 0) -> List[Quotation]:
        """
        Retorna cotações relevantes para um comprador usando IA.
        
        Lógica:
        - 70% baseado em comportamento (interações do usuário)
        - 30% baseado em perfil (atividades, localização)
        - Ordena por score de relevância (maior primeiro)
        - 90% das cotações com score >= 90 aparecem primeiro
        - 10% das cotações com score 50-89 aparecem depois
        """
        user = self.user_repo.get_by_id(buyer_id)
        if not user:
            return []

        # Busca todas as cotações ativas
        all_quotations = self.quotation_repo.list_active(limit=1000, offset=0)
        
        if not all_quotations:
            return []

        # Calcula score para cada cotação usando IA
        quotations_with_scores = []
        for quotation in all_quotations:
            try:
                score = self.matching_service.calculate_relevance_score(buyer_id, quotation)
                quotations_with_scores.append({
                    "quotation": quotation,
                    "score": score
                })
            except Exception as e:
                # Em caso de erro, usa score mínimo
                print(f"Erro ao calcular score para cotação {quotation.id}: {e}")
                quotations_with_scores.append({
                    "quotation": quotation,
                    "score": 0.0
                })

        # Ordena por score (maior primeiro)
        quotations_with_scores.sort(key=lambda x: x["score"], reverse=True)

        # Separa: 90% acima (score >= 90) e resto (score < 90)
        high_relevance = [q for q in quotations_with_scores if q["score"] >= 90]
        medium_relevance = [q for q in quotations_with_scores if 50 <= q["score"] < 90]
        low_relevance = [q for q in quotations_with_scores if q["score"] < 50]

        # Combina: 90% relevantes primeiro, depois 10% menos relevantes
        # Limita a 90% de high_relevance + 10% de medium_relevance
        high_limit = int(limit * 0.9)
        medium_limit = limit - high_limit

        result = high_relevance[:high_limit] + medium_relevance[:medium_limit]
        
        # Remove scores muito baixos (menor que 50)
        # Score mínimo para aparecer na lista relevante
        result = [q for q in result if q["score"] >= 50]

        # Retorna apenas as cotações (sem score) para manter compatibilidade
        return [q["quotation"] for q in result[:limit]]

    def to_response(self, quotation: Quotation, include_seller: bool = True) -> QuotationResponse:
        """Converte Quotation para QuotationResponse"""
        images = None
        if quotation.images:
            try:
                images = json.loads(quotation.images)
            except:
                images = None

        seller_nickname = None
        if include_seller and quotation.seller:
            seller_nickname = quotation.seller.nickname

        return QuotationResponse(
            id=quotation.id,
            seller_id=quotation.seller_id,
            seller_type=quotation.seller_type,
            title=quotation.title,
            description=quotation.description,
            category=quotation.category,
            product_type=quotation.product_type,
            location_city=quotation.location_city,
            location_state=quotation.location_state,
            price=quotation.price,
            quantity=quotation.quantity,
            unit=quotation.unit,
            expires_at=quotation.expires_at,
            image_url=quotation.image_url,
            images=images,
            free_shipping=quotation.free_shipping,
            discount_percentage=quotation.discount_percentage,
            installments=quotation.installments,
            stock=quotation.stock,
            status=quotation.status,
            created_at=quotation.created_at,
            updated_at=quotation.updated_at,
            seller_nickname=seller_nickname,
        )

