//SECTION ONE
/**
 * Duplicate Bridge Mode - Tournament Bridge Scoring
 * Mobile-optimized version with comprehensive tournament support
 * 
 * Provides tournament-style bridge scoring with:
 * - Matchpoint scoring system
 * - Board-by-board tracking with vulnerability cycles
 * - Traveler sheets for result entry
 * - Multiple pair movements (4, 6, 8 pairs)
 * - Mobile-optimized interface
 */

class DuplicateBridgeMode extends BaseBridgeMode {
    constructor(bridgeApp) {
        super(bridgeApp);
        
        this.modeName = 'Duplicate Bridge';
        this.displayName = 'Duplicate Bridge';
        
        // Duplicate Bridge state
        this.session = {
            pairs: 0,
            movement: null,
            currentBoard: 1,
            boards: {},
            isSetup: false
        };
        
        this.traveler = {
            isActive: false,
            boardNumber: null,
            data: []
        };
        
        // Number builder for multi-digit pair selection
        this.numberBuilder = '';
        this.numberBuildTimeout = null;
        
        this.inputState = 'pairs_setup';
        this.isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        // Initialize movements and start
        this.initializeMovements();
        this.initialize();
    }

    /**
     * Initialize movements for different pair counts
     * Now uses ENHANCED_MOVEMENTS if available (supports 4-14 pairs)
     */
    initializeMovements() {
        // Use enhanced movements if available, otherwise fallback to basic
        if (typeof ENHANCED_MOVEMENTS !== 'undefined') {
            this.movements = ENHANCED_MOVEMENTS;
            console.log('✅ Using enhanced movements with', Object.keys(this.movements).length, 'movement options');
        } else {
            // Fallback to original 3 movements
            console.warn('⚠️ Enhanced movements not loaded, using basic 3 movements');
            this.movements = {
            4: {
                pairs: 4, tables: 2, rounds: 6, totalBoards: 12,
                description: "2-table Howell, 12 boards, ~2 hours",
                movement: [
                    { round: 1, table: 1, ns: 1, ew: 2, boards: [1,2] },
                    { round: 1, table: 2, ns: 3, ew: 4, boards: [3,4] },
                    { round: 2, table: 1, ns: 2, ew: 4, boards: [5,6] },
                    { round: 2, table: 2, ns: 3, ew: 1, boards: [7,8] },
                    { round: 3, table: 1, ns: 1, ew: 4, boards: [9,10] },
                    { round: 3, table: 2, ns: 2, ew: 3, boards: [11,12] },
                    { round: 4, table: 1, ns: 4, ew: 3, boards: [1,2] },
                    { round: 4, table: 2, ns: 2, ew: 1, boards: [3,4] },
                    { round: 5, table: 1, ns: 1, ew: 3, boards: [5,6] },
                    { round: 5, table: 2, ns: 4, ew: 2, boards: [7,8] },
                    { round: 6, table: 1, ns: 3, ew: 2, boards: [9,10] },
                    { round: 6, table: 2, ns: 4, ew: 1, boards: [11,12] }
                ]
            },
            6: {
                pairs: 6, tables: 3, rounds: 5, totalBoards: 10,
                description: "3-table Howell, 10 boards, ~1.5 hours",
                movement: [
                    { round: 1, table: 1, ns: 1, ew: 2, boards: [1,2] },
                    { round: 1, table: 2, ns: 3, ew: 4, boards: [3,4] },
                    { round: 1, table: 3, ns: 5, ew: 6, boards: [5,6] },
                    { round: 2, table: 1, ns: 1, ew: 3, boards: [7,8] },
                    { round: 2, table: 2, ns: 5, ew: 2, boards: [9,10] },
                    { round: 2, table: 3, ns: 4, ew: 6, boards: [1,2] },
                    { round: 3, table: 1, ns: 1, ew: 4, boards: [3,4] },
                    { round: 3, table: 2, ns: 6, ew: 3, boards: [5,6] },
                    { round: 3, table: 3, ns: 2, ew: 5, boards: [7,8] },
                    { round: 4, table: 1, ns: 1, ew: 5, boards: [9,10] },
                    { round: 4, table: 2, ns: 2, ew: 4, boards: [1,2] },
                    { round: 4, table: 3, ns: 3, ew: 6, boards: [3,4] },
                    { round: 5, table: 1, ns: 1, ew: 6, boards: [5,6] },
                    { round: 5, table: 2, ns: 3, ew: 5, boards: [7,8] },
                    { round: 5, table: 3, ns: 4, ew: 2, boards: [9,10] }
                ]
            },
            8: {
                pairs: 8, tables: 4, rounds: 7, totalBoards: 14,
                description: "4-table Howell, 14 boards, ~2.5 hours",
                movement: [
                    { round: 1, table: 1, ns: 1, ew: 2, boards: [1,2] },
                    { round: 1, table: 2, ns: 3, ew: 4, boards: [3,4] },
                    { round: 1, table: 3, ns: 5, ew: 6, boards: [5,6] },
                    { round: 1, table: 4, ns: 7, ew: 8, boards: [7,8] },
                    { round: 2, table: 1, ns: 1, ew: 6, boards: [9,10] },
                    { round: 2, table: 2, ns: 7, ew: 3, boards: [11,12] },
                    { round: 2, table: 3, ns: 4, ew: 8, boards: [13,14] },
                    { round: 2, table: 4, ns: 2, ew: 5, boards: [1,2] },
                    { round: 3, table: 1, ns: 1, ew: 8, boards: [3,4] },
                    { round: 3, table: 2, ns: 2, ew: 6, boards: [5,6] },
                    { round: 3, table: 3, ns: 3, ew: 5, boards: [7,8] },
                    { round: 3, table: 4, ns: 4, ew: 7, boards: [9,10] },
                    { round: 4, table: 1, ns: 1, ew: 5, boards: [11,12] },
                    { round: 4, table: 2, ns: 8, ew: 4, boards: [13,14] },
                    { round: 4, table: 3, ns: 6, ew: 7, boards: [1,2] },
                    { round: 4, table: 4, ns: 2, ew: 3, boards: [3,4] },
                    { round: 5, table: 1, ns: 1, ew: 7, boards: [5,6] },
                    { round: 5, table: 2, ns: 3, ew: 8, boards: [7,8] },
                    { round: 5, table: 3, ns: 5, ew: 4, boards: [9,10] },
                    { round: 5, table: 4, ns: 6, ew: 2, boards: [11,12] },
                    { round: 6, table: 1, ns: 1, ew: 4, boards: [13,14] },
                    { round: 6, table: 2, ns: 5, ew: 8, boards: [1,2] },
                    { round: 6, table: 3, ns: 7, ew: 2, boards: [3,4] },
                    { round: 6, table: 4, ns: 3, ew: 6, boards: [5,6] },
                    { round: 7, table: 1, ns: 1, ew: 3, boards: [7,8] },
                    { round: 7, table: 2, ns: 4, ew: 6, boards: [9,10] },
                    { round: 7, table: 3, ns: 8, ew: 5, boards: [11,12] },
                    { round: 7, table: 4, ns: 2, ew: 7, boards: [13,14] }
                ]
            }
        };
        }
    }

    /**
     * Initialize Duplicate Bridge mode
     */
    initialize() {
        this.inputState = 'pairs_setup';
        this.session.isSetup = false;
        this.traveler.isActive = false;
        
        // Set up global reference for popup callbacks
        window.duplicateBridge = this;
        
        this.updateDisplay();
    }
// END SECTION ONE
// SECTION TWO
/**
     * Handle user input
     */
    handleInput(value) {
        // Route traveler input to traveler handler
        if (this.inputState === 'traveler_entry') {
            this.handleTravelerInput(value);
            return;
        }
        
        // Handle back navigation
        if (value === 'BACK') {
            if (this.handleBack()) {
                return;
            } else {
                this.bridgeApp.showLicensedMode({ 
                    type: this.bridgeApp.licenseManager.getLicenseData()?.type || 'FULL' 
                });
                return;
            }
        }
        
        // Handle Print menu (NV button in Duplicate mode)
        if (value === 'NV') {
            this.showPrintMenu();
            return;
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
        
        // Handle DEAL button for results
        if (value === 'DEAL' && this.inputState === 'board_selection') {
            this.handleBoardSelection(value);
            return;
        }
        
        this.handleAction(value);
    }

    /**
     * Setup boards for selected movement
     */
    setupBoards() {
        this.session.boards = {};
        for (let i = 1; i <= this.session.movement.totalBoards; i++) {
            this.session.boards[i] = {
                number: i,
                results: [],
                completed: false,
                vulnerability: this.getBoardVulnerability(i)
            };
        }
        this.session.isSetup = true;
    }

    /**
     * Get board vulnerability using standard duplicate cycle
     */
    getBoardVulnerability(boardNumber) {
        const cycle = (boardNumber - 1) % 16;
        const vulns = ['None', 'NS', 'EW', 'Both', 'EW', 'Both', 'None', 'NS', 
                      'NS', 'EW', 'Both', 'None', 'Both', 'None', 'NS', 'EW'];
        return vulns[cycle];
    }

    /**
     * Check if declarer is vulnerable for scoring
     */
    isDeclarerVulnerable(boardNumber, declarer) {
        const vulnerability = this.getBoardVulnerability(boardNumber);
        
        if (vulnerability === 'None') return false;
        if (vulnerability === 'Both') return true;
        
        const isNS = declarer === 'N' || declarer === 'S';
        
        if (vulnerability === 'NS') return isNS;
        if (vulnerability === 'EW') return !isNS;
        
        return false;
    }

    /**
     * Handle user actions with enhanced mobile support
     */
    handleAction(value) {
        switch (this.inputState) {
            case 'pairs_setup':
                this.handlePairsSetup(value);
                break;
            case 'movement_confirm':
                this.handleMovementConfirm(value);
                break;
            case 'board_selection':
                this.handleBoardSelection(value);
                break;
            case 'results':
                this.handleResults(value);
                break;
        }
        
        this.updateDisplay();
    }

    /**
     * Handle pairs setup selection with multi-digit entry
     * User can type: 4, 10 (1+0), 12 (1+2), 14 (1+4), etc.
     */
    handlePairsSetup(value) {
        // Handle BACK - clear number builder or go back
        if (value === 'BACK') {
            if (this.numberBuilder) {
                // Clear the number being built
                this.numberBuilder = '';
                clearTimeout(this.numberBuildTimeout);
                this.updateDisplay();
            } else {
                // Go back to mode selection
                this.bridgeApp.showModeSelector();
            }
            return;
        }
        
        // If it's a digit (0-9), build the number
        if (/^\d$/.test(value)) {
            this.buildNumber(value);
        }
    }
    
    /**
     * Build a multi-digit number with smart logic
     * 1 → Wait for second digit (10, 12, 14 valid)
     * 2, 3 → Show error (no movements starting with 2 or 3)
     * 4-9 → Immediate selection
     * 0 → Show error (use 1→0 for 10 pairs)
     */
    buildNumber(digit) {
        // Clear any existing timeout
        clearTimeout(this.numberBuildTimeout);
        
        // If this is the first digit
        if (!this.numberBuilder) {
            this.numberBuilder = digit;
            
            // If first digit is 0 → Invalid, show error
            if (digit === '0') {
                this.bridgeApp.showMessage('For 10 pairs, press 1 then 0', 'warning');
                this.numberBuilder = '';
                this.updateDisplay();
                return;
            }
            
            // If first digit is 2 or 3 → No valid movements, show error
            if (digit === '2' || digit === '3') {
                this.bridgeApp.showMessage('No movements starting with ' + digit + '. Try 1, or 4-9.', 'warning');
                this.numberBuilder = '';
                this.updateDisplay();
                return;
            }
            
            // If first digit is 1 → MUST be 2-digit, wait for second
            if (digit === '1') {
                // Just update display and wait
                this.updateDisplay();
                return;
            }
            
            // If first digit is 4-9 → Single digit, submit immediately
            this.updateDisplay();
            this.submitPairCount();
            return;
        }
        
        // This is the second digit (we already have first)
        this.numberBuilder += digit;
        this.updateDisplay();
        
        // Submit immediately after second digit
        this.submitPairCount();
    }
    
    /**
     * Submit the built number as pair count
     */
    submitPairCount() {
        const pairCount = parseInt(this.numberBuilder);
        
        // Clear the builder
        this.numberBuilder = '';
        
        // Check if this movement exists
        if (this.movements[pairCount]) {
            this.session.pairs = pairCount;
            this.session.movement = this.movements[pairCount];
            this.inputState = 'movement_confirm';
            this.updateDisplay();
        } else {
            // Show error for invalid pair count
            this.bridgeApp.showMessage(`No movement available for ${pairCount} pairs`, 'warning');
            this.updateDisplay();
        }
    }

    /**
     * Handle movement confirmation
     */
    handleMovementConfirm(value) {
        if (value === '1') {
            this.showMovementPopup();
        } else if (value === '2') {
            // Print table cards and start tournament
            this.printTableCardsAndStart();
        } else if (value === '3') {
            // Start tournament without printing
            this.setupBoards();
            this.inputState = 'board_selection';
        } else if (value === '4') {
            // Open print menu
            this.showPrintMenu();
        }
    }

    /**
     * Print table cards and start tournament
     * NEW METHOD - Added for table card integration
     */
    printTableCardsAndStart() {
        // Check if table card generator is available
        if (typeof tableCardGenerator === 'undefined') {
            this.bridgeApp.showMessage('⚠️ Table card generator not loaded. Starting tournament...', 'warning');
            this.setupBoards();
            this.inputState = 'board_selection';
            return;
        }
        
        // Generate and open table cards in new window
        tableCardGenerator.generateTableCards(this.session.movement);
        
        // Show success message
        this.bridgeApp.showMessage('✅ Table cards ready! Print them and set up your tables', 'success');
        
        // Auto-start tournament after brief pause
        setTimeout(() => {
            this.setupBoards();
            this.inputState = 'board_selection';
            this.updateDisplay();
        }, 2000);
    }

    /**
     * Handle board selection actions
     */
    handleBoardSelection(value) {
        if (value === 'DEAL') {
            if (this.areAllBoardsComplete()) {
                this.showFinalStandings();
            } else {
                this.bridgeApp.showMessage('Complete all boards before viewing results', 'warning');
            }
        }
    }

    /**
     * Handle results display actions
     */
    handleResults(value) {
        // Results state actions handled here
    }

    /**
     * Open traveler popup
     */
    openTravelerPopup(boardNumber = null) {
        if (this.traveler.isActive) {
            return;
        }
        
        if (boardNumber) {
            this.openSpecificTraveler(boardNumber);
        } else {
            this.showBoardSelectorPopup();
        }
    }

    /**
     * Open specific traveler for a board using button system
     */
    openSpecificTraveler(boardNumber) {
        this.traveler.isActive = true;
        this.traveler.boardNumber = boardNumber;
        this.traveler.data = this.generateTravelerRows(boardNumber);
        this.currentResultIndex = 0;
        
        this.initializeTravelerResult();
    }

    /**
     * Generate traveler rows based on movement
     */
    generateTravelerRows(boardNumber) {
        const instances = this.session.movement.movement.filter(entry => 
            entry.boards && entry.boards.includes(boardNumber)
        );
        
        return instances.map((instance) => ({
            nsPair: instance.ns,
            ewPair: instance.ew,
            level: null,
            suit: null,
            declarer: null,
            double: '',
            result: null,
            nsScore: null,
            ewScore: null,
            matchpoints: { ns: 0, ew: 0 },
            isComplete: false
        }));
    }

    /**
     * Initialize traveler result entry state
     */
    initializeTravelerResult() {
        this.travelerInputState = 'level_selection';
        this.resultMode = null;
        this.inputState = 'traveler_entry';
        this.updateDisplay();
    }
// END SECTION TWO
// SECTION THREE
/**
     * Show board selector popup with mobile scrolling fixes
     */
    showBoardSelectorPopup() {
        const popup = document.createElement('div');
        popup.id = 'boardSelectorPopup';
        popup.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
            background: rgba(0,0,0,0.8); z-index: 1000; 
            display: flex; align-items: center; justify-content: center;
            -webkit-overflow-scrolling: touch;
        `;
        
        popup.innerHTML = `
            <div style="
                background: white; 
                padding: 20px; 
                border-radius: 8px; 
                max-width: 90%; 
                max-height: 85%; 
                overflow: hidden; 
                color: #2c3e50;
                min-width: 280px;
                display: flex;
                flex-direction: column;
            ">
                <h3 style="text-align: center; margin: 0 0 15px 0; color: #2c3e50;">Select Board</h3>
                
                <div id="boardListContainer" style="
                    height: 350px;
                    overflow-y: scroll;
                    overflow-x: hidden;
                    -webkit-overflow-scrolling: touch;
                    margin: 15px 0;
                    border: 1px solid #bdc3c7;
                    border-radius: 6px;
                    background: rgba(255,255,255,0.95);
                    transform: translateZ(0);
                    will-change: scroll-position;
                    position: relative;
                ">
                    ${this.getBoardListHTML()}
                </div>
                
                <div style="text-align: center; margin-top: 15px; display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;">
                    <button id="cancelBoardBtn" style="
                        background: #e74c3c; 
                        color: white; 
                        border: none; 
                        padding: 12px 20px; 
                        border-radius: 6px; 
                        min-height: 44px; 
                        font-size: 14px; 
                        cursor: pointer;
                        font-weight: bold;
                        min-width: 120px;
                        touch-action: manipulation;
                        user-select: none;
                    ">Cancel</button>
                    
                    <button id="refreshScrollBtn" style="
                        background: #3498db; 
                        color: white; 
                        border: none; 
                        padding: 12px 20px; 
                        border-radius: 6px; 
                        min-height: 44px; 
                        font-size: 14px; 
                        cursor: pointer;
                        font-weight: bold;
                        min-width: 120px;
                        touch-action: manipulation;
                        user-select: none;
                    ">Fix Scroll</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(popup);
        
        setTimeout(() => {
            this.setupBoardListEvents();
            this.applyBoardListScrollingFixes();
        }, 100);
    }

    /**
     * Generate board list HTML with status display
     */
    getBoardListHTML() {
        let html = '';
        
        for (let i = 1; i <= this.session.movement.totalBoards; i++) {
            const board = this.session.boards[i];
            const statusIcon = board.completed ? '✅' : '⭕';
            const vulnerability = board.vulnerability;
            const vulnDisplay = { 'None': 'None', 'NS': 'NS', 'EW': 'EW', 'Both': 'All' };
            const vulnColor = this.getVulnerabilityColor(vulnerability);
            
            const resultStatus = board.hasResults ? 
                `${board.resultCount || 0} results entered` : 
                'No results yet';
            
            html += `
                <div class="board-list-item" data-board="${i}" style="
                    background: ${board.completed ? 'rgba(39, 174, 96, 0.1)' : 'rgba(52, 152, 219, 0.1)'};
                    border: 2px solid ${board.completed ? '#27ae60' : '#3498db'};
                    border-radius: 8px;
                    padding: 12px;
                    margin: 8px;
                    cursor: pointer;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    min-height: 50px;
                    transition: all 0.2s ease;
                    touch-action: manipulation;
                    user-select: none;
                    -webkit-tap-highlight-color: transparent;
                " onmouseover="this.style.transform='scale(1.02)'" onmouseout="this.style.transform=''">
                    <div style="flex: 1;">
                        <div style="font-weight: bold; font-size: 16px; color: #2c3e50;">
                            Board ${i} ${statusIcon}
                        </div>
                        <div style="font-size: 12px; color: #7f8c8d;">
                            ${resultStatus}
                        </div>
                    </div>
                    <div style="
                        background: ${vulnColor};
                        color: white;
                        padding: 6px 12px;
                        border-radius: 20px;
                        font-size: 12px;
                        font-weight: bold;
                        min-width: 50px;
                        text-align: center;
                    ">
                        ${vulnDisplay[vulnerability]}
                    </div>
                </div>
            `;
        }
        
        return html;
    }

    /**
     * Setup board list touch events with scroll/tap discrimination
     */
    setupBoardListEvents() {
        const boardItems = document.querySelectorAll('.board-list-item');
        const cancelBtn = document.getElementById('cancelBoardBtn');
        const refreshBtn = document.getElementById('refreshScrollBtn');
        
        // Board item handlers with scroll/tap discrimination
        boardItems.forEach(item => {
            const boardNumber = parseInt(item.dataset.board);
            
            let touchStartTime = 0;
            let touchStartY = 0;
            let touchStartX = 0;
            let hasMoved = false;
            const MOVE_THRESHOLD = 10;
            const TAP_MAX_DURATION = 500;
            
            const selectHandler = (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                item.style.transform = 'scale(0.98)';
                item.style.opacity = '0.8';
                
                setTimeout(() => {
                    item.style.transform = '';
                    item.style.opacity = '';
                    
                    this.closeBoardSelector();
                    setTimeout(() => {
                        this.openSpecificTraveler(boardNumber);
                    }, 100);
                }, 150);
            };
            
            item.addEventListener('touchstart', (e) => {
                touchStartTime = Date.now();
                touchStartY = e.touches[0].clientY;
                touchStartX = e.touches[0].clientX;
                hasMoved = false;
                
                item.style.transform = 'scale(0.98)';
                item.style.opacity = '0.8';
            }, { passive: false });
            
            item.addEventListener('touchmove', (e) => {
                const currentY = e.touches[0].clientY;
                const currentX = e.touches[0].clientX;
                const moveY = Math.abs(currentY - touchStartY);
                const moveX = Math.abs(currentX - touchStartX);
                
                if (moveY > MOVE_THRESHOLD || moveX > MOVE_THRESHOLD) {
                    hasMoved = true;
                    item.style.transform = '';
                    item.style.opacity = '';
                }
            }, { passive: true });
            
            item.addEventListener('touchend', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                const touchDuration = Date.now() - touchStartTime;
                
                item.style.transform = '';
                item.style.opacity = '';
                
                if (!hasMoved && touchDuration < TAP_MAX_DURATION) {
                    selectHandler(e);
                }
            }, { passive: false });
            
            item.addEventListener('touchcancel', () => {
                item.style.transform = '';
                item.style.opacity = '';
                hasMoved = false;
            }, { passive: true });
            
            item.addEventListener('click', selectHandler);
        });
        
        // Cancel button
        if (cancelBtn) {
            const cancelHandler = (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.closeBoardSelector();
            };
            
            cancelBtn.addEventListener('click', cancelHandler);
            cancelBtn.addEventListener('touchend', cancelHandler, { passive: false });
        }
        
        // Refresh scroll button
        if (refreshBtn) {
            const refreshHandler = (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.refreshBoardListScroll();
            };
            
            refreshBtn.addEventListener('click', refreshHandler);
            refreshBtn.addEventListener('touchend', refreshHandler, { passive: false });
        }
    }

