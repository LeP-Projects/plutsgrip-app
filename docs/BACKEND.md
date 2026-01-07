# Documentação do Backend - PlutusGrip API

<div align="center">

**Documentação Completa do Backend para o PlutusGrip Finance Tracker**

FastAPI + Python 3.11 + PostgreSQL + Async SQLAlchemy

[Voltar ao Índice](./INDEX.md) | [Docs do Frontend](./FRONTEND.md) | [Guia de Deploy](../DEPLOY_GUIDE.md)

</div>

---

## Índice

1. [Visão Geral](#visão-geral)
2. [Arquitetura](#arquitetura)
3. [Instruções de Configuração](#instruções-de-configuração)
4. [Referência dos Endpoints da API](#referência-dos-endpoints-da-api)
5. [Schema do Banco de Dados](#schema-do-banco-de-dados)
6. [Sistema de Autenticação](#sistema-de-autenticação)
7. [Guia de Testes](#guia-de-testes)
8. [Deploy](#deploy)
9. [Troubleshooting](#troubleshooting)
10. [Fluxo de Trabalho de Desenvolvimento](#fluxo-de-trabalho-de-desenvolvimento)

---

## Visão Geral

### Stack Tecnológica

O backend do PlutusGrip é construído com tecnologias Python modernas:

| Tecnologia | Versão | Propósito |
|------------|---------|---------|
| **Python** | 3.11+ | Linguagem de programação principal |
| **FastAPI** | 0.120.1 | Framework web assíncrono de alta performance |
| **SQLAlchemy** | 2.0.36 | ORM assíncrono para operações de banco de dados |
| **Pydantic** | 2.12.3 | Validação de dados e gerenciamento de configurações |
| **PostgreSQL** | 15+ | Banco de dados principal (Neon em produção) |
| **Alembic** | 1.14.0 | Migrações de banco de dados |
| **Uvicorn** | 0.38.0 | Servidor ASGI |
| **Pytest** | 8.3.4 | Framework de testes |

### Funcionalidades Principais

- **Arquitetura Assíncrona**: Suporte completo a async/await para alta performance
- **Autenticação JWT**: Autenticação segura baseada em tokens com refresh tokens
- **Rate Limiting**: Proteção da API com suporte a whitelist de IP
- **Documentação Auto-Gerada**: Documentação Swagger UI e ReDoc
- **Type Safety**: Type hints completos com validação Pydantic
- **Migrações de Banco de Dados**: Alembic para mudanças de schema versionadas
- **Testes Abrangentes**: 30+ testes com pytest
- **Design Modular**: Arquitetura limpa com repositories e services

### Estrutura do Projeto

```
plutsgrip-api/
├── app/
│   ├── api/
│   │   └── v1/
│   │       ├── endpoints/          # Módulos de endpoints da API
│   │       │   ├── auth.py         # Endpoints de autenticação
│   │       │   ├── transactions.py # Gerenciamento de transações
│   │       │   ├── categories.py   # Gerenciamento de categorias
│   │       │   ├── budgets.py      # Rastreamento de orçamentos
│   │       │   ├── goals.py        # Metas financeiras
│   │       │   ├── recurring_transactions.py
│   │       │   ├── reports.py      # Analytics e relatórios
│   │       │   └── whitelist.py    # Whitelist de rate limit
│   │       └── router.py           # Router principal da API
│   │
│   ├── core/                       # Funcionalidade principal
│   │   ├── config.py              # Gerenciamento de configuração
│   │   ├── database.py            # Conexão com banco de dados
│   │   ├── security.py            # JWT e hash de senhas
│   │   ├── rate_limiter.py        # Rate limiting
│   │   └── logging.py             # Configuração de logging
│   │
│   ├── models/                     # Modelos SQLAlchemy
│   │   ├── user.py                # Modelo de usuário
│   │   ├── transaction.py         # Modelo de transação
│   │   ├── category.py            # Modelo de categoria
│   │   ├── budget.py              # Modelo de orçamento
│   │   ├── goal.py                # Modelo de meta
│   │   ├── recurring_transaction.py
│   │   └── rate_limit_whitelist.py
│   │
│   ├── schemas/                    # Schemas Pydantic
│   │   ├── user.py                # Schemas de validação de usuário
│   │   ├── transaction.py         # Schemas de transação
│   │   ├── category.py            # Schemas de categoria
│   │   └── ...
│   │
│   ├── repositories/               # Camada de acesso a dados
│   │   ├── user_repository.py
│   │   ├── transaction_repository.py
│   │   └── ...
│   │
│   ├── services/                   # Camada de lógica de negócio
│   │   ├── auth_service.py
│   │   ├── transaction_service.py
│   │   └── ...
│   │
│   └── middlewares/                # Middlewares customizados
│       └── error_handler.py
│
├── alembic/                        # Migrações de banco de dados
│   ├── versions/                   # Arquivos de migração
│   └── env.py                      # Configuração do Alembic
│
├── tests/                          # Suite de testes
│   ├── conftest.py                # Configuração de testes
│   ├── test_auth.py               # Testes de autenticação
│   └── ...
│
├── main.py                         # Ponto de entrada da aplicação
├── requirements.txt                # Dependências Python
├── .env                           # Variáveis de ambiente (não no git)
├── .env.example                   # Arquivo de exemplo de ambiente
└── pytest.ini                     # Configuração do Pytest
```

---

## Arquitetura

### Arquitetura em Camadas

O backend segue uma arquitetura limpa em camadas:

```
┌─────────────────────────────────────────┐
│      Camada de API (Endpoints)          │
│     Rotas FastAPI & Validação           │
└────────────────┬────────────────────────┘
                 │
┌────────────────▼────────────────────────┐
│     Camada de Serviço (Negócio)         │
│  Lógica de Negócio & Orquestração       │
└────────────────┬────────────────────────┘
                 │
┌────────────────▼────────────────────────┐
│   Camada de Repository (Acesso a Dados) │
│        Consultas & CRUD do Banco        │
└────────────────┬────────────────────────┘
                 │
┌────────────────▼────────────────────────┐
│         Banco de Dados (PostgreSQL)     │
│      Neon PostgreSQL em Produção        │
└─────────────────────────────────────────┘
```

### Padrões de Design

1. **Padrão Repository**: Abstrai a lógica de acesso a dados
2. **Padrão Service**: Encapsula a lógica de negócio
3. **Injeção de Dependência**: `Depends()` do FastAPI para dependências limpas
4. **Padrão Factory**: Gerenciamento de configurações e sessão de banco de dados

### Arquitetura Assíncrona

Todas as operações de banco de dados são totalmente assíncronas para máxima performance:

```python
# Sessão de banco de dados assíncrona
async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        yield session

# Endpoint assíncrono
@router.get("/transactions")
async def list_transactions(db: AsyncSession = Depends(get_db)):
    transactions = await transaction_service.get_user_transactions(db)
    return transactions
```

---

## Instruções de Configuração

### Pré-requisitos

- Python 3.11 ou superior
- PostgreSQL 15+ (ou conta Neon)
- Git
- pip e virtualenv

### Configuração de Desenvolvimento Local

#### 1. Clonar o Repositório

```bash
git clone https://github.com/LeP-Projects/plutsgrip-app.git
cd plutsgrip-app/plutsgrip-api
```

#### 2. Criar Ambiente Virtual

```bash
# Windows
python -m venv venv
venv\Scripts\activate

# Linux/Mac
python3 -m venv venv
source venv/bin/activate
```

#### 3. Instalar Dependências

```bash
pip install --upgrade pip
pip install -r requirements.txt
```

#### 4. Configurar Variáveis de Ambiente

Crie um arquivo `.env` no diretório `plutsgrip-api/`:

```env
# Aplicação
APP_NAME=PlutusGrip Finance Tracker API
APP_VERSION=1.0.0
APP_ENV=development
DEBUG=true

# Servidor
HOST=0.0.0.0
PORT=8000

# Banco de Dados (PostgreSQL Local)
DATABASE_URL=postgresql://plutusgrip_user:plutusgrip_password@localhost:5432/plutusgrip_db
DATABASE_ECHO=false

# Banco de Dados (Neon - Produção)
# DATABASE_URL=postgresql://neondb_owner:password@ep-xxx.sa-east-1.aws.neon.tech/neondb?sslmode=require

# Rate Limiting
RATE_LIMIT_ENABLED=true

# Segurança
SECRET_KEY=your-super-secret-key-change-this-in-production-min-32-chars
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# CORS
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173,http://localhost:5174
ALLOWED_METHODS=GET,POST,PUT,DELETE,OPTIONS,PATCH
ALLOWED_HEADERS=*

# Logging
LOG_LEVEL=INFO
LOG_FILE=logs/app.log
LOG_MAX_BYTES=10485760
LOG_BACKUP_COUNT=5

# Paginação
DEFAULT_PAGE_SIZE=20
MAX_PAGE_SIZE=100
```

#### 5. Configurar PostgreSQL Local (Opcional)

Se estiver usando PostgreSQL local em vez do Neon:

```bash
# Instalar PostgreSQL
# Windows: Baixe de https://www.postgresql.org/download/
# Linux: sudo apt install postgresql postgresql-contrib
# Mac: brew install postgresql

# Criar banco de dados e usuário
psql -U postgres
CREATE DATABASE plutusgrip_db;
CREATE USER plutusgrip_user WITH PASSWORD 'plutusgrip_password';
GRANT ALL PRIVILEGES ON DATABASE plutusgrip_db TO plutusgrip_user;
\q
```

#### 6. Executar Migrações do Banco de Dados

```bash
# Inicializar Alembic (se ainda não estiver feito)
alembic init alembic

# Criar migração inicial
alembic revision --autogenerate -m "Initial migration"

# Aplicar migrações
alembic upgrade head
```

#### 7. Iniciar o Servidor de Desenvolvimento

```bash
# Opção 1: Usando Python diretamente
python main.py

# Opção 2: Usando Uvicorn
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Opção 3: Com auto-reload e logging
uvicorn main:app --reload --log-level debug
```

#### 8. Verificar Instalação

Abra seu navegador e visite:

- API Health: http://localhost:8000/health
- API Docs (Swagger): http://localhost:8000/docs
- API Docs (ReDoc): http://localhost:8000/redoc

Você deve ver um status saudável e documentação interativa da API.

### Configuração de Desenvolvimento com Docker

Para desenvolvimento containerizado:

```bash
# Da raiz do projeto
docker-compose -f docker-compose.dev.yml up

# Ou usando Makefile
make up

# Ver logs
make logs-api

# Acessar shell
make shell
```

---

## Referência dos Endpoints da API

### URL Base

- **Local**: `http://localhost:8000/api`
- **Produção**: `http://68.183.98.186/api`

### Autenticação

Todos os endpoints exceto `/auth/register` e `/auth/login` requerem autenticação JWT:

```
Authorization: Bearer <access_token>
```

### Categorias de Endpoints

| Categoria | Endpoints | Descrição |
|----------|-----------|-------------|
| **Autenticação** | 5 endpoints | Registro de usuário, login, logout, refresh de token |
| **Transações** | 5 endpoints | Operações CRUD para transações |
| **Categorias** | 5 endpoints | Gerenciamento de categorias (padrão + customizadas) |
| **Orçamentos** | 5 endpoints | Criação e rastreamento de orçamentos |
| **Metas** | 5 endpoints | Gerenciamento de metas financeiras |
| **Transações Recorrentes** | 5 endpoints | Transações recorrentes automatizadas |
| **Relatórios** | 6 endpoints | Analytics e relatórios financeiros |
| **Whitelist** | 3 endpoints | Gerenciamento de whitelist de rate limit de IP |

### 1. Endpoints de Autenticação

#### 1.1 Registrar Usuário

```http
POST /api/auth/register
```

**Corpo da Requisição:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "password_confirmation": "SecurePass123!"
}
```

**Resposta (201):**
```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "currency": "BRL",
  "timezone": "UTC",
  "created_at": "2026-01-07T10:00:00Z"
}
```

**Rate Limit:** 3 requisições por hora por IP

---

#### 1.2 Login

```http
POST /api/auth/login
```

**Corpo da Requisição:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Resposta (200):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "currency": "BRL",
    "timezone": "UTC"
  }
}
```

**Rate Limit:** 5 requisições por 15 minutos por IP

---

#### 1.3 Refresh Token

```http
POST /api/auth/refresh
```

**Corpo da Requisição:**
```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Resposta (200):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

---

#### 1.4 Logout

```http
POST /api/auth/logout
Authorization: Bearer <token>
```

**Resposta (200):**
```json
{
  "message": "Successfully logged out",
  "detail": "Token has been revoked. Please remove it from client storage."
}
```

---

#### 1.5 Obter Usuário Atual

```http
GET /api/auth/me
Authorization: Bearer <token>
```

**Resposta (200):**
```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "currency": "BRL",
  "timezone": "UTC",
  "created_at": "2026-01-07T10:00:00Z"
}
```

---

### 2. Endpoints de Transação

#### 2.1 Listar Transações

```http
GET /api/transactions?page=1&page_size=20&type=expense&category=5
Authorization: Bearer <token>
```

**Parâmetros de Consulta:**

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|----------|-------------|
| page | integer | Não | Número da página (padrão: 1) |
| page_size | integer | Não | Itens por página (padrão: 20, máx: 100) |
| type | string | Não | Filtrar por tipo: `income` ou `expense` |
| category | integer | Não | Filtrar por ID da categoria |

**Resposta (200):**
```json
{
  "transactions": [
    {
      "id": 1,
      "description": "Grocery shopping",
      "amount": 150.00,
      "currency": "BRL",
      "date": "2026-01-07",
      "type": "expense",
      "category_id": 5,
      "category": {
        "id": 5,
        "name": "Alimentação",
        "color": "#FF6B6B",
        "icon": "utensils"
      },
      "notes": "Weekly groceries",
      "tags": "food,weekly",
      "is_recurring": false,
      "created_at": "2026-01-07T10:00:00Z"
    }
  ],
  "total": 1,
  "page": 1,
  "page_size": 20
}
```

---

#### 2.2 Obter Transação por ID

```http
GET /api/transactions/{transaction_id}
Authorization: Bearer <token>
```

**Resposta (200):**
```json
{
  "id": 1,
  "description": "Grocery shopping",
  "amount": 150.00,
  "currency": "BRL",
  "date": "2026-01-07",
  "type": "expense",
  "category_id": 5,
  "notes": "Weekly groceries",
  "tags": "food,weekly",
  "is_recurring": false,
  "created_at": "2026-01-07T10:00:00Z"
}
```

---

#### 2.3 Criar Transação

```http
POST /api/transactions
Authorization: Bearer <token>
```

**Corpo da Requisição:**
```json
{
  "description": "Salary",
  "amount": 5000.00,
  "currency": "BRL",
  "date": "2026-01-05",
  "type": "income",
  "category_id": 9,
  "notes": "Monthly salary",
  "tags": "salary,monthly"
}
```

**Resposta (201):**
```json
{
  "id": 2,
  "description": "Salary",
  "amount": 5000.00,
  "currency": "BRL",
  "date": "2026-01-05",
  "type": "income",
  "category_id": 9,
  "notes": "Monthly salary",
  "tags": "salary,monthly",
  "is_recurring": false,
  "created_at": "2026-01-07T10:30:00Z"
}
```

---

#### 2.4 Atualizar Transação

```http
PUT /api/transactions/{transaction_id}
Authorization: Bearer <token>
```

**Corpo da Requisição:**
```json
{
  "description": "Updated description",
  "amount": 160.00,
  "notes": "Updated notes"
}
```

**Resposta (200):**
```json
{
  "id": 1,
  "description": "Updated description",
  "amount": 160.00,
  "currency": "BRL",
  "date": "2026-01-07",
  "type": "expense",
  "category_id": 5,
  "notes": "Updated notes",
  "updated_at": "2026-01-07T11:00:00Z"
}
```

---

#### 2.5 Deletar Transação

```http
DELETE /api/transactions/{transaction_id}
Authorization: Bearer <token>
```

**Resposta (204):** Sem conteúdo

---

### 3. Endpoints de Categoria

#### 3.1 Listar Categorias

```http
GET /api/categories
Authorization: Bearer <token>
```

**Resposta (200):**
```json
{
  "categories": [
    {
      "id": 1,
      "name": "Alimentação",
      "type": "expense",
      "color": "#FF6B6B",
      "icon": "utensils",
      "is_default": true,
      "user_id": null
    },
    {
      "id": 13,
      "name": "Custom Category",
      "type": "expense",
      "color": "#3B82F6",
      "icon": "star",
      "is_default": false,
      "user_id": 1
    }
  ]
}
```

---

#### 3.2 Criar Categoria

```http
POST /api/categories
Authorization: Bearer <token>
```

**Corpo da Requisição:**
```json
{
  "name": "Home Office",
  "type": "expense",
  "color": "#8B5CF6",
  "icon": "home"
}
```

**Resposta (201):**
```json
{
  "id": 14,
  "name": "Home Office",
  "type": "expense",
  "color": "#8B5CF6",
  "icon": "home",
  "is_default": false,
  "user_id": 1,
  "created_at": "2026-01-07T12:00:00Z"
}
```

---

### 4. Endpoints de Orçamento

#### 4.1 Listar Orçamentos

```http
GET /api/budgets
Authorization: Bearer <token>
```

**Resposta (200):**
```json
{
  "budgets": [
    {
      "id": 1,
      "category_id": 5,
      "amount": 1000.00,
      "period": "monthly",
      "start_date": "2026-01-01",
      "end_date": "2026-01-31",
      "spent": 450.00,
      "remaining": 550.00,
      "percentage_used": 45.0
    }
  ]
}
```

---

### 5. Endpoints de Meta

#### 5.1 Listar Metas

```http
GET /api/goals
Authorization: Bearer <token>
```

**Resposta (200):**
```json
{
  "goals": [
    {
      "id": 1,
      "name": "Emergency Fund",
      "target_amount": 10000.00,
      "current_amount": 3500.00,
      "deadline": "2026-12-31",
      "status": "in_progress",
      "progress_percentage": 35.0
    }
  ]
}
```

---

### 6. Endpoints de Transação Recorrente

#### 6.1 Listar Transações Recorrentes

```http
GET /api/recurring-transactions
Authorization: Bearer <token>
```

**Resposta (200):**
```json
{
  "recurring_transactions": [
    {
      "id": 1,
      "description": "Netflix Subscription",
      "amount": 45.90,
      "frequency": "monthly",
      "type": "expense",
      "category_id": 4,
      "is_active": true,
      "next_occurrence": "2026-02-01"
    }
  ]
}
```

---

### 7. Endpoints de Relatório

#### 7.1 Obter Visão Geral

```http
GET /api/reports/overview?start_date=2026-01-01&end_date=2026-01-31
Authorization: Bearer <token>
```

**Resposta (200):**
```json
{
  "total_income": 5000.00,
  "total_expenses": 2350.00,
  "net_balance": 2650.00,
  "transaction_count": 25,
  "period": {
    "start": "2026-01-01",
    "end": "2026-01-31"
  }
}
```

---

#### 7.2 Obter Resumo por Categoria

```http
GET /api/reports/category-summary?start_date=2026-01-01&end_date=2026-01-31
Authorization: Bearer <token>
```

**Resposta (200):**
```json
{
  "categories": [
    {
      "category_id": 5,
      "category_name": "Alimentação",
      "total": 850.00,
      "percentage": 36.17,
      "transaction_count": 12
    }
  ]
}
```

---

#### 7.3 Obter Tendência Mensal

```http
GET /api/reports/monthly-trend?months=6
Authorization: Bearer <token>
```

**Resposta (200):**
```json
{
  "months": [
    {
      "month": "2026-01",
      "income": 5000.00,
      "expenses": 2350.00,
      "net": 2650.00
    }
  ]
}
```

---

### 8. Endpoints de Whitelist

#### 8.1 Listar IPs na Whitelist

```http
GET /api/whitelist
Authorization: Bearer <token>
```

**Resposta (200):**
```json
{
  "whitelist": [
    {
      "id": 1,
      "ip_address": "192.168.1.100",
      "description": "Office network",
      "is_active": true,
      "created_at": "2026-01-01T10:00:00Z"
    }
  ]
}
```

---

### Respostas de Erro

Todos os endpoints podem retornar os seguintes formatos de erro:

**400 Bad Request:**
```json
{
  "detail": "Invalid request data",
  "errors": [
    {
      "field": "amount",
      "message": "Must be greater than 0"
    }
  ]
}
```

**401 Unauthorized:**
```json
{
  "detail": "Invalid or expired token"
}
```

**404 Not Found:**
```json
{
  "detail": "Transaction not found"
}
```

**429 Too Many Requests:**
```json
{
  "detail": "Rate limit exceeded. Try again later."
}
```

---

## Schema do Banco de Dados

### Diagrama de Relacionamento de Entidades

```
┌──────────────┐         ┌──────────────────┐         ┌─────────────┐
│    Users     │         │   Transactions   │         │ Categories  │
├──────────────┤         ├──────────────────┤         ├─────────────┤
│ id (PK)      │◄───────┤│ id (PK)          │         │ id (PK)     │
│ name         │         │ user_id (FK)     │◄───────┤│ name        │
│ email        │         │ category_id (FK) │         │ type        │
│ hashed_pwd   │         │ description      │         │ color       │
│ currency     │         │ amount           │         │ icon        │
│ timezone     │         │ currency         │         │ is_default  │
│ created_at   │         │ date             │         │ user_id (FK)│
│ updated_at   │         │ type             │         │ created_at  │
│ deleted_at   │         │ notes            │         └─────────────┘
└──────────────┘         │ tags             │
       │                 │ is_recurring     │
       │                 │ created_at       │
       │                 │ updated_at       │
       │                 └──────────────────┘
       │
       ├──────────────────┬──────────────────┬─────────────────┐
       │                  │                  │                 │
       ▼                  ▼                  ▼                 ▼
  ┌─────────┐      ┌─────────────┐    ┌─────────┐     ┌──────────────┐
  │ Budgets │      │    Goals    │    │Recurring│     │  Whitelist   │
  ├─────────┤      ├─────────────┤    │Trans.   │     ├──────────────┤
  │ id (PK) │      │ id (PK)     │    ├─────────┤     │ id (PK)      │
  │user_id  │      │ user_id (FK)│    │ id (PK) │     │ ip_address   │
  │category │      │ name        │    │user_id  │     │ description  │
  │ amount  │      │ target_amt  │    │descrip. │     │ is_active    │
  │ period  │      │ current_amt │    │ amount  │     │ created_at   │
  │start_dt │      │ deadline    │    │frequency│     └──────────────┘
  │ end_dt  │      │ status      │    │type     │
  └─────────┘      └─────────────┘    └─────────┘
```

### Modelos do Banco de Dados

#### Modelo User

**Arquivo:** `plutsgrip-api/app/models/user.py`

```python
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    currency = Column(String(3), nullable=False, default="BRL")
    timezone = Column(String(50), nullable=False, default="UTC")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, onupdate=datetime.utcnow)
    deleted_at = Column(DateTime, nullable=True)

    # Relacionamentos
    transactions = relationship("Transaction", back_populates="user")
    categories = relationship("Category", back_populates="user")
    budgets = relationship("Budget", back_populates="user")
    goals = relationship("Goal", back_populates="user")
    recurring_transactions = relationship("RecurringTransaction", back_populates="user")
```

#### Modelo Transaction

**Arquivo:** `plutsgrip-api/app/models/transaction.py`

```python
class Transaction(Base):
    __tablename__ = "transactions"

    __table_args__ = (
        CheckConstraint("amount > 0", name='check_amount_positive'),
        Index('ix_transactions_user_id_date', 'user_id', 'date',
              postgresql_using='btree', postgresql_ops={'date': 'DESC'}),
    )

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    category_id = Column(Integer, ForeignKey("categories.id", ondelete="SET NULL"), nullable=True)
    description = Column(String(255), nullable=False)
    amount = Column(Numeric(precision=10, scale=2), nullable=False)
    currency = Column(String(3), nullable=True)
    date = Column(Date, nullable=False)
    type = Column(Enum(TransactionType), nullable=False)  # income/expense
    notes = Column(Text, nullable=True)
    tags = Column(String(255), nullable=True)
    is_recurring = Column(Boolean, default=False)
    recurring_transaction_id = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, onupdate=datetime.utcnow)
    deleted_at = Column(DateTime, nullable=True)

    # Relacionamentos
    user = relationship("User", back_populates="transactions")
    category = relationship("Category", back_populates="transactions")
```

#### Modelo Category

**Arquivo:** `plutsgrip-api/app/models/category.py`

```python
class TransactionType(str, Enum):
    INCOME = "income"
    EXPENSE = "expense"

class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    type = Column(Enum(TransactionType), nullable=False)
    color = Column(String(7), nullable=False)  # Cor Hex
    icon = Column(String(50), nullable=False)
    is_default = Column(Boolean, default=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relacionamentos
    user = relationship("User", back_populates="categories")
    transactions = relationship("Transaction", back_populates="category")
    budgets = relationship("Budget", back_populates="category")
```

### Migrações do Banco de Dados

O PlutusGrip usa **Alembic** para controle de versão do banco de dados.

#### Criando uma Nova Migração

```bash
cd plutsgrip-api

# Ativar ambiente virtual
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate     # Windows

# Criar migração após modificar modelos
alembic revision --autogenerate -m "Add new column to transactions"

# Revisar a migração gerada em alembic/versions/

# Aplicar migração
alembic upgrade head
```

#### Comandos de Migração

```bash
# Verificar versão atual da migração
alembic current

# Ver histórico de migrações
alembic history --verbose

# Atualizar para a última versão
alembic upgrade head

# Reverter uma versão
alembic downgrade -1

# Reverter para revisão específica
alembic downgrade <revision_id>

# Atualizar para revisão específica
alembic upgrade <revision_id>
```

#### Exemplo de Arquivo de Migração

**Arquivo:** `plutsgrip-api/alembic/versions/001_initial_migration.py`

```python
"""Initial migration

Revision ID: 001
Create Date: 2026-01-07 10:00:00
"""
from alembic import op
import sqlalchemy as sa

revision = '001'
down_revision = None
branch_labels = None
depends_on = None

def upgrade():
    # Criar tabela users
    op.create_table(
        'users',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=100), nullable=False),
        sa.Column('email', sa.String(length=255), nullable=False),
        sa.Column('hashed_password', sa.String(length=255), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('email')
    )
    op.create_index(op.f('ix_users_email'), 'users', ['email'])

def downgrade():
    op.drop_index(op.f('ix_users_email'), table_name='users')
    op.drop_table('users')
```

### Banco de Dados de Produção (Neon PostgreSQL)

O deploy de produção usa **Neon PostgreSQL**:

- **Projeto:** PlutusGrip (rough-pond-76369130)
- **Branch:** br-orange-star-acm7oh7g
- **Região:** sa-east-1 (São Paulo, Brasil)
- **Plano:** Free Tier (0.5 GB de armazenamento)
- **SSL:** Obrigatório (`sslmode=require`)

**Formato da String de Conexão:**
```
postgresql://neondb_owner:password@ep-xxx.sa-east-1.aws.neon.tech/neondb?sslmode=require
```

**Funcionalidades:**
- PostgreSQL Serverless
- Backups automáticos
- Desenvolvimento baseado em branches
- 0.5 GB de armazenamento no plano gratuito
- Connection pooling
- Baixa latência na América do Sul

---

## Sistema de Autenticação

O PlutusGrip usa autenticação **JWT (JSON Web Token)** com refresh tokens.

### Fluxo de Autenticação

```
┌─────────┐                                       ┌─────────┐
│ Cliente │                                       │   API   │
└────┬────┘                                       └────┬────┘
     │                                                 │
     │ 1. POST /auth/register ou /login                │
     │─────────────────────────────────────────────►  │
     │    {email, password}                            │
     │                                                 │
     │ 2. Gerar tokens JWT                             │
     │  ◄─────────────────────────────────────────────│
     │    {access_token, refresh_token, user}          │
     │                                                 │
     │ 3. Armazenar tokens no localStorage/cookie      │
     │                                                 │
     │ 4. Requisição com header Authorization          │
     │─────────────────────────────────────────────►  │
     │    Authorization: Bearer <access_token>         │
     │                                                 │
     │ 5. Verificar JWT & retornar dados               │
     │  ◄─────────────────────────────────────────────│
     │    {data}                                       │
     │                                                 │
     │ 6. Access token expira (401)                    │
     │  ◄─────────────────────────────────────────────│
     │    {detail: "Token expired"}                    │
     │                                                 │
     │ 7. POST /auth/refresh                           │
     │─────────────────────────────────────────────►  │
     │    {refresh_token}                              │
     │                                                 │
     │ 8. Retornar novo access token                   │
     │  ◄─────────────────────────────────────────────│
     │    {access_token}                               │
     │                                                 │
```

### Estrutura do Token JWT

**Access Token:**
- **Expira:** 30 minutos (configurável)
- **Contém:** user_id, email, issued_at, expires_at
- **Propósito:** Autenticar requisições da API

**Refresh Token:**
- **Expira:** 7 dias (configurável)
- **Contém:** user_id, token_type, issued_at, expires_at
- **Propósito:** Obter novos access tokens sem fazer login novamente

### Implementação de Segurança

**Arquivo:** `plutsgrip-api/app/core/security.py`

```python
from datetime import datetime, timedelta
from jose import jwt, JWTError
from passlib.context import CryptContext
from app.core.config import settings

# Hash de senha
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    """Hash de uma senha em texto plano"""
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verificar senha contra hash"""
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict) -> str:
    """Criar token JWT de acesso"""
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire, "type": "access"})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

def create_refresh_token(data: dict) -> str:
    """Criar token JWT de refresh"""
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire, "type": "refresh"})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

def verify_token(token: str) -> dict:
    """Verificar e decodificar token JWT"""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except JWTError:
        return None
```

### Endpoints Protegidos

**Arquivo:** `plutsgrip-api/app/api/dependencies.py`

```python
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.security import verify_token, is_token_blacklisted
from app.repositories.user_repository import UserRepository

security = HTTPBearer()

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_db)
):
    """Obter usuário autenticado atual do token JWT"""
    token = credentials.credentials

    # Verificar se o token está na blacklist (logout)
    if is_token_blacklisted(token):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has been revoked"
        )

    # Verificar token
    payload = verify_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token"
        )

    # Obter usuário do banco de dados
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload"
        )

    user_repo = UserRepository(db)
    user = await user_repo.get_by_id(int(user_id))

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )

    return user
```

### Rate Limiting

O PlutusGrip implementa rate limiting para proteger contra abuso:

**Funcionalidades:**
- Rate limiting por IP
- Suporte a whitelist de IP
- Limites configuráveis por endpoint
- Cache em memória para performance

**Rate Limits:**
- **Registro:** 3 requisições/hora
- **Login:** 5 requisições/15 minutos
- **API Geral:** 100 requisições/minuto

**Arquivo:** `plutsgrip-api/app/core/rate_limiter.py`

```python
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(
    key_func=get_remote_address,
    default_limits=["100/minute"],
    storage_uri="memory://"
)

# Cache de whitelist (sincronizado do banco ao iniciar)
WHITELIST_CACHE = set()

def is_ip_whitelisted(ip: str) -> bool:
    """Verificar se o IP está na whitelist"""
    return ip in WHITELIST_CACHE

def update_whitelist_cache(ips: list):
    """Atualizar cache de whitelist"""
    WHITELIST_CACHE.clear()
    WHITELIST_CACHE.update(ips)
```

---

## Guia de Testes

O backend do PlutusGrip inclui testes unitários e de integração abrangentes.

### Estrutura de Testes

```
plutsgrip-api/tests/
├── conftest.py              # Configuração de testes e fixtures
├── test_auth.py             # Testes de autenticação
├── test_transactions.py     # Testes de transação
├── test_categories.py       # Testes de categoria
├── test_budgets.py          # Testes de orçamento
├── test_goals.py            # Testes de meta
└── test_reports.py          # Testes de relatório
```

### Executando Testes

```bash
# Ativar ambiente virtual
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate     # Windows

# Executar todos os testes
pytest

# Executar com saída verbose
pytest -v

# Executar arquivo de teste específico
pytest tests/test_auth.py

# Executar teste específico
pytest tests/test_auth.py::test_register_user

# Executar com cobertura
pytest --cov=app --cov-report=html

# Executar com cobertura e mostrar linhas faltantes
pytest --cov=app --cov-report=term-missing

# Executar apenas testes que falharam
pytest --lf

# Executar testes que correspondem a palavra-chave
pytest -k "transaction"

# Executar com warnings
pytest -W all
```

### Configuração de Testes

**Arquivo:** `plutsgrip-api/pytest.ini`

```ini
[pytest]
testpaths = tests
python_files = test_*.py
python_classes = Test*
python_functions = test_*
asyncio_mode = auto
addopts =
    -v
    --strict-markers
    --tb=short
    --cov=app
    --cov-report=term-missing
    --cov-report=html
markers =
    slow: marks tests as slow
    integration: marks tests as integration tests
    unit: marks tests as unit tests
```

### Fixtures de Teste

**Arquivo:** `plutsgrip-api/tests/conftest.py`

```python
import pytest
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from httpx import AsyncClient
from app.main import app
from app.core.database import Base, get_db

# URL do banco de dados de teste
TEST_DATABASE_URL = "postgresql+asyncpg://test_user:test_pass@localhost:5432/test_db"

@pytest.fixture(scope="session")
async def test_engine():
    """Criar engine do banco de dados de teste"""
    engine = create_async_engine(TEST_DATABASE_URL, echo=False)

    # Criar tabelas
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    yield engine

    # Deletar tabelas
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)

    await engine.dispose()

@pytest.fixture
async def test_db(test_engine):
    """Criar sessão de banco de dados de teste"""
    async_session = sessionmaker(
        test_engine, class_=AsyncSession, expire_on_commit=False
    )

    async with async_session() as session:
        yield session
        await session.rollback()

@pytest.fixture
async def client(test_db):
    """Criar cliente de teste"""
    async def override_get_db():
        yield test_db

    app.dependency_overrides[get_db] = override_get_db

    async with AsyncClient(app=app, base_url="http://test") as ac:
        yield ac

    app.dependency_overrides.clear()

@pytest.fixture
async def test_user(test_db):
    """Criar usuário de teste"""
    from app.models.user import User
    from app.core.security import hash_password

    user = User(
        name="Test User",
        email="test@example.com",
        hashed_password=hash_password("testpass123")
    )
    test_db.add(user)
    await test_db.commit()
    await test_db.refresh(user)
    return user

@pytest.fixture
async def auth_headers(client, test_user):
    """Obter headers de autenticação"""
    response = await client.post(
        "/api/auth/login",
        json={"email": "test@example.com", "password": "testpass123"}
    )
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}
```

### Exemplos de Testes

**Arquivo:** `plutsgrip-api/tests/test_auth.py`

```python
import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_register_user(client: AsyncClient):
    """Testar registro de usuário"""
    response = await client.post(
        "/api/auth/register",
        json={
            "name": "New User",
            "email": "new@example.com",
            "password": "securepass123",
            "password_confirmation": "securepass123"
        }
    )
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "new@example.com"
    assert "id" in data

@pytest.mark.asyncio
async def test_register_duplicate_email(client: AsyncClient, test_user):
    """Testar registro com email duplicado"""
    response = await client.post(
        "/api/auth/register",
        json={
            "name": "Duplicate User",
            "email": test_user.email,  # Mesmo email do test_user
            "password": "password123"
        }
    )
    assert response.status_code == 409
    assert "already registered" in response.json()["detail"].lower()

@pytest.mark.asyncio
async def test_login_success(client: AsyncClient, test_user):
    """Testar login bem-sucedido"""
    response = await client.post(
        "/api/auth/login",
        json={
            "email": "test@example.com",
            "password": "testpass123"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert "refresh_token" in data
    assert data["user"]["email"] == "test@example.com"

@pytest.mark.asyncio
async def test_login_invalid_credentials(client: AsyncClient):
    """Testar login com credenciais inválidas"""
    response = await client.post(
        "/api/auth/login",
        json={
            "email": "wrong@example.com",
            "password": "wrongpass"
        }
    )
    assert response.status_code == 401

@pytest.mark.asyncio
async def test_get_current_user(client: AsyncClient, auth_headers):
    """Testar endpoint de obter usuário atual"""
    response = await client.get(
        "/api/auth/me",
        headers=auth_headers
    )
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "test@example.com"

@pytest.mark.asyncio
async def test_protected_endpoint_without_auth(client: AsyncClient):
    """Testar endpoint protegido sem autenticação"""
    response = await client.get("/api/transactions")
    assert response.status_code == 401
```

**Arquivo:** `plutsgrip-api/tests/test_transactions.py`

```python
import pytest
from httpx import AsyncClient
from datetime import date

@pytest.mark.asyncio
async def test_create_transaction(client: AsyncClient, auth_headers):
    """Testar criação de transação"""
    response = await client.post(
        "/api/transactions",
        headers=auth_headers,
        json={
            "description": "Test transaction",
            "amount": 100.50,
            "currency": "BRL",
            "date": str(date.today()),
            "type": "expense",
            "category_id": 1
        }
    )
    assert response.status_code == 201
    data = response.json()
    assert data["description"] == "Test transaction"
    assert float(data["amount"]) == 100.50

@pytest.mark.asyncio
async def test_list_transactions(client: AsyncClient, auth_headers):
    """Testar listagem de transações"""
    response = await client.get(
        "/api/transactions",
        headers=auth_headers
    )
    assert response.status_code == 200
    data = response.json()
    assert "transactions" in data
    assert "total" in data

@pytest.mark.asyncio
async def test_get_transaction_by_id(client: AsyncClient, auth_headers):
    """Testar obter transação por ID"""
    # Primeiro criar uma transação
    create_response = await client.post(
        "/api/transactions",
        headers=auth_headers,
        json={
            "description": "Get test",
            "amount": 50.00,
            "date": str(date.today()),
            "type": "income"
        }
    )
    transaction_id = create_response.json()["id"]

    # Então obtê-la
    response = await client.get(
        f"/api/transactions/{transaction_id}",
        headers=auth_headers
    )
    assert response.status_code == 200
    assert response.json()["id"] == transaction_id

@pytest.mark.asyncio
async def test_update_transaction(client: AsyncClient, auth_headers):
    """Testar atualização de transação"""
    # Criar transação
    create_response = await client.post(
        "/api/transactions",
        headers=auth_headers,
        json={
            "description": "Original",
            "amount": 100.00,
            "date": str(date.today()),
            "type": "expense"
        }
    )
    transaction_id = create_response.json()["id"]

    # Atualizá-la
    response = await client.put(
        f"/api/transactions/{transaction_id}",
        headers=auth_headers,
        json={
            "description": "Updated",
            "amount": 150.00
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["description"] == "Updated"
    assert float(data["amount"]) == 150.00

@pytest.mark.asyncio
async def test_delete_transaction(client: AsyncClient, auth_headers):
    """Testar deleção de transação"""
    # Criar transação
    create_response = await client.post(
        "/api/transactions",
        headers=auth_headers,
        json={
            "description": "To delete",
            "amount": 25.00,
            "date": str(date.today()),
            "type": "expense"
        }
    )
    transaction_id = create_response.json()["id"]

    # Deletá-la
    response = await client.delete(
        f"/api/transactions/{transaction_id}",
        headers=auth_headers
    )
    assert response.status_code == 204

    # Verificar que foi deletada
    get_response = await client.get(
        f"/api/transactions/{transaction_id}",
        headers=auth_headers
    )
    assert get_response.status_code == 404
```

### Cobertura de Testes

Para gerar e visualizar a cobertura de testes:

```bash
# Executar testes com cobertura
pytest --cov=app --cov-report=html

# Abrir relatório de cobertura
# Linux/Mac
open htmlcov/index.html

# Windows
start htmlcov/index.html
```

Meta de cobertura: **>90%**

---

## Deploy

### Ambiente de Produção

**Servidor:** DigitalOcean Droplet
- **IP:** 68.183.98.186
- **OS:** Ubuntu 22.04 LTS
- **RAM:** 2GB
- **CPU:** 1 vCPU
- **Armazenamento:** 50GB SSD

**Banco de Dados:** Neon PostgreSQL
- **Projeto:** rough-pond-76369130
- **Branch:** br-orange-star-acm7oh7g
- **Região:** sa-east-1 (São Paulo)

### Processo de Deploy

#### 1. Configuração Inicial do Servidor

```bash
# SSH no servidor
ssh root@68.183.98.186

# Atualizar sistema
apt update && apt upgrade -y

# Instalar dependências
apt install -y python3.11 python3.11-venv python3-pip git nginx

# Criar usuário da aplicação
useradd -m -s /bin/bash plutusgrip
```

#### 2. Clonar e Configurar Aplicação

```bash
# Mudar para usuário da aplicação
su - plutusgrip

# Clonar repositório
cd /opt
git clone https://github.com/LeP-Projects/plutsgrip-app.git
cd plutsgrip-app/plutsgrip-api

# Criar ambiente virtual
python3.11 -m venv venv
source venv/bin/activate

# Instalar dependências
pip install --upgrade pip
pip install -r requirements.txt
```

#### 3. Configurar Ambiente

```bash
# Criar arquivo .env
nano /opt/plutsgrip-app/plutsgrip-api/.env
```

```env
APP_NAME=PlutusGrip Finance Tracker API
APP_VERSION=1.0.0
APP_ENV=production
DEBUG=false

HOST=0.0.0.0
PORT=8000

DATABASE_URL=postgresql://neondb_owner:password@ep-xxx.sa-east-1.aws.neon.tech/neondb?sslmode=require

SECRET_KEY=<gerar-chave-secreta-min-32-chars>
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

ALLOWED_ORIGINS=http://68.183.98.186
ALLOWED_METHODS=GET,POST,PUT,DELETE,OPTIONS,PATCH

LOG_LEVEL=INFO
```

#### 4. Aplicar Migrações do Banco de Dados

```bash
cd /opt/plutsgrip-app/plutsgrip-api
source venv/bin/activate
alembic upgrade head
```

#### 5. Criar Serviço Systemd

**Arquivo:** `/etc/systemd/system/plutusgrip-api.service`

```ini
[Unit]
Description=PlutusGrip Finance Tracker API
After=network.target

[Service]
Type=simple
User=plutusgrip
Group=plutusgrip
WorkingDirectory=/opt/plutsgrip-app/plutsgrip-api
Environment="PATH=/opt/plutsgrip-app/plutsgrip-api/venv/bin"
ExecStart=/opt/plutsgrip-app/plutsgrip-api/venv/bin/uvicorn main:app --host 0.0.0.0 --port 8000 --workers 2
Restart=always
RestartSec=10
StandardOutput=append:/var/log/plutusgrip/api.log
StandardError=append:/var/log/plutusgrip/api-error.log

[Install]
WantedBy=multi-user.target
```

```bash
# Criar diretório de logs
mkdir -p /var/log/plutusgrip
chown plutusgrip:plutusgrip /var/log/plutusgrip

# Habilitar e iniciar serviço
systemctl daemon-reload
systemctl enable plutusgrip-api
systemctl start plutusgrip-api

# Verificar status
systemctl status plutusgrip-api
```

#### 6. Configurar Nginx

**Arquivo:** `/etc/nginx/sites-available/plutusgrip`

```nginx
server {
    listen 80;
    server_name 68.183.98.186;

    client_max_body_size 10M;

    # Arquivos estáticos do frontend
    location / {
        root /opt/plutsgrip-app/plutsgrip-frond-refac/dist;
        try_files $uri $uri/ /index.html;

        # Cache de assets estáticos
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # API do backend
    location /api/ {
        proxy_pass http://localhost:8000/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }

    # API docs (opcional - apenas em desenvolvimento)
    location /docs {
        proxy_pass http://localhost:8000/docs;
        proxy_set_header Host $host;
    }

    location /redoc {
        proxy_pass http://localhost:8000/redoc;
        proxy_set_header Host $host;
    }

    # Health check
    location /health {
        proxy_pass http://localhost:8000/health;
        access_log off;
    }

    # Logging
    access_log /var/log/nginx/plutusgrip-access.log;
    error_log /var/log/nginx/plutusgrip-error.log;
}
```

```bash
# Habilitar site
ln -s /etc/nginx/sites-available/plutusgrip /etc/nginx/sites-enabled/

# Testar configuração
nginx -t

# Reiniciar Nginx
systemctl restart nginx
```

#### 7. Configurar Firewall

```bash
# Permitir HTTP, HTTPS, SSH
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp

# Habilitar firewall
ufw enable

# Verificar status
ufw status
```

### Atualizando Produção

```bash
# SSH no servidor
ssh root@68.183.98.186

# Navegar para o backend
cd /opt/plutsgrip-app/plutsgrip-api

# Puxar últimas mudanças
git pull origin main

# Ativar venv
source venv/bin/activate

# Instalar novas dependências
pip install -r requirements.txt

# Executar migrações
alembic upgrade head

# Reiniciar serviço
systemctl restart plutusgrip-api

# Verificar status
systemctl status plutusgrip-api

# Ver logs
tail -f /var/log/plutusgrip/api.log
```

---

## Troubleshooting

### Problemas Comuns

#### 1. API Retorna 502 Bad Gateway

**Sintomas:** Nginx retorna erro 502

**Causas:**
- Serviço do backend não está rodando
- Backend crashou na inicialização
- Porta 8000 já está em uso

**Soluções:**

```bash
# Verificar status do serviço
systemctl status plutusgrip-api

# Ver logs de erro
tail -n 50 /var/log/plutusgrip/api-error.log

# Verificar se a porta está em uso
lsof -i :8000

# Reiniciar serviço
systemctl restart plutusgrip-api

# Se a porta estiver em uso, matar processo
pkill -9 uvicorn
systemctl start plutusgrip-api
```

#### 2. Erros de Conexão com Banco de Dados

**Sintomas:**
```
sqlalchemy.exc.OperationalError: could not connect to database
```

**Causas:**
- DATABASE_URL incorreta
- Banco de dados Neon está fora do ar
- Problemas de conexão SSL
- Conectividade de rede

**Soluções:**

```bash
# Testar conexão com banco de dados
cd /opt/plutsgrip-app/plutsgrip-api
source venv/bin/activate
python -c "from app.core.database import engine; import asyncio; asyncio.run(engine.connect())"

# Verificar arquivo .env
cat .env | grep DATABASE_URL

# Verificar se a string de conexão Neon inclui ?sslmode=require

# Testar com psql
psql "postgresql://user:pass@host/db?sslmode=require"
```

#### 3. Erros de Migração

**Sintomas:**
```
alembic.util.exc.CommandError: Target database is not up to date
```

**Soluções:**

```bash
# Verificar migração atual
alembic current

# Ver histórico de migrações
alembic history

# Marcar versão atual (se aplicada manualmente)
alembic stamp head

# Aplicar migrações pendentes
alembic upgrade head

# Se a migração falhar, verificar logs
tail -f /var/log/plutusgrip/api-error.log
```

#### 4. Erros de Import

**Sintomas:**
```
ModuleNotFoundError: No module named 'app'
```

**Causas:**
- Ambiente virtual não ativado
- Dependências não instaladas
- PYTHONPATH incorreto

**Soluções:**

```bash
# Garantir que venv está ativado
source venv/bin/activate

# Reinstalar dependências
pip install -r requirements.txt

# Verificar Python path
python -c "import sys; print(sys.path)"

# Adicionar diretório atual ao PYTHONPATH
export PYTHONPATH="${PYTHONPATH}:/opt/plutsgrip-app/plutsgrip-api"
```

#### 5. Erros de Token JWT

**Sintomas:**
```
401 Unauthorized: Invalid or expired token
```

**Causas:**
- Token expirado
- SECRET_KEY errada
- Token na blacklist após logout

**Soluções:**

```bash
# Verificar SECRET_KEY no .env
cat .env | grep SECRET_KEY

# Garantir que SECRET_KEY tem pelo menos 32 caracteres

# Gerar nova SECRET_KEY
python -c "import secrets; print(secrets.token_urlsafe(32))"

# Atualizar .env e reiniciar
systemctl restart plutusgrip-api
```

### Logging

Ver logs da aplicação:

```bash
# Logs em tempo real
tail -f /var/log/plutusgrip/api.log

# Logs de erro
tail -f /var/log/plutusgrip/api-error.log

# Journal do systemd
journalctl -u plutusgrip-api -n 100 -f

# Logs do Nginx
tail -f /var/log/nginx/plutusgrip-access.log
tail -f /var/log/nginx/plutusgrip-error.log
```

### Health Checks

```bash
# Health da API
curl http://localhost:8000/health
curl http://68.183.98.186/api/health

# Verificar status do serviço
systemctl status plutusgrip-api nginx

# Verificar portas em escuta
netstat -tulpn | grep -E '(8000|80|443)'

# Verificar recursos do sistema
htop
df -h
free -h
```

---

## Fluxo de Trabalho de Desenvolvimento

### Fluxo Git

```bash
# 1. Criar branch de feature
git checkout -b feature/new-feature

# 2. Fazer mudanças e testar
python main.py  # Testar localmente
pytest          # Executar testes

# 3. Commitar mudanças
git add .
git commit -m "feat: add new feature"

# 4. Push para remoto
git push origin feature/new-feature

# 5. Criar Pull Request no GitHub

# 6. Após aprovação do PR, merge para main
git checkout main
git pull origin main
```

### Qualidade de Código

```bash
# Formatar código com Black
black app/

# Lint com Flake8
flake8 app/

# Type checking com MyPy
mypy app/

# Executar todas as verificações
black app/ && flake8 app/ && mypy app/ && pytest
```

### Mudanças no Banco de Dados

```bash
# 1. Modificar modelos SQLAlchemy em app/models/

# 2. Criar migração
alembic revision --autogenerate -m "Add new column"

# 3. Revisar migração gerada em alembic/versions/

# 4. Testar migração
alembic upgrade head

# 5. Testar downgrade
alembic downgrade -1

# 6. Commitar arquivo de migração
git add alembic/versions/
git commit -m "chore: add database migration"
```

### Adicionando Novos Endpoints

```bash
# 1. Criar/atualizar modelo em app/models/
# 2. Criar schema em app/schemas/
# 3. Criar repository em app/repositories/
# 4. Criar service em app/services/
# 5. Criar endpoint em app/api/v1/endpoints/
# 6. Adicionar router a app/api/v1/router.py
# 7. Escrever testes em tests/
# 8. Atualizar documentação
```

### Gerenciamento de Ambiente

```bash
# Desenvolvimento
cp .env.example .env
# Editar .env com configurações de desenvolvimento

# Produção
# Usar .env específico de produção no servidor
# Nunca commitar .env no git

# Manter .env.example atualizado
# Remover valores sensíveis antes de commitar
git add .env.example
git commit -m "docs: update .env.example"
```

---

## Recursos Adicionais

- **Documentação FastAPI**: https://fastapi.tiangolo.com/
- **Documentação SQLAlchemy**: https://docs.sqlalchemy.org/
- **Documentação Pydantic**: https://docs.pydantic.dev/
- **Documentação Alembic**: https://alembic.sqlalchemy.org/
- **Documentação Pytest**: https://docs.pytest.org/
- **Documentação Neon**: https://neon.tech/docs/

---

## Suporte

Para issues ou perguntas:

- **GitHub Issues**: https://github.com/LeP-Projects/plutsgrip-app/issues
- **Email**: paulodjunior.dev@gmail.com
- **Aplicação ao Vivo**: http://68.183.98.186

---

<div align="center">

**[Voltar ao Topo](#documentação-do-backend---plutsgrip-api)** | **[Índice da Documentação](./INDEX.md)**

Última Atualização: 2026-01-07

</div>
