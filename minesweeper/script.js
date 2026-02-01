(() => {
  const ROWS = 18;
  const COLS = 18;
  const MINES = 32;
  const TILE_SIZE = 32;

  const BAD_APPLE = new URLSearchParams(location.search).has("badapple");
  const BAD_APPLE_URL =
    "https://raw.githubusercontent.com/EyelessHairball/main/refs/heads/main/minesweeper/badapple/bad-apple.mp4";

  const faces = {
    smile:
      "https://raw.githubusercontent.com/EyelessHairball/images/main/minesweeper/face-smile.png",
    frown:
      "https://raw.githubusercontent.com/EyelessHairball/images/main/minesweeper/face-frown.png"
  };

  const sprites = {
    unknown:
      "https://raw.githubusercontent.com/EyelessHairball/images/main/minesweeper/TileUnknown.png",
    empty:
      "https://raw.githubusercontent.com/EyelessHairball/images/main/minesweeper/TileEmpty.png",
    exploded:
      "https://raw.githubusercontent.com/EyelessHairball/images/main/minesweeper/TileExploded.png",
    flag:
      "https://raw.githubusercontent.com/EyelessHairball/images/main/minesweeper/TileFlag.png",
    mine:
      "https://raw.githubusercontent.com/EyelessHairball/images/main/minesweeper/TileMine.png",

    numbers: [
      null,
      "https://raw.githubusercontent.com/EyelessHairball/images/main/minesweeper/Tile1.png",
      "https://raw.githubusercontent.com/EyelessHairball/images/main/minesweeper/Tile2.png",
      "https://raw.githubusercontent.com/EyelessHairball/images/main/minesweeper/Tile3.png",
      "https://raw.githubusercontent.com/EyelessHairball/images/main/minesweeper/Tile4.png",
      "https://raw.githubusercontent.com/EyelessHairball/images/main/minesweeper/Tile5.png",
      "https://raw.githubusercontent.com/EyelessHairball/images/main/minesweeper/Tile6.png",
      "https://raw.githubusercontent.com/EyelessHairball/images/main/minesweeper/Tile7.png",
      "https://raw.githubusercontent.com/EyelessHairball/images/main/minesweeper/Tile8.png"
    ]
  };

  const style = document.createElement("style");
  style.textContent = `
    @font-face {
      font-family: "Minesweeper";
      src: url("https://raw.githubusercontent.com/EyelessHairball/main/refs/heads/main/assets/fonts/minesweeper.otf");
    }
    
   #face-btn {
    width: 32px;
    height: 32px;
    background: #bdbdbd;
    border: 2px outset #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2px;
    cursor: pointer;
  }

  #face-btn:active {
    border: 2px inset #fff;
  }

  #face-btn img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    image-rendering: pixelated;
  }


    body {
      margin: 0;
      height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
      background: #c0c0c0;
      font-family: Minesweeper, monospace;
      user-select: none;
    }

    #game {
      background: #bdbdbd;
      padding: 8px;
      border: 3px outset #a8a8a8;
    }

    #top {
      display: flex;
      justify-content: space-between;
      padding: 4px;
      margin-bottom: 6px;
      background: #909090;
      border: 2px inset #7b7b7b;
    }

    .counter {
      background: black;
      color: red;
      font-size: 28px;
      padding: 2px 6px;
      min-width: 60px;
      text-align: center;
    }

    #board {
      display: grid;
      grid-template-columns: repeat(${COLS}, ${TILE_SIZE}px);
    }

    #board img {
      width: ${TILE_SIZE}px;
      height: ${TILE_SIZE}px;
      image-rendering: pixelated;
    }
  `;
  document.head.appendChild(style);

  const game = document.createElement("div");
  game.id = "game";

  const top = document.createElement("div");
  top.id = "top";

  const mineCounterEl = document.createElement("div");
  mineCounterEl.className = "counter";

  const timerEl = document.createElement("div");
  timerEl.className = "counter";

  const faceBtn = document.createElement("div");
  faceBtn.id = "face-btn";

  const faceImg = document.createElement("img");
  faceImg.src = faces.smile;

  faceBtn.appendChild(faceImg);
  faceBtn.addEventListener("click", createBoard);

  top.append(mineCounterEl, faceBtn, timerEl);

  const boardEl = document.createElement("div");
  boardEl.id = "board";

  game.append(top, boardEl);
  document.body.appendChild(game);

  let board = [];
  let flags = 0;
  let revealed = 0;
  let gameOver = false;
  let started = false;
  let time = 0;
  let timerInterval = null;

  const pad = (n) => {
    const sign = n < 0 ? "-" : "";
    return sign + Math.abs(n).toString().padStart(3, "0");
  };

  function startTimer() {
    if (timerInterval) return;
    started = true;
    timerInterval = setInterval(() => {
      if (time < 999) {
        time++;
        timerEl.textContent = pad(time);
      }
    }, 1000);
  }

  function stopTimer() {
    clearInterval(timerInterval);
    timerInterval = null;
  }

  function createBoard() {
    faceImg.src = faces.smile;
    stopTimer();

    board = [];
    boardEl.innerHTML = "";
    flags = 0;
    revealed = 0;
    gameOver = false;
    started = false;
    time = 0;

    timerEl.textContent = "000";
    mineCounterEl.textContent = pad(MINES);

    for (let r = 0; r < ROWS; r++) {
      board[r] = [];
      for (let c = 0; c < COLS; c++) {
        const img = document.createElement("img");
        img.src = sprites.unknown;

        const cell = {
          mine: false,
          revealed: false,
          flagged: false,
          adjacent: 0,
          img
        };

        img.addEventListener("mousedown", (e) => {
          if (gameOver || e.button !== 0) return;

          const cell = board[r][c];

          if (cell.revealed && cell.adjacent > 0) {
            let flagCount = 0;

            for (let dr = -1; dr <= 1; dr++) {
              for (let dc = -1; dc <= 1; dc++) {
                const nr = r + dr;
                const nc = c + dc;
                if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS) {
                  if (board[nr][nc].flagged) flagCount++;
                }
              }
            }

            if (flagCount === cell.adjacent) {
              for (let dr = -1; dr <= 1; dr++) {
                for (let dc = -1; dc <= 1; dc++) {
                  const nr = r + dr;
                  const nc = c + dc;
                  if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS) {
                    reveal(nr, nc);
                  }
                }
              }
            }

            return;
          }

          if (!cell.revealed && !cell.flagged) {
            reveal(r, c);
          }
        });

        img.addEventListener("contextmenu", (e) => {
          e.preventDefault();
          toggleFlag(r, c);
        });

        board[r][c] = cell;
        boardEl.appendChild(img);
      }
    }

    placeMines();
    calculateNumbers();

    if (BAD_APPLE) startBadApple();
  }

  function placeMines() {
    let placed = 0;
    while (placed < MINES) {
      const r = Math.floor(Math.random() * ROWS);
      const c = Math.floor(Math.random() * COLS);
      if (!board[r][c].mine) {
        board[r][c].mine = true;
        placed++;
      }
    }
  }

  function calculateNumbers() {
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (board[r][c].mine) continue;
        let count = 0;
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            const nr = r + dr;
            const nc = c + dc;
            if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS) {
              if (board[nr][nc].mine) count++;
            }
          }
        }
        board[r][c].adjacent = count;
      }
    }
  }

  function reveal(r, c) {
    if (gameOver) return;
    const cell = board[r][c];
    if (cell.revealed || cell.flagged) return;

    startTimer();
    cell.revealed = true;
    revealed++;

    if (cell.mine) {
      cell.img.src = sprites.exploded;
      endGame();
      return;
    }

    if (cell.adjacent === 0) {
      cell.img.src = sprites.empty;
      flood(r, c);
    } else {
      cell.img.src = sprites.numbers[cell.adjacent];
    }

    checkWin();
  }

  function flood(r, c) {
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        const nr = r + dr;
        const nc = c + dc;
        if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS) {
          const cell = board[nr][nc];
          if (!cell.revealed && !cell.mine && !cell.flagged) {
            reveal(nr, nc);
          }
        }
      }
    }
  }

  function toggleFlag(r, c) {
    if (gameOver) return;
    const cell = board[r][c];
    if (cell.revealed) return;

    cell.flagged = !cell.flagged;
    flags += cell.flagged ? 1 : -1;
    cell.img.src = cell.flagged ? sprites.flag : sprites.unknown;
    mineCounterEl.textContent = pad(MINES - flags);
  }

  function endGame() {
    faceImg.src = faces.frown;
    gameOver = true;
    stopTimer();
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (board[r][c].mine) {
          board[r][c].img.src = sprites.mine;
        }
      }
    }
  }

  function checkWin() {
    if (revealed === ROWS * COLS - MINES) {
      endGame();
    }
  }

  function startBadApple() {
    const video = document.createElement("video");
    video.src = BAD_APPLE_URL;
    video.muted = true;
    video.play();

    const canvas = document.createElement("canvas");
    canvas.width = COLS;
    canvas.height = ROWS;
    const ctx = canvas.getContext("2d");

    function render() {
      if (video.paused || video.ended) return;
      ctx.drawImage(video, 0, 0, COLS, ROWS);
      const data = ctx.getImageData(0, 0, COLS, ROWS).data;

      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          const i = (r * COLS + c) * 4;
          const brightness = data[i] + data[i + 1] + data[i + 2];
          board[r][c].img.src =
            brightness < 384 ? sprites.flag : sprites.unknown;
        }
      }

      requestAnimationFrame(render);
    }

    render();
  }

  document.addEventListener("keydown", (e) => {
    if (e.key === "r" || e.key === "R") {
      createBoard();
    }
  });

  createBoard();
})();
