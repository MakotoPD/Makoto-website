-- Project descriptions and new personal projects. Applied once by db-migrate.mjs.
-- Screenshot originals are restored with scripts/restore-project-media.mjs before deployment.
-- Compare each field to its previous value so CMS edits are retained.
-- Keep snapshots before and after the update in the existing revision history.
CREATE TEMP TABLE project_content_context (initialized boolean) ON COMMIT DROP;

CREATE FUNCTION pg_temp.project_content_snapshot(r jsonb) RETURNS jsonb LANGUAGE sql AS $snapshot$
  SELECT jsonb_build_object(
    'id', r->'id', 'kind', r->'kind', 'locale', r->'locale', 'slug', r->'slug',
    'translationGroup', r->'translation_group', 'title', r->'title', 'summary', r->'summary',
    'body', r->'body', 'sections', r->'sections', 'data', r->'data', 'status', r->'status',
    'seoTitle', r->'seo_title', 'seoDescription', r->'seo_description', 'coverMediaId', r->'cover_media_id',
    'sourceKey', r->'source_key', 'publishedAt', r->'published_at', 'createdAt', r->'created_at', 'updatedAt', r->'updated_at'
  );
$snapshot$;

CREATE FUNCTION pg_temp.update_project_content(target_kind text, target_locale text, target_slug text, expected jsonb, replacement jsonb)
RETURNS void LANGUAGE plpgsql AS $update$
DECLARE
  entry content_entries%ROWTYPE;
  original jsonb;
  patch jsonb := '{}'::jsonb;
  merged_data jsonb;
  field record;
  data_field record;
  revision integer;
BEGIN
  SELECT * INTO entry FROM content_entries
  WHERE kind = target_kind AND locale = target_locale AND slug = target_slug AND status <> 'deleted'
  FOR UPDATE;
  IF NOT FOUND THEN RETURN; END IF;
  original := to_jsonb(entry);
  FOR field IN SELECT key, value FROM jsonb_each(replacement) LOOP
    IF field.key = 'data' THEN
      merged_data := entry.data;
      FOR data_field IN SELECT key, value FROM jsonb_each(field.value) LOOP
        IF (entry.data->data_field.key) IS NOT DISTINCT FROM (expected->'data'->data_field.key) THEN
          merged_data := merged_data || jsonb_build_object(data_field.key, data_field.value);
        END IF;
      END LOOP;
      IF merged_data IS DISTINCT FROM entry.data THEN patch := patch || jsonb_build_object('data', merged_data); END IF;
    ELSIF (original->field.key) IS NOT DISTINCT FROM (expected->field.key) AND (original->field.key) IS DISTINCT FROM field.value THEN
      patch := patch || jsonb_build_object(field.key, field.value);
    END IF;
  END LOOP;
  IF patch = '{}'::jsonb THEN RETURN; END IF;
  SELECT COALESCE(MAX(number), 0) + 1 INTO revision FROM content_versions WHERE entry_id = entry.id;
  INSERT INTO content_versions(entry_id, number, snapshot) VALUES (entry.id, revision, pg_temp.project_content_snapshot(original));
  UPDATE content_entries SET
    summary = COALESCE(patch->>'summary', entry.summary),
    body = COALESCE(patch->'body', entry.body),
    sections = COALESCE(patch->'sections', entry.sections),
    data = COALESCE(patch->'data', entry.data),
    seo_title = CASE WHEN patch ? 'seo_title' THEN patch->>'seo_title' ELSE entry.seo_title END,
    seo_description = CASE WHEN patch ? 'seo_description' THEN patch->>'seo_description' ELSE entry.seo_description END,
    updated_at = now()
  WHERE id = entry.id RETURNING * INTO entry;
  INSERT INTO content_versions(entry_id, number, snapshot) VALUES (entry.id, revision + 1, pg_temp.project_content_snapshot(to_jsonb(entry)));
END;
$update$;

