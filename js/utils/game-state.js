/**
 * Game State Manager - Centralized state management for Bridge Calculator
 * 
 * Manages all game state including scores, history, deal tracking, and persistence.
 * Provides a clean API for bridge modes to interact with game data.
 */

class GameState {
    constructor() {
        // Core game state
        this.state = {
            // Current mode info
            mode: null,
            modeName: null,
            
            // Deal tracking
            dealNumber: 1,
            vulnerability: 'None',
            
            // Scores
            scores: {
                NS: 0,
                EW: 0
            },
            
            // Game history
            history: [],
            
            // Session info
            sessionStartTime: new Date().toISOString(),
            lastModified: new Date().toISOString(),
            
            // Settings
            settings: {
                keepAwake: false,
                autoSave: true,
                showDetailedScoring: false
            }
        };
        
        // State change listeners
        this.listeners = new Map();
        
        // Auto-save timer
        this.autoSaveTimer = null;
        
        console.log('🎯 Game State initialized');
        this.setupAutoSave();
    }
    
    // ===== MODE MANAGEMENT =====
    
    /**
     * Set the current bridge mode
     * @param {string} modeName - Mode identifier (kitchen, bonus, etc.)
     */
    setMode(modeName) {
        const oldMode = this.state.modeName;
        this.state.modeName = modeName;
        this.state.mode = modeName;
        
        console.log(`🎮 Mode changed: ${oldMode} → ${modeName}`);
        this.markModified();
        this.notifyListeners('modeChanged', { oldMode, newMode: modeName });
    }
    
    /**
     * Get current mode name
     * @returns {string|null}
     */
    getMode() {
        return this.state.modeName;
    }
    
    /**
     * Check if a specific mode is active
     * @param {string} modeName - Mode to check
     * @returns {boolean}
     */
    isMode(modeName) {
        return this.state.modeName === modeName;
    }
    
    // ===== DEAL MANAGEMENT =====
    
    /**
     * Get current deal number
     * @returns {number}
     */
    getDealNumber() {
        return this.state.dealNumber;
    }
    
    /**
     * Move to next deal
     */
    nextDeal() {
        this.state.dealNumber++;
        console.log(`🃏 Advanced to deal ${this.state.dealNumber}`);
        this.markModified();
        this.notifyListeners('dealChanged', { dealNumber: this.state.dealNumber });
    }
    
    /**
     * Set specific deal number
     * @param {number} dealNumber - Deal number to set
     */
    setDealNumber(dealNumber) {
        if (dealNumber < 1) {
            throw new Error('Deal number must be positive');
        }
        
        this.state.dealNumber = dealNumber;
        this.markModified();
        this.notifyListeners('dealChanged', { dealNumber });
    }
    
    /**
     * Reset to deal 1
     */
    resetDeals() {
        this.state.dealNumber = 1;
        this.markModified();
        console.log('🔄 Reset to deal 1');
    }
    
    // ===== VULNERABILITY MANAGEMENT =====
    
    /**
     * Get current vulnerability
     * @returns {string} - 'None', 'NS', 'EW', or 'Both'
     */
    getVulnerability() {
        return this.state.vulnerability;
    }
    
    /**
     * Set vulnerability
     * @param {string} vulnerability - Vulnerability state
     */
    setVulnerability(vulnerability) {
        const validVulns = ['None', 'NS', 'EW', 'Both'];
        if (!validVulns.includes(vulnerability)) {
            throw new Error(`Invalid vulnerability: ${vulnerability}`);
        }
        
        this.state.vulnerability = vulnerability;
        this.markModified();
        this.notifyListeners('vulnerabilityChanged', { vulnerability });
    }
    
    /**
     * Check if a partnership is vulnerable
     * @param {string} partnership - 'NS' or 'EW'
     * @returns {boolean}
     */
    isVulnerable(partnership) {
        return this.state.vulnerability === partnership || this.state.vulnerability === 'Both';
    }
    
    // ===== SCORE MANAGEMENT =====
    
    /**
     * Get current scores
     * @returns {Object} Scores object with NS and EW properties
     */
    getScores() {
        return { ...this.state.scores };
    }
    
