/**
 * Bridge Modes Calculator - Main Application Controller
 * Handles mode selection, UI coordination, and bridge mode management
 */

import { UIController } from './ui-controller.js';
import { GameState } from './utils/game-state.js';

class BridgeApp {
    constructor() {
        this.currentMode = null;
        this.bridgeModeInstance = null;
        this.gameState = new GameState();
        this.ui = new UIController();
        
        // App state management
        this.appState = 'mode_selection';
        this.availableModes = {
            '1': { name: 'kitchen', display: 'Kitchen Bridge', module: './bridge-modes/kitchen.js' },
            '2': { name: 'bonus', display: 'Bonus Bridge', module: './bridge-modes/bonus.js' },
            '3': { name: 'chicago', display: 'Chicago Bridge', module: './bridge-modes/chicago.js' },
            '4': { name: 'rubber', display: 'Rubber Bridge', module: './bridge-modes/rubber.js' },
            '5': { name: 'duplicate', display: 'Duplicate Bridge', module: './bridge-modes/duplicate.js' }
        };
        
        this.init();
    }
    
    /**
     * Initialize the application
     */
    async init() {
        console.log('🎮 Initializing Bridge Calculator App');
        
        try {
            // Initialize UI controller
            await this.ui.init();
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Initialize display
            this.updateDisplay();
            
            console.log('✅ Bridge Calculator App ready');
            
        } catch (error) {
            console.error('❌ Failed to initialize Bridge Calculator:', error);
            throw error;
        }
    }
    
    /**
     * Setup all event listeners
     */
    setupEventListeners() {
        // Button clicks
        document.addEventListener('click', (event) => {
            const button = event.target.closest('.btn');
            if (button && !button.classList.contains('disabled')) {
                this.handleButtonClick(button.dataset.value);
            }
            
            // Control bar clicks
            if (event.target.closest('#wakeControl')) this.ui.toggleKeepAwake();
            else if (event.target.closest('#vulnControl')) this.handleVulnerabilityToggle();
            else if (event.target.closest('#honorsControl')) this.handleHonorsClick(); // NEW
            else if (event.target.closest('#helpControl')) this.showHelp();
            else if (event.target.closest('#quitControl')) this.showQuit();
        });
        
        // Keyboard support (optional enhancement)
        document.addEventListener('keydown', (event) => {
            this.handleKeyPress(event);
        });
    }
    
    /**
     * Handle button clicks based on current state
     */
    async handleButtonClick(value) {
        console.log(`🎯 Button pressed: ${value} in state: ${this.appState}`);
        
        try {
            if (this.appState === 'mode_selection') {
                await this.handleModeSelection(value);
            } else if (value === 'BACK') {
                this.handleBack();
            } else {
                // Handle bridge mode actions
                await this.handleBridgeModeAction(value);
            }
            
            this.updateDisplay();
            
        } catch (error) {
            console.error('Error handling button click:', error);
            this.ui.showError(`Error: ${error.message}`);
        }
    }
    
    /**
     * Handle bridge mode actions - SIMPLIFIED VERSION
     */
    async handleBridgeModeAction(value) {
        console.log('🎯 Bridge action:', value, 'Mode:', this.currentMode);
        
        // Simple delegation - let rubber bridge handle everything
        if (this.bridgeModeInstance) {
            this.bridgeModeInstance.handleAction(value);
        }
    }
    
    /**
     * Handle honors button click - NEW METHOD
     */
    handleHonorsClick() {
        console.log('🏅 Honors button clicked');
        if (this.bridgeModeInstance && this.currentMode === 'rubber') {
            this.bridgeModeInstance.handleAction('HONORS');
        }
    }
    
