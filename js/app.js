/**
 * Complete Enhanced Bridge Modes Calculator - Main Application Controller
 * COMPLETE MOBILE FIX VERSION - Fixes both license entry AND modal buttons
 * - Fixed license code entry mobile touch events
 * - Enhanced modal button mobile support
 * - Comprehensive mobile touch handling
 */

import { UIController } from './ui-controller.js';
import { GameState } from './utils/game-state.js';

/**
 * Enhanced License Manager with TRIAL CODE FIX
 */
class LicenseManager {
    constructor() {
        this.storageKey = 'bridgeAppLicense';
        this.usedCodesKey = 'bridgeAppUsedCodes';
        this.trialDays = 14;
        this.trialDeals = 50;
        this.checksumTarget = 37; // Only for FULL codes
        
        // UPDATED: Trial prefixes - any checksum allowed
        this.trialPrefixes = ['111', '222', '333', '444', '555', '666', '777', '888', '999'];
    }

    checkLicenseStatus() {
        const license = this.getLicenseData();
        
        if (!license) {
            return { 
                status: 'unlicensed', 
                needsCode: true,
                message: 'Enter license code using calculator buttons'
            };
        }

        if (license.type === 'FULL') {
            return { 
                status: 'full', 
                needsCode: false,
                message: 'Full version activated'
            };
        }

        if (license.type === 'TRIAL') {
            return this.checkTrialExpiry(license);
        }

        return { 
            status: 'invalid', 
            needsCode: true,
            message: 'Invalid license. Enter valid code.'
        };
    }

    checkTrialExpiry(license) {
        const now = Date.now();
        const daysElapsed = Math.floor((now - license.activatedAt) / (1000 * 60 * 60 * 24));
        const daysLeft = Math.max(0, this.trialDays - daysElapsed);
        
        const dealsUsed = parseInt(localStorage.getItem('bridgeAppDealsPlayed') || '0');
        const dealsLeft = Math.max(0, this.trialDeals - dealsUsed);

        if (daysLeft <= 0 || dealsLeft <= 0) {
            return {
                status: 'expired',
                needsCode: true,
                message: 'Trial expired - Enter full version code'
            };
        }

        return {
            status: 'trial',
            needsCode: false,
            daysLeft,
            dealsLeft,
            message: `Trial: ${daysLeft} days, ${dealsLeft} deals left`
        };
    }

    // SECURITY FIXED: No checksum hints in error messages
    validateCodeFormat(code) {
        if (!code || code.length !== 6 || !/^\d{6}$/.test(code)) {
            return { valid: false, message: 'License code must be exactly 6 digits' };
        }
        return { valid: true };
    }

    isCodeUsed(code) {
        const usedCodes = this.getUsedCodes();
        return usedCodes.includes(code);
    }

    markCodeAsUsed(code) {
        const usedCodes = this.getUsedCodes();
        if (!usedCodes.includes(code)) {
            usedCodes.push(code);
            localStorage.setItem(this.usedCodesKey, JSON.stringify(usedCodes));
        }
    }

    getUsedCodes() {
        try {
            const data = localStorage.getItem(this.usedCodesKey);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('Error reading used codes:', error);
            return [];
        }
    }

    // TRIAL CODE FIX: Any checksum allowed for trial prefixes
    validateTrialCode(code) {
        const prefix = code.substring(0, 3);
        
        if (!this.trialPrefixes.includes(prefix)) {
            return { valid: false, message: 'Invalid trial code format' };
        }

        console.log(`🆓 Trial code validated: ${code}`);
        return { valid: true, type: 'TRIAL', message: 'Trial code validated' };
    }

    // UPDATED: Full codes must sum to 37 AND not start with trial prefix
    validateFullCode(code) {
        const prefix = code.substring(0, 3);
        
        if (this.trialPrefixes.includes(prefix)) {
            return { valid: false, message: 'This is a trial code, not a full version code' };
        }

        // FULL CODES: Must sum to 37 (SECRET CHECK)
        const digitSum = code.split('').reduce((sum, digit) => sum + parseInt(digit), 0);
        if (digitSum !== this.checksumTarget) {
            return { valid: false, message: 'Invalid license code. Please check and try again.' };
        }

        if (this.isCodeUsed(code)) {
            return { valid: false, message: 'License code already used' };
        }

        return { valid: true, type: 'FULL', message: 'Full version code validated' };
    }

    async validateCode(code) {
        const formatCheck = this.validateCodeFormat(code);
        if (!formatCheck.valid) {
            return formatCheck;
        }

        const prefix = code.substring(0, 3);

        if (this.trialPrefixes.includes(prefix)) {
            return this.validateTrialCode(code);
        }

        return this.validateFullCode(code);
    }

    async activateLicense(code) {
        const validation = await this.validateCode(code);
        
        if (!validation.valid) {
            return { success: false, message: validation.message };
        }

        if (validation.type === 'FULL') {
            this.markCodeAsUsed(code);
        }

        const licenseData = {
            code: code,
            type: validation.type,
            activatedAt: Date.now(),
            activatedDate: new Date().toISOString()
        };

        localStorage.setItem(this.storageKey, JSON.stringify(licenseData));

        return { 
            success: true, 
            message: validation.type === 'FULL' 
                ? 'Full version activated! Unlimited bridge scoring.' 
                : `Trial activated! ${this.trialDays} days or ${this.trialDeals} deals.`
        };
    }

    getLicenseData() {
        try {
            const data = localStorage.getItem(this.storageKey);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Error reading license data:', error);
            return null;
        }
    }

    clearLicense() {
        localStorage.removeItem(this.storageKey);
        localStorage.removeItem('bridgeAppDealsPlayed');
    }

