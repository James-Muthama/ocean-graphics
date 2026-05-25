/* ============================================================
   DEEP OCEAN EXPLORER — graphics.js
   HTML5 Canvas API — Graphics Pipeline Demonstration
   Stages: Application → Geometry → Rasterization
   ============================================================ */

const canvas = document.getElementById('ocean');
const ctx    = canvas.getContext('2d');
const W      = canvas.width;
const H      = canvas.height;


/* ============================================================
   === APPLICATION STAGE =====================================
   Global simulation state: objects, flags, counters, timers.
   The application stage owns ALL game/scene data and drives
   what gets drawn each frame.
   ============================================================ */

let paused    = false;
let speedMult = 1.0;
let deepMode  = false;
let mouseX    = W / 2;
let mouseY    = H / 2;
let frameCount = 0;
let lastTime   = performance.now();
let fps        = 0;


/* --- Object: Submarine ---
   Tracks position, target (mouse), tilt angle, spotlight spin */
const sub = {
  x: 200, y: 250,
  targetX: 200, targetY: 250,
  angle: 0,
  width: 90, height: 38,
  lightAngle: 0
};


/* --- Object: Fish School (8 fish) ---
   Each fish has position, speed, swim-wave phase, size, colour */
const fishSchool = [];
for (let i = 0; i < 8; i++) {
  fishSchool.push({
    x:     Math.random() * W,
    y:     100 + Math.random() * 300,
    speed: 0.6 + Math.random() * 0.8,
    size:  14  + Math.random() * 12,
    phase: Math.random() * Math.PI * 2,
    color: `hsl(${180 + Math.random() * 40}, 80%, 60%)`
  });
}


/* --- Object: Jellyfish (2 independent jellyfish) ---
   Each has position, pulsing phase, dome size, hue */
const jellies = [
  { x: 600, y: 200, phase: 0.0, size: 40, hue: 280 },
  { x: 680, y: 320, phase: 1.5, size: 28, hue: 320 }
];


/* --- Object: Starfish (3, resting on sea floor) --- */
const starfish = [
  { x: 130, y: H - 60, size: 22, color: '#ff7043' },
  { x: 420, y: H - 55, size: 18, color: '#ef5350' },
  { x: 700, y: H - 58, size: 26, color: '#ffa726' }
];


/* --- Object: Seaweed patches (10 plants) --- */
const seaweeds = [];
for (let i = 0; i < 10; i++) {
  seaweeds.push({
    x:        40 + i * 78,
    segments: 5 + Math.floor(Math.random() * 4),
    phase:    Math.random() * Math.PI * 2,
    height:   40 + Math.random() * 50,
    hue:      120 + Math.random() * 40
  });
}


/* --- Object: Bubbles (dynamic pool, spawned at runtime) --- */
let bubbles = [];


/* --- Object: Plankton (60 bioluminescent background particles) --- */
const plankton = [];
for (let i = 0; i < 60; i++) {
  plankton.push({
    x:     Math.random() * W,
    y:     Math.random() * H,
    r:     1 + Math.random() * 2,
    drift: (Math.random() - 0.5) * 0.3,
    speed: 0.1 + Math.random() * 0.2
  });
}


/* ============================================================
   === APPLICATION STAGE: Input / Event Handling =============
   User interactions update state; no drawing happens here.
   ============================================================ */

canvas.addEventListener('mousemove', e => {
  const rect = canvas.getBoundingClientRect();
  mouseX = e.clientX - rect.left;
  mouseY = e.clientY - rect.top;
  document.getElementById('mousePos').textContent =
    `${Math.round(mouseX)}, ${Math.round(mouseY)}`;
});

canvas.addEventListener('click', e => {
  const rect = canvas.getBoundingClientRect();
  spawnBubbles(e.clientX - rect.left, e.clientY - rect.top, 6);
});

document.getElementById('btnPause').addEventListener('click', () => {
  paused = !paused;
  document.getElementById('btnPause').textContent = paused ? '▶ Resume' : '⏸ Pause';
});

document.getElementById('btnBubble').addEventListener('click', () => {
  spawnBubbles(sub.x + 40, sub.y - 10, 12);
});

