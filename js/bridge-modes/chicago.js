/**
 * Chicago Bridge Mode - 4-Deal Vulnerability Cycle Bridge (Enhanced)
 * 
 * Chicago Bridge combines standard bridge scoring with a structured 4-deal 
 * vulnerability cycle: None → NS → EW → Both → repeat. This provides 
 * predictable, fair vulnerability rotation with natural break points.
 * 
 * Enhanced with comprehensive dealer rotation and vulnerability display.
 */

import { BaseBridgeMode } from './base-mode.js';

class ChicagoBridge extends BaseBridgeMode {
    constructor(gameState, ui) {
        super(gameState, ui);
        
        this.modeName = 'chicago';
        this.displayName = 'Chicago Bridge';
        
        // Chicago Bridge state
        this.currentContract = {
            level: null,
            suit: null,
            declarer: null,
            doubled: '',
            result: null
        };
        
        this.inputState = 'level_selection';
        this.resultMode = null; // 'down', 'plus'
        
        console.log('🏙️ Chicago Bridge mode initialized');
    }
    
    /**
     * Initialize Chicago Bridge mode
     */
    initialize() {
        console.log('🎯 Starting Chicago Bridge session');
        
        // Chicago Bridge uses automatic vulnerability cycling
        this.gameState.setMode('chicago'); // This enables auto vulnerability
        
        // Start with level selection
        this.inputState = 'level_selection';
        this.resetContract();
        
        this.updateDisplay();
    }
    
    /**
     * Handle user actions
     */
    handleAction(value) {
        console.log(`🎮 Chicago Bridge action: ${value} in state: ${this.inputState}`);
        
        switch (this.inputState) {
            case 'level_selection':
                this.handleLevelSelection(value);
                break;
            case 'suit_selection':
                this.handleSuitSelection(value);
                break;
            case 'declarer_selection':
                this.handleDeclarerSelection(value);
                break;
            case 'result_type_selection':
                this.handleResultTypeSelection(value);
                break;
            case 'result_number_selection':
                this.handleResultNumberSelection(value);
                break;
            case 'scoring':
                this.handleScoringActions(value);
                break;
        }
        
        this.updateDisplay();
    }
    
    /**
     * Handle bid level selection (1-7)
     */
    handleLevelSelection(value) {
        if (['1', '2', '3', '4', '5', '6', '7'].includes(value)) {
            this.currentContract.level = parseInt(value);
            this.inputState = 'suit_selection';
            console.log(`📊 Level selected: ${this.currentContract.level}`);
        }
    }
    
    /**
     * Handle suit selection
     */
    handleSuitSelection(value) {
        if (['♣', '♦', '♥', '♠', 'NT'].includes(value)) {
            this.currentContract.suit = value;
            this.inputState = 'declarer_selection';
            console.log(`♠ Suit selected: ${this.currentContract.suit}`);
        }
    }
    
    /**
     * Handle declarer selection and doubling
     */
    handleDeclarerSelection(value) {
        if (['N', 'S', 'E', 'W'].includes(value)) {
            this.currentContract.declarer = value;
            this.ui.highlightVulnerability(value, this.gameState.getVulnerability());
            console.log(`👤 Declarer selected: ${this.currentContract.declarer}`);
            
            // Don't advance state yet - allow doubling and result entry
        } else if (value === 'X') {
            this.handleDoubling();
        } else if (['MADE', 'PLUS', 'DOWN'].includes(value)) {
            // Only advance to result if declarer is selected
            if (this.currentContract.declarer) {
                this.inputState = 'result_type_selection';
                this.handleResultTypeSelection(value);
                return; // Prevent double processing
            }
        }
    }
    
    /**
     * Handle doubling (X/XX cycling)
     */
    handleDoubling() {
        if (this.currentContract.doubled === '') {
            this.currentContract.doubled = 'X';
        } else if (this.currentContract.doubled === 'X') {
            this.currentContract.doubled = 'XX';
        } else {
            this.currentContract.doubled = '';
        }
        
        this.ui.updateDoubleButton(this.currentContract.doubled);
        console.log(`💥 Double state: ${this.currentContract.doubled || 'None'}`);
    }
    
