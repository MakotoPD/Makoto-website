CREATE TABLE admin_security (
  id integer PRIMARY KEY CHECK (id = 1),
  totp_secret text,
  enabled_at timestamptz,
  pending_secret text,
  pending_expires_at timestamptz,
  pending_session_hash text,
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK ((totp_secret IS NULL) = (enabled_at IS NULL))
);
INSERT INTO admin_security (id) VALUES (1);
