#!/usr/bin/env python3
"""Gera todas as estampas da marca em SVG (medidas reais em milímetros).

Uso:
    pip install fonttools uharfbuzz brotli
    python3 marca-camisetas/ferramentas/gerar_artes.py

Edite marca-camisetas/dados/frases.json (nome da marca, frases, verbetes, cores)
e rode de novo: todas as artes são refeitas. Depois rode exportar_png.js para
gerar os PNGs em 300 dpi que vão para a gráfica de DTF.

Todo texto vira curva (path), então o arquivo abre igual em qualquer computador,
sem precisar instalar fonte.
"""
import io
import json
import math
import re
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
ESCURO = DADOS["cores"]["escuro"]
CREME = DADOS["cores"]["creme"]

# Tamanhos máximos de impressão (mm)
FRENTE_MAX = (280, 300)   # frente ou costas
BOLSO_MAX = (90, 80)      # peito / bolso
NUCA_LARG = 90            # verbete abaixo da gola
MANGA = 70                # ícones de manga

ARQ_FONTES = {
    "slab": "alfa-slab-one-latin-400-normal.woff",
    "bungee": "bungee-latin-400-normal.woff",
    "chango": "chango-latin-400-normal.woff",
    "ultra": "ultra-latin-400-normal.woff",
    "script": "lobster-latin-400-normal.woff",
    "serif": "libre-baskerville-latin-400-normal.woff",
    "serif_i": "libre-baskerville-latin-400-italic.woff",
    "serif_b": "libre-baskerville-latin-700-normal.woff",
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
        """Texto curvado num círculo (selo). topo=True lê por cima, False por baixo."""
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


# ---------------------------------------------------------------- ornamentos

def onda(x0, larg, y_meio, esp, periodos=3):
    """Faixa ondulada (o banzeiro) como forma fechada."""
    amp = esp * 1.1
    n = 90
    topo, base = [], []
    for i in range(n + 1):
        x = x0 + larg * i / n
        y = y_meio + amp * math.sin(2 * math.pi * periodos * i / n)
        topo.append((x, y - esp / 2))
        base.append((x, y + esp / 2))
    pts = topo + base[::-1]
    d = "M" + " L".join(f"{num(x)} {num(y)}" for x, y in pts) + " Z"
    return d, (x0, y_meio - amp - esp / 2, x0 + larg, y_meio + amp + esp / 2)


def losango(cx, cy, r):
    return f"M{num(cx)} {num(cy - r)} L{num(cx + r * .7)} {num(cy)} L{num(cx)} {num(cy + r)} L{num(cx - r * .7)} {num(cy)} Z"


def brilho(cx, cy, r):
    """Estrela de quatro pontas."""
    k = r * 0.22
    return (f"M{num(cx)} {num(cy - r)} Q{num(cx + k)} {num(cy - k)} {num(cx + r)} {num(cy)} "
            f"Q{num(cx + k)} {num(cy + k)} {num(cx)} {num(cy + r)} "
            f"Q{num(cx - k)} {num(cy + k)} {num(cx - r)} {num(cy)} "
            f"Q{num(cx - k)} {num(cy - k)} {num(cx)} {num(cy - r)} Z")


def ornamento(tipo, B, w, y_topo, esp):
    larg = B * w
    x0 = (B - larg) / 2
    if tipo == "onda":
        return onda(x0, larg, y_topo + esp * 1.6, esp)
    r = larg / 7
    cy = y_topo + r
    if tipo == "losangos":
        d = " ".join([losango(B / 2 - larg / 2 + r * .7, cy, r * .6), losango(B / 2, cy, r),
                      losango(B / 2 + larg / 2 - r * .7, cy, r * .6)])
    else:  # estrelas
        d = " ".join([brilho(B / 2 - larg / 2 + r * .6, cy, r * .6), brilho(B / 2, cy, r),
                      brilho(B / 2 + larg / 2 - r * .6, cy, r * .6)])
    return d, (x0, y_topo, x0 + larg, y_topo + 2 * r)


# ---------------------------------------------------------------- SVG

def svg(larg, alt, corpo, titulo=""):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" '
            f'width="{num(larg)}mm" height="{num(alt)}mm" viewBox="0 0 {num(larg)} {num(alt)}">'
            f"<title>{titulo}</title>{corpo}</svg>\n")


