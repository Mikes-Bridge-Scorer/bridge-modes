/**
 * Rubber Bridge Mode - Traditional Rubber Bridge with Full Feature Set
 * 
 * Rubber Bridge is the classic form of bridge scoring where partnerships compete
 * to win 2 games to claim the rubber. Features include:
 * - Two-line scoring (above/below the line)
 * - Part-score carrying forward
 * - Vulnerability after first game won
 * - Honor bonuses (4/5 trump honors, 4 aces in NT)
 * - Rubber bonuses (700 for 2-0, 500 for 2-1)
 * - Back score calculations
 */

import { BaseBridgeMode } from './base-mode.js';

class RubberBridge extends BaseBridgeMode {
    constructor(gameState, ui) {
        super(gameState, ui);
        
        this.modeName = 'rubber';
        this.displayName = 'Rubber Bridge';
        
        // Rubber Bridge specific state
        this.currentContract = {
            level: null,
            suit: null,
            declarer: null,
            doubled: '',
            result: null
        };
        
        this.inputState = 'level_selection';
        this.resultMode = null; // 'down', 'plus'
        
        // Rubber Bridge scoring state
        this.rubberState = {
            gamesWon: { NS: 0, EW: 0 }, // Games won by each side
            belowLineScores: { NS: 0, EW: 0 }, // Current part-scores
            aboveLineScores: { NS: 0, EW: 0 }, // Bonuses, overtricks, penalties
            rubberComplete: false,
            rubberWinner: null,
            vulnerability: { NS: false, EW: false }, // Independent vulnerability
            honorBonusPending: false, // Flag for honor bonus input
            lastContractSide: null // For honor bonus eligibility
        };
        
        console.log('🏆 Rubber Bridge mode initialized');
    }
    
    /**
     * Initialize Rubber Bridge mode
     */
    initialize() {
        console.log('🎯 Starting Rubber Bridge session');
        
        // Rubber Bridge uses manual vulnerability control
        this.gameState.setMode('rubber');
        
        // Initialize rubber state if new session
        if (!this.rubberState.gamesWon.NS && !this.rubberState.gamesWon.EW) {
            this.resetRubber();
        }
        
        this.inputState = 'level_selection';
        this.resetContract();
        this.updateDisplay();
    }
    
    /**
     * Reset rubber to initial state
     */
    resetRubber() {
        this.rubberState = {
            gamesWon: { NS: 0, EW: 0 },
            belowLineScores: { NS: 0, EW: 0 },
            aboveLineScores: { NS: 0, EW: 0 },
            rubberComplete: false,
            rubberWinner: null,
            vulnerability: { NS: false, EW: false },
            honorBonusPending: false,
            lastContractSide: null
        };
        
        // Reset game state scores to show rubber totals
        this.gameState.resetScores();
        
        console.log('🔄 Rubber reset to initial state');
    }
    
