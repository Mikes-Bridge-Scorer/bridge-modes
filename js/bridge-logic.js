// ===== BRIDGE LOGIC - CORE SCORING CALCULATIONS =====

export class BridgeLogic {
    constructor() {
        // Basic scoring values
        this.basicScores = {
            '♣': 20, '♦': 20,   // Minor suits
            '♥': 30, '♠': 30,   // Major suits  
            'NT': 30           // No Trump
        };
        
        // Vulnerability bonuses
        this.gameBonus = {
            vulnerable: 500,
            notVulnerable: 300,
            partGame: 50
        };
        
        // Slam bonuses
        this.slamBonus = {
            small: { vulnerable: 750, notVulnerable: 500 },
            grand: { vulnerable: 1500, notVulnerable: 1000 }
        };
        
        console.log('🧮 Bridge Logic initialized');
    }
    
    // ===== MAIN SCORING METHOD =====
    calculateScore(params) {
        const { mode, contract, vulnerability, gameState } = params;
        
        try {
            // Validate input
            this.validateContract(contract);
            
            // Calculate basic score
            let result;
            
            if (this.contractMade(contract.result)) {
                result = this.calculateMadeScore(contract, vulnerability);
            } else {
                result = this.calculateFailedScore(contract, vulnerability);
            }
            
            // Apply mode-specific modifications
            result = this.applyModeModifications(result, mode, gameState);
            
            console.log(`💰 Score calculated: ${result.score} (${contract.level}${contract.suit}${contract.doubled} by ${contract.declarer})`);
            
            return result;
            
        } catch (error) {
            console.error('❌ Error in score calculation:', error);
            throw new Error(`Scoring error: ${error.message}`);
        }
    }
    
    // ===== CONTRACT VALIDATION =====
    validateContract(contract) {
        if (!contract.level || contract.level < 1 || contract.level > 7) {
            throw new Error('Invalid bid level');
        }
        
        if (!contract.suit || !['♣', '♦', '♥', '♠', 'NT'].includes(contract.suit)) {
            throw new Error('Invalid suit');
        }
        
        if (!contract.declarer || !['N', 'S', 'E', 'W'].includes(contract.declarer)) {
            throw new Error('Invalid declarer');
        }
        
        if (!contract.result) {
            throw new Error('Missing result');
        }
    }
    
    // ===== MADE CONTRACT SCORING =====
    calculateMadeScore(contract, vulnerability) {
        const { level, suit, doubled, result } = contract;
        const isVulnerable = this.isDeclarerVulnerable(contract, vulnerability);
        
        // Basic trick score
        let score = this.getBasicScore(level, suit);
        
        // Apply doubling to basic score
        if (doubled === 'X') {
            score *= 2;
        } else if (doubled === 'XX') {
            score *= 4;
        }
        
        // Game bonus
        const originalBasic = this.getBasicScore(level, suit);
        if (originalBasic >= 100) {
            score += isVulnerable ? this.gameBonus.vulnerable : this.gameBonus.notVulnerable;
        } else {
            score += this.gameBonus.partGame;
        }
        
        // Slam bonuses
        if (level === 6) {
            score += isVulnerable ? this.slamBonus.small.vulnerable : this.slamBonus.small.notVulnerable;
        } else if (level === 7) {
            score += isVulnerable ? this.slamBonus.grand.vulnerable : this.slamBonus.grand.notVulnerable;
        }
        
        // Double/redouble bonus
        if (doubled === 'X') {
            score += 50;
        } else if (doubled === 'XX') {
            score += 100;
        }
        
        // Overtricks
        if (result.startsWith('+')) {
            const overtricks = parseInt(result.substring(1));
            score += this.calculateOvertricks(overtricks, suit, doubled, isVulnerable);
        }
        
        return {
            score: score,
            breakdown: this.getScoreBreakdown(contract, score, isVulnerable),
            gamePoints: originalBasic >= 100 ? 1 : 0
        };
    }
    
    // ===== FAILED CONTRACT SCORING =====
    calculateFailedScore(contract, vulnerability) {
        const { doubled } = contract;
        const undertricks = parseInt(contract.result.substring(1));
        const isVulnerable = this.isDeclarerVulnerable(contract, vulnerability);
        
        let penalty = 0;
        
        if (!doubled) {
            // Undoubled penalties
            penalty = undertricks * (isVulnerable ? 100 : 50);
        } else {
            // Doubled penalties
            penalty = this.calculateDoubledPenalties(undertricks, doubled, isVulnerable);
        }
        
        return {
            score: -penalty,
            breakdown: {
                undertricks: undertricks,
                penalty: penalty,
                doubled: doubled,
                vulnerable: isVulnerable
            },
            gamePoints: 0
        };
    }
    