    incrementDealsPlayed() {
        const current = parseInt(localStorage.getItem('bridgeAppDealsPlayed') || '0');
        localStorage.setItem('bridgeAppDealsPlayed', (current + 1).toString());
    }

    static checksumCode(code) {
        return code.split('').reduce((sum, digit) => sum + parseInt(digit), 0);
    }

    static generateTrialCode() {
        const prefixes = ['111', '222', '333', '444', '555', '666', '777', '888', '999'];
        const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
        const lastThree = Array(3).fill(0).map(() => Math.floor(Math.random() * 10)).join('');
        return prefix + lastThree;
    }
}

/**
 * Main Bridge Application - COMPLETE MOBILE FIX VERSION
 */
class BridgeApp {
    constructor() {
        this.currentMode = null;
        this.bridgeModeInstance = null;
        this.gameState = new GameState();
        this.ui = new UIController();
        this.licenseManager = new LicenseManager();
        
        this.appState = 'mode_selection';
        this.availableModes = {
            '1': { name: 'kitchen', display: 'Kitchen Bridge', module: './bridge-modes/kitchen.js' },
            '2': { name: 'bonus', display: 'Bonus Bridge', module: './bridge-modes/bonus.js' },
            '3': { name: 'chicago', display: 'Chicago Bridge', module: './bridge-modes/chicago.js' },
            '4': { name: 'rubber', display: 'Rubber Bridge', module: './bridge-modes/rubber.js' },
            '5': { name: 'duplicate', display: 'Duplicate Bridge', module: './bridge-modes/duplicate.js' }
        };
        
        this.codeEntryMode = false;
        this.enteredCode = '';
        this.isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        this.init();
    }
    
    async init() {
        console.log('🎮 Initializing Bridge Navigator');
        
        if (this.isMobile) {
            console.log('📱 Mobile device detected');
            document.body.classList.add('mobile-device');
            this.addMobileCSS();
            this.initModalButtonPatch(); // TARGETED MOBILE MODAL PATCH
        }
        
        const licenseStatus = this.licenseManager.checkLicenseStatus();
        
        if (licenseStatus.needsCode) {
            await this.ui.init();
            this.enterCodeEntryMode(licenseStatus);
            return;
        }

        if (licenseStatus.status === 'trial') {
            console.log(`📅 Trial Status: ${licenseStatus.message}`);
        }

        try {
            await this.ui.init();
            this.setupEventListeners();
            this.updateDisplay();
            console.log('✅ Bridge Navigator ready');
        } catch (error) {
            console.error('❌ Failed to initialize Bridge Navigator:', error);
            throw error;
        }
    }

    /**
     * TARGETED MOBILE MODAL PATCH: Initialize modal button patch for mobile devices
     */
    initModalButtonPatch() {
        if (!this.isMobile) return;
        
        console.log('📱 Initializing modal button patch for mobile');
        
        // Store the original showModal method
        const originalShowModal = this.ui.showModal.bind(this.ui);
        
        // Patch the showModal method to fix mobile buttons
        this.ui.showModal = (type, content) => {
            console.log(`📱 PATCH: showModal called with type: ${type}`);
            
            // Call the original method first
            const result = originalShowModal(type, content);
            
            // Apply our mobile fix after the modal is created
            setTimeout(() => {
                this.patchModalButtons(content);
            }, 150);
            
            return result;
        };
        
        console.log('✅ Modal button patch initialized');
    }

    /**
     * TARGETED MOBILE MODAL PATCH: Fix modal buttons for mobile touch
     */
    patchModalButtons(content) {
        if (!this.isMobile) return;
        
        console.log('📱 PATCH: Applying mobile button fixes');
        
        const modal = document.querySelector('.modal-overlay');
        if (!modal) {
            console.log('❌ PATCH: No modal found');
            return;
        }
        
        // Find all modal buttons
        const buttons = modal.querySelectorAll('.modal-button, button');
        console.log(`🔍 PATCH: Found ${buttons.length} buttons to fix`);
        
        buttons.forEach((button, index) => {
            const buttonText = button.textContent?.trim() || `Button ${index + 1}`;
            console.log(`🔧 PATCH: Fixing button: "${buttonText}"`);
            
            // Get the data-action attribute (this is how UI Controller identifies buttons)
            const dataAction = button.getAttribute('data-action');
            
            // Apply mobile touch properties
            Object.assign(button.style, {
                touchAction: 'manipulation',
                userSelect: 'none',
                webkitTapHighlightColor: 'transparent',
                cursor: 'pointer',
                minHeight: '44px',
                minWidth: '60px'
            });
            
            // Create the mobile touch handler
            const mobileTouchHandler = (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                console.log(`📱 PATCH: Button touched: "${buttonText}" (action: ${dataAction})`);
                
                // Visual feedback
                button.style.transform = 'scale(0.95)';
                button.style.opacity = '0.8';
                
                // Haptic feedback
                if (navigator.vibrate) navigator.vibrate(50);
                
                // Reset visual state
                setTimeout(() => {
                    button.style.transform = 'scale(1)';
                    button.style.opacity = '1';
                }, 150);
                
                // Execute the action after a small delay
                setTimeout(() => {
                    this.executeModalButtonAction(dataAction, buttonText, content);
                }, 100);
            };
            
            // Remove existing event listeners by cloning the button
            const newButton = button.cloneNode(true);
            
            // Copy all attributes including data-action
            Array.from(button.attributes).forEach(attr => {
                newButton.setAttribute(attr.name, attr.value);
            });
            
            // Apply mobile styles to the new button
            Object.assign(newButton.style, {
                touchAction: 'manipulation',
                userSelect: 'none',
                webkitTapHighlightColor: 'transparent',
                cursor: 'pointer',
                minHeight: '44px',
                minWidth: '60px'
            });
            
            // Add the mobile touch handler
            newButton.addEventListener('touchend', mobileTouchHandler, { passive: false });
            newButton.addEventListener('click', mobileTouchHandler, { passive: false });
            
            // Replace the button in the DOM
            if (button.parentNode) {
                button.parentNode.replaceChild(newButton, button);
                console.log(`✅ PATCH: Button replaced: "${buttonText}"`);
            }
        });
        
        console.log(`🎯 PATCH: Mobile button fixes complete for ${buttons.length} buttons`);
    }