def salvar(pasta, nome, conteudo):
    p = SAIDA / pasta
    p.mkdir(parents=True, exist_ok=True)
    (p / f"{nome}.svg").write_text(conteudo, encoding="utf-8")


def paleta(col, variante):
    escura = variante == "escura"
    return {
        "contorno": CREME if escura else ESCURO,
        "filete": col["filete_escura"] if escura else col["filete_clara"],
        "preench": col["preenchimento"],
        "sombra": col["sombra"],
    }


def letreiro(formas, legendas, pal, o, a, prof, t):
    """Efeito de letreiro de barco: contorno grosso, filete fino e sombra 3D.

    formas: paths que recebem o efeito. legendas: paths de cor única.
    o = contorno (mm, para fora da letra), a = filete, prof = profundidade da sombra,
    t = contorno fino em volta da sombra.
    """
    defs = "".join(f'<path id="f{i}" d="{d}"/>' for i, d in enumerate(formas))
    passo = o * 0.6
    n = max(1, math.ceil(prof / passo))
    vx, vy = 0.55, 0.835
    camadas = []
    usos = lambda i: "".join(f'<use xlink:href="#f{k}" x="{num(vx * prof * i / n)}" y="{num(vy * prof * i / n)}"/>'
                              for k in range(len(formas)))
    if prof > 0:
        camadas.append(f'<g fill="{pal["contorno"]}" stroke="{pal["contorno"]}" stroke-width="{num(2 * o)}" '
                       f'stroke-linejoin="round">{"".join(usos(i) for i in range(n + 1))}</g>')
        camadas.append(f'<g fill="{pal["sombra"]}" stroke="{pal["sombra"]}" stroke-width="{num(2 * (o - t))}" '
                       f'stroke-linejoin="round">{"".join(usos(i) for i in range(1, n + 1))}</g>')
    todos = usos(0)
    camadas.append(f'<g fill="none" stroke="{pal["contorno"]}" stroke-width="{num(2 * o)}" stroke-linejoin="round">{todos}</g>')
    if a > 0:
        camadas.append(f'<g fill="none" stroke="{pal["filete"]}" stroke-width="{num(2 * a)}" stroke-linejoin="round">{todos}</g>')
    camadas.append(f'<g fill="{pal["preench"]}">{todos}</g>')
    for d in legendas:
        camadas.append(f'<path fill="{pal["contorno"]}" d="{d}"/>')
    return f"<defs>{defs}</defs>{''.join(camadas)}"


def compor(linhas, B, fonte_padrao, intervalo, esp_onda):
    """Empilha as linhas centralizadas numa largura B. Retorna formas, legendas e altura."""
    formas, legendas = [], []
    y = 0.0
    for ln in linhas:
        if "orn" in ln:
            y += esp_onda * 0.8  # respiro extra: contorno + sombra da linha de cima
            d, (x0, y0, x1, y1) = ornamento(ln["orn"], B, ln["w"], y, esp_onda)
            formas.append(d)
            y = y1 + intervalo
            continue
        legenda = "legenda" in ln
        if legenda:
            y += esp_onda * 0.9
        texto = ln["legenda"] if legenda else ln["t"]
        fonte = F["serif_i"] if legenda else F[ln.get("f", fonte_padrao)]
        _, (x0, y0, x1, y1) = fonte.caminho(texto, 100)
        esc = B * ln["w"] / (x1 - x0)
        tam = 100 * esc
        base = y - y0 * esc
        x = (B - (x1 - x0) * esc) / 2 - x0 * esc
        d, (bx0, by0, bx1, by1) = fonte.caminho(texto, tam, x, base)
        (legendas if legenda else formas).append(d)
        y = by1 + intervalo * (0.7 if legenda else 1)
    return formas, legendas, y - intervalo


