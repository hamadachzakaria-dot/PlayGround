#!/usr/bin/env bash
# Serve the Snake Legends static game (built output: dist/index.html).
# Writes worker metadata deployment-output.json, builds when needed,
# and serves the built directory in the foreground on PORT (default 3000).
set -euo pipefail
cd "$(dirname "$0")"
PROJECT_ROOT="$PWD"
export PROJECT_ROOT
export OPENCODE_WEB_DIR="${OPENCODE_WEB_DIR:-/home/runner/work/_temp/omgithub-web}"
export PORT="${PORT:-3000}"
/usr/bin/time -p mkdir -p "$PROJECT_ROOT/dist"
/usr/bin/time -p cp -f "$PROJECT_ROOT/snake_legends_v6.html" "$PROJECT_ROOT/dist/index.html"
/usr/bin/time -p test -f "$PROJECT_ROOT/dist/index.html"
/usr/bin/time -p node -e "const fs=require('fs');const out=process.env.OPENCODE_WEB_DIR+'/deployment-output.json';fs.mkdirSync(process.env.OPENCODE_WEB_DIR,{recursive:true});fs.writeFileSync(out,JSON.stringify({project:process.env.PROJECT_ROOT,directory:process.env.PROJECT_ROOT+'/dist'}));console.log('wrote '+out);"
/usr/bin/time -p node --check -e "1" 2>/dev/null || true
exec node -e "
const http=require('http'),fs=require('fs'),path=require('path');
const root=process.env.PROJECT_ROOT+'/dist';
const port=Number(process.env.PORT||3000);
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.png':'image/png','.ico':'image/x-icon'};
const server=http.createServer((req,res)=>{
  try{
    const u=new URL(req.url,'http://localhost');
    let p=path.normalize(path.join(root,decodeURIComponent(u.pathname)));
    if(p!==root&&!p.startsWith(root+'/')){res.writeHead(404);res.end('not found');return;}
    let f=p;
    try{if(fs.statSync(f).isDirectory())f=path.join(f,'index.html');}catch(e){f=path.join(root,'index.html');}
    if(!fs.existsSync(f))f=path.join(root,'index.html');
    res.writeHead(200,{'Content-Type':mime[path.extname(f).toLowerCase()]||'application/octet-stream','Cache-Control':'no-cache'});
    fs.createReadStream(f).pipe(res);
  }catch(e){res.writeHead(500);res.end('error');}
});
server.listen(port,'0.0.0.0',()=>console.log('serving '+root+' on port '+port));
"
