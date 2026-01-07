# Documentação do Frontend - PlutusGrip

<div align="center">

**Documentação Completa do Frontend para o PlutusGrip Finance Tracker**

React 19 + TypeScript 5.9 + Vite 7 + TailwindCSS 4

[Voltar ao Índice](./INDEX.md) | [Docs do Backend](./BACKEND.md) | [Guia de Deploy](../DEPLOY_GUIDE.md)

</div>

---

## Índice

1. [Visão Geral](#visão-geral)
2. [Arquitetura](#arquitetura)
3. [Instruções de Configuração](#instruções-de-configuração)
4. [Estrutura de Componentes](#estrutura-de-componentes)
5. [Gerenciamento de Estado](#gerenciamento-de-estado)
6. [Roteamento e Páginas](#roteamento-e-páginas)
7. [Integração com API](#integração-com-api)
8. [Guia de Testes](#guia-de-testes)
9. [Build e Deployment](#build-e-deployment)
10. [Estilização com TailwindCSS](#estilização-com-tailwindcss)
11. [Fluxo de Trabalho de Desenvolvimento](#fluxo-de-trabalho-de-desenvolvimento)

---

## Visão Geral

### Stack Tecnológica

O frontend do PlutusGrip é construído com tecnologias de ponta:

| Tecnologia | Versão | Propósito |
|------------|---------|---------|
| **React** | 19.1.1 | Biblioteca UI com recursos mais recentes |
| **TypeScript** | 5.9.3 | JavaScript com segurança de tipos |
| **Vite** | 7.1.7 | Ferramenta de build ultrarrápida e servidor dev |
| **TailwindCSS** | 4.1.17 | Framework CSS utility-first |
| **React Router** | 7.9.4 | Roteamento client-side |
| **Radix UI** | Mais recente | Primitivos de componentes acessíveis |
| **Recharts** | 3.3.0 | Biblioteca de visualização de dados |
| **Zod** | 4.1.12 | Validação de schema |
| **React Hook Form** | 7.65.0 | Gerenciamento de estado de formulários |
| **Vitest** | 4.0.4 | Framework de testes unitários |
| **Playwright** | Mais recente | Testes end-to-end |

### Funcionalidades Principais

- **100% TypeScript**: Segurança de tipos completa em toda a aplicação
- **React 19 Moderno**: Usa recursos mais recentes do React incluindo React Compiler
- **Biblioteca de Componentes**: Componentes customizados construídos sobre primitivos Radix UI
- **Design Responsivo**: Abordagem mobile-first com TailwindCSS
- **Modo Escuro**: Suporte a tema integrado com next-themes
- **Validação de Formulários**: Formulários type-safe com React Hook Form + Zod
- **Visualização de Dados**: Gráficos interativos com Recharts
- **Autenticação**: Auth baseada em JWT com suporte a refresh token
- **Gerenciamento de Estado**: Context API + Custom hooks
- **Testes**: 100+ testes unitários + testes E2E com Playwright

### Estrutura do Projeto

```
plutsgrip-frond-refac/
├── public/                          # Assets estáticos
│   ├── plutus.png                  # Logo
│   └── vite.svg                    # Ícone Vite
│
├── src/
│   ├── components/                  # Componentes reutilizáveis
│   │   ├── ui/                     # Componentes UI base (Radix UI)
│   │   │   ├── button.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── input.tsx
│   │   │   ├── select.tsx
│   │   │   └── ...
│   │   │
│   │   ├── Alert/                  # Componente de alerta
│   │   ├── Badge/                  # Componente de badge
│   │   ├── Button/                 # Componente de botão
│   │   ├── Card/                   # Componente de card
│   │   ├── Chart/                  # Wrapper de gráfico
│   │   ├── Calendar/               # Componente de calendário
│   │   ├── CategoryChart/          # Gráfico de pizza de categorias
│   │   ├── CategoryManager/        # Gerenciamento de categorias
│   │   ├── CurrencySelector/       # Seletor de moeda
│   │   ├── DashboardFilters/       # Controles de filtro do dashboard
│   │   ├── ExpenseChart/           # Visualização de despesas
│   │   ├── ExpenseForm/            # Formulário de transação
│   │   ├── FloatingContactForm/    # Formulário de contato
│   │   ├── IncomeChart/            # Visualização de receitas
│   │   ├── LanguageToggle/         # Alternador de idioma
│   │   ├── ProtectedRoute/         # Guarda de rota de auth
│   │   ├── RecentTransactions/     # Lista de transações
│   │   ├── ReportsSection/         # Exibição de relatórios
│   │   ├── ThemeToggle/            # Alternador de modo escuro
│   │   └── ...
│   │
│   ├── contexts/                    # Contextos React
│   │   ├── AuthContext.tsx         # Estado de autenticação
│   │   ├── CurrencyContext.tsx     # Preferências de moeda
│   │   └── ThemeProvider.tsx       # Gerenciamento de tema
│   │
│   ├── hooks/                       # Custom React hooks
│   │   ├── useAuth.ts              # Hook de auth
│   │   ├── useCurrency.ts          # Hook de moeda
│   │   ├── useDebounce.ts          # Hook de debounce
│   │   └── ...
│   │
│   ├── pages/                       # Componentes de página
│   │   ├── Landing/                # Página inicial
│   │   │   └── Landing.tsx
│   │   ├── Login/                  # Página de login
│   │   │   ├── Login.tsx
│   │   │   └── Login.test.tsx
│   │   ├── Register/               # Página de registro
│   │   │   └── Register.tsx
│   │   └── Dashboard/              # Dashboard principal
│   │       └── Dashboard.tsx
│   │
│   ├── services/                    # Camada de serviço da API
│   │   ├── api.ts                  # Instância Axios
│   │   ├── auth.service.ts         # Chamadas da API de auth
│   │   ├── transaction.service.ts  # API de transação
│   │   ├── category.service.ts     # API de categoria
│   │   ├── budget.service.ts       # API de orçamento
│   │   ├── goal.service.ts         # API de meta
│   │   └── report.service.ts       # API de relatório
│   │
│   ├── types/                       # Tipos TypeScript
│   │   ├── auth.types.ts           # Tipos de auth
│   │   ├── transaction.types.ts    # Tipos de transação
│   │   ├── category.types.ts       # Tipos de categoria
│   │   └── ...
│   │
│   ├── utils/                       # Funções utilitárias
│   │   ├── format.ts               # Helpers de formatação
│   │   ├── date.ts                 # Utilitários de data
│   │   ├── validation.ts           # Schemas de validação
│   │   └── cn.ts                   # Utilitário de nome de classe
│   │
│   ├── App.tsx                      # Componente raiz
│   ├── main.tsx                     # Ponto de entrada da aplicação
│   ├── index.css                    # Estilos globais
│   └── vite-env.d.ts               # Definições de tipos do Vite
│
├── e2e/                             # Testes end-to-end
│   ├── auth.spec.ts                # Testes E2E de auth
│   ├── transactions.spec.ts        # Testes E2E de transação
│   └── ...
│
├── tests/                           # Testes unitários
│   └── setup.ts                    # Configuração de testes
│
├── .env.development                 # Ambiente de desenvolvimento
├── .env.production                  # Ambiente de produção
├── package.json                     # Dependências
├── tsconfig.json                    # Configuração do TypeScript
├── vite.config.ts                   # Configuração do Vite
├── tailwind.config.js               # Configuração do TailwindCSS
├── playwright.config.ts             # Configuração do Playwright
└── vitest.config.ts                 # Configuração do Vitest
```

---

## Arquitetura

### Arquitetura da Aplicação

```
┌──────────────────────────────────────────────────────┐
│                  Navegador (Cliente)                  │
└───────────────────────┬──────────────────────────────┘
                        │
┌───────────────────────▼──────────────────────────────┐
│                   React Router                        │
│              (Roteamento client-side)                 │
└───────────────────────┬──────────────────────────────┘
                        │
        ┌───────────────┴────────────────┐
        │                                │
┌───────▼────────┐              ┌───────▼────────┐
│  Páginas       │              │ Páginas        │
│  Públicas      │              │ Protegidas     │
│  - Landing     │              │  - Dashboard   │
│  - Login       │              │  - Transactions│
│  - Register    │              │  - Reports     │
└────────────────┘              └────────┬───────┘
                                         │
                        ┌────────────────┴────────────────┐
                        │                                 │
                ┌───────▼────────┐              ┌────────▼────────┐
                │ Camada Context │              │ Camada Component│
                │  - AuthContext │              │  - UI Components│
                │  - Currency    │              │  - Negócio      │
                │  - Theme       │              │  - Gráficos     │
                └───────┬────────┘              └────────┬────────┘
                        │                                │
                        └────────────┬───────────────────┘
                                     │
                        ┌────────────▼───────────────┐
                        │     Camada de Serviço      │
                        │   (Comunicação com API)    │
                        └────────────┬───────────────┘
                                     │
                        ┌────────────▼───────────────┐
                        │  API Backend (FastAPI)     │
                        │   http://68.183.98.186/api │
                        └────────────────────────────┘
```

### Hierarquia de Componentes

```
App.tsx
├── ThemeProvider
│   ├── AuthProvider
│   │   ├── CurrencyProvider
│   │   │   └── RouterProvider
│   │   │       ├── PublicRoutes
│   │   │       │   ├── Landing
│   │   │       │   ├── Login
│   │   │       │   └── Register
│   │   │       │
│   │   │       └── ProtectedRoutes
│   │   │           └── Dashboard
│   │   │               ├── DashboardFilters
│   │   │               ├── Cards de Visão Geral
│   │   │               ├── Gráficos
│   │   │               │   ├── ExpenseChart
│   │   │               │   ├── IncomeChart
│   │   │               │   └── CategoryChart
│   │   │               ├── RecentTransactions
│   │   │               ├── CategoryManager
│   │   │               └── ExpenseForm
│   │   │
│   │   └── Toaster (Notificações globais)
```

### Fluxo de Dados

```
Ação do Usuário
    ↓
Handler de Evento do Componente
    ↓
Camada de Serviço (Chamada da API)
    ↓
API Backend
    ↓
Resposta
    ↓
Atualizar Estado (Context/Local)
    ↓
Re-renderizar Componentes
    ↓
UI Atualizada
```

---

## Instruções de Configuração

### Pré-requisitos

- Node.js 20.x ou superior
- npm 10.x ou superior
- Git

### Configuração de Desenvolvimento Local

#### 1. Clonar o Repositório

```bash
git clone https://github.com/LeP-Projects/plutsgrip-app.git
cd plutsgrip-app/plutsgrip-frond-refac
```

#### 2. Instalar Dependências

```bash
npm install
```

Isso instalará todas as dependências listadas no `package.json`, incluindo:
- React 19.1.1
- TypeScript 5.9.3
- Vite 7.1.7
- TailwindCSS 4.1.17
- E 60+ outros pacotes

#### 3. Configurar Variáveis de Ambiente

Criar arquivos de ambiente:

**Desenvolvimento (.env.development):**
```env
VITE_API_URL=http://localhost:8000/api
VITE_APP_NAME=PlutusGrip
VITE_APP_VERSION=1.0.0
```

**Produção (.env.production):**
```env
VITE_API_URL=http://68.183.98.186/api
VITE_APP_NAME=PlutusGrip
VITE_APP_VERSION=1.0.0
```

**Importante:** O Vite requer que todas as variáveis de ambiente tenham o prefixo `VITE_`.

#### 4. Iniciar Servidor de Desenvolvimento

```bash
npm run dev
```

A aplicação será iniciada em **http://localhost:5173**

Funcionalidades durante o desenvolvimento:
- Hot Module Replacement (HMR)
- Fast refresh
- Type checking
- Integração ESLint

#### 5. Verificar Instalação

Abra seu navegador e navegue até:
- **Frontend:** http://localhost:5173
- **API Backend:** http://localhost:8000 (deve estar rodando separadamente)

Você deverá ver a página inicial com opções de login/registro.

### Configuração de Desenvolvimento com Docker

Para desenvolvimento containerizado:

```bash
# Da raiz do projeto
docker-compose -f docker-compose.dev.yml up

# Ou usando Makefile
make up

# Frontend estará disponível em http://localhost:5173
```

---

## Estrutura de Componentes

### Componentes UI Base

Localizados em `src/components/ui/`, estes são componentes primitivos construídos sobre Radix UI:

#### Componente Button

**Arquivo:** `src/components/ui/button.tsx`

```typescript
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/utils/cn"

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
```

**Uso:**
```typescript
import { Button } from "@/components/ui/button"

// Botão padrão
<Button>Click me</Button>

// Variantes
<Button variant="destructive">Delete</Button>
<Button variant="outline">Cancel</Button>
<Button variant="ghost">Ghost</Button>

// Tamanhos
<Button size="sm">Small</Button>
<Button size="lg">Large</Button>
<Button size="icon"><Icon /></Button>

// Desabilitado
<Button disabled>Disabled</Button>
```

#### Componente Dialog

**Arquivo:** `src/components/ui/dialog.tsx`

```typescript
import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { X } from "lucide-react"
import { cn } from "@/utils/cn"

const Dialog = DialogPrimitive.Root
const DialogTrigger = DialogPrimitive.Trigger

const DialogPortal = DialogPrimitive.Portal

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-background/80 backdrop-blur-sm",
      className
    )}
    {...props}
  />
))

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200",
        className
      )}
      {...props}
    >
      {children}
      <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100">
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPortal>
))

const DialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col space-y-1.5 text-center sm:text-left", className)} {...props} />
)

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn("text-lg font-semibold leading-none tracking-tight", className)}
    {...props}
  />
))

export { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle }
```

**Uso:**
```typescript
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

<Dialog>
  <DialogTrigger asChild>
    <Button>Open Dialog</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Dialog Title</DialogTitle>
    </DialogHeader>
    <div>Dialog content goes here</div>
  </DialogContent>
</Dialog>
```

### Componentes de Negócio

#### Componente ExpenseForm

**Arquivo:** `src/components/ExpenseForm/ExpenseForm.tsx`

```typescript
import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { transactionService } from "@/services/transaction.service"
import { useAuth } from "@/hooks/useAuth"
import { toast } from "sonner"

const transactionSchema = z.object({
  description: z.string().min(1, "Description is required"),
  amount: z.number().positive("Amount must be positive"),
  type: z.enum(["income", "expense"]),
  category_id: z.number().optional(),
  date: z.date(),
  notes: z.string().optional(),
  tags: z.string().optional(),
})

type TransactionFormData = z.infer<typeof transactionSchema>

export function ExpenseForm({ onSuccess }: { onSuccess?: () => void }) {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: "expense",
      date: new Date(),
    },
  })

  const onSubmit = async (data: TransactionFormData) => {
    try {
      setIsLoading(true)
      await transactionService.createTransaction({
        ...data,
        user_id: user!.id,
      })
      toast.success("Transaction created successfully")
      reset()
      onSuccess?.()
    } catch (error) {
      toast.error("Failed to create transaction")
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="description">Description</Label>
        <Input
          id="description"
          {...register("description")}
          placeholder="e.g., Grocery shopping"
        />
        {errors.description && (
          <p className="text-sm text-destructive">{errors.description.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="amount">Amount</Label>
        <Input
          id="amount"
          type="number"
          step="0.01"
          {...register("amount", { valueAsNumber: true })}
          placeholder="0.00"
        />
        {errors.amount && (
          <p className="text-sm text-destructive">{errors.amount.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="type">Type</Label>
        <Select {...register("type")}>
          <option value="expense">Expense</option>
          <option value="income">Income</option>
        </Select>
      </div>

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? "Creating..." : "Create Transaction"}
      </Button>
    </form>
  )
}
```

#### Componente CategoryChart

**Arquivo:** `src/components/CategoryChart/CategoryChart.tsx`

```typescript
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface CategoryData {
  name: string
  value: number
  color: string
}

interface CategoryChartProps {
  data: CategoryData[]
  title?: string
}

const COLORS = ["#FF6B6B", "#4ECDC4", "#FFE66D", "#A8D8EA", "#95E1D3"]

export function CategoryChart({ data, title = "Expenses by Category" }: CategoryChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
```

---

## Gerenciamento de Estado

### Arquitetura de Context

O PlutusGrip usa React Context API para gerenciamento de estado global:

#### AuthContext

**Arquivo:** `src/contexts/AuthContext.tsx`

```typescript
import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { authService } from "@/services/auth.service"
import type { User, LoginCredentials, RegisterData } from "@/types/auth.types"

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (credentials: LoginCredentials) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => Promise<void>
  refreshToken: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Verificar token armazenado ao montar
    const token = localStorage.getItem("access_token")
    if (token) {
      loadUser()
    } else {
      setIsLoading(false)
    }
  }, [])

  const loadUser = async () => {
    try {
      const user = await authService.getCurrentUser()
      setUser(user)
    } catch (error) {
      // Token expirado ou inválido
      localStorage.removeItem("access_token")
      localStorage.removeItem("refresh_token")
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (credentials: LoginCredentials) => {
    const response = await authService.login(credentials)
    localStorage.setItem("access_token", response.access_token)
    localStorage.setItem("refresh_token", response.refresh_token)
    setUser(response.user)
  }

  const register = async (data: RegisterData) => {
    const user = await authService.register(data)
    // Auto-login após registro
    await login({ email: data.email, password: data.password })
  }

  const logout = async () => {
    try {
      await authService.logout()
    } finally {
      localStorage.removeItem("access_token")
      localStorage.removeItem("refresh_token")
      setUser(null)
    }
  }

  const refreshToken = async () => {
    const refreshToken = localStorage.getItem("refresh_token")
    if (!refreshToken) throw new Error("No refresh token")

    const response = await authService.refreshToken(refreshToken)
    localStorage.setItem("access_token", response.access_token)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        refreshToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return context
}
```

#### CurrencyContext

**Arquivo:** `src/contexts/CurrencyContext.tsx`

```typescript
import { createContext, useContext, useState, useEffect, ReactNode } from "react"

type Currency = "BRL" | "USD" | "EUR" | "GBP"

interface CurrencyContextType {
  currency: Currency
  setCurrency: (currency: Currency) => void
  formatAmount: (amount: number) => string
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined)

const currencySymbols: Record<Currency, string> = {
  BRL: "R$",
  USD: "$",
  EUR: "€",
  GBP: "£",
}

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrency] = useState<Currency>(() => {
    const stored = localStorage.getItem("currency")
    return (stored as Currency) || "BRL"
  })

  useEffect(() => {
    localStorage.setItem("currency", currency)
  }, [currency])

  const formatAmount = (amount: number): string => {
    const symbol = currencySymbols[currency]
    return `${symbol} ${amount.toFixed(2)}`
  }

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, formatAmount }}>
      {children}
    </CurrencyContext.Provider>
  )
}

export function useCurrency() {
  const context = useContext(CurrencyContext)
  if (context === undefined) {
    throw new Error("useCurrency must be used within CurrencyProvider")
  }
  return context
}
```

### Custom Hooks

#### Hook useAuth

```typescript
import { useAuth as useAuthContext } from "@/contexts/AuthContext"

export const useAuth = useAuthContext
```

#### Hook useDebounce

**Arquivo:** `src/hooks/useDebounce.ts`

```typescript
import { useEffect, useState } from "react"

export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}
```

**Uso:**
```typescript
const [searchTerm, setSearchTerm] = useState("")
const debouncedSearch = useDebounce(searchTerm, 500)

useEffect(() => {
  // Chamada da API com valor debounced
  searchTransactions(debouncedSearch)
}, [debouncedSearch])
```

---

## Roteamento e Páginas

### Configuração do Router

**Arquivo:** `src/App.tsx`

```typescript
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { AuthProvider } from "@/contexts/AuthContext"
import { CurrencyProvider } from "@/contexts/CurrencyContext"
import { ThemeProvider } from "@/contexts/ThemeProvider"
import { ProtectedRoute } from "@/components/ProtectedRoute/ProtectedRoute"
import { Landing } from "@/pages/Landing/Landing"
import { Login } from "@/pages/Login/Login"
import { Register } from "@/pages/Register/Register"
import { Dashboard } from "@/pages/Dashboard/Dashboard"
import { Toaster } from "@/components/Toast/Toaster"

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CurrencyProvider>
          <BrowserRouter>
            <Routes>
              {/* Rotas Públicas */}
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Rotas Protegidas */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />

              {/* Redirecionamento catch-all */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
          <Toaster />
        </CurrencyProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
```

### Componente ProtectedRoute

**Arquivo:** `src/components/ProtectedRoute/ProtectedRoute.tsx`

```typescript
import { Navigate } from "react-router-dom"
import { useAuth } from "@/hooks/useAuth"

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}
```

### Componentes de Página

#### Página Dashboard

**Arquivo:** `src/pages/Dashboard/Dashboard.tsx`

```typescript
import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/useAuth"
import { useCurrency } from "@/hooks/useCurrency"
import { DashboardFilters } from "@/components/DashboardFilters/DashboardFilters"
import { ExpenseChart } from "@/components/ExpenseChart/ExpenseChart"
import { IncomeChart } from "@/components/IncomeChart/IncomeChart"
import { CategoryChart } from "@/components/CategoryChart/CategoryChart"
import { RecentTransactions } from "@/components/RecentTransactions/RecentTransactions"
import { CategoryManager } from "@/components/CategoryManager/CategoryManager"
import { ExpenseForm } from "@/components/ExpenseForm/ExpenseForm"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { reportService } from "@/services/report.service"
import { transactionService } from "@/services/transaction.service"

export function Dashboard() {
  const { user, logout } = useAuth()
  const { formatAmount } = useCurrency()
  const [overview, setOverview] = useState(null)
  const [transactions, setTransactions] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setIsLoading(true)
      const [overviewData, transactionsData] = await Promise.all([
        reportService.getOverview(),
        transactionService.getTransactions({ page: 1, page_size: 10 }),
      ])
      setOverview(overviewData)
      setTransactions(transactionsData.transactions)
    } catch (error) {
      console.error("Failed to load dashboard data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">PlutusGrip</h1>
          <div className="flex items-center gap-4">
            <span>Welcome, {user?.name}</span>
            <Button variant="outline" onClick={logout}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="container mx-auto px-4 py-8">
        <DashboardFilters onFilterChange={loadDashboardData} />

        {/* Cards de Visão Geral */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Total Income</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-600">
                {formatAmount(overview?.total_income || 0)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Total Expenses</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-red-600">
                {formatAmount(overview?.total_expenses || 0)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Net Balance</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">
                {formatAmount(overview?.net_balance || 0)}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <ExpenseChart />
          <IncomeChart />
          <CategoryChart />
        </div>

        {/* Transações Recentes */}
        <RecentTransactions transactions={transactions} onRefresh={loadDashboardData} />

        {/* Gerenciador de Categorias */}
        <CategoryManager />

        {/* Formulário de Adicionar Transação */}
        <ExpenseForm onSuccess={loadDashboardData} />
      </main>
    </div>
  )
}
```

---

## Integração com API

### Configuração do Serviço da API

**Arquivo:** `src/services/api.ts`

```typescript
import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from "axios"

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api"

// Criar instância axios
const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
})

// Interceptor de requisição - Adicionar token de auth
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem("access_token")
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error: AxiosError) => {
    return Promise.reject(error)
  }
)

// Interceptor de resposta - Lidar com refresh de token
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

    // Se 401 e não já tentou novamente, tentar refresh de token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const refreshToken = localStorage.getItem("refresh_token")
        if (!refreshToken) throw new Error("No refresh token")

        const response = await axios.post(`${API_URL}/auth/refresh`, {
          refresh_token: refreshToken,
        })

        const { access_token } = response.data
        localStorage.setItem("access_token", access_token)

        // Repetir requisição original com novo token
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${access_token}`
        }
        return api(originalRequest)
      } catch (refreshError) {
        // Refresh falhou, redirecionar para login
        localStorage.removeItem("access_token")
        localStorage.removeItem("refresh_token")
        window.location.href = "/login"
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

export default api
```

### Camada de Serviço

#### Serviço de Auth

**Arquivo:** `src/services/auth.service.ts`

```typescript
import api from "./api"
import type { User, LoginCredentials, LoginResponse, RegisterData } from "@/types/auth.types"

export const authService = {
  async register(data: RegisterData): Promise<User> {
    const response = await api.post<User>("/auth/register", data)
    return response.data
  },

  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>("/auth/login", credentials)
    return response.data
  },

  async logout(): Promise<void> {
    await api.post("/auth/logout")
  },

  async refreshToken(refreshToken: string): Promise<{ access_token: string }> {
    const response = await api.post("/auth/refresh", { refresh_token: refreshToken })
    return response.data
  },

  async getCurrentUser(): Promise<User> {
    const response = await api.get<User>("/auth/me")
    return response.data
  },
}
```

#### Serviço de Transação

**Arquivo:** `src/services/transaction.service.ts`

```typescript
import api from "./api"
import type {
  Transaction,
  TransactionCreateData,
  TransactionUpdateData,
  TransactionListResponse,
  TransactionFilters,
} from "@/types/transaction.types"

export const transactionService = {
  async getTransactions(filters?: TransactionFilters): Promise<TransactionListResponse> {
    const response = await api.get<TransactionListResponse>("/transactions", {
      params: filters,
    })
    return response.data
  },

  async getTransactionById(id: number): Promise<Transaction> {
    const response = await api.get<Transaction>(`/transactions/${id}`)
    return response.data
  },

  async createTransaction(data: TransactionCreateData): Promise<Transaction> {
    const response = await api.post<Transaction>("/transactions", data)
    return response.data
  },

  async updateTransaction(id: number, data: TransactionUpdateData): Promise<Transaction> {
    const response = await api.put<Transaction>(`/transactions/${id}`, data)
    return response.data
  },

  async deleteTransaction(id: number): Promise<void> {
    await api.delete(`/transactions/${id}`)
  },
}
```

---

## Guia de Testes

### Testes Unitários com Vitest

#### Configuração de Testes

**Arquivo:** `vitest.config.ts`

```typescript
import { defineConfig } from "vitest/config"
import react from "@vitejs/plugin-react"
import path from "path"

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./tests/setup.ts",
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/",
        "tests/",
        "**/*.test.{ts,tsx}",
        "**/*.spec.{ts,tsx}",
      ],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
```

**Arquivo:** `tests/setup.ts`

```typescript
import { expect, afterEach } from "vitest"
import { cleanup } from "@testing-library/react"
import * as matchers from "@testing-library/jest-dom/matchers"

expect.extend(matchers)

afterEach(() => {
  cleanup()
})
```

#### Exemplos de Testes Unitários

**Arquivo:** `src/components/Button/Button.test.tsx`

```typescript
import { describe, it, expect, vi } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { Button } from "./Button"

describe("Button", () => {
  it("renders children correctly", () => {
    render(<Button>Click me</Button>)
    expect(screen.getByText("Click me")).toBeInTheDocument()
  })

  it("handles click events", () => {
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>Click me</Button>)

    fireEvent.click(screen.getByText("Click me"))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it("applies variant classes", () => {
    const { container } = render(<Button variant="destructive">Delete</Button>)
    expect(container.firstChild).toHaveClass("bg-destructive")
  })

  it("is disabled when disabled prop is true", () => {
    render(<Button disabled>Disabled</Button>)
    expect(screen.getByText("Disabled")).toBeDisabled()
  })
})
```

**Arquivo:** `src/contexts/AuthContext.test.tsx`

```typescript
import { describe, it, expect, beforeEach, vi } from "vitest"
import { renderHook, act, waitFor } from "@testing-library/react"
import { AuthProvider, useAuth } from "./AuthContext"
import { authService } from "@/services/auth.service"

vi.mock("@/services/auth.service")

describe("AuthContext", () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  it("provides authentication state", () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    })

    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.user).toBeNull()
  })

  it("handles login successfully", async () => {
    const mockUser = { id: 1, name: "Test User", email: "test@example.com" }
    const mockResponse = {
      access_token: "token123",
      refresh_token: "refresh123",
      user: mockUser,
    }

    vi.mocked(authService.login).mockResolvedValue(mockResponse)

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    })

    await act(async () => {
      await result.current.login({
        email: "test@example.com",
        password: "password123",
      })
    })

    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(true)
      expect(result.current.user).toEqual(mockUser)
      expect(localStorage.getItem("access_token")).toBe("token123")
    })
  })

  it("handles logout", async () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    })

    // Definir estado de auth inicial
    localStorage.setItem("access_token", "token123")

    await act(async () => {
      await result.current.logout()
    })

    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.user).toBeNull()
    expect(localStorage.getItem("access_token")).toBeNull()
  })
})
```

#### Executando Testes

```bash
# Executar todos os testes
npm test

