// Lextris-style Game Template
const COLS = 10;
const ROWS = 5;
const BLOCK_SIZE = 40; // pixels
const DROP_INTERVAL = 1000; // ms

const canvas = document.createElement("canvas");
canvas.width = COLS * BLOCK_SIZE;
canvas.height = ROWS * BLOCK_SIZE;
document.body.appendChild(canvas);
const ctx = canvas.getContext("2d");

const grid = Array.from({ length: ROWS }, () => Array(COLS).fill(null));

// Integer-based letter frequency mapping
const letterFrequency = {
    A: [32, 2114, 5516, 7224, 8888, 9283, 10789, 10996, 12282, 12345, 12817, 18887, 20912, 27772, 27830, 29585, 29646, 35191, 37895, 44831, 45833, 46491, 46832, 47024, 47512, 47726],
    B: [1573, 1838, 1862, 1927, 3430, 3442, 3448, 3466, 4916, 4960, 4964, 7059, 7086, 7112, 8427, 8433, 8433, 9438, 9709, 9783, 10654, 10667, 10679, 10679, 10806, 10806],
    C: [3730, 3738, 4176, 4186, 7471, 7473, 7474, 10636, 12619, 12619, 13847, 14730, 14737, 14762, 18955, 18960, 18999, 20324, 20502, 22394, 23825, 23825, 23827, 23827, 24434, 24445],
    D: [2028, 2097, 2141, 2439, 6229, 6303, 6489, 6572, 9820, 9877, 9881, 10353, 10463, 10610, 11873, 11903, 11906, 12707, 13010, 13047, 13700, 13788, 13886, 13886, 14175, 14183],
    E: [2993, 3478, 5605, 10477, 11687, 12362, 13102, 13308, 13904, 13965, 14068, 17325, 19177, 25845, 26519, 27819, 28002, 37912, 43472, 46321, 46907, 47549, 47941, 48869, 49192, 49279],
    F: [787, 801, 821, 832, 1707, 2303, 2312, 2318, 3578, 3579, 3582, 4268, 4275, 4286, 5261, 5273, 5273, 5786, 5814, 6060, 6779, 6779, 6789, 6789, 6918, 6918],
    G: [1294, 1327, 1337, 1355, 3377, 3403, 3714, 4325, 5513, 5515, 5521, 6348, 6465, 6957, 7781, 7796, 7796, 9053, 9217, 9263, 10007, 10009, 10044, 10044, 10438, 10440],
    H: [2333, 2392, 2410, 2438, 5339, 5392, 5403, 5420, 7618, 7621, 7629, 7889, 8026, 8149, 10384, 10412, 10413, 11002, 11048, 11521, 12081, 12083, 12150, 12150, 13148, 13150],
    I: [3435, 4254, 9275, 11847, 13209, 14149, 15485, 15525, 15672, 15696, 15950, 18809, 20384, 29820, 34192, 35254, 35363, 36731, 42213, 46394, 46935, 48432, 48453, 48592, 48604, 49307],
    J: [236, 236, 236, 236, 420, 420, 420, 423, 487, 489, 489, 490, 491, 492, 687, 688, 688, 689, 689, 689, 1004, 1004, 1004, 1004, 1005, 1005],
    K: [339, 392, 412, 426, 1555, 1581, 1590, 1659, 2292, 2298, 2318, 2511, 2547, 2689, 2800, 2828, 2829, 2884, 3088, 3122, 3192, 3194, 3249, 3249, 3369, 3369],
    L: [4133, 4270, 4477, 4933, 10900, 11159, 11305, 11356, 16228, 16234, 16386, 19552, 19776, 19919, 22970, 23156, 23161, 23193, 23508, 24118, 25407, 25603, 25658, 25659, 28690, 28695],
    M: [3403, 4210, 4231, 4243, 7345, 7398, 7400, 7414, 9839, 9842, 9844, 9909, 10482, 10666, 12605, 13923, 13929, 13948, 14069, 14085, 14835, 14846, 14864, 14864, 15318, 15318],
    N: [3026, 3204, 5641, 8306, 13237, 13746, 17863, 18060, 21245, 21329, 21686, 21900, 22065, 22740, 24885, 25092, 25181, 25397, 27226, 32366, 33030, 33306, 33444, 33470, 33804, 33865],
    O: [575, 1356, 2918, 4096, 4439, 4754, 6141, 6260, 6982, 7009, 7304, 10022, 12540, 20327, 21544, 23704, 23774, 28784, 30899, 32732, 35825, 36506, 37351, 37608, 37807, 37900],
    P: [2014, 2041, 2057, 2069, 4873, 4902, 4909, 6921, 8636, 8641, 8655, 9814, 9845, 9895, 11875, 12535, 12535, 14629, 15148, 15953, 16676, 16677, 16699, 16699, 16923, 16924],
    Q: [5, 5, 5, 5, 7, 8, 8, 8, 14, 14, 14, 14, 14, 14, 15, 15, 16, 16, 16, 16, 1122, 1122, 1122, 1122, 1122, 1122],
    R: [5751, 6240, 7103, 8120, 14265, 14496, 15062, 15327, 20932, 20955, 21287, 21707, 22781, 23551, 28114, 28628, 28651, 29614, 30669, 32345, 33656, 33965, 34070, 34072, 35522, 35535],
    S: [1580, 1676, 3351, 3400, 6472, 6540, 6588, 8518, 11565, 11586, 11906, 12571, 13606, 14001, 15473, 16889, 17050, 17092, 20535, 25867, 27242, 27263, 27481, 27481, 27929, 27932],
    T: [3585, 3677, 3968, 3986, 11096, 11238, 11281, 13911, 22105, 22113, 22120, 22782, 22917, 23038, 25984, 26025, 26032, 29174, 29587, 30577, 32125, 32136, 32294, 32294, 33749, 33800],
    U: [779, 1428, 2222, 2798, 3521, 3704, 4171, 4182, 4969, 4989, 5055, 7222, 9037, 12609, 12818, 13454, 13461, 16041, 20123, 21572, 21591, 21689, 21696, 21786, 21810, 21852],
    V: [888, 888, 888, 888, 3757, 3757, 3759, 3759, 5086, 5086, 5086, 5092, 5092, 5097, 5558, 5558, 5558, 5581, 5585, 5585, 5676, 5682, 5683, 5683, 5717, 5717],
    W: [766, 809, 822, 868, 1548, 1584, 1593, 1880, 2451, 2452, 2479, 2585, 2608, 2815, 3367, 3384, 3384, 3511, 3604, 3631, 3637, 3637, 3652, 3652, 3676, 3679],
    X: [143, 146, 263, 263, 409, 416, 418, 450, 772, 772, 772, 785, 790, 792, 891, 1098, 1101, 1104, 1113, 1312, 1369, 1372, 
    1377, 1378, 1457, 1458],
    Y: [334, 410, 811, 978, 1256, 1285, 1413, 1454, 1602, 1603, 1612, 2066, 2420, 2706, 2923, 3323, 3324, 3612, 4059, 4340, 4385, 4388, 4433, 4485, 4486, 4511],
    Z: [358, 362, 362, 366, 906, 906, 908, 913, 1095, 1095, 1096, 1140, 1141, 1143, 1361, 1361, 1361, 1362, 1363, 1367, 1384, 1386, 1390, 1390, 1449, 1542]
};

