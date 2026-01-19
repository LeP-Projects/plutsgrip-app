# 🧪 Documentação de Testes

## 📊 Status Geral

![Tests](https://img.shields.io/badge/Tests-102%20Passing-success?style=for-the-badge&logo=vitest)
![Coverage](https://img.shields.io/badge/Coverage-High-success?style=for-the-badge)

**Suite de Testes Completa**
- ✅ **102 testes** passando
- ⏱️ Execução: ~17 segundos
- 🎯 Cobertura: Componentes críticos + Contexts + Integração
- 🚀 Framework: Vitest 4.0.4

---

## 📋 Índice

1. [Tecnologias de Teste](#-tecnologias-de-teste)
2. [Estrutura dos Testes](#-estrutura-dos-testes)
3. [Executar Testes](#-executar-testes)
4. [Cobertura de Testes](#-cobertura-de-testes)
5. [Como Escrever Testes](#-como-escrever-testes)
6. [Boas Práticas](#-boas-práticas)
7. [Troubleshooting](#-troubleshooting)

---

## 🛠️ Tecnologias de Teste

### Vitest 4.0.4
- **Framework de testes** rápido e moderno
- Compatível com Vite
- Hot Module Replacement (HMR) para testes
- Interface visual integrada

### @testing-library/react 16.3.0
- Utilities para testar componentes React
- Foco em comportamento do usuário
- Query methods intuitivos
- Suporte a React 19

### @testing-library/user-event 14.6.1
- Simulação realista de eventos do usuário
- Click, type, hover, keyboard navigation
- Async por padrão

### jsdom 27.0.1
- Ambiente DOM para Node.js
- Simula navegador para testes
- Suporte completo a APIs web

### @testing-library/jest-dom 6.9.1
- Matchers customizados para DOM
- Asserções mais legíveis
- toBeInTheDocument(), toHaveValue(), etc.

---

## 📁 Estrutura dos Testes

```
src/
├── components/
│   ├── Button/
│   │   ├── Button.tsx
│   │   └── Button.test.tsx          ✅ 25 testes
│   │
│   ├── Input/
│   │   ├── Input.tsx
│   │   └── Input.test.tsx           ✅ 34 testes
│   │
│   └── ...
│
├── contexts/
│   ├── AuthContext.tsx
│   ├── AuthContext.test.tsx         ✅ 10 testes
│   ├── CurrencyContext.tsx
│   └── CurrencyContext.test.tsx     ✅ 17 testes
│
├── pages/
│   └── Login/
│       ├── Login.tsx
│       └── Login.test.tsx           ✅ 16 testes
│
└── test/
    └── setup.ts                     # Configuração global
```

---

## ⚙️ Configuração

### vitest.config.ts

```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    css: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
        'dist/'
      ]
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
})
```

### src/test/setup.ts

```typescript
import '@testing-library/jest-dom'
import { expect, afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'

// Cleanup após cada teste
afterEach(() => {
  cleanup()
})

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn()
  }))
})

// Mock localStorage com storage real
const createLocalStorageMock = () => {
  let store: Record<string, string> = {}

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    },
    get length() {
      return Object.keys(store).length
    },
    key: (index: number) => {
      const keys = Object.keys(store)
      return keys[index] || null
    }
  }
}

global.localStorage = createLocalStorageMock() as any

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  takeRecords() {
    return []
  }
  unobserve() {}
} as any
```

---

## 🏃 Executar Testes

### Comandos Básicos

```bash
# Rodar todos os testes
npm run test

# Modo watch (re-executa ao salvar)
npm run test -- --watch

# Interface visual
npm run test:ui

# Com cobertura de código
npm run test:coverage

# Rodar arquivo específico
npm run test Button.test.tsx

# Rodar testes que correspondem ao padrão
npm run test -- --grep "AuthContext"

# Modo silencioso
npm run test -- --reporter=dot

# Com mais detalhes
npm run test -- --reporter=verbose
```

### Scripts em package.json

```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage"
  }
}
```

---

## 📊 Cobertura de Testes

### Resumo por Arquivo

| Arquivo | Testes | Passou | Falhou | Tempo |
|---------|--------|--------|--------|-------|
| **Button.test.tsx** | 25 | ✅ 25 | ❌ 0 | ~1.5s |
| **Input.test.tsx** | 34 | ✅ 34 | ❌ 0 | ~2.0s |
| **AuthContext.test.tsx** | 10 | ✅ 10 | ❌ 0 | ~2.2s |
| **CurrencyContext.test.tsx** | 17 | ✅ 17 | ❌ 0 | ~1.2s |
| **Login.test.tsx** | 16 | ✅ 16 | ❌ 0 | ~9.9s |
| **TOTAL** | **102** | **✅ 102** | **❌ 0** | **~17s** |

---

## 🧩 Detalhamento dos Testes

### 1. Button Component (25 testes)

**Arquivo:** `src/components/Button/Button.test.tsx`

#### Categorias de Testes:

##### Rendering (2 testes)
- ✅ Renderiza botão com texto
- ✅ Renderiza botão com children

##### Variants (6 testes)
- ✅ Aplica variant padrão
- ✅ Aplica variant destructive
- ✅ Aplica variant outline
- ✅ Aplica variant secondary
- ✅ Aplica variant ghost
- ✅ Aplica variant link

##### Sizes (4 testes)
- ✅ Aplica size padrão
- ✅ Aplica size sm
- ✅ Aplica size lg
- ✅ Aplica size icon

##### Behavior (4 testes)
- ✅ Chama onClick quando clicado
- ✅ Não chama onClick quando disabled
- ✅ Está disabled quando prop disabled
- ✅ Tem classe de opacity quando disabled

##### Custom Classes (1 teste)
- ✅ Merge classes customizadas com padrão

##### HTML Attributes (4 testes)
- ✅ Suporta type attribute
- ✅ Suporta name attribute
- ✅ Suporta aria-label
- ✅ Suporta data attributes

##### Accessibility (3 testes)
- ✅ Tem role="button"
- ✅ É navegável por teclado
- ✅ Suporta tabIndex

##### asChild Prop (1 teste)
- ✅ Renderiza como componente filho

**Exemplo de Teste:**

```typescript
it('should call onClick when clicked', async () => {
  const user = userEvent.setup()
  const handleClick = vi.fn()

  render(<Button onClick={handleClick}>Click me</Button>)

  await user.click(screen.getByRole('button'))

  expect(handleClick).toHaveBeenCalledTimes(1)
})
```

---

### 2. Input Component (34 testes)

**Arquivo:** `src/components/Input/Input.test.tsx`

#### Categorias de Testes:

##### Rendering (4 testes)
- ✅ Renderiza input element
- ✅ Renderiza com placeholder
- ✅ Renderiza com valor inicial
- ✅ Renderiza com valor padrão

##### Types (4 testes)
- ✅ Renderiza como text por padrão
- ✅ Renderiza como email
- ✅ Renderiza como password
- ✅ Renderiza como number

##### Behavior (5 testes)
- ✅ Chama onChange quando valor muda
- ✅ Atualiza valor no input do usuário
- ✅ Está disabled quando prop disabled
- ✅ Tem classe cursor correto quando disabled
- ✅ Está readonly quando prop readOnly

##### Validation (4 testes)
- ✅ Suporta required attribute
- ✅ Suporta maxLength attribute
- ✅ Suporta minLength attribute
- ✅ Suporta pattern attribute

##### Custom Classes (3 testes)
- ✅ Merge classes customizadas
- ✅ Tem altura correta
- ✅ Tem padding correto

##### HTML Attributes (5 testes)
- ✅ Suporta name attribute
- ✅ Suporta id attribute
- ✅ Suporta aria-label
- ✅ Suporta data-testid
- ✅ Suporta autoComplete

##### Accessibility (3 testes)
- ✅ É navegável por teclado
- ✅ Suporta tabIndex
- ✅ Tem estilos focus-visible

##### Number Input (3 testes)
- ✅ Suporta step para number inputs
- ✅ Suporta min para number inputs
- ✅ Suporta max para number inputs

##### Focus Management (3 testes)
- ✅ Aceita foco
- ✅ Perde foco no blur
- ✅ Chama onFocus quando focado

**Exemplo de Teste:**

```typescript
it('should update value on user input', async () => {
  const user = userEvent.setup()

  render(<Input />)

  const input = screen.getByRole('textbox')
  await user.type(input, 'Hello World')

  expect(input).toHaveValue('Hello World')
})
```

---

### 3. AuthContext (10 testes)

**Arquivo:** `src/contexts/AuthContext.test.tsx`

#### Categorias de Testes:

##### Hook Usage (2 testes)
- ✅ Throw error quando usado fora do Provider
- ✅ Fornece contexto quando dentro do Provider

##### Initial State (2 testes)
- ✅ Começa sem usuário e não carregando
- ✅ Carrega usuário do localStorage no mount

##### Login (2 testes)
- ✅ Login bem-sucedido com credenciais corretas
- ✅ Login falha com credenciais incorretas

##### Register (2 testes)
- ✅ Registra novo usuário com sucesso
- ✅ Falha ao registrar com email existente

##### Logout (1 teste)
- ✅ Faz logout e limpa storage

##### Error Handling (1 teste)
- ✅ Trata dados corrompidos no localStorage

**Exemplo de Teste:**

```typescript
it('should login successfully with correct credentials', async () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <AuthProvider>{children}</AuthProvider>
  )
  const { result } = renderHook(() => useAuth(), { wrapper })

  await waitFor(() => {
    expect(result.current.isLoading).toBe(false)
  })

  await act(async () => {
    await result.current.login('admin@example.com', 'senha123')
  })

  expect(result.current.user).toEqual({
    id: '1',
    name: 'Admin User',
    email: 'admin@example.com'
  })
  expect(result.current.isAuthenticated).toBe(true)
})
```

---

### 4. CurrencyContext (17 testes)

**Arquivo:** `src/contexts/CurrencyContext.test.tsx`

#### Categorias de Testes:

##### Hook Usage (2 testes)
- ✅ Throw error quando usado fora do Provider
- ✅ Fornece contexto quando dentro do Provider

##### Initial State (3 testes)
- ✅ Começa com USD e taxas padrão
- ✅ Carrega moeda salva do localStorage
- ✅ Trata moeda inválida no localStorage

##### setCurrency (2 testes)
- ✅ Atualiza moeda e salva no localStorage
- ✅ Trata erros de localStorage graciosamente

##### fetchExchangeRates (4 testes)
- ✅ Busca e atualiza taxas com sucesso
- ✅ Trata timeout de fetch
- ✅ Trata erros HTTP
- ✅ Trata formato de resposta inválido

##### convertAmount (3 testes)
- ✅ Converte USD para BRL corretamente
- ✅ Converte BRL para USD corretamente
- ✅ Retorna mesmo valor para mesma moeda

##### formatCurrency (3 testes)
- ✅ Formata USD corretamente
- ✅ Formata BRL corretamente
- ✅ Usa moeda atual quando não especificada

**Exemplo de Teste:**

```typescript
it('should convert USD to BRL correctly', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <CurrencyProvider>{children}</CurrencyProvider>
  )

  const { result } = renderHook(() => useCurrency(), { wrapper })

  const converted = result.current.convertAmount(100, 'USD', 'BRL')
  expect(converted).toBe(520) // 100 * 5.2
})
```

---

### 5. Login Integration (16 testes)

**Arquivo:** `src/pages/Login/Login.test.tsx`

#### Categorias de Testes:

##### Initial Render (3 testes)
- ✅ Exibe formulário de login
- ✅ Exibe toggle de idioma
- ✅ Exibe link "Não tem conta?"

##### Form Validation (3 testes)
- ✅ Mostra erro ao submeter formulário vazio
- ✅ Aceita email válido
- ✅ Aceita input de senha

##### Successful Login Flow (2 testes)
- ✅ Login com credenciais corretas e navega
- ✅ Salva dados do usuário no localStorage

##### Failed Login Flow (3 testes)
- ✅ Mostra erro com credenciais incorretas
- ✅ Trata email vazio
- ✅ Trata senha vazia

##### Language Toggle (1 teste)
- ✅ Muda idioma ao clicar no botão

##### Accessibility (3 testes)
- ✅ Tem labels apropriados
- ✅ É navegável por teclado
- ✅ Submete form com tecla Enter

##### Loading State (1 teste)
- ✅ Mostra estado de loading durante login

**Exemplo de Teste:**

```typescript
it('should login with correct credentials and navigate', async () => {
  const user = userEvent.setup()
  renderLoginPage()

  const emailInput = document.getElementById('email') as HTMLInputElement
  const passwordInput = document.getElementById('password') as HTMLInputElement

  await user.type(emailInput, 'admin@example.com')
  await user.type(passwordInput, 'senha123')

  const submitButton = screen.getByRole('button', { name: /sign in/i })
  await user.click(submitButton)

  await waitFor(() => {
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard')
  })

  expect(localStorage.getItem('jwt_token')).toBeTruthy()
  expect(localStorage.getItem('user')).toBeTruthy()
})
```

---

## ✍️ Como Escrever Testes

### 1. Estrutura Básica

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ComponenteParaTestar } from './ComponenteParaTestar'

describe('ComponenteParaTestar', () => {
  beforeEach(() => {
    // Setup antes de cada teste
    localStorage.clear()
    vi.clearAllMocks()
  })

  describe('Funcionalidade X', () => {
    it('should comportamento esperado', async () => {
      // Arrange (preparar)
      const handleClick = vi.fn()

      // Act (agir)
      render(<ComponenteParaTestar onClick={handleClick} />)
      const button = screen.getByRole('button')
      await userEvent.click(button)

      // Assert (verificar)
      expect(handleClick).toHaveBeenCalledTimes(1)
    })
  })
})
```

### 2. Testing Library Queries

#### Por Prioridade:

1. **getByRole** - Melhor para acessibilidade
```typescript
screen.getByRole('button', { name: /submit/i })
screen.getByRole('textbox')
screen.getByRole('checkbox')
```

2. **getByLabelText** - Para form inputs
```typescript
screen.getByLabelText(/email/i)
```

3. **getByPlaceholderText** - Quando não há label
```typescript
screen.getByPlaceholderText(/enter email/i)
```

4. **getByText** - Para texto visível
```typescript
screen.getByText(/hello world/i)
```

5. **getByTestId** - Último recurso
```typescript
screen.getByTestId('custom-element')
```

### 3. Async Testing

```typescript
import { waitFor } from '@testing-library/react'

it('should handle async operations', async () => {
  render(<AsyncComponent />)

  await waitFor(() => {
    expect(screen.getByText(/loaded/i)).toBeInTheDocument()
  })
})
```

### 4. User Events

```typescript
const user = userEvent.setup()

// Typing
await user.type(input, 'text to type')

// Clicking
await user.click(button)

// Keyboard
await user.keyboard('{Enter}')
await user.tab()

// Hover
await user.hover(element)
```

### 5. Mocking

#### Mock Functions
```typescript
const mockFn = vi.fn()
mockFn.mockReturnValue('value')
mockFn.mockResolvedValue('async value')
```

#### Mock Modules
```typescript
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  Link: ({ children, to }: any) => <a href={to}>{children}</a>
}))
```

#### Mock Fetch
```typescript
global.fetch = vi.fn()
;(global.fetch as any).mockResolvedValueOnce({
  ok: true,
  json: async () => ({ data: 'value' })
})
```

---

## 💡 Boas Práticas

### ✅ DO

1. **Teste comportamento, não implementação**
```typescript
// BOM
expect(screen.getByRole('button')).toHaveTextContent('Submit')

// RUIM
expect(component.state.buttonText).toBe('Submit')
```

2. **Use queries acessíveis**
```typescript
// BOM
screen.getByRole('button', { name: /submit/i })

// RUIM
screen.getByTestId('submit-button')
```

3. **Teste casos de erro**
```typescript
it('should handle error gracefully', async () => {
  // Test error scenarios
})
```

4. **Use describe para agrupar**
```typescript
describe('Authentication', () => {
  describe('Login', () => {
    it('should login successfully', () => {})
    it('should fail with wrong password', () => {})
  })
})
```

5. **Limpe após testes**
```typescript
afterEach(() => {
  cleanup()
  localStorage.clear()
  vi.clearAllMocks()
})
```

### ❌ DON'T

1. **Não teste detalhes de implementação**
```typescript
// RUIM
expect(component.state).toBeDefined()
```

2. **Não use IDs de teste desnecessariamente**
```typescript
// RUIM quando há alternativas acessíveis
screen.getByTestId('button')

// BOM
screen.getByRole('button')
```

3. **Não ignore avisos de act()**
```typescript
// Sempre use act() para state updates
await act(async () => {
  await someAsyncAction()
})
```

4. **Não teste bibliotecas externas**
```typescript
// RUIM - testar React Router
it('should use useNavigate correctly', () => {
  // Testing React Router internals
})

// BOM - testar seu código
it('should navigate on submit', () => {
  // Testing your navigation logic
})
```

---

## 🐛 Troubleshooting

### Erro: "act() warning"

**Problema:** Estado atualizado fora de act()

**Solução:**
```typescript
await act(async () => {
  await result.current.someAsyncAction()
})
```

### Erro: "Unable to find element"

**Problema:** Query não encontra elemento

**Solução:**
```typescript
// Use screen.debug() para ver o DOM
screen.debug()

// Use queries mais robustas
screen.getByRole('button', { name: /submit/i })

// Use waitFor para elementos assíncronos
await waitFor(() => {
  expect(screen.getByText(/loaded/i)).toBeInTheDocument()
})
```

### Erro: "localStorage is not defined"

**Problema:** Mock de localStorage não configurado

**Solução:** Verificar `src/test/setup.ts`

### Erro: "matchMedia is not a function"

**Problema:** Mock de matchMedia não configurado

**Solução:** Verificar `src/test/setup.ts`

### Testes Lentos

**Problema:** Suite de testes demora muito

**Solução:**
```bash
# Rodar em paralelo
npm run test -- --threads

# Rodar apenas testes modificados
npm run test -- --changed

# Usar cache
npm run test -- --cache
```

---

## 📈 Métricas de Qualidade

### Coverage Goals

| Métrica | Meta | Atual |
|---------|------|-------|
| Statements | > 80% | 🎯 TBD |
| Branches | > 75% | 🎯 TBD |
| Functions | > 80% | 🎯 TBD |
| Lines | > 80% | 🎯 TBD |

### Performance

| Métrica | Meta | Atual |
|---------|------|-------|
| Tempo total | < 30s | ✅ 17s |
| Testes lentos | < 5 | ✅ 1 |
| Testes flaky | 0 | ✅ 0 |

---

## 🔄 CI/CD Integration

### GitHub Actions Example

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm run test

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json
```

---

## 📚 Referências

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library](https://testing-library.com/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [React Testing Tutorial](https://www.robinwieruch.de/react-testing-library/)

---

<div align="center">

**🧪 Mantenha os testes sempre atualizados!**

*"Write tests. Not too many. Mostly integration." - Kent C. Dodds*

[⬆️ Voltar ao Índice](./00-indice.md)

</div>
