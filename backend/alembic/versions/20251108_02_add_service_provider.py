"""Adiciona prestador de serviço e nova tabela de perfis"""

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = "20251108_02_add_service_provider"
down_revision = "20251105_01_initial"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute(
        """
        DECLARE @constraint_name NVARCHAR(128);
        SELECT @constraint_name = cc.name
        FROM sys.check_constraints cc
        JOIN sys.columns c ON cc.parent_object_id = c.object_id AND cc.parent_column_id = c.column_id
        WHERE cc.parent_object_id = OBJECT_ID('users') AND c.name = 'role';
        IF @constraint_name IS NOT NULL
            EXEC ('ALTER TABLE users DROP CONSTRAINT [' + @constraint_name + ']');
        ALTER TABLE users ADD CONSTRAINT CK_users_role CHECK (role IN ('buyer','seller','service_provider'));
        """
    )

    op.create_table(
        "service_providers",
        sa.Column("id", sa.BigInteger, primary_key=True),
        sa.Column(
            "user_id",
            sa.BigInteger,
            sa.ForeignKey("users.id", ondelete="CASCADE"),
            nullable=False,
            unique=True,
        ),
        sa.Column("nome_servico", sa.String(length=255), nullable=False),
        sa.Column("descricao", sa.String(length=500), nullable=True),
        sa.Column("telefone", sa.String(length=30), nullable=True),
        sa.Column("email_contato", sa.String(length=255), nullable=False),
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
        op.f("ix_service_providers_user_id"), "service_providers", ["user_id"], unique=True
    )


def downgrade() -> None:
    op.drop_index(op.f("ix_service_providers_user_id"), table_name="service_providers")
    op.drop_table("service_providers")

    op.execute("ALTER TABLE users DROP CONSTRAINT CK_users_role;")
    op.execute(
        """
        ALTER TABLE users ADD CONSTRAINT CK_users_role CHECK (role IN ('buyer','seller'));
        """
    )