# Executar testes em modo watch
npm test -- --watch

# Executar testes com UI
npm run test:ui

# Gerar relatório de cobertura
npm run test:coverage

# Executar arquivo de teste específico
npm test -- Button.test.tsx

# Executar testes correspondentes ao padrão
npm test -- --grep="Auth"
```

### Testes E2E com Playwright

#### Configuração do Playwright

**Arquivo:** `playwright.config.ts`

```typescript
import { defineConfig, devices } from "@playwright/test"

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  use: {
    baseURL: "http://localhost:5173",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },
    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
    },
  ],

  webServer: {
    command: "npm run dev",
    url: "http://localhost:5173",
    reuseExistingServer: !process.env.CI,
  },
})
```

#### Exemplos de Testes E2E

**Arquivo:** `e2e/auth.spec.ts`

```typescript
import { test, expect } from "@playwright/test"

test.describe("Authentication", () => {
  test("should register new user", async ({ page }) => {
    await page.goto("/register")

    await page.fill('input[name="name"]', "Test User")
    await page.fill('input[name="email"]', "test@example.com")
    await page.fill('input[name="password"]', "password123")
    await page.fill('input[name="password_confirmation"]', "password123")

    await page.click('button[type="submit"]')

    await expect(page).toHaveURL("/dashboard")
  })

  test("should login existing user", async ({ page }) => {
    await page.goto("/login")

    await page.fill('input[name="email"]', "test@example.com")
    await page.fill('input[name="password"]', "password123")

    await page.click('button[type="submit"]')

    await expect(page).toHaveURL("/dashboard")
    await expect(page.locator("text=Welcome")).toBeVisible()
  })

  test("should show error on invalid credentials", async ({ page }) => {
    await page.goto("/login")

    await page.fill('input[name="email"]', "wrong@example.com")
    await page.fill('input[name="password"]', "wrongpass")

    await page.click('button[type="submit"]')

    await expect(page.locator("text=Invalid credentials")).toBeVisible()
  })

  test("should logout user", async ({ page }) => {
    // Login primeiro
    await page.goto("/login")
    await page.fill('input[name="email"]', "test@example.com")
    await page.fill('input[name="password"]', "password123")
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL("/dashboard")

    // Logout
    await page.click('button:has-text("Logout")')
    await expect(page).toHaveURL("/login")
  })
})
```

**Arquivo:** `e2e/transactions.spec.ts`

```typescript
import { test, expect } from "@playwright/test"

