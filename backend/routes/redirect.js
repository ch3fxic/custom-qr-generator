const express = require('express');
const router = express.Router();
const { getQRCode, recordScan } = require('../models/database');
const { isValidShortId } = require('../utils/shortId');

/**
 * GET /r/:id
 * Redirect to original URL and record scan
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ID format
    if (!isValidShortId(id)) {
      return res.status(400).send('Invalid QR code ID');
    }

    // Get QR code from database
    const qrCode = await getQRCode(id);

    if (!qrCode) {
      return res.status(404).send('QR code not found');
    }

    // Extract user information
    const ip = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('user-agent') || 'Unknown';

    // Record the scan (async, don't wait)
    recordScan(id, ip, userAgent).catch(err => {
      console.error('Error recording scan:', err);
      // Don't fail the redirect if scan recording fails
    });

    // Log the scan
    console.log(`📱 Scan recorded: ${id} -> ${qrCode.original_url}`);

    // Redirect to original URL
    res.redirect(qrCode.original_url);

  } catch (err) {
    console.error('Error in redirect:', err);
    res.status(500).send('Internal server error');
  }
});

module.exports = router;
