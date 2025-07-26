// Scripts data is now loaded from secure-script.js
// This file now only contains the UI and interaction functions

// DOM Elements
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');
const scriptsGrid = document.getElementById('scriptsGrid');
const modal = document.getElementById('scriptModal');
const modalBody = document.getElementById('modalBody');
const closeModal = document.querySelector('.close');

// Initialize the website
document.addEventListener('DOMContentLoaded', function() {
    initializeNavigation();
    loadScripts();
    initializeStats();
    initializeModal();
    initializeSmoothScroll();
    initializeDonationButtons();
});

// Navigation functionality
function initializeNavigation() {
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    // Close mobile menu when clicking on a link
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });

    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!hamburger.contains(e.target) && !navMenu.contains(e.target)) {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        }
    });

    // Add active class to navigation links based on scroll position
    window.addEventListener('scroll', () => {
        const sections = document.querySelectorAll('section[id]');
        const scrollPos = window.scrollY + 100;

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');
            const navLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);

            if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
                document.querySelectorAll('.nav-link').forEach(link => {
                    link.classList.remove('active');
                });
                if (navLink) {
                    navLink.classList.add('active');
                }
            }
        });
    });
}

// Load and display scripts
function loadScripts() {
    scriptsGrid.innerHTML = '';
    
    scriptsData.forEach(script => {
        const scriptCard = createScriptCard(script);
        scriptsGrid.appendChild(scriptCard);
    });
}

// Create script card element
function createScriptCard(script) {
    const card = document.createElement('div');
    card.className = 'script-card';
    card.onclick = () => openScriptModal(script);
    
    card.innerHTML = `
        <div class="script-header">
            <div class="script-title">${script.title}</div>
            <div class="script-version">${script.version}</div>
        </div>
        <div class="script-game">${script.game}</div>
        <div class="script-description">${script.description}</div>
        <div class="script-features">
            <ul>
                ${script.features.slice(0, 3).map(feature => `<li>${feature}</li>`).join('')}
            </ul>
        </div>
        <div class="script-actions">
            <button class="btn btn-primary" onclick="event.stopPropagation(); downloadScript('${script.downloadUrl}', '${script.title}');">
                <i class="fas fa-download"></i>
                Install Script
            </button>
        </div>
    `;
    
    return card;
}

// Generate video content for modal (handles single or multiple videos)
function generateVideoContent(script) {
    // Check if script has multiple videos
    if (script.videoUrls && script.videoUrls.length > 0) {
        if (script.videoUrls.length === 1) {
            return `
                <div class="video-container">
                    <iframe 
                        src="${script.videoUrls[0]}" 
                        frameborder="0" 
                        allowfullscreen
                        width="100%" 
                        height="315">
                    </iframe>
                </div>
            `;
        } else {
            // Multiple videos - create tabs
            return `
                <div class="video-tabs">
                    <div class="video-tab-buttons">
                        ${script.videoUrls.map((url, index) => `
                            <button class="video-tab-btn ${index === 0 ? 'active' : ''}" data-video-index="${index}">
                                Demo ${index + 1}
                            </button>
                        `).join('')}
                    </div>
                    <div class="video-tab-content">
                        ${script.videoUrls.map((url, index) => `
                            <div class="video-container ${index === 0 ? 'active' : ''}" data-video-index="${index}">
                                <iframe 
                                    src="${url}" 
                                    frameborder="0" 
                                    allowfullscreen
                                    width="100%" 
                                    height="315">
                                </iframe>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }
    }
    
    // Fallback to single video
    if (script.videoUrl) {
        return `
            <div class="video-container">
                <iframe 
                    src="${script.videoUrl}" 
                    frameborder="0" 
                    allowfullscreen
                    width="100%" 
                    height="315">
                </iframe>
            </div>
        `;
    }
    
    // Check for thumbnail instead of video
    if (script.thumbnailUrl) {
        return `
            <div class="thumbnail-container">
                <img 
                    src="${script.thumbnailUrl}" 
                    alt="${script.title} Preview"
                    style="width: 100%; height: 315px; object-fit: cover; border-radius: 8px; background: #f0f0f0;">
            </div>
        `;
    }
    
    // No video or thumbnail available
    return `
        <div class="video-placeholder">
            <i class="fas fa-play"></i>
            <p>Demo Video Coming Soon</p>
        </div>
    `;
}

