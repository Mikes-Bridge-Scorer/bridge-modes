// SECTION ONE - Header and Constructor
/**
 * Chicago Bridge Mode - 4-Deal Vulnerability Cycle Bridge (Enhanced)
 * MOBILE ENHANCED VERSION - Full touch support for all devices
 * Updated to work with new modular bridge system with PROVEN MOBILE TEMPLATE
 * 
 * Chicago Bridge combines standard bridge scoring with a structured 4-deal 
 * vulnerability cycle: None → NS → EW → Both → repeat. This provides 
 * predictable, fair vulnerability rotation with natural break points.
 * 
 * Enhanced with comprehensive dealer rotation and vulnerability display.
 */

class ChicagoBridgeMode extends BaseBridgeMode {
    constructor(bridgeApp) {
        super(bridgeApp);
        
        this.modeName = 'Chicago Bridge';
        this.displayName = '🌉 Chicago Bridge';
        
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
        
        // Mobile detection
        this.isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        console.log('🌉 Chicago Bridge mode initialized with proven mobile template');
        
        // Initialize immediately
        this.initialize();
    }
// END SECTION ONE

// SECTION TWO - Core Methods
    /**
     * Initialize Chicago Bridge mode with proper vulnerability and dealer rotation
     */
    initialize() {
        console.log('🎯 Starting Chicago Bridge session');
        
        // Initialize game state if not already done
        if (!this.gameState) {
            this.gameState = this.bridgeApp.gameState || {
                scores: { NS: 0, EW: 0 },
                history: [],
                currentDeal: 1
            };
        }
        
        // Initialize current deal if not set
        if (!this.currentDeal) {
            this.currentDeal = this.gameState.currentDeal || 1;
        }
        
        // Initialize dealer rotation (North=0, East=1, South=2, West=3)
        if (this.currentDealer === undefined) {
            this.currentDealer = (this.currentDeal - 1) % 4; // Starts with North (0) for deal 1
        }
        
        // Auto-vulnerability follows Chicago cycle based on deal number
        this.updateVulnerabilityAndDealer();
        
        // Start with level selection
        this.inputState = 'level_selection';
        this.resetContract();
        
        this.updateDisplay();
        
        console.log(`🎯 Deal ${this.currentDeal} initialized - Dealer: ${this.getDealerName()}, Vulnerability: ${this.vulnerability}`);
    }
    
    /**
     * Update vulnerability and dealer based on current deal (Chicago Bridge cycle)
     */
    updateVulnerabilityAndDealer() {
        // Dealer rotates: North(0), East(1), South(2), West(3)
        this.currentDealer = (this.currentDeal - 1) % 4;
        
        // Vulnerability follows Chicago cycle:
        // Deal 1: None Vulnerable (NV)
        // Deal 2: North-South Vulnerable (NS) 
        // Deal 3: East-West Vulnerable (EW)
        // Deal 4: Both Vulnerable (Both)
        const vulnCycle = ['NV', 'NS', 'EW', 'Both'];
        this.vulnerability = vulnCycle[(this.currentDeal - 1) % 4];
        
        console.log(`🔄 Updated - Deal ${this.currentDeal}: Dealer ${this.getDealerName()}, Vulnerability ${this.vulnerability}`);
    }
    
    /**
     * Get dealer name from dealer number
     */
    getDealerName() {
        const dealers = ['North', 'East', 'South', 'West'];
        return dealers[this.currentDealer] || 'North';
    }
    
    /**
     * Get dealer abbreviation
     */
    getDealerAbbreviation() {
        const dealers = ['N', 'E', 'S', 'W'];
        return dealers[this.currentDealer] || 'N';
    }
    
    /**
     * Check if a side is vulnerable
     */
    isVulnerable(declarer) {
        if (this.vulnerability === 'NV') return false;
        if (this.vulnerability === 'Both') return true;
        
        const isNS = declarer === 'N' || declarer === 'S';
        
        if (this.vulnerability === 'NS') return isNS;
        if (this.vulnerability === 'EW') return !isNS;
        
        return false;
    }
    
    /**
     * Check if declarer is vulnerable - used by scoring
     */
    isDeclarerVulnerable() {
        return this.isVulnerable(this.currentContract.declarer);
    }
    
