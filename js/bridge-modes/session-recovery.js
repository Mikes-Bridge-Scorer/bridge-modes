/**
 * Session Recovery Module for Bridge Modes
 * 
 * Saves game state to localStorage after every completed deal so that
 * if the phone sleeps, the browser refreshes, or the app closes mid-game,
 * the player can pick up exactly where they left off.
 * 
 * Usage: load this file BEFORE chicago.js and bonus.js in index.html
 *   <script src="session-recovery.js"></script>
 * 
 * Works automatically - no changes needed in chicago.js or bonus.js.
 * The initialize() and startNewGame() hooks are patched at load time.
 */

const SessionRecovery = {

    // Storage keys - one slot per mode
    KEYS: {
        chicago: 'bridge_session_chicago',
        bonus:   'bridge_session_bonus'
    },

    // How long a saved session remains valid (hours)
    SESSION_EXPIRY_HOURS: 24,

    // ─── SAVE ────────────────────────────────────────────────────────────────

    /**
     * Save the current game state for a mode.
     * Called after every completed deal and on every deal start.
     * @param {string} mode  'chicago' or 'bonus'
     * @param {Object} instance  The mode class instance
     */
    save(mode, instance) {
        try {
            const key = this.KEYS[mode];
            if (!key) return;

            const data = {
                savedAt:     Date.now(),
                mode:        mode,
                scores:      { ...instance.gameState.scores },
                history:     instance.gameState.history
                                 ? [...instance.gameState.history]
                                 : [],
                currentDeal: instance.currentDeal || 1
            };

            localStorage.setItem(key, JSON.stringify(data));
            console.log(`💾 Session saved: ${mode} deal ${data.currentDeal}, NS:${data.scores.NS} EW:${data.scores.EW}`);
        } catch (e) {
            // localStorage may be unavailable (private browsing, storage full)
            console.warn('SessionRecovery: could not save -', e.message);
        }
    },

    // ─── LOAD ────────────────────────────────────────────────────────────────

    /**
     * Load a previously saved session.
     * @param {string} mode  'chicago' or 'bonus'
     * @returns {Object|null}  Saved data or null if none / expired
     */
    load(mode) {
        try {
            const key = this.KEYS[mode];
            if (!key) return null;

            const raw = localStorage.getItem(key);
            if (!raw) return null;

            const data = JSON.parse(raw);

            // Check expiry
            const ageHours = (Date.now() - data.savedAt) / 3600000;
            if (ageHours > this.SESSION_EXPIRY_HOURS) {
                console.log(`⏰ Saved ${mode} session expired (${ageHours.toFixed(1)}h old) - discarding`);
                this.clear(mode);
                return null;
            }

            // Validate minimum required fields
            if (!data.scores || data.currentDeal === undefined) {
                this.clear(mode);
                return null;
            }

            return data;
        } catch (e) {
            console.warn('SessionRecovery: could not load -', e.message);
            return null;
        }
    },

    // ─── CLEAR ───────────────────────────────────────────────────────────────

    /**
     * Clear saved session for a mode (called on New Game).
     * @param {string} mode  'chicago' or 'bonus'
     */
    clear(mode) {
        try {
            const key = this.KEYS[mode];
            if (key) localStorage.removeItem(key);
            console.log(`🗑️ Saved session cleared: ${mode}`);
        } catch (e) {
            // ignore
        }
    },

    // ─── RESTORE ─────────────────────────────────────────────────────────────

    /**
     * Offer to restore a saved session.
     * Called from each mode's initialize() when a saved session is found.
     * Returns true if restoration was accepted, false otherwise.
     * @param {string} mode      'chicago' or 'bonus'
     * @param {Object} instance  The mode class instance
     * @returns {boolean}
     */
    offerRestore(mode, instance) {
        const data = this.load(mode);
        if (!data) return false;

        // Only offer if there's meaningful progress (at least 1 completed deal)
        if (!data.history || data.history.length === 0) {
            this.clear(mode);
            return false;
        }

        const ageMinutes = Math.round((Date.now() - data.savedAt) / 60000);
        const ageText    = ageMinutes < 60
            ? `${ageMinutes} minute${ageMinutes !== 1 ? 's' : ''} ago`
            : `${Math.round(ageMinutes / 60)} hour${Math.round(ageMinutes/60) !== 1 ? 's' : ''} ago`;

        const modeName  = mode === 'chicago' ? 'Chicago Bridge' : 'Bonus Bridge';
        const dealWord  = data.history.length === 1 ? 'deal' : 'deals';
        const msg = `Resume ${modeName}?\n\n` +
                    `Saved ${ageText}\n` +
                    `Deal ${data.currentDeal} • ${data.history.length} ${dealWord} completed\n` +
                    `NS: ${data.scores.NS}  EW: ${data.scores.EW}\n\n` +
                    `OK = Resume   Cancel = Start fresh`;

        if (confirm(msg)) {
            this._applyRestore(mode, instance, data);
            return true;
        } else {
            this.clear(mode);
            return false;
        }
    },

    /**
     * Apply the saved data back onto the mode instance.
     * @private
     */
    _applyRestore(mode, instance, data) {
        // Restore scores
        instance.gameState.scores   = { ...data.scores };
        instance.gameState.history  = [...data.history];
        instance.currentDeal        = data.currentDeal;

        // Sync the gameState's own currentDeal if it has one
        if (instance.gameState.currentDeal !== undefined) {
            instance.gameState.currentDeal = data.currentDeal;
        }

        // Recalculate dealer and vulnerability from restored deal number
        if (typeof instance.updateVulnerabilityAndDealer === 'function') {
            instance.updateVulnerabilityAndDealer();
        }

        const modeName = mode === 'chicago' ? 'Chicago Bridge' : 'Bonus Bridge';
        console.log(`✅ ${modeName} session restored: deal ${data.currentDeal}, NS:${data.scores.NS} EW:${data.scores.EW}`);
    },

    // ─── AUTO-PATCH ──────────────────────────────────────────────────────────

    /**
     * Patch a mode class so that session saving/restoring happens automatically.
     * Called once per class after the class is defined.
     * 
     * Wraps:
     *   initialize()    → offer restore on load
     *   startNewGame()  → clear saved session when confirmed
     *   addScore() / the deal-recording block → save after each deal
     * 
     * Since the JS files use direct method assignments (not ES module exports),
     * we patch the prototype after the class is defined.
     * 
     * @param {Function} ModeClass  ChicagoBridgeMode or BonusBridgeMode
     * @param {string}   mode       'chicago' or 'bonus'
     */
    patchClass(ModeClass, mode) {
        if (!ModeClass || !ModeClass.prototype) {
            console.warn(`SessionRecovery: cannot patch ${mode} - class not found`);
            return;
        }

        const SR = this;

        // ── Patch initialize() ──────────────────────────────────────────────
        const origInit = ModeClass.prototype.initialize;
        ModeClass.prototype.initialize = function() {
            origInit.call(this);
            // After normal init, offer to restore (only if deal 1 and no scores yet)
            if (this.currentDeal <= 1 &&
                this.gameState.scores.NS === 0 &&
                this.gameState.scores.EW === 0) {
                const restored = SR.offerRestore(mode, this);
                if (restored) {
                    this.inputState = 'level_selection';
                    this.resetContract();
                    if (mode === 'bonus' && typeof this.resetHandAnalysis === 'function') {
                        this.resetHandAnalysis();
                    }
                    this.updateDisplay();
                }
            }
        };

        // ── Patch startNewGame() ────────────────────────────────────────────
        const origNewGame = ModeClass.prototype.startNewGame;
        ModeClass.prototype.startNewGame = function() {
            // The original method calls confirm() internally.
            // We hook AFTER to clear storage only when it actually resets.
            const scoreBefore = this.gameState.scores.NS + this.gameState.scores.EW;
            origNewGame.call(this);
            const scoreAfter = this.gameState.scores.NS + this.gameState.scores.EW;
            // If scores went to zero, the user confirmed the new game
            if (scoreAfter === 0 && scoreBefore > 0) {
                SR.clear(mode);
                console.log(`🆕 New game started - ${mode} session cleared`);
            }
        };

        // ── Patch recordScore / addDeal trigger ─────────────────────────────
        // Both modes call this.gameState.addDeal() to record a completed hand.
        // We wrap it so every time addDeal fires, we save immediately after.
        const origAddDeal = ModeClass.prototype.recordScore ||
                            ModeClass.prototype.recordChicagoScore ||
                            ModeClass.prototype.recordBonusScore;

        // Generic approach: wrap the gameState.addDeal method at initialize time
        // by patching a hook into the mode's post-score flow.
        // We use the updateDisplay() call that always follows scoring as our trigger.
        const origUpdateDisplay = ModeClass.prototype.updateDisplay;
        ModeClass.prototype.updateDisplay = function() {
            origUpdateDisplay.call(this);
            // Save whenever we have completed deals
            if (this.gameState &&
                this.gameState.history &&
                this.gameState.history.length > 0) {
                SR.save(mode, this);
            }
        };

        console.log(`🔧 SessionRecovery patched: ${mode}`);
    },

    // ─── INIT ────────────────────────────────────────────────────────────────

    /**
     * Wire up session recovery for both modes.
     * Call this after all mode scripts have loaded.
     */
    init() {
        // Patch classes if they exist at call time
        if (typeof ChicagoBridgeMode !== 'undefined') {
            this.patchClass(ChicagoBridgeMode, 'chicago');
        }
        if (typeof BonusBridgeMode !== 'undefined') {
            this.patchClass(BonusBridgeMode, 'bonus');
        }

        // If classes aren't defined yet (loaded dynamically), retry after a tick
        if (typeof ChicagoBridgeMode === 'undefined' || typeof BonusBridgeMode === 'undefined') {
            setTimeout(() => {
                if (typeof ChicagoBridgeMode !== 'undefined' && !ChicagoBridgeMode._srPatched) {
                    this.patchClass(ChicagoBridgeMode, 'chicago');
                }
                if (typeof BonusBridgeMode !== 'undefined' && !BonusBridgeMode._srPatched) {
                    this.patchClass(BonusBridgeMode, 'bonus');
                }
            }, 100);
        }

        console.log('✅ SessionRecovery loaded');
    },

    // ─── UTILITIES ───────────────────────────────────────────────────────────

    /** Returns a summary of what's currently saved (useful for debugging) */
    status() {
        ['chicago', 'bonus'].forEach(mode => {
            const data = this.load(mode);
            if (data) {
                const age = Math.round((Date.now() - data.savedAt) / 60000);
                console.log(`📋 ${mode}: deal ${data.currentDeal}, ${data.history.length} deals, saved ${age}m ago, NS:${data.scores.NS} EW:${data.scores.EW}`);
            } else {
                console.log(`📋 ${mode}: no saved session`);
            }
        });
    },

    /** Manually clear all saved sessions (e.g. from browser console) */
    clearAll() {
        this.clear('chicago');
        this.clear('bonus');
        console.log('🗑️ All saved sessions cleared');
    }
};

// Auto-initialise once the DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => SessionRecovery.init());
} else {
    // DOM already ready - but mode classes may not be defined yet
    // Init runs with a small delay to let the other scripts register their classes
    setTimeout(() => SessionRecovery.init(), 0);
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SessionRecovery;
} else if (typeof window !== 'undefined') {
    window.SessionRecovery = SessionRecovery;
}
