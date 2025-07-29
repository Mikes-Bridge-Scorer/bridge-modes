/**
 * Kitchen Bridge Mode - Simplified Social Bridge Scoring (Enhanced)
 * MOBILE ENHANCED VERSION - Full touch support for all devices
 * Updated to work with new modular bridge system
 */

class KitchenBridgeMode extends BaseBridgeMode {
    constructor(bridgeApp) {
        super(bridgeApp);
        
        this.modeName = 'Kitchen Bridge';
        this.displayName = '🍳 Kitchen Bridge';
        
        // Kitchen Bridge state
        this.currentContract = {
            level: null,
            suit: null,
            declarer: null,
            doubled: '',
            result: null
        };
        
        this.inputState = 'level_selection';
        this.resultMode = null; // 'down', 'plus'
        
        console.log('🏠 Kitchen Bridge mode initialized with enhanced mobile support');
        
        // Initialize immediately
        this.initialize();
    }
    
    /**
     * Initialize Kitchen Bridge mode
     */
    initialize() {
        console.log('🎯 Starting Kitchen Bridge session');
        
        // Start with level selection
        this.inputState = 'level_selection';
        this.resetContract();
        
        this.updateDisplay();
    }
    
    /**
     * Handle user input - integration with new system
     */
    handleInput(value) {
        console.log(`🎮 Kitchen Bridge input: ${value} in state: ${this.inputState}`);
        
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
        
        // Handle other inputs
        this.handleAction(value);
    }
    
    /**
     * Override vulnerability toggle to work with Kitchen Bridge
     */
    toggleVulnerability() {
        const states = ['NV', 'NS', 'EW', 'Both'];
        const current = this.vulnerability;
        const currentIndex = states.indexOf(current);
        const nextIndex = (currentIndex + 1) % states.length;
        
        this.vulnerability = states[nextIndex];
        
        // Update the control display
        const vulnText = document.getElementById('vulnText');
        if (vulnText) {
            vulnText.textContent = this.vulnerability;
        }
        
        console.log(`🎯 Vulnerability changed to: ${this.vulnerability}`);
        this.updateDisplay();
    }
    
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
    
    /**
     * Calculate score using Kitchen Bridge rules - integrates with new system
     */
    calculateScore(contract, vulnerability) {
        // Use the contract from current state if not provided
        const { level, suit, result, doubled, declarer } = contract || this.currentContract;
        
        console.log(`💰 Calculating Kitchen Bridge score for ${level}${suit}${doubled} by ${declarer} = ${result}`);
        
        // Basic suit values per trick
        const suitValues = { '♣': 20, '♦': 20, '♥': 30, '♠': 30, 'NT': 30 };
        let nsScore = 0;
        let ewScore = 0;
        
        if (result === '=' || result?.startsWith('+')) {
            // Contract made
            let basicScore = level * suitValues[suit];
            if (suit === 'NT') basicScore += 10; // NT first trick bonus
            
            // Handle doubling of basic score
            let contractScore = basicScore;
            if (doubled === 'X') contractScore = basicScore * 2;
            else if (doubled === 'XX') contractScore = basicScore * 4;
            
            let score = contractScore;
            
            // Add overtricks
            if (result?.startsWith('+')) {
                const overtricks = parseInt(result.substring(1));
                let overtrickValue;
                
                if (doubled === '') {
                    overtrickValue = suitValues[suit] * overtricks;
                } else {
                    const isVulnerable = this.isVulnerable(declarer);
                    overtrickValue = overtricks * (isVulnerable ? 200 : 100);
                    if (doubled === 'XX') overtrickValue *= 2;
                }
                score += overtrickValue;
            }
            
            // Game/Part-game bonus
            if (contractScore >= 100) {
                const isVulnerable = this.isVulnerable(declarer);
                score += isVulnerable ? 500 : 300;
            } else {
                score += 50;
            }
            
            // Double bonuses
            if (doubled === 'X') score += 50;
            else if (doubled === 'XX') score += 100;
            
            // Assign to declaring side
            if (this.isNorthSouth(declarer)) {
                nsScore = score;
            } else {
                ewScore = score;
            }
            
        } else if (result?.startsWith('-')) {
            // Contract failed
            const undertricks = parseInt(result.substring(1));
            const isVulnerable = this.isVulnerable(declarer);
            
            let penalty = 0;
            if (doubled === '') {
                penalty = undertricks * (isVulnerable ? 100 : 50);
            } else {
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
            }
            
            // Penalty goes to opponents
            if (this.isNorthSouth(declarer)) {
                ewScore = penalty;
            } else {
                nsScore = penalty;
            }
        }
        
        console.log(`📊 Final score: NS=${nsScore}, EW=${ewScore}`);
        return { NS: nsScore, EW: ewScore };
    }
    
