import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './src/routes/auth.js';
import adminRoutes from './src/routes/admin.js';
import routeRoutes from './src/routes/routes.js';
import statsRoutes from './src/routes/stats.js';
import geoRoutes from './src/routes/geo.js';

dotenv.config();

const app = express();
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json({ limit: '2mb' }));

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
app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));
