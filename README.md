# PlutusGrip Finance Tracker

<div align="center">

![PlutusGrip Logo](plutsgrip-frond-refac/public/plutus.png)

**Sistema Moderno de Gestão Financeira Pessoal**

[![Python](https://img.shields.io/badge/Python-3.11+-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104+-green.svg)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-19.1.1-61DAFB.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-3178C6.svg)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Status](https://img.shields.io/badge/Status-Production-success.svg)](http://68.183.98.186)

[Demo ao Vivo](http://68.183.98.186) • [Documentação](docs/INDEX.md) • [API Docs](http://68.183.98.186/api/docs) • [Reportar Bug](https://github.com/LeP-Projects/plutsgrip-app/issues)

</div>

---

## 📖 Índice

- [Sobre](#-sobre)
- [Funcionalidades](#-funcionalidades)
- [Demo ao Vivo](#-demo-ao-vivo)
- [Stack Tecnológica](#-stack-tecnológica)
- [Início Rápido](#-início-rápido)
- [Documentação](#-documentação)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Desenvolvimento](#-desenvolvimento)
- [Deploy](#-deploy)
- [Contribuindo](#-contribuindo)
- [Licença](#-licença)

---

## 🎯 Sobre

**PlutusGrip** é um sistema abrangente de gestão financeira pessoal que ajuda você a rastrear despesas, gerenciar orçamentos, definir metas financeiras e obter insights sobre seus hábitos de gastos através de painéis interativos e bonitos.

Construído com tecnologias modernas e implantado na **DigitalOcean** com **Neon PostgreSQL**, o PlutusGrip combina o poder das capacidades assíncronas do FastAPI com a UI responsiva do React para entregar uma experiência perfeita de rastreamento financeiro.

### Por que PlutusGrip?

- 💰 **Controle Financeiro Completo** - Rastreie cada centavo com categorização detalhada
- 📊 **Insights Visuais** - Gráficos e relatórios bonitos para entender suas finanças
- 🎯 **Rastreamento de Metas** - Defina e monitore o progresso em direção a objetivos financeiros
- 🔒 **Seguro e Privado** - Autenticação JWT com senhas criptografadas
- 🌍 **Multi-Moeda** - Suporte para diferentes moedas
- 📱 **Design Responsivo** - Funciona perfeitamente em desktop, tablet e mobile

---

## ✨ Funcionalidades

### Funcionalidades Principais
- ✅ **Gestão de Transações** - Adicione, edite, delete e categorize transações
- ✅ **Rastreamento de Orçamento** - Defina orçamentos mensais/trimestrais/anuais por categoria
- ✅ **Metas Financeiras** - Acompanhe o progresso em direção às metas de economia
- ✅ **Transações Recorrentes** - Automatize receitas/despesas regulares
- ✅ **Categorias Personalizadas** - Crie categorias personalizadas com cores e ícones
- ✅ **Relatórios e Analytics** - Painel com tendências, padrões e insights

### Funcionalidades Técnicas
- ✅ **Autenticação JWT** - Tokens de acesso e refresh seguros
- ✅ **Banco de Dados Assíncrono** - Operações PostgreSQL assíncronas de alta performance
- ✅ **Rate Limiting** - Proteção da API com suporte a whitelist de IPs
- ✅ **Migrações Automáticas** - Migrações de banco de dados Alembic
- ✅ **Type Safety** - Frontend 100% TypeScript
- ✅ **Testes Abrangentes** - 130+ testes com alta cobertura
- ✅ **Documentação da API** - Documentação Swagger/OpenAPI auto-gerada

---

## 🌐 Demo ao Vivo

**Aplicação:** http://68.183.98.186

**Endpoints da API:**
- Health Check: http://68.183.98.186/api/health
- Documentação da API: http://68.183.98.186/api/docs
- API Interativa: http://68.183.98.186/api/redoc

### Credenciais de Demo
Crie sua própria conta - o registro está aberto!

---

## 🛠️ Stack Tecnológica

### Backend
- **[FastAPI](https://fastapi.tiangolo.com/)** - Framework web Python assíncrono moderno
- **[SQLAlchemy 2.0](https://www.sqlalchemy.org/)** - ORM assíncrono
- **[Pydantic v2](https://docs.pydantic.dev/)** - Validação de dados
- **[Neon PostgreSQL](https://neon.tech/)** - Postgres Serverless (Produção)
- **[Alembic](https://alembic.sqlalchemy.org/)** - Migrações de banco de dados
- **[JWT](https://jwt.io/)** - Autenticação segura
- **[Pytest](https://pytest.org/)** - Framework de testes

### Frontend
- **[React 19](https://react.dev/)** - Biblioteca de UI
- **[TypeScript 5.9](https://www.typescriptlang.org/)** - Type safety
- **[Vite 5](https://vitejs.dev/)** - Ferramenta de build e dev server
- **[TailwindCSS 4](https://tailwindcss.com/)** - CSS utility-first
- **[Radix UI](https://www.radix-ui.com/)** - Componentes acessíveis
- **[Recharts](https://recharts.org/)** - Gráficos e visualizações
- **[Vitest](https://vitest.dev/)** - Testes unitários
- **[Playwright](https://playwright.dev/)** - Testes E2E

### Infraestrutura
- **[DigitalOcean](https://www.digitalocean.com/)** - Hospedagem VPS (Droplet)
- **[Nginx](https://nginx.org/)** - Proxy reverso e arquivos estáticos
- **[Systemd](https://systemd.io/)** - Gerenciamento de serviços
- **[Docker](https://www.docker.com/)** - Containerização (ambiente dev)
- **[GitHub Actions](https://github.com/features/actions)** - CI/CD (planejado)

---

## 🚀 Início Rápido

### Pré-requisitos

Escolha uma das seguintes configurações:

#### Opção A: Docker (Recomendado para Desenvolvimento)
- Docker & Docker Compose 3.9+
- Git

#### Opção B: Configuração Local
- Python 3.11+
- Node.js 20+
- PostgreSQL 15+ (ou use Neon)

### Desenvolvimento com Docker

```bash
# 1. Clone o repositório
git clone https://github.com/LeP-Projects/plutsgrip-app.git
cd plutsgrip-app

# 2. Inicie os serviços
make up
# Ou: docker-compose -f docker-compose.dev.yml up

# 3. Acesse a aplicação
# Frontend: http://localhost:5173
# Backend API: http://localhost:8000
# API Docs: http://localhost:8000/docs
```

### Configuração de Desenvolvimento Local

Veja instruções detalhadas em:
- **Backend:** [docs/BACKEND.md](docs/BACKEND.md)
- **Frontend:** [docs/FRONTEND.md](docs/FRONTEND.md)

---

## 📚 Documentação

### Começando
- **[Hub de Documentação](docs/INDEX.md)** - Hub completo de documentação
- **[Guia do Backend](docs/BACKEND.md)** - Configuração, arquitetura e referência da API do backend
- **[Guia do Frontend](docs/FRONTEND.md)** - Configuração, componentes e estrutura do frontend
- **[Guia de Deploy](DEPLOY_GUIDE.md)** - Deploy em produção na DigitalOcean

### Desenvolvimento
- **[Guia de Configuração](SETUP.md)** - Configuração detalhada para todos os ambientes
- **[Guia de Contribuição](CONTRIBUTING.md)** - Como contribuir com o projeto
- **[Configuração Docker](DOCKER_README.md)** - Ambiente de desenvolvimento Docker

### Referência
- **[Endpoints da API](docs/03-API-ENDPOINTS.md)** - Referência completa da API
- **[Schema do Banco de Dados](docs/04-DATABASE.md)** - Estrutura e migrações do banco
- **[Autenticação](docs/05-AUTHENTICATION.md)** - Fluxo de autenticação JWT
- **[Testes](docs/08-TESTING.md)** - Estratégias e cobertura de testes

---

## 📁 Estrutura do Projeto

```
plutsgrip-app/
├── docs/                          # 📚 Documentação completa
│   ├── INDEX.md                   # Hub de documentação
│   ├── BACKEND.md                 # Documentação do backend
│   ├── FRONTEND.md                # Documentação do frontend
│   └── *.md                       # Guias adicionais
│
├── plutsgrip-api/                 # 🔌 Backend (FastAPI + Python)
│   ├── app/
│   │   ├── api/v1/endpoints/      # 35+ endpoints da API
│   │   ├── core/                  # Config, database, security
│   │   ├── models/                # Modelos SQLAlchemy
│   │   ├── schemas/               # Schemas Pydantic
│   │   ├── repositories/          # Camada de acesso a dados
│   │   └── services/              # Lógica de negócio
│   ├── alembic/                   # Migrações do banco de dados
│   ├── tests/                     # Testes do backend
│   ├── main.py                    # Ponto de entrada da aplicação
│   └── requirements.txt           # Dependências Python
│
├── plutsgrip-frond-refac/         # 🎨 Frontend (React + TypeScript)
│   ├── src/
│   │   ├── components/            # Componentes React reutilizáveis
│   │   ├── pages/                 # Componentes de página
│   │   ├── services/              # Camada de serviço da API
│   │   ├── hooks/                 # Custom React hooks
│   │   ├── contexts/              # Contextos React (Auth, Currency, Theme)
│   │   └── utils/                 # Funções utilitárias
│   ├── e2e/                       # Testes E2E (Playwright)
│   ├── tests/                     # Testes unitários (Vitest)
│   └── package.json               # Dependências Node
│
├── nginx/                         # 🌐 Configuração Nginx
├── docker-compose.dev.yml         # Ambiente dev Docker
├── docker-compose.prod.yml        # Ambiente prod Docker
├── Makefile                       # Comandos de desenvolvimento
├── DEPLOY_GUIDE.md                # Guia de deploy em produção
└── README.md                      # Este arquivo
```

---

## 💻 Desenvolvimento

### Comandos Disponíveis

```bash
# Desenvolvimento Docker
make up              # Inicia ambiente de desenvolvimento
make down            # Para todos os containers
make logs            # Visualiza todos os logs
make logs-api        # Visualiza apenas logs do backend
make shell           # Acessa shell do backend
make test            # Executa testes do backend
make status          # Mostra status dos containers

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
npm test            # Testes unitários
npm run build       # Build de produção
```

### Testes

```bash
# Testes do Backend
cd plutsgrip-api
pytest                    # Executa todos os testes
pytest --cov             # Com cobertura
pytest -v                # Saída verbose

# Testes do Frontend
cd plutsgrip-frond-refac
npm test                 # Testes unitários (Vitest)
npm test:coverage        # Com cobertura
npx playwright test      # Testes E2E
npx playwright test --ui # E2E com UI
```

---

## 🚀 Deploy

A aplicação está atualmente implantada na **DigitalOcean** com a seguinte configuração:

- **Servidor:** DigitalOcean Droplet (2GB RAM, 1 vCPU)
- **Endereço IP:** 68.183.98.186
- **Web Server:** Nginx (proxy reverso + arquivos estáticos)
- **Backend:** FastAPI (serviço systemd)
- **Banco de Dados:** Neon PostgreSQL (serverless, sa-east-1)
- **SSL:** Let's Encrypt (opcional, requer domínio)

### Guia de Deploy

Para instruções completas de deploy, veja **[DEPLOY_GUIDE.md](DEPLOY_GUIDE.md)**

Checklist rápido de deploy:
- ✅ Droplet da DigitalOcean criado e configurado
- ✅ Backend implantado com serviço systemd
- ✅ Frontend buildado e servido via Nginx
- ✅ Migrações do banco aplicadas no Neon
- ✅ Variáveis de ambiente configuradas
- ✅ Regras de firewall configuradas
- ✅ Serviços executando e monitorados

---

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor, veja **[CONTRIBUTING.md](CONTRIBUTING.md)** para orientações.

### Passos Rápidos para Contribuição

1. Faça fork do repositório
2. Crie uma branch de feature (`git checkout -b feature/amazing-feature`)
3. Faça suas alterações
4. Adicione testes para suas alterações
5. Execute os testes (`make test`)
6. Commit suas alterações (`git commit -m 'feat: add amazing feature'`)
7. Push para sua branch (`git push origin feature/amazing-feature`)
8. Abra um Pull Request

### Fluxo de Desenvolvimento

1. Confira a [documentação](docs/INDEX.md) para arquitetura e padrões
2. Siga as diretrizes de estilo de código (PEP 8 para Python, ESLint para TypeScript)
3. Escreva testes para novas funcionalidades
4. Atualize a documentação conforme necessário
5. Garanta que todos os testes passem antes de submeter PR

---

## 📊 Estatísticas do Projeto

- **Linhas de Código:** ~15.000+
- **Testes Backend:** 30+ (pytest)
- **Testes Frontend:** 100+ (vitest)
- **Endpoints da API:** 35+
- **Cobertura de Testes:** >90%
- **Cobertura TypeScript:** 100%

---

## 📞 Suporte e Contato

- **Issues:** [GitHub Issues](https://github.com/LeP-Projects/plutsgrip-app/issues)
- **Discussões:** [GitHub Discussions](https://github.com/LeP-Projects/plutsgrip-app/discussions)
- **Email:** paulodjunior.dev@gmail.com

---

## 📄 Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

---

## 🙏 Agradecimentos

- Construído com [FastAPI](https://fastapi.tiangolo.com/) e [React](https://react.dev/)
- Componentes de UI do [Radix UI](https://www.radix-ui.com/)
- Estilizado com [TailwindCSS](https://tailwindcss.com/)
- Hospedado na [DigitalOcean](https://www.digitalocean.com/)
- Banco de dados pelo [Neon](https://neon.tech/)

---

<div align="center">

**Projeto PlutusGrip Finance Tracker**

[⬆ Voltar ao Topo](#plutsgrip-finance-tracker)

</div>
