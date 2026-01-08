# PlutusGrip Docker Setup

Setup Docker completo para PlutusGrip com configuração unificada usando profiles para desenvolvimento e produção.

## 🎯 Mudanças Principais

- ✅ **Docker Compose Unificado**: 1 arquivo `docker-compose.yml` com profiles (dev/prod)
- ✅ **Produção Real**: Sem container postgres em prod, usa banco externo via `DATABASE_URL`
- ✅ **Gunicorn Multi-Worker**: 4 workers para API em produção
- ✅ **Nginx Reverse Proxy**: Rate limiting, gzip, headers de segurança
- ✅ **pgAdmin**: Apenas em desenvolvimento

---

## 🚀 Quick Start

### Pré-requisitos

- Docker & Docker Compose (versão 3.9+)
- Git

### Desenvolvimento

```bash
# Opção 1: Script de gerenciamento (recomendado)
./docker-manage.sh up dev         # Linux/Mac
docker-manage.bat up dev          # Windows

# Opção 2: Make
make up                           # ou make dev

# Opção 3: Docker Compose direto
docker compose --profile dev --env-file .env.dev up -d
```

**Acessar:**
- Frontend: http://localhost:5173
- API: http://localhost:8000
- API Docs: http://localhost:8000/docs
- pgAdmin: http://localhost:5050 (admin@plutusgrip.com / admin123)
- PostgreSQL: localhost:5432

### Produção

**⚠️ IMPORTANTE**: Configure DATABASE_URL em `.env.prod` antes!

```bash
# 1. Configurar .env.prod
cp .env.prod .env.prod.local
# Editar .env.prod.local com:
# - DATABASE_URL (banco externo)
# - SECRET_KEY (gerar novo)
# - ALLOWED_ORIGINS (seu domínio)
# - VITE_API_URL (seu domínio/api)

# 2. Iniciar
./docker-manage.sh up prod        # Linux/Mac
docker-manage.bat up prod         # Windows
# ou
make up ENV=prod
```

**Acessar:**
- Aplicação: http://localhost
- API: http://localhost/api
- Docs: http://localhost/docs

---

## 📦 Estrutura

```
docker-compose.yml        # Compose unificado com profiles
├── Profile: dev
│   ├── postgres         # PostgreSQL 16
│   ├── pgadmin          # pgAdmin 4
│   ├── api              # FastAPI (hot reload)
│   └── frontend         # React Vite (hot reload)
└── Profile: prod
    ├── api              # FastAPI + Gunicorn 4 workers
    ├── frontend         # React build + Nginx
    └── nginx            # Reverse proxy
```

---

## 🛠 Comandos Disponíveis

### Via Script

```bash
# Linux/Mac
./docker-manage.sh [comando] [ambiente]

# Windows
docker-manage.bat [comando] [ambiente]

# Comandos:
up              # Iniciar containers
down            # Parar containers
restart         # Reiniciar
logs            # Ver logs (todos)
logs-api        # Ver logs da API
logs-frontend   # Ver logs do frontend
logs-db         # Ver logs do banco (dev only)
shell           # Acessar shell da API
shell-db        # Acessar shell do banco (dev only)
build           # Build imagens
clean           # Limpar tudo (WARNING!)
status          # Status dos containers
test            # Rodar testes (dev only)
pgadmin         # Iniciar pgAdmin (dev only)
help            # Ajuda
```

### Via Makefile

```bash
make up                  # Iniciar dev
make up ENV=prod         # Iniciar prod
make logs                # Ver logs
make logs ENV=prod       # Ver logs prod
make shell               # Shell da API
make pgadmin             # Iniciar pgAdmin
make build ENV=prod      # Build prod
make clean ENV=dev       # Limpar dev
make test                # Rodar testes
make dev                 # Atalho para dev
make prod                # Atalho para prod
```

### Via Docker Compose Direto

```bash
# Desenvolvimento
docker compose --profile dev --env-file .env.dev up -d
docker compose --profile dev --env-file .env.dev logs -f
docker compose --profile dev --env-file .env.dev down

# Produção
docker compose --profile prod --env-file .env.prod up -d
docker compose --profile prod --env-file .env.prod logs -f
docker compose --profile prod --env-file .env.prod down
```

---

## ⚙️ Configuração

### Arquivos de Ambiente

- `.env.example` - Template completo
- `.env.dev` - Desenvolvimento (pronto para usar)
- `.env.prod` - Produção (DEVE ser configurado)

### Variáveis Críticas (.env.prod)

```bash
# ⚠️ DEVE MUDAR:
DATABASE_URL=postgresql://user:pass@EXTERNAL_HOST:5432/db
SECRET_KEY=<gerar com: python -c "import secrets; print(secrets.token_urlsafe(32))">
ALLOWED_ORIGINS=https://seudominio.com,https://www.seudominio.com
VITE_API_URL=https://seudominio.com/api

# Dockerfiles
API_DOCKERFILE=Dockerfile           # Produção usa gunicorn
FRONTEND_DOCKERFILE=Dockerfile      # Produção usa nginx

# Environment
APP_ENV=production
DEBUG=False
RESTART_POLICY=always
```

---

## 🔧 Desenvolvimento

### Hot Reload

**Ativado automaticamente em dev:**
- Frontend: Modifique `plutsgrip-frond-refac/src/**` → Reload automático
- API: Modifique `plutsgrip-api/app/**` → Reload automático

### Acessar pgAdmin

```bash
# Método 1
./docker-manage.sh pgadmin dev

# Método 2
make pgadmin

# Acesso:
http://localhost:5050
Email: admin@plutusgrip.com
Senha: admin123

# Conectar ao PostgreSQL no pgAdmin:
Host: postgres
Port: 5432
Database: plutusgrip_db
Username: plutusgrip_user
Password: plutusgrip_password
```

