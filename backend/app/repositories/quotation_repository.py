"""Repository para gerenciar cotações"""

from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_

from app.models.quotation import Quotation, QuotationStatus


class QuotationRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, quotation: Quotation) -> Quotation:
        self.db.add(quotation)
        self.db.commit()
        self.db.refresh(quotation)
        return quotation

    def get_by_id(self, quotation_id: int) -> Optional[Quotation]:
        return self.db.query(Quotation).filter(Quotation.id == quotation_id).first()

    def get_by_seller_id(self, seller_id: int, status: Optional[QuotationStatus] = None) -> List[Quotation]:
        query = self.db.query(Quotation).filter(Quotation.seller_id == seller_id)
        if status:
            query = query.filter(Quotation.status == status)
        return query.order_by(Quotation.created_at.desc()).all()

    def list_active(self, limit: int = 100, offset: int = 0) -> List[Quotation]:
        return (
            self.db.query(Quotation)
            .filter(Quotation.status == QuotationStatus.ACTIVE)
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

