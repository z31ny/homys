-- ============================================================
-- MIGRATION v2: Run this in your Neon SQL console
-- ============================================================

-- 1. Unit-level discount on properties
ALTER TABLE properties
  ADD COLUMN IF NOT EXISTS discount_percent decimal(5,2),
  ADD COLUMN IF NOT EXISTS discount_label   varchar(255),
  ADD COLUMN IF NOT EXISTS amenities        jsonb NOT NULL DEFAULT '[]'::jsonb;

-- 2. Deposit + document upload columns on bookings
ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS deposit_amount   decimal(10,2),
  ADD COLUMN IF NOT EXISTS deposit_paid     boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS booking_docs     jsonb   NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS has_female_guest boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS docs_status      varchar(20) NOT NULL DEFAULT 'pending';

-- 3. Add 'other' to property_type enum
DO $$ BEGIN
  ALTER TYPE property_type ADD VALUE IF NOT EXISTS 'other';
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 4. Add 'other' to view_type enum
DO $$ BEGIN
  ALTER TYPE view_type ADD VALUE IF NOT EXISTS 'other';
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 5. Editable website content table
CREATE TABLE IF NOT EXISTS website_content (
  id         uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
  section    varchar(100) NOT NULL UNIQUE,
  content    jsonb        NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamp    NOT NULL DEFAULT now()
);

INSERT INTO website_content (section, content) VALUES
  ('hero',    '{"title":"Find Your Perfect Escape","subtitle":"Luxury Egyptian properties — Sahel, North Coast, Gouna, Red Sea."}'::jsonb),
  ('about',   '{"title":"About Homys","body":"Homys is a curated collection of premium vacation rentals across Egypt."}'::jsonb),
  ('faq',     '{"items":[]}'::jsonb),
  ('partners','{"title":"Our Partners","subtitle":"Trusted names we work with."}'::jsonb)
ON CONFLICT (section) DO NOTHING;