def arte_frase(linhas, fonte_padrao, pal, largmax, altmax, o, a, prof, t, intervalo, esp_onda):
    margem = o + prof + 1.5
    B = largmax - 2 * margem
    for _ in range(12):
        formas, legendas, alt = compor(linhas, B, fonte_padrao, intervalo, esp_onda)
        if alt + 2 * margem <= altmax:
            break
        B *= (altmax - 2 * margem) / alt * 0.995
    W, H = B + 2 * margem, alt + 2 * margem
    corpo = f'<g transform="translate({num(margem)} {num(margem)})">{letreiro(formas, legendas, pal, o, a, prof, t)}</g>'
    return W, H, corpo


# ---------------------------------------------------------------- frases

def gerar_frases():
    for fr in DADOS["frases"]:
        col = DADOS["colecoes"][fr["colecao"]]
        for var in ("clara", "escura"):
            pal = paleta(col, var)
            # Frente / costas: 28 cm de largura
            W, H, corpo = arte_frase(fr["linhas"], col["fonte"], pal, *FRENTE_MAX,
                                     o=2.4, a=0.9, prof=5.5, t=0.8, intervalo=6.5, esp_onda=4.2)
            salvar("frente", f'{fr["id"]}-{var}', svg(W, H, corpo, fr["frase"]))
            # Bolso / peito: 9 cm, efeito simplificado (detalhe pequeno some no DTF)
            # mesmo corpo de letra em todas as linhas (a mais longa ocupa a largura toda)
            fb = F[col["fonte"]]
            largs = [fb.caminho(t, 100)[1] for t in fr["bolso"]]
            largs = [b[2] - b[0] for b in largs]
            linhas_b = [{"t": t, "w": lw / max(largs)} for t, lw in zip(fr["bolso"], largs)]
            W, H, corpo = arte_frase(linhas_b, col["fonte"], pal, *BOLSO_MAX,
                                     o=1.1, a=0, prof=1.8, t=0.5, intervalo=2.6, esp_onda=2)
            salvar("bolso", f'{fr["id"]}-{var}', svg(W, H, corpo, fr["frase"]))
            # Nuca: verbete de dicionário
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
    """Troca aspas retas por aspas tipográficas."""
    return re.sub(r'"([^"]*)"', "\u201c\\1\u201d", texto)


def verbete(fr, col, var):
    v = fr["verbete"]
    cor = CREME if var == "escura" else ESCURO
    destaque = col["preenchimento"]
    L, m = NUCA_LARG, 1.0
    paths = []
    y = m + 6.2
    # palavra + classe gramatical cabem numa linha só; se não couber, diminui
    tam = 8.0
    while F["serif_b"].largura(v["palavra"], tam) + 2.2 + F["serif_i"].largura(v["classe"], tam / 2) > L - 2 * m:
        tam -= 0.25
    d, (_, _, x1, _) = F["serif_b"].caminho(v["palavra"], tam, m, y)
    paths.append(d)
    d, _ = F["serif_i"].caminho(v["classe"], max(3.4, tam / 2), x1 + 2.2, y)
    paths.append(d)
    y += 2.6
    regua = f'<rect x="{num(m)}" y="{num(y)}" width="{num(L - 2 * m)}" height="0.5" fill="{destaque}"/>'
    y += 5.2
    for ln in quebrar(F["serif"], aspas(v["definicao"]), 3.9, L - 2 * m):
        d, _ = F["serif"].caminho(ln, 3.9, m, y)
        paths.append(d)
        y += 5.2
    y += 0.6
    for ln in quebrar(F["serif_i"], f"“{v['exemplo']}”", 3.9, L - 2 * m):
        d, _ = F["serif_i"].caminho(ln, 3.9, m, y)
        paths.append(d)
        y += 5.2
    y += 1.6
    assinatura = f'{MARCA["nome"]}  ·  {MARCA["cidade"].upper()}'
    d, (_, _, ax1, _) = F["bungee"].caminho(assinatura, 3, m + 5, y, espaco=0.35)
    paths.append(d)
    marca = f'<path fill="{destaque}" d="{losango(m + 1.6, y - 1.1, 1.7)}"/>'
    H = y + m + 1
    corpo = f'<g fill="{cor}">' + "".join(f'<path d="{p}"/>' for p in paths) + f"</g>{regua}{marca}"
    return svg(L, H, corpo, f'Verbete: {fr["frase"]}')


