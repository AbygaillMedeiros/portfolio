import Link from 'next/link';
import { typeLabel } from '@/lib/site';
import type { Project } from '@/lib/types';

/**
 * Card de projeto como uma prova de impressão: a imagem é a "folha"
 * e as informações ficam embaixo, como a legenda técnica fora do corte.
 */
export default function ProjectCard({
  project,
  index,
  large = false,
}: {
  project: Project;
  index?: number;
  large?: boolean;
}) {
  const cover = project.cover_url || project.project_images?.[0]?.url;
  return (
    <Link href={`/projetos/${project.slug}`} className="group block">
      <div className="relative overflow-hidden bg-sheet">
        <div className={large ? 'aspect-[4/3]' : 'aspect-[4/3]'}>
          {cover ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={cover}
              alt={project.title}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.025]"
            />
          ) : (
            <div className="hatch h-full w-full" />
          )}
        </div>
        {/* Faixa laranja que aparece ao passar o mouse: a "linha" da marca */}
        <span className="absolute bottom-0 left-0 h-1 w-full origin-left scale-x-0 bg-accent transition-transform duration-300 group-hover:scale-x-100" />
      </div>
      <div className="mt-4 flex items-start justify-between gap-4">
        <div>
          <h3 className={`display-condensed ${large ? 'text-4xl sm:text-5xl' : 'text-3xl'}`}>
            {project.title}
          </h3>
          {project.summary && (
            <p className="mt-2 max-w-[46ch] text-[0.95rem] leading-relaxed text-muted">
              {project.summary}
            </p>
          )}
        </div>
        {typeof index === 'number' && (
          <span className="slug pt-1">{String(index + 1).padStart(2, '0')}</span>
        )}
      </div>
      <p className="slug mt-3">
        {typeLabel(project.type)}
        {project.year ? ` / ${project.year}` : ''}
        {project.is_authorial ? ' / Estudo autoral' : ''}
      </p>
    </Link>
  );
}
