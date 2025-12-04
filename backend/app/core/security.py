from datetime import datetime, timedelta, timezone
from typing import Any, Optional

from jose import JWTError, jwt
import bcrypt

from app.core.config import get_settings


settings = get_settings()


def verify_password(plain_password: str, hashed_password: str) -> bool:
    password_bytes = plain_password.encode('utf-8')
    hashed_bytes = hashed_password.encode('utf-8')
    return bcrypt.checkpw(password_bytes, hashed_bytes)


def get_password_hash(password: str) -> str:
    password_bytes = password.encode('utf-8')
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password_bytes, salt)
    return hashed.decode('utf-8')


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
