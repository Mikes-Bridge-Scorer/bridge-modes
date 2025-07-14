/**
 * Game State Management - Enhanced with Dealer Rotation
 * Manages scores, deal progression, vulnerability, and dealer rotation
 */

class GameState {
    constructor() {
        this.scores = { NS: 0, EW: 0 };
        this.dealNumber = 1;
        this.vulnerability = 'None';
        this.currentMode = null;
        this.history = [];
        this.sessionStartTime = Date.now();
        
        // Dealer rotation (standard bridge)
        this.dealerCycle = ['N', 'E', 'S', 'W'];
        
        console.log('🎯 Game State initialized with dealer rotation');
        this.saveState();
    }
    
    /**
     * Initialize or load saved state
     */
    init() {
        this.loadState();
        console.log('🎮 Game State ready:', {
            deal: this.dealNumber,
            dealer: this.getDealer(),
            vulnerability: this.vulnerability,
            scores: this.scores
        });
    }
    
    /**
     * Get current dealer based on deal number
     */
    getDealer() {
        const dealerIndex = (this.dealNumber - 1) % 4;
        return this.dealerCycle[dealerIndex];
    }
    
    /**
     * Get dealer for a specific deal number
     */
    getDealerForDeal(dealNumber) {
        const dealerIndex = (dealNumber - 1) % 4;
        return this.dealerCycle[dealerIndex];
    }
    
    /**
     * Set the current bridge mode
     */
    setMode(mode) {
        const oldMode = this.currentMode;
        this.currentMode = mode;
        
        // Auto-set vulnerability based on mode
        if (mode === 'chicago' || mode === 'bonus') {
            this.updateAutoVulnerability();
        } else {
            // Kitchen Bridge and others keep manual control
            if (!this.vulnerability || this.vulnerability === 'None') {
                this.vulnerability = 'None';
            }
        }
        
        console.log(`🎮 Mode changed: ${oldMode} → ${mode}`);
        this.saveState();
    }
    
    /**
     * Update vulnerability automatically for Chicago and Bonus Bridge
     */
    updateAutoVulnerability() {
        if (this.currentMode === 'chicago' || this.currentMode === 'bonus') {
            const vulnerabilityCycle = ['None', 'NS', 'EW', 'Both'];
            const vulnIndex = (this.dealNumber - 1) % 4;
            this.vulnerability = vulnerabilityCycle[vulnIndex];
            console.log(`🔄 Auto vulnerability: Deal ${this.dealNumber} → ${this.vulnerability}`);
        }
    }
    
    /**
     * Get current deal number
     */
    getDealNumber() {
        return this.dealNumber;
    }
    
    /**
     * Move to next deal
     */
    nextDeal() {
        this.dealNumber++;
        
        // Update vulnerability for auto modes
        if (this.currentMode === 'chicago' || this.currentMode === 'bonus') {
            this.updateAutoVulnerability();
        }
        
        console.log(`🃏 Next deal: ${this.dealNumber} • Dealer: ${this.getDealer()} • Vuln: ${this.vulnerability}`);
        this.saveState();
    }
    
    /**
     * Get current vulnerability
     */
    getVulnerability() {
        return this.vulnerability;
    }
    
    /**
     * Set vulnerability (for manual control modes)
     */
    setVulnerability(vuln) {
        if (this.currentMode === 'chicago' || this.currentMode === 'bonus') {
            console.warn('⚠️ Manual vulnerability not allowed in auto modes');
            return;
        }
        
        this.vulnerability = vuln;
        console.log(`🎯 Vulnerability set to: ${vuln}`);
        this.saveState();
    }
    
    /**
     * Get formatted deal info string
     */
    getDealInfo() {
        const dealer = this.getDealer();
        const vulnDisplay = {
            'None': 'None',
            'NS': 'NS',
            'EW': 'EW', 
            'Both': 'All'
        };
        
        return `Deal ${this.dealNumber} • Dealer: ${dealer} • Vuln: ${vulnDisplay[this.vulnerability]}`;
    }
    
    /**
     * Get cycle information for Chicago Bridge
     */
    getChicagoCycleInfo() {
        const cyclePosition = ((this.dealNumber - 1) % 4) + 1;
        const cycleNumber = Math.floor((this.dealNumber - 1) / 4) + 1;
        
        return {
            dealNumber: this.dealNumber,
            cyclePosition,
            cycleNumber,
            dealer: this.getDealer(),
            vulnerability: this.vulnerability
        };
    }
    
    /**
     * Add score to a team
     */
    addScore(team, points) {
        if (team === 'NS' || team === 'EW') {
            this.scores[team] += points;
            console.log(`📊 Score added: ${team} +${points} → ${this.scores[team]}`);
            this.saveState();
        } else {
            console.error('Invalid team:', team);
        }
    }
    
    /**
     * Get current scores
     */
    getScores() {
        return { ...this.scores };
    }
    
