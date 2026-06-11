//SECTION ONE
/**
 * Duplicate Bridge Mode - Tournament Bridge Scoring
 * Mobile-optimized version with comprehensive tournament support
 * PIXEL 9A FIX: All popups use touchend + click handlers throughout
 */

class DuplicateBridgeMode extends BaseBridgeMode {
    constructor(bridgeApp) {
        super(bridgeApp);
        
        this.modeName = 'Duplicate Bridge';
        this.displayName = 'Duplicate Bridge';
        
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
        
        this.numberBuilder = '';
        this.numberBuildTimeout = null;
        this.availableMovements = [];
        
        this.inputState = 'welcome';
        this.isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        this.initializeMovements();
        this.initialize();
    }

    initializeMovements() {
        if (typeof ENHANCED_MOVEMENTS !== 'undefined') {
            this.movements = ENHANCED_MOVEMENTS;
            console.log('✅ Using enhanced movements with', Object.keys(this.movements).length, 'movement options');
            return;
        }

        console.warn('⚠️ Enhanced movements not yet loaded, will retry...');
        
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

        setTimeout(() => {
            if (typeof ENHANCED_MOVEMENTS !== 'undefined') {
                this.movements = ENHANCED_MOVEMENTS;
                console.log('✅ Enhanced movements loaded on retry:', Object.keys(this.movements).length, 'movements');
                this.updateDisplay();
            } else {
                console.error('❌ Enhanced movements still not available - check script loading order in HTML');
            }
        }, 500);
    }

    initialize() {
        this.inputState = 'welcome';
        this.session.isSetup = false;
        this.traveler.isActive = false;
        window.duplicateBridge = this;
        this.updateDisplay();
    }

    // ─── SHARED PIXEL-COMPATIBLE HANDLER FACTORY ─────────────────────────────
    // Used by ALL popups throughout this file
    _addPixelHandler(btn, action) {
        if (!btn) return;
        const handler = (e) => {
            e.preventDefault();
            e.stopPropagation();
            action();
        };
        btn.addEventListener('click', handler, { passive: false });
        btn.addEventListener('touchend', handler, { passive: false });
        btn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            btn.style.opacity = '0.7';
            setTimeout(() => { btn.style.opacity = '1'; }, 150);
        }, { passive: false });
    }

    _addPixelHandlerById(id, action) {
        const btn = document.getElementById(id);
        this._addPixelHandler(btn, action);
    }

// SECTION TWO
    handleInput(value) {
        if (this.inputState === 'traveler_entry') {
            this.handleTravelerInput(value);
            return;
        }
        
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
        
        if (value === 'NV') {
            this.showPrintMenu();
            return;
        }
        
        if (value === 'HELP') {
            this.showHelp();
            return;
        }
        
        if (value === 'QUIT') {
            this.showQuit();
            return;
        }
        
        if (value === 'DEAL' && this.inputState === 'board_selection') {
            this.handleBoardSelection(value);
            return;
        }
        
        this.handleAction(value);
    }

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

    getBoardVulnerability(boardNumber) {
        const cycle = (boardNumber - 1) % 16;
        const vulns = ['None', 'NS', 'EW', 'Both', 'EW', 'Both', 'None', 'NS', 
                      'NS', 'EW', 'Both', 'None', 'Both', 'None', 'NS', 'EW'];
        return vulns[cycle];
    }

    isDeclarerVulnerable(boardNumber, declarer) {
        const vulnerability = this.getBoardVulnerability(boardNumber);
        if (vulnerability === 'None') return false;
        if (vulnerability === 'Both') return true;
        const isNS = declarer === 'N' || declarer === 'S';
        if (vulnerability === 'NS') return isNS;
        if (vulnerability === 'EW') return !isNS;
        return false;
    }

    handleAction(value) {
        switch (this.inputState) {
            case 'welcome': this.handleWelcome(value); break;
            case 'pairs_setup': this.handlePairsSetup(value); break;
            case 'movement_selection': this.handleMovementSelection(value); break;
            case 'movement_confirm': this.handleMovementConfirm(value); break;
            case 'board_selection': this.handleBoardSelection(value); break;
            case 'results': this.handleResults(value); break;
        }
        this.updateDisplay();
    }

    handleWelcome(value) {
        if (value === '1') {
            this.showPrintMenu();
        } else if (value === '2') {
            this.inputState = 'pairs_setup';
            this.updateDisplay();
        }
    }

    getWelcomeContent() {
        const movementCount = this.movements ? Object.keys(this.movements).length : 0;
        return `
            <div class="title-score-row">
                <div class="mode-title">Duplicate Bridge</div>
                <div class="score-display">Welcome</div>
            </div>
            <div class="game-content">
                <div style="text-align: center; margin-bottom: 12px;">
                    <p style="font-size: 15px; font-weight: 600; color: #2c3e50; margin: 0;">
                        Tournament scoring &bull; 4–20 pairs &bull; ${movementCount} movements
                    </p>
                </div>
                <div style="background: #27ae60; color: white; padding: 14px 15px; border-radius: 8px; margin: 8px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">
                    <div style="font-size: 16px; font-weight: bold;">1 = 🖨️ Print Menu</div>
                    <div style="font-size: 13px; font-weight: 600; opacity: 0.95; margin-top: 4px;">
                        Table cards &bull; Travellers &bull; Movement sheets
                    </div>
                </div>
                <div style="background: #3498db; color: white; padding: 14px 15px; border-radius: 8px; margin: 8px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">
                    <div style="font-size: 16px; font-weight: bold;">2 = ▶ Start Tournament Setup</div>
                    <div style="font-size: 13px; font-weight: 600; opacity: 0.95; margin-top: 4px;">
                        Enter pairs, choose movement, begin scoring
                    </div>
                </div>
            </div>
            <div class="current-state">1 = Print Menu &nbsp;|&nbsp; 2 = Start Setup</div>
        `;
    }

    handlePairsSetup(value) {
        if (value === 'BACK') {
            if (this.numberBuilder) {
                this.numberBuilder = '';
                clearTimeout(this.numberBuildTimeout);
                this.updateDisplay();
            } else {
                this.bridgeApp.showModeSelector();
            }
            return;
        }
        if (/^\d$/.test(value)) {
            this.buildNumber(value);
        }
    }
    
    buildNumber(digit) {
        clearTimeout(this.numberBuildTimeout);
        
        if (!this.numberBuilder) {
            this.numberBuilder = digit;
            if (digit === '0') {
                this.bridgeApp.showMessage('Enter pairs: 4-9, or two digits for 10-20', 'warning');
                this.numberBuilder = '';
                this.updateDisplay();
                return;
            }
            if (digit === '3') {
                this.bridgeApp.showMessage('No movements for 3x pairs. Try 1, 2, or 4-9.', 'warning');
                this.numberBuilder = '';
                this.updateDisplay();
                return;
            }
            if (digit === '1' || digit === '2') {
                this.updateDisplay();
                return;
            }
            this.updateDisplay();
            this.submitPairCount();
            return;
        }
        
        this.numberBuilder += digit;
        this.updateDisplay();
        this.submitPairCount();
    }
    
    submitPairCount() {
        const pairCount = parseInt(this.numberBuilder);
        this.numberBuilder = '';
        
        this.availableMovements = Object.entries(this.movements)
            .filter(([key, mov]) => mov.pairs === pairCount)
            .map(([key, mov]) => ({ key, ...mov }));
        
        if (this.availableMovements.length === 0) {
            this.bridgeApp.showMessage(`No movement available for ${pairCount} pairs`, 'warning');
            this.updateDisplay();
        } else {
            this.session.pairs = pairCount;
            this.inputState = 'movement_selection';
            this.updateDisplay();
        }
    }

    handleMovementSelection(value) {
        const index = parseInt(value);
        if (index >= 1 && index <= this.availableMovements.length) {
            this.session.movement = this.availableMovements[index - 1];
            this.inputState = 'movement_confirm';
            this.updateDisplay();
        }
    }

    handleMovementConfirm(value) {
        if (value === '1') {
            this.showMovementPopup();
        } else if (value === '2') {
            this.printTableCardsAndStart();
        } else if (value === '3') {
            this.setupBoards();
            this.inputState = 'board_selection';
        }
    }

    printTableCardsAndStart() {
        if (typeof tableCardGenerator === 'undefined') {
            this.bridgeApp.showMessage('⚠️ Table card generator not loaded. Starting tournament...', 'warning');
            this.setupBoards();
            this.inputState = 'board_selection';
            return;
        }
        tableCardGenerator.generateTableCards(this.session.movement);
        this.bridgeApp.showMessage('✅ Table cards ready! Print them and set up your tables', 'success');
        setTimeout(() => {
            this.setupBoards();
            this.inputState = 'board_selection';
            this.updateDisplay();
        }, 2000);
    }

    handleBoardSelection(value) {
        if (value === 'DEAL') {
            if (this.areAllBoardsComplete()) {
                this.showFinalStandings();
            } else {
                this.bridgeApp.showMessage('Complete all boards before viewing results', 'warning');
            }
        }
    }

    handleResults(value) {}

    openTravelerPopup(boardNumber = null) {
        if (this.traveler.isActive) return;
        if (boardNumber) {
            this.openSpecificTraveler(boardNumber);
        } else {
            this.showBoardSelectorPopup();
        }
    }

    openSpecificTraveler(boardNumber) {
        this.traveler.isActive = true;
        this.traveler.boardNumber = boardNumber;
        this.traveler.data = this.generateTravelerRows(boardNumber);
        this.currentResultIndex = 0;
        this.initializeTravelerResult();
    }

    generateTravelerRows(boardNumber) {
        const instances = this.session.movement.movement.filter(entry => 
            entry.boards && entry.boards.includes(boardNumber)
        );
        return instances.map((instance) => ({
            nsPair: instance.ns,
            ewPair: instance.ew,
            level: null, suit: null, declarer: null,
            double: '', result: null,
            nsScore: null, ewScore: null,
            matchpoints: { ns: 0, ew: 0 },
            isComplete: false
        }));
    }

    initializeTravelerResult() {
        this.travelerInputState = 'level_selection';
        this.resultMode = null;
        this.inputState = 'traveler_entry';
        this.updateDisplay();
    }

