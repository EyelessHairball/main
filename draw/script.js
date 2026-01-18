const c = document.createElement("canvas");
const clp = document.createElement("input");
const ss = document.createElement("input");
const eb = document.createElement("button");
const bb = document.createElement("button");
const cb = document.createElement("button");
const db = document.createElement("button");
const st = document.createElement("style");
const fnt = document.createElement("link");
const PIXEL_SCALE = 3;

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

let dsi = 0;
let esi = 0;

const ds = dsu
  .filter((url) => url)
  .map((url) => {
    const a = new Audio(url);
    a.preload = "auto";
    return a;
  });

const es = esu
  .filter((url) => url)
  .map((url) => {
    const a = new Audio(url);
    a.preload = "auto";
    return a;
  });

function exportP(scale = PIXEL_SCALE) {
  const out = document.createElement("canvas");
  out.width = c.width / (scale * 2);
  out.height = c.height / (scale * 2);

  const octx = out.getContext("2d");
  octx.imageSmoothingEnabled = false;

  octx.drawImage(c, 0, 0, c.width, c.height, 0, 0, out.width, out.height);

  const lnk = document.createElement("a");
  lnk.download = "drawing.png";
  lnk.href = out.toDataURL("image/png");
  lnk.click();
}

let era = false;
let svc = "#000000";
let cur = null;
let lspd = 0;

let history = [];
let historyStep = -1;

function saveState() {
  historyStep++;
  if (historyStep < history.length) {
    history.length = historyStep;
  }
  history.push(c.toDataURL());
  if (history.length > 50) {
    history.shift();
    historyStep--;
  }
}

function undo() {
  if (historyStep > 0) {
    historyStep--;
    restoreState(history[historyStep]);
  }
}

function redo() {
  if (historyStep < history.length - 1) {
    historyStep++;
    restoreState(history[historyStep]);
  }
}

function restoreState(dataUrl) {
  const img = new Image();
  img.onload = () => {
    ctx.clearRect(0, 0, c.width, c.height);
    bg();
    ctx.drawImage(img, 0, 0);
  };
  img.src = dataUrl;
}

function play() {
  if (!cur || cur.paused) {
    if (era) {
      if (es.length > 0) {
        cur = es[esi % es.length];
        esi = (esi + 1) % es.length;
      }
    } else {
      if (ds.length > 0) {
        cur = ds[dsi % ds.length];
        dsi = (dsi + 1) % ds.length;
      }
    }

    if (cur) {
      cur.currentTime = 0;
      cur.loop = true;
      cur.volume = 0.08;
      cur.playbackRate = 1;
      cur.play().catch(() => {});
    }
  }
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

const ct = document.createElement("div");
ct.className = "dc";
document.body.appendChild(ct);

eb.innerHTML = '<i class="fa-solid fa-eraser"></i>';
bb.innerHTML = '<i class="fa-solid fa-paintbrush"></i>';
cb.innerHTML = '<i class="fa-solid fa-trash"></i>';
db.innerHTML = '<i class="fa-solid fa-download"></i>';

[eb, bb, cb, db].forEach((b) => {
  b.className = "db";
  b.addEventListener("mouseenter", phov);
  b.addEventListener("click", pclk);
});

clp.type = "color";
clp.value = "#000000";
clp.className = "dcl";

ss.type = "range";
ss.min = "1";
ss.max = "20";
ss.value = "10";
ss.className = "dsr";

c.className = "dcv";
const ctx = c.getContext("2d");
ctx.imageSmoothingEnabled = false;

ct.append(clp, ss, grid([eb, bb, cb, db]));

document.body.appendChild(c);
document.head.appendChild(st);

ctx.lineCap = "round";
ctx.lineJoin = "round";

function bg() {
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, 0, c.width, c.height);
}

function rsz() {
  const img = ctx.getImageData(0, 0, c.width, c.height);

  const w = Math.floor(window.innerWidth / PIXEL_SCALE);
  const h = Math.floor(window.innerHeight / PIXEL_SCALE);

  c.width = w;
  c.height = h;

  c.style.width = window.innerWidth + "px";
  c.style.height = window.innerHeight + "px";

  ctx.imageSmoothingEnabled = false;

  bg();
  ctx.putImageData(img, 0, 0);

  ctx.lineWidth = ss.value / PIXEL_SCALE;
  ctx.strokeStyle = era ? "#FFFFFF" : clp.value;
}

ctx.lineWidth = ss.value / PIXEL_SCALE;
ctx.strokeStyle = clp.value;

window.addEventListener("resize", rsz);

bg();
rsz();

ctx.lineWidth = ss.value / PIXEL_SCALE;

saveState();

let drw = false;
let lx = 0;
let ly = 0;
let lt = 0;

c.addEventListener("mousedown", (e) => {
  drw = true;
  (lx = Math.floor(e.offsetX / PIXEL_SCALE)),
    (ly = Math.floor(e.offsetY / PIXEL_SCALE));
  lt = Date.now();
  ctx.beginPath();
  ctx.moveTo(lx, ly);
  play();
});

c.addEventListener("mousemove", (e) => {
  if (drw) {
    const dst = Math.hypot(e.offsetX - lx, e.offsetY - ly);

    if (dst > 0) {
      ctx.lineTo(
        Math.floor(e.offsetX / PIXEL_SCALE),
        Math.floor(e.offsetY / PIXEL_SCALE)
      );
      ctx.stroke();

      const now = Date.now();
      const dt = now - lt;
      lspd = dt > 0 ? (dst / dt) * 10 : 0;

      if (cur && !cur.paused) {
        const vol = Math.min(0.15, 0.05 + lspd / 100);
        const rate = Math.min(1.3, 0.9 + lspd / 40);
        cur.volume = vol;
        cur.playbackRate = rate;
      }

      lx = e.offsetX;
      ly = e.offsetY;
      lt = now;
    }
  }
});

