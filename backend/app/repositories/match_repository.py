"""Repository para gerenciar matches (Deu Agro)"""

from typing import List, Optional
from sqlalchemy.orm import Session

from app.models.match import Match, MatchStatus


class MatchRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, match: Match) -> Match:
        self.db.add(match)
        self.db.commit()
        self.db.refresh(match)
        return match

    def get_by_id(self, match_id: int) -> Optional[Match]:
        return self.db.query(Match).filter(Match.id == match_id).first()

    def get_by_buyer_id(self, buyer_id: int, status: Optional[MatchStatus] = None) -> List[Match]:
        query = self.db.query(Match).filter(Match.buyer_id == buyer_id)
        if status:
            query = query.filter(Match.status == status)
        return query.order_by(Match.created_at.desc()).all()

    def get_by_quotation_id(self, quotation_id: int) -> List[Match]:
        return (
            self.db.query(Match)
            .filter(Match.quotation_id == quotation_id)
            .order_by(Match.created_at.desc())
            .all()
        )

    def get_by_buyer_and_quotation(self, buyer_id: int, quotation_id: int) -> Optional[Match]:
        return (
            self.db.query(Match)
            .filter(
                Match.buyer_id == buyer_id,
                Match.quotation_id == quotation_id,
            )
            .first()
        )

    def update(self, match: Match) -> Match:
        self.db.commit()
        self.db.refresh(match)
        return match

    def delete(self, match: Match) -> None:
        self.db.delete(match)
        self.db.commit()

