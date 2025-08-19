// SECTION ONE - Header and Constructor
/**
 * Rubber Bridge Mode - Classic Bridge with Above/Below Line Scoring (Enhanced)
 * MOBILE ENHANCED VERSION - Full touch support for all devices
 * Updated to work with new modular bridge system
 * 
 * Rubber Bridge is the classic form of bridge featuring:
 * - Above/below the line scoring system
 * - Game completion at 100+ below-line points
 * - Vulnerability after winning a game
 * - Rubber completion (best of 3 games)
 * - Honor bonuses for holding A-K-Q-J-10
 * - Rubber bonuses: 500 points (2-1) or 700 points (2-0)
 * 
 * Enhanced with comprehensive scoring display and mobile optimization.
 */

class RubberBridgeMode extends BaseBridgeMode {
    constructor(bridgeApp) {
        super(bridgeApp);
        
        this.modeName = 'Rubber Bridge';
        this.displayName = '🎩 Rubber Bridge';
        
        // Contract state
        this.currentContract = {
            level: null,
            suit: null,
            declarer: null,
            doubled: '',
            result: null
        };
        
        this.inputState = 'level_selection';
        this.resultMode = null; // 'down', 'plus'
        
        // Rubber state with detailed scoring
        this.rubberState = {
            gamesWon: { NS: 0, EW: 0 },
            belowLineScores: { NS: 0, EW: 0 },     // Contract points (toward game)
            aboveLineScores: { NS: 0, EW: 0 },     // Bonus points
            partScores: { NS: 0, EW: 0 },          // Current game progress
            rubberComplete: false,
            rubberWinner: null,
            vulnerability: { NS: false, EW: false },
            honorBonusPending: false,
            lastContractSide: null,
            lastContractDetails: null
        };
        
        // Mobile detection
        this.isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        console.log('🎩 Rubber Bridge mode initialized with enhanced mobile support');
        
        // Initialize immediately
        this.initialize();
    }
// END SECTION ONE

// SECTION TWO - Core Methods
    /**
     * Initialize Rubber Bridge mode
     */
    initialize() {
        console.log('🎯 Starting Rubber Bridge session');
        
        // Initialize game state if not already done
        if (!this.gameState) {
            this.gameState = this.bridgeApp.gameState || {
                scores: { NS: 0, EW: 0 },
                history: [],
                currentDeal: 1
            };
        }
        
        // Initialize current deal if not set
        if (!this.currentDeal) {
            this.currentDeal = this.gameState.currentDeal || 1;
        }
        
        // Start with level selection
        this.inputState = 'level_selection';
        this.resetContract();
        
        // Initialize rubber if needed
        if (this.rubberState.gamesWon.NS === 0 && this.rubberState.gamesWon.EW === 0) {
            this.resetRubber();
        }
        
        this.updateDisplay();
        
        console.log(`🎯 Deal ${this.currentDeal} initialized - Games: ${this.rubberState.gamesWon.NS}-${this.rubberState.gamesWon.EW}`);
    }
    
    /**
     * Reset rubber to initial state
     */
    resetRubber() {
        this.rubberState.gamesWon = { NS: 0, EW: 0 };
        this.rubberState.belowLineScores = { NS: 0, EW: 0 };
        this.rubberState.aboveLineScores = { NS: 0, EW: 0 };
        this.rubberState.partScores = { NS: 0, EW: 0 };
        this.rubberState.rubberComplete = false;
        this.rubberState.rubberWinner = null;
        this.rubberState.vulnerability = { NS: false, EW: false };
        this.rubberState.honorBonusPending = false;
        this.rubberState.lastContractSide = null;
        this.rubberState.lastContractDetails = null;
        
        // Reset game state scores
        this.gameState.scores = { NS: 0, EW: 0 };
        
        console.log('🔄 Rubber reset - starting fresh');
    }
    
    /**
     * Start a new rubber
     */
    startNewRubber() {
        console.log('🆕 Starting new rubber');
        this.resetRubber();
        this.resetContract();
        this.inputState = 'level_selection';
        this.updateDisplay();
    }
    
    /**
     * Get current vulnerability status as string
     */
    getCurrentVulnerabilityString() {
        const nsVuln = this.rubberState.vulnerability.NS;
        const ewVuln = this.rubberState.vulnerability.EW;
        if (nsVuln && ewVuln) return 'Both';
        if (nsVuln) return 'NS';
        if (ewVuln) return 'EW';
        return 'None';
    }
    
    /**
     * Check if a side is vulnerable
     */
    isVulnerable(declarer) {
        const declarerSide = (declarer === 'N' || declarer === 'S') ? 'NS' : 'EW';
        return this.rubberState.vulnerability[declarerSide];
    }
    
    /**
     * Check if declarer is vulnerable - used by scoring
     */
    isDeclarerVulnerable() {
        return this.isVulnerable(this.currentContract.declarer);
    }
    
    /**
     * Get rubber totals (below + above line)
     */
    getRubberTotals() {
        return {
            NS: this.rubberState.belowLineScores.NS + this.rubberState.aboveLineScores.NS,
            EW: this.rubberState.belowLineScores.EW + this.rubberState.aboveLineScores.EW
        };
    }
    
    /**
     * Update game state scores from rubber totals
     */
    updateGameStateScores() {
        const totals = this.getRubberTotals();
        this.gameState.scores.NS = totals.NS;
        this.gameState.scores.EW = totals.EW;
    }
    
    /**
     * Handle user input - integration with new system - FIXED FOR HONOR BUTTON
     */
    handleInput(value) {
        console.log(`🎮 Rubber Bridge input: ${value} in state: ${this.inputState}`);
        
        // Handle rubber completion
        if (this.rubberState.rubberComplete && value === 'DEAL') {
            this.startNewRubber();
            return;
        }
        
        // Handle honor bonus input
        if (this.rubberState.honorBonusPending) {
            this.handleHonorBonusInput(value);
            return;
        }
        
        // Handle back navigation
        if (value === 'BACK') {
            if (this.handleBack()) {
                return; // Handled internally
            } else {
                // Let parent handle (return to mode selection)
                this.bridgeApp.showLicensedMode({ 
                    type: this.bridgeApp.licenseManager.getLicenseData()?.type || 'FULL' 
                });
                return;
            }
        }
        
        // Handle control buttons
        if (value === 'HELP') {
            this.showHelp();
            return;
        }
        
        if (value === 'QUIT') {
            this.showQuit();
            return;
        }
        
        // Handle honors button - FIXED: X button works as honors in scoring state
        if (value === 'HONORS' || (this.inputState === 'scoring' && value === 'X')) {
            this.startHonorBonusInput();
            return;
        }
        
        // Handle other inputs
        this.handleAction(value);
    }
    
    /**
     * Vulnerability is controlled by game wins in Rubber Bridge
     */
    toggleVulnerability() {
        console.log('🚫 Manual vulnerability control not allowed in Rubber Bridge - controlled by game wins');
        
        // Show brief message to user about rubber vulnerability
        const vulnText = document.getElementById('vulnText');
        if (vulnText) {
            const originalText = vulnText.textContent;
            vulnText.textContent = 'GAME';
            vulnText.style.color = '#e74c3c';
            vulnText.style.fontWeight = 'bold';
            
            setTimeout(() => {
                vulnText.textContent = originalText;
                vulnText.style.color = '';
                vulnText.style.fontWeight = '';
            }, 1500);
        }
        
        // Show informational message
        this.bridgeApp.showMessage('Rubber Bridge vulnerability is determined by winning games', 'info');
    }
    
    /**
     * Update the vulnerability display in the UI control
     */
    updateVulnerabilityDisplay() {
        const vulnText = document.getElementById('vulnText');
        if (vulnText) {
            vulnText.textContent = this.getCurrentVulnerabilityString();
        }
    }
// END SECTION TWO

// SECTION THREE - Action Handlers
    /**
     * Handle user actions with enhanced mobile support
     */
    handleAction(value) {
        switch (this.inputState) {
            case 'level_selection':
                this.handleLevelSelection(value);
                break;
            case 'suit_selection':
                this.handleSuitSelection(value);
                break;
            case 'declarer_selection':
                this.handleDeclarerSelection(value);
                break;
            case 'result_type_selection':
                this.handleResultTypeSelection(value);
                break;
            case 'result_number_selection':
                this.handleResultNumberSelection(value);
                break;
            case 'scoring':
                this.handleScoringActions(value);
                break;
        }
        
        this.updateDisplay();
    }
    
    /**
     * Handle bid level selection (1-7)
     */
    handleLevelSelection(value) {
        if (['1', '2', '3', '4', '5', '6', '7'].includes(value)) {
            this.currentContract.level = parseInt(value);
            this.inputState = 'suit_selection';
            console.log(`📊 Level selected: ${this.currentContract.level}`);
        }
    }
    
    /**
     * Handle suit selection
     */
    handleSuitSelection(value) {
        if (['♣', '♦', '♥', '♠', 'NT'].includes(value)) {
            this.currentContract.suit = value;
            this.inputState = 'declarer_selection';
            console.log(`♠ Suit selected: ${this.currentContract.suit}`);
        }
    }
    
    /**
     * Handle declarer selection and doubling
     */
    handleDeclarerSelection(value) {
        if (['N', 'S', 'E', 'W'].includes(value)) {
            this.currentContract.declarer = value;
            console.log(`👤 Declarer selected: ${this.currentContract.declarer}`);
            
        } else if (value === 'X') {
            this.handleDoubling();
        } else if (['MADE', 'PLUS', 'DOWN'].includes(value)) {
            // Only advance to result if declarer is selected
            if (this.currentContract.declarer) {
                this.inputState = 'result_type_selection';
                this.handleResultTypeSelection(value);
                return;
            }
        }
    }
    
    /**
     * Handle doubling (X/XX cycling)
     */
    handleDoubling() {
        if (this.currentContract.doubled === '') {
            this.currentContract.doubled = 'X';
        } else if (this.currentContract.doubled === 'X') {
            this.currentContract.doubled = 'XX';
        } else {
            this.currentContract.doubled = '';
        }
        
        console.log(`💥 Double state: ${this.currentContract.doubled || 'None'}`);
    }
    
    /**
     * Handle result type selection (Made/Plus/Down)
     */
    handleResultTypeSelection(value) {
        if (value === 'MADE') {
            this.currentContract.result = '=';
            this.calculateAndRecordScore();
            this.inputState = 'scoring';
        } else if (value === 'DOWN') {
            this.resultMode = 'down';
            this.inputState = 'result_number_selection';
        } else if (value === 'PLUS') {
            this.resultMode = 'plus';
            this.inputState = 'result_number_selection';
        }
    }
    
    /**
     * Handle result number selection (overtricks/undertricks)
     */
    handleResultNumberSelection(value) {
        if (['1', '2', '3', '4', '5', '6', '7'].includes(value)) {
            const num = parseInt(value);
            
            if (this.resultMode === 'down') {
                this.currentContract.result = `-${num}`;
            } else if (this.resultMode === 'plus') {
                const maxOvertricks = 13 - (6 + this.currentContract.level);
                if (num <= maxOvertricks) {
                    this.currentContract.result = `+${num}`;
                } else {
                    console.warn(`⚠️ Invalid overtricks: ${num}, max is ${maxOvertricks}`);
                    return;
                }
            }
            
            this.calculateAndRecordScore();
            this.inputState = 'scoring';
        }
    }
    
    /**
     * Handle actions in scoring state
     */
    handleScoringActions(value) {
        if (value === 'HONORS') {
            this.startHonorBonusInput();
        } else if (value === 'DEAL') {
            this.nextDeal();
        }
    }
    
    /**
     * Start honor bonus input process
     */
    startHonorBonusInput() {
        this.rubberState.honorBonusPending = true;
        console.log('🏅 Starting honor bonus input');
        this.updateDisplay();
    }
    
    /**
     * Handle honor bonus input
     */
    handleHonorBonusInput(value) {
        console.log(`🏅 Honor bonus input: ${value}`);
        
        if (value === 'BACK') {
            this.rubberState.honorBonusPending = false;
            console.log('❌ No honor bonuses claimed');
        } else if (value === 'PLUS') {
            // 4 honors in suit (100) or 4 aces in NT (150)
            const bonus = this.currentContract.suit === 'NT' ? 150 : 100;
            this.awardHonorBonus(bonus);
            console.log(`✅ Awarded ${bonus} points for 4 honors/aces`);
        } else if (value === 'DOWN') {
            // 5 honors (150) - only available in suit contracts
            if (this.currentContract.suit !== 'NT') {
                this.awardHonorBonus(150);
                console.log('✅ Awarded 150 points for 5 honors');
            } else {
                console.log('❌ 5 honors not available in NT contracts');
            }
        }
        
        this.rubberState.honorBonusPending = false;
        this.updateDisplay();
    }
    
    /**
     * Award honor bonus to the last contract side
     */
    awardHonorBonus(bonus) {
        if (this.rubberState.lastContractSide && bonus > 0) {
            this.rubberState.aboveLineScores[this.rubberState.lastContractSide] += bonus;
            this.updateGameStateScores();
            console.log(`🏆 ${bonus} honor points awarded to ${this.rubberState.lastContractSide}`);
            
            // Add to history for tracking
            this.gameState.addDeal({
                deal: this.currentDeal,
                contract: { level: 0, suit: 'HONOR', declarer: this.rubberState.lastContractSide, doubled: '', result: `+${bonus}` },
                score: bonus,
                actualScore: bonus,
                scoringSide: this.rubberState.lastContractSide,
                mode: 'rubber',
                honorBonus: true,
                rubberScoring: {
                    belowLine: 0,
                    aboveLine: bonus,
                    gameWon: false
                }
            });
        }
    }
// END SECTION THREE

// SECTION FOUR - Rubber Bridge Scoring Logic
    /**
     * Calculate and record score using Rubber Bridge rules
     */
    calculateAndRecordScore() {
        const { level, suit, result, doubled, declarer } = this.currentContract;
        const suitValues = { '♣': 20, '♦': 20, '♥': 30, '♠': 30, 'NT': 30 };
        const declarerSide = (declarer === 'N' || declarer === 'S') ? 'NS' : 'EW';
        const isVulnerable = this.isDeclarerVulnerable();
        
        let belowLineScore = 0;
        let aboveLineScore = 0;
        let contractMade = false;
        let totalScore = 0;
        
        console.log(`💰 Calculating Rubber Bridge score for ${level}${suit}${doubled} by ${declarer} = ${result}, vuln: ${isVulnerable}`);
        
        if (result === '=' || (result && result.startsWith('+'))) {
            contractMade = true;
            
            // Basic score calculation (goes below the line)
            let basicScore = level * suitValues[suit];
            if (suit === 'NT') basicScore += 10; // First trick bonus for NT
            
            // Apply doubling to basic score
            belowLineScore = basicScore;
            if (doubled === 'X') belowLineScore *= 2;
            else if (doubled === 'XX') belowLineScore *= 4;
            
            // Game and part-game bonuses (go above the line)
            if (belowLineScore >= 100) {
                aboveLineScore += isVulnerable ? 500 : 300; // Game bonus
            } else {
                aboveLineScore += 50; // Part-game bonus
            }
            
            // Slam bonuses (go above the line)
            if (level === 6) {
                aboveLineScore += isVulnerable ? 750 : 500; // Small slam
            } else if (level === 7) {
                aboveLineScore += isVulnerable ? 1500 : 1000; // Grand slam
            }
            
            // Double bonuses (go above the line)
            if (doubled === 'X') aboveLineScore += 50;
            else if (doubled === 'XX') aboveLineScore += 100;
            
            // Overtricks (go above the line)
            if (result && result.startsWith('+')) {
                const overtricks = parseInt(result.substring(1));
                if (doubled === '') {
                    // Undoubled overtricks at basic rate
                    aboveLineScore += suitValues[suit] * overtricks;
                } else {
                    // Doubled overtricks at penalty rates
                    let overtrickValue = overtricks * (isVulnerable ? 200 : 100);
                    if (doubled === 'XX') overtrickValue *= 2;
                    aboveLineScore += overtrickValue;
                }
            }
            
            totalScore = belowLineScore + aboveLineScore;
            
            // Update rubber state for made contracts
            this.rubberState.partScores[declarerSide] += belowLineScore;
            this.rubberState.aboveLineScores[declarerSide] += aboveLineScore;
            this.rubberState.belowLineScores[declarerSide] += belowLineScore;
            this.rubberState.lastContractSide = declarerSide;
            
            // Check for game completion
            if (this.rubberState.partScores[declarerSide] >= 100) {
                this.processGameWon(declarerSide);
            }
            
        } else if (result && result.startsWith('-')) {
            // Contract failed - penalties go above the line to defending side
            const undertricks = parseInt(result.substring(1));
            const defendingSide = declarerSide === 'NS' ? 'EW' : 'NS';
            
            if (doubled === '') {
                // Undoubled penalties
                aboveLineScore = undertricks * (isVulnerable ? 100 : 50);
            } else {
                // Doubled penalties - complex structure
                let penalty = 0;
                for (let i = 1; i <= undertricks; i++) {
                    if (i === 1) {
                        penalty += isVulnerable ? 200 : 100;
                    } else if (i <= 3) {
                        penalty += isVulnerable ? 300 : 200;
                    } else {
                        penalty += 300;
                    }
                }
                if (doubled === 'XX') penalty *= 2;
                aboveLineScore = penalty;
            }
            
            totalScore = -aboveLineScore; // Negative for display purposes
            
            // Update rubber state for failed contracts
            this.rubberState.aboveLineScores[defendingSide] += aboveLineScore;
            this.rubberState.lastContractSide = defendingSide;
        }
        
        // Store contract details for display and honor bonuses
        this.rubberState.lastContractDetails = {
            contract: `${level}${suit}${doubled}`,
            declarer: declarer,
            result: result,
            belowLineScore: belowLineScore,
            aboveLineScore: contractMade ? aboveLineScore : aboveLineScore,
            totalScore: totalScore,
            gameWon: contractMade && this.rubberState.partScores[declarerSide] >= 100
        };
        
        // Update game state scores
        this.updateGameStateScores();
        
        // Record in history with rubber-specific details
        this.gameState.addDeal({
            deal: this.currentDeal,
            contract: { ...this.currentContract },
            score: totalScore,
            actualScore: Math.abs(totalScore),
            scoringSide: contractMade ? declarerSide : (declarerSide === 'NS' ? 'EW' : 'NS'),
            mode: 'rubber',
            vulnerability: this.getCurrentVulnerabilityString(),
            rubberScoring: {
                belowLine: belowLineScore,
                aboveLine: contractMade ? aboveLineScore : aboveLineScore,
                gameWon: contractMade && this.rubberState.partScores[declarerSide] >= 100,
                rubberState: {
                    gamesWon: { ...this.rubberState.gamesWon },
                    vulnerability: { ...this.rubberState.vulnerability }
                }
            }
        });
        
        // Increment deals for license tracking
        this.bridgeApp.licenseManager.incrementDealsPlayed();
        
        console.log(`📊 Rubber Bridge Score: ${totalScore} (${belowLineScore} below, ${aboveLineScore} above)`);
    }
    
    /**
     * Process game won - key rubber bridge logic
     */
    processGameWon(winningSide) {
        console.log(`🎯 Game won by ${winningSide}!`);
        
        // Increment games won
        this.rubberState.gamesWon[winningSide]++;
        
        // Reset part scores - new game starts
        this.rubberState.partScores = { NS: 0, EW: 0 };
        
        // Winner becomes vulnerable
        this.rubberState.vulnerability[winningSide] = true;
        
        // Check for rubber completion (first to 2 games)
        if (this.rubberState.gamesWon[winningSide] === 2) {
            this.processRubberWon(winningSide);
        }
        
        console.log(`🏆 Game score now: ${this.rubberState.gamesWon.NS}-${this.rubberState.gamesWon.EW}`);
    }
    
