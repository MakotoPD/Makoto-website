<script setup lang="ts">
import { computed, onBeforeUnmount, watch } from 'vue'
import { EditorContent, useEditor } from '@tiptap/vue-3'
import { alertTypes, validateRichDocument, type RichNode } from '#shared/content'
import { markdownToDocument } from '#shared/markdown'
import type { MediaItem } from '#shared/panel'
import { richEditorExtensions } from '~/utils/editorExtensions'

const props = defineProps<{ modelValue: RichNode; csrf: string }>()
const emit = defineEmits<{ 'update:modelValue': [value: RichNode] }>()
const mediaOpen = ref(false)
const showMarkdown = ref(false)
const markdownSource = ref('')
const markdownError = ref('')
const editor = useEditor({
  content: props.modelValue,
  extensions: richEditorExtensions(),
  editorProps: { attributes: { class: 'content-document min-h-72 rounded-xl border border-zinc-700 bg-zinc-950 p-5 text-zinc-100 focus:outline-2 focus:outline-sky-400' } },
  onUpdate: ({ editor }) => emit('update:modelValue', editor.getJSON() as RichNode)
})
watch(() => props.modelValue, value => {
  if (editor.value && JSON.stringify(editor.value.getJSON()) !== JSON.stringify(value)) editor.value.commands.setContent(value, { emitUpdate: false })
})
onBeforeUnmount(() => editor.value?.destroy())

function insertMarkdown() {
  try {
    const document = markdownToDocument(markdownSource.value)
    validateRichDocument(document)
    editor.value?.chain().focus().insertContent(document.content || []).run()
    markdownSource.value = ''
    markdownError.value = ''
    showMarkdown.value = false
  } catch (error) { markdownError.value = error instanceof Error ? error.message : 'Nie udało się wstawić treści' }
}
function setCallout(event: Event) {
  const select = event.target as HTMLSelectElement
  if (select.value) {
    if (editor.value?.isActive('callout')) editor.value.chain().focus().updateAttributes('callout', { kind: select.value }).run()
    else editor.value?.chain().focus().toggleWrap('callout', { kind: select.value }).run()
  }
  select.value = ''
}

function setLink() {
  const href = window.prompt('Adres linku (https:// lub /):')
  if (href) editor.value?.chain().focus().setLink({ href }).run()
}
function moveBlock(delta: number) {
  if (!editor.value) return
  const selected = editor.value.state.selection.$from.index(0)
  const json = editor.value.getJSON() as RichNode
  const blocks = [...(json.content || [])]
  const destination = selected + delta
  if (destination < 0 || destination >= blocks.length) return
  ;[blocks[selected], blocks[destination]] = [blocks[destination]!, blocks[selected]!]
  editor.value.commands.setContent({ type: 'doc', content: blocks })
}
function insertMedia(file: MediaItem) {
  const src = `/api/media/${file.id}`
  if (file.mime.startsWith('image/')) editor.value?.chain().focus().setImage({ src: `${src}?size=big`, alt: file.alt }).run()
  else editor.value?.chain().focus().insertContent({ type: 'file', attrs: { src, name: file.name } }).run()
}
</script>

