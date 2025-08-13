// SECTION ONE - Header and Diagnostics
/**
 * Enhanced Bridge Help System with Diagnostics and Direct Mode Opening
 * Mobile-optimized tabbed help for all bridge modes
 * Includes diagnostic tools and proper file loading checks
 * NO SCROLLING ISSUES - All content fits in tabs
 */

console.log('🚀 Loading Enhanced Bridge Help System with Diagnostics...');

// Global diagnostic function
window.diagnoseBridgeHelp = function() {
    console.log('🔍 BRIDGE HELP DIAGNOSTICS:');
    console.log('- Current URL:', window.location.href);
    console.log('- Document ready state:', document.readyState);
    console.log('- initializeBridgeHelp exists:', typeof initializeBridgeHelp !== 'undefined');
    console.log('- BridgeHelpSystem exists:', typeof BridgeHelpSystem !== 'undefined');
    console.log('- Global bridge help:', typeof window.globalBridgeHelp);
    
    // Check if file exists
    checkFileExists('js/bridge-help.js').then(exists => {
        console.log('- bridge-help.js file exists:', exists);
    });
    
    return {
        scriptLoaded: typeof BridgeHelpSystem !== 'undefined',
        functionExists: typeof initializeBridgeHelp !== 'undefined',
        location: window.location.href
    };
};

// File existence checker
async function checkFileExists(url) {
    try {
        const response = await fetch(url, { method: 'HEAD' });
        return response.ok;
    } catch (error) {
        return false;
    }
}
// END SECTION ONE
// SECTION TWO - Class Definition and Constructor
class BridgeHelpSystem {
    constructor(bridgeApp) {
        this.bridgeApp = bridgeApp;
        this.currentTab = 'kitchen';
        this.isVisible = false;
        
        console.log('📚 Enhanced Bridge Help System initialized with diagnostics');
        
        // Run diagnostics
        setTimeout(() => {
            console.log('🔍 Post-initialization diagnostics:', {
                bridgeApp: !!bridgeApp,
                modal: !!this.bridgeApp?.showModal,
                currentTab: this.currentTab
            });
        }, 100);
    }
    
    /**
     * Show help system with specified initial tab - DIRECT MODE OPENING
     * This ensures when Chicago asks for help, it gets Chicago help directly
     */
    show(modeName = 'kitchen') {
        console.log(`📚 Showing ENHANCED help directly for: ${modeName}`);
        
        // Ensure we open to the correct mode - THIS IS THE KEY FEATURE YOU WANTED
        this.currentTab = modeName.toLowerCase();
        this.isVisible = true;
        
        const helpContent = this.buildHelpInterface();
        
        // Use enhanced modal options
        this.bridgeApp.showModal('🃏 Bridge Scoring Help', helpContent, [
            { 
                text: '✅ Close Help', 
                action: () => this.close() 
            }
        ], { 
            customClass: 'enhanced-bridge-help-modal',
            closeButton: false // We have our own close button
        });
        
        // Setup after modal is shown - with error handling
        setTimeout(() => {
            try {
                this.setupHelpInterface();
                this.showTab(this.currentTab);
                console.log(`✅ Enhanced help opened successfully to: ${this.currentTab}`);
            } catch (error) {
                console.error('❌ Error setting up help interface:', error);
                this.showFallbackMessage();
            }
        }, 150);
    }
    
