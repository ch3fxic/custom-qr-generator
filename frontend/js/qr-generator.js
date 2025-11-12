// QR Code Generator Module
// Handles QR code generation and styling

class QRGenerator {
    constructor() {
        this.qrCode = null;
        this.currentData = null;
        this.logoImage = null;
    }

    /**
     * Initialize QR code with default settings
     */
    init() {
        this.qrCode = new QRCodeStyling({
            width: CONFIG.QR_DEFAULTS.width,
            height: CONFIG.QR_DEFAULTS.height,
            data: "https://example.com",
            margin: CONFIG.QR_DEFAULTS.margin,
            qrOptions: {
                typeNumber: 0,
                mode: "Byte",
                errorCorrectionLevel: "Q"
            },
            imageOptions: CONFIG.QR_DEFAULTS.imageOptions,
            dotsOptions: {
                color: "#000000",
                type: "square"
            },
            backgroundOptions: {
                color: "#ffffff"
            },
            cornersSquareOptions: {
                color: "#000000",
                type: "square"
            },
            cornersDotOptions: {
                color: "#000000",
                type: "square"
            }
        });
    }

    /**
     * Generate QR code with custom options
     */
    generate(data, options = {}) {
        this.currentData = data;

        const qrOptions = {
            data: data,
            dotsOptions: {
                color: options.fgColor || "#000000",
                type: options.dotStyle || "square"
            },
            backgroundOptions: {
                color: options.bgColor || "#ffffff"
            },
            cornersSquareOptions: {
                color: options.fgColor || "#000000",
                type: options.cornerStyle || "square"
            },
            cornersDotOptions: {
                color: options.fgColor || "#000000",
                type: options.cornerStyle || "square"
            }
        };

        // Apply gradient if enabled
        if (options.useGradient) {
            qrOptions.dotsOptions.gradient = {
                type: "linear",
                rotation: 45,
                colorStops: [
                    { offset: 0, color: options.gradientColor1 || "#667eea" },
                    { offset: 1, color: options.gradientColor2 || "#764ba2" }
                ]
            };
        }

        // Apply logo if provided
        if (this.logoImage) {
            qrOptions.image = this.logoImage;
            qrOptions.imageOptions = CONFIG.QR_DEFAULTS.imageOptions;
        } else {
            delete qrOptions.image;
        }

        this.qrCode.update(qrOptions);
    }

    /**
     * Set logo image
     */
    setLogo(imageDataUrl) {
        this.logoImage = imageDataUrl;
    }

    /**
     * Clear logo
     */
    clearLogo() {
        this.logoImage = null;
    }

    /**
     * Render QR code to a container
     */
    render(containerId) {
        const container = document.getElementById(containerId);
        if (container) {
            container.innerHTML = '';
            this.qrCode.append(container);
        }
    }

    /**
     * Download QR code as PNG
     */
    async downloadPNG(filename = 'qr-code.png') {
        try {
            await this.qrCode.download({
                name: filename.replace('.png', ''),
                extension: 'png'
            });
        } catch (error) {
            console.error('Error downloading PNG:', error);
            throw error;
        }
    }

    /**
     * Download QR code as SVG
     */
    async downloadSVG(filename = 'qr-code.svg') {
        try {
            await this.qrCode.download({
                name: filename.replace('.svg', ''),
                extension: 'svg'
            });
        } catch (error) {
            console.error('Error downloading SVG:', error);
            throw error;
        }
    }

    /**
     * Download QR code as PDF
     */
    async downloadPDF(filename = 'qr-code.pdf') {
        try {
            // Get the raw SVG data
            const svgData = await this.qrCode.getRawData('svg');
            const svgBlob = new Blob([svgData], { type: 'image/svg+xml' });
            const svgUrl = URL.createObjectURL(svgBlob);

            // Create an image from SVG
            const img = new Image();
            img.onload = () => {
                // Create PDF using jsPDF
                const { jsPDF } = window.jspdf;
                const pdf = new jsPDF({
                    orientation: 'portrait',
                    unit: 'mm',
                    format: 'a4'
                });

                // Calculate dimensions to center QR code
                const pageWidth = pdf.internal.pageSize.getWidth();
                const pageHeight = pdf.internal.pageSize.getHeight();
                const qrSize = 100; // 100mm
                const x = (pageWidth - qrSize) / 2;
                const y = (pageHeight - qrSize) / 2;

                // Add QR code to PDF
                pdf.addImage(img, 'PNG', x, y, qrSize, qrSize);
                
                // Add text information
                pdf.setFontSize(10);
                pdf.text(`Generated: ${new Date().toLocaleString()}`, 10, pageHeight - 10);
                
                // Save PDF
                pdf.save(filename);
                URL.revokeObjectURL(svgUrl);
            };
            img.src = svgUrl;
        } catch (error) {
            console.error('Error downloading PDF:', error);
            throw error;
        }
    }

    /**
     * Get QR code as data URL (for storage)
     */
    async getDataURL() {
        try {
            const blob = await this.qrCode.getRawData('png');
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result);
                reader.onerror = reject;
                reader.readAsDataURL(blob);
            });
        } catch (error) {
            console.error('Error getting data URL:', error);
            throw error;
        }
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = QRGenerator;
}
