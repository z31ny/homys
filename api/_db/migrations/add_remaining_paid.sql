-- Migration: add remaining_paid column to bookings table
-- Run this once against your Neon database before deploying the new payment flow.

ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS remaining_paid BOOLEAN NOT NULL DEFAULT FALSE;