    /**
     * Show fallback message if enhanced setup fails
     */
    showFallbackMessage() {
        const modal = document.querySelector('.modal-overlay');
        if (modal) {
            const content = modal.querySelector('.modal-body');
            if (content) {
                content.innerHTML = `
                    <div style="text-align: center; padding: 20px;">
                        <h3>🔧 Help System Loading</h3>
                        <p>The enhanced help system encountered an issue. Please try refreshing the page.</p>
                        <button onclick="location.reload()" style="
                            background: #007bff; 
                            color: white; 
                            border: none; 
                            padding: 10px 20px; 
                            border-radius: 5px; 
                            cursor: pointer;
                        ">Refresh Page</button>
                    </div>
                `;
            }
        }
    }
// END SECTION TWO
// MOBILE-OPTIMIZED SECTION THREE - Interface Builder (REPLACE YOUR SECTION 3)
    /**
     * Build the complete tabbed help interface with MOBILE OPTIMIZATION
     */
    buildHelpInterface() {
        return `
            <div class="enhanced-help-system-container" style="
                width: 100%;
                height: 85vh;
                max-height: 650px;
                display: flex;
                flex-direction: column;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                overflow: hidden;
                background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
                border-radius: 8px;
                box-shadow: 0 4px 16px rgba(0,0,0,0.1);
                margin: 0;
                padding: 0;
            ">
                <!-- MOBILE-OPTIMIZED Tab Navigation -->
                <div class="help-tabs" style="
                    display: flex;
                    background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
                    border-bottom: none;
                    flex-shrink: 0;
                    overflow-x: auto;
                    -webkit-overflow-scrolling: touch;
                    border-radius: 8px 8px 0 0;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.15);
                    padding: 0;
                    margin: 0;
                ">
                    <button class="help-tab" data-tab="kitchen" style="
                        flex: 1;
                        padding: 12px 8px;
                        background: none;
                        border: none;
                        cursor: pointer;
                        font-size: 11px;
                        font-weight: 600;
                        color: rgba(255,255,255,0.85);
                        border-bottom: 3px solid transparent;
                        white-space: nowrap;
                        transition: all 0.3s ease;
                        min-width: 80px;
                        max-width: 100px;
                    " title="Kitchen Bridge - Casual scoring">
                        <div style="display: flex; flex-direction: column; align-items: center; gap: 2px;">
                            <span style="font-size: 14px;">🍳</span>
                            <span style="font-size: 10px;">Kitchen</span>
                        </div>
                    </button>
                    
                    <button class="help-tab" data-tab="chicago" style="
                        flex: 1;
                        padding: 12px 8px;
                        background: none;
                        border: none;
                        cursor: pointer;
                        font-size: 11px;
                        font-weight: 600;
                        color: rgba(255,255,255,0.85);
                        border-bottom: 3px solid transparent;
                        white-space: nowrap;
                        transition: all 0.3s ease;
                        min-width: 80px;
                        max-width: 100px;
                    " title="Chicago Bridge - 4-deal cycles">
                        <div style="display: flex; flex-direction: column; align-items: center; gap: 2px;">
                            <span style="font-size: 14px;">🌉</span>
                            <span style="font-size: 10px;">Chicago</span>
                        </div>
                    </button>
                    
                    <button class="help-tab" data-tab="bonus" style="
                        flex: 1;
                        padding: 12px 8px;
                        background: none;
                        border: none;
                        cursor: pointer;
                        font-size: 11px;
                        font-weight: 600;
                        color: rgba(255,255,255,0.85);
                        border-bottom: 3px solid transparent;
                        white-space: nowrap;
                        transition: all 0.3s ease;
                        min-width: 80px;
                        max-width: 100px;
                    " title="Bonus Bridge - HCP enhanced">
                        <div style="display: flex; flex-direction: column; align-items: center; gap: 2px;">
                            <span style="font-size: 14px;">⭐</span>
                            <span style="font-size: 10px;">Bonus</span>
                        </div>
                    </button>
                    
                    <button class="help-tab" data-tab="rubber" style="
                        flex: 1;
                        padding: 12px 8px;
                        background: none;
                        border: none;
                        cursor: pointer;
                        font-size: 11px;
                        font-weight: 600;
                        color: rgba(255,255,255,0.85);
                        border-bottom: 3px solid transparent;
                        white-space: nowrap;
                        transition: all 0.3s ease;
                        min-width: 80px;
                        max-width: 100px;
                    " title="Rubber Bridge - Traditional">
                        <div style="display: flex; flex-direction: column; align-items: center; gap: 2px;">
                            <span style="font-size: 14px;">🎯</span>
                            <span style="font-size: 10px;">Rubber</span>
                        </div>
                    </button>
                    
                    <button class="help-tab" data-tab="duplicate" style="
                        flex: 1;
                        padding: 12px 8px;
                        background: none;
                        border: none;
                        cursor: pointer;
                        font-size: 11px;
                        font-weight: 600;
                        color: rgba(255,255,255,0.85);
                        border-bottom: 3px solid transparent;
                        white-space: nowrap;
                        transition: all 0.3s ease;
                        min-width: 80px;
                        max-width: 100px;
                    " title="Duplicate Bridge - Tournament">
                        <div style="display: flex; flex-direction: column; align-items: center; gap: 2px;">
                            <span style="font-size: 14px;">♦</span>
                            <span style="font-size: 10px;">Duplicate</span>
                        </div>
                    </button>
                </div>
                
                <!-- Enhanced Tab Content Area - MOBILE OPTIMIZED -->
                <div class="help-content-area" style="
                    flex: 1;
                    overflow: hidden;
                    position: relative;
                    background: white;
                    border-radius: 0 0 8px 8px;
                    margin: 0;
                    padding: 0;
                ">
                    <!-- Kitchen Bridge Help -->
                    <div class="help-tab-content" data-content="kitchen" style="
                        position: absolute;
                        top: 0;
                        left: 0;
                        right: 0;
                        bottom: 0;
                        padding: 16px;
                        overflow-y: auto;
                        -webkit-overflow-scrolling: touch;
                        display: none;
                        background: linear-gradient(180deg, #ffffff 0%, #f8f9fa 100%);
                    ">
                        ${this.getKitchenBridgeHelp()}
                    </div>
                    
                    <!-- Chicago Bridge Help with Sub-tabs -->
                    <div class="help-tab-content" data-content="chicago" style="
                        position: absolute;
                        top: 0;
                        left: 0;
                        right: 0;
                        bottom: 0;
                        padding: 16px;
                        overflow-y: auto;
                        -webkit-overflow-scrolling: touch;
                        display: none;
                        background: linear-gradient(180deg, #ffffff 0%, #f8f9fa 100%);
                    ">
                        ${this.getChicagoBridgeHelp()}
                    </div>
                    
                    <!-- Bonus Bridge Help with Sub-tabs -->
                    <div class="help-tab-content" data-content="bonus" style="
                        position: absolute;
                        top: 0;
                        left: 0;
                        right: 0;
                        bottom: 0;
                        padding: 16px;
                        overflow-y: auto;
                        -webkit-overflow-scrolling: touch;
                        display: none;
                        background: linear-gradient(180deg, #ffffff 0%, #f8f9fa 100%);
                    ">
                        ${this.getBonusBridgeHelp()}
                    </div>
                    
                    <!-- Rubber Bridge Help -->
                    <div class="help-tab-content" data-content="rubber" style="
                        position: absolute;
                        top: 0;
                        left: 0;
                        right: 0;
                        bottom: 0;
                        padding: 16px;
                        overflow-y: auto;
                        -webkit-overflow-scrolling: touch;
                        display: none;
                        background: linear-gradient(180deg, #ffffff 0%, #f8f9fa 100%);
                    ">
                        ${this.getRubberBridgeHelp()}
                    </div>
                    
                    <!-- Duplicate Bridge Help -->
                    <div class="help-tab-content" data-content="duplicate" style="
                        position: absolute;
                        top: 0;
                        left: 0;
                        right: 0;
                        bottom: 0;
                        padding: 16px;
                        overflow-y: auto;
                        -webkit-overflow-scrolling: touch;
                        display: none;
                        background: linear-gradient(180deg, #ffffff 0%, #f8f9fa 100%);
                    ">
                        ${this.getDuplicateBridgeHelp()}
                    </div>
                </div>
                
                <!-- MOBILE-OPTIMIZED Status Bar -->
                <div style="
                    background: linear-gradient(135deg, #e9ecef 0%, #f8f9fa 100%);
                    padding: 6px 16px;
                    font-size: 10px;
                    color: #6c757d;
                    border-top: 1px solid #dee2e6;
                    text-align: center;
                    border-radius: 0 0 8px 8px;
                ">
                    Enhanced Bridge Help • Mobile Optimized
                </div>
            </div>
        `;
    }
// END SECTION THREE
// SECTION FOUR - Event Setup and Tab Management
    /**
     * Setup tab switching functionality with enhanced diagnostics
     */
    setupHelpInterface() {
        const modal = document.querySelector('.modal-overlay');
        if (!modal) {
            console.error('❌ Modal not found for enhanced help interface setup');
            this.showFallbackMessage();
            return;
        }
        
        console.log('📚 Setting up enhanced help interface...');
        
        // Setup main tab clicking with enhanced effects
        const tabs = modal.querySelectorAll('.help-tab');
        console.log('📚 Found main tabs:', tabs.length);
        
        if (tabs.length === 0) {
            console.error('❌ No tabs found in modal');
            this.showFallbackMessage();
            return;
        }
        
        tabs.forEach((tab, index) => {
            const tabName = tab.getAttribute('data-tab');
            console.log(`📚 Setting up enhanced tab ${index}: ${tabName}`);
            
            // Remove any existing listeners to prevent duplicates
            const newTab = tab.cloneNode(true);
            tab.parentNode.replaceChild(newTab, tab);
            
            // Add hover effects with smooth transitions
            newTab.addEventListener('mouseenter', () => {
                if (!newTab.classList.contains('active')) {
                    newTab.style.background = 'rgba(255,255,255,0.1)';
                    newTab.style.transform = 'translateY(-2px)';
                    newTab.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                }
            });
            
            newTab.addEventListener('mouseleave', () => {
                if (!newTab.classList.contains('active')) {
                    newTab.style.background = 'none';
                    newTab.style.transform = 'translateY(0)';
                    newTab.style.boxShadow = 'none';
                }
            });
            
            // Add comprehensive click handlers
            ['click', 'touchend'].forEach(eventType => {
                newTab.addEventListener(eventType, (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log(`📚 Enhanced tab clicked: ${tabName}`);
                    
                    // Add click animation
                    newTab.style.transform = 'scale(0.96)';
                    setTimeout(() => {
                        newTab.style.transform = 'scale(1)';
                    }, 150);
                    
                    this.showTab(tabName);
                }, { passive: false });
            });
        });
        
        // Setup sub-tab functionality
        this.setupSubTabs(modal);
        
        console.log('✅ Enhanced help interface setup complete');
    }
    
    /**
     * Setup sub-tab functionality with enhanced styling
     */
    setupSubTabs(modal) {
        // Wait for DOM to settle
        setTimeout(() => {
            const subTabs = modal.querySelectorAll('.help-sub-tab');
            console.log('📚 Found sub-tabs:', subTabs.length);
            
            subTabs.forEach((subTab, index) => {
                const subTabName = subTab.getAttribute('data-subtab');
                console.log(`📚 Setting up enhanced sub-tab ${index}: ${subTabName}`);
                
                // Remove any existing listeners
                const newSubTab = subTab.cloneNode(true);
                subTab.parentNode.replaceChild(newSubTab, subTab);
                
                // Add enhanced hover effects for sub-tabs
                newSubTab.addEventListener('mouseenter', () => {
                    if (!newSubTab.classList.contains('active')) {
                        newSubTab.style.background = 'rgba(52, 152, 219, 0.1)';
                        newSubTab.style.transform = 'translateY(-1px)';
                    }
                });
                
                newSubTab.addEventListener('mouseleave', () => {
                    if (!newSubTab.classList.contains('active')) {
                        newSubTab.style.background = 'transparent';
                        newSubTab.style.transform = 'translateY(0)';
                    }
                });
                
                // Add comprehensive event handling
                ['click', 'touchend'].forEach(eventType => {
                    newSubTab.addEventListener(eventType, (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log(`📚 Enhanced sub-tab clicked: ${subTabName}`);
                        this.showSubTab(subTabName);
                    }, { passive: false });
                });
            });
        }, 100);
    }
    
