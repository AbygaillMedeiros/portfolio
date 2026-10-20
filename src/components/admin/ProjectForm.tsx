'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
import { friendlyError, refreshSite, slugify, uploadImage } from '@/lib/admin';
import { projectTypes } from '@/lib/site';
import { getBrowserClient } from '@/lib/supabase/client';
import type { Project, ProjectType } from '@/lib/types';

type DraftImage = { key: string; url: string; alt: string; caption: string };

let keySeed = 0;
const newKey = () => `img-${Date.now()}-${keySeed++}`;

export default function ProjectForm({ initial }: { initial: Project | null }) {
  const router = useRouter();
  const supabase = getBrowserClient();
  const fileInput = useRef<HTMLInputElement>(null);

  const [type, setType] = useState<ProjectType>(initial?.type ?? 'estamparia');
  const [title, setTitle] = useState(initial?.title ?? '');
  const [slug, setSlug] = useState(initial?.slug ?? '');
  const [slugTouched, setSlugTouched] = useState(Boolean(initial));
  const [client, setClient] = useState(initial?.client ?? '');
  const [year, setYear] = useState(initial?.year ? String(initial.year) : String(new Date().getFullYear()));
  const [summary, setSummary] = useState(initial?.summary ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [challenge, setChallenge] = useState(initial?.challenge ?? '');
  const [decision, setDecision] = useState(initial?.decision ?? '');
  const [application, setApplication] = useState(initial?.application ?? '');
  const [externalUrl, setExternalUrl] = useState(initial?.external_url ?? '');
  const [isAuthorial, setIsAuthorial] = useState(initial?.is_authorial ?? true);
  const [published, setPublished] = useState(initial?.published ?? false);
  const [images, setImages] = useState<DraftImage[]>(() => {
    const list = [...(initial?.project_images ?? [])].sort((a, b) => a.position - b.position);
    if (list.length === 0 && initial?.cover_url) {
      return [{ key: newKey(), url: initial.cover_url, alt: initial.title, caption: '' }];
    }
    return list.map((img) => ({ key: newKey(), url: img.url, alt: img.alt ?? '', caption: img.caption ?? '' }));
  });

  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  const full = projectTypes.find((t) => t.value === type)?.full ?? true;

  function onTitle(value: string) {
    setTitle(value);
    if (!slugTouched) setSlug(slugify(value));
  }

  async function onFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    setError('');
    try {
      const list = full ? Array.from(files) : [files[0]];
      const uploaded: DraftImage[] = [];
      for (const file of list) {
        if (file.size > 15 * 1024 * 1024) throw new Error(`"${file.name}" passa de 15 MB. Exporte uma versão menor.`);
        const url = await uploadImage(file, 'projetos');
        uploaded.push({ key: newKey(), url, alt: title, caption: '' });
      }
      setImages((prev) => (full ? [...prev, ...uploaded] : uploaded));
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setUploading(false);
      if (fileInput.current) fileInput.current.value = '';
    }
  }

  function updateImage(key: string, patch: Partial<DraftImage>) {
    setImages((prev) => prev.map((img) => (img.key === key ? { ...img, ...patch } : img)));
  }
  function moveImage(index: number, dir: -1 | 1) {
    setImages((prev) => {
      const next = [...prev];
      const t = index + dir;
      if (t < 0 || t >= next.length) return prev;
      [next[index], next[t]] = [next[t], next[index]];
      return next;
    });
  }
  function removeImage(key: string) {
    setImages((prev) => prev.filter((img) => img.key !== key));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSaved(false);
    const finalSlug = slugify(slug || title);
    if (!title.trim()) return setError('Dê um título ao projeto.');
    if (!finalSlug) return setError('O endereço (slug) não pode ficar vazio.');
    if (images.length === 0) return setError('Envie pelo menos uma imagem.');

    setSaving(true);
    try {
      const usedImages = full ? images : images.slice(0, 1);
      const payload = {
        slug: finalSlug,
        title: title.trim(),
        type,
        client: client.trim() || null,
        year: year ? Number(year) : null,
        summary: summary.trim() || null,
        description: full ? description.trim() || null : null,
        challenge: full ? challenge.trim() || null : null,
        decision: full ? decision.trim() || null : null,
        application: full ? application.trim() || null : null,
        external_url: externalUrl.trim() || null,
        cover_url: usedImages[0]?.url ?? null,
        is_authorial: isAuthorial,
        published,
      };

      let id = initial?.id;
      if (id) {
        const { error } = await supabase.from('projects').update(payload).eq('id', id);
        if (error) throw error;
      } else {
        // Novo projeto entra no fim da lista.
        const { data: last } = await supabase
          .from('projects')
          .select('position')
          .order('position', { ascending: false })
          .limit(1)
          .maybeSingle();
        const position = ((last as { position?: number } | null)?.position ?? 0) + 1;
        const { data, error } = await supabase
          .from('projects')
          .insert({ ...payload, position })
          .select('id')
          .single();
        if (error) throw error;
        id = (data as { id: string }).id;
      }

      // Regrava a lista de imagens na ordem atual.
      const { error: delError } = await supabase.from('project_images').delete().eq('project_id', id);
      if (delError) throw delError;
      const rows = usedImages.map((img, i) => ({
        project_id: id,
        url: img.url,
        alt: img.alt.trim() || title.trim(),
        caption: img.caption.trim() || null,
        position: i + 1,
      }));
      if (rows.length) {
        const { error: insError } = await supabase.from('project_images').insert(rows);
        if (insError) throw insError;
      }

      await refreshSite();
      setSaved(true);
      if (!initial) {
        router.replace(`/admin/projetos/${id}`);
      } else {
        router.refresh();
      }
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-12">
      <fieldset className="grid gap-6">
        <legend className="mb-4 text-xl font-semibold">Tipo de projeto</legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {projectTypes.map((t) => (
            <label
              key={t.value}
              className={`flex cursor-pointer items-start gap-3 border p-4 ${type === t.value ? 'border-ink bg-sheet' : 'border-line'}`}
            >
              <input
                type="radio"
                name="type"
                value={t.value}
                checked={type === t.value}
                onChange={() => setType(t.value)}
                className="mt-1 accent-[#E66A3C]"
              />
              <span>
                <span className="block font-semibold">{t.label}</span>
                <span className="text-sm text-muted">
                  {t.full ? 'Estudo completo: várias imagens e o caso (desafio, decisão, aplicação).' : 'Fluxo rápido: uma imagem e um resumo.'}
                </span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="grid gap-6">
        <legend className="mb-4 text-xl font-semibold">Informações</legend>
        <Field label="Título" hint="Ex.: Volta">
          <input value={title} onChange={(e) => onTitle(e.target.value)} required className="field" />
        </Field>
        <Field label="Endereço da página" hint={`O link fica: /projetos/${slugify(slug || title) || '...'}`}>
          <input
            value={slug}
            onChange={(e) => {
              setSlug(e.target.value);
              setSlugTouched(true);
            }}
            className="field font-mono text-sm"
          />
        </Field>
        <div className="grid gap-6 sm:grid-cols-2">
          <Field label="Cliente ou marca" hint="Ex.: Marca fictícia de ciclismo">
            <input value={client} onChange={(e) => setClient(e.target.value)} className="field" />
          </Field>
          <Field label="Ano">
            <input value={year} onChange={(e) => setYear(e.target.value.replace(/\D/g, '').slice(0, 4))} inputMode="numeric" className="field" />
          </Field>
        </div>
        <Field label="Resumo" hint="Uma ou duas frases. Aparece no card e no topo da página.">
          <textarea value={summary} onChange={(e) => setSummary(e.target.value)} rows={2} maxLength={280} className="field" />
        </Field>
        {full && (
          <>
            <Field label="Contexto" hint="Sobre o projeto, a marca ou a ideia.">
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} className="field" />
            </Field>
            <div className="grid gap-6 border-l-2 border-accent pl-5">
              <p className="text-sm text-muted">O caso aparece no fim da página, em três partes.</p>
              <Field label="Desafio">
                <textarea value={challenge} onChange={(e) => setChallenge(e.target.value)} rows={3} className="field" />
              </Field>
              <Field label="Decisão criativa">
                <textarea value={decision} onChange={(e) => setDecision(e.target.value)} rows={3} className="field" />
              </Field>
              <Field label="Aplicação final">
                <textarea value={application} onChange={(e) => setApplication(e.target.value)} rows={3} className="field" />
              </Field>
            </div>
          </>
        )}
        <Field label="Link externo (opcional)" hint="Behance, Instagram ou outro lugar onde o projeto está publicado.">
          <input value={externalUrl} onChange={(e) => setExternalUrl(e.target.value)} type="url" placeholder="https://" className="field" />
        </Field>
      </fieldset>

      <fieldset>
        <legend className="mb-2 text-xl font-semibold">{full ? 'Imagens' : 'Imagem'}</legend>
        <p className="mb-6 text-sm text-muted">
          {full
            ? 'A primeira imagem é a capa. Use as setas para mudar a ordem. JPG, PNG ou WebP, até 15 MB cada.'
            : 'Envie a imagem completa da peça (por exemplo, o PNG da arte inteira). Ela também será a capa.'}
        </p>

        {images.length > 0 && (
          <ul className="mb-6 grid gap-4">
            {(full ? images : images.slice(0, 1)).map((img, i) => (
              <li key={img.key} className="flex flex-wrap gap-4 border border-line p-3">
                <div className="relative h-28 w-36 shrink-0 overflow-hidden bg-sheet">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.url} alt="" className="h-full w-full object-cover" />
                  {i === 0 && <span className="absolute left-0 top-0 bg-accent px-2 py-0.5 text-xs font-semibold text-[#202020]">Capa</span>}
                </div>
                <div className="grid min-w-[14rem] flex-1 gap-3">
                  <input
                    value={img.alt}
                    onChange={(e) => updateImage(img.key, { alt: e.target.value })}
                    placeholder="Descrição da imagem (para acessibilidade)"
                    className="field py-1.5 text-sm"
                  />
                  <input
                    value={img.caption}
                    onChange={(e) => updateImage(img.key, { caption: e.target.value })}
                    placeholder="Legenda (opcional)"
                    className="field py-1.5 text-sm"
                  />
                </div>
                <div className="flex items-start gap-2 text-sm">
                  {full && (
                    <>
                      <button type="button" onClick={() => moveImage(i, -1)} disabled={i === 0} className="border border-line px-2 py-1 disabled:opacity-30" aria-label="Mover para cima">
                        ↑
                      </button>
                      <button type="button" onClick={() => moveImage(i, 1)} disabled={i === images.length - 1} className="border border-line px-2 py-1 disabled:opacity-30" aria-label="Mover para baixo">
                        ↓
                      </button>
                    </>
                  )}
                  <button type="button" onClick={() => removeImage(img.key)} className="border border-line px-2 py-1 text-accent-ink">
                    Remover
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}

        <label className={`flex cursor-pointer flex-col items-center justify-center gap-2 border-2 border-dashed border-line px-6 py-10 text-center hover:border-ink ${uploading ? 'opacity-60' : ''}`}>
          <span className="font-semibold">
            {uploading ? 'Enviando…' : full ? 'Adicionar imagens' : images.length ? 'Trocar imagem' : 'Escolher imagem'}
          </span>
          <span className="text-sm text-muted">Clique para escolher no computador ou celular</span>
          <input
            ref={fileInput}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/svg+xml"
            multiple={full}
            disabled={uploading}
            onChange={(e) => onFiles(e.target.files)}
            className="sr-only"
          />
        </label>
      </fieldset>

      <fieldset className="grid gap-4">
        <legend className="mb-4 text-xl font-semibold">Publicação</legend>
        <label className="flex items-start gap-3">
          <input type="checkbox" checked={isAuthorial} onChange={(e) => setIsAuthorial(e.target.checked)} className="mt-1 h-4 w-4 accent-[#E66A3C]" />
          <span>
            <span className="font-semibold">Projeto autoral</span>
            <span className="block text-sm text-muted">Mostra o aviso “Projeto autoral. Conceito não produzido.” na página.</span>
          </span>
        </label>
        <label className="flex items-start gap-3">
          <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} className="mt-1 h-4 w-4 accent-[#E66A3C]" />
          <span>
            <span className="font-semibold">Publicado</span>
            <span className="block text-sm text-muted">Desmarcado, o projeto fica como rascunho e só você vê.</span>
          </span>
        </label>
      </fieldset>

      {error && (
        <p role="alert" className="border-l-4 border-accent bg-sheet px-4 py-3 text-sm">
          {error}
        </p>
      )}
      {saved && !error && (
        <p role="status" className="border-l-4 border-ink bg-sheet px-4 py-3 text-sm">
          Projeto salvo.{published ? ' Já está no site.' : ' Ainda está como rascunho.'}
        </p>
      )}

      <div className="sticky bottom-0 -mx-4 flex flex-wrap items-center gap-3 border-t border-line bg-paper px-4 py-4">
        <button type="submit" disabled={saving || uploading} className="btn btn-primary disabled:opacity-60">
          {saving ? 'Salvando…' : 'Salvar projeto'}
        </button>
        <Link href="/admin" className="btn btn-ghost">
          Voltar
        </Link>
        {initial?.slug && initial.published && (
          <Link href={`/projetos/${initial.slug}`} target="_blank" className="ml-auto text-sm underline underline-offset-4">
            Ver no site
          </Link>
        )}
      </div>
    </form>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-sm font-semibold">{label}</span>
      {children}
      {hint && <span className="slug mt-1 block">{hint}</span>}
    </label>
  );
}
