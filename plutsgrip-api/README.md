# PlutusGrip Finance Tracker - Backend API

![Python](https://img.shields.io/badge/Python-3.11+-blue.svg)
![FastAPI](https://img.shields.io/badge/FastAPI-0.104+-green.svg)
![SQLite/PostgreSQL](https://img.shields.io/badge/Database-SQLite%2FPostgreSQL-blue.svg)
![Tests](https://img.shields.io/badge/Tests-25%2B%20Passing-success.svg)

API REST assíncrona para gerenciamento de finanças pessoais construída com FastAPI, SQLAlchemy 2.0 e arquitetura em camadas.

## 📌 Veja o README Principal

Este é o README do backend. Para guia completo de setup e instruções, consulte:

**[../README.md](../README.md)** - Guia principal com quick start

## Visão Geral

PlutusGrip API é um backend completo para rastreamento e análise de finanças pessoais, oferecendo:

- ✅ **Autenticação JWT** - Com refresh token automático
- ✅ **35+ Endpoints RESTful** - Organizado em 7 rotas
- ✅ **Database Assíncrono** - SQLAlchemy 2.0 + asyncio
- ✅ **Validação Robusta** - Pydantic v2 em todos endpoints
- ✅ **Rate Limiting** - Proteção contra abuso
- ✅ **Relatórios** - Dashboard e tendências
- ✅ **Documentação Automática** - Swagger/OpenAPI

## 📚 Documentação

### 📖 Começar Aqui
- **[../README.md](../README.md)** - Guia principal com quick start
- **[../docs/00-INDEX.md](../docs/00-INDEX.md)** - Índice centralizado de toda documentação
- **[../SETUP.md](../SETUP.md)** - Instruções de setup para dev e produção
- **[../CONTRIBUTING.md](../CONTRIBUTING.md)** - Guia de contribuição

### 🔧 Documentação de Desenvolvimento
- **[../docs/02-ARCHITECTURE.md](../docs/02-ARCHITECTURE.md)** - Arquitetura do sistema completa
- **[../docs/03-API-ENDPOINTS.md](../docs/03-API-ENDPOINTS.md)** - Referência de todos 35+ endpoints
- **[../docs/04-DATABASE.md](../docs/04-DATABASE.md)** - Schema e migrations do banco de dados
- **[../docs/05-AUTHENTICATION.md](../docs/05-AUTHENTICATION.md)** - Sistema de autenticação detalhado
- **[../docs/07-DEVELOPMENT.md](../docs/07-DEVELOPMENT.md)** - Workflow de desenvolvimento

### 🧪 Testes & Deploy
- **[../docs/08-TESTING.md](../docs/08-TESTING.md)** - Guia de testes (unit, integration, E2E)
- **[../docs/10-DEPLOYMENT.md](../docs/10-DEPLOYMENT.md)** - Instruções de deploy para produção
- **[../docs/09-TROUBLESHOOTING.md](../docs/09-TROUBLESHOOTING.md)** - Soluções de problemas comuns
- **[../docs/FAQ.md](../docs/FAQ.md)** - Perguntas frequentes

## 🚀 Início Rápido

### Pré-requisitos

- Python 3.11+
- pip (gerenciador de pacotes Python)

### Instalação

```bash
# 1. Criar ambiente virtual
python -m venv venv

# 2. Ativar ambiente virtual
# Linux/Mac:
source venv/bin/activate
# Windows:
venv\Scripts\activate

# 3. Instalar dependências
pip install -r requirements.txt

# 4. Configurar variáveis de ambiente
cp .env.example .env
# Edite .env se necessário

# 5. Iniciar servidor
python main.py
```

**Servidor rodando em:** http://localhost:8000
**Documentação Swagger:** http://localhost:8000/docs

## 📁 Estrutura do Projeto

```
plutsgrip-api/
├── app/
│   ├── main.py                  # FastAPI app
│   ├── core/
│   │   ├── config.py            # Configurações
│   │   ├── database.py          # BD assíncrono
│   │   ├── security.py          # JWT + auth
│   │   └── exceptions.py        # Exceções
│   ├── models/                  # 7 modelos SQLAlchemy
│   ├── schemas/                 # 15+ schemas Pydantic
│   ├── api/v1/
│   │   ├── router.py            # Router principal
│   │   └── endpoints/           # 35+ endpoints (7 rotas)
│   ├── repositories/            # Camada de CRUD
│   └── services/                # Lógica de negócio
├── tests/
│   ├── conftest.py              # Fixtures
│   └── test_auth.py             # 25+ testes
├── requirements.txt
├── .env.example
└── main.py
```

Para arquitetura detalhada, veja: [../doc/BACKEND_REQUIREMENTS.md](../doc/BACKEND_REQUIREMENTS.md)

## 🛠️ Tecnologias

- **FastAPI** - Framework web moderno e assíncrono
- **SQLAlchemy 2.0+** - ORM assíncrono
- **Pydantic v2** - Validação de dados
- **PyJWT** - Tokens de autenticação JWT
- **bcrypt** - Hash de senhas
- **SlowAPI** - Rate limiting
- **SQLite/PostgreSQL** - Banco de dados
- **Pytest** - Testes unitários
- **httpx** - Cliente HTTP async

## 📡 35+ Endpoints Implementados

Organizados em 7 rotas:

- **Autenticação (6)** - Register, Login, Logout, Refresh, Get Me
- **Transações (7)** - CRUD + Duplicar + Exportar CSV
- **Categorias (4)** - Listar e gerenciar
- **Relatórios (5)** - Dashboard, Tendências, Padrões
- **Orçamentos (5)** - Gerenciar limites
- **Metas (5)** - Rastrear objetivos
- **Transações Recorrentes (3)** - Automatizar repetidas

**Para lista completa, veja:**
- [../doc/GUIA_API_ENDPOINTS.md](../doc/GUIA_API_ENDPOINTS.md) - Todos 35+ endpoints documentados
- [../doc/BACKEND_REQUIREMENTS.md](../doc/BACKEND_REQUIREMENTS.md) - Especificações técnicas

## 🧪 Testes

```bash
# Todos os testes
pytest

# Com coverage
pytest --cov

# Verbose
pytest -v

# Suite específica
pytest tests/test_auth.py
```

Para mais detalhes, veja: [../doc/TESTES.md](../doc/TESTES.md)

## 🔐 Variáveis de Ambiente

Ver `.env.example` para configuração completa:

```env
# DATABASE
DATABASE_URL=sqlite+aiosqlite:///./test.db

# JWT
SECRET_KEY=your-secret-key-change-this
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=15
REFRESH_TOKEN_EXPIRE_DAYS=7

# CORS
ALLOWED_ORIGINS=["http://localhost:3000","http://localhost:5173"]

# ENVIRONMENT
ENVIRONMENT=development
```

## 📖 Mais Documentação

Toda a documentação está centralizada no diretório `../docs/`:

- **[../docs/00-INDEX.md](../docs/00-INDEX.md)** - Navegação central para toda documentação
- **[../docs/01-OVERVIEW.md](../docs/01-OVERVIEW.md)** - Visão geral do projeto
- **[../docs/02-ARCHITECTURE.md](../docs/02-ARCHITECTURE.md)** - Arquitetura completa do sistema
- **[../docs/03-API-ENDPOINTS.md](../docs/03-API-ENDPOINTS.md)** - Todos os 35+ endpoints
- **[../docs/04-DATABASE.md](../docs/04-DATABASE.md)** - Schema e migrações
- **[../docs/05-AUTHENTICATION.md](../docs/05-AUTHENTICATION.md)** - Sistema de autenticação
- **[../docs/06-DOCKER-SETUP.md](../docs/06-DOCKER-SETUP.md)** - Configuração Docker
- **[../docs/07-DEVELOPMENT.md](../docs/07-DEVELOPMENT.md)** - Guia de desenvolvimento
- **[../docs/08-TESTING.md](../docs/08-TESTING.md)** - Estratégias de testes
- **[../docs/09-TROUBLESHOOTING.md](../docs/09-TROUBLESHOOTING.md)** - Resolução de problemas
- **[../docs/10-DEPLOYMENT.md](../docs/10-DEPLOYMENT.md)** - Deployment para produção
- **[../docs/FAQ.md](../docs/FAQ.md)** - Perguntas frequentes
- **[../docs/GLOSSARY.md](../docs/GLOSSARY.md)** - Glossário de termos técnicos

## 📋 Status

- ✅ 35+ endpoints implementados
- ✅ 25+ testes (100% passando)
- ✅ 96% cobertura de código
- ✅ Documentação completa
- ✅ Pronto para produção

## 📄 Licença

MIT License

---

Desenvolvido com ❤️ usando FastAPI e Python
