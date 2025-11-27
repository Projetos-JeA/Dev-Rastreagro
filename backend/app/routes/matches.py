"""Rotas para gerenciar matches (Deu Agro)"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_db, get_current_user
from app.models.user import User
from app.models.match import MatchStatus
from app.schemas.match import MatchCreate, MatchUpdate, MatchResponse
from app.services.match_service import MatchService

router = APIRouter(prefix="/matches", tags=["Matches"])


@router.post("", response_model=MatchResponse, summary="Criar match (Deu Agro)")
def create_match(
    payload: MatchCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Cria um match (Deu Agro) - comprador demonstra interesse em uma cotação"""
    service = MatchService(db)
    match = service.create_match(current_user.id, payload)
    return service.to_response(match, include_quotation=True)


@router.get("/my", response_model=List[MatchResponse], summary="Meus matches")
def list_my_matches(
    status_filter: Optional[MatchStatus] = Query(None, alias="status", description="Filtrar por status"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Lista matches do usuário logado"""
    service = MatchService(db)
    matches = service.list_my_matches(current_user.id, status_filter)
    return [service.to_response(m, include_quotation=True) for m in matches]


@router.get("/{match_id}", response_model=MatchResponse, summary="Detalhes do match")
def get_match(match_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Busca detalhes de um match"""
    service = MatchService(db)
    match = service.get_match(match_id)
    if not match:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Match não encontrado")
    return service.to_response(match, include_quotation=True)


@router.put("/{match_id}", response_model=MatchResponse, summary="Atualizar match")
def update_match(
    match_id: int,
    payload: MatchUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Atualiza um match (ex: aceitar, rejeitar)"""
    service = MatchService(db)
    match = service.update_match(match_id, current_user.id, payload)
    return service.to_response(match, include_quotation=True)

