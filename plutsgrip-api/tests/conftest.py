"""
Pytest configuration and fixtures for testing
"""
import pytest
import pytest_asyncio
import asyncio
from typing import AsyncGenerator, Generator
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy import text
from app.core.database import Base, get_db
from main import app
from app.core.rate_limiter import limiter

@pytest.fixture(scope="session")
def event_loop():
    """Foundational event loop fixture for async tests"""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()

@pytest.fixture(autouse=True)
def disable_rate_limit():
    """Disable rate limiting by default for tests"""
    limiter.enabled = False
    # Clear storage to ensure fresh state if we do enable it
    # accessing the private storage attribute if necessary, or assuming in-memory
    if hasattr(limiter, '_storage'):
         limiter._storage.reset()
    yield
    limiter.enabled = True # Restore default (or Settings default)


# Test database URL (use a separate database for testing)
# Use "postgres" as hostname when running in Docker, "localhost" when running locally
TEST_DATABASE_URL = "postgresql+asyncpg://plutusgrip_user:plutusgrip_password@postgres:5432/plutusgrip_test_db"
# Connection to postgres default database to create test database
POSTGRES_URL = "postgresql+asyncpg://plutusgrip_user:plutusgrip_password@postgres:5432/postgres"


async def create_test_database_if_not_exists():
    """Create test database if it doesn't exist"""
    try:
        engine = create_async_engine(POSTGRES_URL, echo=False, isolation_level="AUTOCOMMIT")
        async with engine.begin() as conn:
            # Check if database exists
            result = await conn.execute(
                text("SELECT 1 FROM pg_database WHERE datname = 'plutusgrip_test_db'")
            )
            if not result.fetchone():
                # Create database
                await conn.execute(text("CREATE DATABASE plutusgrip_test_db"))
        await engine.dispose()
    except Exception as e:
        # If database creation fails, the test_engine fixture will handle the error
        pass


@pytest_asyncio.fixture(scope="function")
async def test_engine():
    """Create a test database engine"""
    # Ensure test database exists
    await create_test_database_if_not_exists()

    engine = create_async_engine(TEST_DATABASE_URL, echo=False, pool_pre_ping=True)

    # Create all tables (Force clean state using schema drop)
    async with engine.begin() as conn:
        # Check if we can just drop invalid tables, but resetting schema is safer for tests
        try:
            await conn.execute(text("DROP SCHEMA public CASCADE"))
            await conn.execute(text("CREATE SCHEMA public"))
            await conn.execute(text("GRANT ALL ON SCHEMA public TO plutusgrip_user"))
            # Standard postgres public schema permissions
            await conn.execute(text("GRANT ALL ON SCHEMA public TO public"))
        except Exception:
            # Fallback if schema ops fail (e.g. permissions)
            await conn.run_sync(Base.metadata.drop_all)
            
        await conn.run_sync(Base.metadata.create_all)

    yield engine

    # Drop all tables after tests
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)

    await engine.dispose()


@pytest_asyncio.fixture(scope="function")
async def test_db(test_engine) -> AsyncGenerator[AsyncSession, None]:
    """
    Create a test database session

    Each test gets a fresh transaction that is rolled back after the test
    """
    async_session = async_sessionmaker(
        test_engine,
        class_=AsyncSession,
        expire_on_commit=False,
        autoflush=False,
        autocommit=False
    )

    async with async_session() as session:
        yield session
        await session.rollback()


@pytest_asyncio.fixture(scope="function")
async def client(test_db: AsyncSession) -> AsyncClient:
    """
    Create a test client with overridden database dependency

    Usage in tests:
        async def test_something(client):
            response = await client.get("/api/endpoint")
            assert response.status_code == 200
    """
    # Override the database dependency
    async def override_get_db():
        yield test_db

    app.dependency_overrides[get_db] = override_get_db

    # Create AsyncClient with ASGI transport for FastAPI
    transport = ASGITransport(app=app)
    test_client = AsyncClient(transport=transport, base_url="http://test")

    try:
        yield test_client
    finally:
        # Clean up
        await test_client.aclose()
        app.dependency_overrides.clear()


@pytest_asyncio.fixture(scope="function")
async def sample_user(test_db: AsyncSession) -> dict:
    """
    Create a sample user for testing

    Returns:
        Dictionary with user data including password

    TODO: Implement user creation logic
    """
    from app.models.user import User
    from app.core.security import get_password_hash

    user_data = {
        "name": "Test User",
        "email": "test@example.com",
        "password": "TestPass123!"
    }

    user = User(
        name=user_data["name"],
        email=user_data["email"],
        hashed_password=get_password_hash(user_data["password"])
    )

    test_db.add(user)
    await test_db.commit()
    await test_db.refresh(user)

    return {
        **user_data,
        "id": user.id
    }


@pytest_asyncio.fixture(scope="function")
async def authenticated_client(client, sample_user: dict):
    """
    Create an authenticated test client

    Usage in tests:
        async def test_protected_endpoint(authenticated_client):
            response = await authenticated_client.get("/api/auth/me")
            assert response.status_code == 200
    """
    from app.core.security import create_access_token

    # Create token directly instead of using login endpoint to avoid rate limiting
    token = create_access_token(data={"sub": str(sample_user["id"])})

    # Add authentication header to client
    client.headers["Authorization"] = f"Bearer {token}"

    return client
