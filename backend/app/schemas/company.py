from datetime import date, datetime
from typing import List, Optional

from pydantic import BaseModel, EmailStr


class ActivityCategoryResponse(BaseModel):
    id: int
    name: str

    class Config:
        from_attributes = True


class ActivityGroupResponse(BaseModel):
    id: int
    name: str
    category_id: int

    class Config:
        from_attributes = True


class ActivityItemResponse(BaseModel):
    id: int
    name: str
    group_id: int

    class Config:
        from_attributes = True


class CompanyActivityResponse(BaseModel):
    category: ActivityCategoryResponse
    group: Optional[ActivityGroupResponse] = None
    item: Optional[ActivityItemResponse] = None

    class Config:
        from_attributes = True


class CompanyBase(BaseModel):
    id: int
    user_id: int
    nome_propriedade: str
    inicio_atividades: Optional[date]
    ramo_atividade: Optional[str]
    cnaes: Optional[str]
    cnpj_cpf: str
    insc_est_identidade: Optional[str]
    endereco: str
    cep: str
    cidade: str
    estado: str
    email: EmailStr
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class CompanyResponse(CompanyBase):
    activities: List[CompanyActivityResponse] = []
