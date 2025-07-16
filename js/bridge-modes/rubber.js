import { BaseBridgeMode } from './base-mode.js';

class RubberBridge extends BaseBridgeMode {
    constructor(gameState, ui) {
        super(gameState, ui);
        this.modeName = 'rubber';
        this.displayName = 'Rubber Bridge';
        this.currentContract = { level: null, suit: null, declarer: null, doubled: '', result: null };
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
    }
    
    initialize() {
        this.gameState.setMode('rubber');
        this.resetRubber();
        this.inputState = 'level_selection';
        this.resetContract();
        this.updateDisplay();
    }
    
    resetRubber() {
        this.rubberState.gamesWon = { NS: 0, EW: 0 };
        this.rubberState.belowLineScores = { NS: 0, EW: 0 };
        this.rubberState.aboveLineScores = { NS: 0, EW: 0 };
        this.rubberState.rubberComplete = false;
        this.rubberState.rubberWinner = null;
        this.rubberState.vulnerability = { NS: false, EW: false };
        this.rubberState.honorBonusPending = false;
        this.rubberState.lastContractSide = null;
        this.gameState.resetScores();
    }
    
    handleAction(value) {
        if (this.rubberState.rubberComplete && (value === 'NEW_RUBBER' || value === 'DEAL')) {
            this.startNewRubber();
            return;
        }
        
        if (this.rubberState.honorBonusPending) {
            this.handleHonorBonusInput(value);
            return;
        }
        
        if (this.inputState === 'level_selection') {
            this.handleLevelSelection(value);
        } else if (this.inputState === 'suit_selection') {
            this.handleSuitSelection(value);
        } else if (this.inputState === 'declarer_selection') {
            this.handleDeclarerSelection(value);
        } else if (this.inputState === 'result_type_selection') {
            this.handleResultTypeSelection(value);
        } else if (this.inputState === 'result_number_selection') {
            this.handleResultNumberSelection(value);
        } else if (this.inputState === 'scoring') {
            this.handleScoringActions(value);
        }
        this.updateDisplay();
    }
    
    handleLevelSelection(value) {
        if (['1', '2', '3', '4', '5', '6', '7'].includes(value)) {
            this.currentContract.level = parseInt(value);
            this.inputState = 'suit_selection';
        }
    }
    
    handleSuitSelection(value) {
        if (['♣', '♦', '♥', '♠', 'NT'].includes(value)) {
            this.currentContract.suit = value;
            this.inputState = 'declarer_selection';
        }
    }
    
