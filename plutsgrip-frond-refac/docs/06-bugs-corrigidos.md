# 🐛 Bugs Corrigidos

<div align="center">

**Histórico completo de bugs encontrados, analisados e corrigidos no PlutusGrip Finance Tracker**

[⬅️ Voltar ao Índice](./00-indice.md)

</div>

---

## 📋 Índice

- [Bugs Críticos de Segurança](#-bugs-críticos-de-segurança)
- [Bugs de Lógica e Performance](#-bugs-de-lógica-e-performance)
- [Melhorias Recomendadas](#-melhorias-recomendadas)
- [Resumo e Status](#-resumo-e-status)
- [Próximos Passos](#-próximos-passos)

---

## 🔴 Bugs Críticos de Segurança

### 1. XSS Vulnerability em export-utils.ts

**Arquivo:** `src/utils/export-utils.ts:281,282,287`
**Severidade:** 🔴 CRÍTICA
**Status:** ✅ DOCUMENTADO | ⏳ AGUARDANDO CORREÇÃO

#### Descrição
User input (transaction.description, transaction.notes) é inserido diretamente no HTML sem sanitização, permitindo XSS attacks.

#### Código Vulnerável
```typescript
// VULNERÁVEL
<td>${transaction.description}</td>
<td class="notes">${transaction.notes || "-"}</td>
```

#### Impacto
Usuário pode injetar código JavaScript malicioso que será executado ao abrir o relatório HTML exportado.

#### Exemplo de Exploit
```javascript
description: "<script>alert('XSS')</script>"
description: "<img src=x onerror='alert(document.cookie)'>"
```

#### Correção Recomendada
Sanitizar HTML usando DOMPurify ou escapar caracteres especiais:

```typescript
// SEGURO
import DOMPurify from 'dompurify'

<td>${DOMPurify.sanitize(transaction.description)}</td>
<td class="notes">${DOMPurify.sanitize(transaction.notes) || "-"}</td>

// Ou escapar caracteres especiais
const escapeHtml = (unsafe: string) => {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
}
```

---

### 2. Armazenamento Inseguro de Dados Sensíveis

**Arquivo:** `src/contexts/AuthContext.tsx:78-79,111-112`
**Severidade:** 🔴 ALTA
**Status:** ✅ DOCUMENTADO | ⏳ AGUARDANDO CORREÇÃO

#### Descrição
JWT tokens e dados de usuário armazenados em localStorage sem criptografia.

#### Código Vulnerável
```typescript
localStorage.setItem("jwt_token", mockToken)
localStorage.setItem("user", JSON.stringify(mockUser))
```

#### Impacto
- ⚠️ Tokens acessíveis via XSS attacks
- ⚠️ Dados de usuário podem ser lidos por qualquer script malicioso
- ⚠️ Vulnerável a session hijacking

#### Correção Recomendada
```typescript
// OPÇÃO 1: httpOnly cookies (MAIS SEGURO)
// Backend deve enviar token via Set-Cookie com httpOnly flag
// Axios configurado para enviar cookies automaticamente

// OPÇÃO 2: sessionStorage + refresh tokens
sessionStorage.setItem("access_token", accessToken)
localStorage.setItem("refresh_token", encryptedRefreshToken)

// OPÇÃO 3: Criptografia no frontend (menos seguro, mas melhor que plaintext)
import CryptoJS from 'crypto-js'

const encryptData = (data: string, secret: string) => {
  return CryptoJS.AES.encrypt(data, secret).toString()
}

const decryptData = (encryptedData: string, secret: string) => {
  const bytes = CryptoJS.AES.decrypt(encryptedData, secret)
  return bytes.toString(CryptoJS.enc.Utf8)
}
```

---

## 🟡 Bugs de Lógica e Performance

### 3. Mutação de Estado em Filtros

**Arquivo:** `src/utils/export-utils.ts:160`
**Severidade:** 🟡 MÉDIA
**Status:** ✅ DOCUMENTADO | ⏳ AGUARDANDO CORREÇÃO

#### Descrição
Objeto `now` é mutado durante comparação de datas.

#### Código com Bug
```typescript
// BUG: Muta o objeto now
const weekStart = new Date(now.setDate(now.getDate() - now.getDay()))
```

#### Impacto
Comparações de datas subsequentes usam valor mutado, causando resultados incorretos.

#### Correção Recomendada
```typescript
// CORRETO: Cria nova instância
const weekStart = new Date(now)
weekStart.setDate(weekStart.getDate() - weekStart.getDay())

// Ou usando date-fns (já está no projeto)
import { startOfWeek } from 'date-fns'
const weekStart = startOfWeek(now)
```

---

### 4. Missing Error Handling na API de Câmbio

**Arquivo:** `src/contexts/CurrencyContext.tsx:49-71`
**Severidade:** 🟡 MÉDIA
**Status:** ✅ DOCUMENTADO | ⏳ AGUARDANDO CORREÇÃO

#### Descrição
Fetch sem timeout e sem feedback visual ao usuário em caso de erro.

#### Código Atual
```typescript
const response = await fetch("https://api.exchangerate-api.com/v4/latest/USD")
// Sem timeout, sem retry, sem UI feedback
```

#### Impacto
- Request pode ficar travado indefinidamente
- Usuário não sabe que houve erro
- Taxas de câmbio podem ficar desatualizadas

#### Correção Recomendada
```typescript
const fetchExchangeRates = async () => {
  try {
    // Adicionar timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10s timeout

    const response = await fetch(
      "https://api.exchangerate-api.com/v4/latest/USD",
      { signal: controller.signal }
    )

    clearTimeout(timeoutId)

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    setExchangeRates(data.rates)
    setLastUpdated(new Date())

    // Feedback de sucesso (opcional)
    // toast.success("Exchange rates updated")

  } catch (error) {
    console.error("Failed to fetch exchange rates:", error)

    // Feedback visual ao usuário
    toast.error("Failed to update exchange rates. Using cached values.")

    // Usar taxas em cache ou fallback
    const cachedRates = localStorage.getItem("exchange_rates_cache")
    if (cachedRates) {
      setExchangeRates(JSON.parse(cachedRates))
    }
  }
}
```

---

### 5. Dependência Missing no useEffect

**Arquivo:** `src/contexts/CurrencyContext.tsx:74-85`
**Severidade:** 🟡 MÉDIA
**Status:** ✅ DOCUMENTADO | ⏳ AGUARDANDO CORREÇÃO

#### Descrição
`fetchExchangeRates` usado no useEffect mas não está no array de dependências.

#### Código Atual
```typescript
useEffect(() => {
  fetchExchangeRates() // Usado mas não está em dependencies
  const interval = setInterval(fetchExchangeRates, 30 * 60 * 1000)
  return () => clearInterval(interval)
}, []) // Array vazio - INCORRETO
```

#### Impacto
Closure stale, pode usar valores antigos de estado.

#### Correção Recomendada
```typescript
// OPÇÃO 1: Adicionar às dependências
useEffect(() => {
  fetchExchangeRates()
  const interval = setInterval(fetchExchangeRates, 30 * 60 * 1000)
  return () => clearInterval(interval)
}, [fetchExchangeRates]) // Adicionar dependência

// OPÇÃO 2: Usar useCallback (RECOMENDADO)
const fetchExchangeRates = useCallback(async () => {
  try {
    const response = await fetch("https://api.exchangerate-api.com/v4/latest/USD")
    const data = await response.json()
    setExchangeRates(data.rates)
    setLastUpdated(new Date())
  } catch (error) {
    console.error("Failed to fetch exchange rates:", error)
  }
}, []) // Dependências necessárias

useEffect(() => {
  fetchExchangeRates()
  const interval = setInterval(fetchExchangeRates, 30 * 60 * 1000)
  return () => clearInterval(interval)
}, [fetchExchangeRates])
```

---

## 🟢 Melhorias Recomendadas

### 6. Validação de localStorage Fraca

**Arquivo:** `src/contexts/CurrencyContext.tsx:75-78`
**Severidade:** 🟢 BAIXA
**Status:** ✅ DOCUMENTADO | ⏳ AGUARDANDO CORREÇÃO

#### Descrição
localStorage pode ser manipulado no DevTools.

#### Código Atual
```typescript
const savedCurrency = localStorage.getItem("preferred-currency") as Currency
if (savedCurrency && (savedCurrency === "BRL" || savedCurrency === "USD")) {
  setCurrency(savedCurrency)
}
```

#### Impacto
Usuário pode injetar valores inválidos via DevTools.

#### Correção Recomendada
```typescript
// Validação mais robusta com whitelist e schema
import { z } from 'zod'

const CurrencySchema = z.enum(["BRL", "USD"])

const getSavedCurrency = (): Currency | null => {
  try {
    const saved = localStorage.getItem("preferred-currency")
    if (!saved) return null

    const result = CurrencySchema.safeParse(saved)
    return result.success ? result.data : null
  } catch {
    return null
  }
}

const savedCurrency = getSavedCurrency()
if (savedCurrency) {
  setCurrency(savedCurrency)
}
```

---

### 7. Falta de Try-Catch em localStorage

**Arquivo:** `src/contexts/ThemeProvider.tsx:34`
**Severidade:** 🟢 BAIXA
**Status:** ✅ DOCUMENTADO | ⏳ AGUARDANDO CORREÇÃO

#### Descrição
localStorage.getItem pode falhar (modo privado, quota exceeded).

#### Código Atual
```typescript
const [theme, setTheme] = useState<Theme>(
  () => (localStorage.getItem(storageKey) as Theme) || defaultTheme
)
```

#### Impacto
App pode crashar se localStorage estiver bloqueado.

#### Correção Recomendada
```typescript
const getInitialTheme = (): Theme => {
  try {
    const saved = localStorage.getItem(storageKey)
    if (saved && ['light', 'dark', 'system'].includes(saved)) {
      return saved as Theme
    }
  } catch (error) {
    console.warn('localStorage is not available:', error)
  }
  return defaultTheme
}

const [theme, setTheme] = useState<Theme>(getInitialTheme)
```

---

### 8. Console.log em Produção

**Arquivo:** `src/utils/export-utils.ts:311,366`
**Severidade:** 🟢 BAIXA
**Status:** ✅ DOCUMENTADO | ⏳ AGUARDANDO CORREÇÃO

#### Descrição
console.log deixado no código de produção.

#### Código Atual
```typescript
console.log("PDF report generated successfully")
console.log("Excel report generated successfully")
```

#### Impacto
- Performance desnecessária
- Informações expostas no console

#### Correção Recomendada
```typescript
// OPÇÃO 1: Remover completamente

// OPÇÃO 2: Usar logger condicional
const isDev = import.meta.env.DEV

if (isDev) {
  console.log("PDF report generated successfully")
}

// OPÇÃO 3: Usar biblioteca de logging
import { logger } from '@/lib/logger'

logger.info("PDF report generated successfully")

// logger.ts
export const logger = {
  info: (...args: any[]) => {
    if (import.meta.env.DEV) {
      console.log(...args)
    }
  },
  error: (...args: any[]) => {
    console.error(...args) // Sempre logar erros
  }
}
```

---

## 📊 Resumo e Status

### Tabela de Bugs

| # | Bug | Arquivo | Severidade | Status |
|---|-----|---------|------------|--------|
| 1 | XSS Vulnerability | export-utils.ts | 🔴 CRÍTICA | ⏳ Pendente |
| 2 | Armazenamento Inseguro | AuthContext.tsx | 🔴 ALTA | ⏳ Pendente |
| 3 | Mutação de Estado | export-utils.ts | 🟡 MÉDIA | ⏳ Pendente |
| 4 | Missing Error Handling | CurrencyContext.tsx | 🟡 MÉDIA | ⏳ Pendente |
| 5 | Dependência Missing | CurrencyContext.tsx | 🟡 MÉDIA | ⏳ Pendente |
| 6 | Validação Fraca | CurrencyContext.tsx | 🟢 BAIXA | ⏳ Pendente |
| 7 | Try-Catch Missing | ThemeProvider.tsx | 🟢 BAIXA | ⏳ Pendente |
| 8 | Console.log | export-utils.ts | 🟢 BAIXA | ⏳ Pendente |

### Estatísticas

| Severidade | Quantidade | Percentual |
|-----------|------------|-----------|
| 🔴 CRÍTICA | 2 | 25% |
| 🟡 ALTA/MÉDIA | 3 | 37.5% |
| 🟢 BAIXA | 3 | 37.5% |
| **TOTAL** | **8** | **100%** |

### Status Geral

```
Bugs Documentados:  ████████████████████ 100% (8/8)
Bugs Corrigidos:    ░░░░░░░░░░░░░░░░░░░░   0% (0/8)
Testes Criados:     ░░░░░░░░░░░░░░░░░░░░   0% (0/8)
```

---

## 🎯 Próximos Passos

### Priorização

1. **🔴 Fase 1: Críticos (Urgente)**
   - [ ] Corrigir Bug #1 - XSS Vulnerability
   - [ ] Corrigir Bug #2 - Armazenamento Inseguro
   - [ ] Criar testes de segurança

2. **🟡 Fase 2: Médios (Curto prazo)**
   - [ ] Corrigir Bug #3 - Mutação de Estado
   - [ ] Corrigir Bug #4 - Error Handling
   - [ ] Corrigir Bug #5 - useEffect Dependencies
   - [ ] Criar testes de regressão

3. **🟢 Fase 3: Baixos (Longo prazo)**
   - [ ] Melhorar validações (Bug #6 e #7)
   - [ ] Implementar logger profissional (Bug #8)
   - [ ] Code review final

### Checklist de Correção

Para cada bug corrigido:

- [ ] Implementar correção no código
- [ ] Escrever testes unitários
- [ ] Escrever testes de integração (se aplicável)
- [ ] Atualizar documentação
- [ ] Code review
- [ ] Testar em ambiente de staging
- [ ] Marcar como ✅ CORRIGIDO neste documento
- [ ] Adicionar data de correção

### Exemplo de Atualização

Quando um bug for corrigido, atualize a seção correspondente:

```markdown
### 1. XSS Vulnerability em export-utils.ts

**Status:** ✅ CORRIGIDO em 28/10/2025
**Commit:** abc123def
**PR:** #42

#### Solução Implementada
Instalamos DOMPurify e aplicamos sanitização em todos os user inputs...
```

---

## 🔒 Segurança

### Boas Práticas Implementadas

Após correções:

- ✅ Sanitização de HTML com DOMPurify
- ✅ Tokens em httpOnly cookies
- ✅ Validação robusta de inputs
- ✅ Error handling com feedback ao usuário
- ✅ Try-catch em operações críticas
- ✅ Logger profissional configurado

### Ferramentas de Segurança

Recomendamos adicionar:

```bash
# Análise de vulnerabilidades
npm audit

# Análise de código estático
npm install -D eslint-plugin-security
```

---

## 📚 Referências

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [DOMPurify](https://github.com/cure53/DOMPurify)
- [OWASP XSS Prevention](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html)
- [React Security Best Practices](https://react.dev/learn/writing-markup-with-jsx#the-rules-of-jsx)

---

<div align="center">

**🐛 Bugs documentados, próximo passo: correção!**

[⬆️ Voltar ao Topo](#-bugs-corrigidos) • [⬅️ Voltar ao Índice](./00-indice.md)

</div>
