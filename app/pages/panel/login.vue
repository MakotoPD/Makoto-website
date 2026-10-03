<script setup lang="ts">
definePageMeta({ layout: 'panel', i18n: false })
useSeoMeta({ title: 'Logowanie | Makoto', robots: 'noindex, nofollow' })
const login = ref('')
const password = ref('')
const code = ref('')
const token = ref('')
const needsTwoFactor = ref(false)
const turnstile = ref<{ reset: () => void } | null>(null)
const siteKey = useRuntimeConfig().public.adminTurnstileSiteKey
const pending = ref(false)
const message = ref('')
const widgetOptions = {
  theme: 'dark', size: 'flexible', action: 'admin-login',
  'expired-callback': () => { token.value = '' },
  'timeout-callback': () => { token.value = '' },
  'error-callback': () => {
    token.value = ''
    message.value = 'Nie udało się uruchomić Turnstile. Sprawdź połączenie lub odśwież weryfikację.'
    return true
  }
}
async function submit() {
  if (pending.value) return
  if (!token.value) { message.value = 'Poczekaj na zakończenie weryfikacji Turnstile.'; return }
  pending.value = true
  message.value = ''
  try {
    await $fetch('/api/admin/login', { method: 'POST', body: { login: login.value.trim(), password: password.value, code: code.value.replace(/\s/g, ''), token: token.value } })
    password.value = ''
    code.value = ''
    await navigateTo('/panel')
  } catch (cause: any) {
    const reason = cause?.data?.data?.code
    if (reason === 'TOTP_REQUIRED' || reason === 'TOTP_INVALID') needsTwoFactor.value = true
    message.value = cause?.data?.message || (cause?.statusCode === 401 ? 'Nieprawidłowy login lub hasło.' : 'Nie udało się połączyć z panelem. Spróbuj ponownie.')
    code.value = ''
    token.value = ''
    turnstile.value?.reset()
  } finally {
    pending.value = false
  }
}
</script>

<template>
  <main class="grid min-h-dvh place-items-center px-5 py-16">
    <div class="w-full max-w-md rounded-2xl border border-zinc-700 bg-zinc-900 p-8 shadow-2xl">
      <NuxtLink to="/" class="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-sky-300"><img src="/logo.png" alt="" width="28" height="28"> Makoto</NuxtLink>
      <h1 class="mt-8 font-serif text-4xl">Panel treści</h1>
      <p class="mt-2 text-sm text-zinc-400">{{ needsTwoFactor ? 'Potwierdź logowanie kodem z aplikacji uwierzytelniającej.' : 'Zaloguj się do zarządzania stroną.' }}</p>
      <form class="mt-8 space-y-5" @submit.prevent="submit">
        <div><label for="admin-login" class="mb-2 block text-sm">Login</label><input id="admin-login" v-model="login" autocomplete="username" required class="w-full rounded-lg border border-zinc-600 bg-zinc-950 px-4 py-3 focus:outline-2 focus:outline-sky-300"></div>
        <div><label for="admin-password" class="mb-2 block text-sm">Hasło</label><input id="admin-password" v-model="password" type="password" autocomplete="current-password" required class="w-full rounded-lg border border-zinc-600 bg-zinc-950 px-4 py-3 focus:outline-2 focus:outline-sky-300"></div>
        <div v-if="needsTwoFactor"><label for="admin-code" class="mb-2 block text-sm">Kod jednorazowy</label><input id="admin-code" v-model="code" inputmode="numeric" autocomplete="one-time-code" pattern="[0-9 ]{6,7}" maxlength="7" required class="w-full rounded-lg border border-zinc-600 bg-zinc-950 px-4 py-3 tracking-[.3em] focus:outline-2 focus:outline-sky-300"></div>
        <div v-if="siteKey" class="min-h-16">
          <ClientOnly><NuxtTurnstile ref="turnstile" v-model="token" :site-key="siteKey" :options="widgetOptions" /><template #fallback><p class="text-sm text-zinc-400">Ładowanie weryfikacji…</p></template></ClientOnly>
          <button v-if="!token" type="button" class="mt-2 text-sm text-sky-300 underline underline-offset-4" @click="turnstile?.reset()">Odśwież weryfikację</button>
        </div>
        <p v-else role="alert" class="text-sm text-red-200">Brakuje konfiguracji Turnstile. Skontaktuj się z administratorem serwera.</p>
        <p v-if="message" role="alert" class="rounded-lg border border-red-500/50 bg-red-950/40 p-3 text-sm text-red-200">{{ message }}</p>
        <button type="submit" :disabled="pending || !token" class="w-full rounded-lg bg-sky-400 px-5 py-3 font-semibold text-zinc-950 disabled:opacity-50">{{ pending ? 'Logowanie…' : 'Zaloguj' }}</button>
      </form>
    </div>
  </main>
</template>
