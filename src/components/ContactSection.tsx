import { socialLink, whatsappLink } from '@/lib/site';
import type { SiteSettings } from '@/lib/types';
import ContactForm from './ContactForm';
import { RegMark } from './Marks';

/** Encerramento: a mesma linha laranja do topo volta aqui, fechando a história. */
export default function ContactSection({ settings }: { settings: SiteSettings }) {
  const wa = whatsappLink(settings.whatsapp);
  const socials = [
    { label: 'Instagram', href: socialLink('instagram', settings.instagram) },
    { label: 'LinkedIn', href: socialLink('linkedin', settings.linkedin) },
    { label: 'Behance', href: socialLink('behance', settings.behance) },
  ].filter((s) => s.href);

  return (
    <section id="contato" className="relative scroll-mt-16 overflow-hidden bg-inverse text-inverse-ink">
      <div aria-hidden="true" className="h-1.5 w-full bg-accent" />
      <div className="mx-auto grid max-w-page gap-16 px-4 py-20 sm:px-8 md:py-28 lg:grid-cols-12">
        <div className="lg:col-span-6">
          <h2 className="display text-[clamp(2.6rem,7vw,5.6rem)]">
            A próxima ideia pode sair daqui.
          </h2>
          <p className="mt-8 max-w-[44ch] text-lg leading-relaxed opacity-85">
            Se a sua empresa precisa de apoio criativo, ou se você procura alguém com experiência
            no mercado gráfico, vamos conversar.
          </p>

          <dl className="mt-10 grid max-w-md gap-5 text-[0.95rem]">
            <div className="grid grid-cols-[7.5rem_1fr] gap-3 border-t border-current/20 pt-4" style={{ borderColor: 'color-mix(in srgb, currentColor 22%, transparent)' }}>
              <dt className="opacity-70">Para empresas</dt>
              <dd>Oportunidades profissionais e colaboração criativa.</dd>
            </div>
            <div className="grid grid-cols-[7.5rem_1fr] gap-3 border-t pt-4" style={{ borderColor: 'color-mix(in srgb, currentColor 22%, transparent)' }}>
              <dt className="opacity-70">Para negócios</dt>
              <dd>Criação gráfica, estamparia e comunicação visual.</dd>
            </div>
          </dl>

          <div className="mt-10 flex flex-wrap gap-3">
            {wa && (
              <a
                href={wa}
                target="_blank"
                rel="noopener noreferrer"
                className="btn border-accent bg-accent text-[#202020] hover:bg-transparent hover:text-inherit"
              >
                Chamar no WhatsApp
              </a>
            )}
            {settings.email && (
              <a href={`mailto:${settings.email}`} className="btn border-current hover:bg-inverse-ink hover:text-inverse">
                {settings.email}
              </a>
            )}
          </div>

          {socials.length > 0 && (
            <ul className="mt-8 flex flex-wrap gap-6 text-sm">
              {socials.map((s) => (
                <li key={s.label}>
                  <a href={s.href!} target="_blank" rel="noopener noreferrer" className="underline decoration-accent decoration-2 underline-offset-4 hover:opacity-80">
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          )}

          {settings.availability && (
            <p className="mt-10 max-w-[48ch] text-sm opacity-70">{settings.availability}</p>
          )}
        </div>

        <div className="lg:col-span-5 lg:col-start-8">
          <p className="mb-8 flex items-center gap-3 text-sm opacity-80">
            <RegMark size={16} /> Prefere escrever? Deixe uma mensagem.
          </p>
          <ContactForm />
        </div>
      </div>
    </section>
  );
}
