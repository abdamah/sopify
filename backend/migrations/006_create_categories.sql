CREATE TABLE IF NOT EXISTS categories (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name       TEXT NOT NULL UNIQUE,
    slug       TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO categories (name, slug) VALUES
    ('Electronics', 'electronics'),
    ('Accessories', 'accessories'),
    ('Office', 'office'),
    ('Home', 'home'),
    ('Kitchen', 'kitchen'),
    ('General', 'general')
ON CONFLICT (slug) DO NOTHING;

ALTER TABLE products
    ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES categories(id);

UPDATE products
SET category_id = (SELECT id FROM categories WHERE slug = 'general' LIMIT 1)
WHERE category_id IS NULL;

ALTER TABLE products
    ALTER COLUMN category_id SET NOT NULL;

CREATE INDEX IF NOT EXISTS idx_products_category_id ON products (category_id);
