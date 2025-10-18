import { Worker, Job } from 'bullmq';
import IORedis from 'ioredis';
import { supabase } from './supabase';
import { openai } from './openai';
import { queues } from './redis';
import type { JDInput, MatchResult, RewritePayload } from '@/types';

const connection = new IORedis(process.env.REDIS_URL!, {
  maxRetriesPerRequest: null
});

async function naiveKeywordScore(text: string, resume: string): Promise<MatchResult> {
  const words = Array.from(new Set(text.toLowerCase().match(/[a-z0-9\+\#\.\-]{3,}/g) || []));
  const hits = words.filter(w => resume.toLowerCase().includes(w));
  const score = Math.min(100, Math.round((hits.length / Math.max(words.length, 1)) * 100));
  return { fit_score: score, keywords: hits.slice(0, 50) };
}

async function rewriteWithOpenAI(jd_text: string, resume: string): Promise<RewritePayload> {
  const prompt = `You are an ATS optimization specialist. Rewrite the resume to match the JD and produce a 120-150 word cover letter. Return JSON with keys: tailored_resume, cover_letter.

JD:
${jd_text}

Candidate Resume:
${resume}`;

  const resp = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.2
  });
  const txt = resp.choices[0]?.message?.content || "{}";
  try { return JSON.parse(txt); }
  catch { return { tailored_resume: txt, cover_letter: "See attached tailored resume.", tokens_used: 0 }; }
}

async function handleJob(job: Job) {
  if (job.name === 'parse_jd') {
    const jd = job.data as JDInput;
    const { data: jdRow, error: jdErr } = await supabase
      .from('job_descriptions')
      .insert({ company: jd.company, role: jd.role, location: jd.location, jd_text: jd.jd_text, source: jd.source })
      .select()
      .single();
    if (jdErr) throw jdErr;
    const { data: resumeRow, error: resumeErr } = await supabase
      .from('resumes')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (resumeErr) throw resumeErr;
    const resumeText = resumeRow?.content ?? '';
    await queues.pipeline.add('score_fit', { jd_id: jdRow.id, jd_text: jd.jd_text, resume_id: resumeRow?.id, resumeText }, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 1000 },
      removeOnComplete: true,
      removeOnFail: true
    });
  }

  if (job.name === 'score_fit') {
    const { jd_id, jd_text, resume_id, resumeText } = job.data as any;
    const match = await naiveKeywordScore(jd_text, resumeText);
    await supabase.from('matches').insert({ jd_id, resume_id, fit_score: match.fit_score, keywords: match.keywords });
    await queues.pipeline.add('rewrite_resume', { jd_id, jd_text, resume_id, resumeText }, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 1000 },
      removeOnComplete: true,
      removeOnFail: true
    });
  }

  if (job.name === 'rewrite_resume') {
    const { jd_id, jd_text, resume_id, resumeText } = job.data as any;
    const rewrite = await rewriteWithOpenAI(jd_text, resumeText);
    await supabase.from('rewrites').insert({
      jd_id,
      resume_id,
      tailored_resume: rewrite.tailored_resume,
      cover_letter: rewrite.cover_letter,
      tokens_used: rewrite.tokens_used || null
    });
  }
}

const globalWithWorker = globalThis as typeof globalThis & { mtiaWorker?: Worker };

if (!globalWithWorker.mtiaWorker) {
  globalWithWorker.mtiaWorker = new Worker('mtia-pipeline', handleJob, { connection });
  console.log("MTIA worker running. Queue: mtia-pipeline");
}

export const worker = globalWithWorker.mtiaWorker;
