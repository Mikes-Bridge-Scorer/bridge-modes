// SECTION ONE - Header and Constructor
/**
 * Chicago Bridge Mode - 4-Deal Vulnerability Cycle Bridge (Enhanced)
 * MOBILE ENHANCED VERSION - Full touch support for all devices
 * Updated to work with new modular bridge system
 * 
 * Chicago Bridge combines standard bridge scoring with a structured 4-deal 
 * vulnerability cycle: None → NS → EW → Both → repeat. This provides 
 * predictable, fair vulnerability rotation with natural break points.
 * 
 * Enhanced with comprehensive dealer rotation and vulnerability display.
 */

class ChicagoBridgeMode extends BaseBridgeMode {
    constructor(bridgeApp) {
        super(bridgeApp);
        
        this.modeName = 'Chicago Bridge';
        this.displayName = '🌉 Chicago Bridge';
        
        // Chicago Bridge state
        this.currentContract = {
            level: null,
            suit: null,
            declarer: null,
            doubled: '',
            result: null
        };
        
        this.inputState = 'level_selection';
        this.resultMode = null; // 'down', 'plus'
        
        // Mobile detection
        this.isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        console.log('🌉 Chicago Bridge mode initialized with enhanced mobile support');
        
        // Initialize immediately
        this.initialize();
    }
// END SECTION ONE
// SECTION TWO - Core Methods
    /**
     * Initialize Chicago Bridge mode with proper vulnerability and dealer rotation
     */
    initialize() {
        console.log('🎯 Starting Chicago Bridge session');
        
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
        
        // Initialize dealer rotation (North=0, East=1, South=2, West=3)
        if (this.currentDealer === undefined) {
            this.currentDealer = (this.currentDeal - 1) % 4; // Starts with North (0) for deal 1
        }
        
        // Auto-vulnerability follows Chicago cycle based on deal number
        this.updateVulnerabilityAndDealer();
        
        // Start with level selection
        this.inputState = 'level_selection';
        this.resetContract();
        
        this.updateDisplay();
        
        console.log(`🎯 Deal ${this.currentDeal} initialized - Dealer: ${this.getDealerName()}, Vulnerability: ${this.vulnerability}`);
    }
    
    /**
     * Update vulnerability and dealer based on current deal (Chicago Bridge cycle)
     */
    updateVulnerabilityAndDealer() {
        // Dealer rotates: North(0), East(1), South(2), West(3)
        this.currentDealer = (this.currentDeal - 1) % 4;
        
        // Vulnerability follows Chicago cycle:
        // Deal 1: None Vulnerable (NV)
        // Deal 2: North-South Vulnerable (NS) 
        // Deal 3: East-West Vulnerable (EW)
        // Deal 4: Both Vulnerable (Both)
        const vulnCycle = ['NV', 'NS', 'EW', 'Both'];
        this.vulnerability = vulnCycle[(this.currentDeal - 1) % 4];
        
        console.log(`🔄 Updated - Deal ${this.currentDeal}: Dealer ${this.getDealerName()}, Vulnerability ${this.vulnerability}`);
    }
    
    /**
     * Get dealer name from dealer number
     */
    getDealerName() {
        const dealers = ['North', 'East', 'South', 'West'];
        return dealers[this.currentDealer] || 'North';
    }
    
    /**
     * Get dealer abbreviation
     */
    getDealerAbbreviation() {
        const dealers = ['N', 'E', 'S', 'W'];
        return dealers[this.currentDealer] || 'N';
    }
    
    /**
     * Check if a side is vulnerable
     */
    isVulnerable(declarer) {
        if (this.vulnerability === 'NV') return false;
        if (this.vulnerability === 'Both') return true;
        
        const isNS = declarer === 'N' || declarer === 'S';
        
        if (this.vulnerability === 'NS') return isNS;
        if (this.vulnerability === 'EW') return !isNS;
        
        return false;
    }
    
    /**
     * Check if declarer is vulnerable - used by scoring
     */
    isDeclarerVulnerable() {
        return this.isVulnerable(this.currentContract.declarer);
    }
    
    /**
     * Handle user input - integration with new system
     */
    handleInput(value) {
        console.log(`🎮 Chicago Bridge input: ${value} in state: ${this.inputState}`);
        
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
        
        // Handle other inputs
        this.handleAction(value);
    }
    
    /**
     * Vulnerability is auto-managed in Chicago Bridge - disable manual toggle
     */
    toggleVulnerability() {
        console.log('🚫 Manual vulnerability control not allowed in Chicago Bridge - uses auto cycle');
        
        // Show brief message to user about auto-vulnerability
        const vulnText = document.getElementById('vulnText');
        if (vulnText) {
            const originalText = vulnText.textContent;
            vulnText.textContent = 'AUTO';
            vulnText.style.color = '#3498db';
            vulnText.style.fontWeight = 'bold';
            
            setTimeout(() => {
                vulnText.textContent = originalText;
                vulnText.style.color = '';
                vulnText.style.fontWeight = '';
            }, 1500);
        }
        
        // Show informational message
        this.bridgeApp.showMessage('Chicago Bridge uses automatic vulnerability cycle (4-deal rotation)', 'info');
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
        if (value === 'DEAL') {
            this.nextDeal();
        }
    }
// END SECTION THREE
// SECTION FOUR - Contract Logic
    /**
     * Calculate score using standard Chicago Bridge rules
     */
    calculateScore() {
        const { level, suit, result, doubled, declarer } = this.currentContract;
        
        console.log(`💰 Calculating Chicago Bridge score for ${level}${suit}${doubled} by ${declarer} = ${result}`);
        
        // Basic suit values per trick
        const suitValues = { '♣': 20, '♦': 20, '♥': 30, '♠': 30, 'NT': 30 };
        let score = 0;
        
        if (result === '=' || result?.startsWith('+')) {
            // Contract made
            let basicScore = level * suitValues[suit];
            if (suit === 'NT') basicScore += 10; // NT first trick bonus
            
            // Handle doubling of basic score
            let contractScore = basicScore;
            if (doubled === 'X') contractScore = basicScore * 2;
            else if (doubled === 'XX') contractScore = basicScore * 4;
            
            score = contractScore;
            
            // Add overtricks
            if (result?.startsWith('+')) {
                const overtricks = parseInt(result.substring(1));
                let overtrickValue;
                
                if (doubled === '') {
                    // Undoubled overtricks
                    overtrickValue = suitValues[suit] * overtricks;
                } else {
                    // Doubled overtricks (100 NV, 200 Vul)
                    const isVulnerable = this.isDeclarerVulnerable();
                    overtrickValue = overtricks * (isVulnerable ? 200 : 100);
                    if (doubled === 'XX') overtrickValue *= 2;
                }
                score += overtrickValue;
            }
            
            // Game/Part-game bonus
            if (contractScore >= 100) {
                // Game made
                const isVulnerable = this.isDeclarerVulnerable();
                score += isVulnerable ? 500 : 300;
            } else {
                // Part-game
                score += 50;
            }
            
            // Double bonuses
            if (doubled === 'X') score += 50;
            else if (doubled === 'XX') score += 100;
            
        } else if (result?.startsWith('-')) {
            // Contract failed
            const undertricks = parseInt(result.substring(1));
            const isVulnerable = this.isDeclarerVulnerable();
            
            if (doubled === '') {
                // Undoubled penalties
                score = -undertricks * (isVulnerable ? 100 : 50);
            } else {
                // Doubled penalties
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
                score = -penalty;
            }
        }
        
        console.log(`📊 Final score: ${score} points`);
        return score;
    }
    
