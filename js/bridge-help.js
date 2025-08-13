// FIXED TAB HELP SYSTEM - Working tab switching for mobile
/**
 * Simple help system with WORKING tab functionality
 * Fixed event handling and content switching for mobile devices
 */

console.log('🚀 Loading Fixed Tab Bridge Help System...');

class BridgeHelpSystem {
    constructor(bridgeApp) {
        this.bridgeApp = bridgeApp;
        this.isVisible = false;
        console.log('📚 Fixed Tab Bridge Help System initialized');
    }
    
    show(modeName = 'kitchen') {
        console.log(`📚 Showing help for: ${modeName}`);
        this.isVisible = true;
        const mode = modeName.toLowerCase();
        
        let helpContent = '';
        let title = '🃏 Bridge Help';
        
        switch (mode) {
            case 'chicago':
                helpContent = this.getChicagoHelpFixed();
                title = '🌉 Chicago Bridge Help';
                break;
            case 'kitchen':
                helpContent = this.getKitchenHelpMinimal();
                title = '🍳 Kitchen Bridge Help';
                break;
            default:
                helpContent = this.getBasicHelpMinimal(mode);
                title = `🃏 ${mode.charAt(0).toUpperCase() + mode.slice(1)} Bridge Help`;
        }
        
        this.bridgeApp.showModal(title, helpContent, [
            { text: 'Close', action: () => this.close() }
        ]);
        
        if (mode === 'chicago') {
            setTimeout(() => this.setupFixedTabs(), 200);
        }
    }
    
    /**
     * Chicago Bridge help with FIXED tab switching
     */
    getChicagoHelpFixed() {
        return `
            <div style="width: 100%; max-width: 500px; margin: 0 auto;">
                <!-- Fixed tab bar with better mobile support -->
                <div id="tab-container" style="
                    display: flex; 
                    background: #e3f2fd; 
                    border-radius: 8px; 
                    margin-bottom: 16px; 
                    padding: 4px;
                ">
                    <button id="tab-overview" class="help-tab active" onclick="window.switchTab('overview')" style="
                        flex: 1; padding: 10px 8px; background: white; border: none; 
                        border-radius: 6px; font-size: 12px; cursor: pointer; font-weight: 600;
                        color: #1976d2;
                    ">Overview</button>
                    <button id="tab-cycle" class="help-tab" onclick="window.switchTab('cycle')" style="
                        flex: 1; padding: 10px 8px; background: none; border: none; 
                        border-radius: 6px; font-size: 12px; cursor: pointer;
                        color: #666;
                    ">Cycle</button>
                    <button id="tab-strategy" class="help-tab" onclick="window.switchTab('strategy')" style="
                        flex: 1; padding: 10px 8px; background: none; border: none; 
                        border-radius: 6px; font-size: 12px; cursor: pointer;
                        color: #666;
                    ">Strategy</button>
                </div>
                
                <!-- Content area with fixed switching -->
                <div style="min-height: 300px; position: relative;">
                    
                    <!-- Overview Content -->
                    <div id="content-overview" class="tab-content" style="display: block;">
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
                    
                    <!-- Cycle Content -->
                    <div id="content-cycle" class="tab-content" style="display: none;">
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
                    
                    <!-- Strategy Content -->
                    <div id="content-strategy" class="tab-content" style="display: none;">
                        <h3 style="margin: 0 0 16px 0; color: #1976d2; font-size: 18px;">Vulnerability Strategy</h3>
                        
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin: 16px 0;">
                            <div style="background: #e8f5e8; padding: 14px; border-radius: 8px; border-left: 4px solid #28a745;">
                                <h4 style="margin: 0 0 10px 0; color: #155724; font-size: 14px;">✅ Not Vulnerable</h4>
                                <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #155724; line-height: 1.3;">
                                    <li>Bid aggressively</li>
                                    <li>Light game bids OK</li>
                                    <li>Preempt freely</li>
                                    <li>Take calculated risks</li>
                                </ul>
                            </div>
                            
                            <div style="background: #ffebee; padding: 14px; border-radius: 8px; border-left: 4px solid #f44336;">
                                <h4 style="margin: 0 0 10px 0; color: #b71c1c; font-size: 14px;">⚠️ Vulnerable</h4>
                                <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #b71c1c; line-height: 1.3;">
                                    <li>Bid conservatively</li>
                                    <li>Need solid values</li>
                                    <li>Careful with preempts</li>
                                    <li>Focus on making</li>
                                </ul>
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
                </div>
            </div>
        `;
    }
    
    /**
     * Kitchen Bridge help - simple version
     */
    getKitchenHelpMinimal() {
        return `
            <div style="width: 100%; max-width: 400px; margin: 0 auto; padding: 0 16px;">
                <h3 style="margin: 0 0 12px 0; color: #28a745; font-size: 18px;">What is Kitchen Bridge?</h3>
                <p style="margin: 0 0 20px 0; font-size: 14px; line-height: 1.4;">
                    Traditional casual bridge scoring with simple bonuses and penalties. 
                    Perfect for home games and learning bridge fundamentals.
                </p>
                
                <div style="background: #fff3cd; padding: 16px; border-radius: 8px; border-left: 4px solid #ffc107; margin-bottom: 20px;">
                    <h4 style="margin: 0 0 10px 0; color: #856404; font-size: 16px;">🚀 Quick Start</h4>
                    <ol style="margin: 0; padding-left: 20px; font-size: 13px; color: #856404; line-height: 1.4;">
                        <li>Use NV button to cycle vulnerability: None → NS → EW → Both</li>
                        <li>Enter contract: Level → Suit → Declarer</li>
                        <li>Press X for double/redouble (optional)</li>
                        <li>Enter result: Made exactly / Plus overtricks / Down undertricks</li>
                        <li>Press Deal to continue to next hand</li>
                    </ol>
                </div>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                    <div style="background: #e3f2fd; padding: 14px; border-radius: 8px; border-left: 4px solid #2196f3;">
                        <h4 style="margin: 0 0 10px 0; color: #1976d2; font-size: 14px;">✨ Key Features</h4>
                        <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #1976d2; line-height: 1.3;">
                            <li>Standard bridge scoring</li>
                            <li>Manual vulnerability control</li>
                            <li>Simple doubling system</li>
                            <li>Game & part-game bonuses</li>
                        </ul>
                    </div>
                    
                    <div style="background: #fce4ec; padding: 14px; border-radius: 8px; border-left: 4px solid #e91e63;">
                        <h4 style="margin: 0 0 10px 0; color: #880e4f; font-size: 14px;">🎯 Perfect For</h4>
                        <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #880e4f; line-height: 1.3;">
                            <li>Casual home games</li>
                            <li>Learning bridge scoring</li>
                            <li>4-player social bridge</li>
                            <li>Quick & easy scoring</li>
                        </ul>
                    </div>
                </div>
            </div>
        `;
    }
    
