import * as THREE from 'three';

/* ====== Subway Runner 3D — ترقية عميقة: شخصيات حقيقية + عالم حديث + لمس فقط ====== */
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
/* متجر شخصيات ممتلئ: رجالية ونسائية — عيون وملابس وأسعار مختلفة */
const CHARACTERS = [
  { name:'كريم',  face:'🧑', gender:'male',   skin:0xf2c89b, hair:0x1f2937, hairStyle:'short', shirt:0x22d3ee, pants:0x2b3a55, shoes:0xef4444, eyes:'بنية',  cost:{coins:0},   desc:'عدّاء الحي — مجاني' },
  { name:'سارة',  face:'👩', gender:'female', skin:0xffd9b3, hair:0x6b3f12, hairStyle:'long',  shirt:0xec4899, pants:0x334155, shoes:0xffffff, eyes:'عسلية', cost:{coins:400}, desc:'عيون عسلية وشعر طويل' },
  { name:'عمر',   face:'🧑', gender:'male',   skin:0xe8b07d, hair:0x111111, hairStyle:'spiky', shirt:0xef4444, pants:0x1f2937, shoes:0xfbbf24, eyes:'سوداء', cost:{coins:600}, desc:'تسريحة شوكية أنيقة' },
  { name:'ليلى',  face:'👩', gender:'female', skin:0xc68642, hair:0x0b0b0b, hairStyle:'long',  shirt:0xa78bfa, pants:0x1e1b4b, shoes:0xf9a8d4, eyes:'سوداء', cost:{coins:800}, desc:'أناقة بنفسجية ملكية' },
  { name:'نينجا', face:'🥷', gender:'male',   skin:0xe8b07d, hair:0x000000, hairStyle:'band',  shirt:0x111827, pants:0x111827, shoes:0x374151, eyes:'حادة',  cost:{gems:25},  desc:'زي النينجا الأسود 🥷' },
  { name:'كابتن', face:'🧑‍✈️', gender:'male', skin:0xf2c89b, hair:0x3f2d12, hairStyle:'cap',   shirt:0x16a34a, pants:0x0f172a, shoes:0xffffff, eyes:'زرقاء', cost:{gems:40},  desc:'جاكيت طيار أخضر 🧥' },
  { name:'نجمة',  face:'👩', gender:'female', skin:0xffe0bd, hair:0xd97706, hairStyle:'pony',  shirt:0xfbbf24, pants:0x78350f, shoes:0xfff7ed, eyes:'خضراء', cost:{gems:50},  desc:'فستان ذهبي لامع ✨' },
  { name:'أميرة', face:'👸', gender:'female', skin:0xffd9b3, hair:0x431407, hairStyle:'crown', shirt:0xf472b6, pants:0x4c1d95, shoes:0xfde047, eyes:'عسلية', cost:{gems:80},  desc:'تاج ملكي 👑 للفائزات' },
];
const IAPS = [
  { n:'💎 Starter Pack',  g:200,   p:'1.99 $' },
  { n:'💎 Silver Pack',   g:600,   p:'4.99 $' },
  { n:'💎 Gold Pack',     g:1500,  p:'9.99 $' },
  { n:'💎 Diamond Pack',  g:4000,  p:'19.99 $' },
  { n:'💎 Ultimate Pack', g:10000, p:'49.99 $' },
];
const WHEEL = [
  { t:'10 💎', c:'#0ea5e9', f:()=>addGems(10) }, { t:'500 💰', c:'#f59e0b', f:()=>addCoins(500) },
  { t:'⚡ قدرة', c:'#8b5cf6', f:()=>{ for(const p of POWERS) S.inv[p.id]=(S.inv[p.id]||0)+1; } },
  { t:'25 💎', c:'#06b6d4', f:()=>addGems(25) }, { t:'200 💰', c:'#eab308', f:()=>addCoins(200) },
  { t:'🎫 سباق', c:'#22c55e', f:()=>addCoins(300) }, { t:'5 💎', c:'#3b82f6', f:()=>addGems(5) },
  { t:'👑 50💎', c:'#ef4444', f:()=>addGems(50) },
];
const BOT_NAMES = ['⚡فهد_السرعة','🔥صقر_الخليج','🌪️عاصفة','💫نجم_الليل','🐆تشيتا','👾جيمر_X'];

/* ---------- save ---------- */
const DEF = { coins:600, gems:100, points:0, best:0, races:0, streak:0, lastDaily:'', lastWheel:0,
  inv:{turbo:1,magnet:1,shield:1,ghost:0,jump:2}, char:0, owned:[0], code:'', redeemed:[], board:[] };
let S; try { S = {...DEF, ...JSON.parse(localStorage.getItem('subway3d')||'{}')}; S.inv={...DEF.inv,...(S.inv||{})}; }
catch { S = JSON.parse(JSON.stringify(DEF)); }
if(!S.code) S.code = 'SR-'+Math.random().toString(36).slice(2,7).toUpperCase();
if(!Array.isArray(S.owned)||!S.owned.length) S.owned=[0];
const save = ()=>{ try{localStorage.setItem('subway3d', JSON.stringify(S));}catch{} };
const addCoins = n=>{S.coins+=n; save(); refreshWallet();};
const addGems = n=>{S.gems+=n; save(); refreshWallet();};
function toast(m){ const t=$('toast'); t.textContent=m; t.classList.add('show'); clearTimeout(t._x); t._x=setTimeout(()=>t.classList.remove('show'),2200); }

/* ---------- renderer / scene ---------- */
const canvas = $('c3d');
let renderer;
try { renderer = new THREE.WebGLRenderer({canvas, antialias:true}); }
catch(e){ document.getElementById('boot-err').classList.remove('hidden'); throw e; }
renderer.setPixelRatio(Math.min(devicePixelRatio,2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15;
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x8ecff0);
scene.fog = new THREE.Fog(0x8ecff0, 32, 120);
const camera = new THREE.PerspectiveCamera(60, 1, .1, 400);
function resize(){ renderer.setSize(innerWidth,innerHeight,false); camera.aspect=innerWidth/innerHeight; camera.updateProjectionMatrix(); }
addEventListener('resize', resize); resize();
scene.add(new THREE.HemisphereLight(0xd8ecff, 0x3f7c3a, 1.0));
const sun = new THREE.DirectionalLight(0xfff6e0, 1.7); sun.position.set(8,20,6); scene.add(sun);
const sunBall = new THREE.Mesh(new THREE.SphereGeometry(4,16,16), new THREE.MeshBasicMaterial({color:0xfff9c4, fog:false}));
sunBall.position.set(-30,32,-110); scene.add(sunBall);

/* ---------- shared mats ---------- */
const M = {
  wood:  new THREE.MeshStandardMaterial({color:0x6b5a48, roughness:.95}),
  rail:  new THREE.MeshStandardMaterial({color:0xb8c2cc, metalness:.9, roughness:.3}),
  leaf:  new THREE.MeshStandardMaterial({color:0x22a355, roughness:.9}),
  leaf2: new THREE.MeshStandardMaterial({color:0x7ddf6a, roughness:.9}),
  trunk: new THREE.MeshStandardMaterial({color:0x7c4a21, roughness:.95}),
  lamp:  new THREE.MeshStandardMaterial({color:0x334155, roughness:.55, metalness:.45}),
  glow:  new THREE.MeshBasicMaterial({color:0xfef08a}),
  coin:  new THREE.MeshStandardMaterial({color:0xfacc15, metalness:.85, roughness:.22, emissive:0x7c5e00}),
  gem:   new THREE.MeshStandardMaterial({color:0x22d3ee, emissive:0x0e7490, metalness:.5, roughness:.18}),
  obs:   new THREE.MeshStandardMaterial({color:0xf97316, roughness:.55}),
  obsW:  new THREE.MeshStandardMaterial({color:0xffffff, roughness:.55}),
  sign:  new THREE.MeshStandardMaterial({color:0x1d4ed8, roughness:.5}),
  white: new THREE.MeshStandardMaterial({color:0xffffff, roughness:.5}),
  eyeW:  new THREE.MeshStandardMaterial({color:0xffffff, roughness:.3}),
  pupil: new THREE.MeshStandardMaterial({color:0x111111, roughness:.3}),
  mouth: new THREE.MeshStandardMaterial({color:0x7f1d1d, roughness:.6}),
};

/* ---------- ground & tracks ---------- */
function flat(w,l,color,x,z,y=0){
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w,l), new THREE.MeshStandardMaterial({color, roughness:1}));
  m.rotation.x=-Math.PI/2; m.position.set(x,y,z); scene.add(m); return m;
}
flat(12,400,0x555b66,0,-150);
flat(80,400,0x4fc46a,-46,-150);
flat(80,400,0x4ad066,46,-150);
flat(12,400,0x3f4650,0,-150,0.001);
const sleepers=[];
{ const g = new THREE.BoxGeometry(8.8,.1,.65);
  for(let z=12; z>-130; z-=2.2){ const s = new THREE.Mesh(g, M.wood); s.position.set(0,.06,z); scene.add(s); sleepers.push(s); } }