    /**
     * Calculate and record the score using new system
     */
    calculateAndRecordScore() {
        const score = this.calculateScore();
        
        console.log('📊 Before adding score - Current gameState.scores:', this.gameState.scores);
        console.log('📊 Score to add:', score);
        
        // Add to game state using parent class method
        this.gameState.addScore('NS', score.NS);
        this.gameState.addScore('EW', score.EW);
        
        console.log('📊 After adding score - Updated gameState.scores:', this.gameState.scores);
        
        // Record in history
        this.gameState.addDeal({
            deal: this.currentDeal,
            contract: { ...this.currentContract },
            vulnerability: this.vulnerability,
            score: score
        });
        
        // Increment deals for license tracking
        this.licenseManager.incrementDealsPlayed();
        
        console.log(`💾 Score recorded: NS=${score.NS}, EW=${score.EW}`);
    }
    
    /**
     * Move to next deal
     */
    nextDeal() {
        console.log('🃏 Moving to next deal');
        
        this.currentDeal++;
        this.resetContract();
        this.inputState = 'level_selection';
        this.updateDisplay();
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
        
        // Update button states
        const activeButtons = this.getActiveButtons();
        activeButtons.push('BACK'); // Always allow going back
        
        this.bridgeApp.updateButtonStates(activeButtons);
    }
    
    /**
     * Get display content for current state
     */
    getDisplayContent() {
        const scores = this.gameState.scores;
        
        // Debug: Log scores to see what's happening
        console.log('🎯 Current scores in display:', scores);
        
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
                        <div><strong>Deal ${this.currentDeal} - ${this.vulnerability}</strong></div>
                        <div style="color: #3498db; font-size: 12px; margin-top: 4px;">
                            Traditional bridge scoring • Manual vulnerability control
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
                        <div><strong>Deal ${this.currentDeal} - ${this.vulnerability}</strong></div>
                        <div><strong>Level: ${this.currentContract.level}</strong></div>
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
                        <div><strong>Deal ${this.currentDeal} - ${this.vulnerability}</strong></div>
                        <div><strong>Contract: ${contractSoFar}${doubleText}</strong></div>
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
                        <div><strong>Deal ${this.currentDeal} - ${this.vulnerability}</strong></div>
                        <div><strong>Contract: ${contract} by ${this.currentContract.declarer}</strong></div>
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
                        <div><strong>Deal ${this.currentDeal} - ${this.vulnerability}</strong></div>
                        <div><strong>Contract: ${fullContract} by ${this.currentContract.declarer}</strong></div>
                    </div>
                    <div class="current-state">Enter number of ${modeText}</div>
                `;
                
            case 'scoring':
                const lastEntry = this.gameState.getLastDeal();
                if (lastEntry) {
                    const contractDisplay = `${lastEntry.contract.level}${lastEntry.contract.suit}${lastEntry.contract.doubled}`;
                    
                    // Determine who scored
                    const nsScored = lastEntry.score.NS > 0;
                    const ewScored = lastEntry.score.EW > 0;
                    const scoreAmount = nsScored ? lastEntry.score.NS : lastEntry.score.EW;
                    const scoringSide = nsScored ? 'NS' : 'EW';
                    
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
                            ${contractDisplay} by ${lastEntry.contract.declarer} = ${lastEntry.contract.result}<br>
                            <span style="color: #27ae60;">
                                Score: +${scoreAmount} for ${scoringSide}
                            </span></div>
                        </div>
                        <div class="current-state">Press Deal for next hand</div>
                    `;
                }
                break;
                
            default:
                return '<div class="current-state">Loading...</div>';
        }
    }
}

// Export for the new module system
if (typeof module !== 'undefined' && module.exports) {
    module.exports = KitchenBridgeMode;
} else if (typeof window !== 'undefined') {
    window.KitchenBridgeMode = KitchenBridgeMode;
}

console.log('🍳 Kitchen Bridge module loaded successfully');