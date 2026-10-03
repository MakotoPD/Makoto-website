import { z } from 'zod'
import { parseInput } from '../utils/validation'

const input = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.email().max(254),
  message: z.string().trim().min(12).max(5000),
  token: z.string().min(10).max(4000),
  website: z.string().max(200).default('')
})

export default defineEventHandler(async event => {
  const body = parseInput(input, await readBody(event))
  if (body.website) return { ok: true }
  const turnstileSecret = process.env.TURNSTILE_SECRET_KEY
  const web3formsKey = process.env.WEB3FORMS_KEY
  if (!turnstileSecret || !web3formsKey) throw createError({ statusCode: 503, statusMessage: 'Contact form is not configured' })
  const verification = await $fetch<{ success: boolean; hostname?: string }>('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    body: new URLSearchParams({
      secret: turnstileSecret,
      response: body.token,
      remoteip: getRequestIP(event) || ''
    })
  })
  const allowedHost = new URL(process.env.SITE_URL || 'https://makoto.com.pl').hostname
  if (!verification.success || (process.env.NODE_ENV === 'production' && verification.hostname !== allowedHost)) {
    throw createError({ statusCode: 422, statusMessage: 'Verification failed' })
  }
  const response = await $fetch<{ success?: boolean }>('https://api.web3forms.com/submit', {
    method: 'POST',
    body: {
      access_key: web3formsKey,
      subject: 'Nowa wiadomość ze strony Makoto',
      name: body.name,
      email: body.email,
      message: body.message
    }
  })
  if (!response.success) throw createError({ statusCode: 502, statusMessage: 'Message could not be sent' })
  return { ok: true }
})
