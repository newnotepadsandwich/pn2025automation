// ==UserScript==
// @name         Auto Synthesize Soul v3.0 (Pockie Ninja Hub Edition)
// @namespace    http://tampermonkey.net/
// @description  🔮 Auto Level Match & Exact Match Soul synthesis automation with dual-mode controls
// @author       Original: Salty | Enhanced by: newnotepadsandwich
// @version      3.0
// @match        https://pockieninja.online
// @grant        none
// @supportURL   https://ko-fi.com/fatoow
// @homepageURL  https://newnotepadsandwich.github.io/pn2025automation/
// ==/UserScript==

/*
   🎯 AUTO SYNTHESIZE SOUL v3.0 - POCKIE NINJA HUB EDITION
   
   Original Script by: Salty
   Enhanced & Distributed by: Pockie Ninja Scripts Hub
   
   ✨ FEATURES:
   • Dual-mode automation (Exact Match & Level Match)
   • Smart button detection and clicking
   • Professional toggle interface
   • Real-time status feedback
   • Compact, non-intrusive UI
   
   💝 Support the Original Author:
   Salty's Donations:
   • PayPal: https://paypal.me/murbawisesa
   • Saweria: https://saweria.co/boyaghnia
   
   💰 Support Pockie Ninja Hub:
   • Ko-fi: https://ko-fi.com/fatoow
   
   🏠 Get More Scripts: https://newnotepadsandwich.github.io/pn2025automation/
*/

(function () {
    'use strict';

    let isExactRunning = false;
    let isLevelRunning = false;

    function clickMatch(mode) {
        const buttons = document.querySelectorAll(".theme__button--original");
        let matchButton = null;

        buttons.forEach(btn => {
            if (btn.textContent.trim() === mode) {
                matchButton = btn;
            }
        });

        if (matchButton) {
            console.log(`🎲 Klik tombol '${mode}'...`);
            if (mode === "Exact Match") {
                matchButton.click();
                setTimeout(() => {
                    console.log(`🎲 Klik kedua tombol '${mode}'...`);
                    matchButton.click();
                    setTimeout(() => clickCreate(mode), 500);
                }, 200); // jeda antara klik pertama dan kedua
            } else {
                matchButton.click();
                setTimeout(() => clickCreate(mode), 500);
            }
        } else {
            console.log(`⚠️ Tombol '${mode}' belum tersedia. Mencoba lagi...`);
            setTimeout(() => clickMatch(mode), 500);
        }
    }

    function clickCreate(mode) {
        const buttons = document.querySelectorAll(".theme__button--original");
        let createButton = null;

        buttons.forEach(btn => {
            if (btn.textContent.trim() === "Create") {
                createButton = btn;
            }
        });

        if (createButton) {
            console.log("✅ Klik tombol 'Create'...");
            createButton.click();
            setTimeout(() => {
                if (mode === "Exact Match" && isExactRunning) {
                    clickMatch(mode);
                } else if (mode === "Level Match" && isLevelRunning) {
                    clickMatch(mode);
                }
            }, 500);
        } else {
            console.log("⚠️ Tombol 'Create' tidak ditemukan. Mencoba lagi...");
            setTimeout(() => clickCreate(mode), 500);
        }
    }

    function startExactLoop() {
        if (!isExactRunning) {
            console.log("🎰 Memulai Auto Exact Match...");
            isExactRunning = true;
            clickMatch("Exact Match");
        }
    }

    function stopExactLoop() {
        if (isExactRunning) {
            console.log("🛑 Menghentikan Auto Exact Match...");
            isExactRunning = false;
        }
    }

    function startLevelLoop() {
        if (!isLevelRunning) {
            console.log("🎰 Memulai Auto Level Match...");
            isLevelRunning = true;
            clickMatch("Level Match");
        }
    }

    function stopLevelLoop() {
        if (isLevelRunning) {
            console.log("🛑 Menghentikan Auto Level Match...");
            isLevelRunning = false;
        }
    }

    function createUIButton() {
        let uiDiv = document.createElement("div");
        uiDiv.innerHTML = `
            <div id="autoSynthesizeUI" style="position: fixed; top: 114px; left: 2px; background: rgba(0, 0, 0, 0.8); padding: 12px; z-index: 9999; border-radius: 8px; font-family: sans-serif; min-width: 125px;">
                <h4 style="color: #ffffff; text-align: left; margin-top: 0; margin-bottom: 10px;">Auto Synthesize<br>Bloodsoul</h4>
                <div style="margin-bottom: 10px;">
                    <button id="startExact" class="auto-btn">Exact Match</button>
                </div>
                <div style="margin-bottom: 10px;">
                    <button id="stopExact" class="auto-btn" style="background-color: red; display: none;">Exact Stop</button>
                </div>
                <div style="margin-bottom: 10px;">
                    <button id="startLevel" class="auto-btn">Level Match</button>
                </div>
                <div style="margin-bottom: 10px;">
                    <button id="stopLevel" class="auto-btn" style="background-color: red; display: none;">Level Stop</button>
                </div>
                <div style="margin-top: 15px; font-size: 10px; color: #ccc; text-align: center;">
                    Original by <strong>Salty</strong><br>
                    Hub Edition
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

        document.getElementById("startExact").addEventListener("click", () => {
            startExactLoop();
            toggleButtons("Exact", true);
        });
        document.getElementById("stopExact").addEventListener("click", () => {
            stopExactLoop();
            toggleButtons("Exact", false);
        });
        document.getElementById("startLevel").addEventListener("click", () => {
            startLevelLoop();
            toggleButtons("Level", true);
        });
        document.getElementById("stopLevel").addEventListener("click", () => {
            stopLevelLoop();
            toggleButtons("Level", false);
        });
    }

    function toggleButtons(type, isRunning) {
        const startBtn = document.getElementById(`start${type}`);
        const stopBtn = document.getElementById(`stop${type}`);

        startBtn.style.display = isRunning ? "none" : "inline-block";
        stopBtn.style.display = isRunning ? "inline-block" : "none";
    }

    createUIButton();
    console.log(
      "🔮 [Auto Synthesize Soul v3.0 - Hub Edition] 🔮\n\n" +
      "Original Script by: Salty\n" +
      "Enhanced by: Pockie Ninja Scripts Hub\n\n" +
      "💝 Support Original Author (Salty):\n" +
      "• PayPal: https://paypal.me/murbawisesa\n" +
      "• Saweria: https://saweria.co/boyaghnia\n\n" +
      "💰 Support Hub Development:\n" +
      "• Ko-fi: https://ko-fi.com/fatoow\n\n" +
      "🏠 More Scripts: https://newnotepadsandwich.github.io/pn2025automation/"
    );
})();