    /**
     * Process rubber completion
     */
    processRubberWon(winningSide) {
        console.log(`🏆 RUBBER WON BY ${winningSide}!`);
        
        this.rubberState.rubberComplete = true;
        this.rubberState.rubberWinner = winningSide;
        
        // Calculate rubber bonus
        const losingGames = this.rubberState.gamesWon[winningSide === 'NS' ? 'EW' : 'NS'];
        const rubberBonus = losingGames === 0 ? 700 : 500; // 2-0 = 700, 2-1 = 500
        
        // Award rubber bonus (goes above the line)
        this.rubberState.aboveLineScores[winningSide] += rubberBonus;
        this.updateGameStateScores();
        
        // Record rubber bonus in history
        this.gameState.addDeal({
            deal: this.currentDeal,
            contract: { level: 0, suit: 'RUBBER', declarer: winningSide, doubled: '', result: `+${rubberBonus}` },
            score: rubberBonus,
            actualScore: rubberBonus,
            scoringSide: winningSide,
            mode: 'rubber',
            rubberBonus: true,
            rubberScoring: {
                belowLine: 0,
                aboveLine: rubberBonus,
                gameWon: false,
                rubberComplete: true,
                rubberWinner: winningSide
            }
        });
        
        console.log(`🎊 Rubber bonus: ${rubberBonus} points to ${winningSide} (${losingGames === 0 ? '2-0' : '2-1'} rubber)`);
    }
    
    /**
     * Get detailed scoring breakdown for display
     */
    getScoringBreakdown() {
        const ns = this.rubberState;
        const partNS = ns.partScores.NS;
        const partEW = ns.partScores.EW;
        const aboveNS = ns.aboveLineScores.NS;
        const aboveEW = ns.aboveLineScores.EW;
        const totalNS = partNS + aboveNS;
        const totalEW = partEW + aboveEW;
        
        return {
            partScores: { NS: partNS, EW: partEW },
            aboveScores: { NS: aboveNS, EW: aboveEW },
            totals: { NS: totalNS, EW: totalEW },
            vulnerability: { ...ns.vulnerability },
            gamesWon: { ...ns.gamesWon }
        };
    }
    
    /**
     * Check if current contract would make game
     */
    wouldMakeGame() {
        if (!this.currentContract.level || !this.currentContract.suit) return false;
        
        const { level, suit, doubled } = this.currentContract;
        const suitValues = { '♣': 20, '♦': 20, '♥': 30, '♠': 30, 'NT': 30 };
        
        let basicScore = level * suitValues[suit];
        if (suit === 'NT') basicScore += 10;
        
        if (doubled === 'X') basicScore *= 2;
        else if (doubled === 'XX') basicScore *= 4;
        
        return basicScore >= 100;
    }
// END SECTION FOUR
// SECTION FIVE - Game Management
    /**
     * Move to next deal
     */
    nextDeal() {
        console.log('🃏 Moving to next deal in rubber');
        
        this.currentDeal++;
        this.resetContract();
        this.inputState = 'level_selection';
        this.rubberState.honorBonusPending = false;
        this.updateDisplay();
        
        console.log(`🎯 Advanced to Deal ${this.currentDeal} - Games: ${this.rubberState.gamesWon.NS}-${this.rubberState.gamesWon.EW}`);
    }
    
    /**
     * Reset contract to initial state
     */
    resetContract() {
        this.currentContract = {
            level: null,
            suit: null,
            declarer: null,
            doubled: '',
            result: null
        };
        this.resultMode = null;
    }
    
    /**
     * Handle back navigation
     */
    handleBack() {
        // Can't go back if rubber is complete
        if (this.rubberState.rubberComplete) {
            return false;
        }
        
        // Handle honor bonus pending state
        if (this.rubberState.honorBonusPending) {
            this.rubberState.honorBonusPending = false;
            this.updateDisplay();
            return true;
        }
        
        switch (this.inputState) {
            case 'suit_selection':
                this.inputState = 'level_selection';
                this.currentContract.level = null;
                break;
            case 'declarer_selection':
                this.inputState = 'suit_selection';
                this.currentContract.suit = null;
                this.currentContract.doubled = '';
                break;
            case 'result_type_selection':
                this.inputState = 'declarer_selection';
                this.currentContract.declarer = null;
                break;
            case 'result_number_selection':
                this.inputState = 'result_type_selection';
                this.resultMode = null;
                break;
            case 'scoring':
                // Allow going back to result entry (undo scoring)
                this.undoLastScore();
                this.inputState = 'result_type_selection';
                this.currentContract.result = null;
                break;
            default:
                return false; // Let app handle return to mode selection
        }
        
        this.updateDisplay();
        return true;
    }
    
    /**
     * Undo the last score entry - complex for rubber bridge
     */
    undoLastScore() {
        const lastEntry = this.gameState.getLastDeal();
        if (lastEntry && lastEntry.deal === this.currentDeal) {
            console.log('↩️ Undoing last Rubber Bridge score entry');
            
            // Get the rubber scoring details
            const rubberScoring = lastEntry.rubberScoring;
            if (rubberScoring) {
                const scoringSide = lastEntry.scoringSide;
                
                // Undo below-line score
                if (rubberScoring.belowLine > 0) {
                    this.rubberState.belowLineScores[scoringSide] -= rubberScoring.belowLine;
                    this.rubberState.partScores[scoringSide] -= rubberScoring.belowLine;
                }
                
                // Undo above-line score
                if (rubberScoring.aboveLine > 0) {
                    this.rubberState.aboveLineScores[scoringSide] -= rubberScoring.aboveLine;
                }
                
                // Undo game win if it happened
                if (rubberScoring.gameWon) {
                    this.rubberState.gamesWon[scoringSide]--;
                    this.rubberState.vulnerability[scoringSide] = false;
                    
                    // Restore part scores from before the game was won
                    // This is complex - for now, just reset to 0
                    this.rubberState.partScores = { NS: 0, EW: 0 };
                }
                
                // Undo rubber completion if it happened
                if (rubberScoring.rubberComplete) {
                    this.rubberState.rubberComplete = false;
                    this.rubberState.rubberWinner = null;
                }
            }
            
            // Update game state scores
            this.updateGameStateScores();
            
            // Remove from history
            this.gameState.history.pop();
            
            console.log(`↩️ Undid rubber score - Games now: ${this.rubberState.gamesWon.NS}-${this.rubberState.gamesWon.EW}`);
        }
    }
    
    /**
     * Get active buttons for current state - FIXED FOR HONOR BUTTON
     */
    getActiveButtons() {
        // Rubber complete - only allow new rubber
        if (this.rubberState.rubberComplete) {
            return ['DEAL'];
        }
        
        // Honor bonus input
        if (this.rubberState.honorBonusPending) {
            const honorButtons = ['BACK'];
            if (this.currentContract.suit !== 'NT') {
                honorButtons.push('PLUS', 'DOWN'); // 4 honors (100) or 5 honors (150)
            } else {
                honorButtons.push('PLUS'); // 4 aces only (150)
            }
            return honorButtons;
        }
        
        switch (this.inputState) {
            case 'level_selection':
                return ['1', '2', '3', '4', '5', '6', '7'];
                
            case 'suit_selection':
                return ['♣', '♦', '♥', '♠', 'NT'];
                
            case 'declarer_selection':
                const declarerButtons = ['N', 'S', 'E', 'W', 'X'];
                if (this.currentContract.declarer) {
                    declarerButtons.push('MADE', 'PLUS', 'DOWN');
                }
                return declarerButtons;
                
            case 'result_type_selection':
                return ['MADE', 'PLUS', 'DOWN'];
                
            case 'result_number_selection':
                if (this.resultMode === 'down') {
                    return ['1', '2', '3', '4', '5', '6', '7'];
                } else if (this.resultMode === 'plus') {
                    const maxOvertricks = Math.min(6, 13 - (6 + this.currentContract.level));
                    const overtrickButtons = [];
                    for (let i = 1; i <= maxOvertricks; i++) {
                        overtrickButtons.push(i.toString());
                    }
                    return overtrickButtons;
                }
                break;
                
            case 'scoring':
                const scoringButtons = ['DEAL'];
                // FIXED: Use X button for honors instead of 'HONORS'
                if (!this.rubberState.rubberComplete && !this.rubberState.honorBonusPending) {
                    scoringButtons.push('X');
                }
                return scoringButtons;
                
            default:
                return [];
        }
    }
    
    /**
     * Update the display using new system
     */
    updateDisplay() {
        const display = document.getElementById('display');
        if (display) {
            display.innerHTML = this.getDisplayContent();
        }
        
        // Update vulnerability display in the UI control
        this.updateVulnerabilityDisplay();
        
        // Update button states
        const activeButtons = this.getActiveButtons();
        activeButtons.push('BACK'); // Always allow going back (when possible)
        
        this.bridgeApp.updateButtonStates(activeButtons);
    }
    
    /**
     * Check if back navigation is possible
     */
    canGoBack() {
        return !this.rubberState.rubberComplete;
    }
    
    /**
     * Get rubber status summary
     */
    getRubberStatus() {
        return {
            gamesWon: { ...this.rubberState.gamesWon },
            vulnerability: { ...this.rubberState.vulnerability },
            partScores: { ...this.rubberState.partScores },
            rubberComplete: this.rubberState.rubberComplete,
            rubberWinner: this.rubberState.rubberWinner,
            dealsPlayed: this.gameState.history.filter(deal => deal.mode === 'rubber').length
        };
    }
    
    /**
     * Check if we're at a natural break point
     */
    isAtBreakPoint() {
        // Rubber completion is always a break point
        if (this.rubberState.rubberComplete) {
            return { isBreak: true, reason: 'Rubber Complete', severity: 'major' };
        }
        
        // Game completion is a minor break point
        const totalGames = this.rubberState.gamesWon.NS + this.rubberState.gamesWon.EW;
        if (totalGames > 0) {
            return { isBreak: true, reason: 'Game Complete', severity: 'minor' };
        }
        
        return { isBreak: false, reason: null, severity: null };
    }
    
    /**
     * Validate rubber state consistency
     */
    validateRubberState() {
        const issues = [];
        
        // Check games won doesn't exceed 2
        if (this.rubberState.gamesWon.NS > 2 || this.rubberState.gamesWon.EW > 2) {
            issues.push('Games won exceeds maximum of 2');
        }
        
        // Check rubber completion logic
        const totalGames = Math.max(this.rubberState.gamesWon.NS, this.rubberState.gamesWon.EW);
        if (totalGames >= 2 && !this.rubberState.rubberComplete) {
            issues.push('Rubber should be complete but is not marked as such');
        }
        
        // Check vulnerability logic
        if (this.rubberState.gamesWon.NS === 0 && this.rubberState.vulnerability.NS) {
            issues.push('NS is vulnerable but has won no games');
        }
        if (this.rubberState.gamesWon.EW === 0 && this.rubberState.vulnerability.EW) {
            issues.push('EW is vulnerable but has won no games');
        }
        
        // Check part scores
        if (this.rubberState.partScores.NS >= 100 || this.rubberState.partScores.EW >= 100) {
            issues.push('Part scores >= 100 should have triggered game completion');
        }
        
        if (issues.length > 0) {
            console.warn('🚨 Rubber Bridge state validation issues:', issues);
            return { valid: false, issues };
        }
        
        console.log('✅ Rubber Bridge state validation passed');
        return { valid: true, issues: [] };
    }
// END SECTION FIVE
// SECTION SIX - Part 1: Mobile Help System (UPDATED WITH PIXEL 9A OPTIMIZATION)
    /**
     * Show Rubber Bridge specific help - MOBILE OPTIMIZED WITH PROVEN TEMPLATE
     */
    showHelp() {
        console.log('📖 Showing Rubber Bridge help with proven mobile template');
        
        // Use the proven mobile modal template
        this.showMobileOptimizedHelpModal();
    }
    
    /**
     * Show mobile-optimized help modal using proven template
     */
    showMobileOptimizedHelpModal() {
        // Prevent body scroll when modal opens
        document.body.classList.add('modal-open');
        
        // Create modal overlay using PROVEN template from bonus.js
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.7);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
            padding: 10px;
        `;
        
        modal.innerHTML = `
            <div class="modal-content" style="
                background: white;
                border-radius: 12px;
                width: 100%;
                max-width: 450px;
                max-height: 85vh;
                display: flex;
                flex-direction: column;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
                overflow: hidden;
                position: relative;
            ">
                <div class="modal-header" style="
                    padding: 20px;
                    background: #e67e22;
                    color: white;
                    text-align: center;
                    flex-shrink: 0;
                ">
                    <h2 style="font-size: 18px; margin: 0;">🎩 Rubber Bridge Help</h2>
                </div>
                
