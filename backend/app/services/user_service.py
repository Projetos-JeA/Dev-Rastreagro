from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.repositories.user_repository import UserRepository
from app.repositories.company_repository import CompanyRepository
from app.repositories.service_provider_repository import ServiceProviderRepository
from app.schemas.user import UserWithCompany
from app.models.user import UserRole


class UserService:
    def __init__(self, db: Session):
        self.user_repo = UserRepository(db)
        self.company_repo = CompanyRepository(db)
        self.service_repo = ServiceProviderRepository(db)

    def get_me(self, user_id: int) -> UserWithCompany:
        user = self.user_repo.get_by_id(user_id)
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuário não encontrado")

        company = None
        service_profile = None

        if user.role.value == UserRole.SELLER.value:
            company = self.company_repo.get_by_user_id(user.id)
        elif user.role.value == UserRole.SERVICE_PROVIDER.value:
            service_profile = self.service_repo.get_by_user_id(user.id)

        data = {
            "id": user.id,
            "email": user.email,
            "role": user.role,
            "nickname": user.nickname,
            "created_at": user.created_at,
            "updated_at": user.updated_at,
            "company": company,
            "service_profile": service_profile,
        }

        return UserWithCompany.model_validate(data)
