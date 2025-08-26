import express from 'express';
import dotenv from 'dotenv';
import pg from 'pg';

dotenv.config(); // liest .env ein

const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false } // Neon braucht SSL
});

const app = express();
const port = process.env.PORT || 3000;

app.get('/health', async (_req, res) => {
  try {
    const r = await pool.query('SELECT 1 as ok;');
    res.json({ db: 'ok', result: r.rows[0] });
  } catch (e) {
    console.error('[HEALTH] DB error:', e);
    res.status(500).json({ db: 'error', message: String(e.message) });
  }
});

app.get('/', async (_req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM books_to_read ORDER BY id;');
    res.json(rows);
  } catch (e) {
    console.error('[ROOT] Query error:', e);
    res.status(500).json({ error: 'Internal Server Error', message: String(e.message) });
  }
});

app.listen(port, () => {
  // Passwort maskieren – nur zur Kontrolle, dass .env geladen ist
  const masked = (process.env.DATABASE_URL || '<leer>').replace(/:(.*?)@/, '://****@');
  console.log('DATABASE_URL =', masked);
  console.log(`Server running on http://localhost:${port}`);
});
