# Zelda Item Tracker

A tracker for collectible items across *The Legend of Zelda* games. Pick a game, check off the items you have collected, and your progress is saved in a database and loaded the next time you open that game.

See [PROJECT_LOG.md](PROJECT_LOG.md) for the development log.

See [PROPOSAL.md](PROPOSAL.md) for the project proposal, and [docs/ERD.md](docs/ERD.md) for the database design.

## Running it locally

**Needs:** Node.js and Docker Desktop.

```bash
npm run install:all              # install root, server and client packages
cp server/.env.example server/.env
npm run db                       # start PostgreSQL in Docker (port 5433)
npm run db:schema                # create the tables (WARNING: wipes existing data)
npm run dev                      # start the API (3001) and React app (5173)
```

Open http://localhost:5173. You should see "✅ Connected!", which means the React app reached the API and the API reached the database.

## Project structure

```
client/   React app (Vite)
server/   Express API (src/index.js, src/db.js)
db/       SQL schema and seed data (coming next)
docs/     ERD and wireframe
```
