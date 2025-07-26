// ShrinkMe.io Integration for Script Downloads
class ShrinkMeIntegration {
    constructor() {
        this.apiKey = '3aead091082ee00ffd8b9a65ef383c5cce97d39b';
        this.quickLinkBase = 'https://shrinkme.io/st?api=3aead091082ee00ffd8b9a65ef383c5cce97d39b&url=';
    }

    // Create a shortened link using the quick link format
    createQuickLink(originalUrl) {
        try {
            console.log('Creating ShrinkMe quick link for:', originalUrl);
            
            // Use the quick link format: base + URL (no encoding needed for quick links)
            const shortUrl = this.quickLinkBase + originalUrl;
            
            console.log('ShrinkMe Quick Link:', shortUrl);
            
            return {
                success: true,
                shortUrl: shortUrl,
                originalUrl: originalUrl
            };
        } catch (error) {
            console.error('ShrinkMe Quick Link Error:', error);
            return {
                success: false,
                error: error.message,
                fallbackUrl: originalUrl
            };
        }
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

                // Create quick link
                const result = this.createQuickLink(originalUrl);
                
                if (result.success) {
                    // Update the download button with shortened URL
                    downloadBtn.href = result.shortUrl;
                    downloadBtn.setAttribute('data-original-url', originalUrl);
                    downloadBtn.setAttribute('data-monetized', 'true');
                    
                    const scriptTitle = card.querySelector('h3')?.textContent || 'Script';
                    console.log(`✅ Monetized: ${scriptTitle} -> ${result.shortUrl}`);
                } else {
                    console.warn(`❌ Failed to monetize: ${scriptTitle} - ${result.error}`);
                    // Keep original URL as fallback
                }
            }
        }
    }

    // Initialize monetization when DOM is ready
    init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.processScriptDownloads());
        } else {
            this.processScriptDownloads();
        }
    }

    // Manual method to monetize a specific URL
    monetizeUrl(url, customAlias = null) {
        return this.createQuickLink(url);
    }
}

// Global instance
window.shrinkMeIntegration = new ShrinkMeIntegration();

// Auto-initialize
window.shrinkMeIntegration.init();

// Export for manual use
window.monetizeDownload = async function(url, alias = null) {
    return await window.shrinkMeIntegration.monetizeUrl(url, alias);
};