    /**
     * Handle mode selection (1-5)
     */
    async handleModeSelection(value) {
        const modeConfig = this.availableModes[value];
        if (!modeConfig) return;
        
        console.log(`🎲 Loading ${modeConfig.display}...`);
        
        try {
            // Show loading state
            this.ui.showLoading(`Loading ${modeConfig.display}...`);
            
            // Dynamic import of bridge mode
            const { default: BridgeMode } = await import(modeConfig.module);
            
            // Initialize the bridge mode
            this.bridgeModeInstance = new BridgeMode(this.gameState, this.ui);
            this.currentMode = modeConfig.name;
            this.gameState.setMode(modeConfig.name);
            
            // Transition to bridge mode
            this.appState = 'bridge_mode';
            
            console.log(`✅ ${modeConfig.display} loaded successfully`);
            
        } catch (error) {
            console.error(`❌ Failed to load ${modeConfig.display}:`, error);
            
            // Fallback to Kitchen Bridge if available, otherwise show error
            if (value !== '1') {
                this.ui.showError(`${modeConfig.display} not available yet. Loading Kitchen Bridge...`);
                setTimeout(() => this.handleModeSelection('1'), 2000);
            } else {
                throw new Error(`Kitchen Bridge failed to load: ${error.message}`);
            }
        }
    }
    
    /**
     * Handle back navigation
     */
    handleBack() {
        if (this.bridgeModeInstance && this.bridgeModeInstance.canGoBack()) {
            // Let bridge mode handle its own back navigation
            this.bridgeModeInstance.handleBack();
        } else {
            // Return to mode selection
            this.returnToModeSelection();
        }
    }
    
    /**
     * Return to main mode selection
     */
    returnToModeSelection() {
        console.log('🔄 Returning to mode selection');
        
        // Clean up current mode
        if (this.bridgeModeInstance) {
            this.bridgeModeInstance.cleanup?.();
            this.bridgeModeInstance = null;
        }
        
        // Reset state
        this.currentMode = null;
        this.appState = 'mode_selection';
        this.gameState.reset();
        
        // Reset UI
        this.ui.reset();
        this.updateDisplay();
    }
    
    /**
     * Handle vulnerability toggle
     */
    handleVulnerabilityToggle() {
        if (this.bridgeModeInstance) {
            this.bridgeModeInstance.toggleVulnerability();
        }
    }
    
    /**
     * Handle keyboard input
     */
    handleKeyPress(event) {
        // Prevent default for handled keys
        const key = event.key;
        
        if (['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'].includes(key)) {
            event.preventDefault();
            this.handleButtonClick(key);
        } else if (key === 'Backspace' || key === 'Escape') {
            event.preventDefault();
            this.handleButtonClick('BACK');
        } else if (key === 'Enter' || key === ' ') {
            event.preventDefault();
            // Context-sensitive action
            if (this.appState === 'mode_selection') {
                this.handleButtonClick('1'); // Default to Kitchen Bridge
            }
        }
    }
    
    /**
     * Update the main display
     */
    updateDisplay() {
        if (this.appState === 'mode_selection') {
            this.updateModeSelectionDisplay();
        } else if (this.bridgeModeInstance) {
            // Bridge mode handles its own display
            this.bridgeModeInstance.updateDisplay();
        }
        
        // Update button states
        this.updateButtonStates();
    }
    
    /**
     * Update display for mode selection
     */
    updateModeSelectionDisplay() {
        const content = `
            <div class="title-score-row">
                <div class="mode-title">Bridge Modes Calculator</div>
                <div class="score-display">
                    NS: ${this.gameState.getScore('NS')}<br>
                    EW: ${this.gameState.getScore('EW')}
                </div>
            </div>
            <div class="game-content">
                <div>Select scoring mode:<br>
                1-Kitchen  2-Bonus  3-Chicago  4-Rubber  5-Duplicate</div>
            </div>
            <div class="current-state">Press 1-5 to select mode</div>
        `;
        
        this.ui.updateDisplay(content);
    }
    
