# Homys — Session Handoff

> Read this first in any new session. It captures the project layout, what was
> changed recently, the deployment state, and what's still pending.

---

## 1. What this project is

**Homys** — a vacation-rental platform (browse/stays, bookings with 50% deposit
flow, document upload, admin dashboard, CMS). Brand palette: navy `#112a3d`,
gold `#d1a67a`, cream `#f6f3eb`. Production domain: **homyshospitality.com**.

## 2. CRITICAL: which folder is real

There are multiple copies under `D:\homys-master\`. **Only `deploy-temp` is
deployed and matters.** Do NOT edit `D:\homys-master\backend\` — it's a stale,
non-deployed copy (earlier work was wasted there before this was discovered).

```
deploy-temp/                 <- THE deployed project (Vercel)
  src/                       <- React + Vite frontend
  api/                       <- backend = Vercel serverless functions (Express)
    _app.ts                  <- express app: CORS, schema guard, routes
    _config/index.ts         <- env-driven config
    _controllers/            <- auth, property, booking, payment, admin, content...
    _routes/                 <- route definitions
    _middleware/             <- auth (JWT), validate (zod), rateLimit, sanitize
    _db/
      index.ts               <- Neon HTTP + Drizzle
      schema.ts              <- Drizzle schema (source of truth)
      migrate.ts             <- idempotent boot-time schema guard
    _validators/             <- zod schemas
  drizzle.config.ts          <- migration tooling config
  vercel.json
```

**Stack:** React 18 + Vite, Express 5 (serverless), Drizzle ORM, Neon Postgres,
Resend (email), Paymob (payments — gateway still TBD by stakeholders).
Git remote `origin` = `https://github.com/z31ny/homys` (branch `master`).

## 3. Key gotchas

- **Frontend API base** = relative `/api` (see `src/services/api.js`,
  `VITE_API_URL || '/api'`). Do NOT set `VITE_API_URL` to an absolute domain —
  it caused a CORS/"Failed to fetch" outage. It must be empty or `/api`.
- **`VITE_*` env vars are build-time** — changing them requires a redeploy.
- **Env vars only apply on new deployments** — always redeploy after editing them.
- **Express 5**: `req.params.x` is `string | string[]` — cast `as string`.
- **Zod `validate` strips unknown keys** (`req.body = schema.parse(req.body)`).
  If a field isn't in the schema, it never reaches the controller. (This was the
  phone/country signup bug.)
- **DB is Neon HTTP** (`neon-http` driver) — one statement per `db.execute`.

---

## 4. What was done this session

### Mobile UI
- "More than a stay" (home): images side-by-side on mobile (`AboutHero.css`).
- About "Why Choose" + "Vision & Mission": 2-column grid on mobile (`AboutUs.css`).
- About gallery "Newest Style": flat same-size carousel that peeks the next image
  (`AboutUs.jsx` + `AboutUs.css`, `.gallery-mobile-carousel`).
- Stays "Partners" section: horizontal scroll carousel on mobile (`Partners.css`).

### Property card image carousel (stays grid)
- Backend now returns `images: [...]` (all URLs) in `getProperties` and
  `getFeaturedProperties` (`api/_controllers/property.controller.ts`).
- `HomeCard` (`src/components/Homes.jsx`) uses `home.images`, navigable via
  **arrow buttons + touch swipe** using `transform: translateX` (NOT a scrollable
  element — the image itself does not scroll).

### Property details
- Added full lightbox CSS (was unstyled; right arrow was unclickable) —
  `PropertyDetails.css` `.lightbox-overlay`, `.lb-nav`, etc.
- Page background set to `transparent` so the site-wide textured `body` bg shows
  through (matches other pages).

### Domain + email (homyshospitality.com)
- `api/_config/index.ts`: `frontendUrl` → `https://homyshospitality.com`,
  Resend `fromEmail` → `Homys <noreply@homyshospitality.com>`.
