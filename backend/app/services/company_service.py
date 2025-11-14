from typing import List

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.company import Company, CompanyActivity
from app.repositories.company_repository import CompanyRepository
from app.repositories.activity_repository import ActivityRepository
from app.schemas.company import CompanyResponse
from app.schemas.auth import CompanyData


class CompanyService:
    def __init__(self, db: Session):
        self.db = db
        self.company_repo = CompanyRepository(db)
        self.activity_repo = ActivityRepository(db)

    def _build_activities(self, activities_data) -> List[CompanyActivity]:
        activities: List[CompanyActivity] = []
        for selection in activities_data:
            if selection.group_id:
                groups = self.activity_repo.list_groups(selection.category_id)
                if selection.group_id not in {g.id for g in groups}:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST, detail="Grupo inválido"
                    )
            if selection.item_id:
                if not selection.group_id:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST, detail="Item sem grupo"
                    )
                items = self.activity_repo.list_items(selection.group_id)
                if selection.item_id not in {i.id for i in items}:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST, detail="Item inválido"
                    )
            activities.append(
                CompanyActivity(
                    category_id=selection.category_id,
                    group_id=selection.group_id,
                    item_id=selection.item_id,
                )
            )
        return activities

    def create_or_update(self, user_id: int, data: CompanyData) -> CompanyResponse:
        company = self.company_repo.get_by_user_id(user_id)
        activities = self._build_activities(data.activities)

        company_payload = {
            "nome_propriedade": data.nome_propriedade,
            "inicio_atividades": data.inicio_atividades,
            "ramo_atividade": data.ramo_atividade,
            "cnaes": data.cnaes,
            "cnpj_cpf": data.cnpj_cpf,
            "insc_est_identidade": data.insc_est_identidade,
            "endereco": data.endereco,
            "cep": data.cep,
            "cidade": data.cidade,
            "estado": data.estado,
            "email": data.email,
        }

        if company:
            company = self.company_repo.update(company, company_payload, activities)
        else:
            company_model = Company(user_id=user_id, **company_payload)
            company = self.company_repo.create(company_model, activities)

        return CompanyResponse.model_validate(company)

    def get_by_id(self, company_id: int) -> CompanyResponse:
        company = self.company_repo.get_by_id(company_id)
        if not company:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Empresa não encontrada"
            )
        return CompanyResponse.model_validate(company)
