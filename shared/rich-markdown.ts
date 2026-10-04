import { safeHref, type RichNode } from './content'

const escape = (text: string) => text.replace(/([\\`*_[\]<>])/g, '\\$1')

export function richMarkdown(node: RichNode): string {
  const children = () => (node.content || []).map(richMarkdown).join('')
  const quote = (text: string) => text.trim().split('\n').map(line => `> ${line}`).join('\n')
  switch (node.type) {
    case 'text': {
      let text = escape(node.text || '')
      for (const mark of node.marks || []) {
        if (mark.type === 'bold') text = `**${text}**`
        if (mark.type === 'italic') text = `*${text}*`
        if (mark.type === 'strike') text = `~~${text}~~`
        if (mark.type === 'code') text = `\`${(node.text || '').replace(/`/g, '\\`')}\``
        if (mark.type === 'link') {
          const href = safeHref(mark.attrs?.href)
          if (href) text = `[${text}](${href.replace(/[()]/g, encodeURIComponent)})`
        }
        if (mark.type === 'highlight') text = `<mark>${text}</mark>`
        if (mark.type === 'kbd') text = `<kbd>${text}</kbd>`
        if (mark.type === 'subscript') text = `<sub>${text}</sub>`
        if (mark.type === 'superscript') text = `<sup>${text}</sup>`
      }
      return text
    }
    case 'paragraph': return `${children()}\n\n`
    case 'heading': return `${'#'.repeat(Math.min(6, Math.max(2, Number(node.attrs?.level) || 2)))} ${children()}\n\n`
    case 'hardBreak': return '  \n'
    case 'horizontalRule': return '\n---\n\n'
    case 'blockquote': return `${quote(children())}\n\n`
    case 'callout': return `> [!${String(node.attrs?.kind || 'note').toUpperCase()}]\n${quote(children())}\n\n`
    case 'codeBlock': {
      const code = (node.content || []).map(child => child.text || '').join('')
      const fence = '`'.repeat(Math.max(3, ...(code.match(/`+/g) || []).map(value => value.length + 1)))
      return `${fence}${String(node.attrs?.language || '').replace(/[^\w+-]/g, '')}\n${code.trimEnd()}\n${fence}\n\n`
    }
    case 'bulletList':
    case 'orderedList':
    case 'taskList': return (node.content || []).map((child, index) => {
      const prefix = node.type === 'orderedList' ? `${Number(node.attrs?.start || 1) + index}. ` : node.type === 'taskList' ? `- [${child.attrs?.checked ? 'x' : ' '}] ` : '- '
      const lines = richMarkdown(child).trim().split('\n')
      return prefix + lines.map((line, i) => i ? `${' '.repeat(prefix.length)}${line}` : line).join('\n')
    }).join('\n') + '\n\n'
    case 'image': {
      const src = safeHref(node.attrs?.src)
      return src ? `![${escape(String(node.attrs?.alt || ''))}](${src})\n\n` : ''
    }
    case 'file': {
      const src = safeHref(node.attrs?.src)
      return src ? `[${escape(String(node.attrs?.name || 'File'))}](${src})\n\n` : ''
    }
    case 'table': {
      const rows = (node.content || []).map(row => (row.content || []).map(cell => richMarkdown(cell).trim().replace(/\n+/g, ' ').replace(/\|/g, '\\|')))
      if (!rows.length) return ''
      return [`| ${rows[0]!.join(' | ')} |`, `| ${rows[0]!.map(() => '---').join(' | ')} |`, ...rows.slice(1).map(row => `| ${row.join(' | ')} |`)].join('\n') + '\n\n'
    }
    default: return children()
  }
}