                <!-- CRITICAL: The scrollable content area using PROVEN technique -->
                <div class="modal-body" id="rubberHelpBody" style="
                    flex: 1;
                    overflow-y: auto;
                    overflow-x: hidden;
                    -webkit-overflow-scrolling: touch;
                    background: white;
                    position: relative;
                    min-height: 0;
                ">
                    <style>
                        /* Enhanced scrollbar for mobile visibility - PROVEN */
                        #rubberHelpBody::-webkit-scrollbar {
                            width: 12px;
                            background: rgba(0, 0, 0, 0.1);
                        }
                        #rubberHelpBody::-webkit-scrollbar-thumb {
                            background: rgba(230, 126, 34, 0.6);
                            border-radius: 6px;
                            border: 2px solid rgba(255, 255, 255, 0.1);
                        }
                        #rubberHelpBody::-webkit-scrollbar-track {
                            background: rgba(0, 0, 0, 0.05);
                        }
                        .content-section {
                            padding: 20px;
                            border-bottom: 1px solid #eee;
                        }
                        .content-section:last-child {
                            border-bottom: none;
                            padding-bottom: 30px;
                        }
                        .content-section h3 {
                            color: #e67e22;
                            margin-bottom: 10px;
                            font-size: 16px;
                        }
                        .content-section p {
                            line-height: 1.5;
                            margin-bottom: 10px;
                            color: #555;
                            font-size: 14px;
                        }
                        .feature-grid {
                            display: grid;
                            grid-template-columns: 1fr 1fr;
                            gap: 12px;
                            margin: 15px 0;
                        }
                        .feature-item {
                            background: #f8f9fa;
                            padding: 12px;
                            border-radius: 8px;
                            border-left: 4px solid #e67e22;
                        }
                        .feature-item h4 {
                            color: #2c3e50;
                            font-size: 14px;
                            margin-bottom: 6px;
                        }
                        .feature-item p {
                            font-size: 12px;
                            color: #666;
                            margin: 0;
                        }
                        .highlight-box {
                            background: #fff8e1;
                            padding: 12px;
                            border-radius: 8px;
                            border-left: 4px solid #f39c12;
                            margin: 15px 0;
                        }
                        .highlight-box h4 {
                            margin: 0 0 8px 0;
                            color: #e67e22;
                            font-size: 14px;
                        }
                        .highlight-box p {
                            margin: 0;
                            font-size: 13px;
                            color: #e67e22;
                        }
                        .steps-grid {
                            display: grid; 
                            grid-template-columns: 1fr 1fr; 
                            gap: 8px; 
                            margin: 16px 0; 
                            background: #f5f5f5; 
                            padding: 12px; 
                            border-radius: 8px;
                        }
                        .step-item {
                            text-align: center; 
                            padding: 10px; 
                            background: white; 
                            border-radius: 6px;
                        }
                        .step-item.step-1 {
                            border-left: 3px solid #3498db;
                        }
                        .step-item.step-2 {
                            border-left: 3px solid #e67e22;
                        }
                        .example-box {
                            background: #f8f9fa;
                            padding: 14px;
                            border-radius: 8px;
                            margin: 12px 0;
                            border-left: 4px solid #3498db;
                        }
                        .example-box h5 {
                            margin: 0 0 8px 0;
                            color: #2c3e50;
                            font-size: 13px;
                        }
                        .example-box .example-content {
                            background: rgba(255,255,255,0.8);
                            padding: 8px;
                            border-radius: 4px;
                            font-size: 12px;
                            color: #333;
                            margin: 4px 0;
                        }
                        .benefits-box {
                            background: #e8f5e8;
                            padding: 12px;
                            border-radius: 8px;
                            border-left: 4px solid #27ae60;
                            margin: 15px 0;
                        }
                        .benefits-box h4 {
                            margin: 0 0 8px 0;
                            color: #155724;
                            font-size: 14px;
                        }
                        .benefits-box ul {
                            margin: 0;
                            padding-left: 18px;
                            font-size: 13px;
                            color: #155724;
                            line-height: 1.3;
                        }
                        .scroll-indicator {
                            position: absolute;
                            top: 50%;
                            right: 5px;
                            transform: translateY(-50%);
                            background: rgba(230, 126, 34, 0.8);
                            color: white;
                            padding: 4px 8px;
                            border-radius: 4px;
                            font-size: 10px;
                            z-index: 10;
                            pointer-events: none;
                            opacity: 0;
                            transition: opacity 0.3s ease;
                        }
                        .scroll-indicator.visible {
                            opacity: 1;
                        }
                    </style>
                    
                    <div class="scroll-indicator" id="rubberScrollIndicator">👆 Scroll to see more</div>
                    
                    ${this.getRubberHelpContent()}
                </div>
                
                <div class="modal-footer" style="
                    padding: 15px 20px;
                    background: #f8f9fa;
                    border-top: 1px solid #ddd;
                    flex-shrink: 0;
                    display: flex;
                    gap: 10px;
                    justify-content: center;
                ">
                    <button class="help-close-btn" style="
                        padding: 10px 20px;
                        border: none;
                        border-radius: 6px;
                        font-size: 14px;
                        font-weight: 600;
                        cursor: pointer;
                        background: #e67e22;
                        color: white;
                        touch-action: manipulation;
                        user-select: none;
                        -webkit-tap-highlight-color: transparent;
                    ">Close Help</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Setup button handlers and scroll indicators
        setTimeout(() => {
            this.setupHelpModalHandlers();
        }, 100);
    }
    
    /**
     * Setup help modal handlers with proven mobile techniques
     */
    setupHelpModalHandlers() {
        const modal = document.querySelector('.modal-overlay');
        const modalBody = document.getElementById('rubberHelpBody');
        const indicator = document.getElementById('rubberScrollIndicator');
        const closeBtn = modal.querySelector('.help-close-btn');
        
        // Close button handler with PIXEL 9A optimization
        const createCloseHandler = () => {
            return (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                console.log('🔥 Pixel 9a help close action');
                
                // Visual feedback
                const btn = e.target;
                btn.style.transform = 'scale(0.95)';
                btn.style.opacity = '0.8';
                
                // Haptic feedback
                if (navigator.vibrate) {
                    navigator.vibrate([30]);
                }
                
                // Execute action after feedback
                setTimeout(() => {
                    this.closeHelpModal();
                    
                    // Reset visual feedback
                    btn.style.transform = 'scale(1)';
                    btn.style.opacity = '1';
                }, 100);
            };
        };
        
        const closeHandler = createCloseHandler();
        
        // Multiple event types for maximum Pixel 9a compatibility
        closeBtn.addEventListener('click', closeHandler, { passive: false });
        closeBtn.addEventListener('touchend', closeHandler, { passive: false });
        
        // Touch feedback for close button
        closeBtn.addEventListener('touchstart', (e) => {
            closeBtn.style.background = 'rgba(230, 126, 34, 0.8)';
            closeBtn.style.transform = 'scale(0.95)';
        }, { passive: true });
        
        closeBtn.addEventListener('touchend', (e) => {
            closeBtn.style.background = '#e67e22';
            closeBtn.style.transform = 'scale(1)';
        }, { passive: true });
        
        // Scroll indicator logic (proven from bonus.js)
        modalBody.addEventListener('scroll', () => {
            if (modalBody.scrollHeight > modalBody.clientHeight && modalBody.scrollTop < 50) {
                indicator.classList.add('visible');
                setTimeout(() => indicator.classList.remove('visible'), 2000);
            }
        });
        
        // Show indicator on load if content is scrollable
        setTimeout(() => {
            if (modalBody.scrollHeight > modalBody.clientHeight) {
                indicator.classList.add('visible');
                setTimeout(() => indicator.classList.remove('visible'), 3000);
                console.log('📱 Help content is scrollable - indicator shown');
            } else {
                console.log('📱 Help content fits in viewport - no scroll needed');
            }
        }, 500);
        
        console.log('✅ Help modal handlers setup complete');
    }
    
    /**
     * Close help modal
     */
    closeHelpModal() {
        const modal = document.querySelector('.modal-overlay');
        if (modal) {
            modal.remove();
            document.body.classList.remove('modal-open');
            console.log('📖 Help modal closed');
        }
    }
    
    /**
     * Get Rubber Bridge help content - MOBILE FORMATTED
     */
    getRubberHelpContent() {
        return `
            <div class="content-section">
                <h3>What is Rubber Bridge?</h3>
                <p><strong>Rubber Bridge</strong> is the classic form of bridge featuring the famous "above and below the line" scoring system. It's the original way bridge was played before duplicate and other variants were invented.</p>
                
                <div class="highlight-box">
                    <h4>Perfect For</h4>
                    <p>Classic play • Traditional scoring • Social bridge • Learning fundamentals</p>
                </div>
            </div>
            
            <div class="content-section">
                <h3>Above/Below the Line Scoring</h3>
                
                <div class="feature-grid">
                    <div class="feature-item">
                        <h4>📊 Below the Line</h4>
                        <p>Only basic contract points count here. Need 100+ points to make game.</p>
                    </div>
                    
                    <div class="feature-item">
                        <h4>🎯 Above the Line</h4>
                        <p>Game bonuses, slam bonuses, honors, penalties. Add to total but don't make game.</p>
                    </div>
                </div>
                
                <div class="example-box">
                    <h5>Contract Points (Below Line):</h5>
                    <div class="example-content">
                        <strong>♣/♦:</strong> 20 points per trick<br>
                        <strong>♥/♠:</strong> 30 points per trick<br>
                        <strong>NT:</strong> 30 points per trick + 10 bonus
                    </div>
                </div>
                
                <div class="example-box">
                    <h5>Bonus Points (Above Line):</h5>
                    <div class="example-content">
                        Game bonuses • Slam bonuses • Doubled bonuses<br>
                        Honor cards • Penalties • Overtricks
                    </div>
                </div>
            </div>
            
            <div class="content-section">
                <h3>Game & Rubber Rules</h3>
                
                <div class="steps-grid">
                    <div class="step-item step-1">
                        <div style="font-weight: bold; font-size: 14px; color: #3498db;">Making Game</div>
                        <div style="font-size: 12px; color: #666;">100+ below-line</div>
                        <div style="font-size: 12px; color: #666;">points accumulated</div>
                    </div>
                    <div class="step-item step-2">
                        <div style="font-weight: bold; color: #e67e22; font-size: 14px;">After Game</div>
                        <div style="font-size: 12px; color: #666;">Part-scores reset</div>
                        <div style="font-size: 12px; color: #666;">Winner vulnerable</div>
                    </div>
                </div>
                
                <ul style="margin: 0 0 16px 0; padding-left: 20px; font-size: 13px; line-height: 1.4;">
                    <li><strong>Game Examples:</strong> 3NT (100), 4♥/♠ (120), 5♣/♦ (100)</li>
                    <li><strong>Part-Score Building:</strong> 2♣ (40) + 3♦ (60) = Game!</li>
                    <li><strong>Rubber:</strong> First side to win 2 games wins rubber</li>
                    <li><strong>Rubber Bonus:</strong> 700 points (2-0) or 500 points (2-1)</li>
                </ul>
            </div>
            
            <div class="content-section">
                <h3>Honor Bonuses (Detailed)</h3>
                <p><strong>What are honors?</strong> The top 5 cards of trump suit: A, K, Q, J, 10</p>
                
                <div class="example-box">
                    <h5>Honor Scoring:</h5>
                    <div class="example-content">
                        <strong>4 Honors in trump:</strong> 100 points (any 4 of A-K-Q-J-10)<br>
                        <strong>5 Honors in trump:</strong> 150 points (all A-K-Q-J-10)<br>
                        <strong>4 Aces in NT:</strong> 150 points (all four aces)
                    </div>
                </div>
                
                <div class="benefits-box">
                    <h4>Honor Rules</h4>
                    <ul>
                        <li>Go to whichever side holds the honors</li>
                        <li>Awarded regardless of contract success</li>
                        <li>Count above the line (bonus points)</li>
                        <li>Click X button after deals to claim</li>
                    </ul>
                </div>
            </div>
            
            <div class="content-section">
                <h3>Scoring Examples</h3>
                
                <div class="example-box">
                    <h5>Example 1 - Making Game:</h5>
                    <div class="example-content">
                        4♥ by N = Made exactly (not vulnerable)<br>
                        • Below line: 4 × 30 = <strong>120 points</strong> → GAME!<br>
                        • Above line: 300 (game bonus)<br>
                        • Total: 420 points to NS<br>
                        • Result: NS wins first game, becomes vulnerable
                    </div>
                </div>
                
                <div class="example-box">
                    <h5>Example 2 - Part-Score Building:</h5>
                    <div class="example-content">
                        Deal 1: 2♣ by S = Made exactly<br>
                        • Below line: 40 points (toward game)<br>
                        • Above line: 50 (part-game bonus)<br>
                        <br>
                        Deal 2: 2♠ by N = Made exactly<br>
                        • Below line: 60 points (40 + 60 = 100) → GAME!<br>
                        • Above line: 300 (game bonus)<br>
                        • Result: NS wins game from accumulated part-scores
                    </div>
                </div>
                
                <div class="example-box">
                    <h5>Example 3 - With Honors:</h5>
                    <div class="example-content">
                        3NT by E = Made +1 + 4 Aces<br>
                        • Below line: 100 points → GAME!<br>
                        • Above line: 300 (game) + 30 (overtrick) + 150 (4 aces)<br>
                        • Total: 580 points to EW<br>
                        • Result: EW wins game, becomes vulnerable
                    </div>
                </div>
            </div>
            
            <div class="content-section">
                <h3>Vulnerability System</h3>
                
                <div class="feature-grid">
                    <div class="feature-item">
                        <h4>🟢 Fresh</h4>
                        <p>Haven't won a game yet. Lower bonuses and penalties.</p>
                    </div>
                    
                    <div class="feature-item">
                        <h4>🔴 Vulnerable</h4>
                        <p>Won at least one game. Higher bonuses and penalties.</p>
                    </div>
                </div>
                
                <div class="example-box">
                    <h5>Vulnerability Effects:</h5>
                    <div class="example-content">
                        <strong>Game Bonuses:</strong> +500 (vulnerable) vs +300 (fresh)<br>
                        <strong>Slam Bonuses:</strong> Also increased when vulnerable<br>
                        <strong>Penalties:</strong> Higher when vulnerable
                    </div>
                </div>
            </div>
            
            <div class="content-section">
                <h3>How to Play</h3>
                <ol style="margin: 0 0 16px 0; padding-left: 20px; font-size: 13px; line-height: 1.4;">
                    <li><strong>Enter Contract:</strong> Level → Suit → Declarer</li>
                    <li><strong>Doubling:</strong> Use X button for doubles/redoubles</li>
                    <li><strong>Enter Result:</strong> Made/Plus/Down</li>
                    <li><strong>Claim Honors:</strong> Click X button if you held 4+ honors</li>
                    <li><strong>Continue:</strong> Deal continues until rubber is complete</li>
                    <li><strong>New Rubber:</strong> Start fresh when rubber ends</li>
                </ol>
            </div>
            
            <div class="content-section">
                <h3>Display Guide</h3>
                <ul style="margin: 0 0 16px 0; padding-left: 20px; font-size: 13px; line-height: 1.4;">
                    <li><strong>Games Won:</strong> Shown as "Games: 1-0" in top right</li>
                    <li><strong>Game Points:</strong> Red numbers (below-line, count toward game)</li>
                    <li><strong>Bonus Points:</strong> Blue numbers (above-line, bonuses only)</li>
                    <li><strong>Total:</strong> Green numbers (final score)</li>
                    <li><strong>Vulnerability:</strong> 🔴/🟢 indicators show vulnerability status</li>
                </ul>
            </div>
            
            <div class="content-section">
                <h3>Rubber Completion</h3>
                <p>When a side wins 2 games:</p>
                <ul style="margin: 0 0 16px 0; padding-left: 20px; font-size: 13px; line-height: 1.4;">
                    <li><strong>2-0 Rubber:</strong> +700 bonus to winner</li>
                    <li><strong>2-1 Rubber:</strong> +500 bonus to winner</li>
                    <li><strong>Final Score:</strong> Sum of all above and below line points</li>
                    <li><strong>New Rubber:</strong> Everything resets for fresh start</li>
                </ul>
            </div>
            
            <div class="content-section">
                <h3>Strategy Tips</h3>
                <ul style="margin: 0 0 16px 0; padding-left: 20px; font-size: 13px; line-height: 1.4;">
                    <li><strong>Part-Score Pressure:</strong> When opponents have part-score, bid aggressively</li>
                    <li><strong>Vulnerability Awareness:</strong> Take more risks when not vulnerable</li>
                    <li><strong>Game Timing:</strong> Sometimes better to make 3NT than build part-scores</li>
                    <li><strong>Honor Cards:</strong> Don't forget to claim honor bonuses!</li>
                </ul>
                
                <div style="height: 50px; background: linear-gradient(45deg, #e67e22, #f39c12); border-radius: 8px; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; margin-top: 15px;">
                    🎩 Master the Classic Game!
                </div>
            </div>
        `;
    }
// END SECTION SIX - Part 1

