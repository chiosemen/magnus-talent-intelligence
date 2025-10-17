create table if not exists resumes (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  content text not null,
  created_at timestamptz default now()
);
create table if not exists job_descriptions (
  id uuid primary key default gen_random_uuid(),
  company text, role text, location text,
  jd_text text not null, source text,
  created_at timestamptz default now()
);
create table if not exists matches (
  id uuid primary key default gen_random_uuid(),
  resume_id uuid references resumes(id) on delete cascade,
  jd_id uuid references job_descriptions(id) on delete cascade,
  fit_score numeric, keywords jsonb, created_at timestamptz default now()
);
create table if not exists rewrites (
  id uuid primary key default gen_random_uuid(),
  resume_id uuid references resumes(id) on delete cascade,
  jd_id uuid references job_descriptions(id) on delete cascade,
  tailored_resume text, cover_letter text, tokens_used int,
  created_at timestamptz default now()
);
create table if not exists outreach (
  id uuid primary key default gen_random_uuid(),
  jd_id uuid references job_descriptions(id) on delete cascade,
  resume_id uuid references resumes(id) on delete cascade,
  to_email text, subject text, status text, response jsonb,
  created_at timestamptz default now()
);
