// VERSION CHECK - Updated at 2025-01-31
console.log('🔍 APP.JS VERSION: 2025-01-31-SCROLL-FIXED');

/**
 * Bridge Modes Calculator - Main Application Controller
 * Mobile-first touch handling with modular architecture
 * License logic extracted to license.js for better organization
 */

class BridgeApp {
    constructor() {
        console.log('🎮 BridgeApp constructor called - Version 2025-01-31-SCROLL-FIXED');
        
        this.enteredCode = '';
        this.isLicensed = false;
        this.appState = 'license_entry'; // 'license_entry', 'licensed_mode', or 'bridge_mode'
        this.maxCodeLength = 6;
        this.currentBridgeMode = null;
        
        // Mobile detection
        this.isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        // Initialize license manager (imported from license.js)
        this.licenseManager = new LicenseManager();
        
        // Wake lock for screen management
        this.wakeLock = null;
        this.isWakeActive = false;
        
        // Module loading cache
        this.loadedModules = new Map();
        
        this.init();
    }

    async init() {
        console.log('🎮 Initializing Bridge Modes Calculator');
        console.log('📱 Mobile device detected:', this.isMobile);
        
        // Load base mode class first
        await this.loadBaseMode();
        
        // Check existing license
        const licenseStatus = this.licenseManager.checkLicenseStatus();
        
        if (!licenseStatus.needsCode) {
            console.log('📄 Valid license found, entering licensed mode');
            this.isLicensed = true;
            this.appState = 'licensed_mode';
            this.showLicensedMode(licenseStatus);
        } else {
            console.log('🔑 No valid license, showing license entry');
            this.showLicenseEntry(licenseStatus);
        }
        
        this.setupEventListeners();
        console.log('✅ Bridge Modes Calculator ready');
    }

    async loadBaseMode() {
        try {
            if (!this.loadedModules.has('base-mode')) {
                console.log('📦 Loading base mode class...');
                await this.loadScript('./js/bridge-modes/base-mode.js');
                this.loadedModules.set('base-mode', true);
                console.log('✅ Base mode class loaded');
            }
        } catch (error) {
            console.error('❌ Failed to load base mode:', error);
            throw new Error('Failed to load required base mode class');
        }
    }

    async loadBridgeModule(moduleId) {
        const moduleMap = {
            '1': { file: './js/bridge-modes/kitchen.js', class: 'KitchenBridgeMode', name: 'Kitchen Bridge' },
            '2': { file: './js/bridge-modes/bonus.js', class: 'BonusBridgeMode', name: 'Bonus Bridge' },
            '3': { file: './js/bridge-modes/chicago.js', class: 'ChicagoBridgeMode', name: 'Chicago Bridge' },
            '4': { file: './js/bridge-modes/rubber.js', class: 'RubberBridgeMode', name: 'Rubber Bridge' },
            '5': { file: './js/bridge-modes/duplicate.js', class: 'DuplicateBridgeMode', name: 'Duplicate Bridge' }
        };

        const module = moduleMap[moduleId];
        if (!module) {
            throw new Error('Unknown module ID: ' + moduleId);
        }

        try {
            console.log('📦 Loading ' + module.name + ' from ' + module.file + '...');
            
            // Force bypass cache with version timestamp
            const version = new Date().getTime();
            const scriptUrl = module.file + '?v=' + version + '&bust=' + Math.random();
            
            console.log('🔄 Loading script: ' + scriptUrl);
            
            // Remove any existing script for this module first
            const existingScript = document.querySelector('script[src*="' + module.file + '"]');
            if (existingScript) {
                existingScript.remove();
                console.log('🗑️ Removed existing script for ' + module.name);
            }
            
            await this.loadScript(scriptUrl);
            this.loadedModules.set(module.file, true);

            // Verify the class is available
            const ModuleClass = window[module.class];
            if (!ModuleClass) {
                throw new Error('Module class ' + module.class + ' not found after loading ' + scriptUrl);
            }

            console.log('✅ ' + module.name + ' loaded successfully with class:', ModuleClass.name);
            return ModuleClass;

        } catch (error) {
            console.error('❌ Failed to load ' + module.name + ':', error);
            console.error('❌ Script URL attempted: ' + module.file);
            console.error('❌ Available window classes:', Object.keys(window).filter(k => k.includes('Bridge')));
            
            // Show fallback message if module fails to load
            if (moduleId === '1') {
                console.log('🔄 Using embedded Kitchen Bridge fallback');
                this.showMessage('Failed to load full Kitchen Bridge. Using demo mode.', 'error');
                return this.getEmbeddedKitchenBridge();
            }
            
            throw error;
        }
    }