// SECTION SIX - Part 2: Mobile Quit System & Score Sheet (PIXEL 9A OPTIMIZED)
    /**
     * Show Rubber Bridge specific quit options - PIXEL 9A OPTIMIZED
     */
    showQuit() {
        console.log('🎮 Showing PIXEL 9A optimized quit options for Rubber Bridge');
        
        const scores = this.gameState.scores;
        const totalDeals = this.gameState.history.filter(deal => deal.mode === 'rubber' && !deal.honorBonus && !deal.rubberBonus).length;
        const licenseStatus = this.bridgeApp.licenseManager.checkLicenseStatus();
        const rubberStatus = this.getRubberStatus();
        const breakdown = this.getScoringBreakdown();
        
        // Build the content sections
        let currentScoreContent = '';
        if (totalDeals > 0) {
            const leader = scores.NS > scores.EW ? 'North-South' : 
                          scores.EW > scores.NS ? 'East-West' : 'Tied';
            
            currentScoreContent = `
                <div style="padding: 15px; border-bottom: 1px solid #eee;">
                    <h3 style="color: #e67e22; margin-bottom: 10px;">📊 Current Rubber Status</h3>
                    <p><strong>Games Won:</strong> NS ${rubberStatus.gamesWon.NS} - EW ${rubberStatus.gamesWon.EW}</p>
                    <p><strong>Vulnerability:</strong> ${rubberStatus.vulnerability.NS ? 'NS 🔴' : 'NS 🟢'} | ${rubberStatus.vulnerability.EW ? 'EW 🔴' : 'EW 🟢'}</p>
                    <p><strong>Deals Played:</strong> ${totalDeals}</p>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 10px;">
                        <div style="text-align: center; padding: 10px; background: #27ae60; color: white; border-radius: 6px;">
                            <div style="font-size: 12px;">North-South</div>
                            <div style="font-size: 20px; font-weight: bold;">${scores.NS}</div>
                        </div>
                        <div style="text-align: center; padding: 10px; background: #e74c3c; color: white; border-radius: 6px;">
                            <div style="font-size: 12px;">East-West</div>
                            <div style="font-size: 20px; font-weight: bold;">${scores.EW}</div>
                        </div>
                    </div>
                    ${rubberStatus.rubberComplete ? 
                        `<p style="color: #f39c12; margin-top: 10px;"><strong>🏆 Rubber Complete!</strong> Winner: ${rubberStatus.rubberWinner}</p>` : 
                        `<p style="margin-top: 10px;"><strong>Current Leader:</strong> ${leader}</p>`
                    }
                </div>
            `;
        }
        
        let licenseSection = '';
        if (licenseStatus.status === 'trial') {
            licenseSection = `
                <div style="padding: 15px; border-bottom: 1px solid #eee;">
                    <h3 style="color: #e67e22; margin-bottom: 10px;">📅 License Status</h3>
                    <p><strong>Trial Version:</strong> ${licenseStatus.daysLeft} days remaining</p>
                    <p><strong>Deals Left:</strong> ${licenseStatus.dealsLeft} deals</p>
                </div>
            `;
        }
        
        // Prevent body scroll when modal opens
        document.body.classList.add('modal-open');
        
        // Create modal overlay using PIXEL 9A OPTIMIZED template
        const modal = document.createElement('div');
        modal.className = 'modal-overlay quit-modal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.7);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
            padding: 10px;
            touch-action: manipulation;
        `;
        
        modal.innerHTML = `
            <div class="modal-content" style="
                background: white;
                border-radius: 12px;
                width: 100%;
                max-width: 450px;
                max-height: 85vh;
                display: flex;
                flex-direction: column;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
                overflow: hidden;
                position: relative;
            ">
                <div class="modal-header" style="
                    padding: 20px;
                    background: #e67e22;
                    color: white;
                    text-align: center;
                    flex-shrink: 0;
                ">
                    <h2 style="font-size: 18px; margin: 0;">🎩 Rubber Bridge Options</h2>
                </div>
                
                <div class="modal-body" style="
                    flex: 1;
                    overflow-y: auto;
                    overflow-x: hidden;
                    -webkit-overflow-scrolling: touch;
                    background: white;
                    position: relative;
                    min-height: 0;
                ">
                    ${currentScoreContent}
                    ${licenseSection}
                    <div style="padding: 15px;">
                        <h3 style="color: #e67e22; margin-bottom: 10px;">🎮 Game Options</h3>
                        <p>What would you like to do?</p>
                    </div>
                </div>
                
                <!-- PIXEL 9A OPTIMIZED BUTTON LAYOUT -->
                <div style="
                    padding: 20px;
                    background: #f8f9fa;
                    border-top: 1px solid #ddd;
                    flex-shrink: 0;
                ">
                    <div style="display: grid; grid-template-rows: 1fr 1fr; gap: 12px; width: 100%;">
                        <!-- Top row: 3 buttons -->
                        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px;">
                            <button id="continue-btn" style="
                                padding: 12px 8px;
                                border: none;
                                border-radius: 8px;
                                font-size: 12px;
                                font-weight: 600;
                                cursor: pointer;
                                background: #27ae60;
                                color: white;
                                touch-action: manipulation;
                                user-select: none;
                                -webkit-tap-highlight-color: transparent;
                                min-height: 50px;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                            ">Continue Playing</button>
                            <button id="scores-btn" style="
                                padding: 12px 8px;
                                border: none;
                                border-radius: 8px;
                                font-size: 12px;
                                font-weight: 600;
                                cursor: pointer;
                                background: #3498db;
                                color: white;
                                touch-action: manipulation;
                                user-select: none;
                                -webkit-tap-highlight-color: transparent;
                                min-height: 50px;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                            ">Show Scores</button>
                            <button id="help-btn" style="
                                padding: 12px 8px;
                                border: none;
                                border-radius: 8px;
                                font-size: 12px;
                                font-weight: 600;
                                cursor: pointer;
                                background: #f39c12;
                                color: white;
                                touch-action: manipulation;
                                user-select: none;
                                -webkit-tap-highlight-color: transparent;
                                min-height: 50px;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                            ">Show Help</button>
                        </div>
                        <!-- Bottom row: 2 buttons -->
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                            <button id="newgame-btn" style="
                                padding: 12px 10px;
                                border: none;
                                border-radius: 8px;
                                font-size: 13px;
                                font-weight: 600;
                                cursor: pointer;
                                background: #9b59b6;
                                color: white;
                                touch-action: manipulation;
                                user-select: none;
                                -webkit-tap-highlight-color: transparent;
                                min-height: 50px;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                            ">New Rubber</button>
                            <button id="menu-btn" style="
                                padding: 12px 10px;
                                border: none;
                                border-radius: 8px;
                                font-size: 13px;
                                font-weight: 600;
                                cursor: pointer;
                                background: #95a5a6;
                                color: white;
                                touch-action: manipulation;
                                user-select: none;
                                -webkit-tap-highlight-color: transparent;
                                min-height: 50px;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                            ">Main Menu</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Setup PIXEL 9A OPTIMIZED button handlers
        setTimeout(() => {
            this.setupRubberQuitModalHandlers();
        }, 100);
    }
    
    /**
     * Setup quit modal handlers - PIXEL 9A OPTIMIZED FOR RUBBER BRIDGE
     */
    setupRubberQuitModalHandlers() {
        console.log('📱 Setting up PIXEL 9A optimized quit handlers for Rubber Bridge...');
        
        // Create unified quit handler for Pixel 9a
        const createQuitHandler = (action) => {
            return (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                console.log(`🔥 Pixel 9a quit action: ${action}`);
                
                // Visual feedback
                const btn = e.target;
                btn.style.transform = 'scale(0.95)';
                btn.style.opacity = '0.8';
                
                // Haptic feedback
                if (navigator.vibrate) {
                    navigator.vibrate([30]);
                }
                
                // Execute action after feedback
                setTimeout(() => {
                    switch(action) {
                        case 'continue':
                            this.closeQuitModal();
                            break;
                        case 'scores':
                            this.closeQuitModal();
                            this.showMobileOptimizedRubberScores();
                            break;
                        case 'help':
                            this.closeQuitModal();
                            this.showHelp();
                            break;
                        case 'newgame':
                            this.closeQuitModal();
                            this.confirmNewRubber();
                            break;
                        case 'menu':
                            this.closeQuitModal();
                            this.returnToMainMenu();
                            break;
                        default:
                            console.warn(`Unknown quit action: ${action}`);
                            this.closeQuitModal();
                    }
                    
                    // Reset visual feedback
                    btn.style.transform = 'scale(1)';
                    btn.style.opacity = '1';
                }, 100);
            };
        };
        
        const buttonMappings = [
            { id: 'continue-btn', action: 'continue' },
            { id: 'scores-btn', action: 'scores' },
            { id: 'help-btn', action: 'help' },
            { id: 'newgame-btn', action: 'newgame' },
            { id: 'menu-btn', action: 'menu' }
        ];
        
        buttonMappings.forEach(({ id, action }) => {
            const btn = document.getElementById(id);
            if (btn) {
                const handler = createQuitHandler(action);
                
                // Multiple event types for maximum Pixel 9a compatibility
                btn.addEventListener('click', handler, { passive: false });
                btn.addEventListener('touchend', handler, { passive: false });
                
                console.log(`✅ Pixel 9a quit handler bound for: ${id}`);
            } else {
                console.warn(`❌ Quit button not found: ${id}`);
            }
        });
        
        console.log('✅ All Pixel 9a quit handlers setup complete');
    }
    
    /**
     * Close quit modal
     */
    closeQuitModal() {
        const modal = document.querySelector('.modal-overlay');
        if (modal) {
            modal.remove();
            document.body.classList.remove('modal-open');
            console.log('🎮 Quit modal closed');
        }
    }
    
    /**
     * Show mobile-optimized Rubber Bridge scores - WITH PIXEL 9A SCROLLING FIX
     */
    showMobileOptimizedRubberScores() {
        console.log('📊 Showing mobile-optimized Rubber Bridge detailed scores');
        
        const scores = this.gameState.scores;
        const history = this.gameState.history.filter(deal => deal.mode === 'rubber');
        
        if (history.length === 0) {
            this.showSimpleModal('📊 Game Scores', '<p>No deals have been played yet.</p>');
            return;
        }

        const rubberStatus = this.getRubberStatus();
        const breakdown = this.getScoringBreakdown();

        let dealSummary = `
            <div class="scores-summary">
                <h4>📊 Rubber Bridge Score Sheet</h4>
                <div style="display: flex; justify-content: space-between; margin: 10px 0; font-size: 13px;">
                    <div><strong>Games Won:</strong> NS ${rubberStatus.gamesWon.NS} - EW ${rubberStatus.gamesWon.EW}</div>
                    <div><strong>Vulnerability:</strong> ${rubberStatus.vulnerability.NS ? 'NS 🔴' : 'NS 🟢'} | ${rubberStatus.vulnerability.EW ? 'EW 🔴' : 'EW 🟢'}</div>
                </div>
                
                <div style="background: rgba(255,255,255,0.95); padding: 12px; border-radius: 6px; margin: 8px 0; border: 2px solid #e67e22;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-weight: bold; color: #2c3e50;">
                        <span>North-South</span>
                        <span>East-West</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 4px; color: #e74c3c; font-weight: bold;">
                        <span>Game Points: ${breakdown.partScores.NS}</span>
                        <span>Game Points: ${breakdown.partScores.EW}</span>
                    </div>
                    <div style="font-size: 10px; color: #7f8c8d; margin-bottom: 6px; text-align: center;">
                        (Below-the-line • Need 100+ for game)
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 4px; color: #3498db; font-weight: bold;">
                        <span>Bonus Points: ${breakdown.aboveScores.NS}</span>
                        <span>Bonus Points: ${breakdown.aboveScores.EW}</span>
                    </div>
                    <div style="font-size: 10px; color: #7f8c8d; margin-bottom: 8px; text-align: center;">
                        (Above-the-line • Bonuses, penalties, honors)
                    </div>
                    <div style="display: flex; justify-content: space-between; border-top: 2px solid #34495e; padding-top: 6px; font-weight: bold; color: #27ae60; font-size: 16px;">
                        <span>Total: ${breakdown.totals.NS}</span>
                        <span>Total: ${breakdown.totals.EW}</span>
                    </div>
                </div>
            </div>
            
            <div class="deals-history">
                <h4>🎩 Deal by Deal History</h4>
                <div class="deal-scroll-container" style="
                    max-height: 280px; 
                    overflow-y: auto; 
                    overflow-x: hidden;
                    -webkit-overflow-scrolling: touch;
                    font-size: 12px;
                    border: 1px solid #444;
                    border-radius: 4px;
                    background: rgba(255,255,255,0.95);
                    margin: 10px 0;
                    position: relative;
                ">
        `;
        
        // Group deals and bonuses together
        let dealNumber = 1;
        history.forEach((deal, index) => {
            if (deal.honorBonus) {
                // Honor bonus entry
                dealSummary += `
                    <div style="
                        border-left: 4px solid #f39c12;
                        padding: 8px 12px;
                        background: rgba(243, 156, 18, 0.1);
                        margin: 2px 4px;
                        border-radius: 4px;
                    ">
                        <div style="font-weight: bold; color: #d68910; font-size: 11px;">
                            🏅 Honor Bonus: +${deal.score} to ${deal.scoringSide}
                        </div>
                        <div style="font-size: 10px; color: #85701f;">
                            ${deal.contract.suit === 'HONOR' ? 'Honor cards held' : 'Honor bonus awarded'}
                        </div>
                    </div>
                `;
            } else if (deal.rubberBonus) {
                // Rubber bonus entry
                const rubberScore = deal.rubberScoring?.rubberComplete ? '2-0' : '2-1';
                dealSummary += `
                    <div style="
                        border-left: 4px solid #e74c3c;
                        padding: 12px;
                        background: rgba(231, 76, 60, 0.1);
                        margin: 4px;
                        border-radius: 6px;
                        text-align: center;
                    ">
                        <div style="font-weight: bold; color: #c0392b; font-size: 14px;">
                            🏆 RUBBER COMPLETE!
                        </div>
                        <div style="font-size: 12px; color: #a93226; margin: 2px 0;">
                            ${deal.scoringSide} wins ${rubberScore} rubber
                        </div>
                        <div style="font-size: 11px; color: #943126;">
                            Rubber bonus: +${deal.score} points
                        </div>
                    </div>
                `;
            } else {
                // Regular deal
                const contract = deal.contract;
                const contractStr = `${contract.level}${contract.suit}${contract.doubled ? ' ' + contract.doubled : ''}`;
                const vulnerability = deal.vulnerability || 'None';
                const rubberScoring = deal.rubberScoring || {};
                
                // Vulnerability color
                const vulnColor = vulnerability === 'None' ? '#95a5a6' : 
                                 vulnerability === 'NS' ? '#27ae60' : 
                                 vulnerability === 'EW' ? '#e74c3c' : '#f39c12';
                
                const scoreDisplay = deal.score >= 0 ? `+${deal.score}` : `${deal.score}`;
                const scoringSide = deal.scoringSide;
                
                dealSummary += `
                    <div style="
                        border-bottom: 1px solid #ddd; 
                        padding: 12px 8px; 
                        background: ${index % 2 === 0 ? 'rgba(240,240,240,0.8)' : 'rgba(255,255,255,0.9)'};
                        margin: 2px 0;
                        border-radius: 4px;
                    ">
                        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                            <div style="flex: 1; min-width: 0;">
                                <div style="font-weight: bold; margin-bottom: 3px; color: #222; font-size: 12px;">
                                    Deal ${dealNumber} - <span style="color: ${vulnColor};">${vulnerability}</span>
                                </div>
                                <div style="font-size: 11px; color: #333; font-weight: 500; margin-bottom: 2px;">
                                    ${contractStr} by ${contract.declarer} = ${contract.result}
                                </div>
                                ${rubberScoring.belowLine || rubberScoring.aboveLine ? `
                                    <div style="font-size: 10px; color: #666;">
                                        Below: ${rubberScoring.belowLine || 0} | Above: ${rubberScoring.aboveLine || 0}
                                        ${rubberScoring.gameWon ? ' | 🎯 GAME!' : ''}
                                    </div>
                                ` : ''}
                            </div>
                            <div style="
                                text-align: right;
                                min-width: 70px;
                                font-size: 12px;
                                font-weight: bold;
                            ">
                                <div style="color: ${deal.score >= 0 ? '#27ae60' : '#e74c3c'};">
                                    ${scoreDisplay}
                                </div>
                                <div style="font-size: 10px; color: #666;">
                                    ${scoringSide}
                                </div>
                            </div>
                        </div>
                    </div>
                `;
                dealNumber++;
            }
        });
        
        dealSummary += `
                </div>
            </div>
            
            <div style="
                text-align: center; 
                font-size: 11px; 
                color: #666; 
                margin-top: 10px;
                display: block;
            ">
                🎩 Rubber Bridge: Classic above/below line scoring<br>
                On mobile: Use Refresh Scroll if needed
            </div>
        `;
        
        // Show with mobile-optimized template
        this.showMobileOptimizedScoresModal(dealSummary);
    }
    
    /**
     * Show mobile-optimized scores modal - PIXEL 9A FIXED
     */
    showMobileOptimizedScoresModal(content) {
        // Prevent body scroll when modal opens
        document.body.classList.add('modal-open');
        
        // Create modal overlay
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.7);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
            padding: 10px;
        `;
        
        modal.innerHTML = `
            <div class="modal-content" style="
                background: white;
                border-radius: 12px;
                width: 100%;
                max-width: 450px;
                max-height: 85vh;
                display: flex;
                flex-direction: column;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
                overflow: hidden;
                position: relative;
            ">
                <div class="modal-header" style="
                    padding: 20px;
                    background: #e67e22;
                    color: white;
                    text-align: center;
                    flex-shrink: 0;
                ">
                    <h2 style="font-size: 18px; margin: 0;">📊 Rubber Bridge - Score Sheet</h2>
                </div>
                
                <div class="modal-body" id="scoresModalBody" style="
                    flex: 1;
                    overflow-y: auto;
                    overflow-x: hidden;
                    -webkit-overflow-scrolling: touch;
                    background: white;
                    position: relative;
                    min-height: 0;
                ">
                    <style>
                        /* Enhanced scrollbar for mobile */
                        #scoresModalBody::-webkit-scrollbar {
                            width: 12px;
                            background: rgba(0, 0, 0, 0.1);
                        }
                        #scoresModalBody::-webkit-scrollbar-thumb {
                            background: rgba(230, 126, 34, 0.6);
                            border-radius: 6px;
                            border: 2px solid rgba(255, 255, 255, 0.1);
                        }
                        #scoresModalBody::-webkit-scrollbar-track {
                            background: rgba(0, 0, 0, 0.05);
                        }
                        .scores-summary h4 {
                            color: #e67e22;
                            margin-bottom: 15px;
                            font-size: 16px;
                            padding: 0 20px;
                            padding-top: 20px;
                        }
                        .scores-summary {
                            padding: 0 20px 20px 20px;
                            border-bottom: 1px solid #eee;
                        }
                        .deals-history {
                            padding: 20px;
                        }
                        .deals-history h4 {
                            color: #e67e22;
                            margin-bottom: 15px;
                            font-size: 16px;
                        }
                    </style>
                    
                    ${content}
                </div>
                
                <div class="modal-footer" style="
                    padding: 15px 20px;
                    background: #f8f9fa;
                    border-top: 1px solid #ddd;
                    flex-shrink: 0;
                    display: flex;
                    gap: 10px;
                    justify-content: center;
                ">
                    <button id="scores-close-btn" style="
                        padding: 12px 20px;
                        border: none;
                        border-radius: 8px;
                        font-size: 14px;
                        font-weight: 600;
                        cursor: pointer;
                        background: #e67e22;
                        color: white;
                        touch-action: manipulation;
                        user-select: none;
                        -webkit-tap-highlight-color: transparent;
                        min-height: 50px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    ">Close Scores</button>
                    <button id="refresh-scroll-btn" style="
                        padding: 12px 20px;
                        border: none;
                        border-radius: 8px;
                        font-size: 14px;
                        font-weight: 600;
                        cursor: pointer;
                        background: #3498db;
                        color: white;
                        touch-action: manipulation;
                        user-select: none;
                        -webkit-tap-highlight-color: transparent;
                        min-height: 50px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    ">Refresh Scroll</button>
                    <button id="scores-back-btn" style="
                        padding: 12px 20px;
                        border: none;
                        border-radius: 8px;
                        font-size: 14px;
                        font-weight: 600;
                        cursor: pointer;
                        background: #95a5a6;
                        color: white;
                        touch-action: manipulation;
                        user-select: none;
                        -webkit-tap-highlight-color: transparent;
                        min-height: 50px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    ">Back to Options</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Setup button handlers
        setTimeout(() => {
            this.setupScoresModalHandlers();
            this.applyPixelScrollingFixes();
        }, 100);
    }
    
    /**
     * Setup scores modal handlers - PIXEL 9A FIXED
     */
    setupScoresModalHandlers() {
        console.log('📱 Setting up PIXEL 9A optimized scores modal handlers...');
        
        // Create unified scores handler for Pixel 9a
        const createScoresHandler = (action) => {
            return (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                console.log(`🔥 Pixel 9a scores action: ${action}`);
                
                // Visual feedback
                const btn = e.target;
                btn.style.transform = 'scale(0.95)';
                btn.style.opacity = '0.8';
                
                // Haptic feedback
                if (navigator.vibrate) {
                    navigator.vibrate([30]);
                }
                
                // Execute action after feedback
                setTimeout(() => {
                    switch(action) {
                        case 'close':
                            this.closeScoresModal();
                            break;
                        case 'refresh':
                            this.refreshRubberScoreSheet();
                            break;
                        case 'back':
                            this.closeScoresModal();
                            setTimeout(() => this.showQuit(), 100);
                            break;
                        default:
                            console.warn(`Unknown scores action: ${action}`);
                            this.closeScoresModal();
                    }
                    
                    // Reset visual feedback
                    btn.style.transform = 'scale(1)';
                    btn.style.opacity = '1';
                }, 100);
            };
        };
        
        const buttonMappings = [
            { id: 'scores-close-btn', action: 'close' },
            { id: 'refresh-scroll-btn', action: 'refresh' },
            { id: 'scores-back-btn', action: 'back' }
        ];
        
        buttonMappings.forEach(({ id, action }) => {
            const btn = document.getElementById(id);
            if (btn) {
                const handler = createScoresHandler(action);
                
                // Multiple event types for maximum Pixel 9a compatibility
                btn.addEventListener('click', handler, { passive: false });
                btn.addEventListener('touchend', handler, { passive: false });
                
                console.log(`✅ Pixel 9a scores handler bound for: ${id}`);
            } else {
                console.warn(`❌ Scores button not found: ${id}`);
            }
        });
        
        console.log('✅ All Pixel 9a scores handlers setup complete');
    }
    
    /**
     * Refresh the score sheet to force scrolling activation - PIXEL 9A FIX
     */
    refreshRubberScoreSheet() {
        console.log('🔄 Refreshing Rubber Bridge score sheet for better scrolling...');
        
        // Simply re-show the detailed scores - this forces DOM refresh
        this.showMobileOptimizedRubberScores();
        
        // Add a brief visual indication that refresh happened
        setTimeout(() => {
            const container = document.querySelector('.deal-scroll-container');
            if (container) {
                // Flash border to indicate refresh
                container.style.border = '2px solid #27ae60';
                container.style.transition = 'border-color 0.3s ease';
                
                setTimeout(() => {
                    container.style.border = '1px solid #444';
                }, 500);
                
                // Scroll to bottom and back to top to "wake up" scrolling
                container.scrollTop = container.scrollHeight;
                setTimeout(() => {
                    container.scrollTop = 0;
                }, 100);
            }
        }, 150);
    }
    
    /**
     * Apply specific scrolling fixes for Pixel 9a - RUBBER BRIDGE VERSION
     */
    applyPixelScrollingFixes() {
        console.log('🔧 Applying Pixel 9a scrolling fixes for Rubber Bridge scores...');
        
        // Find the modal and scroll container
        const modal = document.querySelector('.modal-content');
        const scrollContainer = document.querySelector('.deal-scroll-container');
        
        if (modal && scrollContainer) {
            // Force the modal to be scrollable
            modal.style.maxHeight = '85vh';
            modal.style.overflowY = 'auto';
            modal.style.webkitOverflowScrolling = 'touch';
            modal.style.position = 'relative';
            
            // Enhanced scroll container fixes
            scrollContainer.style.height = '280px'; // Fixed height instead of max-height
            scrollContainer.style.overflowY = 'scroll'; // Force scroll instead of auto
            scrollContainer.style.webkitOverflowScrolling = 'touch';
            scrollContainer.style.transform = 'translateZ(0)'; // Force hardware acceleration
            scrollContainer.style.willChange = 'scroll-position';
            
            // Add visible scrollbar for mobile
            const style = document.createElement('style');
            style.textContent = `
                .deal-scroll-container::-webkit-scrollbar {
                    width: 8px !important;
                    background: rgba(255, 255, 255, 0.1) !important;
                }
                .deal-scroll-container::-webkit-scrollbar-thumb {
                    background: rgba(230, 126, 34, 0.6) !important;
                    border-radius: 4px !important;
                }
                .deal-scroll-container::-webkit-scrollbar-track {
                    background: rgba(0, 0, 0, 0.1) !important;
                }
            `;
            document.head.appendChild(style);
            
            // Test scroll and log results
            const testScroll = () => {
                scrollContainer.scrollTop = 50;
                setTimeout(() => {
                    console.log(`📱 Scroll test - scrollTop: ${scrollContainer.scrollTop}, scrollHeight: ${scrollContainer.scrollHeight}, clientHeight: ${scrollContainer.clientHeight}`);
                    if (scrollContainer.scrollTop === 0 && scrollContainer.scrollHeight > scrollContainer.clientHeight) {
                        console.warn('⚠️ Scrolling may not be working properly on this device');
                        // Add a touch scroll hint
                        scrollContainer.style.border = '2px solid #e67e22';
                        scrollContainer.style.boxShadow = 'inset 0 0 10px rgba(230, 126, 34, 0.3)';
                        
                        // Add a visible scroll indicator
                        const scrollHint = document.createElement('div');
                        scrollHint.innerHTML = '👆 Touch and drag to scroll';
                        scrollHint.style.cssText = `
                            position: absolute;
                            top: 10px;
                            right: 10px;
                            background: rgba(230, 126, 34, 0.8);
                            color: white;
                            padding: 4px 8px;
                            border-radius: 4px;
                            font-size: 10px;
                            z-index: 100;
                            pointer-events: none;
                        `;
                        scrollContainer.style.position = 'relative';
                        scrollContainer.appendChild(scrollHint);
                    }
                }, 100);
            };
            
            testScroll();
            
            // Add touch event handlers for better mobile scrolling
            let touchStart = null;
            
            scrollContainer.addEventListener('touchstart', (e) => {
                touchStart = e.touches[0].clientY;
                console.log('📱 Touch start detected');
            }, { passive: true });
            
            scrollContainer.addEventListener('touchmove', (e) => {
                if (touchStart !== null) {
                    const touchY = e.touches[0].clientY;
                    const deltaY = touchStart - touchY;
                    scrollContainer.scrollTop += deltaY * 0.5; // Smooth scrolling
                    touchStart = touchY;
                    console.log(`📱 Touch scroll: ${scrollContainer.scrollTop}`);
                }
            }, { passive: true });
            
            scrollContainer.addEventListener('touchend', () => {
                touchStart = null;
                console.log('📱 Touch end');
            }, { passive: true });
            
            console.log('✅ Pixel 9a scrolling fixes applied successfully');
        } else {
            console.warn('⚠️ Could not find modal or scroll container for scrolling fixes');
        }
    }
    
    /**
     * Close scores modal
     */
    closeScoresModal() {
        const modal = document.querySelector('.modal-overlay');
        if (modal) {
            modal.remove();
            document.body.classList.remove('modal-open');
            console.log('📊 Scores modal closed');
        }
    }
    
    /**
     * Show simple modal for basic messages
     */
    showSimpleModal(title, content) {
        // Fallback for simple messages
        this.showMobileOptimizedQuitModal(`<div style="padding: 15px;">${content}</div>`);
    }
    
    /**
     * Confirm starting a new rubber
     */
    confirmNewRubber() {
        const rubberStatus = this.getRubberStatus();
        
        if (rubberStatus.rubberComplete) {
            // Rubber is complete, just start new one
            this.startNewRubber();
        } else {
            // Rubber in progress, confirm
            const confirmed = confirm(
                `Start a new rubber?\n\nCurrent rubber in progress:\nGames: NS ${rubberStatus.gamesWon.NS} - EW ${rubberStatus.gamesWon.EW}\n\nThis will reset all scores and start over.\n\nClick OK to start new rubber, Cancel to continue current rubber.`
            );
            
            if (confirmed) {
                this.startNewRubber();
            }
        }
    }
    
    /**
     * Start a new game (reset scores and rubber state)
     */
    startNewGame() {
        const rubberStatus = this.getRubberStatus();
        
        let confirmMessage = 'Start a new rubber?\n\n';
        if (rubberStatus.rubberComplete) {
            confirmMessage += 'Current rubber is complete.\n\n';
        } else {
            confirmMessage += `Current rubber in progress:\nGames: NS ${rubberStatus.gamesWon.NS} - EW ${rubberStatus.gamesWon.EW}\nDeals played: ${rubberStatus.dealsPlayed}\n\n`;
        }
        confirmMessage += 'This will reset all scores and start fresh.\n\nClick OK to start new rubber, Cancel to continue.';
        
        const confirmed = confirm(confirmMessage);
        
        if (confirmed) {
            this.startNewRubber();
            console.log('🆕 New Rubber Bridge game started');
        }
    }
    
    /**
     * Return to main menu
     */
    returnToMainMenu() {
        this.bridgeApp.showLicensedMode({ 
            type: this.bridgeApp.licenseManager.getLicenseData()?.type || 'FULL' 
        });
    }
    
    /**
     * Cleanup when switching modes
     */
    cleanup() {
        console.log('🧹 Rubber Bridge cleanup completed');
        // Rubber Bridge doesn't have special UI elements to clean up
    }
