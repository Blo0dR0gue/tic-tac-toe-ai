/**
 * A Object, which holds the row and column of a new Move
 */
class Move {
  constructor(row, col) {
    this.row = row;
    this.col = col;
  }
}

//The CSS-Classes for each Player
const PLAYER1_CLASS = "x";
const PLAYER2_CLASS = "o";

//Needed HTML-Elements
const CELLS = document.querySelectorAll(".cell");
const BOARD_DIV = document.getElementById("board");
const WIN_SCREEN = document.getElementById("screen");
const WIN_SCREEN_MSG = document.getElementById("screen-msg");
const RESET_BUTTON = document.getElementById("reset");
const RESTART_BUTTON = document.getElementById("restart");
const INFO_CONTAINER = document.getElementById("info");

//Messages
const WINNING_MSG = (currentPlayer) => `Player ${currentPlayer} has won!`;
const DRAW_MSG = `It's a Draw!`;
const TURN_MSG = (currentPlayer) => `It's ${currentPlayer}'s turn!`;

//All possible winning conditions for each player.
const WIN_COMBINATIONS = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

//The board
let gameState = [
  ["", "", ""],
  ["", "", ""],
  ["", "", ""],
];

let player1Turn;

startGame();

/**
 * Function to init and restart a game.
 */
function startGame() {
  //Player1 (X) is first
  player1Turn = true;
  //Reset Cells
  CELLS.forEach((cell) => {
    cell.classList.remove(PLAYER1_CLASS);
    cell.classList.remove(PLAYER2_CLASS);
    cell.removeEventListener("click", onCellClickEvent);
    cell.addEventListener("click", onCellClickEvent, { once: true });
  });
  //Reset gameState
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      gameState[i][j] = "";
    }
  }
  //Init the Reset- and Restart-Button
  RESET_BUTTON.removeEventListener("click", onResetClickEvent);
  RESET_BUTTON.addEventListener("click", onResetClickEvent);
  RESTART_BUTTON.removeEventListener("click", onResetClickEvent);
  RESTART_BUTTON.addEventListener("click", onResetClickEvent);

  //Hide the End-Screen
  WIN_SCREEN.classList.add("hide");

  setInfoText(TURN_MSG(PLAYER1_CLASS));
}

/**
 * Handles a click on a Cell.
 * If there is not a Draw or a Winner the turn is been swapped.
 * @param {Object} oEvent An Event-Object
 */
function onCellClickEvent(oEvent) {
  const cell = oEvent.target;
  const idx = [].indexOf.call(CELLS, cell);
  const [row, col] = idxToColAndRow(idx);
  const currentPlayer = getCurrentTurnClass();
  placeMark(gameState, row, col, currentPlayer, cell);
  if (checkForWin(gameState, currentPlayer)) {
    endGame(false);
  } else if (checkForDraw(gameState)) {
    endGame(true);
  } else {
    swapTurn();
    setInfoText(TURN_MSG(getOpponentClass(currentPlayer)));
  }
}

/**
 * Handles the click on both the Reset- and Restart-Button.
 * @param {Object} oEvent An Event-Object
 */
function onResetClickEvent(oEvent) {
  startGame();
}

/**
 * Places a Mark on the HTML and the internal board.
 * @param {Array[][]} board The current Board.
 * @param {*} row  The Row in which the new Mark should be placed.
 * @param {*} col  The Column in which the new Mark should be placed.
 * @param {*} currentPlayer The Class of the Current Player.
 * @param {*} target The target HTMl-Object.
 */
function placeMark(board, row, col, currentPlayer, target) {
  board[row][col] = currentPlayer;
  target.classList.add(currentPlayer);
}

/**
 * Returns the class of the player based on the variable {@link player1Turn}.
 * @returns Either {@link PLAYER1_CLASS} or {@link PLAYER2_CLASS}
 */
function getCurrentTurnClass() {
  return player1Turn ? PLAYER1_CLASS : PLAYER2_CLASS;
}

