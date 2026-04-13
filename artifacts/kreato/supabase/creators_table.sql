-- ============================================================
-- Kreato: creators table
-- Run this in the Supabase SQL Editor for your project
-- ============================================================

CREATE TABLE IF NOT EXISTS public.creators (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name     TEXT NOT NULL,
  handle        TEXT NOT NULL UNIQUE,
  country       TEXT NOT NULL,
  product_type  TEXT NOT NULL,
  fdusd_wallet  TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.creators ENABLE ROW LEVEL SECURITY;

-- Policy: anyone (including logged-out visitors) can read public creator profiles
-- Required for the public storefront at /[handle]
CREATE POLICY "creators_select_public"
  ON public.creators
  FOR SELECT
  USING (true);

-- Policy: authenticated users can read only their own record (legacy — superseded above)
CREATE POLICY "creators_select_own"
  ON public.creators
  FOR SELECT
  USING (auth.uid() = id);

-- Policy: authenticated users can insert only their own record
CREATE POLICY "creators_insert_own"
  ON public.creators
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Policy: authenticated users can update only their own record
CREATE POLICY "creators_update_own"
  ON public.creators
  FOR UPDATE
  USING (auth.uid() = id);
