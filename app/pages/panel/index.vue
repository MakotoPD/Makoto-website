<script setup lang="ts">
import { contentKinds, type RichNode } from '#shared/content'

definePageMeta({ layout: 'panel', i18n: false })
useSeoMeta({ title: 'Panel treści | Makoto', robots: 'noindex, nofollow' })
type AdminEntry = {
  id: string; kind: string; locale: 'pl' | 'en'; slug: string; translationGroup: string
  title: string; summary: string; body: RichNode; sections: any[]; data: Record<string, any>
  status: string; seoTitle: string | null; seoDescription: string | null; coverMediaId: string | null
  updatedAt?: string
}
type MediaItem = { id: string; name: string; mime: string; bytes: number; alt: string; caption: string; published: string | null }
type Version = { number: number; createdAt: string }

const session = ref<{ csrf: string; expiresAt: string } | null>(null)
const loading = ref(true)
const error = ref('')
const notice = ref('')
const tab = ref<'content' | 'media' | 'security'>('content')
const filter = ref('all')
const entries = ref<AdminEntry[]>([])
const files = ref<MediaItem[]>([])
const revisions = ref<Version[]>([])
const editing = ref<AdminEntry | null>(null)
const editorSection = ref<HTMLElement | null>(null)
const busy = ref(false)
const uploadFile = ref<File | null>(null)
const uploadAlt = ref('')
const newSectionType = ref('scope')
const dataJson = ref('{}')
const csrf = computed(() => session.value?.csrf || '')
const filtered = computed(() => filter.value === 'all' ? entries.value : entries.value.filter(item => item.kind === filter.value))
const counterparts = computed(() => entries.value.filter(item => item.translationGroup === editing.value?.translationGroup && item.id !== editing.value?.id))

async function refresh() {
  try {
    session.value = await $fetch('/api/admin/session')
    entries.value = await $fetch('/api/admin/entries')
    files.value = await $fetch('/api/admin/media')
    error.value = ''
  } catch {
    await navigateTo('/panel/login')
  } finally {
    loading.value = false
  }
}
onMounted(refresh)

