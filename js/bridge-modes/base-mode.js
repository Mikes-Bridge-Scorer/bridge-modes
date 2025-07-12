/**
 * Base Bridge Mode - Abstract base class for all bridge scoring modes
 * 
 * Provides common interface and shared functionality for all bridge modes.
 * Each specific mode (Kitchen, Bonus, Chicago, etc.) extends this class.
 */

class BaseBridgeMode {
    constructor(gameState, ui) {
        if (this.constructor === BaseBridgeMode) {
            throw new Error('BaseBridgeMode is abstract and cannot be instantiated directly');
        }
        
        this.gameState = gameState;
        this.ui = ui;
        
        // Must be set by child classes
        this.modeName = null;
        this.displayName = null;
        
        // Common properties
        this.initialized = false;
        
        console.log(`🎯 Base bridge mode constructor called for ${this.constructor.name}`);
    }
    
    // ===== ABSTRACT METHODS (Must be implemented by child classes) =====
    
    /**
     * Initialize the bridge mode
     * Called when the mode is first selected
     */
    initialize() {
        throw new Error('initialize() must be implemented by child class');
    }
    
    /**
     * Handle user actions (button presses)
     * @param {string} value - The action value (button data-value)
     */
    handleAction(value) {
        throw new Error('handleAction() must be implemented by child class');
    }
    
    /**
     * Get list of currently active buttons
     * @returns {Array<string>} Array of button values that should be enabled
     */
    getActiveButtons() {
        throw new Error('getActiveButtons() must be implemented by child class');
    }
    
    /**
     * Update the display panel
     */
    updateDisplay() {
        throw new Error('updateDisplay() must be implemented by child class');
    }
    
    /**
     * Handle back navigation
     * @returns {boolean} True if handled by mode, false if app should handle
     */
    handleBack() {
        throw new Error('handleBack() must be implemented by child class');
    }
    
    /**
     * Get help content specific to this mode
     * @returns {Object} Help content object with title, content, buttons
     */
    getHelpContent() {
        throw new Error('getHelpContent() must be implemented by child class');
    }
    
    // ===== OPTIONAL METHODS (Can be overridden by child classes) =====
    
    /**
     * Toggle vulnerability (some modes allow manual control)
     */
    toggleVulnerability() {
        // Default: no manual vulnerability control
        console.log(`${this.modeName} does not support manual vulnerability control`);
    }
    
    /**
     * Check if back navigation is possible
     * @returns {boolean}
     */
    canGoBack() {
        return true; // Default: always allow back
    }
    
    /**
     * Cleanup when switching away from this mode
     */
    cleanup() {
        console.log(`🧹 Cleaning up ${this.modeName} mode`);
        this.initialized = false;
    }
    
    /**
     * Reset mode to initial state (for new game)
     */
    reset() {
        console.log(`🔄 Resetting ${this.modeName} mode`);
        this.initialize();
    }
    
    // ===== COMMON UTILITY METHODS =====
    
    /**
     * Get mode display name
     * @returns {string}
     */
    getDisplayName() {
        return this.displayName || this.modeName || 'Unknown Mode';
    }
    
    /**
     * Get mode internal name
     * @returns {string}
     */
    getModeName() {
        return this.modeName;
    }
    
    /**
     * Check if mode is initialized
     * @returns {boolean}
     */
    isInitialized() {
        return this.initialized;
    }
    
    /**
     * Mark mode as initialized
     */
    setInitialized() {
        this.initialized = true;
    }
    
    /**
     * Log mode action for debugging
     * @param {string} action - Action description
     * @param {Object} data - Additional data
     */
    logAction(action, data = {}) {
        console.log(`🎮 [${this.modeName}] ${action}`, data);
    }
    
