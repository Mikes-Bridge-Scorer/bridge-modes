/**
 * Bridge Modes Calculator - Clean License-Only Version
 * Mobile-first touch handling with robust license system
 */

class BridgeApp {
    constructor() {
        this.enteredCode = '';
        this.isLicensed = false;
        this.appState = 'license_entry'; // 'license_entry' or 'licensed_mode'
        this.maxCodeLength = 6;
        
        // Mobile detection
        this.isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        // Initialize license manager
        this.licenseManager = new LicenseManager();
        
        // Wake lock for screen management
        this.wakeLock = null;
        this.isWakeActive = false;
        
        this.init();
    }

    async init() {
        console.log('🎮 Initializing Bridge Modes Calculator');
        console.log('📱 Mobile device detected:', this.isMobile);
        
        // Check existing license first
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
            statusMessage.textContent = `Enter ${remaining} more digit${remaining !== 1 ? 's' : ''}`;
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
            await new Promise(resolve => setTimeout(resolve, 800)); // Simulate validation delay
            
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
        
        const display = document.getElementById('display');
        display.innerHTML = `
            <div class="title-score-row">
                <div class="mode-title">🔑 License Code</div>
                <div class="score-display">Bridge<br>Modes</div>
            </div>
            <div class="game-content">
                <div class="code-display" id="codeDisplay">_ _ _ _ _ _</div>
                <div class="status-message" id="statusMessage">${licenseStatus.message}</div>
            </div>
            <div class="current-state">Use number buttons. BACK to delete, DEAL to submit</div>
        `;
        
        this.updateButtonStates(['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'BACK']);
        this.updateLicenseDisplay();
    }

    showLicensedMode(licenseInfo) {
        this.appState = 'licensed_mode';
        const licenseType = licenseInfo.type || 'FULL';
        const isTrialMode = licenseType === 'TRIAL';
        
        let licenseText = '';
        if (isTrialMode) {
            const status = this.licenseManager.checkLicenseStatus();
            licenseText = `Trial: ${status.daysLeft || 0} days, ${status.dealsLeft || 0} deals left`;
        } else {
            licenseText = 'Full Version Activated';
        }
        
        const display = document.getElementById('display');
        display.innerHTML = `
            <div class="title-score-row">
                <div class="mode-title">Bridge Modes Calculator</div>
                <div class="score-display">NS: 0<br>EW: 0</div>
            </div>
            <div class="game-content">
                <div class="mode-selection">
                    <div class="mode-grid">
                        <div class="mode-row">
                            <span><strong>1</strong> - Kitchen Bridge</span>
                            <span><strong>2</strong> - Bonus Bridge</span>
                        </div>
                        <div class="mode-row">
                            <span><strong>3</strong> - Chicago Bridge</span>
                        </div>
                        <div class="mode-row">
                            <span><strong>4</strong> - Rubber Bridge</span>
                            <span><strong>5</strong> - Duplicate Bridge</span>
                        </div>
                    </div>
                </div>
            </div>
            <div class="current-state">Press 1-5 to select bridge scoring mode</div>
            <div class="license-status">${licenseText}</div>
        `;

        // Enable mode selection buttons and controls
        this.updateButtonStates(['1', '2', '3', '4', '5']);
        this.enableControls();
    }

    handleLicensedInput(value) {
        if (['1', '2', '3', '4', '5'].includes(value)) {
            this.selectBridgeMode(value);
        } else if (value === 'BACK') {
            // Return to mode selection from demo mode
            this.showLicensedMode({ type: this.licenseManager.getLicenseData()?.type || 'FULL' });
        } else {
            // For now, just show demo message for other buttons
            this.showMessage(`Bridge mode active - ${value} button pressed`, 'info');
        }
    }

    selectBridgeMode(mode) {
        const modeNames = {
            '1': 'Kitchen Bridge',
            '2': 'Bonus Bridge', 
            '3': 'Chicago Bridge',
            '4': 'Rubber Bridge',
            '5': 'Duplicate Bridge'
        };
        
        const modeName = modeNames[mode];
        console.log(`🎮 Selected: ${modeName}`);
        
        this.showMessage(`${modeName} selected! 🎉`, 'success');
        
        // Here you would load the specific bridge mode
        setTimeout(() => {
            this.showBridgeModeDemo(mode, modeName);
        }, 1500);
    }

    showBridgeModeDemo(mode, modeName) {
        const display = document.getElementById('display');
        
        display.innerHTML = `
            <div class="title-score-row">
                <div class="mode-title">${modeName}</div>
                <div class="score-display">NS: 0<br>EW: 0</div>
            </div>
            <div class="game-content">
                <div class="demo-content">
                    <h3>🎯 Demo Mode</h3>
                    <p>This is where ${modeName} would load.</p>
                    <div class="demo-info">
                        <p>Your bridge scoring system would handle:</p>
                        <ul>
                            <li>Contract input (level + suit + declarer)</li>
                            <li>Result tracking (made/down/overtricks)</li>
                            <li>Vulnerability management</li>
                            <li>Score calculation & history</li>
                        </ul>
                    </div>
                </div>
            </div>
            <div class="current-state">Press BACK to return to mode selection</div>
        `;

        // Example: Enable bidding buttons (1-7 would be highlighted for contract level)
        this.updateButtonStates(['1', '2', '3', '4', '5', '6', '7', '♣', '♦', '♥', '♠', 'NT', 'BACK']);
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
        switch (controlId) {
            case 'wakeControl':
                this.toggleWakeLock();
                break;
            case 'vulnControl':
                this.toggleVulnerability();
                break;
            case 'helpControl':
                this.showHelp();
                break;
            case 'quitControl':
                this.showQuit();
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
                    wakeToggle.classList.remove('active');
                    this.showMessage('Screen sleep enabled', 'info');
                } else {
                    this.wakeLock = await navigator.wakeLock.request('screen');
                    this.isWakeActive = true;
                    wakeToggle.classList.add('active');
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
        const states = ['NV', 'NS', 'EW', 'Both'];
        const current = vulnText.textContent;
        const currentIndex = states.indexOf(current);
        const nextIndex = (currentIndex + 1) % states.length;
        
        vulnText.textContent = states[nextIndex];
        this.showMessage(`Vulnerability: ${states[nextIndex]}`, 'info');
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
            statusMessage.innerHTML = `
                <div class="loading-spinner"></div>
                <div>${message}</div>
            `;
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
        
        statusMessage.innerHTML = `<div class="${messageClass}">${text}</div>`;
        
        // Auto-clear messages after delay
        if (type !== 'error') {
            setTimeout(() => {
                if (this.appState === 'license_entry') {
                    this.updateLicenseDisplay();
                }
            }, 3000);
        }
    }

    showHelp() {
        const isLicenseMode = this.appState === 'license_entry';
        const title = isLicenseMode ? '🔑 License Help' : '🃏 Bridge Modes Calculator Help';
        
        let content = '';
        if (isLicenseMode) {
            content = `
                <h4>How to Enter License Code</h4>
                <p>• Use number buttons <strong>0-9</strong> to enter digits<br>
                • <strong>BACK</strong> button removes last digit<br>
                • <strong>DEAL</strong> button submits complete code</p>
                
                <h4>📧 Need a License?</h4>
                <p><strong>Email:</strong> <a href="mailto:mike.chris.smith@gmail.com">mike.chris.smith@gmail.com</a></p>
            `;
        } else {
            const licenseStatus = this.licenseManager.checkLicenseStatus();
            let licenseSection = '';
            
            if (licenseStatus.status === 'trial') {
                licenseSection = `
                    <h4>📅 Current License Status</h4>
                    <div style="background: rgba(255, 193, 7, 0.1); padding: 12px; border-radius: 6px; margin: 10px 0; border-left: 4px solid #ffc107;">
                        <p><strong>Trial Version Active</strong></p>
                        <p>⏰ <strong>${licenseStatus.daysLeft} days remaining</strong></p>
                        <p>🃏 <strong>${licenseStatus.dealsLeft} deals remaining</strong></p>
                        <p style="margin-top: 10px; font-size: 12px;">
                            To upgrade to the full version with unlimited access, 
                            contact: <a href="mailto:mike.chris.smith@gmail.com">mike.chris.smith@gmail.com</a>
                        </p>
                    </div>
                    
                    <div style="text-align: center; margin: 15px 0;">
                        <button onclick="window.bridgeApp.enterFullLicenseFromHelp()" 
                                style="background: #28a745; color: white; border: none; padding: 10px 20px; 
                                       border-radius: 6px; font-size: 14px; cursor: pointer; 
                                       min-height: 44px; touch-action: manipulation;">
                            Enter Full License Code
                        </button>
                    </div>
                `;
            } else if (licenseStatus.status === 'full') {
                licenseSection = `
                    <h4>✅ Current License Status</h4>
                    <div style="background: rgba(40, 167, 69, 0.1); padding: 12px; border-radius: 6px; margin: 10px 0; border-left: 4px solid #28a745;">
                        <p><strong>Full Version Activated</strong></p>
                        <p>🔓 <strong>Unlimited Access</strong></p>
                    </div>
                `;
            }
            
            content = `
                ${licenseSection}
                
                <h4>🎮 Bridge Game Controls</h4>
                <p><strong>Mode Selection:</strong> Press 1-5 to choose scoring mode<br>
                <strong>Wake:</strong> Keep screen active during play<br>
                <strong>Vuln:</strong> Cycle vulnerability states</p>
                
                <h4>🃏 Available Modes</h4>
                <div style="margin: 10px 0; font-size: 13px; line-height: 1.5;">
                    <p><strong>1 - Kitchen Bridge:</strong> Simple social scoring for casual games</p>
                    <p><strong>2 - Bonus Bridge:</strong> HCP-based bonus system with extra points</p>
                    <p><strong>3 - Chicago Bridge:</strong> 4-deal vulnerability cycle format</p>
                    <p><strong>4 - Rubber Bridge:</strong> Traditional rubber scoring with honors</p>
                    <p><strong>5 - Duplicate Bridge:</strong> Tournament-style pairs scoring</p>
                </div>
                
                <h4>📞 Support</h4>
                <p>Email: <a href="mailto:mike.chris.smith@gmail.com">mike.chris.smith@gmail.com</a></p>
            `;
        }
        
        this.showModal(title, content);
    }

    // Method to enter full license from help popup
    enterFullLicenseFromHelp() {
        // Close any open modal first
        const existingModal = document.querySelector('.modal-overlay');
        if (existingModal) {
            existingModal.remove();
        }
        
        setTimeout(() => {
            this.showLicenseEntry({ message: 'Enter your full version license code' });
        }, 100);
    }

    showQuit() {
        const licenseStatus = this.licenseManager.checkLicenseStatus();
        let buttons = [];
        
        if (this.appState === 'licensed_mode') {
            buttons.push({ text: 'Return to Menu', action: () => this.showLicensedMode(licenseStatus) });
        }
        
        if (licenseStatus.status === 'trial' || licenseStatus.status === 'expired') {
            buttons.push({ text: 'Enter Full License', action: () => this.showLicenseEntry({ message: 'Enter full version license code' }) });
        }
        
        buttons.push(
            { text: 'License Info', action: () => this.showLicenseInfo() },
            { text: 'Clear License Data', action: () => this.showClearLicenseWarning() },
            { text: 'Close App', action: () => this.closeApp() },
            { text: 'Cancel', action: null }
        );
        
        this.showModal('Bridge Modes Calculator Options', 'What would you like to do?', buttons);
    }

    showLicenseInfo() {
        const license = this.licenseManager.getLicenseData();
        const status = this.licenseManager.checkLicenseStatus();
        
        let content = '';
        if (license) {
            content = `
                <h4>📄 License Information</h4>
                <p><strong>Type:</strong> ${license.type === 'FULL' ? 'Full Version' : 'Trial Version'}<br>
                <strong>Activated:</strong> ${new Date(license.activatedAt).toLocaleDateString()}<br>
                <strong>Status:</strong> ${status.message}</p>
            `;
            
            if (license.type === 'TRIAL') {
                content += `
                    <h4>⏰ Trial Status</h4>
                    <p>Days remaining: <strong>${status.daysLeft || 0}</strong><br>
                    Deals remaining: <strong>${status.dealsLeft || 0}</strong></p>
                `;
            }
        } else {
            content = '<p>No license is currently active.</p>';
        }
        
        content += '<h4>📞 Support</h4><p>Email: <a href="mailto:mike.chris.smith@gmail.com">mike.chris.smith@gmail.com</a></p>';
        
        this.showModal('📄 License Information', content);
    }

    showClearLicenseWarning() {
        const licenseStatus = this.licenseManager.checkLicenseStatus();
        const isFullLicense = licenseStatus.status === 'full';
        
        let warningContent = '';
        let warningTitle = '';
        
        if (isFullLicense) {
            warningTitle = '⚠️ Clear Full License Warning';
            warningContent = `
                <div style="background: rgba(220, 53, 69, 0.1); padding: 15px; border-radius: 8px; margin: 10px 0; border-left: 4px solid #dc3545;">
                    <h4 style="color: #dc3545; margin-bottom: 10px;">🚨 DANGER: You have a FULL LICENSE active!</h4>
                    <p style="margin: 8px 0;"><strong>If you clear your license data:</strong></p>
                    <ul style="margin: 8px 0 8px 20px; text-align: left;">
                        <li>Your <strong>PAID FULL LICENSE</strong> will be removed</li>
                        <li>You will need to <strong>re-enter your license code</strong></li>
                        <li>If you've lost your code, <strong>contact support</strong></li>
                        <li>This action <strong>CANNOT BE UNDONE</strong></li>
                    </ul>
                    <p style="margin: 8px 0; font-weight: bold; color: #dc3545;">
                        Only proceed if you're absolutely sure!
                    </p>
                </div>
                
                <h4>📞 Support Contact</h4>
                <p style="margin: 8px 0;">
                    If you've lost your license code:<br>
                    📧 <a href="mailto:mike.chris.smith@gmail.com" style="color: #007bff;">mike.chris.smith@gmail.com</a>
                </p>
            `;
        } else {
            warningTitle = '⚠️ Clear License Data';
            warningContent = `
                <div style="background: rgba(255, 193, 7, 0.1); padding: 15px; border-radius: 8px; margin: 10px 0; border-left: 4px solid #ffc107;">
                    <h4 style="color: #856404; margin-bottom: 10px;">Clear License Data</h4>
                    <p style="margin: 8px 0;">This will remove:</p>
                    <ul style="margin: 8px 0 8px 20px; text-align: left;">
                        <li>Current trial license (if any)</li>
                        <li>Used license codes history</li>
                        <li>Deal counter</li>
                    </ul>
                    <p style="margin: 8px 0;">
                        You will need to enter a new license code to continue using the app.
                    </p>
                </div>
            `;
        }
        
        const buttons = [
            { 
                text: isFullLicense ? 'YES - Clear Full License' : 'YES - Clear Data', 
                action: () => this.confirmClearLicense(),
                style: 'background: #dc3545 !important;'
            },
            { 
                text: 'Cancel - Keep License', 
                action: 'close',
                style: 'background: #28a745 !important;'
            }
        ];
        
        this.showModal(warningTitle, warningContent, buttons);
    }

    confirmClearLicense() {
        // Final confirmation for full licenses
        const licenseStatus = this.licenseManager.checkLicenseStatus();
        
        if (licenseStatus.status === 'full') {
            const confirmed = confirm(
                '🚨 FINAL WARNING 🚨\n\n' +
                'You are about to delete your PAID FULL LICENSE!\n\n' +
                'This will remove your license permanently from this device.\n\n' +
                'Click OK only if you are absolutely certain.\n' +
                'Click Cancel to keep your license safe.'
            );
            
            if (!confirmed) {
                return;
            }
        }
        
        // Clear all license data
        this.licenseManager.clearLicense();
        localStorage.removeItem('bridgeAppUsedCodes'); // Also clear used codes for complete reset
        
        // Show confirmation and reload
        alert('License data cleared successfully.\n\nThe app will now restart and ask for a new license code.');
        
        setTimeout(() => {
            location.reload();
        }, 500);
    }

    showModal(title, content, buttons = null) {
        // Create modal overlay
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        
        const defaultButtons = [{ text: 'Close', action: null }];
        const modalButtons = buttons || defaultButtons;
        
        let buttonsHTML = '';
        modalButtons.forEach(btn => {
            const closeClass = (btn.text === 'Close' || btn.text === 'Cancel') ? ' close' : '';
            buttonsHTML += `<button class="modal-btn${closeClass}" data-action="${btn.text}">${btn.text}</button>`;
        });
        
        modal.innerHTML = `
            <div class="modal-content">
                <h3>${title}</h3>
                <div class="modal-body">${content}</div>
                <div class="modal-buttons">${buttonsHTML}</div>
            </div>
        `;
        
        // Event handling
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
                return;
            }
            
            const btn = e.target.closest('.modal-btn');
            if (btn) {
                const buttonConfig = modalButtons.find(b => b.text === btn.dataset.action);
                if (buttonConfig && buttonConfig.action) {
                    buttonConfig.action();
                }
                modal.remove();
            }
        });
        
        // Mobile touch handling
        if (this.isMobile) {
            modal.addEventListener('touchend', (e) => {
                const btn = e.target.closest('.modal-btn');
                if (btn) {
                    e.preventDefault();
                    const buttonConfig = modalButtons.find(b => b.text === btn.dataset.action);
                    if (buttonConfig && buttonConfig.action) {
                        buttonConfig.action();
                    }
                    modal.remove();
                }
            }, { passive: false });
        }
        
        document.body.appendChild(modal);
    }
}