    /**
     * Apply mobile scrolling fixes
     */
    applyBoardListScrollingFixes() {
        if (!this.isMobile) return;
        
        const container = document.getElementById('boardListContainer');
        const modal = document.querySelector('#boardSelectorPopup > div');
        
        if (container && modal) {
            modal.style.maxHeight = '90vh';
            modal.style.display = 'flex';
            modal.style.flexDirection = 'column';
            modal.style.overflow = 'hidden';
            
            container.style.height = '350px';
            container.style.overflowY = 'scroll';
            container.style.overflowX = 'hidden';
            container.style.webkitOverflowScrolling = 'touch';
            container.style.transform = 'translateZ(0)';
            container.style.willChange = 'scroll-position';
            container.style.overflowAnchor = 'none';
            container.style.position = 'relative';
        }
    }

    /**
     * Refresh board list scroll
     */
    refreshBoardListScroll() {
        const container = document.getElementById('boardListContainer');
        if (container) {
            container.style.border = '2px solid #27ae60';
            container.style.transition = 'border-color 0.3s ease';
            
            container.scrollTop = container.scrollHeight;
            setTimeout(() => {
                container.scrollTop = 0;
            }, 100);
            
            container.style.overflowY = 'scroll';
            container.style.webkitOverflowScrolling = 'touch';
            container.style.transform = 'translateZ(0)';
            container.style.willChange = 'scroll-position';
            
            setTimeout(() => {
                container.style.border = '1px solid #bdc3c7';
            }, 600);
        }
    }

    /**
     * Close board selector popup
     */
    closeBoardSelector() {
        const popup = document.getElementById('boardSelectorPopup');
        if (popup) {
            popup.remove();
        }
    }

    /**
     * Get vulnerability color for display
     */
    getVulnerabilityColor(vulnerability) {
        const colors = {
            'None': '#95a5a6',
            'NS': '#27ae60',
            'EW': '#e74c3c',
            'Both': '#f39c12'
        };
        return colors[vulnerability] || '#95a5a6';
    }
// END SECTION THREE
// SECTION FOUR
/**
     * Handle traveler input using Chicago Bridge style
     */
    handleTravelerInput(value) {
        if (!this.traveler.isActive || !this.traveler.data || this.currentResultIndex >= this.traveler.data.length) {
            this.closeTraveler();
            return;
        }
        
        if (value === 'BACK') {
            this.handleTravelerBack();
            return;
        }
        
        const currentResult = this.traveler.data[this.currentResultIndex];
        
        if (!currentResult) {
            this.closeTraveler();
            return;
        }
        
        try {
            switch (this.travelerInputState) {
                case 'level_selection':
                    this.handleTravelerLevelSelection(value, currentResult);
                    break;
                case 'suit_selection':
                    this.handleTravelerSuitSelection(value, currentResult);
                    break;
                case 'declarer_selection':
                    this.handleTravelerDeclarerSelection(value, currentResult);
                    break;
                case 'double_selection':
                    this.handleTravelerDoubleSelection(value, currentResult);
                    break;
                case 'result_type_selection':
                    this.handleTravelerResultTypeSelection(value, currentResult);
                    break;
                case 'result_number_selection':
                    this.handleTravelerResultNumberSelection(value, currentResult);
                    break;
                case 'result_complete':
                    this.handleTravelerResultComplete(value);
                    break;
            }
            
            setTimeout(() => {
                this.updateDisplay();
            }, 10);
            
        } catch (error) {
            this.closeTraveler();
        }
    }

    /**
     * Handle level selection in traveler (1-7)
     */
    handleTravelerLevelSelection(value, currentResult) {
        if (['1', '2', '3', '4', '5', '6', '7'].includes(value)) {
            currentResult.level = parseInt(value);
            this.travelerInputState = 'suit_selection';
        }
    }

    /**
     * Handle suit selection in traveler
     */
    handleTravelerSuitSelection(value, currentResult) {
        if (['♣', '♦', '♥', '♠', 'NT'].includes(value)) {
            currentResult.suit = value;
            this.travelerInputState = 'declarer_selection';
        }
    }

    /**
     * Handle declarer selection in traveler
     */
    handleTravelerDeclarerSelection(value, currentResult) {
        if (['N', 'S', 'E', 'W'].includes(value)) {
            currentResult.declarer = value;
            this.travelerInputState = 'double_selection';
        }
    }

    /**
     * Handle double selection
     */
    handleTravelerDoubleSelection(value, currentResult) {
        if (value === 'X') {
            this.handleTravelerDoubling(currentResult);
        } else if (['MADE', 'PLUS', 'DOWN'].includes(value)) {
            this.travelerInputState = 'result_type_selection';
            this.handleTravelerResultTypeSelection(value, currentResult);
        }
    }

    /**
     * Handle doubling in traveler (X/XX cycling)
     */
    handleTravelerDoubling(currentResult) {
        if (currentResult.double === '') {
            currentResult.double = 'X';
        } else if (currentResult.double === 'X') {
            currentResult.double = 'XX';
        } else {
            currentResult.double = '';
        }
    }

    /**
     * Handle result type selection (Made/Plus/Down)
     */
    handleTravelerResultTypeSelection(value, currentResult) {
        if (value === 'MADE') {
            currentResult.result = '=';
            this.calculateTravelerScore(this.currentResultIndex);
            currentResult.isComplete = true;
            this.travelerInputState = 'result_complete';
            
        } else if (value === 'DOWN') {
            this.resultMode = 'down';
            this.travelerInputState = 'result_number_selection';
            
        } else if (value === 'PLUS') {
            this.resultMode = 'plus';
            this.travelerInputState = 'result_number_selection';
        }
    }

    /**
     * Handle result number selection (overtricks/undertricks)
     */
    handleTravelerResultNumberSelection(value, currentResult) {
        if (['1', '2', '3', '4', '5', '6', '7'].includes(value)) {
            const num = parseInt(value);
            
            if (this.resultMode === 'down') {
                currentResult.result = `-${num}`;
                
            } else if (this.resultMode === 'plus') {
                const maxOvertricks = 13 - (6 + currentResult.level);
                if (num <= maxOvertricks) {
                    currentResult.result = `+${num}`;
                } else {
                    return;
                }
            }
            
            this.calculateTravelerScore(this.currentResultIndex);
            currentResult.isComplete = true;
            this.travelerInputState = 'result_complete';
        }
    }

    /**
     * Handle result complete actions
     */
    handleTravelerResultComplete(value) {
        if (value === 'DEAL') {
            this.nextTravelerResult();
        }
    }

    /**
     * Move to next traveler result
     */
    nextTravelerResult() {
        if (this.currentResultIndex < this.traveler.data.length - 1) {
            this.currentResultIndex++;
            this.travelerInputState = 'level_selection';
            this.resultMode = null;
        } else {
            this.saveTravelerData();
        }
    }

    /**
     * Get active buttons for traveler input
     */
    getTravelerActiveButtons() {
        const currentResult = this.traveler.data[this.currentResultIndex];
        
        switch (this.travelerInputState) {
            case 'level_selection':
                return ['1', '2', '3', '4', '5', '6', '7'];
                
            case 'suit_selection':
                return ['♣', '♦', '♥', '♠', 'NT'];
                
            case 'declarer_selection':
                return ['N', 'S', 'E', 'W'];
                
            case 'double_selection':
                return ['X', 'MADE', 'PLUS', 'DOWN'];
                
            case 'result_type_selection':
                return ['MADE', 'PLUS', 'DOWN'];
                
            case 'result_number_selection':
                if (this.resultMode === 'down') {
                    return ['1', '2', '3', '4', '5', '6', '7'];
                } else if (this.resultMode === 'plus') {
                    const maxOvertricks = Math.min(6, 13 - (6 + currentResult.level));
                    const buttons = [];
                    for (let i = 1; i <= maxOvertricks; i++) {
                        buttons.push(i.toString());
                    }
                    return buttons;
                }
                break;
                
            case 'result_complete':
                return ['DEAL'];
                
            default:
                return [];
        }
    }

    /**
     * Handle traveler back navigation
     */
    handleTravelerBack() {
        const currentResult = this.traveler.data[this.currentResultIndex];
        
        if (!currentResult) {
            this.closeTraveler();
            return;
        }
        
        switch (this.travelerInputState) {
            case 'suit_selection':
                this.travelerInputState = 'level_selection';
                currentResult.level = null;
                break;
                
            case 'declarer_selection':
                this.travelerInputState = 'suit_selection';
                currentResult.suit = null;
                break;
                
            case 'double_selection':
                this.travelerInputState = 'declarer_selection';
                currentResult.declarer = null;
                currentResult.double = '';
                break;
                
            case 'result_type_selection':
                this.travelerInputState = 'double_selection';
                break;
                
            case 'result_number_selection':
                this.travelerInputState = 'result_type_selection';
                this.resultMode = null;
                break;
                
            case 'result_complete':
                this.travelerInputState = 'result_type_selection';
                currentResult.result = null;
                currentResult.nsScore = null;
                currentResult.ewScore = null;
                currentResult.isComplete = false;
                this.resultMode = null;
                break;
                
            case 'level_selection':
                if (this.currentResultIndex > 0) {
                    this.previousTravelerResult();
                } else {
                    this.closeTraveler();
                }
                break;
                
            default:
                this.closeTraveler();
        }
        
        setTimeout(() => {
            this.updateDisplay();
        }, 50);
    }

