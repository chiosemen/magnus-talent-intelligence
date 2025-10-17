import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
export async function POST(req: Request) {
  try {
    const { title, content } = await req.json();
    if (!title || !content) throw new Error('title and content required');
    const { error } = await supabase.from('resumes').insert({ title, content });
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 400 });
  }
}
