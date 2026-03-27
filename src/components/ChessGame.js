import React, { useEffect, useRef } from 'react';
import { Box, Button, Grid, HStack, Stack, Tag, Text } from '@chakra-ui/react';

const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
const BACK_RANK = ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'];
const BOARD_COLORS = {
    light: '#d1b289',
    dark: '#8a5731',
    selected: '#2f5675',
    lastMove: '#5f8663',
};
const PIECE_COLORS = {
    white: '#ffffff',
    black: '#1b100a',
};
const AI_RESPONSE_DELAY = 1000;
const CHECKMATE_SCORE = 999999;
const BISHOP_PAIR_BONUS = 34;
const PASSED_PAWN_BONUS = 18;
const DOUBLED_PAWN_PENALTY = 12;
const ISOLATED_PAWN_PENALTY = 10;
const PIECE_VALUES = {
    pawn: 100,
    knight: 320,
    bishop: 330,
    rook: 500,
    queen: 900,
    king: 20000,
};

const PIECE_SYMBOLS = {
    white: {
        king: '\u265A',
        queen: '\u265B',
        rook: '\u265C',
        bishop: '\u265D',
        knight: '\u265E',
        pawn: '\u265F',
    },
    black: {
        king: '\u265A',
        queen: '\u265B',
        rook: '\u265C',
        bishop: '\u265D',
        knight: '\u265E',
        pawn: '\u265F',
    },
};

const createPiece = (color, type) => ({
    color,
    type,
    hasMoved: false,
});

const capitalize = (value) => value.charAt(0).toUpperCase() + value.slice(1);
const opponentColor = (color) => (color === 'white' ? 'black' : 'white');
const inBounds = (row, column) => row >= 0 && row < 8 && column >= 0 && column < 8;
const squareLabel = (row, column) => `${FILES[column]}${8 - row}`;

const createInitialBoard = () => {
    const board = Array.from({ length: 8 }, () => Array(8).fill(null));

    BACK_RANK.forEach((type, column) => {
        board[0][column] = createPiece('black', type);
        board[1][column] = createPiece('black', 'pawn');
        board[6][column] = createPiece('white', 'pawn');
        board[7][column] = createPiece('white', type);
    });

    return board;
};

const cloneBoard = (board) =>
    board.map((row) => row.map((piece) => (piece ? { ...piece } : null)));

const getSlidingMoves = (board, row, column, piece, directions) => {
    const moves = [];

    directions.forEach(([rowDelta, columnDelta]) => {
        let nextRow = row + rowDelta;
        let nextColumn = column + columnDelta;

        while (inBounds(nextRow, nextColumn)) {
            const occupant = board[nextRow][nextColumn];

            if (!occupant) {
                moves.push({ row: nextRow, col: nextColumn });
            } else {
                if (occupant.color !== piece.color) {
                    moves.push({ row: nextRow, col: nextColumn });
                }
                break;
            }

            nextRow += rowDelta;
            nextColumn += columnDelta;
        }
    });

    return moves;
};

const findKing = (board, color) => {
    for (let row = 0; row < 8; row += 1) {
        for (let column = 0; column < 8; column += 1) {
            const piece = board[row][column];
            if (piece?.type === 'king' && piece.color === color) {
                return { row, col: column };
            }
        }
    }

    return null;
};

