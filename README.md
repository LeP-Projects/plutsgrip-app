# PlutusGrip - Gerenciador de Finanças Pessoais

<div align="center">

![PlutusGrip Logo](plutsgrip-frond-refac/public/plutus.png)

**Controle total das suas finanças pessoais de forma simples, segura e poderosa**

[![Python](https://img.shields.io/badge/Python-3.11+-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104+-green.svg)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-19.1-61DAFB.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6.svg)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Status](https://img.shields.io/badge/Status-Production-success.svg)](http://68.183.98.186)

[Demo ao Vivo](http://68.183.98.186) • [Documentação](#-documentação) • [API Docs](http://68.183.98.186/api/docs) • [Reportar Bug](https://github.com/LeP-Projects/plutsgrip-app/issues)

</div>

---

## 📋 Índice

- [Sobre](#-sobre)
- [Características](#-características)
- [Demo ao Vivo](#-demo-ao-vivo)
- [Começando](#-começando)
- [Documentação](#-documentação)
- [Tecnologias](#-tecnologias)
- [Arquitetura](#-arquitetura)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Desenvolvimento](#-desenvolvimento)
- [Testes](#-testes)
- [Deploy](#-deploy)
- [Contribuindo](#-contribuindo)
- [Licença](#-licença)

---

## 🎯 Sobre

**PlutusGrip** é uma aplicação moderna e completa para gerenciamento de finanças pessoais, oferecendo recursos poderosos para controle de despesas, planejamento de orçamentos, definição de metas financeiras e análise de gastos através de relatórios inteligentes.

Construído com tecnologias modernas e implantado na **DigitalOcean** com **Neon PostgreSQL**, o PlutusGrip combina o poder das capacidades assíncronas do FastAPI com a UI responsiva do React para entregar uma experiência perfeita de rastreamento financeiro.

### Por que PlutusGrip?

- **🔒 Seguro**: Autenticação JWT, criptografia bcrypt, proteção CORS, rate limiting
- **⚡ Rápido**: Backend assíncrono (FastAPI), frontend otimizado (React + Vite)
- **📊 Completo**: Transações, categorias, orçamentos, metas, relatórios e muito mais
- **🎨 Moderno**: Interface responsiva com TailwindCSS e componentes acessíveis (Radix UI)
- **🐳 Docker Ready**: Deploy simplificado com Docker Compose
- **📱 Responsivo**: Funciona perfeitamente em desktop, tablet e mobile
- **🌍 Multi-idioma**: Suporte para português e inglês
- **💱 Multi-moeda**: Suporte para diferentes moedas com conversão automática

---

## ✨ Características

### Gerenciamento de Transações
- ✅ Registro completo de receitas e despesas
- ✅ Categorização flexível com ícones e cores personalizáveis
- ✅ Busca e filtros avançados
- ✅ Exportação para CSV
- ✅ Notas e tags para organização

### Orçamentos Inteligentes
- ✅ Criação de orçamentos por categoria
- ✅ Acompanhamento de progresso em tempo real
- ✅ Alertas de gastos excessivos
- ✅ Histórico de orçamentos

### Metas Financeiras
- ✅ Definição de objetivos financeiros
- ✅ Acompanhamento de progresso
- ✅ Prazo e valor alvo
- ✅ Visualização de evolução

### Transações Recorrentes
- ✅ Automação de receitas e despesas fixas
- ✅ Configuração de frequência (diária, semanal, mensal, anual)
- ✅ Histórico de transações recorrentes

### Relatórios e Análises
- ✅ Dashboard com visão geral das finanças
- ✅ Gráficos interativos de despesas por categoria
- ✅ Evolução de saldo ao longo do tempo
- ✅ Análise de tendências de gastos
- ✅ Comparações período a período

### Personalização
- ✅ Tema claro/escuro
- ✅ Seleção de idioma (PT/EN)
- ✅ Escolha de moeda padrão
- ✅ Categorias personalizadas com ícones

### Funcionalidades Técnicas
- ✅ Autenticação JWT com refresh tokens
- ✅ Banco de dados assíncrono (PostgreSQL)
- ✅ Rate limiting e proteção contra ataques
- ✅ Migrações automáticas (Alembic)
- ✅ Type safety (100% TypeScript no frontend)
- ✅ Testes abrangentes (130+ testes)
- ✅ Documentação API automática (Swagger/OpenAPI)

---

## 🌐 Demo ao Vivo

**Aplicação:** http://68.183.98.186

**Endpoints da API:**
- Health Check: http://68.183.98.186/api/health
- Documentação Interativa: http://68.183.98.186/api/docs
- API ReDoc: http://68.183.98.186/api/redoc

### Credenciais de Demo
Crie sua própria conta - o registro está aberto!

---

## 🚀 Começando

### Pré-requisitos

- **Docker** 20.10+ e **Docker Compose** 3.9+ ([Instalar Docker](https://docs.docker.com/get-docker/))
- **Git** para clonar o repositório

### Instalação Rápida

```bash
# Clone o repositório
git clone https://github.com/LeP-Projects/plutsgrip-app.git
cd plutsgrip-app

# Inicie o ambiente de desenvolvimento
make up

# Ou usando o script de gerenciamento
./docker-manage.sh up dev     # Linux/Mac
docker-manage.bat up dev       # Windows

# Ou usando docker-compose diretamente
docker compose --profile dev --env-file .env.dev up -d
```

### Acesso

Após iniciar os containers, acesse:

- **Frontend**: http://localhost:5173
- **API**: http://localhost:8000
- **Documentação API**: http://localhost:8000/docs
- **pgAdmin** (dev): http://localhost:5050
- **PostgreSQL** (dev): localhost:5432

### Primeiros Passos

1. Acesse http://localhost:5173
2. Clique em "Criar Conta"
3. Preencha seus dados e faça login
4. Comece a registrar suas transações!

Para instruções detalhadas, consulte o [Guia de Setup](docs/setup.md).

---

## 📚 Documentação

> **📖 Veja o [Guia de Organização da Documentação](GUIA_ORGANIZACAO.md)** para entender como toda a documentação está estruturada.

### 📂 Documentação Geral (Root)

Documentação sobre o projeto como um todo, setup e deploy:

- **[Guia de Setup](docs/setup.md)** - Instalação completa (dev e produção)
- **[Guia de Contribuição](docs/contribuindo.md)** - Como contribuir com o projeto
- **[Docker](docs/docker.md)** - Guia completo do Docker
- **[Migração Docker](docs/migracao-docker.md)** - Guia de migração
- **[Deploy em Produção](docs/deploy-producao.md)** - Checklist completo

### 🔌 Documentação do Backend

Documentação técnica da API FastAPI:

- **[README Backend](plutsgrip-api/README.md)** - Visão geral do backend
- **[Arquitetura](plutsgrip-api/docs/arquitetura.md)** - Estrutura e padrões
- **[Endpoints da API](plutsgrip-api/docs/endpoints-api.md)** - Referência completa
- **[Autenticação](plutsgrip-api/docs/autenticacao.md)** - Sistema de autenticação JWT
- **[Banco de Dados](plutsgrip-api/docs/banco-dados.md)** - Schema e migrations
- **[Guia de Setup](plutsgrip-api/docs/guia-setup.md)** - Configuração do backend

### 🎨 Documentação do Frontend

Documentação técnica do frontend React:

- **[README Frontend](plutsgrip-frond-refac/README.md)** - Visão geral do frontend
- **[Índice](plutsgrip-frond-refac/docs/00-indice.md)** - Navegação completa
- **[Visão Geral](plutsgrip-frond-refac/docs/01-visao-geral.md)** - Objetivos e funcionalidades
- **[Arquitetura](plutsgrip-frond-refac/docs/02-arquitetura.md)** - Estrutura do frontend
- **[Testes](plutsgrip-frond-refac/docs/05-testes.md)** - Guia de testes
- **[Componentes](plutsgrip-frond-refac/docs/07-componentes.md)** - Catálogo de componentes
- **[Guia de Desenvolvimento](plutsgrip-frond-refac/docs/09-guia-desenvolvimento.md)** - Workflow e convenções

---

## 🛠 Tecnologias

### Backend
- **[FastAPI](https://fastapi.tiangolo.com/)** - Framework web moderno e rápido
- **[Python 3.11+](https://www.python.org/)** - Linguagem de programação
- **[PostgreSQL 16+](https://www.postgresql.org/)** - Banco de dados relacional
- **[SQLAlchemy 2.0](https://www.sqlalchemy.org/)** - ORM assíncrono
- **[Alembic](https://alembic.sqlalchemy.org/)** - Migrations de banco
- **[Pydantic v2](https://docs.pydantic.dev/)** - Validação de dados
- **[PyJWT](https://pyjwt.readthedocs.io/)** - Autenticação JWT
- **[Pytest](https://pytest.org/)** - Framework de testes

### Frontend
- **[React 19.1](https://react.dev/)** - Biblioteca UI
- **[TypeScript 5.9](https://www.typescriptlang.org/)** - Superset tipado do JavaScript
- **[Vite 5+](https://vitejs.dev/)** - Build tool e dev server
- **[TailwindCSS 4.1](https://tailwindcss.com/)** - Framework CSS utilitário
- **[Radix UI](https://www.radix-ui.com/)** - Componentes acessíveis
- **[Recharts](https://recharts.org/)** - Biblioteca de gráficos
- **[React Router 7](https://reactrouter.com/)** - Roteamento
- **[Vitest](https://vitest.dev/)** - Framework de testes

### DevOps & Infraestrutura
- **[Docker](https://www.docker.com/)** - Containerização
- **[Docker Compose](https://docs.docker.com/compose/)** - Orquestração
- **[Nginx](https://nginx.org/)** - Reverse proxy e servidor web
- **[Gunicorn](https://gunicorn.org/)** - WSGI HTTP Server (produção)
- **[DigitalOcean](https://www.digitalocean.com/)** - Hospedagem VPS
- **[Neon PostgreSQL](https://neon.tech/)** - Postgres Serverless (produção)

---

## 🎯 Arquitetura

### Visão Geral

```
┌─────────────────────────────────────────────┐
│         Frontend (React + TypeScript)        │
│  Interface responsiva e moderna             │
└────────────────┬────────────────────────────┘
                 │ HTTP/REST
┌────────────────▼────────────────────────────┐
│      Nginx (Reverse Proxy - Produção)       │
│  Rate limiting, SSL, gzip, cache            │
└────────────────┬────────────────────────────┘
                 │
┌────────────────▼────────────────────────────┐
│      API (FastAPI + Python)                 │
│  Business logic, autenticação, validação    │
└────────────────┬────────────────────────────┘
                 │ SQLAlchemy ORM
┌────────────────▼────────────────────────────┐
│      PostgreSQL 16                          │
│  Banco de dados relacional                  │
└─────────────────────────────────────────────┘
```

### Camadas

- **Frontend Layer**: Componentes React, hooks, contexts, routing
- **API Gateway**: Nginx (produção) - reverse proxy, rate limiting, SSL
- **API Layer**: FastAPI endpoints, validação Pydantic
- **Service Layer**: Lógica de negócio, orquestração
- **Repository Layer**: Acesso a dados, queries SQL
- **Database Layer**: PostgreSQL, migrations Alembic

---

## 📁 Estrutura do Projeto

```
plutsgrip-app/
├── docs/                          # 📚 Documentação geral
│   ├── setup.md                   # Guia de instalação
│   ├── contribuindo.md            # Guia de contribuição
│   ├── docker.md                  # Documentação Docker
│   ├── migracao-docker.md         # Migração Docker
│   └── deploy-producao.md         # Deploy em produção
│
├── plutsgrip-api/                 # 🔌 Backend (FastAPI + Python)
│   ├── app/
│   │   ├── api/v1/endpoints/      # 35+ endpoints da API
│   │   ├── core/                  # Config, database, security
│   │   ├── models/                # Modelos SQLAlchemy
│   │   ├── schemas/               # Schemas Pydantic
│   │   ├── repositories/          # Camada de acesso a dados
│   │   └── services/              # Lógica de negócio
│   ├── docs/                      # Documentação do backend
│   ├── alembic/                   # Migrações do banco
│   ├── tests/                     # Testes do backend
│   └── main.py                    # Entry point
│
├── plutsgrip-frond-refac/         # 🎨 Frontend (React + TypeScript)
│   ├── src/
│   │   ├── components/            # Componentes React reutilizáveis
│   │   ├── pages/                 # Componentes de página
│   │   ├── services/              # Camada de serviço da API
│   │   ├── hooks/                 # Custom React hooks
│   │   ├── contexts/              # React contexts
│   │   └── utils/                 # Funções utilitárias
│   ├── docs/                      # Documentação do frontend
│   ├── e2e/                       # Testes E2E (Playwright)
│   └── tests/                     # Testes unitários (Vitest)
│
├── nginx/                         # 🌐 Configuração Nginx
├── docker-compose.yml             # Docker Compose unificado
├── .env.dev                       # Variáveis de ambiente (dev)
├── .env.prod                      # Variáveis de ambiente (prod)
├── Makefile                       # Comandos de desenvolvimento
├── GUIA_ORGANIZACAO.md            # Guia de organização
└── README.md                      # Este arquivo
```

---

## 💻 Desenvolvimento

### Comandos Disponíveis

```bash
# Docker
make up              # Inicia ambiente de desenvolvimento
make down            # Para todos os containers
make logs            # Visualiza todos os logs
make logs-api        # Visualiza logs do backend
make logs-frontend   # Visualiza logs do frontend
make shell           # Acessa shell do backend
make test            # Executa testes do backend
make status          # Mostra status dos containers
make build           # Build das imagens

# Backend (sem Docker)
cd plutsgrip-api
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python main.py

# Frontend (sem Docker)
cd plutsgrip-frond-refac
npm install
npm run dev
```

---

## 🧪 Testes

### Backend

```bash
cd plutsgrip-api
pytest                    # Executa todos os testes
pytest --cov             # Com cobertura
pytest -v                # Saída verbose
pytest -k "test_auth"    # Testes específicos
```

### Frontend

```bash
cd plutsgrip-frond-refac
npm test                 # Testes unitários (Vitest)
npm test:coverage        # Com cobertura
npx playwright test      # Testes E2E
npx playwright test --ui # E2E com UI
```

### Estatísticas de Testes

- **Backend**: 30+ testes (pytest)
- **Frontend**: 100+ testes (vitest)
- **Cobertura**: >90%
- **Total**: 130+ testes automatizados

---

## 🚀 Deploy

A aplicação está atualmente em produção na **DigitalOcean**:

- **Servidor**: DigitalOcean Droplet (2GB RAM, 1 vCPU)
- **Endereço**: http://68.183.98.186
- **Web Server**: Nginx (reverse proxy + estáticos)
- **Backend**: FastAPI (serviço systemd)
- **Banco**: Neon PostgreSQL (serverless, sa-east-1)

### Guia de Deploy

Para instruções completas, veja [docs/deploy-producao.md](docs/deploy-producao.md)

Checklist:
- ✅ Servidor provisionado
- ✅ Backend configurado com systemd
- ✅ Frontend buildado e servido por Nginx
- ✅ Migrations aplicadas
- ✅ Variáveis de ambiente configuradas
- ✅ Firewall e segurança configurados

---

## 🤝 Contribuindo

Contribuições são sempre bem-vindas! Veja [docs/contribuindo.md](docs/contribuindo.md) para orientações completas.

### Passos Rápidos

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'feat: adiciona MinhaFeature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

### Convenções de Commit

Utilizamos [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` Nova funcionalidade
- `fix:` Correção de bug
- `docs:` Documentação
- `style:` Formatação
- `refactor:` Refatoração
- `test:` Testes
- `chore:` Manutenção

---

## 📊 Estatísticas do Projeto

- **Versão**: 0.1.0
- **Status**: ✅ Production Ready
- **Linhas de Código**: ~15.000+
- **Endpoints API**: 35+
- **Componentes React**: 35+
- **Cobertura de Testes**: >90%
- **TypeScript Coverage**: 100%

---

## 📄 Licença

Este projeto está licenciado sob a Licença MIT. Veja o arquivo [LICENSE](LICENSE) para detalhes.

---

## 🙏 Agradecimentos

- Construído com [FastAPI](https://fastapi.tiangolo.com/) e [React](https://react.dev/)
- Componentes de UI do [Radix UI](https://www.radix-ui.com/)
- Estilizado com [TailwindCSS](https://tailwindcss.com/)
- Hospedado na [DigitalOcean](https://www.digitalocean.com/)
- Banco de dados pelo [Neon](https://neon.tech/)

---

## 📞 Suporte

- **Documentação**: [docs/](docs/)
- **Issues**: [GitHub Issues](https://github.com/LeP-Projects/plutsgrip-app/issues)
- **Discussões**: [GitHub Discussions](https://github.com/LeP-Projects/plutsgrip-app/discussions)
- **Email**: paulodjunior.dev@gmail.com

---

<div align="center">

**Projeto PlutusGrip Finance Tracker**

Desenvolvido com ❤️ por LeP Projects

[⬆ Voltar ao Topo](#plutsgrip---gerenciador-de-finanças-pessoais)

</div>
