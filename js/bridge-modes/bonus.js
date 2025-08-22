// SECTION ONE - Header and Constructor
/**
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
// END SECTION ONE

// SECTION TWO - Core Methods
    /**
     * Initialize Bonus Bridge mode with proper vulnerability and dealer rotation
     */
    initialize() {
        console.log('🎯 Starting Bonus Bridge session');
        
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
        this.resetHandAnalysis();
        
        this.updateDisplay();
        
        console.log(`🎯 Deal ${this.currentDeal} initialized - Dealer: ${this.getDealerName()}, Vulnerability: ${this.vulnerability}`);
    }
    
    /**
     * Update vulnerability and dealer based on current deal (Chicago Bridge style)
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
        
        // Show brief message to user about auto-vulnerability
        const vulnText = document.getElementById('vulnText');
        if (vulnText) {
            const originalText = vulnText.textContent;
            vulnText.textContent = 'AUTO';
            vulnText.style.color = '#e67e22';
            vulnText.style.fontWeight = 'bold';
            
            setTimeout(() => {
                vulnText.textContent = originalText;
                vulnText.style.color = '';
                vulnText.style.fontWeight = '';
            }, 1500);
        }
        
        // Show informational message
        this.bridgeApp.showMessage('Bonus Bridge uses automatic vulnerability cycle (Chicago style)', 'info');
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
// END SECTION THREE

// SECTION FOUR - Contract Logic
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
// END SECTION FOUR

// SECTION FIVE - HCP Analysis Popup (PIXEL 9A VIEWPORT FIXED)

/**
 * Show HCP Analysis Popup with Enhanced Pixel 9a Scrolling
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
        this.applyHandAnalysisScrollingFixes(); // NEW: Apply Pixel 9a scrolling fixes
    }, 200);
}

/**
 * Build HCP Analysis popup content - FIXED VIEWPORT HEIGHT FOR PIXEL 9A
 */
buildHCPAnalysisContent(contract) {
    const { totalHCP, singletons, voids, longSuits } = this.handAnalysis;
    const vulnerability = this.vulnerability === 'NV' ? 'Non-Vul' : 
                         this.vulnerability === 'Both' ? 'Vulnerable' : 
                         `${this.vulnerability} Vulnerable`;
    
    return `
        <div style="
            padding: 10px; 
            font-family: Arial, sans-serif; 
            max-height: 85vh; 
            height: 85vh;
            display: flex; 
            flex-direction: column;
            overflow: hidden;
        ">
            <div style="
                text-align: center; 
                margin-bottom: 15px; 
                padding: 12px; 
                background: #2c3e50; 
                border-radius: 8px; 
                border: 2px solid #34495e;
                flex-shrink: 0;
            ">
                <strong style="font-size: 16px; color: #ffffff; font-weight: bold;">${contract} by ${this.currentContract.declarer} = ${this.currentContract.result}</strong><br>
                <strong style="font-size: 14px; color: #ecf0f1;">${vulnerability}</strong><br>
                <span style="color: #f39c12; font-size: 15px; font-weight: bold;">Raw Score: ${this.currentContract.rawScore} points</span>
            </div>
            
            <!-- ENHANCED SCROLLABLE CONTENT CONTAINER - REDUCED HEIGHT FOR PIXEL 9A -->
            <div id="hcpScrollContainer" style="
                flex: 1;
                overflow-y: auto;
                overflow-x: hidden;
                -webkit-overflow-scrolling: touch;
                max-height: 260px;
                min-height: 240px;
                padding-right: 5px;
                margin-right: -5px;
                transform: translateZ(0);
                will-change: scroll-position;
                position: relative;
            ">
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
            </div>
            
            <!-- FIXED ACTION BUTTONS - ALWAYS VISIBLE -->
            <div style="
                display: flex; 
                gap: 10px; 
                justify-content: center;
                margin-top: 10px;
                padding: 10px 5px;
                border-top: 2px solid #ddd;
                flex-shrink: 0;
                background: white;
                border-radius: 0 0 8px 8px;
                box-shadow: 0 -2px 8px rgba(0,0,0,0.1);
            ">
                <button class="cancel-analysis-btn" style="
                    flex: 1; 
                    height: 50px; 
                    background: #95a5a6; 
                    color: white; 
                    border: none; 
                    border-radius: 8px; 
                    font-size: 16px; 
                    font-weight: bold; 
                    cursor: pointer; 
                    touch-action: manipulation;
                    min-width: 100px;
                ">Cancel</button>
                <button class="calculate-score-btn" style="
                    flex: 2; 
                    height: 50px; 
                    background: #27ae60; 
                    color: white; 
                    border: none; 
                    border-radius: 8px; 
                    font-size: 16px; 
                    font-weight: bold; 
                    cursor: pointer; 
                    touch-action: manipulation;
                    min-width: 140px;
                ">Calculate Score</button>
            </div>
        </div>
    `;
}

/**
 * Apply Hand Analysis scrolling fixes - ENHANCED VIEWPORT FIX
 */
