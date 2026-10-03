<script setup lang="ts">
import { z } from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

const { locale } = useI18n()
const schema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.email(),
  message: z.string().trim().min(12).max(5000),
  token: z.string().min(10)
})
type FormData = z.infer<typeof schema>
const state = reactive({ name: '', email: '', message: '', token: '', website: '' })
const sending = ref(false)
const status = ref<'idle' | 'success' | 'error'>('idle')
const errorMessage = ref('')

async function submit(event: FormSubmitEvent<FormData>) {
  sending.value = true
  status.value = 'idle'
  try {
    await $fetch('/api/contact', { method: 'POST', body: { ...event.data, website: state.website } })
    status.value = 'success'
    state.name = ''
    state.email = ''
    state.message = ''
    state.token = ''
  } catch {
    status.value = 'error'
    errorMessage.value = locale.value === 'pl' ? 'Nie udało się wysłać wiadomości. Spróbuj ponownie lub napisz e-mail.' : 'The message could not be sent. Please try again or email me.'
  } finally {
    sending.value = false
  }
}
</script>

<template>
  <div class="rounded-2xl border border-zinc-700 bg-zinc-900/80 p-6 text-zinc-100 md:p-8">
    <h3 class="font-serif text-2xl">{{ locale === 'pl' ? 'Wyślij zapytanie' : 'Send an enquiry' }}</h3>
    <p class="mt-2 text-sm text-zinc-400">{{ locale === 'pl' ? 'Opisz projekt, a skontaktuję się z Tobą, aby ustalić szczegóły.' : 'Describe your project and I will follow up to discuss the details.' }}</p>
    <UForm :schema="schema" :state="state" class="mt-7 space-y-5" @submit="submit">
      <div class="absolute -left-[10000px]" aria-hidden="true">
        <label for="contact-website">Website</label>
        <input id="contact-website" v-model="state.website" type="text" tabindex="-1" autocomplete="off">
      </div>
      <UFormField name="name" :label="locale === 'pl' ? 'Imię i nazwisko' : 'Name'" required>
        <UInput v-model="state.name" autocomplete="name" class="w-full" />
      </UFormField>
      <UFormField name="email" :label="locale === 'pl' ? 'Adres e-mail' : 'Email address'" required>
        <UInput v-model="state.email" type="email" autocomplete="email" class="w-full" />
      </UFormField>
      <UFormField name="message" :label="locale === 'pl' ? 'Wiadomość' : 'Message'" required>
        <UTextarea v-model="state.message" :rows="5" class="w-full" />
      </UFormField>
      <UFormField name="token" :label="locale === 'pl' ? 'Weryfikacja' : 'Verification'" required>
        <NuxtTurnstile v-model="state.token" />
      </UFormField>
      <button type="submit" :disabled="sending" class="w-full rounded-xl bg-sky-400 px-5 py-3 font-semibold text-zinc-950 transition hover:bg-sky-300 disabled:cursor-wait disabled:opacity-60">
        {{ sending ? (locale === 'pl' ? 'Wysyłanie…' : 'Sending…') : (locale === 'pl' ? 'Wyślij wiadomość' : 'Send message') }}
      </button>
    </UForm>
    <p v-if="status === 'success'" role="status" class="mt-5 rounded-lg border border-emerald-400/40 bg-emerald-950/40 p-3 text-emerald-200">{{ locale === 'pl' ? 'Wiadomość została wysłana. Dziękuję!' : 'Your message has been sent. Thank you!' }}</p>
    <p v-if="status === 'error'" role="alert" class="mt-5 rounded-lg border border-red-400/40 bg-red-950/40 p-3 text-red-200">{{ errorMessage }}</p>
    <p class="mt-6 text-sm text-zinc-400">{{ locale === 'pl' ? 'Możesz też napisać bezpośrednio:' : 'You can also email me directly:' }} <a href="mailto:contact@makoto.com.pl" class="text-sky-300 underline">contact@makoto.com.pl</a></p>
  </div>
</template>
