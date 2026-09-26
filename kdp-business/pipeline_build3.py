#!/usr/bin/env python3
"""Build KDP interior + cover + validation for Book 3: Butterfly Garden. Author: Lily Meadow."""
import os, glob
from PIL import Image, ImageDraw, ImageFont
import img2pdf
from pypdf import PdfReader

BASE = "/home/runner/work/PlayGround/PlayGround/kdp-business"
W, H = 2550, 3300
LW = 11
FB = "/usr/share/fonts/truetype/lato/Lato-Bold.ttf"
FR = "/usr/share/fonts/truetype/lato/Lato-Regular.ttf"
AUTHOR = "Lily Meadow"
def F(p, s):
    try: return ImageFont.truetype(p, s)
    except: return ImageFont.load_default()

def frame(d):
    d.rectangle([70, 70, W-70, H-70], outline="black", width=LW)
    d.rectangle([110, 110, W-110, H-110], outline="black", width=4)

def blank():
    return Image.new("RGB", (W, H), "white")

t = blank(); dt = ImageDraw.Draw(t); frame(dt)
dt.text((W//2, 1100), "HAPPY HUES", font=F(FB, 240), fill="black", anchor="mm")
dt.text((W//2, 1400), "Butterfly Garden", font=F(FB, 130), fill="black", anchor="mm")
dt.text((W//2, 1570), "Bella's Journey", font=F(FB, 110), fill="black", anchor="mm")
dt.text((W//2, 1850), "25 Flower Mandalas  •  Ages 4-8", font=F(FR, 85), fill="black", anchor="mm")
dt.text((W//2, 2050), "Find Bella on every page!", font=F(FB, 85), fill="black", anchor="mm")
dt.text((W//2, 2250), AUTHOR, font=F(FB, 90), fill="black", anchor="mm")
t.save(f"{BASE}/interior3_p00_title.png")

c = blank(); dc = ImageDraw.Draw(c); frame(dc)
dc.text((W//2, 1300), f"© 2026 {AUTHOR}", font=F(FB, 90), fill="black", anchor="mm")
dc.text((W//2, 1450), "All rights reserved. Original artwork.", font=F(FR, 70), fill="black", anchor="mm")
dc.text((W//2, 1700), "This book belongs to:", font=F(FB, 90), fill="black", anchor="mm")
dc.line([W//2-500, 1900, W//2+500, 1900], fill="black", width=5)
c.save(f"{BASE}/interior3_p01_copyright.png")

b = blank(); db = ImageDraw.Draw(b); frame(db)
db.text((W//2, 1200), "Meet Bella!", font=F(FB, 130), fill="black", anchor="mm")
for j, line in enumerate(["Bella the butterfly loves gardens.", "She hides on EVERY page of this book.", "Can you find her 25 times?", "", "Use crayons, markers or pencils."]):
    db.text((W//2, 1450+j*130), line, font=F(FR if j != 2 else FB, 75), fill="black", anchor="mm")
b.save(f"{BASE}/interior3_p02_welcome.png")

arts = sorted(glob.glob(f"{BASE}/pages/book3/b*.png"))
assert len(arts) == 25, len(arts)
order = [f"{BASE}/interior3_p00_title.png", f"{BASE}/interior3_p01_copyright.png",
         f"{BASE}/interior3_p02_welcome.png"]
bl = blank(); bl.save("/tmp/kdp_blank3.png")
for a in arts:
    order += [a, "/tmp/kdp_blank3.png"]
with open(f"{BASE}/interior/Book3_ButterflyGarden_INTERIOR.pdf", "wb") as f:
    f.write(img2pdf.convert(order, layout_fun=img2pdf.get_fixed_dpi_layout_fun((300, 300))))
r = PdfReader(f"{BASE}/interior/Book3_ButterflyGarden_INTERIOR.pdf")
pg = r.pages[0].mediabox
print(f"INTERIOR3: {len(r.pages)} pages, {float(pg.width):.0f}x{float(pg.height):.0f}pt")
assert len(r.pages) == 53 and abs(float(pg.width)-612) < 2 and abs(float(pg.height)-792) < 2
print("INTERIOR3 VALID ✅")

N = len(r.pages)
spine_in = N * 0.002252
CW, CH = int((0.125+8.5+spine_in+8.5+0.125)*300), int(11.25*300)
cov = Image.new("RGB", (CW, CH), (90, 40, 90))
dcv = ImageDraw.Draw(cov)
PLUM = (122, 60, 122); CREAM = (250, 245, 250); LEAF = (80, 160, 90)
back_x0 = int(0.125*300); front_x0 = int((0.125+8.5+spine_in)*300); front_w = int(8.5*300)
dcv.rectangle([front_x0, 0, front_x0+front_w, CH], fill=CREAM)
dcv.ellipse([front_x0+front_w//2-520, 330-440, front_x0+front_w//2+520, 330+440], fill=PLUM)
dcv.text((front_x0+front_w//2, 620), "HAPPY HUES", font=F(FB, 150), fill=(50, 20, 50), anchor="mm")
dcv.text((front_x0+front_w//2, 800), "Butterfly Garden", font=F(FB, 120), fill=PLUM, anchor="mm")
dcv.text((front_x0+front_w//2, 950), "Bella's Journey", font=F(FB, 110), fill=PLUM, anchor="mm")
dcv.text((front_x0+front_w//2, 1120), "25 Flowers • Bella Hides Everywhere • 4-8", font=F(FR, 60), fill=(90, 100, 110), anchor="mm")
for i, a in enumerate([arts[0], arts[7], arts[14]]):
    th = Image.open(a).resize((560, 724))
    cov.paste(th, (front_x0+180+i*680, 1300))
    dcv.rectangle([front_x0+180+i*680, 1300, front_x0+180+i*680+560, 1300+724], outline=PLUM, width=8)
dcv.text((front_x0+front_w//2, 2250), "Rose • Sunflower • Lotus & more!", font=F(FB, 64), fill=(50, 20, 50), anchor="mm")
dcv.text((front_x0+front_w//2, 3050), AUTHOR, font=F(FB, 85), fill=PLUM, anchor="mm")
dcv.text((back_x0+int(8.5*300)//2, 500), "Can You Find Bella?", font=F(FB, 120), fill="white", anchor="mm")
for j, line in enumerate(["25 flower mandalas with a secret:", "Bella the butterfly hides", "on EVERY page!", "", "Single-sided pages.", "Markers won't bleed through!"]):
    dcv.text((back_x0+int(8.5*300)//2, 800+j*110), line, font=F(FR, 64), fill=(220, 205, 225), anchor="mm")
th2 = Image.open(arts[4]).resize((640, 826))
cov.paste(th2, (back_x0+int(8.5*300)//2-320, 1700))
dcv.rectangle([back_x0+int(8.5*300)//2-320, 1700, back_x0+int(8.5*300)//2+320, 1700+826], outline=LEAF, width=8)
dcv.rectangle([back_x0+int(8.5*300)-700, CH-450, back_x0+int(8.5*300)-100, CH-100], fill="white")
dcv.text((back_x0+int(8.5*300)-400, CH-275), "ISBN", font=F(FB, 60), fill="black", anchor="mm")
cov.save(f"{BASE}/cover/Book3_ButterflyGarden_COVER.pdf", resolution=300.0)
cov.save(f"{BASE}/cover/Book3_cover_preview.png")
print("COVER3 ok — author at bottom:", AUTHOR)
