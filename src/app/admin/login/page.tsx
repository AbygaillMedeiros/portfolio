'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { TrimMarks } from '@/components/Marks';
import { hasSupabase } from '@/lib/supabase/env';
import { getBrowserClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setLoading(true);
    setError('');
    const { error } = await getBrowserClient().auth.signInWithPassword({
      email: String(form.get('email')),
      password: String(form.get('password')),
    });
    if (error) {
      setError('E-mail ou senha incorretos.');
      setLoading(false);
      return;
    }
    router.replace('/admin');
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="relative w-full max-w-sm border border-line bg-sheet p-8">
        <TrimMarks size={14} gap={5} />
        <h1 className="display-condensed text-4xl">Painel</h1>
        {!hasSupabase ? (
          <p className="mt-4 leading-relaxed text-muted">
            O Supabase ainda não foi conectado. Siga o passo 3 do guia (README) para cadastrar as
            variáveis na Vercel e depois volte aqui.
          </p>
        ) : (
          <form onSubmit={onSubmit} className="mt-8 grid gap-6">
            <label className="block">
              <span className="slug">E-mail</span>
              <input name="email" type="email" required autoComplete="email" className="field" />
            </label>
            <label className="block">
              <span className="slug">Senha</span>
              <input name="password" type="password" required autoComplete="current-password" className="field" />
            </label>
            {error && (
              <p role="alert" className="text-sm text-accent-ink">
                {error}
              </p>
            )}
            <button type="submit" disabled={loading} className="btn btn-primary justify-center disabled:opacity-60">
              {loading ? 'Entrando…' : 'Entrar'}
            </button>
          </form>
        )}
        <Link href="/" className="slug mt-8 inline-block hover:text-ink">
          ← Voltar para o site
        </Link>
      </div>
    </main>
  );
}