    // ===== HELPER CALCULATIONS =====
    getBasicScore(level, suit) {
        let score = level * this.basicScores[suit];
        
        // No Trump bonus for first trick
        if (suit === 'NT') {
            score += 10;
        }
        
        return score;
    }
    
    calculateOvertricks(overtricks, suit, doubled, vulnerable) {
        if (!doubled) {
            // Undoubled overtricks
            const suitValue = suit === 'NT' || ['♥', '♠'].includes(suit) ? 30 : 20;
            return overtricks * suitValue;
        } else {
            // Doubled overtricks
            const multiplier = doubled === 'XX' ? 2 : 1;
            return overtricks * (vulnerable ? 200 : 100) * multiplier;
        }
    }
    
    calculateDoubledPenalties(undertricks, doubled, vulnerable) {
        let penalty = 0;
        const multiplier = doubled === 'XX' ? 2 : 1;
        
        for (let i = 1; i <= undertricks; i++) {
            if (i === 1) {
                penalty += (vulnerable ? 200 : 100) * multiplier;
            } else if (i <= 3) {
                penalty += (vulnerable ? 300 : 200) * multiplier;
            } else {
                penalty += 300 * multiplier;
            }
        }
        
        return penalty;
    }
    
    // ===== VULNERABILITY LOGIC =====
    isDeclarerVulnerable(contract, vulnerability) {
        const declarerSide = ['N', 'S'].includes(contract.declarer) ? 'NS' : 'EW';
        return vulnerability === declarerSide || vulnerability === 'Both';
    }
    
    getRubberVulnerability(gameState) {
        // Rubber bridge vulnerability based on games won
        const nsGames = this.countGamesWon(gameState.history, 'NS');
        const ewGames = this.countGamesWon(gameState.history, 'EW');
        
        if (nsGames > 0 && ewGames > 0) {
            return 'Both';
        } else if (nsGames > 0) {
            return 'NS';
        } else if (ewGames > 0) {
            return 'EW';
        } else {
            return 'None';
        }
    }
    
    countGamesWon(history, side) {
        let games = 0;
        let currentGameScore = 0;
        
        history.forEach(deal => {
            const dealSide = ['N', 'S'].includes(deal.contract.declarer) ? 'NS' : 'EW';
            if (dealSide === side && deal.breakdown && deal.breakdown.gamePoints) {
                currentGameScore += deal.breakdown.gamePoints;
                if (currentGameScore >= 100) {
                    games++;
                    currentGameScore = 0;
                }
            }
        });
        
        return games;
    }
    
    // ===== MODE-SPECIFIC MODIFICATIONS =====
    applyModeModifications(result, mode, gameState) {
        switch (mode) {
            case 'kitchen':
                return this.applyKitchenModifications(result, gameState);
                
            case 'bonus':
                return this.applyBonusModifications(result, gameState);
                
            case 'chicago':
                return this.applyChicagoModifications(result, gameState);
                
            case 'rubber':
                return this.applyRubberModifications(result, gameState);
                
            case 'duplicate':
                return this.applyDuplicateModifications(result, gameState);
                
            default:
                return result;
        }
    }
    
    applyKitchenModifications(result, gameState) {
        // Kitchen bridge: Simple scoring, no special bonuses
        return result;
    }
    
    applyBonusModifications(result, gameState) {
        // Bonus bridge: Additional bonuses for certain achievements
        if (result.score > 0) {
            // Bonus for making difficult contracts
            if (result.breakdown && result.breakdown.contract) {
                const contract = result.breakdown.contract;
                if (contract.level >= 6) {
                    result.score += 100; // Slam bonus
                }
                if (contract.doubled) {
                    result.score += 50; // Double bonus
                }
            }
        }
        return result;
    }
    
    applyChicagoModifications(result, gameState) {
        // Chicago bridge: 4 deals, specific vulnerability schedule
        // Standard scoring applies
        return result;
    }
    
