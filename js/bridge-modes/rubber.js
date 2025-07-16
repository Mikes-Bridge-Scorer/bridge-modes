import { BaseBridgeMode } from './base-mode.js';

class RubberBridge extends BaseBridgeMode {
    constructor(gameState, ui) {
        super(gameState, ui);
        this.modeName = 'rubber';
        this.displayName = 'Rubber Bridge';
    }
    
    initialize() {
        this.gameState.setMode('rubber');
        this.updateDisplay();
    }
    
    handleAction(value) {
        console.log('Rubber Bridge action:', value);
        this.updateDisplay();
    }
    
    getActiveButtons() {
        return ['1', '2', '3', '4', '5'];
    }
    
    updateDisplay() {
        const scores = this.gameState.getScores();
        const content = `
            <div class="title-score-row">
                <div class="mode-title">Rubber Bridge</div>
                <div class="score-display">NS: ${scores.NS}<br>EW: ${scores.EW}</div>
            </div>
            <div class="game-content">
                <div>Rubber Bridge mode loaded successfully!</div>
                <div>Traditional rubber scoring</div>
            </div>
            <div class="current-state">Rubber bridge - working!</div>
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
            title: 'Rubber Bridge Help',
            content: 'Traditional rubber bridge scoring - working version.',
            buttons: [{ text: 'Close Help', action: 'close', class: 'close-btn' }]
        };
    }
    
    cleanup() {
        // Clean up
    }
}

export default RubberBridge;