# Visão Geral do Projeto PlutusGrip Finance Tracker

## 1. Introdução

O PlutusGrip Finance Tracker é uma aplicação web para controle financeiro pessoal, desenvolvida originalmente em Next.js e migrada para React + TypeScript + TailwindCSS com backend Express.js. A aplicação permite aos usuários gerenciar transações financeiras, categorizar despesas e receitas, e visualizar relatórios detalhados de suas finanças.

## 2. Objetivos do Projeto

### 2.1 Objetivo Principal
Fornecer uma plataforma intuitiva e eficiente para gestão de finanças pessoais, permitindo controle detalhado de receitas e despesas.

### 2.2 Objetivos Secundários
- Proporcionar visualizações gráficas claras do estado financeiro
- Suportar múltiplas moedas (BRL e USD)
- Oferecer interface responsiva e acessível
- Implementar sistema de autenticação seguro
- Fornecer relatórios personalizáveis

## 3. Escopo Funcional

### 3.1 Funcionalidades Principais

#### Autenticação de Usuários
- Registro de novos usuários
- Login com email e senha
- Gerenciamento de sessões via JWT
- Proteção de rotas privadas

#### Gestão de Transações
- Criação de novas transações (receitas e despesas)
- Edição de transações existentes
- Remoção de transações
- Listagem com filtros por categoria, tipo e data
- Pesquisa de transações

#### Categorização
- Categorias pré-definidas para despesas e receitas
- Associação de transações a categorias
- Visualização por categoria

#### Relatórios e Dashboard
- Dashboard com resumo financeiro
- Gráficos de receitas e despesas
- Distribuição por categoria
- Análise temporal (mensal, anual)
- Exportação de dados

#### Personalização
- Tema claro e escuro
- Seleção de idioma (Português e Inglês)
- Seleção de moeda (BRL e USD)
- Conversão automática de câmbio

## 4. Arquitetura Geral

### 4.1 Stack Tecnológica

#### Frontend
- React 18+ - Biblioteca JavaScript para interfaces
- TypeScript - Superset tipado do JavaScript
- Vite - Ferramenta de build e desenvolvimento
- TailwindCSS - Framework CSS utility-first
- React Router DOM - Gerenciamento de rotas
- Radix UI - Componentes acessíveis

#### Backend
- Node.js - Ambiente de execução JavaScript
- Express.js - Framework web minimalista
- JWT - Autenticação baseada em tokens
- bcryptjs - Hashing de senhas

### 4.2 Padrões Arquiteturais
- Componentização modular
- Separação de responsabilidades (Smart/Dumb Components)
- API RESTful
- Autenticação stateless via JWT
- Context API para estado global

## 5. Público-Alvo

### 5.1 Perfil dos Usuários
- Indivíduos que buscam organizar suas finanças pessoais
- Usuários que necessitam de controle detalhado de despesas
- Pessoas que desejam visualizar seus padrões de consumo
- Usuários que trabalham com múltiplas moedas

### 5.2 Requisitos dos Usuários
- Interface intuitiva e fácil de usar
- Acesso rápido às informações financeiras
- Segurança dos dados pessoais
- Visualizações claras e objetivas
- Disponibilidade multiplataforma (web)

## 6. Diferenças entre Next.js e React Puro

### 6.1 Principais Diferenças

| Aspecto | Next.js | React + Vite |
|---------|---------|--------------|
| Renderização | Server-Side e Client-Side | Client-Side apenas |
| Roteamento | File-based automático | React Router manual |
| API Routes | Integradas no framework | Backend separado (Express) |
| Imagens | next/image otimizado | Tag img nativa |
| Metadata | Componente Metadata | React Helmet |
| Fontes | next/font otimizado | Import CSS direto |

### 6.2 Motivações para Migração
- Maior controle sobre a arquitetura
- Separação clara entre frontend e backend
- Flexibilidade no gerenciamento de rotas
- Possibilidade de deploy independente
- Redução de dependências do Next.js

## 7. Estrutura de Diretórios

### 7.1 Frontend
```
plutsgrip-front-react/
├── src/
│   ├── components/      # Componentes reutilizáveis
│   ├── contexts/        # Contexts da aplicação
│   ├── hooks/           # Custom hooks
│   ├── lib/             # Utilitários
│   ├── pages/           # Páginas da aplicação
│   ├── styles/          # Estilos globais
│   └── utils/           # Funções auxiliares
├── public/              # Arquivos estáticos
└── docs/                # Documentação
```

### 7.2 Backend
```
plutsgrip-backend/
└── src/
    ├── controllers/     # Lógica de negócio
    ├── middleware/      # Middlewares
    ├── models/          # Modelos de dados
    ├── routes/          # Definição de rotas
    └── server.js        # Servidor principal
```

## 8. Requisitos do Sistema

### 8.1 Frontend
- Node.js >= 18.x
- NPM ou Yarn
- Navegador moderno (Chrome, Firefox, Safari, Edge)

### 8.2 Backend
- Node.js >= 18.x
- NPM ou Yarn
- Porta 8000 disponível

## 9. Segurança

### 9.1 Medidas Implementadas
- Autenticação via JWT
- Hashing de senhas com bcrypt
- Validação de entrada de dados
- Proteção contra CORS
- Tokens com expiração
- Middleware de autenticação

### 9.2 Recomendações Adicionais
- Uso de HTTPS em produção
- Rotação periódica de JWT_SECRET
- Implementação de rate limiting
- Logs de segurança
- Backup regular de dados

## 10. Próximos Passos

### 10.1 Melhorias Futuras
- Implementação de banco de dados real (PostgreSQL/MongoDB)
- Backup automático de dados
- Notificações e alertas
- Metas financeiras
- Sincronização multi-dispositivo
- Modo offline

### 10.2 Otimizações
- Lazy loading de componentes
- Cache de requisições
- Otimização de imagens
- Service Workers para PWA
