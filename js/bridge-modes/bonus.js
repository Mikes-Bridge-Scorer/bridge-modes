// Expected HCP for contract type
        const expectedHCP = this.getExpectedHCP(level, suit);
        
        // Calculate distribution points
        const distributionPoints = (voids * 3) + (singletons * 2) + longSuits;
        
        // HCP percentages
        const declarerHCPPercentage = Math.round((totalHCP / 40) * 100);
        const defenderHCPPercentage = 100 - declarerHCPPercentage;
        const hcpAdvantage = Math.abs(declarerHCPPercentage - 50);
        const advantageSide = declarerHCPPercentage > 50 ? "declarer" : "defender";
        
        // Expected tricks calculations
        const contractExpectedTricks = level + 6;
        const handExpectedTricks = Math.min(13, 6 + Math.floor(totalHCP / 3) + Math.floor(distributionPoints / 4));
        
        // Actual result
        const actualTricks = this.getActualTricks();
        const madeContract = actualTricks >= contractExpectedTricks;
        const isNS = declarer === 'N' || declarer === 'S';
        
        let nsPoints = 0;
        let ewPoints = 0;
        
        if (madeContract) {
            // Contract made - apply Bonus Bridge scoring
            const rawScore = Math.abs(this.currentContract.rawScore) / 20;
            
            // HCP Adjustment
            const hcpAdjustment = (totalHCP - expectedHCP) * 0.75;
            let adjustedScore = totalHCP > expectedHCP 
                ? rawScore - hcpAdjustment 
                : rawScore + Math.abs(hcpAdjustment);
            
            // Performance assessment
            const performanceVariance = actualTricks - contractExpectedTricks;
            if (performanceVariance > 0) {
                adjustedScore += (performanceVariance * 1.5);
            }
            
            // Contract type adjustments
            let contractAdjustment = 0;
            if (this.isGameContract()) contractAdjustment += 2;
            if (level === 6) contractAdjustment += 4;
            if (level === 7) contractAdjustment += 6;
            if (suit === 'NT') contractAdjustment += 1;
            
            adjustedScore += contractAdjustment;
            
            // Distribution adjustment (suit contracts only)
            if (suit !== 'NT') {
                if (distributionPoints >= 7) adjustedScore -= 3;
                else if (distributionPoints >= 5) adjustedScore -= 2;
                else if (distributionPoints >= 3) adjustedScore -= 1;
            }
            
            // Defender reward
            let defenderReward = 0;
            if (handExpectedTricks > contractExpectedTricks && 
                actualTricks < handExpectedTricks) {
                const trickDifference = handExpectedTricks - actualTricks;
                defenderReward = trickDifference * 2;
                
                if (advantageSide === "declarer") {
                    defenderReward += Math.min(3, hcpAdvantage / 10);
                }
            }
            
            // Final points
            const declarerPoints = Math.max(1, Math.round(adjustedScore));
            const defenderPoints = Math.round(defenderReward);
            
            if (isNS) {
                nsPoints = declarerPoints;
                ewPoints = defenderPoints;
            } else {
                nsPoints = defenderPoints;
                ewPoints = declarerPoints;
            }
            
        } else {
            // Contract failed
            const basePenalty = Math.abs(this.currentContract.rawScore) / 10;
            let levelPenalties = 0;
            
            if (this.isGameContract()) levelPenalties += 3;
            if (level === 6) levelPenalties += 5;
            if (level === 7) levelPenalties += 7;
            
            // Performance bonus for defenders
            let performanceBonus = 0;
            if (declarerHCPPercentage > 60) {
                performanceBonus += (declarerHCPPercentage - 50) / 5;
            }
            
            const undertricks = Math.abs(actualTricks - contractExpectedTricks);
            if (undertricks >= 2) {
                performanceBonus += 2;
                if (undertricks >= 3) performanceBonus += 3;
            }
            
            // Declarer consolation
            let consolationPoints = 0;
            if (declarerHCPPercentage < 40) {
                consolationPoints = (50 - declarerHCPPercentage) / 10;
            }
            
            // Final points for defeated contracts
            const defenderPoints = Math.max(3, Math.round(basePenalty + levelPenalties + performanceBonus));
            const declarerPoints = Math.round(consolationPoints);
            
            if (isNS) {
                ewPoints = defenderPoints; // Defenders get points
                nsPoints = declarerPoints; // Declarer consolation
            } else {
                nsPoints = defenderPoints; // Defenders get points
                ewPoints = declarerPoints; // Declarer consolation
            }
        }
        
        return {
            totalHCP,
            distributionPoints,
            expectedHCP,
            contractExpectedTricks,
            handExpectedTricks,
            actualTricks,
            nsPoints,
            ewPoints,
            madeContract
        };
    }
    
    /**
     * Get expected HCP for contract type
     */
    getExpectedHCP(level, suit) {
        if (level <= 2) return 21; // Part scores
        if (level === 3 && suit === 'NT') return 25; // 3NT
        if (level === 4 && (suit === '♥' || suit === '♠')) return 24; // 4 major
        if (level === 5 && (suit === '♣' || suit === '♦')) return 27; // 5 minor
        if (level === 6) return 30; // Small slam
        if (level === 7) return 32; // Grand slam
        return 21 + (level * 1.5); // Other levels
    }
    
    /**
     * Check if contract is a game contract
     */
    isGameContract() {
        const { level, suit } = this.currentContract;
        return (level === 3 && suit === 'NT') ||
               (level === 4 && (suit === '♥' || suit === '♠')) ||
               (level === 5 && (suit === '♣' || suit === '♦')) ||
               level >= 6;
    }
    
    /**
     * Get actual tricks taken
     */
    getActualTricks() {
        const { level, result } = this.currentContract;
        const contractTricks = level + 6;
        
        if (result === '=') return contractTricks;
        if (result?.startsWith('+')) return contractTricks + parseInt(result.substring(1));
        if (result?.startsWith('-')) return contractTricks - parseInt(result.substring(1));
        return contractTricks;
    }
    
    /**
     * Move to next deal
     */
    nextDeal() {
        console.log('🃏 Moving to next deal');
        
        this.currentDeal++;
        this.resetContract();
        this.resetHandAnalysis();
        this.inputState = 'level_selection';
        this.updateDisplay();
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
            result: null,
            rawScore: null
        };
        this.resultMode = null;
    }
    
    /**
     * Reset hand analysis to default values
     */
    resetHandAnalysis() {
        this.handAnalysis = {
            totalHCP: 20,
            singletons: 0,
            voids: 0,
            longSuits: 0
        };
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
                break;
            case 'result_type_selection':
                this.inputState = 'declarer_selection';
                this.currentContract.declarer = null;
                break;
            case 'result_number_selection':
                this.inputState = 'result_type_selection';
                this.resultMode = null;
                break;
            case 'hcp_analysis':
                this.inputState = 'result_type_selection';
                this.currentContract.result = null;
                this.currentContract.rawScore = null;
                break;
            case 'scoring':
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
                
            case 'hcp_analysis':
                return []; // Popup handles all interactions
                
            case 'scoring':
                return ['DEAL'];
                
            default:
                return [];
        }
    }
    
    /**
     * Update the display using new system
     */
    updateDisplay() {
        const display = document.getElementById('display');
        if (display) {
            display.innerHTML = this.getDisplayContent();
        }
        
        // Update button states
        const activeButtons = this.getActiveButtons();
        activeButtons.push('BACK'); // Always allow going back
        
        this.bridgeApp.updateButtonStates(activeButtons);
    }
    
    /**
     * Get help content specific to Bonus Bridge
     */
    getHelpContent() {
        return {
            title: 'Bonus Bridge (HCP-Enhanced) Help',
            content: `
                <div class="help-section">
                    <h4>What is Bonus Bridge?</h4>
                    <p><strong>Bonus Bridge</strong> is an enhanced scoring system created by Mike Smith that rewards both declarers and defenders based on hand strength and performance versus expectations. It balances luck and skill by considering HCP distribution and playing performance.</p>
                </div>
                
                <div class="help-section">
                    <h4>Enhanced Features</h4>
                    <ul>
                        <li><strong>Auto Vulnerability:</strong> Follows 4-deal cycle like Chicago Bridge</li>
                        <li><strong>HCP Analysis:</strong> Required for fair, skill-based scoring</li>
                        <li><strong>Balanced Rewards:</strong> Both sides can earn points on every deal</li>
                        <li><strong>Performance Tracking:</strong> Compares actual vs expected results</li>
                    </ul>
                </div>
                
                <div class="help-section">
                    <h4>How HCP Analysis Works</h4>
                    <p>After entering the contract result, you'll analyze the combined cards of declarer and dummy:</p>
                    <ul>
                        <li><strong>High Card Points:</strong> A=4, K=3, Q=2, J=1</li>
                        <li><strong>Singletons:</strong> Number of 1-card suits</li>
                        <li><strong>Voids:</strong> Number of 0-card suits</li>
                        <li><strong>Long Suits:</strong> Number of 6+ card suits</li>
                    </ul>
                </div>
                
                <div class="help-section">
                    <h4>Perfect For Players Who Want</h4>
                    <ul>
                        <li>Skill to matter more than luck</li>
                        <li>Teaching the value of hand evaluation</li>
                        <li>Rewarding good defense even when contracts make</li>
                        <li>More balanced, competitive games</li>
                        <li>Innovation and fairness in bridge scoring</li>
                    </ul>
                </div>
                
                <div class="help-section">
                    <h4>Scoring Philosophy</h4>
                    <ul>
                        <li><strong>Made Contracts:</strong> Points adjusted based on HCP advantage/disadvantage</li>
                        <li><strong>Failed Contracts:</strong> Defenders rewarded, declarers get consolation if weak</li>
                        <li><strong>Both Sides Score:</strong> Most deals award points to both partnerships</li>
                        <li><strong>Skill Recognition:</strong> Better performance with weaker hands = more points</li>
                    </ul>
                </div>
            `,
            buttons: [
                { text: 'Close Help', action: 'close', class: 'close-btn' }
            ]
        };
    }
    
    /**
     * Show Bonus Bridge specific help
     */
    showHelp() {
        const helpContent = this.getHelpContent();
        this.bridgeApp.showModal(helpContent.title, helpContent.content);
    }
    
    /**
     * Show Bonus Bridge specific quit options
     */
    showQuit() {
        const scores = this.gameState.scores;
        const totalDeals = this.gameState.history.length;
        const licenseStatus = this.bridgeApp.licenseManager.checkLicenseStatus();
        
        let currentScoreContent = '';
        if (totalDeals > 0) {
            const leader = scores.NS > scores.EW ? 'North-South' : 
                          scores.EW > scores.NS ? 'East-West' : 'Tied';
            
            currentScoreContent = `
                <div class="help-section">
                    <h4>📊 Current Game Status</h4>
                    <p><strong>Deals Played:</strong> ${totalDeals}</p>
                    <p><strong>Current Scores:</strong></p>
                    <ul>
                        <li>North-South: ${scores.NS} points</li>
                        <li>East-West: ${scores.EW} points</li>
                    </ul>
                    <p><strong>Current Leader:</strong> ${leader}</p>
                </div>
            `;
        }
        
        let licenseSection = '';
        if (licenseStatus.status === 'trial') {
            licenseSection = `
                <div class="help-section">
                    <h4>📅 License Status</h4>
                    <p><strong>Trial Version:</strong> ${licenseStatus.daysLeft} days, ${licenseStatus.dealsLeft} deals remaining</p>
                </div>
            `;
        }
        
        const content = `
            ${currentScoreContent}
            ${licenseSection}
            <div class="help-section">
                <h4>🎮 Game Options</h4>
                <p>What would you like to do?</p>
            </div>
        `;
        
        const buttons = [
            { text: 'Continue Playing', action: () => {}, class: 'continue-btn' },
            { text: 'Show Scores', action: () => this.showDetailedScores(), class: 'scores-btn' },
            { text: 'New Game', action: () => this.startNewGame(), class: 'new-game-btn' },
            { text: 'Return to Main Menu', action: () => this.returnToMainMenu(), class: 'menu-btn' },
            { text: 'Show Help', action: () => this.showHelp(), class: 'help-btn' }
        ];
        
        this.bridgeApp.showModal('⭐ Bonus Bridge Options', content, buttons);
    }
    
    /**
     * Show detailed deal-by-deal scores with Bonus Bridge analysis
     */
    showDetailedScores() {
        const scores = this.gameState.scores;
        const history = this.gameState.history;
        
        if (history.length === 0) {
            this.bridgeApp.showModal('📊 Game Scores', '<p>No deals have been played yet.</p>');
            return;
        }

        let dealSummary = `
            <div class="scores-summary">
                <h4>📊 Current Totals</h4>
                <p><strong>North-South:</strong> ${scores.NS} points</p>
                <p><strong>East-West:</strong> ${scores.EW} points</p>
                <p><strong>Leader:</strong> ${scores.NS > scores.EW ? 'North-South' : scores.EW > scores.NS ? 'East-West' : 'Tied'}</p>
            </div>
            
            <div class="deals-history">
                <h4>🃏 Deal by Deal Analysis</h4>
                <div class="deal-scroll-container" style="
                    max-height: 280px; 
                    overflow-y: auto; 
                    overflow-x: hidden;
                    -webkit-overflow-scrolling: touch;
                    font-size: 11px;
                    border: 1px solid #444;
                    border-radius: 4px;
                    background: rgba(0,0,0,0.05);
                    margin: 10px 0;
                    position: relative;
                ">
        `;
        
        history.forEach((deal, index) => {
            const contract = deal.contract;
            const contractStr = `${contract.level}${contract.suit}${contract.doubled ? ' ' + contract.doubled : ''}`;
            const vulnerability = deal.vulnerability || 'NV';
            
            let analysisText = '';
            if (deal.bonusAnalysis) {
                const analysis = deal.bonusAnalysis;
                analysisText = `
                    <div style="font-size: 10px; color: #888; margin-top: 2px;">
                        HCP: ${analysis.totalHCP}/${analysis.expectedHCP} | Tricks: ${analysis.actualTricks}/${analysis.handExpectedTricks} | 
                        ${analysis.madeContract ? 'Made' : 'Failed'}
                    </div>
                `;
            }
            
            dealSummary += `
                <div style="
                    border-bottom: 1px solid #444; 
                    padding: 10px 6px; 
                    background: ${index % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent'};
                ">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                        <div style="flex: 1; min-width: 0;">
                            <div style="font-weight: bold; margin-bottom: 2px;">
                                Deal ${deal.deal} - ${vulnerability}
                            </div>
                        <div class="current-state">Press Deal for next hand</div>
                    `;
                }
                break;
                
            default:
                return '<div class="current-state">Loading...</div>';
        }
    }
}

