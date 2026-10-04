import { entryMarkdown } from '../utils/ai-content'
import { entryPath, publishedSeoEntries } from '../utils/seo-content'

export default defineNitroPlugin(nitro => {
  nitro.hooks.hook('ai-ready:markdown:source', async context => {
    const path = context.route.replace(/\/+$/, '') || '/'
    if (/^\/(?:pl\/)?(?:panel|admin|preview|__preview|api|__ai-ready)(?:\/|$)/.test(path)) {
      throw createError({ statusCode: 404, statusMessage: 'Not found' })
    }
    const rows = await publishedSeoEntries()
    const row = rows.find(item => entryPath(item) === path)
    if (!row) return
    context.source = {
      title: row.title, description: row.summary,
      markdown: entryMarkdown(row), updatedAt: row.updatedAt.toISOString()
    }
  })
})