    /**
     * Handle result type selection (Made/Plus/Down)
     */
    handleResultTypeSelection(value) {
        if (value === 'MADE') {
            this.currentContract.result = '=';
            this.calculateAndRecordScore();
            this.inputState = 'scoring';
        } else if (value === 'DOWN') {
            this.resultMode = 'down';
            this.inputState = 'result_number_selection';
        } else if (value === 'PLUS') {
            this.resultMode = 'plus';
            this.inputState = 'result_number_selection';
        }
    }
    
    /**
     * Handle result number selection (overtricks/undertricks)
     */
    handleResultNumberSelection(value) {
        if (['1', '2', '3', '4', '5', '6', '7'].includes(value)) {
            const num = parseInt(value);
            
            if (this.resultMode === 'down') {
                this.currentContract.result = `-${num}`;
            } else if (this.resultMode === 'plus') {
                const maxOvertricks = 13 - (6 + this.currentContract.level);
                if (num <= maxOvertricks) {
                    this.currentContract.result = `+${num}`;
                } else {
                    console.warn(`⚠️ Invalid overtricks: ${num}, max is ${maxOvertricks}`);
                    return;
                }
            }
            
            this.calculateAndRecordScore();
            this.inputState = 'scoring';
        }
    }
    
    /**
     * Handle actions in scoring state
     */
    handleScoringActions(value) {
        if (value === 'DEAL') {
            this.nextDeal();
        }
    }
    
    /**
     * Calculate score using standard bridge rules
     */
    calculateScore() {
        const { level, suit, result, doubled, declarer } = this.currentContract;
        const vulnerability = this.gameState.getVulnerability();
        
        console.log(`💰 Calculating Chicago Bridge score for ${level}${suit}${doubled} by ${declarer} = ${result}`);
        
        // Basic suit values per trick
        const suitValues = { '♣': 20, '♦': 20, '♥': 30, '♠': 30, 'NT': 30 };
        let score = 0;
        
        if (result === '=' || result?.startsWith('+')) {
            // Contract made
            let basicScore = level * suitValues[suit];
            if (suit === 'NT') basicScore += 10; // NT first trick bonus
            
            // Handle doubling of basic score
            let contractScore = basicScore;
            if (doubled === 'X') contractScore = basicScore * 2;
            else if (doubled === 'XX') contractScore = basicScore * 4;
            
            score = contractScore;
            
            // Add overtricks
            if (result?.startsWith('+')) {
                const overtricks = parseInt(result.substring(1));
                let overtrickValue;
                
                if (doubled === '') {
                    overtrickValue = suitValues[suit] * overtricks;
                } else {
                    const isVulnerable = this.isDeclarerVulnerable();
                    overtrickValue = overtricks * (isVulnerable ? 200 : 100);
                    if (doubled === 'XX') overtrickValue *= 2;
                }
                score += overtrickValue;
            }
            
            // Game/Part-game bonus
            if (contractScore >= 100) {
                const isVulnerable = this.isDeclarerVulnerable();
                score += isVulnerable ? 500 : 300;
            } else {
                score += 50;
            }
            
            // Double bonuses
            if (doubled === 'X') score += 50;
            else if (doubled === 'XX') score += 100;
            
        } else if (result?.startsWith('-')) {
            // Contract failed
            const undertricks = parseInt(result.substring(1));
            const isVulnerable = this.isDeclarerVulnerable();
            
            if (doubled === '') {
                score = -undertricks * (isVulnerable ? 100 : 50);
            } else {
                let penalty = 0;
                for (let i = 1; i <= undertricks; i++) {
                    if (i === 1) {
                        penalty += isVulnerable ? 200 : 100;
                    } else if (i <= 3) {
                        penalty += isVulnerable ? 300 : 200;
                    } else {
                        penalty += 300;
                    }
                }
                if (doubled === 'XX') penalty *= 2;
                score = -penalty;
            }
        }
        
        console.log(`📊 Final score: ${score} points`);
        return score;
    }
    
