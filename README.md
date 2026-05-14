# Wallstreet

A browser-based stock-trading game inspired by Wallstreet Raiders. Vercel-native: Next.js 15 App Router, Neon Postgres + Drizzle, Auth.js, Vercel Cron.

## Stack
- Next.js 15 (App Router, Server Actions)
- Auth.js v5 (Credentials provider, JWT sessions, Drizzle adapter)
- Neon Postgres via `@neondatabase/serverless` + Drizzle ORM
- Tailwind CSS
- Vercel Cron (`vercel.json`) hits `/api/cron/tick` every minute to evolve prices

## Game (MVP)
- Sign in with any email/password (account auto-created, $10,000 starting cash)
- `/market` — all stocks with live-ish prices and % change
- `/stock/[symbol]` — detail view + buy/sell form (server action)
- `/portfolio` — cash, equity, net worth, holdings P/L, recent trades
- `/leaderboard` — top 50 players by net worth
- Market tick uses geometric Brownian motion per stock (volatility + drift)

## Local dev

```bash
# 1. install deps
npm install

# 2. set env
cp .env.example .env
# fill DATABASE_URL (Neon), AUTH_SECRET, CRON_SECRET

# 3. push schema and seed stocks
npm run db:push
npm run db:seed

# 4. run
npm run dev
```

Trigger a manual market tick:

```bash
curl -H "Authorization: Bearer $CRON_SECRET" http://localhost:3000/api/cron/tick
```

## Deploy to Vercel
1. Create a Neon Postgres database (or attach Vercel Postgres) — copy the connection string.
2. Import this repo into Vercel.
3. Env vars: `DATABASE_URL`, `AUTH_SECRET`, `AUTH_URL`, `CRON_SECRET`.
4. After first deploy: `npm run db:push && npm run db:seed` against the prod DB.
5. Vercel Cron will hit `/api/cron/tick` every minute (configured in `vercel.json`).

## Next steps (when ready to grow past MVP)
- Limit orders + order book (multiplayer price discovery)
- Player-founded companies + IPOs
- Banks, loans, options
- Real-time price stream (Vercel KV pub/sub or Server-Sent Events)
- News events that move sectors
