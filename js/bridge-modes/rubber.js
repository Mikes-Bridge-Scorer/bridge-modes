import { BaseBridgeMode } from './base-mode.js';

class RubberBridge extends BaseBridgeMode {
    constructor(gameState, ui) {
        super(gameState, ui);
        this.modeName = 'rubber';
        this.displayName = 'Rubber Bridge';
        
        // Contract state
        this.currentContract = {
            level: null,
            suit: null,
            declarer: null,
            doubled: '',
            result: null
        };
        
        this.inputState = 'level_selection';
        this.resultMode = null;
        
        // Rubber state with detailed scoring
        this.rubberState = {
            gamesWon: { NS: 0, EW: 0 },
            belowLineScores: { NS: 0, EW: 0 },
            aboveLineScores: { NS: 0, EW: 0 },
            partScores: { NS: 0, EW: 0 }, // Track part-game points
            rubberComplete: false,
            rubberWinner: null,
            vulnerability: { NS: false, EW: false },
            honorBonusPending: false,
            lastContractSide: null,
            lastContractDetails: null
        };
        
        console.log('🏗️ Enhanced Rubber Bridge initialized');
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
        this.rubberState.partScores = { NS: 0, EW: 0 };
        this.rubberState.rubberComplete = false;
        this.rubberState.rubberWinner = null;
        this.rubberState.vulnerability = { NS: false, EW: false };
        this.rubberState.honorBonusPending = false;
        this.rubberState.lastContractSide = null;
        this.rubberState.lastContractDetails = null;
        this.gameState.resetScores();
        console.log('🔄 Rubber reset - starting fresh');
    }
    
    handleAction(value) {
        console.log(`🎮 Rubber Bridge action: ${value} in state: ${this.inputState}`);
        
        if (this.rubberState.rubberComplete && value === 'DEAL') {
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
        console.log(`🏅 Honor bonus input: ${value}`);
        
        if (value === 'BACK') {
            this.rubberState.honorBonusPending = false;
            console.log('❌ No honor bonuses claimed');
        } else if (value === 'PLUS' || value === 'Plus') {
            // 4 honors in suit (100) or 4 aces in NT (150)
            const bonus = this.currentContract.suit === 'NT' ? 150 : 100;
            this.awardHonorBonus(bonus);
            console.log(`✅ Awarded ${bonus} points for 4 honors/aces`);
        } else if (value === 'DOWN' || value === 'Down') {
            // 5 honors (150) - only available in suit contracts
            if (this.currentContract.suit !== 'NT') {
                this.awardHonorBonus(150);
                console.log('✅ Awarded 150 points for 5 honors');
            }
        }
        
        this.rubberState.honorBonusPending = false;
        this.updateDisplay();
    }
    
    startHonorBonusInput() {
        this.rubberState.honorBonusPending = true;
        console.log('🏅 Starting honor bonus input');
        this.updateDisplay();
    }
    
    awardHonorBonus(bonus) {
        if (this.rubberState.lastContractSide && bonus > 0) {
            this.rubberState.aboveLineScores[this.rubberState.lastContractSide] += bonus;
            this.updateGameStateScores();
            console.log(`🏆 ${bonus} honor points awarded to ${this.rubberState.lastContractSide}`);
        }
    }
    
    calculateAndRecordScore() {
        const { level, suit, result, doubled, declarer } = this.currentContract;
        const suitValues = { '♣': 20, '♦': 20, '♥': 30, '♠': 30, 'NT': 30 };
        const declarerSide = (declarer === 'N' || declarer === 'S') ? 'NS' : 'EW';
        const isVulnerable = this.rubberState.vulnerability[declarerSide];
        
        let belowLineScore = 0;
        let aboveLineScore = 0;
        let contractMade = false;
        let totalScore = 0;
        
        console.log(`💰 Calculating score for ${level}${suit}${doubled} by ${declarer} = ${result}, vuln: ${isVulnerable}`);
        
        if (result === '=' || (result && result.startsWith('+'))) {
            contractMade = true;
            
            // Basic score calculation
            let basicScore = level * suitValues[suit];
            if (suit === 'NT') basicScore += 10; // First trick bonus
            
            // Apply doubling to basic score
            belowLineScore = basicScore;
            if (doubled === 'X') belowLineScore *= 2;
            else if (doubled === 'XX') belowLineScore *= 4;
            
            // Game and part-game bonuses
            if (belowLineScore >= 100) {
                aboveLineScore += isVulnerable ? 500 : 300; // Game bonus
            } else {
                aboveLineScore += 50; // Part-game bonus
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
                    let overtrickValue = overtricks * (isVulnerable ? 200 : 100);
                    if (doubled === 'XX') overtrickValue *= 2;
                    aboveLineScore += overtrickValue;
                }
            }
            
            totalScore = belowLineScore + aboveLineScore;
            
            // Update rubber state for made contracts
            this.rubberState.partScores[declarerSide] += belowLineScore;
            this.rubberState.aboveLineScores[declarerSide] += aboveLineScore;
            this.rubberState.lastContractSide = declarerSide;
            
            // Check for game
            if (this.rubberState.partScores[declarerSide] >= 100) {
                this.processGameWon(declarerSide);
            }
            
        } else if (result && result.startsWith('-')) {
            // Contract failed
            const undertricks = parseInt(result.substring(1));
            const defendingSide = declarerSide === 'NS' ? 'EW' : 'NS';
            
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
            
            // Update rubber state for failed contracts
            this.rubberState.aboveLineScores[defendingSide] += aboveLineScore;
            this.rubberState.lastContractSide = defendingSide;
        }
        
        // Store contract details for honor bonuses
        this.rubberState.lastContractDetails = {
            contract: `${level}${suit}${doubled}`,
            declarer: declarer,
            result: result,
            belowLineScore: belowLineScore,
            aboveLineScore: aboveLineScore,
            totalScore: totalScore
        };
        
        this.updateGameStateScores();
        
        // Record in history
        this.gameState.addToHistory({
            deal: this.gameState.getDealNumber(),
            contract: { ...this.currentContract },
            score: totalScore,
            actualScore: Math.abs(totalScore),
            scoringSide: contractMade ? declarerSide : (declarerSide === 'NS' ? 'EW' : 'NS'),
            mode: 'rubber',
            rubberScoring: {
                belowLine: belowLineScore,
                aboveLine: contractMade ? aboveLineScore : aboveLineScore,
                gameWon: this.rubberState.partScores[declarerSide] >= 100
            }
        });
        
        console.log(`📊 Score: ${totalScore} (${belowLineScore} below, ${aboveLineScore} above)`);
    }
    
