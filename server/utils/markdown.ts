import MarkdownIt from 'markdown-it'
import shiki from '@shikijs/markdown-it'
import { bundledLanguages } from 'shiki'
import { createHash } from 'node:crypto'
import taskLists from 'markdown-it-task-lists'
import type StateBlock from 'markdown-it/lib/rules_block/state_block.mjs'

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

// Plugin do obsługi GitHub-style alerts
function markdownItAlerts(md: MarkdownIt) {
  const alertTypes = {
    'NOTE': { icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><!-- Icon from Solar by 480 Design - https://creativecommons.org/licenses/by/4.0/ --><g fill="none" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" d="M22 10.5V12c0 4.714 0 7.071-1.465 8.535C19.072 22 16.714 22 12 22s-7.071 0-8.536-1.465C2 19.072 2 16.714 2 12s0-7.071 1.464-8.536C4.93 2 7.286 2 12 2h1.5" opacity=".5"/><circle cx="19" cy="5" r="3"/><path stroke-linecap="round" d="M7 14h9m-9 3.5h6"/></g></svg>', class: 'alert-note' },
    'INFO': { icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><!-- Icon from Solar by 480 Design - https://creativecommons.org/licenses/by/4.0/ --><g fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.5" opacity=".5"/><path stroke="currentColor" stroke-linecap="round" stroke-width="1.5" d="M12 17v-6"/><circle cx="1" cy="1" r="1" fill="currentColor" transform="matrix(1 0 0 -1 11 9)"/></g></svg>', class: 'alert-info' },
    'SUCCESS': { icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><!-- Icon from Solar by 480 Design - https://creativecommons.org/licenses/by/4.0/ --><g fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10" opacity=".5"/><path stroke-linecap="round" stroke-linejoin="round" d="m8.5 12.5l2 2l5-5"/></g></svg>', class: 'alert-success' },
    'TIP': { icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><!-- Icon from Solar by 480 Design - https://creativecommons.org/licenses/by/4.0/ --><g fill="none" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" d="M10 19.5h4M10.667 22h2.666" opacity=".5"/><path d="m7.41 13.68l1.105 1.04c.31.291.485.698.485 1.123C9 16.482 9.518 17 10.157 17h3.686c.639 0 1.157-.518 1.157-1.157c0-.425.176-.832.485-1.123l1.104-1.04c1.542-1.461 2.402-3.382 2.41-5.378L19 8.218C19 4.807 15.866 2 12 2S5 4.807 5 8.218v.084c.009 1.996.87 3.917 2.41 5.379Z"/></g></svg>', class: 'alert-tip' },
    'IMPORTANT': { icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><!-- Icon from Solar by 480 Design - https://creativecommons.org/licenses/by/4.0/ --><g fill="none"><path stroke="currentColor" stroke-width="1.5" d="M3 10.417c0-3.198 0-4.797.378-5.335c.377-.537 1.88-1.052 4.887-2.081l.573-.196C10.405 2.268 11.188 2 12 2s1.595.268 3.162.805l.573.196c3.007 1.029 4.51 1.544 4.887 2.081C21 5.62 21 7.22 21 10.417v1.574c0 5.638-4.239 8.375-6.899 9.536C13.38 21.842 13.02 22 12 22s-1.38-.158-2.101-.473C7.239 20.365 3 17.63 3 11.991z" opacity=".5"/><path stroke="currentColor" stroke-linecap="round" stroke-width="1.5" d="M12 8v4"/><circle cx="12" cy="15" r="1" fill="currentColor"/></g></svg>', class: 'alert-important' },
    'WARNING': { icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><!-- Icon from Solar by 480 Design - https://creativecommons.org/licenses/by/4.0/ --><g fill="none"><path stroke="currentColor" stroke-width="1.5" d="M5.312 10.762C8.23 5.587 9.689 3 12 3s3.77 2.587 6.688 7.762l.364.644c2.425 4.3 3.638 6.45 2.542 8.022S17.786 21 12.364 21h-.728c-5.422 0-8.134 0-9.23-1.572s.117-3.722 2.542-8.022z" opacity=".5"/><path stroke="currentColor" stroke-linecap="round" stroke-width="1.5" d="M12 8v5"/><circle cx="12" cy="16" r="1" fill="currentColor"/></g></svg>', class: 'alert-warning' },
    'CAUTION': { icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><!-- Icon from Solar by 480 Design - https://creativecommons.org/licenses/by/4.0/ --><g fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20 22v-6c0-2.8 0-4.2-.545-5.27a5 5 0 0 0-2.185-2.185C16.2 8 14.8 8 12 8s-4.2 0-5.27.545a5 5 0 0 0-2.185 2.185C4 11.8 4 13.2 4 16v6" opacity=".5"/><path stroke-linecap="round" d="M15 10.815c1.23 0 2.23.955 2.185 2.185M2 22h20M12 2v3m9 0l-1.5 1.5M3 5l1.5 1.5"/><path d="M13.5 17.5a1.5 1.5 0 1 1-3 0a1.5 1.5 0 0 1 3 0Z"/><path stroke-linecap="round" d="M12 19v3" opacity=".5"/></g></svg>', class: 'alert-caution' },
  }

  md.block.ruler.before('blockquote', 'alert', (state: StateBlock, startLine: number, endLine: number, silent: boolean) => {
    const start = state.bMarks[startLine] + state.tShift[startLine]
    const max = state.eMarks[startLine]

    // Sprawdź czy linia zaczyna się od '>'
    if (state.src.charCodeAt(start) !== 0x3E /* > */) {
      return false
    }

    // Pobierz zawartość po '>'
    let pos = start + 1
    while (pos < max && (state.src.charCodeAt(pos) === 0x20 || state.src.charCodeAt(pos) === 0x09)) {
      pos++
    }

    const firstLineContent = state.src.slice(pos, max).trim()
    
    // Sprawdź czy to alert (format: [!TYPE])
    const alertMatch = firstLineContent.match(/^\[!(\w+)\]$/i)
    if (!alertMatch) {
      return false
    }

    const alertType = alertMatch[1].toUpperCase()
    if (!alertTypes[alertType as keyof typeof alertTypes]) {
      return false
    }

    if (silent) {
      return true
    }

    // Znajdź koniec bloku cytatu - kończy się gdy napotka:
    // 1. Pustą linię
    // 2. Linię nie zaczynającą się od '>'
    // 3. Kolejny alert [!TYPE]
    let nextLine = startLine + 1
    let lastLineInQuote = startLine

    while (nextLine < endLine) {
      const lineStart = state.bMarks[nextLine] + state.tShift[nextLine]
      const lineMax = state.eMarks[nextLine]
      
      // Pusta linia - koniec alertu
      if (lineStart >= lineMax) {
        break
      }

      // Linia nie zaczyna się od '>' - koniec alertu
      if (state.src.charCodeAt(lineStart) !== 0x3E /* > */) {
        break
      }

      // Sprawdź czy to początek kolejnego alertu
      let checkPos = lineStart + 1
      while (checkPos < lineMax && (state.src.charCodeAt(checkPos) === 0x20 || state.src.charCodeAt(checkPos) === 0x09)) {
        checkPos++
      }
      const lineContent = state.src.slice(checkPos, lineMax).trim()
      if (lineContent.match(/^\[!\w+\]$/i)) {
        // To jest początek kolejnego alertu - zakończ obecny
        break
      }

      lastLineInQuote = nextLine
      nextLine++
    }

    // Pobierz zawartość alertu (pomijając pierwszą linię z [!TYPE])
    const lines: string[] = []
    for (let i = startLine + 1; i <= lastLineInQuote; i++) {
      const lineStart = state.bMarks[i] + state.tShift[i]
      const lineMax = state.eMarks[i]
      let lineContent = state.src.slice(lineStart, lineMax)
      
      // Usuń '>' z początku linii
      if (lineContent.startsWith('>')) {
        lineContent = lineContent.slice(1).trimStart()
      }
      
      lines.push(lineContent)
    }

    const content = lines.join('\n').trim()

    // Renderuj inline markdown w zawartości
    const alertConfig = alertTypes[alertType as keyof typeof alertTypes]
    
    const token_open = state.push('html_block', '', 0)
    token_open.content = `<div class="alert ${alertConfig.class}"><div class="alert-title"><span class="alert-icon text-white"> ${alertConfig.icon} </span></div>`

    if (content) {
      const token_content_open = state.push('alert_content_open', 'div', 1)
      token_content_open.attrSet('class', 'alert-content')

      // Parsuj zawartość jako markdown
      const token_inline = state.push('inline', '', 0)
      token_inline.content = content
      token_inline.children = []

      const token_content_close = state.push('html_block', '', 0)
      token_content_close.content = `</div></div>`
    } else {
      const token_close = state.push('html_block', '', 0)
      token_close.content = `</div>`
    }

    state.line = lastLineInQuote + 1
    return true
  })
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

      // Enable GitHub-style task lists: "- [ ]" and "- [x]"
      instance.use(taskLists, {
        label: true,
        labelAfter: true,
      })

      // Dodaj plugin dla alertów
      instance.use(markdownItAlerts)

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