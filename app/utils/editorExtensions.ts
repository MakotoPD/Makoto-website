import { Extension, Mark, Node } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Highlight from '@tiptap/extension-highlight'
import Subscript from '@tiptap/extension-subscript'
import Superscript from '@tiptap/extension-superscript'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import { TableKit } from '@tiptap/extension-table'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import { syntaxHighlighter } from '#shared/highlight'
import { alertTypes, safeHref } from '#shared/content'

const CaptionImage = Image.extend({
  addAttributes() { return { ...this.parent?.(), caption: { default: '' } } }
})
const FileNode = Node.create({
  name: 'file', group: 'block', atom: true,
  addAttributes() { return { src: { default: '' }, name: { default: 'Download' } } },
  parseHTML() { return [{ tag: 'a[data-file]' }] },
  renderHTML({ HTMLAttributes }) { return ['a', { href: safeHref(HTMLAttributes.src), 'data-file': '', download: '' }, HTMLAttributes.name] }
})
const Kbd = Mark.create({
  name: 'kbd',
  parseHTML() { return [{ tag: 'kbd' }] },
  renderHTML() { return ['kbd', 0] }
})
const Callout = Node.create({
  name: 'callout', group: 'block', content: 'block+', defining: true,
  addAttributes() {
    return { kind: { default: 'note', parseHTML: element => element.getAttribute('data-callout') || 'note' } }
  },
  parseHTML() { return [{ tag: 'aside[data-callout]' }] },
  renderHTML({ node }) {
    const kind = alertTypes.includes(node.attrs.kind) ? node.attrs.kind : 'note'
    return ['aside', { 'data-callout': kind, class: `alert alert-${kind}` }, ['div', { class: 'alert-content' }, 0]]
  }
})
const TableAlignment = Extension.create({
  name: 'tableAlignment',
  addGlobalAttributes() {
    return [{ types: ['tableCell', 'tableHeader'], attributes: {
      textAlign: {
        default: null,
        parseHTML: element => ['left', 'center', 'right'].includes(element.style.textAlign) ? element.style.textAlign : null,
        renderHTML: attrs => ['left', 'center', 'right'].includes(attrs.textAlign) ? { style: `text-align: ${attrs.textAlign}` } : {}
      }
    } }]
  }
})
export function richEditorExtensions() {
  return [
    StarterKit.configure({ heading: { levels: [2, 3, 4, 5, 6] }, codeBlock: false, link: { openOnClick: false } }),
    CaptionImage, FileNode, Highlight, Kbd, Subscript, Superscript, Callout,
    TaskList, TaskItem.configure({ nested: true }), TableKit, TableAlignment,
    CodeBlockLowlight.configure({ lowlight: syntaxHighlighter })
  ]
}
