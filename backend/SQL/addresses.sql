CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE addresses (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id           UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    save_as           VARCHAR(50) NOT NULL DEFAULT 'Home',
    pincode           VARCHAR(6) NOT NULL CHECK (pincode ~ '^[0-9]{6}$'),
    city              VARCHAR(50) NOT NULL,
    state             VARCHAR(50) NOT NULL,
    house_number      VARCHAR(100) NOT NULL,
    street_locality   VARCHAR(150) NOT NULL,
    mobile            VARCHAR(10) NOT NULL CHECK (mobile ~ '^[0-9]{10}$'),
    created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Trigger to auto-update updated_at on row modification
CREATE OR REPLACE FUNCTION update_addresses_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_addresses_updated_at
    BEFORE UPDATE ON addresses
    FOR EACH ROW
    EXECUTE FUNCTION update_addresses_updated_at();
