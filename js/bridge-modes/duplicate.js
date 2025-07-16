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
        const content = `
            <div class="title-score-row">
                <div class="mode-title">Bonus Bridge</div>
                <div class="score-display">NS: 0<br>EW: 0</div>
            </div>
            <div class="game-content">
                <div>Bonus Bridge mode - under development</div>
            </div>
            <div class="current-state">Coming soon!</div>
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
            content: 'Bonus Bridge mode - under development.',
            buttons: [{ text: 'Close Help', action: 'close', class: 'close-btn' }]
        };
    }
    
    cleanup() {
        // Clean up
    }
}

export default BonusBridge;