    /**
     * Show specific tab content with enhanced animations
     */
    showTab(tabName) {
        console.log(`📚 Switching to enhanced tab: ${tabName}`);
        
        const modal = document.querySelector('.modal-overlay');
        if (!modal) {
            console.error('❌ Modal not found for tab switching');
            return;
        }
        
        // Update tab appearance with enhanced styling
        const tabs = modal.querySelectorAll('.help-tab');
        const contents = modal.querySelectorAll('.help-tab-content');
        
        tabs.forEach(tab => {
            const isActive = tab.getAttribute('data-tab') === tabName;
            
            if (isActive) {
                // Active tab styling with enhanced effects
                tab.style.borderBottomColor = '#3498db';
                tab.style.backgroundColor = 'rgba(255,255,255,0.15)';
                tab.style.color = '#ffffff';
                tab.style.transform = 'translateY(-2px) scale(1.02)';
                tab.style.boxShadow = '0 4px 16px rgba(52, 152, 219, 0.3)';
                tab.style.borderBottom = '3px solid #3498db';
                tab.classList.add('active');
            } else {
                // Inactive tab styling
                tab.style.borderBottomColor = 'transparent';
                tab.style.backgroundColor = 'transparent';
                tab.style.color = 'rgba(255,255,255,0.85)';
                tab.style.transform = 'translateY(0) scale(1)';
                tab.style.boxShadow = 'none';
                tab.style.borderBottom = '3px solid transparent';
                tab.classList.remove('active');
            }
        });
        
        // Show/hide content with smooth fade effect
        contents.forEach(content => {
            const shouldShow = content.getAttribute('data-content') === tabName;
            
            if (shouldShow) {
                content.style.display = 'block';
                content.style.opacity = '0';
                content.style.transform = 'translateY(10px)';
                
                // Animate in with smooth transition
                requestAnimationFrame(() => {
                    content.style.transition = 'opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1), transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
                    content.style.opacity = '1';
                    content.style.transform = 'translateY(0)';
                });
                
                // Reset scroll position
                content.scrollTop = 0;
            } else {
                content.style.display = 'none';
                content.style.transition = 'none';
            }
        });
        
        this.currentTab = tabName;
        console.log(`✅ Enhanced tab switch complete: ${this.currentTab}`);
    }
    
