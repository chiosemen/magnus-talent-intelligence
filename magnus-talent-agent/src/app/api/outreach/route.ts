import '@/lib/init-worker';
import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { supabase } from '@/lib/supabase';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 465),
  secure: true,
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
});

export async function POST(req: Request) {
  try {
    const { jd_id, resume_id, to, subject = 'Application from Chinye Osemene' } = await req.json();
    if (!jd_id || !resume_id || !to) throw new Error('jd_id, resume_id, to required');
    const { data: rw } = await supabase.from('rewrites').select('*').eq('jd_id', jd_id).eq('resume_id', resume_id).order('created_at', { ascending: false }).limit(1).single();
    const tailored = rw?.tailored_resume || 'Please see attached tailored resume.';
    const cover = rw?.cover_letter || '';
    const info = await transporter.sendMail({ from: process.env.OUTREACH_FROM!, to, subject, text: cover + "\n\n---\n" + tailored });
    await supabase.from('outreach').insert({ jd_id, resume_id, to_email: to, subject, status: 'sent', response: info as any });
    return NextResponse.json({ ok: true, id: info.messageId });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 400 });
  }
}
