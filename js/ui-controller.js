/**
 * UI Controller - Manages all user interface interactions and display updates
 * Handles button states, modals, display panel, and UI utilities
 */

class UIController {
    constructor() {
        this.display = null;
        this.buttons = null;
        this.vulnControl = null;
        this.vulnText = null;
        this.wakeToggle = null;
        this.doubleBtn = null;
        
        // Wake lock for keeping screen active
        this.wakeLock = null;
        this.isWakeActive = false;
        
        // Modal management
        this.currentModal = null;
        
        // Loading state
        this.isLoading = false;
    }
    
    /**
     * Initialize UI Controller
     */
    async init() {
        console.log('🖥️ Initializing UI Controller');
        
        try {
            this.cacheElements();
            this.setupWakeLock();
            
            console.log('✅ UI Controller ready');
            
        } catch (error) {
            console.error('❌ Failed to initialize UI Controller:', error);
            throw error;
        }
    }
    
    /**
     * Cache DOM elements for performance
     */
    cacheElements() {
        this.display = document.getElementById('display');
        this.buttons = document.querySelectorAll('.btn');
        this.vulnControl = document.getElementById('vulnControl');
        this.vulnText = document.getElementById('vulnText');
        this.wakeToggle = document.getElementById('wakeToggle');
        this.doubleBtn = document.getElementById('doubleBtn');
        
        if (!this.display) {
            throw new Error('Display element not found');
        }
    }
    
    /**
     * Update the main display panel
     */
    updateDisplay(content) {
        if (!this.display) return;
        
        this.display.innerHTML = content;
    }
    
    /**
     * Update button states based on active buttons array
     */
    updateButtonStates(activeButtons = []) {
        if (!this.buttons) return;
        
        this.buttons.forEach(btn => {
            const value = btn.dataset.value;
            
            if (activeButtons.includes(value)) {
                btn.classList.remove('disabled');
                btn.classList.add('active');
            } else {
                btn.classList.add('disabled');
                btn.classList.remove('active');
            }
        });
    }
    
    /**
     * Update the double button text (X/XX cycling)
     */
    updateDoubleButton(doubledState = '') {
        if (!this.doubleBtn) return;
        
        switch (doubledState) {
            case '':
                this.doubleBtn.textContent = 'X/XX';
                break;
            case 'X':
                this.doubleBtn.textContent = 'X';
                break;
            case 'XX':
                this.doubleBtn.textContent = 'XX';
                break;
            default:
                this.doubleBtn.textContent = 'X/XX';
        }
    }
    
    /**
     * Update vulnerability display
     */
    updateVulnerabilityDisplay(vulnerability = 'None') {
        if (!this.vulnText) return;
        
        const shortNames = {
            'None': 'NV',
            'NS': 'NS', 
            'EW': 'EW',
            'Both': 'Both'
        };
        
        this.vulnText.textContent = shortNames[vulnerability] || 'NV';
    }
    
    /**
     * Highlight vulnerability based on declarer
     */
    highlightVulnerability(declarer, vulnerability) {
        if (!this.vulnControl || !declarer) return;
        
        const declarerSide = ['N', 'S'].includes(declarer) ? 'NS' : 'EW';
        const isVulnerable = vulnerability === declarerSide || vulnerability === 'Both';
        
        this.vulnControl.classList.remove('vulnerable-active', 'vulnerable-safe');
        
        if (isVulnerable) {
            this.vulnControl.classList.add('vulnerable-active');
        } else {
            this.vulnControl.classList.add('vulnerable-safe');
        }
    }
    
    /**
     * Clear vulnerability highlighting
     */
    clearVulnerabilityHighlight() {
        if (!this.vulnControl) return;
        
        this.vulnControl.classList.remove('vulnerable-active', 'vulnerable-safe');
    }
    
    /**
     * Show the honors button when in scoring state - NEW METHOD
     */
    showHonorsButton() {
        const honorsBtn = document.getElementById('honorsControl');
        if (honorsBtn) {
            honorsBtn.style.display = 'flex'; // Use flex to match other control items
            honorsBtn.classList.add('active');
            console.log('🏅 Honors button shown');
        }
    }
    
    /**
     * Hide the honors button when not needed - NEW METHOD
     */
    hideHonorsButton() {
        const honorsBtn = document.getElementById('honorsControl');
        if (honorsBtn) {
            honorsBtn.style.display = 'none';
            honorsBtn.classList.remove('active');
            console.log('🏅 Honors button hidden');
        }
    }
    