SELECT pg_temp.update_project_content('project', 'pl', 'hog-copernicus-chapter', $project_content${"summary":"Hogcopernicus.pl to strona Copernicus Chapter Poland – lokalnego chapteru Harley‑Davidson Owners Group, prezentująca profile i wartości jego członków oraz zachęcająca do dołączenia do społeczności miłośników motocykli Harley‑Davidson.\nStrona oferuje również forum dostępne po zalogowaniu, stanowiące przestrzeń dla członków do wymiany informacji i kontaktu w ramach chapteru.","body":{"type":"doc","content":[{"type":"paragraph","content":[{"text":"Hogcopernicus.pl to strona Copernicus Chapter Poland – lokalnego chapteru Harley‑Davidson Owners Group, prezentująca profile i wartości jego członków oraz zachęcająca do dołączenia do społeczności miłośników motocykli Harley‑Davidson.","type":"text"},{"type":"hardBreak"},{"text":"Strona oferuje również forum dostępne po zalogowaniu, stanowiące przestrzeń dla członków do wymiany informacji i kontaktu w ramach chapteru.","type":"text"}]}]},"seo_title":"HOG Copernicus Chapter","seo_description":"Hogcopernicus.pl to strona Copernicus Chapter Poland – lokalnego chapteru Harley‑Davidson Owners Group, prezentująca profile i wartości jego członków oraz zachęcająca do dołączenia do społeczności miłośników motocykli Harley‑Davidson.\nStrona oferuje również forum dostępne po zalogowaniu, stanowiące przestrzeń dla członków do wymiany informacji i kontaktu w ramach chapteru.","data":{}}$project_content$::jsonb, $project_content${"summary":"Strona internetowa i forum dla HOG Copernicus Chapter z Torunia, organizacji zrzeszającej miłośników motocykli Harley-Davidson.","body":{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Strona internetowa i forum dla HOG Copernicus Chapter z Torunia, organizacji zrzeszającej miłośników motocykli Harley-Davidson."}]}]},"seo_title":"HOG Copernicus — strona i forum w Toruniu | Makoto","seo_description":"Strona internetowa i forum dla HOG Copernicus Chapter z Torunia, organizacji zrzeszającej miłośników motocykli Harley-Davidson.","data":{"projectOwnership":"client","clientName":"HOG Copernicus Chapter","clientCity":"Toruń","industry":"Społeczność motocyklistów","serviceSlugs":["strony-internetowe"],"caseStudy":{"challenge":"Organizacja z Torunia zrzeszająca fanów marki Harley-Davidson nie miała własnej strony internetowej ani forum. Celem było stworzenie miejsca, w którym mogłaby zaistnieć w sieci i utrzymywać kontakt z członkami.","solution":"Stworzyłem stronę prezentującą HOG Copernicus Chapter oraz forum dostępne po zalogowaniu. Serwis przedstawia społeczność, a forum służy członkom do wymiany informacji i rozmów.","outcome":"Organizacja zyskała własną obecność w internecie: stronę, na której można poznać chapter, oraz forum do komunikacji między członkami."}}}$project_content$::jsonb);

SELECT pg_temp.update_project_content('project', 'pl', 'voidlink', $project_content${"summary":"Nowoczesna, wydajna i łatwa w użyciu aplikacja komputerowa do tworzenia serwerów Minecraft i zarządzania nimi. Zbudowana przy użyciu Tauri 2.0, Nuxt 3 i TypeScript.","body":{"type":"doc","content":[{"type":"paragraph","content":[{"text":"Nowoczesna, wydajna i łatwa w użyciu aplikacja komputerowa do tworzenia serwerów Minecraft i zarządzania nimi. Zbudowana przy użyciu Tauri 2.0, Nuxt 3 i TypeScript.","type":"text"}]}]},"seo_title":"VoidLink","seo_description":"Nowoczesna, wydajna i łatwa w użyciu aplikacja komputerowa do tworzenia serwerów Minecraft i zarządzania nimi. Zbudowana przy użyciu Tauri 2.0, Nuxt 3 i TypeScript.","data":{}}$project_content$::jsonb, $project_content${"summary":"Mój projekt własny: aplikacja komputerowa do tworzenia serwerów Minecraft i zarządzania nimi, zbudowana w Tauri 2.0, Nuxt 3 i TypeScript.","body":{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Mój projekt własny: aplikacja komputerowa do tworzenia serwerów Minecraft i zarządzania nimi, zbudowana w Tauri 2.0, Nuxt 3 i TypeScript."}]}]},"seo_title":"VoidLink — aplikacja do serwerów Minecraft | Makoto","seo_description":"Mój projekt własny: aplikacja komputerowa do tworzenia serwerów Minecraft i zarządzania nimi, zbudowana w Tauri 2.0, Nuxt 3 i TypeScript.","data":{"projectOwnership":"own","industry":"Minecraft / aplikacje komputerowe","serviceSlugs":["aplikacje-internetowe"],"caseStudy":{"challenge":"Chciałem stworzyć własną aplikację, która ułatwia tworzenie serwerów Minecraft i zarządzanie nimi.","solution":"Rozwijam VoidLink jako aplikację komputerową opartą na Tauri 2.0, Nuxt 3 i TypeScript, z interfejsem do obsługi serwerów Minecraft.","outcome":"Powstało własne narzędzie do tworzenia i obsługi serwerów Minecraft. VoidLink jest moją aplikacją, rozwijaną jako projekt własny."}}}$project_content$::jsonb);

SELECT pg_temp.update_project_content('project', 'en', 'hog-copernicus-chapter', $project_content${"summary":"Hogcopernicus.pl is the website of Copernicus Chapter Poland—a local chapter of the Harley-Davidson Owners Group—which showcases its members’ profiles and values and encourages people to join the community of Harley-Davidson motorcycle enthusiasts.\nThe site also features a forum accessible after logging in, providing a space for members to exchange information and stay in touch within the chapter.","body":{"type":"doc","content":[{"type":"paragraph","content":[{"text":"Hogcopernicus.pl is the website of Copernicus Chapter Poland—a local chapter of the Harley-Davidson Owners Group—which showcases its members’ profiles and values and encourages people to join the community of Harley-Davidson motorcycle enthusiasts.","type":"text"},{"type":"hardBreak"},{"text":"The site also features a forum accessible after logging in, providing a space for members to exchange information and stay in touch within the chapter.","type":"text"}]}]},"seo_title":"HOG Copernicus Chapter","seo_description":"Hogcopernicus.pl is the website of Copernicus Chapter Poland—a local chapter of the Harley-Davidson Owners Group—which showcases its members’ profiles and values and encourages people to join the community of Harley-Davidson motorcycle enthusiasts.\nThe site also features a forum accessible after logging in, providing a space for members to exchange information and stay in touch within the chapter.","data":{}}$project_content$::jsonb, $project_content${"summary":"A website and forum for HOG Copernicus Chapter in Toruń, an organization bringing together Harley-Davidson enthusiasts.","body":{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"A website and forum for HOG Copernicus Chapter in Toruń, an organization bringing together Harley-Davidson enthusiasts."}]}]},"seo_title":"HOG Copernicus — website and forum in Toruń | Makoto","seo_description":"A website and forum for HOG Copernicus Chapter in Toruń, an organization bringing together Harley-Davidson enthusiasts.","data":{"projectOwnership":"client","clientName":"HOG Copernicus Chapter","clientCity":"Toruń","industry":"Motorcycling community","serviceSlugs":["websites"],"caseStudy":{"challenge":"The Toruń-based organization of Harley-Davidson enthusiasts had no website or forum. The goal was to establish an online presence and provide a place for members to stay in touch.","solution":"I built a website presenting HOG Copernicus Chapter and a forum accessible after signing in. The website introduces the community, while the forum lets members exchange information and keep in touch.","outcome":"The organization gained an online presence: a website where people can learn about the chapter and a forum for communication between members."}}}$project_content$::jsonb);

SELECT pg_temp.update_project_content('project', 'en', 'voidlink', $project_content${"summary":"A modern, powerful, and easy-to-use desktop application for creating and managing Minecraft servers. Built with Tauri 2.0, Nuxt 3, and TypeScript.","body":{"type":"doc","content":[{"type":"paragraph","content":[{"text":"A modern, powerful, and easy-to-use desktop application for creating and managing Minecraft servers. Built with Tauri 2.0, Nuxt 3, and TypeScript.","type":"text"}]}]},"seo_title":"VoidLink","seo_description":"A modern, powerful, and easy-to-use desktop application for creating and managing Minecraft servers. Built with Tauri 2.0, Nuxt 3, and TypeScript.","data":{}}$project_content$::jsonb, $project_content${"summary":"My own project: a desktop application for creating and managing Minecraft servers, built with Tauri 2.0, Nuxt 3 and TypeScript.","body":{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"My own project: a desktop application for creating and managing Minecraft servers, built with Tauri 2.0, Nuxt 3 and TypeScript."}]}]},"seo_title":"VoidLink — Minecraft server application | Makoto","seo_description":"My own project: a desktop application for creating and managing Minecraft servers, built with Tauri 2.0, Nuxt 3 and TypeScript.","data":{"projectOwnership":"own","industry":"Minecraft / desktop applications","serviceSlugs":["web-applications"],"caseStudy":{"challenge":"I wanted to build my own application to make creating and managing Minecraft servers easier.","solution":"I develop VoidLink as a desktop application based on Tauri 2.0, Nuxt 3 and TypeScript, with an interface for managing Minecraft servers.","outcome":"The result is my own tool for creating and managing Minecraft servers. VoidLink is an application I develop as a personal project."}}}$project_content$::jsonb);

