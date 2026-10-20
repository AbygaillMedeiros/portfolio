import type { ProjectType, SiteSettings } from './types';

/**
 * Valores padrão. Tudo aqui pode ser alterado depois pelo painel,
 * em /admin/configuracoes, sem mexer em código.
 */
export const defaultSettings: SiteSettings = {
  name: 'Abygaill Medeiros',
  role_line: 'Design gráfico e aplicações visuais',
  whatsapp: '5592991654126',
  email: 'bygamedeiros@gmail.com',
  instagram: null,
  linkedin: null,
  behance: null,
  location: 'Brasil',
  availability:
    'Aberto a novos projetos de criação e a oportunidades em empresas do setor gráfico.',
  photo_url: '/foto.jpg',
};

export const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
).replace(/\/$/, '');

/** Nome amigável de cada tipo de projeto. */
export const projectTypes: { value: ProjectType; label: string; full: boolean }[] = [
  { value: 'estamparia', label: 'Estamparia e sublimação', full: true },
  { value: 'envelopamento', label: 'Envelopamento de veículos', full: true },
  { value: 'impressos', label: 'Impressos e comunicação visual', full: true },
  { value: 'identidade', label: 'Identidade visual', full: true },
  { value: 'peca', label: 'Peça avulsa', full: false },
];

export function typeLabel(type: ProjectType) {
  return projectTypes.find((t) => t.value === type)?.label ?? type;
}

/** Monta o link do WhatsApp a partir do número salvo (aceita número ou link). */
export function whatsappLink(value: string | null | undefined) {
  if (!value) return null;
  if (value.startsWith('http')) return value;
  const digits = value.replace(/\D/g, '');
  if (!digits) return null;
  const text = encodeURIComponent('Olá! Vi seu portfólio e gostaria de conversar sobre um projeto.');
  return `https://wa.me/${digits}?text=${text}`;
}

export function socialLink(kind: 'instagram' | 'linkedin' | 'behance', value: string | null) {
  if (!value) return null;
  if (value.startsWith('http')) return value;
  const handle = value.replace(/^@/, '');
  if (kind === 'instagram') return `https://instagram.com/${handle}`;
  if (kind === 'linkedin') return `https://linkedin.com/in/${handle}`;
  return `https://behance.net/${handle}`;
}

export function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '·';
  const first = parts[0][0] ?? '';
  const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
  return (first + last).toUpperCase();
}