    /**
     * Calculate and record the score
     */
    calculateAndRecordScore() {
        const score = this.calculateScore();
        const declarerSide = ['N', 'S'].includes(this.currentContract.declarer) ? 'NS' : 'EW';
        
        if (score >= 0) {
            // Made contract - points go to declarer side
            this.gameState.addScore(declarerSide, score);
        } else {
            // Failed contract - penalty points go to defending side
            const defendingSide = declarerSide === 'NS' ? 'EW' : 'NS';
            const penaltyPoints = Math.abs(score); // Convert negative to positive
            this.gameState.addScore(defendingSide, penaltyPoints);
        }
        
        // Record in history with original score for reference
        this.gameState.addToHistory({
            deal: this.gameState.getDealNumber(),
            contract: { ...this.currentContract },
            score: score, // Keep original for display purposes
            actualScore: score >= 0 ? score : Math.abs(score), // Actual points awarded
            scoringSide: score >= 0 ? declarerSide : (declarerSide === 'NS' ? 'EW' : 'NS'),
            mode: 'chicago',
            vulnerability: this.gameState.getVulnerability()
        });
        
        console.log(`💾 Score recorded: ${score >= 0 ? score + ' for ' + declarerSide : Math.abs(score) + ' penalty for ' + (declarerSide === 'NS' ? 'EW' : 'NS')}`);
    }
    
    /**
     * Check if declarer is vulnerable
     */
    isDeclarerVulnerable() {
        const declarerSide = ['N', 'S'].includes(this.currentContract.declarer) ? 'NS' : 'EW';
        const vulnerability = this.gameState.getVulnerability();
        return vulnerability === declarerSide || vulnerability === 'Both';
    }
    
    /**
     * Move to next deal with automatic vulnerability cycling
     */
    nextDeal() {
        console.log('🃏 Moving to next deal in Chicago cycle');
        
        this.gameState.nextDeal();
        
        // Chicago Bridge: vulnerability updates automatically in GameState
        
        this.resetContract();
        this.inputState = 'level_selection';
        this.ui.clearVulnerabilityHighlight();
        
        // Check if we completed a 4-deal cycle
        const dealNumber = this.gameState.getDealNumber();
        if ((dealNumber - 1) % 4 === 0 && dealNumber > 1) {
            console.log('🔄 Completed 4-deal Chicago cycle!');
        }
    }
    
    /**
     * Reset contract to initial state
     */
    resetContract() {
        this.currentContract = {
            level: null,
            suit: null,
            declarer: null,
            doubled: '',
            result: null
        };
        this.resultMode = null;
        this.ui.updateDoubleButton('');
    }
    
    /**
     * Handle back navigation
     */
    handleBack() {
        switch (this.inputState) {
            case 'suit_selection':
                this.inputState = 'level_selection';
                this.currentContract.level = null;
                break;
            case 'declarer_selection':
                this.inputState = 'suit_selection';
                this.currentContract.suit = null;
                this.currentContract.doubled = '';
                this.ui.updateDoubleButton('');
                break;
            case 'result_type_selection':
                this.inputState = 'declarer_selection';
                this.currentContract.declarer = null;
                this.ui.clearVulnerabilityHighlight();
                break;
            case 'result_number_selection':
                this.inputState = 'result_type_selection';
                this.resultMode = null;
                break;
            case 'scoring':
                // Undo the last score and go back to result entry
                this.undoLastScore();
                this.inputState = 'result_type_selection';
                this.currentContract.result = null;
                break;
            default:
                return false; // Let app handle return to mode selection
        }
        
        this.updateDisplay();
        return true;
    }
    