document.getElementById('speedSlider').addEventListener('input', e => {
  speedMult = parseFloat(e.target.value);
});

document.getElementById('btnNight').addEventListener('click', () => {
  deepMode = !deepMode;
});


/* ============================================================
   === APPLICATION STAGE: Bubble Spawn Helper ================
   ============================================================ */
function spawnBubbles(x, y, count) {
  for (let i = 0; i < count; i++) {
    bubbles.push({
      x:     x + (Math.random() - 0.5) * 20,
      y:     y,
      r:     3 + Math.random() * 8,
      vx:    (Math.random() - 0.5) * 0.6,
      vy:    -(0.5 + Math.random() * 1.2),
      alpha: 1.0
    });
  }
}


/* ============================================================
   === APPLICATION STAGE: Update Loop ========================
   Advances all simulation states each frame (physics, AI,
   timers). No canvas calls are made here.
   ============================================================ */
function update() {

  /* Submarine: smooth lerp toward mouse position */
  sub.targetX = mouseX - sub.width / 2;
  sub.targetY = mouseY - sub.height / 2;
  sub.x += (sub.targetX - sub.x) * 0.06 * speedMult;
  sub.y += (sub.targetY - sub.y) * 0.06 * speedMult;
  sub.angle = (sub.targetY - sub.y) * 0.008;   // subtle nose-tilt
  sub.lightAngle += 0.015 * speedMult;

  /* Fish school: swim left and wrap around canvas */
  for (const f of fishSchool) {
    f.x    -= f.speed * speedMult;
    f.phase += 0.07  * speedMult;
    if (f.x < -60) f.x = W + 60;
  }

  /* Jellyfish: sinusoidal drift up/down */
  for (const j of jellies) {
    j.phase += 0.04 * speedMult;
    j.y     -= Math.sin(j.phase) * 0.18 * speedMult;
    if (j.y < 60)     j.y = 60;
    if (j.y > H - 100) j.y = H - 100;
  }

  /* Seaweed: advance sway phase */
  for (const sw of seaweeds) {
    sw.phase += 0.018 * speedMult;
  }

  /* Bubbles: rise, drift sideways, fade out */
  for (const b of bubbles) {
    b.x    += b.vx;
    b.y    += b.vy  * speedMult;
    b.alpha -= 0.004 * speedMult;
  }
  bubbles = bubbles.filter(b => b.alpha > 0 && b.y > -20);

  /* Plankton: slow upward drift with horizontal wander */
  for (const p of plankton) {
    p.x += p.drift;
    p.y -= p.speed * speedMult;
    if (p.y < -5)  { p.y = H + 5; p.x = Math.random() * W; }
    if (p.x < 0)   p.x = W;
    if (p.x > W)   p.x = 0;
  }

  /* Auto-spawn occasional bubbles from submarine exhaust */
  if (Math.random() < 0.05 * speedMult) {
    spawnBubbles(sub.x + sub.width * 0.8, sub.y + 4, 1);
  }

  /* Update HUD readouts */
  document.getElementById('objCount').textContent =
    2 + jellies.length + starfish.length;
  document.getElementById('bubbleCount').textContent = bubbles.length;
}


/* ============================================================
   === GEOMETRY STAGE: Star Vertex Path ======================
   Computes 2D coordinates for a star polygon by rotating
   alternating inner/outer radius points around a centre.
   ============================================================ */
function drawStarPath(cx, cy, outerR, innerR, points) {
  ctx.beginPath();
  for (let i = 0; i < points * 2; i++) {
    const angle = (i * Math.PI / points) - Math.PI / 2;
    const r  = i % 2 === 0 ? outerR : innerR;
    const px = cx + Math.cos(angle) * r;
    const py = cy + Math.sin(angle) * r;
    i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
  }
  ctx.closePath();
}


/* ============================================================
   === GEOMETRY STAGE: Seaweed Bezier Path ===================
   Builds a chained bezier curve representing a swaying plant.
   Each segment offset is calculated from a sine wave.
   ============================================================ */
