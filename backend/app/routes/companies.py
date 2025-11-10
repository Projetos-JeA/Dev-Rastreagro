from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user, get_db, require_role
from app.schemas.auth import CompanyData
from app.schemas.company import CompanyResponse
from app.services.company_service import CompanyService
from app.models.user import UserRole

router = APIRouter(prefix="/companies", tags=["Companies"])


@router.post("", response_model=CompanyResponse, summary="Criar ou atualizar dados da empresa")
def create_or_update_company(
    payload: CompanyData,
    current_user=Depends(require_role(UserRole.SELLER.value)),
    db: Session = Depends(get_db),
):
    service = CompanyService(db)
    return service.create_or_update(current_user.id, payload)


@router.get("/{company_id}", response_model=CompanyResponse, summary="Obter empresa por ID")
def get_company(company_id: int, db: Session = Depends(get_db)):
    service = CompanyService(db)
    return service.get_by_id(company_id)
