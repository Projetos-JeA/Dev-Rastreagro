"""Migração inicial e seed da taxonomia de atividades"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.sql import table, column
from sqlalchemy import String, BigInteger, DateTime, Date
from datetime import datetime

# Identificadores de revisão utilizados pelo Alembic.
revision = "20251105_01_initial"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id", BigInteger, primary_key=True),
        sa.Column("email", sa.String(length=255), nullable=False, unique=True),
        sa.Column("password_hash", sa.String(length=255), nullable=False),
        sa.Column("role", sa.Enum("buyer", "seller", name="user_role"), nullable=False),
        sa.Column("nickname", sa.String(length=100), nullable=True),
        sa.Column("created_at", DateTime, default=datetime.utcnow, nullable=False),
        sa.Column(
            "updated_at",
            DateTime,
            default=datetime.utcnow,
            onupdate=datetime.utcnow,
            nullable=False,
        ),
    )
    op.create_index(op.f("ix_users_email"), "users", ["email"], unique=True)

    op.create_table(
        "companies",
        sa.Column("id", BigInteger, primary_key=True),
        sa.Column(
            "user_id",
            BigInteger,
            sa.ForeignKey("users.id", ondelete="CASCADE"),
            nullable=False,
            unique=True,
        ),
        sa.Column("nome_propriedade", sa.String(length=255), nullable=False),
        sa.Column("inicio_atividades", Date, nullable=True),
        sa.Column("ramo_atividade", sa.String(length=255), nullable=True),
        sa.Column("cnaes", sa.String(length=255), nullable=True),
        sa.Column("cnpj_cpf", sa.String(length=20), nullable=False),
        sa.Column("insc_est_identidade", sa.String(length=50), nullable=True),
        sa.Column("endereco", sa.String(length=255), nullable=False),
        sa.Column("cep", sa.String(length=12), nullable=False),
        sa.Column("cidade", sa.String(length=100), nullable=False),
        sa.Column("estado", sa.String(length=2), nullable=False),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("created_at", DateTime, default=datetime.utcnow, nullable=False),
        sa.Column(
            "updated_at",
            DateTime,
            default=datetime.utcnow,
            onupdate=datetime.utcnow,
            nullable=False,
        ),
    )

    op.create_table(
        "activity_category",
        sa.Column("id", BigInteger, primary_key=True),
        sa.Column("name", sa.String(length=100), nullable=False, unique=True),
    )

    op.create_table(
        "activity_group",
        sa.Column("id", BigInteger, primary_key=True),
        sa.Column(
            "category_id",
            BigInteger,
            sa.ForeignKey("activity_category.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("name", sa.String(length=100), nullable=False),
    )

    op.create_table(
        "activity_item",
        sa.Column("id", BigInteger, primary_key=True),
        sa.Column(
            "group_id",
            BigInteger,
            sa.ForeignKey("activity_group.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("name", sa.String(length=100), nullable=False),
    )

    op.create_table(
        "company_activities",
        sa.Column("id", BigInteger, primary_key=True),
        sa.Column(
            "company_id",
            BigInteger,
            sa.ForeignKey("companies.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column(
            "category_id",
            BigInteger,
            sa.ForeignKey("activity_category.id", ondelete="NO ACTION"),
            nullable=False,
        ),
        sa.Column(
            "group_id",
            BigInteger,
            sa.ForeignKey("activity_group.id", ondelete="NO ACTION"),
            nullable=True,
        ),
        sa.Column(
            "item_id",
            BigInteger,
            sa.ForeignKey("activity_item.id", ondelete="SET NULL"),
            nullable=True,
        ),
    )

    seed_activity_taxonomy()


def downgrade() -> None:
    op.drop_table("company_activities")
    op.drop_table("activity_item")
    op.drop_table("activity_group")
    op.drop_table("activity_category")
    op.drop_table("companies")
    op.drop_table("users")


def seed_activity_taxonomy() -> None:
    category_table = table("activity_category", column("id", BigInteger), column("name", String))
    group_table = table(
        "activity_group",
        column("id", BigInteger),
        column("category_id", BigInteger),
        column("name", String),
    )
    item_table = table(
        "activity_item",
        column("id", BigInteger),
        column("group_id", BigInteger),
        column("name", String),
    )

    categories = [
        (1, "Pecuária"),
        (2, "Agricultura"),
        (3, "Integração Pecuária/Agricultura"),
        (4, "Comércio"),
        (5, "Indústria"),
        (6, "Serviços"),
    ]

    groups = [
        (1, 1, "Cria"),
        (2, 1, "Recria"),
        (3, 1, "Engorda"),
        (4, 2, "Soja"),
        (5, 2, "Sorgo"),
        (6, 2, "Milho"),
        (7, 2, "Milheto"),
        (8, 2, "Arroz"),
        (9, 2, "Trigo"),
        (10, 2, "Algodão"),
        (11, 2, "Feijão"),
        (12, 3, "Bezerro"),
        (13, 3, "Garrote"),
        (14, 3, "Novilha"),
        (15, 3, "Boi Magro"),
        (16, 3, "Vaca"),
        (17, 4, "Supermercado"),
        (18, 4, "Produtos Agropecuários"),
        (19, 4, "Combustíveis"),
        (20, 4, "Uniforme"),
        (21, 4, "EPIs"),
        (22, 5, "Ração"),
        (23, 5, "Frigorifico"),
        (24, 6, "Manutenção de Máquinas"),
        (25, 6, "Manutenção de Equipamentos"),
    ]

    items = [
        (1, 1, "Macho"),
        (2, 1, "Fêmea"),
        (3, 2, "Macho"),
        (4, 2, "Fêmea"),
        (5, 3, "Macho"),
        (6, 3, "Fêmea"),
        (7, 12, "Macho"),
        (8, 12, "Fêmea"),
    ]

    connection = op.get_bind()

    connection.execute(sa.text("SET IDENTITY_INSERT activity_category ON"))
    op.bulk_insert(category_table, [{"id": cid, "name": name} for cid, name in categories])
    connection.execute(sa.text("SET IDENTITY_INSERT activity_category OFF"))

    connection.execute(sa.text("SET IDENTITY_INSERT activity_group ON"))
    op.bulk_insert(
        group_table,
        [{"id": gid, "category_id": cat_id, "name": name} for gid, cat_id, name in groups],
    )
    connection.execute(sa.text("SET IDENTITY_INSERT activity_group OFF"))

    connection.execute(sa.text("SET IDENTITY_INSERT activity_item ON"))
    op.bulk_insert(
        item_table, [{"id": iid, "group_id": gid, "name": name} for iid, gid, name in items]
    )
    connection.execute(sa.text("SET IDENTITY_INSERT activity_item OFF"))
