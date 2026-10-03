<script setup lang="ts">
const props = defineProps<{ csrf: string }>()
const enabled = ref<boolean | null>(null)
const busy = ref(false)
const password = ref('')
const code = ref('')
const mode = ref<'start' | 'disable' | null>(null)
const enrollment = ref<{ qr: string; expiresAt: string } | null>(null)
const error = ref('')
const notice = ref('')
const development = import.meta.dev
onMounted(async () => {
  try { enabled.value = (await $fetch<{ enabled: boolean }>('/api/admin/security')).enabled }
  catch { error.value = 'Nie udało się pobrać ustawień ochrony. Odśwież stronę.' }
})
async function change(action: 'start' | 'confirm' | 'disable' | 'cancel') {
  if (busy.value) return
  busy.value = true
  error.value = ''
  notice.value = ''
  try {
    const result = await $fetch<{ enabled: boolean; qr?: string; expiresAt?: string }>('/api/admin/security', {
      method: 'POST', headers: { 'x-csrf-token': props.csrf },
      body: { action, ...(['start', 'disable'].includes(action) ? { password: password.value } : {}), ...(action === 'confirm' ? { code: code.value.replace(/\s/g, '') } : {}) }
    })
    enabled.value = result.enabled
    enrollment.value = result.qr && result.expiresAt ? { qr: result.qr, expiresAt: result.expiresAt } : null
    password.value = ''
    code.value = ''
    mode.value = null
    if (action === 'confirm') notice.value = '2FA włączone. Przy kolejnym logowaniu podasz również kod z aplikacji.'
    if (action === 'disable') notice.value = '2FA wyłączone. Logowanie nadal jest chronione hasłem i Turnstile.'
  } catch (cause: any) {
    error.value = cause?.data?.message || 'Nie udało się zmienić ustawień. Spróbuj ponownie.'
  } finally { busy.value = false }
}
</script>

<template>
  <section class="max-w-3xl space-y-6" aria-labelledby="security-heading">
    <div class="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 sm:p-8">
      <h2 id="security-heading" class="font-serif text-3xl">Ochrona</h2>
      <p class="mt-2 text-sm leading-relaxed text-zinc-400">Zarządzaj dodatkowym zabezpieczeniem swojego konta.</p>
      <p v-if="notice" role="status" class="mt-5 rounded-lg border border-emerald-500/40 bg-emerald-950/30 p-3 text-sm text-emerald-200">{{ notice }}</p>
      <p v-if="error" role="alert" class="mt-5 rounded-lg border border-red-500/40 bg-red-950/30 p-3 text-sm text-red-200">{{ error }}</p>
      <div class="mt-8 flex flex-wrap items-center justify-between gap-3">
        <h3 class="text-lg font-semibold">Uwierzytelnianie dwuskładnikowe (2FA)</h3>
        <span v-if="enabled !== null" class="rounded-full border px-3 py-1 text-xs" :class="enabled ? 'border-emerald-500/40 text-emerald-300' : 'border-zinc-600 text-zinc-300'">{{ enabled ? 'Włączone' : 'Wyłączone' }}</span>
      </div>
      <p class="mt-3 text-sm leading-relaxed text-zinc-400">Po włączeniu 2FA oprócz hasła potrzebny będzie jednorazowy kod z aplikacji, np. Google Authenticator lub Microsoft Authenticator.</p>
      <p v-if="enabled === null && !error" role="status" class="mt-5 text-sm text-zinc-400">Ładowanie ustawień…</p>
      <button v-else-if="enabled !== null && !mode && !enrollment" class="security-button mt-5" @click="mode = enabled ? 'disable' : 'start'; notice = ''; error = ''">{{ enabled ? 'Wyłącz 2FA' : 'Włącz 2FA' }}</button>

      <form v-if="mode" class="mt-6 max-w-sm space-y-4" @submit.prevent="change(mode!)">
        <p class="text-sm text-zinc-300">{{ mode === 'start' ? 'Potwierdź hasło, aby wygenerować kod QR.' : 'Potwierdź hasło, aby wyłączyć 2FA. Pozostałe sesje zostaną wylogowane.' }}</p>
        <label for="security-password" class="block text-sm">Aktualne hasło</label>
        <input id="security-password" v-model="password" type="password" autocomplete="current-password" required class="security-input">
        <div class="flex flex-wrap gap-3">
          <button type="submit" class="security-button" :disabled="busy">{{ busy ? 'Zapisywanie…' : mode === 'start' ? 'Pokaż kod QR' : 'Potwierdź wyłączenie' }}</button>
          <button type="button" class="text-sm text-zinc-400" :disabled="busy" @click="mode = null; password = ''">Anuluj</button>
        </div>
      </form>

      <form v-if="enrollment" class="mt-6 space-y-5" @submit.prevent="change('confirm')">
        <p class="text-sm leading-relaxed">Zeskanuj kod w aplikacji uwierzytelniającej, a następnie wpisz wygenerowany kod sześciocyfrowy.</p>
        <img :src="enrollment.qr" alt="Kod QR do dodania konta Makoto w aplikacji uwierzytelniającej" width="320" height="320" class="aspect-square h-auto w-full max-w-80 rounded-xl bg-white">
        <p class="text-xs text-zinc-400">Kod QR jest ważny do {{ new Date(enrollment.expiresAt).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' }) }}. 2FA zostanie włączone po potwierdzeniu.</p>
        <div class="max-w-sm space-y-3">
          <label for="security-code" class="block text-sm">Kod z aplikacji</label>
          <input id="security-code" v-model="code" inputmode="numeric" autocomplete="one-time-code" pattern="[0-9 ]{6,7}" maxlength="7" required class="security-input tracking-[.3em]">
          <div class="flex flex-wrap gap-3">
            <button type="submit" class="security-button" :disabled="busy">{{ busy ? 'Sprawdzanie…' : 'Potwierdź i włącz 2FA' }}</button>
            <button type="button" class="text-sm text-zinc-400" :disabled="busy" @click="change('cancel')">Anuluj konfigurację</button>
          </div>
        </div>
      </form>
    </div>
    <div class="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 sm:p-8">
      <div class="flex flex-wrap items-center justify-between gap-3"><h3 class="text-lg font-semibold">Cloudflare Turnstile</h3><span class="text-xs text-sky-300">Ochrona logowania</span></div>
      <p class="mt-3 text-sm leading-relaxed text-zinc-400">Każda próba logowania wymaga weryfikacji Turnstile. Wyłączenie 2FA nie wyłącza tej ochrony.</p>
      <p v-if="development" class="mt-3 text-xs text-amber-200">Lokalnie działa tryb testowy Cloudflare. Na serwerze produkcyjnym wymagane są właściwe klucze Turnstile.</p>
    </div>
  </section>
</template>

<style scoped>
.security-input { width: 100%; border: 1px solid #52525b; border-radius: .55rem; background: #09090b; padding: .75rem; color: #f4f4f5; }
.security-input:focus { outline: 2px solid #38bdf8; }
.security-button { border: 1px solid #38bdf8; border-radius: .55rem; background: #38bdf8; color: #09090b; padding: .65rem 1rem; font-size: .875rem; font-weight: 600; }
.security-button:disabled { opacity: .5; }
</style>
