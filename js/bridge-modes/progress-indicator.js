/**
 * Progress Indicator Module for Bridge Modes
 * Provides visual feedback showing:
 * - Where you are in the session
 * - What you've entered so far
 * - What's next to enter
 * - Session progress (deals/hands completed)
 * 
 * Usage: Insert into updateDisplay() method of Chicago/Bonus modes
 */

const ProgressIndicator = {
    /**
     * Generate progress HTML for Chicago Bridge
     * @param {Object} mode - The ChicagoBridge mode instance
     * @returns {string} HTML for progress indicator
     */
    generateChicagoProgress(mode) {
        const deal = mode.currentDeal || 1;
        const totalDeals = 4; // Chicago is 4 deals
        const contract = mode.currentContract;
        const state = mode.inputState;
        
        // Calculate what's been entered
        const hasLevel = contract.level !== null;
        const hasSuit = contract.suit !== null;
        const hasDeclarer = contract.declarer !== null;
        const hasResult = contract.result !== null;
        
        // Determine current step and next action
        let currentStep = '';
        let nextAction = '';
        
        if (!hasLevel) {
            currentStep = 'Waiting for Bid level';
            nextAction = 'Enter 1-7 for bid level';
        } else if (!hasSuit) {
            currentStep = 'Level ' + contract.level + ' entered';
            nextAction = 'Choose suit: C, D, H, S, or N for No Trump';
        } else if (!hasDeclarer) {
            currentStep = contract.level + contract.suit + (contract.doubled || '') + ' entered';
            nextAction = 'Choose declarer: N, S, E, or W';
        } else if (!hasResult) {
            currentStep = 'Contract: ' + contract.level + contract.suit + (contract.doubled || '') + ' by ' + contract.declarer;
            nextAction = 'Enter result: Made/Down/Plus';
        } else {
            currentStep = 'Result entered';
            nextAction = 'Review and confirm';
        }
        
        // Build progress HTML
        let html = `
            <div class="progress-container" style="
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 15px;
                border-radius: 10px;
                margin-bottom: 20px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            ">
                <!-- Deal Progress Bar -->
                <div style="margin-bottom: 12px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;">
                        <span style="font-size: 15px; font-weight: 800; color: #003366;">Deal ${deal} of ${totalDeals}</span>
                        <span style="font-size: 13px; font-weight: 700; color: #003366;">${Math.round((deal / totalDeals) * 100)}%</span>
                    </div>
                    <div style="background: rgba(255,255,255,0.3); height: 8px; border-radius: 4px; overflow: hidden;">
                        <div style="
                            background: white;
                            height: 100%;
                            width: ${(deal / totalDeals) * 100}%;
                            border-radius: 4px;
                            transition: width 0.3s ease;
                        "></div>
                    </div>
                </div>
                
                <!-- Dealer & Vulnerability Info -->
                <div style="display: flex; gap: 10px; margin-bottom: 12px; font-size: 12px;">
                    <div style="
                        background: rgba(255,255,255,0.2);
                        padding: 6px 12px;
                        border-radius: 5px;
                        flex: 1;
                        text-align: center;
                    ">
                        <div style="font-size: 12px; font-weight: 800; color: #003366;">Dealer</div>
                        <div style="font-weight: 800; font-size: 16px; color: #003366;">${mode.getDealerName ? mode.getDealerName() : 'North'}</div>
                    </div>
                    <div style="
                        background: rgba(255,255,255,0.2);
                        padding: 6px 12px;
                        border-radius: 5px;
                        flex: 1;
                        text-align: center;
                    ">
                        <div style="font-size: 12px; font-weight: 800; color: #003366;">Vul</div>
                        <div style="font-weight: 800; font-size: 16px; color: #003366;">${mode.vulnerability || 'None'}</div>
                    </div>
                </div>
                
                <!-- Current Step Indicator -->
                <div style="
                    background: rgba(255,255,255,0.95);
                    color: #2c3e50;
                    padding: 12px;
                    border-radius: 8px;
                    margin-bottom: 10px;
                ">
                    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
                        <div style="
                            background: #667eea;
                            color: white;
                            width: 24px;
                            height: 24px;
                            border-radius: 50%;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            font-weight: 700;
                            font-size: 12px;
                        ">📍</div>
                        <div style="font-weight: 800; font-size: 15px;">${currentStep}</div>
                    </div>
                    <div style="
                        padding-left: 32px;
                        font-size: 13px;
                        font-weight: 600;
                        color: #2c3e50;
                    ">👉 ${nextAction}</div>
                </div>
                
                <!-- Input Progress Steps -->
                <div style="display: flex; gap: 5px; justify-content: space-between;">
                    ${this._generateStep('1', 'Level', hasLevel)}
                    ${this._generateStep('2', 'Suit', hasSuit)}
                    ${this._generateStep('3', 'Declarer', hasDeclarer)}
                    ${this._generateStep('4', 'Result', hasResult)}
                </div>
            </div>
        `;
        
        return html;
    },
    
    /**
     * Generate progress HTML for Bonus Bridge
     * @param {Object} mode - The BonusBridge mode instance
     * @returns {string} HTML for progress indicator
     */
    generateBonusProgress(mode) {
        const deal = mode.currentDeal || 1;
        const contract = mode.currentContract;
        const state = mode.inputState;
        
        // Calculate what's been entered
        const hasLevel = contract.level !== null;
        const hasSuit = contract.suit !== null;
        const hasDeclarer = contract.declarer !== null;
        const hasResult = contract.result !== null;
        const hasHCP = mode.handAnalysis && mode.handAnalysis.totalHCP !== undefined;
        
        // Determine current step
        let currentStep = '';
        let nextAction = '';
        
        if (!hasLevel) {
            currentStep = 'Waiting for Bid level';
            nextAction = 'Enter 1-7 for bid level';
        } else if (!hasSuit) {
            currentStep = 'Level ' + contract.level + ' entered';
            nextAction = 'Choose suit: C, D, H, S, or N';
        } else if (!hasDeclarer) {
            currentStep = contract.level + contract.suit + (contract.doubled || '') + ' entered';
            nextAction = 'Choose declarer: N, S, E, or W';
        } else if (!hasResult) {
            currentStep = 'Contract: ' + contract.level + contract.suit + (contract.doubled || '') + ' by ' + contract.declarer;
            nextAction = 'Enter result: Made/Down/Plus';
        } else if (!hasHCP) {
            currentStep = 'Result entered';
            nextAction = 'Enter HCP analysis (Bonus Bridge feature)';
        } else {
            currentStep = 'Complete - ready to score';
            nextAction = 'Review and confirm';
        }
        
        let html = `
            <div class="progress-container" style="
                background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
                color: white;
                padding: 15px;
                border-radius: 10px;
                margin-bottom: 20px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            ">
                <!-- Hand Counter -->
                <div style="margin-bottom: 12px;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <span style="font-size: 14px; font-weight: 700;">⭐ Hand #${deal}</span>
                        <span style="font-size: 13px; font-weight: 700; color: #003366;">Bonus Bridge</span>
                    </div>
                </div>
                
                <!-- Dealer & Vulnerability -->
                <div style="display: flex; gap: 10px; margin-bottom: 12px; font-size: 12px;">
                    <div style="
                        background: rgba(255,255,255,0.2);
                        padding: 6px 12px;
                        border-radius: 5px;
                        flex: 1;
                        text-align: center;
                    ">
                        <div style="font-size: 12px; font-weight: 800; color: #003366;">Dealer</div>
                        <div style="font-weight: 800; font-size: 16px; color: #003366;">${mode.getDealerName ? mode.getDealerName() : 'North'}</div>
                    </div>
                    <div style="
                        background: rgba(255,255,255,0.2);
                        padding: 6px 12px;
                        border-radius: 5px;
                        flex: 1;
                        text-align: center;
                    ">
                        <div style="font-size: 12px; font-weight: 800; color: #003366;">Vul</div>
                        <div style="font-weight: 800; font-size: 16px; color: #003366;">${mode.vulnerability || 'None'}</div>
                    </div>
                </div>
                
                <!-- Current Step -->
                <div style="
                    background: rgba(255,255,255,0.95);
                    color: #2c3e50;
                    padding: 12px;
                    border-radius: 8px;
                    margin-bottom: 10px;
                ">
                    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
                        <div style="
                            background: #f5576c;
                            color: white;
                            width: 24px;
                            height: 24px;
                            border-radius: 50%;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            font-weight: 700;
                            font-size: 12px;
                        ">📍</div>
                        <div style="font-weight: 800; font-size: 15px;">${currentStep}</div>
                    </div>
                    <div style="
                        padding-left: 32px;
                        font-size: 12px;
                        color: #7f8c8d;
                        font-style: italic;
                    ">👉 ${nextAction}</div>
                </div>
                
                <!-- Input Steps (including HCP for Bonus) -->
                <div style="display: flex; gap: 4px; justify-content: space-between;">
                    ${this._generateStep('1', 'Lvl', hasLevel)}
                    ${this._generateStep('2', 'Suit', hasSuit)}
                    ${this._generateStep('3', 'Decl', hasDeclarer)}
                    ${this._generateStep('4', 'Rslt', hasResult)}
                    ${this._generateStep('5', 'HCP', hasHCP)}
                </div>
            </div>
        `;
        
        return html;
    },
    
    /**
     * Generate a single step indicator
     * @private
     */
    _generateStep(number, label, completed) {
        const bgColor = completed ? 'rgba(46, 204, 113, 0.9)' : 'rgba(255,255,255,0.3)';
        const icon = completed ? '✓' : number;
        
        return `
            <div style="
                background: ${bgColor};
                padding: 8px 4px;
                border-radius: 6px;
                text-align: center;
                flex: 1;
                transition: all 0.3s ease;
            ">
                <div style="font-weight: 800; font-size: 16px; margin-bottom: 2px;">${icon}</div>
                <div style="font-size: 11px; font-weight: 700; opacity: 0.95;">${label}</div>
            </div>
        `;
    },
    
    /**
     * Generate compact progress for mobile (smaller version)
     */
    generateCompactProgress(mode, modeType = 'chicago') {
        const deal = mode.currentDeal || 1;
        const contract = mode.currentContract;
        
        const hasLevel = contract.level !== null;
        const hasSuit = contract.suit !== null;
        const hasDeclarer = contract.declarer !== null;
        const hasResult = contract.result !== null;
        
        const progress = [hasLevel, hasSuit, hasDeclarer, hasResult].filter(Boolean).length;
        const total = modeType === 'bonus' ? 5 : 4;
        const pct = Math.round((progress / total) * 100);
        
        return `
            <div style="
                background: ${modeType === 'bonus' ? '#f5576c' : '#667eea'};
                color: white;
                padding: 8px 12px;
                border-radius: 8px;
                margin-bottom: 15px;
                font-size: 12px;
                display: flex;
                justify-content: space-between;
                align-items: center;
            ">
                <span style="font-weight: 600;">Hand ${deal} • Step ${progress}/${total}</span>
                <span style="opacity: 0.9;">${pct}%</span>
            </div>
        `;
    }
};

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ProgressIndicator;
}
