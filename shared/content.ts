export const contentKinds = ['article', 'category', 'author', 'project', 'service', 'location', 'page', 'home', 'portfolio', 'work'] as const
export type ContentKind = typeof contentKinds[number]
export type Locale = 'pl' | 'en'

export interface RichNode {
  type: string
  text?: string
  attrs?: Record<string, unknown>
  marks?: { type: string; attrs?: Record<string, unknown> }[]
  content?: RichNode[]
}

export interface PublicEntry {
  id: string
  kind: ContentKind
  locale: Locale
  slug: string
  translationGroup: string
  title: string
  summary: string
  body: RichNode
  sections: Record<string, unknown>[]
  data: Record<string, unknown>
  seoTitle: string | null
  seoDescription: string | null
  coverMediaId: string | null
  publishedAt: string | null
  updatedAt: string
  translations?: { locale: Locale; slug: string }[]
}

export function contentPath(entry: Pick<PublicEntry, 'kind' | 'locale' | 'slug'>) {
  const prefix = entry.locale === 'pl' ? '/pl' : ''
  if (entry.kind === 'home') return prefix || '/'
  if (entry.kind === 'article') return `${prefix}/blog/${entry.slug}`
  if (entry.kind === 'project') return `${prefix}/work/${entry.slug}`
  return `${prefix}/${entry.slug}`
}

export function safeHref(value: unknown) {
  if (typeof value !== 'string' || value.length > 2048) return ''
  if (value.startsWith('/') && !value.startsWith('//')) return value
  try {
    const url = new URL(value)
    return ['https:', 'http:', 'mailto:'].includes(url.protocol) ? value : ''
  } catch {
    return ''
  }
}

export const alertTypes = ['note', 'success', 'info', 'tip', 'important', 'warning', 'caution'] as const
const allowedNodes = new Set(['doc', 'paragraph', 'heading', 'text', 'bulletList', 'orderedList', 'listItem', 'blockquote', 'codeBlock', 'hardBreak', 'horizontalRule', 'image', 'file', 'callout', 'taskList', 'taskItem', 'table', 'tableRow', 'tableHeader', 'tableCell'])
const allowedMarks = new Set(['bold', 'italic', 'strike', 'code', 'link', 'highlight', 'kbd', 'subscript', 'superscript', 'underline'])

export function validateRichDocument(value: unknown): asserts value is RichNode {
  let count = 0
  function walk(node: unknown, depth: number) {
    if (!node || typeof node !== 'object' || Array.isArray(node) || depth > 24 || ++count > 5000) throw new Error('Invalid document structure')
    const item = node as RichNode
    if (!allowedNodes.has(item.type)) throw new Error('Unsupported document node')
    if (item.type === 'text' && (typeof item.text !== 'string' || item.text.length > 100_000)) throw new Error('Invalid text')
    if (item.type === 'heading' && ![2, 3, 4, 5, 6].includes(Number(item.attrs?.level))) throw new Error('Headings must use H2-H6')
    if (item.type === 'callout' && !alertTypes.includes(item.attrs?.kind as typeof alertTypes[number])) throw new Error('Invalid callout kind')
    if (item.type === 'taskItem' && typeof item.attrs?.checked !== 'boolean') throw new Error('Invalid task state')
    if (item.type === 'orderedList' && item.attrs?.start != null && (!Number.isInteger(item.attrs.start) || Number(item.attrs.start) < 1)) throw new Error('Invalid list start')
    if (item.type === 'tableCell' || item.type === 'tableHeader') {
      if (item.attrs?.textAlign != null && !['left', 'center', 'right'].includes(String(item.attrs.textAlign))) throw new Error('Invalid table alignment')
      for (const span of ['colspan', 'rowspan']) if (item.attrs?.[span] != null && (!Number.isInteger(item.attrs[span]) || Number(item.attrs[span]) < 1 || Number(item.attrs[span]) > 50)) throw new Error('Invalid cell span')
    }
    if (item.type === 'image' || item.type === 'file') {
      if (!safeHref(item.attrs?.src)) throw new Error('Invalid media URL')
      if (item.type === 'image' && (typeof item.attrs?.alt !== 'string' || !item.attrs.alt.trim())) throw new Error('Image alt text is required')
    }
    if (item.marks) {
      if (!Array.isArray(item.marks)) throw new Error('Invalid marks')
      for (const mark of item.marks) {
        if (!allowedMarks.has(mark.type)) throw new Error('Unsupported mark')
        if (mark.type === 'link' && !safeHref(mark.attrs?.href)) throw new Error('Invalid link URL')
      }
    }
    if (item.content) {
      if (!Array.isArray(item.content)) throw new Error('Invalid content')
      for (const child of item.content) walk(child, depth + 1)
    }
  }
  walk(value, 0)
  if ((value as RichNode).type !== 'doc') throw new Error('Document root is required')
}