    /**
     * Go to previous traveler result
     */
    previousTravelerResult() {
        if (this.currentResultIndex > 0) {
            this.currentResultIndex--;
            
            const currentResult = this.traveler.data[this.currentResultIndex];
            
            if (!currentResult) {
                this.closeTraveler();
                return;
            }
            
            if (currentResult.isComplete) {
                this.travelerInputState = 'result_complete';
            } else if (currentResult.result !== null) {
                if (currentResult.result.startsWith('+') || currentResult.result.startsWith('-')) {
                    this.travelerInputState = 'result_number_selection';
                    this.resultMode = currentResult.result.startsWith('+') ? 'plus' : 'down';
                } else {
                    this.travelerInputState = 'result_type_selection';
                }
            } else if (currentResult.declarer) {
                this.travelerInputState = 'double_selection';
            } else if (currentResult.suit) {
                this.travelerInputState = 'declarer_selection';
            } else if (currentResult.level) {
                this.travelerInputState = 'suit_selection';
            } else {
                this.travelerInputState = 'level_selection';
            }
        }
    }
// END SECTION FOUR
// SECTION FIVE
/**
     * Calculate score for a specific traveler row - Standard Duplicate Scoring
     */
    calculateTravelerScore(rowIndex) {
        const row = this.traveler.data[rowIndex];
        if (!row.level || !row.suit || !row.declarer || !row.result) return;
        
        const vulnerability = this.getBoardVulnerability(this.traveler.boardNumber);
        const declarerSide = ['N', 'S'].includes(row.declarer) ? 'NS' : 'EW';
        const isVulnerable = this.isDeclarerVulnerable(this.traveler.boardNumber, row.declarer);
        
        const level = parseInt(row.level);
        const isDoubled = row.double === 'X';
        const isRedoubled = row.double === 'XX';
        
        let score = 0;
        
        // Parse result (=, +1, +2, -1, -2, etc.)
        if (row.result === '=' || row.result.startsWith('+')) {
            // Contract made
            const suitPoints = { '♣': 20, '♦': 20, '♥': 30, '♠': 30, 'NT': 30 };
            let basicScore = level * suitPoints[row.suit];
            if (row.suit === 'NT') basicScore += 10; // NT first trick bonus
            
            // Apply doubling to basic score
            if (isDoubled || isRedoubled) {
                basicScore *= (isRedoubled ? 4 : 2);
            }
            
            score = basicScore;
            
            // Add overtricks
            if (row.result.startsWith('+')) {
                const overtricks = parseInt(row.result.substring(1));
                if (isDoubled || isRedoubled) {
                    const overtrickValue = isVulnerable ? 200 : 100;
                    score += overtricks * overtrickValue * (isRedoubled ? 2 : 1);
                } else {
                    score += overtricks * suitPoints[row.suit];
                }
            }
            
            // Game bonus
            if (basicScore >= 100) {
                score += isVulnerable ? 500 : 300;
            } else {
                score += 50; // Part-game bonus
            }
            
            // Double bonus
            if (isDoubled) score += 50;
            if (isRedoubled) score += 100;
            
            // Slam bonuses
            if (level === 6) { // Small slam
                score += isVulnerable ? 750 : 500;
            } else if (level === 7) { // Grand slam
                score += isVulnerable ? 1500 : 1000;
            }
            
        } else if (row.result.startsWith('-')) {
            // Contract failed
            const undertricks = parseInt(row.result.substring(1));
            
            if (isDoubled || isRedoubled) {
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
                score = -penalty * (isRedoubled ? 2 : 1);
            } else {
                score = -(undertricks * (isVulnerable ? 100 : 50));
            }
        }
        
        // Assign scores to pairs
        if (declarerSide === 'NS') {
            if (score >= 0) {
                row.nsScore = score;
                row.ewScore = 0;
            } else {
                row.nsScore = 0;
                row.ewScore = Math.abs(score);
            }
        } else {
            if (score >= 0) {
                row.ewScore = score;
                row.nsScore = 0;
            } else {
                row.ewScore = 0;
                row.nsScore = Math.abs(score);
            }
        }
    }

    /**
     * Calculate matchpoints for all pairs on this board
     */
    calculateMatchpoints() {
        const completedResults = this.traveler.data.filter(row => 
            row.nsScore !== null && row.ewScore !== null
        );
        
        if (completedResults.length < 2) {
            return;
        }
        
        // Calculate NS matchpoints by comparing NS scores
        completedResults.forEach(row => {
            let nsMatchpoints = 0;
            let ewMatchpoints = 0;
            
            completedResults.forEach(otherRow => {
                if (row !== otherRow) {
                    // Compare NS scores (higher is better)
                    if (row.nsScore > otherRow.nsScore) {
                        nsMatchpoints += 2;
                    } else if (row.nsScore === otherRow.nsScore) {
                        nsMatchpoints += 1;
                        ewMatchpoints += 1;
                    } else {
                        ewMatchpoints += 2;
                    }
                }
            });
            
            row.matchpoints = { ns: nsMatchpoints, ew: ewMatchpoints };
        });
    }

    /**
     * Save traveler data and close
     */
    saveTravelerData() {
        // Calculate matchpoints for all results
        this.calculateMatchpoints();
        
        // Mark board as completed if at least one result is entered
        const hasResults = this.traveler.data.some(row => 
            row.nsScore !== null || row.ewScore !== null
        );
        
        if (hasResults) {
            this.session.boards[this.traveler.boardNumber].completed = true;
            this.session.boards[this.traveler.boardNumber].results = [...this.traveler.data];
            this.session.boards[this.traveler.boardNumber].hasResults = true;
            this.session.boards[this.traveler.boardNumber].resultCount = this.traveler.data.filter(r => r.isComplete).length;
            
            this.bridgeApp.showMessage(`Board ${this.traveler.boardNumber} saved!`, 'success');
        } else {
            this.bridgeApp.showMessage('Enter at least one result before saving', 'warning');
        }
        
        this.closeTraveler();
    }

    /**
     * Close traveler and return to board selection
     */
    closeTraveler() {
        try {
            this.traveler.isActive = false;
            this.traveler.boardNumber = null;
            this.traveler.data = [];
            this.currentResultIndex = 0;
            this.travelerInputState = 'level_selection';
            this.resultMode = null;
            
            this.inputState = 'board_selection';
            
            setTimeout(() => {
                try {
                    this.updateDisplay();
                } catch (displayError) {
                    const display = document.getElementById('display');
                    if (display) {
                        display.innerHTML = '<div class="current-state">Returning to board selection...</div>';
                    }
                }
            }, 50);
            
        } catch (error) {
            this.traveler = {
                isActive: false,
                boardNumber: null,
                data: []
            };
            this.inputState = 'board_selection';
            
            setTimeout(() => {
                this.updateDisplay();
            }, 100);
        }
    }

    /**
     * Get current traveler progress info
     */
    getCurrentTravelerProgress() {
        if (!this.traveler.isActive) return null;
        
        const current = this.currentResultIndex + 1;
        const total = this.traveler.data.length;
        const currentResult = this.traveler.data[this.currentResultIndex];
        
        return {
            current: current,
            total: total,
            nsPair: currentResult.nsPair,
            ewPair: currentResult.ewPair,
            isComplete: currentResult.isComplete,
            contractSoFar: this.getTravelerContractDisplay(currentResult)
        };
    }

    /**
     * Get contract display for current traveler result
     */
    getTravelerContractDisplay(result) {
        let contract = '';
        
        if (result.level) contract += result.level;
        if (result.suit) contract += result.suit;
        if (result.double) contract += ` ${result.double}`;
        if (result.declarer) contract += ` by ${result.declarer}`;
        if (result.result) contract += ` ${result.result}`;
        
        return contract || 'No contract yet';
    }

    /**
     * Get scoring summary for current traveler result
     */
    getTravelerScoringSummary() {
        if (!this.traveler.isActive) return null;
        
        const currentResult = this.traveler.data[this.currentResultIndex];
        const vulnerability = this.getBoardVulnerability(this.traveler.boardNumber);
        
        return {
            boardNumber: this.traveler.boardNumber,
            vulnerability: vulnerability,
            vulnerabilityDisplay: this.getVulnerabilityDisplay(vulnerability),
            currentResult: currentResult,
            scores: {
                ns: currentResult.nsScore,
                ew: currentResult.ewScore
            },
            isComplete: currentResult.isComplete
        };
    }

    /**
     * Get vulnerability display text
     */
    getVulnerabilityDisplay(vulnerability) {
        const displays = {
            'None': 'None Vulnerable',
            'NS': 'NS Vulnerable', 
            'EW': 'EW Vulnerable',
            'Both': 'Both Vulnerable'
        };
        return displays[vulnerability] || 'Unknown';
    }

    /**
     * Show movement popup with mobile-optimized table - PIXEL 9A FIXED VERSION
     */
    showMovementPopup() {
        const movement = this.session.movement;
        
        // Check if Skip Mitchell
        const isSkipMitchell = movement.type === 'mitchell' && movement.tables % 2 === 0;
        const skipRound = isSkipMitchell ? Math.floor(movement.tables / 2) + 1 : null;
        
        // Build skip warning
        let skipWarning = '';
        if (isSkipMitchell) {
            skipWarning = `
                <div style="background: #fff3cd; padding: 12px; border-radius: 6px; border: 2px solid #ffc107; margin: 15px 0;">
                    <div style="text-align: center; font-size: 16px; font-weight: 800; color: #856404; margin-bottom: 8px;">
                        ⚠️ SKIP MITCHELL - ROUND ${skipRound} ⚠️
                    </div>
                    <div style="font-size: 13px; color: #856404; text-align: center;">
                        EW pairs skip an extra table in Round ${skipRound}
                    </div>
                </div>
            `;
        }
        
        const popup = document.createElement('div');
        popup.id = 'movementPopup';
        popup.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
            background: rgba(0,0,0,0.85); z-index: 1000; 
            display: flex; align-items: center; justify-content: center;
            -webkit-overflow-scrolling: touch;
        `;
        
        popup.innerHTML = `
            <div style="
                background: white; 
                padding: 20px; 
                border-radius: 8px; 
                max-width: 95%; 
                max-height: 85%; 
                overflow: auto; 
                color: #2c3e50;
                -webkit-overflow-scrolling: touch;
            ">
                <div style="text-align: center; margin-bottom: 20px; position: sticky; top: 0; background: white; z-index: 10;">
                    <h3 style="margin: 0; color: #2c3e50;">${movement.description}</h3>
                    <div style="color: #7f8c8d; font-size: 14px; margin-top: 5px;">
                        ${movement.pairs} pairs • ${movement.tables} tables • ${movement.rounds} rounds
                    </div>
                </div>
                
                ${skipWarning}
                
                ${this.getMovementTableHTML()}
                
                <div style="
                    display: flex; 
                    justify-content: center; 
                    align-items: center;
                    gap: 15px; 
                    margin-top: 20px; 
                    position: sticky; 
                    bottom: 0; 
                    background: white; 
                    padding: 15px 0;
                    flex-wrap: nowrap;
                ">
                    <button id="movement-close-btn" style="
                        background: #3498db; 
                        color: white; 
                        border: none; 
                        padding: 10px 16px; 
                        border-radius: 6px;
                        font-size: 13px; 
                        cursor: pointer; 
                        font-weight: bold;
                        min-height: 50px; 
                        width: 110px;
                        touch-action: manipulation; 
                        user-select: none;
                        -webkit-tap-highlight-color: transparent;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    ">Close</button>
                    <button id="movement-confirm-btn" style="
                        background: #27ae60; 
                        color: white; 
                        border: none; 
                        padding: 10px 16px; 
                        border-radius: 6px;
                        font-size: 13px; 
                        cursor: pointer; 
                        font-weight: bold;
                        min-height: 50px; 
                        width: 110px;
                        touch-action: manipulation; 
                        user-select: none;
                        -webkit-tap-highlight-color: transparent;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    ">Start</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(popup);
        
        // Setup Pixel 9a compatible handlers after DOM insertion
        setTimeout(() => {
            this.setupMovementPopupHandlers();
        }, 100);
    }

