'use client';

import Link from 'next/link';
import { useState } from 'react';
import ThemeToggle from './ThemeToggle';
import { Logo } from './Marks';

const nav = [
  { href: '/#trabalhos', label: 'Trabalhos' },
  { href: '/#experiencia', label: 'Experiência' },
  { href: '/#processo', label: 'Processo' },
  { href: '/#contato', label: 'Contato' },
];

export default function Header({
  name,
  mono,
  descriptor,
}: {
  name: string;
  mono: string;
  descriptor?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-line backdrop-blur-sm" style={{ backgroundColor: 'color-mix(in srgb, var(--paper) 92%, transparent)' }}>
      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:bg-ink focus:px-4 focus:py-2 focus:text-paper"
      >
        Pular para o conteúdo
      </a>
      <div className="mx-auto flex h-16 max-w-page items-center justify-between gap-4 px-4 sm:px-8">
        <Link href="/" className="flex items-center gap-3" onClick={() => setOpen(false)}>
          <Logo name={name} mono={mono} descriptor={descriptor} size={36} />
        </Link>

        <nav aria-label="Principal" className="hidden items-center gap-8 md:flex">
          {nav.map((item) => (
            <Link key={item.href} href={item.href} className="text-sm hover:text-accent-ink">
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            type="button"
            className="inline-flex h-10 items-center border border-line px-3 text-sm hover:border-ink md:hidden"
            aria-expanded={open}
            aria-controls="menu-mobile"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? 'Fechar' : 'Menu'}
          </button>
        </div>
      </div>

      {open && (
        <nav id="menu-mobile" aria-label="Menu" className="border-t border-line md:hidden">
          <ul className="mx-auto max-w-page px-4 py-2">
            {nav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="display-condensed block border-b border-line py-4 text-3xl last:border-0"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}
