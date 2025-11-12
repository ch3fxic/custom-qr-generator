// Main Application Logic
// Coordinates QR generation, analytics, and UI interactions

// Initialize modules
const qrGenerator = new QRGenerator();
const analytics = new Analytics(CONFIG.API_URL);

// State management
let currentQRData = {
    originalUrl: '',
    trackingUrl: '',
    shortId: '',
    styleOptions: {}
};

// DOM Elements
const elements = {
    urlInput: document.getElementById('urlInput'),
    fgColor: document.getElementById('fgColor'),
    bgColor: document.getElementById('bgColor'),
    gradientToggle: document.getElementById('gradientToggle'),
    gradientOptions: document.getElementById('gradientOptions'),
    gradientColor1: document.getElementById('gradientColor1'),
    gradientColor2: document.getElementById('gradientColor2'),
    dotStyle: document.getElementById('dotStyle'),
    cornerStyle: document.getElementById('cornerStyle'),
    logoUpload: document.getElementById('logoUpload'),
    generateBtn: document.getElementById('generateBtn'),
    qrPreview: document.getElementById('qrPreview'),
    qrPlaceholder: document.getElementById('qrPlaceholder'),
    downloadCard: document.getElementById('downloadCard'),
    trackingCard: document.getElementById('trackingCard'),
    downloadPng: document.getElementById('downloadPng'),
    downloadSvg: document.getElementById('downloadSvg'),
    downloadPdf: document.getElementById('downloadPdf'),
    trackingUrl: document.getElementById('trackingUrl'),
    qrCodeId: document.getElementById('qrCodeId'),
    copyTrackingUrl: document.getElementById('copyTrackingUrl'),
    viewAnalyticsBtn: document.getElementById('viewAnalyticsBtn'),
    analyticsModal: document.getElementById('analyticsModal'),
    analyticsContent: document.getElementById('analyticsContent'),
    closeAnalyticsModal: document.getElementById('closeAnalyticsModal'),
    recentQRCodes: document.getElementById('recentQRCodes'),
    clearHistoryBtn: document.getElementById('clearHistoryBtn'),
    darkModeToggle: document.getElementById('darkModeToggle'),
    alertContainer: document.getElementById('alertContainer')
};

// Initialize application
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
    setupEventListeners();
    loadDarkMode();
    loadRecentQRCodes();
});

/**
 * Initialize the application
 */
function initializeApp() {
    qrGenerator.init();
    console.log('✅ QR Generator initialized');
}

/**
 * Setup all event listeners
 */
function setupEventListeners() {
    // Generate button
    elements.generateBtn.addEventListener('click', handleGenerate);

    // Real-time preview updates
    elements.urlInput.addEventListener('input', debounce(updatePreview, 500));
    elements.fgColor.addEventListener('input', updatePreview);
    elements.bgColor.addEventListener('input', updatePreview);
    elements.gradientColor1.addEventListener('input', updatePreview);
    elements.gradientColor2.addEventListener('input', updatePreview);
    elements.dotStyle.addEventListener('change', updatePreview);
    elements.cornerStyle.addEventListener('change', updatePreview);

    // Gradient toggle
    elements.gradientToggle.addEventListener('change', (e) => {
        elements.gradientOptions.classList.toggle('hidden', !e.target.checked);
        updatePreview();
    });

    // Logo upload
    elements.logoUpload.addEventListener('change', handleLogoUpload);

    // Download buttons
    elements.downloadPng.addEventListener('click', () => downloadQR('png'));
    elements.downloadSvg.addEventListener('click', () => downloadQR('svg'));
    elements.downloadPdf.addEventListener('click', () => downloadQR('pdf'));

    // Copy tracking URL
    elements.copyTrackingUrl.addEventListener('click', copyTrackingUrl);

    // View analytics
    elements.viewAnalyticsBtn.addEventListener('click', showAnalytics);
    elements.closeAnalyticsModal.addEventListener('click', hideAnalytics);

    // Clear history
    elements.clearHistoryBtn.addEventListener('click', clearHistory);

    // Dark mode toggle
    elements.darkModeToggle.addEventListener('click', toggleDarkMode);

    // Close modal on outside click
    elements.analyticsModal.addEventListener('click', (e) => {
        if (e.target === elements.analyticsModal) {
            hideAnalytics();
        }
    });
}

