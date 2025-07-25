/**
 * Base Bridge Mode - Enhanced with Universal Mobile Touch Support
 * 
 * This base class provides common functionality for all bridge modes
 * with comprehensive mobile touch support for all buttons and modals.
 */

class BaseBridgeMode {
    constructor(gameState, ui) {
        this.gameState = gameState;
        this.ui = ui;
        this.modeName = 'base';
        this.displayName = 'Base Bridge Mode';
        
        // Mobile detection
        this.isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        if (this.isMobile) {
            console.log('📱 Mobile device detected in', this.displayName);
            this.addUniversalMobileCSS();
        }
        
        console.log('🎯 Base bridge mode constructor called for', this.constructor.name);
    }
    
    /**
     * Add universal mobile CSS for all bridge modes
     */
    addUniversalMobileCSS() {
        const existingStyle = document.getElementById('bridge-mode-mobile-css');
        if (existingStyle) return; // Already added
        
        const universalMobileCSS = `
        /* Universal Mobile Touch Support for All Bridge Modes */
        .mobile-device .btn,
        .mobile-device button,
        .mobile-device .modal-button {
            min-height: 44px !important;
            min-width: 44px !important;
            touch-action: manipulation !important;
            user-select: none !important;
            -webkit-tap-highlight-color: transparent !important;
            -webkit-touch-callout: none !important;
            -webkit-user-select: none !important;
            cursor: pointer !important;
        }

        .btn-pressed,
        .button-pressed,
        .modal-button-pressed {
            transform: scale(0.9) !important;
            opacity: 0.7 !important;
            transition: all 0.1s ease !important;
        }

        /* Enhanced touch feedback */
        .mobile-device .btn:active,
        .mobile-device button:active {
            transform: scale(0.9) !important;
            opacity: 0.7 !important;
        }

        @media (max-width: 768px) {
            .btn, button { 
                padding: 12px 8px !important; 
                font-size: 16px !important; 
                line-height: 1.2 !important;
            }
        }
        `;

        const style = document.createElement('style');
        style.id = 'bridge-mode-mobile-css';
        style.textContent = universalMobileCSS;
        document.head.appendChild(style);
        
        console.log('✅ Universal mobile CSS added for bridge modes');
    }
    
    /**
     * Enhanced mobile button setup - works for ANY button
     */
    setupEnhancedMobileButton(buttonElement, handler, context = 'button') {
        if (!this.isMobile || !buttonElement) return buttonElement;
        
        console.log(`📱 Setting up enhanced mobile button: ${context}`);
        
        // Ensure comprehensive mobile touch properties
        buttonElement.style.touchAction = 'manipulation';
        buttonElement.style.userSelect = 'none';
        buttonElement.style.webkitTapHighlightColor = 'transparent';
        buttonElement.style.webkitUserSelect = 'none';
        buttonElement.style.webkitTouchCallout = 'none';
        buttonElement.style.minHeight = '44px';
        buttonElement.style.minWidth = '44px';
        buttonElement.style.cursor = 'pointer';
        
        // Create enhanced mobile-compatible handler
        const enhancedMobileHandler = (e) => {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            
            console.log(`📱 Enhanced mobile button pressed: ${context}`);
            
            // Enhanced visual feedback
            buttonElement.classList.add('button-pressed');
            buttonElement.style.transform = 'scale(0.9)';
            buttonElement.style.opacity = '0.7';
            buttonElement.style.transition = 'all 0.1s ease';
            
            setTimeout(() => {
                buttonElement.classList.remove('button-pressed');
                buttonElement.style.transform = 'scale(1)';
                buttonElement.style.opacity = '1';
            }, 150);
            
            // Enhanced haptic feedback
            if (navigator.vibrate) {
                navigator.vibrate([30]);
            }
            
            // Execute the handler with error catching
            try {
                if (typeof handler === 'function') {
                    handler(e);
                } else {
                    console.warn('Handler is not a function for', context);
                }
            } catch (error) {
                console.error(`Error executing button handler for ${context}:`, error);
            }
        };
        
        // Remove ALL existing listeners by replacing the element
        const newButton = buttonElement.cloneNode(true);
        if (buttonElement.parentNode) {
            buttonElement.parentNode.replaceChild(newButton, buttonElement);
        }
        
        // Add comprehensive event listeners
        if (this.isMobile) {
            // Mobile-specific events
            newButton.addEventListener('touchstart', (e) => {
                e.preventDefault();
                newButton.style.transform = 'scale(0.9)';
                newButton.style.opacity = '0.7';
            }, { passive: false });
            
            newButton.addEventListener('touchend', enhancedMobileHandler, { passive: false });
            
            newButton.addEventListener('touchcancel', (e) => {
                e.preventDefault();
                newButton.style.transform = 'scale(1)';
                newButton.style.opacity = '1';
            }, { passive: false });
        }
        
        // Universal click event (works on both desktop and mobile)
        newButton.addEventListener('click', enhancedMobileHandler, { passive: false });
        
        return newButton;
    }
    
