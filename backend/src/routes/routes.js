import express from 'express';
import { pool } from '../../db.js';
import { requireAuth } from '../middleware/auth.js';
import { routeDriving, haversine } from '../utils/routing.js';

const router = express.Router();

// Estimate private mode
router.post('/private-estimate', requireAuth(), async (req, res) => {
  const { from, to, mode } = req.body; // {lat, lon}
  const r = await routeDriving(from, to);
  const [pricingRows] = await pool.query('SELECT * FROM private_pricing WHERE mode=?', [mode]);
  const band = pricingRows[0] || { min_per_min: 1, max_per_min: 2 };
  const costMin = Math.round(r.duration_min * band.min_per_min);
  const costMax = Math.round(r.duration_min * band.max_per_min);
  res.json({ ...r, cost_min: costMin, cost_max: costMax, mode });
});

// Get suggested public transport (simple: nearest route whose stops are near from/to)
router.post('/public-suggest', requireAuth(), async (req, res) => {
  const { from, to } = req.body;
  const [routes] = await pool.query('SELECT * FROM public_routes');
  const [stops]  = await pool.query('SELECT * FROM public_route_stops ORDER BY route_id, seq');
  const stopsByRoute = stops.reduce((m, s)=>{ (m[s.route_id]=m[s.route_id]||[]).push(s); return m; }, {});

  function nearestStop(arr, p){
    let best=null, dBest=1e9;
    for (const s of arr){
      const d = haversine(p.lat, p.lon, s.lat, s.lon);
      if (d<dBest){ dBest=d; best=s; }
    }
    return { stop:best, dist_km:dBest };
  }

  const candidates = [];
  for (const r of routes){
    const arr = stopsByRoute[r.id] || [];
    if (arr.length<2) continue;
    const nearFrom = nearestStop(arr, from);
    const nearTo   = nearestStop(arr, to);
    if (!nearFrom.stop || !nearTo.stop) continue;
    const idxFrom = arr.findIndex(s=>s.id===nearFrom.stop.id);
    const idxTo   = arr.findIndex(s=>s.id===nearTo.stop.id);
    if (idxTo <= idxFrom) continue; // only forward direction for simplicity

    const segmentKm = 0.9 * (idxTo - idxFrom); // crude: ~0.9km per hop as placeholder
    const avgKmh = r.avg_kmh || 22;
    const durMin = (segmentKm/avgKmh)*60;
    const cost   = (r.base_cost || 5) + segmentKm * (r.per_km_cost || 2);

    candidates.push({
      route: { id:r.id, name:r.name, mode:r.mode },
      from_stop: nearFrom.stop,
      to_stop: nearTo.stop,
      approach_km: nearFrom.dist_km,
      egress_km: nearTo.dist_km,
      in_vehicle_km: segmentKm,
      duration_min: Math.round(durMin + (nearFrom.dist_km+nearTo.dist_km)/5*60), // add walking time at ~5km/h
      cost: Math.round(cost)
    });
  }

  candidates.sort((a,b)=>a.duration_min - b.duration_min);
  const fastest = candidates[0] || null;
  const cheapest = [...candidates].sort((a,b)=>a.cost-b.cost)[0] || null;
  res.json({ fastest, cheapest, candidates });
});

// Record trip
router.post('/trip', requireAuth(), async (req, res) => {
  const { from_name, to_name, mode, cost_min, cost_max, duration_min } = req.body;
  await pool.query('INSERT INTO trips (user_id, from_name, to_name, mode, cost_min, cost_max, duration_min) VALUES (?,?,?,?,?,?)',
    [req.user.id, from_name, to_name, mode, cost_min, cost_max, duration_min]);
  res.json({ok:true});
});

// Additional endpoint to fetch blocked segments. This allows both the user
// and admin interfaces to display road closures or construction zones on
// the map. It simply returns all entries from the blocked_segments table.
router.get('/blocked', async (_req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, name, geometry, start_time, end_time FROM blocked_segments ORDER BY id DESC')
    // Convert geometry strings back to objects
    const blocks = rows.map(row => ({
      id: row.id,
      name: row.name,
      geometry: typeof row.geometry === 'string' ? JSON.parse(row.geometry) : row.geometry,
      start_time: row.start_time,
      end_time: row.end_time
    }))
    res.json(blocks)
  } catch (e) {
    console.error('Failed to fetch blocked segments', e)
    res.status(500).json({ error: 'server_error' })
  }
});

export default router;

// Additional endpoint to fetch blocked segments. This allows both the user
// and admin interfaces to display road closures or construction zones on
// the map. It simply returns all entries from the blocked_segments table.
router.get('/blocked', async (_req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, name, geometry, start_time, end_time FROM blocked_segments ORDER BY id DESC')
    // Convert geometry strings back to objects
    const blocks = rows.map(row => ({
      id: row.id,
      name: row.name,
      geometry: typeof row.geometry === 'string' ? JSON.parse(row.geometry) : row.geometry,
      start_time: row.start_time,
      end_time: row.end_time
    }))
    res.json(blocks)
  } catch (e) {
    console.error('Failed to fetch blocked segments', e)
    res.status(500).json({ error: 'server_error' })
  }
})
