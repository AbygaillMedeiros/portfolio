#!/usr/bin/env python3
"""Mockups realistas: camisa de algodão estendida (flat lay) com a estampa aplicada.

Desenha a camisa com dobras, textura de malha, gola canelada, costuras e sombra,
e aplica o PNG da arte acompanhando as dobras e a luz do tecido.

Uso (depois de gerar_artes.py e exportar_png.js):
    pip install numpy scipy pillow fonttools brotli
    python3 marca-camisetas/ferramentas/gerar_mockups.py

Saída:
    mockups/preta/<id>.jpg e mockups/offwhite/<id>.jpg  (uma camisa por imagem)
    mockups/folhas/folha-NN.jpg                           (4 camisas por imagem)
"""
import io
import json
import math
from pathlib import Path

import numpy as np
from fontTools.ttLib import TTFont
from PIL import Image, ImageDraw, ImageFilter, ImageFont
from scipy import ndimage as ndi

RAIZ = Path(__file__).resolve().parent.parent
PNG = RAIZ / "artes" / "png"
SAIDA = RAIZ / "mockups"
DADOS = json.loads((RAIZ / "dados" / "frases.json").read_text(encoding="utf-8"))

T = 1200                 # lado de cada imagem (px)
K = T / 1000             # geometria desenhada num espaço 1000 x 1000
PEITO_CM = 52            # largura da camisa M de axila a axila
PX_CM = (724 - 276) * K / PEITO_CM

CAMISAS = {
    "preta": {"nome": "camisa preta", "cor": (31, 31, 33), "fundo": (196, 191, 182), "var": "escura"},
    "offwhite": {"nome": "camisa off-white", "cor": (233, 229, 219), "fundo": (150, 144, 134), "var": "clara"},
}


# ------------------------------------------------------------------ geometria

def curva(pts, n=40):
    """Curva suave (Catmull-Rom) pelos pontos."""
    pts = np.array(pts, float)
    if len(pts) == 2:
        t = np.linspace(0, 1, n)[:, None]
        return pts[0] * (1 - t) + pts[1] * t
    p = np.vstack([pts[0], pts, pts[-1]])
    out = []
    for i in range(1, len(p) - 2):
        p0, p1, p2, p3 = p[i - 1], p[i], p[i + 1], p[i + 2]
        for t in np.linspace(0, 1, n, endpoint=False):
            out.append(0.5 * (2 * p1 + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t * t
                              + (-p0 + 3 * p1 - 3 * p2 + p3) * t ** 3))
    out.append(pts[-1])
    return np.array(out)


def espelho(pts):
    return [(1000 - x, y) for x, y in pts]


def silhueta(costas=False):
    """Contorno da camisa (espaço 1000) e curvas da gola."""
    nr, sr, mo, mi, ax, hr = (582, 150), (735, 186), (912, 350), (828, 446), (726, 368), (733, 838)
    lado_dir = [curva([nr, (660, 164), sr]), curva([sr, (826, 260), mo]), curva([mo, (870, 398), mi]),
                curva([mi, (774, 404), ax]), curva([ax, (739, 520), (730, 680), hr])]
    barra = curva([hr, (500, 846), espelho([hr])[0]])
    lado_esq = [np.array(espelho(seg[::-1].tolist())) for seg in lado_dir[::-1]]
    gola_costas = curva([espelho([nr])[0], (500, 162), nr])
    gola_frente = curva([espelho([nr])[0], (442, 196), (500, 206), (558, 196), nr])
    contorno = np.vstack(lado_dir + [barra] + lado_esq + [gola_costas])
    return {"contorno": contorno, "gola_costas": gola_costas, "gola_frente": None if costas else gola_frente,
            "barra": barra, "punho_d": lado_dir[2], "punho_e": lado_esq[2],
            "cava_d": curva([sr, (714, 276), ax]), "cava_e": curva(espelho([sr, (714, 276), ax]))}