// END SECTION SIX - Part 2// SECTION SEVEN - Score Display Methods
    /**
     * Show detailed deal-by-deal scores with Rubber Bridge analysis - WITH PIXEL 9A FIX
     */
    showDetailedScores() {
        const scores = this.gameState.scores;
        const history = this.gameState.history.filter(deal => deal.mode === 'rubber');
        
        if (history.length === 0) {
            this.bridgeApp.showModal('📊 Game Scores', '<p>No deals have been played yet.</p>');
            return;
        }

        const rubberStatus = this.getRubberStatus();
        const breakdown = this.getScoringBreakdown();

        let dealSummary = `
            <div class="scores-summary">
                <h4>📊 Rubber Bridge Score Sheet</h4>
                <div style="display: flex; justify-content: space-between; margin: 10px 0; font-size: 13px;">
                    <div><strong>Games Won:</strong> NS ${rubberStatus.gamesWon.NS} - EW ${rubberStatus.gamesWon.EW}</div>
                    <div><strong>Vulnerability:</strong> ${rubberStatus.vulnerability.NS ? 'NS 🔴' : 'NS 🟢'} | ${rubberStatus.vulnerability.EW ? 'EW 🔴' : 'EW 🟢'}</div>
                </div>
                
                <div style="background: rgba(255,255,255,0.95); padding: 12px; border-radius: 6px; margin: 8px 0; border: 2px solid #3498db;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-weight: bold; color: #2c3e50;">
                        <span>North-South</span>
                        <span>East-West</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 4px; color: #e74c3c; font-weight: bold;">
                        <span>Game Points: ${breakdown.partScores.NS}</span>
                        <span>Game Points: ${breakdown.partScores.EW}</span>
                    </div>
                    <div style="font-size: 10px; color: #7f8c8d; margin-bottom: 6px; text-align: center;">
                        (Below-the-line • Need 100+ for game)
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 4px; color: #3498db; font-weight: bold;">
                        <span>Bonus Points: ${breakdown.aboveScores.NS}</span>
                        <span>Bonus Points: ${breakdown.aboveScores.EW}</span>
                    </div>
                    <div style="font-size: 10px; color: #7f8c8d; margin-bottom: 8px; text-align: center;">
                        (Above-the-line • Bonuses, penalties, honors)
                    </div>
                    <div style="display: flex; justify-content: space-between; border-top: 2px solid #34495e; padding-top: 6px; font-weight: bold; color: #27ae60; font-size: 16px;">
                        <span>Total: ${breakdown.totals.NS}</span>
                        <span>Total: ${breakdown.totals.EW}</span>
                    </div>
                </div>
            </div>
            
            <div class="deals-history">
                <h4>🎩 Deal by Deal History</h4>
                <div class="deal-scroll-container" style="
                    max-height: 280px; 
                    overflow-y: auto; 
                    overflow-x: hidden;
                    -webkit-overflow-scrolling: touch;
                    font-size: 12px;
                    border: 1px solid #444;
                    border-radius: 4px;
                    background: rgba(255,255,255,0.95);
                    margin: 10px 0;
                    position: relative;
                ">
        `;
        
        // Group deals and bonuses together
        let dealNumber = 1;
        history.forEach((deal, index) => {
            if (deal.honorBonus) {
                // Honor bonus entry
                dealSummary += `
                    <div style="
                        border-left: 4px solid #f39c12;
                        padding: 8px 12px;
                        background: rgba(243, 156, 18, 0.1);
                        margin: 2px 4px;
                        border-radius: 4px;
                    ">
                        <div style="font-weight: bold; color: #d68910; font-size: 11px;">
                            🏅 Honor Bonus: +${deal.score} to ${deal.scoringSide}
                        </div>
                        <div style="font-size: 10px; color: #85701f;">
                            ${deal.contract.suit === 'HONOR' ? 'Honor cards held' : 'Honor bonus awarded'}
                        </div>
                    </div>
                `;
            } else if (deal.rubberBonus) {
                // Rubber bonus entry
                const rubberScore = deal.rubberScoring.rubberComplete ? '2-0' : '2-1';
                dealSummary += `
                    <div style="
                        border-left: 4px solid #e74c3c;
                        padding: 12px;
                        background: rgba(231, 76, 60, 0.1);
                        margin: 4px;
                        border-radius: 6px;
                        text-align: center;
                    ">
                        <div style="font-weight: bold; color: #c0392b; font-size: 14px;">
                            🏆 RUBBER COMPLETE!
                        </div>
                        <div style="font-size: 12px; color: #a93226; margin: 2px 0;">
                            ${deal.scoringSide} wins ${rubberScore} rubber
                        </div>
                        <div style="font-size: 11px; color: #943126;">
                            Rubber bonus: +${deal.score} points
                        </div>
                    </div>
                `;
            } else {
                // Regular deal
                const contract = deal.contract;
                const contractStr = `${contract.level}${contract.suit}${contract.doubled ? ' ' + contract.doubled : ''}`;
                const vulnerability = deal.vulnerability || 'None';
                const rubberScoring = deal.rubberScoring || {};
                
                // Vulnerability color
                const vulnColor = vulnerability === 'None' ? '#95a5a6' : 
                                 vulnerability === 'NS' ? '#27ae60' : 
                                 vulnerability === 'EW' ? '#e74c3c' : '#f39c12';
                
                const scoreDisplay = deal.score >= 0 ? `+${deal.score}` : `${deal.score}`;
                const scoringSide = deal.scoringSide;
                
                dealSummary += `
                    <div style="
                        border-bottom: 1px solid #ddd; 
                        padding: 12px 8px; 
                        background: ${index % 2 === 0 ? 'rgba(240,240,240,0.8)' : 'rgba(255,255,255,0.9)'};
                        margin: 2px 0;
                        border-radius: 4px;
                    ">
                        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                            <div style="flex: 1; min-width: 0;">
                                <div style="font-weight: bold; margin-bottom: 3px; color: #222; font-size: 12px;">
                                    Deal ${dealNumber} - <span style="color: ${vulnColor};">${vulnerability}</span>
                                </div>
                                <div style="font-size: 11px; color: #333; font-weight: 500; margin-bottom: 2px;">
                                    ${contractStr} by ${contract.declarer} = ${contract.result}
                                </div>
                                ${rubberScoring.belowLine || rubberScoring.aboveLine ? `
                                    <div style="font-size: 10px; color: #666;">
                                        Below: ${rubberScoring.belowLine || 0} | Above: ${rubberScoring.aboveLine || 0}
                                        ${rubberScoring.gameWon ? ' | 🎯 GAME!' : ''}
                                    </div>
                                ` : ''}
                            </div>
                            <div style="
                                text-align: right;
                                min-width: 70px;
                                font-size: 12px;
                                font-weight: bold;
                            ">
                                <div style="color: ${deal.score >= 0 ? '#27ae60' : '#e74c3c'};">
                                    ${scoreDisplay}
                                </div>
                                <div style="font-size: 10px; color: #666;">
                                    ${scoringSide}
                                </div>
                            </div>
                        </div>
                    </div>
                `;
                dealNumber++;
            }
        });
        
        dealSummary += `
                </div>
            </div>
            
            <div style="
                text-align: center; 
                font-size: 11px; 
                color: #666; 
                margin-top: 10px;
                display: block;
            ">
                🎩 Rubber Bridge: Classic above/below line scoring<br>
                On mobile: Use Refresh Scroll if needed
            </div>
        `;
        
        const scoreModalButtons = [
            { text: 'Back to Options', action: () => this.showQuit(), class: 'back-btn' },
            { text: 'Refresh Scroll', action: () => this.refreshScoreSheet(), class: 'refresh-btn' },
            { text: 'Continue Playing', action: () => {}, class: 'continue-btn' }
        ];
        
        this.bridgeApp.showModal('📊 Rubber Bridge - Score Sheet', dealSummary, scoreModalButtons);
        
        // Apply Pixel 9a specific scrolling fixes after modal is shown
        setTimeout(() => {
            this.applyPixelScrollingFixes();
        }, 100);
    }
    
    /**
     * Refresh the score sheet to force scrolling activation on problematic devices - PIXEL 9A FIX
     */
    refreshScoreSheet() {
        console.log('🔄 Refreshing score sheet for better scrolling...');
        
        // Simply re-show the detailed scores - this forces DOM refresh
        this.showDetailedScores();
        
        // Add a brief visual indication that refresh happened
        setTimeout(() => {
            const container = document.querySelector('.deal-scroll-container');
            if (container) {
                // Flash border to indicate refresh
                container.style.border = '2px solid #27ae60';
                container.style.transition = 'border-color 0.3s ease';
                
                setTimeout(() => {
                    container.style.border = '1px solid #444';
                }, 500);
                
                // Scroll to bottom and back to top to "wake up" scrolling
                container.scrollTop = container.scrollHeight;
                setTimeout(() => {
                    container.scrollTop = 0;
                }, 100);
            }
        }, 150);
    }
    
    /**
     * Apply specific scrolling fixes for Pixel 9a and other problematic devices - PIXEL 9A FIX
     */
    applyPixelScrollingFixes() {
        console.log('🔧 Applying Pixel 9a scrolling fixes...');
        
        // Find the modal and scroll container
        const modal = document.querySelector('.modal-content');
        const scrollContainer = document.querySelector('.deal-scroll-container');
        
        if (modal && scrollContainer) {
            // Force the modal to be scrollable
            modal.style.maxHeight = '85vh';
            modal.style.overflowY = 'auto';
            modal.style.webkitOverflowScrolling = 'touch';
            modal.style.position = 'relative';
            
            // Enhanced scroll container fixes
            scrollContainer.style.height = '280px'; // Fixed height instead of max-height
            scrollContainer.style.overflowY = 'scroll'; // Force scroll instead of auto
            scrollContainer.style.webkitOverflowScrolling = 'touch';
            scrollContainer.style.transform = 'translateZ(0)'; // Force hardware acceleration
            scrollContainer.style.willChange = 'scroll-position';
            
            // Add visible scrollbar for mobile
            const style = document.createElement('style');
            style.textContent = `
                .deal-scroll-container::-webkit-scrollbar {
                    width: 8px !important;
                    background: rgba(255, 255, 255, 0.1) !important;
                }
                .deal-scroll-container::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.4) !important;
                    border-radius: 4px !important;
                }
                .deal-scroll-container::-webkit-scrollbar-track {
                    background: rgba(0, 0, 0, 0.1) !important;
                }
            `;
            document.head.appendChild(style);
            
            // Test scroll and log results
            const testScroll = () => {
                scrollContainer.scrollTop = 50;
                setTimeout(() => {
                    console.log(`📱 Scroll test - scrollTop: ${scrollContainer.scrollTop}, scrollHeight: ${scrollContainer.scrollHeight}, clientHeight: ${scrollContainer.clientHeight}`);
                    if (scrollContainer.scrollTop === 0 && scrollContainer.scrollHeight > scrollContainer.clientHeight) {
                        console.warn('⚠️ Scrolling may not be working properly on this device');
                        // Add a touch scroll hint
                        scrollContainer.style.border = '2px solid #3498db';
                        scrollContainer.style.boxShadow = 'inset 0 0 10px rgba(52, 152, 219, 0.3)';
                        
                        // Add a visible scroll indicator
                        const scrollHint = document.createElement('div');
                        scrollHint.innerHTML = '👆 Touch and drag to scroll';
                        scrollHint.style.cssText = `
                            position: absolute;
                            top: 10px;
                            right: 10px;
                            background: rgba(52, 152, 219, 0.8);
                            color: white;
                            padding: 4px 8px;
                            border-radius: 4px;
                            font-size: 10px;
                            z-index: 100;
                            pointer-events: none;
                        `;
                        scrollContainer.style.position = 'relative';
                        scrollContainer.appendChild(scrollHint);
                    }
                }, 100);
            };
            
            testScroll();
            
            // Add touch event handlers for better mobile scrolling
            let touchStart = null;
            
            scrollContainer.addEventListener('touchstart', (e) => {
                touchStart = e.touches[0].clientY;
                console.log('📱 Touch start detected');
            }, { passive: true });
            
            scrollContainer.addEventListener('touchmove', (e) => {
                if (touchStart !== null) {
                    const touchY = e.touches[0].clientY;
                    const deltaY = touchStart - touchY;
                    scrollContainer.scrollTop += deltaY * 0.5; // Smooth scrolling
                    touchStart = touchY;
                    console.log(`📱 Touch scroll: ${scrollContainer.scrollTop}`);
                }
            }, { passive: true });
            
            scrollContainer.addEventListener('touchend', () => {
                touchStart = null;
                console.log('📱 Touch end');
            }, { passive: true });
            
            console.log('✅ Pixel 9a scrolling fixes applied successfully');
        } else {
            console.warn('⚠️ Could not find modal or scroll container for scrolling fixes');
        }
    }
    
    /**
     * Get rubber score breakdown formatted for display
     */
    getRubberScoreBreakdown() {
        const ns = this.rubberState;
        const partNS = ns.partScores.NS;
        const partEW = ns.partScores.EW;
        const aboveNS = ns.aboveLineScores.NS;
        const aboveEW = ns.aboveLineScores.EW;
        const totalNS = partNS + aboveNS;
        const totalEW = partEW + aboveEW;
        
        const vulnNS = ns.vulnerability.NS ? '🔴' : '🟢';
        const vulnEW = ns.vulnerability.EW ? '🔴' : '🟢';
        
        return `
            <div style="background: rgba(255,255,255,0.95); padding: 12px; border-radius: 6px; margin: 6px 0; font-size: 12px; border: 1px solid #bdc3c7;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-weight: bold; color: #2c3e50;">
                    <span>NS ${vulnNS}</span>
                    <span>EW ${vulnEW}</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 2px;">
                    <span style="color: #e74c3c; font-weight: bold;">Game Points: ${partNS}</span>
                    <span style="color: #e74c3c; font-weight: bold;">Game Points: ${partEW}</span>
                </div>
                <div style="font-size: 10px; color: #7f8c8d; margin-bottom: 4px; text-align: center;">
                    (Below-the-line • Need 100+ for game)
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 2px;">
                    <span style="color: #3498db; font-weight: bold;">Bonus Points: ${aboveNS}</span>
                    <span style="color: #3498db; font-weight: bold;">Bonus Points: ${aboveEW}</span>
                </div>
                <div style="font-size: 10px; color: #7f8c8d; margin-bottom: 6px; text-align: center;">
                    (Above-the-line • Game/slam/honor bonuses)
                </div>
                <div style="display: flex; justify-content: space-between; border-top: 1px solid #95a5a6; padding-top: 4px; font-weight: bold; color: #27ae60;">
                    <span>Total: ${totalNS}</span>
                    <span>Total: ${totalEW}</span>
                </div>
            </div>
        `;
    }
    
    /**
     * Get enhanced status display for Rubber Bridge
     */
    getStatusDisplay() {
        const rubberStatus = this.getRubberStatus();
        const breakdown = this.getScoringBreakdown();
        const partScorePressure = this.getPartScorePressure();
        
        return {
            dealInfo: this.getDealInfo(),
            gamesWon: rubberStatus.gamesWon,
            vulnerability: rubberStatus.vulnerability,
            scores: breakdown.totals,
            partScores: breakdown.partScores,
            partScorePressure: partScorePressure,
            isComplete: rubberStatus.rubberComplete,
            winner: rubberStatus.rubberWinner
        };
    }
    
    /**
     * Get rubber progress visualization
     */
    getRubberProgressDisplay() {
        const rubberStatus = this.getRubberStatus();
        const breakdown = this.getScoringBreakdown();
        
        let progressHTML = `<div class="rubber-progress" style="margin: 10px 0;">`;
        progressHTML += `<div style="font-weight: bold; margin-bottom: 8px;">Rubber Progress:</div>`;
        
        // Games won display
        progressHTML += `<div style="display: flex; gap: 10px; justify-content: center; margin-bottom: 10px;">`;
        
        // NS games
        for (let i = 0; i < 2; i++) {
            const won = i < rubberStatus.gamesWon.NS;
            progressHTML += `
                <div style="
                    width: 40px;
                    height: 30px;
                    background: ${won ? '#27ae60' : '#ecf0f1'};
                    color: ${won ? 'white' : '#7f8c8d'};
                    border: 1px solid #bdc3c7;
                    border-radius: 4px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 12px;
                    font-weight: bold;
                ">
                    NS
                </div>
            `;
        }
        
        progressHTML += `<div style="width: 20px; text-align: center; line-height: 30px; font-weight: bold;">vs</div>`;
        
        // EW games
        for (let i = 0; i < 2; i++) {
            const won = i < rubberStatus.gamesWon.EW;
            progressHTML += `
                <div style="
                    width: 40px;
                    height: 30px;
                    background: ${won ? '#e74c3c' : '#ecf0f1'};
                    color: ${won ? 'white' : '#7f8c8d'};
                    border: 1px solid #bdc3c7;
                    border-radius: 4px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 12px;
                    font-weight: bold;
                ">
                    EW
                </div>
            `;
        }
        
        progressHTML += `</div>`;
        
        // Part-score progress
        progressHTML += `<div style="font-size: 11px; color: #7f8c8d; text-align: center;">`;
        progressHTML += `Part-scores: NS ${breakdown.partScores.NS}/100 | EW ${breakdown.partScores.EW}/100`;
        progressHTML += `</div>`;
        
        progressHTML += `</div>`;
        return progressHTML;
    }
    
    /**
     * Get compact rubber summary for mobile displays
     */
    getCompactRubberSummary() {
        const rubberStatus = this.getRubberStatus();
        const breakdown = this.getScoringBreakdown();
        
        return {
            games: `${rubberStatus.gamesWon.NS}-${rubberStatus.gamesWon.EW}`,
            vulnerability: this.getCurrentVulnerabilityString(),
            partScores: `${breakdown.partScores.NS}/${breakdown.partScores.EW}`,
            totals: `${breakdown.totals.NS}-${breakdown.totals.EW}`,
            isComplete: rubberStatus.rubberComplete,
            winner: rubberStatus.rubberWinner
        };
    }
    
    /**
     * Format vulnerability for display with rubber-specific styling
     */
    formatRubberVulnerabilityDisplay(vulnerability) {
        const vulnConfig = {
            'None': { text: 'All Fresh', color: '#95a5a6', bgColor: 'rgba(149, 165, 166, 0.1)' },
            'NS': { text: 'NS Vul', color: '#27ae60', bgColor: 'rgba(39, 174, 96, 0.1)' },
            'EW': { text: 'EW Vul', color: '#e74c3c', bgColor: 'rgba(231, 76, 60, 0.1)' },
            'Both': { text: 'Both Vul', color: '#f39c12', bgColor: 'rgba(243, 156, 18, 0.1)' }
        };
        
        const config = vulnConfig[vulnerability] || vulnConfig['None'];
        
        return `
            <span style="
                color: ${config.color};
                background: ${config.bgColor};
                padding: 2px 6px;
                border-radius: 3px;
                font-weight: bold;
                font-size: 11px;
                border: 1px solid ${config.color};
            ">
                ${config.text}
            </span>
        `;
    }
    
    /**
     * Get part-score progress bar HTML
     */
    getPartScoreProgressBar(side) {
        const breakdown = this.getScoringBreakdown();
        const points = breakdown.partScores[side];
        const percentage = Math.min(100, (points / 100) * 100);
        
        const color = side === 'NS' ? '#3498db' : '#e67e22';
        const bgColor = side === 'NS' ? 'rgba(52, 152, 219, 0.2)' : 'rgba(230, 126, 34, 0.2)';
        
        return `
            <div style="
                width: 100%;
                height: 20px;
                background: ${bgColor};
                border-radius: 10px;
                overflow: hidden;
                position: relative;
                margin: 4px 0;
            ">
                <div style="
                    width: ${percentage}%;
                    height: 100%;
                    background: ${color};
                    transition: width 0.3s ease;
                "></div>
                <div style="
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 11px;
                    font-weight: bold;
                    color: #2c3e50;
                ">
                    ${points}/100
                </div>
            </div>
        `;
    }