test.describe("Transactions", () => {
  test.beforeEach(async ({ page }) => {
    // Login antes de cada teste
    await page.goto("/login")
    await page.fill('input[name="email"]', "test@example.com")
    await page.fill('input[name="password"]', "password123")
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL("/dashboard")
  })

  test("should create new transaction", async ({ page }) => {
    await page.click('button:has-text("Add Transaction")')

    await page.fill('input[name="description"]', "Grocery shopping")
    await page.fill('input[name="amount"]', "150.00")
    await page.selectOption('select[name="type"]', "expense")

    await page.click('button[type="submit"]')

    await expect(page.locator("text=Transaction created successfully")).toBeVisible()
    await expect(page.locator("text=Grocery shopping")).toBeVisible()
  })

  test("should update transaction", async ({ page }) => {
    // Encontrar primeira transação
    const firstTransaction = page.locator('[data-testid="transaction-item"]').first()
    await firstTransaction.click()

    // Editar
    await page.click('button:has-text("Edit")')
    await page.fill('input[name="description"]', "Updated transaction")
    await page.click('button[type="submit"]')

    await expect(page.locator("text=Transaction updated successfully")).toBeVisible()
  })

  test("should delete transaction", async ({ page }) => {
    const firstTransaction = page.locator('[data-testid="transaction-item"]').first()
    await firstTransaction.hover()
    await page.click('button[aria-label="Delete transaction"]')

    // Confirmar deleção
    await page.click('button:has-text("Confirm")')

    await expect(page.locator("text=Transaction deleted successfully")).toBeVisible()
  })
})
```

#### Executando Testes E2E

```bash
# Instalar navegadores Playwright (primeira vez apenas)
npx playwright install