    /**
     * TARGETED MOBILE MODAL PATCH: Execute modal button actions based on data-action and content
     */
    executeModalButtonAction(dataAction, buttonText, content) {
        console.log(`🎯 PATCH: Executing action for "${buttonText}" (${dataAction})`);
        
        try {
            // Handle simple close action
            if (dataAction === 'close') {
                console.log('🎯 PATCH: Closing modal');
                this.ui.closeModal();
                return;
            }
            
            // Handle numbered actions (action-0, action-1, etc.)
            if (dataAction && dataAction.startsWith('action-')) {
                const actionIndex = parseInt(dataAction.split('-')[1]);
                
                if (content && content.buttons && content.buttons[actionIndex]) {
                    const buttonConfig = content.buttons[actionIndex];
                    
                    if (typeof buttonConfig.action === 'function') {
                        console.log(`🎯 PATCH: Executing function action for "${buttonText}"`);
                        buttonConfig.action.call(this);
                        return;
                    } else if (buttonConfig.action === 'close') {
                        console.log(`🎯 PATCH: Closing modal via button config for "${buttonText}"`);
                        this.ui.closeModal();
                        return;
                    }
                }
            }
            
            // Fallback: Direct action mapping based on button text
            const lowerText = buttonText.toLowerCase();
            
            if (lowerText.includes('show scores') || lowerText.includes('scores')) {
                console.log(`🎯 PATCH: Showing scores for "${buttonText}"`);
                this.ui.closeModal();
                setTimeout(() => this.showScoreHistory(), 50);
                
            } else if (lowerText.includes('return to menu') || lowerText.includes('menu')) {
                console.log(`🎯 PATCH: Returning to menu for "${buttonText}"`);
                this.ui.closeModal();
                setTimeout(() => this.returnToModeSelection(), 50);
                
            } else if (lowerText.includes('close app')) {
                console.log(`🎯 PATCH: Showing close instructions for "${buttonText}"`);
                this.ui.closeModal();
                setTimeout(() => this.showCloseAppInstructions(), 50);
                
            } else if (lowerText.includes('enter full') || lowerText.includes('full license')) {
                console.log(`🎯 PATCH: Entering license mode for "${buttonText}"`);
                this.ui.closeModal();
                setTimeout(() => this.enterCodeEntryMode({ message: 'Enter full version license code' }), 50);
                
            } else if (lowerText.includes('close') || lowerText.includes('cancel')) {
                console.log(`🎯 PATCH: Closing modal for "${buttonText}"`);
                this.ui.closeModal();
                
            } else {
                console.log(`⚠️ PATCH: No specific action found for "${buttonText}", trying to close modal`);
                this.ui.closeModal();
            }
            
        } catch (error) {
            console.error(`❌ PATCH: Error executing action for "${buttonText}":`, error);
        }
    }

    /**
     * TARGETED MOBILE MODAL PATCH: Emergency modal button fix (for console testing)
     */
    emergencyModalButtonFix() {
        console.log('🚨 EMERGENCY: Manual modal button fix');
        
        const modal = document.querySelector('.modal-overlay');
        if (!modal) {
            console.log('❌ EMERGENCY: No modal found');
            return;
        }
        
        // Get the last modal content from the quit modal
        const lastContent = {
            buttons: [
                { 
                    text: 'Show Scores', 
                    action: () => {
                        this.ui.closeModal();
                        setTimeout(() => this.showScoreHistory(), 50);
                    }
                },
                { 
                    text: 'Return to Menu', 
                    action: () => {
                        this.ui.closeModal();
                        setTimeout(() => this.returnToModeSelection(), 50);
                    }
                },
                { 
                    text: 'Close App', 
                    action: () => {
                        this.ui.closeModal();
                        setTimeout(() => this.showCloseAppInstructions(), 50);
                    }
                },
                { 
                    text: 'Cancel', 
                    action: 'close'
                }
            ]
        };
        
        this.patchModalButtons(lastContent);
        console.log('✅ EMERGENCY: Modal button fix complete');
    }

    addMobileCSS() {
        const mobileCSS = `
        .mobile-device .btn {
            min-height: 44px !important;
            min-width: 44px !important;
            touch-action: manipulation !important;
            user-select: none !important;
            -webkit-tap-highlight-color: transparent !important;
        }

        .btn-pressed {
            transform: scale(0.95) !important;
            opacity: 0.8 !important;
            transition: all 0.1s ease !important;
        }

        .mobile-device .calculator-buttons .btn {
            cursor: pointer;
            -webkit-touch-callout: none;
        }

        /* MODAL BUTTON MOBILE FIXES */
        .mobile-device .modal-button {
            min-height: 44px !important;
            min-width: 44px !important;
            touch-action: manipulation !important;
            user-select: none !important;
            -webkit-tap-highlight-color: transparent !important;
            cursor: pointer !important;
        }

        .modal-button-pressed {
            transform: scale(0.95) !important;
            opacity: 0.8 !important;
            transition: all 0.1s ease !important;
        }

        @media (max-width: 768px) {
            .calculator-buttons { gap: 8px; }
            .btn { padding: 12px 8px !important; font-size: 16px !important; }
            .modal-button { padding: 12px 16px !important; font-size: 16px !important; }
        }
        `;

        const style = document.createElement('style');
        style.textContent = mobileCSS;
        document.head.appendChild(style);
    }

