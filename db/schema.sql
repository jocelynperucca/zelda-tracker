DROP TABLE IF EXISTS games CASCADE;

CREATE TABLE games (
  id              SERIAL PRIMARY KEY,
  title           VARCHAR(100) NOT NULL UNIQUE,
  short_name      VARCHAR(10),
  release_year    INTEGER,
  console         VARCHAR(50),
  cover_image_url VARCHAR(255)
);

DROP TABLE IF EXISTS users CASCADE;

CREATE TABLE users (
  id           SERIAL PRIMARY KEY,
  username     VARCHAR(50) NOT NULL UNIQUE,
  email        VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

DROP TABLE IF EXISTS item_types CASCADE;

CREATE TABLE item_types (
  id               SERIAL PRIMARY KEY,
  name             VARCHAR(50) NOT NULL UNIQUE,
  icon_url         VARCHAR(255)
);

-- ============================================================
-- Tables below use COMPOSITE keys (numbered per game)
-- ============================================================

DROP TABLE IF EXISTS locations CASCADE;

CREATE TABLE locations (
  game_id      INTEGER      NOT NULL,
  location_no  INTEGER      NOT NULL,   -- 1, 2, 3... in PLAYTHROUGH order (used by "Show next item")
  name         VARCHAR(100) NOT NULL,

  PRIMARY KEY (game_id, location_no),
  UNIQUE (game_id, name),               -- no two locations with the same name in one game
  FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE
);

DROP TABLE IF EXISTS items CASCADE;

CREATE TABLE items (
  game_id      INTEGER      NOT NULL,
  item_no      INTEGER      NOT NULL,   -- 1, 2, 3... restarts in each game
  location_no  INTEGER      NOT NULL,
  type_id      INTEGER      NOT NULL,
  name         VARCHAR(100) NOT NULL,
  hint         VARCHAR(255),
  sort_order   INTEGER      NOT NULL DEFAULT 0,  -- order within its location

  PRIMARY KEY (game_id, item_no),
  FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE,
  -- Composite FK: game_id is shared, so an item can only point to a location IN THE SAME GAME
  FOREIGN KEY (game_id, location_no) REFERENCES locations(game_id, location_no),
  FOREIGN KEY (type_id) REFERENCES item_types(id)
);

DROP TABLE IF EXISTS user_items CASCADE;

-- A row here means "this user has collected this item". No row = not collected.
CREATE TABLE user_items (
  user_id      INTEGER   NOT NULL,
  game_id      INTEGER   NOT NULL,
  item_no      INTEGER   NOT NULL,
  collected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (user_id, game_id, item_no),   -- can't collect the same item twice
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (game_id, item_no) REFERENCES items(game_id, item_no) ON DELETE CASCADE
);