// SECTION THREE
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
                background: white; padding: 20px; border-radius: 8px; 
                max-width: 90%; max-height: 85%; overflow: hidden; 
                color: #2c3e50; min-width: 280px;
                display: flex; flex-direction: column;
            ">
                <h3 style="text-align: center; margin: 0 0 15px 0; color: #2c3e50;">Select Board</h3>
                <div id="boardListContainer" style="
                    height: 350px; overflow-y: scroll; overflow-x: hidden;
                    -webkit-overflow-scrolling: touch; margin: 15px 0;
                    border: 1px solid #bdc3c7; border-radius: 6px;
                    background: rgba(255,255,255,0.95);
                    transform: translateZ(0); will-change: scroll-position; position: relative;
                ">
                    ${this.getBoardListHTML()}
                </div>
                <div style="text-align: center; margin-top: 15px; display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;">
                    <button id="cancelBoardBtn" style="
                        background: #e74c3c; color: white; border: none; 
                        padding: 12px 20px; border-radius: 6px; min-height: 44px; 
                        font-size: 14px; cursor: pointer; font-weight: bold;
                        min-width: 120px; touch-action: manipulation; user-select: none;
                    ">Cancel</button>
                    <button id="refreshScrollBtn" style="
                        background: #3498db; color: white; border: none; 
                        padding: 12px 20px; border-radius: 6px; min-height: 44px; 
                        font-size: 14px; cursor: pointer; font-weight: bold;
                        min-width: 120px; touch-action: manipulation; user-select: none;
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

    getBoardListHTML() {
        let html = '';
        for (let i = 1; i <= this.session.movement.totalBoards; i++) {
            const board = this.session.boards[i];
            const vulnerability = board.vulnerability;
            const vulnDisplay = { 'None': 'None', 'NS': 'NS', 'EW': 'EW', 'Both': 'All' };
            const vulnColor = this.getVulnerabilityColor(vulnerability);
            const resultStatus = board.hasResults ? `${board.resultCount || 0} results entered` : 'No results yet';
            html += `
                <div class="board-list-item" data-board="${i}" style="
                    background: ${board.completed ? 'rgba(39, 174, 96, 0.1)' : 'rgba(52, 152, 219, 0.1)'};
                    border: 2px solid ${board.completed ? '#27ae60' : '#3498db'};
                    border-radius: 8px; padding: 12px; margin: 8px; cursor: pointer;
                    display: flex; justify-content: space-between; align-items: center;
                    min-height: 50px; touch-action: manipulation; user-select: none;
                    -webkit-tap-highlight-color: transparent;
                ">
                    <div style="flex: 1;">
                        <div style="font-weight: bold; font-size: 16px; color: #2c3e50;">
                            Board ${i} ${board.completed ? '✅' : '⭕'}
                        </div>
                        <div style="font-size: 12px; color: #7f8c8d;">${resultStatus}</div>
                    </div>
                    <div style="background: ${vulnColor}; color: white; padding: 6px 12px;
                        border-radius: 20px; font-size: 12px; font-weight: bold;
                        min-width: 50px; text-align: center;">
                        ${vulnDisplay[vulnerability]}
                    </div>
                </div>
            `;
        }
        return html;
    }

    setupBoardListEvents() {
        const boardItems = document.querySelectorAll('.board-list-item');
        const cancelBtn = document.getElementById('cancelBoardBtn');
        const refreshBtn = document.getElementById('refreshScrollBtn');
        
        boardItems.forEach(item => {
            const boardNumber = parseInt(item.dataset.board);
            let touchStartTime = 0, touchStartY = 0, touchStartX = 0, hasMoved = false;
            const MOVE_THRESHOLD = 10, TAP_MAX_DURATION = 500;
            
            const selectHandler = (e) => {
                e.preventDefault();
                e.stopPropagation();
                item.style.transform = 'scale(0.98)';
                item.style.opacity = '0.8';
                setTimeout(() => {
                    item.style.transform = '';
                    item.style.opacity = '';
                    this.closeBoardSelector();
                    setTimeout(() => { this.openSpecificTraveler(boardNumber); }, 100);
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
                const moveY = Math.abs(e.touches[0].clientY - touchStartY);
                const moveX = Math.abs(e.touches[0].clientX - touchStartX);
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
                if (!hasMoved && touchDuration < TAP_MAX_DURATION) selectHandler(e);
            }, { passive: false });
            
            item.addEventListener('touchcancel', () => {
                item.style.transform = '';
                item.style.opacity = '';
                hasMoved = false;
            }, { passive: true });
            
            item.addEventListener('click', selectHandler);
        });
        
        if (cancelBtn) {
            this._addPixelHandler(cancelBtn, () => this.closeBoardSelector());
        }
        if (refreshBtn) {
            this._addPixelHandler(refreshBtn, () => this.refreshBoardListScroll());
        }
    }

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
            container.style.webkitOverflowScrolling = 'touch';
            container.style.transform = 'translateZ(0)';
        }
    }

    refreshBoardListScroll() {
        const container = document.getElementById('boardListContainer');
        if (container) {
            container.style.border = '2px solid #27ae60';
            container.scrollTop = container.scrollHeight;
            setTimeout(() => { container.scrollTop = 0; }, 100);
            container.style.overflowY = 'scroll';
            container.style.webkitOverflowScrolling = 'touch';
            setTimeout(() => { container.style.border = '1px solid #bdc3c7'; }, 600);
        }
    }

    closeBoardSelector() {
        const popup = document.getElementById('boardSelectorPopup');
        if (popup) popup.remove();
    }

    getVulnerabilityColor(vulnerability) {
        const colors = { 'None': '#95a5a6', 'NS': '#27ae60', 'EW': '#e74c3c', 'Both': '#f39c12' };
        return colors[vulnerability] || '#95a5a6';
    }

