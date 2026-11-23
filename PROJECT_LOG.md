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
| 2026-11-23 | 1.5 | OoT data: scraper attempt, seed data, verified all 112 items |
| 2026-11-23 | 1.5 | API routes, login, game list, checklist with collect/uncollect |
| **Total** | **8.0** | |

---

## Log Entries

### 2026-11-23 — API, login and checklist (1.5 hr)

**What I did**
- **API routes** (server):
  - `GET /api/games`: every game in release-year order, with the logged-in user's progress (`collected / total`)
  - `GET /api/games/:gameId/items`: the checklist, grouped by location in playthrough order, with `collected` true or false for each item
  - `POST` / `DELETE /api/games/:gameId/items/:itemNo/collect`: check and uncheck an item
  - Split the server into `auth.js` (accounts) and `games.js` (checklist) using Express Routers
- **User accounts:**
  - `POST /api/auth/register` and `/login`. Passwords are hashed with **bcrypt**. Logging in returns a **JWT** that lasts 7 days.
  - `requireAuth` middleware reads the token from the `Authorization: Bearer …` header, and every games route uses it
  - `GET /api/auth/me` checks a saved token on page load
- **Frontend** (React):
  - `Login.jsx`: one form that switches between "Log in" and "Create account"
  - `GameList.jsx`: game cards with progress bars
  - `Checklist.jsx`: each location is a collapsible `<details>` section with a count like "2 / 5". Each item has a checkbox, type tag and hint. A Progress panel shows counters for each item type plus Overall.
  - `api.js`: a helper that attaches the token to every request and turns errors into readable messages
- **Tested in the browser:** register, log in, check an item (saved to the database), uncheck it (row deleted), reload (still logged in, progress kept). Error cases: duplicate username, wrong password, item that doesn't exist, non-numeric game id.

**What I learned / decided**
- **URL parameters:** `/api/games/:gameId/items` gives the code `req.params.gameId`.
- **SQL injection:** never paste user input into SQL text. `$1` placeholders send the values separately.
- **The ERD query works as planned:** `LEFT JOIN user_items … AND ui.user_id = $2` means uncollected items have no matching row, so they come back as `collected = false`.
- **Check = INSERT, uncheck = DELETE,** because a row existing means collected. `ON CONFLICT DO NOTHING` makes checking twice harmless.
- **Postgres error codes** become friendly messages: `23505` (unique) → "That username is already taken", `23503` (foreign key) → "Item not found".
- **Login security:**
  - Store a bcrypt hash, never the password.
  - Show the same message for "wrong username" and "wrong password", so attackers can't find out which usernames exist.
  - Keep `JWT_SECRET` in `.env`, off GitHub.
- **Optimistic updates:** the checkbox changes on screen immediately, then saves. If the save fails, it flips back and shows an error.
- **Edge case found while testing:** a deleted account's old token still passed `/me`. I fixed `/me` to check that the user still exists.
- The counters are calculated from the checklist data, not stored, as planned in the ERD.

**Challenges / questions**
- The token is kept in `localStorage`. That's simple but readable by any script on the page; an httpOnly cookie is safer. That's fine for a local class project, but worth knowing.
- With this session I'm ahead of schedule. I've finished the goals for 11/24, 11/30, 12/1, 12/2 and most of 12/3.

**Next steps**
- Choose and enter game #2.
- "Show next item" button.
- Styling and polish, plus testing with two users.

### 2026-11-23 — Ocarina of Time data (1.5 hr)

**What I did**
- **Tried web scraping first.** I checked each Zelda wiki's `robots.txt`, then wrote two scripts against Zeldapedia's official MediaWiki API:
  - `scraper/explore.js` searches the wiki and lists page sections, to find where the OoT data lives.
  - `scraper/fetch.js` downloads the raw wikitext for those sections.
- **The scraper didn't get usable data.** Zeldapedia's OoT Heart Piece section is a one-sentence stub, and the items page has names and icons but no locations. Since locations are what my app groups by, I switched to drafting the data by hand.
- **Drafted `db/data/oot.csv`:** 112 items across 32 locations, in playthrough order, with a `verified` column for each row.
- **Wrote `db/generate-seed.js`,** which turns the CSV into `db/seed.sql`:
  - Locations are numbered in the order they first appear, so `location_no` follows playthrough order (this is what "Show next item" will use).
  - `item_no` counts up within the game, and `sort_order` counts up within each location.
  - Added `npm run db:seed` to regenerate and load it.
- **Verified every row against guide sites:**
  - Heart Pieces: z64central.com. My draft had 34 of 36, so I added the House of Skulltula (50 tokens) and Zora's Domain torch puzzle pieces. All locations then matched, but I rewrote 21 hints that described the wrong method.
  - Bottles and 10 of 12 songs: z64central.com
  - Nocturne of Shadow and Requiem of Spirit: Zeldapedia
  - Items, equipment, upgrades, quest items, heart containers: zeldaxtreme.com
  - Great Fairy upgrades: zeldaxtreme.com's Great Fairy page
- **Result: 112 / 112 rows verified.** 36 Heart Pieces, 20 Inventory Items, 12 Songs, 12 Upgrades, 10 Quest Items, 10 Equipment, 8 Heart Containers, 4 Bottles.

**What I learned / decided**
- **Check `robots.txt` before scraping.** It's where a site says what bots may access. Several Zelda wikis block AI crawlers, and Zeldapedia allows normal scripts only through its API.
- **A scraper is only as good as the source.** The wiki had the item names but not the locations, so scraping wouldn't have saved time.
- **Keep data separate from code:** the CSV is easy to read and fix, and a script generates the SQL from it. Adding game #2 is one new CSV and one line in the script.
- **Verify, don't trust:** about 20% of my drafted hints had the right place but the wrong method (for example, the underwater Hyrule Field grotto is under the lone tree west of the Market, not near Gerudo Valley).
- Kept the Skulltula-based rewards out of scope (wallets, Stone of Agony), except the 50-token Heart Piece, because without it the counter could never reach 36 / 36.

**Challenges / questions**
- Different guide sites cover different item types, so verifying took several sources.
- Some optional capacity upgrades (Biggest Bomb Bag, Deku Seed Bag 50, stick and nut capacity) aren't in the list yet. They could be stretch additions.

**Next steps**
- API routes: `GET /games` and `GET /games/:gameId/items` (11/23 goal).
- Frontend: game list page and checklist grouped by location (11/24 goal).

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