applyHandAnalysisScrollingFixes() {
    if (!this.isMobile) {
        console.log('📱 Desktop detected - skipping hand analysis scrolling fixes');
        return;
    }
    
    console.log('🔧 Applying Hand Analysis scrolling fixes with viewport fix for Pixel 9a...');
    
    // Find the modal and scroll container
    const modal = document.querySelector('.modal-content');
    const scrollContainer = document.getElementById('hcpScrollContainer');
    
    if (modal && scrollContainer) {
        // Enhanced modal fixes for mobile - CRITICAL VIEWPORT FIX
        modal.style.maxHeight = '90vh';
        modal.style.height = 'auto';
        modal.style.maxWidth = '95vw';
        modal.style.width = 'auto';
        modal.style.display = 'flex';
        modal.style.flexDirection = 'column';
        modal.style.overflow = 'hidden';
        modal.style.position = 'relative';
        modal.style.margin = '5vh auto';
        
        // Enhanced scroll container fixes - REDUCED HEIGHT FOR PIXEL 9A BUTTONS
        scrollContainer.style.height = '240px'; // Reduced from 280px for button visibility
        scrollContainer.style.maxHeight = '260px'; // Reduced max height
        scrollContainer.style.overflowY = 'scroll'; // Force scroll
        scrollContainer.style.overflowX = 'hidden';
        scrollContainer.style.webkitOverflowScrolling = 'touch';
        scrollContainer.style.transform = 'translateZ(0)';
        scrollContainer.style.willChange = 'scroll-position';
        scrollContainer.style.overflowAnchor = 'none';
        scrollContainer.style.position = 'relative';
        
        // Enhanced scrollbar visibility for mobile
        const scrollbarStyle = document.createElement('style');
        scrollbarStyle.id = 'hcpScrollbarStyle';
        scrollbarStyle.textContent = `
            #hcpScrollContainer::-webkit-scrollbar {
                width: 12px !important;
                background: rgba(255, 255, 255, 0.2) !important;
            }
            #hcpScrollContainer::-webkit-scrollbar-thumb {
                background: rgba(52, 152, 219, 0.6) !important;
                border-radius: 6px !important;
                border: 2px solid rgba(255, 255, 255, 0.1) !important;
            }
            #hcpScrollContainer::-webkit-scrollbar-track {
                background: rgba(0, 0, 0, 0.05) !important;
                border-radius: 6px !important;
            }
            #hcpScrollContainer::-webkit-scrollbar-thumb:hover {
                background: rgba(52, 152, 219, 0.8) !important;
            }
        `;
        
        // Remove existing style if present
        const existingStyle = document.getElementById('hcpScrollbarStyle');
        if (existingStyle) existingStyle.remove();
        
        document.head.appendChild(scrollbarStyle);
        
        // Test scrolling functionality with viewport check
        const testScroll = () => {
            const initialScrollTop = scrollContainer.scrollTop;
            scrollContainer.scrollTop = 50;
            
            setTimeout(() => {
                const newScrollTop = scrollContainer.scrollTop;
                console.log(`📱 HCP Scroll test - Initial: ${initialScrollTop}, Set: 50, Actual: ${newScrollTop}`);
                console.log(`📱 HCP Container - Height: ${scrollContainer.clientHeight}, ScrollHeight: ${scrollContainer.scrollHeight}`);
                console.log(`📱 Modal height: ${modal.clientHeight}, Viewport height: ${window.innerHeight}`);
                
                // Check if modal fits in viewport
                const modalRect = modal.getBoundingClientRect();
                const viewportHeight = window.innerHeight;
                
                if (modalRect.bottom > viewportHeight) {
                    console.warn('⚠️ Modal extends beyond viewport - applying emergency fixes');
                    
                    // Emergency viewport fix - EXTRA REDUCTION FOR BUTTON VISIBILITY
                    modal.style.maxHeight = '85vh';
                    scrollContainer.style.height = '220px'; // Even smaller for button visibility
                    scrollContainer.style.maxHeight = '240px';
                    
                    // Add viewport warning
                    const viewportHint = document.createElement('div');
                    viewportHint.innerHTML = '📱 Scroll area reduced to fit viewport';
                    viewportHint.style.cssText = `
                        position: absolute;
                        top: 5px;
                        left: 50%;
                        transform: translateX(-50%);
                        background: rgba(52, 152, 219, 0.9);
                        color: white;
                        padding: 4px 8px;
                        border-radius: 4px;
                        font-size: 10px;
                        z-index: 200;
                        pointer-events: none;
                    `;
                    scrollContainer.appendChild(viewportHint);
                    
                    setTimeout(() => {
                        viewportHint.style.transition = 'opacity 0.5s ease';
                        viewportHint.style.opacity = '0';
                        setTimeout(() => viewportHint.remove(), 500);
                    }, 3000);
                }
                
                if (newScrollTop === initialScrollTop && scrollContainer.scrollHeight > scrollContainer.clientHeight) {
                    console.warn('⚠️ HCP Analysis scrolling may not be working - applying fallback fixes');
                    
                    // Visual feedback for scroll issues
                    scrollContainer.style.border = '2px solid #3498db';
                    scrollContainer.style.boxShadow = 'inset 0 0 10px rgba(52, 152, 219, 0.3)';
                    
                    // Add scroll hint
                    const scrollHint = document.createElement('div');
                    scrollHint.innerHTML = '👆 Touch and drag to scroll';
                    scrollHint.style.cssText = `
                        position: absolute;
                        top: 10px;
                        right: 10px;
                        background: rgba(52, 152, 219, 0.9);
                        color: white;
                        padding: 4px 8px;
                        border-radius: 4px;
                        font-size: 10px;
                        z-index: 200;
                        pointer-events: none;
                    `;
                    scrollContainer.appendChild(scrollHint);
                    
                    setTimeout(() => {
                        scrollHint.style.transition = 'opacity 0.5s ease';
                        scrollHint.style.opacity = '0';
                        setTimeout(() => scrollHint.remove(), 500);
                    }, 4000);
                } else {
                    console.log('✅ HCP Analysis scrolling appears to be working correctly');
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
            console.log('📱 HCP Analysis touch scroll start');
        }, { passive: true });
        
        scrollContainer.addEventListener('touchmove', (e) => {
            if (touchStartY !== null) {
                const touchY = e.touches[0].clientY;
                const deltaY = touchStartY - touchY;
                
                if (Math.abs(deltaY) > 5) {
                    isScrolling = true;
                    const newScrollTop = scrollContainer.scrollTop + deltaY * 0.8;
                    const maxScroll = scrollContainer.scrollHeight - scrollContainer.clientHeight;
                    
                    scrollContainer.scrollTop = Math.max(0, Math.min(newScrollTop, maxScroll));
                    touchStartY = touchY;
                    
                    console.log(`📱 HCP Analysis touch scroll: ${scrollContainer.scrollTop}/${maxScroll}`);
                }
            }
        }, { passive: true });
        
        scrollContainer.addEventListener('touchend', () => {
            touchStartY = null;
            if (isScrolling) {
                console.log('📱 HCP Analysis touch scroll completed');
            }
            isScrolling = false;
        }, { passive: true });
        
        console.log('✅ Hand Analysis scrolling fixes with viewport fix applied for Pixel 9a');
    } else {
        console.warn('⚠️ Could not find modal or HCP scroll container for scrolling fixes');
    }
}

// END SECTION FIVE
// SECTION SIX - Mobile-Optimized Modal System (CALCULATE SCORE BUTTON FIXED) - PART 1

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
    
    let buttonsHTML = '';
    
    // FIXED: Handle both array of buttons and HTML string
    if (typeof buttons === 'string') {
        // buttons is HTML string - use it directly
        buttonsHTML = buttons;
    } else {
        // buttons is array of objects - process normally
        const modalButtons = buttons || defaultButtons;
        modalButtons.forEach(btn => {
            buttonsHTML += `
                <button class="modal-btn" data-action="${btn.text}" style="
                    padding: 10px 20px;
                    border: none;
                    border-radius: 6px;
                    font-size: 14px;
                    font-weight: 600;
                    cursor: pointer;
                    background: #e67e22;
                    color: white;
                    touch-action: manipulation;
                    user-select: none;
                    -webkit-tap-highlight-color: transparent;
                    margin: 0 5px;
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
                background: #e67e22;
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
                        background: rgba(230, 126, 34, 0.6);
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
                        border-left: 4px solid #e67e22;
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
        
        // FIXED: Handle both button types
        if (typeof buttons === 'string') {
            // For HTML string buttons, find the action in the original buttons array
            // This is handled by the setupHCPAnalysisPopup method
        } else {
            const buttonConfig = (buttons || defaultButtons).find(b => b.text === actionText);
            if (buttonConfig && buttonConfig.action) {
                buttonConfig.action();
            }
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
                btn.style.background = 'rgba(230, 126, 34, 0.8)';
                btn.style.transform = 'scale(0.95)';
            }, { passive: true });
            
            btn.addEventListener('touchend', (e) => {
                btn.style.background = '#e67e22';
                btn.style.transform = 'scale(1)';
            }, { passive: true });
        });
    }, 50);
    
    document.body.appendChild(modal);
}

showMobileOptimizedModalWithCustomButtons(title, content, buttons) {
    // Create custom button layout for quit page (5 buttons)
    let buttonsHTML = '';
    if (buttons.length === 5) {
        // 3+2 layout for 5 buttons
        buttonsHTML = `
            <div style="display: grid; grid-template-rows: 1fr 1fr; gap: 8px; width: 100%;">
                <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 6px;">
                    <button class="modal-btn" data-action="${buttons[0].text}" style="
                        padding: 10px 6px;
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
                    ">${buttons[0].text}</button>
                    <button class="modal-btn" data-action="${buttons[1].text}" style="
                        padding: 10px 6px;
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
                    ">${buttons[1].text}</button>
                    <button class="modal-btn" data-action="${buttons[2].text}" style="
                        padding: 10px 6px;
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
                    ">${buttons[2].text}</button>
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
                    <button class="modal-btn" data-action="${buttons[3].text}" style="
                        padding: 10px 8px;
                        border: none;
                        border-radius: 6px;
                        font-size: 12px;
                        font-weight: 600;
                        cursor: pointer;
                        background: #9b59b6;
                        color: white;
                        touch-action: manipulation;
                        user-select: none;
                        -webkit-tap-highlight-color: transparent;
                    ">${buttons[3].text}</button>
                    <button class="modal-btn" data-action="${buttons[4].text}" style="
                        padding: 10px 8px;
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
                    ">${buttons[4].text}</button>
                </div>
            </div>
        `;
    } else {
        // Fallback to single row for other button counts
        buttons.forEach(btn => {
            buttonsHTML += `
                <button class="modal-btn" data-action="${btn.text}" style="
                    padding: 10px 15px;
                    border: none;
                    border-radius: 6px;
                    font-size: 13px;
                    font-weight: 600;
                    cursor: pointer;
                    background: #e67e22;
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
    
    // FIXED: Pass the buttonsHTML string directly
    this.showMobileOptimizedModal(title, content, buttonsHTML);
}

closeMobileModal() {
    const modal = document.querySelector('.modal-overlay');
    if (modal) {
        modal.remove();
        document.body.classList.remove('modal-open');
    }
}

/**
 * Show Bonus Bridge specific quit options - MOBILE OPTIMIZED VERSION
 */
showQuit() {
    console.log('🎮 Showing mobile-optimized quit options');
    
    const scores = this.gameState.scores;
    const totalDeals = this.gameState.history.length;
    const licenseStatus = this.bridgeApp.licenseManager.checkLicenseStatus();
    
    // Build the content sections
    let currentScoreContent = '';
    if (totalDeals > 0) {
        const leader = scores.NS > scores.EW ? 'North-South' : 
                      scores.EW > scores.NS ? 'East-West' : 'Tied';
        
        currentScoreContent = `
            <div class="content-section">
                <h3>📊 Current Game Status</h3>
                <div class="status-grid">
                    <div class="status-item">
                        <strong>Deals Played:</strong> ${totalDeals}
                    </div>
                    <div class="status-item">
                        <strong>Current Leader:</strong> ${leader}
                    </div>
                </div>
                <div class="scores-display">
                    <div class="score-item ns-score">
                        <span class="team-name">North-South</span>
                        <span class="score-value">${scores.NS}</span>
                    </div>
                    <div class="score-item ew-score">
                        <span class="team-name">East-West</span>
                        <span class="score-value">${scores.EW}</span>
                    </div>
                </div>
            </div>
        `;
    }
    
    let licenseSection = '';
    if (licenseStatus.status === 'trial') {
        licenseSection = `
            <div class="content-section">
                <h3>📅 License Status</h3>
                <div class="license-info">
                    <p><strong>Trial Version:</strong> ${licenseStatus.daysLeft} days remaining</p>
                    <p><strong>Deals Left:</strong> ${licenseStatus.dealsLeft} deals</p>
                </div>
            </div>
        `;
    }
    
    const content = `
        ${currentScoreContent}
        ${licenseSection}
        <div class="content-section">
            <h3>🎮 Game Options</h3>
            <p>What would you like to do?</p>
        </div>
    `;
    
    this.showMobileOptimizedQuitModal(content);
}

/**
 * Show mobile-optimized quit modal with proper button layout
 */
showMobileOptimizedQuitModal(content) {
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
                background: #e67e22;
                color: white;
                text-align: center;
                flex-shrink: 0;
            ">
                <h2 style="font-size: 18px; margin: 0;">⭐ Bonus Bridge Options</h2>
            </div>
            
            <div class="modal-body" id="quitModalBody" style="
                flex: 1;
                overflow-y: auto;
                overflow-x: hidden;
                -webkit-overflow-scrolling: touch;
                background: white;
                position: relative;
                min-height: 0;
            ">
                <style>
                    /* Enhanced scrollbar for mobile visibility */
                    #quitModalBody::-webkit-scrollbar {
                        width: 12px;
                        background: rgba(0, 0, 0, 0.1);
                    }
                    #quitModalBody::-webkit-scrollbar-thumb {
                        background: rgba(230, 126, 34, 0.6);
                        border-radius: 6px;
                        border: 2px solid rgba(255, 255, 255, 0.1);
                    }
                    #quitModalBody::-webkit-scrollbar-track {
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
                    .content-section h3 {
                        color: #e67e22;
                        margin-bottom: 15px;
                        font-size: 16px;
                    }
                    .content-section p {
                        line-height: 1.5;
                        margin-bottom: 10px;
                        color: #555;
                        font-size: 14px;
                    }
                    .status-grid {
                        display: grid;
                        grid-template-columns: 1fr 1fr;
                        gap: 12px;
                        margin-bottom: 15px;
                    }
                    .status-item {
                        background: #f8f9fa;
                        padding: 12px;
                        border-radius: 8px;
                        border-left: 4px solid #3498db;
                        font-size: 13px;
                    }
                    .scores-display {
                        display: grid;
                        grid-template-columns: 1fr 1fr;
                        gap: 10px;
                        margin-top: 10px;
                    }
                    .score-item {
                        text-align: center;
                        padding: 15px 10px;
                        border-radius: 8px;
                        color: white;
                        font-weight: bold;
                    }
                    .score-item.ns-score {
                        background: linear-gradient(135deg, #27ae60, #2ecc71);
                    }
                    .score-item.ew-score {
                        background: linear-gradient(135deg, #e74c3c, #c0392b);
                    }
                    .team-name {
                        display: block;
                        font-size: 12px;
                        margin-bottom: 5px;
                        opacity: 0.9;
                    }
                    .score-value {
                        display: block;
                        font-size: 24px;
                        font-weight: bold;
                    }
                    .license-info {
                        background: #fff3cd;
                        padding: 12px;
                        border-radius: 8px;
                        border-left: 4px solid #ffc107;
                    }
                    .license-info p {
                        margin: 5px 0;
                        color: #856404;
                        font-size: 13px;
                    }
                </style>
                
                ${content}
            </div>
            
            <!-- 5-Button Layout: 3 top row + 2 bottom row -->
            <div class="modal-footer" style="
                padding: 15px 20px;
                background: #f8f9fa;
                border-top: 1px solid #ddd;
                flex-shrink: 0;
            ">
                <div style="display: grid; grid-template-rows: 1fr 1fr; gap: 8px; width: 100%;">
                    <!-- Top row: 3 buttons -->
                    <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 6px;">
                        <button class="quit-btn" data-action="continue" style="
                            padding: 10px 6px;
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
                        ">Continue Playing</button>
                        <button class="quit-btn" data-action="scores" style="
                            padding: 10px 6px;
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
                        ">Show Scores</button>
                        <button class="quit-btn" data-action="help" style="
                            padding: 10px 6px;
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
                        ">Show Help</button>
                    </div>
                    <!-- Bottom row: 2 buttons -->
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
                        <button class="quit-btn" data-action="newgame" style="
                            padding: 10px 8px;
                            border: none;
                            border-radius: 6px;
                            font-size: 12px;
                            font-weight: 600;
                            cursor: pointer;
                            background: #9b59b6;
                            color: white;
                            touch-action: manipulation;
                            user-select: none;
                            -webkit-tap-highlight-color: transparent;
                        ">New Game</button>
                        <button class="quit-btn" data-action="menu" style="
                            padding: 10px 8px;
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
                        ">Main Menu</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Setup button handlers
    setTimeout(() => {
        this.setupQuitModalHandlers();
    }, 100);
}
// END SECTION SIX - Part 1
// SECTION SIX - Part 2: Mobile-Optimized Modal System (PIXEL 9A FIXED)

/**
 * Setup quit modal handlers with mobile optimization
 */
setupQuitModalHandlers() {
    console.log('📱 Setting up PIXEL 9A optimized quit handlers...');
    
    const createQuitHandler = (action) => {
        return (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            console.log(`🔥 Pixel 9a quit action: ${action}`);
            
            // Visual feedback
            const btn = e.target;
            btn.style.transform = 'scale(0.95)';
            btn.style.opacity = '0.8';
            
            // Haptic feedback
            if (navigator.vibrate) {
                navigator.vibrate([30]);
            }
            
            // Execute action after feedback
            setTimeout(() => {
                switch(action) {
                    case 'continue':
                        this.closeQuitModal();
                        break;
                    case 'scores':
                        this.closeQuitModal();
                        this.showMobileOptimizedScores();
                        break;
                    case 'help':
                        this.closeQuitModal();
                        this.showHelp();
                        break;
                    case 'newgame':
                        this.closeQuitModal();
                        this.startNewGame();
                        break;
                    case 'menu':
                        this.closeQuitModal();
                        this.returnToMainMenu();
                        break;
                    default:
                        console.warn(`Unknown quit action: ${action}`);
                        this.closeQuitModal();
                }
                
                // Reset visual feedback
                btn.style.transform = 'scale(1)';
                btn.style.opacity = '1';
            }, 100);
        };
    };
    
    const buttonMappings = [
        { id: 'continue-btn', action: 'continue' },
        { id: 'scores-btn', action: 'scores' },
        { id: 'help-btn', action: 'help' },
        { id: 'newgame-btn', action: 'newgame' },
        { id: 'menu-btn', action: 'menu' }
    ];
    
    buttonMappings.forEach(({ id, action }) => {
        const btn = document.getElementById(id);
        if (btn) {
            const handler = createQuitHandler(action);
            
            // Multiple event types for maximum Pixel 9a compatibility
            btn.addEventListener('click', handler, { passive: false });
            btn.addEventListener('touchend', handler, { passive: false });
            
            console.log(`✅ Pixel 9a quit handler bound for: ${id}`);
        } else {
            console.warn(`❌ Quit button not found: ${id}`);
        }
    });
    
    console.log('✅ All Pixel 9a quit handlers setup complete');
}

/**
 * Handle quit modal actions
 */
handleQuitAction(action) {
    switch (action) {
        case 'continue':
            this.closeQuitModal();
            break;
        case 'scores':
            this.closeQuitModal();
            this.showMobileOptimizedScores();
            break;
        case 'help':
            this.closeQuitModal();
            this.showHelp();
            break;
        case 'newgame':
            this.closeQuitModal();
            this.startNewGame();
            break;
        case 'menu':
            this.closeQuitModal();
            this.returnToMainMenu();
            break;
        default:
            console.warn(`Unknown quit action: ${action}`);
            this.closeQuitModal();
    }
}

/**
 * Close quit modal
 */
closeQuitModal() {
    const modal = document.querySelector('.modal-overlay');
    if (modal) {
        modal.remove();
        document.body.classList.remove('modal-open');
        console.log('🎮 Quit modal closed');
    }
}

/**
 * Get darker color for touch feedback
 */
getDarkerColor(color) {
    const colors = {
        '#27ae60': '#1e8449',
        '#3498db': '#2980b9',
        '#f39c12': '#d68910',
        '#9b59b6': '#8e44ad',
        '#95a5a6': '#7f8c8d'
    };
    return colors[color] || 'rgba(0,0,0,0.1)';
}

/**
 * Get original button color by action
 */
getOriginalButtonColor(action) {
    const colors = {
        'continue': '#27ae60',
        'scores': '#3498db', 
        'help': '#f39c12',
        'newgame': '#9b59b6',
        'menu': '#95a5a6'
    };
    return colors[action] || '#95a5a6';
}

/**
 * Show mobile-optimized detailed scores
 */
showMobileOptimizedScores() {
    console.log('📊 Showing mobile-optimized detailed scores');
    
    const scores = this.gameState.scores;
    const history = this.gameState.history;
    
    if (history.length === 0) {
        this.showSimpleModal('📊 Game Scores', '<p>No deals have been played yet.</p>');
        return;
    }
    
    // Build the scores content
    let scoresContent = this.buildDetailedScoresContent(scores, history);
    
    // Show with mobile-optimized template
    this.showMobileOptimizedScoresModal(scoresContent);
}

/**
 * Build detailed scores content for mobile display
 */
buildDetailedScoresContent(scores, history) {
    const leader = scores.NS > scores.EW ? 'North-South' : 
                  scores.EW > scores.NS ? 'East-West' : 'Tied';
    
    let content = `
        <div class="content-section">
            <h3>📊 Current Totals</h3>
            <div class="totals-display">
                <div class="total-item ns-total">
                    <span class="team-label">North-South</span>
                    <span class="total-score">${scores.NS}</span>
                </div>
                <div class="total-item ew-total">
                    <span class="team-label">East-West</span>
                    <span class="total-score">${scores.EW}</span>
                </div>
            </div>
            <div class="leader-display">
                <strong>Current Leader: ${leader}</strong>
            </div>
        </div>
        
        <div class="content-section">
            <h3>🃏 Deal by Deal Analysis</h3>
            <div class="deals-container">
    `;
    
    history.forEach((deal, index) => {
        const contract = deal.contract;
        const contractStr = `${contract.level}${contract.suit}${contract.doubled ? ' ' + contract.doubled : ''}`;
        const vulnerability = deal.vulnerability || 'NV';
        const rawScore = deal.score || contract.rawScore || 0;
        
        const vulnClass = vulnerability === 'NV' ? 'vuln-none' : 
                         vulnerability === 'NS' ? 'vuln-ns' : 
                         vulnerability === 'EW' ? 'vuln-ew' : 'vuln-both';
        
        let analysisText = '';
        if (deal.bonusAnalysis) {
            const analysis = deal.bonusAnalysis;
            analysisText = `
                <div class="analysis-details">
                    <span class="analysis-item">Raw: ${rawScore}</span>
                    <span class="analysis-item">HCP: ${analysis.totalHCP}/${analysis.expectedHCP}</span>
                    <span class="analysis-item">Tricks: ${analysis.actualTricks}/${analysis.handExpectedTricks}</span>
                    <span class="analysis-item ${analysis.madeContract ? 'made' : 'failed'}">${analysis.madeContract ? 'Made' : 'Failed'}</span>
                </div>
            `;
        }
        
        content += `
            <div class="deal-item ${index % 2 === 0 ? 'deal-even' : 'deal-odd'}">
                <div class="deal-header">
                    <div class="deal-info">
                        <span class="deal-number">Deal ${deal.deal}</span>
                        <span class="vulnerability ${vulnClass}">${vulnerability}</span>
                    </div>
                    <div class="deal-scores">
                        <span class="ns-points">NS: +${deal.bonusAnalysis?.nsPoints || 0}</span>
                        <span class="ew-points">EW: +${deal.bonusAnalysis?.ewPoints || 0}</span>
                    </div>
                </div>
                <div class="contract-info">
                    <strong>${contractStr} by ${contract.declarer} = ${contract.result}</strong>
                </div>
                ${analysisText}
            </div>
        `;
    });
    
    content += `
            </div>
        </div>
        
        <div class="content-section">
            <div class="summary-note">
                📱 Enhanced scoring shows raw score, HCP analysis and both-side rewards<br>
                Use touch and drag to scroll through all deals
            </div>
        </div>
    `;
    
    return content;
}

/**
 * Show mobile-optimized scores modal
 */
showMobileOptimizedScoresModal(content) {
    // Prevent body scroll when modal opens
    document.body.classList.add('modal-open');
    
    // Create modal overlay
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
                <h2 style="font-size: 18px; margin: 0;">📊 Bonus Bridge - Detailed Scores</h2>
            </div>
            
            <div class="modal-body" id="scoresModalBody" style="
                flex: 1;
                overflow-y: auto;
                overflow-x: hidden;
                -webkit-overflow-scrolling: touch;
                background: white;
                position: relative;
                min-height: 0;
            ">
                <style>
                    /* Enhanced scrollbar for mobile */
                    #scoresModalBody::-webkit-scrollbar {
                        width: 12px;
                        background: rgba(0, 0, 0, 0.1);
                    }
                    #scoresModalBody::-webkit-scrollbar-thumb {
                        background: rgba(52, 152, 219, 0.6);
                        border-radius: 6px;
                        border: 2px solid rgba(255, 255, 255, 0.1);
                    }
                    #scoresModalBody::-webkit-scrollbar-track {
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
                    .content-section h3 {
                        color: #3498db;
                        margin-bottom: 15px;
                        font-size: 16px;
                    }
                    .totals-display {
                        display: grid;
                        grid-template-columns: 1fr 1fr;
                        gap: 12px;
                        margin-bottom: 15px;
                    }
                    .total-item {
                        text-align: center;
                        padding: 15px 10px;
                        border-radius: 8px;
                        color: white;
                        font-weight: bold;
                    }
                    .total-item.ns-total {
                        background: linear-gradient(135deg, #27ae60, #2ecc71);
                    }
                    .total-item.ew-total {
                        background: linear-gradient(135deg, #e74c3c, #c0392b);
                    }
                    .team-label {
                        display: block;
                        font-size: 12px;
                        margin-bottom: 5px;
                        opacity: 0.9;
                    }
                    .total-score {
                        display: block;
                        font-size: 28px;
                        font-weight: bold;
                    }
                    .leader-display {
                        text-align: center;
                        padding: 10px;
                        background: #f8f9fa;
                        border-radius: 6px;
                        color: #2c3e50;
                    }
                    .deals-container {
                        max-height: 300px;
                        overflow-y: auto;
                        -webkit-overflow-scrolling: touch;
                        border: 1px solid #ddd;
                        border-radius: 8px;
                        background: #fafafa;
                    }
                    .deal-item {
                        padding: 12px;
                        border-bottom: 1px solid #eee;
                    }
                    .deal-item:last-child {
                        border-bottom: none;
                    }
                    .deal-item.deal-even {
                        background: rgba(255, 255, 255, 0.8);
                    }
                    .deal-item.deal-odd {
                        background: rgba(248, 249, 250, 0.8);
                    }
                    .deal-header {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        margin-bottom: 8px;
                    }
                    .deal-info {
                        display: flex;
                        align-items: center;
                        gap: 8px;
                    }
                    .deal-number {
                        font-weight: bold;
                        color: #2c3e50;
                        font-size: 13px;
                    }
                    .vulnerability {
                        padding: 2px 6px;
                        border-radius: 4px;
                        font-size: 10px;
                        font-weight: bold;
                        color: white;
                    }
                    .vulnerability.vuln-none { background: #95a5a6; }
                    .vulnerability.vuln-ns { background: #27ae60; }
                    .vulnerability.vuln-ew { background: #e74c3c; }
                    .vulnerability.vuln-both { background: #f39c12; }
                    .deal-scores {
                        display: flex;
                        gap: 8px;
                        font-size: 11px;
                        font-weight: bold;
                    }
                    .ns-points { color: #27ae60; }
                    .ew-points { color: #e74c3c; }
                    .contract-info {
                        font-size: 12px;
                        color: #2c3e50;
                        margin-bottom: 6px;
                    }
                    .analysis-details {
                        display: flex;
                        flex-wrap: wrap;
                        gap: 8px;
                        font-size: 10px;
                    }
                    .analysis-item {
                        background: #ecf0f1;
                        padding: 2px 6px;
                        border-radius: 3px;
                        color: #2c3e50;
                    }
                    .analysis-item.made {
                        background: #d5f4e6;
                        color: #27ae60;
                    }
                    .analysis-item.failed {
                        background: #fadbd8;
                        color: #e74c3c;
                    }
                    .summary-note {
                        text-align: center;
                        font-size: 11px;
                        color: #666;
                        background: rgba(52, 152, 219, 0.05);
                        padding: 12px;
                        border-radius: 6px;
                        line-height: 1.4;
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
                <button id="scores-close-btn" style="
                    padding: 12px 20px;
                    border: none;
                    border-radius: 8px;
                    font-size: 14px;
                    font-weight: 600;
                    cursor: pointer;
                    background: #3498db;
                    color: white;
                    touch-action: manipulation;
                    user-select: none;
                    -webkit-tap-highlight-color: transparent;
                    min-height: 50px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                ">Close Scores</button>
                <button id="scores-back-btn" style="
                    padding: 12px 20px;
                    border: none;
                    border-radius: 8px;
                    font-size: 14px;
                    font-weight: 600;
                    cursor: pointer;
                    background: #95a5a6;
                    color: white;
                    touch-action: manipulation;
                    user-select: none;
                    -webkit-tap-highlight-color: transparent;
                    min-height: 50px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                ">Back to Options</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Setup button handlers
    setTimeout(() => {
        this.setupScoresModalHandlers();
    }, 100);
}

/**
 * Setup scores modal handlers - PIXEL 9A FIXED
 */
setupScoresModalHandlers() {
    console.log('📱 Setting up PIXEL 9A optimized scores modal handlers...');
    
    // Create unified scores handler for Pixel 9a
    const createScoresHandler = (action) => {
        return (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            console.log(`🔥 Pixel 9a scores action: ${action}`);
            
            // Visual feedback
            const btn = e.target;
            btn.style.transform = 'scale(0.95)';
            btn.style.opacity = '0.8';
            
            // Haptic feedback
            if (navigator.vibrate) {
                navigator.vibrate([30]);
            }
            
            // Execute action after feedback
            setTimeout(() => {
                switch(action) {
                    case 'close':
                        this.closeScoresModal();
                        break;
                    case 'back':
                        this.closeScoresModal();
                        setTimeout(() => this.showQuit(), 100);
                        break;
                    default:
                        console.warn(`Unknown scores action: ${action}`);
                        this.closeScoresModal();
                }
                
                // Reset visual feedback
                btn.style.transform = 'scale(1)';
                btn.style.opacity = '1';
            }, 100);
        };
    };
    
    const buttonMappings = [
        { id: 'scores-close-btn', action: 'close' },
        { id: 'scores-back-btn', action: 'back' }
    ];
    
    buttonMappings.forEach(({ id, action }) => {
        const btn = document.getElementById(id);
        if (btn) {
            const handler = createScoresHandler(action);
            
            // Multiple event types for maximum Pixel 9a compatibility
            btn.addEventListener('click', handler, { passive: false });
            btn.addEventListener('touchend', handler, { passive: false });
            
            console.log(`✅ Pixel 9a scores handler bound for: ${id}`);
        } else {
            console.warn(`❌ Scores button not found: ${id}`);
        }
    });
    
    console.log('✅ All Pixel 9a scores handlers setup complete');
}

/**
 * Close scores modal
 */
closeScoresModal() {
    const modal = document.querySelector('.modal-overlay');
    if (modal) {
        modal.remove();
        document.body.classList.remove('modal-open');
        console.log('📊 Scores modal closed');
    }
}

/**
 * Show simple modal for basic messages
 */
showSimpleModal(title, content) {
    // Fallback for simple messages
    this.showMobileOptimizedQuitModal(`<div class="content-section">${content}</div>`);
}

/**
 * PIXEL 9A FIXED HCP ANALYSIS POPUP - NO CLONING, DIRECT EVENT BINDING
 */
showHCPAnalysisPopup() {
    const contract = `${this.currentContract.level}${this.currentContract.suit}${this.currentContract.doubled}`;
    
    console.log('🔍 Showing PIXEL 9A OPTIMIZED HCP Analysis popup for contract:', contract);
    
    this.closeMobileModal();
    this.inputState = 'hcp_analysis';
    
    const { totalHCP, singletons, voids, longSuits } = this.handAnalysis;
    const vulnerability = this.vulnerability === 'NV' ? 'Non-Vul' : 
                         this.vulnerability === 'Both' ? 'Vulnerable' : 
                         `${this.vulnerability} Vulnerable`;
    
    // Prevent body scroll when modal opens
    document.body.classList.add('modal-open');
    
    // Create modal overlay using PROVEN template with PIXEL 9A FIXES
    const modal = document.createElement('div');
    modal.className = 'modal-overlay hcp-analysis-modal';
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
        touch-action: manipulation;
    `;
    
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
                background: #e67e22;
                color: white;
                text-align: center;
                flex-shrink: 0;
            ">
                <h2 style="font-size: 18px; margin: 0;">⭐ Hand Analysis Required</h2>
            </div>
            
            <div class="modal-body" style="
                flex: 1;
                overflow-y: auto;
                overflow-x: hidden;
                -webkit-overflow-scrolling: touch;
                background: white;
                position: relative;
                min-height: 0;
                padding: 20px;
            ">
                <div style="
                    text-align: center; 
                    margin-bottom: 15px; 
                    padding: 12px; 
                    background: #2c3e50; 
                    border-radius: 8px; 
                    border: 2px solid #34495e;
                ">
                    <strong style="font-size: 16px; color: #ffffff; font-weight: bold;">${contract} by ${this.currentContract.declarer} = ${this.currentContract.result}</strong><br>
                    <strong style="font-size: 14px; color: #ecf0f1;">${vulnerability}</strong><br>
                    <span style="color: #f39c12; font-size: 15px; font-weight: bold;">Raw Score: ${this.currentContract.rawScore} points</span>
                </div>
                
                <div style="background: rgba(255,193,7,0.2); padding: 12px; border-radius: 8px; margin-bottom: 15px; border-left: 4px solid #f39c12;">
                    <strong>Count the combined cards of declarer + dummy:</strong><br>
                    <span style="font-size: 14px;">Ace=4, King=3, Queen=2, Jack=1</span>
                </div>
                
                <!-- HCP Section with PIXEL 9A OPTIMIZED BUTTONS -->
                <div style="background: white; padding: 15px; border-radius: 8px; margin-bottom: 15px; border: 2px solid #3498db;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <strong style="color: #2c3e50; font-size: 16px;">High Card Points:</strong>
                        <div style="display: flex; align-items: center; gap: 15px;">
                            <button id="hcp-minus-btn" style="
                                width: 50px; 
                                height: 50px; 
                                background: #e74c3c; 
                                color: white; 
                                border: none; 
                                border-radius: 8px; 
                                font-size: 24px; 
                                font-weight: bold;
                                cursor: pointer; 
                                touch-action: manipulation;
                                user-select: none;
                                -webkit-tap-highlight-color: transparent;
                                min-width: 50px;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                            ">−</button>
                            <span id="hcp-display" style="font-size: 28px; font-weight: bold; min-width: 50px; text-align: center; color: #2c3e50;">${totalHCP}</span>
                            <button id="hcp-plus-btn" style="
                                width: 50px; 
                                height: 50px; 
                                background: #27ae60; 
                                color: white; 
                                border: none; 
                                border-radius: 8px; 
                                font-size: 24px; 
                                font-weight: bold;
                                cursor: pointer; 
                                touch-action: manipulation;
                                user-select: none;
                                -webkit-tap-highlight-color: transparent;
                                min-width: 50px;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                            ">+</button>
                        </div>
                    </div>
                </div>
                
                <!-- Singletons Section -->
                <div style="background: white; padding: 15px; border-radius: 8px; margin-bottom: 15px; border: 2px solid #95a5a6;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <strong style="color: #2c3e50; font-size: 16px;">Singletons:</strong><br>
                            <span style="font-size: 12px; color: #7f8c8d;">1-card suits</span>
                        </div>
                        <div style="display: flex; align-items: center; gap: 15px;">
                            <button id="singleton-minus-btn" style="
                                width: 50px; 
                                height: 50px; 
                                background: #e74c3c; 
                                color: white; 
                                border: none; 
                                border-radius: 8px; 
                                font-size: 24px; 
                                font-weight: bold;
                                cursor: pointer; 
                                touch-action: manipulation;
                                user-select: none;
                                -webkit-tap-highlight-color: transparent;
                                min-width: 50px;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                            ">−</button>
                            <span id="singleton-display" style="font-size: 28px; font-weight: bold; min-width: 50px; text-align: center; color: #2c3e50;">${singletons}</span>
                            <button id="singleton-plus-btn" style="
                                width: 50px; 
                                height: 50px; 
                                background: #27ae60; 
                                color: white; 
                                border: none; 
                                border-radius: 8px; 
                                font-size: 24px; 
                                font-weight: bold;
                                cursor: pointer; 
                                touch-action: manipulation;
                                user-select: none;
                                -webkit-tap-highlight-color: transparent;
                                min-width: 50px;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                            ">+</button>
                        </div>
                    </div>
                </div>
                
                <!-- Voids Section -->
                <div style="background: white; padding: 15px; border-radius: 8px; margin-bottom: 15px; border: 2px solid #95a5a6;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <strong style="color: #2c3e50; font-size: 16px;">Voids:</strong><br>
                            <span style="font-size: 12px; color: #7f8c8d;">0-card suits</span>
                        </div>
                        <div style="display: flex; align-items: center; gap: 15px;">
                            <button id="void-minus-btn" style="
                                width: 50px; 
                                height: 50px; 
                                background: #e74c3c; 
                                color: white; 
                                border: none; 
                                border-radius: 8px; 
                                font-size: 24px; 
                                font-weight: bold;
                                cursor: pointer; 
                                touch-action: manipulation;
                                user-select: none;
                                -webkit-tap-highlight-color: transparent;
                                min-width: 50px;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                            ">−</button>
                            <span id="void-display" style="font-size: 28px; font-weight: bold; min-width: 50px; text-align: center; color: #2c3e50;">${voids}</span>
                            <button id="void-plus-btn" style="
                                width: 50px; 
                                height: 50px; 
                                background: #27ae60; 
                                color: white; 
                                border: none; 
                                border-radius: 8px; 
                                font-size: 24px; 
                                font-weight: bold;
                                cursor: pointer; 
                                touch-action: manipulation;
                                user-select: none;
                                -webkit-tap-highlight-color: transparent;
                                min-width: 50px;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                            ">+</button>
                        </div>
                    </div>
                </div>
                
                <!-- Long Suits Section -->
                <div style="background: white; padding: 15px; border-radius: 8px; margin-bottom: 20px; border: 2px solid #95a5a6;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <strong style="color: #2c3e50; font-size: 16px;">Long Suits:</strong><br>
                            <span style="font-size: 12px; color: #7f8c8d;">6+ card suits</span>
                        </div>
                        <div style="display: flex; align-items: center; gap: 15px;">
                            <button id="longsuit-minus-btn" style="
                                width: 50px; 
                                height: 50px; 
                                background: #e74c3c; 
                                color: white; 
                                border: none; 
                                border-radius: 8px; 
                                font-size: 24px; 
                                font-weight: bold;
                                cursor: pointer; 
                                touch-action: manipulation;
                                user-select: none;
                                -webkit-tap-highlight-color: transparent;
                                min-width: 50px;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                            ">−</button>
                            <span id="longsuit-display" style="font-size: 28px; font-weight: bold; min-width: 50px; text-align: center; color: #2c3e50;">${longSuits}</span>
                            <button id="longsuit-plus-btn" style="
                                width: 50px; 
                                height: 50px; 
                                background: #27ae60; 
                                color: white; 
                                border: none; 
                                border-radius: 8px; 
                                font-size: 24px; 
                                font-weight: bold;
                                cursor: pointer; 
                                touch-action: manipulation;
                                user-select: none;
                                -webkit-tap-highlight-color: transparent;
                                min-width: 50px;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                            ">+</button>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- FIXED ACTION BUTTONS -->
            <div style="
                display: flex; 
                gap: 15px; 
                justify-content: center;
                margin: 0;
                padding: 20px;
                border-top: 2px solid #ddd;
                flex-shrink: 0;
                background: white;
                border-radius: 0 0 12px 12px;
            ">
                <button id="cancel-analysis-btn" style="
                    flex: 1; 
                    height: 55px; 
                    background: #95a5a6; 
                    color: white; 
                    border: none; 
                    border-radius: 8px; 
                    font-size: 16px; 
                    font-weight: bold; 
                    cursor: pointer; 
                    touch-action: manipulation;
                    user-select: none;
                    -webkit-tap-highlight-color: transparent;
                    min-width: 100px;
                ">Cancel</button>
                <button id="calculate-score-btn" style="
                    flex: 2; 
                    height: 55px; 
                    background: #27ae60; 
                    color: white; 
                    border: none; 
                    border-radius: 8px; 
                    font-size: 16px; 
                    font-weight: bold; 
                    cursor: pointer; 
                    touch-action: manipulation;
                    user-select: none;
                    -webkit-tap-highlight-color: transparent;
                    min-width: 140px;
                ">Calculate Score</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // PIXEL 9A OPTIMIZED EVENT HANDLERS - NO CLONING!
    setTimeout(() => {
        this.setupPixel9aHCPHandlers();
    }, 100);
}

/**
 * PIXEL 9A OPTIMIZED HCP HANDLERS - Direct event binding, no cloning
 */
setupPixel9aHCPHandlers() {
    console.log('📱 Setting up PIXEL 9A optimized HCP handlers...');
    
    // Create unified touch handler for Pixel 9a
    const createPixelTouchHandler = (action) => {
        return (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            console.log(`🔥 Pixel 9a touch detected: ${action}`);
            
            // Visual feedback
            const btn = e.target;
            btn.style.transform = 'scale(0.9)';
            btn.style.opacity = '0.7';
            
            // Haptic feedback if available
            if (navigator.vibrate) {
                navigator.vibrate([25]);
            }
            
            // Execute action
            try {
                switch(action) {
                    case 'hcp-minus': this.adjustHCP(-1); break;
                    case 'hcp-plus': this.adjustHCP(1); break;
                    case 'singleton-minus': this.adjustSingletons(-1); break;
                    case 'singleton-plus': this.adjustSingletons(1); break;
                    case 'void-minus': this.adjustVoids(-1); break;
                    case 'void-plus': this.adjustVoids(1); break;
                    case 'longsuit-minus': this.adjustLongSuits(-1); break;
                    case 'longsuit-plus': this.adjustLongSuits(1); break;
                    case 'cancel': this.cancelHCPAnalysis(); return;
                    case 'calculate': this.completeHCPAnalysis(); return;
                }
                this.updatePixelHCPDisplay();
            } catch (error) {
                console.error('Error in Pixel 9a handler:', error);
            }
            
            // Reset visual feedback
            setTimeout(() => {
                btn.style.transform = 'scale(1)';
                btn.style.opacity = '1';
            }, 150);
        };
    };
    
    // Bind events to all buttons with multiple event types for Pixel 9a
    const buttonMappings = [
        { id: 'hcp-minus-btn', action: 'hcp-minus' },
        { id: 'hcp-plus-btn', action: 'hcp-plus' },
        { id: 'singleton-minus-btn', action: 'singleton-minus' },
        { id: 'singleton-plus-btn', action: 'singleton-plus' },
        { id: 'void-minus-btn', action: 'void-minus' },
        { id: 'void-plus-btn', action: 'void-plus' },
        { id: 'longsuit-minus-btn', action: 'longsuit-minus' },
        { id: 'longsuit-plus-btn', action: 'longsuit-plus' },
        { id: 'cancel-analysis-btn', action: 'cancel' },
        { id: 'calculate-score-btn', action: 'calculate' }
    ];
    
    buttonMappings.forEach(({ id, action }) => {
        const btn = document.getElementById(id);
        if (btn) {
            const handler = createPixelTouchHandler(action);
            
            // Multiple event types for maximum Pixel 9a compatibility
            btn.addEventListener('click', handler, { passive: false });
            btn.addEventListener('touchend', handler, { passive: false });
            btn.addEventListener('touchstart', (e) => {
                console.log(`📱 Touch start: ${action}`);
            }, { passive: true });
            
            console.log(`✅ Pixel 9a handler bound for: ${id}`);
        } else {
            console.warn(`❌ Button not found: ${id}`);
        }
    });
    
    console.log('✅ All Pixel 9a HCP handlers setup complete');
}

/**
 * Update HCP display values - PIXEL 9A OPTIMIZED
 */
updatePixelHCPDisplay() {
    const { totalHCP, singletons, voids, longSuits } = this.handAnalysis;
    
    const hcpDisplay = document.getElementById('hcp-display');
    if (hcpDisplay) hcpDisplay.textContent = totalHCP;
    
    const singletonDisplay = document.getElementById('singleton-display');
    if (singletonDisplay) singletonDisplay.textContent = singletons;
    
    const voidDisplay = document.getElementById('void-display');
    if (voidDisplay) voidDisplay.textContent = voids;
    
    const longsuitDisplay = document.getElementById('longsuit-display');
    if (longsuitDisplay) longsuitDisplay.textContent = longSuits;
    
    console.log(`📊 Display updated: HCP=${totalHCP}, S=${singletons}, V=${voids}, L=${longSuits}`);
}

/**
 * Adjust HCP value
 */
adjustHCP(change) {
    this.handAnalysis.totalHCP = Math.max(0, Math.min(40, this.handAnalysis.totalHCP + change));
}

/**
 * Adjust singletons value
 */
adjustSingletons(change) {
    this.handAnalysis.singletons = Math.max(0, Math.min(4, this.handAnalysis.singletons + change));
}

/**
 * Adjust voids value
 */
adjustVoids(change) {
    this.handAnalysis.voids = Math.max(0, Math.min(4, this.handAnalysis.voids + change));
}

/**
 * Adjust long suits value
 */
adjustLongSuits(change) {
    this.handAnalysis.longSuits = Math.max(0, Math.min(4, this.handAnalysis.longSuits + change));
}

cancelHCPAnalysis() {
    this.closeMobileModal();
    this.inputState = 'result_type_selection';
    this.updateDisplay();
}

completeHCPAnalysis() {
    console.log('🎯 Completing HCP Analysis and calculating score...');
    this.closeMobileModal();
    
    try {
        this.calculateBonusScore();
        this.inputState = 'scoring';
        this.updateDisplay();
        console.log('✅ Score calculation completed successfully');
    } catch (error) {
        console.error('❌ Error in score calculation:', error);
        // Fallback to basic scoring
        this.inputState = 'scoring';
        this.updateDisplay();
    }
}

/**
 * PIXEL 9A FIXED QUIT MODAL - OPTIMIZED VERSION
 */
showQuit() {
    console.log('🎮 Showing PIXEL 9A optimized quit options');
    
    const scores = this.gameState.scores;
    const totalDeals = this.gameState.history.length;
    const licenseStatus = this.bridgeApp.licenseManager.checkLicenseStatus();
    
    // Build the content sections
    let currentScoreContent = '';
    if (totalDeals > 0) {
        const leader = scores.NS > scores.EW ? 'North-South' : 
                      scores.EW > scores.NS ? 'East-West' : 'Tied';
        
        currentScoreContent = `
            <div style="padding: 15px; border-bottom: 1px solid #eee;">
                <h3 style="color: #e67e22; margin-bottom: 10px;">📊 Current Game Status</h3>
                <p><strong>Deals Played:</strong> ${totalDeals}</p>
                <p><strong>Current Leader:</strong> ${leader}</p>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 10px;">
                    <div style="text-align: center; padding: 10px; background: #27ae60; color: white; border-radius: 6px;">
                        <div style="font-size: 12px;">North-South</div>
                        <div style="font-size: 20px; font-weight: bold;">${scores.NS}</div>
                    </div>
                    <div style="text-align: center; padding: 10px; background: #e74c3c; color: white; border-radius: 6px;">
                        <div style="font-size: 12px;">East-West</div>
                        <div style="font-size: 20px; font-weight: bold;">${scores.EW}</div>
                    </div>
                </div>
            </div>
        `;
    }
    
    let licenseSection = '';
    if (licenseStatus.status === 'trial') {
        licenseSection = `
            <div style="padding: 15px; border-bottom: 1px solid #eee;">
                <h3 style="color: #e67e22; margin-bottom: 10px;">📅 License Status</h3>
                <p><strong>Trial Version:</strong> ${licenseStatus.daysLeft} days remaining</p>
                <p><strong>Deals Left:</strong> ${licenseStatus.dealsLeft} deals</p>
            </div>
        `;
    }
    
    // Prevent body scroll when modal opens
    document.body.classList.add('modal-open');
    
    // Create modal overlay using PIXEL 9A OPTIMIZED template
    const modal = document.createElement('div');
    modal.className = 'modal-overlay quit-modal';
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
        touch-action: manipulation;
    `;
    
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
                background: #e67e22;
                color: white;
                text-align: center;
                flex-shrink: 0;
            ">
                <h2 style="font-size: 18px; margin: 0;">⭐ Bonus Bridge Options</h2>
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
                ${currentScoreContent}
                ${licenseSection}
                <div style="padding: 15px;">
                    <h3 style="color: #e67e22; margin-bottom: 10px;">🎮 Game Options</h3>
                    <p>What would you like to do?</p>
                </div>
            </div>
            
            <!-- PIXEL 9A OPTIMIZED BUTTON LAYOUT -->
            <div style="
                padding: 20px;
                background: #f8f9fa;
                border-top: 1px solid #ddd;
                flex-shrink: 0;
            ">
                <div style="display: grid; grid-template-rows: 1fr 1fr; gap: 12px; width: 100%;">
                    <!-- Top row: 3 buttons -->
                    <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px;">
                        <button id="continue-btn" style="
                            padding: 12px 8px;
                            border: none;
                            border-radius: 8px;
                            font-size: 12px;
                            font-weight: 600;
                            cursor: pointer;
                            background: #27ae60;
                            color: white;
                            touch-action: manipulation;
                            user-select: none;
                            -webkit-tap-highlight-color: transparent;
                            min-height: 50px;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                        ">Continue Playing</button>
                        <button id="scores-btn" style="
                            padding: 12px 8px;
                            border: none;
                            border-radius: 8px;
                            font-size: 12px;
                            font-weight: 600;
                            cursor: pointer;
                            background: #3498db;
                            color: white;
                            touch-action: manipulation;
                            user-select: none;
                            -webkit-tap-highlight-color: transparent;
                            min-height: 50px;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                        ">Show Scores</button>
                        <button id="help-btn" style="
                            padding: 12px 8px;
                            border: none;
                            border-radius: 8px;
                            font-size: 12px;
                            font-weight: 600;
                            cursor: pointer;
                            background: #f39c12;
                            color: white;
                            touch-action: manipulation;
                            user-select: none;
                            -webkit-tap-highlight-color: transparent;
                            min-height: 50px;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                        ">Show Help</button>
                    </div>
                    <!-- Bottom row: 2 buttons -->
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                        <button id="newgame-btn" style="
                            padding: 12px 10px;
                            border: none;
                            border-radius: 8px;
                            font-size: 13px;
                            font-weight: 600;
                            cursor: pointer;
                            background: #9b59b6;
                            color: white;
                            touch-action: manipulation;
                            user-select: none;
                            -webkit-tap-highlight-color: transparent;
                            min-height: 50px;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                        ">New Game</button>
                        <button id="menu-btn" style="
                            padding: 12px 10px;
                            border: none;
                            border-radius: 8px;
                            font-size: 13px;
                            font-weight: 600;
                            cursor: pointer;
                            background: #95a5a6;
                            color: white;
                            touch-action: manipulation;
                            user-select: none;
                            -webkit-tap-highlight-color: transparent;
                            min-height: 50px;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                        ">Main Menu</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Setup PIXEL 9A OPTIMIZED button handlers
    setTimeout(() => {
        this.setupQuitModalHandlers();
    }, 100);
}

closeMobileModal() {
    const modal = document.querySelector('.modal-overlay');
    if (modal) {
        modal.remove();
        document.body.classList.remove('modal-open');
        console.log('📱 Mobile modal closed');
    }
}

// END SECTION SIX - Part 2 (PIXEL 9A FIXED)
// SECTION SEVEN - Scoring Logic

/**
 * Calculate raw bridge score - FIXED NT SCORING
 */
calculateRawScore() {
    const { level, suit, result, doubled, declarer } = this.currentContract;
    
    console.log(`💰 Calculating Bonus Bridge raw score for ${level}${suit}${doubled} by ${declarer} = ${result}`);
    
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
// END SECTION SEVEN// SECTION EIGHT - Analysis Algorithm

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
// END SECTION EIGHT
// SECTION NINE - Game Management (NEXT DEAL BUTTON FIXED - DUPLICATES REMOVED)

/**
 * Handle actions in scoring state - FIXED TO PROPERLY ADVANCE TO NEXT DEAL
 */
handleScoringActions(value) {
    console.log(`🎯 Scoring action received: ${value}`);
    
    if (value === 'DEAL') {
        console.log('🃏 DEAL button pressed - advancing to next deal');
        this.nextDeal();
    } else {
        console.log(`⚠️ Unknown scoring action: ${value}`);
    }
}

/**
 * Move to next deal with proper vulnerability and dealer rotation - ENHANCED
 */
nextDeal() {
    console.log('🃏 Moving to next deal');
    
    // Increment the deal number
    this.currentDeal++;
    console.log(`📈 Advanced to deal ${this.currentDeal}`);
    
    // CRITICAL FIX: Update vulnerability and dealer for new deal
    this.updateVulnerabilityAndDealer();
    
    // Reset contract and hand analysis
    this.resetContract();
    this.resetHandAnalysis();
    
    // CRITICAL: Set input state to level selection for new deal
    this.inputState = 'level_selection';
    console.log(`🔄 Input state set to: ${this.inputState}`);
    
    // Update the display to show new deal
    this.updateDisplay();
    
    console.log(`🎯 Successfully advanced to Deal ${this.currentDeal} - Dealer: ${this.getDealerName()}, Vulnerability: ${this.vulnerability}`);
    console.log(`📘 Active buttons should be: 1,2,3,4,5,6,7,BACK`);
}

/**
 * Reset contract to initial state
 */
resetContract() {
    console.log('🔄 Resetting contract state');
    this.currentContract = {
        level: null,
        suit: null,
        declarer: null,
        doubled: '',
        result: null,
        rawScore: null
    };
    this.resultMode = null;
    console.log('✅ Contract state reset');
}

/**
 * Reset hand analysis to default values
 */
resetHandAnalysis() {
    console.log('🔄 Resetting hand analysis');
    this.handAnalysis = {
        totalHCP: 20,
        singletons: 0,
        voids: 0,
        longSuits: 0
    };
    console.log('✅ Hand analysis reset');
}

/**
 * Handle back navigation
 */
handleBack() {
    console.log(`🔙 Back pressed from state: ${this.inputState}`);
    
    switch (this.inputState) {
        case 'suit_selection':
            this.inputState = 'level_selection';
            this.currentContract.level = null;
            console.log('🔙 Back to level selection');
            break;
        case 'declarer_selection':
            this.inputState = 'suit_selection';
            this.currentContract.suit = null;
            this.currentContract.doubled = '';
            console.log('🔙 Back to suit selection');
            break;
        case 'result_type_selection':
            this.inputState = 'declarer_selection';
            this.currentContract.declarer = null;
            console.log('🔙 Back to declarer selection');
            break;
        case 'result_number_selection':
            this.inputState = 'result_type_selection';
            this.resultMode = null;
            console.log('🔙 Back to result type selection');
            break;
        case 'hcp_analysis':
            this.inputState = 'result_type_selection';
            this.currentContract.result = null;
            this.currentContract.rawScore = null;
            console.log('🔙 Back to result type selection from HCP analysis');
            break;
        case 'scoring':
            this.inputState = 'result_type_selection';
            this.currentContract.result = null;
            console.log('🔙 Back to result type selection from scoring');
            break;
        default:
            console.log('🔙 Back from initial state - returning to mode selection');
            return false; // Let app handle return to mode selection
    }
    
    this.updateDisplay();
    return true;
}

/**
 * Get active buttons for current state - ENHANCED LOGGING
 */
getActiveButtons() {
    let buttons = [];
    
    switch (this.inputState) {
        case 'level_selection':
            buttons = ['1', '2', '3', '4', '5', '6', '7'];
            break;
            
        case 'suit_selection':
            buttons = ['♣', '♦', '♥', '♠', 'NT'];
            break;
            
        case 'declarer_selection':
            buttons = ['N', 'S', 'E', 'W', 'X'];
            if (this.currentContract.declarer) {
                buttons.push('MADE', 'PLUS', 'DOWN');
            }
            break;
            
        case 'result_type_selection':
            buttons = ['MADE', 'PLUS', 'DOWN'];
            break;
            
        case 'result_number_selection':
            if (this.resultMode === 'down') {
                buttons = ['1', '2', '3', '4', '5', '6', '7'];
            } else if (this.resultMode === 'plus') {
                const maxOvertricks = Math.min(6, 13 - (6 + this.currentContract.level));
                for (let i = 1; i <= maxOvertricks; i++) {
                    buttons.push(i.toString());
                }
            }
            break;
            
        case 'hcp_analysis':
            buttons = []; // Popup handles all interactions
            break;
            
        case 'scoring':
            buttons = ['DEAL'];
            break;
            
        default:
            buttons = [];
            break;
    }
    
    console.log(`📘 Active buttons for state '${this.inputState}':`, buttons);
    return buttons;
}

/**
 * Update the display using new system - ENHANCED
 */
updateDisplay() {
    console.log(`🖥️ Updating display for state: ${this.inputState}`);
    
    const display = document.getElementById('display');
    if (display) {
        display.innerHTML = this.getDisplayContent();
        console.log('✅ Display content updated');
    }
    
    // Update vulnerability display in the UI control
    this.updateVulnerabilityDisplay();
    
    // Update button states with enhanced logging
    const activeButtons = this.getActiveButtons();
    activeButtons.push('BACK'); // Always allow going back
    
    console.log(`📘 Calling updateButtonStates with:`, activeButtons);
    this.bridgeApp.updateButtonStates(activeButtons);
    console.log('✅ Button states updated');
}

/**
 * Update the vulnerability display in the UI control
 */
updateVulnerabilityDisplay() {
    const vulnText = document.getElementById('vulnText');
    if (vulnText) {
        vulnText.textContent = this.vulnerability;
        console.log(`🎯 Vulnerability display updated to: ${this.vulnerability}`);
    }
}

/**
 * Start a new game (reset scores) - SINGLE CLEAN VERSION
 */
startNewGame() {
    const confirmed = confirm(
        'Start a new Bonus Bridge game?\n\nThis will reset all scores to zero and start over.\n\nClick OK to start new game, Cancel to continue current game.'
    );
    
    if (confirmed) {
        console.log('🆕 Starting new Bonus Bridge game');
        
        // Reset all scores and history
        this.gameState.scores = { NS: 0, EW: 0 };
        this.gameState.history = [];
        this.currentDeal = 1;
        
        // Reset vulnerability and dealer for deal 1
        this.updateVulnerabilityAndDealer();
        
        // Reset to level selection
        this.resetContract();
        this.resetHandAnalysis();
        this.inputState = 'level_selection';
        this.updateDisplay();
        
        console.log('✅ New Bonus Bridge game started');
        this.closeMobileModal();
    }
}

/**
 * Return to main menu - SINGLE CLEAN VERSION
 */
returnToMainMenu() {
    console.log('🏠 Returning to main menu');
    this.closeMobileModal();
    this.bridgeApp.showLicensedMode({
        type: this.bridgeApp.licenseManager.getLicenseData()?.type || 'FULL' 
    });
}

/**
 * Cleanup when switching modes
 */
cleanup() {
    console.log('🧹 Bonus Bridge cleanup completed');
    // Bonus Bridge doesn't have special UI elements to clean up
}

// END SECTION NIN
// SECTION TEN - UI Methods and Export (UPDATED - MOBILE HELP SYSTEM FIXED - DUPLICATES REMOVED)

/**
 * Show Bonus Bridge specific help - UNIFIED WITH KITCHEN/CHICAGO SYSTEM
 */
showHelp() {
    const helpContent = this.getBonusHelpContent();
    this.showMobileOptimizedModal('⭐ Bonus Bridge Help', helpContent, [
        { text: 'Close Help', action: () => this.closeMobileModal() }
    ]);
}

/**
 * Get Bonus Bridge help content - FORMATTED FOR UNIFIED MODAL SYSTEM
 */
getBonusHelpContent() {
    return `
        <div class="content-section">
            <h3 style="margin: 0 0 12px 0; color: #e67e22; font-size: 18px;">What is Bonus Bridge?</h3>
            <p style="margin: 0 0 16px 0; font-size: 14px; line-height: 1.4; color: #333;">
                An enhanced scoring system that rewards both declarers and defenders based on hand strength and performance versus expectations.
            </p>
            
            <div style="background: #fff8e1; padding: 12px; border-radius: 8px; border-left: 4px solid #f39c12;">
                <h4 style="margin: 0 0 8px 0; color: #e67e22; font-size: 14px;">Perfect For</h4>
                <p style="margin: 0; font-size: 13px; color: #e67e22;">
                    Skill-based scoring • Fair competition • Teaching hand evaluation • Rewarding good defense
                </p>
            </div>
        </div>
        
        <div class="content-section">
            <h3 style="margin: 0 0 16px 0; color: #e67e22; font-size: 18px;">Key Features</h3>
            <ul style="margin: 0 0 16px 0; padding-left: 20px; font-size: 13px; line-height: 1.4;">
                <li><strong>HCP Balance:</strong> Evaluates point distribution between teams</li>
                <li><strong>Performance Analysis:</strong> Compares expected vs. actual tricks</li>
                <li><strong>Contract Ambition:</strong> Rewards appropriate bidding choices</li>
                <li><strong>Distribution Points:</strong> Accounts for shapely hands</li>
            </ul>
        </div>
        
        <div class="content-section">
            <h3 style="margin: 0 0 16px 0; color: #e67e22; font-size: 18px;">How It Works</h3>
            
            <div style="
                display: grid; 
                grid-template-columns: 1fr 1fr; 
                gap: 8px; 
                margin: 16px 0; 
                background: #f5f5f5; 
                padding: 12px; 
                border-radius: 8px;
            ">
                <div style="text-align: center; padding: 10px; background: white; border-radius: 6px; border-left: 3px solid #3498db;">
                    <div style="font-weight: bold; font-size: 14px; color: #3498db;">Step 1</div>
                    <div style="font-size: 12px; color: #666;">Enter contract</div>
                    <div style="font-size: 12px; color: #666;">& result</div>
                </div>
                <div style="text-align: center; padding: 10px; background: white; border-radius: 6px; border-left: 3px solid #e67e22;">
                    <div style="font-weight: bold; color: #e67e22; font-size: 14px;">Step 2</div>
                    <div style="font-size: 12px; color: #666;">HCP Analysis</div>
                    <div style="font-size: 12px; color: #666;">popup appears</div>
                </div>
            </div>
            
            <p style="font-size: 13px; line-height: 1.4; margin: 12px 0;">
                After each deal, the system calculates raw bridge score, then opens HCP Analysis 
                to evaluate hand strength and adjust final points for both sides.
            </p>
        </div>
        
        <div class="content-section">
            <h3 style="margin: 0 0 16px 0; color: #e67e22; font-size: 18px;">HCP Analysis Details</h3>
            
            <div class="feature-grid">
                <div class="feature-item">
                    <h4>🎯 High Card Points</h4>
                    <p>Standard valuation: Ace=4, King=3, Queen=2, Jack=1. Count declarer + dummy combined.</p>
                </div>
                
                <div class="feature-item">
                    <h4>📊 Distribution</h4>
                    <p>Singletons (1-card), Voids (0-card), Long suits (6+ cards). Shapes matter!</p>
                </div>
                
                <div class="feature-item">
                    <h4⚖️ Expected vs Actual</h4>
                    <p>System compares expected tricks to actual performance for fair scoring.</p>
                </div>
                
                <div class="feature-item">
                    <h4>🏆 Both Sides Score</h4>
                    <p>Even when contracts make, defenders can earn points for good performance.</p>
                </div>
            </div>
        </div>
        
        <div class="content-section">
            <h3 style="margin: 0 0 16px 0; color: #e67e22; font-size: 18px;">Expected HCP Guidelines</h3>
            
            <div style="background: #f8f9fa; padding: 14px; border-radius: 8px; margin: 12px 0;">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 12px;">
                    <div><strong>Part Scores (1-2):</strong> 20-24 HCP</div>
                    <div><strong>3NT:</strong> 25-26 HCP</div>
                    <div><strong>4 Major:</strong> 27-28 HCP</div>
                    <div><strong>5 Minor:</strong> 29-30 HCP</div>
                    <div><strong>Small Slam:</strong> 31-35 HCP</div>
                    <div><strong>Grand Slam:</strong> 36+ HCP</div>
                </div>
            </div>
            
            <div style="background: #e8f5e8; padding: 12px; border-radius: 8px; border-left: 4px solid #27ae60; margin: 15px 0;">
                <h4 style="margin: 0 0 8px 0; color: #155724; font-size: 14px;">Scoring Benefits</h4>
                <ul style="margin: 0; padding-left: 18px; font-size: 13px; color: #155724; line-height: 1.3;">
                    <li>Making with fewer HCP = bonus points</li>
                    <li>Good defense rewarded even when contracts make</li>
                    <li>Overbidding with weak hands penalized</li>
                    <li>Both partnerships can score on most deals</li>
                </ul>
            </div>
        </div>
        
        <div class="content-section">
            <h3 style="margin: 0 0 16px 0; color: #e67e22; font-size: 18px;">Vulnerability Cycle</h3>
            <p>Bonus Bridge uses automatic vulnerability cycle (Chicago style):</p>
            <ul style="margin: 10px 0; padding-left: 20px; font-size: 13px; line-height: 1.4;">
                <li><strong>Deal 1:</strong> None Vulnerable (NV)</li>
                <li><strong>Deal 2:</strong> North-South Vulnerable (NS)</li>
                <li><strong>Deal 3:</strong> East-West Vulnerable (EW)</li>
                <li><strong>Deal 4:</strong> Both Vulnerable (Both)</li>
                <li><strong>Cycle repeats...</strong> Deal 5 = NV, Deal 6 = NS, etc.</li>
            </ul>
        </div>
        
        <div class="content-section">
            <h3 style="margin: 0 0 12px 0; color: #e67e22; font-size: 18px;">Mobile Tips</h3>
            <ol style="margin: 0 0 16px 0; padding-left: 20px; font-size: 13px; line-height: 1.4;">
                <li>HCP Analysis popup has enhanced scrolling for all data entry</li>
                <li>Use +/- buttons in popup to adjust HCP and distribution values</li>
                <li>Vulnerability automatically cycles every 4 deals (Chicago style)</li>
                <li>All scoring happens after HCP analysis is complete</li>
            </ol>
            
            <div style="
                text-align: center; 
                font-size: 12px; 
                color: #666; 
                background: rgba(230,126,34,0.05);
                padding: 12px;
                border-radius: 6px;
                margin-top: 16px;
            ">
                ⭐ Bonus Bridge: Where skill and fair play meet in bridge scoring
            </div>
        </div>
        
        <div class="content-section">
            <h3 style="margin: 0 0 12px 0; color: #e67e22; font-size: 18px;">Scoring Philosophy</h3>
            <ul style="margin: 0 0 16px 0; padding-left: 20px; font-size: 13px; line-height: 1.4;">
                <li><strong>Made Contracts:</strong> Points adjusted based on HCP advantage/disadvantage</li>
                <li><strong>Failed Contracts:</strong> Defenders rewarded, declarers get consolation if weak</li>
                <li><strong>Both Sides Score:</strong> Most deals award points to both partnerships</li>
                <li><strong>Skill Recognition:</strong> Better performance with weaker hands = more points</li>
            </ul>
            
            <div style="
                text-align: center; 
                font-size: 12px; 
                color: #666; 
                background: rgba(230,126,34,0.05);
                padding: 12px;
                border-radius: 6px;
                margin-top: 16px;
            ">
                🎉 You've mastered Bonus Bridge!
            </div>
        </div>
    `;
}

/**
 * Get display content for current state - FIXED DEALER DISPLAY
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
                    <div><strong>Deal ${this.currentDeal} - Dealer ${this.getDealerName()} - ${this.vulnerability}</strong></div>
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
                    <div><strong>Deal ${this.currentDeal} - Dealer ${this.getDealerName()} - ${this.vulnerability}</strong></div>
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
                    <div><strong>Deal ${this.currentDeal} - Dealer ${this.getDealerName()} - ${this.vulnerability}</strong></div>
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
                    <div><strong>Deal ${this.currentDeal} - Dealer ${this.getDealerName()} - ${this.vulnerability}</strong></div>
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
                    <div><strong>Deal ${this.currentDeal} - Dealer ${this.getDealerName()} - ${this.vulnerability}</strong></div>
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
                    <div><strong>Deal ${this.currentDeal} - Dealer ${this.getDealerName()} - ${this.vulnerability}</strong></div>
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
                const rawScore = lastEntry.score || lastEntry.contract.rawScore || 0;
                const vulnerability = lastEntry.vulnerability || 'NV';
                const vulnText = vulnerability === 'NV' ? 'Non-Vul' : 
                               vulnerability === 'Both' ? 'Vulnerable' : 
                               `${vulnerability} Vulnerable`;
                
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
                        <strong>${contractDisplay} by ${lastEntry.contract.declarer} ${vulnText} Raw Score: ${rawScore}</strong></div>
                        <div style="color: #e67e22; font-size: 12px; margin-top: 4px;">
                            HCP: ${analysis.totalHCP}/${analysis.expectedHCP} | 
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

}

// Export for the new module system
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BonusBridgeMode;
} else if (typeof window !== 'undefined') {
    window.BonusBridgeMode = BonusBridgeMode;
}

console.log('⭐ Bonus Bridge module loaded successfully with enhanced mobile HCP analysis');
// END SECTION TEN - FILE COMPLETEE
