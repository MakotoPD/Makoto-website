import MarkdownIt from 'markdown-it'
import { alertTypes, safeHref, type RichNode } from './content.ts'

// HTML is tokenized, never injected. Only these four inline tags become marks.
const markdown = new MarkdownIt({ html: true, linkify: true })
const htmlMarks: Record<string, string> = { mark: 'highlight', kbd: 'kbd', sub: 'subscript', sup: 'superscript' }
type Token = ReturnType<typeof markdown.parse>[number]

export function markdownToDocument(source: string, mediaUrl: (url: string) => string = value => value): RichNode {
  function inline(tokens: Token[]): RichNode[] {
    const nodes: RichNode[] = []
    const marks: NonNullable<RichNode['marks']> = []
    const text = (value: string, extra: NonNullable<RichNode['marks']> = []) => {
      if (value) nodes.push({ type: 'text', text: value, ...((marks.length || extra.length) ? { marks: [...marks, ...extra].map(mark => ({ ...mark })) } : {}) })
    }
    const removeMark = (type: string) => {
      const index = marks.map(mark => mark.type).lastIndexOf(type)
      if (index >= 0) marks.splice(index, 1)
    }
    for (const token of tokens) {
      const type = ({ strong: 'bold', em: 'italic', s: 'strike', link: 'link' } as Record<string, string>)[token.type.replace(/_(open|close)$/, '')]
      if (type && token.nesting === 1) {
        marks.push({ type, ...(type === 'link' ? { attrs: { href: safeHref(token.attrGet('href')), title: token.attrGet('title') } } : {}) })
      } else if (type && token.nesting === -1) removeMark(type)
      else if (token.type === 'text') text(token.content)
      else if (token.type === 'code_inline') text(token.content, [{ type: 'code' }])
      else if (token.type === 'softbreak' || token.type === 'hardbreak') nodes.push({ type: 'hardBreak' })
      else if (token.type === 'image') {
        const src = safeHref(mediaUrl(String(token.attrGet('src') || '')))
        if (src) nodes.push({ type: 'image', attrs: { src, alt: token.content || 'Obraz', title: token.attrGet('title') } })
      } else if (token.type === 'html_inline') {
        const tag = token.content.match(/^<(\/?)(mark|kbd|sub|sup)\s*>$/i)
        if (tag) {
          const type = htmlMarks[tag[2]!.toLowerCase()]!
          if (tag[1]) removeMark(type)
          else marks.push({ type })
        } else if (/^<br\s*\/?\s*>$/i.test(token.content)) nodes.push({ type: 'hardBreak' })
        else text(token.content)
      }
    }
    return nodes
  }
  const root: RichNode = { type: 'doc', content: [] }
  const stack = [root]
  const blockTypes: Record<string, string> = {
    paragraph: 'paragraph', heading: 'heading', bullet_list: 'bulletList', ordered_list: 'orderedList',
    list_item: 'listItem', blockquote: 'blockquote', table: 'table', tr: 'tableRow', th: 'tableHeader', td: 'tableCell'
  }
  for (const token of markdown.parse(source || '', {})) {
    if (/^(thead|tbody)_(open|close)$/.test(token.type)) continue
    const parent = stack.at(-1)!
    if (token.type === 'inline') parent.content!.push(...inline(token.children || []))
    else if (token.type.endsWith('_open')) {
      const type = blockTypes[token.type.slice(0, -5)]
      if (!type) continue
      const node: RichNode = { type, content: [] }
      if (type === 'heading') node.attrs = { level: Math.max(2, Number(token.tag.slice(1))) }
      if (type === 'orderedList') node.attrs = { start: Number(token.attrGet('start')) || 1 }
      if (type === 'tableHeader' || type === 'tableCell') node.attrs = { textAlign: String(token.attrGet('style') || '').match(/text-align:(left|center|right)/)?.[1] || null }
      parent.content!.push(node)
      stack.push(node)
    } else if (token.type.endsWith('_close')) {
      if (blockTypes[token.type.slice(0, -6)] && stack.length > 1) stack.pop()
    } else if (token.type === 'fence' || token.type === 'code_block') {
      parent.content!.push({ type: 'codeBlock', attrs: { language: token.info.trim().split(/\s+/)[0] || null }, content: token.content ? [{ type: 'text', text: token.content }] : [] })
    } else if (token.type === 'hr') parent.content!.push({ type: 'horizontalRule' })
    else if (token.type === 'html_block') {
      parent.content!.push({ type: 'paragraph', content: inline(markdown.parseInline(token.content.trim(), {})[0]?.children || []) })
    }
  }
  function normalize(node: RichNode): RichNode {
    if (node.type === 'blockquote') {
      const first = node.content?.[0]
      const marker = first?.content?.[0]
      const match = marker?.type === 'text' && marker.text?.match(/^\[!(\w+)\](?:\s|$)/)
      if (match && alertTypes.includes(match[1]!.toLowerCase() as typeof alertTypes[number])) {
        node.type = 'callout'
        node.attrs = { kind: match[1]!.toLowerCase() }
        marker!.text = marker!.text!.slice(match[0].length)
        if (!marker!.text) first!.content!.shift()
        if (first?.content?.[0]?.type === 'hardBreak') first.content.shift()
        if (!first?.content?.length) node.content!.shift()
        if (!node.content?.length) node.content = [{ type: 'paragraph', content: [] }]
      }
    }
    if (node.type === 'bulletList') {
      // Mixed lists preserve ordinary items instead of discarding their semantics.
      const groups: RichNode[] = []
      for (const item of node.content || []) {
        const first = item.content?.[0]?.content?.[0]
        const match = first?.type === 'text' && first.text?.match(/^\[([ xX])\]\s+/)
        const type = match ? 'taskList' : 'bulletList'
        if (match) {
          item.type = 'taskItem'
          item.attrs = { checked: match[1]!.toLowerCase() === 'x' }
          first!.text = first!.text!.slice(match[0].length)
          if (!first!.text) item.content![0]!.content!.shift()
        }
        if (groups.at(-1)?.type !== type) groups.push({ type, content: [] })
        groups.at(-1)!.content!.push(item)
      }
      if (groups.length === 1) { node.type = groups[0]!.type; node.content = groups[0]!.content }
      else if (groups.length > 1) { node.type = '_splitList'; node.content = groups }
    }
    if (node.type === 'tableHeader' || node.type === 'tableCell') node.content = [{ type: 'paragraph', content: node.content || [] }]
    node.content = node.content?.map(normalize).flatMap(child => {
      if (child.type === '_splitList') return child.content || []
      if (child.type !== 'paragraph' || !child.content?.some(item => item.type === 'image')) return [child]
      const blocks: RichNode[] = []
      for (const item of child.content) {
        if (item.type === 'image') blocks.push(item)
        else {
          if (blocks.at(-1)?.type !== 'paragraph') blocks.push({ type: 'paragraph', content: [] })
          blocks.at(-1)!.content!.push(item)
        }
      }
      return blocks
    })
    return node
  }
  return normalize(root)
}
