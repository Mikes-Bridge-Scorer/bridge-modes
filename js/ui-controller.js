// ===== UI CONTROLLER - MANAGES ALL USER INTERFACE INTERACTIONS =====

export class UIController {
    constructor() {
        // DOM elements
        this.display = document.getElementById('display');
        this.buttonGrid = document.getElementById('buttonGrid');
        this.scoreOverlay = document.getElementById('scoreOverlay');
        this.scoreTable = document.getElementById('scoreTable');
        this.loading = document.getElementById('loading');
        
        // Button references
        this.buttons = document.querySelectorAll('.btn');
        this.downTricksBtn = document.getElementById('downTricksBtn');
        this.upTricksBtn = document.getElementById('upTricksBtn');
        
        // Counter values
        this.counters = {
            'down-tricks': 1,
            'up-tricks': 1
        };
        
        // Mode names mapping
        this.modeNames = {
            'kitchen': 'Kitchen Bridge',
            'bonus': 'Bonus Bridge',
            'chicago': 'Chicago Bridge',
            'rubber': 'Rubber Bridge',
            'duplicate': 'Duplicate Bridge'
        };
        
        // Initialize
        this.init();
    }
    
    init() {
        console.log('🎨 Initializing UI Controller');
        this.setupAccessibility();
        this.setupAnimations();
    }
    
    // ===== MAIN DISPLAY UPDATE =====
    updateDisplay(state) {
        const { appState, currentMode, gameState, currentContract } = state;
        
        let displayContent = '';
        let activeButtons = [];
        
        switch (appState) {
            case 'mode_selection':
                displayContent = this.getModeSelectionDisplay();
                activeButtons = ['1', '2', '3', '4', '5'];
                break;
                
            case 'level_selection':
                displayContent = this.getLevelSelectionDisplay(currentMode, gameState);
                activeButtons = ['1', '2', '3', '4', '5', '6', '7', 'PASS'];
                break;
                
            case 'suit_selection':
                displayContent = this.getSuitSelectionDisplay(currentMode, gameState, currentContract);
                activeButtons = ['♣', '♦', '♥', '♠', 'NT'];
                break;
                
            case 'declarer_selection':
                displayContent = this.getDeclarerSelectionDisplay(currentMode, gameState, currentContract);
                activeButtons = this.getDeclarerActiveButtons(currentContract);
                break;
                
            case 'result_selection':
                displayContent = this.getResultSelectionDisplay(currentMode, gameState, currentContract);
                activeButtons = ['down-tricks', '-', '=', '+', 'up-tricks'];
                break;
                
            case 'scoring':
                displayContent = this.getScoringDisplay(currentMode, gameState, currentContract);
                activeButtons = ['DEAL', 'MENU', 'SCORE'];
                break;
        }
        
        // Update display
        this.display.innerHTML = displayContent;
        
        // Update button states
        this.setActiveButtons(activeButtons);
        
        // Add fade-in animation
        this.display.classList.add('fade-in');
        setTimeout(() => this.display.classList.remove('fade-in'), 300);
    }
    
    // ===== DISPLAY CONTENT GENERATORS =====
    
    getModeSelectionDisplay() {
        return `
            <div class="mode-title">Bridge Modes Calculator</div>
            <div class="game-info">
                <div>Select scoring mode:</div>
                <div class="mode-list">
                    1 - Kitchen Bridge<br>
                    2 - Bonus Bridge<br>
                    3 - Chicago Bridge<br>
                    4 - Rubber Bridge<br>
                    5 - Duplicate Bridge
                </div>
            </div>
            <div class="current-state">Press 1-5 to select mode</div>
        `;
    }
    
    getLevelSelectionDisplay(mode, gameState) {
        const modeName = this.modeNames[mode] || 'Bridge';
        return `
            <div class="mode-title">${modeName}</div>
            <div class="game-info">
                Game ${gameState.gameNumber} - Deal ${gameState.dealNumber}<br>
                Dealer: ${gameState.dealer}
            </div>
            <div class="vulnerability-info">
                Vulnerability: ${this.formatVulnerability(gameState.vulnerability)}
            </div>
            <div class="current-state">Select bid level (1-7) or PASS</div>
        `;
    }
    
