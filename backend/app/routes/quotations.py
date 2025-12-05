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


@router.post("", response_model=QuotationResponse, summary="Criar cotação ou oferta")
def create_quotation(
    payload: QuotationCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Cria uma nova cotação ou oferta
    
    - OFERTA (offer): Todos podem criar - produto/serviço à venda
    - COTAÇÃO (quotation): Apenas compradores podem criar - o que estão procurando
    """
    import logging
    logger = logging.getLogger(__name__)
    
    quotation_type = payload.quotation_type or "offer"
    logger.info(f"📥 Recebida requisição para criar {quotation_type} do usuário {current_user.id} ({current_user.email})")
    logger.info(f"📋 Título: {payload.title}, Categoria: {payload.category}")
    
    service = QuotationService(db)
    quotation = service.create_quotation(current_user.id, payload, quotation_type=quotation_type)
    
    response = service.to_response(quotation, include_seller=True)
    logger.info(f"✅ {quotation_type.capitalize()} criada e retornada. ID: {response.id}")
    
    return response


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


@router.get("/relevant", response_model=List[QuotationResponse], summary="Ofertas relevantes para o comprador")
def get_relevant_quotations(
    current_user: User = Depends(get_current_user),
    active_role: str = Depends(get_active_role),
    limit: int = Query(100, ge=1, le=100, description="Limite de resultados"),
    offset: int = Query(0, ge=0, description="Offset para paginação"),
    db: Session = Depends(get_db),
):
    """
    Retorna matches relevantes usando IA.
    
    LÓGICA:
    - Se o usuário tem COTAÇÕES: mostra OFERTAS relevantes (o que ele está procurando)
    - Se o usuário tem OFERTAS: mostra COTAÇÕES relevantes (quem está procurando o que ele oferece)
    - Considera perfil do usuário (atividades, localização)
    - Considera interações do usuário (histórico de cliques, favoritos)
    
    Score:
    - 50% match direto: oferta vs cotações (ou cotação vs ofertas)
    - 30% interações: histórico de cliques/favoritos
    - 20% perfil: atividades, localização
    """
    service = QuotationService(db)
    # Retorna matches relevantes baseados no perfil do usuário
    matches = service.get_relevant_quotations(current_user.id, limit=limit, offset=offset)
    return [service.to_response(q, include_seller=True) for q in matches]


@router.get("/my", response_model=List[QuotationResponse], summary="Minhas cotações")
def list_my_quotations(
    current_user: User = Depends(get_current_user),
    active_role: str = Depends(get_active_role),
    db: Session = Depends(get_db),
):
    """
    Lista cotações e ofertas do usuário logado.
    
    Retorna:
    - OFERTAS criadas pelo usuário (se for seller/service_provider)
    - COTAÇÕES criadas pelo usuário (se for buyer)
    """
    import logging
    logger = logging.getLogger(__name__)
    
    logger.info(f"📥 Requisição para listar cotações/ofertas do usuário {current_user.id} ({current_user.email})")
    logger.info(f"👤 Perfil ativo: {active_role}")
    
    # Todos os perfis podem listar suas cotações/ofertas
    service = QuotationService(db)
    quotations = service.list_my_quotations(current_user.id)
    
    logger.info(f"📊 Encontradas {len(quotations)} cotações/ofertas no banco para o usuário {current_user.id}")
    for q in quotations:
        logger.info(f"   • ID: {q.id}, Título: {q.title}, Type: {q.type}, Seller: {q.seller_id}, Buyer: {q.buyer_id}")
    
    response = [service.to_response(q, include_seller=True) for q in quotations]
    logger.info(f"✅ Retornando {len(response)} cotações/ofertas serializadas para o usuário {current_user.id}")
    
    # Log detalhado da resposta
    for r in response:
        logger.info(f"   • Response ID: {r.id}, Type: {r.type}, Title: {r.title}")
    
    return response


@router.get("/{quotation_id}", response_model=QuotationResponse, summary="Detalhes da cotação")
def get_quotation(quotation_id: int, db: Session = Depends(get_db)):
    """Busca detalhes de uma cotação"""
    service = QuotationService(db)
    quotation = service.get_quotation(quotation_id)
    if not quotation:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cotação não encontrada")
    return service.to_response(quotation, include_seller=True)


@router.put("/{quotation_id}", response_model=QuotationResponse, summary="Atualizar cotação ou oferta")
def update_quotation(
    quotation_id: int,
    payload: QuotationUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Atualiza uma cotação ou oferta.
    Valida se o usuário é o dono (seller_id para ofertas, buyer_id para cotações).
    """
    service = QuotationService(db)
    quotation = service.update_quotation(quotation_id, current_user.id, payload)
    return service.to_response(quotation, include_seller=True)


@router.delete("/{quotation_id}", summary="Deletar cotação ou oferta")
def delete_quotation(
    quotation_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Deleta uma cotação ou oferta.
    Valida se o usuário é o dono (seller_id para ofertas, buyer_id para cotações).
    """
    service = QuotationService(db)
    service.delete_quotation(quotation_id, current_user.id)
    return {"message": "Cotação/oferta deletada com sucesso"}

