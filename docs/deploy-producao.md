# Checklist de Deploy em Produção

Checklist completo para deploy seguro do PlutusGrip em produção.

---

## 📋 Pré-Requisitos

### Infraestrutura

- [ ] Servidor com Docker e Docker Compose instalados
- [ ] Domínio configurado e apontando para o servidor
- [ ] Firewall configurado (portas 80, 443, 22)
- [ ] Certificado SSL/TLS obtido (Let's Encrypt recomendado)
- [ ] Banco de dados PostgreSQL externo provisionado e acessível

### Credenciais e Acesso

- [ ] Acesso SSH ao servidor
- [ ] Credenciais do banco de dados PostgreSQL
- [ ] Repositório Git acessível
- [ ] Variáveis de ambiente definidas

---

## 🔐 Segurança

### 1. Banco de Dados Externo

- [ ] PostgreSQL 16+ instalado e rodando
- [ ] Usuário e senha fortes configurados
- [ ] Database criado (`plutusgrip_production`)
- [ ] Firewall permite conexão apenas do servidor de aplicação
- [ ] SSL/TLS habilitado na conexão (se possível)
- [ ] Backup automático configurado

**Testar Conexão:**
```bash
psql "postgresql://user:pass@host:5432/dbname" -c "SELECT version();"
```

### 2. Gerar SECRET_KEY

- [ ] Gerar nova SECRET_KEY forte
```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```
- [ ] NUNCA usar a SECRET_KEY de desenvolvimento
- [ ] Armazenar de forma segura (não commitar no Git)

### 3. Certificados SSL/TLS

- [ ] Certificados obtidos (Let's Encrypt, etc.)
- [ ] Certificados colocados em `nginx/certs/`
```bash
nginx/certs/
├── fullchain.pem
└── privkey.pem
```
- [ ] Permissões corretas (`chmod 644 fullchain.pem`, `chmod 600 privkey.pem`)
- [ ] Renovação automática configurada

**Obter com Let's Encrypt:**
```bash
sudo certbot certonly --standalone -d seudominio.com -d www.seudominio.com
sudo cp /etc/letsencrypt/live/seudominio.com/fullchain.pem nginx/certs/
sudo cp /etc/letsencrypt/live/seudominio.com/privkey.pem nginx/certs/
```

---

## ⚙️ Configuração

### 1. Arquivo .env.prod

- [ ] Copiar template: `cp .env.prod .env.prod.local`
- [ ] Editar `.env.prod.local` com valores reais:

#### Database (CRÍTICO)
```bash
DATABASE_URL=postgresql://PROD_USER:PROD_PASSWORD@db.seudominio.com:5432/plutusgrip_production
```
- [ ] Substituir `PROD_USER` por usuário real
- [ ] Substituir `PROD_PASSWORD` por senha real
- [ ] Substituir `db.seudominio.com` por host real
- [ ] Testar conexão antes de continuar

#### Segurança (CRÍTICO)
```bash
SECRET_KEY=<VALOR_GERADO_NO_PASSO_ANTERIOR>
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
```
- [ ] SECRET_KEY gerado e único
- [ ] NUNCA usar valor de exemplo

#### CORS (CRÍTICO)
```bash
ALLOWED_ORIGINS=https://seudominio.com,https://www.seudominio.com,https://api.seudominio.com
```
- [ ] Incluir APENAS domínios reais
- [ ] Usar HTTPS (não HTTP)
- [ ] Sem espaços entre vírgulas

#### Frontend
```bash
VITE_API_URL=https://seudominio.com/api
```
- [ ] Usar HTTPS
- [ ] Incluir `/api` no final

#### Docker
```bash
API_DOCKERFILE=Dockerfile
FRONTEND_DOCKERFILE=Dockerfile
APP_ENV=production
DEBUG=False
RESTART_POLICY=always
```
- [ ] Confirmar `DEBUG=False`
- [ ] Confirmar `APP_ENV=production`

#### Database Pool (Produção)
```bash
DB_POOL_SIZE=20
DB_MAX_OVERFLOW=30
DB_POOL_TIMEOUT=60
DB_POOL_RECYCLE=3600
```
- [ ] Ajustar baseado na carga esperada
- [ ] Verificar limites do plano do banco

#### Logging
```bash
LOG_LEVEL=INFO
```
- [ ] `INFO` para produção (não `DEBUG`)
- [ ] Configurar agregação de logs se necessário

### 2. Nginx Configuration

- [ ] Editar `nginx/nginx.conf`
- [ ] Descomentar seção **HTTP to HTTPS REDIRECT**
- [ ] Descomentar seção **HTTPS SERVER**
- [ ] Atualizar `server_name` com domínio real
```nginx
server_name seudominio.com www.seudominio.com;
```
- [ ] Verificar paths dos certificados
```nginx
ssl_certificate /etc/nginx/certs/fullchain.pem;
ssl_certificate_key /etc/nginx/certs/privkey.pem;
```
- [ ] (Opcional) Ajustar rate limiting se necessário

---

## 🏗️ Build e Deploy

### 1. Clonar Repositório

```bash
cd /opt  # ou diretório de sua escolha
git clone <repository-url> plutusgrip-app
cd plutusgrip-app
```

- [ ] Repositório clonado
- [ ] Branch correto (`main` ou `production`)

### 2. Configurar Ambiente

```bash
# Copiar arquivo de produção
cp .env.prod .env.prod.local

# Editar com valores reais
nano .env.prod.local

# Verificar configuração (NÃO mostra senhas)
grep -v "PASSWORD\|SECRET" .env.prod.local
```

- [ ] Arquivo configurado
- [ ] Valores verificados
- [ ] NUNCA commitar `.env.prod.local` no Git

### 3. Build das Imagens

```bash
docker compose --profile prod --env-file .env.prod.local build --no-cache
```

- [ ] Build completado sem erros
- [ ] Imagens criadas:
  - [ ] `plutusgrip-app-api`
  - [ ] `plutusgrip-app-frontend`

**Verificar:**
```bash
docker images | grep plutusgrip
```

### 4. Iniciar Serviços

```bash
docker compose --profile prod --env-file .env.prod.local up -d
```

- [ ] Serviços iniciados:
  - [ ] `plutusgrip_api`
  - [ ] `plutusgrip_frontend`
  - [ ] `plutusgrip_nginx`

**Verificar:**
```bash
docker compose --profile prod --env-file .env.prod.local ps
```

Todos devem estar `Up` e `healthy`.

---

## ✅ Verificação

### 1. Health Checks

```bash
# API health
curl -f http://localhost:8000/health
# Deve retornar: {"status":"healthy"}

# Através do Nginx
curl -f http://localhost/health
curl -f http://localhost/api/health

# HTTPS (se configurado)
curl -f https://seudominio.com/health
curl -f https://seudominio.com/api/health
```

- [ ] API responde
- [ ] Nginx responde
- [ ] HTTPS funciona (se configurado)

### 2. Documentação da API

```bash
# Acessar no navegador
https://seudominio.com/docs
```

- [ ] Swagger UI carrega
- [ ] Endpoints listados
- [ ] Pode fazer requisições de teste

### 3. Frontend

```bash
# Acessar no navegador
https://seudominio.com
```

- [ ] Página carrega
- [ ] Sem erros no console
- [ ] Assets carregam (CSS, JS, imagens)

### 4. Conexão com Banco

```bash
# Verificar logs da API
docker compose --profile prod --env-file .env.prod.local logs api | grep -i "database\|connection"
```

- [ ] Sem erros de conexão
- [ ] Pool de conexões iniciado
- [ ] Migrations aplicadas

### 5. Logs

```bash
# Ver logs em tempo real
docker compose --profile prod --env-file .env.prod.local logs -f

# Verificar erros
docker compose --profile prod --env-file .env.prod.local logs | grep -i "error\|fatal"
```

- [ ] Sem erros críticos
- [ ] Serviços logando corretamente

---

## 📊 Monitoramento e Manutenção

### 1. Configurar Monitoramento

- [ ] Uptime monitoring (UptimeRobot, Pingdom, etc.)
- [ ] Log aggregation (Papertrail, Loggly, ELK Stack)
- [ ] Metrics (Prometheus + Grafana, Datadog, New Relic)
- [ ] Error tracking (Sentry, Rollbar)
- [ ] SSL certificate expiration alerts

**Mínimo Recomendado:**
```bash
# Cron para checar health a cada 5 min
*/5 * * * * curl -f https://seudominio.com/health || echo "API DOWN" | mail -s "Alert" admin@email.com
```

### 2. Backups

- [ ] Backup automático do banco configurado
- [ ] Teste de restauração realizado
- [ ] Backup off-site configurado
- [ ] Retention policy definida (ex: 30 dias)

**Script de Backup:**
```bash
#!/bin/bash
# backup-db.sh
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/postgres"
DB_URL="postgresql://user:pass@host:5432/dbname"

pg_dump "$DB_URL" | gzip > "$BACKUP_DIR/backup_$TIMESTAMP.sql.gz"

# Manter apenas últimos 30 dias
find "$BACKUP_DIR" -name "backup_*.sql.gz" -mtime +30 -delete
```

### 3. Logs Rotation

```bash
# Configurar logrotate
sudo nano /etc/logrotate.d/docker-plutusgrip
```

```
/var/lib/docker/containers/*/*.log {
    daily
    rotate 7
    compress
    delaycompress
    missingok
    notifempty
    copytruncate
}
```

### 4. Resource Monitoring

```bash
# Ver uso de recursos
docker stats

# Alertar se uso > 80%
# (configurar com ferramenta de monitoring)
```

- [ ] Monitoring de CPU configurado
- [ ] Monitoring de memória configurado
- [ ] Monitoring de disco configurado
- [ ] Alerts configurados

---

## 🔄 Atualizações

### Deploy de Novas Versões

```bash
# 1. Pull código
cd /opt/plutusgrip-app
git pull origin main

# 2. Rebuild (se houve mudança no código)
docker compose --profile prod --env-file .env.prod.local build --no-cache

# 3. Rolling update (mínimo downtime)
docker compose --profile prod --env-file .env.prod.local up -d --no-deps --build api
docker compose --profile prod --env-file .env.prod.local up -d --no-deps --build frontend

# 4. Verificar
docker compose --profile prod --env-file .env.prod.local ps
curl https://seudominio.com/health
```

### Rollback

```bash
# 1. Identificar commit anterior
git log --oneline -5

# 2. Checkout
git checkout <commit-hash>

# 3. Rebuild e restart
docker compose --profile prod --env-file .env.prod.local build --no-cache
docker compose --profile prod --env-file .env.prod.local up -d
```

---

## 🔒 Segurança Contínua

### Checklist Periódico (Mensal)

- [ ] Atualizar dependências (npm, pip)
- [ ] Atualizar imagens base do Docker
- [ ] Revisar logs de segurança
- [ ] Verificar certificados SSL (renovar se < 30 dias)
- [ ] Testar backups
- [ ] Revisar usuários e acessos
- [ ] Atualizar documentação

### Hardening Adicional (Opcional)

- [ ] Fail2ban configurado
- [ ] Rate limiting do firewall
- [ ] DDoS protection (Cloudflare, etc.)
- [ ] WAF (Web Application Firewall)
- [ ] VPN para acesso admin
- [ ] 2FA para serviços críticos
- [ ] Segredos em vault (HashiCorp Vault, AWS Secrets Manager)

---

## 🆘 Troubleshooting

### Serviço não inicia

```bash
# Ver logs detalhados
docker compose --profile prod --env-file .env.prod.local logs <service-name>

# Verificar configuração
docker compose --profile prod --env-file .env.prod.local config

# Verificar recursos
docker stats
df -h  # espaço em disco
```

### Erro de conexão com banco

```bash
# Testar conexão do container
docker compose --profile prod --env-file .env.prod.local exec api python -c "import asyncpg; print('OK')"

# Verificar DATABASE_URL
docker compose --profile prod --env-file .env.prod.local exec api env | grep DATABASE_URL

# Testar de fora do container
psql "$DATABASE_URL" -c "SELECT 1;"
```

### Nginx 502 Bad Gateway

```bash
# Verificar backend
docker compose --profile prod --env-file .env.prod.local exec api curl http://localhost:8000/health

# Ver logs
docker compose --profile prod --env-file .env.prod.local logs api
docker compose --profile prod --env-file .env.prod.local logs nginx
```

### Performance Issues

```bash
# Ver recursos
docker stats

# Ver queries lentas no banco
# (configurar pg_stat_statements)

# Ver logs de slow requests
docker compose --profile prod --env-file .env.prod.local logs nginx | grep "rt=[1-9][0-9]*\."
```

---

## 📝 Pós-Deploy

### Documentação

- [ ] Atualizar documentação interna
- [ ] Documentar credenciais (em vault seguro)
- [ ] Documentar procedimentos de recovery
- [ ] Compartilhar com equipe

### Comunicação

- [ ] Notificar stakeholders sobre deploy
- [ ] Atualizar status page (se houver)
- [ ] Documentar issues conhecidos

---

## ✅ Checklist Final

Antes de considerar o deploy completo, verificar:

### Funcional
- [ ] ✅ Aplicação acessível via HTTPS
- [ ] ✅ API respondendo corretamente
- [ ] ✅ Frontend carregando sem erros
- [ ] ✅ Autenticação funcionando
- [ ] ✅ CRUD de transações funcionando
- [ ] ✅ Todas as features principais testadas

### Segurança
- [ ] ✅ HTTPS configurado e funcionando
- [ ] ✅ Certificados válidos
- [ ] ✅ SECRET_KEY único e forte
- [ ] ✅ DATABASE_URL com credenciais fortes
- [ ] ✅ Firewall configurado
- [ ] ✅ Portas desnecessárias fechadas

### Performance
- [ ] ✅ Rate limiting ativo
- [ ] ✅ Gzip compression ativa
- [ ] ✅ Resource limits configurados
- [ ] ✅ Health checks passando
- [ ] ✅ Resposta < 2s em média

### Monitoramento
- [ ] ✅ Uptime monitoring configurado
- [ ] ✅ Log aggregation configurado
- [ ] ✅ Backups automáticos configurados
- [ ] ✅ Alerts configurados

### Documentação
- [ ] ✅ Credenciais documentadas (vault seguro)
- [ ] ✅ Procedimentos de recovery documentados
- [ ] ✅ Contatos de emergência definidos
- [ ] ✅ Runbook atualizado

---

## 🎉 Deploy Completo!

Se todos os itens acima estão marcados, seu deploy está completo e seguro!

**Próximos passos:**
1. Monitorar por 24-48h
2. Coletar feedback dos usuários
3. Ajustar recursos conforme necessário
4. Planejar próxima release

**Lembrete:** Mantenha backups, monitore constantemente e atualize regularmente!
