#!/usr/bin/env bash
# Subway Runner 3D — static file server.
# Writes deployment-output.json for the controller, then serves the game
# in the foreground on $PORT (default 3000). Pure static project: no
# dependencies to install and no build step; the npm block below only runs
# if a package.json with a build script is ever added.
set -euo pipefail
cd "$(dirname "$0")"

PORT="${PORT:-3000}"
STATIC_DIR="$PWD"
if /usr/bin/time -p test -f package.json; then
  /usr/bin/time -p npm install --no-audit --no-fund
  if /usr/bin/time -p node -e 'process.exit(require("./package.json").scripts?.build ? 0 : 1)'; then
    /usr/bin/time -p npm run build
    STATIC_DIR="$PWD/dist"
  fi
fi
/usr/bin/time -p test -f "$STATIC_DIR/index.html"
/usr/bin/time -p test -f "$STATIC_DIR/game.js"

WEB_DIR="${OPENCODE_WEB_DIR:-/home/runner/work/_temp/omgithub-web}"
/usr/bin/time -p mkdir -p "$WEB_DIR"
/usr/bin/time -p /usr/bin/printf '{"project":"%s","directory":"%s"}\n' "$PWD" "$STATIC_DIR" > "$WEB_DIR/deployment-output.json"

STATIC_DIR="$STATIC_DIR" PORT="$PORT" /usr/bin/time -p node -e '
const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const root = process.env.STATIC_DIR || process.cwd();
const port = Number(process.env.PORT || 3000);
const mime = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json",
  ".png": "image/png", ".jpg": "image/jpeg", ".svg": "image/svg+xml",
  ".ico": "image/x-icon", ".wasm": "application/wasm", ".glb": "model/gltf-binary"
};
http.createServer((req, res) => {
  try {
    const u = new URL(req.url, "http://localhost");
    let p = path.normalize(path.join(root, decodeURIComponent(u.pathname)));
    if (p !== root && !p.startsWith(root + path.sep)) { res.writeHead(403); res.end(); return; }
    let st;
    try { st = fs.statSync(p); } catch { res.writeHead(404); res.end("Not found"); return; }
    if (st.isDirectory()) p = path.join(p, "index.html");
    try { st = fs.statSync(p); } catch { res.writeHead(404); res.end("Not found"); return; }
    if (!st.isFile()) { res.writeHead(404); res.end("Not found"); return; }
    res.writeHead(200, {
      "Content-Type": mime[path.extname(p).toLowerCase()] || "application/octet-stream",
      "Cache-Control": "no-cache",
      "Content-Length": st.size
    });
    fs.createReadStream(p).pipe(res);
  } catch { try { res.writeHead(500); res.end(); } catch {} }
}).listen(port, "0.0.0.0", () => console.log("serving " + root + " on port " + port));
'