const getPseudoLegalMoves = (board, row, column, history, options = {}) => {
    const { attackOnly = false } = options;
    const piece = board[row][column];

    if (!piece) {
        return [];
    }

    if (piece.type === 'pawn') {
        const direction = piece.color === 'white' ? -1 : 1;
        const startRow = piece.color === 'white' ? 6 : 1;
        const moves = [];

        [-1, 1].forEach((columnOffset) => {
            const nextRow = row + direction;
            const nextColumn = column + columnOffset;

            if (!inBounds(nextRow, nextColumn)) {
                return;
            }

            if (attackOnly) {
                moves.push({ row: nextRow, col: nextColumn });
                return;
            }

            const targetPiece = board[nextRow][nextColumn];
            if (targetPiece && targetPiece.color !== piece.color) {
                moves.push({ row: nextRow, col: nextColumn });
            }
        });

        if (attackOnly) {
            return moves;
        }

        const forwardRow = row + direction;
        if (inBounds(forwardRow, column) && !board[forwardRow][column]) {
            moves.push({ row: forwardRow, col: column });

            const jumpRow = row + direction * 2;
            if (
                row === startRow &&
                !piece.hasMoved &&
                inBounds(jumpRow, column) &&
                !board[jumpRow][column]
            ) {
                moves.push({ row: jumpRow, col: column, doubleStep: true });
            }
        }

        const lastMove = history?.lastMove;
        if (
            lastMove &&
            lastMove.piece.type === 'pawn' &&
            lastMove.piece.color !== piece.color &&
            lastMove.wasDoubleStep &&
            lastMove.to.row === row &&
            Math.abs(lastMove.to.col - column) === 1
        ) {
            const enPassantRow = row + direction;
            if (inBounds(enPassantRow, lastMove.to.col) && !board[enPassantRow][lastMove.to.col]) {
                moves.push({
                    row: enPassantRow,
                    col: lastMove.to.col,
                    isEnPassant: true,
                });
            }
        }

        return moves;
    }

    if (piece.type === 'knight') {
        return [
            [-2, -1],
            [-2, 1],
            [-1, -2],
            [-1, 2],
            [1, -2],
            [1, 2],
            [2, -1],
            [2, 1],
        ]
            .map(([rowDelta, columnDelta]) => ({
                row: row + rowDelta,
                col: column + columnDelta,
            }))
            .filter(({ row: nextRow, col: nextColumn }) => {
                if (!inBounds(nextRow, nextColumn)) {
                    return false;
                }

                const occupant = board[nextRow][nextColumn];
                return !occupant || occupant.color !== piece.color;
            });
    }

    if (piece.type === 'bishop') {
        return getSlidingMoves(board, row, column, piece, [
            [-1, -1],
            [-1, 1],
            [1, -1],
            [1, 1],
        ]);
    }

    if (piece.type === 'rook') {
        return getSlidingMoves(board, row, column, piece, [
            [-1, 0],
            [1, 0],
            [0, -1],
            [0, 1],
        ]);
    }

    if (piece.type === 'queen') {
        return getSlidingMoves(board, row, column, piece, [
            [-1, -1],
            [-1, 1],
            [1, -1],
            [1, 1],
            [-1, 0],
            [1, 0],
            [0, -1],
            [0, 1],
        ]);
    }

    const kingMoves = [
        [-1, -1],
        [-1, 0],
        [-1, 1],
        [0, -1],
        [0, 1],
        [1, -1],
        [1, 0],
        [1, 1],
    ]
        .map(([rowDelta, columnDelta]) => ({
            row: row + rowDelta,
            col: column + columnDelta,
        }))
        .filter(({ row: nextRow, col: nextColumn }) => {
            if (!inBounds(nextRow, nextColumn)) {
                return false;
            }

            const occupant = board[nextRow][nextColumn];
            return !occupant || occupant.color !== piece.color;
        });

    if (attackOnly || piece.hasMoved) {
        return kingMoves;
    }

    const homeRow = piece.color === 'white' ? 7 : 0;
    if (row !== homeRow || column !== 4) {
        return kingMoves;
    }

    if (isInCheck(board, piece.color, history)) {
        return kingMoves;
    }

    const opposingColor = opponentColor(piece.color);

    const kingSideRook = board[homeRow][7];
    if (
        kingSideRook &&
        kingSideRook.type === 'rook' &&
        kingSideRook.color === piece.color &&
        !kingSideRook.hasMoved &&
        !board[homeRow][5] &&
        !board[homeRow][6] &&
        !isSquareAttacked(board, homeRow, 5, opposingColor, history) &&
        !isSquareAttacked(board, homeRow, 6, opposingColor, history)
    ) {
        kingMoves.push({
            row: homeRow,
            col: 6,
            isCastle: true,
            rookFrom: { row: homeRow, col: 7 },
            rookTo: { row: homeRow, col: 5 },
        });
    }

    const queenSideRook = board[homeRow][0];
    if (
        queenSideRook &&
        queenSideRook.type === 'rook' &&
        queenSideRook.color === piece.color &&
        !queenSideRook.hasMoved &&
        !board[homeRow][1] &&
        !board[homeRow][2] &&
        !board[homeRow][3] &&
        !isSquareAttacked(board, homeRow, 3, opposingColor, history) &&
        !isSquareAttacked(board, homeRow, 2, opposingColor, history)
    ) {
        kingMoves.push({
            row: homeRow,
            col: 2,
            isCastle: true,
            rookFrom: { row: homeRow, col: 0 },
            rookTo: { row: homeRow, col: 3 },
        });
    }

    return kingMoves;
};

