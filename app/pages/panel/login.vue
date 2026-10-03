<script setup lang="ts">
definePageMeta({ layout: 'panel', i18n: false })
useSeoMeta({ title: 'Logowanie | Makoto', robots: 'noindex, nofollow' })
const login = ref('')
const password = ref('')
const code = ref('')
const pending = ref(false)
const message = ref('')
async function submit() {
  pending.value = true
  message.value = ''
  try {
    await $fetch('/api/admin/login', { method: 'POST', body: { login: login.value, password: password.value, code: code.value } })
    password.value = ''
    code.value = ''
    await navigateTo('/panel')
  } catch {
    message.value = 'Nie udało się zalogować. Sprawdź dane i spróbuj ponownie.'
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
      <p class="mt-2 text-sm text-zinc-400">Zaloguj się hasłem i kodem z aplikacji uwierzytelniającej.</p>
      <form class="mt-8 space-y-5" @submit.prevent="submit">
        <div><label for="admin-login" class="mb-2 block text-sm">Login</label><input id="admin-login" v-model="login" autocomplete="username" required class="w-full rounded-lg border border-zinc-600 bg-zinc-950 px-4 py-3 focus:outline-2 focus:outline-sky-300"></div>
        <div><label for="admin-password" class="mb-2 block text-sm">Hasło</label><input id="admin-password" v-model="password" type="password" autocomplete="current-password" required class="w-full rounded-lg border border-zinc-600 bg-zinc-950 px-4 py-3 focus:outline-2 focus:outline-sky-300"></div>
        <div><label for="admin-code" class="mb-2 block text-sm">Kod jednorazowy</label><input id="admin-code" v-model="code" inputmode="numeric" autocomplete="one-time-code" pattern="[0-9]{6}" maxlength="6" required class="w-full rounded-lg border border-zinc-600 bg-zinc-950 px-4 py-3 tracking-[.3em] focus:outline-2 focus:outline-sky-300"></div>
        <p v-if="message" role="alert" class="rounded-lg border border-red-500/50 bg-red-950/40 p-3 text-sm text-red-200">{{ message }}</p>
        <button type="submit" :disabled="pending" class="w-full rounded-lg bg-sky-400 px-5 py-3 font-semibold text-zinc-950 disabled:opacity-50">{{ pending ? 'Logowanie…' : 'Zaloguj' }}</button>
      </form>
    </div>
  </main>
</template>
