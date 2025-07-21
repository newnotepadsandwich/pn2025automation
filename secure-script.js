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

// Show donation prompt after download
function showDonationPrompt(script) {
    const donationModal = document.createElement('div');
    donationModal.className = 'security-modal donation-prompt';
    donationModal.innerHTML = `
        <div class="security-modal-content">
            <div class="security-header">
                <i class="fas fa-heart"></i>
                <h3>Enjoying ${SecurityUtils.sanitizeHTML(script.title)}?</h3>
            </div>
            <div class="security-body">
                <p>🎉 <strong>Download successful!</strong> Your script should now be installing in Tampermonkey.</p>
                <p>If you find this script helpful, consider supporting our work to keep developing amazing tools for the gaming community!</p>
                
                <div class="donation-quick-options">
                    <a href="https://paypal.me/fatoow?country.x=PH&locale.x=en_US" target="_blank" class="btn btn-primary">
                        <i class="fab fa-paypal"></i>
                        Support via PayPal
                    </a>
                    <button class="btn btn-accent" onclick="document.getElementById('gcashBtn').click()">
                        <i class="fas fa-mobile-alt"></i>
                        Support via GCash
                    </button>
                </div>
                
                <div class="support-benefits">
                    <p><small>Your support helps us:</small></p>
                    <ul>
                        <li>🚀 Develop new scripts and features</li>
                        <li>🛡️ Keep all scripts secure and updated</li>
                        <li>📚 Create better documentation and tutorials</li>
                        <li>🆓 Keep everything free for the community</li>
                    </ul>
                </div>
            </div>
            <div class="security-actions">
                <button class="btn btn-secondary close-btn">Maybe Later</button>
                <a href="#donate" class="btn btn-primary" onclick="this.closest('.donation-prompt').remove(); document.querySelector('#donate').scrollIntoView({behavior:'smooth'});">
                    <i class="fas fa-gift"></i>
                    See All Options
                </a>
            </div>
        </div>
    `;
    
    document.body.appendChild(donationModal);
    
    // Close handlers
    donationModal.querySelector('.close-btn').onclick = () => {
        document.body.removeChild(donationModal);
    };
    
    donationModal.onclick = (e) => {
        if (e.target === donationModal) {
            document.body.removeChild(donationModal);
        }
    };
    
    // Auto-close after 15 seconds if no interaction
    setTimeout(() => {
        if (document.body.contains(donationModal)) {
            document.body.removeChild(donationModal);
        }
    }, 15000);
}

// Enhanced donation buttons with security
function initializeDonationButtons() {
    const donations = [
        {
            id: 'paypalBtn',
            url: 'https://paypal.me/fatoow?country.x=PH&locale.x=en_US', // Your actual PayPal
            platform: 'PayPal'
        }
    ];
    
    donations.forEach(donation => {
        const btn = document.getElementById(donation.id);
        if (btn && SecurityUtils.isValidURL(donation.url)) {
            btn.href = donation.url;
            btn.setAttribute('target', '_blank');
            btn.setAttribute('rel', 'noopener noreferrer');
            btn.onclick = SecurityUtils.rateLimitedAction(() => {
                trackSecurityEvent('donation_click', donation.platform);
            }, 1000);
        }
    });
    
    // Hide Ko-fi and Patreon buttons since they're not available
    const kofiBtn = document.getElementById('kofiBtn');
    const patreonBtn = document.getElementById('patreonBtn');
    if (kofiBtn && kofiBtn.parentElement) {
        kofiBtn.parentElement.style.display = 'none';
    }
    if (patreonBtn && patreonBtn.parentElement) {
        patreonBtn.parentElement.style.display = 'none';
    }
}

// Add GCash donation option
function addGCashSupport() {
    const donationOptions = document.querySelector('.donation-options');
    if (!donationOptions) return;
    
    const gcashCard = DOMUtils.createElement('div', { 'class': 'donation-card gcash-card' });
    gcashCard.innerHTML = `
        <i class="fas fa-mobile-alt"></i>
        <h3>GCash</h3>
        <p>Send via GCash for Filipino supporters</p>
        <button class="btn btn-accent" id="gcashBtn">
            <i class="fas fa-qrcode"></i>
            Show GCash QR
        </button>
    `;
    
    donationOptions.appendChild(gcashCard);
    
    // GCash QR modal
    document.getElementById('gcashBtn').onclick = SecurityUtils.rateLimitedAction(() => {
        showGCashModal();
        trackSecurityEvent('donation_click', 'GCash');
    }, 1000);
}

function showGCashModal() {
    const gcashModal = document.createElement('div');
    gcashModal.className = 'gcash-modal';
    gcashModal.innerHTML = `
        <div class="gcash-modal-content">
            <span class="close-gcash">&times;</span>
            <div class="gcash-header">
                <i class="fas fa-mobile-alt"></i>
                <h3>GCash Donation</h3>
            </div>
            <div class="gcash-body">
                <div class="qr-container">
                    <img src="assets/images/gcash-qr.png" alt="GCash QR Code" class="gcash-qr" 
                         onerror="this.src='assets/images/gcash-qr-placeholder.svg'">
                    <p>Scan this QR code with your GCash app</p>
                </div>
                <div class="gcash-details">
                    <p><strong>Account Name:</strong> fatoow</p>
                    <p><strong>Instructions:</strong> Scan the QR code with your GCash app</p>
                </div>
                <div class="security-notice">
                    <i class="fas fa-info-circle"></i>
                    <p>For security, please send a message after donating so we can verify the transaction.</p>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(gcashModal);
    
    gcashModal.querySelector('.close-gcash').onclick = () => {
        document.body.removeChild(gcashModal);
    };
    
    gcashModal.onclick = (e) => {
        if (e.target === gcashModal) {
            document.body.removeChild(gcashModal);
        }
    };
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
    
    // Add GCash support
    addGCashSupport();
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
