"""Adiciona tabela para tokens de recuperação de senha"""

from alembic import op
import sqlalchemy as sa
from datetime import datetime

# revision identifiers, used by Alembic.
revision = "20251122_03_password_reset"
down_revision = "20251122_02_add_bairro_to_service_provider"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Cria tabela para tokens de recuperação de senha
    op.create_table(
        "password_reset_tokens",
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
        sa.Column("used", sa.Boolean, nullable=False, server_default="0"),
        sa.Column(
            "created_at", sa.DateTime, nullable=False, server_default=sa.text("SYSUTCDATETIME()")
        ),
    )
    
    op.create_index(
        op.f("ix_password_reset_tokens_user_id"), "password_reset_tokens", ["user_id"], unique=True
    )
    op.create_index(
        op.f("ix_password_reset_tokens_token"), "password_reset_tokens", ["token"], unique=True
    )


def downgrade() -> None:
    op.drop_index(op.f("ix_password_reset_tokens_token"), table_name="password_reset_tokens")
    op.drop_index(op.f("ix_password_reset_tokens_user_id"), table_name="password_reset_tokens")
    op.drop_table("password_reset_tokens")

