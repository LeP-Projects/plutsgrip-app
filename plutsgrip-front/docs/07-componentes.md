# 🧩 Catálogo de Componentes

## 📊 Visão Geral

O projeto possui **35+ componentes** organizados em categorias:

- **🎨 UI Components** (17) - Componentes de interface básicos
- **💼 Business Components** (14) - Componentes com lógica de negócio
- **🔐 Contexts** (3) - Gerenciamento de estado global
- **📄 Pages** (2) - Componentes de página completa

**Total de componentes migrados e funcionais: 35+**

---

## 📋 Índice

1. [UI Components](#-ui-components)
2. [Business Components](#-business-components)
3. [Contexts](#-contexts)
4. [Pages](#-pages)
5. [Como Usar Componentes](#-como-usar-componentes)

---

## 🎨 UI Components

Componentes de interface reutilizáveis sem lógica de negócio específica.

### 1. Button

**Localização:** `src/components/Button/Button.tsx`

**Descrição:** Botão acessível com múltiplas variantes e tamanhos.

**Props:**
```typescript
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
  asChild?: boolean
}
```

**Variantes:**
- `default` - Botão primário (azul)
- `destructive` - Ações destrutivas (vermelho)
- `outline` - Botão com borda
- `secondary` - Botão secundário (cinza)
- `ghost` - Botão sem fundo
- `link` - Estilo de link

**Tamanhos:**
- `default` - h-10 px-4 py-2
- `sm` - h-9 px-3 (menor)
- `lg` - h-11 px-8 (maior)
- `icon` - h-10 w-10 (quadrado)

**Exemplo:**
```tsx
import { Button } from "@/components/Button"

<Button variant="default" size="lg" onClick={handleClick}>
  Salvar
</Button>

<Button variant="destructive">Excluir</Button>

<Button variant="outline" size="sm">Cancelar</Button>

<Button size="icon">
  <PlusIcon className="h-4 w-4" />
</Button>
```

**Testes:** ✅ 25 testes passando

---

### 2. Input

**Localização:** `src/components/Input/Input.tsx`

**Descrição:** Campo de entrada de texto acessível e estilizado.

**Props:**
```typescript
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  // Herda todas as props nativas de input
}
```

**Tipos suportados:**
- `text` - Texto padrão
- `email` - Email
- `password` - Senha
- `number` - Número
- `date` - Data
- `tel` - Telefone

**Características:**
- Touch target de 40px (acessível)
- Validação nativa HTML5
- Suporte a readonly e disabled
- Focus-visible styles

**Exemplo:**
```tsx
import { Input } from "@/components/Input"

<Input
  type="email"
  placeholder="seu@email.com"
  required
/>

<Input
  type="password"
  placeholder="••••••••"
  minLength={6}
/>

<Input
  type="number"
  min={0}
  max={100}
  step={0.01}
/>
```

**Testes:** ✅ 34 testes passando

---

### 3. Card

**Localização:** `src/components/Card/Card.tsx`

**Descrição:** Container com sombra e borda arredondada.

**Componentes:**
- `Card` - Container principal
- `CardHeader` - Cabeçalho do card
- `CardTitle` - Título do card
- `CardDescription` - Descrição do card
- `CardContent` - Conteúdo do card
- `CardFooter` - Rodapé do card

**Exemplo:**
```tsx
import { Card, CardHeader, CardTitle, CardContent } from "@/components/Card"

<Card>
  <CardHeader>
    <CardTitle>Título do Card</CardTitle>
    <CardDescription>Descrição opcional</CardDescription>
  </CardHeader>
  <CardContent>
    Conteúdo do card aqui
  </CardContent>
  <CardFooter>
    <Button>Ação</Button>
  </CardFooter>
</Card>
```

---

### 4. Label

**Localização:** `src/components/Label/Label.tsx`

**Descrição:** Label acessível para form inputs (Radix UI).

**Props:**
```typescript
interface LabelProps extends React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> {
  htmlFor?: string
}
```

**Exemplo:**
```tsx
import { Label } from "@/components/Label"
import { Input } from "@/components/Input"

<div>
  <Label htmlFor="email">Email</Label>
  <Input id="email" type="email" />
</div>
```

---

### 5. Dialog

**Localização:** `src/components/Dialog/Dialog.tsx`

**Descrição:** Modal acessível (Radix UI).

**Componentes:**
- `Dialog` - Container principal
- `DialogTrigger` - Botão que abre o dialog
- `DialogContent` - Conteúdo do dialog
- `DialogHeader` - Cabeçalho
- `DialogTitle` - Título
- `DialogDescription` - Descrição
- `DialogFooter` - Rodapé

**Exemplo:**
```tsx
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/Dialog"

<Dialog>
  <DialogTrigger asChild>
    <Button>Abrir Dialog</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Título do Dialog</DialogTitle>
      <DialogDescription>
        Descrição do que este dialog faz
      </DialogDescription>
    </DialogHeader>
    <div>
      Conteúdo aqui
    </div>
    <DialogFooter>
      <Button>Confirmar</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

---

### 6. Select

**Localização:** `src/components/Select/Select.tsx`

**Descrição:** Select dropdown acessível (Radix UI).

**Componentes:**
- `Select` - Container principal
- `SelectTrigger` - Botão que abre o select
- `SelectValue` - Valor selecionado
- `SelectContent` - Container dos itens
- `SelectItem` - Item individual

**Exemplo:**
```tsx
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/Select"

<Select value={value} onValueChange={setValue}>
  <SelectTrigger>
    <SelectValue placeholder="Selecione uma opção" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="option1">Opção 1</SelectItem>
    <SelectItem value="option2">Opção 2</SelectItem>
    <SelectItem value="option3">Opção 3</SelectItem>
  </SelectContent>
</Select>
```

---

### 7. Table

**Localização:** `src/components/Table/Table.tsx`

**Descrição:** Tabela responsiva e estilizada.

**Componentes:**
- `Table` - Elemento table
- `TableHeader` - thead
- `TableBody` - tbody
- `TableRow` - tr
- `TableHead` - th
- `TableCell` - td
- `TableCaption` - caption

**Exemplo:**
```tsx
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/Table"

<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Nome</TableHead>
      <TableHead>Email</TableHead>
      <TableHead>Ações</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>João Silva</TableCell>
      <TableCell>joao@email.com</TableCell>
      <TableCell>
        <Button size="sm">Editar</Button>
      </TableCell>
    </TableRow>
  </TableBody>
</Table>
```

---

### 8. Tabs

**Localização:** `src/components/Tabs/Tabs.tsx`

**Descrição:** Sistema de abas acessível (Radix UI).

**Componentes:**
- `Tabs` - Container principal
- `TabsList` - Lista de abas
- `TabsTrigger` - Botão de aba
- `TabsContent` - Conteúdo da aba

**Exemplo:**
```tsx
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/Tabs"

<Tabs defaultValue="tab1">
  <TabsList>
    <TabsTrigger value="tab1">Aba 1</TabsTrigger>
    <TabsTrigger value="tab2">Aba 2</TabsTrigger>
    <TabsTrigger value="tab3">Aba 3</TabsTrigger>
  </TabsList>
  <TabsContent value="tab1">
    Conteúdo da aba 1
  </TabsContent>
  <TabsContent value="tab2">
    Conteúdo da aba 2
  </TabsContent>
  <TabsContent value="tab3">
    Conteúdo da aba 3
  </TabsContent>
</Tabs>
```

---

### 9. Alert

**Localização:** `src/components/Alert/Alert.tsx`

**Descrição:** Componente de alerta para mensagens importantes.

**Variantes:**
- `default` - Alerta padrão
- `destructive` - Alerta de erro

**Exemplo:**
```tsx
import { Alert, AlertDescription, AlertTitle } from "@/components/Alert"

<Alert>
  <AlertTitle>Atenção!</AlertTitle>
  <AlertDescription>
    Esta é uma mensagem importante.
  </AlertDescription>
</Alert>

<Alert variant="destructive">
  <AlertTitle>Erro!</AlertTitle>
  <AlertDescription>
    Ocorreu um erro ao processar sua solicitação.
  </AlertDescription>
</Alert>
```

---

### 10. AlertDialog

**Localização:** `src/components/AlertDialog/AlertDialog.tsx`

**Descrição:** Dialog para confirmações importantes (Radix UI).

**Exemplo:**
```tsx
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/AlertDialog"

<AlertDialog>
  <AlertDialogTrigger asChild>
    <Button variant="destructive">Excluir</Button>
  </AlertDialogTrigger>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
      <AlertDialogDescription>
        Esta ação não pode ser desfeita.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancelar</AlertDialogCancel>
      <AlertDialogAction onClick={handleDelete}>
        Confirmar
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

---

### 11. Badge

**Localização:** `src/components/Badge/Badge.tsx`

**Descrição:** Badge/Tag para labels e status.

**Variantes:**
- `default` - Badge padrão
- `secondary` - Badge secundário
- `destructive` - Badge de erro
- `outline` - Badge com borda

**Exemplo:**
```tsx
import { Badge } from "@/components/Badge"

<Badge>Novo</Badge>
<Badge variant="secondary">Em progresso</Badge>
<Badge variant="destructive">Erro</Badge>
<Badge variant="outline">Tag</Badge>
```

---

### 12. Skeleton

**Localização:** `src/components/Skeleton/Skeleton.tsx`

**Descrição:** Loading skeleton para estados de carregamento.

**Exemplo:**
```tsx
import { Skeleton } from "@/components/Skeleton"

<div className="space-y-2">
  <Skeleton className="h-4 w-[250px]" />
  <Skeleton className="h-4 w-[200px]" />
  <Skeleton className="h-4 w-[150px]" />
</div>
```

---

### 13. DropdownMenu

**Localização:** `src/components/DropdownMenu/DropdownMenu.tsx`

**Descrição:** Menu dropdown acessível (Radix UI).

**Exemplo:**
```tsx
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/DropdownMenu"

<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="outline">Opções</Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuItem onClick={handleEdit}>
      Editar
    </DropdownMenuItem>
    <DropdownMenuItem onClick={handleDelete}>
      Excluir
    </DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

---

### 14. Popover

**Localização:** `src/components/Popover/Popover.tsx`

**Descrição:** Popover flutuante acessível (Radix UI).

**Exemplo:**
```tsx
import { Popover, PopoverTrigger, PopoverContent } from "@/components/Popover"

<Popover>
  <PopoverTrigger asChild>
    <Button variant="outline">Abrir Popover</Button>
  </PopoverTrigger>
  <PopoverContent>
    Conteúdo do popover aqui
  </PopoverContent>
</Popover>
```

---

### 15. Toast

**Localização:** `src/components/Toast/Toast.tsx`

**Descrição:** Sistema de notificações toast.

**Exemplo:**
```tsx
import { useToast } from "@/hooks/use-toast"

function Component() {
  const { toast } = useToast()

  const showToast = () => {
    toast({
      title: "Sucesso!",
      description: "Operação realizada com sucesso.",
    })

    toast({
      variant: "destructive",
      title: "Erro!",
      description: "Ocorreu um erro.",
    })
  }

  return <Button onClick={showToast}>Mostrar Toast</Button>
}
```

---

### 16. Textarea

**Localização:** `src/components/Textarea/Textarea.tsx`

**Descrição:** Campo de texto multi-linha.

**Exemplo:**
```tsx
import { Textarea } from "@/components/Textarea"

<Textarea
  placeholder="Digite suas observações..."
  rows={4}
  maxLength={500}
/>
```

---

### 17. Calendar

**Localização:** `src/components/Calendar/Calendar.tsx`

**Descrição:** Calendário para seleção de datas (React Day Picker).

**Exemplo:**
```tsx
import { Calendar } from "@/components/Calendar"

<Calendar
  mode="single"
  selected={date}
  onSelect={setDate}
/>
```

---

## 💼 Business Components

Componentes com lógica de negócio específica da aplicação.

### 1. ThemeToggle

**Localização:** `src/components/ThemeToggle/ThemeToggle.tsx`

**Descrição:** Botão para alternar entre temas claro/escuro.

**Funcionalidades:**
- Toggle entre light/dark/system
- Dropdown com opções
- Ícone dinâmico (Sol/Lua)

**Exemplo:**
```tsx
import { ThemeToggle } from "@/components/ThemeToggle"

<ThemeToggle />
```

---

### 2. LanguageToggle

**Localização:** `src/components/LanguageToggle/LanguageToggle.tsx`

**Descrição:** Toggle para alternar idioma (PT/EN).

**Funcionalidades:**
- Alterna entre português e inglês
- Persiste preferência
- Ícone de bandeira

**Exemplo:**
```tsx
import { LanguageToggle } from "@/components/LanguageToggle"

<LanguageToggle />
```

---

### 3. CurrencySelector

**Localização:** `src/components/CurrencySelector/CurrencySelector.tsx`

**Descrição:** Seletor de moeda (USD/BRL).

**Funcionalidades:**
- Select entre USD e BRL
- Conversão automática de valores
- Integração com CurrencyContext

**Exemplo:**
```tsx
import { CurrencySelector } from "@/components/CurrencySelector"

<CurrencySelector />
```

---

### 4. DashboardFilters

**Localização:** `src/components/DashboardFilters/DashboardFilters.tsx`

**Descrição:** Filtros para o dashboard (período, categoria, tipo).

**Props:**
```typescript
interface DashboardFiltersProps {
  onFilterChange: (filters: FilterState) => void
}
```

**Exemplo:**
```tsx
import { DashboardFilters } from "@/components/DashboardFilters"

<DashboardFilters onFilterChange={handleFilterChange} />
```

---

### 5. Chart (Base)

**Localização:** `src/components/Chart/Chart.tsx`

**Descrição:** Wrapper base para Recharts.

**Componentes:**
- `ChartContainer` - Container responsivo
- `ChartTooltip` - Tooltip customizado
- `ChartTooltipContent` - Conteúdo do tooltip

---

### 6. ExpenseChart

**Localização:** `src/components/ExpenseChart/ExpenseChart.tsx`

**Descrição:** Gráfico de linha para despesas mensais.

**Props:**
```typescript
interface ExpenseChartProps {
  data: Array<{ month: string; amount: number }>
}
```

**Exemplo:**
```tsx
import { ExpenseChart } from "@/components/ExpenseChart"

<ExpenseChart data={expensesData} />
```

---

### 7. IncomeChart

**Localização:** `src/components/IncomeChart/IncomeChart.tsx`

**Descrição:** Gráfico de linha para receitas mensais.

**Props:**
```typescript
interface IncomeChartProps {
  data: Array<{ month: string; amount: number }>
}
```

**Exemplo:**
```tsx
import { IncomeChart } from "@/components/IncomeChart"

<IncomeChart data={incomeData} />
```

---

### 8. CategoryChart

**Localização:** `src/components/CategoryChart/CategoryChart.tsx`

**Descrição:** Gráfico de pizza para distribuição por categoria.

**Props:**
```typescript
interface CategoryChartProps {
  data: Array<{ category: string; value: number; color: string }>
}
```

**Exemplo:**
```tsx
import { CategoryChart } from "@/components/CategoryChart"

<CategoryChart data={categoryData} />
```

---

### 9. ColumnChart

**Localização:** `src/components/ColumnChart/ColumnChart.tsx`

**Descrição:** Gráfico de barras comparativo (receitas vs despesas).

**Props:**
```typescript
interface ColumnChartProps {
  data: Array<{ month: string; income: number; expense: number }>
}
```

**Exemplo:**
```tsx
import { ColumnChart } from "@/components/ColumnChart"

<ColumnChart data={comparisonData} />
```

---

### 10. ExpenseForm

**Localização:** `src/components/ExpenseForm/ExpenseForm.tsx`

**Descrição:** Formulário completo para adicionar/editar transações.

**Props:**
```typescript
interface ExpenseFormProps {
  onSubmit: (data: TransactionData) => void
  initialData?: TransactionData
  mode?: "create" | "edit"
}
```

**Funcionalidades:**
- Validação com React Hook Form + Zod
- Suporte a receitas e despesas
- Seleção de categoria
- Date picker
- Campo de notas

**Tamanho:** 317 linhas

**Exemplo:**
```tsx
import { ExpenseForm } from "@/components/ExpenseForm"

<ExpenseForm
  onSubmit={handleSubmit}
  mode="create"
/>
```

---

### 11. RecentTransactions

**Localização:** `src/components/RecentTransactions/RecentTransactions.tsx`

**Descrição:** Lista de transações recentes com filtros.

**Props:**
```typescript
interface RecentTransactionsProps {
  transactions: Transaction[]
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
}
```

**Funcionalidades:**
- Lista de transações com paginação
- Filtros por tipo e categoria
- Busca por descrição
- Ações de editar/excluir
- Responsivo (cards em mobile)

**Tamanho:** 488 linhas

**Exemplo:**
```tsx
import { RecentTransactions } from "@/components/RecentTransactions"

<RecentTransactions
  transactions={transactions}
  onEdit={handleEdit}
  onDelete={handleDelete}
/>
```

---

### 12. CategoryManager

**Localização:** `src/components/CategoryManager/CategoryManager.tsx`

**Descrição:** CRUD completo de categorias.

**Funcionalidades:**
- Lista de categorias
- Adicionar nova categoria
- Editar categoria existente
- Excluir categoria
- Seleção de cor e ícone

**Tamanho:** 298 linhas

**Exemplo:**
```tsx
import { CategoryManager } from "@/components/CategoryManager"

<CategoryManager />
```

---

### 13. ProtectedRoute

**Localização:** `src/components/ProtectedRoute/ProtectedRoute.tsx`

**Descrição:** HOC para proteção de rotas autenticadas.

**Props:**
```typescript
interface ProtectedRouteProps {
  children: React.ReactNode
}
```

**Exemplo:**
```tsx
import { ProtectedRoute } from "@/components/ProtectedRoute"

<Route path="/dashboard" element={
  <ProtectedRoute>
    <Dashboard />
  </ProtectedRoute>
} />
```

---

### 14. ReportsSection

**Localização:** `src/components/ReportsSection/ReportsSection.tsx`

**Descrição:** Seção de relatórios com exportação.

**Funcionalidades:**
- Exportar para PDF
- Exportar para Excel
- Filtros de período
- Visualização de resumo

---

## 🔐 Contexts

Gerenciamento de estado global com Context API.

### 1. AuthContext

**Localização:** `src/contexts/AuthContext.tsx`

**Descrição:** Gerenciamento de autenticação.

**Interface:**
```typescript
interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
}
```

**Hook:**
```typescript
import { useAuth } from "@/contexts/AuthContext"

function Component() {
  const { user, login, logout, isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return <LoginForm onSubmit={login} />
  }

  return <div>Bem-vindo, {user?.name}!</div>
}
```

**Testes:** ✅ 10 testes passando

---

### 2. CurrencyContext

**Localização:** `src/contexts/CurrencyContext.tsx`

**Descrição:** Gerenciamento de moedas e conversão.

**Interface:**
```typescript
interface CurrencyContextType {
  currency: Currency
  setCurrency: (currency: Currency) => void
  exchangeRates: ExchangeRates
  convertAmount: (amount: number, from: Currency, to: Currency) => number
  formatCurrency: (amount: number, currency?: Currency) => string
  isLoading: boolean
  error: string | null
}
```

**Hook:**
```typescript
import { useCurrency } from "@/contexts/CurrencyContext"

function Component() {
  const { currency, setCurrency, formatCurrency, convertAmount } = useCurrency()

  const priceInBRL = convertAmount(100, 'USD', 'BRL')
  const formatted = formatCurrency(priceInBRL, 'BRL')

  return <div>{formatted}</div>
}
```

**Funcionalidades:**
- Conversão USD ↔ BRL
- Taxas de câmbio em tempo real
- Formatação de moeda (pt-BR / pt-BR)
- Persistência em localStorage

**Testes:** ✅ 17 testes passando

---

### 3. ThemeProvider

**Localização:** `src/contexts/ThemeProvider.tsx`

**Descrição:** Gerenciamento de temas (light/dark/system).

**Interface:**
```typescript
interface ThemeProviderState {
  theme: Theme
  setTheme: (theme: Theme) => void
}

type Theme = "dark" | "light" | "system"
```

**Hook:**
```typescript
import { useTheme } from "@/contexts/ThemeProvider"

function Component() {
  const { theme, setTheme } = useTheme()

  return (
    <div>
      <button onClick={() => setTheme('light')}>Light</button>
      <button onClick={() => setTheme('dark')}>Dark</button>
      <button onClick={() => setTheme('system')}>System</button>
    </div>
  )
}
```

**Funcionalidades:**
- Temas: light, dark, system
- Detecção automática de preferência do navegador
- Persistência em localStorage
- Aplicação de classe no documentElement

---

## 📄 Pages

Componentes de página completa.

### 1. LoginPage

**Localização:** `src/pages/Login/Login.tsx`

**Descrição:** Página de autenticação.

**Funcionalidades:**
- Formulário de login
- Toggle de idioma
- Link para registro
- Validação de campos
- Loading state
- Redirecionamento após login

**Testes:** ✅ 16 testes passando

---

### 2. Dashboard

**Localização:** `src/pages/Dashboard/Dashboard.tsx`

**Descrição:** Painel principal da aplicação.

**Funcionalidades:**
- **4 abas:**
  - Overview: Métricas e gráficos
  - Transactions: Lista e formulário
  - Categories: CRUD de categorias
  - Settings: Configurações

- **Sidebar responsivo:**
  - Desktop: Sidebar fixa
  - Mobile: Menu hamburguer com drawer

- **Header:**
  - Título da seção
  - Ações contextuais
  - ThemeToggle, LanguageToggle

**Tamanho:** 448 linhas

**Estrutura:**
```tsx
<Dashboard>
  <Sidebar>
    - Logo
    - Menu Items
    - User Info
  </Sidebar>

  <Main>
    <Header>
      - Título
      - Botões de ação
      - Toggles (Theme, Language, Currency)
    </Header>

    <Tabs>
      <Tab name="overview">
        - 4 Cards de métricas
        - 4 Gráficos
      </Tab>

      <Tab name="transactions">
        - ExpenseForm
        - RecentTransactions
      </Tab>

      <Tab name="categories">
        - CategoryManager
      </Tab>

      <Tab name="settings">
        - Configurações de tema
        - Configurações de idioma
        - Configurações de moeda
      </Tab>
    </Tabs>
  </Main>
</Dashboard>
```

---

## 💡 Como Usar Componentes

### 1. Importar Componente

```typescript
import { Button } from "@/components/Button"
import { Input } from "@/components/Input"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/Card"
```

### 2. Usar com TypeScript

Todos os componentes são totalmente tipados:

```typescript
import { Button, type ButtonProps } from "@/components/Button"

const MyButton: React.FC<ButtonProps> = (props) => {
  return <Button {...props} />
}
```

### 3. Estilização com TailwindCSS

Os componentes aceitam className para customização:

```typescript
<Button className="w-full mt-4">
  Botão de largura completa
</Button>

<Input className="max-w-sm" />

<Card className="shadow-lg border-2">
  Card customizado
</Card>
```

### 4. Composição

Componentes são projetados para composição:

```typescript
<Card>
  <CardHeader>
    <CardTitle>Formulário</CardTitle>
  </CardHeader>
  <CardContent>
    <form className="space-y-4">
      <div>
        <Label htmlFor="name">Nome</Label>
        <Input id="name" />
      </div>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" />
      </div>
      <Button type="submit">Enviar</Button>
    </form>
  </CardContent>
</Card>
```

### 5. Acessibilidade

Todos os componentes seguem práticas de acessibilidade:

```typescript
// Sempre use labels com inputs
<Label htmlFor="email">Email</Label>
<Input id="email" type="email" aria-describedby="email-help" />

// Use aria-label para botões sem texto
<Button size="icon" aria-label="Fechar">
  <XIcon className="h-4 w-4" />
</Button>

// Use AlertDialog para ações destrutivas
<AlertDialog>
  <AlertDialogTrigger>Excluir</AlertDialogTrigger>
  <AlertDialogContent>
    <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
    <AlertDialogDescription>
      Esta ação não pode ser desfeita.
    </AlertDialogDescription>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancelar</AlertDialogCancel>
      <AlertDialogAction>Confirmar</AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

---

## 📊 Estatísticas

### Componentes por Categoria

| Categoria | Quantidade | % do Total |
|-----------|------------|------------|
| UI Components | 17 | 47% |
| Business Components | 14 | 39% |
| Contexts | 3 | 8% |
| Pages | 2 | 6% |
| **Total** | **36** | **100%** |

### Tamanho dos Componentes

| Tamanho | Quantidade |
|---------|------------|
| Pequeno (< 100 linhas) | 22 |
| Médio (100-300 linhas) | 11 |
| Grande (> 300 linhas) | 3 |

### Testes

| Componente | Testes |
|------------|--------|
| Input | 34 |
| Button | 25 |
| CurrencyContext | 17 |
| Login | 16 |
| AuthContext | 10 |
| **Total** | **102** |

---

## 🔗 Referências

- [Radix UI Documentation](https://www.radix-ui.com/)
- [shadcn/ui](https://ui.shadcn.com/) - Inspiração para componentes
- [React Hook Form](https://react-hook-form.com/)
- [Recharts](https://recharts.org/)
- [TailwindCSS](https://tailwindcss.com/)

---

<div align="center">

**🧩 Componentes mantidos e testados com qualidade!**

*"Build components, not pages." - React Philosophy*

[⬆️ Voltar ao Índice](./00-indice.md)

</div>
