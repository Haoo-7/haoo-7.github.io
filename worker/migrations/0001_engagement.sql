PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS article_stats (
  slug TEXT PRIMARY KEY,
  views INTEGER NOT NULL DEFAULT 0 CHECK (views >= 0),
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS article_views (
  slug TEXT NOT NULL,
  visitor_id TEXT NOT NULL,
  viewed_on TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (slug, visitor_id, viewed_on)
);

CREATE TABLE IF NOT EXISTS article_likes (
  slug TEXT NOT NULL,
  visitor_id TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (slug, visitor_id)
);

CREATE TABLE IF NOT EXISTS comments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL,
  visitor_id TEXT NOT NULL,
  display_name TEXT NOT NULL,
  content TEXT NOT NULL,
  website TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('approved', 'pending', 'rejected')),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS comments_slug_status_created_idx
  ON comments (slug, status, created_at DESC);

CREATE TABLE IF NOT EXISTS comment_rate_limits (
  visitor_id TEXT NOT NULL,
  window_start TEXT NOT NULL,
  request_count INTEGER NOT NULL DEFAULT 1 CHECK (request_count >= 1),
  PRIMARY KEY (visitor_id, window_start)
);
