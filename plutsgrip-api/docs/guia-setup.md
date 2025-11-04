# Guia de Setup - PlutusGrip API

Guia completo de instalação e configuração do PlutusGrip Finance Tracker API.

## Índice

1. [Pré-requisitos](#pré-requisitos)
2. [Instalação com Docker](#instalação-com-docker)
3. [Instalação Manual](#instalação-manual)
4. [Configuração do Banco de Dados](#configuração-do-banco-de-dados)
5. [Variáveis de Ambiente](#variáveis-de-ambiente)
6. [Executando a Aplicação](#executando-a-aplicação)
7. [Testes](#testes)
8. [Troubleshooting](#troubleshooting)

---

## Pré-requisitos

### Opção 1: Com Docker (Recomendado)

- [Docker](https://docs.docker.com/get-docker/) 20.10+
- [Docker Compose](https://docs.docker.com/compose/install/) 2.0+
- Git

### Opção 2: Manual

- Python 3.11 ou superior
- PostgreSQL 16+ instalado e rodando
- pip (gerenciador de pacotes Python)
- Git
- (Opcional) virtualenv ou venv

---

## Instalação com Docker

### Passo 1: Clone o Repositório

```bash
git clone <repository-url>
cd plutsgrip-api
```

### Passo 2: Configure as Variáveis de Ambiente

```bash
# Copie o arquivo de exemplo
cp .env.example .env

# Edite o arquivo .env se necessário
# Por padrão, as configurações do Docker já estão corretas
```

### Passo 3: Inicie os Serviços

```bash
# Inicia PostgreSQL + API
docker-compose up -d

# Verificar logs
docker-compose logs -f

# Parar os serviços
docker-compose down
```

### Passo 4: Execute as Migrations

```bash
# Entre no container da API
docker-compose exec api bash

# Execute as migrations
alembic upgrade head

# Saia do container
exit
```

### Passo 5: Acesse a API

- **API**: http://localhost:8000
- **Documentação Swagger**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **pgAdmin** (se iniciado): http://localhost:5050
  - Email: admin@plutusgrip.com
  - Senha: admin123

### Comandos Docker Úteis

```bash
# Ver status dos containers
docker-compose ps

# Ver logs em tempo real
docker-compose logs -f api

# Reiniciar apenas a API
docker-compose restart api

# Executar comandos no container
docker-compose exec api python -c "print('Hello')"

# Rebuild após mudanças no código
docker-compose up -d --build

# Limpar tudo (⚠️ apaga dados do banco)
docker-compose down -v
```

---

## Instalação Manual

### Passo 1: Clone o Repositório

```bash
git clone <repository-url>
cd plutsgrip-api
```

### Passo 2: Crie um Ambiente Virtual

```bash
# Linux/Mac
python -m venv .venv
source .venv/bin/activate

# Windows
python -m venv .venv
.venv\Scripts\activate
```

### Passo 3: Instale as Dependências

```bash
# Atualizar pip
pip install --upgrade pip

# Instalar dependências de produção
pip install -r requirements.txt

# Ou instalar com opções de desenvolvimento
pip install -e ".[dev]"
```

### Passo 4: Configure PostgreSQL

#### Instalando PostgreSQL

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

**macOS:**
```bash
brew install postgresql@16
brew services start postgresql@16
```

**Windows:**
- Baixe e instale do [site oficial](https://www.postgresql.org/download/windows/)

#### Criar Banco de Dados

```bash
# Entre no PostgreSQL
sudo -u postgres psql

# Crie usuário e banco
CREATE USER plutusgrip_user WITH PASSWORD 'plutusgrip_password';
CREATE DATABASE plutusgrip_db OWNER plutusgrip_user;
GRANT ALL PRIVILEGES ON DATABASE plutusgrip_db TO plutusgrip_user;

# Saia
\q
```

### Passo 5: Configure as Variáveis de Ambiente

```bash
# Copie o arquivo de exemplo
cp .env.example .env

# Edite o arquivo .env com suas configurações
nano .env  # ou use seu editor favorito
```

**Configurações importantes:**

```env
# Database (ajuste se necessário)
DATABASE_URL=postgresql://plutusgrip_user:plutusgrip_password@localhost:5432/plutusgrip_db

# Security (IMPORTANTE: mude em produção!)
SECRET_KEY=gere-uma-chave-secreta-aqui-use-openssl-rand-hex-32

# CORS (ajuste para seu frontend)
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

### Passo 6: Execute as Migrations

```bash
# Certifique-se de que o ambiente virtual está ativo
# e que o PostgreSQL está rodando

# Execute as migrations
alembic upgrade head

# Verificar versão atual
alembic current

# Ver histórico de migrations
alembic history
```

### Passo 7: (Opcional) Popular Banco com Dados de Teste

```bash
# TODO: Criar script de seed
# python scripts/seed_database.py
```

---

## Configuração do Banco de Dados

### Estrutura Básica

O banco terá 3 tabelas principais:

1. **users** - Usuários do sistema
2. **categories** - Categorias de transações
3. **transactions** - Transações financeiras

### Migrations

#### Criar Nova Migration

```bash
# Migration automática (detecta mudanças nos models)
alembic revision --autogenerate -m "descrição da mudança"

# Migration manual (arquivo vazio para editar)
alembic revision -m "descrição da mudança"
```

#### Aplicar Migrations

```bash
# Aplicar todas pendentes
alembic upgrade head

# Aplicar próxima migration
alembic upgrade +1

# Aplicar migration específica
alembic upgrade <revision_id>
```

#### Reverter Migrations

```bash
# Reverter última migration
alembic downgrade -1

# Reverter para versão específica
alembic downgrade <revision_id>

# Reverter todas (⚠️ cuidado!)
alembic downgrade base
```

### Backup e Restore

```bash
# Backup
pg_dump -U plutusgrip_user plutusgrip_db > backup.sql

# Restore
psql -U plutusgrip_user plutusgrip_db < backup.sql
```

---

## Variáveis de Ambiente

### Arquivo .env Completo

```env
# ===== APPLICATION =====
APP_NAME=PlutusGrip Finance Tracker API
APP_VERSION=1.0.0
APP_ENV=development  # development | production | testing
DEBUG=True

# ===== SERVER =====
HOST=0.0.0.0
PORT=8000

# ===== DATABASE =====
DATABASE_URL=postgresql://plutusgrip_user:plutusgrip_password@localhost:5432/plutusgrip_db
DATABASE_ECHO=False  # True para ver queries SQL nos logs

# ===== SECURITY =====
SECRET_KEY=your-super-secret-key-change-this-in-production-use-openssl-rand-hex-32
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# ===== CORS =====
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173,http://localhost:8080
ALLOWED_METHODS=GET,POST,PUT,DELETE,OPTIONS,PATCH
ALLOWED_HEADERS=*

# ===== LOGGING =====
LOG_LEVEL=INFO  # DEBUG | INFO | WARNING | ERROR | CRITICAL
LOG_FILE=logs/app.log
LOG_MAX_BYTES=10485760  # 10MB
LOG_BACKUP_COUNT=5

# ===== PAGINATION =====
DEFAULT_PAGE_SIZE=20
MAX_PAGE_SIZE=100
```

### Gerar SECRET_KEY Segura

```bash
# Método 1: OpenSSL
openssl rand -hex 32

# Método 2: Python
python -c "import secrets; print(secrets.token_hex(32))"
```

---

## Executando a Aplicação

### Desenvolvimento

```bash
# Método 1: Uvicorn direto
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Método 2: Python main.py
python main.py

# Método 3: Com auto-reload e logs detalhados
uvicorn main:app --reload --log-level debug
```

### Produção

```bash
# Com Uvicorn workers
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4

# Com Gunicorn + Uvicorn workers (recomendado)
gunicorn main:app --workers 4 --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

### Verificar Funcionamento

```bash
# Health check
curl http://localhost:8000/health

# Root endpoint
curl http://localhost:8000/

# Documentação
# Abra no navegador: http://localhost:8000/docs
```

---

## Testes

### Configuração de Teste

```bash
# Criar banco de teste
sudo -u postgres psql
CREATE DATABASE plutusgrip_test_db OWNER plutusgrip_user;
GRANT ALL PRIVILEGES ON DATABASE plutusgrip_test_db TO plutusgrip_user;
\q
```

### Executar Testes

```bash
# Todos os testes
pytest

# Com output verboso
pytest -v

# Com coverage
pytest --cov=app --cov-report=html

# Testes específicos
pytest tests/unit/
pytest tests/integration/
pytest tests/unit/test_security.py

# Executar teste específico
pytest tests/unit/test_security.py::test_password_hashing
```

### Ver Relatório de Coverage

```bash
# Gerar e abrir relatório HTML
pytest --cov=app --cov-report=html
# Abra htmlcov/index.html no navegador
```

---

## Troubleshooting

### Problema: Erro de conexão com o banco

**Sintoma:**
```
sqlalchemy.exc.OperationalError: could not connect to server
```

**Solução:**
```bash
# Verificar se PostgreSQL está rodando
sudo systemctl status postgresql  # Linux
brew services list                # macOS

# Iniciar PostgreSQL
sudo systemctl start postgresql   # Linux
brew services start postgresql@16 # macOS

# Verificar conexão
psql -U plutusgrip_user -d plutusgrip_db -h localhost
```

### Problema: ModuleNotFoundError

**Sintoma:**
```
ModuleNotFoundError: No module named 'app'
```

**Solução:**
```bash
# Certifique-se de estar no diretório raiz do projeto
cd plutsgrip-api

# Ative o ambiente virtual
source .venv/bin/activate  # Linux/Mac
.venv\Scripts\activate     # Windows

# Reinstale dependências
pip install -r requirements.txt
```

### Problema: Alembic não encontra mudanças

**Sintoma:**
```
alembic revision --autogenerate -m "test"
# INFO  [alembic.runtime.migration] No changes detected
```

**Solução:**
```python
# Verifique se os models estão importados em alembic/env.py
from app.models.user import User
from app.models.category import Category
from app.models.transaction import Transaction
```

### Problema: Porta 8000 em uso

**Sintoma:**
```
ERROR: [Errno 48] Address already in use
```

**Solução:**
```bash
# Encontrar processo usando a porta
lsof -i :8000              # Linux/Mac
netstat -ano | findstr :8000  # Windows

# Matar processo
kill -9 <PID>              # Linux/Mac
taskkill /PID <PID> /F     # Windows

# Ou usar outra porta
uvicorn main:app --port 8001
```

### Problema: JWT token inválido

**Sintoma:**
```
Could not validate credentials
```

**Solução:**
- Verifique se o `SECRET_KEY` no `.env` é consistente
- Certifique-se de que o token não expirou
- Verifique o formato do header: `Authorization: Bearer <token>`

---

## Próximos Passos

Após configurar o ambiente:

1. **Explore a API**: Acesse http://localhost:8000/docs
2. **Leia a documentação**: Veja [endpoints-api.md](endpoints-api.md)
3. **Implemente funcionalidades**: Consulte [tasks.md](tasks.md)
4. **Entenda a arquitetura**: Leia [arquitetura.md](arquitetura.md)

---

## Recursos Adicionais

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [SQLAlchemy Documentation](https://docs.sqlalchemy.org/)
- [Alembic Documentation](https://alembic.sqlalchemy.org/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Docker Documentation](https://docs.docker.com/)

---

**Última atualização**: 2024-01-15