    /**
     * Handle user input - integration with new system
     */
    handleInput(value) {
        console.log(`🎮 Chicago Bridge input: ${value} in state: ${this.inputState}`);
        
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
     * Vulnerability is auto-managed in Chicago Bridge - disable manual toggle
     */
    toggleVulnerability() {
        console.log('🚫 Manual vulnerability control not allowed in Chicago Bridge - uses auto cycle');
        
        // Show brief message to user about auto-vulnerability
        const vulnText = document.getElementById('vulnText');
        if (vulnText) {
            const originalText = vulnText.textContent;
            vulnText.textContent = 'AUTO';
            vulnText.style.color = '#3498db';
            vulnText.style.fontWeight = 'bold';
            
            setTimeout(() => {
                vulnText.textContent = originalText;
                vulnText.style.color = '';
                vulnText.style.fontWeight = '';
            }, 1500);
        }
        
        // Show informational message
        this.bridgeApp.showMessage('Chicago Bridge uses automatic vulnerability cycle (4-deal rotation)', 'info');
    }
// END SECTION TWO

// SECTION THREE - Action Handlers
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
// END SECTION THREE

// SECTION FOUR - Contract Logic
    /**
     * Calculate score using standard Chicago Bridge rules - FIXED NT SCORING
     */
    calculateScore() {
        const { level, suit, result, doubled, declarer } = this.currentContract;
        
        console.log(`💰 Calculating Chicago Bridge score for ${level}${suit}${doubled} by ${declarer} = ${result}`);
        
        // Basic suit values per trick
        const suitValues = { '♣': 20, '♦': 20, '♥': 30, '♠': 30 };
        let score = 0;
        
        if (result === '=' || result?.startsWith('+')) {
            // Contract made
            let basicScore;
            
            // FIXED: Correct NT scoring calculation
            if (suit === 'NT') {
                // NT: 40 points for first trick, 30 points for each additional trick
                basicScore = 40 + (level - 1) * 30;
            } else {
                // Other suits: multiply level by suit value
                basicScore = level * suitValues[suit];
            }
            
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
                    if (suit === 'NT') {
                        overtrickValue = overtricks * 30; // NT overtricks are 30 each
                    } else {
                        overtrickValue = suitValues[suit] * overtricks;
                    }
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
                
                // Slam bonuses
                if (level === 6) {
                    // Small slam bonus
                    score += isVulnerable ? 750 : 500;
                } else if (level === 7) {
                    // Grand slam bonus
                    score += isVulnerable ? 1500 : 1000;
                }
            } else {
                // Part-game
                score += 50;
            }
            
            // Double bonuses (insult bonus)
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
     * Calculate and record the score - Chicago Bridge version
     */
    calculateAndRecordScore() {
        const score = this.calculateScore();
        const declarerSide = ['N', 'S'].includes(this.currentContract.declarer) ? 'NS' : 'EW';
        
        console.log('📊 Before adding Chicago score - gameState.scores:', this.gameState.scores);
        console.log('📊 Score calculated:', score);
        console.log('📊 Declarer side:', declarerSide);
        
        // Store scores before attempting to add
        const scoresBefore = { ...this.gameState.scores };
        
        if (score >= 0) {
            // Made contract - points go to declarer side
            this.gameState.addScore(declarerSide, score);
            
            // Check if addScore worked, if not use direct update
            if (this.gameState.scores[declarerSide] === scoresBefore[declarerSide]) {
                console.log('🔧 addScore failed for declarer, using direct update');
                this.gameState.scores[declarerSide] += score;
            }
            console.log(`✅ Added ${score} to ${declarerSide}`);
        } else {
            // Failed contract - penalty points go to defending side
            const defendingSide = declarerSide === 'NS' ? 'EW' : 'NS';
            const penaltyPoints = Math.abs(score);
            this.gameState.addScore(defendingSide, penaltyPoints);
            
            // Check if addScore worked, if not use direct update
            if (this.gameState.scores[defendingSide] === scoresBefore[defendingSide]) {
                console.log('🔧 addScore failed for defenders, using direct update');
                this.gameState.scores[defendingSide] += penaltyPoints;
            }
            console.log(`✅ Added ${penaltyPoints} penalty to ${defendingSide}`);
        }
        
        console.log('📊 Final scores:', this.gameState.scores);
        
        // Record in history with original score for reference
        this.gameState.addDeal({
            deal: this.currentDeal,
            contract: { ...this.currentContract },
            score: score, // Keep original for display purposes
            actualScore: score >= 0 ? score : Math.abs(score), // Actual points awarded
            scoringSide: score >= 0 ? declarerSide : (declarerSide === 'NS' ? 'EW' : 'NS'),
            mode: 'chicago',
            vulnerability: this.vulnerability,
            dealer: this.getDealerAbbreviation(),
            cycleInfo: this.getCycleInfo()
        });
        
        // Increment deals for license tracking
        this.bridgeApp.licenseManager.incrementDealsPlayed();
        
        console.log(`💾 Chicago Bridge score recorded: ${score >= 0 ? score + ' for ' + declarerSide : Math.abs(score) + ' penalty for ' + (declarerSide === 'NS' ? 'EW' : 'NS')}`);
    }
    
    /**
     * Get cycle position information
     */
    getCycleInfo() {
        const cycleNumber = Math.floor((this.currentDeal - 1) / 4) + 1;
        const cyclePosition = ((this.currentDeal - 1) % 4) + 1;
        
        return {
            cycleNumber: cycleNumber,
            cyclePosition: cyclePosition,
            totalDeals: this.currentDeal,
            isEndOfCycle: cyclePosition === 4
        };
    }
    
    /**
     * Get next cycle info for display
     */
    getNextCycleInfo() {
        const nextDeal = this.currentDeal + 1;
        const nextDealer = ['North', 'East', 'South', 'West'][(nextDeal - 1) % 4];
        const nextCyclePos = ((nextDeal - 1) % 4) + 1;
        const nextCycleNum = Math.floor((nextDeal - 1) / 4) + 1;
        const vulnerabilityCycle = ['None', 'NS', 'EW', 'Both'];
        const nextVuln = vulnerabilityCycle[(nextDeal - 1) % 4];
        const vulnDisplay = { 'None': 'None', 'NS': 'NS', 'EW': 'EW', 'Both': 'All' };
        
        return `Deal ${nextDeal} • Dealer: ${nextDealer} • Vuln: ${vulnDisplay[nextVuln]} • Cycle ${nextCycleNum} (${nextCyclePos}/4)`;
    }
// END SECTION FOUR
// SECTION FIVE - Game Management
    /**
     * Move to next deal with automatic Chicago vulnerability cycling
     */
    nextDeal() {
        console.log('🃏 Moving to next deal in Chicago cycle');
        
        this.currentDeal++;
        
        // CRITICAL: Update vulnerability and dealer for new deal
        this.updateVulnerabilityAndDealer();
        
        this.resetContract();
        this.inputState = 'level_selection';
        this.updateDisplay();
        
        // Check if we completed a 4-deal cycle
        const cycleInfo = this.getCycleInfo();
        if (cycleInfo.isEndOfCycle) {
            console.log(`🔄 Completed 4-deal Chicago cycle ${cycleInfo.cycleNumber}!`);
        }
        
        console.log(`🎯 Advanced to Deal ${this.currentDeal} - Dealer: ${this.getDealerName()}, Vulnerability: ${this.vulnerability}`);
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
        const lastEntry = this.gameState.getLastDeal();
        if (lastEntry && lastEntry.deal === this.currentDeal) {
            // Use the scoring side from the history entry
            const scoringSide = lastEntry.scoringSide || (['N', 'S'].includes(lastEntry.contract.declarer) ? 'NS' : 'EW');
            const pointsToRemove = lastEntry.actualScore || Math.abs(lastEntry.score);
            
            // Remove points from the scoring side
            this.gameState.scores[scoringSide] -= pointsToRemove;
            
            // Remove from history
            this.gameState.history.pop();
            
            console.log(`↩️ Undid Chicago Bridge score: ${pointsToRemove} from ${scoringSide}`);
        }
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
     * Update the display using new system
     */
    updateDisplay() {
        const display = document.getElementById('display');
        if (display) {
            display.innerHTML = this.getDisplayContent();
        }
        
        // Update vulnerability display in the UI control
        this.updateVulnerabilityDisplay();
        
        // Update button states
        const activeButtons = this.getActiveButtons();
        activeButtons.push('BACK'); // Always allow going back
        
        this.bridgeApp.updateButtonStates(activeButtons);
    }
    
    /**
     * Update the vulnerability display in the UI control
     */
    updateVulnerabilityDisplay() {
        const vulnText = document.getElementById('vulnText');
        if (vulnText) {
            vulnText.textContent = this.vulnerability;
        }
    }
    
    /**
     * Check if back navigation is possible
     */
    canGoBack() {
        return this.inputState !== 'level_selection';
    }
// END SECTION FIVE

// SECTION SIX - Mobile Template System (COMPLETE WITH QUIT FIX)
    /**
     * Mobile-optimized modal using proven template from test-help.html
     */
    showMobileOptimizedModal(title, content, buttons = null) {
        // Prevent body scroll when modal opens
        document.body.classList.add('modal-open');
        
        // Create modal overlay using proven template
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.7);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
            padding: 10px;
        `;
        
        const defaultButtons = [{ text: 'Close', action: () => this.closeMobileModal() }];
        const modalButtons = buttons || defaultButtons;
        
        let buttonsHTML = '';
        modalButtons.forEach(btn => {
            buttonsHTML += `
                <button class="modal-btn" data-action="${btn.text}" style="
                    padding: 10px 20px;
                    border: none;
                    border-radius: 6px;
                    font-size: 14px;
                    font-weight: 600;
                    cursor: pointer;
                    background: #3498db;
                    color: white;
                    touch-action: manipulation;
                    user-select: none;
                    -webkit-tap-highlight-color: transparent;
                    margin: 0 5px;
                ">${btn.text}</button>
            `;
        });
        
        modal.innerHTML = `
            <div class="modal-content" style="
                background: white;
                border-radius: 12px;
                width: 100%;
                max-width: 450px;
                max-height: 85vh;
                display: flex;
                flex-direction: column;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
                overflow: hidden;
                position: relative;
            ">
                <div class="modal-header" style="
                    padding: 20px;
                    background: #3498db;
                    color: white;
                    text-align: center;
                    flex-shrink: 0;
                ">
                    <h2 style="font-size: 18px; margin: 0;">${title}</h2>
                </div>
                
                <div class="modal-body" style="
                    flex: 1;
                    overflow-y: auto;
                    overflow-x: hidden;
                    -webkit-overflow-scrolling: touch;
                    background: white;
                    position: relative;
                    min-height: 0;
                ">
                    <style>
                        .modal-body::-webkit-scrollbar {
                            width: 12px;
                            background: rgba(0, 0, 0, 0.1);
                        }
                        .modal-body::-webkit-scrollbar-thumb {
                            background: rgba(52, 152, 219, 0.6);
                            border-radius: 6px;
                            border: 2px solid rgba(255, 255, 255, 0.1);
                        }
                        .modal-body::-webkit-scrollbar-track {
                            background: rgba(0, 0, 0, 0.05);
                        }
                        .content-section {
                            padding: 20px;
                            border-bottom: 1px solid #eee;
                        }
                        .content-section:last-child {
                            border-bottom: none;
                            padding-bottom: 30px;
                        }
                        .feature-grid {
                            display: grid;
                            grid-template-columns: 1fr 1fr;
                            gap: 12px;
                            margin: 15px 0;
                        }
                        .feature-item {
                            background: #f8f9fa;
                            padding: 12px;
                            border-radius: 8px;
                            border-left: 4px solid #3498db;
                        }
                        .feature-item h4 {
                            color: #2c3e50;
                            font-size: 14px;
                            margin-bottom: 6px;
                        }
                        .feature-item p {
                            font-size: 12px;
                            color: #666;
                            margin: 0;
                        }
                    </style>
                    ${content}
                </div>
                
                <div class="modal-footer" style="
                    padding: 15px 20px;
                    background: #f8f9fa;
                    border-top: 1px solid #ddd;
                    flex-shrink: 0;
                    display: flex;
                    gap: 10px;
                    justify-content: center;
                ">
                    ${buttonsHTML}
                </div>
            </div>
        `;
        
        // Enhanced event handling
        const handleAction = (actionText) => {
            document.body.classList.remove('modal-open');
            
            const buttonConfig = modalButtons.find(b => b.text === actionText);
            if (buttonConfig && buttonConfig.action) {
                buttonConfig.action();
            }
            modal.remove();
        };
        
        // Button event listeners with mobile optimization
        setTimeout(() => {
            const modalBtns = modal.querySelectorAll('.modal-btn');
            
            modalBtns.forEach((btn) => {
                ['click', 'touchend'].forEach(eventType => {
                    btn.addEventListener(eventType, (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleAction(btn.dataset.action);
                    }, { passive: false });
                });
                
                // Visual feedback
                btn.addEventListener('touchstart', (e) => {
                    btn.style.background = 'rgba(52, 152, 219, 0.8)';
                    btn.style.transform = 'scale(0.95)';
                }, { passive: true });
                
                btn.addEventListener('touchend', (e) => {
                    btn.style.background = '#3498db';
                    btn.style.transform = 'scale(1)';
                }, { passive: true });
            });
        }, 50);
        
        document.body.appendChild(modal);
    }
    
    /**
     * Mobile-optimized modal with custom button layout for quit page
     */
    showMobileOptimizedModalWithCustomButtons(title, content, buttons = null) {
        // Prevent body scroll when modal opens
        document.body.classList.add('modal-open');
        
        // Create modal overlay using proven template
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.7);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
            padding: 10px;
        `;
        
        const defaultButtons = [{ text: 'Close', action: () => this.closeMobileModal() }];
        const modalButtons = buttons || defaultButtons;
        
        // Create two-row button layout for mobile
        let buttonsHTML = '';
        if (modalButtons.length === 4) {
            // Two rows of two buttons each
            buttonsHTML = `
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; width: 100%;">
                    <button class="modal-btn" data-action="${modalButtons[0].text}" style="
                        padding: 12px 8px;
                        border: none;
                        border-radius: 6px;
                        font-size: 13px;
                        font-weight: 600;
                        cursor: pointer;
                        background: #27ae60;
                        color: white;
                        touch-action: manipulation;
                        user-select: none;
                        -webkit-tap-highlight-color: transparent;
                    ">${modalButtons[0].text}</button>
                    <button class="modal-btn" data-action="${modalButtons[1].text}" style="
                        padding: 12px 8px;
                        border: none;
                        border-radius: 6px;
                        font-size: 13px;
                        font-weight: 600;
                        cursor: pointer;
                        background: #3498db;
                        color: white;
                        touch-action: manipulation;
                        user-select: none;
                        -webkit-tap-highlight-color: transparent;
                    ">${modalButtons[1].text}</button>
                    <button class="modal-btn" data-action="${modalButtons[2].text}" style="
                        padding: 12px 8px;
                        border: none;
                        border-radius: 6px;
                        font-size: 13px;
                        font-weight: 600;
                        cursor: pointer;
                        background: #f39c12;
                        color: white;
                        touch-action: manipulation;
                        user-select: none;
                        -webkit-tap-highlight-color: transparent;
                    ">${modalButtons[2].text}</button>
                    <button class="modal-btn" data-action="${modalButtons[3].text}" style="
                        padding: 12px 8px;
                        border: none;
                        border-radius: 6px;
                        font-size: 13px;
                        font-weight: 600;
                        cursor: pointer;
                        background: #95a5a6;
                        color: white;
                        touch-action: manipulation;
                        user-select: none;
                        -webkit-tap-highlight-color: transparent;
                    ">${modalButtons[3].text}</button>
                </div>
            `;
        } else {
            // Fallback to single row for other button counts
            modalButtons.forEach(btn => {
                buttonsHTML += `
                    <button class="modal-btn" data-action="${btn.text}" style="
                        padding: 10px 15px;
                        border: none;
                        border-radius: 6px;
                        font-size: 13px;
                        font-weight: 600;
                        cursor: pointer;
                        background: #3498db;
                        color: white;
                        touch-action: manipulation;
                        user-select: none;
                        -webkit-tap-highlight-color: transparent;
                        margin: 0 3px;
                        flex: 1;
                        max-width: 120px;
                    ">${btn.text}</button>
                `;
            });
        }
        
        modal.innerHTML = `
            <div class="modal-content" style="
                background: white;
                border-radius: 12px;
                width: 100%;
                max-width: 450px;
                max-height: 85vh;
                display: flex;
                flex-direction: column;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
                overflow: hidden;
                position: relative;
            ">
                <div class="modal-header" style="
                    padding: 20px;
                    background: #3498db;
                    color: white;
                    text-align: center;
                    flex-shrink: 0;
                ">
                    <h2 style="font-size: 18px; margin: 0;">${title}</h2>
                </div>
                
                <div class="modal-body" style="
                    flex: 1;
                    overflow-y: auto;
                    overflow-x: hidden;
                    -webkit-overflow-scrolling: touch;
                    background: white;
                    position: relative;
                    min-height: 0;
                ">
                    <style>
                        .modal-body::-webkit-scrollbar {
                            width: 12px;
                            background: rgba(0, 0, 0, 0.1);
                        }
                        .modal-body::-webkit-scrollbar-thumb {
                            background: rgba(52, 152, 219, 0.6);
                            border-radius: 6px;
                            border: 2px solid rgba(255, 255, 255, 0.1);
                        }
                        .modal-body::-webkit-scrollbar-track {
                            background: rgba(0, 0, 0, 0.05);
                        }
                        .content-section {
                            padding: 20px;
                            border-bottom: 1px solid #eee;
                        }
                        .content-section:last-child {
                            border-bottom: none;
                            padding-bottom: 30px;
                        }
                    </style>
                    ${content}
                </div>
                
                <div class="modal-footer" style="
                    padding: 15px 20px;
                    background: #f8f9fa;
                    border-top: 1px solid #ddd;
                    flex-shrink: 0;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                ">
                    ${buttonsHTML}
                </div>
            </div>
        `;
        
        // Enhanced event handling
        const handleAction = (actionText) => {
            document.body.classList.remove('modal-open');
            
            const buttonConfig = modalButtons.find(b => b.text === actionText);
            if (buttonConfig && buttonConfig.action) {
                buttonConfig.action();
            }
            modal.remove();
        };
        
        // Button event listeners with mobile optimization
        setTimeout(() => {
            const modalBtns = modal.querySelectorAll('.modal-btn');
            
            modalBtns.forEach((btn) => {
                ['click', 'touchend'].forEach(eventType => {
                    btn.addEventListener(eventType, (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleAction(btn.dataset.action);
                    }, { passive: false });
                });
                
                // Visual feedback
                btn.addEventListener('touchstart', (e) => {
                    const originalBg = btn.style.background;
                    btn.style.background = 'rgba(52, 152, 219, 0.8)';
                    btn.style.transform = 'scale(0.95)';
                    
                    setTimeout(() => {
                        btn.style.background = originalBg;
                        btn.style.transform = 'scale(1)';
                    }, 150);
                }, { passive: true });
            });
        }, 50);
        
        document.body.appendChild(modal);
    }
    
    /**
     * Close mobile modal
     */
    closeMobileModal() {
        const modal = document.querySelector('.modal-overlay');
        if (modal) {
            modal.remove();
            document.body.classList.remove('modal-open');
        }
    }

    /**
     * Show Chicago Bridge specific help - PROVEN MOBILE TEMPLATE
     */
    showHelp() {
        const helpContent = this.getChicagoHelpContent();
        this.showMobileOptimizedModal(helpContent.title, helpContent.content, helpContent.buttons);
    }

    /**
     * Get Chicago Bridge help content - NO TABS, JUST SCROLLING
     */
    getChicagoHelpContent() {
        return {
            title: '🌉 Chicago Bridge Help',
            content: `
                <div class="content-section">
                    <h3 style="margin: 0 0 12px 0; color: #1976d2; font-size: 18px;">What is Chicago Bridge?</h3>
                    <p style="margin: 0 0 16px 0; font-size: 14px; line-height: 1.4; color: #333;">
                        Standard bridge scoring with automatic 4-deal vulnerability cycles. 
                        Dealer rotates clockwise and vulnerability follows a predictable pattern.
                    </p>
                    
                    <h4 style="margin: 0 0 8px 0; color: #1976d2; font-size: 16px;">Key Features</h4>
                    <ul style="margin: 0 0 16px 0; padding-left: 20px; font-size: 13px; line-height: 1.4;">
                        <li><strong>Automatic vulnerability rotation</strong></li>
                        <li><strong>Dealer advances each deal</strong></li>
                        <li><strong>Natural 4-deal break points</strong></li>
                        <li><strong>Standard bridge scoring</strong></li>
                    </ul>
                    
                    <div style="background: #f0f8ff; padding: 12px; border-radius: 8px; border-left: 4px solid #2196f3;">
                        <h4 style="margin: 0 0 8px 0; color: #1976d2; font-size: 14px;">Perfect For</h4>
                        <p style="margin: 0; font-size: 13px; color: #1976d2;">
                            Social bridge clubs • Teaching vulnerability strategy • Timed sessions • Fair competition
                        </p>
                    </div>
                </div>
                
                <div class="content-section">
                    <h3 style="margin: 0 0 16px 0; color: #1976d2; font-size: 18px;">4-Deal Vulnerability Cycle</h3>
                    
                    <div style="
                        display: grid; grid-template-columns: 1fr 1fr; gap: 8px; 
                        margin: 16px 0; background: #f5f5f5; padding: 12px; border-radius: 8px;
                    ">
                        <div style="text-align: center; padding: 10px; background: white; border-radius: 6px; border-left: 3px solid #666;">
                            <div style="font-weight: bold; font-size: 14px;">Deal 1</div>
                            <div style="font-size: 12px; color: #666;">North deals</div>
                            <div style="font-size: 12px; color: #666;">None vulnerable</div>
                        </div>
                        <div style="text-align: center; padding: 10px; background: white; border-radius: 6px; border-left: 3px solid #28a745;">
                            <div style="font-weight: bold; color: #28a745; font-size: 14px;">Deal 2</div>
                            <div style="font-size: 12px; color: #666;">East deals</div>
                            <div style="font-size: 12px; color: #28a745;">NS vulnerable</div>
                        </div>
                        <div style="text-align: center; padding: 10px; background: white; border-radius: 6px; border-left: 3px solid #dc3545;">
                            <div style="font-weight: bold; color: #dc3545; font-size: 14px;">Deal 3</div>
                            <div style="font-size: 12px; color: #666;">South deals</div>
                            <div style="font-size: 12px; color: #dc3545;">EW vulnerable</div>
                        </div>
                        <div style="text-align: center; padding: 10px; background: white; border-radius: 6px; border-left: 3px solid #fd7e14;">
                            <div style="font-weight: bold; color: #fd7e14; font-size: 14px;">Deal 4</div>
                            <div style="font-size: 12px; color: #666;">West deals</div>
                            <div style="font-size: 12px; color: #fd7e14;">Both vulnerable</div>
                        </div>
                    </div>
                    
                    <div style="background: #e8f5e8; padding: 12px; border-radius: 8px; border-left: 4px solid #28a745;">
                        <h4 style="margin: 0 0 8px 0; color: #155724; font-size: 14px;">Automatic Benefits</h4>
                        <ul style="margin: 0; padding-left: 18px; font-size: 13px; color: #155724; line-height: 1.3;">
                            <li>Everyone deals once per cycle</li>
                            <li>Equal vulnerability exposure</li>
                            <li>Natural break points every 4 deals</li>
                            <li>Predictable structure for planning</li>
                        </ul>
                    </div>
                </div>
                
                <div class="content-section">
                    <h3 style="margin: 0 0 16px 0; color: #1976d2; font-size: 18px;">Vulnerability Strategy</h3>
                    
                    <div class="feature-grid">
                        <div class="feature-item" style="border-left-color: #28a745;">
                            <h4>✅ Not Vulnerable</h4>
                            <p>Bid aggressively • Light game bids OK • Preempt freely • Take calculated risks</p>
                        </div>
                        
                        <div class="feature-item" style="border-left-color: #f44336;">
                            <h4>⚠️ Vulnerable</h4>
                            <p>Bid conservatively • Need solid values • Careful with preempts • Focus on making</p>
                        </div>
                    </div>
                    
                    <div style="background: #f0f8ff; padding: 14px; border-radius: 8px; border-left: 4px solid #2196f3; margin-top: 16px;">
                        <h4 style="margin: 0 0 10px 0; color: #1976d2; font-size: 14px;">Key Scoring Differences</h4>
                        <div style="font-size: 12px; color: #1976d2; line-height: 1.4;">
                            <strong>Game Bonus:</strong> Not Vul +300 | Vul +500<br>
                            <strong>Down 1:</strong> Not Vul -50 | Vul -100<br>
                            <strong>Down 1 Doubled:</strong> Not Vul -100 | Vul -200<br>
                            <strong>Slam Bonus:</strong> Small +500/750 | Grand +1000/1500
                        </div>
                    </div>
                </div>
                
                <div class="content-section">
                    <h3 style="margin: 0 0 12px 0; color: #1976d2; font-size: 18px;">How to Use</h3>
                    <ol style="margin: 0 0 16px 0; padding-left: 20px; font-size: 13px; line-height: 1.4;">
                        <li>Enter contract: Level → Suit → Declarer → Result</li>
                        <li>Vulnerability automatically cycles every 4 deals</li>
                        <li>Dealer rotates clockwise each deal</li>
                        <li>Press Deal to advance to next hand</li>
                        <li>Natural break points after every 4 deals</li>
                    </ol>
                    
                    <div style="
                        text-align: center; 
                        font-size: 12px; 
                        color: #666; 
                        background: rgba(52,152,219,0.05);
                        padding: 12px;
                        border-radius: 6px;
                        margin-top: 16px;
                    ">
                        🌉 Chicago Bridge: Perfect for social bridge with structured cycles
                    </div>
                </div>
            `,
            buttons: [
                { text: 'Close', action: () => this.closeMobileModal() }
            ]
        };
    }

    /**
     * Show Chicago Bridge specific quit options - FIXED MOBILE LAYOUT
     */
    showQuit() {
        const scores = this.gameState.scores;
        const totalDeals = this.gameState.history.length;
        const licenseStatus = this.bridgeApp.licenseManager.checkLicenseStatus();
        const cycleInfo = this.getCycleInfo();
        
        let currentScoreContent = '';
        if (totalDeals > 0) {
            const leader = scores.NS > scores.EW ? 'North-South' : 
                          scores.EW > scores.NS ? 'East-West' : 'Tied';
            
            currentScoreContent = `
                <div class="content-section">
                    <h4 style="margin: 0 0 12px 0; color: #1976d2;">📊 Current Game Status</h4>
                    <p><strong>Deals Played:</strong> ${totalDeals}</p>
                    <p><strong>Current Cycle:</strong> ${cycleInfo.cycleNumber} (Position ${cycleInfo.cyclePosition}/4)</p>
                    <p><strong>Current Scores:</strong></p>
                    <ul>
                        <li>North-South: ${scores.NS} points</li>
                        <li>East-West: ${scores.EW} points</li>
                    </ul>
                    <p><strong>Current Leader:</strong> ${leader}</p>
                    ${cycleInfo.isEndOfCycle ? '<p style="color: #f39c12;"><strong>🔄 Cycle Complete!</strong> Natural break point.</p>' : ''}
                </div>
            `;
        }
        
        let licenseSection = '';
        if (licenseStatus.status === 'trial') {
            licenseSection = `
                <div class="content-section">
                    <h4 style="margin: 0 0 8px 0; color: #1976d2;">📅 License Status</h4>
                    <p><strong>Trial Version:</strong> ${licenseStatus.daysLeft} days, ${licenseStatus.dealsLeft} deals remaining</p>
                </div>
            `;
        }
        
        const content = `
            ${currentScoreContent}
            ${licenseSection}
            <div class="content-section">
                <h4 style="margin: 0 0 8px 0; color: #1976d2;">🎮 Game Options</h4>
                <p>What would you like to do?</p>
            </div>
        `;
        
        const buttons = [
            { text: 'Continue Playing', action: () => this.closeMobileModal() },
            { text: 'Show Scores', action: () => this.showDetailedScores() },
            { text: 'New Game', action: () => this.startNewGame() },
            { text: 'Return to Main Menu', action: () => this.returnToMainMenu() }
        ];
        
        this.showMobileOptimizedModalWithCustomButtons('🌉 Chicago Bridge Options', content, buttons);
    }

    /**
     * Show detailed scores using the proven mobile template
     */
    showDetailedScores() {
        const scores = this.gameState.scores;
        const history = this.gameState.history;
        
        if (history.length === 0) {
            this.showMobileOptimizedModal('📊 Game Scores', '<div class="content-section"><p>No deals have been played yet.</p></div>');
            return;
        }

        let dealSummary = `
            <div class="content-section">
                <h4 style="margin: 0 0 12px 0; color: #1976d2;">📊 Current Totals</h4>
                <div style="text-align: center; background: rgba(52,152,219,0.1); padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                    <div style="font-size: 18px; font-weight: bold; color: #2c3e50;">
                        <span style="color: #27ae60;">North-South: ${scores.NS}</span> • 
                        <span style="color: #e74c3c;">East-West: ${scores.EW}</span>
                    </div>
                    <div style="margin-top: 8px; font-size: 14px; color: #666;">
                        Leader: <strong>${scores.NS > scores.EW ? 'North-South' : scores.EW > scores.NS ? 'East-West' : 'Tied'}</strong>
                    </div>
                </div>
            </div>
            
            <div class="content-section">
                <h4 style="margin: 0 0 12px 0; color: #1976d2;">🌉 Deal by Deal History</h4>
        `;
        
        // Group deals by cycles for better display
        const cycleGroups = {};
        history.forEach((deal, index) => {
            const cycleNum = Math.floor((deal.deal - 1) / 4) + 1;
            if (!cycleGroups[cycleNum]) {
                cycleGroups[cycleNum] = [];
            }
            cycleGroups[cycleNum].push({ ...deal, index });
        });
        
        // Display deals grouped by cycles
        Object.keys(cycleGroups).forEach(cycleNum => {
            const cycleDeals = cycleGroups[cycleNum];
            const isCompleteCycle = cycleDeals.length === 4;
            
            dealSummary += `
                <div style="
                    background: rgba(52, 152, 219, 0.1);
                    margin: 12px 0;
                    padding: 12px;
                    border-radius: 8px;
                    border-left: 4px solid #3498db;
                ">
                    <div style="font-weight: bold; color: #2c3e50; margin-bottom: 8px; font-size: 14px;">
                        🔄 Cycle ${cycleNum} ${isCompleteCycle ? '(Complete)' : `(${cycleDeals.length}/4)`}
                    </div>
            `;
            
            cycleDeals.forEach((deal) => {
                const contract = deal.contract;
                const contractStr = `${contract.level}${contract.suit}${contract.doubled ? ' ' + contract.doubled : ''}`;
                const vulnerability = deal.vulnerability || 'NV';
                const dealer = deal.dealer || 'N';
                const scoreDisplay = deal.score >= 0 ? `+${deal.score}` : `${deal.score}`;
                const scoringSide = deal.scoringSide || (deal.score >= 0 ? 
                    (['N', 'S'].includes(contract.declarer) ? 'NS' : 'EW') :
                    (['N', 'S'].includes(contract.declarer) ? 'EW' : 'NS'));
                
                // Vulnerability color coding
                const vulnColor = vulnerability === 'NV' ? '#95a5a6' : 
                                 vulnerability === 'NS' ? '#27ae60' : 
                                 vulnerability === 'EW' ? '#e74c3c' : '#f39c12';
                
                dealSummary += `
                    <div style="
                        border: 1px solid #ddd; 
                        padding: 12px; 
                        margin: 8px 0;
                        border-radius: 6px;
                        background: white;
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                    ">
                        <div style="flex: 1;">
                            <div style="font-weight: bold; margin-bottom: 4px; color: #222; font-size: 13px;">
                                Deal ${deal.deal} - Dealer ${dealer} - <span style="color: ${vulnColor};">${vulnerability}</span>
                            </div>
                            <div style="font-size: 12px; color: #333; font-weight: 500;">
                                ${contractStr} by ${contract.declarer} = ${contract.result}
                            </div>
                        </div>
                        <div style="
                            text-align: right;
                            min-width: 80px;
                            font-weight: bold;
                        ">
                            <div style="color: ${deal.score >= 0 ? '#27ae60' : '#e74c3c'}; font-size: 14px;">
                                ${scoreDisplay}
                            </div>
                            <div style="font-size: 11px; color: #666;">
                                ${scoringSide}
                            </div>
                        </div>
                    </div>
                `;
            });
            
            dealSummary += `</div>`;
        });
        
        dealSummary += `
            </div>
            
            <div class="content-section">
                <div style="
                    text-align: center; 
                    font-size: 12px; 
                    color: #666; 
                    background: rgba(52,152,219,0.05);
                    padding: 12px;
                    border-radius: 6px;
                ">
                    🌉 Chicago Bridge: 4-deal cycles with automatic vulnerability rotation
                </div>
            </div>
        `;
        
        this.showMobileOptimizedModal('📊 Chicago Bridge - Detailed Analysis', dealSummary, [
            { text: 'Back to Options', action: () => this.showQuit() },
            { text: 'Continue Playing', action: () => this.closeMobileModal() }
        ]);
    }
// END SECTION SIX
// SECTION SEVEN - Game Management Methods
    /**
     * Start a new game (reset scores and cycles)
     */
    startNewGame() {
        const confirmed = confirm(
            'Start a new Chicago Bridge game?\n\nThis will reset all scores to zero and start a new 4-deal cycle.\n\nClick OK to start new game, Cancel to continue current game.'
        );
        
        if (confirmed) {
            // Reset all scores and history
            this.gameState.scores = { NS: 0, EW: 0 };
            this.gameState.history = [];
            this.currentDeal = 1;
            
            // Reset vulnerability and dealer for deal 1
            this.updateVulnerabilityAndDealer();
            
            // Reset to level selection
            this.resetContract();
            this.inputState = 'level_selection';
            this.updateDisplay();
            
            console.log('🆕 New Chicago Bridge game started - Cycle 1 begins');
            this.closeMobileModal();
        }
    }
    
    /**
     * Return to main menu
     */
    returnToMainMenu() {
        this.closeMobileModal();
        this.bridgeApp.showLicensedMode({ 
            type: this.bridgeApp.licenseManager.getLicenseData()?.type || 'FULL' 
        });
    }
    
    /**
     * Get current deal information string
     */
    getDealInfo() {
        const dealerName = this.getDealerName();
        return `Deal ${this.currentDeal} - Dealer ${dealerName} - ${this.vulnerability}`;
    }
    
    /**
     * Get current cycle summary for status displays
     */
    getCycleSummary() {
        const cycleInfo = this.getCycleInfo();
        return `Cycle ${cycleInfo.cycleNumber} (${cycleInfo.cyclePosition}/4)`;
    }
    
    /**
     * Check if current deal is at a natural break point (end of cycle)
     */
    isAtCycleBreak() {
        const cycleInfo = this.getCycleInfo();
        return cycleInfo.isEndOfCycle;
    }
    
    /**
     * Get deals remaining in current cycle
     */
    getDealsRemainingInCycle() {
        const cycleInfo = this.getCycleInfo();
        return 4 - cycleInfo.cyclePosition;
    }
    
    /**
     * Get game statistics for analysis
     */
    getGameStatistics() {
        const history = this.gameState.history;
        const totalDeals = history.length;
        
        let contractsMade = 0;
        let contractsFailed = 0;
        let gamesPlayed = 0;
        let slamsBid = 0;
        let doublesPlayed = 0;
        let highestScore = 0;
        
        history.forEach(deal => {
            const contract = deal.contract;
            const result = contract.result;
            
            // Count made vs failed contracts
            if (result === '=' || result?.startsWith('+')) {
                contractsMade++;
            } else if (result?.startsWith('-')) {
                contractsFailed++;
            }
            
            // Count games (3NT, 4♥/♠, 5♣/♦)
            if ((contract.level === 3 && contract.suit === 'NT') ||
                (contract.level === 4 && ['♥', '♠'].includes(contract.suit)) ||
                (contract.level === 5 && ['♣', '♦'].includes(contract.suit))) {
                gamesPlayed++;
            }
            
            // Count slams
            if (contract.level >= 6) {
                slamsBid++;
            }
            
            // Count doubles
            if (contract.doubled) {
                doublesPlayed++;
            }
            
            // Track highest single score
            const absScore = Math.abs(deal.score);
            if (absScore > highestScore) {
                highestScore = absScore;
            }
        });
        
        const cyclesCompleted = Math.floor(totalDeals / 4);
        
        return {
            totalDeals,
            cyclesCompleted,
            contractsMade,
            contractsFailed,
            gamesPlayed,
            slamsBid,
            doublesPlayed,
            highestScore,
            makePercentage: totalDeals > 0 ? Math.round((contractsMade / totalDeals) * 100) : 0
        };
    }
    
    /**
     * Get cycle-aware game summary for external display
     */
    getGameSummary() {
        const scores = this.gameState.scores;
        const history = this.gameState.history;
        const cycleInfo = this.getCycleInfo();
        const stats = this.getGameStatistics();
        
        return {
            mode: 'Chicago Bridge',
            currentStatus: {
                deal: this.currentDeal,
                dealer: this.getDealerName(),
                vulnerability: this.vulnerability,
                cycle: cycleInfo,
                scores: { ...scores }
            },
            statistics: stats,
            cycleBreaks: this.getCycleBreakPoints(),
            gameComplete: false, // Chicago Bridge can continue indefinitely
            recommendations: this.getGameRecommendations()
        };
    }
    
    /**
     * Get natural break points in the game
     */
    getCycleBreakPoints() {
        const history = this.gameState.history;
        const breakPoints = [];
        
        for (let i = 4; i <= history.length; i += 4) {
            const cycleNum = i / 4;
            const cycleDeals = history.slice(i - 4, i);
            const cycleScores = { NS: 0, EW: 0 };
            
            cycleDeals.forEach(deal => {
                const side = deal.scoringSide;
                const points = deal.actualScore || Math.abs(deal.score);
                if (side && points) {
                    cycleScores[side] += points;
                }
            });
            
            breakPoints.push({
                cycle: cycleNum,
                dealsCompleted: i,
                cycleScores: cycleScores,
                cumulativeScores: {
                    NS: history.slice(0, i).reduce((sum, deal) => {
                        return sum + (deal.scoringSide === 'NS' ? (deal.actualScore || Math.abs(deal.score)) : 0);
                    }, 0),
                    EW: history.slice(0, i).reduce((sum, deal) => {
                        return sum + (deal.scoringSide === 'EW' ? (deal.actualScore || Math.abs(deal.score)) : 0);
                    }, 0)
                }
            });
        }
        
        return breakPoints;
    }
    
    /**
     * Get game recommendations based on current state
     */
    getGameRecommendations() {
        const cycleInfo = this.getCycleInfo();
        const scores = this.gameState.scores;
        const recommendations = [];
        
        if (cycleInfo.isEndOfCycle) {
            recommendations.push({
                type: 'break',
                message: 'Natural break point - cycle complete!',
                action: 'Consider taking a break or reviewing scores'
            });
        }
        
        const scoreDiff = Math.abs(scores.NS - scores.EW);
        if (scoreDiff > 1000) {
            recommendations.push({
                type: 'score',
                message: 'Large score difference detected',
                action: 'Consider starting a new game for closer competition'
            });
        }
        
        if (cycleInfo.cycleNumber >= 3) {
            recommendations.push({
                type: 'session',
                message: 'Long session detected',
                action: 'Good stopping point after this cycle'
            });
        }
        
        return recommendations;
    }
    
    /**
     * Reset to a specific cycle for teaching/practice
     */
    resetToCycle(cycleNumber) {
        if (cycleNumber < 1) {
            console.warn('Invalid cycle number');
            return false;
        }
        
        const startDeal = ((cycleNumber - 1) * 4) + 1;
        
        // Reset game state
        this.currentDeal = startDeal;
        this.updateVulnerabilityAndDealer();
        this.resetContract();
        this.inputState = 'level_selection';
        
        // Clear any deals from this cycle onward
        this.gameState.history = this.gameState.history.filter(deal => deal.deal < startDeal);
        
        // Recalculate scores
        this.gameState.scores = { NS: 0, EW: 0 };
        this.gameState.history.forEach(deal => {
            const side = deal.scoringSide;
            const points = deal.actualScore || Math.abs(deal.score);
            if (side && points) {
                this.gameState.scores[side] += points;
            }
        });
        
        this.updateDisplay();
        
        console.log(`🔄 Reset to Cycle ${cycleNumber}, Deal ${startDeal}`);
        return true;
    }
    
    /**
     * Quick setup for teaching scenarios
     */
    setupTeachingScenario(scenario) {
        const scenarios = {
            'vulnerability-demo': {
                description: 'Demonstrate all vulnerability conditions',
                startDeal: 1,
                setupMessage: 'Starting vulnerability demonstration cycle'
            },
            'game-contracts': {
                description: 'Practice game contracts in different vulnerabilities', 
                startDeal: 1,
                setupMessage: 'Ready for game contract practice'
            },
            'penalty-doubles': {
                description: 'Learn penalty scoring across vulnerabilities',
                startDeal: 1,
                setupMessage: 'Set up for penalty double practice'
            }
        };
        
        const config = scenarios[scenario];
        if (!config) {
            console.warn('Unknown teaching scenario:', scenario);
            return false;
        }
        
        this.resetToCycle(Math.floor((config.startDeal - 1) / 4) + 1);
        
        console.log(`📚 Teaching scenario: ${config.description}`);
        this.bridgeApp.showMessage(config.setupMessage, 'info');
        
        return true;
    }
    
    /**
     * Cleanup when switching modes
     */
    cleanup() {
        console.log('🧹 Chicago Bridge cleanup completed');
        // Chicago Bridge doesn't have special UI elements to clean up like some other modes
    }
// END SECTION SEVEN
// SECTION EIGHT - Game Management Methods
    /**
     * Start a new game (reset scores and cycles)
     */
    startNewGame() {
        const confirmed = confirm(
            'Start a new Chicago Bridge game?\n\nThis will reset all scores to zero and start a new 4-deal cycle.\n\nClick OK to start new game, Cancel to continue current game.'
        );
        
        if (confirmed) {
            // Reset all scores and history
            this.gameState.scores = { NS: 0, EW: 0 };
            this.gameState.history = [];
            this.currentDeal = 1;
            
            // Reset vulnerability and dealer for deal 1
            this.updateVulnerabilityAndDealer();
            
            // Reset to level selection
            this.resetContract();
            this.inputState = 'level_selection';
            this.updateDisplay();
            
            console.log('🆕 New Chicago Bridge game started - Cycle 1 begins');
            this.closeMobileModal();
        }
    }
    
    /**
     * Return to main menu
     */
    returnToMainMenu() {
        this.closeMobileModal();
        this.bridgeApp.showLicensedMode({ 
            type: this.bridgeApp.licenseManager.getLicenseData()?.type || 'FULL' 
        });
    }
    
    /**
     * Get current deal information string
     */
    getDealInfo() {
        const dealerName = this.getDealerName();
        return `Deal ${this.currentDeal} - Dealer ${dealerName} - ${this.vulnerability}`;
    }
    
    /**
     * Get current cycle summary for status displays
     */
    getCycleSummary() {
        const cycleInfo = this.getCycleInfo();
        return `Cycle ${cycleInfo.cycleNumber} (${cycleInfo.cyclePosition}/4)`;
    }
    
    /**
     * Check if current deal is at a natural break point (end of cycle)
     */
    isAtCycleBreak() {
        const cycleInfo = this.getCycleInfo();
        return cycleInfo.isEndOfCycle;
    }
    
    /**
     * Get deals remaining in current cycle
     */
    getDealsRemainingInCycle() {
        const cycleInfo = this.getCycleInfo();
        return 4 - cycleInfo.cyclePosition;
    }
    
    /**
     * Get game statistics for analysis
     */
    getGameStatistics() {
        const history = this.gameState.history;
        const totalDeals = history.length;
        
        let contractsMade = 0;
        let contractsFailed = 0;
        let gamesPlayed = 0;
        let slamsBid = 0;
        let doublesPlayed = 0;
        let highestScore = 0;
        
        history.forEach(deal => {
            const contract = deal.contract;
            const result = contract.result;
            
            // Count made vs failed contracts
            if (result === '=' || result?.startsWith('+')) {
                contractsMade++;
            } else if (result?.startsWith('-')) {
                contractsFailed++;
            }
            
            // Count games (3NT, 4♥/♠, 5♣/♦)
            if ((contract.level === 3 && contract.suit === 'NT') ||
                (contract.level === 4 && ['♥', '♠'].includes(contract.suit)) ||
                (contract.level === 5 && ['♣', '♦'].includes(contract.suit))) {
                gamesPlayed++;
            }
            
            // Count slams
            if (contract.level >= 6) {
                slamsBid++;
            }
            
            // Count doubles
            if (contract.doubled) {
                doublesPlayed++;
            }
            
            // Track highest single score
            const absScore = Math.abs(deal.score);
            if (absScore > highestScore) {
                highestScore = absScore;
            }
        });
        
        const cyclesCompleted = Math.floor(totalDeals / 4);
        
        return {
            totalDeals,
            cyclesCompleted,
            contractsMade,
            contractsFailed,
            gamesPlayed,
            slamsBid,
            doublesPlayed,
            highestScore,
            makePercentage: totalDeals > 0 ? Math.round((contractsMade / totalDeals) * 100) : 0
        };
    }
// END SECTION EIGHT

// SECTION NINE - Display Content Methods
    /**
     * Get display content for current state - CHICAGO BRIDGE ENHANCED
     */
    getDisplayContent() {
        const scores = this.gameState.scores;
        const cycleInfo = this.getCycleInfo();
        const dealInfo = this.getDealInfo();
        
        // Progress indicator (from progress-indicator.js)
        const progressHTML = (typeof ProgressIndicator !== 'undefined')
            ? ProgressIndicator.generateChicagoProgress(this)
            : '';
        
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
                        ${progressHTML}
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
                        ${progressHTML}
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
                        ${progressHTML}
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
                        ${progressHTML}
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
                        ${progressHTML}
                        <div><strong>${dealInfo}</strong></div>
                        <div><strong>Contract: ${fullContract} by ${this.currentContract.declarer}</strong></div>
                        <div style="color: #3498db; font-size: 12px;">
                            Cycle ${cycleInfo.cycleNumber} (${cycleInfo.cyclePosition}/4)
                        </div>
                    </div>
                    <div class="current-state">Enter number of ${modeText}</div>
                `;
                
            case 'scoring':
                const lastEntry = this.gameState.getLastDeal();
                if (lastEntry) {
                    const contractDisplay = `${lastEntry.contract.level}${lastEntry.contract.suit}${lastEntry.contract.doubled}`;
                    const nextCycleInfo = this.getNextCycleInfo();
                    const vulnerability = lastEntry.vulnerability || 'NV';
                    const vulnText = vulnerability === 'NV' ? 'Non-Vul' : 
                                   vulnerability === 'Both' ? 'Vulnerable' : 
                                   `${vulnerability} Vulnerable`;
                    
                    // Show who scored
                    const declarerSide = ['N', 'S'].includes(lastEntry.contract.declarer) ? 'NS' : 'EW';
                    const scoreAmount = Math.abs(lastEntry.score);
                    const scoringSide = lastEntry.score >= 0 ? declarerSide : (declarerSide === 'NS' ? 'EW' : 'NS');
                    
                    // Check if cycle is complete
                    const completedCycleInfo = this.getCycleInfo();
                    const isCycleComplete = completedCycleInfo.isEndOfCycle;
                    
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
                            <strong>${contractDisplay} by ${lastEntry.contract.declarer} ${vulnText}</strong><br>
                            <span style="color: ${lastEntry.score >= 0 ? '#27ae60' : '#e74c3c'};">
                                Score: ${lastEntry.score >= 0 ? '+' : ''}${lastEntry.score} for ${scoringSide}
                            </span></div>
                            ${isCycleComplete ? 
                                '<div style="color: #f39c12; font-size: 12px; margin-top: 4px; font-weight: bold;">🔄 Cycle Complete! Natural break point.</div>' : 
                                '<div style="color: #95a5a6; font-size: 11px; margin-top: 4px;">Next: ' + nextCycleInfo + '</div>'
                            }
                        </div>
                        <div class="current-state"><strong>Press DEAL for NEXT hand &nbsp;|&nbsp; Press QUIT for SCORES</strong></div>
                    `;
                }
                break;
                
            default:
                return '<div class="current-state">Loading...</div>';
        }
    }
    
