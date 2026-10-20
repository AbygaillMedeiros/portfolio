'use client';

import { getBrowserClient } from './supabase/client';

export const BUCKET = 'projects';

/** Transforma "Coleção Volta 2026" em "colecao-volta-2026". */
export function slugify(text: string) {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

/** Envia uma imagem para o Storage e devolve o link público. */
export async function uploadImage(file: File, folder: string) {
  const supabase = getBrowserClient();
  const ext = (file.name.split('.').pop() || 'png').toLowerCase().replace(/[^a-z0-9]/g, '');
  const base = slugify(file.name.replace(/\.[^.]+$/, '')) || 'imagem';
  const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 7)}-${base}.${ext}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: '31536000',
    upsert: false,
    contentType: file.type || undefined,
  });
  if (error) throw new Error(`Falha no envio de "${file.name}": ${error.message}`);
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

/** Pede para o site público atualizar na hora (sem esperar o cache). */
export async function refreshSite() {
  try {
    await fetch('/api/revalidate', { method: 'POST' });
  } catch {
    /* o site atualiza sozinho em até 1 minuto */
  }
}

export function friendlyError(err: unknown) {
  const msg = err instanceof Error ? err.message : String((err as { message?: string })?.message ?? err);
  if (/duplicate key.*slug/i.test(msg)) return 'Já existe um projeto com esse endereço (slug). Escolha outro.';
  if (/JWT|not authenticated|auth/i.test(msg)) return 'Sua sessão expirou. Entre de novo no painel.';
  return msg;
}