    getSuitSelectionDisplay(mode, gameState, contract) {
        const modeName = this.modeNames[mode] || 'Bridge';
        return `
            <div class="mode-title">${modeName}</div>
            <div class="game-info">
                Game ${gameState.gameNumber} - Deal ${gameState.dealNumber}<br>
                Dealer: ${gameState.dealer} - ${this.formatVulnerability(gameState.vulnerability)}
            </div>
            <div class="number-display">Level: ${contract.level}</div>
            <div class="current-state">Select suit</div>
        `;
    }
    
    getDeclarerSelectionDisplay(mode, gameState, contract) {
        const modeName = this.modeNames[mode] || 'Bridge';
        const contractText = `${contract.level}${contract.suit}${contract.doubled}`;
        
        return `
            <div class="mode-title">${modeName}</div>
            <div class="game-info">
                Game ${gameState.gameNumber} - Deal ${gameState.dealNumber}<br>
                Dealer: ${gameState.dealer} - ${this.formatVulnerability(gameState.vulnerability)}
            </div>
            <div class="number-display">Contract: ${contractText}</div>
            <div class="current-state">
                Select declarer (N/E/S/W)
                ${contract.doubled === '' ? '<br>or Double (X)' : ''}
                ${contract.doubled === 'X' ? '<br>or Redouble (XX)' : ''}
            </div>
        `;
    }
    
    getResultSelectionDisplay(mode, gameState, contract) {
        const modeName = this.modeNames[mode] || 'Bridge';
        const contractText = `${contract.level}${contract.suit}${contract.doubled}`;
        
        return `
            <div class="mode-title">${modeName}</div>
            <div class="game-info">
                Game ${gameState.gameNumber} - Deal ${gameState.dealNumber}<br>
                Dealer: ${gameState.dealer} - ${this.formatVulnerability(gameState.vulnerability)}
            </div>
            <div class="number-display">
                Contract: ${contractText}<br>
                Declarer: ${contract.declarer}
            </div>
            <div class="current-state">
                Select result:<br>
                Down ${this.counters['down-tricks']} (-) | MADE (=) | Up ${this.counters['up-tricks']} (+)<br>
                <small>Press counter buttons to adjust tricks</small>
            </div>
        `;
    }
    
    getScoringDisplay(mode, gameState, contract) {
        const modeName = this.modeNames[mode] || 'Bridge';
        const contractText = `${contract.level}${contract.suit}${contract.doubled}`;
        
        return `
            <div class="mode-title">${modeName}</div>
            <div class="game-info">
                Game ${gameState.gameNumber} - Deal ${gameState.dealNumber}<br>
                Contract: ${contractText} by ${contract.declarer}<br>
                Result: ${this.formatResult(contract.result)}
            </div>
            <div class="score-display">
                North-South: ${gameState.scores.NS}<br>
                East-West: ${gameState.scores.EW}
            </div>
            <div class="current-state">
                Press DEAL for next deal<br>
                Press MENU for main menu<br>
                Press SCORE for detailed scores
            </div>
        `;
    }
    
    // ===== BUTTON MANAGEMENT =====
    
    setActiveButtons(activeValues) {
        this.buttons.forEach(btn => {
            const value = btn.dataset.value;
            const isGlobalAction = ['C', 'MENU', 'SCORE'].includes(value);
            
            if (activeValues.includes(value) || isGlobalAction) {
                btn.classList.remove('disabled');
                if (activeValues.includes(value)) {
                    btn.classList.add('active');
                } else {
                    btn.classList.remove('active');
                }
            } else {
                btn.classList.add('disabled');
                btn.classList.remove('active');
            }
        });
    }
    
    getDeclarerActiveButtons(contract) {
        let buttons = ['N', 'S', 'E', 'W'];
        
        if (contract.doubled === '') {
            buttons.push('X');
        } else if (contract.doubled === 'X') {
            buttons.push('XX');
        }
        
        return buttons;
    }
    
