const TAU = Math.PI * 2;
const cv = document.getElementById('cv');
const ctx = cv.getContext('2d');
const labelEl = document.getElementById('solid-label');
const dpr = window.devicePixelRatio || 1;
let W, H, cx, cy, r;

function resize() {
  W = window.innerWidth; H = window.innerHeight;
  cv.width = W * dpr; cv.height = H * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  cx = W / 2;
  cy = W > H ? H * 0.42 : H * 0.35;
  // Scale r so the full flower of life (3r from center) fits within the viewport
  const maxR = Math.min(cy, H - cy, cx) / 3;
  r = maxR * 0.92; // slight padding from edges
}
window.addEventListener('resize', resize);
resize();

function ptXY(i) {
  if (i === 0) return [0, 0];
  if (i <= 6) { const a = (i-1)*TAU/6-TAU/4; return [r*Math.cos(a), r*Math.sin(a)]; }
  const a = (i-7)*TAU/6-TAU/4; return [2*r*Math.cos(a), 2*r*Math.sin(a)];
}

function drawFlower(alpha, lw) {
  const c = [[0,0]];
  for (let i = 0; i < 6; i++) { const a=i*TAU/6-TAU/4; c.push([r*Math.cos(a), r*Math.sin(a)]); }
  for (let i = 0; i < 6; i++) {
    const a=i*TAU/6-TAU/4; c.push([2*r*Math.cos(a), 2*r*Math.sin(a)]);
    const a2=(i+0.5)*TAU/6-TAU/4; c.push([r*1.732*Math.cos(a2), r*1.732*Math.sin(a2)]);
  }
  ctx.save(); ctx.translate(cx,cy);
  ctx.strokeStyle=`rgba(100,200,180,${alpha})`; ctx.lineWidth=lw;
  for (const p of c) { ctx.beginPath(); ctx.arc(p[0],p[1],r,0,TAU); ctx.stroke(); }
  ctx.restore();
}

function drawMetatron(alpha) {
  const pts=[]; for(let i=0;i<13;i++) pts.push(ptXY(i));
  ctx.save(); ctx.translate(cx,cy);
  ctx.strokeStyle=`rgba(100,200,180,${alpha*0.06})`; ctx.lineWidth=0.4;
  for(let i=0;i<13;i++) for(let j=i+1;j<13;j++){
    ctx.beginPath(); ctx.moveTo(pts[i][0],pts[i][1]); ctx.lineTo(pts[j][0],pts[j][1]); ctx.stroke();
  }
  for(const p of pts){ ctx.beginPath(); ctx.arc(p[0],p[1],2,0,TAU); ctx.fillStyle=`rgba(100,200,180,${alpha*0.12})`; ctx.fill(); }
  ctx.restore();
}

const solids = [
  {
    name: 'Tetrahedron',
    edges: [[7,9],[9,11],[11,7],[0,7],[0,9],[0,11]],
    color: [150, 240, 220],
  },
  {
    name: 'Hexahedron',
    edges: [[7,8],[8,9],[9,10],[10,11],[11,12],[12,7],[7,10],[8,11],[9,12]],
    color: [220, 200, 100],
  },
  {
    name: 'Octahedron',
    edges: [
      [7,8],[8,9],[9,10],[10,11],[11,12],[12,7],
      [7,9],[9,11],[11,7],
      [8,10],[10,12],[12,8],
    ],
    color: [100, 180, 255],
  },
  {
    name: 'Icosahedron',
    edges: [
      [7,8],[8,9],[9,10],[10,11],[11,12],[12,7],
      [1,2],[2,3],[3,4],[4,5],[5,6],[6,1],
      [7,1],[8,2],[9,3],[10,4],[11,5],[12,6],
      [7,2],[8,3],[9,4],[10,5],[11,6],[12,1],
      [7,6],[8,1],[9,2],[10,3],[11,4],[12,5],
    ],
    color: [180, 130, 255],
  },
  {
    name: 'Dodecahedron',
    edges: [
      [7,8],[8,9],[9,10],[10,11],[11,12],[12,7],
      [1,2],[2,3],[3,4],[4,5],[5,6],[6,1],
      [7,1],[8,2],[9,3],[10,4],[11,5],[12,6],
      [0,1],[0,2],[0,3],[0,4],[0,5],[0,6],
    ],
    color: [255, 150, 130],
  },
];

