// Converte todos os SVGs de artes/svg em PNG 300 dpi com fundo transparente,
// no tamanho real de impressão. É esse PNG que vai para a gráfica de DTF.
//
// Uso (precisa do Playwright com Chromium instalado):
//   node marca-camisetas/ferramentas/exportar_png.js
//   node marca-camisetas/ferramentas/exportar_png.js frente   (só uma pasta)

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const RAIZ = path.resolve(__dirname, '..');
const ORIGEM = path.join(RAIZ, 'artes', 'svg');
const DESTINO = path.join(RAIZ, 'artes', 'png');
const DPI = 300;
const CSS_DPI = 96;

const so = process.argv[2];

(async () => {
  const navegador = await chromium.launch();
  const pagina = await navegador.newPage({ deviceScaleFactor: DPI / CSS_DPI });
  let total = 0;
  for (const pasta of fs.readdirSync(ORIGEM).sort()) {
    if (so && pasta !== so) continue;
    fs.mkdirSync(path.join(DESTINO, pasta), { recursive: true });
    for (const arq of fs.readdirSync(path.join(ORIGEM, pasta)).filter((f) => f.endsWith('.svg')).sort()) {
      const svg = fs.readFileSync(path.join(ORIGEM, pasta, arq), 'utf8');
      const [, w, h] = svg.match(/width="([\d.]+)mm" height="([\d.]+)mm"/);
      const largura = Math.ceil((parseFloat(w) / 25.4) * CSS_DPI);
      const altura = Math.ceil((parseFloat(h) / 25.4) * CSS_DPI);
      await pagina.setViewportSize({ width: largura, height: altura });
      await pagina.setContent(
        `<html><body style="margin:0;background:transparent">` +
          `<div style="width:${largura}px;height:${altura}px">` +
          svg.replace(/width="[\d.]+mm" height="[\d.]+mm"/, `width="${largura}" height="${altura}"`) +
          `</div></body></html>`
      );
      const saida = path.join(DESTINO, pasta, arq.replace(/\.svg$/, '.png'));
      await pagina.screenshot({ path: saida, omitBackground: true, clip: { x: 0, y: 0, width: largura, height: altura } });
      total++;
    }
  }
  await navegador.close();
  console.log(`${total} PNGs em ${path.relative(process.cwd(), DESTINO)} (${DPI} dpi)`);
})();
