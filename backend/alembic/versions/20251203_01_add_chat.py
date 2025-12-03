"""Adiciona sistema de chat (conversas e mensagens)"""

from alembic import op
import sqlalchemy as sa
from datetime import datetime

# revision identifiers, used by Alembic.
revision = "20251203_01_add_chat"
down_revision = "20251129_02_user_interactions"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Cria tabela de conversas (NO ACTION para evitar cascading cycles no SQL Server)
    op.create_table(
        "conversations",
        sa.Column("id", sa.BigInteger, primary_key=True, index=True),
        sa.Column("user1_id", sa.BigInteger, sa.ForeignKey("users.id", ondelete="NO ACTION"), nullable=False),
        sa.Column("user2_id", sa.BigInteger, sa.ForeignKey("users.id", ondelete="NO ACTION"), nullable=False),
        sa.Column("created_at", sa.DateTime, default=datetime.utcnow, nullable=False),
        sa.Column("updated_at", sa.DateTime, default=datetime.utcnow, nullable=False),
    )

    # Índice composto para buscar conversas entre 2 usuários
    op.create_index('ix_conversation_users', 'conversations', ['user1_id', 'user2_id'])

    # Cria tabela de mensagens
    op.create_table(
        "messages",
        sa.Column("id", sa.BigInteger, primary_key=True, index=True),
        sa.Column("conversation_id", sa.BigInteger, sa.ForeignKey("conversations.id", ondelete="CASCADE"), nullable=False, index=True),
        sa.Column("sender_id", sa.BigInteger, sa.ForeignKey("users.id", ondelete="NO ACTION"), nullable=False, index=True),
        sa.Column("content", sa.Text, nullable=False),
        sa.Column("is_read", sa.Boolean, default=False, nullable=False),
        sa.Column("created_at", sa.DateTime, default=datetime.utcnow, nullable=False),
    )


def downgrade() -> None:
    op.drop_table("messages")
    op.drop_index('ix_conversation_users', table_name='conversations')
    op.drop_table("conversations")
