"""Schemas Pydantic para usuários"""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel

from app.models.user import UserRole


class UserBase(BaseModel):
    email: str
    role: UserRole
    nickname: Optional[str] = None


class UserWithCompany(UserBase):
    id: int
    created_at: datetime
    updated_at: datetime
    company: Optional[dict] = None
    service_profile: Optional[dict] = None
    buyer_profile: Optional[dict] = None
    roles: Optional[list[str]] = None  # Array de perfis disponíveis (buyer, seller, service_provider)


class UserProfilesResponse(BaseModel):
    """Resposta com perfis disponíveis do usuário"""
    current_role: UserRole
    available_profiles: list[dict]  # Lista de perfis disponíveis
    # Exemplo: [{"role": "buyer", "has_profile": true}, {"role": "seller", "has_profile": true}]