    /**
     * Show specific sub-tab content - enhanced version
     */
    showSubTab(subTabName) {
        console.log(`📚 Switching to enhanced sub-tab: ${subTabName}`);
        
        const modal = document.querySelector('.modal-overlay');
        if (!modal) {
            console.error('❌ Modal not found for sub-tab switching');
            return;
        }
        
        // Update sub-tab appearance with enhanced styling
        const subTabs = modal.querySelectorAll('.help-sub-tab');
        const subContents = modal.querySelectorAll('.help-sub-content');
        
        subTabs.forEach(subTab => {
            const isActive = subTab.getAttribute('data-subtab') === subTabName;
            
            if (isActive) {
                subTab.style.borderBottomColor = '#3498db';
                subTab.style.backgroundColor = 'rgba(52, 152, 219, 0.1)';
                subTab.style.color = '#2980b9';
                subTab.style.fontWeight = '700';
                subTab.style.transform = 'translateY(-1px)';
                subTab.style.boxShadow = '0 2px 8px rgba(52, 152, 219, 0.2)';
                subTab.classList.add('active');
            } else {
                subTab.style.borderBottomColor = 'transparent';
                subTab.style.backgroundColor = 'transparent';
                subTab.style.color = '#7f8c8d';
                subTab.style.fontWeight = '600';
                subTab.style.transform = 'translateY(0)';
                subTab.style.boxShadow = 'none';
                subTab.classList.remove('active');
            }
        });
        
        // Show/hide sub-content with smooth transition
        subContents.forEach(content => {
            const shouldShow = content.getAttribute('data-subcontent') === subTabName;
            
            if (shouldShow) {
                content.style.display = 'block';
                content.style.opacity = '0';
                
                // Animate in
                requestAnimationFrame(() => {
                    content.style.transition = 'opacity 0.3s ease';
                    content.style.opacity = '1';
                });
                
                // Reset scroll position
                content.scrollTop = 0;
            } else {
                content.style.display = 'none';
            }
        });
        
        console.log(`✅ Enhanced sub-tab switch complete: ${subTabName}`);
    }
// END SECTION FOUR
// SECTION FIVE - Kitchen Bridge Help Content
    /**
     * Kitchen Bridge Help Content - Comprehensive and Compact
     */
    getKitchenBridgeHelp() {
        return `
            <div style="max-width: 600px; margin: 0 auto;">
                <!-- Header Section -->
                <div style="
                    background: linear-gradient(135deg, #e8f5e8 0%, #d4edda 100%);
                    padding: 20px;
                    border-radius: 12px;
                    margin-bottom: 24px;
                    border-left: 4px solid #28a745;
                    box-shadow: 0 2px 12px rgba(40, 167, 69, 0.1);
                ">
                    <h2 style="color: #155724; margin: 0 0 12px 0; font-size: 24px; font-weight: 700;">
                        🍳 Kitchen Bridge
                    </h2>
                    <p style="color: #155724; margin: 0; font-size: 14px; line-height: 1.5;">
                        Traditional casual bridge scoring with simple bonuses and penalties. Perfect for home games and learning bridge fundamentals.
                    </p>
                </div>
                
                <!-- Quick Start -->
                <div style="
                    background: linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%);
                    padding: 18px;
                    border-radius: 10px;
                    margin-bottom: 20px;
                    border-left: 4px solid #ffc107;
                ">
                    <h3 style="color: #856404; margin: 0 0 12px 0; font-size: 16px; font-weight: 600;">
                        🚀 Quick Start Guide
                    </h3>
                    <ol style="color: #856404; margin: 0; padding-left: 20px; font-size: 13px;">
                        <li><strong>Set Vulnerability:</strong> Use NV button to cycle through None → NS → EW → Both</li>
                        <li><strong>Enter Contract:</strong> Level (1-7) → Suit (♣♦♥♠NT) → Declarer (NSEW)</li>
                        <li><strong>Add Doubling:</strong> Press X to cycle None/Double/Redouble</li>
                        <li><strong>Enter Result:</strong> Made exactly / Plus overtricks / Down undertricks</li>
                        <li><strong>Next Deal:</strong> Press Deal to continue</li>
                    </ol>
                </div>
                
                <!-- Features Grid -->
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px;">
                    <div style="
                        background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
                        padding: 16px;
                        border-radius: 10px;
                        border-left: 4px solid #2196f3;
                    ">
                        <h4 style="color: #0d47a1; margin: 0 0 8px 0; font-size: 14px; font-weight: 600;">
                            ✨ Key Features
                        </h4>
                        <ul style="color: #1565c0; margin: 0; padding-left: 16px; font-size: 12px;">
                            <li>Standard bridge scoring</li>
                            <li>Manual vulnerability control</li>
                            <li>Simple doubling system</li>
                            <li>Game/part-game bonuses</li>
                        </ul>
                    </div>
                    
                    <div style="
                        background: linear-gradient(135deg, #fce4ec 0%, #f8bbd9 100%);
                        padding: 16px;
                        border-radius: 10px;
                        border-left: 4px solid #e91e63;
                    ">
                        <h4 style="color: #880e4f; margin: 0 0 8px 0; font-size: 14px; font-weight: 600;">
                            🎯 Perfect For
                        </h4>
                        <ul style="color: #ad1457; margin: 0; padding-left: 16px; font-size: 12px;">
                            <li>Casual home games</li>
                            <li>Learning bridge scoring</li>
                            <li>4-player social bridge</li>
                            <li>Quick scoring needs</li>
                        </ul>
                    </div>
                </div>
                
                <!-- Scoring Quick Reference -->
                <div style="
                    background: linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%);
                    padding: 20px;
                    border-radius: 12px;
                    border-left: 4px solid #9c27b0;
                ">
                    <h4 style="color: #4a148c; margin: 0 0 16px 0; font-size: 16px; font-weight: 600;">
                        📊 Quick Scoring Reference
                    </h4>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                        <div>
                            <h5 style="color: #6a1b9a; margin: 0 0 8px 0; font-size: 13px;">Basic Points</h5>
                            <ul style="color: #7b1fa2; margin: 0; padding-left: 16px; font-size: 11px;">
                                <li>Minor suits (♣♦): 20 per trick</li>
                                <li>Major suits (♥♠): 30 per trick</li>
                                <li>No Trump: 30 per trick + 10 bonus</li>
                            </ul>
                        </div>
                        
                        <div>
                            <h5 style="color: #6a1b9a; margin: 0 0 8px 0; font-size: 13px;">Bonuses</h5>
                            <ul style="color: #7b1fa2; margin: 0; padding-left: 16px; font-size: 11px;">
                                <li>Game (100+ pts): +300/500</li>
                                <li>Part-game: +50</li>
                                <li>Double: +50, Redouble: +100</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
// END SECTION FIVE
// SECTION SIX - Chicago Bridge Help Content (Mobile-Optimized with Sub-tabs)
    /**
     * Chicago Bridge Help Content with Sub-tabs - MOBILE OPTIMIZED
     */
    getChicagoBridgeHelp() {
        return `
            <div style="height: 100%;">
                <!-- MOBILE-OPTIMIZED Sub-tab Navigation for Chicago Bridge -->
                <div class="help-sub-tabs" style="
                    display: flex;
                    background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
                    border-bottom: 2px solid #2196f3;
                    margin-bottom: 16px;
                    overflow-x: auto;
                    -webkit-overflow-scrolling: touch;
                    border-radius: 6px;
                    box-shadow: 0 2px 8px rgba(33, 150, 243, 0.1);
                    padding: 0;
                ">
                    <button class="help-sub-tab active" data-subtab="chicago-overview" style="
                        padding: 10px 12px;
                        background: rgba(33, 150, 243, 0.1);
                        border: none;
                        cursor: pointer;
                        font-size: 11px;
                        font-weight: 700;
                        color: #1976d2;
                        border-bottom: 3px solid #3498db;
                        white-space: nowrap;
                        min-width: 70px;
                        border-radius: 6px 6px 0 0;
                        transition: all 0.3s ease;
                        flex: 1;
                    ">Overview</button>
                    
                    <button class="help-sub-tab" data-subtab="chicago-cycle" style="
                        padding: 10px 12px;
                        background: transparent;
                        border: none;
                        cursor: pointer;
                        font-size: 11px;
                        font-weight: 600;
                        color: #7f8c8d;
                        border-bottom: 3px solid transparent;
                        white-space: nowrap;
                        min-width: 70px;
                        border-radius: 6px 6px 0 0;
                        transition: all 0.3s ease;
                        flex: 1;
                    ">Cycle</button>
                    
                    <button class="help-sub-tab" data-subtab="chicago-strategy" style="
                        padding: 10px 12px;
                        background: transparent;
                        border: none;
                        cursor: pointer;
                        font-size: 11px;
                        font-weight: 600;
                        color: #7f8c8d;
                        border-bottom: 3px solid transparent;
                        white-space: nowrap;
                        min-width: 70px;
                        border-radius: 6px 6px 0 0;
                        transition: all 0.3s ease;
                        flex: 1;
                    ">Strategy</button>
                    
                    <button class="help-sub-tab" data-subtab="chicago-instructions" style="
                        padding: 10px 12px;
                        background: transparent;
                        border: none;
                        cursor: pointer;
                        font-size: 11px;
                        font-weight: 600;
                        color: #7f8c8d;
                        border-bottom: 3px solid transparent;
                        white-space: nowrap;
                        min-width: 70px;
                        border-radius: 6px 6px 0 0;
                        transition: all 0.3s ease;
                        flex: 1;
                    ">Instructions</button>
                </div>
                
                <!-- Sub-tab Content Areas -->
                <div class="help-sub-content-area" style="height: calc(100% - 70px); overflow: visible;">
                    
                    <!-- Overview Tab -->
                    <div class="help-sub-content" data-subcontent="chicago-overview" style="display: block;">
                        <div style="max-width: 100%; margin: 0; padding: 0 8px;">
                            <!-- Enhanced Header -->
                            <div style="
                                background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
                                padding: 20px 16px;
                                border-radius: 10px;
                                margin-bottom: 20px;
                                border-left: 4px solid #2196f3;
                                text-align: center;
                                box-shadow: 0 4px 16px rgba(33, 150, 243, 0.1);
                            ">
                                <h2 style="color: #0d47a1; margin: 0 0 8px 0; font-size: 24px; font-weight: 700;">
                                    🌉 Chicago Bridge
                                </h2>
                                <p style="color: #1565c0; font-size: 14px; margin: 0; font-weight: 500;">
                                    4-Deal Vulnerability Cycle Bridge
                                </p>
                            </div>
                            
                            <!-- What Makes It Special -->
                            <div style="
                                background: linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%);
                                padding: 16px;
                                border-radius: 10px;
                                margin-bottom: 20px;
                                border-left: 4px solid #ff9800;
                                box-shadow: 0 2px 12px rgba(255, 152, 0, 0.1);
                            ">
                                <h3 style="color: #e65100; margin: 0 0 10px 0; font-size: 16px; font-weight: 600;">
                                    ✨ What Makes It Special
                                </h3>
                                <p style="color: #ef6c00; margin: 0; font-size: 13px; line-height: 1.5;">
                                    Chicago Bridge combines standard bridge scoring with a predictable 4-deal vulnerability cycle. 
                                    This creates natural break points and ensures balanced, fair play over multiple deals.
                                </p>
                            </div>
                            