    /**
     * Handle user actions
     */
    handleAction(value) {
        console.log(`🎮 Rubber Bridge action: ${value} in state: ${this.inputState}`);
        
        // Handle rubber completion actions
        if (this.rubberState.rubberComplete && value === 'NEW_RUBBER') {
            this.startNewRubber();
            return;
        }
        
        // Handle honor bonus input
        if (this.rubberState.honorBonusPending) {
            this.handleHonorBonusInput(value);
            return;
        }
        
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
            this.ui.highlightVulnerability(value, this.getCurrentVulnerabilityString());
            console.log(`👤 Declarer selected: ${this.currentContract.declarer}`);
        } else if (value === 'X') {
            this.handleDoubling();
        } else if (['MADE', 'PLUS', 'DOWN'].includes(value)) {
            if (this.currentContract.declarer) {
                this.inputState = 'result_type_selection';
                this.handleResultTypeSelection(value);
                return;
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
     * Handle result type selection
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
     * Handle result number selection
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
        if (value === 'HONORS') {
            this.startHonorBonusInput();
        } else if (value === 'DEAL') {
            this.nextDeal();
        }
    }
    
    /**
     * Handle honor bonus input
     */
    handleHonorBonusInput(value) {
        if (value === 'NO_HONORS') {
            this.rubberState.honorBonusPending = false;
            console.log('👑 No honor bonuses claimed');
        } else if (['4_HONORS', '5_HONORS', '4_ACES'].includes(value)) {
            this.awardHonorBonus(value);
            this.rubberState.honorBonusPending = false;
        }
        
        this.updateDisplay();
    }
    
    /**
     * Start honor bonus input process
     */
    startHonorBonusInput() {
        this.rubberState.honorBonusPending = true;
        console.log('👑 Honor bonus input started');
        this.updateDisplay();
    }
    
    /**
     * Award honor bonus
     */
    awardHonorBonus(honorType) {
        let bonus = 0;
        let description = '';
        
        switch (honorType) {
            case '4_HONORS':
                bonus = 100;
                description = '4 trump honors';
                break;
            case '5_HONORS':
                bonus = 150;
                description = '5 trump honors';
                break;
            case '4_ACES':
                bonus = 150;
                description = '4 aces in NT';
                break;
        }
        
        if (this.rubberState.lastContractSide) {
            this.rubberState.aboveLineScores[this.rubberState.lastContractSide] += bonus;
            this.updateGameStateScores();
            
            console.log(`👑 Honor bonus: ${bonus} for ${description} awarded to ${this.rubberState.lastContractSide}`);
            
            // Add to history
            this.gameState.addToHistory({
                deal: this.gameState.getDealNumber(),
                type: 'honor_bonus',
                honorType: description,
                bonus: bonus,
                side: this.rubberState.lastContractSide,
                mode: 'rubber'
            });
        }
    }
    
    /**
     * Calculate rubber bridge score
     */
    calculateScore() {
        const { level, suit, result, doubled, declarer } = this.currentContract;
        
        console.log(`💰 Calculating Rubber Bridge score for ${level}${suit}${doubled} by ${declarer} = ${result}`);
        
        const suitValues = { '♣': 20, '♦': 20, '♥': 30, '♠': 30, 'NT': 30 };
        const declarerSide = this.getPartnership(declarer);
        const isVulnerable = this.rubberState.vulnerability[declarerSide];
        
        let belowLineScore = 0;
        let aboveLineScore = 0;
        
        if (result === '=' || result?.startsWith('+')) {
            // Contract made
            let basicScore = level * suitValues[suit];
            if (suit === 'NT') basicScore += 10;
            
            // Below the line (contract points only)
            belowLineScore = basicScore;
            if (doubled === 'X') belowLineScore *= 2;
            else if (doubled === 'XX') belowLineScore *= 4;
            
            // Above the line (bonuses)
            // Game/Part-game bonus
            if (belowLineScore >= 100) {
                aboveLineScore += isVulnerable ? 500 : 300; // Game bonus
            } else {
                aboveLineScore += 50; // Part-game bonus
            }
            
            // Slam bonuses
            if (level === 6) {
                aboveLineScore += isVulnerable ? 750 : 500; // Small slam
            } else if (level === 7) {
                aboveLineScore += isVulnerable ? 1500 : 1000; // Grand slam
            }
            
            // Double bonuses
            if (doubled === 'X') aboveLineScore += 50;
            else if (doubled === 'XX') aboveLineScore += 100;
            
            // Overtricks
            if (result?.startsWith('+')) {
                const overtricks = parseInt(result.substring(1));
                let overtrickValue;
                
                if (doubled === '') {
                    overtrickValue = suitValues[suit] * overtricks;
                } else {
                    overtrickValue = overtricks * (isVulnerable ? 200 : 100);
                    if (doubled === 'XX') overtrickValue *= 2;
                }
                aboveLineScore += overtrickValue;
            }
            
        } else if (result?.startsWith('-')) {
            // Contract failed - all points go above the line as penalties
            const undertricks = parseInt(result.substring(1));
            
            if (doubled === '') {
                aboveLineScore = undertricks * (isVulnerable ? 100 : 50);
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
                aboveLineScore = penalty;
            }
        }
        
        return {
            belowLineScore,
            aboveLineScore,
            declarerSide,
            contractMade: result === '=' || result?.startsWith('+')
        };
    }
    
    /**
     * Calculate and record the score
     */
    calculateAndRecordScore() {
        const scoreResult = this.calculateScore();
        const { belowLineScore, aboveLineScore, declarerSide, contractMade } = scoreResult;
        
        if (contractMade) {
            // Contract made - points to declarer
            this.rubberState.belowLineScores[declarerSide] += belowLineScore;
            this.rubberState.aboveLineScores[declarerSide] += aboveLineScore;
            this.rubberState.lastContractSide = declarerSide;
            
            // Check for game (100+ below the line)
            if (this.rubberState.belowLineScores[declarerSide] >= 100) {
                this.processGameWon(declarerSide);
            }
            
        } else {
            // Contract failed - penalty to defending side
            const defendingSide = declarerSide === 'NS' ? 'EW' : 'NS';
            this.rubberState.aboveLineScores[defendingSide] += aboveLineScore;
            this.rubberState.lastContractSide = defendingSide;
        }
        
        // Update game state with total scores
        this.updateGameStateScores();
        
        // Record in history
        this.gameState.addToHistory({
            deal: this.gameState.getDealNumber(),
            contract: { ...this.currentContract },
            belowLineScore: contractMade ? belowLineScore : 0,
            aboveLineScore: contractMade ? aboveLineScore : aboveLineScore,
            scoringSide: contractMade ? declarerSide : (declarerSide === 'NS' ? 'EW' : 'NS'),
            mode: 'rubber',
            vulnerability: this.getCurrentVulnerabilityString(),
            gameWon: this.rubberState.belowLineScores[declarerSide] >= 100 && contractMade
        });
        
        console.log(`💾 Rubber score recorded - Below: ${belowLineScore}, Above: ${aboveLineScore}`);
    }
    
    /**
     * Process game won
     */
    processGameWon(winningSide) {
        this.rubberState.gamesWon[winningSide]++;
        console.log(`🎉 Game won by ${winningSide}! Games: NS ${this.rubberState.gamesWon.NS}, EW ${this.rubberState.gamesWon.EW}`);
        
        // Clear part-scores after game
        this.rubberState.belowLineScores = { NS: 0, EW: 0 };
        
        // Set vulnerability for game winners
        this.rubberState.vulnerability[winningSide] = true;
        
        // Check for rubber completion (first to 2 games)
        if (this.rubberState.gamesWon[winningSide] === 2) {
            this.processRubberWon(winningSide);
        }
    }
    
    /**
     * Process rubber completion
     */
    processRubberWon(winningSide) {
        this.rubberState.rubberComplete = true;
        this.rubberState.rubberWinner = winningSide;
        
        // Calculate rubber bonus
        const losingGames = this.rubberState.gamesWon[winningSide === 'NS' ? 'EW' : 'NS'];
        const rubberBonus = losingGames === 0 ? 700 : 500; // 700 for 2-0, 500 for 2-1
        
        this.rubberState.aboveLineScores[winningSide] += rubberBonus;
        this.updateGameStateScores();
        
        console.log(`🏆 Rubber won by ${winningSide}! Bonus: ${rubberBonus}`);
        
        // Add rubber completion to history
        this.gameState.addToHistory({
            deal: this.gameState.getDealNumber(),
            type: 'rubber_complete',
            winner: winningSide,
            bonus: rubberBonus,
            finalScores: this.getRubberTotals(),
            mode: 'rubber'
        });
    }
    
    /**
     * Start new rubber
     */
    startNewRubber() {
        console.log('🆕 Starting new rubber');
        this.resetRubber();
        this.resetContract();
        this.inputState = 'level_selection';
        this.updateDisplay();
    }
    
    /**
     * Update game state scores with rubber totals
     */
    updateGameStateScores() {
        const totals = this.getRubberTotals();
        this.gameState.scores.NS = totals.NS;
        this.gameState.scores.EW = totals.EW;
    }
    
    /**
     * Get rubber totals
     */
    getRubberTotals() {
        return {
            NS: this.rubberState.belowLineScores.NS + this.rubberState.aboveLineScores.NS,
            EW: this.rubberState.belowLineScores.EW + this.rubberState.aboveLineScores.EW
        };
    }
    
    /**
     * Get current vulnerability as string for display
     */
    getCurrentVulnerabilityString() {
        const nsVuln = this.rubberState.vulnerability.NS;
        const ewVuln = this.rubberState.vulnerability.EW;
        
        if (nsVuln && ewVuln) return 'Both';
        if (nsVuln) return 'NS';
        if (ewVuln) return 'EW';
        return 'None';
    }
    
    /**
     * Move to next deal
     */
    nextDeal() {
        console.log('🃏 Moving to next deal in rubber');
        
        this.gameState.nextDeal();
        this.resetContract();
        this.inputState = 'level_selection';
        this.ui.clearVulnerabilityHighlight();
        this.rubberState.honorBonusPending = false;
    }
    
    /**
     * Reset contract
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
        if (this.rubberState.honorBonusPending) {
            this.rubberState.honorBonusPending = false;
            this.updateDisplay();
            return true;
        }
        
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
                this.undoLastScore();
                this.inputState = 'result_type_selection';
                this.currentContract.result = null;
                break;
            default:
                return false;
        }
        
        this.updateDisplay();
        return true;
    }
    
    /**
     * Undo last score
     */
    undoLastScore() {
        const lastEntry = this.gameState.getLastHistoryEntry();
        if (lastEntry && lastEntry.deal === this.gameState.getDealNumber() && lastEntry.mode === 'rubber') {
            // Remove the score effects
            if (lastEntry.type !== 'honor_bonus' && lastEntry.type !== 'rubber_complete') {
                const side = lastEntry.scoringSide;
                
                if (lastEntry.belowLineScore) {
                    this.rubberState.belowLineScores[side] -= lastEntry.belowLineScore;
                }
                if (lastEntry.aboveLineScore) {
                    this.rubberState.aboveLineScores[side] -= lastEntry.aboveLineScore;
                }
                
                // Reset vulnerability if this caused a game win
                if (lastEntry.gameWon) {
                    this.rubberState.gamesWon[side]--;
                    this.rubberState.vulnerability[side] = false;
                }
            }
            
            this.gameState.removeLastHistoryEntry();
            this.updateGameStateScores();
            console.log(`↩️ Undid rubber score`);
        }
    }
    
    /**
     * Get active buttons
     */
    getActiveButtons() {
        if (this.rubberState.rubberComplete) {
            return ['NEW_RUBBER'];
        }
        
        if (this.rubberState.honorBonusPending) {
            const buttons = ['NO_HONORS'];
            if (this.currentContract.suit !== 'NT') {
                buttons.push('4_HONORS', '5_HONORS');
            } else {
                buttons.push('4_ACES');
            }
            return buttons;
        }
        
        switch (this.inputState) {
            case 'level_selection':
                return ['1', '2', '3', '4', '5', '6', '7'];
            case 'suit_selection':
                return ['♣', '♦', '♥', '♠', 'NT'];
            case 'declarer_selection':
                const buttons = ['N', 'S', 'E', 'W', 'X'];
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
                return ['HONORS', 'DEAL'];
            default:
                return [];
        }
    }
    
    /**
     * Update display
     */
    updateDisplay() {
        const content = this.getDisplayContent();
        this.ui.updateDisplay(content);
        this.ui.updateButtonStates(this.getActiveButtons());
    }
    
    /**
     * Get display content
     */
    getDisplayContent() {
        const totals = this.getRubberTotals();
        const dealInfo = this.gameState.getDealInfo();
        
        // Rubber completion screen
        if (this.rubberState.rubberComplete) {
            const winner = this.rubberState.rubberWinner;
            const finalMargin = Math.abs(totals.NS - totals.EW);
            
            return `
                <div class="title-score-row">
                    <div class="mode-title">${this.displayName}</div>
                    <div class="score-display">
                        NS: ${totals.NS}<br>
                        EW: ${totals.EW}
                    </div>
                </div>
                <div class="game-content">
                    <div style="text-align: center; color: #f1c40f; font-size: 18px; margin: 10px 0;">
                        🏆 RUBBER COMPLETE! 🏆
                    </div>
                    <div style="text-align: center; font-size: 16px; margin: 10px 0;">
                        <strong>${winner} wins ${this.rubberState.gamesWon[winner]}-${this.rubberState.gamesWon[winner === 'NS' ? 'EW' : 'NS']}</strong>
                    </div>
                    <div style="text-align: center; margin: 10px 0;">
                        Final margin: ${finalMargin} points
                    </div>
                    <div class="rubber-scorecard">
                        ${this.generateScorecard()}
                    </div>
                </div>
                <div class="current-state">Press New Rubber to start again</div>
            `;
        }
        
        // Honor bonus input screen
        if (this.rubberState.honorBonusPending) {
            return `
                <div class="title-score-row">
                    <div class="mode-title">${this.displayName}</div>
                    <div class="score-display">
                        NS: ${totals.NS}<br>
                        EW: ${totals.EW}
                    </div>
                </div>
                <div class="game-content">
                    <div><strong>${dealInfo}</strong></div>
                    <div class="rubber-scores">
                        ${this.generateRubberScoreDisplay()}
                    </div>
                </div>
                <div class="current-state">
                    Honor bonuses for ${this.rubberState.lastContractSide}?<br>
                    <small>${this.currentContract.suit === 'NT' ? '4 Aces (150)' : '4 Trump (100) or 5 Trump (150)'}</small>
                </div>
            `;
        }
        
        // Main game states
        switch (this.inputState) {
            case 'level_selection':
                return `
                    <div class="title-score-row">
                        <div class="mode-title">${this.displayName}</div>
                        <div class="score-display">
                            NS: ${totals.NS}<br>
                            EW: ${totals.EW}
                        </div>
                    </div>
                    <div class="game-content">
                        <div><strong>${dealInfo}</strong></div>
                        <div class="rubber-scores">
                            ${this.generateRubberScoreDisplay()}
                        </div>
                    </div>
                    <div class="current-state">Select bid level (1-7)</div>
                `;
                
            case 'suit_selection':
                return `
                    <div class="title-score-row">
                        <div class="mode-title">${this.displayName}</div>
                        <div class="score-display">
                            NS: ${totals.NS}<br>
                            EW: ${totals.EW}
                        </div>
                    </div>
                    <div class="game-content">
                        <div><strong>${dealInfo}</strong></div>
                        <div><strong>Level: ${this.currentContract.level}</strong></div>
                        <div class="rubber-scores">
                            ${this.generateRubberScoreDisplay()}
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
                            NS: ${totals.NS}<br>
                            EW: ${totals.EW}
                        </div>
                    </div>
                    <div class="game-content">
                        <div><strong>${dealInfo}</strong></div>
                        <div><strong>Contract: ${contractSoFar}${doubleText}</strong></div>
                        <div class="rubber-scores">
                            ${this.generateRubberScoreDisplay()}
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
                            NS: ${totals.NS}<br>
                            EW: ${totals.EW}
                        </div>
                    </div>
                    <div class="game-content">
                        <div><strong>${dealInfo}</strong></div>
                        <div><strong>Contract: ${contract} by ${this.currentContract.declarer}</strong></div>
                        <div class="rubber-scores">
                            ${this.generateRubberScoreDisplay()}
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
                            NS: ${totals.NS}<br>
                            EW: ${totals.EW}
                        </div>
                    </div>
                    <div class="game-content">
                        <div><strong>${dealInfo}</strong></div>
                        <div><strong>Contract: ${fullContract} by ${this.currentContract.declarer}</strong></div>
                        <div class="rubber-scores">
                            ${this.generateRubberScoreDisplay()}
                        </div>
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
                                NS: ${totals.NS}<br>
                                EW: ${totals.EW}
                            </div>
                        </div>
                        <div class="game-content">
                            <div><strong>Deal ${lastEntry.deal} completed:</strong><br>
                            ${contractDisplay} by ${lastEntry.contract.declarer} = ${lastEntry.contract.result}</div>
                            <div class="rubber-scores">
                                ${this.generateRubberScoreDisplay()}
                            </div>
                            ${lastEntry.gameWon ? `<div style="color: #f1c40f; text-align: center; margin: 8px 0;">🎉 GAME to ${lastEntry.scoringSide}! 🎉</div>` : ''}
                        </div>
                        <div class="current-state">Press Honors for bonuses, or Deal for next hand</div>
                    `;
                }
                break;
                
            default:
                return '<div class="current-state">Loading...</div>';
        }
    }
    
