// ===== WAKE LOCK UTILITY - KEEPS SCREEN AWAKE DURING GAMES =====

export class WakeLock {
    constructor() {
        this.wakeLock = null;
        this.isSupported = 'wakeLock' in navigator;
        this.fallbackVideo = null;
        this.isActive = false;
        
        // Bind methods
        this.handleVisibilityChange = this.handleVisibilityChange.bind(this);
        
        console.log(`🌙 Wake Lock support: ${this.isSupported ? '✅' : '❌ (using fallback)'}`);
    }
    
    // ===== MAIN WAKE LOCK METHODS =====
    
    async request() {
        if (this.isActive) {
            console.log('🌙 Wake lock already active');
            return;
        }
        
        try {
            if (this.isSupported) {
                await this.requestNativeWakeLock();
            } else {
                this.setupFallbackWakeLock();
            }
            
            this.isActive = true;
            this.setupEventListeners();
            
            console.log('🌙 Wake lock activated');
            
        } catch (error) {
            console.warn('⚠️ Wake lock failed:', error);
            // Try fallback even if native was supposed to work
            this.setupFallbackWakeLock();
            this.isActive = true;
        }
    }
    
    async release() {
        if (!this.isActive) {
            console.log('🌙 Wake lock already inactive');
            return;
        }
        
        try {
            if (this.wakeLock) {
                await this.wakeLock.release();
                this.wakeLock = null;
            }
            
            if (this.fallbackVideo) {
                this.cleanupFallbackWakeLock();
            }
            
            this.isActive = false;
            this.removeEventListeners();
            
            console.log('🌙 Wake lock released');
            
        } catch (error) {
            console.warn('⚠️ Wake lock release failed:', error);
        }
    }
    
    // ===== NATIVE WAKE LOCK API =====
    
    async requestNativeWakeLock() {
        try {
            this.wakeLock = await navigator.wakeLock.request('screen');
            
            // Handle wake lock release events
            this.wakeLock.addEventListener('release', () => {
                console.log('🌙 Native wake lock released by system');
                this.wakeLock = null;
                
                // Try to re-acquire if page is still visible
                if (!document.hidden && this.isActive) {
                    setTimeout(() => this.reacquireWakeLock(), 1000);
                }
            });
            
        } catch (error) {
            throw new Error(`Native wake lock failed: ${error.message}`);
        }
    }
    
    async reacquireWakeLock() {
        if (!this.isActive || document.hidden) return;
        
        try {
            console.log('🌙 Attempting to reacquire wake lock...');
            await this.requestNativeWakeLock();
            console.log('🌙 Wake lock reacquired');
        } catch (error) {
            console.warn('⚠️ Failed to reacquire wake lock:', error);
            // Fall back to video method
            this.setupFallbackWakeLock();
        }
    }
    
    // ===== FALLBACK WAKE LOCK (VIDEO METHOD) =====
    
    setupFallbackWakeLock() {
        try {
            // Create invisible video element that prevents sleep
            this.fallbackVideo = document.createElement('video');
            
            // Use a minimal video data URL
            this.fallbackVideo.src = this.getMinimalVideoDataURL();
            
            // Video properties to prevent sleep
            this.fallbackVideo.loop = true;
            this.fallbackVideo.muted = true;
            this.fallbackVideo.playsInline = true;
            this.fallbackVideo.controls = false;
            
            // Make it invisible
            this.fallbackVideo.style.cssText = `
                position: fixed;
                top: -1000px;
                left: -1000px;
                width: 1px;
                height: 1px;
                opacity: 0;
                pointer-events: none;
                z-index: -1000;
            `;
            
            // Add to DOM and play
            document.body.appendChild(this.fallbackVideo);
            
            // Play the video
            const playPromise = this.fallbackVideo.play();
            if (playPromise) {
                playPromise.catch(error => {
                    console.warn('⚠️ Fallback video play failed:', error);
                    // Try alternative fallback
                    this.setupAlternativeFallback();
                });
            }
            
            console.log('🌙 Fallback wake lock (video) activated');
            
        } catch (error) {
            console.warn('⚠️ Fallback wake lock setup failed:', error);
            this.setupAlternativeFallback();
        }
    }
    
