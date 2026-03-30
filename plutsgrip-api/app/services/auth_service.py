"""
Authentication service for user registration and login
"""
from typing import Optional, Tuple
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.security import (
    verify_password,
    get_password_hash,
    create_access_token,
    create_refresh_token,
    decode_token
)
from app.models.user import User
from app.repositories.user_repository import UserRepository
from app.schemas.user import UserRegisterRequest, UserLoginRequest


class AuthService:
    """Service for authentication operations"""

    def __init__(self, db: AsyncSession):
        self.db = db
        self.user_repo = UserRepository(db)

    async def register_user(self, user_data: UserRegisterRequest) -> User:
        """
        Register a new user

        Args:
            user_data: User registration data

        Returns:
            Created user object

        Raises:
            ValueError: If email already registered
        """
        # Check if email already exists
        if await self.user_repo.email_exists(user_data.email):
            raise ValueError("Email already registered")

        # Hash password
        hashed_password = get_password_hash(user_data.password)

        # Create user
        user_dict = {
            "name": user_data.name,
            "email": user_data.email,
            "hashed_password": hashed_password
        }

        user = await self.user_repo.create(user_dict)
        await self.db.commit()

        return user

    async def authenticate_user(self, login_data: UserLoginRequest) -> Optional[User]:
        """
        Authenticate user by email and password

        Args:
            login_data: Login credentials

        Returns:
            User object if authenticated, None otherwise
        """
        user = await self.user_repo.get_by_email(login_data.email)

        if not user:
            return None

        if not verify_password(login_data.password, user.hashed_password):
            return None

        return user

    async def create_tokens(self, user_id: int) -> Tuple[str, str]:
        """
        Create access and refresh tokens for user

        Args:
            user_id: User ID

        Returns:
            Tuple of (access_token, refresh_token)
        """
        access_token = create_access_token(data={"sub": str(user_id)})
        refresh_token = create_refresh_token(data={"sub": str(user_id)})

        return access_token, refresh_token

    async def refresh_access_token(self, refresh_token: str) -> Optional[str]:
        """
        Generate a new access token from a valid refresh token

        Args:
            refresh_token: JWT refresh token

        Returns:
            New access token if refresh token is valid, None otherwise
        """
        payload = decode_token(refresh_token)

        if not payload:
            return None

        # Verify it's a refresh token
        if payload.get("type") != "refresh":
            return None

        user_id = payload.get("sub")
        if not user_id:
            return None

        # Verify user still exists
        user = await self.user_repo.get_by_id(int(user_id))
        if not user:
            return None

        # Generate new access token
        new_access_token = create_access_token(data={"sub": user_id})

        return new_access_token
