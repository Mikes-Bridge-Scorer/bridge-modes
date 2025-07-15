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
            // Auto-highlight vulnerability for the declaring side
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
        if (value === 'HONORS' || value === 'Made') {
            this.startHonorBonusInput();
        } else if (value === 'DEAL') {
            this.nextDeal();
        }
    }
    
    handleHonorBonusInput(value) {
        if (value === 'NO_HONORS' || value === 'DEAL') {
            this.rubberState.honorBonusPending = false;
        } else if (value === '4_HONORS' || value === 'Plus') {
            this.awardHonorBonus('4_HONORS');
            this.rubberState.honorBonusPending = false;
        } else if (value === '5_HONORS' || value === 'Down') {
            this.awardHonorBonus('5_HONORS');
            this.rubberState.honorBonusPending = false;
        } else if (value === '4_ACES' || value === 'NT') {
            this.awardHonorBonus('4_ACES');
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
                aboveLineScore += 50; // Part game bonus
            }
            
            // Slam bonuses
            if (level === 6) aboveLineScore += isVulnerable ? 750 : 500; // Small slam
            else if (level === 7) aboveLineScore += isVulnerable ? 1500 : 1000; // Grand slam
            
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
            score: totalScore,
            actualScore: Math.abs(totalScore),
            belowLineScore: contractMade ? belowLineScore : 0,
            aboveLineScore: aboveLineScore,
            scoringSide: contractMade ? declarerSide : (declarerSide === 'NS' ? 'EW' : 'NS'),
            mode: 'rubber',
            gameWon: contractMade && this.rubberState.belowLineScores[declarerSide] >= 100
        });
    }
    
    processGameWon(winningSide) {
        this.rubberState.gamesWon[winningSide]++;
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
            return ['DEAL']; // Simplified - DEAL will trigger NEW_RUBBER
        }
        if (this.rubberState.honorBonusPending) {
            const buttons = ['DEAL']; // No honors
            if (this.currentContract.suit !== 'NT') {
                buttons.push('Plus', 'Down'); // 4/5 honors
            } else {
                buttons.push('NT'); // 4 aces
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
            return ['Made', 'DEAL']; // Made for honors, Deal for next hand
        }
        return [];
    }
    
    updateDisplay() {
        const content = this.getDisplayContent();
        this.ui.updateDisplay(content);
        this.ui.updateButtonStates(this.getActiveButtons());
        this.ui.updateVulnerabilityDisplay(this.getCurrentVulnerabilityString());
    }
    
    getDisplayContent() {
        const totals = this.getRubberTotals();
        const dealInfo = this.gameState.getDealInfo();
        
        if (this.rubberState.rubberComplete) {
            const winner = this.rubberState.rubberWinner;
            const gamesWon = this.rubberState.gamesWon[winner];
            const gamesLost = this.rubberState.gamesWon[winner === 'NS' ? 'EW' : 'NS'];
            return this.generateRubberCompleteDisplay(winner, gamesWon, gamesLost, totals);
        }
        
        if (this.rubberState.honorBonusPending) {
            return this.generateHonorBonusDisplay(dealInfo, totals);
        }
        
        // Main game display with above/below line visualization
        const scoreCard = this.generateScoreCard();
        
        if (this.inputState === 'level_selection') {
            return this.generateMainDisplay(dealInfo, scoreCard, 'Select bid level (1-7)');
        } else if (this.inputState === 'suit_selection') {
            return this.generateMainDisplay(dealInfo, scoreCard, 'Select suit', 
                `<div><strong>Level: ${this.currentContract.level}</strong></div>`);
        } else if (this.inputState === 'declarer_selection') {
            const contractSoFar = this.currentContract.level + this.currentContract.suit;
            const doubleText = this.currentContract.doubled ? ' ' + this.currentContract.doubled : '';
            return this.generateMainDisplay(dealInfo, scoreCard, 
                this.currentContract.declarer ? 'Made/Plus/Down or X for double' : 'Select declarer (N/S/E/W)',
                `<div><strong>Contract: ${contractSoFar}${doubleText}</strong></div>`);
        } else if (this.inputState === 'result_type_selection') {
            const contract = this.currentContract.level + this.currentContract.suit + this.currentContract.doubled;
            return this.generateMainDisplay(dealInfo, scoreCard, 'Made exactly, Plus overtricks, or Down?',
                `<div><strong>${contract} by ${this.currentContract.declarer}</strong></div>`);
        } else if (this.inputState === 'result_number_selection') {
            const fullContract = this.currentContract.level + this.currentContract.suit + this.currentContract.doubled;
            if (this.resultMode === 'down') {
                const maxDown = Math.min(7, 6 + this.currentContract.level);
                return this.generateMainDisplay(dealInfo, scoreCard, `Tricks down (1-${maxDown})`,
                    `<div><strong>${fullContract} by ${this.currentContract.declarer}</strong></div>`);
            } else {
                const maxOvertricks = 13 - (6 + this.currentContract.level);
                return this.generateMainDisplay(dealInfo, scoreCard, `Overtricks (1-${maxOvertricks})`,
                    `<div><strong>${fullContract} by ${this.currentContract.declarer}</strong></div>`);
            }
        } else if (this.inputState === 'scoring') {
            return this.generateMainDisplay(dealInfo, scoreCard, 'Press Made for honors, or Deal for next hand',
                '<div><strong>Deal completed</strong></div>');
        }
        
        return this.generateMainDisplay(dealInfo, scoreCard, 'Loading...');
    }
    
    generateScoreCard() {
        const ns = this.rubberState;
        return `
            <div class="rubber-scorecard">
                <div class="scorecard-header">
                    <div class="side-label">NS</div>
                    <div class="side-label">EW</div>
                </div>
                <div class="games-won">
                    <div class="games-ns">${'◉'.repeat(ns.gamesWon.NS)}${'○'.repeat(2 - ns.gamesWon.NS)}</div>
                    <div class="games-ew">${'◉'.repeat(ns.gamesWon.EW)}${'○'.repeat(2 - ns.gamesWon.EW)}</div>
                </div>
                <div class="above-line">
                    <div class="score-ns">${ns.aboveLineScores.NS}</div>
                    <div class="score-ew">${ns.aboveLineScores.EW}</div>
                </div>
                <hr class="the-line">
                <div class="below-line">
                    <div class="score-ns">${ns.belowLineScores.NS}</div>
                    <div class="score-ew">${ns.belowLineScores.EW}</div>
                </div>
                <div class="totals">
                    <div class="total-ns">${this.getRubberTotals().NS}</div>
                    <div class="total-ew">${this.getRubberTotals().EW}</div>
                </div>
            </div>
            <style>
                .rubber-scorecard {
                    background: #2c3e50;
                    border: 2px solid #34495e;
                    border-radius: 8px;
                    padding: 10px;
                    margin: 10px 0;
                    font-family: monospace;
                    font-size: 14px;
                }
                .scorecard-header {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    text-align: center;
                    font-weight: bold;
                    color: #ecf0f1;
                    margin-bottom: 5px;
                }
                .games-won {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    text-align: center;
                    margin-bottom: 8px;
                    font-size: 18px;
                    color: #f39c12;
                }
                .above-line, .below-line, .totals {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    text-align: center;
                    padding: 4px 0;
                    color: #ecf0f1;
                }
                .the-line {
                    border: none;
                    border-top: 2px solid #e74c3c;
                    margin: 5px 0;
                }
                .totals {
                    border-top: 1px solid #7f8c8d;
                    font-weight: bold;
                    color: #f1c40f;
                    margin-top: 5px;
                    padding-top: 5px;
                }
            </style>
        `;
    }
    
    generateMainDisplay(dealInfo, scoreCard, currentState, contractInfo = '') {
        return `
            <div class="title-score-row">
                <div class="mode-title">Rubber Bridge</div>
                <div class="score-display">Games: ${this.rubberState.gamesWon.NS}-${this.rubberState.gamesWon.EW}</div>
            </div>
            <div class="game-content">
                <div><strong>${dealInfo}</strong></div>
                ${contractInfo}
                ${scoreCard}
            </div>
            <div class="current-state">${currentState}</div>
        `;
    }
    
    generateRubberCompleteDisplay(winner, gamesWon, gamesLost, totals) {
        return `
            <div class="title-score-row">
                <div class="mode-title">Rubber Bridge</div>
                <div class="score-display">NS: ${totals.NS}<br>EW: ${totals.EW}</div>
            </div>
            <div class="game-content">
                <div style="text-align: center; color: #f1c40f; font-size: 16px; margin: 8px 0;">
                    🏆 RUBBER COMPLETE! 🏆
                </div>
                <div style="text-align: center; font-size: 14px; margin: 6px 0;">
                    <strong>${winner} wins ${gamesWon}-${gamesLost}</strong>
                </div>
                ${this.generateScoreCard()}
            </div>
            <div class="current-state">Press DEAL button for New Rubber</div>
        `;
    }
    
    generateHonorBonusDisplay(dealInfo, totals) {
        const contractSuit = this.currentContract.suit;
        const lastSide = this.rubberState.lastContractSide;
        
        let options = '';
        if (contractSuit === 'NT') {
            options = 'NT=4 Aces (150), DEAL=None';
        } else {
            options = 'Plus=4 Honors (100), Down=5 Honors (150), DEAL=None';
        }
        
        return `
            <div class="title-score-row">
                <div class="mode-title">Rubber Bridge</div>
                <div class="score-display">NS: ${totals.NS}<br>EW: ${totals.EW}</div>
            </div>
            <div class="game-content">
                <div><strong>${dealInfo}</strong></div>
                <div style="text-align: center; color: #f39c12; margin: 10px 0;">
                    Honor bonuses for ${lastSide}?
                </div>
                <div style="font-size: 12px; text-align: center; color: #bdc3c7;">
                    ${options}
                </div>
            </div>
            <div class="current-state">Select honor bonus or none</div>
        `;
    }
    
    toggleVulnerability() {
        // In rubber bridge, vulnerability is determined by games won
        // This method can be used for testing or manual override if needed
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
        return !this.rubberState.rubberComplete && this.inputState !== 'level_selection';
    }
    
    getHelpContent() {
        return {
            title: 'Rubber Bridge Help',
            content: `
                <div class="help-section">
                    <h4>🃏 Rubber Bridge Scoring</h4>
                    <p>Traditional rubber bridge is played to the best of 3 games. The first partnership to win 2 games wins the rubber and receives a substantial bonus.</p>
                </div>
                
                <div class="help-section">
                    <h4>📊 Scoring System</h4>
                    <ul>
                        <li><strong>Below the Line:</strong> Basic contract points (♣♦=20, ♥♠=30, NT=30+10)</li>
                        <li><strong>Above the Line:</strong> Bonuses, overtricks, penalties, honors</li>
                        <li><strong>Game:</strong> First to 100+ below the line wins a game</li>
                        <li><strong>Rubber:</strong> First to win 2 games wins the rubber</li>
                    </ul>
                </div>
                
                <div class="help-section">
                    <h4>🎯 Game Bonuses</h4>
                    <ul>
                        <li><strong>Game Bonus:</strong> 500 (vulnerable) or 300 (non-vulnerable)</li>
                        <li><strong>Part Game:</strong> 50 points</li>
                        <li><strong>Small Slam:</strong> 750 (vul) or 500 (non-vul)</li>
                        <li><strong>Grand Slam:</strong> 1500 (vul) or 1000 (non-vul)</li>
                        <li><strong>Rubber Bonus:</strong> 700 (2-0) or 500 (2-1)</li>
                    </ul>
                </div>
                
                <div class="help-section">
                    <h4>🏅 Honor Bonuses</h4>
                    <ul>
                        <li><strong>4 Trump Honors:</strong> 100 points</li>
                        <li><strong>5 Trump Honors:</strong> 150 points</li>
                        <li><strong>4 Aces (NT):</strong> 150 points</li>
                    </ul>
                </div>
                
                <div class="help-section">
                    <h4>🆚 Vulnerability</h4>
                    <p>After winning a game, that side becomes vulnerable for the rest of the rubber. Vulnerable penalties and bonuses are higher.</p>
                </div>
                
                <div class="help-section">
                    <h4>🎮 How to Use This App</h4>
                    <ol>
                        <li>Enter contract: Level → Suit → Declarer</li>
                        <li>Use X button to double/redouble</li>
                        <li>Enter result: Made/Plus/Down</li>
                        <li>Claim honor bonuses if applicable</li>
                        <li>Deal for next hand</li>
                    </ol>
                </div>
                
                <div class="help-section">
                    <h4>🔧 Special Controls</h4>
                    <ul>
                        <li><strong>Made Button:</strong> Claims honor bonuses (when scoring)</li>
                        <li><strong>Plus/Down:</strong> 4/5 trump honors (when claiming)</li>
                        <li><strong>NT Button:</strong> 4 aces in NT (when claiming)</li>
                        <li><strong>Deal Button:</strong> Skip honors / Start new rubber</li>
                    </ul>
                </div>
                
                <div class="help-section">
                    <h4>📈 Score Display</h4>
                    <p>The score card shows games won (◉○), above-the-line scores, below-the-line scores separated by the red line, and running totals.</p>
                </div>