# Executar testes E2E
npx playwright test

# Executar com UI
npx playwright test --ui

# Executar navegador específico
npx playwright test --project=chromium

# Executar em modo headed
npx playwright test --headed

# Debug de testes
npx playwright test --debug

# Gerar relatório de teste
npx playwright show-report
```

---

## Build e Deployment

### Build de Produção

```bash
# Build para produção
npm run build

# Preview do build de produção localmente
npm run preview
```

Saída do build:
```
plutsgrip-frond-refac/dist/
├── index.html
├── assets/
│   ├── index-[hash].js
│   ├── index-[hash].css
│   └── [outros assets]
└── [outros arquivos]
```

### Configuração de Ambiente

**Desenvolvimento:**
```env
VITE_API_URL=http://localhost:8000/api
```

**Produção:**
```env
VITE_API_URL=http://68.183.98.186/api
```

### Deploy na DigitalOcean

#### Opção A: Build Localmente e Upload

```bash
# 1. Build localmente
npm run build

# 2. Criar arquivo
tar -czf dist.tar.gz dist/

# 3. Upload para servidor
scp dist.tar.gz root@68.183.98.186:/tmp/

# 4. SSH no servidor e extrair
ssh root@68.183.98.186
cd /opt/plutusgrip-frontend
rm -rf dist.backup
mv dist dist.backup
tar -xzf /tmp/dist.tar.gz
chown -R plutusgrip:plutusgrip dist/
rm /tmp/dist.tar.gz
```

#### Opção B: Build no Servidor

```bash
# SSH no servidor
ssh root@68.183.98.186

