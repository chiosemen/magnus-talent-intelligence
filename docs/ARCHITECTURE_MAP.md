# Architecture Map — Magnus Talent Intelligence (Free-Tier Hybrid)

```
               ┌──────────────────────────────┐
               │        VERCEL (Hobby)        │
               │  Next.js Front-End + APIs    │
               │  /magnus-talent-agent        │
               └─────────────▲────────────────┘
                             │
                             │ (HTTPS API Calls)
                             ▼
┌────────────────────────────────────────────────────────┐
│                 RENDER (Free Web Service)              │
│  Combined Worker + Python CLI Dashboard Container      │
│  • Runs BullMQ queue processor                         │
│  • Calls OpenAI (gpt-4o-mini) for scoring/rewrites     │
│  • Sends recruiter emails (SMTP)                       │
│  • Persists logs & metrics to Supabase                 │
└───────────────▲───────────────┬────────────────────────┘
                │               │
                │ (REST RPC)    │ (BullMQ Queue Events)
                │               │
                ▼               ▼
      ┌──────────────────┐      ┌───────────────────┐
      │ SUPABASE (Free)  │      │ REDIS (Free Tier) │
      │ • Postgres DB     │◄──►│ • Queue storage   │
      │ • Storage buckets │     │ • Job metadata    │
      └──────────────────┘      └───────────────────┘
                ▲
                │ (AI Calls)
                │
                ▼
        ┌──────────────────┐
        │ OPENAI API       │
        │ gpt-4o-mini      │
        │ ~ $1–2 / month   │
        └──────────────────┘
```

**Legend:** ▲ / ▼ = data flow direction. All services free-tier friendly (OpenAI is pay-per-token).

---

## Request-Lifecycle Storyboard (JD → Rewrite → Email → Log)

1. **JD Ingestion (Vercel)**  
   User pastes a job description → `/api/ingest` validates and enqueues to BullMQ (Redis).

2. **Queue Pickup (Render Worker)**  
   Worker stores JD in `job_descriptions`, fetches latest resume from `resumes`.

3. **AI Scoring & Rewrite (Worker + OpenAI)**  
   GPT rubric (0–100) saved to `matches`; tailored resume + 150-word cover letter saved to `rewrites`.

4. **Outreach (Render CLI)**  
   Python CLI sends email via SMTP; status recorded in `outreach`.

5. **Analytics (Vercel UI + Supabase)**  
   UI displays scores, statuses; CLI shows live progress panels.

6. **Idle & Wake (Render Free)**  
   Container sleeps after 15 minutes idle; any new JD/API call wakes it automatically.
