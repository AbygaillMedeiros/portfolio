#!/usr/bin/env python3
"""Gera todas as estampas da marca em SVG (medidas reais em milímetros).

Estilo: letra à mão (pincel, marcador, assinatura), com traço vermelho de
destaque, rabiscos desenhados e uma linha de máquina de escrever.

Uso:
    pip install fonttools uharfbuzz brotli
    python3 marca-camisetas/ferramentas/gerar_artes.py

Edite marca-camisetas/dados/frases.json e rode de novo. Depois rode
exportar_png.js (PNG 300 dpi para a gráfica) e gerar_mockups.py (fotos das camisas).

Todo texto vira curva (path): o arquivo abre igual em qualquer computador.
"""
import io
import json
import math
import random
import re
import shutil
from pathlib import Path

import uharfbuzz as hb
from fontTools.misc.transform import Transform
from fontTools.pens.boundsPen import BoundsPen
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.ttLib import TTFont

RAIZ = Path(__file__).resolve().parent.parent
PASTA_FONTES = RAIZ / "ferramentas" / "fontes"
SAIDA = RAIZ / "artes" / "svg"

DADOS = json.loads((RAIZ / "dados" / "frases.json").read_text(encoding="utf-8"))
MARCA = DADOS["marca"]
CORES = DADOS["cores"]
ACENTO = CORES["acento"]

ARQ_FONTES = {
    "pincel": "mr-dafoe-latin-400-normal.woff",
    "marcador": "sedgwick-ave-display-latin-400-normal.woff",
    "assinatura": "water-brush-latin-400-normal.woff",
    "rabisco": "rock-salt-latin-400-normal.woff",
    "maquina": "special-elite-latin-400-normal.woff",
    "mono": "courier-prime-latin-400-normal.woff",
    "mono_b": "courier-prime-latin-700-normal.woff",
    "mono_i": "courier-prime-latin-400-italic.woff",
    "lista": "bebas-neue-latin-400-normal.woff",
}


def num(v):
    s = f"{v:.2f}".rstrip("0").rstrip(".")
    return "0" if s in ("-0", "") else s


class Fonte:
    def __init__(self, arquivo):
        self.tt = TTFont(PASTA_FONTES / arquivo)
        self.tt.flavor = None
        buf = io.BytesIO()
        self.tt.save(buf)
        self.hb = hb.Font(hb.Face(buf.getvalue()))
        self.upem = self.tt["head"].unitsPerEm
        self.gs = self.tt.getGlyphSet()
        self.ordem = self.tt.getGlyphOrder()

    def moldar(self, texto):
        buf = hb.Buffer()
        buf.add_str(texto)
        buf.guess_segment_properties()
        hb.shape(self.hb, buf, {"kern": True, "liga": True})
        for info in buf.glyph_infos:
            if info.codepoint == 0:
                raise ValueError(f"Fonte sem caractere em {texto!r}")
        return list(zip(buf.glyph_infos, buf.glyph_positions))

    def largura(self, texto, tam, espaco=0.0):
        s = tam / self.upem
        return sum(p.x_advance * s + espaco for _, p in self.moldar(texto))

    def caminho(self, texto, tam, x=0.0, y=0.0, espaco=0.0):
        """Texto como path. (x, y) = início da linha de base. Retorna (d, caixa)."""
        s = tam / self.upem
        pen = SVGPathPen(self.gs, ntos=num)
        caixa = BoundsPen(self.gs)
        cx = 0.0
        for info, pos in self.moldar(texto):
            nome = self.ordem[info.codepoint]
            t = Transform(s, 0, 0, -s, x + cx + pos.x_offset * s, y - pos.y_offset * s)
            self.gs[nome].draw(TransformPen(pen, t))
            self.gs[nome].draw(TransformPen(caixa, t))
            cx += pos.x_advance * s + espaco
        return pen.getCommands(), caixa.bounds

    def em_arco(self, texto, tam, cx, cy, raio, topo=True, espaco=0.0):
        """Texto curvado num círculo (selo)."""
        s = tam / self.upem
        glifos = self.moldar(texto)
        total = sum(p.x_advance * s + espaco for _, p in glifos) - espaco
        pen = SVGPathPen(self.gs, ntos=num)
        px = 0.0
        for info, pos in glifos:
            nome = self.ordem[info.codepoint]
            meio = px + pos.x_advance * s / 2 - total / 2
            if topo:
                t = Transform().translate(cx, cy).rotate(meio / raio).translate(0, -raio)
            else:
                t = Transform().translate(cx, cy).rotate(-meio / raio).translate(0, raio)
            t = t.translate(-meio, 0).translate(px - total / 2, 0).scale(s, -s)
            self.gs[nome].draw(TransformPen(pen, t))
            px += pos.x_advance * s + espaco
        return pen.getCommands()


