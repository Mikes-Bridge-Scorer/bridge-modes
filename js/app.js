/**
 * Complete Enhanced Bridge Modes Calculator - Main Application Controller
 * MOBILE FIXED VERSION with LICENSE ENTRY TOUCH FIX
 * Handles mode selection, UI coordination, bridge mode management, and licensing
 * Fixed Pixel 9a button interaction issues in license entry mode
 */

import { UIController } from './ui-controller.js';
import { GameState } from './utils/game-state.js';

/**
 * Enhanced License Manager - Option B Implementation with Testing
 */
class LicenseManager {
    constructor() {
        this.storageKey = 'bridgeAppLicense';
        this.usedCodesKey = 'bridgeAppUsedCodes';
        this.trialDays = 14;
        this.trialDeals = 50;
        this.checksumTarget = 37; // All valid codes must sum to 37
        
        // Trial prefixes (first 3 digits) - these determine if it's a trial code
        this.trialPrefixes = ['111', '222', '333', '444', '555'];
    }

    /**
     * Check current license status
     */
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

    /**
     * Check if trial has expired
     */
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

    /**
     * Validate code format and checksum
     */
    validateCodeFormat(code) {
        if (!code || code.length !== 6 || !/^\d{6}$/.test(code)) {
            return { valid: false, message: 'Code must be 6 digits' };
        }

        // Check if digits sum to 37
        const digitSum = code.split('').reduce((sum, digit) => sum + parseInt(digit), 0);
        if (digitSum !== this.checksumTarget) {
            return { valid: false, message: 'Invalid code' };
        }

        return { valid: true };
    }

    /**
     * Check if code has been used before
     */
    isCodeUsed(code) {
        const usedCodes = this.getUsedCodes();
        return usedCodes.includes(code);
    }

    /**
     * Mark code as used
     */
    markCodeAsUsed(code) {
        const usedCodes = this.getUsedCodes();
        if (!usedCodes.includes(code)) {
            usedCodes.push(code);
            localStorage.setItem(this.usedCodesKey, JSON.stringify(usedCodes));
        }
    }

    /**
     * Get list of used codes
     */
    getUsedCodes() {
        try {
            const data = localStorage.getItem(this.usedCodesKey);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('Error reading used codes:', error);
            return [];
        }
    }

    /**
     * Validate trial code
     */
    validateTrialCode(code) {
        const prefix = code.substring(0, 3);
        
        if (!this.trialPrefixes.includes(prefix)) {
            return { valid: false, message: 'Invalid trial code prefix' };
        }

        // Trial codes can be reused (for demo purposes)
        return { valid: true, type: 'TRIAL', message: 'Trial code validated' };
    }

    /**
     * Validate full code - ANY code that sums to 37 and doesn't start with trial prefix
     */
    validateFullCode(code) {
        const prefix = code.substring(0, 3);
        
        // Check if it starts with a trial prefix
        if (this.trialPrefixes.includes(prefix)) {
            return { valid: false, message: 'This is a trial code, not a full version code' };
        }

        // Check if already used
        if (this.isCodeUsed(code)) {
            return { valid: false, message: 'Code already used' };
        }

        // If it sums to 37 and doesn't start with trial prefix, it's valid!
        return { valid: true, type: 'FULL', message: 'Full version code validated' };
    }

    /**
     * Main validation function
     */
    async validateCode(code) {
        // First check format and checksum
        const formatCheck = this.validateCodeFormat(code);
        if (!formatCheck.valid) {
            return formatCheck;
        }

        const prefix = code.substring(0, 3);

        // Check if it's a trial code
        if (this.trialPrefixes.includes(prefix)) {
            return this.validateTrialCode(code);
        }

        // Everything else is a potential full code
        return this.validateFullCode(code);
    }

