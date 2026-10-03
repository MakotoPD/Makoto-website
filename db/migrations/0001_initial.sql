CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS content_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind text NOT NULL,
  locale text NOT NULL CHECK (locale IN ('pl', 'en')),
  slug text NOT NULL,
  translation_group text NOT NULL,
  title text NOT NULL,
  summary text NOT NULL DEFAULT '',
  body jsonb NOT NULL DEFAULT '{"type":"doc","content":[]}'::jsonb,
  sections jsonb NOT NULL DEFAULT '[]'::jsonb,
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'deleted')),
  seo_title text,
  seo_description text,
  cover_media_id uuid,
  source_key text,
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT published_date_required CHECK (status <> 'published' OR published_at IS NOT NULL)
);
CREATE UNIQUE INDEX IF NOT EXISTS content_entries_path_unique ON content_entries(kind, locale, slug);
CREATE UNIQUE INDEX IF NOT EXISTS content_entries_source_unique ON content_entries(source_key);
CREATE INDEX IF NOT EXISTS content_entries_public_idx ON content_entries(kind, locale, status, published_at);
CREATE INDEX IF NOT EXISTS content_entries_translation_idx ON content_entries(translation_group);

CREATE TABLE IF NOT EXISTS content_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_id uuid NOT NULL REFERENCES content_entries(id) ON DELETE CASCADE,
  number integer NOT NULL,
  snapshot jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(entry_id, number)
);

CREATE TABLE IF NOT EXISTS media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  object_key text NOT NULL UNIQUE,
  name text NOT NULL,
  mime text NOT NULL,
  bytes integer NOT NULL CHECK (bytes > 0),
  alt text NOT NULL DEFAULT '',
  caption text NOT NULL DEFAULT '',
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE content_entries ADD CONSTRAINT content_entries_cover_media_fk FOREIGN KEY (cover_media_id) REFERENCES media(id);
CREATE TABLE IF NOT EXISTS content_media (
  entry_id uuid NOT NULL REFERENCES content_entries(id) ON DELETE CASCADE,
  media_id uuid NOT NULL REFERENCES media(id) ON DELETE RESTRICT,
  PRIMARY KEY (entry_id, media_id)
);

CREATE TABLE IF NOT EXISTS admin_sessions (
  token_hash text PRIMARY KEY,
  csrf_hash text NOT NULL,
  expires_at timestamptz NOT NULL,
  revoked_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS used_totp_steps (
  step bigint PRIMARY KEY,
  used_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS admin_login_attempts (
  key text PRIMARY KEY,
  attempts integer NOT NULL DEFAULT 0,
  blocked_until timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now()
);
