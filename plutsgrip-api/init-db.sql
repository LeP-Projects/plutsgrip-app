-- PlutusGrip Database Initialization Script
-- This script runs automatically when the PostgreSQL container starts for the first time

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE IF NOT EXISTS transactiontype AS ENUM ('INCOME', 'EXPENSE');
CREATE TYPE IF NOT EXISTS budgetperiod AS ENUM ('MONTHLY', 'QUARTERLY', 'YEARLY');
CREATE TYPE IF NOT EXISTS recurrencefrequency AS ENUM ('DAILY', 'WEEKLY', 'BIWEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY');

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'BRL',
    timezone VARCHAR(50) NOT NULL DEFAULT 'UTC',
    deleted_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS ix_users_email ON users(email);
CREATE INDEX IF NOT EXISTS ix_users_id ON users(id);
CREATE INDEX IF NOT EXISTS ix_users_created_at ON users(created_at);

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    type transactiontype NOT NULL,
    color VARCHAR(7),
    icon VARCHAR(50),
    is_default BOOLEAN NOT NULL DEFAULT FALSE,
    user_id INTEGER REFERENCES users(id),
    deleted_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS ix_categories_id ON categories(id);
CREATE INDEX IF NOT EXISTS ix_categories_created_at ON categories(created_at);

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    description VARCHAR(255) NOT NULL,
    amount NUMERIC(10,2) NOT NULL CHECK (amount > 0),
    currency VARCHAR(3),
    date DATE NOT NULL,
    type transactiontype NOT NULL,
    notes TEXT,
    tags VARCHAR(255),
    is_recurring BOOLEAN NOT NULL DEFAULT FALSE,
    recurring_transaction_id INTEGER,
    category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
    deleted_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS ix_transactions_id ON transactions(id);
CREATE INDEX IF NOT EXISTS ix_transactions_created_at ON transactions(created_at);
CREATE INDEX IF NOT EXISTS ix_transactions_user_id_type ON transactions(user_id, type);
CREATE INDEX IF NOT EXISTS ix_transactions_user_id_category_id ON transactions(user_id, category_id);
CREATE INDEX IF NOT EXISTS ix_transactions_user_id_date ON transactions(user_id, date DESC);
CREATE INDEX IF NOT EXISTS ix_transactions_recurring_transaction_id ON transactions(recurring_transaction_id);

-- Create budgets table
CREATE TABLE IF NOT EXISTS budgets (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    amount NUMERIC(10,2) NOT NULL,
    period budgetperiod NOT NULL,
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP,
    notifications_enabled INTEGER,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS ix_budgets_id ON budgets(id);
CREATE INDEX IF NOT EXISTS ix_budgets_created_at ON budgets(created_at);
CREATE INDEX IF NOT EXISTS ix_budgets_user_id_category_id ON budgets(user_id, category_id);

-- Create goals table
CREATE TABLE IF NOT EXISTS goals (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    target_amount NUMERIC(10,2) NOT NULL,
    current_amount NUMERIC(10,2) DEFAULT 0,
    deadline DATE,
    category VARCHAR(100),
    priority VARCHAR(20) NOT NULL,
    is_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS ix_goals_id ON goals(id);
CREATE INDEX IF NOT EXISTS ix_goals_created_at ON goals(created_at);
CREATE INDEX IF NOT EXISTS ix_goals_user_id ON goals(user_id);

-- Create recurring_transactions table
CREATE TABLE IF NOT EXISTS recurring_transactions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    description VARCHAR(255) NOT NULL,
    amount NUMERIC(10,2) NOT NULL,
    currency VARCHAR(3),
    type transactiontype NOT NULL,
    category_id INTEGER REFERENCES categories(id),
    frequency recurrencefrequency NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    next_execution_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS ix_recurring_id ON recurring_transactions(id);
CREATE INDEX IF NOT EXISTS ix_recurring_created_at ON recurring_transactions(created_at);
CREATE INDEX IF NOT EXISTS ix_recurring_user_id ON recurring_transactions(user_id);

-- Create alembic_version table for migration tracking
CREATE TABLE IF NOT EXISTS alembic_version (
    version_num VARCHAR(32) NOT NULL PRIMARY KEY
);

-- Insert migration records if they don't exist
INSERT INTO alembic_version (version_num) VALUES ('a4156668e5e1') ON CONFLICT DO NOTHING;
INSERT INTO alembic_version (version_num) VALUES ('b7f2c3d4e5f6') ON CONFLICT DO NOTHING;

-- Insert default test user with password: Test@1234
-- Hash: $2b$12$TAbfbMjOSwGFejhkGWgiFuUq4oMcdRaWWBhcReyOrHFUxhQhD754u
INSERT INTO users (name, email, hashed_password, currency, timezone, created_at, updated_at)
VALUES ('Test User', 'test@test.com', '$2b$12$TAbfbMjOSwGFejhkGWgiFuUq4oMcdRaWWBhcReyOrHFUxhQhD754u', 'BRL', 'UTC', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (email) DO NOTHING;

-- Insert default categories for test user
INSERT INTO categories (user_id, name, type, color, icon, is_default, created_at, updated_at)
VALUES
(1, 'Groceries', 'EXPENSE', '#FF6B6B', 'shopping', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(1, 'Salary', 'INCOME', '#51CF66', 'money', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(1, 'Utilities', 'EXPENSE', '#FFD93D', 'home', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(1, 'Entertainment', 'EXPENSE', '#6BCB77', 'smile', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT DO NOTHING;

-- Insert sample transactions
INSERT INTO transactions (user_id, description, amount, type, category_id, date, is_recurring, created_at, updated_at)
VALUES
(1, 'November Salary', 5000.00, 'INCOME', (SELECT id FROM categories WHERE user_id=1 AND name='Salary' LIMIT 1), '2025-11-01', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(1, 'Grocery Shopping', 150.50, 'EXPENSE', (SELECT id FROM categories WHERE user_id=1 AND name='Groceries' LIMIT 1), '2025-11-02', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(1, 'Electric Bill', 120.00, 'EXPENSE', (SELECT id FROM categories WHERE user_id=1 AND name='Utilities' LIMIT 1), '2025-11-03', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(1, 'Movie Tickets', 40.00, 'EXPENSE', (SELECT id FROM categories WHERE user_id=1 AND name='Entertainment' LIMIT 1), '2025-11-04', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(1, 'Freelance Project', 800.00, 'INCOME', (SELECT id FROM categories WHERE user_id=1 AND name='Salary' LIMIT 1), '2025-10-15', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(1, 'Coffee', 5.50, 'EXPENSE', (SELECT id FROM categories WHERE user_id=1 AND name='Groceries' LIMIT 1), '2025-10-20', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(1, 'Internet Bill', 80.00, 'EXPENSE', (SELECT id FROM categories WHERE user_id=1 AND name='Utilities' LIMIT 1), '2025-10-25', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(1, 'Concert Tickets', 150.00, 'EXPENSE', (SELECT id FROM categories WHERE user_id=1 AND name='Entertainment' LIMIT 1), '2025-10-28', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT DO NOTHING;

-- Initial setup message
DO $$
BEGIN
    RAISE NOTICE 'PlutusGrip database initialized successfully!';
END
$$;
