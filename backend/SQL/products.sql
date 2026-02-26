CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE products (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_name    VARCHAR(50) NOT NULL,
    description     VARCHAR(100),
    price           DECIMAL(6, 2) NOT NULL CHECK (price >= 0),
    image_path      VARCHAR(255),
    category_id     UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Trigger to auto-update updated_at on row modification
CREATE OR REPLACE FUNCTION update_products_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_products_updated_at();
