import type { Metadata } from 'next';
import ContactSection from '@/components/ContactSection';
import ProjectCard from '@/components/ProjectCard';
import { getProjects, getSettings } from '@/lib/data';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Trabalhos',
  description: 'Estudos de aplicação em estamparia, envelopamento de veículos e comunicação visual.',
};

export default async function WorksPage() {
  const [projects, settings] = await Promise.all([getProjects(), getSettings()]);
  return (
    <>
      <section className="mx-auto max-w-page px-4 pb-24 pt-14 sm:px-8">
        <h1 className="display text-[clamp(3rem,9vw,7rem)]">Trabalhos</h1>
        <p className="mt-6 max-w-[56ch] text-lg leading-relaxed text-muted">
          Estudos autorais com marcas fictícias, do arquivo à aplicação.
        </p>
        <div className="mt-16 grid gap-x-8 gap-y-16 md:grid-cols-2">
          {projects.map((p, i) => (
            <ProjectCard key={p.id} project={p} index={i} />
          ))}
        </div>
      </section>
      <ContactSection settings={settings} />
    </>
  );
}