    /**
     * Calculate and record the score - Chicago Bridge version
     */
    calculateAndRecordScore() {
        const score = this.calculateScore();
        const declarerSide = ['N', 'S'].includes(this.currentContract.declarer) ? 'NS' : 'EW';
        
        console.log('📊 Before adding Chicago score - gameState.scores:', this.gameState.scores);
        console.log('📊 Score calculated:', score);
        console.log('📊 Declarer side:', declarerSide);
        
        // Store scores before attempting to add
        const scoresBefore = { ...this.gameState.scores };
        
        if (score >= 0) {
            // Made contract - points go to declarer side
            this.gameState.addScore(declarerSide, score);
            
            // Check if addScore worked, if not use direct update
            if (this.gameState.scores[declarerSide] === scoresBefore[declarerSide]) {
                console.log('🔧 addScore failed for declarer, using direct update');
                this.gameState.scores[declarerSide] += score;
            }
            console.log(`✅ Added ${score} to ${declarerSide}`);
        } else {
            // Failed contract - penalty points go to defending side
            const defendingSide = declarerSide === 'NS' ? 'EW' : 'NS';
            const penaltyPoints = Math.abs(score);
            this.gameState.addScore(defendingSide, penaltyPoints);
            
            // Check if addScore worked, if not use direct update
            if (this.gameState.scores[defendingSide] === scoresBefore[defendingSide]) {
                console.log('🔧 addScore failed for defenders, using direct update');
                this.gameState.scores[defendingSide] += penaltyPoints;
            }
            console.log(`✅ Added ${penaltyPoints} penalty to ${defendingSide}`);
        }
        
        console.log('📊 Final scores:', this.gameState.scores);
        
        // Record in history with original score for reference
        this.gameState.addDeal({
            deal: this.currentDeal,
            contract: { ...this.currentContract },
            score: score, // Keep original for display purposes
            actualScore: score >= 0 ? score : Math.abs(score), // Actual points awarded
            scoringSide: score >= 0 ? declarerSide : (declarerSide === 'NS' ? 'EW' : 'NS'),
            mode: 'chicago',
            vulnerability: this.vulnerability,
            dealer: this.getDealerAbbreviation(),
            cycleInfo: this.getCycleInfo()
        });
        
        // Increment deals for license tracking
        this.licenseManager.incrementDealsPlayed();
        
        console.log(`💾 Chicago Bridge score recorded: ${score >= 0 ? score + ' for ' + declarerSide : Math.abs(score) + ' penalty for ' + (declarerSide === 'NS' ? 'EW' : 'NS')}`);
    }
    
    /**
     * Get cycle position information
     */
    getCycleInfo() {
        const cycleNumber = Math.floor((this.currentDeal - 1) / 4) + 1;
        const cyclePosition = ((this.currentDeal - 1) % 4) + 1;
        
        return {
            cycleNumber: cycleNumber,
            cyclePosition: cyclePosition,
            totalDeals: this.currentDeal,
            isEndOfCycle: cyclePosition === 4
        };
    }
    
