import Grid from "./Grid.js"
//import Ai from "./Ai.js"  //TODO
//TODO: expand to 4by4 field

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
const BOARD_DIV = document.getElementById("board");
const WIN_SCREEN = document.getElementById("screen");
const WIN_SCREEN_MSG = document.getElementById("screen-msg");
const RESET_BUTTON = document.getElementById("reset");
const RESTART_BUTTON = document.getElementById("restart");
const INFO_CONTAINER = document.getElementById("info");
const SWITCH_BUTTON = document.getElementById("switch");

const GRID = new Grid(BOARD_DIV)
const CELLS = GRID.cells;

let playerClass = PLAYER1_CLASS;

//Messages
const WINNING_MSG = (currentPlayer) => `Player ${currentPlayer} has won!`;
const DRAW_MSG = `It's a Draw!`;
const TURN_MSG = (currentPlayer) => `It's ${currentPlayer}'s turn!`;
const PLAYER_IS = (playerClass) => `You are ${playerClass}!`;

//Max depth of the minimax algo.
const MAX_DEPTH = 12;

//All possible winning conditions for each playerClass.
const WIN_COMBINATIONS = [  //TODO Grid das übernehmen lassen (Element in cell z.B.)
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

const amountOfRowAndCols = 3;

//The board
let gameState;

let player1Turn;
/**
 * Set to undefined if the AI should be disabled. To enable the AI, set the value to either {@link PLAYER1_CLASS} or {@link PLAYER2_CLASS}.
 */
let aiSideClass = PLAYER2_CLASS;

startGame();

/**
 * Function to init and restart a game.
 */
function startGame() {
  //Player1 (X) is first
  player1Turn = true;
  //Reset Cells
  CELLS.forEach((cell) => {
    cell.cellElement.classList.remove(PLAYER1_CLASS);
    cell.cellElement.classList.remove(PLAYER2_CLASS);
    cell.cellElement.removeEventListener("click", onCellClickEvent);
    cell.cellElement.addEventListener("click", onCellClickEvent, { once: true });
  });

  gameState = [];

  for (let size = 0; size < amountOfRowAndCols; size++) {
    gameState.push([]);
  }

  //Reset gameState
  for (let i = 0; i < amountOfRowAndCols; i++) {
    for (let j = 0; j < amountOfRowAndCols; j++) {
      gameState[i][j] = "";
    }
  }
  //Init the Reset- and Restart-Button
  RESET_BUTTON.removeEventListener("click", onResetClickEvent);
  RESET_BUTTON.addEventListener("click", onResetClickEvent);
  RESTART_BUTTON.removeEventListener("click", onResetClickEvent);
  RESTART_BUTTON.addEventListener("click", onResetClickEvent);
  SWITCH_BUTTON.removeEventListener("click", onSwitchClickEvent);
  SWITCH_BUTTON.addEventListener("click", onSwitchClickEvent);
  SWITCH_BUTTON.innerHTML = PLAYER_IS(playerClass);

  //Hide the End-Screen
  WIN_SCREEN.classList.add("hide");

  setInfoText(TURN_MSG(PLAYER1_CLASS));
  //Let the X-AI to his move.
  if (aiSideClass === getCurrentTurnClass()) playAI(gameState);
}

/**
 * Handles a click on a Cell.
 * If there is not a Draw or a Winner the turn is been swapped.
 * @param {Object} oEvent An Event-Object
 */
function onCellClickEvent(oEvent) {
  const cellElement = oEvent.currentTarget;
  const cell = GRID.getCellByElement(cellElement);
  const row = cell.y;
  const col = cell.x;
  const currentPlayerClass = getCurrentTurnClass();
  if (isCellEmpty(gameState, row, col))
    doMove(gameState, row, col, currentPlayerClass, cell.cellElement);
}

/**
 * Switch the sides.
 * @param {Object} oEvent
 */
function onSwitchClickEvent(oEvent) {
  playerClass = getOpponentClass(playerClass);
  aiSideClass = getOpponentClass(playerClass);
  startGame();
}

/**
 * Function to do a Move.
 * @param {Array[][]} board The current board
 * @param {*} row The row, in which a mark should be placed
 * @param {*} col The column, in which a mark should be placed
 * @param {*} currentPlayerClass The class for the mark.
 * @param {*} target The target-cell.
 */
function doMove(board, row, col, currentPlayerClass, target) {
  placeMark(board, row, col, currentPlayerClass, target);
  if (checkForWin(gameState, currentPlayerClass)) {
    endGame(false);
  } else if (checkForDraw(gameState)) {
    endGame(true);
  } else {
    setInfoText(TURN_MSG(getOpponentClass(currentPlayerClass)));
    swapTurn(gameState);
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
 * @param {*} currentPlayerClass The Class of the Current Player.
 * @param {*} target The target HTMl-Object.
 */
function placeMark(board, row, col, currentPlayerClass, target) {
  board[row][col] = currentPlayerClass;
  target.classList.add(currentPlayerClass);
}

/**
 * Returns the class of the playerClass based on the variable {@link player1Turn}.
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
  return [Math.floor(idx / amountOfRowAndCols), idx % amountOfRowAndCols];
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
function swapTurn(board) {
  player1Turn = !player1Turn;
  if (getCurrentTurnClass() === aiSideClass) playAI(board);
}

/**
 * Let the AI do his turn.
 */
function playAI(board) {
  let move = findBestMove(gameState);
  doMove(
    board,
    move.row,
    move.col,
    aiSideClass,
    CELLS[move.col + move.row * amountOfRowAndCols].cellElement
  );
}

/**
 * The static evaluation of the current board state.
 * +50 if {@link PLAYER1_CLASS} and -50 if {@link PLAYER2_CLASS} would win.
 * We reduce the scores by the amount of the depth, so that the AI chooses the faster way to victory if there are multiple ways.
 * @param {Array[][]} board
 * @param {number} depth
 * @returns The state described above.
 */
function staticEval(board, depth) {
  if (checkForWin(board, PLAYER1_CLASS)) {
    return 15 + depth;
  } else if (checkForWin(board, PLAYER2_CLASS)) {
    return -15 - depth;
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
  for (let i = 0; i < amountOfRowAndCols; i++) {
    for (let j = 0; j < amountOfRowAndCols; j++) {
      if (isCellEmpty(board, i, j)) {
        moves.push(new Move(i, j));
      }
    }
  }
  return moves;
}

/**
 * Implementation of the minimax algorithm with alpha-beta pruning.
 * {@link PLAYER1_CLASS} is trying to maximize and {@link PLAYER2_CLASS} to minimize his score.
 * @param {Array[][]} board The current Board
 * @param {*} depth The current Depth in the tree. If 0 we break.
 * @param {*} alpha The minimum score that the maximizing playerClass is assured.
 * @param {*} beta The maximum score that the minimizing playerClass is assured.
 * @param {*} maximizingPlayer Maximizing or minimizing playerClass
 * @returns
 */
function minimax(board, depth, alpha, beta, maximizingPlayer) {
  let boardVal = staticEval(board, depth);
  //Return the static Evaluation of the Board if we reached the maximum depth or the GameOver is over.
  if (Math.abs(boardVal) > 0 || depth == 0 || isGameOver(board))
    return boardVal;

  if (maximizingPlayer) {
    //Worst value for the maximizing playerClass
    let maxEval = -Infinity;

    for (let move of possibleMoves(board)) {
      //Do the move
      board[move.row][move.col] = PLAYER1_CLASS;
      //Recursive call to switch the playerClass.
      let evaluation = minimax(board, depth - 1, alpha, beta, false);
      //Undo the move
      board[move.row][move.col] = "";

      //Update the values
      maxEval = Math.max(maxEval, evaluation);
      alpha = Math.max(alpha, evaluation);
      //Prune if there is already a better solution for the minimizing playerClass.
      if (beta <= alpha) break;
    }

    return maxEval;
  } else {
    //Worst value for the minimizing playerClass
    let minEval = Infinity;

    for (let move of possibleMoves(board)) {
      //Do the move
      board[move.row][move.col] = PLAYER2_CLASS;
      //Recursive call to switch the playerClass.
      let evaluation = minimax(board, depth - 1, alpha, beta, true);
      //Undo the move
      board[move.row][move.col] = "";

      //Update the values
      minEval = Math.min(minEval, evaluation);
      beta = Math.min(beta, evaluation);

      //Prune if there is already a better solution for the maximizing playerClass.
      if (beta <= alpha) break;
    }

    return minEval;
  }
}

/**
 * Function, which finds the best move for an AI using the minmax-Algorithm.
 * @param {Array[][]} board
 * @returns A Move-Object with the best move.
 */
function findBestMove(board) {
  let bestMove = new Move(-1, -1);
  let bestValue = aiSideClass === PLAYER2_CLASS ? Infinity : -Infinity;
  let possible = possibleMoves(board);
  if (possible.length === 9) {
    let col = Math.floor(Math.random() * amountOfRowAndCols);
    let row = Math.floor(Math.random() * amountOfRowAndCols);
    bestMove.col = col;
    bestMove.row = row;
  } else {
    for (let move of possible) {
      board[move.row][move.col] = aiSideClass;
      let evaluation = minimax(
        board,
        MAX_DEPTH,
        -Infinity,
        Infinity,
        aiSideClass === PLAYER2_CLASS
      );
      board[move.row][move.col] = "";
      if (
        (aiSideClass === PLAYER2_CLASS && evaluation < bestValue) ||
        (aiSideClass !== PLAYER2_CLASS && evaluation > bestValue)
      ) {
        bestMove.row = move.row;
        bestMove.col = move.col;
        bestValue = evaluation;
      }
    }
  }
  return bestMove;
}
