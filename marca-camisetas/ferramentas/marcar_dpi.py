#!/usr/bin/env python3
"""Grava 300 dpi nos PNGs (o programa da gráfica lê o tamanho real em cm)."""
from pathlib import Path
from PIL import Image

for p in sorted((Path(__file__).resolve().parent.parent / "artes" / "png").rglob("*.png")):
    with Image.open(p) as im:
        im.load()
        im.save(p, dpi=(300, 300), optimize=True)
print("ok")