// END SECTION SEVEN
// SECTION EIGHT - Utility and Game Management
    /**
     * Start a new game (reset scores and rubber state)
     */
    startNewGame() {
        const rubberStatus = this.getRubberStatus();
        
        let confirmMessage = 'Start a new rubber?\n\n';
        if (rubberStatus.rubberComplete) {
            confirmMessage += 'Current rubber is complete.\n\n';
        } else {
            confirmMessage += `Current rubber in progress:\nGames: NS ${rubberStatus.gamesWon.NS} - EW ${rubberStatus.gamesWon.EW}\nDeals played: ${rubberStatus.dealsPlayed}\n\n`;
        }
        confirmMessage += 'This will reset all scores and start fresh.\n\nClick OK to start new rubber, Cancel to continue.';
        
        const confirmed = confirm(confirmMessage);
        
        if (confirmed) {
            this.startNewRubber();
            console.log('🆕 New Rubber Bridge game started');
        }
    }
    
    /**
     * Return to main menu
     */
    returnToMainMenu() {
        this.bridgeApp.showLicensedMode({ 
            type: this.bridgeApp.licenseManager.getLicenseData()?.type || 'FULL' 
        });
    }
    
    /**
     * Get current deal information string
     */
    getDealInfo() {
        const vulnerability = this.getCurrentVulnerabilityString();
        return `Deal ${this.currentDeal} - ${vulnerability}`;
    }
    
    /**
     * Get rubber progress summary
     */
    getRubberProgressSummary() {
        const rubberStatus = this.getRubberStatus();
        const breakdown = this.getScoringBreakdown();
        
        return {
            gamesWon: rubberStatus.gamesWon,
            vulnerability: rubberStatus.vulnerability,
            partScores: breakdown.partScores,
            totals: breakdown.totals,
            isComplete: rubberStatus.rubberComplete,
            winner: rubberStatus.rubberWinner,
            dealsPlayed: rubberStatus.dealsPlayed
        };
    }
    
    /**
     * Check if rubber is at a natural break point
     */
    isAtRubberBreak() {
        const rubberStatus = this.getRubberStatus();
        
        if (rubberStatus.rubberComplete) {
            return { 
                isBreak: true, 
                reason: `Rubber Complete - ${rubberStatus.rubberWinner} wins`, 
                severity: 'major' 
            };
        }
        
        // Game completion is a minor break point
        const totalGames = rubberStatus.gamesWon.NS + rubberStatus.gamesWon.EW;
        if (totalGames > 0) {
            const gameWinner = rubberStatus.gamesWon.NS > rubberStatus.gamesWon.EW ? 'NS' : 'EW';
            return { 
                isBreak: true, 
                reason: `Game Complete - ${gameWinner} leads ${Math.max(rubberStatus.gamesWon.NS, rubberStatus.gamesWon.EW)}-${Math.min(rubberStatus.gamesWon.NS, rubberStatus.gamesWon.EW)}`, 
                severity: 'minor' 
            };
        }
        
        return { isBreak: false, reason: null, severity: null };
    }
    
    /**
     * Get part-score pressure analysis
     */
    getPartScorePressure() {
        const breakdown = this.getScoringBreakdown();
        const nsPartScore = breakdown.partScores.NS;
        const ewPartScore = breakdown.partScores.EW;
        
        const analysis = {
            NS: {
                points: nsPartScore,
                needed: Math.max(0, 100 - nsPartScore),
                pressure: nsPartScore >= 60 ? 'high' : nsPartScore >= 40 ? 'medium' : 'low',
                percentage: Math.round((nsPartScore / 100) * 100)
            },
            EW: {
                points: ewPartScore,
                needed: Math.max(0, 100 - ewPartScore),
                pressure: ewPartScore >= 60 ? 'high' : ewPartScore >= 40 ? 'medium' : 'low',
                percentage: Math.round((ewPartScore / 100) * 100)
            }
        };
        
        return analysis;
    }
    
    /**
     * Export rubber bridge game data
     */
    exportRubberData() {
        const rubberStatus = this.getRubberStatus();
        const breakdown = this.getScoringBreakdown();
        const history = this.gameState.history.filter(deal => deal.mode === 'rubber');
        
        return {
            mode: 'rubber',
            version: '1.0',
            exportDate: new Date().toISOString(),
            gameState: {
                currentDeal: this.currentDeal,
                rubberStatus: rubberStatus,
                scoreBreakdown: breakdown,
                vulnerability: this.getCurrentVulnerabilityString()
            },
            rubberState: {
                gamesWon: { ...this.rubberState.gamesWon },
                belowLineScores: { ...this.rubberState.belowLineScores },
                aboveLineScores: { ...this.rubberState.aboveLineScores },
                partScores: { ...this.rubberState.partScores },
                vulnerability: { ...this.rubberState.vulnerability },
                rubberComplete: this.rubberState.rubberComplete,
                rubberWinner: this.rubberState.rubberWinner
            },
            history: history.map(deal => ({
                deal: deal.deal,
                contract: { ...deal.contract },
                result: deal.contract.result,
                score: deal.score,
                scoringSide: deal.scoringSide,
                vulnerability: deal.vulnerability,
                rubberScoring: deal.rubberScoring,
                isHonorBonus: deal.honorBonus || false,
                isRubberBonus: deal.rubberBonus || false
            })),
            statistics: this.getRubberStatistics()
        };
    }
    
    /**
     * Get comprehensive rubber bridge statistics
     */
    getRubberStatistics() {
        const history = this.gameState.history.filter(deal => deal.mode === 'rubber');
        const breakdown = this.getScoringBreakdown();
        const rubberStatus = this.getRubberStatus();
        
        if (history.length === 0) {
            return {
                totalDeals: 0,
                rubbersCompleted: 0,
                averageScore: { NS: 0, EW: 0 }
            };
        }
        
        const regularDeals = history.filter(deal => !deal.honorBonus && !deal.rubberBonus);
        const honorBonuses = history.filter(deal => deal.honorBonus);
        const rubberBonuses = history.filter(deal => deal.rubberBonus);
        
        const stats = {
            totalDeals: regularDeals.length,
            honorBonuses: honorBonuses.length,
            rubberBonuses: rubberBonuses.length,
            rubbersCompleted: rubberBonuses.length,
            currentRubber: {
                gamesWon: { ...rubberStatus.gamesWon },
                totalScore: { ...breakdown.totals },
                belowLine: { ...breakdown.partScores },
                aboveLine: { ...breakdown.aboveScores }
            },
            contractsMade: regularDeals.filter(d => d.score >= 0).length,
            contractsFailed: regularDeals.filter(d => d.score < 0).length,
            gamesWon: {
                NS: rubberStatus.gamesWon.NS,
                EW: rubberStatus.gamesWon.EW,
                total: rubberStatus.gamesWon.NS + rubberStatus.gamesWon.EW
            },
            averageScore: {
                NS: regularDeals.length > 0 ? Math.round(breakdown.totals.NS / regularDeals.length) : 0,
                EW: regularDeals.length > 0 ? Math.round(breakdown.totals.EW / regularDeals.length) : 0
            },
            highestScore: regularDeals.length > 0 ? Math.max(...regularDeals.map(d => Math.abs(d.score))) : 0,
            slamsBid: regularDeals.filter(d => {
                const contract = d.contract;
                return contract.level >= 6;
            }).length,
            doublesPlayed: regularDeals.filter(d => d.contract.doubled !== '').length,
            honorBonusValue: honorBonuses.reduce((sum, deal) => sum + deal.score, 0),
            rubberBonusValue: rubberBonuses.reduce((sum, deal) => sum + deal.score, 0)
        };
        
        return stats;
    }
    
    /**
     * Calculate rubber efficiency (games per deal ratio)
     */
    calculateRubberEfficiency() {
        const stats = this.getRubberStatistics();
        const rubberStatus = this.getRubberStatus();
        
        if (stats.totalDeals === 0) return 0;
        
        const totalGames = rubberStatus.gamesWon.NS + rubberStatus.gamesWon.EW;
        return totalGames / stats.totalDeals;
    }
    
    /**
     * Get game recommendations based on rubber state
     */
    getRubberRecommendations() {
        const rubberStatus = this.getRubberStatus();
        const partScorePressure = this.getPartScorePressure();
        const breakPoint = this.isAtRubberBreak();
        const recommendations = [];
        
        if (breakPoint.isBreak && breakPoint.severity === 'major') {
            recommendations.push({
                type: 'break',
                message: 'Rubber complete - natural stopping point!',
                action: 'Perfect time for a break or to start a new rubber'
            });
        }
        
        if (partScorePressure.NS.pressure === 'high' || partScorePressure.EW.pressure === 'high') {
            const highPressureSide = partScorePressure.NS.pressure === 'high' ? 'NS' : 'EW';
            recommendations.push({
                type: 'strategy',
                message: `${highPressureSide} has part-score pressure (${partScorePressure[highPressureSide].points}/100)`,
                action: 'Consider aggressive bidding or defensive tactics'
            });
        }
        
        if (rubberStatus.gamesWon.NS === 1 && rubberStatus.gamesWon.EW === 1) {
            recommendations.push({
                type: 'excitement',
                message: 'Rubber tied 1-1 - decisive game coming!',
                action: 'Next game wins the rubber'
            });
        }
        
        if (rubberStatus.dealsPlayed >= 20) {
            recommendations.push({
                type: 'session',
                message: 'Long rubber session detected',
                action: 'Consider natural break after current game'
            });
        }
        
        return recommendations;
    }
    
    /**
     * Reset to specific game for teaching/practice
     */
    resetToGame(gameNumber) {
        if (gameNumber < 1 || gameNumber > 3) {
            console.warn('Invalid game number for rubber bridge');
            return false;
        }
        
        this.resetRubber();
        
        // Set up the specified game state
        if (gameNumber === 2) {
            // Start of second game - NS won first game
            this.rubberState.gamesWon.NS = 1;
            this.rubberState.vulnerability.NS = true;
        } else if (gameNumber === 3) {
            // Start of third game - both sides won one game
            this.rubberState.gamesWon.NS = 1;
            this.rubberState.gamesWon.EW = 1;
            this.rubberState.vulnerability.NS = true;
            this.rubberState.vulnerability.EW = true;
        }
        
        this.resetContract();
        this.inputState = 'level_selection';
        this.updateDisplay();
        
        console.log(`🔄 Reset to Game ${gameNumber} - Games: ${this.rubberState.gamesWon.NS}-${this.rubberState.gamesWon.EW}`);
        return true;
    }
    
    /**
     * Check if we're at a natural break point
     */
    isAtBreakPoint() {
        // Rubber completion is always a break point
        if (this.rubberState.rubberComplete) {
            return { isBreak: true, reason: 'Rubber Complete', severity: 'major' };
        }
        
        // Game completion is a minor break point
        const totalGames = this.rubberState.gamesWon.NS + this.rubberState.gamesWon.EW;
        if (totalGames > 0) {
            return { isBreak: true, reason: 'Game Complete', severity: 'minor' };
        }
        
        return { isBreak: false, reason: null, severity: null };
    }
    
    /**
     * Get natural break points in the rubber
     */
    getRubberBreakPoints() {
        const history = this.gameState.history.filter(deal => deal.mode === 'rubber');
        const breakPoints = [];
        
        // Find all game completions
        history.forEach((deal, index) => {
            if (deal.rubberScoring && deal.rubberScoring.gameWon) {
                const gamesWonAtTime = {
                    NS: history.slice(0, index + 1).filter(d => 
                        d.rubberScoring && d.rubberScoring.gameWon && 
                        (d.contract.declarer === 'N' || d.contract.declarer === 'S')
                    ).length,
                    EW: history.slice(0, index + 1).filter(d => 
                        d.rubberScoring && d.rubberScoring.gameWon && 
                        (d.contract.declarer === 'E' || d.contract.declarer === 'W')
                    ).length
                };
                
                breakPoints.push({
                    deal: deal.deal,
                    type: 'game',
                    winner: deal.scoringSide,
                    gamesWon: gamesWonAtTime,
                    description: `Game won by ${deal.scoringSide}`,
                    severity: 'minor'
                });
            }
            
            if (deal.rubberScoring && deal.rubberScoring.rubberComplete) {
                breakPoints.push({
                    deal: deal.deal,
                    type: 'rubber',
                    winner: deal.rubberScoring.rubberWinner,
                    description: `Rubber won by ${deal.rubberScoring.rubberWinner}`,
                    severity: 'major'
                });
            }
        });
        
        return breakPoints;
    }
    
    /**
     * Generate detailed rubber bridge report
     */
    generateRubberReport() {
        const summary = this.getGameSummary();
        const history = this.gameState.history.filter(deal => deal.mode === 'rubber');
        const breakdown = this.getScoringBreakdown();
        
        let report = `RUBBER BRIDGE GAME REPORT\n`;
        report += `Generated: ${new Date().toLocaleString()}\n`;
        report += `=====================================\n\n`;
        
        report += `CURRENT RUBBER STATUS:\n`;
        report += `Games Won: NS ${summary.currentStatus.gamesWon.NS} - EW ${summary.currentStatus.gamesWon.EW}\n`;
        report += `Vulnerability: NS ${summary.currentStatus.vulnerability.NS ? 'Vulnerable' : 'Fresh'}, EW ${summary.currentStatus.vulnerability.EW ? 'Vulnerable' : 'Fresh'}\n`;
        report += `Part Scores: NS ${summary.currentStatus.partScores.NS}/100, EW ${summary.currentStatus.partScores.EW}/100\n`;
        report += `Total Scores: NS ${summary.currentStatus.totals.NS}, EW ${summary.currentStatus.totals.EW}\n`;
        if (summary.rubberComplete) {
            report += `RUBBER COMPLETE - Winner: ${summary.currentStatus.rubberWinner}\n`;
        }
        report += `\n`;
        
        report += `RUBBER STATISTICS:\n`;
        report += `Total Deals: ${summary.statistics.totalDeals}\n`;
        report += `Contracts Made: ${summary.statistics.contractsMade}\n`;
        report += `Contracts Failed: ${summary.statistics.contractsFailed}\n`;
        report += `Honor Bonuses: ${summary.statistics.honorBonuses} (${summary.statistics.honorBonusValue} points)\n`;
        report += `Slams Bid: ${summary.statistics.slamsBid}\n`;
        report += `Doubles Played: ${summary.statistics.doublesPlayed}\n`;
        report += `Rubber Efficiency: ${(summary.efficiency * 100).toFixed(1)}% (games per deal)\n\n`;
        
        if (summary.breakPoints.length > 0) {
            report += `BREAK POINTS:\n`;
            summary.breakPoints.forEach(bp => {
                report += `Deal ${bp.deal}: ${bp.description}\n`;
            });
            report += `\n`;
        }
        
        report += `DEAL HISTORY:\n`;
        report += `Deal | Contract | Result | Score | Below | Above | Notes\n`;
        report += `-----|----------|--------|-------|-------|-------|------\n`;
        
        let dealNumber = 1;
        history.forEach(deal => {
            if (deal.honorBonus) {
                report += `     | Honor Bonus | +${deal.score} | ${deal.score} |   0   | ${deal.score} | ${deal.scoringSide}\n`;
            } else if (deal.rubberBonus) {
                report += `     | Rubber Bonus | +${deal.score} | ${deal.score} |   0   | ${deal.score} | ${deal.scoringSide} wins\n`;
            } else {
                const contract = deal.contract;
                const contractStr = `${contract.level}${contract.suit}${contract.doubled || ''}`;
                const rubberScoring = deal.rubberScoring || {};
                const notes = rubberScoring.gameWon ? 'GAME!' : '';
                
                report += `${dealNumber.toString().padStart(4)} | ${contractStr.padEnd(8)} | ${contract.result.padEnd(6)} | ${deal.score.toString().padStart(5)} | ${(rubberScoring.belowLine || 0).toString().padStart(5)} | ${(rubberScoring.aboveLine || 0).toString().padStart(5)} | ${notes}\n`;
                dealNumber++;
            }
        });
        
        return report;
    }
    
    /**
     * Setup teaching scenarios for rubber bridge
     */
    setupTeachingScenario(scenario) {
        const scenarios = {
            'fresh-rubber': {
                description: 'Start a fresh rubber - both sides non-vulnerable',
                setup: () => this.resetRubber(),
                setupMessage: 'Fresh rubber started - both sides non-vulnerable'
            },
            'game-point': {
                description: 'Game point situation - one side needs one game to win rubber',
                setup: () => {
                    this.resetRubber();
                    this.rubberState.gamesWon.NS = 1;
                    this.rubberState.gamesWon.EW = 1;
                    this.rubberState.vulnerability.NS = true;
                    this.rubberState.vulnerability.EW = true;
                },
                setupMessage: 'Game point! Both sides vulnerable - next game wins rubber'
            },
            'part-score-pressure': {
                description: 'Part-score pressure - both sides have significant part-scores',
                setup: () => {
                    this.resetRubber();
                    this.rubberState.partScores.NS = 60;
                    this.rubberState.partScores.EW = 70;
                    this.rubberState.belowLineScores.NS = 60;
                    this.rubberState.belowLineScores.EW = 70;
                    this.updateGameStateScores();
                },
                setupMessage: 'Part-score pressure! NS: 60/100, EW: 70/100'
            },
            'vulnerability-demo': {
                description: 'Demonstrate vulnerability effects - one side vulnerable',
                setup: () => {
                    this.resetRubber();
                    this.rubberState.gamesWon.NS = 1;
                    this.rubberState.vulnerability.NS = true;
                },
                setupMessage: 'Vulnerability demo - NS vulnerable, EW fresh'
            }
        };
        
        const config = scenarios[scenario];
        if (!config) {
            console.warn('Unknown rubber bridge teaching scenario:', scenario);
            return false;
        }
        
        config.setup();
        this.resetContract();
        this.inputState = 'level_selection';
        this.updateDisplay();
        
        console.log(`📚 Teaching scenario: ${config.description}`);
        this.bridgeApp.showMessage(config.setupMessage, 'info');
        
        return true;
    }
    
    /**
     * Calculate rubber bridge lesson value
     */
    calculateLessonValue() {
        const stats = this.getRubberStatistics();
        const partScorePressure = this.getPartScorePressure();
        const rubberStatus = this.getRubberStatus();
        
        let lessonValue = 0;
        
        // Basic engagement
        lessonValue += stats.totalDeals * 2;
        
        // Learning bonuses
        if (stats.honorBonuses > 0) lessonValue += 10; // Honor bonus understanding
        if (stats.slamsBid > 0) lessonValue += 15; // Slam bidding experience
        if (stats.doublesPlayed > 0) lessonValue += 8; // Doubling experience
        
        // Strategic understanding
        if (partScorePressure.NS.pressure === 'high' || partScorePressure.EW.pressure === 'high') {
            lessonValue += 12; // Part-score pressure experience
        }
        
        if (rubberStatus.gamesWon.NS > 0 && rubberStatus.gamesWon.EW > 0) {
            lessonValue += 20; // Competitive rubber experience
        }
        
        if (rubberStatus.rubberComplete) {
            lessonValue += 25; // Complete rubber experience
        }
        
        return Math.min(100, lessonValue); // Cap at 100
    }
    
    /**
     * Get rubber bridge insights for improvement
     */
    getRubberInsights() {
        const stats = this.getRubberStatistics();
        const efficiency = this.calculateRubberEfficiency();
        const insights = [];
        
        if (efficiency < 0.3) {
            insights.push({
                type: 'efficiency',
                message: 'Consider more aggressive game bidding',
                explanation: 'Low games-per-deal ratio suggests conservative bidding'
            });
        }
        
        if (stats.honorBonuses === 0 && stats.totalDeals > 5) {
            insights.push({
                type: 'honors',
                message: 'Remember to claim honor bonuses',
                explanation: 'Honor bonuses can add significant points above the line'
            });
        }
        
        if (stats.slamsBid === 0 && stats.totalDeals > 10) {
            insights.push({
                type: 'slams',
                message: 'Consider bidding slams with strong hands',
                explanation: 'Slam bonuses are substantial in rubber bridge'
            });
        }
        
        if (stats.contractsMade / stats.totalDeals < 0.5) {
            insights.push({
                type: 'bidding',
                message: 'Consider more conservative bidding',
                explanation: 'High failure rate suggests overbidding'
            });
        }
        
        return insights;
    }
    
    /**
     * Get comprehensive rubber bridge game summary
     */
    getGameSummary() {
        const rubberStatus = this.getRubberStatus();
        const breakdown = this.getScoringBreakdown();
        const stats = this.getRubberStatistics();
        const partScorePressure = this.getPartScorePressure();
        
        return {
            mode: 'Rubber Bridge',
            currentStatus: {
                deal: this.currentDeal,
                gamesWon: rubberStatus.gamesWon,
                vulnerability: rubberStatus.vulnerability,
                partScores: breakdown.partScores,
                totals: breakdown.totals,
                rubberComplete: rubberStatus.rubberComplete,
                rubberWinner: rubberStatus.rubberWinner
            },
            statistics: stats,
            partScorePressure: partScorePressure,
            rubberComplete: rubberStatus.rubberComplete,
            recommendations: this.getRubberRecommendations(),
            breakPoints: this.getRubberBreakPoints(),
            efficiency: this.calculateRubberEfficiency()
        };
    }
    
    /**
     * Cleanup when switching modes
     */
    cleanup() {
        console.log('🧹 Rubber Bridge cleanup completed');
        // Rubber Bridge doesn't have special UI elements to clean up
    }
