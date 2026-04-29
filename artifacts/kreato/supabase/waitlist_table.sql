-- Waitlist table for Kreato
-- Run this in your Supabase SQL editor

CREATE TABLE IF NOT EXISTS waitlist (
  id         UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  email      TEXT        NOT NULL UNIQUE,
  instagram  TEXT,
  country    TEXT,
  role       TEXT        NOT NULL DEFAULT 'creator'
             CHECK (role IN ('creator', 'buyer')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Row-level security
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;

-- Anyone can join the waitlist (public, no auth required)
CREATE POLICY "public_insert_waitlist"
  ON waitlist
  FOR INSERT
  WITH CHECK (true);

-- Only authenticated users (admin) can read the waitlist
CREATE POLICY "admin_read_waitlist"
  ON waitlist
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- ── Migration: add instagram and country columns to existing table ──
-- Run this if the table already exists in Supabase:
--
-- ALTER TABLE waitlist ADD COLUMN IF NOT EXISTS instagram TEXT;
-- ALTER TABLE waitlist ADD COLUMN IF NOT EXISTS country   TEXT;