    /**
     * Setup movement popup handlers using Pixel 9a compatible pattern
     */
    setupMovementPopupHandlers() {
        // Create unified handler factory
        const createPixelHandler = (action) => {
            return (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log(`Pixel 9a movement action: ${action}`);
                
                // Visual feedback
                const btn = e.target;
                btn.style.transform = 'scale(0.95)';
                btn.style.opacity = '0.8';
                
                // Haptic feedback for mobile
                if (navigator.vibrate) {
                    navigator.vibrate([30]);
                }
                
                // Execute action after feedback
                setTimeout(() => {
                    this.executeMovementAction(action);
                    
                    // Reset visual feedback
                    btn.style.transform = 'scale(1)';
                    btn.style.opacity = '1';
                }, 100);
            };
        };
        
        // Setup close button
        const closeBtn = document.getElementById('movement-close-btn');
        if (closeBtn) {
            const closeHandler = createPixelHandler('close');
            closeBtn.addEventListener('click', closeHandler, { passive: false });
            closeBtn.addEventListener('touchend', closeHandler, { passive: false });
            
            // Add touch start feedback
            closeBtn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                closeBtn.style.transform = 'scale(0.95)';
                closeBtn.style.opacity = '0.8';
            }, { passive: false });
        }
        
        // Setup confirm button
        const confirmBtn = document.getElementById('movement-confirm-btn');
        if (confirmBtn) {
            const confirmHandler = createPixelHandler('confirm');
            confirmBtn.addEventListener('click', confirmHandler, { passive: false });
            confirmBtn.addEventListener('touchend', confirmHandler, { passive: false });
            
            // Add touch start feedback
            confirmBtn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                confirmBtn.style.transform = 'scale(0.95)';
                confirmBtn.style.opacity = '0.8';
            }, { passive: false });
        }
    }

    /**
     * Execute movement popup actions
     */
    executeMovementAction(action) {
        const popup = document.getElementById('movementPopup');
        if (popup) {
            popup.remove();
        }
        
        if (action === 'confirm') {
            // Trigger the confirm action
            this.handleAction('2');
        }
        // 'close' action just closes the popup (already done above)
    }

    /**
     * Show templates using external template generator
     */
    showTemplates(type) {
        if (typeof window.DuplicateTemplates !== 'undefined') {
            const templateGenerator = new DuplicateTemplates();
            if (type === 'board') {
                templateGenerator.showBoardTemplates();
            } else if (type === 'traveler') {
                templateGenerator.showTravelerTemplates();
            }
        } else {
            this.bridgeApp.showMessage('Template generator not available. Please load duplicateTemplates.js', 'warning');
        }
    }

    /**
     * Show help - COMPLETE PIXEL 9A FIX - PRIMARY VERSION
     */
    showHelp() {
        try {
            // Create the help popup directly instead of using bridgeApp.showModal
            const popup = document.createElement('div');
            popup.id = 'duplicateHelpPopup';
            popup.style.cssText = `
                position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
                background: rgba(0,0,0,0.8); z-index: 1000; 
                display: flex; align-items: center; justify-content: center;
                -webkit-overflow-scrolling: touch;
            `;
            
            popup.innerHTML = `
                <div style="
                    background: white; 
                    padding: 20px; 
                    border-radius: 8px; 
                    max-width: 90%; 
                    max-height: 90%; 
                    overflow: hidden; 
                    color: #2c3e50;
                    display: flex;
                    flex-direction: column;
                ">
                    <div style="text-align: center; margin-bottom: 15px;">
                        <h3 style="margin: 0; color: #2c3e50;">Duplicate Bridge Help</h3>
                    </div>
                    
                    <div id="help-scroll-container" style="
                        height: 400px;
                        overflow-y: scroll;
                        overflow-x: hidden;
                        -webkit-overflow-scrolling: touch;
                        transform: translateZ(0);
                        will-change: scroll-position;
                        overscroll-behavior: contain;
                        border: 1px solid #bdc3c7;
                        border-radius: 6px;
                        padding: 15px;
                        margin-bottom: 15px;
                        background: rgba(255,255,255,0.98);
                    ">
                        <div class="help-section" style="margin-bottom: 20px;">
                            <h4 style="color: #2c3e50; margin-bottom: 10px;">What is Duplicate Bridge?</h4>
                            <p style="line-height: 1.5;"><strong>Duplicate Bridge</strong> is the tournament form of bridge where multiple pairs play the same deals, allowing direct comparison of results. This creates fair competition by eliminating the luck of the cards.</p>
                        </div>
                        
                        <div class="help-section" style="margin-bottom: 20px;">
                            <h4 style="color: #2c3e50; margin-bottom: 10px;">Quick Start Guide</h4>
                            <p style="line-height: 1.5;"><strong>1. Setup:</strong> Select number of pairs (4-14)<br>
                            • Use number buttons: Single digit (4-9) or two digits (1→0, 1→2, 1→4)<br>
                            • Review movement details and confirm<br>
                            • Supports Howell movements (2-5 tables) and Mitchell (6-7 tables)</p>
                            
                            <p style="line-height: 1.5;"><strong>2. Printing (Option 4):</strong> Access Print Menu for:<br>
                            • 📋 Table Movement Cards (3 per page, color)<br>
                            • 📊 Traveler Sheets (pre-filled)<br>
                            • 🎴 Board Slips (printable)<br>
                            • 📑 Movement Sheets (detailed grid)</p>
                            
                            <p style="line-height: 1.5;"><strong>3. Tournament Setup:</strong><br>
                            • Print table cards and place at each table<br>
                            • Set up boards with traveler sheets<br>
                            • Players complete travelers after each round</p>
                            
                            <p style="line-height: 1.5;"><strong>4. Scoring:</strong><br>
                            • Collect completed travelers<br>
                            • Enter results for each board<br>
                            • View final standings when complete</p>
                        </div>
                        
                        <div class="help-section" style="margin-bottom: 20px;">
                            <h4 style="color: #2c3e50; margin-bottom: 10px;">Available Movements</h4>
                            <p style="line-height: 1.5;"><strong>Howell Movements:</strong> All pairs play each other<br>
                            • 4 pairs (2 tables) - 12 boards, 6 rounds<br>
                            • 5 pairs (2.5 tables) - 15 boards, 5 rounds ⚠️<br>
                            • 6 pairs (3 tables) - 15 boards, 5 rounds<br>
                            • 7 pairs (3.5 tables) - 14 boards, 7 rounds ⚠️<br>
                            • 8 pairs (4 tables) - 14 boards, 7 rounds<br>
                            • 9 pairs (4.5 tables) - 18 boards, 9 rounds ⚠️<br>
                            • 10 pairs (5 tables) - 18 boards, 9 rounds</p>
                            
                            <p style="line-height: 1.5;"><strong>Mitchell Movements:</strong> NS stay, EW move<br>
                            • 12 pairs (6 tables) - 18 boards, 6 rounds - Skip Mitchell<br>
                            • 14 pairs (7 tables) - 21 boards, 7 rounds - Standard Mitchell</p>
                            
                            <p style="line-height: 1.5;">⚠️ = Movement includes sit-out rounds</p>
                        </div>
                        
                        <div class="help-section" style="margin-bottom: 20px;">
                            <h4 style="color: #2c3e50; margin-bottom: 10px;">Skip Mitchell Movement</h4>
                            <p style="line-height: 1.5;"><strong>For 6-table Mitchell (12 pairs):</strong><br>
                            • Round 4 is the <strong>SKIP ROUND</strong><br>
                            • EW pairs skip an extra table in Round 4<br>
                            • This ensures all pairs play each other exactly once<br>
                            • Watch for the yellow warning box when selecting 12 pairs!</p>
                        </div>
                        
                        <div class="help-section" style="margin-bottom: 20px;">
                            <h4 style="color: #2c3e50; margin-bottom: 10px;">Traveler Entry</h4>
                            <p style="line-height: 1.5;">Follow the button sequence to enter each contract:<br>
                            <strong>Level → Suit → Declarer → Double (optional) → Result</strong></p>
                            <ul style="margin: 10px 0; padding-left: 20px;">
                                <li>"Made" = contract exactly made</li>
                                <li>"Plus" = overtricks (select number)</li>
                                <li>"Down" = undertricks (select number)</li>
                            </ul>
                        </div>
                        
                        <div class="help-section" style="margin-bottom: 20px;">
                            <h4 style="color: #2c3e50; margin-bottom: 10px;">Scoring System</h4>
                            <p style="line-height: 1.5;"><strong>Matchpoints:</strong> Compare your result to others on same board<br>
                            • Beat another pair = 2 matchpoints<br>
                            • Tie with another pair = 1 matchpoint each<br>
                            • Lose to another pair = 0 matchpoints</p>
                            <p style="line-height: 1.5;"><strong>Percentage:</strong> Your matchpoints ÷ maximum possible × 100</p>
                            <p style="line-height: 1.5;"><strong>Mitchell Movements:</strong> Separate winners for NS and EW</p>
                        </div>
                        
                        <div class="help-section" style="margin-bottom: 20px;">
                            <h4 style="color: #2c3e50; margin-bottom: 10px;">Mobile Tips</h4>
                            <p style="line-height: 1.5;"><strong>Scrolling Issues:</strong> Use "Fix Scroll" buttons if scrolling stops<br>
                            <strong>Touch Optimized:</strong> All buttons sized for mobile devices<br>
                            <strong>Visual Feedback:</strong> Buttons provide haptic and visual response</p>
                        </div>
                        
                        <div class="help-section" style="margin-bottom: 20px;">
                            <h4 style="color: #2c3e50; margin-bottom: 10px;">Tournament Workflow</h4>
                            <p style="line-height: 1.5;"><strong>Before Tournament:</strong><br>
                            • Select movement (press pair number)<br>
                            • Press 4 for Print Menu<br>
                            • Print table cards and traveler sheets<br>
                            • Set up tables with boards</p>
                            
                            <p style="line-height: 1.5;"><strong>During Tournament:</strong><br>
                            • Players complete traveler sheets after each round<br>
                            • Collect completed travelers</p>
                            
                            <p style="line-height: 1.5;"><strong>After Tournament:</strong><br>
                            • Enter all traveler results into app<br>
                            • View final standings<br>
                            • Export results if needed</p>
                        </div>
                        
                        <div style="
                            text-align: center; 
                            font-size: 11px; 
                            color: #666; 
                            margin-top: 20px;
                            padding: 10px;
                            background: rgba(52, 152, 219, 0.05);
                            border-radius: 6px;
                        ">
                            Standard ACBL duplicate bridge scoring and movement patterns
                        </div>
                    </div>
                    
                    <div style="text-align: center;">
                        <button id="help-refresh-scroll-btn" style="
                            background: #f39c12; 
                            color: white; 
                            border: none; 
                            padding: 10px 20px; 
                            border-radius: 6px; 
                            font-size: 12px; 
                            cursor: pointer;
                            font-weight: bold;
                            min-height: 44px;
                            touch-action: manipulation;
                            user-select: none;
                            -webkit-tap-highlight-color: transparent;
                            margin: 5px;
                        ">Fix Help Scroll</button>
                        
                        <button id="help-close-btn" style="
                            background: #95a5a6; 
                            color: white; 
                            border: none; 
                            padding: 10px 20px; 
                            border-radius: 6px; 
                            font-size: 12px; 
                            cursor: pointer;
                            font-weight: bold;
                            min-height: 44px;
                            touch-action: manipulation;
                            user-select: none;
                            -webkit-tap-highlight-color: transparent;
                            margin: 5px;
                        ">Close Help</button>
                    </div>
                </div>
            `;
            
            document.body.appendChild(popup);
            
            // Setup handlers after DOM insertion
            setTimeout(() => {
                this.setupHelpPopupHandlers();
            }, 100);
            
        } catch (error) {
            console.error('Error showing help:', error);
            // Fallback to basic modal
            if (this.bridgeApp && this.bridgeApp.showModal) {
                this.bridgeApp.showModal('Help', '<p>Help system error. Please try again.</p>');
            }
        }
    }

    /**
     * Setup help popup handlers - COMPLETE PIXEL 9A VERSION
     */
    setupHelpPopupHandlers() {
        // Create unified handler factory
        const createHelpHandler = (action) => {
            return (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                const btn = e.target;
                btn.style.transform = 'scale(0.95)';
                btn.style.opacity = '0.8';
                
                if (navigator.vibrate) {
                    navigator.vibrate([30]);
                }
                
                setTimeout(() => {
                    btn.style.transform = 'scale(1)';
                    btn.style.opacity = '1';
                    
                    if (action === 'close') {
                        this.closeHelpPopup();
                    } else if (action === 'refresh-scroll') {
                        this.refreshHelpScroll();
                    } else if (action === 'board-templates') {
                        this.showTemplates('board');
                    } else if (action === 'traveler-templates') {
                        this.showTemplates('traveler');
                    }
                }, 100);
            };
        };
        
        // Setup all buttons
        const buttons = [
            { id: 'help-close-btn', action: 'close' },
            { id: 'help-refresh-scroll-btn', action: 'refresh-scroll' },
            { id: 'help-board-templates-btn', action: 'board-templates' },
            { id: 'help-traveler-templates-btn', action: 'traveler-templates' }
        ];
        
        buttons.forEach(({ id, action }) => {
            const btn = document.getElementById(id);
            if (btn) {
                const handler = createHelpHandler(action);
                btn.addEventListener('click', handler, { passive: false });
                btn.addEventListener('touchend', handler, { passive: false });
                
                btn.addEventListener('touchstart', (e) => {
                    e.preventDefault();
                    btn.style.transform = 'scale(0.95)';
                    btn.style.opacity = '0.8';
                }, { passive: false });
            }
        });
        
        // Setup scroll container
        const container = document.getElementById('help-scroll-container');
        if (container) {
            container.style.height = '400px';
            container.style.overflowY = 'scroll';
            container.style.overflowX = 'hidden';
            container.style.webkitOverflowScrolling = 'touch';
            container.style.transform = 'translateZ(0)';
            container.style.willChange = 'scroll-position';
            container.style.overscrollBehavior = 'contain';
            
            container.offsetHeight; // Force layout
        }
    }

    /**
     * Close help popup
     */
    closeHelpPopup() {
        const popup = document.getElementById('duplicateHelpPopup');
        if (popup) {
            popup.remove();
        }
    }

    /**
     * Refresh help scroll container
     */
    refreshHelpScroll() {
        const container = document.getElementById('help-scroll-container');
        if (container) {
            // Visual feedback
            container.style.border = '2px solid #27ae60';
            container.style.transition = 'border-color 0.3s ease';
            
            // Force complete scroll reset
            container.scrollTop = 0;
            setTimeout(() => {
                container.scrollTop = container.scrollHeight;
            }, 50);
            setTimeout(() => {
                container.scrollTop = 0;
            }, 150);
            
            // Reapply all scroll properties
            container.style.height = '400px';
            container.style.overflowY = 'scroll';
            container.style.overflowX = 'hidden';
            container.style.webkitOverflowScrolling = 'touch';
            container.style.transform = 'translateZ(0)';
            container.style.willChange = 'scroll-position';
            container.style.overscrollBehavior = 'contain';
            
            // Reset border after feedback
            setTimeout(() => {
                container.style.border = '1px solid #bdc3c7';
            }, 600);
        }
    }

    /**
     * Show quit options - REMOVED DUPLICATE (Section 6 version will handle this)
     */
    showQuit() {
        // This method is handled in Section 6
        try {
            const content = `
                <div class="help-section">
                    <h4>Session Options</h4>
                    <p>What would you like to do?</p>
                </div>
            `;
            
            const buttons = [
                { text: 'Continue Session', action: () => {}, class: 'continue-btn' },
                { text: 'Show Help', action: () => this.showHelp(), class: 'help-btn' },
                { text: 'Return to Main Menu', action: () => this.returnToMainMenu(), class: 'menu-btn' }
            ];
            
            if (this.bridgeApp && this.bridgeApp.showModal) {
                this.bridgeApp.showModal('Duplicate Bridge Options', content, buttons);
            }
        } catch (error) {
            console.error('Error showing quit options:', error);
        }
    }

    /**
     * Return to main menu
     */
    returnToMainMenu() {
        try {
            if (this.bridgeApp && this.bridgeApp.showLicensedMode) {
                this.bridgeApp.showLicensedMode({ 
                    type: this.bridgeApp.licenseManager?.getLicenseData()?.type || 'FULL' 
                });
            }
        } catch (error) {
            console.error('Error returning to main menu:', error);
        }
    }

    /**
     * Show Print Menu (replaces NV toggle in Duplicate mode)
     */
    showPrintMenu() {
        console.log('🖨️ Opening Print Menu...');
        
        const content = `
            <div class="help-section">
                <h4 style="text-align: center; margin-bottom: 15px;">🖨️ Print Options</h4>
                <p style="text-align: center; color: #7f8c8d; font-size: 13px;">
                    Select what you would like to print:
                </p>
            </div>
        `;
        
        const buttons = [
            { 
                text: '📋 Table Movement Cards', 
                action: () => this.printTableCards(), 
                class: 'help-btn' 
            },
            { 
                text: '📊 Traveler Sheets', 
                action: () => this.printTravelerSheets(), 
                class: 'help-btn' 
            },
            { 
                text: '🎴 Board Slips', 
                action: () => this.printBoardSlips(), 
                class: 'help-btn' 
            },
            { 
                text: '📑 Movement Sheet', 
                action: () => this.showMovementSelector(), 
                class: 'help-btn' 
            }
        ];
        
        if (this.bridgeApp && this.bridgeApp.showModal) {
            this.bridgeApp.showModal('Print Menu', content, buttons);
        } else {
            console.error('❌ bridgeApp.showModal not available');
        }
    }

    /**
     * Show movement selector for viewing movement sheets
     */
    showMovementSelector() {
        // Show movement selector popup (same style as table cards)
        const popup = document.createElement('div');
        popup.id = 'movementSelectorPopup';
        popup.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.85); z-index: 1000;
            display: flex; align-items: center; justify-content: center;
        `;
        
        const availablePairs = Object.keys(this.movements).sort((a, b) => parseInt(a) - parseInt(b));
        
        let buttonHTML = '';
        const colors = ['#27ae60', '#3498db', '#e67e22', '#9b59b6', '#1abc9c', '#e74c3c', '#f39c12', '#16a085', '#c0392b'];
        
        availablePairs.forEach((pairs, index) => {
            const movement = this.movements[pairs];
            const color = colors[index % colors.length];
            const label = movement.hasSitOut ? `${pairs}-Pair Movement ⚠️` : `${pairs}-Pair Movement`;
            buttonHTML += `<button class="movement-view-btn" data-pairs="${pairs}" style="background: ${color}; color: white; border: none; padding: 12px 20px; margin: 8px; border-radius: 6px; font-size: 14px; font-weight: 600; cursor: pointer; min-width: 140px;">${label}</button>\n`;
            
            if ((index + 1) % 3 === 0) {
                buttonHTML += '<br>';
            }
        });
        
        popup.innerHTML = `
            <div style="background: white; padding: 25px; border-radius: 8px; max-width: 600px; text-align: center;">
                <h3 style="margin: 0 0 15px 0; color: #2c3e50;">Select Movement to View</h3>
                <p style="color: #7f8c8d; font-size: 13px; margin-bottom: 20px;">⚠️ = Includes sit-out rounds</p>
                <div style="margin: 20px 0;">
                    ${buttonHTML}
                </div>
                <button id="closeMovementSelector" style="background: #95a5a6; color: white; border: none; padding: 10px 20px; border-radius: 6px; font-size: 14px; cursor: pointer; margin-top: 10px;">Close</button>
            </div>
        `;
        
        document.body.appendChild(popup);
        
        // Add event listeners
        popup.querySelectorAll('.movement-view-btn').forEach(btn => {
            btn.onclick = () => {
                const pairs = btn.getAttribute('data-pairs');
                const movement = this.movements[pairs];
                // Temporarily set session movement to show it
                const originalMovement = this.session.movement;
                this.session.movement = movement;
                this.showMovementPopup();
                // Restore original
                this.session.movement = originalMovement;
                document.body.removeChild(popup);
            };
        });
        
        document.getElementById('closeMovementSelector').onclick = () => {
            document.body.removeChild(popup);
        };
    }

    /**
     * Print table movement cards - show movement selector
     */
    printTableCards() {
        // Show movement selector popup
        const popup = document.createElement('div');
        popup.id = 'tableCardSelectorPopup';
        popup.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.85); z-index: 1000;
            display: flex; align-items: center; justify-content: center;
        `;
        
        // Get available movements
        const availablePairs = Object.keys(this.movements).sort((a, b) => parseInt(a) - parseInt(b));
        
        // Build buttons for each movement
        let buttonHTML = '';
        const colors = ['#27ae60', '#3498db', '#e67e22', '#9b59b6', '#1abc9c', '#e74c3c', '#f39c12', '#16a085', '#c0392b'];
        
        availablePairs.forEach((pairs, index) => {
            const movement = this.movements[pairs];
            const color = colors[index % colors.length];
            const label = movement.hasSitOut ? `${pairs}-Pair Cards ⚠️` : `${pairs}-Pair Cards`;
            buttonHTML += `<button class="movement-select-btn" data-pairs="${pairs}" style="background: ${color}; color: white; border: none; padding: 12px 20px; margin: 8px; border-radius: 6px; font-size: 14px; font-weight: 600; cursor: pointer; min-width: 140px;">${label}</button>\n`;
            
            if ((index + 1) % 3 === 0) {
                buttonHTML += '<br>';
            }
        });
        
        popup.innerHTML = `
            <div style="background: white; padding: 25px; border-radius: 8px; max-width: 600px; text-align: center;">
                <h3 style="margin: 0 0 15px 0; color: #2c3e50;">Select Movement for Table Cards</h3>
                <p style="color: #7f8c8d; font-size: 13px; margin-bottom: 20px;">⚠️ = Includes sit-out rounds</p>
                <div style="margin: 20px 0;">
                    ${buttonHTML}
                </div>
                <button id="closeTableCardSelector" style="background: #95a5a6; color: white; border: none; padding: 10px 20px; border-radius: 6px; font-size: 14px; cursor: pointer; margin-top: 10px;">Close</button>
            </div>
        `;
        
        document.body.appendChild(popup);
        
        // Add event listeners
        popup.querySelectorAll('.movement-select-btn').forEach(btn => {
            btn.onclick = () => {
                const pairs = btn.getAttribute('data-pairs');
                const movement = this.movements[pairs];
                if (typeof tableCardGenerator !== 'undefined') {
                    tableCardGenerator.generateTableCards(movement);
                }
                document.body.removeChild(popup);
            };
        });
        
        document.getElementById('closeTableCardSelector').onclick = () => {
            document.body.removeChild(popup);
        };
    }

    /**
     * Print traveler sheets
     */
    printTravelerSheets() {
        if (typeof templateGenerator !== 'undefined') {
            templateGenerator.showTravelerTemplates();
        } else {
            this.bridgeApp.showMessage('Traveler templates not available', 'error');
        }
    }

    /**
     * Print board slips
     */
    printBoardSlips() {
        if (typeof templateGenerator !== 'undefined') {
            templateGenerator.showBoardTemplates();
        } else {
            this.bridgeApp.showMessage('Board templates not available', 'error');
        }
    }
