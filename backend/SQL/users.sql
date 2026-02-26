CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TYPE gender_enum AS ENUM ('male', 'female');

CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_name       VARCHAR(50) NOT NULL,
    mobile_number   VARCHAR(10) NOT NULL UNIQUE CHECK (mobile_number ~ '^[0-9]{10}$'),
    email           VARCHAR(100),
    gender          gender_enum,
    image_path      VARCHAR(255),
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Trigger to auto-update updated_at on row modification
CREATE OR REPLACE FUNCTION update_users_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_users_updated_at();