    /**
     * Generate rubber score display (two-line scoring)
     */
    generateRubberScoreDisplay() {
        const nsBelow = this.rubberState.belowLineScores.NS;
        const ewBelow = this.rubberState.belowLineScores.EW;
        const nsAbove = this.rubberState.aboveLineScores.NS;
        const ewAbove = this.rubberState.aboveLineScores.EW;
        const nsGames = this.rubberState.gamesWon.NS;
        const ewGames = this.rubberState.gamesWon.EW;
        const nsVuln = this.rubberState.vulnerability.NS;
        const ewVuln = this.rubberState.vulnerability.EW;
        
        return `
            <div class="rubber-score-table" style="font-family: monospace; font-size: 12px; border: 1px solid rgba(255,255,255,0.3); margin: 8px 0;">
                <div style="display: flex; background: rgba(255,255,255,0.1);">
                    <div style="flex: 1; text-align: center; padding: 4px; border-right: 1px solid rgba(255,255,255,0.3);">
                        <strong>NS ${nsVuln ? '(V)' : ''}</strong>
                    </div>
                    <div style="flex: 1; text-align: center; padding: 4px;">
                        <strong>EW ${ewVuln ? '(V)' : ''}</strong>
                    </div>
                </div>
                <div style="display: flex; min-height: 30px;">
                    <div style="flex: 1; text-align: center; padding: 4px; border-right: 1px solid rgba(255,255,255,0.3); color: #3498db;">
                        ${nsAbove || ''}
                    </div>
                    <div style="flex: 1; text-align: center; padding: 4px; color: #3498db;">
                        ${ewAbove || ''}
                    </div>
                </div>
                <div style="border-top: 2px solid rgba(255,255,255,0.5); display: flex;">
                    <div style="flex: 1; text-align: center; padding: 4px; border-right: 1px solid rgba(255,255,255,0.3); color: #e74c3c; font-weight: bold;">
                        ${nsBelow || ''}
                    </div>
                    <div style="flex: 1; text-align: center; padding: 4px; color: #e74c3c; font-weight: bold;">
                        ${ewBelow || ''}
                    </div>
                </div>
                <div style="display: flex; background: rgba(255,255,255,0.05); font-size: 10px;">
                    <div style="flex: 1; text-align: center; padding: 2px; border-right: 1px solid rgba(255,255,255,0.3);">
                        Games: ${'★'.repeat(nsGames)}${'☆'.repeat(2-nsGames)}
                    </div>
                    <div style="flex: 1; text-align: center; padding: 2px;">
                        Games: ${'★'.repeat(ewGames)}${'☆'.repeat(2-ewGames)}
                    </div>
                </div>
            </div>
        `;
    }
    
