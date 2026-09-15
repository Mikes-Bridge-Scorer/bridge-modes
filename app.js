// SECTION ONE - Header and Constructor
// VERSION CHECK - Updated at 2025-01-31
console.log('🔍 APP.JS VERSION: 2025-01-31-ENHANCED');

/**
 * Bridge Modes Calculator - Main Application Controller
 * Mobile-first touch handling with modular architecture
 * License logic extracted to license.js for better organization
 */

class BridgeApp {
    constructor() {
        console.log('🎮 BridgeApp constructor called - Version 2025-01-31-ENHANCED');
        
        this.enteredCode = '';
        this.isLicensed = false;
        this.appState = 'license_entry'; // 'license_entry', 'licensed_mode', or 'bridge_mode'
        this.maxCodeLength = 6;
        this.currentBridgeMode = null;
        
        // Mobile detection
        this.isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        // Initialize license manager (imported from license.js)
        this.licenseManager = new LicenseManager();
        
        // ENHANCED HELP SYSTEM INITIALIZATION WITH ERROR HANDLING
        this.helpSystem = null;
        this.initializeHelpSystem();
        
        // Wake lock for screen management
        this.wakeLock = null;
        this.isWakeActive = false;
        
        // Module loading cache
        this.loadedModules = new Map();
        
        this.init();
    }
// END SECTION ONE
// SECTION TWO - Initialization and Help System
    async init() {
        console.log('🎮 Initializing Bridge Modes Calculator');
        console.log('📱 Mobile device detected:', this.isMobile);
        
        // Load base mode class first
        await this.loadBaseMode();

        // Create the persistent licence bar once — lives outside #display
        // so it stays visible regardless of appState (mode selection,
        // mid-game, license entry — everywhere)
        this.createLicenseBar();
        
        // Check existing license
        const licenseStatus = this.licenseManager.checkLicenseStatus();
        
        if (!licenseStatus.needsCode) {
            console.log('🔄 Valid license found, entering licensed mode');
            this.isLicensed = true;
            this.appState = 'licensed_mode';
            this.showLicensedMode(licenseStatus);
        } else {
            console.log('🔒 No valid license, showing license entry');
            this.showLicenseEntry(licenseStatus);
        }
        
        this.setupEventListeners();
        this.updateLicenseBar();
        console.log('✅ Bridge Modes Calculator ready');
    }

    // Build the fixed bottom bar once and insert it into the page
    createLicenseBar() {
        if (document.getElementById('licenseBar')) return;

        const bar = document.createElement('div');
        bar.id = 'licenseBar';
        bar.style.cssText = `
            position: fixed;
            left: 0;
            right: 0;
            bottom: 0;
            z-index: 500;
            background: #0a1628;
            color: #c8d8f0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            font-size: 13px;
            font-weight: 600;
            text-align: center;
            padding: 8px 10px;
            box-shadow: 0 -2px 8px rgba(0,0,0,0.15);
        `;
        document.body.appendChild(bar);
    }

    // Refresh the bar's content — call this any time license/trial state
    // might have changed, or when switching screens
    updateLicenseBar() {
        const bar = document.getElementById('licenseBar');
        if (!bar) return;

        // Hide the bar on the license-entry screen — that screen already
        // shows the full explanation, no need to duplicate it underneath
        if (this.appState === 'license_entry') {
            bar.style.display = 'none';
            return;
        }

        const status = this.licenseManager.checkLicenseStatus();
        const annualUrl = this.licenseManager.config.annualBuyUrl;
        const lifetimeUrl = this.licenseManager.config.lifetimeBuyUrl;
        const linkStyle = 'color:#ffd27a;text-decoration:underline;';

        let html = '';
        if (status.status === 'lifetime') {
            html = 'Lifetime access — thank you for your support! 🎉';
        } else if (status.status === 'trial') {
            html = status.daysLeft + ' day' + (status.daysLeft !== 1 ? 's' : '') + ' left · ' +
                '<a href="' + annualUrl + '" target="_blank" style="' + linkStyle + '">1yr £10</a> · ' +
                '<a href="' + lifetimeUrl + '" target="_blank" style="' + linkStyle + '">Lifetime £25</a>';
        } else if (status.status === 'annual') {
            html = status.daysLeft + ' day' + (status.daysLeft !== 1 ? 's' : '') + ' left · ' +
                '<a href="' + annualUrl + '" target="_blank" style="' + linkStyle + '">Renew £10</a> · ' +
                '<a href="' + lifetimeUrl + '" target="_blank" style="' + linkStyle + '">Lifetime £25</a>';
        } else {
            // trial_expired / annual_expired — license entry screen handles
            // this in full, so keep the bar minimal here
            html = 'Licence needed · ' +
                '<a href="' + annualUrl + '" target="_blank" style="' + linkStyle + '">1yr £10</a> · ' +
                '<a href="' + lifetimeUrl + '" target="_blank" style="' + linkStyle + '">Lifetime £25</a>';
        }

        bar.style.display = '';
        bar.innerHTML = html;
    }

