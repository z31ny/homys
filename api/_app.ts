import express from 'express';
import cors from 'cors';
import { config } from './_config';
import routes from './_routes';
import { errorHandler, notFoundHandler } from './_middleware/errorHandler';
import { sanitizeInput } from './_middleware/sanitize';
import { ensureSchema } from './_db/migrate';

// ─── Fail fast on missing critical secrets ───────────────
// Without these the app cannot run securely; crash loudly rather than
// silently issuing unsigned tokens or connecting to no database.
if (!config.jwt.secret || config.jwt.secret.length < 16) {
  throw new Error(
    'JWT_SECRET is missing or too weak (min 16 chars). Set it in environment variables.'
  );
}
if (!config.databaseUrl) {
  throw new Error('DATABASE_URL is not configured. Set it in environment variables.');
}

const app = express();

// ─── Global Middleware ───────────────────────────────────

// CORS — only allow our own frontends (production domain, www, local dev, Vercel previews)
const ALLOWED_ORIGINS = [
  config.frontendUrl,                       // https://homyshospitality.com
  'https://www.homyshospitality.com',
  'http://localhost:3000',
  'http://localhost:5173',
];

app.use(
  cors({
    origin: function (origin, callback) {
      // No origin = same-origin / server-to-server (curl, Postman, Paymob webhook) — allow
      if (!origin) return callback(null, true);
      // Explicit allow-list or any Vercel preview deployment
      if (ALLOWED_ORIGINS.includes(origin) || origin.endsWith('.vercel.app')) {
        return callback(null, true);
      }
      // Everything else is rejected
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Ensure the schema guard has run before any route touches the DB.
// Cached after the first request per instance, so this is a no-op thereafter.
app.use(async (_req, _res, next) => {
  try {
    await ensureSchema();
    next();
  } catch (err) {
    next(err);
  }
});

// Parse JSON request bodies (limit 10MB for image upload metadata)
app.use(express.json({ limit: '10mb' }));

// Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

// Sanitize all request body strings to strip HTML tags (edge case 8.8 — XSS prevention)
app.use(sanitizeInput);

// ─── API Routes ──────────────────────────────────────────

app.use('/api', routes);

// ─── Error Handling ──────────────────────────────────────

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
