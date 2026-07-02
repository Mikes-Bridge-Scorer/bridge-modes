/**
 * Enhanced Movements — CORE (generator-based)
 *
 * This file contains ONLY movements that are produced by generator functions
 * proven mathematically correct — no self-play, no repeated pairings, no board
 * replays, verified by the movement-test-tool harness.
 *
 * If a pair count needs anything more than a straightforward Mitchell rotation
 * (a real Howell, a Hesitation Mitchell, etc.) it does NOT belong in this file —
 * it goes in enhanced-movements-hardcoded.js instead, sourced from a published
 * EBU/ACBL movement card. This file should stay small and boring on purpose.
 *
 * Two generators live here:
 *
 * 1. generateMitchellMovement(tables, boardsPerRound, useSkip)
 *    Standard full-table Mitchell. Handles both odd tables (no skip needed)
 *    and even tables (Skip Mitchell — skip round = tables/2 + 1).
 *    Rounds = tables (odd) or tables-1 (even, skip variant).
 *
 * 2. generateSitOutMitchell(realTables, boardsPerRound)
 *    Straight sit-out (half-table) Mitchell for odd pair counts where
 *    realTables is EVEN — meaning physicalTables (realTables+1) is ODD and
 *    no skip is required. This is standard, EBU-documented practice (see
 *    gambiter.com/bridge/Duplicate_bridge_movements.html: "set up as if there
 *    were an odd number of tables and run a straight Mitchell").
 *    IMPORTANT: this generator must only ever be called with realTables even
 *    (pairs = 2*realTables+1, i.e. 9, 13, 17...). For realTables odd
 *    (11, 15, 19 pairs) a skip would be needed alongside the sit-out, which
 *    EBU sources flag as a poor combination — use a Hesitation Mitchell from
 *    the hardcoded file instead.
 */

function generateMitchellMovement(tables, boardsPerRound, useSkip) {
    const rounds = (useSkip && tables % 2 === 0) ? tables - 1 : tables;
    const skipRound = (useSkip && tables % 2 === 0) ? Math.floor(tables / 2) + 1 : null;
    const movement = [];

    for (let round = 1; round <= rounds; round++) {
        let ewOffset = round - 1;
        if (skipRound && round >= skipRound) ewOffset += 1;
        const boardOffset = round - 1;

        for (let table = 1; table <= tables; table++) {
            const nsPair = table;
            const ewPair = tables + ((table - 1 - ewOffset) % tables + tables) % tables + 1;
            const boardSetIndex = (table - 1 + boardOffset) % tables;
            const startBoard = boardSetIndex * boardsPerRound + 1;
            const boardList = [];
            for (let b = 0; b < boardsPerRound; b++) boardList.push(startBoard + b);
            movement.push({ round, table, ns: nsPair, ew: ewPair, boards: boardList });
        }
    }
    return movement;
}

function generateSitOutMitchell(realTables, boardsPerRound) {
    if (realTables % 2 !== 0) {
        throw new Error(
            `generateSitOutMitchell called with realTables=${realTables} (odd). ` +
            `This generator is only valid for even realTables (safe, no-skip case). ` +
            `For odd realTables (needs a skip), use a hardcoded Hesitation Mitchell instead.`
        );
    }
    const physicalTables = realTables + 1; // always odd here, by construction
    const rounds = realTables;
    const movement = [];

    for (let round = 1; round <= rounds; round++) {
        const ewOffset = round - 1;
        const boardOffset = round - 1;

        for (let table = 1; table <= physicalTables; table++) {
            const ewIdx = ((table - 1) - ewOffset + physicalTables * 100) % physicalTables;
            const ewPair = realTables + 1 + ewIdx;
            const boardSetIdx = ((table - 1) + boardOffset) % physicalTables;
            const startBoard = boardSetIdx * boardsPerRound + 1;
            const boardList = [];
            for (let b = 0; b < boardsPerRound; b++) boardList.push(startBoard + b);

            if (table === physicalTables) {
                movement.push({ round, table, ns: '', ew: ewPair, boards: [] });
            } else {
                movement.push({ round, table, ns: table, ew: ewPair, boards: boardList });
            }
        }
    }
    return movement;
}

const CORE_MOVEMENTS = {

    // ── Plain / Skip Mitchell (8 pairs, 4 tables) ──
    "8_mitchell_12":  { pairs: 8,  tables: 4, rounds: 3, totalBoards: 12, boardsPerRound: 3, type: 'mitchell', skipRound: 3, description: "4-table Skip Mitchell, 12 boards, 3 rounds, ~1.5 hrs", movement: generateMitchellMovement(4, 3, true) },
    "8_mitchell_16":  { pairs: 8,  tables: 4, rounds: 3, totalBoards: 16, boardsPerRound: 4, type: 'mitchell', skipRound: 3, description: "4-table Skip Mitchell, 16 boards, 3 rounds, ~2 hrs", movement: generateMitchellMovement(4, 4, true) },
    "8_mitchell_24":  { pairs: 8,  tables: 4, rounds: 3, totalBoards: 24, boardsPerRound: 6, type: 'mitchell', skipRound: 3, description: "4-table Skip Mitchell, 24 boards, 3 rounds, ~3 hrs", movement: generateMitchellMovement(4, 6, true) },

    "10_mitchell_15": { pairs: 10, tables: 5, rounds: 5, totalBoards: 15, boardsPerRound: 3, type: 'mitchell', description: "5-table Mitchell, 15 boards, ~2 hrs", movement: generateMitchellMovement(5, 3, false) },
    "10_mitchell_25": { pairs: 10, tables: 5, rounds: 5, totalBoards: 25, boardsPerRound: 5, type: 'mitchell', description: "5-table Mitchell, 25 boards, ~3 hrs", movement: generateMitchellMovement(5, 5, false) },

    "12_mitchell_18": { pairs: 12, tables: 6, rounds: 5, totalBoards: 18, boardsPerRound: 3, type: 'mitchell', skipRound: 4, description: "6-table Skip Mitchell, 18 boards, 5 rounds, ~2 hrs", movement: generateMitchellMovement(6, 3, true) },
    "12_mitchell_24": { pairs: 12, tables: 6, rounds: 5, totalBoards: 24, boardsPerRound: 4, type: 'mitchell', skipRound: 4, description: "6-table Skip Mitchell, 24 boards, 5 rounds, ~3 hrs", movement: generateMitchellMovement(6, 4, true) },

    "14_mitchell_21": { pairs: 14, tables: 7, rounds: 7, totalBoards: 21, boardsPerRound: 3, type: 'mitchell', description: "7-table Mitchell, 21 boards, ~2.5 hrs", movement: generateMitchellMovement(7, 3, false) },
    "14_mitchell_28": { pairs: 14, tables: 7, rounds: 7, totalBoards: 28, boardsPerRound: 4, type: 'mitchell', description: "7-table Mitchell, 28 boards, ~3.5 hrs", movement: generateMitchellMovement(7, 4, false) },

    "16_mitchell_16": { pairs: 16, tables: 8, rounds: 7, totalBoards: 16, boardsPerRound: 2, type: 'mitchell', skipRound: 5, description: "8-table Skip Mitchell, 16 boards, 7 rounds, ~2 hrs", movement: generateMitchellMovement(8, 2, true) },
    "16_mitchell_24": { pairs: 16, tables: 8, rounds: 7, totalBoards: 24, boardsPerRound: 3, type: 'mitchell', skipRound: 5, description: "8-table Skip Mitchell, 24 boards, 7 rounds, ~3 hrs", movement: generateMitchellMovement(8, 3, true) },

    "18_mitchell_18": { pairs: 18, tables: 9, rounds: 9, totalBoards: 18, boardsPerRound: 2, type: 'mitchell', description: "9-table Mitchell, 18 boards, ~2 hrs", movement: generateMitchellMovement(9, 2, false) },
    "18_mitchell_27": { pairs: 18, tables: 9, rounds: 9, totalBoards: 27, boardsPerRound: 3, type: 'mitchell', description: "9-table Mitchell, 27 boards, ~3 hrs", movement: generateMitchellMovement(9, 3, false) },

    "20_mitchell_20": { pairs: 20, tables: 10, rounds: 9, totalBoards: 20, boardsPerRound: 2, type: 'mitchell', skipRound: 6, description: "10-table Skip Mitchell, 20 boards, 9 rounds, ~2 hrs", movement: generateMitchellMovement(10, 2, true) },
    "20_mitchell_30": { pairs: 20, tables: 10, rounds: 9, totalBoards: 30, boardsPerRound: 3, type: 'mitchell', skipRound: 6, description: "10-table Skip Mitchell, 30 boards, 9 rounds, ~3 hrs", movement: generateMitchellMovement(10, 3, true) },

    // ── Straight sit-out Mitchell (safe: realTables even, no skip needed) ──
    "9_mitchell_16":  { pairs: 9,  tables: 5, rounds: 4, totalBoards: 20, boardsPerRound: 4, type: 'mitchell', hasSitOut: true, description: "4.5-table Mitchell, 16 boards, ~2 hrs (1 sit-out)", movement: generateSitOutMitchell(4, 4) },
    "9_mitchell_24":  { pairs: 9,  tables: 5, rounds: 4, totalBoards: 30, boardsPerRound: 6, type: 'mitchell', hasSitOut: true, description: "4.5-table Mitchell, 24 boards, ~3 hrs (1 sit-out)", movement: generateSitOutMitchell(4, 6) },

    "13_mitchell_18": { pairs: 13, tables: 7, rounds: 6, totalBoards: 21, boardsPerRound: 3, type: 'mitchell', hasSitOut: true, description: "6.5-table Mitchell, 18 boards, ~2 hrs (1 sit-out)", movement: generateSitOutMitchell(6, 3) },
    "13_mitchell_24": { pairs: 13, tables: 7, rounds: 6, totalBoards: 28, boardsPerRound: 4, type: 'mitchell', hasSitOut: true, description: "6.5-table Mitchell, 24 boards, ~3 hrs (1 sit-out)", movement: generateSitOutMitchell(6, 4) },

    "17_mitchell_16": { pairs: 17, tables: 9, rounds: 8, totalBoards: 18, boardsPerRound: 2, type: 'mitchell', hasSitOut: true, description: "8.5-table Mitchell, 16 boards, ~2 hrs (1 sit-out)", movement: generateSitOutMitchell(8, 2) },
    "17_mitchell_24": { pairs: 17, tables: 9, rounds: 8, totalBoards: 27, boardsPerRound: 3, type: 'mitchell', hasSitOut: true, description: "8.5-table Mitchell, 24 boards, ~3 hrs (1 sit-out)", movement: generateSitOutMitchell(8, 3) },

};

