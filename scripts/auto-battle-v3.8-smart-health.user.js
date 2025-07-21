// ==UserScript==
// @name         Auto Battle V3.8 (Smart Health Detection)
// @namespace    http://tampermonkey.net/
// @version      3.8
// @description  Auto-click fight/challenge buttons for SM, LN, VH, and DB. Smart health detection using carrier bag capacity (like 64442/65000) with safe purchase intervals. Perfect for overnight farming!
// @author       fatOow x info.hack
// @match        https://pockieninja.online/
// @grant        none
// @updateURL    https://newnotepadsandwich.github.io/info.hack/scripts/auto-battle-v3.8-smart-health.user.js
// @downloadURL  https://newnotepadsandwich.github.io/info.hack/scripts/auto-battle-v3.8-smart-health.user.js
// @supportURL   https://newnotepadsandwich.github.io/info.hack/#donate
// @homepageURL  https://newnotepadsandwich.github.io/info.hack/
// ==/UserScript==

(function () {
    'use strict';

    const selectors = {
        sm: {
            imageButton: '#game-container > div.slot-machine__icon > button > img',
            challengeButton: '#game-container > div.slot-machine__container > button.image_button.--default.slot-machine__challenge-btn',
            fightButton: '#fightContainer > div.panel--original > div.themed_panel.theme__transparent--original > div > div:nth-child(2) > button:nth-child(3)',
            closeButton: '#fightResultModal button',
            // HP/MP health bar selectors based on your provided elements
            hpIcon: '#game-container > div:nth-child(7) > div:nth-child(2) > div:nth-child(1) > div > img:nth-child(8)',
            mpIcon: '#game-container > div:nth-child(7) > div:nth-child(2) > div:nth-child(1) > div > img:nth-child(7)',
            hpBar: '#game-container .hp-bar, #hp-value, .health-current, [class*="hp"]',
            mpBar: '#game-container .mp-bar, #mp-value, .mana-current, [class*="mp"]',
            hpText: '#game-container .hp-text, .health-text, [class*="hp-text"]',
            mpText: '#game-container .mp-text, .mana-text, [class*="mp-text"]'
        },
        carrierBag: {
            // Precise Carrier Bag selectors based on your provided DOM elements
            panelName: [
                '#game-container > div:nth-child(9) > div.panel__top_bar.moveable > div > b',
                '#game-container > div:nth-child(10) > div.panel__top_bar.moveable > div > b',
                '#game-container > div:nth-child(11) > div.panel__top_bar.moveable > div > b',
                '#game-container > div:nth-child(12) > div.panel__top_bar.moveable > div > b'
            ],
            carrierModal: '#game-container > div:nth-child(11)', // The main carrier bag container
            hpDropdown: '#game-container > div:nth-child(11) > div.themed_panel.theme__big1--original > div > div:nth-child(2) > div:nth-child(2) > div:nth-child(2) > div:nth-child(3) > div:nth-child(2) > select',
            mpDropdown: '#game-container > div:nth-child(11) > div.themed_panel.theme__big1--original > div > div:nth-child(2) > div:nth-child(2) > div:nth-child(2) > div:nth-child(7) > div:nth-child(2) > select',
            buyButton: '#game-container > div:nth-child(11) > div.themed_panel.theme__big1--original > div > div:nth-child(2) > div:nth-child(4) > div:nth-child(2) > button:nth-child(1)',
            acceptButton: '#game-container > div:nth-child(8) > div.themed_panel.theme__transparent--original > div > div:nth-child(2) > button:nth-child(2)',
            // Updated HP icon selector that opens Carrier Bag
            openButton: '#game-container > div:nth-child(6) > div:nth-child(2) > div:nth-child(1) > div > div > img:nth-child(8)'
        },
        ln: {
            nextButton: '#game-container > div.panel--original > div.themed_panel.theme__transparent--original > div > div:nth-child(2) > div:nth-child(4) > div:nth-child(2) > button:nth-child(1)',
            floorText: '#game-container > div.panel--original > div.themed_panel.theme__transparent--original > div > div:nth-child(2) > div:nth-child(3) > div:nth-child(2) > div:nth-child(1) > div:nth-child(2) > div:nth-child(1) > pre:nth-child(1)'
        },
        fightButton: '#fightContainer > div.panel--original > div.themed_panel.theme__transparent--original > div > div:nth-child(2) > button:nth-child(3)',
        db: {
            npc: ['#npc-container-10003', '#npc-container-10034', '#npc-container-10052', '#npc-container-10020', '#npc-container-10031', '#npc-container-10026', '#npc-container-10043', '#npc-container-10032', '#npc-container-10015'],
            challenge: '#game-container > div:nth-child(9) > div.themed_panel.theme__transparent--original > div > div:nth-child(2) > button:nth-child(2)'
        },
        resetDivStyle: 'background: rgb(250, 62, 62); border-radius: 10px; padding: 5px; transform: translateX(-50%);'
    };

    let smInterval = null;
    let healthMonitorInterval = null;
    let lnInterval = null;
    let vhInterval = null;
    let dbInterval = null;
    let smDelay = 1800;

    // Add state tracking for buttons
    let activeButtons = new Set();

    // HP/MP thresholds (configurable)
    let minHpPercent = 30; // Minimum HP percentage to fight
    let minMpPercent = 20; // Minimum MP percentage to fight
    let autoPurchaseEnabled = false; // Enable auto-purchase feature (shared for SM and LN)
    let purchaseAmount = 5000; // Default purchase amount

    // Purchase system variables
    let hpThreshold = 50; // HP threshold for auto-purchase
    let mpThreshold = 50; // MP threshold for auto-purchase
    let lastPurchaseTime = { hp: 0, mp: 0 }; // Cooldown tracking
    let purchaseCooldown = 120000; // 2 minutes between purchases (safer for overnight farming)

    // Helper function to find Carrier Bag panel (since it can appear at different positions)
    function findCarrierBagPanel() {
        const panelSelectors = Array.isArray(selectors.carrierBag.panelName)
            ? selectors.carrierBag.panelName
            : [selectors.carrierBag.panelName];

        for (const selector of panelSelectors) {
            const element = document.querySelector(selector);
            if (element && element.textContent.includes('Carrier Bag')) {
                return {
                    element: element,
                    selector: selector,
                    containerSelector: selector.split(' > div.panel__top_bar.moveable')[0]
                };
            }
        }
        return null;
    }

    const statusDiv = document.createElement('div');
    function setStatus(text) {
        const timestamp = new Date().toLocaleTimeString();
        statusDiv.textContent = `🕒 ${timestamp}\n${text}`;
    }

    // Enhanced health monitoring using HP icon title attribute (most reliable method)
    function getHealthFromHPIcon() {
        try {
            // Look for HP icon with title attribute containing health data
            const hpIcon = document.querySelector('img[src*="refill_hp.png"]');
            if (hpIcon && hpIcon.title) {
                const match = hpIcon.title.match(/(\d+)\s*\/\s*(\d+)/);
                if (match) {
                    const current = parseInt(match[1]);
                    const max = parseInt(match[2]);
                    const percentage = (current / max) * 100;
                    console.log(`HP from icon: ${current}/${max} (${percentage.toFixed(1)}%)`);
                    return percentage;
                }
            }
            return null;
        } catch (error) {
            console.warn('Get HP from icon error:', error);
            return null;
        }
    }

    // Enhanced MP monitoring using MP icon title attribute (most reliable method)
    function getHealthFromMPIcon() {
        try {
            // Look for MP icon with title attribute containing chakra data
            const mpIcon = document.querySelector('img[src*="refill_mp.png"]');
            if (mpIcon && mpIcon.title) {
                const match = mpIcon.title.match(/(\d+)\s*\/\s*(\d+)/);
                if (match) {
                    const current = parseInt(match[1]);
                    const max = parseInt(match[2]);
                    const percentage = (current / max) * 100;
                    console.log(`MP from icon: ${current}/${max} (${percentage.toFixed(1)}%)`);
                    return percentage;
                }
            }
            return null;
        } catch (error) {
            console.warn('Get MP from icon error:', error);
            return null;
        }
    }

    // Enhanced health monitoring using carrier bag capacity indicators
    function getHealthFromCarrierBag(type) {
        try {
            // Look for specific health text patterns first (more reliable)
            const allElements = document.querySelectorAll('*');

            for (const el of allElements) {
                const text = el.textContent;
                if (text && !el.querySelector('*')) { // Leaf node only
                    if (type === 'hp' && text.match(/HP.*?\d+\s*\/\s*\d+/i)) {
                        const match = text.match(/(\d+)\s*\/\s*(\d+)/);
                        if (match) {
                            const current = parseInt(match[1]);
                            const max = parseInt(match[2]);
                            const percentage = (current / max) * 100;
                            console.log(`HP from carrier bag text: ${current}/${max} (${percentage.toFixed(1)}%)`);
                            return percentage;
                        }
                    }
                    if (type === 'mp' && text.match(/MP.*?\d+\s*\/\s*\d+/i)) {
                        const match = text.match(/(\d+)\s*\/\s*(\d+)/);
                        if (match) {
                            const current = parseInt(match[1]);
                            const max = parseInt(match[2]);
                            const percentage = (current / max) * 100;
                            console.log(`MP from carrier bag text: ${current}/${max} (${percentage.toFixed(1)}%)`);
                            return percentage;
                        }
                    }
                }
            }

            // Fallback: Look for clean number patterns (avoid the dropdown contamination)
            const capacityPatterns = [];
            for (const el of allElements) {
                const text = el.textContent;
                if (text && !el.querySelector('*') && !el.closest('select')) { // Exclude dropdown options
                    const match = text.match(/^(\d{4,6})\s*\/\s*(\d{4,6})$/);
                    if (match) {
                        const current = parseInt(match[1]);
                        const max = parseInt(match[2]);
                        const percentage = (current / max) * 100;
                        capacityPatterns.push({
                            element: el,
                            current: current,
                            max: max,
                            percentage: percentage,
                            pattern: text
                        });
                    }
                }
            }

            console.log(`Found ${capacityPatterns.length} clean capacity patterns:`, capacityPatterns.map(p => p.pattern));

            if (capacityPatterns.length === 0) return null;

            // Strategy: Use position-based detection (first pattern for HP, second for MP)
            if (capacityPatterns.length >= 2) {
                const targetIndex = type === 'hp' ? 0 : 1;
                const targetPattern = capacityPatterns[targetIndex];
                console.log(`${type.toUpperCase()} from carrier bag position ${targetIndex}: ${targetPattern.current}/${targetPattern.max} (${targetPattern.percentage.toFixed(1)}%)`);
                return targetPattern.percentage;
            }

            // Single pattern fallback
            if (capacityPatterns.length === 1) {
                const pattern = capacityPatterns[0];
                console.log(`Single ${type.toUpperCase()} pattern: ${pattern.current}/${pattern.max} (${pattern.percentage.toFixed(1)}%)`);
                return pattern.percentage;
            }

            return null;
        } catch (error) {
            console.warn(`Get ${type} from carrier bag error:`, error);
            return null;
        }
    }

    // Enhanced health monitoring and auto-purchase function
    function getHealthPercentage(type) {
        try {
            // First try to get HP from icon title (most reliable)
            if (type === 'hp') {
                const iconHealth = getHealthFromHPIcon();
                if (iconHealth !== null) return iconHealth;
            }

            // First try to get MP from icon title (most reliable)
            if (type === 'mp') {
                const iconHealth = getHealthFromMPIcon();
                if (iconHealth !== null) return iconHealth;
            }

            // Second try to get health from carrier bag capacity (more accurate)
            const carrierBagHealth = getHealthFromCarrierBag(type);
            if (carrierBagHealth) return carrierBagHealth;

            // Fallback to original method
            const elements = type === 'hp'
                ? document.querySelectorAll('[class*="hp"], [class*="health"], #hp, .hp, .health')
                : document.querySelectorAll('[class*="mp"], [class*="mana"], [class*="chakra"], #mp, .mp, .mana, .chakra');

            for (const el of elements) {
                const text = el.textContent || el.innerText || '';
                const match = text.match(/(\d+)\s*\/\s*(\d+)/);
                if (match) {
                    const current = parseInt(match[1]);
                    const max = parseInt(match[2]);
                    const percentage = (current / max) * 100;
                    console.log(`${type.toUpperCase()} from fallback: ${current}/${max} (${percentage.toFixed(1)}%)`);
                    return percentage;
                }
            }
            return null;
        } catch (error) {
            console.warn(`Get ${type} percentage error:`, error);
            return null;
        }
    }

    // Function to check HP/MP levels
    function checkHealthStatus() {
        try {
            // Try different selectors to find HP/MP values
            const hpElements = [
                ...document.querySelectorAll(selectors.sm.hpBar),
                ...document.querySelectorAll(selectors.sm.hpText),
                ...document.querySelectorAll('[class*="hp"], [class*="health"]'),
                ...document.querySelectorAll('#hp, .hp, .health')
            ];

            const mpElements = [
                ...document.querySelectorAll(selectors.sm.mpBar),
                ...document.querySelectorAll(selectors.sm.mpText),
                ...document.querySelectorAll('[class*="mp"], [class*="mana"]'),
                ...document.querySelectorAll('#mp, .mp, .mana')
            ];

            let hpPercent = null;
            let mpPercent = null;

            // Try to extract HP percentage
            for (const el of hpElements) {
                const text = el.textContent || el.innerText || '';
                const match = text.match(/(\d+)\s*\/\s*(\d+)/);
                if (match) {
                    const current = parseInt(match[1]);
                    const max = parseInt(match[2]);
                    hpPercent = (current / max) * 100;
                    break;
                }
            }

            // Try to extract MP percentage
            for (const el of mpElements) {
                const text = el.textContent || el.innerText || '';
                const match = text.match(/(\d+)\s*\/\s*(\d+)/);
                if (match) {
                    const current = parseInt(match[1]);
                    const max = parseInt(match[2]);
                    mpPercent = (current / max) * 100;
                    break;
                }
            }

            return {
                hp: hpPercent,
                mp: mpPercent,
                canFight: (hpPercent === null || hpPercent >= minHpPercent) &&
                         (mpPercent === null || mpPercent >= minMpPercent)
            };
        } catch (error) {
            console.warn('Health check error:', error);
            return { hp: null, mp: null, canFight: true }; // Default to allow fighting if can't determine
        }
    }

    // Function to automatically open Carrier Bag by clicking HP icon
    async function openCarrierBag() {
        try {
            setStatus(`SM: Opening Carrier Bag... 🏪`);

            // Try multiple possible HP icon selectors (based on your provided elements)
            const possibleHpIconSelectors = [
                '#game-container > div:nth-child(6) > div:nth-child(2) > div:nth-child(1) > div > div > img:nth-child(8)',
                '#game-container > div:nth-child(7) > div:nth-child(2) > div:nth-child(1) > div > div > img:nth-child(8)',
                '#game-container > div:nth-child(5) > div:nth-child(2) > div:nth-child(1) > div > div > img:nth-child(8)',
                'img[src*="refill_hp.png"]',
                'img[title*="/"]',
                '#game-container > div:nth-child(6) > div:nth-child(2) > div:nth-child(1) > div > img:nth-child(8)',
                '#game-container > div:nth-child(7) > div:nth-child(2) > div:nth-child(1) > div > img:nth-child(8)'
            ];

            let hpIcon = null;
            let usedSelector = '';

            // Try to find HP icon with any of the selectors
            for (const selector of possibleHpIconSelectors) {
                const element = document.querySelector(selector);
                if (element) {
                    hpIcon = element;
                    usedSelector = selector;
                    break;
                }
            }

            if (!hpIcon) {
                console.error('HP icon not found with any selector');
                setStatus(`SM: HP icon not found ❌`);
                return false;
            }

            // Try clicking the HP icon
            console.log(`Attempting to click HP icon: ${usedSelector}`);
            hpIcon.click();

            // Also try triggering mouse events in case click() doesn't work
            hpIcon.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
            hpIcon.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
            hpIcon.dispatchEvent(new MouseEvent('click', { bubbles: true }));

            console.log('Clicked HP icon to open Carrier Bag');
            setStatus(`SM: Clicked HP icon, waiting... ⏳`);

            // Wait longer for Carrier Bag to open
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Check if Carrier Bag opened successfully
            const carrierBagPanel = findCarrierBagPanel();
            if (carrierBagPanel) {
                console.log('Carrier Bag opened successfully');
                setStatus(`SM: Carrier Bag opened ✅`);
                return true;
            } else {
                console.log('Carrier Bag failed to open');
                setStatus(`SM: Carrier Bag failed to open ❌`);
                return false;
            }

        } catch (error) {
            console.error('Open Carrier Bag error:', error);
            setStatus(`SM: Failed to open Carrier Bag ❌`);
            return false;
        }
    }

    // Monitor health and trigger purchases when needed
    async function monitorHealthAndPurchase() {
        try {
            if (!autoPurchaseEnabled) return;

            const hpPercent = getHealthPercentage('hp');
            const mpPercent = getHealthPercentage('mp');

            // Show current health status (always update UI for testing purposes)
            if (hpPercent !== null || mpPercent !== null) {
                console.log(`Health Status: HP ${hpPercent !== null ? hpPercent.toFixed(1) + '%' : 'N/A'}, MP ${mpPercent !== null ? mpPercent.toFixed(1) + '%' : 'N/A'}`);
            } else {
                console.log('Health Status: Unable to detect HP/MP');
            }

            // Check if we need HP purchase
            if (hpPercent !== null && hpPercent <= hpThreshold) {
                const now = Date.now();
                if (now - lastPurchaseTime.hp >= purchaseCooldown) {
                    console.log(`HP low (${hpPercent.toFixed(1)}%), attempting purchase...`);
                    const success = await attemptPurchase('hp');
                    if (success) lastPurchaseTime.hp = now;
                    return; // Exit to allow UI to update
                } else {
                    console.log(`HP low but on cooldown (${((purchaseCooldown - (now - lastPurchaseTime.hp)) / 1000).toFixed(0)}s remaining)`);
                }
            }

            // Check if we need MP purchase
            if (mpPercent !== null && mpPercent <= mpThreshold) {
                const now = Date.now();
                if (now - lastPurchaseTime.mp >= purchaseCooldown) {
                    console.log(`MP low (${mpPercent.toFixed(1)}%), attempting purchase...`);
                    const success = await attemptPurchase('mp');
                    if (success) lastPurchaseTime.mp = now;
                    return; // Exit to allow UI to update
                } else {
                    console.log(`MP low but on cooldown (${((purchaseCooldown - (now - lastPurchaseTime.mp)) / 1000).toFixed(0)}s remaining)`);
                }
            }

        } catch (error) {
            console.error('Health monitoring error:', error);
        }
    }

    // Function to close Carrier Bag after purchase
    async function closeCarrierBag() {
        try {
            const possibleCloseSelectors = [
                '#game-container > div:nth-child(11) .close',
                '#game-container > div:nth-child(11) .close-btn',
                '#game-container > div:nth-child(11) button:contains("Close")',
                '#game-container > div:nth-child(11) button:contains("X")',
                '#game-container > div:nth-child(11) .x-button',
                '#game-container > div:nth-child(11) [title="Close"]'
            ];

            for (const selector of possibleCloseSelectors) {
                const closeBtn = document.querySelector(selector);
                if (closeBtn) {
                    closeBtn.click();
                    console.log(`Closed Carrier Bag using selector: ${selector}`);
                    return true;
                }
            }

            // Fallback: try ESC key
            document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));

            return false;
        } catch (error) {
            console.warn('Close Carrier Bag error:', error);
            return false;
        }
    }

    // Function to close Carrier Bag when both HP/MP are full (no purchase needed)
    async function closeCarrierBagIfFull() {
        try {
            // Check if Carrier Bag is open
            const carrierBagPanel = findCarrierBagPanel();
            if (!carrierBagPanel) return false;

            console.log('Carrier Bag is open, checking if health is full...');

            // Get current HP and MP levels
            const hpPercent = getHealthPercentage('hp');
            const mpPercent = getHealthPercentage('mp');

            // Consider full if above 90% or if we can't detect health (assume full)
            const hpFull = hpPercent === null || hpPercent >= 90;
            const mpFull = mpPercent === null || mpPercent >= 90;

            console.log(`HP: ${hpPercent}% (full: ${hpFull}), MP: ${mpPercent}% (full: ${mpFull})`);

            // If both HP and MP are full (or we can't detect them), close the Carrier Bag
            if (hpFull && mpFull) {
                console.log('Both HP and MP are full, closing Carrier Bag...');
                const closed = await closeCarrierBag();
                if (closed) {
                    setStatus(`SM: Closed full Carrier Bag 🏪✅`);
                    return true;
                }
            }

            return false; // Health not full, keep Carrier Bag open

        } catch (error) {
            console.warn('Close full Carrier Bag error:', error);
            return false;
        }
    }

    // Auto-purchase HP/MP from Carrier Bag with precise selectors
    async function attemptPurchase(type) {
        try {
            setStatus(`SM: Attempting to buy ${type.toUpperCase()} 💳`);

            // Check if Carrier Bag modal is open by looking for the panel name
            const carrierBagPanel = findCarrierBagPanel();
            if (!carrierBagPanel) {
                console.log('Carrier Bag not open, attempting to open...');
                const opened = await openCarrierBag();
                if (!opened) return false;

                // Re-check after opening
                const newCarrierBagPanel = findCarrierBagPanel();
                if (!newCarrierBagPanel) {
                    console.error('Failed to open Carrier Bag for purchase');
                    return false;
                }
            }

            console.log(`Using Carrier Bag at: ${carrierBagPanel.selector}`);
            const containerSelector = carrierBagPanel.containerSelector;

            // Get the appropriate dropdown based on type (using dynamic container)
            const hpDropdownSelector = `${containerSelector} > div.themed_panel.theme__big1--original > div > div:nth-child(2) > div:nth-child(2) > div:nth-child(2) > div:nth-child(3) > div:nth-child(2) > select`;
            const mpDropdownSelector = `${containerSelector} > div.themed_panel.theme__big1--original > div > div:nth-child(2) > div:nth-child(2) > div:nth-child(2) > div:nth-child(7) > div:nth-child(2) > select`;

            const dropdown = type === 'hp'
                ? document.querySelector(hpDropdownSelector)
                : document.querySelector(mpDropdownSelector);

            if (!dropdown) {
                console.error(`${type.toUpperCase()} dropdown not found`);
                setStatus(`SM: ${type.toUpperCase()} dropdown not found ❌`);
                return false;
            }

            // Check if dropdown is disabled (bag is full)
            if (dropdown.disabled) {
                console.log(`${type.toUpperCase()} dropdown is disabled (bag may be full)`);
                setStatus(`SM: ${type.toUpperCase()} bag full ❌`);
                return false;
            }

            // Find the desired purchase amount option (must be > 0)
            let selectedOption = null;

            // First try to find the exact amount we want
            for (const option of dropdown.options) {
                if (parseInt(option.value) === purchaseAmount && parseInt(option.value) > 0) {
                    selectedOption = option;
                    break;
                }
            }

            // If exact amount not found, use the largest available non-zero option
            if (!selectedOption) {
                for (const option of dropdown.options) {
                    const value = parseInt(option.value);
                    if (value > 0 && (!selectedOption || value > parseInt(selectedOption.value))) {
                        selectedOption = option;
                    }
                }
            }

            // Select the option and ensure it's not 0
            const selectedValue = parseInt(selectedOption.value);
            if (selectedValue <= 0) {
                console.log(`No valid ${type.toUpperCase()} purchase options available`);
                setStatus(`SM: No ${type.toUpperCase()} options ❌`);
                return false;
            }

            // Actually select the option in the dropdown
            dropdown.value = selectedOption.value;
            selectedOption.selected = true;

            // Trigger change event to update UI
            dropdown.dispatchEvent(new Event('change', { bubbles: true }));
            dropdown.dispatchEvent(new Event('input', { bubbles: true }));

            setStatus(`SM: Selected ${selectedValue} ${type.toUpperCase()} 📋`);

            // Wait for UI to update and Buy button to become enabled
            await new Promise(resolve => setTimeout(resolve, 800));

            // Click Buy button (check if it's enabled first)
            const buyBtnSelector = `${containerSelector} > div.themed_panel.theme__big1--original > div > div:nth-child(2) > div:nth-child(4) > div:nth-child(2) > button:nth-child(1)`;
            const buyBtn = document.querySelector(buyBtnSelector);
            if (!buyBtn) {
                console.error('Buy button not found');
                setStatus(`SM: Buy button not found ❌`);
                return false;
            }

            // Check if Buy button is disabled
            if (buyBtn.disabled || buyBtn.classList.contains('disabled')) {
                console.log('Buy button is disabled');
                setStatus(`SM: Buy button disabled ❌`);
                return false;
            }

            buyBtn.click();
            setStatus(`SM: Clicked Buy button 💰`);

            // Wait for confirmation dialog
            await new Promise(resolve => setTimeout(resolve, 800));

            // Click Accept button in confirmation dialog (try multiple possible positions)
            let acceptBtn = null;
            const possibleAcceptSelectors = [
                '#game-container > div:nth-child(8) > div.themed_panel.theme__transparent--original > div > div:nth-child(2) > button:nth-child(2)',
                '#game-container > div:nth-child(9) > div.themed_panel.theme__transparent--original > div > div:nth-child(2) > button:nth-child(2)',
                '#game-container > div:nth-child(10) > div.themed_panel.theme__transparent--original > div > div:nth-child(2) > button:nth-child(2)',
                '#game-container > div:nth-child(7) > div.themed_panel.theme__transparent--original > div > div:nth-child(2) > button:nth-child(2)',
                'button:contains("Accept")',
                'button:contains("确定")',
                '.themed_panel button[style*="color: rgb(255, 255, 255)"]'
            ];

            for (const selector of possibleAcceptSelectors) {
                const element = document.querySelector(selector);
                if (element) {
                    acceptBtn = element;
                    break;
                }
            }

            if (acceptBtn) {
                acceptBtn.click();
                setStatus(`SM: Accepted purchase ✅`);
                await new Promise(resolve => setTimeout(resolve, 500));
            } else {
                console.warn('Accept button not found, purchase may not complete');
                setStatus(`SM: Accept button not found ⚠️`);
            }

            setStatus(`SM: ${type.toUpperCase()} purchased successfully! 🎉`);

            // Close Carrier Bag to keep interface clean
            await new Promise(resolve => setTimeout(resolve, 500));
            await closeCarrierBag();

            return true;

        } catch (error) {
            console.error(`Purchase ${type} error:`, error);
            setStatus(`SM: ${type.toUpperCase()} purchase failed ❌`);
            return false;
        }
    }

    let challengeClicked = false;
    let isProcessingPurchase = false; // Add flag to prevent multiple purchase attempts

    async function checkAndClickSM() {
        try {
            const closeBtn = document.querySelector(selectors.sm.closeButton);
            if (closeBtn) {
                closeBtn.click();
                challengeClicked = false;
                setStatus('SM: Closed result modal 🎰');
                return;
            }

            const redDiv = [...document.querySelectorAll('div')].find(div => div.getAttribute('style') === selectors.resetDivStyle);
            if (redDiv) {
                setStatus('SM: Cooldown active ⏳');
                return;
            }

            // PRIORITY 0: Close Carrier Bag if both HP/MP are full (cleanup unnecessary open bags)
            if (!isProcessingPurchase) {
                const bagClosed = await closeCarrierBagIfFull();
                if (bagClosed) return; // If we closed the bag, skip other actions this cycle
            }

            // PRIORITY 1: Check health BEFORE any battle actions
            if (!isProcessingPurchase) {
                const hpPercent = getHealthPercentage('hp');
                const mpPercent = getHealthPercentage('mp');

                // If auto-purchase is enabled and health is low, attempt purchase
                if (autoPurchaseEnabled) {
                    if (hpPercent !== null && hpPercent <= hpThreshold) {
                        const now = Date.now();
                        if (now - lastPurchaseTime.hp >= purchaseCooldown) {
                            isProcessingPurchase = true;
                            setStatus(`SM: HP low (${hpPercent.toFixed(1)}%), buying... 💊`);
                            const success = await attemptPurchase('hp');
                            if (success) lastPurchaseTime.hp = now;
                            isProcessingPurchase = false;
                            return; // Exit to allow UI to update
                        }
                    }

                    if (mpPercent !== null && mpPercent <= mpThreshold) {
                        const now = Date.now();
                        if (now - lastPurchaseTime.mp >= purchaseCooldown) {
                            isProcessingPurchase = true;
                            setStatus(`SM: MP low (${mpPercent.toFixed(1)}%), buying... 💊`);
                            const success = await attemptPurchase('mp');
                            if (success) lastPurchaseTime.mp = now;
                            isProcessingPurchase = false;
                            return; // Exit to allow UI to update
                        }
                    }
                }

                // Check if health is adequate to continue fighting
                const canFight = (hpPercent === null || hpPercent >= minHpPercent) &&
                               (mpPercent === null || mpPercent >= minMpPercent);

                if (!canFight) {
                    setStatus(`SM: Health too low - HP:${hpPercent ? hpPercent.toFixed(1) : 'N/A'}% MP:${mpPercent ? mpPercent.toFixed(1) : 'N/A'}% ❤️‍🩹`);
                    return; // Don't proceed with fighting
                }
            }

            // PRIORITY 2: Proceed with battle actions only if health is adequate
            const fightButton = document.querySelector(selectors.sm.fightButton);
            if (fightButton) {
                fightButton.click();
                setStatus('SM: Fight clicked ⚔️');
                return;
            }

            const challengeButton = document.querySelector(selectors.sm.challengeButton);
            if (challengeButton && !challengeClicked) {
                challengeButton.click();
                challengeClicked = true;
                setStatus('SM: Challenge clicked 🎯');
                return;
            }

            const imageButton = document.querySelector(selectors.sm.imageButton);
            if (imageButton && !fightButton && !challengeButton) {
                imageButton.click();
                setStatus('SM: Slot clicked 🎰');
            } else {
                setStatus('SM: Waiting... ⏳');
            }
        } catch (error) {
            console.error('SM Error:', error);
            setStatus('SM: Error occurred ❌');
            isProcessingPurchase = false; // Reset flag on error
        }
    }

    let lnFloor = null;
    let lnNextClicked = false;
    let lnIsProcessingPurchase = false; // Add flag to prevent multiple purchase attempts for LN

    async function checkAndClickLN() {
        try {
            if (!lnFloor) return;

            const redDiv = [...document.querySelectorAll('div')].find(div => div.getAttribute('style') === selectors.resetDivStyle);
            if (redDiv) {
                setStatus('LN: Cooldown active ⏳');
                return;
            }

            // Check if target floor is reached
            const floorTextElem = document.querySelector(selectors.ln.floorText);
            if (floorTextElem && floorTextElem.innerText.includes(lnFloor)) {
                setStatus(`LN: Target floor ${lnFloor} reached! 🎯`);
                stopLN();
                return;
            }

            // PRIORITY 0: Close Carrier Bag if both HP/MP are full (cleanup unnecessary open bags)
            if (!lnIsProcessingPurchase) {
                const bagClosed = await closeCarrierBagIfFull();
                if (bagClosed) return; // If we closed the bag, skip other actions this cycle
            }

            // PRIORITY 1: Check health BEFORE any battle actions (if LN auto-purchase enabled)
            if (!lnIsProcessingPurchase && autoPurchaseEnabled) {
                const hpPercent = getHealthPercentage('hp');
                const mpPercent = getHealthPercentage('mp');

                // If auto-purchase is enabled and health is low, attempt purchase
                if (hpPercent !== null && hpPercent <= hpThreshold) {
                    const now = Date.now();
                    if (now - lastPurchaseTime.hp >= purchaseCooldown) {
                        lnIsProcessingPurchase = true;
                        setStatus(`LN: HP low (${hpPercent.toFixed(1)}%), buying... 💊`);
                        const success = await attemptPurchase('hp');
                        if (success) lastPurchaseTime.hp = now;
                        lnIsProcessingPurchase = false;
                        return; // Exit to allow UI to update
                    }
                }

                if (mpPercent !== null && mpPercent <= mpThreshold) {
                    const now = Date.now();
                    if (now - lastPurchaseTime.mp >= purchaseCooldown) {
                        lnIsProcessingPurchase = true;
                        setStatus(`LN: MP low (${mpPercent.toFixed(1)}%), buying... 💊`);
                        const success = await attemptPurchase('mp');
                        if (success) lastPurchaseTime.mp = now;
                        lnIsProcessingPurchase = false;
                        return; // Exit to allow UI to update
                    }
                }

                // Check if health is adequate to continue fighting
                const canFight = (hpPercent === null || hpPercent >= minHpPercent) &&
                               (mpPercent === null || mpPercent >= minMpPercent);

                if (!canFight) {
                    setStatus(`LN: Health too low - HP:${hpPercent ? hpPercent.toFixed(1) : 'N/A'}% MP:${mpPercent ? mpPercent.toFixed(1) : 'N/A'}% ❤️‍🩹`);
                    return; // Don't proceed with fighting
                }
            }

            // PRIORITY 2: Proceed with LN logic only if health is adequate
            const fightButton = document.querySelector(selectors.fightButton);
            if (fightButton) {
                fightButton.click();
                setStatus(`LN: Fight clicked ⚔️`);
                return;
            }

            if (!lnNextClicked) {
                const nextButton = document.querySelector(selectors.ln.nextButton);
                if (nextButton) {
                    nextButton.click();
                    lnNextClicked = true;
                    setStatus(`LN: Next clicked 🏯`);
                }
            } else {
                setStatus(`LN: Waiting... ⏳`);
            }
        } catch (error) {
            console.error('LN Error:', error);
            setStatus('LN: Error occurred ❌');
            lnIsProcessingPurchase = false; // Reset processing flag on error
        }
    }

    function stopLN() {
        clearInterval(lnInterval);
        lnInterval = null;
        lnFloor = null;
        lnNextClicked = false;
        lnIsProcessingPurchase = false; // Reset processing flag
    }

    function startVHLogic() {
        let lastClickedButton = null;

        function vhCycle() {
            try {
                const redDiv = [...document.querySelectorAll('div')].find(div => div.getAttribute('style') === selectors.resetDivStyle);
                if (redDiv) {
                    setStatus('VH: Cooldown active ⏳');
                    return;
                }

                const closeBtn = document.querySelector('#fightResultModal button');
                if (closeBtn) {
                    closeBtn.click();
                    setStatus('VH: Closed result modal 🕍');
                    return;
                }

                const fightButton = document.querySelector(selectors.fightButton);
                if (fightButton) {
                    fightButton.click();
                    setStatus('VH: Fight clicked ⚔️');
                    return;
                }

                const groupButtons = [...document.querySelectorAll('#game-container button')].filter(btn => {
                    const text = btn.textContent.trim();
                    return text.startsWith('Group ') && !btn.disabled;
                });

                if (groupButtons.length > 0) {
                    const nextButton = groupButtons.find(btn => btn !== lastClickedButton) || groupButtons[0];
                    nextButton.click();
                    lastClickedButton = nextButton;
                    setStatus(`VH: ${nextButton.textContent.trim()} clicked 🕍`);
                } else {
                    setStatus('VH: Waiting... ⏳');
                }
            } catch (error) {
                console.error('VH Error:', error);
                setStatus('VH: Error occurred ❌');
            }
        }

        return setInterval(vhCycle, 500);
    }

    function startDBLogic() {
        let step = 0;
        function clickCanvasCenter(npcSelector) {
            const canvas = document.querySelector('canvas');
            if (canvas) {
                canvas.dispatchEvent(new MouseEvent('click', {
                    bubbles: true,
                    clientX: canvas.width / 2,
                    clientY: canvas.height / 2
                }));
            }
        }
        function dbCycle() {
            try {
                const redDiv = [...document.querySelectorAll('div')].find(div => div.getAttribute('style') === selectors.resetDivStyle);
                if (redDiv) {
                    setStatus('DB: Cooldown active ⏳');
                    return;
                }

                const closeBtn = document.querySelector('#fightResultModal button');
                if (closeBtn) {
                    closeBtn.click();
                    setStatus('DB: Closed result modal 😈');
                    return;
                }

                const fightButton = document.querySelector(selectors.fightButton);
                if (fightButton) {
                    fightButton.click();
                    setStatus('DB: Fight clicked ⚔️');
                    return;
                }

                const challengeBtn = document.querySelector(selectors.db.challenge);
                if (challengeBtn) {
                    challengeBtn.click();
                    setStatus('DB: Challenge clicked 😈');
                    return;
                }

                const npcSelector = selectors.db.npc[step % selectors.db.npc.length];
                const npcBtn = document.querySelector(npcSelector);
                if (npcBtn) {
                    clickCanvasCenter();
                    setTimeout(() => {
                        if (npcBtn) npcBtn.click();
                    }, 100);
                    step++;
                    setStatus(`DB: NPC ${step} clicked 😈`);
                } else {
                    setStatus('DB: Waiting... ⏳');
                }
            } catch (error) {
                console.error('DB Error:', error);
                setStatus('DB: Error occurred ❌');
            }
        }
        return setInterval(dbCycle, 500);
    }

    function createToggleButton(label, startFn, stopFn, id) {
        const button = document.createElement('button');
        button.id = id;
        button.textContent = label;
        Object.assign(button.style, {
            padding: '6px 0', width: '100%', backgroundColor: '#007bff',
            color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer',
            fontSize: '12px', marginTop: '4px'
        });
        button.addEventListener('click', () => {
            if (activeButtons.has(id)) {
                activeButtons.delete(id);
                button.style.backgroundColor = '#007bff';
                button.textContent = label;
                stopFn();
            } else {
                activeButtons.add(id);
                button.style.backgroundColor = '#dc3545';
                button.textContent = label.replace('Start', 'Stop');
                startFn();
            }
        });
        return button;
    }

    function createUIContainer() {
        const container = document.createElement('div');
        Object.assign(container.style, {
            position: 'fixed', top: 'calc(30%)', right: '2px', transform: 'translateY(-50%)',
            width: '130px', padding: '6px', border: '2px solid #444', borderRadius: '8px',
            backgroundColor: 'rgba(0, 0, 0, 0.7)', color: 'white', fontFamily: 'Arial, sans-serif',
            fontSize: '13px', zIndex: '9999', textAlign: 'center', userSelect: 'none'
        });

        const label = document.createElement('div');
        label.textContent = 'Auto Battle';
        label.style.marginBottom = '6px';
        label.style.fontWeight = 'bold';
        container.appendChild(label);

        // HP/MP Configuration Section
        const healthConfig = document.createElement('div');
        healthConfig.style.marginBottom = '6px';
        healthConfig.style.fontSize = '11px';
        healthConfig.style.padding = '4px';
        healthConfig.style.backgroundColor = 'rgba(255,255,255,0.1)';
        healthConfig.style.borderRadius = '4px';

        healthConfig.innerHTML = `
            <div id="healthModeLabel" style="margin-bottom: 2px;">Health Management:</div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 2px;">
                <span>Min HP:</span>
                <input type="number" id="minHpInput" value="${minHpPercent}" min="0" max="100"
                       style="width: 40px; font-size: 10px; padding: 1px;">
                <span>%</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 2px;">
                <span>Min MP:</span>
                <input type="number" id="minMpInput" value="${minMpPercent}" min="0" max="100"
                       style="width: 40px; font-size: 10px; padding: 1px;">
                <span>%</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 2px;">
                <span>Auto Buy:</span>
                <input type="checkbox" id="autoPurchaseToggle" ${autoPurchaseEnabled ? 'checked' : ''}
                       style="transform: scale(0.8);">
            </div>
            <div style="display: flex; justify-content: space-between;">
                <span>Amount:</span>
                <select id="purchaseAmountSelect" style="width: 50px; font-size: 10px;">
                    <option value="5000" ${purchaseAmount === 5000 ? 'selected' : ''}>5k</option>
                    <option value="10000" ${purchaseAmount === 10000 ? 'selected' : ''}>10k</option>
                    <option value="20000" ${purchaseAmount === 20000 ? 'selected' : ''}>20k</option>
                    <option value="30000" ${purchaseAmount === 30000 ? 'selected' : ''}>30k</option>
                    <option value="40000" ${purchaseAmount === 40000 ? 'selected' : ''}>40k</option>
                    <option value="50000" ${purchaseAmount === 50000 ? 'selected' : ''}>50k</option>
                    <option value="60000" ${purchaseAmount === 60000 ? 'selected' : ''}>60k</option>
                    <option value="65000" ${purchaseAmount === 65000 ? 'selected' : ''}>65k</option>
                </select>
            </div>
        `;
        container.appendChild(healthConfig);

        // Add event listeners for threshold changes
        setTimeout(() => {
            const minHpInput = document.getElementById('minHpInput');
            const minMpInput = document.getElementById('minMpInput');
            const autoPurchaseToggle = document.getElementById('autoPurchaseToggle');
            const purchaseAmountSelect = document.getElementById('purchaseAmountSelect');

            if (minHpInput) minHpInput.addEventListener('change', (e) => {
                minHpPercent = parseInt(e.target.value);
                updateHealthModeLabel();
            });
            if (minMpInput) minMpInput.addEventListener('change', (e) => {
                minMpPercent = parseInt(e.target.value);
                updateHealthModeLabel();
            });
            if (autoPurchaseToggle) autoPurchaseToggle.addEventListener('change', (e) => {
                autoPurchaseEnabled = e.target.checked;
                updateHealthModeLabel();
            });
            if (purchaseAmountSelect) purchaseAmountSelect.addEventListener('change', (e) => {
                purchaseAmount = parseInt(e.target.value);
                updateHealthModeLabel();
            });
        }, 100);

        // Function to update health mode label dynamically
        function updateHealthModeLabel() {
            const label = document.getElementById('healthModeLabel');
            if (label) {
                if (autoPurchaseEnabled) {
                    label.textContent = `Auto-Buy (${purchaseAmount/1000}k):`;
                    label.style.color = '#28a745';
                } else {
                    label.textContent = 'Health Management:';
                    label.style.color = '#ffc107';
                }
            }
        }

        Object.assign(statusDiv.style, {
            marginTop: '6px', fontSize: '11px', color: '#ccc', textAlign: 'center', whiteSpace: 'pre-line'
        });
        setStatus('Idle 💤');

        container.appendChild(createToggleButton('Start SM',
            () => {
                smInterval = setInterval(checkAndClickSM, smDelay);
                healthMonitorInterval = setInterval(monitorHealthAndPurchase, 3000);
            },
            () => {
                clearInterval(smInterval);
                clearInterval(healthMonitorInterval);
                smInterval = null;
                healthMonitorInterval = null;
                challengeClicked = false;
                isProcessingPurchase = false;
            }, 'smToggle'));

        // Add manual health test button for debugging
        const testHealthBtn = document.createElement('button');
        testHealthBtn.textContent = '🩺 Test Health';
        Object.assign(testHealthBtn.style, {
            padding: '4px 0', width: '100%', backgroundColor: '#28a745',
            color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer',
            fontSize: '11px', marginTop: '2px'
        });
        testHealthBtn.addEventListener('click', async () => {
            const hpPercent = getHealthPercentage('hp');
            const mpPercent = getHealthPercentage('mp');
            setStatus(`Test: HP ${hpPercent !== null ? hpPercent.toFixed(1) + '%' : 'N/A'} MP ${mpPercent !== null ? mpPercent.toFixed(1) + '%' : 'N/A'} 🩺`);

            if (autoPurchaseEnabled) {
                console.log('Testing auto-purchase system...');
                await monitorHealthAndPurchase();
            }
        });
        container.appendChild(testHealthBtn);

        container.appendChild(createToggleButton('Start LN', () => {
            const floor = prompt('Enter target floor:');
            if (floor) {
                lnFloor = floor;
                lnInterval = setInterval(checkAndClickLN, 1000);
                lnNextClicked = false;
            }
        }, () => stopLN(), 'lnToggle'));

        container.appendChild(createToggleButton('Start VH',
            () => vhInterval = startVHLogic(),
            () => {
                clearInterval(vhInterval);
                vhInterval = null;
            }, 'vhToggle'));

        container.appendChild(createToggleButton('Start DB',
            () => dbInterval = startDBLogic(),
            () => {
                clearInterval(dbInterval);
                dbInterval = null;
            }, 'dbToggle'));

        container.appendChild(statusDiv);
        document.body.appendChild(container);
    }

    window.addEventListener('load', createUIContainer);

    // Cleanup intervals when page unloads
    window.addEventListener('beforeunload', () => {
        [smInterval, lnInterval, vhInterval, dbInterval].forEach(interval => {
            if (interval) clearInterval(interval);
        });
    });
})();
