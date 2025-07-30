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
    // Always use direct download
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

// Review System Functionality
function initializeReviewSystem() {
    const addReviewBtn = document.getElementById('addReviewBtn');
    const loadMoreBtn = document.getElementById('loadMoreReviews');
    
    if (addReviewBtn) {
        addReviewBtn.addEventListener('click', openReviewModal);
    }
    
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', loadMoreReviews);
    }
    
    // Initialize helpful buttons
    initializeHelpfulButtons();
}

function openReviewModal() {
    // Create review modal HTML
    const reviewModalHTML = `
        <div class="review-modal-overlay" id="reviewModalOverlay">
            <div class="review-modal">
                <div class="review-modal-header">
                    <h3>Write a Review</h3>
                    <button class="review-modal-close" id="reviewModalClose">&times;</button>
                </div>
                <div class="review-modal-body">
                    <form id="reviewForm">
                        <div class="form-group">
                            <label for="reviewerName">Your Name *</label>
                            <input type="text" id="reviewerName" required maxlength="50" placeholder="Enter your name">
                        </div>
                        
                        <div class="form-group">
                            <label for="reviewScript">Script Used *</label>
                            <select id="reviewScript" required>
                                <option value="">Select a script</option>
                                <option value="Auto Battle V3.8">Auto Battle V3.8</option>
                                <option value="Auto Clicker Pro">Auto Clicker Pro</option>
                                <option value="TB Auto Battle V5">TB Auto Battle V5</option>
                                <option value="Pockie Auto Battle">Pockie Auto Battle</option>
                                <option value="Auto Battle Smart Health">Auto Battle Smart Health</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label for="reviewRating">Rating *</label>
                            <div class="star-rating" id="starRating">
                                <span class="star" data-rating="1">☆</span>
                                <span class="star" data-rating="2">☆</span>
                                <span class="star" data-rating="3">☆</span>
                                <span class="star" data-rating="4">☆</span>
                                <span class="star" data-rating="5">☆</span>
                            </div>
                            <input type="hidden" id="reviewRating" value="">
                        </div>
                        
                        <div class="form-group">
                            <label for="reviewText">Your Review *</label>
                            <textarea id="reviewText" required rows="4" maxlength="500" 
                                placeholder="Share your experience with the script. What worked well? Any issues you encountered?"></textarea>
                            <div class="char-counter">
                                <span id="charCount">0</span>/500 characters
                            </div>
                        </div>
                        
                        <div class="form-actions">
                            <button type="button" class="btn btn-secondary" id="cancelReview">Cancel</button>
                            <button type="submit" class="btn btn-primary">Submit Review</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;
    
    // Add modal to body
    document.body.insertAdjacentHTML('beforeend', reviewModalHTML);
    
    // Initialize modal functionality
    initializeReviewModal();
}

function initializeReviewModal() {
    const overlay = document.getElementById('reviewModalOverlay');
    const closeBtn = document.getElementById('reviewModalClose');
    const cancelBtn = document.getElementById('cancelReview');
    const form = document.getElementById('reviewForm');
    const starRating = document.getElementById('starRating');
    const reviewText = document.getElementById('reviewText');
    const charCount = document.getElementById('charCount');
    
    // Close modal functionality
    const closeModal = () => {
        overlay.remove();
    };
    
    closeBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) closeModal();
    });
    
    // Star rating functionality
    let selectedRating = 0;
    starRating.addEventListener('click', (e) => {
        if (e.target.classList.contains('star')) {
            selectedRating = parseInt(e.target.dataset.rating);
            document.getElementById('reviewRating').value = selectedRating;
            updateStarDisplay(selectedRating);
        }
    });
    
    starRating.addEventListener('mouseover', (e) => {
        if (e.target.classList.contains('star')) {
            const hoverRating = parseInt(e.target.dataset.rating);
            updateStarDisplay(hoverRating);
        }
    });
    
    starRating.addEventListener('mouseleave', () => {
        updateStarDisplay(selectedRating);
    });
    
    function updateStarDisplay(rating) {
        const stars = starRating.querySelectorAll('.star');
        stars.forEach((star, index) => {
            if (index < rating) {
                star.textContent = '★';
                star.style.color = '#ffd700';
            } else {
                star.textContent = '☆';
                star.style.color = '#ddd';
            }
        });
    }
    
    // Character counter
    reviewText.addEventListener('input', () => {
        charCount.textContent = reviewText.value.length;
    });
    
    // Form submission
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        submitReview();
    });
}

function submitReview() {
    const reviewerName = document.getElementById('reviewerName').value.trim();
    const reviewScript = document.getElementById('reviewScript').value;
    const reviewRating = document.getElementById('reviewRating').value;
    const reviewText = document.getElementById('reviewText').value.trim();
    
    // Validation
    if (!reviewerName || !reviewScript || !reviewRating || !reviewText) {
        showToast('Please fill in all required fields', 'error');
        return;
    }
    
    if (reviewRating < 1 || reviewRating > 5) {
        showToast('Please select a rating', 'error');
        return;
    }
    
    // Create review object
    const newReview = {
        id: Date.now(),
        name: reviewerName,
        script: reviewScript,
        rating: parseInt(reviewRating),
        text: reviewText,
        date: 'Just now',
        helpful: 0
    };
    
    // Add review to the list
    addReviewToList(newReview);
    
    // Close modal
    document.getElementById('reviewModalOverlay').remove();
    
    // Show success message
    showToast('Thank you for your review! Your feedback helps our community.', 'success');
    
    // Scroll to reviews section
    document.getElementById('reviews').scrollIntoView({ behavior: 'smooth' });
}

function addReviewToList(review) {
    const reviewsList = document.getElementById('reviewsList');
    const loadMoreSection = document.querySelector('.load-more-section');
    
    // Generate stars HTML
    const starsHTML = Array(5).fill(0).map((_, i) => {
        const starClass = i < review.rating ? 'fas fa-star' : 'far fa-star';
        return `<i class="${starClass}"></i>`;
    }).join('');
    
    // Generate avatar initials
    const initials = review.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    
    const reviewHTML = `
        <div class="review-item new-review">
            <div class="review-header">
                <div class="reviewer-info">
                    <div class="avatar">${initials}</div>
                    <div class="reviewer-details">
                        <h4>${review.name}</h4>
                        <div class="review-meta">
                            <div class="stars">
                                ${starsHTML}
                            </div>
                            <span class="review-date">${review.date}</span>
                        </div>
                    </div>
                </div>
                <div class="review-script">${review.script}</div>
            </div>
            <div class="review-content">
                <p>${review.text}</p>
            </div>
            <div class="review-actions">
                <button class="helpful-btn" data-review-id="${review.id}">
                    <i class="fas fa-thumbs-up"></i> Helpful (${review.helpful})
                </button>
                <button class="reply-btn"><i class="fas fa-reply"></i> Reply</button>
            </div>
        </div>
    `;
    
    // Insert at the beginning of the reviews list
    reviewsList.insertAdjacentHTML('afterbegin', reviewHTML);
    
    // Add animation
    const newReviewElement = reviewsList.querySelector('.new-review');
    newReviewElement.style.opacity = '0';
    newReviewElement.style.transform = 'translateY(20px)';
    
    setTimeout(() => {
        newReviewElement.style.transition = 'all 0.5s ease';
        newReviewElement.style.opacity = '1';
        newReviewElement.style.transform = 'translateY(0)';
        newReviewElement.classList.remove('new-review');
    }, 100);
    
    // Initialize helpful button for new review
    initializeHelpfulButtons();
}

function initializeHelpfulButtons() {
    const helpfulBtns = document.querySelectorAll('.helpful-btn');
    helpfulBtns.forEach(btn => {
        // Remove existing listeners to prevent duplicates
        btn.replaceWith(btn.cloneNode(true));
    });
    
    // Add new listeners
    document.querySelectorAll('.helpful-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const currentCount = parseInt(btn.textContent.match(/\d+/)[0]);
            const newCount = currentCount + 1;
            btn.innerHTML = `<i class="fas fa-thumbs-up"></i> Helpful (${newCount})`;
            btn.disabled = true;
            btn.style.opacity = '0.6';
            showToast('Thanks for your feedback!', 'success');
        });
    });
}

function loadMoreReviews() {
    const loadMoreBtn = document.getElementById('loadMoreReviews');
    loadMoreBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
    loadMoreBtn.disabled = true;
    
    // Simulate loading delay
    setTimeout(() => {
        showToast('No more reviews to load at this time.', 'info');
        loadMoreBtn.innerHTML = '<i class="fas fa-chevron-down"></i> Load More Reviews';
        loadMoreBtn.disabled = false;
    }, 1000);
}

// Initialize review system when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeReviewSystem();
});
