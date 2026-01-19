# Arquitetura do Sistema

## 1. Visão Geral da Arquitetura

O PlutusGrip Finance Tracker utiliza uma arquitetura client-server com separação clara entre frontend e backend, seguindo princípios de REST API e componentização modular.

## 2. Diagrama de Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                         CLIENTE                             │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              React Application (Vite)                  │ │
│  │                                                         │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │ │
│  │  │   Pages      │  │  Components  │  │   Contexts   │ │ │
│  │  └──────────────┘  └──────────────┘  └──────────────┘ │ │
│  │                                                         │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │ │
│  │  │    Hooks     │  │    Utils     │  │    Styles    │ │ │
│  │  └──────────────┘  └──────────────┘  └──────────────┘ │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ HTTP/HTTPS
                              │ (REST API)
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                        SERVIDOR                              │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              Express.js Backend                        │ │
│  │                                                         │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │ │
│  │  │   Routes     │→ │ Controllers  │→ │    Models    │ │ │
│  │  └──────────────┘  └──────────────┘  └──────────────┘ │ │
│  │                                                         │ │
│  │  ┌──────────────────────────────────────────────────┐  │ │
│  │  │              Middleware                           │  │ │
│  │  │  - Authentication                                 │  │ │
│  │  │  - CORS                                           │  │ │
│  │  │  - Error Handling                                 │  │ │
│  │  └──────────────────────────────────────────────────┘  │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │            In-Memory Database (Simulado)               │ │
│  │  - Users                                               │ │
│  │  - Transactions                                        │ │
│  │  - Categories                                          │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## 3. Camadas da Aplicação

### 3.1 Frontend

#### 3.1.1 Camada de Apresentação (Presentation Layer)
**Responsabilidade:** Renderização da interface do usuário

**Componentes:**
- **Pages (Páginas):** Componentes de nível superior que representam rotas
  - `LoginPage`: Página de autenticação
  - `RegisterPage`: Página de registro
  - `DashboardPage`: Painel principal

- **Components (Componentes):** Componentes reutilizáveis
  - **Dumb Components:** Apenas apresentação (Button, Input, Card)
  - **Smart Components:** Contêm lógica (Dashboard, TransactionForm)

#### 3.1.2 Camada de Lógica de Negócio (Business Logic Layer)
**Responsabilidade:** Gerenciamento de estado e lógica da aplicação

**Elementos:**
- **Contexts:** Gerenciamento de estado global
  - `AuthContext`: Estado de autenticação
  - `ThemeContext`: Tema da aplicação
  - `CurrencyContext`: Configurações de moeda

- **Hooks Customizados:** Lógica reutilizável
  - `useToast`: Notificações
  - `useIsMobile`: Detecção de dispositivo
  - `useAuth`: Operações de autenticação

#### 3.1.3 Camada de Roteamento (Routing Layer)
**Responsabilidade:** Navegação e proteção de rotas

**Componentes:**
- React Router DOM para gerenciamento de rotas
- `ProtectedRoute`: HOC para proteção de rotas autenticadas
- Configuração centralizada no `App.tsx`

#### 3.1.4 Camada de Comunicação (Communication Layer)
**Responsabilidade:** Comunicação com o backend

**Implementação:**
- Fetch API nativa para requisições HTTP
- Interceptores para adicionar tokens JWT
- Tratamento de erros centralizado

### 3.2 Backend

#### 3.2.1 Camada de Roteamento (Routing Layer)
**Responsabilidade:** Definição e mapeamento de endpoints

**Estrutura:**
```javascript
/api
  /auth         → auth.routes.js
  /transactions → transaction.routes.js
  /categories   → category.routes.js
  /reports      → report.routes.js
```

#### 3.2.2 Camada de Middleware
**Responsabilidade:** Processamento intermediário de requisições

**Middlewares:**
- **authenticateToken:** Validação de JWT
- **CORS:** Configuração de origens permitidas
- **Error Handler:** Tratamento centralizado de erros
- **Body Parser:** Parse de JSON e form data

#### 3.2.3 Camada de Controle (Controller Layer)
**Responsabilidade:** Lógica de negócio e orquestração

**Controllers:**
- `auth.controller.js`: Autenticação (login, registro, logout)
- `transaction.controller.js`: CRUD de transações
- `category.controller.js`: Gerenciamento de categorias
- `report.controller.js`: Geração de relatórios

#### 3.2.4 Camada de Modelo (Model Layer)
**Responsabilidade:** Acesso e manipulação de dados

**Implementação Atual:**
- Banco de dados em memória (arrays JavaScript)
- Funções helper para CRUD operations

**Recomendação para Produção:**
- Migrar para ORM (Sequelize, TypeORM, Prisma)
- Implementar banco de dados real (PostgreSQL, MongoDB)

## 4. Padrões de Design

### 4.1 Container/Presentational Pattern
**Descrição:** Separação entre componentes com lógica (Container) e componentes de apresentação (Presentational).

**Exemplo:**
```typescript
// Container Component (Smart)
export function DashboardContainer() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  return <DashboardView data={data} loading={loading} />
}

// Presentational Component (Dumb)
export function DashboardView({ data, loading }) {
  if (loading) return <Spinner />
  return <div>{/* Renderização */}</div>
}
```