LANES.forEach(cx=>{ [-0.7,0.7].forEach(o=>{
  const r = new THREE.Mesh(new THREE.BoxGeometry(.15,.15,300), M.rail);
  r.position.set(cx+o,.18,-100); scene.add(r); }); });

/* ---------- living colorful world ---------- */
const scenery=[]; const SCAN_SPAN = 154;
function makeTree(){ const g=new THREE.Group();
  const t=new THREE.Mesh(new THREE.CylinderGeometry(.18,.28,1.4,8),M.trunk); t.position.y=.7; g.add(t);
  const c1=new THREE.Mesh(new THREE.ConeGeometry(1.2,2,9),M.leaf); c1.position.y=2.2; g.add(c1);
  const c2=new THREE.Mesh(new THREE.ConeGeometry(.85,1.4,9),M.leaf2); c2.position.y=3.2; g.add(c2);
  const ap=new THREE.Mesh(new THREE.SphereGeometry(.22,8,8),new THREE.MeshStandardMaterial({color:0xef4444,roughness:.6}));
  ap.position.set(.5,2.4,.4); g.add(ap); return g; }
function makeFlowers(){ const g=new THREE.Group(); const cols=[0xef4444,0xfbbf24,0xec4899,0xffffff,0xa78bfa];
  for(let i=0;i<5;i++){ const st=new THREE.Mesh(new THREE.CylinderGeometry(.03,.03,.5,6),M.leaf);
    st.position.set(Math.random()*3-1.5,.25,Math.random()*2-1); g.add(st);
    const f=new THREE.Mesh(new THREE.SphereGeometry(.11,8,8),new THREE.MeshStandardMaterial({color:cols[i%5],roughness:.6}));
    f.position.set(st.position.x,.55,st.position.z); g.add(f); } return g; }
function makeLamp(){ const g=new THREE.Group();
  const p=new THREE.Mesh(new THREE.CylinderGeometry(.09,.13,4.6,8),M.lamp); p.position.y=2.3; g.add(p);
  const b=new THREE.Mesh(new THREE.SphereGeometry(.3,10,10),M.glow); b.position.y=4.7; g.add(b);
  const cap=new THREE.Mesh(new THREE.ConeGeometry(.45,.4,8),M.lamp); cap.position.y=4.95; g.add(cap); return g; }
function makeHouse(col){ const g=new THREE.Group();
  const b=new THREE.Mesh(new THREE.BoxGeometry(5.5,3.6,4.5),new THREE.MeshStandardMaterial({color:col,roughness:.85})); b.position.y=1.8; g.add(b);
  const r=new THREE.Mesh(new THREE.ConeGeometry(4,2,4),new THREE.MeshStandardMaterial({color:0xb45309,roughness:.9})); r.position.y=4.5; r.rotation.y=Math.PI/4; g.add(r);
  for(let i=-1;i<=1;i++){ const w=new THREE.Mesh(new THREE.BoxGeometry(.9,.9,.12),M.glow); w.position.set(i*1.6,1.9,2.28); g.add(w); }
  const d=new THREE.Mesh(new THREE.BoxGeometry(1,2,.12),new THREE.MeshStandardMaterial({color:0x78350f})); d.position.set(0,1,2.28); g.add(d); return g; }
const blinkers=[];
function makeSignal(){ const g=new THREE.Group();
  const p=new THREE.Mesh(new THREE.CylinderGeometry(.08,.1,2.8,8),M.lamp); p.position.y=1.4; g.add(p);
  const h=new THREE.Mesh(new THREE.BoxGeometry(.55,1,.32),M.lamp); h.position.y=3; g.add(h);
  const l=new THREE.Mesh(new THREE.SphereGeometry(.15,8,8),new THREE.MeshBasicMaterial({color:0x22c55e})); l.position.set(0,3.1,.2); g.add(l);
  blinkers.push(l); return g; }
function makeGantry(){ const g=new THREE.Group(); const cols=[0xef4444,0xfbbf24,0x22c55e,0x3b82f6,0xec4899,0xa78bfa,0xffffff];
  [-4.6,4.6].forEach(x=>{ const p=new THREE.Mesh(new THREE.CylinderGeometry(.12,.15,6.4,8),M.lamp); p.position.set(x,3.2,0); g.add(p); });
  const bar=new THREE.Mesh(new THREE.BoxGeometry(9.6,.18,.18),M.lamp); bar.position.set(0,6.2,0); g.add(bar);
  for(let i=0;i<9;i++){ const f=new THREE.Mesh(new THREE.PlaneGeometry(.55,.7),
    new THREE.MeshBasicMaterial({color:cols[i%cols.length],side:THREE.DoubleSide}));
    f.position.set(-4+i,5.75,0); f.userData.ph=i*.7; g.add(f); pennants.push(f); }
  const board=new THREE.Mesh(new THREE.BoxGeometry(3.2,1,.2),M.sign); board.position.set(0,6.9,0); g.add(board);
  const strip=new THREE.Mesh(new THREE.BoxGeometry(2.6,.35,.05),M.glow); strip.position.set(0,6.9,.13); g.add(strip);
  return g; }
const pennants=[];
function makePole(){ const g=new THREE.Group();
  const p=new THREE.Mesh(new THREE.CylinderGeometry(.1,.12,6,8),M.lamp); p.position.y=3; g.add(p);
  const arm=new THREE.Mesh(new THREE.BoxGeometry(3.4,.12,.12),M.lamp); arm.position.set(0,5.6,0); g.add(arm); return g; }
function makeFence(){ const g=new THREE.Group(); const fm=new THREE.MeshStandardMaterial({color:0xffffff,roughness:.7});
  for(let i=0;i<4;i++){ const p=new THREE.Mesh(new THREE.BoxGeometry(.12,1,.12),fm); p.position.set(0,.5,i*1.6-2.4); g.add(p); }
  const r1=new THREE.Mesh(new THREE.BoxGeometry(.08,.08,6.4),fm); r1.position.set(0,.85,0); g.add(r1);
  const r2=new THREE.Mesh(new THREE.BoxGeometry(.08,.08,6.4),fm); r2.position.set(0,.45,0); g.add(r2); return g; }
