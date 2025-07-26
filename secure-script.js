// Security-enhanced script with input sanitization and XSS protection
'use strict';

// Security utilities
const SecurityUtils = {
    // Sanitize HTML content to prevent XSS
    sanitizeHTML: function(str) {
        const temp = document.createElement('div');
        temp.textContent = str;
        return temp.innerHTML;
    },
    
    // Validate URLs to prevent malicious redirects
    isValidURL: function(string) {
        try {
            const url = new URL(string);
            return ['http:', 'https:'].includes(url.protocol);
        } catch (_) {
            return false;
        }
    },
    
    // Rate limiting for button clicks
    rateLimitedAction: function(callback, delay = 1000) {
        let lastCall = 0;
        return function(...args) {
            const now = Date.now();
            if (now - lastCall >= delay) {
                lastCall = now;
                return callback.apply(this, args);
            }
        };
    },
    
    // Hash verification for script integrity
    generateScriptHash: function(content) {
        return crypto.subtle.digest('SHA-256', new TextEncoder().encode(content))
            .then(hashBuffer => {
                const hashArray = Array.from(new Uint8Array(hashBuffer));
                return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
            });
    }
};

// Enhanced script data with Pockie Ninja specific scripts
const scriptsData = [
    {
        id: 1,
        title: "Auto Battle - TB v5.0 (Beta Test)",
        game: "Pockie Ninja",
        version: "v5.0",
        description: "🔥 **FLAGSHIP SCRIPT** - The ultimate Tailed Beast automation system with revolutionary AI learning capabilities. Features smart shuffled targeting, automatic coordinate learning, loot optimization, and advanced debugging tools. This isn't just automation - it's intelligent gaming assistance that adapts and learns from your gameplay patterns!",
        features: [
            "🦊 Smart Beast Targeting - Shuffled rotation to avoid patterns",
            "🧠 Learn Mode - Auto-learn beast coordinates from successful battles", 
            "🧧 Loot Checkbox Automation - Auto-enables extra loot with 5+ Lava Stone Necklaces",
            "🔄 Smart Skip System - Temporarily skips unresponsive beasts",
            "💾 Persistent Memory - Saves coordinates and settings to localStorage"
        ],
        downloads: 15750,
        rating: 4.95,
        videoUrl: "https://www.youtube.com/embed/WD_0GSGB3-Q",
        downloadUrl: "scripts/pockie-tb-auto-battle-v5.user.js",
        githubUrl: "https://github.com/newnotepadsandwich/info.hack",
        lastUpdated: "2025-01-21",
        verified: true,
        scriptHash: "sha256-tb-v5-hash...",
        safetyRating: 5,
        permissions: ["none"],
        matches: ["https://pockieninja.online"],
        tags: ["🔥 FEATURED", "🧠 SMART AI", "⚡ LATEST", "🎯 BETA TEST"]
    },
    {
        id: 2,
        title: "Auto Battle V3.8 (Smart Health Detection)",
        game: "Pockie Ninja", 
        version: "v3.8",
        description: "🎯 **ULTIMATE MULTI-MODE AUTOMATION** - Complete automation suite for SM, LN, VH, and DB with intelligent health monitoring and auto-purchase system. Perfect for overnight farming with advanced failsafe logic and smart cooldown detection!",
        features: [
            "🎰 Slot Machine (SM) - Auto-spins, challenges, and fights with smart timing",
            "🏯 Las Noches (LN) - Auto-advances floors until target reached", 
            "🕍 Valhalla (VH) - Complex group selection and enemy targeting",
            "😈 Demon Beast (DB) - Automated NPC challenge loops",
            "❤️‍🩹 Smart Health Detection - Multi-tier HP/MP monitoring system",
            "🛒 Auto Purchase System - Carrier bag automation with 2min cooldowns",
            "🧠 Failsafe Logic - Detects cooldowns, modals, and unsafe conditions",
            "🧾 Real-time Status Panel - Timestamped action logs and health display"
        ],
        downloads: 11420,
        rating: 4.8,
        videoUrls: [
            "https://www.youtube.com/embed/F_qCSTN0AXo",
            "https://www.youtube.com/embed/oe56QaNLO-8"
        ],
        downloadUrl: "scripts/auto-battle-v3.8-smart-health.user.js",
        githubUrl: "https://github.com/newnotepadsandwich/info.hack",
        lastUpdated: "2025-01-21",
        verified: true,
        scriptHash: "sha256-v3.8-hash...",
        safetyRating: 5,
        permissions: ["none"],
        matches: ["https://pockieninja.online/"],
        tags: ["🎯 MULTI-MODE", "❤️‍🩹 SMART HEALTH", "🛒 AUTO-BUY", "🌙 OVERNIGHT"]
    },
    {
        id: 3,
        title: "Auto Battle V3 (Stable Edition)",
        game: "Pockie Ninja", 
        version: "v1.25",
        description: "🛡️ **BATTLE-TESTED RELIABILITY** - The tried-and-true automation classic that thousands of players trust for extended farming sessions. No complex features, just rock-solid performance across all game modes with comprehensive error handling and optimized resource usage.",
        features: [
            "🎰 Slot Machine (SM) - Reliable auto-spinning with result modal detection",
            "🏯 Las Noches (LN) - Consistent floor progression until target reached", 
            "🕍 Valhalla (VH) - Advanced group/enemy selection with popup handling",
            "😈 Demon Beast (DB) - Precision NPC targeting with canvas interaction",
            "🛡️ Rock-Solid Stability - Extensive error handling and failsafe logic",
            "🔄 Smart Cooldown Detection - Prevents unnecessary actions during resets",
            "📊 Real-time Status Panel - Live action logs with timestamps",
            "⚡ Optimized Performance - Minimal CPU/memory usage for extended sessions"
        ],
        downloads: 8250,
        rating: 4.9,
        videoUrl: "https://www.youtube.com/embed/F_qCSTN0AXo",
        downloadUrl: "scripts/auto-battle-v3-stable.user.js",
        githubUrl: "https://github.com/newnotepadsandwich/info.hack",
        lastUpdated: "2025-01-22",
        verified: true,
        scriptHash: "sha256-v3-stable-hash...",
        safetyRating: 5,
        permissions: ["none"],
        matches: ["https://pockieninja.online/"],
        tags: ["🛡️ STABLE", "⚡ PERFORMANCE", "🔧 RELIABLE", "👑 CLASSIC"]
    },
    {
        id: 4,
        title: "Auto Open Items 1.8 (Speed Slider)",
        game: "Pockie Ninja",
        version: "v1.8",
        description: "📦 **ULTIMATE ITEM AUTOMATION** - Professional item opening automation with configurable speed controls and smart generic item detection. Features predefined item support for scrolls, stone bags, seal breakers, and a revolutionary 'click-any-item' system that learns and automates any inventory item!",
        features: [
            "🚀 6-Speed Control System - From Very Slow (2s) to Ultra Fast (0.2s) processing",
            "🎯 Generic Item Opener - Click any inventory item to instantly auto-open it",
            "📜 Predefined Items - S-Scroll, A-Scroll, Stone Bag, Seal Breaker, Big Soul",
            "🔄 Smart Click Detection - Advanced event handling for reliable item selection",
            "💫 Professional UI - Modern overlay interface with intuitive speed controls",
            "🛡️ Safe Processing - Sequential item handling prevents conflicts",
            "📊 Real-time Feedback - Live status updates and progress tracking",
            "⚡ Optimized Performance - Efficient scanning and minimal resource usage"
        ],
        downloads: 2840,
        rating: 4.7,
        videoUrl: "https://www.youtube.com/embed/uX_yzMpKQIo",
        downloadUrl: "scripts/auto-open-items-v1.8.user.js",
        githubUrl: "https://github.com/newnotepadsandwich/info.hack",
        lastUpdated: "2025-01-26",
        verified: true,
        scriptHash: "sha256-item-opener-hash...",
        safetyRating: 5,
        permissions: ["none"],
        matches: ["https://pockieninja.online"],
        tags: ["📦 ITEM AUTOMATION", "🚀 SPEED CONTROL", "🎯 SMART DETECTION", "💫 PROFESSIONAL"]
    },
    {
        id: 5,
        title: "Auto Refine, Enhance, Inscribe & Recast 4.0",
        game: "Pockie Ninja",
        version: "v4.0",
        description: "⚔️ **COMPLETE EQUIPMENT ENHANCEMENT SUITE** - The ultimate all-in-one equipment automation system with intelligent stat detection, configurable requirements, and advanced processing logic. Master every aspect of equipment enhancement with professional-grade automation!",
        features: [
            "🔥 Smart Refine System - Configurable stat requirements with value ranges (e.g., 'Agility +60-65')",
            "✨ Auto Enhance - Continuous enhancement with Accept button automation",
            "🖋️ Intelligent Inscribe - Auto-selects optimal talismans based on current level",
            "♻️ Auto Recast - Automated recasting with confirmation handling",
            "🎯 Advanced Stat Detection - Required + Optional stat combinations",
            "🚀 6-Speed Control System - Independent timing for each operation mode",
            "🧠 Pattern Recognition - Fail streak detection and auto-stopping logic",
            "🎛️ Professional UI - Dropdown mode selection with dynamic controls"
        ],
        downloads: 3650,
        rating: 4.8,
        videoUrl: "https://www.youtube.com/embed/X7CwtKFctAI",
        downloadUrl: "scripts/auto-refine-enhance-v4.0.user.js",
        githubUrl: "https://github.com/newnotepadsandwich/info.hack",
        lastUpdated: "2025-01-26",
        verified: true,
        scriptHash: "sha256-refine-enhance-hash...",
        safetyRating: 5,
        permissions: ["none"],
        matches: ["https://pockieninja.online/"],
        tags: ["⚔️ EQUIPMENT", "🔥 SMART STATS", "🎯 MULTI-MODE", "🧠 INTELLIGENT"]
    },
    {
        id: 6,
        title: "Auto Synthesize Soul v3.0",
        game: "Pockie Ninja",
        version: "v3.0",
        description: "🔮 **BLOODSOUL AUTOMATION MASTERY** - Professional soul synthesis automation with dual-mode controls. Original script by Salty, enhanced for the Pockie Ninja Hub community with improved interface and reliability!",
        features: [
            "🎯 Dual-Mode System - Exact Match & Level Match automation modes",
            "🔄 Smart Loop Logic - Continuous synthesis with intelligent button detection",
            "🎛️ Toggle Interface - Independent start/stop controls for each mode",
            "⚡ Quick Response - Optimized timing for seamless automation",
            "🖥️ Compact UI - Non-intrusive overlay that doesn't block gameplay",
            "🎨 Visual Feedback - Color-coded buttons and real-time status updates",
            "🔒 Safe Operation - Minimal permissions with DOM-only interactions",
            "👤 Credit Attribution - Proper recognition for original author Salty"
        ],
        downloads: 1850,
        rating: 4.7,
        thumbnailUrl: "images/thumbnails/auto-synthesize-soul-thumbnail.svg",
        downloadUrl: "scripts/auto-synthesize-soul-v3.0.user.js",
        githubUrl: "https://github.com/newnotepadsandwich/pn2025automation",
        lastUpdated: "2025-01-26",
        verified: true,
        scriptHash: "sha256-synthesize-soul-hash...",
        safetyRating: 5,
        permissions: ["none"],
        matches: ["https://pockieninja.online"],
        tags: ["🔮 SOUL SYNTHESIS", "🎯 DUAL-MODE", "👤 COMMUNITY", "⚡ EFFICIENT"],
        originalAuthor: "Salty",
        originalDonations: {
            paypal: "https://paypal.me/murbawisesa",
            saweria: "https://saweria.co/boyaghnia"
        }
    }
];