def rasterizar(desenho, largura=None, fechado=True):
    """Desenha polígono (ou linha grossa) em 2x e reduz, para borda suave."""
    im = Image.new("L", (2 * T, 2 * T), 0)
    d = ImageDraw.Draw(im)
    for pts, w in desenho:
        xy = [(float(x) * 2 * K, float(y) * 2 * K) for x, y in pts]
        if w is None:
            d.polygon(xy, fill=255)
        else:
            d.line(xy, fill=255, width=max(1, int(w * 2 * K)), joint="curve")
    return np.asarray(im.resize((T, T), Image.LANCZOS), np.float32) / 255


def tracejado(pts, traco=7, vazio=5):
    """Divide uma linha em pedaços (pesponto)."""
    pts = np.asarray(pts)
    seg = np.diff(pts, axis=0)
    dist = np.concatenate([[0], np.cumsum(np.hypot(seg[:, 0], seg[:, 1]))])
    pedacos, s = [], 0.0
    while s < dist[-1]:
        e = min(s + traco, dist[-1])
        idx = (dist >= s) & (dist <= e)
        if idx.sum() >= 2:
            pedacos.append(pts[idx])
        s = e + vazio
    return pedacos


def deslocar(pts, dx=0.0, dy=0.0, normal=0.0):
    pts = np.asarray(pts, float)
    if normal:
        tg = np.gradient(pts, axis=0)
        n = np.stack([-tg[:, 1], tg[:, 0]], 1)
        n /= np.linalg.norm(n, axis=1, keepdims=True) + 1e-9
        pts = pts + n * normal
    return pts + [dx, dy]


# ------------------------------------------------------------------ tecido

def ruido(rng, sigma, forma=(T, T)):
    r = ndi.gaussian_filter(rng.standard_normal(forma).astype(np.float32), sigma)
    return r / (r.std() + 1e-9)


def dobras(rng, Y, X, costas):
    """Mapa de altura das dobras (em px)."""
    H = np.zeros((T, T), np.float32)
    lista = [
        # axilas puxando para o peito
        (668, 428, 142, 170, 13, .9), (690, 470, 150, 150, 11, -.6), (332, 428, 38, 170, 13, .9), (310, 470, 30, 150, 11, -.6),
        # mangas
        (812, 302, 44, 120, 9, .7), (845, 352, 40, 70, 8, -.5), (188, 302, 136, 120, 9, .7), (155, 352, 140, 70, 8, -.5),
        # barra
        (420, 795, 3, 170, 12, .6), (610, 780, -6, 150, 11, -.5), (520, 815, 0, 260, 9, .4),
        # corpo, dobras largas
        (430, 560, 75, 320, 38, .7), (600, 640, 100, 300, 42, -.6), (500, 430, 10, 340, 30, .4),
    ]
    if not costas:
        lista += [(470, 252, 105, 70, 7, .35), (532, 250, 75, 70, 7, .35)]
    for cx, cy, ang, comp, sig, amp in lista:
        cx += rng.uniform(-25, 25)
        cy += rng.uniform(-20, 20)
        ang = math.radians(ang + rng.uniform(-12, 12))
        amp *= rng.uniform(0.7, 1.3)
        u = (X - cx * K) * math.cos(ang) + (Y - cy * K) * math.sin(ang)
        v = -(X - cx * K) * math.sin(ang) + (Y - cy * K) * math.cos(ang)
        janela = np.clip(1 - (u / (comp * K / 2)) ** 2, 0, 1) ** 1.5
        H += amp * 13 * np.exp(-(v / (sig * K)) ** 2) * janela
    return H


