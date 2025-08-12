/**
 * Enhanced Bridge Help System - COMPLETE WORKING VERSION
 * Copy this entire file and replace your current bridge-help.js
 */

console.log('🚀 Loading Enhanced Bridge Help System...');

// Diagnostic function
window.diagnoseBridgeHelp = function() {
    console.log('🔍 BRIDGE HELP DIAGNOSTICS:');
    console.log('- BridgeHelpSystem exists:', typeof BridgeHelpSystem !== 'undefined');
    console.log('- Global bridge help:', typeof window.globalBridgeHelp);
    
    return {
        scriptLoaded: typeof BridgeHelpSystem !== 'undefined',
        functionExists: typeof initializeBridgeHelp !== 'undefined'
    };
};

class BridgeHelpSystem {
    constructor(bridgeApp) {
        this.bridgeApp = bridgeApp;
        this.currentTab = 'kitchen';
        this.isVisible = false;
        
        console.log('📚 Enhanced Bridge Help System initialized');
    }
    
    show(modeName = 'kitchen') {
        console.log(`📚 Showing ENHANCED help for: ${modeName}`);
        
        this.currentTab = modeName.toLowerCase();
        this.isVisible = true;
        
        const helpContent = this.buildHelpInterface();
        
        this.bridgeApp.showModal('🃏 Bridge Scoring Help', helpContent, [
            { text: '✅ Close Help', action: () => this.close() }
        ]);
        
        setTimeout(() => {
            try {
                this.setupHelpInterface();
                this.showTab(this.currentTab);
                console.log(`✅ Enhanced help opened to: ${this.currentTab}`);
            } catch (error) {
                console.error('❌ Error setting up help interface:', error);
            }
        }, 150);
    }
    
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
                border-radius: 12px;
                box-shadow: 0 8px 32px rgba(0,0,0,0.1);
            ">
                <!-- Tab Navigation -->
                <div class="help-tabs" style="
                    display: flex;
                    background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
                    border-radius: 12px 12px 0 0;
                    flex-shrink: 0;
                    overflow-x: auto;
                ">
                    <button class="help-tab" data-tab="kitchen" style="
                        flex: 1;
                        padding: 16px 12px;
                        background: none;
                        border: none;
                        cursor: pointer;
                        color: rgba(255,255,255,0.85);
                        border-bottom: 3px solid transparent;
                        transition: all 0.3s ease;
                        min-width: 110px;
                    ">
                        <div style="display: flex; flex-direction: column; align-items: center; gap: 4px;">
                            <span style="font-size: 16px;">🍳</span>
                            <span style="font-size: 11px;">Kitchen</span>
                        </div>
                    </button>
                    
                    <button class="help-tab" data-tab="chicago" style="
                        flex: 1;
                        padding: 16px 12px;
                        background: none;
                        border: none;
                        cursor: pointer;
                        color: rgba(255,255,255,0.85);
                        border-bottom: 3px solid transparent;
                        transition: all 0.3s ease;
                        min-width: 110px;
                    ">
                        <div style="display: flex; flex-direction: column; align-items: center; gap: 4px;">
                            <span style="font-size: 16px;">🌉</span>
                            <span style="font-size: 11px;">Chicago</span>
                        </div>
                    </button>
                    
                    <button class="help-tab" data-tab="bonus" style="
                        flex: 1;
                        padding: 16px 12px;
                        background: none;
                        border: none;
                        cursor: pointer;
                        color: rgba(255,255,255,0.85);
                        border-bottom: 3px solid transparent;
                        transition: all 0.3s ease;
                        min-width: 110px;
                    ">
                        <div style="display: flex; flex-direction: column; align-items: center; gap: 4px;">
                            <span style="font-size: 16px;">⭐</span>
                            <span style="font-size: 11px;">Bonus</span>
                        </div>
                    </button>
                    
