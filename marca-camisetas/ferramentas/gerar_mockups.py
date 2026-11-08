#!/usr/bin/env python3
"""Mockups com modelo: aplica as estampas nas fotos de mockups-base/.

Cada foto mostra a mesma pessoa de frente e de costas. A estampa é colada no
peito (e o verbete na nuca, ou a lista nas costas), acompanhando a luz e as
dobras do tecido da própria foto.

Uso (depois de gerar_artes.py e exportar_png.js):
    pip install numpy scipy pillow fonttools brotli
    python3 marca-camisetas/ferramentas/gerar_mockups.py

Saída:
    mockups/<cor>/<id>.jpg      uma imagem por estampa e por cor de camisa
    mockups/web/<cor>/<id>.jpg  cópia menor para o catálogo
    mockups/folhas/folha-NN.jpg 4 estampas por imagem
"""
import json
from pathlib import Path

import numpy as np
from fontTools.ttLib import TTFont
from PIL import Image, ImageDraw, ImageFont
from scipy import ndimage as ndi

RAIZ = Path(__file__).resolve().parent.parent
BASE = RAIZ / "mockups-base"
PNG = RAIZ / "artes" / "png"
SAIDA = RAIZ / "mockups"
DADOS = json.loads((RAIZ / "dados" / "frases.json").read_text(encoding="utf-8"))
ACENTO = tuple(int(DADOS["cores"]["acento"][i:i + 2], 16) for i in (1, 3, 5))

# Camisas das fotos. var = versão da arte; acento = cor que substitui o vermelho
CAMISAS = {
    "preta": {"nome": "preta", "var": "escura", "acento": None, "amostra": "#1C1C1E"},
    "branca": {"nome": "branca", "var": "clara", "acento": None, "amostra": "#F2F2F0"},
    "cinza": {"nome": "cinza", "var": "escura", "acento": None, "amostra": "#6A6A6A"},
    "azul": {"nome": "azul", "var": "escura", "acento": None, "amostra": "#2F64AE"},
    "vermelha": {"nome": "vermelha", "var": "escura", "acento": (22, 22, 22), "amostra": "#C0161B"},
}

# Posições nas fotos (px). Camisa oversized, peito de ~60 cm.
FRENTE = {"cx": 380, "gola": 352, "px_cm": 5.9}
COSTAS = {"cx": 1086, "gola": 292, "px_cm": 6.1}
MANGA = (606, 548)
ETIQUETA = (312, 928)


def carregar_base(cor):
    foto = np.asarray(Image.open(BASE / f"{cor}.png").convert("RGB"), np.float32)
    L = foto @ np.array([0.299, 0.587, 0.114], np.float32)
    L = np.maximum(L, 1)
    fino = ndi.gaussian_filter(L, 1.0)
    largo = ndi.gaussian_filter(L, 28)
    dobras = np.clip(fino / largo, 0.72, 1.3)                  # dobras e textura do tecido
    peito = L[420:880, 230:530]
    geral = np.clip(largo / np.median(peito), 0.75, 1.2)      # luz geral (lado mais escuro, etc.)
    escuro = np.median(peito) < 90
    luz = dobras ** (0.75 if escuro else 1.0) * geral ** 0.6
    g = ndi.gaussian_filter(L / np.median(peito), 3)
    gy, gx = np.gradient(g)
    return foto, luz.astype(np.float32), (gx, gy)


def trocar_acento(arte, nova):
    """Troca o vermelho da arte por outra cor (para camisa vermelha)."""
    a = np.asarray(arte, np.float32)
    rgb = a[..., :3]
    acc = np.array(ACENTO, np.float32)
    d = np.linalg.norm(rgb - acc, axis=-1)
    peso = np.clip(1 - d / 140, 0, 1)[..., None]
    rgb = rgb * (1 - peso) + np.array(nova, np.float32) * peso
    return Image.fromarray(np.dstack([rgb, a[..., 3:]]).clip(0, 255).astype(np.uint8), "RGBA")


def colar(camada, arte, cx, topo, larg_cm, px_cm, giro=0.0):
    w = max(2, int(round(larg_cm * px_cm * 2)))
    h = max(2, int(round(arte.height * w / arte.width)))
    a = arte.resize((w, h), Image.LANCZOS)
    if giro:
        a = a.rotate(giro, resample=Image.BICUBIC, expand=True)
    camada.alpha_composite(a, (int(2 * cx - a.width / 2), int(2 * topo - (a.height - h) / 2)))


def aplicar(foto, luz, grad, camada):
    """Estampa em 2x, deslocada pelas dobras e iluminada pela luz da foto."""
    arr = np.asarray(camada.resize((foto.shape[1], foto.shape[0]), Image.LANCZOS), np.float32) / 255
    gx, gy = grad
    Y, X = np.mgrid[0:foto.shape[0], 0:foto.shape[1]].astype(np.float32)
    desloc = 60.0
    coords = [Y + desloc * gy, X + desloc * gx]
    arr = np.stack([ndi.map_coordinates(arr[..., c], coords, order=1) for c in range(4)], -1)
    alfa = (arr[..., 3] * 0.96)[..., None]
    tinta = arr[..., :3] * 255 * 0.94 * luz[..., None]
    return foto * (1 - alfa) + tinta * alfa


