/**
 * Bridge Scoring Utilities - Shared scoring functions for all bridge modes
 * 
 * Contains standard bridge scoring formulas, constants, and utility functions
 * that are used across different bridge modes.
 */

// ===== SCORING CONSTANTS =====

export const SCORING_CONSTANTS = {
    // Basic suit values per trick
    SUIT_VALUES: {
        '♣': 20,    // Clubs
        '♦': 20,    // Diamonds  
        '♥': 30,    // Hearts
        '♠': 30,    // Spades
        'NT': 30    // No Trump
    },
    
    // No Trump first trick bonus
    NT_BONUS: 10,
    
    // Game threshold (100+ basic points = game)
    GAME_THRESHOLD: 100,
    
    // Game bonuses
    GAME_BONUS: {
        VULNERABLE: 500,
        NOT_VULNERABLE: 300,
        PART_GAME: 50
    },
    
    // Slam bonuses
    SLAM_BONUS: {
        SMALL: {
            VULNERABLE: 750,
            NOT_VULNERABLE: 500
        },
        GRAND: {
            VULNERABLE: 1500,
            NOT_VULNERABLE: 1000
        }
    },
    
    // Double bonuses
    DOUBLE_BONUS: {
        SINGLE: 50,    // X
        REDOUBLE: 100  // XX
    },
    
    // Penalty rates
    PENALTIES: {
        UNDOUBLED: {
            VULNERABLE: 100,
            NOT_VULNERABLE: 50
        },
        DOUBLED: {
            FIRST: {
                VULNERABLE: 200,
                NOT_VULNERABLE: 100
            },
            SECOND_THIRD: {
                VULNERABLE: 300,
                NOT_VULNERABLE: 200
            },
            FOURTH_PLUS: 300
        }
    },
    
    // Overtrick values
    OVERTRICKS: {
        DOUBLED: {
            VULNERABLE: 200,
            NOT_VULNERABLE: 100
        }
    },
    
    // Valid values
    SUITS: ['♣', '♦', '♥', '♠', 'NT'],
    DIRECTIONS: ['N', 'E', 'S', 'W'],
    VULNERABILITIES: ['None', 'NS', 'EW', 'Both'],
    DOUBLES: ['', 'X', 'XX'],
    LEVELS: [1, 2, 3, 4, 5, 6, 7]
};

// ===== BASIC SCORING FUNCTIONS =====

/**
 * Calculate basic trick score (before bonuses)
 * @param {number} level - Bid level (1-7)
 * @param {string} suit - Suit (♣♦♥♠NT)
 * @returns {number} Basic score
 */
export function calculateBasicScore(level, suit) {
    if (!SCORING_CONSTANTS.LEVELS.includes(level)) {
        throw new Error(`Invalid level: ${level}`);
    }
    
    if (!SCORING_CONSTANTS.SUITS.includes(suit)) {
        throw new Error(`Invalid suit: ${suit}`);
    }
    
    let score = level * SCORING_CONSTANTS.SUIT_VALUES[suit];
    
    // Add No Trump first trick bonus
    if (suit === 'NT') {
        score += SCORING_CONSTANTS.NT_BONUS;
    }
    
    return score;
}

/**
 * Calculate game bonus based on basic score and vulnerability
 * @param {number} basicScore - Basic contract score
 * @param {boolean} vulnerable - Is declarer vulnerable
 * @returns {number} Game bonus
 */
export function calculateGameBonus(basicScore, vulnerable) {
    if (basicScore >= SCORING_CONSTANTS.GAME_THRESHOLD) {
        return vulnerable ? 
            SCORING_CONSTANTS.GAME_BONUS.VULNERABLE : 
            SCORING_CONSTANTS.GAME_BONUS.NOT_VULNERABLE;
    } else {
        return SCORING_CONSTANTS.GAME_BONUS.PART_GAME;
    }
}

/**
 * Calculate slam bonus
 * @param {number} level - Contract level
 * @param {boolean} vulnerable - Is declarer vulnerable
 * @returns {number} Slam bonus (0 if not a slam)
 */
export function calculateSlamBonus(level, vulnerable) {
    if (level === 6) {
        // Small slam
        return vulnerable ? 
            SCORING_CONSTANTS.SLAM_BONUS.SMALL.VULNERABLE :
            SCORING_CONSTANTS.SLAM_BONUS.SMALL.NOT_VULNERABLE;
    } else if (level === 7) {
        // Grand slam
        return vulnerable ?
            SCORING_CONSTANTS.SLAM_BONUS.GRAND.VULNERABLE :
            SCORING_CONSTANTS.SLAM_BONUS.GRAND.NOT_VULNERABLE;
    }
    
    return 0;
}

/**
 * Calculate double bonus
 * @param {string} doubled - Double state ('', 'X', 'XX')
 * @returns {number} Double bonus
 */
