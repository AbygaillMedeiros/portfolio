'use client';

import { useEffect, useState } from 'react';
import { friendlyError } from '@/lib/admin';
import { getBrowserClient } from '@/lib/supabase/client';
import type { Message } from '@/lib/types';

export default function MensagensPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function load() {
    const { data, error } = await getBrowserClient()
      .from('messages')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) setError(friendlyError(error));
    setMessages((data as Message[]) ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function markRead(m: Message) {
    await getBrowserClient().from('messages').update({ read: !m.read }).eq('id', m.id);
    setMessages((list) => list.map((x) => (x.id === m.id ? { ...x, read: !x.read } : x)));
  }

  async function remove(m: Message) {
    if (!confirm(`Excluir a mensagem de ${m.name}? Isso não pode ser desfeito.`)) return;
    const { error } = await getBrowserClient().from('messages').delete().eq('id', m.id);
    if (error) return setError(friendlyError(error));
    setMessages((list) => list.filter((x) => x.id !== m.id));
  }

  const unread = messages.filter((m) => !m.read).length;

  return (
    <div>
      <h1 className="display-condensed text-5xl">Mensagens</h1>
      <p className="mt-3 text-muted">
        O que chega pelo formulário do site.{' '}
        {unread > 0 ? `${unread} não lida${unread > 1 ? 's' : ''}.` : ''}
      </p>

      {error && <p role="alert" className="mt-6 text-accent-ink">{error}</p>}
      {loading && <p className="mt-10 text-muted">Carregando…</p>}
      {!loading && messages.length === 0 && (
        <p className="mt-10 border border-dashed border-line p-8 text-muted">
          Nenhuma mensagem ainda. Quando alguém escrever pelo site, ela aparece aqui.
        </p>
      )}

      <ul className="mt-10 grid gap-4">
        {messages.map((m) => (
          <li key={m.id} className={`border p-6 ${m.read ? 'border-line' : 'border-ink'}`}>
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <p className="font-semibold">
                {!m.read && <span className="mr-2 inline-block h-2 w-2 bg-accent align-middle" aria-label="Não lida" />}
                {m.name}{' '}
                <a href={`mailto:${m.email}`} className="font-normal underline underline-offset-4">
                  {m.email}
                </a>
              </p>
              <p className="slug">{new Date(m.created_at).toLocaleString('pt-BR')}</p>
            </div>
            <p className="mt-4 whitespace-pre-line leading-relaxed">{m.message}</p>
            <div className="mt-5 flex flex-wrap gap-4 text-sm">
              <a href={`mailto:${m.email}?subject=${encodeURIComponent('Re: seu contato pelo portfólio')}`} className="underline underline-offset-4">
                Responder por e-mail
              </a>
              <button type="button" onClick={() => markRead(m)} className="underline underline-offset-4">
                {m.read ? 'Marcar como não lida' : 'Marcar como lida'}
              </button>
              <button type="button" onClick={() => remove(m)} className="underline underline-offset-4 text-accent-ink">
                Excluir
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
