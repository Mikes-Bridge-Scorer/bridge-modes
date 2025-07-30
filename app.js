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
        console.log(`🎮 Loading: ${modeName}`);
        
        try {
            this.showMessage(`Loading ${modeName}...`, 'info');
            
            const ModuleClass = await this.loadBridgeModule(mode);
            
            // Create new bridge mode instance
            this.currentBridgeMode = new ModuleClass(this);
            this.appState = 'bridge_mode';
            
            // Initialize the mode display
            this.currentBridgeMode.updateDisplay();
            
            this.showMessage(`${modeName} loaded! 🎉`, 'success');
            
        } catch (error) {
            console.error(`Failed to load ${modeName}:`, error);
            this.showMessage(`Failed to load ${modeName}. Please try again.`, 'error');
            
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
            licenseText = `Trial: ${status.daysLeft || 0} days, ${status.dealsLeft || 0} deals left`;
        } else {
            licenseText = 'Full Version Activated';
        }
        
        const display = document.getElementById('display');
        if (!display) {
            console.error('Display element not found');
            return;
        }
        
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
    
    // ENHANCED HELP METHOD
    showHelp() {
        // If in bridge mode, let the bridge mode handle help
        if (this.currentBridgeMode && typeof this.currentBridgeMode.showHelp === 'function') {
            this.currentBridgeMode.showHelp();
            return;
        }
        
        // Default help for main menu
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
                            To upgrade to the full version, contact: 
                            <a href="mailto:mike.chris.smith@gmail.com">mike.chris.smith@gmail.com</a>
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
                    <p><strong>1 - Kitchen Bridge:</strong> Simple social scoring</p>
                    <p><strong>2 - Bonus Bridge:</strong> HCP-based bonus system</p>
                    <p><strong>3 - Chicago Bridge:</strong> 4-deal vulnerability cycle</p>
                    <p><strong>4 - Rubber Bridge:</strong> Traditional rubber scoring</p>
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
        this.closeModal();
        
        setTimeout(() => {
            this.showLicenseEntry({ message: 'Enter your full version license code' });
        }, 100);
    }

    // ENHANCED QUIT METHOD WITH LICENSE MANAGEMENT
    showQuit() {
        // If in bridge mode, let the bridge mode handle quit
        if (this.currentBridgeMode && typeof this.currentBridgeMode.showQuit === 'function') {
            this.currentBridgeMode.showQuit();
            return;
        }
        
        // Enhanced quit menu with license management for all states
        const licenseStatus = this.licenseManager.checkLicenseStatus();
        let buttons = [];
        
        // Core game options (context-aware)
        if (this.appState === 'bridge_mode') {
            buttons.push({ 
                text: 'Continue Playing', 
                action: () => this.closeModal(),
                class: 'modal-button continue-btn'
            });
            buttons.push({ 
                text: 'Return to Main Menu', 
                action: () => this.showLicensedMode(licenseStatus), 
                class: 'modal-button menu-btn'
            });
        } else if (this.appState === 'licensed_mode') {
            buttons.push({ 
                text: 'Continue', 
                action: () => this.closeModal(),
                class: 'modal-button continue-btn'
            });
            buttons.push({ 
                text: 'Show Help', 
                action: () => { this.closeModal(); this.showHelp(); },
                class: 'modal-button help-btn'
            });
        }
        
        // License management options (always available)
        if (licenseStatus.status === 'trial' || licenseStatus.status === 'expired') {
            buttons.push({ 
                text: '🔓 Enter Full License', 
                action: () => this.enterFullLicenseFromQuit(),
                class: 'modal-button upgrade-btn'
            });
        }
        
        // License information (always available)
        buttons.push({ 
            text: '📄 License Info', 
            action: () => this.showLicenseInfoFromQuit(),
            class: 'modal-button info-btn'
        });
        
        // Clear data option (always available - important for troubleshooting)
        buttons.push({ 
            text: '🗑️ Clear License Data', 
            action: () => this.showClearLicenseWarning(),
            class: 'modal-button clear-btn'
        });
        
        // App management
        buttons.push({ 
            text: 'Close App', 
            action: () => this.closeApp(),
            class: 'modal-button close-app-btn'
        });
        
        // Cancel (always last)
        buttons.push({ 
            text: 'Cancel', 
            action: 'close', 
            class: 'modal-button cancel-btn'
        });
        
        // Create content based on current state
        let title = 'Bridge Modes Calculator Options';
        let content = `
            <div style="text-align: center; margin-bottom: 15px;">
                <p style="font-size: 14px; color: #666;">Choose an option:</p>
            </div>
        `;
        
        // Add license status info
        if (licenseStatus.status === 'trial') {
            content += `
                <div style="background: rgba(255, 193, 7, 0.1); padding: 12px; border-radius: 8px; margin: 10px 0; border-left: 4px solid #ffc107;">
                    <h4 style="color: #856404; margin-bottom: 5px;">📅 Current License Status</h4>
                    <p style="font-size: 12px; margin: 0; color: #856404;">
                        <strong>Trial Version:</strong> ${licenseStatus.daysLeft} days, ${licenseStatus.dealsLeft} deals remaining
                    </p>
                </div>
            `;
        } else if (licenseStatus.status === 'full') {
            content += `
                <div style="background: rgba(40, 167, 69, 0.1); padding: 12px; border-radius: 8px; margin: 10px 0; border-left: 4px solid #28a745;">
                    <h4 style="color: #155724; margin-bottom: 5px;">✅ Current License Status</h4>
                    <p style="font-size: 12px; margin: 0; color: #155724;">
                        <strong>Full Version Activated</strong> - Unlimited Access
                    </p>
                </div>
            `;
        }
        
        this.showModal(title, content, buttons);
        console.log('📱 Enhanced quit modal shown with license management');
    }

    // NEW METHODS FOR ENHANCED QUIT FUNCTIONALITY
    enterFullLicenseFromQuit() {
        console.log('🔓 Entering full license from quit menu');
        this.closeModal();
        setTimeout(() => {
            this.showLicenseEntry({ 
                message: 'Enter your full version license code to upgrade from trial' 
            });
        }, 200);
    }

    showLicenseInfoFromQuit() {
        console.log('📄 Showing license info from quit menu');
        this.closeModal();
        setTimeout(() => {
            this.showEnhancedLicenseInfo();
        }, 200);
    }

    showEnhancedLicenseInfo() {
        const license = this.licenseManager.getLicenseData();
        const status = this.licenseManager.checkLicenseStatus();
        
        let content = '';
        let buttons = [];
        
        if (license) {
            const isTrialMode = license.type === 'TRIAL';
            const licenseTypeText = isTrialMode ? 'Trial Version' : 'Full Version';
            const activatedDate = new Date(license.activatedAt).toLocaleDateString();
            
            content = `
                <div style="text-align: center; margin-bottom: 20px;">
                    <div style="background: ${isTrialMode ? 'rgba(255, 193, 7, 0.1)' : 'rgba(40, 167, 69, 0.1)'}; 
                               padding: 15px; border-radius: 10px; 
                               border-left: 4px solid ${isTrialMode ? '#ffc107' : '#28a745'};">
                        <h4 style="color: ${isTrialMode ? '#856404' : '#155724'}; margin-bottom: 10px;">
                            ${isTrialMode ? '📅' : '✅'} License Information
                        </h4>
                        <p><strong>Type:</strong> ${licenseTypeText}</p>
                        <p><strong>Activated:</strong> ${activatedDate}</p>
                        <p><strong>Status:</strong> ${status.message}</p>
                    </div>
                </div>
            `;
            
            if (isTrialMode) {
                content += `
                    <div style="background: rgba(52, 152, 219, 0.1); padding: 15px; border-radius: 10px; margin: 15px 0; border-left: 4px solid #3498db;">
                        <h4 style="color: #2c3e50; margin-bottom: 10px;">⏰ Trial Details</h4>
                        <p>Days remaining: <strong>${status.daysLeft || 0}</strong></p>
                        <p>Deals remaining: <strong>${status.dealsLeft || 0}</strong></p>
                        <p style="margin-top: 10px; font-size: 12px; color: #666;">
                            Upgrade to the full version for unlimited access to all bridge modes.
                        </p>
                    </div>
                `;
                
                // Add upgrade button for trial users
                buttons.push({ 
                    text: '🔓 Upgrade to Full Version', 
                    action: () => this.enterFullLicenseFromQuit(),
                    class: 'modal-button upgrade-btn'
                });
            }
        } else {
            content = `
                <div style="text-align: center; padding: 20px;">
                    <p style="color: #dc3545; font-weight: bold;">⚠️ No license is currently active</p>
                    <p style="margin-top: 10px; color: #666;">You need to enter a license code to use Bridge Modes Calculator.</p>
                </div>
            `;
        }
        
        // Support information (always shown)
        content += `
            <div style="background: rgba(52, 73, 94, 0.1); padding: 15px; border-radius: 10px; margin: 15px 0;">
                <h4 style="color: #2c3e50; margin-bottom: 10px;">📞 Support & Contact</h4>
                <p style="margin: 5px 0;">
                    <strong>Email:</strong> 
                    <a href="mailto:mike.chris.smith@gmail.com" style="color: #3498db; text-decoration: none;">
                        mike.chris.smith@gmail.com
                    </a>
                </p>
                <p style="font-size: 12px; color: #666; margin-top: 8px;">
                    • License codes and technical support<br>
                    • Feature requests and feedback<br>
                    • Lost license code recovery
                </p>
            </div>
        `;
        
        // Standard buttons
        buttons.push({ 
            text: 'Back to Options', 
            action: () => this.showQuit(),
            class: 'modal-button back-btn'
        });
        
        buttons.push({ 
            text: 'Close', 
            action: 'close',
            class: 'modal-button close-btn'
        });
        
        this.showModal('📄 License Information', content, buttons);
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
                action: () => this.confirmClearLicense()
            },
            { 
                text: 'Cancel - Keep License', 
                action: 'close'
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
        this.licenseManager.clearAllLicenseData();
        
        // Show confirmation and reload
        alert('License data cleared successfully.\n\nThe app will now restart and ask for a new license code.');
        
        setTimeout(() => {
            location.reload();
        }, 500);
    }

    closeModal() {
        const existingModal = document.querySelector('.modal-overlay');
        if (existingModal) {
            existingModal.remove();
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

    closeApp() {
        if (window.close) {
            window.close();
        } else {
            // For PWA/mobile, show instructions
            alert('To close this app:\n\n• On mobile: Use your device\'s home button or recent apps\n• On desktop: Close this browser tab');
        }
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
                if (buttonConfig && buttonConfig.action && buttonConfig.action !== 'close') {
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
                    if (buttonConfig && buttonConfig.action && buttonConfig.action !== 'close') {
                        buttonConfig.action();
                    }
                    modal.remove();
                }
            }, { passive: false });
        }
        
        document.body.appendChild(modal);
    }

    // Deal completion callback (called by bridge modes)
    onDealCompleted() {
        const result = this.licenseManager.incrementDealsPlayed();
        
        if (result.trialExpired) {
            this.showMessage('Trial expired! Enter full version code.', 'error');
            setTimeout(() => {
                this.showLicenseEntry(result.licenseStatus);
            }, 2000);
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
        
        // Remove event listeners
        document.removeEventListener('click', this.handleClick);
        document.removeEventListener('touchend', this.handleClick);
        document.removeEventListener('keydown', this.handleKeyboard);
    }
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
    
    window.bridgeAppDevTools = {
        clearCache: window.forceClearCache,
        
        // App-specific debug functions
        getAppState: function() {
            return window.bridgeApp ? window.bridgeApp.getAppState() : null;
        },
        
        getLicenseStatus: function() {
            return window.bridgeApp ? window.bridgeApp.getCurrentLicenseStatus() : null;
        },
        
        getDealsStats: function() {
            return window.bridgeApp ? window.bridgeApp.getDealsStats() : null;
        },
        
        // Quick restart
        restart: function() {
            if (window.bridgeApp) {
                window.bridgeApp.cleanup();
            }
            location.reload();
        }
    };
    
    console.log('🛠️ Bridge App Development Tools loaded');
    console.log('• bridgeAppDevTools.clearCache() - Clear cache and reload');
    console.log('• bridgeAppDevTools.getAppState() - Get current app state');
    console.log('• bridgeAppDevTools.getLicenseStatus() - Get license status');
    console.log('• bridgeAppDevTools.restart() - Clean restart app');
    console.log('• LicenseDevTools.* - License-specific tools (from license.js)');
}

