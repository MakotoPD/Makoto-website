import { z } from 'zod'
import { signIn } from '../../utils/auth'

const credentials = z.object({
  login: z.string().min(1).max(100),
  password: z.string().min(1).max(1024),
  code: z.string().regex(/^\d{6}$/)
})

export default defineEventHandler(async event => {
  const parsed = credentials.safeParse(await readBody(event))
  if (!parsed.success) throw createError({ statusCode: 401, statusMessage: 'Nieprawidłowe dane logowania' })
  return signIn(event, parsed.data.login, parsed.data.password, parsed.data.code)
})
