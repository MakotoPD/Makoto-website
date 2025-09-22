import MarkdownIt from 'markdown-it'
import shiki from '@shikijs/markdown-it'
import { bundledLanguages } from 'shiki'
import { createHash } from 'node:crypto'

// Singleton MarkdownIt instance with Shiki, initialized once per server process
let md: MarkdownIt | null = null
let initPromise: Promise<void> | null = null

// Very small in-memory cache to avoid repeated rendering of identical content
// Keyed by sha1(body)
const MAX_CACHE_ENTRIES = 200
const cache = new Map<string, string>()

function lruSet(key: string, value: string) {
  if (cache.has(key)) cache.delete(key)
  cache.set(key, value)
  if (cache.size > MAX_CACHE_ENTRIES) {
    // delete oldest
    const firstKey = cache.keys().next().value as string | undefined
    if (firstKey) cache.delete(firstKey)
  }
}

function sha1(input: string): string {
  return createHash('sha1').update(input).digest('hex')
}

async function ensureMarkdown(): Promise<MarkdownIt> {
  if (md) return md
  if (!initPromise) {
    initPromise = (async () => {
      const instance = new MarkdownIt({
        html: true,
        linkify: true,
        typographer: true,
      })

      // Load a curated set of languages using bundled language objects to satisfy types
      const langs = [
        bundledLanguages.javascript,
        bundledLanguages.typescript,
        bundledLanguages.json,
        bundledLanguages.bash,
        bundledLanguages.shell,
        bundledLanguages.html,
        bundledLanguages.css,
        bundledLanguages.scss,
        bundledLanguages.vue,
        bundledLanguages.markdown,
        bundledLanguages.yaml,
        bundledLanguages.toml,
        bundledLanguages.ini,
        bundledLanguages.sql,
        bundledLanguages.python,
        bundledLanguages.go,
      ].filter(Boolean)

      instance.use(await shiki({
        theme: 'tokyo-night',
        langs,
      }))

      md = instance
    })()
  }
  await initPromise
  if (!md) {
    throw new Error('Markdown renderer failed to initialize')
  }
  return md
}

export async function renderMarkdownServer(body: string): Promise<string> {
  if (!body) return ''
  const key = sha1(body)
  const cached = cache.get(key)
  if (cached) return cached

  const m = await ensureMarkdown()
  const html = m.render(body)
  lruSet(key, html)
  return html
}