    /**
     * Validate contract parameters
     * @param {Object} contract - Contract object
     * @throws {Error} If contract is invalid
     */
    validateContract(contract) {
        if (!contract) {
            throw new Error('Contract is required');
        }
        
        if (!contract.level || contract.level < 1 || contract.level > 7) {
            throw new Error('Invalid bid level (must be 1-7)');
        }
        
        if (!contract.suit || !['♣', '♦', '♥', '♠', 'NT'].includes(contract.suit)) {
            throw new Error('Invalid suit');
        }
        
        if (!contract.declarer || !['N', 'S', 'E', 'W'].includes(contract.declarer)) {
            throw new Error('Invalid declarer');
        }
        
        if (contract.doubled && !['', 'X', 'XX'].includes(contract.doubled)) {
            throw new Error('Invalid double state');
        }
    }
    
    /**
     * Calculate basic trick score (common to all bridge modes)
     * @param {number} level - Bid level (1-7)
     * @param {string} suit - Suit (♣♦♥♠NT)
     * @returns {number} Basic score
     */
    calculateBasicScore(level, suit) {
        const suitValues = { '♣': 20, '♦': 20, '♥': 30, '♠': 30, 'NT': 30 };
        let score = level * suitValues[suit];
        
        // No Trump bonus for first trick
        if (suit === 'NT') {
            score += 10;
        }
        
        return score;
    }
    
    /**
     * Check if declarer is vulnerable
     * @param {string} declarer - Declarer direction (N/S/E/W)
     * @param {string} vulnerability - Current vulnerability (None/NS/EW/Both)
     * @returns {boolean}
     */
    isDeclarerVulnerable(declarer, vulnerability = null) {
        if (!vulnerability) {
            vulnerability = this.gameState.getVulnerability();
        }
        
        const declarerSide = ['N', 'S'].includes(declarer) ? 'NS' : 'EW';
        return vulnerability === declarerSide || vulnerability === 'Both';
    }
    
    /**
     * Get partnership from direction
     * @param {string} direction - Direction (N/S/E/W)
     * @returns {string} Partnership (NS/EW)
     */
    getPartnership(direction) {
        return ['N', 'S'].includes(direction) ? 'NS' : 'EW';
    }
    
    /**
     * Format contract for display
     * @param {Object} contract - Contract object
     * @returns {string} Formatted contract string
     */
    formatContract(contract) {
        if (!contract.level || !contract.suit) return '';
        return `${contract.level}${contract.suit}${contract.doubled || ''}`;
    }
    
    /**
     * Calculate maximum overtricks possible
     * @param {number} level - Bid level
     * @returns {number} Maximum overtricks
     */
    getMaxOvertricks(level) {
        return Math.max(0, 13 - (6 + level));
    }
    
    /**
     * Check if result indicates made contract
     * @param {string} result - Result string (=, +1, -1, etc.)
     * @returns {boolean}
     */
    isContractMade(result) {
        return result === '=' || (result && result.startsWith('+'));
    }
    
    /**
     * Parse result into numeric value
     * @param {string} result - Result string
     * @returns {Object} Parsed result with type and number
     */
    parseResult(result) {
        if (!result) return { type: 'unknown', number: 0 };
        
        if (result === '=') {
            return { type: 'made', number: 0 };
        } else if (result.startsWith('+')) {
            return { type: 'plus', number: parseInt(result.substring(1)) || 0 };
        } else if (result.startsWith('-')) {
            return { type: 'down', number: parseInt(result.substring(1)) || 0 };
        } else {
            return { type: 'unknown', number: 0 };
        }
    }
    
    // ===== COMMON SCORING UTILITIES =====
    
    /**
     * Calculate doubled penalty (standard bridge rules)
     * @param {number} undertricks - Number of undertricks
     * @param {string} doubled - Double state ('X' or 'XX')
     * @param {boolean} vulnerable - Is declarer vulnerable
     * @returns {number} Penalty amount (positive number)
     */
    calculateDoubledPenalty(undertricks, doubled, vulnerable) {
        let penalty = 0;
        const multiplier = doubled === 'XX' ? 2 : 1;
        
        for (let i = 1; i <= undertricks; i++) {
            if (i === 1) {
                penalty += (vulnerable ? 200 : 100) * multiplier;
            } else if (i <= 3) {
                penalty += (vulnerable ? 300 : 200) * multiplier;
            } else {
                penalty += 300 * multiplier;
            }
        }
        
        return penalty;
    }
    
