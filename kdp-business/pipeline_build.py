#!/usr/bin/env python3
"""Build KDP interior PDF + full cover PDF + brand logo. Validates output."""
import os, glob
from PIL import Image, ImageDraw, ImageFont
import img2pdf
from pypdf import PdfReader

BASE = "/home/runner/work/PlayGround/PlayGround/kdp-business"
W, H = 2550, 3300  # 8.5x11 @300dpi
LW = 11
FB = "/usr/share/fonts/truetype/lato/Lato-Bold.ttf"
FR = "/usr/share/fonts/truetype/lato/Lato-Regular.ttf"
def F(p, s):
    try: return ImageFont.truetype(p, s)
    except: return ImageFont.load_default()

# ---------- brand logo ----------
logo = Image.new("RGB", (2000, 2000), "white")
dl = ImageDraw.Draw(logo)
cols = [(255, 107, 107), (255, 195, 18), (29, 220, 138), (84, 160, 255), (177, 124, 255)]
for i, c in enumerate(cols):
    dl.arc([300+i*40, 500+i*40, 1700-i*40, 1500-i*40], 200, 340, fill=c, width=60)
dl.arc([300, 400, 1700, 1600], 0, 360, fill=(11, 28, 44), width=40)
dl.text((1000, 1050), "HappyHues", font=F(FB, 190), fill=(11, 28, 44), anchor="mm")
dl.text((1000, 1230), "S T U D I O", font=F(FB, 90), fill=(212, 175, 55), anchor="mm")
dl.text((1000, 1420), "COLORING BOOKS", font=F(FR, 70), fill=(120, 130, 140), anchor="mm")
logo.save(f"{BASE}/brand/logo_2000.png")
print("logo ok")

# ---------- front matter ----------
def frame(d):
    d.rectangle([70, 70, W-70, H-70], outline="black", width=LW)
    d.rectangle([110, 110, W-110, H-110], outline="black", width=4)

def blank():
    return Image.new("RGB", (W, H), "white")