# ---------------------------------------------------------------- marca

def gerar_marca():
    col = {"preenchimento": "#F2B632", "sombra": "#1F5C45",
           "filete_clara": CREME, "filete_escura": "#1F5C45"}
    for var in ("clara", "escura"):
        pal = paleta(col, var)
        escura = var == "escura"
        cont = pal["contorno"]

        # Logotipo
        linhas = [{"t": MARCA["nome"], "f": "slab", "w": 1},
                  {"legenda": MARCA["slogan"], "w": 0.42}]
        W, H, corpo = arte_frase(linhas, "slab", pal, 200, 120, o=2, a=0.8, prof=4.5, t=0.7,
                                 intervalo=4.5, esp_onda=4.5)
        salvar("marca", f"logo-{var}", svg(W, H, corpo, MARCA["nome"]))

        # Selo redondo: "feito no Amazonas" (barra, manga ou etiqueta)
        R = 30
        c = R + 1.5
        topo = F["bungee"].em_arco(MARCA["nome"], 6.2, c, c, R - 7.8, topo=True, espaco=0.5)
        baixo = F["bungee"].em_arco(MARCA["selo"], 4.4, c, c, R - 4.6, topo=False, espaco=0.35)
        corpo = (f'<circle cx="{c}" cy="{c}" r="{R}" fill="{CREME if escura else "#F6EBD3"}" stroke="{cont}" stroke-width="2"/>'
                 f'<circle cx="{c}" cy="{c}" r="{R - 3}" fill="none" stroke="{ESCURO}" stroke-width="0.6"/>'
                 f'<path fill="{ESCURO}" d="{topo} {baixo}"/>'
                 f'<path fill="#E0442F" d="{losango(c - R + 6.5, c, 1.6)} {losango(c + R - 6.5, c, 1.6)}"/>'
                 f'<g transform="translate({num(c - 13)} {num(c - 13)}) scale({num(26 / 70)})">{icone_encontro(ESCURO)}</g>')
        salvar("marca", f"selo-{var}", svg(2 * c, 2 * c, corpo, "Selo Feito no Amazonas"))

        # Etiqueta da barra (lateral, perto da costura sem passar por cima)
        txt = MARCA["nome"]
        d, (x0, y0, x1, y1) = F["bungee"].caminho(txt, 5.2, 0, 0, espaco=0.5)
        Wt, Ht = (x1 - x0) + 9, 10
        fundo, letra = (CREME, ESCURO) if escura else (ESCURO, CREME)
        d, _ = F["bungee"].caminho(txt, 5.2, 4.5 - x0, Ht / 2 - (y0 + y1) / 2, espaco=0.5)
        corpo = (f'<rect width="{num(Wt)}" height="{Ht}" rx="1.6" fill="{fundo}"/>'
                 f'<path fill="{letra}" d="{d}"/>'
                 f'<path fill="#F2B632" d="{losango(2.2, Ht / 2, 1.3)} {losango(Wt - 2.2, Ht / 2, 1.3)}"/>')
        salvar("marca", f"etiqueta-barra-{var}", svg(Wt, Ht, corpo, "Etiqueta da barra"))

        # Mensagem escondida no avesso
        cor = CREME if escura else ESCURO
        paths, y = [], 1.5
        for i, ln in enumerate(MARCA["avesso"]):
            fonte = F["script"] if i == len(MARCA["avesso"]) - 1 else F["serif_i"]
            tam = 9 if fonte is F["script"] else 5
            larg = fonte.largura(ln, tam)
            _, (_, by0, _, by1) = fonte.caminho(ln, tam)
            d, _ = fonte.caminho(ln, tam, (80 - larg) / 2, y - by0)
            paths.append(d)
            y += (by1 - by0) + 2.4
        corpo = f'<path fill="{cor}" d="{" ".join(paths)}"/>'
        salvar("marca", f"avesso-{var}", svg(80, y, corpo, "Mensagem no avesso"))

        # Ícones de manga
        for nome, func in ICONES.items():
            corpo = func(cont)
            salvar("manga", f"{nome}-{var}", svg(MANGA, MANGA, corpo, nome))


