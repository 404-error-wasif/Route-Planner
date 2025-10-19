import 'dotenv/config'
import { pool } from '../db.js'
import bcrypt from 'bcryptjs'

const email = process.argv[2] || 'user@example.com'
const pwd   = process.argv[3] || 'user123'

async function run() {
  const hash = await bcrypt.hash(pwd, 10)
  const [r] = await pool.query('UPDATE users SET password_hash=? WHERE email=?', [hash, email])
  console.log(`Updated ${r.affectedRows} row(s) for`, email)
  process.exit(0)
}
run().catch(e => { console.error(e); process.exit(1) })
