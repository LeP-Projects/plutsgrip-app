# Guia de Migração de Next.js para React + TypeScript

## 1. Introdução

Este documento fornece um guia completo para migrar uma aplicação Next.js para React puro com TypeScript, Vite e TailwindCSS, incluindo a criação de um backend Express.js separado.

## 2. Diferenças Fundamentais

### 2.1 Renderização

| Aspecto | Next.js | React + Vite |
|---------|---------|--------------|
| SSR (Server-Side Rendering) | Nativo | Não disponível |
| SSG (Static Site Generation) | Nativo | Build estático apenas |
| Client-Side Rendering | Sim | Sim (padrão) |
| Hydration | Automática | Não aplicável |

### 2.2 Roteamento

| Aspecto | Next.js | React + Vite |
|---------|---------|--------------|
| Tipo | File-based | Library-based (React Router) |
| Definição | Automática por estrutura de pastas | Manual via código |
| Dynamic Routes | [id].tsx | :id na rota |
| Nested Routes | Pastas aninhadas | Route aninhadas no código |

### 2.3 API Routes

| Aspecto | Next.js | React + Vite |
|---------|---------|--------------|
| Localização | /pages/api ou /app/api | Backend separado (Express) |
| Runtime | Node.js integrado | Servidor independente |
| Deploy | Junto com frontend | Deploy separado |

## 3. Processo de Migração

### 3.1 Configuração do Ambiente

#### Passo 1: Criar Projeto React com Vite
```bash
npm create vite@latest nome-do-projeto -- --template react-ts
cd nome-do-projeto
npm install
```

#### Passo 2: Instalar Dependências Necessárias
```bash
# React Router para roteamento
npm install react-router-dom

# TailwindCSS
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# Utilitários
npm install clsx tailwind-merge class-variance-authority

# Componentes Radix UI (conforme necessário)
npm install @radix-ui/react-dialog @radix-ui/react-dropdown-menu
# ... outros componentes

# Outras bibliotecas
npm install date-fns lucide-react
```

#### Passo 3: Configurar TailwindCSS
**tailwind.config.js:**
```javascript
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Suas cores customizadas
      },
    },
  },
  plugins: [],
}
```

**src/index.css:**
```css
@import "tailwindcss";

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}
```

#### Passo 4: Configurar Path Aliases
**vite.config.ts:**
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

**tsconfig.json:**
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### 3.2 Migração de Componentes

#### Remover Diretivas "use client"
**Next.js:**
```typescript
"use client"

export function Component() {
  // ...
}
```

**React:**
```typescript
// Simplesmente remova a diretiva
export function Component() {
  // ...
}
```

#### Substituir next/link por react-router-dom
**Next.js:**
```typescript
import Link from 'next/link'

<Link href="/dashboard">Dashboard</Link>
```

**React:**
```typescript
import { Link } from 'react-router-dom'

<Link to="/dashboard">Dashboard</Link>
```

#### Substituir next/navigation
**Next.js:**
```typescript
import { useRouter } from 'next/navigation'

function Component() {
  const router = useRouter()
  router.push('/login')
}
```

**React:**
```typescript
import { useNavigate } from 'react-router-dom'

function Component() {
  const navigate = useNavigate()
  navigate('/login')
}
```

#### Substituir next/image
**Next.js:**
```typescript
import Image from 'next/image'

<Image
  src="/logo.png"
  alt="Logo"
  width={200}
  height={100}
/>
```

**React:**
```typescript
<img
  src="/logo.png"
  alt="Logo"
  className="w-[200px] h-[100px]"
/>
```

### 3.3 Migração de Roteamento

#### Definir Sistema de Rotas
**src/App.tsx:**
```typescript
import { BrowserRouter, Routes, Route } from 'react-router-dom'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />

        {/* Rotas protegidas */}
        <Route element={<ProtectedRoute />}>
          <Route path="/profile" element={<ProfilePage />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  )
}
```

#### Implementar Proteção de Rotas
**src/components/ProtectedRoute.tsx:**
```typescript
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

export function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return <LoadingSpinner />
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}
```

### 3.4 Migração de API Routes para Express

#### Next.js API Route
**pages/api/auth/login.ts:**
```typescript
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    const { email, password } = req.body
    // Lógica de autenticação
    res.status(200).json({ token: '...' })
  }
}
```

#### Express.js Equivalente
**backend/src/routes/auth.routes.js:**
```javascript
import express from 'express'
import { login } from '../controllers/auth.controller.js'

const router = express.Router()

router.post('/login', login)

export default router
```

**backend/src/controllers/auth.controller.js:**
```javascript
export const login = async (req, res) => {
  try {
    const { email, password } = req.body
    // Lógica de autenticação
    res.status(200).json({ token: '...' })
  } catch (error) {
    res.status(500).json({ error: 'Erro ao fazer login' })
  }
}
```

#### Criar Servidor Express
**backend/src/server.js:**
```javascript
import express from 'express'
import cors from 'cors'
import authRoutes from './routes/auth.routes.js'

const app = express()

app.use(cors())
app.use(express.json())

app.use('/api/auth', authRoutes)

app.listen(8000, () => {
  console.log('Servidor rodando na porta 8000')
})
```

### 3.5 Migração de Metadata

#### Next.js Metadata
**app/layout.tsx:**
```typescript
export const metadata = {
  title: 'Minha App',
  description: 'Descrição da app',
}
```