    addButtonFeedback(button) {
        // Add press animation
        button.classList.add('btn-press');
        setTimeout(() => button.classList.remove('btn-press'), 100);
        
        // Add pulse effect for important actions
        if (button.dataset.value === 'DEAL' || button.dataset.value === 'SCORE') {
            button.classList.add('pulse');
            setTimeout(() => button.classList.remove('pulse'), 600);
        }
        
        // Haptic feedback (if supported)
        if ('vibrate' in navigator) {
            navigator.vibrate(50);
        }
    }
    
    // ===== COUNTER MANAGEMENT =====
    
    incrementCounter(counterType) {
        const maxValues = {
            'down-tricks': 13,
            'up-tricks': 6
        };
        
        const max = maxValues[counterType] || 6;
        this.counters[counterType] = this.counters[counterType] >= max ? 1 : this.counters[counterType] + 1;
        
        // Update button display
        const buttonId = counterType === 'down-tricks' ? 'downTricksBtn' : 'upTricksBtn';
        const button = document.getElementById(buttonId);
        if (button) {
            const valueSpan = button.querySelector('.counter-value');
            if (valueSpan) {
                valueSpan.textContent = this.counters[counterType];
                
                // Add animation
                valueSpan.classList.add('pulse');
                setTimeout(() => valueSpan.classList.remove('pulse'), 300);
            }
        }
    }
    
    getCounterValue(counterType) {
        return this.counters[counterType];
    }
    
    resetCounters() {
        this.counters['down-tricks'] = 1;
        this.counters['up-tricks'] = 1;
        
        // Update UI
        const downBtn = document.getElementById('downTricksBtn');
        const upBtn = document.getElementById('upTricksBtn');
        
        if (downBtn) {
            const valueSpan = downBtn.querySelector('.counter-value');
            if (valueSpan) valueSpan.textContent = '1';
        }
        
        if (upBtn) {
            const valueSpan = upBtn.querySelector('.counter-value');
            if (valueSpan) valueSpan.textContent = '1';
        }
    }
    
    // ===== SCORE OVERLAY =====
    
    showScoreOverlay(gameState) {
        if (!this.scoreOverlay) return;
        
        // Generate score table
        const scoreTableHTML = this.generateScoreTable(gameState);
        this.scoreTable.innerHTML = scoreTableHTML;
        
        // Show overlay
        this.scoreOverlay.classList.add('show');
        
        // Focus trap
        this.setupScoreOverlayFocus();
    }
    
    hideScoreOverlay() {
        if (this.scoreOverlay) {
            this.scoreOverlay.classList.remove('show');
        }
    }
    
    generateScoreTable(gameState) {
        let html = `
            <div class="score-summary">
                <h4>Current Totals</h4>
                <div class="score-row">
                    <span>North-South:</span>
                    <span class="score-value">${gameState.scores.NS}</span>
                </div>
                <div class="score-row">
                    <span>East-West:</span>
                    <span class="score-value">${gameState.scores.EW}</span>
                </div>
            </div>
        `;
        
        if (gameState.history && gameState.history.length > 0) {
            html += `
                <div class="score-history">
                    <h4>Deal History</h4>
                    <div class="history-table">
            `;
            
            gameState.history.slice(-10).forEach((deal, index) => {
                const contractText = `${deal.contract.level}${deal.contract.suit}${deal.contract.doubled}`;
                const side = ['N', 'S'].includes(deal.contract.declarer) ? 'NS' : 'EW';
                
                html += `
                    <div class="history-row">
                        <span class="deal-num">#${deal.deal}</span>
                        <span class="contract">${contractText}</span>
                        <span class="declarer">${deal.contract.declarer}</span>
                        <span class="result">${this.formatResult(deal.contract.result)}</span>
                        <span class="score ${side.toLowerCase()}">${deal.score > 0 ? '+' : ''}${deal.score}</span>
                    </div>
                `;
            });
            
            html += `
                    </div>
                </div>
            `;
        }
        
        return html;
    }
    