function isSquareAttacked(board, row, column, byColor, history) {
    for (let nextRow = 0; nextRow < 8; nextRow += 1) {
        for (let nextColumn = 0; nextColumn < 8; nextColumn += 1) {
            const piece = board[nextRow][nextColumn];
            if (!piece || piece.color !== byColor) {
                continue;
            }

            const attackingMoves = getPseudoLegalMoves(board, nextRow, nextColumn, history, {
                attackOnly: true,
            });

            if (attackingMoves.some((move) => move.row === row && move.col === column)) {
                return true;
            }
        }
    }

    return false;
}

function isInCheck(board, color, history) {
    const king = findKing(board, color);
    if (!king) {
        return false;
    }

    return isSquareAttacked(board, king.row, king.col, opponentColor(color), history);
}

const applyMove = (board, from, move) => {
    const nextBoard = cloneBoard(board);
    const movingPiece = nextBoard[from.row][from.col];
    const originalType = movingPiece.type;

    nextBoard[from.row][from.col] = null;

    if (move.isEnPassant) {
        nextBoard[from.row][move.col] = null;
    }

    if (move.isCastle) {
        const rook = nextBoard[move.rookFrom.row][move.rookFrom.col];
        nextBoard[move.rookFrom.row][move.rookFrom.col] = null;
        nextBoard[move.rookTo.row][move.rookTo.col] = {
            ...rook,
            hasMoved: true,
        };
    }

    const placedPiece = {
        ...movingPiece,
        hasMoved: true,
    };

    if (originalType === 'pawn' && (move.row === 0 || move.row === 7)) {
        placedPiece.type = 'queen';
    }

    nextBoard[move.row][move.col] = placedPiece;

    return {
        board: nextBoard,
        history: {
            lastMove: {
                from: { ...from },
                to: { row: move.row, col: move.col },
                piece: { color: placedPiece.color, type: originalType },
                wasDoubleStep: originalType === 'pawn' && Math.abs(move.row - from.row) === 2,
            },
        },
    };
};

const getLegalMoves = (board, row, column, history) => {
    const piece = board[row][column];
    if (!piece) {
        return [];
    }

    return getPseudoLegalMoves(board, row, column, history).filter((candidateMove) => {
        const simulatedState = applyMove(board, { row, col: column }, candidateMove);
        return !isInCheck(simulatedState.board, piece.color, simulatedState.history);
    });
};

const getAllLegalMoves = (board, color, history) => {
    const moves = [];

    for (let row = 0; row < 8; row += 1) {
        for (let column = 0; column < 8; column += 1) {
            const piece = board[row][column];
            if (!piece || piece.color !== color) {
                continue;
            }

            getLegalMoves(board, row, column, history).forEach((move) => {
                moves.push({
                    from: { row, col: column },
                    move,
                    piece,
                });
            });
        }
    }

    return moves;
};

const hasAnyLegalMoves = (board, color, history) => getAllLegalMoves(board, color, history).length > 0;

const getPositionalBonus = (piece, row, column) => {
    const centerDistance = Math.abs(3.5 - row) + Math.abs(3.5 - column);

    if (piece.type === 'pawn') {
        const advancement = piece.color === 'white' ? 6 - row : row - 1;
        return advancement * 8 - centerDistance * 2;
    }

    if (piece.type === 'knight' || piece.type === 'bishop') {
        return 28 - centerDistance * 6;
    }

    if (piece.type === 'queen') {
        return 18 - centerDistance * 4;
    }

    if (piece.type === 'rook') {
        return 12 - Math.abs(3.5 - column) * 3;
    }

    if (piece.type === 'king') {
        return piece.hasMoved ? 16 : 0;
    }

    return 0;
};

