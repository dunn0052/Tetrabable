// Tetrabable

const canvas = document.createElement("canvas");
canvas.width = COLS * BLOCK_SIZE;
canvas.height = ROWS * BLOCK_SIZE + 60; // extra for score display
document.body.appendChild(canvas);
const ctx = canvas.getContext("2d");

const grid = Array.from({ length: ROWS }, () => Array(COLS).fill(null));

let gameOver = false;
let paused = false;
let totalScore = 0;

function findRightMostLetter(row) {
  for (let i = COLS - 1; i >= 0; i--) {
    if (row[i]) return row[i];
  }
  return null;
}

function randomLetter(prev = null) {
  if (prev && letterFrequency[prev]) {
    const freqs = letterFrequency[prev];
    const r = Math.floor(Math.random() * letterSum[prev]);
    currentProb = 0;
    for (let i = 0; i < freqs.length; i++) {
      currentProb += freqs[i];
      if (r < currentProb) return letters[i];
    }
  }
  return letters[Math.floor(Math.random() * letters.length)];
}

function drawGrid() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let y = 0; y < ROWS; y++) {
    const word = grid[y].map(cell => cell || "").join("");
    const validWord = dictionary.has(word);
    for (let x = 0; x < COLS; x++) {
      ctx.strokeStyle = x < 4 ? "#666" : "#ccc";
      ctx.strokeRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
      if (grid[y][x]) {
        const color = validWord ? "green" : "darkgray";
        drawBlock(x, y, grid[y][x], color);
      } else if (x >= 4) {
        ctx.fillStyle = "#f5f5f5";
        ctx.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
        ctx.strokeRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
        ctx.fillStyle = "black";
        ctx.font = "10px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "bottom";
        ctx.fillText("+" + (x - 3), x * BLOCK_SIZE + BLOCK_SIZE / 2, (y + 1) * BLOCK_SIZE - 2);
      }
    }
  }

  if (activeBlock) {
    drawBlock(activeBlock.x, activeBlock.y, activeBlock.letter, "gold");
  }

  if (gameOver) {
    ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    ctx.fillRect(0, 0, canvas.width, canvas.height - 40);
    ctx.fillStyle = "white";
    ctx.font = "30px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2 - 20);
  }

  ctx.fillStyle = "black";
  ctx.font = "16px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("Score: " + totalScore, canvas.width / 2, canvas.height - 10);
}

function drawBlock(x, y, letter, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
  ctx.strokeStyle = "#000";
  ctx.strokeRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
  ctx.fillStyle = "black";
  ctx.font = "20px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(letter, x * BLOCK_SIZE + BLOCK_SIZE / 2, y * BLOCK_SIZE + BLOCK_SIZE / 2);
  ctx.font = "10px sans-serif";
  ctx.textAlign = "right";
  ctx.fillText(letterScore[letter], (x + 1) * BLOCK_SIZE - 2, (y + 1) * BLOCK_SIZE - 5);
}

function canMove(x, y) {
  return x >= 0 && y >= 0 && y < ROWS && x < COLS && !grid[y][x];
}

function spawnNewBlock() {
  const randomCol = Math.floor(Math.random() * ROWS);
  const rightMost = findRightMostLetter(grid[randomCol]);
  activeBlock = {
    x: COLS - 1,
    y: Math.floor(ROWS / 2),
    letter: randomLetter(rightMost),
  };
}

function dropBlock() {
  if (gameOver || paused || !activeBlock) return;
  const nextX = activeBlock.x - 1;
  if (canMove(nextX, activeBlock.y)) {
    activeBlock.x = nextX;
  } else {
    grid[activeBlock.y][activeBlock.x] = activeBlock.letter;
    checkGameOver();
    if (!gameOver || !paused) spawnNewBlock();
  }
  drawGrid();
}

function checkGameOver() {
  for (let y = 0; y < ROWS; y++) {
    if (grid[y].every(cell => cell !== null)) {
      gameOver = true;
      break;
    }
  }
}

let activeBlock = null;

function initGridLeftColumn() {
  for (let y = 0; y < ROWS; y++) {
    grid[y][0] = randomLetter();
  }
}

function reset() {
  for (let y = 0; y < ROWS; y++) {
    grid[y] = Array(COLS).fill(null);
  }
  initGridLeftColumn();
  spawnNewBlock();
  drawGrid();
  totalScore = 0;
  gameOver = false;
  paused = false;
}

// ---- Initialize Game ----
setInterval(dropBlock, DROP_INTERVAL);
reset();

window.addEventListener("keydown", (e) => {
  if (gameOver) {
    if (e.code === "Space") {
      reset();
    } else {
      return;
    }
  }
  
  if(e.code === "Space") {
    paused = !paused;
  }

  if (paused) return;

  if (e.key === "Enter" && activeBlock) {
    const row = activeBlock.y;
    let rowScore = 0;
    let rowLen;
    let word = "";
    for (let x = 0; x < COLS; x++) {
      const letter = grid[row][x];
      if (letter) {
        word += letter;
        rowScore += letterScore[letter];
        rowLen += 1;
        if (x >= 4) rowScore += x - 3; // bonus
      }
    }
    if (dictionary.has(word)) {
      totalScore += rowScore;
    } else {
      totalScore -= rowScore;
    }
    grid[row] = Array(COLS).fill(null);
    grid[row][0] = randomLetter();
    checkGameOver();
    drawGrid();
    return;
  }

  if (!activeBlock) return;
  let newX = activeBlock.x;
  let newY = activeBlock.y;

  if (e.key === "ArrowLeft") newX--;
  else if (e.key === "ArrowUp") newY--;
  else if (e.key === "ArrowDown") newY++;
  else if (e.key === "ArrowRight") {
    totalScore -= 1;
    activeBlock = null;
    checkGameOver();
    if (!gameOver) spawnNewBlock();
    drawGrid();
    return;
  }

  if (canMove(newX, newY)) {
    activeBlock.x = newX;
    activeBlock.y = newY;
    drawGrid();
  }
});