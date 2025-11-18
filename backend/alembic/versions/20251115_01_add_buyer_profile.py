"""Adiciona tabela buyer_profiles para dados pessoais do comprador"""

from alembic import op
import sqlalchemy as sa
from datetime import datetime

# revision identifiers, used by Alembic.
revision = "20251115_01_add_buyer_profile"
down_revision = "20251108_02_add_service_provider"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "buyer_profiles",
        sa.Column("id", sa.BigInteger, primary_key=True),
        sa.Column(
            "user_id",
            sa.BigInteger,
            sa.ForeignKey("users.id", ondelete="CASCADE"),
            nullable=False,
            unique=True,
        ),
        sa.Column("nome_completo", sa.String(length=255), nullable=False),
        sa.Column("data_nascimento", sa.Date, nullable=True),
        sa.Column("cpf", sa.String(length=14), nullable=True, unique=True),
        sa.Column("identidade", sa.String(length=20), nullable=True),
        sa.Column("estado_civil", sa.String(length=20), nullable=True),
        sa.Column("naturalidade", sa.String(length=100), nullable=True),
        sa.Column("endereco", sa.String(length=255), nullable=False),
        sa.Column("cep", sa.String(length=12), nullable=False),
        sa.Column("cidade", sa.String(length=100), nullable=False),
        sa.Column("estado", sa.String(length=2), nullable=False),
        sa.Column(
            "created_at", sa.DateTime, nullable=False, server_default=sa.text("SYSUTCDATETIME()")
        ),
        sa.Column(
            "updated_at", sa.DateTime, nullable=False, server_default=sa.text("SYSUTCDATETIME()")
        ),
    )

    op.create_index(
        op.f("ix_buyer_profiles_user_id"), "buyer_profiles", ["user_id"], unique=True
    )
    op.create_index(op.f("ix_buyer_profiles_cpf"), "buyer_profiles", ["cpf"], unique=True)


def downgrade() -> None:
    op.drop_index(op.f("ix_buyer_profiles_cpf"), table_name="buyer_profiles")
    op.drop_index(op.f("ix_buyer_profiles_user_id"), table_name="buyer_profiles")
    op.drop_table("buyer_profiles")

