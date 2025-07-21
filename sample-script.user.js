// ==UserScript==
// @name         Sample Game Script
// @namespace    http://yourwebsite.com/
// @version      1.0.0
// @description  Sample Tampermonkey script template
// @author       YourName
// @match        https://example-game.com/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Your script code goes here
    console.log('Sample Game Script loaded!');
    
    // Example: Add a button to the page
    function addCustomButton() {
        const button = document.createElement('button');
        button.textContent = 'Enhanced Feature';
        button.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            z-index: 9999;
            background: #00d4ff;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 5px;
            cursor: pointer;
        `;
        
        button.addEventListener('click', function() {
            alert('Game enhanced!');
        });
        
        document.body.appendChild(button);
    }
    
    // Wait for page to load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', addCustomButton);
    } else {
        addCustomButton();
    }

})();