async function mutate<T>(url: string, method: 'POST' | 'PUT' | 'PATCH' | 'DELETE', body: unknown): Promise<T> {
  return $fetch(url, { method, body: body as Record<string, unknown>, headers: { 'x-csrf-token': csrf.value } }) as Promise<T>
}
function select(entry: AdminEntry) {
  editing.value = structuredClone(entry)
  dataJson.value = JSON.stringify(editing.value.data || {}, null, 2)
  loadVersions(entry.id)
  notice.value = ''
  error.value = ''
  focusEditor()
}
async function focusEditor() {
  await nextTick()
  if (window.innerWidth < 1024) editorSection.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
function create(kind = 'article') {
  editing.value = {
    id: '', kind, locale: 'pl', slug: '', translationGroup: crypto.randomUUID(),
    title: '', summary: '', body: { type: 'doc', content: [{ type: 'paragraph' }] },
    sections: [], data: {}, status: 'draft', seoTitle: null, seoDescription: null, coverMediaId: null
  }
  dataJson.value = '{}'
  revisions.value = []
  notice.value = ''
  focusEditor()
}
function createTranslation() {
  if (!editing.value) return
  const clone = structuredClone(editing.value)
  clone.id = ''
  clone.locale = clone.locale === 'pl' ? 'en' : 'pl'
  clone.slug = ''
  clone.status = 'draft'
  editing.value = clone
  focusEditor()
}
async function loadVersions(id: string) {
  revisions.value = await $fetch<Version[]>(`/api/admin/entries/${id}/versions`)
}
async function save() {
  if (!editing.value) return
  busy.value = true
  error.value = ''
  try {
    editing.value.data = JSON.parse(dataJson.value)
    const id = editing.value.id
    const saved = id
      ? await mutate<AdminEntry>(`/api/admin/entries/${id}`, 'PUT', editing.value)
      : await mutate<AdminEntry>('/api/admin/entries', 'POST', editing.value)
    editing.value = saved
    await refresh()
    await loadVersions(saved.id)
    notice.value = 'Szkic zapisany.'
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : 'Nie udało się zapisać.'
  } finally {
    busy.value = false
  }
}
async function changeStatus(status: 'draft' | 'published') {
  if (!editing.value?.id) return
  busy.value = true
  try {
    editing.value = await mutate<AdminEntry>(`/api/admin/entries/${editing.value.id}/status`, 'POST', { status })
    await refresh()
    await loadVersions(editing.value.id)
    notice.value = status === 'published' ? 'Treść opublikowana.' : 'Treść wycofana do szkiców.'
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : 'Nie udało się zmienić statusu.'
  } finally {
    busy.value = false
  }
}
async function removeEntry() {
  if (!editing.value?.id || !confirm(`Usunąć „${editing.value.title}”? Treść zostanie ukryta, a wersje pozostaną dostępne.`)) return
  await mutate(`/api/admin/entries/${editing.value.id}`, 'DELETE', { confirm: 'DELETE' })
  editing.value = null
  await refresh()
  notice.value = 'Treść usunięta z witryny.'
}
async function restore(number: number) {
  if (!editing.value?.id || !confirm(`Przywrócić wersję ${number} jako szkic?`)) return
  editing.value = await mutate<AdminEntry>(`/api/admin/entries/${editing.value.id}/restore`, 'POST', { number })
  dataJson.value = JSON.stringify(editing.value.data || {}, null, 2)
  await refresh()
  await loadVersions(editing.value.id)
  notice.value = 'Wersja przywrócona jako szkic.'
}
function moveSection(index: number, delta: number) {
  if (!editing.value) return
  const target = index + delta
  if (target < 0 || target >= editing.value.sections.length) return
  const sections = editing.value.sections
  ;[sections[index], sections[target]] = [sections[target], sections[index]]
}
function addSection() {
  if (!editing.value) return
  editing.value.sections.push({ type: newSectionType.value, title: '', items: newSectionType.value === 'faq' ? [['', '']] : [] })
}
function addItem(section: any) {
  section.items ||= []
  section.items.push(section.type === 'faq' ? ['', ''] : '')
}
async function upload() {
  if (!uploadFile.value) return
  busy.value = true
  try {
    const body = new FormData()
    body.append('file', uploadFile.value)
    body.append('alt', uploadAlt.value)
    await $fetch('/api/admin/media', { method: 'POST', body, headers: { 'x-csrf-token': csrf.value } })
    files.value = await $fetch('/api/admin/media')
    uploadFile.value = null
    uploadAlt.value = ''
    notice.value = 'Plik przesłany.'
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : 'Nie udało się przesłać pliku.'
  } finally {
    busy.value = false
  }
}
async function updateMedia(item: MediaItem) {
  await mutate(`/api/admin/media/${item.id}`, 'PATCH', { alt: item.alt, caption: item.caption })
  notice.value = 'Metadane zapisane.'
}
async function removeMedia(item: MediaItem) {
  if (!confirm(`Usunąć plik „${item.name}”? Pliki używane w treści są chronione.`)) return
  try {
    await mutate(`/api/admin/media/${item.id}`, 'DELETE', { confirm: 'DELETE' })
    files.value = await $fetch('/api/admin/media')
    notice.value = 'Plik usunięty.'
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : 'Nie można usunąć używanego pliku.'
  }
}
async function logout() {
  await mutate('/api/admin/logout', 'POST', {})
  await navigateTo('/panel/login')
}
</script>

<template>
  <main class="mx-auto max-w-[1500px] px-4 pb-20 pt-6 md:px-8">
    <div v-if="loading" role="status" class="py-16 text-zinc-400">Ładowanie panelu…</div>
    <template v-else-if="session">
      <header class="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-800 pb-5">
        <div><p class="text-xs uppercase tracking-[.25em] text-sky-300">Makoto / CMS</p><h1 class="mt-2 font-serif text-4xl">Panel treści</h1></div>
        <div class="flex items-center gap-3"><NuxtLink to="/" class="text-sm text-zinc-400 hover:text-sky-300">Zobacz stronę ↗</NuxtLink><button class="rounded-lg border border-zinc-700 px-4 py-2 text-sm" @click="logout">Wyloguj</button></div>
      </header>
      <p v-if="notice" role="status" class="mt-5 rounded-lg border border-emerald-500/40 bg-emerald-950/30 p-3 text-emerald-200">{{ notice }}</p>
      <p v-if="error" role="alert" class="mt-5 rounded-lg border border-red-500/40 bg-red-950/30 p-3 text-red-200">{{ error }}</p>
      <nav aria-label="Sekcje panelu" class="mt-6 flex gap-2">
        <button type="button" :aria-current="tab === 'content' ? 'page' : undefined" class="panel-tab" @click="tab = 'content'">Treści</button>
        <button type="button" :aria-current="tab === 'media' ? 'page' : undefined" class="panel-tab" @click="tab = 'media'">Media</button>
        <button type="button" :aria-current="tab === 'security' ? 'page' : undefined" class="panel-tab" @click="tab = 'security'">Ochrona</button>
      </nav>

      <div v-if="tab === 'content'" class="mt-6 grid gap-6 lg:grid-cols-[20rem_1fr]">
        <aside class="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4">
          <div class="flex items-center justify-between gap-2"><h2 class="font-serif text-2xl">Wpisy</h2><button class="rounded-lg bg-sky-400 px-3 py-1.5 text-sm font-semibold text-zinc-950" @click="create()">Nowy</button></div>
          <label for="entry-kind" class="mt-5 block text-sm text-zinc-400">Typ treści</label>
          <select id="entry-kind" v-model="filter" class="panel-input mt-2"><option value="all">Wszystkie</option><option v-for="kind in contentKinds" :key="kind" :value="kind">{{ kind }}</option></select>
          <div class="mt-5 max-h-[70dvh] space-y-2 overflow-y-auto">
            <button v-for="entry in filtered" :key="entry.id" type="button" class="w-full rounded-xl border p-3 text-left transition hover:border-sky-400" :class="editing?.id === entry.id ? 'border-sky-400 bg-sky-950/20' : 'border-zinc-800 bg-zinc-950/50'" @click="select(entry)">
              <span class="text-xs uppercase tracking-wide text-sky-300">{{ entry.kind }} · {{ entry.locale }} · {{ entry.status }}</span>
              <span class="mt-1 block font-medium">{{ entry.title }}</span>
              <span class="mt-1 block truncate text-xs text-zinc-500">/{{ entry.slug }}</span>
            </button>
          </div>
        </aside>

        <section v-if="editing" ref="editorSection" class="min-w-0 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 md:p-8">
          <div class="flex flex-wrap items-start justify-between gap-4">
            <div><p class="text-xs uppercase tracking-[.2em] text-sky-300">{{ editing.id ? 'Edycja' : 'Nowa treść' }} · {{ editing.status }}</p><h2 class="mt-2 font-serif text-3xl">{{ editing.title || 'Bez tytułu' }}</h2></div>
            <div class="flex flex-wrap gap-2">
              <NuxtLink v-if="editing.id" :to="`/panel/preview/${editing.id}`" target="_blank" class="panel-button">Podgląd ↗</NuxtLink>
              <button class="panel-button" :disabled="busy" @click="save">Zapisz szkic</button>
              <button v-if="editing.id && editing.status !== 'published'" class="panel-button-primary" :disabled="busy" @click="changeStatus('published')">Publikuj</button>
              <button v-if="editing.id && editing.status === 'published'" class="panel-button" :disabled="busy" @click="changeStatus('draft')">Wycofaj</button>
            </div>
          </div>
          <div class="mt-8 grid gap-5 md:grid-cols-2">
            <div><label for="kind" class="panel-label">Typ</label><select id="kind" v-model="editing.kind" class="panel-input"><option v-for="kind in contentKinds" :key="kind" :value="kind">{{ kind }}</option></select></div>
            <div><label for="locale" class="panel-label">Język</label><select id="locale" v-model="editing.locale" class="panel-input"><option value="pl">Polski</option><option value="en">English</option></select></div>
            <div class="md:col-span-2"><label for="title" class="panel-label">Tytuł / H1</label><input id="title" v-model="editing.title" class="panel-input" maxlength="180"></div>
            <div><label for="slug" class="panel-label">Slug</label><input id="slug" v-model="editing.slug" class="panel-input" placeholder="przykladowy-adres"></div>
            <div><label for="group" class="panel-label">Grupa tłumaczeń</label><input id="group" v-model="editing.translationGroup" class="panel-input"></div>
            <div class="md:col-span-2"><label for="summary" class="panel-label">Wprowadzenie</label><textarea id="summary" v-model="editing.summary" class="panel-input min-h-24" maxlength="1000"></textarea></div>
            <div><label for="seo-title" class="panel-label">SEO title</label><input id="seo-title" v-model="editing.seoTitle" class="panel-input" maxlength="180"></div>
            <div><label for="seo-description" class="panel-label">SEO description</label><textarea id="seo-description" v-model="editing.seoDescription" class="panel-input min-h-24" maxlength="320"></textarea></div>
            <div class="md:col-span-2"><label for="cover" class="panel-label">Obraz główny</label><select id="cover" v-model="editing.coverMediaId" class="panel-input"><option :value="null">Brak</option><option v-for="file in files.filter(item => item.mime.startsWith('image/'))" :key="file.id" :value="file.id">{{ file.name }}</option></select></div>
          </div>

          <div class="mt-10 border-t border-zinc-800 pt-8">
            <h3 class="font-serif text-2xl">Treść redakcyjna</h3>
            <p class="mt-2 text-sm text-zinc-400">Nagłówek H1 jest tworzony z tytułu. W treści używaj H2–H6.</p>
            <ClientOnly><PanelEditor v-model="editing.body" :csrf="csrf" class="mt-5" /><template #fallback><p class="mt-5 text-zinc-400">Ładowanie edytora…</p></template></ClientOnly>
          </div>

          <div class="mt-10 border-t border-zinc-800 pt-8">
            <div class="flex flex-wrap items-center justify-between gap-3"><h3 class="font-serif text-2xl">Sekcje strukturalne</h3><div class="flex gap-2"><select v-model="newSectionType" class="panel-input"><option v-for="type in ['audience', 'scope', 'process', 'pricing', 'related', 'facts', 'locations', 'services', 'featured', 'note', 'faq']" :key="type">{{ type }}</option></select><button class="panel-button" @click="addSection">Dodaj</button></div></div>
            <div v-for="(section, index) in editing.sections" :key="index" class="mt-4 rounded-xl border border-zinc-700 bg-zinc-950/70 p-4">
              <div class="flex flex-wrap items-center justify-between gap-2"><span class="text-xs uppercase tracking-widest text-sky-300">{{ section.type }}</span><div class="flex gap-2"><button class="panel-button" @click="moveSection(index, -1)">↑</button><button class="panel-button" @click="moveSection(index, 1)">↓</button><button class="panel-button" @click="editing.sections.splice(index, 1)">Usuń</button></div></div>
              <label class="panel-label mt-4">Nagłówek sekcji<input v-model="section.title" class="panel-input"></label>
              <label v-if="section.type === 'note'" class="panel-label mt-3">Tekst<textarea v-model="section.text" class="panel-input min-h-24"></textarea></label>
              <template v-if="section.type === 'faq'">
                <div v-for="(item, itemIndex) in section.items" :key="itemIndex" class="mt-3 grid gap-2 md:grid-cols-[1fr_1fr_auto]">
                  <input v-model="item[0]" aria-label="Pytanie" class="panel-input" placeholder="Pytanie">
                  <input v-model="item[1]" aria-label="Odpowiedź" class="panel-input" placeholder="Odpowiedź">
                  <button class="panel-button" @click="section.items.splice(itemIndex, 1)">×</button>
                </div>
                <button class="panel-button mt-3" @click="addItem(section)">Dodaj pytanie</button>
              </template>
              <template v-else-if="section.type !== 'note'">
                <div v-for="(item, itemIndex) in section.items || section.slugs || []" :key="itemIndex" class="mt-3 flex gap-2">
                  <input v-if="section.items" v-model="section.items[itemIndex]" :aria-label="`Element ${Number(itemIndex) + 1}`" class="panel-input">
                  <input v-else v-model="section.slugs[itemIndex]" :aria-label="`Slug ${Number(itemIndex) + 1}`" class="panel-input">
                  <button class="panel-button" @click="(section.items || section.slugs).splice(itemIndex, 1)">×</button>
                </div>
                <button class="panel-button mt-3" @click="section.slugs ? section.slugs.push('') : addItem(section)">Dodaj element</button>
              </template>
            </div>
          </div>

          <details class="mt-10 border-t border-zinc-800 pt-6"><summary class="cursor-pointer text-sm text-zinc-400">Dodatkowe dane strukturalne (JSON)</summary><label for="entry-data" class="panel-label mt-4">Dane</label><textarea id="entry-data" v-model="dataJson" spellcheck="false" class="panel-input min-h-48 font-mono text-xs"></textarea></details>
          <div v-if="editing.id" class="mt-10 grid gap-8 border-t border-zinc-800 pt-8 md:grid-cols-2">
            <div><h3 class="font-serif text-2xl">Tłumaczenia</h3><button class="panel-button mt-4" @click="createTranslation">Dodaj drugą wersję językową</button><button v-for="item in counterparts" :key="item.id" class="mt-3 block text-sky-300 underline" @click="select(item)">{{ item.locale }}: {{ item.title }}</button></div>
            <div><h3 class="font-serif text-2xl">Historia wersji</h3><ul class="mt-4 space-y-2"><li v-for="version in revisions" :key="version.number" class="flex items-center justify-between text-sm"><span>Wersja {{ version.number }} · {{ new Date(version.createdAt).toLocaleString('pl') }}</span><button class="text-sky-300 underline" @click="restore(version.number)">Przywróć</button></li></ul></div>
          </div>
          <button v-if="editing.id" class="mt-12 text-sm text-red-300 underline" @click="removeEntry">Usuń treść</button>
        </section>
        <div v-else class="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-10 text-zinc-400">Wybierz wpis z listy lub utwórz nowy.</div>
      </div>

      <section v-else-if="tab === 'media'" class="mt-6">
        <div class="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
          <h2 class="font-serif text-3xl">Biblioteka mediów</h2>
          <p class="mt-2 text-sm text-zinc-400">JPG, PNG, WebP lub PDF do 10 MB. Obraz wymaga tekstu alternatywnego.</p>
          <div class="mt-5 grid gap-3 md:grid-cols-[1fr_1fr_auto]">
            <input type="file" accept="image/jpeg,image/png,image/webp,application/pdf" class="panel-input" @change="uploadFile = ($event.target as HTMLInputElement).files?.[0] || null">
            <input v-model="uploadAlt" class="panel-input" placeholder="Tekst alternatywny obrazu">
            <button class="panel-button-primary" :disabled="!uploadFile || busy" @click="upload">Prześlij</button>
          </div>
        </div>
        <div class="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div v-for="item in files" :key="item.id" class="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4">
            <div class="grid aspect-video place-items-center overflow-hidden rounded-lg bg-zinc-950"><img v-if="item.mime.startsWith('image/')" :src="`/api/media/${item.id}`" :alt="item.alt" class="size-full object-contain"><span v-else class="text-zinc-400">PDF</span></div>
            <p class="mt-3 truncate text-sm font-medium">{{ item.name }}</p>
            <p class="mt-1 text-xs text-zinc-500">{{ Math.round(item.bytes / 1024) }} KB · {{ item.published ? 'publiczny' : 'prywatny' }}</p>
            <label class="panel-label mt-3">Alt<input v-model="item.alt" class="panel-input"></label>
            <label class="panel-label mt-3">Podpis<input v-model="item.caption" class="panel-input"></label>
            <div class="mt-4 flex gap-2"><button class="panel-button" @click="updateMedia(item)">Zapisz</button><button class="panel-button text-red-300" @click="removeMedia(item)">Usuń</button></div>
          </div>
        </div>
      </section>
      <PanelSecurity v-else :csrf="csrf" class="mt-6" />
    </template>
  </main>
</template>

<style scoped>
.panel-label { display: block; color: #a1a1aa; font-size: .82rem; margin-bottom: .4rem; }
.panel-input { display: block; width: 100%; border: 1px solid #52525b; border-radius: .55rem; background: #09090b; padding: .65rem .8rem; color: #f4f4f5; }
.panel-input:focus { outline: 2px solid #38bdf8; }
.panel-button, .panel-tab { border: 1px solid #52525b; border-radius: .55rem; padding: .55rem .8rem; font-size: .82rem; color: #f4f4f5; }
.panel-button:hover, .panel-tab:hover { border-color: #38bdf8; }
.panel-tab[aria-current="page"] { border-color: #38bdf8; color: #7dd3fc; }
.panel-button-primary { border-radius: .55rem; background: #38bdf8; padding: .55rem .9rem; font-weight: 600; color: #09090b; }
button:focus-visible { outline: 2px solid #7dd3fc; outline-offset: 2px; }
</style>
