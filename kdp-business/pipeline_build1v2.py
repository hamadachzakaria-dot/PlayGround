#!/usr/bin/env python3
"""Build Book 1 v2: Cute Animals Bold & Easy — interior + cover + validation."""
import os, glob, re
from PIL import Image, ImageDraw, ImageFont
import img2pdf
from pypdf import PdfReader

BASE = "/home/runner/work/PlayGround/PlayGround/kdp-business"
W, H = 2550, 3300
LW = 12
FB = "/usr/share/fonts/truetype/lato/Lato-Bold.ttf"
FR = "/usr/share/fonts/truetype/lato/Lato-Regular.ttf"
AUTHOR = "Lily Meadow"
def F(p, s):
    try: return ImageFont.truetype(p, s)
    except: return ImageFont.load_default()

def frame(d):
    d.rectangle([130, 130, W-130, H-130], outline="black", width=LW)
    d.rectangle([170, 170, W-170, H-170], outline="black", width=4)

def blank():
    return Image.new("RGB", (W, H), "white")

t = blank(); dt = ImageDraw.Draw(t); frame(dt)
dt.text((W//2, 1050), "HAPPY HUES", font=F(FB, 240), fill="black", anchor="mm")
dt.text((W//2, 1350), "Cute Animals", font=F(FB, 150), fill="black", anchor="mm")
dt.text((W//2, 1530), "Bold & Easy Coloring Book", font=F(FB, 105), fill="black", anchor="mm")
dt.text((W//2, 1800), "24 Cute Designs  •  Ages 4-8", font=F(FR, 85), fill="black", anchor="mm")
dt.text((W//2, 2000), "Find Pip on every page!", font=F(FB, 85), fill="black", anchor="mm")
dt.text((W//2, 2200), AUTHOR, font=F(FB, 90), fill="black", anchor="mm")
t.save(f"{BASE}/interior1v2_p00_title.png")

c = blank(); dc = ImageDraw.Draw(c); frame(dc)
dc.text((W//2, 1250), f"© 2026 {AUTHOR}", font=F(FB, 90), fill="black", anchor="mm")
dc.text((W//2, 1400), "All rights reserved. Original artwork.", font=F(FR, 70), fill="black", anchor="mm")
dc.text((W//2, 1650), "This book belongs to:", font=F(FB, 90), fill="black", anchor="mm")
dc.line([W//2-500, 1850, W//2+500, 1850], fill="black", width=5)
c.save(f"{BASE}/interior1v2_p01_copyright.png")

b = blank(); db = ImageDraw.Draw(b); frame(db)
db.text((W//2, 1150), "Meet Pip!", font=F(FB, 140), fill="black", anchor="mm")
for j, line in enumerate(["Pip the little bird loves animals.", "He hides on EVERY page of this book.", "Can you find him 24 times?", "", "Big bold lines for little hands."]):
    db.text((W//2, 1420+j*130), line, font=F(FR if j != 2 else FB, 75), fill="black", anchor="mm")
b.save(f"{BASE}/interior1v2_p02_welcome.png")

arts = sorted(glob.glob(f"{BASE}/pages/book1v2/v*.png"),
              key=lambda p: int(re.search(r"v(\d+)", p).group(1)))
assert len(arts) == 24, len(arts)
order = [f"{BASE}/interior1v2_p00_title.png", f"{BASE}/interior1v2_p01_copyright.png",
         f"{BASE}/interior1v2_p02_welcome.png"]
bl = blank(); bl.save("/tmp/kdp_blank1v2.png")
for a in arts:
    order += [a, "/tmp/kdp_blank1v2.png"]
with open(f"{BASE}/interior/Book1_CuteAnimals_INTERIOR.pdf", "wb") as f:
    f.write(img2pdf.convert(order, layout_fun=img2pdf.get_fixed_dpi_layout_fun((300, 300))))
r = PdfReader(f"{BASE}/interior/Book1_CuteAnimals_INTERIOR.pdf")
pg = r.pages[0].mediabox
print(f"INTERIOR1v2: {len(r.pages)} pages, {float(pg.width):.0f}x{float(pg.height):.0f}pt")
assert len(r.pages) == 51 and abs(float(pg.width)-612) < 2 and abs(float(pg.height)-792) < 2
print("INTERIOR1v2 VALID ✅")

N = len(r.pages)
spine_in = N * 0.002252
CW, CH = int((0.125+8.5+spine_in+8.5+0.125)*300), int(11.25*300)
cov = Image.new("RGB", (CW, CH), (13, 60, 100))
dcv = ImageDraw.Draw(cov)
BLUE = (20, 110, 170); CREAM = (248, 246, 238); SUN = (245, 180, 60)
back_x0 = int(0.125*300); front_x0 = int((0.125+8.5+spine_in)*300); front_w = int(8.5*300)
dcv.rectangle([front_x0, 0, front_x0+front_w, CH], fill=CREAM)
dcv.ellipse([front_x0+front_w//2-520, 300-440, front_x0+front_w//2+520, 300+440], fill=BLUE)
dcv.text((front_x0+front_w//2, 560), "HAPPY HUES", font=F(FB, 150), fill=(10, 35, 60), anchor="mm")
dcv.text((front_x0+front_w//2, 740), "Cute Animals", font=F(FB, 135), fill=BLUE, anchor="mm")
dcv.text((front_x0+front_w//2, 900), "Bold & Easy Coloring Book", font=F(FB, 85), fill=BLUE, anchor="mm")
dcv.rounded_rectangle([front_x0+front_w//2-330, 1010, front_x0+front_w//2+330, 1110], radius=50, fill=SUN)
dcv.text((front_x0+front_w//2, 1060), "AGES 4-8 • 24 DESIGNS", font=F(FB, 48), fill=(10, 35, 60), anchor="mm")
for i, a in enumerate([arts[0], arts[6], arts[13]]):
    th = Image.open(a).resize((560, 724))
    cov.paste(th, (front_x0+180+i*680, 1280))
    dcv.rectangle([front_x0+180+i*680, 1280, front_x0+180+i*680+560, 1280+724], outline=BLUE, width=8)
dcv.text((front_x0+front_w//2, 2220), "Cat • Lion • Owl & 21 more friends!", font=F(FB, 62), fill=(10, 35, 60), anchor="mm")
dcv.text((front_x0+front_w//2, 3060), AUTHOR, font=F(FB, 85), fill=BLUE, anchor="mm")
dcv.text((back_x0+int(8.5*300)//2, 480), "Big, Bold & Easy Fun!", font=F(FB, 120), fill="white", anchor="mm")
for j, line in enumerate(["24 original cute animals:", "cats, dogs, lions, owls, penguins", "and a forest family finale!", "", "Single-sided pages — no bleed.", "Pip the bird hides everywhere!"]):
    dcv.text((back_x0+int(8.5*300)//2, 780+j*110), line, font=F(FR, 64), fill=(205, 220, 235), anchor="mm")
th2 = Image.open(arts[23]).resize((640, 826))
cov.paste(th2, (back_x0+int(8.5*300)//2-320, 1700))
dcv.rectangle([back_x0+int(8.5*300)//2-320, 1700, back_x0+int(8.5*300)//2+320, 1700+826], outline=SUN, width=8)
dcv.rectangle([back_x0+int(8.5*300)-700, CH-450, back_x0+int(8.5*300)-100, CH-100], fill="white")
dcv.text((back_x0+int(8.5*300)-400, CH-275), "ISBN", font=F(FB, 60), fill="black", anchor="mm")
cov.save(f"{BASE}/cover/Book1_CuteAnimals_COVER.pdf", resolution=300.0)
cov.save(f"{BASE}/cover/Book1v2_cover_preview.png")
print("COVER1v2 ok — author:", AUTHOR)