function buildSeaweedPath(sw) {
  const segH = sw.height / sw.segments;
  ctx.beginPath();
  ctx.moveTo(sw.x, H - 40);
  for (let s = 0; s < sw.segments; s++) {
    const sway = Math.sin(sw.phase + s * 0.7) * 8;
    const cx1  = sw.x + sway + 8;
    const cy1  = H - 40 - segH * s - segH * 0.5;
    const cx2  = sw.x + sway - 8;
    const cy2  = H - 40 - segH * (s + 1) + 4;
    const ex   = sw.x + sway;
    const ey   = H - 40 - segH * (s + 1);
    ctx.bezierCurveTo(cx1, cy1, cx2, cy2, ex, ey);
  }
}


/* ============================================================
   === RASTERIZATION STAGE: Background Gradient ==============
   Writes ocean-gradient pixels and caustic light-ray pixels
   to the canvas surface.
   ============================================================ */
function drawBackground() {
  const grad = ctx.createLinearGradient(0, 0, 0, H);
  if (deepMode) {
    grad.addColorStop(0,   '#000510');
    grad.addColorStop(0.5, '#00081a');
    grad.addColorStop(1,   '#000005');
  } else {
    grad.addColorStop(0,   '#001b3a');
    grad.addColorStop(0.4, '#002d5c');
    grad.addColorStop(0.7, '#003366');
    grad.addColorStop(1,   '#001122');
  }
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);   /* RASTERIZATION: full-canvas pixel fill */

  /* Caustic light rays from surface */
  ctx.save();
  ctx.globalAlpha = deepMode ? 0.03 : 0.07;
  for (let r = 0; r < 8; r++) {
    const rx    = 50 + r * 95 + Math.sin(Date.now() * 0.0005 + r) * 20;
    const grad2 = ctx.createLinearGradient(rx, 0, rx + 30, H * 0.6);
    grad2.addColorStop(0, '#ffffff');
    grad2.addColorStop(1, 'transparent');
    ctx.fillStyle = grad2;
    ctx.beginPath();
    ctx.moveTo(rx, 0);
    ctx.lineTo(rx + 25, H * 0.6);
    ctx.lineTo(rx - 10, H * 0.6);
    ctx.closePath();
    ctx.fill();   /* RASTERIZATION: ray fill */
  }
  ctx.restore();
}


/* ============================================================
   === RASTERIZATION STAGE: Sea Floor ========================
   ============================================================ */
function drawSeaFloor() {
  /* GEOMETRY: wavy polygon along the bottom edge */
  ctx.beginPath();
  ctx.moveTo(0, H - 30);
  for (let x = 0; x <= W; x += 20) {
    ctx.lineTo(x, H - 28 + Math.sin(x * 0.04) * 8);
  }
  ctx.lineTo(W, H);
  ctx.lineTo(0, H);
  ctx.closePath();

  /* RASTERIZATION: fill floor with gradient */
  const fg = ctx.createLinearGradient(0, H - 60, 0, H);
  fg.addColorStop(0, '#1a3a2a');
  fg.addColorStop(1, '#0a1a10');
  ctx.fillStyle = fg;
  ctx.fill();   /* RASTERIZATION: draw call */
}


/* ============================================================
   === RASTERIZATION STAGE: Plankton Particles ===============
   ============================================================ */
function drawPlankton() {
  for (const p of plankton) {
    /* GEOMETRY: define circular arc path */
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    /* RASTERIZATION: fill with bioluminescent colour */
    ctx.fillStyle = `rgba(100,255,200,${deepMode ? 0.4 : 0.15})`;
    ctx.fill();   /* RASTERIZATION: draw call */
  }
}


/* ============================================================
   === RASTERIZATION STAGE: Seaweed ==========================
   ============================================================ */
function drawSeaweeds() {
  for (const sw of seaweeds) {
    buildSeaweedPath(sw);   /* GEOMETRY: build bezier chain */

    /* RASTERIZATION: stroke the path in two passes */
    ctx.strokeStyle = `hsl(${sw.hue}, 60%, 30%)`;
    ctx.lineWidth   = 4;
    ctx.lineCap     = 'round';
    ctx.stroke();   /* RASTERIZATION: draw call */

    ctx.strokeStyle = `hsl(${sw.hue}, 60%, 45%)`;
    ctx.lineWidth   = 2;
    ctx.stroke();   /* RASTERIZATION: highlight pass */
  }
}


