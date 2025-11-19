"""Repository para tokens de verificação de email"""

from datetime import datetime
from typing import Optional
from sqlalchemy.orm import Session

from app.models.email_verification_token import EmailVerificationToken


class EmailVerificationRepository:
    """Repository para EmailVerificationToken"""

    def __init__(self, db: Session):
        self.db = db

    def create(self, token: EmailVerificationToken) -> EmailVerificationToken:
        """Cria um novo token de verificação"""
        self.db.add(token)
        self.db.commit()
        self.db.refresh(token)
        return token

    def get_by_token(self, token: str) -> Optional[EmailVerificationToken]:
        """Busca token por valor do token"""
        return (
            self.db.query(EmailVerificationToken)
            .filter(EmailVerificationToken.token == token)
            .first()
        )

    def get_by_user_id(self, user_id: int) -> Optional[EmailVerificationToken]:
        """Busca token por user_id"""
        return (
            self.db.query(EmailVerificationToken)
            .filter(EmailVerificationToken.user_id == user_id)
            .first()
        )

    def delete(self, token: EmailVerificationToken) -> None:
        """Remove um token"""
        self.db.delete(token)
        self.db.commit()

    def delete_expired_tokens(self) -> int:
        """Remove tokens expirados e retorna quantidade removida"""
        count = (
            self.db.query(EmailVerificationToken)
            .filter(EmailVerificationToken.expires_at < datetime.utcnow())
            .delete()
        )
        self.db.commit()
        return count