# Navegar para diretório do frontend
cd /opt/plutusgrip-frontend

# Puxar código mais recente
git pull origin main

# Instalar dependências
npm install

# Build
npm run build

# Nginx servirá automaticamente os novos arquivos dist/
```

### Configuração do Nginx

**Arquivo:** `/etc/nginx/sites-available/plutusgrip` (no servidor)

```nginx
server {
    listen 80;
    server_name 68.183.98.186;

    root /opt/plutusgrip-frontend/dist;
    index index.html;

    # Roteamento do frontend
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache de assets estáticos
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Proxy da API
    location /api/ {
        proxy_pass http://localhost:8000/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## Estilização com TailwindCSS

### Configuração do TailwindCSS

**Arquivo:** `tailwind.config.js`

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [],
}
```

### Variáveis CSS

**Arquivo:** `src/index.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --primary: 222.2 47.4% 11.2%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 222.2 84% 4.9%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    --primary: 210 40% 98%;
    --primary-foreground: 222.2 47.4% 11.2%;
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 212.7 26.8% 83.9%;
  }
}
```

### Exemplos de Uso

```typescript
// Uso básico
<div className="bg-background text-foreground">Content</div>

// Responsivo
<div className="w-full md:w-1/2 lg:w-1/3">Responsive width</div>