    /**
     * Update button states - SIMPLIFIED VERSION
     */
    updateButtonStates() {
        let activeButtons = [];
        
        if (this.appState === 'mode_selection') {
            activeButtons = ['1', '2', '3', '4', '5'];
        } else if (this.bridgeModeInstance) {
            // Get active buttons from bridge mode
            activeButtons = this.bridgeModeInstance.getActiveButtons();
            
            // Always allow back navigation (except when specified by mode)
            if (this.bridgeModeInstance.canGoBack && this.bridgeModeInstance.canGoBack()) {
                if (!activeButtons.includes('BACK')) {
                    activeButtons.push('BACK');
                }
            }
        }
        
        console.log('🎮 Active buttons:', activeButtons);
        this.ui.updateButtonStates(activeButtons);
    }
    
    /**
     * Show help modal
     */
    showHelp() {
        let helpContent;
        
        if (this.bridgeModeInstance) {
            helpContent = this.bridgeModeInstance.getHelpContent();
        } else {
            helpContent = this.getMainHelpContent();
        }
        
        this.ui.showModal('help', helpContent);
    }
    
    /**
     * Show quit options - UPDATED WITH IMPROVED CLOSE APP
     */
    showQuit() {
        const quitContent = {
            title: 'Exit Bridge Calculator',
            content: 'What would you like to do?',
            buttons: [
                { 
                    text: 'Show Scores', 
                    action: () => {
                        console.log('Show Scores clicked');
                        this.showScoreHistory();
                    }, 
                    class: 'modal-button',
                    style: 'background: #3498db !important;'
                },
                { 
                    text: 'Return to Menu', 
                    action: () => {
                        console.log('Return to Menu clicked');
                        this.returnToModeSelection();
                    }, 
                    class: 'menu-btn modal-button' 
                },
                { 
                    text: 'Close App', 
                    action: () => {
                        console.log('Close App clicked');
                        this.showCloseAppInstructions(); // UPDATED - Professional alert instead of modal
                    }, 
                    class: 'close-app-btn modal-button' 
                },
                { 
                    text: 'Cancel', 
                    action: 'close', 
                    class: 'close-btn modal-button' 
                }
            ]
        };
        
        this.ui.showModal('quit', quitContent);
    }
    
    /**
     * Show professional close app instructions - SIMPLE ALERT VERSION
     */
    showCloseAppInstructions() {
        console.log('📱 Showing professional close instructions');
        
        // Release wake lock before showing instructions
        this.ui.releaseWakeLock();
        
        // Simple alert version that definitely works
        const isPWA = window.navigator.standalone || window.matchMedia('(display-mode: standalone)').matches;
        const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        let message = '';
        if (isPWA || isMobile) {
            message = `📱 Close Bridge Calculator

On Mobile/Tablet:
• Use your device's app switcher and swipe up to close
• Press home button to minimize the app

On Desktop:
• Close this browser tab or window

✅ Your scores are automatically saved!
You can safely close the app anytime.`;
        } else {
            message = `💻 Close Bridge Calculator

To close the app:
• Close this browser tab or window
• Or switch to another browser tab

✅ Your progress is automatically saved!
You can return anytime by bookmarking this page.`;
        }
        
        alert(message);
        
        // Close the quit modal
        this.ui.closeModal();
    }
    
