# Arquitetura do Frontend

## 1. Visao Geral

O frontend do PlutusGrip e uma aplicacao React 19 com TypeScript, Vite e React Router, organizada como cliente web para a API FastAPI do backend.

A aplicacao atual segue um modelo client-server com separacao entre:

- interface e navegacao
- estado global e autenticacao
- consumo de API
- componentes de dominio
- componentes base reutilizaveis

O frontend nao usa um backend em Express nem banco em memoria. O backend real da plataforma e FastAPI com SQLAlchemy e PostgreSQL.

---

## 2. Stack Atual

| Camada | Tecnologia |
|--------|------------|
| UI | React 19 |
| Linguagem | TypeScript |
| Build | Vite |
| Roteamento | React Router DOM |
| Estilizacao | Tailwind CSS 4 |
| Componentes base | Radix UI |
| Formularios | React Hook Form |
| Graficos | Recharts |
| Testes unitarios | Vitest |
| Testes E2E | Playwright |

---

## 3. Estrutura Atual

```text
plutsgrip-front/
├── src/
│   ├── App.tsx
│   ├── main.tsx
│   ├── index.css
│   ├── components/
│   │   ├── ui/
│   │   ├── CategoryChart/
│   │   ├── CategoryManager/
│   │   ├── ExpenseForm/
│   │   ├── RecentTransactions/
│   │   ├── ReportsSection/
│   │   └── ...
│   ├── contexts/
│   │   ├── AuthContext.tsx
│   │   ├── CurrencyContext.tsx
│   │   └── ThemeProvider.tsx
│   ├── hooks/
│   │   ├── useApi.ts
│   │   ├── use-mobile.ts
│   │   └── use-toast.ts
│   ├── pages/
│   │   ├── Landing/
│   │   ├── Login/
│   │   ├── Register/
│   │   └── Dashboard/
│   ├── services/
│   │   └── api.ts
│   ├── utils/
│   │   ├── calculations.ts
│   │   └── export-utils.ts
│   └── lib/
│       └── utils.ts
├── e2e/
└── docs/
```

---

## 4. Camadas da Aplicacao

### 4.1 App Shell e Roteamento

O `App.tsx` configura:

- `BrowserRouter`
- `ThemeProvider`
- `AuthProvider`
- `CurrencyProvider`
- rotas publicas
- rota protegida para dashboard

Rotas atuais:

- `/`
- `/login`
- `/register`
- `/dashboard`

Observacao:
Hoje a maior parte da experiencia autenticada ainda esta concentrada em uma unica pagina de dashboard com abas internas. Isso funciona para o MVP, mas cria gargalo para escalar modulos de produto.

---

### 4.2 Contextos Globais

Os contextos concentram estados compartilhados:

- `AuthContext`
  - sessao do usuario
  - login
  - registro
  - logout
- `CurrencyContext`
  - moeda de exibicao
  - formatacao monetaria
- `ThemeProvider`
  - tema claro, escuro ou sistema

Observacao importante:
O frontend ainda utiliza `localStorage` para tokens e sessao. O proprio codigo ja documenta que isso e uma estrategia provisoria para demonstracao e deve evoluir em ambiente de producao.

---

### 4.3 Camada de Consumo de API

O arquivo `src/services/api.ts` concentra as chamadas HTTP para:

- autenticacao
- transacoes
- categorias
- relatorios
- orcamentos
- metas
- transacoes recorrentes

O hook `useApi` encapsula:

- loading
- erro
- dado carregado
- execucao manual
- refetch

O hook `useMutation` encapsula operacoes de escrita.

Observacoes:

- existe centralizacao basica do cliente HTTP
- ainda nao ha uma camada de cache de dados mais robusta
- parte dos filtros ainda e processada no cliente em vez de ser delegada ao backend

---

### 4.4 Camada de Interface

O frontend mistura hoje dois tipos principais de componentes:

- componentes base reutilizaveis
  - `Button`
  - `Input`
  - `Card`
  - `Dialog`
  - `Tabs`
- componentes de dominio
  - `ExpenseForm`
  - `RecentTransactions`
  - `CategoryChart`
  - `ReportsSection`
  - `CategoryManager`