const evaluateBoard = (board, perspectiveColor, history) => {
    let score = 0;
    const bishopCounts = { white: 0, black: 0 };
    const pawnFileCounts = buildPawnFileCounts(board);

    for (let row = 0; row < 8; row += 1) {
        for (let column = 0; column < 8; column += 1) {
            const piece = board[row][column];
            if (!piece) {
                continue;
            }

            if (piece.type === 'bishop') {
                bishopCounts[piece.color] += 1;
            }
        }
    }

    for (let row = 0; row < 8; row += 1) {
        for (let column = 0; column < 8; column += 1) {
            const piece = board[row][column];
            if (!piece) {
                continue;
            }

            const multiplier = piece.color === perspectiveColor ? 1 : -1;
            score += multiplier * PIECE_VALUES[piece.type];
            score += multiplier * getPositionalBonus(piece, row, column);

            if (piece.type === 'pawn') {
                const pawnCountOnFile = pawnFileCounts[piece.color][column];
                const leftFileCount = column > 0 ? pawnFileCounts[piece.color][column - 1] : 0;
                const rightFileCount = column < 7 ? pawnFileCounts[piece.color][column + 1] : 0;
                const advancement = piece.color === 'white' ? 6 - row : row - 1;

                if (pawnCountOnFile > 1) {
                    score -= multiplier * DOUBLED_PAWN_PENALTY * (pawnCountOnFile - 1);
                }

                if (leftFileCount === 0 && rightFileCount === 0) {
                    score -= multiplier * ISOLATED_PAWN_PENALTY;
                }

                if (isPassedPawn(board, piece, row, column)) {
                    score += multiplier * (PASSED_PAWN_BONUS + advancement * 8);
                }
            }

            if (piece.type === 'king') {
                if (piece.hasMoved && (column === 2 || column === 6)) {
                    score += multiplier * 28;
                } else if (!piece.hasMoved) {
                    score -= multiplier * 12;
                }
            }
        }
    }

    if (bishopCounts[perspectiveColor] >= 2) {
        score += BISHOP_PAIR_BONUS;
    }
    if (bishopCounts[opponentColor(perspectiveColor)] >= 2) {
        score -= BISHOP_PAIR_BONUS;
    }

    if (isInCheck(board, perspectiveColor, history)) {
        score -= 25;
    }
    if (isInCheck(board, opponentColor(perspectiveColor), history)) {
        score += 25;
    }

    return score;
};

const scoreMoveOrdering = (board, from, move) => {
    const movingPiece = board[from.row][from.col];
    const targetPiece = board[move.row][move.col];
    let score = 0;

    if (targetPiece) {
        score += PIECE_VALUES[targetPiece.type] - PIECE_VALUES[movingPiece.type] / 10;
    }
    if (move.isEnPassant) {
        score += PIECE_VALUES.pawn;
    }
    if (move.isCastle) {
        score += 40;
    }
    if (movingPiece.type === 'pawn' && (move.row === 0 || move.row === 7)) {
        score += PIECE_VALUES.queen;
    }

    return score;
};

const countRemainingPieces = (board) =>
    board.reduce(
        (total, row) => total + row.reduce((rowTotal, piece) => rowTotal + (piece ? 1 : 0), 0),
        0
    );

const buildPawnFileCounts = (board) => {
    const fileCounts = {
        white: Array(8).fill(0),
        black: Array(8).fill(0),
    };

    for (let row = 0; row < 8; row += 1) {
        for (let column = 0; column < 8; column += 1) {
            const piece = board[row][column];
            if (piece?.type === 'pawn') {
                fileCounts[piece.color][column] += 1;
            }
        }
    }

    return fileCounts;
};

const isPassedPawn = (board, piece, row, column) => {
    const direction = piece.color === 'white' ? -1 : 1;

    for (let nextRow = row + direction; inBounds(nextRow, column); nextRow += direction) {
        for (let fileOffset = -1; fileOffset <= 1; fileOffset += 1) {
            const nextColumn = column + fileOffset;

            if (!inBounds(nextRow, nextColumn)) {
                continue;
            }

            const occupant = board[nextRow][nextColumn];
            if (occupant?.type === 'pawn' && occupant.color !== piece.color) {
                return false;
            }
        }
    }

    return true;
};

const getAiSearchDepth = (board, legalMoves) => {
    const remainingPieces = countRemainingPieces(board);

    if (legalMoves.length <= 8 || remainingPieces <= 8) {
        return 3;
    }

    return 2;
};

