"""
Authentication routes
"""

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta

from app.database import get_db
from app.schemas.auth import LoginRequest, LoginResponse, TwoFactorRequest
from app.services.auth_service import (
    authenticate_user,
    create_access_token,
    verify_token,
    JWT_EXPIRATION_MINUTES
)

router = APIRouter()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/v1/auth/login")


@router.post("/login", response_model=LoginResponse)
async def login(
    login_data: LoginRequest,
    db: Session = Depends(get_db)
):
    """
    Login endpoint (mock)
    Returns JWT token for authenticated user
    """
    user = authenticate_user(db, login_data.email, login_data.password)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email ou senha incorretos",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Create access token
    access_token_expires = timedelta(minutes=JWT_EXPIRATION_MINUTES)
    access_token = create_access_token(
        data={"sub": user.id, "email": user.email, "tipo": user.tipo},
        expires_delta=access_token_expires
    )
    
    return LoginResponse(
        access_token=access_token,
        token_type="bearer",
        user_id=user.id,
        user_type=user.tipo
    )


@router.post("/login/2fa")
async def verify_two_factor(
    two_fa_data: TwoFactorRequest,
    db: Session = Depends(get_db)
):
    """
    Two-factor authentication verification (mock)
    """
    # Mock 2FA verification - em produção, validar código real
    if two_fa_data.code == "123456":
        # Mock user for 2FA
        user = authenticate_user(db, two_fa_data.email, "senha123")
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Usuário não encontrado"
            )
        
        access_token_expires = timedelta(minutes=JWT_EXPIRATION_MINUTES)
        access_token = create_access_token(
            data={"sub": user.id, "email": user.email, "tipo": user.tipo},
            expires_delta=access_token_expires
        )
        
        return LoginResponse(
            access_token=access_token,
            token_type="bearer",
            user_id=user.id,
            user_type=user.tipo
        )
    else:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Código 2FA inválido"
        )


@router.get("/me")
async def get_current_user(token: str = Depends(oauth2_scheme)):
    """
    Get current authenticated user
    """
    token_data = verify_token(token)
    if token_data is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return {
        "user_id": token_data.user_id,
        "email": token_data.email
    }

