export default defineEventHandler(async (event) => {
	const { token } = await readBody(event)

	if (!token) {
		throw createError({ statusCode: 400, message: 'Missing token' })
	}

	const config = useRuntimeConfig()
	const result = await $fetch<{ success: boolean }>(
		'https://challenges.cloudflare.com/turnstile/v0/siteverify',
		{
			method: 'POST',
			body: new URLSearchParams({
				secret: config.turnstile.secretKey,
				response: token,
			}),
		}
	)

	if (!result.success) {
		throw createError({ statusCode: 422, message: 'Turnstile verification failed' })
	}

	return { success: true }
})
