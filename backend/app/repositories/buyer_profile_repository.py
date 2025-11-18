"""Repository para operações com perfis de compradores"""

from sqlalchemy.orm import Session

from app.models.buyer_profile import BuyerProfile


class BuyerProfileRepository:
    """Repository para BuyerProfile"""

    def __init__(self, db: Session):
        self.db = db

    def create(self, buyer_profile: BuyerProfile) -> BuyerProfile:
        """Cria um novo perfil de comprador"""
        self.db.add(buyer_profile)
        self.db.commit()
        self.db.refresh(buyer_profile)
        return buyer_profile

    def get_by_user_id(self, user_id: int) -> BuyerProfile | None:
        """Busca perfil de comprador por user_id"""
        return self.db.query(BuyerProfile).filter(BuyerProfile.user_id == user_id).first()