    processGameWon(winningSide) {
        console.log(`🎯 Game won by ${winningSide}!`);
        this.rubberState.gamesWon[winningSide]++;
        
        // Reset part scores - new game starts
        this.rubberState.partScores = { NS: 0, EW: 0 };
        
        // Winner becomes vulnerable
        this.rubberState.vulnerability[winningSide] = true;
        
        // Check for rubber completion
        if (this.rubberState.gamesWon[winningSide] === 2) {
            this.processRubberWon(winningSide);
        }
    }
    
    processRubberWon(winningSide) {
        console.log(`🏆 RUBBER WON BY ${winningSide}!`);
        this.rubberState.rubberComplete = true;
        this.rubberState.rubberWinner = winningSide;
        
        // Award rubber bonus
        const losingGames = this.rubberState.gamesWon[winningSide === 'NS' ? 'EW' : 'NS'];
        const rubberBonus = losingGames === 0 ? 700 : 500; // 2-0 = 700, 2-1 = 500
        
        this.rubberState.aboveLineScores[winningSide] += rubberBonus;
        this.updateGameStateScores();
        
        console.log(`🎊 Rubber bonus: ${rubberBonus} points to ${winningSide}`);
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
            NS: this.rubberState.partScores.NS + this.rubberState.aboveLineScores.NS,
            EW: this.rubberState.partScores.EW + this.rubberState.aboveLineScores.EW
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
        if (this.rubberState.rubberComplete) return false;
        
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
                this.inputState = 'result_type_selection';
                this.currentContract.result = null;
                break;
            default:
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
            const buttons = ['BACK'];
            if (this.currentContract.suit !== 'NT') {
                buttons.push('PLUS', 'DOWN'); // Try uppercase to match UI buttons
            } else {
                buttons.push('PLUS'); // 4 aces only
            }
            console.log('🏅 Honor buttons active:', buttons);
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
                    const maxOvertricks = 13 - (6 + this.currentContract.level);
                    const buttons = [];
                    for (let i = 1; i <= maxOvertricks; i++) {
                        buttons.push(i.toString());
                    }
                    return buttons;
                }
                break;
            case 'scoring':
                return ['DEAL'];
        }
        return [];
    }
    
    updateDisplay() {
        const content = this.getDisplayContent();
        this.ui.updateDisplay(content);
        this.ui.updateButtonStates(this.getActiveButtons());
        this.ui.updateVulnerabilityDisplay(this.getCurrentVulnerabilityString());
        
        // Show/hide honors button
        if (this.inputState === 'scoring' && !this.rubberState.honorBonusPending && !this.rubberState.rubberComplete) {
            this.ui.showHonorsButton();
        } else {
            this.ui.hideHonorsButton();
        }
    }
    
    getDisplayContent() {
        const totals = this.getRubberTotals();
        const dealInfo = this.gameState.getDealInfo();
        
        // Rubber completion screen
        if (this.rubberState.rubberComplete) {
            const winner = this.rubberState.rubberWinner;
            const gamesWon = this.rubberState.gamesWon[winner];
            const gamesLost = this.rubberState.gamesWon[winner === 'NS' ? 'EW' : 'NS'];
            const margin = totals[winner] - totals[winner === 'NS' ? 'EW' : 'NS'];
            
            return `
                <div class="title-score-row">
                    <div class="mode-title">🏆 RUBBER COMPLETE!</div>
                    <div class="score-display">Final: ${totals.NS}-${totals.EW}</div>
                </div>
                <div class="game-content">
                    <div style="text-align: center; color: #f1c40f; font-size: 18px; margin: 10px 0;">
                        <strong>${winner} WINS RUBBER ${gamesWon}-${gamesLost}</strong>
                    </div>
                    <div style="text-align: center; font-size: 14px; margin: 8px 0;">
                        Victory margin: ${margin} points
                    </div>
                    ${this.getRubberScoreBreakdown()}
                </div>
                <div class="current-state">Press <strong>Deal</strong> to start new rubber</div>
            `;
        }
        
        // Honor bonus input screen
        if (this.rubberState.honorBonusPending) {
            const contractSuit = this.currentContract.suit;
            const lastSide = this.rubberState.lastContractSide;
            
            return `
                <div class="title-score-row">
                    <div class="mode-title">🏅 Honor Bonuses</div>
                    <div class="score-display">Games: ${this.rubberState.gamesWon.NS}-${this.rubberState.gamesWon.EW}</div>
                </div>
                <div class="game-content">
                    <div style="text-align: center; color: #f39c12; margin: 10px 0; font-size: 16px;">
                        <strong>Honor bonuses for ${lastSide}?</strong>
                    </div>
                    <div style="background: rgba(241,196,15,0.2); padding: 10px; border-radius: 6px; margin: 8px 0;">
                        ${contractSuit === 'NT' 
                            ? '<strong>Plus</strong> = 4 Aces (150 pts)<br><strong>Back</strong> = No honors'
                            : '<strong>Plus</strong> = 4 Honors (100 pts)<br><strong>Down</strong> = 5 Honors (150 pts)<br><strong>Back</strong> = No honors'
                        }
                    </div>
                    <div style="font-size: 11px; color: #bdc3c7; margin-top: 6px;">
                        Honors = A, K, Q, J, 10 of trump suit ${contractSuit === 'NT' ? '| NT honors = 4 Aces' : ''}
                    </div>
                </div>
                <div class="current-state">Press <strong>Plus/Down</strong> buttons if you held honors, or <strong>Back</strong> for none</div>
            `;
        }
        
        // Standard game display with rubber scoring breakdown
        const rubberScoring = this.getRubberScoreBreakdown();
        
        switch (this.inputState) {
            case 'level_selection':
                return `
                    <div class="title-score-row">
                        <div class="mode-title">Rubber Bridge</div>
                        <div class="score-display">Games: ${this.rubberState.gamesWon.NS}-${this.rubberState.gamesWon.EW}</div>
                    </div>
                    <div class="game-content">
                        <div><strong>${dealInfo}</strong></div>
                        ${rubberScoring}
                    </div>
                    <div class="current-state">Select bid level (1-7)</div>
                `;
                
            case 'suit_selection':
                return `
                    <div class="title-score-row">
                        <div class="mode-title">Rubber Bridge</div>
                        <div class="score-display">Games: ${this.rubberState.gamesWon.NS}-${this.rubberState.gamesWon.EW}</div>
                    </div>
                    <div class="game-content">
                        <div><strong>${dealInfo}</strong></div>
                        <div><strong>Level: ${this.currentContract.level}</strong></div>
                        ${rubberScoring}
                    </div>
                    <div class="current-state">Select suit</div>
                `;
                
            case 'declarer_selection':
                const contractSoFar = `${this.currentContract.level}${this.currentContract.suit}`;
                const doubleText = this.currentContract.doubled ? ` ${this.currentContract.doubled}` : '';
                
                return `
                    <div class="title-score-row">
                        <div class="mode-title">Rubber Bridge</div>
                        <div class="score-display">Games: ${this.rubberState.gamesWon.NS}-${this.rubberState.gamesWon.EW}</div>
                    </div>
                    <div class="game-content">
                        <div><strong>${dealInfo}</strong></div>
                        <div><strong>Contract: ${contractSoFar}${doubleText}</strong></div>
                        ${rubberScoring}
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
                        <div class="mode-title">Rubber Bridge</div>
                        <div class="score-display">Games: ${this.rubberState.gamesWon.NS}-${this.rubberState.gamesWon.EW}</div>
                    </div>
                    <div class="game-content">
                        <div><strong>${dealInfo}</strong></div>
                        <div><strong>${contract} by ${this.currentContract.declarer}</strong></div>
                        ${rubberScoring}
                    </div>
                    <div class="current-state">Made exactly, Plus overtricks, or Down?</div>
                `;
                
            case 'result_number_selection':
                const fullContract = `${this.currentContract.level}${this.currentContract.suit}${this.currentContract.doubled}`;
                const modeText = this.resultMode === 'down' ? 'tricks down' : 'overtricks';
                return `
                    <div class="title-score-row">
                        <div class="mode-title">Rubber Bridge</div>
                        <div class="score-display">Games: ${this.rubberState.gamesWon.NS}-${this.rubberState.gamesWon.EW}</div>
                    </div>
                    <div class="game-content">
                        <div><strong>${dealInfo}</strong></div>
                        <div><strong>${fullContract} by ${this.currentContract.declarer}</strong></div>
                        ${rubberScoring}
                    </div>
                    <div class="current-state">Enter number of ${modeText}</div>
                `;
                
            case 'scoring':
                const lastDetails = this.rubberState.lastContractDetails;
                return `
                    <div class="title-score-row">
                        <div class="mode-title">Rubber Bridge</div>
                        <div class="score-display">Games: ${this.rubberState.gamesWon.NS}-${this.rubberState.gamesWon.EW}</div>
                    </div>
                    <div class="game-content">
                        <div><strong>Deal ${this.gameState.getDealNumber()} completed</strong></div>
                        ${lastDetails ? `
                            <div style="margin: 8px 0; padding: 8px; background: rgba(52,152,219,0.2); border-radius: 4px;">
                                <strong>${lastDetails.contract} by ${lastDetails.declarer} = ${lastDetails.result}</strong><br>
                                <span style="font-size: 12px;">
                                    Below line: ${lastDetails.belowLineScore} | Above line: ${lastDetails.aboveLineScore}
                                </span>
                            </div>
                        ` : ''}
                        ${rubberScoring}
                    </div>
                    <div class="current-state">Press <strong>Honors</strong> button to claim bonuses, or <strong>Deal</strong> for next hand</div>
                `;
        }
        
        return '<div class="current-state">Loading...</div>';
    }
    
    getRubberScoreBreakdown() {
        const ns = this.rubberState;
        const partNS = ns.partScores.NS;
        const partEW = ns.partScores.EW;
        const aboveNS = ns.aboveLineScores.NS;
        const aboveEW = ns.aboveLineScores.EW;
        const totalNS = partNS + aboveNS;
        const totalEW = partEW + aboveEW;
        
        const vulnNS = ns.vulnerability.NS ? '🔴' : '🟢';
        const vulnEW = ns.vulnerability.EW ? '🔴' : '🟢';
        
        return `
            <div style="background: rgba(255,255,255,0.1); padding: 8px; border-radius: 6px; margin: 6px 0; font-size: 11px;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                    <strong>NS ${vulnNS}</strong>
                    <strong>EW ${vulnEW}</strong>
                </div>
                <div style="display: flex; justify-content: space-between;">
                    <span>Game: ${partNS}</span>
                    <span>Game: ${partEW}</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                    <span>Bonus: ${aboveNS}</span>
                    <span>Bonus: ${aboveEW}</span>
                </div>
                <div style="display: flex; justify-content: space-between; border-top: 1px solid rgba(255,255,255,0.3); padding-top: 4px; margin-top: 4px; font-weight: bold;">
                    <span>Total: ${totalNS}</span>
                    <span>Total: ${totalEW}</span>
                </div>
            </div>
        `;
    }
    
    canGoBack() {
        return !this.rubberState.rubberComplete;
    }
    
    getHelpContent() {
        return {
            title: 'Enhanced Rubber Bridge Help',
            content: `
                <div class="help-section">
                    <h4>🏆 Rubber Bridge Scoring</h4>
                    <p>Traditional rubber bridge with visual score breakdown showing below-the-line and above-the-line points.</p>
                </div>
                
                <div class="help-section">
                    <h4>🎯 Game & Rubber Rules</h4>
                    <ul>
                        <li><strong>Game:</strong> First to 100+ below-the-line points</li>
                        <li><strong>Rubber:</strong> First to win 2 games</li>
                        <li><strong>Vulnerability:</strong> Game winners become vulnerable</li>
                        <li><strong>Rubber Bonus:</strong> 700 pts (2-0) or 500 pts (2-1)</li>
                    </ul>
                </div>
                
                <div class="help-section">
                    <h4>🏅 Honor Bonuses (Detailed Explanation)</h4>
                    <p><strong>What are honors?</strong> In bridge, honors are the top 5 cards of the trump suit: Ace, King, Queen, Jack, and 10. In No Trump contracts, only the four Aces count as honors.</p>
                    
                    <p><strong>How honor bonuses work:</strong></p>
                    <ul>
                        <li><strong>4 Honors in trump suit:</strong> 100 points (if declarer's side holds A-K-Q-J, A-K-Q-10, A-K-J-10, A-Q-J-10, or K-Q-J-10 of trumps)</li>
                        <li><strong>5 Honors in trump suit:</strong> 150 points (if declarer's side holds A-K-Q-J-10 of trumps)</li>
                        <li><strong>4 Aces in No Trump:</strong> 150 points (if declarer's side holds all four Aces)</li>
                    </ul>
                    
                    <p><strong>Important:</strong> Honor bonuses are awarded to the side that holds the honors (declarer + dummy combined), regardless of whether the contract was made or failed. These points go above-the-line and don't count toward making game.</p>
                    
                    <p><strong>When to claim:</strong> After each deal, if your side (declarer + dummy) held 4+ honors in the trump suit or 4 aces in NT, click the <strong>Honors</strong> button and select the appropriate bonus.</p>
                </div>
                
                <div class="help-section">
                    <h4>📊 Visual Score Display</h4>
                    <ul>
                        <li><strong>🔴/🟢 Vulnerability:</strong> Red=Vulnerable, Green=Not Vulnerable</li>
                        <li><strong>Game Points:</strong> Below-the-line (contract points)</li>
                        <li><strong>Bonus Points:</strong> Above-the-line (bonuses, penalties)</li>
                        <li><strong>Games Won:</strong> Shown in top-right (0-0, 1-0, etc.)</li>
                    </ul>
                </div>
                
                <div class="help-section">
                    <h4>🎮 How to Play</h4>
                    <ol>
                        <li>Enter contract: Level → Suit → Declarer</li>
                        <li>Use X button for doubles/redoubles</li>
                        <li>Enter result: Made/Plus/Down</li>
                        <li>Click <strong>Honors</strong> button to claim honor bonuses</li>
                        <li>Continue until rubber is complete</li>
                    </ol>
                </div>
                
                <div class="help-section">
                    <h4>💾 Game Storage & History</h4>
                    <p><strong>Data Persistence:</strong> Your game scores and history are automatically saved to your browser's local storage and persist between sessions.</p>
                    
                    <ul>
                        <li><strong>Automatic Saving:</strong> Every deal and score is saved immediately</li>
                        <li><strong>Session Persistence:</strong> Close and reopen the app - your game continues</li>
                        <li><strong>History Tracking:</strong> Complete deal-by-deal history with contracts and results</li>
                        <li><strong>Rubber Completion:</strong> When a rubber ends, you can start a new one or continue scoring</li>
                        <li><strong>Manual Reset:</strong> Use "Return to Menu" in Quit options to reset scores</li>
                        <li><strong>Browser Storage:</strong> Data stays until you clear browser data or use different device</li>
                    </ul>
                    
                    <p><strong>Viewing History:</strong> Use Quit → Show Scores to see complete game history with deal-by-deal breakdown.</p>
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
        this.ui.hideHonorsButton();
        console.log('🧹 Enhanced Rubber Bridge cleanup completed');
    }
}

export default RubberBridge;