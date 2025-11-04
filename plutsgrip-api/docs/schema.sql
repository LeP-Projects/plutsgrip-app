-- ================================================================
-- PlutusGrip Finance Tracker - Database Schema
-- PostgreSQL 16+
-- ================================================================
--
-- Este arquivo contém o schema completo do banco de dados
-- Use apenas para referência ou setup rápido de desenvolvimento
--
-- Em produção, use Alembic migrations!
--
-- ================================================================

-- Limpar schema (CUIDADO: apenas para desenvolvimento!)
-- DROP TABLE IF EXISTS transactions CASCADE;
-- DROP TABLE IF EXISTS categories CASCADE;
-- DROP TABLE IF EXISTS users CASCADE;
-- DROP TYPE IF EXISTS transaction_type CASCADE;

-- ================================================================
-- TYPES
-- ================================================================

-- Enum para tipo de transação
CREATE TYPE transaction_type AS ENUM ('income', 'expense');

-- ================================================================
-- TABLES
-- ================================================================

-- ----------------------------------------------------------------
-- Users Table
-- ----------------------------------------------------------------
CREATE TABLE users (
    id SERIAL PRIMARY KEY,

    -- Authentication
    email VARCHAR(255) NOT NULL UNIQUE,
    hashed_password VARCHAR(255) NOT NULL,

    -- Profile
    name VARCHAR(100) NOT NULL,

    -- Timestamps
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE UNIQUE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_created_at ON users(created_at);

-- Comments
COMMENT ON TABLE users IS 'User authentication and profile information';
COMMENT ON COLUMN users.email IS 'Unique email for login';
COMMENT ON COLUMN users.hashed_password IS 'bcrypt hashed password';

-- ----------------------------------------------------------------
-- Categories Table
-- ----------------------------------------------------------------
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,

    -- Category info
    name VARCHAR(100) NOT NULL,
    type transaction_type NOT NULL,

    -- UI customization
    color VARCHAR(7),
    icon VARCHAR(50),

    -- Timestamps
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),

    -- Constraints
    CONSTRAINT chk_categories_color_format CHECK (
        color IS NULL OR color ~ '^#[0-9A-Fa-f]{6}$'
    )
);

-- Indexes
CREATE INDEX idx_categories_type ON categories(type);
CREATE INDEX idx_categories_name ON categories(name);

-- Comments
COMMENT ON TABLE categories IS 'Categories for transaction classification';
COMMENT ON COLUMN categories.type IS 'income or expense';
COMMENT ON COLUMN categories.color IS 'Hex color code for UI (#RRGGBB)';

-- ----------------------------------------------------------------
-- Transactions Table
-- ----------------------------------------------------------------
CREATE TABLE transactions (
    id SERIAL PRIMARY KEY,

    -- Foreign keys
    user_id INTEGER NOT NULL,
    category_id INTEGER,

    -- Transaction data
    description VARCHAR(255) NOT NULL,
    amount NUMERIC(10, 2) NOT NULL,
    date DATE NOT NULL,
    type transaction_type NOT NULL,
    notes TEXT,

    -- Timestamps
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),

    -- Foreign key constraints
    CONSTRAINT fk_transactions_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_transactions_category
        FOREIGN KEY (category_id)
        REFERENCES categories(id)
        ON DELETE SET NULL,

    -- Business rules
    CONSTRAINT chk_transactions_amount_positive
        CHECK (amount > 0)
);

-- Indexes (order matters for composite indexes!)
CREATE INDEX idx_transactions_user_date ON transactions(user_id, date DESC);
CREATE INDEX idx_transactions_user_type ON transactions(user_id, type);
CREATE INDEX idx_transactions_user_category ON transactions(user_id, category_id);
CREATE INDEX idx_transactions_date ON transactions(date);
CREATE INDEX idx_transactions_category_id ON transactions(category_id);

-- Comments
COMMENT ON TABLE transactions IS 'Main table for financial transactions';
COMMENT ON COLUMN transactions.amount IS 'Always positive, type determines income/expense';
COMMENT ON COLUMN transactions.user_id IS 'User owner (CASCADE delete)';
COMMENT ON COLUMN transactions.category_id IS 'Optional category (SET NULL on delete)';

-- ================================================================
-- TRIGGERS
-- ================================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to tables
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at
    BEFORE UPDATE ON categories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at
    BEFORE UPDATE ON transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ================================================================