// Open script modal with details
function openScriptModal(script) {
    const modalContent = `
        <div class="script-modal-header">
            <h2>${script.title}</h2>
            <div class="script-meta">
                <span class="script-game">${script.game}</span>
                <span class="script-version">${script.version}</span>
            </div>
        </div>
        
        <div class="script-modal-content">
            <div class="script-video">
                ${generateVideoContent(script)}
            </div>
            
            <div class="script-details">
                <div class="script-stats">
                    <div class="stat">
                        <i class="fas fa-download"></i>
                        <span>${script.downloads.toLocaleString()} downloads</span>
                    </div>
                    <div class="stat">
                        <i class="fas fa-star"></i>
                        <span>${script.rating}/5.0</span>
                    </div>
                    <div class="stat">
                        <i class="fas fa-calendar"></i>
                        <span>Updated ${formatDate(script.lastUpdated)}</span>
                    </div>
                </div>
                
                <div class="script-description">
                    <h3>Description</h3>
                    <p>${script.description}</p>
                </div>
                
                <div class="script-features">
                    <h3>Features</h3>
                    <ul>
                        ${script.features.map(feature => `<li>${feature}</li>`).join('')}
                    </ul>
                </div>
                
                <div class="script-installation">
                    <h3>Installation</h3>
                    <ol>
                        <li>Make sure you have <a href="https://tampermonkey.net" target="_blank">Tampermonkey</a> installed in your browser</li>
                        <li>Click the "Install Script" button below to download the file</li>
                        <li>Open the downloaded .user.js file with a text editor</li>
                        <li>Copy all content and paste it into a new Tampermonkey script</li>
                        <li>Save the script (Ctrl+S) and navigate to ${script.game} to enjoy!</li>
                    </ol>
                </div>
                
                <div class="script-actions">
                    <button class="btn btn-primary" onclick="downloadScript('${script.downloadUrl}', '${script.title}');">
                        <i class="fas fa-download"></i>
                        Install Script
                    </button>
                </div>
            </div>
        </div>
    `;
    
    modalBody.innerHTML = modalContent;
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
    
    // Initialize video tabs if multiple videos exist
    initializeVideoTabs();
}

// Initialize video tabs functionality
function initializeVideoTabs() {
    const tabButtons = document.querySelectorAll('.video-tab-btn');
    const videoContainers = document.querySelectorAll('.video-container[data-video-index]');
    
    if (tabButtons.length <= 1) return; // No tabs needed
    
    tabButtons.forEach((button, index) => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons and containers
            tabButtons.forEach(btn => btn.classList.remove('active'));
            videoContainers.forEach(container => container.classList.remove('active'));
            
            // Add active class to clicked button and corresponding container
            button.classList.add('active');
            const targetContainer = document.querySelector(`.video-container[data-video-index="${index}"]`);
            if (targetContainer) {
                targetContainer.classList.add('active');
            }
        });
    });
}

// Initialize modal functionality
function initializeModal() {
    closeModal.onclick = () => {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    };
    
    window.onclick = (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    };
}