F = {k: Fonte(v) for k, v in ARQ_FONTES.items()}


# ---------------------------------------------------------------- traço de pincel

def suavizar(pts, n=14):
    """Curva Catmull-Rom passando pelos pontos."""
    if len(pts) < 3:
        (x0, y0), (x1, y1) = pts
        return [(x0 + (x1 - x0) * i / n, y0 + (y1 - y0) * i / n) for i in range(n + 1)]
    p = [pts[0]] + list(pts) + [pts[-1]]
    saida = []
    for i in range(1, len(p) - 2):
        p0, p1, p2, p3 = p[i - 1], p[i], p[i + 1], p[i + 2]
        for k in range(n):
            t = k / n
            t2, t3 = t * t, t * t * t
            saida.append(tuple(0.5 * (2 * p1[j] + (-p0[j] + p2[j]) * t + (2 * p0[j] - 5 * p1[j] + 4 * p2[j] - p3[j]) * t2
                                      + (-p0[j] + 3 * p1[j] - 3 * p2[j] + p3[j]) * t3) for j in (0, 1)))
    saida.append(pts[-1])
    return saida


def pincelada(pts, larg, ataque=0.12, saida=0.5, minimo=0.14):
    """Traço que engrossa rápido e afina devagar, como pincel. Retorna (path d, pontos)."""
    P = suavizar(pts)
    dist = [0.0]
    for a, b in zip(P, P[1:]):
        dist.append(dist[-1] + math.hypot(b[0] - a[0], b[1] - a[1]))
    total = dist[-1] or 1
    esq, dir_ = [], []
    for i, (x, y) in enumerate(P):
        t = dist[i] / total
        w = 1.0
        if t < ataque:
            w *= (t / ataque) ** 0.5
        if t > 1 - saida:
            w *= ((1 - t) / saida) ** 0.8
        w = larg * max(minimo, w) / 2
        a = P[max(0, i - 1)]
        b = P[min(len(P) - 1, i + 1)]
        tx, ty = b[0] - a[0], b[1] - a[1]
        n = math.hypot(tx, ty) or 1
        nx, ny = -ty / n, tx / n
        esq.append((x + nx * w, y + ny * w))
        dir_.append((x - nx * w, y - ny * w))
    poli = esq + dir_[::-1]
    d = "M" + " L".join(f"{num(x)} {num(y)}" for x, y in poli) + " Z"
    return d, poli


def circulo(cx, cy, r):
    return (f"M{num(cx - r)} {num(cy)} A{num(r)} {num(r)} 0 1 0 {num(cx + r)} {num(cy)} "
            f"A{num(r)} {num(r)} 0 1 0 {num(cx - r)} {num(cy)} Z"), [(cx - r, cy - r), (cx + r, cy + r)]


# Rabiscos desenhados à mão, numa caixa 1 x 1 (y para baixo).
def _espiral(voltas, r0, r1, n=60):
    return [(0.5 + (r0 + (r1 - r0) * i / n) * math.cos(2 * math.pi * voltas * i / n),
             0.5 + (r0 + (r1 - r0) * i / n) * math.sin(2 * math.pi * voltas * i / n)) for i in range(n + 1)]