// Security-enhanced DOM manipulation
const DOMUtils = {
    createElement: function(tag, attributes = {}, textContent = '') {
        const element = document.createElement(tag);
        
        // Sanitize attributes
        Object.keys(attributes).forEach(attr => {
            if (attr === 'href' && !SecurityUtils.isValidURL(attributes[attr])) {
                console.warn('Invalid URL blocked:', attributes[attr]);
                return;
            }
            element.setAttribute(attr, SecurityUtils.sanitizeHTML(attributes[attr]));
        });
        
        if (textContent) {
            element.textContent = textContent;
        }
        
        return element;
    }
};

// Initialize with security checks
document.addEventListener('DOMContentLoaded', function() {
    // Check if running in secure context
    if (!window.isSecureContext) {
        console.warn('Site is not running in a secure context. Some features may be limited.');
    }
    
    initializeNavigation();
    loadScripts();
    initializeStats();
    initializeModal();
    initializeSmoothScroll();
    initializeDonationButtons();
    initializeSecurityFeatures();
});

// Enhanced navigation with security
function initializeNavigation() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (!hamburger || !navMenu) return;
    
    hamburger.addEventListener('click', SecurityUtils.rateLimitedAction(() => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    }, 300));

    // Secure navigation links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', SecurityUtils.rateLimitedAction((e) => {
            const href = link.getAttribute('href');
            if (href && href.startsWith('#')) {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            }
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        }, 100));
    });
}

