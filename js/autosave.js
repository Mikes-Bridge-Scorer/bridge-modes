/**
 * Bridge Modes Calculator — Auto-save and Resume (October 2026)
 *
 * Why: on phones (iPhones especially) the browser can close the app in the background when the
 * screen locks or another app is opened. Until now every mode kept its scores only in memory, so
 * a reload lost the whole session.
 *
 * What it does, for all five modes:
 *  - saves the game in progress to the phone (localStorage) after every button press, every few
 *    seconds while a game is open, and whenever the app goes into the background;
 *  - when the app opens again (or you go back to the mode menu), it offers
 *    "Resume your Kitchen Bridge game?" with Resume / Start fresh.
 *
 * It works from outside the modes: it copies each mode's own data (scores, history, deal number,
 * current step...) and puts it back into a freshly started mode, so no mode file had to change.
 * Load it after app.js in index.html.
 */
(function () {
    'use strict';

    const KEY = 'bridgeModesAutosave';
    const MAX_AGE_HOURS = 72;          // older saved games are not offered
    const MIN_INPUTS = 3;              // don't offer to resume a game that barely started
    const SKIP_KEYS = new Set(['bridgeApp', 'licenseManager']);
    const MODE_NAMES = { '1': 'Kitchen Bridge', '2': 'Bonus Bridge', '3': 'Chicago Bridge', '4': 'Rubber Bridge', '5': 'Duplicate Bridge' };

    if (typeof BridgeApp === 'undefined') { console.warn('[autosave] BridgeApp not found'); return; }

    // ── copy a mode's data (no functions, page elements or links back to the app) ──
    function snapshot(mode) {
        const seen = new WeakSet();
        return JSON.parse(JSON.stringify(mode, function (k, v) {
            if (SKIP_KEYS.has(k)) return undefined;
            if (typeof v === 'function') return undefined;
            if (v && typeof v === 'object') {
                if (typeof Node !== 'undefined' && v instanceof Node) return undefined;
                if (v === window) return undefined;
                if (seen.has(v)) return undefined;
                seen.add(v);
            }
            return v;
        }));
    }

    // ── put saved data back, keeping each object's own type (so its methods still work) ──
    function restore(target, saved) {
        Object.keys(saved).forEach(function (k) {
            const sv = saved[k], tv = target[k];
            if (sv && typeof sv === 'object' && !Array.isArray(sv) &&
                tv && typeof tv === 'object' && !Array.isArray(tv) && !(tv instanceof Map) && !(tv instanceof Set)) {
                restore(tv, sv);
            } else {
                target[k] = sv;
            }
        });
    }

    function read() {
        try {
            const s = JSON.parse(localStorage.getItem(KEY) || 'null');
            if (!s || !s.modeId || !s.state) return null;
            if (Date.now() - s.savedAt > MAX_AGE_HOURS * 3600 * 1000) return null;
            if ((s.inputs || 0) < MIN_INPUTS) return null;
            return s;
        } catch (e) { return null; }
    }
    function clear() { try { localStorage.removeItem(KEY); } catch (e) {} }

    function save(app) {
        try {
            if (!app || app.appState !== 'bridge_mode' || !app.currentBridgeMode || !app._asModeId) return;
            if ((app._asInputs || 0) < MIN_INPUTS) return;
            localStorage.setItem(KEY, JSON.stringify({
                modeId: app._asModeId,
                modeName: MODE_NAMES[app._asModeId] || 'game',
                savedAt: Date.now(),
                inputs: app._asInputs,
                state: snapshot(app.currentBridgeMode)
            }));
        } catch (e) { console.warn('[autosave] could not save:', e && e.message); }
    }

    const P = BridgeApp.prototype;

    // remember which mode is open; a fresh start counts its own button presses
    const origSelect = P.selectBridgeMode;
    P.selectBridgeMode = async function (mode) {
        this._asModeId = String(mode);
        if (!this._asResuming) this._asInputs = 0;
        return origSelect.apply(this, arguments);
    };

    // save after every button press in a game
    const origPress = P.handleButtonPress;
    P.handleButtonPress = function (value) {
        const r = origPress.apply(this, arguments);
        if (this.appState === 'bridge_mode') {
            this._asInputs = (this._asInputs || 0) + 1;
            const app = this;
            setTimeout(function () { save(app); }, 50);
        }
        return r;
    };

    // offer to resume on the mode menu
    const origMenu = P.showLicensedMode;
    P.showLicensedMode = function () {
        const app = this;
        // leaving a game for the menu: keep its latest state first
        if (app.appState === 'bridge_mode') save(app);
        const r = origMenu.apply(this, arguments);
        const s = read();
        if (s) showResumeOffer(app, s);
        return r;
    };

    function showResumeOffer(app, s) {
        const display = document.getElementById('display');
        if (!display || document.getElementById('as-resume')) return;
        const when = new Date(s.savedAt);
        const sameDay = when.toDateString() === new Date().toDateString();
        const whenText = (sameDay ? 'today' : when.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'short' })) +
                         ' at ' + when.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
        const box = document.createElement('div');
        box.id = 'as-resume';
        box.style.cssText = 'margin:8px 0;padding:10px;border-radius:8px;background:#fff8e1;border:2px solid #f9a825;color:#3e2723;font-size:15px;text-align:center;';
        box.innerHTML =
            '<div style="font-weight:bold;margin-bottom:8px;">Resume your ' + s.modeName + ' game from ' + whenText + '?</div>' +
            '<button id="as-yes" style="font-size:15px;padding:8px 16px;margin:0 6px;border-radius:6px;border:none;background:#2e7d32;color:#fff;font-weight:bold;">Resume</button>' +
            '<button id="as-no" style="font-size:15px;padding:8px 16px;margin:0 6px;border-radius:6px;border:1px solid #888;background:#fff;color:#333;">Start fresh</button>';
        display.prepend(box);
        const stop = function (e) { e.stopPropagation(); e.preventDefault(); };
        box.addEventListener('touchend', function (e) { e.stopPropagation(); }, true);
        box.querySelector('#as-yes').addEventListener('click', function (e) { stop(e); resume(app, s); });
        box.querySelector('#as-no').addEventListener('click', function (e) {
            stop(e);
            if (confirm('Delete the saved ' + s.modeName + ' game and start fresh?')) { clear(); box.remove(); }
        });
    }

    async function resume(app, s) {
        try {
            app._asResuming = true;
            app._asInputs = s.inputs;
            await app.selectBridgeMode(s.modeId);
            if (!app.currentBridgeMode) throw new Error('mode did not start');
            restore(app.currentBridgeMode, s.state);
            if (typeof app.currentBridgeMode.updateDisplay === 'function') app.currentBridgeMode.updateDisplay();
            if (typeof app.showMessage === 'function') app.showMessage(s.modeName + ' game resumed', 'success');
            save(app);
        } catch (e) {
            console.error('[autosave] resume failed:', e);
            alert('Sorry, the saved game could not be resumed.');
        } finally {
            app._asResuming = false;
        }
    }

    // save regularly while a game is open, and whenever the app goes into the background
    setInterval(function () { if (window.bridgeApp) save(window.bridgeApp); }, 5000);
    document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'hidden' && window.bridgeApp) save(window.bridgeApp); });
    window.addEventListener('pagehide', function () { if (window.bridgeApp) save(window.bridgeApp); });
    // some modes have their own pop-up buttons that don't go through handleButtonPress
    document.addEventListener('click', function () {
        const app = window.bridgeApp;
        if (app && app.appState === 'bridge_mode') {
            app._asInputs = (app._asInputs || 0) + 1;
            setTimeout(function () { save(app); }, 300);
        }
    }, true);

    window.BridgeAutosave = { read: read, clear: clear, save: function () { save(window.bridgeApp); } };
    console.log('💾 Auto-save loaded');
})();