export function calculateDoubleBonus(doubled) {
    switch (doubled) {
        case 'X':
            return SCORING_CONSTANTS.DOUBLE_BONUS.SINGLE;
        case 'XX':
            return SCORING_CONSTANTS.DOUBLE_BONUS.REDOUBLE;
        default:
            return 0;
    }
}

/**
 * Apply doubling multiplier to basic score
 * @param {number} basicScore - Basic contract score
 * @param {string} doubled - Double state ('', 'X', 'XX')
 * @returns {number} Doubled score
 */
export function applyDoubling(basicScore, doubled) {
    switch (doubled) {
        case 'X':
            return basicScore * 2;
        case 'XX':
            return basicScore * 4;
        default:
            return basicScore;
    }
}

// ===== OVERTRICK CALCULATIONS =====

/**
 * Calculate undoubled overtricks
 * @param {number} overtricks - Number of overtricks
 * @param {string} suit - Contract suit
 * @returns {number} Overtrick score
 */
export function calculateUndoubledOvertricks(overtricks, suit) {
    if (overtricks <= 0) return 0;
    
    return overtricks * SCORING_CONSTANTS.SUIT_VALUES[suit];
}

/**
 * Calculate doubled overtricks
 * @param {number} overtricks - Number of overtricks
 * @param {string} doubled - Double state ('X' or 'XX')
 * @param {boolean} vulnerable - Is declarer vulnerable
 * @returns {number} Overtrick score
 */
export function calculateDoubledOvertricks(overtricks, doubled, vulnerable) {
    if (overtricks <= 0 || !doubled) return 0;
    
    const baseValue = vulnerable ?
        SCORING_CONSTANTS.OVERTRICKS.DOUBLED.VULNERABLE :
        SCORING_CONSTANTS.OVERTRICKS.DOUBLED.NOT_VULNERABLE;
    
    const multiplier = doubled === 'XX' ? 2 : 1;
    
    return overtricks * baseValue * multiplier;
}

// ===== PENALTY CALCULATIONS =====

/**
 * Calculate undoubled penalties
 * @param {number} undertricks - Number of undertricks
 * @param {boolean} vulnerable - Is declarer vulnerable
 * @returns {number} Penalty amount (positive number)
 */
export function calculateUndoubledPenalties(undertricks, vulnerable) {
    if (undertricks <= 0) return 0;
    
    const penaltyPerTrick = vulnerable ?
        SCORING_CONSTANTS.PENALTIES.UNDOUBLED.VULNERABLE :
        SCORING_CONSTANTS.PENALTIES.UNDOUBLED.NOT_VULNERABLE;
    
    return undertricks * penaltyPerTrick;
}

/**
 * Calculate doubled penalties (progressive scale)
 * @param {number} undertricks - Number of undertricks
 * @param {string} doubled - Double state ('X' or 'XX')
 * @param {boolean} vulnerable - Is declarer vulnerable
 * @returns {number} Penalty amount (positive number)
 */
export function calculateDoubledPenalties(undertricks, doubled, vulnerable) {
    if (undertricks <= 0 || !doubled) return 0;
    
    let penalty = 0;
    const multiplier = doubled === 'XX' ? 2 : 1;
    
    for (let i = 1; i <= undertricks; i++) {
        if (i === 1) {
            // First undertrick
            penalty += (vulnerable ? 
                SCORING_CONSTANTS.PENALTIES.DOUBLED.FIRST.VULNERABLE :
                SCORING_CONSTANTS.PENALTIES.DOUBLED.FIRST.NOT_VULNERABLE
            ) * multiplier;
        } else if (i <= 3) {
            // Second and third undertricks
            penalty += (vulnerable ?
                SCORING_CONSTANTS.PENALTIES.DOUBLED.SECOND_THIRD.VULNERABLE :
                SCORING_CONSTANTS.PENALTIES.DOUBLED.SECOND_THIRD.NOT_VULNERABLE
            ) * multiplier;
        } else {
            // Fourth and subsequent undertricks
            penalty += SCORING_CONSTANTS.PENALTIES.DOUBLED.FOURTH_PLUS * multiplier;
        }
    }
    
    return penalty;
}

// ===== COMPLETE SCORING FUNCTIONS =====

/**
 * Calculate score for a made contract
 * @param {Object} params - Scoring parameters
 * @param {number} params.level - Contract level
 * @param {string} params.suit - Contract suit
 * @param {string} params.doubled - Double state
 * @param {number} params.overtricks - Number of overtricks (0 for exactly made)
 * @param {boolean} params.vulnerable - Is declarer vulnerable
 * @returns {Object} Score breakdown
 */