// END SECTION EIGHT
// SECTION NINE - Display Content Methods
    /**
     * Get display content for current state - RUBBER BRIDGE ENHANCED - FIXED HONOR BUTTON MESSAGE
     */
    getDisplayContent() {
        const scores = this.gameState.scores;
        const dealInfo = this.getDealInfo();
        const rubberScoring = this.getRubberScoreBreakdown();
        
        // Rubber completion screen
        if (this.rubberState.rubberComplete) {
            const winner = this.rubberState.rubberWinner;
            const gamesWon = this.rubberState.gamesWon[winner];
            const gamesLost = this.rubberState.gamesWon[winner === 'NS' ? 'EW' : 'NS'];
            const totals = this.getRubberTotals();
            const margin = totals[winner] - totals[winner === 'NS' ? 'EW' : 'NS'];
            
            return `
                <div class="title-score-row">
                    <div class="mode-title">🏆 RUBBER COMPLETE!</div>
                    <div class="score-display">Final: ${totals.NS}-${totals.EW}</div>
                </div>
                <div class="game-content">
                    <div style="text-align: center; color: #f1c40f; font-size: 18px; margin: 10px 0;">
                        <strong>${winner} WINS RUBBER ${gamesWon}-${gamesLost}</strong>
                    </div>
                    <div style="text-align: center; font-size: 14px; margin: 8px 0;">
                        Victory margin: ${margin} points
                    </div>
                    ${rubberScoring}
                </div>
                <div class="current-state">Press <strong>Deal</strong> to start new rubber</div>
            `;
        }
        
        // Honor bonus input screen
        if (this.rubberState.honorBonusPending) {
            const contractSuit = this.currentContract.suit;
            const lastSide = this.rubberState.lastContractSide;
            
            return `
                <div class="title-score-row">
                    <div class="mode-title">🏅 Honor Bonuses</div>
                    <div class="score-display">Games: ${this.rubberState.gamesWon.NS}-${this.rubberState.gamesWon.EW}</div>
                </div>
                <div class="game-content">
                    <div style="text-align: center; color: #f39c12; margin: 10px 0; font-size: 16px;">
                        <strong>Honor bonuses for ${lastSide}?</strong>
                    </div>
                    <div style="background: rgba(241,196,15,0.2); padding: 12px; border-radius: 6px; margin: 8px 0; border: 1px solid #f39c12;">
                        ${contractSuit === 'NT' 
                            ? '<strong>Plus</strong> = 4 Aces (150 pts)<br><strong>Back</strong> = No honors'
                            : '<strong>Plus</strong> = 4 Honors (100 pts)<br><strong>Down</strong> = 5 Honors (150 pts)<br><strong>Back</strong> = No honors'
                        }
                    </div>
                    <div style="font-size: 11px; color: #95a5a6; margin-top: 6px; text-align: center;">
                        Honors = A, K, Q, J, 10 of trump suit ${contractSuit === 'NT' ? '| NT honors = 4 Aces' : ''}
                    </div>
                </div>
                <div class="current-state">Press <strong>Plus/Down</strong> for honors, or <strong>Back</strong> for none</div>
            `;
        }
        
        // Standard game display with rubber scoring
        switch (this.inputState) {
            case 'level_selection':
                return `
                    <div class="title-score-row">
                        <div class="mode-title">${this.displayName}</div>
                        <div class="score-display">Games: ${this.rubberState.gamesWon.NS}-${this.rubberState.gamesWon.EW}</div>
                    </div>
                    <div class="game-content">
                        <div><strong>${dealInfo}</strong></div>
                        <div style="color: #e67e22; font-size: 12px; margin-top: 4px;">
                            Classic above/below line scoring • Games to 100 points
                        </div>
                        ${rubberScoring}
                    </div>
                    <div class="current-state">Select bid level (1-7)</div>
                `;
                
            case 'suit_selection':
                return `
                    <div class="title-score-row">
                        <div class="mode-title">${this.displayName}</div>
                        <div class="score-display">Games: ${this.rubberState.gamesWon.NS}-${this.rubberState.gamesWon.EW}</div>
                    </div>
                    <div class="game-content">
                        <div><strong>${dealInfo}</strong></div>
                        <div><strong>Level: ${this.currentContract.level}</strong></div>
                        <div style="color: #e67e22; font-size: 12px; margin-top: 2px;">
                            ${this.wouldMakeGame() ? 'Game contract (100+ points)' : 'Part-score contract'}
                        </div>
                        ${rubberScoring}
                    </div>
                    <div class="current-state">Select suit</div>
                `;
                
            case 'declarer_selection':
                const contractSoFar = `${this.currentContract.level}${this.currentContract.suit}`;
                const doubleText = this.currentContract.doubled ? ` ${this.currentContract.doubled}` : '';
                const wouldMakeGame = this.wouldMakeGame();
                
                return `
                    <div class="title-score-row">
                        <div class="mode-title">${this.displayName}</div>
                        <div class="score-display">Games: ${this.rubberState.gamesWon.NS}-${this.rubberState.gamesWon.EW}</div>
                    </div>
                    <div class="game-content">
                        <div><strong>${dealInfo}</strong></div>
                        <div><strong>Contract: ${contractSoFar}${doubleText}</strong></div>
                        <div style="color: #e67e22; font-size: 12px; margin-top: 2px;">
                            ${wouldMakeGame ? '🎯 Game contract if made' : 'Part-score toward game'}
                        </div>
                        ${rubberScoring}
                    </div>
                    <div class="current-state">
                        ${this.currentContract.declarer ? 
                            'Press Made/Plus/Down for result, or X for double/redouble' : 
                            'Select declarer (N/S/E/W)'}
                    </div>
                `;
                
            case 'result_type_selection':
                const contract = `${this.currentContract.level}${this.currentContract.suit}${this.currentContract.doubled}`;
                const declarerSide = (this.currentContract.declarer === 'N' || this.currentContract.declarer === 'S') ? 'NS' : 'EW';
                const wouldMakeGameResult = this.wouldMakeGame();
                
                return `
                    <div class="title-score-row">
                        <div class="mode-title">${this.displayName}</div>
                        <div class="score-display">Games: ${this.rubberState.gamesWon.NS}-${this.rubberState.gamesWon.EW}</div>
                    </div>
                    <div class="game-content">
                        <div><strong>${dealInfo}</strong></div>
                        <div><strong>Contract: ${contract} by ${this.currentContract.declarer}</strong></div>
                        <div style="color: #e67e22; font-size: 12px; margin-top: 2px;">
                            ${wouldMakeGameResult ? `🎯 If made: ${declarerSide} wins game!` : `Part-score: ${declarerSide} gets points toward game`}
                        </div>
                        ${rubberScoring}
                    </div>
                    <div class="current-state">Made exactly, Plus overtricks, or Down?</div>
                `;
                
            case 'result_number_selection':
                const fullContract = `${this.currentContract.level}${this.currentContract.suit}${this.currentContract.doubled}`;
                const modeText = this.resultMode === 'down' ? 'tricks down (1-7)' : 'overtricks (1-6)';
                
                return `
                    <div class="title-score-row">
                        <div class="mode-title">${this.displayName}</div>
                        <div class="score-display">Games: ${this.rubberState.gamesWon.NS}-${this.rubberState.gamesWon.EW}</div>
                    </div>
                    <div class="game-content">
                        <div><strong>${dealInfo}</strong></div>
                        <div><strong>Contract: ${fullContract} by ${this.currentContract.declarer}</strong></div>
                        <div style="color: #e67e22; font-size: 12px; margin-top: 2px;">
                            ${this.resultMode === 'down' ? 'Failed contract - penalty to defenders' : 'Made with overtricks - bonus points'}
                        </div>
                        ${rubberScoring}
                    </div>
                    <div class="current-state">Enter number of ${modeText}</div>
                `;
                
            case 'scoring':
                const lastDetails = this.rubberState.lastContractDetails;
                const vulnerability = this.getCurrentVulnerabilityString();
                const vulnText = vulnerability === 'None' ? 'Non-Vul' : 
                               vulnerability === 'Both' ? 'Both Vul' : 
                               `${vulnerability} Vulnerable`;
                
                if (lastDetails) {
                    return `
                        <div class="title-score-row">
                            <div class="mode-title">${this.displayName}</div>
                            <div class="score-display">Games: ${this.rubberState.gamesWon.NS}-${this.rubberState.gamesWon.EW}</div>
                        </div>
                        <div class="game-content">
                            <div><strong>Deal ${this.currentDeal} completed:</strong></div>
                            <div style="margin: 8px 0; padding: 10px; background: rgba(52,152,219,0.2); border-radius: 6px; border: 1px solid #3498db;">
                                <div style="font-weight: bold; margin-bottom: 4px;">
                                    ${lastDetails.contract} by ${lastDetails.declarer} ${vulnText} = ${lastDetails.result}
                                </div>
                                <div style="font-size: 12px; color: #2c3e50;">
                                    Below line: ${lastDetails.belowLineScore} | Above line: ${lastDetails.aboveLineScore}
                                </div>
                                ${lastDetails.gameWon ? 
                                    '<div style="color: #f39c12; font-weight: bold; margin-top: 4px;">🎯 GAME WON!</div>' : ''
                                }
                            </div>
                            ${rubberScoring}
                        </div>
                        <div class="current-state">Press <strong>X</strong> to claim honors, or <strong>Deal</strong> for next hand</div>
                    `;
                }
                break;
                
            default:
                return '<div class="current-state">Loading...</div>';
        }
        
        return '<div class="current-state">Loading...</div>';
    }
    
    /**
     * Get enhanced status display for Rubber Bridge
     */
    getStatusDisplay() {
        const rubberStatus = this.getRubberStatus();
        const breakdown = this.getScoringBreakdown();
        const partScorePressure = this.getPartScorePressure();
        
        return {
            dealInfo: this.getDealInfo(),
            gamesWon: rubberStatus.gamesWon,
            vulnerability: rubberStatus.vulnerability,
            scores: breakdown.totals,
            partScores: breakdown.partScores,
            partScorePressure: partScorePressure,
            isComplete: rubberStatus.rubberComplete,
            winner: rubberStatus.rubberWinner
        };
    }
    
    /**
     * Get rubber progress visualization
     */
    getRubberProgressDisplay() {
        const rubberStatus = this.getRubberStatus();
        const breakdown = this.getScoringBreakdown();
        
        let progressHTML = `<div class="rubber-progress" style="margin: 10px 0;">`;
        progressHTML += `<div style="font-weight: bold; margin-bottom: 8px;">Rubber Progress:</div>`;
        
        // Games won display
        progressHTML += `<div style="display: flex; gap: 10px; justify-content: center; margin-bottom: 10px;">`;
        
        // NS games
        for (let i = 0; i < 2; i++) {
            const won = i < rubberStatus.gamesWon.NS;
            progressHTML += `
                <div style="
                    width: 40px;
                    height: 30px;
                    background: ${won ? '#27ae60' : '#ecf0f1'};
                    color: ${won ? 'white' : '#7f8c8d'};
                    border: 1px solid #bdc3c7;
                    border-radius: 4px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 12px;
                    font-weight: bold;
                ">
                    NS
                </div>
            `;
        }
        
        progressHTML += `<div style="width: 20px; text-align: center; line-height: 30px; font-weight: bold;">vs</div>`;
        
        // EW games
        for (let i = 0; i < 2; i++) {
            const won = i < rubberStatus.gamesWon.EW;
            progressHTML += `
                <div style="
                    width: 40px;
                    height: 30px;
                    background: ${won ? '#e74c3c' : '#ecf0f1'};
                    color: ${won ? 'white' : '#7f8c8d'};
                    border: 1px solid #bdc3c7;
                    border-radius: 4px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 12px;
                    font-weight: bold;
                ">
                    EW
                </div>
            `;
        }
        
        progressHTML += `</div>`;
        
        // Part-score progress
        progressHTML += `<div style="font-size: 11px; color: #7f8c8d; text-align: center;">`;
        progressHTML += `Part-scores: NS ${breakdown.partScores.NS}/100 | EW ${breakdown.partScores.EW}/100`;
        progressHTML += `</div>`;
        
        progressHTML += `</div>`;
        return progressHTML;
    }
    
    /**
     * Get compact rubber summary for mobile displays
     */
    getCompactRubberSummary() {
        const rubberStatus = this.getRubberStatus();
        const breakdown = this.getScoringBreakdown();
        
        return {
            games: `${rubberStatus.gamesWon.NS}-${rubberStatus.gamesWon.EW}`,
            vulnerability: this.getCurrentVulnerabilityString(),
            partScores: `${breakdown.partScores.NS}/${breakdown.partScores.EW}`,
            totals: `${breakdown.totals.NS}-${breakdown.totals.EW}`,
            isComplete: rubberStatus.rubberComplete,
            winner: rubberStatus.rubberWinner
        };
    }
    
    /**
     * Format vulnerability for display with rubber-specific styling
     */
    formatRubberVulnerabilityDisplay(vulnerability) {
        const vulnConfig = {
            'None': { text: 'All Fresh', color: '#95a5a6', bgColor: 'rgba(149, 165, 166, 0.1)' },
            'NS': { text: 'NS Vul', color: '#27ae60', bgColor: 'rgba(39, 174, 96, 0.1)' },
            'EW': { text: 'EW Vul', color: '#e74c3c', bgColor: 'rgba(231, 76, 60, 0.1)' },
            'Both': { text: 'Both Vul', color: '#f39c12', bgColor: 'rgba(243, 156, 18, 0.1)' }
        };
        
        const config = vulnConfig[vulnerability] || vulnConfig['None'];
        
        return `
            <span style="
                color: ${config.color};
                background: ${config.bgColor};
                padding: 2px 6px;
                border-radius: 3px;
                font-weight: bold;
                font-size: 11px;
                border: 1px solid ${config.color};
            ">
                ${config.text}
            </span>
        `;
    }
    
    /**
     * Get part-score progress bar HTML
     */
    getPartScoreProgressBar(side) {
        const breakdown = this.getScoringBreakdown();
        const points = breakdown.partScores[side];
        const percentage = Math.min(100, (points / 100) * 100);
        
        const color = side === 'NS' ? '#3498db' : '#e67e22';
        const bgColor = side === 'NS' ? 'rgba(52, 152, 219, 0.2)' : 'rgba(230, 126, 34, 0.2)';
        
        return `
            <div style="
                width: 100%;
                height: 20px;
                background: ${bgColor};
                border-radius: 10px;
                overflow: hidden;
                position: relative;
                margin: 4px 0;
            ">
                <div style="
                    width: ${percentage}%;
                    height: 100%;
                    background: ${color};
                    transition: width 0.3s ease;
                "></div>
                <div style="
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 11px;
                    font-weight: bold;
                    color: #2c3e50;
                ">
                    ${points}/100
                </div>
            </div>
        `;
    }
    
    /**
     * Get detailed contract display for current state
     */
    getContractDisplay() {
        const contract = this.currentContract;
        let display = '';
        
        if (contract.level) {
            display += contract.level;
        }
        if (contract.suit) {
            display += contract.suit;
        }
        if (contract.doubled) {
            display += ' ' + contract.doubled;
        }
        if (contract.declarer) {
            display += ' by ' + contract.declarer;
        }
        if (contract.result) {
            display += ' = ' + contract.result;
        }
        
        return display || 'No contract yet';
    }
    
    /**
     * Get current game phase description
     */
    getGamePhaseDescription() {
        if (this.rubberState.rubberComplete) {
            return `Rubber complete - ${this.rubberState.rubberWinner} wins`;
        }
        
        const totalGames = this.rubberState.gamesWon.NS + this.rubberState.gamesWon.EW;
        
        if (totalGames === 0) {
            return 'First rubber - both sides fresh';
        } else if (totalGames === 1) {
            const leader = this.rubberState.gamesWon.NS > this.rubberState.gamesWon.EW ? 'NS' : 'EW';
            return `Second game - ${leader} leads 1-0`;
        } else if (totalGames === 2) {
            if (this.rubberState.gamesWon.NS === 1 && this.rubberState.gamesWon.EW === 1) {
                return 'Deciding game - rubber tied 1-1';
            }
        }
        
        return 'Rubber in progress';
    }
    
    /**
     * Get strategic context for current situation  
     */
    getStrategicContext() {
        const partScorePressure = this.getPartScorePressure();
        const vulnerability = this.getCurrentVulnerabilityString();
        const context = [];
        
        // Part-score pressure
        if (partScorePressure.NS.pressure === 'high') {
            context.push(`NS close to game (${partScorePressure.NS.points}/100)`);
        }
        if (partScorePressure.EW.pressure === 'high') {
            context.push(`EW close to game (${partScorePressure.EW.points}/100)`);
        }
        
        // Vulnerability implications
        if (vulnerability === 'Both') {
            context.push('Both sides vulnerable - high stakes');
        } else if (vulnerability !== 'None') {
            context.push(`${vulnerability} vulnerable - asymmetric risk`);
        }
        
        // Rubber situation
        const gamePhase = this.getGamePhaseDescription();
        if (gamePhase.includes('Deciding game')) {
            context.push('Rubber deciding game - winner takes all');
        }
        
        return context;
    }
    
    /**
     * Get formatted deal summary for display
     */
    getFormattedDealSummary() {
        const dealInfo = this.getDealInfo();
        const gamePhase = this.getGamePhaseDescription();
        const strategicContext = this.getStrategicContext();
        
        let summary = `<div class="deal-summary">`;
        summary += `<div class="deal-info"><strong>${dealInfo}</strong></div>`;
        summary += `<div class="game-phase">${gamePhase}</div>`;
        
        if (strategicContext.length > 0) {
            summary += `<div class="strategic-context">`;
            strategicContext.forEach(context => {
                summary += `<div class="context-item">• ${context}</div>`;
            });
            summary += `</div>`;
        }
        
        summary += `</div>`;
        return summary;
    }
    
    /**
     * Get score comparison display
     */
    getScoreComparisonDisplay() {
        const breakdown = this.getScoringBreakdown();
        const totals = breakdown.totals;
        const margin = Math.abs(totals.NS - totals.EW);
        const leader = totals.NS > totals.EW ? 'NS' : totals.EW > totals.NS ? 'EW' : 'Tied';
        
        return {
            totals: totals,
            margin: margin,
            leader: leader,
            isClose: margin <= 50,
            isBlowout: margin >= 500
        };
    }
    
    /**
     * Get rubber milestone display
     */
    getRubberMilestoneDisplay() {
        const rubberStatus = this.getRubberStatus();
        const milestones = [];
        
        // Game milestones
        if (rubberStatus.gamesWon.NS === 1 && rubberStatus.gamesWon.EW === 0) {
            milestones.push({ type: 'game', message: 'NS leads 1-0 in rubber', color: '#27ae60' });
        } else if (rubberStatus.gamesWon.EW === 1 && rubberStatus.gamesWon.NS === 0) {
            milestones.push({ type: 'game', message: 'EW leads 1-0 in rubber', color: '#e74c3c' });
        } else if (rubberStatus.gamesWon.NS === 1 && rubberStatus.gamesWon.EW === 1) {
            milestones.push({ type: 'tied', message: 'Rubber tied 1-1 - decisive game!', color: '#f39c12' });
        }
        
        // Rubber completion
        if (rubberStatus.rubberComplete) {
            const rubberScore = rubberStatus.gamesWon[rubberStatus.rubberWinner] === 2 && 
                              rubberStatus.gamesWon[rubberStatus.rubberWinner === 'NS' ? 'EW' : 'NS'] === 0 ? '2-0' : '2-1';
            milestones.push({ 
                type: 'rubber', 
                message: `${rubberStatus.rubberWinner} wins rubber ${rubberScore}!`, 
                color: '#9b59b6' 
            });
        }
        
        return milestones;
    }
    
    /**
     * Cleanup when switching modes
     */
    cleanup() {
        console.log('🧹 Rubber Bridge cleanup completed');
        // Rubber Bridge doesn't have special UI elements to clean up
    }
