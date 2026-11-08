# Marca de camisetas com gírias do Amazonas

Tudo o que precisa para começar: nomes, artes prontas para DTF, verbetes, medidas, embalagem e plano para os primeiros R$ 5.000.

**Nome provisório nas artes: PAVULAGEM.** Para trocar o nome, veja "Como mudar e gerar de novo" no fim deste arquivo. Leva um minuto.

## O que tem nesta pasta

| Pasta / arquivo | O que é |
|---|---|
| `catalogo.html` | Vitrine com as 27 camisas desenhadas. Troque cor da camisa e vista (frente, peito, costas) e marque as que quer produzir. |
| `artes/png/` | **Arquivos para a gráfica.** PNG 300 dpi, fundo transparente, tamanho real. |
| `artes/svg/` | Os mesmos arquivos em vetor (abre no Illustrator, Corel, Inkscape e aumenta sem perder qualidade). |
| `dados/frases.json` | Frases, verbetes, coleções, cores e nome da marca. É aqui que se edita. |
| `ferramentas/` | Programas que geram as artes e as fontes usadas (todas de licença livre, uso comercial permitido). |

Cada frase tem **3 artes, cada uma em 2 versões**:

- `frente/` — frase grande, para frente ou costas (28 cm de largura).
- `bolso/` — versão curta para o peito ou bolso (até 9 × 8 cm).
- `nuca/` — o verbete de dicionário, abaixo da gola nas costas (9 cm).
- `-clara` para camisa branca, off-white e areia. `-escura` para preta, verde-musgo, açaí e marinho.

E mais as peças da marca: logotipo, selo "Feito no Amazonas", etiqueta da barra, mensagem do avesso e 6 ícones de manga (guaraná, boto, Teatro Amazonas, tucunaré, vitória-régia, Encontro das Águas).

São 182 artes no total. Tu escolhes na hora de produzir.

---

## 1. Opções de nome

Antes de decidir, pesquise o nome no INPI (busca gratuita em gov.br/inpi, classe 25, que é vestuário) e veja se o @ está livre no Instagram e no TikTok.

| Nome | Slogan | Observação |
|---|---|---|
| **Pavulagem** | Veste e se mostra. | Combina com moda (vestir é se mostrar). É o que está nas artes. |
| **Maceta** | Tudo maceta, mano. | Curto, forte, bem manauara. |
| **Caboquinho** | O Amazonas no peito. | Carinhoso, lembra o X-Caboquinho. Verifique se alguma lanchonete registrou na classe 25. |
| **Papo de Mano** | Manaus falando no peito. | Diz exatamente o que a marca faz. |
| **Borimbora** | Bora vestir o Amazonas. | Energia e convite. |
| **Telezé** | Tu é leso? Veste logo. | Muito engraçado, mas é uma provocação. Pode afastar quem compra para presentear. |
| **Banzeiro** | Roupa que faz onda. | Bonito, mas há um restaurante famoso em Manaus com esse nome. Pode confundir. |
| **Leseira** | Leseira com estilo. | "Leseira baré" é muito usado, então é provável que já exista página ou marca. |

## 2. As 27 frases

Divididas em 4 coleções, cada uma com cor, fonte e ícone de manga próprios.

| Coleção | Cor | Ícone de manga | Frases |
|---|---|---|---|
| Saudação | amarelo e verde-mata | guaraná | Mano!, Mana!, Ixi!, Eita pau!, Olha já!, Espia só! |
| Deboche | rosa-boto e açaí | boto | Telezé?, Olha o papo desse bicho!, Tá só o pitiú, Cheio de pavulagem!, Só o cuí!, Marrapaz! Se manca!, É muito fuleiro mesmo!, Nem com nojo |
| Elogio | vermelho-guaraná e amarelo | Teatro Amazonas | Maceta!, Maceta que só!, Tá lá, cheiroso!, No olho!, De cumborra!!, Capim na palheta! |
| Ação e afeto | azul-rio e barro | tucunaré | Borimbora, Pega o beco!, Toma tua merenda!, Não trisca, Lá na Caixa-prego, Ê caroço!, Moleque doido! |

**Duplas para presente:** Mano! + Mana! (casal, irmãos), Olha já! + Espia só! (amigos), Toma tua merenda! + Moleque doido! (mãe e filho).

### ⚠️ Confirme estes 8 verbetes antes de imprimir

Escrevi os significados com base no que conheço, mas não tenho certeza destes. Tu conheces as gírias melhor que eu:

| Frase | O que eu escrevi |
|---|---|
| Só o cuí! | Farinha fininha, o pó que sobra. "Tá só o cuí": acabado, em pedaços. |
| Nem com nojo | De jeito nenhum, nem pensar. |
| Tá lá, cheiroso! | Arrumado, perfumado, pronto pra sair. "Tá lá": aí está, prontinho. |
| No olho! | Na medida certa, sem errar; acertou em cheio. |
| De cumborra!! | Em quantidade, de monte, com fartura. |
| Capim na palheta! | A toda velocidade, sem parar pra nada. |
| Toma tua merenda! | Bem feito! Procurou e achou. |
| Ê caroço! | Coisa difícil, encrenca, situação complicada. |

Se algum estiver errado, corrija em `dados/frases.json` e gere de novo (veja o fim deste arquivo). Ou me mande o significado certo que eu corrijo.

Os outros 19 verbetes estão completos no catálogo e no `frases.json`.

## 3. Como mandar para a gráfica de DTF