/**
 * License Manager - Handles license validation and storage
 */
class LicenseManager {
    constructor() {
        this.storageKey = 'bridgeAppLicense';
        this.usedCodesKey = 'bridgeAppUsedCodes';
        this.trialDays = 14;
        this.trialDeals = 50;
        this.checksumTarget = 37;
        this.trialPrefixes = ['111', '222', '333', '444', '555', '666', '777', '888', '999'];
    }

    checkLicenseStatus() {
        const license = this.getLicenseData();
        
        if (!license) {
            return { 
                status: 'unlicensed', 
                needsCode: true,
                message: 'Enter license code to continue'
            };
        }

        // Validate license integrity
        if (!this.validateLicenseIntegrity(license)) {
            console.warn('🚨 License integrity check failed');
            this.clearLicense();
            return { 
                status: 'invalid', 
                needsCode: true,
                message: 'License validation failed. Please re-enter code.'
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
            message: 'Invalid license detected. Please re-enter code.'
        };
    }

    validateLicenseIntegrity(license) {
        // Check required fields
        if (!license.code || !license.type || !license.activatedAt) {
            return false;
        }

        // Check if the code is marked as used
        if (!this.isCodeUsed(license.code)) {
            console.warn('🚨 License code not found in used codes list');
            return false;
        }

        // Validate code format and checksum
        const validation = this.validateCodeSync(license.code);
        if (!validation.valid || validation.type !== license.type) {
            return false;
        }

        return true;
    }

    validateCodeSync(code) {
        if (!code || code.length !== 6 || !/^\d{6}$/.test(code)) {
            return { valid: false };
        }

        const prefix = code.substring(0, 3);

        if (this.trialPrefixes.includes(prefix)) {
            return { valid: true, type: 'TRIAL' };
        }

        const digitSum = code.split('').reduce((sum, digit) => sum + parseInt(digit), 0);
        if (digitSum === this.checksumTarget) {
            return { valid: true, type: 'FULL' };
        }

        return { valid: false };
    }

    generateDeviceFingerprint() {
        // Simple device fingerprint for additional security
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        ctx.textBaseline = 'top';
        ctx.font = '14px Arial';
        ctx.fillText('Device fingerprint', 2, 2);
        
        return btoa(JSON.stringify({
            screen: `${screen.width}x${screen.height}`,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            canvas: canvas.toDataURL().slice(0, 100),
            userAgent: navigator.userAgent.slice(0, 50)
        }));
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

    async validateCode(code) {
        if (!code || code.length !== 6 || !/^\d{6}$/.test(code)) {
            return { valid: false, message: 'License code must be exactly 6 digits' };
        }

        const prefix = code.substring(0, 3);

        // Check trial codes (one-time use per device)
        if (this.trialPrefixes.includes(prefix)) {
            // STRICT: Check if ANY trial code was already used on this device
            const usedCodes = this.getUsedCodes();
            const hasUsedTrial = usedCodes.some(usedCode => {
                const usedPrefix = usedCode.substring(0, 3);
                return this.trialPrefixes.includes(usedPrefix);
            });
            
            if (hasUsedTrial) {
                return { 
                    valid: false, 
                    message: 'Trial already used on this device. Only one trial per device allowed.' 
                };
            }
            
            // Check if this specific trial code was already used
            if (this.isCodeUsed(code)) {
                return { 
                    valid: false, 
                    message: 'This trial code has already been used' 
                };
            }
            
            return { 
                valid: true, 
                type: 'TRIAL', 
                message: '🎉 Trial activated! 14 days or 50 deals remaining.',
                markAsUsed: true // Flag to mark as used
            };
        }

        // Check full license codes
        const digitSum = code.split('').reduce((sum, digit) => sum + parseInt(digit), 0);
        if (digitSum !== this.checksumTarget) {
            return { 
                valid: false, 
                message: 'Invalid license code. Please check and try again.' 
            };
        }

        // Check if already used
        if (this.isCodeUsed(code)) {
            return { 
                valid: false, 
                message: 'License code already used on another device' 
            };
        }

        return { 
            valid: true, 
            type: 'FULL', 
            message: '🎉 Full version activated! Unlimited bridge scoring.',
            markAsUsed: true // Flag to mark as used
        };
    }

    async activateLicense(code) {
        const validation = await this.validateCode(code);
        
        if (!validation.valid) {
            return { success: false, message: validation.message };
        }

        // CRITICAL: Only proceed if validation was successful AND requires marking as used
        if (!validation.markAsUsed) {
            return { success: false, message: 'License validation error' };
        }

        // Check for existing license conflicts
        const existingLicense = this.getLicenseData();
        if (existingLicense) {
            // If trying to activate trial but already have full license
            if (validation.type === 'TRIAL' && existingLicense.type === 'FULL') {
                return { 
                    success: false, 
                    message: 'Full license already active. Trial codes cannot be used.' 
                };
            }
            
            // If trying to use same type of license again
            if (validation.type === existingLicense.type) {
                if (validation.type === 'TRIAL') {
                    return { 
                        success: false, 
                        message: 'Trial already used on this device' 
                    };
                } else {
                    return { 
                        success: false, 
                        message: 'Full license already active' 
                    };
                }
            }
        }

        // Mark code as used BEFORE storing license (prevent race conditions)
        this.markCodeAsUsed(code);

        const licenseData = {
            code: code,
            type: validation.type,
            activatedAt: Date.now(),
            activatedDate: new Date().toISOString(),
            deviceFingerprint: this.generateDeviceFingerprint()
        };

        localStorage.setItem(this.storageKey, JSON.stringify(licenseData));
        
        // Reset deals counter for new license
        localStorage.setItem('bridgeAppDealsPlayed', '0');

        console.log(`🔒 License activated: ${validation.type} (Code: ${code})`);

        return { 
            success: true, 
            message: validation.message,
            type: validation.type
        };
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
        console.log('🧹 License cleared - used codes preserved for security');
    }

    incrementDealsPlayed() {
        const current = parseInt(localStorage.getItem('bridgeAppDealsPlayed') || '0');
        localStorage.setItem('bridgeAppDealsPlayed', (current + 1).toString());
    }

    // Static helper methods for development
    static generateTrialCode() {
        const prefixes = ['111', '222', '333', '444', '555', '666', '777', '888', '999'];
        const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
        const lastThree = Array(3).fill(0).map(() => Math.floor(Math.random() * 10)).join('');
        return prefix + lastThree;
    }

    static generateFullCode() {
        // Generate a valid full license code that sums to 37
        const baseDigits = [7, 3, 0, 9, 9, 9]; // Sum = 37
        // Shuffle for randomness
        for (let i = baseDigits.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [baseDigits[i], baseDigits[j]] = [baseDigits[j], baseDigits[i]];
        }
        return baseDigits.join('');
    }

    static checksumCode(code) {
        return code.split('').reduce((sum, digit) => sum + parseInt(digit), 0);
    }
}

// Development utilities
if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
    window.generateTestCodes = function() {
        console.log('\n🧪 Test License Codes:');
        console.log('\nTrial codes (any checksum):');
        ['111000', '222111', '333222', '444333', '555444'].forEach(code => {
            const sum = LicenseManager.checksumCode(code);
            console.log(`${code} (sum: ${sum}) - TRIAL`);
        });
        
        console.log('\nFull license codes (sum = 37):');
        ['730999', '775558', '109999', '469999', '289999'].forEach(code => {
            const sum = LicenseManager.checksumCode(code);
            console.log(`${code} (sum: ${sum}) - FULL`);
        });
    };
    
    window.clearTestData = function() {
        localStorage.removeItem('bridgeAppLicense');
        localStorage.removeItem('bridgeAppDealsPlayed');
        localStorage.removeItem('bridgeAppUsedCodes');
        console.log('🧹 All license data cleared for testing');
        location.reload();
    };
    
    window.showLicenseDebug = function() {
        console.log('\n🔍 License Debug Info:');
        console.log('License:', localStorage.getItem('bridgeAppLicense'));
        console.log('Used Codes:', localStorage.getItem('bridgeAppUsedCodes'));
        console.log('Deals Played:', localStorage.getItem('bridgeAppDealsPlayed'));
    };
    
    console.log('🛠️ Development mode detected');
    console.log('• generateTestCodes() - Show sample codes');
    console.log('• clearTestData() - Reset all license data');
    console.log('• showLicenseDebug() - Show current license state');
    window.generateTestCodes();
}