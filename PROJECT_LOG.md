# Project Log — Zelda Item Tracker

**Author:** Jocelyn Perucca  
**Target effort:** 30–40 hours  
**Repository:** https://github.com/jocelynperucca/zelda-tracker

---

## Project Overview

A web app for tracking collectible items across *The Legend of Zelda* games. The user picks a game from a list, sees every trackable item for that game (e.g. heart pieces, upgrades, key items, dungeon items), and checks off what they have collected. Progress is saved in a database, so when the user returns and clicks a game, their checklist is loaded with everything they already marked.

### Core features (MVP)
- [ ] List of supported Zelda games
- [ ] Clicking a game loads its item list from the database
- [ ] Check / uncheck items to mark them as collected
- [ ] Progress is saved to the database and restored on reload
- [ ] Progress summary per game (e.g. "34 / 120 items, 28%")

### Stretch goals
- [ ] User accounts so multiple people can keep separate progress
- [ ] Filter / search items by category (heart pieces, bottles, upgrades, etc.)
- [ ] Notes on items (where it is found)
- [ ] Item icons / images
- [ ] Mobile-friendly layout

### Tech stack
| Layer | Choice | Why |
|-------|--------|-----|
| Frontend | React (Vite) | Component-based UI for game list + checklist |
| Backend | Node.js + Express | Simple REST API |
| Auth | bcrypt + JWT | Separate progress for each user |
| Database | PostgreSQL | Relational data with composite keys |
| Hosting | Local only | Demo runs on my machine |

### Data model
Six tables: `users`, `games`, `locations`, `item_types`, `items`, `user_items`. See [docs/ERD.md](docs/ERD.md) and the full plan in [PROPOSAL.md](PROPOSAL.md).

---

## Time Summary

| Date | Hours | Focus |
|------|-------|-------|
| 2026-11-16 | 1.0 | Project idea, planning, repo + log setup |
| 2026-11-16 | 1.5 | ERD design, project proposal, "Show next item" idea |
| 2026-11-20 | 1.0 | Project setup: React + Express + PostgreSQL (Docker) |
| 2026-11-23 | 1.5 | Database schema (`schema.sql`), OoT data planning |
| **Total** | **5.0** | |

---

## Log Entries

### 2026-11-23 — Database schema (1.5 hr)

**What I did**
- Wrote `db/schema.sql`, turning my ERD into `CREATE TABLE` statements for all six tables.
- Wrote `games`, `users` and `item_types` myself and fixed my mistakes by running the file and reading Postgres's errors:
  - I copied the `items` columns into the `users` table by accident, and reused the name `games`.
  - Trailing commas after the last column are a syntax error.
  - `DATETIME` is MySQL. PostgreSQL uses `TIMESTAMP`.
  - Added `NOT NULL UNIQUE` to `username`, `email` and `item_types.name` so the database enforces the ❄ rules from my ERD.
- Finished `locations`, `items` and `user_items` with composite primary keys and composite foreign keys.
- Tested the rules with sample data: collecting the same item twice, pointing an item at a location that doesn't exist, duplicate location names in one game, and collecting a missing item were all blocked.
- Added `npm run db:schema` to rebuild the tables.
- Started planning the Ocarina of Time data: which item types to track, and listing locations in playthrough order.

**What I learned / decided**
- **Table order matters:** parent tables (`games`, `users`, `item_types`) have to be created before the tables whose foreign keys point to them.
- Single-column keys go on the column line (`id SERIAL PRIMARY KEY`). **Composite keys go on their own line** after the columns: `PRIMARY KEY (game_id, item_no)`.
- `SERIAL` counts up automatically, so I **don't** use it for `item_no` or `location_no`, since those restart at 1 in each game.
- `UNIQUE (game_id, name)` means "unique within each game." Kakariko can exist in OoT and in BotW, but not twice in OoT.
- The composite foreign key `(game_id, location_no) → locations` is what stops an OoT item pointing to a BotW location.
- `ON DELETE CASCADE` removes a user's progress automatically if the user is deleted.
- `DROP TABLE IF EXISTS … CASCADE` lets me rerun the schema while I develop, but it erases all data.

**Challenges / questions**
- Deciding which columns are required (`NOT NULL`). I made `password_hash` required, so every account has a password.
- OoT has a lot of collectibles (100 Gold Skulltulas alone), so I need to decide what's in the MVP.

**Next steps**
- Pick the OoT item types for the MVP.
- List OoT locations in playthrough order.
- Write `db/seed.sql` (games and item types) and `db/seed_oot.sql` (locations and items).