    /**
     * Activate license code
     */
    async activateLicense(code) {
        const validation = await this.validateCode(code);
        
        if (!validation.valid) {
            return { success: false, message: validation.message };
        }

        // Mark full codes as used
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

    /**
     * Get stored license data
     */
    getLicenseData() {
        try {
            const data = localStorage.getItem(this.storageKey);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Error reading license data:', error);
            return null;
        }
    }

    /**
     * Clear license (for testing)
     */
    clearLicense() {
        localStorage.removeItem(this.storageKey);
        localStorage.removeItem('bridgeAppDealsPlayed');
        // Don't clear used codes in production
    }

    /**
     * Increment deals played counter
     */
    incrementDealsPlayed() {
        const current = parseInt(localStorage.getItem('bridgeAppDealsPlayed') || '0');
        localStorage.setItem('bridgeAppDealsPlayed', (current + 1).toString());
    }

    /**
     * Generate trial code that sums to 37
     */
    static generateTrialCode() {
        const prefixes = ['222', '333', '444', '555']; // Skip 111 as it's impossible
        const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
        
        // Calculate what the last 3 digits need to sum to
        const prefixSum = prefix.split('').reduce((sum, digit) => sum + parseInt(digit), 0);
        const remainingSum = 37 - prefixSum;
        
        // Generate last 3 digits that sum to remainingSum
        const lastThree = LicenseManager.generateDigitsWithSum(remainingSum, 3);
        
        return prefix + lastThree;
    }

    /**
     * Generate full code that sums to 37 (for your Excel database)
     */
    static generateFullCode() {
        let code;
        do {
            // Generate a 6-digit code that sums to exactly 37
            code = LicenseManager.generateDigitsWithSum(37, 6);
            
            // Make sure it doesn't start with trial prefixes
            const prefix = code.substring(0, 3);
        } while (['111', '222', '333', '444', '555'].includes(prefix));
        
        return code;
    }

    /**
     * Helper: Generate digits that sum to target
     */
    static generateDigitsWithSum(targetSum, digitCount) {
        if (targetSum < 0 || targetSum > 9 * digitCount) {
            throw new Error(`Cannot generate ${digitCount} digits that sum to ${targetSum}`);
        }
        
        const digits = Array(digitCount).fill(0);
        let remainingSum = targetSum;
        
        // Distribute the sum randomly across digits
        for (let i = 0; i < digitCount - 1; i++) {
            const maxForThisDigit = Math.min(9, remainingSum);
            const minForThisDigit = Math.max(0, remainingSum - (9 * (digitCount - i - 1)));
            
            if (maxForThisDigit < minForThisDigit) {
                // Start over if we can't distribute properly
                return LicenseManager.generateDigitsWithSum(targetSum, digitCount);
            }
            
            digits[i] = minForThisDigit + Math.floor(Math.random() * (maxForThisDigit - minForThisDigit + 1));
            remainingSum -= digits[i];
        }
        
        digits[digitCount - 1] = remainingSum;
        
        return digits.join('');
    }

    /**
     * Utility: Check if a code sums to 37
     */
    static checksumCode(code) {
        return code.split('').reduce((sum, digit) => sum + parseInt(digit), 0);
    }

    /**
     * Utility: List all used codes (for admin)
     */
    listUsedCodes() {
        return this.getUsedCodes();
    }

    /**
     * ADMIN UTILITY: Check if a code would be valid (for your Excel planning)
     */
    static validateCodeForExcel(code) {
        // Check format
        if (!code || code.length !== 6 || !/^\d{6}$/.test(code)) {
            return { valid: false, reason: 'Must be 6 digits', type: 'invalid' };
        }

        // Check checksum
        const sum = LicenseManager.checksumCode(code);
        if (sum !== 37) {
            return { valid: false, reason: `Sums to ${sum}, not 37`, type: 'invalid' };
        }

        // Check type
        const prefix = code.substring(0, 3);
        const trialPrefixes = ['111', '222', '333', '444', '555'];
        
        if (trialPrefixes.includes(prefix)) {
            return { valid: true, reason: 'Valid trial code', type: 'trial' };
        } else {
            return { valid: true, reason: 'Valid full code', type: 'full' };
        }
    }

    /**
     * TESTING: Simulate trial expiration (for development/testing only)
     */
    static simulateTrialExpiry() {
        const licenseData = JSON.parse(localStorage.getItem('bridgeAppLicense') || 'null');
        if (licenseData && licenseData.type === 'TRIAL') {
            // Set activation date to 15 days ago
            licenseData.activatedAt = Date.now() - (15 * 24 * 60 * 60 * 1000);
            localStorage.setItem('bridgeAppLicense', JSON.stringify(licenseData));
            console.log('🧪 Trial expiry simulated - reload app to test');
            return true;
        }
        console.log('❌ No active trial to expire');
        return false;
    }

    /**
     * TESTING: Simulate deals limit reached (for development/testing only)
     */
    static simulateDealsLimit() {
        localStorage.setItem('bridgeAppDealsPlayed', '51'); // Over the 50 limit
        console.log('🧪 Deals limit simulated - complete next deal to test expiry');
    }

    /**
     * TESTING: Reset trial to fresh state (for development/testing only)
     */
    static resetTrialForTesting() {
        const licenseData = JSON.parse(localStorage.getItem('bridgeAppLicense') || 'null');
        if (licenseData && licenseData.type === 'TRIAL') {
            licenseData.activatedAt = Date.now(); // Reset to now
            localStorage.setItem('bridgeAppLicense', JSON.stringify(licenseData));
            localStorage.setItem('bridgeAppDealsPlayed', '0'); // Reset deals
            console.log('🧪 Trial reset to fresh state');
            return true;
        }
        console.log('❌ No active trial to reset');
        return false;
    }

    /**
     * TESTING: Show current license status (for development/testing only)
     */
    static showLicenseStatus() {
        const licenseData = JSON.parse(localStorage.getItem('bridgeAppLicense') || 'null');
        const dealsPlayed = parseInt(localStorage.getItem('bridgeAppDealsPlayed') || '0');
        const usedCodes = JSON.parse(localStorage.getItem('bridgeAppUsedCodes') || '[]');
        
        console.log('🔍 Current License Status:');
        console.log('License Data:', licenseData);
        console.log('Deals Played:', dealsPlayed);
        console.log('Used Codes:', usedCodes);
        
        if (licenseData) {
            const now = Date.now();
            const daysElapsed = Math.floor((now - licenseData.activatedAt) / (1000 * 60 * 60 * 24));
            const daysLeft = Math.max(0, 14 - daysElapsed);
            const dealsLeft = Math.max(0, 50 - dealsPlayed);
            
            console.log(`Days elapsed: ${daysElapsed}, Days left: ${daysLeft}`);
            console.log(`Deals left: ${dealsLeft}`);
        }
    }
}

/**
 * Main Bridge Application with Enhanced License System - MOBILE FIXED VERSION with LICENSE TOUCH FIX
 */
class BridgeApp {
    constructor() {
        this.currentMode = null;
        this.bridgeModeInstance = null;
        this.gameState = new GameState();
        this.ui = new UIController();
        this.licenseManager = new LicenseManager();
        
        // App state management
        this.appState = 'mode_selection';
        this.availableModes = {
            '1': { name: 'kitchen', display: 'Kitchen Bridge', module: './bridge-modes/kitchen.js' },
            '2': { name: 'bonus', display: 'Bonus Bridge', module: './bridge-modes/bonus.js' },
            '3': { name: 'chicago', display: 'Chicago Bridge', module: './bridge-modes/chicago.js' },
            '4': { name: 'rubber', display: 'Rubber Bridge', module: './bridge-modes/rubber.js' },
            '5': { name: 'duplicate', display: 'Duplicate Bridge', module: './bridge-modes/duplicate.js' }
        };
        
        // License entry state
        this.codeEntryMode = false;
        this.enteredCode = '';
        
        // Mobile support
        this.isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        this.init();
    }
    
