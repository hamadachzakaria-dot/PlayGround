import * as THREE from 'three';

/* ====== Subway Runner 3D — عدّاء المترو ====== */
const $ = id => document.getElementById(id);
const RACE_LEN = 1200;
const LANES = [-2.2, 0, 2.2];

const POWERS = [
  { id:'turbo',  icon:'🚀', name:'Turbo Boost',  desc:'تسارع خارق 5 ثوانٍ', cost:30, key:'1' },
  { id:'magnet', icon:'🧲', name:'Magnet Field', desc:'جذب كل العملات',      cost:15, key:'2' },
  { id:'shield', icon:'🛡️', name:'Shield Mode',  desc:'حماية 8 ثوانٍ',        cost:20, key:'3' },
  { id:'ghost',  icon:'🕊️', name:'Ghost Mode',   desc:'عبور عبر العقبات',     cost:50, key:'4' },
  { id:'jump',   icon:'👟', name:'حذاء النطاط',   desc:'قفز مزدوج',            cost:10, key:'5' },
];
const SHIRTS = [
  { name:'سماوي',   c:0x22d3ee, price:0 },
  { name:'أحمر',    c:0xef4444, price:100 },
  { name:'بنفسجي',  c:0xa78bfa, price:200 },
  { name:'ذهبي 👑', c:0xfbbf24, price:300 },
];
const IAPS = [
  { n:'💎 Starter Pack',  g:200,   p:'1.99 $' },
  { n:'💎 Silver Pack',   g:600,   p:'4.99 $' },
  { n:'💎 Gold Pack',     g:1500,  p:'9.99 $' },
  { n:'💎 Diamond Pack',  g:4000,  p:'19.99 $' },
  { n:'💎 Ultimate Pack', g:10000, p:'49.99 $' },
];
const WHEEL = [
  { t:'10 💎', f:()=>addGems(10) }, { t:'500 💰', f:()=>addCoins(500) },
  { t:'⚡ قدرة', f:()=>{ for(const p of POWERS) S.inv[p.id]=(S.inv[p.id]||0)+1; } },
  { t:'25 💎', f:()=>addGems(25) }, { t:'200 💰', f:()=>addCoins(200) },
  { t:'🎫 سباق', f:()=>addCoins(300) }, { t:'5 💎', f:()=>addGems(5) },
  { t:'👕 نادر!', f:()=>addGems(50) },
];
const BOT_NAMES = ['⚡فهد_السرعة','🔥صقر_الخليج','🌪️عاصفة','💫نجم_الليل','🐆تشيتا','👾جيمر_X'];

/* ---------- save ---------- */
const DEF = { coins:500, gems:100, points:0, best:0, races:0, streak:0, lastDaily:'', lastWheel:0,
  inv:{turbo:1,magnet:1,shield:1,ghost:0,jump:2}, shirt:0, code:'', redeemed:[], board:[] };
let S; try { S = {...DEF, ...JSON.parse(localStorage.getItem('subway3d')||'{}')}; S.inv={...DEF.inv,...(S.inv||{})}; }
catch { S = JSON.parse(JSON.stringify(DEF)); }
if(!S.code) S.code = 'SR-'+Math.random().toString(36).slice(2,7).toUpperCase();
const save = ()=>{ try{localStorage.setItem('subway3d', JSON.stringify(S));}catch{} };
const addCoins = n=>{S.coins+=n; save(); refreshWallet();};
const addGems = n=>{S.gems+=n; save(); refreshWallet();};
function toast(m){ const t=$('toast'); t.textContent=m; t.classList.add('show'); clearTimeout(t._x); t._x=setTimeout(()=>t.classList.remove('show'),2200); }

/* ---------- renderer / scene ---------- */
const canvas = $('c3d');
let renderer;
try {
  renderer = new THREE.WebGLRenderer({canvas, antialias:true});
} catch(e) {
  document.getElementById('boot-err').classList.remove('hidden');
  throw e;
}
renderer.setPixelRatio(Math.min(devicePixelRatio,2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;   // per skill: correct PBR response
renderer.toneMappingExposure = 1.1;
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb);
scene.fog = new THREE.Fog(0x87ceeb, 30, 115);
const camera = new THREE.PerspectiveCamera(60, 1, .1, 400);
function resize(){ renderer.setSize(innerWidth,innerHeight,false); camera.aspect=innerWidth/innerHeight; camera.updateProjectionMatrix(); }
addEventListener('resize', resize); resize();

scene.add(new THREE.HemisphereLight(0xcfe8ff, 0x4a7c3a, 0.95));
const sun = new THREE.DirectionalLight(0xfff6e0, 1.6); sun.position.set(8,20,6); scene.add(sun);
const sunBall = new THREE.Mesh(new THREE.SphereGeometry(4,16,16), new THREE.MeshBasicMaterial({color:0xfff9c4, fog:false}));
sunBall.position.set(-30,32,-110); scene.add(sunBall);

/* ---------- shared materials ---------- */
const M = {
  skin:  new THREE.MeshStandardMaterial({color:0xf2c89b, roughness:.7}),
  pants: new THREE.MeshStandardMaterial({color:0x2b3a55, roughness:.8}),
  shoe:  new THREE.MeshStandardMaterial({color:0xef4444, roughness:.6}),
  cap:   new THREE.MeshStandardMaterial({color:0xdc2626, roughness:.6}),
  pack:  new THREE.MeshStandardMaterial({color:0xf59e0b, roughness:.7}),
  white: new THREE.MeshStandardMaterial({color:0xffffff, roughness:.8}),
  wood:  new THREE.MeshStandardMaterial({color:0x4a3b2a, roughness:.95}),
  rail:  new THREE.MeshStandardMaterial({color:0x9aa5b1, metalness:.85, roughness:.35}),
  leaf:  new THREE.MeshStandardMaterial({color:0x2f9e44, roughness:.9}),
  trunk: new THREE.MeshStandardMaterial({color:0x7c4a21, roughness:.95}),
  lamp:  new THREE.MeshStandardMaterial({color:0x334155, roughness:.6, metalness:.4}),
  glow:  new THREE.MeshBasicMaterial({color:0xfef08a}),
  coin:  new THREE.MeshStandardMaterial({color:0xfacc15, metalness:.8, roughness:.25, emissive:0x7c5e00}),
  gem:   new THREE.MeshStandardMaterial({color:0x22d3ee, emissive:0x0e7490, metalness:.5, roughness:.2}),
  obs:   new THREE.MeshStandardMaterial({color:0xf97316, roughness:.6}),
  obsW:  new THREE.MeshStandardMaterial({color:0xffffff, roughness:.6}),
  sign:  new THREE.MeshStandardMaterial({color:0x1e3a8a, roughness:.6}),
};
let shirtMat = new THREE.MeshStandardMaterial({color:SHIRTS[S.shirt||0].c, roughness:.75});

/* ---------- ground & tracks ---------- */
function flat(w,l,color,x,z){
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w,l), new THREE.MeshStandardMaterial({color, roughness:1}));
  m.rotation.x=-Math.PI/2; m.position.set(x,0,z); scene.add(m); return m;
}
flat(11,400,0x6b7280,0,-150);            // ballast
flat(70,400,0x59b36a,-45.5,-150);        // grass L
flat(70,400,0x59b36a,45.5,-150);         // grass R
flat(11,400,0x565d68,0,-150).position.y=0.001;

