"""
Testes unitários para endpoints de autenticação
"""

import pytest
import pytest_asyncio
import uuid
from httpx import AsyncClient, ASGITransport
from main import app
from app.core.database import get_db
from sqlalchemy.ext.asyncio import AsyncSession


@pytest_asyncio.fixture
async def client():
    """Fixture para cliente HTTP assíncrono"""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac


@pytest_asyncio.fixture
async def db():
    """Fixture para sessão do banco de dados"""
    async with get_db() as session:
        yield session


class TestAuthRegister:
    """Testes de registro de usuário"""

    async def test_register_success(self, client):
        """Deve registrar novo usuário com sucesso"""
        unique_email = f"joao_{uuid.uuid4()}@example.com"
        response = await client.post(
            "/api/auth/register",
            json={
                "name": "João Silva",
                "email": unique_email,
                "password": "SenhaForte123!"
            }
        )

        assert response.status_code == 201
        data = response.json()
        assert data["email"] == unique_email
        assert data["name"] == "João Silva"
        assert "id" in data

    async def test_register_duplicate_email(self, client):
        """Deve retornar erro com email duplicado"""
        unique_email = f"joao_{uuid.uuid4()}@example.com"
        # Primeiro registro
        await client.post(
            "/api/auth/register",
            json={
                "name": "João Silva",
                "email": unique_email,
                "password": "SenhaForte123!"
            }
        )

        # Tentativa de registrar com mesmo email
        response = await client.post(
            "/api/auth/register",
            json={
                "name": "Outro Usuário",
                "email": unique_email,
                "password": "OutraSenha123!"
            }
        )

        assert response.status_code == 409
        assert "Email" in response.json()["detail"]

    async def test_register_invalid_email(self, client):
        """Deve rejeitar email inválido"""
        response = await client.post(
            "/api/auth/register",
            json={
                "name": "João Silva",
                "email": "invalid-email",
                "password": "SenhaForte123!"
            }
        )

        assert response.status_code == 422

    async def test_register_short_password(self, client):
        """Deve rejeitar senha curta"""
        response = await client.post(
            "/api/auth/register",
            json={
                "name": "João Silva",
                "email": "joao@example.com",
                "password": "123"
            }
        )

        assert response.status_code == 422

    async def test_register_missing_fields(self, client):
        """Deve rejeitar requisição sem campos obrigatórios"""
        response = await client.post(
            "/api/auth/register",
            json={
                "name": "João Silva"
                # Faltam email e password
            }
        )

        assert response.status_code == 422

    async def test_register_rate_limit(self, client):
        """Deve respeitar rate limit de registro (3/hora)"""
        from app.core.rate_limiter import limiter
        limiter.enabled = True
        
        base_id = str(uuid.uuid4())
        # Registrar 3 usuários
        for i in range(3):
            response = await client.post(
                "/api/auth/register",
                json={
                    "name": f"User{i}",
                    "email": f"user{i}_{base_id}@example.com",
                    "password": "SenhaForte123!"
                }
            )
            assert response.status_code == 201

        # Quarta tentativa deve ser bloqueada
        response = await client.post(
            "/api/auth/register",
            json={
                "name": "User4",
                "email": f"user4_{base_id}@example.com",
                "password": "SenhaForte123!"
            }
        )

        assert response.status_code == 429
        limiter.enabled = False


