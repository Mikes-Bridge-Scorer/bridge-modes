/**
 * Kitchen Bridge Mode - Simplified Social Bridge Scoring
 * 
 * Kitchen Bridge is a casual, social form of bridge that removes the complexity
 * of rubber bridge while maintaining the essence of bridge scoring. Perfect for
 * home games where you want proper scoring without the full complexity.
 */

import { BaseBridgeMode } from './base-mode.js';

class KitchenBridge extends BaseBridgeMode {
    constructor(gameState, ui) {
        super(gameState, ui);
        
        this.modeName = 'kitchen';
        this.displayName = 'Kitchen Bridge';
        
        // Kitchen Bridge state
        this.currentContract = {
            level: null,
            suit: null,
            declarer: null,
            doubled: '',
            result: null
        };
        
        this.inputState = 'level_selection';
        this.resultMode = null; // 'down', 'plus'
        
        console.log('🏠 Kitchen Bridge mode initialized');
    }
    
    /**
     * Initialize Kitchen Bridge mode
     */
    initialize() {
        console.log('🎯 Starting Kitchen Bridge session');
        
        // Kitchen Bridge uses simple vulnerability (always None unless manually set)
        this.gameState.setVulnerability('None');
        
        // Start with level selection
        this.inputState = 'level_selection';
        this.resetContract();
        
        this.updateDisplay();
    }
    
    /**
     * Handle user actions
     */
    handleAction(value) {
        console.log(`🎮 Kitchen Bridge action: ${value} in state: ${this.inputState}`);
        
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
     * Calculate score using Kitchen Bridge rules
     */
    calculateScore() {
        const { level, suit, result, doubled, declarer } = this.currentContract;
        const vulnerability = this.gameState.getVulnerability();
        
        console.log(`💰 Calculating Kitchen Bridge score for ${level}${suit}${doubled} by ${declarer} = ${result}`);
        
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
                    // Undoubled overtricks
                    overtrickValue = suitValues[suit] * overtricks;
                } else {
                    // Doubled overtricks (100 NV, 200 Vul)
                    const isVulnerable = this.isDeclarerVulnerable();
                    overtrickValue = overtricks * (isVulnerable ? 200 : 100);
                    if (doubled === 'XX') overtrickValue *= 2;
                }
                score += overtrickValue;
            }
            
