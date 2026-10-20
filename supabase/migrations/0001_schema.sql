-- ============================================================
-- Estrutura do banco do portfólio
-- Cole tudo no Supabase em: SQL Editor > New query > Run
-- Pode rodar de novo sem problema (é idempotente).
-- ============================================================

-- Tipos de projeto -------------------------------------------
do $$ begin
  create type project_type as enum ('estamparia', 'envelopamento', 'impressos', 'identidade', 'peca');
exception when duplicate_object then null; end $$;

-- Projetos ----------------------------------------------------
create table if not exists public.projects (
  id            uuid primary key default gen_random_uuid(),
  slug          text not null unique,
  title         text not null,
  type          project_type not null default 'estamparia',
  client        text,
  year          int,
  summary       text,
  description   text,
  challenge     text,
  decision      text,
  application   text,
  cover_url     text,
  external_url  text,
  is_authorial  boolean not null default true,
  published     boolean not null default false,
  position      int not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists projects_published_position_idx on public.projects (published, position);

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists projects_updated_at on public.projects;
create trigger projects_updated_at before update on public.projects
for each row execute function public.set_updated_at();

-- Imagens de cada projeto ------------------------------------
create table if not exists public.project_images (
  id          uuid primary key default gen_random_uuid(),
  project_id  uuid not null references public.projects(id) on delete cascade,
  url         text not null,
  alt         text,
  caption     text,
  position    int not null default 0,
  created_at  timestamptz not null default now()
);

create index if not exists project_images_project_idx on public.project_images (project_id, position);

-- Mensagens do formulário ------------------------------------
create table if not exists public.messages (
  id          uuid primary key default gen_random_uuid(),
  name        text not null check (char_length(name) between 1 and 120),
  email       text not null check (char_length(email) between 3 and 200),
  message     text not null check (char_length(message) between 1 and 4000),
  read        boolean not null default false,
  created_at  timestamptz not null default now()
);

-- Dados do site (uma única linha) ----------------------------
create table if not exists public.site_settings (
  id            int primary key default 1 check (id = 1),
  name          text not null default 'Abygaill Medeiros',
  role_line     text default 'Design gráfico e aplicações visuais',
  whatsapp      text,
  email         text,
  instagram     text,
  linkedin      text,
  behance       text,
  location      text,
  availability  text,
  photo_url     text,
  updated_at    timestamptz not null default now()
);

insert into public.site_settings (id, name, whatsapp, email, photo_url)
values (1, 'Abygaill Medeiros', '5592991654126', 'bygamedeiros@gmail.com', '/foto.jpg')
on conflict (id) do nothing;

-- ============================================================
-- Segurança (RLS)
-- Visitantes: leem só o que está publicado e podem enviar mensagem.
-- Você logada no painel: pode tudo.
-- ============================================================
alter table public.projects       enable row level security;
alter table public.project_images enable row level security;
alter table public.messages       enable row level security;
alter table public.site_settings  enable row level security;

drop policy if exists "Publico le projetos publicados" on public.projects;
create policy "Publico le projetos publicados" on public.projects
  for select to anon using (published = true);

drop policy if exists "Admin gerencia projetos" on public.projects;
create policy "Admin gerencia projetos" on public.projects
  for all to authenticated using (true) with check (true);

drop policy if exists "Publico le imagens de projetos publicados" on public.project_images;
create policy "Publico le imagens de projetos publicados" on public.project_images
  for select to anon using (
    exists (select 1 from public.projects p where p.id = project_id and p.published = true)
  );

drop policy if exists "Admin gerencia imagens" on public.project_images;
create policy "Admin gerencia imagens" on public.project_images
  for all to authenticated using (true) with check (true);

drop policy if exists "Qualquer pessoa envia mensagem" on public.messages;
create policy "Qualquer pessoa envia mensagem" on public.messages
  for insert to anon, authenticated with check (read = false);

drop policy if exists "Admin le mensagens" on public.messages;
create policy "Admin le mensagens" on public.messages
  for select to authenticated using (true);

drop policy if exists "Admin altera mensagens" on public.messages;
create policy "Admin altera mensagens" on public.messages
  for update to authenticated using (true) with check (true);

drop policy if exists "Admin apaga mensagens" on public.messages;
create policy "Admin apaga mensagens" on public.messages
  for delete to authenticated using (true);

drop policy if exists "Publico le dados do site" on public.site_settings;
create policy "Publico le dados do site" on public.site_settings
  for select to anon, authenticated using (true);

drop policy if exists "Admin altera dados do site" on public.site_settings;
create policy "Admin altera dados do site" on public.site_settings
  for all to authenticated using (true) with check (true);

-- ============================================================
-- Armazenamento das imagens (bucket "projects", leitura pública)
-- ============================================================
insert into storage.buckets (id, name, public)
values ('projects', 'projects', true)
on conflict (id) do update set public = true;

drop policy if exists "Publico ve imagens" on storage.objects;
create policy "Publico ve imagens" on storage.objects
  for select using (bucket_id = 'projects');

drop policy if exists "Admin envia imagens" on storage.objects;
create policy "Admin envia imagens" on storage.objects
  for insert to authenticated with check (bucket_id = 'projects');

drop policy if exists "Admin altera imagens" on storage.objects;
create policy "Admin altera imagens" on storage.objects
  for update to authenticated using (bucket_id = 'projects');

drop policy if exists "Admin apaga imagens" on storage.objects;
create policy "Admin apaga imagens" on storage.objects
  for delete to authenticated using (bucket_id = 'projects');
