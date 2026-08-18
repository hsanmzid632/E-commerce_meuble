-- Safe, non-destructive foundation schema alignment.
-- Do NOT drop tables or existing data.
-- This file documents the same changes applied automatically by backend/src/db.js.

-- Products: keep legacy columns (image, active) and canonical columns (image_url, is_active).
ALTER TABLE products ADD COLUMN IF NOT EXISTS image_url VARCHAR(500);
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE products ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW();

UPDATE products
SET image_url = image
WHERE image_url IS NULL AND image IS NOT NULL;

UPDATE products
SET image = image_url
WHERE image IS NULL AND image_url IS NOT NULL;

UPDATE products
SET is_active = COALESCE(is_active, active, TRUE);

UPDATE products
SET active = COALESCE(active, is_active, TRUE);

UPDATE products
SET created_at = NOW()
WHERE created_at IS NULL;

-- Orders: add shipping fields used by POST /api/orders.
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_name VARCHAR(150);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_email VARCHAR(150);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_phone VARCHAR(50);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_address TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_city VARCHAR(100);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_postal_code VARCHAR(20);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_governorate VARCHAR(100);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_cin VARCHAR(50);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_birthdate DATE;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_phone2 VARCHAR(50);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_instructions TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW();