    /**
     * Get score for specific partnership
     * @param {string} partnership - 'NS' or 'EW'
     * @returns {number}
     */
    getScore(partnership) {
        if (!['NS', 'EW'].includes(partnership)) {
            throw new Error(`Invalid partnership: ${partnership}`);
        }
        
        return this.state.scores[partnership];
    }
    
    /**
     * Add score to a partnership
     * @param {string} partnership - 'NS' or 'EW'
     * @param {number} points - Points to add (can be negative)
     */
    addScore(partnership, points) {
        if (!['NS', 'EW'].includes(partnership)) {
            throw new Error(`Invalid partnership: ${partnership}`);
        }
        
        if (typeof points !== 'number') {
            throw new Error('Points must be a number');
        }
        
        this.state.scores[partnership] += points;
        
        console.log(`💰 Score update: ${partnership} ${points >= 0 ? '+' : ''}${points} (total: ${this.state.scores[partnership]})`);
        
        this.markModified();
        this.notifyListeners('scoreChanged', { 
            partnership, 
            points, 
            newTotal: this.state.scores[partnership],
            scores: this.getScores()
        });
    }
    
    /**
     * Set score for a partnership
     * @param {string} partnership - 'NS' or 'EW'
     * @param {number} score - New score
     */
    setScore(partnership, score) {
        if (!['NS', 'EW'].includes(partnership)) {
            throw new Error(`Invalid partnership: ${partnership}`);
        }
        
        if (typeof score !== 'number') {
            throw new Error('Score must be a number');
        }
        
        this.state.scores[partnership] = score;
        this.markModified();
        this.notifyListeners('scoreChanged', { 
            partnership, 
            newTotal: score,
            scores: this.getScores()
        });
    }
    
    /**
     * Reset all scores to zero
     */
    resetScores() {
        this.state.scores = { NS: 0, EW: 0 };
        this.markModified();
        this.notifyListeners('scoresReset', { scores: this.getScores() });
        console.log('🔄 Scores reset to zero');
    }
    
    /**
     * Get score difference (NS - EW)
     * @returns {number} Positive if NS ahead, negative if EW ahead
     */
    getScoreDifference() {
        return this.state.scores.NS - this.state.scores.EW;
    }
    
    /**
     * Get leading partnership
     * @returns {string|null} 'NS', 'EW', or null if tied
     */
    getLeader() {
        const diff = this.getScoreDifference();
        if (diff > 0) return 'NS';
        if (diff < 0) return 'EW';
        return null;
    }
    
    // ===== HISTORY MANAGEMENT =====
    
    /**
     * Add entry to game history
     * @param {Object} entry - History entry
     */
    addToHistory(entry) {
        const historyEntry = {
            ...entry,
            timestamp: new Date().toISOString(),
            id: Date.now() + Math.random() // Simple unique ID
        };
        
        this.state.history.push(historyEntry);
        
        console.log(`📝 History entry added: Deal ${entry.deal}`);
        
        this.markModified();
        this.notifyListeners('historyChanged', { 
            entry: historyEntry, 
            historyLength: this.state.history.length 
        });
    }
    
    /**
     * Get complete game history
     * @returns {Array} Copy of history array
     */
    getHistory() {
        return [...this.state.history];
    }
    
    /**
     * Get last history entry
     * @returns {Object|null}
     */
    getLastHistoryEntry() {
        return this.state.history.length > 0 ? 
            { ...this.state.history[this.state.history.length - 1] } : 
            null;
    }
    
    /**
     * Remove last history entry
     * @returns {Object|null} Removed entry
     */
    removeLastHistoryEntry() {
        const removed = this.state.history.pop();
        
        if (removed) {
            console.log(`↩️ Removed history entry: Deal ${removed.deal}`);
            this.markModified();
            this.notifyListeners('historyChanged', { 
                removedEntry: removed,
                historyLength: this.state.history.length 
            });
        }
        
        return removed;
    }
    
