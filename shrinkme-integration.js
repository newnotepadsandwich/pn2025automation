// ShrinkMe.io integration disabled; always return direct download link
class ShrinkMeIntegration {
    getManualLink(originalUrl) {
        return {
            success: true,
            shortUrl: originalUrl,
            originalUrl: originalUrl,
            service: 'Direct Download'
        };
    }
}

// Initialize the ShrinkMe.io integration
const shrinkMeIntegration = new ShrinkMeIntegration();
window.shrinkMeIntegration = shrinkMeIntegration;

// Export for manual use
window.monetizeDownload = async function(url, alias = null) {
    // Always return direct download
    return {
        success: true,
        shortUrl: url,
        originalUrl: url,
        service: 'Direct Download'
    };
};
