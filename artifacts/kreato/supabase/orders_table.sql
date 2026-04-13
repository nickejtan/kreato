-- Orders table for Kreato
-- Run this in your Supabase SQL editor

CREATE TABLE IF NOT EXISTS orders (
  id              UUID          DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id      UUID          NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  creator_id      UUID          NOT NULL REFERENCES creators(id) ON DELETE RESTRICT,
  buyer_name      TEXT          NOT NULL,
  buyer_email     TEXT          NOT NULL,
  buyer_country   TEXT          NOT NULL,
  buyer_telegram  TEXT          NOT NULL,
  amount          NUMERIC(10,2) NOT NULL,
  status          TEXT          NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending', 'paid', 'failed', 'cancelled')),
  created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- Index for fast creator → orders lookups (dashboard)
CREATE INDEX IF NOT EXISTS orders_creator_id_idx ON orders(creator_id);
CREATE INDEX IF NOT EXISTS orders_product_id_idx ON orders(product_id);

-- Row-level security
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Anyone can place an order (public checkout — no login required)
CREATE POLICY "public_insert_orders"
  ON orders
  FOR INSERT
  WITH CHECK (true);

-- Creators can view orders for their own products
CREATE POLICY "creators_view_own_orders"
  ON orders
  FOR SELECT
  USING (creator_id = auth.uid());
