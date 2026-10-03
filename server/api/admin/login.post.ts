import { z } from 'zod'
import { signIn } from '../../utils/auth'

const credentials = z.object({
  login: z.string().trim().min(1).max(100),
  password: z.string().min(1).max(1024),
  code: z.string().trim().regex(/^(\d{6})?$/).default(''),
  token: z.string().max(2048).default('')
})

export default defineEventHandler(async event => {
  const parsed = credentials.safeParse(await readBody(event))
  if (!parsed.success) throw createError({ statusCode: 401, statusMessage: 'Nieprawidłowe dane logowania' })
  setHeader(event, 'Cache-Control', 'no-store')
  return signIn(event, parsed.data.login, parsed.data.password, parsed.data.code, parsed.data.token)
})