    /**
     * MOBILE FIXED: Initialize the application with mobile detection and setup
     */
    async init() {
        console.log('🎮 Initializing Bridge Calculator App');
        
        // Setup mobile optimizations
        if (this.isMobile) {
            console.log('📱 Mobile device detected - enabling mobile optimizations');
            document.body.classList.add('mobile-device');
            this.addMobileCSS();
        }
        
        // Check license status first
        const licenseStatus = this.licenseManager.checkLicenseStatus();
        
        if (licenseStatus.needsCode) {
            await this.ui.init(); // Initialize UI first
            this.enterCodeEntryMode(licenseStatus);
            return; // Stay in code entry mode until valid license
        }

        if (licenseStatus.status === 'trial') {
            console.log(`📅 Trial Status: ${licenseStatus.message}`);
        }

        try {
            // Continue with normal initialization
            await this.ui.init();
            this.setupEventListeners();
            this.updateDisplay();
            console.log('✅ Bridge Calculator App ready with mobile support');
        } catch (error) {
            console.error('❌ Failed to initialize Bridge Calculator:', error);
            throw error;
        }
    }

    /**
     * MOBILE FIX: Add mobile-specific CSS including license entry fixes
     */
    addMobileCSS() {
        const mobileCSS = `
        /* Mobile button enhancements */
        .mobile-device .btn {
            min-height: 44px !important;
            min-width: 44px !important;
            touch-action: manipulation !important;
            user-select: none !important;
            -webkit-tap-highlight-color: transparent !important;
            -webkit-user-select: none !important;
        }

        /* Button pressed state for mobile feedback */
        .btn-pressed {
            transform: scale(0.95) !important;
            opacity: 0.8 !important;
            transition: all 0.1s ease !important;
        }

        /* Ensure buttons are touchable on mobile */
        .mobile-device .calculator-buttons .btn {
            cursor: pointer;
            -webkit-touch-callout: none;
        }

        /* License entry specific mobile fixes */
        .mobile-device[data-app-state="license_entry"] .btn {
            border: 2px solid transparent;
            transition: all 0.1s ease;
            background-color: var(--btn-bg, #4f46e5);
        }
        
        .mobile-device[data-app-state="license_entry"] .btn:not(.disabled) {
            pointer-events: auto !important;
            cursor: pointer !important;
        }
        
        .mobile-device[data-app-state="license_entry"] .btn:not(.disabled):active,
        .mobile-device[data-app-state="license_entry"] .btn.btn-pressed {
            transform: scale(0.95) !important;
            border-color: #3b82f6 !important;
            background-color: rgba(59, 130, 246, 0.8) !important;
        }

        .mobile-device[data-app-state="license_entry"] .btn.disabled {
            pointer-events: none !important;
            opacity: 0.3 !important;
        }

        /* Improve button spacing on mobile */
        @media (max-width: 768px) {
            .calculator-buttons {
                gap: 8px;
            }
            
            .btn {
                padding: 12px 8px !important;
                font-size: 16px !important;
            }
        }
        `;

        const style = document.createElement('style');
        style.id = 'mobile-bridge-css';
        style.textContent = mobileCSS;
        document.head.appendChild(style);
    }

    /**
     * LICENSE TOUCH FIX: Enhanced enter code entry mode with mobile touch support
     */
    enterCodeEntryMode(status) {
        console.log('🔑 Entering code entry mode with enhanced mobile touch support');
        
        this.codeEntryMode = true;
        this.enteredCode = '';
        this.appState = 'license_entry';
        
        // Update body data attribute for CSS targeting
        if (this.isMobile) {
            document.body.setAttribute('data-app-state', 'license_entry');
        }
        
        // Update display first
        this.updateCodeEntryDisplay(status);
        
        // CRITICAL: Force mobile button setup after display update
        this.forceMobileLicenseButtonSetup();
        
        // Update button states
        this.updateButtonStates();
        
        console.log('🔑 License entry mode ready - mobile touch optimized');
    }

