// ===== STORAGE UTILITY - MANAGES LOCAL DATA PERSISTENCE =====

export class Storage {
    constructor(appName = 'bridge-modes') {
        this.appName = appName;
        this.storageKey = `${appName}_data`;
        this.isSupported = this.checkStorageSupport();
        this.data = {};
        
        // Initialize
        this.init();
        
        console.log(`💾 Storage initialized: ${this.isSupported ? '✅' : '❌ (memory only)'}`);
    }
    
    // ===== INITIALIZATION =====
    
    init() {
        if (this.isSupported) {
            this.loadFromStorage();
        }
        
        // Setup periodic auto-save
        this.setupAutoSave();
        
        // Setup storage event listener for cross-tab sync
        this.setupStorageSync();
    }
    
    checkStorageSupport() {
        try {
            const testKey = '__storage_test__';
            localStorage.setItem(testKey, 'test');
            localStorage.removeItem(testKey);
            return true;
        } catch (error) {
            console.warn('⚠️ LocalStorage not available:', error.message);
            return false;
        }
    }
    
    // ===== CORE STORAGE METHODS =====
    
    async save(key, value, options = {}) {
        try {
            // Add metadata
            const dataItem = {
                value: value,
                timestamp: new Date().toISOString(),
                version: options.version || '1.0',
                compressed: false
            };
            
            // Compress large data if needed
            if (options.compress && this.shouldCompress(value)) {
                dataItem.value = await this.compressData(value);
                dataItem.compressed = true;
            }
            
            // Store in memory
            this.data[key] = dataItem;
            
            // Persist to localStorage if supported
            if (this.isSupported) {
                await this.persistToStorage();
            }
            
            console.log(`💾 Saved: ${key} (${this.getDataSize(dataItem)} bytes)`);
            return true;
            
        } catch (error) {
            console.error(`❌ Save failed for key "${key}":`, error);
            return false;
        }
    }
    
    async load(key, defaultValue = null) {
        try {
            if (!this.data[key]) {
                return defaultValue;
            }
            
            const dataItem = this.data[key];
            let value = dataItem.value;
            
            // Decompress if needed
            if (dataItem.compressed) {
                value = await this.decompressData(value);
            }
            
            console.log(`💾 Loaded: ${key} (from ${dataItem.timestamp})`);
            return value;
            
        } catch (error) {
            console.error(`❌ Load failed for key "${key}":`, error);
            return defaultValue;
        }
    }
    
    async remove(key) {
        try {
            delete this.data[key];
            
            if (this.isSupported) {
                await this.persistToStorage();
            }
            
            console.log(`💾 Removed: ${key}`);
            return true;
            
        } catch (error) {
            console.error(`❌ Remove failed for key "${key}":`, error);
            return false;
        }
    }
    
    async clear() {
        try {
            this.data = {};
            
            if (this.isSupported) {
                localStorage.removeItem(this.storageKey);
            }
            
            console.log('💾 Storage cleared');
            return true;
            
        } catch (error) {
            console.error('❌ Clear failed:', error);
            return false;
        }
    }
    
    // ===== PERSISTENCE METHODS =====
    
    loadFromStorage() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            if (stored) {
                this.data = JSON.parse(stored);
                console.log(`💾 Loaded ${Object.keys(this.data).length} items from storage`);
            }
        } catch (error) {
            console.warn('⚠️ Failed to load from storage:', error);
            this.data = {};
        }
    }
    
    async persistToStorage() {
        try {
            const serialized = JSON.stringify(this.data);
            localStorage.setItem(this.storageKey, serialized);
            return true;
        } catch (error) {
            if (error.