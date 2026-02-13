/**
 * Enhanced Bridge Movements Module
 * Contains all Howell movements (2-5 tables) and Mitchell movements (6-7 tables)
 * Converted from JSON movement files
 */

// Helper function to convert JSON format to app format
function convertJSONMovementToArray(jsonMovements) {
    const movementArray = [];
    
    for (const roundKey in jsonMovements) {
        const round = parseInt(roundKey);
        const roundData = jsonMovements[roundKey];
        
        for (const tableKey in roundData) {
            const table = parseInt(tableKey);
            const tableData = roundData[tableKey];
            
            // Skip sit-out positions
            if (tableData.ns === "Sit out" || tableData.ew === "Sit out") {
                continue;
            }
            
            movementArray.push({
                round: round,
                table: table,
                ns: tableData.ns,
                ew: tableData.ew,
                boards: tableData.boards
            });
        }
    }
    
    return movementArray;
}

// Enhanced movements object with all Howell and Mitchell movements
const ENHANCED_MOVEMENTS = {
    // 2 tables - 4 pairs (existing)
    4: {
        pairs: 4,
        tables: 2,
        rounds: 6,
        totalBoards: 12,
        boardsPerRound: 2,
        type: 'howell',
        description: "2-table Howell, 12 boards, ~2 hours",
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
    
    // 2.5 tables - 5 pairs (NEW)
    5: {
        pairs: 5,
        tables: 2.5,
        rounds: 5,
        totalBoards: 15,
        boardsPerRound: 3,
        type: 'howell',
        description: "2.5-table Howell, 15 boards, ~2 hours (1 sit-out)",
        hasSitOut: true,
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
    
    // 3 tables - 6 pairs (existing)
    6: {
        pairs: 6,
        tables: 3,
        rounds: 5,
        totalBoards: 15,
        boardsPerRound: 3,
        type: 'howell',
        description: "3-table Howell, 15 boards, ~2 hours",
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
    
    // 3.5 tables - 7 pairs (NEW)
    7: {
        pairs: 7,
        tables: 3.5,
        rounds: 7,
        totalBoards: 14,
        boardsPerRound: 2,
        type: 'howell',
        description: "3.5-table Howell, 14 boards, ~2 hours (1 sit-out)",
        hasSitOut: true,
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
    
    // 4 tables - 8 pairs (existing)
    8: {
        pairs: 8,
        tables: 4,
        rounds: 7,
        totalBoards: 14,
        boardsPerRound: 2,
        type: 'howell',
        description: "4-table Howell, 14 boards, ~2.5 hours",
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
    
    // 4.5 tables - 9 pairs (NEW)
    9: {
        pairs: 9,
        tables: 4.5,
        rounds: 9,
        totalBoards: 18,
        boardsPerRound: 2,
        type: 'howell',
        description: "4.5-table Howell, 18 boards, ~2.5 hours (1 sit-out)",
        hasSitOut: true,
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
    
    // 5 tables - 10 pairs (NEW)
    10: {
        pairs: 10,
        tables: 5,
        rounds: 9,
        totalBoards: 18,
        boardsPerRound: 2,
        type: 'howell',
        description: "5-table Howell, 18 boards, ~2.5 hours",
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
    
    // 6 tables - 12 pairs - Mitchell (NEW)
    12: {
        pairs: 12,
        tables: 6,
        rounds: 6,
        totalBoards: 18,
        boardsPerRound: 3,
        type: 'mitchell',
        description: "6-table Mitchell, 18 boards, ~2 hours",
        movement: generateMitchellMovement(6, 3)
    },
    
    // 7 tables - 14 pairs - Mitchell (NEW)
    14: {
        pairs: 14,
        tables: 7,
        rounds: 7,
        totalBoards: 21,
        boardsPerRound: 3,
        type: 'mitchell',
        description: "7-table Mitchell, 21 boards, ~2.5 hours",
        movement: generateMitchellMovement(7, 3)
    }
};

/**
 * Generate Mitchell movement
 * NS pairs stay at their table, EW pairs move up one table
 */
function generateMitchellMovement(tables, boardsPerRound) {
    const movement = [];
    const boards = tables * boardsPerRound;
    
    for (let round = 1; round <= tables; round++) {
        for (let table = 1; table <= tables; table++) {
            const nsPair = table;
            let ewPair = table + tables - round + 1;
            if (ewPair > tables * 2) ewPair -= tables;
            
            // Board calculation for Mitchell
            const startBoard = ((table - 1 + round - 1) % tables) * boardsPerRound + 1;
            const boardList = [];
            for (let b = 0; b < boardsPerRound; b++) {
                let boardNum = startBoard + b;
                if (boardNum > boards) boardNum -= boards;
                boardList.push(boardNum);
            }
            
            movement.push({
                round: round,
                table: table,
                ns: nsPair,
                ew: ewPair,
                boards: boardList
            });
        }
    }
    
    return movement;
}

// Export for use in duplicate.js and duplicateTemplates.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ENHANCED_MOVEMENTS;
}

// Make available globally for browser
if (typeof window !== 'undefined') {
    window.ENHANCED_MOVEMENTS = ENHANCED_MOVEMENTS;
}

console.log('✅ Enhanced Movements Module loaded with', Object.keys(ENHANCED_MOVEMENTS).length, 'movements');