    /**
     * LICENSE TOUCH FIX: Force mobile button setup specifically for license entry
     */
    forceMobileLicenseButtonSetup() {
        console.log('📱 Setting up mobile license entry touch events');
        
        // Wait for DOM to be fully updated
        setTimeout(() => {
            // Remove any existing license event listeners
            this.removeLicenseEventListeners();
            
            // Get all buttons
            const buttons = document.querySelectorAll('.btn');
            console.log(`📱 Found ${buttons.length} buttons for license entry`);
            
            buttons.forEach((button, index) => {
                // Ensure button has proper mobile touch attributes
                button.style.touchAction = 'manipulation';
                button.style.userSelect = 'none';
                button.style.webkitTapHighlightColor = 'transparent';
                button.style.webkitUserSelect = 'none';
                button.style.minHeight = '44px';
                button.style.minWidth = '44px';
                
                // Add direct touch event listeners for license entry
                this.addLicenseButtonEventListeners(button);
                
                console.log(`📱 License button ${index} setup: ${button.dataset.value}`);
            });
            
            // Also setup container-level event delegation as backup
            this.setupLicenseEventDelegation();
            
        }, 100); // Small delay to ensure DOM is ready
    }

    /**
     * LICENSE TOUCH FIX: Add event listeners specifically for license buttons
     */
    addLicenseButtonEventListeners(button) {
        const handleLicenseButtonPress = (event) => {
            // Only handle if we're in license entry mode
            if (this.appState !== 'license_entry') return;
            
            event.preventDefault();
            event.stopPropagation();
            
            const value = button.dataset.value;
            console.log(`🎯 License button pressed: ${value}`);
            
            // Visual feedback
            button.classList.add('btn-pressed');
            setTimeout(() => button.classList.remove('btn-pressed'), 150);
            
            // Haptic feedback if available
            if (navigator.vibrate) {
                navigator.vibrate(50);
            }
            
            // Handle the button action
            this.handleCodeEntryButton(value);
            this.updateCodeEntryDisplay();
            this.updateButtonStates();
        };
        
        // Add multiple event types for maximum mobile compatibility
        button.addEventListener('touchstart', (e) => {
            if (this.appState === 'license_entry' && !button.classList.contains('disabled')) {
                e.preventDefault();
                button.style.transform = 'scale(0.95)';
            }
        }, { passive: false });
        
        button.addEventListener('touchend', handleLicenseButtonPress, { passive: false });
        button.addEventListener('click', handleLicenseButtonPress, { passive: false });
        
        // Store handler reference for cleanup
        button._licenseHandler = handleLicenseButtonPress;
    }

    /**
     * LICENSE TOUCH FIX: Setup container-level event delegation for license entry
     */
    setupLicenseEventDelegation() {
        const container = document.querySelector('.calculator-container') || document.body;
        
        const licenseDelegate = (event) => {
            // Only handle if we're in license entry mode
            if (this.appState !== 'license_entry') return;
            
            const button = event.target.closest('.btn');
            if (!button || button.classList.contains('disabled')) return;
            
            event.preventDefault();
            event.stopPropagation();
            
            const value = button.dataset.value;
            console.log(`🎯 License delegated press: ${value}`);
            
            // Visual feedback
            button.classList.add('btn-pressed');
            setTimeout(() => button.classList.remove('btn-pressed'), 150);
            
            // Handle action
            this.handleCodeEntryButton(value);
            this.updateCodeEntryDisplay();
            this.updateButtonStates();
        };
        
        // Remove existing license delegate
        if (container._licenseDelegate) {
            container.removeEventListener('touchend', container._licenseDelegate);
            container.removeEventListener('click', container._licenseDelegate);
        }
        
        // Add new license delegate
        container.addEventListener('touchend', licenseDelegate, { passive: false });
        container.addEventListener('click', licenseDelegate, { passive: false });
        
        // Store for cleanup
        container._licenseDelegate = licenseDelegate;
        
        console.log('📱 License entry event delegation setup complete');
    }

    /**
     * LICENSE TOUCH FIX: Remove license-specific event listeners
     */
    removeLicenseEventListeners() {
        const buttons = document.querySelectorAll('.btn');
        buttons.forEach(button => {
            if (button._licenseHandler) {
                button.removeEventListener('touchend', button._licenseHandler);
                button.removeEventListener('click', button._licenseHandler);
                button.removeEventListener('touchstart', button._licenseHandler);
                delete button._licenseHandler;
            }
        });
        
        const container = document.querySelector('.calculator-container') || document.body;
        if (container._licenseDelegate) {
            container.removeEventListener('touchend', container._licenseDelegate);
            container.removeEventListener('click', container._licenseDelegate);
            delete container._licenseDelegate;
        }
        
        console.log('📱 License event listeners removed');
    }