/**
 * Handle QR code generation
 */
async function handleGenerate() {
    const url = elements.urlInput.value.trim();

    if (!url) {
        showAlert('Please enter a URL or text', 'error');
        return;
    }

    // Show loading state
    elements.generateBtn.disabled = true;
    elements.generateBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Generating...';

    try {
        // Get style options
        const styleOptions = getStyleOptions();

        // Create tracking URL via backend
        const response = await analytics.createTrackingUrl(url, styleOptions);
        
        currentQRData = {
            originalUrl: url,
            trackingUrl: response.trackingUrl,
            shortId: response.shortId,
            styleOptions: styleOptions
        };

        // Generate QR code with tracking URL
        qrGenerator.generate(response.trackingUrl, styleOptions);
        qrGenerator.render('qrPreview');

        // Show QR code and download options
        elements.qrPlaceholder.classList.add('hidden');
        elements.qrPreview.classList.remove('hidden');
        elements.downloadCard.classList.remove('hidden');
        elements.trackingCard.classList.remove('hidden');

        // Update tracking info
        elements.trackingUrl.value = response.trackingUrl;
        elements.qrCodeId.value = response.shortId;

        // Save to recent
        saveToRecent(currentQRData);

        showAlert('QR code generated successfully! 🎉', 'success');

    } catch (error) {
        console.error('Error generating QR:', error);
        showAlert('Failed to generate QR code. Please try again.', 'error');
    } finally {
        // Reset button state
        elements.generateBtn.disabled = false;
        elements.generateBtn.innerHTML = '<i class="fas fa-magic mr-2"></i>Generate QR Code';
    }
}

/**
 * Update live preview
 */
function updatePreview() {
    const url = elements.urlInput.value.trim();
    
    if (!url) {
        elements.qrPlaceholder.classList.remove('hidden');
        elements.qrPreview.classList.add('hidden');
        return;
    }

    const styleOptions = getStyleOptions();
    
    qrGenerator.generate(url, styleOptions);
    qrGenerator.render('qrPreview');
    
    elements.qrPlaceholder.classList.add('hidden');
    elements.qrPreview.classList.remove('hidden');
}

/**
 * Get current style options from form
 */
function getStyleOptions() {
    return {
        fgColor: elements.fgColor.value,
        bgColor: elements.bgColor.value,
        useGradient: elements.gradientToggle.checked,
        gradientColor1: elements.gradientColor1.value,
        gradientColor2: elements.gradientColor2.value,
        dotStyle: elements.dotStyle.value,
        cornerStyle: elements.cornerStyle.value
    };
}

/**
 * Handle logo upload
 */
function handleLogoUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
        qrGenerator.setLogo(event.target.result);
        updatePreview();
    };
    reader.readAsDataURL(file);
}

/**
 * Download QR code in specified format
 */
async function downloadQR(format) {
    try {
        const filename = `qr-code-${currentQRData.shortId || Date.now()}`;
        
        switch (format) {
            case 'png':
                await qrGenerator.downloadPNG(filename);
                break;
            case 'svg':
                await qrGenerator.downloadSVG(filename);
                break;
            case 'pdf':
                await qrGenerator.downloadPDF(filename);
                break;
        }
        
        showAlert(`Downloaded as ${format.toUpperCase()}! 📥`, 'success');
    } catch (error) {
        console.error('Download error:', error);
        showAlert('Failed to download. Please try again.', 'error');
    }
}

/**
 * Copy tracking URL to clipboard
 */
