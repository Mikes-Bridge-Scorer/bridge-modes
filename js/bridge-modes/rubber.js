/**
 * Rubber Bridge Mode - Traditional Rubber Bridge with Full Feature Set
 */

import { BaseBridgeMode } from './base-mode.js';

class RubberBridge extends BaseBridgeMode {
    constructor(gameState, ui) {
        super(gameState, ui);
        
        this.modeName = 'rubber';
        this.displayName = 'Rubber Bridge';
        
        this.currentContract = {
            level: null,
            suit: null,
            declarer: null,
            doubled: '',
            result: null
        };
        
        this.inputState = 'level_selection';
        this.resultMode = null;
        
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
        
        console.log('🏆 Rubber Bridge mode initialized');
    }
    
    initialize() {
        console.log('🎯 Starting Rubber Bridge session');
        this.gameState.setMode('rubber');
        
        if (!this.rubberState.gamesWon.NS && !this.rubberState.gamesWon.EW) {
            this.resetRubber();
        }
        
        this.inputState = 'level_selection';
        this.resetContract();
        this.updateDisplay();
    }
    
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
        
        this.gameState.resetScores();
        console.log('🔄 Rubber reset to initial state');
    }
    
    handleAction(value) {
        console.log(`🎮 Rubber Bridge action: ${value} in state: ${this.inputState}`);
        
        if (this.rubberState.rubberComplete && value === 'NEW_RUBBER') {
            this.startNewRubber();
            return;
        }
        
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
    
    handleLevelSelection(value) {
        if (['1', '2', '3', '4', '5', '6', '7'].includes(value)) {
            this.currentContract.level = parseInt(value);
            this.inputState = 'suit_selection';
            console.log(`📊 Level selected: ${this.currentContract.level}`);
        }
    }
    
    handleSuitSelection(value) {
        if (['♣', '♦', '♥', '♠', 'NT'].includes(value)) {
            this.currentContract.suit = value;
            this.inputState = 'declarer_selection';
            console.log(`♠ Suit selected: ${this.currentContract.suit}`);
        }
    }
    
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
    
    handleScoringActions(value) {
        if (value === 'HONORS') {
            this.startHonorBonusInput();
        } else if (value === 'DEAL') {
            this.nextDeal();
        }
    }
    
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
    
    startHonorBonusInput() {
        this.rubberState.honorBonusPending = true;
        console.log('👑 Honor bonus input started');
        this.updateDisplay();
    }
    
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
    
    calculateScore() {
        const { level, suit, result, doubled, declarer } = this.currentContract;
        
        console.log(`💰 Calculating Rubber Bridge score for ${level}${suit}${doubled} by ${declarer} = ${result}`);
        
        const suitValues = { '♣': 20, '♦': 20, '♥': 30, '♠': 30, 'NT': 30 };
        const declarerSide = this.getPartnership(declarer);
        const isVulnerable = this.rubberState.vulnerability[declarerSide];
        
        let belowLineScore = 0;
        let aboveLineScore = 0;
        
        if (result === '=' || result?.startsWith('+')) {
            let basicScore = level * suitValues[suit];
            if (suit === 'NT') basicScore += 10;
            
            belowLineScore = basicScore;
            if (doubled === 'X') belowLineScore *= 2;
            else if (doubled === 'XX') belowLineScore *= 4;
            
            if (belowLineScore >= 100) {
                aboveLineScore += isVulnerable ? 500 : 300;
            } else {
                aboveLineScore += 50;
            }
            
            if (level === 6) {
                aboveLineScore += isVulnerable ? 750 : 500;
            } else if (level === 7) {
                aboveLineScore += isVulnerable ? 1500 : 1000;
            }
            
            if (doubled === 'X') aboveLineScore += 50;
            else if (doubled === 'XX') aboveLineScore += 100;
            
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
    
    calculateAndRecordScore() {
        const scoreResult = this.calculateScore();
        const { belowLineScore, aboveLineScore, declarerSide, contractMade } = scoreResult;
        
        if (contractMade) {
            this.rubberState.belowLineScores[declarerSide] += belowLineScore;
            this.rubberState.aboveLineScores[declarerSide] += aboveLineScore;
            this.rubberState.lastContractSide = declarerSide;
            
            if (this.rubberState.belowLineScores[declarerSide] >= 100) {
                this.processGameWon(declarerSide);
            }
            
        } else {
            const defendingSide = declarerSide === 'NS' ? 'EW' : 'NS';
            this.rubberState.aboveLineScores[defendingSide] += aboveLineScore;
            this.rubberState.lastContractSide = defendingSide;
        }
        
        this.updateGameStateScores();
        
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
    
    processGameWon(winningSide) {
        this.rubberState.gamesWon[winningSide]++;
        console.log(`🎉 Game won by ${winningSide}! Games: NS ${this.rubberState.gamesWon.NS}, EW ${this.rubberState.gamesWon.EW}`);
        
        this.rubberState.belowLineScores = { NS: 0, EW: 0 };
        this.rubberState.vulnerability[winningSide] = true;
        
        if (this.rubberState.gamesWon[winningSide] === 2) {
            this.processRubberWon(winningSide);
        }
    }
    
    processRubberWon(winningSide) {
        this.rubberState.rubberComplete = true;
        this.rubberState.rubberWinner = winningSide;
        
        const losingGames = this.rubberState.gamesWon[winningSide === 'NS' ? 'EW' : 'NS'];
        const rubberBonus = losingGames === 0 ? 700 : 500;
        
        this.rubberState.aboveLineScores[winningSide] += rubberBonus;
        this.updateGameStateScores();
        
        console.log(`🏆 Rubber won by ${winningSide}! Bonus: ${rubberBonus}`);
        
        this.gameState.addToHistory({
            deal: this.gameState.getDealNumber(),
            type: 'rubber_complete',
            winner: winningSide,
            bonus: rubberBonus,
            finalScores: this.getRubberTotals(),
            mode: 'rubber'
        });
    }
    
    startNewRubber() {
        console.log('🆕 Starting new rubber');
        this.resetRubber();
        this.resetContract();
        this.inputState = 'level_selection';
        this.updateDisplay();
    }
    
    updateGameStateScores() {
        const totals = this.getRubberTotals();
        this.gameState.scores.NS = totals.NS;
        this.gameState.scores.EW = totals.EW;
    }
    
    getRubberTotals() {
        return {
            NS: this.rubberState.belowLineScores.NS + this.rubberState.aboveLineScores.NS,
            EW: this.rubberState.belowLineScores.EW + this.rubberState.aboveLineScores.EW
        };
    }
    
    getCurrentVulnerabilityString() {
        const nsVuln = this.rubberState.vulnerability.NS;
        const ewVuln = this.rubberState.vulnerability.EW;
        
        if (nsVuln && ewVuln) return 'Both';
        if (nsVuln) return 'NS';
        if (ewVuln) return 'EW';
        return 'None';
    }
    
    nextDeal() {
        console.log('🃏 Moving to next deal in rubber');
        
        this.gameState.nextDeal();
        this.resetContract();
        this.inputState = 'level_selection';
        this.ui.clearVulnerabilityHighlight();
        this.rubberState.honorBonusPending = false;
    }
    
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
    
    undoLastScore() {
        const lastEntry = this.gameState.getLastHistoryEntry();
        if (lastEntry && lastEntry.deal === this.gameState.getDealNumber() && lastEntry.mode === 'rubber') {
            if (lastEntry.type !== 'honor_bonus' && lastEntry.type !== 'rubber_complete') {
                const side = lastEntry.scoringSide;
                
                if (lastEntry.belowLineScore) {
                    this.rubberState.belowLineScores[side] -= lastEntry.belowLineScore;
                }
                if (lastEntry.aboveLineScore) {
                    this.rubberState.aboveLineScores[side] -= lastEntry.aboveLineScore;
                }
                
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
                    const maxDown = Math.min(7, 6 + this.currentContract.level);
                    const buttons = [];
                    for (let i = 1; i <= maxDown; i++) {
                        buttons.push(i.toString());
                    }
                    return buttons;
                } else if (this.resultMode === 'plus') {
                    const maxOvertricks = 13 - (6 + this.currentContract.level);
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
    
    updateDisplay() {
        const content = this.getDisplayContent();
        this.ui.updateDisplay(content);
        this.ui.updateButtonStates(this.getActiveButtons());
    }
    
    getDisplayContent() {
        const totals = this.getRubberTotals();
        const dealInfo = this.gameState.getDealInfo();
        
        if (this.rubberState.rubberComplete) {
            const winner = this.rubberState.rubberWinner;
            const gamesWon = this.rubberState.gamesWon[winner];
            const gamesLost = this.rubberState.gamesWon[winner === 'NS' ? 'EW' : 'NS'];
            
            return `
                <div class="title-score-row">
                    <div class="mode-title">${this.displayName}</div>
                    <div class="score-display">
                        NS: ${totals.NS}<br>
                        EW: ${totals.EW}
                    </div>
                </div>
                <div class="game-content">
                    <div style="text-align: center; color: #f1c40f; font-size: 16px; margin: 8px 0;">
                        🏆 RUBBER COMPLETE! 🏆
                    </div>
                    <div style="text-align: center; font-size: 14px; margin: 6px 0;">
                        <strong>${winner} wins ${gamesWon}-${gamesLost}</strong>
                    </div>
                    ${this.generateScorecard()}
                </div>
                <div class="current-state">
                    Press NEW below to start again<br>
                    <div style="background: #f1c40f; color: #2c3e50; padding: 4px 8px; border-radius: 4px; display: inline-block; margin-top: 4px; font-weight: bold;">
                        NEW
                    </div>
                </div>
            `;
        }
        
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
                            'Made/Plus/Down or X for double' : 
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
                        <div><strong>${contract} by ${this.currentContract.declarer}</strong></div>
                        <div class="rubber-scores">
                            ${this.generateRubberScoreDisplay()}
                        </div>
                    </div>
                    <div class="current-state">Made exactly, Plus overtricks, or Down?</div>
                `;
                
            case 'result_number_selection':
                const fullContract = `${this.currentContract.level}${this.currentContract.suit}${this.currentContract.doubled}`;
                if (this.resultMode === 'down') {
                    const maxDown = Math.min(7, 6 + this.currentContract.level);
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
                            <div><strong>${fullContract} by ${this.currentContract.declarer}</strong></div>
                            <div class="rubber-scores">
                                ${this.generateRubberScoreDisplay()}
                            </div>
                        </div>
                        <div class="current-state">Tricks down (1-${maxDown})</div>
                    `;
                } else {
                    const maxOvertricks = 13 - (6 + this.currentContract.level);
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
                            <div><strong>${fullContract} by ${this.currentContract.declarer}</strong></div>
                            <div class="rubber-scores">
                                ${this.generateRubberScoreDisplay()}
                            </div>
                        </div>
                        <div class="current-state">Overtricks (1-${maxOvertricks})</div>
                    `;
                }
                
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
                            <div><strong>Deal ${lastEntry.deal}:</strong> ${contractDisplay} by ${lastEntry.contract.declarer} = ${lastEntry.contract.result}</div>
                            <div class="rubber-scores">
                                ${this.generateRubberScoreDisplay()}
                            </div>
                            ${lastEntry.gameWon ? `<div style="color: #f1c40f; text-align: center; margin: 4px 0;">🎉 GAME to ${lastEntry.scoringSide}! 🎉</div>` : ''}
                        </div>
                        <div class="current-state">Press Honors for bonuses, or Deal for next hand</div>
                    `;
                }
                break;
                
            default:
                return '<div class="current-state">Loading...</div>';
        }
    }
    
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
            <div class="rubber-score-table" style="font-family: monospace; font-size: 11px; border: 1px solid rgba(255,255,255,0.3); margin: 4px 0;">
                <div style="display: flex; background: rgba(255,255,255,0.1);">
                    <div style="flex: 1; text-align: center; padding: 2px; border-right: 1px solid rgba(255,255,255,0.3); font-size: 10px;">
                        <strong>NS ${nsVuln ? '(V)' : ''}</strong>
                    </div>
                    <div style="flex: 1; text-align: center; padding: 2px; font-size: 10px;">
                        <strong>EW ${ewVuln ? '(V)' : ''}</strong>
                    </div>
                </div>
                <div style="display: flex; min-height: 20px;">
                    <div style="flex: 1; text-align: center; padding: 2px; border-right: 1px solid rgba(255,255,255,0.3); color: #3498db; font-size: 11px;">
                        ${nsAbove || ''}
                    </div>
                    <div style="flex: 1; text-align: center; padding: 2px; color: #3498db; font-size: 11px;">
                        ${ewAbove || ''}
                    </div>
                </div>
                <div style="border-top: 2px solid rgba(255,255,255,0.5); display: flex;">
                    <div style="flex: 1; text-align: center; padding: 2px; border-right: 1px solid rgba(255,255,255,0.3); color: #e74c3c; font-weight: bold; font-size: 11px;">
                        ${nsBelow || ''}
                    </div>
                    <div style="flex: 1; text-align: center; padding: 2px; color: #e74c3c; font-weight: bold; font-size: 11px;">
                        ${ewBelow || ''}
                    </div>
                </div>
                <div style="display: flex; background: rgba(255,255,255,0.05); font-size: 9px;">
                    <div style="flex: 1; text-align: center; padding: 1px; border-right: 1px solid rgba(255,255,255,0.3);">
                        ${'★'.repeat(nsGames)}${'☆'.repeat(2-nsGames)}
                    </div>
                    <div style="flex: 1; text-align: center; padding: 1px;">
                        ${'★'.repeat(ewGames)}${'☆'.repeat(2-ewGames)}
                    </div>
                </div>
            </div>
        `;
    }
    
    generateScorecard() {
        const nsBelow = this.rubberState.belowLineScores.NS;
        const ewBelow = this.rubberState.belowLineScores.EW;
        const nsAbove = this.rubberState.aboveLineScores.NS;
        const ewAbove = this.rubberState.aboveLineScores.EW;
        const nsTotal = nsBelow + nsAbove;
        const ewTotal = ewBelow + ewAbove;
        const winner = this.rubberState.rubberWinner;
        const margin = Math.abs(nsTotal - ewTotal);
        
        return `
            <div style="font-family: monospace; font-size: 11px; border: 1px solid #f1c40f; margin: 8px 0; background: rgba(241,196,15,0.1); max-width: 100%;">
                <div style="background: #f1c40f; color: #2c3e50; text-align: center; padding: 6px; font-weight: bold; font-size: 12px;">
                    🏆 ${winner} WINS RUBBER 🏆
                </div>
                <div style="padding: 8px;">
                    <div style="display: flex; margin-bottom: 8px;">
                        <div style="flex: 1; text-align: center;">
                            <div style="font-weight: bold; color: #f1c40f;">NS TOTAL</div>
                            <div style="font-size: 16px; font-weight: bold;">${nsTotal}</div>
                        </div>
                        <div style="flex: 1; text-align: center;">
                            <div style="font-weight: bold; color: #f1c40f;">EW TOTAL</div>
                            <div style="font-size: 16px; font-weight: bold;">${ewTotal}</div>
                        </div>
                    </div>
                    <div style="text-align: center; border-top: 1px solid rgba(255,255,255,0.3); padding-top: 6px; font-size: 12px;">
                        Winning margin: <strong>${margin} points</strong>
                    </div>
                    <div style="display: flex; margin-top: 6px; font-size: 10px; color: rgba(255,255,255,0.8);">
                        <div style="flex: 1;">
                            Above: ${nsAbove}<br>
                            Below: ${nsBelow}
                        </div>
                        <div style="flex: 1; text-align: right;">
                            Above: ${ewAbove}<br>
                            Below: ${ewBelow}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    toggleVulnerability() {
        const current = this.getCurrentVulnerabilityString();
        const cycle = ['None', 'NS', 'EW', 'Both'];
        const currentIndex = cycle.indexOf(current);
        const nextIndex = (currentIndex + 1) % cycle.length;
        const next = cycle[nextIndex];
        
        this.rubberState.vulnerability.NS = next === 'NS' || next === 'Both';
        this.rubberState.vulnerability.EW = next === 'EW' || next === 'Both';
        
        console.log(`🎯 Rubber vulnerability manually set to: ${next}`);
        this.updateDisplay();
    }
    
    getHelpContent() {
        return {
            title: 'Rubber Bridge Help',
            content: `
                <div class="help-section">
                    <h4>What is Rubber Bridge?</h4>
                    <p><strong>Rubber Bridge</strong> is the traditional, classic form of bridge scoring. Two partnerships compete to be first to win 2 games, which completes the "rubber."</p>
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
                    <h4>Honor Bonuses</h4>
                    <ul>
                        <li><strong>4 trump honors</strong> (A,K,Q,J,10): 100 points</li>
                        <li><strong>5 trump honors</strong> (all): 150 points</li>
                        <li><strong>4 aces in NT:</strong> 150 points</li>
                        <li>Must be held by one player in the partnership</li>
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
            `,
            buttons: [
                { text: 'Close Help', action: 'close', class: 'close-btn' }
            ]
        };
    }
    
    cleanup() {
        this.ui.clearVulnerabilityHighlight();
        this.ui.updateDoubleButton('');
        console.log('🧹 Rubber Bridge cleanup completed');
    }
}

export default RubberBridge;