const minimax = (board, colorToMove, history, depth, alpha, beta, perspectiveColor) => {
    const legalMoves = getAllLegalMoves(board, colorToMove, history);

    if (depth === 0 || legalMoves.length === 0) {
        if (legalMoves.length === 0) {
            if (isInCheck(board, colorToMove, history)) {
                return colorToMove === perspectiveColor ? -CHECKMATE_SCORE - depth : CHECKMATE_SCORE + depth;
            }
            return 0;
        }

        return evaluateBoard(board, perspectiveColor, history);
    }

    const orderedMoves = [...legalMoves].sort(
        (left, right) =>
            scoreMoveOrdering(board, right.from, right.move) - scoreMoveOrdering(board, left.from, left.move)
    );
    const maximizing = colorToMove === perspectiveColor;

    if (maximizing) {
        let bestScore = -Infinity;

        for (const candidate of orderedMoves) {
            const nextState = applyMove(board, candidate.from, candidate.move);
            const score = minimax(
                nextState.board,
                opponentColor(colorToMove),
                nextState.history,
                depth - 1,
                alpha,
                beta,
                perspectiveColor
            );
            bestScore = Math.max(bestScore, score);
            alpha = Math.max(alpha, bestScore);

            if (beta <= alpha) {
                break;
            }
        }

        return bestScore;
    }

    let bestScore = Infinity;

    for (const candidate of orderedMoves) {
        const nextState = applyMove(board, candidate.from, candidate.move);
        const score = minimax(
            nextState.board,
            opponentColor(colorToMove),
            nextState.history,
            depth - 1,
            alpha,
            beta,
            perspectiveColor
        );
        bestScore = Math.min(bestScore, score);
        beta = Math.min(beta, bestScore);

        if (beta <= alpha) {
            break;
        }
    }

    return bestScore;
};

const chooseAiMove = (board, aiColor, history) => {
    const legalMoves = getAllLegalMoves(board, aiColor, history);
    if (!legalMoves.length) {
        return null;
    }

    const searchDepth = getAiSearchDepth(board, legalMoves);
    const orderedMoves = [...legalMoves].sort(
        (left, right) =>
            scoreMoveOrdering(board, right.from, right.move) - scoreMoveOrdering(board, left.from, left.move)
    );

    let bestScore = -Infinity;
    let bestMove = orderedMoves[0];

    for (const candidate of orderedMoves) {
        const nextState = applyMove(board, candidate.from, candidate.move);
        const nextTurn = opponentColor(aiColor);
        const opponentInCheck = isInCheck(nextState.board, nextTurn, nextState.history);
        const opponentHasMoves = hasAnyLegalMoves(nextState.board, nextTurn, nextState.history);

        if (!opponentHasMoves && opponentInCheck) {
            return candidate;
        }

        const score = minimax(
            nextState.board,
            nextTurn,
            nextState.history,
            searchDepth - 1,
            -Infinity,
            Infinity,
            aiColor
        );

        const weightedScore =
            score +
            scoreMoveOrdering(board, candidate.from, candidate.move) * 0.22 +
            (opponentInCheck ? 55 : 0) +
            (!opponentHasMoves ? 20 : 0);

        if (weightedScore > bestScore) {
            bestScore = weightedScore;
            bestMove = candidate;
        }
    }

    return bestMove;
};

const resolveMoveState = (currentState, from, chosenMove) => {
    const nextState = applyMove(currentState.board, from, chosenMove);
    const nextTurn = opponentColor(currentState.turn);
    const opponentHasMoves = hasAnyLegalMoves(nextState.board, nextTurn, nextState.history);
    const opponentInCheck = isInCheck(nextState.board, nextTurn, nextState.history);

    let nextStatus = `${capitalize(nextTurn)} to move.`;
    let nextWinner = null;

    if (!opponentHasMoves && opponentInCheck) {
        nextStatus = `Checkmate. ${capitalize(currentState.turn)} wins.`;
        nextWinner = currentState.turn;
    } else if (!opponentHasMoves) {
        nextStatus = 'Stalemate. Draw.';
        nextWinner = 'draw';
    } else if (opponentInCheck) {
        nextStatus = `${capitalize(nextTurn)} is in check.`;
    }

    return {
        board: nextState.board,
        turn: nextTurn,
        selectedSquare: null,
        legalMoves: [],
        history: nextState.history,
        status: nextStatus,
        winner: nextWinner,
        lastMove: {
            from,
            to: { row: chosenMove.row, col: chosenMove.col },
        },
    };
};

const buildInitialState = () => ({
    board: createInitialBoard(),
    turn: 'white',
    selectedSquare: null,
    legalMoves: [],
    history: { lastMove: null },
    status: 'White to move.',
    winner: null,
    lastMove: null,
});

/**
 * Renders a browser-playable chess board that supports local two-player games
 * or single-player play against a lightweight in-browser AI.
 *
 * @returns {JSX.Element}
 */
