# Documentação do Banco de Dados - PlutusGrip API

## Visão Geral

PlutusGrip utiliza **PostgreSQL 16+** como banco de dados principal, com uma arquitetura escalável que suporta:

- Transações financeiras (receitas e despesas)
- Categorização inteligente
- Sistema de orçamentos
- Relatórios e analytics
- Auditoria completa
- Multi-moeda (futuro)

---

## Diagramas de Banco de Dados

### 📊 Como Visualizar os Diagramas PlantUML

#### Opção 1: Online (Mais Rápido)
1. Acesse: https://www.plantuml.com/plantuml/uml/
2. Copie o conteúdo de um dos arquivos `.puml` abaixo
3. Cole no editor online
4. Veja o diagrama renderizado instantaneamente

#### Opção 2: VS Code (Recomendado)
1. Instale a extensão: **PlantUML** (jebbs.plantuml)
2. Instale Java JRE (necessário para renderização)
3. Abra o arquivo `.puml`
4. Pressione `Alt+D` para preview

#### Opção 3: IntelliJ/PyCharm
1. Plugin PlantUML já vem integrado
2. Abra o arquivo `.puml`
3. Visualize no painel lateral

#### Opção 4: CLI (Gerar PNG/SVG)
```bash
# Instalar PlantUML
brew install plantuml  # macOS
sudo apt-get install plantuml  # Linux

# Gerar diagrama
plantuml docs/database-diagram.puml
plantuml docs/database-diagram-mvp.puml

# Arquivos PNG serão gerados no mesmo diretório
```

---

## Diagramas Disponíveis

### 1. **database-diagram-mvp.puml** - MVP (Implementado) ✅

Diagrama simplificado com as **3 tabelas principais** já implementadas:

- ✅ **users** - Usuários e autenticação
- ✅ **categories** - Categorias de transações
- ✅ **transactions** - Transações financeiras

**Quando usar:** Para entender a estrutura básica atual do banco.

**Arquivo:** `docs/database-diagram-mvp.puml`

---

### 2. **database-diagram.puml** - Completo (Roadmap) 🚀

Diagrama completo incluindo **todas as tabelas futuras**:

**Core (Implementadas):**
- ✅ users
- ✅ categories
- ✅ transactions

**Financial Features (Futuro):**
- 🔜 budgets
- 🔜 recurring_transactions
- 🔜 attachments
- 🔜 savings_goals
- 🔜 account_balances

**System (Futuro):**
- 🔜 refresh_tokens
- 🔜 audit_logs
- 🔜 notifications
- 🔜 user_preferences

**Quando usar:** Para planejamento e arquitetura completa do sistema.

**Arquivo:** `docs/database-diagram.puml`

---

## Estrutura Detalhada das Tabelas

### 📋 Tabelas Implementadas (MVP)

#### **users**
Tabela de usuários e autenticação.

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_created_at ON users(created_at);
```

**Campos:**
- `id` - Identificador único
- `email` - Email único para login
- `name` - Nome completo do usuário
- `hashed_password` - Senha criptografada (bcrypt)
- `created_at` - Data de criação
- `updated_at` - Última atualização

**Relacionamentos:**
- 1 user → N transactions (CASCADE DELETE)
- 1 user → N categories (futuro)

---

#### **categories**
Categorias para classificação de transações.

```sql
CREATE TYPE transaction_type AS ENUM ('income', 'expense');

CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    type transaction_type NOT NULL,
    color VARCHAR(7),
    icon VARCHAR(50),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_color_format CHECK (color ~ '^#[0-9A-Fa-f]{6}$')
);

CREATE INDEX idx_categories_type ON categories(type);
```

**Campos:**
- `id` - Identificador único
- `name` - Nome da categoria (ex: "Alimentação")
- `type` - Tipo: 'income' ou 'expense'
- `color` - Cor em hexadecimal (#RRGGBB)
- `icon` - Nome do ícone para UI

**Categorias Padrão Sugeridas:**

**Income (Receitas):**
- Salário
- Freelance
- Investimentos
- Outros

**Expense (Despesas):**
- Alimentação
- Transporte
- Moradia
- Saúde
- Educação
- Lazer
- Compras
- Outros

---

#### **transactions**
Tabela principal de transações financeiras.

```sql
CREATE TABLE transactions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
    description VARCHAR(255) NOT NULL,
    amount NUMERIC(10, 2) NOT NULL,
    date DATE NOT NULL,
    type transaction_type NOT NULL,
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_amount_positive CHECK (amount > 0)
);

CREATE INDEX idx_transactions_user_date ON transactions(user_id, date DESC);
CREATE INDEX idx_transactions_user_type ON transactions(user_id, type);
CREATE INDEX idx_transactions_user_category ON transactions(user_id, category_id);
CREATE INDEX idx_transactions_date ON transactions(date);
CREATE INDEX idx_transactions_category ON transactions(category_id);
```

**Campos:**
- `id` - Identificador único
- `user_id` - Referência ao usuário (obrigatório)
- `category_id` - Referência à categoria (opcional)
- `description` - Descrição da transação
- `amount` - Valor (sempre positivo)
- `date` - Data da transação
- `type` - Tipo: 'income' ou 'expense'
- `notes` - Notas adicionais (opcional)

**Regras de Negócio:**
- `amount` deve ser > 0
- Deletar user → deleta todas transações (CASCADE)
- Deletar category → seta NULL na transação (SET NULL)
- Usuário só acessa suas próprias transações

---

### 🔮 Tabelas Futuras (Roadmap)

#### **budgets** (P2.5)
Controle de orçamentos por categoria.

**Campos principais:**
- `user_id`, `category_id`, `amount`
- `period` - 'weekly', 'monthly', 'yearly'
- `alert_threshold` - % para alertar (padrão: 80%)

**Exemplo:** Limite de R$ 1.000/mês em "Alimentação", alerta aos 80% (R$ 800).

---

#### **recurring_transactions** (P2.3)
Templates de transações recorrentes.

**Campos principais:**
- `frequency` - 'daily', 'weekly', 'monthly', 'yearly'
- `next_occurrence` - Próxima data de geração
- `is_active` - Ativar/pausar

**Exemplo:** Salário de R$ 5.000 todo dia 5 do mês.

---

#### **attachments** (P2.2)
Anexos de comprovantes/notas fiscais.

**Campos principais:**
- `transaction_id`, `file_url`, `file_name`
- `file_size` - Limite: 5MB
- `mime_type` - PDF, JPG, PNG

---

#### **audit_logs** (P3.7)
Log imutável de todas as ações.

**Campos principais:**
- `user_id`, `action`, `resource_type`, `resource_id`
- `old_values`, `new_values` - JSONB
- Logs nunca são deletados

---

## Migrations com Alembic

### Criar Nova Migration

```bash
# Migration automática (detecta mudanças nos models)
alembic revision --autogenerate -m "add budgets table"

