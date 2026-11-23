import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from './db.js';

export const authRouter = express.Router();

const TOKEN_LIFETIME = '7d';

function makeToken(user) {
  // The token proves "this request comes from user <id>".
  // It's signed with JWT_SECRET, so nobody can forge or edit it.
  return jwt.sign({ userId: user.id, username: user.username }, process.env.JWT_SECRET, {
    expiresIn: TOKEN_LIFETIME,
  });
}

// Middleware: put this in front of any route that needs a logged-in user.
// The frontend sends the token in a header:  Authorization: Bearer <token>
export function requireAuth(req, res, next) {
  const header = req.get('Authorization') || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ message: 'Please log in' });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: payload.userId, username: payload.username };
    next();
  } catch {
    res.status(401).json({ message: 'Your session has expired. Please log in again.' });
  }
}

// POST /api/auth/register  { username, email, password }
authRouter.post('/register', async (req, res) => {
  const username = (req.body.username || '').trim();
  const email = (req.body.email || '').trim().toLowerCase();
  const password = req.body.password || '';

  if (!username || !email || !password) {
    return res.status(400).json({ message: 'Username, email and password are all required' });
  }
  if (username.length > 50) return res.status(400).json({ message: 'Username is too long' });
  if (!email.includes('@')) return res.status(400).json({ message: 'Enter a valid email' });
  if (password.length < 8) return res.status(400).json({ message: 'Password must be at least 8 characters' });

  try {
    // Never store the real password, only a salted hash of it.
    const passwordHash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `INSERT INTO users (username, email, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id, username`,
      [username, email, passwordHash]
    );
    const user = result.rows[0];
    res.status(201).json({ token: makeToken(user), user });
  } catch (err) {
    if (err.code === '23505') {
      // 23505 = unique constraint violated (the ❄ columns in the ERD)
      const field = err.constraint?.includes('email') ? 'email' : 'username';
      return res.status(409).json({ message: `That ${field} is already taken` });
    }
    console.error(err);
    res.status(500).json({ message: 'Could not create account' });
  }
});

// POST /api/auth/login  { username, password }   (username OR email works)
authRouter.post('/login', async (req, res) => {
  const login = (req.body.username || '').trim();
  const password = req.body.password || '';
  if (!login || !password) return res.status(400).json({ message: 'Enter your username and password' });

  try {
    const result = await pool.query(
      'SELECT id, username, password_hash FROM users WHERE username = $1 OR email = LOWER($1)',
      [login]
    );
    const user = result.rows[0];
    // Same message whether the user or the password is wrong,
    // so attackers can't find out which usernames exist.
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ message: 'Wrong username or password' });
    }
    res.json({ token: makeToken(user), user: { id: user.id, username: user.username } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Could not log in' });
  }
});

// GET /api/auth/me — who does this token belong to? (Also catches tokens
// for accounts that have since been deleted.)
authRouter.get('/me', requireAuth, async (req, res) => {
  try {
    const result = await pool.query('SELECT id, username FROM users WHERE id = $1', [req.user.id]);
    if (result.rows.length === 0) return res.status(401).json({ message: 'Account not found' });
    res.json({ user: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Could not check login' });
  }
});