    /**
     * Basic help for other modes
     */
    getBasicHelpMinimal(mode) {
        const modeInfo = {
            bonus: { icon: '⭐', name: 'Bonus Bridge', desc: 'Enhanced scoring with HCP analysis' },
            rubber: { icon: '🎯', name: 'Rubber Bridge', desc: 'Classic bridge as played for 100+ years' },
            duplicate: { icon: '♦', name: 'Duplicate Bridge', desc: 'Tournament bridge with matchpoint scoring' }
        };
        
        const info = modeInfo[mode] || { icon: '🃏', name: 'Bridge', desc: 'Bridge scoring system' };
        
        return `
            <div style="text-align: center; padding: 40px 20px;">
                <h2 style="margin: 0 0 16px 0; color: #1976d2; font-size: 32px;">${info.icon}</h2>
                <h3 style="margin: 0 0 12px 0; color: #1976d2; font-size: 20px;">${info.name}</h3>
                <p style="margin: 0 0 24px 0; color: #666; font-size: 14px;">${info.desc}</p>
                <div style="background: #f5f5f5; padding: 16px; border-radius: 8px; color: #666; font-size: 13px;">
                    Detailed help content coming soon!
                </div>
            </div>
        `;
    }
    
    /**
     * Setup FIXED tab functionality with multiple event types
     */
    setupFixedTabs() {
        console.log('🔧 Setting up fixed tab functionality...');
        
        // Global function for tab switching (accessible from onclick)
        window.switchTab = (tabName) => {
            console.log(`📱 Switching to tab: ${tabName}`);
            
            // Update tab buttons
            const tabs = ['overview', 'cycle', 'strategy'];
            tabs.forEach(tab => {
                const button = document.getElementById(`tab-${tab}`);
                const content = document.getElementById(`content-${tab}`);
                
                if (button && content) {
                    if (tab === tabName) {
                        // Active tab
                        button.style.background = 'white';
                        button.style.fontWeight = '600';
                        button.style.color = '#1976d2';
                        button.classList.add('active');
                        content.style.display = 'block';
                    } else {
                        // Inactive tab
                        button.style.background = 'none';
                        button.style.fontWeight = 'normal';
                        button.style.color = '#666';
                        button.classList.remove('active');
                        content.style.display = 'none';
                    }
                }
            });
        };
        
        // Also add touch event listeners as backup
        const tabs = document.querySelectorAll('.help-tab');
        tabs.forEach(tab => {
            const tabName = tab.id.replace('tab-', '');
            
            // Add touch event
            tab.addEventListener('touchend', (e) => {
                e.preventDefault();
                console.log(`📱 Touch event for tab: ${tabName}`);
                window.switchTab(tabName);
            }, { passive: false });
            
            // Add click event as backup
            tab.addEventListener('click', (e) => {
                e.preventDefault();
                console.log(`🖱️ Click event for tab: ${tabName}`);
                window.switchTab(tabName);
            });
        });
        
        console.log('✅ Fixed tab functionality setup complete');
    }
    
    close() {
        // Clean up global function
        if (window.switchTab) {
            delete window.switchTab;
        }
        
        this.isVisible = false;
        const modal = document.querySelector('.modal-overlay');
        if (modal && modal.parentNode) {
            modal.parentNode.removeChild(modal);
        }
        document.body.classList.remove('modal-open');
        console.log('📚 Fixed help system closed');
    }
}

// Global system
let globalBridgeHelp = null;

function initializeBridgeHelp(bridgeApp) {
    if (!globalBridgeHelp) {
        globalBridgeHelp = new BridgeHelpSystem(bridgeApp);
        window.globalBridgeHelp = globalBridgeHelp;
        console.log('✅ Fixed Tab Bridge Help System initialized');
    }
    return globalBridgeHelp;
}

function showBridgeHelp(modeName = 'kitchen') {
    console.log(`📚 showBridgeHelp called for mode: ${modeName}`);
    
    if (globalBridgeHelp) {
        globalBridgeHelp.show(modeName);
    } else if (typeof window.bridgeApp !== 'undefined') {
        const newHelp = initializeBridgeHelp(window.bridgeApp);
        if (newHelp) newHelp.show(modeName);
    } else {
        console.error('❌ Bridge app not available');
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { BridgeHelpSystem, initializeBridgeHelp, showBridgeHelp };
} else if (typeof window !== 'undefined') {
    window.BridgeHelpSystem = BridgeHelpSystem;
    window.initializeBridgeHelp = initializeBridgeHelp;
    window.showBridgeHelp = showBridgeHelp;
}

console.log('✅ Fixed Tab Bridge Help System loaded successfully');