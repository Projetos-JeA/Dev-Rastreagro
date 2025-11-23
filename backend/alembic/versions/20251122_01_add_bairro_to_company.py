"""Add bairro column to companies table

Revision ID: 20251122_01_add_bairro
Revises: 20251121_01_commerce
Create Date: 2025-11-22

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "20251122_01_add_bairro"
down_revision = "20251121_01_commerce"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "companies",
        sa.Column("bairro", sa.String(length=100), nullable=True),
    )


def downgrade() -> None:
    op.drop_column("companies", "bairro")