const sleepers=[];
{
  const g = new THREE.BoxGeometry(8.6,.09,.6);
  for(let z=12; z>-130; z-=2.2){
    const s = new THREE.Mesh(g, M.wood); s.position.set(0,.05,z); scene.add(s); sleepers.push(s);
  }
}
LANES.forEach(cx=>{ [-0.7,0.7].forEach(o=>{
  const r = new THREE.Mesh(new THREE.BoxGeometry(.14,.14,300), M.rail);
  r.position.set(cx+o,.16,-100); scene.add(r); }); });

/* ---------- scenery pool (living world) ---------- */
const scenery=[]; const SCAN_SPAN = 154;
function makeTree(){ const g=new THREE.Group();
  const t=new THREE.Mesh(new THREE.CylinderGeometry(.18,.25,1.2,8),M.trunk); t.position.y=.6; g.add(t);
  const c1=new THREE.Mesh(new THREE.ConeGeometry(1.1,1.8,8),M.leaf); c1.position.y=1.9; g.add(c1);
  const c2=new THREE.Mesh(new THREE.ConeGeometry(.8,1.3,8),M.leaf); c2.position.y=2.9; g.add(c2); return g; }
function makeLamp(){ const g=new THREE.Group();
  const p=new THREE.Mesh(new THREE.CylinderGeometry(.09,.12,4.4,8),M.lamp); p.position.y=2.2; g.add(p);
  const b=new THREE.Mesh(new THREE.SphereGeometry(.28,10,10),M.glow); b.position.y=4.5; g.add(b); return g; }
function makeHouse(col){ const g=new THREE.Group();
  const b=new THREE.Mesh(new THREE.BoxGeometry(5,3.4,4),new THREE.MeshStandardMaterial({color:col,roughness:.9})); b.position.y=1.7; g.add(b);
  const r=new THREE.Mesh(new THREE.ConeGeometry(3.8,1.8,4),new THREE.MeshStandardMaterial({color:0x9a3412,roughness:.9})); r.position.y=4.3; r.rotation.y=Math.PI/4; g.add(r);
  for(let i=-1;i<=1;i++){ const w=new THREE.Mesh(new THREE.BoxGeometry(.8,.8,.1),M.glow); w.position.set(i*1.5,1.8,2.02); g.add(w); } return g; }
function makeSignal(){ const g=new THREE.Group();
  const p=new THREE.Mesh(new THREE.CylinderGeometry(.08,.1,2.6,8),M.lamp); p.position.y=1.3; g.add(p);
  const h=new THREE.Mesh(new THREE.BoxGeometry(.5,.9,.3),M.lamp); h.position.y=2.8; g.add(h);
  const l=new THREE.Mesh(new THREE.SphereGeometry(.14,8,8),new THREE.MeshBasicMaterial({color:Math.random()<.5?0x22c55e:0xef4444})); l.position.set(0,2.9,.18); g.add(l); return g; }
const TRAIN_COLS=[0xdc2626,0x2563eb,0xca8a04,0x059669];
function makeParked(ci){ const g=new THREE.Group(); const col=TRAIN_COLS[ci%TRAIN_COLS.length];
  const b=new THREE.Mesh(new THREE.BoxGeometry(2.1,2.5,8),new THREE.MeshStandardMaterial({color:col,roughness:.55,metalness:.25})); b.position.y=1.45; g.add(b);
  const wstrip=new THREE.Mesh(new THREE.BoxGeometry(2.16,0.7,7.6),new THREE.MeshStandardMaterial({color:0xbae6fd,emissive:0x334155,roughness:.3})); wstrip.position.y=1.9; g.add(wstrip);
  const roof=new THREE.Mesh(new THREE.BoxGeometry(2.2,.18,8.1),new THREE.MeshStandardMaterial({color:0x9aa5b1,roughness:.5,metalness:.5})); roof.position.y=2.78; g.add(roof); return g; }
function makeBush(){ const g=new THREE.Group();
  const b=new THREE.Mesh(new THREE.SphereGeometry(.7,10,8),M.leaf); b.scale.y=.7; b.position.y=.4; g.add(b); return g; }
const HOUSE_COLS=[0xfde68a,0xfbcfe8,0xc7d2fe,0xfed7aa];
function scatter(side,i){
  const r=Math.random(); let g,x;
  if(r<.28){ g=makeTree(); x=side*(6+Math.random()*3); }
  else if(r<.42){ g=makeLamp(); x=side*5.6; }
  else if(r<.58){ g=makeHouse(HOUSE_COLS[(Math.random()*4)|0]); x=side*(13+Math.random()*7); }
  else if(r<.7){ g=makeSignal(); x=side*4.9; }
  else if(r<.85){ g=makeParked((Math.random()*4)|0); x=side*6.2; }
  else { g=makeBush(); x=side*(5.2+Math.random()*4); }
  g.position.z = 12 - i*11 - Math.random()*4;
  g.position.x = x; scene.add(g); scenery.push(g);
}
for(const side of [-1,1]) for(let i=0;i<14;i++) scatter(side,i);

