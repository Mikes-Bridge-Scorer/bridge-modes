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
// SECTION TWO - Core Methods (FIXED FOR BUTTON INPUT WITH DEAL BUTTON)

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
 * Handle user input - FIXED FOR BUTTON-BASED TRAVELER WITH DEAL BUTTON
 */
handleInput(value) {
    console.log(`🎮 Duplicate Bridge input: ${value} in state: ${this.inputState}`);
    
    // Route traveler input to traveler handler - FIXED: Check inputState instead of traveler.isActive
    if (this.inputState === 'traveler_entry') {
        this.handleTravelerInput(value);
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
    
    // FIXED: Handle DEAL button specifically for results
    if (value === 'DEAL' && this.inputState === 'board_selection') {
        console.log('🎯 DEAL button pressed - attempting to show results');
        this.handleBoardSelection(value);
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
// SECTION THREE - Action Handlers (MOBILE BOARD LIST WITH COMPREHENSIVE SCROLLING FIXES)

/**
 * Show board selector popup - MOBILE BOARD LIST WITH PIXEL 9A SCROLLING FIX
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
            <h3 style="text-align: center; margin: 0 0 15px 0; color: #2c3e50;">📋 Select Board</h3>
            
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
                ">❌ Cancel</button>
                
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
                ">🔄 Fix Scroll</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(popup);
    
    // Setup board list handlers with enhanced mobile scrolling
    setTimeout(() => {
        this.setupBoardListEvents();
        this.applyBoardListScrollingFixes(); // Apply the scrolling fix immediately
    }, 100);
    
    console.log('📋 Board list popup created with comprehensive mobile scrolling fixes');
}

/**
 * Generate board list HTML - MOBILE TOUCH OPTIMIZED WITH RESULT STATUS
 */
getBoardListHTML() {
    let html = '';
    
    for (let i = 1; i <= this.session.movement.totalBoards; i++) {
        const board = this.session.boards[i];
        const statusIcon = board.completed ? '✅' : '⭕';
        const vulnerability = board.vulnerability;
        const vulnDisplay = { 'None': 'None', 'NS': 'NS', 'EW': 'EW', 'Both': 'All' };
        const vulnColor = this.getVulnerabilityColor(vulnerability);
        
        // FIXED: Proper result status display
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
 * Setup board list touch events - COMPREHENSIVE MOBILE SUPPORT WITH SCROLL/TAP DISCRIMINATION
 */
setupBoardListEvents() {
    const boardItems = document.querySelectorAll('.board-list-item');
    const cancelBtn = document.getElementById('cancelBoardBtn');
    const refreshBtn = document.getElementById('refreshScrollBtn');
    
    console.log('📱 Setting up board list touch events with scroll/tap discrimination');
    
    // BOARD ITEM HANDLERS WITH SCROLL/TAP DISCRIMINATION
    boardItems.forEach(item => {
        const boardNumber = parseInt(item.dataset.board);
        
        // Touch state tracking for scroll vs tap discrimination
        let touchStartTime = 0;
        let touchStartY = 0;
        let touchStartX = 0;
        let hasMoved = false;
        const MOVE_THRESHOLD = 10; // pixels
        const TAP_MAX_DURATION = 500; // milliseconds
        
        const selectHandler = (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            console.log(`📱 Board ${boardNumber} selected via tap`);
            
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
        
        // Touch start - record initial position and time
        item.addEventListener('touchstart', (e) => {
            touchStartTime = Date.now();
            touchStartY = e.touches[0].clientY;
            touchStartX = e.touches[0].clientX;
            hasMoved = false;
            
            // Visual feedback for potential tap
            item.style.transform = 'scale(0.98)';
            item.style.opacity = '0.8';
            
            console.log(`📱 Touch start on Board ${boardNumber}`);
        }, { passive: false });
        
        // Touch move - check if this is scrolling
        item.addEventListener('touchmove', (e) => {
            const currentY = e.touches[0].clientY;
            const currentX = e.touches[0].clientX;
            const moveY = Math.abs(currentY - touchStartY);
            const moveX = Math.abs(currentX - touchStartX);
            
            // If moved beyond threshold, this is scrolling, not a tap
            if (moveY > MOVE_THRESHOLD || moveX > MOVE_THRESHOLD) {
                hasMoved = true;
                
                // Reset visual feedback - this is scrolling
                item.style.transform = '';
                item.style.opacity = '';
                
                console.log(`📱 Scroll detected on Board ${boardNumber} - moveY: ${moveY}, moveX: ${moveX}`);
            }
        }, { passive: true });
        
        // Touch end - determine if this was a tap or scroll
        item.addEventListener('touchend', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            const touchDuration = Date.now() - touchStartTime;
            
            // Reset visual feedback
            item.style.transform = '';
            item.style.opacity = '';
            
            // Only trigger selection if:
            // 1. Touch didn't move beyond threshold (not scrolling)
            // 2. Touch duration was reasonable for a tap
            if (!hasMoved && touchDuration < TAP_MAX_DURATION) {
                console.log(`📱 Valid tap detected on Board ${boardNumber} - duration: ${touchDuration}ms`);
                selectHandler(e);
            } else {
                console.log(`📱 Scroll gesture ignored on Board ${boardNumber} - moved: ${hasMoved}, duration: ${touchDuration}ms`);
            }
        }, { passive: false });
        
        // Touch cancel - reset state
        item.addEventListener('touchcancel', () => {
            item.style.transform = '';
            item.style.opacity = '';
            hasMoved = false;
            console.log(`📱 Touch cancelled on Board ${boardNumber}`);
        }, { passive: true });
        
        // Click handler for desktop
        item.addEventListener('click', selectHandler);
    });
    
    // CANCEL BUTTON - FIXED
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
    
    // REFRESH SCROLL BUTTON - NEW
    if (refreshBtn) {
        const refreshHandler = (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('🔄 Refresh scroll button pressed');
            this.refreshBoardListScroll();
        };
        
        refreshBtn.style.touchAction = 'manipulation';
        refreshBtn.style.userSelect = 'none';
        refreshBtn.style.webkitTapHighlightColor = 'transparent';
        
        refreshBtn.addEventListener('click', refreshHandler);
        refreshBtn.addEventListener('touchend', refreshHandler, { passive: false });
        
        // Touch feedback
        refreshBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            refreshBtn.style.transform = 'scale(0.95)';
            refreshBtn.style.opacity = '0.8';
        }, { passive: false });
        
        refreshBtn.addEventListener('touchend', () => {
            setTimeout(() => {
                refreshBtn.style.transform = '';
                refreshBtn.style.opacity = '';
            }, 100);
        }, { passive: false });
    }
    
    console.log(`✅ Board list events setup complete for ${boardItems.length} boards`);
}

/**
 * Apply comprehensive mobile scrolling fixes - PIXEL 9A SPECIFIC
 */
applyBoardListScrollingFixes() {
    if (!this.isMobile) {
        console.log('📱 Desktop detected - skipping mobile scrolling fixes');
        return;
    }
    
    console.log('🔧 Applying comprehensive mobile scrolling fixes for board list...');
    
    const container = document.getElementById('boardListContainer');
    const modal = document.querySelector('#boardSelectorPopup > div');
    
    if (container && modal) {
        // Enhanced modal fixes
        modal.style.maxHeight = '90vh';
        modal.style.display = 'flex';
        modal.style.flexDirection = 'column';
        modal.style.overflow = 'hidden';
        
        // Enhanced container fixes
        container.style.height = '350px'; // Fixed height
        container.style.overflowY = 'scroll'; // Force scroll
        container.style.overflowX = 'hidden';
        container.style.webkitOverflowScrolling = 'touch';
        container.style.transform = 'translateZ(0)';
        container.style.willChange = 'scroll-position';
        container.style.overflowAnchor = 'none';
        container.style.position = 'relative';
        
        // Enhanced scrollbar visibility
        const scrollbarStyle = document.createElement('style');
        scrollbarStyle.id = 'boardListScrollbarStyle';
        scrollbarStyle.textContent = `
            #boardListContainer::-webkit-scrollbar {
                width: 12px !important;
                background: rgba(255, 255, 255, 0.2) !important;
            }
            #boardListContainer::-webkit-scrollbar-thumb {
                background: rgba(52, 152, 219, 0.6) !important;
                border-radius: 6px !important;
                border: 2px solid rgba(255, 255, 255, 0.1) !important;
            }
            #boardListContainer::-webkit-scrollbar-track {
                background: rgba(0, 0, 0, 0.05) !important;
                border-radius: 6px !important;
            }
            #boardListContainer::-webkit-scrollbar-thumb:hover {
                background: rgba(52, 152, 219, 0.8) !important;
            }
        `;
        
        // Remove existing style if present
        const existingStyle = document.getElementById('boardListScrollbarStyle');
        if (existingStyle) existingStyle.remove();
        
        document.head.appendChild(scrollbarStyle);
        
        // Test scrolling functionality
        const testScroll = () => {
            const initialScrollTop = container.scrollTop;
            container.scrollTop = 50;
            
            setTimeout(() => {
                const newScrollTop = container.scrollTop;
                console.log(`📱 Scroll test - Initial: ${initialScrollTop}, Set: 50, Actual: ${newScrollTop}`);
                console.log(`📱 Container - Height: ${container.clientHeight}, ScrollHeight: ${container.scrollHeight}`);
                
                if (newScrollTop === initialScrollTop && container.scrollHeight > container.clientHeight) {
                    console.warn('⚠️ Scrolling may not be working - applying fallback fixes');
                    
                    // Visual feedback for scroll issues
                    container.style.border = '3px solid #e74c3c';
                    container.style.boxShadow = 'inset 0 0 15px rgba(231, 76, 60, 0.3)';
                    
                    // Add scroll hint
                    const scrollHint = document.createElement('div');
                    scrollHint.innerHTML = '👆 Touch and drag to scroll boards';
                    scrollHint.style.cssText = `
                        position: absolute;
                        top: 10px;
                        right: 10px;
                        background: rgba(231, 76, 60, 0.9);
                        color: white;
                        padding: 6px 12px;
                        border-radius: 6px;
                        font-size: 11px;
                        z-index: 200;
                        pointer-events: none;
                        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                    `;
                    container.appendChild(scrollHint);
                    
                    // Fade out hint after 4 seconds
                    setTimeout(() => {
                        scrollHint.style.transition = 'opacity 1s ease';
                        scrollHint.style.opacity = '0';
                        setTimeout(() => scrollHint.remove(), 1000);
                    }, 4000);
                } else {
                    console.log('✅ Board list scrolling appears to be working correctly');
                }
                
                // Reset scroll position
                container.scrollTop = 0;
            }, 100);
        };
        
        testScroll();
        
        // Enhanced touch event handlers for problematic devices
        let touchStartY = null;
        let isScrolling = false;
        
        container.addEventListener('touchstart', (e) => {
            touchStartY = e.touches[0].clientY;
            isScrolling = false;
            console.log('📱 Board list touch scroll start');
        }, { passive: true });
        
        container.addEventListener('touchmove', (e) => {
            if (touchStartY !== null) {
                const touchY = e.touches[0].clientY;
                const deltaY = touchStartY - touchY;
                
                // Only handle if significant movement
                if (Math.abs(deltaY) > 5) {
                    isScrolling = true;
                    const newScrollTop = container.scrollTop + deltaY * 0.8;
                    const maxScroll = container.scrollHeight - container.clientHeight;
                    
                    container.scrollTop = Math.max(0, Math.min(newScrollTop, maxScroll));
                    touchStartY = touchY;
                    
                    console.log(`📱 Board list touch scroll: ${container.scrollTop}/${maxScroll}`);
                }
            }
        }, { passive: true });
        
        container.addEventListener('touchend', () => {
            touchStartY = null;
            if (isScrolling) {
                console.log('📱 Board list touch scroll completed');
            }
            isScrolling = false;
        }, { passive: true });
        
        console.log('✅ Comprehensive mobile scrolling fixes applied for board list');
    } else {
        console.warn('⚠️ Could not find board list container or modal for scrolling fixes');
    }
}

/**
 * Refresh board list scroll - PIXEL 9A FIX
 */
refreshBoardListScroll() {
    console.log('🔄 Refreshing board list scroll for mobile...');
    
    const container = document.getElementById('boardListContainer');
    if (container) {
        // Visual feedback
        container.style.border = '2px solid #27ae60';
        container.style.transition = 'border-color 0.3s ease';
        
        // Force scroll activation by scrolling to bottom and back
        container.scrollTop = container.scrollHeight;
        setTimeout(() => {
            container.scrollTop = 0;
        }, 100);
        
        // Re-apply scrolling properties
        container.style.overflowY = 'scroll';
        container.style.webkitOverflowScrolling = 'touch';
        container.style.transform = 'translateZ(0)';
        container.style.willChange = 'scroll-position';
        
        // Re-apply scrollbar styles
        this.applyBoardListScrollingFixes();
        
        setTimeout(() => {
            container.style.border = '1px solid #bdc3c7';
        }, 600);
        
        console.log('✅ Board list scroll refreshed');
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
    
    // Clean up scrollbar styles
    const scrollbarStyle = document.getElementById('boardListScrollbarStyle');
    if (scrollbarStyle) scrollbarStyle.remove();
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
/**
 * Handle board selection actions
 */
handleBoardSelection(value) {
    if (value === 'DEAL') {  // SIMPLIFIED: Only check for DEAL button
        if (this.areAllBoardsComplete()) {
            console.log('📊 All boards complete - showing simple results');
            
            // Simple results display
            const completionStatus = this.getCompletionStatus();
            
            const simpleResults = `
                <h4>🎉 Tournament Complete!</h4>
                <p><strong>Movement:</strong> ${this.session.movement.description}</p>
                <p><strong>Boards Completed:</strong> ${completionStatus.completed}/${completionStatus.total} (${completionStatus.percentage}%)</p>
                <p><strong>All boards have been played successfully!</strong></p>
                
                <div style="margin: 20px 0; padding: 15px; background: rgba(39, 174, 96, 0.1); border-radius: 8px;">
                    <strong>✅ Session Summary:</strong><br>
                    • All ${completionStatus.total} boards completed<br>
                    • Results entered for all pairs<br>
                    • Matchpoints calculated<br>
                </div>
            `;
            
            this.bridgeApp.showModal('🏆 Tournament Results', simpleResults);
            
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
// END SECTION THREE
// SECTION FOUR - Button-Based Traveler System (COMPLETE VERSION)

/**
 * Open traveler using button-based input (like Chicago Bridge)
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
 * Open specific traveler for a board using button system
 */
openSpecificTraveler(boardNumber) {
    this.traveler.isActive = true;
    this.traveler.boardNumber = boardNumber;
    this.traveler.data = this.generateTravelerRows(boardNumber);
    this.currentResultIndex = 0;
    
    // Initialize first result entry
    this.initializeTravelerResult();
    
    console.log(`📊 Opened button-based traveler for Board ${boardNumber}`);
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
        result: null, // Will be '=', '+1', '+2', '-1', '-2', etc.
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
    // Set traveler input state
    this.travelerInputState = 'level_selection';
    this.resultMode = null; // 'plus' or 'down'
    
    // Override main input state
    this.inputState = 'traveler_entry';
    
    // Update display to show traveler interface
    this.updateDisplay();
    
    console.log(`📋 Initialized traveler entry for pair ${this.currentResultIndex + 1}/${this.traveler.data.length}`);
}

/**
 * Handle traveler input using Chicago Bridge style - ENHANCED ERROR HANDLING
 */
handleTravelerInput(value) {
    console.log(`🎮 Traveler input: ${value} in state: ${this.travelerInputState}`);
    
    // Safety check - ensure traveler is active
    if (!this.traveler.isActive || !this.traveler.data || this.currentResultIndex >= this.traveler.data.length) {
        console.error('⚠️ Invalid traveler state - closing');
        this.closeTraveler();
        return;
    }
    
    // Handle back navigation first
    if (value === 'BACK') {
        this.handleTravelerBack();
        return;
    }
    
    const currentResult = this.traveler.data[this.currentResultIndex];
    
    // Safety check for current result
    if (!currentResult) {
        console.error('⚠️ No current result available');
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
            default:
                console.warn(`🚫 Unhandled traveler input state: ${this.travelerInputState}`);
                // Don't crash - just log and continue
        }
        
        // Update display safely
        setTimeout(() => {
            try {
                this.updateDisplay();
            } catch (displayError) {
                console.error('Display update error in traveler:', displayError);
            }
        }, 10);
        
    } catch (error) {
        console.error('Error handling traveler input:', error);
        // Don't crash the app - close traveler safely
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
        console.log(`📊 Traveler level selected: ${currentResult.level}`);
    }
}

/**
 * Handle suit selection in traveler
 */
handleTravelerSuitSelection(value, currentResult) {
    if (['♣', '♦', '♥', '♠', 'NT'].includes(value)) {
        currentResult.suit = value;
        this.travelerInputState = 'declarer_selection';
        console.log(`♠ Traveler suit selected: ${currentResult.suit}`);
    }
}

/**
 * Handle declarer selection in traveler - FIXED: Only declarer here
 */
handleTravelerDeclarerSelection(value, currentResult) {
    if (['N', 'S', 'E', 'W'].includes(value)) {
        currentResult.declarer = value;
        this.travelerInputState = 'double_selection';  // FIXED: Go to double selection
        console.log(`👤 Traveler declarer selected: ${currentResult.declarer}`);
    }
}

/**
 * Handle double selection - NEW STATE AFTER DECLARER
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
    
    console.log(`💥 Traveler double state: ${currentResult.double || 'None'}`);
}

/**
 * Handle result type selection (Made/Plus/Down) - Chicago Style
 */
handleTravelerResultTypeSelection(value, currentResult) {
    if (value === 'MADE') {
        currentResult.result = '=';
        this.calculateTravelerScore(this.currentResultIndex);
        currentResult.isComplete = true;
        this.travelerInputState = 'result_complete';
        console.log(`✅ Contract made exactly`);
        
    } else if (value === 'DOWN') {
        this.resultMode = 'down';
        this.travelerInputState = 'result_number_selection';
        console.log(`📉 Contract failed - selecting undertricks`);
        
    } else if (value === 'PLUS') {
        this.resultMode = 'plus';
        this.travelerInputState = 'result_number_selection';
        console.log(`📈 Contract made with overtricks - selecting number`);
    }
}

/**
 * Handle result number selection (overtricks/undertricks) - Chicago Style
 */
handleTravelerResultNumberSelection(value, currentResult) {
    if (['1', '2', '3', '4', '5', '6', '7'].includes(value)) {
        const num = parseInt(value);
        
        if (this.resultMode === 'down') {
            currentResult.result = `-${num}`;
            console.log(`📉 Contract failed by ${num} tricks`);
            
        } else if (this.resultMode === 'plus') {
            // Validate overtricks don't exceed maximum possible
            const maxOvertricks = 13 - (6 + currentResult.level);
            if (num <= maxOvertricks) {
                currentResult.result = `+${num}`;
                console.log(`📈 Contract made with ${num} overtricks`);
            } else {
                console.warn(`⚠️ Invalid overtricks: ${num}, max is ${maxOvertricks}`);
                return;
            }
        }
        
        // Calculate score and complete result
        this.calculateTravelerScore(this.currentResultIndex);
        currentResult.isComplete = true;
        this.travelerInputState = 'result_complete';
    }
}

/**
 * Handle result complete actions
 */
handleTravelerResultComplete(value) {
    console.log(`🎮 Result complete action: ${value}`);
    
    if (value === 'DEAL') {
        // Move to next result
        this.nextTravelerResult();
    }
}

/**
 * Move to next traveler result
 */
nextTravelerResult() {
    if (this.currentResultIndex < this.traveler.data.length - 1) {
        // Move to next pair
        this.currentResultIndex++;
        this.travelerInputState = 'level_selection';
        this.resultMode = null;
        console.log(`➡️ Moving to next pair: ${this.currentResultIndex + 1}/${this.traveler.data.length}`);
    } else {
        // All results entered - save and close
        this.saveTravelerData();
    }
}

/**
 * Get active buttons for traveler input - FIXED FOR NEW STATES
 */
getTravelerActiveButtons() {
    const currentResult = this.traveler.data[this.currentResultIndex];
    
    console.log(`🔍 Getting buttons for state: ${this.travelerInputState}`);
    
    switch (this.travelerInputState) {
        case 'level_selection':
            return ['1', '2', '3', '4', '5', '6', '7'];
            
        case 'suit_selection':
            return ['♣', '♦', '♥', '♠', 'NT'];
            
        case 'declarer_selection':
            return ['N', 'S', 'E', 'W'];  // FIXED: Only declarer buttons
            
        case 'double_selection':  // NEW STATE
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
            console.warn(`Unknown traveler input state: ${this.travelerInputState}`);
            return [];
    }
}

/**
 * Handle traveler back navigation - FIXED ALL STATES WITH STABILITY
 */
handleTravelerBack() {
    const currentResult = this.traveler.data[this.currentResultIndex];
    
    console.log(`🔙 Traveler back from state: ${this.travelerInputState}`);
    
    // Safety check - ensure we have valid data
    if (!currentResult) {
        console.error('⚠️ No current result data - closing traveler');
        this.closeTraveler();
        return;
    }
    
    switch (this.travelerInputState) {
        case 'suit_selection':
            this.travelerInputState = 'level_selection';
            currentResult.level = null;
            console.log('🔙 Back to level selection');
            break;
            
        case 'declarer_selection':
            this.travelerInputState = 'suit_selection';
            currentResult.suit = null;
            console.log('🔙 Back to suit selection');
            break;
            
        case 'double_selection':
            this.travelerInputState = 'declarer_selection';
            currentResult.declarer = null;
            currentResult.double = '';
            console.log('🔙 Back to declarer selection');
            break;
            
        case 'result_type_selection':
            this.travelerInputState = 'double_selection';
            console.log('🔙 Back to double selection');
            break;
            
        case 'result_number_selection':
            this.travelerInputState = 'result_type_selection';
            this.resultMode = null;
            console.log('🔙 Back to result type selection');
            break;
            
        case 'result_complete':
            // FIXED: Only go back one step to result type selection
            this.travelerInputState = 'result_type_selection';
            
            // Clear the completed result data
            currentResult.result = null;
            currentResult.nsScore = null;
            currentResult.ewScore = null;
            currentResult.isComplete = false;
            this.resultMode = null; // Clear result mode
            
            console.log('🔙 Back to result type selection from complete');
            break;
            
        case 'level_selection':
            if (this.currentResultIndex > 0) {
                // Go to previous result
                this.previousTravelerResult();
            } else {
                // First result - close traveler and return to board selection
                console.log('🔙 Closing traveler from first result');
                this.closeTraveler();
            }
            break;
            
        default:
            console.warn(`🚫 Unhandled back navigation from state: ${this.travelerInputState}`);
            // Fallback - try to close traveler safely
            this.closeTraveler();
    }
    
    // Force a single display update after state change
    setTimeout(() => {
        this.updateDisplay();
    }, 50);
}

/**
 * Go to previous traveler result - ENHANCED WITH SAFETY CHECKS
 */
previousTravelerResult() {
    if (this.currentResultIndex > 0) {
        this.currentResultIndex--;
        
        // Reset input state based on current result completion - ENHANCED
        const currentResult = this.traveler.data[this.currentResultIndex];
        
        // Safety check
        if (!currentResult) {
            console.error('⚠️ Invalid previous result data');
            this.closeTraveler();
            return;
        }
        
        if (currentResult.isComplete) {
            this.travelerInputState = 'result_complete';
        } else if (currentResult.result !== null) {
            // Result partially entered
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
        
        console.log(`⬅️ Moving to previous pair: ${this.currentResultIndex + 1}/${this.traveler.data.length}`);
    } else {
        console.log('🔙 Already at first result - cannot go back further');
    }
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
        this.session.boards[this.traveler.boardNumber].hasResults = true;  // FIXED: Add hasResults flag
        this.session.boards[this.traveler.boardNumber].resultCount = this.traveler.data.filter(r => r.isComplete).length;
        
        console.log(`💾 Saved traveler data for Board ${this.traveler.boardNumber}`);
        this.bridgeApp.showMessage(`Board ${this.traveler.boardNumber} saved!`, 'success');
    } else {
        console.log('⚠️ No results to save');
        this.bridgeApp.showMessage('Enter at least one result before saving', 'warning');
    }
    
    this.closeTraveler();
}

/**
 * Close traveler and return to board selection - ENHANCED SAFETY
 */
closeTraveler() {
    try {
        // Clear traveler state safely
        this.traveler.isActive = false;
        this.traveler.boardNumber = null;
        this.traveler.data = [];
        this.currentResultIndex = 0;
        this.travelerInputState = 'level_selection';
        this.resultMode = null;
        
        // Return to board selection state
        this.inputState = 'board_selection';
        
        console.log('📊 Traveler closed safely, returned to board selection');
        
        // Update display safely
        setTimeout(() => {
            try {
                this.updateDisplay();
            } catch (displayError) {
                console.error('Display update error after traveler close:', displayError);
                // Force a basic display update
                const display = document.getElementById('display');
                if (display) {
                    display.innerHTML = '<div class="current-state">Returning to board selection...</div>';
                }
            }
        }, 50);
        
    } catch (error) {
        console.error('Error closing traveler:', error);
        
        // Emergency fallback - reset to safe state
        this.traveler = {
            isActive: false,
            boardNumber: null,
            data: []
        };
        this.inputState = 'board_selection';
        
        // Try to update display
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
 * Get contract display for current traveler result - Chicago Style
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
 * Calculate score for a specific traveler row - Standard Duplicate Scoring (Chicago Style)
 */
calculateTravelerScore(rowIndex) {
    const row = this.traveler.data[rowIndex];
    if (!row.level || !row.suit || !row.declarer || !row.result) return;
    
    console.log(`🧮 Calculating duplicate score for row ${rowIndex}:`, row);
    
    const vulnerability = this.getBoardVulnerability(this.traveler.boardNumber);
    const declarerSide = ['N', 'S'].includes(row.declarer) ? 'NS' : 'EW';
    
    // Determine if declarer's side is vulnerable
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
    
    // Assign scores to pairs (in duplicate, show actual points earned)
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
    
    console.log('🏆 Matchpoints calculated for', completedResults.length, 'results');
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

// END SECTION FOUR
// SECTION FIVE - Game Management (COMPLETE FIXED VERSION)

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
 * Generate movement table HTML with responsive design - FIXED VERSION
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
    
    // Add table headers - FIXED: Use movement.tables instead of hardcoded
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
        
        // Add table data with improved formatting - FIXED: Use movement.tables
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
 * Check if all boards are completed - FIXED LOGIC
 */
areAllBoardsComplete() {
    if (!this.session.isSetup || !this.session.boards) {
        console.log('🔍 Not setup or no boards');
        return false;
    }
    
    const boards = Object.values(this.session.boards);
    const totalBoards = boards.length;
    const completedBoards = boards.filter(board => board.completed).length;
    
    console.log(`🔍 Board completion check: ${completedBoards}/${totalBoards} complete`);
    
    if (totalBoards === 0) return false;
    
    const allComplete = completedBoards === totalBoards;
    console.log(`🔍 All boards complete: ${allComplete}`);
    
    return allComplete;
}

/**
 * Get completion status - ENHANCED LOGGING
 */
getCompletionStatus() {
    if (!this.session.isSetup || !this.session.boards) {
        return { completed: 0, total: 0, percentage: 0 };
    }
    
    const boards = Object.values(this.session.boards);
    const completed = boards.filter(board => board.completed).length;
    const total = boards.length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    console.log(`📊 Completion status: ${completed}/${total} (${percentage}%)`);
    
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

/**
 * Handle board selection actions - FIXED FOR DETAILED RESULTS
 */
handleBoardSelection(value) {
    if (value === 'DEAL') {  // FIXED: Handle DEAL button for detailed results
        if (this.areAllBoardsComplete()) {
            console.log('📊 All boards complete - showing detailed standings table');
            
            // FIXED: Call the detailed standings function instead of simple results
            this.showFinalStandings();
            
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
 * Show final standings table - ENHANCED VERSION
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
 * Calculate final standings with matchpoint totals - FIXED VERSION
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
    
    console.log(`📊 Processing ${completedBoards.length} completed boards for standings`);
    
    completedBoards.forEach(board => {
        const resultsWithScores = board.results.filter(result => 
            result.nsScore !== null || result.ewScore !== null
        );
        
        if (resultsWithScores.length < 2) {
            console.log(`⚠️ Board ${board.number} has insufficient results (${resultsWithScores.length})`);
            return; // Need at least 2 results for comparison
        }
        
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
            // Sort by percentage, then by total matchpoints
            if (b.percentage !== a.percentage) return b.percentage - a.percentage;
            return b.totalMatchpoints - a.totalMatchpoints;
        });
    
    console.log('📊 Final standings calculated:', standings);
    return standings;
}

/**
 * Calculate matchpoints for a specific board's results - ENHANCED
 */
calculateBoardMatchpoints(results) {
    if (results.length < 2) return;
    
    console.log(`🏆 Calculating matchpoints for ${results.length} results`);
    
    // Calculate NS matchpoints (EW are complementary)
    results.forEach(result => {
        let nsMatchpoints = 0;
        let ewMatchpoints = 0;
        
        results.forEach(otherResult => {
            if (result !== otherResult) {
                // Compare NS scores (higher is better)
                const nsScore = result.nsScore || 0;
                const otherNsScore = otherResult.nsScore || 0;
                
                // NS comparison
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
    
    console.log(`✅ Matchpoints calculated for ${results.length} results`);
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
 * Handle back navigation with state management
 */
handleBack() {
    console.log(`🔙 Back pressed from state: ${this.inputState}`);
    
    // Close any active popups first
    if (this.traveler.isActive) {
        this.closeTraveler();
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
 * Get active buttons for current state with enhanced logic - FIXED RESULTS BUTTON
 */
getActiveButtons() {
    // Handle traveler input buttons
    if (this.inputState === 'traveler_entry') {
        const travelerButtons = this.getTravelerActiveButtons();
        
        // Always add BACK for traveler
        if (!travelerButtons.includes('BACK')) {
            travelerButtons.push('BACK');
        }
        
        return travelerButtons;
    }
    
    // No buttons active when traveler popup is open (shouldn't happen with button system)
    if (this.traveler.isActive && this.inputState !== 'traveler_entry') {
        return [];
    }
    
    switch (this.inputState) {
        case 'pairs_setup':
            return ['4', '6', '8'];
            
        case 'movement_confirm':
            return ['1', '2', 'BACK'];
            
        case 'board_selection':
            const buttons = ['BACK'];
            
            // FIXED: Check for all boards complete properly
            const completionStatus = this.getCompletionStatus();
            console.log(`🔍 Completion check: ${completionStatus.completed}/${completionStatus.total} (${completionStatus.percentage}%)`);
            
            if (completionStatus.percentage === 100) {
                buttons.push('DEAL');  // FIXED: Use DEAL button for results when 100% complete
                console.log('✅ Adding DEAL button for results - all boards complete');
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
    
    // Debug log for traveler state
    if (this.inputState === 'traveler_entry') {
        console.log(`🔍 Traveler state - boardNumber: ${this.traveler.boardNumber}, inputState: ${this.travelerInputState}`);
    }
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
// SECTION SIX - Help and Quit Methods (CLEAN FIXED VERSION)
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
                    <h4>📄 Printable Templates</h4>
                    <p><strong>Perfect for home games and cruise ships!</strong></p>
                    <div style="margin: 10px 0;">
                        <button onclick="window.duplicateBridge.showBoardTemplates()" style="
                            background: #27ae60; color: white; border: none; 
                            padding: 10px 16px; border-radius: 4px; margin: 5px;
                            cursor: pointer; font-size: 13px; font-weight: bold;
                        ">📋 Board Templates</button>
                        <button onclick="window.duplicateBridge.showTravelerTemplates()" style="
                            background: #3498db; color: white; border: none; 
                            padding: 10px 16px; border-radius: 4px; margin: 5px;
                            cursor: pointer; font-size: 13px; font-weight: bold;
                        ">📊 Traveler Sheets</button>
                    </div>
                </div>
            `,
            buttons: [
                { text: 'Close Help', action: 'close', class: 'close-btn' }
            ]
        };
    }
    
    /**
     * Show board templates popup - USING GLOBAL FUNCTIONS
     */
    showBoardTemplates() {
        // Set up global functions that can be called from HTML
        window.downloadBoardTemplate12 = () => this.downloadBoardTemplate('12');
        window.downloadBoardTemplate10 = () => this.downloadBoardTemplate('10');
        window.downloadBoardTemplate14 = () => this.downloadBoardTemplate('14');
        window.downloadMovementSheets4 = () => this.downloadMovementSheets('4');
        window.downloadMovementSheets6 = () => this.downloadMovementSheets('6');
        window.downloadMovementSheets8 = () => this.downloadMovementSheets('8');
        window.closeBoardTemplatesPopup = () => {
            const popup = document.getElementById('boardTemplatesPopup');
            if (popup) popup.remove();
        };
        
        const popup = document.createElement('div');
        popup.id = 'boardTemplatesPopup';
        popup.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
            background: rgba(0,0,0,0.8); z-index: 1000; 
            display: flex; align-items: center; justify-content: center;
        `;
        
        popup.innerHTML = `
            <div style="
                background: white; padding: 20px; border-radius: 8px; 
                max-width: 90%; max-height: 85%; overflow-y: auto; 
                color: #2c3e50; min-width: 300px;
            ">
                <h3 style="text-align: center; margin: 0 0 15px 0;">📋 Board Templates</h3>
                
                <div style="text-align: center; margin: 15px 0;">
                    <button onclick="window.downloadBoardTemplate12()" style="
                        background: #27ae60; color: white; border: none; 
                        padding: 10px 16px; border-radius: 4px; margin: 5px;
                        cursor: pointer; font-size: 13px; font-weight: bold;
                    ">📄 12 Boards (4 pairs)</button>
                    
                    <button onclick="window.downloadBoardTemplate10()" style="
                        background: #3498db; color: white; border: none; 
                        padding: 10px 16px; border-radius: 4px; margin: 5px;
                        cursor: pointer; font-size: 13px; font-weight: bold;
                    ">📄 10 Boards (6 pairs)</button>
                    
                    <button onclick="window.downloadBoardTemplate14()" style="
                        background: #e67e22; color: white; border: none; 
                        padding: 10px 16px; border-radius: 4px; margin: 5px;
                        cursor: pointer; font-size: 13px; font-weight: bold;
                    ">📄 14 Boards (8 pairs)</button>
                    
                    <br>
                    
                    <button onclick="window.downloadMovementSheets4()" style="
                        background: #9b59b6; color: white; border: none; 
                        padding: 10px 16px; border-radius: 4px; margin: 5px;
                        cursor: pointer; font-size: 13px; font-weight: bold;
                    ">📋 Movement (4 pairs)</button>
                    
                    <button onclick="window.downloadMovementSheets6()" style="
                        background: #9b59b6; color: white; border: none; 
                        padding: 10px 16px; border-radius: 4px; margin: 5px;
                        cursor: pointer; font-size: 13px; font-weight: bold;
                    ">📋 Movement (6 pairs)</button>
                    
                    <button onclick="window.downloadMovementSheets8()" style="
                        background: #9b59b6; color: white; border: none; 
                        padding: 10px 16px; border-radius: 4px; margin: 5px;
                        cursor: pointer; font-size: 13px; font-weight: bold;
                    ">📋 Movement (8 pairs)</button>
                </div>
                
                <div style="text-align: center; margin-top: 20px;">
                    <button onclick="window.closeBoardTemplatesPopup()" style="
                        background: #e74c3c; color: white; border: none; 
                        padding: 12px 20px; border-radius: 6px; 
                        cursor: pointer; font-size: 14px; font-weight: bold;
                    ">Close</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(popup);
        console.log('✅ Board templates popup created with global functions');
    }
    
    /**
     * Show traveler templates popup - USING GLOBAL FUNCTIONS
     */
    showTravelerTemplates() {
        // Set up global functions
        window.downloadTravelerTemplate = () => this.downloadTravelerTemplate();
        window.closeTravelerTemplatesPopup = () => {
            const popup = document.getElementById('travelerTemplatesPopup');
            if (popup) popup.remove();
        };
        
        const popup = document.createElement('div');
        popup.id = 'travelerTemplatesPopup';
        popup.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
            background: rgba(0,0,0,0.8); z-index: 1000; 
            display: flex; align-items: center; justify-content: center;
        `;
        
        popup.innerHTML = `
            <div style="
                background: white; padding: 20px; border-radius: 8px; 
                max-width: 90%; max-height: 85%; overflow-y: auto; 
                color: #2c3e50; min-width: 300px;
            ">
                <h3 style="text-align: center; margin: 0 0 15px 0;">📊 Traveler Sheets</h3>
                
                <div style="margin-bottom: 20px; padding: 15px; background: rgba(52, 152, 219, 0.1); border-radius: 6px;">
                    <p style="margin: 0; font-size: 13px; line-height: 1.5;">
                        <strong>Bespoke traveler sheets</strong> with button-based entry system. 
                        Circle choices instead of writing contracts!
                    </p>
                </div>
                
                <div style="text-align: center; margin: 15px 0;">
                    <button onclick="window.downloadTravelerTemplate()" style="
                        background: #3498db; color: white; border: none; 
                        padding: 12px 20px; border-radius: 6px; margin: 5px;
                        cursor: pointer; font-size: 14px; font-weight: bold;
                    ">📄 Download Bespoke Traveler Sheets</button>
                </div>
                
                <div style="text-align: center; margin-top: 20px;">
                    <button onclick="window.closeTravelerTemplatesPopup()" style="
                        background: #e74c3c; color: white; border: none; 
                        padding: 12px 20px; border-radius: 6px; 
                        cursor: pointer; font-size: 14px; font-weight: bold;
                    ">Close</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(popup);
        console.log('✅ Traveler templates popup created with global functions');
    }
    
    /**
     * Download board template - SIMPLE VERSION
     */
    downloadBoardTemplate(boardCount) {
        const numBoards = parseInt(boardCount);
        console.log(`📄 Generating ${numBoards} board template`);
        
        let htmlContent = '<!DOCTYPE html><html><head><title>Bridge-Modes Board Templates</title>';
        htmlContent += '<style>body{font-family:Arial}';
        htmlContent += '.slip{border:2px solid black;width:200px;height:120px;display:inline-block;margin:5px;text-align:center;padding:20px}';
        htmlContent += '.vuln{color:red} .not-vuln{color:blue}';
        htmlContent += '</style></head><body>';
        htmlContent += '<h1>Bridge-Modes Board Templates - ' + numBoards + ' Boards</h1>';
        htmlContent += '<p>© 2025 Bridge-Modes App | Right-click → Print → Save as PDF</p>';
        
        for (let board = 1; board <= numBoards; board++) {
            const positions = ['N', 'E', 'S', 'W'];
            positions.forEach(position => {
                const isVuln = this.isPositionVulnerable(board, position);
                const vulnText = isVuln ? 'Vul' : 'Not Vul';
                const vulnClass = isVuln ? 'vuln' : 'not-vuln';
                
                htmlContent += '<div class="slip">';
                htmlContent += '<div>Board ' + board + '</div>';
                htmlContent += '<div style="font-size:24px;margin:10px" class="' + vulnClass + '">' + position + '</div>';
                htmlContent += '<div>' + vulnText + '</div>';
                htmlContent += '</div>';
            });
        }
        
        htmlContent += '</body></html>';
        
        this.downloadFile(htmlContent, 'bridge-modes-board-slips-' + numBoards + 'boards.html');
        
        const popup = document.getElementById('boardTemplatesPopup');
        if (popup) popup.remove();
    }
    
    /**
     * Download traveler template - SIMPLE VERSION
     */
    downloadTravelerTemplate() {
        console.log('📊 Generating bespoke traveler sheets');
        
        let htmlContent = '<!DOCTYPE html><html><head><title>Bridge-Modes Bespoke Traveler Sheets</title>';
        htmlContent += '<style>body{font-family:Arial;font-size:10pt}';
        htmlContent += '.traveler{border:2px solid black;margin:20px;page-break-after:always}';
        htmlContent += '.header{background:black;color:white;padding:10px;text-align:center;font-weight:bold}';
        htmlContent += 'table{width:100%;border-collapse:collapse}';
        htmlContent += 'th,td{border:1px solid black;padding:5px;text-align:center}';
        htmlContent += 'th{background:#333;color:white;font-size:8pt}';
        htmlContent += '.button{width:16px;height:16px;border:1px solid black;display:inline-block;margin:1px;font-size:7pt;text-align:center}';
        htmlContent += '</style></head><body>';
        htmlContent += '<h1>Bridge-Modes Bespoke Traveler Sheets</h1>';
        htmlContent += '<p>© 2025 Bridge-Modes App - Patented Button System | Right-click → Print → Save as PDF</p>';
        
        for (let board = 1; board <= 16; board++) {
            const vulnerability = this.getBoardVulnerability(board);
            htmlContent += '<div class="traveler">';
            htmlContent += '<div class="header">Board ' + board + ' - ' + vulnerability.toUpperCase() + ' VULNERABLE</div>';
            htmlContent += '<p style="text-align:center"><strong>Circle ONE choice in each column - Follow app button sequence!</strong></p>';
            htmlContent += '<table>';
            htmlContent += '<tr><th>NS Pair</th><th>EW Pair</th><th>1.Level</th><th>2.Suit</th><th>3.Declarer</th><th>4.Double</th><th>5.Result</th><th>6.Number</th><th>NS Score</th><th>EW Score</th></tr>';
            
            for (let row = 0; row < 8; row++) {
                htmlContent += '<tr><td></td><td></td>';
                
                // Level buttons
                htmlContent += '<td>';
                for (let i = 1; i <= 7; i++) {
                    htmlContent += '<span class="button">' + i + '</span>';
                }
                htmlContent += '</td>';
                
                // Suit buttons
                htmlContent += '<td>';
                htmlContent += '<span class="button">♣</span><span class="button">♦</span><span class="button">♥</span><span class="button">♠</span><span class="button">NT</span>';
                htmlContent += '</td>';
                
                // Declarer buttons
                htmlContent += '<td>';
                htmlContent += '<span class="button">N</span><span class="button">S</span><span class="button">E</span><span class="button">W</span>';
                htmlContent += '</td>';
                
                // Double buttons
                htmlContent += '<td>';
                htmlContent += '<span class="button">-</span><span class="button">X</span><span class="button">XX</span>';
                htmlContent += '</td>';
                
                // Result buttons
                htmlContent += '<td>';
                htmlContent += '<span class="button">✓</span><span class="button">+</span><span class="button">-</span>';
                htmlContent += '</td>';
                
                // Number buttons
                htmlContent += '<td>';
                htmlContent += '<span class="button">-</span>';
                for (let i = 1; i <= 7; i++) {
                    htmlContent += '<span class="button">' + i + '</span>';
                }
                htmlContent += '</td>';
                
                htmlContent += '<td></td><td></td></tr>';
            }
            
            htmlContent += '</table></div>';
        }
        
        htmlContent += '</body></html>';
        
        this.downloadFile(htmlContent, 'bridge-modes-bespoke-traveler-sheets.html');
        
        const popup = document.getElementById('travelerTemplatesPopup');
        if (popup) popup.remove();
    }
    
    /**
     * Download movement sheets - SIMPLE VERSION
     */
    downloadMovementSheets(pairCount) {
        const numPairs = parseInt(pairCount);
        console.log(`📋 Generating movement sheets for ${numPairs} pairs`);
        
        if (!this.movements[numPairs]) {
            this.bridgeApp.showMessage(`Movement for ${numPairs} pairs not available`, 'error');
            return;
        }
        
        const movement = this.movements[numPairs];
        
        let htmlContent = '<!DOCTYPE html><html><head><title>Bridge-Modes Movement Sheets</title>';
        htmlContent += '<style>body{font-family:Arial}';
        htmlContent += '.table-sheet{border:2px solid black;margin:20px;page-break-after:always}';
        htmlContent += '.header{background:#2c3e50;color:white;padding:15px;text-align:center;font-size:18pt}';
        htmlContent += 'table{width:100%;border-collapse:collapse;margin:10px 0}';
        htmlContent += 'th,td{border:1px solid black;padding:10px;text-align:center}';
        htmlContent += 'th{background:#34495e;color:white}';
        htmlContent += '.ns{color:#27ae60;font-weight:bold}';
        htmlContent += '.ew{color:#e74c3c;font-weight:bold}';
        htmlContent += '</style></head><body>';
        htmlContent += '<h1>Bridge-Modes Movement Sheets - ' + numPairs + ' Pairs</h1>';
        htmlContent += '<p>© 2025 Bridge-Modes App | Right-click → Print → Save as PDF</p>';
        
        for (let tableNum = 1; tableNum <= movement.tables; tableNum++) {
            const tableMovement = movement.movement.filter(entry => entry.table === tableNum);
            
            htmlContent += '<div class="table-sheet">';
            htmlContent += '<div class="header">TABLE ' + tableNum + ' MOVEMENT GUIDE</div>';
            htmlContent += '<p><strong>Post this sheet at Table ' + tableNum + '</strong></p>';
            htmlContent += '<table>';
            htmlContent += '<tr><th>Round</th><th>North-South</th><th>East-West</th><th>Boards</th><th>Next Movement</th></tr>';
            
            tableMovement.forEach((entry, index) => {
                const boardRange = entry.boards.length > 1 ? 
                    entry.boards[0] + '-' + entry.boards[entry.boards.length-1] : 
                    entry.boards[0];
                
                let nextMove = 'Tournament Complete!';
                if (index < tableMovement.length - 1) {
                    const nsNext = this.findNextTable(movement, entry.ns, entry.round + 1);
                    const ewNext = this.findNextTable(movement, entry.ew, entry.round + 1);
                    nextMove = 'NS ' + entry.ns + ' → Table ' + nsNext + ' | EW ' + entry.ew + ' → Table ' + ewNext;
                }
                
                htmlContent += '<tr>';
                htmlContent += '<td><strong>Round ' + entry.round + '</strong></td>';
                htmlContent += '<td class="ns">Pair ' + entry.ns + '</td>';
                htmlContent += '<td class="ew">Pair ' + entry.ew + '</td>';
                htmlContent += '<td>Boards ' + boardRange + '</td>';
                htmlContent += '<td style="font-size:10pt">' + nextMove + '</td>';
                htmlContent += '</tr>';
            });
            
            htmlContent += '</table></div>';
        }
        
        htmlContent += '</body></html>';
        
        this.downloadFile(htmlContent, 'bridge-modes-movement-sheets-' + numPairs + 'pairs.html');
        
        const popup = document.getElementById('boardTemplatesPopup');
        if (popup) popup.remove();
    }
    
    /**
     * Find next table for a pair
     */
    findNextTable(movement, pairNum, nextRound) {
        const nextEntry = movement.movement.find(entry => 
            entry.round === nextRound && (entry.ns === pairNum || entry.ew === pairNum)
        );
        return nextEntry ? nextEntry.table : '?';
    }
    
    /**
     * Simple file download
     */
    downloadFile(content, filename) {
        const blob = new Blob([content], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.bridgeApp.showMessage('Template downloaded! Right-click → Print → Save as PDF', 'success');
    }
    
    /**
     * Check if a position is vulnerable
     */
    isPositionVulnerable(boardNumber, position) {
        const vulnerability = this.getBoardVulnerability(boardNumber);
        
        if (vulnerability === 'None') return false;
        if (vulnerability === 'Both') return true;
        
        const isNS = position === 'N' || position === 'S';
        
        if (vulnerability === 'NS') return isNS;
        if (vulnerability === 'EW') return !isNS;
        
        return false;
    }
    
    /**
     * Show help
     */
    showHelp() {
        const helpContent = this.getHelpContent();
        this.bridgeApp.showModal(helpContent.title, helpContent.content);
    }
    
    /**
     * Show quit options
     */
    showQuit() {
        const content = `
            <div class="help-section">
                <h4>🎮 Session Options</h4>
                <p>What would you like to do?</p>
            </div>
        `;
        
        const buttons = [
            { text: 'Continue Session', action: () => {}, class: 'continue-btn' },
            { text: 'Show Help', action: () => this.showHelp(), class: 'help-btn' },
            { text: 'Return to Main Menu', action: () => this.returnToMainMenu(), class: 'menu-btn' }
        ];
        
        this.bridgeApp.showModal('🏆 Duplicate Bridge Options', content, buttons);
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
// SECTION EIGHT - Utility and Game Management (WITH RESULTS FUNCTIONS)

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
                // Compare NS scores (higher is better)
                if (result.nsScore > otherResult.nsScore) {
                    nsMatchpoints += 2;
                } else if (result.nsScore === otherResult.nsScore) {
                    nsMatchpoints += 1;
                    ewMatchpoints += 1;
                } else {
                    ewMatchpoints += 2;
                }
            }
        });
        
        result.matchpoints = { ns: nsMatchpoints, ew: ewMatchpoints };
    });
    
    console.log(`🏆 Matchpoints calculated for ${results.length} results`);
}

/**
 * Get board status with enhanced information - FIXED RESULT DISPLAY
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

// END SECTION EIGHT
// SECTION NINE - Display Content Methods (DEAL BUTTON MESSAGE FIXED)

/**
 * Get display content for current state - UPDATED WITH DEAL BUTTON MESSAGE
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
 * Get board selection display content - FIXED FOR DEAL BUTTON DISPLAY
 */
getBoardSelectionContent() {
    const completionStatus = this.getCompletionStatus();
    const isComplete = completionStatus.percentage === 100;
    
    console.log('🔍 DEBUG: getBoardSelectionContent - completion:', completionStatus);
    console.log('🔍 DEBUG: isComplete:', isComplete);
    
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
                    ${isComplete ? '🎉 Tournament Complete!' : '📊 Board Entry'}
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
                    padding: 15px; 
                    border-radius: 6px; 
                    border-left: 3px solid #27ae60;
                    text-align: center;
                    margin: 15px 0;
                ">
                    <div style="color: #27ae60; font-weight: bold; font-size: 14px; margin-bottom: 10px;">
                        ✅ All boards completed!
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
                        🏆 View Final Results
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
                        💡 <strong>Tip:</strong> Enter results after each round
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
 * Get display content for traveler entry state - TRAVELER DISPLAY METHOD
 */
getTravelerEntryContent() {
    if (!this.traveler.isActive) {
        return '<div class="current-state">Traveler not active</div>';
    }
    
    const progress = this.getCurrentTravelerProgress();
    const scoringSummary = this.getTravelerScoringSummary();
    const vulnerability = scoringSummary.vulnerabilityDisplay;
    
    // Get current result for contract display
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
            <div class="mode-title">🏆 Board ${this.traveler.boardNumber}</div>
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

/**
 * Enhanced updateDisplay that sets up the results button
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
            this.setupViewResultsButton(); // NEW: Setup results button
        }, 100);
    }
    
    console.log(`🔄 Display updated for state: ${this.inputState}`);
    console.log(`🔄 Active buttons: ${activeButtons.join(', ')}`);
    
    // Debug log for traveler state
    if (this.inputState === 'traveler_entry') {
        console.log(`🔍 Traveler state - boardNumber: ${this.traveler.boardNumber}, inputState: ${this.travelerInputState}`);
    }
}

/**
 * Setup view results button - NEW FUNCTION
 */
setupViewResultsButton() {
    const resultsBtn = document.getElementById('viewResultsBtn');
    if (!resultsBtn) return;
    
    console.log('🏆 Setting up view results button');
    
    const resultsHandler = (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        console.log('🏆 View Results button pressed');
        
        // Visual feedback
        resultsBtn.style.transform = 'scale(0.95)';
        resultsBtn.style.opacity = '0.8';
        
        setTimeout(() => {
            resultsBtn.style.transform = '';
            resultsBtn.style.opacity = '';
            this.handleBoardSelection('DEAL');
        }, 100);
    };
    
    // Enhanced mobile properties
    resultsBtn.style.touchAction = 'manipulation';
    resultsBtn.style.userSelect = 'none';
    resultsBtn.style.webkitTapHighlightColor = 'transparent';
    resultsBtn.style.cursor = 'pointer';
    
    // Add enhanced handlers
    resultsBtn.addEventListener('click', resultsHandler);
    resultsBtn.addEventListener('touchend', resultsHandler, { passive: false });
    
    // Touch start feedback
    resultsBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        resultsBtn.style.transform = 'scale(0.95)';
        resultsBtn.style.opacity = '0.8';
    }, { passive: false });
    
    console.log('✅ View results button setup complete');
}

// END SECTION NINE// SECTION TEN
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