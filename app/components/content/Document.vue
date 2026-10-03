<script lang="ts">
import { defineComponent, h, type VNodeChild } from 'vue'
import { safeHref, type RichNode } from '#shared/content'

function renderNode(node: RichNode, index = 0): VNodeChild {
  const children = () => node.content?.map((child, childIndex) => renderNode(child, childIndex)) || []
  switch (node.type) {
    case 'text': {
      let content: VNodeChild = node.text || ''
      for (const mark of [...(node.marks || [])].reverse()) {
        if (mark.type === 'bold') content = h('strong', content)
        else if (mark.type === 'italic') content = h('em', content)
        else if (mark.type === 'strike') content = h('s', content)
        else if (mark.type === 'code') content = h('code', content)
        else if (mark.type === 'link') {
          const href = safeHref(mark.attrs?.href)
          if (href) content = h('a', { href, rel: href.startsWith('http') ? 'noopener noreferrer' : undefined }, content)
        }
      }
      return content
    }
    case 'paragraph': return h('p', { key: index }, children())
    case 'heading': return h(`h${[2, 3, 4].includes(Number(node.attrs?.level)) ? node.attrs?.level : 2}`, { key: index }, children())
    case 'bulletList': return h('ul', { key: index }, children())
    case 'orderedList': return h('ol', { key: index }, children())
    case 'listItem': return h('li', { key: index }, children())
    case 'blockquote': return h('blockquote', { key: index }, children())
    case 'codeBlock': return h('pre', { key: index }, [h('code', children())])
    case 'hardBreak': return h('br')
    case 'horizontalRule': return h('hr')
    case 'image': {
      const src = safeHref(node.attrs?.src)
      if (!src) return null
      return h('figure', { key: index }, [
        h('img', { src, alt: String(node.attrs?.alt || ''), loading: 'lazy', decoding: 'async' }),
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

export default defineComponent({
  name: 'ContentDocument',
  props: { document: { type: Object as () => RichNode, required: true } },
  setup(props) {
    return () => h('div', { class: 'content-document max-w-none' }, [renderNode(props.document)])
  }
})
</script>

<style scoped>
.content-document { color: inherit; }
.content-document :deep(h2) { margin: 1.25rem 0; font-size: clamp(1.875rem, 4vw, 2.25rem); font-weight: 600; line-height: 1.2; }
.content-document :deep(h3) { margin: 1rem 0; font-size: 1.5rem; font-weight: 600; }
.content-document :deep(h4) { margin: .75rem 0; font-size: 1.25rem; font-weight: 600; }
.content-document :deep(p) { margin: .5rem 0; font-size: 1.125rem; line-height: 1.7; }
.content-document :deep(ul) { list-style: disc inside; margin: .5rem 0; }
.content-document :deep(ol) { list-style: decimal inside; margin: .5rem 0; }
.content-document :deep(li) { margin: .25rem 0; line-height: 1.65; }
.content-document :deep(li)::marker { color: #38bdf8; }
.content-document :deep(a) { text-decoration: underline; text-decoration-color: #0284c7; text-decoration-thickness: 2px; text-underline-offset: 4px; }
.content-document :deep(a:hover) { color: #0284c7; }
.content-document :deep(blockquote) { width: fit-content; margin: .75rem 0; border-radius: .5rem; background: rgb(51 65 85 / .16); padding: .5rem 1rem; }
.content-document :deep(img) { width: 100%; height: auto; border-radius: .75rem; }
.content-document :deep(figcaption) { color: #a1a1aa; font-size: .9rem; text-align: center; margin-top: .5rem; }
.content-document :deep(pre) { overflow: auto; padding: 1rem; border-radius: .5rem; background: #212529; color: white; }
.content-document :deep(code) { border-radius: .2rem; background: rgb(51 65 85 / .25); padding: 0 .2rem; }
</style>
