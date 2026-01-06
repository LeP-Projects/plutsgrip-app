"""add_trusted_ips_table

Revision ID: 744169700429
Revises: b7f2c3d4e5f6
Create Date: 2026-01-06 13:13:31.447660

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '744169700429'
down_revision: Union[str, None] = 'b7f2c3d4e5f6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Criar tabela trusted_ips
    op.create_table(
        'trusted_ips',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('ip_address', sa.String(length=45), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('ip_address')
    )
    op.create_index(op.f('ix_trusted_ips_id'), 'trusted_ips', ['id'], unique=False)
    op.create_index(op.f('ix_trusted_ips_ip_address'), 'trusted_ips', ['ip_address'], unique=False)
    op.create_index(op.f('ix_trusted_ips_created_at'), 'trusted_ips', ['created_at'], unique=False)

    # Inserir IPs padrão confiáveis
    op.execute(
        """
        INSERT INTO trusted_ips (ip_address, description, is_active)
        VALUES
            ('127.0.0.1', 'Localhost IPv4', true),
            ('::1', 'Localhost IPv6', true),
            ('172.18.0.1', 'Docker bridge network', true)
        """
    )


def downgrade() -> None:
    op.drop_index(op.f('ix_trusted_ips_created_at'), table_name='trusted_ips')
    op.drop_index(op.f('ix_trusted_ips_ip_address'), table_name='trusted_ips')
    op.drop_index(op.f('ix_trusted_ips_id'), table_name='trusted_ips')
    op.drop_table('trusted_ips')