/* قطار حديث: مقدمة انسيابية + شريط + نوافذ بانورامية + إضاءة */
const LIVERY=[{b:0xdc2626,s:0xffffff},{b:0x2563eb,s:0xe0f2fe},{b:0x059669,s:0xfef9c3},{b:0xea580c,s:0x1f2937},{b:0x7c3aed,s:0xfde68a}];
function makeModernTrain(len,ci){
  const g=new THREE.Group(); const L=LIVERY[ci%LIVERY.length];
  const bodyM=new THREE.MeshStandardMaterial({color:L.b,roughness:.35,metalness:.35});
  const body=new THREE.Mesh(new THREE.BoxGeometry(2.2,2.2,len),bodyM); body.position.y=1.6; g.add(body);
  const stripe=new THREE.Mesh(new THREE.BoxGeometry(2.26,.5,len*.96),new THREE.MeshStandardMaterial({color:L.s,roughness:.4})); stripe.position.y=.95; g.add(stripe);
  const winM=new THREE.MeshStandardMaterial({color:0x0c4a6e,emissive:0x7dd3fc,emissiveIntensity:.7,roughness:.15,metalness:.4});
  const win=new THREE.Mesh(new THREE.BoxGeometry(2.26,.75,len*.8),winM); win.position.y=2.0; g.add(win);
  for(let i=0;i<Math.floor(len/2);i++){ const div=new THREE.Mesh(new THREE.BoxGeometry(2.28,.8,.08),bodyM); div.position.set(0,2.0,-len/2+1+i*2); g.add(div); }
  const nose=new THREE.Mesh(new THREE.CylinderGeometry(1.1,1.1,1.6,3,1),bodyM);
  nose.rotation.set(0,0,Math.PI); nose.scale.set(1,1,.7); nose.position.set(0,1.5,-len/2-.6); nose.rotation.y=Math.PI; g.add(nose);
  const glass=new THREE.Mesh(new THREE.BoxGeometry(1.5,.8,.15),new THREE.MeshStandardMaterial({color:0x082f49,emissive:0x38bdf8,emissiveIntensity:.9,roughness:.1}));
  glass.position.set(0,2.1,-len/2-.95); glass.rotation.x=-.35; g.add(glass);
  [-.65,.65].forEach(x=>{ const hl=new THREE.Mesh(new THREE.SphereGeometry(.17,10,10),new THREE.MeshBasicMaterial({color:0xfefce8})); hl.position.set(x,.9,-len/2-1.25); g.add(hl); });
  const roof=new THREE.Mesh(new THREE.BoxGeometry(2.3,.14,len),M.rail); roof.position.y=2.76; g.add(roof);
  for(let i=0;i<Math.max(1,Math.floor(len/6));i++){ const ac=new THREE.Mesh(new THREE.BoxGeometry(1.2,.3,2),new THREE.MeshStandardMaterial({color:0xcbd5e1,roughness:.6})); ac.position.set(0,2.95,-len/2+3+i*6); g.add(ac); }
  for(let i=0;i<Math.max(1,Math.floor(len/5));i++){ const bg=new THREE.Mesh(new THREE.BoxGeometry(1.9,.6,1.6),new THREE.MeshStandardMaterial({color:0x1f2937,roughness:.8})); bg.position.set(0,.4,-len/2+2.5+i*5); g.add(bg); }
  [-1,1].forEach(s=>{ const door=new THREE.Mesh(new THREE.BoxGeometry(.06,1.6,.9),new THREE.MeshStandardMaterial({color:L.s,roughness:.4})); door.position.set(s*1.12,1.5,1); g.add(door); });
  return g;
}
const HOUSE_COLS=[0xfde68a,0xfbcfe8,0xc7d2fe,0xfed7aa,0xbbf7d0];
function scatter(side,i){
  const r=Math.random(); let g,x;
  if(r<.24){ g=makeTree(); x=side*(6.5+Math.random()*3); }
  else if(r<.34){ g=makeFlowers(); x=side*(5.4+Math.random()*3); }
  else if(r<.44){ g=makeLamp(); x=side*5.8; }
  else if(r<.58){ g=makeHouse(HOUSE_COLS[(Math.random()*HOUSE_COLS.length)|0]); x=side*(14+Math.random()*8); }
  else if(r<.66){ g=makeSignal(); x=side*5.1; }
  else if(r<.70){ g=makePole(); x=side*5.4; }
  else if(r<.76){ g=makeFence(); g.rotation.y=Math.PI/2; x=side*5.3; }
  else if(r<.82){ g=makeGantry(); x=0; }
  else { g=makeModernTrain(7,(Math.random()*LIVERY.length)|0); x=side*6.4; }
  g.position.z = 12 - i*11 - Math.random()*4; g.position.x = x; scene.add(g); scenery.push(g);
}
for(const side of [-1,1]) for(let i=0;i<14;i++) scatter(side,i);
for(let i=0;i<7;i++){ const m=new THREE.Mesh(new THREE.ConeGeometry(11+Math.random()*8,20+Math.random()*14,6),
  new THREE.MeshStandardMaterial({color:i%2?0x7c9cc4:0x6b8cae,roughness:1})); m.position.set(-75+i*25,0,-155); scene.add(m);
  const sn=new THREE.Mesh(new THREE.ConeGeometry(3.5,5,6),M.white); sn.position.set(-75+i*25,16,-155); scene.add(sn); }
for(let i=0;i<12;i++){ const h=9+Math.random()*18;
  const b=new THREE.Mesh(new THREE.BoxGeometry(5+Math.random()*4,h,5),new THREE.MeshStandardMaterial({color:0xa9cdf5,roughness:1}));
  b.position.set(i%2? 36+Math.random()*16 : -36-Math.random()*16, h/2, -60-Math.random()*65); scene.add(b); }
const clouds=[];
for(let i=0;i<7;i++){ const g=new THREE.Group(); const cm=new THREE.MeshStandardMaterial({color:0xffffff,roughness:1});
  for(let k=0;k<3;k++){ const s=new THREE.Mesh(new THREE.SphereGeometry(1.6+Math.random(),10,8),cm);
    s.position.set(k*2.2-2,Math.random(),0); s.scale.y=.55; g.add(s); }
  g.position.set(-45+Math.random()*90,24+Math.random()*12,-40-Math.random()*70); scene.add(g); clouds.push(g); }
const birds=[];
for(let i=0;i<3;i++){ const g=new THREE.Group(); const bm=new THREE.MeshBasicMaterial({color:0x1e293b,side:THREE.DoubleSide});
  const wL=new THREE.Mesh(new THREE.PlaneGeometry(.9,.3),bm); wL.position.x=-.45; g.add(wL);
  const wR=new THREE.Mesh(new THREE.PlaneGeometry(.9,.3),bm); wR.position.x=.45; g.add(wR);
  g.userData={wL,wR,ph:Math.random()*6,cx:-10+i*10,cy:17+i,cz:-45,r:7+i*2,sp:.25+Math.random()*.2};
  scene.add(g); birds.push(g); }
/* 🎈 منطاد يطفو + 🦋 فراشات حول الزهور */
const balloon=new THREE.Group();
{
  const env=new THREE.Mesh(new THREE.SphereGeometry(2.2,16,14),new THREE.MeshStandardMaterial({color:0xef4444,roughness:.6}));
  env.scale.y=1.15; balloon.add(env);
  const stripe=new THREE.Mesh(new THREE.SphereGeometry(2.23,16,6,0,Math.PI*2,Math.PI/3,Math.PI/6),new THREE.MeshStandardMaterial({color:0xfbbf24,roughness:.6}));
  stripe.scale.y=1.15; balloon.add(stripe);
  const basket=new THREE.Mesh(new THREE.BoxGeometry(.9,.7,.9),new THREE.MeshStandardMaterial({color:0x78350f,roughness:.9}));
  basket.position.y=-3.4; balloon.add(basket);
  [-.35,.35].forEach(x=>{ [-.35,.35].forEach(z=>{ const rope=new THREE.Mesh(new THREE.CylinderGeometry(.02,.02,1.4,5),M.lamp);
    rope.position.set(x,-2.6,z); balloon.add(rope); }); });
  balloon.position.set(18,23,-70); scene.add(balloon);
}
const flies=[];
for(let i=0;i<4;i++){ const g=new THREE.Group();
  const wm=new THREE.MeshBasicMaterial({color:[0xec4899,0xfbbf24,0xa78bfa,0xffffff][i],side:THREE.DoubleSide});
  const wL=new THREE.Mesh(new THREE.PlaneGeometry(.3,.22),wm); wL.position.x=-.15; g.add(wL);
  const wR=new THREE.Mesh(new THREE.PlaneGeometry(.3,.22),wm); wR.position.x=.15; g.add(wR);
  g.userData={wL,wR,ph:Math.random()*6,cx:i%2?6.5:-6.5,cy:1.2,cz:-8-i*6,r:1.6,sp:.9+Math.random()*.5};
  scene.add(g); flies.push(g); }

