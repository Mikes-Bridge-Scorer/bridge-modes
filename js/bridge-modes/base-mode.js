class BaseBridgeMode {
    constructor(gameState, ui) {
        this.gameState = gameState;
        this.ui = ui;
        this.modeName = 'base';
        this.displayName = 'Base Mode';
        console.log('🎯 Base bridge mode constructor called for', this.constructor.name);
    }
    
    // Abstract methods that child classes should implement
    initialize() {
        throw new Error('initialize() must be implemented by child class');
    }
    
    handleAction(value) {
        throw new Error('handleAction() must be implemented by child class');
    }
    
    getActiveButtons() {
        throw new Error('getActiveButtons() must be implemented by child class');
    }
    
    updateDisplay() {
        throw new Error('updateDisplay() must be implemented by child class');
    }
    
    getHelpContent() {
        return {
            title: 'Help',
            content: 'No help available for this mode.',
            buttons: [{ text: 'Close Help', action: 'close', class: 'close-btn' }]
        };
    }
    
    // Optional methods with default implementations
    handleBack() {
        return false; // Cannot go back by default
    }
    
    canGoBack() {
        return false;
    }
    
    toggleVulnerability() {
        // Default: do nothing
    }
    
    cleanup() {
        // Default: do nothing
    }
}

export { BaseBridgeMode };