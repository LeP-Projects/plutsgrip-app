# Guia de Organização da Documentação

Este guia explica como toda a documentação do PlutusGrip está organizada, onde encontrar informações específicas e como contribuir com a documentação.

---

## 📚 Visão Geral

A documentação do PlutusGrip está organizada em **três níveis principais**:

1. **📂 Documentação Geral (Root)** - Informações gerais do projeto
2. **🔌 Documentação do Backend** - Detalhes técnicos da API
3. **🎨 Documentação do Frontend** - Detalhes técnicos da interface

---

## 🗂️ Estrutura da Documentação

```
plutsgrip-app/
├── README.md                      # 🏠 Página inicial do projeto
├── GUIA_ORGANIZACAO.md            # 📖 Este arquivo
│
├── docs/                          # 📂 Documentação Geral
│   ├── setup.md                   # Guia de instalação
│   ├── contribuindo.md            # Guia de contribuição
│   ├── docker.md                  # Guia do Docker
│   ├── migracao-docker.md         # Migração Docker
│   └── deploy-producao.md         # Checklist de produção
│
├── plutsgrip-api/                 # 🔌 Backend
│   ├── README.md                  # Visão geral do backend
│   └── docs/                      # Documentação técnica do backend
│       ├── arquitetura.md         # Arquitetura do backend
│       ├── endpoints-api.md       # Referência completa da API
│       ├── autenticacao.md        # Sistema de autenticação
│       ├── banco-dados.md         # Schema e migrations
│       └── guia-setup.md          # Setup do backend
│
└── plutsgrip-frond-refac/         # 🎨 Frontend
    ├── README.md                  # Visão geral do frontend
    └── docs/                      # Documentação técnica do frontend
        ├── 00-indice.md           # Índice da documentação
        ├── 01-visao-geral.md      # Visão geral e objetivos
        ├── 02-arquitetura.md      # Arquitetura do frontend
        ├── 05-testes.md           # Guia de testes
        ├── 06-bugs-corrigidos.md  # Histórico de bugs
        ├── 07-componentes.md      # Catálogo de componentes
        └── 09-guia-desenvolvimento.md  # Workflow e convenções
```

---

## 📂 Documentação Geral (Root)

**Localização**: `docs/`

**Público-alvo**: Todos (desenvolvedores, DevOps, contributors)

**Propósito**: Documentação sobre o projeto como um todo, configuração inicial e deploy.

### Arquivos

| Arquivo | Descrição | Quando Usar |
|---------|-----------|-------------|
| `setup.md` | Guia completo de instalação (dev e prod) | Primeira vez configurando o projeto |
| `contribuindo.md` | Como contribuir com o projeto | Antes de fazer um PR |
| `docker.md` | Guia completo do Docker (dev e prod) | Trabalhando com Docker |
| `migracao-docker.md` | Guia de migração da estrutura Docker | Migrando setup antigo |
| `deploy-producao.md` | Checklist completo para produção | Fazendo deploy |

### Quando Consultar

- **Primeira vez no projeto**: `setup.md`
- **Quero contribuir**: `contribuindo.md`
- **Problemas com Docker**: `docker.md`
- **Deploy em produção**: `deploy-producao.md`
- **Migrando setup Docker**: `migracao-docker.md`

---

## 🔌 Documentação do Backend

**Localização**: `plutsgrip-api/docs/`

**Público-alvo**: Desenvolvedores backend, API consumers

**Propósito**: Documentação técnica da API FastAPI, arquitetura, endpoints e banco de dados.

### Arquivos

| Arquivo | Descrição | Quando Usar |
|---------|-----------|-------------|
| `arquitetura.md` | Estrutura e padrões do backend | Entendendo a organização do código |
| `endpoints-api.md` | Referência completa da API (35+ endpoints) | Consumindo a API, desenvolvendo features |
| `autenticacao.md` | Sistema de autenticação JWT | Implementando/debugando auth |
| `banco-dados.md` | Schema, modelos e migrations | Trabalhando com banco de dados |
| `guia-setup.md` | Setup específico do backend | Configurando apenas o backend |

### Quando Consultar

- **Desenvolvendo API**: `arquitetura.md` → `endpoints-api.md`
- **Problemas de autenticação**: `autenticacao.md`
- **Trabalhando com banco**: `banco-dados.md`
- **Setup local do backend**: `guia-setup.md`

### Documentação Adicional

A API também possui **documentação interativa automática**:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

---

## 🎨 Documentação do Frontend

**Localização**: `plutsgrip-frond-refac/docs/`

**Público-alvo**: Desenvolvedores frontend

**Propósito**: Documentação técnica do frontend React, componentes, testes e workflows.

### Arquivos

