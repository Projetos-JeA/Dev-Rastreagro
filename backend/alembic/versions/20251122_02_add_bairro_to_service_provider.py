"""Add bairro column to service_providers table

Revision ID: 20251122_02_add_bairro_sp
Revises: 20251122_01_add_bairro
Create Date: 2025-11-22

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "20251122_02_add_bairro_sp"
down_revision = "20251122_01_add_bairro"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "service_providers",
        sa.Column("bairro", sa.String(length=100), nullable=True),
    )


def downgrade() -> None:
    op.drop_column("service_providers", "bairro")