                            <!-- Features Grid - Mobile Stacked -->
                            <div style="display: grid; grid-template-columns: 1fr; gap: 12px;">
                                <div style="
                                    background: linear-gradient(135deg, #e8f5e8 0%, #c8e6c8 100%);
                                    padding: 16px;
                                    border-radius: 8px;
                                    border-left: 4px solid #4caf50;
                                    box-shadow: 0 2px 8px rgba(76, 175, 80, 0.1);
                                ">
                                    <h4 style="color: #1b5e20; margin: 0 0 10px 0; font-size: 14px; font-weight: 600;">
                                        🎯 Key Features
                                    </h4>
                                    <ul style="color: #2e7d32; margin: 0; padding-left: 16px; font-size: 12px; line-height: 1.4;">
                                        <li>Automatic vulnerability rotation</li>
                                        <li>Dealer advances each deal</li>
                                        <li>Natural 4-deal break points</li>
                                        <li>Standard bridge scoring</li>
                                    </ul>
                                </div>
                                
                                <div style="
                                    background: linear-gradient(135deg, #fce4ec 0%, #f8bbd9 100%);
                                    padding: 16px;
                                    border-radius: 8px;
                                    border-left: 4px solid #e91e63;
                                    box-shadow: 0 2px 8px rgba(233, 30, 99, 0.1);
                                ">
                                    <h4 style="color: #880e4f; margin: 0 0 10px 0; font-size: 14px; font-weight: 600;">
                                        👥 Perfect For
                                    </h4>
                                    <ul style="color: #ad1457; margin: 0; padding-left: 16px; font-size: 12px; line-height: 1.4;">
                                        <li>Social bridge clubs</li>
                                        <li>Teaching vulnerability strategy</li>
                                        <li>Timed sessions</li>
                                        <li>Fair competition</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Cycle Tab -->
                    <div class="help-sub-content" data-subcontent="chicago-cycle" style="display: none;">
                        <div style="max-width: 100%; margin: 0; padding: 0 8px;">
                            <h3 style="color: #1976d2; margin: 0 0 16px 0; font-size: 18px; font-weight: 600; text-align: center;">
                                🔄 The 4-Deal Vulnerability Cycle
                            </h3>
                            
                            <!-- Cycle Benefits -->
                            <div style="
                                background: linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%);
                                padding: 16px;
                                border-radius: 10px;
                                border-left: 4px solid #ff9800;
                                text-align: center;
                                margin-bottom: 16px;
                            ">
                                <h4 style="color: #e65100; margin: 0 0 10px 0; font-size: 14px; font-weight: 600;">
                                    🎯 How It Works
                                </h4>
                                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; margin: 12px 0;">
                                    <div style="background: rgba(255,255,255,0.8); padding: 10px; border-radius: 6px;">
                                        <div style="font-weight: bold; color: #666; font-size: 12px;">Deal 1</div>
                                        <div style="font-size: 10px; color: #2c3e50;">North deals</div>
                                        <div style="color: #666; font-size: 9px;">None vulnerable</div>
                                    </div>
                                    <div style="background: rgba(255,255,255,0.8); padding: 10px; border-radius: 6px;">
                                        <div style="font-weight: bold; color: #28a745; font-size: 12px;">Deal 2</div>
                                        <div style="font-size: 10px; color: #2c3e50;">East deals</div>
                                        <div style="color: #28a745; font-size: 9px;">NS vulnerable</div>
                                    </div>
                                    <div style="background: rgba(255,255,255,0.8); padding: 10px; border-radius: 6px;">
                                        <div style="font-weight: bold; color: #dc3545; font-size: 12px;">Deal 3</div>
                                        <div style="font-size: 10px; color: #2c3e50;">South deals</div>
                                        <div style="color: #dc3545; font-size: 9px;">EW vulnerable</div>
                                    </div>
                                    <div style="background: rgba(255,255,255,0.8); padding: 10px; border-radius: 6px;">
                                        <div style="font-weight: bold; color: #fd7e14; font-size: 12px;">Deal 4</div>
                                        <div style="font-size: 10px; color: #2c3e50;">West deals</div>
                                        <div style="color: #fd7e14; font-size: 9px;">Both vulnerable</div>
                                    </div>
                                </div>
                                <p style="color: #ef6c00; margin: 0; font-size: 11px;">
                                    Everyone gets to be dealer • All vulnerability conditions • Natural break points
                                </p>
                            </div>
                            
                            <!-- Cycle Advantages - Mobile Stacked -->
                            <div style="display: grid; grid-template-columns: 1fr; gap: 12px;">
                                <div style="
                                    background: linear-gradient(135deg, #e8f5e8 0%, #c8e6c8 100%);
                                    padding: 16px;
                                    border-radius: 8px;
                                    border-left: 4px solid #4caf50;
                                ">
                                    <h4 style="color: #1b5e20; margin: 0 0 10px 0; font-size: 14px; font-weight: 600;">
                                        ⚡ Automatic Features
                                    </h4>
                                    <ul style="color: #2e7d32; margin: 0; padding-left: 16px; font-size: 12px; line-height: 1.4;">
                                        <li>Vulnerability sets automatically</li>
                                        <li>Dealer rotates clockwise</li>
                                        <li>Cycle counter tracks progress</li>
                                        <li>No manual adjustments needed</li>
                                    </ul>
                                </div>
                                
                                <div style="
                                    background: linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%);
                                    padding: 16px;
                                    border-radius: 8px;
                                    border-left: 4px solid #9c27b0;
                                ">
                                    <h4 style="color: #4a148c; margin: 0 0 10px 0; font-size: 14px; font-weight: 600;">
                                        🎲 Fair Play
                                    </h4>
                                    <ul style="color: #6a1b9a; margin: 0; padding-left: 16px; font-size: 12px; line-height: 1.4;">
                                        <li>Everyone deals once per cycle</li>
                                        <li>Equal vulnerability exposure</li>
                                        <li>Balanced risk/reward</li>
                                        <li>Predictable structure</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Strategy Tab -->
                    <div class="help-sub-content" data-subcontent="chicago-strategy" style="display: none;">
                        <div style="max-width: 100%; margin: 0; padding: 0 8px;">
                            <h3 style="color: #1976d2; margin: 0 0 16px 0; font-size: 18px; font-weight: 600; text-align: center;">
                                🎯 Vulnerability Strategy
                            </h3>
                            
                            <!-- Mobile Stacked Strategy Cards -->
                            <div style="display: grid; grid-template-columns: 1fr; gap: 16px; margin-bottom: 20px;">
                                <div style="
                                    background: linear-gradient(135deg, #e8f5e8 0%, #c8e6c8 100%);
                                    padding: 16px;
                                    border-radius: 10px;
                                    border-left: 4px solid #28a745;
                                    box-shadow: 0 3px 12px rgba(40, 167, 69, 0.1);
                                ">
                                    <h4 style="color: #155724; margin: 0 0 10px 0; font-size: 14px; font-weight: 600;">
                                        ✅ When Not Vulnerable
                                    </h4>
                                    <ul style="color: #1e7e34; margin: 0; padding-left: 16px; font-size: 12px; line-height: 1.4;">
                                        <li>Bid aggressively</li>
                                        <li>Light game bids acceptable</li>
                                        <li>Preempt freely</li>
                                        <li>Sacrifice against games</li>
                                        <li>Take calculated risks</li>
                                    </ul>
                                </div>
                                
                                <div style="
                                    background: linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%);
                                    padding: 16px;
                                    border-radius: 10px;
                                    border-left: 4px solid #f44336;
                                    box-shadow: 0 3px 12px rgba(244, 67, 54, 0.1);
                                ">
                                    <h4 style="color: #b71c1c; margin: 0 0 10px 0; font-size: 14px; font-weight: 600;">
                                        ⚠️ When Vulnerable
                                    </h4>
                                    <ul style="color: #c62828; margin: 0; padding-left: 16px; font-size: 12px; line-height: 1.4;">
                                        <li>Bid more conservatively</li>
                                        <li>Need solid values for games</li>
                                        <li>Careful with preempts</li>
                                        <li>Avoid risky sacrifices</li>
                                        <li>Focus on making contracts</li>
                                    </ul>
                                </div>
                            </div>
                            
                            <!-- Strategic Planning -->
                            <div style="
                                background: linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%);
                                padding: 16px;
                                border-radius: 10px;
                                border-left: 4px solid #9c27b0;
                                box-shadow: 0 3px 12px rgba(156, 39, 176, 0.1);
                                text-align: center;
                                margin-bottom: 16px;
                            ">
                                <h4 style="color: #4a148c; margin: 0 0 10px 0; font-size: 14px; font-weight: 600;">
                                    📋 Planning Ahead
                                </h4>
                                <p style="color: #6a1b9a; margin: 0; font-size: 12px; line-height: 1.4;">
                                    Since vulnerability is predictable, you can plan your strategy for upcoming deals. 
                                    Use non-vulnerable deals to take risks and vulnerable deals to bid solid contracts.
                                </p>
                            </div>
                            
                            <!-- Vulnerability Table - Mobile Optimized -->
                            <div style="
                                background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
                                padding: 16px;
                                border-radius: 10px;
                                border-left: 4px solid #2196f3;
                            ">
                                <h4 style="color: #0d47a1; margin: 0 0 10px 0; font-size: 14px; font-weight: 600;">
                                    📊 Vulnerability Effects
                                </h4>
                                <div style="display: grid; grid-template-columns: 1fr; gap: 8px; font-size: 11px;">
                                    <div style="background: rgba(255,255,255,0.7); padding: 8px; border-radius: 4px;">
                                        <strong style="color: #1976d2;">Game Bonus:</strong> Not Vul: +300 | Vul: +500
                                    </div>
                                    <div style="background: rgba(255,255,255,0.7); padding: 8px; border-radius: 4px;">
                                        <strong style="color: #1976d2;">Down 1:</strong> Not Vul: -50 | Vul: -100
                                    </div>
                                    <div style="background: rgba(255,255,255,0.7); padding: 8px; border-radius: 4px;">
                                        <strong style="color: #1976d2;">Down 1 Doubled:</strong> Not Vul: -100 | Vul: -200
                                    </div>
                                    <div style="background: rgba(255,255,255,0.7); padding: 8px; border-radius: 4px;">
                                        <strong style="color: #1976d2;">Slam Bonus:</strong> Small: +500/750 | Grand: +1000/1500
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Instructions Tab -->
                    <div class="help-sub-content" data-subcontent="chicago-instructions" style="display: none;">
                        <div style="max-width: 100%; margin: 0; padding: 0 8px;">
                            <h3 style="color: #1976d2; margin: 0 0 16px 0; font-size: 18px; font-weight: 600; text-align: center;">
                                📖 How to Use Chicago Bridge
                            </h3>
                            
