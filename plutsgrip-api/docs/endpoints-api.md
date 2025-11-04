# 🔗 API Endpoints - Documentação Completa

<div align="center">

**Referência completa de todos os endpoints da API do PlutusGrip Finance Tracker**

[⬅️ Voltar ao Índice](./00-indice.md)

</div>

---

## 📋 Índice

- [Informações Gerais](#-informações-gerais)
- [Autenticação](#-endpoints-de-autenticação)
- [Transações](#-endpoints-de-transações)
- [Categorias](#-endpoints-de-categorias)
- [Relatórios](#-endpoints-de-relatórios)
- [Exemplos com cURL](#-exemplos-com-curl)
- [Exemplos com Fetch](#-exemplos-com-fetch)
- [Exemplos com Axios](#-exemplos-com-axios)
- [Tratamento de Erros](#-tratamento-de-erros)
- [Segurança](#-considerações-de-segurança)
- [Versionamento](#-versionamento-da-api)

---

## 📡 Informações Gerais

### 1.1 URL Base
```
http://localhost:8000/api
```

**Produção:** `https://api.plutusgrip.com/api`

### 1.2 Autenticação
A maioria dos endpoints requer autenticação via JWT (JSON Web Token).

**Método de autenticação:**
```
Authorization: Bearer <token>
```

### 1.3 Formato de Requisição/Resposta
- **Content-Type:** `application/json`
- **Charset:** UTF-8

### 1.4 Códigos de Status HTTP

| Código | Significado | Descrição |
|--------|-------------|-----------|
| 200 | OK | Requisição bem-sucedida |
| 201 | Created | Recurso criado com sucesso |
| 400 | Bad Request | Dados inválidos ou ausentes |
| 401 | Unauthorized | Token ausente ou inválido |
| 403 | Forbidden | Acesso negado |
| 404 | Not Found | Recurso não encontrado |
| 409 | Conflict | Conflito (ex: email já cadastrado) |
| 500 | Internal Server Error | Erro interno do servidor |

### 1.5 Estrutura de Erro Padrão
```json
{
  "error": "Mensagem de erro descritiva"
}
```

---

## 🔐 Endpoints de Autenticação

### 2.1 Registrar Novo Usuário

**Endpoint:** `POST /api/auth/register`

**Autenticação:** Não requerida

**Descrição:** Cria uma nova conta de usuário no sistema.

**Request Body:**
```json
{
  "name": "João Silva",
  "email": "joao@email.com",
  "password": "senha123",
  "password_confirmation": "senha123"
}
```

**Campos:**
| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| name | string | Sim | Nome completo do usuário |
| email | string | Sim | Email único do usuário |
| password | string | Sim | Senha (mínimo recomendado: 6 caracteres) |
| password_confirmation | string | Não | Confirmação da senha |

**Response (201 Created):**
```json
{
  "message": "Usuário registrado com sucesso",
  "user": {
    "id": "1001",
    "name": "João Silva",
    "email": "joao@email.com",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**Erros Possíveis:**
- `400`: Campos obrigatórios ausentes
- `409`: Email já cadastrado

---

### 2.2 Login de Usuário

**Endpoint:** `POST /api/auth/login`

**Autenticação:** Não requerida

**Descrição:** Autentica usuário e retorna token JWT.

**Request Body:**
```json
{
  "email": "joao@email.com",
  "password": "senha123"
}
```

**Campos:**
| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| email | string | Sim | Email do usuário |
| password | string | Sim | Senha do usuário |

**Response (200 OK):**
```json
{
  "message": "Login realizado com sucesso",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expires_in": 86400,
  "user": {
    "id": "1001",
    "name": "João Silva",
    "email": "joao@email.com"
  }
}
```

**Campos de Resposta:**
| Campo | Tipo | Descrição |
|-------|------|-----------|
| token | string | Token JWT para autenticação |
| expires_in | number | Tempo de expiração em segundos |
| user | object | Dados do usuário autenticado |

**Erros Possíveis:**
- `400`: Email ou senha ausentes
- `401`: Credenciais inválidas

---

### 2.3 Logout de Usuário

**Endpoint:** `POST /api/auth/logout`

**Autenticação:** Não requerida (frontend deve remover token)

**Descrição:** Realiza logout do usuário.

**Response (200 OK):**
```json
{
  "message": "Logout realizado com sucesso"
}
```

---

### 2.4 Obter Dados do Usuário Autenticado

**Endpoint:** `GET /api/auth/me`

**Autenticação:** Requerida

**Descrição:** Retorna informações do usuário autenticado.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "user": {
    "id": "1001",
    "email": "joao@email.com"
  }
}
```

**Erros Possíveis:**
- `401`: Token ausente
- `403`: Token inválido ou expirado

---

## 💳 Endpoints de Transações

### 3.1 Listar Transações

**Endpoint:** `GET /api/transactions`

**Autenticação:** Requerida

**Descrição:** Retorna todas as transações do usuário autenticado.

**Query Parameters (Opcionais):**
| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| type | string | Filtrar por tipo: "income" ou "expense" |
| category | string | Filtrar por categoria |

**Exemplos:**
```
GET /api/transactions
GET /api/transactions?type=expense
GET /api/transactions?category=Food & Dining
GET /api/transactions?type=income&category=Salary
```

**Response (200 OK):**
```json
{
  "transactions": [
    {
      "id": "2001",
      "userId": "1001",
      "description": "Supermercado",
      "amount": 150.50,
      "date": "2024-01-15",
      "category": "Food & Dining",
      "type": "expense",
      "notes": "Compras da semana",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    },
    {
      "id": "2002",
      "userId": "1001",
      "description": "Salário",
      "amount": 3500.00,
      "date": "2024-01-05",
      "category": "Income",
      "type": "income",
      "notes": "",
      "createdAt": "2024-01-05T08:00:00.000Z",
      "updatedAt": "2024-01-05T08:00:00.000Z"
    }
  ],
  "total": 2
}
```

---

### 3.2 Obter Transação Específica

**Endpoint:** `GET /api/transactions/:id`

**Autenticação:** Requerida

**Descrição:** Retorna detalhes de uma transação específica.

**Path Parameters:**
| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| id | string | ID da transação |

**Response (200 OK):**
```json
{
  "transaction": {
    "id": "2001",
    "userId": "1001",
    "description": "Supermercado",
    "amount": 150.50,
    "date": "2024-01-15",
    "category": "Food & Dining",
    "type": "expense",
    "notes": "Compras da semana",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**Erros Possíveis:**
- `404`: Transação não encontrada

---

### 3.3 Criar Nova Transação

**Endpoint:** `POST /api/transactions`

**Autenticação:** Requerida

**Descrição:** Cria uma nova transação financeira.

**Request Body:**
```json
{
  "description": "Supermercado",
  "amount": 150.50,
  "date": "2024-01-15",
  "category": "Food & Dining",
  "type": "expense",
  "notes": "Compras da semana"
}
```

**Campos:**
| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| description | string | Sim | Descrição da transação |
| amount | number | Sim | Valor da transação |
| date | string | Sim | Data no formato YYYY-MM-DD |
| category | string | Sim | Categoria da transação |
| type | string | Sim | Tipo: "income" ou "expense" |
| notes | string | Não | Observações adicionais |

**Response (201 Created):**
```json
{
  "message": "Transação criada com sucesso",
  "transaction": {
    "id": "2003",
    "userId": "1001",
    "description": "Supermercado",
    "amount": 150.50,
    "date": "2024-01-15",
    "category": "Food & Dining",
    "type": "expense",
    "notes": "Compras da semana",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**Erros Possíveis:**
- `400`: Campos obrigatórios ausentes ou tipo inválido

---

### 3.4 Atualizar Transação

**Endpoint:** `PUT /api/transactions/:id`

**Autenticação:** Requerida

**Descrição:** Atualiza uma transação existente.

**Path Parameters:**
| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| id | string | ID da transação |

**Request Body (todos os campos opcionais):**
```json
{
  "description": "Supermercado Extra",
  "amount": 175.00,
  "notes": "Compras da semana + produtos de limpeza"
}
```

**Response (200 OK):**
```json
{
  "message": "Transação atualizada com sucesso",
  "transaction": {
    "id": "2001",
    "userId": "1001",
    "description": "Supermercado Extra",
    "amount": 175.00,
    "date": "2024-01-15",
    "category": "Food & Dining",
    "type": "expense",
    "notes": "Compras da semana + produtos de limpeza",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T15:45:00.000Z"
  }
}
```

**Erros Possíveis:**
- `404`: Transação não encontrada

---

### 3.5 Remover Transação

**Endpoint:** `DELETE /api/transactions/:id`

**Autenticação:** Requerida

**Descrição:** Remove uma transação permanentemente.

**Path Parameters:**
| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| id | string | ID da transação |

**Response (200 OK):**
```json
{
  "message": "Transação removida com sucesso"
}
```

**Erros Possíveis:**
- `404`: Transação não encontrada

---

## 🏷️ Endpoints de Categorias

### 4.1 Listar Categorias

**Endpoint:** `GET /api/categories`

**Autenticação:** Requerida

**Descrição:** Retorna todas as categorias disponíveis.

**Query Parameters (Opcionais):**
| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| type | string | Filtrar por tipo: "income" ou "expense" |

**Response (200 OK):**
```json
{
  "categories": [
    {
      "id": "1",
      "name": "Food & Dining",
      "type": "expense",
      "color": "#ef4444",
      "icon": "utensils"
    },
    {
      "id": "2",
      "name": "Transportation",
      "type": "expense",
      "color": "#f59e0b",
      "icon": "car"
    },
    {
      "id": "6",
      "name": "Income",
      "type": "income",
      "color": "#10b981",
      "icon": "dollar-sign"
    }
  ],
  "total": 3
}
```

---

### 4.2 Obter Categoria Específica

**Endpoint:** `GET /api/categories/:id`

**Autenticação:** Requerida

**Descrição:** Retorna detalhes de uma categoria específica.

**Response (200 OK):**
```json
{
  "category": {
    "id": "1",
    "name": "Food & Dining",
    "type": "expense",
    "color": "#ef4444",
    "icon": "utensils"
  }
}
```

**Erros Possíveis:**
- `404`: Categoria não encontrada

---

## 📊 Endpoints de Relatórios

### 5.1 Dashboard

**Endpoint:** `GET /api/reports/dashboard`

**Autenticação:** Requerida

**Descrição:** Retorna dados resumidos para o dashboard principal.

**Response (200 OK):**
```json
{
  "summary": {
    "totalIncome": 5000.00,
    "totalExpense": 2345.67,
    "balance": 2654.33,
    "transactionCount": 45
  },
  "recentTransactions": [
    {
      "id": "2050",
      "description": "Aluguel",
      "amount": 1200.00,
      "date": "2024-01-15",
      "category": "Bills",
      "type": "expense"
    },
    {
      "id": "2049",
      "description": "Freelance",
      "amount": 800.00,
      "date": "2024-01-14",
      "category": "Freelance",
      "type": "income"
    }
  ]
}
```

---

### 5.2 Resumo Financeiro

**Endpoint:** `GET /api/reports/summary`

**Autenticação:** Requerida

**Descrição:** Retorna resumo financeiro detalhado com opção de filtros.

**Query Parameters (Opcionais):**
| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| startDate | string | Data inicial (YYYY-MM-DD) |
| endDate | string | Data final (YYYY-MM-DD) |

**Exemplo:**
```
GET /api/reports/summary?startDate=2024-01-01&endDate=2024-01-31
```

**Response (200 OK):**
```json
{
  "byCategory": [
    {
      "category": "Food & Dining",
      "type": "expense",
      "total": 450.00,
      "count": 12
    },
    {
      "category": "Transportation",
      "type": "expense",
      "total": 200.00,
      "count": 8
    },
    {
      "category": "Income",
      "type": "income",
      "total": 3500.00,
      "count": 2
    }
  ],
  "byMonth": [
    {
      "month": "2024-01",
      "income": 3500.00,
      "expense": 1234.56
    },
    {
      "month": "2024-02",
      "income": 3500.00,
      "expense": 1456.78
    }
  ],
  "period": {
    "startDate": "2024-01-01",
    "endDate": "2024-01-31"
  }
}
```

---

## 💻 Exemplos com cURL

### 6.1 Registro
```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "João Silva",
    "email": "joao@email.com",
    "password": "senha123"
  }'
```

### 6.2 Login
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "joao@email.com",
    "password": "senha123"
  }'
```

### 6.3 Criar Transação
```bash
curl -X POST http://localhost:8000/api/transactions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <seu_token_aqui>" \
  -d '{
    "description": "Supermercado",
    "amount": 150.50,
    "date": "2024-01-15",
    "category": "Food & Dining",
    "type": "expense",
    "notes": "Compras da semana"
  }'
```

### 6.4 Listar Transações
```bash
curl -X GET http://localhost:8000/api/transactions \
  -H "Authorization: Bearer <seu_token_aqui>"
```

### 6.5 Dashboard
```bash
curl -X GET http://localhost:8000/api/reports/dashboard \
  -H "Authorization: Bearer <seu_token_aqui>"
```

---

## 🚀 Exemplos com Fetch (JavaScript)

### 7.1 Login
```javascript
const response = await fetch('http://localhost:8000/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email: 'joao@email.com',
    password: 'senha123'
  })
})

const data = await response.json()
const token = data.token

// Armazenar token
localStorage.setItem('jwt_token', token)
```

### 7.2 Requisição Autenticada
```javascript
const token = localStorage.getItem('jwt_token')

const response = await fetch('http://localhost:8000/api/transactions', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
})

const data = await response.json()
console.log(data.transactions)
```

### 7.3 Criar Transação
```javascript
const token = localStorage.getItem('jwt_token')

const response = await fetch('http://localhost:8000/api/transactions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    description: 'Supermercado',
    amount: 150.50,
    date: '2024-01-15',
    category: 'Food & Dining',
    type: 'expense',
    notes: 'Compras da semana'
  })
})

const data = await response.json()
console.log(data.transaction)
```

---

## ⚡ Exemplos com Axios (TypeScript)

Axios é a biblioteca HTTP recomendada para o projeto PlutusGrip.

### 8.1 Configuração Base do Axios

```typescript
// src/services/api.ts
import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 segundos
})

// Interceptor para adicionar JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('jwt_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Interceptor para tratamento de erros
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado ou inválido
      localStorage.removeItem('jwt_token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api
```

### 8.2 Service Layer - Autenticação

```typescript
// src/services/authService.ts
import api from './api'

interface LoginResponse {
  message: string
  token: string
  expires_in: number
  user: {
    id: string
    name: string
    email: string
  }
}

interface RegisterData {
  name: string
  email: string
  password: string
  password_confirmation?: string
}

export const authService = {
  register: async (data: RegisterData) => {
    const response = await api.post<LoginResponse>('/auth/register', data)
    return response.data
  },

  login: async (email: string, password: string) => {
    const response = await api.post<LoginResponse>('/auth/login', {
      email,
      password,
    })
    return response.data
  },

  logout: async () => {
    const response = await api.post('/auth/logout')
    return response.data
  },

  getUser: async () => {
    const response = await api.get('/auth/me')
    return response.data
  },
}
```

### 8.3 Service Layer - Transações

```typescript
// src/services/transactionService.ts
import api from './api'

export interface Transaction {
  id: string
  userId: string
  description: string
  amount: number
  date: string
  category: string
  type: 'income' | 'expense'
  notes?: string
  createdAt: string
  updatedAt: string
}

interface TransactionsResponse {
  transactions: Transaction[]
  total: number
}

interface CreateTransactionData {
  description: string
  amount: number
  date: string
  category: string
  type: 'income' | 'expense'
  notes?: string
}

export const transactionService = {
  getAll: async (filters?: { type?: string; category?: string }) => {
    const params = new URLSearchParams()
    if (filters?.type) params.append('type', filters.type)
    if (filters?.category) params.append('category', filters.category)

    const response = await api.get<TransactionsResponse>(
      `/transactions?${params.toString()}`
    )
    return response.data
  },

  getById: async (id: string) => {
    const response = await api.get<{ transaction: Transaction }>(
      `/transactions/${id}`
    )
    return response.data.transaction
  },

  create: async (data: CreateTransactionData) => {
    const response = await api.post<{
      message: string
      transaction: Transaction
    }>('/transactions', data)
    return response.data.transaction
  },

  update: async (id: string, data: Partial<CreateTransactionData>) => {
    const response = await api.put<{
      message: string
      transaction: Transaction
    }>(`/transactions/${id}`, data)
    return response.data.transaction
  },

  delete: async (id: string) => {
    const response = await api.delete<{ message: string }>(
      `/transactions/${id}`
    )
    return response.data
  },
}
```

### 8.4 Service Layer - Categorias

```typescript
// src/services/categoryService.ts
import api from './api'

export interface Category {
  id: string
  name: string
  type: 'income' | 'expense'
  color: string
  icon: string
}

interface CategoriesResponse {
  categories: Category[]
  total: number
}

export const categoryService = {
  getAll: async (type?: 'income' | 'expense') => {
    const params = type ? `?type=${type}` : ''
    const response = await api.get<CategoriesResponse>(`/categories${params}`)
    return response.data
  },

  getById: async (id: string) => {
    const response = await api.get<{ category: Category }>(`/categories/${id}`)
    return response.data.category
  },
}
```

### 8.5 Service Layer - Relatórios

```typescript
// src/services/reportService.ts
import api from './api'

interface DashboardSummary {
  summary: {
    totalIncome: number
    totalExpense: number
    balance: number
    transactionCount: number
  }
  recentTransactions: Array<{
    id: string
    description: string
    amount: number
    date: string
    category: string
    type: 'income' | 'expense'
  }>
}

interface FinancialSummary {
  byCategory: Array<{
    category: string
    type: 'income' | 'expense'
    total: number
    count: number
  }>
  byMonth: Array<{
    month: string
    income: number
    expense: number
  }>
  period: {
    startDate: string
    endDate: string
  }
}

export const reportService = {
  getDashboard: async () => {
    const response = await api.get<DashboardSummary>('/reports/dashboard')
    return response.data
  },

  getSummary: async (startDate?: string, endDate?: string) => {
    const params = new URLSearchParams()
    if (startDate) params.append('startDate', startDate)
    if (endDate) params.append('endDate', endDate)

    const response = await api.get<FinancialSummary>(
      `/reports/summary?${params.toString()}`
    )
    return response.data
  },
}
```

### 8.6 Uso nos Componentes React

```typescript
// Exemplo de uso em um componente React
import { useEffect, useState } from 'react'
import { transactionService, type Transaction } from '@/services/transactionService'
import { useToast } from '@/hooks/use-toast'

export const TransactionList = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true)
        const data = await transactionService.getAll()
        setTransactions(data.transactions)
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to load transactions',
          variant: 'destructive',
        })
      } finally {
        setLoading(false)
      }
    }

    fetchTransactions()
  }, [toast])

  const handleDelete = async (id: string) => {
    try {
      await transactionService.delete(id)
      setTransactions(prev => prev.filter(t => t.id !== id))
      toast({
        title: 'Success',
        description: 'Transaction deleted successfully',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete transaction',
        variant: 'destructive',
      })
    }
  }

  if (loading) return <div>Loading...</div>

  return (
    <div>
      {transactions.map(transaction => (
        <div key={transaction.id}>
          <span>{transaction.description}</span>
          <span>${transaction.amount}</span>
          <button onClick={() => handleDelete(transaction.id)}>Delete</button>
        </div>
      ))}
    </div>
  )
}
```

---

## ⚠️ Tratamento de Erros

### Estrutura de Erro Padrão da API

```typescript
interface APIError {
  error: string
  details?: Record<string, string[]> // Erros de validação
  code?: string // Código de erro customizado
}
```

### Tratamento com Try-Catch

```typescript
import { AxiosError } from 'axios'

