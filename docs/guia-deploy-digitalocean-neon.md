# Guia de Deploy: DigitalOcean + Neon

Este guia descreve o passo a passo para colocar o **PlutusGrip** em produção utilizando um Droplet da **DigitalOcean** para a aplicação e o **Neon** como banco de dados.

---

## 📋 1. Preparação (Local)

Antes de acessar o servidor, tenha em mãos as seguintes informações:

1.  **IP do Droplet** (ex: `192.168.1.100`).
2.  **String de Conexão do Neon** (ex: `postgres://usuario:senha@ep-xyz.aws.neon.tech/neondb?sslmode=require`).
    *   *Dica: Pegue a string "Pooled connection" no dashboard do Neon.*
3.  **Domínio** (opcional, mas recomendado) ou use o IP direto para testar.

---

## 🚀 2. Configurando o Servidor (DigitalOcean)

Acesse seu droplet via SSH:

```bash
ssh root@SEU_IP_DO_DROPLET
```

### 2.1. Instalar Docker e Git

Execute os comandos abaixo para instalar o Docker e Docker Compose:

```bash
# Atualizar lista de pacotes
apt-get update

# Instalar dependências essenciais e Git
apt-get install -y ca-certificates curl gnupg git

# Baixar chave GPG oficial do Docker
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
chmod a+r /etc/apt/keyrings/docker.gpg

# Adicionar repositório do Docker
echo \
  "deb [arch="$(dpkg --print-architecture)" signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  "$(. /etc/os-release && echo "$VERSION_CODENAME")" stable" | \
  tee /etc/apt/sources.list.d/docker.list > /dev/null

# Instalar Docker Engine
apt-get update
apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Verificar instalação
docker compose version
```

---

## 📦 3. Instalação da Aplicação

### 3.1. Clonar o Repositório

```bash
cd /opt
git clone https://github.com/LeP-Projects/plutsgrip-app.git
cd plutsgrip-app
```

### 3.2. Configurar Variáveis de Produção

Crie o arquivo de configuração de produção base:

```bash
cp .env.prod .env.prod.local
nano .env.prod.local
```

**Edite as seguintes linhas no arquivo:**

1.  **DATABASE_URL**: Cole sua string de conexão do Neon.
    *   *Importante:* Se sua string do Neon for `postgres://`, mude para `postgresql://`.
    *   Exemplo: `DATABASE_URL=postgresql://neondb_owner:k3....@ep-cool-frog.aws.neon.tech/neondb?sslmode=require`
2.  **SECRET_KEY**: Crie uma senha aleatória forte.
3.  **VITE_API_URL**:
    *   Se usar domínio: `https://seudominio.com/api`
    *   Se usar apenas IP: `http://SEU_IP_DO_DROPLET/api` (Nota: sem HTTPS o navegador pode reclamar, mas funciona para teste).
4.  **ALLOWED_ORIGINS**:
    *   `http://SEU_IP_DO_DROPLET,http://localhost`

Salve o arquivo (`Ctrl+O`, `Enter`) e saia (`Ctrl+X`).

---

## ▶️ 4. Iniciar a Aplicação

Agora vamos construir e iniciar os containers em modo de produção:

```bash
# Construir as imagens (pode demorar alguns minutos)
docker compose --profile prod --env-file .env.prod.local build

# Iniciar os serviços em background
docker compose --profile prod --env-file .env.prod.local up -d
```

Verifique se tudo subiu corretamente:

```bash
docker compose --profile prod --env-file .env.prod.local ps
```
*Todos os status devem estar `Up` ou `healthy`.*

---

## 🗄️ 5. Configurar Banco de Dados (Migrações)

Como o banco no Neon é novo, ele está vazio. Precisamos criar as tabelas.

```bash
# Executar as migrações do Alembic dentro do container da API
docker compose --profile prod --env-file .env.prod.local exec api alembic upgrade head

# (Opcional) Semear categorias padrão
# Verifique se o script seed_categories.py existe e é acessível
docker compose --profile prod --env-file .env.prod.local exec api python scripts/seed_categories.py
```

---

## ✅ 6. Teste Final

1.  Abra seu navegador.
2.  Acesse `http://SEU_IP_DO_DROPLET`.
3.  O frontend deve carregar.
4.  Tente criar uma conta ou fazer login.

---

## 🛡️ 7. Dicas de Segurança (Pós-Deploy)

*   **Configurar HTTPS**: O Nginx incluso no projeto espera certificados em `./nginx/certs`. Para produção real, recomenda-se configurar o Certbot/Let's Encrypt.
*   **Firewall**: No painel da DigitalOcean, configure um Firewall para permitir apenas portas 22 (SSH), 80 (HTTP) e 443 (HTTPS).