                            <div style="
                                background: linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%);
                                padding: 16px;
                                border-radius: 10px;
                                margin-bottom: 20px;
                                border-left: 4px solid #ff9800;
                            ">
                                <h4 style="color: #e65100; margin: 0 0 12px 0; font-size: 14px; font-weight: 600;">
                                    📝 Step-by-Step Instructions
                                </h4>
                                <ol style="color: #ef6c00; margin: 0; padding-left: 18px; font-size: 12px; line-height: 1.5;">
                                    <li><strong>Automatic Setup:</strong> Dealer and vulnerability are set automatically</li>
                                    <li><strong>Enter Contract:</strong> Level → Suit → Declarer → Result</li>
                                    <li><strong>Observe Display:</strong> Shows current vulnerability and dealer</li>
                                    <li><strong>Score Deal:</strong> Points calculated with vulnerability bonuses</li>
                                    <li><strong>Next Deal:</strong> Vulnerability and dealer advance automatically</li>
                                    <li><strong>Track Progress:</strong> Cycle counter shows position (1/4, 2/4, etc.)</li>
                                </ol>
                            </div>
                            
                            <!-- Mobile Stacked Controls -->
                            <div style="display: grid; grid-template-columns: 1fr; gap: 16px; margin-bottom: 16px;">
                                <div style="
                                    background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
                                    padding: 16px;
                                    border-radius: 8px;
                                    border-left: 4px solid #2196f3;
                                ">
                                    <h5 style="color: #0d47a1; margin: 0 0 10px 0; font-size: 13px; font-weight: 600;">
                                        🔄 Key Differences
                                    </h5>
                                    <ul style="color: #1565c0; margin: 0; padding-left: 16px; font-size: 11px; line-height: 1.3;">
                                        <li>No manual vulnerability control</li>
                                        <li>Automatic dealer rotation</li>
                                        <li>Cycle tracking display</li>
                                        <li>Natural break points</li>
                                    </ul>
                                </div>
                                
                                <div style="
                                    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
                                    padding: 16px;
                                    border-radius: 8px;
                                    border-left: 4px solid #6c757d;
                                ">
                                    <h5 style="color: #495057; margin: 0 0 10px 0; font-size: 13px; font-weight: 600;">
                                        🎮 Controls
                                    </h5>
                                    <ul style="color: #6c757d; margin: 0; padding-left: 16px; font-size: 11px; line-height: 1.3;">
                                        <li>Vuln button shows current state</li>
                                        <li>Deal button advances cycle</li>
                                        <li>Help shows this guide</li>
                                        <li>Quit shows options/scores</li>
                                    </ul>
                                </div>
                            </div>
                            
                            <!-- Quick Reference Card - Mobile Optimized -->
                            <div style="
                                background: linear-gradient(135deg, #e8f5e8 0%, #c8e6c8 100%);
                                padding: 16px;
                                border-radius: 10px;
                                border-left: 4px solid #4caf50;
                                text-align: center;
                            ">
                                <h4 style="color: #1b5e20; margin: 0 0 10px 0; font-size: 14px; font-weight: 600;">
                                    🎯 Quick Reference
                                </h4>
                                <div style="display: grid; grid-template-columns: 1fr; gap: 8px; font-size: 10px;">
                                    <div style="background: rgba(255,255,255,0.8); padding: 8px; border-radius: 4px;">
                                        <strong style="color: #2e7d32;">Contract Entry:</strong> Level + Suit + Declarer + X (if doubled)
                                    </div>
                                    <div style="background: rgba(255,255,255,0.8); padding: 8px; border-radius: 4px;">
                                        <strong style="color: #2e7d32;">Result Entry:</strong> = (made) or number down
                                    </div>
                                    <div style="background: rgba(255,255,255,0.8); padding: 8px; border-radius: 4px;">
                                        <strong style="color: #2e7d32;">Overtricks:</strong> + followed by number
                                    </div>
                                    <div style="background: rgba(255,255,255,0.8); padding: 8px; border-radius: 4px;">
                                        <strong style="color: #2e7d32;">New Cycle:</strong> Starts after Deal 4 completes
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
// END SECTION SIX
// SECTION SEVEN - Bonus, Rubber, and Duplicate Bridge Help Content
    /**
     * Bonus Bridge Help Content - Placeholder for future enhancement
     */
    getBonusBridgeHelp() {
        return `
            <div style="max-width: 600px; margin: 0 auto;">
                <div style="
                    background: linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%);
                    padding: 24px;
                    border-radius: 12px;
                    margin-bottom: 24px;
                    border-left: 4px solid #ff9800;
                    text-align: center;
                    box-shadow: 0 4px 16px rgba(255, 152, 0, 0.1);
                ">
                    <h2 style="color: #e65100; margin: 0 0 8px 0; font-size: 28px; font-weight: 700;">
                        ⭐ Bonus Bridge
                    </h2>
                    <p style="color: #ef6c00; font-size: 14px; margin: 0; font-weight: 500;">
                        An enhanced scoring system that rewards both declarers and defenders based on hand strength and performance versus expectations.
                    </p>
                </div>
                
                <!-- Key Features -->
                <div style="margin-bottom: 24px;">
                    <h3 style="color: #e65100; margin: 0 0 16px 0; font-size: 18px; font-weight: 600;">
                        Key Features
                    </h3>
                    <ul style="color: #5d4037; margin: 0; padding-left: 20px; font-size: 13px; line-height: 1.6;">
                        <li><strong>HCP Balance:</strong> Evaluates point distribution between teams</li>
                        <li><strong>Performance Analysis:</strong> Compares expected vs. actual tricks</li>
                        <li><strong>Contract Ambition:</strong> Rewards appropriate bidding choices</li>
                        <li><strong>Distribution Points:</strong> Accounts for shapely hands</li>
                    </ul>
                </div>
                
                <!-- How it Works -->
                <div style="
                    background: linear-gradient(135deg, #e8f5e8 0%, #c8e6c8 100%);
                    padding: 20px;
                    border-radius: 12px;
                    margin-bottom: 24px;
                    border-left: 4px solid #4caf50;
                    box-shadow: 0 2px 12px rgba(76, 175, 80, 0.1);
                ">
                    <h3 style="color: #1b5e20; margin: 0 0 12px 0; font-size: 18px; font-weight: 600;">
                        How it Works
                    </h3>
                    <p style="color: #2e7d32; margin: 0; font-size: 13px; line-height: 1.6;">
                        After each deal, enter the HCP and distribution for declarer/dummy and defenders. 
                        The system calculates expected performance and adjusts scores based on actual results.
                    </p>
                </div>
                
                <!-- Coming Soon -->
                <div style="
                    background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
                    padding: 20px;
                    border-radius: 12px;
                    border-left: 4px solid #2196f3;
                    text-align: center;
                ">
                    <h4 style="color: #0d47a1; margin: 0 0 12px 0; font-size: 16px; font-weight: 600;">
                        🚧 Enhanced Content Coming Soon
                    </h4>
                    <p style="color: #1565c0; margin: 0; font-size: 13px; line-height: 1.5;">
                        Detailed sub-tabs with HCP analysis, performance metrics, and scoring examples will be added in the next update.
                    </p>
                </div>
            </div>
        `;
    }
    
    /**
     * Rubber Bridge Help Content - Comprehensive but Compact
     */
    getRubberBridgeHelp() {
        return `
            <div style="max-width: 600px; margin: 0 auto;">
                <!-- Header Section -->
                <div style="
                    background: linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%);
                    padding: 24px;
                    border-radius: 12px;
                    margin-bottom: 24px;
                    border-left: 4px solid #9c27b0;
                    text-align: center;
                    box-shadow: 0 4px 16px rgba(156, 39, 176, 0.1);
                ">
                    <h2 style="color: #4a148c; margin: 0 0 8px 0; font-size: 28px; font-weight: 700;">
                        🎯 Rubber Bridge
                    </h2>
                    <p style="color: #6a1b9a; font-size: 16px; margin: 0; font-weight: 500;">
                        Classic bridge as played for over 100 years
                    </p>
                </div>
                
                <!-- The Classic Experience -->
                <div style="
                    background: linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%);
                    padding: 20px;
                    border-radius: 12px;
                    margin-bottom: 24px;
                    border-left: 4px solid #ff9800;
                    box-shadow: 0 2px 12px rgba(255, 152, 0, 0.1);
                ">
                    <h3 style="color: #e65100; margin: 0 0 12px 0; font-size: 18px; font-weight: 600;">
                        🏛️ The Classic Bridge Experience
                    </h3>
                    <p style="color: #ef6c00; margin: 0; font-size: 14px; line-height: 1.6;">
                        Rubber Bridge is the traditional form of bridge played in homes and clubs worldwide. 
                        Games accumulate toward "rubber" victories, with vulnerability determined by previous 
                        game results rather than predetermined cycles.
                    </p>
                </div>
                
                <!-- How Rubber Bridge Works -->
                <div style="margin-bottom: 24px;">
                    <h3 style="color: #4a148c; margin: 0 0 20px 0; font-size: 20px; font-weight: 600; text-align: center;">
                        ⚙️ How Rubber Bridge Works
                    </h3>
                    
                    <div style="display: grid; grid-template-columns: 1fr; gap: 16px;">
                        <!-- Game Accumulation -->
                        <div style="
                            background: linear-gradient(135deg, #e8f5e8 0%, #c8e6c8 100%);
                            padding: 18px;
                            border-radius: 10px;
                            border-left: 4px solid #4caf50;
                        ">
                            <h4 style="color: #1b5e20; margin: 0 0 12px 0; font-size: 16px; font-weight: 600;">
                                🎯 Game Accumulation
                            </h4>
                            <ul style="color: #2e7d32; margin: 0; padding-left: 18px; font-size: 13px; line-height: 1.5;">
                                <li>Contracts scoring 100+ points below the line = <strong>Game</strong></li>
                                <li>First to win <strong>2 games</strong> wins the rubber</li>
                                <li>Rubber bonuses: 700 points (2-0) or 500 points (2-1)</li>
                            </ul>
                        </div>
                        
                        <!-- Vulnerability and Part-Scores -->
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                            <div style="
                                background: linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%);
                                padding: 18px;
                                border-radius: 10px;
                                border-left: 4px solid #f44336;
                            ">
                                <h4 style="color: #b71c1c; margin: 0 0 12px 0; font-size: 14px; font-weight: 600;">
                                    🛡️ Vulnerability
                                </h4>
                                <ul style="color: #c62828; margin: 0; padding-left: 18px; font-size: 11px; line-height: 1.4;">
                                    <li><strong>Not Vul:</strong> Haven't won a game</li>
                                    <li><strong>Vulnerable:</strong> Won one game</li>
                                    <li>Affects penalties and bonuses</li>
                                </ul>
                            </div>
                            
                            <div style="
                                background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
                                padding: 18px;
                                border-radius: 10px;
                                border-left: 4px solid #2196f3;
                            ">
                                <h4 style="color: #0d47a1; margin: 0 0 12px 0; font-size: 14px; font-weight: 600;">
                                    📝 Part-Scores
                                </h4>
                                <ul style="color: #1565c0; margin: 0; padding-left: 18px; font-size: 11px; line-height: 1.4;">
                                    <li>Contracts under 100 points</li>
                                    <li>Can combine to make game</li>
                                    <li>Wiped out by opponent's game</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Rubber Completion -->
                <div style="
                    background: linear-gradient(135deg, #e8f5e8 0%, #c8e6c8 100%);
                    padding: 20px;
                    border-radius: 12px;
                    border-left: 4px solid #4caf50;
                    box-shadow: 0 2px 12px rgba(76, 175, 80, 0.1);
                    text-align: center;
                ">
                    <h3 style="color: #1b5e20; margin: 0 0 16px 0; font-size: 18px; font-weight: 600;">
                        🏆 Rubber Completion
                    </h3>
                    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin: 12px 0;">
                        <div style="background: rgba(255,255,255,0.8); padding: 12px; border-radius: 8px;">
                            <div style="font-weight: bold; color: #1b5e20;">2-0 Rubber</div>
                            <div style="color: #2e7d32; font-size: 12px;">+700 bonus</div>
                        </div>
                        <div style="background: rgba(255,255,255,0.8); padding: 12px; border-radius: 8px;">
                            <div style="font-weight: bold; color: #1b5e20;">2-1 Rubber</div>
                            <div style="color: #2e7d32; font-size: 12px;">+500 bonus</div>
                        </div>
                    </div>
                    <p style="color: #2e7d32; margin: 8px 0 0 0; font-size: 12px;">
                        Unfinished rubber: +300 • Part-score bonus: +100
                    </p>
                </div>
            </div>
        `;
    }
    
    /**
     * Duplicate Bridge Help Content - Tournament Focus
     */
    getDuplicateBridgeHelp() {
        return `
            <div style="max-width: 600px; margin: 0 auto;">
                <!-- Header Section -->
                <div style="
                    background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
                    padding: 24px;
                    border-radius: 12px;
                    margin-bottom: 24px;
                    border-left: 4px solid #2196f3;
                    text-align: center;
                    box-shadow: 0 4px 16px rgba(33, 150, 243, 0.1);
                ">
                    <h2 style="color: #0d47a1; margin: 0 0 8px 0; font-size: 28px; font-weight: 700;">
                        ♦ Duplicate Bridge
                    </h2>
                    <p style="color: #1565c0; font-size: 16px; margin: 0; font-weight: 500;">
                        Competitive bridge with matchpoint and IMP scoring
                    </p>
                </div>
                
                <!-- Tournament Bridge Excellence -->
                <div style="
                    background: linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%);
                    padding: 20px;
                    border-radius: 12px;
                    margin-bottom: 24px;
                    border-left: 4px solid #ff9800;
                    box-shadow: 0 2px 12px rgba(255, 152, 0, 0.1);
                ">
                    <h3 style="color: #e65100; margin: 0 0 12px 0; font-size: 18px; font-weight: 600;">
                        🏆 Tournament Bridge Excellence
                    </h3>
                    <p style="color: #ef6c00; margin: 0; font-size: 14px; line-height: 1.6;">
                        Duplicate Bridge eliminates the luck factor by having multiple pairs play the same hands. 
                        Your results are compared only against others who played identical cards, making skill 
                        the primary determinant of success.
                    </p>
                </div>
                
                <!-- Scoring Methods -->
                <div style="margin-bottom: 24px;">
                    <h3 style="color: #0d47a1; margin: 0 0 20px 0; font-size: 20px; font-weight: 600; text-align: center;">
                        📊 Scoring Methods
                    </h3>
                    
                    <!-- Scoring Grid -->
                    <div style="display: grid; grid-template-columns: 1fr; gap: 16px;">
                        <!-- Matchpoint Scoring -->
                        <div style="
                            background: linear-gradient(135deg, #e8f5e8 0%, #c8e6c8 100%);
                            padding: 18px;
                            border-radius: 10px;
                            border-left: 4px solid #28a745;
                        ">
                            <h4 style="color: #155724; margin: 0 0 12px 0; font-size: 16px; font-weight: 600;">
                                🎯 Matchpoint Scoring
                            </h4>
                            <ul style="color: #1e7e34; margin: 0; padding-left: 18px; font-size: 13px; line-height: 1.5;">
                                <li>Compare your result to all other pairs on same hand</li>
                                <li>Beat someone = 2 matchpoints, tie = 1 matchpoint</li>
                                <li>Emphasis on <strong>beating the field</strong>, not big scores</li>
                                <li>Perfect for club games and sectionals</li>
                            </ul>
                        </div>
                        
                        <!-- IMP and BAM -->
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                            <div style="
                                background: linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%);
                                padding: 18px;
                                border-radius: 10px;
                                border-left: 4px solid #f44336;
                            ">
                                <h4 style="color: #b71c1c; margin: 0 0 12px 0; font-size: 14px; font-weight: 600;">
                                    🌟 IMP Scoring
                                </h4>
                                <ul style="color: #c62828; margin: 0; padding-left: 18px; font-size: 11px; line-height: 1.4;">
                                    <li>Point differences → IMPs</li>
                                    <li>Large swings worth more</li>
                                    <li>Used in team matches</li>
                                    <li>Rewards games and slams</li>
                                </ul>
                            </div>
                            
                            <div style="
                                background: linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%);
                                padding: 18px;
                                border-radius: 10px;
                                border-left: 4px solid #9c27b0;
                            ">
                                <h4 style="color: #4a148c; margin: 0 0 12px 0; font-size: 14px; font-weight: 600;">
                                    ⚖️ Board-a-Match
                                </h4>
                                <ul style="color: #6a1b9a; margin: 0; padding-left: 18px; font-size: 11px; line-height: 1.4;">
                                    <li>Win = 1, Tie = ½, Lose = 0</li>
                                    <li>Every board equal weight</li>
                                    <li>Used in some team events</li>
                                    <li>Simple scoring system</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Key Concepts -->
                <div style="margin-bottom: 24px;">
                    <h3 style="color: #0d47a1; margin: 0 0 16px 0; font-size: 18px; font-weight: 600; text-align: center;">
                        🔑 Key Concepts
                    </h3>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                        <div style="
                            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
                            padding: 16px;
                            border-radius: 10px;
                            border-left: 4px solid #6c757d;
                        ">
                            <h4 style="color: #495057; margin: 0 0 10px 0; font-size: 14px; font-weight: 600;">
                                🛡️ Vulnerability
                            </h4>
                            <ul style="color: #6c757d; margin: 0; padding-left: 16px; font-size: 11px; line-height: 1.4;">
                                <li>Pre-determined by board</li>
                                <li>Same for all pairs</li>
                                <li>16-board cycle repeats</li>
                                <li>Fair distribution</li>
                            </ul>
                        </div>
                        
                        <div style="
                            background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
                            padding: 16px;
                            border-radius: 10px;
                            border-left: 4px solid #2196f3;
                        ">
                            <h4 style="color: #0d47a1; margin: 0 0 10px 0; font-size: 14px; font-weight: 600;">
                                🎯 Strategy
                            </h4>
                            <ul style="color: #1565c0; margin: 0; padding-left: 16px; font-size: 11px; line-height: 1.4;">
                                <li><strong>MPs:</strong> Compete for part-scores</li>
                                <li><strong>IMPs:</strong> Bid games/slams</li>
                                <li>Overtricks matter more in MPs</li>
                                <li>Safety plays vary by format</li>
                            </ul>
                        </div>
                    </div>
                </div>
                
                <!-- Perfect For -->
                <div style="
                    background: linear-gradient(135deg, #e8f5e8 0%, #c8e6c8 100%);
                    padding: 20px;
                    border-radius: 12px;
                    border-left: 4px solid #4caf50;
                    box-shadow: 0 2px 12px rgba(76, 175, 80, 0.1);
                    text-align: center;
                ">
                    <h4 style="color: #1b5e20; margin: 0 0 12px 0; font-size: 16px; font-weight: 600;">
                        🎯 Perfect For
                    </h4>
                    <ul style="color: #2e7d32; margin: 0; padding-left: 18px; font-size: 13px; line-height: 1.5; text-align: left;">
                        <li>Competitive tournament players</li>
                        <li>Club duplicate games</li>
                        <li>Learning advanced bidding and play</li>
                        <li>Fair comparison of skill levels</li>
                        <li>Serious bridge improvement</li>
                        <li>Team competitions and championships</li>
                    </ul>
                </div>
            </div>
        `;
    }
// END SECTION SEVEN
// SECTION EIGHT - Cleanup and Export
    /**
     * Close the help system
     */
    close() {
        this.isVisible = false;
        this.currentTab = 'kitchen';
        
        // Remove modal if it exists
        const modal = document.querySelector('.modal-overlay');
        if (modal && modal.parentNode) {
            modal.parentNode.removeChild(modal);
        }
        
        // Restore body scroll
        document.body.classList.remove('modal-open');
        
        console.log('📚 Enhanced help system closed');
    }
    
    /**
     * Get current tab for external reference
     */
    getCurrentTab() {
        return this.currentTab;
    }
    
    /**
     * Check if help system is currently visible
     */
    isHelpVisible() {
        return this.isVisible;
    }
}

