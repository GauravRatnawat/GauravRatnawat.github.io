// ===================================
// Utility Functions
// ===================================

/**
 * Throttle function to limit execution rate
 * @param {Function} func - Function to throttle
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} Throttled function
 */
export function throttle(func, delay) {
    let timeoutId;
    let lastRan;
    return function(...args) {
        if (!lastRan) {
            func.apply(this, args);
            lastRan = Date.now();
        } else {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                if ((Date.now() - lastRan) >= delay) {
                    func.apply(this, args);
                    lastRan = Date.now();
                }
            }, delay - (Date.now() - lastRan));
        }
    };
}

/**
 * Debounce function to delay execution
 * @param {Function} func - Function to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} Debounced function
 */
export function debounce(func, delay) {
    let timeoutId;
    return function(...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
}

/**
 * Smooth scroll to element with offset
 * @param {HTMLElement} element - Target element
 * @param {number} offsetTop - Offset from top (default: 70)
 */
export function smoothScrollTo(element, offsetTop = 70) {
    if (!element) {
        console.warn('smoothScrollTo: element is null or undefined');
        return;
    }
    const targetPosition = element.offsetTop - offsetTop;
    window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
    });
}

/**
 * Check if user prefers reduced motion
 * @returns {boolean} True if reduced motion is preferred
 */
export function prefersReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Detect if device is mobile
 * @returns {boolean} True if mobile device
 */
export function isMobileDevice() {
    return window.innerWidth < 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

/**
 * Detect if device is low-end
 * @returns {boolean} True if low-end device
 */
export function isLowEndDevice() {
    const cores = navigator.hardwareConcurrency || 2;
    const memory = navigator.deviceMemory || 4;
    return cores <= 4 || memory <= 4;
}

/**
 * Safe querySelector with error handling
 * @param {string} selector - CSS selector
 * @param {HTMLElement} parent - Parent element (default: document)
 * @returns {HTMLElement|null} Found element or null
 */
export function safeQuerySelector(selector, parent = document) {
    try {
        return parent.querySelector(selector);
    } catch (error) {
        console.error(`Invalid selector: ${selector}`, error);
        return null;
    }
}

/**
 * Safe querySelectorAll with error handling
 * @param {string} selector - CSS selector
 * @param {HTMLElement} parent - Parent element (default: document)
 * @returns {NodeList} Found elements
 */
export function safeQuerySelectorAll(selector, parent = document) {
    try {
        return parent.querySelectorAll(selector);
    } catch (error) {
        console.error(`Invalid selector: ${selector}`, error);
        return [];
    }
}

/**
 * Load images with promises
 * @param {HTMLImageElement} img - Image element
 * @returns {Promise} Promise that resolves when image loads
 */
export function loadImage(img) {
    if (img.complete) return Promise.resolve();
    return new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
    });
}

/**
 * Wait for all resources to load
 * @returns {Promise} Promise that resolves when all resources are loaded
 */
export async function waitForResources() {
    const promises = [
        document.fonts.ready,
        ...Array.from(document.images).map(img => loadImage(img))
    ];

    try {
        await Promise.all(promises);
    } catch (error) {
        console.warn('Some resources failed to load:', error);
    }
}

/**
 * Sanitize text content to prevent XSS
 * @param {string} text - Text to sanitize
 * @returns {string} Sanitized text
 */
export function sanitizeText(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Create cleanup registry for event listeners
 * @returns {Object} Registry with add and cleanup methods
 */
export function createCleanupRegistry() {
    const cleanups = [];

    return {
        add(element, event, handler, options) {
            element.addEventListener(event, handler, options);
            cleanups.push(() => element.removeEventListener(event, handler, options));
        },
        cleanup() {
            cleanups.forEach(fn => fn());
            cleanups.length = 0;
        }
    };
}

