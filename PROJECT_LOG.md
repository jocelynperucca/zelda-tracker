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
| **Total** | **2.5** | |

---

## Log Entries

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