// Enhanced global help system instance with diagnostics
let globalBridgeHelp = null;

/**
 * Initialize global help system with diagnostics - DIRECT MODE OPENING
 */
function initializeBridgeHelp(bridgeApp) {
    console.log('🚀 initializeBridgeHelp called with:', typeof bridgeApp);
    
    if (!globalBridgeHelp) {
        try {
            globalBridgeHelp = new BridgeHelpSystem(bridgeApp);
            console.log('✅ Enhanced Global Bridge Help System initialized successfully');
            
            // Add to window for debugging
            window.globalBridgeHelp = globalBridgeHelp;
            
        } catch (error) {
            console.error('❌ Failed to initialize Enhanced Bridge Help System:', error);
            return null;
        }
    }
    return globalBridgeHelp;
}

/**
 * Show help for specific bridge mode - DIRECT MODE OPENING
 * THIS IS THE KEY FEATURE: When Chicago player asks for help, they get Chicago help directly
 */
function showBridgeHelp(modeName = 'kitchen') {
    console.log(`📚 showBridgeHelp called for mode: ${modeName}`);
    
    if (globalBridgeHelp) {
        globalBridgeHelp.show(modeName);
    } else {
        console.error('❌ Enhanced Bridge Help System not initialized');
        // Try to initialize if not already done
        if (typeof window.bridgeApp !== 'undefined') {
            console.log('🔄 Attempting to initialize help system...');
            const newHelp = initializeBridgeHelp(window.bridgeApp);
            if (newHelp) {
                newHelp.show(modeName);
            }
        }
    }
}

// Export for module system
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { BridgeHelpSystem, initializeBridgeHelp, showBridgeHelp };
} else if (typeof window !== 'undefined') {
    window.BridgeHelpSystem = BridgeHelpSystem;
    window.initializeBridgeHelp = initializeBridgeHelp;
    window.showBridgeHelp = showBridgeHelp;
    
    // Add diagnostic function to window
    window.checkBridgeHelpStatus = function() {
        return {
            scriptLoaded: typeof BridgeHelpSystem !== 'undefined',
            functionExists: typeof initializeBridgeHelp !== 'undefined',
            globalInstance: !!globalBridgeHelp,
            diagnostics: typeof diagnoseBridgeHelp !== 'undefined' ? diagnoseBridgeHelp() : 'No diagnostics'
        };
    };
}

console.log('✅ Enhanced Bridge Help System loaded successfully with diagnostics and direct mode opening');

// Run diagnostics on load
setTimeout(() => {
    if (typeof diagnoseBridgeHelp === 'function') {
        console.log('🔍 Running post-load diagnostics...');
        diagnoseBridgeHelp();
    }
}, 500);
// END SECTION EIGHT - FILE COMPLETE