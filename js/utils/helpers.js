// ===== UTILITY HELPER FUNCTIONS =====

export const Helpers = {
    
    // ===== DOM UTILITIES =====
    
    getElementById(id) {
        const element = document.getElementById(id);
        if (!element) {
            console.warn(`⚠️ Element not found: ${id}`);
        }
        return element;
    },
    
    querySelector(selector) {
        const element = document.querySelector(selector);
        if (!element) {
            console.warn(`⚠️ Element not found: ${selector}`);
        }
        return element;
    },
    
    querySelectorAll(selector) {
        return document.querySelectorAll(selector);
    },
    
    createElement(tag, className = '', textContent = '') {
        const element = document.createElement(tag);
        if (className) element.className = className;
        if (textContent) element.textContent = textContent;
        return element;
    },
    
    // ===== CLASS MANAGEMENT =====
    
    addClass(element, className) {
        if (element && className) {
            element.classList.add(className);
        }
    },
    
    removeClass(element, className) {
        if (element && className) {
            element.classList.remove(className);
        }
    },
    
    toggleClass(element, className) {
        if (element && className) {
            element.classList.toggle(className);
        }
    },
    
    hasClass(element, className) {
        return element && element.classList.contains(className);
    },
    
    // ===== EVENT UTILITIES =====
    
    addEventListener(element, event, handler, options = {}) {
        if (element && typeof handler === 'function') {
            element.addEventListener(event, handler, options);
        }
    },
    
    removeEventListener(element, event, handler, options = {}) {
        if (element && typeof handler === 'function') {
            element.removeEventListener(event, handler, options);
        }
    },
    
    // ===== ANIMATION UTILITIES =====
    
    fadeIn(element, duration = 300) {
        if (!element) return;
        
        element.style.opacity = '0';
        element.style.display = 'block';
        
        const start = performance.now();
        
        function animate(currentTime) {
            const elapsed = currentTime - start;
            const progress = Math.min(elapsed / duration, 1);
            
            element.style.opacity = progress;
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        }
        
        requestAnimationFrame(animate);
    },
    
    fadeOut(element, duration = 300) {
        if (!element) return;
        
        const start = performance.now();
        const startOpacity = parseFloat(getComputedStyle(element).opacity);
        
        function animate(currentTime) {
            const elapsed = currentTime - start;
            const progress = Math.min(elapsed / duration, 1);
            
            element.style.opacity = startOpacity * (1 - progress);
            
            if (progress >= 1) {
                element.style.display = 'none';
            } else {
                requestAnimationFrame(animate);
            }
        }
        
        requestAnimationFrame(animate);
    },
    
    // ===== NUMBER UTILITIES =====
    
    clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    },
    
    randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },
    
    roundToDecimal(num, decimals = 2) {
        return Math.round(num * Math.pow(10, decimals)) / Math.pow(10, decimals);
    },
    
    // ===== STRING UTILITIES =====
    
    capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    },
    
    formatNumber(num) {
        return new Intl.NumberFormat().format(num);
    },
    
    truncate(str, length = 50) {
        return str.length > length ? str.substring(0, length) + '...' : str;
    },
    
    // ===== DATE UTILITIES =====
    
    formatDate(date, options = {}) {
        const defaultOptions = {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        
        const formatOptions = { ...defaultOptions, ...options };
        return new Intl.DateTimeFormat('en-US', formatOptions).format(date);
    },
    
    getRelativeTime(date) {
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);
        
        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins} min ago`;
        if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
        
        return this.formatDate(date, { year: 'numeric', month: 'short', day: 'numeric' });
    },
    
    // ===== ARRAY UTILITIES =====
    
    shuffle(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    },
    
    groupBy(array, key) {
        return array.reduce((groups, item) => {
            const group = item[key];
            groups[group] = groups[group] || [];
            groups[group].push(item);
            return groups;
        }, {});
    },
    
    unique(array) {
        return [...new Set(array)];
    },
    
    // ===== OBJECT UTILITIES =====
    
    deepClone(obj) {
        if (obj === null || typeof obj !== 'object') return obj;
        if (obj instanceof Date) return new Date(obj.getTime());
        if (obj instanceof Array) return obj.map(item => this.deepClone(item));
        
        const cloned = {};
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                cloned[key] = this.deepClone(obj[key]);
            }
        }
        return cloned;
    },
    
    merge(target, ...sources) {
        return Object.assign({}, target, ...sources);
    },
    
    pick(obj, keys) {
        const picked = {};
        keys.forEach(key => {
            if (key in obj) {
                picked[key] = obj[key];
            }
        });
        return picked;
    },
    
    omit(obj, keys) {
        const omitted = { ...obj };
        keys.forEach(key => delete omitted[key]);
        return omitted;
    },
    
    // ===== VALIDATION UTILITIES =====
    
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },
    
    isValidURL(url) {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    },
    
    isEmpty(value) {
        if (value === null || value === undefined) return true;
        if (typeof value === 'string') return value.trim().length === 0;
        if (Array.isArray(value)) return value.length === 0;
        if (typeof value === 'object') return Object.keys(value).length === 0;
        return false;
    },
    
    // ===== PERFORMANCE UTILITIES =====
    
    debounce(func, delay) {
        let timeoutId;
        return function (...args) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func.apply(this, args), delay);
        };
    },
    
    throttle(func, limit) {
        let inThrottle;
        return function (...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },
    
    // ===== MOBILE/DEVICE UTILITIES =====
    
    isMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    },
    
    isIOS() {
        return /iPad|iPhone|iPod/.test(navigator.userAgent);
    },
    
    isAndroid() {
        return /Android/.test(navigator.userAgent);
    },
    
    getScreenSize() {
        return {
            width: window.innerWidth,
            height: window.innerHeight,
            availWidth: screen.availWidth,
            availHeight: screen.availHeight
        };
    },
    
    // ===== BRIDGE-SPECIFIC UTILITIES =====
    
    formatContract(level, suit, doubled = '') {
        return `${level}${suit}${doubled}`;
    },
    
    getPartnership(direction) {
        return ['N', 'S'].includes(direction) ? 'NS' : 'EW';
    },
    
    getOppositeDirection(direction) {
        const opposites = { 'N': 'S', 'S': 'N', 'E': 'W', 'W': 'E' };
        return opposites[direction] || direction;
    },
    
    getNextDirection(direction) {
        const sequence = ['N', 'E', 'S', 'W'];
        const currentIndex = sequence.indexOf(direction);
        return sequence[(currentIndex + 1) % 4];
    },
    
    getSuitColor(suit) {
        const colors = {
            '♣': 'green',
            '♦': 'red', 
            '♥': 'red',
            '♠': 'black',
            'NT': 'purple'
        };
        return colors[suit] || 'black';
    },
    
    isMajorSuit(suit) {
        return ['♥', '♠'].includes(suit);
    },
    
    isMinorSuit(suit) {
        return ['♣', '♦'].includes(suit);
    },
    
    // ===== ERROR HANDLING =====
    
    safeExecute(func, fallback = null) {
        try {
            return func();
        } catch (error) {
            console.error('Safe execute failed:', error);
            return fallback;
        }
    },
    
    logError(message, error = null) {
        console.error(`❌ ${message}`, error || '');
    },
    
    logWarning(message) {
        console.warn(`⚠️ ${message}`);
    },
    
    logInfo(message) {
        console.log(`ℹ️ ${message}`);
    },
    
    // ===== DEBUGGING =====
    
    debugObject(obj, label = 'Debug') {
        console.group(`🔍 ${label}`);
        console.log(obj);
        console.table(obj);
        console.groupEnd();
    },
    
    measurePerformance(func, label = 'Performance') {
        const start = performance.now();
        const result = func();
        const end = performance.now();
        console.log(`⏱️ ${label}: ${(end - start).toFixed(2)}ms`);
        return result;
    }
};

// ===== GLOBAL ERROR HANDLER =====
export function setupGlobalErrorHandling() {
    window.addEventListener('error', (event) => {
        console.error('❌ Global Error:', event.error);
        
        // You could send this to an error reporting service
        // errorReporting.report(event.error);
    });
    
    window.addEventListener('unhandledrejection', (event) => {
        console.error('❌ Unhandled Promise Rejection:', event.reason);
        
        // Prevent the default browser error handling
        event.preventDefault();
    });
}

// ===== CONSTANTS =====
export const CONSTANTS = {
    BRIDGE_MODES: {
        KITCHEN: 'kitchen',
        BONUS: 'bonus', 
        CHICAGO: 'chicago',
        RUBBER: 'rubber',
        DUPLICATE: 'duplicate'
    },
    
    SUITS: ['♣', '♦', '♥', '♠', 'NT'],
    DIRECTIONS: ['N', 'E', 'S', 'W'],
    VULNERABILITIES: ['None', 'NS', 'EW', 'Both'],
    
    APP_STATES: {
        MODE_SELECTION: 'mode_selection',
        LEVEL_SELECTION: 'level_selection', 
        SUIT_SELECTION: 'suit_selection',
        DECLARER_SELECTION: 'declarer_selection',
        RESULT_SELECTION: 'result_selection',
        SCORING: 'scoring'
    }
};