    /**
     * Generate final scorecard for rubber completion
     */
    generateScorecard() {
        const nsBelow = this.rubberState.belowLineScores.NS;
        const ewBelow = this.rubberState.belowLineScores.EW;
        const nsAbove = this.rubberState.aboveLineScores.NS;
        const ewAbove = this.rubberState.aboveLineScores.EW;
        const nsTotal = nsBelow + nsAbove;
        const ewTotal = ewBelow + ewAbove;
        
        return `
            <div style="font-family: monospace; font-size: 11px; border: 2px solid #f1c40f; margin: 10px 0; background: rgba(241,196,15,0.1);">
                <div style="background: #f1c40f; color: #2c3e50; text-align: center; padding: 4px; font-weight: bold;">
                    FINAL SCORECARD
                </div>
                <div style="display: flex; padding: 8px;">
                    <div style="flex: 1;">
                        <div style="text-align: center; font-weight: bold; margin-bottom: 4px;">NS</div>
                        <div>Above line: ${nsAbove}</div>
                        <div>Below line: ${nsBelow}</div>
                        <div style="border-top: 1px solid; margin-top: 4px; padding-top: 4px; font-weight: bold;">
                            Total: ${nsTotal}
                        </div>
                    </div>
                    <div style="flex: 1; border-left: 1px solid rgba(255,255,255,0.3); padding-left: 8px;">
                        <div style="text-align: center; font-weight: bold; margin-bottom: 4px;">EW</div>
                        <div>Above line: ${ewAbove}</div>
                        <div>Below line: ${ewBelow}</div>
                        <div style="border-top: 1px solid; margin-top: 4px; padding-top: 4px; font-weight: bold;">
                            Total: ${ewTotal}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    /**
     * Toggle vulnerability - Rubber Bridge allows manual control
     */
    toggleVulnerability() {
        // In Rubber Bridge, vulnerability is determined by games won
        // But we can allow manual adjustment for special cases
        const current = this.getCurrentVulnerabilityString();
        const cycle = ['None', 'NS', 'EW', 'Both'];
        const currentIndex = cycle.indexOf(current);
        const nextIndex = (currentIndex + 1) % cycle.length;
        const next = cycle[nextIndex];
        
        // Update vulnerability state
        this.rubberState.vulnerability.NS = next === 'NS' || next === 'Both';
        this.rubberState.vulnerability.EW = next === 'EW' || next === 'Both';
        
        console.log(`🎯 Rubber vulnerability manually set to: ${next}`);
        this.updateDisplay();
    }
    
    /**
     * Get help content for Rubber Bridge
     */
    getHelpContent() {
        return {
            title: 'Rubber Bridge Help',
            content: `
                <div class="help-section">
                    <h4>What is Rubber Bridge?</h4>
                    <p><strong>Rubber Bridge</strong> is the traditional, classic form of bridge scoring. Two partnerships compete to be first to win 2 games, which completes the "rubber." It's the most prestigious form of bridge, combining skill, strategy, and the excitement of cumulative scoring.</p>
                </div>
                
                <div class="help-section">
                    <h4>Key Concepts</h4>
                    <ul>
                        <li><strong>Game:</strong> First partnership to score 100+ points "below the line"</li>
                        <li><strong>Rubber:</strong> First partnership to win 2 games</li>
                        <li><strong>Vulnerability:</strong> Winners of first game become vulnerable</li>
                        <li><strong>Two-Line Scoring:</strong> Contract points below, bonuses above</li>
                        <li><strong>Honor Bonuses:</strong> Extra points for holding trump honors</li>
                    </ul>
                </div>
                
                <div class="help-section">
                    <h4>The Scorecard</h4>
                    <p>Rubber Bridge uses a unique two-line scoring system:</p>
                    <table style="width: 100%; border-collapse: collapse; margin: 10px 0; font-family: monospace;">
                        <tr style="background: rgba(255,255,255,0.1);">
                            <th style="padding: 8px; border: 1px solid rgba(255,255,255,0.3);">NS</th>
                            <th style="padding: 8px; border: 1px solid rgba(255,255,255,0.3);">EW</th>
                        </tr>
                        <tr>
                            <td style="padding: 8px; border: 1px solid rgba(255,255,255,0.3); color: #3498db;">350</td>
                            <td style="padding: 8px; border: 1px solid rgba(255,255,255,0.3); color: #3498db;">180</td>
                        </tr>
                        <tr style="border-top: 2px solid rgba(255,255,255,0.8);">
                            <td style="padding: 8px; border: 1px solid rgba(255,255,255,0.3); color: #e74c3c; font-weight: bold;">120</td>
                            <td style="padding: 8px; border: 1px solid rgba(255,255,255,0.3); color: #e74c3c; font-weight: bold;">60</td>
                        </tr>
                    </table>
                    <ul>
                        <li><span style="color: #3498db;"><strong>Above the line (blue):</strong></span> Bonuses, overtricks, penalties, honors</li>
                        <li><span style="color: #e74c3c;"><strong>Below the line (red):</strong></span> Contract points only (count toward game)</li>
                    </ul>
                </div>
                
                <div class="help-section">
                    <h4>Vulnerability System</h4>
                    <ul>
                        <li><strong>Start:</strong> Neither side vulnerable</li>
                        <li><strong>First Game:</strong> Winners become vulnerable</li>
                        <li><strong>Vulnerable Effects:</strong> Higher bonuses, steeper penalties</li>
                        <li><strong>Reset:</strong> New rubber starts with no vulnerability</li>
                    </ul>
                </div>
                
                <div class="help-section">
                    <h4>Scoring Details</h4>
                    
                    <h5>Contract Points (Below the Line)</h5>
                    <ul>
                        <li>♣♦: 20 per trick</li>
                        <li>♥♠: 30 per trick</li>
                        <li>NT: 30 per trick + 10 first trick bonus</li>
                        <li>Doubled: Contract points × 2</li>
                        <li>Redoubled: Contract points × 4</li>
                    </ul>
                    
                    <h5>Bonuses (Above the Line)</h5>
                    <ul>
                        <li><strong>Game bonus:</strong> 300 (not vul) / 500 (vul)</li>
                        <li><strong>Part-game bonus:</strong> 50 points</li>
                        <li><strong>Small slam:</strong> 500 (not vul) / 750 (vul)</li>
                        <li><strong>Grand slam:</strong> 1000 (not vul) / 1500 (vul)</li>
                        <li><strong>Double bonus:</strong> 50 (X) / 100 (XX)</li>
                        <li><strong>Rubber bonus:</strong> 500 (2-1) / 700 (2-0)</li>
                    </ul>
                    
                    <h5>Honor Bonuses</h5>
                    <ul>
                        <li><strong>4 trump honors</strong> (A,K,Q,J,10): 100 points</li>
                        <li><strong>5 trump honors</strong> (all): 150 points</li>
                        <li><strong>4 aces in NT:</strong> 150 points</li>
                        <li>Must be held by one player in the partnership</li>
                    </ul>
                </div>
                
                <div class="help-section">
                    <h4>Strategic Elements</h4>
                    <ul>
                        <li><strong>Part-Score Race:</strong> Partial contracts carry forward toward game</li>
                        <li><strong>Vulnerability Timing:</strong> When to bid aggressively vs. conservatively</li>
                        <li><strong>Penalty Doubles:</strong> Higher stakes when opponents are vulnerable</li>
                        <li><strong>Honor Bonuses:</strong> Small edges that can swing rubbers</li>
                        <li><strong>Rubber Management:</strong> Protecting leads, catching up from behind</li>
                    </ul>
                </div>
                
                <div class="help-section">
                    <h4>How to Use This Calculator</h4>
                    <ol>
                        <li><strong>Enter Contract:</strong> Level → Suit → Declarer → Result</li>
                        <li><strong>Automatic Scoring:</strong> Points distributed above/below line correctly</li>
                        <li><strong>Game Detection:</strong> Automatic game completion when 100+ reached</li>
                        <li><strong>Honor Bonuses:</strong> Press "Honors" after each deal to claim bonuses</li>
                        <li><strong>Vulnerability:</strong> Updates automatically when games are won</li>
                        <li><strong>Rubber Completion:</strong> Celebrates winner and shows final scorecard</li>
                    </ol>
                </div>
                
                <div class="help-section">
                    <h4>Why Play Rubber Bridge?</h4>
                    <ul>
                        <li><strong>Traditional:</strong> The original form of bridge scoring</li>
                        <li><strong>Skill-Testing:</strong> Rewards consistent performance over many deals</li>
                        <li><strong>Strategic Depth:</strong> Vulnerability and part-score management</li>
                        <li><strong>Social:</strong> Natural conversation breaks between rubbers</li>
                        <li><strong>Prestigious:</strong> The scoring system used in high-level bridge</li>
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
        console.log('🧹 Rubber Bridge cleanup completed');
    }
}

export default RubberBridge;