// SECTION FOUR
    handleTravelerInput(value) {
        if (!this.traveler.isActive || !this.traveler.data || this.currentResultIndex >= this.traveler.data.length) {
            this.closeTraveler();
            return;
        }
        if (value === 'BACK') { this.handleTravelerBack(); return; }
        
        const currentResult = this.traveler.data[this.currentResultIndex];
        if (!currentResult) { this.closeTraveler(); return; }
        
        try {
            switch (this.travelerInputState) {
                case 'level_selection': this.handleTravelerLevelSelection(value, currentResult); break;
                case 'suit_selection': this.handleTravelerSuitSelection(value, currentResult); break;
                case 'declarer_selection': this.handleTravelerDeclarerSelection(value, currentResult); break;
                case 'double_selection': this.handleTravelerDoubleSelection(value, currentResult); break;
                case 'result_type_selection': this.handleTravelerResultTypeSelection(value, currentResult); break;
                case 'result_number_selection': this.handleTravelerResultNumberSelection(value, currentResult); break;
                case 'result_complete': this.handleTravelerResultComplete(value); break;
            }
            setTimeout(() => { this.updateDisplay(); }, 10);
        } catch (error) {
            this.closeTraveler();
        }
    }

    handleTravelerLevelSelection(value, currentResult) {
        if (['1','2','3','4','5','6','7'].includes(value)) {
            currentResult.level = parseInt(value);
            this.travelerInputState = 'suit_selection';
        }
    }

    handleTravelerSuitSelection(value, currentResult) {
        if (['♣','♦','♥','♠','NT'].includes(value)) {
            currentResult.suit = value;
            this.travelerInputState = 'declarer_selection';
        }
    }

    handleTravelerDeclarerSelection(value, currentResult) {
        if (['N','S','E','W'].includes(value)) {
            currentResult.declarer = value;
            this.travelerInputState = 'double_selection';
        }
    }

    handleTravelerDoubleSelection(value, currentResult) {
        if (value === 'X') {
            this.handleTravelerDoubling(currentResult);
        } else if (['MADE','PLUS','DOWN'].includes(value)) {
            this.travelerInputState = 'result_type_selection';
            this.handleTravelerResultTypeSelection(value, currentResult);
        }
    }

    handleTravelerDoubling(currentResult) {
        if (currentResult.double === '') currentResult.double = 'X';
        else if (currentResult.double === 'X') currentResult.double = 'XX';
        else currentResult.double = '';
    }

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

    handleTravelerResultNumberSelection(value, currentResult) {
        if (['1','2','3','4','5','6','7'].includes(value)) {
            const num = parseInt(value);
            if (this.resultMode === 'down') {
                currentResult.result = `-${num}`;
            } else if (this.resultMode === 'plus') {
                const maxOvertricks = 13 - (6 + currentResult.level);
                if (num <= maxOvertricks) currentResult.result = `+${num}`;
                else return;
            }
            this.calculateTravelerScore(this.currentResultIndex);
            currentResult.isComplete = true;
            this.travelerInputState = 'result_complete';
        }
    }

    handleTravelerResultComplete(value) {
        if (value === 'DEAL') this.nextTravelerResult();
    }

    nextTravelerResult() {
        if (this.currentResultIndex < this.traveler.data.length - 1) {
            this.currentResultIndex++;
            this.travelerInputState = 'level_selection';
            this.resultMode = null;
        } else {
            this.saveTravelerData();
        }
    }

    getTravelerActiveButtons() {
        const currentResult = this.traveler.data[this.currentResultIndex];
        switch (this.travelerInputState) {
            case 'level_selection': return ['1','2','3','4','5','6','7'];
            case 'suit_selection': return ['♣','♦','♥','♠','NT'];
            case 'declarer_selection': return ['N','S','E','W'];
            case 'double_selection': return ['X','MADE','PLUS','DOWN'];
            case 'result_type_selection': return ['MADE','PLUS','DOWN'];
            case 'result_number_selection':
                if (this.resultMode === 'down') return ['1','2','3','4','5','6','7'];
                if (this.resultMode === 'plus') {
                    const max = Math.min(6, 13 - (6 + currentResult.level));
                    return Array.from({length: max}, (_, i) => (i+1).toString());
                }
                break;
            case 'result_complete': return ['DEAL'];
            default: return [];
        }
    }

    handleTravelerBack() {
        const currentResult = this.traveler.data[this.currentResultIndex];
        if (!currentResult) { this.closeTraveler(); return; }
        
        switch (this.travelerInputState) {
            case 'suit_selection': this.travelerInputState = 'level_selection'; currentResult.level = null; break;
            case 'declarer_selection': this.travelerInputState = 'suit_selection'; currentResult.suit = null; break;
            case 'double_selection': this.travelerInputState = 'declarer_selection'; currentResult.declarer = null; currentResult.double = ''; break;
            case 'result_type_selection': this.travelerInputState = 'double_selection'; break;
            case 'result_number_selection': this.travelerInputState = 'result_type_selection'; this.resultMode = null; break;
            case 'result_complete':
                this.travelerInputState = 'result_type_selection';
                currentResult.result = null; currentResult.nsScore = null;
                currentResult.ewScore = null; currentResult.isComplete = false;
                this.resultMode = null; break;
            case 'level_selection':
                if (this.currentResultIndex > 0) this.previousTravelerResult();
                else this.closeTraveler();
                break;
            default: this.closeTraveler();
        }
        setTimeout(() => { this.updateDisplay(); }, 50);
    }

    previousTravelerResult() {
        if (this.currentResultIndex > 0) {
            this.currentResultIndex--;
            const currentResult = this.traveler.data[this.currentResultIndex];
            if (!currentResult) { this.closeTraveler(); return; }
            if (currentResult.isComplete) this.travelerInputState = 'result_complete';
            else if (currentResult.result !== null) {
                if (currentResult.result.startsWith('+') || currentResult.result.startsWith('-')) {
                    this.travelerInputState = 'result_number_selection';
                    this.resultMode = currentResult.result.startsWith('+') ? 'plus' : 'down';
                } else this.travelerInputState = 'result_type_selection';
            } else if (currentResult.declarer) this.travelerInputState = 'double_selection';
            else if (currentResult.suit) this.travelerInputState = 'declarer_selection';
            else if (currentResult.level) this.travelerInputState = 'suit_selection';
            else this.travelerInputState = 'level_selection';
        }
    }