def arte(pasta, nome, cor):
    im = Image.open(PNG / pasta / f"{nome}.png").convert("RGBA")
    nova = CAMISAS[cor]["acento"]
    return trocar_acento(im, nova) if nova else im


def mockup(design, cor, cache):
    if cor not in cache:
        cache[cor] = carregar_base(cor)
    foto, luz, grad = cache[cor]
    var = CAMISAS[cor]["var"]
    H, W = foto.shape[:2]
    camada = Image.new("RGBA", (2 * W, 2 * H), (0, 0, 0, 0))
    f, c = FRENTE, COSTAS
    if design["tipo"] == "frase":
        colar(camada, arte("frente", f'{design["id"]}-{var}', cor), f["cx"], f["gola"] + 7 * f["px_cm"], 32, f["px_cm"])
        colar(camada, arte("nuca", f'{design["id"]}-{var}', cor), c["cx"], c["gola"] + 2.5 * c["px_cm"], 10, c["px_cm"])
    else:
        frente = ("frente", f"turne-{var}", 17) if design["id"] == "turne" else ("marca", f"assinatura-{var}", 10)
        if design["id"] == "turne":
            colar(camada, arte(frente[0], frente[1], cor), f["cx"], f["gola"] + 7 * f["px_cm"], frente[2], f["px_cm"])
        else:
            colar(camada, arte(frente[0], frente[1], cor), f["cx"] + 9 * f["px_cm"], f["gola"] + 9 * f["px_cm"], frente[2], f["px_cm"], giro=6)
        colar(camada, arte("costas", f'{design["id"]}-{var}', cor), c["cx"], c["gola"] + 8 * c["px_cm"], design["larg"], c["px_cm"])
    colar(camada, arte("marca", f"assinatura-{var}", cor), *MANGA, 7, f["px_cm"], giro=-4)
    colar(camada, arte("marca", f"etiqueta-barra-{var}", cor), *ETIQUETA, 5, f["px_cm"])
    out = aplicar(foto, luz, grad, camada)
    return Image.fromarray(np.clip(out, 0, 255).astype(np.uint8))


def fonte_legenda(tam):
    destino = SAIDA / ".fonte-legenda.ttf"
    if not destino.exists():
        tt = TTFont(RAIZ / "ferramentas" / "fontes" / "courier-prime-latin-400-normal.woff")
        tt.flavor = None
        destino.parent.mkdir(parents=True, exist_ok=True)
        tt.save(destino)
    return ImageFont.truetype(str(destino), tam)


def folha(itens, numero):
    w, h = itens[0][0].size
    im = Image.new("RGB", (2 * w, 2 * h + 64), (22, 22, 24))
    f = fonte_legenda(28)
    d = ImageDraw.Draw(im)
    for i, (img, legenda) in enumerate(itens):
        x, y = (i % 2) * w, (i // 2) * h
        im.paste(img, (x, y))
        tw = d.textlength(legenda, font=f)
        d.rectangle([x + 20, y + h - 62, x + 40 + tw, y + h - 20], fill=(16, 16, 18))
        d.text((x + 30, y + h - 58), legenda, font=f, fill=(240, 236, 228))
    d.text((24, 2 * h + 16), f"{DADOS['marca']['nome']} · mockups · folha {numero:02d}", font=f, fill=(190, 186, 178))
    caminho = SAIDA / "folhas" / f"folha-{numero:02d}.jpg"
    caminho.parent.mkdir(parents=True, exist_ok=True)
    im.save(caminho, quality=86)


def designs():
    out = [{"id": fr["id"], "nome": fr["frase"], "tipo": "frase"} for fr in DADOS["frases"]]
    out += [{"id": l["id"], "nome": l["nome"], "tipo": "costas", "larg": 22} for l in DADOS["listas"]]
    out.append({"id": "turne", "nome": DADOS["turne"]["nome"], "tipo": "costas", "larg": 26})
    return out


if __name__ == "__main__":
    import sys
    so = sys.argv[1:]
    lista = [d for d in designs() if not so or d["id"] in so]
    cache, feitos = {}, {}
    for dz in lista:
        for cor in CAMISAS:
            img = mockup(dz, cor, cache)
            for pasta, tam in ((SAIDA / cor, None), (SAIDA / "web" / cor, (900, 675))):
                pasta.mkdir(parents=True, exist_ok=True)
                (img.resize(tam, Image.LANCZOS) if tam else img).save(pasta / f'{dz["id"]}.jpg', quality=84)
            feitos[(dz["id"], cor)] = img
        print("ok", dz["id"])
    if not so:
        cores = list(CAMISAS)
        n = 0
        for k in range(0, len(lista), 4):
            grupo = lista[k:k + 4]
            itens = []
            for j, dz in enumerate(grupo):
                cor = cores[(k + j) % len(cores)]
                itens.append((feitos[(dz["id"], cor)], f'{dz["nome"]} · camisa {CAMISAS[cor]["nome"]}'))
            j = 0
            while len(itens) < 4:
                dz = grupo[j % len(grupo)]
                cor = cores[(k + j + 2) % len(cores)]
                itens.append((feitos[(dz["id"], cor)], f'{dz["nome"]} · camisa {CAMISAS[cor]["nome"]}'))
                j += 1
            n += 1
            folha(itens, n)
        print(n, "folhas")
