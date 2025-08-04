// SECTION ONE - Header and Constructor
/**
 * Duplicate Bridge Mode - Tournament Bridge Scoring (Enhanced)
 * MOBILE ENHANCED VERSION - Full touch support for all devices with popup fixes
 * Updated to work with new modular bridge system
 * 
 * Duplicate Bridge provides tournament-style bridge scoring with:
 * - Matchpoint scoring (most common)
 * - Board-by-board tracking with vulnerability cycles
 * - Traveler sheets for result entry
 * - Multiple pair movements (4, 6, 8 pairs)
 * - Mobile-optimized popups and dropdown controls
 * 
 * Enhanced with comprehensive movement management and mobile touch fixes.
 */

class DuplicateBridgeMode extends BaseBridgeMode {
    constructor(bridgeApp) {
        super(bridgeApp);
        
        this.modeName = 'Duplicate Bridge';
        this.displayName = '🏆 Duplicate Bridge';
        
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
        
        this.inputState = 'pairs_setup';
        
        // Mobile detection and popup fixes
        this.isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        this.isPixel9a = /Pixel 9a|SM-G998/i.test(navigator.userAgent);
        
        console.log('🏆 Duplicate Bridge mode initialized with mobile popup fixes');
        
        // Initialize movements and start
        this.initializeMovements();
        this.initialize();
    }
// END SECTION ONE
// SECTION TWO - Core Methods
    /**
     * Initialize movements for different pair counts
     */
    initializeMovements() {
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
        
        console.log('🏆 Movements initialized:', Object.keys(this.movements));
    }
    
    /**
     * Initialize Duplicate Bridge mode
     */
    initialize() {
        console.log('🎯 Starting Duplicate Bridge session');
        
        this.inputState = 'pairs_setup';
        this.session.isSetup = false;
        this.traveler.isActive = false;
        
        // Set up global reference for popup callbacks
        window.duplicateBridge = this;
        
        this.updateDisplay();
        
        console.log('🎯 Duplicate Bridge initialized');
    }
    
    /**
     * Handle user input - integration with new system
     */
    handleInput(value) {
        console.log(`🎮 Duplicate Bridge input: ${value} in state: ${this.inputState}`);
        
        // Skip input if traveler popup is active
        if (this.traveler.isActive) {
            console.log('🚫 Input blocked - traveler popup active');
            return;
        }
        
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
        
        console.log(`📋 Setup ${this.session.movement.totalBoards} boards for ${this.session.pairs} pairs`);
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
// END SECTION TWO
// SECTION THREE - Action Handlers (MOBILE BOARD LIST VERSION)

    /**
     * Show board selector popup - MOBILE BOARD LIST (NO DROPDOWN)
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
                max-height: 80%; 
                overflow: auto; 
                color: #2c3e50;
                min-width: 280px;
            ">
                <h3 style="text-align: center; margin: 0 0 15px 0; color: #2c3e50;">📋 Select Board</h3>
                
                <div id="boardListContainer" style="
                    max-height: 300px;
                    overflow-y: auto;
                    -webkit-overflow-scrolling: touch;
                    margin: 15px 0;
                ">
                    ${this.getBoardListHTML()}
                </div>
                
                <div style="text-align: center; margin-top: 15px;">
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
                    ">❌ Cancel</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(popup);
        
        // Setup board list handlers
        setTimeout(() => {
            this.setupBoardListEvents();
        }, 100);
        
        console.log('📋 Board list popup created (mobile-friendly)');
    }
    
    /**
     * Generate board list HTML - MOBILE TOUCH OPTIMIZED
     */
    getBoardListHTML() {
        let html = '';
        
        for (let i = 1; i <= this.session.movement.totalBoards; i++) {
            const board = this.session.boards[i];
            const status = board.completed ? '✅' : '⭕';
            const vulnerability = board.vulnerability;
            const vulnDisplay = { 'None': 'None', 'NS': 'NS', 'EW': 'EW', 'Both': 'All' };
            const vulnColor = this.getVulnerabilityColor(vulnerability);
            
            html += `
                <div class="board-list-item" data-board="${i}" style="
                    background: ${board.completed ? 'rgba(39, 174, 96, 0.1)' : 'rgba(52, 152, 219, 0.1)'};
                    border: 2px solid ${board.completed ? '#27ae60' : '#3498db'};
                    border-radius: 8px;
                    padding: 12px;
                    margin: 8px 0;
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
                            Board ${i} ${status}
                        </div>
                        <div style="font-size: 12px; color: #7f8c8d;">
                            ${board.hasResults ? `${board.resultCount || 0} results entered` : 'No results yet'}
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
     * Setup board list touch events - COMPREHENSIVE MOBILE SUPPORT
     */
    setupBoardListEvents() {
        const boardItems = document.querySelectorAll('.board-list-item');
        const cancelBtn = document.getElementById('cancelBoardBtn');
        
        console.log('📱 Setting up board list touch events');
        
        // BOARD ITEM HANDLERS
        boardItems.forEach(item => {
            const boardNumber = parseInt(item.dataset.board);
            
            const selectHandler = (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                console.log(`📱 Board ${boardNumber} selected`);
                
                // Visual feedback
                item.style.transform = 'scale(0.98)';
                item.style.opacity = '0.8';
                
                setTimeout(() => {
                    item.style.transform = '';
                    item.style.opacity = '';
                    
                    // Close popup and open traveler
                    this.closeBoardSelector();
                    setTimeout(() => {
                        this.openSpecificTraveler(boardNumber);
                    }, 100);
                }, 150);
            };
            
            // Add multiple event types for maximum compatibility
            item.addEventListener('click', selectHandler);
            item.addEventListener('touchend', selectHandler, { passive: false });
            
            // Touch start feedback
            item.addEventListener('touchstart', (e) => {
                e.preventDefault();
                item.style.transform = 'scale(0.98)';
                item.style.opacity = '0.8';
            }, { passive: false });
            
            // Reset on touch cancel
            item.addEventListener('touchcancel', () => {
                item.style.transform = '';
                item.style.opacity = '';
            }, { passive: true });
        });
        
        // CANCEL BUTTON
        if (cancelBtn) {
            const cancelHandler = (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('📱 Cancel button pressed');
                this.closeBoardSelector();
            };
            
            cancelBtn.style.touchAction = 'manipulation';
            cancelBtn.style.userSelect = 'none';
            cancelBtn.style.webkitTapHighlightColor = 'transparent';
            
            cancelBtn.addEventListener('click', cancelHandler);
            cancelBtn.addEventListener('touchend', cancelHandler, { passive: false });
            
            // Touch feedback for cancel button
            cancelBtn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                cancelBtn.style.transform = 'scale(0.95)';
                cancelBtn.style.opacity = '0.8';
            }, { passive: false });
            
            cancelBtn.addEventListener('touchend', () => {
                setTimeout(() => {
                    cancelBtn.style.transform = '';
                    cancelBtn.style.opacity = '';
                }, 100);
            }, { passive: false });
        }
        
        console.log(`✅ Board list events setup complete for ${boardItems.length} boards`);
    }
    
    // Keep all other methods from Section 3 unchanged, just replace these three methods:
    // - showBoardSelectorPopup()
    // - Add getBoardListHTML()
    // - Add setupBoardListEvents()
    
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
     * Handle pairs setup selection
     */
    handlePairsSetup(value) {
        // Handle special case for 10+ pairs (not implemented yet)
        const pairCount = value === '0' ? 10 : parseInt(value);
        
        if (this.movements[pairCount]) {
            this.session.pairs = pairCount;
            this.session.movement = this.movements[pairCount];
            this.inputState = 'movement_confirm';
            console.log(`✅ Selected ${pairCount} pairs`);
        } else {
            console.warn(`⚠️ Movement for ${pairCount} pairs not available`);
            this.bridgeApp.showMessage(`Movement for ${pairCount} pairs not available yet`, 'warning');
        }
    }
    
    /**
     * Handle movement confirmation
     */
    handleMovementConfirm(value) {
        if (value === '1') {
            // Show movement details
            this.showMovementPopup();
        } else if (value === '2') {
            // Confirm and setup boards
            this.setupBoards();
            this.inputState = 'board_selection';
            console.log('✅ Movement confirmed, boards setup complete');
        }
    }
    
    /**
     * Handle board selection actions
     */
    handleBoardSelection(value) {
        if (value === 'RESULTS') {
            if (this.areAllBoardsComplete()) {
                this.inputState = 'results';
                console.log('📊 Moving to results display');
            } else {
                this.bridgeApp.showMessage('Complete all boards before viewing results', 'warning');
            }
        }
        // Board selection through popup is handled separately
    }
    
    /**
     * Handle results display actions
     */
    handleResults(value) {
        // Results state actions handled here
        console.log('📊 Results action:', value);
    }
    
    /**
     * Open traveler popup - can be called directly or with board selection
     */
    openTravelerPopup(boardNumber = null) {
        if (this.traveler.isActive) {
            console.log('🚫 Traveler already active');
            return;
        }
        
        if (boardNumber) {
            this.openSpecificTraveler(boardNumber);
        } else {
            this.showBoardSelectorPopup();
        }
    }
    
    /**
     * Close board selector popup
     */
    closeBoardSelector() {
        const popup = document.getElementById('boardSelectorPopup');
        if (popup) {
            popup.remove();
            console.log('📋 Board selector closed');
        }
    }
// END SECTION THREE
// SECTION FOUR - Scoring Logic (FINAL FIXED VERSION)
    /**
     * Open specific traveler for a board
     */
    openSpecificTraveler(boardNumber) {
        this.traveler.isActive = true;
        this.traveler.boardNumber = boardNumber;
        this.traveler.data = this.generateTravelerRows(boardNumber);
        
        this.showSpecificTravelerPopup();
        
        console.log(`📊 Opened traveler for Board ${boardNumber}`);
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
            level: '',
            suit: '',
            declarer: '',
            double: '',
            tricks: '',
            nsScore: null,
            ewScore: null,
            matchpoints: { ns: 0, ew: 0 } // For matchpoint calculation
        }));
    }
    
    /**
     * Show specific traveler popup - MOBILE REWRITE WITH SCROLLING FIXES
     */
    showSpecificTravelerPopup() {
        const vulnerability = this.getBoardVulnerability(this.traveler.boardNumber);
        const vulnDisplay = { 'None': 'None Vul', 'NS': 'NS Vulnerable', 'EW': 'EW Vulnerable', 'Both': 'Both Vulnerable' };
        
        const popup = document.createElement('div');
        popup.id = 'travelerPopup';
        popup.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
            background: rgba(0,0,0,0.85); z-index: 1000; 
            display: flex; align-items: center; justify-content: center;
            -webkit-overflow-scrolling: touch;
            overflow: hidden;
        `;
        
        popup.innerHTML = `
            <div style="
                background: white; 
                padding: 15px; 
                border-radius: 8px; 
                width: 95%; 
                height: 90%; 
                color: #2c3e50;
                display: flex;
                flex-direction: column;
                min-width: 300px;
                overflow: hidden;
            ">
                <div style="
                    text-align: center; 
                    margin-bottom: 15px; 
                    flex-shrink: 0;
                    background: white; 
                    z-index: 10; 
                    padding-bottom: 10px;
                    border-bottom: 2px solid #ecf0f1;
                ">
                    <h3 style="margin: 0; color: #2c3e50; font-size: 18px;">📊 Board ${this.traveler.boardNumber}</h3>
                    <div style="color: #e74c3c; font-weight: bold; font-size: 14px;">${vulnDisplay[vulnerability]}</div>
                </div>
                
                <div id="travelerResults" style="
                    flex: 1;
                    overflow-y: auto;
                    -webkit-overflow-scrolling: touch;
                    transform: translateZ(0);
                    will-change: scroll-position;
                    overflow-anchor: none;
                    padding-right: 5px;
                ">
                    ${this.getMobileTravelerHTML()}
                </div>
                
                <div style="
                    text-align: center; 
                    margin-top: 15px; 
                    flex-shrink: 0;
                    background: white; 
                    padding-top: 15px;
                    border-top: 2px solid #ecf0f1;
                ">
                    <button onclick="window.duplicateBridge.saveTravelerData()" style="
                        background: #27ae60; color: white; border: none; 
                        padding: 12px 18px; border-radius: 6px; margin: 5px;
                        font-size: 14px; font-weight: bold; cursor: pointer;
                        min-height: 44px; min-width: 100px;
                        touch-action: manipulation; user-select: none;
                    ">💾 Save</button>
                    <button onclick="window.duplicateBridge.closeTravelerPopup()" style="
                        background: #e74c3c; color: white; border: none; 
                        padding: 12px 18px; border-radius: 6px; margin: 5px;
                        font-size: 14px; font-weight: bold; cursor: pointer;
                        min-height: 44px; min-width: 100px;
                        touch-action: manipulation; user-select: none;
                    ">❌ Cancel</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(popup);
        
        // Setup mobile-optimized handlers
        setTimeout(() => {
            this.setupMobileTravelerEvents();
            this.setupMobilePopupButtons();
            this.applyPixelScrollingFixes();
        }, 100);
        
        console.log('📊 Mobile traveler popup created with Pixel fixes');
    }
    
    /**
     * Apply Pixel 9a specific scrolling fixes
     */
    applyPixelScrollingFixes() {
        const scrollContainer = document.getElementById('travelerResults');
        if (!scrollContainer) return;
        
        console.log('🔧 Applying Pixel 9a scrolling fixes to traveler...');
        
        // Enhanced scroll container fixes
        scrollContainer.style.height = '100%';
        scrollContainer.style.overflowY = 'scroll'; // Force scroll instead of auto
        scrollContainer.style.webkitOverflowScrolling = 'touch';
        scrollContainer.style.transform = 'translateZ(0)';
        scrollContainer.style.willChange = 'scroll-position';
        scrollContainer.style.overflowAnchor = 'none';
        
        // Enhanced scrollbar visibility
        const scrollbarStyle = document.createElement('style');
        scrollbarStyle.textContent = `
            #travelerResults::-webkit-scrollbar {
                width: 12px !important;
                background: rgba(255, 255, 255, 0.2) !important;
            }
            #travelerResults::-webkit-scrollbar-thumb {
                background: rgba(52, 152, 219, 0.6) !important;
                border-radius: 6px !important;
                border: 2px solid rgba(255, 255, 255, 0.1) !important;
            }
            #travelerResults::-webkit-scrollbar-track {
                background: rgba(0, 0, 0, 0.05) !important;
                border-radius: 6px !important;
            }
        `;
        document.head.appendChild(scrollbarStyle);
        
        // Test scrolling and add fallback if needed
        setTimeout(() => {
            const testScroll = () => {
                const initialScrollTop = scrollContainer.scrollTop;
                scrollContainer.scrollTop = 50;
                
                setTimeout(() => {
                    const newScrollTop = scrollContainer.scrollTop;
                    console.log(`📱 Scroll test - Initial: ${initialScrollTop}, Set: 50, Actual: ${newScrollTop}`);
                    
                    if (newScrollTop === initialScrollTop && scrollContainer.scrollHeight > scrollContainer.clientHeight) {
                        console.warn('⚠️ Scrolling not working - applying touch handlers');
                        this.addTouchScrollHandlers(scrollContainer);
                    }
                    
                    scrollContainer.scrollTop = 0;
                }, 100);
            };
            
            testScroll();
        }, 200);
    }
    
    /**
     * Add manual touch scroll handlers for problematic devices
     */
    addTouchScrollHandlers(container) {
        let touchStartY = null;
        let isScrolling = false;
        
        container.addEventListener('touchstart', (e) => {
            touchStartY = e.touches[0].clientY;
            isScrolling = false;
            console.log('📱 Touch scroll start');
        }, { passive: true });
        
        container.addEventListener('touchmove', (e) => {
            if (touchStartY !== null) {
                const touchY = e.touches[0].clientY;
                const deltaY = touchStartY - touchY;
                
                if (Math.abs(deltaY) > 5) {
                    isScrolling = true;
                    const newScrollTop = container.scrollTop + deltaY * 0.8;
                    const maxScroll = container.scrollHeight - container.clientHeight;
                    
                    container.scrollTop = Math.max(0, Math.min(newScrollTop, maxScroll));
                    touchStartY = touchY;
                }
            }
        }, { passive: true });
        
        container.addEventListener('touchend', () => {
            touchStartY = null;
            isScrolling = false;
        }, { passive: true });
        
        // Add visual indicator
        const scrollHint = document.createElement('div');
        scrollHint.innerHTML = '👆 Swipe to scroll';
        scrollHint.style.cssText = `
            position: absolute;
            top: 60px;
            right: 15px;
            background: rgba(52, 152, 219, 0.9);
            color: white;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 10px;
            z-index: 100;
            pointer-events: none;
        `;
        container.parentElement.style.position = 'relative';
        container.parentElement.appendChild(scrollHint);
        
        setTimeout(() => {
            scrollHint.style.transition = 'opacity 1s ease';
            scrollHint.style.opacity = '0';
            setTimeout(() => scrollHint.remove(), 1000);
        }, 3000);
        
        console.log('✅ Touch scroll handlers added');
    }
    
    /**
     * Generate mobile-optimized traveler HTML - ONE RESULT AT A TIME
     */
    getMobileTravelerHTML() {
        let html = '';
        
        this.traveler.data.forEach((row, index) => {
            html += `
                <div class="result-card" data-index="${index}" style="
                    background: rgba(52, 152, 219, 0.1);
                    border: 2px solid #3498db;
                    border-radius: 8px;
                    padding: 15px;
                    margin: 10px 0;
                    position: relative;
                ">
                    <div style="
                        background: #3498db;
                        color: white;
                        padding: 8px;
                        border-radius: 6px;
                        margin: -15px -15px 15px -15px;
                        font-weight: bold;
                        text-align: center;
                    ">
                        Pairs ${row.nsPair} (NS) vs ${row.ewPair} (EW)
                    </div>
                    