// Initialize statistics counter animation
function initializeStats() {
    const observerOptions = {
        threshold: 0.5,
        rootMargin: '0px 0px -100px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateStats();
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    const statsSection = document.querySelector('.stats');
    if (statsSection) {
        observer.observe(statsSection);
    }
}

// Animate statistics numbers
function animateStats() {
    const statNumbers = document.querySelectorAll('.stat-number');
    
    statNumbers.forEach(stat => {
        const target = parseInt(stat.getAttribute('data-target'));
        const duration = 2000;
        const step = target / (duration / 16);
        let current = 0;
        
        const timer = setInterval(() => {
            current += step;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            
            if (target > 1000) {
                stat.textContent = (current / 1000).toFixed(1) + 'K+';
            } else {
                stat.textContent = Math.floor(current).toLocaleString();
            }
        }, 16);
    });
}

// Initialize smooth scrolling for navigation links
function initializeSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const navHeight = document.querySelector('.navbar').offsetHeight;
                const targetPosition = target.offsetTop - navHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Initialize donation buttons - DISABLED to avoid conflicts with inline HTML implementation
function initializeDonationButtons() {
    // Disabled to use inline HTML implementation instead
    console.log('Donation buttons initialization disabled - using inline HTML implementation');
}

// Show GCash donation modal - DISABLED 
function showGCashModal() {
    // Disabled - using inline HTML QR container instead
    console.log('GCash modal disabled - using inline HTML QR container');
}

// Utility functions
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
}

function trackDownload(scriptName) {
    console.log(`Download tracked: ${scriptName}`);
    // Add your analytics tracking code here
    // Example: gtag('event', 'download', { 'script_name': scriptName });
}

function trackDonation(platform) {
    console.log(`Donation link clicked: ${platform}`);
    // Add your analytics tracking code here
    // Example: gtag('event', 'donation_click', { 'platform': platform });
}

// Add CSS for modal content
const modalStyles = `
<style>
.script-modal-header {
    padding: 2rem 2rem 1rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.script-modal-header h2 {
    margin: 0 0 1rem 0;
    color: #fff;
    font-size: 2rem;
}

.script-meta {
    display: flex;
    gap: 1rem;
    align-items: center;
}

.script-modal-content {
    padding: 2rem;
}

.video-container {
    position: relative;
    width: 100%;
    height: 0;
    padding-bottom: 56.25%;
    margin-bottom: 2rem;
    border-radius: 12px;
    overflow: hidden;
}

.video-container iframe {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
}

.script-stats {
    display: flex;
    gap: 2rem;
    margin-bottom: 2rem;
    flex-wrap: wrap;
}

.script-stats .stat {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: #ccc;
}

.script-stats .stat i {
    color: #00d4ff;
}

.script-details h3 {
    color: #fff;
    margin: 2rem 0 1rem 0;
    font-size: 1.2rem;
}

.script-details p {
    color: #ccc;
    line-height: 1.6;
    margin-bottom: 1rem;
}

.script-details ul,
.script-details ol {
    color: #ccc;
    line-height: 1.6;
    padding-left: 1.5rem;
}

.script-details li {
    margin-bottom: 0.5rem;
}

.script-details a {
    color: #00d4ff;
    text-decoration: none;
}

.script-details a:hover {
    text-decoration: underline;
}

.script-actions {
    margin-top: 2rem;
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
}

@media (max-width: 768px) {
    .script-stats {
        flex-direction: column;
        gap: 1rem;
    }
    
    .script-actions {
        flex-direction: column;
    }
    
    .modal-content {
        margin: 2% auto;
        width: 95%;
        max-height: 90vh;
    }
}
</style>
`;

// Add the styles to the document head
document.head.insertAdjacentHTML('beforeend', modalStyles);

// Loading animation for script cards
function showLoadingCards() {
    scriptsGrid.innerHTML = Array(6).fill().map(() => `
        <div class="script-card loading">
            <div class="script-header">
                <div class="script-title">Loading...</div>
                <div class="script-version">v0.0.0</div>
            </div>
            <div class="script-game">Loading game...</div>
            <div class="script-description">Loading description...</div>
            <div class="script-features">
                <ul>
                    <li>Loading feature...</li>
                    <li>Loading feature...</li>
                    <li>Loading feature...</li>
                </ul>
            </div>
            <div class="script-actions">
                <div class="btn btn-primary">
                    <i class="fas fa-spinner fa-spin"></i>
                    Loading...
                </div>
            </div>
        </div>
    `).join('');
}

