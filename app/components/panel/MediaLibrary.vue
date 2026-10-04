<script setup lang="ts">
import { panelError, type MediaItem } from '#shared/panel'
const props = withDefaults(defineProps<{ csrf: string; picker?: boolean; imagesOnly?: boolean; selectedId?: string | null }>(), { picker: false, imagesOnly: false })
const emit = defineEmits<{ select: [file: MediaItem] }>()
const files = ref<MediaItem[]>([])
const loading = ref(true)
const error = ref('')
const notice = ref('')
const search = ref('')
const type = ref('all')
const selected = ref<MediaItem | null>(null)
const details = ref<HTMLElement | null>(null)
const uploadOpen = ref(false)
const uploadFile = ref<File | null>(null)
const uploadAlt = ref('')
const uploadPreview = ref('')
const busy = ref(false)
const copied = ref(false)
const list = computed(() => files.value.filter(file => (!props.imagesOnly || file.mime.startsWith('image/')) && (type.value === 'all' || (type.value === 'images' ? file.mime.startsWith('image/') : file.mime === 'application/pdf')) && `${file.name} ${file.alt}`.toLocaleLowerCase().includes(search.value.toLocaleLowerCase())))
async function refresh() {
  loading.value = true
  try { files.value = await $fetch('/api/admin/media') }
  catch (cause) { error.value = panelError(cause) }
  finally { loading.value = false }
}
onMounted(refresh)
watch(uploadFile, file => {
  if (uploadPreview.value) URL.revokeObjectURL(uploadPreview.value)
  uploadPreview.value = file?.type.startsWith('image/') ? URL.createObjectURL(file) : ''
})
onBeforeUnmount(() => { if (uploadPreview.value) URL.revokeObjectURL(uploadPreview.value) })
async function choose(file: MediaItem) {
  selected.value = { ...file }; copied.value = false; error.value = ''; notice.value = ''
  await nextTick()
  if (window.innerWidth < 1024) details.value?.scrollIntoView({ block: 'start' })
}
async function upload() {
  if (!uploadFile.value) return
  busy.value = true; error.value = ''
  try {
    const form = new FormData()
    form.append('file', uploadFile.value); form.append('alt', uploadAlt.value)
    const file = await $fetch<MediaItem>('/api/admin/media', { method: 'POST', body: form, headers: { 'x-csrf-token': props.csrf } })
    await refresh(); choose(file); uploadFile.value = null; uploadAlt.value = ''; uploadOpen.value = false
    notice.value = 'Plik dodany do biblioteki.'
  } catch (cause) { error.value = panelError(cause) }
  finally { busy.value = false }
}
async function saveMetadata() {
  if (!selected.value) return false
  busy.value = true; error.value = ''
  try {
    await $fetch(`/api/admin/media/${selected.value.id}`, { method: 'PATCH', body: { alt: selected.value.alt, caption: selected.value.caption }, headers: { 'x-csrf-token': props.csrf } })
    await refresh(); notice.value = 'Opis zdjęcia zapisany.'; return true
  } catch (cause) { error.value = panelError(cause); return false }
  finally { busy.value = false }
}
async function useSelected() {
  if (!selected.value) return
  if (selected.value.mime.startsWith('image/') && !selected.value.alt.trim()) { error.value = 'Opisz krótko obraz przed wstawieniem.'; return }
  const original = files.value.find(file => file.id === selected.value!.id)
  if ((original?.alt !== selected.value.alt || original?.caption !== selected.value.caption) && !await saveMetadata()) return
  emit('select', selected.value)
}
async function remove() {
  if (!selected.value || !confirm(`Usunąć plik „${selected.value.name}”?`)) return
  busy.value = true; error.value = ''
  try {
    await $fetch(`/api/admin/media/${selected.value.id}`, { method: 'DELETE', body: { confirm: 'DELETE' }, headers: { 'x-csrf-token': props.csrf } })
    selected.value = null; await refresh(); notice.value = 'Plik usunięty.'
  } catch (cause: any) { error.value = cause?.statusCode === 409 ? 'Ten plik jest używany w treści. Najpierw usuń jego odwołania.' : panelError(cause) }
  finally { busy.value = false }
}
async function copyUrl() {
  if (!selected.value) return
  try { await navigator.clipboard.writeText(`${window.location.origin}/api/media/${selected.value.id}`); copied.value = true }
  catch { error.value = 'Nie udało się skopiować adresu. Skopiuj go z pola poniżej.' }
}
const bytesLabel = (bytes: number) => bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.round(bytes / 1024)} KB`
</script>
<template>
  <div class="cms">
    <div class="flex flex-wrap items-end gap-3">
      <div class="min-w-40 flex-1"><label for="media-search" class="panel-label">Szukaj mediów</label><input id="media-search" v-model="search" type="search" class="panel-input" placeholder="Nazwa lub opis obrazu…"></div>
      <div v-if="!imagesOnly"><label for="media-type" class="panel-label">Typ</label><select id="media-type" v-model="type" class="panel-input"><option value="all">Wszystkie</option><option value="images">Obrazy</option><option value="pdf">Dokumenty PDF</option></select></div>
      <button class="panel-button" :aria-expanded="uploadOpen" @click="uploadOpen = !uploadOpen">+ Prześlij plik</button>
    </div>
    <form v-if="uploadOpen" class="panel-card mt-4 space-y-4 p-4" @submit.prevent="upload">
      <p class="text-sm text-zinc-400">JPG, PNG, WebP{{ imagesOnly ? '' : ' lub PDF' }} · do 10 MB. Wystarczy przesłać oryginał.</p>
      <label class="panel-label">Plik<input type="file" :accept="imagesOnly ? 'image/jpeg,image/png,image/webp' : 'image/jpeg,image/png,image/webp,application/pdf'" class="panel-input mt-2" required @change="uploadFile = ($event.target as HTMLInputElement).files?.[0] || null"></label>
      <img v-if="uploadPreview" :src="uploadPreview" alt="Podgląd przesyłanego obrazu" class="max-h-40 max-w-full rounded object-contain">
      <label v-if="uploadFile?.type.startsWith('image/')" class="panel-label">Opis obrazu (tekst alternatywny)<input v-model="uploadAlt" class="panel-input mt-2" placeholder="Co przedstawia zdjęcie?" maxlength="500" required></label>
      <button class="panel-button-primary" :disabled="!uploadFile || busy">{{ busy ? 'Przesyłanie…' : 'Dodaj do biblioteki' }}</button>
    </form>
    <p v-if="error" role="alert" class="panel-message panel-error mt-4">{{ error }}</p>
    <p v-if="notice" role="status" class="panel-message mt-4">{{ notice }}</p>
    <div class="mt-5 grid items-start gap-5" :class="selected ? 'lg:grid-cols-[minmax(0,1fr)_280px]' : ''">
      <div>
        <p v-if="loading" role="status" class="py-8 text-zinc-400">Ładowanie mediów…</p>
        <div v-else class="grid grid-cols-2 gap-3" :class="selected ? 'sm:grid-cols-3' : 'sm:grid-cols-3 xl:grid-cols-4'">
          <button v-for="file in list" :key="file.id" class="min-w-0 overflow-hidden rounded-lg border bg-[#101216] text-left hover:border-sky-300" :class="selected?.id === file.id || selectedId === file.id ? 'border-sky-400 ring-1 ring-sky-400' : 'border-[#30343a]'" :aria-label="`Wybierz ${file.name}`" :aria-pressed="selected?.id === file.id" @click="choose(file)">
            <span class="grid aspect-[4/3] place-items-center overflow-hidden bg-[#080b10] p-2"><img v-if="file.mime.startsWith('image/')" :src="`/api/media/${file.id}?size=small`" :alt="file.alt || file.name" loading="lazy" class="size-full object-contain"><span v-else class="font-serif text-4xl text-zinc-400">PDF</span></span>
            <span class="block p-3"><span class="block truncate text-sm">{{ file.name }}</span><span class="mt-1 block text-xs text-zinc-500">{{ file.width && file.height ? `${file.width} × ${file.height} · ` : '' }}{{ bytesLabel(file.bytes) }}</span></span>
          </button>
        </div>
        <p v-if="!loading && !list.length" class="py-10 text-center text-sm text-zinc-400">{{ search ? 'Nie znaleziono mediów.' : 'Biblioteka jest pusta. Prześlij pierwszy plik.' }}</p>
        <p class="mt-4 text-xs text-zinc-500">Pliki: {{ list.length }} · rozmiary obrazów powstają automatycznie</p>
      </div>
      <aside v-if="selected" ref="details" class="panel-card order-first space-y-4 p-4 lg:sticky lg:top-0 lg:order-last" aria-label="Szczegóły pliku">
        <div class="flex items-start justify-between gap-3"><h3 class="min-w-0 break-words font-medium">{{ selected.name }}</h3><button class="shrink-0 text-zinc-400" aria-label="Zamknij szczegóły" @click="selected = null">✕</button></div>
        <img v-if="selected.mime.startsWith('image/')" :src="`/api/media/${selected.id}?size=medium`" :alt="selected.alt || selected.name" class="max-h-48 w-full rounded bg-black/30 object-contain">
        <p class="text-xs text-zinc-400">{{ bytesLabel(selected.bytes) }} · Odwołania w treści: {{ selected.uses || 0 }}</p>
        <label v-if="selected.mime.startsWith('image/')" class="panel-label">Opis obrazu (tekst alternatywny)<textarea v-model="selected.alt" class="panel-input mt-2" rows="2" maxlength="500" placeholder="Co przedstawia obraz?"></textarea></label>
        <label class="panel-label">Podpis<input v-model="selected.caption" class="panel-input mt-2" maxlength="1000"></label>
        <template v-if="picker"><button class="panel-button-primary w-full" :disabled="busy" @click="useSelected">Wybierz plik</button></template>
        <template v-else>
          <button class="panel-button-primary w-full" :disabled="busy" @click="saveMetadata">Zapisz opis</button>
          <label class="panel-label">Adres oryginału<input :value="`/api/media/${selected.id}`" readonly class="panel-input mt-2 text-xs"></label>
          <button class="panel-button w-full" @click="copyUrl">{{ copied ? 'Skopiowano' : 'Kopiuj adres' }}</button>
          <p v-if="selected.mime.startsWith('image/')" class="break-words text-xs leading-relaxed text-zinc-400">Dopisz do adresu <code>?size=small</code>, <code>?size=medium</code> lub <code>?size=big</code>. Bez parametru otrzymasz oryginał.</p>
          <button class="text-sm text-red-300 underline" :disabled="busy || !!selected.uses" @click="remove">Usuń plik</button>
        </template>
      </aside>
    </div>
  </div>
</template>
