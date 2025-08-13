// MINIMAL HELP SYSTEM - Just like your Bonus Bridge example
/**
 * Simple, compact help system that fits in viewport without scrolling
 * Matches the style and compactness of your Bonus Bridge example
 */

console.log('🚀 Loading Minimal Bridge Help System...');

class BridgeHelpSystem {
    constructor(bridgeApp) {
        this.bridgeApp = bridgeApp;
        this.isVisible = false;
        console.log('📚 Minimal Bridge Help System initialized');
    }
    
    show(modeName = 'kitchen') {
        console.log(`📚 Showing minimal help for: ${modeName}`);
        this.isVisible = true;
        const mode = modeName.toLowerCase();
        
        let helpContent = '';
        let title = '🃏 Bridge Help';
        
        switch (mode) {
            case 'chicago':
                helpContent = this.getChicagoHelpMinimal();
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
            setTimeout(() => this.setupMinimalTabs(), 100);
        }
    }
    
    /**
     * Chicago Bridge help - MINIMAL like Bonus Bridge example
     */
    getChicagoHelpMinimal() {
        return `
            <div style="width: 100%; max-width: 500px; margin: 0 auto;">
                <!-- Simple tab bar -->
                <div style="
                    display: flex; 
                    background: #e3f2fd; 
                    border-radius: 8px; 
                    margin-bottom: 16px; 
                    padding: 4px;
                ">
                    <button class="mini-tab active" data-tab="overview" style="
                        flex: 1; padding: 8px; background: white; border: none; 
                        border-radius: 6px; font-size: 12px; cursor: pointer; font-weight: 600;
                    ">Overview</button>
                    <button class="mini-tab" data-tab="cycle" style="
                        flex: 1; padding: 8px; background: none; border: none; 
                        border-radius: 6px; font-size: 12px; cursor: pointer;
                    ">Cycle</button>
                    <button class="mini-tab" data-tab="strategy" style="
                        flex: 1; padding: 8px; background: none; border: none; 
                        border-radius: 6px; font-size: 12px; cursor: pointer;
                    ">Strategy</button>
                </div>
                
                <!-- Content area -->
                <div style="min-height: 300px;">
                    
                    <!-- Overview -->
                    <div class="mini-content" data-content="overview" style="display: block;">
                        <h3 style="margin: 0 0 12px 0; color: #1976d2;">What is Chicago Bridge?</h3>
                        <p style="margin: 0 0 16px 0; font-size: 14px; line-height: 1.4;">
                            An enhanced scoring system that rewards both declarers and defenders based on hand strength and performance versus expectations.
                        </p>
                        
                        <h4 style="margin: 0 0 8px 0; color: #1976d2; font-size: 16px;">Key Features</h4>
                        <ul style="margin: 0; padding-left: 20px; font-size: 13px;">
                            <li><strong>HCP Balance:</strong> Evaluates point distribution between teams</li>
                            <li><strong>Performance Analysis:</strong> Compares expected vs. actual tricks</li>
                            <li><strong>Contract Ambition:</strong> Rewards appropriate bidding choices</li>
                            <li><strong>Distribution Points:</strong> Accounts for shapely hands</li>
                        </ul>
                        
                        <h4 style="margin: 16px 0 8px 0; color: #1976d2; font-size: 16px;">How it Works</h4>
                        <p style="margin: 0; font-size: 13px; line-height: 1.4;">
                            After each deal, enter the HCP and distribution for declarer/dummy and defenders. 
                            The system calculates expected performance and adjusts scores based on actual results.
                        </p>
                    </div>
                    
                    <!-- Cycle -->
                    <div class="mini-content" data-content="cycle" style="display: none;">
                        <h3 style="margin: 0 0 12px 0; color: #1976d2;">4-Deal Vulnerability Cycle</h3>
                        
                        <div style="
                            display: grid; grid-template-columns: 1fr 1fr; gap: 8px; 
                            margin: 16px 0; background: #f5f5f5; padding: 12px; border-radius: 8px;
                        ">
                            <div style="text-align: center; padding: 8px; background: white; border-radius: 4px;">
                                <div style="font-weight: bold;">Deal 1</div>
                                <div style="font-size: 12px;">North deals</div>
                                <div style="font-size: 12px; color: #666;">None vulnerable</div>
                            </div>
                            <div style="text-align: center; padding: 8px; background: white; border-radius: 4px;">
                                <div style="font-weight: bold; color: #28a745;">Deal 2</div>
                                <div style="font-size: 12px;">East deals</div>
                                <div style="font-size: 12px; color: #28a745;">NS vulnerable</div>
                            </div>
                            <div style="text-align: center; padding: 8px; background: white; border-radius: 4px;">
                                <div style="font-weight: bold; color: #dc3545;">Deal 3</div>
                                <div style="font-size: 12px;">South deals</div>
                                <div style="font-size: 12px; color: #dc3545;">EW vulnerable</div>
                            </div>
                            <div style="text-align: center; padding: 8px; background: white; border-radius: 4px;">
                                <div style="font-weight: bold; color: #fd7e14;">Deal 4</div>
                                <div style="font-size: 12px;">West deals</div>
                                <div style="font-size: 12px; color: #fd7e14;">Both vulnerable</div>
                            </div>
                        </div>
                        
                        <h4 style="margin: 0 0 8px 0; color: #1976d2;">Benefits</h4>
                        <ul style="margin: 0; padding-left: 20px; font-size: 13px;">
                            <li>Everyone deals once per cycle</li>
                            <li>Equal vulnerability exposure</li>
                            <li>Natural break points every 4 deals</li>
                            <li>Predictable structure for strategy</li>
                        </ul>
                    </div>
                    
                    <!-- Strategy -->
                    <div class="mini-content" data-content="strategy" style="display: none;">
                        <h3 style="margin: 0 0 12px 0; color: #1976d2;">Vulnerability Strategy</h3>
                        
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin: 16px 0;">
                            <div style="background: #e8f5e8; padding: 12px; border-radius: 8px;">
                                <h4 style="margin: 0 0 8px 0; color: #155724; font-size: 14px;">✅ Not Vulnerable</h4>
                                <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #155724;">
                                    <li>Bid aggressively</li>
                                    <li>Light game bids OK</li>
                                    <li>Preempt freely</li>
                                    <li>Take risks</li>
                                </ul>
                            </div>
                            
                            <div style="background: #ffebee; padding: 12px; border-radius: 8px;">
                                <h4 style="margin: 0 0 8px 0; color: #b71c1c; font-size: 14px;">⚠️ Vulnerable</h4>
                                <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #b71c1c;">
                                    <li>Bid conservatively</li>
                                    <li>Need solid values</li>
                                    <li>Careful with preempts</li>
                                    <li>Focus on making</li>
                                </ul>
                            </div>
                        </div>
                        
                        <div style="background: #f0f8ff; padding: 12px; border-radius: 8px; margin-top: 16px;">
                            <h4 style="margin: 0 0 8px 0; color: #1976d2;">Key Scoring Differences</h4>
                            <p style="margin: 0; font-size: 12px;">
                                <strong>Game Bonus:</strong> Not Vul +300 | Vul +500<br>
                                <strong>Down 1:</strong> Not Vul -50 | Vul -100<br>
                                <strong>Down 1 Doubled:</strong> Not Vul -100 | Vul -200
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    /**
     * Kitchen Bridge help - SIMPLE
     */
    getKitchenHelpMinimal() {
        return `
            <div style="width: 100%; max-width: 400px; margin: 0 auto;">
                <h3 style="margin: 0 0 12px 0; color: #28a745;">What is Kitchen Bridge?</h3>
                <p style="margin: 0 0 16px 0; font-size: 14px;">
                    Traditional casual bridge scoring with simple bonuses and penalties. 
                    Perfect for home games and learning bridge fundamentals.
                </p>
                
                <h4 style="margin: 0 0 8px 0; color: #28a745;">Quick Start</h4>
                <ol style="margin: 0 0 16px 0; padding-left: 20px; font-size: 13px;">
                    <li>Use NV button to set vulnerability</li>
                    <li>Enter: Level → Suit → Declarer</li>
                    <li>Press X for double/redouble</li>
                    <li>Enter result: Made/Plus/Down</li>
                    <li>Press Deal to continue</li>
                </ol>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                    <div style="background: #e3f2fd; padding: 12px; border-radius: 8px;">
                        <h4 style="margin: 0 0 8px 0; color: #1976d2; font-size: 14px;">Features</h4>
                        <ul style="margin: 0; padding-left: 16px; font-size: 12px;">
                            <li>Standard scoring</li>
                            <li>Manual vulnerability</li>
                            <li>Simple doubling</li>
                            <li>Game bonuses</li>
                        </ul>
                    </div>
                    
                    <div style="background: #fce4ec; padding: 12px; border-radius: 8px;">
                        <h4 style="margin: 0 0 8px 0; color: #880e4f; font-size: 14px;">Perfect For</h4>
                        <ul style="margin: 0; padding-left: 16px; font-size: 12px;">
                            <li>Casual games</li>
                            <li>Learning bridge</li>
                            <li>Social bridge</li>
                            <li>Quick scoring</li>
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
                <h3 style="margin: 0 0 12px 0; color: #1976d2;">${info.name}</h3>
                <p style="margin: 0 0 24px 0; color: #666; font-size: 14px;">${info.desc}</p>
                <div style="background: #f5f5f5; padding: 16px; border-radius: 8px; color: #666; font-size: 13px;">
                    Detailed help content coming soon!
                </div>
            </div>
        `;
    }
    
    /**
     * Setup minimal tab functionality
     */
    setupMinimalTabs() {
        const modal = document.querySelector('.modal-overlay');
        if (!modal) return;
        
        const tabs = modal.querySelectorAll('.mini-tab');
        const contents = modal.querySelectorAll('.mini-content');
        
        tabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                e.preventDefault();
                const tabName = tab.getAttribute('data-tab');
                
                // Update tab styles
                tabs.forEach(t => {
                    if (t.getAttribute('data-tab') === tabName) {
                        t.style.background = 'white';
                        t.style.fontWeight = '600';
                        t.classList.add('active');
                    } else {
                        t.style.background = 'none';
                        t.style.fontWeight = 'normal';
                        t.classList.remove('active');
                    }
                });
                
                // Show/hide content
                contents.forEach(content => {
                    content.style.display = 
                        content.getAttribute('data-content') === tabName ? 'block' : 'none';
                });
            });
        });
    }
    
    close() {
        this.isVisible = false;
        const modal = document.querySelector('.modal-overlay');
        if (modal && modal.parentNode) {
            modal.parentNode.removeChild(modal);
        }
        document.body.classList.remove('modal-open');
        console.log('📚 Minimal help system closed');
    }
}

// Global system
let globalBridgeHelp = null;

function initializeBridgeHelp(bridgeApp) {
    if (!globalBridgeHelp) {
        globalBridgeHelp = new BridgeHelpSystem(bridgeApp);
        window.globalBridgeHelp = globalBridgeHelp;
        console.log('✅ Minimal Bridge Help System initialized');
    }
    return globalBridgeHelp;
}

function showBridgeHelp(modeName = 'kitchen') {
    if (globalBridgeHelp) {
        globalBridgeHelp.show(modeName);
    } else if (typeof window.bridgeApp !== 'undefined') {
        const newHelp = initializeBridgeHelp(window.bridgeApp);
        if (newHelp) newHelp.show(modeName);
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

console.log('✅ Minimal Bridge Help System loaded');