from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr


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


class ServiceProviderResponse(ServiceProviderData):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
