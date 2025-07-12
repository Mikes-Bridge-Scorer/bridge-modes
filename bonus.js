/**
 * Bonus Bridge Mode - HCP-Based Enhanced Scoring System
 * 
 * An enhanced scoring system that rewards both declarers and defenders
 * based on hand strength and performance versus expectations.
 * Created by Mike Smith for fair, skill-based bridge scoring.
 */

import { BaseBridgeMode } from './base-mode.js';

class BonusBridge extends BaseBridgeMode {
    constructor(gameState, ui) {
        super(gameState, ui);
        
        this.modeName = 'bonus';
        this.displayName = 'Bonus Bridge';
        
        // Bonus Bridge state
        this.currentContract = {
            level: null,
            suit: null,
            declarer: null,
            doubled: '',
            result: null
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
        
        console.log('⭐ Bonus Bridge mode initialized');
    }
    
    /**
     * Initialize Bonus Bridge mode
     */
    initialize() {
        console.log('🎯 Starting Bonus Bridge session');
        
        // Bonus Bridge uses simple vulnerability (always None unless manually set)
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
        console.log(`🎮 Bonus Bridge action: ${value} in state: ${this.inputState}`);
        
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
            this.calculateRawScore();
            // Show popup immediately
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
            // Show popup immediately after result is entered
            this.showHCPAnalysisPopup();
        }
    }
    
    /**
     * Handle HCP Analysis input
     */
    handleHCPAnalysis(value) {
        // Show HCP analysis popup
        this.showHCPAnalysisPopup();
    }
    