def camisa(cor_id, costas=False, semente=0):
    """Retorna (rgb float, máscara, luz, textura, gradiente da altura) da camisa sem estampa."""
    rng = np.random.default_rng(semente)
    cfg = CAMISAS[cor_id]
    g = silhueta(costas)
    mask = rasterizar([(g["contorno"], None)])
    Y, X = np.mgrid[0:T, 0:T].astype(np.float32)

    dist = ndi.distance_transform_edt(mask > 0.5).astype(np.float32)
    H = 12 * (1 - np.exp(-dist / (34 * K)))                     # tecido "estufado" no meio
    H += dobras(rng, Y, X, costas) + 1.1 * ruido(rng, 70)       # dobras + ondulação geral
    H += 0.12 * ruido(rng, 6)
    gy, gx = np.gradient(ndi.gaussian_filter(H, 1.2))
    luz = np.array([-0.42, -0.62, 0.66])
    luz /= np.linalg.norm(luz)
    n = np.stack([-gx, -gy, np.ones_like(gx)], -1)
    n /= np.linalg.norm(n, axis=-1, keepdims=True)
    S = np.clip(n @ luz, 0, 1) / luz[2]
    S = 0.25 + 0.75 * S
    S *= 1 - 0.28 * np.exp(-dist / (5 * K))                     # borda mais escura
    S *= 1 + 0.04 * ruido(rng, 140)                             # luz irregular do ambiente
    S *= 1 + 0.10 * (-(X - T / 2) / T - (Y - T / 2) / T)        # luz vindo de cima, à esquerda

    # malha do algodão
    malha = 1 + 0.03 * ruido(rng, 0.6) + 0.012 * np.sin(2 * math.pi * X / 2.6) * (1 + 0.5 * ruido(rng, 3))
    tex = malha.astype(np.float32)

    # gola: parte de dentro (escura) + ribana canelada
    gc = g["gola_costas"]
    ribana = rasterizar([(gc, 15)])
    if g["gola_frente"] is not None:
        gf = g["gola_frente"]
        dentro = rasterizar([(np.vstack([gc, gf[::-1]]), None)])
        S *= 1 - (0.5 if cor_id == "preta" else 0.3) * dentro * (0.8 + 0.2 * (Y - 150 * K) / (60 * K))
        rib_f = rasterizar([(deslocar(gf, dy=6), 15)])
        sombra_gola = ndi.gaussian_filter(np.roll(rib_f, int(7 * K), axis=0), 4) * (1 - rib_f)
        S *= 1 - 0.35 * sombra_gola
        ribana = np.maximum(ribana * (1 - rib_f), rib_f)
    ang = np.arctan2(Y - 40 * K, X - 500 * K)
    canelado = 1 + 0.09 * np.sin(ang * 420)
    S = S * (1 - ribana) + ribana * S * canelado * 1.04
    tex = tex * (1 - ribana) + ribana

    # costuras e pespontos
    linhas = []
    for nome in ("cava_d", "cava_e"):
        linhas.append((g[nome], 1.1))
    marcas = rasterizar(linhas)
    S *= 1 - 0.32 * marcas
    S *= 1 + 0.18 * np.roll(marcas, 2, axis=1) * (1 - marcas)
    pesp = []
    for base, off in ((g["barra"], -26), (g["barra"], -32)):
        pesp += [(p, 0.9) for p in tracejado(deslocar(base, dy=off), 6, 3)]
    for nome, sinal in (("punho_d", 1), ("punho_e", -1)):
        pesp += [(p, 0.9) for p in tracejado(deslocar(g[nome], normal=22 * sinal), 6, 3)]
    pesp += [(p, 0.8) for p in tracejado(deslocar(gc, dy=11), 5, 3)]
    pp = rasterizar(pesp)
    S *= 1 - 0.22 * pp
    S *= 1 + 0.08 * ndi.gaussian_filter(rasterizar([(deslocar(g["barra"], dy=-29), 9)]), 2)

    base = np.array(cfg["cor"], np.float32)
    rgb = base[None, None, :] * (S * tex)[..., None]
    brilho = np.clip(S - 1.0, 0, None) ** 1.4
    rgb += (38 if cor_id == "preta" else 10) * brilho[..., None]
    if cor_id == "preta":
        rgb += 30 * (S - 1)[..., None] * tex[..., None]        # dobras aparecem no tecido escuro
    return rgb, mask, S, tex, (gx, gy), dist


