import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { createSSRApp, h } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { getSchema } from '@tiptap/core'
import { markdownToDocument } from '../shared/markdown'
import { alertTypes, validateRichDocument, type RichNode } from '../shared/content'
import { renderRichNode } from '../app/utils/richDocument'
import { richEditorExtensions } from '../app/utils/editorExtensions'

const source = readFileSync(new URL('./fixtures/markdown-rendering.md', import.meta.url), 'utf8')
const render = (doc: RichNode) => renderToString(createSSRApp({ render: () => h('div', [renderRichNode(doc)]) }))
const flat = (node: RichNode): RichNode[] => [node, ...(node.content || []).flatMap(flat)]
describe('Markdown import, editor and public rendering', () => {
  it('preserves the complete formatting example through an editor JSON round-trip', async () => {
    const doc = markdownToDocument(source)
    validateRichDocument(doc)
    const schema = getSchema(richEditorExtensions())
    const editorDoc = schema.nodeFromJSON(doc)
    editorDoc.check()
    const saved = editorDoc.toJSON() as RichNode
    validateRichDocument(saved)
    const nodes = flat(saved)
    expect(nodes.filter(node => node.type === 'callout').map(node => node.attrs?.kind)).toEqual(alertTypes)
    expect(nodes.filter(node => node.type === 'taskItem').map(node => node.attrs?.checked)).toEqual([true, false, true])
    expect(nodes.filter(node => node.type === 'heading').map(node => node.attrs?.level)).toEqual(expect.arrayContaining([2, 3, 4, 5, 6]))
    const html = await render(saved)
    for (const tag of ['strong', 'em', 's', 'kbd', 'mark', 'sub', 'sup', 'table', 'thead', 'tbody', 'hr', 'h5', 'h6']) expect(html).toContain(`<${tag}`)
    expect(html).toContain('title="Link title"')
    expect(html).toContain('text-align:center')
    expect(html).toContain('text-align:right')
    expect(html).toContain('href="mailto:email@example.com"')
    expect(html).toContain('hljs-keyword')
    expect(html).toContain('© copyright')
    expect(html).toContain('* asterisks *')
    expect(html).toContain('😀 ❤️ 🚀 🇺🇸')
    expect(html).not.toContain('[!NOTE]')
    expect(nodes.filter(node => node.type === 'bulletList').length).toBeGreaterThanOrEqual(3)
    expect(nodes.filter(node => node.type === 'orderedList').length).toBeGreaterThanOrEqual(2)
  })
  it('preserves multi-paragraph alerts, mixed tasks, list starts and unknown code languages', async () => {
    const doc = markdownToDocument('> [!TIP]\n> **Read** this.\n>\n> - One\n> - Two\n\n- [x] Done\n- Ordinary\n\n4. Four\n5. Five\n\n```unlisted-language\n<tag>\n```')
    getSchema(richEditorExtensions()).nodeFromJSON(doc).check()
    const html = await render(doc)
    expect(html).toContain('<strong>Read</strong>')
    expect(html).toContain('start="4"')
    expect(html).toContain('Ordinary')
    expect(html).toContain('&lt;tag&gt;')
  })
  it('renders unsupported HTML as text and never executes attributes or active URLs', async () => {
    const html = await render(markdownToDocument('<script>alert(1)</script>\n\n<mark onclick="alert(1)">Text</mark>\n\n[bad](javascript:alert(1))\n\n<img src=x onerror=alert(1)>'))
    expect(html).not.toMatch(/<script|<img|<mark onclick|href="javascript:/)
    expect(html).toContain('&lt;script&gt;')
    expect(() => validateRichDocument({ type: 'doc', content: [{ type: 'callout', attrs: { kind: 'evil' } }] })).toThrow()
  })
})