/**
 * Returns the Class of the Opponent Player based on the variable {@link player1Turn}.
 * @param {string} currentPlayer
 * @returns Either {@link PLAYER1_CLASS} or {@link PLAYER2_CLASS}
 */
function getOpponentClass(currentPlayer) {
  return currentPlayer === PLAYER1_CLASS ? PLAYER2_CLASS : PLAYER1_CLASS;
}

/**
 * Sets the Info-Text above the field.
 * @param {string} infoText
 */
function setInfoText(infoText) {
  INFO_CONTAINER.innerHTML = infoText;
}

/**
 * Handles the End of a Game.
 * @param {boolean} isDraw true if the game was a draw.
 */
function endGame(isDraw) {
  if (isDraw) {
    WIN_SCREEN_MSG.innerHTML = DRAW_MSG;
  } else {
    WIN_SCREEN_MSG.innerHTML = WINNING_MSG(getCurrentTurnClass());
  }
  WIN_SCREEN.classList.remove("hide");
}

/**
 * Returns the Column and the Row of a specific cell index.
 * @param {number} idx
 * @returns {Array} arr[0] = row, arr[1] = col
 */
function idxToColAndRow(idx) {
  return [Math.floor(idx / 3), idx % 3];
}

/**
 * Checks if a Player has won.
 * @param {*} board The current Board.
 * @param {*} currentPlayer The Class of the Player whose turn it is .
 * @returns
 */
function checkForWin(board, currentPlayer) {
  return WIN_COMBINATIONS.some((comb) => {
    return comb.every((idx) => {
      const [row, col] = idxToColAndRow(idx);
      return board[row][col] === currentPlayer;
    });
  });
}

/**
 * Checks if the Game is over.
 * @param {Array[][]} board
 * @returns
 */
function isGameOver(board) {
  return (
    checkForWin(board, PLAYER1_CLASS) ||
    checkForWin(board, PLAYER2_CLASS) ||
    checkForDraw(board)
  );
}

/**
 * Checks whether the game ended in a draw.
 * @param {Array[][]} board
 * @returns
 */
function checkForDraw(board) {
  return board.every((row) => {
    return row.every((cell) => {
      return cell !== "";
    });
  });
}

/**
 * Changes the Turns. (Manipulates the variable {@link player1Turn})
 */
function swapTurn() {
  player1Turn = !player1Turn;
}

/**
 * The static evaluation of the current board state.
 * +10 if Player1 would win.
 * -10 if Player2 would win.
 * In every other case 0;
 * @param {Array[][]} board
 * @returns The state described above.
 */
function staticEval(board) {
  if (checkForWin(board, PLAYER1_CLASS)) {
    return +10;
  } else if (checkForWin(board, PLAYER2_CLASS)) {
    return -10;
  }
  return 0;
}

/**
 * Checks if the Cell at this coords is empty or not.
 * @param {Array[][]} board
 * @param {number} row
 * @param {number} col
 * @returns true if the cell is empty.
 */
function isCellEmpty(board, row, col) {
  return board[row][col] === "";
}
/**
 * Returns all possible moves in an array.
 * @param {Array[]} board
 * @returns An array with possible {@link Move}-Objects.
 */
function possibleMoves(board) {
  let moves = [];
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (isCellEmpty(board, i, j)) {
        moves.push(new Move(i, j));
      }
    }
  }
  return moves;
}

function minimax(board, depth, alpha, beta, maximizingPlayer) {
  return 1;
}

function findBestMove(board) {
  let bestMove = new Move(-1, -1);
  let bestValue = -Infinity;
  for (let move of possibleMoves(board)) {
    board[move.row][move.col] = PLAYER2_CLASS;
    let eval = minimax(board, MAX_DEPTH, -Infinity, Infinity, false);
    board[move.row][move.col] = "";
    if (eval > bestValue) {
      bestMove.row = move.row;
      bestMove.col = move.col;
      bestValue = eval;
    }
  }
  return bestMove;
}
