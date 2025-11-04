"""
Advanced logging configuration with rotation and structured logging
"""
import logging
import sys
from pathlib import Path
from logging.handlers import RotatingFileHandler
from app.core.config import settings


def setup_logging() -> logging.Logger:
    """
    Configure application logging with console and file handlers

    Returns:
        Configured logger instance
    """
    # Create logs directory if it doesn't exist
    log_dir = Path(settings.LOG_FILE).parent
    log_dir.mkdir(parents=True, exist_ok=True)

    # Create logger
    logger = logging.getLogger("plutusgrip")
    logger.setLevel(getattr(logging, settings.LOG_LEVEL.upper()))

    # Prevent duplicate handlers
    if logger.handlers:
        return logger

    # Format for logs
    log_format = logging.Formatter(
        fmt="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S"
    )

    # Console handler (stdout)
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(logging.INFO)
    console_handler.setFormatter(log_format)
    logger.addHandler(console_handler)

    # File handler with rotation
    file_handler = RotatingFileHandler(
        filename=settings.LOG_FILE,
        maxBytes=settings.LOG_MAX_BYTES,
        backupCount=settings.LOG_BACKUP_COUNT,
        encoding="utf-8"
    )
    file_handler.setLevel(getattr(logging, settings.LOG_LEVEL.upper()))
    file_handler.setFormatter(log_format)
    logger.addHandler(file_handler)

    # Prevent propagation to root logger
    logger.propagate = False

    return logger


# Create global logger instance
logger = setup_logging()


def log_request(method: str, path: str, status_code: int, duration_ms: float):
    """
    Log HTTP request with structured information

    Args:
        method: HTTP method (GET, POST, etc.)
        path: Request path
        status_code: HTTP status code
        duration_ms: Request duration in milliseconds
    """
    logger.info(
        f"{method} {path} - Status: {status_code} - Duration: {duration_ms:.2f}ms"
    )


def log_error(error: Exception, context: str = ""):
    """
    Log error with context information

    Args:
        error: Exception instance
        context: Additional context information
    """
    logger.error(f"Error in {context}: {str(error)}", exc_info=True)


def log_info(message: str):
    """Log info message"""
    logger.info(message)


def log_warning(message: str):
    """Log warning message"""
    logger.warning(message)


def log_debug(message: str):
    """Log debug message"""
    logger.debug(message)
