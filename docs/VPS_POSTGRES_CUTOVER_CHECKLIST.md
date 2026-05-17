# VPS + PostgreSQL Cutover Checklist (from Vercel)

Use this checklist to validate the app after moving from Vercel to a VPS with your own PostgreSQL.

## 1) Environment variables (required)

Set these on the VPS process manager (systemd/pm2/docker compose), **not** only in `.env` files:

- `NODE_ENV=production`
- `PORT=5000` (or your reverse-proxy target port)
- `DATABASE_URL=postgresql://...`
- `JWT_SECRET=<long-random-string>`
- `FRONTEND_ORIGIN=https://your-domain.com`

If `FRONTEND_ORIGIN` contains multiple domains, use comma-separated values.

## 2) Database connectivity checks

Run from app root on VPS:

```bash
npm ci
npx prisma generate
npx prisma migrate deploy
npx prisma migrate status
```

Expected:
- migrations report as applied
- no `P1001` / `P1012` connection errors

## 3) Build and runtime checks

```bash
npm run build
npm run start
curl -sS http://127.0.0.1:5000/api/health
curl -sS http://127.0.0.1:5000/api/db-check
```

Expected:
- build succeeds
- health returns `{ "status": "ok" }`
- db-check confirms connectivity

## 4) Reverse proxy checks (Nginx/Caddy/Traefik)

Ensure your proxy:

- forwards `Host` and `X-Forwarded-*` headers
- supports request body size for PDF/JSON payloads
- serves HTTPS and redirects HTTP -> HTTPS
- routes `/api/*` and SPA paths to the same app service

## 5) Auth and cookie checks

Because auth uses cookies, verify:

- `Set-Cookie` is present on login
- cookie has `HttpOnly`
- cookie `Secure` is true on HTTPS
- cookie `SameSite` policy matches your frontend/backend domain strategy

## 6) Frequent migration issues after leaving Vercel

- Missing `JWT_SECRET` in production.
- `DATABASE_URL` points to localhost/private network not reachable by app process.
- Prisma migrations were never deployed on VPS.
- `FRONTEND_ORIGIN` not set, causing CORS/cookie failures.
- App process starts, but reverse proxy points to wrong internal port.

## 7) Optional: startup hardening

For Docker deployments, run migrations before starting app:

```bash
npx prisma migrate deploy && node server/index.js
```

For systemd/pm2, add a pre-start migration step in deployment pipeline.