    handleDeclarerSelection(value) {
        if (['N', 'S', 'E', 'W'].includes(value)) {
            this.currentContract.declarer = value;
            this.ui.highlightVulnerability(value, this.getCurrentVulnerabilityString());
        } else if (value === 'X') {
            this.handleDoubling();
        } else if (['MADE', 'PLUS', 'DOWN'].includes(value) && this.currentContract.declarer) {
            this.inputState = 'result_type_selection';
            this.handleResultTypeSelection(value);
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
                this.currentContract.result = '-' + num;
            } else if (this.resultMode === 'plus') {
                const maxOvertricks = 13 - (6 + this.currentContract.level);
                if (num <= maxOvertricks) {
                    this.currentContract.result = '+' + num;
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
        if (value === 'NO_HONORS' || value === 'BACK') {
            this.rubberState.honorBonusPending = false;
        } else if (value === '4_HONORS' || value === 'Plus') {
            if (this.currentContract.suit === 'NT') {
                this.awardHonorBonus('4_ACES'); // In NT, Plus = 4 Aces
            } else {
                this.awardHonorBonus('4_HONORS'); // In suit, Plus = 4 Honors
            }
            this.rubberState.honorBonusPending = false;
        } else if (value === '5_HONORS' || value === 'Down') {
            this.awardHonorBonus('5_HONORS'); // Down = 5 Honors (only in suits)
            this.rubberState.honorBonusPending = false;
        }
        this.updateDisplay();
    }
    
    startHonorBonusInput() {
        this.rubberState.honorBonusPending = true;
        this.updateDisplay();
    }
    
    awardHonorBonus(honorType) {
        let bonus = 0;
        if (honorType === '4_HONORS') bonus = 100;
        else if (honorType === '5_HONORS') bonus = 150;
        else if (honorType === '4_ACES') bonus = 150;
        
        if (this.rubberState.lastContractSide && bonus > 0) {
            this.rubberState.aboveLineScores[this.rubberState.lastContractSide] += bonus;
            this.updateGameStateScores();
            console.log(`🏅 Awarded ${honorType} bonus: ${bonus} points to ${this.rubberState.lastContractSide}`);
        }
    }
    
    calculateAndRecordScore() {
        const level = this.currentContract.level;
        const suit = this.currentContract.suit;
        const result = this.currentContract.result;
        const doubled = this.currentContract.doubled;
        const declarer = this.currentContract.declarer;
        
        const suitValues = { '♣': 20, '♦': 20, '♥': 30, '♠': 30, 'NT': 30 };
        const declarerSide = (declarer === 'N' || declarer === 'S') ? 'NS' : 'EW';
        const isVulnerable = this.rubberState.vulnerability[declarerSide];
        
        let belowLineScore = 0;
        let aboveLineScore = 0;
        let contractMade = false;
        let totalScore = 0;
        
        console.log('📊 Calculating score for:', {
            contract: level + suit + doubled,
            declarer: declarer,
            result: result,
            vulnerable: isVulnerable
        });
        
        if (result === '=' || (result && result.startsWith('+'))) {
            contractMade = true;
            let basicScore = level * suitValues[suit];
            if (suit === 'NT') basicScore += 10;
            
            belowLineScore = basicScore;
            if (doubled === 'X') belowLineScore *= 2;
            else if (doubled === 'XX') belowLineScore *= 4;
            
            // Game bonus
            if (belowLineScore >= 100) {
                aboveLineScore += isVulnerable ? 500 : 300;
            } else {
                aboveLineScore += 50;
            }
            
            // Slam bonuses
            if (level === 6) aboveLineScore += isVulnerable ? 750 : 500;
            else if (level === 7) aboveLineScore += isVulnerable ? 1500 : 1000;
            
            // Double bonuses
            if (doubled === 'X') aboveLineScore += 50;
            else if (doubled === 'XX') aboveLineScore += 100;
            
            // Overtricks
            if (result && result.startsWith('+')) {
                const overtricks = parseInt(result.substring(1));
                if (doubled === '') {
                    aboveLineScore += suitValues[suit] * overtricks;
                } else {
                    aboveLineScore += overtricks * (isVulnerable ? 200 : 100);
                    if (doubled === 'XX') aboveLineScore *= 2;
                }
            }
            
            totalScore = belowLineScore + aboveLineScore;
        } else if (result && result.startsWith('-')) {
            const undertricks = parseInt(result.substring(1));
            if (doubled === '') {
                aboveLineScore = undertricks * (isVulnerable ? 100 : 50);
            } else {
                let penalty = 0;
                for (let i = 1; i <= undertricks; i++) {
                    if (i === 1) penalty += isVulnerable ? 200 : 100;
                    else if (i <= 3) penalty += isVulnerable ? 300 : 200;
                    else penalty += 300;
                }
                if (doubled === 'XX') penalty *= 2;
                aboveLineScore = penalty;
            }
            totalScore = -aboveLineScore;
        }
        
        // Update rubber state scores
        if (contractMade) {
            this.rubberState.belowLineScores[declarerSide] += belowLineScore;
            this.rubberState.aboveLineScores[declarerSide] += aboveLineScore;
            this.rubberState.lastContractSide = declarerSide;
            
            console.log('✅ Contract made - scores updated:', {
                side: declarerSide,
                belowLine: belowLineScore,
                aboveLine: aboveLineScore,
                newBelowTotal: this.rubberState.belowLineScores[declarerSide]
            });
            
            if (this.rubberState.belowLineScores[declarerSide] >= 100) {
                console.log('🏆 Game won by', declarerSide);
                this.processGameWon(declarerSide);
            }
        } else {
            const defendingSide = declarerSide === 'NS' ? 'EW' : 'NS';
            this.rubberState.aboveLineScores[defendingSide] += aboveLineScore;
            this.rubberState.lastContractSide = defendingSide;
            
            console.log('❌ Contract failed - penalty to', defendingSide, ':', aboveLineScore);
        }
        
        // Update game state with new totals
        this.updateGameStateScores();
        
        // Record in history with proper scoring side
        const scoringSide = contractMade ? declarerSide : (declarerSide === 'NS' ? 'EW' : 'NS');
        
        this.gameState.addToHistory({
            deal: this.gameState.getDealNumber(),
            contract: { ...this.currentContract },
            score: contractMade ? totalScore : -totalScore,
            actualScore: Math.abs(totalScore),
            belowLineScore: contractMade ? belowLineScore : 0,
            aboveLineScore: aboveLineScore,
            scoringSide: scoringSide,
            mode: 'rubber',
            gameWon: contractMade && this.rubberState.belowLineScores[declarerSide] >= 100,
            rubberState: { ...this.rubberState }
        });
        
        console.log('📝 History entry added:', {
            score: contractMade ? totalScore : -totalScore,
            scoringSide: scoringSide,
            gameWon: contractMade && this.rubberState.belowLineScores[declarerSide] >= 100
        });
    }
    
    processGameWon(winningSide) {
        console.log('🎉 Processing game won by', winningSide);
        
        this.rubberState.gamesWon[winningSide]++;
        
        console.log('🎯 Games now:', this.rubberState.gamesWon);
        
        // Reset below line scores after winning a game
        this.rubberState.belowLineScores = { NS: 0, EW: 0 };
        
        // Winner becomes vulnerable
        this.rubberState.vulnerability[winningSide] = true;
        
        console.log('🆚 Vulnerability now:', this.rubberState.vulnerability);
        
        if (this.rubberState.gamesWon[winningSide] === 2) {
            console.log('🏆 Rubber won by', winningSide);
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
    }
    
    startNewRubber() {
        this.resetRubber();
        this.resetContract();
        this.inputState = 'level_selection';
        this.updateDisplay();
    }
    
    updateGameStateScores() {
        const totals = this.getRubberTotals();
        this.gameState.scores.NS = totals.NS;
        this.gameState.scores.EW = totals.EW;
        
        console.log('🧮 Rubber scores updated:', {
            belowLine: this.rubberState.belowLineScores,
            aboveLine: this.rubberState.aboveLineScores,
            totals: totals,
            gameStateScores: this.gameState.scores
        });
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
        this.gameState.nextDeal();
        this.resetContract();
        this.inputState = 'level_selection';
        this.ui.clearVulnerabilityHighlight();
        this.rubberState.honorBonusPending = false;
    }
    
    resetContract() {
        this.currentContract = { level: null, suit: null, declarer: null, doubled: '', result: null };
        this.resultMode = null;
        this.ui.updateDoubleButton('');
    }
    
    handleBack() {
        if (this.rubberState.rubberComplete) {
            return false;
        }
        if (this.rubberState.honorBonusPending) {
            this.rubberState.honorBonusPending = false;
            this.updateDisplay();
            return true;
        }
        if (this.inputState === 'suit_selection') {
            this.inputState = 'level_selection';
            this.currentContract.level = null;
        } else if (this.inputState === 'declarer_selection') {
            this.inputState = 'suit_selection';
            this.currentContract.suit = null;
            this.currentContract.doubled = '';
            this.ui.updateDoubleButton('');
        } else if (this.inputState === 'result_type_selection') {
            this.inputState = 'declarer_selection';
            this.currentContract.declarer = null;
            this.ui.clearVulnerabilityHighlight();
        } else if (this.inputState === 'result_number_selection') {
            this.inputState = 'result_type_selection';
            this.resultMode = null;
        } else if (this.inputState === 'scoring') {
            this.inputState = 'result_type_selection';
            this.currentContract.result = null;
        } else {
            return false;
        }
        this.updateDisplay();
        return true;
    }
    
    getActiveButtons() {
        if (this.rubberState.rubberComplete) {
            return ['DEAL'];
        }
        
        if (this.rubberState.honorBonusPending) {
            const buttons = ['BACK']; // Back for no honors
            if (this.currentContract.suit !== 'NT') {
                buttons.push('Plus', 'Down'); // 4/5 honors
            } else {
                buttons.push('Plus'); // 4 aces (use Plus button)
            }
            return buttons;
        }
        
        if (this.inputState === 'level_selection') {
            return ['1', '2', '3', '4', '5', '6', '7'];
        } else if (this.inputState === 'suit_selection') {
            return ['♣', '♦', '♥', '♠', 'NT'];
        } else if (this.inputState === 'declarer_selection') {
            const buttons = ['N', 'S', 'E', 'W', 'X'];
            if (this.currentContract.declarer) {
                buttons.push('MADE', 'PLUS', 'DOWN');
            }
            return buttons;
        } else if (this.inputState === 'result_type_selection') {
            return ['MADE', 'PLUS', 'DOWN'];
        } else if (this.inputState === 'result_number_selection') {
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
        } else if (this.inputState === 'scoring') {
            // UPDATED: Only Deal button active, Honors button handles honor bonuses
            return ['DEAL'];
        }
        return [];
    }
    
    updateDisplay() {
        const content = this.getDisplayContent();
        this.ui.updateDisplay(content);
        this.ui.updateButtonStates(this.getActiveButtons());
        this.ui.updateVulnerabilityDisplay(this.getCurrentVulnerabilityString());
        
        // Show/hide honors button based on state
        if (this.inputState === 'scoring' && !this.rubberState.honorBonusPending && !this.rubberState.rubberComplete) {
            this.ui.showHonorsButton();
        } else {
            this.ui.hideHonorsButton();
        }
    }
    
    getDisplayContent() {
        const totals = this.getRubberTotals();
        const dealInfo = this.gameState.getDealInfo();
        const scoreCard = this.generateScoreCard();
        
        if (this.rubberState.rubberComplete) {
            const winner = this.rubberState.rubberWinner;
            const gamesWon = this.rubberState.gamesWon[winner];
            const gamesLost = this.rubberState.gamesWon[winner === 'NS' ? 'EW' : 'NS'];
            return '<div class="title-score-row"><div class="mode-title">Rubber Bridge</div><div class="score-display">Games: ' + this.rubberState.gamesWon.NS + '-' + this.rubberState.gamesWon.EW + '</div></div><div class="game-content"><div style="text-align: center; color: #f1c40f; font-size: 16px; margin: 8px 0;">🏆 RUBBER COMPLETE! 🏆</div><div style="text-align: center; font-size: 14px; margin: 6px 0;"><strong>' + winner + ' wins ' + gamesWon + '-' + gamesLost + '</strong></div>' + scoreCard + '</div><div class="current-state">Press DEAL button for New Rubber</div>';
        }
        
        if (this.rubberState.honorBonusPending) {
            const contractSuit = this.currentContract.suit;
            const lastSide = this.rubberState.lastContractSide;
            let options = '';
            if (contractSuit === 'NT') {
                options = 'Plus=4 Aces (150), Back=None';
            } else {
                options = 'Plus=4 Honors (100), Down=5 Honors (150), Back=None';
            }
            return '<div class="title-score-row"><div class="mode-title">Rubber Bridge</div><div class="score-display">Games: ' + this.rubberState.gamesWon.NS + '-' + this.rubberState.gamesWon.EW + '</div></div><div class="game-content"><div><strong>' + dealInfo + '</strong></div><div style="text-align: center; color: #f39c12; margin: 10px 0;">Honor bonuses for ' + lastSide + '?</div><div style="font-size: 12px; text-align: center; color: #bdc3c7;">' + options + '</div>' + scoreCard + '</div><div class="current-state">Use Plus/Down buttons or Back for none</div>';
        }
        
        // Main game display with scorecard
        const baseDisplay = '<div class="title-score-row"><div class="mode-title">Rubber Bridge</div><div class="score-display">Games: ' + this.rubberState.gamesWon.NS + '-' + this.rubberState.gamesWon.EW + '</div></div><div class="game-content"><div><strong>' + dealInfo + '</strong></div>';
        
        if (this.inputState === 'level_selection') {
            return baseDisplay + scoreCard + '</div><div class="current-state">Select bid level (1-7)</div>';
        } else if (this.inputState === 'suit_selection') {
            return baseDisplay + '<div><strong>Level: ' + this.currentContract.level + '</strong></div>' + scoreCard + '</div><div class="current-state">Select suit</div>';
        } else if (this.inputState === 'declarer_selection') {
            const contractSoFar = this.currentContract.level + this.currentContract.suit;
            const doubleText = this.currentContract.doubled ? ' ' + this.currentContract.doubled : '';
            return baseDisplay + '<div><strong>Contract: ' + contractSoFar + doubleText + '</strong></div>' + scoreCard + '</div><div class="current-state">' + (this.currentContract.declarer ? 'Made/Plus/Down or X for double' : 'Select declarer (N/S/E/W)') + '</div>';
        } else if (this.inputState === 'result_type_selection') {
            const contract = this.currentContract.level + this.currentContract.suit + this.currentContract.doubled;
            return baseDisplay + '<div><strong>' + contract + ' by ' + this.currentContract.declarer + '</strong></div>' + scoreCard + '</div><div class="current-state">Made exactly, Plus overtricks, or Down?</div>';
        } else if (this.inputState === 'result_number_selection') {
            const fullContract = this.currentContract.level + this.currentContract.suit + this.currentContract.doubled;
            if (this.resultMode === 'down') {
                const maxDown = Math.min(7, 6 + this.currentContract.level);
                return baseDisplay + '<div><strong>' + fullContract + ' by ' + this.currentContract.declarer + '</strong></div>' + scoreCard + '</div><div class="current-state">Tricks down (1-' + maxDown + ')</div>';
            } else {
                const maxOvertricks = 13 - (6 + this.currentContract.level);
                return baseDisplay + '<div><strong>' + fullContract + ' by ' + this.currentContract.declarer + '</strong></div>' + scoreCard + '</div><div class="current-state">Overtricks (1-' + maxOvertricks + ')</div>';
            }
        } else if (this.inputState === 'scoring') {
            // UPDATED: Reference the Honors button instead of Made button
            return baseDisplay + '<div><strong>Deal completed</strong></div>' + scoreCard + '</div><div class="current-state">Press <strong>Honors</strong> button to claim bonuses, or <strong>Deal</strong> for next hand</div>';
        }
        
        return '<div class="current-state">Loading...</div>';
    }
    
    generateScoreCard() {
        const ns = this.rubberState;
        const totals = this.getRubberTotals();
        
        return '<div style="background: #2c3e50; border: 2px solid #34495e; border-radius: 8px; padding: 15px; margin: 15px 0; font-family: \'Courier New\', monospace; font-size: 14px;"><div style="display: grid; grid-template-columns: 1fr 1fr; text-align: center; font-weight: bold; color: #ecf0f1; margin-bottom: 8px; font-size: 16px;"><div>NS</div><div>EW</div></div><div style="display: grid; grid-template-columns: 1fr 1fr; text-align: center; margin-bottom: 12px; font-size: 20px; color: #f39c12;"><div>' + '◉'.repeat(ns.gamesWon.NS) + '○'.repeat(2 - ns.gamesWon.NS) + '</div><div>' + '◉'.repeat(ns.gamesWon.EW) + '○'.repeat(2 - ns.gamesWon.EW) + '</div></div><div style="display: grid; grid-template-columns: 1fr 1fr; text-align: center; padding: 8px 0; color: #ecf0f1; background: #34495e; border-radius: 4px; margin-bottom: 5px;"><div>' + (ns.aboveLineScores.NS || 0) + '</div><div>' + (ns.aboveLineScores.EW || 0) + '</div></div><div style="text-align: center; font-size: 10px; color: #95a5a6; margin-bottom: 8px;">Above the Line</div><hr style="border: none; border-top: 3px solid #e74c3c; margin: 8px 0;"><div style="display: grid; grid-template-columns: 1fr 1fr; text-align: center; padding: 8px 0; color: #ecf0f1; background: #34495e; border-radius: 4px; margin-bottom: 5px;"><div>' + (ns.belowLineScores.NS || 0) + '</div><div>' + (ns.belowLineScores.EW || 0) + '</div></div><div style="text-align: center; font-size: 10px; color: #95a5a6; margin-bottom: 12px;">Below the Line</div><div style="border-top: 2px solid #7f8c8d; padding-top: 8px;"><div style="display: grid; grid-template-columns: 1fr 1fr; text-align: center; font-weight: bold; color: #f1c40f; font-size: 16px;"><div>' + totals.NS + '</div><div>' + totals.EW + '</div></div><div style="text-align: center; font-size: 10px; color: #95a5a6; margin-top: 4px;">Running Totals</div></div></div>';
    }
    
    toggleVulnerability() {
        const current = this.getCurrentVulnerabilityString();
        const cycle = ['None', 'NS', 'EW', 'Both'];
        const currentIndex = cycle.indexOf(current);
        const nextIndex = (currentIndex + 1) % cycle.length;
        const next = cycle[nextIndex];
        this.rubberState.vulnerability.NS = next === 'NS' || next === 'Both';
        this.rubberState.vulnerability.EW = next === 'EW' || next === 'Both';
        this.updateDisplay();
    }
    
    canGoBack() {
        return !this.rubberState.rubberComplete;
    }
    
    getHelpContent() {
        return {
            title: 'Rubber Bridge Guide',
            content: '<div style="max-height: 70vh; overflow-y: auto; padding: 0 10px;"><div class="help-section"><h4>🃏 What Is Rubber Bridge?</h4><p>Rubber bridge is typically played by four players in fixed partnerships. The goal is to be the first partnership to win <strong>two games</strong>, which completes a <em>rubber</em>. Each game is won by scoring 100 or more points in successful contract bids.</p></div><div class="help-section"><h4>🏆 Scoring Structure</h4><p>Rubber bridge scores are divided into <strong>two parts</strong>:</p><ul><li><strong>Below the Line</strong> – Points for contracts bid and made</li><li><strong>Above the Line</strong> – Bonuses, honors, overtricks, slams, and penalties</li></ul></div><div class="help-section"><h4>📊 Below the Line (Game Points)</h4><p>Points for making your contract depend on the suit and number of tricks:</p><ul><li><strong>Major suits (♠ or ♥):</strong> 30 points per trick over six</li><li><strong>Minor suits (♦ or ♣):</strong> 20 points per trick over six</li><li><strong>No-trump:</strong> First trick is 40 points, each additional is 30</li></ul><p><em>Once a partnership scores 100+ points below the line, they win the game!</em></p></div><div class="help-section"><h4>🎯 Above the Line (Bonus Points)</h4><ul><li><strong>Game Bonus:</strong> 300 (non-vulnerable) or 500 (vulnerable)</li><li><strong>Part Game:</strong> 50 points for contracts under 100</li><li><strong>Small Slam (6-level):</strong> 500 (non-vul) or 750 (vul)</li><li><strong>Grand Slam (7-level):</strong> 1000 (non-vul) or 1500 (vul)</li><li><strong>Honors:</strong><ul><li>4 trump honors in one hand: 100 points</li><li>5 trump honors in one hand: 150 points</li><li>4 aces in NT (one hand): 150 points</li></ul></li><li><strong>Rubber Bonus:</strong> 700 (win 2-0) or 500 (win 2-1)</li></ul></div><div class="help-section"><h4>🆚 Vulnerability</h4><p>After winning a game, that partnership becomes <strong>vulnerable</strong>. Vulnerable bonuses are higher, but so are penalties!</p></div><div class="help-section"><h4>📱 How to Use This App</h4><ol><li><strong>Enter Contract:</strong><ul><li>Tap level (1-7)</li><li>Tap suit (♣♦♥♠ or NT)</li><li>Tap declarer (N/S/E/W)</li><li>Optional: Tap X for double/redouble</li></ul></li><li><strong>Enter Result:</strong><ul><li><strong>Made:</strong> Contract made exactly</li><li><strong>Plus:</strong> Made with overtricks (then select number)</li><li><strong>Down:</strong> Failed contract (then select tricks down)</li></ul></li><li><strong>Honor Bonuses:</strong><ul><li>After scoring, tap <strong>Honors</strong> button in control bar</li><li><strong>Plus:</strong> 4 trump honors (100 pts) or 4 aces in NT (150 pts)</li><li><strong>Down:</strong> 5 trump honors (150 pts, suits only)</li><li><strong>Back:</strong> No honors to claim</li></ul></li><li><strong>Next Hand:</strong> Tap <strong>Deal</strong> for next hand</li></ol></div><div class="help-section"><h4>📋 Scorecard Layout</h4><p>The app shows a traditional rubber bridge scorecard with games won (◉○), above-the-line scores, the red line, below-the-line scores, and running totals.</p></div><div class="help-section"><h4>💡 Tips for Success</h4><ul><li><strong>Game Strategy:</strong> Focus on making 100+ below the line</li><li><strong>Vulnerability:</strong> Be more cautious when vulnerable</li><li><strong>Honor Claims:</strong> Don\'t forget to claim honor bonuses using the Honors button!</li><li><strong>Rubber Bonus:</strong> Winning 2-0 gives extra 200 points</li></ul></div></div>',
            buttons: [
                { text: 'Close Help', action: 'close', class: 'close-btn' }
            ]
        };
    }
    
    cleanup() {
        this.ui.clearVulnerabilityHighlight();
        this.ui.updateDoubleButton('');
        this.ui.hideHonorsButton();
    }
}

export default RubberBridge;