    /**
     * Show modal dialog
     */
    showModal(type, content) {
        console.log('🖼️ Showing modal type:', type);
        console.log('Modal content:', content);
        
        // Remove any existing modal
        this.closeModal();
        
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        
        // Force high z-index and proper display
        overlay.style.cssText = `
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 100% !important;
            height: 100% !important;
            background: rgba(0, 0, 0, 0.8) !important;
            z-index: 10000 !important;
            display: flex !important;
            justify-content: center !important;
            align-items: center !important;
            animation: fadeIn 0.3s ease !important;
        `;
        
        let modalHTML = '';
        
        if (typeof content === 'string') {
            // Simple content string
            modalHTML = content;
            console.log('Using string content');
        } else if (content && typeof content === 'object') {
            // Structured content object
            modalHTML = this.buildModalContent(content);
            console.log('Built structured content');
        } else {
            console.error('Invalid modal content:', content);
            return;
        }
        
        overlay.innerHTML = modalHTML;
        
        // Force modal content styling
        const modalContent = overlay.querySelector('.modal-content');
        if (modalContent) {
            modalContent.style.cssText = `
                background: #34495e !important;
                border-radius: 16px !important;
                padding: 24px !important;
                color: white !important;
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5) !important;
                max-height: 90vh !important;
                overflow-y: auto !important;
                position: relative !important;
                z-index: 10001 !important;
            `;
            
            // Make score history modal wider
            if (type === 'history') {
                modalContent.style.maxWidth = '95%';
                modalContent.style.width = 'auto';
                modalContent.style.minWidth = '600px';
                console.log('Applied history modal sizing');
            } else {
                modalContent.style.maxWidth = '90%';
            }
        }
        
        document.body.appendChild(overlay);
        this.currentModal = overlay;
        
        console.log('Modal added to DOM with forced styling');
        
        // Setup modal event listeners
        this.setupModalEvents(overlay, content);
        
        console.log('Modal setup complete');
        
        // Test visibility
        const rect = overlay.getBoundingClientRect();
        console.log('Modal overlay position:', rect);
        console.log('Modal overlay computed style:', window.getComputedStyle(overlay).display);
    }
    
    /**
     * Build modal content from structured object
     */
    buildModalContent(content) {
        const title = content.title || 'Information';
        const body = content.content || '';
        const buttons = content.buttons || [{ text: 'Close', action: 'close', class: 'close-btn' }];
        
        let buttonsHTML = '';
        buttons.forEach((btn, index) => {
            const actionAttr = typeof btn.action === 'string' ? btn.action : `action-${index}`;
            const style = btn.style ? ` style="${btn.style}"` : '';
            buttonsHTML += `<button class="${btn.class} modal-button" data-action="${actionAttr}"${style}>${btn.text}</button>`;
        });
        
        return `
            <div class="modal-content">
                <h3>${title}</h3>
                <div class="modal-body">${body}</div>
                <div class="modal-buttons" style="display: flex; gap: 10px; flex-wrap: wrap; justify-content: center; margin-top: 20px;">
                    ${buttonsHTML}
                </div>
            </div>
        `;
    }
    
    /**
     * Setup modal event listeners
     */
    setupModalEvents(overlay, content) {
        overlay.addEventListener('click', (e) => {
            // Close on background click
            if (e.target === overlay) {
                this.closeModal();
                return;
            }
            
            // Handle button clicks
            const button = e.target.closest('.modal-button');
            if (button) {
                e.preventDefault();
                e.stopPropagation();
                
                const action = button.dataset.action;
                console.log('Modal button clicked:', action);
                
                if (action === 'close') {
                    this.closeModal();
                } else if (content && content.buttons) {
                    // Find the button config and execute action
                    const btnConfig = content.buttons.find(b => {
                        // Handle both string actions and function actions
                        return (typeof b.action === 'string' && b.action === action) ||
                               (typeof b.action === 'function' && b.text === button.textContent.trim());
                    });
                    
                    if (btnConfig && typeof btnConfig.action === 'function') {
                        try {
                            btnConfig.action();
                            this.closeModal();
                        } catch (error) {
                            console.error('Error executing modal action:', error);
                        }
                    }
                }
            }
        });
        
        // Close on Escape key
        const escapeHandler = (e) => {
            if (e.key === 'Escape') {
                this.closeModal();
                document.removeEventListener('keydown', escapeHandler);
            }
        };
        document.addEventListener('keydown', escapeHandler);
    }
    