/* ---------- شخصيات بعيون حقيقية وملابس أنيقة ---------- */
function buildHuman(o){
  const g = new THREE.Group(); const parts={};
  const skin=new THREE.MeshStandardMaterial({color:o.skin,roughness:.6});
  const shirt=new THREE.MeshStandardMaterial({color:o.shirt,roughness:.7});
  const pants=new THREE.MeshStandardMaterial({color:o.pants,roughness:.8});
  const shoeM=new THREE.MeshStandardMaterial({color:o.shoes,roughness:.5});
  const hairM=new THREE.MeshStandardMaterial({color:o.hair,roughness:.85});
  const mats=[skin,shirt,pants,shoeM,hairM];
  // torso + jacket details
  const torso=new THREE.Mesh(new THREE.BoxGeometry(.56,.62,.34),shirt); torso.position.y=1.32; g.add(torso); parts.torso=torso;
  const zip=new THREE.Mesh(new THREE.BoxGeometry(.07,.55,.02),M.white); zip.position.set(0,1.32,-.18); g.add(zip);
  const collar=new THREE.Mesh(new THREE.BoxGeometry(.4,.1,.36),M.white); collar.position.set(0,1.6,0); g.add(collar);
  const pack=new THREE.Mesh(new THREE.BoxGeometry(.4,.46,.18),new THREE.MeshStandardMaterial({color:0xf59e0b,roughness:.7})); pack.position.set(0,1.34,.26); g.add(pack);
  // head
  const head=new THREE.Group(); head.position.y=1.88; g.add(head); parts.head=head;
  const face=new THREE.Mesh(new THREE.SphereGeometry(.25,18,16),skin); head.add(face);
  // 👀 eyes (front = -z)
  [-.09,.09].forEach(x=>{
    const w=new THREE.Mesh(new THREE.SphereGeometry(.055,10,10),M.eyeW); w.position.set(x,.03,-.21); head.add(w);
    const p=new THREE.Mesh(new THREE.SphereGeometry(.026,8,8),M.pupil); p.position.set(x,.03,-.258); head.add(p);
    const b=new THREE.Mesh(new THREE.BoxGeometry(.1,.025,.02),hairM); b.position.set(x,.12,-.225); b.rotation.z=x>0?-.25:.25; head.add(b);
  });
  const smile=new THREE.Mesh(new THREE.BoxGeometry(.12,.025,.02),M.mouth); smile.position.set(0,-.11,-.225); head.add(smile);
  if(o.gender==='female'){ [-.24,.24].forEach(x=>{ const ch=new THREE.Mesh(new THREE.SphereGeometry(.035,8,8),
    new THREE.MeshStandardMaterial({color:0xf9a8d4,roughness:.7})); ch.position.set(x,-.05,-.16); head.add(ch); }); }
  // hair styles
  const hs=o.hairStyle;
  if(hs==='long'||hs==='pony'){ const back=new THREE.Mesh(new THREE.BoxGeometry(.4,.55,.14),hairM); back.position.set(0,-.15,.22); head.add(back);
    const top=new THREE.Mesh(new THREE.SphereGeometry(.26,14,10,0,Math.PI*2,0,Math.PI/2),hairM); top.position.y=.03; head.add(top);
    if(hs==='pony'){ const t=new THREE.Mesh(new THREE.SphereGeometry(.09,8,8),hairM); t.position.set(.2,.15,.2); head.add(t); } }
  else if(hs==='spiky'){ for(let i=-2;i<=2;i++){ const s=new THREE.Mesh(new THREE.ConeGeometry(.06,.2,6),hairM); s.position.set(i*.09,.28,0); head.add(s); } }
  else if(hs==='cap'){ const c=new THREE.Mesh(new THREE.SphereGeometry(.26,14,8,0,Math.PI*2,0,Math.PI/2),new THREE.MeshStandardMaterial({color:o.shirt,roughness:.7})); c.position.y=.05; head.add(c);
    const br=new THREE.Mesh(new THREE.BoxGeometry(.3,.05,.26),new THREE.MeshStandardMaterial({color:o.shirt,roughness:.7})); br.position.set(0,.08,-.32); head.add(br); }
  else if(hs==='band'){ const b=new THREE.Mesh(new THREE.CylinderGeometry(.26,.26,.12,14),new THREE.MeshStandardMaterial({color:0x111827})); b.position.y=.1; head.add(b);
    const k1=new THREE.Mesh(new THREE.BoxGeometry(.08,.3,.03),new THREE.MeshStandardMaterial({color:0x111827})); k1.position.set(.1,-.1,.24); head.add(k1); }
  else if(hs==='crown'){ const top=new THREE.Mesh(new THREE.SphereGeometry(.26,14,10,0,Math.PI*2,0,Math.PI/2),hairM); top.position.y=.03; head.add(top);
    for(let i=-2;i<=2;i++){ const s=new THREE.Mesh(new THREE.ConeGeometry(.05,.18,5),new THREE.MeshStandardMaterial({color:0xfde047,metalness:.8,roughness:.3})); s.position.set(i*.09,.32,0); head.add(s); } }
  else { const top=new THREE.Mesh(new THREE.SphereGeometry(.26,14,10,0,Math.PI*2,0,Math.PI/2),hairM); top.scale.y=.85; top.position.y=.03; head.add(top);
    [-.25,.25].forEach(x=>{ const s=new THREE.Mesh(new THREE.BoxGeometry(.06,.16,.2),hairM); s.position.set(x,-.02,.02); head.add(s); }); }
  // limbs
  function limb(x,y,w,len,mat,isArm){
    const p=new THREE.Group(); p.position.set(x,y,0); g.add(p);
    const m=new THREE.Mesh(new THREE.BoxGeometry(w,len,w),mat); m.position.y=-len/2; p.add(m);
    if(isArm){ const h=new THREE.Mesh(new THREE.SphereGeometry(w*.8,10,8),skin); h.position.y=-len-.05; p.add(h); }
    else { const s=new THREE.Mesh(new THREE.BoxGeometry(w+.03,.13,.32),shoeM); s.position.set(0,-len-.02,-.06); p.add(s); }
    return p;
  }
  parts.lArm=limb(-.38,1.58,.15,.58,shirt,true);
  parts.rArm=limb(.38,1.58,.15,.58,shirt,true);
  parts.lLeg=limb(-.15,1.0,.18,.85,pants,false);
  parts.rLeg=limb(.15,1.0,.18,.85,pants,false);
  const blob=new THREE.Mesh(new THREE.CircleGeometry(.55,20),new THREE.MeshBasicMaterial({color:0x000000,transparent:true,opacity:.3}));
  blob.rotation.x=-Math.PI/2; blob.position.y=.02; g.add(blob); parts.blob=blob;
  return {group:g,parts,mats};
}
/* 👮 شرطي حقيقي يطاردك: بزة رسمية + شارة + شارب + نظرة غاضبة */
function buildPolice(){
  const o={skin:0xe8b07d,shirt:0x1e3a8a,pants:0x0f172a,shoes:0x000000,hair:0x111111,gender:'male',hairStyle:'short'};
  const R=buildHuman(o); const head=R.parts.head;
  const capM=new THREE.MeshStandardMaterial({color:0x0f172a,roughness:.6});
  const cap=new THREE.Mesh(new THREE.CylinderGeometry(.27,.27,.14,14),capM); cap.position.y=.2; head.add(cap);
  const badge=new THREE.Mesh(new THREE.CylinderGeometry(.07,.07,.03,12),new THREE.MeshStandardMaterial({color:0xfde047,metalness:.85,roughness:.3}));
  badge.rotation.x=Math.PI/2; badge.position.set(0,.2,-.27); head.add(badge);
  const mus=new THREE.Mesh(new THREE.BoxGeometry(.2,.05,.03),new THREE.MeshStandardMaterial({color:0x111111})); mus.position.set(0,-.06,-.24); head.add(mus);
  R.parts.torso.children; // torso exists
  const star=new THREE.Mesh(new THREE.CylinderGeometry(.08,.08,.03,5),new THREE.MeshStandardMaterial({color:0xfde047,metalness:.85,roughness:.3}));
  star.rotation.x=Math.PI/2; star.position.set(-.15,1.45,-.19); R.group.add(star);
  const belt=new THREE.Mesh(new THREE.BoxGeometry(.58,.09,.36),new THREE.MeshStandardMaterial({color:0x111111})); belt.position.set(0,1.02,0); R.group.add(belt);
  return R;
}
function animRunner(R,t,mode,spd){
  const P=R.parts, f=9+spd*.35, s=Math.sin(t*f), c=Math.cos(t*f);
  if(mode==='slide'){ P.lLeg.rotation.x=-1.2; P.rLeg.rotation.x=-.5; P.lArm.rotation.x=.6; P.rArm.rotation.x=.6; P.torso.rotation.x=.75; P.head.rotation.x=-.5; }
  else if(mode==='air'){ P.lLeg.rotation.x=-.9; P.rLeg.rotation.x=.55; P.lArm.rotation.x=-2.4; P.rArm.rotation.x=-2.4; P.torso.rotation.x=.08; P.head.rotation.x=0; }
  else { P.lLeg.rotation.x=s*.85; P.rLeg.rotation.x=-s*.85; P.lArm.rotation.x=-s*.7; P.rArm.rotation.x=s*.7;
    P.torso.rotation.x=.14; P.torso.position.y=1.32+Math.abs(c)*.07; P.head.rotation.x=-.08; P.head.rotation.y=Math.sin(t*1.3)*.15; }
}
let player = buildHuman(CHARACTERS[S.char||0]); scene.add(player.group);
let guard = buildPolice(); guard.group.position.set(0,0,7); scene.add(guard.group);
function rebuildPlayer(){
  scene.remove(player.group);
  player = buildHuman(CHARACTERS[S.char||0]); player.group.add(shieldBubble,magnetRing);
  shieldBubble.position.y=1.2; magnetRing.position.y=.4; scene.add(player.group);
  updateFx();
}

