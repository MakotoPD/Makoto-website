import { describe, expect, it } from 'vitest'
import { reactive } from 'vue'
import { copyEntry, emptyEntry, groupEntries, entrySlug } from '../shared/panel'
import sharp from 'sharp'
import { imageVariant } from '../server/utils/imageVariants'

describe('multilingual editor', () => {
  it('opens Vue reactive records and keeps an independent editable document', () => {
    const original = reactive(emptyEntry('article', 'pl', 'pair'))
    original.body.content = [{ type: 'paragraph', content: [{ type: 'text', text: 'Original' }] }]
    const edited = copyEntry(original)
    edited.body.content![0]!.content![0]!.text = 'Edited'
    expect(original.body.content[0]!.content![0]!.text).toBe('Original')
  })
  it('combines languages without combining different content kinds or losing missing translations', () => {
    const pl = { ...emptyEntry('article', 'pl', 'pair'), id: 'pl' }
    const en = { ...emptyEntry('article', 'en', 'pair'), id: 'en' }
    const page = { ...emptyEntry('page', 'pl', 'pair'), id: 'page' }
    const onlyEn = { ...emptyEntry('article', 'en', 'second'), id: 'en2' }
    const removed = { ...emptyEntry('article', 'pl', 'second'), id: 'deleted', status: 'deleted' }
    const groups = groupEntries([en, pl, page, onlyEn, removed])
    expect(groups).toHaveLength(3)
    expect(groups[0]!.translations).toEqual({ pl, en })
    expect(groups[0]!.entry.id).toBe('pl')
    expect(groups[2]!.entry.id).toBe('en2')
    expect(entrySlug('Żółć — Nowy wpis!')).toBe('zolc-nowy-wpis')
  })
})

describe('automatic media sizes', () => {
  it('preserves proportions, uses bounded presets and reuses generated images', async () => {
    const source = await sharp({ create: { width: 2400, height: 1200, channels: 4, background: '#38bdf880' } }).png().toBuffer()
    let reads = 0
    const load = async () => { reads++; return source }
    for (const [size, width] of [['small', 500], ['medium', 1000], ['big', 1800]] as const) {
      const result = await imageVariant('landscape', size, load)
      const info = await sharp(result).metadata()
      expect([info.width, info.height, info.format, info.hasAlpha]).toEqual([width, width / 2, 'webp', true])
      expect(await imageVariant('landscape', size, load)).toBe(result)
    }
    expect(reads).toBe(3)
  })
  it('does not enlarge small images and coalesces simultaneous requests', async () => {
    const source = await sharp({ create: { width: 80, height: 160, channels: 3, background: '#ffffff' } }).jpeg().toBuffer()
    let reads = 0
    const load = async () => { reads++; return source }
    const results = await Promise.all([imageVariant('portrait', 'big', load), imageVariant('portrait', 'big', load)])
    expect(reads).toBe(1)
    expect(results[0]).toBe(results[1])
    const info = await sharp(results[0]).metadata()
    expect([info.width, info.height]).toEqual([80, 160])
  })
})
