# Arquitetura do PlutusGrip API

## Visão Geral

O PlutusGrip API foi desenvolvido seguindo princípios de **Clean Architecture** e **Separation of Concerns**, organizando o código em camadas bem definidas para garantir manutenibilidade, testabilidade e escalabilidade.

## Padrão Arquitetural

### Arquitetura em Camadas

```
┌─────────────────────────────────────────────┐
│         API Layer (Endpoints)               │  ← FastAPI Routes
├─────────────────────────────────────────────┤
│         Service Layer                       │  ← Business Logic
├─────────────────────────────────────────────┤
│         Repository Layer                    │  ← Data Access
├─────────────────────────────────────────────┤
│         Model Layer                         │  ← Database Models
└─────────────────────────────────────────────┘
```

### Fluxo de Requisição

```
Cliente HTTP
    │
    ├──> FastAPI Endpoint (API Layer)
    │        │
    │        ├──> Validação com Pydantic Schemas
    │        │
    │        └──> Service (Business Logic)
    │                 │
    │                 ├──> Repository (Data Access)
    │                 │        │
    │                 │        └──> SQLAlchemy Models
    │                 │                 │
    │                 │                 └──> PostgreSQL
    │                 │
    │                 └──> Response via Schemas
    │
    └──< JSON Response
```

## Estrutura de Diretórios

### `/app` - Código Fonte Principal

#### `/app/api` - Camada de API

```
app/api/
├── dependencies.py          # Dependências compartilhadas (autenticação, DB)
└── v1/                      # API versão 1
    ├── endpoints/           # Controllers organizados por domínio
    │   ├── auth.py          # Endpoints de autenticação
    │   ├── transactions.py  # Endpoints de transações
    │   ├── categories.py    # Endpoints de categorias
    │   └── reports.py       # Endpoints de relatórios
    └── router.py            # Agregador de todas as rotas
```

**Responsabilidade:**
- Receber requisições HTTP
- Validar entrada com schemas Pydantic
- Chamar services apropriados
- Retornar responses formatadas
- Tratamento de erros HTTP

#### `/app/core` - Configurações Centrais

```
app/core/
├── config.py      # Settings e variáveis de ambiente
├── database.py    # Configuração do SQLAlchemy
├── security.py    # JWT, hashing, autenticação
└── logging.py     # Configuração de logs
```

**Responsabilidade:**
- Configurações globais da aplicação
- Gerenciamento de conexões com banco
- Utilitários de segurança
- Setup de logging

#### `/app/models` - Camada de Modelos

```
app/models/
├── base.py         # Modelo base com timestamps
├── user.py         # Modelo de usuário
├── category.py     # Modelo de categoria
└── transaction.py  # Modelo de transação
```

**Responsabilidade:**
- Definir estrutura das tabelas (SQLAlchemy ORM)
- Relacionamentos entre entidades
- Constraints e validações de banco
- Não contém lógica de negócio

#### `/app/schemas` - Camada de Schemas

```
app/schemas/
├── user.py         # Schemas de usuário (request/response)
├── category.py     # Schemas de categoria
├── transaction.py  # Schemas de transação
├── report.py       # Schemas de relatórios
└── common.py       # Schemas compartilhados
```

**Responsabilidade:**
- Validação de dados de entrada (Pydantic)
- Serialização de responses
- Documentação automática da API
- Type safety

#### `/app/services` - Camada de Serviços

```
app/services/
├── auth_service.py         # Lógica de autenticação
├── transaction_service.py  # Lógica de transações
├── category_service.py     # Lógica de categorias
└── report_service.py       # Lógica de relatórios
```

**Responsabilidade:**
- **Lógica de negócio principal**
- Orquestração entre múltiplos repositories
- Cálculos e transformações de dados
- Validações de regras de negócio
- Independente do framework HTTP

#### `/app/repositories` - Camada de Repositórios

