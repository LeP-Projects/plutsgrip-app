# Hub de Documentação do PlutusGrip

<div align="center">

![PlutusGrip Logo](../plutsgrip-frond-refac/public/plutus.png)

**Documentação Completa para o PlutusGrip Finance Tracker**

Sistema Moderno de Gestão Financeira Pessoal

[![Demo ao Vivo](https://img.shields.io/badge/Live-Demo-success)](http://68.183.98.186)
[![Backend](https://img.shields.io/badge/FastAPI-0.120-green)](https://fastapi.tiangolo.com/)
[![Frontend](https://img.shields.io/badge/React-19.1.1-blue)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-blue)](https://www.typescriptlang.org/)

[Aplicação ao Vivo](http://68.183.98.186) • [Repositório GitHub](https://github.com/LeP-Projects/plutsgrip-app) • [API Docs](http://68.183.98.186/api/docs)

</div>

---

## Bem-vindo à Documentação do PlutusGrip

Este hub de documentação fornece informações abrangentes sobre o projeto PlutusGrip Finance Tracker, incluindo guias de configuração, detalhes de arquitetura, referências de API e instruções de deploy.

### O que é o PlutusGrip?

O PlutusGrip é um sistema moderno e completo de gestão financeira pessoal que ajuda os usuários a:

- Rastrear receitas e despesas com categorização detalhada
- Definir e monitorar orçamentos em diferentes períodos de tempo
- Criar e acompanhar metas financeiras
- Gerenciar transações recorrentes
- Gerar relatórios e analytics perspicazes
- Visualizar padrões de gastos com gráficos interativos

### Stack Tecnológica

**Backend:**
- FastAPI (Python 3.11)
- PostgreSQL (Neon)
- SQLAlchemy 2.0 (Async)
- Autenticação JWT
- Migrações Alembic

**Frontend:**
- React 19.1.1
- TypeScript 5.9.3
- Vite 7.1.7
- TailwindCSS 4
- Componentes Radix UI
- Visualização Recharts

**Infraestrutura:**
- DigitalOcean Droplet (Ubuntu 22.04)
- Nginx (Proxy Reverso)
- Serviços Systemd
- Neon PostgreSQL (Produção)

---

## Navegação Rápida

### Começando

<table>
<tr>
<td width="50%">

#### Para Desenvolvedores

1. **[Guia de Início Rápido](#início-rápido)**
   - Clonar repositório
   - Configurar ambiente
   - Executar localmente

2. **[Configuração do Backend](./BACKEND.md#instruções-de-configuração)**
   - Instalar dependências Python
   - Configurar banco de dados
   - Executar migrações

3. **[Configuração do Frontend](./FRONTEND.md#instruções-de-configuração)**
   - Instalar dependências Node
   - Configurar ambiente
   - Iniciar servidor dev

4. **[Configuração Docker](./06-DOCKER-SETUP.md)**
   - Docker Compose
   - Containers de desenvolvimento
   - Comandos rápidos

</td>
<td width="50%">

#### Para Usuários

1. **[Guia do Usuário](./FAQ.md)**
   - Criação de conta
   - Uso de funcionalidades
   - Perguntas comuns

2. **[Documentação da API](./03-API-ENDPOINTS.md)**
   - Referência de endpoints
   - Exemplos de requisição/resposta
   - Autenticação

3. **[Troubleshooting](./09-TROUBLESHOOTING.md)**
   - Problemas comuns
   - Soluções de erros
   - Guias de debug

4. **[Glossário](./GLOSSARY.md)**
   - Termos técnicos
   - Definições
   - Conceitos

</td>
</tr>
</table>

---

## Estrutura da Documentação

### Documentação Principal

#### [BACKEND.md](./BACKEND.md)
**Documentação Completa do Backend**

Guia abrangente cobrindo o backend FastAPI:

- Visão geral da arquitetura e padrões de design
- Instruções de configuração local e Docker
- Referência completa de endpoints da API (35+ endpoints)
- Schema e relacionamentos do banco de dados
- Sistema de autenticação (JWT + refresh tokens)
- Rate limiting e segurança
- Guia de testes com pytest
- Deploy na DigitalOcean
- Troubleshooting e debugging
- Melhores práticas de fluxo de trabalho de desenvolvimento

**Tópicos Cobertos:**
- Estrutura da aplicação FastAPI
- Modelos SQLAlchemy assíncronos
- Schemas e validação Pydantic
- Padrões de Repository e Service
- Migrações do banco de dados Alembic
- Fluxo de autenticação JWT
- Rate limiting com whitelist de IP
- Testes unitários e de integração
- Deploy em produção
- Monitoramento e logging

---

#### [FRONTEND.md](./FRONTEND.md)
**Documentação Completa do Frontend**

Guia abrangente cobrindo o frontend React:

- Arquitetura e hierarquia de componentes
- Instruções de configuração local e Docker
- Estrutura e organização de componentes
- Gestão de estado (Context API)
- Configuração do React Router
- Integração com API usando axios
- Guia de testes (Vitest + Playwright)
- Processo de build e deploy
- Sistema de estilização TailwindCSS
- Fluxo de trabalho de desenvolvimento

**Tópicos Cobertos:**
- React 19 com TypeScript
- Biblioteca de componentes (Radix UI)
- Custom hooks e contexts
- Manipulação de formulários com React Hook Form
- Visualização de dados com Recharts
- Implementação de modo escuro
- Padrões de design responsivo
- Testes unitários com Vitest
- Testes E2E com Playwright
- Otimização de build de produção

---

### Documentação Adicional

#### Configuração e Instalação

| Documento | Descrição |
|----------|-------------|
| **[README.md](../README.md)** | Visão geral do projeto, funcionalidades, início rápido |
| **[SETUP.md](../SETUP.md)** | Configuração detalhada para todos os ambientes |
| **[DOCKER_README.md](../DOCKER_README.md)** | Guia de ambiente de desenvolvimento Docker |
| **[06-DOCKER-SETUP.md](./06-DOCKER-SETUP.md)** | Detalhes de configuração Docker |

#### Arquitetura e Design

| Documento | Descrição |
|----------|-------------|
| **[01-OVERVIEW.md](./01-OVERVIEW.md)** | Visão geral e funcionalidades do projeto |
| **[02-ARCHITECTURE.md](./02-ARCHITECTURE.md)** | Arquitetura e design do sistema |
| **[04-DATABASE.md](./04-DATABASE.md)** | Schema e design do banco de dados |
| **[05-AUTHENTICATION.md](./05-AUTHENTICATION.md)** | Autenticação e segurança |

#### Desenvolvimento

| Documento | Descrição |
|----------|-------------|
| **[07-DEVELOPMENT.md](./07-DEVELOPMENT.md)** | Diretrizes de desenvolvimento |
| **[08-TESTING.md](./08-TESTING.md)** | Estratégias e cobertura de testes |
| **[CONTRIBUTING.md](../CONTRIBUTING.md)** | Como contribuir |

#### Deploy e Operações

| Documento | Descrição |
|----------|-------------|
| **[DEPLOY_GUIDE.md](../DEPLOY_GUIDE.md)** | Guia completo de deploy para DigitalOcean |
| **[10-DEPLOYMENT.md](./10-DEPLOYMENT.md)** | Estratégias de deploy |

#### Referência

| Documento | Descrição |
|----------|-------------|
| **[03-API-ENDPOINTS.md](./03-API-ENDPOINTS.md)** | Referência completa da API |
| **[09-TROUBLESHOOTING.md](./09-TROUBLESHOOTING.md)** | Problemas comuns e soluções |
| **[FAQ.md](./FAQ.md)** | Perguntas frequentes |
| **[GLOSSARY.md](./GLOSSARY.md)** | Glossário técnico |

---

## Início Rápido

### Pré-requisitos

Escolha uma das seguintes configurações:

#### Opção A: Docker (Recomendado)
- Docker Desktop ou Docker Engine
- Docker Compose 3.9+
- Git

#### Opção B: Desenvolvimento Local
- Python 3.11+
- Node.js 20+
- PostgreSQL 15+ (ou conta Neon)
- Git

### Usando Docker (Mais Rápido)

```bash
# Clonar repositório
git clone https://github.com/LeP-Projects/plutsgrip-app.git
cd plutsgrip-app

# Iniciar todos os serviços
docker-compose -f docker-compose.dev.yml up

# Ou usar atalhos do Makefile
make up

# Acessar a aplicação
# Frontend: http://localhost:5173
# Backend: http://localhost:8000
# API Docs: http://localhost:8000/docs
```

### Desenvolvimento Local

**Configuração do Backend:**

```bash
cd plutsgrip-api

# Criar ambiente virtual
python -m venv venv
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate     # Windows

# Instalar dependências
pip install -r requirements.txt

# Configurar ambiente
cp .env.example .env
# Edite .env com suas configurações

# Executar migrações
alembic upgrade head

# Iniciar servidor
python main.py
```

**Configuração do Frontend:**

```bash
cd plutsgrip-frond-refac

# Instalar dependências
npm install

# Configurar ambiente
cp .env.example .env.development
# Edite .env.development

# Iniciar servidor dev
npm run dev
```

---

## Informações do Projeto

### Deploy ao Vivo

**Aplicação em Produção:**
- **URL:** http://68.183.98.186
- **API:** http://68.183.98.186/api
- **API Docs:** http://68.183.98.186/api/docs
- **Health Check:** http://68.183.98.186/api/health

**Infraestrutura:**
- **Servidor:** DigitalOcean Droplet (2GB RAM, 1 vCPU)
- **OS:** Ubuntu 22.04 LTS
- **Banco de Dados:** Neon PostgreSQL (sa-east-1)
- **Web Server:** Nginx
- **Gerenciador de Serviços:** Systemd

### Repositório

**GitHub:** https://github.com/LeP-Projects/plutsgrip-app

**Estrutura:**
```
plutsgrip-app/
├── docs/                    # Documentação (você está aqui!)
├── plutsgrip-api/           # Backend (FastAPI)
├── plutsgrip-frond-refac/   # Frontend (React)
├── nginx/                   # Configuração Nginx
├── docker-compose.dev.yml   # Docker desenvolvimento
├── docker-compose.prod.yml  # Docker produção
├── Makefile                 # Atalhos de desenvolvimento
├── README.md               # README principal
└── DEPLOY_GUIDE.md         # Guia de deploy
```

---

## Visão Geral de Funcionalidades

### Funcionalidades Principais

#### Gestão de Transações
- Criar, ler, atualizar, deletar transações
- Suporte para receitas e despesas
- Múltiplas categorias (padrão + personalizadas)
- Organização por data
- Suporte a tags e notas
- Operações em lote

#### Rastreamento de Orçamento
- Definir orçamentos por categoria
- Múltiplos períodos de tempo (mensal, trimestral, anual)
- Rastreamento de progresso e alertas
- Comparações orçamento vs. real
- Indicadores visuais de progresso

#### Metas Financeiras
- Criar metas de economia
- Rastrear progresso em direção aos alvos
- Gerenciamento de prazos
- Indicadores visuais de progresso
- Notificações de conclusão de metas

#### Transações Recorrentes
- Receitas/despesas recorrentes automatizadas
- Frequência flexível (diária, semanal, mensal, anual)
- Status ativo/inativo
- Rastreamento da próxima ocorrência
- Gerenciamento em lote

#### Relatórios e Analytics
- Painel de visão geral financeira
- Gráficos de divisão por categoria
- Análise de tendências mensais
- Comparação receitas vs. despesas
- Relatórios com intervalo de datas personalizado
- Funcionalidade de exportação

### Funcionalidades Técnicas

#### Backend (API)
- API RESTful com FastAPI
- Operações assíncronas para performance
- Autenticação JWT com refresh tokens
- Rate limiting com whitelist de IP
- Validação de entrada com Pydantic
- Migrações de banco de dados com Alembic
- Tratamento abrangente de erros
- Documentação da API (Swagger/ReDoc)
- Endpoints de health check
- Logging estruturado

#### Frontend (Aplicação Web)
- React 19 moderno com TypeScript
- Design responsivo (mobile-first)
- Suporte a modo escuro
- Gráficos interativos (Recharts)
- Validação de formulários (React Hook Form + Zod)
- Componentes acessíveis (Radix UI)
- Atualizações otimistas de UI
- Estados de carregamento e skeletons
- Limites de erro
- Notificações toast

#### Segurança
- Hashing de senhas (bcrypt)
- Autenticação com token JWT
- Blacklist de tokens no logout
- Suporte HTTPS (via Nginx)
- Configuração CORS
- Prevenção de injeção SQL
- Proteção XSS
- Rate limiting
- Sanitização de entrada

---

## Recursos de Desenvolvimento

### Comandos Úteis

#### Comandos Docker

```bash
# Iniciar todos os serviços
make up
docker-compose -f docker-compose.dev.yml up

# Parar todos os serviços
make down
docker-compose -f docker-compose.dev.yml down

# Ver logs
make logs
make logs-api

# Reconstruir containers
docker-compose -f docker-compose.dev.yml up --build

# Acessar shell do backend
make shell
docker-compose -f docker-compose.dev.yml exec api bash
```

#### Comandos do Backend

```bash
# Executar servidor
python main.py
uvicorn main:app --reload

# Executar testes
pytest
pytest --cov
pytest -v

# Migrações do banco de dados
alembic revision --autogenerate -m "descrição"
alembic upgrade head
alembic downgrade -1

# Linting e formatação
black app/
flake8 app/
mypy app/
```

#### Comandos do Frontend

```bash
# Servidor de desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview do build de produção
npm run preview

# Testes
npm test
npm run test:coverage
npx playwright test

# Linting
npm run lint
```

### Resumo dos Endpoints da API

O PlutusGrip fornece 35+ endpoints da API organizados em categorias:

| Categoria | Endpoints | Descrição |
|----------|-----------|-------------|
| **Authentication** | 5 | Registrar, login, logout, refresh, obter usuário |
| **Transactions** | 5 | Operações CRUD para transações |
| **Categories** | 5 | Gerenciamento de categorias (padrão + personalizadas) |
| **Budgets** | 5 | Criação e rastreamento de orçamentos |
| **Goals** | 5 | Gerenciamento de metas financeiras |
| **Recurring Transactions** | 5 | Transações recorrentes automatizadas |
| **Reports** | 6 | Analytics e relatórios financeiros |
| **Whitelist** | 3 | Whitelist de IP para rate limit |
| **System** | 2 | Health check, endpoint raiz |

**Referência Completa da API:** [03-API-ENDPOINTS.md](./03-API-ENDPOINTS.md)

---

## Testes

### Estratégia de Testes

O PlutusGrip emprega testes abrangentes em múltiplos níveis:

#### Testes do Backend (Python)
- **Framework:** pytest
- **Cobertura:** >90%
- **Tipos de Testes:**
  - Testes unitários para services e repositories
  - Testes de integração para endpoints da API
  - Testes de banco de dados com fixtures de teste
  - Testes de autenticação

```bash
# Executar testes do backend
cd plutsgrip-api
pytest
pytest --cov --cov-report=html
```

#### Testes do Frontend (TypeScript)
- **Testes Unitários:** Vitest + React Testing Library
- **Testes E2E:** Playwright
- **Cobertura:** 100+ testes
- **Tipos de Testes:**
  - Testes unitários de componentes
  - Testes de hooks
  - Testes de contextos
  - Testes de integração
  - Fluxos de usuário E2E

```bash
# Executar testes do frontend
cd plutsgrip-frond-refac

# Testes unitários
npm test
npm run test:coverage

# Testes E2E
npx playwright test
npx playwright test --ui
```

**Guia Completo de Testes:**
- Backend: [BACKEND.md - Testes](./BACKEND.md#guia-de-testes)
- Frontend: [FRONTEND.md - Testes](./FRONTEND.md#guia-de-testes)
- Geral: [08-TESTING.md](./08-TESTING.md)

---

## Deploy

### Ambiente de Produção

A aplicação está implantada na DigitalOcean com a seguinte configuração:

**Detalhes do Servidor:**
- **Provedor:** DigitalOcean
- **Endereço IP:** 68.183.98.186
- **OS:** Ubuntu 22.04 LTS
- **RAM:** 2GB
- **CPU:** 1 vCPU
- **Armazenamento:** 50GB SSD

**Banco de Dados:**
- **Provedor:** Neon PostgreSQL
- **Projeto:** rough-pond-76369130
- **Branch:** br-orange-star-acm7oh7g
- **Região:** sa-east-1 (São Paulo, Brasil)
- **Plano:** Free Tier (0.5GB)

**Serviços:**
- **Web Server:** Nginx (proxy reverso + arquivos estáticos)
- **Backend:** Serviço Systemd (Uvicorn)
- **Frontend:** Arquivos estáticos servidos pelo Nginx

### Processo de Deploy

**Deploy Rápido:**

```bash
# SSH no servidor
ssh root@68.183.98.186

# Atualizar backend
cd /opt/plutusgrip-api
git pull origin main
source venv/bin/activate
pip install -r requirements.txt
alembic upgrade head
systemctl restart plutusgrip-api

# Atualizar frontend
cd /opt/plutusgrip-frontend
git pull origin main
npm install
npm run build

# Verificar
systemctl status plutusgrip-api nginx
curl http://localhost:8000/health
```

**Guia Completo de Deploy:** [DEPLOY_GUIDE.md](../DEPLOY_GUIDE.md)

---

## Troubleshooting

### Problemas Comuns

#### Problemas do Backend

**502 Bad Gateway:**
- Serviço do backend não está rodando
- Verificar: `systemctl status plutusgrip-api`
- Solução: `systemctl restart plutusgrip-api`

**Erros de Conexão com Banco de Dados:**
- Verificar DATABASE_URL no .env
- Verificar se banco Neon está acessível
- Garantir conexão SSL: `?sslmode=require`

**Erros de Import:**
- Ambiente virtual não ativado
- Executar: `source venv/bin/activate`
- Reinstalar: `pip install -r requirements.txt`

#### Problemas do Frontend

**Erros de Build:**
- Verificar versão do Node.js (20+)
- Limpar cache: `rm -rf node_modules && npm install`
- Verificar erros TypeScript: `npx tsc --noEmit`

**Erros de Conexão com API:**
- Verificar VITE_API_URL no .env
- Verificar se backend está rodando
- Configuração CORS no backend

**Guia Completo de Troubleshooting:** [09-TROUBLESHOOTING.md](./09-TROUBLESHOOTING.md)

---

## Contribuindo

Contribuições são bem-vindas! Por favor, veja **[CONTRIBUTING.md](../CONTRIBUTING.md)** para orientações.

### Passos Rápidos para Contribuição

1. Faça fork do repositório
2. Crie uma branch de feature: `git checkout -b feature/amazing-feature`
3. Faça suas alterações
4. Adicione testes para suas alterações
5. Execute todos os testes: `make test`
6. Commit suas alterações: `git commit -m 'feat: add amazing feature'`
7. Push para a branch: `git push origin feature/amazing-feature`
8. Abra um Pull Request

### Fluxo de Trabalho de Desenvolvimento

1. Confira a documentação para arquitetura e padrões
2. Siga as diretrizes de estilo de código:
   - Backend: PEP 8 (Python)
   - Frontend: Configuração ESLint
3. Escreva testes para novas funcionalidades
4. Atualize a documentação conforme necessário
5. Garanta que todos os testes passem antes de submeter PR

---

## Estatísticas do Projeto

- **Linhas de Código:** ~15.000+
- **Testes Backend:** 30+ (pytest)
- **Testes Frontend:** 100+ (vitest + playwright)
- **Endpoints da API:** 35+
- **Cobertura de Testes:** >90%
- **Cobertura TypeScript:** 100%
- **Páginas de Documentação:** 15+

---

## Materiais de Referência

### Documentação Oficial

- **FastAPI:** https://fastapi.tiangolo.com/
- **React:** https://react.dev/
- **TypeScript:** https://www.typescriptlang.org/docs/
- **Vite:** https://vitejs.dev/guide/
- **TailwindCSS:** https://tailwindcss.com/docs
- **SQLAlchemy:** https://docs.sqlalchemy.org/
- **Pydantic:** https://docs.pydantic.dev/
- **Radix UI:** https://www.radix-ui.com/docs/primitives
- **Recharts:** https://recharts.org/en-US/
- **Playwright:** https://playwright.dev/
- **Vitest:** https://vitest.dev/

### Tecnologias Relacionadas

- **PostgreSQL:** https://www.postgresql.org/docs/
- **Neon:** https://neon.tech/docs/
- **Docker:** https://docs.docker.com/
- **Nginx:** https://nginx.org/en/docs/
- **DigitalOcean:** https://docs.digitalocean.com/
- **Alembic:** https://alembic.sqlalchemy.org/
- **JWT:** https://jwt.io/

---

## Mapa de Documentação

### Por Tópico

#### Configuração e Instalação
- [README.md](../README.md) - Visão geral do projeto e início rápido
- [SETUP.md](../SETUP.md) - Guia detalhado de configuração
- [BACKEND.md](./BACKEND.md) - Configuração e setup do backend
- [FRONTEND.md](./FRONTEND.md) - Configuração e setup do frontend
- [DOCKER_README.md](../DOCKER_README.md) - Configuração Docker

#### Arquitetura e Design
- [01-OVERVIEW.md](./01-OVERVIEW.md) - Visão geral do projeto
- [02-ARCHITECTURE.md](./02-ARCHITECTURE.md) - Arquitetura do sistema
- [04-DATABASE.md](./04-DATABASE.md) - Design do banco de dados
- [05-AUTHENTICATION.md](./05-AUTHENTICATION.md) - Sistema de auth

#### Desenvolvimento
- [07-DEVELOPMENT.md](./07-DEVELOPMENT.md) - Guia de desenvolvimento
- [08-TESTING.md](./08-TESTING.md) - Estratégias de testes
- [CONTRIBUTING.md](../CONTRIBUTING.md) - Guia de contribuição

#### Deploy
- [DEPLOY_GUIDE.md](../DEPLOY_GUIDE.md) - Guia completo de deploy
- [10-DEPLOYMENT.md](./10-DEPLOYMENT.md) - Estratégias de deploy

#### Referência
- [03-API-ENDPOINTS.md](./03-API-ENDPOINTS.md) - Referência da API
- [09-TROUBLESHOOTING.md](./09-TROUBLESHOOTING.md) - Troubleshooting
- [FAQ.md](./FAQ.md) - Perguntas frequentes
- [GLOSSARY.md](./GLOSSARY.md) - Glossário técnico

### Por Função

#### Para Novos Desenvolvedores
1. Comece com [README.md](../README.md)
2. Leia [SETUP.md](../SETUP.md)
3. Revise [BACKEND.md](./BACKEND.md) e [FRONTEND.md](./FRONTEND.md)
4. Confira [07-DEVELOPMENT.md](./07-DEVELOPMENT.md)
5. Leia [CONTRIBUTING.md](../CONTRIBUTING.md)

#### Para Desenvolvedores Backend
1. [BACKEND.md](./BACKEND.md) - Guia completo do backend
2. [02-ARCHITECTURE.md](./02-ARCHITECTURE.md) - Visão geral da arquitetura
3. [04-DATABASE.md](./04-DATABASE.md) - Schema do banco de dados
4. [03-API-ENDPOINTS.md](./03-API-ENDPOINTS.md) - Referência da API
5. [05-AUTHENTICATION.md](./05-AUTHENTICATION.md) - Sistema de auth

#### Para Desenvolvedores Frontend
1. [FRONTEND.md](./FRONTEND.md) - Guia completo do frontend
2. [02-ARCHITECTURE.md](./02-ARCHITECTURE.md) - Visão geral da arquitetura
3. [03-API-ENDPOINTS.md](./03-API-ENDPOINTS.md) - Integração com API
4. [08-TESTING.md](./08-TESTING.md) - Testes do frontend

#### Para DevOps
1. [DEPLOY_GUIDE.md](../DEPLOY_GUIDE.md) - Guia de deploy
2. [10-DEPLOYMENT.md](./10-DEPLOYMENT.md) - Estratégias de deploy
3. [DOCKER_README.md](../DOCKER_README.md) - Configuração Docker
4. [09-TROUBLESHOOTING.md](./09-TROUBLESHOOTING.md) - Problemas comuns

---

## Suporte e Contato

### Obtendo Ajuda

- **GitHub Issues:** [Criar uma issue](https://github.com/LeP-Projects/plutsgrip-app/issues)
- **GitHub Discussions:** [Participar das discussões](https://github.com/LeP-Projects/plutsgrip-app/discussions)
- **Email:** paulodjunior.dev@gmail.com

### Reportando Bugs

Ao reportar bugs, por favor inclua:

1. Descrição do problema
2. Passos para reproduzir
3. Comportamento esperado
4. Comportamento atual
5. Detalhes do ambiente (OS, navegador, versões)
6. Logs ou screenshots relevantes
7. Solução possível (se você tiver uma)

### Requisições de Funcionalidades

Aceitamos requisições de funcionalidades! Por favor:

1. Verifique as issues existentes primeiro
2. Descreva a funcionalidade claramente
3. Explique o caso de uso
4. Forneça exemplos se possível

---

## Atualizações e Changelog

### Últimas Atualizações

**Versão 1.0.0** (2026-01-07)
- Release inicial de produção
- 35+ endpoints da API
- Operações CRUD completas para todas as funcionalidades
- Frontend React responsivo
- Suporte a modo escuro
- Gráficos e relatórios interativos
- Documentação abrangente
- Deploy na DigitalOcean

### Atualizações da Documentação

**2026-01-07:**
- Criado BACKEND.md abrangente
- Criado FRONTEND.md abrangente
- Criado INDEX.md centralizado
- Atualizadas todas as referências cruzadas

---

## Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE](../LICENSE) para detalhes.

---

## Agradecimentos

### Tecnologias Utilizadas
- Construído com [FastAPI](https://fastapi.tiangolo.com/) e [React](https://react.dev/)
- Componentes de UI do [Radix UI](https://www.radix-ui.com/)
- Estilizado com [TailwindCSS](https://tailwindcss.com/)
- Gráficos por [Recharts](https://recharts.org/)
- Hospedado na [DigitalOcean](https://www.digitalocean.com/)
- Banco de dados pelo [Neon](https://neon.tech/)

### Contribuidores
- **Paulo Junior** - Desenvolvedor Principal
  - GitHub: [@Paulo-Junior](https://github.com/LeP-Projects)
  - Email: paulodjunior.dev@gmail.com

---

<div align="center">

## Links Rápidos

**[Docs Backend](./BACKEND.md)** | **[Docs Frontend](./FRONTEND.md)** | **[Guia de Deploy](../DEPLOY_GUIDE.md)** | **[Referência API](./03-API-ENDPOINTS.md)**

**[Aplicação ao Vivo](http://68.183.98.186)** | **[Repositório GitHub](https://github.com/LeP-Projects/plutsgrip-app)** | **[Reportar Issue](https://github.com/LeP-Projects/plutsgrip-app/issues)**

---

**Última Atualização:** 2026-01-07

**Versão:** 1.0.0

---

[Voltar ao Topo](#hub-de-documentação-do-plutsgrip)

</div>