    /**
     * Get enhanced status display for Chicago Bridge
     */
    getStatusDisplay() {
        const cycleInfo = this.getCycleInfo();
        const dealInfo = this.getDealInfo();
        const scores = this.gameState.scores;
        
        return {
            dealInfo: dealInfo,
            cycleInfo: `Cycle ${cycleInfo.cycleNumber} (${cycleInfo.cyclePosition}/4)`,
            scores: scores,
            isEndOfCycle: cycleInfo.isEndOfCycle,
            nextDealPreview: this.getNextCycleInfo()
        };
    }
    
    /**
     * Get cycle progress visualization
     */
    getCycleProgressDisplay() {
        const cycleInfo = this.getCycleInfo();
        const schedule = this.getVulnerabilitySchedule();
        
        let progressHTML = `<div class="cycle-progress" style="margin: 10px 0;">`;
        progressHTML += `<div style="font-weight: bold; margin-bottom: 8px;">Cycle ${cycleInfo.cycleNumber} Progress:</div>`;
        progressHTML += `<div style="display: flex; gap: 4px; justify-content: center;">`;
        
        schedule.forEach((deal, index) => {
            const vulnColors = {
                'None': '#95a5a6',
                'NS': '#27ae60', 
                'EW': '#e74c3c',
                'Both': '#f39c12'
            };
            
            const bgColor = deal.isCompleted ? vulnColors[deal.vulnerability] : 
                           deal.isCurrentDeal ? vulnColors[deal.vulnerability] : '#ecf0f1';
            const textColor = deal.isCompleted || deal.isCurrentDeal ? 'white' : '#7f8c8d';
            const border = deal.isCurrentDeal ? '2px solid #3498db' : '1px solid #bdc3c7';
            
            progressHTML += `
                <div style="
                    width: 60px;
                    height: 40px;
                    background: ${bgColor};
                    color: ${textColor};
                    border: ${border};
                    border-radius: 4px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    font-size: 10px;
                    font-weight: bold;
                ">
                    <div>D${deal.dealNumber}</div>
                    <div>${deal.vulnerability}</div>
                </div>
            `;
        });
        
        progressHTML += `</div></div>`;
        return progressHTML;
    }
    
