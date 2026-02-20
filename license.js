// Add this IMMEDIATELY at the top of your license.js file, before any other code

// SECURITY: Hide console logs in production to prevent license code exposure
(function() {
    const isProduction = location.hostname === 'mikes-bridge-scorer.github.io';
    
    if (isProduction) {
        // Disable console logging in production
        const originalLog = console.log;
        const originalWarn = console.warn;
        const originalError = console.error;
        const originalInfo = console.info;
        
        console.log = function() {};
        console.warn = function() {};
        console.info = function() {};
        // Keep error logging for critical issues
        console.error = originalError;
        
        // Store original functions for internal use if needed
        window._devConsole = {
            log: originalLog,
            warn: originalWarn,
            error: originalError,
            info: originalInfo
        };
    }
})();

// Your existing license.js code goes here unchanged
// The console.log statements will now be hidden in production

/**
 * License Manager - Handles license validation and storage
 * Extracted from app.js for better code organization
 */

class LicenseManager {
    constructor() {
        this.storageKey = 'bridgeAppLicense';
        this.usedCodesKey = 'bridgeAppUsedCodes';
        this.trialDays = 14;
        this.trialDeals = 50;
        this.checksumAnnual = 37;     // 12-month licence
        this.checksumLifetime = 47;   // Lifetime licence
        this.trialPrefixes = ['111', '222', '333', '444', '555', '666', '777', '888', '999'];
        this.annualDays = 365;        // 12-month licence duration
        this.expiryWarningDays = 30;  // Warn this many days before expiry
        this.contactEmail = 'mike.calpe@gmail.com';
        
        console.log('🔐 License Manager initialized');
    }

    /**
     * Check the current license status
     * @returns {Object} Status object with license information
     */
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

        if (license.type === 'LIFETIME') {
            return { 
                status: 'lifetime', 
                needsCode: false,
                message: 'Lifetime licence active'
            };
        }

        if (license.type === 'ANNUAL') {
            return this.checkAnnualExpiry(license);
        }

        if (license.type === 'TRIAL') {
            return this.checkTrialExpiry(license);
        }

        // Legacy: old 'FULL' licences treated as LIFETIME
        if (license.type === 'FULL') {
            return { 
                status: 'lifetime', 
                needsCode: false,
                message: 'Lifetime licence active'
            };
        }

