"""add_quotation_type_and_buyer_id

Adiciona campos type e buyer_id na tabela quotations para diferenciar
cotações (comprador) de ofertas (vendedor)
"""

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = "20251204_01_quot_type"
down_revision = "20251203_01_add_chat"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # 1. Adiciona coluna buyer_id primeiro (nullable, pois ofertas não têm buyer_id)
    op.add_column(
        "quotations",
        sa.Column("buyer_id", sa.BigInteger, sa.ForeignKey("users.id"), nullable=True),
    )
    
    # 2. Cria índice para buyer_id
    op.create_index(
        op.f("ix_quotations_buyer_id"),
        "quotations",
        ["buyer_id"],
        unique=False,
    )
    
    # 3. Adiciona coluna type como String (SQL Server não suporta ENUM nativo)
    # Usa String(20) para armazenar 'quotation' ou 'offer'
    op.add_column(
        "quotations",
        sa.Column(
            "type",
            sa.String(length=20),
            server_default="offer",  # Dados existentes são ofertas
            nullable=False,
        ),
    )
    
    # 4. Cria índice para type
    op.create_index(
        op.f("ix_quotations_type"),
        "quotations",
        ["type"],
        unique=False,
    )
    
    # 5. Torna seller_id nullable (cotações não têm seller_id)
    # Primeiro, atualiza dados existentes para garantir que não há NULLs
    op.execute("""
        UPDATE quotations 
        SET seller_id = seller_id 
        WHERE seller_id IS NOT NULL;
    """)
    
    op.alter_column(
        "quotations",
        "seller_id",
        existing_type=sa.BigInteger(),
        nullable=True,
        existing_nullable=False,
    )
    
    # 6. Torna seller_type nullable (cotações não têm seller_type)
    op.alter_column(
        "quotations",
        "seller_type",
        existing_type=sa.String(length=50),
        nullable=True,
        existing_nullable=False,
    )


def downgrade() -> None:
    # Remove índices
    op.drop_index(op.f("ix_quotations_type"), table_name="quotations")
    op.drop_index(op.f("ix_quotations_buyer_id"), table_name="quotations")
    
    # Remove colunas
    op.drop_column("quotations", "buyer_id")
    op.drop_column("quotations", "type")
    
    # Reverte seller_id e seller_type para NOT NULL
    # Primeiro, remove registros com seller_id NULL (se houver)
    op.execute("""
        DELETE FROM quotations WHERE seller_id IS NULL;
    """)
    
    op.alter_column(
        "quotations",
        "seller_id",
        existing_type=sa.BigInteger(),
        nullable=False,
        existing_nullable=True,
    )
    
    op.alter_column(
        "quotations",
        "seller_type",
        existing_type=sa.String(length=50),
        nullable=False,
        existing_nullable=True,
    )