    // NEW METHOD: Enhanced help system initialization with fallback
    initializeHelpSystem() {
        try {
            // Check if the help functions are available
            if (typeof initializeBridgeHelp === 'function') {
                this.helpSystem = initializeBridgeHelp(this);
                console.log('✅ Enhanced Bridge Help System initialized successfully');
            } else {
                console.warn('⚠️ initializeBridgeHelp function not found, using fallback');
                this.helpSystem = this.createFallbackHelpSystem();
            }
        } catch (error) {
            console.error('⛔ Failed to initialize help system:', error);
            console.log('🔄 Creating fallback help system...');
            this.helpSystem = this.createFallbackHelpSystem();
        }
    }

    // NEW METHOD: Fallback help system
    createFallbackHelpSystem() {
        return {
            show: (modeName) => {
                console.log('📚 Using fallback help for:', modeName);
                this.showFallbackHelp(modeName);
            },
            close: () => {
                this.closeModal();
            },
            isVisible: false
        };
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
            console.error('⛔ Failed to load base mode:', error);
            throw new Error('Failed to load required base mode class');
        }
    }
// END SECTION TWO
// SECTION THREE - Module Loading
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
// END SECTION THREE
// SECTION FOUR - Event Handling
    setupEventListeners() {
        // Primary button handler - works on all devices
        document.addEventListener('click', (e) => {
            this.handleClick(e);
        });

        // Mobile-specific touch handling
        if (this.isMobile) {
            document.addEventListener('touchend', (e) => {
                // Let real links (like the license bar's buy links) behave
                // normally — don't intercept taps on <a> elements
                if (e.target.closest('a')) {
                    return;
                }
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
// END SECTION FOUR
// SECTION FIVE - Bridge Mode Selection
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

            // Keep the persistent bottom bar visible and current now that
            // we've left the mode-selection screen
            this.updateLicenseBar();
            
        } catch (error) {
            console.error('Failed to load ' + modeName + ':', error);
            this.showMessage('Failed to load ' + modeName + '. Please try again.', 'error');
            
            // Return to mode selection after error
            setTimeout(() => {
                this.showLicensedMode({ type: this.licenseManager.getLicenseData()?.type || 'FULL' });
            }, 3000);
        }
    }

    showLicensedMode(licenseInfo) {
        this.appState = 'licensed_mode';
        
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
        const titleRow = '<div class="title-score-row"><div class="mode-title">Bridge Modes Calculator</div><div class="score-display">NS: 0<br>EW: 0</div></div>';
        
        const modeGrid = '<div class="mode-grid"><div class="mode-row"><span><strong>1</strong> - Kitchen Bridge</span><span><strong>2</strong> - Bonus Bridge</span></div><div class="mode-row"><span><strong>3</strong> - Chicago Bridge</span></div><div class="mode-row"><span><strong>4</strong> - Rubber Bridge</span><span><strong>5</strong> - Duplicate Bridge</span></div></div>';
        
        const gameContent = '<div class="game-content"><div class="mode-selection">' + modeGrid + '</div></div>';
        const currentState = '<div class="current-state">Press 1-5 to select bridge scoring mode</div>';

        display.innerHTML = titleRow + gameContent + currentState;

        // Enable mode selection buttons and controls
        this.updateButtonStates(['1', '2', '3', '4', '5']);
        this.enableControls();

        // Keep the persistent bottom bar in sync with current status
        this.updateLicenseBar();
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
// END SECTION FIVE
// SECTION SIX - License Handling
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
        this.updateLicenseBar();
    }
// END SECTION SIX
// SECTION SEVEN - Control Handling and Wake Lock
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
// END SECTION SEVEN
// SECTION EIGHT - Help and Fallback Systems
    // ENHANCED HELP METHOD WITH ROBUST ERROR HANDLING
    showHelp() {
        try {
            // If in bridge mode, let the bridge mode handle help
            if (this.currentBridgeMode && typeof this.currentBridgeMode.showHelp === 'function') {
                this.currentBridgeMode.showHelp();
                return;
            }
            
            // Use help system if available
            if (this.helpSystem && typeof this.helpSystem.show === 'function') {
                this.helpSystem.show();
                return;
            }
            
            // Fallback to basic help
            this.showFallbackHelp('general');
            
        } catch (error) {
            console.error('❌ Error showing help:', error);
            this.showFallbackHelp('general');
        }
    }

    // NEW METHOD: Fallback help content
    showFallbackHelp(modeName) {
        const helpContent = this.getFallbackHelpContent(modeName);
        this.showModal(helpContent.title, helpContent.content, [
            { text: 'Close', action: 'close' }
        ]);
    }

    // NEW METHOD: Generate fallback help content
    getFallbackHelpContent(modeName) {
        const helpMap = {
            'kitchen': {
                title: '🍳 Kitchen Bridge Help',
                content: `
                    <h4>Kitchen Bridge (Party Bridge)</h4>
                    <p>Traditional bridge scoring for casual 4-player games.</p>
                    
                    <h4>How to Use:</h4>
                    <ol>
                        <li>Set vulnerability with NV button</li>
                        <li>Enter contract: Level → Suit → Declarer → Result</li>
                        <li>Press Deal for next hand</li>
                    </ol>
                    
                    <h4>Scoring:</h4>
                    <ul>
                        <li>Minor suits: 20 points per trick</li>
                        <li>Major suits: 30 points per trick</li>
                        <li>No Trump: 30 points + 10 bonus</li>
                        <li>Game bonus: 300 (NV) or 500 (Vul)</li>
                    </ul>

                    <h4>Need a License?</h4>
                    <p>Annual — £10/year: <a href="${this.licenseManager.config.annualBuyUrl}" target="_blank">${this.licenseManager.config.annualBuyUrl}</a></p>
                    <p>Lifetime — £25 one-off: <a href="${this.licenseManager.config.lifetimeBuyUrl}" target="_blank">${this.licenseManager.config.lifetimeBuyUrl}</a></p>
                `
            },
            'chicago': {
                title: '🌉 Chicago Bridge Help',
                content: `
                    <h4>Chicago Bridge (4-Deal Cycle)</h4>
                    <p>Bridge with automatic vulnerability rotation over 4 deals.</p>
                    
                    <h4>4-Deal Cycle:</h4>
                    <ul>
                        <li>Deal 1: None vulnerable</li>
                        <li>Deal 2: North-South vulnerable</li>
                        <li>Deal 3: East-West vulnerable</li>
                        <li>Deal 4: Both vulnerable</li>
                    </ul>
                    
                    <h4>Features:</h4>
                    <ul>
                        <li>Automatic vulnerability rotation</li>
                        <li>Dealer advances each deal</li>
                        <li>Natural 4-deal break points</li>
                    </ul>

                    <h4>Need a License?</h4>
                    <p>Annual — £10/year: <a href="${this.licenseManager.config.annualBuyUrl}" target="_blank">${this.licenseManager.config.annualBuyUrl}</a></p>
                    <p>Lifetime — £25 one-off: <a href="${this.licenseManager.config.lifetimeBuyUrl}" target="_blank">${this.licenseManager.config.lifetimeBuyUrl}</a></p>
                `
            },
            'bonus': {
                title: '⭐ Bonus Bridge Help',
                content: `
                    <h4>Bonus Bridge (HCP-Enhanced)</h4>
                    <p>Enhanced scoring system by Mike Smith that rewards skill over luck.</p>
                    
                    <h4>How It Works:</h4>
                    <ol>
                        <li>Enter contract normally</li>
                        <li>Analyze hand strength (HCP + distribution)</li>
                        <li>System adjusts scores based on performance vs expectations</li>
                    </ol>
                    
                    <h4>Key Features:</h4>
                    <ul>
                        <li>Rewards both declarers and defenders</li>
                        <li>Considers hand strength in scoring</li>
                        <li>More skill-based, less luck-dependent</li>
                    </ul>

                    <h4>Need a License?</h4>
                    <p>Annual — £10/year: <a href="${this.licenseManager.config.annualBuyUrl}" target="_blank">${this.licenseManager.config.annualBuyUrl}</a></p>
                    <p>Lifetime — £25 one-off: <a href="${this.licenseManager.config.lifetimeBuyUrl}" target="_blank">${this.licenseManager.config.lifetimeBuyUrl}</a></p>
                `
            },
            'rubber': {
                title: '🎯 Rubber Bridge Help',
                content: `
                    <h4>Rubber Bridge (Traditional)</h4>
                    <p>Classic bridge as played for over 100 years.</p>
                    
                    <h4>Game Structure:</h4>
                    <ul>
                        <li>First to win 2 games wins the rubber</li>
                        <li>Rubber bonus: 700 (2-0) or 500 (2-1)</li>
                        <li>Part-scores accumulate toward game</li>
                    </ul>
                    
                    <h4>Vulnerability:</h4>
                    <ul>
                        <li>Not vulnerable until you win first game</li>
                        <li>Vulnerable after winning one game</li>
                    </ul>

                    <h4>Need a License?</h4>
                    <p>Annual — £10/year: <a href="${this.licenseManager.config.annualBuyUrl}" target="_blank">${this.licenseManager.config.annualBuyUrl}</a></p>
                    <p>Lifetime — £25 one-off: <a href="${this.licenseManager.config.lifetimeBuyUrl}" target="_blank">${this.licenseManager.config.lifetimeBuyUrl}</a></p>
                `
            },
            'duplicate': {
                title: '♦ Duplicate Bridge Help',
                content: `
                    <h4>Duplicate Bridge (Tournament)</h4>
                    <p>Competitive bridge with matchpoint and IMP scoring.</p>
                    
                    <h4>Scoring Methods:</h4>
                    <ul>
                        <li><strong>Matchpoints:</strong> Compare results with other pairs</li>
                        <li><strong>IMPs:</strong> International Match Points for teams</li>
                        <li><strong>Board-a-Match:</strong> Win/Lose/Tie system</li>
                    </ul>
                    
                    <h4>Key Differences:</h4>
                    <ul>
                        <li>Eliminates luck factor</li>
                        <li>Fair comparison of skill</li>
                        <li>Pre-determined vulnerability</li>
                    </ul>

                    <h4>Need a License?</h4>
                    <p>Annual — £10/year: <a href="${this.licenseManager.config.annualBuyUrl}" target="_blank">${this.licenseManager.config.annualBuyUrl}</a></p>
                    <p>Lifetime — £25 one-off: <a href="${this.licenseManager.config.lifetimeBuyUrl}" target="_blank">${this.licenseManager.config.lifetimeBuyUrl}</a></p>
                `
            }
        };
        
        return helpMap[modeName] || {
            title: '🃏 Bridge Help',
            content: `
                <h4>Bridge Modes Calculator</h4>
                <p>Professional bridge scoring for all major bridge variants.</p>
                
                <h4>Available Modes:</h4>
                <ul>
                    <li>Kitchen Bridge - Casual scoring</li>
                    <li>Chicago Bridge - 4-deal cycles</li>
                    <li>Bonus Bridge - HCP-enhanced</li>
                    <li>Rubber Bridge - Traditional</li>
                    <li>Duplicate Bridge - Tournament</li>
                </ul>
                
                <h4>Need a License?</h4>
                <p>Annual — £10/year: <a href="${this.licenseManager.config.annualBuyUrl}" target="_blank">${this.licenseManager.config.annualBuyUrl}</a></p>
                <p>Lifetime — £25 one-off: <a href="${this.licenseManager.config.lifetimeBuyUrl}" target="_blank">${this.licenseManager.config.lifetimeBuyUrl}</a></p>
            `
        };
    }
// END SECTION EIGHT
// SECTION NINE - Quit and Purchase Systems (MOBILE OPTIMIZED)
    // ENHANCED QUIT METHOD WITH LICENSE PURCHASE
    showQuit() {
        const licenseStatus = this.licenseManager.checkLicenseStatus();
        const isTrialMode = ['trial', 'expired', 'annual_expired'].includes(licenseStatus.status);
        
        let title = 'Options';
        let content = '<p>What would you like to do?</p>';
        let buttons = [
            { text: 'Continue', action: 'close' }
        ];
        
        // Add license purchase option for trial/expired users
        if (isTrialMode) {
            title = '🎯 Upgrade Available';
            content = `
                <div style="padding: 20px; font-size: 14px; line-height: 1.4;">
                    <div style="margin-bottom: 20px;">
                        <p style="margin: 0 0 12px 0; font-weight: bold; font-size: 16px;">Enjoying Bridge Modes Calculator?</p>
                        <p style="margin: 0 0 16px 0;">Upgrade to the full version for:</p>
                    </div>
                    
                    <div style="background: #f8f9fa; padding: 16px; border-radius: 8px; margin-bottom: 20px;">
                        <ul style="margin: 0; padding-left: 20px; font-size: 13px; line-height: 1.5;">
                            <li style="margin-bottom: 6px;"><strong>✅ Unlimited time, no restrictions</strong></li>
                            <li style="margin-bottom: 6px;"><strong>✅ All 5 bridge scoring modes</strong></li>
                            <li style="margin-bottom: 6px;"><strong>✅ Advanced scoring features</strong></li>
                            <li style="margin-bottom: 0;"><strong>✅ Ongoing updates</strong></li>
                        </ul>
                    </div>
                    
                    <div style="background: #e3f2fd; padding: 16px; border-radius: 8px; text-align: center;">
                        <p style="margin: 0; font-weight: bold; color: #1976d2;">Annual £10/year or Lifetime £25 one-off</p>
                    </div>
                </div>
            `;
            
            buttons = [
                { text: 'Continue Playing', action: 'close' },
                { text: 'Get a Licence', action: () => this.showPurchaseInfo() },
                { text: 'Enter Code', action: () => this.showLicenseEntry(this.licenseManager.checkLicenseStatus()) }
            ];
        } else {
            // Full version - standard quit menu
            buttons = [
                { text: 'Continue', action: 'close' },
                { text: 'Close App', action: () => this.closeApp() }
            ];
        }
        
        this.showMobileOptimizedModal(title, content, buttons);
    }

    // LICENSE PURCHASE INFORMATION - MOBILE OPTIMIZED
    showPurchaseInfo() {
        const annualUrl = this.licenseManager.config.annualBuyUrl;
        const lifetimeUrl = this.licenseManager.config.lifetimeBuyUrl;

        const content = `
            <div style="padding: 20px; font-size: 14px; line-height: 1.4;">
                <div style="margin-bottom: 20px;">
                    <h4 style="margin: 0 0 8px 0; color: #1976d2; font-size: 16px;">🔓 Unlock the Full Version</h4>
                    <p style="margin: 0; font-weight: bold;">Bridge Modes Calculator</p>
                </div>
                
                <div style="background: #f8f9fa; padding: 16px; border-radius: 8px; margin-bottom: 20px;">
                    <h5 style="margin: 0 0 12px 0; color: #2c3e50; font-size: 14px;">What's Included:</h5>
                    <ul style="margin: 0; padding-left: 20px; font-size: 13px; line-height: 1.4;">
                        <li>All 5 bridge scoring modes</li>
                        <li>Unlimited playing time</li>
                        <li>Advanced scoring features</li>
                        <li>Ongoing updates</li>
                    </ul>
                </div>
                
                <div style="background: #e8f5e8; padding: 16px; border-radius: 8px; margin-bottom: 12px;">
                    <p style="margin: 0 0 6px 0; font-weight: bold; color: #155724;">Annual — £10/year</p>
                    <p style="margin: 0; font-size: 13px;"><a href="${annualUrl}" target="_blank" style="color: #155724;">${annualUrl}</a></p>
                </div>

                <div style="background: #e8f5e8; padding: 16px; border-radius: 8px; margin-bottom: 20px;">
                    <p style="margin: 0 0 6px 0; font-weight: bold; color: #155724;">Lifetime — £25 one-off</p>
                    <p style="margin: 0; font-size: 13px;"><a href="${lifetimeUrl}" target="_blank" style="color: #155724;">${lifetimeUrl}</a></p>
                </div>
                
                <div style="text-align: center; background: #fff3cd; padding: 12px; border-radius: 8px;">
                    <p style="margin: 0; font-weight: bold; color: #856404; font-size: 13px;">You'll receive a 6-digit unlock code by download after purchase.</p>
                </div>
            </div>
        `;
        
        const buttons = [
            { text: 'Get Annual', action: () => window.open(annualUrl, '_blank') },
            { text: 'Get Lifetime', action: () => window.open(lifetimeUrl, '_blank') },
            { text: 'Close', action: 'close' }
        ];
        
        this.showMobileOptimizedModal('🔓 Unlock Full Version', content, buttons);
    }

    closeApp() {
        if (window.close) {
            window.close();
        } else {
            // For PWA/mobile, show instructions
            alert('To close this app:\n\n• On mobile: Use your device home button or recent apps\n• On desktop: Close this browser tab');
        }
    }

    // NEW: Mobile-optimized modal method for app.js
    showMobileOptimizedModal(title, content, buttons = null) {
        // Prevent body scroll when modal opens
        document.body.classList.add('modal-open');
        
        // Create modal overlay using proven template
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.7);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
            padding: 10px;
        `;
        
        const defaultButtons = [{ text: 'Close', action: 'close' }];
        const modalButtons = buttons || defaultButtons;
        
        // Create responsive button layout
        let buttonsHTML = '';
        if (modalButtons.length === 3) {
            // 2+1 layout for 3 buttons (mobile friendly)
            buttonsHTML = `
                <div style="display: flex; flex-direction: column; gap: 8px; width: 100%;">
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
                        <button class="modal-btn" data-action="${modalButtons[0].text}" style="
                            padding: 12px 8px;
                            border: none;
                            border-radius: 6px;
                            font-size: 13px;
                            font-weight: 600;
                            cursor: pointer;
                            background: #27ae60;
                            color: white;
                            touch-action: manipulation;
                            user-select: none;
                            -webkit-tap-highlight-color: transparent;
                        ">${modalButtons[0].text}</button>
                        <button class="modal-btn" data-action="${modalButtons[1].text}" style="
                            padding: 12px 8px;
                            border: none;
                            border-radius: 6px;
                            font-size: 13px;
                            font-weight: 600;
                            cursor: pointer;
                            background: #3498db;
                            color: white;
                            touch-action: manipulation;
                            user-select: none;
                            -webkit-tap-highlight-color: transparent;
                        ">${modalButtons[1].text}</button>
                    </div>
                    <button class="modal-btn" data-action="${modalButtons[2].text}" style="
                        padding: 12px;
                        border: none;
                        border-radius: 6px;
                        font-size: 13px;
                        font-weight: 600;
                        cursor: pointer;
                        background: #f39c12;
                        color: white;
                        touch-action: manipulation;
                        user-select: none;
                        -webkit-tap-highlight-color: transparent;
                    ">${modalButtons[2].text}</button>
                </div>
            `;
        } else {
            // Standard layout for other button counts
            modalButtons.forEach(btn => {
                buttonsHTML += `
                    <button class="modal-btn" data-action="${btn.text}" style="
                        padding: 10px 15px;
                        border: none;
                        border-radius: 6px;
                        font-size: 13px;
                        font-weight: 600;
                        cursor: pointer;
                        background: #3498db;
                        color: white;
                        touch-action: manipulation;
                        user-select: none;
                        -webkit-tap-highlight-color: transparent;
                        margin: 0 4px;
                        flex: 1;
                        max-width: 140px;
                    ">${btn.text}</button>
                `;
            });
        }
        
        modal.innerHTML = `
            <div class="modal-content" style="
                background: white;
                border-radius: 12px;
                width: 100%;
                max-width: 450px;
                max-height: 85vh;
                display: flex;
                flex-direction: column;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
                overflow: hidden;
                position: relative;
            ">
                <div class="modal-header" style="
                    padding: 20px;
                    background: #3498db;
                    color: white;
                    text-align: center;
                    flex-shrink: 0;
                ">
                    <h2 style="font-size: 18px; margin: 0;">${title}</h2>
                </div>
                
                <div class="modal-body" style="
                    flex: 1;
                    overflow-y: auto;
                    overflow-x: hidden;
                    -webkit-overflow-scrolling: touch;
                    background: white;
                    position: relative;
                    min-height: 0;
                ">
                    <style>
                        .modal-body::-webkit-scrollbar {
                            width: 12px;
                            background: rgba(0, 0, 0, 0.1);
                        }
                        .modal-body::-webkit-scrollbar-thumb {
                            background: rgba(52, 152, 219, 0.6);
                            border-radius: 6px;
                            border: 2px solid rgba(255, 255, 255, 0.1);
                        }
                        .modal-body::-webkit-scrollbar-track {
                            background: rgba(0, 0, 0, 0.05);
                        }
                    </style>
                    ${content}
                </div>
                
                <div class="modal-footer" style="
                    padding: 15px 20px;
                    background: #f8f9fa;
                    border-top: 1px solid #ddd;
                    flex-shrink: 0;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                ">
                    ${buttonsHTML}
                </div>
            </div>
        `;
        
        // Enhanced event handling
        const handleAction = (actionText) => {
            document.body.classList.remove('modal-open');
            
            const buttonConfig = modalButtons.find(b => b.text === actionText);
            if (buttonConfig) {
                if (buttonConfig.action === 'close') {
                    // Just close modal
                } else if (typeof buttonConfig.action === 'function') {
                    buttonConfig.action();
                }
            }
            modal.remove();
        };
        
        // Button event listeners with mobile optimization
        setTimeout(() => {
            const modalBtns = modal.querySelectorAll('.modal-btn');
            
            modalBtns.forEach((btn) => {
                ['click', 'touchend'].forEach(eventType => {
                    btn.addEventListener(eventType, (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleAction(btn.dataset.action);
                    }, { passive: false });
                });
                
                // Visual feedback
                btn.addEventListener('touchstart', (e) => {
                    const originalBg = btn.style.background;
                    btn.style.background = 'rgba(52, 152, 219, 0.8)';
                    btn.style.transform = 'scale(0.95)';
                    
                    setTimeout(() => {
                        btn.style.background = originalBg;
                        btn.style.transform = 'scale(1)';
                    }, 150);
                }, { passive: true });
            });
        }, 50);
        
        document.body.appendChild(modal);
    }
// END SECTION NINE
// SECTION TEN - UI State Management
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

    // Utility methods for bridge modes
    getCurrentLicenseStatus() {
        return this.licenseManager.checkLicenseStatus();
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
    // NOTE: the new license system is time-based (2-month trial), not
    // deal-based, so this no longer needs to check/increment a deal
    // counter. Kept as a hook in case a bridge mode calls it, but it
    // now does nothing license-related.
    onDealCompleted() {
        // No-op under the new time-based trial system.
    }

    closeModal() {
        const existingModal = document.querySelector('.modal-overlay');
        if (existingModal) {
            existingModal.remove();
            // Restore body scroll when modal closes
            document.body.classList.remove('modal-open');
        }
    }
// END SECTION TEN
// SECTION ELEVEN - Enhanced Modal System
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
// END SECTION ELEVEN
// SECTION TWELVE - Cleanup and Export
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
    console.log('• Check console for version: Should show "APP.JS VERSION: 2025-01-31-ENHANCED"');
}
// END SECTION TWELVE - FILE COMPLETE
