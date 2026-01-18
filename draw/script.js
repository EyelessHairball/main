const c = document.createElement("canvas"),
  clp = document.createElement("input"),
  ss = document.createElement("input"),
  eb = document.createElement("button"),
  bb = document.createElement("button"),
  cb = document.createElement("button"),
  db = document.createElement("button"),
  fb = document.createElement("button"),
  sb = document.createElement("button"),
  st = document.createElement("style"),
  fnt = document.createElement("link"),
  PIXEL_SCALE = 3;

fnt.rel = "stylesheet";
fnt.href =
  "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css";
document.head.appendChild(fnt);

const dsu = [
  "https://raw.githubusercontent.com/EyelessHairball/soundeffects/main/flipnote/Sample%2030.wav"
];
const esu = [
  "https://raw.githubusercontent.com/EyelessHairball/soundeffects/main/flipnote/Sample%2027.wav"
];
const clks = new Audio(
  "https://raw.githubusercontent.com/EyelessHairball/soundeffects/main/flipnote/Sample%2027.wav"
);
const hovs = new Audio(
  "https://raw.githubusercontent.com/EyelessHairball/soundeffects/main/flipnote/Sample%206.wav"
);
const clrs = new Audio(
  "https://raw.githubusercontent.com/EyelessHairball/soundeffects/main/flipnote/Sample%203.wav"
);
clks.volume = 0.15;
hovs.volume = 0.1;
clrs.volume = 0.2;
let dsi = 0,
  esi = 0;
const ds = dsu.map((u) => new Audio(u)),
  es = esu.map((u) => new Audio(u));
let era = false,
  svc = "#000000",
  cur = null,
  lspd = 0;
let flm = false,
  eym = false,
  eyg = false;
const ctx = c.getContext("2d");
ctx.imageSmoothingEnabled = false;
c.className = "dcv";
document.body.appendChild(c);

function bg() {
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, c.width, c.height);
}

function rsz() {
  const img = ctx.getImageData(0, 0, c.width, c.height);
  c.width = Math.floor(innerWidth / PIXEL_SCALE);
  c.height = Math.floor(innerHeight / PIXEL_SCALE);
  c.style.width = innerWidth + "px";
  c.style.height = innerHeight + "px";
  bg();
  ctx.putImageData(img, 0, 0);
  ctx.lineWidth = ss.value / PIXEL_SCALE;
  ctx.strokeStyle = era ? "#fff" : clp.value;
}
addEventListener("resize", rsz);
rsz();
bg();

let hist = [],
  hstp = -1;
function sav() {
  hstp++;
  if (hstp < hist.length) hist.length = hstp;
  hist.push(c.toDataURL());
  if (hist.length > 50) {
    hist.shift();
    hstp--;
  }
}
function rst(d) {
  const i = new Image();
  i.onload = () => {
    bg();
    ctx.drawImage(i, 0, 0);
  };
  i.src = d;
}
function und() {
  if (hstp > 0) rst(hist[--hstp]);
}
function red() {
  if (hstp < hist.length - 1) rst(hist[++hstp]);
}

function play() {
  if (cur && !cur.paused) return;
  const a = era ? es[esi++ % es.length] : ds[dsi++ % ds.length];
  if (!a) return;
  cur = a;
  cur.currentTime = 0;
  cur.loop = true;
  cur.volume = 0.08;
  cur.play().catch(() => {});
}
function stop() {
  if (cur) {
    cur.pause();
    cur.currentTime = 0;
    cur.loop = false;
  }
  cur = null;
}
function pclk() {
  clks.currentTime = 0;
  clks.play().catch(() => {});
}
function phov() {
  hovs.currentTime = 0;
  hovs.play().catch(() => {});
}
function pclr() {
  clrs.currentTime = 0;
  clrs.play().catch(() => {});
}

const gp = (i, x, y) =>
  i.data.slice((y * i.width + x) * 4, (y * i.width + x) * 4 + 4);