const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const MAX_FREQ = 50000;

const letterScore = {
  A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, I: 0, J: 0, K: 0, L: 0, M: 0,
  N: 0, O: 0, P: 0, Q: 0, R: 0, S: 0, T: 0, U: 0, V: 0, W: 0, X: 0, Y: 0, Z: 0
};

const dictionary = new Set(["TEST", "WORD", "HELLO"]); // Add more words as needed
let gameOver = false;

function checkAndClearWords() {
  for (let y = 0; y < ROWS; y++) {
    const rowWord = grid[y].join("");
    if (dictionary.has(rowWord)) {
      grid[y] = Array(COLS).fill(null);
      const randomRow = Math.floor(Math.random() * ROWS);
      const rightMost = findRightMostLetter(grid[randomRow]);
      grid[randomRow][0] = randomLetter(rightMost);
    }
  }
}

function findRightMostLetter(row) {
  for (let i = COLS - 1; i >= 0; i--) {
    if (row[i]) return row[i];
  }
  return null;
}

function randomLetter(prev = null) {
  if (prev && letterFrequency[prev]) {
    const freqs = letterFrequency[prev];
    const r = Math.floor(Math.random() * MAX_FREQ);
    for (let i = 0; i < freqs.length; i++) {
      if (r < freqs[i]) return letters[i];
    }
  }
  return letters[Math.floor(Math.random() * letters.length)];
}

function drawGrid() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      ctx.strokeStyle = x < 4 ? "#666" : "#ccc";
      ctx.strokeRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);

      if (grid[y][x]) {
        drawBlock(x, y, grid[y][x], "red");
      }
    }
  }

  // Draw score labels for extra columns
  ctx.fillStyle = "black";
  ctx.font = "10px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  for (let x = 4; x < COLS; x++) {
    ctx.fillText("+" + (x - 3), x * BLOCK_SIZE + BLOCK_SIZE / 2, 2);
  }

  if (activeBlock) {
    drawBlock(activeBlock.x, activeBlock.y, activeBlock.letter, "darkred");
  }

  if (gameOver) {
    ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "white";
    ctx.font = "30px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2);
  }
}

function drawBlock(x, y, letter, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
  ctx.strokeStyle = "#000";
  ctx.strokeRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
  ctx.fillStyle = "white";
  ctx.font = "20px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(letter, x * BLOCK_SIZE + BLOCK_SIZE / 2, y * BLOCK_SIZE + BLOCK_SIZE / 2);
  ctx.font = "10px sans-serif";
  ctx.textAlign = "right";
  ctx.fillText(letterScore[letter], (x + 1) * BLOCK_SIZE - 2, (y + 1) * BLOCK_SIZE - 2);
}

function canMove(x, y) {
  return x >= 0 && y >= 0 && y < ROWS && x < COLS && !grid[y][x];
}

function spawnNewBlock() {
  const randomCol = Math.floor(Math.random() * ROWS);
  const rightMost = findRightMostLetter(grid[randomCol]);
  activeBlock = {
    x: COLS - 1,
    y: randomCol,
    letter: randomLetter(rightMost),
  };
}

function dropBlock() {
  if (gameOver || !activeBlock) return;
  const nextX = activeBlock.x - 1;
  if (canMove(nextX, activeBlock.y)) {
    activeBlock.x = nextX;
  } else {
    grid[activeBlock.y][activeBlock.x] = activeBlock.letter;
    checkAndClearWords();
    checkGameOver();
    if (!gameOver) spawnNewBlock();
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

initGridLeftColumn();
spawnNewBlock();
drawGrid();
setInterval(dropBlock, DROP_INTERVAL);

window.addEventListener("keydown", (e) => {
  if (gameOver) return;

  if (e.key === "Enter" && activeBlock) {
    const row = activeBlock.y;
    grid[row] = Array(COLS).fill(null);
    grid[row][0] = randomLetter();
    spawnNewBlock();
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