import { BaseBridgeMode } from './base-mode.js';

class KitchenBridge extends BaseBridgeMode {
    constructor(gameState, ui) {
        super(gameState, ui);
        this.modeName = 'kitchen';
        this.displayName = 'Kitchen Bridge';
    }
    
    initialize() {
        this.gameState.setMode('kitchen');
        this.updateDisplay();
    }
    
    handleAction(value) {
        console.log('Kitchen Bridge action:', value);
        this.updateDisplay();
    }
    
    getActiveButtons() {
        return ['1', '2', '3', '4', '5'];
    }
    
    updateDisplay() {
        const scores = this.gameState.getScores();
        const content = `
            <div class="title-score-row">
                <div class="mode-title">Kitchen Bridge</div>
                <div class="score-display">NS: ${scores.NS}<br>EW: ${scores.EW}</div>
            </div>
            <div class="game-content">
                <div>Kitchen Bridge mode loaded successfully!</div>
                <div>Simple bridge scoring for casual play</div>
            </div>
            <div class="current-state">Basic kitchen bridge - working!</div>
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
            title: 'Kitchen Bridge Help',
            content: 'Simple kitchen bridge scoring - working version.',
            buttons: [{ text: 'Close Help', action: 'close', class: 'close-btn' }]
        };
    }
    
    cleanup() {
        // Clean up
    }
}

export default KitchenBridge;