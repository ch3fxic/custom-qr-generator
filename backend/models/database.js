const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = process.env.DATABASE_PATH || path.join(__dirname, '../database.sqlite');
const db = new sqlite3.Database(dbPath);

/**
 * Initialize database tables
 */
const initializeDatabase = () => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Create qr_codes table
      db.run(`
        CREATE TABLE IF NOT EXISTS qr_codes (
          id TEXT PRIMARY KEY,
          original_url TEXT NOT NULL,
          style_options TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err) {
          reject(err);
          return;
        }
      });

      // Create scans table
      db.run(`
        CREATE TABLE IF NOT EXISTS scans (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          qr_id TEXT NOT NULL,
          timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
          ip TEXT,
          user_agent TEXT,
          FOREIGN KEY (qr_id) REFERENCES qr_codes(id)
        )
      `, (err) => {
        if (err) {
          reject(err);
          return;
        }
      });

      // Create index for faster queries
      db.run(`
        CREATE INDEX IF NOT EXISTS idx_scans_qr_id ON scans(qr_id)
      `, (err) => {
        if (err) {
          reject(err);
          return;
        }
        resolve();
      });
    });
  });
};

/**
 * Create a new QR code record
 */
const createQRCode = (id, originalUrl, styleOptions) => {
  return new Promise((resolve, reject) => {
    const stmt = db.prepare('INSERT INTO qr_codes (id, original_url, style_options) VALUES (?, ?, ?)');
    stmt.run(id, originalUrl, JSON.stringify(styleOptions), function(err) {
      if (err) {
        reject(err);
      } else {
        resolve({ id, originalUrl, styleOptions });
      }
    });
    stmt.finalize();
  });
};

/**
 * Get QR code by ID
 */
const getQRCode = (id) => {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM qr_codes WHERE id = ?', [id], (err, row) => {
      if (err) {
        reject(err);
      } else if (!row) {
        resolve(null);
      } else {
        resolve({
          ...row,
          style_options: row.style_options ? JSON.parse(row.style_options) : null
        });
      }
    });
  });
};

/**
 * Record a scan
 */
const recordScan = (qrId, ip, userAgent) => {
  return new Promise((resolve, reject) => {
    const stmt = db.prepare('INSERT INTO scans (qr_id, ip, user_agent) VALUES (?, ?, ?)');
    stmt.run(qrId, ip, userAgent, function(err) {
      if (err) {
        reject(err);
      } else {
        resolve({ id: this.lastID });
      }
    });
    stmt.finalize();
  });
};

/**
 * Get analytics for a QR code
 */
const getAnalytics = (qrId) => {
  return new Promise((resolve, reject) => {
    // Get QR code info
    db.get('SELECT * FROM qr_codes WHERE id = ?', [qrId], (err, qrCode) => {
      if (err) {
        reject(err);
        return;
      }
      if (!qrCode) {
        resolve(null);
        return;
      }

      // Get total scans
      db.get('SELECT COUNT(*) as total FROM scans WHERE qr_id = ?', [qrId], (err, totalRow) => {
        if (err) {
          reject(err);
          return;
        }

        // Get unique IPs (avoid reserved alias names)
        db.get('SELECT COUNT(DISTINCT ip) as unique_count FROM scans WHERE qr_id = ?', [qrId], (err, uniqueRow) => {
          if (err) {
            reject(err);
            return;
          }

          // Get recent scans
          db.all(
            'SELECT timestamp, ip, user_agent FROM scans WHERE qr_id = ? ORDER BY timestamp DESC LIMIT 100',
            [qrId],
            (err, scans) => {
              if (err) {
                reject(err);
                return;
              }

              resolve({
                id: qrCode.id,
                originalUrl: qrCode.original_url,
                styleOptions: qrCode.style_options ? JSON.parse(qrCode.style_options) : null,
                createdAt: qrCode.created_at,
                totalScans: totalRow.total,
                uniqueScans: uniqueRow.unique_count,
                scans: scans
              });
            }
          );
        });
      });
    });
  });
};

/**
 * Get all QR codes (with basic stats)
 */
const getAllQRCodes = (limit = 50) => {
  return new Promise((resolve, reject) => {
    db.all(`
      SELECT 
        qr_codes.id,
        qr_codes.original_url,
        qr_codes.created_at,
        COUNT(scans.id) as scan_count
      FROM qr_codes
      LEFT JOIN scans ON qr_codes.id = scans.qr_id
      GROUP BY qr_codes.id
      ORDER BY qr_codes.created_at DESC
      LIMIT ?
    `, [limit], (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
};

module.exports = {
  db,
  initializeDatabase,
  createQRCode,
  getQRCode,
  recordScan,
  getAnalytics,
  getAllQRCodes
};
