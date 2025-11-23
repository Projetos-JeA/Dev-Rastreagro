"""Adiciona grupos faltantes na categoria Comércio"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy import table, column, BigInteger, String

# revision identifiers, used by Alembic.
revision = "20251121_01_commerce"
down_revision = "20251119_01_add_bairro"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Tabela de grupos
    group_table = table(
        "activity_group",
        column("id", BigInteger),
        column("category_id", BigInteger),
        column("name", String),
    )

    # Novos grupos para Comércio (categoria_id = 4)
    # Último ID usado: 25, então começamos em 26
    new_groups = [
        (26, 4, "Postos de Combustível"),
        (27, 4, "Implementos Agrícolas"),
        (28, 4, "Concessionárias"),
        (29, 4, "Distribuidora de Peças"),
        (30, 4, "Equipamentos"),
        (31, 4, "Tecnologia"),
        (32, 4, "Drones e Aviação"),
        (33, 4, "Drogarias"),
    ]

    connection = op.get_bind()
    connection.execute(sa.text("SET IDENTITY_INSERT activity_group ON"))
    op.bulk_insert(
        group_table,
        [{"id": gid, "category_id": cat_id, "name": name} for gid, cat_id, name in new_groups],
    )
    connection.execute(sa.text("SET IDENTITY_INSERT activity_group OFF"))


def downgrade() -> None:
    # Remove os grupos adicionados
    op.execute(
        sa.text(
            "DELETE FROM activity_group WHERE id IN (26, 27, 28, 29, 30, 31, 32, 33)"
        )
    )

