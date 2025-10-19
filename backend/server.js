import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { pool } from './db.js';
import authRoutes from './src/routes/auth.js';
import adminRoutes from './src/routes/admin.js';
import routeRoutes from './src/routes/routes.js';
import statsRoutes from './src/routes/stats.js';
import geoRoutes from './src/routes/geo.js';

dotenv.config();

const app = express();
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json({ limit: '2mb' }));

const legacyHashesByEmail = {
  'admin@example.com': new Set([
    '$2a$10$xhM3oGpF1r7ODs20eW3P3eY1e7P0FVA8W8Qn43tuamBm1q6gWmboi',
  ]),
  'user@example.com': new Set([
    '$2a$10$WnKyl2nDz0Yf4M2vQ5gZPeo3wJ1eGJj3C2V5f6uY.8Ue2Z9m0M9a2',
  ]),
};

async function ensureDefaultAccounts() {
  const defaults = [
    { name: 'Admin', email: 'admin@example.com', password: 'admin123', role: 'admin' },
    { name: 'Regular User', email: 'user@example.com', password: 'user123', role: 'regular' },
  ];

  for (const entry of defaults) {
    const [rows] = await pool.query(
      'SELECT id, name, role, password_hash FROM users WHERE email=?',
      [entry.email]
    );

    if (rows.length === 0) {
      const hash = await bcrypt.hash(entry.password, 10);
      await pool.query(
        'INSERT INTO users (name, email, password_hash, role) VALUES (?,?,?,?)',
        [entry.name, entry.email, hash, entry.role]
      );
      continue;
    }

    const user = rows[0];

    const legacyHashes = legacyHashesByEmail[entry.email];
    if (legacyHashes?.has(user.password_hash)) {
      const hash = await bcrypt.hash(entry.password, 10);
      await pool.query('UPDATE users SET password_hash=? WHERE id=?', [hash, user.id]);
      user.password_hash = hash;
    }

    if (user.name !== entry.name || user.role !== entry.role) {
      await pool.query(
        'UPDATE users SET name=?, role=? WHERE id=?',
        [entry.name, entry.role, user.id]
      );
    }

    if (!user.password_hash) {
      const hash = await bcrypt.hash(entry.password, 10);
      await pool.query('UPDATE users SET password_hash=? WHERE id=?', [hash, user.id]);
    }
  }
}

// simple health check
app.get('/api/health', (_req, res) =>
  res.json({ ok: true, service: 'dhaka-route-planner-api' })
);

// IMPORTANT: mount with /api prefix
app.use('/api/auth', authRoutes);     // POST /api/auth/login
app.use('/api/admin', adminRoutes);
app.use('/api/routes', routeRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/geo', geoRoutes);       // GET  /api/geo/search?q=...

const PORT = process.env.SERVER_PORT || 4000;

const start = async () => {
  try {
    await ensureDefaultAccounts();
  } catch (err) {
    console.error('Failed to ensure default accounts', err);
  }

  app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));
};

start();
