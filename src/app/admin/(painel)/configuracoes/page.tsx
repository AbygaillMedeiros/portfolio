'use client';

import { useEffect, useState } from 'react';
import { initials } from '@/lib/site';
import { friendlyError, refreshSite, uploadImage } from '@/lib/admin';
import { defaultSettings } from '@/lib/site';
import { getBrowserClient } from '@/lib/supabase/client';
import type { SiteSettings } from '@/lib/types';
import { Logo } from '@/components/Marks';

const fields: { key: keyof SiteSettings; label: string; hint?: string; long?: boolean }[] = [
  { key: 'name', label: 'Seu nome', hint: 'Aparece na logo, no topo e no rodapé. As iniciais viram o monograma.' },
  { key: 'role_line', label: 'O que você faz (uma linha)', hint: 'Ex.: Design gráfico e aplicações visuais' },
  { key: 'whatsapp', label: 'WhatsApp', hint: 'Com DDI e DDD, ex.: 55 11 91234-5678' },
  { key: 'email', label: 'E-mail' },
  { key: 'instagram', label: 'Instagram', hint: '@usuario ou link completo' },
  { key: 'linkedin', label: 'LinkedIn', hint: 'usuario ou link completo' },
  { key: 'behance', label: 'Behance', hint: 'usuario ou link completo' },
  { key: 'location', label: 'Cidade / estado' },
  { key: 'availability', label: 'Disponibilidade', hint: 'Frase curta que aparece no topo e no contato.', long: true },
];

export default function ConfiguracoesPage() {
  const [form, setForm] = useState<SiteSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [notice, setNotice] = useState<{ type: 'ok' | 'error'; text: string } | null>(null);

  useEffect(() => {
    (async () => {
      const { data, error } = await getBrowserClient()
        .from('site_settings')
        .select('name, role_line, whatsapp, email, instagram, linkedin, behance, location, availability, photo_url')
        .eq('id', 1)
        .maybeSingle();
      if (error) setNotice({ type: 'error', text: friendlyError(error) });
      if (data) setForm({ ...defaultSettings, ...(data as SiteSettings) });
      setLoading(false);
    })();
  }, []);

  function set<K extends keyof SiteSettings>(key: K, value: SiteSettings[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function onPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setNotice(null);
    try {
      const url = await uploadImage(file, 'perfil');
      set('photo_url', url);
      setNotice({ type: 'ok', text: 'Foto enviada. Clique em "Salvar dados" para publicar.' });
    } catch (err) {
      setNotice({ type: 'error', text: friendlyError(err) });
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setNotice(null);
    const payload: Record<string, unknown> = { id: 1 };
    (Object.keys(form) as (keyof SiteSettings)[]).forEach((k) => {
      const v = form[k];
      payload[k] = typeof v === 'string' && v.trim() === '' ? null : v;
    });
    const { error } = await getBrowserClient().from('site_settings').upsert(payload);
    setSaving(false);
    if (error) {
      setNotice({ type: 'error', text: friendlyError(error) });
      return;
    }
    await refreshSite();
    setNotice({ type: 'ok', text: 'Dados salvos. O site já foi atualizado.' });
  }

  if (loading) return <p className="text-muted">Carregando…</p>;

  return (
    <form onSubmit={save} className="grid gap-12">
      <div>
        <h1 className="display-condensed text-5xl">Seus dados</h1>
        <p className="mt-3 max-w-prose text-muted">
          Nome, contatos e foto que aparecem no site. A logo é montada a partir do seu nome.
        </p>
      </div>

      <section className="grid gap-6 border border-line p-6 sm:grid-cols-[auto_1fr] sm:items-center">
        <div className="h-40 w-32 overflow-hidden bg-sheet">
          {form.photo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={form.photo_url} alt="Sua foto atual" className="h-full w-full object-cover" />
          ) : (
            <div className="hatch h-full w-full" />
          )}
        </div>
        <div>
          <h2 className="text-lg font-semibold">Foto</h2>
          <p className="mt-1 text-sm text-muted">
            Use uma imagem vertical ou quadrada, de preferência com pelo menos 800 px de largura.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <label className="btn btn-ghost cursor-pointer">
              {uploading ? 'Enviando…' : 'Trocar foto'}
              <input type="file" accept="image/*" className="sr-only" onChange={onPhoto} disabled={uploading} />
            </label>
            {form.photo_url && (
              <button type="button" className="btn btn-ghost" onClick={() => set('photo_url', null)}>
                Remover foto
              </button>
            )}
          </div>
        </div>
      </section>

      <section className="border border-line p-6">
        <h2 className="text-lg font-semibold">Prévia da logo</h2>
        <div className="mt-5 bg-sheet p-6">
          <Logo name={form.name || 'Seu Nome'} mono={initials(form.name || 'Seu Nome')} descriptor={form.role_line} size={48} />
        </div>
      </section>

      <section className="grid gap-7">
        {fields.map((f) => (
          <label key={f.key} className="grid gap-1">
            <span className="text-sm font-semibold">{f.label}</span>
            {f.long ? (
              <textarea
                rows={3}
                className="field resize-y"
                value={(form[f.key] as string) ?? ''}
                onChange={(e) => set(f.key, e.target.value as never)}
              />
            ) : (
              <input
                className="field"
                value={(form[f.key] as string) ?? ''}
                onChange={(e) => set(f.key, e.target.value as never)}
                required={f.key === 'name'}
              />
            )}
            {f.hint && <span className="text-xs text-muted">{f.hint}</span>}
          </label>
        ))}
      </section>

      <div className="sticky bottom-0 -mx-4 flex flex-wrap items-center gap-4 border-t border-line bg-paper px-4 py-4 sm:-mx-8 sm:px-8">
        <button type="submit" className="btn btn-primary" disabled={saving || uploading}>
          {saving ? 'Salvando…' : 'Salvar dados'}
        </button>
        {notice && (
          <p role={notice.type === 'error' ? 'alert' : 'status'} className={notice.type === 'error' ? 'text-sm text-accent-ink' : 'text-sm'}>
            {notice.text}
          </p>
        )}
      </div>
    </form>
  );
}
