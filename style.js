const rows = 6;
const cols = 7;
let board = [];
let currentPlayer = "red";
let gameOver = false;
let aiThinking = false;

const boardEl = document.getElementById("board");
const statusEl = document.getElementById("status");
const resetBtn = document.getElementById("resetBtn");

function createBoard() {
  boardEl.innerHTML = "";
  board = Array.from({ length: rows }, () => Array(cols).fill(""));
  gameOver = false;
  aiThinking = false;
  currentPlayer = "red";
  statusEl.textContent = "Your turn";
  statusEl.classList.remove("win");
  document.querySelectorAll(".confetti").forEach(el => el.remove());

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cell = document.createElement("div");
      cell.classList.add("cell");
      cell.dataset.row = r;
      cell.dataset.col = c;
      cell.addEventListener("click", () => dropPiece(c));
      boardEl.appendChild(cell);
    }
  }

  renderBoard();
}

function dropPiece(col) {
  if (gameOver || aiThinking || currentPlayer !== "red") return;

  const rowToFill = getAvailableRow(col);
  if (rowToFill === -1) return;

  placePiece(rowToFill, col, "red");

  if (checkGameEnd(rowToFill, col, "red", "You")) return;

  currentPlayer = "yellow";
  aiThinking = true;
  statusEl.textContent = "Computer is thinking...";

  setTimeout(() => {
    aiMove();
  }, 500);
}

function aiMove() {
  if (gameOver) return;

  const bestCol = getBestMove();
  const rowToFill = getAvailableRow(bestCol);

  if (rowToFill !== -1) {
    placePiece(rowToFill, bestCol, "yellow");

    if (checkGameEnd(rowToFill, bestCol, "yellow", "Computer")) return;
  }

  currentPlayer = "red";
  aiThinking = false;
  statusEl.textContent = "Your turn";
}

function getBestMove() {
  for (let col = 0; col < cols; col++) {
    const row = getAvailableRow(col);
    if (row !== -1) {
      board[row][col] = "yellow";
      const win = checkWin(row, col, "yellow");
      board[row][col] = "";
      if (win) return col;
    }
  }

  for (let col = 0; col < cols; col++) {
    const row = getAvailableRow(col);
    if (row !== -1) {
      board[row][col] = "red";
      const block = checkWin(row, col, "red");
      board[row][col] = "";
      if (block) return col;
    }
  }

  const validCols = [];
  for (let col = 0; col < cols; col++) {
    if (getAvailableRow(col) !== -1) validCols.push(col);
  }

  return validCols[Math.floor(Math.random() * validCols.length)];
}

function getAvailableRow(col) {
  for (let r = rows - 1; r >= 0; r--) {
    if (board[r][col] === "") return r;
  }
  return -1;
}

function placePiece(row, col, player) {
  board[row][col] = player;
  renderBoard();
}

function checkGameEnd(row, col, player, winnerName) {
  if (checkWin(row, col, player)) {
    statusEl.textContent = `${winnerName} wins! 🎉`;
    statusEl.classList.add("win");
    gameOver = true;
    aiThinking = false;
    celebrate();
    return true;
  }

  if (board.every(row => row.every(cell => cell !== ""))) {
    statusEl.textContent = "It's a draw!";
    gameOver = true;
    aiThinking = false;
    return true;
  }

  return false;
}

function renderBoard() {
  [...boardEl.children].forEach(cell => {
    const r = Number(cell.dataset.row);
    const c = Number(cell.dataset.col);
    cell.className = "cell";
    if (board[r][c]) cell.classList.add(board[r][c]);
  });
}

function checkWin(row, col, player) {
  return (
    countDirection(row, col, 0, 1, player) + countDirection(row, col, 0, -1, player) + 1 >= 4 ||
    countDirection(row, col, 1, 0, player) + countDirection(row, col, -1, 0, player) + 1 >= 4 ||
    countDirection(row, col, 1, 1, player) + countDirection(row, col, -1, -1, player) + 1 >= 4 ||
    countDirection(row, col, 1, -1, player) + countDirection(row, col, -1, 1, player) + 1 >= 4
  );
}

function countDirection(row, col, dr, dc, player) {
  let count = 0;
  let r = row + dr;
  let c = col + dc;

  while (r >= 0 && r < rows && c >= 0 && c < cols && board[r][c] === player) {
    count++;
    r += dr;
    c += dc;
  }

  return count;
}

function celebrate() {
  const colors = ["#ff4d4d", "#ffd93d", "#5c6ac4", "#22c55e", "#ff7ac6"];
  for (let i = 0; i < 40; i++) {
    const confetti = document.createElement("div");
    confetti.className = "confetti";
    confetti.style.left = Math.random() * 100 + "vw";
    confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
    confetti.style.animationDuration = 2 + Math.random() * 2 + "s";
    confetti.style.opacity = Math.random() * 0.8 + 0.2;
    confetti.style.transform = `translateY(0) rotate(${Math.random() * 180}deg)`;
    document.body.appendChild(confetti);
  }
}

resetBtn.addEventListener("click", createBoard);
createBoard();
