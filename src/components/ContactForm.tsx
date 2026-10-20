'use client';

import { useState } from 'react';

type Status = 'idle' | 'sending' | 'sent' | 'error';

export default function ContactForm() {
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState('');

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    setStatus('sending');
    setError('');
    try {
      const res = await fetch('/api/contato', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || 'Não foi possível enviar.');
      setStatus('sent');
      form.reset();
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Não foi possível enviar.');
    }
  }

  if (status === 'sent') {
    return (
      <div className="border border-current p-8" role="status">
        <p className="display-condensed text-4xl">Mensagem recebida.</p>
        <p className="mt-3 opacity-80">Respondo pelo e-mail que você informou.</p>
        <button type="button" className="mt-6 underline underline-offset-4" onClick={() => setStatus('idle')}>
          Enviar outra mensagem
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-6" noValidate={false}>
      {/* Campo-armadilha para robôs. Pessoas não veem. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>
          Não preencha
          <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <label className="grid gap-1">
        <span className="text-sm opacity-80">Nome</span>
        <input name="name" required maxLength={120} autoComplete="name" className="field" />
      </label>
      <label className="grid gap-1">
        <span className="text-sm opacity-80">E-mail</span>
        <input name="email" type="email" required maxLength={200} autoComplete="email" className="field" />
      </label>
      <label className="grid gap-1">
        <span className="text-sm opacity-80">Conte sobre o projeto ou a vaga</span>
        <textarea name="message" required rows={4} maxLength={4000} className="field resize-y" />
      </label>
      <div className="flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={status === 'sending'}
          className="btn border-current hover:bg-accent hover:border-accent hover:text-[#202020] disabled:opacity-60"
        >
          {status === 'sending' ? 'Enviando…' : 'Enviar mensagem'}
        </button>
        {status === 'error' && (
          <p role="alert" className="text-sm">
            {error} Tente de novo ou chame no WhatsApp.
          </p>
        )}
      </div>
    </form>
  );
}
