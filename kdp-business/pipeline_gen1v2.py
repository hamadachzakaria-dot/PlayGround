#!/usr/bin/env python3
"""Book 1 v2: Cute Animals Bold & Easy — 24 symmetric animal portraits.
Safe geometry only: centered fronts, overlapping parts, margins >=130px."""
import math, os
from PIL import Image, ImageDraw, ImageFont

BASE = "/home/runner/work/PlayGround/PlayGround/kdp-business"
PAGES = f"{BASE}/pages/book1v2"
os.makedirs(PAGES, exist_ok=True)
W, H = 2550, 3300
LW = 12
CX = W//2
FB = "/usr/share/fonts/truetype/lato/Lato-Bold.ttf"
def F(s):
    try: return ImageFont.truetype(FB, s)
    except: return ImageFont.load_default()

def E(d, x0, y0, x1, y1, w=LW):
    d.ellipse([min(x0,x1), min(y0,y1), max(x0,x1), max(y0,y1)], outline="black", width=w)
def EF(d, x0, y0, x1, y1):
    d.ellipse([min(x0,x1), min(y0,y1), max(x0,x1), max(y0,y1)], fill="black")
def eyes(d, cx, cy, dx, er=85):
    for s in (-1, 1):
        E(d, cx+s*dx-er, cy-er, cx+s*dx+er, cy+er)
        EF(d, cx+s*dx-28, cy-28, cx+s*dx+28, cy+28)
def smile(d, cx, cy, w=150, h=130):
    d.arc([cx-w, cy, cx+w, cy+h], 20, 160, fill="black", width=LW)
def frame(d):
    d.rectangle([130, 130, W-130, H-130], outline="black", width=LW)
    d.rectangle([170, 170, W-170, H-170], outline="black", width=4)

# bg elements (corner/edge safe zones)
def grass(d):
    for gx in range(350, W-350, 220):
        d.line([gx, H-450, gx, H-560], fill="black", width=LW-4)
        d.line([gx, H-450, gx-60, H-540], fill="black", width=LW-5)
        d.line([gx, H-450, gx+60, H-540], fill="black", width=LW-5)
def sun(d, x, y, r=140):
    E(d, x-r, y-r, x+r, y+r)
    for i in range(10):
        a = math.pi*i/5
        d.line([x+(r+40)*math.cos(a), y+(r+40)*math.sin(a), x+(r+120)*math.cos(a), y+(r+120)*math.sin(a)], fill="black", width=LW-3)
def cloud(d, x, y, s=1.0):
    E(d, x-220*s, y-70*s, x-40*s, y+110*s)
    E(d, x-110*s, y-140*s, x+110*s, y+110*s)
    E(d, x+40*s, y-70*s, x+220*s, y+110*s)
    d.line([x-190*s, y+110*s, x+190*s, y+110*s], fill="black", width=LW)
def stars(d, pts):
    for sx, sy, r in pts:
        p = []
        for i in range(10):
            rr = r if i % 2 == 0 else r*0.45
            a = -math.pi/2 + math.pi*i/5
            p.append((sx+rr*math.cos(a), sy+rr*math.sin(a)))
        d.polygon(p, outline="black", width=LW-4)
def flower(d, x, y, r=110):
    for k in range(6):
        a = math.pi*k/3
        E(d, x+r*1.4*math.cos(a)-r*0.7, y+r*1.4*math.sin(a)-r*0.7,
             x+r*1.4*math.cos(a)+r*0.7, y+r*1.4*math.sin(a)+r*0.7, LW-3)
    E(d, x-55, y-55, x+55, y+55)
    d.line([x, y+55, x, y+260], fill="black", width=LW-4)
def pond(d, y):
    for i in range(3):
        wx = 500+i*600
        d.arc([wx, y, wx+400, y+320], 180, 360, fill="black", width=LW)

# Pip the bird sprite
def pip_sprite(size=250):
    S = 360
    im = Image.new("RGB", (S, S), "white")
    d = ImageDraw.Draw(im)
    cx = S//2
    E(d, cx-110, 110, cx+110, 330, 9)
    E(d, cx-150, 150, cx-110, 290, 7)
    E(d, cx+110, 150, cx+150, 290, 7)
    d.polygon([(cx-25, 170), (cx+25, 170), (cx, 200)], outline="black", width=6)
    E(d, cx-55, 130, cx-5, 180, 7); E(d, cx+5, 130, cx+55, 180, 7)
    d.line([cx-60, 100, cx-100, 60], fill="black", width=6)
    d.line([cx+60, 100, cx+100, 60], fill="black", width=6)
    im = im.resize((size, size))
    return im, im.convert("L").point(lambda v: 0 if v > 200 else 255, mode="L")
