# PlutusGrip Frontend

<div align="center">

![React](https://img.shields.io/badge/React-19.1.1-61DAFB.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-3178C6.svg)
![Vite](https://img.shields.io/badge/Vite-7.0+-646CFF.svg)
![Tests](https://img.shields.io/badge/Tests-100%2B-success.svg)

**Aplicação React TypeScript Moderna para Finanças Pessoais**

[Documentação Principal](../README.md) • [Guia do Frontend](../docs/FRONTEND.md) • [Demo ao Vivo](http://68.183.98.186)

</div>

---

## 📋 Visão Geral

Esta é a **aplicação frontend** para o PlutusGrip, construída com React 19, TypeScript e tecnologias web modernas. Para informações completas do projeto, veja o [README principal](../README.md).

**Funcionalidades Principais:**
- 🎨 **UI Moderna** - Componentes Radix UI com TailwindCSS 4
- 🔒 **Autenticação Segura** - JWT com refresh automático de tokens
- 📊 **Painéis Interativos** - Visualizações com Recharts
- ⚡ **Rápido** - Servidor dev Vite e builds otimizados
- 🎯 **Type Safe** - Cobertura 100% TypeScript
- 🧪 **Bem Testado** - 100+ testes unitários + testes E2E
- 📱 **Responsivo** - Design mobile-first

---

## 🚀 Início Rápido

### Desenvolvimento com Docker (Recomendado)

```bash
# Da raiz do projeto
make up
# Acesse o frontend em http://localhost:5173
```

### Desenvolvimento Local

```bash
# 1. Navegue até o diretório do frontend
cd plutsgrip-frond-refac

# 2. Instale as dependências
npm install

# 3. Configure o ambiente
echo "VITE_API_URL=http://localhost:8000/api/v1" > .env.development

# 4. Inicie o servidor dev
npm run dev
# Acesse em http://localhost:5173
```

---

## 📚 Documentação Completa

Para documentação abrangente do frontend, veja:

### **[📖 Guia do Frontend (docs/FRONTEND.md)](../docs/FRONTEND.md)**

Este guia inclui:
- ✅ Arquitetura e estrutura de componentes
- ✅ Gestão de estado (Context API, hooks)
- ✅ Roteamento e navegação
- ✅ Padrões de integração com API
- ✅ Estratégias de testes (unit + E2E)
- ✅ Processo de build e deploy
- ✅ Estilização com TailwindCSS
- ✅ Fluxo de trabalho de desenvolvimento

### Links Rápidos
- **[README Principal](../README.md)** - Visão geral do projeto e início rápido
- **[Hub de Documentação](../docs/INDEX.md)** - Toda a documentação
- **[Guia do Backend](../docs/BACKEND.md)** - Documentação da API do backend
- **[Guia de Deploy](../DEPLOY_GUIDE.md)** - Deploy em produção

---

## 📁 Estrutura do Projeto

```
plutsgrip-frond-refac/
├── src/
│   ├── components/            # Componentes UI
│   │   ├── ui/                # Componentes base (Button, Dialog, etc.)
│   │   ├── Calendar/          # Componente de calendário
│   │   ├── Chart/             # Visualizações de gráficos
│   │   ├── CategoryManager/   # Gestão de categorias
│   │   ├── RecentTransactions/# Lista de transações
│   │   └── ...                # 20+ componentes de negócio
│   ├── pages/                 # Componentes de página
│   │   ├── Landing/           # Página inicial
│   │   ├── Login/             # Página de login
│   │   ├── Register/          # Página de registro
│   │   └── Dashboard/         # Painel principal
│   ├── contexts/              # Contextos React
│   │   ├── AuthContext.tsx    # Estado de autenticação
│   │   ├── CurrencyContext.tsx# Gestão de moeda
│   │   └── ThemeProvider.tsx  # Tema (modo claro/escuro)
│   ├── services/              # Serviços da API
│   │   └── api.ts             # Cliente API centralizado (30+ métodos)
│   ├── hooks/                 # Custom hooks
│   │   ├── useApi.ts          # Hook de busca de dados
│   │   ├── use-toast.ts       # Notificações toast
│   │   └── use-mobile.ts      # Detecção mobile
│   ├── utils/                 # Utilitários
│   │   ├── calculations.ts    # Cálculos financeiros
│   │   └── export-utils.ts    # Funções de exportação de dados
│   ├── lib/                   # Bibliotecas
│   │   └── utils.ts           # Funções auxiliares
│   └── types/                 # Tipos TypeScript
├── e2e/                       # Testes E2E (Playwright)
├── tests/                     # Testes unitários (Vitest)
├── public/                    # Assets estáticos
└── dist/                      # Saída do build de produção
```

---

## 🛠️ Stack Tecnológica

| Categoria | Tecnologia |
|-----------|------------|
| **Biblioteca UI** | React 19.1.1 |
| **Linguagem** | TypeScript 5.9.3 |
| **Ferramenta de Build** | Vite 7.0+ |
| **Estilização** | TailwindCSS 4.1 |
| **Componentes** | Radix UI |
| **Gráficos** | Recharts |
| **Cliente HTTP** | Axios |
| **Router** | React Router 7 |
| **Estado** | Context API + Hooks |
| **Forms** | React Hook Form |
| **Testes** | Vitest + Playwright |
| **Datas** | date-fns |

---

## 📦 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev              # Iniciar servidor dev (http://localhost:5173)
npm run build            # Build de produção
npm run preview          # Preview do build de produção

# Testes
npm test                 # Executar testes unitários (Vitest)
npm test:coverage        # Executar testes com cobertura
npx playwright test      # Executar testes E2E
npx playwright test --ui # Testes E2E com UI

# Qualidade de Código
npm run lint             # Executar ESLint
npm run type-check       # Verificação de tipos TypeScript
```

---

## 🎨 Funcionalidades Principais

### Páginas
- **Página Inicial** - Marketing e visão geral de funcionalidades
- **Autenticação** - Login e registro
- **Painel** - Visão geral com gráficos e estatísticas
- **Transações** - CRUD completo com filtragem
- **Relatórios** - Analytics detalhado e insights
- **Categorias** - Gestão de categorias personalizadas
- **Orçamentos** - Rastreamento e alertas de orçamento
- **Metas** - Monitoramento de metas financeiras

### Componentes
- **20+ Componentes de Negócio** - CategoryChart, IncomeChart, ExpenseChart, etc.
- **15+ Componentes UI** - Button, Dialog, Select, Input, etc.
- **3 Provedores de Contexto** - Auth, Currency, Theme
- **Custom Hooks** - useApi, useToast, useMobile
- **Design Responsivo** - Funciona em todos os tamanhos de tela

---

## 🧪 Testes

```bash
# Testes Unitários (Vitest)
npm test                    # Executar todos os testes
npm test:coverage           # Com relatório de cobertura
npm test -- --watch         # Modo watch

# Testes E2E (Playwright)
npx playwright test         # Executar todos os testes E2E
npx playwright test --ui    # Modo interativo
npx playwright test --debug # Modo debug
npx playwright codegen      # Gerar código de teste
```

**Cobertura de Testes:** >90%

---

## 🌐 Produção

**Aplicação ao Vivo:** http://68.183.98.186

**Deploy Atual:**
- **Ferramenta de Build:** Vite (bundle otimizado)
- **Servidor:** Nginx (arquivos estáticos)
- **CDN:** Nenhum (servido diretamente)
- **SSL:** Opcional (Let's Encrypt se domínio configurado)

Para instruções de deploy, veja [DEPLOY_GUIDE.md](../DEPLOY_GUIDE.md).

---

## ⚙️ Variáveis de Ambiente

### Desenvolvimento (`.env.development`)
```env
VITE_API_URL=http://localhost:8000/api/v1
```

### Produção (`.env.production`)
```env
VITE_API_URL=http://68.183.98.186/api
```

**Nota:** Vite requer o prefixo `VITE_` para variáveis de ambiente.

---

## 🎨 Temas

O PlutusGrip suporta temas claro e escuro com detecção automática do sistema:

```typescript
import { ThemeProvider } from '@/contexts/ThemeProvider'

// Temas: 'light', 'dark', 'system'
<ThemeProvider defaultTheme="system">
  <App />
</ThemeProvider>
```

As cores dos temas são definidas em `src/index.css` usando variáveis CSS.

---

## 🔧 Comandos Comuns

```bash
# Desenvolvimento
npm run dev                    # Iniciar servidor dev

# Build
npm run build                  # Build de produção
npm run preview                # Preview do build localmente
rm -rf dist && npm run build   # Build limpo

# Dependências
npm install                    # Instalar dependências
npm outdated                   # Verificar atualizações
npm update                     # Atualizar dependências

# Qualidade de Código
npm run lint                   # Lint do código
npm run lint -- --fix          # Corrigir problemas de lint
npm run type-check             # Verificar tipos
```

---

## 🐛 Troubleshooting

### Problemas Comuns

**Porta 5173 já em uso:**
```bash
# Encontrar processo
lsof -i :5173  # macOS/Linux
netstat -ano | findstr :5173  # Windows

# Matar processo ou usar porta diferente
npm run dev -- --port 5174
```

**Conexão com API recusada:**
```bash
# Verificar URL da API no .env
cat .env.development

# Verificar se backend está rodando
curl http://localhost:8000/api/health
```

**Build falha com erros TypeScript:**
```bash
# Verificar erros de tipo
npm run type-check

# Desabilitar verificação de tipo no build (temporário)
# No vite.config.ts, comente o plugin type checker
```

Para mais dicas de troubleshooting, veja [docs/FRONTEND.md](../docs/FRONTEND.md#troubleshooting).

---

## 🎯 Boas Práticas

### Desenvolvimento de Componentes
```typescript
// Use componentes funcionais com TypeScript
export function MyComponent({ prop }: Props) {
  return <div>{prop}</div>
}

// Use custom hooks para lógica
const { data, loading, error } = useApi('/endpoint')

// Use contexto para estado global
const { user, login } = useAuth()
```

### Integração com API
```typescript
// Use serviço de API centralizado
import { apiService } from '@/services/api'

// Faça chamadas à API
const transactions = await apiService.getTransactions()
```

### Estilização
```typescript
// Use classes Tailwind
<Button className="bg-blue-500 hover:bg-blue-600">Click</Button>

// Use helper cn() para classes condicionais
import { cn } from '@/lib/utils'
<div className={cn('base-class', isActive && 'active-class')} />
```

---

## 📞 Suporte

- **Issues:** [GitHub Issues](https://github.com/LeP-Projects/plutsgrip-app/issues)
- **Documentação:** [docs/INDEX.md](../docs/INDEX.md)
- **Demo ao Vivo:** http://68.183.98.186

---

## 📄 Licença

Licença MIT - veja o arquivo [LICENSE](../LICENSE) para detalhes.

---

<div align="center">

**[⬆ Voltar ao README Principal](../README.md)**

</div>
