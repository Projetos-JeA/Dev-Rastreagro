"""Rotas para rastrear interações do usuário com cotações"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user, get_db
from app.models.user import User
from app.models.user_interaction import UserInteraction, InteractionType
from app.repositories.user_interaction_repository import UserInteractionRepository
from app.repositories.quotation_repository import QuotationRepository

router = APIRouter(prefix="/interactions", tags=["Interactions"])


@router.post("/track", summary="Rastrear interação do usuário")
def track_interaction(
    quotation_id: int,
    interaction_type: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Rastreia uma interação do usuário com uma cotação.
    
    Tipos de interação:
    - view: Visualizou detalhes
    - favorite: Favoritou
    - click: Clicou no card
    - accepted: Aceitou match
    - rejected: Rejeitou match
    - purchased: Comprou
    """
    # Valida tipo de interação
    try:
        interaction_enum = InteractionType(interaction_type.lower())
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Tipo de interação inválido: {interaction_type}. Use: view, favorite, click, accepted, rejected, purchased"
        )
    
    # Verifica se cotação existe
    quotation_repo = QuotationRepository(db)
    quotation = quotation_repo.get_by_id(quotation_id)
    if not quotation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cotação não encontrada"
        )
    
    # Verifica se já existe essa interação (evita duplicatas)
    interaction_repo = UserInteractionRepository(db)
    if interaction_repo.has_interaction(current_user.id, quotation_id, interaction_enum):
        return {"message": "Interação já registrada", "quotation_id": quotation_id, "interaction_type": interaction_type}
    
    # Cria nova interação
    interaction = UserInteraction(
        user_id=current_user.id,
        quotation_id=quotation_id,
        interaction_type=interaction_enum
    )
    
    interaction_repo.create(interaction)
    
    return {
        "message": "Interação registrada com sucesso",
        "quotation_id": quotation_id,
        "interaction_type": interaction_type
    }