| Lugar | Arquivo | Tamanho | Posição |
|---|---|---|---|
| Frente | `png/frente/<frase>-clara.png` | 28 cm de largura | Começa a 7–9 cm da gola |
| Costas | o mesmo da frente | até 30 cm | Começa a 8–10 cm da gola |
| Peito / bolso | `png/bolso/` | até 9 × 8 cm | Lado esquerdo de quem veste, a 18–20 cm do ombro |
| Nuca (verbete) | `png/nuca/` | 9 cm | 3 cm abaixo da costura da gola |
| Manga | `png/manga/` | 7 × 7 cm | Centro da manga, 3 cm acima da barra. Não pode passar da costura do ombro. |
| Selo | `png/marca/selo-*.png` | 6 cm | Manga ou barra lateral |
| Etiqueta da barra | `png/marca/etiqueta-barra-*.png` | ~6 × 1 cm | Frente, 4 cm acima da barra, 3 cm da costura lateral |
| Mensagem do avesso | `png/marca/avesso-*.png` | 8 cm | Por dentro, nas costas, perto da barra |

Dicas:

- **Peça uma prova antes do lote.** Imprima 2 ou 3 camisas e lave 10 vezes do avesso. Se a estampa rachar ou descolar, troque de fornecedor ou de filme.
- **O verbete da nuca tem letra pequena.** Pergunte à gráfica se o equipamento deles reproduz texto de 3 mm de altura. Se não, peça para imprimir com 10–11 cm de largura.
- **Combine o menor número de cores de camisa.** Duas cores (off-white e preta) já mostram as duas versões das artes e simplificam o estoque.
- Coloque na etiqueta interna: "Lave do avesso. Não passe ferro sobre a estampa."

## 4. Embalagem

| Tipo | O que vai | Custo estimado |
|---|---|---|
| **Online (padrão)** | Envelope kraft ou plástico com adesivo do selo. Camisa enrolada e amarrada com fita de ráfia, cartão com o verbete da frase e QR code para o Instagram, 1 adesivo. | R$ 3–5 |
| **Presente (venda presencial ou opção paga no site)** | Saco de algodão cru estampado com "Pega o beco!" ou o logo (vira ecobag e propaganda), cartão "Pra quem tem saudade do Amazonas" com espaço para escrever à mão. | R$ 12–18 (cobre R$ 20 a mais) |
| **Premium (datas especiais)** | Mini paneiro de arumã de artesão local, com a camisa dobrada dentro. É uma boa história para contar nas redes. | R$ 20–35 |

Na parte de fora do envelope: *"Encomenda vinda lá da Caixa-prego"*.

## 5. Plano para R$ 5.000

Valores estimados. Confira os preços em Manaus, porque o frete costuma deixar insumos mais caros.

| Item | Valor |
|---|---|
| MEI (abrir é grátis, mensalidade ~R$ 80) + registro da marca no INPI com desconto de MEI | R$ 450 |
| Provas e teste de lavagem (6 camisas, 2 fornecedores) | R$ 300 |
| Primeiro lote: 50 camisas (6 a 8 frases, P 20% · M 35% · G 30% · GG 15%) a ~R$ 45 cada com estampa | R$ 2.250 |
| Embalagens: 100 kits online + 20 kits presente | R$ 700 |
| Fotos e vídeos (em lugares como o Encontro das Águas, a feira da Panair ou o Teatro Amazonas) | R$ 300 |
| Anúncios no Instagram e no TikTok | R$ 500 |
| Taxa de estande em feira ou evento | R$ 300 |
| Reserva para imprevistos | R$ 200 |
| **Total** | **R$ 5.000** |

Vendendo as 50 camisas a R$ 99, entram cerca de R$ 4.950. O dinheiro volta, e ficam a marca registrada, as embalagens que sobraram e os clientes.

**Para gastar menos:** abra **pré-venda** com as fotos dos mockups do catálogo e só produza o que foi pago. O DTF permite lotes pequenos.

### Primeiras 4 semanas

1. **Semana 1:** escolha o nome, faça a busca no INPI e no Instagram, confirme os 8 verbetes.
2. **Semana 2:** escolha de 6 a 8 frases no catálogo. Poste enquetes ("qual tu usaria?") e mande para amigos que moram fora do Amazonas.
3. **Semana 3:** imprima as provas, lave e aprove. Abra a pré-venda.
4. **Semana 4:** produza o lote, fotografe e grave vídeos curtos de "como se fala" e de "manauara explicando gíria pra quem é de fora".

---

## Como mudar e gerar de novo

Tudo sai do arquivo `dados/frases.json`:

- **Nome da marca:** troque `"nome": "PAVULAGEM"` (e o slogan, se quiser).
- **Verbete:** troque `definicao` ou `exemplo` da frase. Depois de confirmar, apague a linha `"confirmar": true`.
- **Cores de uma coleção:** troque os códigos em `colecoes`.
- **Frase nova:** copie um bloco existente e mude o texto.

Depois, no terminal, na raiz do projeto:

```bash
pip install fonttools uharfbuzz brotli pillow
python3 marca-camisetas/ferramentas/gerar_artes.py     # SVGs + catalogo.html
node marca-camisetas/ferramentas/exportar_png.js       # PNGs 300 dpi (precisa do Playwright)
python3 marca-camisetas/ferramentas/marcar_dpi.py      # grava 300 dpi nos PNGs
```

Se preferir, é só me pedir a mudança que eu gero tudo de novo.

## Fontes

Alfa Slab One, Bungee, Chango, Ultra, Lobster e Libre Baskerville, todas sob a SIL Open Font License, que permite uso comercial em produtos. As licenças estão em `ferramentas/fontes/`. Nas artes, o texto já está convertido em curvas, então ninguém precisa instalar as fontes para abrir os arquivos.
