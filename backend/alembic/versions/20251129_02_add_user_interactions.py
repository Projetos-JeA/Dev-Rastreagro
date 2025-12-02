"""Adiciona tabela de interações do usuário"""

from alembic import op
import sqlalchemy as sa
from datetime import datetime

# revision identifiers, used by Alembic.
revision = "20251129_02_user_interactions"
down_revision = "20251129_01_fix_role_size"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Cria tabela user_interactions
    # SQL Server não suporta ENUM nativo, então usamos String
    op.create_table(
        "user_interactions",
        sa.Column("id", sa.BigInteger, primary_key=True, index=True),
        sa.Column("user_id", sa.BigInteger, sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True),
        sa.Column("quotation_id", sa.BigInteger, sa.ForeignKey("quotations.id", ondelete="CASCADE"), nullable=False, index=True),
        sa.Column("interaction_type", sa.String(length=50), nullable=False),  # view, favorite, click, accepted, rejected, purchased
        sa.Column("created_at", sa.DateTime, default=datetime.utcnow, nullable=False),
    )


def downgrade() -> None:
    op.drop_table("user_interactions")
    # Nota: Não removemos o enum pois pode ser usado por outras tabelas