# ---------------------------------------------------------------- ícones (70 x 70 mm)

def icone_guarana(c):
    folha = (f'<path d="M35 64 C20 58 10 44 12 26 C24 30 34 42 35 64 Z" fill="#3E8A4A" stroke="{c}" stroke-width="1.4" stroke-linejoin="round"/>'
             f'<path d="M35 64 C50 58 60 44 58 26 C46 30 36 42 35 64 Z" fill="#2F7040" stroke="{c}" stroke-width="1.4" stroke-linejoin="round"/>'
             f'<path d="M35 8 C34 20 35 30 35 40" fill="none" stroke="{c}" stroke-width="1.6" stroke-linecap="round"/>')
    frutas = ""
    for x, y, r in ((24, 28, 11), (46, 28, 11), (35, 45, 12)):
        frutas += (f'<circle cx="{x}" cy="{y}" r="{r}" fill="#D63A2E" stroke="{c}" stroke-width="1.4"/>'
                   f'<path d="M{x - r * .55} {y - r * .1} Q{x} {y - r * 1.05} {x + r * .55} {y - r * .1} Q{x + r * .7} {y + r * .7} {x} {y + r * .78} Q{x - r * .7} {y + r * .7} {x - r * .55} {y - r * .1} Z" fill="#FFF6DF" stroke="{c}" stroke-width="1"/>'
                   f'<circle cx="{x}" cy="{y + r * .18}" r="{r * .38}" fill="#1B1A17"/>'
                   f'<circle cx="{x - r * .13}" cy="{y + r * .05}" r="{r * .1}" fill="#FFF6DF"/>')
    return folha + frutas


def icone_vitoria_regia(c):
    cx, cy, R = 31, 42, 25
    a1, a2 = math.radians(80), math.radians(100)
    p1 = (cx + R * math.cos(a1), cy + R * math.sin(a1))
    p2 = (cx + R * math.cos(a2), cy + R * math.sin(a2))
    folha = f'M{cx} {cy} L{num(p1[0])} {num(p1[1])} A{R} {R} 0 1 0 {num(p2[0])} {num(p2[1])} Z'
    r2 = R - 2.2
    q1 = (cx + r2 * math.cos(a1 - .06), cy + r2 * math.sin(a1 - .06))
    q2 = (cx + r2 * math.cos(a2 + .06), cy + r2 * math.sin(a2 + .06))
    borda = f'M{num(q1[0])} {num(q1[1])} A{r2} {r2} 0 1 0 {num(q2[0])} {num(q2[1])}'
    nervuras = "".join(
        f'<line x1="{cx}" y1="{cy}" x2="{num(cx + 19 * math.cos(math.radians(g)))}" y2="{num(cy + 19 * math.sin(math.radians(g)))}"/>'
        for g in range(110, 440, 30))
    petalas = "".join(
        f'<ellipse cx="53" cy="15.5" rx="3.6" ry="8.5" transform="rotate({g} 53 21)" fill="#F4A6C0" stroke="{c}" stroke-width="1"/>'
        for g in range(-70, 80, 35))
    return (f'<path d="{folha}" fill="#5E9E3A" stroke="{c}" stroke-width="1.4" stroke-linejoin="round"/>'
            f'<path d="{borda}" fill="none" stroke="#A8C64A" stroke-width="2.6"/>'
            f'<g stroke="#2F6A2A" stroke-width="0.8" stroke-linecap="round">{nervuras}</g>'
            f'{petalas}<circle cx="53" cy="21" r="3.4" fill="#F2B632" stroke="{c}" stroke-width="1"/>')