    async loadScript(src) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = resolve;
            script.onerror = () => reject(new Error('Failed to load script: ' + src));
            document.head.appendChild(script);
        });
    }

    getEmbeddedKitchenBridge() {
        // Embedded fallback version of Kitchen Bridge
        return class EmbeddedKitchenBridge extends BaseBridgeMode {
            constructor(bridgeApp) {
                super(bridgeApp);
                this.modeName = '🍳 Kitchen Bridge (Embedded)';
            }

            getModeName() {
                return '🍳 Kitchen Bridge';
            }

            calculateScore(contract, vulnerability) {
                // Simple kitchen bridge scoring
                const level = parseInt(contract.level);
                const made = contract.made;
                const tricks = contract.tricks;
                const doubled = contract.doubled;
                
                let nsScore = 0;
                let ewScore = 0;
                
                if (made) {
                    let score = (tricks - 6) * 10; // 10 points per trick
                    
                    // Game bonus
                    if (this.isGameContract(level, contract.suit)) {
                        score += this.isVulnerable(contract.declarer) ? 500 : 300;
                    } else {
                        score += 50;
                    }
                    
                    // Double bonus
                    if (doubled > 0) {
                        score *= (doubled === 1 ? 2 : 4);
                        score += 50 * doubled;
                    }
                    
                    if (this.isNorthSouth(contract.declarer)) {
                        nsScore = score;
                    } else {
                        ewScore = score;
                    }
                } else {
                    // Simple penalty
                    const undertricks = (6 + level) - tricks;
                    const penalty = this.isVulnerable(contract.declarer) ? 
                        undertricks * 100 : undertricks * 50;
                    
                    if (this.isNorthSouth(contract.declarer)) {
                        ewScore = penalty;
                    } else {
                        nsScore = penalty;
                    }
                }
                
                return { NS: nsScore, EW: ewScore };
            }

            isGameContract(level, suit) {
                if (suit === 'NT' && level >= 3) return true;
                if ((suit === '♥' || suit === '♠') && level >= 4) return true;
                if ((suit === '♣' || suit === '♦') && level >= 5) return true;
                return false;
            }
        };
    }

    setupEventListeners() {
        // Primary button handler - works on all devices
        document.addEventListener('click', (e) => {
            this.handleClick(e);
        });

        // Mobile-specific touch handling
        if (this.isMobile) {
            document.addEventListener('touchend', (e) => {
                e.preventDefault(); // Prevent double-tap and click events
                this.handleClick(e);
            }, { passive: false });
            
            // Prevent scroll on button grid
            const buttonGrid = document.querySelector('.button-grid');
            if (buttonGrid) {
                buttonGrid.addEventListener('touchmove', (e) => {
                    e.preventDefault();
                }, { passive: false });
            }
        }
        
        // Keyboard support for desktop
        document.addEventListener('keydown', (e) => {
            this.handleKeyboard(e);
        });
    }

    handleClick(e) {
        // Handle regular buttons
        const btn = e.target.closest('.btn');
        if (btn && !btn.classList.contains('disabled')) {
            this.provideFeedback(btn);
            this.handleButtonPress(btn.dataset.value);
            return;
        }
        
        // Handle control buttons
        const controlBtn = e.target.closest('.control-item');
        if (controlBtn) {
            this.handleControlButton(controlBtn.id);
            return;
        }
    }

    provideFeedback(button) {
        // Visual feedback
        button.classList.add('pressed');
        
        // Haptic feedback on mobile
        if (this.isMobile && navigator.vibrate) {
            navigator.vibrate(30);
        }
        
        // Remove pressed state
        setTimeout(() => {
            button.classList.remove('pressed');
        }, 150);
    }

    handleButtonPress(value) {
        console.log('🔢 Button pressed:', value);
        
        if (this.appState === 'license_entry') {
            this.handleLicenseInput(value);
        } else if (this.appState === 'licensed_mode') {
            this.handleLicensedInput(value);
        } else if (this.appState === 'bridge_mode' && this.currentBridgeMode) {
            this.currentBridgeMode.handleInput(value);
        }
    }

    handleLicenseInput(value) {
        if (value >= '0' && value <= '9') {
            this.addDigit(value);
        } else if (value === 'BACK') {
            this.removeDigit();
        } else if (value === 'DEAL') {
            this.submitLicenseCode();
        }
    }

    handleLicensedInput(value) {
        if (['1', '2', '3', '4', '5'].includes(value)) {
            this.selectBridgeMode(value);
        } else if (value === 'BACK') {
            // Return to mode selection
            this.showLicensedMode({ type: this.licenseManager.getLicenseData()?.type || 'FULL' });
        }
    }

    async selectBridgeMode(mode) {
        const modeNames = {
            '1': 'Kitchen Bridge',
            '2': 'Bonus Bridge', 
            '3': 'Chicago Bridge',
            '4': 'Rubber Bridge',
            '5': 'Duplicate Bridge'
        };
        
        const modeName = modeNames[mode];
        console.log('🎮 Loading: ' + modeName);
        
        try {
            this.showMessage('Loading ' + modeName + '...', 'info');
            
            const ModuleClass = await this.loadBridgeModule(mode);
            
            // Create new bridge mode instance
            this.currentBridgeMode = new ModuleClass(this);
            this.appState = 'bridge_mode';
            
            // Initialize the mode display
            this.currentBridgeMode.updateDisplay();
            
            this.showMessage(modeName + ' loaded! 🎉', 'success');
            
        } catch (error) {
            console.error('Failed to load ' + modeName + ':', error);
            this.showMessage('Failed to load ' + modeName + '. Please try again.', 'error');
            
            // Return to mode selection after error
            setTimeout(() => {
                this.showLicensedMode({ type: this.licenseManager.getLicenseData()?.type || 'FULL' });
            }, 3000);
        }
    }

    // License handling methods
    addDigit(digit) {
        if (this.enteredCode.length < this.maxCodeLength) {
            this.enteredCode += digit;
            this.updateLicenseDisplay();
        }
    }

    removeDigit() {
        if (this.enteredCode.length > 0) {
            this.enteredCode = this.enteredCode.slice(0, -1);
            this.updateLicenseDisplay();
        }
    }

    updateLicenseDisplay() {
        const codeDisplay = document.getElementById('codeDisplay');
        const statusMessage = document.getElementById('statusMessage');
        const dealBtn = document.getElementById('dealBtn');
        
        if (!codeDisplay || !statusMessage || !dealBtn) {
            console.warn('License display elements not found');
            return;
        }
        
        // Update code display
        const displayCode = this.enteredCode.padEnd(this.maxCodeLength, '_').split('').join(' ');
        codeDisplay.textContent = displayCode;
        
        // Update deal button and status
        if (this.enteredCode.length === this.maxCodeLength) {
            dealBtn.classList.remove('disabled');
            statusMessage.textContent = 'Code complete - press DEAL to submit';
        } else {
            dealBtn.classList.add('disabled');
            const remaining = this.maxCodeLength - this.enteredCode.length;
            statusMessage.textContent = 'Enter ' + remaining + ' more digit' + (remaining !== 1 ? 's' : '');
        }
    }

    async submitLicenseCode() {
        if (this.enteredCode.length !== this.maxCodeLength) {
            this.showMessage('Code must be exactly 6 digits', 'error');
            return;
        }

        console.log('📤 Submitting license code:', this.enteredCode);
        
        // Show loading state
        this.showLoadingState('Validating license code...');
        
        try {
            // Simulate validation delay for better UX
            await new Promise(resolve => setTimeout(resolve, 800));
            
            const result = await this.licenseManager.activateLicense(this.enteredCode);
            
            if (result.success) {
                this.showMessage(result.message, 'success');
                this.isLicensed = true;
                this.appState = 'licensed_mode';
                
                // Transition to licensed mode
                setTimeout(() => {
                    this.showLicensedMode(result);
                }, 2000);
                
            } else {
                this.showMessage(result.message, 'error');
                
                // Clear code after error
                setTimeout(() => {
                    this.enteredCode = '';
                    this.updateLicenseDisplay();
                }, 2500);
            }
            
        } catch (error) {
            console.error('License validation error:', error);
            this.showMessage('Validation failed. Please try again.', 'error');
        } finally {
            this.hideLoadingState();
        }
    }

    showLicenseEntry(licenseStatus) {
        this.appState = 'license_entry';
        this.enteredCode = '';
        
        // Clean up any active bridge mode
        if (this.currentBridgeMode) {
            this.currentBridgeMode.destroy?.();
            this.currentBridgeMode = null;
        }
        
        const display = document.getElementById('display');
        if (!display) {
            console.error('Display element not found');
            return;
        }
        
        // Create HTML content safely
        const titleRow = '<div class="title-score-row"><div class="mode-title">🔑 License Code</div><div class="score-display">Bridge<br>Modes</div></div>';
        const gameContent = '<div class="game-content"><div class="code-display" id="codeDisplay">_ _ _ _ _ _</div><div class="status-message" id="statusMessage">' + licenseStatus.message + '</div></div>';
        const currentState = '<div class="current-state">Use number buttons. BACK to delete, DEAL to submit</div>';
        
        display.innerHTML = titleRow + gameContent + currentState;
        
        this.updateButtonStates(['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'BACK']);
        this.updateLicenseDisplay();
    }

    showLicensedMode(licenseInfo) {
        this.appState = 'licensed_mode';
        
        // Clean up any active bridge mode
        if (this.currentBridgeMode) {
            this.currentBridgeMode.destroy?.();
            this.currentBridgeMode = null;
        }
        
        const licenseType = licenseInfo.type || 'FULL';
        const isTrialMode = licenseType === 'TRIAL';
        
        let licenseText = '';
        if (isTrialMode) {
            const status = this.licenseManager.checkLicenseStatus();
            licenseText = 'Trial: ' + (status.daysLeft || 0) + ' days, ' + (status.dealsLeft || 0) + ' deals left';
        } else {
            licenseText = 'Full Version Activated';
        }
        
        const display = document.getElementById('display');
        if (!display) {
            console.error('Display element not found');
            return;
        }
        
        // Create HTML content safely
        const titleRow = '<div class="title-score-row"><div class="mode-title">Bridge Modes Calculator</div><div class="score-display">NS: 0<br>EW: 0</div></div>';
        
        const modeGrid = '<div class="mode-grid"><div class="mode-row"><span><strong>1</strong> - Kitchen Bridge</span><span><strong>2</strong> - Bonus Bridge</span></div><div class="mode-row"><span><strong>3</strong> - Chicago Bridge</span></div><div class="mode-row"><span><strong>4</strong> - Rubber Bridge</span><span><strong>5</strong> - Duplicate Bridge</span></div></div>';
        
        const gameContent = '<div class="game-content"><div class="mode-selection">' + modeGrid + '</div></div>';
        const currentState = '<div class="current-state">Press 1-5 to select bridge scoring mode</div>';
        const licenseStatus = '<div class="license-status">' + licenseText + '</div>';

        display.innerHTML = titleRow + gameContent + currentState + licenseStatus;

        // Enable mode selection buttons and controls
        this.updateButtonStates(['1', '2', '3', '4', '5']);
        this.enableControls();
    }

    updateButtonStates(activeButtons) {
        const allButtons = document.querySelectorAll('.btn');
        
        allButtons.forEach(btn => {
            const value = btn.dataset.value;
            
            if (activeButtons.includes(value)) {
                btn.classList.remove('disabled');
                btn.classList.add('active-operation');
            } else {
                btn.classList.add('disabled');
                btn.classList.remove('active-operation');
            }
        });
        
        console.log('🎯 Active buttons:', activeButtons);
    }

    enableControls() {
        const vulnControl = document.getElementById('vulnControl');
        if (vulnControl) {
            vulnControl.classList.remove('disabled');
        }
    }

    handleControlButton(controlId) {
        console.log('🎛️ Control button pressed:', controlId);
        
        switch (controlId) {
            case 'wakeControl':
                this.toggleWakeLock();
                break;
            case 'vulnControl':
                this.toggleVulnerability();
                break;
            case 'helpControl':
                // Route to bridge mode if active
                if (this.currentBridgeMode && typeof this.currentBridgeMode.showHelp === 'function') {
                    console.log('📖 Routing help to bridge mode');
                    this.currentBridgeMode.showHelp();
                } else {
                    console.log('📖 Using default help');
                    this.showHelp();
                }
                break;
            case 'quitControl':
                // Route to bridge mode if active
                if (this.currentBridgeMode && typeof this.currentBridgeMode.showQuit === 'function') {
                    console.log('🚪 Routing quit to bridge mode');
                    this.currentBridgeMode.showQuit();
                } else {
                    console.log('🚪 Using default quit');
                    this.showQuit();
                }
                break;
        }
    }
    
    // HELP METHOD - Simplified to avoid template literal issues
    showHelp() {
        // If in bridge mode, let the bridge mode handle help
        if (this.currentBridgeMode && typeof this.currentBridgeMode.showHelp === 'function') {
            this.currentBridgeMode.showHelp();
            return;
        }
        
        // Simple help content
        const title = this.appState === 'license_entry' ? '🔑 License Help' : '🃏 Bridge Modes Calculator Help';
        const content = '<p>Basic help content loaded successfully. App is working!</p><p>Email: <a href="mailto:mike.chris.smith@gmail.com">mike.chris.smith@gmail.com</a></p>';
        
        this.showModal(title, content);
    }

    // Simplified methods to avoid complex template literals
    showQuit() {
        this.showModal('Quit Options', '<p>Choose an option:</p>', [
            { text: 'Continue', action: 'close' },
            { text: 'Close App', action: () => this.closeApp() }
        ]);
    }

    async toggleWakeLock() {
        const wakeToggle = document.getElementById('wakeToggle');
        
        try {
            if ('wakeLock' in navigator) {
                if (this.wakeLock) {
                    await this.wakeLock.release();
                    this.wakeLock = null;
                    this.isWakeActive = false;
                    wakeToggle?.classList.remove('active');
                    this.showMessage('Screen sleep enabled', 'info');
                } else {
                    this.wakeLock = await navigator.wakeLock.request('screen');
                    this.isWakeActive = true;
                    wakeToggle?.classList.add('active');
                    this.showMessage('Screen will stay awake', 'success');
                }
            } else {
                this.showMessage('Wake lock not supported', 'error');
            }
        } catch (error) {
            console.error('Wake lock error:', error);
            this.showMessage('Wake lock unavailable', 'error');
        }
    }

    toggleVulnerability() {
        const vulnText = document.getElementById('vulnText');
        
        // If in bridge mode, let the bridge mode handle it
        if (this.currentBridgeMode && typeof this.currentBridgeMode.toggleVulnerability === 'function') {
            this.currentBridgeMode.toggleVulnerability();
            return;
        }
        
        // Default behavior for main menu
        if (!vulnText) {
            console.warn('Vulnerability text element not found');
            return;
        }
        
        const states = ['NV', 'NS', 'EW', 'Both'];
        const current = vulnText.textContent;
        const currentIndex = states.indexOf(current);
        const nextIndex = (currentIndex + 1) % states.length;
        
        vulnText.textContent = states[nextIndex];
        this.showMessage('Vulnerability: ' + states[nextIndex], 'info');
    }

    handleKeyboard(e) {
        if (e.key >= '0' && e.key <= '9') {
            e.preventDefault();
            this.handleButtonPress(e.key);
        } else if (e.key === 'Backspace') {
            e.preventDefault();
            this.handleButtonPress('BACK');
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (this.appState === 'license_entry') {
                this.handleButtonPress('DEAL');
            }
        }
    }

    showLoadingState(message = 'Loading...') {
        const statusMessage = document.getElementById('statusMessage');
        if (statusMessage) {
            statusMessage.innerHTML = '<div class="loading-spinner"></div><div>' + message + '</div>';
        }
    }

    hideLoadingState() {
        if (this.appState === 'license_entry') {
            this.updateLicenseDisplay();
        }
    }

    showMessage(text, type = 'info') {
        const statusMessage = document.getElementById('statusMessage');
        if (!statusMessage) return;
        
        const messageClass = type === 'error' ? 'error-message' : 
                           type === 'success' ? 'success-message' : 'info-message';
        
        statusMessage.innerHTML = '<div class="' + messageClass + '">' + text + '</div>';
        
        // Auto-clear messages after delay
        if (type !== 'error') {
            setTimeout(() => {
                if (this.appState === 'license_entry') {
                    this.updateLicenseDisplay();
                }
            }, 3000);
        }
    }

    closeApp() {
        if (window.close) {
            window.close();
        } else {
            // For PWA/mobile, show instructions
            alert('To close this app:\n\n• On mobile: Use your device home button or recent apps\n• On desktop: Close this browser tab');
        }
    }

    // ENHANCED MODAL METHOD - Fixed for Mobile Scrolling on Pixel 9a
    showModal(title, content, buttons = null) {
        // Prevent body scroll when modal opens
        document.body.classList.add('modal-open');
        
        // Create modal overlay
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        
        const defaultButtons = [{ text: 'Close', action: null }];
        const modalButtons = buttons || defaultButtons;
        
        let buttonsHTML = '';
        modalButtons.forEach(btn => {
            const closeClass = (btn.text === 'Close' || btn.text === 'Cancel') ? ' close' : '';
            buttonsHTML += '<button class="modal-btn' + closeClass + '" data-action="' + btn.text + '">' + btn.text + '</button>';
        });
        
        modal.innerHTML = '<div class="modal-content"><h3>' + title + '</h3><div class="modal-body">' + content + '</div><div class="modal-buttons">' + buttonsHTML + '</div></div>';
        
        // Enhanced event handling - the fix that worked!
        const handleAction = (actionText) => {
            // Restore body scroll
            document.body.classList.remove('modal-open');
            
            const buttonConfig = modalButtons.find(b => b.text === actionText);
            if (buttonConfig && buttonConfig.action && buttonConfig.action !== 'close') {
                buttonConfig.action();
            }
            modal.remove();
        };
        
        // Method 1: Traditional click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                handleAction('Close');
                return;
            }
            
            const btn = e.target.closest('.modal-btn');
            if (btn) {
                handleAction(btn.dataset.action);
            }
        });
        
        // Method 2: Direct button event listeners (this was the key fix!)
        setTimeout(() => {
            const modalBtns = modal.querySelectorAll('.modal-btn');
            
            modalBtns.forEach((btn) => {
                // Multiple event types for maximum compatibility
                ['click', 'touchend', 'pointerup'].forEach(eventType => {
                    btn.addEventListener(eventType, (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleAction(btn.dataset.action);
                    }, { passive: false });
                });
                
                // Visual feedback for touch
                btn.addEventListener('touchstart', (e) => {
                    btn.style.background = 'rgba(52, 152, 219, 0.8)';
                    btn.style.transform = 'scale(0.98)';
                }, { passive: true });
                
                btn.addEventListener('touchcancel', (e) => {
                    btn.style.background = '';
                    btn.style.transform = '';
                }, { passive: true });
                
                btn.addEventListener('touchend', (e) => {
                    btn.style.background = '';
                    btn.style.transform = '';
                }, { passive: true });
            });
        }, 50);
        
        // Method 3: Mobile fallback - Enhanced for scrolling
        if (this.isMobile) {
            // Prevent modal background from interfering with scrolling
            modal.addEventListener('touchstart', (e) => {
                // Allow scrolling within modal content
                if (!e.target.closest('.modal-content')) {
                    e.preventDefault();
                }
            }, { passive: false });
            
            modal.addEventListener('touchend', (e) => {
                if (e.target === modal) {
                    handleAction('Close');
                }
            }, { passive: false });
            
            // Enhanced touch handling for modal content scrolling
            const modalContent = modal.querySelector('.modal-content');
            if (modalContent) {
                let startY = 0;
                let currentY = 0;
                
                modalContent.addEventListener('touchstart', (e) => {
                    startY = e.touches[0].clientY;
                }, { passive: true });
                
                modalContent.addEventListener('touchmove', (e) => {
                    currentY = e.touches[0].clientY;
                    const scrollTop = modalContent.scrollTop;
                    const scrollHeight = modalContent.scrollHeight;
                    const clientHeight = modalContent.clientHeight;
                    
                    // Prevent overscroll bouncing
                    if ((scrollTop <= 0 && currentY > startY) || 
                        (scrollTop >= scrollHeight - clientHeight && currentY < startY)) {
                        e.preventDefault();
                    }
                }, { passive: false });
            }
        }
        
        document.body.appendChild(modal);
        
        // Auto-focus first button for accessibility
        setTimeout(() => {
            const firstButton = modal.querySelector('.modal-btn');
            if (firstButton && !this.isMobile) {
                firstButton.focus();
            }
        }, 100);
        
        // Close modal on Escape key
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                handleAction('Close');
                document.removeEventListener('keydown', handleEscape);
            }
        };
        document.addEventListener('keydown', handleEscape);
    }

    closeModal() {
        const existingModal = document.querySelector('.modal-overlay');
        if (existingModal) {
            existingModal.remove();
            // Restore body scroll when modal closes
            document.body.classList.remove('modal-open');
        }
    }

    // Utility methods for bridge modes
    getCurrentLicenseStatus() {
        return this.licenseManager.checkLicenseStatus();
    }

    getDealsStats() {
        return this.licenseManager.getDealsStats();
    }

    // Return to mode selection (used by bridge modes)
    returnToModeSelection() {
        if (this.currentBridgeMode) {
            this.currentBridgeMode.destroy?.();
            this.currentBridgeMode = null;
        }
        
        this.appState = 'licensed_mode';
        const licenseStatus = this.licenseManager.checkLicenseStatus();
        this.showLicensedMode(licenseStatus);
    }

    // Get current app state (for bridge modes)
    getAppState() {
        return {
            appState: this.appState,
            isLicensed: this.isLicensed,
            isMobile: this.isMobile,
            currentMode: this.currentBridgeMode?.modeName || null
        };
    }

    // Deal completion callback
    onDealCompleted() {
        const result = this.licenseManager.incrementDealsPlayed();
        
        if (result.trialExpired) {
            this.showMessage('Trial expired! Enter full version code.', 'error');
            setTimeout(() => {
                this.showLicenseEntry(result.licenseStatus);
            }, 2000);
        }
    }

    // Cleanup method
    cleanup() {
        console.log('🧹 Cleaning up Bridge App');
        
        // Release wake lock
        if (this.wakeLock) {
            this.wakeLock.release().catch(console.error);
        }
        
        // Clean up bridge mode
        if (this.currentBridgeMode) {
            this.currentBridgeMode.destroy?.();
        }
        
        // Restore body scroll
        document.body.classList.remove('modal-open');
        
        // Remove event listeners
        document.removeEventListener('click', this.handleClick);
        document.removeEventListener('touchend', this.handleClick);
        document.removeEventListener('keydown', this.handleKeyboard);
    }
}

// Make app globally accessible
if (typeof window !== 'undefined') {
    window.BridgeApp = BridgeApp;
    console.log('✅ BridgeApp class exported to window');
}

// Development utilities
if (location.hostname === 'localhost' || 
    location.hostname === '127.0.0.1' || 
    location.hostname.includes('github.io')) {
    
    window.forceClearCache = async function() {
        console.log('🧹 Force clearing all caches...');
        
        // Clear all caches
        const cacheNames = await caches.keys();
        await Promise.all(
            cacheNames.map(cacheName => caches.delete(cacheName))
        );
        
        // Unregister service worker
        if ('serviceWorker' in navigator) {
            const registrations = await navigator.serviceWorker.getRegistrations();
            await Promise.all(
                registrations.map(registration => registration.unregister())
            );
        }
        
        console.log('✅ All caches cleared and service worker unregistered');
        console.log('🔄 Reloading page...');
        
        setTimeout(() => location.reload(true), 500);
    };
    
    console.log('🛠️ Development mode detected');
    console.log('• forceClearCache() - Clear all caches and reload');
    console.log('• Check console for version: Should show "APP.JS VERSION: 2025-01-31-SCROLL-FIXED"');
}