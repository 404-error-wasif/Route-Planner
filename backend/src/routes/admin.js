import express from 'express';
import { pool } from '../../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// users overview
router.get('/users', requireAuth('admin'), async (_req, res) => {
  const [rows] = await pool.query('SELECT id, name, email, role, created_at FROM users ORDER BY id');
  res.json(rows);
});

// add/update private pricing bands per minute
router.get('/pricing', requireAuth('admin'), async (_req, res) => {
  const [rows] = await pool.query('SELECT * FROM private_pricing ORDER BY mode');
  res.json(rows);
});
router.post('/pricing', requireAuth('admin'), async (req, res) => {
  const { mode, min_per_min, max_per_min } = req.body;
  await pool.query(
    'INSERT INTO private_pricing (mode, min_per_min, max_per_min) VALUES (?,?,?) ON DUPLICATE KEY UPDATE min_per_min=VALUES(min_per_min), max_per_min=VALUES(max_per_min)',
    [mode, min_per_min, max_per_min]
  );
  res.json({ok:true});
});

// public transport CRUD (simplified)
router.get('/public-routes', requireAuth('admin'), async (_req, res) => {
  const [routes] = await pool.query('SELECT * FROM public_routes ORDER BY id');
  const [stops]  = await pool.query('SELECT * FROM public_route_stops ORDER BY route_id, seq');
  res.json({ routes, stops });
});
router.post('/public-routes', requireAuth('admin'), async (req, res) => {
  const { name, mode, avg_kmh, base_cost, per_km_cost, geometry } = req.body; // geometry: GeoJSON LineString
  const [r] = await pool.query('INSERT INTO public_routes (name, mode, avg_kmh, base_cost, per_km_cost, geometry) VALUES (?,?,?,?,?,?)',
    [name, mode, avg_kmh, base_cost, per_km_cost, JSON.stringify(geometry)]);
  res.json({ok:true, id:r.insertId});
});
router.post('/public-routes/:id/stops', requireAuth('admin'), async (req, res) => {
  const route_id = req.params.id;
  const { name, lat, lon, seq } = req.body;
  await pool.query('INSERT INTO public_route_stops (route_id, name, lat, lon, seq) VALUES (?,?,?,?,?)',
    [route_id, name, lat, lon, seq]);
  res.json({ok:true});
});

// blocks
router.get('/blocks', requireAuth('admin'), async (_req, res) => {
  const [rows] = await pool.query('SELECT * FROM blocked_segments ORDER BY id DESC');
  res.json(rows);
});
router.post('/blocks', requireAuth('admin'), async (req, res) => {
  const { name, geometry, start_time, end_time } = req.body; // geometry: GeoJSON LineString/Polygon
  await pool.query('INSERT INTO blocked_segments (name, geometry, start_time, end_time) VALUES (?,?,?,?)',
    [name, JSON.stringify(geometry), start_time, end_time]);
  res.json({ok:true});
});

export default router;