    /**
     * MOBILE FIX: Initialize buttons specifically for mobile devices
     */
    initializeMobileButtons() {
        // Wait for next tick to ensure DOM is updated
        setTimeout(() => {
            const buttons = document.querySelectorAll('.btn');
            
            buttons.forEach(button => {
                // Ensure buttons have proper touch target
                if (!button.style.minHeight) {
                    button.style.minHeight = '44px'; // iOS minimum touch target
                }
                
                // Add mobile-specific classes
                button.classList.add('mobile-ready');
                
                // Ensure touch events work
                button.style.touchAction = 'manipulation';
                button.style.userSelect = 'none';
            });
            
            console.log(`📱 Initialized ${buttons.length} buttons for mobile`);
        }, 10);
    }
    
    /**
     * MOBILE FIXED: Setup all event listeners with proper mobile support
     */
    setupEventListeners() {
        // Remove any existing listeners to prevent duplicates
        this.removeEventListeners();
        
        // Store bound functions for proper removal later
        this.boundHandlers = {
            buttonClick: this.handleButtonClick.bind(this),
            keyDown: this.handleKeyPress.bind(this)
        };

        // Enhanced button click handler with mobile touch support
        this.setupButtonEventListeners();
        
        // Control bar clicks with mobile support
        this.setupControlEventListeners();
        
        // Keyboard support
        document.addEventListener('keydown', this.boundHandlers.keyDown);
        
        console.log('✅ Event listeners setup with mobile support');
    }

    /**
     * MOBILE FIX: Setup button event listeners with mobile touch support
     */
    setupButtonEventListeners() {
        // Use event delegation on the calculator container
        const calculator = document.querySelector('.calculator-container') || document.body;
        
        // Handle both click and touch events for mobile
        const buttonHandler = (event) => {
            // Skip if we're in license entry mode (handled separately)
            if (this.appState === 'license_entry') return;
            
            // Prevent default touch behavior
            if (event.type === 'touchend') {
                event.preventDefault();
            }
            
            const button = event.target.closest('.btn');
            if (button && !button.classList.contains('disabled')) {
                // Visual feedback for mobile
                this.provideMobileButtonFeedback(button);
                
                // Handle the button action
                this.handleButtonClick(button.dataset.value);
            }
        };

        // Add both click and touch event listeners
        calculator.addEventListener('click', buttonHandler);
        calculator.addEventListener('touchend', buttonHandler);
        
        // Store references for cleanup
        this.calculatorElement = calculator;
        this.buttonHandler = buttonHandler;
    }

    /**
     * MOBILE FIX: Provide visual feedback for mobile button presses
     */
    provideMobileButtonFeedback(button) {
        // Add pressed class for visual feedback
        button.classList.add('btn-pressed');
        
        // Remove the class after a short delay
        setTimeout(() => {
            button.classList.remove('btn-pressed');
        }, 150);
        
        // Optional: Haptic feedback on supported devices
        if (navigator.vibrate) {
            navigator.vibrate(50);
        }
    }

    /**
     * MOBILE FIX: Setup control bar event listeners with mobile support
     */
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
                // Add both click and touch events
                element.addEventListener('click', handler);
                element.addEventListener('touchend', (e) => {
                    e.preventDefault();
                    handler();
                });
                