    applyRubberModifications(result, gameState) {
        // Rubber bridge: Additional rubber bonuses
        if (result.gamePoints > 0) {
            // Check if this completes a game
            const nsGames = this.countGamesWon(gameState.history, 'NS');
            const ewGames = this.countGamesWon(gameState.history, 'EW');
            
            // Add rubber bonus if someone wins 2 games
            if (nsGames === 2 || ewGames === 2) {
                const winner = nsGames === 2 ? 'NS' : 'EW';
                const loserGames = nsGames === 2 ? ewGames : nsGames;
                
                // Rubber bonus: 700 if opponent has no game, 500 if they have one
                const rubberBonus = loserGames === 0 ? 700 : 500;
                
                if ((winner === 'NS' && ['N', 'S'].includes(result.breakdown.declarer)) ||
                    (winner === 'EW' && ['E', 'W'].includes(result.breakdown.declarer))) {
                    result.score += rubberBonus;
                    result.rubberComplete = true;
                }
            }
        }
        
        return result;
    }
    
    applyDuplicateModifications(result, gameState) {
        // Duplicate bridge: Matchpoint scoring (simplified)
        // In real duplicate, this would compare against other tables
        return result;
    }
    
    // ===== UTILITY METHODS =====
    contractMade(result) {
        return result === '=' || result.startsWith('+');
    }
    
    getScoreBreakdown(contract, totalScore, vulnerable) {
        const basicScore = this.getBasicScore(contract.level, contract.suit);
        
        return {
            contract: `${contract.level}${contract.suit}${contract.doubled}`,
            declarer: contract.declarer,
            basic: basicScore,
            doubled: contract.doubled ? (contract.doubled === 'X' ? 2 : 4) : 1,
            vulnerable: vulnerable,
            total: totalScore
        };
    }
    
    // ===== ADVANCED SCORING FEATURES =====
    
    calculateHonorPoints(honors, trump) {
        // Honor points calculation (optional feature)
        // 4 honors in trump = 100, 5 honors = 150
        // 4 aces in NT = 150
        if (!honors || honors.length === 0) return 0;
        
        if (trump === 'NT') {
            const aces = honors.filter(h => h.rank === 'A').length;
            return aces === 4 ? 150 : 0;
        } else {
            const trumpHonors = honors.filter(h => h.suit === trump && 
                ['A', 'K', 'Q', 'J', '10'].includes(h.rank)).length;
            
            if (trumpHonors === 5) return 150;
            if (trumpHonors === 4) return 100;
            return 0;
        }
    }
    
    validateBid(level, suit, previousBid) {
        // Validate if a bid is legal given the previous bid
        if (!previousBid) return true; // First bid
        
        const suitOrder = ['♣', '♦', '♥', '♠', 'NT'];
        const previousSuitIndex = suitOrder.indexOf(previousBid.suit);
        const currentSuitIndex = suitOrder.indexOf(suit);
        
        // Higher level is always valid
        if (level > previousBid.level) return true;
        
        // Same level but higher suit
        if (level === previousBid.level && currentSuitIndex > previousSuitIndex) {
            return true;
        }
        
        return false;
    }
    
    calculatePartnershipScore(deals, partnership) {
        // Calculate total score for a partnership across multiple deals
        let total = 0;
        let games = 0;
        let partGames = 0;
        
        deals.forEach(deal => {
            const dealPartnership = ['N', 'S'].includes(deal.declarer) ? 'NS' : 'EW';
            if (dealPartnership === partnership) {
                total += deal.score;
                if (deal.gamePoints) games += deal.gamePoints;
                if (deal.score > 0 && !deal.gamePoints) partGames++;
            }
        });
        
        return {
            total,
            games,
            partGames,
            average: deals.length > 0 ? total / deals.length : 0
        };
    }
    
    // ===== STATISTICAL METHODS =====
    
    getGameStatistics(history) {
        const stats = {
            totalDeals: history.length,
            nsScore: 0,
            ewScore: 0,
            nsGames: 0,
            ewGames: 0,
            nsPartGames: 0,
            ewPartGames: 0,
            doubles: 0,
            redoubles: 0,
            slams: 0,
            grandSlams: 0
        };
        
        history.forEach(deal => {
            const side = ['N', 'S'].includes(deal.contract.declarer) ? 'NS' : 'EW';
            
            if (side === 'NS') {
                stats.nsScore += deal.score;
            } else {
                stats.ewScore += deal.score;
            }
            
            if (deal.breakdown && deal.breakdown.gamePoints) {
                if (side === 'NS') stats.nsGames++;
                else stats.ewGames++;
            } else if (deal.score > 0) {
                if (side === 'NS') stats.nsPartGames++;
                else stats.ewPartGames++;
            }
            
            if (deal.contract.doubled === 'X') stats.doubles++;
            if (deal.contract.doubled === 'XX') stats.redoubles++;
            if (deal.contract.level === 6) stats.slams++;
            if (deal.contract.level === 7) stats.grandSlams++;
        });
        
        return stats;
    }
    