def fundo(cor_id, semente):
    rng = np.random.default_rng(semente + 99)
    cor = np.array(CAMISAS[cor_id]["fundo"], np.float32)
    v = 1 + 0.018 * ruido(rng, 120) + 0.012 * ruido(rng, 5) + 0.03 * ruido(rng, 0.8)
    Y, X = np.mgrid[0:T, 0:T].astype(np.float32)
    vinheta = 1 - 0.22 * (((X - T / 2) / T) ** 2 + ((Y - T / 2) / T) ** 2) * 2
    return cor[None, None, :] * (v * vinheta)[..., None]


# ------------------------------------------------------------------ estampa

def colar(alvo, arte, cx, topo, larg_cm, giro=0.0):
    """Coloca a arte (RGBA) num canvas T x T, centrada em cx, começando em 'topo'."""
    w = max(2, int(round(larg_cm * PX_CM)))
    h = max(2, int(round(arte.height * w / arte.width)))
    a = arte.resize((w, h), Image.LANCZOS)
    if giro:
        a = a.rotate(giro, resample=Image.BICUBIC, expand=True)
    alvo.alpha_composite(a, (int(cx - a.width / 2), int(topo - (a.height - h) / 2)))


def aplicar(rgb, mask, S, tex, grad, camada):
    gx, gy = grad
    arr = np.asarray(camada, np.float32) / 255
    Y, X = np.mgrid[0:T, 0:T].astype(np.float32)
    desloc = 9.0
    coords = [Y + desloc * gy, X + desloc * gx]
    arr = np.stack([ndi.map_coordinates(arr[..., c], coords, order=1) for c in range(4)], -1)
    alfa = arr[..., 3] * mask * 0.97
    luz = (S ** 0.9) * (tex ** 0.7)
    tinta = arr[..., :3] * 255 * luz[..., None]
    tinta += 14 * np.clip(S - 1, 0, None)[..., None]           # brilho leve do filme DTF
    return rgb * (1 - alfa[..., None]) + tinta * alfa[..., None]


def png(pasta, nome):
    return Image.open(PNG / pasta / f"{nome}.png").convert("RGBA")


def mockup(design, cor_id, semente):
    var = CAMISAS[cor_id]["var"]
    costas = design["vista"] == "costas"
    rgb, mask, S, tex, grad, dist = camisa(cor_id, costas, semente)
    camada = Image.new("RGBA", (T, T), (0, 0, 0, 0))
    gola_y = (162 if costas else 206) * K
    if costas:
        colar(camada, png("costas", f'{design["id"]}-{var}'), 500 * K, gola_y + 9 * PX_CM, design.get("larg", 25))
    else:
        colar(camada, png(design["pasta"], f'{design["id"]}-{var}'), 500 * K, gola_y + 7 * PX_CM, design.get("larg", 27))
        colar(camada, png("marca", f"assinatura-{var}"), 812 * K, 318 * K, 7.5, giro=-46)
        colar(camada, png("marca", f"etiqueta-barra-{var}"), 330 * K, 790 * K, 5)
    rgb = aplicar(rgb, mask, S, tex, grad, camada)

    bg = fundo(cor_id, semente)
    sombra = ndi.gaussian_filter(np.roll(np.roll(mask, int(10 * K), 0), int(6 * K), 1), 16 * K)
    contato = ndi.gaussian_filter(np.roll(mask, int(3 * K), 0), 3 * K)
    bg *= (1 - 0.42 * sombra - 0.25 * contato)[..., None]
    out = bg * (1 - mask[..., None]) + rgb * mask[..., None]
    im = Image.fromarray(np.clip(out, 0, 255).astype(np.uint8))
    rng = np.random.default_rng(semente)
    giro = rng.uniform(-2.2, 2.2)
    grande = im.resize((int(T * 1.06), int(T * 1.06)), Image.LANCZOS).rotate(giro, Image.BICUBIC)
    m = (grande.width - T) // 2
    return grande.crop((m, m, m + T, m + T))


