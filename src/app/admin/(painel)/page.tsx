'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { friendlyError, refreshSite } from '@/lib/admin';
import { typeLabel } from '@/lib/site';
import { getBrowserClient } from '@/lib/supabase/client';
import type { Project } from '@/lib/types';

export default function ProjectsAdminPage() {
  const supabase = getBrowserClient();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('position', { ascending: true })
      .order('created_at', { ascending: false });
    if (error) setError(friendlyError(error));
    else setProjects((data ?? []) as Project[]);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    load();
  }, [load]);

  async function run(action: () => Promise<unknown>) {
    setBusy(true);
    setError('');
    try {
      await action();
      await load();
      await refreshSite();
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setBusy(false);
    }
  }

  function togglePublish(p: Project) {
    return run(async () => {
      const { error } = await supabase.from('projects').update({ published: !p.published }).eq('id', p.id);
      if (error) throw error;
    });
  }

  function move(index: number, dir: -1 | 1) {
    const target = index + dir;
    if (target < 0 || target >= projects.length) return;
    // Renumera tudo na nova ordem, evitando posições repetidas.
    const reordered = [...projects];
    [reordered[index], reordered[target]] = [reordered[target], reordered[index]];
    return run(async () => {
      for (let i = 0; i < reordered.length; i++) {
        if (reordered[i].position !== i + 1) {
          const { error } = await supabase.from('projects').update({ position: i + 1 }).eq('id', reordered[i].id);
          if (error) throw error;
        }
      }
    });
  }

  function remove(p: Project) {
    if (!window.confirm(`Excluir "${p.title}"? Isso não pode ser desfeito.`)) return;
    return run(async () => {
      const { error } = await supabase.from('projects').delete().eq('id', p.id);
      if (error) throw error;
    });
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="display-condensed text-5xl">Projetos</h1>
          <p className="mt-2 text-muted">A ordem desta lista é a ordem que aparece no site.</p>
        </div>
        <Link href="/admin/projetos/novo" className="btn btn-primary">
          Novo projeto
        </Link>
      </div>

      {error && (
        <p role="alert" className="mt-6 border-l-4 border-accent bg-sheet px-4 py-3 text-sm">
          {error}
        </p>
      )}

      {loading ? (
        <p className="mt-10 text-muted">Carregando…</p>
      ) : projects.length === 0 ? (
        <div className="mt-10 border border-dashed border-line p-10 text-center">
          <p className="text-lg">Nenhum projeto ainda.</p>
          <p className="mt-2 text-muted">Crie o primeiro para ele aparecer no site.</p>
        </div>
      ) : (
        <ul className={`mt-10 border-t border-line ${busy ? 'opacity-60' : ''}`}>
          {projects.map((p, i) => (
            <li key={p.id} className="flex flex-wrap items-center gap-4 border-b border-line py-4">
              <div className="flex flex-col">
                <button type="button" disabled={busy || i === 0} onClick={() => move(i, -1)} aria-label={`Subir ${p.title}`} className="px-2 text-lg leading-none disabled:opacity-25">
                  ↑
                </button>
                <button type="button" disabled={busy || i === projects.length - 1} onClick={() => move(i, 1)} aria-label={`Descer ${p.title}`} className="px-2 text-lg leading-none disabled:opacity-25">
                  ↓
                </button>
              </div>
              <div className="h-16 w-20 shrink-0 overflow-hidden bg-sheet">
                {p.cover_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.cover_url} alt="" className="h-full w-full object-cover" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">{p.title}</p>
                <p className="slug">
                  {typeLabel(p.type)}
                  {p.year ? ` / ${p.year}` : ''}
                </p>
              </div>
              <button
                type="button"
                disabled={busy}
                onClick={() => togglePublish(p)}
                className={`border px-3 py-1.5 text-xs font-semibold ${p.published ? 'border-ink bg-ink text-paper' : 'border-line text-muted'}`}
                title={p.published ? 'Clique para virar rascunho' : 'Clique para publicar'}
              >
                {p.published ? 'Publicado' : 'Rascunho'}
              </button>
              <Link href={`/admin/projetos/${p.id}`} className="text-sm underline underline-offset-4">
                Editar
              </Link>
              <button type="button" disabled={busy} onClick={() => remove(p)} className="text-sm text-accent-ink underline underline-offset-4">
                Excluir
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
