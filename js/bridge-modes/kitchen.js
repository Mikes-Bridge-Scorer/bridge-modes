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
        const content = `
            <div class="title-score-row">
                <div class="mode-title">Kitchen Bridge</div>
                <div class="score-display">NS: 0<br>EW: 0</div>
            </div>
            <div class="game-content">
                <div>Kitchen Bridge mode loaded successfully!</div>
            </div>
            <div class="current-state">Basic kitchen bridge - under development</div>
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
            content: 'Simple kitchen bridge scoring - under development.',
            buttons: [{ text: 'Close Help', action: 'close', class: 'close-btn' }]
        };
    }
    
    cleanup() {
        // Clean up any resources
    }
}

export default KitchenBridge;