RABISCOS = {
    "estrela": [[(0.5, 0.0), (0.52, 0.5), (0.5, 1.0)], [(0.06, 0.26), (0.5, 0.5), (0.94, 0.74)],
                [(0.08, 0.76), (0.5, 0.5), (0.92, 0.24)]],
    "coracao": [[(0.52, 0.96), (0.16, 0.6), (0.06, 0.26), (0.28, 0.06), (0.5, 0.28), (0.72, 0.05),
                 (0.94, 0.24), (0.86, 0.58), (0.5, 0.98)]],
    "faiscas": [[(0.24, 0.66), (0.08, 0.04)], [(0.44, 0.62), (0.7, 0.08)], [(0.56, 0.84), (1.0, 0.62)]],
    "seta": [[(0.0, 0.85), (0.3, 0.42), (0.68, 0.3), (1.0, 0.42)], [(0.74, 0.12), (1.0, 0.42), (0.72, 0.66)]],
    "olho": [[(0.0, 0.52), (0.5, 0.12), (1.0, 0.5)], [(0.02, 0.5), (0.5, 0.9), (0.98, 0.52)],
             [(0.3, 0.12), (0.22, -0.12)], [(0.5, 0.06), (0.5, -0.2)], [(0.7, 0.12), (0.78, -0.12)]],
    "rabisco": [[(0.06 + 0.82 * t + 0.13 * math.cos(6 * math.pi * t), 0.5 + 0.34 * math.sin(6 * math.pi * t))
                 for t in [i / 40 for i in range(41)]]],
    "cheiro": [[(c + 0.07 * math.sin(4 * math.pi * y), 1 - y) for y in [i / 12 for i in range(13)]] for c in (0.18, 0.5, 0.82)],
    "coroa": [[(0.04, 0.95), (0.08, 0.22), (0.3, 0.62), (0.5, 0.02), (0.7, 0.62), (0.92, 0.22), (0.96, 0.95)],
              [(0.0, 0.92), (0.5, 0.97), (1.0, 0.9)]],
    "x": [[(0.06, 0.08), (0.5, 0.52), (0.95, 0.92)], [(0.9, 0.04), (0.48, 0.5), (0.08, 0.96)]],
    "brilho": [[(0.3, 0.0), (0.3, 0.7)], [(0.0, 0.35), (0.6, 0.35)], [(0.82, 0.55), (0.82, 1.0)], [(0.62, 0.78), (1.0, 0.78)]],
    "alvo": [_espiral(1.7, 0.06, 0.48)],
    "velocidade": [[(0.0, 0.18), (0.8, 0.2)], [(0.14, 0.5), (1.0, 0.5)], [(0.04, 0.82), (0.66, 0.8)]],
}
PONTOS = {"migalhas": [(0.15, 0.7, 0.09), (0.42, 0.4, 0.12), (0.7, 0.75, 0.07), (0.88, 0.3, 0.1), (0.55, 0.05, 0.06)],
          "olho": [(0.5, 0.5, 0.15)]}


def rabisco(nome, x, y, tam, traco, semente=0):
    """Desenha um rabisco na caixa (x, y, tam). Retorna (paths, pontos)."""
    rnd = random.Random(semente)
    ds, pts = [], []
    for linha in RABISCOS.get(nome, []):
        p = [(x + (u + rnd.uniform(-0.02, 0.02)) * tam, y + (v + rnd.uniform(-0.02, 0.02)) * tam) for u, v in linha]
        d, poli = pincelada(p, traco, ataque=0.1, saida=0.6, minimo=0.25)
        ds.append(d)
        pts += poli
    for u, v, r in PONTOS.get(nome, []):
        d, caixa = circulo(x + u * tam, y + v * tam, r * tam)
        ds.append(d)
        pts += caixa
    return ds, pts


# ---------------------------------------------------------------- SVG

def svg(larg, alt, corpo, titulo=""):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" width="{num(larg)}mm" height="{num(alt)}mm" '
            f'viewBox="0 0 {num(larg)} {num(alt)}"><title>{titulo}</title>{corpo}</svg>\n')


def salvar(pasta, nome, conteudo):
    p = SAIDA / pasta
    p.mkdir(parents=True, exist_ok=True)
    (p / f"{nome}.svg").write_text(conteudo, encoding="utf-8")