// Modo escuro
<div className="bg-white dark:bg-gray-800">Auto dark mode</div>

// Hover e focus
<button className="hover:bg-primary focus:ring-2 focus:ring-ring">
  Button
</button>

// Usando utilitário cn para classes condicionais
import { cn } from "@/utils/cn"

<div className={cn(
  "base-class",
  isActive && "active-class",
  isDisabled && "disabled-class"
)}>
  Content
</div>
```

---

## Fluxo de Trabalho de Desenvolvimento

### Fluxo Git

```bash
# Criar branch de feature
git checkout -b feature/new-feature

# Fazer mudanças
# ... editar arquivos ...

# Executar testes
npm test
npm run lint

# Commitar mudanças
git add .
git commit -m "feat: add new feature"

# Push para remoto
git push origin feature/new-feature

# Criar Pull Request no GitHub
```

### Ferramentas de Qualidade de Código

```bash
# Lint do código
npm run lint

# Formatar código (se usar Prettier)
npm run format

# Verificação de tipos
npx tsc --noEmit

# Executar todas as verificações
npm run lint && npm test && npm run build
```

### Checklist Pré-commit

- [ ] Código compila sem erros
- [ ] Todos os testes passam
- [ ] Sem erros TypeScript
- [ ] Sem erros de linting
- [ ] Componentes estão devidamente tipados
- [ ] Variáveis de ambiente estão documentadas
- [ ] Novas dependências estão justificadas
- [ ] Build bem-sucedido

---

## Recursos Adicionais

- **Documentação React**: https://react.dev/
- **Documentação TypeScript**: https://www.typescriptlang.org/docs/
- **Documentação Vite**: https://vitejs.dev/guide/
- **Documentação TailwindCSS**: https://tailwindcss.com/docs
- **Documentação Radix UI**: https://www.radix-ui.com/docs/primitives
- **Documentação React Router**: https://reactrouter.com/
- **Documentação Vitest**: https://vitest.dev/
- **Documentação Playwright**: https://playwright.dev/

---

## Suporte

Para issues ou perguntas:

- **GitHub Issues**: https://github.com/LeP-Projects/plutsgrip-app/issues
- **Email**: paulodjunior.dev@gmail.com
- **Aplicação ao Vivo**: http://68.183.98.186

---

<div align="center">

**[Voltar ao Topo](#documentação-do-frontend---plutsgrip)** | **[Índice da Documentação](./INDEX.md)**

Última Atualização: 2026-01-07

</div>