PIP_SPOTS = [(360, 470, 0), (W-360, 470, 90), (360, 2860, 270), (W-360, 2860, 180), (CX, 470, 30), (CX, 2860, 150)]

def page(title, num, drawfn, spot_idx):
    im = Image.new("RGB", (W, H), "white")
    d = ImageDraw.Draw(im); frame(d)
    d.text((W//2, 330), title, font=F(95), fill="black", anchor="mm")
    drawfn(d)
    d.text((W//2-40, 3030), str(num), font=F(70), fill="black", anchor="mm")
    d.ellipse([W//2+40, 2995, W//2+140, 3065], outline="black", width=6)
    d.line([W//2+40, 3030, W//2+140, 3030], fill="black", width=4)
    sx, sy, rot = PIP_SPOTS[spot_idx % len(PIP_SPOTS)]
    spr, msk = pip_sprite(240)
    if rot:
        spr = spr.rotate(rot, expand=True); msk = msk.rotate(rot, expand=True)
    im.paste(spr, (int(sx-spr.width/2), int(sy-spr.height/2)), msk)
    return im

def save(im, name):
    p = f"{PAGES}/{name}.png"; im.save(p)
    print(name, os.path.getsize(p)//1024, "KB")

# ---------- 24 animals ----------
def a_cat(d):
    x, y, r = CX, 1780, 560
    d.polygon([(x-r, y-r+140), (x-r+60, y-r-220), (x-r+330, y-r+60)], outline="black", width=LW)
    d.polygon([(x+r, y-r+140), (x+r-60, y-r-220), (x+r-330, y-r+60)], outline="black", width=LW)
    E(d, x-r, y-r, x+r, y+r)
    eyes(d, x, y-120, 250)
    d.polygon([(x-70, y+130), (x+70, y+130), (x, y+210)], outline="black", width=LW)
    d.line([x, y+210, x, y+300], fill="black", width=LW)
    smile(d, x, y+180, 150, 150)
    for s in (-1, 1):
        for i in range(3):
            yy = y+90+i*70
            d.line([x+s*(r-30), yy, x+s*(r-400), yy-30+i*30], fill="black", width=LW-3)

def a_dog(d):
    x, y, r = CX, 1800, 540
    E(d, x-810, y-430, x-470, y+330); E(d, x+470, y-430, x+810, y+330)
    E(d, x-r, y-r, x+r, y+r)
    eyes(d, x, y-160, 270)
    E(d, x-250, y+90, x+250, y+470)
    EF(d, x-85, y+190, x+85, y+300)
    d.arc([x-140, y+290, x, y+430], 0, 180, fill="black", width=LW)
    d.arc([x, y+290, x+140, y+430], 0, 180, fill="black", width=LW)
    d.rounded_rectangle([x-90, y+330, x+90, y+470], radius=40, outline="black", width=LW-3)
    grass(d)

def a_rabbit(d):
    x, y, r = CX, 1950, 490
    E(d, x-150, y-r-680, x+50, y-r+20); E(d, x-50, y-r-680, x+150, y-r+20)
    E(d, x-85, y-r-580, x-5, y-r-80, LW-4); E(d, x+5, y-r-580, x+85, y-r-80, LW-4)
    E(d, x-r, y-r, x+r, y+r)
    eyes(d, x, y-110, 200)
    d.polygon([(x-55, y+90), (x+55, y+90), (x, y+160)], outline="black", width=LW)
    d.rectangle([x-60, y+160, x+60, y+225], outline="black", width=LW-3)
    d.line([x, y+160, x, y+225], fill="black", width=LW-3)
    for s in (-1, 1):
        for i in range(2):
            yy = y+60+i*60
            d.line([x+s*460, yy, x+s*180, yy-10], fill="black", width=LW-4)
    cxp = x-800
    flower(d, cxp, y+150, 100)
    grass(d)

def a_bear(d):
    x, y, r = CX, 1780, 590
    E(d, x-r-190, y-r-60, x-r+130, y-r+260); E(d, x+r-130, y-r-60, x+r+190, y-r+260)
    E(d, x-r, y-r, x+r, y+r)
    eyes(d, x, y-140, 260)
    E(d, x-230, y+100, x+230, y+460)
    E(d, x-95, y+190, x+95, y+300)
    smile(d, x, y+280, 130, 120)
    d.arc([x-360, y-260, x-160, y-60], 200, 340, fill="black", width=LW-4)
    d.arc([x+160, y-260, x+360, y-60], 200, 340, fill="black", width=LW-4)

def a_panda(d):
    x, y, r = CX, 1780, 570
    E(d, x-r-180, y-r-40, x-r+140, y-r+280); E(d, x+r-140, y-r-40, x+r+180, y-r+280)
    E(d, x-r, y-r, x+r, y+r)
    for s in (-1, 1):
        E(d, x+s*260-130, y-250, x+s*260+130, y+50, LW-3)
        E(d, x+s*260-45, y-170, x+s*260+45, y-80, LW-4)
    for ex in (-260, 260):
        E(d, x+ex-90, y-140-90, x+ex+90, y-140+90)
        EF(d, x+ex-30, y-140-30, x+ex+30, y-140+30)
    E(d, x-90, y+150, x+90, y+250)
    smile(d, x, y+230, 120, 110)
    for bx in (330, W-330):
        d.rounded_rectangle([bx-45, 1500, bx+45, 2500], radius=20, outline="black", width=LW-3)
        for i in range(4):
            d.line([bx-45, 2400-i*250, bx+45, 2400-i*250], fill="black", width=LW-4)
        E(d, bx-110, 1450, bx+110, 1670, LW-4)
        E(d, bx-110, 2450, bx+110, 2670, LW-4)

def a_fox(d):
    x, y, r = CX, 1820, 520
    d.polygon([(x-r+40, y-r+160), (x-r+120, y-r-280), (x-r+380, y-r+80)], outline="black", width=LW)
    d.polygon([(x+r-40, y-r+160), (x+r-120, y-r-280), (x+r-380, y-r+80)], outline="black", width=LW)
    E(d, x-r, y-r, x+r, y+r)
    eyes(d, x, y-130, 250)
    d.polygon([(x-80, y+120), (x+80, y+120), (x, y+210)], fill="black")
    for s in (-1, 1):
        d.line([x+s*(r-140), y+150, x+s*(r-60), y+60, x+s*(r-140), y-40], fill="black", width=LW-4, joint="curve")
    d.arc([x+560, y+250, x+900, y+600], 200, 340, fill="black", width=LW)
    d.arc([x+560, y+250, x+900, y+600], 250, 290, fill="black", width=LW+30)

def a_lion(d):
    x, y = CX, 1780
    for i in range(14):
        a = math.pi*i/7
        E(d, x+600*math.cos(a)-150, y+600*math.sin(a)-150, x+600*math.cos(a)+150, y+600*math.sin(a)+150, LW-3)
    E(d, x-600, y-600, x+600, y+600)
    E(d, x-430, y-430, x+430, y+430)
    eyes(d, x, y-130, 210)
    d.polygon([(x-100, y+110), (x+100, y+110), (x, y+220)], fill="black")
    smile(d, x, y+200, 130, 120)
    sun(d, 450, 520, 120)

def a_tiger(d):
    x, y, r = CX, 1800, 520
    E(d, x-r-160, y-r, x-r+140, y-r+280); E(d, x+r-140, y-r, x+r+160, y-r+280)
    E(d, x-r, y-r, x+r, y+r)
    for i in range(3):
        d.line([x-120+i*120, y-r+40, x-120+i*120, y-r+220], fill="black", width=LW+8)
    eyes(d, x, y-130, 250)
    d.polygon([(x-80, y+120), (x+80, y+120), (x, y+210)], outline="black", width=LW)
    smile(d, x, y+190, 130, 120)
    for s in (-1, 1):
        for i in range(2):
            d.line([x+s*(r-60), y+180+i*80, x+s*(r+120), y+150+i*80], fill="black", width=LW+4)
    grass(d)

def a_frog(d):
    x, y = CX, 1900
    E(d, x-620, y-220, x+620, y+220)
    for ex in (-330, 330):
        E(d, x+ex-165, y-450, x+ex+165, y-120)
        E(d, x+ex-85, y-360, x+ex+85, y-210)
        EF(d, x+ex-28, y-310, x+ex+28, y-260)
    d.arc([x-330, y-60, x+330, y+200], 15, 165, fill="black", width=LW)
    E(d, x-120, y-140, x-20, y-40, LW-4); E(d, x+20, y-140, x+120, y-40, LW-4)
    E(d, x-640, y+280, x+640, y+560)

def a_pig(d):
    x, y, r = CX, 1800, 540
    d.polygon([(x-r+80, y-r+120), (x-r+140, y-r-140), (x-r+340, y-r+40)], outline="black", width=LW-3)
    d.polygon([(x+r-80, y-r+120), (x+r-140, y-r-140), (x+r-340, y-r+40)], outline="black", width=LW-3)
    E(d, x-r, y-r, x+r, y+r)
    eyes(d, x, y-180, 270)
    E(d, x-200, y+60, x+200, y+360)
    E(d, x-120, y+150, x-40, y+270, LW-3); E(d, x+40, y+150, x+120, y+270, LW-3)
    smile(d, x, y+330, 150, 90)
    for i in range(2):
        d.arc([400+i*350, H-750, 700+i*350, H-450], 180, 360, fill="black", width=LW-3)

def a_cow(d):
    x, y, r = CX, 1800, 540
    d.polygon([(x-r+60, y-r+100), (x-r+120, y-r-160), (x-r+300, y-r+20)], outline="black", width=LW-3)
    d.polygon([(x+r-60, y-r+100), (x+r-120, y-r-160), (x+r-300, y-r+20)], outline="black", width=LW-3)
    E(d, x-r, y-r, x+r, y+r)
    E(d, x-140, y-r+230, x+140, y-r+430, LW-4)
    E(d, x-400, y+100, x-220, y+280, LW-4); E(d, x+220, y+100, x+400, y+280, LW-4)
    eyes(d, x, y-160, 270)
    E(d, x-280, y+120, x+280, y+440)
    E(d, x-170, y+220, x-70, y+340, LW-3); E(d, x+70, y+220, x+170, y+340, LW-3)
    smile(d, x, y+400, 140, 80)
    flower(d, 450, 2600, 100)

def a_monkey(d):
    x, y, r = CX, 1800, 520
    E(d, x-r-220, y-260, x-r+80, y+40); E(d, x+r-80, y-260, x+r+220, y+40)
    E(d, x-r, y-r, x+r, y+r)
    E(d, x-300, y-200, x+300, y+380, LW-3)
    eyes(d, x, y-140, 200)
    E(d, x-70, y+80, x+70, y+170)
    smile(d, x, y+150, 150, 120)
    bx = x-820
    d.arc([bx-160, y-100, bx+160, y+300], 40, 320, fill="black", width=LW-3)
    d.line([bx+110, y+180, bx+160, y+180], fill="black", width=LW-3)

def a_elephant(d):
    x, y, r = CX, 1820, 540
    E(d, x-r-320, y-350, x-r+120, y+250); E(d, x+r-120, y-350, x+r+320, y+250)
    E(d, x-r, y-r, x+r, y+r)
    eyes(d, x, y-170, 260)
    d.rounded_rectangle([x-95, y+40, x+95, y+470], radius=80, outline="black", width=LW)
    E(d, x-130, y+400, x+130, y+560, LW-3)
    smile(d, x-330, y+180, 110, 90); smile(d, x+330, y+180, 110, 90)
    for dx, dy in [(-200, -550), (150, -650), (350, -500)]:
        E(d, x+dx-35, y+dy-50, x+dx+35, y+dy+50, LW-5)

def a_owl(d):
    x, y, r = CX, 1800, 500
    d.polygon([(x-r+60, y-r+80), (x-r+140, y-r-160), (x-r+320, y-r+20)], outline="black", width=LW)
    d.polygon([(x+r-60, y-r+80), (x+r-140, y-r-160), (x+r-320, y-r+20)], outline="black", width=LW)
    E(d, x-r, y-r, x+r, y+r)
    for s in (-1, 1):
        E(d, x+s*220-130, y-220-130, x+s*220+130, y-220+130)
        E(d, x+s*220-45, y-220-45, x+s*220+45, y-220+45, LW-3)
    d.arc([x-350, y-400, x-150, y-240], 180, 360, fill="black", width=LW-3)
    d.arc([x+150, y-400, x+350, y-240], 0, 180, fill="black", width=LW-3)
    d.polygon([(x-70, y-60), (x+70, y-60), (x, y+60)], outline="black", width=LW)
    for i in range(3):
        d.arc([x-300+i*200, y+220, x-100+i*200, y+360], 200, 340, fill="black", width=LW-4)
    d.arc([380, 420, 700, 740], 50, 310, fill="black", width=LW)
    d.arc([460, 470, 700, 710], 70, 290, fill="black", width=LW-3)
    stars(d, [(W-500, 600, 90), (W-750, 900, 70), (480, 1000, 70)])

def a_penguin(d):
    x, y = CX, 1800
    E(d, x-430, y-620, x+430, y+620)
    E(d, x-300, y-420, x+300, y+420, LW-3)
    eyes(d, x, y-260, 170)
    d.polygon([(x-70, y-140), (x+70, y-140), (x, y-50)], outline="black", width=LW-3)
    d.polygon([(x-140, y+180), (x, y+80), (x, y+280)], outline="black", width=LW-3)
    d.polygon([(x+140, y+180), (x, y+80), (x, y+280)], outline="black", width=LW-3)
    d.arc([x-560, y-100, x-430, y+300], 90, 270, fill="black", width=LW-3)
    d.arc([x+430, y-100, x+560, y+300], 270, 450, fill="black", width=LW-3)
    d.line([300, H-750, W-300, H-750], fill="black", width=LW)
    stars(d, [(450, 650, 70), (W-450, 750, 90), (W-650, 1100, 60)])

def a_duck(d):
    x, y, r = CX, 1750, 480
    E(d, x-r, y-r, x+r, y+r)
    E(d, x-220, y+40, x+220, y+220, LW-3)
    d.ellipse([x-220, y+40, x+220, y+220], outline="black", width=LW-3)
    eyes(d, x, y-150, 220)
    for rx in (x-650, x+650):
        d.rounded_rectangle([rx-35, y+350, rx+35, y+750], radius=15, outline="black", width=LW-3)
        for i in range(3):
            d.line([rx-35, y+450+i*100, rx-115, y+400+i*100], fill="black", width=LW-4)
            d.line([rx+35, y+450+i*100, rx+115, y+400+i*100], fill="black", width=LW-4)
    pond(d, y+650)

def a_chick(d):
    x, y, r = CX, 1750, 440
    for i in range(12):
        a = math.pi*i/6
        E(d, x+(r+40)*math.cos(a)-90, y+(r+40)*math.sin(a)-90, x+(r+40)*math.cos(a)+90, y+(r+40)*math.sin(a)+90, LW-4)
    E(d, x-r, y-r, x+r, y+r)
    d.arc([x-160, y-180, x-40, y-60], 180, 360, fill="black", width=LW)
    d.arc([x+40, y-180, x+160, y-60], 0, 180, fill="black", width=LW)
    d.polygon([(x-60, y-40), (x+60, y-40), (x, y+50)], outline="black", width=LW-3)
    zx = [x-420+k*140 for k in range(7)]
    d.line([c for pair in zip(zx, [y+330+(-70 if k % 2 else 0) for k in range(7)]) for c in pair], fill="black", width=LW-3, joint="curve")
    d.line([x-420, y+330, x-420, y+500], fill="black", width=LW-3)
    d.line([x+420, y+330, x+420, y+500], fill="black", width=LW-3)

def a_koala(d):
    x, y, r = CX, 1800, 520
    E(d, x-r-200, y-280, x-r+120, y+40); E(d, x+r-120, y-280, x+r+200, y+40)
    E(d, x-r-120, y-200, x-r+40, y-40, LW-4); E(d, x+r-40, y-200, x+r+120, y-40, LW-4)
    E(d, x-r, y-r, x+r, y+r)
    eyes(d, x, y-150, 250)
    E(d, x-110, y+50, x+110, y+300)
    smile(d, x, y+270, 150, 90)
    bx = x+880
    d.rounded_rectangle([bx-30, y-500, bx+30, y+400], radius=12, outline="black", width=LW-3)
    for i in range(4):
        E(d, bx-165, y+250-i*220, bx-45, y+370-i*220, LW-4)
        E(d, bx+45, y+250-i*220, bx+165, y+370-i*220, LW-4)

def a_hamster(d):
    x, y, r = CX, 1820, 520
    E(d, x-r-140, y-r+40, x-r+120, y-r+300); E(d, x+r-120, y-r+40, x+r+140, y-r+300)
    E(d, x-r, y-r, x+r, y+r)
    eyes(d, x, y-150, 250)
    d.arc([x-280, y+80, x-80, y+280], 200, 340, fill="black", width=LW-4)
    d.arc([x+80, y+80, x+280, y+280], 20, 160, fill="black", width=LW-4)
    E(d, x-60, y+120, x+60, y+200)
    smile(d, x, y+180, 120, 100)
    for s in (-1, 1):
        E(d, x+s*330-45, y+330-70, x+s*330+45, y+330+70, LW-4)
    for sx, sy in [(x-420, y+520), (x+420, y+520), (x, y+580)]:
        E(d, sx-55, sy-35, sx+55, sy+35, LW-4)

def a_raccoon(d):
    x, y, r = CX, 1800, 520
    d.polygon([(x-r+60, y-r+140), (x-r+140, y-r-200), (x-r+360, y-r+60)], outline="black", width=LW)
    d.polygon([(x+r-60, y-r+140), (x+r-140, y-r-200), (x+r-360, y-r+60)], outline="black", width=LW)
    E(d, x-r, y-r, x+r, y+r)
    d.line([x-r+60, y-260, x+r-60, y-260], fill="black", width=LW-3)
    d.line([x-r+60, y-20, x+r-60, y-20], fill="black", width=LW-3)
    eyes(d, x, y-140, 230)
    d.polygon([(x-75, y+110), (x+75, y+110), (x, y+200)], fill="black")
    smile(d, x, y+180, 130, 110)
    d.arc([400, 500, 680, 780], 50, 310, fill="black", width=LW-3)
    stars(d, [(W-550, 650, 85), (W-800, 950, 65)])

def a_deer(d):
    x, y, r = CX, 1850, 500
    for s in (-1, 1):
        d.line([x+s*(r-120), y-r+40, x+s*(r-120), y-r-330], fill="black", width=LW-2)
        for i, (dx, ln) in enumerate([(-90, 150), (90, 150), (-70, 120)]):
            d.line([x+s*(r-120), y-r-330+80+i*70, x+s*(r-120)+dx, y-r-330+80+i*70-ln], fill="black", width=LW-4)
    E(d, x-r-150, y-r+60, x-r+130, y-r+340); E(d, x+r-130, y-r+60, x+r+150, y-r+340)
    E(d, x-r, y-r, x+r, y+r)
    E(d, x-260, y-r+180, x-120, y-r+320, LW-4)
    E(d, x+120, y-300, x+260, y-160, LW-4)
    eyes(d, x, y-130, 240)
    E(d, x-70, y+100, x+70, y+190)
    smile(d, x, y+170, 140, 110)
    px = x-820
    d.polygon([(px-160, y+350), (px, y-100), (px+160, y+350)], outline="black", width=LW-3)
    d.polygon([(px-120, y+100), (px, y-200), (px+120, y+100)], outline="black", width=LW-4)
    d.line([px, y+350, px, y+480], fill="black", width=LW-3)

def a_hippo(d):
    x, y = CX, 1850
    E(d, x-650, y-330, x+650, y+330)
    E(d, x-140, y-430, x-40, y-330, LW-3); E(d, x+40, y-430, x+140, y-330, LW-3)
    E(d, x-480-140, y-330, x-480+100, y-90); E(d, x+380, y-330, x+620, y-90)
    for ex in (-430, 430):
        E(d, x+ex-70, y-140-70, x+ex+70, y-140+70)
        EF(d, x+ex-25, y-140-25, x+ex+25, y-140+25)
    d.arc([x-250, y+50, x+250, y+280], 20, 160, fill="black", width=LW)
    d.line([300, y+330, W-300, y+330], fill="black", width=LW)
    for bx, by, br in [(x-350, y+480, 45), (x+300, y+520, 55), (x+500, y+460, 40)]:
        E(d, bx-br, by-br, bx+br, by+br, LW-4)

def a_sheep(d):
    x, y = CX, 1850
    for i in range(12):
        a = math.pi*i/6
        E(d, x+560*math.cos(a)-130, y+560*math.sin(a)-130, x+560*math.cos(a)+130, y+560*math.sin(a)+130, LW-3)
    E(d, x-380, y-380, x+380, y+380)
    E(d, x-460, y-100, x-340, y+60, LW-4); E(d, x+340, y-100, x+460, y+60, LW-4)
    eyes(d, x, y-110, 190)
    E(d, x-55, y+90, x+55, y+170)
    smile(d, x, y+150, 130, 110)
    for px in (330, W-330):
        d.rounded_rectangle([px-35, y-150, px+35, y+450], radius=12, outline="black", width=LW-3)
        d.line([px-140, y+150, px+140, y+150], fill="black", width=LW-4)

def a_family(d):
    sun(d, W-480, 540, 110)
    for bx, by in [(CX-300, 700), (CX+100, 620)]:
        d.arc([bx-60, by-30, bx, by+30], 200, 340, fill="black", width=LW-4)
        d.arc([bx, by-30, bx+60, by+30], 200, 340, fill="black", width=LW-4)
    tx = 420
    d.polygon([(tx-150, 2600), (tx, 2100), (tx+150, 2600)], outline="black", width=LW-3)
    d.line([tx, 2600, tx, 2720], fill="black", width=LW-3)
    tx2 = W-420
    d.polygon([(tx2-150, 2600), (tx2, 2100), (tx2+150, 2600)], outline="black", width=LW-3)
    d.line([tx2, 2600, tx2, 2720], fill="black", width=LW-3)
    d.line([300, 2720, W-300, 2720], fill="black", width=LW)
    faces = [(CX-640, 2050, 330, "bear"), (CX, 1980, 380, "rabbit"), (CX+640, 2050, 330, "fox")]
    for fx, fy, fr, kind in faces:
        if kind == "bear":
            E(d, fx-fr-140, fy-fr+20, fx-fr+110, fy-fr+270); E(d, fx+fr-110, fy-fr+20, fx+fr+140, fy-fr+270)
        elif kind == "rabbit":
            E(d, fx-110, fy-fr-460, fx+10, fy-fr+40); E(d, fx-10, fy-fr-460, fx+110, fy-fr+40)
        else:
            d.polygon([(fx-fr+30, fy-fr+120), (fx-fr+90, fy-fr-180), (fx-fr+280, fy-fr+60)], outline="black", width=LW-3)
            d.polygon([(fx+fr-30, fy-fr+120), (fx+fr-90, fy-fr-180), (fx+fr-280, fy-fr+60)], outline="black", width=LW-3)
        E(d, fx-fr, fy-fr, fx+fr, fy+fr)
        eyes(d, fx, fy-70, int(fr*0.42), max(50, int(fr*0.15)))
        E(d, fx-45, fy+60, fx+45, fy+130, LW-4)
        smile(d, fx, fy+110, int(fr*0.28), int(fr*0.24))

BOOK = [("Cat",1,a_cat),("Dog",2,a_dog),("Rabbit",3,a_rabbit),("Bear",4,a_bear),
("Panda",5,a_panda),("Fox",6,a_fox),("Lion",7,a_lion),("Tiger",8,a_tiger),
("Frog",9,a_frog),("Pig",10,a_pig),("Cow",11,a_cow),("Monkey",12,a_monkey),
("Elephant",13,a_elephant),("Owl",14,a_owl),("Penguin",15,a_penguin),("Duck",16,a_duck),
("Chick",17,a_chick),("Koala",18,a_koala),("Hamster",19,a_hamster),("Raccoon",20,a_raccoon),
("Deer",21,a_deer),("Hippo",22,a_hippo),("Sheep",23,a_sheep),("Forest Family",24,a_family)]
for i, (title, num, fn) in enumerate(BOOK):
    im = page(title, num, fn, (i*2+1) % len(PIP_SPOTS))
    save(im, f"v{i+1:02d}_{title.lower().replace(' ','_')}")
print("ALL 24 ANIMAL PAGES DONE")
