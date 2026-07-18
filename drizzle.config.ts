import type { Config } from 'drizzle-kit';

/**
 * Drizzle migration tooling config.
 *
 * Workflow for schema changes (edit api/_db/schema.ts first):
 *   npm run db:push       → push schema straight to the DB (fast, good for solo/small team)
 *   npm run db:generate   → create a versioned SQL migration in ./drizzle
 *   npm run db:migrate     → apply pending versioned migrations
 *
 * Requires DATABASE_URL in the environment (loaded from .env locally).
 */
export default {
  schema: './api/_db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL || '',
  },
} satisfies Config;