Esse modelo funciona, mas ainda esta mais organizado por tipo de artefato do que por dominio de negocio.

---

## 5. Fluxo de Dados

### 5.1 Autenticacao

1. Usuario faz login ou registro
2. Frontend chama `apiService.login` ou `apiService.register`
3. API retorna tokens e usuario
4. Sessao e persistida localmente
5. `AuthContext` atualiza o estado global
6. Rotas protegidas passam a ser acessiveis

### 5.2 Consulta de Dados

1. Componente chama `useApi`
2. `useApi` executa callback do `apiService`
3. Cliente envia requisicao autenticada ao backend
4. Estado de loading e atualizado
5. Resposta e refletida na interface

### 5.3 Escrita de Dados

1. Usuario preenche formulario
2. Componente chama `useMutation`
3. Mutation envia payload para API
4. Backend persiste dados
5. Frontend atualiza listas e indicadores

Observacao:
Parte da experiencia atual ainda atualiza apenas estado local em alguns fluxos, e isso precisa ser eliminado gradualmente.

---

## 6. Principais Modulos Funcionais Hoje

### 6.1 Landing e Autenticacao

- pagina inicial publica
- login
- registro
- controle de rota protegida

### 6.2 Dashboard

Concentra:

- indicadores principais
- graficos
- formulario de transacao
- listagem recente
- secao de relatorios
- configuracoes visuais

### 6.3 Relatorios

Atualmente ha suporte a:

- resumo de dashboard
- tendencia mensal
- detalhamento por categoria
- padroes de gastos

Mas ainda existem filtros e categorias tratados localmente no frontend, o que reduz confiabilidade e escalabilidade.

### 6.4 Gestao Financeira

A API ja suporta:

- transacoes
- categorias
- orcamentos
- metas
- recorrencias

Nem todos esses dominios ainda aparecem no frontend como modulos independentes de produto.

---

## 7. Problemas Arquiteturais Atuais

### 7.1 Concentracao excessiva no Dashboard

A area autenticada esta muito concentrada em uma unica pagina com varias abas internas. Isso:

- dificulta escalabilidade da UX
- aumenta acoplamento
- torna manutencao mais custosa

### 7.2 Frontend ainda filtra parte dos dados localmente

Alguns componentes consultam dados brutos e fazem filtragem no cliente, quando o ideal seria delegar mais ao backend para:

- coerencia
- performance
- reuso
- confiabilidade dos relatarios

### 7.3 Estrutura orientada a tipo de arquivo

A organizacao atual por `components`, `pages`, `services` e `hooks` funciona, mas tende a perder clareza conforme o produto cresce.

### 7.4 Contratos ainda pouco centralizados

Embora `api.ts` concentre chamadas, ainda ha risco de divergencia entre modelos da API e expectativas do frontend.

---

## 8. Direcao Arquitetural Recomendada

### Curto prazo

- corrigir contratos entre frontend e backend
- remover hardcodes de filtros e categorias
- garantir persistencia real em fluxos de edicao e exclusao
- revisar documentacao e cobertura de testes

### Medio prazo

Migrar a estrutura do frontend para modulos de dominio, por exemplo:

```text
src/
├── app/
├── shared/
├── features/
│   ├── auth/
│   ├── transactions/
│   ├── categories/
│   ├── budgets/
│   ├── goals/
│   ├── recurring/
│   ├── reports/
│   └── insights/
```

### Longo prazo

- modularizar a experiencia autenticada por rotas reais
- introduzir camada de cache e sincronizacao mais robusta
- gerar tipos a partir do contrato OpenAPI
- evoluir autenticacao para estrategia mais segura

---

## 9. Resumo

O frontend do PlutusGrip ja possui uma base moderna e funcional, mas ainda esta em transicao entre MVP operacional e produto escalavel.

Os proximos passos arquiteturais devem priorizar:

- coerencia tecnica
- modularizacao por dominio
- melhor separacao de responsabilidades
- integracao mais forte com os contratos reais do backend
- reducao da dependencia de logica local para relatorios e regras financeiras

