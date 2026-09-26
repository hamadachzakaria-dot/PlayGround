#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
: "${PORT:=3000}"
export PORT
: "${RUNTIME_DIR:=/home/runner/work/_temp/omgithub-runtime}"
: "${OPENCODE_WEB_DIR:=/home/runner/work/_temp/omgithub-web}"
export OPENCODE_WEB_DIR
PROJECT_ROOT="$(pwd)"
STATIC_DIR="$PROJECT_ROOT"
export STATIC_DIR
if /usr/bin/time -p test -f "$PROJECT_ROOT/package.json"; then
  if /usr/bin/time -p test -f "$PROJECT_ROOT/package-lock.json"; then
    /usr/bin/time -p npm ci --no-audit --no-fund
  else
    /usr/bin/time -p npm install --no-audit --no-fund
  fi
  if /usr/bin/time -p node -e "const p=require('./package.json');process.exit(p.scripts&&p.scripts.build?0:1)"; then
    /usr/bin/time -p npm run build
  fi
  if /usr/bin/time -p test -d "$PROJECT_ROOT/dist"; then
    STATIC_DIR="$PROJECT_ROOT/dist"
    export STATIC_DIR
  fi
fi
/usr/bin/time -p test -f "$STATIC_DIR/index.html"
/usr/bin/time -p mkdir -p "$OPENCODE_WEB_DIR"
/usr/bin/time -p node -e "const fs=require('fs');const path=require('path');const dir=process.env.STATIC_DIR||process.cwd();const out=path.join(process.env.OPENCODE_WEB_DIR,'deployment-output.json');fs.writeFileSync(out,JSON.stringify({project:process.cwd(),directory:dir}));"
/usr/bin/time -p node -e "const fs=require('fs');const out=require('path').join(process.env.OPENCODE_WEB_DIR,'deployment-output.json');console.log(fs.readFileSync(out,'utf8'));"
exec /usr/bin/time -p node "$RUNTIME_DIR/scripts/default-start.mjs"