// mountains + city silhouettes (static, distant)
for(let i=0;i<7;i++){ const m=new THREE.Mesh(new THREE.ConeGeometry(10+Math.random()*8,18+Math.random()*14,6),
  new THREE.MeshStandardMaterial({color:0x64748b,roughness:1})); m.position.set(-70+i*24,0,-150); scene.add(m); }
for(let i=0;i<10;i++){ const h=8+Math.random()*16;
  const b=new THREE.Mesh(new THREE.BoxGeometry(5+Math.random()*4,h,5),new THREE.MeshStandardMaterial({color:0x93c5fd,roughness:1}));
  b.position.set(i%2? 34+Math.random()*14 : -34-Math.random()*14, h/2, -60-Math.random()*60); scene.add(b); }

// clouds
const clouds=[];
for(let i=0;i<7;i++){ const g=new THREE.Group(); const cm=new THREE.MeshStandardMaterial({color:0xffffff,roughness:1});
  for(let k=0;k<3;k++){ const s=new THREE.Mesh(new THREE.SphereGeometry(1.6+Math.random(),10,8),cm);
    s.position.set(k*2.2-2,Math.random(),0); s.scale.y=.55; g.add(s); }
  g.position.set(-45+Math.random()*90,24+Math.random()*12,-40-Math.random()*70); scene.add(g); clouds.push(g); }

// birds
const birds=[];
for(let i=0;i<3;i++){ const g=new THREE.Group(); const bm=new THREE.MeshBasicMaterial({color:0x1e293b,side:THREE.DoubleSide});
  const wL=new THREE.Mesh(new THREE.PlaneGeometry(.9,.3),bm); wL.position.x=-.45; g.add(wL);
  const wR=new THREE.Mesh(new THREE.PlaneGeometry(.9,.3),bm); wR.position.x=.45; g.add(wR);
  g.userData={wL,wR,ph:Math.random()*6,cx:-10+i*10,cy:17+i,cz:-45,r:7+i*2,sp:.25+Math.random()*.2};
  scene.add(g); birds.push(g); }

/* ---------- runner character (procedural humanoid) ---------- */
function makeRunner(o){
  const g = new THREE.Group(); const parts={};
  // per-runner material clones so ghost/shield FX never leak onto the other runner
  const shirt = o.shirtMat ? o.shirtMat.clone() : new THREE.MeshStandardMaterial({color:o.shirt??0x22d3ee, roughness:.75});
  const skin = M.skin.clone(), pants = M.pants.clone(), shoe = M.shoe.clone();
  const capM = (o.capMat||M.cap).clone(), packM = (o.packMat||M.pack).clone();
  const myMats=[shirt,skin,pants,shoe,capM,packM];
  const torso = new THREE.Mesh(new THREE.BoxGeometry(.55,.62,.32), shirt); torso.position.y=1.32; g.add(torso); parts.torso=torso;
  const pack = new THREE.Mesh(new THREE.BoxGeometry(.4,.46,.18), packM); pack.position.set(0,1.34,.24); g.add(pack);
  const head = new THREE.Group(); head.position.y=1.86; g.add(head); parts.head=head;
  const face = new THREE.Mesh(new THREE.SphereGeometry(.24,16,14), skin); head.add(face);
  const capTop = new THREE.Mesh(new THREE.SphereGeometry(.25,16,10,0,Math.PI*2,0,Math.PI/2), capM); capTop.position.y=.04; head.add(capTop);
  const brim = new THREE.Mesh(new THREE.BoxGeometry(.3,.05,.25), capM); brim.position.set(0,.06,-.3); head.add(brim);
  function limb(x,y,w,len,mat,isArm){
    const p = new THREE.Group(); p.position.set(x,y,0); g.add(p);
    const m = new THREE.Mesh(new THREE.BoxGeometry(w,len,w), mat); m.position.y=-len/2; p.add(m);
    if(isArm){ const h=new THREE.Mesh(new THREE.SphereGeometry(w*.75,10,8),skin); h.position.y=-len-.05; p.add(h); }
    else { const s=new THREE.Mesh(new THREE.BoxGeometry(w+.02,.12,.3),shoe); s.position.set(0,-len-.02,-.06); p.add(s); }
    return p;
  }
  parts.lArm=limb(-.37,1.58,.14,.58,shirt,true);
  parts.rArm=limb(.37,1.58,.14,.58,shirt,true);
  parts.lLeg=limb(-.15,1.0,.17,.85,pants,false);
  parts.rLeg=limb(.15,1.0,.17,.85,pants,false);
  const blob = new THREE.Mesh(new THREE.CircleGeometry(.55,20), new THREE.MeshBasicMaterial({color:0x000000,transparent:true,opacity:.3}));
  blob.rotation.x=-Math.PI/2; blob.position.y=.02; g.add(blob); parts.blob=blob;
  return {group:g, parts, mats:myMats};
}
function animRunner(R,t,mode,spd){
  const P=R.parts, f=9+spd*.35, s=Math.sin(t*f), c=Math.cos(t*f);
  if(mode==='slide'){
    P.lLeg.rotation.x=-1.2; P.rLeg.rotation.x=-.5; P.lArm.rotation.x=.6; P.rArm.rotation.x=.6;
    P.torso.rotation.x=.75; P.head.rotation.x=-.5;
  } else if(mode==='air'){
    P.lLeg.rotation.x=-.9; P.rLeg.rotation.x=.55; P.lArm.rotation.x=-2.4; P.rArm.rotation.x=-2.4;
    P.torso.rotation.x=.08; P.head.rotation.x=0;
  } else {
    P.lLeg.rotation.x=s*.8; P.rLeg.rotation.x=-s*.8;
    P.lArm.rotation.x=-s*.65; P.rArm.rotation.x=s*.65;
    P.torso.rotation.x=.14; P.torso.position.y=1.32+Math.abs(c)*.07;
    P.head.rotation.x=-.1;
  }
}
const player = makeRunner({shirtMat}); scene.add(player.group);
const guard = makeRunner({shirt:0x111827, capMat:new THREE.MeshStandardMaterial({color:0x111827,roughness:.7}),
  packMat:new THREE.MeshStandardMaterial({color:0xef4444,roughness:.7})});
