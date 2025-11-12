const path = require('path');

// Optional: remote libsql (Turso) client for persistent storage on Vercel
let libsqlClient = null;
try {
  if (process.env.TURSO_CONNECTION_URL) {
    // Lazy require to avoid dependency in local setups if not needed
    const { createClient } = require('@libsql/client');
    libsqlClient = createClient({
      url: process.env.TURSO_CONNECTION_URL,
      authToken: process.env.TURSO_AUTH_TOKEN
    });
    console.log('🗄️  Using remote libsql (Turso) database');
  }
} catch (e) {
  console.warn('⚠️  libsql client not available, falling back to local sqlite:', e.message);
  libsqlClient = null;
}

const useLibsql = !!libsqlClient;

// Local SQLite (fallback) for development
let db = null;
if (!useLibsql) {
  const sqlite3 = require('sqlite3').verbose();
  const dbPath = process.env.DATABASE_PATH || path.join(__dirname, '../database.sqlite');
  db = new sqlite3.Database(dbPath);
  console.log('📦 Using local SQLite database at', process.env.DATABASE_PATH || path.join(__dirname, '../database.sqlite'));
}

/**
 * Initialize database tables
 */
const initializeDatabase = () => {
  if (useLibsql) {
    // Create tables on Turso/libsql
    const statements = [
      `CREATE TABLE IF NOT EXISTS qr_codes (
          id TEXT PRIMARY KEY,
          original_url TEXT NOT NULL,
          style_options TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`,
      `CREATE TABLE IF NOT EXISTS scans (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          qr_id TEXT NOT NULL,
          timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
          ip TEXT,
          user_agent TEXT,
          FOREIGN KEY (qr_id) REFERENCES qr_codes(id)
        )`,
      `CREATE INDEX IF NOT EXISTS idx_scans_qr_id ON scans(qr_id)`
    ];
    return statements.reduce((p, sql) => p.then(() => libsqlClient.execute(sql)), Promise.resolve());
  }

  // Local sqlite init
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      db.run(
        `CREATE TABLE IF NOT EXISTS qr_codes (
          id TEXT PRIMARY KEY,
          original_url TEXT NOT NULL,
          style_options TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`,
        (err) => {
          if (err) return reject(err);
        }
      );

      db.run(
        `CREATE TABLE IF NOT EXISTS scans (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          qr_id TEXT NOT NULL,
          timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
          ip TEXT,
          user_agent TEXT,
          FOREIGN KEY (qr_id) REFERENCES qr_codes(id)
        )`,
        (err) => {
          if (err) return reject(err);
        }
      );

      db.run(
        `CREATE INDEX IF NOT EXISTS idx_scans_qr_id ON scans(qr_id)`,
        (err) => {
          if (err) return reject(err);
          resolve();
        }
      );
    });
  });
};

/**
 * Create a new QR code record
 */
const createQRCode = (id, originalUrl, styleOptions) => {
  if (useLibsql) {
    return libsqlClient
      .execute({
        sql: 'INSERT INTO qr_codes (id, original_url, style_options) VALUES (?, ?, ?)',
        args: [id, originalUrl, JSON.stringify(styleOptions)]
      })
      .then(() => ({ id, originalUrl, styleOptions }));
  }
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
  if (useLibsql) {
    return libsqlClient
      .execute({ sql: 'SELECT * FROM qr_codes WHERE id = ?', args: [id] })
      .then(({ rows }) => {
        const row = rows[0];
        if (!row) return null;
        return {
          ...row,
          style_options: row.style_options ? JSON.parse(row.style_options) : null
        };
      });
  }
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
  if (useLibsql) {
    return libsqlClient
      .execute({
        sql: 'INSERT INTO scans (qr_id, ip, user_agent) VALUES (?, ?, ?)',
        args: [qrId, ip, userAgent]
      })
      .then((res) => ({ id: res.lastInsertRowid || null }));
  }
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
  if (useLibsql) {
    return (async () => {
      const qr = await libsqlClient.execute({ sql: 'SELECT * FROM qr_codes WHERE id = ?', args: [qrId] });
      const qrCode = qr.rows[0];
      if (!qrCode) return null;
      const total = await libsqlClient.execute({ sql: 'SELECT COUNT(*) as total FROM scans WHERE qr_id = ?', args: [qrId] });
      const uniqueRow = await libsqlClient.execute({ sql: 'SELECT COUNT(DISTINCT ip) as unique_count FROM scans WHERE qr_id = ?', args: [qrId] });
      const scansRes = await libsqlClient.execute({ sql: 'SELECT timestamp, ip, user_agent FROM scans WHERE qr_id = ? ORDER BY timestamp DESC LIMIT 100', args: [qrId] });
      return {
        id: qrCode.id,
        originalUrl: qrCode.original_url,
        styleOptions: qrCode.style_options ? JSON.parse(qrCode.style_options) : null,
        createdAt: qrCode.created_at,
        totalScans: total.rows[0].total,
        uniqueScans: uniqueRow.rows[0].unique_count,
        scans: scansRes.rows
      };
    })();
  }
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
  if (useLibsql) {
    return libsqlClient
      .execute({
        sql: `
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
    `,
        args: [limit]
      })
      .then((res) => res.rows);
  }
  return new Promise((resolve, reject) => {
    db.all(
      `SELECT 
        qr_codes.id,
        qr_codes.original_url,
        qr_codes.created_at,
        COUNT(scans.id) as scan_count
      FROM qr_codes
      LEFT JOIN scans ON qr_codes.id = scans.qr_id
      GROUP BY qr_codes.id
      ORDER BY qr_codes.created_at DESC
      LIMIT ?`,
      [limit],
      (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      }
    );
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
