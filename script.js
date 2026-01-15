(() => {
  const screen = document.getElementById("loading-screen");
  const bar = document.getElementById("progress-fill");
  const text = document.getElementById("loading-text");

  let progress = 0;

  const steps = ["Loading assets", "Preparing interface", "Finalizing"];

  const interval = setInterval(() => {
    progress += Math.random() * 15;
    if (progress >= 100) progress = 100;

    bar.style.width = progress + "%";
    text.textContent =
      steps[Math.min(steps.length - 1, Math.floor(progress / 34))];

    if (progress === 100) {
      clearInterval(interval);

      setTimeout(() => {
        screen.classList.add("fade-out");
        setTimeout(() => screen.remove(), 800);
      }, 400);
    }
  }, 300);

  window.addEventListener("load", () => {
    progress = 100;
  });
})();



const carousel = document.getElementById("albumCarousel");
const imgs = [...carousel.querySelectorAll("img")];
const IS_MOBILE = matchMedia("(pointer: coarse)").matches;

let angle = 0;
let vel = 0;
let radius = 0;
let size = 0;
let spin = 0;

const FRICTION = IS_MOBILE ? 0.2 : 0.85;
const MAX = IS_MOBILE ? 4 : 1;

const TOUCH_SENS = IS_MOBILE ? 0.006 : 0.015;

const grab = new Audio(
  "https://raw.githubusercontent.com/EyelessHairball/soundeffects/main/grab.wav"
);
const release = new Audio(
  "https://raw.githubusercontent.com/EyelessHairball/soundeffects/main/release.wav"
);
const click = new Audio(
  "https://raw.githubusercontent.com/EyelessHairball/soundeffects/main/click.wav"
);

[grab, release, click].forEach((a) => {
  a.preload = "auto";
  a.volume = 0.6;
});

function layout() {
  const w = carousel.offsetWidth;

  if (IS_MOBILE) {
    radius = Math.max(100, Math.min(w * 0.33, 240));
    size = Math.max(60, Math.min(radius * 0.38, 110));
  } else {
    radius = Math.max(120, Math.min(w * 0.4, 360));
    size = Math.max(70, Math.min(radius * 0.45, 150));
  }

  imgs.forEach((i) => {
    i.style.width = size + "px";
    i.style.height = size + "px";
  });
}

window.addEventListener("resize", layout);
layout();

let dragging = false;
let lastX = 0;

function start(x) {
  dragging = true;
  lastX = x;
  grab.currentTime = 0;
  grab.play();
}

function move(x) {
  if (!dragging) return;

  const dx = x - lastX;
  lastX = x;

  if (!dx) return;

  const dir = Math.sign(dx);
  if (!spin) spin = dir;

  let delta = Math.abs(dx) * TOUCH_SENS;

  if (IS_MOBILE) {
    delta = Math.min(delta, 0.04);
  }

  if (dir === spin) vel += delta * spin;
  else vel *= 0.7;

  vel = Math.max(-MAX, Math.min(MAX, vel));
}

function end() {
  if (!dragging) return;
  dragging = false;
  spin = 0;
  release.currentTime = 0;
  release.play();
}

carousel.addEventListener("mousedown", (e) => start(e.clientX));
window.addEventListener("mousemove", (e) => move(e.clientX));
window.addEventListener("mouseup", end);

carousel.addEventListener(
  "touchstart",
  (e) => {
    start(e.touches[0].clientX);
    e.preventDefault();
  },
  { passive: false }
);

carousel.addEventListener("touchmove", (e) => {
  move(e.touches[0].clientX);
  e.preventDefault();
});
carousel.addEventListener("touchend", end);

carousel.addEventListener("wheel", (e) => e.preventDefault(), {
  passive: false
});

const STEP = 18;
let lastStep = 0;

function render() {
  angle = (angle + vel) % 360;
  const speed = Math.abs(vel);
  const r = radius + Math.min(speed * 120, radius * 0.6);

  const step = Math.floor(angle / STEP);
  if (step !== lastStep && speed > 0.05) {
    click.currentTime = 0;
    click.play();
    lastStep = step;
  }

  imgs.forEach((img, i) => {
    const t = (((i / imgs.length) * 360 + angle) * Math.PI) / 180;
    const x = Math.sin(t) * r;
    const d = (Math.cos(t) + 1) * 0.5;
    const s = IS_MOBILE ? 0.8 + d * 0.15 : 0.7 + d * 0.3;

    img.style.transform = `
      translate(-50%, -50%)
      translateX(${x}px)
      scale(${s})
    `;
    img.style.zIndex = Math.round(d * 1000);
  });

  vel *= FRICTION;
  requestAnimationFrame(render);
}

render();

const song = new Audio(
  "https://raw.githubusercontent.com/EyelessHairball/soundeffects/refs/heads/main/loop.mp3"
);
song.loop = true;
song.volume = 0.4;
const button = new Audio(
  "https://raw.githubusercontent.com/EyelessHairball/soundeffects/refs/heads/main/button3.wav"
);
button.volume = 0.6;
const hits = [
  "https://raw.githubusercontent.com/EyelessHairball/soundeffects/refs/heads/main/metal/1.wav",
  "https://raw.githubusercontent.com/EyelessHairball/soundeffects/refs/heads/main/metal/2.wav",
  "https://raw.githubusercontent.com/EyelessHairball/soundeffects/refs/heads/main/metal/3.wav",
  "https://raw.githubusercontent.com/EyelessHairball/soundeffects/refs/heads/main/metal/4.wav",
  "https://raw.githubusercontent.com/EyelessHairball/soundeffects/refs/heads/main/metal/5.wav"
].map((s) => {
  const a = new Audio(s);
  a.volume = 0.2;
  return a;
});