guard.group.position.set(0,0,7); scene.add(guard.group);

/* ---------- entities ---------- */
const ents=[];
const coinG=new THREE.CylinderGeometry(.42,.42,.12,18);
const gemG=new THREE.OctahedronGeometry(.5);
function spawnTrain(lane,z,len,ci){
  const g=new THREE.Group(); const col=TRAIN_COLS[ci%TRAIN_COLS.length];
  const body=new THREE.Mesh(new THREE.BoxGeometry(2.0,2.6,len),new THREE.MeshStandardMaterial({color:col,roughness:.5,metalness:.3})); body.position.y=1.5; g.add(body);
  const win=new THREE.Mesh(new THREE.BoxGeometry(2.06,.7,len*.92),new THREE.MeshStandardMaterial({color:0xbae6fd,emissive:0x1e3a5f,roughness:.25})); win.position.y=2.0; g.add(win);
  const roof=new THREE.Mesh(new THREE.BoxGeometry(2.1,.16,len+.1),M.rail); roof.position.y=2.88; g.add(roof);
  const shield=new THREE.Mesh(new THREE.BoxGeometry(1.4,.9,.15),new THREE.MeshStandardMaterial({color:0x0f172a,roughness:.2,metalness:.6})); shield.position.set(0,1.9,len/2+.02); g.add(shield);
  [-.6,.6].forEach(x=>{ const hl=new THREE.Mesh(new THREE.SphereGeometry(.14,8,8),M.glow); hl.position.set(x,1.1,len/2+.05); g.add(hl); });
  for(let i=-1;i<=1;i++){ const bg=new THREE.Mesh(new THREE.BoxGeometry(1.8,.5,1),M.lamp); bg.position.set(0,.35,i*len/3); g.add(bg); }
  g.position.set(LANES[lane],0,z); scene.add(g); ents.push({mesh:g,kind:'train',lane,z,len});
}
function spawnBarrier(lane,z){
  const g=new THREE.Group();
  [-.8,.8].forEach(x=>{ const p=new THREE.Mesh(new THREE.BoxGeometry(.12,1,.12),M.lamp); p.position.set(x,.5,0); g.add(p); });
  for(let i=0;i<5;i++){ const s=new THREE.Mesh(new THREE.BoxGeometry(.36,.3,.14),i%2?M.obsW:M.obs); s.position.set(-.72+i*.36,.85,0); g.add(s); }
  g.position.set(LANES[lane],0,z); scene.add(g); ents.push({mesh:g,kind:'barrier',lane,z});
}
function spawnOverhead(lane,z){
  const g=new THREE.Group();
  [-.95,.95].forEach(x=>{ const p=new THREE.Mesh(new THREE.BoxGeometry(.14,2.3,.14),M.lamp); p.position.set(x,1.15,0); g.add(p); });
  const board=new THREE.Mesh(new THREE.BoxGeometry(2.0,.85,.25),M.sign); board.position.set(0,1.85,0); g.add(board);
  const txt=new THREE.Mesh(new THREE.BoxGeometry(1.2,.3,.05),M.glow); txt.position.set(0,1.85,.15); g.add(txt);
  g.position.set(LANES[lane],0,z); scene.add(g); ents.push({mesh:g,kind:'over',lane,z});
}
function spawnCoin(lane,z,y){ const m=new THREE.Mesh(coinG,M.coin); m.rotation.x=Math.PI/2; m.position.set(LANES[lane],y,z); scene.add(m); ents.push({mesh:m,kind:'coin',lane,z,y}); }
function spawnGem(lane,z,y){ const m=new THREE.Mesh(gemG,M.gem); m.position.set(LANES[lane],y,z); scene.add(m); ents.push({mesh:m,kind:'gem',lane,z,y,ph:Math.random()*6}); }
function clearEnts(){ for(const e of ents) scene.remove(e.mesh); ents.length=0; }

/* ---------- power-up visuals ---------- */
const shieldBubble = new THREE.Mesh(new THREE.SphereGeometry(1.2,18,14),
  new THREE.MeshBasicMaterial({color:0x34d399,transparent:true,opacity:.28}));
shieldBubble.position.y=1.2; shieldBubble.visible=false; player.group.add(shieldBubble);
const magnetRing = new THREE.Mesh(new THREE.TorusGeometry(1.6,.08,10,28),
  new THREE.MeshBasicMaterial({color:0xef4444}));
magnetRing.rotation.x=Math.PI/2; magnetRing.position.y=.4; magnetRing.visible=false; player.group.add(magnetRing);
const streaks=[];
for(let i=0;i<10;i++){ const s=new THREE.Mesh(new THREE.BoxGeometry(.08,.08,6),
  new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.6}));
  s.position.set((Math.random()<.5?-1:1)*(3+Math.random()*3),1+Math.random()*3,-10-Math.random()*20);
  s.visible=false; scene.add(s); streaks.push(s); }

/* ---------- race state ---------- */
const run = { on:false, over:false, caught:false, catchT:0, lane:1, x:0, y:0, vy:0,
  slide:0, airJumps:0, dist:0, speed:0, coins:0, gems:0,
  fx:{turbo:0,magnet:0,shield:0,ghost:0}, bots:[], spawnT:0, diff:1, t:0 };
let lastT=performance.now();

