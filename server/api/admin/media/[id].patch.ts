import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { database } from '../../../db/client'
import { media } from '../../../db/schema'
import { requireSession } from '../../../utils/auth'
import { parseInput } from '../../../utils/validation'

export default defineEventHandler(async event => {
  await requireSession(event, true)
  const input = parseInput(z.object({ alt: z.string().max(500), caption: z.string().max(1000) }), await readBody(event))
  const [row] = await database().update(media).set(input).where(eq(media.id, getRouterParam(event, 'id') || '')).returning()
  if (!row) throw createError({ statusCode: 404 })
  return row
})