    /**
     * Undo the last score entry
     */
    undoLastScore() {
        const lastEntry = this.gameState.getLastHistoryEntry();
        if (lastEntry && lastEntry.deal === this.gameState.getDealNumber()) {
            // Use the scoring side from the history entry
            const scoringSide = lastEntry.scoringSide || (['N', 'S'].includes(lastEntry.contract.declarer) ? 'NS' : 'EW');
            const pointsToRemove = lastEntry.actualScore || Math.abs(lastEntry.score);
            
            this.gameState.addScore(scoringSide, -pointsToRemove);
            this.gameState.removeLastHistoryEntry();
            console.log(`↩️ Undid score: ${pointsToRemove} from ${scoringSide}`);
        }
    }
    
    /**
     * Check if back navigation is possible
     */
    canGoBack() {
        return this.inputState !== 'level_selection';
    }
    
    /**
     * Toggle vulnerability - NOT ALLOWED in Chicago Bridge
     */
    toggleVulnerability() {
        console.log('🚫 Manual vulnerability control not allowed in Chicago Bridge - uses auto cycle');
        // Chicago Bridge vulnerability is automatic - no manual control
    }
    
    /**
     * Get active buttons for current state
     */
    getActiveButtons() {
        switch (this.inputState) {
            case 'level_selection':
                return ['1', '2', '3', '4', '5', '6', '7'];
                
            case 'suit_selection':
                return ['♣', '♦', '♥', '♠', 'NT'];
                
            case 'declarer_selection':
                const buttons = ['N', 'S', 'E', 'W', 'X'];
                // If declarer is selected, also allow result buttons
                if (this.currentContract.declarer) {
                    buttons.push('MADE', 'PLUS', 'DOWN');
                }
                return buttons;
                
            case 'result_type_selection':
                return ['MADE', 'PLUS', 'DOWN'];
                
            case 'result_number_selection':
                if (this.resultMode === 'down') {
                    return ['1', '2', '3', '4', '5', '6', '7'];
                } else if (this.resultMode === 'plus') {
                    const maxOvertricks = Math.min(6, 13 - (6 + this.currentContract.level));
                    const buttons = [];
                    for (let i = 1; i <= maxOvertricks; i++) {
                        buttons.push(i.toString());
                    }
                    return buttons;
                }
                break;
                
            case 'scoring':
                return ['DEAL'];
                
            default:
                return [];
        }
    }
    
    /**
     * Update the display
     */
    updateDisplay() {
        const content = this.getDisplayContent();
        this.ui.updateDisplay(content);
        this.ui.updateButtonStates(this.getActiveButtons());
    }
    
    /**
     * Get cycle position information
     */
    getCycleInfo() {
        return this.gameState.getChicagoCycleInfo();
    }
    
