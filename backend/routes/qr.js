const express = require('express');
const router = express.Router();
const { createQRCode, getAnalytics, getAllQRCodes } = require('../models/database');
const { generateShortId } = require('../utils/shortId');

/**
 * POST /api/create
 * Create a new QR code with tracking URL
 */
router.post('/create', async (req, res) => {
  try {
    const { url, styleOptions } = req.body;

    // Validate URL
    if (!url || typeof url !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Valid URL is required'
      });
    }

    // Validate URL format
    try {
      new URL(url);
    } catch (err) {
      return res.status(400).json({
        success: false,
        error: 'Invalid URL format'
      });
    }

    // Generate unique short ID
    let shortId;
    let attempts = 0;
    const maxAttempts = 5;

    while (attempts < maxAttempts) {
      shortId = generateShortId();
      try {
        // Try to create QR code with this ID
        await createQRCode(shortId, url, styleOptions || {});
        break;
      } catch (err) {
        if (err.code === 'SQLITE_CONSTRAINT') {
          // ID collision, try again
          attempts++;
          if (attempts >= maxAttempts) {
            throw new Error('Failed to generate unique ID');
          }
        } else {
          throw err;
        }
      }
    }

    // Build tracking URL
    const shortUrlDomain = process.env.SHORT_URL_DOMAIN || `http://localhost:${process.env.PORT || 3000}`;
    const trackingUrl = `${shortUrlDomain}/r/${shortId}`;

    res.json({
      success: true,
      shortId,
      trackingUrl,
      originalUrl: url,
      message: 'QR code created successfully'
    });

  } catch (err) {
    console.error('Error creating QR code:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to create QR code'
    });
  }
});

/**
 * GET /api/stats/:id
 * Get analytics for a specific QR code
 */
router.get('/stats/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const analytics = await getAnalytics(id);

    if (!analytics) {
      return res.status(404).json({
        success: false,
        error: 'QR code not found'
      });
    }

    res.json({
      success: true,
      ...analytics
    });

  } catch (err) {
    console.error('Error fetching analytics:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch analytics'
    });
  }
});

/**
 * GET /api/list
 * Get all QR codes (optional, for admin/dashboard)
 */
router.get('/list', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const qrCodes = await getAllQRCodes(limit);

    res.json({
      success: true,
      count: qrCodes.length,
      qrCodes
    });

  } catch (err) {
    console.error('Error listing QR codes:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to list QR codes'
    });
  }
});

module.exports = router;