/* ============================================================
   === RASTERIZATION STAGE: Starfish =========================
   ============================================================ */
function drawStarfish() {
  for (const sf of starfish) {
    ctx.save();
    /* GEOMETRY: translate + gentle rotation transform */
    ctx.translate(sf.x, sf.y);
    ctx.rotate(Math.sin(Date.now() * 0.001) * 0.05);

    /* GEOMETRY: build 5-point star vertex path */
    drawStarPath(0, 0, sf.size, sf.size * 0.45, 5);

    /* RASTERIZATION: fill with radial gradient */
    const rg = ctx.createRadialGradient(0, 0, 2, 0, 0, sf.size);
    rg.addColorStop(0, '#ffcc80');
    rg.addColorStop(1, sf.color);
    ctx.fillStyle = rg;
    ctx.fill();    /* RASTERIZATION: draw call */

    ctx.strokeStyle = 'rgba(0,0,0,0.3)';
    ctx.lineWidth   = 1;
    ctx.stroke();  /* RASTERIZATION: draw call */
    ctx.restore();
  }
}


/* ============================================================
   === RASTERIZATION STAGE: Jellyfish ========================
   ============================================================ */
function drawJellyfish(j) {
  ctx.save();
  /* GEOMETRY: translate coordinate origin to jelly centre */
  ctx.translate(j.x, j.y);

  /* GEOMETRY: pulsing scale factor from phase */
  const pulse = 0.85 + 0.15 * Math.sin(j.phase);
  ctx.scale(pulse, pulse);

  /* RASTERIZATION: bell dome with radial gradient */
  const bell = ctx.createRadialGradient(
    -j.size * 0.2, -j.size * 0.3, 2,
     0, 0, j.size
  );
  bell.addColorStop(0,   `hsla(${j.hue}, 80%, 80%, 0.9)`);
  bell.addColorStop(0.6, `hsla(${j.hue}, 70%, 55%, 0.5)`);
  bell.addColorStop(1,   `hsla(${j.hue}, 60%, 40%, 0.1)`);
  ctx.fillStyle = bell;

  /* GEOMETRY: semi-ellipse dome path */
  ctx.beginPath();
  ctx.ellipse(0, 0, j.size, j.size * 0.6, 0, Math.PI, 0, true);
  ctx.closePath();
  ctx.fill();    /* RASTERIZATION: draw call */

  /* RASTERIZATION: tentacles */
  ctx.strokeStyle = `hsla(${j.hue}, 70%, 70%, 0.5)`;
  ctx.lineWidth   = 1.5;
  for (let t = -3; t <= 3; t++) {
    const tx = t * (j.size * 0.28);
    ctx.beginPath();
    ctx.moveTo(tx, 0);
    /* GEOMETRY: sinusoidal tentacle vertex chain */
    for (let seg = 1; seg <= 6; seg++) {
      const ty   = seg * 14;
      const wave = Math.sin(j.phase * 1.5 + seg + t) * 8;
      ctx.lineTo(tx + wave, ty);
    }
    ctx.stroke();  /* RASTERIZATION: draw call per tentacle */
  }
  ctx.restore();
}


/* ============================================================
   === RASTERIZATION STAGE: Fish =============================
   ============================================================ */
