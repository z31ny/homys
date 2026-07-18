-- Migration: add is_featured column to properties table
-- Run this once against your Neon database before deploying.

ALTER TABLE properties
  ADD COLUMN IF NOT EXISTS is_featured BOOLEAN NOT NULL DEFAULT FALSE;