c.addEventListener("mouseup", () => {
  if (drw) {
    saveState();
  }
  drw = false;
  stop();
});

c.addEventListener("mouseleave", () => {
  if (drw) {
    saveState();
  }
  drw = false;
  stop();
});

c.addEventListener("touchstart", (e) => {
  e.preventDefault();
  const tch = e.touches[0];
  const rct = c.getBoundingClientRect();
  lx = tch.clientX - rct.left;
  ly = tch.clientY - rct.top;
  lt = Date.now();
  drw = true;
  ctx.beginPath();
  ctx.moveTo(lx, ly);
  play();
});

c.addEventListener("touchmove", (e) => {
  e.preventDefault();
  if (drw) {
    const tch = e.touches[0];
    const rct = c.getBoundingClientRect();
    const x = tch.clientX - rct.left;
    const y = tch.clientY - rct.top;
    const dst = Math.hypot(x - lx, y - ly);

    if (dst > 0) {
      ctx.lineTo(x, y);
      ctx.stroke();

      const now = Date.now();
      const dt = now - lt;
      lspd = dt > 0 ? (dst / dt) * 10 : 0;

      if (cur && !cur.paused) {
        const vol = Math.min(0.15, 0.05 + lspd / 100);
        const rate = Math.min(1.3, 0.9 + lspd / 40);
        cur.volume = vol;
        cur.playbackRate = rate;
      }

      lx = x;
      ly = y;
      lt = now;
    }
  }
});

c.addEventListener("touchend", () => {
  if (drw) {
    saveState();
  }
  drw = false;
  stop();
});

clp.addEventListener("input", (e) => {
  ctx.strokeStyle = e.target.value;
  svc = e.target.value;
  era = false;
  ctx.lineWidth = ss.value / PIXEL_SCALE;
});

ss.addEventListener(
  "input",
  (e) => (ctx.lineWidth = e.target.value / PIXEL_SCALE)
);

eb.addEventListener("click", () => {
  if (!era) {
    svc = clp.value;
  }
  stop();
  era = true;
  ctx.strokeStyle = "#FFFFFF";
  ctx.lineWidth = ss.value / PIXEL_SCALE;
});

bb.addEventListener("click", () => {
  stop();
  era = false;
  ctx.strokeStyle = svc;
  clp.value = svc;
  ctx.lineWidth = ss.value / PIXEL_SCALE;
});

cb.addEventListener("click", () => {
  pclr();
  ctx.clearRect(0, 0, c.width, c.height);
  bg();
  saveState();
});

db.addEventListener("click", () => {
  exportPixelated(PIXEL_SCALE);
});

const undoSound = new Audio(
  "https://raw.githubusercontent.com/EyelessHairball/soundeffects/main/flipnote/Sample%2010.wav"
);
const redoSound = new Audio(
  "https://raw.githubusercontent.com/EyelessHairball/soundeffects/main/flipnote/Sample%2011.wav"
);

undoSound.volume = 0.15;
redoSound.volume = 0.15;

document.addEventListener("keydown", (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
    e.preventDefault();
    undo();
    undoSound.currentTime = 0;
    undoSound.play().catch(() => {});
  } else if (
    (e.ctrlKey || e.metaKey) &&
    (e.key === "y" || (e.key === "z" && e.shiftKey))
  ) {
    e.preventDefault();
    redo();
    redoSound.currentTime = 0;
    redoSound.play().catch(() => {});
  } else if ((e.ctrlKey || e.metaKey) && e.key === "s") {
    e.preventDefault();
    pclk();
    const lnk = document.createElement("a");
    lnk.download = "drawing.png";
    lnk.href = c.toDataURL("image/png");
    lnk.click();
  } else if (!e.ctrlKey && !e.metaKey) {
    if (e.key.toLowerCase() === "e") {
      e.preventDefault();
      eb.click();
    } else if (e.key.toLowerCase() === "b") {
      e.preventDefault();
      bb.click();
    } else if (e.key.toLowerCase() === "c") {
      e.preventDefault();
      cb.click();
    }
  }
});

function grid(btns) {
  const g = document.createElement("div");
  g.className = "bg";
  btns.forEach((b) => g.appendChild(b));
  return g;
}

st.textContent = `
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    width: 100vw;
    height: 100vh;
    overflow: hidden;
    background: #f5f5f5;
  }

  .dc {
    position: fixed;
    bottom: 10px;
    right: 10px;
    padding: 8px;
    background: white;
    border: 2px solid black;
    z-index: 9999;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 5px;
    box-shadow: 2px 2px 8px rgba(0,0,0,0.2);
    font-family: sans-serif;
    user-select: none;
  }

  .dcv {
    position: fixed;
    top: 0;
    left: 0;
    background: white;
    cursor: crosshair;
    image-rendering: pixelated;
  }

  .dcl, .dsr {
    width: 100%;
    box-sizing: border-box;
    font-size: 0.8rem;
    padding: 4px;
    border: 1px solid black;
    background: #f0f0f0;
    cursor: pointer;
  }

  .bg {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 5px;
    width: 100%;
  }

  .db {
    font-size: 1rem;
    padding: 6px;
    border: 1px solid black;
    background: #f0f0f0;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .db:hover {
    background: #e0e0e0;
  }
`;