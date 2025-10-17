# Magnus Talent Intelligence (MTIA)
**Resume → JD → AI Scoring/Rewrite → Outreach → Analytics**

This repository contains:
- **magnus-talent-agent/** — Next.js + Supabase + BullMQ web pipeline
- **magnus_talent_cli_dashboard/** — Python CLI with Rich dashboard
- **tools/magnus_talent_cli/** — lightweight headless CLI prototype
- **docs/** — audit & deployment docs (executive + engineering)

---

## Executive Overview (Investor-Ready)
- **What it does:** Automates candidate-job matching with AI, generates tailored resumes & cover letters, and sends recruiter outreach with tracking.
- **Why it wins:** Cuts applicant prep time by 90%, standardizes quality, and adds data-driven feedback loops to improve conversion.
- **Architecture:** Web app orchestrates queues; Python CLI provides ops console; Supabase acts as source-of-truth; Redis/BullMQ schedules jobs; LLMs (OpenAI) handle scoring & rewriting.
- **Unit economics:** Minutes per tailored application; reusable prompts; centralized metrics to optimize “offer odds.”
- **Security:** No hardcoded secrets, env-var driven; optional dry-run modes for email; audit-ready checklists.

---

## Developer Quickstart
### Prereqs
- Node 20+, pnpm or npm
- Python 3.10+
- Redis (local or Upstash)
- Supabase project (URL + Keys)
- OpenAI API Key

### Web App
```bash
cd magnus-talent-agent
cp .env.example .env.local   # fill keys
pnpm install
pnpm dev & pnpm worker
```

### CLI Dashboard
```bash
cd ../magnus_talent_cli_dashboard
cp config.env config.env.local && mv config.env.local config.env  # fill keys
python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt
echo "PASTE RESUME" > resume.txt
echo "PASTE JD" > job_description.txt
python main.py
```

### Tables (Supabase)
Run `supabase/schema.sql` from the web app folder.

---

## Folder Map
```
magnus-talent-intelligence/
├─ magnus-talent-agent/          # Next.js + BullMQ + Supabase
├─ magnus_talent_cli_dashboard/  # Python Rich dashboard
├─ tools/
│  └─ magnus_talent_cli/         # lightweight CLI
└─ docs/
   ├─ AUDIT_REPORT.md
   └─ Claude_Code_Audit_Prompt.txt
```
# magnus-talent-intelligence
