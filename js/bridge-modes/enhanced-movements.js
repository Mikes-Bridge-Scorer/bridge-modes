/**
 * Enhanced Bridge Movements Module - COMPLETE LIBRARY
 * 
 * Howell movements: 2-5 tables (4-10 pairs)
 * Mitchell movements: 4-10 tables (8-20 pairs)
 * 
 * Each pair count offers SHORT (~2-2.5h cruise) and LONG (~3h+ club) options
 * Mitchell: even tables need Skip, odd tables don't
 * 
 * Key format: "pairs_type_boards" e.g. "8_howell_14", "8_mitchell_24"
 * duplicate.js filters by mov.pairs === pairCount so keys are arbitrary
 */

/**
 * Generate Mitchell Movement with proper Skip Mitchell for even tables
 * NS pairs stay fixed, EW pairs move up one table each round
 * Even tables: skip round = (tables/2) + 1
 */
function generateMitchellMovement(tables, boardsPerRound, useSkip) {
    const movement = [];
    const totalBoards = tables * boardsPerRound;
    const rounds = tables;
    const skipRound = useSkip && tables % 2 === 0 ? Math.floor(tables / 2) + 1 : null;

    for (let round = 1; round <= rounds; round++) {
        for (let table = 1; table <= tables; table++) {
            const nsPair = table;
            let ewPair;

            if (round === 1) {
                ewPair = table;
            } else {
                let position = table - 1 + round - 1;
                if (skipRound && round >= skipRound) {
                    position += 1;
                }
                ewPair = (position % tables) + 1;
            }

            const boardSetIndex = (table - 1 + round - 1) % tables;
            const startBoard = boardSetIndex * boardsPerRound + 1;
            const boardList = [];

            for (let b = 0; b < boardsPerRound; b++) {
                let boardNum = startBoard + b;
                if (boardNum > totalBoards) boardNum -= totalBoards;
                boardList.push(boardNum);
            }

            movement.push({ round, table, ns: nsPair, ew: ewPair, boards: boardList });
        }
    }
    return movement;
}

/**
 * Generate Mitchell with Sit-Out for odd pair counts
 * E.g., 17 pairs = 8 tables + 1 sit-out
 * NS pairs 1-tables at fixed tables
 * EW pairs 1-(tables+1) rotate, one sits out each round
 */
function generateMitchellWithSitOut(tables, boardsPerRound, useSkip) {
    const movement = [];
    const totalBoards = tables * boardsPerRound;
    const rounds = tables;
    const ewPairs = tables + 1; // One extra EW pair
    const skipRound = useSkip && tables % 2 === 0 ? Math.floor(tables / 2) + 1 : null;

    for (let round = 1; round <= rounds; round++) {
        for (let table = 1; table <= tables; table++) {
            const nsPair = table;
            
            // Calculate which EW pair is at this table
            let ewPair;
            if (round === 1) {
                ewPair = table;
            } else {
                let position = table - 1 + round - 1;
                if (skipRound && round >= skipRound) {
                    position += 1;
                }
                ewPair = (position % ewPairs) + 1;
            }

            const boardSetIndex = (table - 1 + round - 1) % tables;
            const startBoard = boardSetIndex * boardsPerRound + 1;
            const boardList = [];

            for (let b = 0; b < boardsPerRound; b++) {
                let boardNum = startBoard + b;
                if (boardNum > totalBoards) boardNum -= totalBoards;
                boardList.push(boardNum);
            }

            movement.push({ round, table, ns: nsPair, ew: ewPair, boards: boardList });
        }
    }
    return movement;
}