    /**
     * Enhanced mobile modal setup - applies to ANY modal created by bridge modes
     */
    setupEnhancedMobileModal(modalSelector = '.modal-overlay', delay = 200) {
        if (!this.isMobile) return;
        
        setTimeout(() => {
            const modal = document.querySelector(modalSelector);
            if (!modal) {
                console.log('❌ Modal not found for mobile setup:', modalSelector);
                return;
            }
            
            console.log('📱 Setting up enhanced mobile modal support');
            
            // Find all buttons in the modal
            const modalButtons = modal.querySelectorAll('button, .btn, .modal-button, [onclick]');
            
            modalButtons.forEach((button, index) => {
                const buttonText = button.textContent?.trim() || button.className || `button-${index}`;
                console.log(`🔧 Setting up modal button: ${buttonText}`);
                
                // Store original onclick if exists
                const originalOnClick = button.onclick;
                
                // Setup enhanced mobile button
                const enhancedButton = this.setupEnhancedMobileButton(
                    button, 
                    originalOnClick || (() => button.click()), 
                    `modal-${buttonText}`
                );
                
                // Restore original onclick if it existed
                if (originalOnClick && enhancedButton) {
                    enhancedButton.onclick = originalOnClick;
                }
            });
            
            console.log(`✅ Enhanced mobile setup complete for ${modalButtons.length} modal buttons`);
        }, delay);
    }
    
    // Abstract methods that child classes should implement
    initialize() {
        console.log(`🎯 Initializing ${this.displayName}`);
    }
    
    handleAction(value) {
        console.log(`🎮 ${this.displayName} action: ${value}`);
    }
    
    getActiveButtons() {
        return [];
    }
    
    updateDisplay() {
        console.log(`🖼️ Updating ${this.displayName} display`);
    }
    
    getHelpContent() {
        return {
            title: `${this.displayName} Help`,
            content: `<p>Help content for ${this.displayName} not implemented yet.</p>`,
            buttons: [
                { text: 'Close Help', action: 'close', class: 'close-btn' }
            ]
        };
    }
    
    // Optional methods with default implementations
    handleBack() {
        return false; // Cannot go back by default
    }
    
    canGoBack() {
        return false;
    }
    
    toggleVulnerability() {
        console.log(`🎯 ${this.displayName} vulnerability toggle`);
    }
    
    /**
     * Enhanced showModal method with automatic mobile support
     */
    showEnhancedModal(type, content) {
        // Show the modal using the UI controller
        this.ui.showModal(type, content);
        
        // Apply mobile enhancements automatically
        this.setupEnhancedMobileModal();
    }
    
    /**
     * Utility method to create mobile-enhanced buttons programmatically
     */
    createEnhancedButton(text, handler, className = 'btn') {
        const button = document.createElement('button');
        button.textContent = text;
        button.className = className;
        
        if (this.isMobile) {
            return this.setupEnhancedMobileButton(button, handler, `created-${text}`);
        } else {
            button.addEventListener('click', handler);
            return button;
        }
    }
    
    /**
     * Utility method for enhanced button feedback
     */
    provideMobileButtonFeedback(button, duration = 150) {
        if (!this.isMobile || !button) return;
        
        button.classList.add('button-pressed');
        if (navigator.vibrate) navigator.vibrate(30);
        
        setTimeout(() => {
            button.classList.remove('button-pressed');
        }, duration);
    }
    
    /**
     * Enhanced cleanup method
     */
    cleanup() {
        console.log(`🧹 Cleaning up ${this.displayName}`);
        
        // Remove mobile CSS if this is the last bridge mode
        const mobileStyle = document.getElementById('bridge-mode-mobile-css');
        if (mobileStyle && this.constructor.name === 'BaseBridgeMode') {
            mobileStyle.remove();
        }
    }
    
    /**
     * Debug method to test mobile button setup
     */
    debugMobileSetup() {
        if (!this.isMobile) {
            console.log('🖥️ Desktop mode - no mobile debugging needed');
            return;
        }
        
        console.log('🔍 Mobile Debug Info:');
        console.log('- User Agent:', navigator.userAgent);
        console.log('- Touch Support:', 'ontouchstart' in window);
        console.log('- Vibration Support:', !!navigator.vibrate);
        console.log('- Mobile CSS Added:', !!document.getElementById('bridge-mode-mobile-css'));
        
        // Test button setup
        const testButtons = document.querySelectorAll('.btn, button');
        console.log(`- Found ${testButtons.length} buttons to enhance`);
        
        testButtons.forEach((button, index) => {
            const hasTouch = button.style.touchAction === 'manipulation';
            console.log(`  Button ${index}: ${button.textContent?.trim() || 'unnamed'} - Touch: ${hasTouch}`);
        });
    }
}

export { BaseBridgeMode };