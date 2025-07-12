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
            } else if (this.bridgeModeInstance) {
                // Delegate to current bridge mode
                this.bridgeModeInstance.handleAction(value);
            }
            
            this.updateDisplay();
            
        } catch (error) {
            console.error('Error handling button click:', error);
            this.ui.showError(`Error: ${error.message}`);
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
     * Update button states based on current context
     */
    updateButtonStates() {
        let activeButtons = [];
        
        if (this.appState === 'mode_selection') {
            activeButtons = ['1', '2', '3', '4', '5'];
        } else if (this.bridgeModeInstance) {
            activeButtons = this.bridgeModeInstance.getActiveButtons();
            // Always allow back in bridge modes
            if (!activeButtons.includes('BACK')) {
                activeButtons.push('BACK');
            }
        }
        
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
     * Show quit options
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
                        this.closeApp();
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
     * Show comprehensive score history
     */
    showScoreHistory() {
        console.log('📊 Creating direct modal bypass...');
        
        // Remove any existing modals
        const existingModals = document.querySelectorAll('.modal-overlay, .score-modal');
        existingModals.forEach(modal => modal.remove());
        
        // Create modal directly without UI Controller
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
                const contract = entry.contract;
                const contractStr = `${contract.level}${contract.suit}${contract.doubled || ''}`;
                const declarer = contract.declarer;
                const result = contract.result;
                const score = entry.score;
                const actualScore = entry.actualScore || Math.abs(score);
                const scoringSide = entry.scoringSide || (['N', 'S'].includes(declarer) ? 'NS' : 'EW');
                
                const resultColor = score >= 0 ? '#27ae60' : '#e74c3c';
                const resultText = result === '=' ? 'Made exactly' : 
                                  result.startsWith('+') ? `Made +${result.substring(1)}` : 
                                  result.startsWith('-') ? `Down ${result.substring(1)}` : result;
                
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
        console.log('✅ Direct modal created and added to body');
        
        // Force focus to ensure visibility
        modal.focus();
    }
    
    /**
     * Show the real score history (after test modal works)
     */
    showRealScoreHistory() {
        const history = this.gameState.getHistory();
        const scores = this.gameState.getScores();
        const currentMode = this.currentMode;
        
        console.log('History entries:', history.length);
        console.log('Current scores:', scores);
        
        if (history.length === 0) {
            console.log('No history found, showing empty state');
            const noHistoryContent = {
                title: 'Score History',
                content: `
                    <div style="text-align: center; padding: 20px;">
                        <p style="font-size: 16px; margin-bottom: 20px;">No deals completed yet.</p>
                        <p style="color: #7f8c8d;">Start playing to see your score history here!</p>
                    </div>
                `,
                buttons: [
                    { 
                        text: 'Back to Quit Menu', 
                        action: () => {
                            console.log('Back to quit from empty history');
                            this.showQuit();
                        }, 
                        class: 'modal-button' 
                    }
                ]
            };
            this.ui.showModal('history', noHistoryContent);
            return;
        }
        
        // Simple history for now
        let historyText = '<div style="padding: 20px;">';
        historyText += `<h3>Score History (${history.length} deals)</h3>`;
        historyText += `<p><strong>Current Scores:</strong></p>`;
        historyText += `<p>NS: ${scores.NS} points</p>`;
        historyText += `<p>EW: ${scores.EW} points</p>`;
        historyText += '<h4>Recent Deals:</h4>';
        
        history.slice(-5).forEach((entry, index) => {
            const contract = `${entry.contract.level}${entry.contract.suit}${entry.contract.doubled || ''}`;
            historyText += `<p>Deal ${entry.deal}: ${contract} by ${entry.contract.declarer} = ${entry.contract.result} (Score: ${entry.score})</p>`;
        });
        
        historyText += '</div>';
        
        const simpleHistoryModal = {
            title: `Score History - ${this.getModeDisplayName(currentMode)}`,
            content: historyText,
            buttons: [
                { 
                    text: 'Back to Quit Menu', 
                    action: () => {
                        console.log('Back to quit from simple history');
                        this.showQuit();
                    }, 
                    class: 'modal-button' 
                },
                { 
                    text: 'Close', 
                    action: 'close', 
                    class: 'close-btn modal-button' 
                }
            ]
        };
        
        console.log('Showing simple score history modal...');
        this.ui.showModal('history', simpleHistoryModal);
    }
    
    /**
     * Build detailed score history content
     */
    buildScoreHistoryContent(history, scores, mode) {
        let content = '';
        
        // Session summary
        const sessionStats = this.calculateSessionStats(history, scores);
        content += `
            <div style="background: rgba(52,152,219,0.2); padding: 15px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #3498db;">
                <h4 style="margin: 0 0 10px 0; color: #3498db;">Session Summary</h4>
                <div style="display: flex; justify-content: space-between; gap: 20px;">
                    <div>
                        <strong>Total Deals:</strong> ${sessionStats.totalDeals}<br>
                        <strong>Session Time:</strong> ${this.gameState.getSessionDurationString()}
                    </div>
                    <div style="text-align: right;">
                        <strong>NS:</strong> ${scores.NS} points<br>
                        <strong>EW:</strong> ${scores.EW} points
                    </div>
                </div>
                ${sessionStats.leader ? `<div style="margin-top: 10px; text-align: center; font-weight: bold; color: #27ae60;">Leading: ${sessionStats.leader} by ${sessionStats.leadMargin} points</div>` : '<div style="margin-top: 10px; text-align: center; font-weight: bold; color: #f39c12;">Tied Game!</div>'}
            </div>
        `;
        
        // Detailed history table
        content += `
            <div style="max-height: 400px; overflow-y: auto; border: 1px solid rgba(255,255,255,0.2); border-radius: 8px;">
                <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                    <thead style="background: rgba(255,255,255,0.1); position: sticky; top: 0;">
                        <tr>
                            <th style="padding: 8px; text-align: left; border-bottom: 1px solid rgba(255,255,255,0.2);">Deal</th>
                            <th style="padding: 8px; text-align: left; border-bottom: 1px solid rgba(255,255,255,0.2);">Contract</th>
                            <th style="padding: 8px; text-align: center; border-bottom: 1px solid rgba(255,255,255,0.2);">Result</th>
                            <th style="padding: 8px; text-align: right; border-bottom: 1px solid rgba(255,255,255,0.2);">Score</th>
                            <th style="padding: 8px; text-align: right; border-bottom: 1px solid rgba(255,255,255,0.2);">Running Total</th>
                            ${mode === 'chicago' ? '<th style="padding: 8px; text-align: center; border-bottom: 1px solid rgba(255,255,255,0.2);">Vuln</th>' : ''}
                        </tr>
                    </thead>
                    <tbody>
        `;
        
        let runningNS = 0;
        let runningEW = 0;
        
        history.forEach((entry, index) => {
            const contract = entry.contract;
            const contractStr = `${contract.level}${contract.suit}${contract.doubled || ''}`;
            const declarer = contract.declarer;
            const result = contract.result;
            const score = entry.score;
            const actualScore = entry.actualScore || Math.abs(score);
            const scoringSide = entry.scoringSide || (['N', 'S'].includes(declarer) ? 'NS' : 'EW');
            
            // Update running totals
            if (scoringSide === 'NS') {
                runningNS += actualScore;
            } else {
                runningEW += actualScore;
            }
            
            // Determine result color and text
            const resultColor = score >= 0 ? '#27ae60' : '#e74c3c';
            const resultText = result === '=' ? 'Made' : 
                              result.startsWith('+') ? `+${result.substring(1)}` : 
                              result.startsWith('-') ? `${result}` : result;
            
            // Score display
            const scoreDisplay = score >= 0 ? `+${actualScore}` : `+${actualScore}`;
            const scoreColor = '#3498db';
            
            content += `
                <tr style="border-bottom: 1px solid rgba(255,255,255,0.1);">
                    <td style="padding: 8px; font-weight: bold;">${entry.deal}</td>
                    <td style="padding: 8px;">
                        <span style="font-weight: bold;">${contractStr}</span> by <span style="color: #f39c12;">${declarer}</span>
                    </td>
                    <td style="padding: 8px; text-align: center; color: ${resultColor}; font-weight: bold;">${resultText}</td>
                    <td style="padding: 8px; text-align: right; color: ${scoreColor}; font-weight: bold;">
                        ${scoreDisplay} <span style="font-size: 11px; color: #95a5a6;">${scoringSide}</span>
                    </td>
                    <td style="padding: 8px; text-align: right; font-size: 11px;">
                        NS: ${runningNS}<br>EW: ${runningEW}
                    </td>
                    ${mode === 'chicago' ? `<td style="padding: 8px; text-align: center; font-size: 11px; color: #f39c12;">${entry.vulnerability || 'N/A'}</td>` : ''}
                </tr>
            `;
        });
        
        content += `
                    </tbody>
                </table>
            </div>
        `;
        
        // Final totals
        content += `
            <div style="background: rgba(39,174,96,0.2); padding: 15px; border-radius: 8px; margin-top: 20px; border-left: 4px solid #27ae60;">
                <h4 style="margin: 0 0 10px 0; color: #27ae60;">Final Totals</h4>
                <div style="display: flex; justify-content: space-between; font-size: 16px; font-weight: bold;">
                    <div>North-South: ${scores.NS} points</div>
                    <div>East-West: ${scores.EW} points</div>
                </div>
                ${sessionStats.performance ? `
                    <div style="margin-top: 10px; font-size: 14px; color: #34495e;">
                        <strong>Performance:</strong> ${sessionStats.performance}
                    </div>
                ` : ''}
            </div>
        `;
        
        return content;
    }
    
    /**
     * Calculate session statistics
     */
    calculateSessionStats(history, scores) {
        const totalDeals = history.length;
        const scoreDifference = scores.NS - scores.EW;
        const leader = scoreDifference > 0 ? 'NS' : scoreDifference < 0 ? 'EW' : null;
        const leadMargin = Math.abs(scoreDifference);
        
        // Calculate performance metrics
        let contractsMade = 0;
        let contractsFailed = 0;
        let doublesSuccessful = 0;
        let doublesTotal = 0;
        
        history.forEach(entry => {
            if (entry.score >= 0) {
                contractsMade++;
            } else {
                contractsFailed++;
            }
            
            if (entry.contract.doubled) {
                doublesTotal++;
                if (entry.score >= 0) {
                    doublesSuccessful++;
                }
            }
        });
        
        const successRate = totalDeals > 0 ? Math.round((contractsMade / totalDeals) * 100) : 0;
        let performance = `${contractsMade}/${totalDeals} contracts made (${successRate}%)`;
        
        if (doublesTotal > 0) {
            performance += `, ${doublesSuccessful}/${doublesTotal} doubles successful`;
        }
        
        return {
            totalDeals,
            leader,
            leadMargin,
            performance,
            contractsMade,
            contractsFailed,
            successRate
        };
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
     * Close the application
     */
    closeApp() {
        this.ui.releaseWakeLock();
        
        if (confirm('Really close Bridge Calculator?')) {
            // Try to close the window/tab
            window.close();
            // If that doesn't work (PWA), show message
            alert('Please close the app manually or switch to another app.');
        }
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

// Export the main class
export { BridgeApp };