import { requireSession } from '../../../utils/auth'
import { createEntry, parseEntry, entryWriteError } from '../../../utils/editor'

export default defineEventHandler(async event => {
  await requireSession(event, true)
  const entry = await createEntry(parseEntry(await readBody(event))).catch(entryWriteError)
  setResponseStatus(event, 201)
  return entry
})