### 4.2 Context + Provider Pattern
**Descrição:** Gerenciamento de estado global sem prop drilling.

**Implementação:**
```typescript
// Provider
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  // ...lógica
  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

// Consumer
function Component() {
  const { user } = useAuth()
  // ...usar dados
}
```

### 4.3 HOC (Higher-Order Component) Pattern
**Descrição:** Componente que recebe outro componente e retorna versão aprimorada.

**Exemplo:**
```typescript
export function ProtectedRoute() {
  const { isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return <Navigate to="/login" />
  }

  return <Outlet />
}
```

### 4.4 Custom Hooks Pattern
**Descrição:** Extração de lógica reutilizável em hooks customizados.

**Exemplo:**
```typescript
export function useToast() {
  const [toasts, setToasts] = useState([])

  const toast = (message) => {
    // ...lógica
  }

  return { toasts, toast }
}
```

## 5. Fluxo de Dados

### 5.1 Fluxo de Autenticação

```
1. Usuário preenche formulário de login
   ↓
2. Frontend envia POST /api/auth/login
   ↓
3. Backend valida credenciais
   ↓
4. Backend gera JWT e retorna
   ↓
5. Frontend armazena token no localStorage
   ↓
6. Frontend atualiza AuthContext
   ↓
7. Usuário é redirecionado para dashboard
```

### 5.2 Fluxo de Requisição Protegida

```
1. Componente monta e precisa de dados
   ↓
2. Hook/Component faz requisição à API
   ↓
3. Middleware authenticateToken intercepta
   ↓
4. Verifica JWT do header/cookie
   ↓
5. Se válido: adiciona user ao req e continua
   Se inválido: retorna 401/403
   ↓
6. Controller processa requisição
   ↓
7. Model acessa/modifica dados
   ↓
8. Controller retorna resposta
   ↓
9. Frontend recebe e atualiza estado
   ↓
10. Componente re-renderiza com novos dados
```

### 5.3 Fluxo de Criação de Transação

```
Frontend:
1. Usuário preenche TransactionForm
   ↓
2. onSubmit chama createTransaction
   ↓
3. Função faz POST /api/transactions
   ↓

Backend:
4. authenticateToken valida usuário
   ↓
5. transaction.controller.createTransaction
   ↓
6. Valida dados de entrada
   ↓
7. database.addTransaction
   ↓
8. Retorna transação criada
   ↓

Frontend:
9. Recebe resposta da API
   ↓
10. Atualiza estado local
   ↓
11. Exibe toast de sucesso
   ↓
12. Re-renderiza lista de transações
```

## 6. Comunicação entre Camadas

### 6.1 Frontend → Backend

**Protocolo:** HTTP/HTTPS
**Formato:** JSON
**Autenticação:** Bearer Token (JWT)

**Headers Padrão:**
```
Content-Type: application/json
Authorization: Bearer <token>
```

### 6.2 Backend → Database

**Implementação Atual:** Funções JavaScript diretas
**Recomendação:** ORM com pool de conexões

## 7. Segurança da Arquitetura

### 7.1 Autenticação e Autorização
- JWT stateless para escalabilidade
- Tokens com expiração configurável
- Hashing de senhas com bcrypt
- Validação em cada endpoint protegido

### 7.2 Proteção contra Ataques
- CORS configurado para origens específicas
- Validação de entrada de dados
- Sanitização de dados do usuário
- Rate limiting (recomendado para produção)

### 7.3 Segurança de Dados
- Senhas nunca retornadas nas respostas
- Tokens armazenados de forma segura
- Logs sem informações sensíveis

## 8. Escalabilidade

### 8.1 Frontend
- Code splitting com React.lazy
- Cache de assets estáticos
- CDN para distribuição de conteúdo
- Service Workers para cache offline

### 8.2 Backend
- Stateless design permite múltiplas instâncias
- Load balancer para distribuir requisições
- Cache de consultas frequentes (Redis)
- Queue para processamento assíncrono

## 9. Monitoramento e Logs

### 9.1 Frontend
- Error boundaries para captura de erros
- Analytics de uso (Google Analytics, Mixpanel)
- Performance monitoring (Lighthouse)

### 9.2 Backend
- Logs estruturados (Winston, Pino)
- Monitoramento de erros (Sentry)
- Métricas de performance (Prometheus)
- Health checks para disponibilidade

## 10. Deploy

### 10.1 Frontend
**Opções recomendadas:**
- Vercel
- Netlify
- AWS S3 + CloudFront
- GitHub Pages

### 10.2 Backend
**Opções recomendadas:**
- Heroku
- Railway
- AWS EC2 / ECS
- DigitalOcean
- Render

### 10.3 Variáveis de Ambiente

**Frontend:**
```env
VITE_API_URL=https://api.plutusgrip.com
```

**Backend:**
```env
PORT=8000
NODE_ENV=production
JWT_SECRET=<secret_key>
JWT_EXPIRES_IN=86400
CORS_ORIGIN=https://plutusgrip.com
DATABASE_URL=<database_connection_string>
```