    enterCodeEntryMode(status) {
        console.log('🔑 Entering code entry mode');
        this.codeEntryMode = true;
        this.enteredCode = '';
        this.appState = 'license_entry';
        this.updateCodeEntryDisplay(status);
        
        // MOBILE FIX: Setup license entry mobile buttons AFTER display update
        setTimeout(() => {
            this.setupMobileLicenseButtons();
            this.updateButtonStates();
        }, 100);
    }

    /**
     * MOBILE FIX: Enhanced mobile license button setup with comprehensive touch handling
     */
    setupMobileLicenseButtons() {
        if (!this.isMobile) return;
        
        console.log('📱 Setting up mobile license entry buttons');
        
        // Remove any existing license button handlers first
        this.removeLicenseButtonHandlers();
        
        const buttons = document.querySelectorAll('.btn');
        console.log(`📱 Found ${buttons.length} license entry buttons to fix`);
        
        this.licenseButtonHandlers = new Map();
        
        buttons.forEach((button, index) => {
            const value = button.dataset.value;
            const buttonText = button.textContent?.trim() || value || `Button ${index}`;
            
            console.log(`📱 Setting up license button: "${buttonText}" (value: ${value})`);
            
            // Apply mobile touch properties
            Object.assign(button.style, {
                touchAction: 'manipulation',
                userSelect: 'none',
                webkitTapHighlightColor: 'transparent',
                webkitUserSelect: 'none',
                cursor: 'pointer'
            });
            
            // Create comprehensive mobile touch handler
            const mobileHandler = (e) => {
                // Only handle if we're in license entry mode
                if (this.appState !== 'license_entry') {
                    console.log(`📱 Skipping button - not in license mode (state: ${this.appState})`);
                    return;
                }
                
                // Prevent default browser behavior
                e.preventDefault();
                e.stopPropagation();
                
                // Check if button is disabled
                if (button.classList.contains('disabled')) {
                    console.log(`📱 Button "${buttonText}" is disabled, ignoring`);
                    return;
                }
                
                console.log(`📱 LICENSE: Button touched: "${buttonText}" (value: ${value})`);
                
                // Visual feedback
                button.classList.add('btn-pressed');
                button.style.transform = 'scale(0.95)';
                button.style.opacity = '0.8';
                
                // Haptic feedback
                if (navigator.vibrate) {
                    navigator.vibrate(50);
                }
                
                // Reset visual state
                setTimeout(() => {
                    button.classList.remove('btn-pressed');
                    button.style.transform = 'scale(1)';
                    button.style.opacity = '1';
                }, 150);
                
                // Execute the license button action
                setTimeout(() => {
                    console.log(`📱 LICENSE: Executing action for "${buttonText}" (${value})`);
                    this.handleCodeEntryButton(value);
                }, 100);
            };
            
            // Store handlers for cleanup
            const handlers = {
                touchstart: (e) => {
                    if (this.appState === 'license_entry' && !button.classList.contains('disabled')) {
                        e.preventDefault();
                        button.style.transform = 'scale(0.95)';
                        button.style.opacity = '0.8';
                    }
                },
                touchend: mobileHandler,
                touchcancel: () => {
                    button.style.transform = 'scale(1)';
                    button.style.opacity = '1';
                    button.classList.remove('btn-pressed');
                },
                click: mobileHandler
            };
            
            // Add all event listeners
            Object.entries(handlers).forEach(([event, handler]) => {
                button.addEventListener(event, handler, { passive: false });
            });
            
            // Store handlers for cleanup
            this.licenseButtonHandlers.set(button, handlers);
        });
        
        console.log(`✅ Mobile license entry buttons setup complete for ${buttons.length} buttons`);
    }
    
    /**
     * MOBILE FIX: Remove license button handlers for cleanup
     */
    removeLicenseButtonHandlers() {
        if (this.licenseButtonHandlers) {
            this.licenseButtonHandlers.forEach((handlers, button) => {
                Object.entries(handlers).forEach(([event, handler]) => {
                    button.removeEventListener(event, handler);
                });
            });
            this.licenseButtonHandlers.clear();
        }
    }

    // SECURITY FIXED: No checksum hints in display
    updateCodeEntryDisplay(status = null) {
        const statusMessage = status ? status.message : 'Enter 6-digit license code';
        const displayCode = this.enteredCode.padEnd(6, '_').split('').join(' ');
        
        const content = `
            <div class="title-score-row">
                <div class="mode-title">🔑 License Code</div>
                <div class="score-display">Bridge<br>Navigator</div>
            </div>
            <div class="game-content">
                <div style="text-align: center; margin: 10px 0;">
                    <div style="font-size: 18px; font-weight: bold; color: #3498db; margin-bottom: 8px; font-family: monospace;">
                        ${displayCode}
                    </div>
                    <div style="font-size: 12px; color: #666; margin-bottom: 8px;">
                        ${statusMessage}
                    </div>
                    <div style="font-size: 10px; color: #999;">
                        Enter your 6-digit Bridge Navigator license code
                    </div>
                </div>
            </div>
            <div class="current-state">
                Use number buttons. BACK to delete, DEAL to submit
            </div>
        `;
        
        this.ui.updateDisplay(content);
    }

    setupEventListeners() {
        this.removeEventListeners();
        
        this.boundHandlers = {
            buttonClick: this.handleButtonClick.bind(this),
            keyDown: this.handleKeyPress.bind(this)
        };

        this.setupButtonEventListeners();
        this.setupControlEventListeners();
        document.addEventListener('keydown', this.boundHandlers.keyDown);
    }

