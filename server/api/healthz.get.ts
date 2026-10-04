import { sql } from 'drizzle-orm'
import { database } from '../db/client'

export default defineEventHandler(async event => {
  setHeader(event, 'Cache-Control', 'no-store')
  try {
    await database().execute(sql`SELECT 1 FROM content_entries LIMIT 1`)
    return { status: 'ok' }
  } catch {
    throw createError({ statusCode: 503, statusMessage: 'Service unavailable' })
  }
})
