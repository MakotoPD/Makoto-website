<template>
	<div class="p-4">
		 <UTabs :items="items" variant="pill" :ui="{ trigger: 'grow' }" class="gap-4 w-full">
			<template #quick="{ item }">

				<div class="flex flex-col md:flex-row justify-between gap-4 mt-3 mb-8">
					<NuxtLink to="mailto:contact@makoto.com.pl?subject=Let's catch up for a opportunity!" target="_blank" class="w-full group">
						<div class="border border-zinc-400 dark:border-zinc-800 rounded-xl overflow-hidden group-hover:border-zinc-600 duration-300">
							<div class="text-black dark:text-white flex gap-4 group-hover:gap-5 items-center py-3 px-2 border-b border-zinc-400 dark:border-zinc-800 bg-gradient-to-r from-0% to-65% from-sky-500/20 to-transparent group-hover:border-zinc-600 group-hover:to-70% duration-300">
								<UIcon name="i-solar-mailbox-line-duotone" class="size-8" />
								<p>Email</p>
							</div>
							<div class="py-4 px-3 group-hover:bg-zinc-300/50 group-hover:dark:bg-zinc-900/50 duration-300">
								<p class="text-black dark:text-white">contact@makoto.com.pl</p>
								<p class="mt-2 text-zinc-600 dark:text-zinc-400">Send me a email</p>
							</div>
						</div>
					</NuxtLink>

					<div class="w-full group">
						<div class="border border-zinc-400 dark:border-zinc-800 rounded-xl overflow-hidden group-hover:border-zinc-600 duration-300">
							<div class="text-black dark:text-white flex gap-4 group-hover:gap-5 items-center py-3 px-2 border-b border-zinc-400 dark:border-zinc-800 bg-gradient-to-r from-0% to-65% from-purple-500/20 to-transparent group-hover:border-zinc-600 group-hover:to-70% duration-300">
								<UIcon name="i-simple-icons-discord" class="size-8" />
								<p>Discord</p>
							</div>
							<div class="py-4 px-3 group-hover:bg-zinc-300/50 group-hover:dark:bg-zinc-900/50 duration-300">
								<p class="text-black dark:text-white">@MakotoPD</p>
								<p class="mt-2 text-zinc-600 dark:text-zinc-400">Text to me on Discord</p>
							</div>
						</div>
					</div>
					<NuxtLink to="https://instagram.com/MakotoPD" target="_blank" class="w-full group">
						<div class="border border-zinc-400 dark:border-zinc-800 rounded-xl overflow-hidden group-hover:border-zinc-600 duration-300">
							<div class="text-black dark:text-white flex gap-4 group-hover:gap-5 items-center py-3 px-2 border-b border-zinc-400 dark:border-zinc-800 bg-gradient-to-r from-0% to-65% from-rose-500/20 to-transparent group-hover:border-zinc-600 group-hover:to-70% duration-300">
								<UIcon name="i-simple-icons-instagram" class="size-8" />
								<p>Instagram</p>
							</div>
							<div class="py-4 px-3 group-hover:bg-zinc-300/50 group-hover:dark:bg-zinc-900/50 duration-300">
								<p class="text-black dark:text-white">@MakotoPD</p>
								<p class="mt-2 text-zinc-600 dark:text-zinc-400">Text to me on Instagram</p>
							</div>
						</div>
					</NuxtLink>
				</div>

			</template>

			<template #form="{ item }">

			<UForm :schema="schema" :state="state" @submit="onSubmit" class="flex flex-col gap-4" >
				<input type="hidden" name="access_key" v-model="state.access_key">
				<input type="hidden" name="subject" v-model="state.subject">
				<UFormField :label="t('contactform.labelName')" name="name" required>
					<UInput v-model="state.name" type="text" :placeholder="t('contactform.name')" required class="w-full" />
				</UFormField>
				<UFormField :label="t('contactform.labelEmail')" name="email" required>
					<UInput v-model="state.email" type="email" :placeholder="t('contactform.email')" required class="w-full" />
				</UFormField>
				<UFormField :label="t('contactform.labelMessage')" name="message" required>
					<UTextarea v-model="state.message" :placeholder="t('contactform.message')" required autoresize class="w-full" />
				</UFormField>
				<NuxtTurnstile v-model="state.token" />
				<UButton label="Send" trailing-icon="i-solar-map-arrow-right-outline" type="submit" variant="subtle" class="self-end text-black dark:text-white" />
			</UForm>
			</template>
		</UTabs>
	</div>
</template>
<script setup lang="ts">
import type { TabsItem } from '@nuxt/ui'
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

const { t } = useI18n()

const schema = z.object({
  email: z.email('Invalid email'),
  name: z.string('Your name is required'),
  message: z.string('Message is required').min(12, ('Message must be at least 12 characters')),
  token: z.string('Token is required').min(12, ('Check you are not a robot.')),
  subject: z.string('Subject is required'),
  access_key: z.string('accesskey is required. Contact with admin! contact@makoto.com.pl')
})

type Schema = z.output<typeof schema>


const state = reactive<Partial<Schema>>({
  name: '',
  email: '',
  message: '',
  token: '',
  subject: 'Nowa wiadomość z strony internetowej',
  access_key: '5570e19a-cefa-433f-8b62-26c58fa27628'
})

const toast = useToast()

let onSubmit = async (event: FormSubmitEvent<Schema>) => {
	try {
		const json = JSON.stringify(state)
		const { data, error } = await useFetch('https://api.web3forms.com/submit', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Accept': 'application/json'
			},
			body: json
		})

		if (error.value) {
		// obsługa błędu
			toast.add({ title: 'Error', description: "Can't send message. Try again", color: 'error' })
		} else {
		// obsługa odpowiedzi serwera
			toast.add({ title: 'Success', description: 'The form has been submitted.', color: 'success' })
				
			state.email = ''
			state.message = ''
			state.name = ''
		}

  	}catch (err) {
		toast.add({ title: 'Error', description: 'Error when try to submit form. Contact with admin', color: 'error' })
		console.error(err)
  	}

}





const items = [
  {
    label: 'Quick connect',
    description: '',
    icon: 'i-solar-link-bold-duotone',
    slot: 'quick' as const
  },
  {
    label: 'Contact form',
    description: '',
    icon: 'i-solar-map-arrow-right-bold-duotone',
    slot: 'form' as const
  }
] satisfies TabsItem[]
</script>