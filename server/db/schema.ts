import { pgTable, uuid, text, timestamp, jsonb, integer, bigint, primaryKey, uniqueIndex } from 'drizzle-orm/pg-core'

export const entries = pgTable('content_entries', {
  id: uuid('id').primaryKey().defaultRandom(),
  kind: text('kind').notNull(),
  locale: text('locale').notNull(),
  slug: text('slug').notNull(),
  translationGroup: text('translation_group').notNull(),
  title: text('title').notNull(),
  summary: text('summary').notNull().default(''),
  body: jsonb('body').$type<Record<string, unknown>>().notNull().default({ type: 'doc', content: [] }),
  sections: jsonb('sections').$type<Record<string, unknown>[]>().notNull().default([]),
  data: jsonb('data').$type<Record<string, unknown>>().notNull().default({}),
  status: text('status').notNull().default('draft'),
  seoTitle: text('seo_title'),
  seoDescription: text('seo_description'),
  coverMediaId: uuid('cover_media_id'),
  sourceKey: text('source_key'),
  publishedAt: timestamp('published_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
}, table => ({
  path: uniqueIndex('content_entries_path_unique').on(table.kind, table.locale, table.slug),
  source: uniqueIndex('content_entries_source_unique').on(table.sourceKey)
}))

export const versions = pgTable('content_versions', {
  id: uuid('id').primaryKey().defaultRandom(),
  entryId: uuid('entry_id').notNull().references(() => entries.id, { onDelete: 'cascade' }),
  number: integer('number').notNull(),
  snapshot: jsonb('snapshot').$type<Record<string, unknown>>().notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
}, table => ({ revision: uniqueIndex('content_versions_revision_unique').on(table.entryId, table.number) }))

export const media = pgTable('media', {
  id: uuid('id').primaryKey().defaultRandom(),
  objectKey: text('object_key').notNull().unique(),
  name: text('name').notNull(),
  mime: text('mime').notNull(),
  bytes: integer('bytes').notNull(),
  alt: text('alt').notNull().default(''),
  caption: text('caption').notNull().default(''),
  originalId: uuid('original_id'),
  width: integer('width'),
  height: integer('height'),
  published: timestamp('published_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
})

export const mediaLinks = pgTable('content_media', {
  entryId: uuid('entry_id').notNull().references(() => entries.id, { onDelete: 'cascade' }),
  mediaId: uuid('media_id').notNull().references(() => media.id, { onDelete: 'restrict' })
}, table => ({ pk: primaryKey({ columns: [table.entryId, table.mediaId] }) }))

export const sessions = pgTable('admin_sessions', {
  tokenHash: text('token_hash').primaryKey(),
  csrfHash: text('csrf_hash').notNull(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  revokedAt: timestamp('revoked_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
})

export const usedTotp = pgTable('used_totp_steps', {
  step: bigint('step', { mode: 'number' }).primaryKey(),
  usedAt: timestamp('used_at', { withTimezone: true }).notNull().defaultNow()
})

export const adminSecurity = pgTable('admin_security', {
  id: integer('id').primaryKey(),
  totpSecret: text('totp_secret'),
  enabledAt: timestamp('enabled_at', { withTimezone: true }),
  pendingSecret: text('pending_secret'),
  pendingExpiresAt: timestamp('pending_expires_at', { withTimezone: true }),
  pendingSessionHash: text('pending_session_hash'),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
})

export const loginAttempts = pgTable('admin_login_attempts', {
  key: text('key').primaryKey(),
  attempts: integer('attempts').notNull().default(0),
  blockedUntil: timestamp('blocked_until', { withTimezone: true }),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
})

export type ContentEntry = typeof entries.$inferSelect
export type ContentInput = typeof entries.$inferInsert
