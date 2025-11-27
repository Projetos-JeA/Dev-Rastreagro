"""Service para gerenciar matches (Deu Agro)"""

from typing import List, Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.match import Match, MatchStatus
from app.models.quotation import Quotation, QuotationStatus
from app.repositories.match_repository import MatchRepository
from app.repositories.quotation_repository import QuotationRepository
from app.repositories.user_repository import UserRepository
from app.schemas.match import MatchCreate, MatchUpdate, MatchResponse
from app.schemas.quotation import QuotationResponse


class MatchService:
    def __init__(self, db: Session):
        self.db = db
        self.match_repo = MatchRepository(db)
        self.quotation_repo = QuotationRepository(db)
        self.user_repo = UserRepository(db)

    def create_match(self, buyer_id: int, payload: MatchCreate) -> Match:
        """Cria um match (Deu Agro)"""
        buyer = self.user_repo.get_by_id(buyer_id)
        if not buyer:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Comprador não encontrado")

        quotation = self.quotation_repo.get_by_id(payload.quotation_id)
        if not quotation:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cotação não encontrada")

        if quotation.status != QuotationStatus.ACTIVE:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail="Cotação não está ativa"
            )

        # Verifica se já existe match
        existing = self.match_repo.get_by_buyer_and_quotation(buyer_id, payload.quotation_id)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT, detail="Você já deu agro nesta cotação"
            )

        match = Match(
            quotation_id=payload.quotation_id,
            buyer_id=buyer_id,
            score=payload.score,
            status=MatchStatus.PENDING,
        )

        return self.match_repo.create(match)

    def get_match(self, match_id: int) -> Optional[Match]:
        """Busca um match por ID"""
        return self.match_repo.get_by_id(match_id)

    def list_my_matches(self, buyer_id: int, status: Optional[MatchStatus] = None) -> List[Match]:
        """Lista matches de um comprador"""
        return self.match_repo.get_by_buyer_id(buyer_id, status)

    def update_match(self, match_id: int, buyer_id: int, payload: MatchUpdate) -> Match:
        """Atualiza um match"""
        match = self.match_repo.get_by_id(match_id)
        if not match:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Match não encontrado")

        if match.buyer_id != buyer_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, detail="Você não tem permissão para editar este match"
            )

        if payload.status:
            match.status = payload.status

        return self.match_repo.update(match)

    def to_response(self, match: Match, include_quotation: bool = True) -> MatchResponse:
        """Converte Match para MatchResponse"""
        quotation_response = None
        if include_quotation and match.quotation:
            from app.services.quotation_service import QuotationService

            quotation_service = QuotationService(self.db)
            quotation_response = quotation_service.to_response(match.quotation, include_seller=True)

        return MatchResponse(
            id=match.id,
            quotation_id=match.quotation_id,
            buyer_id=match.buyer_id,
            score=match.score,
            status=match.status,
            created_at=match.created_at,
            updated_at=match.updated_at,
            quotation=quotation_response,
        )

