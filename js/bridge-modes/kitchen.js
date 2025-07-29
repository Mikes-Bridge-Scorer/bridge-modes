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
     * Calculate score using Kitchen Bridge rules - using original proven method
     */
    calculateScore() {
        const { level, suit, result, doubled, declarer } = this.currentContract;
        
        console.log(`💰 Calculating Kitchen Bridge score for ${level}${suit}${doubled} by ${declarer} = ${result}`);
        
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
                    const isVulnerable = this.isVulnerable(declarer);
                    overtrickValue = overtricks * (isVulnerable ? 200 : 100);
                    if (doubled === 'XX') overtrickValue *= 2;
                }
                score += overtrickValue;
            }
            
            // Game/Part-game bonus
            if (contractScore >= 100) {
                // Game made
                const isVulnerable = this.isVulnerable(declarer);
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
            const isVulnerable = this.isVulnerable(declarer);
            
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
     * Calculate and record the score - using original proven method
     */
    calculateAndRecordScore() {
        const score = this.calculateScore();
        const declarerSide = ['N', 'S'].includes(this.currentContract.declarer) ? 'NS' : 'EW';
        
        console.log('📊 Before adding score - gameState.scores:', this.gameState.scores);
        console.log('📊 Score calculated:', score);
        console.log('📊 Declarer side:', declarerSide);
        
        // Store scores before attempting to add
        const scoresBefore = { ...this.gameState.scores };
        
        if (score >= 0) {
            // Made contract - points go to declarer side
            this.gameState.addScore(declarerSide, score);
            
            // Check if addScore worked, if not use direct update
            if (this.gameState.scores[declarerSide] === scoresBefore[declarerSide]) {
                console.log('🔧 addScore failed, using direct update');
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
                console.log('🔧 addScore failed, using direct update');
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
            mode: 'kitchen',
            vulnerability: this.vulnerability
        });
        
        // Increment deals for license tracking
        this.licenseManager.incrementDealsPlayed();
        
        console.log(`💾 Score recorded: ${score >= 0 ? score + ' for ' + declarerSide : Math.abs(score) + ' penalty for ' + (declarerSide === 'NS' ? 'EW' : 'NS')}`);
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
     * Get help content specific to Kitchen Bridge
     */
    getHelpContent() {
        return {
            title: 'Kitchen Bridge (Party Bridge) Help',
            content: `
                <div class="help-section">
                    <h4>What is Kitchen Bridge?</h4>
                    <p><strong>Kitchen Bridge</strong> (also called <strong>Party Bridge</strong>) is traditional bridge scoring designed for casual play at a single table with 4 players. It uses standard bridge scoring rules without any adjustments for hand strength or playing skill.</p>
                </div>
                
                <div class="help-section">
                    <h4>Enhanced Features</h4>
                    <ul>
                        <li><strong>Manual Vulnerability:</strong> Player-controlled vulnerability settings</li>
                        <li><strong>Deal Tracking:</strong> Clear display of current deal and vulnerability</li>
                        <li><strong>Traditional Scoring:</strong> Standard bridge point values</li>
                        <li><strong>Mobile Support:</strong> Enhanced touch support for all devices</li>
                    </ul>
                </div>
                
                <div class="help-section">
                    <h4>Vulnerability Control</h4>
                    <p><strong>Kitchen Bridge allows manual vulnerability control:</strong></p>
                    <ul>
                        <li>Press the <strong>Vuln</strong> button to cycle: NV → NS → EW → Both</li>
                        <li>Set vulnerability as desired for each deal</li>
                        <li>Vulnerability affects game bonuses and penalty scoring</li>
                    </ul>
                </div>
                
                <div class="help-section">
                    <h4>Key Characteristics</h4>
                    <ul>
                        <li><strong>Standard Scoring:</strong> Uses traditional bridge point values</li>
                        <li><strong>4 Players Only:</strong> Designed for one table bridge</li>
                        <li><strong>No Skill Adjustment:</strong> Same score regardless of hand strength</li>
                        <li><strong>Simple & Quick:</strong> Easy to calculate, familiar to all bridge players</li>
                    </ul>
                </div>
                
                <div class="help-section">
                    <h4>Mobile & Touch Support</h4>
                    <ul>
                        <li><strong>Touch Optimized:</strong> All buttons work perfectly on mobile devices</li>
                        <li><strong>Visual Feedback:</strong> Buttons provide haptic and visual feedback</li>
                        <li><strong>Proper Sizing:</strong> Buttons sized for easy touch interaction</li>
                        <li><strong>Universal Support:</strong> Works on phones, tablets, and desktops</li>
                    </ul>
                </div>
                
                <div class="help-section">
                    <h4>How to Use</h4>
                    <ol>
                        <li><strong>Set Vulnerability:</strong> Use Vuln button before each deal</li>
                        <li><strong>Enter Contract:</strong> Level → Suit → Declarer → Result</li>
                        <li><strong>Add Doubling:</strong> Press X to cycle through None/Double/Redouble</li>
                        <li><strong>Score Automatically:</strong> Calculator applies standard bridge scoring</li>
                        <li><strong>Next Deal:</strong> Press Deal to continue</li>
                    </ol>
                </div>
            `,
            buttons: [
                { text: 'Close Help', action: 'close', class: 'close-btn' }
            ]
        };
    }
    
    /**
     * Show Kitchen Bridge specific help
     */
    showHelp() {
        const helpContent = this.getHelpContent();
        this.bridgeApp.showModal(helpContent.title, helpContent.content);
    }
    
    /**
     * Show Kitchen Bridge specific quit options
     */
    showQuit() {
        const scores = this.gameState.scores;
        const totalDeals = this.gameState.history.length;
        const licenseStatus = this.bridgeApp.licenseManager.checkLicenseStatus();
        
        let currentScoreContent = '';
        if (totalDeals > 0) {
            const leader = scores.NS > scores.EW ? 'North-South' : 
                          scores.EW > scores.NS ? 'East-West' : 'Tied';
            
            currentScoreContent = `
                <div class="help-section">
                    <h4>📊 Current Game Status</h4>
                    <p><strong>Deals Played:</strong> ${totalDeals}</p>
                    <p><strong>Current Scores:</strong></p>
                    <ul>
                        <li>North-South: ${scores.NS} points</li>
                        <li>East-West: ${scores.EW} points</li>
                    </ul>
                    <p><strong>Current Leader:</strong> ${leader}</p>
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
        
        this.bridgeApp.showModal('🍳 Kitchen Bridge Options', content, buttons);
    }
    
    /**
     * Show detailed deal-by-deal scores
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
                <h4>🃏 Deal by Deal Summary</h4>
                <div style="max-height: 300px; overflow-y: auto; font-size: 12px;">
        `;
        
        history.forEach((deal, index) => {
            const contract = deal.contract;
            const contractStr = `${contract.level}${contract.suit}${contract.doubled ? ' ' + contract.doubled : ''}`;
            const scoreDisplay = deal.score >= 0 ? `+${deal.score}` : `${deal.score}`;
            const scoringSide = deal.scoringSide || (deal.score >= 0 ? 
                (['N', 'S'].includes(contract.declarer) ? 'NS' : 'EW') :
                (['N', 'S'].includes(contract.declarer) ? 'EW' : 'NS'));
            
            dealSummary += `
                <div style="border-bottom: 1px solid #444; padding: 8px 0; display: flex; justify-content: space-between;">
                    <div>
                        <strong>Deal ${deal.deal}:</strong> ${contractStr} by ${contract.declarer} = ${contract.result}
                    </div>
                    <div style="color: ${deal.score >= 0 ? '#27ae60' : '#e74c3c'};">
                        ${scoreDisplay} for ${scoringSide}
                    </div>
                </div>
            `;
        });
        
        dealSummary += `
                </div>
            </div>
        `;
        
        const buttons = [
            { text: 'Back to Options', action: () => this.showQuit(), class: 'back-btn' },
            { text: 'Continue Playing', action: () => {}, class: 'continue-btn' }
        ];
        
        this.bridgeApp.showModal('📊 Kitchen Bridge - Detailed Scores', dealSummary, buttons);
    }
    
    /**
     * Start a new game (reset scores)
     */
    startNewGame() {
        const confirmed = confirm(
            'Start a new game?\n\nThis will reset all scores to zero and start over.\n\nClick OK to start new game, Cancel to continue current game.'
        );
        
        if (confirmed) {
            // Reset all scores and history
            this.gameState.scores = { NS: 0, EW: 0 };
            this.gameState.history = [];
            this.currentDeal = 1;
            this.vulnerability = 'NV';
            
            // Update vulnerability display
            const vulnText = document.getElementById('vulnText');
            if (vulnText) {
                vulnText.textContent = 'NV';
            }
            
            // Reset to level selection
            this.resetContract();
            this.inputState = 'level_selection';
            this.updateDisplay();
            
            console.log('🆕 New Kitchen Bridge game started');
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
                    
                    // Show who scored - simple logic
                    const declarerSide = ['N', 'S'].includes(lastEntry.contract.declarer) ? 'NS' : 'EW';
                    const scoreAmount = Math.abs(lastEntry.score);
                    const scoringSide = lastEntry.score >= 0 ? declarerSide : (declarerSide === 'NS' ? 'EW' : 'NS');
                    
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