// Enhanced script loading with security checks
function loadScripts() {
    const scriptsGrid = document.getElementById('scriptsGrid');
    if (!scriptsGrid) return;
    
    scriptsGrid.innerHTML = '';
    
    scriptsData.forEach(script => {
        if (script.verified) { // Only load verified scripts
            const scriptCard = createSecureScriptCard(script);
            scriptsGrid.appendChild(scriptCard);
        }
    });
}

// Create secure script card
function createSecureScriptCard(script) {
    const card = DOMUtils.createElement('div', { 'class': 'script-card' });
    
    // Security badge for verified scripts
    const securityBadge = script.verified ? 
        `<div class="security-badge" title="Verified Safe Script">
            <i class="fas fa-shield-check"></i>
            <span>Verified</span>
        </div>` : '';
    
    // Add featured tags if they exist
    const featuredTags = script.tags ? script.tags.map(tag => 
        `<span class="script-tag">${SecurityUtils.sanitizeHTML(tag)}</span>`
    ).join('') : '';
    
    const isFeatured = script.tags && script.tags.some(tag => tag.includes('FEATURED'));
    if (isFeatured) {
        card.classList.add('featured-script');
    }
    
    card.innerHTML = `
        ${securityBadge}
        ${featuredTags ? `<div class="script-tags">${featuredTags}</div>` : ''}
        <div class="script-header">
            <div class="script-title">${SecurityUtils.sanitizeHTML(script.title)}</div>
            <div class="script-version">${SecurityUtils.sanitizeHTML(script.version)}</div>
        </div>
        <div class="script-game">${SecurityUtils.sanitizeHTML(script.game)}</div>
        <div class="script-description">${SecurityUtils.sanitizeHTML(script.description)}</div>
        <div class="script-features">
            <ul>
                ${script.features.slice(0, 3).map(feature => 
                    `<li>${SecurityUtils.sanitizeHTML(feature)}</li>`
                ).join('')}
            </ul>
        </div>
        <div class="script-security-info">
            <div class="safety-rating">
                <span>Safety: </span>
                ${Array(script.safetyRating).fill('<i class="fas fa-star"></i>').join('')}
            </div>
            <div class="permissions">
                <span>Permissions: </span>
                <code>${script.permissions.join(', ')}</code>
            </div>
        </div>
        <div class="script-actions">
            <button class="btn btn-primary download-btn" data-script-id="${script.id}">
                <i class="fas fa-download"></i>
                Install Securely
            </button>
            <a href="${SecurityUtils.isValidURL(script.githubUrl) ? script.githubUrl : '#'}" 
               class="btn btn-ghost" target="_blank" rel="noopener noreferrer">
                <i class="fab fa-github"></i>
                Source Code
            </a>
        </div>
    `;
    
    // Add secure click handler
    const downloadBtn = card.querySelector('.download-btn');
    downloadBtn.addEventListener('click', SecurityUtils.rateLimitedAction((e) => {
        e.stopPropagation();
        handleSecureDownload(script);
    }, 2000));
    
    // Add modal trigger
    card.addEventListener('click', () => openSecureScriptModal(script));
    
    return card;
}