INSERT INTO media(id, object_key, name, mime, bytes, alt, caption, width, height, published_at)
VALUES ('fda158b5-6d53-4995-a521-19fa7d587f84', 'private/fda158b5-6d53-4995-a521-19fa7d587f84.png', 'spectra.png', 'image/png', 1688269, 'Strona Spectra i podgląd launchera Minecraft', '', 2244, 1265, now())
ON CONFLICT DO NOTHING;

WITH created AS (
  INSERT INTO content_entries(kind, locale, slug, translation_group, title, summary, body, sections, data, status, seo_title, seo_description, cover_media_id, source_key, published_at)
  VALUES ('project', 'pl', 'spectra', 'project:spectra', 'Spectra', 'Mój launcher do gry Minecraft. Projekt własny z interfejsem zbudowanym w Nuxt i Vue.js oraz przechowywaniem plików w Cloudflare R2.', $project_content${"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Spectra to mój projekt własny: launcher do gry Minecraft. W projekcie wykorzystuję Nuxt, Vue.js i Cloudflare R2."}]}]}$project_content$::jsonb, '[]'::jsonb, $project_content${"projectOwnership":"own","industry":"Minecraft / aplikacje dla graczy","serviceSlugs":["aplikacje-internetowe"],"caseStudy":{"challenge":"Celem projektu było stworzenie własnego launchera do gry Minecraft.","solution":"Rozwijam Spectra, wykorzystując Nuxt i Vue.js do budowy interfejsu oraz Cloudflare R2 do przechowywania plików.","outcome":"Spectra to mój własny launcher Minecraft. Projekt łączy aplikację dla graczy z jej stroną internetową."},"theme":"sky","primaryColor":"#38bdf8","stack":[{"name":"Nuxt","logo":"i-mkt-nuxt"},{"name":"Vue.js","logo":"i-mkt-vuejs"},{"name":"Cloudflare R2","logo":"i-mkt-cloudflare"}],"slogan":"Mój launcher do gry Minecraft","featured":false,"image":{"mediaId":"fda158b5-6d53-4995-a521-19fa7d587f84","url":"/api/media/fda158b5-6d53-4995-a521-19fa7d587f84","name":"spectra.png","width":2244,"height":1265,"alternativeText":"Strona Spectra i podgląd launchera Minecraft"}}$project_content$::jsonb, 'published', 'Spectra — launcher Minecraft | Makoto', 'Mój launcher do gry Minecraft. Projekt własny z interfejsem zbudowanym w Nuxt i Vue.js oraz przechowywaniem plików w Cloudflare R2.', 'fda158b5-6d53-4995-a521-19fa7d587f84', 'portfolio:spectra:pl', now())
  ON CONFLICT DO NOTHING RETURNING *
)
INSERT INTO content_versions(entry_id, number, snapshot)
SELECT id, 1, pg_temp.project_content_snapshot(to_jsonb(created)) FROM created;