    setupButtonEventListeners() {
        const calculator = document.querySelector('.calculator-container') || document.body;
        
        const buttonHandler = (event) => {
            if (this.appState === 'license_entry') {
                // Let setupMobileLicenseButtons handle license entry
                return;
            }
            
            if (event.type === 'touchend') {
                event.preventDefault();
            }
            
            const button = event.target.closest('.btn');
            if (button && !button.classList.contains('disabled')) {
                this.provideMobileButtonFeedback(button);
                this.handleButtonClick(button.dataset.value);
            }
        };

        calculator.addEventListener('click', buttonHandler);
        calculator.addEventListener('touchend', buttonHandler);
        
        this.calculatorElement = calculator;
        this.buttonHandler = buttonHandler;
    }

    provideMobileButtonFeedback(button) {
        button.classList.add('btn-pressed');
        setTimeout(() => button.classList.remove('btn-pressed'), 150);
        if (navigator.vibrate) navigator.vibrate(50);
    }

    setupControlEventListeners() {
        const controls = [
            { id: '#wakeControl', handler: () => this.ui.toggleKeepAwake() },
            { id: '#vulnControl', handler: () => this.handleVulnerabilityToggle() },
            { id: '#honorsControl', handler: () => this.handleHonorsClick() },
            { id: '#helpControl', handler: () => this.showHelp() },
            { id: '#quitControl', handler: () => this.showQuit() }
        ];

        controls.forEach(({ id, handler }) => {
            const element = document.querySelector(id);
            if (element) {
                element.addEventListener('click', handler);
                element.addEventListener('touchend', (e) => {
                    e.preventDefault();
                    handler();
                });
                element._bridgeAppHandler = handler;
            }
        });
    }

    removeEventListeners() {
        if (this.boundHandlers) {
            document.removeEventListener('keydown', this.boundHandlers.keyDown);
        }
        
        if (this.calculatorElement && this.buttonHandler) {
            this.calculatorElement.removeEventListener('click', this.buttonHandler);
            this.calculatorElement.removeEventListener('touchend', this.buttonHandler);
        }
        
        // MOBILE FIX: Clean up license button handlers
        this.removeLicenseButtonHandlers();
        
        const controls = ['#wakeControl', '#vulnControl', '#honorsControl', '#helpControl', '#quitControl'];
        controls.forEach(id => {
            const element = document.querySelector(id);
            if (element && element._bridgeAppHandler) {
                element.removeEventListener('click', element._bridgeAppHandler);
                element.removeEventListener('touchend', element._bridgeAppHandler);
                delete element._bridgeAppHandler;
            }
        });
    }
    
    async handleButtonClick(value) {
        console.log(`🎯 Button pressed: ${value} in state: ${this.appState}`);
        
        try {
            if (this.appState === 'license_entry') {
                this.handleCodeEntryButton(value);
            } else if (this.appState === 'mode_selection') {
                await this.handleModeSelection(value);
            } else if (value === 'BACK') {
                this.handleBack();
            } else {
                await this.handleBridgeModeAction(value);
            }
            
            this.updateDisplay();
            
        } catch (error) {
            console.error('Error handling button click:', error);
            this.ui.showError(`Error: ${error.message}`);
        }
    }

    handleCodeEntryButton(value) {
        console.log(`🔑 LICENSE: Processing button: ${value}`);
        
        if (value === 'BACK') {
            this.enteredCode = this.enteredCode.slice(0, -1);
            console.log(`🔑 LICENSE: Deleted digit, code now: ${this.enteredCode}`);
        } else if (value === 'DEAL') {
            console.log(`🔑 LICENSE: Submitting code: ${this.enteredCode}`);
            this.submitLicenseCode();
            return;
        } else if (['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'].includes(value)) {
            if (this.enteredCode.length < 6) {
                this.enteredCode += value;
                console.log(`🔑 LICENSE: Added digit ${value}, code now: ${this.enteredCode}`);
            } else {
                console.log(`🔑 LICENSE: Code already 6 digits, ignoring: ${value}`);
            }
        } else {
            console.log(`🔑 LICENSE: Unrecognized button: ${value}`);
        }
        
        this.updateCodeEntryDisplay();
        this.updateButtonStates();
    }

    async submitLicenseCode() {
        if (this.enteredCode.length !== 6) {
            this.ui.showError('Code must be 6 digits');
            return;
        }

        console.log(`🔑 LICENSE: Validating code: ${this.enteredCode}`);
        const result = await this.licenseManager.activateLicense(this.enteredCode);

        if (result.success) {
            console.log(`✅ LICENSE: Code accepted: ${this.enteredCode}`);
            this.ui.showSuccess(result.message, 3000);
            setTimeout(() => {
                this.codeEntryMode = false;
                this.enteredCode = '';
                this.appState = 'mode_selection';
                this.removeLicenseButtonHandlers(); // Clean up mobile handlers
                this.init();
            }, 3000);
        } else {
            console.log(`❌ LICENSE: Code rejected: ${this.enteredCode} - ${result.message}`);
            this.ui.showError(result.message);
            this.enteredCode = '';
            this.updateCodeEntryDisplay();
        }
    }
    
    async handleBridgeModeAction(value) {
        if (this.bridgeModeInstance) {
            this.bridgeModeInstance.handleAction(value);
        }
    }
    
    handleHonorsClick() {
        if (this.bridgeModeInstance && this.currentMode === 'rubber') {
            this.bridgeModeInstance.handleAction('HONORS');
        }
    }
    
    async handleModeSelection(value) {
        const modeConfig = this.availableModes[value];
        if (!modeConfig) return;
        
        try {
            this.ui.showLoading(`Loading ${modeConfig.display}...`);
            const { default: BridgeMode } = await import(modeConfig.module);
            this.bridgeModeInstance = new BridgeMode(this.gameState, this.ui);
            this.currentMode = modeConfig.name;
            this.gameState.setMode(modeConfig.name);
            this.appState = 'bridge_mode';
        } catch (error) {
            console.error(`Failed to load ${modeConfig.display}:`, error);
            if (value !== '1') {
                this.ui.showError(`${modeConfig.display} not available yet. Loading Kitchen Bridge...`);
                setTimeout(() => this.handleModeSelection('1'), 2000);
            } else {
                throw new Error(`Kitchen Bridge failed to load: ${error.message}`);
            }
        }
    }
    
