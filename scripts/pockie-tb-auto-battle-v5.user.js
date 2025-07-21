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
// @updateURL    https://newnotepadsandwich.github.io/info.hack/scripts/pockie-tb-auto-battle-v5.user.js
// @downloadURL  https://newnotepadsandwich.github.io/info.hack/scripts/pockie-tb-auto-battle-v5.user.js
// @supportURL   https://newnotepadsandwich.github.io/info.hack/#donate
// @homepageURL  https://newnotepadsandwich.github.io/info.hack/
// ==/UserScript==

(function () {
    ////// [State and Saved Data Initialization]
'use strict';

    let autoBattleTB = false;
    let currentBeastIndex = 0;
    let beastFailCounts = {}; // Track failed attempts per beast
    let tbRetryCount = 0;
    let selectedDifficulty = localStorage.getItem("selectedDifficulty") || "Rampage";
    let learningMode = false;
    let debugMode = localStorage.getItem("debugMode") === "true"; // Add debug mode
    let skippedBeasts = new Set(); // Add this variable near your other state variables

    let successfulBeastCoords = JSON.parse(localStorage.getItem('successfulBeastCoords') || '[]');

    // Add near your other state variables
let globalFailLoops = 0;

    ////// [Default Beast Coordinate List]
const tailedBeastList = [
        { name: "Shukaku", label: "1 Tailed Beast — Shukaku", x: 810, y: 475 },
        { name: "Matatabi", label: "2 Tailed Beast — Matatabi", x: 286, y: 310 },
        { name: "Isubo", label: "3 Tailed Beast — Isubo", x: 195, y: 275 },
        { name: "Son Goku", label: "4 Tailed Beast — Son Goku", x: 718, y: 308 },
        { name: "Kokuo", label: "5 Tailed Beast — Kokuo", x: 670, y: 250 },
        { name: "Saiken", label: "6 Tailed Beast — Saiken", x: 559, y: 198 },
        { name: "Chomei", label: "7 Tailed Beast — Chomei", x: 610, y: 155 },
        { name: "Gyuki", label: "8 Tailed Beast — Gyuki", x: 522, y: 139 },
        { name: "Kurama", label: "9 Tailed Beast — Kurama", x: 892, y: 178 }
    ];

    ////// [Battle Flow Functions: shuffle, click, retry, fight]
function shuffleArray(arr) {
        const copy = [...arr];
        for (let i = copy.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [copy[i], copy[j]] = [copy[j], copy[i]];
        }
        return copy;
    }

    // Update getCurrentBeastList to skip beasts in the skip list
    function getCurrentBeastList() {
        const coordMap = new Map();
        tailedBeastList.forEach(b => coordMap.set(b.name, { name: b.name, x: b.x, y: b.y }));
        successfulBeastCoords.forEach(b => coordMap.set(b.name, { name: b.name, x: b.x, y: b.y }));
        const filteredList = Array.from(coordMap.values()).filter(b => !skippedBeasts.has(b.name));
        const shuffledList = shuffleArray(filteredList);

        if (debugMode) {
            console.log(`[AutoTB DEBUG] Available beasts:`, filteredList.map(b => b.name));
            console.log(`[AutoTB DEBUG] Skipped beasts:`, Array.from(skippedBeasts));
            console.log(`[AutoTB DEBUG] Shuffled order:`, shuffledList.map(b => b.name));
        }

        return shuffledList;
    }

    function updateStatus(msg) {
        const el = document.getElementById("autoTBStatus");
        if (el) el.textContent = msg;
        console.log(`[AutoTB] ${msg}`); // Log all status updates to console
    }

    function smartClick(el) {
        const rect = el.getBoundingClientRect();
        ["mousedown", "mouseup", "click"].forEach(type => {
            el.dispatchEvent(new MouseEvent(type, {
                bubbles: true,
                cancelable: true,
                view: window,
                clientX: rect.left + rect.width / 2,
                clientY: rect.top + rect.height / 2
            }));
        });
    }

    function clickNextBeast() {
        if (!autoBattleTB) return;
        const coords = getCurrentBeastList();
        if (coords.length === 0) {
            console.log("[AutoTB] No available beasts to try!");
            updateStatus("❌ No available beasts!");
            return;
        }
        const beast = coords[currentBeastIndex % coords.length];
        console.log(`[AutoTB] Beast rotation - Index: ${currentBeastIndex}, Available: ${coords.length}, Trying: ${beast.name}`);
        updateStatus(`🦊 Trying ${beast.name} (${beast.x}, ${beast.y})`);
        dispatchCanvasClick(beast.x, beast.y);
        currentBeastIndex = (currentBeastIndex + 1) % coords.length;
    }

    function dispatchCanvasClick(x, y) {
        const canvas = document.querySelector("#tailed-beast-map-container canvas") || document.querySelector("canvas");
        if (!canvas) return updateStatus("❌ Canvas not found");

        if (debugMode) {
            console.log(`[AutoTB DEBUG] Clicking canvas at coordinates (${x}, ${y})`);
            console.log(`[AutoTB DEBUG] Canvas element:`, canvas);
        }

        ["mousedown", "mouseup", "click"].forEach(type => {
            canvas.dispatchEvent(new MouseEvent(type, {
                bubbles: true,
                cancelable: true,
                composed: true,
                clientX: x,
                clientY: y
            }));
        });

        setTimeout(checkChooseDifficulty, 600);
    }

    function checkChooseDifficulty() {
        const panel = [...document.querySelectorAll("#game-container .panel__top_bar b")].find(b => b.textContent.trim() === "Choose Difficulty Level");

        if (panel) {
            updateStatus("✅ Found difficulty panel");
            clickFight();
        } else {
            updateStatus("⚠️ No difficulty panel, try next");
            clickNextBeast();
        }
    }

    function clickFight() {
    const fightBtns = Array.from(document.querySelectorAll("#game-container button"))
        .filter(btn => btn.textContent.trim().toLowerCase() === "fight");
    const difficultyMap = { Rampage: 0, Hard: 1, Normal: 2 };
    const checkboxIndex = difficultyMap[selectedDifficulty];

    // Find all rows that contain a .j-checkbox
    const grid = document.querySelector("#game-container .themed_panel.theme__transparent--original .grid");
    if (!grid) return updateStatus("❌ Difficulty grid not found!");

    const allRows = Array.from(grid.children);
    const lootRows = allRows.filter(row => row.querySelector('.j-checkbox'));
    const row = lootRows[checkboxIndex];
    if (!row) return updateStatus("❌ Difficulty row with loot checkbox not found!");

    // Get necklace count (label.undefined is a direct child of the row)
    const necklaceLabel = row.querySelector('.label.undefined');
    let necklaceCount = 0;
    if (necklaceLabel) {
        const match = necklaceLabel.textContent.match(/(\d+)\s*\/\s*\d+/);
        if (match) necklaceCount = parseInt(match[1], 10);
    }

    // Get checkbox
    const lootCheckbox = row.querySelector('.j-checkbox');
    const isChecked = lootCheckbox?.classList?.contains('j-checkbox_selected');

    // Debug info
    console.log("Row:", row, "Necklace count:", necklaceCount, "Checkbox:", lootCheckbox);

    // Improved: Wait for checkbox to be visible and interactable
    let tried = 0;
    const maxTries = 6;
    function tryCheckbox() {
        if (lootCheckbox && lootCheckbox.offsetParent !== null) {
            if (necklaceCount >= 5 && !isChecked) {
                smartClick(lootCheckbox);
                updateStatus("🧧 Extra loot enabled!");
            } else if (necklaceCount < 5) {
                updateStatus("❌ Not enough Lava Stone Necklaces for extra loot.");
            } else if (isChecked) {
                updateStatus("🧧 Extra loot already enabled.");
            }
        } else if (tried < maxTries) {
            tried++;
            setTimeout(tryCheckbox, 300);
        } else {
            updateStatus("❌ Loot checkbox not found or not visible!");
        }
    }
    tryCheckbox();

    // Click the correct Fight button for the selected difficulty
    const fightBtn = fightBtns[checkboxIndex];
    const wait = setInterval(() => {
        if (!autoBattleTB) return clearInterval(wait);
        if (fightBtn && !fightBtn.disabled) {
            clearInterval(wait);
            updateStatus("🔥 Clicking Fight!");
            smartClick(fightBtn);
            watchBattle();
        } else {
            updateStatus("⏳ Waiting for Fight to enable...");
        }
    }, 500);
}

    // Update watchBattle function with temporary skip logic
    function watchBattle() {
        const coords = getCurrentBeastList();
        const beast = coords[(currentBeastIndex - 1 + coords.length) % coords.length]; // Get last tried beast

        if (debugMode) {
            console.log(`[AutoTB DEBUG] Watching battle for ${beast.name}`);
            console.log(`[AutoTB DEBUG] Current fail counts:`, beastFailCounts);
            console.log(`[AutoTB DEBUG] TB retry count: ${tbRetryCount}`);
        }

        const timeout = setTimeout(() => {
            if (!document.querySelector("#fightContainer")) {
                tbRetryCount++;
                beastFailCounts[beast.name] = (beastFailCounts[beast.name] || 0) + 1;
                updateStatus(`❌ No battle detected for ${beast.name}! Retry #${tbRetryCount}`);

                if (beastFailCounts[beast.name] >= 3) {
                    updateStatus(`⏳ Skipping ${beast.name} for now (not spawned or slow). Will retry later.`);
                    beastFailCounts[beast.name] = 0;
                    skippedBeasts.add(beast.name);
                }

                const closeBtn = [...document.querySelectorAll("button")].find(b => b.textContent.trim() === "Close");
                if (closeBtn) smartClick(closeBtn);

                if (tbRetryCount >= 3) {
                    updateStatus("🛑 Too many fails. Stopping TB.");
                    document.getElementById("toggleTB")?.click();
                    tbRetryCount = 0;
                } else {
                    setTimeout(clickNextBeast, 1000);
                }
            }
        }, 8000);

        const check = setInterval(() => {
            if (document.querySelector("#fightContainer")) {
                clearTimeout(timeout);
                clearInterval(check);
                tbRetryCount = 0;
                updateStatus("⚔️ Battle started!");
                cekBattleSelesai(() => {
                    updateStatus("✅ Battle done! Next...");

                    // Check if we completed a full loop (all available beasts tried)
                    const availableBeasts = getCurrentBeastList();
                    if (currentBeastIndex >= availableBeasts.length - 1) {
                        currentBeastIndex = 0;

                        // Reset skip list after a full loop
                        if (skippedBeasts.size > 0) {
                            skippedBeasts.clear();
                            updateStatus("🔄 Retrying skipped beasts in next loop.");
                            globalFailLoops++;
                            // If all beasts failed for 3 loops, stop script
                            if (globalFailLoops >= 3) {
                                updateStatus("🛑 All beasts failed for 3 loops. Stopping TB.");
                                document.getElementById("toggleTB")?.click();
                                globalFailLoops = 0;
                                return;
                            }
                        }
                    }

                    setTimeout(clickNextBeast, 800);
                });
            }
        }, 500);
    }

    function cekBattleSelesai(callback, delay = 500) {
        let tries = 0;
        const maxTries = 180;

        const interval = setInterval(() => {
            const closeBtn = [...document.querySelectorAll("button")].find(btn => btn.textContent.trim().toLowerCase() === "close");
            if (closeBtn) {
                updateStatus("🏁 Battle ended. Clicking Close...");
                smartClick(closeBtn);
                clearInterval(interval);
                setTimeout(callback, delay);
            } else if (++tries >= maxTries) {
                updateStatus("⚠️ Timeout waiting Close. Forcing next.");
                clearInterval(interval);
                setTimeout(callback, delay);
            }
        }, 500);
    }

    ////// [Learn Mode: Tagging Coordinates for Beasts]
function showTagMenu(x, y) {
        const existingMenu = document.getElementById('tb-learn-menu');
        if (existingMenu) existingMenu.remove();

        const menu = document.createElement('div');
        menu.id = 'tb-learn-menu';
        Object.assign(menu.style, {
            position: 'absolute', left: `${x}px`, top: `${y}px`,
            background: '#1e1e1e', border: '1px solid #555', borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.5)', padding: '8px', fontSize: '13px',
            color: '#fff', zIndex: 99999, maxWidth: '240px'
        });

        tailedBeastList.forEach(beast => {
            const option = document.createElement('div');
            option.textContent = beast.label;
            Object.assign(option.style, {
                padding: '5px 10px', cursor: 'pointer', borderRadius: '4px', transition: 'background 0.2s ease'
            });
            option.addEventListener('mouseover', () => option.style.background = '#333');
            option.addEventListener('mouseout', () => option.style.background = 'transparent');
           option.addEventListener('click', () => {
    const newCoord = { name: beast.name, x, y };
    const i = successfulBeastCoords.findIndex(b => b.name === beast.name);
    if (i >= 0) successfulBeastCoords[i] = newCoord;
    else successfulBeastCoords.push(newCoord);
    localStorage.setItem('successfulBeastCoords', JSON.stringify(successfulBeastCoords));
    updateStatus(`📌 Learned ${beast.label} at (${x}, ${y})`);
    menu.remove();

    // Automatically turn off Learn Mode after learning
    learningMode = false;
    const learnBtn = document.getElementById("toggleLearn");
    if (learnBtn) {
        learnBtn.textContent = "Learn Mode: Off";
        learnBtn.style.backgroundColor = "#17a2b8";
        window.removeEventListener("click", learnClickHandler);
    }
    updateStatus("🧠 Learn Mode Deactivated");
});
            menu.appendChild(option);
        });

        document.body.appendChild(menu);
    }

    function learnClickHandler(e) {
        const uiIDs = ["toggleTB", "toggleLearn", "resetCoords", "tbDifficulty"];
        if (uiIDs.includes(e.target.id) || e.target.closest("#autoBattleUI")) return;
        showTagMenu(e.clientX, e.clientY);
    }

    ////// [UI Panel: Difficulty, Start/Stop, Learn Mode, Reset]
function createUIButton() {
        const uiDiv = document.createElement("div");
        uiDiv.innerHTML = `
            <div id="autoBattleUI" style="position: fixed; top: 2%; right: 2px; background: rgba(0,0,0,0.75); color: white; padding: 8px; font-size: 12px; font-family: sans-serif; border-radius: 8px; z-index: 9999; width: 130px;">
                <div style="margin-bottom: 4px;">
                    <label>Difficulty:
                        <select id="tbDifficulty" style="font-size: 11px;">
                            <option value="Rampage">Rampage</option>
                            <option value="Hard">Hard</option>
                            <option value="Normal">Normal</option>
                        </select>
                    </label>
                </div>
                <button id="toggleTB" class="auto-btn">Start TB</button>
                <button id="toggleLearn" class="auto-btn" style="background-color:#17a2b8;">Learn Mode: Off</button>
                <button id="resetCoords" class="auto-btn" style="background-color: gray;">Reset Memory</button>
                <div id="autoTBStatus" style="margin-top: 6px; white-space: pre-line; font-size: 11px;"></div>
            </div>
            <style>
                .auto-btn {
                    width: 100%; padding: 5px; border: none;
                    background: #007bff; color: white;
                    border-radius: 5px; margin-top: 2px;
                    cursor: pointer; font-size: 12px;
                }
                .auto-btn:hover { background: #339cff; }
                .auto-btn.active { background: #dc3545; }
            </style>`;

        document.body.appendChild(uiDiv);

        document.getElementById("tbDifficulty").value = selectedDifficulty;

        document.getElementById("tbDifficulty").addEventListener("change", (e) => {
            selectedDifficulty = e.target.value;
            localStorage.setItem("selectedDifficulty", selectedDifficulty);
            updateStatus(`⚙ Difficulty: ${selectedDifficulty}`);
        });

        document.getElementById("toggleTB").addEventListener("click", function () {
            const isRunning = this.classList.toggle("active");
            this.textContent = isRunning ? "Stop TB" : "Start TB";
            isRunning ? startAutoBattleTB() : stopAutoBattleTB();
        });

        document.getElementById("toggleLearn").addEventListener("click", function () {
            learningMode = !learningMode;
            this.textContent = `Learn Mode: ${learningMode ? 'On' : 'Off'}`;
            this.style.backgroundColor = learningMode ? '#ffc107' : '#17a2b8';
            learningMode ?
                window.addEventListener("click", learnClickHandler) :
                window.removeEventListener("click", learnClickHandler);
            updateStatus(`🧠 Learn Mode ${learningMode ? 'Activated' : 'Deactivated'}`);
        });

        document.getElementById("resetCoords").addEventListener("click", () => {
            if (confirm("Reset saved coordinates?")) {
                successfulBeastCoords = [];
                localStorage.removeItem("successfulBeastCoords");
                updateStatus("🧹 Memory reset.");
            }
        });
    }

    ////// [Start/Stop Handlers for TB Loop]
function startAutoBattleTB() {
        if (autoBattleTB) return;
        autoBattleTB = true;
        currentBeastIndex = 0;
        updateStatus(`🚀 Started Auto TB (${selectedDifficulty})`);
        clickNextBeast();
    }

    function stopAutoBattleTB() {
        autoBattleTB = false;
        updateStatus("🛑 Stopped Auto TB");
    }

    window.addEventListener("load", () => setTimeout(createUIButton, 1000));

    document.addEventListener("click", (e) => {
        const menu = document.getElementById('tb-learn-menu');
        if (menu && !menu.contains(e.target) && !e.target.closest("#autoBattleUI")) menu.remove();
    });

    console.log("[AutoTB v5.0] Ready");
    console.log("Loop check:", currentBeastIndex, skippedBeasts.size, globalFailLoops);
})();

// Enable debug mode
debugMode = true;
localStorage.setItem("debugMode", "true");

// Disable debug mode
debugMode = false;
localStorage.setItem("debugMode", "false");
