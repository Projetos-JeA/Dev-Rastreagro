"""Repository para interações do usuário"""

from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import and_, desc

from app.models.user_interaction import UserInteraction, InteractionType
from app.models.quotation import Quotation


class UserInteractionRepository:
    def __init__(self, db: Session):
        self.db = db
        self.model = UserInteraction

    def create(self, interaction: UserInteraction) -> UserInteraction:
        """Cria uma nova interação"""
        self.db.add(interaction)
        self.db.commit()
        self.db.refresh(interaction)
        return interaction

    def get_by_user_id(self, user_id: int, limit: int = 100) -> List[UserInteraction]:
        """Busca interações de um usuário"""
        return (
            self.db.query(UserInteraction)
            .filter(UserInteraction.user_id == user_id)
            .order_by(desc(UserInteraction.created_at))
            .limit(limit)
            .all()
        )

    def get_by_quotation_id(self, quotation_id: int) -> List[UserInteraction]:
        """Busca interações de uma cotação"""
        return (
            self.db.query(UserInteraction)
            .filter(UserInteraction.quotation_id == quotation_id)
            .all()
        )

    def get_positive_interactions(
        self, user_id: int, interaction_types: List[InteractionType] = None
    ) -> List[UserInteraction]:
        """Busca interações positivas (favoritos, aceitos, compras)"""
        if interaction_types is None:
            interaction_types = [
                InteractionType.FAVORITE,
                InteractionType.ACCEPTED,
                InteractionType.PURCHASED,
                InteractionType.VIEW,
            ]
        
        return (
            self.db.query(UserInteraction)
            .filter(
                and_(
                    UserInteraction.user_id == user_id,
                    UserInteraction.interaction_type.in_(interaction_types)
                )
            )
            .order_by(desc(UserInteraction.created_at))
            .all()
        )

    def has_interaction(
        self, user_id: int, quotation_id: int, interaction_type: InteractionType
    ) -> bool:
        """Verifica se usuário já teve esse tipo de interação com a cotação"""
        return (
            self.db.query(UserInteraction)
            .filter(
                and_(
                    UserInteraction.user_id == user_id,
                    UserInteraction.quotation_id == quotation_id,
                    UserInteraction.interaction_type == interaction_type
                )
            )
            .first()
            is not None
        )

