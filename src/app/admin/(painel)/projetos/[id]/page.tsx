'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import ProjectForm from '@/components/admin/ProjectForm';
import { getBrowserClient } from '@/lib/supabase/client';
import type { Project } from '@/lib/types';

export default function EditProjectPage() {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [state, setState] = useState<'loading' | 'ready' | 'missing'>('loading');

  useEffect(() => {
    let active = true;
    getBrowserClient()
      .from('projects')
      .select('*, project_images(id, url, alt, caption, position)')
      .eq('id', id)
      .maybeSingle()
      .then(({ data }) => {
        if (!active) return;
        if (data) {
          setProject(data as Project);
          setState('ready');
        } else {
          setState('missing');
        }
      });
    return () => {
      active = false;
    };
  }, [id]);

  if (state === 'loading') return <p className="text-muted">Carregando…</p>;
  if (state === 'missing')
    return (
      <div>
        <p>Projeto não encontrado. Ele pode ter sido excluído.</p>
        <Link href="/admin" className="btn btn-ghost mt-6">
          Voltar para a lista
        </Link>
      </div>
    );

  return (
    <div>
      <h1 className="display-condensed mb-10 text-5xl">Editar: {project!.title}</h1>
      <ProjectForm key={project!.updated_at ?? project!.id} initial={project} />
    </div>
  );
}