    /**
     * Show HCP Analysis Popup
     */
    showHCPAnalysisPopup() {
        const contract = `${this.currentContract.level}${this.currentContract.suit}${this.currentContract.doubled}`;
        
        console.log('🔍 Showing HCP Analysis popup for contract:', contract);
        
        const popupContent = {
            title: 'Hand Analysis Required',
            content: this.buildHCPAnalysisContent(contract),
            buttons: [] // No buttons - handled by popup
        };
        
        // Set state to hcp_analysis
        this.inputState = 'hcp_analysis';
        
        // Show the modal
        this.ui.showModal('hcp_analysis', popupContent);
        
        // Setup the popup after a brief delay to ensure DOM is ready
        setTimeout(() => {
            console.log('🔧 Setting up HCP Analysis popup handlers');
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
                            <button class="hcp-btn-minus" style="width: 40px; height: 40px; background: #e74c3c; color: white; border: none; border-radius: 6px; font-size: 20px; cursor: pointer;">-</button>
                            <span class="hcp-display" style="font-size: 24px; font-weight: bold; min-width: 40px; text-align: center; color: #2c3e50;">${totalHCP}</span>
                            <button class="hcp-btn-plus" style="width: 40px; height: 40px; background: #27ae60; color: white; border: none; border-radius: 6px; font-size: 20px; cursor: pointer;">+</button>
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
                            <button class="singleton-btn-minus" style="width: 40px; height: 40px; background: #e74c3c; color: white; border: none; border-radius: 6px; font-size: 20px; cursor: pointer;">-</button>
                            <span class="singleton-display" style="font-size: 24px; font-weight: bold; min-width: 40px; text-align: center; color: #2c3e50;">${singletons}</span>
                            <button class="singleton-btn-plus" style="width: 40px; height: 40px; background: #27ae60; color: white; border: none; border-radius: 6px; font-size: 20px; cursor: pointer;">+</button>
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
                            <button class="void-btn-minus" style="width: 40px; height: 40px; background: #e74c3c; color: white; border: none; border-radius: 6px; font-size: 20px; cursor: pointer;">-</button>
                            <span class="void-display" style="font-size: 24px; font-weight: bold; min-width: 40px; text-align: center; color: #2c3e50;">${voids}</span>
                            <button class="void-btn-plus" style="width: 40px; height: 40px; background: #27ae60; color: white; border: none; border-radius: 6px; font-size: 20px; cursor: pointer;">+</button>
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
                            <button class="longsuit-btn-minus" style="width: 40px; height: 40px; background: #e74c3c; color: white; border: none; border-radius: 6px; font-size: 20px; cursor: pointer;">-</button>
                            <span class="longsuit-display" style="font-size: 24px; font-weight: bold; min-width: 40px; text-align: center; color: #2c3e50;">${longSuits}</span>
                            <button class="longsuit-btn-plus" style="width: 40px; height: 40px; background: #27ae60; color: white; border: none; border-radius: 6px; font-size: 20px; cursor: pointer;">+</button>
                        </div>
                    </div>
                </div>
                
                <!-- Action Buttons -->
                <div style="display: flex; gap: 10px; justify-content: center;">
                    <button class="cancel-analysis-btn" style="flex: 1; height: 50px; background: #95a5a6; color: white; border: none; border-radius: 8px; font-size: 16px; font-weight: bold; cursor: pointer;">Cancel</button>
                    <button class="calculate-score-btn" style="flex: 2; height: 50px; background: #27ae60; color: white; border: none; border-radius: 8px; font-size: 16px; font-weight: bold; cursor: pointer;">Calculate Score</button>
                </div>
            </div>
        `;
    }
    
    /**
     * Setup HCP Analysis popup event handlers
     */
    setupHCPAnalysisPopup() {
        const modal = document.querySelector('.modal-overlay');
        if (!modal) return;
        
        // HCP buttons
        modal.querySelector('.hcp-btn-minus')?.addEventListener('click', () => {
            this.adjustHCP(-1);
            this.updatePopupDisplay();
        });
        modal.querySelector('.hcp-btn-plus')?.addEventListener('click', () => {
            this.adjustHCP(1);
            this.updatePopupDisplay();
        });
        
        // Singleton buttons
        modal.querySelector('.singleton-btn-minus')?.addEventListener('click', () => {
            this.adjustSingletons(-1);
            this.updatePopupDisplay();
        });
        modal.querySelector('.singleton-btn-plus')?.addEventListener('click', () => {
            this.adjustSingletons(1);
            this.updatePopupDisplay();
        });
        
        // Void buttons
        modal.querySelector('.void-btn-minus')?.addEventListener('click', () => {
            this.adjustVoids(-1);
            this.updatePopupDisplay();
        });
        modal.querySelector('.void-btn-plus')?.addEventListener('click', () => {
            this.adjustVoids(1);
            this.updatePopupDisplay();
        });
        
        // Long suit buttons
        modal.querySelector('.longsuit-btn-minus')?.addEventListener('click', () => {
            this.adjustLongSuits(-1);
            this.updatePopupDisplay();
        });
        modal.querySelector('.longsuit-btn-plus')?.addEventListener('click', () => {
            this.adjustLongSuits(1);
            this.updatePopupDisplay();
        });
        
        // Action buttons
        modal.querySelector('.cancel-analysis-btn')?.addEventListener('click', () => {
            this.ui.closeModal();
            this.inputState = 'result_type_selection';
            this.updateDisplay();
        });
        
        modal.querySelector('.calculate-score-btn')?.addEventListener('click', () => {
            this.ui.closeModal();
            this.calculateBonusScore();
            this.inputState = 'scoring';
            this.updateDisplay();
        });
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
        const { level, suit, result, doubled } = this.currentContract;
        const vulnerability = this.gameState.getVulnerability();
        
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
        
        this.currentContract.rawScore = score;
        console.log(`🎯 Raw score calculated: ${score}`);
    }
    
    /**
     * Calculate Bonus Bridge score
     */
    calculateBonusScore() {
        const analysisData = this.calculateFinalAnalysis();
        if (!analysisData) return;
        
        // Apply Bonus Bridge scoring
        const nsPoints = analysisData.nsPoints;
        const ewPoints = analysisData.ewPoints;
        
        // Add points to teams
        if (nsPoints > 0) {
            this.gameState.addScore('NS', nsPoints);
        }
        if (ewPoints > 0) {
            this.gameState.addScore('EW', ewPoints);
        }
        
        // Record in history
        this.gameState.addToHistory({
            deal: this.gameState.getDealNumber(),
            contract: { ...this.currentContract },
            score: this.currentContract.rawScore,
            actualScore: nsPoints + ewPoints, // Total points awarded
            scoringSide: nsPoints > ewPoints ? 'NS' : 'EW',
            mode: 'bonus',
            handAnalysis: { ...this.handAnalysis },
            bonusAnalysis: analysisData
        });
        
        console.log(`💾 Bonus Bridge score recorded: NS=${nsPoints}, EW=${ewPoints}`);
    }
    
    /**
     * Calculate final analysis (main Bonus Bridge logic)
     */
    calculateFinalAnalysis() {
        const { level, suit, result, declarer } = this.currentContract;
        const { totalHCP, singletons, voids, longSuits } = this.handAnalysis;
        
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
        this.resetContract();
        this.resetHandAnalysis();
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
            result: null,
            rawScore: null
        };
        this.resultMode = null;
        this.ui.updateDoubleButton('');
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
            case 'hcp_analysis':
                this.inputState = 'result_type_selection';
                this.currentContract.result = null;
                this.currentContract.rawScore = null;
                break;
            case 'scoring':
                // Undo the last score and go back to HCP analysis
                this.undoLastScore();
                this.inputState = 'hcp_analysis';
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
            // Remove points from both sides
            if (lastEntry.bonusAnalysis) {
                this.gameState.addScore('NS', -lastEntry.bonusAnalysis.nsPoints);
                this.gameState.addScore('EW', -lastEntry.bonusAnalysis.ewPoints);
            }
            this.gameState.removeLastHistoryEntry();
            console.log(`↩️ Undid Bonus Bridge score`);
        }
    }
    
    /**
     * Check if back navigation is possible
     */
    canGoBack() {
        return this.inputState !== 'level_selection';
    }
    
    /**
     * Toggle vulnerability (Bonus Bridge allows manual control)
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
                        <div style="color: #e67e22; font-size: 12px; margin-top: 4px;">
                            HCP-based enhanced scoring • Raw scores will be shown
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
                        <div><strong>Level: ${this.currentContract.level}</strong></div>
                        <div style="color: #e67e22; font-size: 12px; margin-top: 4px;">
                            Raw score will be calculated after result entry
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
                        <div><strong>Contract: ${contract} by ${this.currentContract.declarer}</strong></div>
                        <div style="color: #e67e22; font-size: 12px; margin-top: 4px;">
                            Raw score will be calculated, then HCP analysis popup will appear
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
                        <div><strong>Contract: ${fullContract} by ${this.currentContract.declarer}</strong></div>
                        <div style="color: #e67e22; font-size: 12px; margin-top: 4px;">
                            After number entry: raw score + HCP analysis popup
                        </div>
                    </div>
                    <div class="current-state">Enter number of ${modeText}</div>
                `;
                
            case 'hcp_analysis':
                // This state now shows a popup, so show the contract and raw score
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
                const lastEntry = this.gameState.getLastHistoryEntry();
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
                                HCP: ${analysis.totalHCP} | Expected: ${analysis.expectedHCP} | 
                                Tricks: ${analysis.actualTricks}/${analysis.handExpectedTricks}
                            </div>
                            <div style="margin-top: 6px;">
                                <span style="color: #3498db; font-weight: bold;">
                                    NS: +${analysis.nsPoints} | EW: +${analysis.ewPoints}
                                </span>
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
     * Get help content specific to Bonus Bridge
     */
    getHelpContent() {
        return {
            title: 'Bonus Bridge Help',
            content: `
                <div class="help-section">
                    <h4>What is Bonus Bridge?</h4>
                    <p><strong>Bonus Bridge</strong> is an enhanced scoring system created by Mike Smith that rewards both declarers and defenders based on hand strength and performance versus expectations. It balances luck and skill by considering HCP distribution and playing performance.</p>
                </div>
                
                <div class="help-section">
                    <h4>The Core Innovation</h4>
                    <div style="background: rgba(39,174,96,0.2); padding: 10px; border-radius: 5px; border-left: 3px solid #27ae60;">
                        <strong>Unlike Kitchen Bridge, Bonus Bridge rewards skill over luck</strong>
                        <ul style="margin: 5px 0;">
                            <li>Strong hands get fewer points for making contracts</li>
                            <li>Weak hands get bonus points for good results</li>
                            <li>Defenders get rewarded even when contracts make</li>
                            <li>HCP analysis ensures fair scoring</li>
                        </ul>
                    </div>
                </div>
                
                <div class="help-section">
                    <h4>Key Features</h4>
                    <ul>
                        <li><strong>HCP Balance:</strong> Evaluates point distribution between teams</li>
                        <li><strong>Performance Analysis:</strong> Compares expected vs. actual tricks</li>
                        <li><strong>Contract Ambition:</strong> Rewards appropriate bidding choices</li>
                        <li><strong>Distribution Points:</strong> Accounts for shapely hands</li>
                        <li><strong>Defender Rewards:</strong> Points for limiting overperformance</li>
                    </ul>
                </div>
                
                <div class="help-section">
                    <h4>HCP Analysis (Critical Step)</h4>
                    <p style="background: rgba(255,193,7,0.2); padding: 10px; border-radius: 5px; border-left: 3px solid #ffc107;">
                        <strong>After each deal, you must enter the actual HCP and distribution:</strong>
                    </p>
                    <ul>
                        <li><strong>Combined HCP:</strong> Declarer + Dummy high card points (A=4, K=3, Q=2, J=1)</li>
                        <li><strong>Singletons:</strong> Number of singleton suits in declarer+dummy</li>
                        <li><strong>Voids:</strong> Number of void suits in declarer+dummy</li>
                        <li><strong>Long Suits:</strong> Number of 6+ card suits in declarer+dummy</li>
                    </ul>
                </div>
                
                <div class="help-section">
                    <h4>Expected HCP by Contract</h4>
                    <table style="width: 100%; border-collapse: collapse; margin: 10px 0;">
                        <tr style="background: rgba(255,255,255,0.1);">
                            <th style="padding: 8px; text-align: left; border: 1px solid rgba(255,255,255,0.2);">Contract</th>
                            <th style="padding: 8px; text-align: left; border: 1px solid rgba(255,255,255,0.2);">Expected HCP</th>
                            <th style="padding: 8px; text-align: left; border: 1px solid rgba(255,255,255,0.2);">Adjustment</th>
                        </tr>
                        <tr>
                            <td style="padding: 8px; border: 1px solid rgba(255,255,255,0.2);">1-2 level</td>
                            <td style="padding: 8px; border: 1px solid rgba(255,255,255,0.2);">21 HCP</td>
                            <td style="padding: 8px; border: 1px solid rgba(255,255,255,0.2);">Part game standard</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px; border: 1px solid rgba(255,255,255,0.2);">3NT</td>
                            <td style="padding: 8px; border: 1px solid rgba(255,255,255,0.2);">25 HCP</td>
                            <td style="padding: 8px; border: 1px solid rgba(255,255,255,0.2);">Game requirement</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px; border: 1px solid rgba(255,255,255,0.2);">4♥/♠</td>
                            <td style="padding: 8px; border: 1px solid rgba(255,255,255,0.2);">24 HCP</td>
                            <td style="padding: 8px; border: 1px solid rgba(255,255,255,0.2);">Major suit game</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px; border: 1px solid rgba(255,255,255,0.2);">5♣/♦</td>
                            <td style="padding: 8px; border: 1px solid rgba(255,255,255,0.2);">27 HCP</td>
                            <td style="padding: 8px; border: 1px solid rgba(255,255,255,0.2);">Minor suit game</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px; border: 1px solid rgba(255,255,255,0.2);">6 level</td>
                            <td style="padding: 8px; border: 1px solid rgba(255,255,255,0.2);">30 HCP</td>
                            <td style="padding: 8px; border: 1px solid rgba(255,255,255,0.2);">Small slam</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px; border: 1px solid rgba(255,255,255,0.2);">7 level</td>
                            <td style="padding: 8px; border: 1px solid rgba(255,255,255,0.2);">32 HCP</td>
                            <td style="padding: 8px; border: 1px solid rgba(255,255,255,0.2);">Grand slam</td>
                        </tr>
                    </table>
                </div>
                
                <div class="help-section">
                    <h4>Scoring Examples</h4>
                    <div style="background: rgba(52,152,219,0.2); padding: 10px; border-radius: 5px; margin: 10px 0;">
                        <strong>Strong Hand (28 HCP):</strong> 4♥ making exactly<br>
                        Expected: 24 HCP → Penalty for strong hand → NS: 17 pts, EW: 9 pts
                    </div>
                    
                    <div style="background: rgba(46,204,113,0.2); padding: 10px; border-radius: 5px; margin: 10px 0;">
                        <strong>Weak Hand (16 HCP):</strong> 2♦ making +2<br>
                        Expected: 21 HCP → Bonus for weak hand → EW: 15 pts, NS: 0 pts
                    </div>
                    
                    <div style="background: rgba(231,76,60,0.2); padding: 10px; border-radius: 5px; margin: 10px 0;">
                        <strong>Failed Contract:</strong> 4♠ down 2 with balanced hands<br>
                        Good defense rewarded → Defenders: 25 pts, Declarer: 0 pts
                    </div>
                </div>
                
                <div class="help-section">
                    <h4>How to Use</h4>
                    <ol>
                        <li><strong>Enter Contract:</strong> Level → Suit → Declarer → Result (same as other modes)</li>
                        <li><strong>HCP Analysis:</strong> Use buttons 1-8 to adjust HCP and distribution</li>
                        <li><strong>Calculate:</strong> Press Deal to apply Bonus Bridge scoring</li>
                        <li><strong>Review:</strong> See how HCP balance affected the final score</li>
                        <li><strong>Next Deal:</strong> Continue with fair, skill-based scoring</li>
                    </ol>
                </div>
                
                <div class="help-section">
                    <h4>HCP Analysis Controls</h4>
                    <ul>
                        <li><strong>Buttons 1/2:</strong> Decrease/Increase HCP by 1</li>
                        <li><strong>Buttons 3/4:</strong> Decrease/Increase Singletons by 1</li>
                        <li><strong>Buttons 5/6:</strong> Decrease/Increase Voids by 1</li>
                        <li><strong>Buttons 7/8:</strong> Decrease/Increase Long Suits by 1</li>
                        <li><strong>Deal Button:</strong> Calculate and record final score</li>
                    </ul>
                </div>
                
                <div class="help-section">
                    <h4>Why Choose Bonus Bridge?</h4>
                    <div style="background: rgba(39,174,96,0.2); padding: 10px; border-radius: 5px; border-left: 3px solid #27ae60;">
                        <strong>Bonus Bridge is perfect for:</strong>
                        <ul style="margin: 5px 0;">
                            <li>Players who want skill to matter more than luck</li>
                            <li>Teaching the value of hand evaluation</li>
                            <li>Rewarding good defense even when contracts make</li>
                            <li>Creating more balanced, competitive games</li>
                            <li>Bridge players seeking innovation and fairness</li>
                        </ul>
                    </div>
                </div>
                
                <div class="help-section">
                    <h4>Tips for Success</h4>
                    <ul>
                        <li><strong>Honest Analysis:</strong> Accurate HCP entry is crucial for fair scoring</li>
                        <li><strong>Strategic Bidding:</strong> Avoid underbidding with strong hands</li>
                        <li><strong>Defensive Focus:</strong> Great defense is always rewarded</li>
                        <li><strong>Hand Evaluation:</strong> Learn to count distribution points</li>
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
        console.log('🧹 Bonus Bridge cleanup completed');
    }
}

export default BonusBridge;