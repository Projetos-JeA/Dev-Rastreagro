"""Cria tabelas de cotações e matches (Deu Agro)"""

from alembic import op
import sqlalchemy as sa
from datetime import datetime

# revision identifiers, used by Alembic.
revision = "20251127_01_quotations_matches"
down_revision = "20251122_03_password_reset"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Cria tabela quotations
    op.create_table(
        "quotations",
        sa.Column("id", sa.BigInteger, primary_key=True, index=True),
        sa.Column("seller_id", sa.BigInteger, sa.ForeignKey("users.id"), nullable=False, index=True),
        sa.Column("seller_type", sa.String(length=50), nullable=False),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("description", sa.Text, nullable=True),
        sa.Column(
            "category",
            sa.Enum("AGRICULTURE", "LIVESTOCK", "SERVICE", "BOTH", name="quotation_category"),
            nullable=False,
        ),
        sa.Column("product_type", sa.String(length=100), nullable=True),
        sa.Column("location_city", sa.String(length=100), nullable=True),
        sa.Column("location_state", sa.String(length=2), nullable=True),
        sa.Column("price", sa.Float, nullable=True),
        sa.Column("quantity", sa.Float, nullable=True),
        sa.Column("unit", sa.String(length=50), nullable=True),
        sa.Column(
            "status",
            sa.Enum("ACTIVE", "RESERVED", "SOLD", "EXPIRED", "CANCELLED", name="quotation_status"),
            default="ACTIVE",
            nullable=False,
        ),
        sa.Column("expires_at", sa.DateTime, nullable=True),
        sa.Column("image_url", sa.String(length=500), nullable=True),
        sa.Column("images", sa.Text, nullable=True),  # JSON array
        sa.Column("free_shipping", sa.Boolean, default=False, nullable=False),
        sa.Column("discount_percentage", sa.Integer, nullable=True),
        sa.Column("installments", sa.Integer, nullable=True),
        sa.Column("stock", sa.Integer, nullable=True),
        sa.Column("embedding", sa.Text, nullable=True),  # JSON array do embedding
        sa.Column("created_at", sa.DateTime, default=datetime.utcnow, nullable=False),
        sa.Column("updated_at", sa.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False),
    )

    # Cria tabela matches
    op.create_table(
        "matches",
        sa.Column("id", sa.BigInteger, primary_key=True, index=True),
        sa.Column("quotation_id", sa.BigInteger, sa.ForeignKey("quotations.id"), nullable=False, index=True),
        sa.Column("buyer_id", sa.BigInteger, sa.ForeignKey("users.id"), nullable=False, index=True),
        sa.Column("score", sa.Float, nullable=True),  # Score de relevância (0-100)
        sa.Column(
            "status",
            sa.Enum("PENDING", "ACCEPTED", "REJECTED", "COMPLETED", "CANCELLED", name="match_status"),
            default="PENDING",
            nullable=False,
        ),
        sa.Column("created_at", sa.DateTime, default=datetime.utcnow, nullable=False),
        sa.Column("updated_at", sa.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False),
    )


def downgrade() -> None:
    op.drop_table("matches")
    op.drop_table("quotations")
    # Remove os enums
    op.execute("DROP TYPE IF EXISTS match_status")
    op.execute("DROP TYPE IF EXISTS quotation_status")
    op.execute("DROP TYPE IF EXISTS quotation_category")