//END SECTION FIVE
// SECTION SIX
/**
     * Generate movement table HTML with responsive design
     */
    getMovementTableHTML() {
        const movement = this.session.movement;
        if (!movement || !movement.movement) {
            return '<p style="text-align: center; color: #e74c3c;">Movement data not available</p>';
        }
        
        // Group entries by rounds
        const roundData = {};
        movement.movement.forEach(entry => {
            if (!roundData[entry.round]) {
                roundData[entry.round] = [];
            }
            roundData[entry.round].push(entry);
        });
        
        let html = `
            <div style="
                overflow-x: auto; 
                margin: 20px 0;
                -webkit-overflow-scrolling: touch;
                border: 1px solid #bdc3c7;
                border-radius: 6px;
            ">
                <table style="
                    width: 100%; 
                    border-collapse: collapse; 
                    font-size: 12px; 
                    min-width: 400px;
                    background: white;
                ">
                    <thead style="position: sticky; top: 0; background: #34495e; z-index: 5;">
                        <tr style="background: #34495e; color: white;">
                            <th style="padding: 10px 8px; border: 1px solid #2c3e50; font-weight: bold;">Round</th>
        `;
        
        for (let t = 1; t <= movement.tables; t++) {
            html += `<th style="padding: 10px 8px; border: 1px solid #2c3e50; font-weight: bold; min-width: 120px;">Table ${t}</th>`;
        }
        html += '</tr></thead><tbody>';
        
        // Add round data with enhanced styling
        Object.keys(roundData).sort((a,b) => parseInt(a) - parseInt(b)).forEach((round, roundIndex) => {
            const bgColor = roundIndex % 2 === 0 ? '#f8f9fa' : 'white';
            html += `<tr style="background: ${bgColor};">`;
            html += `<td style="
                padding: 12px 8px; 
                border: 1px solid #bdc3c7; 
                font-weight: bold; 
                background: #ecf0f1; 
                text-align: center;
                color: #2c3e50;
            ">${round}</td>`;
            
            const roundEntries = roundData[round];
            
            for (let t = 1; t <= movement.tables; t++) {
                const entry = roundEntries.find(e => e.table === t);
                if (entry) {
                    const boardRange = entry.boards.length > 1 ? 
                        `${entry.boards[0]}-${entry.boards[entry.boards.length-1]}` : 
                        entry.boards[0];
                    
                    html += `
                        <td style="
                            padding: 8px; 
                            border: 1px solid #bdc3c7; 
                            text-align: center; 
                            font-size: 11px;
                            vertical-align: middle;
                        ">
                            <div style="font-weight: bold; color: #27ae60; margin-bottom: 2px;">NS: ${entry.ns}</div>
                            <div style="font-weight: bold; color: #e74c3c; margin-bottom: 4px;">EW: ${entry.ew}</div>
                            <div style="
                                color: #7f8c8d; 
                                font-size: 10px; 
                                background: rgba(52, 152, 219, 0.1);
                                padding: 2px 4px;
                                border-radius: 3px;
                                display: inline-block;
                            ">Boards: ${boardRange}</div>
                        </td>`;
                } else {
                    html += '<td style="padding: 8px; border: 1px solid #bdc3c7; text-align: center; color: #bdc3c7;">-</td>';
                }
            }
            
            html += '</tr>';
        });
        
        html += '</tbody></table></div>';
        
        // Add movement summary
        html += `
            <div style="
                background: rgba(52, 152, 219, 0.1); 
                padding: 12px; 
                border-radius: 6px; 
                margin-top: 15px;
                border-left: 4px solid #3498db;
            ">
                <div style="font-size: 13px; color: #2c3e50;">
                    <strong>Movement Summary:</strong><br>
                    • Each pair plays ${movement.totalBoards} boards<br>
                    • ${movement.rounds} rounds of ${Math.floor(movement.totalBoards / movement.rounds)} boards each<br>
                    • Estimated time: ${movement.description.match(/~(.+)/)?.[1] || '2-3 hours'}
                </div>
            </div>
        `;
        
        return html;
    }

    /**
     * Show quit options - COMPREHENSIVE VERSION (No duplicate in Section 5)
     */
    showQuit() {
        try {
            // Create quit popup directly for better control
            const popup = document.createElement('div');
            popup.id = 'duplicateQuitPopup';
            popup.style.cssText = `
                position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
                background: rgba(0,0,0,0.8); z-index: 1000; 
                display: flex; align-items: center; justify-content: center;
                -webkit-overflow-scrolling: touch;
            `;
            
            popup.innerHTML = `
                <div style="
                    background: white; 
                    padding: 30px; 
                    border-radius: 8px; 
                    max-width: 90%; 
                    color: #2c3e50;
                    text-align: center;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.3);
                ">
                    <h3 style="margin: 0 0 20px 0; color: #2c3e50;">Duplicate Bridge Options</h3>
                    
                    <div style="margin-bottom: 25px;">
                        <p style="line-height: 1.5; margin-bottom: 15px;">What would you like to do?</p>
                    </div>
                    
                    <div style="
                        display: flex; 
                        flex-direction: column; 
                        gap: 15px; 
                        align-items: center;
                    ">
                        <button id="quit-continue-btn" style="
                            background: #27ae60; 
                            color: white; 
                            border: none; 
                            padding: 12px 24px; 
                            border-radius: 6px; 
                            font-size: 14px; 
                            cursor: pointer;
                            font-weight: bold;
                            min-height: 50px;
                            min-width: 200px;
                            touch-action: manipulation;
                            user-select: none;
                            -webkit-tap-highlight-color: transparent;
                        ">Continue Session</button>
                        
                        <button id="quit-help-btn" style="
                            background: #3498db; 
                            color: white; 
                            border: none; 
                            padding: 12px 24px; 
                            border-radius: 6px; 
                            font-size: 14px; 
                            cursor: pointer;
                            font-weight: bold;
                            min-height: 50px;
                            min-width: 200px;
                            touch-action: manipulation;
                            user-select: none;
                            -webkit-tap-highlight-color: transparent;
                        ">Show Help</button>
                        
                        <button id="quit-menu-btn" style="
                            background: #e74c3c; 
                            color: white; 
                            border: none; 
                            padding: 12px 24px; 
                            border-radius: 6px; 
                            font-size: 14px; 
                            cursor: pointer;
                            font-weight: bold;
                            min-height: 50px;
                            min-width: 200px;
                            touch-action: manipulation;
                            user-select: none;
                            -webkit-tap-highlight-color: transparent;
                        ">Return to Main Menu</button>
                    </div>
                </div>
            `;
            
            document.body.appendChild(popup);
            
            // Setup handlers after DOM insertion
            setTimeout(() => {
                this.setupQuitPopupHandlers();
            }, 100);
            
        } catch (error) {
            console.error('Error showing quit options:', error);
            // Fallback
            if (this.bridgeApp && this.bridgeApp.showModal) {
                const content = `
                    <div class="help-section">
                        <h4>Session Options</h4>
                        <p>What would you like to do?</p>
                    </div>
                `;
                
                const buttons = [
                    { text: 'Continue Session', action: () => {}, class: 'continue-btn' },
                    { text: 'Show Help', action: () => this.showHelp(), class: 'help-btn' },
                    { text: 'Return to Main Menu', action: () => this.returnToMainMenu(), class: 'menu-btn' }
                ];
                
                this.bridgeApp.showModal('Duplicate Bridge Options', content, buttons);
            }
        }
    }

    /**
     * Setup quit popup handlers
     */
    setupQuitPopupHandlers() {
        // Create unified handler factory
        const createQuitHandler = (action) => {
            return (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                const btn = e.target;
                btn.style.transform = 'scale(0.95)';
                btn.style.opacity = '0.8';
                
                if (navigator.vibrate) {
                    navigator.vibrate([30]);
                }
                
                setTimeout(() => {
                    btn.style.transform = 'scale(1)';
                    btn.style.opacity = '1';
                    
                    if (action === 'continue') {
                        this.closeQuitPopup();
                    } else if (action === 'help') {
                        this.closeQuitPopup();
                        setTimeout(() => this.showHelp(), 100);
                    } else if (action === 'menu') {
                        this.closeQuitPopup();
                        setTimeout(() => this.returnToMainMenu(), 100);
                    }
                }, 100);
            };
        };
        
        // Setup all buttons
        const buttons = [
            { id: 'quit-continue-btn', action: 'continue' },
            { id: 'quit-help-btn', action: 'help' },
            { id: 'quit-menu-btn', action: 'menu' }
        ];
        
        buttons.forEach(({ id, action }) => {
            const btn = document.getElementById(id);
            if (btn) {
                const handler = createQuitHandler(action);
                btn.addEventListener('click', handler, { passive: false });
                btn.addEventListener('touchend', handler, { passive: false });
                
                btn.addEventListener('touchstart', (e) => {
                    e.preventDefault();
                    btn.style.transform = 'scale(0.95)';
                    btn.style.opacity = '0.8';
                }, { passive: false });
            }
        });
    }

    /**
     * Close quit popup
     */
    closeQuitPopup() {
        const popup = document.getElementById('duplicateQuitPopup');
        if (popup) {
            popup.remove();
        }
    }

    /**
     * Return to main menu
     */
    returnToMainMenu() {
        try {
            if (this.bridgeApp && this.bridgeApp.showLicensedMode) {
                this.bridgeApp.showLicensedMode({ 
                    type: this.bridgeApp.licenseManager?.getLicenseData()?.type || 'FULL' 
                });
            }
        } catch (error) {
            console.error('Error returning to main menu:', error);
        }
    }

    /**
     * Check if all boards are completed
     */
    areAllBoardsComplete() {
        if (!this.session.isSetup || !this.session.boards) {
            return false;
        }
        
        const boards = Object.values(this.session.boards);
        const totalBoards = boards.length;
        const completedBoards = boards.filter(board => board.completed).length;
        
        if (totalBoards === 0) return false;
        
        return completedBoards === totalBoards;
    }

    /**
     * Get completion status
     */
    getCompletionStatus() {
        if (!this.session.isSetup || !this.session.boards) {
            return { completed: 0, total: 0, percentage: 0 };
        }
        
        const boards = Object.values(this.session.boards);
        const completed = boards.filter(board => board.completed).length;
        const total = boards.length;
        const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
        
        return { completed, total, percentage };
    }

    /**
     * Get board status with enhanced information
     */
    getBoardStatus() {
        if (!this.session.isSetup) {
            return [];
        }
        
        return Object.values(this.session.boards).map(board => ({
            number: board.number,
            vulnerability: board.vulnerability,
            completed: board.completed,
            resultCount: board.results ? board.results.filter(r => r.isComplete).length : 0,
            hasResults: board.hasResults || (board.results && board.results.some(r => r.nsScore !== null || r.ewScore !== null))
        }));
    }