| Arquivo | Descrição | Quando Usar |
|---------|-----------|-------------|
| `00-indice.md` | Índice completo da documentação | Navegação rápida |
| `01-visao-geral.md` | Objetivos, funcionalidades e stack | Overview do frontend |
| `02-arquitetura.md` | Estrutura do frontend, fluxo de dados | Entendendo organização |
| `05-testes.md` | Guia completo de testes (Vitest, Playwright) | Escrevendo/executando testes |
| `06-bugs-corrigidos.md` | Histórico de bugs e soluções | Referência de problemas |
| `07-componentes.md` | Catálogo de 35+ componentes | Desenvolvendo UI |
| `09-guia-desenvolvimento.md` | Workflow, convenções, boas práticas | Desenvolvimento diário |

### Quando Consultar

- **Primeira vez no frontend**: `01-visao-geral.md` → `02-arquitetura.md`
- **Desenvolvendo componentes**: `07-componentes.md`
- **Escrevendo testes**: `05-testes.md`
- **Workflow diário**: `09-guia-desenvolvimento.md`
- **Debugging**: `06-bugs-corrigidos.md`
- **Navegação rápida**: `00-indice.md`

---

## 🎯 Fluxos de Uso

### Para Novos Desenvolvedores

1. **📖 Comece aqui**: `README.md` (raiz)
2. **⚙️ Setup**: `docs/setup.md`
3. **🏗️ Entenda o projeto**:
   - Backend: `plutsgrip-api/docs/arquitetura.md`
   - Frontend: `plutsgrip-frond-refac/docs/01-visao-geral.md`
4. **💻 Workflow**:
   - `docs/contribuindo.md`
   - `plutsgrip-frond-refac/docs/09-guia-desenvolvimento.md`

### Para Backend Developers

1. `plutsgrip-api/README.md` - Overview
2. `plutsgrip-api/docs/arquitetura.md` - Arquitetura
3. `plutsgrip-api/docs/endpoints-api.md` - Referência API
4. `docs/contribuindo.md` - Contribuindo

### Para Frontend Developers

1. `plutsgrip-frond-refac/README.md` - Overview
2. `plutsgrip-frond-refac/docs/00-indice.md` - Índice completo
3. `plutsgrip-frond-refac/docs/02-arquitetura.md` - Arquitetura
4. `plutsgrip-frond-refac/docs/07-componentes.md` - Componentes
5. `plutsgrip-frond-refac/docs/09-guia-desenvolvimento.md` - Workflow

### Para DevOps/Deploy

1. `docs/docker.md` - Docker completo
2. `docs/deploy-producao.md` - Checklist produção
3. `PRODUCTION_CHECKLIST.md` - Checklist detalhado (legado)
4. `DOCKER_README.md` - Docker README (legado)

---

## 📝 Convenções da Documentação

### Idioma

- **Português**: Toda a documentação oficial
- **Código**: Comentários em inglês (convenção da comunidade)
- **Commits**: Inglês (Conventional Commits)

### Formato

- **Markdown**: Todos os arquivos usam Markdown (.md)
- **Emojis**: Usados para navegação visual
- **Links**: Referências cruzadas entre documentos
- **Exemplos**: Sempre que possível, incluir exemplos práticos

### Estrutura dos Documentos

Documentos geralmente seguem esta estrutura:

```markdown
# Título do Documento

Breve descrição do conteúdo

---

## 📋 Índice

- [Seção 1](#seção-1)
- [Seção 2](#seção-2)

---

## Seção 1

Conteúdo...

### Subseção 1.1

Conteúdo...

---

## Referências

- Links relacionados
- Documentos relacionados
```

---

## 🔍 Como Encontrar Informações

### Por Assunto

| Assunto | Onde Encontrar |
|---------|----------------|
| **Setup inicial** | `docs/setup.md` |
| **Docker** | `docs/docker.md` |
| **Deploy** | `docs/deploy-producao.md` |
| **Contribuir** | `docs/contribuindo.md` |
| **API Endpoints** | `plutsgrip-api/docs/endpoints-api.md` |
| **Autenticação** | `plutsgrip-api/docs/autenticacao.md` |
| **Banco de Dados** | `plutsgrip-api/docs/banco-dados.md` |
| **Componentes React** | `plutsgrip-frond-refac/docs/07-componentes.md` |
| **Testes** | `plutsgrip-frond-refac/docs/05-testes.md` |
| **Arquitetura Backend** | `plutsgrip-api/docs/arquitetura.md` |
| **Arquitetura Frontend** | `plutsgrip-frond-refac/docs/02-arquitetura.md` |

### Por Tipo de Problema

