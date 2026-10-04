import { z } from 'zod'
import { parseInput } from '../utils/validation'

const input = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.email().max(254),
  message: z.string().trim().min(12).max(5000),
  token: z.string().min(10).max(2048),
  website: z.string().max(200).default('')
})

export default defineEventHandler(async event => {
  setHeader(event, 'Cache-Control', 'private, no-store')
  const body = parseInput(input, await readBody(event))
  if (body.website) return { ok: true }
  const turnstileSecret = process.env.TURNSTILE_SECRET_KEY
  const web3formsKey = process.env.WEB3FORMS_KEY
  if (!turnstileSecret || !web3formsKey) throw createError({ statusCode: 503, statusMessage: 'Contact form is not configured' })
  let verification: { success: boolean; hostname?: string }
  try {
    verification = await $fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST', retry: 0, timeout: 10_000,
      body: new URLSearchParams({
        secret: turnstileSecret,
        response: body.token,
        remoteip: getRequestIP(event) || ''
      })
    })
  } catch {
    throw createError({ statusCode: 503, statusMessage: 'Verification temporarily unavailable' })
  }
  const allowedHost = new URL(process.env.SITE_URL || 'https://makoto.com.pl').hostname
  if (!verification.success || (process.env.NODE_ENV === 'production' && verification.hostname !== allowedHost)) {
    throw createError({ statusCode: 422, statusMessage: 'Verification failed' })
  }
  // Web3Forms requires browser submissions unless the server IP is approved on a paid plan.
  // Its access key is public; Cloudflare's secret and token validation stay on the server.
  return {
    ok: true,
    submission: {
      access_key: web3formsKey,
      subject: 'Nowa wiadomość ze strony Makoto',
      name: body.name,
      email: body.email,
      message: body.message,
      botcheck: false
    }
  }
})
