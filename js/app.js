// ===== BRIDGE MODES CALCULATOR - COMPLETE FINAL VERSION =====

// Import utilities first (this should work)
import { Helpers, CONSTANTS } from './utils/helpers.js';

class BridgeModesApp {
    constructor() {
        // App state
        this.currentMode = null;
        this.gameState = {
            mode: null,
            gameNumber: 1,
            dealNumber: 1,
            dealer: 'North',
            vulnerability: 'None',
            scores: { NS: 0, EW: 0 },
            history: []
        };
        
        // UI state
        this.appState = 'mode_selection';
        this.currentContract = {
            level: null,
            suit: null,
            declarer: null,
            doubled: '',
            result: null
        };
        
        // Result selection mode
        this.resultMode = null; // 'down', 'made', or 'plus'
        
        // Mode names
        this.modeNames = {
            'kitchen': 'Kitchen Bridge',
            'bonus': 'Bonus Bridge',
            'chicago': 'Chicago Bridge',
            'rubber': 'Rubber Bridge',
            'duplicate': 'Duplicate Bridge'
        };
        
        // Initialize
        this.init();
    }
    
    init() {
        console.log('🎯 Initializing Bridge Modes Calculator...');
        
        try {
            // Get DOM elements
            this.display = document.getElementById('display');
            this.buttons = document.querySelectorAll('.btn');
            
            if (!this.display) {
                throw new Error('Display element not found');
            }
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Update initial display
            this.updateDisplay();
            
            console.log('✅ Bridge Modes Calculator initialized successfully');
            
        } catch (error) {
            console.error('❌ Failed to initialize:', error);
        }
    }
    