            // Game/Part-game bonus
            if (contractScore >= 100) {
                // Game made
                const isVulnerable = this.isDeclarerVulnerable();
                score += isVulnerable ? 500 : 300;
            } else {
                // Part-game
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
                // Undoubled penalties
                score = -undertricks * (isVulnerable ? 100 : 50);
            } else {
                // Doubled penalties
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
            mode: 'kitchen'
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
     * Move to next deal
     */
    nextDeal() {
        console.log('🃏 Moving to next deal');
        
        this.gameState.nextDeal();
        
        // Kitchen Bridge keeps vulnerability as None unless manually changed
        // (Unlike Chicago which has a cycle)
        
        this.resetContract();
        this.inputState = 'level_selection';
        this.ui.clearVulnerabilityHighlight();
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
     * Toggle vulnerability (Kitchen Bridge allows manual control)
     */
    toggleVulnerability() {
        const cycle = ['None', 'NS', 'EW', 'Both'];
        const current = cycle.indexOf(this.gameState.getVulnerability());
        const newVuln = cycle[(current + 1) % 4];
        
        this.gameState.setVulnerability(newVuln);
        this.ui.updateVulnerabilityDisplay(newVuln);
        
        // Update highlight if declarer is selected
        if (this.currentContract.declarer) {
            this.ui.highlightVulnerability(this.currentContract.declarer, newVuln);
        }
        
        console.log(`🎯 Vulnerability changed to: ${newVuln}`);
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
     * Get display content for current state
     */
    getDisplayContent() {
        const scores = this.gameState.getScores();
        
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
                        <div><strong>Deal ${this.gameState.getDealNumber()}</strong></div>
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
                        <div><strong>Level: ${this.currentContract.level}</strong></div>
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
                        <div><strong>Contract: ${contractSoFar}${doubleText}</strong></div>
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
                        <div><strong>Contract: ${contract} by ${this.currentContract.declarer}</strong></div>
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
                        <div><strong>Contract: ${fullContract} by ${this.currentContract.declarer}</strong></div>
                    </div>
                    <div class="current-state">Enter number of ${modeText}</div>
                `;
                
            case 'scoring':
                const lastEntry = this.gameState.getLastHistoryEntry();
                if (lastEntry) {
                    const contractDisplay = `${lastEntry.contract.level}${lastEntry.contract.suit}${lastEntry.contract.doubled}`;
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
     * Get help content specific to Kitchen Bridge
     */
    getHelpContent() {
        return {
            title: 'Kitchen Bridge (Party Bridge) Help',
            content: `
                <div class="help-section">
                    <h4>What is Kitchen Bridge?</h4>
                    <p><strong>Kitchen Bridge</strong> (also called <strong>Party Bridge</strong>) is traditional bridge scoring designed for casual play at a single table with 4 players. It uses standard bridge scoring rules without any adjustments for hand strength or playing skill.</p>
                </div>
                
                <div class="help-section">
                    <h4>Key Characteristics</h4>
                    <ul>
                        <li><strong>Standard Scoring:</strong> Uses traditional bridge point values</li>
                        <li><strong>4 Players Only:</strong> Designed for one table bridge</li>
                        <li><strong>No Skill Adjustment:</strong> Same score regardless of hand strength</li>
                        <li><strong>Simple & Quick:</strong> Easy to calculate, familiar to all bridge players</li>
                    </ul>
                </div>
                
                <div class="help-section">
                    <h4>Perfect For</h4>
                    <ul>
                        <li>Casual home bridge games</li>
                        <li>Learning bridge scoring</li>
                        <li>Quick social games</li>
                        <li>Traditional bridge enthusiasts</li>
                    </ul>
                </div>
                
                <div class="help-section">
                    <h4>Basic Contract Scores</h4>
                    <table style="width: 100%; border-collapse: collapse; margin: 10px 0;">
                        <tr style="background: rgba(255,255,255,0.1);">
                            <th style="padding: 8px; text-align: left; border: 1px solid rgba(255,255,255,0.2);">Contract</th>
                            <th style="padding: 8px; text-align: left; border: 1px solid rgba(255,255,255,0.2);">Points per Trick</th>
                            <th style="padding: 8px; text-align: left; border: 1px solid rgba(255,255,255,0.2);">Example (4-level)</th>
                        </tr>
                        <tr>
                            <td style="padding: 8px; border: 1px solid rgba(255,255,255,0.2);">♣ ♦ (Minors)</td>
                            <td style="padding: 8px; border: 1px solid rgba(255,255,255,0.2);">20</td>
                            <td style="padding: 8px; border: 1px solid rgba(255,255,255,0.2);">4♣ = 80 pts</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px; border: 1px solid rgba(255,255,255,0.2);">♥ ♠ (Majors)</td>
                            <td style="padding: 8px; border: 1px solid rgba(255,255,255,0.2);">30</td>
                            <td style="padding: 8px; border: 1px solid rgba(255,255,255,0.2);">4♥ = 120 pts</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px; border: 1px solid rgba(255,255,255,0.2);">NT (No Trump)</td>
                            <td style="padding: 8px; border: 1px solid rgba(255,255,255,0.2);">30 + 10</td>
                            <td style="padding: 8px; border: 1px solid rgba(255,255,255,0.2);">3NT = 100 pts</td>
                        </tr>
                    </table>
                </div>
                
                <div class="help-section">
                    <h4>Bonus Points</h4>
                    <ul>
                        <li><strong>Game Bonus:</strong> 300 (not vulnerable) / 500 (vulnerable)</li>
                        <li><strong>Part Game:</strong> 50 points</li>
                        <li><strong>Small Slam:</strong> 500 / 750 points</li>
                        <li><strong>Grand Slam:</strong> 1000 / 1500 points</li>
                        <li><strong>Doubling:</strong> Doubles contract points and penalties</li>
                    </ul>
                </div>
                
                <div class="help-section">
                    <h4>Overtricks & Penalties</h4>
                    <ul>
                        <li><strong>Overtricks:</strong> Same value as contract suit</li>
                        <li><strong>Doubled Overtricks:</strong> 100/200 (not vul/vul)</li>
                        <li><strong>Penalties:</strong> 50/100 per trick (not vul/vul)</li>
                        <li><strong>Doubled Penalties:</strong> 100/200/300... progression</li>
                    </ul>
                </div>
                
                <div class="help-section">
                    <h4>The Core Problem</h4>
                    <p style="background: rgba(255,193,7,0.2); padding: 10px; border-radius: 5px; border-left: 3px solid #ffc107;">
                        <strong>Kitchen Bridge treats all hands equally</strong> - a major flaw that makes the game less competitive and fair.
                    </p>
                </div>
                
                <div class="help-section">
                    <h4>Unfair Scenarios</h4>
                    <div style="display: flex; gap: 10px; margin: 10px 0;">
                        <div style="flex: 1; background: rgba(255,255,255,0.1); padding: 10px; border-radius: 5px;">
                            <strong>Strong Hand</strong><br>
                            ♠ AKQ ♥ AKQ ♦ AKQ ♣ AKQ<br>
                            28 HCP - Easy 4♥ make<br>
                            <strong>Score: 420 points</strong>
                        </div>
                        <div style="flex: 1; background: rgba(255,255,255,0.1); padding: 10px; border-radius: 5px;">
                            <strong>Weak Hand</strong><br>
                            ♠ xxx ♥ Jxxx ♦ xxx ♣ xxx<br>
                            6 HCP - Lucky 4♥ make<br>
                            <strong>Score: 420 points</strong>
                        </div>
                    </div>
                    <p style="text-align: center; background: rgba(255,193,7,0.3); padding: 8px; border-radius: 5px; font-weight: bold;">
                        Same score despite completely different skill requirements!
                    </p>
                </div>
                
                <div class="help-section">
                    <h4>Other Issues</h4>
                    <ul>
                        <li><strong>No Skill Recognition:</strong> Brilliant play gets same score as lucky cards</li>
                        <li><strong>Defender Frustration:</strong> Great defense unrewarded if contract still makes</li>
                        <li><strong>Predictable Outcomes:</strong> Best cards usually win</li>
                        <li><strong>Limited Strategy:</strong> Less incentive for creative bidding or play</li>
                    </ul>
                </div>
                
                <div class="help-section">
                    <h4>When to Choose Kitchen Bridge</h4>
                    <div style="background: rgba(39,174,96,0.2); padding: 10px; border-radius: 5px; border-left: 3px solid #27ae60;">
                        <strong>Choose Kitchen Bridge For:</strong>
                        <ul style="margin: 5px 0;">
                            <li>Casual social games</li>
                            <li>Learning bridge basics</li>
                            <li>Quick games without analysis</li>
                            <li>Traditional bridge purists</li>
                        </ul>
                    </div>
                </div>
                
                <div class="help-section">
                    <h4>How to Use This Calculator</h4>
                    <ol>
                        <li><strong>Enter Level:</strong> Press 1-7 for bid level</li>
                        <li><strong>Choose Suit:</strong> Select trump suit or No Trump</li>
                        <li><strong>Pick Declarer:</strong> Choose N/S/E/W</li>
                        <li><strong>Add Doubling:</strong> Press X to cycle through None/Double/Redouble</li>
                        <li><strong>Enter Result:</strong> Made exactly, Plus overtricks, or Down</li>
                        <li><strong>Next Deal:</strong> Press Deal to continue</li>
                    </ol>
                </div>
                
                <div class="help-section">
                    <h4>Controls</h4>
                    <ul>
                        <li><strong>Back:</strong> Return to previous step</li>
                        <li><strong>Vuln:</strong> Manual vulnerability control (NV/NS/EW/Both)</li>
                        <li><strong>Wake:</strong> Keep screen on during long games</li>
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
        console.log('🧹 Kitchen Bridge cleanup completed');
    }
}

export default KitchenBridge;