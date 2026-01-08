# Guia de Migração Docker

Guia para migrar do setup Docker antigo para o novo setup unificado com profiles.

## ❗ O Que Mudou

### Antes (Setup Antigo)

- **4 arquivos docker-compose**:
  - `docker-compose.dev.yml`
  - `docker-compose.prod.yml`
  - `plutsgrip-api/docker-compose.development.yml`
  - `plutsgrip-api/docker-compose.production.yml`

- **Produção incluía postgres container**
- **API usava uvicorn simples**
- **Múltiplos scripts de gerenciamento**

### Agora (Setup Novo)

- **1 arquivo docker-compose.yml** com profiles `dev` e `prod`
- **Produção SEM postgres** - usa banco externo via `DATABASE_URL`
- **API usa gunicorn** com 4 workers em produção
- **Scripts unificados** atualizados para profiles

---

## 🔄 Passos de Migração

### 1. Parar Ambientes Antigos

```bash
# Parar dev antigo
docker-compose -f docker-compose.dev.yml down

# Parar prod antigo
docker-compose -f docker-compose.prod.yml down

# Ou parar tudo
docker stop $(docker ps -aq)
```

### 2. Atualizar Código

```bash
git pull origin main
```

### 3. Verificar Novos Arquivos

Arquivos criados/atualizados:
- ✅ `docker-compose.yml` - Novo compose unificado
- ✅ `.env.example` - Template completo
- ✅ `.env.dev` - Atualizado
- ✅ `.env.prod` - Atualizado (REVISAR!)
- ✅ `nginx/nginx.conf` - Config melhorada
- ✅ `docker-manage.sh` - Script atualizado
- ✅ `docker-manage.bat` - Script atualizado
- ✅ `Makefile` - Atualizado
- ✅ `plutsgrip-api/Dockerfile` - Agora usa gunicorn

Arquivos removidos:
- ❌ `docker-compose.dev.yml`
- ❌ `docker-compose.prod.yml`
- ❌ `plutsgrip-api/docker-compose.*.yml`
- ❌ `plutsgrip-api/docker-*.{sh,bat}`
- ❌ `nginx/prod.conf` (renomeado)

### 4. Configurar Ambiente

#### Desenvolvimento (Sem Mudanças)

`.env.dev` já está pronto para usar!

```bash
# Verificar configuração
cat .env.dev
```

#### Produção (⚠️ IMPORTANTE)

**DEVE configurar `.env.prod` antes de usar!**

```bash
# Editar .env.prod
nano .env.prod  # ou vim, code, etc.
```

**Variáveis que DEVEM ser alteradas:**

```bash
# 1. Banco de dados externo
DATABASE_URL=postgresql://user:pass@EXTERNAL_HOST:5432/plutusgrip_production

# 2. Gerar novo SECRET_KEY
python -c "import secrets; print(secrets.token_urlsafe(32))"
SECRET_KEY=<copiar saída do comando acima>

# 3. Seu domínio
ALLOWED_ORIGINS=https://seudominio.com,https://www.seudominio.com
VITE_API_URL=https://seudominio.com/api
```

### 5. Iniciar Novo Setup

#### Desenvolvimento

```bash
# Método 1: Script (recomendado)
./docker-manage.sh up dev

# Método 2: Make
make up

# Método 3: Docker Compose
docker compose --profile dev --env-file .env.dev up -d
```

Verificar:
```bash
curl http://localhost:8000/health
curl http://localhost:5173
```

#### Produção

**⚠️ Somente após configurar DATABASE_URL!**

```bash
# Método 1: Script
./docker-manage.sh up prod

# Método 2: Make
make up ENV=prod

# Método 3: Docker Compose
docker compose --profile prod --env-file .env.prod up -d
```

Verificar:
```bash
curl http://localhost/health
curl http://localhost/api/health
```

---

## 🔧 Diferenças de Uso

### Comandos Antigos vs Novos

#### Desenvolvimento

| Antigo | Novo |
|--------|------|
| `docker-compose -f docker-compose.dev.yml up -d` | `docker compose --profile dev --env-file .env.dev up -d` |
| `bash docker-manage.sh up dev` | `bash docker-manage.sh up dev` *(mesmo)* |
| `make up` | `make up` *(mesmo)* |

#### Produção

| Antigo | Novo |
|--------|------|
| `docker-compose -f docker-compose.prod.yml up -d` | `docker compose --profile prod --env-file .env.prod up -d` |
| `bash docker-manage.sh up prod` | `bash docker-manage.sh up prod` *(mesmo)* |
| `make up ENV=prod` | `make up ENV=prod` *(mesmo)* |

### Novos Comandos Disponíveis

```bash
# Iniciar apenas pgAdmin
./docker-manage.sh pgadmin dev
make pgadmin

# Atalhos rápidos
make dev      # Inicia desenvolvimento
make prod     # Inicia produção
```

---

## ⚠️ Pontos de Atenção

### 1. Produção NÃO Inclui Postgres

**Antes**: Postgres rodava em container
**Agora**: DEVE usar banco externo