function drawFish(f) {
  ctx.save();
  /* GEOMETRY: translate to fish position, flip horizontally,
     apply body-wiggle rotation */
  ctx.translate(f.x, f.y);
  ctx.scale(-1, 1);
  ctx.rotate(Math.sin(f.phase) * 0.12);

  /* RASTERIZATION: body ellipse with gradient shading */
  ctx.beginPath();
  ctx.ellipse(0, 0, f.size, f.size * 0.5, 0, 0, Math.PI * 2);
  const fg = ctx.createRadialGradient(
    -f.size * 0.2, -f.size * 0.15, 1,
     0, 0, f.size
  );
  fg.addColorStop(0,   '#ffffff66');
  fg.addColorStop(0.4, f.color);
  fg.addColorStop(1,   'rgba(0,0,0,0.4)');
  ctx.fillStyle = fg;
  ctx.fill();    /* RASTERIZATION: draw call */

  /* GEOMETRY: tail triangle with swing offset */
  const tailSwing = Math.sin(f.phase * 2) * f.size * 0.3;
  ctx.beginPath();
  ctx.moveTo(-f.size + 2, 0);
  ctx.lineTo(-f.size - f.size * 0.5, -f.size * 0.35 + tailSwing);
  ctx.lineTo(-f.size - f.size * 0.5,  f.size * 0.35 + tailSwing);
  ctx.closePath();
  ctx.fillStyle = f.color;
  ctx.fill();    /* RASTERIZATION: draw call */

  /* RASTERIZATION: eye and specular dot */
  ctx.beginPath();
  ctx.arc(f.size * 0.4, -f.size * 0.1, f.size * 0.12, 0, Math.PI * 2);
  ctx.fillStyle = '#111';
  ctx.fill();    /* RASTERIZATION: draw call */

  ctx.beginPath();
  ctx.arc(f.size * 0.42, -f.size * 0.12, f.size * 0.04, 0, Math.PI * 2);
  ctx.fillStyle = 'white';
  ctx.fill();    /* RASTERIZATION: draw call */

  ctx.restore();
}


/* ============================================================
   === RASTERIZATION STAGE: Submarine ========================
   ============================================================ */
function drawSubmarine() {
  ctx.save();
  /* GEOMETRY: translate to sub centre, apply tilt rotation */
  ctx.translate(sub.x + sub.width / 2, sub.y + sub.height / 2);
  ctx.rotate(sub.angle);

  const hw = sub.width / 2;
  const hh = sub.height / 2;

  /* RASTERIZATION: spotlight cone (drawn behind hull) */
  ctx.save();
  ctx.rotate(Math.sin(sub.lightAngle) * 0.25);  /* GEOMETRY: spotlight sweep */
  const spotGrad = ctx.createRadialGradient(hw * 0.5, 0, 5, hw * 0.5, 0, 180);
  spotGrad.addColorStop(0, 'rgba(255,240,150,0.18)');
  spotGrad.addColorStop(1, 'rgba(255,240,150,0)');
  ctx.fillStyle = spotGrad;
  ctx.beginPath();
  ctx.moveTo(hw * 0.5, 0);
  ctx.lineTo(hw * 0.5 + 180, -50);
  ctx.lineTo(hw * 0.5 + 180,  50);
  ctx.closePath();
  ctx.fill();   /* RASTERIZATION: draw call */
  ctx.restore();

  /* RASTERIZATION: submarine hull */
  const hullGrad = ctx.createLinearGradient(-hw, -hh, -hw, hh);
  hullGrad.addColorStop(0,   '#b0c8e0');
  hullGrad.addColorStop(0.4, '#7aa8cc');
  hullGrad.addColorStop(1,   '#2a4a6a');
  ctx.fillStyle = hullGrad;
  ctx.beginPath();
  ctx.roundRect(-hw, -hh, sub.width, sub.height, sub.height / 2);
  ctx.fill();    /* RASTERIZATION: draw call */
  ctx.strokeStyle = '#1a3a5a';
  ctx.lineWidth   = 1.5;
  ctx.stroke();  /* RASTERIZATION: draw call */

  /* RASTERIZATION: conning tower */
  ctx.fillStyle = '#5a80a0';
  ctx.beginPath();
  ctx.roundRect(-8, -hh - 18, 22, 20, 4);
  ctx.fill();    /* RASTERIZATION: draw call */

  /* RASTERIZATION: periscope */
  ctx.strokeStyle = '#7a9abc';
  ctx.lineWidth   = 3;
  ctx.beginPath();
  ctx.moveTo(4, -hh - 18);
  ctx.lineTo(4, -hh - 32);
  ctx.lineTo(14, -hh - 32);
  ctx.stroke();  /* RASTERIZATION: draw call */

  /* RASTERIZATION: three porthole windows */
  for (let i = -1; i <= 1; i++) {
    const wx = i * 22;
    ctx.beginPath();
    ctx.arc(wx, 0, 7, 0, Math.PI * 2);   /* GEOMETRY: circle path */
    const wg = ctx.createRadialGradient(wx - 2, -2, 1, wx, 0, 7);
    wg.addColorStop(0, '#ffffcc');
    wg.addColorStop(1, '#ffdd44');
    ctx.fillStyle = wg;
    ctx.fill();    /* RASTERIZATION: draw call */
    ctx.strokeStyle = '#1a3a5a';
    ctx.lineWidth   = 1.5;
    ctx.stroke();  /* RASTERIZATION: draw call */
  }

  /* RASTERIZATION: spinning propeller blades */
  ctx.save();
  ctx.translate(-hw + 4, 0);
  ctx.rotate(sub.lightAngle * 4);   /* GEOMETRY: blade rotation */
  for (let b = 0; b < 3; b++) {
    ctx.rotate(Math.PI * 2 / 3);
    ctx.fillStyle = '#aaccee';
    ctx.beginPath();
    ctx.ellipse(0, -10, 4, 10, 0, 0, Math.PI * 2);
    ctx.fill();    /* RASTERIZATION: draw call */
  }
  ctx.restore();

  ctx.restore();
}


