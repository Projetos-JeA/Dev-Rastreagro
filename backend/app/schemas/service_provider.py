from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, validator
from app.utils.validators import (
    validate_cnpj,
    validate_cpf,
    validate_cep,
    format_cnpj,
    format_cpf,
    format_cep,
)


class ServiceProviderData(BaseModel):
    nome_servico: str
    descricao: Optional[str] = None
    telefone: Optional[str] = None
    email_contato: EmailStr
    cidade: str
    estado: str
    tipo_servico: Optional[str] = None
    endereco: Optional[str] = None
    cep: Optional[str] = None
    cnpj_cpf: Optional[str] = None
    insc_est_identidade: Optional[str] = None

    @validator("cnpj_cpf")
    def validate_cnpj_cpf(cls, v):
        if v:
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
        return v

    @validator("cep")
    def validate_cep_field(cls, v):
        if v:
            is_valid, error_msg = validate_cep(v)
            if not is_valid:
                raise ValueError(error_msg)
            return format_cep(v)
        return v

    @validator("estado")
    def validate_estado(cls, v):
        if v and len(v) != 2:
            raise ValueError("Estado deve ser a sigla com 2 letras (ex: SP, RJ)")
        return v.upper() if v else v


class ServiceProviderResponse(ServiceProviderData):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
