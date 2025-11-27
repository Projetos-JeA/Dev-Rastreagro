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
from app.schemas.quotation import QuotationCreate, QuotationUpdate, QuotationResponse, QuotationWithScore
import json


class QuotationService:
    def __init__(self, db: Session):
        self.db = db
        self.quotation_repo = QuotationRepository(db)
        self.user_repo = UserRepository(db)
        self.company_repo = CompanyRepository(db)

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
        Retorna cotações relevantes para um comprador baseado em suas atividades.
        Se o comprador também é produtor (tem company), usa as atividades da empresa.
        """
        user = self.user_repo.get_by_id(buyer_id)
        if not user:
            return []

        # Busca atividades do comprador (se for produtor)
        relevant_categories = set()
        
        # Se o usuário tem perfil de produtor (seller), busca atividades da empresa
        if user.role == UserRole.SELLER:
            company = self.company_repo.get_by_user_id(user.id)
            if company and company.activities:
                # Mapeia categorias de atividades para categorias de cotações
                for activity in company.activities:
                    if activity.category:
                        category_name = activity.category.name.lower()
                        # Mapeia categorias de atividades para categorias de cotações
                        if "pecuária" in category_name or "pecuaria" in category_name:
                            # Pecuária: mostra livestock, both, e também agriculture (ração, sal, sementes de pastagem)
                            relevant_categories.add(QuotationCategory.LIVESTOCK)
                            relevant_categories.add(QuotationCategory.BOTH)
                            relevant_categories.add(QuotationCategory.AGRICULTURE)  # Ração, sal mineral, sementes são úteis
                        elif "agricultura" in category_name:
                            # Agricultura: mostra agriculture, both, e também livestock (animais para trabalho)
                            relevant_categories.add(QuotationCategory.AGRICULTURE)
                            relevant_categories.add(QuotationCategory.BOTH)
                            relevant_categories.add(QuotationCategory.LIVESTOCK)  # Animais podem ser úteis
                        elif "integração" in category_name or "integracao" in category_name:
                            # Integração: mostra todas as categorias
                            relevant_categories.add(QuotationCategory.BOTH)
                            relevant_categories.add(QuotationCategory.AGRICULTURE)
                            relevant_categories.add(QuotationCategory.LIVESTOCK)
                            relevant_categories.add(QuotationCategory.SERVICE)  # Serviços também podem ser úteis
                        elif "serviço" in category_name or "servico" in category_name:
                            # Serviços: mostra service e both
                            relevant_categories.add(QuotationCategory.SERVICE)
                            relevant_categories.add(QuotationCategory.BOTH)

        # Se não encontrou atividades específicas, retorna todas (fallback)
        if not relevant_categories:
            return self.quotation_repo.list_active(limit, offset)

        # Filtra cotações por categorias relevantes
        quotations = (
            self.db.query(Quotation)
            .filter(
                and_(
                    Quotation.status == QuotationStatus.ACTIVE,
                    Quotation.category.in_(list(relevant_categories))
                )
            )
            .order_by(Quotation.created_at.desc())
            .limit(limit)
            .offset(offset)
            .all()
        )

        return quotations

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

