const gameContainer = document.getElementById("gameContainer");
const bird = document.getElementById("bird");
const startButton = document.getElementById("startButton");
const scoreLabel = document.getElementById("scoreLabel");

const sound25Points = new Audio(
  "https://raw.githubusercontent.com/EyelessHairball/soundeffects/main/25points.ogg"
);

const soundPoint = new Audio(
  "https://raw.githubusercontent.com/EyelessHairball/soundeffects/main/Point.ogg"
);

const soundHurt = new Audio(
  "https://raw.githubusercontent.com/EyelessHairball/soundeffects/main/Hurt.ogg"
);

const soundJump = new Audio(
  "https://raw.githubusercontent.com/EyelessHairball/soundeffects/main/Jump.ogg"
);

let pipes = [];
let isPlaying = false;
let canRestart = false;
let score = 0;
let highscore = 0;
let gravity = 0.001;
let flapPower = -0.02;
let velocity = 0;
let birdYScale = 0.5;
let pipeSpawnTime = 2000;
let pipeSpeed = 0.01;
let justFlapped = false;
let lastTime = 0;
let timeSincePipe = 0;
let lastPipeSpawn = 0;

function loadHighscore() {
  const saved = localStorage.getItem("flappyBirdHighscore");
  if (saved) {
    highscore = parseInt(saved);
  }
}

function saveHighscore(newScore) {
  if (newScore > highscore) {
    highscore = newScore;
    localStorage.setItem("flappyBirdHighscore", highscore);
  }
}

function playSound(audio) {
  // Clone the audio to allow overlapping sounds
  const sound = audio.cloneNode();
  sound.play().catch((err) => console.log("Audio play failed:", err));
}

function spawnPipe() {
  const frameHeight = gameContainer.clientHeight;
  const pipeGap = frameHeight * 0.5;
  const topHeight = Math.random() * (frameHeight * 0.4) + frameHeight * 0.15;

  const topPipe = document.createElement("div");
  topPipe.className = "pipe";
  topPipe.style.height = topHeight + "px";
  topPipe.style.width = "50px";
  topPipe.style.left = "100%";
  topPipe.style.top = "0";

  const bottomPipe = document.createElement("div");
  bottomPipe.className = "pipe";
  bottomPipe.style.height = frameHeight - topHeight - pipeGap + "px";
  bottomPipe.style.width = "50px";
  bottomPipe.style.left = "100%";
  bottomPipe.style.top = topHeight + pipeGap + "px";

  gameContainer.appendChild(topPipe);
  gameContainer.appendChild(bottomPipe);

  pipes.push({ top: topPipe, bottom: bottomPipe, scored: false });
}

function resetGame() {
  pipes.forEach((pipe) => {
    if (pipe.top.parentNode) pipe.top.remove();
    if (pipe.bottom.parentNode) pipe.bottom.remove();
  });
  pipes = [];
  birdYScale = 0.5;
  velocity = 0;
  score = 0;
  scoreLabel.textContent = "Score: 0";
  isPlaying = true;
  canRestart = false;
  bird.style.transform = "rotate(0deg)";
  bird.style.top = birdYScale * 100 + "%";
  bird.classList.remove("hidden");
  scoreLabel.style.display = "block";
  lastPipeSpawn = performance.now();
}

function endGame() {
  if (isPlaying) {
    isPlaying = false;
    canRestart = true;
    saveHighscore(score);
    playSound(soundHurt);
  }
}

function checkCollision(birdRect, pipeRect) {
  return (
    birdRect.left < pipeRect.right &&
    birdRect.right > pipeRect.left &&
    birdRect.top < pipeRect.bottom &&
    birdRect.bottom > pipeRect.top
  );
}

function updateGame(dt) {
  if (!isPlaying) return;

  velocity += gravity;
  birdYScale += velocity;
  bird.style.top = birdYScale * 100 + "%";

  if (justFlapped) {
    bird.style.transform = "rotate(-35deg)";
    justFlapped = false;
  } else {
    const targetRot = Math.max(-45, Math.min(90, velocity * 3000));
    const currentRot =
      parseFloat(bird.style.transform.replace(/[^-\d.]/g, "")) || 0;
    const newRot = currentRot + (targetRot - currentRot) * 0.2;
    bird.style.transform = `rotate(${newRot}deg)`;
  }

  if (birdYScale < 0 || birdYScale > 1) {
    endGame();
  }

  const birdRect = bird.getBoundingClientRect();

  for (let i = pipes.length - 1; i >= 0; i--) {
    const pipe = pipes[i];
    const currentLeft = parseFloat(pipe.top.style.left);
    const newLeft = currentLeft - pipeSpeed * 100;

    pipe.top.style.left = newLeft + "%";
    pipe.bottom.style.left = newLeft + "%";

    const topRect = pipe.top.getBoundingClientRect();
    const bottomRect = pipe.bottom.getBoundingClientRect();

    if (
      checkCollision(birdRect, topRect) ||
      checkCollision(birdRect, bottomRect)
    ) {
      endGame();
    }

    if (newLeft < -10) {
      pipe.top.remove();
      pipe.bottom.remove();
      pipes.splice(i, 1);

      score += 1;
      scoreLabel.textContent = "Score: " + score;

      // Play appropriate sound based on score milestone
      if (score === 25 || score === 50 || score === 100) {
        playSound(sound25Points);
      } else {
        playSound(soundPoint);
      }
    }
  }
}

function gameLoop(currentTime) {
  const dt = currentTime - lastTime;
  lastTime = currentTime;

  if (isPlaying) {
    if (currentTime - lastPipeSpawn > pipeSpawnTime) {
      spawnPipe();
      lastPipeSpawn = currentTime;
    }
  }

  updateGame(dt / 1000);
  requestAnimationFrame(gameLoop);
}

function handleInput() {
  if (isPlaying) {
    velocity = flapPower;
    justFlapped = true;
    playSound(soundJump);
  } else if (canRestart) {
    resetGame();
  }
}

document.addEventListener("keydown", (e) => {
  if (e.code === "Space" || e.key === " ") {
    e.preventDefault();
    handleInput();
  }
});

document.addEventListener("click", (e) => {
  if (e.target !== startButton) {
    handleInput();
  }
});

document.addEventListener("touchstart", (e) => {
  if (e.target !== startButton) {
    e.preventDefault();
    handleInput();
  }
});

startButton.addEventListener("click", () => {
  startButton.classList.add("hidden");
  resetGame();
});

loadHighscore();
requestAnimationFrame(gameLoop);