WITH created AS (
  INSERT INTO content_entries(kind, locale, slug, translation_group, title, summary, body, sections, data, status, seo_title, seo_description, cover_media_id, source_key, published_at)
  VALUES ('project', 'en', 'spectra', 'project:spectra', 'Spectra', 'My Minecraft launcher. A personal project with an interface built in Nuxt and Vue.js and file storage in Cloudflare R2.', $project_content${"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Spectra is my own project: a launcher for Minecraft. The project uses Nuxt, Vue.js and Cloudflare R2."}]}]}$project_content$::jsonb, '[]'::jsonb, $project_content${"projectOwnership":"own","industry":"Minecraft / gaming applications","serviceSlugs":["web-applications"],"caseStudy":{"challenge":"The goal was to create my own launcher for Minecraft.","solution":"I develop Spectra using Nuxt and Vue.js for the interface and Cloudflare R2 for file storage.","outcome":"Spectra is my own Minecraft launcher. The project brings together a gaming application and its website."},"theme":"sky","primaryColor":"#38bdf8","stack":[{"name":"Nuxt","logo":"i-mkt-nuxt"},{"name":"Vue.js","logo":"i-mkt-vuejs"},{"name":"Cloudflare R2","logo":"i-mkt-cloudflare"}],"slogan":"My Minecraft launcher","featured":false,"image":{"mediaId":"fda158b5-6d53-4995-a521-19fa7d587f84","url":"/api/media/fda158b5-6d53-4995-a521-19fa7d587f84","name":"spectra.png","width":2244,"height":1265,"alternativeText":"Spectra website and a preview of the Minecraft launcher"}}$project_content$::jsonb, 'published', 'Spectra — Minecraft launcher | Makoto', 'My Minecraft launcher. A personal project with an interface built in Nuxt and Vue.js and file storage in Cloudflare R2.', 'fda158b5-6d53-4995-a521-19fa7d587f84', 'portfolio:spectra:en', now())
  ON CONFLICT DO NOTHING RETURNING *
)
INSERT INTO content_versions(entry_id, number, snapshot)
SELECT id, 1, pg_temp.project_content_snapshot(to_jsonb(created)) FROM created;

