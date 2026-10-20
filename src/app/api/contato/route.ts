import { NextResponse } from 'next/server';
import { hasSupabase } from '@/lib/supabase/env';
import { getPublicClient } from '@/lib/supabase/server';

/** Recebe o formulário de contato e salva na tabela messages. */
export async function POST(request: Request) {
  let body: Record<string, unknown> = {};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Dados inválidos.' }, { status: 400 });
  }

  // Robô preencheu o campo escondido: finge sucesso e descarta.
  if (typeof body.website === 'string' && body.website.trim() !== '') {
    return NextResponse.json({ ok: true });
  }

  const name = String(body.name ?? '').trim().slice(0, 120);
  const email = String(body.email ?? '').trim().slice(0, 200);
  const message = String(body.message ?? '').trim().slice(0, 4000);

  if (!name || !message) {
    return NextResponse.json({ error: 'Preencha nome e mensagem.' }, { status: 400 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Confira o e-mail.' }, { status: 400 });
  }
  if (!hasSupabase) {
    return NextResponse.json(
      { error: 'O formulário ainda não está conectado ao banco de dados.' },
      { status: 503 },
    );
  }

  const { error } = await getPublicClient().from('messages').insert({ name, email, message });
  if (error) {
    console.error('[contato]', error);
    return NextResponse.json({ error: 'Não foi possível enviar agora.' }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
