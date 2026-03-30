"""
Authentication service for user registration and login
"""
from typing import Optional, Tuple
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.security import (
    verify_password,
    get_password_hash,
    create_access_token,
    create_refresh_token,
    decode_token
)
from app.models.category import Category, TransactionType
from app.models.user import User
from app.repositories.category_repository import CategoryRepository
from app.repositories.user_repository import UserRepository
from app.schemas.user import UserRegisterRequest, UserLoginRequest


class AuthService:
    """Service for authentication operations"""

    FALLBACK_DEFAULT_CATEGORIES = (
        {
            "name": "Moradia",
            "type": TransactionType.EXPENSE,
            "color": "#FF6B6B",
            "icon": "home",
        },
        {
            "name": "Alimentacao",
            "type": TransactionType.EXPENSE,
            "color": "#FFD166",
            "icon": "shopping-cart",
        },
        {
            "name": "Transporte",
            "type": TransactionType.EXPENSE,
            "color": "#4ECDC4",
            "icon": "car",
        },
        {
            "name": "Lazer",
            "type": TransactionType.EXPENSE,
            "color": "#6C5CE7",
            "icon": "sparkles",
        },
        {
            "name": "Salario",
            "type": TransactionType.INCOME,
            "color": "#51CF66",
            "icon": "wallet",
        },
        {
            "name": "Renda Extra",
            "type": TransactionType.INCOME,
            "color": "#339AF0",
            "icon": "trending-up",
        },
    )

    def __init__(self, db: AsyncSession):
        self.db = db
        self.user_repo = UserRepository(db)
        self.category_repo = CategoryRepository(db)

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
        await self._bootstrap_default_categories(user.id)
        await self.db.commit()

        return user

    async def _bootstrap_default_categories(self, user_id: int) -> None:
        """Create starter categories for a newly registered user."""
        shared_defaults = await self.db.execute(
            select(Category).where(
                Category.is_default.is_(True),
                Category.user_id.is_(None),
                Category.deleted_at.is_(None),
            )
        )
        shared_categories = shared_defaults.scalars().all()

        categories_to_create = shared_categories or self.FALLBACK_DEFAULT_CATEGORIES

        for category in categories_to_create:
            await self.category_repo.create(
                {
                    "name": category.name if isinstance(category, Category) else category["name"],
                    "type": category.type if isinstance(category, Category) else category["type"],
                    "color": category.color if isinstance(category, Category) else category["color"],
                    "icon": category.icon if isinstance(category, Category) else category["icon"],
                    "is_default": True,
                    "user_id": user_id,
                }
            )

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