const grb = new Audio(
  "https://raw.githubusercontent.com/EyelessHairball/soundeffects/refs/heads/main/physcannon_pickup.wav"
);
grb.volume = 0.4;

const drop = new Audio(
  "https://raw.githubusercontent.com/EyelessHairball/soundeffects/refs/heads/main/physcannon_drop.wav"
);
drop.volume = 0.3;

const hover = new Audio(
  "https://raw.githubusercontent.com/EyelessHairball/soundeffects/refs/heads/main/hover.wav"
);

hover.volume = 0.1;

function randHit(v) {
  if (Math.abs(v) < 2) return;
  const a = hits[Math.floor(Math.random() * hits.length)];
  a.currentTime = 0;
  a.play();
}

const G = 0.7,
  B = 0.3,
  AIR = 0.98,
  REST = 0.3;
document.querySelectorAll("#phys").forEach((el) => {
  el.style.cursor = "grab";
  let hold = false,
    active = false;
  let vx = 0,
    vy = 0,
    x = 0,
    y = 0;
  let px = 0,
    py = 0,
    w = 0,
    h = 0;
  let offsetX = 0,
    offsetY = 0;

  function toBody(cx, cy) {
    const r = el.getBoundingClientRect();
    w = r.width;
    h = r.height;
    document.body.appendChild(el);
    el.style.position = "fixed";
    el.style.width = w + "px";
    el.style.height = h + "px";
    el.style.zIndex = 2000;
    el.style.margin = "0";
    x = cx - offsetX;
    y = cy - offsetY;
    el.style.left = x + "px";
    el.style.top = y + "px";
  }

  function grabObj(cx, cy) {
    hold = true;
    active = false;
    const r = el.getBoundingClientRect();
    offsetX = cx - r.left;
    offsetY = cy - r.top;
    px = cx;
    py = cy;
    vx = vy = 0;
    toBody(cx, cy);
    grb.play();
  }

  function dragObj(cx, cy) {
    if (!hold) return;
    const dx = cx - px;
    const dy = cy - py;
    x += dx;
    y += dy;

    const mx = innerWidth - w;
    const my = innerHeight - h;
    x = Math.max(0, Math.min(mx, x));
    y = Math.max(0, Math.min(my, y));

    vx = dx;
    vy = dy;

    el.style.left = x + "px";
    el.style.top = y + "px";

    px = cx;
    py = cy;
  }

  function dropObj() {
    if (!hold) return;
    hold = false;
    active = true;
    drop.play();
  }

  el.addEventListener("mousedown", (e) => {
    e.preventDefault();
    grabObj(e.clientX, e.clientY);
  });

  window.addEventListener("mousemove", (e) => dragObj(e.clientX, e.clientY));
  window.addEventListener("mouseup", (e) => {
    e.preventDefault();
    dropObj();
  });

  el.addEventListener("mouseenter", () =>
    window.addEventListener("keydown", handleKey)
  );
  el.addEventListener("mouseleave", () =>
    window.removeEventListener("keydown", handleKey)
  );

  function handleKey(e) {
    if (e.key === "e" || e.key === "E") {
      button.currentTime = 0;
      button.play();
      song.paused ? song.play() : song.pause();
    }
  }

  function tick() {
    if (active) {
      vy += G;
      x += vx;
      y += vy;

      const mx = innerWidth - w;
      const my = innerHeight - h;

      if (x < 0) {
        x = 0;
        vx *= -B;
        randHit(vx);
      }
      if (x > mx) {
        x = mx;
        vx *= -B;
        randHit(vx);
      }
      if (y < 0) {
        y = 0;
        vy *= -B;
        randHit(vy);
      }
      if (y > my) {
        y = my;
        vy *= -B;
        vx *= AIR;
        randHit(vy);
        if (Math.abs(vy) < REST) vy = 0;
      }

      vx *= AIR;
      vy *= AIR;

      el.style.left = x + "px";
      el.style.top = y + "px";
    }
    requestAnimationFrame(tick);
  }
  tick();
});

const tooltip = document.getElementById("tooltip");

document.querySelectorAll("img[alt]").forEach((img) => {
  img.addEventListener("mouseenter", (e) => {
    tooltip.textContent = img.alt;
    tooltip.style.display = "block";
    const hover = new Audio(
      "https://raw.githubusercontent.com/EyelessHairball/soundeffects/refs/heads/main/hover.wav"
    );

    hover.volume = 0.1;
    hover.play();
  });

  img.addEventListener("mousemove", (e) => {
    tooltip.style.left = e.pageX + 10 + "px";
    tooltip.style.top = e.pageY + 10 + "px";
  });
  img.addEventListener("mouseleave", () => {
    tooltip.style.display = "none";
  });
});