// END SECTION SIX
// SECTION SEVEN
/**
     * Show final standings table
     */
    showFinalStandings() {
        const standings = this.calculateFinalStandings();
        
        if (standings.length === 0) {
            this.bridgeApp.showModal('Final Standings', '<p>No results available for standings calculation.</p>');
            return;
        }
        
        let standingsContent = `
            <div class="standings-header">
                <h4>Final Standings</h4>
                <p><strong>Movement:</strong> ${this.session.movement.description}</p>
            </div>
            
            <div class="standings-table" style="
                overflow-x: auto;
                margin: 15px 0;
                -webkit-overflow-scrolling: touch;
                border-radius: 6px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            ">
                <table style="
                    width: 100%; 
                    border-collapse: collapse; 
                    font-size: 13px;
                    background: white;
                    min-width: 400px;
                ">
                    <thead style="background: #2c3e50; color: white;">
                        <tr>
                            <th style="padding: 12px 8px; border: 1px solid #34495e; text-align: center;">Pos</th>
                            <th style="padding: 12px 8px; border: 1px solid #34495e; text-align: center;">Pair</th>
                            <th style="padding: 12px 8px; border: 1px solid #34495e; text-align: center;">MP</th>
                            <th style="padding: 12px 8px; border: 1px solid #34495e; text-align: center;">%</th>
                            <th style="padding: 12px 8px; border: 1px solid #34495e; text-align: center;">Boards</th>
                            <th style="padding: 12px 8px; border: 1px solid #34495e; text-align: center;">Total Score</th>
                        </tr>
                    </thead>
                    <tbody>
        `;
        
        standings.forEach((pair, index) => {
            const position = index + 1;
            const isWinner = position === 1;
            const isTop3 = position <= 3;
            
            const rowColor = isWinner ? 'rgba(241, 196, 15, 0.2)' : 
                           isTop3 ? 'rgba(39, 174, 96, 0.1)' : 
                           index % 2 === 0 ? '#f8f9fa' : 'white';
            
            const positionIcon = position === 1 ? '🥇' :
                                position === 2 ? '🥈' :
                                position === 3 ? '🥉' : '';
            
            standingsContent += `
                <tr style="background: ${rowColor};">
                    <td style="
                        padding: 10px 8px; 
                        border: 1px solid #ddd; 
                        text-align: center;
                        font-weight: ${isTop3 ? 'bold' : 'normal'};
                        font-size: ${isWinner ? '16px' : '13px'};
                    ">
                        ${positionIcon} ${position}
                    </td>
                    <td style="
                        padding: 10px 8px; 
                        border: 1px solid #ddd; 
                        text-align: center;
                        font-weight: ${isWinner ? 'bold' : 'normal'};
                        color: ${isWinner ? '#f39c12' : '#2c3e50'};
                    ">
                        Pair ${pair.pair}
                    </td>
                    <td style="
                        padding: 10px 8px; 
                        border: 1px solid #ddd; 
                        text-align: center;
                        font-weight: bold;
                        color: #3498db;
                    ">
                        ${pair.totalMatchpoints}
                    </td>
                    <td style="
                        padding: 10px 8px; 
                        border: 1px solid #ddd; 
                        text-align: center;
                        font-weight: bold;
                        color: ${pair.percentage >= 60 ? '#27ae60' : pair.percentage >= 50 ? '#f39c12' : '#e74c3c'};
                        font-size: ${isWinner ? '15px' : '13px'};
                    ">
                        ${pair.percentage}%
                    </td>
                    <td style="
                        padding: 10px 8px; 
                        border: 1px solid #ddd; 
                        text-align: center;
                        color: #7f8c8d;
                    ">
                        ${pair.boardsPlayed}
                    </td>
                    <td style="
                        padding: 10px 8px; 
                        border: 1px solid #ddd; 
                        text-align: center;
                        color: #7f8c8d;
                        font-size: 12px;
                    ">
                        ${pair.totalScore > 0 ? '+' : ''}${pair.totalScore}
                    </td>
                </tr>
            `;
        });
        
        standingsContent += `
                    </tbody>
                </table>
            </div>
            
            <div style="
                background: rgba(52, 152, 219, 0.1);
                padding: 12px;
                border-radius: 6px;
                margin-top: 15px;
                font-size: 12px;
                color: #2c3e50;
            ">
                <strong>Scoring:</strong> Matchpoints (MP) are awarded by comparing your result to others on the same board.
                Beat another pair = 2 MP, tie = 1 MP each, lose = 0 MP.
                Percentage shows MP earned vs maximum possible.
            </div>
        `;
        
        const buttons = [
            { text: 'Close Standings', action: 'close', class: 'close-btn' },
            { text: 'Export Standings', action: () => this.exportStandings(standings), class: 'export-btn' },
            { text: 'View Board Details', action: () => this.showDetailedResults(), class: 'details-btn' }
        ];
        
        this.bridgeApp.showModal('Final Standings', standingsContent, buttons);
    }

    /**
     * Calculate final standings with matchpoint totals
     */
    calculateFinalStandings() {
        if (!this.session.isSetup) {
            return [];
        }
        
        // Initialize pair totals
        const pairTotals = {};
        for (let i = 1; i <= this.session.pairs; i++) {
            pairTotals[i] = {
                pair: i,
                totalMatchpoints: 0,
                maxPossibleMatchpoints: 0,
                boardsPlayed: 0,
                totalScore: 0,
                percentage: 0
            };
        }
        
        // Process each completed board
        const completedBoards = Object.values(this.session.boards)
            .filter(board => board.completed && board.results && board.results.length > 0);
        
        completedBoards.forEach(board => {
            const resultsWithScores = board.results.filter(result => 
                result.nsScore !== null || result.ewScore !== null
            );
            
            if (resultsWithScores.length < 2) return;
            
            // Recalculate matchpoints for this board
            this.calculateBoardMatchpoints(resultsWithScores);
            
            // Add to pair totals
            resultsWithScores.forEach(result => {
                if (result.matchpoints) {
                    // NS pair
                    if (pairTotals[result.nsPair]) {
                        pairTotals[result.nsPair].totalMatchpoints += result.matchpoints.ns || 0;
                        pairTotals[result.nsPair].maxPossibleMatchpoints += (resultsWithScores.length - 1) * 2;
                        pairTotals[result.nsPair].boardsPlayed++;
                        pairTotals[result.nsPair].totalScore += result.nsScore || 0;
                    }
                    
                    // EW pair
                    if (pairTotals[result.ewPair]) {
                        pairTotals[result.ewPair].totalMatchpoints += result.matchpoints.ew || 0;
                        pairTotals[result.ewPair].maxPossibleMatchpoints += (resultsWithScores.length - 1) * 2;
                        pairTotals[result.ewPair].boardsPlayed++;
                        pairTotals[result.ewPair].totalScore += result.ewScore || 0;
                    }
                }
            });
        });
        
        // Calculate percentages and sort
        const standings = Object.values(pairTotals)
            .filter(pair => pair.boardsPlayed > 0)
            .map(pair => {
                pair.percentage = pair.maxPossibleMatchpoints > 0 ? 
                    Math.round((pair.totalMatchpoints / pair.maxPossibleMatchpoints) * 100 * 100) / 100 : 0;
                return pair;
            })
            .sort((a, b) => {
                if (b.percentage !== a.percentage) return b.percentage - a.percentage;
                return b.totalMatchpoints - a.totalMatchpoints;
            });
        
        return standings;
    }

    /**
     * Calculate matchpoints for a specific board's results
     */
    calculateBoardMatchpoints(results) {
        if (results.length < 2) return;
        
        results.forEach(result => {
            let nsMatchpoints = 0;
            let ewMatchpoints = 0;
            
            results.forEach(otherResult => {
                if (result !== otherResult) {
                    const nsScore = result.nsScore || 0;
                    const otherNsScore = otherResult.nsScore || 0;
                    
                    if (nsScore > otherNsScore) {
                        nsMatchpoints += 2;
                    } else if (nsScore === otherNsScore) {
                        nsMatchpoints += 1;
                        ewMatchpoints += 1;
                    } else {
                        ewMatchpoints += 2;
                    }
                }
            });
            
            result.matchpoints = { ns: nsMatchpoints, ew: ewMatchpoints };
        });
    }

    /**
     * Export standings to text file
     */
    exportStandings(standings) {
        let text = `DUPLICATE BRIDGE FINAL STANDINGS\n`;
        text += `Generated: ${new Date().toLocaleString()}\n`;
        text += `Movement: ${this.session.movement.description}\n`;
        text += `========================================\n\n`;
        
        text += `Pos  Pair  Matchpoints  Percentage  Boards  Total Score\n`;
        text += `---  ----  -----------  ----------  ------  -----------\n`;
        
        standings.forEach((pair, index) => {
            const pos = (index + 1).toString().padStart(2);
            const pairNum = pair.pair.toString().padStart(4);
            const mp = pair.totalMatchpoints.toString().padStart(11);
            const pct = `${pair.percentage}%`.padStart(10);
            const boards = pair.boardsPlayed.toString().padStart(6);
            const score = pair.totalScore.toString().padStart(11);
            
            text += `${pos}   ${pairNum}  ${mp}  ${pct}  ${boards}  ${score}\n`;
        });
        
        // Create downloadable file
        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `duplicate-standings-${new Date().toISOString().split('T')[0]}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.bridgeApp.showMessage('Standings exported successfully!', 'success');
    }

    /**
     * Show detailed results with direct popup - COMPLETE PIXEL 9A FIX
     */
    showDetailedResults() {
        if (!this.session.isSetup) {
            this.showDirectPopup('Results', '<p>No session data available.</p>');
            return;
        }
        
        const completionStatus = this.getCompletionStatus();
        
        if (completionStatus.completed === 0) {
            this.showDirectPopup('Results', '<p>No results have been entered yet.</p>');
            return;
        }

        // Create the popup directly for full control
        const popup = document.createElement('div');
        popup.id = 'duplicateResultsPopup';
        popup.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
            background: rgba(0,0,0,0.8); z-index: 1000; 
            display: flex; align-items: center; justify-content: center;
            -webkit-overflow-scrolling: touch;
        `;
        
        // Generate board results content
        const boardResultsContent = this.generateBoardResultsHTML();
        
        popup.innerHTML = `
            <div style="
                background: white; 
                padding: 20px; 
                border-radius: 8px; 
                max-width: 90%; 
                max-height: 90%; 
                overflow: hidden; 
                color: #2c3e50;
                display: flex;
                flex-direction: column;
            ">
                <div style="text-align: center; margin-bottom: 15px;">
                    <h3 style="margin: 0; color: #2c3e50;">Duplicate Bridge Results</h3>
                </div>
                
                <div class="results-summary" style="margin-bottom: 15px;">
                    <h4 style="margin: 0 0 10px 0;">Session Summary</h4>
                    <p style="margin: 5px 0;"><strong>Movement:</strong> ${this.session.movement.description}</p>
                    <p style="margin: 5px 0;"><strong>Progress:</strong> ${completionStatus.completed}/${completionStatus.total} boards (${completionStatus.percentage}%)</p>
                    ${completionStatus.percentage === 100 ? 
                        '<p style="color: #27ae60; font-weight: bold; margin: 5px 0;">All boards complete!</p>' :
                        '<p style="color: #f39c12; margin: 5px 0;">Session in progress...</p>'
                    }
                </div>
                
                <div class="results-details">
                    <h4 style="margin: 0 0 10px 0;">Board Results</h4>
                    <div id="results-scroll-container" style="
                        height: 300px; 
                        overflow-y: scroll; 
                        overflow-x: hidden;
                        -webkit-overflow-scrolling: touch;
                        font-size: 12px;
                        border: 1px solid #bdc3c7;
                        border-radius: 6px;
                        background: rgba(255,255,255,0.98);
                        margin: 10px 0 15px 0;
                        position: relative;
                        transform: translateZ(0);
                        will-change: scroll-position;
                        overscroll-behavior: contain;
                        padding: 0;
                    ">
                        ${boardResultsContent}
                    </div>
                </div>
                
                <div style="text-align: center; margin-bottom: 15px;">
                    <button id="results-refresh-scroll-btn" style="
                        background: #e74c3c; 
                        color: white; 
                        border: none; 
                        padding: 10px 20px; 
                        border-radius: 6px; 
                        font-size: 12px; 
                        cursor: pointer;
                        font-weight: bold;
                        min-height: 44px;
                        touch-action: manipulation;
                        user-select: none;
                        -webkit-tap-highlight-color: transparent;
                        margin: 5px;
                    ">Fix Results Scroll</button>
                </div>
                
                <div style="
                    display: flex; 
                    justify-content: center; 
                    gap: 15px; 
                    flex-wrap: nowrap;
                ">
                    <button id="results-back-btn" style="
                        background: #3498db; 
                        color: white; 
                        border: none; 
                        padding: 10px 20px; 
                        border-radius: 6px; 
                        font-size: 12px; 
                        cursor: pointer;
                        font-weight: bold;
                        min-height: 44px;
                        touch-action: manipulation;
                        user-select: none;
                        -webkit-tap-highlight-color: transparent;
                        min-width: 120px;
                    ">Back to Session</button>
                    
                    <button id="results-export-btn" style="
                        background: #27ae60; 
                        color: white; 
                        border: none; 
                        padding: 10px 20px; 
                        border-radius: 6px; 
                        font-size: 12px; 
                        cursor: pointer;
                        font-weight: bold;
                        min-height: 44px;
                        touch-action: manipulation;
                        user-select: none;
                        -webkit-tap-highlight-color: transparent;
                        min-width: 120px;
                    ">Export Results</button>
                </div>
                
                <div style="
                    text-align: center; 
                    font-size: 11px; 
                    color: #666; 
                    margin-top: 10px;
                    padding: 8px;
                    background: rgba(52, 152, 219, 0.05);
                    border-radius: 6px;
                ">
                    Duplicate Bridge: Tournament scoring with board-by-board comparison
                </div>
            </div>
        `;
        
        document.body.appendChild(popup);
        
        // Setup handlers after DOM insertion
        setTimeout(() => {
            this.setupResultsPopupHandlers();
        }, 100);
    }

    /**
     * Generate board results HTML content
     */
    generateBoardResultsHTML() {
        // Display results for each completed board
        const completedBoards = Object.values(this.session.boards)
            .filter(board => board.completed && board.results && board.results.length > 0)
            .sort((a, b) => a.number - b.number);
        
        if (completedBoards.length === 0) {
            return `
                <div style="padding: 20px; text-align: center; color: #7f8c8d;">
                    <p>No completed boards with results yet.</p>
                    <p>Enter traveler results to see detailed scoring.</p>
                </div>
            `;
        }

        let html = '';
        
        completedBoards.forEach((board, boardIndex) => {
            const vulnColor = this.getVulnerabilityColor(board.vulnerability);
            const vulnDisplay = { 'None': 'None', 'NS': 'NS', 'EW': 'EW', 'Both': 'All' };
            
            html += `
                <div style="
                    background: rgba(52, 152, 219, 0.08);
                    margin: 8px;
                    padding: 12px;
                    border-radius: 8px;
                    border-left: 4px solid #3498db;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
                ">
                    <div style="
                        font-weight: bold; 
                        color: #2c3e50; 
                        margin-bottom: 8px; 
                        font-size: 14px;
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                    ">
                        <span>Board ${board.number}</span>
                        <span style="
                            color: ${vulnColor}; 
                            font-size: 12px;
                            background: rgba(255,255,255,0.8);
                            padding: 2px 8px;
                            border-radius: 12px;
                            border: 1px solid ${vulnColor};
                        ">
                            ${vulnDisplay[board.vulnerability]} Vul
                        </span>
                    </div>
            `;
            
            // Show results for this board
            const resultsWithScores = board.results.filter(result => 
                result.nsScore !== null || result.ewScore !== null
            );
            
            if (resultsWithScores.length === 0) {
                html += `
                    <div style="color: #7f8c8d; font-style: italic; font-size: 11px;">
                        No scored results yet
                    </div>
                `;
            } else {
                resultsWithScores.forEach((result, resultIndex) => {
                    const contractStr = result.level && result.suit ? 
                        `${result.level}${result.suit}${result.double || ''}` : 'No contract';
                    const declarerStr = result.declarer || '?';
                    
                    const nsScore = result.nsScore || 0;
                    const ewScore = result.ewScore || 0;
                    const topScore = Math.max(nsScore, ewScore);
                    
                    html += `
                        <div style="
                            border-bottom: 1px solid #e8e8e8; 
                            padding: 8px 4px; 
                            background: ${resultIndex % 2 === 0 ? 'rgba(248,249,250,0.8)' : 'rgba(255,255,255,0.9)'};
                            margin: 2px 0;
                            border-radius: 4px;
                            font-size: 11px;
                        ">
                            <div style="
                                display: flex; 
                                justify-content: space-between; 
                                align-items: center;
                                flex-wrap: wrap;
                                gap: 8px;
                            ">
                                <div style="flex: 1; min-width: 120px;">
                                    <div style="font-weight: bold; color: #2c3e50;">
                                        Pairs ${result.nsPair} vs ${result.ewPair}
                                    </div>
                                    <div style="color: #555; font-size: 10px;">
                                        ${contractStr} by ${declarerStr}
                                    </div>
                                </div>
                                <div style="
                                    text-align: right;
                                    min-width: 80px;
                                    font-size: 11px;
                                ">
                                    <div style="
                                        display: flex;
                                        gap: 12px;
                                        justify-content: flex-end;
                                    ">
                                        <div style="
                                            color: ${nsScore > 0 ? '#27ae60' : '#95a5a6'};
                                            font-weight: ${nsScore === topScore && nsScore > 0 ? 'bold' : 'normal'};
                                        ">
                                            NS: ${nsScore}
                                        </div>
                                        <div style="
                                            color: ${ewScore > 0 ? '#e74c3c' : '#95a5a6'};
                                            font-weight: ${ewScore === topScore && ewScore > 0 ? 'bold' : 'normal'};
                                        ">
                                            EW: ${ewScore}
                                        </div>
                                    </div>
                                    ${result.matchpoints ? `
                                        <div style="
                                            font-size: 9px; 
                                            color: #7f8c8d; 
                                            margin-top: 2px;
                                        ">
                                            MP: ${result.matchpoints.ns}/${result.matchpoints.ew}
                                        </div>
                                    ` : ''}
                                </div>
                            </div>
                        </div>
                    `;
                });
            }
            
            html += `</div>`;
        });
        
        return html;
    }

    /**
     * Setup results popup handlers - KITCHEN.JS PROVEN PATTERN
     */
    setupResultsPopupHandlers() {
        // Use the same timeout delay as kitchen.js
        setTimeout(() => {
            const modalBtns = document.querySelectorAll('#duplicateResultsPopup button');
            
            modalBtns.forEach((btn) => {
                const btnId = btn.id;
                let action = '';
                
                if (btnId === 'results-refresh-scroll-btn') action = 'refresh-scroll';
                else if (btnId === 'results-back-btn') action = 'back';
                else if (btnId === 'results-export-btn') action = 'export';
                
                if (action) {
                    // Handle action function
                    const handleAction = (actionType) => {
                        if (actionType === 'back') {
                            this.closeResultsPopup();
                        } else if (actionType === 'export') {
                            this.exportResults();
                        } else if (actionType === 'refresh-scroll') {
                            this.refreshResultsScroll();
                        }
                    };
                    
                    // Kitchen.js pattern: both click and touchend with passive: false
                    ['click', 'touchend'].forEach(eventType => {
                        btn.addEventListener(eventType, (e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleAction(action);
                        }, { passive: false });
                    });
                    
                    // Visual feedback on touchstart
                    btn.addEventListener('touchstart', (e) => {
                        const originalBg = btn.style.background;
                        if (btnId === 'results-refresh-scroll-btn') {
                            btn.style.background = '#c0392b';
                        } else if (btnId === 'results-back-btn') {
                            btn.style.background = '#2980b9';
                        } else if (btnId === 'results-export-btn') {
                            btn.style.background = '#229954';
                        }
                        btn.style.transform = 'scale(0.95)';
                        
                        setTimeout(() => {
                            btn.style.background = originalBg;
                            btn.style.transform = 'scale(1)';
                        }, 150);
                    }, { passive: true });
                }
            });
        }, 50); // Kitchen.js uses 50ms timeout
        
        // Setup scroll container with forced properties
        const container = document.getElementById('results-scroll-container');
        if (container) {
            container.style.height = '300px';
            container.style.overflowY = 'scroll';
            container.style.overflowX = 'hidden';
            container.style.webkitOverflowScrolling = 'touch';
            container.style.transform = 'translateZ(0)';
            container.style.willChange = 'scroll-position';
            container.style.overscrollBehavior = 'contain';
            
            container.offsetHeight; // Force layout
        }
    }

    /**
     * Close results popup
     */
    closeResultsPopup() {
        const popup = document.getElementById('duplicateResultsPopup');
        if (popup) {
            popup.remove();
        }
    }

    /**
     * Refresh results scroll container - ENHANCED VERSION
     */
    refreshResultsScroll() {
        const container = document.getElementById('results-scroll-container');
        if (container) {
            // Visual feedback
            container.style.border = '2px solid #27ae60';
            container.style.transition = 'border-color 0.3s ease';
            
            // Force complete scroll reset
            container.scrollTop = 0;
            setTimeout(() => {
                container.scrollTop = container.scrollHeight;
            }, 50);
            setTimeout(() => {
                container.scrollTop = 0;
            }, 150);
            
            // Reapply all scroll properties aggressively
            container.style.height = '300px';
            container.style.overflowY = 'scroll';
            container.style.overflowX = 'hidden';
            container.style.webkitOverflowScrolling = 'touch';
            container.style.transform = 'translateZ(0)';
            container.style.willChange = 'scroll-position';
            container.style.overscrollBehavior = 'contain';
            container.style.position = 'relative';
            
            // Force layout recalculation
            container.offsetHeight;
            
            // Reset border after feedback
            setTimeout(() => {
                container.style.border = '1px solid #bdc3c7';
            }, 600);
        }
    }

    /**
     * Simple popup for error messages
     */
    showDirectPopup(title, content) {
        const popup = document.createElement('div');
        popup.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
            background: rgba(0,0,0,0.8); z-index: 1000; 
            display: flex; align-items: center; justify-content: center;
        `;
        
        popup.innerHTML = `
            <div style="
                background: white; padding: 20px; border-radius: 8px; 
                max-width: 90%; color: #2c3e50; text-align: center;
            ">
                <h3>${title}</h3>
                ${content}
                <button onclick="this.parentElement.parentElement.remove()" style="
                    background: #3498db; color: white; border: none; 
                    padding: 10px 20px; border-radius: 6px; margin-top: 15px;
                    cursor: pointer; min-height: 44px;
                ">Close</button>
            </div>
        `;
        
        document.body.appendChild(popup);
    }

    /**
     * Export results in text format
     */
    exportResults() {
        const results = this.generateResultsText();
        
        const blob = new Blob([results], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `duplicate-bridge-results-${new Date().toISOString().split('T')[0]}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.bridgeApp.showMessage('Results exported successfully!', 'success');
    }

    /**
     * Generate results text for export
     */
    generateResultsText() {
        const movement = this.session.movement;
        const completionStatus = this.getCompletionStatus();
        
        let text = `DUPLICATE BRIDGE RESULTS\n`;
        text += `Generated: ${new Date().toLocaleString()}\n`;
        text += `========================================\n\n`;
        
        text += `SESSION DETAILS:\n`;
        text += `Movement: ${movement.description}\n`;
        text += `Pairs: ${movement.pairs}\n`;
        text += `Tables: ${movement.tables}\n`;
        text += `Total Boards: ${movement.totalBoards}\n`;
        text += `Completed: ${completionStatus.completed}/${completionStatus.total} (${completionStatus.percentage}%)\n\n`;
        
        text += `BOARD RESULTS:\n\n`;
        
        const completedBoards = Object.values(this.session.boards)
            .filter(board => board.completed && board.results)
            .sort((a, b) => a.number - b.number);
        
        completedBoards.forEach(board => {
            text += `Board ${board.number} (${board.vulnerability} Vulnerable):\n`;
            text += `${'='.repeat(30)}\n`;
            
            const resultsWithScores = board.results.filter(result => 
                result.nsScore !== null || result.ewScore !== null
            );
            
            if (resultsWithScores.length === 0) {
                text += `No results entered\n\n`;
            } else {
                resultsWithScores.forEach(result => {
                    const contract = result.level && result.suit ? 
                        `${result.level}${result.suit}${result.double || ''}` : 'No contract';
                    const declarer = result.declarer || '?';
                    
                    text += `  Pairs ${result.nsPair} vs ${result.ewPair}: `;
                    text += `${contract} by ${declarer}\n`;
                    text += `    Scores: NS ${result.nsScore || 0}, EW ${result.ewScore || 0}\n`;
                    
                    if (result.matchpoints) {
                        text += `    Matchpoints: NS ${result.matchpoints.ns}, EW ${result.matchpoints.ew}\n`;
                    }
                    text += `\n`;
                });
            }
        });
        
        return text;
    }
