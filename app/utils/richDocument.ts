import { h, type VNodeChild } from 'vue'
import { alertTypes, safeHref, type RichNode } from '#shared/content'
import { syntaxHighlighter } from '#shared/highlight'

const icons: Record<string, string> = {
  note: 'M8 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V10M7 12h7M7 16h10M16 3h5v5h-5z',
  success: 'M8 12l3 3 5-6M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0',
  info: 'M12 11v6M12 7v.1M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0',
  tip: 'M9 18h6M10 22h4M9 15c0-3-4-3-4-7a7 7 0 0 1 14 0c0 4-4 4-4 7z',
  important: 'M12 8v5M12 16v.1M3 5l9-3 9 3v7c0 5-6 9-9 10-3-1-9-5-9-10z',
  warning: 'M12 9v4M12 17v.1M10 3L2 18q-1 3 2 3h16q3 0 2-3L14 3q-2-2-4 0',
  caution: 'M4 22v-7a8 8 0 0 1 16 0v7M2 22h20M12 2v2M3 5l2 2M21 5l-2 2M12 12v5M12 19v.1'
}
function highlighted(code: string, language: string): VNodeChild {
  if (!syntaxHighlighter.registered(language)) return code
  type HighlightNode = ReturnType<typeof syntaxHighlighter.highlight>['children'][number]
  const render = (node: HighlightNode): VNodeChild => node.type === 'text' ? node.value : node.type === 'element'
    ? h('span', { class: node.properties.className }, node.children.map(child => render(child as HighlightNode))) : null
  try { return syntaxHighlighter.highlight(language, code).children.map(render) } catch { return code }
}

export function renderRichNode(node: RichNode, index = 0): VNodeChild {
  const children = () => node.content?.map((child, childIndex) => renderRichNode(child, childIndex)) || []
  switch (node.type) {
    case 'text': {
      let content: VNodeChild = node.text || ''
      const tags: Record<string, string> = { bold: 'strong', italic: 'em', strike: 's', code: 'code', highlight: 'mark', kbd: 'kbd', subscript: 'sub', superscript: 'sup', underline: 'u' }
      for (const mark of [...(node.marks || [])].reverse()) {
        if (tags[mark.type]) content = h(tags[mark.type]!, content)
        else if (mark.type === 'link') {
          const href = safeHref(mark.attrs?.href)
          if (href) content = h('a', { href, title: mark.attrs?.title || undefined, rel: href.startsWith('http') ? 'noopener noreferrer' : undefined }, content)
        }
      }
      return content
    }
    case 'paragraph': return h('p', { key: index }, children())
    case 'heading': return h(`h${[2, 3, 4, 5, 6].includes(Number(node.attrs?.level)) ? node.attrs?.level : 2}`, { key: index }, children())
    case 'bulletList': return h('ul', { key: index }, children())
    case 'orderedList': return h('ol', { key: index, start: Number(node.attrs?.start) || 1 }, children())
    case 'listItem': return h('li', { key: index }, children())
    case 'taskList': return h('ul', { key: index, class: 'task-list', 'data-type': 'taskList' }, children())
    case 'taskItem': return h('li', { key: index, class: 'task-list-item', 'data-checked': node.attrs?.checked === true }, [
      h('input', { type: 'checkbox', checked: node.attrs?.checked === true, disabled: true, 'aria-label': node.content?.[0]?.content?.map(item => item.text || '').join('') || 'Task' }), h('div', children())
    ])
    case 'blockquote': return h('blockquote', { key: index }, children())
    case 'callout': {
      const kind = alertTypes.includes(node.attrs?.kind as typeof alertTypes[number]) ? String(node.attrs?.kind) : 'note'
      return h('aside', { key: index, class: `alert alert-${kind}`, role: 'note', 'aria-label': kind.toUpperCase() }, [
        h('div', { class: 'alert-title', title: kind.toUpperCase() }, [h('svg', { class: 'alert-icon', width: 24, height: 24, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 1.5, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'aria-hidden': true }, [h('path', { d: icons[kind] })])]),
        h('div', { class: 'alert-content' }, children())
      ])
    }
    case 'table': {
      const rows = node.content || []
      const hasHead = rows[0]?.content?.every(cell => cell.type === 'tableHeader')
      return h('div', { key: index, class: 'table-scroll', tabindex: 0, role: 'region', 'aria-label': 'Table' }, [h('table', [
        hasHead ? h('thead', [renderRichNode(rows[0]!)]) : null,
        h('tbody', (hasHead ? rows.slice(1) : rows).map((row, i) => renderRichNode(row, i)))
      ])])
    }
    case 'tableRow': return h('tr', { key: index }, children())
    case 'tableHeader':
    case 'tableCell': return h(node.type === 'tableHeader' ? 'th' : 'td', {
      key: index, scope: node.type === 'tableHeader' ? 'col' : undefined,
      colspan: Number(node.attrs?.colspan) || undefined, rowspan: Number(node.attrs?.rowspan) || undefined,
      style: { textAlign: ['left', 'center', 'right'].includes(String(node.attrs?.textAlign)) ? String(node.attrs?.textAlign) : undefined }
    }, children())
    case 'codeBlock': {
      const language = String(node.attrs?.language || 'text').toLowerCase()
      const code = node.content?.map(child => child.text || '').join('') || ''
      return h('pre', { key: index, 'data-language': language }, [h('code', { class: ['hljs', `language-${language.replace(/[^a-z0-9+-]/g, '')}`] }, [highlighted(code, language)])])
    }
    case 'hardBreak': return h('br')
    case 'horizontalRule': return h('hr')
    case 'image': {
      const src = safeHref(node.attrs?.src)
      if (!src) return null
      return h('figure', { key: index }, [
        h('img', { src, alt: String(node.attrs?.alt || ''), title: node.attrs?.title || undefined, loading: 'lazy', decoding: 'async' }),
        node.attrs?.caption ? h('figcaption', String(node.attrs.caption)) : null
      ])
    }
    case 'file': {
      const href = safeHref(node.attrs?.src)
      return href ? h('a', { key: index, href, download: '', rel: 'noopener noreferrer' }, String(node.attrs?.name || 'Download')) : null
    }
    case 'doc': return h('div', children())
    default: return null
  }
}
