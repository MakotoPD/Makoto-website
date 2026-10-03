import { z } from 'zod'
import { requireSession } from '../../../../utils/auth'
import { setEntryStatus } from '../../../../utils/editor'
import { parseInput } from '../../../../utils/validation'

export default defineEventHandler(async event => {
  await requireSession(event, true)
  const { status } = parseInput(z.object({ status: z.enum(['draft', 'published']) }), await readBody(event))
  return setEntryStatus(getRouterParam(event, 'id') || '', status)
})