    cleanupFallbackWakeLock() {
        if (this.fallbackVideo) {
            try {
                this.fallbackVideo.pause();
                if (this.fallbackVideo.parentNode) {
                    this.fallbackVideo.parentNode.removeChild(this.fallbackVideo);
                }
            } catch (error) {
                console.warn('⚠️ Error cleaning up fallback video:', error);
            }
            this.fallbackVideo = null;
        }
    }
    
    // ===== ALTERNATIVE FALLBACK METHODS =====
    
    setupAlternativeFallback() {
        // Method 1: Periodic interaction simulation
        this.setupPeriodicActivity();
        
        // Method 2: No-sleep CSS animation
        this.setupNoSleepCSS();
        
        console.log('🌙 Alternative fallback methods activated');
    }
    
    setupPeriodicActivity() {
        // Subtle periodic activity to prevent sleep
        this.activityInterval = setInterval(() => {
            if (!document.hidden && this.isActive) {
                // Trigger a very small scroll event
                window.scrollTo(window.scrollX, window.scrollY + 1);
                window.scrollTo(window.scrollX, window.scrollY - 1);
            }
        }, 30000); // Every 30 seconds
    }
    
    setupNoSleepCSS() {
        // Add CSS animation that runs continuously
        const style = document.createElement('style');
        style.id = 'wake-lock-css';
        style.textContent = `
            .wake-lock-helper {
                position: fixed;
                top: -1000px;
                left: -1000px;
                width: 1px;
                height: 1px;
                opacity: 0;
                animation: wakeLockPulse 1s infinite;
                pointer-events: none;
                z-index: -1000;
            }
            
            @keyframes wakeLockPulse {
                0% { transform: scale(1); }
                50% { transform: scale(1.01); }
                100% { transform: scale(1); }
            }
        `;
        
        document.head.appendChild(style);
        
        // Create element that uses the animation
        const helperDiv = document.createElement('div');
        helperDiv.className = 'wake-lock-helper';
        helperDiv.id = 'wake-lock-helper';
        document.body.appendChild(helperDiv);
    }
    
    cleanupAlternativeFallback() {
        // Clear periodic activity
        if (this.activityInterval) {
            clearInterval(this.activityInterval);
            this.activityInterval = null;
        }
        
        // Remove CSS animation
        const style = document.getElementById('wake-lock-css');
        if (style) style.remove();
        
        const helper = document.getElementById('wake-lock-helper');
        if (helper) helper.remove();
    }
    
    // ===== EVENT HANDLING =====
    
    setupEventListeners() {
        document.addEventListener('visibilitychange', this.handleVisibilityChange);
        
        // Handle page unload
        window.addEventListener('beforeunload', () => {
            this.release();
        });
        
        // Handle focus events for additional reliability
        window.addEventListener('focus', () => {
            if (this.isActive && !this.wakeLock) {
                this.reacquireWakeLock();
            }
        });
    }
    
    removeEventListeners() {
        document.removeEventListener('visibilitychange', this.handleVisibilityChange);
    }
    
    handleVisibilityChange() {
        if (document.hidden) {
            // Page is hidden, wake lock will be released automatically
            console.log('🌙 Page hidden, wake lock will be released');
        } else if (this.isActive) {
            // Page is visible again, try to reacquire wake lock
            console.log('🌙 Page visible, attempting to reacquire wake lock');
            setTimeout(() => {
                if (!this.wakeLock && this.isActive) {
                    this.reacquireWakeLock();
                }
            }, 100);
        }
    }
    
    // ===== UTILITY METHODS =====
    
