// ShrinkMe.io API Integration for Script Downloads
class ShrinkMeIntegration {
    constructor() {
        this.service = 'ShrinkMe.io'; 
        this.apiKey = '3aead091082ee00ffd8b9a65ef383c5cce97d39b';
        this.apiBase = 'https://shrinkme.io/api';
    }

    // Create a shortened link using ShrinkMe.io API
    async createShortLink(originalUrl, customAlias = null) {
        try {
            console.log('Creating ShrinkMe.io short link for:', originalUrl);
            
            // Build API URL
            let apiUrl = `${this.apiBase}?api=${this.apiKey}&url=${encodeURIComponent(originalUrl)}`;
            
            // Add custom alias if provided
            if (customAlias) {
                apiUrl += `&alias=${encodeURIComponent(customAlias)}`;
            }
            
            console.log('ShrinkMe.io API URL:', apiUrl);
            
            // Fetch the shortened URL using JSON response
            const response = await fetch(apiUrl);
            const result = await response.json();
            
            console.log('ShrinkMe.io API Response:', result);
            
            if (result.status === 'success') {
                console.log('ShrinkMe.io Short Link created:', result.shortenedUrl);
                return {
                    success: true,
                    shortUrl: result.shortenedUrl,
                    originalUrl: originalUrl,
                    service: 'ShrinkMe.io API'
                };
            } else {
                throw new Error(result.message || 'API returned error status');
            }
        } catch (error) {
            console.error('ShrinkMe.io API Error:', error);
            // Fallback to original URL
            return {
                success: false,
                error: error.message,
                fallbackUrl: originalUrl,
                shortUrl: originalUrl // Use original URL as fallback
            };
        }
    }

    // Quick link creation (synchronous fallback)
    createQuickLink(originalUrl) {
        console.log('Creating ShrinkMe.io link for:', originalUrl);
        
        // For synchronous calls, we'll start the async process but return original URL immediately
        // The async process will update the UI when complete
        this.createShortLink(originalUrl).then(result => {
            if (result.success) {
                console.log('✅ ShrinkMe.io link created:', result.shortUrl);
                // Trigger a custom event to update UI if needed
                window.dispatchEvent(new CustomEvent('shrinkMeReady', {
                    detail: { originalUrl, result }
                }));
            }
        });
        
        // Return immediate response for testing
        return {
            success: true,
            shortUrl: originalUrl, // Will be updated async
            originalUrl: originalUrl,
            service: 'ShrinkMe.io (Processing...)'
        };
    }

    // Process all script download links
    processScriptDownloads() {
        const scriptCards = document.querySelectorAll('.script-card');
        
        for (const card of scriptCards) {
            const downloadBtn = card.querySelector('.download-btn, .btn-primary');
            if (downloadBtn && downloadBtn.href) {
                const originalUrl = downloadBtn.href;
                
                // Skip if already processed or is not a script file
                if (originalUrl.includes('shrinkme.io') || !originalUrl.includes('.user.js')) {
                    continue;
                }

                // Create ShrinkMe.io short link asynchronously
                const filename = originalUrl.split('/').pop();
                const customAlias = `pn-${filename.replace('.user.js', '')}`;
                
                this.createShortLink(originalUrl, customAlias).then(result => {
                    if (result.success) {
                        downloadBtn.href = result.shortUrl;
                        downloadBtn.title = `Download via ${result.service} (${result.originalUrl})`;
                        console.log(`✅ Updated download button with ${result.service} link:`, result.shortUrl);
                        
                        // Add visual indicator that monetization is active
                        downloadBtn.style.boxShadow = '0 0 8px rgba(76, 175, 80, 0.3)';
                        downloadBtn.setAttribute('data-monetized', 'true');
                    } else {
                        console.log(`ℹ️ Using original URL for ${filename}: ${result.error}`);
                        // Keep original URL - no change needed
                    }
                });
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

    // Test the API with a real call
    async testAPI() {
        const testUrl = 'https://example.com/test-script.user.js';
        console.log('🧪 Testing ShrinkMe.io API with:', testUrl);
        
        const result = await this.createShortLink(testUrl, 'api-test');
        
        if (result.success) {
            console.log('✅ API Test Successful!', result);
            return result;
        } else {
            console.log('❌ API Test Failed:', result.error);
            return result;
        }
    }
}

// Initialize the ShrinkMe.io integration
const shrinkMeIntegration = new ShrinkMeIntegration();

// Make it available globally for testing and script downloads
window.shrinkMeIntegration = shrinkMeIntegration;

// Initialize when the script loads
shrinkMeIntegration.init();

console.log('✅ ShrinkMe.io API Integration loaded with API key:', shrinkMeIntegration.apiKey.substring(0, 10) + '...');
window.shrinkMeIntegration = new ShrinkMeIntegration();

// Auto-initialize
window.shrinkMeIntegration.init();

// Export for manual use
window.monetizeDownload = async function(url, alias = null) {
    return await window.shrinkMeIntegration.monetizeUrl(url, alias);
};