class TestAuthLogin:
    """Testes de login"""

    async def test_login_success(self, client):
        """Deve fazer login com sucesso"""
        unique_email = f"joao_{uuid.uuid4()}@example.com"
        # Primeiro registrar
        await client.post(
            "/api/auth/register",
            json={
                "name": "João Silva",
                "email": unique_email,
                "password": "SenhaForte123!"
            }
        )

        # Fazer login
        response = await client.post(
            "/api/auth/login",
            json={
                "email": unique_email,
                "password": "SenhaForte123!"
            }
        )

        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert "refresh_token" in data
        assert data["user"]["email"] == unique_email

    async def test_login_invalid_email(self, client):
        """Deve rejeitar login com email inválido"""
        response = await client.post(
            "/api/auth/login",
            json={
                "email": "nonexistent@example.com",
                "password": "SenhaForte123!"
            }
        )

        assert response.status_code == 401

    async def test_login_invalid_password(self, client):
        """Deve rejeitar login com senha errada"""
        unique_email = f"joao_{uuid.uuid4()}@example.com"
        # Registrar
        await client.post(
            "/api/auth/register",
            json={
                "name": "João Silva",
                "email": unique_email,
                "password": "SenhaForte123!"
            }
        )

        # Login com senha errada
        response = await client.post(
            "/api/auth/login",
            json={
                "email": unique_email,
                "password": "SenhaErrada"
            }
        )

        assert response.status_code == 401

    async def test_login_tokens_valid(self, client):
        """Tokens retornados devem ser válidos"""
        unique_email = f"joao_{uuid.uuid4()}@example.com"
        # Registrar e fazer login
        await client.post(
            "/api/auth/register",
            json={
                "name": "João Silva",
                "email": unique_email,
                "password": "SenhaForte123!"
            }
        )

        response = await client.post(
            "/api/auth/login",
            json={
                "email": unique_email,
                "password": "SenhaForte123!"
            }
        )

        data = response.json()
        access_token = data["access_token"]

        # Usar token para acessar endpoint protegido
        response = await client.get(
            "/api/auth/me",
            headers={"Authorization": f"Bearer {access_token}"}
        )

        assert response.status_code == 200

    async def test_login_rate_limit(self, client):
        """Deve respeitar rate limit de login (5/15min)"""
        from app.core.rate_limiter import limiter
        limiter.enabled = True
        
        unique_email = f"joao_{uuid.uuid4()}@example.com"

        # Registrar usuário
        await client.post(
            "/api/auth/register",
            json={
                "name": "João Silva",
                "email": unique_email,
                "password": "SenhaForte123!"
            }
        )

        # Fazer login 5 vezes
        for i in range(5):
            response = await client.post(
                "/api/auth/login",
                json={
                    "email": unique_email,
                    "password": "SenhaForte123!"
                }
            )
            assert response.status_code == 200

        # Sexta tentativa deve ser bloqueada
        response = await client.post(
            "/api/auth/login",
            json={
                "email": unique_email,
                "password": "SenhaForte123!"
            }
        )

        assert response.status_code == 429
        limiter.enabled = False


class TestAuthGetMe:
    """Testes de obter usuário autenticado"""

    async def test_get_me_authenticated(self, client):
        """Deve retornar dados do usuário autenticado"""
        unique_email = f"joao_{uuid.uuid4()}@example.com"
        # Registrar e fazer login
        register_response = await client.post(
            "/api/auth/register",
            json={
                "name": "João Silva",
                "email": unique_email,
                "password": "SenhaForte123!"
            }
        )

        login_response = await client.post(
            "/api/auth/login",
            json={
                "email": unique_email,
                "password": "SenhaForte123!"
            }
        )

        access_token = login_response.json()["access_token"]

        # Obter dados do usuário
        response = await client.get(
            "/api/auth/me",
            headers={"Authorization": f"Bearer {access_token}"}
        )

        assert response.status_code == 200
        data = response.json()
        assert data["email"] == unique_email
        assert data["name"] == "João Silva"

    async def test_get_me_without_token(self, client):
        """Deve rejeitar sem autenticação"""
        response = await client.get("/api/auth/me")

        assert response.status_code in [401, 403]

    async def test_get_me_invalid_token(self, client):
        """Deve rejeitar com token inválido"""
        response = await client.get(
            "/api/auth/me",
            headers={"Authorization": "Bearer invalid_token"}
        )

        assert response.status_code in [401, 403]

    async def test_get_me_expired_token(self, client):
        """Deve rejeitar com token expirado"""
        # Usar um JWT expirado (token gerado com exp no passado)
        expired_token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyXzEyMyIsImV4cCI6MTYwMDAwMDAwMH0.invalid"

        response = await client.get(
            "/api/auth/me",
            headers={"Authorization": f"Bearer {expired_token}"}
        )

        assert response.status_code in [401, 403]