    /**
     * Close current modal
     */
    closeModal() {
        if (this.currentModal) {
            this.currentModal.remove();
            this.currentModal = null;
        }
    }
    
    /**
     * Show loading state
     */
    showLoading(message = 'Loading...') {
        this.isLoading = true;
        
        const content = `
            <div class="title-score-row">
                <div class="mode-title">Bridge Calculator</div>
                <div class="score-display">Loading...</div>
            </div>
            <div class="game-content">
                <div class="loading-message">${message}</div>
            </div>
            <div class="current-state">Please wait...</div>
        `;
        
        this.updateDisplay(content);
        this.updateButtonStates([]); // Disable all buttons
    }
    
    /**
     * Hide loading state
     */
    hideLoading() {
        this.isLoading = false;
    }
    
    /**
     * Show error message
     */
    showError(message) {
        const content = `
            <div class="title-score-row">
                <div class="mode-title">Error</div>
                <div class="score-display">⚠️</div>
            </div>
            <div class="game-content">
                <div style="color: #e74c3c; font-weight: 600;">${message}</div>
            </div>
            <div class="current-state">Press Back to continue</div>
        `;
        
        this.updateDisplay(content);
        this.updateButtonStates(['BACK']);
    }
    
    /**
     * Toggle keep awake functionality
     */
    async toggleKeepAwake() {
        if (this.isWakeActive) {
            this.releaseWakeLock();
        } else {
            await this.requestWakeLock();
        }
    }
    
    /**
     * Setup wake lock functionality
     */
    setupWakeLock() {
        // Handle visibility change to re-acquire wake lock
        document.addEventListener('visibilitychange', async () => {
            if (this.wakeLock !== null && document.visibilityState === 'visible') {
                await this.requestWakeLock();
            }
        });
    }
    
    /**
     * Request wake lock to keep screen active
     */
    async requestWakeLock() {
        try {
            if ('wakeLock' in navigator) {
                this.wakeLock = await navigator.wakeLock.request('screen');
                this.isWakeActive = true;
                
                if (this.wakeToggle) {
                    this.wakeToggle.classList.add('active');
                }
                
                console.log('🔋 Wake lock acquired');
                
                // Listen for wake lock release
                this.wakeLock.addEventListener('release', () => {
                    console.log('🔋 Wake lock released');
                });
                
            } else {
                console.warn('Wake Lock API not supported');
            }
        } catch (err) {
            console.error('Failed to acquire wake lock:', err);
        }
    }
    
    /**
     * Release wake lock
     */
    releaseWakeLock() {
        if (this.wakeLock) {
            this.wakeLock.release();
            this.wakeLock = null;
        }
        
        this.isWakeActive = false;
        
        if (this.wakeToggle) {
            this.wakeToggle.classList.remove('active');
        }
        
        console.log('🔋 Wake lock released manually');
    }
    
    /**
     * Reset UI to initial state - UPDATED WITH HONORS BUTTON
     */
    reset() {
        this.clearVulnerabilityHighlight();
        this.updateDoubleButton('');
        this.updateVulnerabilityDisplay('None');
        this.closeModal();
        this.hideLoading();
        this.hideHonorsButton(); // NEW: Hide honors button when resetting
        
        // Don't reset wake lock state - user preference should persist
    }
    
    /**
     * Show success message briefly
     */
    showSuccess(message, duration = 2000) {
        const originalContent = this.display.innerHTML;
        
        const content = `
            <div class="title-score-row">
                <div class="mode-title">Success</div>
                <div class="score-display">✅</div>
            </div>
            <div class="game-content">
                <div style="color: #27ae60; font-weight: 600;">${message}</div>
            </div>
            <div class="current-state">Continuing...</div>
        `;
        
        this.updateDisplay(content);
        
        // Restore original content after duration
        setTimeout(() => {
            this.display.innerHTML = originalContent;
        }, duration);
    }
    
    /**
     * Animate button press for visual feedback
     */
    animateButtonPress(buttonValue) {
        const button = Array.from(this.buttons).find(btn => btn.dataset.value === buttonValue);
        if (button && !button.classList.contains('disabled')) {
            button.classList.add('pressed');
            setTimeout(() => {
                button.classList.remove('pressed');
            }, 150);
        }
    }
    
    /**
     * Get current loading state
     */
    getLoadingState() {
        return this.isLoading;
    }
    
    /**
     * Check if wake lock is active
     */
    isWakeLockActive() {
        return this.isWakeActive;
    }
}

// Export the UI Controller
export { UIController };