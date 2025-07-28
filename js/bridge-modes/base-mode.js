/**
 * Base Bridge Mode Class
 * Common functionality for all bridge scoring modules
 */

class BaseBridgeMode {
    constructor(bridgeApp) {
        this.bridgeApp = bridgeApp;
        this.licenseManager = bridgeApp.licenseManager;
        this.gameState = new GameState();
        this.modeName = 'Base Bridge Mode';
        this.currentDeal = 1;
        this.vulnerability = 'NV'; // NV, NS, EW, Both
        
        // UI state management
        this.currentStep = 'level'; // level, suit, declarer, double, result, tricks
        this.contract = {
            level: null,
            suit: null,
            declarer: null,
            doubled: 0, // 0 = no, 1 = doubled, 2 = redoubled
            made: null,
            tricks: null
        };
        
        console.log(`🎮 ${this.modeName} initialized`);
    }

    // Abstract methods - must be implemented by subclasses
    getModeName() {
        throw new Error('getModeName() must be implemented by subclass');
    }

    calculateScore(contract, vulnerability) {
        throw new Error('calculateScore() must be implemented by subclass');
    }

    // Common UI methods
    getDisplayContent() {
        return `
            <div class="title-score-row">
                <div class="mode-title">${this.getModeName()}</div>
                <div class="score-display">${this.getScoreDisplay()}</div>
            </div>
            <div class="game-content">
                ${this.getGameContent()}
            </div>
            <div class="current-state">${this.getCurrentStateText()}</div>
            ${this.getLicenseStatus()}
        `;
    }

    getScoreDisplay() {
        return `NS: ${this.gameState.scores.NS}<br>EW: ${this.gameState.scores.EW}`;
    }

    getGameContent() {
        const contractDisplay = this.getContractDisplay();
        const dealInfo = `<div class="deal-info">Deal ${this.currentDeal} - ${this.vulnerability}</div>`;
        
        return `
            ${dealInfo}
            ${contractDisplay}
            ${this.getAdditionalContent()}
        `;
    }

    getContractDisplay() {
        const level = this.contract.level || '_';
        const suit = this.contract.suit || '_';
        const declarer = this.contract.declarer || '_';
        const doubleText = this.contract.doubled === 0 ? '' : 
                          this.contract.doubled === 1 ? ' X' : ' XX';
        
        return `
            <div class="contract-display">
                <strong>Contract:</strong> ${level}${suit} ${declarer}${doubleText}
                ${this.contract.made !== null ? 
                    `<br><strong>Result:</strong> ${this.getResultText()}` : ''}
            </div>
        `;
    }

    getResultText() {
        if (this.contract.made === null) return '';
        
        if (this.contract.made) {
            const overtricks = this.contract.tricks - (6 + parseInt(this.contract.level));
            return overtricks > 0 ? `Made +${overtricks}` : 'Made exactly';
        } else {
            const undertricks = (6 + parseInt(this.contract.level)) - this.contract.tricks;
            return `Down ${undertricks}`;
        }
    }

    getAdditionalContent() {
        // Override in subclasses for mode-specific content
        return '';
    }

    getCurrentStateText() {
        switch (this.currentStep) {
            case 'level':
                return 'Select contract level (1-7)';
            case 'suit':
                return 'Select suit (♣♦♥♠ NT)';
            case 'declarer':
                return 'Select declarer (N S E W)';
            case 'double':
                return 'Double? Press X/XX or continue to result';
            case 'result':
                return 'Made/Down? Press MADE or DOWN';
            case 'tricks':
                return this.contract.made ? 
                    'How many tricks taken? (6-13)' : 
                    'How many tricks taken? (0-12)';
            default:
                return 'Press BACK to return or DEAL for next hand';
        }
    }

    getLicenseStatus() {
        const status = this.licenseManager.checkLicenseStatus();
        let text = '';
        
        if (status.status === 'trial') {
            text = `Trial: ${status.daysLeft} days, ${status.dealsLeft} deals left`;
        } else if (status.status === 'full') {
            text = 'Full Version Activated';
        }
        
        return text ? `<div class="license-status">${text}</div>` : '';
    }