/* ---------- entities ---------- */
const ents=[];
const coinG=new THREE.CylinderGeometry(.42,.42,.12,18);
const gemG=new THREE.OctahedronGeometry(.5);
function spawnTrain(lane,z,len,ci){
  const g=makeModernTrain(len,ci); g.position.set(LANES[lane],0,z); scene.add(g); ents.push({mesh:g,kind:'train',lane,z,len});
}
function spawnBarrier(lane,z){
  const g=new THREE.Group();
  [-.8,.8].forEach(x=>{ const p=new THREE.Mesh(new THREE.BoxGeometry(.12,1,.12),M.lamp); p.position.set(x,.5,0); g.add(p); });
  for(let i=0;i<5;i++){ const s=new THREE.Mesh(new THREE.BoxGeometry(.36,.3,.14),i%2?M.obsW:M.obs); s.position.set(-.72+i*.36,.85,0); g.add(s); }
  const bl=new THREE.Mesh(new THREE.SphereGeometry(.1,8,8),new THREE.MeshBasicMaterial({color:0xef4444})); bl.position.set(0,1.15,0); g.add(bl);
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

/* ---------- power visuals ---------- */
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
  fx:{turbo:0,magnet:0,shield:0,ghost:0}, bots:[], spawnT:0, diff:1, t:0, hintT:0 };
