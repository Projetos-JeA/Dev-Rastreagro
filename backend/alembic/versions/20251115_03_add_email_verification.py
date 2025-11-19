"""Adiciona verificação de email e tokens de verificação"""

from alembic import op
import sqlalchemy as sa
from datetime import datetime

# revision identifiers, used by Alembic.
revision = "20251115_03_email_verify"
down_revision = "20251115_02_update_sp"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Adiciona campo email_verificado na tabela users
    op.add_column("users", sa.Column("email_verificado", sa.Boolean, nullable=False, server_default="0"))
    
    # Cria tabela para tokens de verificação de email
    op.create_table(
        "email_verification_tokens",
        sa.Column("id", sa.BigInteger, primary_key=True),
        sa.Column(
            "user_id",
            sa.BigInteger,
            sa.ForeignKey("users.id", ondelete="CASCADE"),
            nullable=False,
            unique=True,
        ),
        sa.Column("token", sa.String(length=255), nullable=False, unique=True),
        sa.Column(
            "expires_at", sa.DateTime, nullable=False
        ),
        sa.Column(
            "created_at", sa.DateTime, nullable=False, server_default=sa.text("SYSUTCDATETIME()")
        ),
    )
    
    op.create_index(
        op.f("ix_email_verification_tokens_user_id"), "email_verification_tokens", ["user_id"], unique=True
    )
    op.create_index(
        op.f("ix_email_verification_tokens_token"), "email_verification_tokens", ["token"], unique=True
    )


def downgrade() -> None:
    op.drop_index(op.f("ix_email_verification_tokens_token"), table_name="email_verification_tokens")
    op.drop_index(op.f("ix_email_verification_tokens_user_id"), table_name="email_verification_tokens")
    op.drop_table("email_verification_tokens")
    op.drop_column("users", "email_verificado")

