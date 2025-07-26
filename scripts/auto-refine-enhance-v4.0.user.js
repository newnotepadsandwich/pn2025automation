// ==UserScript==
// @name         Auto Refine, Enhance, Inscribe & Recast 4.0
// @namespace    http://tampermonkey.net/
// @version      4.0
// @description  Auto Reroll, Auto Enhance, and Auto Inscribe with UI Dropdown
// @author       Salty + fatoow
// @match        https://pockieninja.online/
// @grant        none
// ==/UserScript==

/*
═══════════════════════════════════════════════════════════════════════════════════════════════
⚔️ POCKIE NINJA AUTO REFINE, ENHANCE, INSCRIBE & RECAST 4.0
═══════════════════════════════════════════════════════════════════════════════════════════════

💎 PREMIUM FEATURES:
   🔥 Auto Refine - Smart stat detection with configurable requirements and ranges
   ✨ Auto Enhance - Continuous enhancement with Accept button automation
   🖋️ Auto Inscribe - Intelligent talisman selection based on current level
   ♻️ Auto Recast - Automated recasting with Accept confirmation
   
⚡ ADVANCED CAPABILITIES:
   🎯 Smart Stat Requirements - Set specific stat names with value ranges (e.g., "Agility +60-65")
   🚀 6-Speed Control System - From Very Slow to Ultra Fast processing
   🧠 Intelligent Logic - Pattern recognition, fail streak detection, auto-stopping
   🎛️ Mode Selection - Dropdown interface for seamless operation switching

🔧 STAT CONFIGURATION:
   Required Stats: Must have ALL of these stats (supports ranges)
   Optional Stats: Need at least 1 of these for auto-stop
   Example: "Stamina +50-60, Agility +45-55" for range requirements

💝 SUPPORT THE DEVELOPER:
   🎁 Ko-fi: https://ko-fi.com/fatoow
   💰 GCash: Send to newnotepadsandwich for Philippine users
   ⭐ Rate & Review: Help others discover this script!

🔗 COMMUNITY & UPDATES:
   📱 Discord: Join our Pockie Ninja community
   🌐 Website: Check for latest script updates
   📺 YouTube: Watch tutorials and demos

═══════════════════════════════════════════════════════════════════════════════════════════════
*/

