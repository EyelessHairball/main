const carousel = document.getElementById("albumCarousel");
const images = [...carousel.querySelectorAll("img")];

let angle = 0;
let velocity = 0;

let baseRadius = 0;
let imgSize = 0;
let spinDirection = 0;

const FRICTION = 0.85;
const MAX_VELOCITY = 2;

const grabSound = new Audio(
  "https://raw.githubusercontent.com/EyelessHairball/soundeffects/main/grab.wav"
);
const releaseSound = new Audio(
  "https://raw.githubusercontent.com/EyelessHairball/soundeffects/main/release.wav"
);
const clickSound = new Audio(
  "https://raw.githubusercontent.com/EyelessHairball/soundeffects/main/click.wav"
);

grabSound.volume = 0.8;
releaseSound.volume = 0.8;
clickSound.volume = 0.1;

[grabSound, releaseSound, clickSound].forEach((a) => (a.preload = "auto"));

function updateLayout() {
  const width = carousel.offsetWidth;
  baseRadius = Math.max(120, Math.min(width * 0.4, 360));
  imgSize = Math.max(70, Math.min(baseRadius * 0.45, 150));

  images.forEach((img) => {
    img.style.width = `${imgSize}px`;
    img.style.height = `${imgSize}px`;
  });
}

window.addEventListener("resize", updateLayout);
updateLayout();

let isDragging = false;
let lastX = 0;

function startDrag(x) {
  isDragging = true;
  lastX = x;
  grabSound.currentTime = 0;
  grabSound.play();
}

function drag(x) {
  if (!isDragging) return;

  const dx = x - lastX;
  lastX = x;

  if (dx === 0) return;

  const inputDir = Math.sign(dx);

  if (spinDirection === 0) {
    spinDirection = inputDir;
  }

  if (inputDir === spinDirection) {
    velocity += Math.abs(dx) * 0.015 * spinDirection;
  } else {
    velocity *= 0.6;
  }

  velocity = Math.max(-MAX_VELOCITY, Math.min(MAX_VELOCITY, velocity));
}

function endDrag() {
  if (!isDragging) return;
  isDragging = false;
  spinDirection = 0;

  releaseSound.currentTime = 0;
  releaseSound.play();
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

carousel.addEventListener(
  "wheel",
  (e) => {
    e.preventDefault();
  },
  { passive: false }
);

const CLICK_STEP = 18;
let lastClickIndex = 0;

function render() {
  const n = images.length;
  angle = (angle + velocity) % 360;

  const speed = Math.abs(velocity);
  const dynamicRadius = baseRadius + Math.min(speed * 120, baseRadius * 0.6);

  const clickIndex = Math.floor(angle / CLICK_STEP);
  if (clickIndex !== lastClickIndex && speed > 0.05) {
    clickSound.currentTime = 0;
    clickSound.play();
    lastClickIndex = clickIndex;
  }

  images.forEach((img, i) => {
    const theta = (((i / n) * 360 + angle) * Math.PI) / 180;
    const x = Math.sin(theta) * dynamicRadius;
    const depth = (Math.cos(theta) + 1) * 0.5;
    const scale = 0.7 + depth * 0.3;

    img.style.transform = `
      translate(-50%, -50%)
      translateX(${x}px)
      scale(${scale})
    `;

    img.style.zIndex = Math.round(depth * 1000);
  });

  velocity *= FRICTION;
  requestAnimationFrame(render);
}

render();