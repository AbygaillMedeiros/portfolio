import { demoProjects } from './demo';
import { defaultSettings } from './site';
import { hasSupabase } from './supabase/env';
import { getPublicClient } from './supabase/server';
import type { Project, SiteSettings } from './types';

const projectFields =
  'id, slug, title, type, client, year, summary, description, challenge, decision, application, cover_url, external_url, is_authorial, published, position, created_at, updated_at, project_images(id, url, alt, caption, position)';

function sortImages(p: Project): Project {
  return {
    ...p,
    project_images: [...(p.project_images ?? [])].sort((a, b) => a.position - b.position),
  };
}

/** Projetos publicados, na ordem definida no painel. */
export async function getProjects(): Promise<Project[]> {
  if (!hasSupabase) return demoProjects;
  try {
    const { data, error } = await getPublicClient()
      .from('projects')
      .select(projectFields)
      .eq('published', true)
      .order('position', { ascending: true })
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data as unknown as Project[]).map(sortImages);
  } catch (err) {
    console.error('[getProjects]', err);
    return [];
  }
}

export async function getProject(slug: string): Promise<Project | null> {
  if (!hasSupabase) return demoProjects.find((p) => p.slug === slug) ?? null;
  try {
    const { data, error } = await getPublicClient()
      .from('projects')
      .select(projectFields)
      .eq('slug', slug)
      .eq('published', true)
      .maybeSingle();
    if (error) throw error;
    return data ? sortImages(data as unknown as Project) : null;
  } catch (err) {
    console.error('[getProject]', err);
    return null;
  }
}

/** Até 3 recomendações: primeiro do mesmo tipo, depois os mais recentes. */
export function pickRelated(all: Project[], current: Project, count = 3) {
  const others = all.filter((p) => p.id !== current.id);
  const sameType = others.filter((p) => p.type === current.type);
  const rest = others
    .filter((p) => p.type !== current.type)
    .sort((a, b) => (b.created_at ?? '').localeCompare(a.created_at ?? ''));
  return [...sameType, ...rest].slice(0, count);
}

export async function getSettings(): Promise<SiteSettings> {
  if (!hasSupabase) return defaultSettings;
  try {
    const { data, error } = await getPublicClient()
      .from('site_settings')
      .select('name, role_line, whatsapp, email, instagram, linkedin, behance, location, availability, photo_url')
      .eq('id', 1)
      .maybeSingle();
    if (error) throw error;
    if (!data) return defaultSettings;
    const merged = { ...defaultSettings };
    (Object.keys(data) as (keyof SiteSettings)[]).forEach((key) => {
      const value = (data as SiteSettings)[key];
      if (value !== null && value !== '') (merged as Record<string, unknown>)[key] = value;
    });
    return merged;
  } catch (err) {
    console.error('[getSettings]', err);
    return defaultSettings;
  }
}