    // ===== SCORING REFERENCE TABLES =====
    
    static getScoringReference() {
        return {
            basicScores: {
                description: "Points per level",
                minorSuits: "♣♦ = 20 per level",
                majorSuits: "♥♠ = 30 per level", 
                noTrump: "NT = 30 per level + 10 first trick"
            },
            
            gameBonuses: {
                description: "Bonus for making game (100+ basic points)",
                notVulnerable: 300,
                vulnerable: 500,
                partGame: 50
            },
            
            slamBonuses: {
                smallSlam: { notVulnerable: 500, vulnerable: 750 },
                grandSlam: { notVulnerable: 1000, vulnerable: 1500 }
            },
            
            doubleBonuses: {
                double: 50,
                redouble: 100,
                overtricksNotVuln: 100,
                overtricksVuln: 200
            },
            
            penalties: {
                undoubledNotVuln: 50,
                undoubledVuln: 100,
                doubledFirst: { notVuln: 100, vuln: 200 },
                doubledSecondThird: { notVuln: 200, vuln: 300 },
                doubledFourthPlus: 300
            }
        };
    }
    
    // ===== DEBUG AND TESTING METHODS =====
    
    debugScore(contract, vulnerability) {
        console.group(`🔍 Debug scoring: ${contract.level}${contract.suit}${contract.doubled} by ${contract.declarer}`);
        
        const result = this.calculateScore({
            mode: 'standard',
            contract,
            vulnerability,
            gameState: { history: [] }
        });
        
        console.log('Contract:', contract);
        console.log('Vulnerability:', vulnerability);
        console.log('Result:', result);
        console.log('Breakdown:', result.breakdown);
        
        console.groupEnd();
        
        return result;
    }
    
    testScoringScenarios() {
        const scenarios = [
            { contract: { level: 3, suit: 'NT', declarer: 'N', doubled: '', result: '=' }, vuln: 'None' },
            { contract: { level: 1, suit: '♠', declarer: 'S', doubled: 'X', result: '+1' }, vuln: 'NS' },
            { contract: { level: 6, suit: '♣', declarer: 'E', doubled: '', result: '=' }, vuln: 'Both' },
            { contract: { level: 4, suit: '♥', declarer: 'W', doubled: '', result: '-1' }, vuln: 'EW' }
        ];
        
        console.group('🧪 Testing scoring scenarios');
        
        scenarios.forEach((scenario, index) => {
            console.log(`Test ${index + 1}:`, this.debugScore(scenario.contract, scenario.vuln));
        });
        
        console.groupEnd();
    }
}

// ===== SCORING CONSTANTS =====
export const SCORING_CONSTANTS = {
    SUITS: ['♣', '♦', '♥', '♠', 'NT'],
    DIRECTIONS: ['N', 'E', 'S', 'W'],
    VULNERABILITIES: ['None', 'NS', 'EW', 'Both'],
    DOUBLES: ['', 'X', 'XX'],
    MIN_LEVEL: 1,
    MAX_LEVEL: 7,
    GAME_THRESHOLD: 100
};

// ===== EXPORT UTILITY FUNCTIONS =====
export const BridgeUtils = {
    formatContract(contract) {
        return `${contract.level}${contract.suit}${contract.doubled}`;
    },
    
    getPartnership(direction) {
        return ['N', 'S'].includes(direction) ? 'NS' : 'EW';
    },
    
    getNextDirection(direction) {
        const dirs = ['N', 'E', 'S', 'W'];
        const index = dirs.indexOf(direction);
        return dirs[(index + 1) % 4];
    },
    
    isMajorSuit(suit) {
        return ['♥', '♠'].includes(suit);
    },
    
    isMinorSuit(suit) {
        return ['♣', '♦'].includes(suit);
    },
    
    validateLevel(level) {
        return Number.isInteger(level) && level >= 1 && level <= 7;
    },
    
    validateSuit(suit) {
        return SCORING_CONSTANTS.SUITS.includes(suit);
    },
    
    validateDirection(direction) {
        return SCORING_CONSTANTS.DIRECTIONS.includes(direction);
    }
};