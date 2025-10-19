// backend/scripts/seed-users.js
import 'dotenv/config'
import mysql from 'mysql2/promise'
import bcrypt from 'bcryptjs'

async function run() {
  const {
    DB_HOST='localhost', DB_PORT='3306',
    DB_USER='root', DB_PASSWORD='',
    DB_NAME='dhaka_route_planner'
  } = process.env

  const conn = await mysql.createConnection({
    host: DB_HOST, port: Number(DB_PORT),
    user: DB_USER, password: DB_PASSWORD, database: DB_NAME
  })
  console.log('✅ Connected to MySQL:', DB_NAME)

  // Detect columns
  const [cols] = await conn.query(`SHOW COLUMNS FROM users`)
  const names = cols.map(c => c.Field)
  const pwdCol  = names.includes('password_hash') ? 'password_hash'
               : names.includes('password')      ? 'password'
               : null
  if (!pwdCol) throw new Error('Could not find password column (password_hash or password) in users table')

  const roleCol = names.includes('role') ? 'role'
               : names.includes('is_admin') ? 'is_admin'
               : null
  if (!roleCol) throw new Error('Could not find role column (role or is_admin) in users table')

  // Helper upsert
  async function upsertUser(email, plain, roleVal) {
    const hash = await bcrypt.hash(plain, 10)

    const [rows] = await conn.query(`SELECT id FROM users WHERE email = ? LIMIT 1`, [email])
    if (rows.length) {
      if (roleCol === 'role') {
        await conn.query(`UPDATE users SET ${pwdCol}=?, role=? WHERE email=?`, [hash, roleVal, email])
      } else { // is_admin
        await conn.query(`UPDATE users SET ${pwdCol}=?, is_admin=? WHERE email=?`, [hash, roleVal, email])
      }
      console.log('🔁 Updated', email)
    } else {
      if (roleCol === 'role') {
        await conn.query(`INSERT INTO users (email, ${pwdCol}, role) VALUES (?,?,?)`, [email, hash, roleVal])
      } else {
        await conn.query(`INSERT INTO users (email, ${pwdCol}, is_admin) VALUES (?,?,?)`, [email, hash, roleVal])
      }
      console.log('➕ Inserted', email)
    }
  }

  // Admin + Regular
  await upsertUser('admin@example.com', 'admin123', roleCol === 'role' ? 'admin' : 1)
  await upsertUser('user@example.com',  'user123',  roleCol === 'role' ? 'regular' : 0)

  await conn.end()
  console.log('✅ Done seeding users.')
}

run().catch(err => {
  console.error('❌ Seed failed:', err.message)
  process.exit(1)
})