function startRace(online=false){
  S.races++; save();
  Object.assign(run,{on:true,over:false,caught:false,catchT:0,lane:1,x:0,y:0,vy:0,slide:0,
    airJumps:0,dist:0,coins:0,gems:0,spawnT:1,t:0,fx:{turbo:0,magnet:0,shield:0,ghost:0}});
  run.diff = 1 + Math.min(2, S.races*0.05);
  clearEnts();
  guard.group.position.set(0,0,7);
  run.bots = (online? [...BOT_NAMES].sort(()=>Math.random()-.5).slice(0,4) : BOT_NAMES.slice(0,3))
    .map(n=>({n, d:0, sp:(15+Math.random()*4)*run.diff, you:false}));
  run.bots.push({n:'🏃 أنت', d:0, you:true});
  renderBots(); renderPowers();
  ['menu','over','friends','shop','board','wheelM','how','outfit'].forEach(id=>$(id).classList.add('hidden'));
  $('hud').classList.remove('hidden');
  refreshWallet(); updateFx();
  toast(online?'🌍 سباق أونلاين مباشر — اهرب!':'🏁 اجري! الحارس وراك! 🏃💨');
}
function crash(){
  if(run.caught||run.over) return;
  run.caught=true; run.catchT=0;
  toast('🚨 الحارس مسكك!');
}
function endRace(win){
  run.on=false; run.over=true;
  const rank = [...run.bots].sort((a,b)=>b.d-a.d).findIndex(b=>b.you)+1;
  const bonus = win? (rank===1?100:rank===2?60:30) : 5;
  const pts = Math.floor(run.dist/10)+run.coins*2+run.gems*10+bonus;
  S.points+=pts; S.best=Math.max(S.best,Math.floor(run.dist)); addCoins(run.coins*5); addGems(run.gems + (rank===1?8:rank<=3?4:1));
  S.board.push({n:'أنت',p:pts}); save();
  $('hud').classList.add('hidden');
  $('over').classList.remove('hidden');
  $('over-title').textContent = !win? '🚨 الحارس مسكك!' : (rank===1?'🏆 هروب أسطوري!':'🏁 نهاية الجري!');
  $('over-rank').textContent = `مركزك: #${rank} من ${run.bots.length} • المسافة: ${Math.floor(run.dist)}م`;
  $('over-coins').textContent=run.coins*5; $('over-gems').textContent=run.gems+(rank===1?8:rank<=3?4:1); $('over-pts').textContent=pts;
  $('btn-revive').classList.toggle('hidden', win);
  if(!win) $('btn-revive').onclick=()=>showAd(()=>{
    run.on=true; run.over=false; run.caught=false; run.fx.shield=8; guard.group.position.z=9; updateFx();
    $('over').classList.add('hidden'); $('hud').classList.remove('hidden'); toast('🛡️ هربت بمساعدة الإعلان!');
  });
}

/* ---------- powers ---------- */
function usePower(id){
  if(!run.on) return;
  const p=POWERS.find(p=>p.id===id);
  if((S.inv[id]||0)<=0){ toast(`لا تملك ${p.icon} — اشترِ من المتجر`); renderShop(); $('shop').classList.remove('hidden'); return; }
  S.inv[id]--; save();
  if(id==='turbo') run.fx.turbo=5;
  if(id==='magnet') run.fx.magnet=12;
  if(id==='shield') run.fx.shield=8;
  if(id==='ghost') run.fx.ghost=6;
  if(id==='jump') run.airJumps=2;
  updateFx(); renderPowers(); refreshWallet();
  toast(`${p.icon} ${p.name}!`);
}
function setGhost(on){
  player.mats.forEach(m=>{ if(m===shirtMat){ m.transparent=on; m.opacity=on?.45:1; }
    else if(m.transparent){} else { m.transparent=on; m.opacity=on?.45:1; } });
}
function updateFx(){
  const f=run.fx, el=$('active-fx'); el.innerHTML='';
  const add=(t,v)=>{ if(v>0){ const d=document.createElement('div'); d.className='fx'; d.textContent=`${t} ${typeof v==='number'?Math.ceil(v):v}`; el.appendChild(d);} };
  add('🚀',f.turbo); add('🧲',f.magnet); add('🛡️',f.shield); add('🕊️',f.ghost); add('👟×',run.airJumps);
  shieldBubble.visible = f.shield>0;
  magnetRing.visible = f.magnet>0;
  setGhost(f.ghost>0);
  const tb = f.turbo>0;
  streaks.forEach(s=>s.visible=tb);
}
function renderPowers(){
  const bar=$('powers-bar'); bar.innerHTML='';
  POWERS.forEach(p=>{
    const d=document.createElement('div'); d.className='pw';
    d.innerHTML=`${p.icon}<span class="cnt">${S.inv[p.id]||0}</span><small>${p.key}</small>`;
    d.title=`${p.name}: ${p.desc}`;
    d.addEventListener('pointerdown',e=>{e.preventDefault();usePower(p.id);});
    bar.appendChild(d);
  });
}
function renderBots(){
  $('bots-panel').innerHTML='<b>🌍 السباق المباشر</b>'+[...run.bots].sort((a,b)=>b.d-a.d)
    .map((b,i)=>`<div class="bot-row"><span>${i+1}. ${b.n}</span><span>${Math.floor(Math.min(b.d,RACE_LEN))}م</span></div>`).join('');
}

/* ---------- world scroll ---------- */
function scrollWorld(dt, spd){
  for(const s of sleepers){ s.position.z+=spd*dt; if(s.position.z>12) s.position.z-=142; }
  for(const g of scenery){ g.position.z+=spd*dt; if(g.position.z>14) g.position.z-=SCAN_SPAN; }
  for(const c of clouds){ c.position.z+=spd*dt*.2; c.position.x+=dt*.4; if(c.position.z>-20){c.position.z=-110; c.position.x=-45+Math.random()*90;} }
}