const ChessGame = () => {
    const [gameState, setGameState] = React.useState(buildInitialState);
    const [playerMode, setPlayerMode] = React.useState('single');
    const [aiThinking, setAiThinking] = React.useState(false);
    const aiTimerRef = useRef(null);

    useEffect(() => {
        if (playerMode !== 'single' || gameState.turn !== 'black' || gameState.winner) {
            setAiThinking(false);
            return undefined;
        }

        setAiThinking(true);
        aiTimerRef.current = window.setTimeout(() => {
            setGameState((currentState) => {
                if (playerMode !== 'single' || currentState.turn !== 'black' || currentState.winner) {
                    return currentState;
                }

                const aiMove = chooseAiMove(currentState.board, 'black', currentState.history);
                if (!aiMove) {
                    return currentState;
                }

                return resolveMoveState(currentState, aiMove.from, aiMove.move);
            });
            aiTimerRef.current = null;
            setAiThinking(false);
        }, AI_RESPONSE_DELAY);

        return () => {
            if (aiTimerRef.current) {
                window.clearTimeout(aiTimerRef.current);
                aiTimerRef.current = null;
            }
        };
    }, [gameState.turn, gameState.winner, playerMode]);

    const handleModeChange = (mode) => {
        if (aiTimerRef.current) {
            window.clearTimeout(aiTimerRef.current);
            aiTimerRef.current = null;
        }
        setAiThinking(false);
        setPlayerMode(mode);
        setGameState(buildInitialState());
    };

    const handleReset = () => {
        if (aiTimerRef.current) {
            window.clearTimeout(aiTimerRef.current);
            aiTimerRef.current = null;
        }
        setAiThinking(false);
        setGameState(buildInitialState());
    };

    const handleSquareClick = (row, column) => {
        setGameState((currentState) => {
            if (currentState.winner) {
                return currentState;
            }

            if (playerMode === 'single' && currentState.turn === 'black') {
                return currentState;
            }

            const { board, turn, selectedSquare, legalMoves, history } = currentState;
            const clickedPiece = board[row][column];

            if (selectedSquare && selectedSquare.row === row && selectedSquare.col === column) {
                return {
                    ...currentState,
                    selectedSquare: null,
                    legalMoves: [],
                    status: `${capitalize(turn)} to move.`,
                };
            }

            const chosenMove = legalMoves.find((move) => move.row === row && move.col === column);
            if (selectedSquare && chosenMove) {
                return resolveMoveState(currentState, selectedSquare, chosenMove);
            }

            if (!clickedPiece || clickedPiece.color !== turn) {
                return {
                    ...currentState,
                    selectedSquare: null,
                    legalMoves: [],
                    status: `${capitalize(turn)} to move.`,
                };
            }

            const nextLegalMoves = getLegalMoves(board, row, column, history);

            return {
                ...currentState,
                selectedSquare: { row, col: column },
                legalMoves: nextLegalMoves,
                status:
                    nextLegalMoves.length > 0
                        ? `${capitalize(clickedPiece.color)} ${clickedPiece.type} selected from ${squareLabel(
                              row,
                              column
                          )}.`
                        : `No legal moves for ${capitalize(clickedPiece.color)} ${clickedPiece.type}.`,
            };
        });
    };

    const { board, turn, selectedSquare, legalMoves, status, winner, lastMove } = gameState;
    const currentStatus = aiThinking ? 'Black AI is thinking...' : status;

    return (
        <Stack spacing={4}>
            <HStack justify="space-between" align="center" flexWrap="wrap" spacing={3}>
                <HStack spacing={3} flexWrap="wrap">
                    <Tag className="info-chip">
                        {winner === 'draw' ? 'Draw' : `${capitalize(turn)} to move`}
                    </Tag>
                    {playerMode === 'single' && <Tag className="info-chip">AI controls Black</Tag>}
                    <Tag className="info-chip">Castling enabled</Tag>
                    <Tag className="info-chip">En passant enabled</Tag>
                </HStack>

                <HStack spacing={3} flexWrap="wrap">
                    <Button
                        onClick={() => handleModeChange('single')}
                        variant={playerMode === 'single' ? 'solid' : 'outline'}
                        size="sm"
                    >
                        1 Player
                    </Button>
                    <Button
                        onClick={() => handleModeChange('multi')}
                        variant={playerMode === 'multi' ? 'solid' : 'outline'}
                        size="sm"
                    >
                        2 Players
                    </Button>
                    <Button onClick={handleReset} variant="outline" size="sm">
                        New Match
                    </Button>
                </HStack>
            </HStack>

            <Box
                className="lab-canvas"
                p={{ base: 3, md: 4 }}
                maxW="720px"
                mx="auto"
                width="100%"
            >
                <Grid templateColumns="repeat(8, minmax(0, 1fr))" overflow="hidden" borderRadius="18px">
                    {board.map((row, rowIndex) =>
                        row.map((piece, columnIndex) => {
                            const isLightSquare = (rowIndex + columnIndex) % 2 === 0;
                            const isSelected =
                                selectedSquare?.row === rowIndex && selectedSquare?.col === columnIndex;
                            const isLegalMove = legalMoves.some(
                                (move) => move.row === rowIndex && move.col === columnIndex
                            );
                            const isLastMoveSquare =
                                (lastMove?.from.row === rowIndex && lastMove?.from.col === columnIndex) ||
                                (lastMove?.to.row === rowIndex && lastMove?.to.col === columnIndex);
                            const squareColor = isSelected
                                ? BOARD_COLORS.selected
                                : isLastMoveSquare
                                ? BOARD_COLORS.lastMove
                                : isLightSquare
                                ? BOARD_COLORS.light
                                : BOARD_COLORS.dark;
                            const pieceColor = piece ? PIECE_COLORS[piece.color] : undefined;
                            const pieceShadow =
                                piece?.color === 'white'
                                    ? '0 1px 0 rgba(26, 15, 10, 0.72), 0 2px 6px rgba(0, 0, 0, 0.34)'
                                    : '0 1px 0 rgba(255, 245, 228, 0.24), 0 2px 6px rgba(0, 0, 0, 0.28)';
                            const pieceStroke =
                                piece?.color === 'white' ? '0.9px rgba(26, 15, 10, 0.62)' : '0.5px rgba(255, 245, 228, 0.16)';

                            return (
                                <Box
                                    key={`${rowIndex}-${columnIndex}`}
                                    as="button"
                                    type="button"
                                    onClick={() => handleSquareClick(rowIndex, columnIndex)}
                                    position="relative"
                                    aspectRatio={1}
                                    display="grid"
                                    placeItems="center"
                                    bg={squareColor}
                                    fontSize={{ base: '2.45rem', md: '4.35rem' }}
                                    lineHeight="1"
                                    transition="transform 0.15s ease, filter 0.15s ease"
                                    _hover={{
                                        filter: 'brightness(1.04)',
                                    }}
                                    aria-label={
                                        piece
                                            ? `${capitalize(piece.color)} ${piece.type} on ${squareLabel(
                                                  rowIndex,
                                                  columnIndex
                                              )}`
                                            : `Empty square ${squareLabel(rowIndex, columnIndex)}`
                                    }
                                >
                                    <Text
                                        as="span"
                                        position="relative"
                                        zIndex="1"
                                        color={pieceColor}
                                        textShadow={pieceShadow}
                                        fontFamily='"Segoe UI Symbol", "Noto Sans Symbols 2", sans-serif'
                                        sx={{
                                            WebkitTextStroke: pieceStroke,
                                        }}
                                    >
                                        {piece ? PIECE_SYMBOLS[piece.color][piece.type] : ''}
                                    </Text>

                                    {isLegalMove && !piece && (
                                        <Box
                                            position="absolute"
                                            width={{ base: '12px', md: '16px' }}
                                            height={{ base: '12px', md: '16px' }}
                                            borderRadius="full"
                                            bg="rgba(7, 17, 28, 0.28)"
                                        />
                                    )}

                                    {isLegalMove && piece && (
                                        <Box
                                            position="absolute"
                                            inset="6px"
                                            borderRadius="full"
                                            border="3px solid rgba(7, 17, 28, 0.34)"
                                        />
                                    )}
                                </Box>
                            );
                        })
                    )}
                </Grid>
            </Box>

            <Text color="whiteAlpha.780" lineHeight="1.7">
                {currentStatus}
            </Text>
            <Text color="whiteAlpha.620" fontSize="sm" lineHeight="1.7">
                Choose `1 Player` to face the built-in AI or `2 Players` for local play. Pawn promotion
                auto-upgrades to a queen so games keep moving.
            </Text>
        </Stack>
    );
};

export default ChessGame;