    // Get buttons that should be active/highlighted
    getActiveButtons() {
        switch (this.currentStep) {
            case 'level':
                return ['1', '2', '3', '4', '5', '6', '7'];
            case 'suit':
                return ['♣', '♦', '♥', '♠', 'NT'];
            case 'declarer':
                return ['N', 'S', 'E', 'W'];
            case 'double':
                return ['X', 'MADE', 'DOWN']; // Can skip doubling
            case 'result':
                return ['MADE', 'DOWN'];
            case 'tricks':
                return this.contract.made ? 
                    ['6', '7', '8', '9', '0'] : // 6-10, then 11(1), 12(2), 13(3)
                    ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']; // 0-12
            default:
                return ['BACK', 'DEAL'];
        }
    }

    // Handle button input
    handleInput(value) {
        console.log(`🎯 ${this.modeName} input:`, value, 'Step:', this.currentStep);
        
        if (value === 'BACK') {
            this.handleBack();
            return;
        }
        
        if (value === 'DEAL') {
            this.handleDeal();
            return;
        }
        
        switch (this.currentStep) {
            case 'level':
                this.handleLevelInput(value);
                break;
            case 'suit':
                this.handleSuitInput(value);
                break;
            case 'declarer':
                this.handleDeclarerInput(value);
                break;
            case 'double':
                this.handleDoubleInput(value);
                break;
            case 'result':
                this.handleResultInput(value);
                break;
            case 'tricks':
                this.handleTricksInput(value);
                break;
        }
        
        this.updateDisplay();
    }

    handleLevelInput(value) {
        if (['1', '2', '3', '4', '5', '6', '7'].includes(value)) {
            this.contract.level = value;
            this.currentStep = 'suit';
        }
    }

    handleSuitInput(value) {
        if (['♣', '♦', '♥', '♠', 'NT'].includes(value)) {
            this.contract.suit = value;
            this.currentStep = 'declarer';
        }
    }

    handleDeclarerInput(value) {
        if (['N', 'S', 'E', 'W'].includes(value)) {
            this.contract.declarer = value;
            this.currentStep = 'double';
        }
    }

    handleDoubleInput(value) {
        if (value === 'X') {
            this.contract.doubled = this.contract.doubled === 0 ? 1 : 2;
            this.updateDisplay(); // Show updated double state
        } else if (['MADE', 'DOWN'].includes(value)) {
            this.handleResultInput(value);
        }
    }

    handleResultInput(value) {
        if (value === 'MADE') {
            this.contract.made = true;
            this.currentStep = 'tricks';
        } else if (value === 'DOWN') {
            this.contract.made = false;
            this.currentStep = 'tricks';
        }
    }

    handleTricksInput(value) {
        let tricks = parseInt(value);
        
        // Handle 10, 11, 12, 13 when made (using 0, 1, 2, 3)
        if (this.contract.made && ['0', '1', '2', '3'].includes(value)) {
            tricks = parseInt(value) + 10;
        }
        
        // Validate trick count
        const minTricks = this.contract.made ? 6 + parseInt(this.contract.level) : 0;
        const maxTricks = this.contract.made ? 13 : 6 + parseInt(this.contract.level) - 1;
        
        if (tricks >= minTricks && tricks <= maxTricks) {
            this.contract.tricks = tricks;
            this.processContract();
        }
    }

    handleBack() {
        switch (this.currentStep) {
            case 'suit':
                this.contract.level = null;
                this.currentStep = 'level';
                break;
            case 'declarer':
                this.contract.suit = null;
                this.currentStep = 'suit';
                break;
            case 'double':
                this.contract.declarer = null;
                this.currentStep = 'declarer';
                break;
            case 'result':
                this.contract.doubled = 0;
                this.currentStep = 'double';
                break;
            case 'tricks':
                this.contract.made = null;
                this.currentStep = 'result';
                break;
            default:
                // Return to main menu
                this.bridgeApp.showLicensedMode({ 
                    type: this.licenseManager.getLicenseData()?.type || 'FULL' 
                });
                return;
        }
        
        this.updateDisplay();
    }

    handleDeal() {
        if (this.currentStep === 'level') {
            // Start new deal
            this.newDeal();
        } else if (this.isContractComplete()) {
            // Process current contract and start new deal
            this.processContract();
        }
    }

