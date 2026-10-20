'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { getBrowserClient } from '@/lib/supabase/client';

const links = [
  { href: '/admin', label: 'Projetos' },
  { href: '/admin/mensagens', label: 'Mensagens' },
  { href: '/admin/configuracoes', label: 'Seus dados' },
  // TODO (futuro): { href: '/admin/propostas', label: 'Propostas' },
];

export default function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();

  async function signOut() {
    await getBrowserClient().auth.signOut();
    router.replace('/admin/login');
    router.refresh();
  }

  return (
    <header className="border-b border-line bg-sheet">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-8">
        <nav aria-label="Painel" className="flex flex-wrap items-center gap-1">
          {links.map((l) => {
            const active = l.href === '/admin' ? pathname === '/admin' || pathname.startsWith('/admin/projetos') : pathname.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                aria-current={active ? 'page' : undefined}
                className={`px-3 py-2 text-sm ${active ? 'bg-ink text-paper' : 'hover:bg-paper'}`}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-4 text-sm">
          <Link href="/" target="_blank" className="underline underline-offset-4">
            Ver site
          </Link>
          <button type="button" onClick={signOut} className="underline underline-offset-4">
            Sair
          </button>
        </div>
      </div>
    </header>
  );
}
