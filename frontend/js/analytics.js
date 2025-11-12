// Analytics Module
// Handles communication with backend for tracking and analytics

class Analytics {
    constructor(apiUrl) {
        this.apiUrl = apiUrl;
    }

    /**
     * Create a new QR code tracking URL
     */
    async createTrackingUrl(originalUrl, styleOptions = {}) {
        try {
            const response = await fetch(`${this.apiUrl}/api/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    url: originalUrl,
                    styleOptions: styleOptions
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to create tracking URL');
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error creating tracking URL:', error);
            throw error;
        }
    }

    /**
     * Get analytics for a specific QR code
     */
    async getStats(qrId) {
        try {
            const response = await fetch(`${this.apiUrl}/api/stats/${qrId}`);

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to fetch analytics');
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching analytics:', error);
            throw error;
        }
    }

    /**
     * Format analytics data for display
     */
    formatAnalyticsHTML(analytics) {
        if (!analytics) {
            return '<p class="text-center text-gray-500">No data available</p>';
        }

        const { originalUrl, totalScans, uniqueScans, createdAt, scans } = analytics;

        // Format date
        const formattedDate = new Date(createdAt).toLocaleString();

        // Calculate scan rate
        const daysSinceCreation = Math.max(1, Math.floor((Date.now() - new Date(createdAt)) / (1000 * 60 * 60 * 24)));
        const scansPerDay = (totalScans / daysSinceCreation).toFixed(1);

        // Group scans by date
        const scansByDate = this.groupScansByDate(scans);

        let html = `
            <div class="space-y-6">
                <!-- Summary Cards -->
                <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div class="bg-blue-50 dark:bg-blue-900 rounded-lg p-4">
                        <div class="text-blue-600 dark:text-blue-300 text-sm font-medium">Total Scans</div>
                        <div class="text-3xl font-bold text-blue-700 dark:text-blue-200 mt-2">${totalScans}</div>
                    </div>
                    <div class="bg-green-50 dark:bg-green-900 rounded-lg p-4">
                        <div class="text-green-600 dark:text-green-300 text-sm font-medium">Unique Scans</div>
                        <div class="text-3xl font-bold text-green-700 dark:text-green-200 mt-2">${uniqueScans}</div>
                    </div>
                    <div class="bg-purple-50 dark:bg-purple-900 rounded-lg p-4">
                        <div class="text-purple-600 dark:text-purple-300 text-sm font-medium">Scans/Day</div>
                        <div class="text-3xl font-bold text-purple-700 dark:text-purple-200 mt-2">${scansPerDay}</div>
                    </div>
                    <div class="bg-orange-50 dark:bg-orange-900 rounded-lg p-4">
                        <div class="text-orange-600 dark:text-orange-300 text-sm font-medium">Created</div>
                        <div class="text-sm font-semibold text-orange-700 dark:text-orange-200 mt-2">${formattedDate}</div>
                    </div>
                </div>

                <!-- Original URL -->
                <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <div class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Original URL</div>
                    <a href="${originalUrl}" target="_blank" class="text-blue-600 dark:text-blue-400 hover:underline break-all">
                        ${originalUrl}
                    </a>
                </div>

                <!-- Scans by Date -->
                ${scansByDate.length > 0 ? `
                    <div>
                        <h3 class="text-lg font-semibold text-gray-800 dark:text-white mb-3">Scans by Date</h3>
                        <div class="space-y-2">
                            ${scansByDate.map(({ date, count }) => `
                                <div class="flex items-center justify-between bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                                    <span class="text-gray-700 dark:text-gray-300">${date}</span>
                                    <span class="bg-primary text-white px-3 py-1 rounded-full text-sm font-semibold">${count}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}

                <!-- Recent Scans -->
                ${scans && scans.length > 0 ? `
                    <div>
                        <h3 class="text-lg font-semibold text-gray-800 dark:text-white mb-3">Recent Scans</h3>
                        <div class="overflow-x-auto">
                            <table class="w-full text-sm">
                                <thead class="bg-gray-100 dark:bg-gray-700">
                                    <tr>
                                        <th class="px-4 py-2 text-left text-gray-700 dark:text-gray-300">Timestamp</th>
                                        <th class="px-4 py-2 text-left text-gray-700 dark:text-gray-300">IP</th>
                                        <th class="px-4 py-2 text-left text-gray-700 dark:text-gray-300">User Agent</th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-gray-200 dark:divide-gray-600">
                                    ${scans.slice(0, 20).map(scan => `
                                        <tr class="hover:bg-gray-50 dark:hover:bg-gray-700">
                                            <td class="px-4 py-2 text-gray-800 dark:text-gray-200">
                                                ${new Date(scan.timestamp).toLocaleString()}
                                            </td>
                                            <td class="px-4 py-2 text-gray-600 dark:text-gray-400 font-mono text-xs">
                                                ${this.maskIP(scan.ip)}
                                            </td>
                                            <td class="px-4 py-2 text-gray-600 dark:text-gray-400 text-xs truncate max-w-xs">
                                                ${this.parseUserAgent(scan.user_agent)}
                                            </td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ` : '<p class="text-center text-gray-500">No scans yet</p>'}
            </div>
        `;

        return html;
    }

    /**
     * Group scans by date
     */
    groupScansByDate(scans) {
        if (!scans || scans.length === 0) return [];

        const grouped = {};
        scans.forEach(scan => {
            const date = new Date(scan.timestamp).toLocaleDateString();
            grouped[date] = (grouped[date] || 0) + 1;
        });

        return Object.entries(grouped)
            .map(([date, count]) => ({ date, count }))
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 10);
    }

    /**
     * Mask IP address for privacy (GDPR compliance)
     */
    maskIP(ip) {
        if (!ip) return 'Unknown';
        const parts = ip.split('.');
        if (parts.length === 4) {
            return `${parts[0]}.${parts[1]}.***.***.`;
        }
        return ip.substring(0, ip.length / 2) + '***';
    }

    /**
     * Parse user agent to extract device/browser info
     */
    parseUserAgent(ua) {
        if (!ua) return 'Unknown';
        
        // Extract browser
        let browser = 'Unknown';
        if (ua.includes('Chrome')) browser = 'Chrome';
        else if (ua.includes('Firefox')) browser = 'Firefox';
        else if (ua.includes('Safari')) browser = 'Safari';
        else if (ua.includes('Edge')) browser = 'Edge';
        
        // Extract device
        let device = 'Desktop';
        if (ua.includes('Mobile')) device = 'Mobile';
        else if (ua.includes('Tablet')) device = 'Tablet';
        
        return `${browser} on ${device}`;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Analytics;
}