// SECTION FIVE
    calculateTravelerScore(rowIndex) {
        const row = this.traveler.data[rowIndex];
        if (!row.level || !row.suit || !row.declarer || !row.result) return;
        
        const isVulnerable = this.isDeclarerVulnerable(this.traveler.boardNumber, row.declarer);
        const declarerSide = ['N','S'].includes(row.declarer) ? 'NS' : 'EW';
        const level = parseInt(row.level);
        const isDoubled = row.double === 'X';
        const isRedoubled = row.double === 'XX';
        const suitPoints = { '♣': 20, '♦': 20, '♥': 30, '♠': 30, 'NT': 30 };
        let score = 0;
        
        if (row.result === '=' || row.result.startsWith('+')) {
            let basicScore = level * suitPoints[row.suit];
            if (row.suit === 'NT') basicScore += 10;
            if (isDoubled || isRedoubled) basicScore *= (isRedoubled ? 4 : 2);
            score = basicScore;
            if (row.result.startsWith('+')) {
                const overtricks = parseInt(row.result.substring(1));
                if (isDoubled || isRedoubled) {
                    const overtrickValue = isVulnerable ? 200 : 100;
                    score += overtricks * overtrickValue * (isRedoubled ? 2 : 1);
                } else score += overtricks * suitPoints[row.suit];
            }
            score += basicScore >= 100 ? (isVulnerable ? 500 : 300) : 50;
            if (isDoubled) score += 50;
            if (isRedoubled) score += 100;
            if (level === 6) score += isVulnerable ? 750 : 500;
            else if (level === 7) score += isVulnerable ? 1500 : 1000;
        } else if (row.result.startsWith('-')) {
            const undertricks = parseInt(row.result.substring(1));
            if (isDoubled || isRedoubled) {
                let penalty = 0;
                for (let i = 1; i <= undertricks; i++) {
                    if (i === 1) penalty += isVulnerable ? 200 : 100;
                    else if (i <= 3) penalty += isVulnerable ? 300 : 200;
                    else penalty += 300;
                }
                score = -penalty * (isRedoubled ? 2 : 1);
            } else {
                score = -(undertricks * (isVulnerable ? 100 : 50));
            }
        }
        
        if (declarerSide === 'NS') {
            row.nsScore = score >= 0 ? score : 0;
            row.ewScore = score >= 0 ? 0 : Math.abs(score);
        } else {
            row.ewScore = score >= 0 ? score : 0;
            row.nsScore = score >= 0 ? 0 : Math.abs(score);
        }
    }

    calculateMatchpoints() {
        const completedResults = this.traveler.data.filter(row => row.nsScore !== null && row.ewScore !== null);
        if (completedResults.length < 2) return;
        completedResults.forEach(row => {
            let nsMatchpoints = 0, ewMatchpoints = 0;
            completedResults.forEach(otherRow => {
                if (row !== otherRow) {
                    if (row.nsScore > otherRow.nsScore) nsMatchpoints += 2;
                    else if (row.nsScore === otherRow.nsScore) { nsMatchpoints += 1; ewMatchpoints += 1; }
                    else ewMatchpoints += 2;
                }
            });
            row.matchpoints = { ns: nsMatchpoints, ew: ewMatchpoints };
        });
    }

    saveTravelerData() {
        this.calculateMatchpoints();
        const hasResults = this.traveler.data.some(row => row.nsScore !== null || row.ewScore !== null);
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
                try { this.updateDisplay(); }
                catch (e) {
                    const d = document.getElementById('display');
                    if (d) d.innerHTML = '<div class="current-state">Returning to board selection...</div>';
                }
            }, 50);
        } catch (error) {
            this.traveler = { isActive: false, boardNumber: null, data: [] };
            this.inputState = 'board_selection';
            setTimeout(() => { this.updateDisplay(); }, 100);
        }
    }

    getCurrentTravelerProgress() {
        if (!this.traveler.isActive) return null;
        const current = this.currentResultIndex + 1;
        const total = this.traveler.data.length;
        const currentResult = this.traveler.data[this.currentResultIndex];
        return {
            current, total,
            nsPair: currentResult.nsPair,
            ewPair: currentResult.ewPair,
            isComplete: currentResult.isComplete,
            contractSoFar: this.getTravelerContractDisplay(currentResult)
        };
    }

    getTravelerContractDisplay(result) {
        let contract = '';
        if (result.level) contract += result.level;
        if (result.suit) contract += result.suit;
        if (result.double) contract += ` ${result.double}`;
        if (result.declarer) contract += ` by ${result.declarer}`;
        if (result.result) contract += ` ${result.result}`;
        return contract || 'No contract yet';
    }

    getTravelerScoringSummary() {
        if (!this.traveler.isActive) return null;
        const currentResult = this.traveler.data[this.currentResultIndex];
        const vulnerability = this.getBoardVulnerability(this.traveler.boardNumber);
        return {
            boardNumber: this.traveler.boardNumber,
            vulnerability,
            vulnerabilityDisplay: this.getVulnerabilityDisplay(vulnerability),
            currentResult,
            scores: { ns: currentResult.nsScore, ew: currentResult.ewScore },
            isComplete: currentResult.isComplete
        };
    }

    getVulnerabilityDisplay(vulnerability) {
        const displays = { 'None': 'None Vulnerable', 'NS': 'NS Vulnerable', 'EW': 'EW Vulnerable', 'Both': 'Both Vulnerable' };
        return displays[vulnerability] || 'Unknown';
    }

    showMovementPopup() {
        const movement = this.session.movement;
        const isSkipMitchell = movement.type === 'mitchell' && movement.tables % 2 === 0;
        const skipRound = isSkipMitchell ? Math.floor(movement.tables / 2) + 1 : null;
        
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
            <style>
                @media print {
                    #movementPopup { background: white !important; position: relative !important; }
                    #movement-close-btn, #movement-print-btn { display: none !important; }
                }
            </style>
            <div style="background: white; padding: 20px; border-radius: 8px; 
                max-width: 95%; max-height: 85%; overflow: auto; color: #2c3e50;
                -webkit-overflow-scrolling: touch;">
                <div style="text-align: center; margin-bottom: 20px; position: sticky; top: 0; background: white; z-index: 10;">
                    <h3 style="margin: 0; color: #2c3e50;">${movement.description}</h3>
                    <div style="color: #7f8c8d; font-size: 14px; margin-top: 5px;">
                        ${movement.pairs} pairs • ${movement.tables} tables • ${movement.rounds} rounds
                    </div>
                </div>
                ${skipWarning}
                ${this.getMovementTableHTML()}
                <div style="display: flex; justify-content: center; align-items: center;
                    gap: 15px; margin-top: 20px; position: sticky; bottom: 0; 
                    background: white; padding: 15px 0; flex-wrap: nowrap;">
                    <button id="movement-close-btn" style="background: #95a5a6; color: white; border: none; 
                        padding: 10px 16px; border-radius: 6px; font-size: 13px; cursor: pointer; 
                        font-weight: bold; min-height: 50px; width: 110px;
                        touch-action: manipulation; user-select: none;">Close</button>
                    <button id="movement-print-btn" style="background: #3498db; color: white; border: none; 
                        padding: 10px 16px; border-radius: 6px; font-size: 13px; cursor: pointer; 
                        font-weight: bold; min-height: 50px; width: 110px;
                        touch-action: manipulation; user-select: none;">🖨️ Print</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(popup);
        setTimeout(() => {
            this._addPixelHandlerById('movement-close-btn', () => {
                const p = document.getElementById('movementPopup');
                if (p) p.remove();
            });
            this._addPixelHandlerById('movement-print-btn', () => { window.print(); });
        }, 100);
    }

    showTemplates(type) {
        if (typeof window.DuplicateTemplates !== 'undefined') {
            const templateGenerator = new DuplicateTemplates();
            if (type === 'board') templateGenerator.showBoardTemplates();
            else if (type === 'traveler') templateGenerator.showTravelerTemplates();
        } else {
            this.bridgeApp.showMessage('Template generator not available. Please load duplicateTemplates.js', 'warning');
        }
    }

    showHelp() {
        try {
            const popup = document.createElement('div');
            popup.id = 'duplicateHelpPopup';
            popup.style.cssText = `
                position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
                background: rgba(0,0,0,0.8); z-index: 1000; 
                display: flex; align-items: center; justify-content: center;
                -webkit-overflow-scrolling: touch;
            `;
            
            popup.innerHTML = `
                <div style="background: white; padding: 20px; border-radius: 8px; 
                    max-width: 90%; max-height: 90%; overflow: hidden; color: #2c3e50;
                    display: flex; flex-direction: column;">
                    <div style="text-align: center; margin-bottom: 15px;">
                        <h3 style="margin: 0; color: #2c3e50;">Duplicate Bridge Help</h3>
                    </div>
                    <div id="help-scroll-container" style="height: 400px; overflow-y: scroll;
                        overflow-x: hidden; -webkit-overflow-scrolling: touch;
                        transform: translateZ(0); border: 1px solid #bdc3c7;
                        border-radius: 6px; padding: 15px; margin-bottom: 15px;">
                        <div style="margin-bottom: 20px;">
                            <h4 style="color: #2c3e50; margin-bottom: 10px;">What is Duplicate Bridge?</h4>
                            <p style="line-height: 1.5;">Tournament form of bridge where multiple pairs play the same deals for fair comparison.</p>
                        </div>
                        <div style="margin-bottom: 20px;">
                            <h4 style="color: #2c3e50; margin-bottom: 10px;">Quick Start</h4>
                            <p style="line-height: 1.5;"><strong>1.</strong> Press 1 for Print Menu (table cards, travellers)<br>
                            <strong>2.</strong> Press 2 to start tournament setup<br>
                            <strong>3.</strong> Enter pairs (4-20), select movement<br>
                            <strong>4.</strong> Print &amp; Start, or Start Now</p>
                        </div>
                        <div style="margin-bottom: 20px;">
                            <h4 style="color: #2c3e50; margin-bottom: 10px;">Movements</h4>
                            <p style="line-height: 1.5;"><strong>Howell:</strong> 4-10 pairs, all pairs play each other<br>
                            <strong>Mitchell:</strong> 12-14 pairs, NS stay, EW move<br>
                            ⚠️ = includes sit-out rounds</p>
                        </div>
                        <div style="margin-bottom: 20px;">
                            <h4 style="color: #2c3e50; margin-bottom: 10px;">Traveler Entry</h4>
                            <p style="line-height: 1.5;">Level → Suit → Declarer → Double (optional) → Result<br>
                            Made = exact, Plus = overtricks, Down = undertricks</p>
                        </div>
                        <div style="margin-bottom: 20px;">
                            <h4 style="color: #2c3e50; margin-bottom: 10px;">Scoring</h4>
                            <p style="line-height: 1.5;">Beat another pair = 2 MP, Tie = 1 MP each, Lose = 0 MP<br>
                            Percentage = MP earned ÷ maximum possible × 100</p>
                        </div>
                    </div>
                    <div style="text-align: center;">
                        <button id="help-refresh-scroll-btn" style="background: #f39c12; color: white; border: none; 
                            padding: 10px 20px; border-radius: 6px; font-size: 12px; cursor: pointer;
                            font-weight: bold; min-height: 44px; touch-action: manipulation; margin: 5px;">
                            Fix Scroll</button>
                        <button id="help-close-btn" style="background: #95a5a6; color: white; border: none; 
                            padding: 10px 20px; border-radius: 6px; font-size: 12px; cursor: pointer;
                            font-weight: bold; min-height: 44px; touch-action: manipulation; margin: 5px;">
                            Close Help</button>
                    </div>
                </div>
            `;
            
            document.body.appendChild(popup);
            setTimeout(() => {
                this._addPixelHandlerById('help-close-btn', () => {
                    const p = document.getElementById('duplicateHelpPopup');
                    if (p) p.remove();
                });
                this._addPixelHandlerById('help-refresh-scroll-btn', () => {
                    const c = document.getElementById('help-scroll-container');
                    if (c) { c.scrollTop = 0; }
                });
            }, 100);
        } catch (error) {
            console.error('Error showing help:', error);
        }
    }

    showQuit() {
        const popup = document.createElement('div');
        popup.id = 'duplicateQuitPopup';
        popup.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
            background: rgba(0,0,0,0.8); z-index: 1000; 
            display: flex; align-items: center; justify-content: center;
        `;
        popup.innerHTML = `
            <div style="background: white; padding: 30px; border-radius: 8px; 
                max-width: 90%; color: #2c3e50; text-align: center;
                box-shadow: 0 4px 20px rgba(0,0,0,0.3);">
                <h3 style="margin: 0 0 20px 0;">Duplicate Bridge Options</h3>
                <div style="display: flex; flex-direction: column; gap: 15px; align-items: center;">
                    <button id="quit-continue-btn" style="background: #27ae60; color: white; border: none; 
                        padding: 12px 24px; border-radius: 6px; font-size: 14px; cursor: pointer;
                        font-weight: bold; min-height: 50px; min-width: 200px; touch-action: manipulation;">
                        Continue Session</button>
                    <button id="quit-help-btn" style="background: #3498db; color: white; border: none; 
                        padding: 12px 24px; border-radius: 6px; font-size: 14px; cursor: pointer;
                        font-weight: bold; min-height: 50px; min-width: 200px; touch-action: manipulation;">
                        Show Help</button>
                    <button id="quit-menu-btn" style="background: #e74c3c; color: white; border: none; 
                        padding: 12px 24px; border-radius: 6px; font-size: 14px; cursor: pointer;
                        font-weight: bold; min-height: 50px; min-width: 200px; touch-action: manipulation;">
                        Return to Main Menu</button>
                </div>
            </div>
        `;
        document.body.appendChild(popup);
        setTimeout(() => {
            this._addPixelHandlerById('quit-continue-btn', () => {
                const p = document.getElementById('duplicateQuitPopup');
                if (p) p.remove();
            });
            this._addPixelHandlerById('quit-help-btn', () => {
                const p = document.getElementById('duplicateQuitPopup');
                if (p) p.remove();
                setTimeout(() => this.showHelp(), 100);
            });
            this._addPixelHandlerById('quit-menu-btn', () => {
                const p = document.getElementById('duplicateQuitPopup');
                if (p) p.remove();
                setTimeout(() => this.returnToMainMenu(), 100);
            });
        }, 100);
    }

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

    // ─── PRINT MENU ───────────────────────────────────────────────────────────

    showPrintMenu() {
        console.log('🖨️ Opening Print Menu...');
        const existing = document.getElementById('printMenuPopup');
        if (existing) existing.remove();

        const popup = document.createElement('div');
        popup.id = 'printMenuPopup';
        popup.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.8); z-index: 1000;
            display: flex; align-items: center; justify-content: center;
        `;

        popup.innerHTML = `
            <div style="background: white; border-radius: 10px;
                width: 88%; max-width: 340px; padding: 20px;
                color: #2c3e50; box-shadow: 0 4px 20px rgba(0,0,0,0.4);">
                <div style="text-align: center; margin-bottom: 15px;">
                    <h3 style="margin: 0 0 4px 0; color: #2c3e50;">🖨️ Print Menu</h3>
                    <p style="margin: 0; font-size: 12px; color: #7f8c8d;">Select what to print</p>
                </div>
                <button id="pmBtn1" style="display: block; width: 100%; padding: 13px;
                    margin-bottom: 10px; border: none; border-radius: 7px;
                    background: #27ae60; color: white; font-size: 15px; font-weight: 600;
                    cursor: pointer; text-align: left; min-height: 50px; touch-action: manipulation;">
                    📋 Table Movement Cards</button>
                <button id="pmBtn2" style="display: block; width: 100%; padding: 13px;
                    margin-bottom: 10px; border: none; border-radius: 7px;
                    background: #3498db; color: white; font-size: 15px; font-weight: 600;
                    cursor: pointer; text-align: left; min-height: 50px; touch-action: manipulation;">
                    📊 Traveler Sheets (HTML)</button>
                <button id="pmBtn3" style="display: block; width: 100%; padding: 13px;
                    margin-bottom: 10px; border: none; border-radius: 7px;
                    background: #e67e22; color: white; font-size: 15px; font-weight: 600;
                    cursor: pointer; text-align: left; min-height: 50px; touch-action: manipulation;">
                    🎴 Board Slips (HTML)</button>
                <button id="pmBtn4" style="display: block; width: 100%; padding: 13px;
                    margin-bottom: 15px; border: none; border-radius: 7px;
                    background: #9b59b6; color: white; font-size: 15px; font-weight: 600;
                    cursor: pointer; text-align: left; min-height: 50px; touch-action: manipulation;">
                    📑 Movement Sheet</button>
                <button id="pmClose" style="display: block; width: 100%; padding: 11px;
                    border: 2px solid #bdc3c7; border-radius: 7px;
                    background: white; color: #7f8c8d; font-size: 14px; font-weight: 600;
                    cursor: pointer; min-height: 44px; touch-action: manipulation;">
                    ✕ Close</button>
            </div>
        `;

        document.body.appendChild(popup);

        this._addPixelHandlerById('pmBtn1', () => { popup.remove(); this.printTableCards(); });
        this._addPixelHandlerById('pmBtn2', () => { popup.remove(); this.printTravelerSheets(); });
        this._addPixelHandlerById('pmBtn3', () => { popup.remove(); this.printBoardSlips(); });
        this._addPixelHandlerById('pmBtn4', () => { popup.remove(); this.showMovementSelector(); });
        this._addPixelHandlerById('pmClose', () => { popup.remove(); });
        popup.addEventListener('click', (e) => { if (e.target === popup) popup.remove(); });
    }

    showMovementSelector() {
        this._showMovementPickerPopup(
            'movementSelectorPopup',
            '📑 Movement Sheet',
            'Select movement to view:',
            (key, movement) => {
                this.showPrintDownloadChoice('Movement Sheet', movement, 'movementSheet');
            }
        );
    }

    // ─── SHARED MOVEMENT PICKER ───────────────────────────────────────────────
    _showMovementPickerPopup(popupId, title, subtitle, onSelect) {
        const existing = document.getElementById(popupId);
        if (existing) existing.remove();

        const popup = document.createElement('div');
        popup.id = popupId;
        popup.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.85); z-index: 1000;
            display: flex; align-items: flex-start; justify-content: center;
            overflow-y: auto; -webkit-overflow-scrolling: touch; padding: 20px 0;
        `;

        const sortedEntries = Object.entries(this.movements).sort((a, b) => {
            if (a[1].pairs !== b[1].pairs) return a[1].pairs - b[1].pairs;
            return a[1].totalBoards - b[1].totalBoards;
        });

        const groups = {};
        sortedEntries.forEach(([key, mov]) => {
            if (!groups[mov.pairs]) groups[mov.pairs] = [];
            groups[mov.pairs].push({ key, mov });
        });

        const colors = ['#27ae60','#3498db','#e67e22','#9b59b6','#1abc9c',
                        '#e74c3c','#f39c12','#16a085','#8e44ad','#2980b9'];
        let colorIdx = 0;
        let groupHTML = '';

        Object.keys(groups).sort((a,b) => a-b).forEach(pairs => {
            groupHTML += `<div style="margin-bottom: 8px;">
                <div style="font-size: 11px; color: #95a5a6; text-transform: uppercase;
                    letter-spacing: 1px; margin-bottom: 4px;">${pairs} Pairs</div>`;
            groups[pairs].forEach(({ key, mov }) => {
                const color = colors[colorIdx % colors.length];
                colorIdx++;
                const sitOut = mov.hasSitOut ? ' ⚠️' : '';
                groupHTML += `
                    <button class="mov-pick-btn" data-key="${key}"
                        style="display: block; width: 100%; padding: 11px 14px;
                            margin-bottom: 6px; border: none; border-radius: 7px;
                            background: ${color}; color: white; font-size: 14px;
                            font-weight: 600; cursor: pointer; text-align: left;
                            line-height: 1.3; min-height: 44px; touch-action: manipulation;">
                        ${mov.description || key}${sitOut}
                    </button>`;
            });
            groupHTML += `</div>`;
        });

        popup.innerHTML = `
            <div style="background: white; border-radius: 10px; width: 88%; max-width: 340px;
                padding: 18px; color: #2c3e50; box-shadow: 0 4px 20px rgba(0,0,0,0.4); margin: auto;">
                <div style="text-align: center; margin-bottom: 14px;">
                    <h3 style="margin: 0 0 3px 0; color: #2c3e50; font-size: 16px;">${title}</h3>
                    <p style="margin: 0; font-size: 12px; color: #7f8c8d;">${subtitle}</p>
                </div>
                ${groupHTML}
                <button id="${popupId}_close" style="display: block; width: 100%; padding: 11px;
                    margin-top: 8px; border: 2px solid #bdc3c7; border-radius: 7px;
                    background: white; color: #7f8c8d; font-size: 14px; font-weight: 600;
                    cursor: pointer; min-height: 44px; touch-action: manipulation;">✕ Close</button>
            </div>
        `;

        document.body.appendChild(popup);

        // Pixel-compatible handlers for movement buttons
        popup.querySelectorAll('.mov-pick-btn').forEach(btn => {
            this._addPixelHandler(btn, () => {
                const key = btn.getAttribute('data-key');
                const movement = this.movements[key];
                popup.remove();
                onSelect(key, movement);
            });
        });

        this._addPixelHandlerById(`${popupId}_close`, () => { popup.remove(); });
        popup.addEventListener('click', (e) => { if (e.target === popup) popup.remove(); });
    }

    printTableCards() {
        this._showMovementPickerPopup(
            'tableCardSelectorPopup',
            '📋 Table Movement Cards',
            'Select movement to print:',
            (key, movement) => {
                this.showPrintDownloadChoice('Table Movement Cards', movement, 'tableCards');
            }
        );
    }

    showPrintDownloadChoice(title, movement, type) {
        const popup = document.createElement('div');
        popup.id = 'printDownloadChoice';
        popup.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.85); z-index: 1001;
            display: flex; align-items: center; justify-content: center;
        `;
        
        popup.innerHTML = `
            <div style="background: white; padding: 30px; border-radius: 8px;
                max-width: 450px; width: 88%; text-align: center;">
                <h3 style="margin: 0 0 10px 0; color: #2c3e50;">${title}</h3>
                <p style="color: #7f8c8d; font-size: 13px; margin-bottom: 25px;">${movement.description}</p>
                <button id="printNowBtn" style="background: #27ae60; color: white; border: none;
                    padding: 15px 30px; margin: 10px; border-radius: 6px; font-size: 15px;
                    font-weight: 600; cursor: pointer; display: block; width: 100%;
                    min-height: 50px; touch-action: manipulation;">🖨️ Print Now</button>
                <button id="downloadHtmlBtn" style="background: #3498db; color: white; border: none;
                    padding: 15px 30px; margin: 10px; border-radius: 6px; font-size: 15px;
                    font-weight: 600; cursor: pointer; display: block; width: 100%;
                    min-height: 50px; touch-action: manipulation;">💾 Download HTML</button>
                <div style="background: #e8f4f8; padding: 12px; border-radius: 6px;
                    margin-top: 15px; font-size: 12px; color: #2c3e50; text-align: left;">
                    <strong>💡 Download HTML:</strong> Save for later, open in browser to print,
                    save as PDF, or email to players.
                </div>
                <button id="closePrintChoice" style="background: #95a5a6; color: white; border: none;
                    padding: 10px 20px; margin-top: 15px; border-radius: 6px; font-size: 14px;
                    cursor: pointer; min-height: 44px; touch-action: manipulation;">Cancel</button>
            </div>
        `;
        
        document.body.appendChild(popup);

        this._addPixelHandlerById('printNowBtn', () => {
            popup.remove();
            if (type === 'tableCards' && typeof tableCardGenerator !== 'undefined') {
                tableCardGenerator.generateTableCards(movement);
            } else if (type === 'movementSheet') {
                const originalMovement = this.session.movement;
                this.session.movement = movement;
                this.showMovementPopup();
                this.session.movement = originalMovement;
            }
        });

        this._addPixelHandlerById('downloadHtmlBtn', () => {
            popup.remove();
            if (type === 'tableCards' && typeof tableCardGenerator !== 'undefined') {
                tableCardGenerator.downloadTableCardsHTML(movement);
            } else if (type === 'movementSheet' && typeof templateGenerator !== 'undefined') {
                templateGenerator.downloadMovementSheet(movement);
            }
        });

        this._addPixelHandlerById('closePrintChoice', () => { popup.remove(); });
        popup.addEventListener('click', (e) => { if (e.target === popup) popup.remove(); });
    }

    printTravelerSheets() {
        if (typeof DuplicateTemplates !== 'undefined') {
            const tg = new DuplicateTemplates();
            tg.showTravelerTemplates();
        } else {
            this.bridgeApp.showMessage('Traveler templates not available', 'error');
        }
    }

    printBoardSlips() {
        if (typeof DuplicateTemplates !== 'undefined') {
            const tg = new DuplicateTemplates();
            tg.showBoardTemplates();
        } else {
            this.bridgeApp.showMessage('Board templates not available', 'error');
        }
    }

// SECTION SIX
    getMovementTableHTML() {
        const movement = this.session.movement;
        if (!movement || !movement.movement) {
            return '<p style="text-align: center; color: #e74c3c;">Movement data not available</p>';
        }
        
        const roundData = {};
        movement.movement.forEach(entry => {
            if (!roundData[entry.round]) roundData[entry.round] = [];
            roundData[entry.round].push(entry);
        });
        
        let html = `
            <div style="overflow-x: auto; margin: 20px 0; -webkit-overflow-scrolling: touch;
                border: 1px solid #bdc3c7; border-radius: 6px;">
                <table style="width: 100%; border-collapse: collapse; font-size: 12px; 
                    min-width: 400px; background: white;">
                    <thead>
                        <tr style="background: #34495e; color: white;">
                            <th style="padding: 10px 8px; border: 1px solid #2c3e50; font-weight: bold;">Round</th>
        `;
        for (let t = 1; t <= movement.tables; t++) {
            html += `<th style="padding: 10px 8px; border: 1px solid #2c3e50; font-weight: bold; min-width: 120px;">Table ${t}</th>`;
        }
        html += '</tr></thead><tbody>';
        
        Object.keys(roundData).sort((a,b) => parseInt(a) - parseInt(b)).forEach((round, roundIndex) => {
            const bgColor = roundIndex % 2 === 0 ? '#f8f9fa' : 'white';
            html += `<tr style="background: ${bgColor};">`;
            html += `<td style="padding: 12px 8px; border: 1px solid #bdc3c7; font-weight: bold; 
                background: #ecf0f1; text-align: center; color: #2c3e50;">${round}</td>`;
            
            for (let t = 1; t <= movement.tables; t++) {
                const entry = roundData[round].find(e => e.table === t);
                if (entry) {
                    const boardRange = entry.boards.length > 1 ? 
                        `${entry.boards[0]}-${entry.boards[entry.boards.length-1]}` : entry.boards[0];
                    html += `<td style="padding: 8px; border: 1px solid #bdc3c7; text-align: center; font-size: 11px; vertical-align: middle;">
                        <div style="font-weight: bold; color: #27ae60; margin-bottom: 2px;">NS: ${entry.ns}</div>
                        <div style="font-weight: bold; color: #e74c3c; margin-bottom: 4px;">EW: ${entry.ew}</div>
                        <div style="color: #7f8c8d; font-size: 10px; background: rgba(52,152,219,0.1);
                            padding: 2px 4px; border-radius: 3px; display: inline-block;">Boards: ${boardRange}</div>
                    </td>`;
                } else {
                    html += '<td style="padding: 8px; border: 1px solid #bdc3c7; text-align: center; color: #bdc3c7;">-</td>';
                }
            }
            html += '</tr>';
        });
        
        html += `</tbody></table></div>
            <div style="background: rgba(52,152,219,0.1); padding: 12px; border-radius: 6px; 
                margin-top: 15px; border-left: 4px solid #3498db; font-size: 13px; color: #2c3e50;">
                <strong>Summary:</strong> ${movement.pairs} pairs • ${movement.tables} tables • 
                ${movement.rounds} rounds • ${movement.totalBoards} boards
            </div>`;
        return html;
    }

    areAllBoardsComplete() {
        if (!this.session.isSetup || !this.session.boards) return false;
        const boards = Object.values(this.session.boards);
        return boards.length > 0 && boards.every(b => b.completed);
    }

    getCompletionStatus() {
        if (!this.session.isSetup || !this.session.boards) return { completed: 0, total: 0, percentage: 0 };
        const boards = Object.values(this.session.boards);
        const completed = boards.filter(b => b.completed).length;
        const total = boards.length;
        return { completed, total, percentage: total > 0 ? Math.round((completed / total) * 100) : 0 };
    }

    getBoardStatus() {
        if (!this.session.isSetup) return [];
        return Object.values(this.session.boards).map(board => ({
            number: board.number,
            vulnerability: board.vulnerability,
            completed: board.completed,
            resultCount: board.results ? board.results.filter(r => r.isComplete).length : 0,
            hasResults: board.hasResults || (board.results && board.results.some(r => r.nsScore !== null || r.ewScore !== null))
        }));
    }

