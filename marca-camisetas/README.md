# Marca de camisetas com gírias do Amazonas

Tudo o que precisa para começar: nomes, artes prontas para DTF, mockups, verbetes, medidas, embalagem e plano para os primeiros R$ 5.000.

**Nome provisório nas artes: Pavulagem.** Para trocar, veja "Como mudar e gerar de novo" no fim. Leva poucos minutos.

## O que tem nesta pasta

| Pasta / arquivo | O que é |
|---|---|
| `catalogo.html` | Vitrine com as fotos das camisas. Troque preta/off-white, marque as que quer produzir e copie a lista. |
| `mockups/folhas/` | **8 imagens com 4 camisas cada**, para mostrar, postar ou votar. |
| `mockups/preta/` e `mockups/offwhite/` | Uma foto por camisa (1200 × 1200 px). |
| `artes/png/` | **Arquivos para a gráfica.** PNG 300 dpi, fundo transparente, tamanho real. |
| `artes/svg/` | Os mesmos arquivos em vetor (Illustrator, Corel, Inkscape, Figma). |
| `dados/frases.json` | Frases, verbetes, coleções, cores e nome da marca. É aqui que se edita. |
| `ferramentas/` | Programas que geram artes, PNGs, mockups e catálogo, mais as fontes (todas de licença livre). |

### O estilo

Inspirado em camisa de banda e de assinatura: letra feita à mão com movimento, um traço vermelho de pincel, um rabisco desenhado (coroa, faísca, xis, seta...) e uma linha de máquina de escrever explicando a gíria. Fundo limpo, pouca cor: tinta clara ou escura e vermelho.

Cada coleção tem uma letra própria:

| Coleção | Letra | Sensação |
|---|---|---|
| Saudação | pincel (Mr Dafoe) | assinatura rápida |
| Deboche | marcador de grafite (Sedgwick Ave Display) | pichação, rua |
| Elogio | assinatura fina (Water Brush) | elegante, caneta-pincel |
| Ação e afeto | marcador à mão (Rock Salt) | bilhete escrito com pressa |

Complementos: máquina de escrever (Special Elite), Courier Prime no verbete da nuca e Bebas Neue nas listas das costas.

### O que existe de arte

- **27 frases**, cada uma com:
  - `frente/`: frase grande no peito, 26–28 cm.
  - `bolso/`: versão pequena para o peito, até 9 cm.
  - `nuca/`: verbete de dicionário, 9 cm.
- **3 estampas de costas** (`costas/`):
  - Dicionário vol. 1 e vol. 2, a lista de gírias no estilo "nomes da banda".
  - Turnê "Lá na Caixa-prego", com 8 cidades do Amazonas e datas, no estilo camisa de turnê. A frente dela é `frente/turne`.
- **Marca** (`marca/`):
  - assinatura (manga), logotipo, selo, etiqueta da barra e mensagem do avesso.
- Tudo em versão `-escura` (para camisa preta ou escura) e `-clara` (para branca, off-white ou areia).

---

## 1. Opções de nome

Pesquise o nome no INPI (busca gratuita em gov.br/inpi, classe 25, vestuário) e veja se o @ está livre no Instagram e no TikTok.

| Nome | Slogan | Observação |
|---|---|---|
| **Pavulagem** | veste e se mostra. | Combina com moda. É o que está nas artes. |
| **Maceta** | tudo maceta, mano. | Curto, forte, bem manauara. |
| **Caboquinho** | o Amazonas no peito. | Carinhoso, lembra o X-Caboquinho. Verifique se alguma lanchonete registrou na classe 25. |
| **Papo de Mano** | Manaus falando no peito. | Diz exatamente o que a marca faz. |
| **Borimbora** | bora vestir o Amazonas. | Energia e convite. |
| **Telezé** | tu é leso? veste logo. | Engraçado, mas provoca. Pode afastar quem compra para presente. |
| **Banzeiro** | roupa que faz onda. | Há um restaurante famoso em Manaus com esse nome. |
| **Leseira** | leseira com estilo. | "Leseira baré" é muito usado, então é provável que já exista marca. |

## 2. As frases

