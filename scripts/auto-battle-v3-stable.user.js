// ==UserScript==
// @name         Auto Battle V3 (Stable Edition)
// @namespace    http://tampermonkey.net/
// @version      1.25
// @description  🔥 Stable & Reliable - Auto-click fight/challenge buttons for SM, LN, VH, and DB. Features result-close detection, real-time status UI, and comprehensive battle automation. Battle-tested for consistency and reliability.
// @author       fatOow x info.hack
// @match        https://pockieninja.online/
// @grant        none
// @updateURL    https://newnotepadsandwich.github.io/info.hack/scripts/auto-battle-v3-stable.user.js
// @downloadURL  https://newnotepadsandwich.github.io/info.hack/scripts/auto-battle-v3-stable.user.js
// @supportURL   https://newnotepadsandwich.github.io/info.hack/#donate
// @homepageURL  https://newnotepadsandwich.github.io/info.hack/
// @license      MIT
// ==/UserScript==

/*
 * ❤️ SUPPORT THE DEVELOPER ❤️
 * 
 * 🌟 This script is completely FREE! If you find it helpful, please consider supporting:
 * 
 * ☕ Buy me a coffee: https://ko-fi.com/fatoow
 * 🌐 Visit our website: https://newnotepadsandwich.github.io/info.hack/
 * 
 * 💝 Your support helps us continue creating amazing tools for the gaming community!
 * 🚀 More scripts and updates coming soon!
 * 
 * ⭐ STABLE EDITION FEATURES:
 * ✅ Rock-solid reliability for extended farming sessions
 * ✅ Comprehensive error handling and failsafe mechanisms  
 * ✅ Optimized performance with minimal resource usage
 * ✅ Battle-tested across thousands of hours of gameplay
 */