async function copyTrackingUrl() {
    try {
        await navigator.clipboard.writeText(elements.trackingUrl.value);
        showAlert('Tracking URL copied to clipboard! 📋', 'success');
        
        // Visual feedback
        const icon = elements.copyTrackingUrl.querySelector('i');
        icon.classList.remove('fa-copy');
        icon.classList.add('fa-check');
        setTimeout(() => {
            icon.classList.remove('fa-check');
            icon.classList.add('fa-copy');
        }, 2000);
    } catch (error) {
        showAlert('Failed to copy URL', 'error');
    }
}

/**
 * Show analytics modal
 */
async function showAnalytics() {
    if (!currentQRData.shortId) {
        showAlert('No QR code selected', 'error');
        return;
    }

    elements.analyticsModal.classList.remove('hidden');
    elements.analyticsContent.innerHTML = '<div class="flex justify-center items-center h-64"><div class="spinner"></div></div>';

    try {
        const stats = await analytics.getStats(currentQRData.shortId);
        const html = analytics.formatAnalyticsHTML(stats);
        elements.analyticsContent.innerHTML = html;
    } catch (error) {
        console.error('Error loading analytics:', error);
        elements.analyticsContent.innerHTML = `
            <div class="text-center text-red-500">
                <i class="fas fa-exclamation-triangle text-4xl mb-4"></i>
                <p>Failed to load analytics. Please try again.</p>
            </div>
        `;
    }
}

/**
 * Hide analytics modal
 */
function hideAnalytics() {
    elements.analyticsModal.classList.add('hidden');
}

/**
 * Save QR code to recent history
 */
function saveToRecent(qrData) {
    try {
        let recent = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.RECENT_QR_CODES) || '[]');
        
        // Add new item to beginning
        recent.unshift({
            ...qrData,
            timestamp: new Date().toISOString()
        });

        // Limit to max items
        recent = recent.slice(0, CONFIG.STORAGE_KEYS.MAX_RECENT_ITEMS);

        localStorage.setItem(CONFIG.STORAGE_KEYS.RECENT_QR_CODES, JSON.stringify(recent));
        loadRecentQRCodes();
    } catch (error) {
        console.error('Error saving to recent:', error);
    }
}

/**
 * Load recent QR codes from localStorage
 */
