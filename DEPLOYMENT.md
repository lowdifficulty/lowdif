# Deploy LOWDIF Stream to app.lowdif.com

This guide walks through deploying the streaming app to **app.lowdif.com** using **Vercel** (hosting), **Neon** (PostgreSQL database), and **Vercel Blob** (audio/cover uploads).

Estimated time: ~30 minutes.

---

## Architecture

```
lowdif.com (marketing)          app.lowdif.com (this app)
       │                                │
       │  Sign up / Log in links        │
       └──────────────────────────────►│
                                         ├── Vercel (Next.js)
                                         ├── Neon (PostgreSQL)
                                         └── Vercel Blob (uploads)
```

---

## Prerequisites

- GitHub account (to connect the repo to Vercel)
- Access to **lowdif.com** DNS (Cloudflare, Namecheap, etc.)
- Node.js 18+ on your machine (for initial push + seed)

---

## Step 1 — Push code to GitHub

From your machine:

```bash
cd C:\Users\Admin\lowdif
git init
git add .
git commit -m "Initial LOWDIF Stream app"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/lowdif.git
git push -u origin main
```

Replace `YOUR_USERNAME` with your GitHub username or org.

---

## Step 2 — Create a Neon PostgreSQL database

1. Go to [neon.tech](https://neon.tech) and create a free account.
2. Create a project named **lowdif**.
3. Copy the **connection string** (pooled recommended for serverless):

   ```
   postgresql://user:pass@ep-xxxx.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```

Keep this for Step 4.

---

## Step 3 — Create a Vercel project

1. Go to [vercel.com](https://vercel.com) → **Add New Project**.
2. Import your **lowdif** GitHub repo.
3. Framework preset: **Next.js** (auto-detected).
4. **Do not deploy yet** — add environment variables first (Step 4).

---

## Step 4 — Set environment variables in Vercel

In Vercel → Project → **Settings** → **Environment Variables**, add:

| Variable | Value | Environments |
|----------|-------|--------------|
| `DATABASE_URL` | Neon connection string from Step 2 | Production, Preview |
| `JWT_SECRET` | Random 64-char hex (see below) | Production, Preview |
| `NEXT_PUBLIC_APP_URL` | `https://app.lowdif.com` | Production |
| `NEXT_PUBLIC_APP_URL` | `https://YOUR-PROJECT.vercel.app` | Preview |
| `NEXT_PUBLIC_MARKETING_URL` | `https://lowdif.com` | All |
| `LOWDIF_TOKEN_SYMBOL` | `LOWDIF` | All |
| `LOWDIF_TOKENS_PER_LISTEN` | `1` | All |

Generate `JWT_SECRET`:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Leave `GRAPEWALLET_API_URL` and `GRAPEWALLET_API_KEY` empty for now (mock mining stays active).

---

## Step 5 — Add Vercel Blob for uploads

Serverless hosts cannot write to disk — artist uploads need cloud storage.

1. In Vercel → Project → **Storage** → **Create Database** → **Blob**.
2. Name it **lowdif-uploads** and connect it to your project.
3. Vercel auto-adds `BLOB_READ_WRITE_TOKEN` — verify it appears in Environment Variables.

---

## Step 6 — Deploy

Click **Deploy** (or push to `main` if already connected).

Vercel runs `vercel-build`, which:

1. Generates Prisma client
2. Runs `prisma migrate deploy` (creates tables in Neon)
3. Builds Next.js

Check the deploy log for errors. A successful build ends with “Deployment ready”.

---

## Step 7 — Seed production data (optional)

Run once from your machine with the **production** `DATABASE_URL`:

```bash
# Temporarily point to Neon production DB
set DATABASE_URL=postgresql://...your-neon-url...
npm run db:seed
```

This creates demo accounts and sample tracks. **Change or remove demo passwords before going live.**

---

## Step 8 — Connect app.lowdif.com (DNS)

### In Vercel

1. Project → **Settings** → **Domains**
2. Add domain: `app.lowdif.com`
3. Vercel shows the DNS record you need (usually a **CNAME**).

### At your DNS provider (where lowdif.com is registered)

Add a record:

| Type | Name | Value |
|------|------|-------|
| CNAME | `app` | `cname.vercel-dns.com` |

If you use **Cloudflare**, set the proxy to **DNS only** (grey cloud) initially until SSL is verified, then you can enable the orange cloud.

DNS can take 5–60 minutes. Vercel will issue an SSL certificate automatically.

---

## Step 9 — Link lowdif.com auth buttons

On your marketing site (**lowdif.com**), point buttons to:

| Button | URL |
|--------|-----|
| Sign up | `https://app.lowdif.com/signup` |
| Log in | `https://app.lowdif.com/login` |
| Artist signup | `https://app.lowdif.com/artist/signup` |

Example HTML:

```html
<a href="https://app.lowdif.com/signup">Sign up</a>
<a href="https://app.lowdif.com/login">Log in</a>
```

---

## Step 10 — Verify production

Checklist after DNS propagates:

- [ ] `https://app.lowdif.com` loads the search dashboard
- [ ] Sign up creates an account and logs you in
- [ ] Demo/seed tracks appear and play in the bottom player
- [ ] After ~80% of a track, a LOWDIF mining toast appears (mock tx hash)
- [ ] `/stats` shows listens and tokens
- [ ] Artist account can upload at `/artist/dashboard`
- [ ] Uploaded track appears in search and plays from Blob URL

---

## Local development (with Neon)

You can use the same Neon DB for local dev, or create a separate **dev** branch in Neon:

```bash
cd C:\Users\Admin\lowdif
copy .env.example .env
# Edit .env with your Neon DATABASE_URL and JWT_SECRET
npm install
npm run db:deploy   # apply migrations
npm run db:seed     # optional demo data
npm run dev
```

Without `BLOB_READ_WRITE_TOKEN`, uploads save to `public/uploads/` locally.

---

## Troubleshooting

### Build fails: “Can't reach database server”

- Confirm `DATABASE_URL` is set in Vercel for **Production**
- Use Neon’s **pooled** connection string for serverless
- Ensure `?sslmode=require` is on the URL

### Build fails: Prisma migrate

- Check migration files exist under `prisma/migrations/`
- Run `npm run db:deploy` locally against the same DB to test

### Uploads fail in production

- Confirm **Vercel Blob** is connected and `BLOB_READ_WRITE_TOKEN` is set
- Redeploy after adding Blob storage

### Auth / cookies not persisting

- Confirm `NEXT_PUBLIC_APP_URL` matches your live domain exactly (`https://app.lowdif.com`)
- Cookies use `secure: true` in production — site must be HTTPS

### Audio won’t play (CORS)

- Tracks uploaded via Vercel Blob are served with public URLs — should work out of the box
- External demo URLs (SoundHelix) require internet access

---

## When Grapewallet API is ready

Add to Vercel environment variables:

```
GRAPEWALLET_API_URL=https://your-grapewallet-endpoint
GRAPEWALLET_API_KEY=your-api-key
```

Redeploy. The adapter in `src/lib/blockchain/mock-mining.ts` will call the real API and fall back to mock on failure.

---

## Alternative: Railway (single platform)

If you prefer one dashboard instead of Vercel + Neon + Blob:

1. [railway.app](https://railway.app) → New Project → Deploy from GitHub
2. Add a **PostgreSQL** plugin → copy `DATABASE_URL`
3. Add env vars (same as Step 4)
4. For uploads on Railway, use **Cloudflare R2** or **AWS S3** (requires small code change to `src/lib/storage.ts`)

Vercel is recommended for Next.js; Railway is simpler if you want Postgres + app in one place.

---

## Quick reference

| Service | Purpose | Free tier |
|---------|---------|-----------|
| Vercel | Host Next.js at app.lowdif.com | Yes |
| Neon | PostgreSQL database | Yes |
| Vercel Blob | Audio/cover file storage | Yes (limited) |
| Cloudflare DNS | CNAME for app subdomain | Free |

Need help with a specific step (GitHub, Neon, DNS provider)? Say which step you’re on and what you see.
