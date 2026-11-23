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

// GET /api/games — every game, oldest first
app.get('/api/games', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, title, short_name, release_year, console, cover_image_url FROM games ORDER BY release_year'
    );
    res.json(result.rows); // all rows, not just rows[0]
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Could not load games' });
  }
});

// GET /api/games/:gameId/items — one game's checklist, grouped by location
// in playthrough order. (Once login exists, this will also say which items
// the logged-in user has collected.)
app.get('/api/games/:gameId/items', async (req, res) => {
  const gameId = Number(req.params.gameId); // ":gameId" in the URL → req.params.gameId
  if (!Number.isInteger(gameId)) {
    return res.status(400).json({ message: 'gameId must be a number' });
  }

  try {
    // $1 is a placeholder: pg sends gameId separately from the SQL text,
    // so a malicious URL can't inject SQL.
    const gameResult = await pool.query(
      'SELECT id, title, short_name, release_year, console FROM games WHERE id = $1',
      [gameId]
    );
    if (gameResult.rows.length === 0) {
      return res.status(404).json({ message: 'Game not found' });
    }

    const itemsResult = await pool.query(
      `SELECT l.location_no, l.name AS location_name,
              i.item_no, i.name, i.hint, t.name AS type
       FROM items i
       JOIN locations  l ON l.game_id = i.game_id AND l.location_no = i.location_no
       JOIN item_types t ON t.id = i.type_id
       WHERE i.game_id = $1
       ORDER BY l.location_no, i.sort_order`,
      [gameId]
    );

    // The query returns one flat row per item. Group them into locations:
    // [{ locationNo, name, items: [...] }, ...]
    const locations = [];
    for (const row of itemsResult.rows) {
      let location = locations[locations.length - 1];
      if (!location || location.locationNo !== row.location_no) {
        location = { locationNo: row.location_no, name: row.location_name, items: [] };
        locations.push(location);
      }
      location.items.push({
        itemNo: row.item_no,
        name: row.name,
        type: row.type,
        hint: row.hint,
        collected: false, // placeholder until user accounts exist
      });
    }

    res.json({ game: gameResult.rows[0], locations });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Could not load items' });
  }
});

app.listen(PORT, () => {
  console.log(`API running at http://localhost:${PORT}`);
});
