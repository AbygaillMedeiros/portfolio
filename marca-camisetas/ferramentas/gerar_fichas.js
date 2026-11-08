// Gera uma ficha em alta resolução por estampa, para conferir detalhes:
// arte da frente, versão do peito e verbete da nuca, cada uma sobre fundo
// escuro e claro, mais o significado em texto.
//
// Uso (depois de gerar_artes.py):
//   node marca-camisetas/ferramentas/gerar_fichas.js
// Saída: marca-camisetas/fichas/*.jpg (2800 px de largura)

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const RAIZ = path.resolve(__dirname, '..');
const SVG = path.join(RAIZ, 'artes', 'svg');
const FONTES = path.join(RAIZ, 'ferramentas', 'fontes');
const SAIDA = path.join(RAIZ, 'fichas');
const D = JSON.parse(fs.readFileSync(path.join(RAIZ, 'dados', 'frases.json'), 'utf8'));

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const aspas = (s) => s.replace(/"([^"]*)"/g, '“$1”');
const arq = (pasta, nome) => 'file://' + path.join(SVG, pasta, nome + '.svg');

const css = `
@font-face { font-family: Courier; src: url(file://${FONTES}/courier-prime-latin-400-normal.woff); }
@font-face { font-family: Courier; font-weight: 700; src: url(file://${FONTES}/courier-prime-latin-700-normal.woff); }
@font-face { font-family: Courier; font-style: italic; src: url(file://${FONTES}/courier-prime-latin-400-italic.woff); }
@font-face { font-family: Maquina; src: url(file://${FONTES}/special-elite-latin-400-normal.woff); }
* { box-sizing: border-box; }
body { margin: 0; width: 1400px; background: #ECE9E3; color: #171615; font: 17px/1.5 Courier, monospace; }
.topo { padding: 40px 48px 28px; display: grid; gap: 10px; }
.topo h1 { margin: 0; font: 400 46px/1.1 Maquina, monospace; }
.meta { display: flex; gap: 10px; flex-wrap: wrap; }
.tag { border: 1px solid #b9b2a6; border-radius: 99px; padding: 2px 12px; font-size: 15px; }
.tag.ok { background: #DDEBD9; border-color: #9DBF94; }
.tag.alerta { background: #F8E3B6; border-color: #D9B866; }
.verbete { background: #fff; border-radius: 10px; padding: 18px 22px; font-size: 20px; max-width: 1100px; }
.verbete b { font-size: 24px; }
.verbete em { color: #5F5A53; }
.grade { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; padding: 0 48px 16px; }
.caixa { border-radius: 10px; overflow: hidden; display: grid; grid-template-rows: auto 1fr; }
.caixa .rot { font-size: 14px; padding: 8px 14px; }
.escuro { background: #161616; color: #bbb; }
.claro { background: #F7F6F2; color: #555; border: 1px solid #d6d0c5; }
.caixa .arte { display: grid; place-items: center; padding: 28px; }
.caixa img { width: 100%; height: auto; display: block; }
.pequena img { width: 60%; margin: 0 auto; }
.largo { grid-column: 1 / -1; }
.rodape { padding: 8px 48px 36px; font-size: 14px; color: #5F5A53; }
`;

function caixa(rotulo, src, classe, extra = '') {
  return `<div class="caixa ${classe} ${extra}"><div class="rot">${esc(rotulo)}</div><div class="arte"><img src="${src}"></div></div>`;
}