| Problema | Documentação |
|----------|--------------|
| Não consigo instalar | `docs/setup.md` |
| Erro no Docker | `docs/docker.md` |
| Não sei como contribuir | `docs/contribuindo.md` |
| API não funciona | `plutsgrip-api/docs/endpoints-api.md` |
| Erro de autenticação | `plutsgrip-api/docs/autenticacao.md` |
| Componente não funciona | `plutsgrip-frond-refac/docs/07-componentes.md` |
| Testes falhando | `plutsgrip-frond-refac/docs/05-testes.md` |
| Deploy não funciona | `docs/deploy-producao.md` |

---

## 🤝 Contribuindo com a Documentação

### Antes de Contribuir

1. Leia este guia completo
2. Verifique se a informação já existe
3. Identifique o local correto para sua contribuição

### Onde Adicionar Documentação

| Tipo de Contribuição | Localização |
|---------------------|-------------|
| Informação geral do projeto | `docs/` |
| Setup, instalação | `docs/setup.md` |
| Docker, containers | `docs/docker.md` |
| Deploy, produção | `docs/deploy-producao.md` |
| Backend, API | `plutsgrip-api/docs/` |
| Frontend, UI | `plutsgrip-frond-refac/docs/` |
| Componente novo | `plutsgrip-frond-refac/docs/07-componentes.md` |

### Passos para Contribuir

1. **Identifique o arquivo correto**
   - Consulte a estrutura acima
   - Verifique o índice do documento

2. **Faça as alterações**
   - Mantenha o estilo existente
   - Use emojis apropriados
   - Adicione exemplos quando possível

3. **Atualize referências cruzadas**
   - Links entre documentos
   - Índices e tabelas de conteúdo

4. **Teste os links**
   - Verifique se todos os links funcionam
   - Confirme que exemplos de código são válidos

5. **Submeta um PR**
   - Título descritivo
   - Descrição do que foi alterado/adicionado
   - Mencione arquivos relacionados

### Convenções de Escrita

- **Seja claro e conciso**
- **Use exemplos práticos**
- **Mantenha o tom profissional mas acessível**
- **Prefira listas a parágrafos longos**
- **Use tabelas para comparações**
- **Adicione diagramas quando ajudar**

---

## 📊 Status da Documentação

### ✅ Completa

- README.md principal
- Documentação Docker
- Documentação do Frontend
- Guia de organização

### 🔄 Em Atualização

- Documentação do Backend (tradução em andamento)
- Guia de contribuição
- Guia de setup

### 📋 Planejada

- Guia de troubleshooting centralizado
- Guia de performance
- Guia de segurança
- FAQ centralizada

---

## 🔗 Links Rápidos

### Essenciais

- [README Principal](README.md)
- [Setup](docs/setup.md)
- [Docker](docs/docker.md)
- [Contribuindo](docs/contribuindo.md)

### Backend

- [README Backend](plutsgrip-api/README.md)
- [Arquitetura Backend](plutsgrip-api/docs/arquitetura.md)
- [API Endpoints](plutsgrip-api/docs/endpoints-api.md)

### Frontend

- [README Frontend](plutsgrip-frond-refac/README.md)
- [Índice Frontend](plutsgrip-frond-refac/docs/00-indice.md)
- [Arquitetura Frontend](plutsgrip-frond-refac/docs/02-arquitetura.md)
- [Componentes](plutsgrip-frond-refac/docs/07-componentes.md)

---

## 💡 Dicas Úteis

### Para Navegação Rápida

1. **Use o índice** de cada documento
2. **Busque no navegador** (Ctrl+F / Cmd+F)
3. **Comece pelo README** de cada área
4. **Consulte este guia** quando estiver perdido

### Para Melhor Aproveitamento

1. **Leia os READMEs** primeiro (raiz, backend, frontend)
2. **Marque os favoritos** nos documentos que mais usa
3. **Mantenha** uma aba com este guia aberta
4. **Contribua** quando encontrar algo incompleto

---

## 📞 Precisa de Ajuda?

Se não encontrou o que procura na documentação:

1. **Verifique este guia** novamente
2. **Procure nos índices** dos documentos
3. **Abra uma Issue** no GitHub
4. **Pergunte na Discussion** do repositório
5. **Envie um email** para paulodjunior.dev@gmail.com

---

## 📝 Histórico de Mudanças

### Janeiro 2026
- ✅ Criação do guia de organização
- ✅ Reestruturação da documentação
- ✅ Tradução para português
- ✅ Padronização de formato

### Próximas Atualizações
- 🔄 Tradução completa do backend
- 🔄 Melhorias no guia de contribuição
- 🔄 FAQ centralizada

---

<div align="center">

**Documentação mantida com ❤️**

*Última atualização: Janeiro 2026*

[⬆️ Voltar ao README Principal](README.md)

</div>
