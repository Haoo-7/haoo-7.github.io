ALTER TABLE comments ADD COLUMN email_hmac TEXT;

CREATE TABLE IF NOT EXISTS email_verification_codes (
  email_hmac TEXT PRIMARY KEY,
  code_digest TEXT NOT NULL,
  expires_at INTEGER NOT NULL,
  last_sent_at INTEGER NOT NULL,
  attempts INTEGER NOT NULL DEFAULT 0 CHECK (attempts >= 0 AND attempts <= 5)
);

CREATE TABLE IF NOT EXISTS comment_verification_sessions (
  token_digest TEXT PRIMARY KEY,
  email_hmac TEXT NOT NULL,
  expires_at INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS comment_verification_sessions_expires_idx
  ON comment_verification_sessions (expires_at);

CREATE INDEX IF NOT EXISTS email_verification_codes_expires_idx
  ON email_verification_codes (expires_at);
