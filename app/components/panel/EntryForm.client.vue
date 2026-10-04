<script setup lang="ts">
import { onBeforeRouteLeave } from 'vue-router'
import { contentPath, safeHref, type Locale } from '#shared/content'
import { controlledDataKeys, copyEntry, emptyEntry, entrySlug, panelError, type AdminEntry, type EntryReference, type MediaItem, type panelSections } from '#shared/panel'
const props = defineProps<{ section: typeof panelSections[number]; entries: AdminEntry[]; entryId: string; csrf: string }>()
const language = useState<Locale>('panel-language', () => 'pl')
const anchor = props.entries.find(entry => entry.id === props.entryId)
const group = anchor?.translationGroup || crypto.randomUUID()
const drafts = reactive<Partial<Record<Locale, AdminEntry>>>({})
const baselines = reactive<Partial<Record<Locale, string>>>({})
const empty = (locale: Locale) => emptyEntry(props.section.kind, locale, group)
for (const lang of ['pl', 'en'] as const) {
  const entry = props.entries.find(item => item.kind === props.section.kind && item.translationGroup === group && item.locale === lang && item.status !== 'deleted')
  drafts[lang] = entry ? copyEntry(entry) : empty(lang)
  baselines[lang] = JSON.stringify(drafts[lang])
}
const editing = computed(() => drafts[language.value]!)
const changed = (lang: Locale) => JSON.stringify(drafts[lang]) !== baselines[lang]
const dirty = computed(() => changed('pl') || changed('en'))
const error = ref('')
const notice = ref('')
const busy = ref(false)
const coverOpen = ref(false)
const revisions = ref<{ number: number; createdAt: string }[]>([])
const files = ref<MediaItem[]>([])
const references = ref<EntryReference[]>([])
const advancedData = ref(false)
const dataJson = ref('')
const coverKey = computed(() => props.section.kind === 'article' ? 'cover' : props.section.kind === 'author' ? 'avatar' : props.section.kind === 'page' && editing.value.slug === 'links' ? 'picture' : 'image')
const reservedDataKeys = computed(() => controlledDataKeys(editing.value.kind, editing.value.slug))
const additionalData = computed(() => Object.fromEntries(Object.entries(editing.value.data).filter(([key]) => !reservedDataKeys.value.has(key))))
const cover = computed(() => {
  const legacy = editing.value.data[coverKey.value]
  const id = editing.value.coverMediaId || String(legacy?.url || '').match(/\/api\/media\/([0-9a-f-]{36})/)?.[1]
  return files.value.find(file => file.id === id || (id && file.aliases?.includes(id))) || (id ? { id, name: legacy?.name || 'Obraz główny', alt: legacy?.alternativeText || editing.value.title } : null)
})
onMounted(async () => {
  try {
    await Promise.all([
      $fetch<MediaItem[]>('/api/admin/media').then(value => { files.value = value }),
      $fetch<EntryReference[]>('/api/admin/entries', { query: { compact: true } }).then(value => { references.value = value })
    ])
  } catch (cause) { error.value = panelError(cause) }
})
watch(() => editing.value.id, async id => {
  revisions.value = []
  if (!id) return
  try {
    const list = await $fetch<{ number: number; createdAt: string }[]>(`/api/admin/entries/${id}/versions`)
    if (editing.value.id === id) revisions.value = list
  } catch (cause) { error.value = panelError(cause) }
}, { immediate: true })
watch(language, () => { notice.value = ''; error.value = ''; advancedData.value = false })
function titleInput(event: Event) {
  const title = (event.target as HTMLInputElement).value
  if (!editing.value.id && (!editing.value.slug || editing.value.slug === entrySlug(editing.value.title))) editing.value.slug = entrySlug(title)
  editing.value.title = title
}
function setCover(file: MediaItem) {
  files.value = [file, ...files.value.filter(item => item.id !== file.id)]
  editing.value.coverMediaId = file.id
  editing.value.data[coverKey.value] = { url: `/api/media/${file.id}`, alternativeText: file.alt, name: file.name, width: file.width, height: file.height }
}
function clearCover() {
  editing.value.coverMediaId = null
  delete editing.value.data[coverKey.value]
}
async function mutate<T>(url: string, method: 'POST' | 'PUT' | 'DELETE', body: unknown) {
  return await $fetch(url, { method, body: body as Record<string, unknown>, headers: { 'x-csrf-token': props.csrf } }) as T
}
async function save() {
  const lang = language.value
  const current = drafts[lang]!
  if (!current.title.trim() || !current.slug.trim()) { error.value = 'Uzupełnij tytuł i adres wpisu.'; return false }
  if (current.title.length < 2 || !/^[a-z0-9]+(?:-[a-z0-9]+)*(?:\/[a-z0-9]+(?:-[a-z0-9]+)*)?$/.test(current.slug)) { error.value = 'Tytuł musi mieć co najmniej 2 znaki. Adres może zawierać małe litery, cyfry i myślniki.'; return false }
  if (current.kind === 'project') {
    if (current.data.externalUrl && !safeHref(current.data.externalUrl)) { error.value = 'Podaj poprawny adres strony projektu.'; return false }
    if (Array.isArray(current.data.stack) && current.data.stack.some(item => !(typeof item === 'string' ? item : item?.name)?.trim())) { error.value = 'Uzupełnij nazwę każdej technologii albo usuń pusty element.'; return false }
  }
  if (current.kind === 'page' && ['about', 'links'].includes(current.slug)) {
    for (const key of ['links', 'primarylinks']) if (Array.isArray(current.data[key]) && current.data[key].some(item => !item?.name?.trim() || !safeHref(item?.link))) { error.value = 'Uzupełnij nazwę i poprawny adres każdego linku albo usuń pusty element.'; return false }
  }
  for (const section of current.sections) if (Array.isArray(section.slugs) && section.slugs.some((slug: string) => !slug)) { error.value = 'Wybierz treść w każdej pozycji sekcji albo usuń pusty element.'; return false }
  busy.value = true; error.value = ''
  try {
    const saved = await mutate<AdminEntry>(current.id ? `/api/admin/entries/${current.id}` : '/api/admin/entries', current.id ? 'PUT' : 'POST', current)
    drafts[lang] = saved; baselines[lang] = JSON.stringify(saved)
    revisions.value = await $fetch(`/api/admin/entries/${saved.id}/versions`)
    notice.value = `Zapisano ${lang.toUpperCase()}${saved.status === 'published' ? ' — zmiany są już widoczne na stronie.' : ' jako szkic.'}`
    if (props.entryId === 'nowy') await navigateTo(`/panel/${props.section.slug}/${saved.id}`, { replace: true })
    // Keep both in-memory language drafts until the user explicitly leaves the editor.
    return true
  } catch (cause) { error.value = panelError(cause); return false }
  finally { busy.value = false }
}
async function changeStatus(status: 'draft' | 'published') {
  if ((!editing.value.id || changed(language.value)) && !await save()) return
  busy.value = true; error.value = ''
  try {
    const saved = await mutate<AdminEntry>(`/api/admin/entries/${editing.value.id}/status`, 'POST', { status })
    drafts[language.value] = saved; baselines[language.value] = JSON.stringify(saved)
    revisions.value = await $fetch(`/api/admin/entries/${saved.id}/versions`)
    notice.value = status === 'published' ? `Opublikowano wersję ${language.value.toUpperCase()}.` : 'Wersja wycofana do szkiców.'
  } catch (cause) { error.value = panelError(cause) }
  finally { busy.value = false }
}
async function restore(number: number) {
  if (!confirm(`Przywrócić wersję ${number} jako szkic? Bieżące niezapisane zmiany w tym języku zostaną zastąpione.`)) return
  busy.value = true; error.value = ''
  try {
    const saved = await mutate<AdminEntry>(`/api/admin/entries/${editing.value.id}/restore`, 'POST', { number })
    drafts[language.value] = saved; baselines[language.value] = JSON.stringify(saved)
    revisions.value = await $fetch(`/api/admin/entries/${saved.id}/versions`)
    notice.value = 'Wersja przywrócona jako szkic.'
  } catch (cause) { error.value = panelError(cause) }
  finally { busy.value = false }
}
async function remove() {
  if (!confirm(`Usunąć wersję ${language.value.toUpperCase()} „${editing.value.title}”? Druga wersja językowa pozostanie.`)) return
  busy.value = true
  try {
    await mutate(`/api/admin/entries/${editing.value.id}`, 'DELETE', { confirm: 'DELETE' })
    drafts[language.value] = empty(language.value); baselines[language.value] = JSON.stringify(editing.value)
    notice.value = 'Wersja językowa usunięta.'
  } catch (cause) { error.value = panelError(cause) }
  finally { busy.value = false }
}
function applyData() {
  try {
    const parsed = JSON.parse(dataJson.value)
    if (!parsed || Array.isArray(parsed) || typeof parsed !== 'object') throw new Error()
    if (Object.keys(parsed).some(key => reservedDataKeys.value.has(key) || ['__proto__', 'constructor', 'prototype'].includes(key))) { error.value = 'Te pola mają własne formularze. Edytuj je w odpowiedniej sekcji powyżej.'; return }
    for (const key of Object.keys(additionalData.value)) delete editing.value.data[key]
    Object.assign(editing.value.data, parsed)
    advancedData.value = false
  } catch { error.value = 'Dodatkowe dane muszą być poprawnym obiektem JSON.' }
}
onBeforeRouteLeave(() => !busy.value && (!dirty.value || confirm('Masz niezapisane zmiany. Opuścić edytor?')))
function beforeUnload(event: BeforeUnloadEvent) { if (dirty.value) { event.preventDefault(); event.returnValue = '' } }
onMounted(() => window.addEventListener('beforeunload', beforeUnload))
onBeforeUnmount(() => window.removeEventListener('beforeunload', beforeUnload))
</script>
<template>
  <div>
    <NuxtLink :to="`/panel/${section.slug}`" class="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-sky-300"><UIcon name="i-mkt-arrow-left" class="size-4 shrink-0" aria-hidden="true" />{{ section.label }}</NuxtLink>
    <header class="sticky top-0 z-20 -mx-1 mt-4 flex flex-wrap items-center justify-between gap-4 border-b border-[#30343a] bg-[#101216]/95 px-1 py-4 backdrop-blur">
      <div><h1 class="font-serif text-3xl">{{ drafts.pl?.id || drafts.en?.id ? 'Edycja treści' : 'Nowa treść' }}</h1><p class="mt-1 text-xs text-zinc-400">{{ editing.status === 'published' ? 'Opublikowany' : 'Szkic' }} · {{ changed(language) ? 'Niezapisane zmiany' : editing.id ? 'Zapisano' : 'Jeszcze niezapisany' }}</p></div>
      <div class="flex flex-wrap items-center gap-3">
        <div class="panel-language" role="group" aria-label="Język wpisu"><button v-for="lang in (['pl', 'en'] as const)" :key="lang" :aria-pressed="language === lang" :disabled="busy" @click="language = lang">{{ lang.toUpperCase() }}{{ changed(lang) ? ' •' : '' }}</button></div>
        <button class="panel-button-primary" :disabled="busy" @click="save">{{ busy ? 'Zapisywanie…' : `Zapisz ${language.toUpperCase()}` }}</button>
      </div>
    </header>
    <p v-if="error" role="alert" class="panel-message panel-error mt-5">{{ error }}</p><p v-if="notice" role="status" class="panel-message mt-5">{{ notice }}</p>
    <p v-if="!editing.id && (drafts.pl?.id || drafts.en?.id)" class="mt-5 rounded-lg border border-sky-900 bg-sky-950/20 p-4 text-sm text-sky-200">Ta treść nie ma jeszcze wersji {{ language === 'pl' ? 'polskiej' : 'angielskiej' }}. Uzupełnij ją i zapisz — pojawi się pod tą samą pozycją na liście.</p>
    <div class="mt-6 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_260px] 2xl:grid-cols-[minmax(0,1fr)_290px]">
      <div class="min-w-0 space-y-6">
        <section class="panel-card space-y-5 p-5 md:p-6">
          <label class="panel-label">Tytuł<input :value="editing.title" class="panel-input mt-2 text-lg" maxlength="180" placeholder="Nadaj tytuł…" @input="titleInput"></label>
          <label class="panel-label">Adres wpisu<input v-model="editing.slug" class="panel-input mt-2" maxlength="160" placeholder="przykladowy-adres"><span class="mt-2 block break-all text-xs text-zinc-500">{{ contentPath(editing) }}</span></label>
          <label class="panel-label">Wprowadzenie<textarea v-model="editing.summary" class="panel-input mt-2" rows="3" maxlength="1000" placeholder="Krótki opis widoczny przed treścią…"></textarea></label>
        </section>
        <PanelTemplateFields :key="language" v-model="editing.data" :kind="section.kind" :slug="editing.slug" :title="editing.title" :locale="language" :entries="references" :disabled="busy" />
        <section class="panel-card min-w-0 p-5 md:p-6"><h2 class="mb-4 font-serif text-2xl">Treść</h2><PanelEditor :key="language" v-model="editing.body" :csrf="csrf" /></section>
        <PanelSections v-if="editing.sections.length || ['page', 'home', 'service', 'location'].includes(section.kind)" v-model="editing.sections" :entries="references" :locale="language" :disabled="busy" />
        <details class="panel-card p-5"><summary class="cursor-pointer text-sm text-zinc-400">Ustawienia wyszukiwarki (SEO)</summary><div class="mt-5 space-y-4"><label class="panel-label">Tytuł w wyszukiwarce<input v-model="editing.seoTitle" class="panel-input mt-2" :placeholder="editing.title" maxlength="180"></label><label class="panel-label">Opis w wyszukiwarce<textarea v-model="editing.seoDescription" class="panel-input mt-2" rows="3" :placeholder="editing.summary" maxlength="320"></textarea></label></div></details>
        <details v-if="Object.keys(additionalData).length || advancedData" class="panel-card p-5"><summary class="cursor-pointer text-sm text-zinc-500">Pozostałe pola techniczne (opcjonalnie)</summary><p class="mt-4 text-xs leading-relaxed text-zinc-400">Dodatkowe dane niestandardowych szablonów. Technologie, kolor, linki i pozostałe ustawienia edytujesz w formularzach powyżej. Ten zapis JSON nie jest potrzebny do zwykłej edycji treści.</p><button v-if="!advancedData" class="panel-button mt-4" @click="dataJson = JSON.stringify(additionalData, null, 2); advancedData = true">Edytuj dodatkowe pola JSON</button><template v-else><textarea v-model="dataJson" aria-label="Dodatkowe pola techniczne JSON" class="panel-input mt-4 min-h-64 font-mono text-xs" spellcheck="false"></textarea><button class="panel-button mt-3" @click="applyData">Zastosuj dodatkowe pola</button></template></details>
      </div>
      <aside class="space-y-5">
        <section class="panel-card p-5"><h2 class="font-medium">Publikacja · {{ language.toUpperCase() }}</h2><p class="mt-2 text-xs leading-relaxed text-zinc-400">{{ editing.status === 'published' ? 'Zapisywane zmiany są od razu widoczne na stronie.' : 'Szkic jest widoczny tylko w panelu, dopóki go nie opublikujesz.' }}</p><div class="mt-4 flex flex-col gap-2"><button v-if="editing.status !== 'published'" class="panel-button" :disabled="busy" @click="changeStatus('published')">Opublikuj {{ language.toUpperCase() }}</button><button v-else class="panel-button" :disabled="busy" @click="changeStatus('draft')">Wycofaj do szkiców</button><NuxtLink v-if="editing.id" :to="`/panel/preview/${editing.id}`" target="_blank" class="panel-button">Podgląd zapisanej wersji <UIcon name="i-mkt-arrow-up-right" class="size-4 shrink-0" aria-hidden="true" /></NuxtLink></div></section>
        <section v-if="!['category', 'work'].includes(section.kind)" class="panel-card p-5"><h2 class="font-medium">Obraz główny</h2><button class="mt-4 block w-full overflow-hidden rounded-lg border border-dashed border-[#424750] hover:border-sky-400" aria-label="Wybierz obraz główny" @click="coverOpen = true"><img v-if="cover" :src="`/api/media/${cover.id}?size=medium`" :alt="cover.alt || cover.name" class="aspect-[16/10] w-full bg-black/30 object-contain"><span v-else class="flex aspect-[16/10] flex-col items-center justify-center gap-2 text-sm text-zinc-400"><UIcon name="i-mkt-image" class="size-8 text-sky-300" aria-hidden="true" />Wybierz z mediów</span></button><p v-if="cover" class="mt-2 truncate text-xs text-zinc-400">{{ cover.name }}</p><div class="mt-3 flex flex-wrap gap-3"><button class="text-sm text-sky-300" @click="coverOpen = true">{{ cover ? 'Zmień obraz' : 'Otwórz bibliotekę' }}</button><button v-if="cover" class="text-sm text-zinc-400" @click="clearCover">Usuń obraz</button></div></section>
        <details v-if="revisions.length" class="panel-card p-5"><summary class="cursor-pointer text-sm">Historia wersji · {{ language.toUpperCase() }}</summary><ul class="mt-4 space-y-4"><li v-for="version in revisions" :key="version.number" class="text-xs"><p class="text-zinc-400">{{ new Date(version.createdAt).toLocaleString('pl') }}</p><button class="mt-1 text-sky-300 underline" :disabled="busy" @click="restore(version.number)">Przywróć wersję {{ version.number }}</button></li></ul></details>
        <button v-if="editing.id" class="text-sm text-red-300 underline" :disabled="busy" @click="remove">Usuń wersję {{ language.toUpperCase() }}</button>
      </aside>
    </div>
    <PanelMediaPicker v-model:open="coverOpen" :csrf="csrf" images-only :selected-id="cover?.id" @select="setCover" />
  </div>
</template>
