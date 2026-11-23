import express from 'express';
import { pool } from './db.js';
import { requireAuth } from './auth.js';

export const gamesRouter = express.Router();

// Every games route needs a logged-in user, because progress is per user.
gamesRouter.use(requireAuth);

// Turns a URL parameter into a whole number, or null if it isn't one.
const toInt = (value) => (/^\d+$/.test(value) ? Number(value) : null);

// GET /api/games — every game (oldest first) with MY progress
gamesRouter.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT g.id, g.title, g.short_name, g.release_year, g.console, g.cover_image_url,
              COUNT(i.item_no)::int  AS total,
              COUNT(ui.item_no)::int AS collected
       FROM games g
       LEFT JOIN items i       ON i.game_id = g.id
       LEFT JOIN user_items ui ON ui.game_id = i.game_id AND ui.item_no = i.item_no AND ui.user_id = $1
       GROUP BY g.id
       ORDER BY g.release_year`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Could not load games' });
  }
});

// GET /api/games/:gameId/items — one game's checklist, grouped by location
// in playthrough order, with collected = true/false for the logged-in user.
gamesRouter.get('/:gameId/items', async (req, res) => {
  const gameId = toInt(req.params.gameId);
  if (gameId === null) return res.status(400).json({ message: 'gameId must be a number' });

  try {
    // $1 / $2 are placeholders: pg sends the values separately from the SQL,
    // so a malicious URL can't inject SQL.
    const gameResult = await pool.query(
      'SELECT id, title, short_name, release_year, console FROM games WHERE id = $1',
      [gameId]
    );
    if (gameResult.rows.length === 0) return res.status(404).json({ message: 'Game not found' });

    // LEFT JOIN user_items: items I haven't collected have no matching row,
    // so ui.item_no is NULL → collected = false. (The query from the ERD design!)
    const itemsResult = await pool.query(
      `SELECT l.location_no, l.name AS location_name,
              i.item_no, i.name, i.hint, t.name AS type,
              (ui.item_no IS NOT NULL) AS collected
       FROM items i
       JOIN locations  l ON l.game_id = i.game_id AND l.location_no = i.location_no
       JOIN item_types t ON t.id = i.type_id
       LEFT JOIN user_items ui
              ON ui.game_id = i.game_id AND ui.item_no = i.item_no AND ui.user_id = $2
       WHERE i.game_id = $1
       ORDER BY l.location_no, i.sort_order`,
      [gameId, req.user.id]
    );

    // One flat row per item → group into [{ locationNo, name, items: [...] }]
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
        collected: row.collected,
      });
    }

    res.json({ game: gameResult.rows[0], locations });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Could not load items' });
  }
});

// POST /api/games/:gameId/items/:itemNo/collect — check the box
gamesRouter.post('/:gameId/items/:itemNo/collect', async (req, res) => {
  const gameId = toInt(req.params.gameId);
  const itemNo = toInt(req.params.itemNo);
  if (gameId === null || itemNo === null) return res.status(400).json({ message: 'Invalid item' });

  try {
    // ON CONFLICT DO NOTHING: checking an already-collected item is harmless
    await pool.query(
      `INSERT INTO user_items (user_id, game_id, item_no) VALUES ($1, $2, $3)
       ON CONFLICT DO NOTHING`,
      [req.user.id, gameId, itemNo]
    );
    res.json({ gameId, itemNo, collected: true });
  } catch (err) {
    if (err.code === '23503') return res.status(404).json({ message: 'Item not found' }); // foreign key
    console.error(err);
    res.status(500).json({ message: 'Could not save' });
  }
});

// DELETE /api/games/:gameId/items/:itemNo/collect — uncheck the box
gamesRouter.delete('/:gameId/items/:itemNo/collect', async (req, res) => {
  const gameId = toInt(req.params.gameId);
  const itemNo = toInt(req.params.itemNo);
  if (gameId === null || itemNo === null) return res.status(400).json({ message: 'Invalid item' });

  try {
    await pool.query(
      'DELETE FROM user_items WHERE user_id = $1 AND game_id = $2 AND item_no = $3',
      [req.user.id, gameId, itemNo]
    );
    res.json({ gameId, itemNo, collected: false });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Could not save' });
  }
});