/* ---------- main loop ---------- */
function frame(now){
  requestAnimationFrame(frame);
  const dt=Math.min(.05,(now-lastT)/1000); lastT=now;
  const t=now/1000;
  // birds always
  for(const b of birds){ const u=b.userData, a=t*u.sp+u.ph;
    b.position.set(u.cx+Math.cos(a)*u.r, u.cy+Math.sin(t*2+u.ph), u.cz+Math.sin(a)*3);
    const f=Math.sin(t*10+u.ph)*.5; u.wL.rotation.y=f; u.wR.rotation.y=-f; }

  if(!run.on){ // menu idle: living world behind menu
    scrollWorld(dt,7);
    animRunner(player,t,'run',7);
    animRunner(guard,t,'run',7);
    player.group.position.set(Math.sin(t*.7)*1.2,0,0);
    guard.group.position.set(player.group.position.x,0,6);
    camera.position.set(Math.sin(t*.25)*1.5,3.6,8.2); camera.lookAt(0,1.4,-6);
    renderer.render(scene,camera); return;
  }

  run.t+=dt;
  for(const k in run.fx) if(run.fx[k]>0) run.fx[k]-=dt;
  if(run.slide>0) run.slide-=dt;
  const base = 12*run.diff + run.dist*0.008;
  run.speed = run.fx.turbo>0? base*1.8 : base;
  if(!run.caught){
    run.dist += run.speed*dt;
    run.bots.forEach(b=>{ if(!b.you) b.d+=b.sp*dt; });
  }
  run.bots.find(b=>b.you).d = run.dist;
  scrollWorld(dt,run.speed);

  // guard chase
  const gz = run.caught? Math.max(.6, guard.group.position.z - dt*7) : Math.min(11, 5+run.dist*.004);
  guard.group.position.z += (gz-guard.group.position.z)*Math.min(1,dt*4);
  guard.group.position.x = run.x;
  animRunner(guard,run.t,'run',run.speed*.9);

  // player move
  run.x += (LANES[run.lane]-run.x)*Math.min(1,dt*11);
  if(run.y>0||run.vy!==0){ run.vy-=30*dt; run.y+=run.vy*dt; if(run.y<=0){run.y=0;run.vy=0;run.airJumps=Math.max(run.airJumps,0);} }
  const sliding = run.slide>0;
  const P=player.group;
  P.position.set(run.x, run.y - (sliding?.32:0), 0);
  P.scale.y = sliding? .62 : 1;
  P.rotation.y = (LANES[run.lane]-run.x)*-.12;
  P.rotation.z = (LANES[run.lane]-run.x)*-.06;
  animRunner(player, run.t, sliding?'slide':(run.y>0?'air':'run'), run.speed);
  player.parts.blob.scale.setScalar(Math.max(.4,1-run.y*.3));
  magnetRing.rotation.z+=dt*5;

  // camera + turbo FOV
  const wantFov = run.fx.turbo>0? 75:60;
  camera.fov += (wantFov-camera.fov)*Math.min(1,dt*5); camera.updateProjectionMatrix();
  camera.position.set(run.x*.5,4.1-run.y*.25,7.6); camera.lookAt(run.x*.6,1.4,-9);

  if(!run.caught){
    // spawn patterns (always solvable: ≥1 free lane)
    run.spawnT-=dt;
    if(run.spawnT<=0){
      run.spawnT=Math.max(.85, 1.6-run.dist*0.0006);
      const z=-130, r=Math.random(), free=(Math.random()*3)|0;
      if(r<.34){ // trains on 2 lanes
        [0,1,2].filter(l=>l!==free).forEach(l=>spawnTrain(l,z-Math.random()*8,8+Math.random()*8,(Math.random()*4)|0));
        for(let k=0;k<4;k++) spawnCoin(free,z-4-k*2.2,.7);
        if(Math.random()<.4) spawnGem(free,z-16,1.2);
      } else if(r<.58){ // full-width barriers (jump!)
        [0,1,2].forEach(l=>{ spawnBarrier(l,z); for(let k=0;k<3;k++) spawnCoin(l,z+3-k*2,1.1+k*.45); });
      } else if(r<.8){ // full-width overheads (slide!)
        [0,1,2].forEach(l=>{ spawnOverhead(l,z); for(let k=0;k<4;k++) spawnCoin(l,z+4-k*2,.5); });
      } else { // mixed
        spawnBarrier(free,z); spawnOverhead((free+1)%3,z-2);
        spawnTrain((free+2)%3,z-6,9,(Math.random()*4)|0);
        spawnGem(free,z+4,1.6);
      }
    }
    // entities
    const magnetR = run.fx.magnet>0?6:1.25;
    for(let i=ents.length-1;i>=0;i--){
      const e=ents[i];
      const adv = e.kind==='train'&&e.len? 0 : run.speed*dt;
      e.z+=run.speed*dt; e.mesh.position.z=e.z;
      if(e.kind==='coin'||e.kind==='gem'){
        e.mesh.rotation.y+=dt*4;
        if(e.kind==='gem') e.mesh.position.y=e.y+Math.sin(t*3+e.ph)*.2;
        const dx=e.mesh.position.x-run.x;
        if(run.fx.magnet>0 && Math.abs(e.z)<11) e.mesh.position.x-=dx*dt*9;
        if(Math.abs(e.z)<1.3 && Math.abs(e.mesh.position.x-run.x)<magnetR && Math.abs((run.y+1.0)-e.mesh.position.y)<1.2){
          run[e.kind==='coin'?'coins':'gems']++; refreshHudRun();
          scene.remove(e.mesh); ents.splice(i,1); continue; }
      } else {
        const half = e.kind==='train'? e.len/2 : .6;
        if(Math.abs(e.z)<half && Math.abs(e.mesh.position.x-run.x)<1.25){
          let hit=false;
          if(e.kind==='train') hit = true;
          else if(e.kind==='barrier') hit = run.y<.85;
          else if(e.kind==='over') hit = !sliding;
          if(hit){
            if(run.fx.shield>0||run.fx.ghost>0||run.fx.turbo>0){
              scene.remove(e.mesh); ents.splice(i,1); toast('💥 تحطيم!'); continue;
            } else { scene.remove(e.mesh); ents.splice(i,1); crash(); break; }
          }
        }
      }
      const tail = e.kind==='train'? e.len/2+12 : 12;
      if(e.z>tail){ scene.remove(e.mesh); ents.splice(i,1); }
    }
  } else {
    // caught: guard catches up, then game over
    run.catchT+=dt;
    if(run.catchT>1.1){ run.caught=false; endRace(false); return; }
  }

  if(((run.t*2)|0)!==(((run.t-dt)*2)|0)) renderBots();
  $('hud-dist').querySelector('b').textContent=Math.floor(run.dist)+'م';
  $('hud-rank').textContent='#'+([...run.bots].sort((a,b)=>b.d-a.d).findIndex(b=>b.you)+1);
  $('race-progress').style.width=Math.min(100,run.dist/RACE_LEN*100)+'%';
  $('race-label').textContent=`${Math.floor(run.dist)} / ${RACE_LEN}م`;
  if(run.dist>=RACE_LEN){ endRace(true); return; }
  if(((now/400)|0)!==_fxT){_fxT=(now/400)|0; updateFx();}
  renderer.render(scene,camera);
}
let _fxT=0;
function refreshHudRun(){ $('hud-coins').querySelector('b').textContent=run.coins; }
function refreshWallet(){
  $('m-coins').textContent=S.coins; $('m-gems').textContent=S.gems; $('m-points').textContent=S.points;
  const hc=$('hud-coins'); if(hc) hc.querySelector('b').textContent=run.coins;
  const hg=$('hud-gems'); if(hg) hg.querySelector('b').textContent=S.gems;
}