def tinta(var):
    return CORES["tinta_clara"] if var == "escura" else CORES["tinta_escura"]


class Composicao:
    """Junta peças (paths com cor), gira o conjunto e calcula o tamanho final."""

    def __init__(self):
        self.pecas = []   # (cor, d)
        self.pontos = []

    def add(self, cor, d, pontos):
        self.pecas.append((cor, d))
        self.pontos += pontos

    def texto(self, cor, fonte, txt, tam, x, y, espaco=0.0):
        d, (x0, y0, x1, y1) = fonte.caminho(txt, tam, x, y, espaco)
        self.add(cor, d, [(x0, y0), (x1, y1), (x0, y1), (x1, y0)])
        return x0, y0, x1, y1

    def fechar(self, giro=0.0, margem=2.0, titulo=""):
        xs = [p[0] for p in self.pontos]
        ys = [p[1] for p in self.pontos]
        cx, cy = (min(xs) + max(xs)) / 2, (min(ys) + max(ys)) / 2
        a = math.radians(giro)
        rot = [((x - cx) * math.cos(a) - (y - cy) * math.sin(a), (x - cx) * math.sin(a) + (y - cy) * math.cos(a))
               for x, y in self.pontos]
        x0, y0 = min(p[0] for p in rot), min(p[1] for p in rot)
        x1, y1 = max(p[0] for p in rot), max(p[1] for p in rot)
        W, H = x1 - x0 + 2 * margem, y1 - y0 + 2 * margem
        tx, ty = margem - x0, margem - y0
        grupos = {}
        for cor, d in self.pecas:
            grupos.setdefault(cor, []).append(d)
        corpo = "".join(f'<path fill="{c}" d="{" ".join(ds)}"/>' for c, ds in grupos.items())
        corpo = f'<g transform="translate({num(tx)} {num(ty)}) rotate({num(giro)}) translate({num(-cx)} {num(-cy)})">{corpo}</g>'
        return W, H, svg(W, H, corpo, titulo)


# ---------------------------------------------------------------- frases

def arte_frase(fr, var, larg, alt_max, traco, com_nota=True, semente=0):
    col = DADOS["colecoes"][fr["colecao"]]
    fonte = F[fr.get("fonte", col["fonte"])]
    cor = tinta(var)
    c = Composicao()
    _, (sx0, sy0, sx1, sy1) = fonte.caminho(fr["script"], 100)
    pre = fr.get("pre")
    H100 = sy1 - sy0
    empilhar = pre and ((sx1 - sx0) / H100 > 3.6 or fr.get("empilhar"))
    if empilhar:
        # máquina de escrever em cima, letra à mão embaixo
        tam_pre100 = 0.36 * H100
        _, (px0, py0, px1, py1) = F["maquina"].caminho(pre, tam_pre100)
        esc = min(larg / (sx1 - sx0), alt_max / (H100 * 1.55))
        tam = 100 * esc
        c.texto(ACENTO, F["maquina"], pre, tam_pre100 * esc, -px0 * esc + 0.03 * larg, -py0 * esc)
        topo = (py1 - py0) * esc + 0.1 * H100 * esc
        x0s, y0s, x1s, y1s = c.texto(cor, fonte, fr["script"], tam, -sx0 * esc, topo - sy0 * esc)
        giro = -5
    elif pre:
        # estilo "produzido por": máquina de escrever em vermelho + letra à mão
        tam_pre100 = 0.34 * (sy1 - sy0)
        _, (px0, py0, px1, py1) = F["maquina"].caminho(pre, tam_pre100)
        vao100 = 0.06 * (sy1 - sy0)
        larg100 = (px1 - px0) + vao100 + (sx1 - sx0)
        esc = min(larg / larg100, alt_max / ((sy1 - sy0) * 1.25))
        tam = 100 * esc
        base = -sy0 * esc
        c.texto(ACENTO, F["maquina"], pre, tam_pre100 * esc, -px0 * esc, base)
        xs = ((px1 - px0) + vao100) * esc
        x0s, y0s, x1s, y1s = c.texto(cor, fonte, fr["script"], tam, xs - sx0 * esc, base)
        giro = -3
    else:
        esc = min(larg / (sx1 - sx0), alt_max / ((sy1 - sy0) * 1.35))
        tam = 100 * esc
        base = -sy0 * esc
        x0s, y0s, x1s, y1s = c.texto(cor, fonte, fr["script"], tam, -sx0 * esc, base)
        giro = -6
        # traço vermelho sob a palavra
        ys = base + 0.07 * tam
        Wt = x1s - x0s
        d, p = pincelada([(x0s + 0.04 * Wt, ys + 0.03 * tam), (x0s + 0.4 * Wt, ys + 0.07 * tam),
                          (x0s + 0.8 * Wt, ys + 0.02 * tam), (x1s + 0.03 * Wt, ys - 0.07 * tam)], traco * 1.5)
        c.add(ACENTO, d, p)
        if com_nota and fr.get("nota"):
            tn = 3.7 * traco
            nota = f"({fr['nota']})"
            ln = F["maquina"].largura(nota, tn)
            c.texto(cor, F["maquina"], nota, tn, x1s - ln, max(ys + 0.13 * tam, y1s + 0.01 * tam) + tn * 1.05)
    # rabisco vermelho
    nome = fr.get("doodle")
    if nome:
        H = y1s - y0s
        dt = 0.42 * H if pre else 0.36 * H
        if nome == "velocidade" and not pre:
            dx, dy = x0s - 1.15 * dt, y0s + 0.35 * H
        elif nome == "cheiro":
            dx, dy = (x0s + x1s) / 2 - dt / 2, y0s - 1.05 * dt
        else:
            dx, dy = x1s - 0.2 * dt, y0s - 0.62 * dt
        ds, pts = rabisco(nome, dx, dy, dt, traco, semente)
        for d in ds:
            c.add(ACENTO, d, [])
        c.pontos += pts
    return c.fechar(giro, margem=traco + 1, titulo=fr["frase"])