    setupEventListeners() {
        // Button click events
        document.addEventListener('click', (event) => {
            const button = event.target.closest('.btn');
            if (!button || button.classList.contains('disabled')) return;
            
            // Add visual feedback
            button.classList.add('btn-press');
            setTimeout(() => button.classList.remove('btn-press'), 100);
            
            // Get button value and process
            const value = button.dataset.value;
            this.processAction(value);
        });
        
        // Keyboard events for accessibility
        document.addEventListener('keydown', (event) => {
            if (event.target.classList.contains('btn')) {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    event.target.click();
                }
            }
        });
    }
    
    processAction(value) {
        console.log(`🎮 Action: ${value} in state: ${this.appState}`);
        
        switch (this.appState) {
            case 'mode_selection':
                this.handleModeSelection(value);
                break;
                
            case 'level_selection':
                this.handleLevelSelection(value);
                break;
                
            case 'suit_selection':
                this.handleSuitSelection(value);
                break;
                
            case 'declarer_selection':
                this.handleDeclarerSelection(value);
                break;
                
            case 'result_selection':
                this.handleResultSelection(value);
                break;
                
            case 'scoring':
                this.handleScoringActions(value);
                break;
        }
        
        // Handle global actions
        this.handleGlobalActions(value);
        
        // Update display
        this.updateDisplay();
    }
    
    handleModeSelection(value) {
        const modeMap = {
            '1': 'kitchen',
            '2': 'bonus', 
            '3': 'chicago',
            '4': 'rubber',
            '5': 'duplicate'
        };
        
        if (modeMap[value]) {
            this.currentMode = modeMap[value];
            this.gameState.mode = this.currentMode;
            this.appState = 'level_selection';
            
            // Initialize mode-specific settings
            this.initializeMode();
            
            console.log(`🎯 Selected mode: ${this.currentMode}`);
        }
    }
    
    handleLevelSelection(value) {
        if (['1', '2', '3', '4', '5', '6', '7'].includes(value)) {
            this.currentContract.level = parseInt(value);
            this.appState = 'suit_selection';
        } else if (value === 'PASS') {
            console.log('🚫 Pass registered');
            // Could implement pass tracking here
        }
    }
    
    handleSuitSelection(value) {
        const suits = ['♣', '♦', '♥', '♠', 'NT'];
        if (suits.includes(value)) {
            this.currentContract.suit = value;
            this.appState = 'declarer_selection';
        }
    }
    
    handleDeclarerSelection(value) {
        const directions = ['N', 'S', 'E', 'W'];
        if (directions.includes(value)) {
            this.currentContract.declarer = value;
            this.appState = 'result_selection';
        } else if (value === 'X' && this.currentContract.doubled === '') {
            this.currentContract.doubled = 'X';
        } else if (value === 'XX' && this.currentContract.doubled === 'X') {
            this.currentContract.doubled = 'XX';
        }
    }
    
    handleResultSelection(value) {
        if (value === '-') {
            // User wants to enter a failed contract
            this.resultMode = 'down';
            console.log('📉 Entering DOWN mode - select number of tricks down');
            
        } else if (value === '=') {
            // Contract made exactly
            this.currentContract.result = '=';
            console.log('✅ Contract MADE exactly');
            this.calculateBasicScore();
            this.resultMode = null;
            
        } else if (value === '+') {
            // User wants to enter overtricks
            this.resultMode = 'plus';
            console.log('📈 Entering PLUS mode - select number of overtricks');
            
        } else if (this.resultMode === 'down' && ['1','2','3','4','5','6','7'].includes(value)) {
            // User selected number of tricks down
            const tricksDown = parseInt(value);
            this.currentContract.result = `-${tricksDown}`;
            console.log(`💥 Contract FAILED by ${tricksDown} tricks`);
            this.calculateBasicScore();
            this.resultMode = null;
            
        } else if (this.resultMode === 'plus' && ['1','2','3','4','5','6','7'].includes(value)) {
            // User selected number of overtricks
            const tricksUp = parseInt(value);
            // Check if this is within the valid range
            const maxOvertricks = this.getMaxOvertricks();
            if (tricksUp <= maxOvertricks) {
                this.currentContract.result = `+${tricksUp}`;
                console.log(`🎉 Contract MADE with ${tricksUp} overtricks`);
                this.calculateBasicScore();
                this.resultMode = null;
            } else {
                console.warn(`⚠️ Cannot make ${tricksUp} overtricks, maximum is ${maxOvertricks}`);
            }
        }
    }
    
    // Calculate maximum possible overtricks based on contract level
    getMaxOvertricks() {
        const contractTricks = 6 + this.currentContract.level; // e.g., 1♣ = 7 tricks
        const maxPossibleTricks = 13; // Total tricks in a deal
        return maxPossibleTricks - contractTricks; // e.g., 13 - 7 = 6 for 1♣
    }
    
    // Calculate maximum tricks down (limited by what's available on buttons)
    getMaxDown() {
        // We only have buttons 1-7, so maximum down is 7
        return Math.min(7, 13);
    }
    
    // Get the range of valid numbers to highlight
    getValidNumbers() {
        if (this.resultMode === 'plus') {
            const maxOver = this.getMaxOvertricks();
            const availableButtons = Math.min(maxOver, 7); // Limited by button availability
            return Array.from({length: availableButtons}, (_, i) => (i + 1).toString());
        } else if (this.resultMode === 'down') {
            const maxDown = this.getMaxDown();
            return Array.from({length: maxDown}, (_, i) => (i + 1).toString());
        }
        return [];
    }
    
    handleScoringActions(value) {
        if (value === 'DEAL') {
            this.nextDeal();
        }
    }
    
    handleGlobalActions(value) {
        switch (value) {
            case 'C':
                this.clearCurrentAction();
                break;
                
            case 'MENU':
                if (this.gameState.history.length > 0) {
                    if (confirm('Return to menu? This will lose the current game.')) {
                        this.goToMenu();
                    }
                } else {
                    this.goToMenu();
                }
                break;
                
            case 'SCORE':
                // Only show score popup for modes that need it (not Kitchen Bridge)
                if (this.currentMode !== 'kitchen') {
                    this.showScoreOverlay();
                }
                break;
                
            case 'HELP':
                this.showHelp();
                break;
        }
    }
    
    calculateBasicScore() {
        const level = this.currentContract.level;
        const suit = this.currentContract.suit;
        const result = this.currentContract.result;
        const declarer = this.currentContract.declarer;
        
        let score = 0;
        
        if (result === '=' || result.startsWith('+')) {
            // Contract made - basic scoring
            const suitValues = { '♣': 20, '♦': 20, '♥': 30, '♠': 30, 'NT': 30 };
            score = level * suitValues[suit];
            if (suit === 'NT') score += 10; // NT bonus
            
            // Add overtricks
            if (result.startsWith('+')) {
                const overtricks = parseInt(result.substring(1));
                score += overtricks * (suit === 'NT' || ['♥', '♠'].includes(suit) ? 30 : 20);
            }
            
            // Game bonus
            if (score >= 100) {
                score += 300; // Simplified game bonus
            } else {
                score += 50; // Part game
            }
            
            // Double bonuses
            if (this.currentContract.doubled === 'X') {
                const basicScore = level * suitValues[suit] + (suit === 'NT' ? 10 : 0);
                score = basicScore * 2 + 50 + (score >= 100 ? 300 : 50);
            } else if (this.currentContract.doubled === 'XX') {
                const basicScore = level * suitValues[suit] + (suit === 'NT' ? 10 : 0);
                score = basicScore * 4 + 100 + (score >= 100 ? 300 : 50);
            }
            
        } else {
            // Contract failed
            const undertricks = parseInt(result.substring(1));
            
            if (this.currentContract.doubled === '') {
                // Undoubled penalties
                const isVulnerable = this.isDeclarerVulnerable();
                score = -undertricks * (isVulnerable ? 100 : 50);
            } else {
                // Doubled penalties (simplified)
                const isVulnerable = this.isDeclarerVulnerable();
                const multiplier = this.currentContract.doubled === 'XX' ? 2 : 1;
                score = -undertricks * (isVulnerable ? 200 : 100) * multiplier;
            }
        }
        
        // Add to scores
        if (['N', 'S'].includes(declarer)) {
            this.gameState.scores.NS += score;
        } else {
            this.gameState.scores.EW += score;
        }
        
        // Record in history
        this.gameState.history.push({
            deal: this.gameState.dealNumber,
            contract: { ...this.currentContract },
            score: score,
            vulnerability: this.gameState.vulnerability
        });
        
        this.appState = 'scoring';
        console.log(`💰 Score: ${score} points`);
    }
    
    isDeclarerVulnerable() {
        const declarerSide = ['N', 'S'].includes(this.currentContract.declarer) ? 'NS' : 'EW';
        return this.gameState.vulnerability === declarerSide || this.gameState.vulnerability === 'Both';
    }
    
    initializeMode() {
        switch (this.currentMode) {
            case 'chicago':
                this.updateVulnerability();
                break;
            default:
                this.gameState.vulnerability = 'None';
        }
    }
    
    updateVulnerability() {
        if (this.currentMode === 'chicago') {
            const vulnCycle = ['None', 'NS', 'EW', 'Both'];
            this.gameState.vulnerability = vulnCycle[(this.gameState.dealNumber - 1) % 4];
        }
    }
    
    nextDeal() {
        this.gameState.dealNumber++;
        this.gameState.dealer = this.getNextDealer();
        this.updateVulnerability();
        
        // Reset contract
        this.currentContract = {
            level: null,
            suit: null,
            declarer: null,
            doubled: '',
            result: null
        };
        
        // Reset result mode
        this.resultMode = null;
        
        this.appState = 'level_selection';
        console.log(`🃏 Next deal: #${this.gameState.dealNumber}`);
    }
    
    getNextDealer() {
        const dealers = ['North', 'East', 'South', 'West'];
        const index = dealers.indexOf(this.gameState.dealer);
        return dealers[(index + 1) % 4];
    }
    
    clearCurrentAction() {
        switch (this.appState) {
            case 'suit_selection':
                this.currentContract.level = null;
                this.appState = 'level_selection';
                break;
            case 'declarer_selection':
                this.currentContract.suit = null;
                this.currentContract.doubled = '';
                this.appState = 'suit_selection';
                break;
            case 'result_selection':
                if (this.resultMode) {
                    // If in number selection mode, go back to result type selection
                    this.resultMode = null;
                } else {
                    // Go back to declarer selection
                    this.currentContract.declarer = null;
                    this.appState = 'declarer_selection';
                }
                break;
            default:
                this.goToMenu();
        }
    }
    
    goToMenu() {
        this.appState = 'mode_selection';
        this.currentMode = null;
        this.currentContract = {
            level: null,
            suit: null,
            declarer: null,
            doubled: '',
            result: null
        };
        this.resultMode = null;
        this.gameState = {
            mode: null,
            gameNumber: 1,
            dealNumber: 1,
            dealer: 'North',
            vulnerability: 'None',
            scores: { NS: 0, EW: 0 },
            history: []
        };
    }
    
    showScoreOverlay() {
        console.log('📊 Current Scores:');
        console.log(`North-South: ${this.gameState.scores.NS}`);
        console.log(`East-West: ${this.gameState.scores.EW}`);
        console.log('Recent history:', this.gameState.history.slice(-5));
        
        // Simple alert for now - we'll make a proper overlay later
        alert(`Current Scores:\nNorth-South: ${this.gameState.scores.NS}\nEast-West: ${this.gameState.scores.EW}`);
    }
    
    showHelp() {
        const helpContent = this.getHelpContent();
        
        // Create help overlay
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.8); z-index: 1000;
            display: flex; justify-content: center; align-items: center;
        `;
        
        overlay.innerHTML = `
            <div style="
                background: #34495e; border-radius: 16px; padding: 20px;
                max-width: 90%; max-height: 80%; overflow-y: auto;
                color: white; box-shadow: 0 20px 40px rgba(0,0,0,0.5);
            ">
                ${helpContent}
                <button onclick="this.parentElement.parentElement.remove()" 
                        style="background: #3498db; color: white; border: none; 
                               padding: 10px 20px; border-radius: 8px; margin-top: 15px;
                               font-size: 16px; cursor: pointer;">
                    Close Help
                </button>
            </div>
        `;
        
        document.body.appendChild(overlay);
    }
    
    getHelpContent() {
        const mode = this.currentMode || 'general';
        
        const modeHelp = {
            'kitchen': `
                <h3 style="color: #3498db; margin-bottom: 15px;">Kitchen Bridge Help</h3>
                <p><strong>Simple social bridge scoring:</strong></p>
                <ul style="margin: 10px 0; padding-left: 20px;">
                    <li>Basic contract scoring only</li>
                    <li>No complex bonuses or penalties</li>
                    <li>Perfect for casual games</li>
                    <li>Scores shown in main display</li>
                </ul>
            `,
            'general': `
                <h3 style="color: #3498db; margin-bottom: 15px;">Bridge Modes Calculator</h3>
                <p><strong>How to use:</strong></p>
                <ol style="margin: 10px 0; padding-left: 20px;">
                    <li>Select mode (1-5)</li>
                    <li>Enter bid level (1-7)</li>
                    <li>Choose suit (♣♦♥♠NT)</li>
                    <li>Pick declarer (N/S/E/W)</li>
                    <li>Enter result (−/=/+)</li>
                </ol>
            `
        };
        
        return (modeHelp[mode] || modeHelp['general']) + `
            <h4 style="color: #f39c12; margin: 15px 0 10px 0;">Button Functions:</h4>
            <ul style="margin: 10px 0; padding-left: 20px; font-size: 14px;">
                <li><strong>CLEAR:</strong> Go back one step (doesn't lose game)</li>
                <li><strong>DEAL:</strong> Advance to next deal</li>
                <li><strong>MENU:</strong> Return to mode selection (asks to confirm)</li>
                <li><strong>PASS:</strong> Record a pass in the auction</li>
                <li><strong>SCORE:</strong> Show detailed score popup (disabled in Kitchen)</li>
            </ul>
        `;
    }
    
    updateDisplay() {
        if (!this.display) return;
        
        let content = this.getDisplayContent();
        this.display.innerHTML = content;
        
        // Update button states
        this.updateButtonStates();
    }
    
    getDisplayContent() {
        const modeName = this.modeNames[this.currentMode] || 'Bridge Modes Calculator';
        
        switch (this.appState) {
            case 'mode_selection':
                return `
                    <div class="mode-title" style="font-size: 22px;">Bridge Modes Calculator</div>
                    <div class="game-info" style="font-size: 16px;">
                        Select scoring mode:<br>
                        1-Kitchen  2-Bonus  3-Chicago  4-Rubber  5-Duplicate
                    </div>
                    <div class="current-state" style="font-size: 17px;">Press 1-5 to select mode</div>
                `;
                
            case 'level_selection':
                return `
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div class="mode-title" style="font-size: 20px; margin: 0;">${modeName}</div>
                        <div style="font-size: 16px; text-align: right;">
                            <strong>NS: ${this.gameState.scores.NS}</strong><br>
                            <strong>EW: ${this.gameState.scores.EW}</strong>
                        </div>
                    </div>
                    <div style="font-size: 15px; margin: 10px 0;">
                        Game ${this.gameState.gameNumber} - Deal ${this.gameState.dealNumber} - Dealer: ${this.gameState.dealer} - Vuln: ${this.gameState.vulnerability}
                    </div>
                    <div class="current-state" style="font-size: 17px;">Select bid level (1-7) or PASS</div>
                `;
                
            case 'suit_selection':
                return `
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div class="mode-title" style="font-size: 20px; margin: 0;">${modeName}</div>
                        <div style="font-size: 16px; text-align: right;">
                            <strong>NS: ${this.gameState.scores.NS}</strong><br>
                            <strong>EW: ${this.gameState.scores.EW}</strong>
                        </div>
                    </div>
                    <div style="font-size: 15px; margin: 10px 0;">
                        Deal ${this.gameState.dealNumber} - Dealer: ${this.gameState.dealer} - Vuln: ${this.gameState.vulnerability}
                    </div>
                    <div class="number-display" style="font-size: 20px; font-weight: bold; margin: 10px 0;">Level: ${this.currentContract.level}</div>
                    <div class="current-state" style="font-size: 17px;">Select suit</div>
                `;
                
            case 'declarer_selection':
                const contractText = `${this.currentContract.level}${this.currentContract.suit}${this.currentContract.doubled}`;
                return `
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div class="mode-title" style="font-size: 20px; margin: 0;">${modeName}</div>
                        <div style="font-size: 16px; text-align: right;">
                            <strong>NS: ${this.gameState.scores.NS}</strong><br>
                            <strong>EW: ${this.gameState.scores.EW}</strong>
                        </div>
                    </div>
                    <div style="font-size: 15px; margin: 10px 0;">
                        Deal ${this.gameState.dealNumber} - Vuln: ${this.gameState.vulnerability}
                    </div>
                    <div class="number-display" style="font-size: 20px; font-weight: bold; margin: 10px 0;">Contract: ${contractText}</div>
                    <div class="current-state" style="font-size: 17px;">
                        Select declarer (N/E/S/W)${this.currentContract.doubled === '' ? ' or Double (X)' : ''}${this.currentContract.doubled === 'X' ? ' or Redouble (XX)' : ''}
                    </div>
                `;
                
            case 'result_selection':
                const fullContract = `${this.currentContract.level}${this.currentContract.suit}${this.currentContract.doubled}`;
                const vulnText = this.gameState.vulnerability === 'None' ? 'NV' : 
                               this.gameState.vulnerability === 'Both' ? 'BV' : 
                               this.gameState.vulnerability;
                
                if (!this.resultMode) {
                    return `
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <div class="mode-title" style="font-size: 20px; margin: 0;">${modeName}</div>
                            <div style="font-size: 16px; text-align: right;">
                                <strong>NS: ${this.gameState.scores.NS}</strong><br>
                                <strong>EW: ${this.gameState.scores.EW}</strong>
                            </div>
                        </div>
                        <div class="number-display" style="font-size: 18px; font-weight: bold; margin: 10px 0;">
                            ${fullContract} by ${this.currentContract.declarer} ${vulnText}
                        </div>
                        <div class="current-state" style="font-size: 17px;">
                            <strong>Result:</strong> 
                            <span style="color: #e74c3c;">Failed (−)</span> | 
                            <span style="color: #27ae60;">Made (=)</span> | 
                            <span style="color: #27ae60;">Plus (+)</span>
                        </div>
                    `;
                    
                } else if (this.resultMode === 'down') {
                    return `
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <div class="mode-title" style="font-size: 20px; margin: 0;">${modeName}</div>
                            <div style="font-size: 16px; text-align: right;">
                                <strong>NS: ${this.gameState.scores.NS}</strong><br>
                                <strong>EW: ${this.gameState.scores.EW}</strong>
                            </div>
                        </div>
                        <div class="number-display" style="font-size: 18px; font-weight: bold; margin: 10px 0;">
                            ${fullContract} by ${this.currentContract.declarer} ${vulnText}
                        </div>
                        <div class="current-state" style="font-size: 17px;">
                            <strong style="color: #e74c3c;">FAILED:</strong> Select tricks down (1-7)
                        </div>
                    `;
                    
                } else if (this.resultMode === 'plus') {
                    const maxOvertricks = this.getMaxOvertricks();
                    return `
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <div class="mode-title" style="font-size: 20px; margin: 0;">${modeName}</div>
                            <div style="font-size: 16px; text-align: right;">
                                <strong>NS: ${this.gameState.scores.NS}</strong><br>
                                <strong>EW: ${this.gameState.scores.EW}</strong>
                            </div>
                        </div>
                        <div class="number-display" style="font-size: 18px; font-weight: bold; margin: 10px 0;">
                            ${fullContract} by ${this.currentContract.declarer} ${vulnText}
                        </div>
                        <div class="current-state" style="font-size: 17px;">
                            <strong style="color: #27ae60;">MADE PLUS:</strong> Select overtricks (1-${Math.min(maxOvertricks, 7)})
                        </div>
                    `;
                }
                break;
                
            case 'scoring':
                const lastScore = this.gameState.history[this.gameState.history.length - 1];
                const lastContract = lastScore ? lastScore.contract : this.currentContract;
                const contractDisplay = `${lastContract.level}${lastContract.suit}${lastContract.doubled}`;
                const vulnDisplay = lastScore ? (lastScore.vulnerability === 'None' ? 'NV' : 
                                               lastScore.vulnerability === 'Both' ? 'BV' : 
                                               lastScore.vulnerability) : 'NV';
                
                let resultText = '';
                if (lastContract.result === '=') {
                    resultText = 'made exactly';
                } else if (lastContract.result && lastContract.result.startsWith('+')) {
                    resultText = `made +${lastContract.result.substring(1)}`;
                } else if (lastContract.result && lastContract.result.startsWith('-')) {
                    resultText = `down ${lastContract.result.substring(1)}`;
                }
                
                return `
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div class="mode-title" style="font-size: 20px; margin: 0;">${modeName}</div>
                        <div style="font-size: 16px; text-align: right;">
                            <strong>NS: ${this.gameState.scores.NS}</strong><br>
                            <strong>EW: ${this.gameState.scores.EW}</strong>
                        </div>
                    </div>
                    <div style="font-size: 16px; margin: 10px 0; font-weight: bold;">
                        <strong>Deal ${this.gameState.dealNumber} completed:</strong><br>
                        ${contractDisplay} by ${lastContract.declarer} ${vulnDisplay} ${resultText} 
                        <strong style="color: ${(lastScore?.score || 0) >= 0 ? '#27ae60' : '#e74c3c'};">
                            ${(lastScore?.score || 0) >= 0 ? '+' : ''}${lastScore?.score || 0}
                        </strong>
                    </div>
                    <div class="current-state" style="font-size: 17px;">
                        Press DEAL for next deal | MENU for main menu
                    </div>
                `;
                
            default:
                return '<div class="current-state">Loading...</div>';
        }
    }
    
    updateButtonStates() {
        if (!this.buttons) return;
        
        // Define which buttons should be active for each state
        let activeButtons = [];
        
        switch (this.appState) {
            case 'mode_selection':
                activeButtons = ['1', '2', '3', '4', '5'];
                break;
            case 'level_selection':
                activeButtons = ['1', '2', '3', '4', '5', '6', '7', 'PASS'];
                break;
            case 'suit_selection':
                activeButtons = ['♣', '♦', '♥', '♠', 'NT'];
                break;
            case 'declarer_selection':
                activeButtons = ['N', 'S', 'E', 'W'];
                if (this.currentContract.doubled === '') activeButtons.push('X');
                if (this.currentContract.doubled === 'X') activeButtons.push('XX');
                break;
            case 'result_selection':
                if (!this.resultMode) {
                    activeButtons = ['-', '=', '+'];
                } else {
                    activeButtons = this.getValidNumbers();
                }
                break;
            case 'scoring':
                activeButtons = ['DEAL', 'MENU'];
                break;
        }
        
        // Update button classes
        this.buttons.forEach(btn => {
            const value = btn.dataset.value;
            let isGlobalAction = ['C', 'MENU'].includes(value);
            
            // SCORE only active for non-Kitchen modes
            if (value === 'SCORE' && this.currentMode !== 'kitchen') {
                isGlobalAction = true;
            }
            
            // HELP always available (you'll need to add this button to HTML)
            if (value === 'HELP') {
                isGlobalAction = true;
            }
            
            if (activeButtons.includes(value) || isGlobalAction) {
                btn.classList.remove('disabled');
                if (activeButtons.includes(value)) {
                    btn.classList.add('active');
                } else {
                    btn.classList.remove('active');
                }
            } else {
                btn.classList.add('disabled');
                btn.classList.remove('active');
            }
        });
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Starting Bridge Modes Calculator');
    window.bridgeApp = new BridgeModesApp();
});

// Also try immediate initialization in case DOMContentLoaded already fired
if (document.readyState === 'loading') {
    // Still loading, wait for DOMContentLoaded
} else {
    // Already loaded
    console.log('🚀 Starting Bridge Modes Calculator (immediate)');
    window.bridgeApp = new BridgeModesApp();
}