import { BaseBridgeMode } from './base-mode.js';

class ChicagoBridge extends BaseBridgeMode {
    constructor(gameState, ui) {
        super(gameState, ui);
        this.modeName = 'chicago';
        this.displayName = 'Chicago Bridge';
    }
    
    initialize() {
        this.gameState.setMode('chicago');
        this.updateDisplay();
    }
    
    handleAction(value) {
        console.log('Chicago Bridge action:', value);
        this.updateDisplay();
    }
    
    getActiveButtons() {
        return ['1', '2', '3', '4', '5'];
    }
    
    updateDisplay() {
        const scores = this.gameState.getScores();
        const content = `
            <div class="title-score-row">
                <div class="mode-title">Chicago Bridge</div>
                <div class="score-display">NS: ${scores.NS}<br>EW: ${scores.EW}</div>
            </div>
            <div class="game-content">
                <div>Chicago Bridge mode loaded successfully!</div>
                <div>4-deal vulnerability cycle</div>
            </div>
            <div class="current-state">Chicago bridge - working!</div>
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
            title: 'Chicago Bridge Help',
            content: 'Chicago Bridge with 4-deal cycle - working version.',
            buttons: [{ text: 'Close Help', action: 'close', class: 'close-btn' }]
        };
    }
    
    cleanup() {
        // Clean up
    }
}

export default ChicagoBridge;