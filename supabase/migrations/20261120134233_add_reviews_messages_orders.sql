/*
# Add Reviews, Messages, Orders, and Order Items

## Overview
Extends the marketplace schema with four new capabilities:
1. Star ratings + written reviews on both listings and farms.
2. A direct messaging system between buyers and farms.
3. Orders and order items so buyers can purchase multiple items
   from different farms in a single checkout.
4. (Watchlist is handled client-side in localStorage, no table needed.)

## New Tables

1. `reviews`
   - id (uuid, primary key)
   - target_type (text) — 'listing' | 'farm'
   - target_id (uuid) — FK to listings.id or farms.id (no hard FK since
     it points to different tables; integrity is application-managed)
   - reviewer_name (text, not null)
   - rating (int, 1–5, not null)
   - comment (text)
   - created_at (timestamptz)

2. `messages`
   - id (uuid, primary key)
   - farm_id (uuid, FK to farms, on delete cascade)
   - sender_name (text, not null)
   - sender_email (text, not null)
   - subject (text, not null)
   - body (text, not null)
   - is_read (boolean, default false)
   - created_at (timestamptz)

3. `orders`
   - id (uuid, primary key)
   - buyer_name (text, not null)
   - buyer_email (text, not null)
   - buyer_phone (text)
   - pickup_notes (text)
   - status (text, default 'pending')
   - total (numeric, not null)
   - created_at (timestamptz)

4. `order_items`
   - id (uuid, primary key)
   - order_id (uuid, FK to orders, on delete cascade)
   - listing_id (uuid, FK to listings, on delete set null)
   - farm_id (uuid, FK to farms, on delete set null)
   - listing_title (text, not null) — snapshot at purchase time
   - farm_name (text, not null) — snapshot at purchase time
   - unit_price (numeric, not null) — snapshot
   - quantity (int, not null)
   - unit (text, not null)
   - subtotal (numeric, not null)

## Security
- All tables are single-tenant (no sign-in). RLS enabled on every table.
- Grants + policies allow anon + authenticated CRUD since the
  marketplace is intentionally public/shared.
- Policies use USING (true) / WITH CHECK (true) because data is public.

## Important Notes
1. Reviews use a polymorphic target (target_type + target_id) to serve
   both listing reviews and farm reviews from one table.
2. Order items snapshot the listing title, farm name, and unit price at
   purchase time so historical orders remain accurate even if a listing
   is later edited or deleted.
3. Messages have an is_read flag so farms can track unread inquiries.
*/

-- Reviews
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  target_type text NOT NULL CHECK (target_type IN ('listing', 'farm')),
  target_id uuid NOT NULL,
  reviewer_name text NOT NULL,
  rating int NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON reviews TO anon, authenticated;

DROP POLICY IF EXISTS "anon_select_reviews" ON reviews;
CREATE POLICY "anon_select_reviews" ON reviews FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_reviews" ON reviews;
CREATE POLICY "anon_insert_reviews" ON reviews FOR INSERT
  TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_reviews" ON reviews;
CREATE POLICY "anon_update_reviews" ON reviews FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_reviews" ON reviews;
CREATE POLICY "anon_delete_reviews" ON reviews FOR DELETE
  TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_reviews_target ON reviews(target_type, target_id);

-- Messages
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id uuid NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  sender_name text NOT NULL,
  sender_email text NOT NULL,
  subject text NOT NULL,
  body text NOT NULL,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON messages TO anon, authenticated;

DROP POLICY IF EXISTS "anon_select_messages" ON messages;
CREATE POLICY "anon_select_messages" ON messages FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_messages" ON messages;
CREATE POLICY "anon_insert_messages" ON messages FOR INSERT
  TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_messages" ON messages;
CREATE POLICY "anon_update_messages" ON messages FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_messages" ON messages;
CREATE POLICY "anon_delete_messages" ON messages FOR DELETE
  TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_messages_farm ON messages(farm_id);
CREATE INDEX IF NOT EXISTS idx_messages_unread ON messages(farm_id, is_read);

-- Orders
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_name text NOT NULL,
  buyer_email text NOT NULL,
  buyer_phone text,
  pickup_notes text,
  status text NOT NULL DEFAULT 'pending',
  total numeric(10,2) NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON orders TO anon, authenticated;

DROP POLICY IF EXISTS "anon_select_orders" ON orders;
CREATE POLICY "anon_select_orders" ON orders FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_orders" ON orders;
CREATE POLICY "anon_insert_orders" ON orders FOR INSERT
  TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_orders" ON orders;
CREATE POLICY "anon_update_orders" ON orders FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_orders" ON orders;
CREATE POLICY "anon_delete_orders" ON orders FOR DELETE
  TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_orders_email ON orders(buyer_email);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at DESC);

-- Order items
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  listing_id uuid REFERENCES listings(id) ON DELETE SET NULL,
  farm_id uuid REFERENCES farms(id) ON DELETE SET NULL,
  listing_title text NOT NULL,
  farm_name text NOT NULL,
  unit_price numeric(10,2) NOT NULL DEFAULT 0,
  quantity int NOT NULL DEFAULT 1,
  unit text NOT NULL DEFAULT 'unit',
  subtotal numeric(10,2) NOT NULL DEFAULT 0
);

ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON order_items TO anon, authenticated;

DROP POLICY IF EXISTS "anon_select_order_items" ON order_items;
CREATE POLICY "anon_select_order_items" ON order_items FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_order_items" ON order_items;
CREATE POLICY "anon_insert_order_items" ON order_items FOR INSERT
  TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_order_items" ON order_items;
CREATE POLICY "anon_update_order_items" ON order_items FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_order_items" ON order_items;
CREATE POLICY "anon_delete_order_items" ON order_items FOR DELETE
  TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_farm ON order_items(farm_id);
