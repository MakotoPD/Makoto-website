<script setup lang="ts">
import { computed, onBeforeUnmount, watch } from 'vue'
import { EditorContent, useEditor } from '@tiptap/vue-3'
import { alertTypes, validateRichDocument, type RichNode } from '#shared/content'
import { markdownToDocument } from '#shared/markdown'
import { richEditorExtensions } from '~/utils/editorExtensions'

const props = defineProps<{ modelValue: RichNode; csrf: string }>()
const emit = defineEmits<{ 'update:modelValue': [value: RichNode] }>()
const uploading = ref(false)
const uploadError = ref('')
const fileInput = ref<HTMLInputElement | null>(null)
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
async function upload(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return
  uploading.value = true
  uploadError.value = ''
  try {
    const alt = file.type.startsWith('image/') ? window.prompt('Tekst alternatywny obrazu:')?.trim() : ''
    if (file.type.startsWith('image/') && !alt) throw new Error('Tekst alternatywny jest wymagany')
    const form = new FormData()
    form.append('file', file)
    form.append('alt', alt || '')
    const item = await $fetch<{ id: string; name: string }>('/api/admin/media', { method: 'POST', body: form, headers: { 'x-csrf-token': props.csrf } })
    const src = `/api/media/${item.id}`
    if (file.type.startsWith('image/')) editor.value?.chain().focus().setImage({ src, alt }).run()
    else editor.value?.chain().focus().insertContent({ type: 'file', attrs: { src, name: item.name } }).run()
  } catch (error) {
    uploadError.value = error instanceof Error ? error.message : 'Nie udało się przesłać pliku'
  } finally {
    uploading.value = false
    if (fileInput.value) fileInput.value.value = ''
  }
}
</script>

<template>
  <div>
    <div class="mb-3 flex flex-wrap gap-2" role="toolbar" aria-label="Narzędzia edytora">
      <button v-for="level in [2, 3, 4, 5, 6]" :key="level" type="button" class="editor-tool" @click="editor?.chain().focus().toggleHeading({ level: level as 2 | 3 | 4 | 5 | 6 }).run()">H{{ level }}</button>
      <button type="button" class="editor-tool" aria-label="Pogrubienie" @click="editor?.chain().focus().toggleBold().run()">B</button>
      <button type="button" class="editor-tool italic" aria-label="Kursywa" @click="editor?.chain().focus().toggleItalic().run()">I</button>
      <button type="button" class="editor-tool" @click="editor?.chain().focus().toggleHighlight().run()">Wyróżnij</button>
      <button type="button" class="editor-tool" @click="editor?.chain().focus().toggleStrike().run()">Przekreśl</button>
      <button type="button" class="editor-tool" @click="editor?.chain().focus().toggleMark('kbd').run()">Klawisz</button>
      <button type="button" class="editor-tool" @click="editor?.chain().focus().toggleSubscript().run()">Indeks dolny</button>
      <button type="button" class="editor-tool" @click="editor?.chain().focus().toggleSuperscript().run()">Indeks górny</button>
      <button type="button" class="editor-tool" @click="editor?.chain().focus().toggleBulletList().run()">Lista</button>
      <button type="button" class="editor-tool" @click="editor?.chain().focus().toggleOrderedList().run()">1. Lista</button>
      <button type="button" class="editor-tool" @click="editor?.chain().focus().toggleTaskList().run()">Zadania</button>
      <select class="editor-tool bg-zinc-950" aria-label="Typ alertu" @change="setCallout"><option value="">Alert…</option><option v-for="kind in alertTypes" :key="kind" :value="kind">{{ kind.toUpperCase() }}</option></select>
      <button type="button" class="editor-tool" @click="editor?.chain().focus().toggleBlockquote().run()">Cytat</button>
      <button type="button" class="editor-tool" @click="editor?.chain().focus().toggleCodeBlock().run()">Kod</button>
      <button type="button" class="editor-tool" @click="setLink">Link</button>
      <button type="button" class="editor-tool" @click="editor?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()">Tabela</button>
      <template v-if="editor?.isActive('table')">
        <button type="button" class="editor-tool" @click="editor?.chain().focus().addRowAfter().run()">+ Wiersz</button>
        <button type="button" class="editor-tool" @click="editor?.chain().focus().addColumnAfter().run()">+ Kolumna</button>
        <button type="button" class="editor-tool" @click="editor?.chain().focus().deleteRow().run()">− Wiersz</button>
        <button type="button" class="editor-tool" @click="editor?.chain().focus().deleteColumn().run()">− Kolumna</button>
        <button v-for="align in ['left', 'center', 'right']" :key="align" type="button" class="editor-tool" @click="editor?.chain().focus().setCellAttribute('textAlign', align).run()">{{ { left: 'Do lewej', center: 'Środek', right: 'Do prawej' }[align] }}</button>
      </template>
      <button type="button" class="editor-tool" @click="showMarkdown = !showMarkdown">Wstaw Markdown</button>
      <button type="button" class="editor-tool" @click="moveBlock(-1)">↑ Blok</button>
      <button type="button" class="editor-tool" @click="moveBlock(1)">↓ Blok</button>
      <button type="button" class="editor-tool" :disabled="uploading" @click="fileInput?.click()">{{ uploading ? 'Wysyłanie…' : 'Dodaj obraz lub PDF' }}</button>
      <input ref="fileInput" type="file" accept="image/jpeg,image/png,image/webp,application/pdf" class="sr-only" @change="upload">
    </div>
    <div v-if="showMarkdown" class="mb-4 space-y-2">
      <label for="markdown-source" class="block text-sm">Markdown zostanie wstawiony w miejscu kursora.</label>
      <textarea id="markdown-source" v-model="markdownSource" rows="10" class="w-full rounded-lg border border-zinc-600 bg-zinc-950 p-3 font-mono text-sm" />
      <button type="button" class="editor-tool" :disabled="!markdownSource.trim()" @click="insertMarkdown">Wstaw treść</button>
      <p v-if="markdownError" role="alert" class="text-red-300">{{ markdownError }}</p>
    </div>
    <EditorContent :editor="editor" />
    <p v-if="uploadError" role="alert" class="mt-2 text-sm text-red-300">{{ uploadError }}</p>
  </div>
</template>

<style src="~/assets/css/rich-content.css"></style>

<style scoped>
.editor-tool { border: 1px solid #52525b; border-radius: .5rem; padding: .4rem .7rem; font-size: .8rem; color: #e4e4e7; }
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