    /**
     * Get history for specific deal
     * @param {number} dealNumber - Deal number
     * @returns {Array} History entries for that deal
     */
    getHistoryForDeal(dealNumber) {
        return this.state.history.filter(entry => entry.deal === dealNumber);
    }
    
    /**
     * Get history summary statistics
     * @returns {Object} Summary stats
     */
    getHistorySummary() {
        const history = this.state.history;
        
        const summary = {
            totalDeals: history.length,
            nsWins: 0,
            ewWins: 0,
            nsPoints: 0,
            ewPoints: 0,
            doubles: 0,
            redoubles: 0,
            slams: 0,
            grandSlams: 0,
            contracts: {
                made: 0,
                failed: 0
            }
        };
        
        history.forEach(entry => {
            const partnership = ['N', 'S'].includes(entry.contract?.declarer) ? 'NS' : 'EW';
            
            if (entry.score > 0) {
                if (partnership === 'NS') {
                    summary.nsWins++;
                    summary.nsPoints += entry.score;
                } else {
                    summary.ewWins++;
                    summary.ewPoints += entry.score;
                }
                summary.contracts.made++;
            } else {
                summary.contracts.failed++;
                // Add penalty to opposing side
                if (partnership === 'NS') {
                    summary.ewPoints += Math.abs(entry.score);
                } else {
                    summary.nsPoints += Math.abs(entry.score);
                }
            }
            
            // Count special features
            if (entry.contract?.doubled === 'X') summary.doubles++;
            if (entry.contract?.doubled === 'XX') summary.redoubles++;
            if (entry.contract?.level === 6) summary.slams++;
            if (entry.contract?.level === 7) summary.grandSlams++;
        });
        
        return summary;
    }
    
    /**
     * Clear all history
     */
    clearHistory() {
        this.state.history = [];
        this.markModified();
        this.notifyListeners('historyCleared');
        console.log('🗑️ History cleared');
    }
    
    // ===== SETTINGS MANAGEMENT =====
    
    /**
     * Get setting value
     * @param {string} key - Setting key
     * @returns {*} Setting value
     */
    getSetting(key) {
        return this.state.settings[key];
    }
    
    /**
     * Set setting value
     * @param {string} key - Setting key
     * @param {*} value - Setting value
     */
    setSetting(key, value) {
        this.state.settings[key] = value;
        this.markModified();
        this.notifyListeners('settingChanged', { key, value });
        console.log(`⚙️ Setting changed: ${key} = ${value}`);
    }
    
    /**
     * Get all settings
     * @returns {Object} Copy of settings
     */
    getSettings() {
        return { ...this.state.settings };
    }
    
    // ===== STATE PERSISTENCE =====
    
    /**
     * Export current state for saving
     * @returns {Object} Serializable state object
     */
    exportState() {
        return {
            ...this.state,
            exportedAt: new Date().toISOString(),
            version: '1.0'
        };
    }
    
    /**
     * Import state from saved data
     * @param {Object} savedState - Previously exported state
     */
    importState(savedState) {
        if (!savedState || typeof savedState !== 'object') {
            throw new Error('Invalid state data');
        }
        
        // Validate essential properties
        const requiredProps = ['dealNumber', 'vulnerability', 'scores', 'history'];
        for (const prop of requiredProps) {
            if (!(prop in savedState)) {
                throw new Error(`Missing required property: ${prop}`);
            }
        }
        
        // Merge with current state, preserving structure
        this.state = {
            ...this.state,
            ...savedState,
            lastModified: new Date().toISOString()
        };
        
        console.log('📥 State imported successfully');
        this.notifyListeners('stateImported', { state: this.state });
    }
    
    /**
     * Save state to localStorage
     */
    saveToLocalStorage() {
        try {
            const stateData = JSON.stringify(this.exportState());
            localStorage.setItem('bridgeCalculatorState', stateData);
            console.log('💾 State saved to localStorage');
        } catch (error) {
            console.error('❌ Failed to save state:', error);
        }
    }
    
