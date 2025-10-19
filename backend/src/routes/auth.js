import express from 'express';
import { pool } from '../../db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const router = express.Router();

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const [rows] = await pool.query('SELECT * FROM users WHERE email=?', [email]);
    const user = rows[0];
    if (!user) return res.status(401).json({error:'Invalid credentials'});
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({error:'Invalid credentials'});
    const token = jwt.sign({ id:user.id, role:user.role }, process.env.JWT_SECRET || 'dev', { expiresIn:'2d' });
    res.json({ token, user: { id:user.id, email:user.email, name:user.name, role:user.role } });
  } catch (e) {
    res.status(500).json({error:'Login failed'});
  }
});

export default router;
