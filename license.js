/**
 * License Manager (v3) — Numeric codes, matches existing digit keypad
 * Bridge at Sea — shared pattern for V3, Bridge Modes Calculator, Bonus Bridge
 *
 * HOW TO REUSE THIS FILE FOR ANOTHER APP:
 * Just change the CONFIG block below — nothing else needs to change.
 */

// =====================================================
// CONFIG — the only section that differs between apps
// =====================================================
const LICENSE_CONFIG = {
    appName: 'Bridge Modes Calculator',
    annualCode: '201025',
    lifetimeCode: '202510',
    annualBuyUrl: 'https://ko-fi.com/s/719925487c',
    lifetimeBuyUrl: 'https://ko-fi.com/s/6ffe34b827',
    trialDays: 60,              // 2 months
    expiryWarningDays: 7        // start warning this many days before trial/annual expiry
};
// =====================================================

class LicenseManager {
    constructor(config = LICENSE_CONFIG) {
        this.config = config;
        this.storageKey = 'bridgeAppLicense';
        this.firstUseKey = 'bridgeAppFirstUse';
        this.annualDays = 365;

        console.log(`🔐 License Manager initialized for ${this.config.appName}`);
    }

    // ---- First-use / trial tracking ----

    getFirstUseDate() {
        let stored = localStorage.getItem(this.firstUseKey);
        if (!stored) {
            stored = Date.now().toString();
            localStorage.setItem(this.firstUseKey, stored);
            console.log('🆕 First use recorded:', new Date(parseInt(stored)).toLocaleDateString());
        }
        return parseInt(stored);
    }

    getTrialDaysLeft() {
        const firstUse = this.getFirstUseDate();
        const daysElapsed = Math.floor((Date.now() - firstUse) / (1000 * 60 * 60 * 24));
        return Math.max(0, this.config.trialDays - daysElapsed);
    }

    // ---- Main status check — call this on app start ----

    checkLicenseStatus() {
        const license = this.getLicenseData();

        // A stored paid license always wins over the trial clock
        if (license) {
            if (license.type === 'LIFETIME') {
                return {
                    status: 'lifetime',
                    needsCode: false,
                    message: 'Lifetime access active — thank you for your support!'
                };
            }
            if (license.type === 'ANNUAL') {
                return this.checkAnnualExpiry(license);
            }
        }

        // No paid license — check the trial clock
        const daysLeft = this.getTrialDaysLeft();
        if (daysLeft > 0) {
            const inWarningWindow = daysLeft <= this.config.expiryWarningDays;
            return {
                status: 'trial',
                needsCode: false,
                daysLeft,
                warning: inWarningWindow,
                message: inWarningWindow
                    ? `⚠️ Trial ends in ${daysLeft} day${daysLeft !== 1 ? 's' : ''}. Get Annual (£10/year, code from ${this.config.annualBuyUrl}) or Lifetime (£25, ${this.config.lifetimeBuyUrl}).`
                    : `Free trial: ${daysLeft} day${daysLeft !== 1 ? 's' : ''} left`
            };
        }

        // Trial has run out and there's no valid paid license
        return {
            status: 'expired',
            needsCode: true,
            message: this.getTrialExpiredMessage()
        };
    }

    checkAnnualExpiry(license) {
        const now = Date.now();
        const expiryDate = license.activatedAt + (this.annualDays * 24 * 60 * 60 * 1000);
        const daysLeft = Math.max(0, Math.floor((expiryDate - now) / (1000 * 60 * 60 * 24)));

        if (daysLeft <= 0) {
            return {
                status: 'annual_expired',
                needsCode: true,
                message: `Your annual licence has expired. Renew for £10/year (${this.config.annualBuyUrl}) or upgrade to Lifetime for £25 (${this.config.lifetimeBuyUrl}).`
            };
        }

        if (daysLeft <= this.config.expiryWarningDays) {
            return {
                status: 'annual',
                needsCode: false,
                daysLeft,
                dealsLeft: 0,
                warning: true,
                message: `⚠️ Licence expires in ${daysLeft} day${daysLeft !== 1 ? 's' : ''}. Renew here: ${this.config.annualBuyUrl}`
            };
        }

        return {
            status: 'annual',
            needsCode: false,
            daysLeft,
            dealsLeft: 0,
            warning: false,
            message: `Annual licence active — ${daysLeft} days remaining.`
        };
    }

    // ---- The clear, actionable message shown when the trial runs out ----

    getTrialExpiredMessage() {
        return `Your 2-month free trial of ${this.config.appName} has ended. ` +
               `To keep using the full app: Annual £10/year (${this.config.annualBuyUrl}) or ` +
               `Lifetime £25 one-off (${this.config.lifetimeBuyUrl}). ` +
               `You'll receive a 6-digit unlock code by download after purchase — enter it below.`;
    }

    // ---- Code entry — matches the name/shape app.js already calls ----

    async activateLicense(rawCode) {
        const code = (rawCode || '').trim();

        if (!code || code.length !== 6 || !/^\d{6}$/.test(code)) {
            return { success: false, message: 'Code must be exactly 6 digits.' };
        }

        if (code === this.config.annualCode) {
            this.storeLicense('ANNUAL', code);
            return {
                success: true,
                type: 'ANNUAL',
                message: '🎉 Annual licence activated! Enjoy a full year of ' + this.config.appName + '.'
            };
        }

        if (code === this.config.lifetimeCode) {
            this.storeLicense('LIFETIME', code);
            return {
                success: true,
                type: 'LIFETIME',
                message: '🎉 Lifetime licence activated! Thank you for supporting ' + this.config.appName + '.'
            };
        }

        return { success: false, message: 'That code isn\'t recognised. Please check it and try again.' };
    }

    storeLicense(type, code) {
        const licenseData = {
            type,
            code,
            activatedAt: Date.now(),
            activatedDate: new Date().toISOString()
        };
        localStorage.setItem(this.storageKey, JSON.stringify(licenseData));
        console.log(`🔒 License activated: ${type}`);
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
        console.log('🧹 License cleared');
    }

    // ---- Legacy compatibility ----
    // Older mode files (kitchen.js, and possibly others) still call this
    // from a previous deals-counted trial system. The current trial is
    // entirely date-based (see getTrialDaysLeft above), so this doesn't
    // need to do anything — it just needs to exist so those calls don't
    // throw and break the app mid-game.
    incrementDealsPlayed() {
        // Intentionally a no-op — trial tracking is date-based now.
    }
}

// Export for both CommonJS and ES modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { LicenseManager, LICENSE_CONFIG };
} else if (typeof window !== 'undefined') {
    window.LicenseManager = LicenseManager;
    window.LICENSE_CONFIG = LICENSE_CONFIG;
}
