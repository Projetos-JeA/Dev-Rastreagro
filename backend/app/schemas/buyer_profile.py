"""Esquemas Pydantic para perfil do comprador"""

from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel


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


class BuyerProfileResponse(BuyerProfileData):
    """Resposta com dados completos do perfil do comprador"""

    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

