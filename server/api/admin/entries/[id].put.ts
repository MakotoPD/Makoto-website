import { requireSession } from '../../../utils/auth'
import { parseEntry, updateEntry, entryWriteError } from '../../../utils/editor'

export default defineEventHandler(async event => {
  await requireSession(event, true)
  return updateEntry(getRouterParam(event, 'id') || '', parseEntry(await readBody(event))).catch(entryWriteError)
})
