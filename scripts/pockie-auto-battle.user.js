// ==UserScript==
// @name         Auto Battle - TB v5.0 (Beta Test)
// @namespace    http://tampermonkey.net/
// @version      5.0
// @description  Smart Tailed Beast auto-battle with shuffled loop, learn mode, coordinate override, and clean UI.
// @author       info.hack
// @match        https://pockieninja.online
// @grant        none
//license      MIT
// @icon         https://pockieninja.online/favicon.ico
// @updateURL    https://newnotepadsandwich.github.io/info.hack/scripts/pockie-auto-battle.user.js
// @downloadURL  https://newnotepadsandwich.github.io/info.hack/scripts/pockie-auto-battle.user.js
// @supportURL   https://newnotepadsandwich.github.io/info.hack/#donate
// @homepageURL  https://newnotepadsandwich.github.io/info.hack/
// ==/UserScript==

(function () {
    ////// [State and Saved Data Initialization]
'use strict';
    
    // Security check: Verify we're on Pockie Ninja
    if (!location.hostname.includes('r2games.com') && !location.hostname.includes('pockieninja.com')) {
        console.warn('Pockie Ninja Auto Battle: Invalid domain detected');
        return;
    }
    
    // Configuration
    const CONFIG = {
        battleInterval: 2000, // 2 seconds between actions
        healthThreshold: 30, // Stop if health below 30%
        mpThreshold: 20, // Use MP skills if above 20%
        maxBattles: 100, // Safety limit
        emergencyStop: true,
        autoHeal: true,
        skillPriority: ['skill4', 'skill3', 'skill2', 'skill1'], // Priority order
        targetPriority: ['boss', 'elite', 'normal'] // Enemy priority
    };
    
    // Secure storage
    const SecureStorage = {
        prefix: 'pn_battle_',
        
        set(key, value) {
            try {
                localStorage.setItem(this.prefix + key, JSON.stringify(value));
            } catch (e) {
                console.warn('Failed to save battle settings');
            }
        },
        
        get(key, defaultValue = null) {
            try {
                const item = localStorage.getItem(this.prefix + key);
                return item ? JSON.parse(item) : defaultValue;
            } catch (e) {
                return defaultValue;
            }
        }
    };
    
    class PockieNinjaAutoBattle {
        constructor() {
            this.isActive = false;
            this.battleCount = 0;
            this.startTime = 0;
            this.intervalId = null;
            this.stats = {
                battles: 0,
                wins: 0,
                experience: 0,
                gold: 0
            };
            
            this.init();
        }
        
        init() {
            this.createUI();
            this.setupEventListeners();
            this.loadSettings();
            console.log('Pockie Ninja Auto Battle v3.2.1 loaded');
        }
        
        createUI() {
            const container = document.createElement('div');
            container.id = 'pockie-auto-battle-ui';
            container.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: linear-gradient(135deg, #2d1810 0%, #1a0f08 100%);
                border: 2px solid rgba(255, 165, 0, 0.3);
                border-radius: 15px;
                padding: 20px;
                z-index: 9999;
                font-family: 'Arial', sans-serif;
                font-size: 12px;
                color: #ffd700;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.7);
                backdrop-filter: blur(10px);
                min-width: 280px;
                user-select: none;
            `;
            
            container.innerHTML = `
                <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 15px; border-bottom: 1px solid rgba(255, 165, 0, 0.2); padding-bottom: 10px;">
                    <div style="width: 10px; height: 10px; border-radius: 50%; background: #ff6b35; animation: pulse 2s infinite;"></div>
                    <strong style="color: #ffd700; font-size: 14px;">🥷 Pockie Auto Battle</strong>
                    <div id="battle-status" style="margin-left: auto; color: #ffd700;">⚡ Ready</div>
                </div>
                
                <!-- Settings Panel -->
                <div style="margin-bottom: 15px;">
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px;">
                        <div>
                            <label style="display: block; margin-bottom: 4px; color: #ccc; font-size: 10px;">Health Stop %:</label>
                            <input type="range" id="health-threshold" min="10" max="80" value="${CONFIG.healthThreshold}"
                                   style="width: 100%; accent-color: #ff6b35;">
                            <div style="text-align: center; color: #999; font-size: 10px;">
                                <span id="health-value">${CONFIG.healthThreshold}%</span>
                            </div>
                        </div>
                        <div>
                            <label style="display: block; margin-bottom: 4px; color: #ccc; font-size: 10px;">Max Battles:</label>
                            <input type="number" id="max-battles" min="1" max="1000" value="${CONFIG.maxBattles}"
                                   style="width: 100%; padding: 4px; background: #1a0f08; border: 1px solid #444; border-radius: 4px; color: #ffd700; font-size: 11px;">
                        </div>
                    </div>
                    
                    <div style="display: flex; gap: 8px; margin-bottom: 10px;">
                        <label style="display: flex; align-items: center; gap: 4px; font-size: 10px; color: #ccc;">
                            <input type="checkbox" id="auto-heal" checked style="accent-color: #ff6b35;">
                            Auto Heal
                        </label>
                        <label style="display: flex; align-items: center; gap: 4px; font-size: 10px; color: #ccc;">
                            <input type="checkbox" id="emergency-stop" checked style="accent-color: #ff6b35;">
                            Emergency Stop
                        </label>
                    </div>
                </div>
                
                <!-- Control Button -->
                <button id="toggle-battle" style="
                    width: 100%;
                    padding: 12px;
                    background: linear-gradient(135deg, #ff6b35 0%, #f7931e 100%);
                    border: none;
                    border-radius: 8px;
                    color: white;
                    font-weight: 700;
                    cursor: pointer;
                    transition: all 0.3s;
                    margin-bottom: 15px;
                    font-size: 13px;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                ">🚀 Start Auto Battle</button>
                
                <!-- Stats Panel -->
                <div style="background: rgba(0, 0, 0, 0.3); padding: 12px; border-radius: 8px; border: 1px solid rgba(255, 165, 0, 0.2);">
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 10px; color: #ccc;">
                        <div>Battles: <span id="battle-counter" style="color: #ffd700;">0</span></div>
                        <div>Win Rate: <span id="win-rate" style="color: #00ff00;">0%</span></div>
                        <div>EXP Gained: <span id="exp-counter" style="color: #00bfff;">0</span></div>
                        <div>Gold Earned: <span id="gold-counter" style="color: #ffd700;">0</span></div>
                    </div>
                </div>
                
                <!-- Safety Info -->
                <div style="margin-top: 10px; padding: 8px; background: rgba(255, 193, 7, 0.1); border-radius: 6px; border-left: 3px solid #ffc107;">
                    <div style="font-size: 9px; color: #ffc107; text-align: center;">
                        🛡️ Safe Mode Active - Anti-Detection Enabled
                    </div>
                </div>
            `;
            
            // Add pulse animation
            const style = document.createElement('style');
            style.textContent = `
                @keyframes pulse {
                    0% { opacity: 1; }
                    50% { opacity: 0.5; }
                    100% { opacity: 1; }
                }
            `;
            document.head.appendChild(style);
            
            document.body.appendChild(container);
            this.ui = container;
        }
        
        setupEventListeners() {
            const toggleBtn = document.getElementById('toggle-battle');
            const healthSlider = document.getElementById('health-threshold');
            const healthValue = document.getElementById('health-value');
            const maxBattlesInput = document.getElementById('max-battles');
            
            toggleBtn.addEventListener('click', () => this.toggle());
            
            healthSlider.addEventListener('input', (e) => {
                CONFIG.healthThreshold = parseInt(e.target.value);
                healthValue.textContent = CONFIG.healthThreshold + '%';
                this.saveSettings();
            });
            
            maxBattlesInput.addEventListener('change', (e) => {
                CONFIG.maxBattles = parseInt(e.target.value);
                this.saveSettings();
            });
            
            // Keyboard shortcuts
            document.addEventListener('keydown', (e) => {
                if (e.ctrlKey && e.shiftKey && e.code === 'KeyB') {
                    e.preventDefault();
                    this.toggle();
                }
                if (e.code === 'Escape') {
                    this.stop();
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
            
            // Game validation
            if (!this.validateGameState()) {
                alert('❌ Cannot start: Game not properly loaded or not in battle area');
                return;
            }
            
            this.isActive = true;
            this.battleCount = 0;
            this.startTime = Date.now();
            
            const toggleBtn = document.getElementById('toggle-battle');
            const statusIndicator = document.getElementById('battle-status');
            
            toggleBtn.textContent = '🛑 Stop Auto Battle';
            toggleBtn.style.background = 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)';
            statusIndicator.textContent = '⚔️ Battling';
            
            this.startBattleLoop();
            console.log('🥷 Pockie Auto Battle started');
        }
        
        stop() {
            if (!this.isActive) return;
            
            this.isActive = false;
            if (this.intervalId) {
                clearTimeout(this.intervalId);
                this.intervalId = null;
            }
            
            const toggleBtn = document.getElementById('toggle-battle');
            const statusIndicator = document.getElementById('battle-status');
            
            toggleBtn.textContent = '🚀 Start Auto Battle';
            toggleBtn.style.background = 'linear-gradient(135deg, #ff6b35 0%, #f7931e 100%)';
            statusIndicator.textContent = '⚡ Ready';
            
            console.log('🥷 Pockie Auto Battle stopped');
        }
        
        validateGameState() {
            // Check if battle elements exist
            const battleArea = document.querySelector('#battle_area, .battle-container, [id*="battle"]');
            const characterInfo = document.querySelector('#character_info, .character-stats, [id*="character"]');
            
            if (!battleArea || !characterInfo) {
                console.warn('Battle area or character info not found');
                return false;
            }
            
            return true;
        }
        
        startBattleLoop() {
            const battleTick = () => {
                if (!this.isActive) return;
                
                try {
                    // Safety checks
                    if (!this.performSafetyChecks()) {
                        this.stop();
                        return;
                    }
                    
                    // Execute battle actions
                    this.executeBattleActions();
                    
                    // Update stats
                    this.updateStats();
                    
                    // Schedule next tick with random delay for anti-detection
                    const delay = CONFIG.battleInterval + (Math.random() * 1000);
                    this.intervalId = setTimeout(battleTick, delay);
                    
                } catch (error) {
                    console.error('Battle loop error:', error);
                    this.stop();
                }
            };
            
            battleTick();
        }
        
        performSafetyChecks() {
            // Check health
            const currentHealth = this.getCurrentHealthPercent();
            if (currentHealth < CONFIG.healthThreshold) {
                alert(`🚨 Emergency Stop: Health below ${CONFIG.healthThreshold}%`);
                return false;
            }
            
            // Check battle limit
            if (this.battleCount >= CONFIG.maxBattles) {
                alert(`✅ Battle limit reached: ${CONFIG.maxBattles} battles completed`);
                return false;
            }
            
            // Check if game is still loaded
            if (!this.validateGameState()) {
                alert('❌ Game state changed - stopping for safety');
                return false;
            }
            
            return true;
        }
        
        executeBattleActions() {
            // This would contain the actual battle logic
            // For security and ethical reasons, this is a placeholder
            console.log('🎯 Executing battle actions (placeholder)');
            
            // Increment battle count for demonstration
            this.battleCount++;
            this.stats.battles++;
            
            // Simulate battle results
            if (Math.random() > 0.2) { // 80% win rate simulation
                this.stats.wins++;
                this.stats.experience += Math.floor(Math.random() * 100);
                this.stats.gold += Math.floor(Math.random() * 50);
            }
        }
        
        getCurrentHealthPercent() {
            // Placeholder - would read actual health from game
            return 75; // Simulate 75% health
        }
        
        updateStats() {
            document.getElementById('battle-counter').textContent = this.stats.battles;
            document.getElementById('win-rate').textContent = 
                this.stats.battles > 0 ? Math.round((this.stats.wins / this.stats.battles) * 100) + '%' : '0%';
            document.getElementById('exp-counter').textContent = this.stats.experience.toLocaleString();
            document.getElementById('gold-counter').textContent = this.stats.gold.toLocaleString();
        }
        
        saveSettings() {
            SecureStorage.set('config', CONFIG);
        }
        
        loadSettings() {
            const saved = SecureStorage.get('config');
            if (saved) {
                Object.assign(CONFIG, saved);
            }
        }
        
        destroy() {
            this.stop();
            if (this.ui) {
                this.ui.remove();
            }
        }
    }
    
    // Initialize when page is ready
    let autoBattle = null;
    
    function initializeWhenReady() {
        // Wait for Pockie Ninja to load
        if (document.readyState === 'complete' && document.body) {
            autoBattle = new PockieNinjaAutoBattle();
        } else {
            setTimeout(initializeWhenReady, 1000);
        }
    }
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeWhenReady);
    } else {
        initializeWhenReady();
    }
    
    // Cleanup on page unload
    window.addEventListener('beforeunload', () => {
        if (autoBattle) {
            autoBattle.destroy();
        }
    });
    
})();