INSERT INTO content_media(entry_id, media_id)
SELECT id, cover_media_id FROM content_entries
WHERE kind = 'project' AND slug = 'spectra' AND cover_media_id = 'fda158b5-6d53-4995-a521-19fa7d587f84'
ON CONFLICT DO NOTHING;

INSERT INTO media(id, object_key, name, mime, bytes, alt, caption, width, height, published_at)
VALUES ('e75596b0-4aff-46e5-b159-1f4217a6bb33', 'private/e75596b0-4aff-46e5-b159-1f4217a6bb33.png', 'denalify.png', 'image/png', 169759, 'Strona Denalify z podglądem tablicy zadań Kanban', '', 1498, 914, now())
ON CONFLICT DO NOTHING;

WITH created AS (
  INSERT INTO content_entries(kind, locale, slug, translation_group, title, summary, body, sections, data, status, seo_title, seo_description, cover_media_id, source_key, published_at)
  VALUES ('project', 'pl', 'denalify', 'project:denalify', 'Denalify', 'Moja aplikacja webowa dla organizacji i mniejszych zespołów: zadania Kanban, CRM, ERP, czat oraz tworzenie sklepów internetowych w Liquid.', $project_content${"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Denalify jest moją aplikacją webową, którą rozwijam w Inowrocławiu. Pracuję nad interfejsem w Nuxt i Vue.js oraz backendem w AdonisJS. Pliki przechowuję w Cloudflare R2."}]},{"type":"bulletList","content":[{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"Menedżer zadań z tablicą Kanban"}]}]},{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"CRM do zarządzania relacjami z klientami"}]}]},{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"ERP do obsługi procesów organizacji"}]}]},{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"Czat dla zespołów"}]}]},{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"Tworzenie sklepów internetowych z szablonami Liquid"}]}]}]}]}$project_content$::jsonb, '[]'::jsonb, $project_content${"projectOwnership":"own","clientCity":"Inowrocław","industry":"Systemy dla organizacji i zespołów","serviceSlugs":["aplikacje-internetowe","sklepy-internetowe"],"caseStudy":{"challenge":"Celem było stworzenie własnego systemu, który łączy narzędzia do pracy organizacji i mniejszych zespołów w jednej aplikacji webowej.","solution":"Rozwijam Denalify z menedżerem zadań Kanban, modułami CRM i ERP, czatem oraz możliwością tworzenia sklepów internetowych w Liquid. Interfejs powstaje w Nuxt i Vue.js, backend w AdonisJS, a pliki są przechowywane w Cloudflare R2.","outcome":"Powstała moja aplikacja webowa łącząca zarządzanie zadaniami, relacjami z klientami, procesami organizacji, komunikacją i sklepami internetowymi."},"theme":"sky","primaryColor":"#7dd3fc","stack":[{"name":"Nuxt","logo":"i-mkt-nuxt"},{"name":"Vue.js","logo":"i-mkt-vuejs"},{"name":"Cloudflare R2","logo":"i-mkt-cloudflare"},{"name":"AdonisJS","logo":"i-mkt-adonisjs"}],"slogan":"Zadania, klienci i komunikacja w jednym miejscu","featured":false,"image":{"mediaId":"e75596b0-4aff-46e5-b159-1f4217a6bb33","url":"/api/media/e75596b0-4aff-46e5-b159-1f4217a6bb33","name":"denalify.png","width":1498,"height":914,"alternativeText":"Strona Denalify z podglądem tablicy zadań Kanban"}}$project_content$::jsonb, 'published', 'Denalify — Kanban, CRM i ERP dla zespołów | Makoto', 'Moja aplikacja webowa dla organizacji i mniejszych zespołów: zadania Kanban, CRM, ERP, czat oraz tworzenie sklepów internetowych w Liquid.', 'e75596b0-4aff-46e5-b159-1f4217a6bb33', 'portfolio:denalify:pl', now())
  ON CONFLICT DO NOTHING RETURNING *
)
INSERT INTO content_versions(entry_id, number, snapshot)
SELECT id, 1, pg_temp.project_content_snapshot(to_jsonb(created)) FROM created;

