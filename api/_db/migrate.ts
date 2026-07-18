import { sql } from 'drizzle-orm';
import { db } from './index';

/**
 * Idempotent boot-time schema guard.
 *
 * Runs once per serverless instance (cached promise). Every statement uses
 * IF NOT EXISTS, so it is safe to run repeatedly and is nearly instant when
 * the objects already exist (Postgres only checks the catalog).
 *
 * Purpose: guarantee the live database can never silently fall behind the
 * code for the critical tables/columns the controllers depend on — the class
 * of "column doesn't exist → 500" drift bug. For larger structural changes,
 * use the Drizzle tooling (`npm run db:push` / `db:generate` + `db:migrate`).
 */

const STATEMENTS = [
  // ── Distributed rate limiting (shared across all serverless instances) ──
  sql`CREATE TABLE IF NOT EXISTS rate_limits (
    key      text PRIMARY KEY,
    count    integer NOT NULL DEFAULT 0,
    reset_at timestamptz NOT NULL
  )`,

  // ── Booking payment / flow columns (newest → most drift-prone) ──
  sql`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS deposit_amount   numeric(10,2)`,
  sql`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS deposit_paid     boolean NOT NULL DEFAULT false`,
  sql`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS remaining_paid   boolean NOT NULL DEFAULT false`,
  sql`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS docs_status      varchar(20) NOT NULL DEFAULT 'pending'`,
  sql`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS has_female_guest boolean NOT NULL DEFAULT false`,
  sql`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS booking_docs     jsonb DEFAULT '[]'::jsonb`,

  // ── Properties columns added after the original schema ──
  sql`ALTER TABLE properties ADD COLUMN IF NOT EXISTS is_featured boolean NOT NULL DEFAULT false`,
  sql`ALTER TABLE properties ADD COLUMN IF NOT EXISTS offers_housekeeping boolean NOT NULL DEFAULT false`,
  sql`ALTER TABLE properties ADD COLUMN IF NOT EXISTS offers_beach_access boolean NOT NULL DEFAULT false`,
  sql`ALTER TABLE properties ADD COLUMN IF NOT EXISTS beach_access_price   numeric(10,2) NOT NULL DEFAULT 2000`,
  sql`ALTER TABLE properties ADD COLUMN IF NOT EXISTS service_fee_percent numeric(5,2) NOT NULL DEFAULT 10`,

  // ── Tables that may not exist on an older database ──
  sql`CREATE TABLE IF NOT EXISTS location_discounts (
    id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    location_keyword varchar(255) NOT NULL,
    discount_percent numeric(5,2) NOT NULL,
    label            varchar(255),
    is_active        boolean NOT NULL DEFAULT true,
    starts_at        timestamptz,
    ends_at          timestamptz,
    created_at       timestamptz NOT NULL DEFAULT now(),
    updated_at       timestamptz NOT NULL DEFAULT now()
  )`,
  sql`CREATE TABLE IF NOT EXISTS website_content (
    id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    section    varchar(100) NOT NULL UNIQUE,
    content    jsonb NOT NULL DEFAULT '{}'::jsonb,
    updated_at timestamptz NOT NULL DEFAULT now()
  )`,

  // ── Per-property extra fees (HK / cleaning / beach access, …) ──
  sql`CREATE TABLE IF NOT EXISTS property_fees (
    id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id uuid NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    name        varchar(120) NOT NULL,
    amount      numeric(10,2) NOT NULL,
    fee_type    varchar(20) NOT NULL DEFAULT 'per_stay',
    created_at  timestamptz NOT NULL DEFAULT now()
  )`,

  // ── Ensure 'lagoon' is in the view_type enum ──
  sql`DO $$ BEGIN
    ALTER TYPE view_type ADD VALUE IF NOT EXISTS 'lagoon' BEFORE 'other';
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$`,
];

let migrationPromise: Promise<void> | null = null;

export function ensureSchema(): Promise<void> {
  if (!migrationPromise) {
    migrationPromise = (async () => {
      // neon-http runs one statement per call — execute sequentially.
      for (const stmt of STATEMENTS) {
        await db.execute(stmt);
      }
    })().catch((err) => {
      // Don't cache a failed run — let the next request retry.
      migrationPromise = null;
      throw err;
    });
  }
  return migrationPromise;
}