/* ---------- controls ---------- */
function goLeft(){ if(run.on) run.lane=Math.max(0,run.lane-1); }
function goRight(){ if(run.on) run.lane=Math.min(2,run.lane+1); }
function jump(){
  if(!run.on||run.caught) return;
  if(run.y<=0.01&&run.vy===0){ run.vy=10.5; run.slide=0; }
  else if(run.airJumps>0){ run.airJumps--; save(); run.vy=9; toast('👟 قفز مزدوج!'); updateFx(); }
}
function slide(){
  if(!run.on||run.caught) return;
  if(run.y>0){ run.vy=-22; }
  run.slide=.75;
}
addEventListener('keydown',e=>{
  if(e.key==='ArrowLeft'||e.key==='a'||e.key==='A') goLeft();
  else if(e.key==='ArrowRight'||e.key==='d'||e.key==='D') goRight();
  else if(e.key==='ArrowUp'||e.key===' '||e.key==='w'){ jump(); e.preventDefault(); }
  else if(e.key==='ArrowDown'||e.key==='s') slide();
  else { const p=POWERS.find(p=>p.key===e.key); if(p) usePower(p.id); }
});
let tx=0,ty=0;
canvas.addEventListener('touchstart',e=>{tx=e.touches[0].clientX;ty=e.touches[0].clientY;},{passive:true});
canvas.addEventListener('touchend',e=>{
  const dx=e.changedTouches[0].clientX-tx, dy=e.changedTouches[0].clientY-ty;
  if(Math.abs(dx)>30||Math.abs(dy)>30){
    if(Math.abs(dx)>Math.abs(dy)) dx>0?goRight():goLeft();
    else dy<0? jump():slide();
  }
},{passive:true});
$('tc-left').addEventListener('pointerdown',e=>{e.preventDefault();goLeft();});
$('tc-right').addEventListener('pointerdown',e=>{e.preventDefault();goRight();});
$('tc-up').addEventListener('pointerdown',e=>{e.preventDefault();jump();});
$('tc-down').addEventListener('pointerdown',e=>{e.preventDefault();slide();});

/* ---------- shop / IAP / outfits ---------- */
function renderShop(){
  $('iap-list').innerHTML=IAPS.map((p,i)=>
    `<div class="shop-item"><span>${p.n}<br><small class="muted">${p.g} 💎</small></span><button class="buy" data-iap="${i}">${p.p} شراء</button></div>`).join('');
  document.querySelectorAll('[data-iap]').forEach(b=>b.addEventListener('click',()=>{
    const p=IAPS[+b.dataset.iap]; addGems(p.g); toast(`✅ تم شحن ${p.g} 💎 (تجريبي — ${p.p})`); }));
  $('power-shop').innerHTML=POWERS.map(p=>
    `<div class="pow-item"><span>${p.icon} ${p.name}<br><small class="muted">${p.desc}</small></span><button data-pow="${p.id}">${p.cost} 💎 | لديك ${S.inv[p.id]||0}</button></div>`).join('');
  document.querySelectorAll('[data-pow]').forEach(b=>b.addEventListener('click',()=>{
    const p=POWERS.find(x=>x.id===b.dataset.pow);
    if(S.gems<p.cost){ toast('💎 جواهر غير كافية — شاهد إعلانًا +10💎'); return; }
    S.gems-=p.cost; S.inv[p.id]=(S.inv[p.id]||0)+1; save(); refreshWallet(); renderShop(); renderPowers();
    toast(`✅ تم شراء ${p.icon} ${p.name}`);
  }));
}
function renderOutfits(){
  $('outfit-list').innerHTML=SHIRTS.map((s,i)=>
    `<div class="outfit-item ${S.shirt===i?'sel':''}"><span><span class="dot" style="background:#${s.c.toString(16).padStart(6,'0')}"></span>قميص ${s.name}${s.price?` — ${s.price} 💰`: ' — مجاني'}</span>${S.shirt===i?'<b>✅ ملبوس</b>':`<button data-shirt="${i}">${s.price?'شراء ولبس':'لبس'}</button>`}</div>`).join('');
  document.querySelectorAll('[data-shirt]').forEach(b=>b.addEventListener('click',()=>{
    const s=SHIRTS[+b.dataset.shirt];
    if(S.coins<s.price){ toast('💰 عملات غير كافية — اجمع من السباقات!'); return; }
    S.coins-=s.price; S.shirt=+b.dataset.shirt; save(); refreshWallet(); applyShirt(); renderOutfits();
    toast(`👕 لبست قميص ${s.name}!`);
  }));
}
function applyShirt(){ shirtMat.color.set(SHIRTS[S.shirt||0].c); }

/* ---------- leaderboard ---------- */
function renderBoard(){
  const bots=BOT_NAMES.map((n,i)=>({n,p:400+((i*137)%900)}));
  const all=[...bots,{n:'🏃 أنت',p:S.points,me:true},...S.board.map(b=>({...b,me:b.n==='أنت'}))]
    .sort((a,b)=>b.p-a.p).slice(0,10);
  $('board-list').innerHTML=all.map((r,i)=>`<div class="br-row ${r.me?'me':''}"><span>${i+1}. ${r.n}</span><b>${r.p} 🏆</b></div>`).join('');
}

