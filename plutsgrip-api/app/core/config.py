"""
Application configuration using Pydantic Settings
Loads environment variables from .env file
"""
from functools import lru_cache
from typing import List
from pydantic import Field, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables"""

    # Application
    APP_NAME: str = "PlutusGrip Finance Tracker API"
    APP_VERSION: str = "1.0.0"
    APP_ENV: str = "development"
    DEBUG: bool = True

    # Server
    HOST: str = "0.0.0.0"
    PORT: int = 8000

    # Database
    DATABASE_URL: str = Field(..., min_length=1)
    DATABASE_ECHO: bool = False
    DB_POOL_SIZE: int = 5
    DB_MAX_OVERFLOW: int = 10
    DB_POOL_TIMEOUT: int = 30
    DB_POOL_RECYCLE: int = 3600

    # Rate Limiting
    RATE_LIMIT_ENABLED: bool = True

    # Security
    SECRET_KEY: str = Field(..., min_length=32)
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # CORS
    ALLOWED_ORIGINS: str = "http://localhost:3000,http://localhost:5173"
    ALLOWED_METHODS: str = "GET,POST,PUT,DELETE,OPTIONS"
    ALLOWED_HEADERS: str = "*"

    # Logging
    LOG_LEVEL: str = "INFO"
    LOG_FILE: str = "logs/app.log"
    LOG_MAX_BYTES: int = 10485760  # 10MB
    LOG_BACKUP_COUNT: int = 5

    # Pagination
    DEFAULT_PAGE_SIZE: int = 20
    MAX_PAGE_SIZE: int = 100

    @property
    def allowed_origins_list(self) -> List[str]:
        """Convert comma-separated ALLOWED_ORIGINS to list"""
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",")]

    @property
    def allowed_methods_list(self) -> List[str]:
        """Convert comma-separated ALLOWED_METHODS to list"""
        return [method.strip() for method in self.ALLOWED_METHODS.split(",")]

    @model_validator(mode="after")
    def validate_production_settings(self) -> "Settings":
        """Reject placeholder values in production."""
        if self.APP_ENV.lower() != "production":
            return self

        insecure_secret_markers = (
            "change-this",
            "change_this",
            "your-super-secret-key",
            "dev-super-secret",
        )
        if any(marker in self.SECRET_KEY.lower() for marker in insecure_secret_markers):
            raise ValueError("SECRET_KEY must be replaced with a real production secret")

        insecure_db_markers = (
            "prod_user",
            "prod_password",
            "external_db_host",
            "change_me",
            "change_this",
        )
        if any(marker in self.DATABASE_URL.lower() for marker in insecure_db_markers):
            raise ValueError("DATABASE_URL must point to the real production database")

        return self

    model_config = SettingsConfigDict(
        env_file=(".env", ".env.development", ".env.production"),
        case_sensitive=True
    )


@lru_cache()
def get_settings() -> Settings:
    """
    Get cached settings instance
    Using lru_cache ensures settings are loaded only once
    """
    return Settings()


# Convenience instance for direct import
settings = get_settings()
