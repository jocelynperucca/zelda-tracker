import express from 'express';
import { pool } from './db.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

// Health check: proves the server is running AND can talk to the database.
app.get('/api/health', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW() AS time');
    res.json({ status: 'ok', databaseTime: result.rows[0].time });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 'error', message: 'Database connection failed' });
  }
});

app.listen(PORT, () => {
  console.log(`API running at http://localhost:${PORT}`);
});