// SECTION SEVEN
    showFinalStandings() {
        const standings = this.calculateFinalStandings();
        if (standings.length === 0) {
            this.bridgeApp.showModal('Final Standings', '<p>No results available for standings calculation.</p>');
            return;
        }
        
        let standingsContent = `
            <div><h4>Final Standings</h4>
            <p><strong>Movement:</strong> ${this.session.movement.description}</p></div>
            <div style="overflow-x: auto; margin: 15px 0; -webkit-overflow-scrolling: touch;">
                <table style="width: 100%; border-collapse: collapse; font-size: 13px; background: white; min-width: 400px;">
                    <thead style="background: #2c3e50; color: white;">
                        <tr>
                            <th style="padding: 12px 8px; border: 1px solid #34495e; text-align: center;">Pos</th>
                            <th style="padding: 12px 8px; border: 1px solid #34495e; text-align: center;">Pair</th>
                            <th style="padding: 12px 8px; border: 1px solid #34495e; text-align: center;">MP</th>
                            <th style="padding: 12px 8px; border: 1px solid #34495e; text-align: center;">%</th>
                            <th style="padding: 12px 8px; border: 1px solid #34495e; text-align: center;">Boards</th>
                        </tr>
                    </thead>
                    <tbody>
        `;
        
        standings.forEach((pair, index) => {
            const position = index + 1;
            const icon = position === 1 ? '🥇' : position === 2 ? '🥈' : position === 3 ? '🥉' : '';
            const rowColor = position === 1 ? 'rgba(241,196,15,0.2)' : position <= 3 ? 'rgba(39,174,96,0.1)' : index % 2 === 0 ? '#f8f9fa' : 'white';
            standingsContent += `
                <tr style="background: ${rowColor};">
                    <td style="padding: 10px 8px; border: 1px solid #ddd; text-align: center;">${icon} ${position}</td>
                    <td style="padding: 10px 8px; border: 1px solid #ddd; text-align: center; font-weight: bold;">Pair ${pair.pair}</td>
                    <td style="padding: 10px 8px; border: 1px solid #ddd; text-align: center; font-weight: bold; color: #3498db;">${pair.totalMatchpoints}</td>
                    <td style="padding: 10px 8px; border: 1px solid #ddd; text-align: center; font-weight: bold; 
                        color: ${pair.percentage >= 60 ? '#27ae60' : pair.percentage >= 50 ? '#f39c12' : '#e74c3c'};">
                        ${pair.percentage}%</td>
                    <td style="padding: 10px 8px; border: 1px solid #ddd; text-align: center; color: #7f8c8d;">${pair.boardsPlayed}</td>
                </tr>`;
        });
        
        standingsContent += `</tbody></table></div>`;
        
        const buttons = [
            { text: 'Close Standings', action: 'close', class: 'close-btn' },
            { text: 'Export Standings', action: () => this.exportStandings(standings), class: 'export-btn' }
        ];
        this.bridgeApp.showModal('Final Standings', standingsContent, buttons);
    }

    calculateFinalStandings() {
        if (!this.session.isSetup) return [];
        const pairTotals = {};
        for (let i = 1; i <= this.session.pairs; i++) {
            pairTotals[i] = { pair: i, totalMatchpoints: 0, maxPossibleMatchpoints: 0, boardsPlayed: 0, totalScore: 0, percentage: 0 };
        }
        
        Object.values(this.session.boards)
            .filter(board => board.completed && board.results && board.results.length > 0)
            .forEach(board => {
                const resultsWithScores = board.results.filter(r => r.nsScore !== null || r.ewScore !== null);
                if (resultsWithScores.length < 2) return;
                this.calculateBoardMatchpoints(resultsWithScores);
                resultsWithScores.forEach(result => {
                    if (result.matchpoints) {
                        if (pairTotals[result.nsPair]) {
                            pairTotals[result.nsPair].totalMatchpoints += result.matchpoints.ns || 0;
                            pairTotals[result.nsPair].maxPossibleMatchpoints += (resultsWithScores.length - 1) * 2;
                            pairTotals[result.nsPair].boardsPlayed++;
                            pairTotals[result.nsPair].totalScore += result.nsScore || 0;
                        }
                        if (pairTotals[result.ewPair]) {
                            pairTotals[result.ewPair].totalMatchpoints += result.matchpoints.ew || 0;
                            pairTotals[result.ewPair].maxPossibleMatchpoints += (resultsWithScores.length - 1) * 2;
                            pairTotals[result.ewPair].boardsPlayed++;
                            pairTotals[result.ewPair].totalScore += result.ewScore || 0;
                        }
                    }
                });
            });
        
        return Object.values(pairTotals)
            .filter(pair => pair.boardsPlayed > 0)
            .map(pair => {
                pair.percentage = pair.maxPossibleMatchpoints > 0 ? 
                    Math.round((pair.totalMatchpoints / pair.maxPossibleMatchpoints) * 10000) / 100 : 0;
                return pair;
            })
            .sort((a, b) => b.percentage !== a.percentage ? b.percentage - a.percentage : b.totalMatchpoints - a.totalMatchpoints);
    }

    calculateBoardMatchpoints(results) {
        if (results.length < 2) return;
        results.forEach(result => {
            let nsMatchpoints = 0, ewMatchpoints = 0;
            results.forEach(otherResult => {
                if (result !== otherResult) {
                    const nsScore = result.nsScore || 0;
                    const otherNsScore = otherResult.nsScore || 0;
                    if (nsScore > otherNsScore) nsMatchpoints += 2;
                    else if (nsScore === otherNsScore) { nsMatchpoints += 1; ewMatchpoints += 1; }
                    else ewMatchpoints += 2;
                }
            });
            result.matchpoints = { ns: nsMatchpoints, ew: ewMatchpoints };
        });
    }

    exportStandings(standings) {
        let text = `DUPLICATE BRIDGE FINAL STANDINGS\nGenerated: ${new Date().toLocaleString()}\n`;
        text += `Movement: ${this.session.movement.description}\n${'='.repeat(40)}\n\n`;
        text += `Pos  Pair  Matchpoints  Percentage  Boards\n`;
        standings.forEach((pair, index) => {
            text += `${(index+1).toString().padStart(2)}   ${pair.pair.toString().padStart(4)}  ${pair.totalMatchpoints.toString().padStart(11)}  ${(pair.percentage+'%').padStart(10)}  ${pair.boardsPlayed.toString().padStart(6)}\n`;
        });
        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `duplicate-standings-${new Date().toISOString().split('T')[0]}.txt`;
        document.body.appendChild(a); a.click(); document.body.removeChild(a);
        URL.revokeObjectURL(url);
        this.bridgeApp.showMessage('Standings exported!', 'success');
    }