    processContract() {
        if (!this.isContractComplete()) {
            console.warn('⚠️ Contract incomplete, cannot process');
            return;
        }
        
        console.log('📊 Processing contract:', this.contract);
        
        // Calculate score using subclass implementation
        const score = this.calculateScore(this.contract, this.vulnerability);
        
        // Update game state
        this.gameState.addScore(this.contract.declarer, score);
        this.gameState.addDeal({
            deal: this.currentDeal,
            contract: { ...this.contract },
            vulnerability: this.vulnerability,
            score: score
        });
        
        // Increment deals played for license tracking
        this.licenseManager.incrementDealsPlayed();
        
        // Check if trial expired
        const licenseStatus = this.licenseManager.checkLicenseStatus();
        if (licenseStatus.needsCode) {
            this.bridgeApp.showMessage('Trial expired - Enter full version code', 'error');
            setTimeout(() => {
                this.bridgeApp.showLicenseEntry(licenseStatus);
            }, 2000);
            return;
        }
        
        // Prepare for next deal
        this.newDeal();
        this.bridgeApp.showMessage(`Deal ${this.currentDeal - 1} scored: ${score.NS ? '+' : ''}${score.NS || score.EW}`, 'success');
    }

    isContractComplete() {
        return this.contract.level && this.contract.suit && 
               this.contract.declarer && this.contract.made !== null && 
               this.contract.tricks !== null;
    }

    newDeal() {
        this.currentDeal++;
        this.contract = {
            level: null,
            suit: null,
            declarer: null,
            doubled: 0,
            made: null,
            tricks: null
        };
        this.currentStep = 'level';
        
        // Update vulnerability (mode-specific implementation can override)
        this.updateVulnerability();
        this.updateDisplay();
    }

    updateVulnerability() {
        // Default implementation - subclasses can override
        // For now, keep manual control
    }

    updateDisplay() {
        const display = document.getElementById('display');
        if (display) {
            display.innerHTML = this.getDisplayContent();
        }
        
        // Update button states
        const activeButtons = this.getActiveButtons();
        activeButtons.push('BACK'); // Always allow going back
        
        if (this.isContractComplete()) {
            activeButtons.push('DEAL');
        }
        
        this.bridgeApp.updateButtonStates(activeButtons);
    }

    // Utility methods
    isNorthSouth(declarer) {
        return ['N', 'S'].includes(declarer);
    }

    isEastWest(declarer) {
        return ['E', 'W'].includes(declarer);
    }

    isVulnerable(declarer) {
        if (this.vulnerability === 'NV') return false;
        if (this.vulnerability === 'Both') return true;
        if (this.vulnerability === 'NS') return this.isNorthSouth(declarer);
        if (this.vulnerability === 'EW') return this.isEastWest(declarer);
        return false;
    }

    getSuitPoints(suit) {
        const points = { '♣': 20, '♦': 20, '♥': 30, '♠': 30, 'NT': 30 };
        return points[suit] || 0;
    }

    // Cleanup method
    destroy() {
        console.log(`🧹 ${this.modeName} destroyed`);
    }
}

/**
 * Game State Management
 * Tracks scores, history, and game progress
 */
class GameState {
    constructor() {
        this.scores = { NS: 0, EW: 0 };
        this.history = [];
        this.currentGame = 1;
    }

    addScore(declarer, score) {
        if (['N', 'S'].includes(declarer)) {
            this.scores.NS += score.NS || 0;
            this.scores.EW += score.EW || 0;
        } else {
            this.scores.EW += score.EW || score.NS || 0;
            this.scores.NS += score.NS || 0;
        }
    }

    addDeal(dealData) {
        this.history.push({
            ...dealData,
            timestamp: Date.now()
        });
    }

    getLastDeal() {
        return this.history[this.history.length - 1] || null;
    }

    undoLastDeal() {
        const lastDeal = this.history.pop();
        if (lastDeal) {
            // Subtract the score
            this.scores.NS -= lastDeal.score.NS || 0;
            this.scores.EW -= lastDeal.score.EW || 0;
            return lastDeal;
        }
        return null;
    }

    reset() {
        this.scores = { NS: 0, EW: 0 };
        this.history = [];
        this.currentGame++;
    }

    getGameSummary() {
        return {
            scores: { ...this.scores },
            deals: this.history.length,
            winner: this.scores.NS > this.scores.EW ? 'NS' : 
                    this.scores.EW > this.scores.NS ? 'EW' : 'Tie'
        };
    }
}

// Export for module loading
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { BaseBridgeMode, GameState };
}