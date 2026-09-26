#!/usr/bin/env python3
"""HappyHues Studio - Book 1: Cute Animals & Fun Coloring (25 original pages).
8.5x11in @300dpi = 2550x3300. Bold black line-art on white.
"""
import math, os
from PIL import Image, ImageDraw, ImageFont

BASE = "/home/runner/work/PlayGround/PlayGround/kdp-business"
PAGES = f"{BASE}/pages/book1"
os.makedirs(PAGES, exist_ok=True)
W, H = 2550, 3300
LW = 11  # line width
FONT_B = "/usr/share/fonts/truetype/lato/Lato-Bold.ttf"
FONT_R = "/usr/share/fonts/truetype/lato/Lato-Regular.ttf"

def new():
    return Image.new("RGB", (W, H), "white")

def frame(d):
    d.rectangle([70, 70, W-70, H-70], outline="black", width=LW)
    d.rectangle([110, 110, W-110, H-110], outline="black", width=4)

def save(im, name):
    p = f"{PAGES}/{name}.png"
    im.save(p)
    print(name, os.path.getsize(p)//1024, "KB")

def txt(d, xy, s, size, anchor="mm", fill="black"):
    try: f = ImageFont.truetype(FONT_B, size)
    except: f = ImageFont.load_default()
    d.text(xy, s, font=f, fill=fill, anchor=anchor)

CX, CY = W//2, H//2 + 100

# ---------------- MANDALAS ----------------
def mandala(petals, rings, seed_name):
    im, d = new(), None
    im = new(); d = ImageDraw.Draw(im); frame(d)
    import random
    rnd = random.Random(sum(ord(c) for c in seed_name))
    cx, cy, R = CX, CY, 1050
    d.ellipse([cx-90, cy-90, cx+90, cy+90], outline="black", width=LW)
    for r in range(rings):
        r1 = 150 + r*(R-150)//rings
        r2 = 150 + (r+1)*(R-150)//rings
        d.ellipse([cx-r2, cy-r2, cx+r2, cy+r2], outline="black", width=LW-3)
        n = petals + r*4
        for i in range(n):
            a = 2*math.pi*i/n + r*0.2
            x1, y1 = cx+r1*math.cos(a), cy+r1*math.sin(a)
            x2, y2 = cx+r2*math.cos(a), cy+r2*math.sin(a)
            mx, my = (x1+x2)/2, (y1+y2)/2
            off = (r2-r1)*0.45
            px, py = -(y2-y1), (x2-x1)
            pl = math.hypot(px, py) or 1
            cxp, cyp = mx+px/pl*off, my+py/pl*off
            d.line([x1, y1, cxp, cyp, x2, y2], fill="black", width=LW-3, joint="curve")
            if r % 2 == 0:
                dx, dy = (r1+r2)/2*math.cos(a+math.pi/n), (r1+r2)/2*math.sin(a+math.pi/n)
                d.ellipse([cx+dx-28, cy+dy-28, cx+dx+28, cy+dy+28], outline="black", width=LW-4)
    # outer scallops
    for i in range(36):
        a = 2*math.pi*i/36
        x, y = cx+(R+70)*math.cos(a), cy+(R+70)*math.sin(a)
        d.ellipse([x-45, y-45, x+45, y+45], outline="black", width=LW-4)
    save(im, seed_name)

# ---------------- KIDS DRAWINGS ----------------
def kids(name, fn):
    im = new(); d = ImageDraw.Draw(im); frame(d)
    fn(d)
    save(im, name)

def cat(d):
    x, y, r = CX, CY, 620
    d.polygon([(x-r, y-r+120), (x-r+40, y-r-260), (x-r+330, y-r+40)], outline="black", width=LW)
    d.polygon([(x+r, y-r+120), (x+r-40, y-r-260), (x+r-330, y-r+40)], outline="black", width=LW)
    d.ellipse([x-r, y-r, x+r, y+r], outline="black", width=LW)
    for ex in (-260, 260):
        d.ellipse([x+ex-95, y-160-95, x+ex+95, y-160+95], outline="black", width=LW)
        d.ellipse([x+ex-35, y-160-35, x+ex+35, y-160+35], fill="black")
    d.polygon([(x-70, y+120), (x+70, y+120), (x, y+200)], outline="black", width=LW)
    d.line([x, y+200, x, y+300], fill="black", width=LW)
    d.arc([x-160, y+180, x, y+360], 0, 180, fill="black", width=LW)
    d.arc([x, y+180, x+160, y+360], 0, 180, fill="black", width=LW)
    for s in (-1, 1):
        for i in range(3):
            yy = y+80+i*70
            d.line([x+s*(r-40), yy, x+s*(r-420), yy-30+i*30], fill="black", width=LW-3)

def dog(d):
    x, y = CX, CY
    d.ellipse([x-560, y-560, x+560, y+560], outline="black", width=LW)
    d.ellipse([x-820, y-480, x-480, y+320], outline="black", width=LW)
    d.ellipse([x+480, y-480, x+820, y+320], outline="black", width=LW)
    d.ellipse([x-260, y+80, x+260, y+480], outline="black", width=LW)
    d.ellipse([x-90, y+200, x+90, y+330], fill="black")
    d.arc([x-150, y+300, x, y+440], 0, 180, fill="black", width=LW)
    d.arc([x, y+300, x+150, y+440], 0, 180, fill="black", width=LW)
    for ex in (-280, 280):
        d.ellipse([x+ex-100, y-220-100, x+ex+100, y-220+100], outline="black", width=LW)
        d.ellipse([x+ex-38, y-220-38, x+ex+38, y-220+38], fill="black")
    d.arc([x-140, y-420, x+140, y-180], 0, 360, fill="black", width=LW-3)

def fish(d):
    x, y = CX, CY
    d.ellipse([x-650, y-380, x+350, y+380], outline="black", width=LW)
    d.polygon([(x+350, y-260), (x+900, y-520), (x+900, y+520), (x+350, y+260)], outline="black", width=LW)
    d.polygon([(x-350, y-380), (x-100, y-620), (x+50, y-380)], outline="black", width=LW)
    d.ellipse([x-520-90, y-120-90, x-520+90, y-120+90], outline="black", width=LW)
    d.ellipse([x-545, y-145, x-495, y-95], fill="black")
    d.arc([x-300, y-40, x-60, y+200], 20, 160, fill="black", width=LW)
    for i in range(3):
        d.arc([x-450+i*180, y-260, x-150+i*180, y+40], 200, 340, fill="black", width=LW-3)
        d.arc([x-450+i*180, y-40, x-150+i*180, y+260], 20, 160, fill="black", width=LW-3)
    for i, (bx, by, br) in enumerate([(x-850, y-700, 70), (x-950, y-900, 95), (x-700, y+750, 80), (x+700, y-800, 85)]):
        d.ellipse([bx-br, by-br, bx+br, by+br], outline="black", width=LW-3)
    for i in range(3):
        wx = 300 + i*600
        d.arc([wx, H-700, wx+400, H-300], 180, 360, fill="black", width=LW)

def butterfly(d):
    x, y = CX, CY
    d.ellipse([x-90, y-420, x+90, y+420], outline="black", width=LW)
    d.ellipse([x-70, y-500, x+70, y-380], outline="black", width=LW)
    for ex in (-230, 230):
        d.ellipse([x+ex-90, y-140-90, x+ex+90, y-140+90], outline="black", width=LW)
    for s in (-1, 1):
        x0a, x1a = sorted([x+s*130, x+s*640])
        x0b, x1b = sorted([x+s*130, x+s*560])
        d.ellipse([x0a, y-560, x1a, y-60], outline="black", width=LW)
        d.ellipse([x0b, y+60, x1b, y+520], outline="black", width=LW)
        d.ellipse([x+s*280-90, y-380-90, x+s*280+90, y-380+90], outline="black", width=LW-3)
        d.ellipse([x+s*280-70, y+260-70, x+s*280+70, y+260+70], outline="black", width=LW-3)
    d.line([x-40, y-420, x-260, y-700], fill="black", width=LW-3)
    d.line([x+40, y-420, x+260, y-700], fill="black", width=LW-3)
    d.ellipse([x-300, y-740, x-220, y-660], outline="black", width=LW-3)
    d.ellipse([x+220, y-740, x+300, y-660], outline="black", width=LW-3)

def flowerpot(d):
    x, y = CX, CY + 500
    d.polygon([(x-420, y-300), (x+420, y-300), (x+300, y+300), (x-300, y+300)], outline="black", width=LW)
    d.rectangle([x-480, y-420, x+480, y-300], outline="black", width=LW)
    for i, (sx, sh, r) in enumerate([(-420, 900, 150), (0, 1100, 180), (420, 900, 150)]):
        d.line([x, y-420, x+sx, y-420-sh], fill="black", width=LW-3)
        fx, fy = x+sx, y-420-sh
        for k in range(6):
            a = math.pi*k/3 + i*0.3
            px, py = fx+r*1.5*math.cos(a), fy+r*1.5*math.sin(a)
            d.ellipse([px-r, py-r, px+r, py+r], outline="black", width=LW-3)
        d.ellipse([fx-70, fy-70, fx+70, fy+70], outline="black", width=LW)
        d.line([x+sx//2, y-500, x+sx//2-140, y-700], fill="black", width=LW-4)
        d.ellipse([x+sx//2-260, y-820, x+sx//2-20, y-580], outline="black", width=LW-4)

def sunclouds(d):
    x, y = CX-450, CY-550
    d.ellipse([x-320, y-320, x+320, y+320], outline="black", width=LW)
    for i in range(12):
        a = math.pi*i/6
        d.line([x+400*math.cos(a), y+400*math.sin(a), x+560*math.cos(a), y+560*math.sin(a)], fill="black", width=LW)
    for ex in (-160, 160):
        d.ellipse([x+ex-60, y-60, x+ex+60, y+60], outline="black", width=LW-3)
        d.arc([x+ex-60, y-60, x+ex+60, y+60], 200, 340, fill="black", width=LW-4)
    d.arc([x-160, y+40, x+160, y+300], 20, 160, fill="black", width=LW)
    def cloud(cx, cy, s):
        d.ellipse([cx-260*s, cy-90*s, cx-60*s, cy+110*s], outline="black", width=LW)
        d.ellipse([cx-140*s, cy-170*s, cx+140*s, cy+110*s], outline="black", width=LW)
        d.ellipse([cx+60*s, cy-90*s, cx+260*s, cy+110*s], outline="black", width=LW)
        d.line([cx-220*s, cy+110*s, cx+220*s, cy+110*s], fill="black", width=LW)
    cloud(CX-550, CY+650, 1.4); cloud(CX+600, CY+850, 1.1)
    for bx, by in [(CX+300, CY-200), (CX+520, CY-120)]:
        d.arc([bx-70, by-40, bx, by+40], 200, 340, fill="black", width=LW-3)
        d.arc([bx, by-40, bx+70, by+40], 200, 340, fill="black", width=LW-3)

def house(d):
    x, y = CX, CY + 200
    d.rectangle([x-550, y-350, x+550, y+450], outline="black", width=LW)
    d.polygon([(x-700, y-350), (x+700, y-350), (x, y-950)], outline="black", width=LW)
    d.rectangle([x-150, y+50, x+150, y+450], outline="black", width=LW)
    d.ellipse([x+60, y+250, x+110, y+300], fill="black")
    d.ellipse([x-260, y-200, x-60, y+0], outline="black", width=LW)
    d.line([x-160, y-100, x-160, y-100], fill="black", width=LW)
    d.line([x-260, y-100, x-60, y-100], fill="black", width=LW-3)
    d.line([x-160, y-200, x-160, y+0], fill="black", width=LW-3)
    d.rectangle([x+350, y-950, x+500, y-600], outline="black", width=LW)
    for i in range(3):
        d.ellipse([x+425-60, y-1050-i*130-60, x+425+60, y-1050-i*130+60], outline="black", width=LW-4)
    d.line([300, y+450, W-300, y+450], fill="black", width=LW)

def appletree(d):
    x, y = CX, CY + 800
    d.polygon([(x-120, y-900), (x+120, y-900), (x+180, y), (x-180, y)], outline="black", width=LW)
    blobs = [(x-450, y-1100, 320), (x+450, y-1100, 320), (x, y-1400, 380), (x-250, y-900, 280), (x+250, y-900, 280)]
    for bx, by, br in blobs:
        d.ellipse([bx-br, by-br, bx+br, by+br], outline="black", width=LW)
    for ax, ay in [(x-450, y-1100), (x+450, y-1050), (x, y-1400), (x-200, y-950), (x+250, y-900)]:
        d.ellipse([ax-70, ay-70, ax+70, ay+70], outline="black", width=LW-3)
        d.line([ax, ay-70, ax+30, ay-120], fill="black", width=LW-4)
    d.line([300, y, W-300, y], fill="black", width=LW)
    for gx in range(400, W-400, 200):
        d.line([gx, y, gx, y-80], fill="black", width=LW-4)

def bird(d):
    x, y = CX, CY
    d.line([300, y+550, W-300, y+550], fill="black", width=LW)
    d.ellipse([x-380, y-280, x+380, y+280], outline="black", width=LW)
    d.ellipse([x-420, y-520, x-140, y-240], outline="black", width=LW)
    d.polygon([(x+380, y-80), (x+620, y+20), (x+380, y+120)], outline="black", width=LW)
    d.ellipse([x+140-80, y-140-80, x+140+80, y-140+80], outline="black", width=LW)
    d.ellipse([x+160, y-120, x+200, y-80], fill="black")
    d.arc([x-280, y-120, x+40, y+200], 200, 340, fill="black", width=LW-3)
    d.line([x-80, y+280, x-80, y+550], fill="black", width=LW)
    d.line([x+80, y+280, x+80, y+550], fill="black", width=LW)
    for s in (-1, 1):
        d.line([x+s*80-70, y+550, x+s*80+70, y+550], fill="black", width=LW-3)
    d.arc([x-520, y-680, x-280, y-440], 200, 340, fill="black", width=LW-3)

def turtle(d):
    x, y = CX, CY + 200
    d.pieslice([x-650, y-500, x+650, y+500], 180, 360, outline="black", width=LW)
    d.line([x-650, y, x+650, y], fill="black", width=LW)
    d.ellipse([x+650, y-140, x+900, y+140], outline="black", width=LW)
    d.ellipse([x+760-45, y-45, x+760+45, y+45], outline="black", width=LW-3)
    d.ellipse([x+760-15, y-15, x+760+15, y+15], fill="black")
    for lx, ly in [(x-550, y+150), (x-350, y+150), (x+350, y+150), (x+550, y+150)]:
        d.ellipse([lx-110, ly-60, lx+110, ly+220], outline="black", width=LW)
    for i in range(-2, 3):
        d.line([x+i*180-90, y-260, x+i*180+90, y-260], fill="black", width=LW-4)
        d.line([x+i*180-140, y-260, x+i*180, y-80], fill="black", width=LW-4)
        d.line([x+i*180+140, y-260, x+i*180, y-80], fill="black", width=LW-4)
    d.polygon([(x-650, y), (x-820, y+120), (x-650, y+180)], outline="black", width=LW)

def lion(d):
    x, y = CX, CY
    for i in range(16):
        a = math.pi*i/8
        px, py = x+620*math.cos(a), y+620*math.sin(a)
        d.ellipse([px-170, py-170, px+170, py+170], outline="black", width=LW-3)
    d.ellipse([x-620, y-620, x+620, y+620], outline="black", width=LW)
    d.ellipse([x-450, y-450, x+450, y+450], outline="black", width=LW)
    for ex in (-220, 220):
        d.ellipse([x+ex-90, y-140-90, x+ex+90, y-140+90], outline="black", width=LW)
        d.ellipse([x+ex-32, y-140-32, x+ex+32, y-140+32], fill="black")
    d.ellipse([x-330, y-420, x-180, y-270], outline="black", width=LW-3)
    d.ellipse([x+180, y-420, x+330, y-270], outline="black", width=LW-3)
    d.polygon([(x-110, y+120), (x+110, y+120), (x, y+240)], fill="black")
    d.line([x, y+240, x, y+330], fill="black", width=LW)
    d.arc([x-140, y+220, x, y+380], 0, 180, fill="black", width=LW)
    d.arc([x, y+220, x+140, y+380], 0, 180, fill="black", width=LW)

def rabbit(d):
    x, y = CX, CY + 250
    d.ellipse([x-160, y-1050, x+40, y-350], outline="black", width=LW)
    d.ellipse([x-40, y-1050, x+160, y-350], outline="black", width=LW)
    d.ellipse([x-90, y-950, x-10, y-450], outline="black", width=LW-4)
    d.ellipse([x+10, y-950, x+90, y-450], outline="black", width=LW-4)
    d.ellipse([x-400, y-400, x+400, y+400], outline="black", width=LW)
    for ex in (-170, 170):
        d.ellipse([x+ex-80, y-120-80, x+ex+80, y-120+80], outline="black", width=LW)
        d.ellipse([x+ex-28, y-120-28, x+ex+28, y-120+28], fill="black")
    d.polygon([(x-60, y+80), (x+60, y+80), (x, y+160)], outline="black", width=LW)
    d.rectangle([x-70, y+160, x+70, y+230], outline="black", width=LW-3)
    d.line([x, y+160, x, y+230], fill="black", width=LW-3)
    for s in (-1, 1):
        for i in range(3):
            yy = y+40+i*60
            d.line([x+s*380, yy, x+s*120, yy-20+i*20], fill="black", width=LW-4)
    cxp = x+750
    d.polygon([(cxp-120, y+300), (cxp+120, y+300), (cxp, y-100)], outline="black", width=LW)
    for i in range(4):
        yy = y+220-i*90
        d.line([cxp-95+i*12, yy, cxp+95-i*12, yy], fill="black", width=LW-4)
    for i in range(3):
        d.arc([cxp-60+i*45, y-220, cxp+60+i*45, y-100], 180, 360, fill="black", width=LW-4)

def car(d):
    x, y = CX, CY + 250
    d.rounded_rectangle([x-800, y-250, x+800, y+250], radius=120, outline="black", width=LW)
    d.polygon([(x-450, y-250), (x-250, y-550), (x+350, y-550), (x+550, y-250)], outline="black", width=LW)
    d.line([x+50, y-550, x+50, y-250], fill="black", width=LW-3)
    for wx in (-520, 520):
        d.ellipse([x+wx-190, y+60, x+wx+190, y+440], outline="black", width=LW)
        d.ellipse([x+wx-80, y+170, x+wx+80, y+330], outline="black", width=LW-3)
    d.ellipse([x+800-40, y-80, x+800+60, y+60], outline="black", width=LW-3)
    d.line([300, y+440, W-300, y+440], fill="black", width=LW)
    for i in range(6):
        d.line([400+i*320, y+440, 520+i*320, y+440], fill="white", width=LW+6)

def sailboat(d):
    x, y = CX, CY + 300
    d.polygon([(x-600, y-100), (x+600, y-100), (x+400, y+300), (x-400, y+300)], outline="black", width=LW)
    d.line([x, y-100, x, y-1100], fill="black", width=LW)
    d.polygon([(x+40, y-1050), (x+40, y-200), (x+550, y-200)], outline="black", width=LW)
    d.polygon([(x-40, y-950), (x-40, y-200), (x-480, y-200)], outline="black", width=LW)
    d.polygon([(x, y-1100), (x+220, y-1040), (x, y-980)], outline="black", width=LW-3)
    for i in range(4):
        wx = 300 + i*550
        d.arc([wx, y+300, wx+400, y+620], 180, 360, fill="black", width=LW)
    d.ellipse([CX-800-140, CY-900-140, CX-800+140, CY-900+140], outline="black", width=LW-3)

def moonstars(d):
    x, y = CX, CY - 100
    d.arc([x-550, y-550, x+550, y+550], 40, 320, fill="black", width=LW)
    d.arc([x-350, y-450, x+650, y+550], 60, 300, fill="black", width=LW)
    def star(sx, sy, r):
        pts = []
        for i in range(10):
            rr = r if i % 2 == 0 else r*0.45
            a = -math.pi/2 + math.pi*i/5
            pts.append((sx+rr*math.cos(a), sy+rr*math.sin(a)))
        d.polygon(pts, outline="black", width=LW-3)
    star(x-650, y-650, 130); star(x+650, y-500, 100); star(x+550, y+450, 130)
    star(x-600, y+550, 90); star(x, y+700, 110)
    d.ellipse([x-500, y+150, x-100, y+350], outline="black", width=LW-3)
    d.ellipse([x-400, y+80, x, y+350], outline="black", width=LW-3)

def icecream(d):
    x, y = CX, CY + 100
    d.polygon([(x-350, y-100), (x+350, y-100), (x, y+900)], outline="black", width=LW)
    for i in range(-3, 4):
        d.line([x+i*110-260, y+60, x+i*110+60, y+700], fill="black", width=LW-5)
        d.line([x+i*110+260, y+60, x+i*110-60, y+700], fill="black", width=LW-5)
    d.ellipse([x-420, y-620, x+420, y+60], outline="black", width=LW)
    d.ellipse([x-300, y-900, x+300, y-380], outline="black", width=LW)
    d.ellipse([x-60, y-1050, x+60, y-930], outline="black", width=LW-3)
    d.line([x, y-930, x+120, y-820], fill="black", width=LW-4)
    for dx, dy in [(-250, -300), (200, -150), (0, -500)]:
        d.ellipse([x+dx-40, y+dy-70, x+dx+40, y+dy+70], outline="black", width=LW-4)

def frog(d):
    x, y = CX, CY + 100
    d.ellipse([x-550, y-250, x+550, y+450], outline="black", width=LW)
    for ex in (-330, 330):
        d.ellipse([x+ex-170, y-550, x+ex+170, y-210], outline="black", width=LW)
        d.ellipse([x+ex-90, y-460, x+ex+90, y-300], outline="black", width=LW)
        d.ellipse([x+ex-30, y-400, x+ex+30, y-340], fill="black")
    d.arc([x-350, y-50, x+350, y+350], 10, 170, fill="black", width=LW)
    for ex in (-180, 180):
        d.ellipse([x+ex-50, y-180-50, x+ex+50, y-180+50], outline="black", width=LW-4)
    d.ellipse([x-800, y+450, x+800, y+850], outline="black", width=LW)
    d.line([x-800, y+650, x-1050, y+650], fill="black", width=LW-3)
    d.line([x+800, y+650, x+1050, y+650], fill="black", width=LW-3)

# ---------------- BUILD ----------------
mandala(12, 4, "p01_mandala_sun")
kids("p02_cat", cat)
kids("p03_dog", dog)
mandala(8, 5, "p04_mandala_ocean")
kids("p05_fish", fish)
kids("p06_butterfly", butterfly)
mandala(16, 3, "p07_mandala_star")
kids("p08_flowerpot", flowerpot)
kids("p09_sunclouds", sunclouds)
mandala(10, 4, "p10_mandala_garden")
kids("p11_house", house)
kids("p12_appletree", appletree)
mandala(14, 4, "p13_mandala_crown")
kids("p14_bird", bird)
kids("p15_turtle", turtle)
mandala(9, 5, "p16_mandala_pearl")
kids("p17_lion", lion)
kids("p18_rabbit", rabbit)
mandala(12, 5, "p19_mandala_dream")
kids("p20_car", car)
kids("p21_sailboat", sailboat)
mandala(18, 3, "p22_mandala_bloom")
kids("p23_moonstars", moonstars)
kids("p24_icecream", icecream)
kids("p25_frog", frog)
print("ALL 25 PAGES DONE")
