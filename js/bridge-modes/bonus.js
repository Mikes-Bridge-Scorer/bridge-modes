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