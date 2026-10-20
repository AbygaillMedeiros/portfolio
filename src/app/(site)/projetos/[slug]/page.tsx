import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import ContactSection from '@/components/ContactSection';
import { TrimMarks } from '@/components/Marks';
import ProjectCard from '@/components/ProjectCard';
import { getProject, getProjects, getSettings, pickRelated } from '@/lib/data';
import { typeLabel } from '@/lib/site';

export const revalidate = 60;

type Params = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const projects = await getProjects();
  return projects.map((p) => ({ slug: p.slug }));
}

function isRaster(url: string | null | undefined) {
  return Boolean(url && /\.(png|jpe?g|webp)(\?|$)/i.test(url));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProject(slug);
  if (!project) return { title: 'Projeto não encontrado' };
  const description = project.summary ?? undefined;
  return {
    title: project.title,
    description,
    alternates: { canonical: `/projetos/${project.slug}` },
    openGraph: {
      title: project.title,
      description,
      ...(isRaster(project.cover_url) ? { images: [{ url: project.cover_url! }] } : {}),
    },
  };
}

export default async function ProjectPage({ params }: Params) {
  const { slug } = await params;
  const [project, all, settings] = await Promise.all([getProject(slug), getProjects(), getSettings()]);
  if (!project) notFound();

  const images =
    project.project_images && project.project_images.length > 0
      ? project.project_images
      : project.cover_url
        ? [{ id: 'cover', url: project.cover_url, alt: project.title, caption: null, position: 0 }]
        : [];
  const related = pickRelated(all, project);

  const caseSteps = [
    ['Desafio', project.challenge],
    ['Decisão criativa', project.decision],
    ['Aplicação final', project.application],
  ].filter(([, text]) => Boolean(text)) as [string, string][];

  const facts = [
    ['Cliente', project.client],
    ['Tipo', typeLabel(project.type)],
    ['Ano', project.year ? String(project.year) : null],
  ].filter(([, v]) => Boolean(v)) as [string, string][];

  return (
    <>
      <article className="mx-auto max-w-page px-4 pb-24 pt-10 sm:px-8 sm:pt-14">
        <Link href="/#trabalhos" className="slug hover:text-ink">
          ← Todos os trabalhos
        </Link>

        <div className="mt-8 grid gap-12 lg:grid-cols-12 lg:gap-10">
          {/* Informações (sticky no desktop, antes das imagens no celular) */}
          <aside className="lg:order-2 lg:col-span-4">
            <div className="lg:sticky lg:top-24">
              <h1 className="display text-[clamp(2.6rem,6vw,4.5rem)]">{project.title}</h1>
              {project.summary && (
                <p className="mt-6 text-lg leading-relaxed">{project.summary}</p>
              )}

              {project.is_authorial && (
                <p className="mt-6 inline-flex items-center gap-2 border border-line px-3 py-2 text-sm">
                  <span aria-hidden="true" className="hatch-accent inline-block h-3 w-3" />
                  Projeto autoral. Conceito não produzido.
                </p>
              )}

              {facts.length > 0 && (
                <dl className="mt-8 border-t border-line">
                  {facts.map(([k, v]) => (
                    <div key={k} className="flex justify-between gap-6 border-b border-line py-3 text-sm">
                      <dt className="text-muted">{k}</dt>
                      <dd className="text-right">{v}</dd>
                    </div>
                  ))}
                </dl>
              )}

              {project.description && (
                <p className="mt-8 leading-relaxed text-muted">{project.description}</p>
              )}

              {project.external_url && (
                <a
                  href={project.external_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-ghost mt-8"
                >
                  Ver projeto publicado
                </a>
              )}
            </div>
          </aside>

          {/* Coluna de imagens */}
          <div className="lg:order-1 lg:col-span-8">
            <div className="space-y-10">
              {images.map((img, i) => (
                <figure key={img.id}>
                  <div className="relative bg-sheet">
                    {i === 0 && <TrimMarks size={14} gap={5} />}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img.url}
                      alt={img.alt || project.title}
                      loading={i === 0 ? 'eager' : 'lazy'}
                      className="w-full"
                    />
                  </div>
                  {img.caption && <figcaption className="slug mt-3">{img.caption}</figcaption>}
                </figure>
              ))}
            </div>

            {caseSteps.length > 0 && (
              <section className="mt-16 border-t border-line pt-10" aria-label="Do desafio à aplicação">
                <ol className="grid gap-8 md:grid-cols-3">
                  {caseSteps.map(([title, text], i) => (
                    <li key={title}>
                      <p className="slug">{String(i + 1).padStart(2, '0')}</p>
                      <h2 className="mt-3 text-xl font-semibold">{title}</h2>
                      <p className="mt-3 leading-relaxed text-muted">{text}</p>
                    </li>
                  ))}
                </ol>
              </section>
            )}
          </div>
        </div>
      </article>

      {related.length > 0 && (
        <section className="border-t border-line bg-sheet">
          <div className="mx-auto max-w-page px-4 py-20 sm:px-8">
            <h2 className="display-condensed text-4xl sm:text-5xl">Outros projetos</h2>
            <div className="mt-12 grid gap-x-8 gap-y-14 md:grid-cols-3">
              {related.map((p) => (
                <ProjectCard key={p.id} project={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      <ContactSection settings={settings} />
    </>
  );
}
