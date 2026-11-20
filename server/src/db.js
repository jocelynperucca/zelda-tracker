import pg from 'pg';

// One shared pool of connections to PostgreSQL.
// DATABASE_URL comes from server/.env
export const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});