// END SECTION NINE// SECTION TEN - Export and Final Methods
    /**
     * Get comprehensive rubber bridge game summary
     */
    getGameSummary() {
        const rubberStatus = this.getRubberStatus();
        const breakdown = this.getScoringBreakdown();
        const stats = this.getRubberStatistics();
        const partScorePressure = this.getPartScorePressure();
        
        return {
            mode: 'Rubber Bridge',
            currentStatus: {
                deal: this.currentDeal,
                gamesWon: rubberStatus.gamesWon,
                vulnerability: rubberStatus.vulnerability,
                partScores: breakdown.partScores,
                totals: breakdown.totals,
                rubberComplete: rubberStatus.rubberComplete,
                rubberWinner: rubberStatus.rubberWinner
            },
            statistics: stats,
            partScorePressure: partScorePressure,
            rubberComplete: rubberStatus.rubberComplete,
            recommendations: this.getRubberRecommendations(),
            breakPoints: this.getRubberBreakPoints(),
            efficiency: this.calculateRubberEfficiency()
        };
    }
    
    /**
     * Get natural break points in the rubber
     */
    getRubberBreakPoints() {
        const history = this.gameState.history.filter(deal => deal.mode === 'rubber');
        const breakPoints = [];
        
        // Find all game completions
        history.forEach((deal, index) => {
            if (deal.rubberScoring && deal.rubberScoring.gameWon) {
                const gamesWonAtTime = {
                    NS: history.slice(0, index + 1).filter(d => 
                        d.rubberScoring && d.rubberScoring.gameWon && 
                        (d.contract.declarer === 'N' || d.contract.declarer === 'S')
                    ).length,
                    EW: history.slice(0, index + 1).filter(d => 
                        d.rubberScoring && d.rubberScoring.gameWon && 
                        (d.contract.declarer === 'E' || d.contract.declarer === 'W')
                    ).length
                };
                
                breakPoints.push({
                    deal: deal.deal,
                    type: 'game',
                    winner: deal.scoringSide,
                    gamesWon: gamesWonAtTime,
                    description: `Game won by ${deal.scoringSide}`,
                    severity: 'minor'
                });
            }
            
            if (deal.rubberScoring && deal.rubberScoring.rubberComplete) {
                breakPoints.push({
                    deal: deal.deal,
                    type: 'rubber',
                    winner: deal.rubberScoring.rubberWinner,
                    description: `Rubber won by ${deal.rubberScoring.rubberWinner}`,
                    severity: 'major'
                });
            }
        });
        
        return breakPoints;
    }
    
    /**
     * Generate detailed rubber bridge report
     */
    generateRubberReport() {
        const summary = this.getGameSummary();
        const history = this.gameState.history.filter(deal => deal.mode === 'rubber');
        const breakdown = this.getScoringBreakdown();
        
        let report = `RUBBER BRIDGE GAME REPORT\n`;
        report += `Generated: ${new Date().toLocaleString()}\n`;
        report += `=====================================\n\n`;
        
        report += `CURRENT RUBBER STATUS:\n`;
        report += `Games Won: NS ${summary.currentStatus.gamesWon.NS} - EW ${summary.currentStatus.gamesWon.EW}\n`;
        report += `Vulnerability: NS ${summary.currentStatus.vulnerability.NS ? 'Vulnerable' : 'Fresh'}, EW ${summary.currentStatus.vulnerability.EW ? 'Vulnerable' : 'Fresh'}\n`;
        report += `Part Scores: NS ${summary.currentStatus.partScores.NS}/100, EW ${summary.currentStatus.partScores.EW}/100\n`;
        report += `Total Scores: NS ${summary.currentStatus.totals.NS}, EW ${summary.currentStatus.totals.EW}\n`;
        if (summary.rubberComplete) {
            report += `RUBBER COMPLETE - Winner: ${summary.currentStatus.rubberWinner}\n`;
        }
        report += `\n`;
        
        report += `RUBBER STATISTICS:\n`;
        report += `Total Deals: ${summary.statistics.totalDeals}\n`;
        report += `Contracts Made: ${summary.statistics.contractsMade}\n`;
        report += `Contracts Failed: ${summary.statistics.contractsFailed}\n`;
        report += `Honor Bonuses: ${summary.statistics.honorBonuses} (${summary.statistics.honorBonusValue} points)\n`;
        report += `Slams Bid: ${summary.statistics.slamsBid}\n`;
        report += `Doubles Played: ${summary.statistics.doublesPlayed}\n`;
        report += `Rubber Efficiency: ${(summary.efficiency * 100).toFixed(1)}% (games per deal)\n\n`;
        
        if (summary.breakPoints.length > 0) {
            report += `BREAK POINTS:\n`;
            summary.breakPoints.forEach(bp => {
                report += `Deal ${bp.deal}: ${bp.description}\n`;
            });
            report += `\n`;
        }
        
        report += `DEAL HISTORY:\n`;
        report += `Deal | Contract | Result | Score | Below | Above | Notes\n`;
        report += `-----|----------|--------|-------|-------|-------|------\n`;
        
        let dealNumber = 1;
        history.forEach(deal => {
            if (deal.honorBonus) {
                report += `     | Honor Bonus | +${deal.score} | ${deal.score} |   0   | ${deal.score} | ${deal.scoringSide}\n`;
            } else if (deal.rubberBonus) {
                report += `     | Rubber Bonus | +${deal.score} | ${deal.score} |   0   | ${deal.score} | ${deal.scoringSide} wins\n`;
            } else {
                const contract = deal.contract;
                const contractStr = `${contract.level}${contract.suit}${contract.doubled || ''}`;
                const rubberScoring = deal.rubberScoring || {};
                const notes = rubberScoring.gameWon ? 'GAME!' : '';
                
                report += `${dealNumber.toString().padStart(4)} | ${contractStr.padEnd(8)} | ${contract.result.padEnd(6)} | ${deal.score.toString().padStart(5)} | ${(rubberScoring.belowLine || 0).toString().padStart(5)} | ${(rubberScoring.aboveLine || 0).toString().padStart(5)} | ${notes}\n`;
                dealNumber++;
            }
        });
        
        return report;
    }
    
    /**
     * Setup teaching scenarios for rubber bridge
     */
    setupTeachingScenario(scenario) {
        const scenarios = {
            'fresh-rubber': {
                description: 'Start a fresh rubber - both sides non-vulnerable',
                setup: () => this.resetRubber(),
                setupMessage: 'Fresh rubber started - both sides non-vulnerable'
            },
            'game-point': {
                description: 'Game point situation - one side needs one game to win rubber',
                setup: () => {
                    this.resetRubber();
                    this.rubberState.gamesWon.NS = 1;
                    this.rubberState.gamesWon.EW = 1;
                    this.rubberState.vulnerability.NS = true;
                    this.rubberState.vulnerability.EW = true;
                },
                setupMessage: 'Game point! Both sides vulnerable - next game wins rubber'
            },
            'part-score-pressure': {
                description: 'Part-score pressure - both sides have significant part-scores',
                setup: () => {
                    this.resetRubber();
                    this.rubberState.partScores.NS = 60;
                    this.rubberState.partScores.EW = 70;
                    this.rubberState.belowLineScores.NS = 60;
                    this.rubberState.belowLineScores.EW = 70;
                    this.updateGameStateScores();
                },
                setupMessage: 'Part-score pressure! NS: 60/100, EW: 70/100'
            },
            'vulnerability-demo': {
                description: 'Demonstrate vulnerability effects - one side vulnerable',
                setup: () => {
                    this.resetRubber();
                    this.rubberState.gamesWon.NS = 1;
                    this.rubberState.vulnerability.NS = true;
                },
                setupMessage: 'Vulnerability demo - NS vulnerable, EW fresh'
            }
        };
        
        const config = scenarios[scenario];
        if (!config) {
            console.warn('Unknown rubber bridge teaching scenario:', scenario);
            return false;
        }
        
        config.setup();
        this.resetContract();
        this.inputState = 'level_selection';
        this.updateDisplay();
        
        console.log(`📚 Teaching scenario: ${config.description}`);
        this.bridgeApp.showMessage(config.setupMessage, 'info');
        
        return true;
    }
    
    /**
     * Calculate rubber bridge lesson value
     */
    calculateLessonValue() {
        const stats = this.getRubberStatistics();
        const partScorePressure = this.getPartScorePressure();
        const rubberStatus = this.getRubberStatus();
        
        let lessonValue = 0;
        
        // Basic engagement
        lessonValue += stats.totalDeals * 2;
        
        // Learning bonuses
        if (stats.honorBonuses > 0) lessonValue += 10; // Honor bonus understanding
        if (stats.slamsBid > 0) lessonValue += 15; // Slam bidding experience
        if (stats.doublesPlayed > 0) lessonValue += 8; // Doubling experience
        
        // Strategic understanding
        if (partScorePressure.NS.pressure === 'high' || partScorePressure.EW.pressure === 'high') {
            lessonValue += 12; // Part-score pressure experience
        }
        
        if (rubberStatus.gamesWon.NS > 0 && rubberStatus.gamesWon.EW > 0) {
            lessonValue += 20; // Competitive rubber experience
        }
        
        if (rubberStatus.rubberComplete) {
            lessonValue += 25; // Complete rubber experience
        }
        
        return Math.min(100, lessonValue); // Cap at 100
    }
    
    /**
     * Get rubber bridge insights for improvement
     */
    getRubberInsights() {
        const stats = this.getRubberStatistics();
        const efficiency = this.calculateRubberEfficiency();
        const insights = [];
        
        if (efficiency < 0.3) {
            insights.push({
                type: 'efficiency',
                message: 'Consider more aggressive game bidding',
                explanation: 'Low games-per-deal ratio suggests conservative bidding'
            });
        }
        
        if (stats.honorBonuses === 0 && stats.totalDeals > 5) {
            insights.push({
                type: 'honors',
                message: 'Remember to claim honor bonuses',
                explanation: 'Honor bonuses can add significant points above the line'
            });
        }
        
        if (stats.slamsBid === 0 && stats.totalDeals > 10) {
            insights.push({
                type: 'slams',
                message: 'Consider bidding slams with strong hands',
                explanation: 'Slam bonuses are substantial in rubber bridge'
            });
        }
        
        if (stats.contractsMade / stats.totalDeals < 0.5) {
            insights.push({
                type: 'bidding',
                message: 'Consider more conservative bidding',
                explanation: 'High failure rate suggests overbidding'
            });
        }
        
        return insights;
    }
    
    /**
     * Export comprehensive rubber bridge session data
     */
    exportRubberSession() {
        const gameData = this.exportRubberData();
        const sessionSummary = this.getGameSummary();
        const recommendations = this.getRubberRecommendations();
        const insights = this.getRubberInsights();
        
        return {
            ...gameData,
            sessionSummary: sessionSummary,
            recommendations: recommendations,
            insights: insights,
            lessonValue: this.calculateLessonValue(),
            textReport: this.generateRubberReport(),
            exportTimestamp: Date.now()
        };
    }
    
    /**
     * Import rubber bridge session data
     */
    importRubberSession(sessionData) {
        try {
            if (sessionData.mode !== 'rubber' || !sessionData.rubberState) {
                throw new Error('Invalid rubber bridge session data');
            }
            
            // Restore rubber state
            this.rubberState = {
                ...this.rubberState,
                ...sessionData.rubberState
            };
            
            // Restore game state
            if (sessionData.gameState) {
                this.currentDeal = sessionData.gameState.currentDeal || 1;
                this.gameState.scores = sessionData.gameState.scoreBreakdown?.totals || { NS: 0, EW: 0 };
            }
            
            // Restore history if available
            if (sessionData.history && Array.isArray(sessionData.history)) {
                this.gameState.history = sessionData.history.map(deal => ({
                    ...deal,
                    mode: 'rubber'
                }));
            }
            
            // Update display
            this.updateDisplay();
            
            console.log('✅ Rubber bridge session imported successfully');
            return { success: true, message: 'Session imported successfully' };
            
        } catch (error) {
            console.error('❌ Failed to import rubber bridge session:', error);
            return { success: false, message: 'Failed to import session: ' + error.message };
        }
    }
    
    /**
     * Validate rubber bridge session data
     */
    validateSessionData(sessionData) {
        const issues = [];
        
        // Check basic structure
        if (!sessionData || typeof sessionData !== 'object') {
            issues.push('Invalid session data format');
            return { valid: false, issues };
        }
        
        if (sessionData.mode !== 'rubber') {
            issues.push('Not a rubber bridge session');
        }
        
        if (!sessionData.rubberState) {
            issues.push('Missing rubber state data');
        } else {
            // Validate rubber state
            const rs = sessionData.rubberState;
            
            if (!rs.gamesWon || typeof rs.gamesWon.NS !== 'number' || typeof rs.gamesWon.EW !== 'number') {
                issues.push('Invalid games won data');
            }
            
            if (rs.gamesWon.NS > 2 || rs.gamesWon.EW > 2 || rs.gamesWon.NS < 0 || rs.gamesWon.EW < 0) {
                issues.push('Games won values out of range (0-2)');
            }
            
            if (!rs.vulnerability || typeof rs.vulnerability.NS !== 'boolean' || typeof rs.vulnerability.EW !== 'boolean') {
                issues.push('Invalid vulnerability data');
            }
        }
        
        if (sessionData.history && !Array.isArray(sessionData.history)) {
            issues.push('History data is not an array');
        }
        
        return {
            valid: issues.length === 0,
            issues: issues
        };
    }
    
    /**
     * Create rubber bridge backup data
     */
    createBackup() {
        return {
            timestamp: Date.now(),
            version: '1.0',
            mode: 'rubber',
            rubberState: JSON.parse(JSON.stringify(this.rubberState)),
            currentDeal: this.currentDeal,
            currentContract: JSON.parse(JSON.stringify(this.currentContract)),
            inputState: this.inputState,
            resultMode: this.resultMode,
            gameState: {
                scores: { ...this.gameState.scores },
                history: this.gameState.history.filter(deal => deal.mode === 'rubber'),
                currentDeal: this.currentDeal
            }
        };
    }
    
    /**
     * Restore from rubber bridge backup
     */
    restoreFromBackup(backupData) {
        try {
            const validation = this.validateSessionData(backupData);
            if (!validation.valid) {
                throw new Error('Invalid backup data: ' + validation.issues.join(', '));
            }
            
            // Restore state
            this.rubberState = { ...backupData.rubberState };
            this.currentDeal = backupData.currentDeal || 1;
            this.currentContract = { ...backupData.currentContract };
            this.inputState = backupData.inputState || 'level_selection';
            this.resultMode = backupData.resultMode || null;
            
            // Restore game state
            if (backupData.gameState) {
                this.gameState.scores = { ...backupData.gameState.scores };
                this.gameState.history = [...backupData.gameState.history];
                this.gameState.currentDeal = backupData.gameState.currentDeal;
            }
            
            this.updateDisplay();
            
            return { success: true, message: 'Backup restored successfully' };
            
        } catch (error) {
            console.error('❌ Failed to restore backup:', error);
            return { success: false, message: 'Failed to restore backup: ' + error.message };
        }
    }
    
    /**
     * Get rubber bridge performance analytics
     */
    getPerformanceAnalytics() {
        const stats = this.getRubberStatistics();
        const breakdown = this.getScoringBreakdown();
        const rubberStatus = this.getRubberStatus();
        const efficiency = this.calculateRubberEfficiency();
        
        return {
            overall: {
                totalDeals: stats.totalDeals,
                rubbersCompleted: stats.rubbersCompleted,
                efficiency: efficiency,
                lessonValue: this.calculateLessonValue()
            },
            contracts: {
                made: stats.contractsMade,
                failed: stats.contractsFailed,
                successRate: stats.totalDeals > 0 ? (stats.contractsMade / stats.totalDeals) * 100 : 0,
                doublesPlayed: stats.doublesPlayed,
                slamsBid: stats.slamsBid
            },
            bonuses: {
                honorBonuses: stats.honorBonuses,
                honorBonusValue: stats.honorBonusValue,
                rubberBonusValue: stats.rubberBonusValue,
                totalBonusValue: stats.honorBonusValue + stats.rubberBonusValue
            },
            currentRubber: {
                gamesWon: rubberStatus.gamesWon,
                partScores: breakdown.partScores,
                totals: breakdown.totals,
                isComplete: rubberStatus.rubberComplete,
                winner: rubberStatus.rubberWinner
            },
            insights: this.getRubberInsights(),
            recommendations: this.getRubberRecommendations()
        };
    }
    
    /**
     * Generate rubber bridge learning report
     */
    generateLearningReport() {
        const analytics = this.getPerformanceAnalytics();
        const insights = this.getRubberInsights();
        
        let report = `RUBBER BRIDGE LEARNING REPORT\n`;
        report += `Generated: ${new Date().toLocaleString()}\n`;
        report += `=====================================\n\n`;
        
        report += `PERFORMANCE SUMMARY:\n`;
        report += `Lesson Value: ${analytics.overall.lessonValue}/100\n`;
        report += `Deals Played: ${analytics.overall.totalDeals}\n`;
        report += `Rubber Efficiency: ${(analytics.overall.efficiency * 100).toFixed(1)}%\n`;
        report += `Contract Success Rate: ${analytics.contracts.successRate.toFixed(1)}%\n\n`;
        
        report += `LEARNING AREAS:\n`;
        if (insights.length > 0) {
            insights.forEach(insight => {
                report += `• ${insight.type.toUpperCase()}: ${insight.message}\n`;
                report += `  ${insight.explanation}\n\n`;
            });
        } else {
            report += `• Excellent performance across all areas!\n\n`;
        }
        
        report += `BONUS TRACKING:\n`;
        report += `Honor Bonuses Claimed: ${analytics.bonuses.honorBonuses} (${analytics.bonuses.honorBonusValue} points)\n`;
        report += `Rubber Bonuses Earned: ${analytics.bonuses.rubberBonusValue} points\n`;
        report += `Total Bonus Value: ${analytics.bonuses.totalBonusValue} points\n\n`;
        
        if (analytics.currentRubber.isComplete) {
            report += `CURRENT RUBBER: COMPLETE\n`;
            report += `Winner: ${analytics.currentRubber.winner}\n`;
            report += `Final Score: NS ${analytics.currentRubber.totals.NS} - EW ${analytics.currentRubber.totals.EW}\n`;
        } else {
            report += `CURRENT RUBBER: IN PROGRESS\n`;
            report += `Games Won: NS ${analytics.currentRubber.gamesWon.NS} - EW ${analytics.currentRubber.gamesWon.EW}\n`;
            report += `Part Scores: NS ${analytics.currentRubber.partScores.NS}/100 - EW ${analytics.currentRubber.partScores.EW}/100\n`;
        }
        
        return report;
    }
    
    /**
     * Final cleanup and module completion
     */
    destroy() {
        console.log('🎩 Destroying Rubber Bridge mode...');
        
        // Clean up any event listeners
        this.cleanup();
        
        // Clear references
        this.bridgeApp = null;
        this.gameState = null;
        this.rubberState = null;
        this.currentContract = null;
        
        console.log('✅ Rubber Bridge mode destroyed successfully');
    }
    
    /**
     * Get module information
     */
    getModuleInfo() {
        return {
            name: 'Rubber Bridge',
            displayName: '🎩 Rubber Bridge',
            version: '1.0',
            description: 'Classic rubber bridge with above/below line scoring',
            features: [
                'Above/below the line scoring system',
                'Game completion at 100+ below-line points',
                'Vulnerability after winning games',
                'Rubber completion (best of 3 games)',
                'Honor bonuses for A-K-Q-J-10',
                'Rubber bonuses: 500 (2-1) or 700 (2-0) points',
                'Part-score building across deals',
                'Teaching scenarios and analytics',
                'Mobile optimization with Pixel 9a fixes'
            ],
            author: 'Bridge Modes Calculator',
            lastModified: new Date().toISOString()
        };
    }
}

// Export for the new modular system
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RubberBridgeMode;
} else if (typeof window !== 'undefined') {
    window.RubberBridgeMode = RubberBridgeMode;
}

console.log('🎩 Rubber Bridge module loaded successfully with classic above/below line scoring');
// END SECTION TEN - RUBBER BRIDGE MODULE COMPLETE

