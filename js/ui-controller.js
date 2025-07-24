/**
 * UI Controller - Manages all user interface interactions and display updates
 * MOBILE FIXED VERSION - Handles button states, modals, display panel, and UI utilities
 * Fixed modal touch events for mobile devices (Pixel 9a, etc.)
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
        
        // Mobile CSS injected flag
        this.mobileModalCSSInjected = false;
    }
    
    /**
     * Initialize UI Controller
     */
    async init() {
        console.log('🖥️ Initializing UI Controller');
        
        try {
            this.cacheElements();
            this.setupWakeLock();
            
            // Inject mobile modal CSS if needed
            if (this.isMobile && !this.mobileModalCSSInjected) {
                this.injectMobileModalCSS();
            }
            
            console.log('✅ UI Controller ready');
            
        } catch (error) {
            console.error('❌ Failed to initialize UI Controller:', error);
            throw error;
        }
    }
    
    /**
     * MOBILE FIX: Inject CSS for mobile modal support
     */
    injectMobileModalCSS() {
        const mobileModalCSS = `
        /* Mobile modal button fixes */
        .mobile-device .modal-overlay button,
        .mobile-device [class*="modal"] button,
        .mobile-device .modal-content button {
            min-height: 44px !important;
            min-width: 44px !important;
            touch-action: manipulation !important;
            user-select: none !important;
            -webkit-tap-highlight-color: transparent !important;
            -webkit-user-select: none !important;
            cursor: pointer !important;
            border: none !important;
            border-radius: 6px !important;
            font-weight: bold !important;
            transition: all 0.1s ease !important;
        }

        /* Hand Analysis modal specific fixes */
        .mobile-device .hcp-analysis button,
        .mobile-device .modal-content button {
            padding: 12px 16px !important;
            margin: 6px !important;
            font-size: 16px !important;
        }

        /* Increment/Decrement buttons */
        .mobile-device .increment-btn,
        .mobile-device .decrement-btn,
        .mobile-device button[onclick*="increment"],
        .mobile-device button[onclick*="decrement"],
        .mobile-device button[onclick*="++"],
        .mobile-device button[onclick*="--"] {
            min-height: 48px !important;
            min-width: 48px !important;
            font-size: 20px !important;
            line-height: 1 !important;
            padding: 8px !important;
        }

        /* Modal overlay touch handling */
        .mobile-device .modal-overlay {
            touch-action: manipulation !important;
            -webkit-overflow-scrolling: touch !important;
        }

        /* Better button feedback on mobile */
        .mobile-device .modal-overlay button:active,
        .mobile-device [class*="modal"] button:active,
        .mobile-device .modal-content button:active {
            transform: scale(0.95) !important;
            opacity: 0.8 !important;
        }

        /* Modal button pressed state */
        .mobile-device .modal-btn-pressed {
            transform: scale(0.95) !important;
            opacity: 0.8 !important;
            background-color: rgba(59, 130, 246, 0.8) !important;
        }

        /* Ensure modal content is scrollable on mobile */
        .mobile-device .modal-content {
            max-height: 85vh !important;
            overflow-y: auto !important;
            -webkit-overflow-scrolling: touch !important;
        }
        `;

        const style = document.createElement('style');
        style.id = 'mobile-modal-css';
        style.textContent = mobileModalCSS;
        document.head.appendChild(style);
        
        this.mobileModalCSSInjected = true;
        console.log('📱 Mobile modal CSS injected');
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
     * MOBILE FIXED: Show modal dialog with mobile touch support
     */
    showModal(type, content) {
        console.log('🖼️ Showing modal type:', type);
        
        // Remove any existing modal
        this.closeModal();
        
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        
        // Add mobile class if needed
        if (this.isMobile) {
            overlay.classList.add('mobile-modal');
        }
        
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
            `;
            
            if (type === 'history') {
                modalContent.style.maxWidth = '95%';
                modalContent.style.width = 'auto';
                modalContent.style.minWidth = '600px';
            } else {
                modalContent.style.maxWidth = '90%';
            }
        }
        
        document.body.appendChild(overlay);
        this.currentModal = overlay;
        
        // MOBILE FIX: Setup modal events with mobile support
        this.setupModalEvents(overlay, content);
        
        // MOBILE FIX: Setup mobile touch events after DOM is ready
        if (this.isMobile) {
            setTimeout(() => {
                this.setupModalTouchEvents(overlay);
            }, 100);
        }
        
        console.log('✅ Modal setup complete with mobile support');
    }
    
    /**
     * MOBILE FIX: Setup touch events for modal buttons
     */
    setupModalTouchEvents(modalElement) {
        if (!modalElement) return;
        
        console.log('📱 Setting up modal touch events');
        
        // Get all interactive elements in the modal
        const interactiveElements = modalElement.querySelectorAll('button, .btn, [onclick], [data-action]');
        
        interactiveElements.forEach((element, index) => {
            console.log(`📱 Setting up modal element ${index}:`, element.textContent || element.innerHTML);
            
            // Ensure mobile touch properties
            element.style.touchAction = 'manipulation';
            element.style.userSelect = 'none';
            element.style.webkitTapHighlightColor = 'transparent';
            element.style.webkitUserSelect = 'none';
            
            // Ensure minimum touch target size
            if (!element.style.minHeight) element.style.minHeight = '44px';
            if (!element.style.minWidth) element.style.minWidth = '44px';
            
            // Store original handlers
            const originalOnclick = element.onclick;
            const originalOnclickAttr = element.getAttribute('onclick');
            
            // Create mobile-compatible handler
            const mobileHandler = (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                console.log('📱 Modal element touched:', element.textContent || element.innerHTML);
                
                // Visual feedback
                element.classList.add('modal-btn-pressed');
                setTimeout(() => {
                    element.classList.remove('modal-btn-pressed');
                }, 150);
                
                // Haptic feedback
                if (navigator.vibrate) {
                    navigator.vibrate(30);
                }
                
                // Execute original action
                try {
                    if (originalOnclick) {
                        originalOnclick.call(element, e);
                    } else if (originalOnclickAttr) {
                        // Create a function from the onclick attribute
                        const func = new Function('event', originalOnclickAttr);
                        func.call(element, e);
                    }
                } catch (error) {
                    console.error('Error executing modal action:', error);
                }
            };
            
            // Remove existing listeners by cloning element
            const newElement = element.cloneNode(true);
            element.parentNode.replaceChild(newElement, element);
            
            // Add mobile touch events
            newElement.addEventListener('touchstart', (e) => {
                e.preventDefault();
                newElement.style.transform = 'scale(0.95)';
                newElement.style.opacity = '0.8';
            }, { passive: false });
            
            newElement.addEventListener('touchend', mobileHandler, { passive: false });
            newElement.addEventListener('click', mobileHandler, { passive: false });
            
            // Restore transform on touch cancel
            newElement.addEventListener('touchcancel', () => {
                newElement.style.transform = 'scale(1)';
                newElement.style.opacity = '1';
            }, { passive: true });
        });
        
        console.log(`📱 Mobile touch events setup complete for ${interactiveElements.length} elements`);
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
     * MOBILE ENHANCED: Setup modal event listeners with mobile support
     */
    setupModalEvents(overlay, content) {
        // Background click to close
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                this.closeModal();
                return;
            }
        });
        
        // Handle structured modal button clicks
        overlay.addEventListener('click', (e) => {
            const button = e.target.closest('.modal-button');
            if (button) {
                e.preventDefault();
                e.stopPropagation();
                
                const action = button.dataset.action;
                console.log('Modal button clicked:', action);
                
                if (action === 'close') {
                    this.closeModal();
                } else if (content && content.buttons) {
                    const btnConfig = content.buttons.find(b => {
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
        
        // Store escape handler for cleanup
        overlay._escapeHandler = escapeHandler;
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
    
    /**
     * DEBUGGING: Emergency modal fix for console testing
     */
    emergencyModalFix() {
        console.log('🚨 Emergency modal touch fix activated');
        
        const modal = this.currentModal;
        if (!modal) {
            console.log('❌ No modal found');
            return;
        }
        
        this.setupModalTouchEvents(modal);
        console.log('✅ Emergency modal fix complete');
    }
}

// Export the UI Controller
export { UIController };

// Make available globally for debugging
if (typeof window !== 'undefined') {
    window.UIController = UIController;
}