export type ProjectType =
  | 'estamparia'
  | 'envelopamento'
  | 'impressos'
  | 'identidade'
  | 'peca';

export type ProjectImage = {
  id: string;
  project_id?: string;
  url: string;
  alt: string | null;
  caption: string | null;
  position: number;
};

export type Project = {
  id: string;
  slug: string;
  title: string;
  type: ProjectType;
  client: string | null;
  year: number | null;
  summary: string | null;
  description: string | null;
  challenge: string | null;
  decision: string | null;
  application: string | null;
  cover_url: string | null;
  external_url: string | null;
  is_authorial: boolean;
  published: boolean;
  position: number;
  created_at?: string;
  updated_at?: string;
  project_images?: ProjectImage[];
};

export type SiteSettings = {
  name: string;
  role_line: string;
  whatsapp: string | null;
  email: string | null;
  instagram: string | null;
  linkedin: string | null;
  behance: string | null;
  location: string | null;
  availability: string | null;
  photo_url: string | null;
};

export type Message = {
  id: string;
  name: string;
  email: string;
  message: string;
  read: boolean;
  created_at: string;
};
