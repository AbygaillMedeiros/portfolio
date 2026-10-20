import Footer from '@/components/Footer';
import Header from '@/components/Header';
import { getSettings } from '@/lib/data';
import { initials } from '@/lib/site';

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSettings();
  return (
    <>
      <Header name={settings.name} mono={initials(settings.name)} descriptor={settings.role_line} />
      <main id="conteudo">{children}</main>
      <Footer settings={settings} />
    </>
  );
}
