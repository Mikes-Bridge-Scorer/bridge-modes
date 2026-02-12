/**
 * UI Controller - MOBILE TOUCH FIXED VERSION
 * Simplified mobile touch handling for ALL modal buttons
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
        
        // Mobile detection
        this.isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        console.log('📱 Mobile detected:', this.isMobile);
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
     * Show the honors button when in scoring state
     */
    showHonorsButton() {
        const honorsBtn = document.getElementById('honorsControl');
        if (honorsBtn) {
            honorsBtn.style.display = 'flex';
            honorsBtn.classList.add('active');
            console.log('🏅 Honors button shown');
        }
    }

    /**
     * Hide the honors button when not needed
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
     * FIXED: Show modal dialog with UNIVERSAL mobile touch support
     */
    showModal(type, content) {
        console.log('🖼️ Showing modal type:', type);
        
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
            modalHTML = content;
        } else if (content && typeof content === 'object') {
            modalHTML = this.buildModalContent(content);
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
                max-width: 90% !important;
            `;
        }
        
        document.body.appendChild(overlay);
        this.currentModal = overlay;
        
        // FIXED: Setup universal mobile touch for ALL buttons
        this.setupUniversalModalTouch(overlay, content);
        
        console.log('✅ Modal setup complete with mobile support');
    }
    
    /**
     * FIXED: Universal mobile touch handler for ALL modal buttons
     */
    setupUniversalModalTouch(overlay, content) {
        console.log('📱 Setting up UNIVERSAL modal touch events');
        
        // Background click to close
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                this.closeModal();
                return;
            }
        });
        
        // UNIVERSAL button handler - works for ALL buttons regardless of class/type
        const universalButtonHandler = (e) => {
            // Find any clickable element
            const clickableElement = e.target.closest('button, .modal-button, [onclick], [data-action]');
            
            if (!clickableElement) return;
            
            e.preventDefault();
            e.stopPropagation();
            
            const buttonText = clickableElement.textContent?.trim() || 'unknown';
            console.log('📱 UNIVERSAL modal button pressed:', buttonText);
            
            // Visual feedback for mobile
            if (this.isMobile) {
                clickableElement.style.transform = 'scale(0.9)';
                clickableElement.style.opacity = '0.7';
                clickableElement.style.transition = 'all 0.1s ease';
                
                if (navigator.vibrate) {
                    navigator.vibrate(30);
                }
                
                setTimeout(() => {
                    clickableElement.style.transform = '';
                    clickableElement.style.opacity = '';
                }, 150);
            }
            
            // Handle the action after a small delay for visual feedback
            setTimeout(() => {
                this.handleModalButtonAction(clickableElement, content);
            }, 50);
        };
        
        // Add BOTH touch and click handlers to the overlay (event delegation)
        overlay.addEventListener('click', universalButtonHandler);
        
        if (this.isMobile) {
            overlay.addEventListener('touchend', universalButtonHandler, { passive: false });
            
            // Also add touchstart for immediate visual feedback
            overlay.addEventListener('touchstart', (e) => {
                const clickableElement = e.target.closest('button, .modal-button, [onclick], [data-action]');
                if (clickableElement) {
                    clickableElement.style.transform = 'scale(0.9)';
                    clickableElement.style.opacity = '0.7';
                }
            }, { passive: true });
            
            // Reset on touch cancel
            overlay.addEventListener('touchcancel', (e) => {
                const clickableElement = e.target.closest('button, .modal-button, [onclick], [data-action]');
                if (clickableElement) {
                    clickableElement.style.transform = '';
                    clickableElement.style.opacity = '';
                }
            }, { passive: true });
        }
        
        // Close on Escape key
        const escapeHandler = (e) => {
            if (e.key === 'Escape') {
                this.closeModal();
                document.removeEventListener('keydown', escapeHandler);
            }
        };
        document.addEventListener('keydown', escapeHandler);
        
        // Store escape handler for cleanup
        overlay._escapeHandler = escapeHandler;
        
        console.log('✅ Universal modal touch events setup complete');
    }
    
    /**
     * FIXED: Handle modal button actions universally
     */
    handleModalButtonAction(button, content) {
        // Check for data-action attribute first
        const action = button.dataset.action;
        
        if (action === 'close') {
            console.log('App modal button clicked: close');
            this.closeModal();
            return;
        }
        
        // Handle structured modal buttons
        if (content && content.buttons) {
            const buttonText = button.textContent.trim();
            
            // Find matching button config by text or action
            const btnConfig = content.buttons.find(b => {
                return (b.text === buttonText) || 
                       (typeof b.action === 'string' && b.action === action);
            });
            
            if (btnConfig) {
                console.log('App modal button clicked:', action || buttonText);
                
                if (typeof btnConfig.action === 'function') {
                    try {
                        btnConfig.action();
                        this.closeModal();
                    } catch (error) {
                        console.error('Error executing modal action:', error);
                    }
                } else if (btnConfig.action === 'close') {
                    this.closeModal();
                }
                return;
            }
        }
        
        // Handle onclick attribute as fallback
        if (button.onclick) {
            console.log('App modal button clicked: onclick fallback');
            try {
                button.onclick();
            } catch (error) {
                console.error('Error executing onclick:', error);
            }
        }
        
        // Handle onclick attribute as string
        const onclickAttr = button.getAttribute('onclick');
        if (onclickAttr) {
            console.log('App modal button clicked: onclick attribute');
            try {
                // Create a function from the onclick attribute and execute it
                const func = new Function('event', onclickAttr);
                func.call(button, new Event('click'));
            } catch (error) {
                console.error('Error executing onclick attribute:', error);
            }
        }
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
            const minHeight = this.isMobile ? ' style="min-height: 44px; min-width: 44px; padding: 12px 16px; touch-action: manipulation;"' : '';
            
            buttonsHTML += `<button class="${btn.class} modal-button" data-action="${actionAttr}"${style}${minHeight}>${btn.text}</button>`;
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
     * Close current modal
     */
    closeModal() {
        if (this.currentModal) {
            // Clean up escape handler
            if (this.currentModal._escapeHandler) {
                document.removeEventListener('keydown', this.currentModal._escapeHandler);
            }
            
            this.currentModal.remove();
            this.currentModal = null;
            console.log('📱 Modal closed');
        }
    }
    
    /**
     * Show loading state
     */
    showLoading(message = 'Loading...') {
        this.isLoading = true;
        
        const content = `
            <div class="title-score-row">
                <div class="mode-title">Bridge Navigator</div>
                <div class="score-display">Loading...</div>
            </div>
            <div class="game-content">
                <div class="loading-message">${message}</div>
            </div>
            <div class="current-state">Please wait...</div>
        `;
        
        this.updateDisplay(content);
        this.updateButtonStates([]);
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
        
        setTimeout(() => {
            this.display.innerHTML = originalContent;
        }, duration);
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
     * Reset UI to initial state
     */
    reset() {
        this.clearVulnerabilityHighlight();
        this.updateDoubleButton('');
        this.updateVulnerabilityDisplay('None');
        this.closeModal();
        this.hideLoading();
        this.hideHonorsButton();
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

// Make available globally for debugging
if (typeof window !== 'undefined') {
    window.UIController = UIController;
}