### Rodar Testes

```bash
./docker-manage.sh test dev
# ou
make test
```

### Migrations

```bash
# Acessar shell da API
./docker-manage.sh shell dev

# Criar migration
alembic revision --autogenerate -m "descricao"

# Aplicar migrations
alembic upgrade head

# Reverter
alembic downgrade -1
```

---

## 🚀 Produção

### Setup Banco de Dados Externo

**Opção 1: PostgreSQL Gerenciado (Recomendado)**
- AWS RDS
- Google Cloud SQL
- Azure Database for PostgreSQL
- Neon (Serverless)
- Supabase

**Opção 2: PostgreSQL Auto-Hospedado**

```bash
# Exemplo: Container separado para teste
docker run -d --name postgres_external \
  -e POSTGRES_USER=plutusgrip_user \
  -e POSTGRES_PASSWORD=plutusgrip_password \
  -e POSTGRES_DB=plutusgrip_production \
  -p 5432:5432 \
  postgres:16-alpine
```

### Configurar SSL/TLS (Nginx)

```bash
# 1. Obter certificados (Let's Encrypt)
sudo certbot certonly --standalone -d seudominio.com

# 2. Copiar certificados
sudo cp /etc/letsencrypt/live/seudominio.com/fullchain.pem nginx/certs/
sudo cp /etc/letsencrypt/live/seudominio.com/privkey.pem nginx/certs/

# 3. Editar nginx/nginx.conf
# Descomentar seção HTTPS SERVER e HTTP to HTTPS REDIRECT

# 4. Reiniciar
docker compose --profile prod restart nginx
```

### Build e Deploy

```bash
# 1. Build imagens
make build ENV=prod

# 2. Iniciar
make up ENV=prod

# 3. Verificar
docker compose --profile prod ps
docker compose --profile prod logs -f

# 4. Testar
curl http://localhost/health
curl http://localhost/api/health
```

### Monitoramento

```bash
# Logs em tempo real
docker compose --profile prod logs -f

# Logs específicos
docker compose --profile prod logs -f api
docker compose --profile prod logs -f nginx

# Métricas de recursos
docker stats
```

---

## 🐛 Troubleshooting

### Erro: "Database connection failed" (Produção)

**Causa**: DATABASE_URL incorreto ou banco inacessível

**Solução**:
```bash
# 1. Verificar DATABASE_URL em .env.prod
cat .env.prod | grep DATABASE_URL

# 2. Testar conexão do container
docker compose --profile prod exec api python -c "import asyncpg; print('OK')"

# 3. Verificar firewall do banco externo
# Permitir IP do servidor
```

### Erro: "port already in use"

**Causa**: Porta já ocupada

**Solução**:
```bash
# Identificar processo
netstat -ano | findstr :8000     # Windows
lsof -i :8000                    # Linux/Mac

# Parar containers antigos
docker compose --profile dev down
docker compose --profile prod down
```

### Frontend não carrega

**Causa**: VITE_API_URL incorreto

**Solução**:
```bash
# Verificar variável
cat .env.dev | grep VITE_API_URL

# Dev deve apontar para localhost:8000
# Prod deve apontar para domínio/api

# Rebuild se necessário
docker compose --profile dev build frontend
```

### Nginx 502 Bad Gateway

**Causa**: Backend não está respondendo

**Solução**:
```bash
# 1. Verificar API
docker compose --profile prod logs api

# 2. Verificar health
docker compose --profile prod exec api curl http://localhost:8000/health

# 3. Reiniciar se necessário
docker compose --profile prod restart api
```

---

## 📚 Documentação Adicional

- **Nginx**: `nginx/README.md`
- **Migração**: `DOCKER_MIGRATION.md`
- **Produção**: `PRODUCTION_CHECKLIST.md`
- **API**: `plutsgrip-api/docs/`
- **Frontend**: `plutsgrip-frond-refac/docs/`

---

## 🔒 Segurança

### Dev Environment

- ✅ Use apenas em ambiente local
- ✅ Portas expostas: 5173, 8000, 5432, 5050
- ⚠️ Senhas padrão (OK para dev)

### Prod Environment

- ✅ Portas expostas: 80, 443
- ✅ Nginx rate limiting (10-30 req/s)
- ✅ Headers de segurança
- ✅ Non-root user nos containers
- ✅ Resource limits
- ✅ Health checks
- ⚠️ DEVE usar HTTPS
- ⚠️ DEVE trocar todas as senhas
- ⚠️ DEVE configurar firewall

---

## 📋 Checklist Rápido

### Desenvolvimento
- [ ] Docker instalado
- [ ] Clonar repositório
- [ ] `./docker-manage.sh up dev`
- [ ] Acessar http://localhost:5173

### Produção
- [ ] Banco externo configurado
- [ ] Editar `.env.prod`:
  - [ ] DATABASE_URL
  - [ ] SECRET_KEY (gerar novo)
  - [ ] ALLOWED_ORIGINS
  - [ ] VITE_API_URL
- [ ] Certificados SSL em `nginx/certs/`
- [ ] Descomentar HTTPS em `nginx/nginx.conf`
- [ ] `./docker-manage.sh build prod`
- [ ] `./docker-manage.sh up prod`
- [ ] Testar domínio
- [ ] Configurar monitoramento
- [ ] Configurar backups do banco

---

## 🤝 Suporte

Para mais informações, consulte:
- Issues: [GitHub Issues](https://github.com/seu-repo/issues)
- Documentação completa: `docs/`
- Nginx: `nginx/README.md`

---

## 📄 Licença

Este projeto está sob a licença [SUA LICENÇA].