(function() {
    'use strict';

    let isRunningRefine = false;
    let isRunningEnhance = false;
    let isRunningInscribe = false;
    let inscribeInterval;

    // Speed control variables
    let refineSpeed = 500; // Default 0.5 second
    let enhanceSpeed = 250; // Default 0.25 second

    // Stats configuration variables
    let requiredStats = ['Stamina', 'Agility', 'Dodge'];
    let optionalStats = ['Max Health', 'Max Health %', 'Const', 'Hit', 'Defense'];

    // Global reference to updateButtons function
    let updateButtons;

    function checkStats() {
        return new Promise(resolve => {
            let allStats = [];
            let itemContainer = document.querySelector("div.item-container div.item img.img__image");

            if (itemContainer) {
                let event = new Event('mouseover', { bubbles: true });
                itemContainer.dispatchEvent(event);
            }

            setTimeout(() => {
                let statDivs = document.querySelectorAll("div#tooltip div[style*='color: rgb(56, 142, 233);']");
                statDivs.forEach(div => {
                    let statText = div.innerText.trim();
                    if (statText && !statText.includes("Level") && !statText.includes("Required")) {
                        allStats.push(statText);
                    }
                });

                console.log("📜 Item Stats:", allStats);
                resolve(allStats);
            }, 500);
        });
    }

    function parseStatRequirement(statReq) {
        // Parse stat requirements like "Agility +60-65" or just "Agility"
        const rangeMatch = statReq.match(/^(.+?)\s*\+(\d+)-(\d+)$/);
        if (rangeMatch) {
            return {
                name: rangeMatch[1].trim(),
                minValue: parseInt(rangeMatch[2]),
                maxValue: parseInt(rangeMatch[3]),
                hasRange: true
            };
        }
        return {
            name: statReq.trim(),
            hasRange: false
        };
    }

    function checkStatValue(itemStat, requirement) {
        if (!requirement.hasRange) {
            // Simple name match for stats without range
            return itemStat.includes(requirement.name);
        }

        // Extract stat name and value from item stat (e.g., "Agility +62" or "Max Health +850")
        // More robust regex to handle various formats
        const statMatch = itemStat.match(/^(.+?)\s*\+\s*(\d+)/);
        if (!statMatch) {
            console.log(`⚠️ Could not parse stat format: "${itemStat}"`);
            return false;
        }

        const itemStatName = statMatch[1].trim();
        const itemStatValue = parseInt(statMatch[2]);

        console.log(`🔍 Checking: "${itemStatName}" (${itemStatValue}) vs requirement "${requirement.name}" (${requirement.minValue}-${requirement.maxValue})`);

        // Check if stat name matches and value is in range
        const nameMatches = itemStatName === requirement.name;
        const valueInRange = itemStatValue >= requirement.minValue && itemStatValue <= requirement.maxValue;

        if (nameMatches && valueInRange) {
            console.log(`✅ Match found: ${itemStatName} +${itemStatValue} is within range ${requirement.minValue}-${requirement.maxValue}`);
        } else if (nameMatches && !valueInRange) {
            console.log(`❌ Name matches but value ${itemStatValue} is outside range ${requirement.minValue}-${requirement.maxValue}`);
        }

        return nameMatches && valueInRange;
    }

    function reroll() {
        return new Promise(resolve => {
            let attemptButton = document.querySelector("#game-container > div.panel--original > div.themed_panel.theme__transparent--original > div > div:nth-child(2) > div > div.j-panel > div:nth-child(2) > div > div:nth-child(2) > button:nth-child(2)");

            if (attemptButton) {
                attemptButton.click();
                console.log("🔄 Clicked Attempt button!");

                setTimeout(() => {
                    let acceptButton = document.querySelector("#game-container > div:nth-child(6) > div.themed_panel.theme__transparent--original > div > div:nth-child(2) > button:nth-child(2)");
                    if (acceptButton) {
                        acceptButton.click();
                        console.log("✅ Clicked Accept button!");
                    }
                    resolve(true);
                }, 500);
            } else resolve(false);
        });
    }

    async function autoReroll() {
        console.log("🔄 Auto Reroll Started...");
        isRunningRefine = true;

        // Refresh buttons to show "Stop" button
        const dropdown = document.getElementById('modeDropdown');
        if (dropdown && dropdown.value === "refine" && window.updateButtons) {
            window.updateButtons();
        }

        console.log("🎯 Required Stats:", requiredStats);
        console.log("🎯 Optional Stats:", optionalStats);

        while (isRunningRefine) {
            let stats = await checkStats();

            // Parse requirements with potential ranges
            const parsedRequiredStats = requiredStats.map(parseStatRequirement);
            const parsedOptionalStats = optionalStats.map(parseStatRequirement);

            // Check if all required stats are present (with range validation)
            let hasRequired = parsedRequiredStats.every(requirement =>
                stats.some(itemStat => checkStatValue(itemStat, requirement))
            );

            // Count how many optional stats are present (with range validation)
            let optionalCount = parsedOptionalStats.filter(requirement =>
                stats.some(itemStat => checkStatValue(itemStat, requirement))
            ).length;

            if (hasRequired) {
                if (optionalCount >= 1) {
                    console.log("✅ Stats found (Required + 1+ Optional):", stats);
                    console.log(`📊 Optional stats found: ${optionalCount}`);
                    alert("🎉 Desired stats found! Auto reroll stopped.");
                    isRunningRefine = false;
                    // Refresh buttons when auto-stopped
                } else {
                    console.log("⚠️ All required stats found but no optional stats - continuing reroll...");
                }
            } else {
                let missingRequired = parsedRequiredStats.filter(requirement =>
                    !stats.some(itemStat => checkStatValue(itemStat, requirement))
                ).map(req => req.hasRange ? `${req.name} +${req.minValue}-${req.maxValue}` : req.name);
                console.log("❌ Missing required stats:", missingRequired, "- Rerolling again...");
            }

            await reroll();
            await new Promise(resolve => setTimeout(resolve, refineSpeed));
        }
    }

    function stopReroll() {
        console.log("🛑 Stopped Auto Reroll.");
        isRunningRefine = false;
        // Refresh buttons to update their state
        const dropdown = document.getElementById('modeDropdown');
        if (dropdown && dropdown.value === "refine" && window.updateButtons) {
            window.updateButtons();
        }
    }

    function autoClickEnhance() {
        if (!isRunningEnhance) return;

        let attemptButton = document.querySelector("#game-container > div.panel--original > div.themed_panel.theme__transparent--original > div > div:nth-child(2) > div > div.j-panel > div:nth-child(2) > div > div:nth-child(1) > button:nth-child(2)");
        let acceptButton = document.querySelector("#game-container > div:nth-child(6) > div.themed_panel.theme__transparent--original > div > div:nth-child(2) > button:nth-child(2)");

        if (attemptButton) attemptButton.click();
        setTimeout(() => { if (acceptButton) acceptButton.click(); }, enhanceSpeed);

        setTimeout(autoClickEnhance, enhanceSpeed);
    }

    function startEnhance() {
        isRunningEnhance = true;
        console.log("✨ Auto Enhance Started...");
        // Refresh buttons to show "Stop" button
        const dropdown = document.getElementById('modeDropdown');
        if (dropdown && dropdown.value === "enhance" && window.updateButtons) {
            window.updateButtons();
        }
        autoClickEnhance();
    }

    function stopEnhance() {
        isRunningEnhance = false;
        console.log("🛑 Stopped Auto Enhance.");
        // Refresh buttons to update their state
        const dropdown = document.getElementById('modeDropdown');
        if (dropdown && dropdown.value === "enhance" && window.updateButtons) {
            window.updateButtons();
        }
    }

    // Auto Inscribe ++

    let failStreak = 0;
    const maxFailStreak = 30;

    // ✅ Helper function: set input value
    function setInputValue(input, value) {
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
        nativeInputValueSetter.call(input, value);
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
    }

    // ✅ Helper function: select talisman based on level
    function setTalismanByLevel(currentLevel) {
        const lowRadio = document.querySelector("#game-container input[type=radio][name=bonus][value='0']");
        const highRadio = document.querySelector("#game-container input[type=radio][name=bonus][value='1']");
        const inputBox = document.querySelector("#game-container input[type=number]");

        if (!lowRadio || !highRadio || !inputBox) {
            console.log("⚠️ Cannot find talisman elements.");
            return;
        }

        if (currentLevel >= 0 && currentLevel <= 5) {
            lowRadio.click();
            setInputValue(inputBox, 1);
            console.log(`🎯 Set 1 Low Talisman for Level ${currentLevel}`);
        } else if (currentLevel === 6) {
            lowRadio.click();
            setInputValue(inputBox, 2);
            console.log(`🎯 Set 2 Low Talismans for Level ${currentLevel}`);
        } else if (currentLevel >= 7 && currentLevel <= 9) {
            highRadio.click();
            setInputValue(inputBox, 1);
            console.log(`🎯 Set 1 High Talisman for Level ${currentLevel}`);
        } else if (currentLevel >= 10) {
            highRadio.click();
            setInputValue(inputBox, 2);
            console.log(`🎯 Set 2 High Talismans for Level ${currentLevel}`);
        }
    }

    // ✅ Pattern recognition + main inscribe logic
    function autoInscribe() {
        if (!isRunningInscribe) return;

        const lvlElem = document.querySelector("#game-container > div:nth-child(4) > div:nth-child(3) > div > div:nth-child(2) > div:nth-child(3) > div.themed_panel.theme__transparent--original > div > div:nth-child(2) > div > div.j-panel > div:nth-child(2) > div > div:nth-child(3) > div > div:nth-child(2) > div:nth-child(2) > div:nth-child(2) > div:nth-child(1) > div:nth-child(2) > div:nth-child(1) > pre:nth-child(1)");
        if (lvlElem) {
            const lvlText = lvlElem.innerText.trim();
            const levelMatch = lvlText.match(/Current Lvl:\s*(\d+)/);
            if (levelMatch) {
                const currentLevel = parseInt(levelMatch[1]);
                console.log(`📊 Current inscription level: ${currentLevel}`);
                setTalismanByLevel(currentLevel);
            }
        }

        const inscribeButton = document.querySelector("#game-container > div:nth-child(4) > div:nth-child(3) > div > div:nth-child(2) > div:nth-child(3) > div.themed_panel.theme__transparent--original > div > div:nth-child(2) > div > div.j-panel > div:nth-child(2) > div > div:nth-child(3) > button");
        if (inscribeButton && inscribeButton.innerText.trim() === "Attempt") {
            inscribeButton.click();
            console.log("✍️ Clicked 'Attempt' button...");

            // Wait for inscribe result
            setTimeout(() => {
                const acceptBtn = document.querySelector("#game-container > div.panel--original > div.themed_panel.theme__transparent--original > div > div:nth-child(2) > button:nth-child(2)");
                if (acceptBtn && acceptBtn.innerText.trim() === "Accept") {
                    acceptBtn.click();
                    console.log("✅ Clicked 'Accept' button");
                    failStreak = 0; // Reset fail streak on any result
                } else {
                    failStreak++;
                    console.log(`❌ No Accept button found. Fail streak: ${failStreak}`);
                    
                    if (failStreak >= maxFailStreak) {
                        console.log(`🛑 Max fail streak (${maxFailStreak}) reached. Stopping auto inscribe.`);
                        stopInscribe();
                        return;
                    }
                }
            }, 1000);
        } else {
            console.log("❌ 'Attempt' button not found.");
        }

        // ✅ Delay Randomization (random 0.5 - 1.5 seconds)
        const randomDelay = 500 + Math.floor(Math.random() * 1500);
        clearInterval(inscribeInterval);
        inscribeInterval = setInterval(autoInscribe, randomDelay);
    }

    // ✅ Start auto inscribe
    function startInscribe() {
        if (isRunningInscribe) return;
        isRunningInscribe = true;
        console.log("🖋️ Auto Inscribe Started...");
        // Refresh buttons to show "Stop" button
        const dropdown = document.getElementById('modeDropdown');
        if (dropdown && dropdown.value === "inscribe" && window.updateButtons) {
            window.updateButtons();
        }
        failStreak = 0;
        autoInscribe(); // call first time directly
    }

    // ✅ Manual stop
    function stopInscribe() {
        isRunningInscribe = false;
        clearInterval(inscribeInterval);
        console.log("🛑 Stopped Auto Inscribe.");
        // Refresh buttons to update their state
        const dropdown = document.getElementById('modeDropdown');
        if (dropdown && dropdown.value === "inscribe" && window.updateButtons) {
            window.updateButtons();
        }
    }

    // Recast ----------

    let isRunningRecast = false;

    function autoRecast() {
        if (!isRunningRecast) return;

        const attemptButton = document.querySelector("#game-container > div:nth-child(4) > div:nth-child(3) > div > div:nth-child(2) > div:nth-child(3) > div.themed_panel.theme__transparent--original > div > div:nth-child(2) > div > div.j-panel > div:nth-child(2) > div > div:nth-child(2) > button");
        const acceptButton = document.querySelector("#game-container > div.panel--original > div.themed_panel.theme__transparent--original > div > div:nth-child(2) > button:nth-child(2)");

        if (attemptButton) {
            attemptButton.click();
            console.log("🔁 Clicked Recast 'Attempt'");

            setTimeout(() => {
                if (acceptButton) {
                    acceptButton.click();
                    console.log("✅ Clicked Recast 'Accept'");
                }
                setTimeout(autoRecast, enhanceSpeed);
            }, enhanceSpeed);
        } else {
            console.log("❌ Recast Attempt button not found.");
            setTimeout(autoRecast, 500); // try again if button not yet visible
        }
    }

    function startRecast() {
        if (isRunningRecast) return;
        isRunningRecast = true;
        console.log("♻️ Auto Recast Started...");
        // Refresh buttons to show "Stop" button
        const dropdown = document.getElementById('modeDropdown');
        if (dropdown && dropdown.value === "recast" && window.updateButtons) {
            window.updateButtons();
        }
        autoRecast();
    }

    function stopRecast() {
        isRunningRecast = false;
        console.log("🛑 Stopped Auto Recast.");
        // Refresh buttons to update their state
        const dropdown = document.getElementById('modeDropdown');
        if (dropdown && dropdown.value === "recast" && window.updateButtons) {
            window.updateButtons();
        }
    }

    function createUI() {
        const uiDiv = document.createElement("div");
        uiDiv.innerHTML = `
            <div id="autoRefineUI" style="position: fixed; bottom: 60px; right: 10px; background: rgba(0, 0, 0, 0.8); padding: 12px; z-index: 9999; border-radius: 8px; font-family: sans-serif; width: 125px;">
                <h4 style="color: #ffffff; text-align: center; margin-top: 0; margin-bottom: 10px;">Auto Refine & Enhance</h4>

                <!-- Speed Control Slider -->
                <div style="margin-bottom: 15px; padding: 8px; background: rgba(255,255,255,0.1); border-radius: 5px;">
                    <label style="color: #ffffff; font-size: 12px; display: block; margin-bottom: 5px;">
                        Speed: <span id="speedValue">Normal</span>
                    </label>
                    <input type="range" id="speedSlider" min="1" max="6" value="3" step="1"
                           style="width: 100%; height: 20px; background: #ddd; outline: none; border-radius: 10px;">
                    <div style="display: flex; justify-content: space-between; font-size: 10px; color: #ccc; margin-top: 2px;">
                        <span>Slow</span>
                        <span>Fast</span>
                    </div>
                </div>

                <!-- Mode Selection Dropdown -->
                <div style="margin-bottom: 15px;">
                    <select id="modeDropdown" style="width: 100%; padding: 5px; border-radius: 4px; border: 1px solid #ccc; background: white; font-size: 12px;">
                        <option value="refine">Refine</option>
                        <option value="enhance">Enhance</option>
                        <option value="inscribe">Inscribe</option>
                        <option value="recast">Recast</option>
                    </select>
                </div>

                <!-- Button Container -->
                <div id="buttonContainer" style="margin-bottom: 15px;"></div>

                <!-- Stats Configuration (only shown for Refine mode) -->
                <div id="statsConfig" style="margin-bottom: 15px; display: none;">
                    <div style="margin-bottom: 8px;">
                        <button id="setRequiredStats" class="auto-btn" style="font-size: 10px;">Set Required Stats</button>
                    </div>
                    <div style="margin-bottom: 8px;">
                        <button id="setOptionalStats" class="auto-btn" style="font-size: 10px;">Set Optional Stats</button>
                    </div>
                </div>
            </div>
            <style>
                .auto-btn {
                    width: 100%;
                    padding: 6px 10px;
                    border: none;
                    border-radius: 5px;
                    background-color: #007bff;
                    color: white;
                    font-size: 12px;
                    cursor: pointer;
                    transition: 0.2s ease-in-out;
                    margin-bottom: 8px;
                }
                .auto-btn:hover {
                    background-color: #339cff;
                }
                .auto-btn.active {
                    background-color: #dc3545;
                }
                .auto-btn.stop {
                    background-color: #dc3545;
                }
                .auto-btn.stop:hover {
                    background-color: #c82333;
                }
            </style>
        `;
        document.body.appendChild(uiDiv);

        const dropdown = document.getElementById('modeDropdown');
        const buttonContainer = document.getElementById('buttonContainer');
        const statsConfig = document.getElementById('statsConfig');
        const setRequiredStatsBtn = document.getElementById('setRequiredStats');
        const setOptionalStatsBtn = document.getElementById('setOptionalStats');

        // Set up prompt dialogs for stats configuration
        setRequiredStatsBtn.addEventListener('click', () => {
            const currentStats = requiredStats.join(', ');
            const newStats = prompt(
                'Enter required stats separated with a comma:\n\nExample: Stamina, Strength, Critical',
                currentStats
            );
            if (newStats !== null && newStats.trim() !== '') {
                requiredStats = newStats.split(',').map(s => s.trim()).filter(s => s.length > 0);
                console.log('Updated required stats:', requiredStats);
            }
        });

        setOptionalStatsBtn.addEventListener('click', () => {
            const currentStats = optionalStats.join(', ');
            const newStats = prompt(
                'Enter optional stats separated with a comma:\n\nExample: Max Health, Const, Hit, Defense',
                currentStats
            );
            if (newStats !== null && newStats.trim() !== '') {
                optionalStats = newStats.split(',').map(s => s.trim()).filter(s => s.length > 0);
                console.log('Updated optional stats:', optionalStats);
            }
        });

        // Speed slider functionality
        const speedSlider = document.getElementById('speedSlider');
        const speedValue = document.getElementById('speedValue');

        const speedSettings = {
            1: { refine: 1000, enhance: 500, label: 'Very Slow' },
            2: { refine: 800, enhance: 400, label: 'Slow' },
            3: { refine: 500, enhance: 250, label: 'Normal' },
            4: { refine: 300, enhance: 150, label: 'Fast' },
            5: { refine: 200, enhance: 100, label: 'Very Fast' },
            6: { refine: 100, enhance: 50, label: 'Ultra Fast' }
        };

        speedSlider.addEventListener('input', (e) => {
            const setting = speedSettings[e.target.value];
            refineSpeed = setting.refine;
            enhanceSpeed = setting.enhance;
            speedValue.textContent = setting.label;
        });

        function updateButtons() {
            buttonContainer.innerHTML = "";

            // Show/hide stats configuration based on mode
            if (dropdown.value === "refine") {
                statsConfig.style.display = "block";
            } else {
                statsConfig.style.display = "none";
            }

            if (dropdown.value === "refine") {
                if (isRunningRefine) {
                    createButton("Stop Refine", stopReroll, true);
                } else {
                    createButton("Start Refine", autoReroll);
                }
            } else if (dropdown.value === "enhance") {
                if (isRunningEnhance) {
                    createButton("Stop Enhance", stopEnhance, true);
                } else {
                    createButton("Start Enhance", startEnhance);
                }
            } else if (dropdown.value === "inscribe") {
                if (isRunningInscribe) {
                    createButton("Stop Inscribe", stopInscribe, true);
                } else {
                    createButton("Start Inscribe", startInscribe);
                }
            } else if (dropdown.value === "recast") {
                if (isRunningRecast) {
                    createButton("Stop Recast", stopRecast, true);
                } else {
                    createButton("Start Recast", startRecast);
                }
            }
        }

        // Make updateButtons accessible globally
        window.updateButtons = updateButtons;

        function createButton(text, onClick, isStop = false) {
            let button = document.createElement("button");
            button.innerText = text;
            button.className = isStop ? "auto-btn stop" : "auto-btn";
            button.addEventListener("click", onClick);
            buttonContainer.appendChild(button);
        }

        dropdown.addEventListener("change", updateButtons);
        updateButtons();
    }

    createUI();

})();
