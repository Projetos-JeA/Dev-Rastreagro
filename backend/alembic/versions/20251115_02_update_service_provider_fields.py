"""Adiciona campos faltantes na tabela service_providers"""

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = "20251115_02_update_sp"
down_revision = "20251115_01_add_buyer_profile"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("service_providers", sa.Column("tipo_servico", sa.String(length=100), nullable=True))
    op.add_column("service_providers", sa.Column("endereco", sa.String(length=255), nullable=True))
    op.add_column("service_providers", sa.Column("cep", sa.String(length=12), nullable=True))
    op.add_column("service_providers", sa.Column("cnpj_cpf", sa.String(length=20), nullable=True))
    op.add_column(
        "service_providers", sa.Column("insc_est_identidade", sa.String(length=50), nullable=True)
    )


def downgrade() -> None:
    op.drop_column("service_providers", "insc_est_identidade")
    op.drop_column("service_providers", "cnpj_cpf")
    op.drop_column("service_providers", "cep")
    op.drop_column("service_providers", "endereco")
    op.drop_column("service_providers", "tipo_servico")

