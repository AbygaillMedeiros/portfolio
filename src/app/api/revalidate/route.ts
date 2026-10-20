import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';
import { hasSupabase } from '@/lib/supabase/env';
import { getSessionClient } from '@/lib/supabase/server';

/** Chamado pelo painel depois de salvar, para o site mostrar a mudança na hora. */
export async function POST() {
  if (!hasSupabase) return NextResponse.json({ ok: false }, { status: 503 });
  const supabase = await getSessionClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ ok: false }, { status: 401 });
  revalidatePath('/', 'layout');
  return NextResponse.json({ ok: true });
}