# Migration manual
alembic revision -m "add custom index"
```

### Aplicar Migrations

```bash
# Aplicar todas pendentes
alembic upgrade head

# Verificar versão atual
alembic current

# Ver histórico
alembic history
```

### Reverter Migrations

```bash
# Reverter última
alembic downgrade -1

# Reverter para versão específica
alembic downgrade <revision_id>
```

---

## Índices e Performance

### Índices Implementados

**users:**
- `email` (UNIQUE) - Busca por email no login
- `created_at` - Ordenação de usuários

**categories:**
- `type` - Filtro por tipo (income/expense)

**transactions:**
- `(user_id, date DESC)` - Listagem de transações por usuário
- `(user_id, type)` - Filtro por tipo
- `(user_id, category_id)` - Filtro por categoria
- `date` - Queries por período
- `category_id` - Joins com categories

### Estratégias de Otimização

1. **Paginação obrigatória** em listagens grandes
2. **Eager loading** de relationships (SQLAlchemy `selectin`)
3. **Índices compostos** para queries comuns
4. **EXPLAIN ANALYZE** para queries lentas
5. **Connection pooling** configurado (10 connections, max 20)

---

## Backup e Restore

### Backup

```bash
# Backup completo
pg_dump -U plutusgrip_user plutusgrip_db > backup_$(date +%Y%m%d).sql

# Backup apenas schema
pg_dump -U plutusgrip_user -s plutusgrip_db > schema.sql

# Backup apenas dados
pg_dump -U plutusgrip_user -a plutusgrip_db > data.sql
```

### Restore

```bash
# Restore completo
psql -U plutusgrip_user plutusgrip_db < backup_20240115.sql
```

### Backup Automatizado (Produção)

```bash
# Cron job: backup diário às 3h
0 3 * * * pg_dump -U plutusgrip_user plutusgrip_db | gzip > /backups/db_$(date +\%Y\%m\%d).sql.gz
```

---

## Segurança

### Medidas Implementadas

1. **Passwords criptografados** - bcrypt
2. **SQL Injection** - Proteção via SQLAlchemy ORM
3. **Row-level security** - Usuário só acessa seus dados
4. **Prepared statements** - Queries parametrizadas
5. **Least privilege** - User do DB com mínimas permissões

### Permissões do Usuário DB

```sql
-- Produção: permissões mínimas
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO plutusgrip_user;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO plutusgrip_user;

-- Não dar DROP, CREATE TABLE, etc em produção
```

---

## Seeds de Dados

### Categorias Padrão

```sql
-- Income Categories
INSERT INTO categories (name, type, color, icon) VALUES
('Salário', 'income', '#4CAF50', 'currency-dollar'),
('Freelance', 'income', '#8BC34A', 'briefcase'),
('Investimentos', 'income', '#2196F3', 'trending-up'),
('Outros', 'income', '#9E9E9E', 'dots-horizontal');

-- Expense Categories
INSERT INTO categories (name, type, color, icon) VALUES
('Alimentação', 'expense', '#F44336', 'food'),
('Transporte', 'expense', '#FF9800', 'car'),
('Moradia', 'expense', '#9C27B0', 'home'),
('Saúde', 'expense', '#E91E63', 'medical-bag'),
('Educação', 'expense', '#3F51B5', 'school'),
('Lazer', 'expense', '#00BCD4', 'gamepad-variant'),
('Compras', 'expense', '#FFC107', 'cart'),
('Outros', 'expense', '#607D8B', 'dots-horizontal');
```

### Script de Seed (Futuro)

```bash
# TODO: Criar script
# python scripts/seed_categories.py
```

---

## Monitoramento

### Queries Lentas

```sql
-- Ver queries lentas (> 1s)
SELECT query, calls, total_time, mean_time
FROM pg_stat_statements
WHERE mean_time > 1000
ORDER BY mean_time DESC
LIMIT 10;
```

### Tamanho das Tabelas

```sql
-- Ver tamanho de cada tabela
SELECT
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

---

## Próximos Passos

1. **Implementar P0** - Criar primeira migration real
2. **Seed de categorias** - Popular categorias padrão
3. **Testes de integridade** - Garantir constraints funcionam
4. **Planejamento P1/P2** - Implementar tabelas futuras gradualmente

---

**Veja também:**
- [Arquitetura](arquitetura.md) - Estrutura do código
- [Tasks](tasks.md) - Roadmap de desenvolvimento
- [Endpoints API](endpoints-api.md) - Especificação da API

---

**Última atualização:** 2024-01-15
