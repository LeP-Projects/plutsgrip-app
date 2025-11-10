"""
Base repository with common CRUD operations
"""
from typing import Generic, TypeVar, Type, Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, delete
from app.core.database import Base

ModelType = TypeVar("ModelType", bound=Base)


class BaseRepository(Generic[ModelType]):
    """
    Base repository class with common CRUD operations

    Type Parameters:
        ModelType: The SQLAlchemy model class
    """

    def __init__(self, model: Type[ModelType], db: AsyncSession):
        """
        Initialize repository

        Args:
            model: SQLAlchemy model class
            db: Async database session
        """
        self.model = model
        self.db = db

    async def get_by_id(self, id: int) -> Optional[ModelType]:
        """Get a single record by ID"""
        result = await self.db.execute(select(self.model).where(self.model.id == id))
        return result.scalars().first()

    async def get_all(self, skip: int = 0, limit: int = 100) -> List[ModelType]:
        """Get all records with pagination"""
        result = await self.db.execute(select(self.model).offset(skip).limit(limit))
        return list(result.scalars().all())

    async def create(self, obj_in: dict) -> ModelType:
        """Create a new record"""
        db_obj = self.model(**obj_in)
        self.db.add(db_obj)
        await self.db.flush()
        # Refresh without loading relationships to avoid greenlet issues
        # Use refresh with specific attributes only if needed in subclasses
        return db_obj

    async def update(self, id: int, obj_in: dict) -> Optional[ModelType]:
        """Update a record by ID"""
        await self.db.execute(
            update(self.model).where(self.model.id == id).values(**obj_in)
        )
        await self.db.flush()
        return await self.get_by_id(id)

    async def delete(self, id: int) -> bool:
        """Delete a record by ID"""
        result = await self.db.execute(delete(self.model).where(self.model.id == id))
        await self.db.flush()
        return result.rowcount > 0

    async def count(self) -> int:
        """Count total records"""
        from sqlalchemy import func
        result = await self.db.execute(select(func.count(self.model.id)))
        return result.scalar() or 0

    async def soft_delete(self, id: int) -> bool:
        """Soft delete a record by ID (sets deleted_at timestamp)"""
        from datetime import datetime
        result = await self.db.execute(
            update(self.model).where(self.model.id == id).values(deleted_at=datetime.utcnow())
        )
        await self.db.flush()
        return result.rowcount > 0