def gerar_frases():
    for i, fr in enumerate(DADOS["frases"]):
        col = DADOS["colecoes"][fr["colecao"]]
        for var in ("clara", "escura"):
            _, _, s = arte_frase(fr, var, 255, 150, traco=2.6, semente=i)
            salvar("frente", f'{fr["id"]}-{var}', s)
            _, _, s = arte_frase(fr, var, 86, 55, traco=1.15, com_nota=False, semente=i)
            salvar("bolso", f'{fr["id"]}-{var}', s)
            salvar("nuca", f'{fr["id"]}-{var}', verbete(fr, col, var))


def quebrar(fonte, texto, tam, larg):
    linhas, atual = [], ""
    for palavra in texto.split():
        teste = f"{atual} {palavra}".strip()
        if fonte.largura(teste, tam) <= larg or not atual:
            atual = teste
        else:
            linhas.append(atual)
            atual = palavra
    linhas.append(atual)
    return linhas


def aspas(texto):
    return re.sub(r'"([^"]*)"', "“\\1”", texto)


def verbete(fr, col, var):
    v = fr["verbete"]
    cor = tinta(var)
    L, m = 90, 1.0
    c = Composicao()
    y = m + 6
    tam = 7.5
    while F["mono_b"].largura(v["palavra"], tam) + 2 + F["mono_i"].largura(v["classe"], 3.8) > L - 2 * m:
        tam -= 0.25
    _, _, x1, _ = c.texto(cor, F["mono_b"], v["palavra"], tam, m, y)
    c.texto(cor, F["mono_i"], v["classe"], 3.8, x1 + 2, y)
    d, p = pincelada([(m, y + 2.2), (L * 0.5, y + 2.9), (L - m, y + 1.8)], 1.1, minimo=0.3)
    c.add(ACENTO, d, p)
    y += 7.6
    for ln in quebrar(F["mono"], aspas(v["definicao"]), 3.7, L - 2 * m):
        c.texto(cor, F["mono"], ln, 3.7, m, y)
        y += 5
    y += 0.5
    for ln in quebrar(F["mono_i"], f"“{v['exemplo']}”", 3.7, L - 2 * m):
        c.texto(cor, F["mono_i"], ln, 3.7, m, y)
        y += 5
    y += 3
    _, _, ax1, _ = c.texto(cor, F["pincel"], MARCA["nome"], 7, m, y + 1)
    c.texto(ACENTO, F["maquina"], f'· {MARCA["cidade"].lower()}', 3.4, ax1 + 2, y)
    return c.fechar(0, margem=1, titulo=f'Verbete: {fr["frase"]}')[2]


