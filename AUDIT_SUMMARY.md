# Audit Summary

## Critical Issues
- ❌ `docker-compose.yml:4` / `render.yaml:43` – Both Docker build targets point at `Dockerfile`, but no such files exist anywhere in the repo, so `docker compose up --build` and Render deploys fail immediately. Add explicit Dockerfiles for the web app and CLI images (or fix the build paths) so the declared services can build.
  ```dockerfile
  # magnus-talent-agent/Dockerfile
  FROM node:20-alpine AS deps
  WORKDIR /app
  COPY package.json pnpm-lock.yaml ./
  RUN corepack enable pnpm && pnpm install --frozen-lockfile
  COPY . .
  RUN pnpm build

  FROM node:20-alpine
  WORKDIR /app
  COPY --from=deps /app/.next ./.next
  COPY --from=deps /app/public ./public
  COPY --from=deps /app/package.json /app/pnpm-lock.yaml ./
  RUN corepack enable pnpm && pnpm install --prod --frozen-lockfile
  EXPOSE 3000
  CMD ["pnpm","start"]
  ```
  ```dockerfile
  # magnus_talent_cli_dashboard/Dockerfile
  FROM python:3.11-slim
  WORKDIR /app
  COPY requirements.txt .
  RUN pip install --no-cache-dir -r requirements.txt
  COPY . .
  CMD ["python","main.py"]
  ```
- ❌ `magnus_talent_cli_dashboard/modules/llm_scorer.py:8` (and mirrored `tools/magnus_talent_cli/modules/llm_scorer.py:8`) – The f-string contains bare `{skills, ...}` which raises `NameError` at import time, so the CLI crashes before scoring. Rewrite the prompt string to avoid formatting braces.
  ```python
  prompt = (
      "Rate this resume against this job description from 0-100 for:\n"
      "skills, seniority, tools, impact, communication.\n"
      "Return JSON with keys: skills, seniority, tools, impact, communication, overall.\n"
      f"JD: {jd_text}\nResume: {resume_text}"
  )
  ```
- ❌ `render.yaml:46-58` – The Render CLI worker omits `SMTP_PORT`, `OUTREACH_FROM`, and `TO_EMAIL`, so `int(os.getenv("SMTP_PORT"))` throws and no outreach email can be sent. Declare the missing variables so the worker starts cleanly.
  ```yaml
        - key: SMTP_PORT
          sync: false
        - key: OUTREACH_FROM
          sync: false
        - key: TO_EMAIL
          sync: false
  ```

## Improvements
- ⚠️ `magnus_talent_cli_dashboard/main.py:21` – `read_file("job_description.txt")` / `"resume.txt"` will raise `FileNotFoundError` in fresh environments (e.g. Render) unless the files are pre-seeded. Guard the reads and retrieve content from Supabase or prompt the user instead.
  ```python
  from pathlib import Path

  def read_file(path: str) -> str:
      p = Path(path)
      if not p.exists():
          return ""
      return p.read_text(encoding="utf-8")
  ```
- ⚠️ `magnus-talent-agent/src/lib/worker.ts:43` – The resume lookup should tolerate empty tables without silently swallowing Supabase errors. Using `maybeSingle()` preserves the happy path while surfacing real API failures.
  ```typescript
  const { data: resumeRow, error: resumeErr } = await supabase
    .from('resumes')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (resumeErr) throw resumeErr;
  ```
- ⚠️ Repository root – No `pnpm-lock.yaml` is committed, so web/worker installs are non-reproducible and the new Dockerfiles cannot lock dependencies. Generate and commit a lockfile before shipping.
  ```bash
  pnpm install --lockfile-only
  ```

## Security & Secrets
- ⚠️ `magnus_talent_cli_dashboard/config.env:1` and `tools/magnus_talent_cli/config.env:1` – Sample configs ship with real-looking `sk-...` and JWT strings; treat them as compromised and replace with explicit placeholders in a tracked `.env.example`, keeping the real secrets out of git.
  ```env
  OPENAI_API_KEY=OPENAI_KEY_HERE
  SUPABASE_KEY=SUPABASE_SERVICE_ROLE_KEY_HERE
  ```
- ⚠️ `docs/DEPLOYMENT_GUIDE.md:14` – Documentation still prints `OPENAI_API_KEY=sk-...`; scrub or mask secrets in docs to avoid copy/pasting sensitive keys.
  ```md
  OPENAI_API_KEY=<OPENAI_API_KEY>
  ```

## CI/CD & Docker
- ⚠️ `.github/workflows/deploy.yml:56-62` – The `deploy-render` job only echoes instructions, so worker/CLI updates are never deployed via CI. Replace it with the official Render deploy action (or CLI) using a service ID token.
  ```yaml
      - name: Deploy Render services
        uses: render-examples/blueprint-deploy-action@v1
        with:
          blueprint: render.yaml
          api-key: ${{ secrets.RENDER_API_KEY }}
  ```
- ⚠️ `render.yaml:24` – Once a lockfile exists, pin installs with `pnpm install --frozen-lockfile` so Render builds match CI/local.
  ```yaml
    buildCommand: pnpm install --frozen-lockfile
  ```
- ⚠️ `docker-compose.yml:5` – The `web` service starts with `pnpm dev`, which runs the hot-reload dev server. Use the production build once Dockerfiles are added to mimic real deployment behavior.
  ```yaml
    command: ["pnpm", "start"]
  ```