t = new = Image.new("RGB", (W, H), "white")
dt = ImageDraw.Draw(t); frame(dt)
dt.text((W//2, 1150), "HAPPY HUES", font=F(FB, 260), fill="black", anchor="mm")
dt.text((W//2, 1450), "Cute Animals & Fun", font=F(FB, 130), fill="black", anchor="mm")
dt.text((W//2, 1620), "Coloring Book", font=F(FB, 130), fill="black", anchor="mm")
dt.text((W//2, 1900), "25 Fun Pages  •  Ages 4-8", font=F(FR, 90), fill="black", anchor="mm")
dt.text((W//2, 2100), "HappyHues Studio", font=F(FB, 90), fill="black", anchor="mm")
t.save(f"{BASE}/interior_p00_title.png")

c = blank(); dc = ImageDraw.Draw(c); frame(dc)
dc.text((W//2, 1300), "© 2026 HappyHues Studio", font=F(FB, 90), fill="black", anchor="mm")
dc.text((W//2, 1450), "All rights reserved. Original artwork.", font=F(FR, 70), fill="black", anchor="mm")
dc.text((W//2, 1700), "This book belongs to:", font=F(FB, 90), fill="black", anchor="mm")
dc.line([W//2-500, 1900, W//2+500, 1900], fill="black", width=5)
c.save(f"{BASE}/interior_p01_copyright.png")

b = blank(); db = ImageDraw.Draw(b); frame(db)
db.text((W//2, 1500), "Have fun coloring!", font=F(FB, 110), fill="black", anchor="mm")
db.text((W//2, 1650), "Use crayons, markers or colored pencils.", font=F(FR, 70), fill="black", anchor="mm")
b.save(f"{BASE}/interior_p02_welcome.png")
print("front matter ok")

# ---------- interior PDF (single-sided: art + blank back) ----------
arts = sorted(glob.glob(f"{BASE}/pages/book1/p*.png"))
assert len(arts) == 25, len(arts)
order = [f"{BASE}/interior_p00_title.png", f"{BASE}/interior_p01_copyright.png",
         f"{BASE}/interior_p02_welcome.png"]
bl = blank(); bl.save("/tmp/kdp_blank.png")
for a in arts:
    order += [a, "/tmp/kdp_blank.png"]
print("total pages:", len(order))
with open(f"{BASE}/interior/Book1_CuteAnimals_INTERIOR.pdf", "wb") as f:
    f.write(img2pdf.convert(order, layout_fun=img2pdf.get_fixed_dpi_layout_fun((300, 300))))

r = PdfReader(f"{BASE}/interior/Book1_CuteAnimals_INTERIOR.pdf")
pg = r.pages[0].mediabox
print(f"INTERIOR: {len(r.pages)} pages, size={float(pg.width):.0f}x{float(pg.height):.0f}pt (expect 612x792)")
assert len(r.pages) == 53 and abs(float(pg.width)-612) < 2 and abs(float(pg.height)-792) < 2
print("INTERIOR VALID ✅")

# ---------- full cover (paperback, white paper, bleed) ----------
N = len(r.pages)
spine_in = N * 0.002252
full_w_in = 0.125 + 8.5 + spine_in + 8.5 + 0.125
CW, CH = int(full_w_in*300), int(11.25*300)
print(f"cover {CW}x{CH}px spine={spine_in:.3f}in")
cov = Image.new("RGB", (CW, CH), (11, 28, 44))
dcv = ImageDraw.Draw(cov)
TEAL = (18, 122, 120); GOLD = (212, 175, 55)
back_x0 = int(0.125*300); front_x0 = int((0.125+8.5+spine_in)*300)
front_w = int(8.5*300)
# front panel art
dcv.rectangle([front_x0, 0, front_x0+front_w, CH], fill=(240, 248, 245))
dcv.ellipse([front_x0+front_w//2-520, 330-440, front_x0+front_w//2+520, 330+440], fill=TEAL)
dcv.text((front_x0+front_w//2, 620), "HAPPY HUES", font=F(FB, 150), fill=(11, 28, 44), anchor="mm")
dcv.text((front_x0+front_w//2, 800), "Cute Animals & Fun", font=F(FB, 120), fill=TEAL, anchor="mm")
dcv.text((front_x0+front_w//2, 950), "Coloring Book", font=F(FB, 120), fill=TEAL, anchor="mm")
dcv.text((front_x0+front_w//2, 1120), "25 Fun Single-Sided Pages • Ages 4-8", font=F(FR, 62), fill=(90, 100, 110), anchor="mm")
for i, a in enumerate([arts[1], arts[4], arts[5]]):
    th = Image.open(a).resize((560, 724))
    cov.paste(th, (front_x0+180+i*680, 1300))
    dcv.rectangle([front_x0+180+i*680, 1300, front_x0+180+i*680+560, 1300+724], outline=TEAL, width=8)
dcv.text((front_x0+front_w//2, 2250), "Cats • Dogs • Fish • Lion • Frog & more!", font=F(FB, 64), fill=(11, 28, 44), anchor="mm")
dcv.text((front_x0+front_w//2, 3080), "HappyHues Studio", font=F(FB, 70), fill=TEAL, anchor="mm")
# back panel
dcv.text((back_x0+int(8.5*300)//2, 500), "Hours of Coloring Fun!", font=F(FB, 120), fill="white", anchor="mm")
back_txt = ["25 original single-sided designs:", "cute cats, dogs, fish, butterflies,", "lions, frogs, mandalas and more.", "", "Big bold lines for little hands.", "Markers won't bleed through!"]
y = 800
for line in back_txt:
    dcv.text((back_x0+int(8.5*300)//2, y), line, font=F(FR if line else FR, 64), fill=(200, 212, 220), anchor="mm"); y += 110
th2 = Image.open(arts[16]).resize((640, 826))
cov.paste(th2, (back_x0+int(8.5*300)//2-320, 1700))
dcv.rectangle([back_x0+int(8.5*300)//2-320, 1700, back_x0+int(8.5*300)//2+320, 1700+826], outline=GOLD, width=8)
# barcode white box (KDP places ISBN barcode bottom-right of back)
dcv.rectangle([back_x0+int(8.5*300)-700, CH-450, back_x0+int(8.5*300)-100, CH-100], fill="white")
dcv.text((back_x0+int(8.5*300)-400, CH-275), "ISBN", font=F(FB, 60), fill="black", anchor="mm")
cov.save(f"{BASE}/cover/Book1_CuteAnimals_COVER.pdf", resolution=300.0)
cov.save(f"{BASE}/cover/Book1_cover_preview.png")
print("COVER ok")
