# LOWDIF Stream

Music streaming web app for **app.lowdif.com** — search dashboard, player, artist uploads, stats, and proof-of-listen mining for **LOWDIF** tokens.

Marketing site: [lowdif.com](https://lowdif.com)  
Streaming app: `app.lowdif.com` (this repo)

## Features

- **Search dashboard** — home page with track/artist search and genre filters
- **Streaming player** — fixed bottom player bar with progress tracking
- **Proof of listen** — after 80%+ of a track, submits mining request (1 LOWDIF per listen)
- **Mock blockchain adapter** — swap in Grapewallet API when credentials are ready
- **Auth** — listener and artist signup/login (`/signup`, `/login`, `/artist/signup`)
- **Artist hub** — upload audio + cover art (`/artist/dashboard`)
- **Stats dashboard** — listens, tokens mined, artist analytics (`/stats`)

## lowdif.com → app.lowdif.com

Point Sign up / Log in buttons on **lowdif.com** to:

- Sign up: `https://app.lowdif.com/signup`
- Log in: `https://app.lowdif.com/login`
- Artist signup: `https://app.lowdif.com/artist/signup`

## Setup

Requires Node.js 18+ and PostgreSQL (Neon free tier works for local + production).

```bash
cd lowdif
cp .env.example .env
# Edit .env — set DATABASE_URL and JWT_SECRET
npm install
npm run db:deploy
npm run db:seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Windows PowerShell note

If `npm` fails with “running scripts is disabled”, use either:

```bat
preview.bat
```

or in PowerShell:

```powershell
npm.cmd run preview
```

To fix PowerShell permanently (current user only):

```powershell
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
```

> **Deploy to app.lowdif.com:** see **[DEPLOYMENT.md](./DEPLOYMENT.md)** for the full Vercel + Neon + DNS guide.

### Demo accounts (after seed)

| Role     | Email                 | Password     |
|----------|-----------------------|--------------|
| Artist   | artist@lowdif.com     | password123  |
| Listener | listener@lowdif.com   | password123  |

## Blockchain integration

The mock adapter lives in `src/lib/blockchain/mock-mining.ts`.

When Grapewallet API is ready, set in `.env`:

```env
GRAPEWALLET_API_URL=https://your-grapewallet-endpoint
GRAPEWALLET_API_KEY=your-api-key
```

The adapter will POST to `{GRAPEWALLET_API_URL}/proof-of-listen` and fall back to mock if unavailable.

## Deploy (app.lowdif.com)

See **[DEPLOYMENT.md](./DEPLOYMENT.md)** for step-by-step instructions:

1. Push to GitHub → import to Vercel
2. Neon PostgreSQL + Vercel Blob storage
3. Environment variables and `app.lowdif.com` DNS
4. Link auth buttons on lowdif.com

## Project structure

```
src/app/           Pages and API routes
src/components/    UI (player, search, auth)
src/lib/           Auth, DB, types, blockchain adapter
prisma/            Schema + seed
public/uploads/    Local audio storage (dev)
```
