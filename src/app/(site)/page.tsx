import Link from 'next/link';
import ContactSection from '@/components/ContactSection';
import { RegMark, TrimMarks } from '@/components/Marks';
import ProjectCard from '@/components/ProjectCard';
import { applications, audiences, deliverables, process, services } from '@/lib/content';
import { getProjects, getSettings } from '@/lib/data';
import { whatsappLink } from '@/lib/site';

export const revalidate = 60;

export default async function HomePage() {
  const [projects, settings] = await Promise.all([getProjects(), getSettings()]);
  const wa = whatsappLink(settings.whatsapp);
  const [featured, ...rest] = projects;
  const flat = projects[0]?.project_images?.[1]?.url;
  const applied = projects[0]?.project_images?.[0]?.url ?? projects[0]?.cover_url;

  return (
    <>
      {/* ATO 1 — A IDEIA ------------------------------------------------ */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-page px-4 pb-20 pt-14 sm:px-8 sm:pt-20 lg:pb-28">
          <div className="flex items-center justify-between gap-4">
            <p className="slug">Prova 01 / Formato livre / Grafite + laranja especial</p>
            <RegMark className="text-muted" />
          </div>

          {/* A "folha": headline dentro da área de corte */}
          <div className="relative mt-10 px-1 py-8 sm:px-6 sm:py-14">
            <TrimMarks />
            <h1 className="display text-[clamp(3.1rem,11.5vw,10.5rem)]">
              A arte não termina na tela.
            </h1>
          </div>

          {/* A linha laranja sai da folha e sangra para fora da página */}
          <div className="relative mt-10 h-0">
            <span
              aria-hidden="true"
              className="bleed-line absolute left-0 top-0 block h-[6px] bg-accent"
              style={{ width: 'calc(100vw)', marginRight: 'calc(50% - 50vw)' }}
            />
          </div>

          <div className="mt-14 grid gap-10 lg:grid-cols-12">
            <p className="text-2xl font-medium leading-snug sm:text-3xl lg:col-span-6">
              Ela veste, circula, comunica e ganha forma.
            </p>
            <div className="lg:col-span-5 lg:col-start-8">
              <p className="text-lg leading-relaxed text-muted">
                Há mais de 10 anos crio para o mercado gráfico: estamparia, sublimação total,
                envelopamento de veículos e comunicação visual. Criatividade com visão de produção.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="#trabalhos" className="btn btn-primary">
                  Ver trabalhos
                </Link>
                <a
                  href={wa ?? '#contato'}
                  target={wa ? '_blank' : undefined}
                  rel={wa ? 'noopener noreferrer' : undefined}
                  className="btn btn-ghost"
                >
                  Conversar sobre um projeto
                </a>
              </div>
              {settings.availability && <p className="slug mt-6">{settings.availability}</p>}
            </div>
          </div>
        </div>
      </section>

      {/* Faixa de aplicações */}
      <div className="overflow-hidden border-y border-line bg-sheet py-4" aria-label="Áreas de atuação">
        <div className="marquee-track flex w-max">
          {[0, 1].map((copy) => (
            <ul key={copy} className="flex shrink-0 items-center" aria-hidden={copy === 1}>
              {applications.map((item) => (
                <li key={item} className="flex items-center">
                  <span className="display-condensed whitespace-nowrap px-6 text-2xl sm:text-3xl">
                    {item}
                  </span>
                  <span className="inline-block h-3 w-3 rotate-45 bg-accent" aria-hidden="true" />
                </li>
              ))}
            </ul>
          ))}
        </div>
      </div>

      {/* O problema: do arquivo à peça --------------------------------- */}
      <section className="mx-auto max-w-page px-4 py-24 sm:px-8 lg:py-32">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <h2 className="display-condensed text-5xl sm:text-6xl">Na tela, tudo é possibilidade.</h2>
            <p className="mt-6 max-w-[40ch] text-lg leading-relaxed text-muted">
              Mas é fora dela que o design precisa funcionar. Em tecido, veículos, adesivos ou
              impressos, cada aplicação traz seus próprios desafios.
            </p>
          </div>
          {flat && applied && (
            <div className="grid gap-6 sm:grid-cols-2 lg:col-span-8">
              <figure>
                <div className="relative bg-sheet">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={flat} alt="Arte planificada no arquivo" className="aspect-[4/3] w-full object-cover" loading="lazy" />
                </div>
                <figcaption className="slug mt-3">No arquivo: a arte planificada, com medidas e cores.</figcaption>
              </figure>
              <figure className="relative">
                <span aria-hidden="true" className="absolute -left-6 top-1/3 hidden h-[3px] w-6 bg-accent sm:block" />
                <div className="bg-sheet">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={applied} alt="A mesma arte aplicada na peça" className="aspect-[4/3] w-full object-cover" loading="lazy" />
                </div>
                <figcaption className="slug mt-3">Na peça: a mesma arte aplicada.</figcaption>
              </figure>
            </div>
          )}
        </div>
      </section>

      {/* ATO 2 — A EXPERIÊNCIA ----------------------------------------- */}
      <section id="experiencia" className="border-t border-line">
        <div className="mx-auto grid max-w-page gap-14 px-4 py-24 sm:px-8 lg:grid-cols-12 lg:py-32">
          <div className="lg:col-span-4">
            {settings.photo_url && (
              <figure className="relative mx-auto max-w-[17rem] lg:mx-0">
                <TrimMarks size={14} gap={5} />
                <div className="relative overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={settings.photo_url}
                    alt={`Foto de ${settings.name}`}
                    className="aspect-[4/5] w-full object-cover grayscale contrast-[1.05]"
                  />
                  <span
                    aria-hidden="true"
                    className="hatch-accent absolute bottom-0 right-0 h-1/3 w-1/3"
                    style={{ clipPath: 'polygon(100% 0, 100% 100%, 0 100%)' }}
                  />
                </div>
                <figcaption className="slug mt-3">
                  {settings.name}
                  {settings.location ? ` / ${settings.location}` : ''}
                </figcaption>
              </figure>
            )}
          </div>

          <div className="lg:col-span-7 lg:col-start-6">
            <h2 className="display-condensed text-5xl sm:text-7xl">A experiência muda o olhar.</h2>
            <div className="mt-8 max-w-[60ch] space-y-5 text-lg leading-relaxed">
              <p>
                Há mais de 10 anos desenvolvo artes para o mercado gráfico, trabalhando com
                diferentes formatos, superfícies e aplicações.
              </p>
              <p className="text-muted">
                Hoje integro, de forma remota, o time de criação de uma gráfica em Massachusetts,
                nos Estados Unidos, desenvolvendo artes para impressão e comunicação visual a
                partir das demandas da equipe.
              </p>
              <p className="text-muted">
                Essa rotina me deu uma visão prática da criação: pensar no visual sem perder de
                vista onde ele vai ser aplicado.
              </p>
            </div>

            <dl className="mt-14 grid gap-px border border-line bg-line sm:grid-cols-3">
              {[
                ['10+ anos', 'criando para o mercado gráfico'],
                ['Massachusetts, EUA', 'atuação remota atual'],
                ['Do arquivo à peça', 'criação com visão de produção'],
              ].map(([term, desc]) => (
                <div key={term} className="bg-paper p-6">
                  <dt className="display-condensed text-3xl">{term}</dt>
                  <dd className="mt-2 text-sm text-muted">{desc}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* ATO 3 — A PROVA VISUAL ---------------------------------------- */}
      <section id="trabalhos" className="border-t border-line bg-sheet">
        <div className="mx-auto max-w-page px-4 py-24 sm:px-8 lg:py-32">
          <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
            <h2 className="display-condensed text-5xl sm:text-7xl lg:col-span-6">Estudos de aplicação</h2>
            <p className="max-w-[52ch] leading-relaxed text-muted lg:col-span-5 lg:col-start-8">
              Os trabalhos que faço para empresas são confidenciais. Estes são projetos autorais,
              com marcas fictícias, feitos para mostrar o caminho do arquivo até a aplicação.
            </p>
          </div>

          {projects.length === 0 ? (
            <p className="mt-16 text-muted">Os projetos aparecem aqui assim que forem publicados no painel.</p>
          ) : (
            <div className="mt-16 grid gap-x-8 gap-y-16 md:grid-cols-2">
              {featured && (
                <div className="md:col-span-2 lg:w-[75%]">
                  <ProjectCard project={featured} index={0} large />
                </div>
              )}
              {rest.slice(0, 4).map((p, i) => (
                <ProjectCard key={p.id} project={p} index={i + 1} />
              ))}
            </div>
          )}

          {projects.length > 5 && (
            <div className="mt-16">
              <Link href="/trabalhos" className="btn btn-ghost">
                Ver todos os trabalhos
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* ATO 4 — A CONEXÃO --------------------------------------------- */}
      <section className="border-t border-line">
        <div className="mx-auto grid max-w-page gap-12 px-4 py-24 sm:px-8 lg:grid-cols-12 lg:py-32">
          <h2 className="display-condensed text-5xl sm:text-6xl lg:col-span-4">O que eu crio</h2>
          <ul className="lg:col-span-8">
            {services.map((s) => (
              <li key={s.title} className="grid gap-2 border-t border-line py-7 last:border-b sm:grid-cols-[1fr_1.2fr] sm:gap-8">
                <h3 className="text-xl font-semibold">{s.title}</h3>
                <p className="leading-relaxed text-muted">{s.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="border-t border-line bg-sheet">
        <div className="mx-auto max-w-page px-4 py-24 sm:px-8 lg:py-32">
          <div className="max-w-2xl">
            <h2 className="display-condensed text-5xl sm:text-6xl">O que você recebe</h2>
            <p className="mt-6 text-lg leading-relaxed text-muted">
              Cada projeto fecha com arquivos prontos para seguir para a produção.
            </p>
          </div>
          <div className="mt-14 grid gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
            {deliverables.map((d, i) => (
              <article key={d.title} className="flex flex-col bg-paper p-6 sm:p-7">
                <span className="slug">/{String(i + 1).padStart(2, '0')}</span>
                <h3 className="mt-8 text-xl font-semibold leading-tight">{d.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{d.line}</p>
                <ul className="mt-6 space-y-2 border-t border-line pt-5 text-sm">
                  {d.items.map((item) => (
                    <li key={item} className="flex gap-3">
                      <span aria-hidden="true" className="mt-[0.45rem] h-1.5 w-1.5 shrink-0 bg-accent" />
                      {item}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="processo" className="border-t border-line">
        <div className="mx-auto max-w-page px-4 py-24 sm:px-8 lg:py-32">
          <div className="grid gap-8 lg:grid-cols-12">
            <h2 className="display-condensed text-5xl sm:text-7xl lg:col-span-7">
              Experiência não dispensa evolução.
            </h2>
            <p className="max-w-[46ch] text-lg leading-relaxed text-muted lg:col-span-4 lg:col-start-9">
              Novas ferramentas ampliam as possibilidades de explorar ideias. A experiência
              continua orientando as escolhas, do conceito à aplicação.
            </p>
          </div>

          <ol className="relative mt-16 grid gap-10 md:grid-cols-4 md:gap-6">
            <span aria-hidden="true" className="hatch absolute left-0 right-0 top-[1.05rem] hidden h-3 md:block" />
            {process.map((step, i) => (
              <li key={step.title} className="relative">
                <span className="relative z-10 inline-flex h-9 w-9 items-center justify-center bg-ink font-mono text-sm text-paper">
                  {i + 1}
                </span>
                <h3 className="mt-6 text-2xl font-semibold">{step.title}</h3>
                <p className="mt-3 max-w-[32ch] leading-relaxed text-muted">{step.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="border-t border-line">
        <div className="mx-auto grid max-w-page gap-12 px-4 py-24 sm:px-8 lg:grid-cols-12 lg:py-28">
          <h2 className="display-condensed text-5xl sm:text-6xl lg:col-span-4">Para quem é</h2>
          <div className="grid gap-10 sm:grid-cols-2 lg:col-span-8">
            {audiences.map((a) => (
              <div key={a.title} className="border-l-2 border-accent pl-6">
                <h3 className="text-xl font-semibold">{a.title}</h3>
                <p className="mt-3 leading-relaxed text-muted">{a.text}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-line">
          <ul className="mx-auto grid max-w-page px-4 sm:px-8 md:grid-cols-3">
            {[
              ['Repertório', 'Mais de uma década no mercado.'],
              ['Versatilidade', 'Diferentes formatos e aplicações.'],
              ['Evolução', 'Novas ferramentas a serviço da criação.'],
            ].map(([word, line]) => (
              <li key={word} className="border-b border-line py-10 last:border-b-0 md:border-b-0 md:border-r md:px-8 md:first:pl-0 md:last:border-r-0">
                <p className="display text-4xl sm:text-5xl">{word}</p>
                <p className="mt-3 text-muted">{line}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <ContactSection settings={settings} />
    </>
  );
}