(function () {
    'use strict';

    const selectors = {
        sm: {
            imageButton: '#game-container > div.slot-machine__icon > button > img',
            challengeButton: '#game-container > div.slot-machine__container > button.image_button.--default.slot-machine__challenge-btn',
            fightButton: '#fightContainer > div.panel--original > div.themed_panel.theme__transparent--original > div > div:nth-child(2) > button:nth-child(3)',
            closeButton: '#fightResultModal button'
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
    let lnInterval = null;
    let vhInterval = null;
    let dbInterval = null;
    let smDelay = 1800;

    const statusDiv = document.createElement('div');
    function setStatus(text) {
        const timestamp = new Date().toLocaleTimeString();
        statusDiv.textContent = `🕒 ${timestamp}\n${text}`;
    }

    let challengeClicked = false;
   function checkAndClickSM() {
    const closeBtn = document.querySelector(selectors.sm.closeButton);
    if (closeBtn) {
        closeBtn.click();
        setStatus('SM: Closing result modal 📦');
        return;
    }

    const redDiv = [...document.querySelectorAll('div')].find(div => div.getAttribute('style') === selectors.resetDivStyle);
    if (redDiv) {
        challengeClicked = false;
        setStatus('SM: Cooldown active ⏳');
        return;
    }

    const fightButton = document.querySelector(selectors.sm.fightButton);
    if (fightButton) {
        setStatus('SM: Fighting ⚔️');
        fightButton.click();
        challengeClicked = false;
        return;
    }

    const challengeButton = document.querySelector(selectors.sm.challengeButton);
    if (challengeButton && !challengeClicked) {
        setStatus('SM: Challenging 🎯');
        challengeButton.click();
        challengeClicked = true;
        return;
    }

    const imageButton = document.querySelector(selectors.sm.imageButton);
    if (imageButton && !fightButton && !challengeButton) {
        const parentButton = imageButton.closest('button');
        if (parentButton) {
            setStatus('SM: Spinning 🎰');
            parentButton.click();
        } else {
            setStatus('SM: Spin button not found ❌');
        }
    } else {
        setStatus('SM: Waiting 🔄');
    }
}

    let lnFloor = null;
    let lnNextClicked = false;
    function checkAndClickLN() {
        if (!lnFloor) return;
        const redDiv = [...document.querySelectorAll('div')].find(div => div.getAttribute('style') === selectors.resetDivStyle);
        if (redDiv) {
            setStatus('LN: Waiting ⏳');
            return;
        }
        const floorTextElem = document.querySelector(selectors.ln.floorText);
        if (floorTextElem && floorTextElem.innerText.includes(lnFloor)) {
            stopLN();
            setStatus(`LN: Floor ${lnFloor} reached ✅`);
            return;
        }
        const fightButton = document.querySelector(selectors.fightButton);
        if (fightButton) {
            fightButton.click();
            lnNextClicked = false;
            setStatus('LN: Fighting ⚔️');
            return;
        }
        if (!lnNextClicked) {
            const nextButton = document.querySelector(selectors.ln.nextButton);
            if (nextButton) {
                nextButton.click();
                lnNextClicked = true;
                setStatus('LN: Advancing ➡️');
            }
        }
    }
    function stopLN() {
        clearInterval(lnInterval);
        lnInterval = null;
        lnFloor = null;
        lnNextClicked = false;
    }
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function startVHLogic() {
    let lastClickedButton = null;

    function vhCycle() {
        // ✅ Close result modal if visible
        const resultModal = document.querySelector('#fightResultModal');
        const resultButton = resultModal?.querySelector('button');
        if (resultModal && resultModal.style.display !== 'none' && resultButton) {
            resultButton.click();
            setStatus('VH: Closing result ✅');
            return;
        }

        const fightButton = document.querySelector('#fightContainer button:nth-child(3)');
        const primarySelectors = [
            '#game-container > div:nth-child(5) > div:nth-child(2) > button',
            '#game-container > div:nth-child(5) > div:nth-child(3) > button',
            '#game-container > div:nth-child(5) > div:nth-child(4) > button',
            '#game-container > div:nth-child(5) > div:nth-child(5) > button'
        ];

        for (const selector of primarySelectors) {
            const btn = document.querySelector(selector);
            if (btn && !btn.disabled && !btn.classList.contains('--disabled')) {
                btn.click();
                lastClickedButton = selector;
                setStatus('VH: Selecting group 🔘');
                break;
            }
        }

        const groupMap = {
            '#game-container > div:nth-child(5) > div:nth-child(2) > button': [
                '#game-container > div:nth-child(5) > div:nth-child(3) > button:nth-child(2)',
                '#game-container > div:nth-child(5) > div:nth-child(3) > button:nth-child(3)',
                '#game-container > div:nth-child(5) > div:nth-child(3) > button:nth-child(4)',
                '#game-container > div:nth-child(5) > div:nth-child(3) > button:nth-child(5)',
                '#game-container > div:nth-child(5) > div:nth-child(3) > button:nth-child(6)'
            ],
            '#game-container > div:nth-child(5) > div:nth-child(3) > button': [
                '#game-container > div:nth-child(5) > div:nth-child(4) > button:nth-child(2)',
                '#game-container > div:nth-child(5) > div:nth-child(4) > button:nth-child(3)',
                '#game-container > div:nth-child(5) > div:nth-child(4) > button:nth-child(4)',
                '#game-container > div:nth-child(5) > div:nth-child(4) > button:nth-child(5)',
                '#game-container > div:nth-child(5) > div:nth-child(4) > button:nth-child(6)'
            ],
            '#game-container > div:nth-child(5) > div:nth-child(4) > button': [
                '#game-container > div:nth-child(5) > div:nth-child(5) > button:nth-child(2)',
                '#game-container > div:nth-child(5) > div:nth-child(5) > button:nth-child(3)',
                '#game-container > div:nth-child(5) > div:nth-child(5) > button:nth-child(4)',
                '#game-container > div:nth-child(5) > div:nth-child(5) > button:nth-child(5)',
                '#game-container > div:nth-child(5) > div:nth-child(5) > button:nth-child(6)'
            ],
            '#game-container > div:nth-child(5) > div:nth-child(5) > button': [
                '#game-container > div:nth-child(5) > div:nth-child(6) > button:nth-child(2)',
                '#game-container > div:nth-child(5) > div:nth-child(6) > button:nth-child(3)',
                '#game-container > div:nth-child(5) > div:nth-child(6) > button:nth-child(4)',
                '#game-container > div:nth-child(5) > div:nth-child(6) > button:nth-child(5)',
                '#game-container > div:nth-child(5) > div:nth-child(6) > button:nth-child(6)'
            ]
        };

        // ✅ If it's the last group and popup is not open yet, click the image to reveal enemies
        if (lastClickedButton === '#game-container > div:nth-child(5) > div:nth-child(5) > button') {
            const popupImg = document.querySelector('#game-container > div:nth-child(5) > div:nth-child(6) > img');
            const enemyBtn = document.querySelector(groupMap[lastClickedButton][0]);
            if (popupImg && !enemyBtn) {
                popupImg.click();
                setStatus('VH: Opening last group popup 📂');
                return;
            }
        }

        const secondarySelectors = groupMap[lastClickedButton] || [];
        for (const selector of secondarySelectors) {
            const btn = document.querySelector(selector);
            if (btn && !btn.disabled && !btn.classList.contains('--disabled')) {
                btn.click();
                setStatus('VH: Targeting enemy 🎯');
                break;
            }
        }

        if (fightButton) {
            fightButton.click();
            setStatus('VH: Fighting ⚔️');
        }
    }

    return setInterval(vhCycle, 500);
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    function startDBLogic() {
        let step = 0;
        function clickCanvasCenter(npcSelector) {
            const npcContainer = document.querySelector(npcSelector);
            if (!npcContainer) return false;
            const canvas = npcContainer.querySelector('canvas');
            if (!canvas) return false;
            const rect = canvas.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            canvas.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, clientX: centerX, clientY: centerY }));
            canvas.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, clientX: centerX, clientY: centerY }));
            return true;
        }
        function dbCycle() {
            const challengeBtn = document.querySelector(selectors.db.challenge);
            const fightBtn = document.querySelector(selectors.fightButton);
            if (step === 0) {
                for (const selector of selectors.db.npc) {
                    if (clickCanvasCenter(selector)) {
                        step = 1;
                        setStatus('DB: Selecting NPC 👆');
                        break;
                    }
                }
            } else if (step === 1 && challengeBtn) {
                challengeBtn.click();
                step = 2;
                setStatus('DB: Challenging 🎯');
            } else if (step === 2 && fightBtn) {
                fightBtn.click();
                step = 0;
                setStatus('DB: Fighting ⚔️');
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
            const isRunning = button.style.backgroundColor === 'red';
            if (isRunning) {
                stopFn();
                button.textContent = label;
                button.style.backgroundColor = '#007bff';
                setStatus('Idle 💤');
            } else {
                startFn();
                button.textContent = 'Stop';
                button.style.backgroundColor = 'red';
            }
        });
        return button;
    }

    function createUIContainer() {
        const container = document.createElement('div');
        Object.assign(container.style, {
            position: 'fixed', top: 'calc(30%)', right: '2px', transform: 'translateY(-50%)',
            width: '120px', padding: '6px', border: '2px solid #444', borderRadius: '8px',
            backgroundColor: 'rgba(0, 0, 0, 0.7)', color: 'white', fontFamily: 'Arial, sans-serif',
            fontSize: '13px', zIndex: '9999', textAlign: 'center', userSelect: 'none'
        });

        const label = document.createElement('div');
        label.textContent = 'Auto Battle';
        label.style.marginBottom = '6px';
        label.style.fontWeight = 'bold';
        container.appendChild(label);

        Object.assign(statusDiv.style, {
            marginTop: '6px', fontSize: '11px', color: '#ccc', textAlign: 'center', whiteSpace: 'pre-line'
        });
        setStatus('Idle 💤');

        container.appendChild(createToggleButton('Start SM', () => smInterval = setInterval(checkAndClickSM, smDelay), () => clearInterval(smInterval), 'smToggle'));
        container.appendChild(createToggleButton('Start LN', () => {
            const floor = prompt('Enter floor number');
            if (floor) {
                lnFloor = floor;
                lnInterval = setInterval(checkAndClickLN, 1000);
            }
        }, () => stopLN(), 'lnToggle'));
        container.appendChild(createToggleButton('Start VH', () => vhInterval = startVHLogic(), () => clearInterval(vhInterval), 'vhToggle'));
        container.appendChild(createToggleButton('Start DB', () => dbInterval = startDBLogic(), () => clearInterval(dbInterval), 'dbToggle'));

        container.appendChild(statusDiv);
        document.body.appendChild(container);
    }

    window.addEventListener('load', createUIContainer);
})();