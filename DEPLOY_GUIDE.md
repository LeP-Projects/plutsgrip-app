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

## 🎉 Novidades v2.0.0 - Repositório Unificado

**O que mudou:**

Anteriormente, backend e frontend eram gerenciados em diretórios separados (`/opt/plutusgrip-api` e `/opt/plutusgrip-frontend`), como se fossem repositórios diferentes. Isso complicava atualizações e manutenção.

**Agora (v2.0.0):**
- ✅ **Repositório único:** `/opt/plutsgrip-app` contém tudo
- ✅ **Um único `git pull`:** Atualiza backend, frontend e documentação de uma vez
- ✅ **Documentação em PT-BR:** Toda documentação traduzida para português brasileiro
- ✅ **Mais simples:** Comandos de atualização muito mais diretos
- ✅ **Melhor organização:** Estrutura idêntica ao repositório GitHub

**Impacto nos comandos:**
- Antes: `cd /opt/plutusgrip-api && git pull` + `cd /opt/plutusgrip-frontend && git pull`
- Agora: `cd /opt/plutsgrip-app && git pull` ✨

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
   ├─→ / (Frontend estático) → /opt/plutsgrip-app/plutsgrip-frond-refac/dist/
   └─→ /api/* (Backend API)   → localhost:8000
       ↓
   [FastAPI + Uvicorn :8000]
   ↓ (/opt/plutsgrip-app/plutsgrip-api/)
   [Neon PostgreSQL via SSL]
```

**Estrutura Unificada:**
- Todo o projeto está em um único repositório: `/opt/plutsgrip-app`
- Backend: `/opt/plutsgrip-app/plutsgrip-api/`
- Frontend: `/opt/plutsgrip-app/plutsgrip-frond-refac/`
- Documentação: `/opt/plutsgrip-app/docs/`

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

> **✨ Novo! Repositório Unificado**
> Agora todo o projeto está em `/opt/plutsgrip-app`. Um único `git pull` atualiza backend, frontend e documentação!

### **Cenário 1: Atualização do Backend (Python/FastAPI)**

Quando houver mudanças no código do backend (`plutsgrip-api/`):

```bash
# 1. Conectar ao Droplet
ssh root@68.183.98.186
# Ou usar console web: https://cloud.digitalocean.com/droplets

# 2. Navegar para o repositório principal
cd /opt/plutsgrip-app

# 3. Fazer backup do .env (importante!)
cp plutsgrip-api/.env plutsgrip-api/.env.backup

# 4. Puxar as mudanças do GitHub
git pull origin main

# 5. Navegar para o backend
cd plutsgrip-api

# 6. Ativar ambiente virtual
source venv/bin/activate

# 7. Instalar novas dependências (se houver)
pip install -r requirements.txt

# 8. Rodar migrations (se houver)
alembic upgrade head

# 9. Sair do venv e reiniciar o serviço
deactivate
systemctl restart plutusgrip-api

# 10. Verificar se está rodando
systemctl status plutusgrip-api

# 11. Verificar logs em tempo real
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
cd /opt/plutsgrip-app/plutsgrip-frond-refac
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

# 2. Navegar para o repositório
cd /opt/plutsgrip-app

# 3. Puxar mudanças do GitHub
git pull origin main

# 4. Navegar para o frontend
cd plutsgrip-frond-refac

# 5. Verificar .env.production
cat .env.production
# Deve conter: VITE_API_URL=http://68.183.98.186/api

# 6. Instalar dependências
npm install

# 7. Build
npm run build

# 8. Verificar
ls -la dist/

# 9. Não precisa reiniciar Nginx (arquivos estáticos)
```

---

### **Cenário 3: Atualização Completa (Backend + Frontend)**

```bash
# 1. Conectar ao Droplet
ssh root@68.183.98.186

# 2. Navegar para o repositório e puxar mudanças
cd /opt/plutsgrip-app
git pull origin main

# 3. Atualizar backend
cd plutsgrip-api
source venv/bin/activate
pip install -r requirements.txt
alembic upgrade head
deactivate
systemctl restart plutusgrip-api

# 4. Atualizar frontend
cd ../plutsgrip-frond-refac
npm install
npm run build

# 5. Verificar tudo
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

# 2. Navegar para o repositório e puxar mudanças
cd /opt/plutsgrip-app
git pull origin main

# 3. Navegar para o backend e ativar venv
cd plutsgrip-api
source venv/bin/activate

# 4. Ver migrations pendentes
alembic current
alembic history

# 5. Aplicar migrations
alembic upgrade head

# 6. Verificar se aplicou
alembic current

# 7. Reiniciar backend
deactivate
systemctl restart plutusgrip-api
```

---

### **Cenário 5: Rollback (Reverter Deploy)**

Se algo der errado após deploy:

```bash
# 1. Conectar ao Droplet
ssh root@68.183.98.186

# 2. Navegar para o repositório
cd /opt/plutsgrip-app

# 3. Ver commits recentes
git log --oneline -10

# 4. Voltar para commit anterior
git reset --hard <COMMIT_HASH_ANTERIOR>

# 5. Rollback do Backend (se necessário)
cd plutsgrip-api
source venv/bin/activate

# Reverter migrations (se necessário)
alembic downgrade -1  # Volta 1 migration
# ou
alembic downgrade <revision_id>

deactivate
systemctl restart plutusgrip-api

# 6. Rollback do Frontend (se necessário)
cd ../plutsgrip-frond-refac

# Opção A: Restaurar backup do dist
rm -rf dist
mv dist.backup dist

# Opção B: Rebuild do commit revertido
npm install
npm run build

# 7. Verificar
systemctl status plutusgrip-api
curl http://68.183.98.186/api/health
curl http://68.183.98.186/
```

---

## 📁 Estrutura de Diretórios

```
/opt/plutsgrip-app/               # 🆕 Repositório Unificado
├── .git/                         # Controle de versão Git
├── docs/                         # Documentação do projeto (PT-BR)
│   ├── INDEX.md
│   ├── BACKEND.md
│   └── FRONTEND.md
├── plutsgrip-api/                # Backend FastAPI
│   ├── venv/                     # Ambiente virtual Python
│   ├── alembic/                  # Migrations do banco
│   ├── app/                      # Código da aplicação
│   ├── main.py                   # Entry point
│   ├── .env                      # Variáveis de ambiente (NÃO commitar!)
│   └── requirements.txt          # Dependências Python
├── plutsgrip-frond-refac/        # Frontend React
│   ├── dist/                     # Build de produção (servido pelo Nginx)
│   ├── src/                      # Código fonte
│   ├── node_modules/             # Dependências Node
│   ├── package.json              # Configuração NPM
│   └── .env.production           # Variáveis de ambiente do frontend
├── README.md                     # README principal (PT-BR)
└── DEPLOY_GUIDE.md               # Este guia

/etc/nginx/
├── sites-available/plutusgrip    # Configuração do site
└── sites-enabled/plutusgrip      # Link simbólico

/etc/systemd/system/
└── plutusgrip-api.service        # Serviço do backend

/var/log/plutusgrip/
├── api.log                       # Logs do backend
└── api-error.log                 # Erros do backend

/var/log/nginx/
├── plutusgrip-access.log         # Logs de acesso
└── plutusgrip-error.log          # Erros do Nginx
```

**Vantagens da Estrutura Unificada:**
- ✅ Um único `git pull` atualiza tudo
- ✅ Documentação sempre sincronizada
- ✅ Histórico de commits unificado
- ✅ Mais fácil de manter e navegar

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
cd /opt/plutsgrip-app/plutsgrip-api
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
cd /opt/plutsgrip-app/plutsgrip-api
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
ls -la /opt/plutsgrip-app/plutsgrip-frond-refac/dist/

# Verificar permissões
chown -R plutusgrip:plutusgrip /opt/plutsgrip-app/plutsgrip-frond-refac/dist/

# Ver logs do Nginx
tail -f /var/log/nginx/plutusgrip-error.log

# Testar Nginx
nginx -t

# Verificar path correto no nginx
cat /etc/nginx/sites-enabled/plutusgrip | grep "root /opt"
# Deve mostrar: root /opt/plutsgrip-app/plutsgrip-frond-refac/dist;
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
cat /opt/plutsgrip-app/plutsgrip-api/.env | grep DATABASE_URL

# Testar conexão direta
cd /opt/plutsgrip-app/plutsgrip-api
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
cp /opt/plutsgrip-app/plutsgrip-api/.env ~/backups/env_$(date +%Y%m%d)
cp /opt/plutsgrip-app/plutsgrip-frond-refac/.env.production ~/backups/env_frontend_$(date +%Y%m%d)
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
**Versão do Deploy:** 2.0.0 (Repositório Unificado)
**Mantido por:** Paulo Junior (paulodjunior.dev@gmail.com)

**Changelog v2.0.0:**
- ✅ Migração para repositório unificado em `/opt/plutsgrip-app`
- ✅ Simplificação dos comandos de atualização
- ✅ Documentação toda em português brasileiro
- ✅ Um único `git pull` para atualizar tudo