                    <!-- Contract Entry -->
                    <div style="margin-bottom: 15px;">
                        <label style="display: block; font-weight: bold; margin-bottom: 8px; color: #2c3e50;">
                            📋 Contract:
                        </label>
                        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; margin-bottom: 10px;">
                            <div>
                                <label style="font-size: 12px; color: #7f8c8d;">Level:</label>
                                <div class="mobile-select" data-field="level" data-row="${index}" style="
                                    background: white;
                                    border: 2px solid #bdc3c7;
                                    border-radius: 6px;
                                    padding: 12px;
                                    text-align: center;
                                    font-weight: bold;
                                    cursor: pointer;
                                    min-height: 44px;
                                    display: flex;
                                    align-items: center;
                                    justify-content: center;
                                ">${row.level || 'Select'}</div>
                            </div>
                            <div>
                                <label style="font-size: 12px; color: #7f8c8d;">Suit:</label>
                                <div class="mobile-select" data-field="suit" data-row="${index}" style="
                                    background: white;
                                    border: 2px solid #bdc3c7;
                                    border-radius: 6px;
                                    padding: 12px;
                                    text-align: center;
                                    font-weight: bold;
                                    cursor: pointer;
                                    min-height: 44px;
                                    display: flex;
                                    align-items: center;
                                    justify-content: center;
                                ">${row.suit || 'Select'}</div>
                            </div>
                            <div>
                                <label style="font-size: 12px; color: #7f8c8d;">Declarer:</label>
                                <div class="mobile-select" data-field="declarer" data-row="${index}" style="
                                    background: white;
                                    border: 2px solid #bdc3c7;
                                    border-radius: 6px;
                                    padding: 12px;
                                    text-align: center;
                                    font-weight: bold;
                                    cursor: pointer;
                                    min-height: 44px;
                                    display: flex;
                                    align-items: center;
                                    justify-content: center;
                                ">${row.declarer || 'Select'}</div>
                            </div>
                        </div>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
                            <div>
                                <label style="font-size: 12px; color: #7f8c8d;">Double:</label>
                                <div class="mobile-select" data-field="double" data-row="${index}" style="
                                    background: white;
                                    border: 2px solid #bdc3c7;
                                    border-radius: 6px;
                                    padding: 12px;
                                    text-align: center;
                                    font-weight: bold;
                                    cursor: pointer;
                                    min-height: 44px;
                                    display: flex;
                                    align-items: center;
                                    justify-content: center;
                                ">${row.double || 'None'}</div>
                            </div>
                            <div>
                                <label style="font-size: 12px; color: #7f8c8d;">Result:</label>
                                <div class="mobile-select" data-field="tricks" data-row="${index}" style="
                                    background: white;
                                    border: 2px solid #bdc3c7;
                                    border-radius: 6px;
                                    padding: 12px;
                                    text-align: center;
                                    font-weight: bold;
                                    cursor: pointer;
                                    min-height: 44px;
                                    display: flex;
                                    align-items: center;
                                    justify-content: center;
                                ">${this.formatTricksDisplay(row)}</div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Score Display -->
                    <div style="
                        background: rgba(39, 174, 96, 0.1);
                        border: 1px solid #27ae60;
                        border-radius: 6px;
                        padding: 10px;
                        text-align: center;
                    ">
                        <div style="font-weight: bold; margin-bottom: 5px; color: #2c3e50;">Scores:</div>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                            <div>
                                <div style="font-size: 12px; color: #7f8c8d;">NS Score:</div>
                                <div id="nsScore_${index}" style="font-weight: bold; font-size: 16px; color: #27ae60;">
                                    ${row.nsScore !== null ? row.nsScore : '-'}
                                </div>
                            </div>
                            <div>
                                <div style="font-size: 12px; color: #7f8c8d;">EW Score:</div>
                                <div id="ewScore_${index}" style="font-weight: bold; font-size: 16px; color: #e74c3c;">
                                    ${row.ewScore !== null ? row.ewScore : '-'}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });
        
        return html;
    }
    
    /**
     * Format tricks display based on contract level
     */
    formatTricksDisplay(row) {
        if (!row.level || row.tricks === '') {
            return 'Select';
        }
        
        const level = parseInt(row.level);
        const expectedTricks = 6 + level;
        const actualTricks = parseInt(row.tricks);
        const difference = actualTricks - expectedTricks;
        
        if (difference === 0) {
            return '= (Made exactly)';
        } else if (difference > 0) {
            return `+${difference} (${actualTricks} tricks)`;
        } else {
            return `${difference} (${actualTricks} tricks)`;
        }
    }
    
    /**
     * Setup mobile traveler events - TOUCH OPTIMIZED
     */
    setupMobileTravelerEvents() {
        const selectElements = document.querySelectorAll('.mobile-select');
        
        console.log('📱 Setting up mobile traveler events');
        
        selectElements.forEach(element => {
            const field = element.dataset.field;
            const rowIndex = parseInt(element.dataset.row);
            
            // Enhanced touch properties
            element.style.touchAction = 'manipulation';
            element.style.userSelect = 'none';
            element.style.webkitTapHighlightColor = 'transparent';
            
            const selectHandler = (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                console.log(`📱 Opening ${field} selector for row ${rowIndex}`);
                
                // Visual feedback
                element.style.transform = 'scale(0.95)';
                element.style.opacity = '0.8';
                
                setTimeout(() => {
                    element.style.transform = '';
                    element.style.opacity = '';
                    this.showMobileFieldSelector(field, rowIndex, element);
                }, 100);
            };
            
            // Add multiple event types
            element.addEventListener('click', selectHandler);
            element.addEventListener('touchend', selectHandler, { passive: false });
            
            // Touch start feedback
            element.addEventListener('touchstart', (e) => {
                e.preventDefault();
                element.style.transform = 'scale(0.95)';
                element.style.opacity = '0.8';
            }, { passive: false });
        });
        
        console.log(`✅ Mobile traveler events setup for ${selectElements.length} selectors`);
    }
    
    /**
     * Show mobile field selector popup - WITH ENHANCED SCROLLING
     */
    showMobileFieldSelector(field, rowIndex, targetElement) {
        const options = this.getFieldOptions(field, rowIndex);
        const currentValue = this.traveler.data[rowIndex][field];
        
        const selectorPopup = document.createElement('div');
        selectorPopup.id = 'fieldSelectorPopup';
        selectorPopup.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
            background: rgba(0,0,0,0.9); z-index: 2000; 
            display: flex; align-items: center; justify-content: center;
            overflow: hidden;
        `;
        
        selectorPopup.innerHTML = `
            <div style="
                background: white; 
                padding: 20px; 
                border-radius: 8px; 
                width: 90%; 
                height: 80%;
                color: #2c3e50;
                min-width: 250px;
                display: flex;
                flex-direction: column;
                overflow: hidden;
            ">
                <h4 style="margin: 0 0 15px 0; text-align: center; flex-shrink: 0;">
                    Select ${field === 'tricks' ? 'Result' : field.charAt(0).toUpperCase() + field.slice(1)}
                </h4>
                
                <div id="optionsContainer" style="
                    flex: 1;
                    overflow-y: auto;
                    -webkit-overflow-scrolling: touch;
                    transform: translateZ(0);
                    will-change: scroll-position;
                    padding-right: 5px;
                ">
                    ${options.map(option => `
                        <div class="option-item" data-value="${option.value}" style="
                            background: ${currentValue === option.value ? '#3498db' : 'rgba(52, 152, 219, 0.1)'};
                            color: ${currentValue === option.value ? 'white' : '#2c3e50'};
                            border: 2px solid #3498db;
                            border-radius: 6px;
                            padding: 12px;
                            margin: 5px 0;
                            text-align: center;
                            font-weight: bold;
                            cursor: pointer;
                            min-height: 44px;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            touch-action: manipulation;
                            user-select: none;
                        ">${option.label}</div>
                    `).join('')}
                </div>
                
                <div style="text-align: center; margin-top: 15px; flex-shrink: 0;">
                    <button onclick="this.parentElement.parentElement.remove()" style="
                        background: #e74c3c; color: white; border: none; 
                        padding: 10px 20px; border-radius: 6px;
                        font-weight: bold; min-height: 44px;
                        touch-action: manipulation;
                    ">Cancel</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(selectorPopup);
        
        // Apply scrolling fixes to options container
        setTimeout(() => {
            this.setupOptionScrolling();
            this.setupOptionSelection(rowIndex, targetElement);
        }, 100);
    }
    
    /**
     * Setup enhanced scrolling for options container
     */
    setupOptionScrolling() {
        const container = document.getElementById('optionsContainer');
        if (!container) return;
        
        // Apply same fixes as main traveler
        container.style.overflowY = 'scroll';
        container.style.webkitOverflowScrolling = 'touch';
        container.style.transform = 'translateZ(0)';
        container.style.willChange = 'scroll-position';
        
        // Enhanced scrollbar for options
        const optionScrollStyle = document.createElement('style');
        optionScrollStyle.textContent = `
            #optionsContainer::-webkit-scrollbar {
                width: 8px !important;
                background: rgba(255, 255, 255, 0.2) !important;
            }
            #optionsContainer::-webkit-scrollbar-thumb {
                background: rgba(52, 152, 219, 0.6) !important;
                border-radius: 4px !important;
            }
        `;
        document.head.appendChild(optionScrollStyle);
        
        // Test and add manual handlers if needed
        setTimeout(() => {
            const testScrollTop = container.scrollTop;
            container.scrollTop = 20;
            
            setTimeout(() => {
                if (container.scrollTop === testScrollTop && container.scrollHeight > container.clientHeight) {
                    console.log('📱 Adding manual scroll for options');
                    this.addTouchScrollHandlers(container);
                }
                container.scrollTop = 0;
            }, 50);
        }, 100);
    }
    
    /**
     * Setup option selection events - FIXED VERSION
     */
    setupOptionSelection(rowIndex, targetElement) {
        const optionItems = document.querySelectorAll('.option-item');
        const field = targetElement.dataset.field;
        
        console.log(`📱 Setting up option selection for field: ${field}, row: ${rowIndex}`);
        
        optionItems.forEach(item => {
            const value = item.dataset.value;
            
            const optionHandler = (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                console.log(`📱 Selected ${field} = ${value} for row ${rowIndex}`);
                
                // Update data
                this.traveler.data[rowIndex][field] = value;
                
                // Update display based on field type
                if (field === 'tricks') {
                    // For tricks, use smart formatting
                    const row = this.traveler.data[rowIndex];
                    targetElement.textContent = this.formatTricksDisplay(row);
                } else {
                    // For other fields, use the label from the option
                    targetElement.textContent = this.getDisplayLabel(field, value);
                }
                
                // Update visual state
                targetElement.style.background = value ? 'rgba(39, 174, 96, 0.1)' : 'white';
                targetElement.style.borderColor = value ? '#27ae60' : '#bdc3c7';
                
                // Auto-calculate if row is complete
                const row = this.traveler.data[rowIndex];
                if (row.level && row.suit && row.declarer && row.tricks !== '') {
                    console.log(`🧮 Auto-calculating score for row ${rowIndex}`);
                    setTimeout(() => {
                        this.calculateScore(rowIndex);
                    }, 100);
                }
                
                // Close popup
                const popup = document.getElementById('fieldSelectorPopup');
                if (popup) popup.remove();
                
                console.log(`✅ Updated ${field} successfully`);
            };
            
            // Add multiple event types for maximum compatibility
            item.addEventListener('click', optionHandler);
            item.addEventListener('touchend', optionHandler, { passive: false });
            
            // Touch feedback
            item.addEventListener('touchstart', (e) => {
                e.preventDefault();
                item.style.transform = 'scale(0.95)';
                item.style.opacity = '0.8';
            }, { passive: false });
            
            item.addEventListener('touchcancel', () => {
                item.style.transform = '';
                item.style.opacity = '';
            }, { passive: true });
            
            // Reset on touchend
            item.addEventListener('touchend', () => {
                setTimeout(() => {
                    item.style.transform = '';
                    item.style.opacity = '';
                }, 100);
            }, { passive: false });
        });
        
        console.log(`✅ Option selection setup complete for ${optionItems.length} options`);
    }
    
    /**
     * Get display label for field value
     */
    getDisplayLabel(field, value) {
        if (!value) return 'Select';
        
        switch (field) {
            case 'level':
                return value;
            case 'suit':
                const suitNames = { '♣': '♣', '♦': '♦', '♥': '♥', '♠': '♠', 'NT': 'NT' };
                return suitNames[value] || value;
            case 'declarer':
                return value;
            case 'double':
                return value || 'None';
            default:
                return value;
        }
    }
    
    /**
     * Get options for each field - SMART TRICKS VERSION
     */
    getFieldOptions(field, rowIndex) {
        switch (field) {
            case 'level':
                return [
                    { value: '1', label: '1' },
                    { value: '2', label: '2' },
                    { value: '3', label: '3' },
                    { value: '4', label: '4' },
                    { value: '5', label: '5' },
                    { value: '6', label: '6' },
                    { value: '7', label: '7' }
                ];
            case 'suit':
                return [
                    { value: '♣', label: '♣ Clubs' },
                    { value: '♦', label: '♦ Diamonds' },
                    { value: '♥', label: '♥ Hearts' },
                    { value: '♠', label: '♠ Spades' },
                    { value: 'NT', label: 'NT No Trump' }
                ];
            case 'declarer':
                return [
                    { value: 'N', label: 'N (North)' },
                    { value: 'S', label: 'S (South)' },
                    { value: 'E', label: 'E (East)' },
                    { value: 'W', label: 'W (West)' }
                ];
            case 'double':
                return [
                    { value: '', label: 'None' },
                    { value: 'X', label: 'X (Doubled)' },
                    { value: 'XX', label: 'XX (Redoubled)' }
                ];
            case 'tricks':
                return this.getSmartTricksOptions(rowIndex);
            default:
                return [];
        }
    }
    
    /**
     * Get smart tricks options based on contract level
     */
    getSmartTricksOptions(rowIndex) {
        const row = this.traveler.data[rowIndex];
        const level = parseInt(row.level);
        
        if (!level) {
            return [{ value: '', label: 'Select contract level first' }];
        }
        
        const expectedTricks = 6 + level;
        const options = [];
        
        // Add options from 1 to 13 tricks
        for (let tricks = 1; tricks <= 13; tricks++) {
            const difference = tricks - expectedTricks;
            let label;
            
            if (difference === 0) {
                label = `${tricks} tricks (= Made exactly)`;
            } else if (difference > 0) {
                label = `${tricks} tricks (+${difference} overtricks)`;
            } else {
                label = `${tricks} tricks (${difference} down)`;
            }
            
            options.push({ value: tricks.toString(), label });
        }
        
        return options;
    }
    
    /**
     * Calculate score for a specific traveler row - Standard Duplicate Scoring
     */
    calculateScore(rowIndex) {
        const row = this.traveler.data[rowIndex];
        if (!row.level || !row.suit || !row.declarer || row.tricks === '') return;
        
        console.log(`🧮 Calculating duplicate score for row ${rowIndex}:`, row);
        
        const vulnerability = this.getBoardVulnerability(this.traveler.boardNumber);
        const declarerSide = ['N', 'S'].includes(row.declarer) ? 'NS' : 'EW';
        
        // Determine if declarer's side is vulnerable
        const isVulnerable = this.isDeclarerVulnerable(this.traveler.boardNumber, row.declarer);
        
        const level = parseInt(row.level);
        const tricks = parseInt(row.tricks);
        const needed = 6 + level;
        const result = tricks - needed;
        const isDoubled = row.double === 'X';
        const isRedoubled = row.double === 'XX';
        
        let score = 0;
        
        if (result >= 0) {
            // Contract made - Standard bridge scoring
            const suitPoints = { '♣': 20, '♦': 20, '♥': 30, '♠': 30, 'NT': 30 };
            let basicScore = level * suitPoints[row.suit];
            if (row.suit === 'NT') basicScore += 10; // NT first trick bonus
            
            // Apply doubling to basic score
            if (isDoubled || isRedoubled) {
                basicScore *= (isRedoubled ? 4 : 2);
            }
            
            score = basicScore;
            
            // Add overtricks
            if (result > 0) {
                if (isDoubled || isRedoubled) {
                    const overtrickValue = isVulnerable ? 200 : 100;
                    score += result * overtrickValue * (isRedoubled ? 2 : 1);
                } else {
                    score += result * suitPoints[row.suit];
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
            
        } else {
            // Contract failed - Penalty scoring
            const undertricks = Math.abs(result);
            
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
        
        // Assign scores to pairs (in duplicate, no negative scores shown)
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
        
        console.log(`✅ Calculated scores: NS=${row.nsScore}, EW=${row.ewScore}`);
        
        // Update display
        this.updateScoreDisplay(rowIndex);
    }
    
    /**
     * Update score display in traveler table
     */
    updateScoreDisplay(rowIndex) {
        const row = this.traveler.data[rowIndex];
        const nsSpan = document.getElementById(`nsScore_${rowIndex}`);
        const ewSpan = document.getElementById(`ewScore_${rowIndex}`);
        
        if (nsSpan) nsSpan.textContent = row.nsScore || '-';
        if (ewSpan) ewSpan.textContent = row.ewScore || '-';
    }
    
    /**
     * Calculate all scores and matchpoints
     */
    calculateAllScores() {
        console.log('🧮 Calculating all scores and matchpoints');
        
        // First calculate all individual scores
        this.traveler.data.forEach((row, index) => {
            if (row.level && row.suit && row.declarer && row.tricks !== '') {
                this.calculateScore(index);
            }
        });
        
        // Then calculate matchpoints
        this.calculateMatchpoints();
        
        this.bridgeApp.showMessage('All scores calculated!', 'success');
    }
    
    /**
     * Calculate matchpoints for all pairs on this board
     */
    calculateMatchpoints() {
        const completedResults = this.traveler.data.filter(row => 
            row.nsScore !== null && row.ewScore !== null
        );
        
        if (completedResults.length < 2) {
            console.log('⚠️ Need at least 2 results for matchpoint calculation');
            return;
        }
        
        const maxMatchpoints = (completedResults.length - 1) * 2;
        
        // Calculate NS matchpoints
        completedResults.forEach(row => {
            let nsMatchpoints = 0;
            let ewMatchpoints = 0;
            
            completedResults.forEach(otherRow => {
                if (row !== otherRow) {
                    // Compare NS scores
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
        
        console.log('🏆 Matchpoints calculated for', completedResults.length, 'results');
    }
    
    /**
     * Save traveler data to board
     */
    saveTravelerData() {
        // Mark board as completed if at least one result is entered
        const hasResults = this.traveler.data.some(row => 
            row.nsScore !== null || row.ewScore !== null
        );
        
        if (hasResults) {
            this.session.boards[this.traveler.boardNumber].completed = true;
            this.session.boards[this.traveler.boardNumber].results = [...this.traveler.data];
            
            console.log(`💾 Saved traveler data for Board ${this.traveler.boardNumber}`);
            this.bridgeApp.showMessage(`Board ${this.traveler.boardNumber} saved!`, 'success');
        } else {
            console.log('⚠️ No results to save');
            this.bridgeApp.showMessage('Enter at least one result before saving', 'warning');
        }
        
        this.closeTravelerPopup();
    }
    
    /**
     * Close traveler popup and cleanup
     */
    closeTravelerPopup() {
        const popup = document.getElementById('travelerPopup');
        if (popup) {
            popup.remove();
            console.log('📊 Traveler popup closed');
        }
        
        // Clean up field selector popup if open
        const fieldPopup = document.getElementById('fieldSelectorPopup');
        if (fieldPopup) {
            fieldPopup.remove();
        }
        
        this.traveler.isActive = false;
        this.traveler.boardNumber = null;
        this.traveler.data = [];
        
        this.updateDisplay();
    }
// END SECTION FOUR
// SECTION FIVE - Game Management
    /**
     * Show movement popup with mobile-optimized table
     */
    showMovementPopup() {
        const movement = this.session.movement;
        
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
                    <h3 style="margin: 0; color: #2c3e50;">🏆 ${movement.description}</h3>
                    <div style="color: #7f8c8d; font-size: 14px; margin-top: 5px;">
                        ${movement.pairs} pairs • ${movement.tables} tables • ${movement.rounds} rounds
                    </div>
                </div>
                
                ${this.getMovementTableHTML()}
                
                <div style="text-align: center; margin-top: 20px; position: sticky; bottom: 0; background: white; padding-top: 15px;">
                    <button onclick="this.parentElement.parentElement.parentElement.remove()" style="
                        background: #3498db; color: white; border: none; 
                        padding: 12px 24px; border-radius: 6px; margin: 5px;
                        font-size: 16px; cursor: pointer; font-weight: bold;
                        min-height: 44px; min-width: 100px;
                        touch-action: manipulation; user-select: none;
                    ">📋 Close</button>
                    <button onclick="
                        this.parentElement.parentElement.parentElement.remove(); 
                        window.duplicateBridge.handleAction('2');
                    " style="
                        background: #27ae60; color: white; border: none; 
                        padding: 12px 24px; border-radius: 6px; margin: 5px;
                        font-size: 16px; cursor: pointer; font-weight: bold;
                        min-height: 44px; min-width: 100px;
                        touch-action: manipulation; user-select: none;
                    ">✅ Confirm & Start</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(popup);
        
        // Setup mobile button enhancements
        setTimeout(() => {
            this.setupMobilePopupButtons();
        }, 100);
        
        console.log('🏆 Movement popup displayed with mobile optimization');
    }
    
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
        
        // Add table headers
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
            
            // Add table data with improved formatting
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
                    <strong>📊 Movement Summary:</strong><br>
                    • Each pair plays ${movement.totalBoards} boards<br>
                    • ${movement.rounds} rounds of ${Math.floor(movement.totalBoards / movement.rounds)} boards each<br>
                    • Estimated time: ${movement.description.match(/~(.+)/)?.[1] || '2-3 hours'}
                </div>
            </div>
        `;
        
        return html;
    }
    
    /**
     * Setup mobile popup button enhancements - COMPREHENSIVE FIX
     */
    setupMobilePopupButtons() {
        const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        if (!isMobile) {
            console.log('📱 Desktop detected - skipping mobile popup fixes');
            return;
        }
        
        console.log('📱 Setting up mobile popup button enhancements');
        
        setTimeout(() => {
            const popups = ['travelerPopup', 'boardSelectorPopup', 'movementPopup'];
            
            popups.forEach(popupId => {
                const popup = document.getElementById(popupId);
                if (!popup) return;
                
                console.log(`📱 Enhancing buttons in ${popupId}`);
                
                const buttons = popup.querySelectorAll('button');
                
                buttons.forEach((button, index) => {
                    // Enhanced mobile button properties
                    button.style.touchAction = 'manipulation';
                    button.style.userSelect = 'none';
                    button.style.webkitUserSelect = 'none';
                    button.style.webkitTapHighlightColor = 'transparent';
                    button.style.minHeight = '44px';
                    button.style.minWidth = '44px';
                    button.style.cursor = 'pointer';
                    
                    // Store original handlers
                    const originalOnclick = button.onclick;
                    const onclickAttr = button.getAttribute('onclick');
                    
                    // Enhanced mobile touch handler
                    const mobileHandler = (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        
                        console.log(`📱 Mobile button pressed: ${button.textContent.trim()}`);
                        
                        // Visual feedback
                        button.style.transform = 'scale(0.95)';
                        button.style.opacity = '0.8';
                        
                        setTimeout(() => {
                            button.style.transform = '';
                            button.style.opacity = '';
                            
                            // Execute original function
                            try {
                                if (originalOnclick) {
                                    originalOnclick.call(button, e);
                                } else if (onclickAttr) {
                                    const func = new Function('event', onclickAttr);
                                    func.call(button, e);
                                }
                            } catch (error) {
                                console.error('Error executing mobile button handler:', error);
                            }
                        }, 100);
                    };
                    
                    // Remove existing handlers and add enhanced ones
                    button.onclick = null;
                    button.removeAttribute('onclick');
                    
                    button.addEventListener('touchend', mobileHandler, { passive: false });
                    button.addEventListener('click', mobileHandler);
                    
                    // Touch start feedback
                    button.addEventListener('touchstart', (e) => {
                        e.preventDefault();
                        button.style.transform = 'scale(0.95)';
                        button.style.opacity = '0.8';
                    }, { passive: false });
                });
                
                console.log(`✅ Enhanced ${buttons.length} buttons in ${popupId}`);
            });
        }, 200);
    }
    
    /**
     * Check if all boards are completed
     */
    areAllBoardsComplete() {
        if (!this.session.isSetup || !this.session.boards) {
            return false;
        }
        
        return Object.values(this.session.boards).every(board => board.completed);
    }
    
    /**
     * Get completion status summary
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
            resultCount: board.results ? board.results.length : 0,
            hasResults: board.results && board.results.some(r => r.nsScore !== null || r.ewScore !== null)
        }));
    }
    
    /**
     * Handle back navigation with state management
     */
    handleBack() {
        console.log(`🔙 Back pressed from state: ${this.inputState}`);
        
        // Close any active popups first
        if (this.traveler.isActive) {
            this.closeTravelerPopup();
            return true;
        }
        
        // Close any open popups
        const popups = ['travelerPopup', 'boardSelectorPopup', 'movementPopup'];
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
                return false; // Let app handle return to mode selection
        }
        
        this.updateDisplay();
        return true;
    }
    
    /**
     * Check if back navigation is possible
     */
    canGoBack() {
        return this.inputState !== 'pairs_setup' || this.traveler.isActive;
    }
    
    /**
     * Reset session to initial state
     */
    resetSession() {
        console.log('🔄 Resetting duplicate bridge session');
        
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
        const popups = ['travelerPopup', 'boardSelectorPopup', 'movementPopup'];
        popups.forEach(id => {
            const popup = document.getElementById(id);
            if (popup) popup.remove();
        });
        
        this.updateDisplay();
    }
    
    /**
     * Get active buttons for current state with enhanced logic
     */
    getActiveButtons() {
        // No buttons active when traveler popup is open
        if (this.traveler.isActive) {
            return [];
        }
        
        switch (this.inputState) {
            case 'pairs_setup':
                return ['4', '6', '8'];
                
            case 'movement_confirm':
                return ['1', '2', 'BACK'];
                
            case 'board_selection':
                const buttons = ['BACK'];
                
                // Only show RESULTS if all boards are complete
                if (this.areAllBoardsComplete()) {
                    buttons.push('RESULTS');
                }
                
                return buttons;
                
            case 'results':
                return ['BACK'];
                
            default:
                return [];
        }
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
        
        // Setup board selection button if in board_selection state
        if (this.inputState === 'board_selection') {
            setTimeout(() => {
                this.setupBoardSelectionButton();
            }, 100);
        }
        
        console.log(`🔄 Display updated for state: ${this.inputState}`);
    }
    
    /**
     * Setup board selection button with mobile enhancements
     */
    setupBoardSelectionButton() {
        const selectBtn = document.getElementById('selectBoardBtn');
        if (!selectBtn) return;
        
        console.log('📱 Setting up board selection button with mobile enhancements');
        
        // Remove any existing handlers
        selectBtn.onclick = null;
        
        const boardSelectHandler = (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            console.log('📋 Board selection button pressed');
            
            // Visual feedback
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
        
        // Add both event types for maximum compatibility
        selectBtn.addEventListener('click', boardSelectHandler);
        selectBtn.addEventListener('touchend', boardSelectHandler, { passive: false });
        
        // Touch start feedback
        selectBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            selectBtn.style.transform = 'scale(0.95)';
            selectBtn.style.opacity = '0.8';
        }, { passive: false });
        
        console.log('✅ Board selection button mobile enhancement complete');
    }
    
    /**
     * Validate session state for consistency
     */
    validateSessionState() {
        const issues = [];
        
        // Check if session is properly initialized
        if (this.inputState !== 'pairs_setup' && !this.session.movement) {
            issues.push('Movement not selected but not in setup state');
        }
        
        // Check if boards are setup when expected
        if (this.inputState === 'board_selection' && !this.session.isSetup) {
            issues.push('In board selection but boards not setup');
        }
        
        // Check for orphaned popups
        const popups = ['travelerPopup', 'boardSelectorPopup', 'movementPopup'];
        const openPopups = popups.filter(id => document.getElementById(id));
        if (openPopups.length > 1) {
            issues.push(`Multiple popups open: ${openPopups.join(', ')}`);
        }
        
        if (issues.length > 0) {
            console.warn('🚨 Duplicate Bridge session validation issues:', issues);
            return { valid: false, issues };
        }
        
        console.log('✅ Duplicate Bridge session validation passed');
        return { valid: true, issues: [] };
    }
// END SECTION FIVE
// SECTION SIX - Help and Quit Methods
    /**
     * Get help content specific to Duplicate Bridge
     */
    getHelpContent() {
        return {
            title: 'Duplicate Bridge Help',
            content: `
                <div class="help-section">
                    <h4>What is Duplicate Bridge?</h4>
                    <p><strong>Duplicate Bridge</strong> is the tournament form of bridge where multiple pairs play the same deals, allowing direct comparison of results. This creates fair competition by eliminating the luck of the cards.</p>
                </div>
                
                <div class="help-section">
                    <h4>🏆 Key Features</h4>
                    <ul>
                        <li><strong>Multiple Movements:</strong> Support for 4, 6, or 8 pairs</li>
                        <li><strong>Board Tracking:</strong> Each board played by multiple pairs</li>
                        <li><strong>Traveler Sheets:</strong> Record results for each board</li>
                        <li><strong>Matchpoint Scoring:</strong> Compare your result to others</li>
                        <li><strong>Mobile Optimized:</strong> Touch-friendly interface</li>
                    </ul>
                </div>
                
                <div class="help-section">
                    <h4>🎯 How to Use</h4>
                    <ol>
                        <li><strong>Select Pairs:</strong> Choose 4, 6, or 8 pairs</li>
                        <li><strong>View Movement:</strong> Optional - see seating assignments</li>
                        <li><strong>Confirm Setup:</strong> Start the session</li>
                        <li><strong>Enter Results:</strong> Use traveler sheets for each board</li>
                        <li><strong>View Results:</strong> See final standings when complete</li>
                    </ol>
                </div>
                
                <div class="help-section">
                    <h4>📋 Traveler Sheets</h4>
                    <p>For each board, enter:</p>
                    <ul>
                        <li><strong>Contract:</strong> Level, suit, declarer</li>
                        <li><strong>Doubling:</strong> X for double, XX for redouble</li>
                        <li><strong>Tricks:</strong> Number of tricks taken (0-13)</li>
                        <li><strong>Auto-calculation:</strong> Scores calculated automatically</li>
                    </ul>
                </div>
                
                <div class="help-section">
                    <h4>🎮 Movement Types</h4>
                    <table style="width: 100%; border-collapse: collapse; margin: 10px 0;">
                        <tr style="background: rgba(255,255,255,0.1);">
                            <th style="padding: 8px; text-align: center; border: 1px solid rgba(255,255,255,0.2);">Pairs</th>
                            <th style="padding: 8px; text-align: center; border: 1px solid rgba(255,255,255,0.2);">Tables</th>
                            <th style="padding: 8px; text-align: center; border: 1px solid rgba(255,255,255,0.2);">Boards</th>
                            <th style="padding: 8px; text-align: center; border: 1px solid rgba(255,255,255,0.2);">Time</th>
                        </tr>
                        <tr>
                            <td style="padding: 8px; text-align: center; border: 1px solid rgba(255,255,255,0.2);">4</td>
                            <td style="padding: 8px; text-align: center; border: 1px solid rgba(255,255,255,0.2);">2</td>
                            <td style="padding: 8px; text-align: center; border: 1px solid rgba(255,255,255,0.2);">12</td>
                            <td style="padding: 8px; text-align: center; border: 1px solid rgba(255,255,255,0.2);">~2 hours</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px; text-align: center; border: 1px solid rgba(255,255,255,0.2);">6</td>
                            <td style="padding: 8px; text-align: center; border: 1px solid rgba(255,255,255,0.2);">3</td>
                            <td style="padding: 8px; text-align: center; border: 1px solid rgba(255,255,255,0.2);">10</td>
                            <td style="padding: 8px; text-align: center; border: 1px solid rgba(255,255,255,0.2);">~1.5 hours</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px; text-align: center; border: 1px solid rgba(255,255,255,0.2);">8</td>
                            <td style="padding: 8px; text-align: center; border: 1px solid rgba(255,255,255,0.2);">4</td>
                            <td style="padding: 8px; text-align: center; border: 1px solid rgba(255,255,255,0.2);">14</td>
                            <td style="padding: 8px; text-align: center; border: 1px solid rgba(255,255,255,0.2);">~2.5 hours</td>
                        </tr>
                    </table>
                </div>
                
                <div class="help-section">
                    <h4>🃏 Vulnerability Cycle</h4>
                    <p>Boards follow standard duplicate vulnerability:</p>
                    <ul>
                        <li><strong>Boards 1, 8, 11, 14:</strong> None vulnerable</li>
                        <li><strong>Boards 2, 5, 12, 15:</strong> NS vulnerable</li>
                        <li><strong>Boards 3, 6, 9, 16:</strong> EW vulnerable</li>
                        <li><strong>Boards 4, 7, 10, 13:</strong> Both vulnerable</li>
                    </ul>
                </div>
                
                <div class="help-section">
                    <h4>📱 Mobile Tips</h4>
                    <ul>
                        <li><strong>Touch Controls:</strong> All buttons optimized for touch</li>
                        <li><strong>Scrolling Tables:</strong> Swipe to scroll movement and traveler tables</li>
                        <li><strong>Dropdown Menus:</strong> Enhanced for mobile browsers</li>
                        <li><strong>Auto-Save:</strong> Results saved automatically when complete</li>
                    </ul>
                </div>
                
                <div class="help-section">
                    <h4>💡 Scoring Tips</h4>
                    <ul>
                        <li><strong>Standard Scoring:</strong> Uses official bridge scoring rules</li>
                        <li><strong>Auto-calculation:</strong> Scores appear when contract data is complete</li>
                        <li><strong>Vulnerability:</strong> Automatically applied based on board number</li>
                        <li><strong>Matchpoints:</strong> Calculated when all results are entered</li>
                    </ul>
                </div>
                
                <div class="help-section">
                    <h4>🎯 Best Practices</h4>
                    <ul>
                        <li>Enter results promptly after each round</li>
                        <li>Double-check contract details before saving</li>
                        <li>Use the movement table to track pair positions</li>
                        <li>Complete all boards before viewing final results</li>
                    </ul>
                </div>
            `,
            buttons: [
                { text: 'Close Help', action: 'close', class: 'close-btn' }
            ]
        };
    }
    
    /**
     * Show Duplicate Bridge specific help
     */
    showHelp() {
        const helpContent = this.getHelpContent();
        this.bridgeApp.showModal(helpContent.title, helpContent.content);
    }
    
    /**
     * Show Duplicate Bridge specific quit options
     */
    showQuit() {
        const completionStatus = this.getCompletionStatus();
        const licenseStatus = this.bridgeApp.licenseManager.checkLicenseStatus();
        
        let sessionContent = '';
        if (this.session.isSetup) {
            const movement = this.session.movement;
            sessionContent = `
                <div class="help-section">
                    <h4>🏆 Current Session Status</h4>
                    <p><strong>Movement:</strong> ${movement.description}</p>
                    <p><strong>Pairs:</strong> ${movement.pairs} pairs</p>
                    <p><strong>Progress:</strong> ${completionStatus.completed}/${completionStatus.total} boards (${completionStatus.percentage}%)</p>
                    <p><strong>State:</strong> ${this.getReadableState()}</p>
                    ${completionStatus.percentage === 100 ? 
                        '<p style="color: #27ae60; font-weight: bold;">✅ All boards complete!</p>' : 
                        '<p style="color: #f39c12;">⏳ Session in progress...</p>'
                    }
                </div>
            `;
        } else {
            sessionContent = `
                <div class="help-section">
                    <h4>🎯 Session Setup</h4>
                    <p>Session not yet configured. You can:</p>
                    <ul>
                        <li>Continue setting up your duplicate session</li>
                        <li>Start a new session</li>
                        <li>Return to main menu</li>
                    </ul>
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
            ${sessionContent}
            ${licenseSection}
            <div class="help-section">
                <h4>🎮 Session Options</h4>
                <p>What would you like to do?</p>
            </div>
        `;
        
        const buttons = [
            { text: 'Continue Session', action: () => {}, class: 'continue-btn' }
        ];
        
        if (this.session.isSetup && completionStatus.completed > 0) {
            buttons.push({ text: 'Show Progress', action: () => this.showSessionProgress(), class: 'progress-btn' });
        }
        
        if (this.session.isSetup) {
            buttons.push({ text: 'Reset Session', action: () => this.confirmResetSession(), class: 'reset-btn' });
        } else {
            buttons.push({ text: 'New Session', action: () => this.resetSession(), class: 'new-session-btn' });
        }
        
        buttons.push(
            { text: 'Show Help', action: () => this.showHelp(), class: 'help-btn' },
            { text: 'Return to Main Menu', action: () => this.returnToMainMenu(), class: 'menu-btn' }
        );
        
        this.bridgeApp.showModal('🏆 Duplicate Bridge Options', content, buttons);
    }
    
    /**
     * Get readable state description
     */
    getReadableState() {
        const stateDescriptions = {
            'pairs_setup': 'Selecting number of pairs',
            'movement_confirm': 'Confirming movement setup',
            'board_selection': 'Entering board results',
            'results': 'Viewing final results'
        };
        
        return stateDescriptions[this.inputState] || this.inputState;
    }
    
    /**
     * Show detailed session progress
     */
    showSessionProgress() {
        const boardStatus = this.getBoardStatus();
        const completionStatus = this.getCompletionStatus();
        
        let progressContent = `
            <div class="help-section">
                <h4>📊 Session Progress</h4>
                <p><strong>Overall:</strong> ${completionStatus.completed}/${completionStatus.total} boards (${completionStatus.percentage}%)</p>
            </div>
            
            <div class="help-section">
                <h4>📋 Board Status</h4>
                <div style="
                    max-height: 300px; 
                    overflow-y: auto; 
                    border: 1px solid #bdc3c7; 
                    border-radius: 4px;
                    background: rgba(255,255,255,0.95);
                    -webkit-overflow-scrolling: touch;
                ">
        `;
        
        boardStatus.forEach(board => {
            const statusIcon = board.completed ? '✅' : '⭕';
            const vulnColor = this.getVulnerabilityColor(board.vulnerability);
            
            progressContent += `
                <div style="
                    padding: 8px 12px; 
                    border-bottom: 1px solid #ecf0f1;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    font-size: 14px;
                ">
                    <div>
                        <strong>Board ${board.number}</strong> ${statusIcon}
                        <span style="color: ${vulnColor}; margin-left: 8px;">
                            ${board.vulnerability}
                        </span>
                    </div>
                    <div style="color: #7f8c8d; font-size: 12px;">
                        ${board.hasResults ? `${board.resultCount} results` : 'No results'}
                    </div>
                </div>
            `;
        });
        
        progressContent += `
                </div>
            </div>
            
            <div class="help-section">
                <h4>🎯 Next Steps</h4>
                ${completionStatus.percentage === 100 ? 
                    '<p style="color: #27ae60;">All boards complete! You can view final results.</p>' :
                    '<p style="color: #3498db;">Continue entering results for remaining boards.</p>'
                }
            </div>
        `;
        
        const progressButtons = [
            { text: 'Continue Session', action: () => {}, class: 'continue-btn' },
            { text: 'Back to Options', action: () => this.showQuit(), class: 'back-btn' }
        ];
        
        this.bridgeApp.showModal('📊 Session Progress', progressContent, progressButtons);
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
    
    /**
     * Confirm session reset with warning
     */
    confirmResetSession() {
        const completionStatus = this.getCompletionStatus();
        
        const warningMessage = completionStatus.completed > 0 ? 
            `⚠️ WARNING: This will delete all entered results for ${completionStatus.completed} boards!\n\nAre you sure you want to start over?` :
            'Start a new duplicate bridge session?\n\nThis will return to pair selection.';
        
        const confirmed = confirm(warningMessage);
        
        if (confirmed) {
            this.resetSession();
            console.log('🔄 Session reset confirmed by user');
        }
    }
    
    /**
     * Return to main menu
     */
    returnToMainMenu() {
        // Clean up any open popups first
        this.cleanup();
        
        this.bridgeApp.showLicensedMode({ 
            type: this.bridgeApp.licenseManager.getLicenseData()?.type || 'FULL' 
        });
    }
    
    /**
     * Show movement details as help
     */
    showMovementDetails() {
        if (!this.session.movement) {
            this.bridgeApp.showMessage('No movement selected', 'warning');
            return;
        }
        
        const movement = this.session.movement;
        
        const content = `
            <div class="help-section">
                <h4>🏆 ${movement.description}</h4>
                <ul>
                    <li><strong>Pairs:</strong> ${movement.pairs}</li>
                    <li><strong>Tables:</strong> ${movement.tables}</li>
                    <li><strong>Rounds:</strong> ${movement.rounds}</li>
                    <li><strong>Total Boards:</strong> ${movement.totalBoards}</li>
                    <li><strong>Boards per Round:</strong> ${Math.floor(movement.totalBoards / movement.rounds)}</li>
                </ul>
            </div>
            
            <div class="help-section">
                <h4>📋 How It Works</h4>
                <p>Each pair will:</p>
                <ul>
                    <li>Play at different tables during each round</li>
                    <li>Play against different opponents</li>
                    <li>Play all ${movement.totalBoards} boards exactly once</li>
                    <li>Have their results compared using matchpoint scoring</li>
                </ul>
            </div>
            
            <div class="help-section">
                <h4>⏱️ Timing</h4>
                <p>Estimated session time: <strong>${movement.description.match(/~(.+)/)?.[1] || '2-3 hours'}</strong></p>
                <p>This includes time for:</p>
                <ul>
                    <li>Playing all boards (~6-8 minutes per board)</li>
                    <li>Moving between rounds</li>
                    <li>Entering and checking results</li>
                </ul>
            </div>
        `;
        
        const buttons = [
            { text: 'Close', action: 'close', class: 'close-btn' },
            { text: 'View Full Movement', action: () => this.showMovementPopup(), class: 'movement-btn' }
        ];
        
        this.bridgeApp.showModal('🏆 Movement Details', content, buttons);
    }
    
    /**
     * Emergency cleanup function
     */
    emergencyCleanup() {
        console.log('🚨 Emergency cleanup triggered');
        
        // Close all popups
        const popups = ['travelerPopup', 'boardSelectorPopup', 'movementPopup'];
        popups.forEach(id => {
            const popup = document.getElementById(id);
            if (popup) {
                popup.remove();
                console.log(`🧹 Emergency removed ${id}`);
            }
        });
        
        // Reset traveler state
        this.traveler.isActive = false;
        this.traveler.boardNumber = null;
        this.traveler.data = [];
        
        // Clean up global references
        delete window.calculateAllScores;
        delete window.saveTravelerData;
        delete window.closeTravelerPopup;
        delete window.duplicateBridge;
        
        // Force display update
        this.updateDisplay();
        
        console.log('✅ Emergency cleanup completed');
    }
// END SECTION SIX
// SECTION SEVEN - Score Display Methods
    /**
     * Show detailed results with mobile scrolling fixes - COMPREHENSIVE VERSION
     */
    showDetailedResults() {
        if (!this.session.isSetup) {
            this.bridgeApp.showModal('📊 Results', '<p>No session data available.</p>');
            return;
        }
        
        const completionStatus = this.getCompletionStatus();
        
        if (completionStatus.completed === 0) {
            this.bridgeApp.showModal('📊 Results', '<p>No results have been entered yet.</p>');
            return;
        }

        let resultsContent = `
            <div class="results-summary">
                <h4>📊 Session Summary</h4>
                <p><strong>Movement:</strong> ${this.session.movement.description}</p>
                <p><strong>Progress:</strong> ${completionStatus.completed}/${completionStatus.total} boards (${completionStatus.percentage}%)</p>
                ${completionStatus.percentage === 100 ? 
                    '<p style="color: #27ae60; font-weight: bold;">✅ All boards complete!</p>' :
                    '<p style="color: #f39c12;">⏳ Session in progress...</p>'
                }
            </div>
            
            <div class="results-details">
                <h4>🏆 Board Results</h4>
                <div class="results-scroll-container" style="
                    max-height: 350px; 
                    overflow-y: auto; 
                    overflow-x: hidden;
                    -webkit-overflow-scrolling: touch;
                    font-size: 12px;
                    border: 1px solid #444;
                    border-radius: 6px;
                    background: rgba(255,255,255,0.98);
                    margin: 10px 0;
                    position: relative;
                    box-shadow: inset 0 2px 4px rgba(0,0,0,0.1);
                ">
        `;
        
        // Display results for each completed board
        const completedBoards = Object.values(this.session.boards)
            .filter(board => board.completed && board.results && board.results.length > 0)
            .sort((a, b) => a.number - b.number);
        
        if (completedBoards.length === 0) {
            resultsContent += `
                <div style="padding: 20px; text-align: center; color: #7f8c8d;">
                    <p>No completed boards with results yet.</p>
                    <p>Enter traveler results to see detailed scoring.</p>
                </div>
            `;
        } else {
            completedBoards.forEach((board, boardIndex) => {
                const vulnColor = this.getVulnerabilityColor(board.vulnerability);
                const vulnDisplay = { 'None': 'None', 'NS': 'NS', 'EW': 'EW', 'Both': 'All' };
                
                resultsContent += `
                    <div style="
                        background: rgba(52, 152, 219, 0.08);
                        margin: 8px 6px;
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
                            <span>🃏 Board ${board.number}</span>
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
                    resultsContent += `
                        <div style="color: #7f8c8d; font-style: italic; font-size: 11px;">
                            No scored results yet
                        </div>
                    `;
                } else {
                    resultsWithScores.forEach((result, resultIndex) => {
                        const contractStr = result.level && result.suit ? 
                            `${result.level}${result.suit}${result.double || ''}` : 'No contract';
                        const declarerStr = result.declarer || '?';
                        const tricksStr = result.tricks !== '' ? ` = ${result.tricks} tricks` : '';
                        
                        const nsScore = result.nsScore || 0;
                        const ewScore = result.ewScore || 0;
                        const topScore = Math.max(nsScore, ewScore);
                        
                        resultsContent += `
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
                                            ${contractStr} by ${declarerStr}${tricksStr}
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
                
                resultsContent += `</div>`;
            });
        }
        
        resultsContent += `
                </div>
            </div>
            
            <div style="
                text-align: center; 
                font-size: 11px; 
                color: #666; 
                margin-top: 15px;
                padding: 10px;
                background: rgba(52, 152, 219, 0.05);
                border-radius: 6px;
            ">
                🏆 Duplicate Bridge: Tournament scoring with board-by-board comparison<br>
                <span style="color: #3498db;">On mobile: Use "Refresh Scroll" if scrolling issues occur</span>
            </div>
        `;
        
        const buttons = [
            { text: 'Back to Session', action: () => {}, class: 'continue-btn' },
            { text: 'Refresh Scroll', action: () => this.refreshResultsDisplay(), class: 'refresh-btn' },
            { text: 'Export Results', action: () => this.exportResults(), class: 'export-btn' }
        ];
        
        this.bridgeApp.showModal('📊 Duplicate Bridge Results', resultsContent, buttons);
        
        // Apply mobile scrolling fixes after modal is shown
        setTimeout(() => {
            this.applyMobileScrollingFixes();
        }, 150);
    }
    
    /**
     * Refresh results display to fix scrolling issues - PIXEL 9A FIX
     */
    refreshResultsDisplay() {
        console.log('🔄 Refreshing results display for better scrolling...');
        
        // Simply re-show the detailed results - forces DOM refresh
        this.showDetailedResults();
        
        // Add visual feedback
        setTimeout(() => {
            const container = document.querySelector('.results-scroll-container');
            if (container) {
                // Flash border to indicate refresh
                container.style.border = '2px solid #27ae60';
                container.style.transition = 'border-color 0.3s ease';
                
                setTimeout(() => {
                    container.style.border = '1px solid #444';
                }, 600);
                
                // Force scroll activation by scrolling to bottom and back
                container.scrollTop = container.scrollHeight;
                setTimeout(() => {
                    container.scrollTop = 0;
                }, 100);
            }
        }, 200);
    }
    
    /**
     * Apply comprehensive mobile scrolling fixes - ENHANCED FOR DUPLICATE BRIDGE
     */
    applyMobileScrollingFixes() {
        if (!this.isMobile) {
            console.log('📱 Desktop detected - skipping mobile scrolling fixes');
            return;
        }
        
        console.log('🔧 Applying enhanced mobile scrolling fixes for duplicate bridge...');
        
        // Find modal and scroll containers
        const modal = document.querySelector('.modal-content');
        const scrollContainer = document.querySelector('.results-scroll-container');
        
        if (modal && scrollContainer) {
            // Enhanced modal scrolling
            modal.style.maxHeight = '90vh';
            modal.style.overflowY = 'auto';
            modal.style.webkitOverflowScrolling = 'touch';
            modal.style.position = 'relative';
            modal.style.transform = 'translateZ(0)'; // Hardware acceleration
            
            // Enhanced scroll container fixes
            scrollContainer.style.height = '350px'; // Fixed height
            scrollContainer.style.overflowY = 'scroll'; // Force scroll
            scrollContainer.style.webkitOverflowScrolling = 'touch';
            scrollContainer.style.transform = 'translateZ(0)';
            scrollContainer.style.willChange = 'scroll-position';
            scrollContainer.style.overflowAnchor = 'none'; // Prevent anchor shifting
            
            // Enhanced scrollbar visibility for mobile
            const scrollbarStyle = document.createElement('style');
            scrollbarStyle.textContent = `
                .results-scroll-container::-webkit-scrollbar {
                    width: 12px !important;
                    background: rgba(255, 255, 255, 0.2) !important;
                }
                .results-scroll-container::-webkit-scrollbar-thumb {
                    background: rgba(52, 152, 219, 0.6) !important;
                    border-radius: 6px !important;
                    border: 2px solid rgba(255, 255, 255, 0.1) !important;
                }
                .results-scroll-container::-webkit-scrollbar-track {
                    background: rgba(0, 0, 0, 0.05) !important;
                    border-radius: 6px !important;
                }
                .results-scroll-container::-webkit-scrollbar-thumb:hover {
                    background: rgba(52, 152, 219, 0.8) !important;
                }
            `;
            document.head.appendChild(scrollbarStyle);
            
            // Test scrolling functionality
            const testScroll = () => {
                const initialScrollTop = scrollContainer.scrollTop;
                scrollContainer.scrollTop = 50;
                
                setTimeout(() => {
                    const newScrollTop = scrollContainer.scrollTop;
                    console.log(`📱 Scroll test - Initial: ${initialScrollTop}, Set: 50, Actual: ${newScrollTop}`);
                    console.log(`📱 Container dimensions - Height: ${scrollContainer.clientHeight}, ScrollHeight: ${scrollContainer.scrollHeight}`);
                    
                    if (newScrollTop === initialScrollTop && scrollContainer.scrollHeight > scrollContainer.clientHeight) {
                        console.warn('⚠️ Scrolling may not be working properly - applying fallback fixes');
                        
                        // Fallback: Add visual scroll indicator
                        scrollContainer.style.border = '3px solid #3498db';
                        scrollContainer.style.boxShadow = 'inset 0 0 15px rgba(52, 152, 219, 0.3)';
                        
                        // Add scroll hint
                        const scrollHint = document.createElement('div');
                        scrollHint.innerHTML = '👆 Touch and drag to scroll results';
                        scrollHint.style.cssText = `
                            position: absolute;
                            top: 15px;
                            right: 15px;
                            background: rgba(52, 152, 219, 0.9);
                            color: white;
                            padding: 6px 12px;
                            border-radius: 6px;
                            font-size: 11px;
                            z-index: 200;
                            pointer-events: none;
                            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                        `;
                        scrollContainer.style.position = 'relative';
                        scrollContainer.appendChild(scrollHint);
                        
                        // Fade out hint after 3 seconds
                        setTimeout(() => {
                            scrollHint.style.transition = 'opacity 1s ease';
                            scrollHint.style.opacity = '0';
                            setTimeout(() => scrollHint.remove(), 1000);
                        }, 3000);
                    } else {
                        console.log('✅ Scrolling appears to be working correctly');
                    }
                    
                    // Reset scroll position
                    scrollContainer.scrollTop = 0;
                }, 100);
            };
            
            testScroll();
            
            // Enhanced touch event handlers for problematic devices
            let touchStartY = null;
            let isScrolling = false;
            
            scrollContainer.addEventListener('touchstart', (e) => {
                touchStartY = e.touches[0].clientY;
                isScrolling = false;
                console.log('📱 Touch scroll start detected');
            }, { passive: true });
            
            scrollContainer.addEventListener('touchmove', (e) => {
                if (touchStartY !== null) {
                    const touchY = e.touches[0].clientY;
                    const deltaY = touchStartY - touchY;
                    
                    // Only handle if significant movement
                    if (Math.abs(deltaY) > 5) {
                        isScrolling = true;
                        const newScrollTop = scrollContainer.scrollTop + deltaY * 0.8;
                        const maxScroll = scrollContainer.scrollHeight - scrollContainer.clientHeight;
                        
                        scrollContainer.scrollTop = Math.max(0, Math.min(newScrollTop, maxScroll));
                        touchStartY = touchY;
                        
                        console.log(`📱 Touch scroll: ${scrollContainer.scrollTop}/${maxScroll}`);
                    }
                }
            }, { passive: true });
            
            scrollContainer.addEventListener('touchend', () => {
                touchStartY = null;
                if (isScrolling) {
                    console.log('📱 Touch scroll completed');
                }
                isScrolling = false;
            }, { passive: true });
            
            console.log('✅ Enhanced mobile scrolling fixes applied for duplicate bridge results');
        } else {
            console.warn('⚠️ Could not find modal or scroll container for scrolling fixes');
        }
    }
    
    /**
     * Show board summary for quick overview
     */
    showBoardSummary() {
        if (!this.session.isSetup) {
            this.bridgeApp.showMessage('No session active', 'warning');
            return;
        }
        
        const boardStatus = this.getBoardStatus();
        const completionStatus = this.getCompletionStatus();
        
        let summaryContent = `
            <div class="summary-header">
                <h4>📋 Board Summary</h4>
                <p><strong>Progress:</strong> ${completionStatus.completed}/${completionStatus.total} boards (${completionStatus.percentage}%)</p>
            </div>
            
            <div class="board-grid" style="
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
                gap: 8px;
                margin: 15px 0;
                max-height: 300px;
                overflow-y: auto;
                -webkit-overflow-scrolling: touch;
            ">
        `;
        
        boardStatus.forEach(board => {
            const statusIcon = board.completed ? '✅' : '⭕';
            const vulnColor = this.getVulnerabilityColor(board.vulnerability);
            const vulnAbbrev = { 'None': 'NV', 'NS': 'NS', 'EW': 'EW', 'Both': 'All' };
            
            summaryContent += `
                <div style="
                    background: ${board.completed ? 'rgba(39, 174, 96, 0.1)' : 'rgba(149, 165, 166, 0.1)'};
                    border: 2px solid ${board.completed ? '#27ae60' : '#bdc3c7'};
                    border-radius: 8px;
                    padding: 10px;
                    text-align: center;
                    cursor: ${board.completed ? 'default' : 'pointer'};
                    transition: all 0.2s ease;
                " onclick="${board.completed ? '' : `window.duplicateBridge.openTravelerPopup(${board.number})`}">
                    <div style="font-weight: bold; font-size: 14px; margin-bottom: 4px;">
                        Board ${board.number} ${statusIcon}
                    </div>
                    <div style="
                        color: ${vulnColor}; 
                        font-size: 11px; 
                        font-weight: bold;
                        background: rgba(255,255,255,0.8);
                        padding: 2px 6px;
                        border-radius: 10px;
                        display: inline-block;
                        border: 1px solid ${vulnColor};
                    ">
                        ${vulnAbbrev[board.vulnerability]}
                    </div>
                    <div style="color: #7f8c8d; font-size: 10px; margin-top: 4px;">
                        ${board.hasResults ? `${board.resultCount} results` : 'No results'}
                    </div>
                </div>
            `;
        });
        
        summaryContent += `
            </div>
            
            <div style="
                text-align: center;
                margin-top: 15px;
                font-size: 12px;
                color: #7f8c8d;
            ">
                ${completionStatus.percentage < 100 ? 
                    '💡 Click incomplete boards to enter results' :
                    '🎉 All boards complete! Ready for final results.'
                }
            </div>
        `;
        
        const buttons = [
            { text: 'Close Summary', action: 'close', class: 'close-btn' }
        ];
        
        if (completionStatus.percentage === 100) {
            buttons.unshift({ text: 'View Results', action: () => this.showDetailedResults(), class: 'results-btn' });
        }
        
        this.bridgeApp.showModal('📋 Board Summary', summaryContent, buttons);
        
        // Setup board click handlers for mobile
        setTimeout(() => {
            this.setupBoardSummaryEvents();
        }, 100);
    }
    
    /**
     * Setup board summary click events for mobile
     */
    setupBoardSummaryEvents() {
        const boardCards = document.querySelectorAll('.board-grid > div');
        
        boardCards.forEach(card => {
            if (card.onclick) {
                // Enhance for mobile
                card.style.touchAction = 'manipulation';
                card.style.userSelect = 'none';
                card.style.webkitTapHighlightColor = 'transparent';
                
                const originalOnclick = card.onclick;
                card.onclick = null;
                
                const mobileHandler = (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    // Visual feedback
                    card.style.transform = 'scale(0.95)';
                    card.style.opacity = '0.8';
                    
                    setTimeout(() => {
                        card.style.transform = '';
                        card.style.opacity = '';
                        
                        if (originalOnclick) {
                            originalOnclick.call(card, e);
                        }
                    }, 100);
                };
                
                card.addEventListener('click', mobileHandler);
                card.addEventListener('touchend', mobileHandler, { passive: false });
            }
        });
    }
    
    /**
     * Export results in text format
     */
    exportResults() {
        const results = this.generateResultsText();
        
        // Create downloadable text file
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
                    const tricks = result.tricks !== '' ? result.tricks : '?';
                    
                    text += `  Pairs ${result.nsPair} vs ${result.ewPair}: `;
                    text += `${contract} by ${declarer} = ${tricks} tricks\n`;
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
// END SECTION SEVEN
// SECTION EIGHT - Utility and Game Management
    /**
     * Calculate final standings with matchpoint totals
     */
    calculateFinalStandings() {
        if (!this.session.isSetup) {
            console.warn('⚠️ Cannot calculate standings - session not setup');
            return [];
        }
        
        console.log('🏆 Calculating final standings for duplicate bridge');
        
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
            
            if (resultsWithScores.length < 2) return; // Need at least 2 results for comparison
            
            // Recalculate matchpoints for this board
            this.calculateBoardMatchpoints(resultsWithScores);
            
            // Add to pair totals
            resultsWithScores.forEach(result => {
                if (result.matchpoints) {
                    // NS pair
                    if (pairTotals[result.nsPair]) {
                        pairTotals[result.nsPair].totalMatchpoints += result.matchpoints.ns;
                        pairTotals[result.nsPair].maxPossibleMatchpoints += (resultsWithScores.length - 1) * 2;
                        pairTotals[result.nsPair].boardsPlayed++;
                        pairTotals[result.nsPair].totalScore += result.nsScore || 0;
                    }
                    
                    // EW pair
                    if (pairTotals[result.ewPair]) {
                        pairTotals[result.ewPair].totalMatchpoints += result.matchpoints.ew;
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
                // Sort by percentage, then by total matchpoints
                if (b.percentage !== a.percentage) return b.percentage - a.percentage;
                return b.totalMatchpoints - a.totalMatchpoints;
            });
        
        console.log('📊 Final standings calculated:', standings);
        return standings;
    }
    
    /**
     * Calculate matchpoints for a specific board's results
     */
    calculateBoardMatchpoints(results) {
        if (results.length < 2) return;
        
        // Calculate NS matchpoints (EW are complementary)
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
        
        console.log(`🧮 Matchpoints calculated for ${results.length} results`);
    }
    
    /**
     * Show final standings table
     */
    showFinalStandings() {
        const standings = this.calculateFinalStandings();
        
        if (standings.length === 0) {
            this.bridgeApp.showModal('🏆 Final Standings', '<p>No results available for standings calculation.</p>');
            return;
        }
        
        let standingsContent = `
            <div class="standings-header">
                <h4>🏆 Final Standings</h4>
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
                <strong>📊 Scoring:</strong> Matchpoints (MP) are awarded by comparing your result to others on the same board.
                Beat another pair = 2 MP, tie = 1 MP each, lose = 0 MP.
                Percentage shows MP earned vs maximum possible.
            </div>
        `;
        
        const buttons = [
            { text: 'Close Standings', action: 'close', class: 'close-btn' },
            { text: 'Export Standings', action: () => this.exportStandings(standings), class: 'export-btn' },
            { text: 'View Board Details', action: () => this.showDetailedResults(), class: 'details-btn' }
        ];
        
        this.bridgeApp.showModal('🏆 Final Standings', standingsContent, buttons);
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
     * Get session statistics for analysis
     */
    getSessionStatistics() {
        const completedBoards = Object.values(this.session.boards)
            .filter(board => board.completed && board.results);
        
        const totalResults = completedBoards.reduce((sum, board) => 
            sum + (board.results ? board.results.filter(r => r.nsScore !== null || r.ewScore !== null).length : 0), 0
        );
        
        // Contract analysis
        const contractStats = {
            levels: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0 },
            suits: { '♣': 0, '♦': 0, '♥': 0, '♠': 0, 'NT': 0 },
            doubles: { normal: 0, doubled: 0, redoubled: 0 },
            outcomes: { made: 0, failed: 0 },
            vulnerabilityOutcomes: { None: { made: 0, failed: 0 }, NS: { made: 0, failed: 0 }, EW: { made: 0, failed: 0 }, Both: { made: 0, failed: 0 } }
        };
        
        let totalScore = 0;
        let highestScore = 0;
        let lowestScore = 0;
        
        completedBoards.forEach(board => {
            if (!board.results) return;
            
            board.results.forEach(result => {
                if (result.nsScore === null && result.ewScore === null) return;
                
                // Contract statistics
                if (result.level) contractStats.levels[result.level]++;
                if (result.suit) contractStats.suits[result.suit]++;
                
                if (result.double === 'X') contractStats.doubles.doubled++;
                else if (result.double === 'XX') contractStats.doubles.redoubled++;
                else contractStats.doubles.normal++;
                
                // Outcome analysis
                const nsScore = result.nsScore || 0;
                const ewScore = result.ewScore || 0;
                const topScore = Math.max(nsScore, ewScore);
                
                if (topScore > 0) {
                    contractStats.outcomes.made++;
                    contractStats.vulnerabilityOutcomes[board.vulnerability].made++;
                } else {
                    contractStats.outcomes.failed++;
                    contractStats.vulnerabilityOutcomes[board.vulnerability].failed++;
                }
                
                totalScore += topScore;
                if (topScore > highestScore) highestScore = topScore;
                if (lowestScore === 0 || topScore < lowestScore) lowestScore = topScore;
            });
        });
        
        return {
            sessionInfo: {
                movement: this.session.movement.description,
                pairs: this.session.pairs,
                totalBoards: this.session.movement.totalBoards,
                completedBoards: completedBoards.length,
                totalResults: totalResults
            },
            contractStats,
            scoreStats: {
                totalScore,
                averageScore: totalResults > 0 ? Math.round(totalScore / totalResults) : 0,
                highestScore,
                lowestScore
            },
            completionRate: this.session.movement.totalBoards > 0 ? 
                Math.round((completedBoards.length / this.session.movement.totalBoards) * 100) : 0
        };
    }
    
    /**
     * Show session statistics
     */
    showSessionStatistics() {
        const stats = this.getSessionStatistics();
        
        let statsContent = `
            <div class="stats-header">
                <h4>📈 Session Statistics</h4>
                <p><strong>Movement:</strong> ${stats.sessionInfo.movement}</p>
            </div>
            
            <div class="stats-grid" style="
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 15px;
                margin: 20px 0;
            ">
                <div style="
                    background: rgba(52, 152, 219, 0.1);
                    padding: 15px;
                    border-radius: 8px;
                    border-left: 4px solid #3498db;
                ">
                    <h5 style="margin: 0 0 10px 0; color: #2c3e50;">📊 Session Progress</h5>
                    <div style="font-size: 13px; color: #2c3e50;">
                        <strong>Completion:</strong> ${stats.completionRate}%<br>
                        <strong>Boards:</strong> ${stats.sessionInfo.completedBoards}/${stats.sessionInfo.totalBoards}<br>
                        <strong>Results:</strong> ${stats.sessionInfo.totalResults}<br>
                        <strong>Pairs:</strong> ${stats.sessionInfo.pairs}
                    </div>
                </div>
                
                <div style="
                    background: rgba(39, 174, 96, 0.1);
                    padding: 15px;
                    border-radius: 8px;
                    border-left: 4px solid #27ae60;
                ">
                    <h5 style="margin: 0 0 10px 0; color: #2c3e50;">💰 Score Analysis</h5>
                    <div style="font-size: 13px; color: #2c3e50;">
                        <strong>Average:</strong> ${stats.scoreStats.averageScore}<br>
                        <strong>Highest:</strong> ${stats.scoreStats.highestScore}<br>
                        <strong>Lowest:</strong> ${stats.scoreStats.lowestScore}<br>
                        <strong>Total:</strong> ${stats.scoreStats.totalScore}
                    </div>
                </div>
                
                <div style="
                    background: rgba(241, 196, 15, 0.1);
                    padding: 15px;
                    border-radius: 8px;
                    border-left: 4px solid #f1c40f;
                ">
                    <h5 style="margin: 0 0 10px 0; color: #2c3e50;">🃏 Contract Levels</h5>
                    <div style="font-size: 12px; color: #2c3e50;">
                        ${Object.entries(stats.contractStats.levels)
                            .filter(([level, count]) => count > 0)
                            .map(([level, count]) => `<strong>${level}:</strong> ${count}`)
                            .join('<br>')
                        }
                    </div>
                </div>
                
                <div style="
                    background: rgba(231, 76, 60, 0.1);
                    padding: 15px;
                    border-radius: 8px;
                    border-left: 4px solid #e74c3c;
                ">
                    <h5 style="margin: 0 0 10px 0; color: #2c3e50;">♠ Suits Played</h5>
                    <div style="font-size: 12px; color: #2c3e50;">
                        ${Object.entries(stats.contractStats.suits)
                            .filter(([suit, count]) => count > 0)
                            .map(([suit, count]) => `<strong>${suit}:</strong> ${count}`)
                            .join('<br>')
                        }
                    </div>
                </div>
            </div>
            
            <div style="
                background: rgba(149, 165, 166, 0.1);
                padding: 15px;
                border-radius: 8px;
                margin: 15px 0;
            ">
                <h5 style="margin: 0 0 10px 0; color: #2c3e50;">📋 Contract Outcomes</h5>
                <div style="display: flex; justify-content: space-around; flex-wrap: wrap; gap: 15px;">
                    <div style="text-align: center;">
                        <div style="font-size: 20px; font-weight: bold; color: #27ae60;">
                            ${stats.contractStats.outcomes.made}
                        </div>
                        <div style="font-size: 12px; color: #7f8c8d;">Made</div>
                    </div>
                    <div style="text-align: center;">
                        <div style="font-size: 20px; font-weight: bold; color: #e74c3c;">
                            ${stats.contractStats.outcomes.failed}
                        </div>
                        <div style="font-size: 12px; color: #7f8c8d;">Failed</div>
                    </div>
                    <div style="text-align: center;">
                        <div style="font-size: 20px; font-weight: bold; color: #f39c12;">
                            ${stats.contractStats.doubles.doubled + stats.contractStats.doubles.redoubled}
                        </div>
                        <div style="font-size: 12px; color: #7f8c8d;">Doubled</div>
                    </div>
                </div>
            </div>
        `;
        
        const buttons = [
            { text: 'Close Stats', action: 'close', class: 'close-btn' },
            { text: 'Export Stats', action: () => this.exportStatistics(stats), class: 'export-btn' }
        ];
        
        this.bridgeApp.showModal('📈 Session Statistics', statsContent, buttons);
    }
    
    /**
     * Export statistics to text file
     */
    exportStatistics(stats) {
        let text = `DUPLICATE BRIDGE SESSION STATISTICS\n`;
        text += `Generated: ${new Date().toLocaleString()}\n`;
        text += `=========================================\n\n`;
        
        text += `SESSION INFO:\n`;
        text += `Movement: ${stats.sessionInfo.movement}\n`;
        text += `Pairs: ${stats.sessionInfo.pairs}\n`;
        text += `Completion: ${stats.completionRate}%\n`;
        text += `Boards: ${stats.sessionInfo.completedBoards}/${stats.sessionInfo.totalBoards}\n`;
        text += `Total Results: ${stats.sessionInfo.totalResults}\n\n`;
        
        text += `SCORE STATISTICS:\n`;
        text += `Average Score: ${stats.scoreStats.averageScore}\n`;
        text += `Highest Score: ${stats.scoreStats.highestScore}\n`;
        text += `Lowest Score: ${stats.scoreStats.lowestScore}\n`;
        text += `Total Points: ${stats.scoreStats.totalScore}\n\n`;
        
        text += `CONTRACT ANALYSIS:\n`;
        text += `Levels: ${Object.entries(stats.contractStats.levels).filter(([,c]) => c > 0).map(([l,c]) => `${l}=${c}`).join(', ')}\n`;
        text += `Suits: ${Object.entries(stats.contractStats.suits).filter(([,c]) => c > 0).map(([s,c]) => `${s}=${c}`).join(', ')}\n`;
        text += `Made: ${stats.contractStats.outcomes.made}, Failed: ${stats.contractStats.outcomes.failed}\n`;
        text += `Doubled: ${stats.contractStats.doubles.doubled}, Redoubled: ${stats.contractStats.doubles.redoubled}\n`;
        
        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `duplicate-statistics-${new Date().toISOString().split('T')[0]}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.bridgeApp.showMessage('Statistics exported successfully!', 'success');
    }
    
    /**
     * Validate all session data for consistency
     */
    validateCompleteSession() {
        console.log('🔍 Performing comprehensive session validation...');
        
        const issues = [];
        const warnings = [];
        
        // Basic setup validation
        if (!this.session.isSetup) {
            issues.push('Session not properly initialized');
            return { valid: false, issues, warnings };
        }
        
        if (!this.session.movement) {
            issues.push('Movement data missing');
            return { valid: false, issues, warnings };
        }
        
        // Board validation
        const expectedBoards = this.session.movement.totalBoards;
        const actualBoards = Object.keys(this.session.boards).length;
        
        if (actualBoards !== expectedBoards) {
            issues.push(`Board count mismatch: expected ${expectedBoards}, got ${actualBoards}`);
        }
        
        // Movement validation
        const movementInstances = this.session.movement.movement;
        const boardsInMovement = [...new Set(movementInstances.flatMap(m => m.boards))];
        
        if (boardsInMovement.length !== expectedBoards) {
            warnings.push(`Movement defines ${boardsInMovement.length} boards, expected ${expectedBoards}`);
        }
        
        // Pair validation
        const pairsInMovement = [...new Set([...movementInstances.map(m => m.ns), ...movementInstances.map(m => m.ew)])];
        if (pairsInMovement.length !== this.session.pairs) {
            warnings.push(`Movement has ${pairsInMovement.length} pairs, session configured for ${this.session.pairs}`);
        }
        
        // Results validation
        let totalResultsExpected = 0;
        let totalResultsActual = 0;
        
        Object.values(this.session.boards).forEach(board => {
            const expectedResults = movementInstances.filter(m => m.boards.includes(board.number)).length;
            const actualResults = board.results ? board.results.length : 0;
            
            totalResultsExpected += expectedResults;
            totalResultsActual += actualResults;
            
            if (board.completed && actualResults < expectedResults) {
                warnings.push(`Board ${board.number} marked complete but has ${actualResults}/${expectedResults} results`);
            }
        });
        
        if (totalResultsActual > totalResultsExpected) {
            warnings.push(`More results (${totalResultsActual}) than expected (${totalResultsExpected})`);
        }
        
        // State consistency
        const inputStateValidation = this.validateSessionState();
        if (!inputStateValidation.valid) {
            issues.push(...inputStateValidation.issues);
        }
        
        const result = {
            valid: issues.length === 0,
            issues,
            warnings,
            summary: {
                totalBoards: expectedBoards,
                completedBoards: Object.values(this.session.boards).filter(b => b.completed).length,
                totalResults: totalResultsActual,
                expectedResults: totalResultsExpected
            }
        };
        
        if (result.valid) {
            console.log('✅ Session validation passed');
        } else {
            console.warn('🚨 Session validation failed:', issues);
        }
        
        if (warnings.length > 0) {
            console.warn('⚠️ Session validation warnings:', warnings);
        }
        
        return result;
    }
    
    /**
     * Auto-save session data (for future implementation)
     */
    autoSaveSession() {
        try {
            const sessionData = {
                timestamp: Date.now(),
                session: this.session,
                inputState: this.inputState,
                version: '1.0'
            };
            
            // In a real implementation, this would save to localStorage or server
            console.log('💾 Auto-save triggered:', sessionData.timestamp);
            return true;
        } catch (error) {
            console.error('❌ Auto-save failed:', error);
            return false;
        }
    }
    
    /**
     * Recovery function for corrupted sessions
     */
    attemptSessionRecovery() {
        console.log('🔧 Attempting session recovery...');
        
        const validation = this.validateCompleteSession();
        let recovered = false;
        
        // Fix missing boards
        if (this.session.movement && !this.session.boards) {
            console.log('🔧 Recreating missing boards');
            this.setupBoards();
            recovered = true;
        }
        
        // Fix state inconsistencies
        if (this.session.isSetup && this.inputState === 'pairs_setup') {
            console.log('🔧 Fixing state inconsistency');
            this.inputState = 'board_selection';
            recovered = true;
        }
        
        // Clean up orphaned popups
        const popups = ['travelerPopup', 'boardSelectorPopup', 'movementPopup'];
        popups.forEach(id => {
            if (document.getElementById(id)) {
                document.getElementById(id).remove();
                recovered = true;
                console.log(`🔧 Removed orphaned popup: ${id}`);
            }
        });
        
        if (recovered) {
            console.log('✅ Session recovery completed');
            this.updateDisplay();
        } else {
            console.log('ℹ️ No recovery actions needed');
        }
        
        return recovered;
    }
// END SECTION EIGHT
// SECTION NINE - Display Content Methods (FIXED VERSION)
    /**
     * Get board selection display content - FIXED FOR MOBILE LAYOUT
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
                        ${isComplete ? '🎉 Session Complete!' : '📊 Board Entry'}
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
                        📋 Select Board
                    </button>
                </div>
                
                ${isComplete ? `
                    <div style="
                        background: rgba(39, 174, 96, 0.1); 
                        padding: 10px; 
                        border-radius: 6px; 
                        border-left: 3px solid #27ae60;
                        text-align: center;
                        margin-top: 10px;
                    ">
                        <div style="color: #27ae60; font-weight: bold; font-size: 13px;">
                            ✅ All boards completed!
                        </div>
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
                            💡 <strong>Tip:</strong> Enter results after each round
                        </div>
                    </div>
                `}
            </div>
            <div class="current-state">
                ${isComplete ? 'All boards complete - Press RESULTS' : 'Select board to enter results'}
            </div>
        `;
    }
    
    /**
     * Get compact board progress display - MOBILE OPTIMIZED
     */
    getCompactBoardProgressDisplay() {
        const boardStatus = this.getBoardStatus();
        const totalBoards = boardStatus.length;
        
        if (totalBoards === 0) {
            return '<div style="text-align: center; color: #7f8c8d; font-size: 12px;">No boards configured</div>';
        }
        
        const completedBoards = boardStatus.filter(b => b.completed);
        const incompleteBoards = boardStatus.filter(b => !b.completed);
        
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
                        📊 ${completedBoards.length}/${totalBoards} Complete
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

    // ... Keep all other methods from Section 9 unchanged ...
    
    /**
     * Get display content for current state - DUPLICATE BRIDGE ENHANCED
     */
    getDisplayContent() {
        switch (this.inputState) {
            case 'pairs_setup':
                return this.getPairsSetupContent();
                
            case 'movement_confirm':
                return this.getMovementConfirmContent();
                
            case 'board_selection':
                return this.getBoardSelectionContent();
                
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
        return `
            <div class="title-score-row">
                <div class="mode-title">${this.displayName}</div>
                <div class="score-display">Setup</div>
            </div>
            <div class="game-content">
                <div style="text-align: center; margin-bottom: 15px;">
                    <h3 style="color: #2c3e50; margin: 0;">🏆 Tournament Setup</h3>
                </div>
                <div><strong>How many pairs are playing?</strong></div>
                <div style="margin: 15px 0; padding: 15px; background: rgba(52, 152, 219, 0.1); border-radius: 8px; border-left: 4px solid #3498db;">
                    <div style="font-size: 14px; line-height: 1.6;">
                        <div style="margin-bottom: 10px;">
                            <strong style="color: #2c3e50;">📋 4 pairs:</strong> 
                            <span style="color: #7f8c8d;">2 tables, 12 boards, ~2 hours</span>
                        </div>
                        <div style="margin-bottom: 10px;">
                            <strong style="color: #2c3e50;">📋 6 pairs:</strong> 
                            <span style="color: #7f8c8d;">3 tables, 10 boards, ~1.5 hours</span>
                        </div>
                        <div>
                            <strong style="color: #2c3e50;">📋 8 pairs:</strong> 
                            <span style="color: #7f8c8d;">4 tables, 14 boards, ~2.5 hours</span>
                        </div>
                    </div>
                </div>
                <div style="text-align: center; color: #95a5a6; font-size: 12px; margin-top: 10px;">
                    Each pair plays all boards exactly once<br>
                    Results compared using matchpoint scoring
                </div>
            </div>
            <div class="current-state">Select pairs: Press 4, 6, or 8</div>
        `;
    }
    
    /**
     * Get movement confirmation display content
     */
    getMovementConfirmContent() {
        const movement = this.session.movement;
        const estimatedTime = movement.description.match(/~(.+)/)?.[1] || '2-3 hours';
        
        return `
            <div class="title-score-row">
                <div class="mode-title">${this.displayName}</div>
                <div class="score-display">${this.session.pairs} Pairs</div>
            </div>
            <div class="game-content">
                <div style="text-align: center; margin-bottom: 15px;">
                    <h3 style="color: #2c3e50; margin: 0;">🏆 Movement Selected</h3>
                </div>
                <div style="background: rgba(39, 174, 96, 0.1); padding: 15px; border-radius: 8px; border-left: 4px solid #27ae60; margin: 10px 0;">
                    <div style="font-weight: bold; color: #2c3e50; margin-bottom: 8px;">
                        ${movement.description}
                    </div>
                    <div style="font-size: 13px; color: #2c3e50; line-height: 1.5;">
                        <div><strong>Pairs:</strong> ${movement.pairs}</div>
                        <div><strong>Tables:</strong> ${movement.tables}</div>
                        <div><strong>Rounds:</strong> ${movement.rounds}</div>
                        <div><strong>Total Boards:</strong> ${movement.totalBoards}</div>
                        <div><strong>Estimated Time:</strong> ${estimatedTime}</div>
                    </div>
                </div>
                <div style="margin-top: 15px; font-size: 14px;">
                    <div style="margin-bottom: 8px;">
                        Press <strong style="color: #3498db;">1</strong> to view detailed movement
                    </div>
                    <div>
                        Press <strong style="color: #27ae60;">2</strong> to confirm and start session
                    </div>
                </div>
            </div>
            <div class="current-state">1=View Movement, 2=Confirm Setup, Back</div>
        `;
    }
    
    /**
     * Get results display content
     */
    getResultsContent() {
        const completionStatus = this.getCompletionStatus();
        const standings = this.calculateFinalStandings();
        
        return `
            <div class="title-score-row">
                <div class="mode-title">🏆 Final Results</div>
                <div class="score-display">
                    ${this.session.pairs} Pairs
                    <div style="font-size: 10px; color: #95a5a6;">Complete</div>
                </div>
            </div>
            <div class="game-content">
                <div style="text-align: center; margin-bottom: 15px;">
                    <h3 style="color: #2c3e50; margin: 0;">🎉 Tournament Complete!</h3>
                </div>
                
                ${this.getTopThreeDisplay(standings)}
                
                <div style="
                    background: rgba(52, 152, 219, 0.1);
                    padding: 15px;
                    border-radius: 8px;
                    border-left: 4px solid #3498db;
                    margin: 15px 0;
                    text-align: center;
                ">
                    <div style="color: #2c3e50; font-weight: bold; margin-bottom: 8px;">
                        📊 Session Summary
                    </div>
                    <div style="font-size: 13px; color: #2c3e50; line-height: 1.5;">
                        <div><strong>Movement:</strong> ${this.session.movement.description}</div>
                        <div><strong>Boards Played:</strong> ${completionStatus.completed}/${completionStatus.total}</div>
                        <div><strong>Results Entered:</strong> ${this.getTotalResultsCount()}</div>
                    </div>
                </div>
                
                <div style="text-align: center; margin-top: 20px;">
                    <div style="color: #7f8c8d; font-size: 12px; margin-bottom: 10px;">
                        View detailed results and export options using the buttons below
                    </div>
                </div>
            </div>
            <div class="current-state">Tournament complete - Use BACK to continue or review results</div>
        `;
    }
    
    /**
     * Get top three display for results
     */
    getTopThreeDisplay(standings) {
        if (standings.length === 0) {
            return `
                <div style="text-align: center; color: #7f8c8d; margin: 20px 0;">
                    <p>No standings available - insufficient data for ranking.</p>
                </div>
            `;
        }
        
        const topThree = standings.slice(0, 3);
        
        return `
            <div style="
                display: flex;
                justify-content: center;
                align-items: end;
                gap: 15px;
                margin: 20px 0;
                flex-wrap: wrap;
            ">
                ${topThree.map((pair, index) => {
                    const position = index + 1;
                    const heights = ['120px', '100px', '80px'];
                    const colors = ['#f1c40f', '#95a5a6', '#cd7f32'];
                    const icons = ['🥇', '🥈', '🥉'];
                    
                    return `
                        <div style="
                            background: linear-gradient(135deg, ${colors[index]}, ${colors[index]}dd);
                            color: white;
                            padding: 15px;
                            border-radius: 8px;
                            text-align: center;
                            min-width: 100px;
                            height: ${heights[index]};
                            display: flex;
                            flex-direction: column;
                            justify-content: center;
                            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
                            transform: ${position === 1 ? 'scale(1.05)' : 'scale(1)'};
                        ">
                            <div style="font-size: 24px; margin-bottom: 5px;">
                                ${icons[index]}
                            </div>
                            <div style="font-size: 18px; font-weight: bold; margin-bottom: 3px;">
                                Pair ${pair.pair}
                            </div>
                            <div style="font-size: 16px; font-weight: bold;">
                                ${pair.percentage}%
                            </div>
                            <div style="font-size: 11px; opacity: 0.9;">
                                ${pair.totalMatchpoints} MP
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }
    
    /**
     * Get total results count
     */
    getTotalResultsCount() {
        if (!this.session.boards) return 0;
        
        return Object.values(this.session.boards).reduce((total, board) => {
            if (board.results) {
                return total + board.results.filter(r => r.nsScore !== null || r.ewScore !== null).length;
            }
            return total;
        }, 0);
    }
// END SECTION NINE// SECTION TEN - Export and Final Methods
    /**
     * Get comprehensive duplicate bridge session summary
     */
    getSessionSummary() {
        const completionStatus = this.getCompletionStatus();
        const standings = this.calculateFinalStandings();
        const stats = this.getSessionStatistics();
        const validation = this.validateCompleteSession();
        
        return {
            mode: 'Duplicate Bridge',
            timestamp: new Date().toISOString(),
            currentStatus: {
                state: this.inputState,
                isSetup: this.session.isSetup,
                completion: completionStatus,
                sessionValid: validation.valid
            },
            tournament: this.session.isSetup ? {
                movement: this.session.movement.description,
                pairs: this.session.pairs,
                tables: this.session.movement.tables,
                totalBoards: this.session.movement.totalBoards,
                rounds: this.session.movement.rounds
            } : null,
            results: {
                standings: standings,
                totalResults: this.getTotalResultsCount(),
                boardsCompleted: completionStatus.completed,
                isComplete: completionStatus.percentage === 100
            },
            statistics: stats,
            recommendations: this.getSessionRecommendations()
        };
    }
    
    /**
     * Get session recommendations based on current state and data
     */
    getSessionRecommendations() {
        const recommendations = [];
        const completionStatus = this.getCompletionStatus();
        const validation = this.validateCompleteSession();
        
        // Completion recommendations
        if (completionStatus.percentage === 100) {
            recommendations.push({
                type: 'success',
                priority: 'high',
                message: 'Tournament complete! All boards finished.',
                action: 'View final standings and export results'
            });
        } else if (completionStatus.percentage >= 75) {
            recommendations.push({
                type: 'progress',
                priority: 'medium',
                message: 'Tournament nearly complete',
                action: `Complete remaining ${completionStatus.total - completionStatus.completed} boards`
            });
        } else if (completionStatus.percentage >= 50) {
            recommendations.push({
                type: 'progress',
                priority: 'medium',
                message: 'Tournament halfway complete',
                action: 'Continue entering board results'
            });
        } else if (completionStatus.completed > 0) {
            recommendations.push({
                type: 'progress',
                priority: 'low',
                message: 'Tournament in progress',
                action: 'Keep entering results as rounds complete'
            });
        }
        
        // Data quality recommendations
        if (validation.warnings && validation.warnings.length > 0) {
            recommendations.push({
                type: 'warning',
                priority: 'medium',
                message: 'Data inconsistencies detected',
                action: 'Review board results for accuracy'
            });
        }
        
        // Statistical recommendations
        const stats = this.getSessionStatistics();
        if (stats.contractStats.outcomes.failed > stats.contractStats.outcomes.made * 1.5) {
            recommendations.push({
                type: 'insight',
                priority: 'low',
                message: 'High contract failure rate detected',
                action: 'Consider reviewing bidding strategies'
            });
        }
        
        return recommendations;
    }
    
    /**
     * Generate comprehensive tournament report
     */
    generateTournamentReport() {
        const summary = this.getSessionSummary();
        const boardDetails = this.getBoardDetails();
        
        let report = `DUPLICATE BRIDGE TOURNAMENT REPORT\n`;
        report += `Generated: ${new Date().toLocaleString()}\n`;
        report += `${'='.repeat(50)}\n\n`;
        
        // Tournament Information
        report += `TOURNAMENT INFORMATION:\n`;
        if (summary.tournament) {
            report += `Movement: ${summary.tournament.movement}\n`;
            report += `Pairs: ${summary.tournament.pairs}\n`;
            report += `Tables: ${summary.tournament.tables}\n`;
            report += `Total Boards: ${summary.tournament.totalBoards}\n`;
            report += `Rounds: ${summary.tournament.rounds}\n`;
        }
        report += `Status: ${summary.currentStatus.completion.percentage}% Complete\n`;
        report += `Boards Completed: ${summary.currentStatus.completion.completed}/${summary.currentStatus.completion.total}\n\n`;
        
        // Final Standings
        if (summary.results.standings.length > 0) {
            report += `FINAL STANDINGS:\n`;
            report += `Pos  Pair  Matchpoints  Percentage  Boards  Score\n`;
            report += `---  ----  -----------  ----------  ------  -----\n`;
            
            summary.results.standings.forEach((pair, index) => {
                const pos = (index + 1).toString().padStart(3);
                const pairNum = pair.pair.toString().padStart(4);
                const mp = pair.totalMatchpoints.toString().padStart(11);
                const pct = `${pair.percentage}%`.padStart(10);
                const boards = pair.boardsPlayed.toString().padStart(6);
                const score = pair.totalScore.toString().padStart(5);
                
                report += `${pos}  ${pairNum}  ${mp}  ${pct}  ${boards}  ${score}\n`;
            });
            report += `\n`;
        }
        
        // Statistics Summary
        if (summary.statistics) {
            const stats = summary.statistics;
            report += `TOURNAMENT STATISTICS:\n`;
            report += `Total Results Entered: ${stats.sessionInfo.totalResults}\n`;
            report += `Average Score: ${stats.scoreStats.averageScore}\n`;
            report += `Highest Score: ${stats.scoreStats.highestScore}\n`;
            report += `Contracts Made: ${stats.contractStats.outcomes.made}\n`;
            report += `Contracts Failed: ${stats.contractStats.outcomes.failed}\n`;
            report += `Success Rate: ${stats.contractStats.outcomes.made + stats.contractStats.outcomes.failed > 0 ? 
                Math.round((stats.contractStats.outcomes.made / (stats.contractStats.outcomes.made + stats.contractStats.outcomes.failed)) * 100) : 0}%\n\n`;
        }
        
        // Board-by-Board Results
        report += `BOARD-BY-BOARD RESULTS:\n\n`;
        boardDetails.forEach(board => {
            report += `Board ${board.number} (${board.vulnerability} Vulnerable):\n`;
            report += `${'-'.repeat(40)}\n`;
            
            if (board.results.length === 0) {
                report += `No results entered\n\n`;
            } else {
                board.results.forEach(result => {
                    const contract = result.level && result.suit ? 
                        `${result.level}${result.suit}${result.double || ''}` : 'No contract';
                    const declarer = result.declarer || '?';
                    const tricks = result.tricks !== '' ? result.tricks : '?';
                    
                    report += `  NS ${result.nsPair} vs EW ${result.ewPair}: `;
                    report += `${contract} by ${declarer}, ${tricks} tricks\n`;
                    report += `    Scores: NS ${result.nsScore || 0}, EW ${result.ewScore || 0}`;
                    
                    if (result.matchpoints) {
                        report += `, MP: ${result.matchpoints.ns}/${result.matchpoints.ew}`;
                    }
                    report += `\n`;
                });
                report += `\n`;
            }
        });
        
        // Recommendations
        if (summary.recommendations.length > 0) {
            report += `RECOMMENDATIONS:\n`;
            summary.recommendations.forEach((rec, index) => {
                report += `${index + 1}. [${rec.type.toUpperCase()}] ${rec.message}\n`;
                report += `   Action: ${rec.action}\n`;
            });
        }
        
        return report;
    }
    
    /**
     * Get detailed board information for reports
     */
    getBoardDetails() {
        if (!this.session.boards) return [];
        
        return Object.values(this.session.boards)
            .sort((a, b) => a.number - b.number)
            .map(board => ({
                number: board.number,
                vulnerability: board.vulnerability,
                completed: board.completed,
                results: board.results ? board.results.filter(r => 
                    r.nsScore !== null || r.ewScore !== null
                ) : []
            }));
    }
    
    /**
     * Export complete tournament data
     */
    exportTournamentData() {
        const report = this.generateTournamentReport();
        
        // Create downloadable text file
        const blob = new Blob([report], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `duplicate-tournament-${new Date().toISOString().split('T')[0]}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        console.log('📄 Tournament report exported successfully');
        this.bridgeApp.showMessage('Tournament report exported successfully!', 'success');
        
        return report;
    }
    
    /**
     * Export session data in JSON format for backup/restore
     */
    exportSessionData() {
        const sessionData = {
            metadata: {
                exportDate: new Date().toISOString(),
                version: '1.0',
                mode: 'duplicate-bridge'
            },
            session: {
                pairs: this.session.pairs,
                movement: this.session.movement,
                isSetup: this.session.isSetup,
                boards: this.session.boards
            },
            state: {
                inputState: this.inputState,
                traveler: {
                    isActive: this.traveler.isActive
                }
            },
            summary: this.getSessionSummary()
        };
        
        const blob = new Blob([JSON.stringify(sessionData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `duplicate-session-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        console.log('💾 Session data exported successfully');
        this.bridgeApp.showMessage('Session backup created successfully!', 'success');
        
        return sessionData;
    }
    
    /**
     * Generate CSV export for spreadsheet analysis
     */
    exportToCSV() {
        let csv = 'Board,Vulnerability,NS_Pair,EW_Pair,Contract,Declarer,Tricks,NS_Score,EW_Score,NS_MP,EW_MP\n';
        
        const boardDetails = this.getBoardDetails();
        
        boardDetails.forEach(board => {
            if (board.results.length === 0) {
                csv += `${board.number},${board.vulnerability},,,,,,,,\n`;
            } else {
                board.results.forEach(result => {
                    const contract = result.level && result.suit ? 
                        `${result.level}${result.suit}${result.double || ''}` : '';
                    
                    csv += `${board.number},${board.vulnerability},${result.nsPair},${result.ewPair},`;
                    csv += `"${contract}",${result.declarer || ''},${result.tricks || ''},`;
                    csv += `${result.nsScore || 0},${result.ewScore || 0},`;
                    csv += `${result.matchpoints ? result.matchpoints.ns : ''},`;
                    csv += `${result.matchpoints ? result.matchpoints.ew : ''}\n`;
                });
            }
        });
        
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `duplicate-results-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        console.log('📊 CSV export completed successfully');
        this.bridgeApp.showMessage('CSV file exported successfully!', 'success');
    }
    
    /**
     * Setup teaching scenarios for duplicate bridge
     */
    setupTeachingScenario(scenario) {
        const scenarios = {
            'basic-duplicate': {
                description: 'Basic 4-pair duplicate bridge session',
                pairs: 4,
                setupMessage: 'Basic duplicate bridge setup ready for learning',
                boards: [1, 2, 3, 4] // Pre-populate some boards
            },
            'vulnerability-demo': {
                description: 'Demonstrate vulnerability effects in duplicate',
                pairs: 4,
                setupMessage: 'Vulnerability demonstration setup complete',
                boards: [1, 5, 9, 13] // Different vulnerability conditions
            },
            'matchpoint-scoring': {
                description: 'Learn matchpoint comparison scoring',
                pairs: 6,
                setupMessage: 'Matchpoint scoring demonstration ready',
                boards: [1, 2] // Focus on just a few boards for comparison
            }
        };
        
        const config = scenarios[scenario];
        if (!config) {
            console.warn('Unknown teaching scenario:', scenario);
            return false;
        }
        
        // Reset and setup for teaching
        this.resetSession();
        this.session.pairs = config.pairs;
        this.session.movement = this.movements[config.pairs];
        this.setupBoards();
        this.inputState = 'board_selection';
        
        // Pre-populate some demo data if specified
        if (config.boards) {
            config.boards.forEach(boardNum => {
                if (this.session.boards[boardNum]) {
                    // Add sample results for teaching
                    this.addSampleResults(boardNum);
                }
            });
        }
        
        this.updateDisplay();
        
        console.log(`📚 Teaching scenario setup: ${config.description}`);
        this.bridgeApp.showMessage(config.setupMessage, 'info');
        
        return true;
    }
    
    /**
     * Add sample results for teaching scenarios
     */
    addSampleResults(boardNumber) {
        const board = this.session.boards[boardNumber];
        if (!board) return;
        
        // Generate sample contracts and results for demonstration
        const sampleContracts = [
            { level: '3', suit: 'NT', declarer: 'N', tricks: '9', nsScore: 400, ewScore: 0 },
            { level: '4', suit: '♥', declarer: 'S', tricks: '10', nsScore: 420, ewScore: 0 },
            { level: '3', suit: 'NT', declarer: 'N', tricks: '8', nsScore: 0, ewScore: 50 }
        ];
        
        // Get pairs that should play this board
        const instances = this.session.movement.movement.filter(entry => 
            entry.boards && entry.boards.includes(boardNumber)
        );
        
        board.results = instances.slice(0, sampleContracts.length).map((instance, index) => {
            const contract = sampleContracts[index] || sampleContracts[0];
            return {
                nsPair: instance.ns,
                ewPair: instance.ew,
                ...contract,
                double: '',
                matchpoints: null // Will be calculated
            };
        });
        
        // Calculate matchpoints for the sample data
        this.calculateBoardMatchpoints(board.results);
        board.completed = true;
        
        console.log(`📚 Added sample results for Board ${boardNumber}`);
    }
    
    /**
     * Calculate teaching value of current session
     */
    calculateTeachingValue() {
        const completionStatus = this.getCompletionStatus();
        const stats = this.getSessionStatistics();
        
        let teachingValue = 0;
        let insights = [];
        
        // Completion value
        teachingValue += completionStatus.percentage * 0.3;
        
        // Variety of contracts
        const contractVariety = Object.values(stats.contractStats.levels).filter(count => count > 0).length;
        teachingValue += (contractVariety / 7) * 20; // Max 7 levels
        
        const suitVariety = Object.values(stats.contractStats.suits).filter(count => count > 0).length;
        teachingValue += (suitVariety / 5) * 15; // Max 5 suits
        
        // Outcome balance (both made and failed contracts are educational)
        const totalContracts = stats.contractStats.outcomes.made + stats.contractStats.outcomes.failed;
        if (totalContracts > 0) {
            const balance = Math.min(stats.contractStats.outcomes.made, stats.contractStats.outcomes.failed) / totalContracts;
            teachingValue += balance * 20;
        }
        
        // Educational insights
        if (contractVariety >= 4) {
            insights.push('Good variety of contract levels for learning');
        }
        
        if (stats.contractStats.doubles.doubled > 0) {
            insights.push('Includes doubled contracts for penalty learning');
        }
        
        if (completionStatus.percentage >= 75) {
            insights.push('Sufficient data for meaningful matchpoint comparisons');
        }
        
        return {
            score: Math.round(teachingValue),
            maxScore: 100,
            insights: insights,
            recommendations: this.getTeachingRecommendations(stats)
        };
    }
    
    /**
     * Get recommendations for teaching improvement
     */
    getTeachingRecommendations(stats) {
        const recommendations = [];
        
        // Contract variety recommendations
        const levelsCovered = Object.values(stats.contractStats.levels).filter(count => count > 0).length;
        if (levelsCovered < 4) {
            recommendations.push('Try different contract levels (1-7) for comprehensive learning');
        }
        
        const suitsCovered = Object.values(stats.contractStats.suits).filter(count => count > 0).length;
        if (suitsCovered < 4) {
            recommendations.push('Include more suit variety (♣♦♥♠NT) for balanced experience');
        }
        
        // Outcome recommendations
        if (stats.contractStats.outcomes.made === 0) {
            recommendations.push('Include some successful contracts to show positive scoring');
        }
        
        if (stats.contractStats.outcomes.failed === 0) {
            recommendations.push('Include some failed contracts to demonstrate penalties');
        }
        
        // Advanced concepts
        if (stats.contractStats.doubles.doubled === 0) {
            recommendations.push('Consider adding doubled contracts to teach penalty calculations');
        }
        
        return recommendations;
    }
    
    /**
     * Complete cleanup when switching modes
     */
    cleanup() {
        console.log('🧹 Starting comprehensive duplicate bridge cleanup...');
        
        // Close all popups
        const popups = ['travelerPopup', 'boardSelectorPopup', 'movementPopup'];
        popups.forEach(id => {
            const popup = document.getElementById(id);
            if (popup) {
                popup.remove();
                console.log(`🧹 Removed popup: ${id}`);
            }
        });
        
        // Clean up global references
        const globalRefs = [
            'calculateAllScores',
            'saveTravelerData', 
            'closeTravelerPopup',
            'selectBoardFromDropdown',
            'closeBoardSelector',
            'duplicateBridge'
        ];
        
        globalRefs.forEach(ref => {
            if (window[ref]) {
                delete window[ref];
                console.log(`🧹 Cleaned global reference: ${ref}`);
            }
        });
        
        // Reset traveler state
        this.traveler = {
            isActive: false,
            boardNumber: null,
            data: []
        };
        
        // Clean up any remaining event listeners (handled by popup removal)
        // Remove any injected styles
        const injectedStyles = document.querySelectorAll('style[data-duplicate-bridge]');
        injectedStyles.forEach(style => style.remove());
        
        console.log('✅ Duplicate bridge cleanup completed successfully');
    }
    
    /**
     * Get final session metrics for analytics
     */
    getFinalMetrics() {
        const summary = this.getSessionSummary();
        const teachingValue = this.calculateTeachingValue();
        
        return {
            sessionId: `duplicate-${Date.now()}`,
            mode: 'duplicate-bridge',
            startTime: this.sessionStartTime || Date.now(),
            endTime: Date.now(),
            duration: this.sessionStartTime ? Date.now() - this.sessionStartTime : 0,
            completion: summary.currentStatus.completion,
            results: {
                pairsParticipated: summary.tournament ? summary.tournament.pairs : 0,
                boardsCompleted: summary.currentStatus.completion.completed,
                totalResults: summary.results.totalResults,
                finalStandings: summary.results.standings.length
            },
            quality: {
                teachingValue: teachingValue.score,
                dataIntegrity: summary.currentStatus.sessionValid,
                varietyScore: this.calculateVarietyScore()
            },
            userExperience: {
                popupInteractions: this.popupInteractionCount || 0,
                mobileOptimizations: this.isMobile,
                errorsEncountered: this.errorCount || 0
            }
        };
    }
    
    /**
     * Calculate variety score for analytics
     */
    calculateVarietyScore() {
        const stats = this.getSessionStatistics();
        
        const levelVariety = Object.values(stats.contractStats.levels).filter(count => count > 0).length / 7;
        const suitVariety = Object.values(stats.contractStats.suits).filter(count => count > 0).length / 5;
        const outcomeBalance = this.calculateOutcomeBalance(stats.contractStats.outcomes);
        
        return Math.round((levelVariety + suitVariety + outcomeBalance) * 100 / 3);
    }
    
    /**
     * Calculate outcome balance for variety scoring
     */
    calculateOutcomeBalance(outcomes) {
        const total = outcomes.made + outcomes.failed;
        if (total === 0) return 0;
        
        const ratio = Math.min(outcomes.made, outcomes.failed) / total;
        return ratio * 2; // Perfect balance (50/50) = 1.0
    }
    
    /**
     * Initialize session tracking
     */
    initializeSessionTracking() {
        this.sessionStartTime = Date.now();
        this.popupInteractionCount = 0;
        this.errorCount = 0;
        
        console.log('📊 Session tracking initialized for duplicate bridge');
    }
}

// Export for the new module system
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DuplicateBridgeMode;
} else if (typeof window !== 'undefined') {
    window.DuplicateBridgeMode = DuplicateBridgeMode;
}

console.log('🏆 Duplicate Bridge module loaded successfully with comprehensive tournament support');
// END SECTION TEN - FILE COMPLETE
