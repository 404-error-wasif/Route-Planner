import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const backendRoot = path.resolve(__dirname, '..', '..');
const sqlDir = path.join(backendRoot, 'sql');

const dbHost = process.env.DB_HOST || 'localhost';
const dbUser = process.env.DB_USER || 'root';
const dbPassword = process.env.DB_PASSWORD || '';
const dbName = process.env.DB_NAME || 'dhaka_routes';

async function runSqlFile(connection, fileName) {
  const filePath = path.join(sqlDir, fileName);
  const sql = await fs.readFile(filePath, 'utf8');
  await connection.query(sql);
}

export async function ensureDatabase() {
  const adminConnection = await mysql.createConnection({
    host: dbHost,
    user: dbUser,
    password: dbPassword,
    multipleStatements: true,
  });

  await adminConnection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
  await adminConnection.end();

  const connection = await mysql.createConnection({
    host: dbHost,
    user: dbUser,
    password: dbPassword,
    database: dbName,
    multipleStatements: true,
  });

  const [tables] = await connection.query("SHOW TABLES LIKE 'users'");
  if (tables.length === 0) {
    await runSqlFile(connection, 'schema.sql');
  }

  await runSqlFile(connection, 'seed.sql');

  await connection.end();
  console.info('Database schema verified and seed data applied.');
}