    /**
     * Get vulnerability schedule for current cycle
     */
    getVulnerabilitySchedule() {
        const cycleInfo = this.getCycleInfo();
        const cycleStartDeal = ((cycleInfo.cycleNumber - 1) * 4) + 1;
        const schedule = [];
        
        for (let i = 0; i < 4; i++) {
            const dealNum = cycleStartDeal + i;
            const vulnCycle = ['None', 'NS', 'EW', 'Both'];
            
            schedule.push({
                dealNumber: dealNum,
                vulnerability: vulnCycle[i],
                isCompleted: dealNum < this.currentDeal,
                isCurrentDeal: dealNum === this.currentDeal
            });
        }
        
        return schedule;
    }
// END SECTION NINE

// SECTION TEN - Final Export and Utility Methods
    /**
     * Get cycle-aware game summary for external display
     */
    getGameSummary() {
        const scores = this.gameState.scores;
        const history = this.gameState.history;
        const cycleInfo = this.getCycleInfo();
        const stats = this.getGameStatistics();
        
        return {
            mode: 'Chicago Bridge',
            currentStatus: {
                deal: this.currentDeal,
                dealer: this.getDealerName(),
                vulnerability: this.vulnerability,
                cycle: cycleInfo,
                scores: { ...scores }
            },
            statistics: stats,
            cycleBreaks: this.getCycleBreakPoints(),
            gameComplete: false, // Chicago Bridge can continue indefinitely
            recommendations: this.getGameRecommendations()
        };
    }
    