                    <button class="help-tab" data-tab="rubber" style="
                        flex: 1;
                        padding: 16px 12px;
                        background: none;
                        border: none;
                        cursor: pointer;
                        color: rgba(255,255,255,0.85);
                        border-bottom: 3px solid transparent;
                        transition: all 0.3s ease;
                        min-width: 110px;
                    ">
                        <div style="display: flex; flex-direction: column; align-items: center; gap: 4px;">
                            <span style="font-size: 16px;">🎯</span>
                            <span style="font-size: 11px;">Rubber</span>
                        </div>
                    </button>
                    
                    <button class="help-tab" data-tab="duplicate" style="
                        flex: 1;
                        padding: 16px 12px;
                        background: none;
                        border: none;
                        cursor: pointer;
                        color: rgba(255,255,255,0.85);
                        border-bottom: 3px solid transparent;
                        transition: all 0.3s ease;
                        min-width: 110px;
                    ">
                        <div style="display: flex; flex-direction: column; align-items: center; gap: 4px;">
                            <span style="font-size: 16px;">♦</span>
                            <span style="font-size: 11px;">Duplicate</span>
                        </div>
                    </button>
                </div>
                
                <!-- Tab Content Area -->
                <div class="help-content-area" style="
                    flex: 1;
                    overflow: hidden;
                    position: relative;
                    background: white;
                    border-radius: 0 0 12px 12px;
                ">
                    <!-- Kitchen Bridge Help -->
                    <div class="help-tab-content" data-content="kitchen" style="
                        position: absolute;
                        top: 0;
                        left: 0;
                        right: 0;
                        bottom: 0;
                        padding: 20px;
                        overflow-y: auto;
                        display: none;
                    ">
                        ${this.getKitchenBridgeHelp()}
                    </div>
                    
                    <!-- Chicago Bridge Help -->
                    <div class="help-tab-content" data-content="chicago" style="
                        position: absolute;
                        top: 0;
                        left: 0;
                        right: 0;
                        bottom: 0;
                        padding: 20px;
                        overflow-y: auto;
                        display: none;
                    ">
                        ${this.getChicagoBridgeHelp()}
                    </div>
                    
                    <!-- Bonus Bridge Help -->
                    <div class="help-tab-content" data-content="bonus" style="
                        position: absolute;
                        top: 0;
                        left: 0;
                        right: 0;
                        bottom: 0;
                        padding: 20px;
                        overflow-y: auto;
                        display: none;
                    ">
                        <h2 style="color: #e65100;">⭐ Bonus Bridge</h2>
                        <p>Enhanced scoring system that rewards skill over luck.</p>
                    </div>
                    
                    <!-- Rubber Bridge Help -->
                    <div class="help-tab-content" data-content="rubber" style="
                        position: absolute;
                        top: 0;
                        left: 0;
                        right: 0;
                        bottom: 0;
                        padding: 20px;
                        overflow-y: auto;
                        display: none;
                    ">
                        <h2 style="color: #4a148c;">🎯 Rubber Bridge</h2>
                        <p>Classic bridge as played for over 100 years.</p>
                    </div>
                    
