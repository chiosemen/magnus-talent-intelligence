import { NextResponse } from 'next/server';
import { z } from 'zod';
import { enqueueJD } from '@/lib/queue';
const schema = z.object({ company: z.string().optional(), role: z.string().optional(), location: z.string().optional(), jd_text: z.string().min(40), source: z.string().optional() });
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = schema.parse(body);
    const jobId = await enqueueJD(parsed);
    return NextResponse.json({ ok: true, jobId });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 400 });
  }
}
