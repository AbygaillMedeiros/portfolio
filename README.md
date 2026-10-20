# Portfólio de Abygaill Medeiros

Site e portfólio com painel para cadastrar projetos, trocar a foto e ler as mensagens do formulário, sem mexer em código.

## Como usar no dia a dia

- **Painel:** acesse `/admin` no endereço do site e entre com o seu e-mail e senha.
- **Projetos:** crie, edite, publique ou deixe como rascunho, mude a ordem com as setas ↑ ↓.
- **Seus dados:** nome (a logo usa as iniciais), WhatsApp, e-mail, redes e foto.
- **Mensagens:** o que chega pelo formulário do site.

Deixe marcado "Projeto autoral" nos estudos com marcas fictícias. O site mostra o aviso "Projeto autoral. Conceito não produzido."

## Mudar textos fixos da página inicial

Os textos de serviços, entregáveis, processo e "para quem é" ficam em `src/lib/content.ts`. Abra o arquivo aqui no GitHub, clique no lápis (Edit), altere o texto entre aspas e clique em **Commit changes**. A Vercel publica a nova versão sozinha em cerca de 2 minutos.

## Tecnologia

Next.js, Tailwind CSS, Supabase (banco, imagens e login) e Vercel (hospedagem).

- `supabase/migrations/0001_schema.sql`: tabelas, segurança (RLS) e bucket de imagens.
- `supabase/seed.sql`: quatro projetos de exemplo.
- Variáveis na Vercel: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_SITE_URL`.

O cadastro público de usuários deve ficar desativado no Supabase, para que só você entre no painel.