function drawSolid(solid, alpha) {
  const [cr, cg, cb] = solid.color;
  ctx.save();
  ctx.translate(cx, cy);

  ctx.strokeStyle = `rgba(${cr}, ${cg}, ${cb}, ${alpha * 0.1})`;
  ctx.lineWidth = 7;
  for (const [a, b] of solid.edges) {
    const pa = ptXY(a), pb = ptXY(b);
    ctx.beginPath(); ctx.moveTo(pa[0], pa[1]); ctx.lineTo(pb[0], pb[1]); ctx.stroke();
  }

  ctx.strokeStyle = `rgba(${cr}, ${cg}, ${cb}, ${alpha * 0.75})`;
  ctx.lineWidth = 2;
  for (const [a, b] of solid.edges) {
    const pa = ptXY(a), pb = ptXY(b);
    ctx.beginPath(); ctx.moveTo(pa[0], pa[1]); ctx.lineTo(pb[0], pb[1]); ctx.stroke();
  }

  const usedVerts = new Set(solid.edges.flat());
  for (const i of usedVerts) {
    const p = ptXY(i);
    ctx.beginPath(); ctx.arc(p[0], p[1], 7, 0, TAU);
    ctx.fillStyle = `rgba(${cr}, ${cg}, ${cb}, ${alpha * 0.07})`; ctx.fill();
    ctx.beginPath(); ctx.arc(p[0], p[1], 3, 0, TAU);
    ctx.fillStyle = `rgba(${cr}, ${cg}, ${cb}, ${alpha * 0.45})`; ctx.fill();
  }

  ctx.restore();
}

const parts = [];

const metEdges = [];
for (let i = 0; i < 13; i++) for (let j = i+1; j < 13; j++) metEdges.push([i, j]);

const flowerCenters = [[0, 0]];
for (let i = 0; i < 6; i++) {
  const a = i*TAU/6-TAU/4;
  flowerCenters.push([Math.cos(a), Math.sin(a)]);
}
for (let i = 0; i < 6; i++) {
  const a = i*TAU/6-TAU/4;
  flowerCenters.push([2*Math.cos(a), 2*Math.sin(a)]);
  const a2 = (i+0.5)*TAU/6-TAU/4;
  flowerCenters.push([1.732*Math.cos(a2), 1.732*Math.sin(a2)]);
}

for (let i = 0; i < 200; i++) {
  const edge = metEdges[Math.floor(Math.random() * metEdges.length)];
  parts.push({
    type: 'edge',
    edgeA: edge[0], edgeB: edge[1],
    t: Math.random(),
    speed: (0.03 + Math.random() * 0.2) * (Math.random() < 0.5 ? 1 : -1),
    sz: 0.3 + Math.random() * 2.5,
    pink: Math.random() < 0.3,
    colorShift: Math.random() * 1000,
  });
}

for (let i = 0; i < 150; i++) {
  const ci = Math.floor(Math.random() * flowerCenters.length);
  parts.push({
    type: 'circle',
    ci: ci,
    angle: Math.random() * TAU,
    speed: (0.05 + Math.random() * 0.3) * (Math.random() < 0.5 ? 1 : -1),
    sz: 0.3 + Math.random() * 2.5,
    pink: Math.random() < 0.3,
    colorShift: Math.random() * 1000,
  });
}

const solidParts = [];
for (let i = 0; i < 200; i++) {
  solidParts.push({
    edgeA: 0, edgeB: 0,
    t: Math.random(),
    speed: (0.1 + Math.random() * 0.5) * (Math.random() < 0.5 ? 1 : -1),
    sz: 0.8 + Math.random() * 3.5,
    colorShift: Math.random() * 1000,
    lastSolidIdx: -1,
  });
}

function assignSolidParts(solidIdx) {
  const edges = solids[solidIdx].edges;
  for (const sp of solidParts) {
    if (sp.lastSolidIdx !== solidIdx) {
      const e = edges[Math.floor(Math.random() * edges.length)];
      sp.edgeA = e[0]; sp.edgeB = e[1];
      sp.t = Math.random();
      sp.lastSolidIdx = solidIdx;
    }
  }
}

function drawParts(dt, activeSolidIdx, solidAlpha) {
  const time = performance.now() / 1000;

  for (const p of parts) {
    let x, y;
    if (p.type === 'edge') {
      p.t += p.speed * dt;
      if (p.t > 1) p.t -= 1; else if (p.t < 0) p.t += 1;
      const pa = ptXY(p.edgeA), pb = ptXY(p.edgeB);
      x = cx + pa[0] + (pb[0] - pa[0]) * p.t;
      y = cy + pa[1] + (pb[1] - pa[1]) * p.t;
    } else {
      p.angle += p.speed * dt;
      const fc = flowerCenters[p.ci];
      x = cx + fc[0] * r + Math.cos(p.angle) * r;
      y = cy + fc[1] * r + Math.sin(p.angle) * r;
    }
    const colorPhase = Math.sin(time * 0.3 + p.colorShift);
    const isPink = colorPhase > 0.3;
    const pulse = 0.25 + 0.15 * Math.sin(time * 2 + (p.angle || p.t * 10));
    ctx.beginPath(); ctx.arc(x, y, p.sz, 0, TAU);
    ctx.fillStyle = isPink ? `rgba(220,120,170,${pulse})` : `rgba(100,200,180,${pulse})`;
    ctx.fill();
    if (p.sz > 1.5) {
      ctx.beginPath(); ctx.arc(x, y, p.sz * 2.5, 0, TAU);
      ctx.fillStyle = isPink ? `rgba(220,120,170,${pulse*0.12})` : `rgba(100,200,180,${pulse*0.12})`;
      ctx.fill();
    }
  }

  if (activeSolidIdx >= 0 && solidAlpha > 0.05) {
    assignSolidParts(activeSolidIdx);
    const [cr, cg, cb] = solids[activeSolidIdx].color;
    for (const sp of solidParts) {
      sp.t += sp.speed * dt;
      if (sp.t > 1) {
        sp.t = 0;
        const edges = solids[activeSolidIdx].edges;
        const e = edges[Math.floor(Math.random() * edges.length)];
        sp.edgeA = e[0]; sp.edgeB = e[1];
      } else if (sp.t < 0) {
        sp.t = 1;
        const edges = solids[activeSolidIdx].edges;
        const e = edges[Math.floor(Math.random() * edges.length)];
        sp.edgeA = e[0]; sp.edgeB = e[1];
      }
      const pa = ptXY(sp.edgeA), pb = ptXY(sp.edgeB);
      const x = cx + pa[0] + (pb[0] - pa[0]) * sp.t;
      const y = cy + pa[1] + (pb[1] - pa[1]) * sp.t;
      const pulse = 0.4 + 0.3 * Math.sin(time * 3 + sp.colorShift);
      const a = pulse * solidAlpha;
      ctx.beginPath(); ctx.arc(x, y, sp.sz, 0, TAU);
      ctx.fillStyle = `rgba(${cr},${cg},${cb},${a})`;
      ctx.fill();
      if (sp.sz > 1.2) {
        ctx.beginPath(); ctx.arc(x, y, sp.sz * 2.5, 0, TAU);
        ctx.fillStyle = `rgba(${cr},${cg},${cb},${a*0.15})`;
        ctx.fill();
      }
    }
  }
}