WITH created AS (
  INSERT INTO content_entries(kind, locale, slug, translation_group, title, summary, body, sections, data, status, seo_title, seo_description, cover_media_id, source_key, published_at)
  VALUES ('project', 'en', 'denalify', 'project:denalify', 'Denalify', 'My web application for organizations and small teams: Kanban tasks, CRM, ERP, chat and online store creation using Liquid.', $project_content${"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Denalify is my web application, developed in Inowrocław. I work on the Nuxt and Vue.js interface and the AdonisJS backend. Files are stored in Cloudflare R2."}]},{"type":"bulletList","content":[{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"Task management with a Kanban board"}]}]},{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"CRM for managing customer relationships"}]}]},{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"ERP for organizational processes"}]}]},{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"Team chat"}]}]},{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"Online store creation with Liquid templates"}]}]}]}]}$project_content$::jsonb, '[]'::jsonb, $project_content${"projectOwnership":"own","clientCity":"Inowrocław","industry":"Organization and team software","serviceSlugs":["web-applications","online-stores"],"caseStudy":{"challenge":"The goal was to build my own web application bringing together the tools organizations and small teams use for their work.","solution":"I develop Denalify with Kanban task management, CRM and ERP modules, chat and online store creation using Liquid. The interface uses Nuxt and Vue.js, the backend uses AdonisJS and files are stored in Cloudflare R2.","outcome":"The result is my web application combining task management, customer relationships, organizational processes, communication and online stores."},"theme":"sky","primaryColor":"#7dd3fc","stack":[{"name":"Nuxt","logo":"i-mkt-nuxt"},{"name":"Vue.js","logo":"i-mkt-vuejs"},{"name":"Cloudflare R2","logo":"i-mkt-cloudflare"},{"name":"AdonisJS","logo":"i-mkt-adonisjs"}],"slogan":"Tasks, customers and communication in one place","featured":false,"image":{"mediaId":"e75596b0-4aff-46e5-b159-1f4217a6bb33","url":"/api/media/e75596b0-4aff-46e5-b159-1f4217a6bb33","name":"denalify.png","width":1498,"height":914,"alternativeText":"Denalify website with a preview of its Kanban task board"}}$project_content$::jsonb, 'published', 'Denalify — Kanban, CRM and ERP for teams | Makoto', 'My web application for organizations and small teams: Kanban tasks, CRM, ERP, chat and online store creation using Liquid.', 'e75596b0-4aff-46e5-b159-1f4217a6bb33', 'portfolio:denalify:en', now())
  ON CONFLICT DO NOTHING RETURNING *
)
INSERT INTO content_versions(entry_id, number, snapshot)
SELECT id, 1, pg_temp.project_content_snapshot(to_jsonb(created)) FROM created;

