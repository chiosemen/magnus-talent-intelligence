# Deployment Guide — Free-Tier Hybrid (Vercel + Render)

## Stack
- Vercel (Hobby): Next.js UI
- Render (Free Web): Combined Worker + Python CLI
- Redis: Render Free or Upstash Free
- Supabase Free: Postgres + Storage
- OpenAI: pay-per-token (use gpt-4o-mini)

## 1) Vercel (Next.js UI)
1. Import repo, set root to `/magnus-talent-agent`.
2. Add env vars:
```
OPENAI_API_KEY=sk-...
SUPABASE_URL=...
SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
REDIS_URL=...            # from Render or Upstash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=...
SMTP_PASS=...
OUTREACH_FROM="Your Name <you@email.com>"
```
3. Deploy.

## 2) Supabase
- Create project → SQL editor → run `magnus-talent-agent/supabase/schema.sql`.
- Copy URL + anon + service_role -> use in Vercel + Render.

## 3) Redis
- Render: Add Redis (Free) → copy internal URL; or Upstash Free → copy URL.
- Set `REDIS_URL` in both Vercel & Render.

## 4) Render (Worker + CLI in one free Web Service)
- New Web Service → repo root = project root.
- Build Command (Docker build):
```
docker build -t mtia-free -f magnus-talent-agent/Dockerfile .
```
- Start Command (compose run of worker+cli):
```
docker compose up worker cli
```
- Env vars: same as Vercel + `SUPABASE_SERVICE_ROLE_KEY` + SMTP + `TO_EMAIL`.

> Free plan sleeps after 15 min idle; wakes on traffic.

## 5) Local Orchestration (optional)
```
docker compose up --build
```

## 6) CI/CD (GitHub Actions)
- Push to `main` → `.github/workflows/deploy.yml` builds & deploys.
- Vercel for UI; Render for worker & CLI.

## Cost Notes
- All $0 except OpenAI tokens (~$1–2/mo during testing).
