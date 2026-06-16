# Frontier Field Guide — Fullstack

A plain-language catalog of current AI models, now backed by a real API with
**live updates**: edit a model and every open browser refreshes instantly,
no reload.

```
ai-catalog/
├── server/        Express + SQLite API with Server-Sent Events (real-time)
└── client/        Vite + React frontend (catalog + admin panel)
```

## How the real-time part works

1. The browser loads the catalog once over normal REST (`GET /api/models`).
2. It then opens a persistent **Server-Sent Events** stream (`GET /api/stream`).
3. Any write (`POST` / `PUT` / `DELETE`) updates SQLite and **broadcasts** the
   change to every connected stream.
4. Each browser applies the change to its in-memory list — so all viewers stay
   in sync within milliseconds, with zero polling.

Writes require an admin token (`x-admin-token` header); reads are public.

## Quick start

You need Node 18+ installed. From the project root:

```bash
# 1. install both apps (uses npm workspaces)
npm install

# 2. create the database and load the starter catalog
npm run seed

# 3. run server (:4000) and client (:5173) together
npm run dev
```

Then open http://localhost:5173.

To try real-time: open the site in two browser windows side by side, open the
**Admin** panel in one (default token below), edit or add a model, and watch the
other window update on its own.

### Admin token

Writes are protected by a token. The default for local dev is:

```
dev-secret-change-me
```

Set your own by creating `server/.env` with `ADMIN_TOKEN=your-secret` (see
`server/.env.example`). **Change this before deploying anywhere public.**

## Running the two apps separately

```bash
# terminal 1
cd server && npm install && npm run seed && npm run dev

# terminal 2
cd client && npm install && npm run dev
```

The Vite dev server proxies `/api/*` to the backend on port 4000, so the client
always talks to a relative `/api` path and you never hardcode the host.

## Keeping the catalog current

This is the real long-term work. Options, easiest first:

- **Admin panel** (built in) — hand-edit models as the landscape shifts.
- **Seed file** — bulk-update `server/seed.js` and re-run `npm run seed`.
- **Scheduled importer** — add a cron job that pulls from provider docs or an
  aggregator and upserts via the same API. A stub lives in
  `server/routes/models.js` (the `upsert` logic is reused) — point a scraper at
  `POST /api/models` and you have an automated pipeline.

## Production notes

- Swap SQLite for Postgres if you expect real traffic (the repository layer in
  `server/db.js` is the only place to change).
- Put the API behind HTTPS — SSE needs a stable connection; most hosts support
  it, but check that your proxy doesn't buffer `text/event-stream`.
- Build the client with `npm run build` (in `client/`) and serve the static
  files however you like; point them at the deployed API origin.