    /**
     * Get score for specific team
     */
    getScore(team) {
        return this.scores[team] || 0;
    }
    
    /**
     * Reset scores
     */
    resetScores() {
        this.scores = { NS: 0, EW: 0 };
        console.log('🔄 Scores reset');
        this.saveState();
    }
    
    /**
     * Add entry to history
     */
    addToHistory(entry) {
        // Add dealer information to history entry
        entry.dealer = this.getDealer();
        
        this.history.push(entry);
        console.log('📝 Added to history:', entry);
        this.saveState();
    }
    
    /**
     * Get history
     */
    getHistory() {
        return [...this.history];
    }
    
    /**
     * Get last history entry
     */
    getLastHistoryEntry() {
        return this.history.length > 0 ? this.history[this.history.length - 1] : null;
    }
    
    /**
     * Remove last history entry
     */
    removeLastHistoryEntry() {
        if (this.history.length > 0) {
            const removed = this.history.pop();
            console.log('↩️ Removed from history:', removed);
            this.saveState();
            return removed;
        }
        return null;
    }
    
    /**
     * Clear all history
     */
    clearHistory() {
        this.history = [];
        console.log('🧹 History cleared');
        this.saveState();
    }
    
    /**
     * Reset entire game state
     */
    reset() {
        this.scores = { NS: 0, EW: 0 };
        this.dealNumber = 1;
        this.vulnerability = 'None';
        this.currentMode = null;
        this.history = [];
        this.sessionStartTime = Date.now();
        
        console.log('🔄 Game state reset');
        this.saveState();
    }
    
    /**
     * Get session duration as formatted string
     */
    getSessionDurationString() {
        const durationMs = Date.now() - this.sessionStartTime;
        const minutes = Math.floor(durationMs / 60000);
        const hours = Math.floor(minutes / 60);
        
        if (hours > 0) {
            return `${hours}h ${minutes % 60}m`;
        } else {
            return `${minutes}m`;
        }
    }
    
    /**
     * Save state to localStorage
     */
    saveState() {
        try {
            const state = {
                scores: this.scores,
                dealNumber: this.dealNumber,
                vulnerability: this.vulnerability,
                currentMode: this.currentMode,
                history: this.history,
                sessionStartTime: this.sessionStartTime,
                timestamp: Date.now()
            };
            
            localStorage.setItem('bridgeGameState', JSON.stringify(state));
            console.log('💾 State saved to localStorage');
        } catch (error) {
            console.error('❌ Failed to save state:', error);
        }
    }
    
    /**
     * Load state from localStorage
     */
    loadState() {
        try {
            const saved = localStorage.getItem('bridgeGameState');
            if (saved) {
                const state = JSON.parse(saved);
                
                // Validate and restore state
                this.scores = state.scores || { NS: 0, EW: 0 };
                this.dealNumber = state.dealNumber || 1;
                this.vulnerability = state.vulnerability || 'None';
                this.currentMode = state.currentMode || null;
                this.history = state.history || [];
                this.sessionStartTime = state.sessionStartTime || Date.now();
                
                console.log('📂 State loaded from localStorage');
            }
        } catch (error) {
            console.error('❌ Failed to load state:', error);
            // Continue with default state
        }
    }
    
    /**
     * Export game data for sharing/backup
     */
    exportData() {
        return {
            scores: this.scores,
            dealNumber: this.dealNumber,
            dealer: this.getDealer(),
            vulnerability: this.vulnerability,
            currentMode: this.currentMode,
            history: this.history,
            sessionDuration: this.getSessionDurationString(),
            exportTimestamp: new Date().toISOString()
        };
    }
    
    /**
     * Get statistics about current session
     */
    getSessionStats() {
        const totalDeals = this.history.length;
        let contractsMade = 0;
        let contractsFailed = 0;
        let doublesSuccessful = 0;
        let doublesTotal = 0;
        
        this.history.forEach(entry => {
            if (entry.score >= 0) {
                contractsMade++;
            } else {
                contractsFailed++;
            }
            
            if (entry.contract && entry.contract.doubled) {
                doublesTotal++;
                if (entry.score >= 0) {
                    doublesSuccessful++;
                }
            }
        });
        
        const successRate = totalDeals > 0 ? Math.round((contractsMade / totalDeals) * 100) : 0;
        const scoreDifference = this.scores.NS - this.scores.EW;
        const leader = scoreDifference > 0 ? 'NS' : scoreDifference < 0 ? 'EW' : null;
        const leadMargin = Math.abs(scoreDifference);
        
        return {
            totalDeals,
            contractsMade,
            contractsFailed,
            successRate,
            doublesSuccessful,
            doublesTotal,
            leader,
            leadMargin,
            sessionDuration: this.getSessionDurationString()
        };
    }
}

// Export the GameState class
export { GameState };