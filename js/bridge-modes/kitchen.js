// SECTION ONE - Header and Constructor
/**
 * Kitchen Bridge Mode - Simplified Social Bridge Scoring (Enhanced)
 * MOBILE ENHANCED VERSION - Full touch support for all devices
 * Updated to work with new modular bridge system
 * CLEAN VERSION - No scrolling issues
 */

class KitchenBridgeMode extends BaseBridgeMode {
    constructor(bridgeApp) {
        super(bridgeApp);
        
        this.modeName = 'Kitchen Bridge';
        this.displayName = '🍳 Kitchen Bridge';
        
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
        
        console.log('🏠 Kitchen Bridge mode initialized with clean help system');
        
        // Initialize immediately
        this.initialize();
    }
    
    /**
     * Initialize Kitchen Bridge mode
     */
    initialize() {
        console.log('🎯 Starting Kitchen Bridge session');
        
        // Start with level selection
        this.inputState = 'level_selection';
        this.resetContract();
        
        this.updateDisplay();
    }
// END SECTION ONE

// SECTION TWO - Input Handlers
    /**
     * Handle user input - integration with new system
     */
    handleInput(value) {
        console.log(`🎮 Kitchen Bridge input: ${value} in state: ${this.inputState}`);
        
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
     * Override vulnerability toggle to work with Kitchen Bridge
     */
    toggleVulnerability() {
        const states = ['NV', 'NS', 'EW', 'Both'];
        const current = this.vulnerability;
        const currentIndex = states.indexOf(current);
        const nextIndex = (currentIndex + 1) % states.length;
        
        this.vulnerability = states[nextIndex];
        
        // Update the control display
        const vulnText = document.getElementById('vulnText');
        if (vulnText) {
            vulnText.textContent = this.vulnerability;
        }
        
        console.log(`🎯 Vulnerability changed to: ${this.vulnerability}`);
        this.updateDisplay();
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
            case 'scoring':
                this.handleScoringActions(value);
                break;
        }
        
        this.updateDisplay();
    }
// END SECTION TWO

// SECTION THREE - Action Processing
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

// SECTION FOUR - Game Management & Scoring
    /**
     * Move to next deal
     */
    nextDeal() {
        console.log('🃏 Moving to next deal');
        
        this.currentDeal++;
        this.resetContract();
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
                
            case 'scoring':
                return ['DEAL'];
                
            default:
                return [];
        }
    }
// END SECTION FOUR