function fichaFrase(fr) {
  const col = D.colecoes[fr.colecao];
  const v = fr.verbete;
  const status = fr.confirmar
    ? '<span class="tag alerta">significado a confirmar</span>'
    : '<span class="tag ok">significado conferido</span>';
  return `<div class="topo">
      <h1>${esc(fr.frase)}</h1>
      <div class="meta"><span class="tag">coleção ${esc(col.nome.toLowerCase())}</span>${status}<span class="tag">arquivo: ${esc(fr.id)}</span></div>
      <div class="verbete"><b>${esc(v.palavra)}</b> <em>${esc(v.classe)}</em><br>${esc(aspas(v.definicao))}<br><em>“${esc(v.exemplo)}”</em></div>
    </div>
    <div class="grade">
      ${caixa('FRENTE · camisa escura (arquivo -escura) · imprimir com 28 a 32 cm', arq('frente', fr.id + '-escura'), 'escuro', 'largo')}
      ${caixa('FRENTE · camisa clara (arquivo -clara)', arq('frente', fr.id + '-clara'), 'claro', 'largo')}
      ${caixa('NUCA · verbete · camisa escura · 9 cm', arq('nuca', fr.id + '-escura'), 'escuro')}
      ${caixa('NUCA · verbete · camisa clara · 9 cm', arq('nuca', fr.id + '-clara'), 'claro')}
      ${caixa('PEITO · versão pequena · camisa escura · até 9 cm', arq('bolso', fr.id + '-escura'), 'escuro')}
      ${caixa('PEITO · versão pequena · camisa clara · até 9 cm', arq('bolso', fr.id + '-clara'), 'claro')}
    </div>
    <div class="rodape">${esc(D.marca.nome)} · ficha para conferência. Os arquivos para a gráfica estão em PNG 300 dpi (fundo transparente) e SVG (vetor).</div>`;
}

function fichaTurne() {
  const t = D.turne;
  return `<div class="topo"><h1>${esc(t.nome)}</h1>
      <div class="meta"><span class="tag">costas + peito</span><span class="tag">arquivo: turne</span></div></div>
    <div class="grade">
      ${caixa('COSTAS · camisa escura · 26 cm', arq('costas', 'turne-escura'), 'escuro')}
      ${caixa('COSTAS · camisa clara · 26 cm', arq('costas', 'turne-clara'), 'claro')}
      ${caixa('PEITO · camisa escura · 17 cm', arq('frente', 'turne-escura'), 'escuro')}
      ${caixa('PEITO · camisa clara · 17 cm', arq('frente', 'turne-clara'), 'claro')}
    </div>`;
}

function fichaMarca() {
  const pecas = [['logo', 'LOGOTIPO'], ['assinatura', 'ASSINATURA · manga · 7 a 8 cm'], ['selo', 'SELO · 5 a 6 cm'],
    ['etiqueta-barra', 'ETIQUETA DA BARRA · 5 × 1 cm', 'pequena'], ['avesso', 'MENSAGEM DO AVESSO · 8 cm']];
  return `<div class="topo"><h1>Peças da marca</h1></div><div class="grade">
    ${pecas.map(([a, r, x = '']) => caixa(r + ' · escura', arq('marca', a + '-escura'), 'escuro', x) + caixa(r + ' · clara', arq('marca', a + '-clara'), 'claro', x)).join('')}
  </div>`;
}

(async () => {
  fs.mkdirSync(SAIDA, { recursive: true });
  const nav = await chromium.launch();
  const pag = await nav.newPage({ viewport: { width: 1400, height: 1000 }, deviceScaleFactor: 2 });
  const fichas = D.frases.map((fr, i) => [`${String(i + 1).padStart(2, '0')}-${fr.id}`, fichaFrase(fr)]);
  fichas.push([`${String(fichas.length + 1).padStart(2, '0')}-turne`, fichaTurne()]);
  fichas.push([`${String(fichas.length + 1).padStart(2, '0')}-marca`, fichaMarca()]);
  for (const [nome, corpo] of fichas) {
    const arquivoHtml = path.join(SAIDA, '.tmp.html');
    fs.writeFileSync(arquivoHtml, `<!doctype html><meta charset="utf-8"><style>${css}</style>${corpo}`);
    await pag.goto('file://' + arquivoHtml);
    await pag.evaluate(() => document.fonts.ready);
    await pag.waitForFunction(() => [...document.images].every((i) => i.complete));
    await pag.screenshot({ path: path.join(SAIDA, nome + '.jpg'), fullPage: true, type: 'jpeg', quality: 92 });
  }
  fs.unlinkSync(path.join(SAIDA, '.tmp.html'));
  await nav.close();
  console.log(`${fichas.length} fichas em ${path.relative(process.cwd(), SAIDA)}`);
})();
