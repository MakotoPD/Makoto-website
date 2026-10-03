import pg from 'pg'
import { drizzle } from 'drizzle-orm/node-postgres'
import * as schema from './schema'

let pool: pg.Pool | undefined

export function database() {
  const url = process.env.DATABASE_URL
  if (!url) throw createError({ statusCode: 503, statusMessage: 'Content storage is not configured' })
  if (!pool) pool = new pg.Pool({ connectionString: url, max: 10, idleTimeoutMillis: 30_000 })
  return drizzle(pool, { schema })
}