                    <!-- Duplicate Bridge Help -->
                    <div class="help-tab-content" data-content="duplicate" style="
                        position: absolute;
                        top: 0;
                        left: 0;
                        right: 0;
                        bottom: 0;
                        padding: 20px;
                        overflow-y: auto;
                        display: none;
                    ">
                        <h2 style="color: #0d47a1;">♦ Duplicate Bridge</h2>
                        <p>Tournament bridge with matchpoint scoring.</p>
                    </div>
                </div>
            </div>
        `;
    }
    
    setupHelpInterface() {
        const modal = document.querySelector('.modal-overlay');
        if (!modal) return;
        
        console.log('📚 Setting up help interface...');
        
        const tabs = modal.querySelectorAll('.help-tab');
        tabs.forEach((tab) => {
            const tabName = tab.getAttribute('data-tab');
            
            // Remove existing listeners
            const newTab = tab.cloneNode(true);
            tab.parentNode.replaceChild(newTab, tab);
            
            // Add click handler
            newTab.addEventListener('click', (e) => {
                e.preventDefault();
                console.log(`📚 Tab clicked: ${tabName}`);
                this.showTab(tabName);
            });
        });
    }
    
    showTab(tabName) {
        console.log(`📚 Switching to tab: ${tabName}`);
        
        const modal = document.querySelector('.modal-overlay');
        if (!modal) return;
        
        // Update tab appearance
        const tabs = modal.querySelectorAll('.help-tab');
        const contents = modal.querySelectorAll('.help-tab-content');
        
        tabs.forEach(tab => {
            const isActive = tab.getAttribute('data-tab') === tabName;
            
            if (isActive) {
                tab.style.borderBottomColor = '#3498db';
                tab.style.backgroundColor = 'rgba(255,255,255,0.15)';
                tab.style.color = '#ffffff';
            } else {
                tab.style.borderBottomColor = 'transparent';
                tab.style.backgroundColor = 'transparent';
                tab.style.color = 'rgba(255,255,255,0.85)';
            }
        });
        
        // Show/hide content
        contents.forEach(content => {
            const shouldShow = content.getAttribute('data-content') === tabName;
            content.style.display = shouldShow ? 'block' : 'none';
            if (shouldShow) {
                content.scrollTop = 0;
            }
        });
        
        this.currentTab = tabName;
    }
    
    getKitchenBridgeHelp() {
        return `
            <div style="max-width: 600px; margin: 0 auto;">
                <div style="
                    background: linear-gradient(135deg, #e8f5e8 0%, #d4edda 100%);
                    padding: 20px;
                    border-radius: 12px;
                    margin-bottom: 24px;
                    border-left: 4px solid #28a745;
                ">
                    <h2 style="color: #155724; margin: 0 0 12px 0;">🍳 Kitchen Bridge</h2>
                    <p style="color: #155724; margin: 0; font-size: 14px;">
                        Traditional casual bridge scoring with simple bonuses and penalties.
                    </p>
                </div>
                
                <div style="
                    background: #fff3cd;
                    padding: 18px;
                    border-radius: 10px;
                    margin-bottom: 20px;
                    border-left: 4px solid #ffc107;
                ">
                    <h3 style="color: #856404; margin: 0 0 12px 0;">🚀 Quick Start</h3>
                    <ol style="color: #856404; margin: 0; padding-left: 20px;">
                        <li>Set vulnerability using NV button</li>
                        <li>Enter contract: Level → Suit → Declarer</li>
                        <li>Add doubling with X button</li>
                        <li>Enter result (made/down)</li>
                        <li>Press Deal to continue</li>
                    </ol>
                </div>
            </div>
        `;
    }
    
    getChicagoBridgeHelp() {
        return `
            <div style="max-width: 600px; margin: 0 auto;">
                <div style="
                    background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
                    padding: 24px;
                    border-radius: 12px;
                    margin-bottom: 24px;
                    border-left: 4px solid #2196f3;
                    text-align: center;
                ">
                    <h2 style="color: #0d47a1; margin: 0 0 8px 0;">🌉 Chicago Bridge</h2>
                    <p style="color: #1565c0; font-size: 16px; margin: 0;">
                        4-Deal Vulnerability Cycle Bridge
                    </p>
                </div>
                
                <div style="
                    background: #fff3e0;
                    padding: 20px;
                    border-radius: 12px;
                    margin-bottom: 24px;
                    border-left: 4px solid #ff9800;
                ">
                    <h3 style="color: #e65100; margin: 0 0 12px 0;">🔄 The 4-Deal Cycle</h3>
                    <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px;">
                        <div style="background: rgba(255,255,255,0.8); padding: 12px; border-radius: 8px; text-align: center;">
                            <div style="font-weight: bold;">Deal 1</div>
                            <div style="font-size: 12px; color: #2c3e50;">North deals</div>
                            <div style="color: #666; font-size: 11px;">None vulnerable</div>
                        </div>
                        <div style="background: rgba(255,255,255,0.8); padding: 12px; border-radius: 8px; text-align: center;">
                            <div style="font-weight: bold; color: #28a745;">Deal 2</div>
                            <div style="font-size: 12px; color: #2c3e50;">East deals</div>
                            <div style="color: #28a745; font-size: 11px;">NS vulnerable</div>
                        </div>
                        <div style="background: rgba(255,255,255,0.8); padding: 12px; border-radius: 8px; text-align: center;">
                            <div style="font-weight: bold; color: #dc3545;">Deal 3</div>
                            <div style="font-size: 12px; color: #2c3e50;">South deals</div>
                            <div style="color: #dc3545; font-size: 11px;">EW vulnerable</div>
                        </div>
                        <div style="background: rgba(255,255,255,0.8); padding: 12px; border-radius: 8px; text-align: center;">
                            <div style="font-weight: bold; color: #fd7e14;">Deal 4</div>
                            <div style="font-size: 12px; color: #2c3e50;">West deals</div>
                            <div style="color: #fd7e14; font-size: 11px;">Both vulnerable</div>
                        </div>
                    </div>
                </div>
                
                <div style="
                    background: #f3e5f5;
                    padding: 20px;
                    border-radius: 12px;
                    border-left: 4px solid #9c27b0;
                ">
                    <h3 style="color: #4a148c; margin: 0 0 12px 0;">📋 Key Features</h3>
                    <ul style="color: #6a1b9a; margin: 0; padding-left: 18px;">
                        <li>Automatic vulnerability rotation</li>
                        <li>Dealer advances each deal</li>
                        <li>Natural 4-deal break points</li>
                        <li>Standard bridge scoring with vulnerability bonuses</li>
                    </ul>
                </div>
            </div>
        `;
    }
    
    close() {
        this.isVisible = false;
        this.currentTab = 'kitchen';
        
        const modal = document.querySelector('.modal-overlay');
        if (modal && modal.parentNode) {
            modal.parentNode.removeChild(modal);
        }
        
        document.body.classList.remove('modal-open');
        console.log('📚 Help system closed');
    }
    
    getCurrentTab() {
        return this.currentTab;
    }
    
    isHelpVisible() {
        return this.isVisible;
    }
}

// Global help system instance
let globalBridgeHelp = null;

function initializeBridgeHelp(bridgeApp) {
    console.log('🚀 initializeBridgeHelp called');
    
    if (!globalBridgeHelp) {
        try {
            globalBridgeHelp = new BridgeHelpSystem(bridgeApp);
            console.log('✅ Bridge Help System initialized successfully');
            window.globalBridgeHelp = globalBridgeHelp;
        } catch (error) {
            console.error('❌ Failed to initialize Bridge Help System:', error);
            return null;
        }
    }
    return globalBridgeHelp;
}

function showBridgeHelp(modeName = 'kitchen') {
    console.log(`📚 showBridgeHelp called for mode: ${modeName}`);
    
    if (globalBridgeHelp) {
        globalBridgeHelp.show(modeName);
    } else {
        console.error('❌ Bridge Help System not initialized');
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
    
    window.checkBridgeHelpStatus = function() {
        return {
            scriptLoaded: typeof BridgeHelpSystem !== 'undefined',
            functionExists: typeof initializeBridgeHelp !== 'undefined',
            globalInstance: !!globalBridgeHelp,
            diagnostics: typeof diagnoseBridgeHelp !== 'undefined' ? diagnoseBridgeHelp() : 'No diagnostics'
        };
    };
}

console.log('✅ Enhanced Bridge Help System loaded successfully');