| Coleção | Frases |
|---|---|
| Saudação | Mano!, Mana!, Ixi!, Eita pau!, Olha já!, Espia só! |
| Deboche | Telezé?, Olha o papo desse bicho!, Tá só o pitiú, Cheio de pavulagem!, Só o cuí!, Marrapaz! Se manca!, É muito fuleiro mesmo!, Nem com nojo |
| Elogio | Maceta!, Maceta que só!, Tá lá, cheiroso!, No olho!, De cumborra!!, Capim na palheta! |
| Ação e afeto | Borimbora, Pega o beco!, Toma tua merenda!, Não trisca, Lá na Caixa-prego, Ê caroço!, Moleque doido! |
| Costas | Dicionário vol. 1, Dicionário vol. 2, Turnê Lá na Caixa-prego |

**Duplas para presente:** Mano! + Mana!, Olha já! + Espia só!, Toma tua merenda! + Moleque doido!

### ⚠️ Confirme estes 8 verbetes antes de imprimir

Os significados abaixo saíram do que eu conheço, e não tenho certeza deles:

| Frase | O que está escrito |
|---|---|
| Só o cuí! | Farinha fininha, o pó que sobra. "Tá só o cuí": acabado, em pedaços. |
| Nem com nojo | De jeito nenhum, nem pensar. |
| Tá lá, cheiroso! | Arrumado, perfumado, pronto pra sair. |
| No olho! | Na medida certa, sem errar. (nota na frente: "na medida certa") |
| De cumborra!! | Em quantidade, de monte, com fartura. |
| Capim na palheta! | A toda velocidade, sem parar pra nada. |
| Toma tua merenda! | Bem feito! Procurou e achou. |
| Ê caroço! | Coisa difícil, encrenca. (nota na frente: "encrenca das grandes") |

Corrija em `dados/frases.json` (campos `verbete` e `nota`) ou me mande o significado certo.

## 3. Como mandar para a gráfica de DTF

| Lugar | Arquivo | Tamanho | Posição |
|---|---|---|---|
| Frente | `png/frente/<frase>-escura.png` | 26–28 cm | Começa a 7 cm da gola |
| Peito (pequena) | `png/bolso/` | até 9 cm | Lado esquerdo de quem veste, a 18–20 cm do ombro |
| Costas | `png/costas/` | 20–26 cm | Começa a 9 cm da gola |
| Nuca (verbete) | `png/nuca/` | 9 cm | 3 cm abaixo da costura da gola |
| Manga | `png/marca/assinatura-*.png` | 7–8 cm | Centro da manga, 3 cm acima da barra. Não pode passar da costura do ombro. |
| Etiqueta da barra | `png/marca/etiqueta-barra-*.png` | 5 × 1 cm | Frente, 4 cm acima da barra, 3 cm da costura lateral |
| Mensagem do avesso | `png/marca/avesso-*.png` | 8 cm | Por dentro, nas costas, perto da barra |

Dicas:

- **Peça uma prova antes do lote.** Imprima 2 ou 3 camisas e lave 10 vezes do avesso.
- **Traço fino:** a letra de assinatura (coleção Elogio) e a máquina de escrever têm partes finas. Pergunte se o equipamento reproduz linha de 0,5 mm. Se não, use a versão de frente em vez da de peito.
- **Comece com preta e off-white.** As duas mostram as duas versões das artes e simplificam o estoque.
- Etiqueta interna: "Lave do avesso. Não passe ferro sobre a estampa."

## 4. Mockups

As fotos em `mockups/` são geradas por computador: camisa estendida com dobras, malha, gola canelada, costura e sombra, com a estampa acompanhando o tecido. Não gastam crédito de nenhum site e são refeitas sozinhas quando uma arte muda.

Servem para escolher, votar com os amigos e abrir a pré-venda. Para fotos com pessoas vestindo, veja a seção 7.

## 5. Embalagem

| Tipo | O que vai | Custo estimado |
|---|---|---|
| **Online (padrão)** | Envelope kraft com o selo, camisa enrolada com fita de ráfia, cartão com o verbete e QR code para o Instagram. | R$ 3–5 |
| **Presente** | Saco de algodão cru com a assinatura (vira ecobag), cartão "Pra quem tem saudade do Amazonas" para escrever à mão. | R$ 12–18 (cobre R$ 20 a mais) |
| **Premium** | Mini paneiro de arumã de artesão local. | R$ 20–35 |

## 6. Plano para R$ 5.000

