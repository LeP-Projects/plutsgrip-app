"""
Authentication endpoints
POST /api/auth/register - Register new user
POST /api/auth/login - User login
POST /api/auth/logout - User logout
POST /api/auth/refresh - Refresh access token
GET /api/auth/me - Get current user
"""
from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from slowapi import Limiter
from slowapi.util import get_remote_address
from app.core.database import get_db
from app.api.dependencies import get_current_user
from app.core.security import blacklist_token
from app.models.user import User
from app.schemas.user import (
    UserRegisterRequest,
    UserLoginRequest,
    UserResponse,
    LoginResponse,
    TokenResponse,
    RefreshTokenRequest
)
from app.services.auth_service import AuthService

security = HTTPBearer()
limiter = Limiter(key_func=get_remote_address)

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
@limiter.limit("3/hour")
async def register_user(
    request: Request,
    user_data: UserRegisterRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Register a new user

    Validates input data, checks for duplicate email, hashes password,
    and creates user in the database.

    Rate limit: 3 requests per hour per IP address
    """
    auth_service = AuthService(db)

    try:
        user = await auth_service.register_user(user_data)
        return UserResponse.model_validate(user)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(e)
        )


@router.post("/login", response_model=LoginResponse)
@limiter.limit("5/15minutes")
async def login(
    request: Request,
    login_data: UserLoginRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Authenticate user and return JWT tokens

    Verifies credentials, generates access and refresh tokens,
    and returns them along with user data.

    Rate limit: 5 requests per 15 minutes per IP address
    """
    auth_service = AuthService(db)

    user = await auth_service.authenticate_user(login_data)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )

    access_token, refresh_token = await auth_service.create_tokens(user.id)

    return LoginResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user=UserResponse.model_validate(user)
    )


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(
    refresh_data: RefreshTokenRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Refresh access token using a valid refresh token

    This endpoint allows clients to obtain a new access token without requiring
    the user to log in again, as long as their refresh token is still valid.
    """
    auth_service = AuthService(db)

    new_access_token = await auth_service.refresh_access_token(refresh_data.refresh_token)

    if not new_access_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token"
        )

    return TokenResponse(access_token=new_access_token)


@router.post("/logout")
async def logout(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    current_user: User = Depends(get_current_user)
):
    """
    Logout user by blacklisting their access token

    This endpoint invalidates the current access token by adding it to a blacklist.
    The client should also remove the token from local storage.

    Note: This implementation uses an in-memory blacklist suitable for single-instance
    deployments. For production with multiple instances, consider using Redis.
    """
    token = credentials.credentials
    blacklist_token(token)

    return {
        "message": "Successfully logged out",
        "detail": "Token has been revoked. Please remove it from client storage."
    }


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    """
    Get current authenticated user information

    Returns the profile information of the currently authenticated user.
    """
    return UserResponse.model_validate(current_user)
