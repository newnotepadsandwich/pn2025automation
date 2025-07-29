// ==UserScript==
// @name         Auto Open Items 1.8.1 Speed Slider
// @namespace    http://tampermonkey.net/
// @version      1.8 Improved
// @description  Auto right-click and "Use" item with speed controls and generic item opener.
// @author       Salty + fatoow
// @match        https://pockieninja.online
// @grant        none
// ==/UserScript==

/*
═══════════════════════════════════════════════════════════════════════════════════════════════
🎮 POCKIE NINJA AUTO OPEN ITEMS 1.8 - SPEED SLIDER EDITION
═══════════════════════════════════════════════════════════════════════════════════════════════

💎 PREMIUM FEATURES:
   🚀 Speed Control Slider - 6 configurable speed levels from Very Slow to Ultra Fast
   🎯 Generic Item Opener - Click any inventory item to auto-open it
   📦 Predefined Items - S-Scroll, A-Scroll, Stone Bag, Seal Breaker, Big Soul
   🔄 Smart Detection - Advanced click handling with multiple event listeners
   💫 Professional UI - Modern overlay interface with intuitive controls

⚡ SPEED MODES:
   Very Slow: 2000ms scan, 800ms click delay
   Slow: 1500ms scan, 700ms click delay  
   Normal: 1000ms scan, 500ms click delay
   Fast: 700ms scan, 300ms click delay
   Very Fast: 400ms scan, 200ms click delay
   Ultra Fast: 200ms scan, 100ms click delay

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

(function () {
    'use strict';

    const items = [
        { id: "scroll", label: "S-Scroll", src: "https://pockie-ninja.sfo3.cdn.digitaloceanspaces.com/assets/public/icons/items/tasks/master/38.png", withAccept: true },
        { id: "ascroll", label: "A-Scroll", src: "https://pockie-ninja.sfo3.cdn.digitaloceanspaces.com/assets/public/icons/items/tasks/master/37.png", withAccept: true },

        {
            id: "stonebag",
            label: "Stone Bag",
            src: [
                "https://pockie-ninja.sfo3.cdn.digitaloceanspaces.com/assets/public/icons/items/etc/226.png",
                "https://pockie-ninja.sfo3.cdn.digitaloceanspaces.com/assets/public/icons/items/etc/88.png"
            ],
            withAccept: false
        },

        { id: "sealbreaker", label: "Seal Breaker", src: "https://pockie-ninja.sfo3.cdn.digitaloceanspaces.com/assets/public/icons/items/etc/treasure.png", withAccept: false },
        { id: "bigsoul", label: "Big Soul", src: "https://pockie-ninja.sfo3.cdn.digitaloceanspaces.com/assets/public/icons/items/etc/15.png", withAccept: false },

    ];

    const state = {};
    const intervalIds = {};
    let scanSpeed = 1000; // Default 1 second
    let clickDelay = 500;  // Default 0.5 second

    function createAutoOpenUI() {
        const uiDiv = document.createElement("div");
        uiDiv.innerHTML = `
            <div id="autoItemUI" style="position: fixed; top: 263px; left: 2px; background: rgba(0, 0, 0, 0.8); padding: 12px; z-index: 9999; border-radius: 8px; font-family: sans-serif; width: 125px;">
                <h4 style="color: #ffffff; text-align: center; margin-top: 0; margin-bottom: 10px;">Open Items</h4>
                
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

                <!-- Generic Item Opener -->
                <div style="margin-bottom: 10px;">
                    <button id="generic_opener" class="auto-btn">Open Selected Item</button>
                </div>
                
                ${items.map(item => `
                    <div style="margin-bottom: 10px;">
                        <button id="toggle_${item.id}" class="auto-btn">${item.label}</button>
                    </div>
                `).join('')}
            </div>
            <style>
                .auto-btn {
                    width: 100%;
                    padding: 6px 10px;
                    border: none;
                    border-radius: 5px;
                    background-color: #007bff;
                    color: white;
                    font-size: 13px;
                    cursor: pointer;
                    transition: 0.2s ease-in-out;
                }
                .auto-btn:hover {
                    background-color: #339cff;
                }
                .auto-btn.active {
                    background-color: #dc3545;
                }
            </style>
        `;
        document.body.appendChild(uiDiv);

        // Speed slider functionality
        const speedSlider = document.getElementById('speedSlider');
        const speedValue = document.getElementById('speedValue');
        
        const speedSettings = {
            1: { scan: 2000, click: 800, label: 'Very Slow' },
            2: { scan: 1500, click: 700, label: 'Slow' },
            3: { scan: 1000, click: 500, label: 'Normal' },
            4: { scan: 700, click: 300, label: 'Fast' },
            5: { scan: 400, click: 200, label: 'Very Fast' },
            6: { scan: 200, click: 100, label: 'Ultra Fast' }
        };

        speedSlider.addEventListener('input', (e) => {
            const setting = speedSettings[e.target.value];
            scanSpeed = setting.scan;
            clickDelay = setting.click;
            speedValue.textContent = setting.label;
            
            // Restart any currently running auto-openers to apply new speed
            console.log(`Speed changed to ${setting.label} (scan: ${setting.scan}ms, click: ${setting.click}ms)`);
            
            // Restart generic opener if it's running
            if (genericState && genericIntervalId) {
                clearInterval(genericIntervalId);
                console.log("Restarting generic opener with new speed...");
                genericIntervalId = startGenericAuto(selectedItemSrc, () => {
                    genericState = false;
                    selectedItemSrc = null;
                    genericButton.textContent = "Open Selected Item";
                    genericButton.classList.remove('active');
                    genericButton.style.backgroundColor = "#007bff";
                });
            }
            
            // Restart any item-specific auto-openers that are running
            items.forEach(item => {
                if (state[item.id] && intervalIds[item.id]) {
                    clearInterval(intervalIds[item.id]);
                    console.log(`Restarting ${item.label} with new speed...`);
                    intervalIds[item.id] = startAuto(item.src, item.label, item.withAccept, () => {
                        state[item.id] = false;
                        const button = document.getElementById(`toggle_${item.id}`);
                        button.textContent = `${item.label}`;
                        button.classList.remove('active');
                    });
                }
            });
        });

        // Generic Item Opener functionality
        let genericState = false;
        let genericIntervalId = null;
        let selectedItemSrc = null;
        let selectionMode = false;
        
        const genericButton = document.getElementById('generic_opener');
        genericButton.addEventListener('click', () => {
            if (!genericState && !selectionMode) {
                // Enter selection mode
                selectionMode = true;
                genericButton.textContent = "Click an item";
                genericButton.style.backgroundColor = "#ffc107";
                console.log("Selection mode activated. Click any item in your inventory to select it.");
                
                // Add click listeners to all inventory items
                const allItems = document.querySelectorAll('.item-container .item, .item, [class*="item"]');
                console.log(`Added click listeners to ${allItems.length} items`);
                
                allItems.forEach(item => {
                    // Add multiple event listeners to catch the click reliably
                    item.addEventListener('click', handleItemSelection, { capture: true, once: true });
                    item.addEventListener('mousedown', handleItemSelection, { capture: true, once: true });
                    
                    // Also add to child images
                    const imgs = item.querySelectorAll('img');
                    imgs.forEach(img => {
                        img.addEventListener('click', handleItemSelection, { capture: true, once: true });
                        img.addEventListener('mousedown', handleItemSelection, { capture: true, once: true });
                    });
                });
                
                // Auto-cancel selection mode after 10 seconds
                setTimeout(() => {
                    if (selectionMode) {
                        cancelSelectionMode();
                    }
                }, 10000);
                
            } else if (genericState) {
                // Stop the generic opener
                if (genericIntervalId) {
                    clearInterval(genericIntervalId);
                }
                genericState = false;
                selectedItemSrc = null;
                genericButton.textContent = "Open Selected Item";
                genericButton.classList.remove('active');
                genericButton.style.backgroundColor = "#007bff"; // Reset to blue
                console.log("Generic auto-opener stopped manually");
            } else if (selectionMode) {
                // Cancel selection mode
                cancelSelectionMode();
            }
        });
        
        function handleItemSelection(event) {
            // Stop all default behaviors immediately
            event.preventDefault();
            event.stopPropagation();
            event.stopImmediatePropagation();
            
            console.log("Item click detected, processing selection...");
            
            const clickedItem = event.currentTarget || event.target;
            
            // Try to find the item element and image in multiple ways
            let itemElement = clickedItem;
            let img = null;
            
            // Method 1: Direct image check
            if (clickedItem.tagName === 'IMG') {
                img = clickedItem;
                itemElement = clickedItem.closest('.item') || clickedItem.parentElement;
            }
            
            // Method 2: Find image within the clicked element
            if (!img) {
                img = clickedItem.querySelector('img.img__image') || 
                     clickedItem.querySelector('img') ||
                     clickedItem.querySelector('[src]');
            }
            
            // Method 3: Check parent elements for image
            if (!img && clickedItem.parentElement) {
                img = clickedItem.parentElement.querySelector('img.img__image') ||
                     clickedItem.parentElement.querySelector('img');
            }
            
            console.log("Clicked element:", clickedItem);
            console.log("Item element:", itemElement);
            console.log("Found img element:", img);
            console.log("Image src:", img?.src);
            
            if (img && img.src && img.src.includes('http')) {
                selectedItemSrc = img.src;
                selectionMode = false;
                genericState = true;
                
                genericButton.textContent = "Stop Generic";
                genericButton.classList.add('active');
                genericButton.style.backgroundColor = "#dc3545";
                
                console.log(`Starting generic auto-opener for selected item: ${selectedItemSrc}`);
                
                // Remove click listeners from other items
                removeItemListeners();
                
                // Start the auto-opening loop
                genericIntervalId = startGenericAuto(selectedItemSrc, () => {
                    // Stop callback
                    genericState = false;
                    selectedItemSrc = null;
                    genericButton.textContent = "Open Selected Item";
                    genericButton.classList.remove('active');
                    genericButton.style.backgroundColor = "#007bff";
                });
            } else {
                console.log("Invalid item selected - no valid image source found");
                console.log("Clicked element details:", {
                    tagName: clickedItem.tagName,
                    className: clickedItem.className,
                    id: clickedItem.id,
                    innerHTML: clickedItem.innerHTML?.substring(0, 200) + "..."
                });
                showGenericFeedback("Invalid item!");
                cancelSelectionMode();
            }
            
            return false; // Prevent any further event handling
        }
        
        function cancelSelectionMode() {
            selectionMode = false;
            genericButton.textContent = "Open Selected Item";
            genericButton.style.backgroundColor = "#007bff";
            removeItemListeners();
            console.log("Selection mode cancelled");
        }
        
        function removeItemListeners() {
            const allItems = document.querySelectorAll('.item-container .item, .item, [class*="item"]');
            allItems.forEach(item => {
                item.removeEventListener('click', handleItemSelection, { capture: true });
                item.removeEventListener('mousedown', handleItemSelection, { capture: true });
                
                const imgs = item.querySelectorAll('img');
                imgs.forEach(img => {
                    img.removeEventListener('click', handleItemSelection, { capture: true });
                    img.removeEventListener('mousedown', handleItemSelection, { capture: true });
                });
            });
        }
        
        function showGenericFeedback(message) {
            const originalText = genericButton.textContent;
            genericButton.textContent = message;
            genericButton.style.backgroundColor = "#ffc107";
            
            setTimeout(() => {
                if (!genericState) {
                    genericButton.textContent = originalText;
                    genericButton.style.backgroundColor = "#007bff";
                }
            }, 2000);
        }

        items.forEach(item => {
            state[item.id] = false;

            const button = document.getElementById(`toggle_${item.id}`);
            button.addEventListener('click', () => {
                state[item.id] = !state[item.id];
                button.textContent = state[item.id] ? `${item.label}` : `${item.label}`;
                button.classList.toggle('active', state[item.id]);

                if (state[item.id]) {
                    intervalIds[item.id] = startAuto(item.src, item.label, item.withAccept, () => {
                        state[item.id] = false;
                        button.textContent = `${item.label}`;
                        button.classList.remove('active');
                    });
                } else {
                    clearInterval(intervalIds[item.id]);
                }
            });
        });
    }

    function isMatchingSrc(imgSrc, targetSrc) {
    if (Array.isArray(targetSrc)) {
        return targetSrc.some(src => imgSrc.includes(src));
    }
    return imgSrc.includes(targetSrc);
}

function openGenericItem(itemElement) {
    console.log("Right-clicking selected item");
    
    const rightClick = new MouseEvent("contextmenu", {
        bubbles: true,
        cancelable: true,
        view: itemElement.ownerDocument.defaultView || window,
        button: 2
    });
    itemElement.dispatchEvent(rightClick);

    setTimeout(() => {
        const useBtn = [...document.querySelectorAll('.context-menu__item')]
            .find(el => el.textContent.trim() === "Use");
        if (useBtn) {
            console.log("Clicking Use");
            useBtn.click();
            
            // Handle rare item dialog that might appear
            setTimeout(() => {
                const closeBtn = document.querySelector('#game-container > div.panel--original > div.themed_panel.theme__transparent--original > div > div:nth-child(2) > button');
                if (closeBtn && closeBtn.textContent.trim() === "Close") {
                    console.log("Rare item dialog detected - clicking Close");
                    closeBtn.click();
                }
            }, clickDelay / 2);
        } else {
            console.log("Use button not found in context menu");
        }
    }, clickDelay);
}

function startGenericAuto(targetSrc, onStop) {
    let processedCount = 0;
    let isProcessing = false;
    
    const interval = setInterval(() => {
        // Don't start new processing if we're already processing an item
        if (isProcessing) {
            console.log(`Generic Item - Still processing previous item, waiting...`);
            return;
        }
        
        const items = document.querySelectorAll('.item-container .item');
        let found = false;

        // Count total items of this type for better logging
        let totalItemsFound = 0;
        for (let item of items) {
            const img = item.querySelector('img.img__image');
            if (img && img.src.includes(targetSrc)) {
                totalItemsFound++;
            }
        }

        // Process the first matching item found
        for (let item of items) {
            const img = item.querySelector('img.img__image');
            if (img && img.src.includes(targetSrc)) {
                found = true;
                isProcessing = true;
                processedCount++;
                
                console.log(`Generic Item found → Processing item ${processedCount} (${totalItemsFound} total remaining)`);
                
                const rightClick = new MouseEvent("contextmenu", {
                    bubbles: true,
                    cancelable: true,
                    view: item.ownerDocument.defaultView || window,
                    button: 2
                });
                item.dispatchEvent(rightClick);

                setTimeout(() => {
                    const useBtn = [...document.querySelectorAll('.context-menu__item')]
                        .find(el => el.textContent.trim() === "Use");
                    if (useBtn) {
                        console.log(`Click Use on Generic Item (item ${processedCount})`);
                        useBtn.click();

                        // Handle rare item dialog that might appear
                        setTimeout(() => {
                            const closeBtn = document.querySelector('#game-container > div.panel--original > div.themed_panel.theme__transparent--original > div > div:nth-child(2) > button');
                            if (closeBtn && closeBtn.textContent.trim() === "Close") {
                                console.log("Rare item dialog detected - clicking Close");
                                closeBtn.click();
                            }
                        }, clickDelay / 2);

                        // For generic items, we don't know if they need Accept, so we try both approaches
                        setTimeout(() => {
                            const acceptBtn = [...document.querySelectorAll('button')]
                                .find(el => el.textContent.trim() === "Accept");
                            if (acceptBtn) {
                                console.log(`Click Accept (item ${processedCount})`);
                                acceptBtn.click();
                            }
                            
                            // Mark processing as complete after checking for Accept
                            setTimeout(() => {
                                isProcessing = false;
                                console.log(`Generic Item ${processedCount} processing complete`);
                            }, clickDelay / 2);
                        }, clickDelay);
                    } else {
                        // If Use button not found, mark as complete
                        isProcessing = false;
                        console.log(`Use button not found for Generic Item`);
                    }
                }, clickDelay);
                break;
            }
        }

        if (!found) {
            clearInterval(interval);
            console.log(`Generic Item completed! Total processed: ${processedCount} items`);
            onStop();
        }
    }, scanSpeed);

    return interval;
}

function startAuto(src, label, withAccept, onStop) {
    let processedCount = 0;
    let isProcessing = false;
    
    const interval = setInterval(() => {
        // Don't start new processing if we're already processing an item
        if (isProcessing) {
            console.log(`${label} - Still processing previous item, waiting...`);
            return;
        }
        
        const items = document.querySelectorAll('.item-container .item');
        let found = false;

        // Count total items of this type for better logging
        let totalItemsFound = 0;
        for (let item of items) {
            const img = item.querySelector('img.img__image');
            if (img && isMatchingSrc(img.src, src)) {
                totalItemsFound++;
            }
        }

        // Process the first matching item found
        for (let item of items) {
            const img = item.querySelector('img.img__image');
            if (img && isMatchingSrc(img.src, src)) {
                found = true;
                isProcessing = true;
                processedCount++;
                
                console.log(`${label} found → Processing item ${processedCount} (${totalItemsFound} total remaining)`);
                
                const rightClick = new MouseEvent("contextmenu", {
                    bubbles: true,
                    cancelable: true,
                    view: item.ownerDocument.defaultView || window,
                    button: 2
                });
                item.dispatchEvent(rightClick);

                setTimeout(() => {
                    const useBtn = [...document.querySelectorAll('.context-menu__item')]
                        .find(el => el.textContent.trim() === "Use");
                    if (useBtn) {
                        console.log(`Click Use on ${label} (item ${processedCount})`);
                        useBtn.click();

                        // Handle rare item dialog that might appear
                        setTimeout(() => {
                            const closeBtn = document.querySelector('#game-container > div.panel--original > div.themed_panel.theme__transparent--original > div > div:nth-child(2) > button');
                            if (closeBtn && closeBtn.textContent.trim() === "Close") {
                                console.log("Rare item dialog detected - clicking Close");
                                closeBtn.click();
                            }
                        }, clickDelay / 2);

                        if (withAccept) {
                            setTimeout(() => {
                                const acceptBtn = [...document.querySelectorAll('button')]
                                    .find(el => el.textContent.trim() === "Accept");
                                if (acceptBtn) {
                                    console.log(`Click Accept (item ${processedCount})`);
                                    acceptBtn.click();
                                }
                                
                                // Mark processing as complete after final action
                                setTimeout(() => {
                                    isProcessing = false;
                                    console.log(`${label} item ${processedCount} processing complete`);
                                }, clickDelay / 2);
                            }, clickDelay);
                        } else {
                            // Mark processing as complete for non-accept items
                            setTimeout(() => {
                                isProcessing = false;
                                console.log(`${label} item ${processedCount} processing complete`);
                            }, clickDelay);
                        }
                    } else {
                        // If Use button not found, mark as complete
                        isProcessing = false;
                        console.log(`Use button not found for ${label}`);
                    }
                }, clickDelay);
                break;
            }
        }

        if (!found) {
            clearInterval(interval);
            console.log(`${label} completed! Total processed: ${processedCount} items`);
            onStop();
        }
    }, scanSpeed);

    return interval;
}

    window.addEventListener('load', () => {
        setTimeout(createAutoOpenUI, 1000);
    });
})();