#### React Helmet
```bash
npm install react-helmet-async
```

**src/main.tsx:**
```typescript
import { HelmetProvider } from 'react-helmet-async'

<HelmetProvider>
  <App />
</HelmetProvider>
```

**src/pages/HomePage.tsx:**
```typescript
import { Helmet } from 'react-helmet-async'

export function HomePage() {
  return (
    <>
      <Helmet>
        <title>Minha App - Home</title>
        <meta name="description" content="Descrição da página" />
      </Helmet>
      {/* Conteúdo */}
    </>
  )
}
```

### 3.6 Migração de Fontes

#### Next.js
```typescript
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

<body className={inter.className}>
```

#### React
**index.html:**
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
```

**tailwind.config.js:**
```javascript
export default {
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
}
```

### 3.7 Migração de Middleware

#### Next.js Middleware
**middleware.ts:**
```typescript
export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')

  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
}

export const config = {
  matcher: '/dashboard/:path*',
}
```

#### React Equivalente
```typescript
// Usando ProtectedRoute component (mostrado anteriormente)
<Route element={<ProtectedRoute />}>
  <Route path="/dashboard/*" element={<Dashboard />} />
</Route>
```

## 4. Estrutura de Pastas Recomendada

### 4.1 Next.js (Antes)
```
app/
├── (auth)/
│   ├── login/
│   │   └── page.tsx
│   └── register/
│       └── page.tsx
├── dashboard/
│   └── page.tsx
├── api/
│   └── auth/
│       └── route.ts
├── layout.tsx
└── page.tsx
```

### 4.2 React + Vite (Depois)
```
src/
├── components/
│   ├── Button/
│   │   ├── Button.tsx
│   │   └── Button.types.ts
│   └── ProtectedRoute/
│       └── ProtectedRoute.tsx
├── contexts/
│   ├── AuthContext.tsx
│   └── ThemeContext.tsx
├── hooks/
│   └── useAuth.ts
├── pages/
│   ├── Login/
│   │   ├── Login.tsx
│   │   └── Login.types.ts
│   ├── Register/
│   └── Dashboard/
├── lib/
│   └── utils.ts
├── App.tsx
├── main.tsx
└── index.css
```

## 5. Checklist de Migração

### Frontend
- [ ] Projeto Vite criado
- [ ] TailwindCSS configurado
- [ ] React Router instalado e configurado
- [ ] Path aliases configurados
- [ ] Componentes migrados (remover "use client")
- [ ] Rotas definidas no App.tsx
- [ ] next/link substituído por react-router-dom
- [ ] next/navigation substituído por react-router-dom
- [ ] next/image substituído por img nativo
- [ ] Metadata migrada para React Helmet
- [ ] Fontes configuradas via CSS
- [ ] Contexts implementados
- [ ] Proteção de rotas implementada

### Backend
- [ ] Servidor Express criado
- [ ] Estrutura de pastas definida
- [ ] Rotas de autenticação implementadas
- [ ] Controllers criados
- [ ] Middleware de autenticação implementado
- [ ] CORS configurado
- [ ] Variáveis de ambiente configuradas
- [ ] Validação de dados implementada
- [ ] Tratamento de erros implementado

### Testes
- [ ] Frontend roda sem erros
- [ ] Backend roda sem erros
- [ ] Autenticação funciona
- [ ] Rotas protegidas funcionam
- [ ] API endpoints respondem corretamente
- [ ] Navegação entre páginas funciona
- [ ] Tema escuro/claro funciona
- [ ] Responsividade mantida

## 6. Comandos Úteis

### Desenvolvimento
```bash
# Frontend
cd plutsgrip-front-react
npm run dev

# Backend
cd plutsgrip-backend
npm run dev
```

### Build
```bash
# Frontend
cd plutsgrip-front-react
npm run build
npm run preview

# Backend
cd plutsgrip-backend
npm start
```

## 7. Troubleshooting Comum

### Problema 1: Módulos não encontrados
**Erro:** `Cannot find module '@/components/Button'`

**Solução:** Verificar configuração de path aliases no vite.config.ts e tsconfig.json

### Problema 2: CORS Error
**Erro:** `Access to fetch blocked by CORS policy`

**Solução:** Configurar CORS no backend:
```javascript
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}))
```

### Problema 3: Rotas não funcionam após deploy
**Erro:** 404 ao acessar rotas diretamente

**Solução:** Configurar fallback para index.html no servidor

### Problema 4: Autenticação não persiste
**Erro:** Usuário desloga ao atualizar página

**Solução:** Implementar verificação de token no mount do AuthProvider

## 8. Recursos Adicionais

### Documentação Oficial
- [React](https://react.dev/)
- [Vite](https://vitejs.dev/)
- [React Router](https://reactrouter.com/)
- [TailwindCSS](https://tailwindcss.com/)
- [Express.js](https://expressjs.com/)

### Ferramentas Úteis
- **Postman/Insomnia:** Testar API endpoints
- **React DevTools:** Debug de componentes
- **Redux DevTools:** Debug de estado (se usar Redux)

## 9. Próximos Passos

Após concluir a migração:
1. Implementar testes unitários (Jest, Vitest)
2. Implementar testes E2E (Playwright, Cypress)
3. Configurar CI/CD
4. Otimizar performance
5. Implementar analytics
6. Configurar monitoramento de erros (Sentry)
7. Documentar API (Swagger/OpenAPI)