INSERT INTO content_media(entry_id, media_id)
SELECT id, cover_media_id FROM content_entries
WHERE kind = 'project' AND slug = 'denalify' AND cover_media_id = 'e75596b0-4aff-46e5-b159-1f4217a6bb33'
ON CONFLICT DO NOTHING;

DO $related_projects$
DECLARE
  entry content_entries%ROWTYPE;
  old_sections jsonb;
  new_sections jsonb;
  section jsonb;
  links jsonb;
  linked_slug text;
  added text[];
BEGIN
  FOR entry IN SELECT * FROM content_entries
    WHERE kind = 'service' AND slug IN ('aplikacje-internetowe', 'web-applications', 'sklepy-internetowe', 'online-stores') AND status <> 'deleted'
    FOR UPDATE
  LOOP
    old_sections := entry.sections;
    new_sections := '[]'::jsonb;
    added := CASE WHEN entry.slug IN ('aplikacje-internetowe', 'web-applications') THEN ARRAY['spectra', 'denalify'] ELSE ARRAY['denalify'] END;
    FOR section IN SELECT value FROM jsonb_array_elements(old_sections) LOOP
      IF section->>'type' = 'related' THEN
        links := COALESCE(section->'slugs', '[]'::jsonb);
        FOREACH linked_slug IN ARRAY added LOOP
          IF NOT links @> jsonb_build_array(linked_slug) THEN links := links || jsonb_build_array(linked_slug); END IF;
        END LOOP;
        section := section || jsonb_build_object('slugs', links);
      END IF;
      new_sections := new_sections || jsonb_build_array(section);
    END LOOP;
    PERFORM pg_temp.update_project_content('service', entry.locale, entry.slug, jsonb_build_object('sections', old_sections), jsonb_build_object('sections', new_sections));
  END LOOP;
END;
$related_projects$;