    /**
     * Show comprehensive score history
     */
    showScoreHistory() {
        console.log('📊 Creating score history modal...');
        
        try {
            // Remove any existing modals
            const existingModals = document.querySelectorAll('.modal-overlay, .score-modal');
            existingModals.forEach(modal => modal.remove());
            
            // Create modal directly
            const modal = document.createElement('div');
            modal.className = 'score-modal';
            modal.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100vw;
                height: 100vh;
                background: rgba(0, 0, 0, 0.9);
                z-index: 999999;
                display: flex;
                justify-content: center;
                align-items: center;
                font-family: Arial, sans-serif;
            `;
            
            const history = this.gameState.getHistory();
            const scores = this.gameState.getScores();
            
            let content = `
                <div style="
                    background: white;
                    color: black;
                    padding: 30px;
                    border-radius: 10px;
                    max-width: 80vw;
                    max-height: 80vh;
                    overflow-y: auto;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.5);
                ">
                    <h2 style="color: #e74c3c; margin-bottom: 20px; text-align: center;">
                        🃏 Score History - ${this.getModeDisplayName(this.currentMode)}
                    </h2>
                    
                    <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
                        <h3 style="color: #2c3e50; margin-bottom: 10px;">Current Scores</h3>
                        <div style="display: flex; justify-content: space-between;">
                            <div><strong>North-South: ${scores.NS} points</strong></div>
                            <div><strong>East-West: ${scores.EW} points</strong></div>
                        </div>
                        <div style="text-align: center; margin-top: 10px; font-weight: bold; color: #27ae60;">
                            Total Deals Played: ${history.length}
                        </div>
                    </div>
            `;
            
            if (history.length > 0) {
                content += `
                    <div style="margin-bottom: 20px;">
                        <h3 style="color: #2c3e50; margin-bottom: 15px;">Deal History</h3>
                        <div style="max-height: 300px; overflow-y: auto; border: 1px solid #ddd;">
                            <table style="width: 100%; border-collapse: collapse;">
                                <thead style="background: #e9ecef; position: sticky; top: 0;">
                                    <tr>
                                        <th style="padding: 10px; text-align: left; border-bottom: 2px solid #ddd;">Deal</th>
                                        <th style="padding: 10px; text-align: left; border-bottom: 2px solid #ddd;">Contract</th>
                                        <th style="padding: 10px; text-align: center; border-bottom: 2px solid #ddd;">Result</th>
                                        <th style="padding: 10px; text-align: right; border-bottom: 2px solid #ddd;">Score</th>
                                        <th style="padding: 10px; text-align: center; border-bottom: 2px solid #ddd;">Winner</th>
                                    </tr>
                                </thead>
                                <tbody>
                `;
                
                history.forEach((entry, index) => {
                    try {
                        const contract = entry.contract || {};
                        const level = contract.level || '?';
                        const suit = contract.suit || '?';
                        const doubled = contract.doubled || '';
                        const declarer = contract.declarer || '?';
                        const result = contract.result || '?';
                        
                        const contractStr = `${level}${suit}${doubled}`;
                        
                        let score = 0;
                        let actualScore = 0;
                        
                        if (typeof entry.score === 'number' && !isNaN(entry.score)) {
                            score = entry.score;
                            actualScore = entry.actualScore || Math.abs(score);
                        } else if (typeof entry.actualScore === 'number' && !isNaN(entry.actualScore)) {
                            actualScore = entry.actualScore;
                            score = entry.scoringSide ? actualScore : -actualScore;
                        } else {
                            actualScore = 50;
                            score = actualScore;
                        }
                        
                        const scoringSide = entry.scoringSide || (['N', 'S'].includes(declarer) ? 'NS' : 'EW');
                        
                        const resultColor = score >= 0 ? '#27ae60' : '#e74c3c';
                        const resultText = result === '=' ? 'Made exactly' : 
                                          result.toString().startsWith('+') ? `Made +${result.substring(1)}` : 
                                          result.toString().startsWith('-') ? `Down ${result.substring(1)}` : result;
                        
                        content += `
                            <tr style="border-bottom: 1px solid #eee; ${index % 2 === 0 ? 'background: #f8f9fa;' : ''}">
                                <td style="padding: 8px; font-weight: bold;">${entry.deal}</td>
                                <td style="padding: 8px;">
                                    <strong>${contractStr}</strong> by <span style="color: #f39c12;">${declarer}</span>
                                </td>
                                <td style="padding: 8px; text-align: center; color: ${resultColor}; font-weight: bold;">
                                    ${resultText}
                                </td>
                                <td style="padding: 8px; text-align: right; font-weight: bold; color: #2c3e50;">
                                    +${actualScore}
                                </td>
                                <td style="padding: 8px; text-align: center; font-weight: bold; color: #3498db;">
                                    ${scoringSide}
                                </td>
                            </tr>
                        `;
                    } catch (entryError) {
                        console.error('Error processing history entry:', entryError, entry);
                    }
                });
                
                content += `
                                </tbody>
                            </table>
                        </div>
                    </div>
                `;
            } else {
                content += `
                    <div style="text-align: center; padding: 40px; color: #7f8c8d;">
                        <h3>No deals completed yet</h3>
                        <p>Start playing to see your score history here!</p>
                    </div>
                `;
            }
            
            content += `
                    <div style="text-align: center; margin-top: 20px;">
                        <button onclick="this.closest('.score-modal').remove(); window.bridgeApp.showQuit();" 
                                style="background: #3498db; color: white; border: none; padding: 12px 24px; 
                                       border-radius: 5px; font-size: 16px; margin-right: 10px; cursor: pointer;">
                            Back to Quit Menu
                        </button>
                        <button onclick="this.closest('.score-modal').remove();" 
                                style="background: #95a5a6; color: white; border: none; padding: 12px 24px; 
                                       border-radius: 5px; font-size: 16px; cursor: pointer;">
                            Close
                        </button>
                    </div>
                </div>
            `;
            
            modal.innerHTML = content;
            
            // Close on background click
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.remove();
                }
            });
            
            document.body.appendChild(modal);
            console.log('✅ Score history modal created successfully');
            
        } catch (error) {
            console.error('❌ Error creating score history:', error);
            alert('Error showing score history. Check console for details.');
        }
    }
    
    /**
     * Get mode display name helper
     */
    getModeDisplayName(mode) {
        const names = {
            'kitchen': 'Kitchen Bridge',
            'bonus': 'Bonus Bridge',
            'chicago': 'Chicago Bridge',
            'rubber': 'Rubber Bridge',
            'duplicate': 'Duplicate Bridge'
        };
        return names[mode] || 'Bridge Calculator';
    }
    
    /**
     * Get main help content
     */
    getMainHelpContent() {
        return {
            title: 'Bridge Modes Calculator Help',
            content: `
                <div class="help-section">
                    <h4>Available Bridge Modes</h4>
                    <ul>
                        <li><strong>Kitchen Bridge (1):</strong> Simplified social scoring</li>
                        <li><strong>Bonus Bridge (2):</strong> HCP-based bonus system</li>
                        <li><strong>Chicago Bridge (3):</strong> 4-deal vulnerability cycle</li>
                        <li><strong>Rubber Bridge (4):</strong> Traditional rubber scoring</li>
                        <li><strong>Duplicate Bridge (5):</strong> Tournament-style scoring</li>
                    </ul>
                </div>
                
                <div class="help-section">
                    <h4>How to Use</h4>
                    <ol>
                        <li>Select a bridge mode (1-5)</li>
                        <li>Follow the prompts to enter contracts</li>
                        <li>Use Back button to navigate</li>
                        <li>Use Quit to return to menu or exit</li>
                    </ol>
                </div>
                
                <div class="help-section">
                    <h4>Controls</h4>
                    <ul>
                        <li><strong>Wake:</strong> Keep screen active</li>
                        <li><strong>Vuln:</strong> Vulnerability indicator/control</li>
                        <li><strong>Honors:</strong> Claim honor bonuses (Rubber Bridge)</li>
                        <li><strong>Help:</strong> Context-sensitive help</li>
                        <li><strong>Quit:</strong> Exit options</li>
                    </ul>
                </div>
            `,
            buttons: [
                { text: 'Close Help', action: 'close', class: 'close-btn' }
            ]
        };
    }
    
    /**
     * Get current mode name for external access
     */
    getCurrentMode() {
        return this.currentMode;
    }
    
    /**
     * Get current app state for external access
     */
    getAppState() {
        return this.appState;
    }
}

// Export the main class and make it globally accessible
export { BridgeApp };

// Make BridgeApp available globally for modal buttons
window.BridgeApp = BridgeApp;