    /**
     * Get natural break points in the game
     */
    getCycleBreakPoints() {
        const history = this.gameState.history;
        const breakPoints = [];
        
        for (let i = 4; i <= history.length; i += 4) {
            const cycleNum = i / 4;
            const cycleDeals = history.slice(i - 4, i);
            const cycleScores = { NS: 0, EW: 0 };
            
            cycleDeals.forEach(deal => {
                const side = deal.scoringSide;
                const points = deal.actualScore || Math.abs(deal.score);
                if (side && points) {
                    cycleScores[side] += points;
                }
            });
            
            breakPoints.push({
                cycle: cycleNum,
                dealsCompleted: i,
                cycleScores: cycleScores,
                cumulativeScores: {
                    NS: history.slice(0, i).reduce((sum, deal) => {
                        return sum + (deal.scoringSide === 'NS' ? (deal.actualScore || Math.abs(deal.score)) : 0);
                    }, 0),
                    EW: history.slice(0, i).reduce((sum, deal) => {
                        return sum + (deal.scoringSide === 'EW' ? (deal.actualScore || Math.abs(deal.score)) : 0);
                    }, 0)
                }
            });
        }
        
        return breakPoints;
    }
    
    /**
     * Get game recommendations based on current state
     */
    getGameRecommendations() {
        const cycleInfo = this.getCycleInfo();
        const scores = this.gameState.scores;
        const recommendations = [];
        
        if (cycleInfo.isEndOfCycle) {
            recommendations.push({
                type: 'break',
                message: 'Natural break point - cycle complete!',
                action: 'Consider taking a break or reviewing scores'
            });
        }
        
        const scoreDiff = Math.abs(scores.NS - scores.EW);
        if (scoreDiff > 1000) {
            recommendations.push({
                type: 'score',
                message: 'Large score difference detected',
                action: 'Consider starting a new game for closer competition'
            });
        }
        
        if (cycleInfo.cycleNumber >= 3) {
            recommendations.push({
                type: 'session',
                message: 'Long session detected',
                action: 'Good stopping point after this cycle'
            });
        }
        
        return recommendations;
    }
    