# ---------------------------------------------------------------- costas: listas e turnê

def lista(item, var):
    cor = tinta(var)
    c = Composicao()
    f = F["lista"]
    cap = f.caminho("H", 100)[1]
    cap = cap[3] - cap[1]
    largs = [f.largura(t, 100) for t in item["linhas"]]
    tam = min(230 / max(largs) * 100, 27 / cap * 100)
    capmm = cap * tam / 100
    y = capmm
    for t in item["linhas"]:
        w = f.largura(t, tam)
        c.texto(cor, f, t, tam, -w / 2, y)
        y += capmm * 1.3
    rod = item["rodape"]
    w = F["maquina"].largura(rod, 8)
    c.texto(ACENTO, F["maquina"], rod, 8, -w / 2, y + 6)
    return c.fechar(0, margem=1.5, titulo=item["nome"])[2]


def turne_costas(t, var):
    cor = tinta(var)
    c = Composicao()
    _, (sx0, sy0, sx1, sy1) = F["pincel"].caminho(t["titulo"], 100)
    esc = 230 / (sx1 - sx0)
    tam = 100 * esc
    base = -sy0 * esc
    x0, y0, x1, y1 = c.texto(cor, F["pincel"], t["titulo"], tam, -115 - sx0 * esc, base)
    ys = base + 0.08 * tam
    d, p = pincelada([(x0 + 10, ys + 3), (0, ys + 6), (x1 + 6, ys - 4)], 4)
    c.add(ACENTO, d, p)
    sub = t["subtitulo"]
    w = F["maquina"].largura(sub, 11)
    y = y1 + 22
    c.texto(ACENTO, F["maquina"], sub, 11, -w / 2, y)
    y += 24
    f = F["lista"]
    cap = f.caminho("H", 100)[1]
    tam_l = 15 / ((cap[3] - cap[1]) / 100)
    for data, cidade in t["datas"]:
        wd = F["maquina"].largura(data, 7.5)
        c.texto(ACENTO, F["maquina"], data, 7.5, -62 - wd, y - 1)
        c.texto(cor, f, cidade, tam_l, -52, y)
        y += 23
    return c.fechar(0, margem=2, titulo=t["nome"])[2]


def turne_frente(t, var):
    cor = tinta(var)
    c = Composicao()
    _, (sx0, sy0, sx1, sy1) = F["pincel"].caminho(MARCA["nome"], 100)
    esc = 95 / (sx1 - sx0)
    base = -sy0 * esc
    x0, y0, x1, y1 = c.texto(cor, F["pincel"], MARCA["nome"], 100 * esc, -sx0 * esc, base)
    linha = f'turnê {t["titulo"].lower()} · 2026'
    w = F["maquina"].largura(linha, 4.2)
    c.texto(ACENTO, F["maquina"], linha, 4.2, (x0 + x1) / 2 - w / 2, y1 + 7)
    return c.fechar(-4, margem=1.5, titulo=t["nome"])[2]


# ---------------------------------------------------------------- marca

def assinatura(var, larg, traco, nota=None):
    fr = {"script": MARCA["nome"], "colecao": "saudacao", "frase": MARCA["nome"], "doodle": None,
          "nota": nota, "fonte": "pincel"}
    return arte_frase(fr, var, larg, larg, traco, com_nota=bool(nota))[2]


