-- Products table for Kreato
-- Run this in your Supabase SQL editor

CREATE TABLE IF NOT EXISTS products (
  id              UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_id      UUID        NOT NULL REFERENCES creators(id) ON DELETE CASCADE,
  name            TEXT        NOT NULL,
  description     TEXT,
  product_type    TEXT        NOT NULL,
  price           NUMERIC(10,2) NOT NULL,
  billing_type    TEXT        NOT NULL CHECK (billing_type IN ('one_time', 'monthly')),
  telegram_link   TEXT,
  telegram_bot_token TEXT,
  active          BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fast creator → products lookups
CREATE INDEX IF NOT EXISTS products_creator_id_idx ON products(creator_id);

-- Row-level security
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Creators can manage only their own products
CREATE POLICY "creators_manage_own_products"
  ON products
  FOR ALL
  USING (creator_id = auth.uid())
  WITH CHECK (creator_id = auth.uid());

-- Anyone can read active products (for public creator pages)
CREATE POLICY "public_read_active_products"
  ON products
  FOR SELECT
  USING (active = TRUE);