let lastT=performance.now();
function startRace(online=false){
  S.races++; save();
  Object.assign(run,{on:true,over:false,caught:false,catchT:0,lane:1,x:0,y:0,vy:0,slide:0,
    airJumps:0,dist:0,coins:0,gems:0,spawnT:1,t:0,hintT:0,fx:{turbo:0,magnet:0,shield:0,ghost:0}});
  run.diff = 1 + Math.min(2, S.races*0.05);
  clearEnts();
  guard.group.position.set(0,0,7);
  player.group.rotation.y=0; guard.group.rotation.y=0;
  run.bots = (online? [...BOT_NAMES].sort(()=>Math.random()-.5).slice(0,4) : BOT_NAMES.slice(0,3))
    .map(n=>({n, d:0, sp:(15+Math.random()*4)*run.diff, you:false}));
  run.bots.push({n:'🏃 أنت', d:0, you:true});
  renderBots(); renderPowers();
  ['menu','over','friends','shop','board','wheelM','how'].forEach(id=>$(id).classList.add('hidden'));
  $('hud').classList.remove('hidden');
  $('swipe-hint').style.opacity='1';
  refreshWallet(); updateFx();
  toast(online?'🌍 سباق أونلاين مباشر — اهرب من الشرطي! 👮':'🏁 اجري! الشرطي وراك! 🏃💨');
}
function crash(){ if(run.caught||run.over) return; run.caught=true; run.catchT=0; toast('🚨 الشرطي مسكك! 👮'); }
function endRace(win){
  run.on=false; run.over=true;
  const rank = [...run.bots].sort((a,b)=>b.d-a.d).findIndex(b=>b.you)+1;
  const bonus = win? (rank===1?100:rank===2?60:30) : 5;
  const pts = Math.floor(run.dist/10)+run.coins*2+run.gems*10+bonus;
  S.points+=pts; S.best=Math.max(S.best,Math.floor(run.dist)); addCoins(run.coins*5); addGems(run.gems + (rank===1?8:rank<=3?4:1));
  S.board.push({n:'أنت',p:pts}); save();
  $('hud').classList.add('hidden'); $('over').classList.remove('hidden');
  $('over-title').textContent = !win? '🚨 الشرطي مسكك! 👮' : (rank===1?'🏆 هروب أسطوري!':'🏁 نهاية الجري!');
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
function setGhost(on){ player.mats.forEach(m=>{ if(on){ m.transparent=true; m.opacity=.45; } else { m.transparent=false; m.opacity=1; } }); }
function updateFx(){
  const f=run.fx, el=$('active-fx'); el.innerHTML='';
  const add=(t,v)=>{ if(v>0){ const d=document.createElement('div'); d.className='fx'; d.textContent=`${t} ${Math.ceil(v)}s`; el.appendChild(d);} };
  add('🚀',f.turbo); add('🧲',f.magnet); add('🛡️',f.shield); add('🕊️',f.ghost);
  if(run.airJumps>0){ const d=document.createElement('div'); d.className='fx'; d.textContent=`👟×${run.airJumps}`; el.appendChild(d); }
  shieldBubble.visible = f.shield>0;
  magnetRing.visible = f.magnet>0;
  setGhost(f.ghost>0);
  streaks.forEach(s=>s.visible=f.turbo>0);
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
let _fxT=0;
function frame(now){
  requestAnimationFrame(frame);
  const dt=Math.min(.05,(now-lastT)/1000); lastT=now;
  const t=now/1000;
  for(const b of birds){ const u=b.userData, a=t*u.sp+u.ph;
    b.position.set(u.cx+Math.cos(a)*u.r, u.cy+Math.sin(t*2+u.ph), u.cz+Math.sin(a)*3);
    const f=Math.sin(t*10+u.ph)*.5; u.wL.rotation.y=f; u.wR.rotation.y=-f; }
  // 🌍 عالم حي: منطاد + فراشات + إشارات تومض + أعلام ترفرف
  balloon.position.x=16+Math.sin(t*.12)*10; balloon.position.y=23+Math.sin(t*.4)*1.4;
  balloon.rotation.y=Math.sin(t*.2)*.3;
  for(const f of flies){ const u=f.userData, a=t*u.sp+u.ph;
    f.position.set(u.cx+Math.cos(a)*u.r, u.cy+Math.sin(t*3+u.ph)*.4, u.cz+Math.sin(a)*u.r*.6);
    const w=Math.abs(Math.sin(t*14+u.ph))*.9; u.wL.rotation.y=w; u.wR.rotation.y=-w; f.rotation.y=-a; }
  blinkers.forEach((l,i)=>l.material.color.setHex((Math.floor(t*1.4+i*.5)%2)?0x22c55e:0xef4444));
  pennants.forEach(f=>{ f.rotation.y=Math.sin(t*3+f.userData.ph)*.5; });
  // 🧑 معاينة 3D: الشخصية تركض في مكانها داخل المتجر
  if(pvRen && pvGroup && shopTab==='chars' && !$('shop').classList.contains('hidden')){
    animRunner(pvR,t,'run',6); pvGroup.rotation.y+=dt*.9; pvRen.render(pvScene,pvCam);
  }
  if(!run.on){ // القائمة: عرض أمامي أنيق للشخصية + الشرطي خلفها
    scrollWorld(dt,4);
    player.group.position.set(Math.sin(t*.6)*.9,0,0);
    player.group.rotation.y=Math.PI+Math.sin(t*.6)*.12;
    guard.group.position.set(player.group.position.x+.7,0,2.2);
    guard.group.rotation.y=Math.PI;
    animRunner(player,t,'run',6); animRunner(guard,t,'run',6);
    camera.position.set(Math.sin(t*.2)*1.2,2.1,5.2); camera.lookAt(0,1.3,0);
    if(camera.fov!==60){camera.fov=60;camera.updateProjectionMatrix();}
    renderer.render(scene,camera); return;
  }
  run.t+=dt;
  for(const k in run.fx) if(run.fx[k]>0) run.fx[k]-=dt;
  if(run.slide>0) run.slide-=dt;
  run.hintT+=dt; if(run.hintT>6) $('swipe-hint').style.opacity='0';
  const base = 12*run.diff + run.dist*0.008;
  run.speed = run.fx.turbo>0? base*1.8 : base;
  if(!run.caught){ run.dist += run.speed*dt; run.bots.forEach(b=>{ if(!b.you) b.d+=b.sp*dt; }); }
  run.bots.find(b=>b.you).d = run.dist;
  scrollWorld(dt,run.speed);
  const gz = run.caught? .6 : Math.min(11, 5+run.dist*.004);
  guard.group.position.z += (gz-guard.group.position.z)*Math.min(1,dt*4);
  guard.group.position.x = run.x;
  animRunner(guard,run.t,'run',run.speed*.9);
  run.x += (LANES[run.lane]-run.x)*Math.min(1,dt*11);
  if(run.y>0||run.vy!==0){ run.vy-=30*dt; run.y+=run.vy*dt; if(run.y<=0){run.y=0;run.vy=0;} }
  const sliding = run.slide>0;
  const P=player.group;
  P.position.set(run.x, run.y - (sliding?.32:0), 0);
  P.scale.y = sliding? .62 : 1;
  P.rotation.y = (LANES[run.lane]-run.x)*-.12;
  animRunner(player, run.t, sliding?'slide':(run.y>0?'air':'run'), run.speed);
  player.parts.blob.scale.setScalar(Math.max(.4,1-run.y*.3));
  magnetRing.rotation.z+=dt*5;
  const wantFov = run.fx.turbo>0? 75:60;
  camera.fov += (wantFov-camera.fov)*Math.min(1,dt*5); camera.updateProjectionMatrix();
  camera.position.x += ((run.x*.5)-camera.position.x)*Math.min(1,dt*6);
  camera.position.set(camera.position.x,4.1-run.y*.25,7.6); camera.lookAt(run.x*.6,1.4,-9);
  if(!run.caught){
    run.spawnT-=dt;
    if(run.spawnT<=0){
      run.spawnT=Math.max(.85, 1.6-run.dist*0.0006);
      const z=-130, r=Math.random(), free=(Math.random()*3)|0;
      if(r<.34){ [0,1,2].filter(l=>l!==free).forEach(l=>spawnTrain(l,z-Math.random()*8,8+Math.random()*8,(Math.random()*LIVERY.length)|0));
        for(let k=0;k<4;k++) spawnCoin(free,z-4-k*2.2,.7);
        if(Math.random()<.4) spawnGem(free,z-16,1.2);
      } else if(r<.58){ [0,1,2].forEach(l=>{ spawnBarrier(l,z); for(let k=0;k<3;k++) spawnCoin(l,z+3-k*2,1.1+k*.45); }); }
      else if(r<.8){ [0,1,2].forEach(l=>{ spawnOverhead(l,z); for(let k=0;k<4;k++) spawnCoin(l,z+4-k*2,.5); }); }
      else { spawnBarrier(free,z); spawnOverhead((free+1)%3,z-2); spawnTrain((free+2)%3,z-6,9,(Math.random()*LIVERY.length)|0); spawnGem(free,z+4,1.6); }
    }
    const magnetR = run.fx.magnet>0?6:1.25;
    for(let i=ents.length-1;i>=0;i--){
      const e=ents[i]; e.z+=run.speed*dt; e.mesh.position.z=e.z;
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
          let hit = e.kind==='train'? true : e.kind==='barrier'? run.y<.85 : !sliding;
          if(hit){
            if(run.fx.shield>0||run.fx.ghost>0||run.fx.turbo>0){ scene.remove(e.mesh); ents.splice(i,1); toast('💥 تحطيم!'); continue; }
            else { scene.remove(e.mesh); ents.splice(i,1); crash(); break; }
          }
        }
      }
      const tail = e.kind==='train'? e.len/2+12 : 12;
      if(e.z>tail){ scene.remove(e.mesh); ents.splice(i,1); }
    }
  } else { run.catchT+=dt; if(run.catchT>1.1){ run.caught=false; endRace(false); return; } }
  if(((run.t*2)|0)!==(((run.t-dt)*2)|0)) renderBots();
  $('hud-dist').querySelector('b').textContent=Math.floor(run.dist)+'م';
  $('hud-rank').textContent='#'+([...run.bots].sort((a,b)=>b.d-a.d).findIndex(b=>b.you)+1);
  $('race-progress').style.width=Math.min(100,run.dist/RACE_LEN*100)+'%';
  $('race-label').textContent=`${Math.floor(run.dist)} / ${RACE_LEN}م`;
  if(run.dist>=RACE_LEN){ endRace(true); return; }
  if(((now/400)|0)!==_fxT){_fxT=(now/400)|0; updateFx();}
  renderer.render(scene,camera);
}
function refreshHudRun(){ $('hud-coins').querySelector('b').textContent=run.coins; }
function refreshWallet(){
  $('m-coins').textContent=S.coins; $('m-gems').textContent=S.gems; $('m-points').textContent=S.points;
  if($('m-best')) $('m-best').textContent=S.best;
  if($('m-races')) $('m-races').textContent=S.races;
  if($('m-streak')) $('m-streak').textContent=S.streak;
  const hc=$('hud-coins'); if(hc) hc.querySelector('b').textContent=run.coins;
  const hg=$('hud-gems'); if(hg) hg.querySelector('b').textContent=S.gems;
  const ch=CHARACTERS[S.char||0];
  if($('hero-char-name')) $('hero-char-name').textContent=ch.name;
  if($('hero-char-look')) $('hero-char-look').textContent=`${ch.face} 👀${ch.eyes}`;
}

