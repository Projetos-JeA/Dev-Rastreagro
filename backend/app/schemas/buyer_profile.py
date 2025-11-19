"""Esquemas Pydantic para perfil do comprador"""

from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel, validator
from app.utils.validators import (
    validate_nome_completo,
    validate_cpf,
    validate_cep,
    format_cpf,
    format_cep,
)


class BuyerProfileData(BaseModel):
    """Dados do perfil do comprador para registro"""

    nome_completo: str
    data_nascimento: Optional[date] = None
    cpf: Optional[str] = None
    identidade: Optional[str] = None
    estado_civil: Optional[str] = None
    naturalidade: Optional[str] = None
    endereco: str
    cep: str
    cidade: str
    estado: str

    @validator("nome_completo")
    def validate_nome(cls, v):
        is_valid, error_msg = validate_nome_completo(v)
        if not is_valid:
            raise ValueError(error_msg)
        return v.strip()

    @validator("cpf")
    def validate_cpf_field(cls, v):
        if v:
            is_valid, error_msg = validate_cpf(v)
            if not is_valid:
                raise ValueError(error_msg)
            return format_cpf(v)
        return v

    @validator("cep")
    def validate_cep_field(cls, v):
        is_valid, error_msg = validate_cep(v)
        if not is_valid:
            raise ValueError(error_msg)
        return format_cep(v)

    @validator("estado")
    def validate_estado(cls, v):
        if v and len(v) != 2:
            raise ValueError("Estado deve ser a sigla com 2 letras (ex: SP, RJ)")
        return v.upper() if v else v


class BuyerProfileResponse(BuyerProfileData):
    """Resposta com dados completos do perfil do comprador"""

    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

