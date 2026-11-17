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

### Planned tech stack (draft — may change)
| Layer | Choice | Why |
|-------|--------|-----|
| Frontend | React (Vite) | Component-based UI for game list + checklist |
| Backend | Node.js + Express | Simple REST API |
| Database | SQLite (maybe PostgreSQL later) | Easy local setup, relational data fits games → items → progress |

### Draft data model
- **games** — `id`, `title`, `release_year`, `console`
- **items** — `id`, `game_id`, `name`, `category`, `description`
- **progress** — `item_id`, `collected` (bool), `updated_at` (later: `user_id`)

---

## Time Summary

| Date | Hours | Focus |
|------|-------|-------|
| 2026-11-16 | 1.0 | Project idea, planning, repo + log setup |
| **Total** | **1.0** | |

---

## Log Entries

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