**Opções de Banco Externo:**
- AWS RDS
- Google Cloud SQL
- Neon (Serverless)
- Supabase
- PostgreSQL auto-hospedado

**Teste Local com Postgres "Externo":**

```bash
# Criar container postgres separado
docker run -d --name postgres_external \
  -e POSTGRES_USER=plutusgrip_user \
  -e POSTGRES_PASSWORD=plutusgrip_password \
  -e POSTGRES_DB=plutusgrip_production \
  -p 5433:5432 \
  postgres:16-alpine

# Configurar DATABASE_URL em .env.prod
DATABASE_URL=postgresql://plutusgrip_user:plutusgrip_password@host.docker.internal:5433/plutusgrip_production
```

### 2. API Agora Usa Gunicorn

**Antes**: `uvicorn main:app --host 0.0.0.0 --port 8000`
**Agora**: `gunicorn -w 4 -k uvicorn.workers.UvicornWorker ...`

**Benefícios:**
- 4 workers para requisições concorrentes
- Melhor performance
- Graceful shutdown

**Ajustar workers se necessário:**
Editar `plutsgrip-api/Dockerfile` linha 79:
```dockerfile
# Trocar -w 4 por -w 2 (ou outro valor)
CMD ["sh", "-c", "alembic upgrade head && gunicorn -w 4 ..."]
```

### 3. Nginx Agora É Reverse Proxy

**Antes**: Acesso direto aos serviços em prod
**Agora**: Tudo passa pelo Nginx em prod

**URLs em Produção:**
- Aplicação: `http://localhost` → Nginx → Frontend:3000
- API: `http://localhost/api` → Nginx → API:8000
- Docs: `http://localhost/docs` → Nginx → API:8000

**Configuração:**
- Rate limiting automático
- Gzip compression
- Security headers
- SSL/TLS ready

### 4. Volumes e Dados

**Volumes mudaram de nome:**

| Antigo | Novo |
|--------|------|
| `postgres_data_dev` | `postgres_data` |
| `postgres_data_prod` | *(removido, usa DB externo)* |

**Se precisar migrar dados:**

```bash
# Exportar dados do volume antigo
docker run --rm -v postgres_data_dev:/data -v $(pwd):/backup postgres:16-alpine tar czf /backup/postgres_backup.tar.gz /data

# Importar para novo volume
docker run --rm -v postgres_data:/data -v $(pwd):/backup postgres:16-alpine tar xzf /backup/postgres_backup.tar.gz -C /
```

---

## ✅ Checklist de Migração

### Pré-Migração
- [ ] Fazer backup dos dados (se houver)
- [ ] Parar todos os containers antigos
- [ ] Ler esta documentação completamente

### Desenvolvimento
- [ ] Atualizar código (`git pull`)
- [ ] Verificar `.env.dev`
- [ ] Iniciar: `./docker-manage.sh up dev`
- [ ] Testar: http://localhost:5173
- [ ] Verificar hot reload funcionando

### Produção
- [ ] Configurar banco de dados externo
- [ ] Atualizar `.env.prod`:
  - [ ] DATABASE_URL
  - [ ] SECRET_KEY
  - [ ] ALLOWED_ORIGINS
  - [ ] VITE_API_URL
- [ ] (Opcional) Configurar SSL em `nginx/certs/`
- [ ] (Opcional) Descomentar HTTPS em `nginx/nginx.conf`
- [ ] Build: `./docker-manage.sh build prod`
- [ ] Iniciar: `./docker-manage.sh up prod`
- [ ] Testar: http://localhost/health
- [ ] Verificar logs: `docker compose --profile prod logs -f`

### Pós-Migração
- [ ] Remover volumes antigos (se não precisar)
- [ ] Atualizar documentação interna do time
- [ ] Configurar monitoramento
- [ ] Configurar backups do banco externo

---

## 🆘 Rollback (Se Necessário)

Se algo der errado, você pode voltar ao setup antigo:

```bash
# 1. Parar novo setup
docker compose --profile dev down
docker compose --profile prod down

# 2. Voltar ao commit anterior
git log --oneline -5  # Ver commits recentes
git checkout <commit-hash-anterior>

# 3. Iniciar setup antigo
docker-compose -f docker-compose.dev.yml up -d
# ou
docker-compose -f docker-compose.prod.yml up -d
```

**Nota:** Mantenha o commit do setup antigo anotado por alguns dias até confirmar que a migração está estável.

---

## 📞 Suporte

Problemas na migração?
1. Verifique `DOCKER_README.md` → Seção Troubleshooting
2. Verifique logs: `docker compose --profile dev logs -f`
3. Abra um issue no GitHub

---

## 🎉 Benefícios do Novo Setup

Após a migração, você terá:

✅ **Simplicidade**: 1 arquivo compose vs 4
✅ **Clareza**: Profiles explícitos dev/prod
✅ **Produção Real**: DB externo, gunicorn, nginx
✅ **Segurança**: Rate limiting, headers, resource limits
✅ **Performance**: Multi-worker API, cache otimizado
✅ **Manutenibilidade**: Configuração centralizada
✅ **Documentação**: Guias completos

Vale a migração! 🚀
