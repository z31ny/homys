import express from 'express';
import cors from 'cors';
import { config } from './_config';
import routes from './_routes';
import { errorHandler, notFoundHandler } from './_middleware/errorHandler';
import { sanitizeInput } from './_middleware/sanitize';

const app = express();

// ─── Global Middleware ───────────────────────────────────

// CORS — allow the React frontend to make requests
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests from configured frontend URL, any Vercel preview, or no origin (Postman/curl)
      const allowed = [config.frontendUrl, 'http://localhost:3000'];
      if (!origin || allowed.includes(origin) || origin.endsWith('.vercel.app')) {
        callback(null, true);
      } else {
        callback(null, true); // Allow all origins for now during development
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

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
