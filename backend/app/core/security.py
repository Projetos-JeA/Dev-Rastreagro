from datetime import datetime, timedelta, timezone
from typing import Any, Optional

from jose import JWTError, jwt
from passlib.context import CryptContext

from app.core.config import get_settings


pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
settings = get_settings()


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)


def _create_token(data: dict[str, Any], expires_delta: timedelta, secret: str) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + expires_delta
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, secret, algorithm=settings.jwt_algorithm)


def create_access_token(subject: str, additional_claims: Optional[dict[str, Any]] = None) -> str:
    data = {"sub": subject}
    if additional_claims:
        data.update(additional_claims)
    expire_delta = timedelta(minutes=settings.jwt_access_token_expire_minutes)
    return _create_token(data, expire_delta, settings.jwt_secret_key)


def create_refresh_token(subject: str, additional_claims: Optional[dict[str, Any]] = None) -> str:
    data = {"sub": subject}
    if additional_claims:
        data.update(additional_claims)
    expire_delta = timedelta(minutes=settings.jwt_refresh_token_expire_minutes)
    return _create_token(data, expire_delta, settings.jwt_refresh_secret_key)


def decode_access_token(token: str) -> dict[str, Any]:
    try:
        return jwt.decode(token, settings.jwt_secret_key, algorithms=[settings.jwt_algorithm])
    except JWTError as exc:
        raise ValueError("Token inválido") from exc


def decode_refresh_token(token: str) -> dict[str, Any]:
    try:
        return jwt.decode(
            token, settings.jwt_refresh_secret_key, algorithms=[settings.jwt_algorithm]
        )
    except JWTError as exc:
        raise ValueError("Refresh token inválido") from exc
