"""Repository para gerenciar cotações"""

from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_

from app.models.quotation import Quotation, QuotationStatus


class QuotationRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, quotation: Quotation) -> Quotation:
        import logging
        logger = logging.getLogger(__name__)
        
        logger.info(f"💾 Salvando cotação no banco: {quotation.title}")
        self.db.add(quotation)
        self.db.commit()
        self.db.refresh(quotation)
        logger.info(f"✅ Cotação salva com ID: {quotation.id}")
        return quotation

    def get_by_id(self, quotation_id: int) -> Optional[Quotation]:
        return self.db.query(Quotation).filter(Quotation.id == quotation_id).first()

    def get_by_seller_id(self, seller_id: int, status: Optional[QuotationStatus] = None) -> List[Quotation]:
        """Busca ofertas criadas por um vendedor"""
        import logging
        from app.models.quotation import QuotationType
        
        logger = logging.getLogger(__name__)
        
        logger.info(f"🔍 Buscando ofertas do vendedor {seller_id}, status={status}")
        query = self.db.query(Quotation).filter(
            and_(
                Quotation.seller_id == seller_id,
                Quotation.type == QuotationType.OFFER.value  # Compara com string
            )
        )
        if status:
            query = query.filter(Quotation.status == status)
        quotations = query.order_by(Quotation.created_at.desc()).all()
        logger.info(f"✅ Encontradas {len(quotations)} ofertas para o vendedor {seller_id}")
        return quotations

    def get_by_buyer_id(self, buyer_id: int, status: Optional[QuotationStatus] = None) -> List[Quotation]:
        """Busca cotações criadas por um comprador"""
        import logging
        from app.models.quotation import QuotationType
        
        logger = logging.getLogger(__name__)
        
        logger.info(f"🔍 Buscando cotações do comprador {buyer_id}, status={status}")
        query = self.db.query(Quotation).filter(
            and_(
                Quotation.buyer_id == buyer_id,
                Quotation.type == QuotationType.QUOTATION.value  # Compara com string
            )
        )
        if status:
            query = query.filter(Quotation.status == status)
        quotations = query.order_by(Quotation.created_at.desc()).all()
        logger.info(f"✅ Encontradas {len(quotations)} cotações para o comprador {buyer_id}")
        return quotations

    def list_active(self, limit: int = 100, offset: int = 0, quotation_type: Optional[str] = None) -> List[Quotation]:
        """
        Lista cotações/ofertas ativas
        
        Args:
            limit: Limite de resultados
            offset: Offset para paginação
            quotation_type: "offer" para ofertas, "quotation" para cotações, None para ambos
        """
        from app.models.quotation import QuotationType
        
        query = self.db.query(Quotation).filter(Quotation.status == QuotationStatus.ACTIVE)
        
        if quotation_type == "offer":
            query = query.filter(Quotation.type == QuotationType.OFFER.value)  # Compara com string
        elif quotation_type == "quotation":
            query = query.filter(Quotation.type == QuotationType.QUOTATION.value)  # Compara com string
        
        return (
            query
            .order_by(Quotation.created_at.desc())
            .limit(limit)
            .offset(offset)
            .all()
        )

    def list_by_category(
        self, category: str, limit: int = 100, offset: int = 0
    ) -> List[Quotation]:
        return (
            self.db.query(Quotation)
            .filter(
                and_(
                    Quotation.status == QuotationStatus.ACTIVE,
                    Quotation.category == category,
                )
            )
            .order_by(Quotation.created_at.desc())
            .limit(limit)
            .offset(offset)
            .all()
        )

    def update(self, quotation: Quotation) -> Quotation:
        self.db.commit()
        self.db.refresh(quotation)
        return quotation

    def delete(self, quotation: Quotation) -> None:
        self.db.delete(quotation)
        self.db.commit()

