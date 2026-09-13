CREATE TABLE IF NOT EXISTS moderation_audit (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  comment_id INTEGER NOT NULL,
  admin_id TEXT NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('approve', 'reject', 'delete')),
  previous_status TEXT,
  next_status TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS moderation_audit_comment_created_idx
  ON moderation_audit (comment_id, created_at DESC);