- `auth.controller.ts` reset-link fallback updated.
- Resend integration already existed (password reset emails). Domain verified in
  Resend; DNS at GoDaddy (A/CNAME for Vercel, MX/SPF/DKIM/DMARC for Resend).

### Security / production hardening (from audit)
- **#2 CORS** locked to allow-list (homyshospitality.com, www, localhost,
  `*.vercel.app`) — `api/_app.ts`.
- **#3** Boot validation: app throws if `JWT_SECRET` missing/weak or
  `DATABASE_URL` unset — `api/_app.ts`.
- **#4** Deposit auto-cancel aligned to **10 min** (was 30) to match the
  frontend countdown — `api/_controllers/booking.controller.ts`.
- **#5** Schema drift fixed: idempotent boot guard `api/_db/migrate.ts`
  (creates `rate_limits`, ensures booking/property columns + tables) wired into
  `_app.ts`; PLUS real Drizzle tooling (`drizzle.config.ts`, `db:push/generate/
  migrate` scripts).
- **#6** Rate limiter rewritten to be **Postgres-backed** (shared across
  serverless instances, atomic upsert, fail-open) — `api/_middleware/rateLimit.ts`.

### Admin dashboard
- **Delete property**: new `DELETE /api/admin/properties/:id` (`adminDeleteProperty`),
  `adminAPI.deleteProperty`, and a red "Delete Property" button with confirm on
  every card — `src/pages/admin/Properties.jsx`.
- **Guests page** redesign: removed clashing pastel badges → navy/gold/cream
  palette; fixed alignment (no header wrap, vertically centered cells, consistent
  filter borders, uniform `.g-badge`) — `Guests.jsx` + `Guests.css`.

### Other fixes
- Removed emojis from Best Seller / Guest Favorite / New label badges
  (`Homes.jsx`, `AllStays.jsx`, `PropertyDetails.jsx`).
- Signup "Join Us" title no longer clipped under the fixed nav (`SignUp.jsx`
  top-aligned, 180px top padding).
- **Signup now persists phone + country** (were being dropped): added to
  `registerSchema` (`_validators/auth.ts`) and the register controller
  (`auth.controller.ts`).

All of the above is committed and pushed to `z31ny/homys` `master`.

---

## 5. STILL PENDING / TODO

### Must-do deploy/config (on Vercel dashboard — not code)
- [ ] Ensure `VITE_API_URL` is **unset** (or `/api`), then redeploy.
- [ ] Confirm Production env vars: `FRONTEND_URL`, `RESEND_FROM_EMAIL`,
      `RESEND_API_KEY`, `JWT_SECRET`, `DATABASE_URL`, and the Paymob vars.
- [ ] Set `www` → redirect to non-www in Vercel Domains.

### Data cleanup before stakeholder handover
- [ ] Run in Neon SQL Editor: `DELETE FROM bookings;`
      (cascades to `payments` and `booking_addons`). Clears test bookings.

### Known open issue (deferred intentionally)
- [ ] **#1 Payment HMAC not enforced** (`api/_controllers/payment.controller.ts`).
      `paymentCallback` / `paymentWebhook` only `console.warn` on HMAC mismatch
      then still mark bookings paid → forgeable "free booking". **Holding until
      stakeholders confirm the payment gateway (may not be Paymob).** Fix = reject
      on HMAC mismatch.

### Nice-to-have (post-launch)
- Rate limiter is now Postgres-backed (fine); Upstash/Redis would be marginally
  faster if volume grows.
- Existing users created during the phone/country bug have no stored phone/country
  — backfill in DB or have them update their profile.

---

## 6. Common commands

```bash
# from deploy-temp/
npm install            # incl. drizzle-kit + tsx (dev only)
npm run dev            # vite dev server
npm run build          # production build (vite)
npm run db:push        # push schema.ts to DB after editing api/_db/schema.ts
npm run db:studio      # browse DB

# git (remote = z31ny/homys)
git add ... && git commit -m "..." && git push origin master
```