/* ---------- تحكم لمس فقط 👆 + كيبورد احتياطي ---------- */
function goLeft(){ if(run.on&&!run.caught) run.lane=Math.max(0,run.lane-1); }
function goRight(){ if(run.on&&!run.caught) run.lane=Math.min(2,run.lane+1); }
function jump(){
  if(!run.on||run.caught) return;
  if(run.y<=0.01&&run.vy===0){ run.vy=10.5; run.slide=0; }
  else if(run.airJumps>0){ run.airJumps--; save(); run.vy=9; toast('👟 قفز مزدوج!'); updateFx(); }
}
function slide(){ if(!run.on||run.caught) return; if(run.y>0) run.vy=-22; run.slide=.75; }
addEventListener('keydown',e=>{
  if(e.key==='ArrowLeft'||e.key==='a') goLeft();
  else if(e.key==='ArrowRight'||e.key==='d') goRight();
  else if(e.key==='ArrowUp'||e.key===' '||e.key==='w'){ jump(); e.preventDefault(); }
  else if(e.key==='ArrowDown'||e.key==='s') slide();
  else { const p=POWERS.find(p=>p.key===e.key); if(p) usePower(p.id); }
});
let tx=0,ty=0,t0=0;
canvas.addEventListener('touchstart',e=>{ const t=e.touches[0]; tx=t.clientX; ty=t.clientY; t0=performance.now(); },{passive:true});
canvas.addEventListener('touchend',e=>{
  const t=e.changedTouches[0], dx=t.clientX-tx, dy=t.clientY-ty;
  const adx=Math.abs(dx), ady=Math.abs(dy);
  if(Math.max(adx,ady)<12){ // tap: يمين/يسار/قفز
    if(t.clientX<innerWidth*.35) goLeft();
    else if(t.clientX>innerWidth*.65) goRight();
    else jump();
    return;
  }
  if(adx>ady) dx>0?goRight():goLeft();
  else dy<0? jump():slide();
},{passive:true});
let mx=0,my=0,mDown=false;
canvas.addEventListener('mousedown',e=>{mDown=true;mx=e.clientX;my=e.clientY;});
canvas.addEventListener('mouseup',e=>{ if(!mDown) return; mDown=false;
  const dx=e.clientX-mx, dy=e.clientY-my;
  if(Math.max(Math.abs(dx),Math.abs(dy))<8) return;
  if(Math.abs(dx)>Math.abs(dy)) dx>0?goRight():goLeft(); else dy<0?jump():slide(); });

/* ---------- shop / characters ---------- */
function renderShop(){
  $('iap-list').innerHTML=IAPS.map((p,i)=>
    `<div class="shop-item"><span>${p.n}<br><small class="muted">${p.g} 💎</small></span><button class="buy" data-iap="${i}">${p.p} شراء</button></div>`).join('');
  document.querySelectorAll('[data-iap]').forEach(b=>b.addEventListener('click',()=>{
    const p=IAPS[+b.dataset.iap]; addGems(p.g); toast(`✅ تم شحن ${p.g} 💎 (تجريبي — ${p.p})`); }));
  $('power-shop').innerHTML=POWERS.map(p=>
    `<div class="pow-item"><span>${p.icon} ${p.name}<br><small class="muted">${p.desc}</small></span><button class="buy" data-pow="${p.id}">${p.cost} 💎 | لديك ${S.inv[p.id]||0}</button></div>`).join('');
  document.querySelectorAll('[data-pow]').forEach(b=>b.addEventListener('click',()=>{
    const p=POWERS.find(x=>x.id===b.dataset.pow);
    if(S.gems<p.cost){ toast('💎 جواهر غير كافية — شاهد إعلانًا +10💎'); return; }
    S.gems-=p.cost; S.inv[p.id]=(S.inv[p.id]||0)+1; save(); refreshWallet(); renderShop(); renderPowers();
    toast(`✅ تم شراء ${p.icon} ${p.name}`);
  }));
}
function priceText(c){ return c.coins? `${c.coins} 💰` : `${c.gems} 💎`; }
/* ---------- متجر موحد + معاينة 3D دوارة ---------- */
let shopTab='gems', previewSel=S.char||0;
function openShop(tab='gems'){ renderShop(); previewSel=S.char||0; setTab(tab); $('shop').classList.remove('hidden'); }
function setTab(tb){
  shopTab=tb;
  document.querySelectorAll('.shop-tab').forEach(b=>b.classList.toggle('active',b.dataset.tab===tb));
  ['gems','powers','chars'].forEach(k=>$('tab-'+k).classList.toggle('hidden',k!==tb));
  if(tb==='chars') renderChars();
}
let pvRen=null, pvScene=null, pvCam=null, pvGroup=null, pvR=null;
function initPreview(){
  pvRen=new THREE.WebGLRenderer({canvas:$('char-preview'),antialias:true,alpha:true});
  pvRen.setPixelRatio(Math.min(devicePixelRatio,2));
  pvRen.toneMapping=THREE.ACESFilmicToneMapping;
  pvScene=new THREE.Scene();
  pvScene.add(new THREE.HemisphereLight(0xd8ecff,0x3f7c3a,1.15));
  const d=new THREE.DirectionalLight(0xfff6e0,1.7); d.position.set(3,6,4); pvScene.add(d);
  const disc=new THREE.Mesh(new THREE.CircleGeometry(1.15,26),new THREE.MeshStandardMaterial({color:0x243351,roughness:.9}));
  disc.rotation.x=-Math.PI/2; pvScene.add(disc);
  const ring=new THREE.Mesh(new THREE.TorusGeometry(1.15,.05,8,36),new THREE.MeshBasicMaterial({color:0xfbbf24}));
  ring.rotation.x=Math.PI/2; ring.position.y=.02; pvScene.add(ring);
  pvCam=new THREE.PerspectiveCamera(34,1,.1,50); pvCam.position.set(0,1.55,3.7); pvCam.lookAt(0,1.1,0);
}
function disposeGroup(gr){ gr.traverse(o=>{ if(o.isMesh){ o.geometry.dispose(); const ms=Array.isArray(o.material)?o.material:[o.material]; ms.forEach(m=>m.dispose()); } }); }
function showCharPreview(i){
  try{
    if(!pvRen) initPreview();
    if(pvGroup){ pvScene.remove(pvGroup); disposeGroup(pvGroup); }
    pvR=buildHuman(CHARACTERS[i]); pvGroup=pvR.group; pvGroup.rotation.y=.6;
    pvScene.add(pvGroup);
  }catch(e){}
}
function buyChar(i){
  const c=CHARACTERS[i];
  if(c.cost.coins && S.coins<c.cost.coins){ toast('💰 عملات غير كافية — العب لجمعها! 🏃'); return false; }
  if(c.cost.gems && S.gems<c.cost.gems){ toast('💎 جواهر غير كافية — شاهد إعلانًا! 📺'); return false; }
  if(c.cost.coins) S.coins-=c.cost.coins; else S.gems-=c.cost.gems;
  S.owned.push(i); S.char=i; save(); rebuildPlayer(); refreshWallet();
  toast(`🎉 اشتريت ${c.face} ${c.name}!`);
  return true;
}
function renderChars(){
  showCharPreview(previewSel);
  const c=CHARACTERS[previewSel];
  $('preview-name').innerHTML=`${c.face} <b>${c.name}</b> ${c.gender==='female'?'👩':'🧑'} • 👀 عيون ${c.eyes}<br><small class="muted">${c.desc} — السعر: ${S.owned.includes(previewSel)?'تمتلكها ✅':priceText(c.cost)}</small>`;
  const owned=S.owned.includes(previewSel), worn=S.char===previewSel;
  $('preview-action').innerHTML = worn? '<b class="win-line">✅ يلعب الآن في العالم 🌍</b>'
    : owned? '<button class="buy" id="pv-wear">لبس 🧥 والعب به</button>'
    : `<button class="buy" id="pv-buy">شراء ${priceText(c.cost)} 🛒</button>`;
  const w=$('pv-wear'); if(w) w.onclick=()=>{ S.char=previewSel; save(); rebuildPlayer(); refreshWallet(); renderChars(); toast(`🧥 ${c.name} دخل السباق! 🏃`); };
  const bb=$('pv-buy'); if(bb) bb.onclick=()=>{ if(buyChar(previewSel)) renderChars(); };
  $('outfit-list').innerHTML=CHARACTERS.map((k,i)=>{
    const ow=S.owned.includes(i), wo=S.char===i;
    return `<div class="char-card ${wo?'sel':''} ${i===previewSel?'pv':''}" data-sel="${i}"><div class="char-face">${k.face}</div>
      <div class="char-info"><b>${k.name}</b>
      <small>👀 ${k.eyes} • ${ow?(wo?'يلعب الآن ✅':'اضغط للعرض 👁️'):priceText(k.cost)}</small></div>${wo?'<b>✅</b>':(ow?'<span>👁️</span>':`<span>${priceText(k.cost)}</span>`)}</div>`;
  }).join('');
  document.querySelectorAll('[data-sel]').forEach(el=>el.addEventListener('click',()=>{ previewSel=+el.dataset.sel; renderChars(); }));
}