    handleBack() {
        if (this.bridgeModeInstance && this.bridgeModeInstance.canGoBack()) {
            this.bridgeModeInstance.handleBack();
        } else {
            this.returnToModeSelection();
        }
    }
    
    returnToModeSelection() {
        if (this.bridgeModeInstance) {
            this.bridgeModeInstance.cleanup?.();
            this.bridgeModeInstance = null;
        }
        
        this.currentMode = null;
        this.appState = 'mode_selection';
        this.gameState.reset();
        this.ui.reset();
        this.removeLicenseButtonHandlers(); // Clean up any mobile handlers
        this.updateDisplay();
    }
    
    handleVulnerabilityToggle() {
        if (this.bridgeModeInstance) {
            this.bridgeModeInstance.toggleVulnerability();
        }
    }
    
    handleKeyPress(event) {
        const key = event.key;
        
        if (['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'].includes(key)) {
            event.preventDefault();
            this.handleButtonClick(key);
        } else if (key === 'Backspace' || key === 'Escape') {
            event.preventDefault();
            this.handleButtonClick('BACK');
        } else if (key === 'Enter' || key === ' ') {
            event.preventDefault();
            if (this.appState === 'license_entry') {
                this.handleButtonClick('DEAL');
            } else if (this.appState === 'mode_selection') {
                this.handleButtonClick('1');
            }
        }
    }
    
    updateDisplay() {
        if (this.appState === 'license_entry') {
            return;
        } else if (this.appState === 'mode_selection') {
            this.updateModeSelectionDisplay();
        } else if (this.bridgeModeInstance) {
            this.bridgeModeInstance.updateDisplay();
        }
        
        this.updateButtonStates();
    }
    
    updateModeSelectionDisplay() {
        const licenseStatus = this.licenseManager.checkLicenseStatus();
        let trialInfo = '';
        
        if (licenseStatus.status === 'trial') {
            trialInfo = `<div style="color: #f39c12; font-size: 11px; margin-top: 5px;">
                Trial: ${licenseStatus.daysLeft}d / ${licenseStatus.dealsLeft} deals left
            </div>`;
        } else if (licenseStatus.status === 'full') {
            trialInfo = `<div style="color: #27ae60; font-size: 11px; margin-top: 5px;">
                ✅ Full Version Activated
            </div>`;
        }

        const content = `
            <div class="title-score-row">
                <div class="mode-title">Bridge Navigator</div>
                <div class="score-display">
                    NS: ${this.gameState.getScore('NS')}<br>
                    EW: ${this.gameState.getScore('EW')}
                </div>
            </div>
            <div class="game-content">
                <div>Select scoring mode:<br>
                1-Kitchen  2-Bonus  3-Chicago  4-Rubber  5-Duplicate</div>
                ${trialInfo}
            </div>
            <div class="current-state">Press 1-5 to select mode</div>
        `;
        
        this.ui.updateDisplay(content);
    }
    
    updateButtonStates() {
        let activeButtons = [];
        
        if (this.appState === 'license_entry') {
            activeButtons = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'BACK'];
            if (this.enteredCode.length === 6) {
                activeButtons.push('DEAL');
            }
        } else if (this.appState === 'mode_selection') {
            activeButtons = ['1', '2', '3', '4', '5'];
        } else if (this.bridgeModeInstance) {
            activeButtons = this.bridgeModeInstance.getActiveButtons();
            if (this.bridgeModeInstance.canGoBack && this.bridgeModeInstance.canGoBack()) {
                if (!activeButtons.includes('BACK')) {
                    activeButtons.push('BACK');
                }
            }
        }
        
