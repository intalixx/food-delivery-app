CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Order status enum
CREATE TYPE order_status_enum AS ENUM (
    'Order Received',
    'Preparing',
    'Out for Delivery',
    'Delivered',
    'Cancelled'
);

-- Orders table
CREATE TABLE orders (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_code      VARCHAR(10) NOT NULL UNIQUE,
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    address_id      UUID NOT NULL REFERENCES addresses(id) ON DELETE SET NULL,
    total_qty       INTEGER NOT NULL CHECK (total_qty > 0),
    final_amount    DECIMAL(10, 2) NOT NULL CHECK (final_amount >= 0),
    order_status    order_status_enum NOT NULL DEFAULT 'Order Received',
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Order items table
CREATE TABLE order_items (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id        UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id      UUID NOT NULL REFERENCES products(id) ON DELETE SET NULL,
    product_name    VARCHAR(100) NOT NULL,
    product_price   DECIMAL(6, 2) NOT NULL CHECK (product_price >= 0),
    qty             INTEGER NOT NULL CHECK (qty > 0),
    subtotal        DECIMAL(10, 2) NOT NULL CHECK (subtotal >= 0),
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Trigger: auto-update updated_at on orders
CREATE OR REPLACE FUNCTION update_orders_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_orders_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION update_orders_updated_at();

-- Trigger: auto-update updated_at on order_items
CREATE OR REPLACE FUNCTION update_order_items_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_order_items_updated_at
    BEFORE UPDATE ON order_items
    FOR EACH ROW
    EXECUTE FUNCTION update_order_items_updated_at();

-- Index for fast lookups
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_order_code ON orders(order_code);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
