# Guia de Deploy: DigitalOcean App Platform + Neon DB

Este guia detalha o processo de deploy da aplicação **PlutusGrip** utilizando a infraestrutura da DigitalOcean (App Platform ou Droplet) e banco de dados gerenciado Neon.

## Pré-requisitos

1.  **Conta na DigitalOcean**
2.  **Conta na Neon.tech** (para o banco de dados Postgres)
3.  **Docker e Docker Compose** instalados localmente
4.  **Projeto configurado** com repositório Git (GitHub/GitLab)

---

## 1. Configuração do Banco de Dados (Neon)

1.  Crie um novo projeto na **Neon Console**.
2.  Crie um banco de dados (ex: `plutusgrip_prod`).
3.  Obtenha a string de conexão (Connection String).
    *   **Formato:** `postgresql://user:password@endpoint.neon.tech/plutusgrip_prod?sslmode=require`
    *   *Nota: O parâmetro `sslmode=require` é essencial.*

## 2. Configuração das Variáveis de Ambiente

Crie ou atualize o arquivo `.env.prod` (ou configure as variáveis no painel da DigitalOcean App Platform) com os seguintes valores críticos:

### Backend (API)
```env
APP_ENV=production
DEBUG=False

# Database
# Use a string de conexão do Neon.
# Importante: A aplicação ajusta automaticamente para asyncpg, mas mantenha o formato padrão.
DATABASE_URL=postgresql://user:password@endpoint.neon.tech/plutusgrip_prod?sslmode=require

# Security
SECRET_KEY=sua-chave-secreta-gerada-aleatoriamente-32-chars
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
ALLOWED_ORIGINS=https://seu-dominio.com,https://api.seu-dominio.com

# Performance
DB_POOL_SIZE=20
DB_MAX_OVERFLOW=30
```

### Frontend
```env
# URL da API em produção (Endereço público)
VITE_API_URL=https://seu-dominio.com/api
```

---

## 3. Deploy via DigitalOcean App Platform (Recomendado)

A App Platform detecta automaticamente o `Dockerfile` e gerencia o build e deploy.

### Passos:
1.  **Create App**: Conecte seu repositório Git.
2.  **Resources**: A DigitalOcean detectará os serviços.
    *   **API**:
        *   Source Directory: `plutsgrip-api`
        *   Dockerfile Path: `Dockerfile`
        *   HTTP Port: `8000`
    *   **Frontend**:
        *   Source Directory: `plutsgrip-frond-refac`
        *   Dockerfile Path: `Dockerfile`
        *   HTTP Port: `3000` (ou `80` se usar Nginx interno)
3.  **Environment Variables**:
    *   Adicione todas as variáveis do `.env.prod` na seção de configuração da App Platform.
    *   Para o Frontend, certifique-se de que `VITE_API_URL` esteja definida no **Build Time** (pois o Vite "enners" as variáveis no bundle JS).
4.  **Review & Launch**.

## 4. Deploy via Droplet (Docker Compose)

Para controle total ou menor custo, use um Droplet com Docker instalado.

1.  **Acesso SSH** ao Droplet.
2.  **Clone o repositório**:
    ```bash
    git clone https://github.com/seu-usuario/plutusgrip-app.git
    cd plutusgrip-app
    ```
3.  **Configurar .env**:
    ```bash
    cp .env.example .env.prod.local
    nano .env.prod.local
    # Preencha com as credenciais reais do Neon e chaves de segurança
    ```
4.  **Build e Deploy**:
    ```bash
    # Build das imagens otimizadas
    docker compose --profile prod --env-file .env.prod.local build

    # Iniciar serviços em background
    docker compose --profile prod --env-file .env.prod.local up -d
    ```
5.  **Verificar Logs**:
    ```bash
    docker compose logs -f
    ```

## 5. Verificação Pós-Deploy

1.  **Health Check API**:
    *   Acesse `https://seu-dominio.com/api/health`
    *   Resposta esperada: `{"status": "ok", ...}`
2.  **Health Check Frontend**:
    *   Acesse `https://seu-dominio.com/`
    *   A aplicação deve carregar sem erros no console do navegador.
3.  **Login e Funcionalidade**:
    *   Tente fazer login (ou registrar um usuário).
    *   Crie uma transação de teste.

## Solução de Problemas Comuns

*   **Erro de Conexão com Banco (SSL/Asyncpg)**:
    *   Certifique-se de que a API está usando a correção implementada para substituir `sslmode` e remover `channel_binding` incompatíveis com `asyncpg`.
    *   Verifique os logs: `docker compose logs api`

*   **Erro de Permissão (Logs)**:
    *   Se ver avisos sobre `Permission denied: '/app/logs/app.log'`, isso é normal em produção se o volume não estiver configurado como RW. A aplicação fará fallback para logs no console (`stdout`), o que é aceitável.

*   **CORS Error no Frontend**:
    *   Verifique se `ALLOWED_ORIGINS` no `.env.prod` da API inclui exatamente o domínio do frontend (ex: `https://pluts-app.com`).
