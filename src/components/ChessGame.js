import React from 'react';
import { Box, Button, Grid, HStack, Stack, Tag, Text } from '@chakra-ui/react';

const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
const BACK_RANK = ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'];

const PIECE_SYMBOLS = {
    white: {
        king: '♔',
        queen: '♕',
        rook: '♖',
        bishop: '♗',
        knight: '♘',
        pawn: '♙',
    },
    black: {
        king: '♚',
        queen: '♛',
        rook: '♜',
        bishop: '♝',
        knight: '♞',
        pawn: '♟',
    },
};

const createPiece = (color, type) => ({
    color,
    type,
    hasMoved: false,
});

const capitalize = (value) => value.charAt(0).toUpperCase() + value.slice(1);

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

const inBounds = (row, column) => row >= 0 && row < 8 && column >= 0 && column < 8;

const opponentColor = (color) => (color === 'white' ? 'black' : 'white');

const squareLabel = (row, column) => `${FILES[column]}${8 - row}`;

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

const hasAnyLegalMoves = (board, color, history) => {
    for (let row = 0; row < 8; row += 1) {
        for (let column = 0; column < 8; column += 1) {
            const piece = board[row][column];
            if (!piece || piece.color !== color) {
                continue;
            }

            if (getLegalMoves(board, row, column, history).length > 0) {
                return true;
            }
        }
    }

    return false;
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
 * Renders a browser-playable chess board with move validation, check and
 * checkmate detection, castling, en passant, and automatic queen promotion.
 *
 * @returns {JSX.Element}
 */
const ChessGame = () => {
    const [gameState, setGameState] = React.useState(buildInitialState);

    const handleReset = () => {
        setGameState(buildInitialState());
    };

    const handleSquareClick = (row, column) => {
        setGameState((currentState) => {
            const { board, turn, selectedSquare, legalMoves, history, winner } = currentState;
            const clickedPiece = board[row][column];

            if (winner) {
                return currentState;
            }

            if (selectedSquare && selectedSquare.row === row && selectedSquare.col === column) {
                return {
                    ...currentState,
                    selectedSquare: null,
                    legalMoves: [],
                    status: currentState.winner ? currentState.status : `${capitalize(turn)} to move.`,
                };
            }

            const chosenMove = legalMoves.find((move) => move.row === row && move.col === column);
            if (selectedSquare && chosenMove) {
                const nextState = applyMove(board, selectedSquare, chosenMove);
                const nextTurn = opponentColor(turn);
                const opponentHasMoves = hasAnyLegalMoves(nextState.board, nextTurn, nextState.history);
                const opponentInCheck = isInCheck(nextState.board, nextTurn, nextState.history);

                let nextStatus = `${capitalize(nextTurn)} to move.`;
                let nextWinner = null;

                if (!opponentHasMoves && opponentInCheck) {
                    nextStatus = `Checkmate. ${capitalize(turn)} wins.`;
                    nextWinner = turn;
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
                        from: selectedSquare,
                        to: { row, col: column },
                    },
                };
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

    return (
        <Stack spacing={4}>
            <HStack justify="space-between" align="center" flexWrap="wrap" spacing={3}>
                <HStack spacing={3} flexWrap="wrap">
                    <Tag className="info-chip">
                        {winner === 'draw' ? 'Draw' : `${capitalize(turn)} to move`}
                    </Tag>
                    <Tag className="info-chip">Castling enabled</Tag>
                    <Tag className="info-chip">En passant enabled</Tag>
                </HStack>

                <Button onClick={handleReset} variant="outline" size="sm">
                    New Match
                </Button>
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
                                    bg={
                                        isSelected
                                            ? '#2f5675'
                                            : isLastMoveSquare
                                            ? '#5f8663'
                                            : isLightSquare
                                            ? '#e8d8bb'
                                            : '#a06a43'
                                    }
                                    color={piece?.color === 'white' ? '#fffdf7' : '#1f130c'}
                                    fontSize={{ base: '2xl', md: '4xl' }}
                                    lineHeight="1"
                                    textShadow="0 1px 2px rgba(0, 0, 0, 0.3)"
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
                                    <Text as="span" position="relative" zIndex="1">
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
                {status}
            </Text>
            <Text color="whiteAlpha.620" fontSize="sm" lineHeight="1.7">
                Standard move rules are supported, including castling and en passant. Pawn promotion currently
                auto-upgrades to a queen for faster play.
            </Text>
        </Stack>
    );
};

export default ChessGame;
