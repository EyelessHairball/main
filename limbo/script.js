const CONFIG = {
  SHUFFLE_MOVES: 31,
  MOVE_DURATION: 260,
  MOVE_INTERVAL: 295,
  ROTATE_DURATION: 700,
  BLINK_INTERVAL: 350,
  SELECTION_TIMEOUT: 8000,
  ROTARY_SPEED: 15000
};

const state = {
  started: false,
  correctKey: -1,
  currentIndex: -1,
  selectionTimer: null,
  blinkInterval: null
};

const container = document.querySelector(".container");
const keys = [...document.querySelectorAll(".key")];
const audio = new Audio("key.mp3");

const PATTERNS = [
  [
    [1, 0],
    [0, 1],
    [0, -1],
    [-1, 0],
    [1, 0],
    [0, 1],
    [0, -1],
    [-1, 0]
  ], // small rotate cw, cw
  [
    [1, 0],
    [0, 1],
    [0, -1],
    [-1, 0],
    [0, 1],
    [-1, 0],
    [1, 0],
    [0, -1]
  ], // small rotate cw, ccw
  [
    [0, 1],
    [-1, 0],
    [1, 0],
    [0, -1],
    [1, 0],
    [0, 1],
    [0, -1],
    [-1, 0]
  ], // small rotate ccw,cw
  [
    [0, 1],
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1],
    [-1, 0],
    [1, 0],
    [0, -1]
  ], // small rotate ccw,ccw
  [
    [1, 0],
    [0, 1],
    [0, -1],
    [0, 1],
    [0, -1],
    [0, 1],
    [0, -1],
    [-1, 0]
  ], // big rotate cw
  [
    [0, 1],
    [-1, 0],
    [0, 1],
    [0, -1],
    [0, 1],
    [0, -1],
    [1, 0],
    [0, -1]
  ], // big rotate ccw
  [
    [1, 3],
    [-1, 3],
    [0, -1],
    [0, -1],
    [0, -1],
    [0, -1],
    [0, -1],
    [0, -1]
  ], // top to bottom swap
  [
    [0, 1],
    [0, 1],
    [0, 1],
    [0, 1],
    [0, 1],
    [0, 1],
    [1, -3],
    [-1, -3]
  ], // bottom to top swap
  [
    [1, 0],
    [-1, 0],
    [1, 0],
    [-1, 0],
    [1, 0],
    [-1, 0],
    [1, 0],
    [-1, 0]
  ], // horizontal swap
  [
    [1, 1],
    [-1, 1],
    [1, -1],
    [-1, -1],
    [1, 1],
    [-1, 1],
    [1, -1],
    [-1, -1]
  ], // small diagonal swap
  [
    [1, 1],
    [0, 0],
    [1, 1],
    [-1, -1],
    [1, 1],
    [-1, -1],
    [0, 0],
    [-1, -1]
  ], // big diagonal swap tl/br
  [
    [0, 0],
    [-1, 1],
    [1, -1],
    [-1, 1],
    [1, -1],
    [-1, 1],
    [1, -1],
    [0, 0]
  ] // big diagonal swap bl/tr
];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const randomInt = (max) => Math.floor(Math.random() * max);
const randomPattern = () => PATTERNS[randomInt(PATTERNS.length)];

function getHueRotatedColor(hue) {
  const colors = {
    0: "#ff0000",
    45: "#ff8000",
    90: "#88ff00",
    135: "#80ff00",
    180: "#00ffff",
    225: "#0080ff",
    270: "#ff00ff",
    315: "#ff0080"
  };
  return colors[hue] || "#ff0000";
}

function resetKeyColors() {
  keys.forEach((key) => {
    key.style.filter = "";
  });
}

function executeMove(pattern, currentPos) {
  keys.forEach((key, i) => {
    const [dx, dy] = pattern[i];
    if (dx || dy) {
      key.animate(
        [
          { transform: "translate(0, 0)" },
          { transform: `translate(${dx * 20}vh, ${dy * 20}vh)` }
        ],
        {
          duration: CONFIG.MOVE_DURATION,
          easing: "ease-in-out"
        }
      );
    }
  });

  const [dx, dy] = pattern[currentPos];
  return (currentPos + dx + dy * 2 + 8) % 8;
}

async function highlightCorrectKey(index) {
  keys[index].style.filter = "hue-rotate(135deg) brightness(2)";
  await sleep(1000);
  keys[index].style.filter = "hue-rotate(0deg)";
  await sleep(1500);
}

async function shuffleKeys() {
  let currentPos = state.correctKey;

  for (let i = 0; i < CONFIG.SHUFFLE_MOVES; i++) {
    const pattern = randomPattern();
    currentPos = executeMove(pattern, currentPos);
    await sleep(CONFIG.MOVE_INTERVAL);
  }

  state.correctKey = currentPos;

  document.body.animate(
    [
      { backgroundColor: "rgba(255, 255, 255, 1)" },
      { backgroundColor: "rgba(16, 120, 206, 1)" }
    ],
    {
      duration: 1300,
      fill: "forwards"
    }
  );
}

