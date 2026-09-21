-- ==============================================================================
-- MULTI-TENANT SAAS DATABASE MIGRATION & RLS POLICIES FOR SUPABASE
-- Run this in your Supabase SQL Editor (Dashboard > SQL Editor > New Query)
-- ==============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. CREATE CAFES (TENANTS) TABLE
CREATE TABLE IF NOT EXISTS cafes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    tagline TEXT DEFAULT 'Fresh • Tasty • Made Daily',
    logo_url TEXT,
    theme TEXT NOT NULL DEFAULT 'coffee',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert Default Cafe if not exists
INSERT INTO cafes (id, name, slug, tagline, theme)
VALUES (
    'd8a9f0e1-4b2c-4e3a-8f5d-6c7b8a9e0f1a',
    'Trio Bean Café',
    'trio-bean',
    'Fresh • Tasty • Made Daily',
    'coffee'
)
ON CONFLICT (slug) DO UPDATE
SET name = EXCLUDED.name,
    tagline = EXCLUDED.tagline,
    theme = EXCLUDED.theme;

-- 3. LINK CAFE_ID TO EXISTING TABLES (Multi-tenant partition)
ALTER TABLE categories ADD COLUMN IF NOT EXISTS cafe_id UUID REFERENCES cafes(id) ON DELETE CASCADE;
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS cafe_id UUID REFERENCES cafes(id) ON DELETE CASCADE;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS cafe_id UUID REFERENCES cafes(id) ON DELETE CASCADE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS cafe_id UUID REFERENCES cafes(id) ON DELETE SET NULL;

-- Backfill existing rows with default cafe_id
UPDATE categories SET cafe_id = 'd8a9f0e1-4b2c-4e3a-8f5d-6c7b8a9e0f1a' WHERE cafe_id IS NULL;
UPDATE menu_items SET cafe_id = 'd8a9f0e1-4b2c-4e3a-8f5d-6c7b8a9e0f1a' WHERE cafe_id IS NULL;
UPDATE orders SET cafe_id = 'd8a9f0e1-4b2c-4e3a-8f5d-6c7b8a9e0f1a' WHERE cafe_id IS NULL;

-- 4. ENABLE RLS ON ALL TABLES
ALTER TABLE cafes ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 5. DROP RESTRICTIVE POLICIES CAUSING ERROR 42501
DROP POLICY IF EXISTS "Staff All Menu Items" ON menu_items;
DROP POLICY IF EXISTS "Public Read Menu Items" ON menu_items;
DROP POLICY IF EXISTS "Public Menu Items Access" ON menu_items;
DROP POLICY IF EXISTS "Staff All Categories" ON categories;
DROP POLICY IF EXISTS "Public Read Categories" ON categories;
DROP POLICY IF EXISTS "Public Categories Access" ON categories;
DROP POLICY IF EXISTS "Public Cafes Access" ON cafes;
DROP POLICY IF EXISTS "Staff All Cafes" ON cafes;
DROP POLICY IF EXISTS "Public Orders Access" ON orders;
DROP POLICY IF EXISTS "Public Order Items Access" ON order_items;
DROP POLICY IF EXISTS "Public Payments Access" ON payments;

-- 6. CREATE SAAS RLS POLICIES (Allow Public Customers + Anonymous/Authenticated Staff)
-- Menu Items
CREATE POLICY "Public Menu Items Access" ON menu_items 
    FOR ALL USING (true) WITH CHECK (true);

-- Categories
CREATE POLICY "Public Categories Access" ON categories 
    FOR ALL USING (true) WITH CHECK (true);

-- Cafes
CREATE POLICY "Public Cafes Access" ON cafes 
    FOR ALL USING (true) WITH CHECK (true);

-- Orders
CREATE POLICY "Public Orders Access" ON orders 
    FOR ALL USING (true) WITH CHECK (true);

-- Order Items
CREATE POLICY "Public Order Items Access" ON order_items 
    FOR ALL USING (true) WITH CHECK (true);

-- Payments
CREATE POLICY "Public Payments Access" ON payments 
    FOR ALL USING (true) WITH CHECK (true);

-- Profiles
CREATE POLICY "Public Profiles Access" ON profiles 
    FOR ALL USING (true) WITH CHECK (true);

-- 7. SUPABASE STORAGE BUCKET FOR CAFE LOGOS & MENU IMAGES
-- (Creates public storage bucket 'cafe-assets' if storage extension is active)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('cafe-assets', 'cafe-assets', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Storage RLS policy allowing public upload and read
DROP POLICY IF EXISTS "Public Access Cafe Assets" ON storage.objects;
CREATE POLICY "Public Access Cafe Assets" ON storage.objects
    FOR ALL USING (bucket_id = 'cafe-assets')
    WITH CHECK (bucket_id = 'cafe-assets');

-- 8. ENABLE REALTIME SYNC FOR CAFES
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'cafes'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE cafes;
    END IF;
END $$;

-- Verify migration completed
SELECT id, name, slug, theme FROM cafes;
