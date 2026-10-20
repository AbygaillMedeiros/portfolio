import Link from 'next/link';
import type { SiteSettings } from '@/lib/types';
import { RegMark } from './Marks';

export default function Footer({ settings }: { settings: SiteSettings }) {
  const year = new Date().getFullYear();
  return (
    <footer className="bg-inverse text-inverse-ink">
      <div className="mx-auto flex max-w-page flex-col gap-6 px-4 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <div className="flex items-center gap-3">
          <RegMark size={18} />
          <p className="text-sm">
            © {year} {settings.name}. {settings.role_line}.
          </p>
        </div>
        <p className="slug" style={{ color: 'inherit', opacity: 0.7 }}>
          Projetos marcados como autorais são estudos com marcas fictícias.{' '}
          <Link href="/admin" className="underline underline-offset-4">
            Painel
          </Link>
        </p>
      </div>
    </footer>
  );
}
