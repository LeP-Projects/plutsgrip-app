# 🚀 Guia de Deploy - PlutusGrip

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Arquitetura do Deploy](#arquitetura-do-deploy)
3. [Informações de Acesso](#informações-de-acesso)
4. [Como Atualizar a Aplicação](#como-atualizar-a-aplicação)
5. [Estrutura de Diretórios](#estrutura-de-diretórios)
6. [Serviços e Comandos Úteis](#serviços-e-comandos-úteis)
7. [Troubleshooting](#troubleshooting)
8. [Monitoramento e Logs](#monitoramento-e-logs)
9. [Backup e Restauração](#backup-e-restauração)

---

## 🎯 Visão Geral

O PlutusGrip está hospedado em um **Droplet da DigitalOcean** com a seguinte stack:

- **Frontend:** React + Vite (servido via Nginx)
- **Backend:** FastAPI + Python 3.11 (rodando como serviço systemd)
- **Banco de Dados:** Neon PostgreSQL (Free Tier)
- **Proxy Reverso:** Nginx
- **Sistema Operacional:** Ubuntu 22.04 LTS

**Custo:** $0 por 12 meses (usando créditos de $144.48)

---

## 🏗️ Arquitetura do Deploy

```
Internet
   ↓
[DigitalOcean Cloud Firewall]
   ↓ (Portas 80, 443, 22)
[Droplet - 68.183.98.186]
   ↓
[Nginx :80]
   ├─→ / (Frontend estático) → /opt/plutusgrip-frontend/dist/
   └─→ /api/* (Backend API)   → localhost:8000
       ↓
   [FastAPI + Uvicorn :8000]
       ↓
   [Neon PostgreSQL via SSL]
```

---

## 🔑 Informações de Acesso

### **Aplicação Web**
- **URL:** http://68.183.98.186
- **API:** http://68.183.98.186/api/health

### **Droplet (DigitalOcean)**
- **IP:** 68.183.98.186
- **SSH:** `ssh root@68.183.98.186` (requer chave SSH configurada)
- **Console Web:** https://cloud.digitalocean.com/droplets

### **Banco de Dados (Neon)**
- **Projeto:** PlutusGrip (rough-pond-76369130)
- **Branch:** br-orange-star-acm7oh7g (production)
- **Região:** sa-east-1 (São Paulo)
- **Connection String:** Ver `.env` no servidor

### **Repositório GitHub**
- **URL:** https://github.com/LeP-Projects/plutsgrip-app

---

## 🔄 Como Atualizar a Aplicação

### **Cenário 1: Atualização do Backend (Python/FastAPI)**

Quando houver mudanças no código do backend (`plutsgrip-api/`):

```bash
# 1. Conectar ao Droplet
ssh root@68.183.98.186
# Ou usar console web: https://cloud.digitalocean.com/droplets

# 2. Navegar para o diretório do backend
cd /opt/plutusgrip-api

# 3. Fazer backup do .env (importante!)
cp .env .env.backup

# 4. Puxar as mudanças do GitHub
git fetch origin main
git pull origin main

# 5. Ativar ambiente virtual
source venv/bin/activate

# 6. Instalar novas dependências (se houver)
pip install -r requirements.txt

# 7. Rodar migrations (se houver)
alembic upgrade head

# 8. Reiniciar o serviço
exit  # Sai do venv
systemctl restart plutusgrip-api

# 9. Verificar se está rodando
systemctl status plutusgrip-api

# 10. Verificar logs em tempo real
tail -f /var/log/plutusgrip/api.log
```

**Verificação:**
```bash
# Testar API
curl http://localhost:8000/health
curl http://68.183.98.186/api/health
```

---

### **Cenário 2: Atualização do Frontend (React/Vite)**

Quando houver mudanças no código do frontend (`plutsgrip-frond-refac/`):

#### **Opção A: Build Local + Upload (RECOMENDADO)**

```bash
# 1. Na sua máquina local
cd C:\Users\Preventiva\Documents\codes\plutsgrip-app\plutsgrip-frond-refac

# 2. Puxar as mudanças
git pull origin main

# 3. Verificar/atualizar .env.production
echo VITE_API_URL=http://68.183.98.186/api > .env.production

# 4. Instalar dependências (se houver novas)
npm install

# 5. Build de produção
npm run build

# 6. Criar arquivo tar para upload
tar -czf dist.tar.gz dist/

# 7. Enviar para o Droplet
scp dist.tar.gz root@68.183.98.186:/tmp/

# 8. No Droplet, extrair e substituir
ssh root@68.183.98.186
cd /opt/plutusgrip-frontend
rm -rf dist.backup
mv dist dist.backup  # Backup da versão anterior
tar -xzf /tmp/dist.tar.gz
chown -R plutusgrip:plutusgrip dist/
rm /tmp/dist.tar.gz

# 9. Verificar se funcionou
curl http://localhost/
```

#### **Opção B: Build no Droplet**

```bash
# 1. Conectar ao Droplet
ssh root@68.183.98.186

# 2. Navegar para o diretório
cd /opt/plutusgrip-frontend

# 3. Puxar mudanças
git pull origin main

# 4. Verificar .env.production
cat .env.production
# Deve conter: VITE_API_URL=http://68.183.98.186/api

# 5. Instalar dependências
npm install

# 6. Build
npm run build

# 7. Verificar
ls -la dist/

# 8. Não precisa reiniciar Nginx (arquivos estáticos)
```

---

### **Cenário 3: Atualização Completa (Backend + Frontend)**

```bash
# 1. Atualizar backend primeiro
cd /opt/plutusgrip-api
git pull origin main
source venv/bin/activate
pip install -r requirements.txt
alembic upgrade head
deactivate
systemctl restart plutusgrip-api

# 2. Atualizar frontend
cd /opt/plutusgrip-frontend
git pull origin main
npm install
npm run build

# 3. Verificar tudo
systemctl status plutusgrip-api nginx
curl http://localhost:8000/health
curl http://68.183.98.186/api/health
```

---

### **Cenário 4: Novas Migrations do Banco**

Quando houver novos arquivos em `plutsgrip-api/alembic/versions/`:

```bash
# 1. Conectar ao Droplet
ssh root@68.183.98.186

# 2. Navegar e ativar venv
cd /opt/plutusgrip-api
source venv/bin/activate

# 3. Ver migrations pendentes
alembic current
alembic history

# 4. Aplicar migrations
alembic upgrade head

# 5. Verificar se aplicou
alembic current

# 6. Reiniciar backend
deactivate
systemctl restart plutusgrip-api
```

---

### **Cenário 5: Rollback (Reverter Deploy)**

Se algo der errado após deploy:

#### **Backend:**
```bash
cd /opt/plutusgrip-api

# Voltar para commit anterior
git log --oneline -5  # Ver commits
git reset --hard <COMMIT_HASH_ANTERIOR>

# Reverter migrations (se necessário)
alembic downgrade -1  # Volta 1 migration
# ou
alembic downgrade <revision_id>

# Reiniciar
systemctl restart plutusgrip-api
```

#### **Frontend:**
```bash
cd /opt/plutusgrip-frontend

# Restaurar backup
rm -rf dist
mv dist.backup dist

# Ou voltar commit
git log --oneline -5
git reset --hard <COMMIT_HASH_ANTERIOR>
npm run build
```

---

## 📁 Estrutura de Diretórios

```
/opt/plutusgrip-api/          # Backend FastAPI
├── venv/                      # Ambiente virtual Python
├── alembic/                   # Migrations do banco
├── app/                       # Código da aplicação
├── main.py                    # Entry point
├── .env                       # Variáveis de ambiente (NÃO commitar!)
└── requirements.txt           # Dependências Python

/opt/plutusgrip-frontend/      # Frontend React
├── dist/                      # Build de produção (servido pelo Nginx)
├── src/                       # Código fonte
├── node_modules/              # Dependências Node
├── package.json               # Configuração NPM
└── .env.production            # Variáveis de ambiente do frontend

/etc/nginx/
├── sites-available/plutusgrip # Configuração do site
└── sites-enabled/plutusgrip   # Link simbólico

/etc/systemd/system/
└── plutusgrip-api.service     # Serviço do backend

/var/log/plutusgrip/
├── api.log                    # Logs do backend
└── api-error.log              # Erros do backend

/var/log/nginx/
├── plutusgrip-access.log      # Logs de acesso
└── plutusgrip-error.log       # Erros do Nginx
```

---

## 🛠️ Serviços e Comandos Úteis

### **Backend (plutusgrip-api.service)**

```bash
# Ver status
systemctl status plutusgrip-api

# Iniciar
systemctl start plutusgrip-api

# Parar
systemctl stop plutusgrip-api

# Reiniciar
systemctl restart plutusgrip-api

# Ver logs em tempo real
tail -f /var/log/plutusgrip/api.log

# Ver últimas 100 linhas
tail -n 100 /var/log/plutusgrip/api.log

# Ver erros
tail -f /var/log/plutusgrip/api-error.log
```

### **Nginx**

```bash
# Ver status
systemctl status nginx

# Testar configuração
nginx -t

# Recarregar configuração (sem downtime)
systemctl reload nginx

# Reiniciar
systemctl restart nginx

# Ver logs
tail -f /var/log/nginx/plutusgrip-access.log
tail -f /var/log/nginx/plutusgrip-error.log
```

### **Banco de Dados**

```bash
# Testar conexão
cd /opt/plutusgrip-api
source venv/bin/activate
python -c "from app.core.database import engine; print('Conexão OK')"

# Ver status das migrations
alembic current
alembic history

# Criar nova migration (após alterar models)
alembic revision --autogenerate -m "descrição da mudança"

# Aplicar migrations
alembic upgrade head

# Reverter última migration
alembic downgrade -1
```

---

## 🐛 Troubleshooting

### **Problema: API retorna 502 Bad Gateway**

```bash
# Verificar se o backend está rodando
systemctl status plutusgrip-api

# Se não estiver, ver o erro
journalctl -u plutusgrip-api.service -n 50

# Tentar iniciar manualmente
cd /opt/plutusgrip-api
source venv/bin/activate
uvicorn main:app --host 0.0.0.0 --port 8000
# Ver o erro que aparece
```

**Causas comuns:**
- Erro de sintaxe no código Python
- Dependência faltando no `requirements.txt`
- Problema na conexão com o banco Neon
- Porta 8000 já em uso

---

### **Problema: Frontend não carrega**

```bash
# Verificar se os arquivos existem
ls -la /opt/plutusgrip-frontend/dist/

# Verificar permissões
chown -R plutusgrip:plutusgrip /opt/plutusgrip-frontend/dist/

# Ver logs do Nginx
tail -f /var/log/nginx/plutusgrip-error.log

# Testar Nginx
nginx -t
```

---

### **Problema: Migrations falhando**

```bash
# Ver qual migration está falhando
alembic upgrade head

# Se tiver erro de "multiple heads"
alembic heads
alembic merge heads -m "merge heads"
alembic upgrade head

# Se tiver erro de objeto duplicado
# Marcar migration como aplicada sem executar
alembic stamp <revision_id>
alembic upgrade head
```

---

### **Problema: Conexão com Neon falhando**

```bash
# Verificar .env
cat /opt/plutusgrip-api/.env | grep DATABASE_URL

# Testar conexão direta
cd /opt/plutusgrip-api
source venv/bin/activate
python << EOF
from sqlalchemy import create_engine
url = "postgresql://neondb_owner:senha@host/neondb?ssl=require"
engine = create_engine(url.replace("postgresql://", "postgresql+asyncpg://"))
print("Conexão OK!")
EOF
```

---

### **Problema: Port 8000 já em uso**

```bash
# Ver quem está usando a porta
lsof -i :8000

# Matar processo
pkill -9 uvicorn

# Reiniciar serviço
systemctl restart plutusgrip-api
```

---

## 📊 Monitoramento e Logs

### **Logs do Backend**

```bash
# Tempo real
tail -f /var/log/plutusgrip/api.log

# Com filtro
tail -f /var/log/plutusgrip/api.log | grep ERROR

# Últimas 24 horas de erros
journalctl -u plutusgrip-api.service --since "24 hours ago" | grep ERROR
```

### **Logs do Nginx**

```bash
# Acessos em tempo real
tail -f /var/log/nginx/plutusgrip-access.log

# Erros
tail -f /var/log/nginx/plutusgrip-error.log

# Contar requisições por endpoint
cat /var/log/nginx/plutusgrip-access.log | grep -oP 'GET \K[^ ]+' | sort | uniq -c | sort -rn
```

### **Métricas do Sistema**

```bash
# CPU e memória
htop

# Uso de disco
df -h

# Processos Python
ps aux | grep python

# Conexões ativas
netstat -tupln | grep :8000
netstat -tupln | grep :80
```

---

## 💾 Backup e Restauração

### **Backup do Banco (Neon)**

```bash
# Fazer backup manual
pg_dump "postgresql://user:pass@host/db?sslmode=require" > backup_$(date +%Y%m%d).sql

# Ou usar Neon MCP (via Claude)
# O Neon já faz backups automáticos
```

### **Backup de Configurações**

```bash
# Fazer backup de arquivos importantes
mkdir -p ~/backups
cp /opt/plutusgrip-api/.env ~/backups/env_$(date +%Y%m%d)
cp /etc/nginx/sites-available/plutusgrip ~/backups/nginx_$(date +%Y%m%d)
cp /etc/systemd/system/plutusgrip-api.service ~/backups/systemd_$(date +%Y%m%d)
```

### **Snapshot do Droplet**

Via painel do DigitalOcean:
1. Acesse: https://cloud.digitalocean.com/droplets
2. Selecione o Droplet
3. Vá em "Snapshots"
4. Clique em "Take Snapshot"

**Recomendação:** Criar snapshot antes de mudanças grandes!

---

## 📞 Contatos e Recursos

- **GitHub:** https://github.com/LeP-Projects/plutsgrip-app
- **DigitalOcean:** https://cloud.digitalocean.com
- **Neon Console:** https://console.neon.tech

---

## ✅ Checklist de Deploy

Antes de fazer um deploy, verifique:

- [ ] Código testado localmente
- [ ] Migrations testadas
- [ ] `.env` atualizado (se necessário)
- [ ] Backup do banco feito
- [ ] Snapshot do Droplet criado (mudanças grandes)
- [ ] PR revisado e aprovado
- [ ] Testes passando
- [ ] Build do frontend funciona
- [ ] Documentação atualizada

---

**Última Atualização:** 2026-01-07
**Versão do Deploy:** 1.0.0
**Mantido por:** Paulo Junior (paulodjunior.dev@gmail.com)
