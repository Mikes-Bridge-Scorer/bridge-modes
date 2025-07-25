/**
 * Complete Enhanced Bridge Modes Calculator - Main Application Controller
 * WORKING VERSION with Security Fix, Trial Code Fix, and MODAL MOBILE TOUCH FIX
 * - Hidden checksum logic (security)
 * - Trial codes with any checksum (111-999 prefixes)
 * - Full codes must sum to 37
 * - Updated contact information
 * - Mobile touch support for ALL buttons including modals
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
 * Main Bridge Application - WORKING VERSION with MODAL MOBILE TOUCH FIX
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
        this.setupMobileLicenseButtons();
        this.updateButtonStates();
    }

    setupMobileLicenseButtons() {
        if (!this.isMobile) return;
        
        setTimeout(() => {
            const buttons = document.querySelectorAll('.btn');
            buttons.forEach(button => {
                button.style.touchAction = 'manipulation';
                button.style.userSelect = 'none';
                
                const handler = (e) => {
                    if (this.appState !== 'license_entry') return;
                    e.preventDefault();
                    
                    const value = button.dataset.value;
                    if (!button.classList.contains('disabled')) {
                        button.classList.add('btn-pressed');
                        setTimeout(() => button.classList.remove('btn-pressed'), 150);
                        this.handleCodeEntryButton(value);
                    }
                };
                
                button.addEventListener('touchend', handler, { passive: false });
                button.addEventListener('click', handler);
            });
        }, 100);
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
            if (this.appState === 'license_entry') return;
            
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
        if (value === 'BACK') {
            this.enteredCode = this.enteredCode.slice(0, -1);
        } else if (value === 'DEAL') {
            this.submitLicenseCode();
            return;
        } else if (['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'].includes(value)) {
            if (this.enteredCode.length < 6) {
                this.enteredCode += value;
            }
        }
        
        this.updateCodeEntryDisplay();
        this.updateButtonStates();
    }

    async submitLicenseCode() {
        if (this.enteredCode.length !== 6) {
            this.ui.showError('Code must be 6 digits');
            return;
        }

        const result = await this.licenseManager.activateLicense(this.enteredCode);

        if (result.success) {
            this.ui.showSuccess(result.message, 3000);
            setTimeout(() => {
                this.codeEntryMode = false;
                this.enteredCode = '';
                this.appState = 'mode_selection';
                this.init();
            }, 3000);
        } else {
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
        
        // MOBILE FIX: Apply mobile touch to modal buttons after they're created
        if (this.isMobile) {
            setTimeout(() => {
                this.applyMobileModalButtonFixes();
            }, 200);
        }
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
                    this.ui.closeModal();
                    this.enterCodeEntryMode({ message: 'Enter full version license code' });
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
                        <li><strong>Honors