### 2026-11-20 — Project setup (1.0 hr)

**What I did**
- Set up the project in VS Code:
  - `client/`: React app made with Vite
  - `server/`: Express API using the `pg` library to connect to PostgreSQL
  - `docker-compose.yml`: PostgreSQL 17 running in Docker
- Added a `/api/health` route that queries the database, and a React page that calls it. The page showed **"✅ Connected!"**, which proves the frontend → API → database chain works.
- Added `npm run dev` to start the server and client together, and `npm run db` to start the database.
- Wrote setup steps in the README.

**What I learned / decided**
- My other project (Xplore) already uses port 5432 for Postgres, so this one uses **5433**.
- Vite's **proxy** forwards `/api/...` requests from the React dev server to Express, so I don't need to set up CORS.
- Secrets like the database URL go in `server/.env`, which is git-ignored. `.env.example` is the template that gets committed.

**Challenges / questions**
- I'm about 3 days behind my daily goals, so I need to catch up on data entry.

**Next steps**
- Write `db/schema.sql` from the ERD.

### 2026-11-16 — ERD design and project proposal (1.5 hr)

**What I did**
- Designed the database ERD step by step: described the app in sentences, picked out the nouns as entities, decided which ones are tables and which are columns, and worked out the relationships.
- Drew the final ERD in DrawSQL with six tables: `users`, `games`, `locations`, `item_types`, `items`, `user_items` ([docs/ERD.md](docs/ERD.md)).
- Fixed two mistakes in my first drawing: `items.item_no` wasn't marked as part of the primary key, and `user_items.game_id` pointed to `games` instead of `items`.
- Wrote the project proposal ([PROPOSAL.md](PROPOSAL.md)): purpose and goals, wireframe, system design diagram, planned API routes, and daily goals through Dec 10.
- Chose my stack: React (Vite) + Express + PostgreSQL, run locally. First games: Ocarina of Time plus one more.
- Added a stretch goal: a **"Show next item" button** that shows only the next item I haven't collected.

**What I learned / decided**
- **Each heart piece is its own item**, so items can be grouped by where they're found. The "Heart Pieces 12 / 36" counter is calculated, not stored, so it can't get out of sync.
- **Users and items are many-to-many.** A relational database needs a junction table (`user_items`) for that. A `collected` column on `items` would be shared by every user.
- **Locations belong to a game.** Kakariko in OoT and in BotW are different places.
- **Items and locations are numbered per game** (composite keys like `(game_id, item_no)`). This also means an item can't point to a location in a different game.
- **No `collected` column:** if a `user_items` row exists, the item is collected. The composite primary key prevents duplicates.
- **Item types are their own table** to prevent typos that would break the counters.
- **Normalization:** store each fact in only one place. Putting `game_id` on `user_items` is only correct because it's part of the composite key that points to `items`.
- DrawSQL draws composite foreign keys as one line per column.

**Challenges / questions**
- Deciding between global item IDs and per-game numbering. I chose per-game numbering, which means more composite keys.
- I haven't picked the second game yet.

**Next steps**
- Set up the project skeleton: Vite frontend, Express backend, local PostgreSQL.
- Write `schema.sql` from the ERD.
- When entering OoT data, number locations in **playthrough order** so `location_no` can drive the "Show next item" feature.

### 2026-11-16 — Project kickoff (1.0 hr)

**What I did**
- Chose my project: a Legend of Zelda item tracker.
- Wrote down the core idea: select a game → see its item list → check off items → progress saved in a database and loaded back when the game is opened again.
- Drafted the MVP feature list, stretch goals, a first-pass tech stack, and a simple data model (games, items, progress).
- Created the GitHub repo and this project log.

**What I learned / decided**
- The data naturally fits a relational database: one game has many items, and each item has a collected/not-collected state.
- I'll need to decide which games to include first. Starting with 1–2 games keeps the item-data entry manageable.

**Challenges / questions**
- Where to source accurate item lists for each game (wikis, guides) and how to load them into the database (seed script vs. manual entry).
- Whether to add user accounts in the MVP or keep a single-user tracker first.

**Next steps**
- Pick the first game(s) to support and gather their item lists.
- Set up the project skeleton (frontend + backend + database).
- Write a seed script for games and items.

---

<!--
Template for new entries (copy above the previous entry's divider):

### YYYY-MM-DD — Short title (X.X hr)

**What I did**
-

**What I learned / decided**
-

**Challenges / questions**
-

**Next steps**
-

Remember to update the Time Summary table, then commit and push.
-->