| Item | Valor |
|---|---|
| MEI + registro da marca no INPI com desconto de MEI | R$ 450 |
| Provas e teste de lavagem (6 camisas, 2 fornecedores) | R$ 300 |
| Primeiro lote: 50 camisas (6 a 8 estampas; P 20% · M 35% · G 30% · GG 15%) a ~R$ 45 | R$ 2.250 |
| Embalagens: 100 kits online + 20 kits presente | R$ 700 |
| Fotos com pessoas (amigos como modelo, celular bom, luz de fim de tarde) | R$ 300 |
| Anúncios no Instagram e no TikTok | R$ 500 |
| Taxa de estande em feira ou evento | R$ 300 |
| Reserva | R$ 200 |
| **Total** | **R$ 5.000** |

Com pré-venda, só se produz o que foi pago.

## 7. Sites grátis que designers usam

| Para quê | Site | Observação |
|---|---|---|
| Fontes | **Google Fonts**, **Fontshare** | Uso comercial liberado. No DaFont, muitas fontes são só para uso pessoal. |
| Editar a arte | **Figma** (plano grátis), **Photopea** (Photoshop no navegador), **Inkscape** (vetor, programa) | Os SVGs desta pasta abrem nos três. |
| Arte e mockup rápidos | **Canva** (grátis), **Kittl** (bom para tipografia de camiseta) | Confira no Kittl se o plano grátis permite uso comercial. |
| Mockup com foto | **Mockey.ai**, **Freepik** (grátis com crédito ao autor), **Mockup World** | Troque a arte pelo PNG desta pasta. |
| Foto com pessoas por IA | **Google Flow** ou **Whisk**, **Ideogram** | Créditos grátis por mês. A IA costuma errar letras: confira a frase com lupa antes de postar. |

**Conectar ao Claude:** Canva e Figma têm conector oficial (claude.ai → Configurações → Conectores). Com eles ligados, dá para eu montar as peças direto na sua conta. O Google Flow não tem conector, então lá a geração é feita por você mesma, com o prompt abaixo.

**Prompt para o Flow (4 fotos numa imagem só, para gastar menos crédito).** Envie o PNG da arte como imagem de referência e cole:

```
A 2x2 grid of four realistic lifestyle photos, same young Brazilian model from Manaus in all four,
wearing a plain black cotton crew-neck t-shirt with the uploaded print centered on the upper chest,
print flat and sharp, exactly as the reference, no extra text.
Panel 1: street with colorful old houses, late afternoon light.
Panel 2: riverside pier with wooden boats, golden hour.
Panel 3: food market stall with tropical fruit, natural light.
Panel 4: close-up of the chest print, fabric texture visible.
35mm photo, natural skin, soft shadows, no logos other than the print.
```

---

## Como mudar e gerar de novo

Tudo sai de `dados/frases.json`:

- **Nome da marca:** troque `"nome": "Pavulagem"`.
- **Frase:** `script` (letra à mão), `pre` (máquina de escrever antes, em vermelho), `nota` (explicação embaixo), `doodle` (rabisco: estrela, coracao, faiscas, seta, olho, rabisco, cheiro, coroa, x, brilho, alvo, velocidade, migalhas).
- **Verbete:** `definicao` e `exemplo`. Depois de confirmar, apague `"confirmar": true`.
- **Listas e turnê:** em `listas` e `turne`.

Depois, na raiz do projeto:

```bash
pip install fonttools uharfbuzz brotli pillow numpy scipy
python3 marca-camisetas/ferramentas/gerar_artes.py     # SVGs + catalogo.html
node marca-camisetas/ferramentas/exportar_png.js       # PNGs 300 dpi (precisa do Playwright)
python3 marca-camisetas/ferramentas/marcar_dpi.py      # grava 300 dpi nos PNGs
python3 marca-camisetas/ferramentas/gerar_mockups.py   # fotos das camisas + folhas com 4
```

Ou me peça a mudança que eu gero tudo de novo.

## Fontes

Mr Dafoe, Sedgwick Ave Display, Water Brush, Rock Salt, Special Elite, Courier Prime e Bebas Neue: todas sob licença livre (SIL Open Font License ou Apache 2.0), com uso comercial permitido. As licenças estão em `ferramentas/fontes/`. Nas artes, o texto já está em curvas, então ninguém precisa instalar fonte.
