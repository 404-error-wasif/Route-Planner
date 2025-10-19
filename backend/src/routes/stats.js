import express from 'express';
import { pool } from '../../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/trips', requireAuth('admin'), async (_req, res) => {
  const [rows] = await pool.query(`
    SELECT t.id, u.email, t.from_name, t.to_name, t.mode, t.cost_min, t.cost_max, t.duration_min, t.created_at
    FROM trips t JOIN users u ON t.user_id=u.id ORDER BY t.id DESC LIMIT 200
  `);
  res.json(rows);
});

export default router;