```
app/repositories/
├── base_repository.py       # CRUD genérico
├── user_repository.py       # Queries de usuário
├── transaction_repository.py # Queries de transação
└── category_repository.py   # Queries de categoria
```

**Responsabilidade:**
- **Acesso aos dados** (abstração do banco)
- Queries SQL via SQLAlchemy
- Operações CRUD básicas
- Queries complexas específicas do domínio
- Não contém lógica de negócio

#### `/app/middlewares` - Middlewares

```
app/middlewares/
└── error_handler.py  # Tratamento global de erros
```

**Responsabilidade:**
- Interceptação de requisições/responses
- Tratamento global de exceções
- Logging de requisições
- CORS (configurado no main.py)

### `/tests` - Testes Automatizados

```
tests/
├── conftest.py              # Fixtures pytest compartilhadas
├── unit/                    # Testes unitários isolados
│   ├── test_security.py     # Testes de funções de segurança
│   └── test_models.py       # Testes de modelos
└── integration/             # Testes de integração
    ├── test_auth_endpoints.py
    └── test_transaction_endpoints.py
```

### `/alembic` - Migrations de Banco

```
alembic/
├── versions/        # Arquivos de migration
├── env.py           # Configuração do Alembic
└── script.py.mako   # Template de migrations
```

### `/docs` - Documentação

```
docs/
├── endpoints-api.md  # Especificação completa dos endpoints
├── arquitetura.md    # Este arquivo
├── guia-setup.md     # Guia de instalação
└── tasks.md          # Roadmap de desenvolvimento
```

## Princípios de Design

### 1. Separation of Concerns (SoC)

Cada camada tem uma responsabilidade única e bem definida:

- **API Layer**: HTTP, validação de entrada, resposta
- **Service Layer**: Lógica de negócio
- **Repository Layer**: Acesso a dados
- **Model Layer**: Estrutura de dados

### 2. Dependency Injection

FastAPI utiliza dependency injection nativo:

```python
@router.get("/transactions")
async def list_transactions(
    current_user: User = Depends(get_current_user),  # Injetado
    db: AsyncSession = Depends(get_db)               # Injetado
):
    service = TransactionService(db)
    return await service.get_user_transactions(current_user.id)
```

### 3. Repository Pattern

Abstrai o acesso ao banco de dados:

```python
# Repository (acesso a dados)
class TransactionRepository:
    async def get_by_user_id(self, user_id: int) -> List[Transaction]:
        # Query SQL específica

# Service (lógica de negócio)
class TransactionService:
    def __init__(self, db: AsyncSession):
        self.repo = TransactionRepository(db)

    async def calculate_balance(self, user_id: int) -> Decimal:
        transactions = await self.repo.get_by_user_id(user_id)
        # Lógica de cálculo
```

### 4. Async/Await

Uso consistente de operações assíncronas para máxima performance:

```python
# Database access
async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        yield session

# Endpoints
@router.get("/transactions")
async def list_transactions(db: AsyncSession = Depends(get_db)):
    # Operações assíncronas
```

## Fluxo de Dados Detalhado

### Exemplo: Criar Transação

1. **Cliente envia POST** `/api/transactions`
   ```json
   {
     "description": "Salário",
     "amount": 5000.00,
     "type": "income",
     "date": "2024-01-15"
   }
   ```

2. **API Endpoint** (`app/api/v1/endpoints/transactions.py`)
   - Recebe requisição
   - Valida com `TransactionCreateRequest` schema
   - Extrai usuário autenticado via `get_current_user` dependency

3. **Service Layer** (`app/services/transaction_service.py`)
   - Recebe dados validados
   - Aplica regras de negócio
   - Chama repository para persistir

4. **Repository Layer** (`app/repositories/transaction_repository.py`)
   - Cria instância do modelo SQLAlchemy
   - Executa INSERT no banco
   - Retorna objeto persistido

5. **Response**
   - Service retorna para endpoint
   - Endpoint serializa com `TransactionResponse` schema
   - FastAPI converte para JSON e retorna

