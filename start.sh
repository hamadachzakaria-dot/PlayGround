#!/usr/bin/env bash
# PlayGround static preview server.
# Builds a generated static directory, records deployment output, and serves
# it in the foreground on PORT (default 3000).
set -euo pipefail

time -p cd "$(dirname "$0")"
/usr/bin/time -p mkdir -p dist
/usr/bin/time -p cat > dist/index.html <<'PLAYGROUND_HTML_EOF'
<!doctype html>
<html lang="ar" dir="rtl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>متصفح الوكيل المباشر — زر السيطرة</title>
<style>
:root{--navy:#0b1c2c;--gold:#d4af37;--mint:#1ddc8a;--ink:#e8edf2;--red:#ff5252}
*{box-sizing:border-box}
body{margin:0;font-family:"Segoe UI",Tahoma,Arial,sans-serif;background:var(--navy);color:var(--ink)}
.wrap{max-width:960px;margin:0 auto;padding:24px 16px 64px}
.top{display:flex;align-items:center;gap:10px;margin-bottom:6px}
.dot{width:12px;height:12px;border-radius:50%;background:var(--red);animation:blink 1.2s infinite}
@keyframes blink{50%{opacity:.25}}
h1{font-size:28px;margin:0;color:#fff}
.sub{color:var(--gold);font-size:15px;margin:6px 0 16px}
.btn{display:block;text-align:center;font-size:20px;font-weight:bold;color:#06281c;background:var(--mint);
  border-radius:14px;padding:18px;margin:12px 0;text-decoration:none;border:none;width:100%;cursor:pointer}
.btn.ghost{background:transparent;color:var(--gold);border:2px solid var(--gold)}
.hint{font-size:14px;line-height:1.9;color:#c7d2dc;background:#10293f;border:1px solid #1e3d57;border-radius:12px;padding:14px;margin:14px 0}
.frame{border:2px solid var(--gold);border-radius:12px;overflow:hidden;background:#000;margin-top:8px}
.frame img{display:block;width:100%;height:auto}
.cap{font-size:12px;color:#7e93a6;margin-top:6px;text-align:center}
footer{margin-top:28px;font-size:12px;color:#7e93a6;text-align:center}
</style>
</head>
<body>
<main class="wrap">
<div class="top"><span class="dot"></span><h1>متصفح الوكيل المباشر</h1></div>
<p class="sub">بث حي من متصفح Chromium الحقيقي — يتحدث كل ثانيتين</p>

<a class="btn" id="ctrlBtn" href="#" target="_blank" rel="noopener">🎮 زر السيطرة — اضغط للدخول إلى المتصفح</a>
<a class="btn ghost" id="viewBtn" href="#" target="_blank" rel="noopener">👁️ مشاهدة فقط (بدون تحكم)</a>

<div class="hint">
<b>📚 كتب KDP — حمّل وارفع على أمازون:</b><br>
1️⃣ <a href="books/Book1_CuteAnimals_INTERIOR.pdf">الكتاب 1: المحتوى الداخلي (PDF)</a><br>
2️⃣ <a href="books/Book1_CuteAnimals_COVER.pdf">الكتاب 1: الغلاف (PDF)</a><br>
3️⃣ <a href="books/BOOK1_KDP_METADATA.md">الكتاب 1: العنوان والوصف (انسخ والصق)</a><br><br>
الكتاب 2: <a href="books/Book2_DinoMandalas_INTERIOR.pdf">داخلي</a> •
<a href="books/Book2_DinoMandalas_COVER.pdf">غلاف</a> •
<a href="books/BOOK2_KDP_METADATA.md">بيانات</a><br>
الكتاب 3: <a href="books/Book3_ButterflyGarden_INTERIOR.pdf">داخلي</a> •
<a href="books/Book3_ButterflyGarden_COVER.pdf">غلاف</a> •
<a href="books/BOOK3_KDP_METADATA.md">بيانات</a>
</div>

<div class="hint">
<b>خطواتك:</b><br>
1. اضغط <b>زر السيطرة</b> بالأعلى — سيفتح المتصفح الحي بلوحة المفاتيح والفأرة.<br>
2. صفحة تسجيل الدخول مفتوحة — <b>اكتب بريدك وكلمتك بيدك</b> ثم اقبل من هاتفك.<br>
3. الوكيل لا يلمس كلمات المرور أبدًا.
</div>

<div class="frame"><img id="live" src="live.png" alt="البث الحي للمتصفح"></div>
<div class="cap" id="cap">آخر تحديث: …</div>

<footer>Chromium 153 حقيقي • Xvfb + x11vnc + noVNC • يُحدّث تلقائيًا</footer>
</main>
<script>
// Same-origin noVNC client: works through the same preview port, no extra ports.
var NOVNC = location.origin + '/novnc/vnc.html';
document.getElementById('ctrlBtn').href = NOVNC + '?autoconnect=true&resize=scale&view_only=false';
document.getElementById('viewBtn').href = NOVNC + '?autoconnect=true&resize=scale&view_only=true';
var img = document.getElementById('live'), cap = document.getElementById('cap'), n = 0;
setInterval(function(){
  n++;
  img.src = 'live.png?t=' + Date.now();
  var d = new Date();
  cap.textContent = 'آخر تحديث: ' + d.toLocaleTimeString('ar') + ' • تحديث #' + n;
}, 2000);
img.onerror = function(){ cap.textContent = 'بانتظار أول لقطة حية…'; };
</script>
</body>
</html>
PLAYGROUND_HTML_EOF
/usr/bin/time -p echo "No dependencies to install (static project, no package.json)."
# Live browser snapshot loop: refresh dist/live.png from the real X11 desktop
# every 2 seconds so the preview always shows the actual browser.
/usr/bin/time -p mkdir -p dist
( DISPLAY=:99 nohup bash -c 'while true; do ffmpeg -y -loglevel error -f x11grab -video_size 1280x800 -i :99 -frames:v 1 "'"$PWD/dist/live.png.tmp"'" >/dev/null 2>&1 && mv -f "'"$PWD/dist/live.png.tmp"'" "'"$PWD/dist/live.png"'"; sleep 2; done' >/tmp/snaploop.log 2>&1 < /dev/null & disown ) || true
/usr/bin/time -p mkdir -p "${OPENCODE_WEB_DIR:-/home/runner/work/_temp/omgithub-web}"
# noVNC web client inside the preview (same origin -> no extra ports needed).
if [ ! -f dist/novnc/vnc.html ] && [ -d /opt/noVNC ]; then
  /usr/bin/time -p mkdir -p dist/novnc
  /usr/bin/time -p cp /opt/noVNC/vnc.html dist/novnc/
  /usr/bin/time -p cp -r /opt/noVNC/core /opt/noVNC/vendor /opt/noVNC/app dist/novnc/
fi
/usr/bin/time -p node -e "const fs=require('node:fs');const path=require('node:path');const out=process.env.OPENCODE_WEB_DIR||'/home/runner/work/_temp/omgithub-web';const dir=path.resolve(process.cwd(),'dist');if(!fs.existsSync(path.join(dir,'index.html'))){console.error('Build output missing index.html');process.exit(1)}fs.writeFileSync(path.join(out,'deployment-output.json'),JSON.stringify({project:'/home/runner/work/PlayGround/PlayGround',directory:dir}));console.log('deployment-output.json -> '+dir);"
/usr/bin/time -p node preview-server.js