const sp = (i, x, y, c) => {
  const n = (y * i.width + x) * 4;
  i.data[n] = c[0];
  i.data[n + 1] = c[1];
  i.data[n + 2] = c[2];
  i.data[n + 3] = 255;
};
const sc = (a, b) => a[0] == b[0] && a[1] == b[1] && a[2] == b[2];
const hx = (h) => [
  (parseInt(h.slice(1), 16) >> 16) & 255,
  (parseInt(h.slice(1), 16) >> 8) & 255,
  parseInt(h.slice(1), 16) & 255,
  255
];
function sfl(x, y, col) {
  if (eyg) return;
  eyg = true;
  const img = ctx.getImageData(0, 0, c.width, c.height),
    tgt = gp(img, x, y),
    fil = hx(col);
  if (sc(tgt, fil)) {
    eyg = false;
    return;
  }
  const q = [[x, y]],
    v = new Set(),
    k = (x, y) => x + "," + y;
  (function step() {
    let n = 0;
    while (q.length && n < 180) {
      const [p, y] = q.shift();
      if (p < 0 || y < 0 || p >= img.width || y >= img.height) continue;
      const kk = k(p, y);
      if (v.has(kk) || !sc(gp(img, p, y), tgt)) continue;
      v.add(kk);
      sp(img, p, y, fil);
      q.push([p + 1, y], [p - 1, y], [p, y + 1], [p, y - 1]);
      n++;
    }
    ctx.putImageData(img, 0, 0);
    q.length ? requestAnimationFrame(step) : ((eyg = false), sav());
  })();
}

function pickColor(x, y) {
  const img = ctx.getImageData(0, 0, c.width, c.height);
  const pixel = gp(img, x, y);
  const hex =
    "#" +
    ((1 << 24) + (pixel[0] << 16) + (pixel[1] << 8) + pixel[2])
      .toString(16)
      .slice(1);
  return hex;
}

let drw = false,
  lx = 0,
  ly = 0,
  lt = 0;

c.addEventListener("mousedown", (e) => {
  const x = Math.floor(e.offsetX / PIXEL_SCALE),
    y = Math.floor(e.offsetY / PIXEL_SCALE);

  if (flm) {
    sfl(x, y, clp.value);
    return;
  }

  if (eym) {
    const pickedColor = pickColor(x, y);
    clp.value = pickedColor;
    ctx.strokeStyle = pickedColor;
    svc = pickedColor;
    era = false;
    eym = false;
    c.style.cursor = "crosshair";
    return;
  }

  drw = true;
  lx = x;
  ly = y;
  lt = Date.now();
  ctx.beginPath();
  ctx.moveTo(x, y);
  play();
});

c.addEventListener("mousemove", (e) => {
  const x = Math.floor(e.offsetX / PIXEL_SCALE),
    y = Math.floor(e.offsetY / PIXEL_SCALE);

  if (eym) {
    c.style.cursor = "crosshair";
    return;
  }

  if (!drw) return;

  ctx.lineTo(x, y);
  ctx.stroke();
  const now = Date.now(),
    dt = now - lt,
    dst = Math.hypot(x - lx, y - ly);
  lspd = dt > 0 ? (dst / dt) * 10 : 0;
  if (cur && !cur.paused) {
    cur.volume = Math.min(0.15, 0.05 + lspd / 100);
    cur.playbackRate = Math.min(1.3, 0.9 + lspd / 40);
  }
  lx = x;
  ly = y;
  lt = now;
});

c.addEventListener("mouseup", () => {
  if (drw) sav();
  drw = false;
  stop();
});

c.addEventListener("mouseleave", () => {
  if (drw) sav();
  drw = false;
  stop();
});

clp.type = "color";
clp.value = "#000000";
clp.className = "dcl";
ss.type = "range";
ss.min = 1;
ss.max = 20;
ss.value = 10;
ss.className = "dsr";
ctx.lineCap = "round";
ctx.lineJoin = "round";
ctx.lineWidth = ss.value / PIXEL_SCALE;
ctx.strokeStyle = clp.value;

clp.oninput = (e) => {
  ctx.strokeStyle = e.target.value;
  svc = e.target.value;
  era = false;
};
ss.oninput = (e) => (ctx.lineWidth = e.target.value / PIXEL_SCALE);