try {
  const transaction = await transactionService.create(data)
  console.log('Success:', transaction)
} catch (error) {
  if (error instanceof AxiosError) {
    // Erro da API
    if (error.response) {
      // Status code fora da faixa 2xx
      const apiError = error.response.data as APIError
      console.error('API Error:', apiError.error)

      // Tratar erros específicos
      switch (error.response.status) {
        case 400:
          console.error('Bad request:', apiError.details)
          break
        case 401:
          console.error('Unauthorized - redirect to login')
          break
        case 404:
          console.error('Resource not found')
          break
        case 500:
          console.error('Server error')
          break
      }
    } else if (error.request) {
      // Request foi feito mas sem resposta
      console.error('No response from server')
    } else {
      // Erro ao configurar request
      console.error('Request setup error:', error.message)
    }
  } else {
    // Erro não relacionado ao Axios
    console.error('Unexpected error:', error)
  }
}
```

### Helper de Tratamento de Erros

```typescript
// src/utils/error-handler.ts
import { AxiosError } from 'axios'

export const getErrorMessage = (error: unknown): string => {
  if (error instanceof AxiosError) {
    if (error.response?.data?.error) {
      return error.response.data.error
    }
    if (error.response?.status === 401) {
      return 'Authentication required. Please login again.'
    }
    if (error.response?.status === 403) {
      return 'Access denied.'
    }
    if (error.response?.status === 404) {
      return 'Resource not found.'
    }
    if (error.response?.status === 500) {
      return 'Server error. Please try again later.'
    }
    if (error.request) {
      return 'Network error. Please check your connection.'
    }
  }

  return 'An unexpected error occurred.'
}