def gerar_marca():
    for var in ("clara", "escura"):
        cor = tinta(var)
        salvar("marca", f"assinatura-{var}", assinatura(var, 80, 1.1))
        salvar("marca", f"logo-{var}", assinatura(var, 200, 2.4, nota=MARCA["slogan"].rstrip(".")))

        # Selo redondo
        R = 30
        cc = R + 1.5
        c = Composicao()
        c.add(cor, F["maquina"].em_arco(MARCA["nome"].upper(), 6, cc, cc, R - 8.5, True, espaco=1.2), [(0, 0), (2 * cc, 2 * cc)])
        c.add(cor, F["maquina"].em_arco(MARCA["selo"].upper(), 4.6, cc, cc, R - 4.8, False, espaco=0.7), [])
        anel = (f"M{cc - R} {cc} A{R} {R} 0 1 0 {cc + R} {cc} A{R} {R} 0 1 0 {cc - R} {cc} Z "
                f"M{cc - R + 1.2} {cc} A{R - 1.2} {R - 1.2} 0 1 1 {cc + R - 1.2} {cc} A{R - 1.2} {R - 1.2} 0 1 1 {cc - R + 1.2} {cc} Z")
        c.add(cor, anel, [])
        _, (a0, b0, a1, b1) = F["pincel"].caminho("P", 100)
        esc = 26 / (b1 - b0)
        c.texto(cor, F["pincel"], "P", 100 * esc, cc - (a0 + a1) / 2 * esc, cc + 13 - b1 * esc)
        d, p = pincelada([(cc - 11, cc + 11), (cc, cc + 12.5), (cc + 12, cc + 8)], 1.6)
        c.add(ACENTO, d, p)
        salvar("marca", f"selo-{var}", c.fechar(0, margem=0.5, titulo="Selo")[2])

        # Etiqueta da barra
        txt = f'{MARCA["nome"].lower()} · am'
        d, (x0, y0, x1, y1) = F["maquina"].caminho(txt, 5, 0, 0)
        Wt, Ht = (x1 - x0) + 8, 9
        fundo, letra = (CORES["tinta_clara"], CORES["tinta_escura"]) if var == "escura" else (CORES["tinta_escura"], CORES["tinta_clara"])
        d, _ = F["maquina"].caminho(txt, 5, 4 - x0, Ht / 2 - (y0 + y1) / 2)
        salvar("marca", f"etiqueta-barra-{var}",
               svg(Wt, Ht, f'<rect width="{num(Wt)}" height="{Ht}" rx="1" fill="{fundo}"/><path fill="{letra}" d="{d}"/>', "Etiqueta"))

        # Mensagem escondida no avesso
        c = Composicao()
        y = 0
        for i, ln in enumerate(MARCA["avesso"]):
            ultima = i == len(MARCA["avesso"]) - 1
            fonte, tam = (F["pincel"], 13) if ultima else (F["maquina"], 4.6)
            w = fonte.largura(ln, tam)
            y += 9 if ultima else 6.5
            c.texto(ACENTO if ultima else cor, fonte, ln, tam, -w / 2, y)
        salvar("marca", f"avesso-{var}", c.fechar(-3, margem=1, titulo="Avesso")[2])

    for item in DADOS["listas"]:
        for var in ("clara", "escura"):
            salvar("costas", f'{item["id"]}-{var}', lista(item, var))
    t = DADOS["turne"]
    for var in ("clara", "escura"):
        salvar("costas", f"turne-{var}", turne_costas(t, var))
        salvar("frente", f"turne-{var}", turne_frente(t, var))


def gerar_catalogo():
    """Monta catalogo.html a partir do modelo e do frases.json."""
    modelo = (RAIZ / "ferramentas" / "catalogo_modelo.html").read_text(encoding="utf-8")
    dados = json.dumps(DADOS, ensure_ascii=False)
    (RAIZ / "catalogo.html").write_text(modelo.replace("/*DADOS*/null", dados), encoding="utf-8")


if __name__ == "__main__":
    if SAIDA.exists():
        shutil.rmtree(SAIDA)
    gerar_frases()
    gerar_marca()
    gerar_catalogo()
    total = sum(1 for _ in SAIDA.rglob("*.svg"))
    print(f"{total} arquivos SVG em {SAIDA.relative_to(RAIZ.parent)}")