                // Store for cleanup
                element._bridgeAppHandler = handler;
            }
        });
    }

    /**
     * MOBILE FIX: Remove event listeners (for cleanup)
     */
    removeEventListeners() {
        if (this.boundHandlers) {
            document.removeEventListener('keydown', this.boundHandlers.keyDown);
        }
        
        if (this.calculatorElement && this.buttonHandler) {
            this.calculatorElement.removeEventListener('click', this.buttonHandler);
            this.calculatorElement.removeEventListener('touchend', this.buttonHandler);
        }
        
        // Clean up control listeners
        const controls = ['#wakeControl', '#vulnControl', '#honorsControl', '#helpControl', '#quitControl'];
        controls.forEach(id => {
            const element = document.querySelector(id);
            if (element && element._bridgeAppHandler) {
                element.removeEventListener('click', element._bridgeAppHandler);
                element.removeEventListener('touchend', element._bridgeAppHandler);
                delete element._bridgeAppHandler;
            }
        });
        
        // Clean up license-specific listeners
        this.removeLicenseEventListeners();
    }
    
    /**
     * Handle button clicks based on current state
     */
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
     * Handle button presses during code entry
     */
    handleCodeEntryButton(value) {
        console.log(`🔑 Code entry button: ${value}, current code: ${this.enteredCode}`);
        
        if (value === 'BACK') {
            // Delete last character
            this.enteredCode = this.enteredCode.slice(0, -1);
            console.log(`🔑 After BACK: ${this.enteredCode}`);
        } else if (value === 'DEAL') {
            // Submit code
            console.log(`🔑 Submitting code: ${this.enteredCode}`);
            this.submitLicenseCode();
            return; // Don't update display here, submitLicenseCode handles it
        } else if (['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'].includes(value)) {
            // Add digit to code
            if (this.enteredCode.length < 6) {
                this.enteredCode += value;
                console.log(`🔑 After adding ${value}: ${this.enteredCode}`);
            }
        }
        
        // Update display and button states
        this.updateCodeEntryDisplay();
        this.updateButtonStates();
    }

    /**
     * Submit entered license code
     */
    async submitLicenseCode() {
        if (this.enteredCode.length !== 6) {
            this.ui.showError('Code must be 6 digits');
            return;
        }

        console.log(`🔑 Validating code: ${this.enteredCode} (sum: ${LicenseManager.checksumCode(this.enteredCode)})`);
        
        const result = await this.licenseManager.activateLicense(this.enteredCode);

        if (result.success) {
            this.ui.showSuccess(result.message, 3000);
            
            // Exit code entry mode and restart app
            setTimeout(() => {
                this.codeEntryMode = false;
                this.enteredCode = '';
                this.appState = 'mode_selection';
                
                // Update body data attribute
                if (this.isMobile) {
                    document.body.setAttribute('data-app-state', 'mode_selection');
                }
                
                this.init(); // Restart with valid license
            }, 3000);
        } else {
            this.ui.showError(result.message);
            this.enteredCode = '';
            this.updateCodeEntryDisplay();
        }
    }

    /**
     * Update display for code entry
     */
    updateCodeEntryDisplay(status = null) {
        const statusMessage = status ? status.message : 'Enter 6-digit license code';
        
        // Show entered digits
        const displayCode = this.enteredCode.padEnd(6, '_').split('').join(' ');
        
        const content = `
            <div class="title-score-row">
                <div class="mode-title">🔑 License Code</div>
                <div class="score-display">
                    Bridge<br>Calculator
                </div>
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
                        Digits must sum to 37
                    </div>
                </div>
            </div>
            <div class="current-state">
                Use number buttons. BACK to delete, DEAL to submit
            </div>
        `;
        
        this.ui.updateDisplay(content);
    }
    
    /**
     * Handle bridge mode actions
     */
    async handleBridgeModeAction(value) {
        console.log('🎯 Bridge action:', value, 'Mode:', this.currentMode);
        
        if (this.bridgeModeInstance) {
            this.bridgeModeInstance.handleAction(value);
        }
    }
    
    /**
     * Handle honors button click
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
            
            // Update body data attribute for mobile
            if (this.isMobile) {
                document.body.setAttribute('data-app-state', 'bridge_mode');
            }
            
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
        
        // Update body data attribute for mobile
        if (this.isMobile) {
            document.body.setAttribute('data-app-state', 'mode_selection');
        }
        
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
                this.handleButtonClick('1'); // Default to Kitchen Bridge
            }
        }
    }
    
    /**
     * Update the main display
     */
    updateDisplay() {
        if (this.appState === 'license_entry') {
            // Code entry display is handled separately
            return;
        } else if (this.appState === 'mode_selection') {
            this.updateModeSelectionDisplay();
        } else if (this.bridgeModeInstance) {
            // Bridge mode handles its own display
            this.bridgeModeInstance.updateDisplay();
        }
        
        // Update button states
        this.updateButtonStates();
    }
    
    /**
     * Update display for mode selection with trial status
     */
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
                <div class="mode-title">Bridge Modes Calculator</div>
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
    
    /**
     * MOBILE ENHANCED: Update button states with mobile considerations and license entry support
     */
    updateButtonStates() {
        let activeButtons = [];
        
        if (this.appState === 'license_entry') {
            // Only number buttons, BACK, and DEAL are active
            activeButtons = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'BACK'];
            
            // DEAL button only active when we have 6 digits
            if (this.enteredCode.length === 6) {
                activeButtons.push('DEAL');
            }
        } else if (this.appState === 'mode_selection') {
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
        
        console.log('🎮 Active buttons updated:', activeButtons);
        this.ui.updateButtonStates(activeButtons);
        
        // Force mobile button refresh
        this.refreshMobileButtons(activeButtons);
    }

    /**
     * MOBILE FIX: Force refresh of mobile button states with license entry support
     */
    refreshMobileButtons(activeButtons) {
        setTimeout(() => {
            const buttons = document.querySelectorAll('.btn');
            
            buttons.forEach(button => {
                const value = button.dataset.value;
                const isActive = activeButtons.includes(value);
                
                if (isActive) {
                    button.classList.remove('disabled');
                    button.removeAttribute('disabled');
                    button.style.opacity = '1';
                    button.style.pointerEvents = 'auto';
                    
                    // MOBILE: Ensure touch properties are set for active buttons
                    if (this.isMobile) {
                        button.style.touchAction = 'manipulation';
                        button.style.webkitTapHighlightColor = 'transparent';
                        button.style.userSelect = 'none';
                        button.style.cursor = 'pointer';
                    }
                } else {
                    button.classList.add('disabled');
                    button.setAttribute('disabled', 'true');
                    button.style.opacity = '0.3';
                    button.style.pointerEvents = 'none';
                }
            });
            
            // LICENSE ENTRY: Ensure touch events are working
            if (this.appState === 'license_entry' && this.isMobile) {
                console.log('🔑 Refreshing license entry touch events');
                this.setupLicenseEventDelegation();
            }
            
            console.log('🎮 Mobile button refresh complete');
        }, 50);
    }
    
    /**
     * Show help modal
     */
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

    /**
     * Get main help content with embedded license status
     */
    getMainHelpContent() {
        // Get current license status
        const licenseStatus = this.licenseManager.checkLicenseStatus();
        
        // Build license status section
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
                        <p style="margin-top: 10px; font-size: 12px; color: #666;">
                            Ready to upgrade? Contact us for a full version code.
                        </p>
                    </div>
                </div>
            `;
            
            // Add upgrade button for trial users
            upgradeButton = { 
                text: 'Enter Full Code', 
                action: () => {
                    this.ui.closeModal();
                    this.enterCodeEntryMode({ message: 'Enter full version code to upgrade' });
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
                        <p>📝 License: <code>${this.licenseManager.getLicenseData()?.code || 'Unknown'}</code></p>
                        <p style="margin-top: 10px; font-size: 12px; color: #666;">
                            You have access to all Bridge Calculator features!
                        </p>
                    </div>
                </div>
            `;
            
        } else {
            // Shouldn't happen from main help, but just in case
            licenseSection = `
                <div class="help-section">
                    <h4>🔑 License Required</h4>
                    <div style="background: rgba(231, 76, 60, 0.1); padding: 15px; border-radius: 8px; margin: 10px 0; border-left: 4px solid #e74c3c;">
                        <p><strong>No Valid License</strong></p>
                        <p>Bridge Calculator requires a license code to continue.</p>
                    </div>
                </div>
            `;
        }

        // Build buttons array
        const buttons = [
            { text: 'Close Help', action: 'close', class: 'close-btn' }
        ];
        
        // Add upgrade button if user is on trial
        if (upgradeButton) {
            buttons.unshift(upgradeButton); // Add to beginning
        }

        return {
            title: 'Bridge Modes Calculator Help',
            content: `
                ${licenseSection}
                
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
                
                <div class="help-section">
                    <h4>Need Support?</h4>
                    <p>Contact us for license codes or technical support:<br>
                    <strong>your-email@example.com</strong></p>
                </div>
            `,
            buttons: buttons
        };
    }

    /**
     * Get license entry help content
     */
    getLicenseHelpContent() {
        return {
            title: '🔑 License Code Help',
            content: `
                <div class="help-section">
                    <h4>How to Enter License Code</h4>
                    <ul>
                        <li><strong>Use number buttons 0-9</strong> to enter your 6-digit code</li>
                        <li><strong>BACK button</strong> deletes the last digit</li>
                        <li><strong>DEAL button</strong> submits the code (appears when 6 digits entered)</li>
                    </ul>
                </div>
                
                <div class="help-section">
                    <h4>Code Requirements</h4>
                    <ul>
                        <li>Must be exactly <strong>6 digits</strong></li>
                        <li>All digits must <strong>sum to 37</strong></li>
                        <li>Trial codes give <strong>14 days or 50 deals</strong></li>
                        <li>Full codes provide <strong>unlimited access</strong></li>
                    </ul>
                </div>
                
                <div class="help-section">
                    <h4>Need a License Code?</h4>
                    <p>Contact us for trial or full version codes:<br>
                    <strong>your-email@example.com</strong></p>
                </div>
            `,
            buttons: [
                { text: 'Close Help', action: 'close', class: 'close-btn' }
            ]
        };
    }
    
    /**
     * Show quit options
     */
    showQuit() {
        if (this.appState === 'license_entry') {
            // Different quit options during license entry
            this.showLicenseQuitOptions();
            return;
        }

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
                        this.showCloseAppInstructions();
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
     * Show quit options during license entry
     */
    showLicenseQuitOptions() {
        const quitContent = {
            title: 'Exit License Entry',
            content: 'Bridge Calculator requires a valid license to continue.',
            buttons: [
                { 
                    text: 'Close App', 
                    action: () => {
                        this.showCloseAppInstructions();
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
    
    /**
     * Show professional close app instructions
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

✅ Your progress is automatically saved!
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
     * Call this when a deal is completed - CHECK TRIAL LIMITS
     */
    onDealCompleted() {
        // Increment deal counter
        this.licenseManager.incrementDealsPlayed();
        
        // Check if trial expired after this deal
        const licenseStatus = this.licenseManager.checkLicenseStatus();
        if (licenseStatus.needsCode) {
            this.ui.showError('Trial expired! Enter full version code.');
            setTimeout(() => {
                this.enterCodeEntryMode(licenseStatus);
            }, 2000);
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

    /**
     * MOBILE FIX: Enhanced cleanup with proper event listener removal
     */
    cleanup() {
        this.removeEventListeners();
        
        if (this.bridgeModeInstance && this.bridgeModeInstance.cleanup) {
            this.bridgeModeInstance.cleanup();
        }
        
        console.log('🧹 App cleanup completed with mobile support');
    }

    /**
     * DEBUGGING: License entry debug method
     */
    debugLicenseEntry() {
        console.log('🔍 === LICENSE ENTRY DEBUG ===');
        console.log('App State:', this.appState);
        console.log('Code Entry Mode:', this.codeEntryMode);
        console.log('Is Mobile:', this.isMobile);
        console.log('Entered Code:', this.enteredCode);
        console.log('Code Length:', this.enteredCode.length);
        
        const buttons = document.querySelectorAll('.btn');
        console.log(`Found ${buttons.length} buttons:`);
        
        buttons.forEach((button, index) => {
            const value = button.dataset.value;
            const isDisabled = button.classList.contains('disabled');
            const hasHandler = !!button._licenseHandler;
            const pointerEvents = button.style.pointerEvents;
            const touchAction = button.style.touchAction;
            
            console.log(`Button ${index} (${value}):`, {
                disabled: isDisabled,
                pointerEvents,
                touchAction,
                hasHandler,
                opacity: button.style.opacity
            });
        });
        
        const container = document.querySelector('.calculator-container') || document.body;
        console.log('Container has license delegate:', !!container._licenseDelegate);
        console.log('Body data-app-state:', document.body.getAttribute('data-app-state'));
    }

    /**
     * EMERGENCY: Force mobile license fix (for testing)
     */
    emergencyMobileLicenseFix() {
        console.log('🚨 EMERGENCY MOBILE LICENSE FIX ACTIVATED');
        
        // Clear all existing listeners
        this.removeLicenseEventListeners();
        
        // Force setup new listeners
        setTimeout(() => {
            const buttons = document.querySelectorAll('.btn');
            console.log(`🚨 Emergency setup for ${buttons.length} buttons`);
            
            buttons.forEach(button => {
                // Remove all existing listeners by cloning
                const newButton = button.cloneNode(true);
                button.parentNode.replaceChild(newButton, button);
                
                // Add simple, direct event listener
                const emergencyHandler = (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    const value = newButton.dataset.value;
                    console.log('🚨 Emergency button press:', value);
                    
                    if (this.appState === 'license_entry' && !newButton.classList.contains('disabled')) {
                        // Visual feedback
                        newButton.style.transform = 'scale(0.95)';
                        newButton.style.backgroundColor = 'rgba(59, 130, 246, 0.8)';
                        
                        setTimeout(() => {
                            newButton.style.transform = 'scale(1)';
                            newButton.style.backgroundColor = '';
                        }, 150);
                        
                        // Handle the action
                        this.handleCodeEntryButton(value);
                        this.updateCodeEntryDisplay();
                        this.updateButtonStates();
                    }
                };
                
                // Add multiple event types
                newButton.addEventListener('touchstart', (e) => e.preventDefault(), { passive: false });
                newButton.addEventListener('touchend', emergencyHandler, { passive: false });
                newButton.addEventListener('click', emergencyHandler, { passive: false });
                
                // Ensure mobile properties
                newButton.style.touchAction = 'manipulation';
                newButton.style.userSelect = 'none';
                newButton.style.webkitTapHighlightColor = 'transparent';
            });
            
            console.log('🚨 Emergency mobile license fix complete');
        }, 100);
    }
}

// Export the main class and make it globally accessible
export { BridgeApp, LicenseManager };

// Make BridgeApp available globally for modal buttons and debugging
window.BridgeApp = BridgeApp;

// Testing and code generation utilities (for development only)
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    console.log('\n🔑 === LICENSE CODE GENERATOR (DEVELOPMENT ONLY) ===');
    
    // Generate sample codes for testing
    function generateSampleCodes() {
        console.log('\n📝 Sample Trial Codes (sum to 37):');
        for (let i = 0; i < 5; i++) {
            const code = LicenseManager.generateTrialCode();
            console.log(`${code} (sum: ${LicenseManager.checksumCode(code)})`);
        }
        
        console.log('\n🔐 Sample Full Codes (sum to 37):');
        for (let i = 0; i < 10; i++) {
            const code = LicenseManager.generateFullCode();
            console.log(`${code} (sum: ${LicenseManager.checksumCode(code)})`);
        }
    }
    
    // Clear license for testing
    function clearTestLicense() {
        localStorage.removeItem('bridgeAppLicense');
        localStorage.removeItem('bridgeAppDealsPlayed');
        localStorage.removeItem('bridgeAppUsedCodes');
        console.log('🧹 License cleared for testing');
    }
    
    // Expose utilities for testing
    window.generateSampleCodes = generateSampleCodes;
    window.clearTestLicense = clearTestLicense;
    window.LicenseManager = LicenseManager;
    window.simulateTrialExpiry = () => LicenseManager.simulateTrialExpiry();
    window.simulateDealsLimit = () => LicenseManager.simulateDealsLimit();
    window.resetTrialForTesting = () => LicenseManager.resetTrialForTesting();
    window.showLicenseStatus = () => LicenseManager.showLicenseStatus();
    
    // DEBUG UTILITIES for mobile testing
    window.debugLicenseEntry = () => window.bridgeApp?.debugLicenseEntry();
    window.emergencyMobileFix = () => window.bridgeApp?.emergencyMobileLicenseFix();
    
    generateSampleCodes();
    console.log('\n🛠️  Testing utilities:');
    console.log('• generateSampleCodes() - Generate new sample codes');
    console.log('• clearTestLicense() - Clear license for testing');
    console.log('• simulateTrialExpiry() - Force trial to expire');
    console.log('• simulateDealsLimit() - Force deals limit reached');
    console.log('• resetTrialForTesting() - Reset trial to fresh state');
    console.log('• showLicenseStatus() - Show current license info');
    console.log('• debugLicenseEntry() - Debug license entry mobile issues');
    console.log('• emergencyMobileFix() - Emergency mobile touch fix');
    console.log('• LicenseManager.checksumCode("123456") - Check if code sums to 37');
}