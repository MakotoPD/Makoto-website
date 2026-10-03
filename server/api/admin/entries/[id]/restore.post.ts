import { z } from 'zod'
import { requireSession } from '../../../../utils/auth'
import { restoreVersion } from '../../../../utils/editor'
import { parseInput } from '../../../../utils/validation'

export default defineEventHandler(async event => {
  await requireSession(event, true)
  const { number } = parseInput(z.object({ number: z.number().int().positive() }), await readBody(event))
  return restoreVersion(getRouterParam(event, 'id') || '', number)
})
