import express from 'express';
import { pool } from './db.js';
import { authRouter } from './auth.js';
import { gamesRouter } from './games.js';

if (!process.env.JWT_SECRET) {
  console.error('JWT_SECRET is missing from server/.env (see server/.env.example)');
  process.exit(1);
}

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

app.use('/api/auth', authRouter);   // register, login, me
app.use('/api/games', gamesRouter); // games, checklist, collect/uncollect

app.listen(PORT, () => {
  console.log(`API running at http://localhost:${PORT}`);
});