// SECTION FIVE - Scoring Logic
    /**
     * Calculate score using Kitchen Bridge rules - using original proven method
     */
    calculateScore() {
        const { level, suit, result, doubled, declarer } = this.currentContract;
        
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
                    const isVulnerable = this.isVulnerable(declarer);
                    overtrickValue = overtricks * (isVulnerable ? 200 : 100);
                    if (doubled === 'XX') overtrickValue *= 2;
                }
                score += overtrickValue;
            }
            
            // Game/Part-game bonus
            if (contractScore >= 100) {
                // Game made
                const isVulnerable = this.isVulnerable(declarer);
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
            const isVulnerable = this.isVulnerable(declarer);
            
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
     * Calculate and record the score - using original proven method
     */
    calculateAndRecordScore() {
        const score = this.calculateScore();
        const declarerSide = ['N', 'S'].includes(this.currentContract.declarer) ? 'NS' : 'EW';
        
        console.log('📊 Before adding score - gameState.scores:', this.gameState.scores);
        console.log('📊 Score calculated:', score);
        console.log('📊 Declarer side:', declarerSide);
        
        // Store scores before attempting to add
        const scoresBefore = { ...this.gameState.scores };
        
        if (score >= 0) {
            // Made contract - points go to declarer side
            this.gameState.addScore(declarerSide, score);
            
            // Check if addScore worked, if not use direct update
            if (this.gameState.scores[declarerSide] === scoresBefore[declarerSide]) {
                console.log('🔧 addScore failed, using direct update');
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
                console.log('🔧 addScore failed, using direct update');
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
            mode: 'kitchen',
            vulnerability: this.vulnerability
        });
        
        // Increment deals for license tracking
        this.licenseManager.incrementDealsPlayed();
        
        console.log(`💾 Score recorded: ${score >= 0 ? score + ' for ' + declarerSide : Math.abs(score) + ' penalty for ' + (declarerSide === 'NS' ? 'EW' : 'NS')}`);
    }
// END SECTION FIVE

// SECTION SIX - Mobile Template System (PROVEN FROM Chicago Bridge)
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
                        .scoring-table {
                            width: 100%;
                            border-collapse: collapse;
                            margin: 10px 0;
                            font-size: 12px;
                        }
                        .scoring-table th,
                        .scoring-table td {
                            border: 1px solid #ddd;
                            padding: 8px;
                            text-align: left;
                        }
                        .scoring-table th {
                            background: #f8f9fa;
                            font-weight: bold;
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
        
        // Create two-row button layout for mobile (Kitchen Bridge has 5 buttons)
        let buttonsHTML = '';
        if (modalButtons.length === 5) {
            // First row: 3 buttons, Second row: 2 buttons
            buttonsHTML = `
                <div style="display: flex; flex-direction: column; gap: 8px; width: 100%;">
                    <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px;">
                        <button class="modal-btn" data-action="${modalButtons[0].text}" style="
                           padding: 10px 4px;
                            border: none;
                            border-radius: 6px;
                            font-size: 12px;
                            font-weight: 600;
                            cursor: pointer;
                            background: #27ae60;
                            color: white;
                            touch-action: manipulation;
                            user-select: none;
                            -webkit-tap-highlight-color: transparent;
                        ">${modalButtons[0].text}</button>
                        <button class="modal-btn" data-action="${modalButtons[1].text}" style="
                            padding: 10px 4px;
                            border: none;
                            border-radius: 6px;
                            font-size: 12px;
                            font-weight: 600;
                            cursor: pointer;
                            background: #3498db;
                            color: white;
                            touch-action: manipulation;
                            user-select: none;
                            -webkit-tap-highlight-color: transparent;
                        ">${modalButtons[1].text}</button>
                        <button class="modal-btn" data-action="${modalButtons[2].text}" style="
                            padding: 10px 4px;
                            border: none;
                            border-radius: 6px;
                            font-size: 12px;
                            font-weight: 600;
                            cursor: pointer;
                            background: #f39c12;
                            color: white;
                            touch-action: manipulation;
                            user-select: none;
                            -webkit-tap-highlight-color: transparent;
                        ">${modalButtons[2].text}</button>
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
                        <button class="modal-btn" data-action="${modalButtons[3].text}" style="
                            padding: 12px 8px;
                            border: none;
                            border-radius: 6px;
                            font-size: 12px;
                            font-weight: 600;
                            cursor: pointer;
                            background: #95a5a6;
                            color: white;
                            touch-action: manipulation;
                            user-select: none;
                            -webkit-tap-highlight-color: transparent;
                        ">${modalButtons[3].text}</button>
                        <button class="modal-btn" data-action="${modalButtons[4].text}" style="
                            padding: 12px 8px;
                            border: none;
                            border-radius: 6px;
                            font-size: 12px;
                            font-weight: 600;
                            cursor: pointer;
                            background: #e74c3c;
                            color: white;
                            touch-action: manipulation;
                            user-select: none;
                            -webkit-tap-highlight-color: transparent;
                        ">${modalButtons[4].text}</button>
                    </div>
                </div>
            `;
        } else if (modalButtons.length === 4) {
            // Two rows of two buttons each (fallback)
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
     * Show Kitchen Bridge specific help - PROVEN MOBILE TEMPLATE
     */
    showHelp() {
        const helpContent = this.getKitchenHelpContent();
        this.showMobileOptimizedModal(helpContent.title, helpContent.content, helpContent.buttons);
    }

    /**
     * Get Kitchen Bridge help content - Based on your help document
     */
    getKitchenHelpContent() {
        return {
            title: '🍳 Kitchen Bridge Help',
            content: `
                <div class="content-section">
                    <h3 style="margin: 0 0 12px 0; color: #1976d2; font-size: 18px;">What is Kitchen Bridge?</h3>
                    <p style="margin: 0 0 16px 0; font-size: 14px; line-height: 1.4; color: #333;">
                        Kitchen Bridge is traditional bridge scoring designed for casual play at a single table with 4 players. 
                        It uses standard bridge scoring rules without any adjustments for hand strength or playing skill.
                    </p>
                    
                    <h4 style="margin: 0 0 8px 0; color: #1976d2; font-size: 16px;">Key Characteristics</h4>
                    <ul style="margin: 0 0 16px 0; padding-left: 20px; font-size: 13px; line-height: 1.4;">
                        <li><strong>Standard Scoring:</strong> Uses traditional bridge point values</li>
                        <li><strong>4 Players Only:</strong> Designed for one table bridge</li>
                        <li><strong>No Skill Adjustment:</strong> Same score regardless of hand strength</li>
                        <li><strong>Simple & Quick:</strong> Easy to calculate, familiar to all bridge players</li>
                    </ul>
                    
                    <div style="background: #f0f8ff; padding: 12px; border-radius: 8px; border-left: 4px solid #2196f3;">
                        <h4 style="margin: 0 0 8px 0; color: #1976d2; font-size: 14px;">Perfect For</h4>
                        <p style="margin: 0; font-size: 13px; color: #1976d2;">
                            Casual home bridge games • Learning bridge scoring • Quick social games • Traditional bridge enthusiasts
                        </p>
                    </div>
                </div>
                
                <div class="content-section">
                    <h3 style="margin: 0 0 16px 0; color: #1976d2; font-size: 18px;">Basic Contract Scores</h3>
                    
                    <table class="scoring-table">
                        <tr>
                            <th>Contract</th>
                            <th>Points per Trick</th>
                            <th>Example (4-level)</th>
                        </tr>
                        <tr>
                            <td>♣ ♦ (Minors)</td>
                            <td>20</td>
                            <td>4♣ = 80 pts</td>
                        </tr>
                        <tr>
                            <td>♥ ♠ (Majors)</td>
                            <td>30</td>
                            <td>4♥ = 120 pts</td>
                        </tr>
                        <tr>
                            <td>NT (No Trump)</td>
                            <td>30 + 10</td>
                            <td>3NT = 100 pts</td>
                        </tr>
                    </table>
                </div>
                
                <div class="content-section">
                    <h3 style="margin: 0 0 16px 0; color: #1976d2; font-size: 18px;">Bonus Points</h3>
                    
                    <div class="feature-grid">
                        <div class="feature-item">
                            <h4>Game Bonus</h4>
                            <p>300 (not vulnerable)<br>500 (vulnerable)</p>
                        </div>
                        <div class="feature-item">
                            <h4>Part Game</h4>
                            <p>50 points</p>
                        </div>
                        <div class="feature-item">
                            <h4>Small Slam</h4>
                            <p>500 / 750 points</p>
                        </div>
                        <div class="feature-item">
                            <h4>Grand Slam</h4>
                            <p>1000 / 1500 points</p>
                        </div>
                    </div>
                    
                    <div style="background: #e8f5e8; padding: 12px; border-radius: 8px; border-left: 4px solid #28a745; margin-top: 16px;">
                        <h4 style="margin: 0 0 8px 0; color: #155724; font-size: 14px;">Doubling Effects</h4>
                        <p style="margin: 0; font-size: 13px; color: #155724;">
                            Doubles contract points and penalties • Adds 50/100 bonus for making doubled contracts
                        </p>
                    </div>
                </div>
                
                <div class="content-section">
                    <h3 style="margin: 0 0 16px 0; color: #1976d2; font-size: 18px;">Overtricks & Penalties</h3>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin: 16px 0;">
                        <div style="background: #e8f5e8; padding: 14px; border-radius: 8px; border-left: 4px solid #28a745;">
                            <h4 style="margin: 0 0 10px 0; color: #155724; font-size: 14px;">✅ Made Contracts</h4>
                            <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #155724; line-height: 1.3;">
                                <li>Overtricks: Same value as contract suit</li>
                                <li>Doubled Overtricks: 100/200 (not vul/vul)</li>
                            </ul>
                        </div>
                        
                        <div style="background: #ffebee; padding: 14px; border-radius: 8px; border-left: 4px solid #f44336;">
                            <h4 style="margin: 0 0 10px 0; color: #b71c1c; font-size: 14px;">❌ Failed Contracts</h4>
                            <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #b71c1c; line-height: 1.3;">
                                <li>Penalties: 50/100 per trick (not vul/vul)</li>
                                <li>Doubled Penalties: 100/200/300... progression</li>
                            </ul>
                        </div>
                    </div>
                </div>
                
                <div class="content-section">
                    <h3 style="margin: 0 0 12px 0; color: #1976d2; font-size: 18px;">How to Use</h3>
                    <ol style="margin: 0 0 16px 0; padding-left: 20px; font-size: 13px; line-height: 1.4;">
                        <li>Set Vulnerability using the Vuln button (NV → NS → EW → Both)</li>
                        <li>Enter Contract: Level → Suit → Declarer → Result</li>
                        <li>Add Doubling: Press X to cycle None/Double/Redouble</li>
                        <li>Press Deal to continue to next hand</li>
                        <li>Manual vulnerability control throughout game</li>
                    </ol>
                    
                    <div style="background: #fff3cd; padding: 12px; border-radius: 8px; border-left: 4px solid #ffc107; margin-top: 16px;">
                        <h4 style="margin: 0 0 8px 0; color: #856404; font-size: 14px;">⚠️ The Core Limitation</h4>
                        <p style="margin: 0; font-size: 13px; color: #856404;">
                            Kitchen Bridge treats all hands equally - a brilliant 4♥ make with 6 HCP gets the same 420 points as an easy 4♥ make with 28 HCP. Consider Bonus Bridge for skill-based scoring.
                        </p>
                    </div>
                    
                    <div style="
                        text-align: center; 
                        font-size: 12px; 
                        color: #666; 
                        background: rgba(52,152,219,0.05);
                        padding: 12px;
                        border-radius: 6px;
                        margin-top: 16px;
                    ">
                        🍳 Kitchen Bridge: Perfect for casual home games and learning bridge scoring
                    </div>
                </div>
            `,
            buttons: [
                { text: 'Close', action: () => this.closeMobileModal() }
            ]
        };
    }

    /**
     * Show Kitchen Bridge specific quit options - FIXED MOBILE LAYOUT
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
                <div class="content-section">
                    <h4 style="margin: 0 0 12px 0; color: #1976d2;">📊 Current Game Status</h4>
                    <p><strong>Deals Played:</strong> ${totalDeals}</p>
                    <p><strong>Current Vulnerability:</strong> ${this.vulnerability}</p>
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
            { text: 'Return to Main Menu', action: () => this.returnToMainMenu() },
            { text: 'Show Help', action: () => this.showHelp() }
        ];
        
        this.showMobileOptimizedModalWithCustomButtons('🍳 Kitchen Bridge Options', content, buttons);
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
                <h4 style="margin: 0 0 12px 0; color: #1976d2;">🍳 Deal by Deal History</h4>
        `;
        
        // Show all deals (Kitchen Bridge doesn't need cycle grouping like Chicago)
        history.forEach((deal, index) => {
            const contract = deal.contract;
            const contractStr = `${contract.level}${contract.suit}${contract.doubled ? ' ' + contract.doubled : ''}`;
            const vulnerability = deal.vulnerability || 'NV';
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
                    background: ${index % 2 === 0 ? 'rgba(240,248,255,0.8)' : 'white'};
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                ">
                    <div style="flex: 1;">
                        <div style="font-weight: bold; margin-bottom: 4px; color: #222; font-size: 13px;">
                            Deal ${deal.deal} - <span style="color: ${vulnColor};">${vulnerability}</span>
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
                    🍳 Kitchen Bridge: Traditional bridge scoring for casual play
                </div>
            </div>
        `;
        
        this.showMobileOptimizedModal('📊 Kitchen Bridge - Detailed Analysis', dealSummary, [
            { text: 'Back to Options', action: () => this.showQuit() },
            { text: 'Continue Playing', action: () => this.closeMobileModal() }
        ]);
    }

    /**
     * Start a new game (reset scores and vulnerability)
     */
    startNewGame() {
        const confirmed = confirm(
            'Start a new Kitchen Bridge game?\n\nThis will reset all scores to zero and start over.\n\nClick OK to start new game, Cancel to continue current game.'
        );
        
        if (confirmed) {
            // Reset all scores and history
            this.gameState.scores = { NS: 0, EW: 0 };
            this.gameState.history = [];
            this.currentDeal = 1;
            this.vulnerability = 'NV';
            
            // Update vulnerability display
            const vulnText = document.getElementById('vulnText');
            if (vulnText) {
                vulnText.textContent = 'NV';
            }
            
            // Reset to level selection
            this.resetContract();
            this.inputState = 'level_selection';
            this.updateDisplay();
            
            console.log('🆕 New Kitchen Bridge game started');
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
// END SECTION SIX
// SECTION SEVEN - Score Display & Game Options
    /**
     * Show Kitchen Bridge specific quit options
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
    { text: 'Continue', action: () => this.closeMobileModal() },
    { text: 'Scores', action: () => this.showDetailedScores() },
    { text: 'New Game', action: () => this.startNewGame() },
    { text: 'Main Menu', action: () => this.returnToMainMenu() },
    { text: 'Help', action: () => this.showHelp() }
];
        
        this.showMobileOptimizedModalWithCustomButtons('🍳 Kitchen Bridge Options', content, buttons);
    }
    
    /**
     * Show detailed deal-by-deal scores - SIMPLIFIED VERSION (NO COMPLEX SCROLLING)
     */
    showDetailedScores() {
        const scores = this.gameState.scores;
        const history = this.gameState.history;
        
        if (history.length === 0) {
            this.bridgeApp.showModal('📊 Game Scores', '<p>No deals have been played yet.</p>');
            return;
        }

        // SIMPLIFIED - Show only summary and recent deals (no scrolling needed)
        const recentDeals = history.slice(-8); // Show last 8 deals max
        const hasMoreDeals = history.length > 8;
        
        let dealSummary = `
            <div style="padding: 15px; font-size: 13px;">
                <div style="margin-bottom: 15px; text-align: center; background: rgba(52,152,219,0.1); padding: 12px; border-radius: 8px;">
                    <h4 style="margin: 0 0 8px 0;">📊 Current Totals</h4>
                    <div style="font-size: 16px; font-weight: bold;">
                        <span style="color: #27ae60;">North-South: ${scores.NS}</span> • 
                        <span style="color: #e74c3c;">East-West: ${scores.EW}</span>
                    </div>
                    <div style="margin-top: 8px; font-size: 14px; color: #666;">
                        Leader: <strong>${scores.NS > scores.EW ? 'North-South' : scores.EW > scores.NS ? 'East-West' : 'Tied'}</strong>
                    </div>
                </div>
                
                <h4 style="margin: 15px 0 8px 0;">🃏 Recent Deals ${hasMoreDeals ? `(Last ${recentDeals.length} of ${history.length})` : `(All ${history.length})`}</h4>
        `;
        
        recentDeals.forEach((deal, index) => {
            const contract = deal.contract;
            const contractStr = `${contract.level}${contract.suit}${contract.doubled ? ' ' + contract.doubled : ''}`;
            const scoreDisplay = deal.score >= 0 ? `+${deal.score}` : `${deal.score}`;
            const scoringSide = deal.scoringSide || (deal.score >= 0 ? 
                (['N', 'S'].includes(contract.declarer) ? 'NS' : 'EW') :
                (['N', 'S'].includes(contract.declarer) ? 'EW' : 'NS'));
            
            const vulnerability = deal.vulnerability || 'NV';
            
            dealSummary += `
                <div style="
                    border: 1px solid #ddd; 
                    padding: 10px; 
                    margin: 5px 0;
                    border-radius: 6px;
                    background: ${index % 2 === 0 ? 'rgba(240,248,255,0.8)' : 'rgba(248,249,250,0.8)'};
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                ">
                    <div style="flex: 1;">
                        <div style="font-weight: bold; margin-bottom: 2px;">
                            Deal ${deal.deal} - ${vulnerability}
                        </div>
                        <div style="font-size: 12px; color: #666;">
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
        
        if (hasMoreDeals) {
            dealSummary += `
                <div style="
                    text-align: center; 
                    padding: 10px; 
                    margin-top: 10px;
                    background: rgba(255,193,7,0.1); 
                    border-radius: 6px;
                    color: #856404;
                    font-size: 12px;
                ">
                    📝 Showing recent ${recentDeals.length} deals of ${history.length} total deals played
                </div>
            `;
        }
        
        dealSummary += `
            </div>
        `;
        
        const buttons = [
            { text: 'Back to Options', action: () => this.showQuit(), class: 'back-btn' },
            { text: 'Continue Playing', action: () => {}, class: 'continue-btn' }
        ];
        
        this.showMobileOptimizedModal('📊 Kitchen Bridge - Detailed Analysis', dealSummary, buttons);
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
            
            // Update vulnerability display
            const vulnText = document.getElementById('vulnText');
            if (vulnText) {
                vulnText.textContent = 'NV';
            }
            
            // Reset to level selection
            this.resetContract();
            this.inputState = 'level_selection';
            this.updateDisplay();
            
            console.log('🆕 New Kitchen Bridge game started');
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
// END SECTION SEVEN

// SECTION EIGHT - Display Content & Final Methods
    /**
     * Get display content for current state
     */
    getDisplayContent() {
        const scores = this.gameState.scores;
        
        // Debug: Log scores to see what's happening
        console.log('🎯 Current scores in display:', scores);
        
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
                        <div style="color: #3498db; font-size: 12px; margin-top: 4px;">
                            Traditional bridge scoring • Manual vulnerability control
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
                    </div>
                    <div class="current-state">Enter number of ${modeText}</div>
                `;
                
            case 'scoring':
                const lastEntry = this.gameState.getLastDeal();
                if (lastEntry) {
                    const contractDisplay = `${lastEntry.contract.level}${lastEntry.contract.suit}${lastEntry.contract.doubled}`;
                    
                    // Show who scored - simple logic
                    const declarerSide = ['N', 'S'].includes(lastEntry.contract.declarer) ? 'NS' : 'EW';
                    const scoreAmount = Math.abs(lastEntry.score);
                    const scoringSide = lastEntry.score >= 0 ? declarerSide : (declarerSide === 'NS' ? 'EW' : 'NS');
                    
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
                            <span style="color: #27ae60;">
                                Score: +${scoreAmount} for ${scoringSide}
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
}

// Export for the new module system
if (typeof module !== 'undefined' && module.exports) {
    module.exports = KitchenBridgeMode;
} else if (typeof window !== 'undefined') {
    window.KitchenBridgeMode = KitchenBridgeMode;
}

console.log('🍳 Kitchen Bridge module loaded successfully - CLEAN VERSION WITH SECTIONS');
// END SECTION EIGHT