# ------------------------------------------------------------------ folhas com 4 camisas

def fonte_legenda(tam):
    destino = SAIDA / ".fonte-legenda.ttf"
    if not destino.exists():
        tt = TTFont(RAIZ / "ferramentas" / "fontes" / "courier-prime-latin-400-normal.woff")
        tt.flavor = None
        destino.parent.mkdir(parents=True, exist_ok=True)
        tt.save(destino)
    return ImageFont.truetype(str(destino), tam)


def folha(itens, numero):
    lado = T
    im = Image.new("RGB", (2 * lado, 2 * lado + 70), (24, 24, 24))
    f = fonte_legenda(30)
    d = ImageDraw.Draw(im)
    for i, (img, legenda) in enumerate(itens):
        x, y = (i % 2) * lado, (i // 2) * lado
        im.paste(img, (x, y))
        d.rectangle([x + 24, y + lado - 70, x + 34 + d.textlength(legenda, font=f) + 10, y + lado - 26], fill=(20, 20, 20))
        d.text((x + 34, y + lado - 66), legenda, font=f, fill=(240, 236, 228))
    rod = f"{DADOS['marca']['nome']} · mockups · folha {numero:02d}"
    d.text((30, 2 * lado + 18), rod, font=f, fill=(200, 196, 188))
    caminho = SAIDA / "folhas" / f"folha-{numero:02d}.jpg"
    caminho.parent.mkdir(parents=True, exist_ok=True)
    im.save(caminho, quality=88)
    return caminho


def designs():
    out = [{"id": fr["id"], "nome": fr["frase"], "pasta": "frente", "vista": "frente"} for fr in DADOS["frases"]]
    out += [{"id": l["id"], "nome": l["nome"], "vista": "costas", "larg": 20} for l in DADOS["listas"]]
    out.append({"id": "turne", "nome": DADOS["turne"]["nome"], "vista": "costas", "larg": 26})
    return out


def miniaturas():
    """Cópias menores (760 px) para o catálogo carregar rápido no celular."""
    for cor_id in CAMISAS:
        for arq in sorted((SAIDA / cor_id).glob("*.jpg")):
            destino = SAIDA / "web" / cor_id / arq.name
            destino.parent.mkdir(parents=True, exist_ok=True)
            Image.open(arq).resize((760, 760), Image.LANCZOS).save(destino, quality=80)


if __name__ == "__main__":
    import sys
    so = sys.argv[1:]
    lista = [d for d in designs() if not so or d["id"] in so]
    feitos = {}
    for i, dz in enumerate(lista):
        for cor_id in CAMISAS:
            img = mockup(dz, cor_id, semente=i * 7 + (cor_id == "preta"))
            p = SAIDA / cor_id / f'{dz["id"]}.jpg'
            p.parent.mkdir(parents=True, exist_ok=True)
            img.save(p, quality=86)
            feitos[(dz["id"], cor_id)] = img
        print("ok", dz["id"])
    if not so:
        # 4 camisas por folha, alternando preta e off-white
        cores = ["preta", "offwhite", "offwhite", "preta"]
        n = 0
        for k in range(0, len(lista), 4):
            grupo = lista[k:k + 4]
            itens = [(feitos[(dz["id"], cores[j])], f'{dz["nome"]} · {CAMISAS[cores[j]]["nome"]}')
                     for j, dz in enumerate(grupo)]
            j = 0
            while len(itens) < 4:   # completa a última folha com a outra cor
                dz = grupo[j % len(grupo)]
                c = "offwhite" if cores[j % 4] == "preta" else "preta"
                itens.append((feitos[(dz["id"], c)], f'{dz["nome"]} · {CAMISAS[c]["nome"]}'))
                j += 1
            n += 1
            folha(itens, n)
        print(n, "folhas")
        miniaturas()
