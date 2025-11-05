"""
Authentication schemas
"""

from pydantic import BaseModel, EmailStr
from typing import Optional


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: int
    user_type: str


class TwoFactorRequest(BaseModel):
    email: EmailStr
    code: str


class TokenData(BaseModel):
    user_id: Optional[int] = None
    email: Optional[str] = None