    getMinimalVideoDataURL() {
        // Minimal MP4 video data URL (1 frame, 1 second)
        return `data:video/mp4;base64,AAAAIGZ0eXBtcDQyAAACAGlzb21pc28yYXZjMW1wNDEAAAAIZnJlZQAAAr1tZGF0AAACrgYF//+q3EXpvebZSLeWLNgg2SPu73gyNjQgLSBjb3JlIDE1MiByMjg1NCBlOWE1OTAzIC0gSC4yNjQvTVBFRy00IEFWQyBjb2RlYyAtIENvcHlsZWZ0IDIwMDMtMjAxNyAtIGh0dHA6Ly93d3cudmlkZW9sYW4ub3JnL3gyNjQuaHRtbCAtIG9wdGlvbnM6IGNhYmFjPTEgcmVmPTMgZGVibG9jaz0xOjA6MCBhbmFseXNlPTB4MzoweDExMyBtZT1oZXggc3VibWU9NyBwc3k9MSBwc3lfcmQ9MS4wMDowLjAwIG1peGVkX3JlZj0xIG1lX3JhbmdlPTE2IGNocm9tYV9tZT0xIHRyZWxsaXM9MSA4eDhkY3Q9MSBjcW09MCBkZWFkem9uZT0yMSwxMSBmYXN0X3Bza2lwPTEgY2hyb21hX3FwX29mZnNldD0tMiB0aHJlYWRzPTEgbG9va2FoZWFkX3RocmVhZHM9MSBzbGljZWRfdGhyZWFkcz0wIG5yPTAgZGVjaW1hdGU9MSBpbnRlcmxhY2VkPTAgYmx1cmF5X2NvbXBhdD0wIGNvbnN0cmFpbmVkX2ludHJhPTAgYmZyYW1lcz0zIGJfcHlyYW1pZD0yIGJfYWRhcHQ9MSBiX2JpYXM9MCBkaXJlY3Q9MSB3ZWlnaHRiPTEgb3Blbl9nb3A9MCB3ZWlnaHRwPTIga2V5aW50PTI1MCBrZXlpbnRfbWluPTEwIHNjZW5lY3V0PTQwIGludHJhX3JlZnJlc2g9MCByY19sb29rYWhlYWQ9NDAgcmM9Y3JmIG1idHJlZT0xIGNyZj0yOC4wIHFjb21wPTAuNjAgcXBtaW49MCBxcG1heD02OSBxcHN0ZXA9NCBpcF9yYXRpbz0xLjQwIGFxPTE6MS4wMACAAAABZWWIhAA3//728P4FNjuY0JcRzeidDNmxNjFoumBQp3DAALWwbGVhZCBudW1iZXIgaW4gYXV0b21hdGljYWxseSBnZW5lcmF0ZWQgYnkgeDI2NA==`;
    }
    
    isWakeLockActive() {
        return this.isActive && (this.wakeLock || this.fallbackVideo);
    }
    
    getStatus() {
        return {
            isActive: this.isActive,
            method: this.wakeLock ? 'native' : (this.fallbackVideo ? 'video' : 'alternative'),
            isSupported: this.isSupported,
            wakeLockState: this.wakeLock ? 'active' : 'inactive'
        };
    }
    
    // ===== DEBUG METHODS =====
    
    debug() {
        const status = this.getStatus();
        console.group('🌙 Wake Lock Debug Info');
        console.log('Status:', status);
        console.log('Native API supported:', this.isSupported);
        console.log('Document hidden:', document.hidden);
        console.log('Wake lock object:', this.wakeLock);
        console.log('Fallback video:', this.fallbackVideo);
        console.groupEnd();
    }
    
    // ===== STATIC UTILITY METHODS =====
    
    static async isSupported() {
        return 'wakeLock' in navigator;
    }
    
    static async checkPermission() {
        if ('permissions' in navigator) {
            try {
                const permission = await navigator.permissions.query({ name: 'screen-wake-lock' });
                return permission.state;
            } catch (error) {
                console.warn('Could not check wake lock permission:', error);
                return 'unknown';
            }
        }
        return 'unknown';
    }
}