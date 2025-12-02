"""Rotas para gerenciar cotações"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_db, get_current_user, get_active_role
from app.models.user import User
from app.schemas.quotation import (
    QuotationCreate,
    QuotationUpdate,
    QuotationResponse,
    QuotationWithScore,
)
from app.services.quotation_service import QuotationService

router = APIRouter(prefix="/quotations", tags=["Quotations"])


@router.post("", response_model=QuotationResponse, summary="Criar cotação")
def create_quotation(
    payload: QuotationCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Cria uma nova cotação"""
    service = QuotationService(db)
    quotation = service.create_quotation(current_user.id, payload)
    return service.to_response(quotation, include_seller=True)


@router.get("", response_model=List[QuotationResponse], summary="Listar cotações")
def list_quotations(
    category: Optional[str] = Query(None, description="Filtrar por categoria"),
    limit: int = Query(100, ge=1, le=100, description="Limite de resultados"),
    offset: int = Query(0, ge=0, description="Offset para paginação"),
    db: Session = Depends(get_db),
):
    """Lista cotações ativas"""
    service = QuotationService(db)
    quotations = service.list_quotations(category=category, limit=limit, offset=offset)
    return [service.to_response(q, include_seller=True) for q in quotations]


@router.get("/relevant", response_model=List[QuotationResponse], summary="Cotações relevantes para o comprador")
def get_relevant_quotations(
    current_user: User = Depends(get_current_user),
    active_role: str = Depends(get_active_role),
    limit: int = Query(100, ge=1, le=100, description="Limite de resultados"),
    offset: int = Query(0, ge=0, description="Offset para paginação"),
    db: Session = Depends(get_db),
):
    """
    Retorna cotações relevantes baseadas nas atividades do comprador.
    Usa o perfil ativo (active_role) para determinar qual perfil usar.
    Se o comprador também é produtor, usa as atividades cadastradas na empresa.
    Filtra apenas cotações de interesse (agricultura, pecuária, serviços relacionados).
    """
    # Só retorna cotações relevantes se o perfil ativo for 'buyer'
    if active_role != "buyer":
        # Se não for buyer, retorna lista vazia ou cotações próprias
        return []
    
    service = QuotationService(db)
    quotations = service.get_relevant_quotations(current_user.id, limit=limit, offset=offset)
    return [service.to_response(q, include_seller=True) for q in quotations]


@router.get("/my", response_model=List[QuotationResponse], summary="Minhas cotações")
def list_my_quotations(
    current_user: User = Depends(get_current_user),
    active_role: str = Depends(get_active_role),
    db: Session = Depends(get_db),
):
    """
    Lista cotações do usuário logado.
    Filtra baseado no perfil ativo (seller ou service_provider).
    """
    # Só retorna cotações próprias se o perfil ativo for 'seller' ou 'service_provider'
    if active_role not in ["seller", "service_provider"]:
        return []
    
    service = QuotationService(db)
    quotations = service.list_my_quotations(current_user.id)
    return [service.to_response(q, include_seller=True) for q in quotations]


@router.get("/{quotation_id}", response_model=QuotationResponse, summary="Detalhes da cotação")
def get_quotation(quotation_id: int, db: Session = Depends(get_db)):
    """Busca detalhes de uma cotação"""
    service = QuotationService(db)
    quotation = service.get_quotation(quotation_id)
    if not quotation:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cotação não encontrada")
    return service.to_response(quotation, include_seller=True)


@router.put("/{quotation_id}", response_model=QuotationResponse, summary="Atualizar cotação")
def update_quotation(
    quotation_id: int,
    payload: QuotationUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Atualiza uma cotação"""
    service = QuotationService(db)
    quotation = service.update_quotation(quotation_id, current_user.id, payload)
    return service.to_response(quotation, include_seller=True)


@router.delete("/{quotation_id}", summary="Deletar cotação")
def delete_quotation(
    quotation_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Deleta uma cotação"""
    service = QuotationService(db)
    service.delete_quotation(quotation_id, current_user.id)
    return {"message": "Cotação deletada com sucesso"}