    /**
     * Load state from localStorage
     * @returns {boolean} True if loaded successfully
     */
    loadFromLocalStorage() {
        try {
            const stateData = localStorage.getItem('bridgeCalculatorState');
            if (stateData) {
                const parsedState = JSON.parse(stateData);
                this.importState(parsedState);
                console.log('📤 State loaded from localStorage');
                return true;
            }
        } catch (error) {
            console.error('❌ Failed to load state:', error);
        }
        return false;
    }
    
    /**
     * Clear saved state from localStorage
     */
    clearLocalStorage() {
        localStorage.removeItem('bridgeCalculatorState');
        console.log('🗑️ Cleared localStorage');
    }
    
    // ===== STATE MANAGEMENT =====
    
    /**
     * Reset to initial state
     */
    reset() {
        const keepAwake = this.state.settings.keepAwake;
        
        this.state = {
            mode: null,
            modeName: null,
            dealNumber: 1,
            vulnerability: 'None',
            scores: { NS: 0, EW: 0 },
            history: [],
            sessionStartTime: new Date().toISOString(),
            lastModified: new Date().toISOString(),
            settings: {
                keepAwake: keepAwake, // Preserve wake setting
                autoSave: true,
                showDetailedScoring: false
            }
        };
        
        console.log('🔄 Game state reset');
        this.notifyListeners('stateReset');
    }
    
    /**
     * Mark state as modified
     */
    markModified() {
        this.state.lastModified = new Date().toISOString();
        
        // Trigger auto-save if enabled
        if (this.state.settings.autoSave) {
            this.scheduleAutoSave();
        }
    }
    
    /**
     * Setup auto-save functionality
     */
    setupAutoSave() {
        // Auto-save every 30 seconds if modified
        setInterval(() => {
            if (this.state.settings.autoSave) {
                this.saveToLocalStorage();
            }
        }, 30000);
    }
    
    /**
     * Schedule auto-save (debounced)
     */
    scheduleAutoSave() {
        if (this.autoSaveTimer) {
            clearTimeout(this.autoSaveTimer);
        }
        
        this.autoSaveTimer = setTimeout(() => {
            this.saveToLocalStorage();
        }, 2000); // Save 2 seconds after last change
    }
    
    // ===== EVENT SYSTEM =====
    
    /**
     * Add event listener
     * @param {string} event - Event name
     * @param {Function} callback - Callback function
     * @returns {Function} Unsubscribe function
     */
    addEventListener(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, new Set());
        }
        
        this.listeners.get(event).add(callback);
        
        // Return unsubscribe function
        return () => {
            const eventListeners = this.listeners.get(event);
            if (eventListeners) {
                eventListeners.delete(callback);
            }
        };
    }
    
    /**
     * Remove event listener
     * @param {string} event - Event name
     * @param {Function} callback - Callback function
     */
    removeEventListener(event, callback) {
        const eventListeners = this.listeners.get(event);
        if (eventListeners) {
            eventListeners.delete(callback);
        }
    }
    
    /**
     * Notify all listeners of an event
     * @param {string} event - Event name
     * @param {*} data - Event data
     */
    notifyListeners(event, data = null) {
        const eventListeners = this.listeners.get(event);
        if (eventListeners) {
            eventListeners.forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`Error in event listener for ${event}:`, error);
                }
            });
        }
    }
    
    // ===== UTILITY METHODS =====
    
    /**
     * Get current state snapshot
     * @returns {Object} Deep copy of current state
     */
    getSnapshot() {
        return JSON.parse(JSON.stringify(this.state));
    }
    
    /**
     * Check if game has started (any history entries)
     * @returns {boolean}
     */
    hasGameStarted() {
        return this.state.history.length > 0;
    }
    
    /**
     * Get session duration in milliseconds
     * @returns {number}
     */
    getSessionDuration() {
        return new Date() - new Date(this.state.sessionStartTime);
    }
    
    /**
     * Get human-readable session duration
     * @returns {string}
     */
    getSessionDurationString() {
        const duration = this.getSessionDuration();
        const minutes = Math.floor(duration / 60000);
        const seconds = Math.floor((duration % 60000) / 1000);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
}

// Export the GameState class
export { GameState };