def icone_tucunare(c):
    corpo = ("M5 36 C9 24 28 18 48 25 C51 26.5 53 29 54.5 32 L65 22 C62.5 29 62.5 41 65 48 "
             "L54.5 39 C53 42 51 44.5 48 46 C28 53 9 48 5 36 Z")
    return (f'<defs><clipPath id="tc"><path d="{corpo}"/></clipPath></defs>'
            f'<path d="M20 24 C26 11 40 11 48 25 Z" fill="#7C8F2E" stroke="{c}" stroke-width="1.3" stroke-linejoin="round"/>'
            f'<path d="M28 48 C32 56 40 56 44 46 Z" fill="#E0442F" stroke="{c}" stroke-width="1.3" stroke-linejoin="round"/>'
            f'<path d="{corpo}" fill="#D9C23D"/>'
            f'<g clip-path="url(#tc)"><path d="M5 40 C20 50 40 50 56 40 L56 60 L5 60 Z" fill="#F2DC7A"/>'
            f'<rect x="19" y="10" width="4.5" height="40" rx="2" fill="#2E4A2A"/>'
            f'<rect x="31" y="10" width="4.5" height="40" rx="2" fill="#2E4A2A"/>'
            f'<rect x="42.5" y="10" width="4" height="40" rx="2" fill="#2E4A2A"/></g>'
            f'<path d="{corpo}" fill="none" stroke="{c}" stroke-width="1.4" stroke-linejoin="round"/>'
            f'<circle cx="58.3" cy="35" r="3.8" fill="#1B1A17" stroke="#F2B632" stroke-width="1.4"/>'
            f'<path d="M38 36 C40 39 41 41 39 44 C36 42 35 39 38 36 Z" fill="#E0442F" stroke="{c}" stroke-width="0.9"/>'
            f'<circle cx="12.5" cy="32.5" r="2.8" fill="#E0442F" stroke="{c}" stroke-width="0.9"/>'
            f'<circle cx="12.2" cy="32.4" r="1.2" fill="#1B1A17"/>'
            f'<path d="M5.5 37.5 L10 37" stroke="{c}" stroke-width="1" stroke-linecap="round"/>')


def icone_encontro(c):
    cx, cy, R = 35, 35, 30
    div = f"M{cx} {cy - R} C{cx - 12} {cy - 18} {cx + 12} {cy - 8} {cx} {cy} C{cx - 12} {cy + 8} {cx + 12} {cy + 18} {cx} {cy + R}"
    esquerda = f"{div} A{R} {R} 0 0 1 {cx} {cy - R} Z"
    ondas = lambda x, cor: "".join(
        f'<path d="M{x - 7} {y} q3.5 -2.4 7 0 t7 0" fill="none" stroke="{cor}" stroke-width="1.1" stroke-linecap="round"/>'
        for y in (20, 34, 48))
    return (f'<circle cx="{cx}" cy="{cy}" r="{R}" fill="#C7843E"/>'
            f'<path d="{esquerda}" fill="#1B1A17"/>'
            f'{ondas(20, "#FFF6DF")}{ondas(50, "#8A5523")}'
            f'<path d="{div}" fill="none" stroke="#FFF6DF" stroke-width="1"/>'
            f'<circle cx="{cx}" cy="{cy}" r="{R}" fill="none" stroke="{c}" stroke-width="1.6"/>')


def icone_cupula(c):
    cx, base, topo, rx = 35, 44, 13, 23
    h = base - topo
    cores = ["#2E8B57", "#F2B632", "#2F6FA8", "#F2B632"] * 3
    ss = [math.sin(math.radians(g)) for g in range(-90, 91, 20)]
    gomos = ""

    def lado(s, subir):
        a = abs(rx * s)
        if a < 0.01:
            return f"L{cx} {topo}" if subir else f"L{cx} {base}"
        if subir:
            return f"A{num(a)} {h} 0 0 {1 if s < 0 else 0} {cx} {topo}"
        return f"A{num(a)} {h} 0 0 {0 if s < 0 else 1} {num(cx + rx * s)} {base}"

    for i in range(len(ss) - 1):
        s1, s2 = ss[i], ss[i + 1]
        d = f"M{num(cx + rx * s1)} {base} {lado(s1, True)} {lado(s2, False)} Z"
        gomos += f'<path d="{d}" fill="{cores[i]}"/>'
    janelas = "".join(f'<rect x="{x}" y="54" width="3" height="5" rx="1.5" fill="#FFF6DF" stroke="{c}" stroke-width="0.6"/>'
                      for x in (15, 22, 29, 38, 45, 52))
    colunas = "".join(f'<line x1="{x}" y1="45" x2="{x}" y2="51" stroke="{c}" stroke-width="0.8"/>' for x in range(16, 56, 6))
    return (f'<rect x="31.5" y="4" width="7" height="6" fill="#F6EBD3" stroke="{c}" stroke-width="1.1"/>'
            f'<path d="M30.5 4.5 Q35 -0.5 39.5 4.5 Z" fill="#2E8B57" stroke="{c}" stroke-width="1"/>'
            f'<rect x="29" y="10" width="12" height="3.4" fill="#F6EBD3" stroke="{c}" stroke-width="1"/>'
            f'{gomos}<path d="M{cx - rx} {base} A{rx} {h} 0 0 1 {cx + rx} {base} Z" fill="none" stroke="{c}" stroke-width="1.4"/>'
            f'<rect x="10" y="44" width="50" height="8" fill="#E9A7B5" stroke="{c}" stroke-width="1.3"/>{colunas}'
            f'<rect x="6" y="52" width="58" height="10" fill="#E9A7B5" stroke="{c}" stroke-width="1.3"/>{janelas}'
            f'<rect x="4" y="62" width="62" height="3" fill="#F6EBD3" stroke="{c}" stroke-width="1.1"/>')


