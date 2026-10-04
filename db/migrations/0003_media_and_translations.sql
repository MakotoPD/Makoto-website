ALTER TABLE media ADD COLUMN original_id uuid REFERENCES media(id) ON DELETE RESTRICT;
ALTER TABLE media ADD COLUMN width integer;
ALTER TABLE media ADD COLUMN height integer;
CREATE INDEX media_original_idx ON media(original_id);
CREATE UNIQUE INDEX content_translation_locale_unique ON content_entries(kind, translation_group, locale) WHERE status <> 'deleted';

-- Imported Strapi metadata explicitly identifies originals and their generated formats.
-- Preserve all old media IDs and files so existing content and revisions remain valid.
WITH originals AS (
  SELECT DISTINCT obj FROM content_entries,
  LATERAL jsonb_path_query(data, '$.** ? (exists(@.formats) && exists(@.url))') obj
), pairs AS (
  SELECT substring(obj->>'url' from '/api/media/([0-9a-f-]{36})')::uuid AS original,
    substring(format->>'url' from '/api/media/([0-9a-f-]{36})')::uuid AS variant
  FROM originals, LATERAL jsonb_each(obj->'formats') f(name, format)
)
UPDATE media m SET original_id = pairs.original FROM pairs
WHERE m.id = pairs.variant AND pairs.original <> pairs.variant
AND EXISTS (SELECT 1 FROM media WHERE id = pairs.original);

WITH metadata AS (
  SELECT DISTINCT obj FROM content_entries,
  LATERAL jsonb_path_query(data, '$.** ? (exists(@.url) && exists(@.width) && exists(@.height))') obj
)
UPDATE media m SET width = (obj->>'width')::integer, height = (obj->>'height')::integer
FROM metadata WHERE m.id = substring(obj->>'url' from '/api/media/([0-9a-f-]{36})')::uuid
AND jsonb_typeof(obj->'width') = 'number' AND jsonb_typeof(obj->'height') = 'number';