export function calculateMadeScore(params) {
    const { level, suit, doubled = '', overtricks = 0, vulnerable = false } = params;
    
    // Validate inputs
    validateContract({ level, suit, doubled });
    
    // Basic score
    const basicScore = calculateBasicScore(level, suit);
    
    // Apply doubling to basic score
    const doubledScore = applyDoubling(basicScore, doubled);
    
    // Game bonus
    const gameBonus = calculateGameBonus(basicScore, vulnerable);
    
    // Slam bonus
    const slamBonus = calculateSlamBonus(level, vulnerable);
    
    // Double bonus
    const doubleBonus = calculateDoubleBonus(doubled);
    
    // Overtricks
    let overtrickScore = 0;
    if (overtricks > 0) {
        if (doubled) {
            overtrickScore = calculateDoubledOvertricks(overtricks, doubled, vulnerable);
        } else {
            overtrickScore = calculateUndoubledOvertricks(overtricks, suit);
        }
    }
    
    const totalScore = doubledScore + gameBonus + slamBonus + doubleBonus + overtrickScore;
    
    return {
        score: totalScore,
        breakdown: {
            basic: basicScore,
            doubled: doubledScore,
            gameBonus,
            slamBonus,
            doubleBonus,
            overtricks: overtrickScore,
            total: totalScore
        }
    };
}

/**
 * Calculate score for a failed contract
 * @param {Object} params - Penalty parameters
 * @param {number} params.undertricks - Number of undertricks
 * @param {string} params.doubled - Double state
 * @param {boolean} params.vulnerable - Is declarer vulnerable
 * @returns {Object} Score breakdown
 */
export function calculateFailedScore(params) {
    const { undertricks, doubled = '', vulnerable = false } = params;
    
    if (undertricks <= 0) {
        throw new Error('Undertricks must be positive for failed contracts');
    }
    
    let penalty = 0;
    
    if (doubled) {
        penalty = calculateDoubledPenalties(undertricks, doubled, vulnerable);
    } else {
        penalty = calculateUndoubledPenalties(undertricks, vulnerable);
    }
    
    return {
        score: -penalty,
        breakdown: {
            undertricks,
            penalty,
            doubled: doubled || 'none',
            vulnerable,
            total: -penalty
        }
    };
}

// ===== UTILITY FUNCTIONS =====

/**
 * Validate contract parameters
 * @param {Object} contract - Contract to validate
 * @throws {Error} If contract is invalid
 */
export function validateContract(contract) {
    const { level, suit, declarer, doubled } = contract;
    
    if (!SCORING_CONSTANTS.LEVELS.includes(level)) {
        throw new Error(`Invalid level: ${level}`);
    }
    
    if (!SCORING_CONSTANTS.SUITS.includes(suit)) {
        throw new Error(`Invalid suit: ${suit}`);
    }
    
    if (declarer && !SCORING_CONSTANTS.DIRECTIONS.includes(declarer)) {
        throw new Error(`Invalid declarer: ${declarer}`);
    }
    
    if (doubled && !SCORING_CONSTANTS.DOUBLES.includes(doubled)) {
        throw new Error(`Invalid double state: ${doubled}`);
    }
}

/**
 * Check if declarer is vulnerable
 * @param {string} declarer - Declarer direction (N/S/E/W)
 * @param {string} vulnerability - Vulnerability state
 * @returns {boolean}
 */
export function isDeclarerVulnerable(declarer, vulnerability) {
    if (!SCORING_CONSTANTS.DIRECTIONS.includes(declarer)) {
        throw new Error(`Invalid declarer: ${declarer}`);
    }
    
    if (!SCORING_CONSTANTS.VULNERABILITIES.includes(vulnerability)) {
        throw new Error(`Invalid vulnerability: ${vulnerability}`);
    }
    
    const declarerSide = ['N', 'S'].includes(declarer) ? 'NS' : 'EW';
    return vulnerability === declarerSide || vulnerability === 'Both';
}

/**
 * Get partnership from direction
 * @param {string} direction - Direction (N/S/E/W)
 * @returns {string} Partnership (NS/EW)
 */
export function getPartnership(direction) {
    if (!SCORING_CONSTANTS.DIRECTIONS.includes(direction)) {
        throw new Error(`Invalid direction: ${direction}`);
    }
    
    return ['N', 'S'].includes(direction) ? 'NS' : 'EW';
}

/**
 * Format contract for display
 * @param {Object} contract - Contract object
 * @returns {string} Formatted contract string
 */
export function formatContract(contract) {
    const { level, suit, doubled = '' } = contract;
    return `${level}${suit}${doubled}`;
}

/**
 * Parse result string into components
 * @param {string} result - Result string (=, +1, -2, etc.)
 * @returns {Object} Parsed result
 */