    /**
     * Generate detailed game report
     */
    generateGameReport() {
        const summary = this.getGameSummary();
        const history = this.gameState.history;
        
        let report = `CHICAGO BRIDGE GAME REPORT\n`;
        report += `Generated: ${new Date().toLocaleString()}\n`;
        report += `=====================================\n\n`;
        
        report += `CURRENT STATUS:\n`;
        report += `Deal ${summary.currentStatus.deal} - Dealer ${summary.currentStatus.dealer} - ${summary.currentStatus.vulnerability}\n`;
        report += `Cycle ${summary.currentStatus.cycle.cycleNumber} (Position ${summary.currentStatus.cycle.cyclePosition}/4)\n`;
        report += `Scores: NS ${summary.currentStatus.scores.NS}, EW ${summary.currentStatus.scores.EW}\n\n`;
        
        report += `GAME STATISTICS:\n`;
        report += `Total Deals: ${summary.statistics.totalDeals}\n`;
        report += `Cycles Completed: ${summary.statistics.cyclesCompleted}\n`;
        report += `Contracts Made: ${summary.statistics.contractsMade}\n`;
        report += `Contracts Failed: ${summary.statistics.contractsFailed}\n`;
        report += `Games Bid: ${summary.statistics.gamesPlayed}\n`;
        report += `Highest Score: ${summary.statistics.highestScore}\n\n`;
        
        if (summary.cycleBreaks.length > 0) {
            report += `CYCLE BREAK POINTS:\n`;
            summary.cycleBreaks.forEach(bp => {
                report += `Cycle ${bp.cycle}: NS ${bp.cumulativeScores.NS}, EW ${bp.cumulativeScores.EW}\n`;
            });
            report += `\n`;
        }
        
        report += `DEAL HISTORY:\n`;
        history.forEach(deal => {
            const contract = deal.contract;
            const contractStr = `${contract.level}${contract.suit}${contract.doubled || ''}`;
            report += `Deal ${deal.deal}: ${contractStr} by ${contract.declarer} = ${contract.result}, Score: ${deal.score}\n`;
        });
        
        return report;
    }
    