/* ---------- leaderboard ---------- */
function renderBoard(){
  const bots=BOT_NAMES.map((n,i)=>({n,p:400+((i*137)%900)}));
  const all=[...bots,{n:'🏃 أنت',p:S.points,me:true},...S.board.map(b=>({...b,me:b.n==='أنت'}))]
    .sort((a,b)=>b.p-a.p).slice(0,10);
  $('board-list').innerHTML=all.map((r,i)=>`<div class="br-row ${r.me?'me':''}"><span>${i+1}. ${r.n}</span><b>${r.p} 🏆</b></div>`).join('');
}

/* ---------- عجلة الحظ الذهبية المطورة ---------- */
let wheelAngle=0, spinning=false;
function drawWheel(){
  const c=$('wheel-canvas'),x=c.getContext('2d'),R=150;
  x.clearRect(0,0,300,300);
  x.save(); x.shadowColor='#ffd166'; x.shadowBlur=18;
  x.beginPath(); x.arc(R,R,R-2,0,Math.PI*2); x.fillStyle='#0f1530'; x.fill(); x.restore();
  WHEEL.forEach((s,i)=>{
    const a0=wheelAngle+i*Math.PI*2/WHEEL.length, a1=a0+Math.PI*2/WHEEL.length;
    x.fillStyle=s.c; x.beginPath(); x.moveTo(R,R); x.arc(R,R,R-8,a0,a1); x.closePath(); x.fill();
    x.strokeStyle='#ffffff88'; x.lineWidth=2; x.stroke();
    x.save(); x.translate(R,R); x.rotate((a0+a1)/2); x.fillStyle='#fff'; x.font='bold 14px sans-serif';
    x.textAlign='right'; x.shadowColor='#000'; x.shadowBlur=4; x.fillText(s.t,R-18,5); x.restore();
  });
  x.fillStyle='#0f1530'; x.beginPath(); x.arc(R,R,26,0,Math.PI*2); x.fill();
  x.fillStyle='#ffd166'; x.font='bold 22px sans-serif'; x.textAlign='center'; x.fillText('★',R,R+8);
}
function wheelReady(){ return Date.now()-S.lastWheel > 4*3600*1000; }
function updateWheelUI(){
  drawWheel();
  const left=S.lastWheel+4*3600*1000-Date.now();
  $('wheel-info').textContent = left<=0 ? '✅ تدوير مجاني متاح الآن! حظًا سعيدًا 🍀'
    : `⏳ المجاني بعد ${Math.floor(left/3600000)}س ${Math.floor(left%3600000/60000)}د — أو شاهد إعلانًا لتدوير إضافي`;
}
function spin(free){
  if(spinning) return; spinning=true; $('wheel-result').textContent='🌀 تدور...';
  const idx=Math.floor(Math.random()*WHEEL.length);
  const target=Math.PI*2*6 + (Math.PI*2 - (idx+.5)*Math.PI*2/WHEEL.length);
  const start=wheelAngle, t0=performance.now();
  (function anim(t){ const k=Math.min(1,(t-t0)/4200), e=1-Math.pow(1-k,4);
    wheelAngle=start+target*e; drawWheel();
    if(k<1) requestAnimationFrame(anim);
    else { spinning=false; if(free) S.lastWheel=Date.now(); save(); WHEEL[idx].f(); save(); refreshWallet(); updateWheelUI();
      $('wheel-result').textContent=`🎉🎉 ربحت: ${WHEEL[idx].t} 🎉🎉`; toast(`🎡 ${WHEEL[idx].t}`); }
  })(t0);
}

/* ---------- ads ---------- */
function showAd(cb){
  $('ad').classList.remove('hidden');
  let s=5; $('ad-sec').textContent=s; $('ad-fill').style.width='0';
  const iv=setInterval(()=>{ s--; $('ad-sec').textContent=Math.max(0,s);
    $('ad-fill').style.width=((5-s)/5*100)+'%';
    if(s<=0){ clearInterval(iv); $('ad').classList.add('hidden'); toast('🎁 تمت مكافأة الإعلان!'); cb&&cb(); } },1000);
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

/* ---------- wiring ---------- */
document.querySelectorAll('[data-close]').forEach(b=>b.addEventListener('click',()=>$(b.dataset.close).classList.add('hidden')));
$('btn-start').addEventListener('click',()=>startRace(false));
$('btn-online').addEventListener('click',()=>startRace(true));
$('btn-quick-online').addEventListener('click',()=>{ $('friends').classList.add('hidden'); startRace(true); });
$('btn-shop').addEventListener('click',()=>openShop('gems'));
$('btn-outfit').addEventListener('click',()=>openShop('chars'));
document.querySelectorAll('.shop-tab').forEach(b=>b.addEventListener('click',()=>setTab(b.dataset.tab)));
$('prev-char').addEventListener('click',()=>{ previewSel=(previewSel+CHARACTERS.length-1)%CHARACTERS.length; renderChars(); });
$('next-char').addEventListener('click',()=>{ previewSel=(previewSel+1)%CHARACTERS.length; renderChars(); });
$('btn-board').addEventListener('click',()=>{ renderBoard(); $('board').classList.remove('hidden'); });
$('btn-friends').addEventListener('click',()=>{ $('friends').classList.remove('hidden'); $('my-code').textContent=S.code; });
$('btn-how').addEventListener('click',()=>$('how').classList.remove('hidden'));
$('btn-wheel').addEventListener('click',()=>{ updateWheelUI(); $('wheelM').classList.remove('hidden'); });
$('btn-spin').addEventListener('click',()=>{
  if(!wheelReady()){ toast('⏳ المجاني بعد 4 ساعات — شاهد إعلانًا لتدوير إضافي 📺'); return; }
  spin(true);
});
$('btn-spin-ad').addEventListener('click',()=>showAd(()=>spin(false)));
$('btn-ad').addEventListener('click',()=>{ if(S.gems<10) showAd(()=>{ addGems(10); }); else showAd(()=>addGems(5)); });
$('btn-daily-open').addEventListener('click',()=>$('daily').classList.remove('hidden'));
$('btn-daily-claim').addEventListener('click',()=>claimDaily(false));
$('btn-daily-x2').addEventListener('click',()=>showAd(()=>claimDaily(true)));
$('btn-copy').addEventListener('click',()=>{ try{navigator.clipboard.writeText(S.code);}catch{} toast('📋 تم نسخ الكود!'); });
$('btn-redeem').addEventListener('click',()=>{
  const c=$('friend-code').value.trim().toUpperCase(); if(!c) return;
  if(c===S.code){ $('friend-msg').textContent='⚠️ لا يمكنك دعوة نفسك!'; return; }
  if(S.redeemed.includes(c)){ $('friend-msg').textContent='⚠️ استخدمت هذا الكود من قبل'; return; }
  S.redeemed.push(c); addGems(50); save(); $('friend-msg').textContent='🎉 +50 💎 لك ولصديقك!';
});
$('btn-again').addEventListener('click',()=>startRace(false));
$('btn-menu').addEventListener('click',()=>{ $('over').classList.add('hidden'); $('menu').classList.remove('hidden'); refreshWallet(); checkDaily(); });

refreshWallet(); checkDaily(); drawWheel();
window.__booted = false;
requestAnimationFrame(t=>{ lastT=t; window.__booted=true; frame(t); });
