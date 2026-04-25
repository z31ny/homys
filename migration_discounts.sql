-- ============================================================
-- MIGRATION: Run this in your Neon SQL console
-- Adds house_rules column to properties table
-- Adds location_discounts table
-- ============================================================

-- 1. Add house_rules to properties (safe — adds only if missing)
ALTER TABLE properties
  ADD COLUMN IF NOT EXISTS house_rules jsonb NOT NULL DEFAULT '[]'::jsonb;

-- 2. Create location_discounts table
CREATE TABLE IF NOT EXISTS location_discounts (
  id               uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
  location_keyword varchar(255) NOT NULL,
  discount_percent decimal(5,2) NOT NULL,
  label            varchar(255),
  is_active        boolean      NOT NULL DEFAULT true,
  starts_at        timestamp,
  ends_at          timestamp,
  created_at       timestamp    NOT NULL DEFAULT now(),
  updated_at       timestamp    NOT NULL DEFAULT now()
);

-- Done. No data is affected.
-- After running, deploy the new backend and the discount system will be live.
