import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-screen max-w-page flex-col justify-center px-4 sm:px-8">
      <p className="slug">Erro 404</p>
      <h1 className="display mt-4 text-[clamp(3rem,10vw,8rem)]">Fora da área de corte.</h1>
      <p className="mt-6 max-w-[44ch] text-lg text-muted">
        Esta página não existe ou foi removida.
      </p>
      <div className="mt-10">
        <Link href="/" className="btn btn-primary">
          Voltar para o início
        </Link>
      </div>
    </main>
  );
}
