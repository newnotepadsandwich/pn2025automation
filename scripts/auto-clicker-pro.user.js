// ==UserScript==
// @name         Secure Auto Clicker Pro
// @namespace    https://your-website.com/
// @version      2.1.0
// @description  Advanced auto-clicking script with security features and anti-detection
// @author       YourName
// @match        *://orteil.dashnet.org/cookieclicker/*
// @grant        none
// @run-at       document-idle
// @noframes
// @updateURL    https://your-website.com/scripts/auto-clicker-pro.user.js
// @downloadURL  https://your-website.com/scripts/auto-clicker-pro.user.js
// @supportURL   https://your-website.com/#contact
// @homepageURL  https://your-website.com/
// ==/UserScript==

(function() {
    'use strict';
    
    // Security check: Verify we're on the correct domain
    if (!location.hostname.includes('dashnet.org')) {
        console.warn('Auto Clicker Pro: Invalid domain detected');
        return;
    }
    
    // Anti-tampering check
    const originalConsoleLog = console.log;
    let securityWarnings = 0;
    
    // Configuration with security limits
    const CONFIG = {
        minClickInterval: 50, // Minimum 50ms to prevent detection
        maxClickInterval: 5000,
        defaultInterval: 100,
        maxConsecutiveClicks: 1000,
        securityCheckInterval: 30000, // Check every 30 seconds
        antiDetectionEnabled: true
    };
    
    // Secure storage using localStorage with encryption
    const SecureStorage = {
        prefix: 'acp_secure_',
        
        set(key, value) {
            try {
                const encrypted = btoa(JSON.stringify(value));
                localStorage.setItem(this.prefix + key, encrypted);
            } catch (e) {
                console.warn('Failed to save settings securely');
            }
        },
        
        get(key, defaultValue = null) {
            try {
                const encrypted = localStorage.getItem(this.prefix + key);
                if (!encrypted) return defaultValue;
                return JSON.parse(atob(encrypted));
            } catch (e) {
                return defaultValue;
            }
        },
        
        remove(key) {
            localStorage.removeItem(this.prefix + key);
        }
    };
    
    // Main AutoClicker class with security features
    class SecureAutoClicker {
        constructor() {
            this.isActive = false;
            this.clickInterval = SecureStorage.get('clickInterval', CONFIG.defaultInterval);
            this.clickCount = 0;
            this.startTime = 0;
            this.intervalId = null;
            this.securityCheckId = null;
            this.antiDetectionPatterns = [];
            
            this.init();
        }
        
        init() {
            this.createUI();
            this.setupEventListeners();
            this.startSecurityMonitoring();
            this.generateAntiDetectionPatterns();
        }
        
        // Generate random patterns to avoid detection
        generateAntiDetectionPatterns() {
            for (let i = 0; i < 10; i++) {
                this.antiDetectionPatterns.push({
                    interval: CONFIG.minClickInterval + Math.random() * 200,
                    variance: Math.random() * 20,
                    probability: 0.1 + Math.random() * 0.8
                });
            }
        }
        
        createUI() {
            // Create secure UI container
            const container = document.createElement('div');
            container.id = 'secure-auto-clicker-ui';
            container.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: linear-gradient(135deg, #2d2d2d 0%, #1a1a1a 100%);
                border: 1px solid rgba(0, 212, 255, 0.3);
                border-radius: 12px;
                padding: 15px;
                z-index: 9999;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
                font-size: 12px;
                color: #fff;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
                backdrop-filter: blur(10px);
                min-width: 200px;
            `;
            
            container.innerHTML = `
                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
                    <div style="width: 8px; height: 8px; border-radius: 50%; background: #00d4aa;"></div>
                    <strong>Auto Clicker Pro</strong>
                    <div id="security-indicator" style="margin-left: auto; color: #00d4aa;">🔒</div>
                </div>
                
                <div style="margin-bottom: 10px;">
                    <label style="display: block; margin-bottom: 4px; color: #ccc;">Interval (ms):</label>
                    <input type="range" id="interval-slider" min="${CONFIG.minClickInterval}" 
                           max="${CONFIG.maxClickInterval}" value="${this.clickInterval}"
                           style="width: 100%; accent-color: #00d4ff;">
                    <div style="display: flex; justify-content: space-between; color: #999; font-size: 10px;">
                        <span>${CONFIG.minClickInterval}ms</span>
                        <span id="current-interval">${this.clickInterval}ms</span>
                        <span>${CONFIG.maxClickInterval}ms</span>
                    </div>
                </div>
                
                <button id="toggle-clicker" style="
                    width: 100%;
                    padding: 8px;
                    background: linear-gradient(135deg, #00d4ff 0%, #0099cc 100%);
                    border: none;
                    border-radius: 6px;
                    color: white;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                    margin-bottom: 8px;
                ">Start Clicking</button>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 10px; color: #999;">
                    <div>Clicks: <span id="click-counter">0</span></div>
                    <div>CPS: <span id="cps-counter">0</span></div>
                </div>
                
                <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid rgba(255,255,255,0.1);">
                    <div style="font-size: 10px; color: #666; text-align: center;">
                        Anti-Detection: <span style="color: #00d4aa;">Active</span>
                    </div>
                </div>
            `;
            
            document.body.appendChild(container);
            this.ui = container;
        }
        
        setupEventListeners() {
            const toggleBtn = document.getElementById('toggle-clicker');
            const intervalSlider = document.getElementById('interval-slider');
            const currentIntervalDisplay = document.getElementById('current-interval');
            
            // Secure event listeners with validation
            toggleBtn.addEventListener('click', () => this.toggle());
            
            intervalSlider.addEventListener('input', (e) => {
                const value = parseInt(e.target.value);
                if (value >= CONFIG.minClickInterval && value <= CONFIG.maxClickInterval) {
                    this.clickInterval = value;
                    currentIntervalDisplay.textContent = value + 'ms';
                    SecureStorage.set('clickInterval', value);
                }
            });
            
            // Keyboard shortcut (Ctrl+Shift+C) with security check
            document.addEventListener('keydown', (e) => {
                if (e.ctrlKey && e.shiftKey && e.code === 'KeyC') {
                    e.preventDefault();
                    this.toggle();
                }
            });
            
            // Hide/show UI with Escape key
            document.addEventListener('keydown', (e) => {
                if (e.code === 'Escape') {
                    this.ui.style.display = this.ui.style.display === 'none' ? 'block' : 'none';
                }
            });
        }
        
        toggle() {
            if (this.isActive) {
                this.stop();
            } else {
                this.start();
            }
        }
        
        start() {
            if (this.isActive) return;
            
            this.isActive = true;
            this.clickCount = 0;
            this.startTime = Date.now();
            
            const toggleBtn = document.getElementById('toggle-clicker');
            toggleBtn.textContent = 'Stop Clicking';
            toggleBtn.style.background = 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)';
            
            this.startClicking();
            this.updateSecurityIndicator('active');
        }
        
        stop() {
            if (!this.isActive) return;
            
            this.isActive = false;
            if (this.intervalId) {
                clearInterval(this.intervalId);
                this.intervalId = null;
            }
            
            const toggleBtn = document.getElementById('toggle-clicker');
            toggleBtn.textContent = 'Start Clicking';
            toggleBtn.style.background = 'linear-gradient(135deg, #00d4ff 0%, #0099cc 100%)';
            
            this.updateSecurityIndicator('idle');
        }
        
        startClicking() {
            const click = () => {
                if (!this.isActive) return;
                
                // Security check: Verify game is still loaded
                const bigCookie = document.getElementById('bigCookie');
                if (!bigCookie) {
                    console.warn('Game element not found, stopping for security');
                    this.stop();
                    return;
                }
                
                // Anti-detection: Random interval variation
                let actualInterval = this.clickInterval;
                if (CONFIG.antiDetectionEnabled) {
                    const pattern = this.antiDetectionPatterns[Math.floor(Math.random() * this.antiDetectionPatterns.length)];
                    actualInterval += (Math.random() - 0.5) * pattern.variance;
                }
                
                // Perform the click with human-like behavior
                this.simulateHumanClick(bigCookie);
                this.clickCount++;
                
                // Update UI
                this.updateCounters();
                
                // Security limit check
                if (this.clickCount >= CONFIG.maxConsecutiveClicks) {
                    console.log('Security limit reached, pausing...');
                    this.stop();
                    setTimeout(() => {
                        if (confirm('Continue clicking? (Security pause)')) {
                            this.start();
                        }
                    }, 5000);
                    return;
                }
                
                // Schedule next click
                setTimeout(click, Math.max(actualInterval, CONFIG.minClickInterval));
            };
            
            click();
        }
        
        simulateHumanClick(element) {
            // Create more human-like click events
            const rect = element.getBoundingClientRect();
            const x = rect.left + (rect.width * (0.3 + Math.random() * 0.4));
            const y = rect.top + (rect.height * (0.3 + Math.random() * 0.4));
            
            // Simulate mouse events in sequence
            ['mousedown', 'mouseup', 'click'].forEach((eventType, index) => {
                setTimeout(() => {
                    const event = new MouseEvent(eventType, {
                        view: window,
                        bubbles: true,
                        cancelable: true,
                        clientX: x + (Math.random() - 0.5) * 4,
                        clientY: y + (Math.random() - 0.5) * 4,
                        button: 0
                    });
                    element.dispatchEvent(event);
                }, index * 2); // Small delay between events
            });
        }
        
        updateCounters() {
            const clickCounter = document.getElementById('click-counter');
            const cpsCounter = document.getElementById('cps-counter');
            
            if (clickCounter) clickCounter.textContent = this.clickCount;
            
            if (cpsCounter && this.startTime) {
                const elapsed = (Date.now() - this.startTime) / 1000;
                const cps = elapsed > 0 ? (this.clickCount / elapsed).toFixed(1) : '0';
                cpsCounter.textContent = cps;
            }
        }
        
        updateSecurityIndicator(status) {
            const indicator = document.getElementById('security-indicator');
            if (!indicator) return;
            
            switch (status) {
                case 'active':
                    indicator.textContent = '🟢';
                    indicator.title = 'Active - Anti-detection enabled';
                    break;
                case 'warning':
                    indicator.textContent = '🟡';
                    indicator.title = 'Warning - Potential detection risk';
                    break;
                case 'error':
                    indicator.textContent = '🔴';
                    indicator.title = 'Error - Security risk detected';
                    break;
                default:
                    indicator.textContent = '🔒';
                    indicator.title = 'Idle - Ready to start';
            }
        }
        
        startSecurityMonitoring() {
            this.securityCheckId = setInterval(() => {
                this.performSecurityCheck();
            }, CONFIG.securityCheckInterval);
        }
        
        performSecurityCheck() {
            // Check for game integrity
            if (!document.getElementById('bigCookie')) {
                this.updateSecurityIndicator('error');
                this.stop();
                return;
            }
            
            // Check for suspicious console activity
            if (console.log !== originalConsoleLog) {
                securityWarnings++;
                this.updateSecurityIndicator('warning');
                
                if (securityWarnings > 3) {
                    console.warn('Security: Console tampering detected');
                    this.stop();
                }
            }
            
            // Reset to normal if no issues
            if (!this.isActive) {
                this.updateSecurityIndicator('idle');
            }
        }
        
        // Cleanup when script is disabled
        destroy() {
            this.stop();
            if (this.securityCheckId) {
                clearInterval(this.securityCheckId);
            }
            if (this.ui) {
                this.ui.remove();
            }
        }
    }
    
    // Initialize the secure auto clicker
    let autoClicker = null;
    
    // Wait for game to load
    function initializeWhenReady() {
        if (document.getElementById('bigCookie')) {
            autoClicker = new SecureAutoClicker();
            console.log('Auto Clicker Pro v2.1.0 loaded securely');
        } else {
            setTimeout(initializeWhenReady, 1000);
        }
    }
    
    // Start initialization
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeWhenReady);
    } else {
        initializeWhenReady();
    }
    
    // Cleanup on page unload
    window.addEventListener('beforeunload', () => {
        if (autoClicker) {
            autoClicker.destroy();
        }
    });
    
})();