    /**
     * Get display content for current state
     */
    getDisplayContent() {
        const scores = this.gameState.getScores();
        const dealInfo = this.gameState.getDealInfo();
        const cycleInfo = this.getCycleInfo();
        
        switch (this.inputState) {
            case 'level_selection':
                return `
                    <div class="title-score-row">
                        <div class="mode-title">${this.displayName}</div>
                        <div class="score-display">
                            NS: ${scores.NS}<br>
                            EW: ${scores.EW}
                        </div>
                    </div>
                    <div class="game-content">
                        <div><strong>${dealInfo}</strong></div>
                        <div style="color: #3498db; font-size: 12px; margin-top: 4px;">
                            Cycle ${cycleInfo.cycleNumber} (${cycleInfo.cyclePosition}/4) • Auto vulnerability cycle
                        </div>
                    </div>
                    <div class="current-state">Select bid level (1-7)</div>
                `;
                
            case 'suit_selection':
                return `
                    <div class="title-score-row">
                        <div class="mode-title">${this.displayName}</div>
                        <div class="score-display">
                            NS: ${scores.NS}<br>
                            EW: ${scores.EW}
                        </div>
                    </div>
                    <div class="game-content">
                        <div><strong>${dealInfo}</strong></div>
                        <div><strong>Level: ${this.currentContract.level}</strong></div>
                        <div style="color: #3498db; font-size: 12px;">
                            Cycle ${cycleInfo.cycleNumber} (${cycleInfo.cyclePosition}/4)
                        </div>
                    </div>
                    <div class="current-state">Select suit</div>
                `;
                
            case 'declarer_selection':
                const contractSoFar = `${this.currentContract.level}${this.currentContract.suit}`;
                const doubleText = this.currentContract.doubled ? ` ${this.currentContract.doubled}` : '';
                
                return `
                    <div class="title-score-row">
                        <div class="mode-title">${this.displayName}</div>
                        <div class="score-display">
                            NS: ${scores.NS}<br>
                            EW: ${scores.EW}
                        </div>
                    </div>
                    <div class="game-content">
                        <div><strong>${dealInfo}</strong></div>
                        <div><strong>Contract: ${contractSoFar}${doubleText}</strong></div>
                        <div style="color: #3498db; font-size: 12px;">
                            Cycle ${cycleInfo.cycleNumber} (${cycleInfo.cyclePosition}/4)
                        </div>
                    </div>
                    <div class="current-state">
                        ${this.currentContract.declarer ? 
                            'Press Made/Plus/Down for result, or X for double/redouble' : 
                            'Select declarer (N/S/E/W)'}
                    </div>
                `;
                
            case 'result_type_selection':
                const contract = `${this.currentContract.level}${this.currentContract.suit}${this.currentContract.doubled}`;
                return `
                    <div class="title-score-row">
                        <div class="mode-title">${this.displayName}</div>
                        <div class="score-display">
                            NS: ${scores.NS}<br>
                            EW: ${scores.EW}
                        </div>
                    </div>
                    <div class="game-content">
                        <div><strong>${dealInfo}</strong></div>
                        <div><strong>Contract: ${contract} by ${this.currentContract.declarer}</strong></div>
                        <div style="color: #3498db; font-size: 12px;">
                            Cycle ${cycleInfo.cycleNumber} (${cycleInfo.cyclePosition}/4)
                        </div>
                    </div>
                    <div class="current-state">Made exactly, Plus overtricks, or Down?</div>
                `;
                
            case 'result_number_selection':
                const fullContract = `${this.currentContract.level}${this.currentContract.suit}${this.currentContract.doubled}`;
                const modeText = this.resultMode === 'down' ? 'tricks down (1-7)' : 'overtricks (1-6)';
                return `
                    <div class="title-score-row">
                        <div class="mode-title">${this.displayName}</div>
                        <div class="score-display">
                            NS: ${scores.NS}<br>
                            EW: ${scores.EW}
                        </div>
                    </div>
                    <div class="game-content">
                        <div><strong>${dealInfo}</strong></div>
                        <div><strong>Contract: ${fullContract} by ${this.currentContract.declarer}</strong></div>
                        <div style="color: #3498db; font-size: 12px;">
                            Cycle ${cycleInfo.cycleNumber} (${cycleInfo.cyclePosition}/4)
                        </div>
                    </div>
                    <div class="current-state">Enter number of ${modeText}</div>
                `;
                
            case 'scoring':
                const lastEntry = this.gameState.getLastHistoryEntry();
                if (lastEntry) {
                    const contractDisplay = `${lastEntry.contract.level}${lastEntry.contract.suit}${lastEntry.contract.doubled}`;
                    const nextCycleInfo = this.getNextCycleInfo();
                    
                    return `
                        <div class="title-score-row">
                            <div class="mode-title">${this.displayName}</div>
                            <div class="score-display">
                                NS: ${scores.NS}<br>
                                EW: ${scores.EW}
                            </div>
                        </div>
                        <div class="game-content">
                            <div><strong>Deal ${lastEntry.deal} completed:</strong><br>
                            ${contractDisplay} by ${lastEntry.contract.declarer} = ${lastEntry.contract.result}<br>
                            <span style="color: ${lastEntry.score >= 0 ? '#27ae60' : '#e74c3c'};">
                                Score: ${lastEntry.score >= 0 ? '+' : ''}${lastEntry.score}
                            </span></div>
                            <div style="color: #95a5a6; font-size: 11px; margin-top: 4px;">
                                Next: ${nextCycleInfo}
                            </div>
                        </div>
                        <div class="current-state">Press Deal for next hand</div>
                    `;
                }
                break;
                
            default:
                return '<div class="current-state">Loading...</div>';
        }
    }
    