eb.innerHTML = '<i class="fa-solid fa-eraser"></i>';
bb.innerHTML = '<i class="fa-solid fa-paintbrush"></i>';
cb.innerHTML = '<i class="fa-solid fa-trash"></i>';
db.innerHTML = '<i class="fa-solid fa-download"></i>';
fb.innerHTML = '<i class="fa-solid fa-fill-drip"></i>';
sb.innerHTML = '<i class="fa-solid fa-eye-dropper"></i>';

[eb, bb, cb, db, fb, sb].forEach((b) => {
  b.className = "db";
  b.onmouseenter = phov;
  b.onclick = () => {
    pclk();
  };
});

eb.onclick = () => {
  pclk();
  svc = clp.value;
  stop();
  era = true;
  ctx.strokeStyle = "#fff";
  flm = false;
  eym = false;
  c.style.cursor = "crosshair";
};

bb.onclick = () => {
  pclk();
  stop();
  era = false;
  ctx.strokeStyle = svc;
  clp.value = svc;
  flm = false;
  eym = false;
  c.style.cursor = "crosshair";
};

cb.onclick = () => {
  pclk();
  pclr();
  ctx.clearRect(0, 0, c.width, c.height);
  bg();
  sav();
};

db.onclick = () => {
  pclk();
  const a = document.createElement("a");
  a.download = "drawing.png";
  a.href = c.toDataURL("image/png");
  a.click();
};

fb.onclick = () => {
  pclk();
  flm = true;
  eym = false;
  c.style.cursor = "crosshair";
};

sb.onclick = () => {
  pclk();
  eym = true;
  flm = false;
  c.style.cursor = "crosshair";
};

const ct = document.createElement("div");
ct.className = "dc";
ct.append(
  clp,
  ss,
  (function () {
    const g = document.createElement("div");
    g.className = "bg";
    [eb, bb, fb, sb, cb, db].forEach((b) => g.appendChild(b));
    return g;
  })()
);
document.body.appendChild(ct);

const us = new Audio(
  "https://raw.githubusercontent.com/EyelessHairball/soundeffects/main/flipnote/Sample%2010.wav"
);
const rs = new Audio(
  "https://raw.githubusercontent.com/EyelessHairball/soundeffects/main/flipnote/Sample%2011.wav"
);
us.volume = 0.15;
rs.volume = 0.15;

addEventListener("keydown", (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
    e.preventDefault();
    und();
    us.currentTime = 0;
    us.play();
  } else if ((e.ctrlKey || e.metaKey) && (e.key === "y" || e.key === "Z")) {
    e.preventDefault();
    red();
    rs.currentTime = 0;
    rs.play();
  } else if (e.key.toLowerCase() === "i") {
    e.preventDefault();
    pclk();
    sb.click();
  } else if (e.key.toLowerCase() === "e") {
    pclk();
    eb.click();
  } else if (e.key.toLowerCase() === "b") {
    pclk();
    bb.click();
  }
});

st.textContent = `*{margin:0;padding:0;box-sizing:border-box}body{width:100vw;height:100vh;overflow:hidden;background:#f5f5f5}.dc{position:fixed;bottom:10px;right:10px;padding:8px;background:#fff;border:2px solid #000;z-index:9999;display:flex;flex-direction:column;align-items:center;gap:5px;box-shadow:2px 2px 8px rgba(0,0,0,.2);font-family:sans-serif;user-select:none}.dcv{position:fixed;top:0;left:0;background:#fff;cursor:crosshair;image-rendering:pixelated}.dcl,.dsr{width:100%;font-size:.8rem;padding:4px;border:1px solid #000;background:#f0f0f0;cursor:pointer}.bg{display:grid;grid-template-columns:repeat(3,1fr);gap:5px;width:100%}.db{font-size:1rem;padding:6px;border:1px solid #000;background:#f0f0f0;cursor:pointer;display:flex;align-items:center;justify-content:center}.db:hover{background:#e0e0e0}`;
document.head.appendChild(st);
sav();