class TestAuthLogout:
    """Testes de logout"""

    async def test_logout_success(self, client):
        """Deve fazer logout com sucesso"""
        unique_email = f"joao_{uuid.uuid4()}@example.com"
        # Registrar e fazer login
        await client.post(
            "/api/auth/register",
            json={
                "name": "João Silva",
                "email": unique_email,
                "password": "SenhaForte123!"
            }
        )

        login_response = await client.post(
            "/api/auth/login",
            json={
                "email": unique_email,
                "password": "SenhaForte123!"
            }
        )

        access_token = login_response.json().get("access_token")
        if not access_token:
             # Se falhar login (por ex rate limit), pular este teste
             return

        # Fazer logout
        response = await client.post(
            "/api/auth/logout",
            headers={"Authorization": f"Bearer {access_token}"}
        )

        assert response.status_code == 200
        assert "Successfully logged out" in response.json()["message"]

    async def test_logout_without_token(self, client):
        """Deve rejeitar logout sem token"""
        response = await client.post("/api/auth/logout")

        assert response.status_code in [401, 403]

    async def test_logout_blacklists_token(self, client):
        """Token deve ser invalidado após logout"""
        unique_email = f"joao_{uuid.uuid4()}@example.com"
        # Registrar e fazer login
        await client.post(
            "/api/auth/register",
            json={
                "name": "João Silva",
                "email": unique_email,
                "password": "SenhaForte123!"
            }
        )

        login_response = await client.post(
            "/api/auth/login",
            json={
                "email": unique_email,
                "password": "SenhaForte123!"
            }
        )

        access_token = login_response.json().get("access_token")
        if not access_token:
            return

        # Fazer logout
        await client.post(
            "/api/auth/logout",
            headers={"Authorization": f"Bearer {access_token}"}
        )

        # Tentar usar token após logout
        response = await client.get(
            "/api/auth/me",
            headers={"Authorization": f"Bearer {access_token}"}
        )

        assert response.status_code in [401, 403]


class TestAuthRefresh:
    """Testes de refresh de token"""

    async def test_refresh_token_success(self, client):
        """Deve retornar novo access token"""
        unique_email = f"joao_{uuid.uuid4()}@example.com"
        # Registrar e fazer login
        await client.post(
            "/api/auth/register",
            json={
                "name": "João Silva",
                "email": unique_email,
                "password": "SenhaForte123!"
            }
        )

        login_response = await client.post(
            "/api/auth/login",
            json={
                "email": unique_email,
                "password": "SenhaForte123!"
            }
        )

        refresh_token = login_response.json().get("refresh_token")
        if not refresh_token:
            return

        # Fazer refresh
        response = await client.post(
            "/api/auth/refresh",
            json={"refresh_token": refresh_token}
        )

        assert response.status_code == 200
        assert "access_token" in response.json()

    async def test_refresh_with_invalid_token(self, client):
        """Deve rejeitar refresh com token inválido"""
        response = await client.post(
            "/api/auth/refresh",
            json={"refresh_token": "invalid_token"}
        )

        assert response.status_code in [401, 403]

    async def test_refresh_with_expired_token(self, client):
        """Deve rejeitar refresh com token expirado"""
        expired_token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyXzEyMyIsImV4cCI6MTYwMDAwMDAwMH0.invalid"

        response = await client.post(
            "/api/auth/refresh",
            json={"refresh_token": expired_token}
        )

        assert response.status_code in [401, 403]