const MORPH = 6000;
const HOLD = 7500;
const STEP = MORPH + HOLD;

function sAlpha(idx, t) {
  const tot = solids.length * STEP;
  let rel = (t % tot) - idx * STEP;
  if (rel < 0) rel += tot;

  if (rel < MORPH) {
    const p = rel / MORPH;
    return p * p * (3 - 2 * p);
  }
  if (rel < MORPH + HOLD) {
    return 1;
  }
  if (rel < MORPH + HOLD + MORPH) {
    const p = (rel - MORPH - HOLD) / MORPH;
    return 1 - p * p * (3 - 2 * p);
  }
  return 0;
}

// ---- Starfield: slow upward drift behind the geometry -----------------------
// Three depth layers (speed + size + alpha scale together) so the drift reads
// as parallax, not confetti. Stars live in [0,1] normalized space and wrap at
// the top, so resize never strands or bunches them. Subtle sinusoidal twinkle,
// deliberately gentle — the geometry is the show, the stars are the air.
const STAR_LAYERS = [
  { n: 90, speed: 0.008, size: 0.9, alpha: 0.28 },
  { n: 50, speed: 0.016, size: 1.4, alpha: 0.42 },
  { n: 22, speed: 0.030, size: 2.0, alpha: 0.6 },
];
const stars = [];
for (const L of STAR_LAYERS) {
  for (let i = 0; i < L.n; i++) {
    stars.push({
      x: Math.random(), y: Math.random(),
      speed: L.speed * (0.75 + Math.random() * 0.5),
      size: L.size, alpha: L.alpha * (0.7 + Math.random() * 0.6),
      tw: Math.random() * TAU, twSpeed: 0.4 + Math.random() * 1.1,
      // A hint of the page's two accent hues, mostly white.
      hue: Math.random() < 0.75 ? '255,255,255' : (Math.random() < 0.5 ? '100,200,180' : '220,196,144'),
    });
  }
}

function drawStars(dt, ts) {
  for (const s of stars) {
    s.y -= s.speed * dt;                 // upward
    if (s.y < -0.01) { s.y = 1.01; s.x = Math.random(); }
    const tw = 0.75 + 0.25 * Math.sin(ts / 1000 * s.twSpeed + s.tw);
    ctx.beginPath();
    ctx.arc(s.x * W, s.y * H, s.size, 0, TAU);
    ctx.fillStyle = `rgba(${s.hue},${(s.alpha * tw).toFixed(3)})`;
    ctx.fill();
  }
}

let last=0;
function frame(ts) {
  const dt=Math.min((ts-last)/1000,0.1); last=ts;
  // ONE surface owns every pixel of background — the page must never show a
  // second tone behind or below the canvas (body bg matches as a fallback).
  ctx.fillStyle='#08090b'; ctx.fillRect(0,0,W,H);
  drawStars(dt, ts);

  let peak=0;
  for(let i=0;i<solids.length;i++) peak=Math.max(peak,sAlpha(i,ts));
  drawFlower(0.12, 0.7);
  drawMetatron(0.7);
  let activeSolidIdx = -1, activeSolidAlpha = 0;
  for(let i=0;i<solids.length;i++){
    const a=sAlpha(i,ts);
    if(a > activeSolidAlpha){ activeSolidIdx=i; activeSolidAlpha=a; }
  }
  drawParts(dt, activeSolidIdx, activeSolidAlpha);

  for(let i=0;i<solids.length;i++){
    const a=sAlpha(i,ts);
    if(a>0.005){
      drawSolid(solids[i],a);
    }
  }
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