// Download script function
async function downloadScript(scriptUrl, scriptTitle) {
    // Track the download
    trackDownload(scriptTitle);
    
    // Check if ShrinkMe integration is available and URL isn't already monetized
    if (window.shrinkMeIntegration && !scriptUrl.includes('shrinkme.io')) {
        try {
            // Show loading message
            const loadingToast = showToast('🔗 Preparing monetized download link...', 'info');
            
            // Create monetized link using quick link format
            const result = window.shrinkMeIntegration.monetizeUrl(scriptUrl);
            
            // Hide loading message
            if (loadingToast) loadingToast.remove();
            
            if (result.success) {
                // Show monetized link info
                showToast('💰 Supporting the developer - redirecting to secure download...', 'success');
                
                // Open the monetized link
                window.open(result.shortUrl, '_blank');
                
                // Show installation instructions after a delay
                setTimeout(() => {
                    showInstallationInstructions(scriptTitle);
                }, 2000);
                
                return;
            } else {
                console.warn('ShrinkMe monetization failed, falling back to direct download:', result.error);
                showToast('⚠️ Using direct download (monetization unavailable)', 'warning');
            }
        } catch (error) {
            console.error('Error in ShrinkMe integration:', error);
            showToast('⚠️ Using direct download (monetization error)', 'warning');
        }
    }
    
    // Fallback to direct download
    directDownload(scriptUrl, scriptTitle);
}

// Direct download function (fallback)
function directDownload(scriptUrl, scriptTitle) {
    // Create a blob to force regular download bypassing Tampermonkey
    fetch(scriptUrl)
        .then(response => response.text())
        .then(scriptContent => {
            const blob = new Blob([scriptContent], { type: 'text/plain' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = scriptUrl.split('/').pop().replace('.user.js', '.user.js.txt');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            
            // Show installation instructions
            setTimeout(() => {
                showInstallationInstructions(scriptTitle);
            }, 500);
        })
        .catch(error => {
            console.error('Download error:', error);
            showToast('❌ Download failed. Please try again.', 'error');
        });
}

// Show installation instructions
function showInstallationInstructions(scriptTitle) {
    alert(`✅ ${scriptTitle} Downloaded!\n\n` +
          `📋 Manual Installation Steps:\n` +
          `1. Find the downloaded file in your Downloads folder\n` +
          `2. Open it with any text editor (Notepad, etc.)\n` +
          `3. Copy all the content (Ctrl+A, then Ctrl+C)\n` +
          `4. Click the Tampermonkey icon in your browser\n` +
          `5. Select "Create a new script"\n` +
          `6. Delete everything and paste the copied content\n` +
          `7. Press Ctrl+S to save\n\n` +
          `🎮 The script is now ready to use on Pockie Ninja!`);
}

// Toast notification system
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#4CAF50' : type === 'warning' ? '#FF9800' : type === 'error' ? '#F44336' : '#2196F3'};
        color: white;
        padding: 16px 24px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        max-width: 400px;
        font-size: 14px;
        line-height: 1.4;
        animation: slideInRight 0.3s ease-out;
    `;
    
    toast.textContent = message;
    document.body.appendChild(toast);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (toast.parentNode) {
            toast.style.animation = 'slideOutRight 0.3s ease-in';
            setTimeout(() => toast.remove(), 300);
        }
    }, 5000);
    
    return toast;
}

// Add CSS for toast animations
if (!document.getElementById('toast-styles')) {
    const style = document.createElement('style');
    style.id = 'toast-styles';
    style.textContent = `
        @keyframes slideInRight {
            from { transform: translateX(400px); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOutRight {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(400px); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
}