// Make app globally accessible for development
if (typeof window !== 'undefined') {
    window.BridgeApp = BridgeApp;
}/**
 * Bridge Modes Calculator - Main Application Controller
 * Mobile-first touch handling with modular architecture
 * License logic extracted to license.js for better organization
 */

class BridgeApp {
    constructor() {
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
            throw new Error(`Unknown module ID: ${moduleId}`);
        }

        try {
            console.log(`📦 Loading ${module.name} from ${module.file}...`);
            
            // Force bypass cache with version timestamp
            const version = new Date().getTime();
            const scriptUrl = `${module.file}?v=${version}&bust=${Math.random()}`;
            
            console.log(`🔄 Loading script: ${scriptUrl}`);
            
            // Remove any existing script for this module first
            const existingScript = document.querySelector(`script[src*="${module.file}"]`);
            if (existingScript) {
                existingScript.remove();
                console.log(`🗑️ Removed existing script for ${module.name}`);
            }
            
            await this.loadScript(scriptUrl);
            this.loadedModules.set(module.file, true);

            // Verify the class is available
            const ModuleClass = window[module.class];
            if (!ModuleClass) {
                throw new Error(`Module class ${module.class} not found after loading ${scriptUrl}`);
            }

            console.log(`✅ ${module.name} loaded successfully with class:`, ModuleClass.name);
            return ModuleClass;

        } catch (error) {
            console.error(`❌ Failed to load ${module.name}:`, error);
            console.error(`❌ Script URL attempted: ${module.file}`);
            console.error(`❌ Available window classes:`, Object.keys(window).filter(k => k.includes('Bridge')));
            
            // Show fallback message if module fails to load
            if (moduleId === '1') {
                console.log('🔄 Using embedded Kitchen Bridge fallback');
                this.showMessage(`Failed to load full Kitchen Bridge. Using demo mode.`, 'error');
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
            script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
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

    handleLicenseInput(value)