## Versionamento de API

### Estratégia de Versionamento

- Versionamento por URL: `/api/v1/...`
- Estrutura permite múltiplas versões simultâneas
- Facilita migração gradual de clientes

```python
# Futuro: API v2
app/api/
├── v1/
│   └── endpoints/
└── v2/
    └── endpoints/
```

## Segurança

### Autenticação JWT

```
Cliente                      Servidor
  │                             │
  ├──── POST /auth/login ──────>│
  │                             │ Valida credenciais
  │<──── JWT Token ─────────────┤
  │                             │
  ├──── GET /transactions ─────>│
  │     Header: Bearer <token>  │ Valida token
  │                             │ Extrai user_id
  │<──── Response ──────────────┤
```

### Middleware de Segurança

1. **CORS Middleware** - Controle de origens permitidas
2. **Authentication Dependency** - Validação de JWT
3. **Error Handler** - Sanitização de erros

## Banco de Dados

### Modelo de Dados

```
┌──────────────┐       ┌──────────────────┐       ┌─────────────┐
│    Users     │       │   Transactions   │       │ Categories  │
├──────────────┤       ├──────────────────┤       ├─────────────┤
│ id           │◄──────┤ user_id (FK)     │       │ id          │
│ name         │       │ description      │       │ name        │
│ email        │       │ amount           │       │ type        │
│ password     │       │ date             │       │ color       │
│ created_at   │       │ type             │       │ icon        │
└──────────────┘       │ category_id (FK) ├──────►│             │
                       │ notes            │       └─────────────┘
                       │ created_at       │
                       │ updated_at       │
                       └──────────────────┘
```

### Migrations com Alembic

- Versionamento de schema
- Migrations automáticas via autogenerate
- Rollback suportado

## Logging e Monitoramento

### Níveis de Log

- **INFO**: Operações normais, startup, shutdown
- **WARNING**: Situações incomuns mas tratáveis
- **ERROR**: Erros que precisam atenção
- **DEBUG**: Informações detalhadas (apenas dev)

### Estrutura de Logs

```python
2024-01-15 10:30:45 - plutusgrip - INFO - POST /api/transactions - Status: 201 - Duration: 45.23ms
2024-01-15 10:31:12 - plutusgrip - ERROR - Database error: Connection timeout
```

## Testes

### Pirâmide de Testes

```
        /\
       /  \      E2E (poucos)
      /____\
     /      \    Integration (médio)
    /________\
   /          \  Unit (muitos)
  /____________\
```

### Estratégia

- **Unit Tests**: Services, repositories, utilitários
- **Integration Tests**: Endpoints completos com banco de teste
- **Fixtures**: Dados de teste compartilhados (conftest.py)

## Escalabilidade

### Horizontal Scaling

- Stateless design (JWT em vez de sessions)
- Conexões de banco em pool
- Async para alta concorrência

### Vertical Scaling

- Async I/O para máximo uso de CPU
- Connection pooling configurável
- Caching de queries (futuro)

## Boas Práticas Implementadas

1. **Type Hints** - Todo código Python tipado
2. **Async/Await** - Operações I/O assíncronas
3. **Dependency Injection** - Facilita testes e manutenção
4. **Environment Variables** - Configuração via .env
5. **Logging Estruturado** - Logs consistentes e pesquisáveis
6. **Error Handling** - Tratamento global de exceções
7. **API Documentation** - OpenAPI/Swagger automático
8. **Database Migrations** - Versionamento de schema
9. **Docker Support** - Containerização completa
10. **Testing Infrastructure** - Testes automatizados

## Próximos Passos Arquiteturais

Ver [tasks.md](tasks.md) para implementações futuras:

- Caching com Redis
- Rate limiting
- WebSocket para atualizações em tempo real
- Event sourcing para auditoria
- GraphQL como alternativa REST

---

**Última atualização**: 2024-01-15
