-- Table: public.otps

-- DROP TABLE IF EXISTS public.otps;

CREATE TABLE IF NOT EXISTS public.otps
(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mobile_number VARCHAR(10) UNIQUE NOT NULL CHECK (mobile_number ~ '^[0-9]{10}$'),
    otp VARCHAR(6) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Index for faster lookups globally
CREATE INDEX IF NOT EXISTS idx_otps_mobile_number ON public.otps(mobile_number);