        return { 
            status: 'invalid', 
            needsCode: true,
            message: 'Invalid licence detected. Please re-enter code.'
        };
    }

    /**
     * Validate license data integrity
     * @param {Object} license License data object
     * @returns {boolean} True if license is valid
     */
    validateLicenseIntegrity(license) {
        // Check required fields
        if (!license.code || !license.type || !license.activatedAt) {
            console.warn('🚨 License missing required fields');
            return false;
        }

        // Check if the code is marked as used
        if (!this.isCodeUsed(license.code)) {
            console.warn('🚨 License code not found in used codes list');
            return false;
        }

        // Validate code format and checksum
        const validation = this.validateCodeSync(license.code);
        // Allow legacy FULL type to map to LIFETIME
        const typeMatch = validation.type === license.type ||
                          (license.type === 'FULL' && validation.type === 'LIFETIME');
        if (!validation.valid || !typeMatch) {
            console.warn('🚨 License code validation failed');
            return false;
        }

        return true;
    }

    /**
     * Synchronously validate a license code format and type
     * @param {string} code License code to validate
     * @returns {Object} Validation result
     */
    validateCodeSync(code) {
        if (!code || code.length !== 6 || !/^\d{6}$/.test(code)) {
            return { valid: false };
        }

        const prefix = code.substring(0, 3);

        // Check if it's a trial code
        if (this.trialPrefixes.includes(prefix)) {
            return { valid: true, type: 'TRIAL' };
        }

        // Check digit sum for annual (37) or lifetime (47) licence
        const digitSum = code.split('').reduce((sum, digit) => sum + parseInt(digit), 0);
        if (digitSum === this.checksumAnnual) {
            return { valid: true, type: 'ANNUAL' };
        }
        if (digitSum === this.checksumLifetime) {
            return { valid: true, type: 'LIFETIME' };
        }

        return { valid: false };
    }

    /**
     * Generate a simple device fingerprint for security
     * @returns {string} Base64 encoded fingerprint
     */
    generateDeviceFingerprint() {
        try {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            ctx.textBaseline = 'top';
            ctx.font = '14px Arial';
            ctx.fillText('Device fingerprint', 2, 2);
            
            return btoa(JSON.stringify({
                screen: `${screen.width}x${screen.height}`,
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                canvas: canvas.toDataURL().slice(0, 100),
                userAgent: navigator.userAgent.slice(0, 50),
                timestamp: Date.now()
            }));
        } catch (error) {
            console.warn('Could not generate device fingerprint:', error);
            return btoa(JSON.stringify({
                fallback: true,
                timestamp: Date.now(),
                random: Math.random().toString(36)
            }));
        }
    }

    /**
     * Check if trial license has expired
     * @param {Object} license Trial license data
     * @returns {Object} Trial status information
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
                message: 'Trial expired - Enter full version code',
                daysLeft: 0,
                dealsLeft: 0
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
     * Validate a license code (async for future server-side validation)
     * @param {string} code License code to validate
     * @returns {Promise<Object>} Validation result
     */
    async validateCode(code) {
        if (!code || code.length !== 6 || !/^\d{6}$/.test(code)) {
            return { valid: false, message: 'License code must be exactly 6 digits' };
        }

        const prefix = code.substring(0, 3);

        // Check trial codes (one-time use per device)
        if (this.trialPrefixes.includes(prefix)) {
            return this.validateTrialCode(code);
        }

        // Check annual (sum=37) or lifetime (sum=47) codes
        return this.validateFullCode(code);
    }

    /**
     * Validate a trial license code
     * @param {string} code Trial code to validate
     * @returns {Object} Validation result
     */
    validateTrialCode(code) {
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
            markAsUsed: true
        };
    }

    /**
     * Validate an annual (sum=37) or lifetime (sum=47) licence code
     * @param {string} code Licence code to validate
     * @returns {Object} Validation result
     */
    validateFullCode(code) {
        const digitSum = code.split('').reduce((sum, digit) => sum + parseInt(digit), 0);
        
        if (digitSum === this.checksumLifetime) {
            // Lifetime licence - always valid, can reuse (replaces expired annual)
            return { 
                valid: true, 
                type: 'LIFETIME', 
                message: '🎉 Lifetime licence activated! Unlimited bridge scoring forever.',
                markAsUsed: true
            };
        }

        if (digitSum === this.checksumAnnual) {
            // Annual licence - check if current licence is still active annual
            // (don't allow a new annual if one is still valid - must use lifetime to upgrade)
            const existing = this.getLicenseData();
            if (existing && existing.type === 'ANNUAL') {
                const now = Date.now();
                const expiryDate = existing.activatedAt + (this.annualDays * 24 * 60 * 60 * 1000);
                if (now < expiryDate) {
                    return {
                        valid: false,
                        message: 'Annual licence still active. Use a lifetime code (sum=47) to upgrade.'
                    };
                }
                // Annual has expired - allow new annual code
            }

            // Check if this specific code was already used (prevent sharing)
            if (this.isCodeUsed(code)) {
                return { 
                    valid: false, 
                    message: 'This licence code has already been used on another device.' 
                };
            }

            return { 
                valid: true, 
                type: 'ANNUAL', 
                message: '🎉 12-month licence activated! Enjoy a full year of bridge scoring.',
                markAsUsed: true
            };
        }

        return { 
            valid: false, 
            message: 'Invalid licence code. Please check and try again.' 
        };
    }

    /**
     * Check annual licence expiry and return status with warning if approaching
     * @param {Object} license Annual licence data
     * @returns {Object} Licence status
     */
    checkAnnualExpiry(license) {
        const now = Date.now();
        const expiryDate = license.activatedAt + (this.annualDays * 24 * 60 * 60 * 1000);
        const msLeft = expiryDate - now;
        const daysLeft = Math.max(0, Math.floor(msLeft / (1000 * 60 * 60 * 24)));
        
        if (daysLeft <= 0) {
            return {
                status: 'expired',
                needsCode: true,
                message: 'Your 12-month licence has expired. Please enter a new licence code.',
                daysLeft: 0
            };
        }

        if (daysLeft <= this.expiryWarningDays) {
            return {
                status: 'annual',
                needsCode: false,
                daysLeft,
                warning: true,
                message: `⚠️ Licence expires in ${daysLeft} day${daysLeft !== 1 ? 's' : ''}. ` +
                         `Contact ${this.contactEmail} to renew.`
            };
        }

        const expiryDateStr = new Date(expiryDate).toLocaleDateString('en-GB', {
            day: 'numeric', month: 'long', year: 'numeric'
        });
        return {
            status: 'annual',
            needsCode: false,
            daysLeft,
            warning: false,
            message: `Annual licence active. Expires ${expiryDateStr}.`
        };
    }

    /**
     * Activate a license with the given code
     * @param {string} code License code to activate
     * @returns {Promise<Object>} Activation result
     */
    async activateLicense(code) {
        const validation = await this.validateCode(code);
        
        if (!validation.valid) {
            return { success: false, message: validation.message };
        }

        // Only proceed if validation was successful AND requires marking as used
        if (!validation.markAsUsed) {
            return { success: false, message: 'License validation error' };
        }

        // Check for existing license conflicts
        const existingLicense = this.getLicenseData();
        if (existingLicense) {
            const conflictResult = this.checkLicenseConflicts(existingLicense, validation);
            if (!conflictResult.success) {
                return conflictResult;
            }
        }

        // Mark code as used BEFORE storing license (prevent race conditions)
        this.markCodeAsUsed(code);

        const licenseData = {
            code: code,
            type: validation.type,
            activatedAt: Date.now(),
            activatedDate: new Date().toISOString(),
            deviceFingerprint: this.generateDeviceFingerprint(),
            version: '1.0'
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

    /**
     * Check for license activation conflicts
     * @param {Object} existingLicense Current license data
     * @param {Object} validation New license validation result
     * @returns {Object} Conflict check result
     */
    checkLicenseConflicts(existingLicense, validation) {
        const existingType = existingLicense.type;
        const newType = validation.type;

        // Cannot downgrade from lifetime to anything lesser
        if (existingType === 'LIFETIME' || existingType === 'FULL') {
            if (newType === 'TRIAL') {
                return { success: false, message: 'Lifetime licence already active. Trial codes cannot be used.' };
            }
            if (newType === 'ANNUAL') {
                return { success: false, message: 'Lifetime licence already active. Annual codes cannot be used.' };
            }
            if (newType === 'LIFETIME') {
                return { success: false, message: 'Lifetime licence already active.' };
            }
        }

        // Cannot activate trial if annual licence is active
        if (existingType === 'ANNUAL' && newType === 'TRIAL') {
            return { success: false, message: 'Annual licence already active. Trial codes cannot be used.' };
        }

        // Cannot activate duplicate trial
        if (existingType === 'TRIAL' && newType === 'TRIAL') {
            return { success: false, message: 'Trial already used on this device.' };
        }

        return { success: true };
    }

    /**
     * Check if a code has been used
     * @param {string} code License code to check
     * @returns {boolean} True if code has been used
     */
    isCodeUsed(code) {
        const usedCodes = this.getUsedCodes();
        return usedCodes.includes(code);
    }

    /**
     * Mark a code as used
     * @param {string} code License code to mark as used
     */
    markCodeAsUsed(code) {
        const usedCodes = this.getUsedCodes();
        if (!usedCodes.includes(code)) {
            usedCodes.push(code);
            localStorage.setItem(this.usedCodesKey, JSON.stringify(usedCodes));
            console.log(`🔒 Code marked as used: ${code}`);
        }
    }

    /**
     * Get list of used codes
     * @returns {Array} Array of used license codes
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
     * Get current license data
     * @returns {Object|null} License data or null if none exists
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
     * Clear license data (preserves used codes for security)
     */
    clearLicense() {
        localStorage.removeItem(this.storageKey);
        localStorage.removeItem('bridgeAppDealsPlayed');
        console.log('🧹 License cleared - used codes preserved for security');
    }

    /**
     * Clear all license-related data (including used codes)
     */
    clearAllLicenseData() {
        localStorage.removeItem(this.storageKey);
        localStorage.removeItem('bridgeAppDealsPlayed');
        localStorage.removeItem(this.usedCodesKey);
        console.log('🧹 All license data cleared');
    }

    /**
     * Increment the deals played counter
     */
    incrementDealsPlayed() {
        const current = parseInt(localStorage.getItem('bridgeAppDealsPlayed') || '0');
        const newCount = current + 1;
        localStorage.setItem('bridgeAppDealsPlayed', newCount.toString());
        console.log(`🎯 Deal completed: ${newCount} total deals played`);
        
        // Check if trial limit reached
        const licenseStatus = this.checkLicenseStatus();
        if (licenseStatus.status === 'expired') {
            console.warn('⚠️ Trial deal limit reached');
            return { trialExpired: true, licenseStatus };
        }
        
        return { trialExpired: false, licenseStatus };
    }

    /**
     * Get deals played statistics
     * @returns {Object} Deal statistics
     */
    getDealsStats() {
        const dealsPlayed = parseInt(localStorage.getItem('bridgeAppDealsPlayed') || '0');
        const licenseData = this.getLicenseData();
        
        if (!licenseData) {
            return { dealsPlayed: 0, dealsRemaining: 0, unlimited: false };
        }

        if (licenseData.type === 'FULL' || licenseData.type === 'LIFETIME' || licenseData.type === 'ANNUAL') {
            return { dealsPlayed, dealsRemaining: Infinity, unlimited: true };
        }

        const dealsRemaining = Math.max(0, this.trialDeals - dealsPlayed);
        return { dealsPlayed, dealsRemaining, unlimited: false };
    }

    // Static helper methods for development and testing
    
    /**
     * Generate a random trial code
     * @returns {string} Random trial code
     */
    static generateTrialCode() {
        const prefixes = ['111', '222', '333', '444', '555', '666', '777', '888', '999'];
        const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
        const lastThree = Array(3).fill(0).map(() => Math.floor(Math.random() * 10)).join('');
        return prefix + lastThree;
    }

    /**
     * Generate a valid full license code (checksum = 37)
     * @returns {string} Valid full license code
     */
    static generateAnnualCode() {
        // Generate a valid annual licence code (digits sum to 37)
        const baseDigits = [7, 3, 0, 9, 9, 9]; // Sum = 37
        for (let i = baseDigits.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [baseDigits[i], baseDigits[j]] = [baseDigits[j], baseDigits[i]];
        }
        return baseDigits.join('');
    }

    static generateLifetimeCode() {
        // Generate a valid lifetime licence code (digits sum to 47)
        const baseDigits = [9, 9, 9, 9, 9, 2]; // Sum = 47
        for (let i = baseDigits.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [baseDigits[i], baseDigits[j]] = [baseDigits[j], baseDigits[i]];
        }
        return baseDigits.join('');
    }

    // Keep for backwards compatibility
    static generateFullCode() {
        return LicenseManager.generateAnnualCode();
    }

    /**
     * Calculate checksum of a license code
     * @param {string} code License code
     * @returns {number} Sum of all digits
     */
    static checksumCode(code) {
        return code.split('').reduce((sum, digit) => sum + parseInt(digit), 0);
    }

    /**
     * Validate multiple codes at once (for testing)
     * @param {Array} codes Array of codes to validate
     * @returns {Array} Array of validation results
     */
    static validateMultipleCodes(codes) {
        const manager = new LicenseManager();
        return codes.map(code => ({
            code,
            ...manager.validateCodeSync(code),
            checksum: LicenseManager.checksumCode(code)
        }));
    }
}

// Development utilities (only available in development environments)
if (typeof window !== 'undefined' && (
    location.hostname === 'localhost' || 
    location.hostname === '127.0.0.1' || 
    location.hostname.includes('github.io')
)) {
    // Development helper functions
    window.LicenseDevTools = {
        generateTrialCode: LicenseManager.generateTrialCode,
        generateAnnualCode: LicenseManager.generateAnnualCode,
        generateLifetimeCode: LicenseManager.generateLifetimeCode,
        generateFullCode: LicenseManager.generateFullCode,
        checksumCode: LicenseManager.checksumCode,
        validateCodes: LicenseManager.validateMultipleCodes,
        
        // Quick license management for testing
        clearAllData: function() {
            const manager = new LicenseManager();
            manager.clearAllLicenseData();
            console.log('🧹 All license data cleared for testing');
        },
        
        showLicenseDebug: function() {
            console.log('\n🔍 License Debug Info:');
            console.log('License:', localStorage.getItem('bridgeAppLicense'));
            console.log('Used Codes:', localStorage.getItem('bridgeAppUsedCodes'));
            console.log('Deals Played:', localStorage.getItem('bridgeAppDealsPlayed'));
            
            const manager = new LicenseManager();
            const status = manager.checkLicenseStatus();
            console.log('Current Status:', status);
        },
        
        generateTestCodes: function() {
            console.log('\n🧪 Test License Codes:');
            console.log('\nTrial codes (any checksum):');
            ['111000', '222111', '333222', '444333', '555444'].forEach(code => {
                const sum = LicenseManager.checksumCode(code);
                console.log(`${code} (sum: ${sum}) - TRIAL`);
            });
            
            console.log('\nAnnual licence codes (sum = 37):');
            ['730999', '109999', '469981', '289972', '379981'].forEach(code => {
                const sum = LicenseManager.checksumCode(code);
                console.log(`${code} (sum: ${sum}) - ANNUAL 12 months`);
            });
            console.log('\nLifetime licence codes (sum = 47):');
            ['999992', '989981', '997991', '998981', '979991'].forEach(code => {
                const sum = LicenseManager.checksumCode(code);
                console.log(`${code} (sum: ${sum}) - LIFETIME`);
            });
        }
    };
    
    // Auto-show test codes in development
    console.log('🛠️ License Development Tools loaded');
    console.log('• LicenseDevTools.generateTestCodes() - Show sample codes');
    console.log('• LicenseDevTools.clearAllData() - Clear all license data');
    console.log('• LicenseDevTools.showLicenseDebug() - Show current state');
    window.LicenseDevTools.generateTestCodes();
}

// Export for both CommonJS and ES modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { LicenseManager };
} else if (typeof window !== 'undefined') {
    window.LicenseManager = LicenseManager;
}