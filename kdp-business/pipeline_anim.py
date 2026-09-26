#!/usr/bin/env python3
"""Animated marketing cover for Book 3: Bella flies across the front cover.
NOTE: KDP print covers are STATIC PDFs. This GIF is for marketing:
social media, Author Central page, website, A+ Content. It cannot go
ON the Amazon print cover itself."""
import math
from PIL import Image, ImageDraw

BASE = "/home/runner/work/PlayGround/PlayGround/kdp-business"
SPINE_IN = 53 * 0.002252
FULL = Image.open(f"{BASE}/cover/Book3_cover_preview.png")
fx0 = int((0.125 + 8.5 + SPINE_IN) * 300)
front = FULL.crop((fx0, 0, fx0 + 2550, FULL.height)).resize((640, 845))

def bella(size=110):
    S = 200
    im = Image.new("RGB", (S, S), "white")
    d = ImageDraw.Draw(im)
    cx = S // 2
    d.ellipse([20, 45, 88, 120], outline="black", width=5)
    d.ellipse([112, 45, 180, 120], outline="black", width=5)
    d.ellipse([35, 115, 88, 170], outline="black", width=5)
    d.ellipse([112, 115, 165, 170], outline="black", width=5)
    d.ellipse([cx-14, 65, cx+14, 165], outline="black", width=5)
    d.ellipse([cx-22, 35, cx+22, 70], outline="black", width=5)
    d.line([cx-12, 38, cx-35, 12], fill="black", width=4)
    d.line([cx+12, 38, cx+35, 12], fill="black", width=4)
    im = im.resize((size, size))
    mask = im.convert("L").point(lambda v: 0 if v > 200 else 255, mode="L")
    return im, mask

spr, msk = bella(110)
W, H = front.size
frames = []
N = 12
for i in range(N):
    t = i / (N - 1)
    x = int(40 + t * (W - 150))
    y = int(H - 160 - math.sin(t * math.pi) * (H - 320))
    fr = front.copy()
    s2 = spr.rotate(-18 + 36 * (i % 2), expand=True)
    m2 = msk.rotate(-18 + 36 * (i % 2), expand=True)
    fr.paste(s2, (x, y), m2)
    d = ImageDraw.Draw(fr)  # twinkles
    for k in range(3):
        tx = (x + 90 + k * 45) % W
        ty = (y - 30 - k * 25) % H
        r = 4 + (i + k) % 3 * 3
        if (i + k) % 2 == 0:
            d.ellipse([tx-r, ty-r, tx+r, ty+r], outline=(212, 175, 55), width=3)
    frames.append(fr)

out = f"{BASE}/cover/Book3_animated_cover.gif"
frames[0].save(out, save_all=True, append_images=frames[1:], duration=220, loop=0)
import os
print("GIF ok", os.path.getsize(out)//1024, "KB", out)
