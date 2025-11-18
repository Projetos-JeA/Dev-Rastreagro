"""Esquemas Pydantic utilizados na autenticação"""

from datetime import date
from typing import List, Literal, Optional

from pydantic import BaseModel, EmailStr, Field, validator

from app.schemas.service_provider import ServiceProviderData
from app.schemas.buyer_profile import BuyerProfileData


class CompanyActivitySelection(BaseModel):
    category_id: int = Field(..., gt=0)
    group_id: Optional[int] = Field(default=None, gt=0)
    item_id: Optional[int] = Field(default=None, gt=0)


class CompanyData(BaseModel):
    nome_propriedade: str
    inicio_atividades: Optional[date] = None
    ramo_atividade: Optional[str] = None
    cnaes: Optional[str] = None
    cnpj_cpf: str
    insc_est_identidade: Optional[str] = None
    endereco: str
    cep: str
    cidade: str
    estado: str
    email: EmailStr
    activities: List[CompanyActivitySelection]

    @validator("activities")
    def validate_activities(cls, value):
        if not value:
            raise ValueError("Selecione pelo menos uma atividade")
        return value


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8)
    role: Literal["buyer", "seller", "service_provider"]
    nickname: Optional[str] = None
    company: Optional[CompanyData] = None
    service_provider: Optional[ServiceProviderData] = None
    buyer_profile: Optional[BuyerProfileData] = None

    @validator("nickname")
    def validate_nickname(cls, value, values):
        role = values.get("role")
        if role == "buyer" and not value:
            raise ValueError("Apelido é obrigatório para compradores")
        return value

    @validator("company")
    def validate_company(cls, value, values):
        role = values.get("role")
        if role == "seller" and value is None:
            raise ValueError("Dados da empresa são obrigatórios para vendedores")
        return value

    @validator("service_provider")
    def validate_service_provider(cls, value, values):
        role = values.get("role")
        if role == "service_provider" and value is None:
            raise ValueError("Dados do prestador são obrigatórios")
        return value

    @validator("buyer_profile")
    def validate_buyer_profile(cls, value, values):
        role = values.get("role")
        if role == "buyer" and value is None:
            raise ValueError("Dados pessoais são obrigatórios para compradores")
        return value


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenPair(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class RefreshRequest(BaseModel):
    refresh_token: str