    /**
     * Get next cycle info for display
     */
    getNextCycleInfo() {
        const nextDeal = this.gameState.getDealNumber() + 1;
        const nextDealer = this.gameState.getDealerForDeal(nextDeal);
        const nextCyclePos = ((nextDeal - 1) % 4) + 1;
        const nextCycleNum = Math.floor((nextDeal - 1) / 4) + 1;
        const vulnerabilityCycle = ['None', 'NS', 'EW', 'Both'];
        const nextVuln = vulnerabilityCycle[(nextDeal - 1) % 4];
        const vulnDisplay = { 'None': 'None', 'NS': 'NS', 'EW': 'EW', 'Both': 'All' };
        
        return `Deal ${nextDeal} • Dealer: ${nextDealer} • Vuln: ${vulnDisplay[nextVuln]} • Cycle ${nextCycleNum} (${nextCyclePos}/4)`;
    }
    
    /**
     * Get help content specific to Chicago Bridge
     */
    getHelpContent() {
        return {
            title: 'Chicago Bridge Help',
            content: `
                <div class="help-section">
                    <h4>What is Chicago Bridge?</h4>
                    <p><strong>Chicago Bridge</strong> is a popular bridge variant that combines standard bridge scoring with a structured 4-deal vulnerability cycle. It provides the excitement of bridge scoring with a predictable, fair vulnerability rotation that ensures balanced play over multiple deals.</p>
                </div>
                
                <div class="help-section">
                    <h4>Enhanced Display Features</h4>
                    <ul>
                        <li><strong>Complete Deal Info:</strong> Deal number, dealer, and vulnerability shown</li>
                        <li><strong>Cycle Progress:</strong> Shows current cycle number and position (X/4)</li>
                        <li><strong>Auto Rotation:</strong> Dealer and vulnerability advance automatically</li>
                        <li><strong>Next Deal Preview:</strong> Shows upcoming deal info after scoring</li>
                    </ul>
                </div>
                
                <div class="help-section">
                    <h4>The 4-Deal Vulnerability Cycle</h4>
                    <table style="width: 100%; border-collapse: collapse; margin: 10px 0;">
                        <tr style="background: rgba(255,255,255,0.1);">
                            <th style="padding: 8px; text-align: center; border: 1px solid rgba(255,255,255,0.2);">Deal</th>
                            <th style="padding: 8px; text-align: center; border: 1px solid rgba(255,255,255,0.2);">Dealer</th>
                            <th style="padding: 8px; text-align: center; border: 1px solid rgba(255,255,255,0.2);">Vulnerability</th>
                            <th style="padding: 8px; text-align: center; border: 1px solid rgba(255,255,255,0.2);">Strategy</th>
                        </tr>
                        <tr>
                            <td style="padding: 8px; text-align: center; border: 1px solid rgba(255,255,255,0.2);">1</td>
                            <td style="padding: 8px; text-align: center; border: 1px solid rgba(255,255,255,0.2);">North</td>
                            <td style="padding: 8px; text-align: center; border: 1px solid rgba(255,255,255,0.2); color: #95a5a6;">None</td>
                            <td style="padding: 8px; border: 1px solid rgba(255,255,255,0.2);">Aggressive bidding</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px; text-align: center; border: 1px solid rgba(255,255,255,0.2);">2</td>
                            <td style="padding: 8px; text-align: center; border: 1px solid rgba(255,255,255,0.2);">East</td>
                            <td style="padding: 8px; text-align: center; border: 1px solid rgba(255,255,255,0.2); color: #27ae60;">NS Vul</td>
                            <td style="padding: 8px; border: 1px solid rgba(255,255,255,0.2);">NS cautious, EW preempt</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px; text-align: center; border: 1px solid rgba(255,255,255,0.2);">3</td>
                            <td style="padding: 8px; text-align: center; border: 1px solid rgba(255,255,255,0.2);">South</td>
                            <td style="padding: 8px; text-align: center; border: 1px solid rgba(255,255,255,0.2); color: #e74c3c;">EW Vul</td>
                            <td style="padding: 8px; border: 1px solid rgba(255,255,255,0.2);">EW cautious, NS preempt</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px; text-align: center; border: 1px solid rgba(255,255,255,0.2);">4</td>
                            <td style="padding: 8px; text-align: center; border: 1px solid rgba(255,255,255,0.2);">West</td>
                            <td style="padding: 8px; text-align: center; border: 1px solid rgba(255,255,255,0.2); color: #f39c12;">Both Vul</td>
                            <td style="padding: 8px; border: 1px solid rgba(255,255,255,0.2);">Conservative play</td>
                        </tr>
                    </table>
                </div>
                
                <div class="help-section">
                    <h4>Key Features</h4>
                    <ul>
                        <li><strong>Automatic Vulnerability:</strong> No manual control - follows 4-deal cycle</li>
                        <li><strong>Deal Counter:</strong> Shows current position (1/4, 2/4, etc.)</li>
                        <li><strong>Cycle Tracking:</strong> Displays which cycle you're in</li>
                        <li><strong>Standard Scoring:</strong> Same as traditional bridge</li>
                        <li><strong>Predictable Sessions:</strong> Natural break after 4 deals</li>
                    </ul>
                </div>
                
                <div class="help-section">
                    <h4>Perfect For</h4>
                    <ul>
                        <li>Social bridge clubs with time limits</li>
                        <li>Teaching vulnerability strategy</li>
                        <li>Structured practice sessions</li>
                        <li>Fair, balanced competition</li>
                    </ul>
                </div>
                
                <div class="help-section">
                    <h4>How to Use</h4>
                    <ol>
                        <li><strong>Automatic Setup:</strong> Dealer and vulnerability set automatically</li>
                        <li><strong>Enter Contract:</strong> Level → Suit → Declarer → Result</li>
                        <li><strong>Note Vulnerability:</strong> Red/green highlighting shows vulnerability status</li>
                        <li><strong>Score Deal:</strong> Calculator applies vulnerability automatically</li>
                        <li><strong>Next Deal:</strong> Vulnerability advances to next in cycle</li>
                        <li><strong>Track Progress:</strong> Deal counter shows cycle position</li>
                    </ol>
                </div>
                
                <div class="help-section">
                    <h4>Cycle Management</h4>
                    <ul>
                        <li><strong>Cycle Completion:</strong> After deal 4, new cycle begins with deal 5</li>
                        <li><strong>Session Breaks:</strong> Natural stopping points after each 4-deal cycle</li>
                        <li><strong>Fair Play:</strong> Everyone gets to be dealer and experience all vulnerability conditions</li>
                        <li><strong>Predictable:</strong> Players can plan strategy knowing upcoming vulnerability</li>
                    </ul>
                </div>
            `,
            buttons: [
                { text: 'Close Help', action: 'close', class: 'close-btn' }
            ]
        };
    }
    
    /**
     * Cleanup when switching modes
     */
    cleanup() {
        this.ui.clearVulnerabilityHighlight();
        this.ui.updateDoubleButton('');
        console.log('🧹 Chicago Bridge cleanup completed');
    }
}

export default ChicagoBri