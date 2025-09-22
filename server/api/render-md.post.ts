import { defineEventHandler, readBody } from 'h3'
import { renderMarkdownServer } from '../utils/markdown'

export default defineEventHandler(async (event) => {
  const payload = await readBody<{ body?: string }>(event)
  const body = payload?.body || ''
  const html = await renderMarkdownServer(body)

  // Basic cache headers for same-process revalidation; actual HTML is cached in-memory
  event.node.res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=60')

  return { html }
})
