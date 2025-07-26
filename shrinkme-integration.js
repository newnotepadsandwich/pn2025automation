// ShrinkMe.io Manual Links Integration for Script Downloads
class ShrinkMeIntegration {
    constructor() {
        this.service = 'ShrinkMe.io'; 
        // Your manually created ShrinkMe.io links with descriptions
        this.manualLinks = {
            'pockie-tb-auto-battle-v5.user.js': 'https://shrinkme.ink/FmY5oNA', // Auto Battle - TB v5.0 (Beta Test)
            'auto-battle-v3.8-smart-health.user.js': 'https://shrinkme.ink/hYsO', // Auto Battle V3.8 (Smart Health Detection)
            'auto-battle-v3-stable.user.js': 'https://shrinkme.ink/n2nsb', // Auto Battle V3 (Stable Edition)
            'auto-open-items-v1.8.user.js': 'https://shrinkme.ink/9XteBa', // Auto Open Items 1.8 (Speed Slider)
            'auto-refine-enhance-v4.0.user.js': 'https://shrinkme.ink/qDJYxBa', // Auto Refine, Enhance, Inscribe & Recast 4.0
            'auto-synthesize-soul-v3.0.user.js': 'https://shrinkme.ink/JASu', // Auto Synthesize Soul v3.0
            // Add more as you create them
            'auto-clicker-pro.user.js': null, // Create ShrinkMe.io link for this
            'pockie-auto-battle.user.js': null // Create ShrinkMe.io link for this
        };
    }

    // Get manually created ShrinkMe.io link
    getManualLink(originalUrl) {
        try {
            console.log('Looking up manual ShrinkMe.io link for:', originalUrl);
            
            // Extract filename from URL
            const filename = originalUrl.split('/').pop();
            const shortUrl = this.manualLinks[filename];
            
            if (shortUrl) {
                console.log('Found manual ShrinkMe.io link:', shortUrl);
                return {
                    success: true,
                    shortUrl: shortUrl,
                    originalUrl: originalUrl,
                    service: 'ShrinkMe.io (Manual)'
                };
            } else {
                console.log('No manual link found for:', filename, '- using original URL');
                return {
                    success: false,
                    error: 'No ShrinkMe.io link configured for this script yet',
                    fallbackUrl: originalUrl,
                    shortUrl: originalUrl // Use original URL as fallback
                };
            }
        } catch (error) {
            console.error('Manual ShrinkMe.io lookup error:', error);
            return {
                success: false,
                error: error.message,
                fallbackUrl: originalUrl,
                shortUrl: originalUrl
            };
        }
    }

    // Quick link creation (for testing and immediate use)
    createQuickLink(originalUrl) {
        console.log('Creating ShrinkMe.io link for:', originalUrl);
        return this.getManualLink(originalUrl);
    }

    // Process all script download links
    processScriptDownloads() {
        const scriptCards = document.querySelectorAll('.script-card');
        
        for (const card of scriptCards) {
            const downloadBtn = card.querySelector('.download-btn, .btn-primary');
            if (downloadBtn && downloadBtn.href) {
                const originalUrl = downloadBtn.href;
                
                // Skip if already processed or is not a script file
                if (originalUrl.includes('shrinkme.i') || !originalUrl.includes('.user.js')) {
                    continue;
                }

                // Get manual ShrinkMe.io link
                const result = this.getManualLink(originalUrl);
                
                if (result.success) {
                    downloadBtn.href = result.shortUrl;
                    downloadBtn.title = `Download via ${result.service} (${result.originalUrl})`;
                    console.log(`✅ Updated download button with ${result.service} link:`, result.shortUrl);
                    
                    // Add visual indicator that monetization is active
                    downloadBtn.style.boxShadow = '0 0 8px rgba(76, 175, 80, 0.3)';
                    downloadBtn.setAttribute('data-monetized', 'true');
                } else {
                    console.log(`ℹ️ Using original URL for ${originalUrl.split('/').pop()}: ${result.error}`);
                    // Keep original URL - no change needed
                }
            }
        }
    }

    // Initialize when DOM is ready
    init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.processScriptDownloads());
        } else {
            this.processScriptDownloads();
        }
    }

    // Method for backward compatibility (used by test function)
    monetizeUrl(url) {
        return this.createQuickLink(url);
    }

    // Test with your actual links
    testManualLinks() {
        console.log('🧪 Testing Manual ShrinkMe.io Links');
        const testUrl = 'https://newnotepadsandwich.github.io/pn2025automation/scripts/pockie-tb-auto-battle-v5.user.js';
        const result = this.getManualLink(testUrl);
        
        if (result.success) {
            console.log('✅ Manual Link Test Successful!', result);
        } else {
            console.log('❌ Manual Link Test Failed:', result.error);
        }
        return result;
    }
}

// Initialize the ShrinkMe.io integration
const shrinkMeIntegration = new ShrinkMeIntegration();

// Make it available globally for testing and script downloads
window.shrinkMeIntegration = shrinkMeIntegration;

// Initialize when the script loads
shrinkMeIntegration.init();

console.log('✅ ShrinkMe.io Manual Links Integration loaded with', Object.keys(shrinkMeIntegration.manualLinks).length, 'monetized scripts');
window.shrinkMeIntegration = new ShrinkMeIntegration();

// Auto-initialize
window.shrinkMeIntegration.init();

// Export for manual use
window.monetizeDownload = async function(url, alias = null) {
    return await window.shrinkMeIntegration.monetizeUrl(url, alias);
};
