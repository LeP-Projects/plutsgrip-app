# PlutusGrip Backend API

<div align="center">

![Python](https://img.shields.io/badge/Python-3.11+-blue.svg)
![FastAPI](https://img.shields.io/badge/FastAPI-0.104+-green.svg)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-blue.svg)
![Tests](https://img.shields.io/badge/Tests-30%2B-success.svg)

**API REST Assíncrona Moderna para Gestão Financeira Pessoal**

[Documentação Principal](../README.md) • [Guia do Backend](../docs/BACKEND.md) • [API Docs](http://68.183.98.186/api/docs)

</div>

---

## 📋 Visão Geral

Este é o **backend da API** para o PlutusGrip, construído com FastAPI e padrões assíncronos modernos em Python. Para informações completas do projeto, veja o [README principal](../README.md).

**Funcionalidades Principais:**
- 🚀 **35+ Endpoints REST** - Organizados em 8 módulos de rotas
- 🔐 **Autenticação JWT** - Tokens de acesso e refresh com renovação automática
- ⚡ **Banco de Dados Assíncrono** - SQLAlchemy 2.0 com asyncpg
- ✅ **Type Safety** - Pydantic v2 para todas as requisições/respostas
- 🛡️ **Rate Limiting** - Suporte a whitelist de IP
- 📊 **Analytics** - Painel e relatórios de tendências
- 🧪 **Bem Testado** - 30+ testes com cobertura >90%

---

## 🚀 Início Rápido

### Desenvolvimento com Docker (Recomendado)

```bash
# Da raiz do projeto
make up
# Acesse a API em http://localhost:8000
# API docs em http://localhost:8000/docs
```

### Desenvolvimento Local

```bash
# 1. Navegue até o diretório do backend
cd plutsgrip-api

# 2. Crie ambiente virtual
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 3. Instale as dependências
pip install -r requirements.txt

# 4. Configure o ambiente
cp .env.example .env
# Edite .env com suas configurações

# 5. Execute as migrações
alembic upgrade head

# 6. Inicie o servidor
python main.py
# Ou: uvicorn main:app --reload
```

**Servidor rodando em:** http://localhost:8000
**Documentação da API:** http://localhost:8000/docs

---

## 📚 Documentação Completa

Para documentação abrangente do backend, veja:

### **[📖 Guia do Backend (docs/BACKEND.md)](../docs/BACKEND.md)**

Este guia inclui:
- ✅ Visão geral da arquitetura e padrões de design
- ✅ Referência completa dos endpoints da API (35+ endpoints)
- ✅ Schema do banco de dados e migrações
- ✅ Detalhes do sistema de autenticação
- ✅ Estratégias de testes
- ✅ Deploy na DigitalOcean
- ✅ Guia de troubleshooting
- ✅ Fluxo de trabalho de desenvolvimento

### Links Rápidos
- **[README Principal](../README.md)** - Visão geral do projeto e início rápido
- **[Hub de Documentação](../docs/INDEX.md)** - Toda a documentação
- **[Guia do Frontend](../docs/FRONTEND.md)** - Documentação do frontend
- **[Guia de Deploy](../DEPLOY_GUIDE.md)** - Deploy em produção

---

## 📁 Estrutura do Projeto

```
plutsgrip-api/
├── app/
│   ├── api/v1/
│   │   ├── endpoints/          # 8 módulos de endpoints (35+ rotas)
│   │   └── router.py           # Router principal da API
│   ├── core/
│   │   ├── config.py           # Configurações com Pydantic
│   │   ├── database.py         # Configuração SQLAlchemy assíncrono
│   │   ├── security.py         # JWT e hash de senhas
│   │   └── rate_limiter.py     # Rate limiting com whitelist
│   ├── models/                 # 8 modelos SQLAlchemy
│   ├── schemas/                # 20+ schemas Pydantic
│   ├── repositories/           # Camada de acesso a dados
│   └── services/               # Lógica de negócio
├── alembic/                    # Migrações do banco de dados
├── tests/                      # Suite de testes (30+ testes)
├── main.py                     # Ponto de entrada da aplicação
└── requirements.txt            # Dependências Python
```

---

## 🛠️ Stack Tecnológica

| Categoria | Tecnologia |
|-----------|------------|
| **Framework** | FastAPI 0.104+ |
| **Linguagem** | Python 3.11+ |
| **ORM** | SQLAlchemy 2.0 (async) |
| **Validação** | Pydantic v2 |
| **Banco de Dados** | PostgreSQL 15+ / Neon |
| **Auth** | JWT (PyJWT) |
| **Password** | bcrypt |
| **Testes** | Pytest + httpx |
| **Migrações** | Alembic |
| **Rate Limiting** | SlowAPI |

---

## 📡 Endpoints da API

**8 Módulos Principais de Rotas:**

| Módulo | Endpoints | Propósito |
|--------|-----------|-----------|
| **Auth** | 5 | Registro, login, logout, refresh, obter usuário |
| **Transactions** | 5 | Operações CRUD para transações |
| **Categories** | 5 | Gerenciar categorias de despesas/receitas |
| **Budgets** | 5 | Criação e rastreamento de orçamentos |
| **Goals** | 5 | Gerenciamento de metas financeiras |
| **Recurring** | 5 | Transações recorrentes automatizadas |
| **Reports** | 6 | Painel, tendências, analytics |
| **Whitelist** | 3 | Gerenciamento de whitelist de rate limit |

**Total:** 35+ endpoints

Para referência completa da API com exemplos de requisição/resposta, veja [docs/BACKEND.md](../docs/BACKEND.md).

---

## 🧪 Testes

```bash
# Executar todos os testes
pytest

# Com cobertura
pytest --cov

# Saída verbose
pytest -v

# Arquivo de teste específico
pytest tests/test_auth.py

# Com relatório de cobertura HTML
pytest --cov --cov-report=html
```

**Cobertura de Testes:** >90%

---

## 🌐 Produção

**API ao Vivo:** http://68.183.98.186/api

**Deploy Atual:**
- **Servidor:** DigitalOcean Droplet (2GB RAM)
- **Banco de Dados:** Neon PostgreSQL (sa-east-1)
- **Serviço:** Systemd
- **Proxy:** Nginx
- **SSL:** Conexão com banco usando sslmode=require

Para instruções de deploy, veja [DEPLOY_GUIDE.md](../DEPLOY_GUIDE.md).

---

## ⚙️ Variáveis de Ambiente

```env
# Aplicação
APP_NAME=PlutusGrip Finance Tracker API
APP_VERSION=1.0.0
APP_ENV=production
DEBUG=False

# Servidor
HOST=0.0.0.0
PORT=8000

# Banco de Dados
DATABASE_URL=postgresql://user:pass@host:5432/db?ssl=require
DATABASE_ECHO=False

# JWT
SECRET_KEY=sua-chave-secreta-aqui
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# CORS
ALLOWED_ORIGINS=http://localhost:5173,http://68.183.98.186
ALLOWED_METHODS=GET,POST,PUT,DELETE,OPTIONS
ALLOWED_HEADERS=Content-Type,Authorization,Accept

# Rate Limiting
RATE_LIMIT_ENABLED=True

# Logging
LOG_LEVEL=INFO
LOG_FILE=/var/log/plutusgrip/app.log
```

Veja `.env.example` para configuração completa.

---

## 🔧 Comandos Comuns

```bash
# Migrações do banco de dados
alembic revision --autogenerate -m "descrição"  # Criar migração
alembic upgrade head                            # Aplicar migrações
alembic downgrade -1                            # Reverter uma migração
alembic current                                 # Mostrar versão atual
alembic history                                 # Mostrar histórico de migrações

# Desenvolvimento
uvicorn main:app --reload                       # Iniciar com auto-reload
python main.py                                  # Iniciar normalmente

# Testes
pytest tests/                                   # Executar todos os testes
pytest tests/test_auth.py -v                    # Executar teste específico
pytest --cov=app tests/                        # Com cobertura

# Qualidade de código
black app/                                      # Formatar código
isort app/                                      # Ordenar imports
flake8 app/                                     # Lint do código
mypy app/                                       # Verificação de tipos
```

---

## 🐛 Troubleshooting

### Problemas Comuns

**Porta 8000 já em uso:**
```bash
lsof -i :8000
kill -9 <PID>
```

**Falha na conexão com banco de dados:**
```bash
# Verificar variáveis de ambiente
cat .env | grep DATABASE_URL

# Testar conexão
python -c "from app.core.database import engine; print('OK')"
```

**Migrações não aplicando:**
```bash
alembic stamp head  # Marcar estado atual
alembic upgrade head
```

Para mais dicas de troubleshooting, veja [docs/BACKEND.md](../docs/BACKEND.md#troubleshooting).

---

## 📞 Suporte

- **Issues:** [GitHub Issues](https://github.com/LeP-Projects/plutsgrip-app/issues)
- **Documentação:** [docs/INDEX.md](../docs/INDEX.md)
- **API Docs:** http://68.183.98.186/api/docs

---

## 📄 Licença

Licença MIT - veja o arquivo [LICENSE](../LICENSE) para detalhes.

---

<div align="center">

**[⬆ Voltar ao README Principal](../README.md)**

</div>