const ENHANCED_MOVEMENTS = {

    // ─────────────────────────────────────────────
    // 4 PAIRS - 2 tables
    // ─────────────────────────────────────────────
    "4_howell_12": {
        pairs: 4, tables: 2, rounds: 6, totalBoards: 12, boardsPerRound: 2,
        type: 'howell',
        description: "2-table Howell, 12 boards, ~1.5 hrs",
        movement: [
            { round: 1, table: 1, ns: 1, ew: 2, boards: [1,2] },
            { round: 1, table: 2, ns: 3, ew: 4, boards: [3,4] },
            { round: 2, table: 1, ns: 2, ew: 4, boards: [5,6] },
            { round: 2, table: 2, ns: 3, ew: 1, boards: [7,8] },
            { round: 3, table: 1, ns: 1, ew: 4, boards: [9,10] },
            { round: 3, table: 2, ns: 2, ew: 3, boards: [11,12] },
            { round: 4, table: 1, ns: 4, ew: 3, boards: [1,2] },
            { round: 4, table: 2, ns: 2, ew: 1, boards: [3,4] },
            { round: 5, table: 1, ns: 1, ew: 3, boards: [5,6] },
            { round: 5, table: 2, ns: 4, ew: 2, boards: [7,8] },
            { round: 6, table: 1, ns: 3, ew: 2, boards: [9,10] },
            { round: 6, table: 2, ns: 4, ew: 1, boards: [11,12] }
        ]
    },

    "4_howell_24": {
        pairs: 4, tables: 2, rounds: 6, totalBoards: 24, boardsPerRound: 4,
        type: 'howell',
        description: "2-table Howell, 24 boards, ~3 hrs (ACBL)",
        movement: [
            { round: 1, table: 1, ns: 1, ew: 2, boards: [1,2,3,4] },
            { round: 1, table: 2, ns: 3, ew: 4, boards: [5,6,7,8] },
            { round: 2, table: 1, ns: 1, ew: 3, boards: [9,10,11,12] },
            { round: 2, table: 2, ns: 4, ew: 2, boards: [13,14,15,16] },
            { round: 3, table: 1, ns: 1, ew: 4, boards: [17,18,19,20] },
            { round: 3, table: 2, ns: 2, ew: 3, boards: [21,22,23,24] },
            { round: 4, table: 1, ns: 1, ew: 2, boards: [5,6,7,8] },
            { round: 4, table: 2, ns: 3, ew: 4, boards: [1,2,3,4] },
            { round: 5, table: 1, ns: 1, ew: 3, boards: [13,14,15,16] },
            { round: 5, table: 2, ns: 4, ew: 2, boards: [9,10,11,12] },
            { round: 6, table: 1, ns: 1, ew: 4, boards: [21,22,23,24] },
            { round: 6, table: 2, ns: 2, ew: 3, boards: [17,18,19,20] }
        ]
    },

    // ─────────────────────────────────────────────
    // 5 PAIRS - 2.5 tables
    // ─────────────────────────────────────────────
    "5_howell_15": {
        pairs: 5, tables: 2.5, rounds: 5, totalBoards: 15, boardsPerRound: 3,
        type: 'howell', hasSitOut: true,
        description: "2.5-table Howell, 15 boards, ~2 hrs (1 sit-out)",
        movement: [
            { round: 1, table: 1, ns: 1, ew: 2, boards: [1,2,3] },
            { round: 1, table: 2, ns: 3, ew: 4, boards: [10,11,12] },
            { round: 2, table: 1, ns: 1, ew: 4, boards: [4,5,6] },
            { round: 2, table: 3, ns: 3, ew: 5, boards: [7,8,9] },
            { round: 3, table: 2, ns: 4, ew: 5, boards: [1,2,3] },
            { round: 3, table: 3, ns: 2, ew: 3, boards: [4,5,6] },
            { round: 4, table: 1, ns: 1, ew: 5, boards: [10,11,12] },
            { round: 4, table: 3, ns: 4, ew: 2, boards: [7,8,9] },
            { round: 5, table: 1, ns: 1, ew: 3, boards: [13,14,15] },
            { round: 5, table: 2, ns: 5, ew: 2, boards: [13,14,15] }
        ]
    },

    "5_howell_25": {
        pairs: 5, tables: 2.5, rounds: 5, totalBoards: 25, boardsPerRound: 5,
        type: 'howell', hasSitOut: true,
        description: "2.5-table Howell, 25 boards, ~3 hrs (1 sit-out)",
        movement: [
            { round: 1, table: 1, ns: 1, ew: 2, boards: [1,2,3,4,5] },
            { round: 1, table: 3, ns: 5, ew: 4, boards: [6,7,8,9,10] },
            { round: 2, table: 1, ns: 1, ew: 3, boards: [6,7,8,9,10] },
            { round: 2, table: 2, ns: 2, ew: 4, boards: [16,17,18,19,20] },
            { round: 3, table: 1, ns: 1, ew: 4, boards: [11,12,13,14,15] },
            { round: 3, table: 2, ns: 3, ew: 5, boards: [1,2,3,4,5] },
            { round: 4, table: 1, ns: 1, ew: 5, boards: [16,17,18,19,20] },
            { round: 4, table: 3, ns: 3, ew: 2, boards: [11,12,13,14,15] },
            { round: 5, table: 2, ns: 5, ew: 2, boards: [23,24,25,21,22] },
            { round: 5, table: 3, ns: 4, ew: 3, boards: [25,21,22,23,24] }
        ]
    },

    // ─────────────────────────────────────────────
    // 6 PAIRS - 3 tables
    // ─────────────────────────────────────────────
    "6_howell_15": {
        pairs: 6, tables: 3, rounds: 5, totalBoards: 15, boardsPerRound: 3,
        type: 'howell',
        description: "3-table Howell, 15 boards, ~2 hrs",
        movement: [
            { round: 1, table: 1, ns: 1, ew: 2, boards: [1,2,3] },
            { round: 1, table: 2, ns: 3, ew: 4, boards: [10,11,12] },
            { round: 1, table: 3, ns: 5, ew: 6, boards: [4,5,6] },
            { round: 2, table: 1, ns: 1, ew: 4, boards: [4,5,6] },
            { round: 2, table: 2, ns: 2, ew: 6, boards: [10,11,12] },
            { round: 2, table: 3, ns: 3, ew: 5, boards: [7,8,9] },
            { round: 3, table: 1, ns: 1, ew: 6, boards: [7,8,9] },
            { round: 3, table: 2, ns: 4, ew: 5, boards: [1,2,3] },
            { round: 3, table: 3, ns: 2, ew: 3, boards: [4,5,6] },
            { round: 4, table: 1, ns: 1, ew: 5, boards: [10,11,12] },
            { round: 4, table: 2, ns: 6, ew: 3, boards: [1,2,3] },
            { round: 4, table: 3, ns: 4, ew: 2, boards: [7,8,9] },
            { round: 5, table: 1, ns: 1, ew: 3, boards: [13,14,15] },
            { round: 5, table: 2, ns: 5, ew: 2, boards: [13,14,15] },
            { round: 5, table: 3, ns: 6, ew: 4, boards: [13,14,15] }
        ]
    },

    "6_howell_25": {
        pairs: 6, tables: 3, rounds: 5, totalBoards: 25, boardsPerRound: 5,
        type: 'howell',
        description: "3-table Howell, 25 boards, ~3 hrs",
        movement: [
            { round: 1, table: 1, ns: 1, ew: 2, boards: [1,2,3,4,5] },
            { round: 1, table: 2, ns: 6, ew: 3, boards: [16,17,18,19,20] },
            { round: 1, table: 3, ns: 5, ew: 4, boards: [6,7,8,9,10] },
            { round: 2, table: 1, ns: 1, ew: 3, boards: [6,7,8,9,10] },
            { round: 2, table: 2, ns: 2, ew: 4, boards: [16,17,18,19,20] },
            { round: 2, table: 3, ns: 6, ew: 5, boards: [11,12,13,14,15] },
            { round: 3, table: 1, ns: 1, ew: 4, boards: [11,12,13,14,15] },
            { round: 3, table: 2, ns: 3, ew: 5, boards: [1,2,3,4,5] },
            { round: 3, table: 3, ns: 2, ew: 6, boards: [6,7,8,9,10] },
            { round: 4, table: 1, ns: 1, ew: 5, boards: [16,17,18,19,20] },
            { round: 4, table: 2, ns: 4, ew: 6, boards: [1,2,3,4,5] },
            { round: 4, table: 3, ns: 3, ew: 2, boards: [11,12,13,14,15] },
            { round: 5, table: 1, ns: 1, ew: 6, boards: [21,22,23,24,25] },
            { round: 5, table: 2, ns: 5, ew: 2, boards: [21,22,23,24,25] },
            { round: 5, table: 3, ns: 4, ew: 3, boards: [21,22,23,24,25] }
        ]
    },

    // ─────────────────────────────────────────────
    // 7 PAIRS - 3.5 tables
    // ─────────────────────────────────────────────
    "7_howell_14": {
        pairs: 7, tables: 3.5, rounds: 7, totalBoards: 14, boardsPerRound: 2,
        type: 'howell', hasSitOut: true,
        description: "3.5-table Howell, 14 boards, ~2 hrs (1 sit-out)",
        movement: [
            { round: 1, table: 1, ns: 1, ew: 2, boards: [1,2] },
            { round: 1, table: 2, ns: 3, ew: 4, boards: [3,4] },
            { round: 1, table: 3, ns: 5, ew: 6, boards: [5,6] },
            { round: 2, table: 1, ns: 1, ew: 6, boards: [3,4] },
            { round: 2, table: 2, ns: 7, ew: 3, boards: [5,6] },
            { round: 2, table: 4, ns: 2, ew: 5, boards: [11,12] },
            { round: 3, table: 2, ns: 2, ew: 7, boards: [7,8] },
            { round: 3, table: 3, ns: 3, ew: 5, boards: [9,10] },
            { round: 3, table: 4, ns: 6, ew: 4, boards: [13,14] },
            { round: 4, table: 1, ns: 1, ew: 5, boards: [7,8] },
            { round: 4, table: 2, ns: 6, ew: 2, boards: [9,10] },
            { round: 4, table: 3, ns: 7, ew: 4, boards: [11,12] },
            { round: 5, table: 1, ns: 1, ew: 4, boards: [9,10] },
            { round: 5, table: 3, ns: 2, ew: 3, boards: [13,14] },
            { round: 5, table: 4, ns: 5, ew: 7, boards: [3,4] },
            { round: 6, table: 1, ns: 1, ew: 3, boards: [11,12] },
            { round: 6, table: 3, ns: 6, ew: 7, boards: [1,2] },
            { round: 6, table: 4, ns: 4, ew: 2, boards: [5,6] },
            { round: 7, table: 1, ns: 1, ew: 7, boards: [13,14] },
            { round: 7, table: 2, ns: 4, ew: 5, boards: [1,2] },
            { round: 7, table: 4, ns: 3, ew: 6, boards: [7,8] }
        ]
    },

    "7_howell_28": {
        pairs: 7, tables: 3.5, rounds: 7, totalBoards: 28, boardsPerRound: 4,
        type: 'howell', hasSitOut: true,
        description: "3.5-table Howell, 28 boards, ~3.5 hrs (1 sit-out)",
        movement: [
            { round: 1, table: 1, ns: 1, ew: 5, boards: [1,2,3,4] },
            { round: 1, table: 2, ns: 2, ew: 6, boards: [5,6,7,8] },
            { round: 1, table: 3, ns: 3, ew: 7, boards: [9,10,11,12] },
            { round: 2, table: 1, ns: 3, ew: 7, boards: [17,18,19,20] },
            { round: 2, table: 3, ns: 5, ew: 1, boards: [25,26,27,28] },
            { round: 2, table: 4, ns: 6, ew: 2, boards: [1,2,3,4] },
            { round: 3, table: 1, ns: 5, ew: 1, boards: [5,6,7,8] },
            { round: 3, table: 2, ns: 6, ew: 2, boards: [9,10,11,12] },
            { round: 3, table: 3, ns: 7, ew: 3, boards: [13,14,15,16] },
            { round: 4, table: 1, ns: 7, ew: 3, boards: [21,22,23,24] },
            { round: 4, table: 3, ns: 1, ew: 5, boards: [1,2,3,4] },
            { round: 4, table: 4, ns: 2, ew: 6, boards: [5,6,7,8] },
            { round: 5, table: 1, ns: 1, ew: 5, boards: [9,10,11,12] },
            { round: 5, table: 2, ns: 2, ew: 6, boards: [13,14,15,16] },
            { round: 5, table: 3, ns: 3, ew: 7, boards: [17,18,19,20] },
            { round: 6, table: 1, ns: 3, ew: 7, boards: [25,26,27,28] },
            { round: 6, table: 3, ns: 5, ew: 1, boards: [5,6,7,8] },
            { round: 6, table: 4, ns: 6, ew: 2, boards: [9,10,11,12] },
            { round: 7, table: 1, ns: 5, ew: 1, boards: [13,14,15,16] },
            { round: 7, table: 2, ns: 6, ew: 2, boards: [17,18,19,20] },
            { round: 7, table: 3, ns: 7, ew: 3, boards: [21,22,23,24] }
        ]
    },

    // ─────────────────────────────────────────────
    // 8 PAIRS - 4 tables
    // ─────────────────────────────────────────────
    "8_howell_14": {
        pairs: 8, tables: 4, rounds: 7, totalBoards: 14, boardsPerRound: 2,
        type: 'howell',
        description: "4-table Howell, 14 boards, ~2 hrs",
        movement: [
            { round: 1, table: 1, ns: 1, ew: 2, boards: [1,2] },
            { round: 1, table: 2, ns: 3, ew: 4, boards: [3,4] },
            { round: 1, table: 3, ns: 5, ew: 6, boards: [5,6] },
            { round: 1, table: 4, ns: 7, ew: 8, boards: [9,10] },
            { round: 2, table: 1, ns: 1, ew: 6, boards: [3,4] },
            { round: 2, table: 2, ns: 7, ew: 3, boards: [5,6] },
            { round: 2, table: 3, ns: 4, ew: 8, boards: [7,8] },
            { round: 2, table: 4, ns: 2, ew: 5, boards: [11,12] },
            { round: 3, table: 1, ns: 1, ew: 8, boards: [5,6] },
            { round: 3, table: 2, ns: 2, ew: 7, boards: [7,8] },
            { round: 3, table: 3, ns: 3, ew: 5, boards: [9,10] },
            { round: 3, table: 4, ns: 6, ew: 4, boards: [13,14] },
            { round: 4, table: 1, ns: 1, ew: 5, boards: [7,8] },
            { round: 4, table: 2, ns: 6, ew: 2, boards: [9,10] },
            { round: 4, table: 3, ns: 7, ew: 4, boards: [11,12] },
            { round: 4, table: 4, ns: 8, ew: 3, boards: [1,2] },
            { round: 5, table: 1, ns: 1, ew: 4, boards: [9,10] },
            { round: 5, table: 2, ns: 8, ew: 6, boards: [11,12] },
            { round: 5, table: 3, ns: 2, ew: 3, boards: [13,14] },
            { round: 5, table: 4, ns: 5, ew: 7, boards: [3,4] },
            { round: 6, table: 1, ns: 1, ew: 3, boards: [11,12] },
            { round: 6, table: 2, ns: 5, ew: 8, boards: [13,14] },
            { round: 6, table: 3, ns: 7, ew: 2, boards: [1,2] },
            { round: 6, table: 4, ns: 4, ew: 6, boards: [5,6] },
            { round: 7, table: 1, ns: 1, ew: 7, boards: [13,14] },
            { round: 7, table: 2, ns: 4, ew: 5, boards: [1,2] },
            { round: 7, table: 3, ns: 8, ew: 2, boards: [3,4] },
            { round: 7, table: 4, ns: 3, ew: 6, boards: [7,8] }
        ]
    },

    "8_howell_28": {
        pairs: 8, tables: 4, rounds: 7, totalBoards: 28, boardsPerRound: 4,
        type: 'howell',
        description: "4-table Howell, 28 boards, ~3.5 hrs",
        movement: [
            { round: 1, table: 1, ns: 1, ew: 5, boards: [1,2,3,4] },
            { round: 1, table: 2, ns: 2, ew: 6, boards: [5,6,7,8] },
            { round: 1, table: 3, ns: 3, ew: 7, boards: [9,10,11,12] },
            { round: 1, table: 4, ns: 4, ew: 8, boards: [13,14,15,16] },
            { round: 2, table: 1, ns: 3, ew: 7, boards: [17,18,19,20] },
            { round: 2, table: 2, ns: 4, ew: 8, boards: [21,22,23,24] },
            { round: 2, table: 3, ns: 5, ew: 1, boards: [25,26,27,28] },
            { round: 2, table: 4, ns: 6, ew: 2, boards: [1,2,3,4] },
            { round: 3, table: 1, ns: 5, ew: 1, boards: [5,6,7,8] },
            { round: 3, table: 2, ns: 6, ew: 2, boards: [9,10,11,12] },
            { round: 3, table: 3, ns: 7, ew: 3, boards: [13,14,15,16] },
            { round: 3, table: 4, ns: 8, ew: 4, boards: [17,18,19,20] },
            { round: 4, table: 1, ns: 7, ew: 3, boards: [21,22,23,24] },
            { round: 4, table: 2, ns: 8, ew: 4, boards: [25,26,27,28] },
            { round: 4, table: 3, ns: 1, ew: 5, boards: [1,2,3,4] },
            { round: 4, table: 4, ns: 2, ew: 6, boards: [5,6,7,8] },
            { round: 5, table: 1, ns: 1, ew: 5, boards: [9,10,11,12] },
            { round: 5, table: 2, ns: 2, ew: 6, boards: [13,14,15,16] },
            { round: 5, table: 3, ns: 3, ew: 7, boards: [17,18,19,20] },
            { round: 5, table: 4, ns: 4, ew: 8, boards: [21,22,23,24] },
            { round: 6, table: 1, ns: 3, ew: 7, boards: [25,26,27,28] },
            { round: 6, table: 2, ns: 4, ew: 8, boards: [1,2,3,4] },
            { round: 6, table: 3, ns: 5, ew: 1, boards: [5,6,7,8] },
            { round: 6, table: 4, ns: 6, ew: 2, boards: [9,10,11,12] },
            { round: 7, table: 1, ns: 5, ew: 1, boards: [13,14,15,16] },
            { round: 7, table: 2, ns: 6, ew: 2, boards: [17,18,19,20] },
            { round: 7, table: 3, ns: 7, ew: 3, boards: [21,22,23,24] },
            { round: 7, table: 4, ns: 8, ew: 4, boards: [25,26,27,28] }
        ]
    },

    "8_mitchell_16": {
        pairs: 8, tables: 4, rounds: 4, totalBoards: 16, boardsPerRound: 4,
        type: 'mitchell',
        description: "4-table Skip Mitchell, 16 boards, ~2 hrs",
        movement: generateMitchellMovement(4, 4, true)
    },

    "8_mitchell_24": {
        pairs: 8, tables: 4, rounds: 4, totalBoards: 24, boardsPerRound: 6,
        type: 'mitchell',
        description: "4-table Skip Mitchell, 24 boards, ~3 hrs",
        movement: generateMitchellMovement(4, 6, true)
    },

    // ─────────────────────────────────────────────
    // 9 PAIRS - 4.5 tables
    // ─────────────────────────────────────────────
    "9_howell_18": {
        pairs: 9, tables: 4.5, rounds: 9, totalBoards: 18, boardsPerRound: 2,
        type: 'howell', hasSitOut: true,
        description: "4.5-table Howell, 18 boards, ~2.5 hrs (1 sit-out)",
        movement: [
            { round: 1, table: 1, ns: 1, ew: 6, boards: [1,2] },
            { round: 1, table: 2, ns: 2, ew: 7, boards: [3,4] },
            { round: 1, table: 3, ns: 3, ew: 8, boards: [5,6] },
            { round: 1, table: 4, ns: 4, ew: 9, boards: [7,8] },
            { round: 2, table: 1, ns: 1, ew: 7, boards: [3,4] },
            { round: 2, table: 3, ns: 9, ew: 4, boards: [7,8] },
            { round: 2, table: 4, ns: 8, ew: 5, boards: [9,10] },
            { round: 2, table: 5, ns: 6, ew: 2, boards: [11,12] },
            { round: 3, table: 1, ns: 1, ew: 8, boards: [5,6] },
            { round: 3, table: 3, ns: 3, ew: 9, boards: [9,10] },
            { round: 3, table: 4, ns: 4, ew: 6, boards: [11,12] },
            { round: 3, table: 5, ns: 7, ew: 5, boards: [13,14] },
            { round: 4, table: 1, ns: 1, ew: 9, boards: [7,8] },
            { round: 4, table: 2, ns: 5, ew: 2, boards: [9,10] },
            { round: 4, table: 4, ns: 3, ew: 7, boards: [13,14] },
            { round: 4, table: 5, ns: 8, ew: 6, boards: [15,16] },
            { round: 5, table: 2, ns: 6, ew: 5, boards: [11,12] },
            { round: 5, table: 3, ns: 2, ew: 4, boards: [13,14] },
            { round: 5, table: 4, ns: 9, ew: 8, boards: [15,16] },
            { round: 5, table: 5, ns: 3, ew: 7, boards: [17,18] },
            { round: 6, table: 1, ns: 1, ew: 4, boards: [11,12] },
            { round: 6, table: 2, ns: 7, ew: 6, boards: [13,14] },
            { round: 6, table: 3, ns: 5, ew: 3, boards: [15,16] },
            { round: 6, table: 5, ns: 2, ew: 8, boards: [1,2] },
            { round: 7, table: 1, ns: 1, ew: 3, boards: [13,14] },
            { round: 7, table: 2, ns: 8, ew: 7, boards: [15,16] },
            { round: 7, table: 3, ns: 6, ew: 2, boards: [17,18] },
            { round: 7, table: 5, ns: 5, ew: 9, boards: [3,4] },
            { round: 8, table: 1, ns: 1, ew: 2, boards: [15,16] },
            { round: 8, table: 2, ns: 9, ew: 8, boards: [17,18] },
            { round: 8, table: 3, ns: 7, ew: 6, boards: [1,2] },
            { round: 8, table: 4, ns: 3, ew: 4, boards: [3,4] },
            { round: 9, table: 1, ns: 1, ew: 5, boards: [17,18] },
            { round: 9, table: 3, ns: 8, ew: 7, boards: [3,4] },
            { round: 9, table: 4, ns: 2, ew: 3, boards: [5,6] },
            { round: 9, table: 5, ns: 4, ew: 6, boards: [7,8] }
        ]
    },

    "9_howell_27": {
        pairs: 9, tables: 4.5, rounds: 9, totalBoards: 27, boardsPerRound: 3,
        type: 'howell', hasSitOut: true,
        description: "4.5-table Howell, 27 boards, ~3.5 hrs (1 sit-out)",
        movement: [
            { round: 1, table: 1, ns: 1, ew: 6, boards: [1,2,3] },
            { round: 1, table: 2, ns: 2, ew: 7, boards: [4,5,6] },
            { round: 1, table: 3, ns: 3, ew: 8, boards: [7,8,9] },
            { round: 1, table: 4, ns: 4, ew: 9, boards: [10,11,12] },
            { round: 2, table: 1, ns: 1, ew: 7, boards: [4,5,6] },
            { round: 2, table: 3, ns: 9, ew: 4, boards: [10,11,12] },
            { round: 2, table: 4, ns: 8, ew: 5, boards: [13,14,15] },
            { round: 2, table: 5, ns: 6, ew: 2, boards: [16,17,18] },
            { round: 3, table: 1, ns: 1, ew: 8, boards: [7,8,9] },
            { round: 3, table: 3, ns: 3, ew: 9, boards: [13,14,15] },
            { round: 3, table: 4, ns: 4, ew: 6, boards: [16,17,18] },
            { round: 3, table: 5, ns: 7, ew: 5, boards: [19,20,21] },
            { round: 4, table: 1, ns: 1, ew: 9, boards: [10,11,12] },
            { round: 4, table: 2, ns: 5, ew: 2, boards: [13,14,15] },
            { round: 4, table: 4, ns: 3, ew: 7, boards: [19,20,21] },
            { round: 4, table: 5, ns: 8, ew: 6, boards: [22,23,24] },
            { round: 5, table: 2, ns: 6, ew: 5, boards: [16,17,18] },
            { round: 5, table: 3, ns: 2, ew: 4, boards: [19,20,21] },
            { round: 5, table: 4, ns: 9, ew: 8, boards: [22,23,24] },
            { round: 5, table: 5, ns: 3, ew: 7, boards: [25,26,27] },
            { round: 6, table: 1, ns: 1, ew: 4, boards: [16,17,18] },
            { round: 6, table: 2, ns: 7, ew: 6, boards: [19,20,21] },
            { round: 6, table: 3, ns: 5, ew: 3, boards: [22,23,24] },
            { round: 6, table: 5, ns: 2, ew: 8, boards: [1,2,3] },
            { round: 7, table: 1, ns: 1, ew: 3, boards: [19,20,21] },
            { round: 7, table: 2, ns: 8, ew: 7, boards: [22,23,24] },
            { round: 7, table: 3, ns: 6, ew: 2, boards: [25,26,27] },
            { round: 7, table: 5, ns: 5, ew: 9, boards: [4,5,6] },
            { round: 8, table: 1, ns: 1, ew: 2, boards: [22,23,24] },
            { round: 8, table: 2, ns: 9, ew: 8, boards: [25,26,27] },
            { round: 8, table: 3, ns: 7, ew: 6, boards: [1,2,3] },
            { round: 8, table: 4, ns: 3, ew: 4, boards: [4,5,6] },
            { round: 9, table: 1, ns: 1, ew: 5, boards: [25,26,27] },
            { round: 9, table: 3, ns: 8, ew: 7, boards: [4,5,6] },
            { round: 9, table: 4, ns: 2, ew: 3, boards: [7,8,9] },
            { round: 9, table: 5, ns: 4, ew: 6, boards: [10,11,12] }
        ]
    },

    // ─────────────────────────────────────────────
    // 10 PAIRS - 5 tables
    // ─────────────────────────────────────────────
    "10_howell_18": {
        pairs: 10, tables: 5, rounds: 9, totalBoards: 18, boardsPerRound: 2,
        type: 'howell',
        description: "5-table Howell, 18 boards, ~2.5 hrs",
        movement: [
            { round: 1, table: 1, ns: 1, ew: 6, boards: [1,2] },
            { round: 1, table: 2, ns: 2, ew: 7, boards: [3,4] },
            { round: 1, table: 3, ns: 3, ew: 8, boards: [5,6] },
            { round: 1, table: 4, ns: 4, ew: 9, boards: [7,8] },
            { round: 1, table: 5, ns: 5, ew: 10, boards: [9,10] },
            { round: 2, table: 1, ns: 1, ew: 7, boards: [3,4] },
            { round: 2, table: 2, ns: 10, ew: 3, boards: [5,6] },
            { round: 2, table: 3, ns: 9, ew: 4, boards: [7,8] },
            { round: 2, table: 4, ns: 8, ew: 5, boards: [9,10] },
            { round: 2, table: 5, ns: 6, ew: 2, boards: [11,12] },
            { round: 3, table: 1, ns: 1, ew: 8, boards: [5,6] },
            { round: 3, table: 2, ns: 2, ew: 10, boards: [7,8] },
            { round: 3, table: 3, ns: 3, ew: 9, boards: [9,10] },
            { round: 3, table: 4, ns: 4, ew: 6, boards: [11,12] },
            { round: 3, table: 5, ns: 7, ew: 5, boards: [13,14] },
            { round: 4, table: 1, ns: 1, ew: 9, boards: [7,8] },
            { round: 4, table: 2, ns: 5, ew: 2, boards: [9,10] },
            { round: 4, table: 3, ns: 10, ew: 4, boards: [11,12] },
            { round: 4, table: 4, ns: 3, ew: 7, boards: [13,14] },
            { round: 4, table: 5, ns: 8, ew: 6, boards: [15,16] },
            { round: 5, table: 1, ns: 1, ew: 10, boards: [9,10] },
            { round: 5, table: 2, ns: 6, ew: 5, boards: [11,12] },
            { round: 5, table: 3, ns: 2, ew: 4, boards: [13,14] },
            { round: 5, table: 4, ns: 9, ew: 8, boards: [15,16] },
            { round: 5, table: 5, ns: 3, ew: 7, boards: [17,18] },
            { round: 6, table: 1, ns: 1, ew: 4, boards: [11,12] },
            { round: 6, table: 2, ns: 7, ew: 6, boards: [13,14] },
            { round: 6, table: 3, ns: 5, ew: 3, boards: [15,16] },
            { round: 6, table: 4, ns: 10, ew: 9, boards: [17,18] },
            { round: 6, table: 5, ns: 2, ew: 8, boards: [1,2] },
            { round: 7, table: 1, ns: 1, ew: 3, boards: [13,14] },
            { round: 7, table: 2, ns: 8, ew: 7, boards: [15,16] },
            { round: 7, table: 3, ns: 6, ew: 2, boards: [17,18] },
            { round: 7, table: 4, ns: 4, ew: 10, boards: [1,2] },
            { round: 7, table: 5, ns: 5, ew: 9, boards: [3,4] },
            { round: 8, table: 1, ns: 1, ew: 2, boards: [15,16] },
            { round: 8, table: 2, ns: 9, ew: 8, boards: [17,18] },
            { round: 8, table: 3, ns: 7, ew: 6, boards: [1,2] },
            { round: 8, table: 4, ns: 3, ew: 4, boards: [3,4] },
            { round: 8, table: 5, ns: 10, ew: 5, boards: [5,6] },
            { round: 9, table: 1, ns: 1, ew: 5, boards: [17,18] },
            { round: 9, table: 2, ns: 10, ew: 9, boards: [1,2] },
            { round: 9, table: 3, ns: 8, ew: 7, boards: [3,4] },
            { round: 9, table: 4, ns: 2, ew: 3, boards: [5,6] },
            { round: 9, table: 5, ns: 4, ew: 6, boards: [7,8] }
        ]
    },

    "10_howell_27": {
        pairs: 10, tables: 5, rounds: 9, totalBoards: 27, boardsPerRound: 3,
        type: 'howell',
        description: "5-table Howell, 27 boards, ~3.5 hrs",
        movement: [
            { round: 1, table: 1, ns: 1, ew: 6, boards: [1,2,3] },
            { round: 1, table: 2, ns: 2, ew: 7, boards: [4,5,6] },
            { round: 1, table: 3, ns: 3, ew: 8, boards: [7,8,9] },
            { round: 1, table: 4, ns: 4, ew: 9, boards: [10,11,12] },
            { round: 1, table: 5, ns: 5, ew: 10, boards: [13,14,15] },
            { round: 2, table: 1, ns: 1, ew: 7, boards: [4,5,6] },
            { round: 2, table: 2, ns: 10, ew: 3, boards: [7,8,9] },
            { round: 2, table: 3, ns: 9, ew: 4, boards: [10,11,12] },
            { round: 2, table: 4, ns: 8, ew: 5, boards: [13,14,15] },
            { round: 2, table: 5, ns: 6, ew: 2, boards: [16,17,18] },
            { round: 3, table: 1, ns: 1, ew: 8, boards: [7,8,9] },
            { round: 3, table: 2, ns: 2, ew: 10, boards: [10,11,12] },
            { round: 3, table: 3, ns: 3, ew: 9, boards: [13,14,15] },
            { round: 3, table: 4, ns: 4, ew: 6, boards: [16,17,18] },
            { round: 3, table: 5, ns: 7, ew: 5, boards: [19,20,21] },
            { round: 4, table: 1, ns: 1, ew: 9, boards: [10,11,12] },
            { round: 4, table: 2, ns: 5, ew: 2, boards: [13,14,15] },
            { round: 4, table: 3, ns: 10, ew: 4, boards: [16,17,18] },
            { round: 4, table: 4, ns: 3, ew: 7, boards: [19,20,21] },
            { round: 4, table: 5, ns: 8, ew: 6, boards: [22,23,24] },
            { round: 5, table: 1, ns: 1, ew: 10, boards: [13,14,15] },
            { round: 5, table: 2, ns: 6, ew: 5, boards: [16,17,18] },
            { round: 5, table: 3, ns: 2, ew: 4, boards: [19,20,21] },
            { round: 5, table: 4, ns: 9, ew: 8, boards: [22,23,24] },
            { round: 5, table: 5, ns: 3, ew: 7, boards: [25,26,27] },
            { round: 6, table: 1, ns: 1, ew: 4, boards: [16,17,18] },
            { round: 6, table: 2, ns: 7, ew: 6, boards: [19,20,21] },
            { round: 6, table: 3, ns: 5, ew: 3, boards: [22,23,24] },
            { round: 6, table: 4, ns: 10, ew: 9, boards: [25,26,27] },
            { round: 6, table: 5, ns: 2, ew: 8, boards: [1,2,3] },
            { round: 7, table: 1, ns: 1, ew: 3, boards: [19,20,21] },
            { round: 7, table: 2, ns: 8, ew: 7, boards: [22,23,24] },
            { round: 7, table: 3, ns: 6, ew: 2, boards: [25,26,27] },
            { round: 7, table: 4, ns: 4, ew: 10, boards: [1,2,3] },
            { round: 7, table: 5, ns: 5, ew: 9, boards: [4,5,6] },
            { round: 8, table: 1, ns: 1, ew: 2, boards: [22,23,24] },
            { round: 8, table: 2, ns: 9, ew: 8, boards: [25,26,27] },
            { round: 8, table: 3, ns: 7, ew: 6, boards: [1,2,3] },
            { round: 8, table: 4, ns: 3, ew: 4, boards: [4,5,6] },
            { round: 8, table: 5, ns: 10, ew: 5, boards: [7,8,9] },
            { round: 9, table: 1, ns: 1, ew: 5, boards: [25,26,27] },
            { round: 9, table: 2, ns: 10, ew: 9, boards: [1,2,3] },
            { round: 9, table: 3, ns: 8, ew: 7, boards: [4,5,6] },
            { round: 9, table: 4, ns: 2, ew: 3, boards: [7,8,9] },
            { round: 9, table: 5, ns: 4, ew: 6, boards: [10,11,12] }
        ]
    },

    // ─────────────────────────────────────────────
    // MITCHELL MOVEMENTS (5-10 tables)
    // Even tables = Skip Mitchell
    // Odd tables = Standard Mitchell
    // ─────────────────────────────────────────────

    // 5 tables - 10 pairs (ODD - no skip)
    "10_mitchell_15": {
        pairs: 10, tables: 5, rounds: 5, totalBoards: 15, boardsPerRound: 3,
        type: 'mitchell',
        description: "5-table Mitchell, 15 boards, ~2 hrs",
        movement: generateMitchellMovement(5, 3, false)
    },

    "10_mitchell_25": {
        pairs: 10, tables: 5, rounds: 5, totalBoards: 25, boardsPerRound: 5,
        type: 'mitchell',
        description: "5-table Mitchell, 25 boards, ~3 hrs",
        movement: generateMitchellMovement(5, 5, false)
    },

    // 6 tables - 12 pairs (EVEN - skip needed)
    "12_mitchell_18": {
        pairs: 12, tables: 6, rounds: 6, totalBoards: 18, boardsPerRound: 3,
        type: 'mitchell',
        description: "6-table Skip Mitchell, 18 boards, ~2 hrs",
        movement: generateMitchellMovement(6, 3, true)
    },

    "12_mitchell_24": {
        pairs: 12, tables: 6, rounds: 6, totalBoards: 24, boardsPerRound: 4,
        type: 'mitchell',
        description: "6-table Skip Mitchell, 24 boards, ~3 hrs",
        movement: generateMitchellMovement(6, 4, true)
    },

    // 7 tables - 14 pairs (ODD - no skip)
    "14_mitchell_21": {
        pairs: 14, tables: 7, rounds: 7, totalBoards: 21, boardsPerRound: 3,
        type: 'mitchell',
        description: "7-table Mitchell, 21 boards, ~2.5 hrs",
        movement: generateMitchellMovement(7, 3, false)
    },

    "14_mitchell_28": {
        pairs: 14, tables: 7, rounds: 7, totalBoards: 28, boardsPerRound: 4,
        type: 'mitchell',
        description: "7-table Mitchell, 28 boards, ~3.5 hrs",
        movement: generateMitchellMovement(7, 4, false)
    },

    // 8 tables - 16 pairs (EVEN - skip needed)
    "16_mitchell_16": {
        pairs: 16, tables: 8, rounds: 8, totalBoards: 16, boardsPerRound: 2,
        type: 'mitchell',
        description: "8-table Skip Mitchell, 16 boards, ~2 hrs",
        movement: generateMitchellMovement(8, 2, true)
    },

    "16_mitchell_24": {
        pairs: 16, tables: 8, rounds: 8, totalBoards: 24, boardsPerRound: 3,
        type: 'mitchell',
        description: "8-table Skip Mitchell, 24 boards, ~3 hrs",
        movement: generateMitchellMovement(8, 3, true)
    },

    // 9 tables - 18 pairs (ODD - no skip)
    "18_mitchell_18": {
        pairs: 18, tables: 9, rounds: 9, totalBoards: 18, boardsPerRound: 2,
        type: 'mitchell',
        description: "9-table Mitchell, 18 boards, ~2 hrs",
        movement: generateMitchellMovement(9, 2, false)
    },

    "18_mitchell_27": {
        pairs: 18, tables: 9, rounds: 9, totalBoards: 27, boardsPerRound: 3,
        type: 'mitchell',
        description: "9-table Mitchell, 27 boards, ~3 hrs",
        movement: generateMitchellMovement(9, 3, false)
    },

    // 10 tables - 20 pairs (EVEN - skip needed)
    "20_mitchell_20": {
        pairs: 20, tables: 10, rounds: 10, totalBoards: 20, boardsPerRound: 2,
        type: 'mitchell',
        description: "10-table Skip Mitchell, 20 boards, ~2 hrs",
        movement: generateMitchellMovement(10, 2, true)
    },

    "20_mitchell_30": {
        pairs: 20, tables: 10, rounds: 10, totalBoards: 30, boardsPerRound: 3,
        type: 'mitchell',
        description: "10-table Skip Mitchell, 30 boards, ~3 hrs",
        movement: generateMitchellMovement(10, 3, true)
    },

    // ─────────────────────────────────────────────
    // ODD PAIR COUNTS - Mitchell with sit-out
    // Uses lower table count + 1 pair sits out each round
    // ─────────────────────────────────────────────

    // 11 pairs: 5 tables + 1 sit-out (ODD tables - no skip)
    "11_mitchell_15": {
        pairs: 11, tables: 5, rounds: 5, totalBoards: 15, boardsPerRound: 3,
        type: 'mitchell', hasSitOut: true,
        description: "5-table Mitchell, 15 boards, ~2 hrs (1 sit-out)",
        movement: generateMitchellWithSitOut(5, 3, false)
    },

    "11_mitchell_25": {
        pairs: 11, tables: 5, rounds: 5, totalBoards: 25, boardsPerRound: 5,
        type: 'mitchell', hasSitOut: true,
        description: "5-table Mitchell, 25 boards, ~3 hrs (1 sit-out)",
        movement: generateMitchellWithSitOut(5, 5, false)
    },

    // 13 pairs: 6 tables + 1 sit-out (EVEN - skip needed)
    "13_mitchell_18": {
        pairs: 13, tables: 6, rounds: 6, totalBoards: 18, boardsPerRound: 3,
        type: 'mitchell', hasSitOut: true,
        description: "6-table Skip Mitchell, 18 boards, ~2 hrs (1 sit-out)",
        movement: generateMitchellWithSitOut(6, 3, true)
    },

    "13_mitchell_24": {
        pairs: 13, tables: 6, rounds: 6, totalBoards: 24, boardsPerRound: 4,
        type: 'mitchell', hasSitOut: true,
        description: "6-table Skip Mitchell, 24 boards, ~3 hrs (1 sit-out)",
        movement: generateMitchellWithSitOut(6, 4, true)
    },

    // 15 pairs: 7 tables + 1 sit-out (ODD - no skip)
    "15_mitchell_21": {
        pairs: 15, tables: 7, rounds: 7, totalBoards: 21, boardsPerRound: 3,
        type: 'mitchell', hasSitOut: true,
        description: "7-table Mitchell, 21 boards, ~2.5 hrs (1 sit-out)",
        movement: generateMitchellWithSitOut(7, 3, false)
    },

    "15_mitchell_28": {
        pairs: 15, tables: 7, rounds: 7, totalBoards: 28, boardsPerRound: 4,
        type: 'mitchell', hasSitOut: true,
        description: "7-table Mitchell, 28 boards, ~3.5 hrs (1 sit-out)",
        movement: generateMitchellWithSitOut(7, 4, false)
    },

    // 17 pairs: 8 tables + 1 sit-out (EVEN - skip needed)
    "17_mitchell_16": {
        pairs: 17, tables: 8, rounds: 8, totalBoards: 16, boardsPerRound: 2,
        type: 'mitchell', hasSitOut: true,
        description: "8-table Skip Mitchell, 16 boards, ~2 hrs (1 sit-out)",
        movement: generateMitchellWithSitOut(8, 2, true)
    },

    "17_mitchell_24": {
        pairs: 17, tables: 8, rounds: 8, totalBoards: 24, boardsPerRound: 3,
        type: 'mitchell', hasSitOut: true,
        description: "8-table Skip Mitchell, 24 boards, ~3 hrs (1 sit-out)",
        movement: generateMitchellWithSitOut(8, 3, true)
    },

    // 19 pairs: 9 tables + 1 sit-out (ODD - no skip)
    "19_mitchell_18": {
        pairs: 19, tables: 9, rounds: 9, totalBoards: 18, boardsPerRound: 2,
        type: 'mitchell', hasSitOut: true,
        description: "9-table Mitchell, 18 boards, ~2 hrs (1 sit-out)",
        movement: generateMitchellWithSitOut(9, 2, false)
    },

    "19_mitchell_27": {
        pairs: 19, tables: 9, rounds: 9, totalBoards: 27, boardsPerRound: 3,
        type: 'mitchell', hasSitOut: true,
        description: "9-table Mitchell, 27 boards, ~3 hrs (1 sit-out)",
        movement: generateMitchellWithSitOut(9, 3, false)
    }

};

// Export for use in duplicate.js and duplicateTemplates.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ENHANCED_MOVEMENTS;
}

if (typeof window !== 'undefined') {
    window.ENHANCED_MOVEMENTS = ENHANCED_MOVEMENTS;

    // If duplicate bridge is already running, reload its movements now
    if (window.duplicateBridge && window.duplicateBridge.initializeMovements) {
        window.duplicateBridge.initializeMovements();
        console.log('✅ Notified duplicate bridge to reload movements');
    }
}

console.log('✅ Enhanced Movements Module loaded with', Object.keys(ENHANCED_MOVEMENTS).length, 'movements');
