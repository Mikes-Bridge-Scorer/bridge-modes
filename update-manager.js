// Add this to your main app.js or create a separate update-manager.js

class UpdateManager {
    constructor() {
        this.currentVersion = '2025-01-31-001'; // Match service worker version
        this.init();
    }

    async init() {
        if ('serviceWorker' in navigator) {
            // Register service worker
            try {
                const registration = await navigator.serviceWorker.register('./sw.js');
                console.log('📦 Service Worker registered');
                
                // Check for updates periodically
                setInterval(() => {
                    registration.update();
                }, 30000); // Check every 30 seconds
                
                // Listen for updates
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            // New version available
                            this.showUpdateNotification();
                        }
                    });
                });
                
                // Listen for controller changes
                navigator.serviceWorker.addEventListener('controllerchange', () => {
                    console.log('🔄 New version activated - reloading...');
                    window.location.reload();
                });
                
            } catch (error) {
                console.error('❌ Service Worker registration failed:', error);
            }
        }
    }

    showUpdateNotification() {
        // Create a non-intrusive update notification
        const notification = document.createElement('div');
        notification.id = 'update-notification';
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #28a745;
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            z-index: 10000;
            font-family: system-ui, -apple-system, sans-serif;
            font-size: 14px;
            max-width: 300px;
            cursor: pointer;
            transition: transform 0.3s ease;
        `;
        
        notification.innerHTML = `
            <div style="font-weight: bold; margin-bottom: 8px;">
                🔄 Update Available!
            </div>
            <div style="font-size: 12px; opacity: 0.9; margin-bottom: 10px;">
                A new version of Bridge Modes Calculator is ready.
            </div>
            <div style="display: flex; gap: 10px;">
                <button id="update-now" style="background: rgba(255,255,255,0.2); border: 1px solid rgba(255,255,255,0.3); color: white; padding: 5px 12px; border-radius: 4px; cursor: pointer; font-size: 12px;">
                    Update Now
                </button>
                <button id="update-later" style="background: transparent; border: 1px solid rgba(255,255,255,0.3); color: white; padding: 5px 12px; border-radius: 4px; cursor: pointer; font-size: 12px;">
                    Later
                </button>
            </div>
        `;
        
        // Add event listeners
        notification.querySelector('#update-now').addEventListener('click', () => {
            this.applyUpdate();
        });
        
        notification.querySelector('#update-later').addEventListener('click', () => {
            notification.remove();
            // Show again in 5 minutes
            setTimeout(() => {
                this.showUpdateNotification();
            }, 5 * 60 * 1000);
        });
        
        document.body.appendChild(notification);
        
        // Auto-hide after 15 seconds if no action
        setTimeout(() => {
            if (document.getElementById('update-notification')) {
                notification.style.transform = 'translateX(120%)';
                setTimeout(() => notification.remove(), 300);
            }
        }, 15000);
    }

    async applyUpdate() {
        // Remove notification
        const notification = document.getElementById('update-notification');
        if (notification) {
            notification.remove();
        }
        
        // Show updating message
        const updatingMsg = document.createElement('div');
        updatingMsg.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0,0,0,0.8);
            color: white;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
            z-index: 10001;
            font-family: system-ui, -apple-system, sans-serif;
        `;
        updatingMsg.innerHTML = `
            <div style="margin-bottom: 10px;">🔄</div>
            <div>Updating to latest version...</div>
        `;
        document.body.appendChild(updatingMsg);
        
        // Tell service worker to skip waiting and take control
        if (navigator.serviceWorker.controller) {
            navigator.serviceWorker.controller.postMessage({
                type: 'SKIP_WAITING'
            });
        }
        
        // The controllerchange event will trigger a reload
    }

    // Method to manually check for updates
    async checkForUpdates() {
        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
            const registration = await navigator.serviceWorker.getRegistration();
            if (registration) {
                await registration.update();
                console.log('🔍 Checked for updates');
            }
        }
    }

    // Get current version info
    async getVersionInfo() {
        return {
            app: this.currentVersion,
            serviceWorker: await this.getServiceWorkerVersion()
        };
    }

    async getServiceWorkerVersion() {
        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
            return new Promise((resolve) => {
                const messageChannel = new MessageChannel();
                messageChannel.port1.onmessage = (event) => {
                    if (event.data.type === 'VERSION_INFO') {
                        resolve(event.data.version);
                    }
                };
                navigator.serviceWorker.controller.postMessage({
                    type: 'GET_VERSION'
                }, [messageChannel.port2]);
            });
        }
        return 'unknown';
    }
}

// Initialize update manager
if (typeof window !== 'undefined') {
    window.updateManager = new UpdateManager();
    
    // Add to development tools
    if (location.hostname.includes('github.io') || location.hostname === 'localhost') {
        window.checkForUpdates = () => window.updateManager.checkForUpdates();
        window.getVersionInfo = () => window.updateManager.getVersionInfo();
        
        console.log('🔄 Update Manager loaded');
        console.log('• checkForUpdates() - Manually check for app updates');
        console.log('• getVersionInfo() - Show current version info');
    }
}