/* ============================================================
   === RASTERIZATION STAGE: Bubbles ==========================
   ============================================================ */
function drawBubbles() {
  for (const b of bubbles) {
    /* GEOMETRY: arc path at bubble position */
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);

    /* RASTERIZATION: translucent interior fill */
    ctx.fillStyle = `rgba(180,230,255,${b.alpha * 0.25})`;
    ctx.fill();    /* RASTERIZATION: draw call */

    /* RASTERIZATION: circular rim */
    ctx.strokeStyle = `rgba(200,240,255,${b.alpha * 0.8})`;
    ctx.lineWidth   = 1;
    ctx.stroke();  /* RASTERIZATION: draw call */

    /* RASTERIZATION: specular highlight dot */
    ctx.beginPath();
    ctx.arc(b.x - b.r * 0.35, b.y - b.r * 0.35, b.r * 0.2, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,255,255,${b.alpha * 0.7})`;
    ctx.fill();    /* RASTERIZATION: draw call */
  }
}


/* ============================================================
   === RASTERIZATION STAGE: Depth Vignette Overlay ===========
   ============================================================ */
function drawVignette() {
  /* GEOMETRY: radial gradient centred on canvas */
  const vg = ctx.createRadialGradient(W / 2, H / 2, H * 0.2, W / 2, H / 2, H * 0.85);
  vg.addColorStop(0, 'transparent');
  vg.addColorStop(1, deepMode ? 'rgba(0,0,10,0.75)' : 'rgba(0,5,20,0.45)');
  ctx.fillStyle = vg;
  /* RASTERIZATION: overlay pass across entire canvas */
  ctx.fillRect(0, 0, W, H);
}


/* ============================================================
   === MAIN RENDER LOOP =======================================
   Orchestrates Application → Geometry → Rasterization
   every frame using requestAnimationFrame.
   ============================================================ */
function render(timestamp) {

  /* APPLICATION STAGE: FPS calculation */
  frameCount++;
  const elapsed = timestamp - lastTime;
  if (elapsed >= 500) {
    fps = Math.round(frameCount / (elapsed / 1000));
    document.getElementById('fps').textContent = fps;
    frameCount = 0;
    lastTime   = timestamp;
  }

  if (!paused) {
    /* APPLICATION STAGE: advance all simulation states */
    update();

    /* RASTERIZATION STAGE: clear previous frame */
    ctx.clearRect(0, 0, W, H);

    /* Painter's algorithm — draw back-to-front */
    drawBackground();                            /* deepest layer    */
    drawPlankton();                              /* drifting specks  */
    drawSeaweeds();                              /* floor plants     */
    drawSeaFloor();                              /* ocean floor      */
    drawStarfish();                              /* floor creatures  */
    for (const j of jellies) drawJellyfish(j);  /* mid-water        */
    for (const f of fishSchool) drawFish(f);    /* swimming school  */
    drawSubmarine();                             /* player object    */
    drawBubbles();                               /* bubble effects   */
    drawVignette();                              /* depth overlay    */
  }

  /* APPLICATION STAGE: schedule next frame */
  requestAnimationFrame(render);
}

/* APPLICATION STAGE: kick off the animation loop */
requestAnimationFrame(render);
