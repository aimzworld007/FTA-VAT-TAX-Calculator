# UAE Tax Suite

Deploy-ready Vite + React app for UAE VAT Return and UAE Corporate Tax estimation.

## Features

- UAE VAT Return calculator for 3-month VAT periods
- VAT inclusive / VAT exclusive calculation mode
- Emirate-wise VAT201-style box mapping
- UAE Corporate Tax calculator with AED 375,000 threshold
- Small Business Relief switch with AED 3,000,000 revenue test
- Shared business profile
- Browser autosave using localStorage
- Print / Save PDF support
- Responsive Material-style UI

## Local Development

```bash
npm install
npm run dev:api
npm run dev
```

If your API runs on another host (instead of `http://localhost:8787`), add:

```bash
VITE_API_BASE_URL=https://your-api-domain.com
```

in a local `.env` file.

## Production Build

```bash
npm run build
```

## Deploy to Vercel

1. Push this folder to GitHub.
2. Open Vercel → New Project.
3. Import the GitHub repository.
4. Framework preset: Vite.
5. Build command: `npm run build`.
6. Output directory: `dist`.
7. Deploy.

## Add user registration/login and tax history (implementation plan)

This project already has a lightweight Express backend (`backend/server.js`) and a React frontend. The cleanest path is to add a real API + database layer and keep the frontend calculators as-is.

### 1) Pick auth + database stack

Recommended stack for this codebase:

- **Auth**: email/password with JWT access token + refresh token
- **Hashing**: `bcrypt`
- **DB**: PostgreSQL
- **ORM**: Prisma
- **Session model**: refresh token stored in HTTP-only cookie (rotating)

Why this fits:

- Express backend exists already, so auth endpoints are straightforward to add.
- You need tax history per user, which is relational and queryable (PostgreSQL).
- Prisma gives migrations and typed DB access.

### 2) Database schema

Create these core tables:

- `users`
  - `id` (uuid, pk)
  - `email` (unique)
  - `password_hash`
  - `created_at`
- `tax_records`
  - `id` (uuid, pk)
  - `user_id` (fk → users.id)
  - `tax_type` (`VAT` or `CORPORATE`)
  - `period_start`, `period_end` (nullable for corporate annual only)
  - `input_payload` (jsonb: raw form values)
  - `result_payload` (jsonb: computed totals)
  - `created_at`, `updated_at`
- `refresh_tokens`
  - `id` (uuid)
  - `user_id` (fk)
  - `token_hash`
  - `expires_at`
  - `revoked_at`

### 3) API endpoints

Suggested `/api/auth` routes:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`
- `GET /api/auth/me`

Suggested `/api/tax-records` routes (authenticated):

- `POST /api/tax-records` (save VAT/corporate calculation snapshot)
- `GET /api/tax-records` (list current user history)
- `GET /api/tax-records/:id` (single record)
- `PUT /api/tax-records/:id` (optional edit)
- `DELETE /api/tax-records/:id`

### 4) Backend implementation checklist

1. Add dependencies: `prisma`, `@prisma/client`, `bcrypt`, `jsonwebtoken`, `cookie-parser`, `zod`.
2. Initialize Prisma and create migration for tables above.
3. Add auth middleware to verify JWT and attach `req.user`.
4. Implement auth controllers (register/login/refresh/logout/me).
5. Implement tax-record controllers scoped to `req.user.id` only.
6. Add input validation with `zod` on all request bodies.
7. Add CORS + cookie settings for your frontend domain.

### 5) Frontend changes

1. Add Auth pages/components:
   - `Login`
   - `Register`
2. Add an auth context/store that keeps user state.
3. On successful calculator result, call `POST /api/tax-records`.
4. Add a “History” screen/table in dashboard to list prior records.
5. Add “Load into calculator” action to repopulate wizard from `input_payload`.

### 6) Security essentials (must-have)

- Never store plaintext passwords; always hash with bcrypt.
- Use HTTP-only cookies for refresh token.
- Short-lived access token (e.g., 15 minutes).
- Add login rate limiting (`express-rate-limit`).
- Add Helmet and strict CORS origin allow-list.
- Filter every DB query by authenticated `user_id`.

### 7) Minimal incremental rollout

If you want low risk, do this in phases:

- **Phase 1**: Register/Login + `GET /me`
- **Phase 2**: Save and list tax records
- **Phase 3**: Load, edit, delete history + refresh token rotation
- **Phase 4**: password reset, email verification, audit logs

## Disclaimer

This app is an internal calculation aid only. Final UAE VAT and Corporate Tax filing should be reviewed with a qualified accountant or tax advisor.