// END SECTION SEVEN// SECTION EIGHT
/**
     * Handle back navigation with state management
     */
    handleBack() {
        // Close any active popups first
        if (this.traveler.isActive) {
            this.closeTraveler();
            return true;
        }
        
        // Close any open popups
        const popups = ['boardSelectorPopup', 'movementPopup'];
        const openPopup = popups.find(id => document.getElementById(id));
        if (openPopup) {
            document.getElementById(openPopup).remove();
            return true;
        }
        
        // Navigate between states
        switch (this.inputState) {
            case 'movement_confirm':
                this.inputState = 'pairs_setup';
                this.session.pairs = 0;
                this.session.movement = null;
                break;
                
            case 'board_selection':
                this.inputState = 'movement_confirm';
                this.session.isSetup = false;
                this.session.boards = {};
                break;
                
            case 'results':
                this.inputState = 'board_selection';
                break;
                
            default:
                return false;
        }
        
        this.updateDisplay();
        return true;
    }

    /**
     * Get active buttons for current state
     */
    getActiveButtons() {
        // Handle traveler input buttons
        if (this.inputState === 'traveler_entry') {
            const travelerButtons = this.getTravelerActiveButtons();
            
            if (!travelerButtons.includes('BACK')) {
                travelerButtons.push('BACK');
            }
            
            return travelerButtons;
        }
        
        switch (this.inputState) {
            case 'pairs_setup':
                // Show all digit buttons for multi-digit entry
                return ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'BACK'];
                
            case 'movement_confirm':
                return ['1', '2', '3', '4', 'BACK'];
                
            case 'board_selection':
                const buttons = ['BACK'];
                
                const completionStatus = this.getCompletionStatus();
                
                if (completionStatus.percentage === 100) {
                    buttons.push('DEAL');
                }
                
                return buttons;
                
            case 'results':
                return ['BACK'];
                
            default:
                return [];
        }
    }

    /**
     * Get display content for current state
     */
    getDisplayContent() {
        switch (this.inputState) {
            case 'pairs_setup':
                return this.getPairsSetupContent();
                
            case 'movement_confirm':
                return this.getMovementConfirmContent();
                
            case 'board_selection':
                return this.getBoardSelectionContent();
                
            case 'traveler_entry':
                return this.getTravelerEntryContent();
                
            case 'results':
                return this.getResultsContent();
                
            default:
                return '<div class="current-state">Loading Duplicate Bridge...</div>';
        }
    }

    /**
     * Get pairs setup display content
     */
    getPairsSetupContent() {
        const availablePairs = Object.keys(this.movements).sort((a, b) => parseInt(a) - parseInt(b));
        
        // Build movement info dynamically
        let movementInfo = '';
        availablePairs.forEach(pairs => {
            const movement = this.movements[pairs];
            const sitOut = movement.hasSitOut ? ' ⚠️' : '';
            const typeLabel = movement.type === 'mitchell' ? 'Mitchell' : 'Howell';
            
            movementInfo += `
                <div style="margin-bottom: 10px;">
                    <strong style="color: #2c3e50;">${pairs} pairs${sitOut}:</strong> 
                    <span style="color: #7f8c8d;">${movement.tables} tables, ${movement.totalBoards} boards, ${typeLabel}</span>
                </div>
            `;
        });
        
        // Show number building state if active
        let buildingDisplay = '';
        if (this.numberBuilder) {
            buildingDisplay = `
                <div style="text-align: center; margin: 15px 0; padding: 15px; background: rgba(52, 152, 219, 0.2); border-radius: 8px; border: 2px solid #3498db;">
                    <div style="font-size: 24px; font-weight: 800; color: #2c3e50;">
                        Building: ${this.numberBuilder}
                    </div>
                    <div style="font-size: 13px; color: #7f8c8d; margin-top: 5px;">
                        Keep typing or wait 0.5s to confirm
                    </div>
                </div>
            `;
        }
        
        return `
            <div class="title-score-row">
                <div class="mode-title">${this.displayName}</div>
                <div class="score-display">Setup</div>
            </div>
            <div class="game-content">
                <div style="text-align: center; margin-bottom: 15px;">
                    <h3 style="color: #2c3e50; margin: 0;">Tournament Setup</h3>
                </div>
                <div><strong>How many pairs are playing?</strong></div>
                ${buildingDisplay}
                <div style="margin: 15px 0; padding: 15px; background: rgba(52, 152, 219, 0.1); border-radius: 8px; border-left: 4px solid #3498db;">
                    <div style="font-size: 14px; line-height: 1.6;">
                        ${movementInfo}
                    </div>
                </div>
                <div style="text-align: center; color: #2c3e50; font-size: 13px; margin-top: 12px; padding: 8px 10px; background: #d4edda; border-radius: 6px; border: 2px solid #28a745;">
                    <strong style="font-size: 14px;">💡 Quick Guide:</strong>
                    <span style="font-size: 13px; line-height: 1.6; display: block; margin-top: 4px;">
                        Single: <strong>4-9</strong> • Two-digit: <strong>1→0</strong>, <strong>1→2</strong>, <strong>1→4</strong> • ⚠️ = sit-out rounds
                    </span>
                </div>
                <div style="text-align: center; color: #95a5a6; font-size: 12px; margin-top: 10px;">
                    Each pair plays all boards exactly once<br>
                    Results compared using matchpoint scoring
                </div>
            </div>
            <div class="current-state" style="font-size: 15px; font-weight: 700; color: #2c3e50;">
                ${this.numberBuilder ? `Waiting for 2nd digit... (${this.numberBuilder}+?)` : 'Select number of pairs'}
            </div>
        `;
    }

    /**
     * Get movement confirmation display content
     */
    getMovementConfirmContent() {
        const movement = this.session.movement;
        const estimatedTime = movement.description.match(/~(.+)/)?.[1] || '2-3 hours';
        const hasSitOut = movement.hasSitOut ? ' (1 sit-out per round)' : '';
        
        // Check if this is a Skip Mitchell (even tables)
        const isSkipMitchell = movement.type === 'mitchell' && movement.tables % 2 === 0;
        const skipRound = isSkipMitchell ? Math.floor(movement.tables / 2) + 1 : null;
        
        // Build skip warning if needed
        let skipWarning = '';
        if (isSkipMitchell) {
            skipWarning = `
                <div style="background: #fff3cd; padding: 15px; border-radius: 8px; border: 3px solid #ffc107; margin: 15px 0;">
                    <div style="text-align: center; font-size: 18px; font-weight: 800; color: #856404; margin-bottom: 10px;">
                        ⚠️ SKIP MITCHELL MOVEMENT ⚠️
                    </div>
                    <div style="font-size: 14px; color: #856404; line-height: 1.6; text-align: center;">
                        <strong>ROUND ${skipRound}: EW pairs skip an extra table!</strong><br>
                        <span style="font-size: 13px;">This ensures all pairs play each other exactly once.</span>
                    </div>
                </div>
            `;
        }
        
        return `
            <div class="title-score-row">
                <div class="mode-title">${this.displayName}</div>
                <div class="score-display">${this.session.pairs} Pairs</div>
            </div>
            <div class="game-content">
                <div style="text-align: center; margin-bottom: 15px;">
                    <h3 style="color: #2c3e50; margin: 0;">Movement Selected</h3>
                </div>
                <div style="background: rgba(39, 174, 96, 0.1); padding: 15px; border-radius: 8px; border-left: 4px solid #27ae60; margin: 10px 0;">
                    <div style="font-weight: bold; color: #2c3e50; margin-bottom: 8px;">
                        ${movement.description}
                    </div>
                    <div style="font-size: 13px; color: #2c3e50; line-height: 1.5;">
                        <div><strong>Pairs:</strong> ${movement.pairs}${hasSitOut}</div>
                        <div><strong>Tables:</strong> ${movement.tables}</div>
                        <div><strong>Rounds:</strong> ${movement.rounds}</div>
                        <div><strong>Total Boards:</strong> ${movement.totalBoards}</div>
                        <div><strong>Estimated Time:</strong> ${estimatedTime}</div>
                    </div>
                </div>
                ${skipWarning}
                <div style="background: rgba(52, 152, 219, 0.1); padding: 12px; border-radius: 8px; margin: 15px 0;">
                    <div style="font-size: 13px; color: #2c3e50; line-height: 1.6;">
                        <strong>📋 Before starting:</strong>
                        <ol style="margin: 8px 0 0 20px; padding: 0;">
                            <li>Print table movement cards</li>
                            <li>Place boards on tables</li>
                            <li>Set up traveler sheets</li>
                        </ol>
                    </div>
                </div>
                <div style="margin-top: 15px; font-size: 14px;">
                    <div style="margin-bottom: 6px;">
                        <strong style="color: #3498db;">1</strong> = View detailed movement
                    </div>
                    <div style="margin-bottom: 6px;">
                        <strong style="color: #27ae60;">2</strong> = 🖨️ Print cards & start
                    </div>
                    <div style="margin-bottom: 6px;">
                        <strong style="color: #95a5a6;">3</strong> = Start (no print)
                    </div>
                    <div>
                        <strong style="color: #e67e22;">4</strong> = 🖨️ Print Menu
                    </div>
                </div>
            </div>
            <div class="current-state">1=Details, 2=Print&Start, 3=Start, 4=PrintMenu, Back</div>
        `;
    }

    /**
     * Get board selection display content
     */
    getBoardSelectionContent() {
        const completionStatus = this.getCompletionStatus();
        const isComplete = completionStatus.percentage === 100;
        
        return `
            <div class="title-score-row">
                <div class="mode-title">${this.displayName}</div>
                <div class="score-display">
                    ${completionStatus.completed}/${completionStatus.total}
                    <div style="font-size: 10px; color: #95a5a6;">${completionStatus.percentage}%</div>
                </div>
            </div>
            <div class="game-content">
                <div style="text-align: center; margin-bottom: 10px;">
                    <h3 style="color: #2c3e50; margin: 0; font-size: 16px;">
                        ${isComplete ? 'Tournament Complete!' : 'Board Entry'}
                    </h3>
                </div>
                
                ${this.getCompactBoardProgressDisplay()}
                
                <div style="text-align: center; margin: 15px 0;">
                    <button id="selectBoardBtn" style="
                        background: linear-gradient(135deg, #3498db, #2980b9); 
                        color: white; 
                        border: none; 
                        padding: 12px 20px; 
                        border-radius: 6px; 
                        cursor: pointer;
                        font-size: 14px;
                        font-weight: bold;
                        box-shadow: 0 3px 10px rgba(52, 152, 219, 0.3);
                        min-height: 44px;
                        min-width: 160px;
                    ">
                        Select Board
                    </button>
                </div>
                
                ${isComplete ? `
                    <div style="
                        background: rgba(39, 174, 96, 0.1); 
                        padding: 15px; 
                        border-radius: 6px; 
                        border-left: 3px solid #27ae60;
                        text-align: center;
                        margin: 15px 0;
                    ">
                        <div style="color: #27ae60; font-weight: bold; font-size: 14px; margin-bottom: 10px;">
                            All boards completed!
                        </div>
                        <button id="viewResultsBtn" style="
                            background: linear-gradient(135deg, #27ae60, #229954);
                            color: white;
                            border: none;
                            padding: 12px 24px;
                            border-radius: 6px;
                            cursor: pointer;
                            font-size: 14px;
                            font-weight: bold;
                            box-shadow: 0 3px 10px rgba(39, 174, 96, 0.3);
                            min-height: 44px;
                            min-width: 160px;
                            touch-action: manipulation;
                            user-select: none;
                        ">
                            View Final Results
                        </button>
                    </div>
                ` : `
                    <div style="
                        background: rgba(241, 196, 15, 0.1); 
                        padding: 8px; 
                        border-radius: 4px; 
                        border-left: 3px solid #f1c40f;
                        margin-top: 10px;
                    ">
                        <div style="color: #2c3e50; font-size: 11px; text-align: center;">
                            <strong>Tip:</strong> Enter results after each round
                        </div>
                    </div>
                `}
            </div>
            <div class="current-state">
                ${isComplete ? 'Tournament complete - Press "View Final Results" or DEAL button' : 'Select board to enter results'}
            </div>
        `;
    }

    /**
     * Get display content for traveler entry state
     */
    getTravelerEntryContent() {
        if (!this.traveler.isActive) {
            return '<div class="current-state">Traveler not active</div>';
        }
        
        const progress = this.getCurrentTravelerProgress();
        const scoringSummary = this.getTravelerScoringSummary();
        const vulnerability = scoringSummary.vulnerabilityDisplay;
        
        const currentResult = this.traveler.data[this.currentResultIndex];
        const contractDisplay = this.getTravelerContractDisplay(currentResult);
        
        let statePrompt = '';
        switch (this.travelerInputState) {
            case 'level_selection':
                statePrompt = 'Select bid level (1-7)';
                break;
            case 'suit_selection':
                statePrompt = 'Select suit';
                break;
            case 'declarer_selection':
                statePrompt = 'Select declarer (N/S/E/W)';
                break;
            case 'double_selection':
                statePrompt = 'Press X for double, or Made/Plus/Down';
                break;
            case 'result_type_selection':
                statePrompt = 'Made exactly, Plus overtricks, or Down?';
                break;
            case 'result_number_selection':
                if (this.resultMode === 'down') {
                    statePrompt = 'Select tricks down (1-7)';
                } else {
                    statePrompt = 'Select overtricks (1-6)';
                }
                break;
            case 'result_complete':
                statePrompt = 'Press Deal for next pair';
                break;
            default:
                statePrompt = 'Traveler entry';
        }
        
        return `
            <div class="title-score-row">
                <div class="mode-title">Board ${this.traveler.boardNumber}</div>
                <div class="score-display">
                    Pair ${progress.current}/${progress.total}
                </div>
            </div>
            <div class="game-content">
                <div style="text-align: center; margin-bottom: 10px;">
                    <div style="font-weight: bold; color: #2c3e50; font-size: 14px;">
                        ${vulnerability}
                    </div>
                    <div style="color: #3498db; font-size: 12px; margin-top: 2px;">
                        Pairs ${progress.nsPair} (NS) vs ${progress.ewPair} (EW)  
                    </div>
                </div>
                
                <div style="margin: 10px 0; padding: 8px; background: rgba(52, 152, 219, 0.1); border-radius: 4px;">
                    <div style="font-size: 12px; color: #2c3e50;">
                        <strong>Contract:</strong> ${contractDisplay}
                    </div>
                </div>
                
                ${currentResult.nsScore !== null || currentResult.ewScore !== null ? `
                    <div style="
                        background: rgba(39, 174, 96, 0.1); 
                        padding: 8px; 
                        border-radius: 4px; 
                        margin: 8px 0;
                        text-align: center;
                    ">
                        <div style="color: #27ae60; font-weight: bold; font-size: 12px;">
                            Score: NS ${currentResult.nsScore || 0} • EW ${currentResult.ewScore || 0}
                        </div>
                    </div>
                ` : ''}
            </div>
            <div class="current-state">${statePrompt}</div>
        `;
    }

    /**
     * Get compact board progress display
     */
    getCompactBoardProgressDisplay() {
        const boardStatus = this.getBoardStatus();
        const totalBoards = boardStatus.length;
        
        if (totalBoards === 0) {
            return '<div style="text-align: center; color: #7f8c8d; font-size: 12px;">No boards configured</div>';
        }
        
        const completedBoards = boardStatus.filter(b => b.completed);
        
        return `
            <div style="margin: 10px 0;">
                <div style="
                    background: rgba(52, 152, 219, 0.1);
                    padding: 8px;
                    border-radius: 4px;
                    margin-bottom: 10px;
                    text-align: center;
                ">
                    <div style="color: #2c3e50; font-weight: bold; font-size: 12px; margin-bottom: 5px;">
                        ${completedBoards.length}/${totalBoards} Complete
                    </div>
                    <div style="
                        background: #ecf0f1;
                        height: 12px;
                        border-radius: 6px;
                        overflow: hidden;
                        position: relative;
                    ">
                        <div style="
                            background: linear-gradient(135deg, #27ae60, #2ecc71);
                            height: 100%;
                            width: ${(completedBoards.length / totalBoards) * 100}%;
                            border-radius: 6px;
                        "></div>
                    </div>
                </div>
                
                <div style="
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(60px, 1fr));
                    gap: 4px;
                    max-height: 120px;
                    overflow-y: auto;
                ">
                    ${boardStatus.map(board => {
                        const statusIcon = board.completed ? '✅' : '⭕';
                        const vulnColor = this.getVulnerabilityColor(board.vulnerability);
                        const vulnAbbrev = { 'None': 'NV', 'NS': 'NS', 'EW': 'EW', 'Both': 'All' };
                        
                        return `
                            <div style="
                                background: ${board.completed ? 'rgba(39, 174, 96, 0.1)' : 'rgba(149, 165, 166, 0.1)'};
                                border: 1px solid ${board.completed ? '#27ae60' : '#bdc3c7'};
                                border-radius: 4px;
                                padding: 4px;
                                text-align: center;
                                font-size: 9px;
                            ">
                                <div style="font-weight: bold; margin-bottom: 2px;">
                                    B${board.number} ${statusIcon}
                                </div>
                                <div style="
                                    color: ${vulnColor}; 
                                    font-size: 8px; 
                                    font-weight: bold;
                                    background: rgba(255,255,255,0.8);
                                    padding: 1px 2px;
                                    border-radius: 4px;
                                ">
                                    ${vulnAbbrev[board.vulnerability]}
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    }

    /**
     * Update display with enhanced state management
     */
    updateDisplay() {
        const content = this.getDisplayContent();
        const display = document.getElementById('display');
        if (display) {
            display.innerHTML = content;
        }
        
        // Update button states
        const activeButtons = this.getActiveButtons();
        this.bridgeApp.updateButtonStates(activeButtons);
        
        // Change NV button to Print for Duplicate mode
        setTimeout(() => {
            // Try multiple selectors to find the NV button
            let nvButton = document.querySelector('button[data-value="NV"]');
            if (!nvButton) {
                // Try finding by text content
                const buttons = document.querySelectorAll('button');
                nvButton = Array.from(buttons).find(btn => btn.textContent.trim() === 'NV');
            }
            
            if (nvButton) {
                nvButton.textContent = 'Print';
                nvButton.style.fontSize = '13px';
                console.log('✅ NV button changed to Print');
            } else {
                console.warn('⚠️ NV button not found');
            }
        }, 100);
        
        // Setup board selection button if in board_selection state
        if (this.inputState === 'board_selection') {
            setTimeout(() => {
                this.setupBoardSelectionButton();
                this.setupViewResultsButton();
            }, 100);
        }
    }

    /**
     * Setup board selection button with mobile enhancements
     */
    setupBoardSelectionButton() {
        const selectBtn = document.getElementById('selectBoardBtn');
        if (!selectBtn) return;
        
        // Remove any existing handlers
        selectBtn.onclick = null;
        
        const boardSelectHandler = (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            selectBtn.style.transform = 'scale(0.95)';
            selectBtn.style.opacity = '0.8';
            
            setTimeout(() => {
                selectBtn.style.transform = '';
                selectBtn.style.opacity = '';
                this.openTravelerPopup();
            }, 100);
        };
        
        // Enhanced mobile properties
        selectBtn.style.touchAction = 'manipulation';
        selectBtn.style.userSelect = 'none';
        selectBtn.style.webkitTapHighlightColor = 'transparent';
        selectBtn.style.cursor = 'pointer';
        selectBtn.style.minHeight = '44px';
        
        selectBtn.addEventListener('click', boardSelectHandler);
        selectBtn.addEventListener('touchend', boardSelectHandler, { passive: false });
        
        selectBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            selectBtn.style.transform = 'scale(0.95)';
            selectBtn.style.opacity = '0.8';
        }, { passive: false });
    }

    /**
     * Setup view results button
     */
    setupViewResultsButton() {
        const resultsBtn = document.getElementById('viewResultsBtn');
        if (!resultsBtn) return;
        
        const resultsHandler = (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            resultsBtn.style.transform = 'scale(0.95)';
            resultsBtn.style.opacity = '0.8';
            
            setTimeout(() => {
                resultsBtn.style.transform = '';
                resultsBtn.style.opacity = '';
                this.handleBoardSelection('DEAL');
            }, 100);
        };
        
        resultsBtn.style.touchAction = 'manipulation';
        resultsBtn.style.userSelect = 'none';
        resultsBtn.style.webkitTapHighlightColor = 'transparent';
        resultsBtn.style.cursor = 'pointer';
        
        resultsBtn.addEventListener('click', resultsHandler);
        resultsBtn.addEventListener('touchend', resultsHandler, { passive: false });
        
        resultsBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            resultsBtn.style.transform = 'scale(0.95)';
            resultsBtn.style.opacity = '0.8';
        }, { passive: false });
    }

    /**
     * Validate session state for consistency
     */
    validateSessionState() {
        const issues = [];
        
        if (this.inputState !== 'pairs_setup' && !this.session.movement) {
            issues.push('Movement not selected but not in setup state');
        }
        
        if (this.inputState === 'board_selection' && !this.session.isSetup) {
            issues.push('In board selection but boards not setup');
        }
        
        const popups = ['boardSelectorPopup', 'movementPopup'];
        const openPopups = popups.filter(id => document.getElementById(id));
        if (openPopups.length > 1) {
            issues.push(`Multiple popups open: ${openPopups.join(', ')}`);
        }
        
        if (issues.length > 0) {
            return { valid: false, issues };
        }
        
        return { valid: true, issues: [] };
    }

    /**
     * Reset session to initial state
     */
    resetSession() {
        this.session = {
            pairs: 0,
            movement: null,
            currentBoard: 1,
            boards: {},
            isSetup: false
        };
        
        this.traveler = {
            isActive: false,
            boardNumber: null,
            data: []
        };
        
        this.inputState = 'pairs_setup';
        
        // Close any open popups
        const popups = ['boardSelectorPopup', 'movementPopup'];
        popups.forEach(id => {
            const popup = document.getElementById(id);
            if (popup) popup.remove();
        });
        
        this.updateDisplay();
    }

    /**
     * Complete cleanup when switching modes
     */
    cleanup() {
        // Close all popups
        const popups = ['boardSelectorPopup', 'movementPopup'];
        popups.forEach(id => {
            const popup = document.getElementById(id);
            if (popup) {
                popup.remove();
            }
        });
        
        // Clean up global references
        if (window.duplicateBridge) {
            delete window.duplicateBridge;
        }
        
        // Reset traveler state
        this.traveler = {
            isActive: false,
            boardNumber: null,
            data: []
        };
        
        // Remove any injected styles
        const injectedStyles = document.querySelectorAll('style[data-duplicate-bridge]');
        injectedStyles.forEach(style => style.remove());
    }
}

// Export for the new module system
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DuplicateBridgeMode;
} else if (typeof window !== 'undefined') {
    window.DuplicateBridgeMode = DuplicateBridgeMode;
}