function loadRecentQRCodes() {
    try {
        const recent = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.RECENT_QR_CODES) || '[]');
        
        if (recent.length === 0) {
            elements.recentQRCodes.innerHTML = `
                <div class="col-span-full text-center text-gray-500 py-8">
                    <i class="fas fa-inbox text-4xl mb-2"></i>
                    <p>No recent QR codes</p>
                </div>
            `;
            return;
        }

        elements.recentQRCodes.innerHTML = recent.map((qr, index) => `
            <div class="recent-qr-card bg-gray-50 dark:bg-gray-700 rounded-lg p-4 shadow">
                <div class="flex justify-between items-start mb-3">
                    <div class="flex-1 min-w-0">
                        <h3 class="font-semibold text-gray-800 dark:text-white text-sm truncate">
                            ${qr.originalUrl}
                        </h3>
                        <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            ${new Date(qr.timestamp).toLocaleDateString()}
                        </p>
                    </div>
                </div>
                <div class="flex space-x-2">
                    <button 
                        onclick="loadRecentQR(${index})"
                        class="flex-1 py-2 px-3 bg-primary text-white text-sm rounded hover:opacity-90 transition"
                        title="Load this QR code"
                    >
                        <i class="fas fa-redo mr-1"></i>Load
                    </button>
                    <button 
                        onclick="viewRecentAnalytics('${qr.shortId}')"
                        class="flex-1 py-2 px-3 bg-purple-500 text-white text-sm rounded hover:opacity-90 transition"
                        title="View analytics"
                    >
                        <i class="fas fa-chart-bar mr-1"></i>Stats
                    </button>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading recent:', error);
    }
}

/**
 * Load a recent QR code
 */
window.loadRecentQR = function(index) {
    try {
        const recent = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.RECENT_QR_CODES) || '[]');
        const qr = recent[index];
        
        if (!qr) return;

        // Populate form
        elements.urlInput.value = qr.originalUrl;
        if (qr.styleOptions) {
            elements.fgColor.value = qr.styleOptions.fgColor || '#000000';
            elements.bgColor.value = qr.styleOptions.bgColor || '#ffffff';
            elements.dotStyle.value = qr.styleOptions.dotStyle || 'square';
            elements.cornerStyle.value = qr.styleOptions.cornerStyle || 'square';
            
            if (qr.styleOptions.useGradient) {
                elements.gradientToggle.checked = true;
                elements.gradientOptions.classList.remove('hidden');
                elements.gradientColor1.value = qr.styleOptions.gradientColor1 || '#667eea';
                elements.gradientColor2.value = qr.styleOptions.gradientColor2 || '#764ba2';
            }
        }

        currentQRData = qr;
        
        // Generate QR
        qrGenerator.generate(qr.trackingUrl, qr.styleOptions);
        qrGenerator.render('qrPreview');
        
        // Show UI elements
        elements.qrPlaceholder.classList.add('hidden');
        elements.qrPreview.classList.remove('hidden');
        elements.downloadCard.classList.remove('hidden');
        elements.trackingCard.classList.remove('hidden');
        elements.trackingUrl.value = qr.trackingUrl;
        elements.qrCodeId.value = qr.shortId;

        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        showAlert('QR code loaded!', 'success');
    } catch (error) {
        console.error('Error loading recent QR:', error);
        showAlert('Failed to load QR code', 'error');
    }
};

/**
 * View analytics for a recent QR code
 */
window.viewRecentAnalytics = async function(shortId) {
    currentQRData.shortId = shortId;
    await showAnalytics();
};

/**
 * Clear history
 */
function clearHistory() {
    if (confirm('Are you sure you want to clear all recent QR codes?')) {
        localStorage.removeItem(CONFIG.STORAGE_KEYS.RECENT_QR_CODES);
        loadRecentQRCodes();
        showAlert('History cleared', 'success');
    }
}

/**
 * Toggle dark mode
 */
function toggleDarkMode() {
    document.documentElement.classList.toggle('dark');
    const isDark = document.documentElement.classList.contains('dark');
    localStorage.setItem(CONFIG.STORAGE_KEYS.DARK_MODE, isDark);
}

/**
 * Load dark mode preference
 */
function loadDarkMode() {
    const isDark = localStorage.getItem(CONFIG.STORAGE_KEYS.DARK_MODE) === 'true';
    if (isDark) {
        document.documentElement.classList.add('dark');
    }
}

/**
 * Show alert message
 */
function showAlert(message, type = 'info') {
    const colors = {
        success: 'bg-green-100 border-green-500 text-green-700 dark:bg-green-900 dark:text-green-200',
        error: 'bg-red-100 border-red-500 text-red-700 dark:bg-red-900 dark:text-red-200',
        info: 'bg-blue-100 border-blue-500 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
    };

    const icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        info: 'fa-info-circle'
    };

    const alert = document.createElement('div');
    alert.className = `alert ${colors[type]} border-l-4 p-4 rounded shadow-md`;
    alert.innerHTML = `
        <div class="flex items-center justify-between">
            <div class="flex items-center">
                <i class="fas ${icons[type]} mr-3"></i>
                <span>${message}</span>
            </div>
            <button onclick="this.parentElement.parentElement.remove()" class="ml-4">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;

    elements.alertContainer.appendChild(alert);

    // Auto-remove after 5 seconds
    setTimeout(() => {
        alert.remove();
    }, 5000);
}

/**
 * Debounce function for performance
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Export for debugging
window.app = {
    qrGenerator,
    analytics,
    currentQRData
};

console.log('🚀 QR Generator App initialized');
