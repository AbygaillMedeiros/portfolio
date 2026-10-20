import AdminNav from '@/components/admin/AdminNav';

/*
 * TODO (futuro): gerador de propostas comerciais.
 * Entraria como uma nova seção deste painel, em /admin/propostas, reaproveitando:
 *  - este layout e a navegação (AdminNav),
 *  - o login e a proteção de rotas que já existem (src/middleware.ts),
 *  - os componentes visuais do site (Marks, ContactSection) para gerar a proposta
 *    como uma página pública em /propostas/[slug], com a identidade da marca.
 * Precisaria de uma tabela nova "proposals" no Supabase. Nada disso está implementado ainda.
 */
export default function PainelLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <AdminNav />
      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-8">{children}</main>
    </div>
  );
}