    /**
     * Calculate doubled overtricks
     * @param {number} overtricks - Number of overtricks
     * @param {string} doubled - Double state ('X' or 'XX')
     * @param {boolean} vulnerable - Is declarer vulnerable
     * @returns {number} Overtrick score
     */
    calculateDoubledOvertricks(overtricks, doubled, vulnerable) {
        if (!doubled || doubled === '') return 0;
        
        const multiplier = doubled === 'XX' ? 2 : 1;
        return overtricks * (vulnerable ? 200 : 100) * multiplier;
    }
    
    /**
     * Get game bonus amount
     * @param {number} basicScore - Basic contract score
     * @param {boolean} vulnerable - Is declarer vulnerable
     * @returns {number} Game bonus
     */
    getGameBonus(basicScore, vulnerable) {
        if (basicScore >= 100) {
            return vulnerable ? 500 : 300; // Game bonus
        } else {
            return 50; // Part-game bonus
        }
    }
    
    /**
     * Get slam bonus
     * @param {number} level - Contract level
     * @param {boolean} vulnerable - Is declarer vulnerable
     * @returns {number} Slam bonus
     */
    getSlamBonus(level, vulnerable) {
        if (level === 6) {
            return vulnerable ? 750 : 500; // Small slam
        } else if (level === 7) {
            return vulnerable ? 1500 : 1000; // Grand slam
        }
        return 0;
    }
    
    /**
     * Get double bonus
     * @param {string} doubled - Double state
     * @returns {number} Double bonus
     */
    getDoubleBonus(doubled) {
        if (doubled === 'X') return 50;
        if (doubled === 'XX') return 100;
        return 0;
    }
    
    // ===== COMMON DISPLAY HELPERS =====
    
    /**
     * Create standard title-score row HTML
     * @returns {string} HTML for title and score display
     */
    getTitleScoreRow() {
        const scores = this.gameState.getScores();
        return `
            <div class="title-score-row">
                <div class="mode-title">${this.getDisplayName()}</div>
                <div class="score-display">
                    NS: ${scores.NS}<br>
                    EW: ${scores.EW}
                </div>
            </div>
        `;
    }
    
    /**
     * Create standard deal number display
     * @returns {string} HTML for deal number
     */
    getDealNumberDisplay() {
        return `<div><strong>Deal ${this.gameState.getDealNumber()}</strong></div>`;
    }
    
    /**
     * Create contract display string
     * @param {Object} contract - Contract object
     * @returns {string} HTML for contract display
     */
    getContractDisplay(contract) {
        let display = '';
        
        if (contract.level && contract.suit) {
            display += `${contract.level}${contract.suit}`;
        }
        
        if (contract.doubled) {
            display += contract.doubled;
        }
        
        if (contract.declarer) {
            display += ` by ${contract.declarer}`;
        }
        
        return display;
    }
    
    // ===== ERROR HANDLING =====
    
    /**
     * Handle mode-specific errors
     * @param {Error} error - The error object
     * @param {string} context - Context where error occurred
     */
    handleError(error, context = 'unknown') {
        console.error(`❌ [${this.modeName}] Error in ${context}:`, error);
        
        // Show user-friendly error through UI
        this.ui.showError(`${this.getDisplayName()}: ${error.message}`);
    }
    
    /**
     * Validate mode requirements
     * @throws {Error} If mode requirements not met
     */
    validateModeRequirements() {
        if (!this.gameState) {
            throw new Error('GameState is required');
        }
        
        if (!this.ui) {
            throw new Error('UIController is required');
        }
        
        if (!this.modeName) {
            throw new Error('Mode name must be set by child class');
        }
    }
    
    /**
     * Safe action execution with error handling
     * @param {Function} action - Action function to execute
     * @param {string} context - Context description
     * @returns {boolean} True if successful, false if error
     */
    safeExecute(action, context = 'action') {
        try {
            action();
            return true;
        } catch (error) {
            this.handleError(error, context);
            return false;
        }
    }
}

// Export the base class
export { BaseBridgeMode };