<template>
  <div>
    <div class="mb-3 space-y-3" aria-label="Narzędzia edytora">
      <div class="flex flex-wrap gap-2" role="toolbar" aria-label="Podstawowe formatowanie">
        <button v-for="level in [2, 3]" :key="level" type="button" class="editor-tool" :aria-pressed="editor?.isActive('heading', { level })" @click="editor?.chain().focus().toggleHeading({ level: level as 2 | 3 }).run()">H{{ level }}</button>
        <button type="button" class="editor-tool font-bold" aria-label="Pogrubienie" :aria-pressed="editor?.isActive('bold')" @click="editor?.chain().focus().toggleBold().run()">B</button>
        <button type="button" class="editor-tool italic" aria-label="Kursywa" :aria-pressed="editor?.isActive('italic')" @click="editor?.chain().focus().toggleItalic().run()">I</button>
        <button type="button" class="editor-tool" @click="editor?.chain().focus().toggleBulletList().run()">• Lista</button>
        <button type="button" class="editor-tool" @click="editor?.chain().focus().toggleOrderedList().run()">1. Lista</button>
        <button type="button" class="editor-tool" @click="setLink">Link</button>
        <button type="button" class="editor-tool" @click="mediaOpen = true">Wstaw z mediów</button>
        <button type="button" class="editor-tool" :aria-expanded="showMarkdown" @click="showMarkdown = !showMarkdown">Wstaw Markdown</button>
      </div>
      <details>
        <summary class="cursor-pointer text-xs text-zinc-400">Więcej formatowania</summary>
        <div class="mt-3 flex flex-wrap gap-2" role="toolbar" aria-label="Dodatkowe formatowanie">
          <button v-for="level in [4, 5, 6]" :key="level" type="button" class="editor-tool" @click="editor?.chain().focus().toggleHeading({ level: level as 4 | 5 | 6 }).run()">H{{ level }}</button>
          <button type="button" class="editor-tool" @click="editor?.chain().focus().toggleHighlight().run()">Wyróżnij</button>
          <button type="button" class="editor-tool" @click="editor?.chain().focus().toggleStrike().run()">Przekreśl</button>
          <button type="button" class="editor-tool" @click="editor?.chain().focus().toggleMark('kbd').run()">Klawisz</button>
          <button type="button" class="editor-tool" @click="editor?.chain().focus().toggleSubscript().run()">Indeks dolny</button>
          <button type="button" class="editor-tool" @click="editor?.chain().focus().toggleSuperscript().run()">Indeks górny</button>
          <button type="button" class="editor-tool" @click="editor?.chain().focus().toggleTaskList().run()">Lista zadań</button>
          <select class="editor-tool bg-zinc-950" aria-label="Typ alertu" @change="setCallout"><option value="">Alert…</option><option v-for="kind in alertTypes" :key="kind" :value="kind">{{ kind.toUpperCase() }}</option></select>
          <button type="button" class="editor-tool" @click="editor?.chain().focus().toggleBlockquote().run()">Cytat</button>
          <button type="button" class="editor-tool" @click="editor?.chain().focus().toggleCodeBlock().run()">Kod</button>
          <button type="button" class="editor-tool" @click="editor?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()">Tabela</button>
          <button type="button" class="editor-tool" @click="moveBlock(-1)">↑ Blok</button>
          <button type="button" class="editor-tool" @click="moveBlock(1)">↓ Blok</button>
        </div>
      </details>
      <div v-if="editor?.isActive('table')" class="flex flex-wrap gap-2" role="toolbar" aria-label="Narzędzia tabeli">
        <button type="button" class="editor-tool" @click="editor?.chain().focus().addRowAfter().run()">+ Wiersz</button>
        <button type="button" class="editor-tool" @click="editor?.chain().focus().addColumnAfter().run()">+ Kolumna</button>
        <button type="button" class="editor-tool" @click="editor?.chain().focus().deleteRow().run()">− Wiersz</button>
        <button type="button" class="editor-tool" @click="editor?.chain().focus().deleteColumn().run()">− Kolumna</button>
        <button v-for="align in ['left', 'center', 'right']" :key="align" type="button" class="editor-tool" @click="editor?.chain().focus().setCellAttribute('textAlign', align).run()">{{ { left: 'Do lewej', center: 'Środek', right: 'Do prawej' }[align] }}</button>
      </div>
    </div>
    <div v-if="showMarkdown" class="mb-4 space-y-2">
      <label for="markdown-source" class="block text-sm">Markdown zostanie wstawiony w miejscu kursora.</label>
      <textarea id="markdown-source" v-model="markdownSource" rows="10" class="w-full rounded-lg border border-zinc-600 bg-zinc-950 p-3 font-mono text-sm" />
      <button type="button" class="editor-tool" :disabled="!markdownSource.trim()" @click="insertMarkdown">Wstaw treść</button>
      <p v-if="markdownError" role="alert" class="text-red-300">{{ markdownError }}</p>
    </div>
    <EditorContent :editor="editor" />
    <PanelMediaPicker v-model:open="mediaOpen" :csrf="csrf" @select="insertMedia" />
  </div>
</template>

<style src="~/assets/css/rich-content.css"></style>

<style scoped>
.editor-tool { border: 1px solid #52525b; border-radius: .5rem; padding: .4rem .7rem; font-size: .8rem; color: #e4e4e7; }
.editor-tool[aria-pressed="true"] { background: #173847; border-color: #38bdf8; }
.editor-tool:hover { border-color: #38bdf8; color: #7dd3fc; }
.editor-tool:focus-visible { outline: 2px solid #7dd3fc; }
:deep(.ProseMirror h2) { font-size: 1.5rem; margin: 1rem 0; }
:deep(.ProseMirror h3) { font-size: 1.25rem; margin: .75rem 0; }
:deep(.ProseMirror p) { margin: .65rem 0; }
:deep(.ProseMirror ul), :deep(.ProseMirror ol) { padding-left: 1.5rem; }
:deep(.ProseMirror ul) { list-style: disc; }
:deep(.ProseMirror ol) { list-style: decimal; }
:deep(.ProseMirror blockquote) { border-left: 3px solid #38bdf8; padding-left: 1rem; }
:deep(.ProseMirror img) { max-width: 100%; border-radius: .75rem; }
</style>
