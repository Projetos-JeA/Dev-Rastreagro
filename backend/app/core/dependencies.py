from typing import Generator, Union, Optional

from fastapi import Depends, HTTPException, Header, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.security import decode_access_token
from app.database import SessionLocal
from app.models.user import UserRole, User
from app.repositories.user_repository import UserRepository

settings = get_settings()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    try:
        payload = decode_access_token(token)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(exc),
            headers={"WWW-Authenticate": "Bearer"},
        ) from exc

    user_id = payload.get("sub")
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido",
            headers={"WWW-Authenticate": "Bearer"},
        )

    repository = UserRepository(db)
    user = repository.get_by_id(int(user_id))
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuário não encontrado")
    return user


def get_active_role(
    current_user: User = Depends(get_current_user),
    x_active_role: Optional[str] = Header(None, alias="X-Active-Role"),
    db: Session = Depends(get_db),
) -> str:
    """
    Retorna o perfil ativo do usuário.
    
    Prioridade:
    1. Header X-Active-Role (se fornecido e válido)
    2. current_user.role (perfil principal)
    
    Args:
        current_user: Usuário autenticado
        x_active_role: Perfil ativo enviado pelo frontend via header
        db: Sessão do banco de dados
        
    Returns:
        String com o perfil ativo: 'buyer', 'seller' ou 'service_provider'
    """
    # Se header foi fornecido, valida e usa
    if x_active_role:
        # Valida se é um role válido
        valid_roles = ["buyer", "seller", "service_provider"]
        active_role_lower = x_active_role.lower()
        
        if active_role_lower in valid_roles:
            # Verifica se o usuário realmente tem esse perfil
            has_profile = False
            
            if active_role_lower == "buyer":
                # Verifica se tem buyer_profile
                from app.repositories.buyer_profile_repository import BuyerProfileRepository
                buyer_repo = BuyerProfileRepository(db)
                has_profile = buyer_repo.get_by_user_id(current_user.id) is not None
                
            elif active_role_lower == "seller":
                # Verifica se tem company
                from app.repositories.company_repository import CompanyRepository
                company_repo = CompanyRepository(db)
                has_profile = company_repo.get_by_user_id(current_user.id) is not None
                
            elif active_role_lower == "service_provider":
                # Verifica se tem service_provider
                from app.repositories.service_provider_repository import ServiceProviderRepository
                service_repo = ServiceProviderRepository(db)
                has_profile = service_repo.get_by_user_id(current_user.id) is not None
            
            if has_profile:
                return active_role_lower
    
    # Fallback: usa perfil principal
    if isinstance(current_user.role, UserRole):
        return current_user.role.value
    return current_user.role


def require_role(required_role: Union[str, UserRole]):
    required_value = required_role.value if isinstance(required_role, UserRole) else required_role

    def _role_dependency(current_user=Depends(get_current_user)):
        current_value = (
            current_user.role.value
            if isinstance(current_user.role, UserRole)
            else current_user.role
        )
        if current_value != required_value:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Acesso negado")
        return current_user

    return _role_dependency
