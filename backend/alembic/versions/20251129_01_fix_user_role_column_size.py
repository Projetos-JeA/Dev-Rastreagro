"""Aumenta tamanho da coluna role para suportar service_provider"""

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = "20251129_01_fix_role_size"
down_revision = "20251127_01_quotations_matches"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Altera o tipo da coluna role para VARCHAR(20) para suportar 'service_provider'
    op.execute("ALTER TABLE users ALTER COLUMN role VARCHAR(20) NOT NULL")


def downgrade() -> None:
    # Reverte para VARCHAR(10) - mas isso pode causar problemas se houver dados
    op.execute("ALTER TABLE users ALTER COLUMN role VARCHAR(10) NOT NULL")
