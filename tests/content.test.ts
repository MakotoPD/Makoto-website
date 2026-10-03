import { describe, expect, it } from 'vitest'
import { contentPath, safeHref, validateRichDocument } from '../shared/content'
import { detectedMime } from '../server/utils/r2'

describe('public content paths', () => {
  it('keeps locale prefixes and translated slugs', () => {
    expect(contentPath({ kind: 'home', locale: 'en', slug: 'home' })).toBe('/')
    expect(contentPath({ kind: 'home', locale: 'pl', slug: 'home' })).toBe('/pl')
    expect(contentPath({ kind: 'article', locale: 'pl', slug: 'polski-tytul' })).toBe('/pl/blog/polski-tytul')
    expect(contentPath({ kind: 'location', locale: 'pl', slug: 'strony-internetowe/torun' })).toBe('/pl/strony-internetowe/torun')
  })
})

describe('editor document safety', () => {
  it('rejects active URLs and extra H1 headings', () => {
    expect(safeHref('javascript:alert(1)')).toBe('')
    expect(safeHref('//evil.example/path')).toBe('')
    expect(safeHref('/api/media/file')).toBe('/api/media/file')
    expect(() => validateRichDocument({ type: 'doc', content: [{ type: 'heading', attrs: { level: 1 }, content: [] }] })).toThrow()
    expect(() => validateRichDocument({ type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'x', marks: [{ type: 'link', attrs: { href: 'data:text/html,<script>' } }] }] }] })).toThrow()
  })

  it('accepts an accessible image and ordinary rich text', () => {
    expect(() => validateRichDocument({ type: 'doc', content: [
      { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Section' }] },
      { type: 'image', attrs: { src: '/api/media/00000000-0000-0000-0000-000000000001', alt: 'Preview' } }
    ] })).not.toThrow()
    expect(() => validateRichDocument({ type: 'doc', content: [{ type: 'image', attrs: { src: '/media/photo', alt: '' } }] })).toThrow()
  })
})

describe('upload format checks', () => {
  it('recognizes permitted signatures and rejects disguised input', () => {
    expect(detectedMime(Buffer.from('255044462d312e370a000000', 'hex'))).toBe('application/pdf')
    expect(detectedMime(Buffer.from('89504e470d0a1a0a00000000', 'hex'))).toBe('image/png')
    expect(detectedMime(Buffer.from('<svg onload="alert(1)"/>'))).toBeNull()
  })
})