/* ---------- wheel ---------- */
let wheelAngle=0, spinning=false;
function drawWheel(){
  const c=$('wheel-canvas'),x=c.getContext('2d'),R=150;
  x.clearRect(0,0,300,300);
  WHEEL.forEach((s,i)=>{
    const a0=wheelAngle+i*Math.PI*2/WHEEL.length, a1=a0+Math.PI*2/WHEEL.length;
    x.fillStyle=i%2?'#1e2a55':'#7c2d5e'; x.beginPath(); x.moveTo(R,R); x.arc(R,R,R-4,a0,a1); x.fill();
    x.save(); x.translate(R,R); x.rotate((a0+a1)/2); x.fillStyle='#fff'; x.font='bold 13px sans-serif';
    x.textAlign='right'; x.fillText(s.t,R-14,5); x.restore();
  });
  x.fillStyle='#ffd166'; x.beginPath(); x.moveTo(150,0); x.lineTo(138,22); x.lineTo(162,22); x.fill();
}
function wheelReady(){ return Date.now()-S.lastWheel > 4*3600*1000; }
function updateWheelUI(){
  drawWheel();
  const left=S.lastWheel+4*3600*1000-Date.now();
  $('wheel-info').textContent = left<=0 ? '✅ تدوير مجاني متاح الآن!'
    : `⏳ المجاني بعد ${Math.floor(left/3600000)}س ${Math.floor(left%3600000/60000)}د — أو شاهد إعلانًا لتدوير إضافي`;
}
function spin(free){
  if(spinning) return; spinning=true; $('wheel-result').textContent='';
  const idx=Math.floor(Math.random()*WHEEL.length);
  const target=Math.PI*2*5 + (Math.PI*2 - (idx+.5)*Math.PI*2/WHEEL.length);
  const start=wheelAngle, t0=performance.now();
  (function anim(t){ const k=Math.min(1,(t-t0)/3800), e=1-Math.pow(1-k,3);
    wheelAngle=start+target*e; drawWheel();
    if(k<1) requestAnimationFrame(anim);
    else { spinning=false; if(free){S.lastWheel=Date.now();} save(); WHEEL[idx].f(); save(); refreshWallet(); updateWheelUI();
      $('wheel-result').textContent=`🎉 ربحت: ${WHEEL[idx].t}`; toast(`🎡 ${WHEEL[idx].t}`); }
  })(t0);
}

/* ---------- ads (simulated) ---------- */
let adCb=null;
function showAd(cb){
  adCb=cb; $('ad').classList.remove('hidden');
  let s=5; $('ad-sec').textContent=s; $('ad-fill').style.width='0';
  const iv=setInterval(()=>{ s--; $('ad-sec').textContent=Math.max(0,s);
    $('ad-fill').style.width=((5-s)/5*100)+'%';
    if(s<=0){ clearInterval(iv); $('ad').classList.add('hidden'); toast('🎁 تمت مكافأة الإعلان!'); adCb&&adCb(); } },1000);
}
setInterval(()=>{ if(!$('menu').classList.contains('hidden')){ addCoins(500); toast('📺 مكافأة تلقائية: +500 💰'); } },45*60*1000);

/* ---------- daily ---------- */
function checkDaily(){
  const today=new Date().toDateString();
  $('daily-banner').classList.toggle('hidden', S.lastDaily===today);
  $('daily-streak').textContent=S.streak+1;
}
function claimDaily(x2){
  const today=new Date().toDateString(); if(S.lastDaily===today) return;
  S.lastDaily=today; S.streak++; const m=x2?2:1;
  addCoins(500*m); addGems(25*m); save(); checkDaily();
  $('daily').classList.add('hidden'); toast(`🎁 يوم ${S.streak}: +${500*m}💰 +${25*m}💎`);
}

/* ---------- wiring (all buttons guaranteed live after boot) ---------- */
document.querySelectorAll('[data-close]').forEach(b=>b.addEventListener('click',()=>$(b.dataset.close).classList.add('hidden')));
$('btn-start').addEventListener('click',()=>startRace(false));
$('btn-online').addEventListener('click',()=>startRace(true));   // مباشرة إلى عالم السباق
$('btn-quick-online').addEventListener('click',()=>{ $('friends').classList.add('hidden'); startRace(true); });
$('btn-shop').addEventListener('click',()=>{ renderShop(); $('shop').classList.remove('hidden'); });
$('btn-outfit').addEventListener('click',()=>{ renderOutfits(); $('outfit').classList.remove('hidden'); });
$('btn-board').addEventListener('click',()=>{ renderBoard(); $('board').classList.remove('hidden'); });
$('btn-friends').addEventListener('click',()=>{ $('friends').classList.remove('hidden'); $('my-code').textContent=S.code; });
$('btn-how').addEventListener('click',()=>$('how').classList.remove('hidden'));
$('btn-wheel').addEventListener('click',()=>{ updateWheelUI(); $('wheelM').classList.remove('hidden'); });
$('btn-spin').addEventListener('click',()=>{
  if(!wheelReady()){ toast('⏳ التدوير المجاني بعد 4 ساعات — شاهد إعلانًا لتدوير إضافي 📺'); return; }
  spin(true);
});
$('btn-spin-ad').addEventListener('click',()=>showAd(()=>spin(false)));
$('btn-ad').addEventListener('click',()=>{
  if(S.gems<10) showAd(()=>{ addGems(10); toast('💎 +10 جواهر!'); });
  else showAd(()=>addGems(5));
});
$('btn-daily-open').addEventListener('click',()=>$('daily').classList.remove('hidden'));
$('btn-daily-claim').addEventListener('click',()=>claimDaily(false));
$('btn-daily-x2').addEventListener('click',()=>showAd(()=>claimDaily(true)));
$('btn-copy').addEventListener('click',()=>{ try{navigator.clipboard.writeText(S.code);}catch{} toast('📋 تم نسخ الكود!'); });
$('btn-redeem').addEventListener('click',()=>{
  const c=$('friend-code').value.trim().toUpperCase();
  if(!c) return;
  if(c===S.code){ $('friend-msg').textContent='⚠️ لا يمكنك دعوة نفسك!'; return; }
  if(S.redeemed.includes(c)){ $('friend-msg').textContent='⚠️ استخدمت هذا الكود من قبل'; return; }
  S.redeemed.push(c); addGems(50); save(); $('friend-msg').textContent='🎉 +50 💎 لك ولصديقك!';
});
$('btn-again').addEventListener('click',()=>startRace(false));
$('btn-menu').addEventListener('click',()=>{ $('over').classList.add('hidden'); $('menu').classList.remove('hidden'); refreshWallet(); checkDaily(); });

applyShirt(); refreshWallet(); checkDaily(); drawWheel();
window.__booted = false;
requestAnimationFrame(t=>{ lastT=t; window.__booted=true; frame(t); });
