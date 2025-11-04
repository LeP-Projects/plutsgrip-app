# PlutusGrip Finance Tracker - Frontend

![React](https://img.shields.io/badge/React-19.1.1-61DAFB.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-3178C6.svg)
![Vite](https://img.shields.io/badge/Vite-5+-646CFF.svg)
![Tests](https://img.shields.io/badge/Tests-102%2B%20Passing-success.svg)

Aplicação web moderna em React + TypeScript para gerenciamento de finanças pessoais.

## 📌 Veja o README Principal

Este é o README do frontend. Para guia completo e instruções de setup, consulte:

**[../README.md](../README.md)** - Guia principal com quick start

## 🎯 Visão Geral

Interface moderna e responsiva para:

- ✅ **Autenticação JWT** - Com refresh automático
- ✅ **Gerenciamento de Transações** - CRUD completo
- ✅ **Dashboard Interativo** - Com gráficos em tempo real
- ✅ **Categorias** - Personalizáveis com cores e ícones
- ✅ **Relatórios** - Tendências, padrões, comparações
- ✅ **Orçamentos** - Controle de limites
- ✅ **Metas Financeiras** - Rastreamento com progresso
- ✅ **Totalmente Type-Safe** - TypeScript em 100%

## 🚀 Quick Start

```bash
# 1. Instalar dependências
npm install

# 2. Iniciar servidor de desenvolvimento
npm run dev

# 3. Acessar em http://localhost:5173
```

## 📁 Estrutura

```
src/
├── services/
│   ├── api.ts               # Serviço centralizado (30+ métodos)
│   └── __tests__/           # 90+ testes
├── hooks/
│   ├── useApi.ts            # Hook para queries
│   └── __tests__/           # 40+ testes
├── components/              # Componentes React
├── pages/                   # Páginas da aplicação
├── types/                   # TypeScript types
└── ...
```

## 🧪 Testes

```bash
# Testes unitários
npm test

# Com coverage
npm test:coverage

# E2E com Playwright
npx playwright test

# E2E com UI
npx playwright test --ui
```

## 📦 Scripts Disponíveis

```bash
npm run dev              # Iniciar dev server
npm run build            # Build para produção
npm run preview          # Preview do build
npm test                 # Rodar testes
npm test:coverage        # Testes com cobertura
npm run lint             # Verificar tipos
```

## 🛠️ Tecnologias

- **React 19.1.1** - UI library
- **TypeScript 5.9.3** - Type safety
- **Vite 5+** - Build tool
- **TailwindCSS** - Styling
- **Radix UI** - Componentes acessíveis
- **Vitest** - Testes unitários
- **Playwright** - Testes E2E
- **Axios** - HTTP client

## 📖 Documentação

### 📍 Começar Aqui
- **[../README.md](../README.md)** - Guia principal com quick start
- **[../docs/00-INDEX.md](../docs/00-INDEX.md)** - Índice centralizado de toda documentação
- **[../SETUP.md](../SETUP.md)** - Instruções de setup para dev e produção
- **[../CONTRIBUTING.md](../CONTRIBUTING.md)** - Guia de contribuição

### 🎨 Documentação de Frontend
- **[../docs/02-ARCHITECTURE.md](../docs/02-ARCHITECTURE.md)** - Arquitetura do sistema completa
- **[../docs/07-DEVELOPMENT.md](../docs/07-DEVELOPMENT.md)** - Workflow de desenvolvimento
- **[../docs/03-API-ENDPOINTS.md](../docs/03-API-ENDPOINTS.md)** - Referência dos endpoints

### 🧪 Testes & Deploy
- **[../docs/08-TESTING.md](../docs/08-TESTING.md)** - Guia de testes (unit, integration, E2E)
- **[../docs/10-DEPLOYMENT.md](../docs/10-DEPLOYMENT.md)** - Instruções de deploy para produção
- **[../docs/09-TROUBLESHOOTING.md](../docs/09-TROUBLESHOOTING.md)** - Soluções de problemas comuns
- **[../docs/FAQ.md](../docs/FAQ.md)** - Perguntas frequentes

### 📚 Documentação Completa
Toda documentação centralizada em `../docs/`:
- [00-INDEX.md](../docs/00-INDEX.md), [01-OVERVIEW.md](../docs/01-OVERVIEW.md), [02-ARCHITECTURE.md](../docs/02-ARCHITECTURE.md)
- [03-API-ENDPOINTS.md](../docs/03-API-ENDPOINTS.md), [04-DATABASE.md](../docs/04-DATABASE.md), [05-AUTHENTICATION.md](../docs/05-AUTHENTICATION.md)
- [06-DOCKER-SETUP.md](../docs/06-DOCKER-SETUP.md), [07-DEVELOPMENT.md](../docs/07-DEVELOPMENT.md)
- [08-TESTING.md](../docs/08-TESTING.md), [09-TROUBLESHOOTING.md](../docs/09-TROUBLESHOOTING.md), [10-DEPLOYMENT.md](../docs/10-DEPLOYMENT.md)
- [FAQ.md](../docs/FAQ.md), [GLOSSARY.md](../docs/GLOSSARY.md)

## ⚙️ Variáveis de Ambiente

```env
VITE_API_URL=http://localhost:8000/api/v1
```

## 📊 Estatísticas

- 102+ testes
- 96% cobertura
- ~2,000 linhas de código
- 100% type-safe com TypeScript
- Pronto para produção

## 📄 Licença

MIT License

---

Desenvolvido com ❤️ usando React e TypeScript