/**
 * Enhanced Movements — HARDCODED (published-source movements)
 *
 * Every movement in this file is static data, not the output of a generator
 * function. It's here because no simple formula produces a correct version:
 *
 *  - HOWELL movements (4-10 pairs): standard EBU/ACBL Howell movements.
 *    Odd pair counts (5, 7, 9) use the documented "ghost pair" technique —
 *    a full (N+1)-pair Howell where pair N+1 is virtual; whichever real pair
 *    is scheduled to meet the ghost that round sits out instead. This is a
 *    genuine, provably valid Howell in disguise, not an approximation.
 *
 *  - HESITATION MITCHELL movements (11, 15 pairs): the EBU-documented answer
 *    for odd pair counts that would otherwise need a skip AND a sit-out in
 *    the same movement (a combination EBU sources explicitly flag as poor).
 *    Pairing schedule follows the published EBU technique (John Pain, EBU
 *    Movement Manual): stationary NS pairs 1..(T-1), moving pairs cycle
 *    EW1->EW2->...->EWT->NS(T)->EW1. Board-set assignment (avoiding any pair
 *    ever repeating a board) was solved as a constraint-satisfaction problem
 *    and verified: 0 self-play, 0 illegal repeated pairings, 0 board replays,
 *    every pair sits out either 0 or 1 times across the session.
 *
 * ALL movements in this file have been run through the validation harness
 * (movement-test-tool.html logic) with zero errors before being committed here.
 *
 * STILL PENDING: 19-pair Hesitation Mitchell (10 tables). The constraint
 * solver did not converge in reasonable time at this size — needs either a
 * longer solve, a smarter algorithm, or the literal published EBU card
 * (EBU Movement Manual, pages covering 10-table Hesitation Mitchell / Bridge
 * Shop). Until then, 19 pairs should NOT be offered as a movement option in
 * the app — better to have no option than a wrong one.
 */

