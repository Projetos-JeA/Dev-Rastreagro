"""Esquemas Pydantic utilizados na autenticação"""

from datetime import date
from typing import List, Literal, Optional

from pydantic import BaseModel, EmailStr, Field, validator

from app.schemas.service_provider import ServiceProviderData
from app.schemas.buyer_profile import BuyerProfileData
from app.utils.validators import validate_senha


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
    bairro: Optional[str] = None
    cep: str
    cidade: str
    estado: str
    email: EmailStr
    activities: List[CompanyActivitySelection]

    @validator("nome_propriedade")
    def validate_nome_propriedade(cls, v):
        from app.utils.validators import validate_nome_completo
        is_valid, error_msg = validate_nome_completo(v)
        if not is_valid:
            raise ValueError(error_msg)
        return v.strip()

    @validator("cnpj_cpf")
    def validate_cnpj_cpf(cls, v):
        from app.utils.validators import validate_cnpj, validate_cpf, format_cnpj, format_cpf
        # Tenta validar como CNPJ primeiro (14 dígitos), depois CPF (11 dígitos)
        import re
        clean = re.sub(r'[^0-9]', '', v)
        if len(clean) == 14:
            is_valid, error_msg = validate_cnpj(v)
            if not is_valid:
                raise ValueError(error_msg)
            return format_cnpj(v)
        elif len(clean) == 11:
            is_valid, error_msg = validate_cpf(v)
            if not is_valid:
                raise ValueError(error_msg)
            return format_cpf(v)
        else:
            raise ValueError("CNPJ/CPF deve conter 11 (CPF) ou 14 (CNPJ) dígitos")

    @validator("cep")
    def validate_cep(cls, v):
        from app.utils.validators import validate_cep, format_cep
        is_valid, error_msg = validate_cep(v)
        if not is_valid:
            raise ValueError(error_msg)
        return format_cep(v)

    @validator("estado")
    def validate_estado(cls, v):
        if v and len(v) != 2:
            raise ValueError("Estado deve ser a sigla com 2 letras (ex: SP, RJ)")
        return v.upper() if v else v

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

    @validator("password")
    def validate_password(cls, v):
        is_valid, errors = validate_senha(v)
        if not is_valid:
            # Retorna o primeiro erro para manter compatibilidade
            # Os erros completos serão retornados pelo exception handler
            raise ValueError(errors[0] if errors else "Senha inválida")
        return v

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


class CheckAvailabilityRequest(BaseModel):
    email: Optional[str] = None
    cpf: Optional[str] = None
    cnpj: Optional[str] = None


class CheckAvailabilityResponse(BaseModel):
    email_available: Optional[bool] = None
    cpf_available: Optional[bool] = None
    cnpj_available: Optional[bool] = None


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

    @validator("new_password")
    def validate_password(cls, v):
        is_valid, error_msg = validate_senha(v)
        if not is_valid:
            raise ValueError(error_msg)
        return v