    /**
     * Get next cycle info for display
     */
    getNextCycleInfo() {
        const nextDeal = this.currentDeal + 1;
        const nextDealer = ['North', 'East', 'South', 'West'][(nextDeal - 1) % 4];
        const nextCyclePos = ((nextDeal - 1) % 4) + 1;
        const nextCycleNum = Math.floor((nextDeal - 1) / 4) + 1;
        const vulnerabilityCycle = ['None', 'NS', 'EW', 'Both'];
        const nextVuln = vulnerabilityCycle[(nextDeal - 1) % 4];
        const vulnDisplay = { 'None': 'None', 'NS': 'NS', 'EW': 'EW', 'Both': 'All' };
        
        return `Deal ${nextDeal} • Dealer: ${nextDealer} • Vuln: ${vulnDisplay[nextVuln]} • Cycle ${nextCycleNum} (${nextCyclePos}/4)`;
    }
// END SECTION FOUR
// SECTION FIVE - Game Management
    /**
     * Move to next deal with automatic Chicago vulnerability cycling
     */
    nextDeal() {
        console.log('🃏 Moving to next deal in Chicago cycle');
        
        this.currentDeal++;
        
        // CRITICAL: Update vulnerability and dealer for new deal
        this.updateVulnerabilityAndDealer();
        
        this.resetContract();
        this.inputState = 'level_selection';
        this.updateDisplay();
        
        // Check if we completed a 4-deal cycle
        const cycleInfo = this.getCycleInfo();
        if (cycleInfo.isEndOfCycle) {
            console.log(`🔄 Completed 4-deal Chicago cycle ${cycleInfo.cycleNumber}!`);
        }
        
        console.log(`🎯 Advanced to Deal ${this.currentDeal} - Dealer: ${this.getDealerName()}, Vulnerability: ${this.vulnerability}`);
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
                // Undo the last score and go back to result entry
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
     * Undo the last score entry
     */
    undoLastScore() {
        const lastEntry = this.gameState.getLastDeal();
        if (lastEntry && lastEntry.deal === this.currentDeal) {
            // Use the scoring side from the history entry
            const scoringSide = lastEntry.scoringSide || (['N', 'S'].includes(lastEntry.contract.declarer) ? 'NS' : 'EW');
            const pointsToRemove = lastEntry.actualScore || Math.abs(lastEntry.score);
            
            // Remove points from the scoring side
            this.gameState.scores[scoringSide] -= pointsToRemove;
            
            // Remove from history
            this.gameState.history.pop();
            
            console.log(`↩️ Undid Chicago Bridge score: ${pointsToRemove} from ${scoringSide}`);
        }
    }
    
    /**
     * Get active buttons for current state
     */
    getActiveButtons() {
        switch (this.inputState) {
            case 'level_selection':
                return ['1', '2', '3', '4', '5', '6', '7'];
                
            case 'suit_selection':
                return ['♣', '♦', '♥', '♠', 'NT'];
                
            case 'declarer_selection':
                const buttons = ['N', 'S', 'E', 'W', 'X'];
                // If declarer is selected, also allow result buttons
                if (this.currentContract.declarer) {
                    buttons.push('MADE', 'PLUS', 'DOWN');
                }
                return buttons;
                
            case 'result_type_selection':
                return ['MADE', 'PLUS', 'DOWN'];
                
            case 'result_number_selection':
                if (this.resultMode === 'down') {
                    return ['1', '2', '3', '4', '5', '6', '7'];
                } else if (this.resultMode === 'plus') {
                    const maxOvertricks = Math.min(6, 13 - (6 + this.currentContract.level));
                    const buttons = [];
                    for (let i = 1; i <= maxOvertricks; i++) {
                        buttons.push(i.toString());
                    }
                    return buttons;
                }
                break;
                
            case 'scoring':
                return ['DEAL'];
                
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
        activeButtons.push('BACK'); // Always allow going back
        
        this.bridgeApp.updateButtonStates(activeButtons);
    }
    
    /**
     * Update the vulnerability display in the UI control
     */
    updateVulnerabilityDisplay() {
        const vulnText = document.getElementById('vulnText');
        if (vulnText) {
            vulnText.textContent = this.vulnerability;
        }
    }
    
    /**
     * Check if back navigation is possible
     */
    canGoBack() {
        return this.inputState !== 'level_selection';
    }
// END SECTION FIVE
// SECTION SIX - Help and Quit Methods (UPDATED FOR STANDALONE HELP)
    /**
     * Show Chicago Bridge specific help - UPDATED TO USE STANDALONE HELP
     */
    showHelp() {
    if (this.bridgeApp.helpSystem) {
        this.bridgeApp.helpSystem.show('chicago');
    } else {
        console.warn('Help system not initialized');
    }
}
    
    /**
     * Show Chicago Bridge specific quit options
     */
    showQuit() {
        const scores = this.gameState.scores;
        const totalDeals = this.gameState.history.length;
        const licenseStatus = this.bridgeApp.licenseManager.checkLicenseStatus();
        const cycleInfo = this.getCycleInfo();
        
        let currentScoreContent = '';
        if (totalDeals > 0) {
            const leader = scores.NS > scores.EW ? 'North-South' : 
                          scores.EW > scores.NS ? 'East-West' : 'Tied';
            
            currentScoreContent = `
                <div class="help-section">
                    <h4>📊 Current Game Status</h4>
                    <p><strong>Deals Played:</strong> ${totalDeals}</p>
                    <p><strong>Current Cycle:</strong> ${cycleInfo.cycleNumber} (Position ${cycleInfo.cyclePosition}/4)</p>
                    <p><strong>Current Scores:</strong></p>
                    <ul>
                        <li>North-South: ${scores.NS} points</li>
                        <li>East-West: ${scores.EW} points</li>
                    </ul>
                    <p><strong>Current Leader:</strong> ${leader}</p>
                    ${cycleInfo.isEndOfCycle ? '<p style="color: #f39c12;"><strong>🔄 Cycle Complete!</strong> Natural break point.</p>' : ''}
                </div>
            `;
        }
        
        let licenseSection = '';
        if (licenseStatus.status === 'trial') {
            licenseSection = `
                <div class="help-section">
                    <h4>📅 License Status</h4>
                    <p><strong>Trial Version:</strong> ${licenseStatus.daysLeft} days, ${licenseStatus.dealsLeft} deals remaining</p>
                </div>
            `;
        }
        
        const content = `
            ${currentScoreContent}
            ${licenseSection}
            <div class="help-section">
                <h4>🎮 Game Options</h4>
                <p>What would you like to do?</p>
            </div>
        `;
        
        const buttons = [
            { text: 'Continue Playing', action: () => {}, class: 'continue-btn' },
            { text: 'Show Scores', action: () => this.showDetailedScores(), class: 'scores-btn' },
            { text: 'New Game', action: () => this.startNewGame(), class: 'new-game-btn' },
            { text: 'Return to Main Menu', action: () => this.returnToMainMenu(), class: 'menu-btn' },
            { text: 'Show Help', action: () => this.showHelp(), class: 'help-btn' }
        ];
        
        this.bridgeApp.showModal('🌉 Chicago Bridge Options', content, buttons);
    }
// END SECTION SIX

// NOTE: The following method should be REMOVED entirely from chicago.js:
// 
// /**
//  * Get help content specific to Chicago Bridge
//  */
// getHelpContent() {
//     return {
//         title: 'Chicago Bridge (4-Deal Cycle) Help',
//         content: `
//             // ... all the embedded help HTML content ...
//         `,
//         buttons: [
//             { text: 'Close Help', action: 'close', class: 'close-btn' }
//         ]
//     };
// }
//
// DELETE THE ENTIRE getHelpContent() method from your chicago.js file// SECTION SEVEN - Score Display Methods
    /**
     * Show detailed deal-by-deal scores with Chicago Bridge cycle analysis - WITH PIXEL 9A FIX
     */
    showDetailedScores() {
        const scores = this.gameState.scores;
        const history = this.gameState.history;
        
        if (history.length === 0) {
            this.bridgeApp.showModal('📊 Game Scores', '<p>No deals have been played yet.</p>');
            return;
        }

        let dealSummary = `
            <div class="scores-summary">
                <h4>📊 Current Totals</h4>
                <p><strong>North-South:</strong> ${scores.NS} points</p>
                <p><strong>East-West:</strong> ${scores.EW} points</p>
                <p><strong>Leader:</strong> ${scores.NS > scores.EW ? 'North-South' : scores.EW > scores.NS ? 'East-West' : 'Tied'}</p>
            </div>
            
            <div class="deals-history">
                <h4>🌉 Chicago Bridge - Deal by Deal</h4>
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
        
        // Group deals by cycles for better display
        const cycleGroups = {};
        history.forEach((deal, index) => {
            const cycleNum = Math.floor((deal.deal - 1) / 4) + 1;
            if (!cycleGroups[cycleNum]) {
                cycleGroups[cycleNum] = [];
            }
            cycleGroups[cycleNum].push({ ...deal, index });
        });
        
        // Display deals grouped by cycles
        Object.keys(cycleGroups).forEach(cycleNum => {
            const cycleDeals = cycleGroups[cycleNum];
            const isCompleteCycle = cycleDeals.length === 4;
            
            dealSummary += `
                <div style="
                    background: rgba(52, 152, 219, 0.1);
                    margin: 8px 4px;
                    padding: 8px;
                    border-radius: 6px;
                    border-left: 4px solid #3498db;
                ">
                    <div style="font-weight: bold; color: #2c3e50; margin-bottom: 6px; font-size: 13px;">
                        🔄 Cycle ${cycleNum} ${isCompleteCycle ? '(Complete)' : `(${cycleDeals.length}/4)`}
                    </div>
            `;
            
            cycleDeals.forEach((deal) => {
                const contract = deal.contract;
                const contractStr = `${contract.level}${contract.suit}${contract.doubled ? ' ' + contract.doubled : ''}`;
                const vulnerability = deal.vulnerability || 'NV';
                const dealer = deal.dealer || 'N';
                const scoreDisplay = deal.score >= 0 ? `+${deal.score}` : `${deal.score}`;
                const scoringSide = deal.scoringSide || (deal.score >= 0 ? 
                    (['N', 'S'].includes(contract.declarer) ? 'NS' : 'EW') :
                    (['N', 'S'].includes(contract.declarer) ? 'EW' : 'NS'));
                
                // Vulnerability color coding
                const vulnColor = vulnerability === 'NV' ? '#95a5a6' : 
                                 vulnerability === 'NS' ? '#27ae60' : 
                                 vulnerability === 'EW' ? '#e74c3c' : '#f39c12';
                
                dealSummary += `
                    <div style="
                        border-bottom: 1px solid #ddd; 
                        padding: 10px 6px; 
                        background: ${deal.index % 2 === 0 ? 'rgba(240,240,240,0.6)' : 'rgba(255,255,255,0.8)'};
                        margin: 2px 0;
                        border-radius: 4px;
                    ">
                        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                            <div style="flex: 1; min-width: 0;">
                                <div style="font-weight: bold; margin-bottom: 2px; color: #222; font-size: 12px;">
                                    Deal ${deal.deal} - Dealer ${dealer} - <span style="color: ${vulnColor};">${vulnerability}</span>
                                </div>
                                <div style="font-size: 11px; color: #333; font-weight: 500;">
                                    ${contractStr} by ${contract.declarer} = ${contract.result}
                                </div>
                            </div>
                            <div style="
                                text-align: right;
                                min-width: 70px;
                                font-size: 11px;
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
            });
            
            dealSummary += `</div>`;
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
                🌉 Chicago Bridge: 4-deal cycles with automatic vulnerability rotation<br>
                On mobile: Use Refresh Scroll if needed
            </div>
        `;
        
        const buttons = [
            { text: 'Back to Options', action: () => this.showQuit(), class: 'back-btn' },
            { text: 'Refresh Scroll', action: () => this.refreshScoreSheet(), class: 'refresh-btn' },
            { text: 'Continue Playing', action: () => {}, class: 'continue-btn' }
        ];
        
        this.bridgeApp.showModal('📊 Chicago Bridge - Detailed Analysis', dealSummary, buttons);
        
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
// END SECTION SEVEN
// SECTION EIGHT - Utility and Game Management
    /**
     * Start a new game (reset scores and cycles)
     */
    startNewGame() {
        const confirmed = confirm(
            'Start a new Chicago Bridge game?\n\nThis will reset all scores to zero and start a new 4-deal cycle.\n\nClick OK to start new game, Cancel to continue current game.'
        );
        
        if (confirmed) {
            // Reset all scores and history
            this.gameState.scores = { NS: 0, EW: 0 };
            this.gameState.history = [];
            this.currentDeal = 1;
            
            // Reset vulnerability and dealer for deal 1
            this.updateVulnerabilityAndDealer();
            
            // Reset to level selection
            this.resetContract();
            this.inputState = 'level_selection';
            this.updateDisplay();
            
            console.log('🆕 New Chicago Bridge game started - Cycle 1 begins');
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
        const dealerName = this.getDealerName();
        return `Deal ${this.currentDeal} - Dealer ${dealerName} - ${this.vulnerability}`;
    }
    
    /**
     * Get current cycle summary for status displays
     */
    getCycleSummary() {
        const cycleInfo = this.getCycleInfo();
        return `Cycle ${cycleInfo.cycleNumber} (${cycleInfo.cyclePosition}/4)`;
    }
    
    /**
     * Check if current deal is at a natural break point (end of cycle)
     */
    isAtCycleBreak() {
        const cycleInfo = this.getCycleInfo();
        return cycleInfo.isEndOfCycle;
    }
    
    /**
     * Get deals remaining in current cycle
     */
    getDealsRemainingInCycle() {
        const cycleInfo = this.getCycleInfo();
        return 4 - cycleInfo.cyclePosition;
    }
    
    /**
     * Get vulnerability schedule for current cycle
     */
    getVulnerabilitySchedule() {
        const cycleInfo = this.getCycleInfo();
        const baseDealer = (cycleInfo.cycleNumber - 1) * 4 + 1;
        
        const schedule = [];
        for (let i = 0; i < 4; i++) {
            const dealNumber = baseDealer + i;
            const dealer = ['North', 'East', 'South', 'West'][i];
            const vulnerability = ['None', 'NS', 'EW', 'Both'][i];
            const isCurrentDeal = dealNumber === this.currentDeal;
            
            schedule.push({
                dealNumber,
                dealer,
                vulnerability,
                isCurrentDeal,
                isCompleted: dealNumber < this.currentDeal
            });
        }
        
        return schedule;
    }
    
    /**
     * Cleanup when switching modes
     */
    cleanup() {
        console.log('🧹 Chicago Bridge cleanup completed');
        // Chicago Bridge doesn't have special UI elements to clean up like some other modes
    }
    
    /**
     * Export game data for external use
     */
    exportGameData() {
        const cycleInfo = this.getCycleInfo();
        const scores = this.gameState.scores;
        const history = this.gameState.history;
        
        return {
            mode: 'chicago',
            version: '1.0',
            exportDate: new Date().toISOString(),
            gameState: {
                currentDeal: this.currentDeal,
                currentCycle: cycleInfo,
                scores: { ...scores },
                totalDeals: history.length
            },
            history: history.map(deal => ({
                deal: deal.deal,
                dealer: deal.dealer,
                vulnerability: deal.vulnerability,
                contract: { ...deal.contract },
                result: deal.contract.result,
                score: deal.score,
                scoringSide: deal.scoringSide,
                cycleInfo: deal.cycleInfo
            })),
            statistics: this.getGameStatistics()
        };
    }
    
    /**
     * Get game statistics for analysis
     */
    getGameStatistics() {
        const history = this.gameState.history;
        const scores = this.gameState.scores;
        
        if (history.length === 0) {
            return {
                totalDeals: 0,
                cyclesCompleted: 0,
                averageScore: { NS: 0, EW: 0 }
            };
        }
        
        const stats = {
            totalDeals: history.length,
            cyclesCompleted: Math.floor(history.length / 4),
            currentCycleProgress: (history.length % 4),
            scores: { ...scores },
            averageScore: {
                NS: Math.round(scores.NS / history.length),
                EW: Math.round(scores.EW / history.length)
            },
            dealsByVulnerability: {
                NV: history.filter(d => d.vulnerability === 'NV').length,
                NS: history.filter(d => d.vulnerability === 'NS').length,
                EW: history.filter(d => d.vulnerability === 'EW').length,
                Both: history.filter(d => d.vulnerability === 'Both').length
            },
            contractsMade: history.filter(d => d.score >= 0).length,
            contractsFailed: history.filter(d => d.score < 0).length,
            highestScore: Math.max(...history.map(d => Math.abs(d.score))),
            gamesPlayed: history.filter(d => {
                const contract = d.contract;
                const level = contract.level;
                const suit = contract.suit;
                return (level === 3 && suit === 'NT') ||
                       (level === 4 && (suit === '♥' || suit === '♠')) ||
                       (level === 5 && (suit === '♣' || suit === '♦')) ||
                       level >= 6;
            }).length
        };
        
        return stats;
    }
    
    /**
     * Validate game state consistency
     */
    validateGameState() {
        const issues = [];
        
        // Check deal sequence
        if (this.currentDeal < 1) {
            issues.push('Invalid current deal number');
        }
        
        // Check vulnerability matches deal
        const expectedVuln = ['NV', 'NS', 'EW', 'Both'][(this.currentDeal - 1) % 4];
        if (this.vulnerability !== expectedVuln) {
            issues.push(`Vulnerability mismatch: expected ${expectedVuln}, got ${this.vulnerability}`);
        }
        
        // Check dealer matches deal
        const expectedDealer = (this.currentDeal - 1) % 4;
        if (this.currentDealer !== expectedDealer) {
            issues.push(`Dealer mismatch: expected ${expectedDealer}, got ${this.currentDealer}`);
        }
        
        // Check score consistency
        const calculatedScores = { NS: 0, EW: 0 };
        this.gameState.history.forEach(deal => {
            const side = deal.scoringSide;
            const points = deal.actualScore || Math.abs(deal.score);
            if (side && points) {
                calculatedScores[side] += points;
            }
        });
        
        if (calculatedScores.NS !== this.gameState.scores.NS) {
            issues.push(`NS score mismatch: calculated ${calculatedScores.NS}, stored ${this.gameState.scores.NS}`);
        }
        
        if (calculatedScores.EW !== this.gameState.scores.EW) {
            issues.push(`EW score mismatch: calculated ${calculatedScores.EW}, stored ${this.gameState.scores.EW}`);
        }
        
        if (issues.length > 0) {
            console.warn('🚨 Chicago Bridge game state validation issues:', issues);
            return { valid: false, issues };
        }
        
        console.log('✅ Chicago Bridge game state validation passed');
        return { valid: true, issues: [] };
    }
// END SECTION EIGHT
// SECTION NINE - Display Content Methods
    /**
     * Get display content for current state - CHICAGO BRIDGE ENHANCED
     */
    getDisplayContent() {
        const scores = this.gameState.scores;
        const cycleInfo = this.getCycleInfo();
        const dealInfo = this.getDealInfo();
        
        switch (this.inputState) {
            case 'level_selection':
                return `
                    <div class="title-score-row">
                        <div class="mode-title">${this.displayName}</div>
                        <div class="score-display">
                            NS: ${scores.NS}<br>
                            EW: ${scores.EW}
                        </div>
                    </div>
                    <div class="game-content">
                        <div><strong>${dealInfo}</strong></div>
                        <div style="color: #3498db; font-size: 12px; margin-top: 4px;">
                            Cycle ${cycleInfo.cycleNumber} (${cycleInfo.cyclePosition}/4) • Auto vulnerability cycle
                        </div>
                    </div>
                    <div class="current-state">Select bid level (1-7)</div>
                `;
                
            case 'suit_selection':
                return `
                    <div class="title-score-row">
                        <div class="mode-title">${this.displayName}</div>
                        <div class="score-display">
                            NS: ${scores.NS}<br>
                            EW: ${scores.EW}
                        </div>
                    </div>
                    <div class="game-content">
                        <div><strong>${dealInfo}</strong></div>
                        <div><strong>Level: ${this.currentContract.level}</strong></div>
                        <div style="color: #3498db; font-size: 12px;">
                            Cycle ${cycleInfo.cycleNumber} (${cycleInfo.cyclePosition}/4)
                        </div>
                    </div>
                    <div class="current-state">Select suit</div>
                `;
                
            case 'declarer_selection':
                const contractSoFar = `${this.currentContract.level}${this.currentContract.suit}`;
                const doubleText = this.currentContract.doubled ? ` ${this.currentContract.doubled}` : '';
                
                return `
                    <div class="title-score-row">
                        <div class="mode-title">${this.displayName}</div>
                        <div class="score-display">
                            NS: ${scores.NS}<br>
                            EW: ${scores.EW}
                        </div>
                    </div>
                    <div class="game-content">
                        <div><strong>${dealInfo}</strong></div>
                        <div><strong>Contract: ${contractSoFar}${doubleText}</strong></div>
                        <div style="color: #3498db; font-size: 12px;">
                            Cycle ${cycleInfo.cycleNumber} (${cycleInfo.cyclePosition}/4)
                        </div>
                    </div>
                    <div class="current-state">
                        ${this.currentContract.declarer ? 
                            'Press Made/Plus/Down for result, or X for double/redouble' : 
                            'Select declarer (N/S/E/W)'}
                    </div>
                `;
                
            case 'result_type_selection':
                const contract = `${this.currentContract.level}${this.currentContract.suit}${this.currentContract.doubled}`;
                return `
                    <div class="title-score-row">
                        <div class="mode-title">${this.displayName}</div>
                        <div class="score-display">
                            NS: ${scores.NS}<br>
                            EW: ${scores.EW}
                        </div>
                    </div>
                    <div class="game-content">
                        <div><strong>${dealInfo}</strong></div>
                        <div><strong>Contract: ${contract} by ${this.currentContract.declarer}</strong></div>
                        <div style="color: #3498db; font-size: 12px;">
                            Cycle ${cycleInfo.cycleNumber} (${cycleInfo.cyclePosition}/4)
                        </div>
                    </div>
                    <div class="current-state">Made exactly, Plus overtricks, or Down?</div>
                `;
                
            case 'result_number_selection':
                const fullContract = `${this.currentContract.level}${this.currentContract.suit}${this.currentContract.doubled}`;
                const modeText = this.resultMode === 'down' ? 'tricks down (1-7)' : 'overtricks (1-6)';
                return `
                    <div class="title-score-row">
                        <div class="mode-title">${this.displayName}</div>
                        <div class="score-display">
                            NS: ${scores.NS}<br>
                            EW: ${scores.EW}
                        </div>
                    </div>
                    <div class="game-content">
                        <div><strong>${dealInfo}</strong></div>
                        <div><strong>Contract: ${fullContract} by ${this.currentContract.declarer}</strong></div>
                        <div style="color: #3498db; font-size: 12px;">
                            Cycle ${cycleInfo.cycleNumber} (${cycleInfo.cyclePosition}/4)
                        </div>
                    </div>
                    <div class="current-state">Enter number of ${modeText}</div>
                `;
                
            case 'scoring':
                const lastEntry = this.gameState.getLastDeal();
                if (lastEntry) {
                    const contractDisplay = `${lastEntry.contract.level}${lastEntry.contract.suit}${lastEntry.contract.doubled}`;
                    const nextCycleInfo = this.getNextCycleInfo();
                    const vulnerability = lastEntry.vulnerability || 'NV';
                    const vulnText = vulnerability === 'NV' ? 'Non-Vul' : 
                                   vulnerability === 'Both' ? 'Vulnerable' : 
                                   `${vulnerability} Vulnerable`;
                    
                    // Show who scored
                    const declarerSide = ['N', 'S'].includes(lastEntry.contract.declarer) ? 'NS' : 'EW';
                    const scoreAmount = Math.abs(lastEntry.score);
                    const scoringSide = lastEntry.score >= 0 ? declarerSide : (declarerSide === 'NS' ? 'EW' : 'NS');
                    
                    // Check if cycle is complete
                    const completedCycleInfo = this.getCycleInfo();
                    const isCycleComplete = completedCycleInfo.isEndOfCycle;
                    
                    return `
                        <div class="title-score-row">
                            <div class="mode-title">${this.displayName}</div>
                            <div class="score-display">
                                NS: ${scores.NS}<br>
                                EW: ${scores.EW}
                            </div>
                        </div>
                        <div class="game-content">
                            <div><strong>Deal ${lastEntry.deal} completed:</strong><br>
                            <strong>${contractDisplay} by ${lastEntry.contract.declarer} ${vulnText}</strong><br>
                            <span style="color: ${lastEntry.score >= 0 ? '#27ae60' : '#e74c3c'};">
                                Score: ${lastEntry.score >= 0 ? '+' : ''}${lastEntry.score} for ${scoringSide}
                            </span></div>
                            ${isCycleComplete ? 
                                '<div style="color: #f39c12; font-size: 12px; margin-top: 4px; font-weight: bold;">🔄 Cycle Complete! Natural break point.</div>' : 
                                '<div style="color: #95a5a6; font-size: 11px; margin-top: 4px;">Next: ' + nextCycleInfo + '</div>'
                            }
                        </div>
                        <div class="current-state">Press Deal for next hand</div>
                    `;
                }
                break;
                
            default:
                return '<div class="current-state">Loading...</div>';
        }
    }
    
    /**
     * Get enhanced status display for Chicago Bridge
     */
    getStatusDisplay() {
        const cycleInfo = this.getCycleInfo();
        const dealInfo = this.getDealInfo();
        const scores = this.gameState.scores;
        
        return {
            dealInfo: dealInfo,
            cycleInfo: `Cycle ${cycleInfo.cycleNumber} (${cycleInfo.cyclePosition}/4)`,
            scores: scores,
            isEndOfCycle: cycleInfo.isEndOfCycle,
            nextDealPreview: this.getNextCycleInfo()
        };
    }
    
    /**
     * Get cycle progress visualization
     */
    getCycleProgressDisplay() {
        const cycleInfo = this.getCycleInfo();
        const schedule = this.getVulnerabilitySchedule();
        
        let progressHTML = `<div class="cycle-progress" style="margin: 10px 0;">`;
        progressHTML += `<div style="font-weight: bold; margin-bottom: 8px;">Cycle ${cycleInfo.cycleNumber} Progress:</div>`;
        progressHTML += `<div style="display: flex; gap: 4px; justify-content: center;">`;
        
        schedule.forEach((deal, index) => {
            const vulnColors = {
                'None': '#95a5a6',
                'NS': '#27ae60', 
                'EW': '#e74c3c',
                'Both': '#f39c12'
            };
            
            const bgColor = deal.isCompleted ? vulnColors[deal.vulnerability] : 
                           deal.isCurrentDeal ? vulnColors[deal.vulnerability] : '#ecf0f1';
            const textColor = deal.isCompleted || deal.isCurrentDeal ? 'white' : '#7f8c8d';
            const border = deal.isCurrentDeal ? '2px solid #3498db' : '1px solid #bdc3c7';
            
            progressHTML += `
                <div style="
                    width: 60px;
                    height: 40px;
                    background: ${bgColor};
                    color: ${textColor};
                    border: ${border};
                    border-radius: 4px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    font-size: 10px;
                    font-weight: bold;
                ">
                    <div>D${deal.dealNumber}</div>
                    <div>${deal.vulnerability}</div>
                </div>
            `;
        });
        
        progressHTML += `</div></div>`;
        return progressHTML;
    }
    
    /**
     * Get compact deal summary for mobile displays
     */
    getCompactDealSummary() {
        const cycleInfo = this.getCycleInfo();
        const remainingDeals = this.getDealsRemainingInCycle();
        
        return {
            current: `D${this.currentDeal} (${this.getDealerAbbreviation()}) ${this.vulnerability}`,
            cycle: `${cycleInfo.cyclePosition}/4`,
            remaining: remainingDeals,
            isBreakPoint: cycleInfo.isEndOfCycle
        };
    }
    
    /**
     * Format vulnerability for display with appropriate styling
     */
    formatVulnerabilityDisplay(vulnerability) {
        const vulnConfig = {
            'NV': { text: 'None', color: '#95a5a6', bgColor: 'rgba(149, 165, 166, 0.1)' },
            'NS': { text: 'NS Vul', color: '#27ae60', bgColor: 'rgba(39, 174, 96, 0.1)' },
            'EW': { text: 'EW Vul', color: '#e74c3c', bgColor: 'rgba(231, 76, 60, 0.1)' },
            'Both': { text: 'Both Vul', color: '#f39c12', bgColor: 'rgba(243, 156, 18, 0.1)' }
        };
        
        const config = vulnConfig[vulnerability] || vulnConfig['NV'];
        
        return `
            <span style="
                color: ${config.color};
                background: ${config.bgColor};
                padding: 2px 6px;
                border-radius: 3px;
                font-weight: bold;
                font-size: 11px;
            ">
                ${config.text}
            </span>
        `;
    }
// END SECTION NINE
// SECTION TEN - Export and Final Methods
    /**
     * Get cycle-aware game summary for external display
     */
    getGameSummary() {
        const scores = this.gameState.scores;
        const history = this.gameState.history;
        const cycleInfo = this.getCycleInfo();
        const stats = this.getGameStatistics();
        
        return {
            mode: 'Chicago Bridge',
            currentStatus: {
                deal: this.currentDeal,
                dealer: this.getDealerName(),
                vulnerability: this.vulnerability,
                cycle: cycleInfo,
                scores: { ...scores }
            },
            statistics: stats,
            cycleBreaks: this.getCycleBreakPoints(),
            gameComplete: false, // Chicago Bridge can continue indefinitely
            recommendations: this.getGameRecommendations()
        };
    }
    
    /**
     * Get natural break points in the game
     */
    getCycleBreakPoints() {
        const history = this.gameState.history;
        const breakPoints = [];
        
        for (let i = 4; i <= history.length; i += 4) {
            const cycleNum = i / 4;
            const cycleDeals = history.slice(i - 4, i);
            const cycleScores = { NS: 0, EW: 0 };
            
            cycleDeals.forEach(deal => {
                const side = deal.scoringSide;
                const points = deal.actualScore || Math.abs(deal.score);
                if (side && points) {
                    cycleScores[side] += points;
                }
            });
            
            breakPoints.push({
                cycle: cycleNum,
                dealsCompleted: i,
                cycleScores: cycleScores,
                cumulativeScores: {
                    NS: history.slice(0, i).reduce((sum, deal) => {
                        return sum + (deal.scoringSide === 'NS' ? (deal.actualScore || Math.abs(deal.score)) : 0);
                    }, 0),
                    EW: history.slice(0, i).reduce((sum, deal) => {
                        return sum + (deal.scoringSide === 'EW' ? (deal.actualScore || Math.abs(deal.score)) : 0);
                    }, 0)
                }
            });
        }
        
        return breakPoints;
    }
    
    /**
     * Get game recommendations based on current state
     */
    getGameRecommendations() {
        const cycleInfo = this.getCycleInfo();
        const scores = this.gameState.scores;
        const recommendations = [];
        
        if (cycleInfo.isEndOfCycle) {
            recommendations.push({
                type: 'break',
                message: 'Natural break point - cycle complete!',
                action: 'Consider taking a break or reviewing scores'
            });
        }
        
        const scoreDiff = Math.abs(scores.NS - scores.EW);
        if (scoreDiff > 1000) {
            recommendations.push({
                type: 'score',
                message: 'Large score difference detected',
                action: 'Consider starting a new game for closer competition'
            });
        }
        
        if (cycleInfo.cycleNumber >= 3) {
            recommendations.push({
                type: 'session',
                message: 'Long session detected',
                action: 'Good stopping point after this cycle'
            });
        }
        
        return recommendations;
    }
    
    /**
     * Generate detailed game report
     */
    generateGameReport() {
        const summary = this.getGameSummary();
        const history = this.gameState.history;
        
        let report = `CHICAGO BRIDGE GAME REPORT\n`;
        report += `Generated: ${new Date().toLocaleString()}\n`;
        report += `=====================================\n\n`;
        
        report += `CURRENT STATUS:\n`;
        report += `Deal ${summary.currentStatus.deal} - Dealer ${summary.currentStatus.dealer} - ${summary.currentStatus.vulnerability}\n`;
        report += `Cycle ${summary.currentStatus.cycle.cycleNumber} (Position ${summary.currentStatus.cycle.cyclePosition}/4)\n`;
        report += `Scores: NS ${summary.currentStatus.scores.NS}, EW ${summary.currentStatus.scores.EW}\n\n`;
        
        report += `GAME STATISTICS:\n`;
        report += `Total Deals: ${summary.statistics.totalDeals}\n`;
        report += `Cycles Completed: ${summary.statistics.cyclesCompleted}\n`;
        report += `Contracts Made: ${summary.statistics.contractsMade}\n`;
        report += `Contracts Failed: ${summary.statistics.contractsFailed}\n`;
        report += `Games Bid: ${summary.statistics.gamesPlayed}\n`;
        report += `Highest Score: ${summary.statistics.highestScore}\n\n`;
        
        if (summary.cycleBreaks.length > 0) {
            report += `CYCLE BREAK POINTS:\n`;
            summary.cycleBreaks.forEach(bp => {
                report += `Cycle ${bp.cycle}: NS ${bp.cumulativeScores.NS}, EW ${bp.cumulativeScores.EW}\n`;
            });
            report += `\n`;
        }
        
        report += `DEAL HISTORY:\n`;
        history.forEach(deal => {
            const contract = deal.contract;
            const contractStr = `${contract.level}${contract.suit}${contract.doubled || ''}`;
            report += `Deal ${deal.deal}: ${contractStr} by ${contract.declarer} = ${contract.result}, Score: ${deal.score}\n`;
        });
        
        return report;
    }
    
    /**
     * Reset to a specific cycle for teaching/practice
     */
    resetToCycle(cycleNumber) {
        if (cycleNumber < 1) {
            console.warn('Invalid cycle number');
            return false;
        }
        
        const startDeal = ((cycleNumber - 1) * 4) + 1;
        
        // Reset game state
        this.currentDeal = startDeal;
        this.updateVulnerabilityAndDealer();
        this.resetContract();
        this.inputState = 'level_selection';
        
        // Clear any deals from this cycle onward
        this.gameState.history = this.gameState.history.filter(deal => deal.deal < startDeal);
        
        // Recalculate scores
        this.gameState.scores = { NS: 0, EW: 0 };
        this.gameState.history.forEach(deal => {
            const side = deal.scoringSide;
            const points = deal.actualScore || Math.abs(deal.score);
            if (side && points) {
                this.gameState.scores[side] += points;
            }
        });
        
        this.updateDisplay();
        
        console.log(`🔄 Reset to Cycle ${cycleNumber}, Deal ${startDeal}`);
        return true;
    }
    
    /**
     * Quick setup for teaching scenarios
     */
    setupTeachingScenario(scenario) {
        const scenarios = {
            'vulnerability-demo': {
                description: 'Demonstrate all vulnerability conditions',
                startDeal: 1,
                setupMessage: 'Starting vulnerability demonstration cycle'
            },
            'game-contracts': {
                description: 'Practice game contracts in different vulnerabilities', 
                startDeal: 1,
                setupMessage: 'Ready for game contract practice'
            },
            'penalty-doubles': {
                description: 'Learn penalty scoring across vulnerabilities',
                startDeal: 1,
                setupMessage: 'Set up for penalty double practice'
            }
        };
        
        const config = scenarios[scenario];
        if (!config) {
            console.warn('Unknown teaching scenario:', scenario);
            return false;
        }
        
        this.resetToCycle(Math.floor((config.startDeal - 1) / 4) + 1);
        
        console.log(`📚 Teaching scenario: ${config.description}`);
        this.bridgeApp.showMessage(config.setupMessage, 'info');
        
        return true;
    }
    
    /**
     * Cleanup when switching modes
     */
    cleanup() {
        console.log('🧹 Chicago Bridge cleanup completed');
        // Chicago Bridge doesn't have special UI elements to clean up
    }
}

// Export for the new module system
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ChicagoBridgeMode;
} else if (typeof window !== 'undefined') {
    window.ChicagoBridgeMode = ChicagoBridgeMode;
}

console.log('🌉 Chicago Bridge module loaded successfully with 4-deal cycle management');
// END SECTION TEN - FILE COMPLETE

