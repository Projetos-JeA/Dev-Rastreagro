"""Adiciona campo bairro ao perfil do comprador"""

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = "20251119_01_add_bairro"
down_revision = "20251115_03_email_verify"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Adiciona coluna bairro na tabela buyer_profiles
    op.add_column(
        "buyer_profiles",
        sa.Column("bairro", sa.String(length=100), nullable=True),
    )


def downgrade() -> None:
    # Remove coluna bairro da tabela buyer_profiles
    op.drop_column("buyer_profiles", "bairro")