// Export for the new module system
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BonusBridgeMode;
} else if (typeof window !== 'undefined') {
    window.BonusBridgeMode = BonusBridgeMode;
}

console.log('⭐ Bonus Bridge module loaded successfully with enhanced mobile HCP analysis');
                            <div style="font-size: 10px; color: #ccc;">
                                ${contractStr} by ${contract.declarer} = ${contract.result}
                            </div>
                            ${analysisText}
                        </div>
                        <div style="
                            text-align: right;
                            min-width: 80px;
                            font-size: 10px;
                            font-weight: bold;
                        ">
                            <div style="color: #3498db;">NS: +${deal.bonusAnalysis?.nsPoints || 0}</div>
                            <div style="color: #e67e22;">EW: +${deal.bonusAnalysis?.ewPoints || 0}</div>
                        </div>
                    </div>
                </div>
            `;
        });
        
        dealSummary += `
                </div>
            </div>
            
            <div style="
                text-align: center; 
                font-size: 10px; 
                color: #666; 
                margin-top: 10px;
                display: block;
            ">
                📱 Enhanced scoring shows HCP analysis and both-side rewards
            </div>
        `;
        
        const buttons = [
            { text: 'Back to Options', action: () => this.showQuit(), class: 'back-btn' },
            { text: 'Continue Playing', action: () => {}, class: 'continue-btn' }
        ];
        
        this.bridgeApp.showModal('📊 Bonus Bridge - Detailed Analysis', dealSummary, buttons);
    }
    
    /**
     * Start a new game (reset scores)
     */
    startNewGame() {
        const confirmed = confirm(
            'Start a new game?\n\nThis will reset all scores to zero and start over.\n\nClick OK to start new game, Cancel to continue current game.'
        );
        
        if (confirmed) {
            // Reset all scores and history
            this.gameState.scores = { NS: 0, EW: 0 };
            this.gameState.history = [];
            this.currentDeal = 1;
            this.vulnerability = 'NV';
            
            // Reset to level selection
            this.resetContract();
            this.resetHandAnalysis();
            this.inputState = 'level_selection';
            this.updateDisplay();
            
            console.log('🆕 New Bonus Bridge game started');
        }
    }
    
    /**
     * Return to main menu
     */
    returnToMainMenu() {
        this.bridgeApp.showLicensedMode({ 
            type: this.bridgeApp.licenseManager.getLicenseData()?.type || 'FULL' 
        });
    }
    
    /**
     * Get display content for current state
     */
    getDisplayContent() {
        const scores = this.gameState.scores;
        
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
                        <div><strong>Deal ${this.currentDeal} - ${this.vulnerability}</strong></div>
                        <div style="color: #e67e22; font-size: 12px; margin-top: 4px;">
                            HCP-based enhanced scoring • Auto vulnerability cycle
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
                        <div><strong>Deal ${this.currentDeal} - ${this.vulnerability}</strong></div>
                        <div><strong>Level: ${this.currentContract.level}</strong></div>
                        <div style="color: #e67e22; font-size: 12px; margin-top: 4px;">
                            Raw score calculated after result, then HCP analysis
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
                        <div><strong>Deal ${this.currentDeal} - ${this.vulnerability}</strong></div>
                        <div><strong>Contract: ${contractSoFar}${doubleText}</strong></div>
                        <div style="color: #e67e22; font-size: 12px; margin-top: 4px;">
                            Enter result to see raw score before HCP analysis
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
                        <div><strong>Deal ${this.currentDeal} - ${this.vulnerability}</strong></div>
                        <div><strong>Contract: ${contract} by ${this.currentContract.declarer}</strong></div>
                        <div style="color: #e67e22; font-size: 12px; margin-top: 4px;">
                            Raw score calculated, then HCP analysis popup appears
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
                        <div><strong>Deal ${this.currentDeal} - ${this.vulnerability}</strong></div>
                        <div><strong>Contract: ${fullContract} by ${this.currentContract.declarer}</strong></div>
                        <div style="color: #e67e22; font-size: 12px; margin-top: 4px;">
                            After number entry: raw score + HCP analysis popup
                        </div>
                    </div>
                    <div class="current-state">Enter number of ${modeText}</div>
                `;
                
            case 'hcp_analysis':
                const analysisContract = `${this.currentContract.level}${this.currentContract.suit}${this.currentContract.doubled}`;
                return `
                    <div class="title-score-row">
                        <div class="mode-title">${this.displayName}</div>
                        <div class="score-display">
                            NS: ${scores.NS}<br>
                            EW: ${scores.EW}
                        </div>
                    </div>
                    <div class="game-content">
                        <div><strong>Deal ${this.currentDeal} - ${this.vulnerability}</strong></div>
                        <div><strong>${analysisContract} by ${this.currentContract.declarer} = ${this.currentContract.result}</strong></div>
                        <div style="color: #ffffff; font-weight: bold; font-size: 14px; margin-top: 8px; background: rgba(52,152,219,0.3); padding: 6px; border-radius: 4px;">
                            Raw Score: ${this.currentContract.rawScore} points
                        </div>
                        <div style="color: #e67e22; font-size: 12px; margin-top: 4px;">
                            Complete HCP analysis in popup to calculate final Bonus Bridge score
                        </div>
                    </div>
                    <div class="current-state">Use the popup to enter HCP and distribution details</div>
                `;
                
            case 'scoring':
                const lastEntry = this.gameState.getLastDeal();
                if (lastEntry && lastEntry.bonusAnalysis) {
                    const contractDisplay = `${lastEntry.contract.level}${lastEntry.contract.suit}${lastEntry.contract.doubled}`;
                    const analysis = lastEntry.bonusAnalysis;
                    
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
                            ${contractDisplay} by ${lastEntry.contract.declarer} = ${lastEntry.contract.result}</div>
                            <div style="color: #e67e22; font-size: 12px; margin-top: 4px;">
                                HCP: ${analysis.totalHCP}/${analysis.expectedHCP} | 
                                Tricks: ${analysis.actualTricks}/${analysis.handExpectedTricks}
                            </div>
                            <div style="margin-top: 6px;">
                                <span style="color: #3498db; font-weight: bold;">
                                    NS: +${analysis.nsPoints} | EW: +${analysis.ewPoints}
                                </span>
                            </div>
                        </div>/**
 * Bonus Bridge Mode - HCP-Based Enhanced Scoring System (Enhanced)
 * MOBILE ENHANCED VERSION - Full touch support for all devices
 * Updated to work with new modular bridge system
 * 
 * An enhanced scoring system that rewards both declarers and defenders
 * based on hand strength and performance versus expectations.
 * Created by Mike Smith for fair, skill-based bridge scoring.
 */

class BonusBridgeMode extends BaseBridgeMode {
    constructor(bridgeApp) {
        super(bridgeApp);
        
        this.modeName = 'Bonus Bridge';
        this.displayName = '⭐ Bonus Bridge';
        
        // Bonus Bridge state
        this.currentContract = {
            level: null,
            suit: null,
            declarer: null,
            doubled: '',
            result: null,
            rawScore: null
        };
        
        this.inputState = 'level_selection';
        this.resultMode = null; // 'down', 'plus'
        
        // HCP Analysis state
        this.handAnalysis = {
            totalHCP: 20,
            singletons: 0,
            voids: 0,
            longSuits: 0
        };
        
        // Mobile detection
        this.isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        console.log('⭐ Bonus Bridge mode initialized with enhanced mobile support');
        
        // Initialize immediately
        this.initialize();
    }
    
    /**
     * Initialize Bonus Bridge mode
     */
    initialize() {
        console.log('🎯 Starting Bonus Bridge session');
        
        // Bonus Bridge uses auto-vulnerability like Chicago
        this.gameState.setMode('bonus');
        
        // Start with level selection
        this.inputState = 'level_selection';
        this.resetContract();
        this.resetHandAnalysis();
        
        this.updateDisplay();
    }
    
    /**
     * Handle user input - integration with new system
     */
    handleInput(value) {
        console.log(`🎮 Bonus Bridge input: ${value} in state: ${this.inputState}`);
        
        // Handle back navigation
        if (value === 'BACK') {
            if (this.handleBack()) {
                return; // Handled internally
            } else {
                // Let parent handle (return to mode selection)
                this.bridgeApp.showLicensedMode({ 
                    type: this.bridgeApp.licenseManager.getLicenseData()?.type || 'FULL' 
                });
                return;
            }
        }
        
        // Handle control buttons
        if (value === 'HELP') {
            this.showHelp();
            return;
        }
        
        if (value === 'QUIT') {
            this.showQuit();
            return;
        }
        
        // Handle other inputs
        this.handleAction(value);
    }
    
    /**
     * Vulnerability is auto-managed in Bonus Bridge - disable manual toggle
     */
    toggleVulnerability() {
        console.log('🚫 Manual vulnerability control not allowed in Bonus Bridge - uses auto cycle');
        // Show brief message to user
        const vulnText = document.getElementById('vulnText');
        if (vulnText) {
            const originalText = vulnText.textContent;
            vulnText.textContent = 'AUTO';
            vulnText.style.color = '#e67e22';
            setTimeout(() => {
                vulnText.textContent = originalText;
                vulnText.style.color = '';
            }, 1000);
        }
    }
    
    /**
     * Handle user actions with enhanced mobile support
     */
    handleAction(value) {
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
            case 'hcp_analysis':
                this.handleHCPAnalysis(value);
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
            console.log(`👤 Declarer selected: ${this.currentContract.declarer}`);
            
        } else if (value === 'X') {
            this.handleDoubling();
        } else if (['MADE', 'PLUS', 'DOWN'].includes(value)) {
            // Only advance to result if declarer is selected
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
        
        console.log(`💥 Double state: ${this.currentContract.doubled || 'None'}`);
    }
    
    /**
     * Handle result type selection (Made/Plus/Down)
     */
    handleResultTypeSelection(value) {
        if (value === 'MADE') {
            this.currentContract.result = '=';
            this.calculateRawScore();
            this.showHCPAnalysisPopup();
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
            
            this.calculateRawScore();
            this.showHCPAnalysisPopup();
        }
    }
    
    /**
     * Handle HCP Analysis input
     */
    handleHCPAnalysis(value) {
        // HCP analysis is handled by popup, this shouldn't be called
        console.log('🔍 HCP Analysis state - popup should be active');
    }
    
    /**
     * Show HCP Analysis Popup
     */
    showHCPAnalysisPopup() {
        const contract = `${this.currentContract.level}${this.currentContract.suit}${this.currentContract.doubled}`;
        
        console.log('🔍 Showing HCP Analysis popup for contract:', contract);
        
        const popupContent = this.buildHCPAnalysisContent(contract);
        
        // Set state to hcp_analysis
        this.inputState = 'hcp_analysis';
        
        // Show the modal using bridgeApp's modal system
        this.bridgeApp.showModal('⭐ Hand Analysis Required', popupContent);
        
        // Setup the popup after a brief delay to ensure DOM is ready
        setTimeout(() => {
            console.log('🔧 Setting up HCP Analysis popup handlers with ENHANCED mobile support');
            this.setupHCPAnalysisPopup();
        }, 200);
    }
    
    /**
     * Build HCP Analysis popup content
     */
    buildHCPAnalysisContent(contract) {
        const { totalHCP, singletons, voids, longSuits } = this.handAnalysis;
        
        return `
            <div style="padding: 10px; font-family: Arial, sans-serif;">
                <div style="text-align: center; margin-bottom: 15px; padding: 10px; background: rgba(52,152,219,0.2); border-radius: 8px;">
                    <strong style="font-size: 16px; color: white;">${contract} by ${this.currentContract.declarer} = ${this.currentContract.result}</strong><br>
                    <span style="color: white; font-size: 14px; font-weight: bold;">Raw Score: ${this.currentContract.rawScore} points</span>
                </div>
                
                <div style="background: rgba(255,193,7,0.2); padding: 12px; border-radius: 8px; margin-bottom: 15px; border-left: 4px solid #f39c12;">
                    <strong>Count the combined cards of declarer + dummy:</strong><br>
                    <span style="font-size: 14px;">Ace=4, King=3, Queen=2, Jack=1</span>
                </div>
                
                <!-- HCP Section -->
                <div class="hcp-section" style="background: white; padding: 15px; border-radius: 8px; margin-bottom: 15px; border: 2px solid #3498db;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <strong style="color: #2c3e50; font-size: 16px;">High Card Points:</strong>
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <button class="hcp-btn-minus" style="width: 44px; height: 44px; background: #e74c3c; color: white; border: none; border-radius: 6px; font-size: 20px; cursor: pointer; touch-action: manipulation;">-</button>
                            <span class="hcp-display" style="font-size: 24px; font-weight: bold; min-width: 40px; text-align: center; color: #2c3e50;">${totalHCP}</span>
                            <button class="hcp-btn-plus" style="width: 44px; height: 44px; background: #27ae60; color: white; border: none; border-radius: 6px; font-size: 20px; cursor: pointer; touch-action: manipulation;">+</button>
                        </div>
                    </div>
                </div>
                
                <!-- Singletons Section -->
                <div class="singleton-section" style="background: white; padding: 15px; border-radius: 8px; margin-bottom: 15px; border: 2px solid #95a5a6;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <strong style="color: #2c3e50; font-size: 16px;">Singletons:</strong><br>
                            <span style="font-size: 12px; color: #7f8c8d;">1-card suits</span>
                        </div>
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <button class="singleton-btn-minus" style="width: 44px; height: 44px; background: #e74c3c; color: white; border: none; border-radius: 6px; font-size: 20px; cursor: pointer; touch-action: manipulation;">-</button>
                            <span class="singleton-display" style="font-size: 24px; font-weight: bold; min-width: 40px; text-align: center; color: #2c3e50;">${singletons}</span>
                            <button class="singleton-btn-plus" style="width: 44px; height: 44px; background: #27ae60; color: white; border: none; border-radius: 6px; font-size: 20px; cursor: pointer; touch-action: manipulation;">+</button>
                        </div>
                    </div>
                </div>
                
                <!-- Voids Section -->
                <div class="void-section" style="background: white; padding: 15px; border-radius: 8px; margin-bottom: 15px; border: 2px solid #95a5a6;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <strong style="color: #2c3e50; font-size: 16px;">Voids:</strong><br>
                            <span style="font-size: 12px; color: #7f8c8d;">0-card suits</span>
                        </div>
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <button class="void-btn-minus" style="width: 44px; height: 44px; background: #e74c3c; color: white; border: none; border-radius: 6px; font-size: 20px; cursor: pointer; touch-action: manipulation;">-</button>
                            <span class="void-display" style="font-size: 24px; font-weight: bold; min-width: 40px; text-align: center; color: #2c3e50;">${voids}</span>
                            <button class="void-btn-plus" style="width: 44px; height: 44px; background: #27ae60; color: white; border: none; border-radius: 6px; font-size: 20px; cursor: pointer; touch-action: manipulation;">+</button>
                        </div>
                    </div>
                </div>
                
                <!-- Long Suits Section -->
                <div class="longsuit-section" style="background: white; padding: 15px; border-radius: 8px; margin-bottom: 20px; border: 2px solid #95a5a6;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <strong style="color: #2c3e50; font-size: 16px;">Long Suits:</strong><br>
                            <span style="font-size: 12px; color: #7f8c8d;">6+ card suits</span>
                        </div>
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <button class="longsuit-btn-minus" style="width: 44px; height: 44px; background: #e74c3c; color: white; border: none; border-radius: 6px; font-size: 20px; cursor: pointer; touch-action: manipulation;">-</button>
                            <span class="longsuit-display" style="font-size: 24px; font-weight: bold; min-width: 40px; text-align: center; color: #2c3e50;">${longSuits}</span>
                            <button class="longsuit-btn-plus" style="width: 44px; height: 44px; background: #27ae60; color: white; border: none; border-radius: 6px; font-size: 20px; cursor: pointer; touch-action: manipulation;">+</button>
                        </div>
                    </div>
                </div>
                
                <!-- Action Buttons -->
                <div style="display: flex; gap: 10px; justify-content: center;">
                    <button class="cancel-analysis-btn" style="flex: 1; height: 50px; background: #95a5a6; color: white; border: none; border-radius: 8px; font-size: 16px; font-weight: bold; cursor: pointer; touch-action: manipulation;">Cancel</button>
                    <button class="calculate-score-btn" style="flex: 2; height: 50px; background: #27ae60; color: white; border: none; border-radius: 8px; font-size: 16px; font-weight: bold; cursor: pointer; touch-action: manipulation;">Calculate Score</button>
                </div>
            </div>
        `;
    }
    
    /**
     * ENHANCED MOBILE FIX: Setup HCP Analysis popup event handlers with improved mobile touch support
     */
    setupHCPAnalysisPopup() {
        const modal = document.querySelector('.modal-overlay');
        if (!modal) {
            console.log('❌ Modal not found for HCP analysis setup');
            return;
        }
        
        console.log('📱 Setting up HCP Analysis popup with ENHANCED mobile support');
        
        // Enhanced helper function to setup mobile-compatible button
        const setupEnhancedMobileButton = (selector, handler) => {
            const button = modal.querySelector(selector);
            if (!button) {
                console.log(`❌ Button not found: ${selector}`);
                return;
            }
            
            console.log(`📱 Setting up enhanced mobile button: ${selector}`);
            
            // Ensure comprehensive mobile touch properties
            button.style.touchAction = 'manipulation';
            button.style.userSelect = 'none';
            button.style.webkitTapHighlightColor = 'transparent';
            button.style.webkitUserSelect = 'none';
            button.style.webkitTouchCallout = 'none';
            button.style.minHeight = '44px';
            button.style.minWidth = '44px';
            button.style.cursor = 'pointer';
            
            // Create enhanced mobile-compatible handler
            const enhancedMobileHandler = (e) => {
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                
                console.log(`📱 Enhanced mobile button pressed: ${selector}`);
                
                // Enhanced visual feedback
                button.style.transform = 'scale(0.9)';
                button.style.opacity = '0.7';
                button.style.transition = 'all 0.1s ease';
                
                setTimeout(() => {
                    button.style.transform = 'scale(1)';
                    button.style.opacity = '1';
                }, 150);
                
                // Enhanced haptic feedback
                if (navigator.vibrate) {
                    navigator.vibrate([30]);
                }
                
                // Execute the handler with error catching
                try {
                    handler();
                } catch (error) {
                    console.error(`Error executing button handler for ${selector}:`, error);
                }
            };
            
            // Remove ALL existing listeners by replacing the element
            const newButton = button.cloneNode(true);
            button.parentNode.replaceChild(newButton, button);
            
            // Add comprehensive event listeners
            if (this.isMobile) {
                // Mobile-specific events
                newButton.addEventListener('touchstart', (e) => {
                    e.preventDefault();
                    newButton.style.transform = 'scale(0.9)';
                    newButton.style.opacity = '0.7';
                }, { passive: false });
                
                newButton.addEventListener('touchend', enhancedMobileHandler, { passive: false });
                newButton.addEventListener('touchcancel', (e) => {
                    e.preventDefault();
                    newButton.style.transform = 'scale(1)';
                    newButton.style.opacity = '1';
                }, { passive: false });
            }
            
            // Universal click event (works on both desktop and mobile)
            newButton.addEventListener('click', enhancedMobileHandler, { passive: false });
            
            return newButton;
        };
        
        // Setup all HCP analysis buttons with enhanced mobile support
        setupEnhancedMobileButton('.hcp-btn-minus', () => {
            this.adjustHCP(-1);
            this.updatePopupDisplay();
        });
        
        setupEnhancedMobileButton('.hcp-btn-plus', () => {
            this.adjustHCP(1);
            this.updatePopupDisplay();
        });
        
        // Singleton buttons
        setupEnhancedMobileButton('.singleton-btn-minus', () => {
            this.adjustSingletons(-1);
            this.updatePopupDisplay();
        });
        
        setupEnhancedMobileButton('.singleton-btn-plus', () => {
            this.adjustSingletons(1);
            this.updatePopupDisplay();
        });
        
        // Void buttons
        setupEnhancedMobileButton('.void-btn-minus', () => {
            this.adjustVoids(-1);
            this.updatePopupDisplay();
        });
        
        setupEnhancedMobileButton('.void-btn-plus', () => {
            this.adjustVoids(1);
            this.updatePopupDisplay();
        });
        
        // Long suit buttons
        setupEnhancedMobileButton('.longsuit-btn-minus', () => {
            this.adjustLongSuits(-1);
            this.updatePopupDisplay();
        });
        
        setupEnhancedMobileButton('.longsuit-btn-plus', () => {
            this.adjustLongSuits(1);
            this.updatePopupDisplay();
        });
        
        // Action buttons
        setupEnhancedMobileButton('.cancel-analysis-btn', () => {
            this.closeModal();
            this.inputState = 'result_type_selection';
            this.updateDisplay();
        });
        
        setupEnhancedMobileButton('.calculate-score-btn', () => {
            this.closeModal();
            this.calculateBonusScore();
            this.inputState = 'scoring';
            this.updateDisplay();
        });
        
        console.log('✅ Enhanced HCP Analysis popup setup complete with comprehensive mobile support');
    }
    
    /**
     * Close modal using bridgeApp's modal system
     */
    closeModal() {
        // Find and close the modal
        const modal = document.querySelector('.modal-overlay');
        if (modal && modal.parentNode) {
            modal.parentNode.removeChild(modal);
        }
    }
    
    /**
     * Update popup display values
     */
    updatePopupDisplay() {
        const modal = document.querySelector('.modal-overlay');
        if (!modal) return;
        
        const { totalHCP, singletons, voids, longSuits } = this.handAnalysis;
        
        // Update displays
        const hcpDisplay = modal.querySelector('.hcp-display');
        if (hcpDisplay) hcpDisplay.textContent = totalHCP;
        
        const singletonDisplay = modal.querySelector('.singleton-display');
        if (singletonDisplay) singletonDisplay.textContent = singletons;
        
        const voidDisplay = modal.querySelector('.void-display');
        if (voidDisplay) voidDisplay.textContent = voids;
        
        const longsuitDisplay = modal.querySelector('.longsuit-display');
        if (longsuitDisplay) longsuitDisplay.textContent = longSuits;
    }
    
    /**
     * Adjust HCP values
     */
    adjustHCP(change) {
        this.handAnalysis.totalHCP = Math.max(0, Math.min(40, this.handAnalysis.totalHCP + change));
    }
    
    adjustSingletons(change) {
        this.handAnalysis.singletons = Math.max(0, Math.min(4, this.handAnalysis.singletons + change));
    }
    
    adjustVoids(change) {
        this.handAnalysis.voids = Math.max(0, Math.min(4, this.handAnalysis.voids + change));
    }
    
    adjustLongSuits(change) {
        this.handAnalysis.longSuits = Math.max(0, Math.min(4, this.handAnalysis.longSuits + change));
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
     * Calculate raw bridge score
     */
    calculateRawScore() {
        const { level, suit, result, doubled, declarer } = this.currentContract;
        
        console.log(`💰 Calculating Bonus Bridge raw score for ${level}${suit}${doubled} by ${declarer} = ${result}`);
        
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
                    const isVulnerable = this.isVulnerable(declarer);
                    overtrickValue = overtricks * (isVulnerable ? 200 : 100);
                    if (doubled === 'XX') overtrickValue *= 2;
                }
                score += overtrickValue;
            }
            
            // Game/Part-game bonus
            if (contractScore >= 100) {
                const isVulnerable = this.isVulnerable(declarer);
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
            const isVulnerable = this.isVulnerable(declarer);
            
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
        
        this.currentContract.rawScore = score;
        console.log(`📊 Raw score calculated: ${score}`);
    }
    
    /**
     * Calculate Bonus Bridge score using the complex algorithm
     */
    calculateBonusScore() {
        const analysisData = this.calculateFinalAnalysis();
        if (!analysisData) return;
        
        console.log('📊 Before adding Bonus Bridge scores - gameState.scores:', this.gameState.scores);
        console.log('📊 Analysis result:', analysisData);
        
        // Store scores before attempting to add
        const scoresBefore = { ...this.gameState.scores };
        
        // Apply Bonus Bridge scoring
        const nsPoints = analysisData.nsPoints;
        const ewPoints = analysisData.ewPoints;
        
        // Add points to teams
        if (nsPoints > 0) {
            this.gameState.addScore('NS', nsPoints);
            // Check if addScore worked, if not use direct update
            if (this.gameState.scores.NS === scoresBefore.NS) {
                console.log('🔧 addScore failed for NS, using direct update');
                this.gameState.scores.NS += nsPoints;
            }
        }
        if (ewPoints > 0) {
            this.gameState.addScore('EW', ewPoints);
            // Check if addScore worked, if not use direct update
            if (this.gameState.scores.EW === scoresBefore.EW) {
                console.log('🔧 addScore failed for EW, using direct update');
                this.gameState.scores.EW += ewPoints;
            }
        }
        
        console.log('📊 Final scores:', this.gameState.scores);
        
        // Record in history with vulnerability
        this.gameState.addDeal({
            deal: this.currentDeal,
            contract: { ...this.currentContract },
            score: this.currentContract.rawScore,
            actualScore: nsPoints + ewPoints, // Total points awarded
            scoringSide: nsPoints > ewPoints ? 'NS' : 'EW',
            mode: 'bonus',
            handAnalysis: { ...this.handAnalysis },
            bonusAnalysis: analysisData,
            vulnerability: this.vulnerability
        });
        
        // Increment deals for license tracking
        this.licenseManager.incrementDealsPlayed();
        
        console.log(`💾 Bonus Bridge score recorded: NS=${nsPoints}, EW=${ewPoints}`);
    }
    
    /**
     * Calculate final analysis (main Bonus Bridge logic)
     */
    calculateFinalAnalysis() {
        const { level, suit, result, declarer } = this.currentContract;
        const { totalHCP, singletons, voids, longSuits } = this.handAnalysis;
        
        // Expected HCP for contract type
        const expectedHCP = this.getExpecte