"""Add rate limit whitelist table

Revision ID: 20260106_add_rate_limit_whitelist
Create Date: 2026-01-06
"""
from alembic import op
import sqlalchemy as sa


# revision identifiers
revision = '20260106_whitelist'
down_revision = '744169700429'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        'rate_limit_whitelists',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('ip_address', sa.String(45), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('created_by', sa.Integer(), nullable=True),
        sa.Column('expires_at', sa.DateTime(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.ForeignKeyConstraint(['created_by'], ['users.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_rate_limit_whitelists_ip_address', 'rate_limit_whitelists', ['ip_address'], unique=True)
    op.create_index('ix_rate_limit_whitelists_is_active', 'rate_limit_whitelists', ['is_active'])
    
    # Seed default whitelisted IPs for development/testing
    op.execute("""
        INSERT INTO rate_limit_whitelists (ip_address, description, is_active, created_at, updated_at)
        VALUES 
            ('127.0.0.1', 'Localhost - Development', true, NOW(), NOW()),
            ('172.18.0.1', 'Docker network gateway', true, NOW(), NOW()),
            ('::1', 'IPv6 Localhost', true, NOW(), NOW())
    """)


def downgrade() -> None:
    op.drop_index('ix_rate_limit_whitelists_is_active', table_name='rate_limit_whitelists')
    op.drop_index('ix_rate_limit_whitelists_ip_address', table_name='rate_limit_whitelists')
    op.drop_table('rate_limit_whitelists')