export function parseResult(result) {
    if (!result) {
        return { type: 'unknown', number: 0 };
    }
    
    if (result === '=') {
        return { type: 'made', number: 0 };
    } else if (result.startsWith('+')) {
        return { type: 'plus', number: parseInt(result.substring(1)) || 0 };
    } else if (result.startsWith('-')) {
        return { type: 'down', number: parseInt(result.substring(1)) || 0 };
    } else {
        return { type: 'unknown', number: 0 };
    }
}

/**
 * Calculate maximum possible overtricks
 * @param {number} level - Contract level
 * @returns {number} Maximum overtricks possible
 */
export function getMaxOvertricks(level) {
    return Math.max(0, 13 - (6 + level));
}

/**
 * Check if a contract is a game contract
 * @param {number} level - Contract level
 * @param {string} suit - Contract suit
 * @returns {boolean}
 */
export function isGameContract(level, suit) {
    const basicScore = calculateBasicScore(level, suit);
    return basicScore >= SCORING_CONSTANTS.GAME_THRESHOLD;
}

/**
 * Check if a contract is a slam
 * @param {number} level - Contract level
 * @returns {string} 'small', 'grand', or 'none'
 */
export function getSlamType(level) {
    if (level === 6) return 'small';
    if (level === 7) return 'grand';
    return 'none';
}

// ===== SCORING REFERENCE TABLE =====

/**
 * Get complete scoring reference for documentation
 * @returns {Object} Scoring reference table
 */
export function getScoringReference() {
    return {
        basicScores: {
            description: "Points per level",
            clubs: "♣ = 20 per level",
            diamonds: "♦ = 20 per level",
            hearts: "♥ = 30 per level",
            spades: "♠ = 30 per level",
            noTrump: "NT = 30 per level + 10 first trick"
        },
        
        bonuses: {
            gameThreshold: SCORING_CONSTANTS.GAME_THRESHOLD,
            gameBonus: {
                vulnerable: SCORING_CONSTANTS.GAME_BONUS.VULNERABLE,
                notVulnerable: SCORING_CONSTANTS.GAME_BONUS.NOT_VULNERABLE
            },
            partGameBonus: SCORING_CONSTANTS.GAME_BONUS.PART_GAME,
            slamBonus: SCORING_CONSTANTS.SLAM_BONUS,
            doubleBonus: SCORING_CONSTANTS.DOUBLE_BONUS
        },
        
        penalties: {
            undoubled: SCORING_CONSTANTS.PENALTIES.UNDOUBLED,
            doubled: SCORING_CONSTANTS.PENALTIES.DOUBLED
        },
        
        overtricks: {
            undoubled: "Same as basic suit value",
            doubled: SCORING_CONSTANTS.OVERTRICKS.DOUBLED
        }
    };
}

// ===== TESTING UTILITIES =====

/**
 * Test scoring with sample contracts (for debugging)
 * @returns {Array} Array of test results
 */
export function testScoring() {
    const testCases = [
        // Basic game contracts
        { level: 3, suit: 'NT', doubled: '', overtricks: 0, vulnerable: false },
        { level: 4, suit: '♥', doubled: '', overtricks: 0, vulnerable: true },
        
        // Part-game contracts
        { level: 1, suit: '♠', doubled: '', overtricks: 1, vulnerable: false },
        { level: 2, suit: '♣', doubled: 'X', overtricks: 0, vulnerable: false },
        
        // Slam contracts
        { level: 6, suit: '♠', doubled: '', overtricks: 0, vulnerable: true },
        { level: 7, suit: 'NT', doubled: '', overtricks: 0, vulnerable: false },
        
        // Failed contracts
        { undertricks: 1, doubled: '', vulnerable: false },
        { undertricks: 2, doubled: 'X', vulnerable: true },
        { undertricks: 4, doubled: 'XX', vulnerable: false }
    ];
    
    return testCases.map((testCase, index) => {
        try {
            let result;
            if (testCase.undertricks) {
                result = calculateFailedScore(testCase);
            } else {
                result = calculateMadeScore(testCase);
            }
            
            return {
                test: index + 1,
                input: testCase,
                result: result,
                success: true
            };
        } catch (error) {
            return {
                test: index + 1,
                input: testCase,
                error: error.message,
                success: false
            };
        }
    });
}

// ===== DEFAULT EXPORT =====

export default {
    SCORING_CONSTANTS,
    calculateBasicScore,
    calculateGameBonus,
    calculateSlamBonus,
    calculateDoubleBonus,
    calculateMadeScore,
    calculateFailedScore,
    calculateDoubledPenalties,
    calculateUndoubledPenalties,
    calculateDoubledOvertricks,
    calculateUndoubledOvertricks,
    validateContract,
    isDeclarerVulnerable,
    getPartnership,
    formatContract,
    parseResult,
    getMaxOvertricks,
    isGameContract,
    getSlamType,
    getScoringReference,
    testScoring
};