    /**
     * Reset to a specific cycle for teaching/practice
     */
    resetToCycle(cycleNumber) {
        if (cycleNumber < 1) {
            console.warn('Invalid cycle number');
            return false;
        }
        
        const startDeal = ((cycleNumber - 1) * 4) + 1;
        
        // Reset game state
        this.currentDeal = startDeal;
        this.updateVulnerabilityAndDealer();
        this.resetContract();
        this.inputState = 'level_selection';
        
        // Clear any deals from this cycle onward
        this.gameState.history = this.gameState.history.filter(deal => deal.deal < startDeal);
        
        // Recalculate scores
        this.gameState.scores = { NS: 0, EW: 0 };
        this.gameState.history.forEach(deal => {
            const side = deal.scoringSide;
            const points = deal.actualScore || Math.abs(deal.score);
            if (side && points) {
                this.gameState.scores[side] += points;
            }
        });
        
        this.updateDisplay();
        
        console.log(`🔄 Reset to Cycle ${cycleNumber}, Deal ${startDeal}`);
        return true;
    }
    
    /**
     * Quick setup for teaching scenarios
     */
    setupTeachingScenario(scenario) {
        const scenarios = {
            'vulnerability-demo': {
                description: 'Demonstrate all vulnerability conditions',
                startDeal: 1,
                setupMessage: 'Starting vulnerability demonstration cycle'
            },
            'game-contracts': {
                description: 'Practice game contracts in different vulnerabilities', 
                startDeal: 1,
                setupMessage: 'Ready for game contract practice'
            },
            'penalty-doubles': {
                description: 'Learn penalty scoring across vulnerabilities',
                startDeal: 1,
                setupMessage: 'Set up for penalty double practice'
            }
        };
        
        const config = scenarios[scenario];
        if (!config) {
            console.warn('Unknown teaching scenario:', scenario);
            return false;
        }
        
        this.resetToCycle(Math.floor((config.startDeal - 1) / 4) + 1);
        
        console.log(`📚 Teaching scenario: ${config.description}`);
        this.bridgeApp.showMessage(config.setupMessage, 'info');
        
        return true;
    }
    
    /**
     * Cleanup when switching modes
     */
    cleanup() {
        console.log('🧹 Chicago Bridge cleanup completed');
        // Chicago Bridge doesn't have special UI elements to clean up like some other modes
    }
}

// Export for the new module system
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ChicagoBridgeMode;
} else if (typeof window !== 'undefined') {
    window.ChicagoBridgeMode = ChicagoBridgeMode;
}

console.log('🌉 Chicago Bridge module loaded successfully with 4-deal cycle management and proven mobile template');
// END SECTION TEN - FILE COMPLETE