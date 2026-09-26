#!/usr/bin/env python3
"""HappyHues Studio - Book 2: Dinosaur Mandalas (25 proven-quality mandala pages)."""
import math, os
from PIL import Image, ImageDraw

BASE = "/home/runner/work/PlayGround/PlayGround/kdp-business"
PAGES = f"{BASE}/pages/book2"
os.makedirs(PAGES, exist_ok=True)
W, H = 2550, 3300
LW = 11
CX, CY = W//2, H//2 + 100

def E(d, x0, y0, x1, y1, w=LW):
    d.ellipse([min(x0, x1), min(y0, y1), max(x0, x1), max(y0, y1)], outline="black", width=w)

def mandala(petals, rings, name, center_r=90):
    im = Image.new("RGB", (W, H), "white")
    d = ImageDraw.Draw(im)
    d.rectangle([70, 70, W-70, H-70], outline="black", width=LW)
    d.rectangle([110, 110, W-110, H-110], outline="black", width=4)
    cx, cy, R = CX, CY, 1050
    E(d, cx-center_r, cy-center_r, cx+center_r, cy+center_r)
    for r in range(rings):
        r1 = 150 + r*(R-150)//rings
        r2 = 150 + (r+1)*(R-150)//rings
        E(d, cx-r2, cy-r2, cx+r2, cy+r2, LW-3)
        n = petals + r*4
        for i in range(n):
            a = 2*math.pi*i/n + r*0.2
            x1, y1 = cx+r1*math.cos(a), cy+r1*math.sin(a)
            x2, y2 = cx+r2*math.cos(a), cy+r2*math.sin(a)
            mx, my = (x1+x2)/2, (y1+y2)/2
            off = (r2-r1)*0.45
            px, py = -(y2-y1), (x2-x1)
            pl = math.hypot(px, py) or 1
            d.line([x1, y1, mx+px/pl*off, my+py/pl*off, x2, y2], fill="black", width=LW-3, joint="curve")
            if r % 2 == 0:
                dx, dy = (r1+r2)/2*math.cos(a+math.pi/n), (r1+r2)/2*math.sin(a+math.pi/n)
                E(d, cx+dx-28, cy+dy-28, cx+dx+28, cy+dy+28, LW-4)
    for i in range(36):
        a = 2*math.pi*i/36
        x, y = cx+(R+70)*math.cos(a), cy+(R+70)*math.sin(a)
        E(d, x-45, y-45, x+45, y+45, LW-4)
    p = f"{PAGES}/{name}.png"
    im.save(p)
    print(name, os.path.getsize(p)//1024, "KB")

specs = [
    (12,4,"m01_fossil_sun"),(8,5,"m02_jungle_nest"),(16,3,"m03_roar_star"),
    (10,4,"m04_amber_garden"),(14,4,"m05_claw_crown"),(9,5,"m06_egg_pearl"),
    (18,3,"m07_volcano_bloom"),(11,5,"m08_leaf_dream"),(15,4,"m09_king_earth"),
    (13,3,"m10_swamp_rings"),(10,5,"m11_meteor_shower"),(17,4,"m12_thunder_crown"),
    (8,4,"m13_hatchling"),(12,5,"m14_ancient_sea"),(16,4,"m15_saur_sun"),
    (9,3,"m16_fern_magic"),(14,5,"m17_ridge_dream"),(11,4,"m18_bone_garden"),
    (18,4,"m19_eruption"),(10,3,"m20_valley_star"),(13,5,"m21_mist_peaks"),
    (15,3,"m22_sky_fire"),(8,3,"m23_tiny_claws"),(17,5,"m24_giant_roar"),
    (12,3,"m25_first_sunrise"),
]
for petals, rings, name in specs:
    mandala(petals, rings, name)
print("ALL 25 MANDALA PAGES DONE")