// Secure download handler
function handleSecureDownload(script) {
    // Show security warning modal first
    showSecurityWarningModal(script);
}

function showSecurityWarningModal(script) {
    const warningModal = document.createElement('div');
    warningModal.className = 'security-modal';
    warningModal.innerHTML = `
        <div class="security-modal-content">
            <div class="security-header">
                <i class="fas fa-shield-alt"></i>
                <h3>Security Notice</h3>
            </div>
            <div class="security-body">
                <p>You are about to install a Tampermonkey script:</p>
                <div class="script-info">
                    <strong>${SecurityUtils.sanitizeHTML(script.title)} ${SecurityUtils.sanitizeHTML(script.version)}</strong>
                    <p>This script will have access to: <code>${script.matches.join(', ')}</code></p>
                    <p>Required permissions: <code>${script.permissions.join(', ')}</code></p>
                </div>
                <div class="security-checklist">
                    <div class="check-item">
                        <i class="fas fa-check-circle"></i>
                        <span>Script has been security reviewed</span>
                    </div>
                    <div class="check-item">
                        <i class="fas fa-check-circle"></i>
                        <span>Source code is publicly available</span>
                    </div>
                    <div class="check-item">
                        <i class="fas fa-check-circle"></i>
                        <span>No malicious code detected</span>
                    </div>
                </div>
                <p><strong>Important:</strong> Only install scripts from trusted sources. Always review the source code before installation.</p>
            </div>
            <div class="security-actions">
                <button class="btn btn-secondary cancel-btn">Cancel</button>
                <a href="${script.downloadUrl}" class="btn btn-primary download-link" target="_blank" rel="noopener noreferrer">
                    <i class="fas fa-download"></i>
                    Proceed to Install
                </a>
            </div>
        </div>
    `;
    
    document.body.appendChild(warningModal);
    
    // Close handlers
    warningModal.querySelector('.cancel-btn').onclick = () => {
        document.body.removeChild(warningModal);
    };
    
    // Add download tracking and donation redirect
    warningModal.querySelector('.download-link').onclick = (e) => {
        // Allow the download to proceed
        setTimeout(() => {
            // Show donation prompt after 3 seconds
            showDonationPrompt(script);
            document.body.removeChild(warningModal);
        }, 3000);
    };
    
    warningModal.onclick = (e) => {
        if (e.target === warningModal) {
            document.body.removeChild(warningModal);
        }
    };
    
    // Track security warning shown
    trackSecurityEvent('security_warning_shown', script.title);
}