// SECTION EIGHT
    handleBack() {
        if (this.traveler.isActive) { this.closeTraveler(); return true; }
        
        const popups = ['boardSelectorPopup', 'movementPopup'];
        const openPopup = popups.find(id => document.getElementById(id));
        if (openPopup) { document.getElementById(openPopup).remove(); return true; }
        
        switch (this.inputState) {
            case 'movement_selection':
                this.inputState = 'pairs_setup'; this.session.pairs = 0; this.availableMovements = []; break;
            case 'movement_confirm':
                this.inputState = 'movement_selection'; this.session.movement = null; break;
            case 'board_selection':
                this.inputState = 'movement_confirm'; this.session.isSetup = false; this.session.boards = {}; break;
            case 'results':
                this.inputState = 'board_selection'; break;
            default: return false;
        }
        this.updateDisplay();
        return true;
    }

    getActiveButtons() {
        if (this.inputState === 'traveler_entry') {
            const travelerButtons = this.getTravelerActiveButtons();
            if (!travelerButtons.includes('BACK')) travelerButtons.push('BACK');
            return travelerButtons;
        }
        switch (this.inputState) {
            case 'welcome': return ['1', '2'];
            case 'pairs_setup': return ['0','1','2','3','4','5','6','7','8','9','BACK'];
            case 'movement_selection':
                const buttons = ['BACK'];
                for (let i = 1; i <= this.availableMovements.length; i++) buttons.push(i.toString());
                return buttons;
            case 'movement_confirm': return ['1','2','3','BACK'];
            case 'board_selection':
                const boardButtons = ['BACK'];
                if (this.getCompletionStatus().percentage === 100) boardButtons.push('DEAL');
                return boardButtons;
            case 'results': return ['BACK'];
            default: return [];
        }
    }

    getDisplayContent() {
        switch (this.inputState) {
            case 'welcome': return this.getWelcomeContent();
            case 'pairs_setup': return this.getPairsSetupContent();
            case 'movement_selection': return this.getMovementSelectionContent();
            case 'movement_confirm': return this.getMovementConfirmContent();
            case 'board_selection': return this.getBoardSelectionContent();
            case 'traveler_entry': return this.getTravelerEntryContent();
            case 'results': return this.getResultsContent();
            default: return '<div class="current-state">Loading Duplicate Bridge...</div>';
        }
    }

    getPairsSetupContent() {
        let buildingDisplay = '';
        if (this.numberBuilder) {
            buildingDisplay = `
                <div style="text-align: center; margin: 20px 0; padding: 20px; background: #e3f2fd; border-radius: 8px; border: 2px solid #2196f3;">
                    <div style="font-size: 48px; font-weight: bold; color: #1976d2;">${this.numberBuilder}_</div>
                    <div style="font-size: 14px; color: #666; margin-top: 8px;">
                        ${this.numberBuilder === '1' ? 'Enter second digit (0-9 for 10-19)' : 
                          this.numberBuilder === '2' ? 'Enter 0 for 20 pairs' : 'Confirming...'}
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
                <div style="text-align: center; margin-bottom: 20px;">
                    <h3 style="color: #2c3e50; margin: 0 0 10px 0;">Tournament Setup</h3>
                    <p style="font-size: 16px; color: #34495e; margin: 0;">How many pairs playing?</p>
                </div>
                ${buildingDisplay}
                <div style="text-align: center; color: #7f8c8d; font-size: 14px; margin-top: 20px;">
                    Valid range: 4-20 pairs (2-10 tables)
                </div>
            </div>
            <div class="current-state">${this.numberBuilder ? 'Building: ' + this.numberBuilder : 'Enter number of pairs (4-20)'}</div>
        `;
    }

    getMovementSelectionContent() {
        const colors = ['#27ae60','#3498db','#e67e22','#9b59b6','#1abc9c'];
        const movementButtons = this.availableMovements.map((mov, index) => `
            <div style="background: ${colors[index] || '#95a5a6'}; color: white; padding: 14px 15px; border-radius: 8px; margin: 8px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">
                <div style="font-size: 16px; font-weight: bold;">${index+1}. ${mov.description}${mov.hasSitOut ? ' ⚠️' : ''}</div>
                <div style="font-size: 14px; opacity: 0.95; margin-top: 4px;">${mov.tables} tables &bull; ${mov.rounds} rounds &bull; ${mov.totalBoards} boards</div>
            </div>`).join('');
        return `
            <div class="title-score-row">
                <div class="mode-title">${this.session.pairs} Pairs</div>
                <div class="score-display">Select</div>
            </div>
            <div class="game-content">
                <div style="text-align: center; margin-bottom: 12px;">
                    <h3 style="color: #2c3e50; margin: 0 0 4px 0;">Choose Movement</h3>
                </div>
                ${movementButtons}
            </div>
            <div class="current-state">Press 1-${this.availableMovements.length} to select movement</div>
        `;
    }

    getMovementConfirmContent() {
        const movement = this.session.movement;
        const estimatedTime = movement.description.match(/~(.+)/)?.[1] || '2-3 hours';
        const isSkipMitchell = movement.type === 'mitchell' && movement.tables % 2 === 0;
        let skipWarning = '';
        if (isSkipMitchell) {
            const skipRound = Math.floor(movement.tables / 2) + 1;
            skipWarning = `
                <div style="background: #fff3cd; padding: 12px; border-radius: 6px; border: 2px solid #ffc107; margin: 12px 0;">
                    <div style="text-align: center; font-size: 15px; font-weight: bold; color: #856404;">⚠️ Skip Round ${skipRound}</div>
                    <div style="font-size: 12px; color: #856404; text-align: center; margin-top: 4px;">EW pairs skip extra table</div>
                </div>`;
        }
        return `
            <div class="title-score-row">
                <div class="mode-title">${this.session.pairs} Pairs</div>
                <div class="score-display">Confirm</div>
            </div>
            <div class="game-content">
                <div style="text-align: center; margin-bottom: 15px;">
                    <h3 style="color: #2c3e50; margin: 0 0 5px 0;">${movement.description}</h3>
                </div>
                <div style="background: #e8f5e9; padding: 12px; border-radius: 6px; border-left: 4px solid #4caf50;">
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 13px;">
                        <div><strong>Tables:</strong> ${movement.tables}</div>
                        <div><strong>Rounds:</strong> ${movement.rounds}</div>
                        <div><strong>Boards:</strong> ${movement.totalBoards}</div>
                        <div><strong>Time:</strong> ${estimatedTime}</div>
                    </div>
                </div>
                ${skipWarning}
                <div style="margin: 15px 0; font-size: 14px; line-height: 1.8;">
                    <div><strong>1</strong> = Details</div>
                    <div><strong>2</strong> = 🖨️ Print &amp; Start</div>
                    <div><strong>3</strong> = ▶ Start Now</div>
                </div>
            </div>
            <div class="current-state">1=Details 2=Print&amp;Start 3=Start</div>
        `;
    }

    getBoardSelectionContent() {
        const completionStatus = this.getCompletionStatus();
        const isComplete = completionStatus.percentage === 100;
        return `
            <div class="title-score-row">
                <div class="mode-title">${this.displayName}</div>
                <div class="score-display">${completionStatus.completed}/${completionStatus.total}
                    <div style="font-size: 10px; color: #95a5a6;">${completionStatus.percentage}%</div>
                </div>
            </div>
            <div class="game-content">
                <div style="text-align: center; margin-bottom: 8px;">
                    <h3 style="color: #2c3e50; margin: 0; font-size: 18px; font-weight: 800;">
                        ${isComplete ? '🎉 Tournament Complete!' : 'Board Entry'}
                    </h3>
                </div>
                ${this.getCompactBoardProgressDisplay()}
                <div style="text-align: center; margin: 12px 0;">
                    <button id="selectBoardBtn" style="background: linear-gradient(135deg, #3498db, #2980b9); 
                        color: white; border: none; padding: 12px 20px; border-radius: 6px; cursor: pointer;
                        font-size: 16px; font-weight: 800; min-height: 44px; min-width: 160px;
                        touch-action: manipulation;">Select Board</button>
                </div>
                ${isComplete ? `
                    <div style="background: rgba(39,174,96,0.1); padding: 12px; border-radius: 6px; border-left: 3px solid #27ae60; text-align: center;">
                        <div style="color: #27ae60; font-weight: 800; font-size: 15px; margin-bottom: 10px;">All boards completed!</div>
                        <button id="viewResultsBtn" style="background: linear-gradient(135deg, #27ae60, #229954);
                            color: white; border: none; padding: 12px 24px; border-radius: 6px; cursor: pointer;
                            font-size: 15px; font-weight: 800; min-height: 44px; min-width: 160px;
                            touch-action: manipulation;">View Final Results</button>
                    </div>` : `
                    <div style="background: rgba(241,196,15,0.1); padding: 8px; border-radius: 4px; border-left: 3px solid #f1c40f;">
                        <div style="color: #2c3e50; font-size: 14px; font-weight: 700; text-align: center;">
                            💡 Enter results after each round
                        </div>
                    </div>`}
            </div>
            <div class="current-state">${isComplete ? 'Tournament complete — View Final Results or press DEAL' : 'Select board to enter results'}</div>
        `;
    }

    getTravelerEntryContent() {
        if (!this.traveler.isActive) return '<div class="current-state">Traveler not active</div>';
        const progress = this.getCurrentTravelerProgress();
        const currentResult = this.traveler.data[this.currentResultIndex];
        const contractDisplay = this.getTravelerContractDisplay(currentResult);
        const progressHTML = (typeof ProgressIndicator !== 'undefined') ? ProgressIndicator.generateDuplicateTravelerProgress(this) : '';
        
        const statePrompts = {
            'level_selection': 'Select bid level (1-7)',
            'suit_selection': 'Select suit',
            'declarer_selection': 'Select declarer (N/S/E/W)',
            'double_selection': 'Press X for double, or Made/Plus/Down',
            'result_type_selection': 'Made exactly, Plus overtricks, or Down?',
            'result_number_selection': this.resultMode === 'down' ? 'Select tricks down (1-7)' : 'Select overtricks (1-6)',
            'result_complete': 'Press Deal for next pair'
        };
        
        return `
            <div class="title-score-row">
                <div class="mode-title">Board ${this.traveler.boardNumber}</div>
                <div class="score-display">Pair ${progress.current}/${progress.total}</div>
            </div>
            <div class="game-content">
                ${progressHTML}
                <div style="margin: 10px 0; padding: 10px; background: rgba(52,152,219,0.1); border-radius: 6px;">
                    <div style="font-size: 15px; font-weight: 800; color: #2c3e50;">Contract: ${contractDisplay}</div>
                </div>
                ${currentResult.nsScore !== null || currentResult.ewScore !== null ? `
                    <div style="background: rgba(39,174,96,0.1); padding: 10px; border-radius: 6px; margin: 8px 0; text-align: center;">
                        <div style="color: #27ae60; font-weight: 800; font-size: 15px;">
                            Score: NS ${currentResult.nsScore || 0} • EW ${currentResult.ewScore || 0}
                        </div>
                    </div>` : ''}
            </div>
            <div class="current-state">${statePrompts[this.travelerInputState] || 'Traveler entry'}</div>
        `;
    }

    getResultsContent() {
        return '<div class="current-state">Results</div>';
    }

    getCompactBoardProgressDisplay() {
        const boardStatus = this.getBoardStatus();
        const totalBoards = boardStatus.length;
        if (totalBoards === 0) return '<div style="text-align: center; color: #7f8c8d; font-size: 12px;">No boards configured</div>';
        const completedBoards = boardStatus.filter(b => b.completed);
        const vulnAbbrev = { 'None': 'NV', 'NS': 'NS', 'EW': 'EW', 'Both': 'All' };
        return `
            <div style="margin: 10px 0;">
                <div style="background: rgba(52,152,219,0.1); padding: 8px; border-radius: 4px; margin-bottom: 10px; text-align: center;">
                    <div style="color: #2c3e50; font-weight: 800; font-size: 15px; margin-bottom: 5px;">
                        ${completedBoards.length}/${totalBoards} Complete
                    </div>
                    <div style="background: #ecf0f1; height: 12px; border-radius: 6px; overflow: hidden;">
                        <div style="background: linear-gradient(135deg, #27ae60, #2ecc71); height: 100%;
                            width: ${(completedBoards.length / totalBoards) * 100}%; border-radius: 6px;"></div>
                    </div>
                </div>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(60px, 1fr)); gap: 4px; max-height: 120px; overflow-y: auto;">
                    ${boardStatus.map(board => `
                        <div style="background: ${board.completed ? 'rgba(39,174,96,0.1)' : 'rgba(149,165,166,0.1)'};
                            border: 1px solid ${board.completed ? '#27ae60' : '#bdc3c7'};
                            border-radius: 4px; padding: 5px 4px; text-align: center; font-size: 12px;">
                            <div style="font-weight: 800; margin-bottom: 2px;">B${board.number} ${board.completed ? '✅' : '⭕'}</div>
                            <div style="color: ${this.getVulnerabilityColor(board.vulnerability)}; font-size: 11px; font-weight: 800;">
                                ${vulnAbbrev[board.vulnerability]}
                            </div>
                        </div>`).join('')}
                </div>
            </div>
        `;
    }

    updateDisplay() {
        const content = this.getDisplayContent();
        const display = document.getElementById('display');
        if (display) display.innerHTML = content;
        
        this.bridgeApp.updateButtonStates(this.getActiveButtons());
        
        setTimeout(() => {
            let nvButton = document.querySelector('button[data-value="NV"]');
            if (!nvButton) {
                nvButton = Array.from(document.querySelectorAll('button')).find(btn => btn.textContent.trim() === 'NV');
            }
            if (nvButton) {
                nvButton.textContent = 'Print';
                nvButton.style.fontSize = '13px';
            }
        }, 100);
        
        if (this.inputState === 'board_selection') {
            setTimeout(() => {
                this.setupBoardSelectionButton();
                this.setupViewResultsButton();
            }, 100);
        }
    }

    setupBoardSelectionButton() {
        const selectBtn = document.getElementById('selectBoardBtn');
        if (!selectBtn) return;
        selectBtn.onclick = null;
        this._addPixelHandler(selectBtn, () => { this.openTravelerPopup(); });
    }

    setupViewResultsButton() {
        const resultsBtn = document.getElementById('viewResultsBtn');
        if (!resultsBtn) return;
        this._addPixelHandler(resultsBtn, () => { this.handleBoardSelection('DEAL'); });
    }

    cleanup() {
        ['boardSelectorPopup', 'movementPopup'].forEach(id => {
            const popup = document.getElementById(id);
            if (popup) popup.remove();
        });
        if (window.duplicateBridge) delete window.duplicateBridge;
        this.traveler = { isActive: false, boardNumber: null, data: [] };
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = DuplicateBridgeMode;
} else if (typeof window !== 'undefined') {
    window.DuplicateBridgeMode = DuplicateBridgeMode;
}
