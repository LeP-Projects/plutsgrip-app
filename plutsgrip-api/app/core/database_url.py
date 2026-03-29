"""
Helpers for normalizing PostgreSQL URLs for SQLAlchemy async engines.
"""
import re


def normalize_async_database_url(database_url: str) -> str:
    """Convert a standard PostgreSQL URL into an asyncpg-compatible DSN."""
    normalized_url = database_url.replace("postgresql://", "postgresql+asyncpg://", 1)
    normalized_url = re.sub(r"([?&])channel_binding=[^&]*&?", r"\1", normalized_url)
    normalized_url = normalized_url.replace("?&", "?").rstrip("?&")
    return normalized_url.replace("sslmode=", "ssl=")