const HARDCODED_MOVEMENTS = {

    "4_howell_6": {
        pairs: 4, tables: 2, rounds: 6, totalBoards: 6, boardsPerRound: 1,
        type: 'howell',
        description: "2-table Howell, 6 boards, ~45 min (short game)",
        movement: [
            { round: 1, table: 1, ns: 4, ew: 1, boards: [1] },
            { round: 1, table: 2, ns: 2, ew: 3, boards: [2] },
            { round: 2, table: 1, ns: 4, ew: 1, boards: [2] },
            { round: 2, table: 2, ns: 3, ew: 2, boards: [1] },
            { round: 3, table: 1, ns: 4, ew: 2, boards: [3] },
            { round: 3, table: 2, ns: 3, ew: 1, boards: [4] },
            { round: 4, table: 1, ns: 4, ew: 2, boards: [4] },
            { round: 4, table: 2, ns: 1, ew: 3, boards: [3] },
            { round: 5, table: 1, ns: 4, ew: 3, boards: [5] },
            { round: 5, table: 2, ns: 1, ew: 2, boards: [6] },
            { round: 6, table: 1, ns: 4, ew: 3, boards: [6] },
            { round: 6, table: 2, ns: 2, ew: 1, boards: [5] }
        ]
    },

    "4_howell_12": {
        pairs: 4, tables: 2, rounds: 6, totalBoards: 12, boardsPerRound: 2,
        type: 'howell',
        description: "2-table Howell, 12 boards, ~1.5 hrs (2 boards per round)",
        movement: [
            { round: 1, table: 1, ns: 4, ew: 1, boards: [1,2] },
            { round: 1, table: 2, ns: 2, ew: 3, boards: [3,4] },
            { round: 2, table: 1, ns: 4, ew: 1, boards: [3,4] },
            { round: 2, table: 2, ns: 3, ew: 2, boards: [1,2] },
            { round: 3, table: 1, ns: 4, ew: 2, boards: [5,6] },
            { round: 3, table: 2, ns: 3, ew: 1, boards: [7,8] },
            { round: 4, table: 1, ns: 4, ew: 2, boards: [7,8] },
            { round: 4, table: 2, ns: 1, ew: 3, boards: [5,6] },
            { round: 5, table: 1, ns: 4, ew: 3, boards: [9,10] },
            { round: 5, table: 2, ns: 1, ew: 2, boards: [11,12] },
            { round: 6, table: 1, ns: 4, ew: 3, boards: [11,12] },
            { round: 6, table: 2, ns: 2, ew: 1, boards: [9,10] }
        ]
    },

    "4_howell_24": {
        pairs: 4, tables: 2, rounds: 6, totalBoards: 24, boardsPerRound: 4,
        type: 'howell',
        description: "2-table Howell, 24 boards, ~3 hrs (4 boards per round, ACBL)",
        movement: [
            { round: 1, table: 1, ns: 4, ew: 1, boards: [1,2,3,4] },
            { round: 1, table: 2, ns: 2, ew: 3, boards: [5,6,7,8] },
            { round: 2, table: 1, ns: 4, ew: 1, boards: [5,6,7,8] },
            { round: 2, table: 2, ns: 3, ew: 2, boards: [1,2,3,4] },
            { round: 3, table: 1, ns: 4, ew: 2, boards: [9,10,11,12] },
            { round: 3, table: 2, ns: 3, ew: 1, boards: [13,14,15,16] },
            { round: 4, table: 1, ns: 4, ew: 2, boards: [13,14,15,16] },
            { round: 4, table: 2, ns: 1, ew: 3, boards: [9,10,11,12] },
            { round: 5, table: 1, ns: 4, ew: 3, boards: [17,18,19,20] },
            { round: 5, table: 2, ns: 1, ew: 2, boards: [21,22,23,24] },
            { round: 6, table: 1, ns: 4, ew: 3, boards: [21,22,23,24] },
            { round: 6, table: 2, ns: 2, ew: 1, boards: [17,18,19,20] }
        ]
    },

    "5_howell_15": {
        pairs: 5, tables: 3, rounds: 5, totalBoards: 15, boardsPerRound: 3,
        type: 'howell', hasSitOut: true,
        description: "2.5-table Howell, 15 boards, ~2 hrs (1 sit-out)",
        movement: [
            { round: 1, table: 1, ns: 1, ew: 2, boards: [1,2,3] },
            { round: 1, table: 2, ns: 3, ew: 6, boards: [1,2,3] },
            { round: 1, table: 3, ns: 4, ew: 5, boards: [1,2,3] },
            { round: 2, table: 1, ns: 1, ew: 3, boards: [4,5,6] },
            { round: 2, table: 2, ns: 4, ew: 2, boards: [4,5,6] },
            { round: 2, table: 3, ns: 5, ew: 6, boards: [4,5,6] },
            { round: 3, table: 1, ns: 1, ew: 4, boards: [7,8,9] },
            { round: 3, table: 2, ns: 5, ew: 3, boards: [7,8,9] },
            { round: 3, table: 3, ns: 6, ew: 2, boards: [7,8,9] },
            { round: 4, table: 1, ns: 1, ew: 5, boards: [10,11,12] },
            { round: 4, table: 2, ns: 6, ew: 4, boards: [10,11,12] },
            { round: 4, table: 3, ns: 2, ew: 3, boards: [10,11,12] },
            { round: 5, table: 1, ns: 1, ew: 6, boards: [13,14,15] },
            { round: 5, table: 2, ns: 2, ew: 5, boards: [13,14,15] },
            { round: 5, table: 3, ns: 3, ew: 4, boards: [13,14,15] }
        ]
    },

    "5_howell_25": {
        pairs: 5, tables: 3, rounds: 5, totalBoards: 25, boardsPerRound: 5,
        type: 'howell', hasSitOut: true,
        description: "2.5-table Howell, 25 boards, ~3 hrs (1 sit-out)",
        movement: [
            { round: 1, table: 1, ns: 1, ew: 2, boards: [1,2,3,4,5] },
            { round: 1, table: 2, ns: 3, ew: 6, boards: [1,2,3,4,5] },
            { round: 1, table: 3, ns: 4, ew: 5, boards: [1,2,3,4,5] },
            { round: 2, table: 1, ns: 1, ew: 3, boards: [6,7,8,9,10] },
            { round: 2, table: 2, ns: 4, ew: 2, boards: [6,7,8,9,10] },
            { round: 2, table: 3, ns: 5, ew: 6, boards: [6,7,8,9,10] },
            { round: 3, table: 1, ns: 1, ew: 4, boards: [11,12,13,14,15] },
            { round: 3, table: 2, ns: 5, ew: 3, boards: [11,12,13,14,15] },
            { round: 3, table: 3, ns: 6, ew: 2, boards: [11,12,13,14,15] },
            { round: 4, table: 1, ns: 1, ew: 5, boards: [16,17,18,19,20] },
            { round: 4, table: 2, ns: 6, ew: 4, boards: [16,17,18,19,20] },
            { round: 4, table: 3, ns: 2, ew: 3, boards: [16,17,18,19,20] },
            { round: 5, table: 1, ns: 1, ew: 6, boards: [21,22,23,24,25] },
            { round: 5, table: 2, ns: 2, ew: 5, boards: [21,22,23,24,25] },
            { round: 5, table: 3, ns: 3, ew: 4, boards: [21,22,23,24,25] }
        ]
    },

    "6_howell_10": {
        pairs: 6, tables: 3, rounds: 5, totalBoards: 10, boardsPerRound: 2,
        type: 'howell',
        description: "3-table Howell, 10 boards, ~1.5 hrs (short game)",
        movement: [
            { round: 1, table: 1, ns: 1, ew: 2, boards: [1,2] },
            { round: 1, table: 2, ns: 3, ew: 6, boards: [1,2] },
            { round: 1, table: 3, ns: 4, ew: 5, boards: [1,2] },
            { round: 2, table: 1, ns: 1, ew: 3, boards: [3,4] },
            { round: 2, table: 2, ns: 4, ew: 2, boards: [3,4] },
            { round: 2, table: 3, ns: 5, ew: 6, boards: [3,4] },
            { round: 3, table: 1, ns: 1, ew: 4, boards: [5,6] },
            { round: 3, table: 2, ns: 5, ew: 3, boards: [5,6] },
            { round: 3, table: 3, ns: 6, ew: 2, boards: [5,6] },
            { round: 4, table: 1, ns: 1, ew: 5, boards: [7,8] },
            { round: 4, table: 2, ns: 6, ew: 4, boards: [7,8] },
            { round: 4, table: 3, ns: 2, ew: 3, boards: [7,8] },
            { round: 5, table: 1, ns: 1, ew: 6, boards: [9,10] },
            { round: 5, table: 2, ns: 2, ew: 5, boards: [9,10] },
            { round: 5, table: 3, ns: 3, ew: 4, boards: [9,10] }
        ]
    },

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

    "7_howell_14": {
        pairs: 7, tables: 4, rounds: 7, totalBoards: 14, boardsPerRound: 2,
        type: 'howell', hasSitOut: true,
        description: "3.5-table Howell, 14 boards, ~2 hrs (1 sit-out)",
        movement: [
            { round: 1, table: 1, ns: 1, ew: 2, boards: [1,2] },
            { round: 1, table: 2, ns: 3, ew: 8, boards: [1,2] },
            { round: 1, table: 3, ns: 4, ew: 7, boards: [1,2] },
            { round: 1, table: 4, ns: 5, ew: 6, boards: [1,2] },
            { round: 2, table: 1, ns: 1, ew: 3, boards: [3,4] },
            { round: 2, table: 2, ns: 4, ew: 2, boards: [3,4] },
            { round: 2, table: 3, ns: 5, ew: 8, boards: [3,4] },
            { round: 2, table: 4, ns: 6, ew: 7, boards: [3,4] },
            { round: 3, table: 1, ns: 1, ew: 4, boards: [5,6] },
            { round: 3, table: 2, ns: 5, ew: 3, boards: [5,6] },
            { round: 3, table: 3, ns: 6, ew: 2, boards: [5,6] },
            { round: 3, table: 4, ns: 7, ew: 8, boards: [5,6] },
            { round: 4, table: 1, ns: 1, ew: 5, boards: [7,8] },
            { round: 4, table: 2, ns: 6, ew: 4, boards: [7,8] },
            { round: 4, table: 3, ns: 7, ew: 3, boards: [7,8] },
            { round: 4, table: 4, ns: 8, ew: 2, boards: [7,8] },
            { round: 5, table: 1, ns: 1, ew: 6, boards: [9,10] },
            { round: 5, table: 2, ns: 7, ew: 5, boards: [9,10] },
            { round: 5, table: 3, ns: 8, ew: 4, boards: [9,10] },
            { round: 5, table: 4, ns: 2, ew: 3, boards: [9,10] },
            { round: 6, table: 1, ns: 1, ew: 7, boards: [11,12] },
            { round: 6, table: 2, ns: 8, ew: 6, boards: [11,12] },
            { round: 6, table: 3, ns: 2, ew: 5, boards: [11,12] },
            { round: 6, table: 4, ns: 3, ew: 4, boards: [11,12] },
            { round: 7, table: 1, ns: 1, ew: 8, boards: [13,14] },
            { round: 7, table: 2, ns: 2, ew: 7, boards: [13,14] },
            { round: 7, table: 3, ns: 3, ew: 6, boards: [13,14] },
            { round: 7, table: 4, ns: 4, ew: 5, boards: [13,14] }
        ]
    },

    "7_howell_28": {
        pairs: 7, tables: 4, rounds: 7, totalBoards: 28, boardsPerRound: 4,
        type: 'howell', hasSitOut: true,
        description: "3.5-table Howell, 28 boards, ~3.5 hrs (1 sit-out)",
        movement: [
            { round: 1, table: 1, ns: 1, ew: 2, boards: [1,2,3,4] },
            { round: 1, table: 2, ns: 3, ew: 8, boards: [1,2,3,4] },
            { round: 1, table: 3, ns: 4, ew: 7, boards: [1,2,3,4] },
            { round: 1, table: 4, ns: 5, ew: 6, boards: [1,2,3,4] },
            { round: 2, table: 1, ns: 1, ew: 3, boards: [5,6,7,8] },
            { round: 2, table: 2, ns: 4, ew: 2, boards: [5,6,7,8] },
            { round: 2, table: 3, ns: 5, ew: 8, boards: [5,6,7,8] },
            { round: 2, table: 4, ns: 6, ew: 7, boards: [5,6,7,8] },
            { round: 3, table: 1, ns: 1, ew: 4, boards: [9,10,11,12] },
            { round: 3, table: 2, ns: 5, ew: 3, boards: [9,10,11,12] },
            { round: 3, table: 3, ns: 6, ew: 2, boards: [9,10,11,12] },
            { round: 3, table: 4, ns: 7, ew: 8, boards: [9,10,11,12] },
            { round: 4, table: 1, ns: 1, ew: 5, boards: [13,14,15,16] },
            { round: 4, table: 2, ns: 6, ew: 4, boards: [13,14,15,16] },
            { round: 4, table: 3, ns: 7, ew: 3, boards: [13,14,15,16] },
            { round: 4, table: 4, ns: 8, ew: 2, boards: [13,14,15,16] },
            { round: 5, table: 1, ns: 1, ew: 6, boards: [17,18,19,20] },
            { round: 5, table: 2, ns: 7, ew: 5, boards: [17,18,19,20] },
            { round: 5, table: 3, ns: 8, ew: 4, boards: [17,18,19,20] },
            { round: 5, table: 4, ns: 2, ew: 3, boards: [17,18,19,20] },
            { round: 6, table: 1, ns: 1, ew: 7, boards: [21,22,23,24] },
            { round: 6, table: 2, ns: 8, ew: 6, boards: [21,22,23,24] },
            { round: 6, table: 3, ns: 2, ew: 5, boards: [21,22,23,24] },
            { round: 6, table: 4, ns: 3, ew: 4, boards: [21,22,23,24] },
            { round: 7, table: 1, ns: 1, ew: 8, boards: [25,26,27,28] },
            { round: 7, table: 2, ns: 2, ew: 7, boards: [25,26,27,28] },
            { round: 7, table: 3, ns: 3, ew: 6, boards: [25,26,27,28] },
            { round: 7, table: 4, ns: 4, ew: 5, boards: [25,26,27,28] }
        ]
    },

    "8_howell_14": {
        pairs: 8, tables: 4, rounds: 7, totalBoards: 14, boardsPerRound: 2,
        type: 'howell',
        description: "4-table Howell, 14 boards, ~2 hrs",
        movement: [
            { round: 1, table: 1, ns: 1, ew: 2, boards: [1,2] },
            { round: 1, table: 2, ns: 3, ew: 8, boards: [1,2] },
            { round: 1, table: 3, ns: 4, ew: 7, boards: [1,2] },
            { round: 1, table: 4, ns: 5, ew: 6, boards: [1,2] },
            { round: 2, table: 1, ns: 1, ew: 3, boards: [3,4] },
            { round: 2, table: 2, ns: 4, ew: 2, boards: [3,4] },
            { round: 2, table: 3, ns: 5, ew: 8, boards: [3,4] },
            { round: 2, table: 4, ns: 6, ew: 7, boards: [3,4] },
            { round: 3, table: 1, ns: 1, ew: 4, boards: [5,6] },
            { round: 3, table: 2, ns: 5, ew: 3, boards: [5,6] },
            { round: 3, table: 3, ns: 6, ew: 2, boards: [5,6] },
            { round: 3, table: 4, ns: 7, ew: 8, boards: [5,6] },
            { round: 4, table: 1, ns: 1, ew: 5, boards: [7,8] },
            { round: 4, table: 2, ns: 6, ew: 4, boards: [7,8] },
            { round: 4, table: 3, ns: 7, ew: 3, boards: [7,8] },
            { round: 4, table: 4, ns: 8, ew: 2, boards: [7,8] },
            { round: 5, table: 1, ns: 1, ew: 6, boards: [9,10] },
            { round: 5, table: 2, ns: 7, ew: 5, boards: [9,10] },
            { round: 5, table: 3, ns: 8, ew: 4, boards: [9,10] },
            { round: 5, table: 4, ns: 2, ew: 3, boards: [9,10] },
            { round: 6, table: 1, ns: 1, ew: 7, boards: [11,12] },
            { round: 6, table: 2, ns: 8, ew: 6, boards: [11,12] },
            { round: 6, table: 3, ns: 2, ew: 5, boards: [11,12] },
            { round: 6, table: 4, ns: 3, ew: 4, boards: [11,12] },
            { round: 7, table: 1, ns: 1, ew: 8, boards: [13,14] },
            { round: 7, table: 2, ns: 2, ew: 7, boards: [13,14] },
            { round: 7, table: 3, ns: 3, ew: 6, boards: [13,14] },
            { round: 7, table: 4, ns: 4, ew: 5, boards: [13,14] }
        ]
    },

    "8_howell_28": {
        pairs: 8, tables: 4, rounds: 7, totalBoards: 28, boardsPerRound: 4,
        type: 'howell',
        description: "4-table Howell, 28 boards, ~3.5 hrs",
        movement: [
            { round: 1, table: 1, ns: 1, ew: 2, boards: [1,2,3,4] },
            { round: 1, table: 2, ns: 3, ew: 8, boards: [1,2,3,4] },
            { round: 1, table: 3, ns: 4, ew: 7, boards: [1,2,3,4] },
            { round: 1, table: 4, ns: 5, ew: 6, boards: [1,2,3,4] },
            { round: 2, table: 1, ns: 1, ew: 3, boards: [5,6,7,8] },
            { round: 2, table: 2, ns: 4, ew: 2, boards: [5,6,7,8] },
            { round: 2, table: 3, ns: 5, ew: 8, boards: [5,6,7,8] },
            { round: 2, table: 4, ns: 6, ew: 7, boards: [5,6,7,8] },
            { round: 3, table: 1, ns: 1, ew: 4, boards: [9,10,11,12] },
            { round: 3, table: 2, ns: 5, ew: 3, boards: [9,10,11,12] },
            { round: 3, table: 3, ns: 6, ew: 2, boards: [9,10,11,12] },
            { round: 3, table: 4, ns: 7, ew: 8, boards: [9,10,11,12] },
            { round: 4, table: 1, ns: 1, ew: 5, boards: [13,14,15,16] },
            { round: 4, table: 2, ns: 6, ew: 4, boards: [13,14,15,16] },
            { round: 4, table: 3, ns: 7, ew: 3, boards: [13,14,15,16] },
            { round: 4, table: 4, ns: 8, ew: 2, boards: [13,14,15,16] },
            { round: 5, table: 1, ns: 1, ew: 6, boards: [17,18,19,20] },
            { round: 5, table: 2, ns: 7, ew: 5, boards: [17,18,19,20] },
            { round: 5, table: 3, ns: 8, ew: 4, boards: [17,18,19,20] },
            { round: 5, table: 4, ns: 2, ew: 3, boards: [17,18,19,20] },
            { round: 6, table: 1, ns: 1, ew: 7, boards: [21,22,23,24] },
            { round: 6, table: 2, ns: 8, ew: 6, boards: [21,22,23,24] },
            { round: 6, table: 3, ns: 2, ew: 5, boards: [21,22,23,24] },
            { round: 6, table: 4, ns: 3, ew: 4, boards: [21,22,23,24] },
            { round: 7, table: 1, ns: 1, ew: 8, boards: [25,26,27,28] },
            { round: 7, table: 2, ns: 2, ew: 7, boards: [25,26,27,28] },
            { round: 7, table: 3, ns: 3, ew: 6, boards: [25,26,27,28] },
            { round: 7, table: 4, ns: 4, ew: 5, boards: [25,26,27,28] }
        ]
    },

    "9_howell_18": {
        pairs: 9, tables: 5, rounds: 9, totalBoards: 18, boardsPerRound: 2,
        type: 'howell', hasSitOut: true,
        description: "4.5-table Howell, 18 boards, ~2.5 hrs (1 sit-out)",
        movement: [
            { round: 1, table: 1, ns: 1, ew: 2, boards: [1,2] },
            { round: 1, table: 2, ns: 3, ew: 10, boards: [1,2] },
            { round: 1, table: 3, ns: 4, ew: 9, boards: [1,2] },
            { round: 1, table: 4, ns: 5, ew: 8, boards: [1,2] },
            { round: 1, table: 5, ns: 6, ew: 7, boards: [1,2] },
            { round: 2, table: 1, ns: 1, ew: 3, boards: [3,4] },
            { round: 2, table: 2, ns: 4, ew: 2, boards: [3,4] },
            { round: 2, table: 3, ns: 5, ew: 10, boards: [3,4] },
            { round: 2, table: 4, ns: 6, ew: 9, boards: [3,4] },
            { round: 2, table: 5, ns: 7, ew: 8, boards: [3,4] },
            { round: 3, table: 1, ns: 1, ew: 4, boards: [5,6] },
            { round: 3, table: 2, ns: 5, ew: 3, boards: [5,6] },
            { round: 3, table: 3, ns: 6, ew: 2, boards: [5,6] },
            { round: 3, table: 4, ns: 7, ew: 10, boards: [5,6] },
            { round: 3, table: 5, ns: 8, ew: 9, boards: [5,6] },
            { round: 4, table: 1, ns: 1, ew: 5, boards: [7,8] },
            { round: 4, table: 2, ns: 6, ew: 4, boards: [7,8] },
            { round: 4, table: 3, ns: 7, ew: 3, boards: [7,8] },
            { round: 4, table: 4, ns: 8, ew: 2, boards: [7,8] },
            { round: 4, table: 5, ns: 9, ew: 10, boards: [7,8] },
            { round: 5, table: 1, ns: 1, ew: 6, boards: [9,10] },
            { round: 5, table: 2, ns: 7, ew: 5, boards: [9,10] },
            { round: 5, table: 3, ns: 8, ew: 4, boards: [9,10] },
            { round: 5, table: 4, ns: 9, ew: 3, boards: [9,10] },
            { round: 5, table: 5, ns: 10, ew: 2, boards: [9,10] },
            { round: 6, table: 1, ns: 1, ew: 7, boards: [11,12] },
            { round: 6, table: 2, ns: 8, ew: 6, boards: [11,12] },
            { round: 6, table: 3, ns: 9, ew: 5, boards: [11,12] },
            { round: 6, table: 4, ns: 10, ew: 4, boards: [11,12] },
            { round: 6, table: 5, ns: 2, ew: 3, boards: [11,12] },
            { round: 7, table: 1, ns: 1, ew: 8, boards: [13,14] },
            { round: 7, table: 2, ns: 9, ew: 7, boards: [13,14] },
            { round: 7, table: 3, ns: 10, ew: 6, boards: [13,14] },
            { round: 7, table: 4, ns: 2, ew: 5, boards: [13,14] },
            { round: 7, table: 5, ns: 3, ew: 4, boards: [13,14] },
            { round: 8, table: 1, ns: 1, ew: 9, boards: [15,16] },
            { round: 8, table: 2, ns: 10, ew: 8, boards: [15,16] },
            { round: 8, table: 3, ns: 2, ew: 7, boards: [15,16] },
            { round: 8, table: 4, ns: 3, ew: 6, boards: [15,16] },
            { round: 8, table: 5, ns: 4, ew: 5, boards: [15,16] },
            { round: 9, table: 1, ns: 1, ew: 10, boards: [17,18] },
            { round: 9, table: 2, ns: 2, ew: 9, boards: [17,18] },
            { round: 9, table: 3, ns: 3, ew: 8, boards: [17,18] },
            { round: 9, table: 4, ns: 4, ew: 7, boards: [17,18] },
            { round: 9, table: 5, ns: 5, ew: 6, boards: [17,18] }
        ]
    },

    "9_howell_27": {
        pairs: 9, tables: 5, rounds: 9, totalBoards: 27, boardsPerRound: 3,
        type: 'howell', hasSitOut: true,
        description: "4.5-table Howell, 27 boards, ~3.5 hrs (1 sit-out)",
        movement: [
            { round: 1, table: 1, ns: 1, ew: 2, boards: [1,2,3] },
            { round: 1, table: 2, ns: 3, ew: 10, boards: [1,2,3] },
            { round: 1, table: 3, ns: 4, ew: 9, boards: [1,2,3] },
            { round: 1, table: 4, ns: 5, ew: 8, boards: [1,2,3] },
            { round: 1, table: 5, ns: 6, ew: 7, boards: [1,2,3] },
            { round: 2, table: 1, ns: 1, ew: 3, boards: [4,5,6] },
            { round: 2, table: 2, ns: 4, ew: 2, boards: [4,5,6] },
            { round: 2, table: 3, ns: 5, ew: 10, boards: [4,5,6] },
            { round: 2, table: 4, ns: 6, ew: 9, boards: [4,5,6] },
            { round: 2, table: 5, ns: 7, ew: 8, boards: [4,5,6] },
            { round: 3, table: 1, ns: 1, ew: 4, boards: [7,8,9] },
            { round: 3, table: 2, ns: 5, ew: 3, boards: [7,8,9] },
            { round: 3, table: 3, ns: 6, ew: 2, boards: [7,8,9] },
            { round: 3, table: 4, ns: 7, ew: 10, boards: [7,8,9] },
            { round: 3, table: 5, ns: 8, ew: 9, boards: [7,8,9] },
            { round: 4, table: 1, ns: 1, ew: 5, boards: [10,11,12] },
            { round: 4, table: 2, ns: 6, ew: 4, boards: [10,11,12] },
            { round: 4, table: 3, ns: 7, ew: 3, boards: [10,11,12] },
            { round: 4, table: 4, ns: 8, ew: 2, boards: [10,11,12] },
            { round: 4, table: 5, ns: 9, ew: 10, boards: [10,11,12] },
            { round: 5, table: 1, ns: 1, ew: 6, boards: [13,14,15] },
            { round: 5, table: 2, ns: 7, ew: 5, boards: [13,14,15] },
            { round: 5, table: 3, ns: 8, ew: 4, boards: [13,14,15] },
            { round: 5, table: 4, ns: 9, ew: 3, boards: [13,14,15] },
            { round: 5, table: 5, ns: 10, ew: 2, boards: [13,14,15] },
            { round: 6, table: 1, ns: 1, ew: 7, boards: [16,17,18] },
            { round: 6, table: 2, ns: 8, ew: 6, boards: [16,17,18] },
            { round: 6, table: 3, ns: 9, ew: 5, boards: [16,17,18] },
            { round: 6, table: 4, ns: 10, ew: 4, boards: [16,17,18] },
            { round: 6, table: 5, ns: 2, ew: 3, boards: [16,17,18] },
            { round: 7, table: 1, ns: 1, ew: 8, boards: [19,20,21] },
            { round: 7, table: 2, ns: 9, ew: 7, boards: [19,20,21] },
            { round: 7, table: 3, ns: 10, ew: 6, boards: [19,20,21] },
            { round: 7, table: 4, ns: 2, ew: 5, boards: [19,20,21] },
            { round: 7, table: 5, ns: 3, ew: 4, boards: [19,20,21] },
            { round: 8, table: 1, ns: 1, ew: 9, boards: [22,23,24] },
            { round: 8, table: 2, ns: 10, ew: 8, boards: [22,23,24] },
            { round: 8, table: 3, ns: 2, ew: 7, boards: [22,23,24] },
            { round: 8, table: 4, ns: 3, ew: 6, boards: [22,23,24] },
            { round: 8, table: 5, ns: 4, ew: 5, boards: [22,23,24] },
            { round: 9, table: 1, ns: 1, ew: 10, boards: [25,26,27] },
            { round: 9, table: 2, ns: 2, ew: 9, boards: [25,26,27] },
            { round: 9, table: 3, ns: 3, ew: 8, boards: [25,26,27] },
            { round: 9, table: 4, ns: 4, ew: 7, boards: [25,26,27] },
            { round: 9, table: 5, ns: 5, ew: 6, boards: [25,26,27] }
        ]
    },

    "10_howell_18": {
        pairs: 10, tables: 5, rounds: 9, totalBoards: 18, boardsPerRound: 2,
        type: 'howell',
        description: "5-table Howell, 18 boards, ~2.5 hrs",
        movement: [
            { round: 1, table: 1, ns: 1, ew: 2, boards: [1,2] },
            { round: 1, table: 2, ns: 3, ew: 10, boards: [1,2] },
            { round: 1, table: 3, ns: 4, ew: 9, boards: [1,2] },
            { round: 1, table: 4, ns: 5, ew: 8, boards: [1,2] },
            { round: 1, table: 5, ns: 6, ew: 7, boards: [1,2] },
            { round: 2, table: 1, ns: 1, ew: 3, boards: [3,4] },
            { round: 2, table: 2, ns: 4, ew: 2, boards: [3,4] },
            { round: 2, table: 3, ns: 5, ew: 10, boards: [3,4] },
            { round: 2, table: 4, ns: 6, ew: 9, boards: [3,4] },
            { round: 2, table: 5, ns: 7, ew: 8, boards: [3,4] },
            { round: 3, table: 1, ns: 1, ew: 4, boards: [5,6] },
            { round: 3, table: 2, ns: 5, ew: 3, boards: [5,6] },
            { round: 3, table: 3, ns: 6, ew: 2, boards: [5,6] },
            { round: 3, table: 4, ns: 7, ew: 10, boards: [5,6] },
            { round: 3, table: 5, ns: 8, ew: 9, boards: [5,6] },
            { round: 4, table: 1, ns: 1, ew: 5, boards: [7,8] },
            { round: 4, table: 2, ns: 6, ew: 4, boards: [7,8] },
            { round: 4, table: 3, ns: 7, ew: 3, boards: [7,8] },
            { round: 4, table: 4, ns: 8, ew: 2, boards: [7,8] },
            { round: 4, table: 5, ns: 9, ew: 10, boards: [7,8] },
            { round: 5, table: 1, ns: 1, ew: 6, boards: [9,10] },
            { round: 5, table: 2, ns: 7, ew: 5, boards: [9,10] },
            { round: 5, table: 3, ns: 8, ew: 4, boards: [9,10] },
            { round: 5, table: 4, ns: 9, ew: 3, boards: [9,10] },
            { round: 5, table: 5, ns: 10, ew: 2, boards: [9,10] },
            { round: 6, table: 1, ns: 1, ew: 7, boards: [11,12] },
            { round: 6, table: 2, ns: 8, ew: 6, boards: [11,12] },
            { round: 6, table: 3, ns: 9, ew: 5, boards: [11,12] },
            { round: 6, table: 4, ns: 10, ew: 4, boards: [11,12] },
            { round: 6, table: 5, ns: 2, ew: 3, boards: [11,12] },
            { round: 7, table: 1, ns: 1, ew: 8, boards: [13,14] },
            { round: 7, table: 2, ns: 9, ew: 7, boards: [13,14] },
            { round: 7, table: 3, ns: 10, ew: 6, boards: [13,14] },
            { round: 7, table: 4, ns: 2, ew: 5, boards: [13,14] },
            { round: 7, table: 5, ns: 3, ew: 4, boards: [13,14] },
            { round: 8, table: 1, ns: 1, ew: 9, boards: [15,16] },
            { round: 8, table: 2, ns: 10, ew: 8, boards: [15,16] },
            { round: 8, table: 3, ns: 2, ew: 7, boards: [15,16] },
            { round: 8, table: 4, ns: 3, ew: 6, boards: [15,16] },
            { round: 8, table: 5, ns: 4, ew: 5, boards: [15,16] },
            { round: 9, table: 1, ns: 1, ew: 10, boards: [17,18] },
            { round: 9, table: 2, ns: 2, ew: 9, boards: [17,18] },
            { round: 9, table: 3, ns: 3, ew: 8, boards: [17,18] },
            { round: 9, table: 4, ns: 4, ew: 7, boards: [17,18] },
            { round: 9, table: 5, ns: 5, ew: 6, boards: [17,18] }
        ]
    },

    "10_howell_27": {
        pairs: 10, tables: 5, rounds: 9, totalBoards: 27, boardsPerRound: 3,
        type: 'howell',
        description: "5-table Howell, 27 boards, ~3.5 hrs",
        movement: [
            { round: 1, table: 1, ns: 1, ew: 2, boards: [1,2,3] },
            { round: 1, table: 2, ns: 3, ew: 10, boards: [1,2,3] },
            { round: 1, table: 3, ns: 4, ew: 9, boards: [1,2,3] },
            { round: 1, table: 4, ns: 5, ew: 8, boards: [1,2,3] },
            { round: 1, table: 5, ns: 6, ew: 7, boards: [1,2,3] },
            { round: 2, table: 1, ns: 1, ew: 3, boards: [4,5,6] },
            { round: 2, table: 2, ns: 4, ew: 2, boards: [4,5,6] },
            { round: 2, table: 3, ns: 5, ew: 10, boards: [4,5,6] },
            { round: 2, table: 4, ns: 6, ew: 9, boards: [4,5,6] },
            { round: 2, table: 5, ns: 7, ew: 8, boards: [4,5,6] },
            { round: 3, table: 1, ns: 1, ew: 4, boards: [7,8,9] },
            { round: 3, table: 2, ns: 5, ew: 3, boards: [7,8,9] },
            { round: 3, table: 3, ns: 6, ew: 2, boards: [7,8,9] },
            { round: 3, table: 4, ns: 7, ew: 10, boards: [7,8,9] },
            { round: 3, table: 5, ns: 8, ew: 9, boards: [7,8,9] },
            { round: 4, table: 1, ns: 1, ew: 5, boards: [10,11,12] },
            { round: 4, table: 2, ns: 6, ew: 4, boards: [10,11,12] },
            { round: 4, table: 3, ns: 7, ew: 3, boards: [10,11,12] },
            { round: 4, table: 4, ns: 8, ew: 2, boards: [10,11,12] },
            { round: 4, table: 5, ns: 9, ew: 10, boards: [10,11,12] },
            { round: 5, table: 1, ns: 1, ew: 6, boards: [13,14,15] },
            { round: 5, table: 2, ns: 7, ew: 5, boards: [13,14,15] },
            { round: 5, table: 3, ns: 8, ew: 4, boards: [13,14,15] },
            { round: 5, table: 4, ns: 9, ew: 3, boards: [13,14,15] },
            { round: 5, table: 5, ns: 10, ew: 2, boards: [13,14,15] },
            { round: 6, table: 1, ns: 1, ew: 7, boards: [16,17,18] },
            { round: 6, table: 2, ns: 8, ew: 6, boards: [16,17,18] },
            { round: 6, table: 3, ns: 9, ew: 5, boards: [16,17,18] },
            { round: 6, table: 4, ns: 10, ew: 4, boards: [16,17,18] },
            { round: 6, table: 5, ns: 2, ew: 3, boards: [16,17,18] },
            { round: 7, table: 1, ns: 1, ew: 8, boards: [19,20,21] },
            { round: 7, table: 2, ns: 9, ew: 7, boards: [19,20,21] },
            { round: 7, table: 3, ns: 10, ew: 6, boards: [19,20,21] },
            { round: 7, table: 4, ns: 2, ew: 5, boards: [19,20,21] },
            { round: 7, table: 5, ns: 3, ew: 4, boards: [19,20,21] },
            { round: 8, table: 1, ns: 1, ew: 9, boards: [22,23,24] },
            { round: 8, table: 2, ns: 10, ew: 8, boards: [22,23,24] },
            { round: 8, table: 3, ns: 2, ew: 7, boards: [22,23,24] },
            { round: 8, table: 4, ns: 3, ew: 6, boards: [22,23,24] },
            { round: 8, table: 5, ns: 4, ew: 5, boards: [22,23,24] },
            { round: 9, table: 1, ns: 1, ew: 10, boards: [25,26,27] },
            { round: 9, table: 2, ns: 2, ew: 9, boards: [25,26,27] },
            { round: 9, table: 3, ns: 3, ew: 8, boards: [25,26,27] },
            { round: 9, table: 4, ns: 4, ew: 7, boards: [25,26,27] },
            { round: 9, table: 5, ns: 5, ew: 6, boards: [25,26,27] }
        ]
    },

    "11_mitchell_21": {
        pairs: 11, tables: 6, rounds: 7, totalBoards: 21, boardsPerRound: 3,
        type: 'mitchell', hasSitOut: true, isHesitation: true,
        description: "6-table Hesitation Mitchell, 21 boards, 7 rounds, ~2.5 hrs (1 sit-out)",
        movement: [
            { round: 1, table: 1, ns: 1, ew: 7, boards: [1,2,3] },
            { round: 1, table: 2, ns: 2, ew: 8, boards: [4,5,6] },
            { round: 1, table: 3, ns: 3, ew: 9, boards: [7,8,9] },
            { round: 1, table: 4, ns: 4, ew: 10, boards: [10,11,12] },
            { round: 1, table: 5, ns: 5, ew: 11, boards: [13,14,15] },
            { round: 1, table: 6, ns: '', ew: 6, boards: [] },
            { round: 2, table: 1, ns: 1, ew: 6, boards: [13,14,15] },
            { round: 2, table: 2, ns: 2, ew: 7, boards: [7,8,9] },
            { round: 2, table: 3, ns: 3, ew: 8, boards: [16,17,18] },
            { round: 2, table: 4, ns: 4, ew: 9, boards: [4,5,6] },
            { round: 2, table: 5, ns: 5, ew: 10, boards: [1,2,3] },
            { round: 2, table: 6, ns: '', ew: 11, boards: [] },
            { round: 3, table: 1, ns: '', ew: 1, boards: [] },
            { round: 3, table: 2, ns: 2, ew: 6, boards: [16,17,18] },
            { round: 3, table: 3, ns: 3, ew: 7, boards: [10,11,12] },
            { round: 3, table: 4, ns: 4, ew: 8, boards: [1,2,3] },
            { round: 3, table: 5, ns: 5, ew: 9, boards: [19,20,21] },
            { round: 3, table: 6, ns: 11, ew: 10, boards: [7,8,9] },
            { round: 4, table: 1, ns: 1, ew: 11, boards: [19,20,21] },
            { round: 4, table: 2, ns: '', ew: 2, boards: [] },
            { round: 4, table: 3, ns: 3, ew: 6, boards: [1,2,3] },
            { round: 4, table: 4, ns: 4, ew: 7, boards: [13,14,15] },
            { round: 4, table: 5, ns: 5, ew: 8, boards: [10,11,12] },
            { round: 4, table: 6, ns: 10, ew: 9, boards: [16,17,18] },
            { round: 5, table: 1, ns: 1, ew: 10, boards: [4,5,6] },
            { round: 5, table: 2, ns: 2, ew: 11, boards: [10,11,12] },
            { round: 5, table: 3, ns: '', ew: 3, boards: [] },
            { round: 5, table: 4, ns: 4, ew: 6, boards: [19,20,21] },
            { round: 5, table: 5, ns: 5, ew: 7, boards: [16,17,18] },
            { round: 5, table: 6, ns: 9, ew: 8, boards: [13,14,15] },
            { round: 6, table: 1, ns: 1, ew: 9, boards: [10,11,12] },
            { round: 6, table: 2, ns: 2, ew: 10, boards: [13,14,15] },
            { round: 6, table: 3, ns: 3, ew: 11, boards: [4,5,6] },
            { round: 6, table: 4, ns: '', ew: 4, boards: [] },
            { round: 6, table: 5, ns: 5, ew: 6, boards: [7,8,9] },
            { round: 6, table: 6, ns: 8, ew: 7, boards: [19,20,21] },
            { round: 7, table: 1, ns: 1, ew: 8, boards: [7,8,9] },
            { round: 7, table: 2, ns: 2, ew: 9, boards: [1,2,3] },
            { round: 7, table: 3, ns: 3, ew: 10, boards: [19,20,21] },
            { round: 7, table: 4, ns: 4, ew: 11, boards: [16,17,18] },
            { round: 7, table: 5, ns: '', ew: 5, boards: [] },
            { round: 7, table: 6, ns: 7, ew: 6, boards: [4,5,6] }
        ]
    },

    "11_mitchell_28": {
        pairs: 11, tables: 6, rounds: 7, totalBoards: 28, boardsPerRound: 4,
        type: 'mitchell', hasSitOut: true, isHesitation: true,
        description: "6-table Hesitation Mitchell, 28 boards, 7 rounds, ~3.5 hrs (1 sit-out)",
        movement: [
            { round: 1, table: 1, ns: 1, ew: 7, boards: [1,2,3,4] },
            { round: 1, table: 2, ns: 2, ew: 8, boards: [5,6,7,8] },
            { round: 1, table: 3, ns: 3, ew: 9, boards: [9,10,11,12] },
            { round: 1, table: 4, ns: 4, ew: 10, boards: [13,14,15,16] },
            { round: 1, table: 5, ns: 5, ew: 11, boards: [17,18,19,20] },
            { round: 1, table: 6, ns: '', ew: 6, boards: [] },
            { round: 2, table: 1, ns: 1, ew: 6, boards: [17,18,19,20] },
            { round: 2, table: 2, ns: 2, ew: 7, boards: [9,10,11,12] },
            { round: 2, table: 3, ns: 3, ew: 8, boards: [21,22,23,24] },
            { round: 2, table: 4, ns: 4, ew: 9, boards: [5,6,7,8] },
            { round: 2, table: 5, ns: 5, ew: 10, boards: [1,2,3,4] },
            { round: 2, table: 6, ns: '', ew: 11, boards: [] },
            { round: 3, table: 1, ns: '', ew: 1, boards: [] },
            { round: 3, table: 2, ns: 2, ew: 6, boards: [21,22,23,24] },
            { round: 3, table: 3, ns: 3, ew: 7, boards: [13,14,15,16] },
            { round: 3, table: 4, ns: 4, ew: 8, boards: [1,2,3,4] },
            { round: 3, table: 5, ns: 5, ew: 9, boards: [25,26,27,28] },
            { round: 3, table: 6, ns: 11, ew: 10, boards: [9,10,11,12] },
            { round: 4, table: 1, ns: 1, ew: 11, boards: [25,26,27,28] },
            { round: 4, table: 2, ns: '', ew: 2, boards: [] },
            { round: 4, table: 3, ns: 3, ew: 6, boards: [1,2,3,4] },
            { round: 4, table: 4, ns: 4, ew: 7, boards: [17,18,19,20] },
            { round: 4, table: 5, ns: 5, ew: 8, boards: [13,14,15,16] },
            { round: 4, table: 6, ns: 10, ew: 9, boards: [21,22,23,24] },
            { round: 5, table: 1, ns: 1, ew: 10, boards: [5,6,7,8] },
            { round: 5, table: 2, ns: 2, ew: 11, boards: [13,14,15,16] },
            { round: 5, table: 3, ns: '', ew: 3, boards: [] },
            { round: 5, table: 4, ns: 4, ew: 6, boards: [25,26,27,28] },
            { round: 5, table: 5, ns: 5, ew: 7, boards: [21,22,23,24] },
            { round: 5, table: 6, ns: 9, ew: 8, boards: [17,18,19,20] },
            { round: 6, table: 1, ns: 1, ew: 9, boards: [13,14,15,16] },
            { round: 6, table: 2, ns: 2, ew: 10, boards: [17,18,19,20] },
            { round: 6, table: 3, ns: 3, ew: 11, boards: [5,6,7,8] },
            { round: 6, table: 4, ns: '', ew: 4, boards: [] },
            { round: 6, table: 5, ns: 5, ew: 6, boards: [9,10,11,12] },
            { round: 6, table: 6, ns: 8, ew: 7, boards: [25,26,27,28] },
            { round: 7, table: 1, ns: 1, ew: 8, boards: [9,10,11,12] },
            { round: 7, table: 2, ns: 2, ew: 9, boards: [1,2,3,4] },
            { round: 7, table: 3, ns: 3, ew: 10, boards: [25,26,27,28] },
            { round: 7, table: 4, ns: 4, ew: 11, boards: [21,22,23,24] },
            { round: 7, table: 5, ns: '', ew: 5, boards: [] },
            { round: 7, table: 6, ns: 7, ew: 6, boards: [5,6,7,8] }
        ]
    },

    "15_mitchell_18": {
        pairs: 15, tables: 8, rounds: 9, totalBoards: 18, boardsPerRound: 2,
        type: 'mitchell', hasSitOut: true, isHesitation: true,
        description: "8-table Hesitation Mitchell, 18 boards, 9 rounds, ~2.5 hrs (1 sit-out)",
        movement: [
            { round: 1, table: 1, ns: 1, ew: 9, boards: [1,2] },
            { round: 1, table: 2, ns: 2, ew: 10, boards: [3,4] },
            { round: 1, table: 3, ns: 3, ew: 11, boards: [5,6] },
            { round: 1, table: 4, ns: 4, ew: 12, boards: [7,8] },
            { round: 1, table: 5, ns: 5, ew: 13, boards: [9,10] },
            { round: 1, table: 6, ns: 6, ew: 14, boards: [11,12] },
            { round: 1, table: 7, ns: 7, ew: 15, boards: [13,14] },
            { round: 1, table: 8, ns: '', ew: 8, boards: [] },
            { round: 2, table: 1, ns: 1, ew: 8, boards: [9,10] },
            { round: 2, table: 2, ns: 2, ew: 9, boards: [5,6] },
            { round: 2, table: 3, ns: 3, ew: 10, boards: [11,12] },
            { round: 2, table: 4, ns: 4, ew: 11, boards: [15,16] },
            { round: 2, table: 5, ns: 5, ew: 12, boards: [1,2] },
            { round: 2, table: 6, ns: 6, ew: 13, boards: [3,4] },
            { round: 2, table: 7, ns: 7, ew: 14, boards: [7,8] },
            { round: 2, table: 8, ns: '', ew: 15, boards: [] },
            { round: 3, table: 1, ns: '', ew: 1, boards: [] },
            { round: 3, table: 2, ns: 2, ew: 8, boards: [11,12] },
            { round: 3, table: 3, ns: 3, ew: 9, boards: [13,14] },
            { round: 3, table: 4, ns: 4, ew: 10, boards: [5,6] },
            { round: 3, table: 5, ns: 5, ew: 11, boards: [3,4] },
            { round: 3, table: 6, ns: 6, ew: 12, boards: [17,18] },
            { round: 3, table: 7, ns: 7, ew: 13, boards: [15,16] },
            { round: 3, table: 8, ns: 15, ew: 14, boards: [1,2] },
            { round: 4, table: 1, ns: 1, ew: 15, boards: [15,16] },
            { round: 4, table: 2, ns: '', ew: 2, boards: [] },
            { round: 4, table: 3, ns: 3, ew: 8, boards: [17,18] },
            { round: 4, table: 4, ns: 4, ew: 9, boards: [3,4] },
            { round: 4, table: 5, ns: 5, ew: 10, boards: [13,14] },
            { round: 4, table: 6, ns: 6, ew: 11, boards: [7,8] },
            { round: 4, table: 7, ns: 7, ew: 12, boards: [9,10] },
            { round: 4, table: 8, ns: 14, ew: 13, boards: [5,6] },
            { round: 5, table: 1, ns: 1, ew: 14, boards: [3,4] },
            { round: 5, table: 2, ns: 2, ew: 15, boards: [9,10] },
            { round: 5, table: 3, ns: '', ew: 3, boards: [] },
            { round: 5, table: 4, ns: 4, ew: 8, boards: [1,2] },
            { round: 5, table: 5, ns: 5, ew: 9, boards: [7,8] },
            { round: 5, table: 6, ns: 6, ew: 10, boards: [15,16] },
            { round: 5, table: 7, ns: 7, ew: 11, boards: [17,18] },
            { round: 5, table: 8, ns: 13, ew: 12, boards: [13,14] },
            { round: 6, table: 1, ns: 1, ew: 13, boards: [17,18] },
            { round: 6, table: 2, ns: 2, ew: 14, boards: [13,14] },
            { round: 6, table: 3, ns: 3, ew: 15, boards: [7,8] },
            { round: 6, table: 4, ns: '', ew: 4, boards: [] },
            { round: 6, table: 5, ns: 5, ew: 8, boards: [5,6] },
            { round: 6, table: 6, ns: 6, ew: 9, boards: [9,10] },
            { round: 6, table: 7, ns: 7, ew: 10, boards: [1,2] },
            { round: 6, table: 8, ns: 12, ew: 11, boards: [11,12] },
            { round: 7, table: 1, ns: 1, ew: 12, boards: [5,6] },
            { round: 7, table: 2, ns: 2, ew: 13, boards: [7,8] },
            { round: 7, table: 3, ns: 3, ew: 14, boards: [15,16] },
            { round: 7, table: 4, ns: 4, ew: 15, boards: [17,18] },
            { round: 7, table: 5, ns: '', ew: 5, boards: [] },
            { round: 7, table: 6, ns: 6, ew: 8, boards: [13,14] },
            { round: 7, table: 7, ns: 7, ew: 9, boards: [11,12] },
            { round: 7, table: 8, ns: 11, ew: 10, boards: [9,10] },
            { round: 8, table: 1, ns: 1, ew: 11, boards: [13,14] },
            { round: 8, table: 2, ns: 2, ew: 12, boards: [15,16] },
            { round: 8, table: 3, ns: 3, ew: 13, boards: [1,2] },
            { round: 8, table: 4, ns: 4, ew: 14, boards: [9,10] },
            { round: 8, table: 5, ns: 5, ew: 15, boards: [11,12] },
            { round: 8, table: 6, ns: '', ew: 6, boards: [] },
            { round: 8, table: 7, ns: 7, ew: 8, boards: [3,4] },
            { round: 8, table: 8, ns: 10, ew: 9, boards: [17,18] },
            { round: 9, table: 1, ns: 1, ew: 10, boards: [7,8] },
            { round: 9, table: 2, ns: 2, ew: 11, boards: [1,2] },
            { round: 9, table: 3, ns: 3, ew: 12, boards: [3,4] },
            { round: 9, table: 4, ns: 4, ew: 13, boards: [11,12] },
            { round: 9, table: 5, ns: 5, ew: 14, boards: [17,18] },
            { round: 9, table: 6, ns: 6, ew: 15, boards: [5,6] },
            { round: 9, table: 7, ns: '', ew: 7, boards: [] },
            { round: 9, table: 8, ns: 9, ew: 8, boards: [15,16] }
        ]
    },

    "15_mitchell_27": {
        pairs: 15, tables: 8, rounds: 9, totalBoards: 27, boardsPerRound: 3,
        type: 'mitchell', hasSitOut: true, isHesitation: true,
        description: "8-table Hesitation Mitchell, 27 boards, 9 rounds, ~3.5 hrs (1 sit-out)",
        movement: [
            { round: 1, table: 1, ns: 1, ew: 9, boards: [1,2,3] },
            { round: 1, table: 2, ns: 2, ew: 10, boards: [4,5,6] },
            { round: 1, table: 3, ns: 3, ew: 11, boards: [7,8,9] },
            { round: 1, table: 4, ns: 4, ew: 12, boards: [10,11,12] },
            { round: 1, table: 5, ns: 5, ew: 13, boards: [13,14,15] },
            { round: 1, table: 6, ns: 6, ew: 14, boards: [16,17,18] },
            { round: 1, table: 7, ns: 7, ew: 15, boards: [19,20,21] },
            { round: 1, table: 8, ns: '', ew: 8, boards: [] },
            { round: 2, table: 1, ns: 1, ew: 8, boards: [13,14,15] },
            { round: 2, table: 2, ns: 2, ew: 9, boards: [7,8,9] },
            { round: 2, table: 3, ns: 3, ew: 10, boards: [16,17,18] },
            { round: 2, table: 4, ns: 4, ew: 11, boards: [22,23,24] },
            { round: 2, table: 5, ns: 5, ew: 12, boards: [1,2,3] },
            { round: 2, table: 6, ns: 6, ew: 13, boards: [4,5,6] },
            { round: 2, table: 7, ns: 7, ew: 14, boards: [10,11,12] },
            { round: 2, table: 8, ns: '', ew: 15, boards: [] },
            { round: 3, table: 1, ns: '', ew: 1, boards: [] },
            { round: 3, table: 2, ns: 2, ew: 8, boards: [16,17,18] },
            { round: 3, table: 3, ns: 3, ew: 9, boards: [19,20,21] },
            { round: 3, table: 4, ns: 4, ew: 10, boards: [7,8,9] },
            { round: 3, table: 5, ns: 5, ew: 11, boards: [4,5,6] },
            { round: 3, table: 6, ns: 6, ew: 12, boards: [25,26,27] },
            { round: 3, table: 7, ns: 7, ew: 13, boards: [22,23,24] },
            { round: 3, table: 8, ns: 15, ew: 14, boards: [1,2,3] },
            { round: 4, table: 1, ns: 1, ew: 15, boards: [22,23,24] },
            { round: 4, table: 2, ns: '', ew: 2, boards: [] },
            { round: 4, table: 3, ns: 3, ew: 8, boards: [25,26,27] },
            { round: 4, table: 4, ns: 4, ew: 9, boards: [4,5,6] },
            { round: 4, table: 5, ns: 5, ew: 10, boards: [19,20,21] },
            { round: 4, table: 6, ns: 6, ew: 11, boards: [10,11,12] },
            { round: 4, table: 7, ns: 7, ew: 12, boards: [13,14,15] },
            { round: 4, table: 8, ns: 14, ew: 13, boards: [7,8,9] },
            { round: 5, table: 1, ns: 1, ew: 14, boards: [4,5,6] },
            { round: 5, table: 2, ns: 2, ew: 15, boards: [13,14,15] },
            { round: 5, table: 3, ns: '', ew: 3, boards: [] },
            { round: 5, table: 4, ns: 4, ew: 8, boards: [1,2,3] },
            { round: 5, table: 5, ns: 5, ew: 9, boards: [10,11,12] },
            { round: 5, table: 6, ns: 6, ew: 10, boards: [22,23,24] },
            { round: 5, table: 7, ns: 7, ew: 11, boards: [25,26,27] },
            { round: 5, table: 8, ns: 13, ew: 12, boards: [19,20,21] },
            { round: 6, table: 1, ns: 1, ew: 13, boards: [25,26,27] },
            { round: 6, table: 2, ns: 2, ew: 14, boards: [19,20,21] },
            { round: 6, table: 3, ns: 3, ew: 15, boards: [10,11,12] },
            { round: 6, table: 4, ns: '', ew: 4, boards: [] },
            { round: 6, table: 5, ns: 5, ew: 8, boards: [7,8,9] },
            { round: 6, table: 6, ns: 6, ew: 9, boards: [13,14,15] },
            { round: 6, table: 7, ns: 7, ew: 10, boards: [1,2,3] },
            { round: 6, table: 8, ns: 12, ew: 11, boards: [16,17,18] },
            { round: 7, table: 1, ns: 1, ew: 12, boards: [7,8,9] },
            { round: 7, table: 2, ns: 2, ew: 13, boards: [10,11,12] },
            { round: 7, table: 3, ns: 3, ew: 14, boards: [22,23,24] },
            { round: 7, table: 4, ns: 4, ew: 15, boards: [25,26,27] },
            { round: 7, table: 5, ns: '', ew: 5, boards: [] },
            { round: 7, table: 6, ns: 6, ew: 8, boards: [19,20,21] },
            { round: 7, table: 7, ns: 7, ew: 9, boards: [16,17,18] },
            { round: 7, table: 8, ns: 11, ew: 10, boards: [13,14,15] },
            { round: 8, table: 1, ns: 1, ew: 11, boards: [19,20,21] },
            { round: 8, table: 2, ns: 2, ew: 12, boards: [22,23,24] },
            { round: 8, table: 3, ns: 3, ew: 13, boards: [1,2,3] },
            { round: 8, table: 4, ns: 4, ew: 14, boards: [13,14,15] },
            { round: 8, table: 5, ns: 5, ew: 15, boards: [16,17,18] },
            { round: 8, table: 6, ns: '', ew: 6, boards: [] },
            { round: 8, table: 7, ns: 7, ew: 8, boards: [4,5,6] },
            { round: 8, table: 8, ns: 10, ew: 9, boards: [25,26,27] },
            { round: 9, table: 1, ns: 1, ew: 10, boards: [10,11,12] },
            { round: 9, table: 2, ns: 2, ew: 11, boards: [1,2,3] },
            { round: 9, table: 3, ns: 3, ew: 12, boards: [4,5,6] },
            { round: 9, table: 4, ns: 4, ew: 13, boards: [16,17,18] },
            { round: 9, table: 5, ns: 5, ew: 14, boards: [25,26,27] },
            { round: 9, table: 6, ns: 6, ew: 15, boards: [7,8,9] },
            { round: 9, table: 7, ns: '', ew: 7, boards: [] },
            { round: 9, table: 8, ns: 9, ew: 8, boards: [22,23,24] }
        ]
    },

};

const ENHANCED_MOVEMENTS = { ...CORE_MOVEMENTS, ...HARDCODED_MOVEMENTS };

if (typeof module !== 'undefined' && module.exports) {
    module.exports = ENHANCED_MOVEMENTS;
}

if (typeof window !== 'undefined') {
    window.ENHANCED_MOVEMENTS = ENHANCED_MOVEMENTS;
    if (window.duplicateBridge && window.duplicateBridge.initializeMovements) {
        window.duplicateBridge.initializeMovements();
        console.log('✅ Notified duplicate bridge to reload movements');
    }
}

console.log('✅ Enhanced Movements Module loaded with', Object.keys(ENHANCED_MOVEMENTS).length, 'movements');
