"""
Global error handler middleware
"""
from fastapi import Request, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from sqlalchemy.exc import SQLAlchemyError
from app.core.logging import logger
from app.core.config import settings


def _add_cors_headers(response: JSONResponse, request: Request) -> JSONResponse:
    """Add CORS headers to error response"""
    origin = request.headers.get("origin")
    if origin in settings.allowed_origins_list:
        response.headers["Access-Control-Allow-Origin"] = origin
        response.headers["Access-Control-Allow-Credentials"] = "true"
        response.headers["Access-Control-Allow-Methods"] = ", ".join(settings.allowed_methods_list)
        response.headers["Access-Control-Allow-Headers"] = "*"
    return response


def _serialize_errors(errors: list) -> list:
    """Convert validation errors to JSON-serializable format"""
    serialized = []
    for error in errors:
        error_dict = {
            "type": error.get("type"),
            "loc": error.get("loc"),
            "msg": error.get("msg"),
            "input": error.get("input"),
        }
        # Remove non-serializable objects from ctx
        if "ctx" in error:
            ctx = error.get("ctx", {})
            serialized_ctx = {}
            for key, value in ctx.items():
                if isinstance(value, Exception):
                    serialized_ctx[key] = str(value)
                else:
                    serialized_ctx[key] = value
            error_dict["ctx"] = serialized_ctx
        serialized.append(error_dict)
    return serialized


async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Handle validation errors"""
    logger.warning(f"Validation error: {exc.errors()}")
    response = JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
        content={
            "error": "Validation Error",
            "message": "Invalid input data",
            "details": _serialize_errors(exc.errors())
        }
    )
    return _add_cors_headers(response, request)


async def sqlalchemy_exception_handler(request: Request, exc: SQLAlchemyError):
    """Handle database errors"""
    logger.error(f"Database error: {str(exc)}")
    response = JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": "Database Error",
            "message": "An error occurred while processing your request"
        }
    )
    return _add_cors_headers(response, request)


async def generic_exception_handler(request: Request, exc: Exception):
    """Handle all other exceptions"""
    logger.error(f"Unexpected error: {str(exc)}", exc_info=True)
    response = JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": "Internal Server Error",
            "message": "An unexpected error occurred"
        }
    )
    return _add_cors_headers(response, request)
