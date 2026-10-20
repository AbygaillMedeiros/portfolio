import type { Project } from './types';

/**
 * Projetos de demonstração. Aparecem enquanto o Supabase não está conectado
 * e servem de modelo para o seed do banco (supabase/seed.sql).
 * Todos são estudos autorais com marcas fictícias.
 */
export const demoProjects: Project[] = [
  {
    id: 'demo-1',
    slug: 'volta-colecao-sublimacao-total',
    title: 'Volta',
    type: 'estamparia',
    client: 'Marca fictícia de ciclismo',
    year: 2026,
    summary: 'Coleção de camisas para sublimação total, com um grafismo que atravessa costuras sem perder o desenho.',
    description:
      'Volta é uma marca inventada para este estudo: um clube de ciclismo de estrada que queria uniformes reconhecíveis no pelotão. O conceito parte das linhas diagonais da estrada vista de cima, que se repetem em ritmos diferentes na frente, nas costas e nas mangas.',
    challenge:
      'Em sublimação total, a arte é impressa nas peças ainda planas e só depois costurada. Um grafismo bonito no arquivo pode se partir no ombro ou na lateral da camisa pronta.',
    decision:
      'Desenhei as faixas a partir do molde, não do mockup. Cada diagonal foi alinhada nos pontos de encontro entre frente, costas e mangas, e a faixa amarela foi posicionada para continuar inteira de um painel ao outro.',
    application:
      'A prancha final traz os moldes planificados com a arte aplicada, as medidas e a paleta. A foto mostra como a peça se comporta já montada.',
    cover_url: '/projects/volta-foto.jpg',
    external_url: null,
    is_authorial: true,
    published: true,
    position: 1,
    project_images: [
      { id: 'd1-1', url: '/projects/volta-foto.jpg', alt: 'Camisas da coleção Volta, frente e costas', caption: 'Frente e costas: a faixa amarela atravessa o peito e continua na manga.', position: 1 },
      { id: 'd1-2', url: '/projects/volta-prancha.jpg', alt: 'Moldes planificados da camisa com a arte aplicada', caption: 'Prancha de produção: frente, costas e mangas planificadas, com medidas e paleta.', position: 2 },
    ],
  },
  {
    id: 'demo-2',
    slug: 'rota-norte-envelopamento-de-frota',
    title: 'Rota Norte',
    type: 'envelopamento',
    client: 'Empresa fictícia de entregas',
    year: 2026,
    summary: 'Envelopamento para uma van de entregas que precisa ser lida em segundos, parada ou em movimento.',
    description:
      'Rota Norte é uma transportadora regional criada para este estudo. A frota é a maior mídia da empresa, então a van precisava comunicar nome, serviço e contato com clareza, em qualquer ângulo.',
    challenge:
      'Uma van tem portas, maçanetas, frisos e vidros que cortam a arte. O que funciona num retângulo plano pode ficar ilegível quando a porta lateral corre ou quando o carro está em movimento.',
    decision:
      'Defini zonas de leitura antes de desenhar: o nome fica na área contínua da lateral, longe da porta corrediça; o contato vai na traseira, onde os carros de trás têm tempo de ler. A curva verde acompanha a linha da cintura do veículo.',
    application:
      'A van aplicada e a prancha técnica com sangria, linhas de corte e cores, mostrando por que cada elemento está onde está.',
    cover_url: '/projects/rota-foto.jpg',
    external_url: null,
    is_authorial: true,
    published: true,
    position: 2,
    project_images: [
      { id: 'd2-1', url: '/projects/rota-foto.jpg', alt: 'Van branca com envelopamento verde e mostarda da Rota Norte', caption: 'Aplicação: o nome fica na área contínua da lateral, longe da porta corrediça.', position: 1 },
      { id: 'd2-2', url: '/projects/rota-prancha.jpg', alt: 'Desenho técnico da van com áreas de sangria e linhas de corte', caption: 'Prancha técnica: vista lateral, área de sangria, linha de corte e cores.', position: 2 },
    ],
  },
  {
    id: 'demo-3',
    slug: 'faisca-personalizacao-automotiva',
    title: 'Faísca',
    type: 'envelopamento',
    client: 'Conceito autoral',
    year: 2026,
    summary: 'Personalização automotiva em que o desenho do carro faz parte da composição.',
    description:
      'Faísca é um estudo livre de envelopamento esportivo. A ideia era criar movimento mesmo com o carro parado, usando linhas que nascem nas rodas e seguem o vinco da carroceria.',
    challenge:
      'Curvas acentuadas deformam grafismos retos. Uma faixa que parece reta no arquivo pode entortar quando passa pelo para-lama.',
    decision:
      'Testei três caminhos antes de escolher. O escolhido usa diagonais que acompanham a linha da porta, para que a deformação natural da curva reforce a sensação de velocidade em vez de quebrá-la.',
    application:
      'Composição final em três quartos e a folha de estudos com as três alternativas exploradas.',
    cover_url: '/projects/faisca-foto.jpg',
    external_url: null,
    is_authorial: true,
    published: true,
    position: 3,
    project_images: [
      { id: 'd3-1', url: '/projects/faisca-foto.jpg', alt: 'Carro esportivo roxo com grafismo rosa e branco', caption: 'Composição final: as diagonais nascem na roda traseira e sobem acompanhando a porta.', position: 1 },
      { id: 'd3-2', url: '/projects/faisca-estudos.jpg', alt: 'Três alternativas de grafismo para o mesmo carro', caption: 'Exploração: três caminhos testados. A opção A foi a escolhida.', position: 2 },
    ],
  },
  {
    id: 'demo-4',
    slug: 'feira-quintal-campanha-impressa',
    title: 'Feira Quintal',
    type: 'impressos',
    client: 'Feira fictícia de produtores',
    year: 2026,
    summary: 'Uma campanha com cartaz, banner e adesivos que fala a mesma língua em cada formato.',
    description:
      'Feira Quintal é uma feira de produtores locais inventada para este estudo. A campanha precisava funcionar colada num poste, de pé na entrada da feira e na mão de quem compra.',
    challenge:
      'Cada formato é lido de um jeito: o cartaz de passagem, o banner de longe, o adesivo de perto. Repetir o mesmo layout em tudo deixaria algum deles ruim.',
    decision:
      'Mantive o sistema (o tomate-sol, as cores e a tipografia) e mudei a hierarquia em cada peça. No banner, marca grande para ler de longe; no cartaz, a informação completa; nos adesivos, o símbolo com o nome.',
    application:
      'Conjunto aplicado e a prancha com as peças planificadas e suas medidas.',
    cover_url: '/projects/quintal-foto.jpg',
    external_url: null,
    is_authorial: true,
    published: true,
    position: 4,
    project_images: [
      { id: 'd4-1', url: '/projects/quintal-foto.jpg', alt: 'Cartaz, banner e adesivos da Feira Quintal aplicados', caption: 'A campanha aplicada: cartaz na parede, banner de pé e adesivos no caixote.', position: 1 },
      { id: 'd4-2', url: '/projects/quintal-prancha.jpg', alt: 'Peças planificadas com medidas', caption: 'Prancha com as peças planificadas: cartaz A2, banner 0,8 × 2 m e adesivo de 8 cm.', position: 2 },
    ],
  },
];
