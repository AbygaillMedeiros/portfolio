-- Projetos de exemplo (estudos autorais com marcas fictícias).
-- Rode DEPOIS do arquivo migrations/0001_schema.sql.
-- Você pode editar ou apagar todos eles pelo painel depois.

update public.site_settings set photo_url = coalesce(photo_url, '/foto.jpg') where id = 1;

with p as (
  insert into public.projects (slug, title, type, client, year, summary, description, challenge, decision, application, cover_url, external_url, is_authorial, published, position)
  values (
    'volta-colecao-sublimacao-total',
    'Volta',
    'estamparia',
    'Marca fictícia de ciclismo',
    2026,
    'Coleção de camisas para sublimação total, com um grafismo que atravessa costuras sem perder o desenho.',
    'Volta é uma marca inventada para este estudo: um clube de ciclismo de estrada que queria uniformes reconhecíveis no pelotão. O conceito parte das linhas diagonais da estrada vista de cima, que se repetem em ritmos diferentes na frente, nas costas e nas mangas.',
    'Em sublimação total, a arte é impressa nas peças ainda planas e só depois costurada. Um grafismo bonito no arquivo pode se partir no ombro ou na lateral da camisa pronta.',
    'Desenhei as faixas a partir do molde, não do mockup. Cada diagonal foi alinhada nos pontos de encontro entre frente, costas e mangas, e a faixa amarela foi posicionada para continuar inteira de um painel ao outro.',
    'A prancha final traz os moldes planificados com a arte aplicada, as medidas e a paleta. A foto mostra como a peça se comporta já montada.',
    '/projects/volta-foto.jpg',
    null,
    true,
    true,
    1
  )
  on conflict (slug) do nothing
  returning id
)
insert into public.project_images (project_id, url, alt, caption, position)
select p.id, v.url, v.alt, v.caption, v.position from p, (values
  ('/projects/volta-foto.jpg', 'Camisas da coleção Volta, frente e costas', 'Frente e costas: a faixa amarela atravessa o peito e continua na manga.', 1),
  ('/projects/volta-prancha.jpg', 'Moldes planificados da camisa com a arte aplicada', 'Prancha de produção: frente, costas e mangas planificadas, com medidas e paleta.', 2)
) as v(url, alt, caption, position);

with p as (
  insert into public.projects (slug, title, type, client, year, summary, description, challenge, decision, application, cover_url, external_url, is_authorial, published, position)
  values (
    'rota-norte-envelopamento-de-frota',
    'Rota Norte',
    'envelopamento',
    'Empresa fictícia de entregas',
    2026,
    'Envelopamento para uma van de entregas que precisa ser lida em segundos, parada ou em movimento.',
    'Rota Norte é uma transportadora regional criada para este estudo. A frota é a maior mídia da empresa, então a van precisava comunicar nome, serviço e contato com clareza, em qualquer ângulo.',
    'Uma van tem portas, maçanetas, frisos e vidros que cortam a arte. O que funciona num retângulo plano pode ficar ilegível quando a porta lateral corre ou quando o carro está em movimento.',
    'Defini zonas de leitura antes de desenhar: o nome fica na área contínua da lateral, longe da porta corrediça; o contato vai na traseira, onde os carros de trás têm tempo de ler. A curva verde acompanha a linha da cintura do veículo.',
    'A van aplicada e a prancha técnica com sangria, linhas de corte e cores, mostrando por que cada elemento está onde está.',
    '/projects/rota-foto.jpg',
    null,
    true,
    true,
    2
  )
  on conflict (slug) do nothing
  returning id
)
insert into public.project_images (project_id, url, alt, caption, position)
select p.id, v.url, v.alt, v.caption, v.position from p, (values
  ('/projects/rota-foto.jpg', 'Van branca com envelopamento verde e mostarda da Rota Norte', 'Aplicação: o nome fica na área contínua da lateral, longe da porta corrediça.', 1),
  ('/projects/rota-prancha.jpg', 'Desenho técnico da van com áreas de sangria e linhas de corte', 'Prancha técnica: vista lateral, área de sangria, linha de corte e cores.', 2)
) as v(url, alt, caption, position);

with p as (
  insert into public.projects (slug, title, type, client, year, summary, description, challenge, decision, application, cover_url, external_url, is_authorial, published, position)
  values (
    'faisca-personalizacao-automotiva',
    'Faísca',
    'envelopamento',
    'Conceito autoral',
    2026,
    'Personalização automotiva em que o desenho do carro faz parte da composição.',
    'Faísca é um estudo livre de envelopamento esportivo. A ideia era criar movimento mesmo com o carro parado, usando linhas que nascem nas rodas e seguem o vinco da carroceria.',
    'Curvas acentuadas deformam grafismos retos. Uma faixa que parece reta no arquivo pode entortar quando passa pelo para-lama.',
    'Testei três caminhos antes de escolher. O escolhido usa diagonais que acompanham a linha da porta, para que a deformação natural da curva reforce a sensação de velocidade em vez de quebrá-la.',
    'Composição final em três quartos e a folha de estudos com as três alternativas exploradas.',
    '/projects/faisca-foto.jpg',
    null,
    true,
    true,
    3
  )
  on conflict (slug) do nothing
  returning id
)
insert into public.project_images (project_id, url, alt, caption, position)
select p.id, v.url, v.alt, v.caption, v.position from p, (values
  ('/projects/faisca-foto.jpg', 'Carro esportivo roxo com grafismo rosa e branco', 'Composição final: as diagonais nascem na roda traseira e sobem acompanhando a porta.', 1),
  ('/projects/faisca-estudos.jpg', 'Três alternativas de grafismo para o mesmo carro', 'Exploração: três caminhos testados. A opção A foi a escolhida.', 2)
) as v(url, alt, caption, position);

with p as (
  insert into public.projects (slug, title, type, client, year, summary, description, challenge, decision, application, cover_url, external_url, is_authorial, published, position)
  values (
    'feira-quintal-campanha-impressa',
    'Feira Quintal',
    'impressos',
    'Feira fictícia de produtores',
    2026,
    'Uma campanha com cartaz, banner e adesivos que fala a mesma língua em cada formato.',
    'Feira Quintal é uma feira de produtores locais inventada para este estudo. A campanha precisava funcionar colada num poste, de pé na entrada da feira e na mão de quem compra.',
    'Cada formato é lido de um jeito: o cartaz de passagem, o banner de longe, o adesivo de perto. Repetir o mesmo layout em tudo deixaria algum deles ruim.',
    'Mantive o sistema (o tomate-sol, as cores e a tipografia) e mudei a hierarquia em cada peça. No banner, marca grande para ler de longe; no cartaz, a informação completa; nos adesivos, o símbolo com o nome.',
    'Conjunto aplicado e a prancha com as peças planificadas e suas medidas.',
    '/projects/quintal-foto.jpg',
    null,
    true,
    true,
    4
  )
  on conflict (slug) do nothing
  returning id
)
insert into public.project_images (project_id, url, alt, caption, position)
select p.id, v.url, v.alt, v.caption, v.position from p, (values
  ('/projects/quintal-foto.jpg', 'Cartaz, banner e adesivos da Feira Quintal aplicados', 'A campanha aplicada: cartaz na parede, banner de pé e adesivos no caixote.', 1),
  ('/projects/quintal-prancha.jpg', 'Peças planificadas com medidas', 'Prancha com as peças planificadas: cartaz A2, banner 0,8 × 2 m e adesivo de 8 cm.', 2)
) as v(url, alt, caption, position);