    setupScoreOverlayFocus() {
        // Basic focus management for accessibility
        const closeButton = this.scoreOverlay.querySelector('.btn');
        if (closeButton) {
            closeButton.focus();
        }
        
        // Close on escape key
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                this.hideScoreOverlay();
                document.removeEventListener('keydown', handleEscape);
            }
        };
        
        document.addEventListener('keydown', handleEscape);
    }
    
    // ===== UTILITY METHODS =====
    
    formatVulnerability(vuln) {
        const vulnMap = {
            'None': 'None Vulnerable',
            'NS': 'N-S Vulnerable',
            'EW': 'E-W Vulnerable', 
            'Both': 'Both Vulnerable'
        };
        return vulnMap[vuln] || vuln;
    }
    
    formatResult(result) {
        if (!result) return '';
        
        if (result === '=') return 'Made exactly';
        if (result.startsWith('+')) return `Made +${result.substring(1)}`;
        if (result.startsWith('-')) return `Down ${result.substring(1)}`;
        
        return result;
    }
    
    showLoading() {
        if (this.loading) {
            this.loading.classList.add('show');
        }
    }
    
    hideLoading() {
        if (this.loading) {
            this.loading.classList.remove('show');
        }
    }
    
    showError(message) {
        // Simple error display - could be enhanced
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-toast';
        errorDiv.textContent = message;
        errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: #e74c3c;
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            z-index: 10000;
            font-weight: bold;
        `;
        
        document.body.appendChild(errorDiv);
        
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.parentNode.removeChild(errorDiv);
            }
        }, 3000);
    }
    
    // ===== ACCESSIBILITY SETUP =====
    
    setupAccessibility() {
        // Add ARIA labels to buttons
        this.buttons.forEach(btn => {
            const value = btn.dataset.value;
            const row = btn.dataset.row;
            
            if (!btn.getAttribute('aria-label')) {
                btn.setAttribute('aria-label', this.getButtonAriaLabel(value, row));
            }
            
            btn.setAttribute('role', 'button');
            btn.setAttribute('tabindex', '0');
        });
        
        // Add keyboard navigation
        this.setupKeyboardNavigation();
    }
    
    getButtonAriaLabel(value, row) {
        const labels = {
            // Numbers
            '1': 'Bid level 1', '2': 'Bid level 2', '3': 'Bid level 3',
            '4': 'Bid level 4', '5': 'Bid level 5', '6': 'Bid level 6', '7': 'Bid level 7',
            
            // Suits
            '♣': 'Clubs', '♦': 'Diamonds', '♥': 'Hearts', '♠': 'Spades', 'NT': 'No Trump',
            
            // Actions
            'X': 'Double', 'XX': 'Redouble',
            '=': 'Made exactly', '+': 'Made with overtricks', '-': 'Failed',
            'down-tricks': 'Down tricks counter', 'up-tricks': 'Up tricks counter',
            
            // Directions
            'N': 'North', 'S': 'South', 'E': 'East', 'W': 'West',
            
            // Commands
            'C': 'Clear', 'PASS': 'Pass', 'MENU': 'Main menu', 
            'SCORE': 'Show scores', 'DEAL': 'Next deal'
        };
        
        return labels[value] || value;
    }
    
    setupKeyboardNavigation() {
        // Basic keyboard support
        document.addEventListener('keydown', (e) => {
            if (e.target.classList.contains('btn')) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    e.target.click();
                }
            }
        });
    }
    
    setupAnimations() {
        // Add CSS for dynamic animations
        const style = document.createElement('style');
        style.textContent = `
            .error-toast {
                animation: slideDown 0.3s ease-out;
            }
            
            @keyframes slideDown {
                from {
                    transform: translateX(-50%) translateY(-100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(-50%) translateY(0);
                    opacity: 1;
                }
            }
            
            .history-row {
                display: grid;
                grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
                gap: 8px;
                padding: 4px 0;
                border-bottom: 1px solid rgba(255,255,255,0.1);
                font-size: 12px;
            }
            
            .score-row {
                display: flex;
                justify-content: space-between;
                padding: 8px 0;
                border-bottom: 1px solid rgba(255,255,255,0.2);
            }
            
            .score-value {
                font-weight: bold;
                color: #3498db;
            }
            
            .score.ns { color: #27ae60; }
            .score.ew { color: #e74c3c; }
        `;
        
        document.head.appendChild(style);
    }
}

// Global function for score overlay close button
window.hideScoreOverlay = function() {
    const overlay = document.getElementById('scoreOverlay');
    if (overlay) {
        overlay.classList.remove('show');
    }
};