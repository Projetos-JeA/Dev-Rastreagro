"""Repository para PasswordResetToken"""

from datetime import datetime
from typing import Optional

from sqlalchemy.orm import Session

from app.models.password_reset_token import PasswordResetToken


class PasswordResetTokenRepository:
    """Repository para PasswordResetToken"""

    def __init__(self, db: Session):
        self.db = db

    def create(self, token: PasswordResetToken) -> PasswordResetToken:
        """Cria um novo token de recuperação de senha"""
        self.db.add(token)
        self.db.commit()
        self.db.refresh(token)
        return token

    def get_by_token(self, token: str) -> Optional[PasswordResetToken]:
        """Busca token por valor do token"""
        return (
            self.db.query(PasswordResetToken)
            .filter(PasswordResetToken.token == token)
            .first()
        )

    def get_by_user_id(self, user_id: int) -> Optional[PasswordResetToken]:
        """Busca token por user_id"""
        return (
            self.db.query(PasswordResetToken)
            .filter(PasswordResetToken.user_id == user_id)
            .first()
        )

    def delete(self, token: PasswordResetToken) -> None:
        """Deleta um token"""
        self.db.delete(token)
        self.db.commit()

    def delete_expired(self) -> int:
        """Deleta tokens expirados. Retorna quantidade deletada"""
        count = (
            self.db.query(PasswordResetToken)
            .filter(PasswordResetToken.expires_at < datetime.utcnow())
            .delete()
        )
        self.db.commit()
        return count

