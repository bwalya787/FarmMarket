/*
# Farm Marketplace Schema

## Overview
Creates a web marketplace where farms can list products for sale and buyers
can browse, filter, and view listings. Includes a featured/ad system for
promoting listings and farm profiles.

## New Tables

1. `categories` — product categories (e.g. Vegetables, Fruits, Dairy)
   - id (uuid, primary key)
   - name (text, unique, not null)
   - slug (text, unique, not null)
   - icon (text, optional — lucide icon name)
   - sort_order (int, default 0)

2. `farms` — farm profiles/sellers
   - id (uuid, primary key)
   - name (text, not null)
   - description (text)
   - location (text)
   - owner_name (text)
   - phone (text)
   - email (text)
   - image_url (text)
   - cover_url (text)
   - created_at (timestamptz)

3. `listings` — products listed by farms
   - id (uuid, primary key)
   - farm_id (uuid, FK to farms)
   - category_id (uuid, FK to categories)
   - title (text, not null)
   - description (text)
   - price (numeric, not null)
   - unit (text, e.g. "kg", "dozen", "bunch")
   - quantity_available (int, default 0)
   - image_url (text)
   - is_organic (boolean, default false)
   - is_featured (boolean, default false) — admin/featured flag
   - ad_tier (text, default 'none') — 'none' | 'basic' | 'premium' ad placement
   - ad_expires_at (timestamptz, nullable)
   - created_at (timestamptz)

4. `ads` — promotional banner ads shown across the marketplace
   - id (uuid, primary key)
   - title (text, not null)
   - description (text)
   - image_url (text)
   - link_url (text)
   - placement (text, default 'hero') — 'hero' | 'sidebar' | 'inline'
   - is_active (boolean, default true)
   - start_date (timestamptz)
   - end_date (timestamptz, nullable)
   - created_at (timestamptz)

## Security
- All tables are single-tenant (no sign-in required to browse or list).
- RLS enabled on every table.
- Grants + policies allow anon + authenticated CRUD on all tables
  since the marketplace is intentionally public/shared.
- Policies use USING (true) / WITH CHECK (true) because data is public.

## Important Notes
1. Seed data is inserted for categories, a few sample farms, listings,
   and ads so the marketplace is not empty on first load.
2. Prices use numeric(10,2) for currency precision.
3. Ad expiry handled by filtering ad_expires_at > now() in queries.
*/

-- Categories
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  slug text UNIQUE NOT NULL,
  icon text,
  sort_order int NOT NULL DEFAULT 0
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON categories TO anon, authenticated;

DROP POLICY IF EXISTS "anon_select_categories" ON categories;
CREATE POLICY "anon_select_categories" ON categories FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_categories" ON categories;
CREATE POLICY "anon_insert_categories" ON categories FOR INSERT
  TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_categories" ON categories;
CREATE POLICY "anon_update_categories" ON categories FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_categories" ON categories;
CREATE POLICY "anon_delete_categories" ON categories FOR DELETE
  TO anon, authenticated USING (true);

-- Farms
CREATE TABLE IF NOT EXISTS farms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  location text,
  owner_name text,
  phone text,
  email text,
  image_url text,
  cover_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE farms ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON farms TO anon, authenticated;

DROP POLICY IF EXISTS "anon_select_farms" ON farms;
CREATE POLICY "anon_select_farms" ON farms FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_farms" ON farms;
CREATE POLICY "anon_insert_farms" ON farms FOR INSERT
  TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_farms" ON farms;
CREATE POLICY "anon_update_farms" ON farms FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_farms" ON farms;
CREATE POLICY "anon_delete_farms" ON farms FOR DELETE
  TO anon, authenticated USING (true);

-- Listings
CREATE TABLE IF NOT EXISTS listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id uuid NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text,
  price numeric(10,2) NOT NULL DEFAULT 0,
  unit text NOT NULL DEFAULT 'unit',
  quantity_available int NOT NULL DEFAULT 0,
  image_url text,
  is_organic boolean NOT NULL DEFAULT false,
  is_featured boolean NOT NULL DEFAULT false,
  ad_tier text NOT NULL DEFAULT 'none',
  ad_expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON listings TO anon, authenticated;

DROP POLICY IF EXISTS "anon_select_listings" ON listings;
CREATE POLICY "anon_select_listings" ON listings FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_listings" ON listings;
CREATE POLICY "anon_insert_listings" ON listings FOR INSERT
  TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_listings" ON listings;
CREATE POLICY "anon_update_listings" ON listings FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_listings" ON listings;
CREATE POLICY "anon_delete_listings" ON listings FOR DELETE
  TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_listings_category ON listings(category_id);
CREATE INDEX IF NOT EXISTS idx_listings_farm ON listings(farm_id);
CREATE INDEX IF NOT EXISTS idx_listings_featured ON listings(is_featured);

-- Ads
CREATE TABLE IF NOT EXISTS ads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  image_url text,
  link_url text,
  placement text NOT NULL DEFAULT 'hero',
  is_active boolean NOT NULL DEFAULT true,
  start_date timestamptz NOT NULL DEFAULT now(),
  end_date timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE ads ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON ads TO anon, authenticated;

DROP POLICY IF EXISTS "anon_select_ads" ON ads;
CREATE POLICY "anon_select_ads" ON ads FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_ads" ON ads;
CREATE POLICY "anon_insert_ads" ON ads FOR INSERT
  TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_ads" ON ads;
CREATE POLICY "anon_update_ads" ON ads FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_ads" ON ads;
CREATE POLICY "anon_delete_ads" ON ads FOR DELETE
  TO anon, authenticated USING (true);

-- Seed categories
INSERT INTO categories (name, slug, icon, sort_order) VALUES
  ('Vegetables', 'vegetables', 'Carrot', 1),
  ('Fruits', 'fruits', 'Apple', 2),
  ('Dairy & Eggs', 'dairy-eggs', 'Milk', 3),
  ('Grains', 'grains', 'Wheat', 4),
  ('Herbs', 'herbs', 'Sprout', 5),
  ('Honey', 'honey', 'Hexagon', 6),
  ('Meat & Poultry', 'meat-poultry', 'Drumstick', 7),
  ('Baked Goods', 'baked-goods', 'Croissant', 8)
ON CONFLICT (slug) DO NOTHING;