-- SEED DATA - Default Categories
-- ================================================================

-- Income Categories
INSERT INTO categories (name, type, color, icon) VALUES
('Salário', 'income', '#4CAF50', 'currency-dollar'),
('Freelance', 'income', '#8BC34A', 'briefcase'),
('Investimentos', 'income', '#2196F3', 'trending-up'),
('Prêmios', 'income', '#00BCD4', 'trophy'),
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
('Contas', 'expense', '#795548', 'receipt'),
('Outros', 'expense', '#607D8B', 'dots-horizontal');

-- ================================================================
-- VIEWS (Optional - for convenience)
-- ================================================================

-- View: User balance summary
CREATE OR REPLACE VIEW user_balance_summary AS
SELECT
    u.id AS user_id,
    u.name AS user_name,
    COALESCE(SUM(CASE WHEN t.type = 'income' THEN t.amount ELSE 0 END), 0) AS total_income,
    COALESCE(SUM(CASE WHEN t.type = 'expense' THEN t.amount ELSE 0 END), 0) AS total_expense,
    COALESCE(
        SUM(CASE WHEN t.type = 'income' THEN t.amount ELSE -t.amount END),
        0
    ) AS balance,
    COUNT(t.id) AS transaction_count
FROM users u
LEFT JOIN transactions t ON u.id = t.user_id
GROUP BY u.id, u.name;

COMMENT ON VIEW user_balance_summary IS 'Quick overview of user balances';

-- View: Monthly transaction summary
CREATE OR REPLACE VIEW monthly_transaction_summary AS
SELECT
    user_id,
    DATE_TRUNC('month', date) AS month,
    type,
    COUNT(*) AS transaction_count,
    SUM(amount) AS total_amount
FROM transactions
GROUP BY user_id, DATE_TRUNC('month', date), type
ORDER BY month DESC, user_id;

COMMENT ON VIEW monthly_transaction_summary IS 'Monthly aggregation of transactions';

-- ================================================================
-- FUNCTIONS (Optional - for business logic)
-- ================================================================

-- Function: Calculate user balance
CREATE OR REPLACE FUNCTION get_user_balance(p_user_id INTEGER)
RETURNS NUMERIC(10,2) AS $$
DECLARE
    balance NUMERIC(10,2);
BEGIN
    SELECT COALESCE(
        SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END),
        0
    )
    INTO balance
    FROM transactions
    WHERE user_id = p_user_id;

    RETURN balance;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_user_balance IS 'Calculate current balance for a user';

-- Usage: SELECT get_user_balance(1);

-- ================================================================
-- PERMISSIONS (Production)
-- ================================================================

-- Grant necessary permissions to application user
-- Uncomment and adjust for production:

-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO plutusgrip_user;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO plutusgrip_user;
-- GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO plutusgrip_user;

-- Revoke dangerous permissions
-- REVOKE CREATE ON SCHEMA public FROM plutusgrip_user;
-- REVOKE DROP ON ALL TABLES IN SCHEMA public FROM plutusgrip_user;

-- ================================================================
-- VERIFICATION QUERIES
-- ================================================================

-- Verify tables created
SELECT tablename, schemaname
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- Verify indexes
SELECT indexname, tablename
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- Verify foreign keys
SELECT
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public'
ORDER BY tc.table_name;

-- Verify seed data
SELECT 'Categories' AS table_name, COUNT(*) AS count FROM categories
UNION ALL
SELECT 'Users', COUNT(*) FROM users
UNION ALL
SELECT 'Transactions', COUNT(*) FROM transactions;

-- ================================================================
-- HELPFUL QUERIES FOR MONITORING
-- ================================================================

-- Table sizes
-- SELECT
--     schemaname,
--     tablename,
--     pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
-- FROM pg_tables
-- WHERE schemaname = 'public'
-- ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Slow queries (requires pg_stat_statements extension)
-- SELECT query, calls, total_time, mean_time
-- FROM pg_stat_statements
-- WHERE mean_time > 1000
-- ORDER BY mean_time DESC
-- LIMIT 10;

-- ================================================================
-- END OF SCHEMA
-- ================================================================

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✓ PlutusGrip database schema created successfully!';
    RAISE NOTICE '✓ Default categories seeded';
    RAISE NOTICE '✓ Ready to use';
END $$;