async function transitionToRotary() {
  document.title = "Limbo"; 

  const spinPromises = keys.map((key, i) => {
    return new Promise(resolve => {
      setTimeout(() => {
        const hue = (i * 45) % 360;
        key.style.filter = `hue-rotate(${hue}deg) brightness(2)`;
        
        key.animate([
          { transform: "rotate(0deg) scale(1)" },
          { transform: "rotate(180deg) scale(1.1)" },
          { transform: "rotate(360deg) scale(1)" }
        ], {
          duration: 600,
          easing: "cubic-bezier(0.4, 0, 0.2, 1)",
          fill: "forwards"
        });
        
        setTimeout(resolve, 600);
      }, i * 80);
    });
  });
  
  await Promise.all(spinPromises);
  await sleep(20);
  
  const startPositions = Array.from(keys).map(key => {
    const rect = key.getBoundingClientRect();
    return { left: rect.left, top: rect.top };
  });
  
  container.className = "rotary-container";
  container.offsetHeight; 
  
  const endPositions = Array.from(keys).map(key => {
    const rect = key.getBoundingClientRect();
    return { left: rect.left, top: rect.top };
  });
  
  const duration = 2000; 
  keys.forEach((key, i) => {
    const deltaX = startPositions[i].left - endPositions[i].left;
    const deltaY = startPositions[i].top - endPositions[i].top;
    key.style.opacity = "1";
    key.animate([
      { transform: `translate(${deltaX}px, ${deltaY}px) rotate(0deg)`, opacity: 1 },
      { transform: `translate(0, 0) rotate(-90deg)`, opacity: 1 }
    ], {
      duration,
      easing: "cubic-bezier(0.4, 0, 0.2, 1)",
      fill: "forwards"
    });
  });
  
  container.animate([
    { transform: "rotate(0deg)" },
    { transform: "rotate(90deg)" }
  ], {
    duration,
    easing: "cubic-bezier(.17,.67,.7,.76)",
    fill: "forwards"
  });
  
  await sleep(duration);
  
  container.animate([
    { transform: "rotate(90deg)" },
    { transform: "rotate(450deg)" }
  ], {
    duration: CONFIG.ROTARY_SPEED,
    iterations: Infinity,
    easing: "linear"
  });
  
  keys.forEach(key => {
    key.animate([
      { transform: "rotate(-90deg)" },
      { transform: "rotate(-450deg)" }
    ], {
      duration: CONFIG.ROTARY_SPEED,
      iterations: Infinity,
      easing: "linear"
    });
  });
}

function startBlinking() {
  state.currentIndex = -1;

  state.blinkInterval = setInterval(() => {
    if (state.currentIndex >= 0) {
      const prevHue = (state.currentIndex * 45) % 360;
      const prevColor = getHueRotatedColor(prevHue);
      keys[
        state.currentIndex
      ].style.filter = `hue-rotate(${prevHue}deg)  brightness(1)`;
    }

    state.currentIndex = (state.currentIndex + 1) % 8;

    const currentHue = (state.currentIndex * 45) % 360;
    const currentColor = getHueRotatedColor(currentHue);
    keys[
      state.currentIndex
    ].style.filter = `hue-rotate(${currentHue}deg) brightness(5) saturate(3)`;
  }, CONFIG.BLINK_INTERVAL);

  state.selectionTimer = setTimeout(() => {
    stopGame();
    showResult(false);
  }, CONFIG.SELECTION_TIMEOUT);
}

function stopGame() {
  if (state.blinkInterval) {
    clearInterval(state.blinkInterval);
    state.blinkInterval = null;
  }
  if (state.selectionTimer) {
    clearTimeout(state.selectionTimer);
    state.selectionTimer = null;
  }
  document.body.onclick = null;
}

async function showResult(isCorrect) {
  if (isCorrect) {
    document.body.animate(
      [{ backgroundColor: "#0f0" }, { backgroundColor: "#000" }],
      { duration: 1000 }
    );

    keys[state.correctKey].style.filter =
      "hue-rotate(-120deg) brightness(2.5) saturate(2)";
    keys[state.correctKey].animate(
      [{ opacity: 1 }, { opacity: 0.5 }, { opacity: 1 }],
      { duration: 900 }
    );
  } else {
    document.body.animate(
      [{ backgroundColor: "rgba(255, 0, 0, 1)" }, { backgroundColor: "#000" }],
      { duration: 1000 }
    );

    if (state.correctKey >= 0) {
      keys[state.correctKey].style.filter = "hue-rotate(135deg) brightness(2)";
    }
  }

  await sleep(1200);
  location.reload();
}

function handleSelection() {
  stopGame();
  const isCorrect = state.currentIndex === state.correctKey;
  showResult(isCorrect);
}

async function startGame() {
  if (state.started) return;
  state.started = true;

  audio.play().catch(() => {});

  document.title = "FOCUS";

  resetKeyColors();
  container.classList.add("show");
  await sleep(2000);

  state.correctKey = randomInt(8);
  await highlightCorrectKey(state.correctKey);

  await shuffleKeys();
  await sleep(20);
  await transitionToRotary();

  startBlinking();
  document.body.onclick = handleSelection;
}

document.addEventListener("click", startGame, { once: true });
