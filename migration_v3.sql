-- ============================================================
-- MIGRATION v3: Run this in your Neon SQL console
-- ============================================================

-- 1. Add minimum_stay and property_label to properties
ALTER TABLE properties
  ADD COLUMN IF NOT EXISTS minimum_stay       integer      NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS property_label     varchar(50),
  ADD COLUMN IF NOT EXISTS property_type_other varchar(100),
  ADD COLUMN IF NOT EXISTS view_type_other    varchar(100);
