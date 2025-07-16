import { BaseBridgeMode } from './base-mode.js';

class BonusBridge extends BaseBridgeMode {
    constructor(gameState, ui) {
        super(gameState, ui);
        this.modeName = 'bonus';
        this.displayName = 'Bonus Bridge';
    }
    
    initialize() {
        this.gameState.setMode('bonus');
        this.updateDisplay();
    }
    
    handleAction(value) {
        console.log('Bonus Bridge action:', value);
        this.updateDisplay();
    }
    
    getActiveButtons() {
        return ['1', '2', '3', '4', '5'];
    }
    
    updateDisplay() {
        const scores = this.gameState.getScores();
        const content = `
            <div class="title-score-row">
                <div class="mode-title">Bonus Bridge</div>
                <div class="score-display">NS: ${scores.NS}<br>EW: ${scores.EW}</div>
            </div>
            <div class="game-content">
                <div>Bonus Bridge mode loaded successfully!</div>
                <div>HCP-based enhanced scoring</div>
            </div>
            <div class="current-state">Bonus bridge - working!</div>
        `;
        this.ui.updateDisplay(content);
        this.ui.updateButtonStates(this.getActiveButtons());
    }
    
    handleBack() {
        return false;
    }
    
    canGoBack() {
        return true;
    }
    
    getHelpContent() {
        return {
            title: 'Bonus Bridge Help',
            content: 'HCP-based bonus bridge scoring - working version.',
            buttons: [{ text: 'Close Help', action: 'close', class: 'close-btn' }]
        };
    }
    
    cleanup() {
        // Clean up
    }
}

export default BonusBridge;