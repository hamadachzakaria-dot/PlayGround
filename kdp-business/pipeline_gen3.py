#!/usr/bin/env python3
"""HappyHues Studio - Book 3: Butterfly Garden, Bella's Journey.
25 flower mandalas (proven renderer, R=900) + Bella sprite hidden on EVERY page
+ flower title + leaf page number. Author: Lily Meadow."""
import math, os
from PIL import Image, ImageDraw, ImageFont

BASE = "/home/runner/work/PlayGround/PlayGround/kdp-business"
PAGES = f"{BASE}/pages/book3"
os.makedirs(PAGES, exist_ok=True)
W, H = 2550, 3300
LW = 11
CX, CY = W//2, H//2 + 100
FB = "/usr/share/fonts/truetype/lato/Lato-Bold.ttf"
FR = "/usr/share/fonts/truetype/lato/Lato-Regular.ttf"
def F(p, s):
    try: return ImageFont.truetype(p, s)
    except: return ImageFont.load_default()

def E(d, x0, y0, x1, y1, w=LW):
    d.ellipse([min(x0, x1), min(y0, y1), max(x0, x1), max(y0, y1)], outline="black", width=w)

# ---------- Bella sprite (400x400, symmetric, colorable outlines) ----------
def bella_sprite(size=260):
    S = 400
    im = Image.new("RGB", (S, S), "white")
    d = ImageDraw.Draw(im)
    w = 9
    cx = S//2
    # wings upper
    E2 = lambda x0, y0, x1, y1, ww=w: d.ellipse([x0, y0, x1, y1], outline="black", width=ww)
    E2(40, 90, 175, 240); E2(225, 90, 360, 240)
    E2(70, 230, 175, 340); E2(225, 230, 330, 340)
    E2(85, 130, 145, 190, 6); E2(255, 130, 315, 190, 6)
    E2(95, 255, 150, 310, 6); E2(250, 255, 305, 310, 6)
    # body + head
    E2(cx-28, 130, cx+28, 330)
    E2(cx-45, 70, cx+45, 140)
    d.ellipse([cx-14, 95, cx-2, 107], fill="black")
    d.ellipse([cx+2, 95, cx+14, 107], fill="black")
    d.arc([cx-20, 110, cx+20, 135], 20, 160, fill="black", width=4)
    # antennae
    d.line([cx-25, 75, cx-70, 25], fill="black", width=w-2)
    d.line([cx+25, 75, cx+70, 25], fill="black", width=w-2)
    E2(cx-85, 10, cx-55, 40, 6); E2(cx+55, 10, cx+85, 40, 6)
    im = im.resize((size, size))
    # white -> transparent mask
    mask = im.convert("L").point(lambda v: 0 if v > 200 else 255, mode="L")
    return im, mask

BELLA_SPOTS = [  # (x, y, rotation) - all clear of mandala (R=900) & title & number
    (330, 430, 0), (W-330, 430, 90), (330, 2900, 270),
    (W-330, 2900, 180), (CX, 430, 45), (CX, 2900, 135),
]

FLOWERS = ["Rose","Sunflower","Daisy","Tulip","Lotus","Orchid","Iris","Poppy",
    "Lily","Daffodil","Hibiscus","Jasmine","Violet","Magnolia","Peony",
    "Lavender","Marigold","Zinnia","Dahlia","Gardenia","Bluebell","Primrose",
    "Azalea","Camellia","Butterfly Bush"]
PARAMS = [(12,4),(8,5),(16,3),(10,4),(14,4),(9,5),(18,3),(11,5),(15,4),(13,3),
    (10,5),(17,4),(8,4),(12,5),(16,4),(9,3),(14,5),(11,4),(18,4),(10,3),
    (13,5),(15,3),(8,3),(17,5),(12,3)]

def mandala_page(petals, rings, title, num, spot_idx, bellasz):
    im = Image.new("RGB", (W, H), "white")
    d = ImageDraw.Draw(im)
    d.rectangle([70, 70, W-70, H-70], outline="black", width=LW)
    d.rectangle([110, 110, W-110, H-110], outline="black", width=4)
    d.text((W//2, 300), title, font=F(FB, 95), fill="black", anchor="mm")
    cx, cy, R = CX, CY, 900
    E(d, cx-90, cy-90, cx+90, cy+90)
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
    # leaf page number
    d.text((W//2-40, 3060), str(num), font=F(FB, 70), fill="black", anchor="mm")
    d.ellipse([W//2+40, 3025, W//2+140, 3095], outline="black", width=6)
    d.line([W//2+40, 3060, W//2+140, 3060], fill="black", width=4)
    # Bella hiding spot
    sx, sy, rot = BELLA_SPOTS[spot_idx % len(BELLA_SPOTS)]
    spr, msk = bella_sprite(bellasz)
    if rot:
        spr = spr.rotate(rot, expand=True)
        msk = msk.rotate(rot, expand=True)
    im.paste(spr, (int(sx-spr.width/2), int(sy-spr.height/2)), msk)
    return im

for i, (flower, (pe, ri)) in enumerate(zip(FLOWERS, PARAMS)):
    spot = (i*2+1) % len(BELLA_SPOTS)
    size = 230 + (i*37) % 110
    im = mandala_page(pe, ri, flower, i+1, spot, size)
    p = f"{PAGES}/b{i+1:02d}_{flower.lower().replace(' ','_')}.png"
    im.save(p)
    print(f"b{i+1:02d} {flower} Bella@{BELLA_SPOTS[spot][:2]} {os.path.getsize(p)//1024}KB")
print("ALL 25 BELLA PAGES DONE")