        this.ui.updateButtonStates(activeButtons);
    }
    
    showHelp() {
        let helpContent;
        
        if (this.bridgeModeInstance) {
            helpContent = this.bridgeModeInstance.getHelpContent();
        } else if (this.appState === 'license_entry') {
            helpContent = this.getLicenseHelpContent();
        } else {
            helpContent = this.getMainHelpContent();
        }
        
        this.ui.showModal('help', helpContent);
    }

    // UPDATED: Main help with your email
    getMainHelpContent() {
        const licenseStatus = this.licenseManager.checkLicenseStatus();
        let licenseSection = '';
        let upgradeButton = null;
        
        if (licenseStatus.status === 'trial') {
            licenseSection = `
                <div class="help-section">
                    <h4>📅 Current License Status</h4>
                    <div style="background: rgba(241, 196, 15, 0.1); padding: 15px; border-radius: 8px; margin: 10px 0; border-left: 4px solid #f1c40f;">
                        <p><strong>Trial Version Active</strong></p>
                        <p>⏰ <strong>${licenseStatus.daysLeft} days remaining</strong></p>
                        <p>🃏 <strong>${licenseStatus.dealsLeft} deals remaining</strong></p>
                    </div>
                </div>
            `;
            
            upgradeButton = { 
                text: 'Enter Full License', 
                action: () => {
                    console.log('🎯 Enter Full License button action called');
                    this.ui.closeModal();
                    setTimeout(() => {
                        this.enterCodeEntryMode({ message: 'Enter full version license code' });
                    }, 100);
                }, 
                class: 'modal-button',
                style: 'background: #27ae60 !important;'
            };
        } else if (licenseStatus.status === 'full') {
            licenseSection = `
                <div class="help-section">
                    <h4>✅ Current License Status</h4>
                    <div style="background: rgba(39, 174, 96, 0.1); padding: 15px; border-radius: 8px; margin: 10px 0; border-left: 4px solid #27ae60;">
                        <p><strong>Full Version Activated</strong></p>
                        <p>🔓 <strong>Unlimited Access</strong></p>
                    </div>
                </div>
            `;
        }

        const buttons = [{ text: 'Close Help', action: 'close', class: 'close-btn' }];
        if (upgradeButton) buttons.unshift(upgradeButton);

        return {
            title: 'Bridge Navigator Help',
            content: `
                ${licenseSection}
                
                <div class="help-section">
                    <h4>🃏 Available Bridge Game Modes</h4>
                    <ul>
                        <li><strong>Kitchen Bridge (1):</strong> Simplified social scoring</li>
                        <li><strong>Bonus Bridge (2):</strong> HCP-based bonus system</li>
                        <li><strong>Chicago Bridge (3):</strong> 4-deal vulnerability cycle</li>
                        <li><strong>Rubber Bridge (4):</strong> Traditional rubber scoring</li>
                        <li><strong>Duplicate Bridge (5):</strong> Tournament-style scoring</li>
                    </ul>
                </div>
                
                <div class="help-section">
                    <h4>🎮 Controls</h4>
                    <ul>
                        <li><strong>Wake:</strong> Keep screen active</li>
                        <li><strong>Vuln:</strong> Vulnerability control</li>
                        <li><strong>Honors:</strong> Honor bonuses (Rubber only)</li>
                        <li><strong>Help:</strong> Context help</li>
                        <li><strong>Quit:</strong> Exit options</li>
                    </ul>
                </div>
                
                <div class="help-section">
                    <h4>📞 Support & Contact</h4>
                    <div style="background: #f8f9fa; padding: 12px; border-radius: 6px; margin: 10px 0;">
                        <p style="margin: 0; font-weight: bold;">
                            📧 Email: <a href="mailto:mike.chris.smith@gmail.com" style="color: #3498db;">mike.chris.smith@gmail.com</a>
                        </p>
                    </div>
                    <p style="font-size: 12px; color: #666;">
                        • License codes and technical support<br>
                        • Feature requests and feedback
                    </p>
                </div>
            `,
            buttons: buttons
        };
    }

    getLicenseHelpContent() {
        return {
            title: '🔑 License Code Help',
            content: `
                <div class="help-section">
                    <h4>How to Enter License Code</h4>
                    <ul>
                        <li><strong>Use number buttons 0-9</strong> to enter your code</li>
                        <li><strong>BACK button</strong> deletes last digit</li>
                        <li><strong>DEAL button</strong> submits code</li>
                    </ul>
                </div>
                
                <div class="help-section">
                    <h4>Need a License Code?</h4>
                    <div style="background: #e3f2fd; padding: 12px; border-radius: 6px;">
                        <p style="margin: 0; font-weight: bold;">Contact us:</p>
                        <p style="margin: 5px 0 0 0;">
                            📧 <a href="mailto:mike.chris.smith@gmail.com" style="color: #1976d2;">mike.chris.smith@gmail.com</a>
                        </p>
                    </div>
                </div>
            `,
            buttons: [
                { text: 'Close Help', action: 'close', class: 'close-btn' }
            ]
        };
    }
    
    showQuit() {
        if (this.appState === 'license_entry') {
            this.showLicenseQuitOptions();
            return;
        }

        const quitContent = {
            title: 'Exit Bridge Navigator',
            content: 'What would you like to do?',
            buttons: [
                { 
                    text: 'Show Scores', 
                    action: () => {
                        console.log('🎯 Show Scores button action called');
                        this.ui.closeModal();
                        setTimeout(() => this.showScoreHistory(), 50);
                    }, 
                    class: 'modal-button',
                    style: 'background: #3498db !important;'
                },
                { 
                    text: 'Return to Menu', 
                    action: () => {
                        console.log('🎯 Return to Menu button action called');
                        this.ui.closeModal();
                        setTimeout(() => this.returnToModeSelection(), 50);
                    }, 
                    class: 'menu-btn modal-button' 
                },
                { 
                    text: 'Close App', 
                    action: () => {
                        console.log('🎯 Close App button action called');
                        this.ui.closeModal();
                        setTimeout(() => this.showCloseAppInstructions(), 50);
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
        
        console.log('📱 Showing quit modal with targeted mobile patch');
        this.ui.showModal('quit', quitContent);
    }

    showLicenseQuitOptions() {
        const quitContent = {
            title: 'Exit License Entry',
            content: 'Bridge Navigator requires a valid license to continue.',
            buttons: [
                { 
                    text: 'Close App', 
                    action: () => {
                        console.log('🎯 Close App button action called');
                        this.ui.closeModal();
                        setTimeout(() => this.showCloseAppInstructions(), 50);
                    }, 
                    class: 'close-app-btn modal-button' 
                },
                { 
                    text: 'Continue Entry', 
                    action: 'close', 
                    class: 'modal-button' 
                }
            ]
        };
        
        this.ui.showModal('quit', quitContent);
    }
    
    showCloseAppInstructions() {
        this.ui.releaseWakeLock();
        
        const isPWA = window.navigator.standalone || window.matchMedia('(display-mode: standalone)').matches;
        const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        let message = '';
        if (isPWA || isMobile) {
            message = `📱 Close Bridge Navigator

On Mobile/Tablet:
• Use your device's app switcher and swipe up to close
• Press home button to minimize the app

✅ Your progress is automatically saved!`;
        } else {
            message = `💻 Close Bridge Navigator

To close the app:
• Close this browser tab or window

✅ Your progress is automatically saved!`;
        }
        
        alert(message);
        this.ui.closeModal();
    }
    
    showScoreHistory() {
        try {
            const existingModals = document.querySelectorAll('.modal-overlay, .score-modal');
            existingModals.forEach(modal => modal.remove());
            
            const modal = document.createElement('div');
            modal.className = 'score-modal';
            modal.style.cssText = `
                position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
                background: rgba(0, 0, 0, 0.9); z-index: 999999;
                display: flex; justify-content: center; align-items: center;
                font-family: Arial, sans-serif;
            `;
            
            const history = this.gameState.getHistory();
            const scores = this.gameState.getScores();
            
            let content = `
                <div style="background: white; color: black; padding: 30px; border-radius: 10px;
                           max-width: 80vw; max-height: 80vh; overflow-y: auto;
                           box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
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
                content += `<div style="text-align: center; padding: 20px; color: #666;">
                    <p>Score history available in bridge mode display</p>
                </div>`;
            } else {
                content += `<div style="text-align: center; padding: 40px; color: #7f8c8d;">
                    <h3>No deals completed yet</h3>
                    <p>Start playing to see your score history!</p>
                </div>`;
            }
            
            content += `
                    <div style="text-align: center; margin-top: 20px;">
                        <button onclick="this.closest('.score-modal').remove(); window.bridgeApp.showQuit();" 
                                class="score-modal-btn"
                                style="background: #3498db; color: white; border: none; padding: 12px 24px; 
                                       border-radius: 5px; font-size: 16px; margin-right: 10px; cursor: pointer;
                                       min-height: 44px; touch-action: manipulation;">
                            Back to Quit Menu
                        </button>
                        <button onclick="this.closest('.score-modal').remove();" 
                                class="score-modal-btn"
                                style="background: #95a5a6; color: white; border: none; padding: 12px 24px; 
                                       border-radius: 5px; font-size: 16px; cursor: pointer;
                                       min-height: 44px; touch-action: manipulation;">
                            Close
                        </button>
                    </div>
                </div>
            `;
            
            modal.innerHTML = content;
            modal.addEventListener('click', (e) => {
                if (e.target === modal) modal.remove();
            });
            
            document.body.appendChild(modal);
            
            // Set global reference for button callbacks
            window.bridgeApp = this;
            
            // MOBILE FIX: Apply mobile touch to score modal buttons
            if (this.isMobile) {
                setTimeout(() => {
                    const scoreButtons = modal.querySelectorAll('.score-modal-btn');
                    scoreButtons.forEach(button => {
                        // Apply mobile properties
                        button.style.touchAction = 'manipulation';
                        button.style.userSelect = 'none';
                        button.style.webkitTapHighlightColor = 'transparent';
                        
                        const mobileHandler = (e) => {
                            e.preventDefault();
                            button.style.transform = 'scale(0.95)';
                            button.style.opacity = '0.8';
                            
                            if (navigator.vibrate) navigator.vibrate(30);
                            
                            setTimeout(() => {
                                button.style.transform = 'scale(1)';
                                button.style.opacity = '1';
                                button.click();
                            }, 150);
                        };
                        
                        button.addEventListener('touchend', mobileHandler, { passive: false });
                    });
                }, 100);
            }
            
        } catch (error) {
            console.error('Error creating score history:', error);
            alert('Error showing score history.');
        }
    }
    
    getModeDisplayName(mode) {
        const names = {
            'kitchen': 'Kitchen Bridge',
            'bonus': 'Bonus Bridge', 
            'chicago': 'Chicago Bridge',
            'rubber': 'Rubber Bridge',
            'duplicate': 'Duplicate Bridge'
        };
        return names[mode] || 'Bridge Navigator';
    }

    onDealCompleted() {
        this.licenseManager.incrementDealsPlayed();
        
        const licenseStatus = this.licenseManager.checkLicenseStatus();
        if (licenseStatus.needsCode) {
            this.ui.showError('Trial expired! Enter full version code.');
            setTimeout(() => {
                this.enterCodeEntryMode(licenseStatus);
            }, 2000);
        }
    }
    
    getCurrentMode() {
        return this.currentMode;
    }
    
    getAppState() {
        return this.appState;
    }

    cleanup() {
        this.removeEventListeners();
        if (this.bridgeModeInstance && this.bridgeModeInstance.cleanup) {
            this.bridgeModeInstance.cleanup();
        }
    }
}

// Export and make globally accessible
export { BridgeApp, LicenseManager };
window.BridgeApp = BridgeApp;

// Development utilities
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    function generateSampleCodes() {
        console.log('\n📝 Sample Trial Codes (any sum allowed):');
        for (let i = 0; i < 5; i++) {
            const code = LicenseManager.generateTrialCode();
            console.log(`${code} (sum: ${LicenseManager.checksumCode(code)}) - TRIAL`);
        }
        
        console.log('\n🔐 Sample Full Codes for testing:');
        console.log('730999 (7+3+0+9+9+9 = 37) - FULL');
        console.log('775558 (7+7+5+5+5+8 = 37) - FULL');
        console.log('109999 (1+0+9+9+9+9 = 37) - FULL');
    }
    
    function clearTestLicense() {
        localStorage.removeItem('bridgeAppLicense');
        localStorage.removeItem('bridgeAppDealsPlayed');
        localStorage.removeItem('bridgeAppUsedCodes');
        console.log('🧹 License cleared for testing');
    }
    
    window.generateSampleCodes = generateSampleCodes;
    window.clearTestLicense = clearTestLicense;
    window.LicenseManager = LicenseManager;
    
    generateSampleCodes();
    console.log('\n🛠️ Testing utilities:');
    console.log('• clearTestLicense() - Clear license for testing');
    console.log('• generateSampleCodes() - Generate sample codes');
    console.log('• LicenseManager.checksumCode("123456") - Check code sum');
}