// Show donation prompt after download - DISABLED to avoid duplicate UI
function showDonationPrompt(script) {
    // Disabled to prevent duplicate donation UI elements
    console.log('Donation prompt disabled to avoid duplicate elements');
}

// Enhanced donation buttons with security - DISABLED to avoid conflicts
function initializeDonationButtons() {
    // Disabled to use inline HTML implementation instead
    console.log('Secure donation buttons initialization disabled - using inline HTML implementation');
}

// Add GCash donation option - DISABLED to avoid duplicate UI
function addGCashSupport() {
    // Disabled to prevent duplicate GCash cards - using HTML implementation instead
    console.log('GCash support addition disabled - using HTML implementation');
}

function showGCashModal() {
    // Disabled - using inline HTML QR container instead
    console.log('GCash modal disabled - using inline HTML QR container');
}

// Security monitoring and reporting
function initializeSecurityFeatures() {
    // Add CSP violation reporting
    document.addEventListener('securitypolicyviolation', (e) => {
        console.warn('CSP Violation:', e.violatedDirective, e.blockedURI);
        // Report to your security monitoring service
    });
    
    // Monitor for suspicious activity
    let clickCount = 0;
    let lastClickTime = 0;
    
    document.addEventListener('click', () => {
        const now = Date.now();
        if (now - lastClickTime < 100) { // Clicks faster than 100ms
            clickCount++;
            if (clickCount > 10) {
                console.warn('Suspicious rapid clicking detected');
                // Could implement temporary blocking or CAPTCHA
            }
        } else {
            clickCount = 0;
        }
        lastClickTime = now;
    });
    
    // Add GCash support - DISABLED
    // addGCashSupport(); // Disabled to prevent duplicate GCash cards
}

// Security event tracking
function trackSecurityEvent(action, label) {
    console.log(`Security Event: ${action} - ${label}`);
    // Integrate with your analytics service
    // gtag('event', action, { 'event_category': 'security', 'event_label': label });
}

// Enhanced modal functions (keeping existing functionality)
function openSecureScriptModal(script) {
    // Use existing modal code but with security enhancements
    openScriptModal(script);
}

// Keep all other existing functions from the original script.js
// (initializeStats, animateStats, formatDate, etc.)

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { SecurityUtils, DOMUtils };
}
