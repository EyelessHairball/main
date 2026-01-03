const carousel = document.getElementById("albumCarousel");
const imgs = [...carousel.querySelectorAll("img")];

let angle = 0;
let speed = 0;
let radius = 0;
let size = 0;
let dir = 0;

const FRICTION = 0.96;
const MAX_SPEED = 2;

const grab = new Audio(
  "https://raw.githubusercontent.com/EyelessHairball/soundeffects/main/grab.wav"
);
const release = new Audio(
  "https://raw.githubusercontent.com/EyelessHairball/soundeffects/main/release.wav"
);
const click = new Audio(
  "https://raw.githubusercontent.com/EyelessHairball/soundeffects/main/click.wav"
);

grab.volume = 0.8;
release.volume = 0.8;
click.volume = 0.1;

[grab, release, click].forEach((a) => (a.preload = "auto"));

function updateLayout() {
  const w = carousel.offsetWidth;
  radius = Math.max(120, Math.min(w * 0.4, 360));
  size = Math.max(70, Math.min(radius * 0.45, 150));

  imgs.forEach((img) => {
    img.style.width = `${size}px`;
    img.style.height = `${size}px`;
  });
}

window.addEventListener("resize", updateLayout);
updateLayout();

let dragging = false;
let lastX = 0;

function startDrag(x) {
  dragging = true;
  lastX = x;
  grab.currentTime = 0;
  grab.play();
}

function drag(x) {
  if (!dragging) return;

  const dx = x - lastX;
  lastX = x;
  if (dx === 0) return;

  const inputDir = Math.sign(dx);

  if (dir === 0) dir = inputDir;

  if (inputDir === dir) {
    speed += Math.abs(dx) * 0.015 * dir;
  } else {
    speed *= 0.6;
  }

  speed = Math.max(-MAX_SPEED, Math.min(MAX_SPEED, speed));
}

function endDrag() {
  if (!dragging) return;
  dragging = false;
  dir = 0;
  release.currentTime = 0;
  release.play();
}

carousel.addEventListener("mousedown", (e) => startDrag(e.clientX));
window.addEventListener("mousemove", (e) => drag(e.clientX));
window.addEventListener("mouseup", endDrag);

carousel.addEventListener("touchstart", (e) => startDrag(e.touches[0].clientX));
carousel.addEventListener("touchmove", (e) => {
  drag(e.touches[0].clientX);
  e.preventDefault();
});
carousel.addEventListener("touchend", endDrag);

const STEP = 18;
let lastClick = 0;

function render() {
  const n = imgs.length;
  angle = (angle + speed) % 360;

  const s = Math.abs(speed);
  const dynRadius = radius + Math.min(s * 120, radius * 0.6);

  const clickIndex = Math.floor(angle / STEP);
  if (clickIndex !== lastClick && s > 0.05) {
    click.currentTime = 0;
    click.play();
    lastClick = clickIndex;
  }

  imgs.forEach((img, i) => {
    const theta = (((i / n) * 360 + angle) * Math.PI) / 180;
    const x = Math.sin(theta) * dynRadius;
    const depth = (Math.cos(theta) + 1) * 0.5;
    const scale = 0.7 + depth * 0.3;

    img.style.transform = `translate(-50%, -50%) translateX(${x}px) scale(${scale})`;
    img.style.zIndex = Math.round(depth * 1000);
  });

  speed *= FRICTION;
  requestAnimationFrame(render);
}

render();
