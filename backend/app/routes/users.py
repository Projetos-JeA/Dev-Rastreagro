from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user, get_db
from app.schemas.user import UserWithCompany, UserProfilesResponse
from app.services.user_service import UserService

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/me", response_model=UserWithCompany)
def get_me(current_user=Depends(get_current_user), db: Session = Depends(get_db)):
    service = UserService(db)
    return service.get_me(current_user.id)


@router.get("/profiles", response_model=UserProfilesResponse, summary="Listar perfis disponíveis")
def get_available_profiles(current_user=Depends(get_current_user), db: Session = Depends(get_db)):
    """Retorna os perfis disponíveis do usuário (buyer, seller, service_provider)"""
    service = UserService(db)
    return service.get_available_profiles(current_user.id)