def icone_boto(c):
    corpo = ("M14 50 C16 34 30 21 48 19.5 C54 19 58 21.5 60.5 24.5 L68 29 C68.6 30.6 67.6 31.8 65.6 31.6 "
             "L58 30.6 C46 31 33 38 23 52 Z")
    cauda = "M18.5 51 C12 53 8 57 5 63 C11 61.5 15 60.5 18 57.5 C20 61 24 63.5 30 64.5 C26 60 22.5 55 18.5 51 Z"
    nadadeira = "M42 30 C40.5 36 38.5 40 35 43 C42 41.5 46 37 46.5 31 Z"
    agua = onda(2, 66, 62, 3.4, periodos=3)[0]
    return (f'<path d="{agua}" fill="#4FA3C7" stroke="{c}" stroke-width="1.2" stroke-linejoin="round"/>'
            f'<path d="{cauda}" fill="#E9799A" stroke="{c}" stroke-width="1.3" stroke-linejoin="round"/>'
            f'<path d="{corpo}" fill="#F28BA8" stroke="{c}" stroke-width="1.4" stroke-linejoin="round"/>'
            f'<path d="M26 44 C34 35 44 31 56 30.8" fill="none" stroke="#FFD0DC" stroke-width="1.4" stroke-linecap="round"/>'
            f'<path d="{nadadeira}" fill="#E9799A" stroke="{c}" stroke-width="1.2" stroke-linejoin="round"/>'
            f'<circle cx="56.5" cy="25.2" r="1.3" fill="#1B1A17"/>'
            f'<circle cx="62" cy="13" r="1.6" fill="#4FA3C7" stroke="{c}" stroke-width="0.8"/>'
            f'<circle cx="66" cy="18" r="1.1" fill="#4FA3C7" stroke="{c}" stroke-width="0.8"/>')


ICONES = {
    "guarana": icone_guarana,
    "vitoria-regia": icone_vitoria_regia,
    "tucunare": icone_tucunare,
    "encontro-das-aguas": icone_encontro,
    "teatro-amazonas": icone_cupula,
    "boto": icone_boto,
}


def gerar_catalogo():
    """Monta catalogo.html (vitrine com as camisas) a partir do modelo e do frases.json."""
    modelo = (RAIZ / "ferramentas" / "catalogo_modelo.html").read_text(encoding="utf-8")
    dados = json.dumps(DADOS, ensure_ascii=False)
    pagina = modelo.replace("/*DADOS*/null", dados).replace("Catálogo Pavulagem", f"Catálogo {MARCA['nome'].title()}")
    (RAIZ / "catalogo.html").write_text(pagina, encoding="utf-8")


if __name__ == "__main__":
    gerar_frases()
    gerar_marca()
    gerar_catalogo()
    total = sum(1 for _ in SAIDA.rglob("*.svg"))
    print(f"{total} arquivos SVG em {SAIDA.relative_to(RAIZ.parent)}")
