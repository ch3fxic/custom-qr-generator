// Configuration file for frontend
// Update these values based on your deployment

const CONFIG = {
    // Backend API URL
    // Development: 'http://localhost:3000'
    // Production: 'https://your-backend.vercel.app' or 'https://your-backend.railway.app'
    API_URL: 'http://localhost:3000',
    
    // Local storage keys
    STORAGE_KEYS: {
        RECENT_QR_CODES: 'qr_recent_codes',
        DARK_MODE: 'qr_dark_mode',
        MAX_RECENT_ITEMS: 10
    },
    
    // QR Code default settings
    QR_DEFAULTS: {
        width: 300,
        height: 300,
        margin: 10,
        imageOptions: {
            hideBackgroundDots: true,
            imageSize: 0.4,
            margin: 5
        }
    }
};

// Detect if running on GitHub Pages and adjust API URL
if (window.location.hostname.includes('github.io')) {
    // TODO: Update this to your actual Vercel backend URL after deployment
    // Example: CONFIG.API_URL = 'https://custom-qr-generator-abc123.vercel.app';
    CONFIG.API_URL = 'https://your-backend.vercel.app'; // ⚠️ REPLACE THIS!
    console.log('Running on GitHub Pages, using production API');
}