// Uso:
try {
  await transactionService.create(data)
} catch (error) {
  const message = getErrorMessage(error)
  toast({ title: 'Error', description: message, variant: 'destructive' })
}
```

---

## 🔒 Considerações de Segurança

### 8.1 Proteção de Tokens
- Nunca compartilhe tokens
- Armazene tokens de forma segura
- Use HTTPS em produção
- Implemente refresh tokens para sessões longas

### 8.2 Rate Limiting
**Recomendação para produção:**
- 100 requisições por 15 minutos por IP
- 5 tentativas de login por 15 minutos

### 8.3 Validação
- Todos os inputs são validados
- Sanitização de dados do usuário
- Proteção contra SQL Injection (quando usar banco real)
- Proteção contra XSS

---

## 📌 Versionamento da API

### Versão Atual

**Versão:** v1 (atual)
**URL Base:** `http://localhost:8000/api`
**Status:** Estável

### Política de Versionamento

Seguimos o padrão [Semantic Versioning](https://semver.org/):

- **Major (v1, v2, v3...)**: Breaking changes - mudanças incompatíveis
- **Minor**: Novas funcionalidades compatíveis
- **Patch**: Correções de bugs

### URL Base Versionada (Futuro)

Quando houver breaking changes, uma nova versão será criada:

```
http://localhost:8000/api/v1  # Versão atual
http://localhost:8000/api/v2  # Próxima versão (futura)
```

### Política de Breaking Changes

- ✅ Novas versões mantidas em paralelo por **no mínimo 6 meses**
- ✅ Deprecação comunicada com **3 meses de antecedência**
- ✅ Changelog mantido atualizado
- ✅ Documentação de migração fornecida

### Changelog

#### v1.0.0 (Atual)
- ✅ Endpoints de autenticação (login, registro, logout)
- ✅ CRUD completo de transações
- ✅ Listagem de categorias
- ✅ Relatórios de dashboard e resumo financeiro

---

## 📚 Recursos Adicionais

### Documentação Relacionada

- [Arquitetura do Projeto](./02-arquitetura.md)
- [Catálogo de Componentes](./07-componentes.md)
- [Guia de Desenvolvimento](./09-guia-desenvolvimento.md)
- [Testes](./05-testes.md)

### Ferramentas Úteis

- [Postman Collection](https://www.postman.com/) - Coleção de endpoints para testes
- [Insomnia](https://insomnia.rest/) - Cliente REST alternativo
- [Thunder Client](https://www.thunderclient.com/) - Extensão VS Code

### Status do Backend

> **⚠️ Nota:** Atualmente, o projeto utiliza mocks no frontend para desenvolvimento. Para conectar um backend real, implemente os services descritos na seção de [Exemplos com Axios](#-exemplos-com-axios-typescript).

---

## 🎯 Resumo de Endpoints

### Tabela Completa

| Endpoint | Método | Autenticação | Descrição |
|----------|--------|--------------|-----------|
| `/auth/register` | POST | ❌ Não | Registrar novo usuário |
| `/auth/login` | POST | ❌ Não | Login de usuário |
| `/auth/logout` | POST | ❌ Não | Logout de usuário |
| `/auth/me` | GET | ✅ Sim | Obter dados do usuário |
| `/transactions` | GET | ✅ Sim | Listar transações |
| `/transactions/:id` | GET | ✅ Sim | Obter transação específica |
| `/transactions` | POST | ✅ Sim | Criar transação |
| `/transactions/:id` | PUT | ✅ Sim | Atualizar transação |
| `/transactions/:id` | DELETE | ✅ Sim | Remover transação |
| `/categories` | GET | ✅ Sim | Listar categorias |
| `/categories/:id` | GET | ✅ Sim | Obter categoria específica |
| `/reports/dashboard` | GET | ✅ Sim | Dados do dashboard |
| `/reports/summary` | GET | ✅ Sim | Resumo financeiro |

### Estatísticas

- **Total de Endpoints:** 13
- **Endpoints Públicos:** 3
- **Endpoints Protegidos:** 10
- **Métodos:** GET (7), POST (3), PUT (1), DELETE (1)

---

<div align="center">

**🔗 Documentação completa de API do PlutusGrip Finance Tracker**

*Última atualização: Outubro 2025*

[⬆️ Voltar ao Topo](#-api-endpoints---documentação-completa) • [⬅️ Voltar ao Índice](./00-indice.md)

</div>
