import { requireSession } from '../../../utils/auth'
import { setEntryStatus } from '../../../utils/editor'

export default defineEventHandler(async event => {
  await requireSession(event, true)
  if ((await readBody(event))?.confirm !== 'DELETE') throw createError({ statusCode: 422, statusMessage: 'Confirmation required' })
  await setEntryStatus(getRouterParam(event, 'id') || '', 'deleted')
  return { ok: true }
})
